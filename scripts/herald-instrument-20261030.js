#!/usr/bin/env node
// herald-instrument-20261030.js — heraldic-refusal diagnostic instrument
// (sim-herald-b, 2026-10-31, axis scale-onramp). DIAGNOSTIC — no lever.
//
// Answers, on the killconv/w4field seed band, how much of the published
// wave-4 meeting counts is startCombat-refusal-inflated, and what refusal
// IS in code. Killconv recorded 40 startCombat calls against the Herald
// producing no fight (35 on s85106, 5 on s85112); this instrument censuses
// EVERY wave>=4 startCombat call on the same band and classifies it
// FOUGHT / REFUSED (with reason code) / THROW.
//
// Env-gated on HERALD=1. Contract: instrumentOn(), install(Game, t),
// uninstall; when unset the wrappers are never installed and the sim path
// is byte-identical to base — the proof test's det-gate pins that.
//
// Wraps (all call-through, zero game-state writes, zero RNG draws):
//   Game.startCombat — every call. Before-hook pure reads: resolved mid
//     (arg else pendingMonsterId), wave + aggression from data, live-fight
//     flag, pending flag/mid before and after, titan muster state by
//     PURE STATE READS ONLY (never calls titanMusterReady — that helper
//     can create state.titans when absent; the proxy below counts unique
//     allied blades + unique haven blades from the muster record and is
//     labelled proxy, never presented as the gate's own answer), scholar
//     tile vs world-entity tile, stack-top function names, say lines
//     emitted during the call, and the game-side titans.outcomes record
//     appended during the call (READ, never written by this file).
//     Reason codes, in order: FIGHT-LIVE (a fight was live at entry),
//     MUSTER-GATE (game outcomes record refused/gate-muster, or the
//     refusal say-line, or a titan muster-not-ready proxy at entry),
//     CAMPAIGN-GATE (outcomes record refused/gate-campaign), OTHER.
//     THROW is recorded and rethrown, never swallowed.
//   Game.tbEnd — fought-TB outcome per fight id (join key to FOUGHT).
//   Game.fieldFight — wave>=4 field meetings only (day, vid, mid, wave,
//     outcome, rounds, mDealt, vTaken, mHpLeft, vHpLeft; log[] copy for
//     herald fights only, the sense-test source).
//   Game.recordWaveKill — wave>=4 kills only.
//   Game.soundTitanCall / titanCommitOwn / titanWarCouncil — muster
//     events only (day, titan, allied/haven counts after, pure reads).
//   Game.say — narration ring buffer (last 400 lines), transcript
//     source only. Herald refusal stretches: first refusal + first
//     refusal on day>=120, each as a ring slice at that moment.
//   Game.sleep — daily census (day, unlockedWave, scaleRank) ONLY. No
//     standing/readiness reads here: killconv's sleep-wrapper reads are
//     the prime suspect for its s85112 day-49 perturbation, and this
//     arm must not inherit it.
//
// Determinism: tbfight.id contains Date.now() — used ONLY as an in-run
// join key, NEVER written to per-seed JSON (the sweep stores fight
// outcomes by day/mid, not by id). Transcript slices are narration text
// (RNG-determined, re-run identical); slice selection is by first
// occurrence, so re-runs are byte-comparable.
//
// Every catch reports into t.instrumentErrors (never thrown, never silent).
'use strict';

function instrumentOn() { return process.env.HERALD === '1'; }

function err(t, where, e) {
  try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}

function gday(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function mdefOf(Game, mid) {
  try {
    const defs = (Game.data && Game.data.monsters) || [];
    return defs.find(m => m && m.id === mid) || null;
  } catch (e) { return null; }
}

function waveOf(Game, mid) {
  const d = mdefOf(Game, mid);
  return (d && d.wave) || 0;
}

function aggressionOf(Game, mid) {
  const d = mdefOf(Game, mid);
  return (d && d.aggression) || null;
}

function isTitanMid(Game, mid) {
  try {
    const raw = (Game.data && Game.data.titans) || {};
    return !!(mid && raw[mid] && mid.charAt(0) !== '_');
  } catch (e) { return false; }
}

function titanMinAllies(Game, mid) {
  try {
    const raw = (Game.data && Game.data.titans) || {};
    return (raw[mid] && raw[mid].minAllies) || null;
  } catch (e) { return null; }
}

// Pure state reads only: muster record as stored, unique blades counted
// from the record itself. Labelled proxy in every output row.
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
    out.need = titanMinAllies(Game, tid);
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
    const st = (new Error('herald-stack').stack || '').split('\n').slice(1, 9);
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

// install(Game, t): t = {attempts, tbOutcomes, fieldFights, kills,
// musterEvents, census, transcripts, instrumentErrors}. Returns uninstall.
function install(Game, t) {
  if (!t.attempts) t.attempts = [];
  if (!t.tbOutcomes) t.tbOutcomes = {};
  if (!t.fieldFights) t.fieldFights = [];
  if (!t.kills) t.kills = [];
  if (!t.musterEvents) t.musterEvents = [];
  if (!t.census) t.census = [];
  if (!t.transcripts) t.transcripts = [];
  const orig = {};
  const ring = [];
  let sayCount = 0;
  let heraldSnapFirst = false;
  let heraldSnapLate = false;

  function snapHeraldRefusal(pre, sayDuring) {
    try {
      if (pre.mid !== 'herald') return;
      const late = pre.day >= 120;
      if (!late && heraldSnapFirst) return;
      if (late && heraldSnapLate) return;
      if (!late) heraldSnapFirst = true; else heraldSnapLate = true;
      t.transcripts.push({
        cls: late ? 'herald-refused-late' : 'herald-refused-first',
        day: pre.day, mid: pre.mid,
        muster: pre.muster, sayDuring: (sayDuring || []).slice(),
        lines: ring.slice(-150),
      });
    } catch (e) { err(t, 'snapHeraldRefusal', e); }
  }

  if (typeof Game.say === 'function') {
    const o = Game.say;
    orig.say = o;
    Game.say = function () {
      try {
        const line = Array.prototype.map.call(arguments, function (a) { return (a === undefined || a === null) ? '' : String(a); }).join(' ');
        ring.push(line);
        sayCount += 1;
        if (ring.length > 400) ring.shift();
      } catch (e) {}
      return o.apply(this, arguments);
    };
  } else { err(t, 'install.missing:say', new Error('not a function')); }

  // ---- startCombat census (the core of this arm) ----
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
        const wave = mid ? (waveOf(Game, mid) | 0) : 0;
        const aggression = mid ? aggressionOf(Game, mid) : null;
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
          day, mid, wave, aggression, titan, liveBefore, beforeId,
          pendingBefore, pendingMidBefore, muster, scholarPos, entityPos, entityHp,
          stackTop: stackTop(), outcomesBefore: outcomesLen(Game), sayBefore: sayCount,
        };
        pre.caller = classifyCaller(pre.stackTop);
      } catch (e) { err(t, 'startCombat.before', e); }
      let r, thrown = null;
      try {
        r = o.apply(this, arguments);
      } catch (e) { thrown = e; }
      try {
        if (pre) {
          let afterId = null, liveAfter = false;
          try { afterId = (Game.tbfight && Game.tbfight.id) || null; liveAfter = !!(Game.tbfight && !Game.tbfight.over); } catch (e) {}
          let pendingAfter = false, pendingMidAfter = null;
          try { pendingAfter = !!Game.pendingEncounter; pendingMidAfter = Game.pendingMonsterId || null; } catch (e) {}
          const newOutcomes = outcomesSlice(Game, pre.outcomesBefore);
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
          const row = {
            day: pre.day, mid: pre.mid, wave: pre.wave, aggression: pre.aggression,
            titan: pre.titan, caller: pre.caller, stackTop: pre.stackTop,
            cls: cls, reason: reason,
            liveBefore: pre.liveBefore,
            pendingBefore: pre.pendingBefore, pendingMidBefore: pre.pendingMidBefore,
            pendingAfter: pendingAfter, pendingMidAfter: pendingMidAfter,
            muster: pre.muster, scholarPos: pre.scholarPos, entityPos: pre.entityPos, entityHp: pre.entityHp,
            sayDuring: (cls === 'REFUSED' || cls === 'THROW') ? sayDuring : [],
            gameOutcomes: newOutcomes,
          };
          // Fight ids are in-run join keys only: never persisted (the
          // sweep transforms tbOutcomes to a day/mid/result list).
          t.attempts.push(row);
          if (cls === 'REFUSED' && pre.mid === 'herald') snapHeraldRefusal(pre, sayDuring);
          if (fought) {
            try {
              t._fightKeys = t._fightKeys || {};
              t._fightKeys[afterId] = { day: pre.day, mid: pre.mid };
            } catch (e) {}
          }
        }
      } catch (e) { err(t, 'startCombat.push', e); }
      if (thrown) throw thrown;
      return r;
    };
  } else { err(t, 'install.missing:startCombat', new Error('not a function')); }

  if (typeof Game.tbEnd === 'function') {
    const o = Game.tbEnd;
    orig.tbEnd = o;
    Game.tbEnd = function (result) {
      let fightId = null;
      try { fightId = (Game.tbfight && Game.tbfight.id) || null; } catch (e) {}
      const r = o.apply(this, arguments);
      try {
        if (fightId) {
          const key = (t._fightKeys && t._fightKeys[fightId]) || null;
          t.tbOutcomes[fightId] = { result: (result === undefined || result === null) ? 'unknown' : String(result), day: gday(Game), mid: key ? key.mid : null };
        }
      } catch (e) { err(t, 'tbEnd.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:tbEnd', new Error('not a function')); }

  if (typeof Game.fieldFight === 'function') {
    const o = Game.fieldFight;
    orig.fieldFight = o;
    Game.fieldFight = function (vid, mdef) {
      let pre = null;
      try {
        const mid = (mdef && mdef.id) || null;
        pre = { vid: (vid === undefined || vid === null) ? null : String(vid), mid, wave: mid ? (waveOf(Game, mid) | 0) : 0, day: gday(Game) };
      } catch (e) { err(t, 'fieldFight.before', e); }
      const r = o.apply(this, arguments);
      try {
        if (pre && (pre.wave | 0) >= 4) {
          const rec = (r && typeof r === 'object') ? r : null;
          const row = {
            day: pre.day, vid: pre.vid, mid: pre.mid, wave: pre.wave,
            outcome: classifyFieldFight(rec),
            rounds: rec && rec.rounds != null ? rec.rounds : null,
            vTaken: rec && rec.vTaken != null ? rec.vTaken : null,
            mDealt: rec && rec.mDealt != null ? rec.mDealt : null,
            vHpLeft: rec && rec.vHpLeft != null ? rec.vHpLeft : null,
            mHpLeft: rec && rec.mHpLeft != null ? rec.mHpLeft : null,
          };
          if (pre.mid === 'herald' && rec && Array.isArray(rec.log)) row.log = rec.log.slice();
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
        const wave = monsterId ? (waveOf(Game, monsterId) | 0) : 0;
        if (wave >= 4) t.kills.push({ day: gday(Game), mid: monsterId, wave, by: killerVid || null, via: via || 'unknown' });
      } catch (e) { err(t, 'recordWaveKill.push', e); }
      return r;
    };
  } else { err(t, 'install.missing:recordWaveKill', new Error('not a function')); }

  ['soundTitanCall', 'titanCommitOwn', 'titanWarCouncil'].forEach(function (name) {
    if (typeof Game[name] !== 'function') return;
    const o = Game[name];
    orig[name] = o;
    Game[name] = function (titanId) {
      const day = gday(Game);
      const r = o.apply(this, arguments);
      try {
        t.musterEvents.push({
          day: day, kind: name, titan: titanId || null,
          muster: musterProxy(Game, titanId),
          resultKind: (r === null || r === undefined) ? 'null' : (typeof r === 'string' ? 'string:' + r.slice(0, 40) : typeof r),
        });
      } catch (e) { err(t, name + '.push', e); }
      return r;
    };
  });

  if (typeof Game.sleep === 'function') {
    const o = Game.sleep;
    orig.sleep = o;
    Game.sleep = function () {
      try {
        const day = gday(Game);
        const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
        let rank = null;
        try { rank = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null; } catch (e) {}
        t.census.push({ day, uw, rank });
      } catch (e) { err(t, 'sleep', e); }
      return o.apply(this, arguments);
    };
  } else { err(t, 'install.missing:sleep', new Error('not a function')); }

  return function uninstall() {
    for (const k of Object.keys(orig)) { try { Game[k] = orig[k]; } catch (e) {} }
  };
}

module.exports = { instrumentOn, install, waveOf, aggressionOf, classifyCaller, classifyFieldFight, musterProxy };
