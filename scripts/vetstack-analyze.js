#!/usr/bin/env node
// vetstack-analyze.js — sim-vetstack judge (flesh-out loop arm sim-vetstack,
// axis scale-onramp, run fleshout-20261023T1515Z). Offline: reads the
// retained per-seed JSONs and judges the §14 pre-registered bars.
//
// THE binding sensor (per the vetkill-autopsy method): state.waveKillLog
// read DIRECTLY post-run (the same source src/js/standing.js
// waveCombatReadiness(5) reads — the defer5 veterans bar). Living join:
// a killer vid is LIVING iff it does NOT appear in the run's deathRows.who
// (the engine's own isLiving() reads vp.dead; post-run the dead-set join is
// the offline equivalent; monster `who`s never collide with killer vids).
// dedupe: DISTINCT killer vids (the duplicate-waveKillLog-entry finding
// #vetformation is verdict-neutral under distinct-vid counting).
//
// PRIMARY: stack configs co-satisfying the defer5 veterans bar (2 living
// wave-4+ killers simultaneously) >= control + 2, AND >= 1 stack config
// satisfying. A miss is NO-GO, never re-scored.
// SECONDARY: wave-5 doors (stack vs control); defer4 bar (1 living w3+
// killer) co-satisfaction reported. Guardrails + wall reported both arms.
//
// Usage: node scripts/vetstack-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetstack');

function loadArm(arm) {
  const dir = path.join(EVID, arm);
  const out = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

// distinctVetVids: DISTINCT killer vids WITHIN one config.
// perPairSum: the formation arm's PRIMARY convention — distinct vids
// SUMMED over the 16 seed-policy pairs (a vid blooded on both bases of
// one seed counts twice; it is two different villages' veterans).
function perPairSum(runs, minW) {
  let tot = 0;
  for (const r of runs) tot += distinctVetVids(r, minW).size;
  return tot;
}
function deadWhoSet(run) {
  const s = new Set();
  for (const r of (run.deathRows || [])) { if (r && r.who) s.add(String(r.who)); }
  return s;
}
function livingVetVids(run, minW) {
  const dead = deadWhoSet(run);
  const seen = new Set();
  for (const e of (run.waveKillLog || [])) {
    if (!e || !e.by || ((e.w | 0) < minW)) continue;
    if (dead.has(String(e.by))) continue;
    seen.add(String(e.by));
  }
  return seen;
}
function distinctVetVids(run, minW) {
  const seen = new Set();
  for (const e of (run.waveKillLog || [])) {
    if (!e || !e.by || ((e.w | 0) < minW)) continue;
    seen.add(String(e.by));
  }
  return seen;
}

function cfgKey(run) { return `${run.seed}-${run.base === 'belongfeast' ? 'belong' : 'lead'}`; }

function judgeArm(arm) {
  const runs = loadArm(arm);
  const byCfg = new Map();
  for (const r of runs) byCfg.set(cfgKey(r), r);
  // distinctW4: the formation arm's PRIMARY convention — distinct killer
  // vids summed over the 16 seed-policy pairs (two villages' veterans
  // are two veterans even on the same seed).
  const distinctW4 = perPairSum([...byCfg.values()], 4);
  let defer5 = 0, defer4 = 0, w5doors = 0, formedEngage = 0;
  const defer5Cfgs = [], defer4Cfgs = [], engageCfgs = [];
  const walls = { national: 0, table: 0, wins: 0, exiled: 0, wave4: 0, wave5: 0, medSurv: [], starvation: 0, deathKinds: new Set() };
  for (const r of byCfg.values()) {
    const lv5 = livingVetVids(r, 4), lv4 = livingVetVids(r, 3);
    if (lv5.size >= 2) { defer5++; defer5Cfgs.push({ cfg: cfgKey(r), vids: [...lv5] }); }
    if (lv4.size >= 1) { defer4++; defer4Cfgs.push({ cfg: cfgKey(r), vids: [...lv4] }); }
    if ((r.maxWave | 0) >= 5) w5doors++;
    const fe = (r.vfW4FightRows || []).filter(x => ((x.formedEngaged || []).length >= 2)).length;
    if (fe > 0) { formedEngage++; engageCfgs.push(cfgKey(r)); }
    if (r.national) walls.national++;
    if (r.table) walls.table++;
    if (r.won) walls.wins++;
    if (r.exiled) walls.exiled++;
    if ((r.maxWave | 0) >= 4) walls.wave4++;
    walls.medSurv.push(r.gameDays | 0);
    walls.starvation += r.starvation | 0;
    for (const k of Object.keys(r.deaths || {})) walls.deathKinds.add(k);
  }
  walls.medSurv.sort((a, b) => a - b);
  const n = walls.medSurv.length;
  walls.median = n ? walls.medSurv[Math.floor(n / 2)] : 0;
  return {
    arm, n: byCfg.size,
    distinctW4,
    formedEngage, engageCfgs,
    defer5, defer5Cfgs, defer4, defer4Cfgs, w5doors,
    walls: { ...walls, deathKinds: [...walls.deathKinds].sort(), medSurv: undefined },
  };
}

function main() {
  const control = judgeArm('control');
  const stack = judgeArm('stack');
  // Anchor sanity (the #793 check): every config on the same anchor.
  const anchors = new Set();
  for (const arm of ['control', 'stack']) for (const r of loadArm(arm)) anchors.add(r.anchorCommit);
  const pairedDiff = (function () {
    const cs = {}, ss = {};
    for (const r of loadArm('control')) cs[cfgKey(r)] = r.gameDays | 0;
    for (const r of loadArm('stack')) ss[cfgKey(r)] = r.gameDays | 0;
    const diffs = [];
    for (const k of Object.keys(cs)) if (ss[k] != null) diffs.push(ss[k] - cs[k]);
    diffs.sort((a, b) => a - b);
    return diffs.length ? diffs[Math.floor(diffs.length / 2)] : null;
  })();
  const newKinds = stack.walls.deathKinds.filter(k => !control.walls.deathKinds.includes(k));

  const bar = control.defer5 + 2;
  const primaryGO = (stack.defer5 >= bar) && (stack.defer5 >= 1);

  const verdict = {
    run: 'sim-vetstack', arm: 'composition', axis: 'scale-onramp',
    corpus: { control: control.n, stack: stack.n, seeds: '68805-68810,68812,68814 x {leadfeast,belongfeast}', horizon: '180d death-aware' },
    anchors: [...anchors],
    primary: {
      binding: 'defer5 veterans-bar co-satisfaction: stack configs with >=2 living wave-4+ killers (waveKillLog DIRECT, living join vs deathRows.who) >= control+2 AND >=1 stack config',
      control: control.defer5, stack: stack.defer5, bar, GO: primaryGO,
      controlCfgs: control.defer5Cfgs.map(c => c.cfg),
      stackCfgs: stack.defer5Cfgs.map(c => ({ cfg: c.cfg, vids: c.vids })),
    },
    secondary: {
      wave5Doors: { control: control.w5doors, stack: stack.w5doors },
      defer4: { control: control.defer4, stack: stack.defer4 },
      defer4Cfgs: { control: control.defer4Cfgs.map(c => c.cfg), stack: stack.defer4Cfgs.map(c => c.cfg) },
    },
    formationContrast: {
      distinctW4VidsPerPairSum: { control: control.distinctW4, stack: stack.distinctW4 },
      singleHalfCorpora: 'vetformation: armed 10 vs control 6 (this seed band, per-pair sum); vetretention: 2/16 formed (68601-68608 band)',
      engagementFormed2: { control: control.formedEngage, stack: stack.formedEngage },
    },
    guardrails: {
      medianSurvivalPairedDiff: pairedDiff, bar: '>= -15d', pass: pairedDiff != null && pairedDiff >= -15,
      starvation: { control: control.walls.starvation, stack: stack.walls.starvation, pass: stack.walls.starvation <= control.walls.starvation + 2 },
      newDeathKinds: newKinds, pass: newKinds.length === 0,
    },
    wall: {
      control: { national: control.walls.national, table: control.walls.table, wins: control.walls.wins, wave4: control.walls.wave4, wave5: control.w5doors, median: control.walls.median },
      stack: { national: stack.walls.national, table: stack.walls.table, wins: stack.walls.wins, wave4: stack.walls.wave4, wave5: stack.w5doors, median: stack.walls.median },
    },
    convergence: primaryGO ? 'GO — the two veterans-half levers compose into the defer5 leg'
      : 'NO-GO — composition did not move simultaneity (§14: a miss is NO-GO, never re-scored)',
  };
  console.log(JSON.stringify(verdict, null, 1));
  fs.writeFileSync(path.join(EVID, 'vetstack-verdict.json'), JSON.stringify(verdict, null, 1) + '\n');
  return primaryGO ? 0 : 3;
}
if (require.main === module) { process.exitCode = main(); }
module.exports = { judgeArm, livingVetVids, distinctVetVids, perPairSum, deadWhoSet, loadArm };
