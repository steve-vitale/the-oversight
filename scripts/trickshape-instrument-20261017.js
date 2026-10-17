#!/usr/bin/env node
// trickshape-instrument-20261017.js — the sim-trickshape fight-shape
// instrument (flesh-out loop, axis scale-onramp, run fleshout-20261017-044712).
// MEASUREMENT ONLY: read-only attach to the engine (wrappers call through and
// record; none touches RNG, logic, or save state). Zero src/js changes, zero
// scripts/policies changes. New scripts/ + evidence/2026-10-17/ ONLY.
//
// Question (from sim-trickfunnel's perf->attr gap, 98 performed -> 56
// kill-attributed, -42 unexplained): do performed tricks CHANGE FIGHT SHAPE
// versus matched non-trick fights, or are they inert once performed?
//
// Captures per completed TB fight vs a trick-bearing species (mdef.counter
// exists — waves 1-2 only by canon; waves 3-5 deliberately counter-less):
//   fight shape: rounds (f.round at tbEnd), performer HP start/end,
//   HP cost (start-end, death counts full start HP), p survival,
//   companion deaths, result class, trick-bearing species killed?
//   trick: perfs (f.trickLogByMid), kind, known_at_start/end, hits.
// Plus a lightweight field-AI fired counter (villagerTrickAction) so the
// "every trick-performed fight" completeness claim covers the field path
// descriptively (TB path is the matched-comparison cohort).
//
// FIGHT-START INTERCEPTION: the tbfight property interception pattern from
// sim-trickfunnel (covers all 5 initiation paths; startCombat refusal records
// nothing). Shape snapshots (p HP, companions, monsters) are taken at the
// setter, before any player action; end-shape at tbEnd BEFORE the through
// call (same placement as the funnel instrument — narration may mutate state).
// restore() is exact.
'use strict';

const BEAT_CAP = 8000;          // per-fight transcript beats, stamped with fightSeq
const BEAT_LEN = 320;
const TRICK_BEAT = /COUNTER LEARNED|starves|starved out|bored out|Bored out|LEAVE|leaves|DISMISSED|dismisses|kindly|goodbye properly|looks away|dead air|contradicts the|confesses first|argues theology|fighting boring|deliberately boring|Navigation is victory|walk out|VOMITS|poisoned meal|fine print|loophole|Tanking the|goes quiet|falls PRONE|bad note|SMALLER|Scabbing|stands down|windup|wind-up|the line|drum/i;

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

// waveOf(Game, mid): the wave number for a species.
function waveOf(Game, mid) {
  try {
    const def = (Game.data.monsters || []).find(m => m.id === mid);
    return (def && def.wave) || null;
  } catch (e) { return null; }
}

function pSnap(Game) {
  try {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (!p) return null;
    return { hp: Math.round(p.hp || 0), maxHp: Math.round(p.maxHp || p.hp || 0), alive: !!p.alive };
  } catch (e) { return null; }
}

function attachTrickshapeCapture(Game) {
  let fightSeq = 0;
  const tbFights = [];
  const discoveries = [];
  const deaths = [];
  const sayBeats = [];
  const fightBeats = {};   // seq -> [{day, text}] full transcript for performed fights
  const checkCalls = [];
  const fieldFires = [];   // villagerTrickAction fired events (descriptive completeness)
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
    // Fight-shape snapshot at start (before any player action).
    const p = pSnap(Game);
    const companions = [];
    const monsters = [];
    try {
      for (const x of (f.fighters || [])) {
        if (!x) continue;
        if (x.kind === 'villager') companions.push({ key: x.key, vid: x.villagerId || null, hp: Math.round(x.hp || 0) });
        else if (x.kind === 'monster') {
          const mid = (x.mdef && x.mdef.id) || x.monsterId || x.id;
          monsters.push({ key: x.key, mid: mid, hp: Math.round(x.hp || 0) });
        }
      }
    } catch (e) {}
    seqIndex[fightSeq] = tbFights.length;
    tbFights.push({
      seq: fightSeq, day: gday(Game), started: true, result: null,
      mids: mids, kindByMid: kindByMid, knownAtStart: knownAtStart,
      perfs: {}, hits: {}, knownAtEnd: {}, pAlive: null,
      shapeStart: { p: p, companions: companions, monsters: monsters, partyN: 1 + companions.length },
      shapeEnd: null,
    });
    fightBeats[fightSeq] = [];
  }

  // --- tbfight property interception (covers all 5 initiation paths) ---
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
        hit: hit, ret: ret === true, discovered: ret === true,
      });
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
        // Fight-shape snapshot at end (before the through-call's narration).
        const rounds = (f && (f.round || f.turns)) || null;
        const pE = pSnap(Game);
        const shapeEnd = { rounds: rounds, p: pE, monsterEnd: [], companionDeaths: [] };
        try {
          for (const x of (f.fighters || [])) {
            if (!x) continue;
            if (x.kind === 'monster') {
              const mid = (x.mdef && x.mdef.id) || x.monsterId || x.id;
              shapeEnd.monsterEnd.push({ key: x.key, mid: mid, alive: !!x.alive, hp: Math.round(x.hp || 0) });
            } else if (x.kind === 'villager' && !x.alive) {
              shapeEnd.companionDeaths.push(x.villagerId || x.key);
            }
          }
        } catch (e) {}
        let pAlive = null;
        try { pAlive = pE ? !!pE.alive : null; } catch (e) {}
        if (idx != null && tbFights[idx]) {
          const cap = tbFights[idx];
          cap.result = result;
          const all = new Set(cap.mids.concat(mids, Object.keys(perfs), Object.keys(cap.hits)));
          cap.mids = Array.from(all);
          for (const mid of cap.mids) {
            if (!(mid in cap.knownAtStart)) {
              try { cap.knownAtStart[mid] = !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { cap.knownAtStart[mid] = null; }
            }
            if (!cap.kindByMid[mid]) cap.kindByMid[mid] = kindOf(Game, mid);
          }
          cap.perfs = perfs; cap.knownAtEnd = knownAtEnd; cap.pAlive = pAlive;
          cap.shapeEnd = shapeEnd;
        } else {
          fightSeq++;
          const kbm = {};
          for (const mid of mids) kbm[mid] = kindOf(Game, mid);
          tbFights.push({
            seq: fightSeq, day: gday(Game), started: false, result: result,
            mids: mids, kindByMid: kbm, knownAtStart: {},
            perfs: perfs, hits: {}, knownAtEnd: knownAtEnd, pAlive: pAlive,
            shapeStart: { p: null, companions: [], monsters: [], partyN: null },
            shapeEnd: shapeEnd,
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
      const live = tbFights.length && tbFights[tbFights.length - 1].result === null;
      if (live && sayBeats.length < BEAT_CAP && fightSeq > 0) {
        const arr = fightBeats[fightSeq] || (fightBeats[fightSeq] = []);
        if (arr.length < 400) { arr.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) }); sayBeats.push(1); }
      }
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP + 3000) sayBeats.push({ day: gday(Game), seq: fightSeq, text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };

  // Field-AI path: count fired executions (descriptive completeness; the
  // TB path is the matched-comparison cohort).
  let _vta = null;
  try {
    if (typeof Game.villagerTrickAction === 'function') {
      _vta = Game.villagerTrickAction.bind(Game);
      Game.villagerTrickAction = function (vid, mdef, fctx) {
        const ret = _vta(vid, mdef, fctx);
        try {
          if (ret) fieldFires.push({
            day: gday(Game), vid: vid || null,
            mid: (mdef && mdef.id) || null, trickId: ret.type || null, why: ret.why || null,
          });
        } catch (e) {}
        return ret;
      };
    }
  } catch (e) { _vta = null; }

  function restore() {
    Game.checkMonsterCounter = _cmc;
    Game.tbEnd = _tbEnd;
    Game.tele = _t;
    Game.say = _s;
    if (_vta) Game.villagerTrickAction = _vta;
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
    fightBeats: fightBeats, fieldFires: fieldFires,
    tbfightIntercepted: attached,
    restore: restore,
  };
}

// classifyShapeFight(t, waveKillLog, Game):
//   t = one tbFights capture. Returns per-(fight,mid) shape rows for
//   trick-bearing species + the attribution/quality verdict.
function classifyShapeFight(t, waveKillLog, Game) {
  const rows = [];
  let unattributed = 0;
  const wkl = waveKillLog || [];
  const mids = Array.from(new Set([].concat(
    Object.keys((t && t.mids) || {}).length ? t.mids : [],
    Object.keys((t && t.perfs) || {}),
    Object.keys((t && t.hits) || {})
  )));
  for (const mid of mids) {
    const row = { mid: mid, kind: t.kindByMid ? t.kindByMid[mid] || kindOf(Game, mid) : kindOf(Game, mid) };
    const kas = t.knownAtStart || {};
    const kae = t.knownAtEnd || {};
    const perfs = (t.perfs || {})[mid] || [];
    const hits = (t.hits || {})[mid] || [];
    row.known_at_start = (mid in kas) ? (kas[mid] ? 1 : 0) : null;
    row.known_at_end = (mid in kae) ? (kae[mid] ? 1 : 0) : null;
    row.condition_met = hits.length > 0 ? 1 : 0;
    row.n_hits = hits.length;
    row.performed = perfs.length > 0 ? 1 : 0;
    row.n_perfs = perfs.length;
    let attr = 0, attrBy = null, attrVia = null;
    for (const k of wkl) {
      if (k.mid === mid && Math.abs((k.d | 0) - (t.day | 0)) <= 1 && k.trick) {
        attr = 1; attrBy = k.by || null; attrVia = k.via || null; break;
      }
    }
    row.kill_attributed = attr;
    row.attr_by = attrBy; row.attr_via = attrVia;
    row.result = t.result || null;
    row.wave = waveOf(Game, mid);
    // --- fight shape ---
    const ss = t.shapeStart || {};
    const se = t.shapeEnd || {};
    const pS = ss.p || null, pE = se.p || null;
    row.rounds = (se.rounds != null) ? se.rounds : null;
    row.p_hp_start = (pS && pS.hp != null) ? pS.hp : null;
    row.p_hp_end = (pE && pE.hp != null) ? (pE.alive ? pE.hp : 0) : null;
    row.hp_cost = (row.p_hp_start != null && row.p_hp_end != null)
      ? Math.max(0, row.p_hp_start - row.p_hp_end) : null;
    row.p_survived = (pE && pE.alive != null) ? (pE.alive ? 1 : 0) : null;
    row.partyN = (ss.partyN != null) ? ss.partyN : null;
    row.companion_deaths = Array.isArray(se.companionDeaths) ? se.companionDeaths.length : null;
    row.companion_death_vids = Array.isArray(se.companionDeaths) ? se.companionDeaths.slice() : null;
    let spKilled = null;
    try {
      const ends = (se.monsterEnd || []).filter(x => x.mid === mid);
      spKilled = ends.length ? (ends.every(x => !x.alive) ? 1 : 0) : null;
    } catch (e) {}
    row.species_killed = spKilled;
    row.unattributed = (
      row.known_at_start === null || row.result === null || row.rounds === null ||
      row.p_hp_start === null || row.p_hp_end === null || row.p_survived === null
    ) ? 1 : 0;
    unattributed += row.unattributed;
    rows.push(row);
  }
  return { rows: rows, unattributed: unattributed };
}

module.exports = { attachTrickshapeCapture, classifyShapeFight, trickMids, kindOf, waveOf, TRICK_BEAT };
