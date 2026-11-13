// analyze-journey-social-r189-20261112.js -- r189 panel analyzer (Lane B).
// Reads worktree evidence/2026-11-12/journey-social-life-r189-*.json and
// prints: lure/party decision counts by kind, dark-channel verdict inputs
// (plots with corrected grievance pairs, grievance-holder -> later leader),
// death-cluster census, social volume, and the BOND section (r141):
// lure decisions split player-vs-NPC inviter per kind, propose* calls by
// initiator, end bonds + whether the engine records a bond initiator.
// No src/js changes.
// Usage: node scripts/analyze-journey-social-r154-20261107.js
'use strict';
const fs = require('fs'), path = require('path');
const { summarizeBondProposed, tallyOffered, summarizeCounters, tallyRecap, tallyReoffers, tallyDroppedThreads, tallyNarrDup, tallyConfessions, tallyVendetta, tallyRecapEmpty } = require('./journey-social-r189-helpers');
const DIR = path.join(__dirname, '..', 'evidence', '2026-11-12');
const files = fs.readdirSync(DIR).filter(f => /^journey-social-life-r189-\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('no r189 per-seed JSONs in ' + DIR); process.exit(1); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const count = (rows, key) => { const o = {}; for (const r of rows) { const k = key(r); o[k] = (o[k] || 0) + 1; } return o; };
console.log('SEEDS: ' + seeds.map(s => (s.seed || '?') + ' d' + (s.gameDay || s.days)).join(', '));
let allLures = [], allPlots = [], holderLeads = [], latePlots = [];
let allPropose = [], allBondEnds = [], allBondProposed = [];
for (const s of seeds) {
  const ld = s.lureDecisions || [];
  allLures.push(...ld.map(d => ({ ...d, seed: s.seed })));
  console.log(`\nseed ${s.seed}: days=${s.gameDay} endReason=${s.endReason} fullConvs=${(s.social || {}).fullConvs} naturalEnds=${(s.social || {}).naturalEnds} feasts=${(s.social || {}).feasts} moots=${(s.social || {}).moots}`);
  // r181 (C1) scattering record — the r159 42703 question, answered from
  // the record: scattered flag + hungryDays + people alive at the end.
  console.log('  scattering: ' + JSON.stringify(s.scatteringEnd || null));
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
  // r154 (B) counter-settle experiment: fresh vs blocked proposeLink calls.
  const cs = summarizeCounters(s.proposeCalls, s.counterSettles, s.counterAnswers, s.pendingCounterEnd);
  console.log('  COUNTER proposeLink=' + cs.proposeLinkCalls + ' counter=' + cs.proposeLinkCounter + ' fresh=' + cs.freshCalls + ' freshCounter=' + cs.freshCounter + ' blocked=' + cs.blockedCalls + ' blockedCounter=' + cs.blockedCounter + ' unknownPending=' + cs.unknownPendingCalls + ' answerWrapped=' + JSON.stringify(s.answerWrapped));
  console.log('  COUNTER settles=' + cs.settles + ' linkFormed=' + cs.settlesLinkFormed + ' failed=' + cs.settlesLinkFailed + ' unknown=' + cs.settlesUnknown + ' answers=' + cs.answers + ' byHow=' + JSON.stringify(cs.answersByHow) + ' answersLinkFormed=' + cs.answersLinkFormed + ' minPantryAtSettle=' + cs.minPantryAtSettle + ' tributes=' + JSON.stringify(cs.tributes) + ' pendingCounterEnd=' + JSON.stringify(cs.pendingCounterEnd));
  for (const st of (s.counterSettles || [])) console.log(`    SETTLE d${st.day} target=${st.targetId} tribute=${st.tribute} pantry=${st.pantryKcalAtSettle} linkFormed=${st.linkFormed} result=${String(st.result || '').slice(0, 120)}`);
  for (const c of pc) console.log(`    PROPOSE d${c.day} ${c.method} targetId=${c.targetId} pendingBefore=${c.pendingBefore} result=${c.result}`);
  // r181 (B1) double-confession tally: sittings with >=2 'confessed'
  // confrontation outcomes (identity-lie + theft).
  const cf = tallyConfessions(s.confrontEvents || []);
  console.log('  CONFESS confrontWrapped=' + JSON.stringify(s.confrontWrapped) + ' total=' + cf.total + ' confessed=' + cf.confessed + ' byOutcome=' + JSON.stringify(cf.byOutcome) + ' sittingsWithConfession=' + cf.sittingsWithConfession + ' singleSittings=' + cf.singleSittings + ' doubleSittings=' + cf.doubleSittings + ' outsideSittingConfessed=' + cf.outsideSittingConfessed);
  for (const d of cf.doubles) console.log('  CONFESS DOUBLE ' + JSON.stringify(d));
  // r154 (C) recap-cap verification.
  const rc = tallyRecap(((s.social || {}).transcripts || []));
  console.log('  RECAP maxPresses=' + rc.maxRecapPresses + ' totalPresses=' + rc.totalPresses + ' offeredAfterCap=' + rc.offeredAfterCap + ' capFailures=' + rc.capFailures.length);
  for (const f of rc.capFailures) console.log('  RECAP CAP-FAIL ' + JSON.stringify(f));
  // r154 (B) bond_proposed live capture: villager-initiated bonds, first
  // panel with the bond-initiate build live.
  const bp = s.bondProposed || [];
  allBondProposed.push(...bp.map(c => ({ ...c, seed: s.seed })));
  const bps = summarizeBondProposed(bp);
  console.log('  BOND proposed=' + bps.total + ' byInitiatorKind=' + JSON.stringify(bps.byInitiatorKind) + ' byKind=' + JSON.stringify(bps.byKind) + ' byOutcome=' + JSON.stringify(bps.byOutcome) + ' villagerPerson=' + bps.villagerPerson + ' villagerPersonAccepted=' + bps.villagerPersonAccepted + ' linkRaises=' + bps.linkRaises + ' linkAccepted=' + bps.linkAccepted + ' maxPerInitiator=' + bps.maxPerInitiator);
  for (const b of bp) console.log(`    PROPOSED d${b.day} ${b.initiator}(${b.initiatorKind})->${b.target} kind=${b.kind} outcome=${b.outcome} chance=${b.chance}`);
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
  console.log('  M6 nightlyNews: strandedDays=' + sd.length + ' burst=' + sumAll('burst') + ' settle=' + sumAll('settle') + ' witness=' + sumAll('witness') + ' tale=' + sumAll('tale') + ' | emitted-AWAY(strict on-tile) burst=' + sumAll('burstAway') + ' settle=' + sumAll('settleAway') + ' witness=' + sumAll('witnessAway') + ' tale=' + sumAll('taleAway') + ' | emitted-AWAY-GATE(radius-1) burst=' + sumAll('burstAwayGate') + ' settle=' + sumAll('settleAwayGate') + ' witness=' + sumAll('witnessAwayGate') + ' tale=' + sumAll('taleAwayGate') + ' debatesKicked=' + (s.namingEnd || []).filter(m => m.namingKicked).length + ' settled=' + (s.namingEnd || []).filter(m => m.villageName).length + ' queuedAtEnd=' + (s.namingEnd || []).reduce((a, m) => a + (m.queued || 0), 0));
  // r154 M4 (r141 metric-review fix): surface the best full transcript per
  // seed IN the analyzer output so the M4 verdict is judged in-run, plus a
  // near-duplicate flag scan (descriptive, not a binding metric) that
  // operationalizes the r141 lead-pool finding: two DISTINCT core lines in
  // one conversation carrying the same beat. The engine re-voices one line
  // with repeat prefixes ("As I said —", "Like I said —", "Still the same
  // thing —", "I've told you three times now —", "We're going in circles
  // a bit —", "Short version —") and re-answers a repeated question with
  // the same line — both are re-answers, NOT new beats, so the scan strips
  // prefixes and skips identical cores before comparing. What it flags:
  // distinct cores sharing a normalized first-3-words opening, or a
  // word-set Jaccard >= 0.5.
  const stripRepeatPrefix = (t) => {
    let s = String(t || '').replace(/^["“]/, '').replace(/["”]$/, '');
    let prev = '';
    while (prev !== s) { prev = s; s = s.replace(/^(as i said|like i said|still the same thing|i'?ve told you three times now|we'?re going in circles a bit|short version|quick version|the way i read it)\s*[—\-–]\s*/i, ''); }
    return s;
  };
  const normWords = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  const jaccard = (a, b) => { const A = new Set(a), B = new Set(b); let inter = 0; for (const w of A) if (B.has(w)) inter++; return inter / (A.size + B.size - inter || 1); };
  const tss = ((s.social || {}).transcripts || []).filter(t => (t.transcript || []).length >= 4);
  const prefTags = (t) => /friend|talk|ambush|recall|moot/.test(t.tag || '') ? 1 : 0;
  const best = tss.filter(t => t.naturalEnd).sort((a, b) => (prefTags(b) - prefTags(a)) || ((b.transcript || []).length - (a.transcript || []).length))[0]
    || tss.sort((a, b) => ((b.transcript || []).length - (a.transcript || []).length))[0] || null;
  let m4flags = [];
  for (const t of tss) {
    const npc = (t.transcript || []).filter(e => e.who === 'NPC').map(e => stripRepeatPrefix(e.text));
    // "Still on X" is the engine's topic-continuation device (base line +
    // optional suffix), not a pool beat — excluded from this scan.
    const cores = [...new Set(npc)].filter(c => !/^still on /i.test(c));
    for (let i = 0; i < cores.length; i++) for (let j = i + 1; j < cores.length; j++) {
      const wa = normWords(cores[i]), wb = normWords(cores[j]);
      if (wa.length <= 3 || wb.length <= 3) continue;
      if (wa.slice(0, 3).join(' ') === wb.slice(0, 3).join(' ')) m4flags.push({ tag: t.tag, vid: t.vid, kind: 'same-opening', a: cores[i], b: cores[j] });
      else if (jaccard(wa, wb) >= 0.5) m4flags.push({ tag: t.tag, vid: t.vid, kind: 'jaccard>=0.5', a: cores[i], b: cores[j] });
    }
  }
  console.log('  M4 transcripts=' + tss.length + ' naturalEnds=' + ((s.social || {}).naturalEnds) + ' nearDupFlags=' + m4flags.length);
  for (const f of m4flags) console.log('  M4 FLAG ' + f.kind + ' [' + f.tag + ' ' + f.vid + '] :: ' + f.a + (f.b ? ' || ' + f.b : ''));
  // r189 (M11) recap-empty tally: how many M4 flags carry the empty-thread
  // recap core (ONE-line pool on r181: 19 of 126 flags). Anchor: r181 = 19.
  const recapEmpty = tallyRecapEmpty(m4flags);
  console.log('  M11 recap-empty flags=' + recapEmpty + ' of ' + m4flags.length + ' (bar: >=10 panel-wide lands the job-B1 pool fix)');
  if (best) {
    console.log('  M4 CANDIDATE [' + best.tag + ' ' + best.vid + ' turns=' + best.turns + ' naturalEnd=' + best.naturalEnd + ']:');
    for (const e of (best.transcript || [])) console.log('    ' + e.who + ': ' + e.text);
  } else console.log('  M4 CANDIDATE: none (no transcript >= 4 lines)');
  // stash for the panel M4 summary
  s._m4 = { best: best ? { tag: best.tag, vid: best.vid, turns: best.turns, naturalEnd: best.naturalEnd, transcript: best.transcript } : null, flags: m4flags, nTranscripts: tss.length, recapEmpty };
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
// r154 (B) panel bond_proposed rollup — third post-build datapoint.
const panelBp = summarizeBondProposed(allBondProposed);
console.log('PANEL bond_proposed: total=' + panelBp.total + ' byInitiatorKind=' + JSON.stringify(panelBp.byInitiatorKind) + ' byKind=' + JSON.stringify(panelBp.byKind) + ' byOutcome=' + JSON.stringify(panelBp.byOutcome) + ' byKindOutcome=' + JSON.stringify(panelBp.byKindOutcome));
console.log('PANEL bond_proposed: villagerPerson=' + panelBp.villagerPerson + ' villagerPersonAccepted=' + panelBp.villagerPersonAccepted + ' scholarPerson=' + panelBp.scholarPerson + ' linkRaises=' + panelBp.linkRaises + ' linkAccepted=' + panelBp.linkAccepted + ' maxPerInitiator=' + panelBp.maxPerInitiator + ' maxPerInitiatorPerson=' + panelBp.maxPerInitiatorPerson + ' personPerInitiator=' + JSON.stringify(panelBp.personPerInitiator) + ' perInitiator=' + JSON.stringify(panelBp.perInitiator));
console.log('PANEL bond_proposed verdict: ' + (panelBp.villagerPerson >= 1 ? 'ANSWERED — ≥1 villager-initiated bond proposal in the wild' : 'STILL OPEN — 0 villager-initiated bond proposals in the wild panel'));
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
// r181 (M1-VENDETTA) vendetta cadence: the r180 watch item — same pair
// re-arming past 8-10 plots earns a design look at the grievance loop's
// cooling-off (not a knob). maxUnordered is the judged number.
const vend = tallyVendetta(allArms);
console.log('PANEL vendetta: maxUnordered=' + vend.maxUnordered + ' maxDirected=' + vend.maxDirected + ' topUnordered=' + JSON.stringify(vend.topUnordered) + ' topDirected=' + JSON.stringify(vend.topDirected));
for (const p of vend.pairsGte4) console.log('  VENDETTA pair=' + p.pair + ' arms=' + p.n + ' d' + p.firstDay + '-d' + p.lastDay + ' span=' + p.spanDays + 'd');
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
let m6BurstAwayGate = 0, m6SettleAwayGate = 0, m6WitnessAwayGate = 0, m6TaleAwayGate = 0;
for (const s of seeds) {
  for (const n of (s.nightlyNews || [])) {
    if (n.stranded) m6StrandedDays++;
    m6Burst += n.burst || 0; m6Settle += n.settle || 0; m6Witness += n.witness || 0; m6Tale += n.tale || 0;
    m6BurstAway += n.burstAway || 0; m6SettleAway += n.settleAway || 0; m6WitnessAway += n.witnessAway || 0; m6TaleAway += n.taleAway || 0;
    m6BurstAwayGate += n.burstAwayGate || 0; m6SettleAwayGate += n.settleAwayGate || 0; m6WitnessAwayGate += n.witnessAwayGate || 0; m6TaleAwayGate += n.taleAwayGate || 0;
  }
  for (const m of (s.namingEnd || [])) { if (m.namingKicked) m6Kicked++; if (m.villageName) m6Settled++; }
}
console.log('PANEL M6 haven-news: strandedDays=' + m6StrandedDays + ' deliveredAtHaven burst=' + m6Burst + ' settle=' + m6Settle + ' witness=' + m6Witness + ' tale=' + m6Tale + ' | emittedAway(strict on-tile) burst=' + m6BurstAway + ' settle=' + m6SettleAway + ' witness=' + m6WitnessAway + ' tale=' + m6TaleAway + ' | emittedAwayGate(radius-1) burst=' + m6BurstAwayGate + ' settle=' + m6SettleAwayGate + ' witness=' + m6WitnessAwayGate + ' tale=' + m6TaleAwayGate + ' debatesKicked=' + m6Kicked + ' namesSettled=' + m6Settled);
console.log('PANEL M6 verdict (RE-ALIGNED, gate definition): ' + (((m6BurstAwayGate + m6SettleAwayGate + m6WitnessAwayGate + m6TaleAwayGate) === 0 && m6Kicked >= 1) ? 'GO — no naming-beat line was emitted beyond radius-1 of Haven, debates alive' : 'NO-GO — see counts'));
console.log('PANEL M6 strict-definition note: strict on-tile away total=' + (m6BurstAway + m6SettleAway + m6WitnessAway + m6TaleAway) + ' — reported as the known metric/gate definition discrepancy, does NOT fail M6 this run (prereg).');
// r154 M4 panel: candidates + near-duplicate flags. The GO/NO-GO verdict is
// a human read of the printed candidates (bar: NPC wants something real,
// options engage or deflect it, ending resolves/plants/owes) — recorded in
// the run note with the quoted transcript. Flags are a reading list, not a
// count verdict: template-variant families (nonverbal nods, opener stems,
// teaching/landmark templates) flag by design. The read is for a same-beat
// flag in a goalFollow pool — the lead-pool fix holding means no such flag.
const m4TotalFlags = seeds.reduce((n, s) => n + ((s._m4 || {}).flags || []).length, 0);
const m4TotalTs = seeds.reduce((n, s) => n + ((s._m4 || {}).nTranscripts || 0), 0);
console.log('PANEL M4: transcripts=' + m4TotalTs + ' nearDupFlags=' + m4TotalFlags + ' candidatesPrinted=' + seeds.filter(s => (s._m4 || {}).best).length + '/' + seeds.length + ' — verdict in run note from the printed candidates above');
// r189 (M11) recap-empty panel tally: r181 anchor 19; bar >= 10 lands the job-B1 pool fix.
const m11Total = seeds.reduce((n, s) => n + ((s._m4 || {}).recapEmpty || 0), 0);
console.log('PANEL M11: recap-empty flags=' + m11Total + ' of ' + m4TotalFlags + ' near-dup flags (r181 anchor 19; bar >= 10 lands the job-B1 pool fix)');
// r154 (C) goal-thread react surfacing: offered-id tally across all
// transcripts + longest consecutive continuer-press run.
const allTs = seeds.flatMap(s => ((s.social || {}).transcripts || []));
const off = tallyOffered(allTs);
console.log('PANEL goal-thread offers: moreOffered=' + off.moreOffers + ' reactOffered=' + off.reactOffers + ' (agree=' + (off.counts.agree || 0) + ' joke=' + (off.counts.joke || 0) + ' silence=' + (off.counts.silence || 0) + ') followGoalOffered=' + off.goalFollowOffers + ' longestContinuerRun=' + off.longestMoreRun);
// r154 (B) panel counter rollup + M8 verdict (job B). Re-raise check,
// ALIGNED r181 (B2): a re-raise is a BLOCKED proposeLink call
// (pendingBefore === true, result 'counter') to the same target AFTER a
// link-forming settle — the same counter looping. A FRESH proposeLink
// (pendingBefore === false) after a settle is a fresh re-link (the old
// link dissolved; proposeLink's own guard proves it — it stages a NEW
// counter instead of refusing as already-linked), reported separately
// and NOT counted as a re-raise. (r167's analyzer counted ANY link-kind
// bond_proposed record after a settle — Sofia 43304 d70/d72 were fresh
// re-links, not a loop. Unknown-pending raises are listed separately
// and flagged, never silently counted either way.)
const panelCs = summarizeCounters(
  seeds.flatMap(s => s.proposeCalls || []),
  seeds.flatMap(s => s.counterSettles || []),
  seeds.flatMap(s => s.counterAnswers || []),
  null);
let reRaisesAfterSettle = [];
let freshReLinksAfterSettle = [];
let unknownReLinksAfterSettle = [];
for (const s of seeds) {
  for (const st of (s.counterSettles || [])) {
    if (st.linkFormed !== true) continue;
    for (const c of (s.proposeCalls || [])) {
      if ((c.method || 'proposeLink') !== 'proposeLink') continue;
      if (String(c.targetId) !== String(st.targetId)) continue;
      if ((c.day || 0) <= (st.day || 0)) continue;
      if (String(c.result || '') !== '"counter"') continue;
      const row = { seed: s.seed, settleDay: st.day, target: st.targetId, raiseDay: c.day, pendingBefore: c.pendingBefore };
      if (c.pendingBefore === true) reRaisesAfterSettle.push(row);
      else if (c.pendingBefore === false) freshReLinksAfterSettle.push(row);
      else unknownReLinksAfterSettle.push(row);
    }
  }
}
console.log('PANEL COUNTER: proposeLink=' + panelCs.proposeLinkCalls + ' counter=' + panelCs.proposeLinkCounter + ' fresh=' + panelCs.freshCalls + ' freshCounter=' + panelCs.freshCounter + ' blocked=' + panelCs.blockedCalls + ' blockedCounter=' + panelCs.blockedCounter + ' settles=' + panelCs.settles + ' linkFormed=' + panelCs.settlesLinkFormed + ' failed=' + panelCs.settlesLinkFailed + ' pendingCounterEnd=' + JSON.stringify(seeds.map(s => s.pendingCounterEnd || null)));
console.log('PANEL COUNTER re-raises after a link-forming settle (BLOCKED): ' + reRaisesAfterSettle.length + ' ' + JSON.stringify(reRaisesAfterSettle));
console.log('PANEL COUNTER fresh re-links after a link-forming settle: ' + freshReLinksAfterSettle.length + ' ' + JSON.stringify(freshReLinksAfterSettle));
if (unknownReLinksAfterSettle.length) console.log('PANEL COUNTER unknown-pending raises after a link-forming settle (INVESTIGATE — not counted either way): ' + unknownReLinksAfterSettle.length + ' ' + JSON.stringify(unknownReLinksAfterSettle));
console.log('PANEL M8 verdict: ' + (panelCs.settles === 0 ? 'NO COUNTER STAGED — vacuous (no link counter ever appeared in the panel)' : (panelCs.settlesLinkFormed >= 1 && reRaisesAfterSettle.length === 0 ? 'SETTLED — ≥1 link formed via a driver settle, no BLOCKED re-raise after it' : (panelCs.settlesLinkFormed >= 1 ? 'PARTIAL — links formed via settle but BLOCKED re-raises continued after one' : 'LOOP-PERSISTS — settles fired but no link formed'))));
// r181 (B1) panel double-confession tally. Sitting numbers are
// run-global (the driver's sittingSeq is module-level and monotonic
// across seeds in one process), so panel grouping by sitting is safe.
const panelCf = tallyConfessions(seeds.flatMap(s => s.confrontEvents || []));
console.log('PANEL CONFESS: total=' + panelCf.total + ' confessed=' + panelCf.confessed + ' byOutcome=' + JSON.stringify(panelCf.byOutcome) + ' sittingsWithConfession=' + panelCf.sittingsWithConfession + ' singleSittings=' + panelCf.singleSittings + ' doubleSittings=' + panelCf.doubleSittings + ' outsideSittingConfessed=' + panelCf.outsideSittingConfessed);
for (const d of panelCf.doubles) console.log('  PANEL CONFESS DOUBLE ' + JSON.stringify(d));
// r181 (C2) furniture-filtered re-offer: the raw panelMax is dominated
// by structural ids (leave/silence offered every turn); the filtered max
// is the meaningful signal (the doubt-probe wart lives there).
const panelRe = tallyReoffers(allTs);
console.log('PANEL RE-OFFER: conversations=' + panelRe.nConversations + ' withReoffer=' + panelRe.rows.length + ' panelMax=' + panelRe.panelMax + ' panelMaxFurnitureFree=' + panelRe.panelMaxFurnitureFree);
for (const r of panelRe.rows.slice(0, 12)) console.log('  RE-OFFER [' + r.tag + ' ' + r.vid + '] max=' + r.maxReoffer + ' id=' + r.id + ' maxFF=' + r.maxReofferFurnitureFree + ' idFF=' + r.idFurnitureFree + ' perId=' + JSON.stringify(r.perId));
const panelDrop = tallyDroppedThreads(allTs);
console.log('PANEL DROPPED-THREAD: conversations=' + panelDrop.nConversations + ' drops=' + panelDrop.nDrops);
for (const r of panelDrop.rows) {
  console.log('  DROP [' + r.tag + ' ' + r.vid + '] :: ' + r.dropLine);
  for (const c of r.context) console.log('    ctx ' + c);
  if (r.nextSitting) { console.log('    next sitting [' + r.nextSitting.tag + ' turns=' + r.nextSitting.turns + ']:'); for (const o of r.nextSitting.opening) console.log('      ' + o); }
  else console.log('    next sitting: NONE (no later conversation with this villager in the seed)');
}
// r154 (C) panel recap rollup + M9 verdict (job C).
const panelRc = tallyRecap(allTs);
console.log('PANEL RECAP: maxPresses=' + panelRc.maxRecapPresses + ' totalPresses=' + panelRc.totalPresses + ' offeredAfterCap=' + panelRc.offeredAfterCap + ' capFailures=' + panelRc.capFailures.length);
console.log('PANEL M9 verdict: ' + (panelRc.capFailures.length === 0 && panelRc.offeredAfterCap === 0 ? 'HOLDS — recap cap fires in the wild' : 'FAILS — see cap failures / offered-after-cap above'));
// r181 (C3) NARR near-dup scan + M10 coach-variation verdict (job B).
// The scan runs the same rules as the NPC pass over NARR lines only;
// a verbatim repeat of one coach text inside one transcript is the
// M10 failure (the pool fix not holding in the wild). Reported
// separately — it does NOT fail M7.
// r181 (M10 split, r179 metric review): coach-verbatim and
// face-verbatim are reported separately; M10 judges coach lines only.
// The face count is the r179 face-guard re-confirmation (FACE verdict).
const panelNarr = tallyNarrDup(allTs);
console.log('PANEL NARR-DUP: conversations=' + panelNarr.nConversations + ' verbatimRepeats=' + panelNarr.nVerbatimRepeats + ' coachVerbatim=' + panelNarr.nVerbatimRepeatsCoach + ' faceVerbatim=' + panelNarr.nVerbatimRepeatsFace + ' panelMaxSameNarr=' + panelNarr.panelMaxSameNarr + ' nearDupFlags=' + panelNarr.nNearDupFlags);
for (const r of panelNarr.rows.slice(0, 12)) console.log('  NARR-DUP [' + r.tag + ' ' + r.vid + '] ' + r.kind + (r.cls ? ' [' + r.cls + ']' : '') + (r.count ? ' x' + r.count : '') + ' :: ' + (r.text || ((r.a || '') + ' || ' + (r.b || ''))).slice(0, 220));
console.log('PANEL M10 verdict: ' + (panelNarr.nVerbatimRepeatsCoach === 0 ? 'HOLDS — no NARR coach line repeats verbatim inside one sitting' : 'FAILS — see verbatim coach repeats above (pool fix did not hold in the wild)'));
console.log('PANEL FACE verdict: ' + (panelNarr.nVerbatimRepeatsFace === 0 ? 'HOLDS — no accuseFace line repeats verbatim inside one sitting (r179 face guard holds)' : 'FAILS — see verbatim face repeats above (r179 face guard did not hold in the wild)'));
// r181 (C1) panel scattering summary — the r159 42703 question.
const scattered = seeds.filter(s => (s.scatteringEnd || {}).scattered === true);
console.log('PANEL SCATTERING: villages ended scattered=' + scattered.length + '/' + seeds.length + ' ' + JSON.stringify(scattered.map(s => ({ seed: s.seed, day: s.gameDay, hungryDays: (s.scatteringEnd || {}).hungryDays, aliveEnd: (s.scatteringEnd || {}).aliveEnd, endReason: (s.scatteringEnd || {}).endReason }))));
