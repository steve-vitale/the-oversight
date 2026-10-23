#!/usr/bin/env node
// vetretention-analyze.js — offline analyzer for the sim-vetretention pilot
// (run fleshout-20261023T1215Z, axis scale-onramp). PURE offline join over
// the per-seed JSONs: no sims, no RNG, deterministic.
//
// Reads evidence/2026-10-23/perseed-vetretention/*.json and judges the
// PRE-REGISTERED bars (§14 binding — see evidence/2026-10-23/
// sim-vetretention.md):
//   PRIMARY:    median days-alive-post-kill over wave-4+ killer vids
//               (joined waveKillLog `by` -> death rows, autopsy method):
//               armed >= control + 4d.
//   ENGAGEMENT: >=6/8 seeds have >=1 blooded vid receiving a named
//               retention action (shelter/heal/escort/sitout/shield)
//               within 14d post-kill (the retention trace proves it).
//   GUARDRAILS: median survival paired diff >= -10d; starvation <=
//               control+2; no new death kinds (>=2-event rule); wall
//               numbers (national/table/wins, wave4/5, median survival)
//               reported for both arms.
//
// Usage: node scripts/vetretention-analyze.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.VR_EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetretention');
const SEEDS = [68601, 68602, 68603, 68604, 68605, 68606, 68607, 68608];
const POLICIES = ['leadfeast', 'belongfeast'];
const NAMED_ACTIONS = ['shelter', 'heal', 'escort', 'sitout', 'shield'];

function load(arm, policy, seed) {
  const tag = `${arm}-${policy}${arm === 'armed' ? '-vetretention' : ''}-s${seed}.json`;
  const fp = path.join(EVID, tag);
  if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Per config: killer vids from waveKillLog (w>=4), joined to death rows.
function killerRows(r) {
  const kills = (r.waveKillLog || []).filter(e => (e.w | 0) >= 4 && e.by);
  const byVid = {};
  for (const e of kills) {
    const vid = String(e.by);
    byVid[vid] = byVid[vid] || [];
    byVid[vid].push(e.d | 0);
  }
  const deathDay = {};
  for (const d of (r.deathRows || [])) {
    if (d.kind !== 'villager' || d.real === false) continue;
    const vid = String(d.who || '');
    if (!vid) continue;
    if (deathDay[vid] == null || (d.day | 0) < deathDay[vid]) deathDay[vid] = d.day | 0;
  }
  const endDay = r.gameDays | 0;
  const rows = [];
  for (const vid of Object.keys(byVid)) {
    const killDays = byVid[vid].slice().sort((a, b) => a - b);
    const dd = deathDay[vid];
    const died = dd != null;
    // last wave-4+ kill on/before the death (autopsy method); survivors
    // measured to run end (censored, documented).
    const ref = died ? dd : endDay;
    const kds = killDays.filter(d => d <= ref);
    if (!kds.length) continue;
    const lastKill = kds[kds.length - 1];
    rows.push({ vid, seed: r.seed, arm: r.arm, policy: r.policyId, killDays, lastKill, died, deathDay: died ? dd : null, daysAlive: ref - lastKill });
  }
  return rows;
}

const arms = { control: [], armed: [] };
const engagement = {}; // seed -> {controlBlooded, armedBlooded, armedEngaged}
const guard = { control: { surv: [], starv: 0, deaths: {} }, armed: { control: 0, surv: [], starv: 0, deaths: {} } };
const wall = { control: [], armed: [] };
const pairs = []; // {seed, policy, controlDays, armedDays, diff}

for (const seed of SEEDS) {
  engagement[seed] = { controlBlooded: 0, armedBlooded: 0, armedEngaged: false };
  for (const policy of POLICIES) {
    const rc = load('control', policy, seed);
    const ra = load('armed', policy, seed);
    const kc = killerRows(rc), ka = killerRows(ra);
    arms.control.push(...kc);
    arms.armed.push(...ka);
    engagement[seed].controlBlooded += kc.length;
    engagement[seed].armedBlooded += ka.length;
    // engagement: a blooded vid (waveKillLog by, w>=4) with a named
    // retention action in the trace within 14d of a kill day.
    const killDaysByVid = {};
    for (const e of (ra.waveKillLog || []).filter(x => (x.w | 0) >= 4 && x.by)) {
      const vid = String(e.by);
      killDaysByVid[vid] = killDaysByVid[vid] || [];
      killDaysByVid[vid].push(e.d | 0);
    }
    let engaged = false;
    for (const t of (ra.vrTrace || [])) {
      if (!NAMED_ACTIONS.includes(t.action)) continue;
      const kds = killDaysByVid[String(t.vid || '')] || [];
      if (kds.some(kd => (t.day | 0) - kd >= 0 && (t.day | 0) - kd <= 14)) { engaged = true; break; }
    }
    if (engaged) engagement[seed].armedEngaged = true;
    // guardrails
    guard.control.surv.push(rc.gameDays | 0);
    guard.armed.surv.push(ra.gameDays | 0);
    pairs.push({ seed, policy, controlDays: rc.gameDays | 0, armedDays: ra.gameDays | 0, diff: (ra.gameDays | 0) - (rc.gameDays | 0) });
    for (const [armKey, r] of [['control', rc], ['armed', ra]]) {
      const dc = r.deaths || {};
      const starv = (dc.starvation | 0) + (dc.starved | 0);
      guard[armKey].starv += starv;
      for (const [k, n] of Object.entries(dc)) guard[armKey].deaths[k] = (guard[armKey].deaths[k] || 0) + n;
    }
    for (const [armKey, r] of [['control', rc], ['armed', ra]]) {
      wall[armKey].push({
        seed, policy,
        national: r.national | 0, table: r.table | 0, won: r.won | 0,
        wave4: (r.maxWave | 0) >= 4 ? 1 : 0, wave5: (r.maxWave | 0) >= 5 ? 1 : 0,
        survival: r.gameDays | 0,
      });
    }
  }
}

// PRIMARY
const ctrlDays = arms.control.map(r => r.daysAlive);
const armedDays = arms.armed.map(r => r.daysAlive);
const ctrlMed = median(ctrlDays), armedMed = median(armedDays);
const primaryGo = (ctrlMed != null && armedMed != null) ? (armedMed >= ctrlMed + 4) : false;

// ENGAGEMENT
const engagedSeeds = SEEDS.filter(s => engagement[s].armedEngaged);
const engagementGo = engagedSeeds.length >= 6;

// GUARDRAILS
const pairDiffs = pairs.map(p => p.diff);
const survDiffMed = median(pairDiffs);
const survGo = survDiffMed != null && survDiffMed >= -10;
const starvGo = guard.armed.starv <= guard.control.starv + 2;
const newKinds = Object.keys(guard.armed.deaths).filter(k => (guard.armed.deaths[k] | 0) >= 2 && !(guard.control.deaths[k] | 0));
const kindsGo = newKinds.length === 0;

function wallAgg(rows) {
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  return {
    n: rows.length, national: sum('national'), table: sum('table'), won: sum('won'),
    wave4: sum('wave4'), wave5: sum('wave5'),
    medianSurvival: median(rows.map(r => r.survival)),
  };
}

const report = {
  verdict: { primaryGo, engagementGo, survGo, starvGo, kindsGo },
  primary: {
    control: { n: ctrlDays.length, median: ctrlMed, days: ctrlDays.slice().sort((a, b) => a - b) },
    armed: { n: armedDays.length, median: armedMed, days: armedDays.slice().sort((a, b) => a - b) },
    bar: 'armed median >= control median + 4d',
    delta: (armedMed != null && ctrlMed != null) ? armedMed - ctrlMed : null,
  },
  engagement: {
    bar: '>=6/8 seeds with a blooded vid receiving a named retention action within 14d post-kill',
    engagedSeeds, n: engagedSeeds.length,
    perSeed: Object.fromEntries(SEEDS.map(s => [s, engagement[s]])),
  },
  guardrails: {
    survivalPairedDiffMedian: survDiffMed, survivalBar: '>= -10d', survivalGo: survGo,
    starvation: { control: guard.control.starv, armed: guard.armed.starv, bar: 'armed <= control+2', go: starvGo },
    newDeathKinds: newKinds, kindsGo,
    pairDiffs,
  },
  wall: { control: wallAgg(wall.control), armed: wallAgg(wall.armed) },
  killerDetail: {
    control: arms.control.map(r => ({ vid: r.vid, seed: r.seed, lastKill: r.lastKill, died: r.died, deathDay: r.deathDay, daysAlive: r.daysAlive })),
    armed: arms.armed.map(r => ({ vid: r.vid, seed: r.seed, lastKill: r.lastKill, died: r.died, deathDay: r.deathDay, daysAlive: r.daysAlive })),
  },
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log('=== sim-vetretention PILOT ANALYSIS ===');
  console.log(`PRIMARY (median days-alive-post-kill): control n=${ctrlDays.length} med=${ctrlMed} | armed n=${armedDays.length} med=${armedMed} | bar armed>=control+4 -> ${primaryGo ? 'GO' : 'NO-GO'}`);
  console.log(`ENGAGEMENT: ${engagedSeeds.length}/8 seeds (${engagedSeeds.join(',')}) -> ${engagementGo ? 'GO' : 'NO-GO'}`);
  console.log(`GUARDRAIL survival paired-diff median: ${survDiffMed} (bar >=-10) -> ${survGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL starvation: control ${guard.control.starv} vs armed ${guard.armed.starv} (bar <=control+2) -> ${starvGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL new death kinds: ${newKinds.length ? newKinds.join(',') : 'none'} -> ${kindsGo ? 'PASS' : 'FAIL'}`);
  const wc = report.wall.control, wa = report.wall.armed;
  console.log(`WALL control: national ${wc.national}/16 table ${wc.table}/16 won ${wc.won}/16 wave4 ${wc.wave4}/16 wave5 ${wc.wave5}/16 medSurv ${wc.medianSurvival}`);
  console.log(`WALL armed:   national ${wa.national}/16 table ${wa.table}/16 won ${wa.won}/16 wave4 ${wa.wave4}/16 wave5 ${wa.wave5}/16 medSurv ${wa.medianSurvival}`);
}
fs.writeFileSync(path.join(EVID, 'vetretention-analysis.json'), JSON.stringify(report, null, 1) + '\n');
