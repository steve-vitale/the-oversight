#!/usr/bin/env node
// w4finish-analyze-20261018.js — pilot/confirm verdicts for the w4finish arm.
// Reads evidence/2026-10-18/perseed-w4finish/<side>/<policy>/s<seed>.json.
//
// PRE-REGISTERED BARS (binding):
//   PILOT (seeds 65101-65104): PRIMARY armed w4-kill runs >= 2/8 per side;
//     guardrails: no new death mode; median survival >= control - 15d.
//   CONFIRM (seeds 65101-65108): PRIMARY armed w4-kill runs >= 5/16;
//     SECONDARY armed maxVet>=2 runs >= 2/16; guardrails: no new death
//     mode (n>=3); wins >= 9/16; median survival >= 66d.
// BASELINE NOTE (2026-10-18): the w5legs corpus is stale (pre-dayfreeze
// combat fix 1a2f2afdb) — the control side re-ran on current master is the
// paired baseline. Absolute pre-registered bars still bind; the analyzer
// reports both the absolute verdict and the fresh-control-relative delta,
// and the baseline shift goes under metric review (never re-scored).
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w4finish');
const SEEDS = [65101, 65102, 65103, 65104, 65105, 65106, 65107, 65108];
const POLICIES = ['belongfeast', 'leadfeast'];
const PILOT_SEEDS = [65101, 65102, 65103, 65104];

function load(side) {
  const out = [];
  for (const p of POLICIES) for (const s of SEEDS) {
    const f = path.join(EVID, side, p, `s${s}.json`);
    if (!fs.existsSync(f)) continue;
    out.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function deathModes(rs) {
  const m = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.deaths || {})) m[k] = (m[k] || 0) + v;
  return m;
}
function summarize(rs) {
  return {
    n: rs.length,
    w4killRuns: rs.filter(r => ((r.endLegs || {}).w4k | 0) > 0).length,
    vet2Runs: rs.filter(r => ((r.endLegs || {}).vet | 0) >= 2).length,
    wins: rs.filter(r => r.won).length,
    national: rs.filter(r => r.national).length,
    table: rs.filter(r => r.table).length,
    wave4: rs.filter(r => r.wave45).length,
    wave5: rs.filter(r => r.wave5).length,
    medSurv: median(rs.map(r => r.gameDays)),
    deaths: deathModes(rs),
  };
}

function main() {
  const ctl = load('control'), arm = load('armed');
  if (!ctl.length || !arm.length) {
    console.error(`ANALYZE STOP: control=${ctl.length} armed=${arm.length} runs present`);
    process.exit(2);
  }
  const pilotCtl = ctl.filter(r => PILOT_SEEDS.includes(r.seed));
  const pilotArm = arm.filter(r => PILOT_SEEDS.includes(r.seed));
  const fullCtl = ctl, fullArm = arm;

  console.log('=== SIDES ===');
  for (const [name, rs] of [['control', ctl], ['armed', arm]]) {
    const s = summarize(rs);
    console.log(`${name}: n=${s.n} w4killRuns=${s.w4killRuns} vet2=${s.vet2Runs} wins=${s.wins} nat=${s.national} table=${s.table} wave4=${s.wave4} wave5=${s.wave5} medSurv=${s.medSurv}`);
    console.log(`  deaths: ${JSON.stringify(s.deaths)}`);
  }

  // Layer activity (armed side only)
  let commits = 0, overrides = 0, broken = 0;
  const byVid = {};
  for (const r of arm) {
    const w = r.w4f || {};
    commits += w.w4fCommits || 0; overrides += w.w4fOverrides || 0; broken += w.w4fBroken || 0;
    for (const [vid, n] of Object.entries(w.byVid || {})) byVid[vid] = (byVid[vid] || 0) + n;
  }
  console.log(`ARMED layer activity: commits=${commits} overrides=${overrides} broken=${broken}`);
  console.log(`ARMED w4 kills by vid: ${JSON.stringify(byVid)}`);

  console.log('\n=== PILOT VERDICT (seeds 65101-65104) ===');
  if (pilotCtl.length === 8 && pilotArm.length === 8) {
    for (const p of POLICIES) {
      const c = pilotCtl.filter(r => r.policyId === p), a = pilotArm.filter(r => r.policyId === p);
      const ck = summarize(c), ak = summarize(a);
      const go = ak.w4killRuns >= 2;
      console.log(`${p}: armed w4killRuns=${ak.w4killRuns}/8 (bar >=2/8) -> ${go ? 'GO' : 'NO-GO'}; control w4killRuns=${ck.w4killRuns}/8; medSurv armed=${ak.medSurv} control=${ck.medSurv} (guardrail >= ${ck.medSurv - 15})`);
    }
    const cDeaths = deathModes(pilotCtl), aDeaths = deathModes(pilotArm);
    const newModes = Object.keys(aDeaths).filter(k => !(k in cDeaths));
    console.log(`pilot death modes: new in armed: ${newModes.length ? newModes.join(',') : 'none'}`);
  } else {
    console.log(`pilot incomplete: control=${pilotCtl.length}/8 armed=${pilotArm.length}/8`);
  }

  console.log('\n=== CONFIRM VERDICT (seeds 65101-65108) ===');
  if (fullCtl.length === 16 && fullArm.length === 16) {
    const c = summarize(fullCtl), a = summarize(fullArm);
    const pGo = a.w4killRuns >= 5, sGo = a.vet2Runs >= 2;
    const gDeaths = Object.keys(a.deaths).filter(k => !(k in c.deaths) && (a.deaths[k] | 0) >= 3);
    const gWins = a.wins >= 9, gSurv = a.medSurv >= 66;
    console.log(`PRIMARY armed w4killRuns=${a.w4killRuns}/16 (bar >=5/16) -> ${pGo ? 'GO' : 'NO-GO'} (control ${c.w4killRuns}/16)`);
    console.log(`SECONDARY armed maxVet>=2 runs=${a.vet2Runs}/16 (bar >=2/16) -> ${sGo ? 'GO' : 'NO-GO'} (control ${c.vet2Runs}/16)`);
    console.log(`GUARDRAIL deaths: new modes n>=3 in armed: ${gDeaths.length ? gDeaths.join(',') : 'none'} -> ${gDeaths.length ? 'FAIL' : 'PASS'}`);
    console.log(`GUARDRAIL wins: armed=${a.wins}/16 (bar >=9/16) -> ${gWins ? 'PASS' : 'FAIL'} (control ${c.wins}/16)`);
    console.log(`GUARDRAIL median survival: armed=${a.medSurv}d (bar >=66d) -> ${gSurv ? 'PASS' : 'FAIL'} (control ${c.medSurv}d)`);
    const verdict = (pGo && sGo && !gDeaths.length && gWins && gSurv) ? 'CONFIRM GO' : 'CONFIRM NO-GO';
    console.log(`VERDICT: ${verdict}`);
  } else {
    console.log(`confirm incomplete: control=${fullCtl.length}/16 armed=${fullArm.length}/16`);
  }
}

if (require.main === module) main();
module.exports = { load, summarize };
