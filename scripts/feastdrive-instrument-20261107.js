// feastdrive-instrument-20261107.js — the feast-chain recorder
// (arm sim-feastdrive-b, run fleshout-loop-b-20261107T1049Z). Scripts
// only, zero src/js. DIAG + measurement: replay a policy on band
// 53001–53008 and record, EVERY day, the full feast chain as live
// state — arming (surgeResonance, L3 count, prog.feastSurge),
// feasting (hostFeast calls + outcomes, grants, refusals), the
// feast draw (offered / faced / driven off), and the spend
// (feastSurgeUsed), plus the seat's food-deed state.
//
// This module REUSES the regionalstep instrument verbatim (require,
// not a copy — which itself reuses sitstep, which reuses stageally)
// and adds:
//   (1) feast-chain fields on every daily snapshot: keepsakes
//       ready, surgeResonance, L3 count, armed value, buff liveness
//       read from RAW state (day < untilDay — never feastedActive(),
//       which self-cleans and would perturb the trajectory),
//       draw liveness read from raw state, reactor online,
//       feastPlan ok/cost/have (documented no-mutation, deterministic
//       sort — safe to call), at-haven, cumulative chain counters,
//       and the per-day feast gate.
//   (2) counting wraps on Game.channelSentiment / teachSentiment /
//       hostFeast / grantFeastBuff / drawFeastScavenger /
//       faceFeastDraw / driveOffFeastDraw / _spendFeastedPower: every
//       call recorded with day + pre/post state. The wraps record
//       AFTER delegating, return the original result untouched, draw
//       no RNG, never throw into game code.
//   (3) classifyFeastGate(row): the pure per-day classifier — the
//       FIRST failing link in the feast chain (arm → feast → grant
//       → draw → fight → spend). Exported so the proof and the
//       analyzer use the same rule.
//
// A recording failure is counted in instrumentErrors and the
// original call's result is returned untouched.
// Usage: const INST = require('./feastdrive-instrument-20261107');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';
const REGIONAL = require('./regionalstep-instrument-20261107');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function progOf(Game) { try { return ((Game.state || {}).scholar || {}).prog || {}; } catch (e) { return {}; } }
function scholarOf(Game) { try { return (Game.state || {}).scholar || {}; } catch (e) { return {}; } }

// classifyFeastGate(row): first failing link in the feast chain.
// Row fields (cumulative counters + today's state):
//   spent (feastSurgeUsed), everArmed, arms, feasts, grants,
//   draws, faced, drivenOff, resonance, l3, buffLive, drawLive,
//   reactorOnline.
// Returns { gate, missing[] } with gate in:
//   'spent' | 'faced-unspent' | 'draw-driven-off' | 'draw-unfaced' |
//   'grant-no-draw' | 'grant-refused' | 'feast-ungranted' |
//   'armed-no-feast' | 'never-armed'.
// ORDER: state is checked before history — a spent deed entails the
// whole chain passed, so it classifies 'spent' whatever the counters
// read. A live draw that was faced entails the grant happened, so a
// faced draw with no spend is 'faced-unspent' even if the grant
// counter missed it. GRANTED vs CALLED (correction, 2026-11-07,
// diag-found): a grantFeastBuff CALL that returns granted:false is
// a refusal, not a grant — the old classifier counted calls and
// misread reactor-refused feasts as 'grant-no-draw'. 'grant-refused'
// fires when grants were called but none granted; 'grant-no-draw'
// fires only when a real buff was granted and drew nothing. The
// chain order in the prereg is the order things must happen; the
// classifier reads state, and later-link evidence is the strongest
// evidence the earlier links passed.
function classifyFeastGate(row) {
  row = row || {};
  if (row.spent) return { gate: 'spent', missing: [] };
  if (((row.faced | 0)) > 0 || ((row.spends | 0)) > 0) {
    return { gate: 'faced-unspent', missing: ['draw faced ' + ((row.faced | 0)) + ' time(s), feasted blow still unlanded — the fight happened inside the window and nothing spent'] };
  }
  if (((row.drivenOff | 0)) > 0 && ((row.draws | 0)) > 0) {
    return { gate: 'draw-driven-off', missing: [((row.draws | 0)) + ' draw(s) offered, ' + ((row.drivenOff | 0)) + ' driven off, 0 faced — the deed\'s fight was declined'] };
  }
  if (((row.draws | 0)) > 0) {
    return { gate: 'draw-unfaced', missing: [((row.draws | 0)) + ' draw(s) offered, 0 faced, 0 driven off — the beast circled and the buff died first'] };
  }
  if (((row.granted | 0)) > 0) {
    return { gate: 'grant-no-draw', missing: [((row.granted | 0)) + ' armed grant(s), 0 draws — the smoke drew nothing (pending already occupied, or no cast)'] };
  }
  if (((row.grants | 0)) > 0) {
    return { gate: 'grant-refused', missing: [((row.grants | 0)) + ' grant call(s), 0 granted — the feast lit but the buff was refused' + (row.reactorOnline ? ' (reactor online: the grant is refused while it hums)' : ' (unarmed at grant time, or the reactor hums)')] };
  }
  if (((row.feasts | 0)) > 0) {
    return { gate: 'feast-ungranted', missing: [((row.feasts | 0)) + ' feast(s) hosted, 0 armed grants — feasts fired unarmed' + (row.reactorOnline ? ' (reactor online: the grant is refused while it hums)' : '') + '; ever armed ' + (((row.everArmed | 0)) > 0 ? 'yes' : 'no')] };
  }
  if (((row.everArmed | 0)) > 0) {
    return { gate: 'armed-no-feast', missing: ['armed ' + ((row.arms | 0)) + ' time(s) but 0 feasts hosted — the devotion waited and the fire never lit'] };
  }
  return { gate: 'never-armed', missing: ['devotion never armed: surgeResonance ' + (row.resonance == null ? '?' : row.resonance) + '/35, L3 abilities ' + (row.l3 == null ? '?' : row.l3) + '/3' + (row.keepsakesReady === 0 ? '; no keepsake ready to channel' : '')] };
}

function install(Game) {
  const bk = REGIONAL.install(Game);
  const t = bk.t;
  t.feastEvents = { channels: [], teaches: [], feasts: [], grants: [], draws: [], faces: [], driveOffs: [], spends: [] };
  t._feastSeq = 0;
  t._firstArmDay = null;
  t._firstFeastDay = null;
  t._firstGrantDay = null;
  t._firstDrawDay = null;
  t._firstSpendDay = null;

  function push(list, item) {
    try {
      t._feastSeq += 1;
      item.seq = t._feastSeq;
      t.feastEvents[list].push(item);
    } catch (e) { t.instrumentErrors.push('feast-record: ' + String(e.message).slice(0, 80)); }
  }
  function shapeOf(result) {
    try {
      if (result == null) return 'null';
      if (typeof result === 'string') return 'str:' + result.slice(0, 80);
      if (typeof result === 'boolean') return 'bool:' + result;
      if (typeof result === 'object') {
        if (result.ok != null) return 'obj:ok=' + !!result.ok + (result.why ? ':' + String(result.why).slice(0, 60) : '');
        if (result.granted != null) return 'obj:granted=' + !!result.granted + (result.refreshed ? ':refresh' : '') + (result.why ? ':' + String(result.why).slice(0, 60) : '');
        if (result.drawn != null) return 'obj:drawn=' + !!result.drawn + (result.monsterId ? ':' + result.monsterId : '') + (result.why ? ':' + String(result.why).slice(0, 60) : '');
        return 'obj';
      }
      return typeof result;
    } catch (e) { return '?'; }
  }
  function count(list) { try { return t.feastEvents[list].length; } catch (e) { return 0; } }

  // --- (2) counting wraps: record AFTER delegating, return untouched.
  var origFns = {};
  function wrap(name, rec) {
    try {
      var orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push('feastwrap-missing-' + name); return; }
      origFns[name] = orig;
      Game[name] = function () {
        var pre = null;
        try { pre = rec.pre ? rec.pre.apply(null, arguments) : null; } catch (e) { pre = null; }
        var ret, threw = null;
        try { ret = orig.apply(this, arguments); } catch (e) { threw = e; }
        try { if (rec.post) rec.post(pre, ret, threw, arguments); } catch (e2) { t.instrumentErrors.push('feastwrap-record-' + name + ': ' + String(e2.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { t.instrumentErrors.push('feastwrap-install-' + name + ': ' + String(e.message).slice(0, 80)); }
  }

  function armState() {
    try {
      var pg = progOf(Game);
      var s = scholarOf(Game);
      var allAbs = [];
      try { allAbs = (s.abilities || []).concat(s.backgroundAbilities || []); } catch (e) {}
      var l3 = 0;
      try { l3 = allAbs.filter(function (a) { return a && ((a.level || 1) >= 3); }).length; } catch (e) {}
      var ready = null;
      try { ready = (typeof Game.channelReadyKeepsakes === 'function') ? Game.channelReadyKeepsakes().length : null; } catch (e) {}
      return { resonance: (pg.surgeResonance == null) ? 0 : (pg.surgeResonance | 0), l3: l3,
        armed: (pg.feastSurge === false || pg.feastSurge == null) ? false : pg.feastSurge,
        used: !!pg.feastSurgeUsed, taught: !!pg.sentimentTaught,
        trauma: (s.trauma || 0), keepsakesReady: ready,
        abilityCount: allAbs.length };
    } catch (e) { return { resonance: null, l3: null, armed: null, used: null, taught: null, trauma: null, keepsakesReady: null, abilityCount: null }; }
  }

  wrap('teachSentiment', {
    post: function (pre, ret, threw) {
      var st = armState();
      push('teaches', { day: dayOf(Game), taught: st.taught, threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('channelSentiment', {
    pre: function (ref) { var st = armState(); st.ref = (ref == null) ? null : String(ref); return st; },
    post: function (pre, ret, threw) {
      var st = armState();
      var armedNow = !!st.armed && !pre.armed;
      if (armedNow && t._firstArmDay == null) t._firstArmDay = dayOf(Game);
      push('channels', { day: dayOf(Game), ref: pre ? pre.ref : null,
        preResonance: pre ? pre.resonance : null, postResonance: st.resonance,
        preL3: pre ? pre.l3 : null, postL3: st.l3,
        preArmed: pre ? pre.armed : null, postArmed: st.armed,
        preTrauma: pre ? pre.trauma : null, postTrauma: st.trauma,
        armedNow: armedNow, result: shapeOf(ret),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('hostFeast', {
    pre: function () {
      var st = armState();
      var plan = null;
      try { var p = (typeof Game.feastPlan === 'function') ? Game.feastPlan() : null; if (p) plan = { ok: !!p.ok, cost: (p.cost | 0), have: (p.have | 0), why: p.why || null }; } catch (e) {}
      st.plan = plan;
      return st;
    },
    post: function (pre, ret, threw) {
      var st = armState();
      var b = scholarOf(Game).feastBuff || null;
      if (ret && ret.ok && t._firstFeastDay == null) t._firstFeastDay = dayOf(Game);
      push('feasts', { day: dayOf(Game), part: Game.dayPart,
        preArmed: pre ? pre.armed : null, postArmed: st.armed,
        plan: pre ? pre.plan : null, result: shapeOf(ret),
        buffAfter: b ? { mult: b.mult || null, untilDay: (b.untilDay == null) ? null : (b.untilDay | 0), used: !!b.used } : null,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('grantFeastBuff', {
    pre: function (feast) { var st = armState(); st.feastSurge = (feast && feast.surge != null) ? feast.surge : null; return st; },
    post: function (pre, ret, threw) {
      if (ret && ret.granted && t._firstGrantDay == null) t._firstGrantDay = dayOf(Game);
      push('grants', { day: dayOf(Game), part: Game.dayPart,
        preArmed: pre ? pre.armed : null, feastSurge: pre ? pre.feastSurge : null,
        result: shapeOf(ret),
        granted: !!(ret && ret.granted), refreshed: !!(ret && ret.refreshed),
        mult: (ret && ret.mult != null) ? ret.mult : null,
        draw: (ret && ret.draw) ? ret.draw : null,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('drawFeastScavenger', {
    post: function (pre, ret, threw) {
      if (ret && ret.drawn && t._firstDrawDay == null) t._firstDrawDay = dayOf(Game);
      push('draws', { day: dayOf(Game), result: shapeOf(ret),
        drawn: !!(ret && ret.drawn), monsterId: (ret && ret.monsterId) ? ret.monsterId : null,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('faceFeastDraw', {
    post: function (pre, ret, threw) {
      push('faces', { day: dayOf(Game), result: shapeOf(ret),
        ok: !!(ret && ret.ok), monsterId: (ret && ret.monsterId) ? ret.monsterId : null,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('driveOffFeastDraw', {
    post: function (pre, ret, threw) {
      push('driveOffs', { day: dayOf(Game), result: shapeOf(ret),
        ok: !!(ret && ret.ok), drivenOff: !!(ret && ret.drivenOff),
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });
  wrap('_spendFeastedPower', {
    pre: function (kind, bonusHp) { var st = armState(); st.kind = (kind == null) ? null : String(kind); st.bonusHp = (bonusHp == null) ? null : bonusHp; return st; },
    post: function (pre, ret, threw) {
      var st = armState();
      var marked = !!(pre && !pre.used && st.used);
      if (marked && t._firstSpendDay == null) t._firstSpendDay = dayOf(Game);
      push('spends', { day: dayOf(Game), kind: pre ? pre.kind : null,
        bonusHp: pre ? pre.bonusHp : null,
        preUsed: pre ? pre.used : null, postUsed: st.used, marked: marked,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 120) : null });
    },
  });

  // --- (1) snapshot additions: feast-chain fields on every daily row.
  var origSnapshot = bk.snapshot;
  bk.snapshot = function () {
    var snap = origSnapshot();
    try {
      var s = scholarOf(Game);
      var pg = progOf(Game);
      var day = dayOf(Game);
      var st = armState();
      snap.keepsakesReady = st.keepsakesReady;
      snap.surgeResonance = st.resonance;
      snap.l3Count = st.l3;
      snap.abilityCount = st.abilityCount;
      snap.armed = st.armed;
      snap.everArmed = (t._firstArmDay != null) || !!st.armed;
      snap.channels = count('channels');
      snap.arms = t.feastEvents.channels.filter(function (c) { return c.armedNow; }).length;
      snap.teaches = count('teaches');
      snap.feasts = count('feasts');
      snap.armedFeasts = t.feastEvents.feasts.filter(function (f) { return !!f.preArmed; }).length;
      snap.grants = count('grants');
      snap.granted = t.feastEvents.grants.filter(function (g) { return g.granted; }).length;
      snap.grantsRefused = t.feastEvents.grants.filter(function (g) { return !g.granted; }).length;
      snap.draws = count('draws');
      snap.drawn = t.feastEvents.draws.filter(function (d) { return d.drawn; }).length;
      snap.faced = count('faces');
      snap.facedOk = t.feastEvents.faces.filter(function (f) { return f.ok; }).length;
      snap.drivenOff = t.feastEvents.driveOffs.filter(function (d) { return d.drivenOff; }).length;
      snap.spends = count('spends');
      snap.markedSpends = t.feastEvents.spends.filter(function (sp) { return sp.marked; }).length;
      snap.firstArmDay = t._firstArmDay;
      snap.firstFeastDay = t._firstFeastDay;
      snap.firstGrantDay = t._firstGrantDay;
      snap.firstDrawDay = t._firstDrawDay;
      snap.firstSpendDay = t._firstSpendDay;
      // Buff liveness from RAW state (never feastedActive(): it
      // self-cleans, fires the fade line, and clears the pending draw
      // — a snapshot must not move the trajectory).
      var b = s.feastBuff || null;
      snap.buffLive = !!(b && day < (b.untilDay || 0));
      snap.buffMult = b ? (b.mult || null) : null;
      snap.buffUntilDay = b ? ((b.untilDay == null) ? null : (b.untilDay | 0)) : null;
      snap.buffUsed = b ? !!b.used : null;
      var d = s.feastDraw || null;
      snap.drawLive = !!(d && d.monsterId && Game.pendingEncounter && Game.pendingMonsterId === d.monsterId && snap.buffLive);
      snap.drawMonsterId = d ? (d.monsterId || null) : null;
      try { snap.reactorOnline = (typeof Game.fusionReactorOnline === 'function') ? !!Game.fusionReactorOnline() : null; } catch (e) { snap.reactorOnline = null; }
      try {
        var p = (typeof Game.feastPlan === 'function') ? Game.feastPlan() : null;
        snap.feastPlan = p ? { ok: !!p.ok, cost: (p.cost | 0), have: (p.have | 0), why: p.why || null, armed: !!p.armed } : null;
      } catch (e) { snap.feastPlan = null; }
      try { snap.atHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null; } catch (e) { snap.atHaven = null; }
      snap.dayPart = Game.dayPart;
      snap.spent = !!pg.feastSurgeUsed;
      try { snap.feastGate = classifyFeastGate(snap).gate; } catch (e) { snap.feastGate = null; }
    } catch (e) { t.instrumentErrors.push('snapshot-feast: ' + String(e.message).slice(0, 80)); }
    return snap;
  };

  var origFinalize = bk.finalize;
  bk.finalize = function () {
    var out = origFinalize();
    try {
      out.feastEvents = {
        channels: t.feastEvents.channels.slice(), teaches: t.feastEvents.teaches.slice(),
        feasts: t.feastEvents.feasts.slice(), grants: t.feastEvents.grants.slice(),
        draws: t.feastEvents.draws.slice(), faces: t.feastEvents.faces.slice(),
        driveOffs: t.feastEvents.driveOffs.slice(), spends: t.feastEvents.spends.slice(),
      };
      out.firstArmDay = t._firstArmDay; out.firstFeastDay = t._firstFeastDay;
      out.firstGrantDay = t._firstGrantDay; out.firstDrawDay = t._firstDrawDay;
      out.firstSpendDay = t._firstSpendDay;
      var last = null;
      try { var daily = bk.t.daily || []; if (daily.length) last = daily[daily.length - 1]; } catch (e) {}
      out.endFeastGate = last ? (last.feastGate || null) : null;
    } catch (e) { out.feastEvents = null; }
    return out;
  };

  var origUninstall = bk.uninstall;
  bk.uninstall = function () {
    try {
      Object.keys(origFns).forEach(function (name) { if (origFns[name]) Game[name] = origFns[name]; });
    } catch (e) {}
    try { origUninstall(); } catch (e) {}
  };
  return bk;
}

module.exports = { install: install, classifyFeastGate: classifyFeastGate };
