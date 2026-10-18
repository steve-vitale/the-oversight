#!/usr/bin/env node
// dismissal-instrument-20261018.js — the sim-dismissal b2 dismissal-shape
// census instrument (flesh-out loop, axis scale-onramp, arm sim-dismissal,
// run fleshout-20261018T0122Z).
//
// MEASUREMENT ONLY. Zero src/js changes, zero policy changes. Read-only
// attach to the engine (wrappers call through and record; no RNG, logic, or
// save contact). Patterns copied from the proof-green
// scripts/attrcensus-instrument-20261017.js (start interception + pre-ledger
// tbEnd snapshot) — the attrcensus file is NOT modified.
//
// What the b2 census needs beyond attrcensus:
//   - knownAtStart per mid (monsterCounterKnown at FIGHT START — the mastery
//     question for the D2 counterfactual: did the dismissal's trick fire with
//     the counter discovered?)
//   - hpByMid: per fighter {hp, maxHp} at tbEnd (the monster HP state at
//     flight — the "struck lead vs unscathed pack" shape)
//   - waveKillLog same-day entries per mid (the 0-kills-attributed check)
//
// tbFights entries: { seq, day, started, result, mids, kindByMid, waveByMid,
//   knownAtStart, perfs, mortality, hpByMid, pAlive, wklSameDay }.
// kindByMid/waveByMid via Game.data.monsters defs (never reimplemented game
// logic).
'use strict';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function defsById(Game) {
  const d = {};
  try { for (const m of (Game.data.monsters || [])) if (m && m.id) d[m.id] = m; } catch (e) {}
  return d;
}
function midOfFighter(x) {
  try { return (x.mdef && x.mdef.id) || x.monsterId || x.id || null; } catch (e) { return null; }
}
// monsterCounterKnown at a moment in time (mirror of waveLedger.js's
// convention — read-only copy for the census, never replaces it):
// state.monsterCounters[id]===true AND the def carries a `counter` field.
function counterKnownNow(Game, mid, defs) {
  try {
    const known = (Game.state && Game.state.monsterCounters && Game.state.monsterCounters[mid]) === true;
    if (!known) return false;
    const def = defs[mid];
    return !!(def && def.counter);
  } catch (e) { return false; }
}

function attachDismissalCapture(Game) {
  const defs = defsById(Game);
  let fightSeq = 0;
  const tbFights = [];
  const seqIndex = {};

  function trickMids(f) {
    const out = [];
    try {
      for (const x of (f && f.fighters) || []) {
        if (!x || x.kind !== 'monster') continue;
        const mid = midOfFighter(x);
        const def = defs[mid];
        if (def && def.counter && out.indexOf(mid) < 0) out.push(mid);
      }
    } catch (e) {}
    return out;
  }

  function onFightStart(f) {
    fightSeq++;
    const mids = trickMids(f);
    const kindByMid = {}, waveByMid = {}, knownAtStart = {};
    for (const mid of mids) {
      const def = defs[mid];
      kindByMid[mid] = (def && def.counter && def.counter.kind) || null;
      waveByMid[mid] = (def && def.wave) || 1;
      knownAtStart[mid] = counterKnownNow(Game, mid, defs) ? 1 : 0;
    }
    seqIndex[fightSeq] = tbFights.length;
    tbFights.push({
      seq: fightSeq, day: gday(Game), started: true, result: null,
      mids: mids, kindByMid: kindByMid, waveByMid: waveByMid,
      knownAtStart: knownAtStart, perfs: {}, mortality: {}, hpByMid: {},
      pAlive: null, wklSameDay: {},
    });
  }

  const origDesc = Object.getOwnPropertyDescriptor(Game, 'tbfight');
  let tbVal = Game.tbfight;
  let attached = false;
  try {
    Object.defineProperty(Game, 'tbfight', {
      configurable: true,
      enumerable: origDesc ? !!origDesc.enumerable : true,
      get: function () { return tbVal; },
      set: function (v) {
        tbVal = v;
        try { if (v && typeof v === 'object' && Array.isArray(v.fighters)) onFightStart(v); } catch (e) {}
      },
    });
    attached = true;
  } catch (e) { attached = false; }

  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const idx = seqIndex[fightSeq];
        if (idx != null && tbFights[idx]) {
          const cap = tbFights[idx];
          cap.result = result;
          cap.day = gday(Game);
          // Snapshot BEFORE _tbEnd runs the per-kill ledger.
          const perfs = {};
          for (const k of Object.keys((f && f.trickLogByMid) || {})) perfs[k] = (f.trickLogByMid[k] || []).length;
          const mortality = {}, hpByMid = {};
          for (const x of (f.fighters || [])) {
            if (!x || x.kind !== 'monster' || !x.mdef) continue;
            const mid = midOfFighter(x);
            const m = mortality[mid] || (mortality[mid] = { dead: 0, alive: 0 });
            if (x.alive) { m.alive++; } else { m.dead++; }
            (hpByMid[mid] = hpByMid[mid] || []).push({
              hp: Math.max(0, Math.round(x.hp || 0)),
              maxHp: Math.round(x.maxHp || x.hp || 1),
              fled: !!x.fled, key: x.key || null,
            });
          }
          cap.perfs = perfs;
          cap.mortality = mortality;
          cap.hpByMid = hpByMid;
          try { const p = Game.tbFighter ? Game.tbFighter('p') : null; cap.pAlive = p ? !!p.alive : null; } catch (e) {}
          const all = new Set(cap.mids.concat(Object.keys(perfs)));
          cap.mids = Array.from(all);
          for (const mid of cap.mids) {
            if (!cap.kindByMid[mid]) {
              const def = defs[mid];
              cap.kindByMid[mid] = (def && def.counter && def.counter.kind) || null;
              cap.waveByMid[mid] = (def && def.wave) || 1;
            }
            if (!(mid in cap.knownAtStart)) cap.knownAtStart[mid] = counterKnownNow(Game, mid, defs) ? 1 : 0;
          }
          // NOTE (bug caught by the proof's GREEN phase): the waveKillLog
          // entries for THIS fight are written by the engine's own tbEnd
          // AFTER this pre-ledger snapshot, so a snapshot-time join misses
          // won-fight kills (the drumbelly_tanuki s5501 case: 4 perfs, won,
          // monster dead, entry {d:40, trick:'strike_windup x4'} written
          // post-snapshot). The classifier joins over the FINAL waveKillLog
          // at analysis time (the funnel/attrcensus pattern). wklSameDay
          // stays as a schema field, always {}.
          cap.wklSameDay = {};
        } else {
          fightSeq++;
          tbFights.push({
            seq: fightSeq, day: gday(Game), started: false, result: result,
            mids: [], kindByMid: {}, waveByMid: {}, knownAtStart: {},
            perfs: {}, mortality: {}, hpByMid: {}, pAlive: null, wklSameDay: {},
          });
        }
      }
    } catch (e) {}
    return _tbEnd(result);
  };

  // say() capture for sense-testing transcripts: beats tagged with the
  // current fight seq + day, capped per fight. Read-only (call-through).
  const SAY_BEAT_LEN = 400, SAY_PER_FIGHT = 40;
  const sayBeats = [];
  const sayCount = {};
  let _s = null, sayAttached = false;
  try {
    if (typeof Game.say === 'function') {
      _s = Game.say.bind(Game);
      Game.say = function (t) {
        try {
          const c = sayCount[fightSeq] || 0;
          if (c < SAY_PER_FIGHT) {
            sayCount[fightSeq] = c + 1;
            sayBeats.push({ seq: fightSeq, day: gday(Game), text: String(t || '').slice(0, SAY_BEAT_LEN) });
          }
        } catch (e) {}
        return _s(t);
      };
      sayAttached = true;
    }
  } catch (e) { sayAttached = false; }

  function restore() {
    if (sayAttached && _s) Game.say = _s;
    Game.tbEnd = _tbEnd;
    if (attached) {
      try {
        if (origDesc) Object.defineProperty(Game, 'tbfight', origDesc);
        else { delete Game.tbfight; Game.tbfight = tbVal; }
      } catch (e) {}
    }
  }

  return { tbFights: tbFights, sayBeats: sayBeats, restore: restore, tbfightIntercepted: attached };
}

module.exports = { attachDismissalCapture: attachDismissalCapture, counterKnownNow: counterKnownNow };
