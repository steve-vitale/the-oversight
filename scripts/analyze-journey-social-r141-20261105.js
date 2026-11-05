// analyze-journey-social-r141-20261105.js -- r141 panel analyzer (Lane B).
// Reads worktree evidence/2026-11-05/journey-social-life-r141-*.json and
// prints: lure/party decision counts by kind, dark-channel verdict inputs
// (plots with corrected grievance pairs, grievance-holder -> later leader),
// death-cluster census, social volume, and the BOND section (r141):
// lure decisions split player-vs-NPC inviter per kind, propose* calls by
// initiator, end bonds + whether the engine records a bond initiator.
// No src/js changes.
// Usage: node scripts/analyze-journey-social-r141-20261105.js
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-05');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-life-r141-\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no r141 per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
console.log('SEEDS: ' + seeds.map(s => (s.seed || '?') + ' d' + (s.gameDay || s.days)).join(', '));
let allLures = [], allPlots = [], holderLeads = [], latePlots = [];
let allPropose = [], allBondEnds = [];
for (const s of seeds) {
  const ld = s.lureDecisions || [];
  allLures.push(...ld.map(d => ({ ...d, seed: s.seed })));
  console.log(`\nseed ${s.seed}: days=${s.gameDay} endReason=${s.endReason} fullConvs=${(s.social || {}).fullConvs} naturalEnds=${(s.social || {}).naturalEnds} feasts=${(s.social || {}).feasts} moots=${(s.social || {}).moots}`);
  console.log('  decisions: ' + JSON.stringify(count(ld, d => (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline'))));
  // r141 BOND: lure decisions split player-vs-NPC inviter, per kind.
  // Succession-proof: inviterWasBearer was recorded at call time (the
  // bearer can change mid-run); fall back to end-scholar comparison
  // only for JSONs that predate the flag (marked unknown otherwise).
  const scholar = s.scholarName || null;
  const byInviter = count(ld, d => ((d.inviterWasBearer === true) ? 'player' : (d.inviterWasBearer === false ? 'NPC' : 'unknown')) + ':' + (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline'));
  console.log('  BOND lure-by-inviter (scholar=' + (scholar || '?') + ' initialBearer=' + (s.initialBearer || '?') + '): ' + JSON.stringify(byInviter));
  console.log('  BOND successions: ' + JSON.stringify(s.successions || []));
  const pc = s.proposeCalls || [];
  allPropose.push(...pc.map(c => ({ ...c, seed: s.seed })));
  console.log('  BOND proposeWrapped=' + JSON.stringify(s.proposeWrapped) + ' proposeCalls=' + pc.length + (pc.length ? ' ' + JSON.stringify(count(pc, c => (c.method || '?') + ':' + (c.initiatorKind || '?'))) : ''));
  const be = s.bondEnd || {};
  allBondEnds.push({ seed: s.seed, bonds: be.bonds, sample: s.bondSample || null });
  console.log('  BOND end bonds=' + be.bonds + ' sample=' + JSON.stringify(s.bondSample || null));
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
    // M2-corrected: surfaced if ANY snapshot shows knownToPlayer or a non-bystander role
    let surfaced = false, surfacedDay = null;
    for (const snap of [...(s.darkSnaps || []), s.darkEnd].filter(Boolean)) {
      for (const cc of (snap.cases || [])) {
        if (cc.plotId === sp.plotId && (cc.knownToPlayer || (cc.playerRole && cc.playerRole !== 'bystander'))) { surfaced = true; surfacedDay = snap.day; break; }
      }
      if (surfaced) break;
    }
    console.log(`  SPRING d${sp.day} ${sp.plotId} ${sp.leader}->${sp.target} outcome=${sp.outcome} case=${sp.caseId} endCase=${c ? (c.id + ' charge=' + c.charge + ' status=' + c.status + ' heardDay=' + c.playerHeardDay + ' heardPassed=' + heardPassed) : 'NONE'} surfaced=${surfaced} surfacedSnapDay=${surfacedDay} ambushLinesNaming=${ambLines}`);
  }
  // r132: expired plots — the invisible kind. Any line naming the pair after expiry?
  console.log('  expireWrapped=' + s.expireWrapped + ' expiredEvents=' + (s.expiredEvents || []).length);
  for (const e of (s.expiredEvents || [])) {
    const afterLines = (s.ambushLines || []).filter(l => (l.d || 0) >= e.day && (String(l.t || '').includes(e.leader) || String(l.t || '').includes(e.target))).length;
    console.log(`  EXPIRED d${e.day} ${e.plotId} ${e.leader}->${e.target} armedD${e.armedDay} linesNamingPairAfterExpiry=${afterLines}`);
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
  // r141 M6: haven-news on stranded days (emit-time classification).
  const nn = s.nightlyNews || [];
  const sd = nn.filter(n => n.stranded);
  const sumAll = (k) => nn.reduce((a, n) => a + (n[k] || 0), 0);
  console.log('  M6 nightlyNews: strandedDays=' + sd.length + ' burst=' + sumAll('burst') + ' settle=' + sumAll('settle') + ' witness=' + sumAll('witness') + ' tale=' + sumAll('tale') + ' | emitted-AWAY burst=' + sumAll('burstAway') + ' settle=' + sumAll('settleAway') + ' witness=' + sumAll('witnessAway') + ' tale=' + sumAll('taleAway') + ' debatesKicked=' + (s.namingEnd || []).filter(m => m.namingKicked).length + ' settled=' + (s.namingEnd || []).filter(m => m.villageName).length + ' queuedAtEnd=' + (s.namingEnd || []).reduce((a, m) => a + (m.queued || 0), 0));
}
console.log('\nPANEL lure/party decisions: ' + JSON.stringify(count(allLures, d => (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline'))));
// r141 BOND panel: lure split needs each decision's recorded flag.
let panelByInviter = {};
for (const s of seeds) {
  for (const d of (s.lureDecisions || [])) {
    const k = ((d.inviterWasBearer === true) ? 'player' : (d.inviterWasBearer === false ? 'NPC' : 'unknown')) + ':' + (d.kind || '?') + ':' + (d.accept ? 'accept' : 'decline');
    panelByInviter[k] = (panelByInviter[k] || 0) + 1;
  }
}
console.log('PANEL lure-by-inviter: ' + JSON.stringify(panelByInviter));
console.log('PANEL successions: ' + JSON.stringify(seeds.flatMap(s => (s.successions || []).map(x => ({ ...x, seed: s.seed })))));
console.log('PANEL propose* calls: ' + allPropose.length + (allPropose.length ? ' ' + JSON.stringify(count(allPropose, c => (c.method || '?') + ':' + (c.initiatorKind || '?'))) : ' (none observed)'));
console.log('PANEL end bonds per seed: ' + JSON.stringify(allBondEnds.map(b => b.bonds)));
const initiatorRecorded = allBondEnds.some(b => b.sample && b.sample.val && /initiat|propos|from|by/i.test(b.sample.val));
console.log('PANEL bond initiator recorded by engine: ' + (initiatorRecorded ? 'YES (see samples above)' : 'NO — bond records carry no initiator field; NPC-initiated formation cannot be inferred from end bonds'));
console.log('PANEL plots: ' + allPlots.length + ' (late d30+: ' + latePlots.length + ')');
console.log('PANEL plots with grievanceTargetToLeader > 0: ' + allPlots.filter(p => (p.grievanceTargetToLeader || 0) > 0).length);
console.log('PANEL grievance-holder -> later leader cases: ' + holderLeads.length);
for (const h of holderLeads) console.log('  ' + JSON.stringify(h));
const allArms = seeds.flatMap(s => (s.armEvents || []).map(a => ({ ...a, seed: s.seed })));
const allSprings = seeds.flatMap(s => (s.springEvents || []).map(a => ({ ...a, seed: s.seed })));
console.log('PANEL arms: ' + allArms.length + ' (late d30+: ' + allArms.filter(a => a.day >= 30).length + ') grievance-linked at arming: ' + allArms.filter(a => (a.grievanceTargetToLeader || 0) > 0 || (a.accompliceMotives || []).some(m => (m.grievance || 0) > 0)).length);
console.log('PANEL springs: ' + allSprings.length + ' outcomes: ' + JSON.stringify(count(allSprings, x => x.outcome || '?')));
console.log('PANEL escaped springs: ' + allSprings.filter(x => x.outcome === 'escaped').length);
console.log('PANEL expired plots: ' + seeds.reduce((n, s) => n + (s.expiredEvents || []).length, 0));
console.log('PANEL villages past d100: ' + seeds.filter(s => (s.gameDay || 0) >= 100).length + '/' + seeds.length);
// r141 M6 panel: gossip-position — naming-beat lines emitted while away.
// Verdict is on the emit-time *Away counts (the defect); plain counts show
// the debate is alive. The stranded-day plain counts are context only:
// a slice covers the previous day's parts, so at-Haven mid-day lines can
// sit on a stranded-flagged day — that is attribution, not a leak.
let m6StrandedDays = 0, m6Burst = 0, m6Settle = 0, m6Witness = 0, m6Tale = 0, m6BurstAway = 0, m6SettleAway = 0, m6WitnessAway = 0, m6TaleAway = 0, m6Kicked = 0, m6Settled = 0;
for (const s of seeds) {
  for (const n of (s.nightlyNews || [])) {
    if (n.stranded) m6StrandedDays++;
    m6Burst += n.burst || 0; m6Settle += n.settle || 0; m6Witness += n.witness || 0; m6Tale += n.tale || 0;
    m6BurstAway += n.burstAway || 0; m6SettleAway += n.settleAway || 0; m6WitnessAway += n.witnessAway || 0; m6TaleAway += n.taleAway || 0;
  }
  for (const m of (s.namingEnd || [])) { if (m.namingKicked) m6Kicked++; if (m.villageName) m6Settled++; }
}
console.log('PANEL M6 haven-news: strandedDays=' + m6StrandedDays + ' deliveredAtHaven burst=' + m6Burst + ' settle=' + m6Settle + ' witness=' + m6Witness + ' tale=' + m6Tale + ' | emittedAway burst=' + m6BurstAway + ' settle=' + m6SettleAway + ' witness=' + m6WitnessAway + ' tale=' + m6TaleAway + ' debatesKicked=' + m6Kicked + ' namesSettled=' + m6Settled);
console.log('PANEL M6 verdict: ' + ((m6BurstAway + m6SettleAway + m6WitnessAway + m6TaleAway === 0 && m6Kicked >= 1) ? 'GO — no naming-beat line was emitted while the scholar was away, debates alive' : 'NO-GO — see counts'));
