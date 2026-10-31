#!/usr/bin/env node
// analyze-journey-social-r80-20261030.js -- MOOT-CONVENING analyzer (lane B, social r80).
// Reads evidence/2026-10-30/r80/journey-social-r80-s<seed>.json and prints:
//  - B1 reconciliation per seed: sayNpcAnnounce vs mootConveneSum vs
//    casesWithTrial vs sayNpcCallEcho (each npc convening yields one
//    announcement + one callMoot echo + one mootConveneCounts entry +
//    one c.trial); sayTotalConvenings = npc + player.
//  - B2 reachability: seeds with >= 1 NPC moot convened.
//  - B3 decomposition (if 0 convenings): plots armed / sprung / expired,
//    cases opened / open-at-end / with trial, dominant break stage.
//  - Guardrails: dryRate, invite rates, outing funnel, villageMootsField.
// Pure JSON aggregation; no game code, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-30', 'r80');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-r80-s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
let pooled = { npcAnn: 0, npcEcho: 0, playerCall: 0, sysBc: 0, sayTotal: 0, conveneSum: 0, casesTrial: 0, cases: 0, plots: 0, plotsSprung: 0, plotsExpired: 0, villageMoots: 0, seedsWithMoot: 0 };
for (const s of seeds) {
  const mc = s.mootCensus || {};
  // Reclassify stored moot lines by exact text: the betrayal player line is
  // 'You call a moot. The fire...' while the petition line is
  // 'You call a moot on it. ...' (substring matcher counts both as player-call).
  const petLines = (s.mootLines || []).filter(l => l.kind === 'player-call' && l.text.indexOf('You call a moot on it') >= 0).length;
  const betrayalPlayer = (mc.sayPlayerCall || 0) - petLines;
  const cases = mc.cases || [], plots = mc.plots || [];
  const recon = (mc.sayNpcAnnounce === mc.mootConveneSum) &&
    (mc.sayTotalConvenings === mc.casesWithTrial) &&
    (mc.sayNpcCallEcho === mc.sayNpcAnnounce);
  const hasMoot = (mc.sayNpcAnnounce || 0) > 0;
  if (hasMoot) pooled.seedsWithMoot++;
  pooled.npcAnn += mc.sayNpcAnnounce || 0; pooled.npcEcho += mc.sayNpcCallEcho || 0;
  pooled.playerCall += mc.sayPlayerCall || 0; pooled.sysBc += mc.saySysBroadcast || 0;
  pooled.sayTotal += mc.sayTotalConvenings || 0; pooled.conveneSum += mc.mootConveneSum || 0;
  pooled.casesTrial += mc.casesWithTrial || 0; pooled.cases += cases.length;
  pooled.plots += plots.length; pooled.plotsSprung += plots.filter(p => p.sprung).length;
  pooled.plotsExpired += plots.filter(p => p.expired).length;
  pooled.villageMoots += mc.villageMootsField || 0;
  const openCases = cases.filter(c => c.status === 'open');
  const byStatus = {};
  for (const c of cases) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  console.log(`SEED ${s.seed}: days=${s.days} alive=${s.alive} villageMootsField=${mc.villageMootsField} betrayalPlayerCall=${betrayalPlayer} petitionCall=${petLines} ` +
    `sayNpc=${mc.sayNpcAnnounce} sayEcho=${mc.sayNpcCallEcho} sayPlayer=${mc.sayPlayerCall} sysBc=${mc.saySysBroadcast} ` +
    `sayTotal=${mc.sayTotalConvenings} conveneSum=${mc.mootConveneSum} casesTrial=${mc.casesWithTrial} ` +
    `B1=${recon ? 'RECONCILED' : 'MISMATCH'} hasMoot=${hasMoot}`);
  console.log(`  PLOTS ${plots.length} (sprung ${plots.filter(p => p.sprung).length}, expired ${plots.filter(p => p.expired).length}, active-unresolved ${plots.filter(p => p.active && !p.resolved).length}) ` +
    `CASES ${cases.length} byStatus=${JSON.stringify(byStatus)} openAtEnd=${openCases.length}`);
  for (const c of cases) console.log(`    CASE ${c.id} ${c.charge} d${c.day}: accused=[${(c.accused || []).join(',')}] target=${c.target} status=${c.status} mootIn=${c.mootIn} trial=${c.trial ? JSON.stringify(c.trial) : 'null'} resolution=${c.resolution}`);
  for (const l of (s.mootLines || [])) console.log(`    MOOT-LINE d${l.day} ${l.kind}: ${l.text.slice(0, 160)}`);
  const dc0 = s.dryCensus || {};
  const dryPerConvo = dc0.totalConvos ? ((dc0.dry9Lines || 0) / dc0.totalConvos).toFixed(3) : 'n/a';
  console.log(`  GUARD dryPerConvo=${dryPerConvo} (r75 band [0.20,0.40] pooled) dryRateScaled=${s.dryRate} invites=${JSON.stringify(s.inviteCensus ? { lure: s.inviteCensus.lure, party: s.inviteCensus.party } : null)} outing=${JSON.stringify(s.favorFunnel || null)}`);
}
console.log(`POOLED: seeds=${seeds.length} seedsWithMoot=${pooled.seedsWithMoot} sayNpc=${pooled.npcAnn} sayEcho=${pooled.npcEcho} sayPlayer=${pooled.playerCall} sysBc=${pooled.sysBc} sayTotal=${pooled.sayTotal} conveneSum=${pooled.conveneSum} casesTrial=${pooled.casesTrial} cases=${pooled.cases} plots=${pooled.plots} sprung=${pooled.plotsSprung} expired=${pooled.plotsExpired} villageMootsField=${pooled.villageMoots}`);
console.log(`B2 REACHABLE: ${pooled.seedsWithMoot >= 2 ? 'YES (>=2 seeds with an NPC moot)' : 'NO (' + pooled.seedsWithMoot + ' seeds with an NPC moot)'}`);
console.log(`B1 NOTE: a seed shows MISMATCH iff an NPC trial was overwritten by a later same-case convening (nested day-rollover inside callMoot, r80 mechanism) — see run note; the as-written B1 equality is then NO-GO with cause, and the revised rule (casesTrial == sayTotal - overwrittenTrials) is proposed for the next run, not applied retroactively.`);
if (pooled.sayTotal === 0) {
  console.log('B3 DECOMPOSITION (0 convenings): ' +
    (pooled.plots === 0 ? 'NO PLOTS ARMED — the break is at arming (motive/accomplice/roll).' :
     pooled.plotsSprung === 0 ? `PLOTS ARMED (${pooled.plots}) BUT NONE SPRUNG — the break is at springing (lure-accept/expiry).` :
     pooled.cases === 0 ? `PLOTS SPRUNG (${pooled.plotsSprung}) BUT NO CASES — the break is at openCase.` :
     'CASES OPENED BUT NEVER CONVENED — the break is at ripening/caller guards.'));
}
