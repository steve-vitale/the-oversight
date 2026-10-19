#!/usr/bin/env node
// armory-analyze-20261019.js — sim-armory PILOT analysis.
//
// Reads evidence/2026-10-19/perseed-armory-pilot/ per-seed JSONs and judges
// the pre-registered PILOT PRIMARY (mechanism):
//   companion wave-3 damage-share (armed) >= 2x control -> GO to confirm.
//
// Paired on identical seeds x policies; damage-share is pooled across the
// 16-run corpus per arm (the killdisc diagnostic's own unit of analysis).
// Engagement telemetry (donations, armory, companion arming) is reported
// to show the beat moved, and the pre-registered guardrails are judged:
// median survival >= control-10d; starvation deaths <= control+2; no new
// death mode (esp. no patrol-combat deaths — assert the mechanism doesn't
// move fighters).
//
// Usage: node scripts/armory-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-armory-pilot');

function load(arm) {
  const files = fs.readdirSync(EVID).filter(f => f.startsWith(arm + '-') && f.endsWith('.json') && !f.startsWith('_'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));
}

function dmgAgg(runs) {
  let scholar = 0, companion = 0, other = 0, fights = 0, withComp = 0;
  for (const r of runs) {
    for (const k of (r.kills || [])) {
      if (!k.dmg || k.dmg.compShare == null) continue;
      fights++;
      scholar += k.dmg.scholar; companion += k.dmg.companion; other += k.dmg.other;
      if (k.dmg.companion > 0) withComp++;
    }
  }
  const tot = scholar + companion + other;
  return {
    fights, withComp,
    scholar, companion, other,
    compShare: tot > 0 ? companion / tot : 0,
    scholarShare: tot > 0 ? scholar / tot : 0,
    otherShare: tot > 0 ? other / tot : 0,
  };
}

function main() {
  const control = load('control');
  const armed = load('armed');
  if (!control.length || !armed.length) {
    console.error('ANALYZE STOP: need both arms swept (control + armed).');
    process.exit(2);
  }
  const c = dmgAgg(control), v = dmgAgg(armed);
  const ratio = c.compShare > 0 ? v.compShare / c.compShare : (v.compShare > 0 ? Infinity : 0);

  console.log('=== PILOT PRIMARY (mechanism): companion wave-3 damage-share ===');
  console.log(`control: ${(c.compShare * 100).toFixed(2)}% (${c.companion}/${c.scholar + c.companion + c.other} dmg, ${c.fights} killing fights, ${c.withComp} with companion dmg)`);
  console.log(`armed:   ${(v.compShare * 100).toFixed(2)}% (${v.companion}/${v.scholar + v.companion + v.other} dmg, ${v.fights} killing fights, ${v.withComp} with companion dmg)`);
  console.log(`ratio: ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio} (bar: >=2x -> GO)`);
  console.log(`other-share (instrument trust): control ${(c.otherShare * 100).toFixed(2)}% armed ${(v.otherShare * 100).toFixed(2)}%`);

  console.log('\n=== ENGAGEMENT (the beat moved) ===');
  const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
  console.log(`donations:      control ${sum(control, r => r.donations)}  armed ${sum(armed, r => r.donations)}`);
  console.log(`armory end (units, sum): control ${sum(control, r => r.armoryEnd)}  armed ${sum(armed, r => r.armoryEnd)}`);
  console.log(`armed companions (>=12 wb, sum): control ${sum(control, r => r.armedCompanions)}  armed ${sum(armed, r => r.armedCompanions)}`);
  const med = (runs) => {
    const ws = runs.map(r => r.medianCompanionWbonus).sort((a, b) => a - b);
    return ws.length ? ws[Math.floor(ws.length / 2)] : 0;
  };
  console.log(`median companion wbonus (median of run-medians): control ${med(control)}  armed ${med(armed)}`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  armed ${sum(armed, r => (r.instrumentErrors || []).length)}`);

  console.log('\n=== GUARDRAILS (pre-registered) ===');
  const medSurv = (runs) => {
    const ds = runs.map(r => r.gameDays).sort((a, b) => a - b);
    return ds.length ? ds[Math.floor(ds.length / 2)] : 0;
  };
  const msC = medSurv(control), msA = medSurv(armed);
  const starv = (runs) => sum(runs, r => ((r.deathCauses || {}).starvation | 0) + ((r.deathCauses || {})['starved'] | 0));
  const stC = starv(control), stA = starv(armed);
  const modes = (runs) => {
    const s = new Set();
    for (const r of runs) for (const k of Object.keys(r.deathCauses || {})) s.add(k);
    return [...s].sort();
  };
  const modesC = modes(control), modesA = modes(armed);
  const newModes = modesA.filter(m => !modesC.includes(m));
  console.log(`median survival (gameDays): control ${msC}  armed ${msA} (bar: >= ${msC - 10}) -> ${msA >= msC - 10 ? 'PASS' : 'MISS'}`);
  console.log(`starvation deaths: control ${stC}  armed ${stA} (bar: <= ${stC + 2}) -> ${stA <= stC + 2 ? 'PASS' : 'MISS'}`);
  console.log(`death modes control: ${modesC.join(', ')}`);
  console.log(`death modes armed:    ${modesA.join(', ')}`);
  console.log(`new modes on armed: ${newModes.length ? newModes.join(', ') : 'none'} (bar: none, esp. no patrol-combat) -> ${newModes.length ? 'MISS' : 'PASS'}`);

  console.log('\n=== SECONDARY (wall numbers + context for the confirm) ===');
  console.log(`w3 kills: control ${sum(control, r => r.w3Kills)}  armed ${sum(armed, r => r.w3Kills)}`);
  console.log(`w3 companion kills: control ${sum(control, r => r.w3CompanionKills)}  armed ${sum(armed, r => r.w3CompanionKills)}`);
  console.log(`living veterans (end, sum): control ${sum(control, r => r.livingVeterans)}  armed ${sum(armed, r => r.livingVeterans)}`);
  console.log(`wave4 reach: control ${control.filter(r => r.wave4).length}/${control.length}  armed ${armed.filter(r => r.wave4).length}/${armed.length}`);
  console.log(`wave5 reach: control ${control.filter(r => r.wave5).length}/${control.length}  armed ${armed.filter(r => r.wave5).length}/${armed.length}`);
  console.log(`national: control ${control.filter(r => r.national).length}/${control.length}  armed ${armed.filter(r => r.national).length}/${armed.length}`);
  console.log(`table: control ${control.filter(r => r.table).length}/${control.length}  armed ${armed.filter(r => r.table).length}/${armed.length}`);
  console.log(`won: control ${control.filter(r => r.won).length}/${control.length}  armed ${armed.filter(r => r.won).length}/${armed.length}`);
  const maxSurv = (runs) => Math.max(...runs.map(r => r.gameDays));
  console.log(`median/max survival (gameDays): control ${msC}/${maxSurv(control)}  armed ${msA}/${maxSurv(armed)}`);

  const primaryGo = ratio >= 2;
  const guardrails = msA >= msC - 10 && stA <= stC + 2 && newModes.length === 0;
  const verdict = (primaryGo && guardrails) ? 'GO' : 'NO-GO';
  console.log(`\nPILOT VERDICT: ${verdict} (primary ratio ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio} vs bar 2x; guardrails ${guardrails ? 'all PASS' : 'a MISS'})`);
  const out = {
    control: { n: control.length, compShare: c.compShare, fights: c.fights, withComp: c.withComp, otherShare: c.otherShare },
    armed: { n: armed.length, compShare: v.compShare, fights: v.fights, withComp: v.withComp, otherShare: v.otherShare },
    ratio: Number.isFinite(ratio) ? ratio : String(ratio),
    guardrails: { medianSurvival: { control: msC, armed: msA }, starvation: { control: stC, armed: stA }, newModes },
    verdict,
  };
  fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote _analysis.json');
}
main();
