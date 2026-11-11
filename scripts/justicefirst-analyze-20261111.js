// justicefirst-analyze-20261111.js — justice + moot first-numbers analyzer
// (arm sim-justicefirst-a, run fleshout-20261111T1115Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-justicefirst-a/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/justicefirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

const CRIME_TYPES = ['theft', 'attack', 'murder', 'intimidation', 'cannibalism', 'desecration', 'threat', 'assault'];
const CHARGES = ['theft', 'intimidation', 'assault', 'murder', 'cannibalism', 'ambush'];
const RESOLUTIONS = ['exile', 'weregild', 'schism', 'cold_war', 'player_exile', 'acquitted', 'advisory_guilty', 'advisory_acquit', 'fled'];
const WRAPS = ['recordCrime', 'justiceHeat', 'justiceTick', 'justiceConfront', 'justiceRespond',
  'justiceDemandMoot', 'syncJusticeAfterMoot', 'mootAccuserAftermath', 'startVillageUprising',
  'uprisingAftermath', 'exilePlayer', 'justiceExileColdResolve', 'justiceExileCutsTalk',
  'theftConfrontation', 'stealFrom', 'openCase', 'openPlayerCase', 'considerPlayerAccusation',
  'forcePlayerAccusation', 'mootConveneHeld', 'callMoot', 'conductTrial', 'tallyVotes',
  'mootQuorum', 'castPlayerVote', 'finishTrial', 'sentenceCase', 'resolveCase',
  'bribeVoter', 'exposeBribery', 'investigateBribery', 'removeVillager', 'bumpTrust', 'recordGrievance'];
const MOOT_STACK_SITES = ['finishTrial', 'mootAccuserAftermath', 'justiceRespond', 'justiceExileColdResolve', 'sentenceCase', 'resolveCase', 'tallyVotes', 'castPlayerVote'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

function classifyCrimeEvent(ev) {
  // Returns {cls, typeClass, witnessedClass}. 'other:<type>' is classified,
  // never unclassified — the engine accepts arbitrary crime types.
  if (!ev || !ev.type || typeof ev.type !== 'string') return { cls: 'unclassified', typeClass: 'unclassified', witnessedClass: 'unclassified' };
  if (ev.villain !== null && ev.villain !== undefined && typeof ev.villain !== 'string') return { cls: 'unclassified', typeClass: 'unclassified', witnessedClass: 'unclassified' };
  const typeClass = CRIME_TYPES.indexOf(ev.type) >= 0 ? ev.type : 'other:' + ev.type;
  const witnessedClass = ev.witnessed === true ? 'witnessed' : ev.witnessed === false ? 'unwitnessed' : 'unspecified';
  return { cls: 'ok', typeClass: typeClass, witnessedClass: witnessedClass };
}

function classifyCaseOpen(ev) {
  // ev is an openCase/openPlayerCase event. Returns {cls, path, chargeClass}.
  if (!ev) return { cls: 'unclassified', path: 'unclassified', chargeClass: 'unclassified' };
  const path = ev.via === 'openCase' ? 'openCase-plot' : ev.via === 'openPlayerCase' ? 'openPlayerCase' : 'unclassified';
  if (path === 'unclassified') return { cls: 'unclassified', path: path, chargeClass: 'unclassified' };
  if (!ev.charge) return { cls: 'unclassified', path: path, chargeClass: 'missing-charge' };
  const chargeClass = CHARGES.indexOf(ev.charge) >= 0 ? ev.charge : 'other:' + ev.charge;
  return { cls: 'ok', path: path, chargeClass: chargeClass };
}

// One moot = one conductTrial event joined to its callMoot / quorum /
// finish / resolve records by caseId. Returns a per-case record.
function buildMootRecords(seedObj) {
  const byCase = {};
  function rec(caseId) {
    if (!byCase[caseId]) byCase[caseId] = { caseId: caseId, caller: null, playerConvened: null, wildDay: null, playerVoter: null, awaitingPlayerVote: null, quorum: null, quorumPresent: null, quorumLiving: null, outcome: null, resolution: null, advisory: null, guilty: null, total: null, convicted: null };
    return byCase[caseId];
  }
  (seedObj.callMootEvents || []).forEach(function (e) { const r = rec(e.caseId); r.caller = e.caller; r.playerConvened = e.playerConvened; });
  (seedObj.trialEvents || []).forEach(function (e) { const r = rec(e.caseId); r.wildDay = e.wildDay; r.playerVoter = e.playerVoter; r.awaitingPlayerVote = e.awaitingPlayerVote; });
  (seedObj.quorumEvents || []).forEach(function (e) { const r = rec(e.caseId); if (e.quorum != null) { r.quorum = e.quorum; r.quorumPresent = e.present; r.quorumLiving = e.living; } });
  (seedObj.finishEvents || []).forEach(function (e) { const r = rec(e.caseId); r.advisory = e.advisory; r.guilty = e.guilty; r.total = e.total; r.convicted = e.convicted; r.resolution = e.resolution; r.status = e.status; });
  (seedObj.resolveEvents || []).forEach(function (e) { const r = rec(e.caseId); r.outcome = e.path; r.resolution = e.resolution || r.resolution; });
  return byCase;
}

function classifyMootRecord(r) {
  // Returns 'ok' or 'unclassified' + reason. A moot with no finish and no
  // resolve is 'open-at-end' (classified) only if the case is still open
  // in the last snapshot — checked by the caller via seedObj; here a
  // trial with no finish at all is 'unfinished' (unclassified unless the
  // caller explains it).
  if (!r) return { cls: 'unclassified', why: 'no-record' };
  if (r.caller == null) return { cls: 'unclassified', why: 'no-caller' };
  if (r.quorum == null) return { cls: 'unclassified', why: 'no-quorum' };
  if (r.outcome == null && r.advisory == null && r.convicted == null) return { cls: 'unclassified', why: 'no-outcome' };
  return { cls: 'ok', why: null };
}

// Moot-attributed trust: bumpTrust events whose stack names a moot/justice
// site. Returns {site, delta} or null.
function mootTrustSite(ev) {
  if (!ev || !ev.stack) return null;
  for (const site of MOOT_STACK_SITES) {
    if (ev.stack.indexOf(site) >= 0) return site;
  }
  return null;
}

// Reconcile snapshot cases against open events: every case id in any
// snapshot must have an open event. No genesis exemption: the driver
// installs the instrument before runDays (and setupGame opens no cases),
// so any case in a snapshot opened while recording was on. A snapshot
// case with no open event is residue — an open path the instrument does
// not wrap, or a case opened before install.
function reconcileCases(seedObj) {
  const opened = new Set();
  (seedObj.openCaseEvents || []).forEach(function (e) { if (e.caseId) opened.add(e.caseId); });
  (seedObj.openPlayerCaseEvents || []).forEach(function (e) { if (e.caseId) opened.add(e.caseId); });
  const daily = seedObj.daily || [];
  let residue = 0; const residueIds = [];
  const seen = new Set();
  daily.forEach(function (snap) {
    (snap.cases || []).forEach(function (c) {
      if (!c.id || seen.has(c.id)) return;
      seen.add(c.id);
      if (!opened.has(c.id)) { residue++; residueIds.push(c.id); }
    });
  });
  return { residue: residue, residueIds: residueIds, opened: opened.size, genesis: 0 };
}

// Direct trust writes: snapshot trust deltas on a vid between consecutive
// snapshots that are NOT explained by bumpTrust events for that vid in
// that day window. Returns {unexplained, total} — unexplained deltas are
// expected on resolve days (resolveCase writes trust directly); the
// analyzer counts them, and the caller judges them against resolve days.
function reconcileTrust(seedObj) {
  const daily = seedObj.daily || [];
  const bumps = {};
  (seedObj.bumpTrustEvents || []).forEach(function (e) {
    if (!e.vid) return;
    bumps[e.vid] = bumps[e.vid] || [];
    bumps[e.vid].push(e);
  });
  let unexplained = 0, total = 0;
  for (let i = 1; i < daily.length; i++) {
    const prev = daily[i - 1].trust || {}, cur = daily[i].trust || {};
    const vids = new Set(Object.keys(prev).concat(Object.keys(cur)));
    vids.forEach(function (vid) {
      const d = (cur[vid] == null ? 10 : cur[vid]) - (prev[vid] == null ? 10 : prev[vid]);
      if (d === 0) return;
      total++;
      const dayBumps = (bumps[vid] || []).filter(function (e) { return e.day === daily[i].day; });
      const sum = dayBumps.reduce(function (s, e) { return s + ((e.after == null || e.before == null) ? 0 : (e.after - e.before)); }, 0);
      if (sum !== d) unexplained++;
    });
  }
  return { unexplained: unexplained, total: total };
}

function summarizeSeed(o) {
  const s = { seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays, endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing, endPantryKcal: o.endPantryKcal, deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length, wrapLive: o.wrapLive || {}, wrapCounts: o.wrapCounts || {} };
  s.wrapMissing = WRAPS.filter(function (w) { return !(o.wrapLive || {})[w]; });

  // crimes
  const crimes = o.crimeEvents || [];
  s.crimes = { total: crimes.length, byType: {}, byWitnessed: {}, booked: 0, droppedNotPlayer: 0, unclassified: 0, charged: 0 };
  crimes.forEach(function (e) {
    const c = classifyCrimeEvent(e);
    if (c.cls !== 'ok') { s.crimes.unclassified++; return; }
    inc(s.crimes.byType, c.typeClass);
    inc(s.crimes.byWitnessed, c.witnessedClass);
    if (e.booked) s.crimes.booked++;
    if (e.droppedNotPlayer) s.crimes.droppedNotPlayer++;
    if (e.caseId) s.crimes.charged++;
  });

  // ladder
  const ticks = o.tickEvents || [];
  s.ladder = { ticks: ticks.length, stageTransitions: {}, confronts: (o.confrontEvents || []).length, responds: (o.respondEvents || []).length, payEnough: 0, payShort: 0, refuses: 0, demands: (o.demandEvents || []).length, demandReasons: {}, uprisings: (o.uprisingEvents || []).length, uprisingAfter: (o.uprisingAfterEvents || []).length, syncs: {}, maxHeat: 0, heatAtEnd: null };
  ticks.forEach(function (e) {
    if (e.stageBefore !== e.stageAfter) inc(s.ladder.stageTransitions, e.stageBefore + '->' + e.stageAfter);
    if (e.heatAfter != null && e.heatAfter > s.ladder.maxHeat) s.ladder.maxHeat = e.heatAfter;
  });
  (o.respondEvents || []).forEach(function (e) {
    if (e.choice === 'pay' && e.enough) s.ladder.payEnough++;
    else if (e.choice === 'pay') s.ladder.payShort++;
    else if (e.choice === 'refuse' || e.refused) s.ladder.refuses++;
  });
  (o.demandEvents || []).forEach(function (e) { inc(s.ladder.demandReasons, e.reason || 'unknown'); });
  (o.syncEvents || []).forEach(function (e) { inc(s.ladder.syncs, e.path || 'unknown'); });
  const lastSnap = (o.daily || [])[(o.daily || []).length - 1];
  if (lastSnap && lastSnap.justice) s.ladder.heatAtEnd = lastSnap.justice.heat;

  // cases
  const opens = (o.openCaseEvents || []).concat(o.openPlayerCaseEvents || []);
  s.cases = { total: opens.length, byPath: {}, byCharge: {}, fabricated: 0, unclassified: 0, openAtEnd: 0, resolvedAtEnd: 0, advisoryAtEnd: 0, dormantAtEnd: 0 };
  opens.forEach(function (e) {
    const c = classifyCaseOpen(e);
    if (c.cls !== 'ok') { s.cases.unclassified++; return; }
    inc(s.cases.byPath, c.path);
    inc(s.cases.byCharge, c.chargeClass);
    if (e.fabricated) s.cases.fabricated++;
  });
  if (lastSnap) {
    (lastSnap.cases || []).forEach(function (c) {
      if (c.status === 'open') s.cases.openAtEnd++;
      else if (c.status === 'resolved') s.cases.resolvedAtEnd++;
      else if (c.status === 'advisory') s.cases.advisoryAtEnd++;
      else if (c.status === 'dormant') s.cases.dormantAtEnd++;
    });
  }
  s.cases.reconcile = reconcileCases(o);

  // moots
  const moots = buildMootRecords(o);
  s.moots = { trials: (o.trialEvents || []).length, callMoots: (o.callMootEvents || []).length, conveneHeld: (o.conveneHeldEvents || []).filter(function (e) { return e.held; }).length, conveneReads: (o.conveneHeldEvents || []).length, wildDays: 0, playerVoterTrials: 0, awaitingTrials: 0, quorate: 0, advisory: 0, convicted: 0, acquitted: 0, unclassified: 0, byOutcome: {}, byCaller: {}, playerVotes: (o.voteEvents || []).length, backstopFinishes: 0 };
  Object.keys(moots).forEach(function (cid) {
    const r = moots[cid];
    const c = classifyMootRecord(r);
    if (c.cls !== 'ok') { s.moots.unclassified++; return; }
    if (r.wildDay) s.moots.wildDays++;
    if (r.playerVoter) s.moots.playerVoterTrials++;
    if (r.awaitingPlayerVote) s.moots.awaitingTrials++;
    if (r.quorum) s.moots.quorate++; else s.moots.advisory++;
    if (r.convicted) s.moots.convicted++; else s.moots.acquitted++;
    inc(s.moots.byOutcome, r.outcome || (r.advisory ? 'advisory' : 'unknown'));
    inc(s.moots.byCaller, r.playerConvened ? 'player' : 'npc:' + (r.caller || '?'));
  });
  (o.finishEvents || []).forEach(function (e) {
    if (e.stack && e.stack.indexOf('trialVoteTick') >= 0) s.moots.backstopFinishes++;
  });

  // verdicts / sentences / resolutions
  s.verdicts = { finishTrials: (o.finishEvents || []).length, sentences: (o.sentenceEvents || []).length, resolves: (o.resolveEvents || []).length, byPath: {}, byCharge: {}, avgBeliefAtSentence: [] };
  (o.resolveEvents || []).forEach(function (e) { inc(s.verdicts.byPath, e.path || 'unknown'); });
  (o.sentenceEvents || []).forEach(function (e) {
    inc(s.verdicts.byCharge, e.charge || 'unknown');
    if (e.avgBelief != null) s.verdicts.avgBeliefAtSentence.push(e.avgBelief);
  });

  // trust from moots
  s.mootTrust = { bumpEvents: (o.bumpTrustEvents || []).length, mootAttributed: 0, bySite: {}, netDelta: 0, grievances: (o.grievanceEvents || []).length, voteGrievances: 0, aftermath: { calls: (o.aftermathEvents || []).length, netDelta: 0 }, exileColdBreaks: 0, exileColdRefusals: 0 };
  (o.bumpTrustEvents || []).forEach(function (e) {
    const site = mootTrustSite(e);
    if (site) {
      s.mootTrust.mootAttributed++;
      inc(s.mootTrust.bySite, site);
      if (e.before != null && e.after != null) s.mootTrust.netDelta += (e.after - e.before);
    }
  });
  (o.aftermathEvents || []).forEach(function (e) {
    if (e.trustBefore != null && e.trustAfter != null) s.mootTrust.aftermath.netDelta += (e.trustAfter - e.trustBefore);
  });
  (o.grievanceEvents || []).forEach(function (e) {
    if (e.kind === 'voted_guilty' || e.kind === 'voted_acquit') s.mootTrust.voteGrievances++;
  });
  (o.exileColdEvents || []).forEach(function (e) {
    if (e.broke) s.mootTrust.exileColdBreaks++;
    if (e.refused) s.mootTrust.exileColdRefusals++;
  });
  s.trustReconcile = reconcileTrust(o);

  // bribery / theft / exile / removals
  s.bribery = { bribeVoter: (o.bribeEvents || []).length, expose: (o.exposeEvents || []).length, investigate: (o.investigateEvents || []).length, boughtVotesInTallies: 0 };
  (o.tallyEvents || []).forEach(function (e) {
    // bribes are recorded on the case, not the tally; a tally with a
    // bribed voter shows up via the case's bribes list — counted in
    // the evidence from snapshots; here count tallies only.
  });
  s.theft = { stealCalls: (o.stealEvents || []).length, stealOk: (o.stealEvents || []).filter(function (e) { return e.returned; }).length, theftConfrontations: (o.theftConfEvents || []).length };
  s.exile = { exilePlayer: (o.exilePlayerEvents || []).length, exileHow: {}, npcExiled: 0, exileCuts: (o.exileCutsEvents || []).filter(function (e) { return e.cuts; }).length, exileCutsTotal: (o.exileCutsEvents || []).length };
  (o.exilePlayerEvents || []).forEach(function (e) { inc(s.exile.exileHow, e.how || 'unknown'); });
  (o.removeEvents || []).forEach(function (e) { if (e.reason === 'exiled') s.exile.npcExiled++; });
  s.removals = { total: (o.removeEvents || []).length, byReason: {} };
  (o.removeEvents || []).forEach(function (e) { inc(s.removals.byReason, e.reason || 'unknown'); });

  // village-days
  s.villageDays = (o.daily || []).length;
  s.justiceSays = (o.justiceSays || []).length;
  s.sayCount = o.sayCount || 0;
  return s;
}

function summarizeBand(controlSeeds, neutralSeeds) {
  const b = { seeds: controlSeeds.length, villageDays: 0, crimes: 0, crimesUnclassified: 0, cases: 0, casesUnclassified: 0, moots: 0, mootsUnclassified: 0, quorate: 0, advisory: 0, convicted: 0, acquitted: 0, playerVotes: 0, backstopFinishes: 0, conveneHeld: 0, mootTrustMoves: 0, mootTrustNet: 0, exilesPlayer: 0, exilesNpc: 0, uprisings: 0, instrumentErrors: 0, wrapMissingBand: {}, neutrality: [], engagement: { casesOrMoots: 0 } };
  controlSeeds.forEach(function (s) {
    b.villageDays += s.villageDays;
    b.crimes += s.crimes.total; b.crimesUnclassified += s.crimes.unclassified;
    b.cases += s.cases.total; b.casesUnclassified += s.cases.unclassified;
    b.moots += s.moots.trials; b.mootsUnclassified += s.moots.unclassified;
    b.quorate += s.moots.quorate; b.advisory += s.moots.advisory;
    b.convicted += s.moots.convicted; b.acquitted += s.moots.acquitted;
    b.playerVotes += s.moots.playerVotes; b.backstopFinishes += s.moots.backstopFinishes;
    b.conveneHeld += s.moots.conveneHeld;
    b.mootTrustMoves += s.mootTrust.mootAttributed; b.mootTrustNet += s.mootTrust.netDelta;
    b.exilesPlayer += s.exile.exilePlayer; b.exilesNpc += s.exile.npcExiled;
    b.uprisings += s.ladder.uprisings;
    b.instrumentErrors += s.instrumentErrors;
    b.engagement.casesOrMoots += s.cases.total + s.moots.trials;
    s.wrapMissing.forEach(function (w) { inc(b.wrapMissingBand, w); });
  });
  // neutrality: match control vs neutral on days + end pantry kcal + deaths
  const bySeed = {};
  neutralSeeds.forEach(function (n) { bySeed[n.seed] = n; });
  controlSeeds.forEach(function (c) {
    const n = bySeed[c.seed];
    if (!n) { b.neutrality.push({ seed: c.seed, match: false, why: 'no-neutral-leg' }); return; }
    const match = c.days === n.days && c.endPantryKcal === n.endPantryKcal && c.deaths === n.deaths;
    b.neutrality.push({ seed: c.seed, match: match, control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths }, neutral: { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths } });
  });
  b.neutralityExact = b.neutrality.filter(function (x) { return x.match; }).length + '/' + b.neutrality.length;
  return b;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-justicefirst-a');
  const outFile = process.argv[3] || path.join(dir, '..', 'justicefirst-summary-justicefirst-pilot.json');
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('justicefirst-pilot') >= 0 && f.endsWith('.json'); }).sort();
  const objs = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const control = objs.filter(function (o) { return o.mode === 'control'; }).map(summarizeSeed);
  const neutral = objs.filter(function (o) { return o.mode === 'neutral'; }).map(summarizeSeed);
  const band = summarizeBand(control, neutral);
  const out = { band: band, control: control, neutral: neutral };
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('## justicefirst GO table (band ' + band.seeds + ' seeds, ' + band.villageDays + ' village-days)');
  console.log('| GO check | Result |');
  console.log('|---|---|');
  console.log('| crimes unclassified | ' + band.crimesUnclassified + ' / ' + band.crimes + ' |');
  console.log('| cases unattributed | ' + band.casesUnclassified + ' / ' + band.cases + ' |');
  console.log('| moots unclassified | ' + band.mootsUnclassified + ' / ' + band.moots + ' trials |');
  console.log('| neutrality exact | ' + band.neutralityExact + ' |');
  console.log('| instrument errors | ' + band.instrumentErrors + ' |');
  console.log('| engagement (cases+moots) | ' + band.engagement.casesOrMoots + ' |');
  console.log('| wraps never live (band) | ' + JSON.stringify(band.wrapMissingBand) + ' |');
  console.log('| quorate / advisory | ' + band.quorate + ' / ' + band.advisory + ' |');
  console.log('| convicted / acquitted | ' + band.convicted + ' / ' + band.acquitted + ' |');
  console.log('| player votes | ' + band.playerVotes + ' | backstop finishes ' + band.backstopFinishes + ' |');
  console.log('| moot-attributed trust moves | ' + band.mootTrustMoves + ' (net ' + band.mootTrustNet + ') |');
  console.log('| exiles player / npc | ' + band.exilesPlayer + ' / ' + band.exilesNpc + ' | uprisings ' + band.uprisings + ' |');
  console.log('summary: ' + outFile);
}

if (require.main === module) main();

module.exports = { classifyCrimeEvent: classifyCrimeEvent, classifyCaseOpen: classifyCaseOpen, buildMootRecords: buildMootRecords, classifyMootRecord: classifyMootRecord, mootTrustSite: mootTrustSite, reconcileCases: reconcileCases, reconcileTrust: reconcileTrust, summarizeSeed: summarizeSeed, summarizeBand: summarizeBand };
