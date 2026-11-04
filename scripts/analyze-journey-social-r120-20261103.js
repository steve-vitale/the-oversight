// analyze-journey-social-r120-20261103.js -- r113 panel analyzer (Lane B).
// Reads worktree evidence/2026-11-03/journey-social-life-r120-*.json and
// prints: lure/party decision counts by kind, dark-channel verdict inputs
// (plots with corrected grievance pairs, grievance-holder -> later leader),
// death-cluster census, and social volume. No src/js changes.
// Usage: node scripts/analyze-journey-social-r120-20261103.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-03');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-life-r120-\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no r120 per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
console.log('SEEDS: ' + seeds.map(s => (s.seed || '?') + ' d' + (s.gameDay || s.days)).join(', '));
let allLures = [], allPlots = [], holderLeads = [], latePlots = [];
for (const s of seeds) {
  const ld = s.lureDecisions || [];
  allLures.push(...ld.map(d => ({ ...d, seed: s.seed })));
  console.log(`\nseed ${s.seed}: days=${s.gameDay} endReason=${s.endReason} fullConvs=${(s.social || {}).fullConvs} naturalEnds=${(s.social || {}).naturalEnds} feasts=${(s.social || {}).feasts} moots=${(s.social || {}).moots}`);
  console.log('  decisions: ' + JSON.stringify(count(ld, d => (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline'))));
  // plots: union across snapshots + end, dedup by id
  const seen = new Map();
  for (const snap of [...(s.darkSnaps || []), s.darkEnd].filter(Boolean)) {
    for (const p of (snap.plots || [])) if (!seen.has(p.id)) seen.set(p.id, p);
  }
  const plots = [...seen.values()];
  allPlots.push(...plots.map(p => ({ ...p, seed: s.seed })));
  for (const p of plots) {
    console.log(`  plot ${p.id} d${p.day} leader=${p.leader} inviter=${p.inviter} target=${p.target} sprung=${p.sprung} gT->L=${p.grievanceTargetToLeader} gT->I=${p.grievanceTargetToInviter} gA->Tmax=${p.grievanceAccompliceToTargetMax} gI->T=${p.grievanceInviterToTarget}`);
    if (p.day >= 30) latePlots.push({ ...p, seed: s.seed });
  }
  // r120: arming-time motive + spring trace
  console.log('  armWrapped=' + s.armWrapped + ' springWrapped=' + s.springWrapped);
  for (const a of (s.armEvents || [])) {
    console.log(`  ARM d${a.day} ${a.plotId} ${a.leader}->${a.target} inviter=${a.inviter} motive=${JSON.stringify(a.motiveAtArming)} gT->L=${a.grievanceTargetToLeader} gL->T=${a.grievanceLeaderToTarget} accMotives=${JSON.stringify(a.accompliceMotives)} trust=${JSON.stringify(a.trust)} goal=${a.leaderGoal}`);
  }
  const endCases = ((s.darkEnd || {}).cases || []);
  const caseByPlot = {};
  for (const snap of [...(s.darkSnaps || []), s.darkEnd].filter(Boolean)) for (const c of (snap.cases || [])) if (!caseByPlot[c.plotId]) caseByPlot[c.plotId] = c;
  for (const sp of (s.springEvents || [])) {
    const c = caseByPlot[sp.plotId];
    const heardPassed = c && c.playerHeardDay != null && (s.gameDay || 0) >= c.playerHeardDay;
    const ambLines = (s.ambushLines || []).filter(l => { const t = String((l.t || l.text || '')); return t.includes(sp.leader) || t.includes(sp.target); }).length;
    console.log(`  SPRING d${sp.day} ${sp.plotId} ${sp.leader}->${sp.target} outcome=${sp.outcome} case=${sp.caseId} endCase=${c ? (c.id + ' charge=' + c.charge + ' status=' + c.status + ' heardDay=' + c.playerHeardDay + ' heardPassed=' + heardPassed) : 'NONE'} ambushLinesNaming=${ambLines}`);
  }
  // grievance-holder -> later leader: grievance day < plot day, holder == leader
  const griev = [];
  const gseen = new Set();
  for (const snap of [...(s.darkSnaps || []), s.darkEnd].filter(Boolean)) for (const g of (snap.grievances || [])) {
    const k = [g.by, g.against, g.kind, g.day, g.severity].join('|');
    if (!gseen.has(k)) { gseen.add(k); griev.push(g); }
  }
  for (const p of plots) {
    const prior = griev.filter(g => g.by === p.leader && (g.day || 0) < (p.day || 0));
    if (prior.length) holderLeads.push({ seed: s.seed, plot: p.id, leader: p.leader, plotDay: p.day, grievances: prior.map(g => `${g.kind}->${g.against} d${g.day} sev${g.severity}`) });
  }
  const fallen = s.fallenFull || [];
  console.log('  village fallen: ' + fallen.length + ' by cause: ' + JSON.stringify(count(fallen, d => d.cause || '?')));
  const byDay = {};
  for (const d of fallen) (byDay[d.day] = byDay[d.day] || []).push(d.cause || '?');
  const clusters = Object.entries(byDay).filter(([, v]) => v.length >= 3).map(([d, v]) => `d${d}x${v.length}`).join(' ');
  console.log('  death clusters (>=3/day): ' + (clusters || 'none'));
  console.log('  ambush-caused fallen: ' + JSON.stringify(fallen.filter(d => (d.cause || '') === 'ambush')));
  console.log('  (samples.deaths, all recorded incl. outsiders: ' + ((s.samples && s.samples.deaths) || []).length + ' — NOT village deaths)');
  console.log('  census: ' + (s.census || []).slice(0, 2).join(' | '));
}
console.log('\nPANEL lure/party decisions: ' + JSON.stringify(count(allLures, d => (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline'))));
console.log('PANEL plots: ' + allPlots.length + ' (late d30+: ' + latePlots.length + ')');
console.log('PANEL plots with grievanceTargetToLeader > 0: ' + allPlots.filter(p => (p.grievanceTargetToLeader || 0) > 0).length);
console.log('PANEL grievance-holder -> later leader cases: ' + holderLeads.length);
for (const h of holderLeads) console.log('  ' + JSON.stringify(h));
const allArms = seeds.flatMap(s => (s.armEvents || []).map(a => ({ ...a, seed: s.seed })));
const allSprings = seeds.flatMap(s => (s.springEvents || []).map(a => ({ ...a, seed: s.seed })));
console.log('PANEL arms: ' + allArms.length + ' (late d30+: ' + allArms.filter(a => a.day >= 30).length + ') grievance-linked at arming: ' + allArms.filter(a => (a.grievanceTargetToLeader || 0) > 0 || (a.accompliceMotives || []).some(m => (m.grievance || 0) > 0)).length);
console.log('PANEL springs: ' + allSprings.length + ' outcomes: ' + JSON.stringify(count(allSprings, x => x.outcome || '?')));
console.log('PANEL escaped springs: ' + allSprings.filter(x => x.outcome === 'escaped').length);
console.log('PANEL villages past d100: ' + seeds.filter(s => (s.gameDay || 0) >= 100).length + '/' + seeds.length);
