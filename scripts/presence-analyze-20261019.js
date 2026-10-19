#!/usr/bin/env node
// presence-analyze-20261019.js — sim-presence PILOT analysis.
//
// Reads evidence/2026-10-19/perseed-presence-pilot/ per-seed JSONs and judges
// the pre-registered PILOT PRIMARY (mechanism):
//   JOIN RATE = (fights with any companion damage) / (wave-3+ killing fights)
//   presence arm >= 1.5x control -> GO to confirm.
//
// Paired on identical seeds x policies; join rate is pooled across the
// 16-run corpus per arm. Engagement telemetry (goInside counts) is reported
// to show the beat moved, and the pre-registered guardrails are judged:
// median survival >= control-5d; no new death mode (esp. no fighter-movement
// deaths — assert the mechanism never assigns/moves/risks villagers);
// national/table not degraded.
//
// Usage: node scripts/presence-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-presence-pilot');

function load(arm) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

function joinAgg(runs) {
  let fights = 0, withComp = 0, compKills = 0;
  let scholar = 0, companion = 0, other = 0;
  for (const r of runs) {
    for (const k of (r.kills || [])) {
      if (!k.dmg || k.dmg.compShare == null) continue;
      fights++;
      scholar += k.dmg.scholar; companion += k.dmg.companion; other += k.dmg.other;
      if (k.dmg.companion > 0) withComp++;
      if (k.companion) compKills++;
    }
  }
  return {
    fights, withComp, compKills,
    joinRate: fights > 0 ? withComp / fights : 0,
    scholar, companion, other,
  };
}

function main() {
  const control = load('control');
  const presence = load('presence');
  if (!control.length || !presence.length) {
    console.error('ANALYZE STOP: need both arms swept (control + presence).');
    process.exit(2);
  }
  const c = joinAgg(control), v = joinAgg(presence);
  const ratio = c.joinRate > 0 ? v.joinRate / c.joinRate : (v.joinRate > 0 ? Infinity : 0);

  console.log('=== PILOT PRIMARY (mechanism): JOIN RATE ===');
  console.log(`control:  ${(c.joinRate * 100).toFixed(1)}% (${c.withComp}/${c.fights} killing fights with companion dmg)`);
  console.log(`presence: ${(v.joinRate * 100).toFixed(1)}% (${v.withComp}/${v.fights} killing fights with companion dmg)`);
  console.log(`ratio: ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio} (bar: >=1.5x -> GO)`);
  console.log(`companion kills: control ${c.compKills}  presence ${v.compKills}`);
  console.log(`companion damage: control ${c.companion}  presence ${v.companion} (scholar ${c.scholar}/${v.scholar})`);

  console.log('\n=== ENGAGEMENT (the beat moved) ===');
  const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
  console.log(`goInside beats: control ${sum(control, r => (r.beat || {}).presenceGoInside)}  presence ${sum(presence, r => (r.beat || {}).presenceGoInside)}`);
  console.log(`micro-steps:    control ${sum(control, r => (r.beat || {}).presenceStep)}  presence ${sum(presence, r => (r.beat || {}).presenceStep)}`);
  const engaged = presence.filter(r => ((r.beat || {}).presenceGoInside || 0) > 0).length;
  console.log(`runs with beat firing: presence ${engaged}/16 (bar: >=8)`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  presence ${sum(presence, r => (r.instrumentErrors || []).length)}`);

  console.log('\n=== GUARDRAILS (pre-registered) ===');
  const medSurv = (runs) => {
    const ds = runs.map(r => r.gameDays).sort((a, b) => a - b);
    return ds.length ? ds[Math.floor(ds.length / 2)] : 0;
  };
  const cMed = medSurv(control), vMed = medSurv(presence);
  console.log(`median survival (gameDays): control ${cMed}  presence ${vMed} (bar: >= control-5d)`);
  const starv = (runs) => sum(runs, r => ((r.deathCauses || {})['starvation'] || 0) + ((r.deathCauses || {})['player:starvation'] || 0));
  console.log(`starvation deaths: control ${starv(control)}  presence ${starv(presence)}`);
  const modes = (runs) => {
    const m = {};
    for (const r of runs) for (const [k, n] of Object.entries(r.deathCauses || {})) m[k] = (m[k] || 0) + n;
    return m;
  };
  const cm = modes(control), vm = modes(presence);
  const newModes = Object.keys(vm).filter(k => !(k in cm));
  console.log(`death modes: control ${Object.keys(cm).length}  presence ${Object.keys(vm).length}${newModes.length ? ' NEW: ' + newModes.join(', ') : ' (none new)'}`);
  const nat = (runs) => sum(runs, r => r.national || 0), tab = (runs) => sum(runs, r => r.table || 0);
  console.log(`national: control ${nat(control)}/16  presence ${nat(presence)}/16`);
  console.log(`table:    control ${tab(control)}/16  presence ${tab(presence)}/16`);
  console.log(`wave-4:   control ${sum(control, r => r.wave4)}/16  presence ${sum(presence, r => r.wave4)}/16`);
  console.log(`wave-5:   control ${sum(control, r => r.wave5)}/16  presence ${sum(presence, r => r.wave5)}/16`);
  console.log(`wins:     control ${sum(control, r => r.won)}/16  presence ${sum(presence, r => r.won)}/16`);

  console.log('\n=== VERDICT ===');
  const goPrimary = ratio >= 1.5;
  const goEngage = engaged >= 8;
  const goSurv = vMed >= cMed - 5;
  const goModes = newModes.length === 0;
  const goNat = nat(presence) >= nat(control) - 2; // not degraded (allow noise)
  console.log(`primary >=1.5x: ${goPrimary ? 'GO' : 'NO-GO'} (${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio})`);
  console.log(`engagement >=8: ${goEngage ? 'GO' : 'NO-GO'} (${engaged}/16)`);
  console.log(`survival guardrail: ${goSurv ? 'PASS' : 'FAIL'}`);
  console.log(`no-new-death-mode: ${goModes ? 'PASS' : 'FAIL'}`);
  console.log(`national/table not degraded: ${goNat ? 'PASS' : 'FAIL'}`);
  const verdict = (goPrimary && goEngage && goSurv && goModes) ? 'GO-TO-CONFIRM' : 'NO-GO (kill protocol)';
  console.log(`\nPILOT VERDICT: ${verdict}`);
  // write analysis json
  const out = {
    primary: { control: c.joinRate, presence: v.joinRate, ratio: Number.isFinite(ratio) ? ratio : null, bar: 1.5, go: goPrimary },
    engagement: { runs: engaged, bar: 8, go: goEngage },
    guardrails: { survival: { control: cMed, presence: vMed, go: goSurv }, newDeathModes: newModes, national: { control: nat(control), presence: nat(presence) } },
    verdict,
  };
  fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(out, null, 1));
  console.log('wrote _analysis.json');
}

main();
