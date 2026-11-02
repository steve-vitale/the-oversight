#!/usr/bin/env node
// fightoutcome-recorder.js — standing fight-outcome recorder for the
// herald chain (sim-fightoutcome-recorder, Loop A 20261102, axis
// scale-onramp). The laircontact arm proved the lair driver records NO
// fight outcomes, so no FOUGHT seed could be claimed as a slay; the
// heralddepart arm recorded titan outcomes per day inside its own
// driver. This module is the standing version: future arms require it
// instead of re-instrumenting.
//
// Adapts the tbOutcomes pattern from scripts/killdisc-instrument-
// 20261021.js (fightId -> result at tbEnd, plus 'dissolved' handling
// via tbBarrierExit) and scripts/herald-instrument-20261030.js
// (startCombat census, FOUGHT/REFUSED classification, titan muster
// proxy by pure state reads). Nothing here is reinvented: the join
// key, the dissolved rule, and the refusal reasons are those two
// instruments' semantics, extended in three ways:
//   1. Fight SEQUENCE numbers (fightSeq) replace raw tbfight.id as
//      the persisted join key. tbfight.id contains Date.now(), so
//      persisting it breaks r1==r2 byte equality; the seq is
//      assigned in start order, which the game itself determines,
//      so re-runs stay byte-comparable.
//   2. Every outcome row carries a fighter snapshot at fight end
//      (who fought, who died, monster hp/alive, bearer hp) plus the
//      say transcript of the fight (full for titan fights, capped
//      head/tail otherwise), so a row can be audited against the
//      transcript by sense, not just by count.
//   3. Field fights, wave kills, and the game-side
//      state.titans.outcomes records are captured in the same
//      install, so one per-seed JSON joins TB fights, field
//      fights, kills, and titan outcomes without a second pass.
//
// Wrappers are call-through, read-only, zero RNG draws, zero game-
// state writes. The muster proxy reads muster state only and NEVER
// calls titanMusterReady (that helper can create state.titans when
// absent — the herald instrument's warning, preserved here).
//
// Contract: install(Game, t) where t = { attempts, tbFights,
// tbOutcomes, fieldFights, kills, titanOutcomesAppended,
// transcripts, instrumentErrors }. Returns uninstall.
// Outcome rows (t.tbFights): { fightSeq, day, endDay, mid, titan,
// engineResult, normalized, fighters, monster, bearer, titanOutcome,
// sayLines, sayDropped }. engineResult is the raw tbEnd argument
// ('won'|'lost'|'fled'|'routed'|'calmed'|'betrayal_*') or
// 'dissolved' (tbfight.result set without tbEnd) or 'unresolved'
// (a started fight with no end captured — a recorder failure,
// surfaced by the analyzer, never silently dropped).
// normalized: 'slain' | 'fled' | 'dissolved' | 'party-death' |
// 'other' (raw string carried alongside, so normalization never
// hides what the engine said).
'use strict';

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function mdefOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    return defs.find(function (m) { return m && m.id === mid; }) || null;
  } catch (e) { return null; }
}

function isTitanMid(Game, mid) {
  try {
    const raw = (Game.data && Game.data.titans) || {};
    return !!(mid && raw[mid] && mid.charAt(0) !== '_');
  } catch (e) { return false; }
}

// Pure state reads only: muster record as stored, unique blades
// counted from the record itself. Labelled proxy in every row.
function musterProxy(Game, tid) {
  const out = { present: false, alliesRaw: 0, alliesUnique: 0, havenRaw: 0, havenUnique: 0, need: null, readyProxy: null };
  try {
    const st = ((Game.state || {}).titans) || {};
    const m = (st.musters || {})[tid];
    if (!m) return out;
    out.present = true;
    const allies = m.allies || [];
    out.alliesRaw = allies.length;
    const seenA = {};
    allies.forEach(function (a) { if (a) seenA[(a.villageId || '?') + ':' + (a.vid || a.id || '?')] = 1; });
    out.alliesUnique = Object.keys(seenA).length;
    const haven = m.haven || [];
    out.havenRaw = haven.length;
    const seenH = {};
    haven.forEach(function (h) { const vid = (typeof h === 'string') ? h : (h && h.vid); if (vid) seenH[vid] = 1; });
    out.havenUnique = Object.keys(seenH).length;
    try { const raw = (Game.data && Game.data.titans) || {}; out.need = (raw[tid] && raw[tid].minAllies) || null; } catch (e) {}
    if (out.need != null) out.readyProxy = (out.alliesUnique + out.havenUnique) >= out.need;
  } catch (e) {}
  return out;
}

function outcomesLen(Game) {
  try { return (((Game.state || {}).titans || {}).outcomes || []).length; } catch (e) { return 0; }
}

function outcomesSlice(Game, from) {
  try { return (((Game.state || {}).titans || {}).outcomes || []).slice(from); } catch (e) { return []; }
}

function stackTop() {
  try {
    const st = (new Error('fightoutcome-stack').stack || '').split('\n').slice(1, 9);
    return st.map(function (line) {
      const m = /at ([^\s(]+)/.exec(line);
      const fn = m ? m[1] : line.trim();
      const file = line.split('/').pop() || '';
      return fn + '@' + file.replace(/\)$/, '');
    });
  } catch (e) { return []; }
}

function classifyCaller(stackTopArr) {
  try {
    const joined = (stackTopArr || []).join(' ');
    if (/deedHunt|capHunt/.test(joined)) return 'policy-hunt';
    if (/contest/i.test(joined)) return 'contest';
    if (/faceFeastDraw|feastDraw/.test(joined)) return 'feast-draw';
    if (/monsterMove|wanderer|bumpInto|moveMonster|monsterTurn/.test(joined)) return 'wild-contact';
    if (stackTopArr && stackTopArr.length) return 'other-game';
    return 'unknown';
  } catch (e) { return 'unknown'; }
}

function classifyFieldFight(rec) {
  try {
    if (!rec || typeof rec !== 'object') return 'unresolved';
    const o = rec.outcome;
    if (o === 'evade' || o === 'vKill' || o === 'mFlee' || o === 'vFlee' || o === 'vDie' || o === 'alreadyDead') return o;
    return 'unresolved';
  } catch (e) { return 'unresolved'; }
}

function snapFighter(p) {
  if (!p || typeof p !== 'object') return null;
  const hp = (p.hp == null ? null : p.hp);
  return {
    key: (p.key == null ? null : p.key),
    kind: (p.kind == null ? null : p.kind),
    villagerId: (p.villagerId == null ? null : p.villagerId),
    villageId: (p.villageId == null ? null : p.villageId),
    id: (p.id == null ? null : p.id),
    mid: (p.mid == null ? null : p.mid),
    name: (p.name == null ? null : p.name),
    hp: hp, maxHp: (p.maxHp == null ? null : p.maxHp),
    alive: (p.alive != null ? !!p.alive : (hp == null ? null : hp > 0)),
  };
}

function snapFighters(Game) {
  try {
    const f = Game.tbfight || null;
    if (!f) return { fighters: [], monster: null, bearer: null };
    const fighters = (f.fighters || []).map(snapFighter).filter(Boolean);
    const monster = fighters.filter(function (x) { return x.kind === 'monster'; })[0] || null;
    let bearer = null;
    try { const bp = Game.tbFighter ? Game.tbFighter('p') : null; bearer = bp ? snapFighter(bp) : null; } catch (e) {}
    return { fighters: fighters, monster: monster, bearer: bearer };
  } catch (e) { return { fighters: [], monster: null, bearer: null }; }
}

// Normalization is presentation only: the raw engine string is
// always carried alongside, and GO is judged on the raw capture.
//   slain: titan outcome resolves 'slain'; or TB 'won' with the
//     monster fighter dead; or fieldFight 'vKill'.
//   fled: titan outcome resolves 'fled'; or TB 'fled'/'routed';
//     or fieldFight 'mFlee'/'vFlee'.
//   dissolved: tbfight.result 'dissolved' without tbEnd.
//   party-death: TB 'lost' with the bearer dead; or fieldFight
//     'vDie'.
//   other: everything else (raw string preserved).
function normalizeTb(engineResult, snap, titanOutcome) {
  if (titanOutcome && titanOutcome.outcome === 'slain') return 'slain';
  if (titanOutcome && titanOutcome.outcome === 'fled') return 'fled';
  if (engineResult === 'dissolved') return 'dissolved';
  if (engineResult === 'won') {
    if (snap && snap.monster && snap.monster.alive === false) return 'slain';
    return 'other';
  }
  if (engineResult === 'fled' || engineResult === 'routed') return 'fled';
  if (engineResult === 'lost') {
    if (snap && snap.bearer && snap.bearer.alive === false) return 'party-death';
    return 'other';
  }
  return 'other';
}

function normalizeField(engineOutcome) {
  if (engineOutcome === 'vKill') return 'slain';
  if (engineOutcome === 'mFlee' || engineOutcome === 'vFlee') return 'fled';
  if (engineOutcome === 'vDie') return 'party-death';
  return 'other';
}

function install(Game, t) {
  if (!t.attempts) t.attempts = [];
  if (!t.tbFights) t.tbFights = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  if (!t.fieldFights) t.fieldFights = [];
  if (!t.kills) t.kills = [];
  if (!t.titanOutcomesAppended) t.titanOutcomesAppended = [];
  if (!t.transcripts) t.transcripts = [];
  const orig = {};
  const ring = [];
  let sayCount = 0;
  let fightSeq = 0;
  const fightKeys = {}; // raw tbfight.id -> { fightSeq, day, mid, titan }
  const liveSay = {}; // fightSeq -> { head, tail, dropped }: head 150 + tail 150

  function liveFightSeq() {
    try {
      const f = Game.tbfight;
      if (!f || f.over || !f.id) return null;
      const k = fightKeys[f.id];
      return k ? k.fightSeq : null;
    } catch (e) { return null; }
  }

  function pushSay(line) {
    const seq = liveFightSeq();
    if (seq == null) return;
    const acc = liveSay[seq] || (liveSay[seq] = { head: [], tail: [], dropped: 0 });
    if (acc.head.length < 150) acc.head.push(line);
    else {
      // Head 150 kept; tail keeps the last 150; the middle is dropped
      // and counted, so a capped transcript is honest about its gap.
      acc.tail.push(line);
      if (acc.tail.length > 150) { acc.tail.shift(); acc.dropped++; }
    }
  }

  function sayLinesFor(seq) {
    const acc = liveSay[seq];
    if (!acc) return { lines: [], dropped: 0 };
    delete liveSay[seq];
    return { lines: acc.head.concat(acc.tail), dropped: acc.dropped };
  }

  if (typeof Game.say === 'function') {
    const o = Game.say;
    orig.say = o;
    Game.say = function () {
      try {
        const line = Array.prototype.map.call(arguments, function (a) { return (a === undefined || a === null) ? '' : String(a); }).join(' ');
        ring.push(line);
        sayCount += 1;
        if (ring.length > 600) ring.shift();
        pushSay(line);
      } catch (e) {}
      return o.apply(this, arguments);
    };
  } else { err(t, 'install.missing:say', new Error('not a function')); }

  if (typeof Game.startCombat === 'function') {
    const o = Game.startCombat;
    orig.startCombat = o;
    Game.startCombat = function (monsterId, options) {
      let pre = null;
      try {
        const day = gday(Game);
        let pendingBefore = false, pendingMidBefore = null;
        try { pendingBefore = !!Game.pendingEncounter; pendingMidBefore = Game.pendingMonsterId || null; } catch (e) {}
        let mid = monsterId || pendingMidBefore || null;
        let liveBefore = false, beforeId = null;
        try { liveBefore = !!(Game.tbfight && !Game.tbfight.over); beforeId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
        const def = mid ? mdefOf(Game, mid) : null;
        const titan = mid ? isTitanMid(Game, mid) : false;
        const muster = titan ? musterProxy(Game, mid) : null;
        let scholarPos = null, entityPos = null, entityHp = null;
        try {
          const s = (Game.state || {}).scholar || {};
          scholarPos = { mx: (s.mx != null ? s.mx : null), my: (s.my != null ? s.my : null), px: (Game.map ? Game.map.px : null), py: (Game.map ? Game.map.py : null) };
        } catch (e) {}
        try {
          const wm = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
          const ent = (wm || []).find(function (m) { return m && m.id === mid; });
          if (ent) { entityPos = { tx: ent.tx, ty: ent.ty, mx: ent.mx, my: ent.my }; entityHp = { hp: ent.hp, maxHp: ent.maxHp }; }
        } catch (e) {}
        pre = {
          day, mid, wave: def ? (def.wave | 0) : 0, aggression: def ? (def.aggression || null) : null,
          titan, liveBefore, beforeId, pendingBefore, pendingMidBefore, muster,
          scholarPos, entityPos, entityHp, stackTop: stackTop(),
          outcomesBefore: outcomesLen(Game), sayBefore: sayCount,
        };
        pre.caller = classifyCaller(pre.stackTop);
      } catch (e) { err(t, 'startCombat.before', e); }
      let r, thrown = null;
      try { r = o.apply(this, arguments); } catch (e) { thrown = e; }
      try {
        if (pre) {
          let afterId = null;
          try { afterId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
          let pendingAfter = false, pendingMidAfter = null;
          try { pendingAfter = !!Game.pendingEncounter; pendingMidAfter = Game.pendingMonsterId || null; } catch (e) {}
          const newOutcomes = outcomesSlice(Game, pre.outcomesBefore);
          newOutcomes.forEach(function (rec) { t.titanOutcomesAppended.push({ day: pre.day, mid: pre.mid, record: rec }); });
          const added = sayCount - pre.sayBefore;
          const sayDuring = added > 0 ? ring.slice(-Math.min(added, 20)) : [];
          const fought = !!(afterId && afterId !== pre.beforeId);
          let cls = null, reason = null;
          if (thrown) { cls = 'THROW'; reason = 'throw:' + String((thrown && thrown.message) || thrown).slice(0, 120); }
          else if (fought) { cls = 'FOUGHT'; reason = null; }
          else {
            cls = 'REFUSED';
            const refusedRec = newOutcomes.filter(function (rec) { return rec && rec.outcome === 'refused' && rec.titan === pre.mid; })[0] || null;
            const sayRefusal = sayDuring.some(function (ln) { return ln.indexOf('does not notice you') >= 0 || ln.indexOf('will not roll') >= 0 || ln.indexOf('cannot field a force') >= 0; });
            if (pre.liveBefore) reason = 'FIGHT-LIVE';
            else if (refusedRec && refusedRec.detail && refusedRec.detail.gate === 'campaign') reason = 'CAMPAIGN-GATE';
            else if (refusedRec && refusedRec.detail && refusedRec.detail.gate === 'muster') reason = 'MUSTER-GATE';
            else if (sayRefusal) reason = 'MUSTER-GATE';
            else if (pre.titan && pre.muster && pre.muster.readyProxy === false) reason = 'MUSTER-GATE';
            else reason = 'OTHER';
          }
          let seq = null;
          if (fought) {
            fightSeq += 1;
            seq = fightSeq;
            fightKeys[afterId] = { fightSeq: seq, day: pre.day, mid: pre.mid, titan: pre.titan };
            liveSay[seq] = { head: [], tail: [], dropped: 0 };
          }
          t.attempts.push({
            fightSeq: seq, day: pre.day, mid: pre.mid, wave: pre.wave, aggression: pre.aggression,
            titan: pre.titan, caller: pre.caller, stackTop: pre.stackTop,
            cls: cls, reason: reason,
            liveBefore: pre.liveBefore,
            pendingBefore: pre.pendingBefore, pendingMidBefore: pre.pendingMidBefore,
            pendingAfter: pendingAfter, pendingMidAfter: pendingMidAfter,
            muster: pre.muster, scholarPos: pre.scholarPos, entityPos: pre.entityPos, entityHp: pre.entityHp,
            sayDuring: (cls === 'REFUSED' || cls === 'THROW') ? sayDuring : [],
            gameOutcomes: newOutcomes,
          });
        }
      } catch (e) { err(t, 'startCombat.push', e); }
      if (thrown) throw thrown;
      return r;
    };
  } else { err(t, 'install.missing:startCombat', new Error('not a function')); }

  function recordTbEnd(result, fightId, snap, titanOutcome) {
    const key = (fightId && fightKeys[fightId]) || null;
    const seq = key ? key.fightSeq : null;
    const say = seq != null ? sayLinesFor(seq) : { lines: [], dropped: 0 };
    const row = {
      fightSeq: seq, day: key ? key.day : gday(Game), endDay: gday(Game),
      mid: key ? key.mid : null, titan: key ? key.titan : null,
      engineResult: (result === undefined || result === null) ? 'unknown' : String(result),
      fighters: snap.fighters, monster: snap.monster, bearer: snap.bearer,
      titanOutcome: titanOutcome || null,
      sayLines: say.lines, sayDropped: say.dropped,
    };
    row.normalized = normalizeTb(row.engineResult, snap, titanOutcome);
    t.tbFights.push(row);
    if (seq != null) t.tbOutcomes[seq] = row.engineResult;
    else t.tbOutcomes['no-fight-seq:' + row.engineResult] = (t.tbOutcomes['no-fight-seq:' + row.engineResult] || 0) + 1;
    return row;
  }

  if (typeof Game.tbEnd === 'function') {
    const o = Game.tbEnd;
    orig.tbEnd = o;
    Game.tbEnd = function (result) {
      let fightId = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      const snap = snapFighters(Game);
      const outcomesBefore = outcomesLen(Game);
      const r = o.apply(this, arguments);
      try {
        const newOutcomes = outcomesSlice(Game, outcomesBefore);
        newOutcomes.forEach(function (rec) { t.titanOutcomesAppended.push({ day: gday(Game), mid: (fightId && fightKeys[fightId]) ? fightKeys[fightId].mid : null, record: rec }); });
        // The titan outcome resolved by this tbEnd, if any: the
        // record for this titan appended during the call whose
        // outcome is 'slain' or 'fled' (the 'fought' record was
        // appended at startCombat, not here).
        let titanOutcome = null;
        if (fightId && fightKeys[fightId] && fightKeys[fightId].titan) {
          const tid = fightKeys[fightId].mid;
          const resolved = newOutcomes.filter(function (rec) { return rec && rec.titan === tid && (rec.outcome === 'slain' || rec.outcome === 'fled'); });
          if (resolved.length) titanOutcome = resolved[resolved.length - 1];
        }
        recordTbEnd(result, fightId, snap, titanOutcome);
      } catch (e) { err(t, 'tbEnd.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:tbEnd', new Error('not a function')); }

  // Fight-dissolve path (killdisc semantics): tbBarrierExit dissolves
  // an in-progress fight when the bearer changed (succession) or the
  // game ended — tbfight.result = 'dissolved' WITHOUT calling tbEnd.
  // Without this wrap, dissolved fights show up as started fights
  // with no end outcome.
  if (typeof Game.tbBarrierExit === 'function') {
    const o = Game.tbBarrierExit;
    orig.tbBarrierExit = o;
    Game.tbBarrierExit = function () {
      let f = null, bearer = null, over = false, fightId = null;
      try { f = Game.tbfight || null; fightId = f ? (f.id || null) : null; } catch (e) {}
      try { bearer = Game.villagerId; } catch (e) {}
      try { over = !!Game.over; } catch (e) {}
      const snap = f ? snapFighters(Game) : null;
      const r = o.apply(this, arguments);
      try {
        if (!fightId || !f) return r;
        if (t.tbOutcomes[(fightKeys[fightId] || {}).fightSeq]) return r; // tbEnd already recorded it
        if (Game.tbfight) return r; // fight still live — not dissolved
        let nb = null, nover = false;
        try { nb = Game.villagerId; } catch (e) {}
        try { nover = !!Game.over; } catch (e) {}
        if (nover || nb !== bearer) {
          const key = fightKeys[fightId] || null;
          const seq = key ? key.fightSeq : null;
          const say = seq != null ? sayLinesFor(seq) : { lines: [], dropped: 0 };
          const row = {
            fightSeq: seq, day: key ? key.day : gday(Game), endDay: gday(Game),
            mid: key ? key.mid : null, titan: key ? key.titan : null,
            engineResult: 'dissolved', normalized: 'dissolved',
            fighters: snap ? snap.fighters : [], monster: snap ? snap.monster : null,
            bearer: snap ? snap.bearer : null, titanOutcome: null,
            sayLines: say.lines, sayDropped: say.dropped,
          };
          t.tbFights.push(row);
          if (seq != null) t.tbOutcomes[seq] = 'dissolved';
        }
      } catch (e) { err(t, 'tbBarrierExit.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:tbBarrierExit', new Error('not a function')); }

  if (typeof Game.fieldFight === 'function') {
    const o = Game.fieldFight;
    orig.fieldFight = o;
    Game.fieldFight = function (vid, mdef) {
      let pre = null;
      try {
        const mid = (mdef && mdef.id) || null;
        pre = { vid: (vid === undefined || vid === null) ? null : String(vid), mid, wave: mid ? ((mdefOf(Game, mid) || {}).wave | 0) : 0, day: gday(Game), titan: mid ? isTitanMid(Game, mid) : false };
      } catch (e) { err(t, 'fieldFight.before', e); }
      const r = o.apply(this, arguments);
      try {
        if (pre) {
          const rec = (r && typeof r === 'object') ? r : null;
          const outcome = classifyFieldFight(rec);
          const row = {
            day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave, titan: pre.titan,
            outcome: outcome, normalized: normalizeField(outcome),
            rounds: rec && rec.rounds != null ? rec.rounds : null,
            vTaken: rec && rec.vTaken != null ? rec.vTaken : null,
            mDealt: rec && rec.mDealt != null ? rec.mDealt : null,
            vHpLeft: rec && rec.vHpLeft != null ? rec.vHpLeft : null,
            mHpLeft: rec && rec.mHpLeft != null ? rec.mHpLeft : null,
          };
          if (pre.titan && rec && Array.isArray(rec.log)) row.log = rec.log.slice();
          t.fieldFights.push(row);
        }
      } catch (e) { err(t, 'fieldFight.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:fieldFight', new Error('not a function')); }

  if (typeof Game.recordWaveKill === 'function') {
    const o = Game.recordWaveKill;
    orig.recordWaveKill = o;
    Game.recordWaveKill = function (monsterId, killerVid, via) {
      const r = o.apply(this, arguments);
      try {
        const wave = monsterId ? ((mdefOf(Game, monsterId) || {}).wave | 0) : 0;
        if (wave >= 4 || isTitanMid(Game, monsterId)) {
          t.kills.push({ day: gday(Game), mid: monsterId, wave, by: killerVid || null, via: via || 'unknown' });
        }
      } catch (e) { err(t, 'recordWaveKill.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:recordWaveKill', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { install, normalizeTb, normalizeField, classifyFieldFight, classifyCaller, musterProxy };
