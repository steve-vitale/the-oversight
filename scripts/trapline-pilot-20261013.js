#!/usr/bin/env node
// trapline-pilot-20261013.js — trapline arm pilot (flesh-out loop A, 2026-10-13).
// Before/after on IDENTICAL seeds, staged per docs/MEASUREMENT.md §§9-12.
//
// Pre-registered:
//   Primary metric: NPC trapline activity (npc_trap return events via
//     telemetry) + knower counts; player trap counters (trapsCrafted /
//     trapsSet / trapsWireSet) and snare recipe level.
//   GO thresholds:
//     Arm SEED (data): on seeds where the baseline cast had 0 knowers,
//       after-side has >=1 knower AND >=1 npc_trap event within 150d.
//     Arm APPRENTICE (code): on seeds where the baseline had >=1 knower,
//       after-side shows >=1 new apprentice (knower count grows) and/or the
//       player gains snare L1 via teach/overhear; npc_trap events >= baseline.
//   Horizon: 150d death-aware (Game.over stops the run; dead villages stop
//     simulating — no fixed-200d tail-chasing).
//   Seeds: 11, 22, 33, 44 x belongseek/leadcourt (8 runs per side).
//   Policies: belongseek, leadcourt (both competent-based — they work the
//     trapline when the recipe is known, so the player side is exercised).
//   Regression gate: median survival within +/-10d of baseline.
// Convergence: killed-at-pilot if GO fails; converging -> 12-16 seed confirm.
//
// Usage:
//   node scripts/trapline-pilot-20261013.js            # full 8-run side
//   LABEL=baseline-seed OUTDIR=evidence/2026-10-13 node scripts/trapline-pilot-20261013.js
//   SEEDS=11,22 POLICIES=belongseek node ...          # subset
// Writes: <OUTDIR>/trapline-pilot-<LABEL>.json (rows + wall aggregates for
// the telemetry deviation check).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const REGISTRY = { belongseek, leadcourt };
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [11, 22, 33, 44]);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',') : ['belongseek', 'leadcourt']);
const DAYS = parseInt(process.env.DAYS || '150', 10);
const LABEL = process.env.LABEL || 'run';
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-13');
const TRAP_RE = /snare|🪤|\btrap\b/i;

function knowerCount(Game) {
  const v = Game.state.village || {};
  let n = 0;
  for (const vid of (v.roster || [])) {
    try { if (Game.vpOf && Game.vpOf(vid) && Game.vpOf(vid).knowsSnare) n++; } catch (e) {}
  }
  return n;
}
function teleCount(Game, type) {
  return (Game.state.telemetry || []).filter(e => e.type === type);
}

async function oneRun(seed, policyId) {
  const { Game } = await loadGame({ seed, mode: 'trapline-pilot' });
  await setupGame(Game);
  const knowers0 = knowerCount(Game);
  const scholarOcc = (Game.vpOf && Game.vpOf(Game.villagerId) || {}).occupationId || '?';
  // capture trap/wire narration for the sense read (harness silences say)
  const trapLines = [];
  const _say = Game.say;
  Game.say = function (line) {
    try { if (line && TRAP_RE.test(String(line)) && trapLines.length < 12) trapLines.push(String(line).slice(0, 260)); } catch (e) {}
    return _say.apply(this, arguments);
  };
  const policy = Object.assign({}, REGISTRY[policyId]);
  // player trapline counters: wrap craft/setTrap (same pattern as the
  // harness's pacing wrappers — measurement only, no behavior change).
  const TRAP_IDS = /^(snare|deadfall|box_trap|spring_snare|minnow_trap|pit_trap)$/;
  let playerCrafted = 0, playerSet = 0;
  try {
    const _craft = Game.craft.bind(Game), _setTrap = Game.setTrap.bind(Game);
    Game.craft = function (id) {
      const r = _craft.apply(this, arguments);
      if (r && TRAP_IDS.test(id)) playerCrafted++;
      return r;
    };
    Game.setTrap = function (id) {
      const r = _setTrap.apply(this, arguments);
      if (r) playerSet++;
      return r;
    };
  } catch (e) {}
  const res = await runDays(Game, policy, { days: DAYS, manifest: { seed, policy: policyId } });
  const sday = (Game.state.scholar || {}).day || 0;
  const npcTrap = teleCount(Game, 'npc_trap');
  const snareLesson = teleCount(Game, 'snare_lesson');
  const overhear = teleCount(Game, 'snare_overhear');
  const pantry = (() => { try {
    return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; } })();
  const row = {
    seed, policy: policyId, label: LABEL,
    survivalDays: sday, over: !!Game.over,
    pop: ((Game.state.village || {}).roster || []).length,
    knowers0, knowersEnd: knowerCount(Game), scholarOcc,
    npcTrapEvents: npcTrap.length,
    npcTrapCatches: npcTrap.filter(e => e.caught).length,
    npcTrapKcal: npcTrap.reduce((t, e) => t + (e.kcal || 0), 0),
    snareLessons: snareLesson.length,
    snareOverhears: overhear.length,
    playerSnareLevel: (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0,
    trapsCrafted: playerCrafted,
    trapsSet: playerSet,
    pantryKcal: Math.round(pantry),
    deaths: ((res.samples || {}).deaths || []).length,
    trapLines,
  };
  // player trap counters come from the craft/setTrap wrappers above.
  return { row, Game };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of POLICIES) {
      console.log(`--- ${LABEL} seed=${seed} policy=${pid} ---`);
      const t0 = Date.now();
      try {
        const { row } = await oneRun(seed, pid);
        rows.push(row);
        console.log(`  survival=${row.survivalDays}d pop=${row.pop} knowers ${row.knowers0}->${row.knowersEnd} npcTrap=${row.npcTrapEvents} (catches ${row.npcTrapCatches}) lessons=${row.snareLessons} overhears=${row.snareOverhears} playerSnareL=${row.playerSnareLevel} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.log(`  ERROR ${e.message}`);
        rows.push({ seed, policy: pid, label: LABEL, error: String(e.message).slice(0, 200) });
      }
    }
  }
  const flat = {
    national: 0, table: 0, wins: 0, exiled: 0,
    npcTrapEvents: rows.reduce((t, r) => t + (r.npcTrapEvents || 0), 0),
    npcTrapCatches: rows.reduce((t, r) => t + (r.npcTrapCatches || 0), 0),
    snareLessons: rows.reduce((t, r) => t + (r.snareLessons || 0), 0),
    medianSurvival: median(rows.filter(r => !r.error).map(r => r.survivalDays)),
  };
  const out = { label: `trapline-pilot-${LABEL}`, days: DAYS, seeds: SEEDS, policies: POLICIES, rows, flat };
  fs.mkdirSync(OUTDIR, { recursive: true });
  const p = path.join(OUTDIR, `trapline-pilot-${LABEL}.json`);
  fs.writeFileSync(p, JSON.stringify(out, null, 1));
  console.log('wrote', p);
  console.log('FLAT', JSON.stringify(flat));
})().catch(e => { console.error('FATAL', e); process.exit(1); });

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
