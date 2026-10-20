#!/usr/bin/env node
// analyze-scholarsurvive-20261020.js — analyzer for arm sim-scholarsurvive
// (flesh-out loop run fleshout-20261020T1015Z, axis scale-onramp).
//
// Reads evidence/2026-10-20/perseed-scholarsurvive/{control,armed}/ and
// judges the pre-registered metrics:
//
// PRIMARY (binding): share of ARMED wave-4 kills (w===4, via='player')
//   whose killer is alive at +30d post-kill. GO >= 4/8 (baseline E3: 0.10).
//   Killer-alive ⟺ no samples.deaths record for the killer vid with
//   killDay <= day <= killDay+30 (E3's convention). Censored kills
//   (killDay+30 > run end) are listed and excluded from the share.
// SECONDARY: 2-living-veterans bar (waveCombatReadiness(5).veterans >= 2
//   at any day) met in >= 2/8 runs per policy.
// GUARDRAILS: median survival >= control -10d; no new death modes
//   (armed causes not seen in control); wave-4 unlocks >= control.
//
// Usage: node scripts/analyze-scholarsurvive-20261020.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-scholarsurvive');
const POLICIES = ['leadfeast', 'belongfeast'];
const SEEDS = [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008];

function load(arm) {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const fp = path.join(EVID, arm, policyId, `s${seed}.json`);
      if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
      rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
    }
  }
  return rows;
}

// All wave-4 kills (w===4) with via='player' from the daily records.
function w4Kills(rec) {
  const out = [];
  for (const r of (rec.recs || [])) {
    for (const k of (r.newKills || [])) {
      if ((k.w | 0) === 4 && k.ch === 'player') out.push({ d: r.d, mid: k.mid, by: String(k.by || '') });
    }
  }
  return out;
}
// E3 convention: died within 30d ⟺ a death record for the killer vid with
// killDay <= day <= killDay+30.
function aliveAt30(rec, kill) {
  const kd = kill.d | 0;
  for (const d of (rec.deathList || [])) {
    if (kill.by && String(d.who) === kill.by && (d.day | 0) >= kd && (d.day | 0) <= kd + 30) {
      return { alive: false, deathDay: d.day | 0, cause: d.cause || d.kind };
    }
  }
  const censored = ((rec.gameDays | 0) < kd + 30);
  return { alive: true, censored };
}
function median(xs) {
  const a = xs.filter(x => x != null).slice().sort((p, q) => p - q);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

function analyze() {
  const control = load('control'), armed = load('armed');
  if (control.length !== 16 || armed.length !== 16) throw new Error('expected 16 runs per arm');

  // PRIMARY
  const kills = [];
  for (const rec of armed) {
    for (const k of w4Kills(rec)) {
      const st = aliveAt30(rec, k);
      kills.push({ seed: rec.seed, policy: rec.policyId, d: k.d, mid: k.mid, by: k.by, ...st });
    }
  }
  const uncensored = kills.filter(k => !k.censored);
  const alive = uncensored.filter(k => k.alive);
  const primaryShare = uncensored.length ? alive.length / uncensored.length : null;
  const primaryGo = primaryShare != null && primaryShare >= 0.5;

  // SECONDARY (per policy)
  const secondary = {};
  for (const p of POLICIES) {
    const runs = armed.filter(r => r.policyId === p);
    secondary[p] = { met: runs.filter(r => (r.vets5max | 0) >= 2).length, of: runs.length };
  }

  // Guardrails
  const medCtrl = median(control.map(r => r.gameDays | 0));
  const medArmed = median(armed.map(r => r.gameDays | 0));
  const guardSurvival = (medArmed != null && medCtrl != null) ? medArmed >= medCtrl - 10 : null;
  const ctrlCauses = new Set();
  for (const r of control) for (const k of Object.keys(r.deaths || {})) ctrlCauses.add(k);
  const armedCauses = new Set();
  for (const r of armed) for (const k of Object.keys(r.deaths || {})) armedCauses.add(k);
  const newModes = [...armedCauses].filter(c => !ctrlCauses.has(c));
  const w4Ctrl = control.filter(r => (r.maxWave | 0) >= 4).length;
  const w4Armed = armed.filter(r => (r.maxWave | 0) >= 4).length;

  // Wall numbers (standing directive)
  const wall = (rows) => ({
    n: rows.length,
    national: rows.filter(r => r.national).length,
    won: rows.filter(r => r.won).length,
    waveReach: [1, 2, 3, 4, 5].map(w => rows.filter(r => (r.maxWave | 0) >= w).length),
    medSurv: median(rows.map(r => r.gameDays | 0)),
    maxSurv: Math.max(...rows.map(r => r.gameDays | 0)),
    causes: rows.reduce((m, r) => { for (const [k, v] of Object.entries(r.deaths || {})) m[k] = (m[k] | 0) + v; return m; }, {}),
  });

  // Layer engagement (armed only)
  const engage = {
    killsDetected: armed.reduce((t, r) => t + ((r.ss || {}).ssKillsDetected | 0), 0),
    disengages: armed.reduce((t, r) => t + ((r.ss || {}).ssDisengages | 0), 0),
    rests: armed.reduce((t, r) => t + ((r.ss || {}).ssRests | 0), 0),
    recoverDays: armed.reduce((t, r) => t + ((r.ss || {}).ssRecoverDays | 0), 0),
    homeWalks: armed.reduce((t, r) => t + ((r.ss || {}).ssHomeWalks | 0), 0),
    recoveriesEnded: armed.reduce((t, r) => t + ((r.ss || {}).ssRecoveriesEnded | 0), 0),
  };

  return {
    primary: { share: primaryShare, alive: alive.length, of: uncensored.length, censored: kills.length - uncensored.length, go: primaryGo, kills },
    secondary,
    guardrails: { medCtrl, medArmed, survivalOk: guardSurvival, newDeathModes: newModes, w4Ctrl, w4Armed, w4Ok: w4Armed >= w4Ctrl },
    wall: { control: wall(control), armed: wall(armed) },
    engage,
  };
}

function report(a) {
  const L = [];
  L.push('## scholarsurvive pilot verdict');
  L.push(`PRIMARY (killer alive at +30d, armed wave-4 player kills): ${a.primary.alive}/${a.primary.of} = ${a.primary.share == null ? 'n/a' : (a.primary.share * 100).toFixed(1) + '%'} (censored ${a.primary.censored}) — GO(>=50%): ${a.primary.go ? 'YES' : 'NO'}`);
  for (const k of a.primary.kills) L.push(`  - s${k.seed}/${k.policy} d${k.d} ${k.mid} by=${k.by.slice(0, 14)}: ${k.alive ? (k.censored ? 'ALIVE(censored)' : 'ALIVE') : `DIED d${k.deathDay} (${k.cause})`}`);
  for (const p of Object.keys(a.secondary)) L.push(`SECONDARY ${p}: vet-bar met ${a.secondary[p].met}/${a.secondary[p].of} (bar 2/8)`);
  L.push(`GUARDRAILS: median survival control=${a.guardrails.medCtrl} armed=${a.guardrails.medArmed} (>=ctrl-10: ${a.guardrails.survivalOk}); new death modes: [${a.guardrails.newDeathModes.join(', ') || 'none'}]; wave-4 unlocks ctrl=${a.guardrails.w4Ctrl} armed=${a.guardrails.w4Armed} (>=ctrl: ${a.guardrails.w4Ok})`);
  L.push(`ENGAGEMENT: killsDetected=${a.engage.killsDetected} disengages=${a.engage.disengages} rests=${a.engage.rests} recoverDays=${a.engage.recoverDays} homeWalks=${a.engage.homeWalks} recoveriesEnded=${a.engage.recoveriesEnded}`);
  for (const arm of ['control', 'armed']) {
    const w = a.wall[arm];
    L.push(`WALL ${arm}: n=${w.n} national=${w.national} won=${w.won} reach1-5=[${w.waveReach.join(',')}] med=${w.medSurv} max=${w.maxSurv} causes=${JSON.stringify(w.causes)}`);
  }
  return L.join('\n');
}

if (require.main === module) {
  const a = analyze();
  if (process.argv.includes('--json')) console.log(JSON.stringify(a, null, 2));
  else console.log(report(a));
}
module.exports = { analyze, w4Kills, aliveAt30 };
