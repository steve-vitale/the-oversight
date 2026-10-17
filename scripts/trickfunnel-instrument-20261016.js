#!/usr/bin/env node
// trickfunnel-instrument-20261016.js — the sim-trickfunnel execution-funnel
// instrument (flesh-out loop, axis scale-onramp, run fleshout-20261016T2315Z).
// MEASUREMENT ONLY: read-only attach to the engine (wrappers call through and
// record; none touches RNG, logic, or save state). Shared by the sweep
// (scripts/sweep-trickfunnel-20261016.js) and the proof test
// (scripts/test-trickfunnel-20261016.js). No top-level side effects — safe to
// require from any process. No game dependency (pure + wrappers).
//
// The funnel (per perform-kind), measured on completed TB fights vs
// trick-bearing species (mdef.counter exists — waves 1-2 only by canon;
// waves 3-5 are deliberately counter-less per docs/MONSTER-WAVES.md):
//   contact -> known_at_start -> condition_met -> performed ->
//   kill_attributed -> survived/dismissed
//
// FIGHT-START INTERCEPTION: TB fights are initiated through FIVE code paths
// that assign `this.tbfight` directly (Game.startCombat's own construction,
// encounters.js:2707, justice.js:666 (uprising), party.js:668 (betrayal),
// game.js:8499 (mid-fight save/load rebuild)) — wrapping startCombat alone
// misses the bypass paths (measured: 1/149 fights in the pilot). The
// instrument instead intercepts the `tbfight` PROPERTY itself
// (Object.defineProperty getter/setter, fully transparent: the setter stores
// the value and snapshots, the getter returns it). Every fight-initiation
// path is covered uniformly, and startCombat's refusal path ("Already in a
// fight") correctly records nothing since it never assigns. restore()
// reinstalls the original descriptor.
// Stage observability (all engine-honest):
//   contact:         tbEnd with >=1 trick-bearing monster fighter (per
//                    species row).
//   known_at_start:  Game.villageKnowsTrick(mid) snapshot at the tbfight
//                    assignment (before any player action; pure reads only).
//   condition_met:   a checkMonsterCounter call whose behavior matched the
//                    kind's condition — hit ⇔ the engine pushes to
//                    f.trickLogByMid[mid]. Detected as before/after length
//                    growth around the WRAPPED call (the push is the engine's
//                    own hit record; the wrapper never reimplements the
//                    condition — it only observes the push).
//   performed:       f.trickLogByMid[mid] non-empty at fight end (the
//                    engine's per-fight performance record, feeds
//                    trickSummary/trickSummaryFor kill attribution).
//   kill_attributed: waveKillLog entry, same mid, ±1d of fight end, with a
//                    non-empty trick string (the trickSummary/tricktag
//                    channel).
//   survived/dismissed: p.alive at fight end (survived); result fled/routed
//                    (dismissed). Both recorded.
// A row is UNATTRIBUTED if any observed stage is null (the instrument failed
// to see it) — the diagnostic PRIMARY demands zero such rows.
'use strict';

const BEAT_CAP = 3000;
const BEAT_LEN = 300;
const TRICK_BEAT = /COUNTER LEARNED|starves|starved out|bored out|Bored out|LEAVE|leaves|DISMISSED|dismisses|kindly|goodbye properly|looks away|dead air|contradicts the|confesses first|argues theology|fighting boring|deliberately boring|Navigation is victory|walk out|VOMITS|poisoned meal|fine print|loophole|Tanking the|goes quiet|falls PRONE|bad note|SMALLER|Scabbing|stands down/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// trickMids(f): trick-bearing monster species present in a TB fight.
function trickMids(Game, f) {
  const out = [];
  try {
    const defs = {};
    for (const m of (Game.data.monsters || [])) defs[m.id] = m;
    for (const x of (f && f.fighters) || []) {
      if (!x || x.kind !== 'monster') continue;
      const mid = (x.mdef && x.mdef.id) || x.monsterId || x.id;
      const def = defs[mid];
      if (def && def.counter && out.indexOf(mid) < 0) out.push(mid);
    }
  } catch (e) {}
  return out;
}

// kindOf(Game, mid): the counter perform-kind for a species.
function kindOf(Game, mid) {
  try {
    const def = (Game.data.monsters || []).find(m => m.id === mid);
    return (def && def.counter && def.counter.kind) || null;
  } catch (e) { return null; }
}

// classifyFunnelFight(t, waveKillLog):
//   t = one tbFights capture: { seq, day, result, mids, perfs, knownAtStart,
//       knownAtEnd, hits: {mid: [...]}, pAlive }.
//   waveKillLog = Game.state.waveKillLog (for the attribution join).
// Returns { rows: [per-species funnel rows], unattributed: n }.
function classifyFunnelFight(t, waveKillLog) {
  const rows = [];
  let unattributed = 0;
  const wkl = waveKillLog || [];
  const mids = Array.from(new Set([].concat(
    Object.keys((t && t.mids) || {}).length ? t.mids : [],
    Object.keys((t && t.perfs) || {}),
    Object.keys((t && t.hits) || {})
  )));
  for (const mid of mids) {
    const row = { mid: mid, kind: t.kindByMid ? t.kindByMid[mid] || null : null };
    if (!row.kind) row.kind = null; // caller fills via kindOf
    const kas = t.knownAtStart || {};
    const kae = t.knownAtEnd || {};
    const perfs = (t.perfs || {})[mid] || [];
    const hits = (t.hits || {})[mid] || [];
    row.contact = 1;
    row.known_at_start = (mid in kas) ? (kas[mid] ? 1 : 0) : null;
    row.known_at_end = (mid in kae) ? (kae[mid] ? 1 : 0) : null;
    row.discovered_in_fight = (row.known_at_start === 0 && row.known_at_end === 1) ? 1 : 0;
    row.condition_met = hits.length > 0 ? 1 : 0;
    row.n_hits = hits.length;
    row.performed = perfs.length > 0 ? 1 : 0;
    row.n_perfs = perfs.length;
    // Attribution join: same mid, ±1d, non-empty trick string.
    let attr = 0, attrBy = null, attrVia = null;
    for (const k of wkl) {
      if (k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1 && k.trick) {
        attr = 1; attrBy = k.by || null; attrVia = k.via || null; break;
      }
    }
    row.kill_attributed = attr;
    row.attr_by = attrBy; row.attr_via = attrVia;
    row.survived = (t.pAlive === true) ? 1 : (t.pAlive === false ? 0 : null);
    row.result = t.result || null;
    row.dismissed = (t.result === 'fled' || t.result === 'routed') ? 1 : 0;
    row.unattributed = (row.known_at_start === null || row.survived === null) ? 1 : 0;
    unattributed += row.unattributed;
    rows.push(row);
  }
  return { rows: rows, unattributed: unattributed };
}

// attachTrickfunnelCapture(Game): read-only attach. Method wrappers call
// through and record; the tbfight property is intercepted transparently.
// Defensive: every engine read is guarded; restore() is exact.
function attachTrickfunnelCapture(Game) {
  let fightSeq = 0;
  const tbFights = [];
  const discoveries = [];
  const deaths = [];
  const sayBeats = [];
  const checkCalls = [];
  // fightSeq -> index in tbFights for linking checkMonsterCounter hits.
  const seqIndex = {};

  function onFightStart(f) {
    fightSeq++;
    const mids = trickMids(Game, f);
    const knownAtStart = {};
    const kindByMid = {};
    for (const mid of mids) {
      try { knownAtStart[mid] = !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { knownAtStart[mid] = null; }
      kindByMid[mid] = kindOf(Game, mid);
    }
    seqIndex[fightSeq] = tbFights.length;
    tbFights.push({
      seq: fightSeq, day: gday(Game), started: true, result: null,
      mids: mids, kindByMid: kindByMid, knownAtStart: knownAtStart,
      perfs: {}, hits: {}, knownAtEnd: {}, pAlive: null,
    });
  }

  // --- tbfight property interception (covers all 5 initiation paths) ---
  const origDesc = Object.getOwnPropertyDescriptor(Game, 'tbfight');
  let tbVal = Game.tbfight; // null post-setupGame; preserved verbatim
  let attached = false;
  try {
    Object.defineProperty(Game, 'tbfight', {
      configurable: true,
      enumerable: origDesc ? !!origDesc.enumerable : true,
      get: function () { return tbVal; },
      set: function (v) {
        tbVal = v;
        try {
          if (v && typeof v === 'object' && Array.isArray(v.fighters)) onFightStart(v);
        } catch (e) {}
      },
    });
    attached = true;
  } catch (e) { attached = false; }

  const _cmc = Game.checkMonsterCounter.bind(Game);
  Game.checkMonsterCounter = function (mid, ev) {
    let before = 0;
    try {
      const f = Game.tbfight;
      before = (((f && f.trickLogByMid) || {})[mid] || []).length;
    } catch (e) {}
    const ret = _cmc(mid, ev);
    try {
      const f = Game.tbfight;
      const after = (((f && f.trickLogByMid) || {})[mid] || []).length;
      const hit = after > before;
      checkCalls.push({
        day: gday(Game), fightSeq: fightSeq, mid: mid,
        kind: kindOf(Game, mid),
        evType: ev && ev.type, via: ev && ev.via,
        windup: !!(ev && ev.windup), closer: !!(ev && ev.closer),
        firstStrike: !!(ev && ev.firstStrike), freshWeapon: !!(ev && ev.freshWeapon),
        movedTiles: (ev && ev.movedTiles) | 0, dirVaries: !!(ev && ev.dirVaries),
        dist: (ev && ev.dist) | 0,
        hit: hit, ret: ret === true, discovered: ret === true,
      });
      // Link hits to the live fight capture (condition_met stage).
      const idx = seqIndex[fightSeq];
      if (hit && idx != null && tbFights[idx]) {
        const h = tbFights[idx].hits;
        (h[mid] || (h[mid] = [])).push({ evType: ev && ev.type, via: ev && ev.via, day: gday(Game) });
      }
    } catch (e) {}
    return ret;
  };

  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const idx = seqIndex[fightSeq];
        const mids = trickMids(Game, f);
        const perfs = {};
        for (const k of Object.keys((f && f.trickLogByMid) || {})) perfs[k] = (f.trickLogByMid[k] || []).slice();
        const knownAtEnd = {};
        for (const mid of mids) {
          try { knownAtEnd[mid] = !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { knownAtEnd[mid] = null; }
        }
        let pAlive = null;
        try { const p = Game.tbFighter ? Game.tbFighter('p') : null; pAlive = p ? !!p.alive : null; } catch (e) {}
        if (idx != null && tbFights[idx]) {
          const cap = tbFights[idx];
          cap.result = result;
          // Union mids: species seen at start or via perfs/hits.
          const all = new Set(cap.mids.concat(mids, Object.keys(perfs), Object.keys(cap.hits)));
          cap.mids = Array.from(all);
          for (const mid of cap.mids) {
            if (!(mid in cap.knownAtStart)) {
              try { cap.knownAtStart[mid] = !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { cap.knownAtStart[mid] = null; }
            }
            if (!cap.kindByMid[mid]) cap.kindByMid[mid] = kindOf(Game, mid);
          }
          cap.perfs = perfs; cap.knownAtEnd = knownAtEnd; cap.pAlive = pAlive;
        } else {
          // Defensive: tbEnd with no captured start (e.g. fight live before
          // attach). Recorded so the fight is not lost; known_at_start will
          // be null and the row counts as unattributed (loud, by design).
          fightSeq++;
          const kbm = {};
          for (const mid of mids) kbm[mid] = kindOf(Game, mid);
          tbFights.push({
            seq: fightSeq, day: gday(Game), started: false, result: result,
            mids: mids, kindByMid: kbm, knownAtStart: {},
            perfs: perfs, hits: {}, knownAtEnd: knownAtEnd, pAlive: pAlive,
          });
        }
      }
    } catch (e) {}
    return _tbEnd(result);
  };

  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_discovered') discoveries.push({ seq: fightSeq, day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };

  function restore() {
    Game.checkMonsterCounter = _cmc;
    Game.tbEnd = _tbEnd;
    Game.tele = _t;
    Game.say = _s;
    if (attached) {
      try {
        if (origDesc) Object.defineProperty(Game, 'tbfight', origDesc);
        else { delete Game.tbfight; Game.tbfight = tbVal; }
      } catch (e) {}
    }
  }

  return {
    tbFights: tbFights, checkCalls: checkCalls,
    discoveries: discoveries, deaths: deaths, sayBeats: sayBeats,
    tbfightIntercepted: attached,
    restore: restore,
  };
}

module.exports = { attachTrickfunnelCapture, classifyFunnelFight, trickMids, kindOf, TRICK_BEAT };
