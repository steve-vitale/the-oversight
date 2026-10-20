#!/usr/bin/env node
// analyze-killerstand-20261020.js — pilot judgment for arm sim-killeraftermath.
// Reads evidence/2026-10-20/perseed-killattr/{control,armed}/ and judges the
// pre-registered PRIMARY/SECONDARY/GUARDRAILS (see evidence/2026-10-20/
// sim-killeraftermath.md — the pre-registration is binding).
//
// PRIMARY (binding): share of ARMED wave-4+ scholar kills whose killer is
//   alive at +30d (E3 convention). GO: armed >= 3/8 AND armed > control.
// SECONDARY: 2-living-veterans bar (vets5max >= 2) in >= 2/8 runs per policy.
// GUARDRAILS (binding): median survival >= control-10d; no new death modes
//   (>=2-event armed-only cause); wave-4 unlocks >= control-1.
//
// Usage: node scripts/analyze-killerstand-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-20', 'perseed-killattr');
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];
const POLICIES = ['leadfeast', 'belongfeast'];
const WIN = 30;

function load(arm) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(DIR, arm, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push({ policy: policyId, seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
    }
  }
  return rows;
}

function scholarKills(r) {
  return (r.kills || []).filter(k =>
    (k.wave | 0) >= 4 && k.via === 'player' && k.by && k.ctx && k.by === k.ctx.scholarVid);
}
function killerDeath(r, kill) {
  let best = null;
  for (const d of (r.deaths || [])) {
    if (String(d.who) !== String(kill.by)) continue;
    if (d.day < kill.day || d.day > kill.day + WIN) continue;
    if (!best || d.day < best.day) best = d;
  }
  return best;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return 0;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function primaryFor(rows) {
  const kills = [];
  const censored = [];
  for (const { policy, seed, r } of rows) {
    for (const k of scholarKills(r)) {
      if (k.day + WIN > r.gameDays) { censored.push({ policy, seed, kill: k }); continue; }
      const death = killerDeath(r, k);
      kills.push({ policy, seed, kill: k, death, alive: !death });
    }
  }
  const alive = kills.filter(k => k.alive).length;
  return { kills: kills.length, censored: censored.length, alive,
    share: kills.length ? alive / kills.length : null, detail: kills };
}

function analyze() {
  const control = load('control'), armed = load('armed');
  let instErr = 0;
  for (const { r } of [...control, ...armed]) instErr += (r.instrumentErrorCount | 0);
  if (instErr) console.log(`INSTRUMENT ERRORS: ${instErr}`);

  // PRIMARY
  const pc = primaryFor(control), pa = primaryFor(armed);
  console.log(`PRIMARY killer-alive-at-+30d:`);
  console.log(`  control: ${pc.alive}/${pc.kills} = ${pc.share == null ? 'n/a' : pc.share.toFixed(3)} (censored ${pc.censored})`);
  console.log(`  armed:   ${pa.alive}/${pa.kills} = ${pa.share == null ? 'n/a' : pa.share.toFixed(3)} (censored ${pa.censored})`);
  const go = pa.share != null && pa.share >= 3 / 8 && pc.share != null && pa.share > pc.share;
  console.log(`  GO bar: armed >= 0.375 AND armed > control -> ${go ? 'GO' : 'MISS'}`);

  // Per-kill detail (armed).
  console.log('\n  armed per-kill:');
  for (const k of pa.detail) {
    const d = k.death;
    console.log(`    ${k.policy} s${k.seed}: ${k.kill.mid} d${k.kill.day} -> ${d ? `death d${d.day} (+${d.day - k.kill.day}d) ${d.cause} allies=${(d.allies || []).length}` : 'ALIVE'}`);
  }

  // Lever engagement: stand beats + allies at death.
  let standBeats = 0;
  for (const { r } of armed) standBeats += (r.standBeats | 0);
  const armedHavenDeaths = pa.detail.filter(k => k.death && k.death.atHaven && k.death.inTb);
  const withAllies = armedHavenDeaths.filter(k => (k.death.allies || []).length > 0).length;
  console.log(`\n  ENGAGEMENT: standBeats=${standBeats} (armed); haven-encounter killer deaths with allies>0: ${withAllies}/${armedHavenDeaths.length}`);

  // SECONDARY (armed only, absolute bar).
  console.log('\nSECONDARY vets5max>=2 (bar >= 2/8 per policy):');
  for (const policy of POLICIES) {
    const n = armed.filter(x => x.policy === policy && (x.r.vets5max | 0) >= 2).length;
    console.log(`  armed ${policy}: ${n}/8 ${n >= 2 ? 'GO' : 'MISS'}`);
  }

  // GUARDRAILS
  console.log('\nGUARDRAILS:');
  const survC = control.map(x => x.r.gameDays | 0), survA = armed.map(x => x.r.gameDays | 0);
  const medC = median(survC), medA = median(survA);
  console.log(`  median survival: control ${medC}d, armed ${medA}d (>= control-10: ${medA >= medC - 10 ? 'PASS' : 'FAIL'})`);
  const w4C = control.filter(x => (x.r.maxWave | 0) >= 4).length;
  const w4A = armed.filter(x => (x.r.maxWave | 0) >= 4).length;
  console.log(`  wave-4 unlocks: control ${w4C}/16, armed ${w4A}/16 (>= control-1: ${w4A >= w4C - 1 ? 'PASS' : 'FAIL'})`);
  const causesC = {}, causesA = {};
  for (const { r } of control) for (const d of (r.deaths || [])) { const c = String(d.cause || 'unknown'); causesC[c] = (causesC[c] || 0) + 1; }
  for (const { r } of armed) for (const d of (r.deaths || [])) { const c = String(d.cause || 'unknown'); causesA[c] = (causesA[c] || 0) + 1; }
  const newModes = Object.keys(causesA).filter(c => !(c in causesC) && causesA[c] >= 2);
  console.log(`  new death modes (>=2-event armed-only): ${newModes.length ? newModes.join(',') + ' FAIL' : 'none PASS'}`);

  // Wall numbers.
  const wall = (rows) => {
    let national = 0, table = 0, wins = 0, w4 = 0, w5 = 0;
    for (const { r } of rows) {
      if (r.maxRank === 'national' || r.maxRank === 'global') national++;
      if (r.everTable) table++;
      if (r.won) wins++;
      if ((r.maxWave | 0) >= 4) w4++;
      if ((r.maxWave | 0) >= 5) w5++;
    }
    return { national, table, wins, w4, w5, med: median(rows.map(x => x.r.gameDays | 0)) };
  };
  console.log('\nWALL:');
  console.log('  control: ' + JSON.stringify(wall(control)));
  console.log('  armed:   ' + JSON.stringify(wall(armed)));

  const verdict = go ? 'GO' : 'KILLED-AT-PILOT';
  console.log(`\nVERDICT: ${verdict}`);
  const out = { primary: { control: pc, armed: pa, go }, verdict,
    engagement: { standBeats, havenDeathsWithAllies: `${withAllies}/${armedHavenDeaths.length}` },
    guardrails: { medSurvC: medC, medSurvA: medA, w4C, w4A, newModes },
    wall: { control: wall(control), armed: wall(armed) } };
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-20', 'killerstand-pilot.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('wrote evidence/2026-10-20/killerstand-pilot.json');
  if (!go) process.exit(1);
}

analyze();
