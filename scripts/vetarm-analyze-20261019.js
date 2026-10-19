#!/usr/bin/env node
// vetarm-analyze-20261019.js — sim-vetarm PILOT analysis.
//
// Reads evidence/2026-10-19/perseed-vetarm-pilot/ per-seed JSONs and judges
// the pre-registered PILOT PRIMARY (mechanism):
//   companion wave-3 damage-share (armed) >= 2x control -> GO to confirm.
//
// Paired on identical seeds x policies; damage-share is pooled across the
// 16-run corpus per arm (the killdisc diagnostic's own unit of analysis).
// Engagement telemetry (donations, patrols, armory, companion arming) is
// reported to show WHICH beat moved, if any.
//
// Usage: node scripts/vetarm-analyze-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-19', 'perseed-vetarm-pilot');

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
  const vetarm = load('vetarm');
  if (!control.length || !vetarm.length) {
    console.error('ANALYZE STOP: need both arms swept (control + vetarm).');
    process.exit(2);
  }
  const c = dmgAgg(control), v = dmgAgg(vetarm);
  const ratio = c.compShare > 0 ? v.compShare / c.compShare : (v.compShare > 0 ? Infinity : 0);

  console.log('=== PILOT PRIMARY (mechanism): companion wave-3 damage-share ===');
  console.log(`control: ${(c.compShare * 100).toFixed(2)}% (${c.companion}/${c.scholar + c.companion + c.other} dmg, ${c.fights} killing fights, ${c.withComp} with companion dmg)`);
  console.log(`vetarm:  ${(v.compShare * 100).toFixed(2)}% (${v.companion}/${v.scholar + v.companion + v.other} dmg, ${v.fights} killing fights, ${v.withComp} with companion dmg)`);
  console.log(`ratio: ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio} (bar: >=2x -> GO)`);
  console.log(`other-share (instrument trust): control ${(c.otherShare * 100).toFixed(2)}% vetarm ${(v.otherShare * 100).toFixed(2)}%`);

  console.log('\n=== ENGAGEMENT (which beat moved) ===');
  const sum = (runs, f) => runs.reduce((a, r) => a + (f(r) || 0), 0);
  console.log(`donations:      control ${sum(control, r => r.donations)}  vetarm ${sum(vetarm, r => r.donations)}`);
  console.log(`patrol assigns: control ${sum(control, r => r.patrolAssigns)}  vetarm ${sum(vetarm, r => r.patrolAssigns)}`);
  console.log(`armory end (units, sum): control ${sum(control, r => r.armoryEnd)}  vetarm ${sum(vetarm, r => r.armoryEnd)}`);
  console.log(`armed companions (>=12 wb, sum): control ${sum(control, r => r.armedCompanions)}  vetarm ${sum(vetarm, r => r.armedCompanions)}`);
  const med = (runs) => {
    const ws = runs.map(r => r.medianCompanionWbonus).sort((a, b) => a - b);
    return ws.length ? ws[Math.floor(ws.length / 2)] : 0;
  };
  console.log(`median companion wbonus (median of run-medians): control ${med(control)}  vetarm ${med(vetarm)}`);
  console.log(`instrument errors: control ${sum(control, r => (r.instrumentErrors || []).length)}  vetarm ${sum(vetarm, r => (r.instrumentErrors || []).length)}`);

  console.log('\n=== SECONDARY (context for the confirm) ===');
  console.log(`w3 kills: control ${sum(control, r => r.w3Kills)}  vetarm ${sum(vetarm, r => r.w3Kills)}`);
  console.log(`w3 companion kills: control ${sum(control, r => r.w3CompanionKills)}  vetarm ${sum(vetarm, r => r.w3CompanionKills)}`);
  console.log(`living veterans (end, sum): control ${sum(control, r => r.livingVeterans)}  vetarm ${sum(vetarm, r => r.livingVeterans)}`);
  console.log(`wave4 reach: control ${control.filter(r => r.wave4).length}/${control.length}  vetarm ${vetarm.filter(r => r.wave4).length}/${vetarm.length}`);
  console.log(`national: control ${control.filter(r => r.national).length}/${control.length}  vetarm ${vetarm.filter(r => r.national).length}/${vetarm.length}`);
  const medSurv = (runs) => {
    const ds = runs.map(r => r.gameDays).sort((a, b) => a - b);
    return ds.length ? ds[Math.floor(ds.length / 2)] : 0;
  };
  console.log(`median survival (gameDays): control ${medSurv(control)}  vetarm ${medSurv(vetarm)}`);

  const verdict = ratio >= 2 ? 'GO' : 'NO-GO';
  console.log(`\nPILOT VERDICT: ${verdict} (ratio ${Number.isFinite(ratio) ? ratio.toFixed(2) + 'x' : ratio} vs bar 2x)`);
  const out = {
    control: { n: control.length, compShare: c.compShare, fights: c.fights, withComp: c.withComp, otherShare: c.otherShare },
    vetarm: { n: vetarm.length, compShare: v.compShare, fights: v.fights, withComp: v.withComp, otherShare: v.otherShare },
    ratio: Number.isFinite(ratio) ? ratio : String(ratio),
    verdict,
  };
  fs.writeFileSync(path.join(EVID, '_analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote _analysis.json');
}
main();
