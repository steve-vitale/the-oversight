// analyze-fightallycap-b.js — classifier for arm sim-fightallycap-b
// (BUILD: a second ally slot in the fight engine — FIGHTALLY2=1 lets a
// second companion join and fight alongside the first; finding #2496).
// Reads the fightallycap driver corpora (ctl = VETREENGAGE=1, arm =
// VETREENGAGE=1 + FIGHTALLY2=1) and judges the frozen prereg bars
// (evidence/2026-11-17/sim-fightallycap-b-prereg.md):
//   B1 (PRIMARY): the second ally JOINS — mean joining allies >= 1.5
//       across armed-leg expedition-origin fought meetings with
//       alliesN >= 2 AND calledHelp. Judged ONLY when n >= 3 such
//       meetings on the armed leg; otherwise UNJUDGEABLE and the run
//       is NO-GO. Joining allies = (allyVid ? 1 : 0) + (ally2Vid ? 1 : 0).
//       Today this mean is exactly 1.0 by construction (one ally max).
//   B2 (SECONDARY, conditional): absolute damage share on launched
//       fought meetings — judged ONLY when >= 3 launched fought
//       meetings carry a captured share on the armed leg; pass iff
//       their mean share >= 0.10. Otherwise UNJUDGEABLE (the verdict
//       rides on B1 alone). Share = mDealt / mHpStart; a vKill meeting
//       shares at 1.0 by definition.
//   B3 (GUARDRAIL): expedition deaths armed <= control x 1.10 AND
//       total deaths armed <= control x 1.10.
//   Instrument: all files parse, 0 instrument errors, every FOUGHT
//       encounter row carries mHpStart. No-contact evades (rounds 0,
//       dealt 0 — no monster spawned) are correctly null and are not
//       counted missing; vKill rows carry no mHpStart (exact spawned
//       HP unrecoverable) and share at 1.0 by definition, and are not
//       counted missing either.
// Launch join (for fought meetings): a v4encounters row is a
// launched-party meeting iff some launch (v4departs result=launch)
// by the same vid (or with the fighter among its party) has
// target == mid (or target null) and meeting day in
// [launchDay, launchDay+21] (max expedition duration 8+12=20, +1).
// Launches are deduped by (vid, day) across the winPlanDepart +
// brain depart rows (both wraps can record one launch); partySize is
// the max across the group. The B1 population reads the encounter
// rows' own `joiningAllies` (expedition origin, fought, alliesN >= 2,
// calledHelp) — never the launch rows alone.
// Drift check: when the armed leg fields a second ally 0 times, the
// flag never changed behavior, so the two legs must be
// trajectory-identical (same seeds, same substrate flags) — any
// divergence is an instrument/code defect to investigate, never a
// lever effect.
// Usage:
//   node scripts/analyze-fightallycap-b.js <ctlDir> <armDir> [recDir]
//   EXPECTED_FILES=N overrides the per-leg file-count gate (default 8,
//   the pilot band). The confirm band runs 12 seeds per leg, so the
//   confirm runs with EXPECTED_FILES=12; the gate counts files, it
//   never touches a measurement.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EXPECTED_FILES = parseInt(process.env.EXPECTED_FILES || '8', 10) || 8;

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(a) { return a.length ? a.reduce(function (t, x) { return t + x; }, 0) / a.length : null; }

// Dedupe launch rows by (vid, day): the winPlanDepart wrap and the
// brain wrap can both record one launch. partySize is the max across
// the group; companions are the union. WAVE-4+ ONLY: a launch counts
// here iff its plan is wave-4+ by the launchfunnel rule (needWave
// >= 4, or the target is a wave-4 species) — the wraps record every
// win-plan depart, including wave-3 hunts (needWave 3 / null).
const W4_IDS = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function launchesForSeed(j) {
  const groups = {};
  for (const d of (j.v4departs || [])) {
    if (d.result !== 'launch') continue;
    if (!(((d.targetWave | 0) >= 4) || (d.target && W4_IDS.indexOf(d.target) !== -1))) continue;
    const k = d.vid + '|' + d.day;
    if (!groups[k]) groups[k] = { vid: d.vid, day: d.day, sources: [], partySize: 1, party: [], target: d.target || null, targetWave: d.targetWave || null, companion: null, companion2: null, companion3: null };
    const g = groups[k];
    if (g.sources.indexOf(d.source) === -1) g.sources.push(d.source);
    if ((d.partySize | 0) > g.partySize) g.partySize = d.partySize | 0;
    for (const p of (d.party || [])) if (p && g.party.indexOf(p) === -1) g.party.push(p);
    if (d.target && !g.target) g.target = d.target;
    if (d.companion && !g.companion) g.companion = d.companion;
    if (d.companion2 && !g.companion2) g.companion2 = d.companion2;
    if (d.companion3 && !g.companion3) g.companion3 = d.companion3;
  }
  return Object.keys(groups).map(function (k) { return groups[k]; });
}

function seedAnalysis(j) {
  const launches = launchesForSeed(j);
  const sizes = {};
  for (const l of launches) sizes[l.partySize] = (sizes[l.partySize] || 0) + 1;
  const fourthFills = launches.filter(function (l) { return l.partySize >= 4; }).length;
  const trioFills = launches.filter(function (l) { return l.partySize === 3; }).length;
  // companion3 picks at scoring (candidate carried one) and at commit.
  let c3cands = 0, c3commits = 0, c2cands = 0;
  for (const s of (j.dawnbidScores || [])) {
    for (const c of (s.cands || [])) {
      if (c && c.winPlanAction === 'party_launch') {
        if (c.companion2) c2cands++;
        if (c.companion3) c3cands++;
      }
    }
    if (s.commit && s.commit.winPlanAction === 'party_launch' && s.commit.companion3) c3commits++;
  }
  // Fought meetings + the launch join. Damage share needs mHpStart.
  // Instrument bar (revised, addendum): a row counts as missing HP
  // ONLY when it was a real fight (not a no-contact evade, which
  // correctly carries null) and not a kill (share 1.0 by definition).
  // recMismatch is diagnostic only: rows where the driver's post-call
  // recovery (mHpLeft + mDealt) disagrees with CONTACTREC's own
  // recorded spawn HP — a nonzero count is an investigation item,
  // never a silent re-score.
  const encounters = (j.v4encounters || []).slice();
  let missingHp = 0, recMismatch = 0;
  const meetings = [];
  for (const e of encounters) {
    const noContact = e.outcome === 'evade' || e.outcome === 'alreadyDead' ||
      (((e.rounds | 0) === 0) && ((e.mDealt | 0) === 0));
    const isKill = e.outcome === 'vKill';
    if (e.mHpStart == null && !noContact && !isKill) missingHp++;
    if (e.mHpStart != null && e.mHpStartRec != null && e.mHpStart !== e.mHpStartRec) recMismatch++;
    const share = isKill ? 1.0 : ((e.mHpStart != null && e.mHpStart > 0) ? (e.mDealt || 0) / e.mHpStart : null);
    let launched = null;
    for (const l of launches) {
      if (e.day < l.day || e.day > l.day + 21) continue;
      if (l.target && e.mid !== l.target) continue;
      const party = [l.vid].concat(l.party);
      if (e.vid === l.vid || party.indexOf(e.vid) !== -1) { launched = l; break; }
      if (e.allyVid && (e.allyVid === l.vid || party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
    }
    meetings.push({ day: e.day, vid: e.vid, mid: e.mid, wave: e.wave, outcome: e.outcome || null,
      rounds: e.rounds, mDealt: e.mDealt || 0, mHpStart: e.mHpStart != null ? e.mHpStart : null,
      share: share != null ? round(share, 4) : null, alliesN: e.alliesN, allyVid: e.allyVid || null,
      ally2Vid: e.ally2Vid || null, ally2Dealt: e.ally2Dealt | 0,
      joiningAllies: e.joiningAllies | 0,
      calledHelp: !!e.calledHelp, origin: e.origin || null,
      launched: !!launched, launchPartySize: launched ? launched.partySize : null,
      launchDay: launched ? launched.day : null });
  }
  const launchedMeetings = meetings.filter(function (m) { return m.launched; });
  const launchedShares = launchedMeetings.filter(function (m) { return m.share != null; }).map(function (m) { return m.share; });
  const size4Meetings = launchedMeetings.filter(function (m) { return m.launchPartySize >= 4; });
  const size4Shares = size4Meetings.filter(function (m) { return m.share != null; }).map(function (m) { return m.share; });
  // B1 POPULATION (prereg): expedition-origin FOUGHT meetings with
  // alliesN >= 2 where at least one ally joined. Fought = rounds > 0
  // or dealt > 0 (a no-contact evade never had a shout to answer).
  // joiningAllies is the fight record's own count (0/1/2) — today it
  // is exactly 1 on every such meeting by construction.
  const expFoughtA2 = meetings.filter(function (m) {
    return m.origin === 'expedition' && ((m.rounds | 0) > 0 || (m.mDealt | 0) > 0) && (m.alliesN | 0) >= 2;
  }).length;
  const b1Meetings = meetings.filter(function (m) {
    return m.origin === 'expedition' && ((m.rounds | 0) > 0 || (m.mDealt | 0) > 0) &&
      (m.alliesN | 0) >= 2 && m.calledHelp;
  });
  const b1Joins = b1Meetings.map(function (m) { return m.joiningAllies | 0; });
  const b1Dist = { 0: 0, 1: 0, 2: 0 };
  for (const jn of b1Joins) b1Dist[jn] = (b1Dist[jn] || 0) + 1;
  const b1SecondJoins = b1Meetings.filter(function (m) { return (m.joiningAllies | 0) === 2; }).length;
  // Companion pool distribution (scored dawns).
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  for (const row of (j.companionPool || [])) {
    poolDist.dawns++;
    const n = (row.eligible || []).length;
    if (n === 0) poolDist.eligible0++;
    else if (n === 1) poolDist.eligible1++;
    else if (n === 2) poolDist.eligible2++;
    else poolDist.eligible3plus++;
  }
  const deaths = j.deaths || [];
  const expedDeaths = deaths.filter(function (d) { return d.cause === 'expedition'; }).length;
  const starvDeaths = deaths.filter(function (d) { return d.cause === 'starvation'; }).length;
  const stats = j.winPlanStats || {};
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: (j.instrumentErrors || []).length,
    launches: launches.length, launchedSizes: sizes,
    fourthFills: fourthFills, trioFills: trioFills,
    c2cands: c2cands, c3cands: c3cands, c3commits: c3commits,
    partyTrios: stats.partyTrios || 0, partyQuads: stats.partyQuads || 0,
    encounters: encounters.length, missingHp: missingHp, recMismatch: recMismatch,
    meetings: meetings, launchedMeetings: launchedMeetings.length,
    launchedMeanShare: launchedShares.length ? round(mean(launchedShares), 4) : null,
    launchedSharesN: launchedShares.length,
    size4Meetings: size4Meetings.length,
    size4MeanShare: size4Shares.length ? round(mean(size4Shares), 4) : null,
    size4SharesN: size4Shares.length,
    expFoughtA2: expFoughtA2,
    b1N: b1Meetings.length,
    b1MeanJoins: b1Joins.length ? round(mean(b1Joins), 4) : null,
    b1Dist: b1Dist, b1SecondJoins: b1SecondJoins,
    poolDist: poolDist,
    deaths: deaths.length, expedDeaths: expedDeaths, starvDeaths: starvDeaths,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const sizes = {};
  let launches = 0, fourth = 0, trios = 0, c2cands = 0, c3cands = 0, c3commits = 0;
  let encounters = 0, missingHp = 0, recMismatch = 0, launchedMeetings = 0, size4Meetings = 0;
  let deaths = 0, exped = 0, starv = 0, errors = 0;
  let expFoughtA2 = 0, b1SecondJoins = 0;
  const b1Dist = { 0: 0, 1: 0, 2: 0 };
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  const allLaunchedShares = [], allSize4Shares = [], allB1Joins = [];
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    launches += s.launches; fourth += s.fourthFills; trios += s.trioFills;
    c2cands += s.c2cands; c3cands += s.c3cands; c3commits += s.c3commits;
    encounters += s.encounters; missingHp += s.missingHp; recMismatch += s.recMismatch || 0;
    launchedMeetings += s.launchedMeetings; size4Meetings += s.size4Meetings;
    deaths += s.deaths; exped += s.expedDeaths; starv += s.starvDeaths; errors += s.instrumentErrors;
    expFoughtA2 += s.expFoughtA2 || 0; b1SecondJoins += s.b1SecondJoins || 0;
    for (const k of Object.keys(b1Dist)) b1Dist[k] += (s.b1Dist || {})[k] || 0;
    for (const m of s.meetings) {
      if (m.origin === 'expedition' && ((m.rounds | 0) > 0 || (m.mDealt | 0) > 0) && (m.alliesN | 0) >= 2 && m.calledHelp) allB1Joins.push(m.joiningAllies | 0);
    }
    for (const k of Object.keys(s.launchedSizes)) sizes[k] = (sizes[k] || 0) + s.launchedSizes[k];
    for (const k of Object.keys(poolDist)) poolDist[k] += s.poolDist[k] || 0;
    for (const m of s.meetings) if (m.launched && m.share != null) allLaunchedShares.push(m.share);
    for (const m of s.meetings) if (m.launched && m.launchPartySize >= 4 && m.share != null) allSize4Shares.push(m.share);
  }
  return {
    files: leg.files.length, seeds: seeds.length,
    launches: launches, launchedSizes: sizes,
    fourthFills: fourth, trioFills: trios,
    c2cands: c2cands, c3cands: c3cands, c3commits: c3commits,
    encounters: encounters, missingHp: missingHp, recMismatch: recMismatch,
    launchedMeetings: launchedMeetings,
    launchedMeanShare: allLaunchedShares.length ? round(mean(allLaunchedShares), 4) : null,
    launchedSharesN: allLaunchedShares.length,
    size4Meetings: size4Meetings,
    size4MeanShare: allSize4Shares.length ? round(mean(allSize4Shares), 4) : null,
    size4SharesN: allSize4Shares.length,
    expFoughtA2: expFoughtA2,
    b1N: allB1Joins.length,
    b1MeanJoins: allB1Joins.length ? round(mean(allB1Joins), 4) : null,
    b1Dist: b1Dist, b1SecondJoins: b1SecondJoins,
    poolDist: poolDist,
    deaths: deaths, expedDeaths: exped, starvDeaths: starv,
    instrumentErrors: errors,
    survived: seeds.filter(function (s) { return !s.villageLost; }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      nationalStanding: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalRank: seeds.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: seeds,
  };
}

// Trajectory digest for the drift check (armed ≡ control when the
// second ally never joins): end-state + death count + daily day list.
function trajDigest(j) {
  return JSON.stringify({
    g: j.gameDays, s: j.standing, w: j.maxWave, r: j.scaleRank,
    de: (j.deaths || []).length,
    d: ((j.daily || []).map(function (x) { return x.day; })),
  });
}

// B1 (PRIMARY, prereg): mean joining allies >= 1.5 across armed-leg
// expedition-origin fought meetings with alliesN >= 2 AND calledHelp.
// Judged ONLY when n >= 3; otherwise UNJUDGEABLE and the run is NO-GO.
function judgeB1(armS) {
  if (armS.b1N >= 3) {
    return { judged: true, pass: (armS.b1MeanJoins != null && armS.b1MeanJoins >= 1.5),
      bar: 1.5, armMean: armS.b1MeanJoins, n: armS.b1N, dist: armS.b1Dist, secondJoins: armS.b1SecondJoins };
  }
  return { judged: false, pass: null, reason: 'fewer than 3 eligible expedition fought meetings with a join on the armed leg' };
}

// B2 (SECONDARY, prereg): absolute damage share on LAUNCHED fought
// meetings — judged ONLY when >= 3 launched fought meetings carry a
// captured share on the armed leg; pass iff their mean share >= 0.10.
// Otherwise UNJUDGEABLE (the verdict rides on B1 alone).
function judgeB2(armS) {
  if (armS.launchedSharesN >= 3) {
    return { judged: true, pass: (armS.launchedMeanShare != null && armS.launchedMeanShare >= 0.10),
      bar: 0.10, armMean: armS.launchedMeanShare, n: armS.launchedSharesN };
  }
  return { judged: false, pass: null, reason: 'fewer than 3 launched fought meetings with a captured share on the armed leg' };
}

function main() {
  const ctlDir = process.argv[2];
  const armDir = process.argv[3];
  const recDir = process.argv[4] || null;
  if (!ctlDir || !armDir) { console.error('FIGHTALLYCAP ANALYZE STOP: ctlDir and armDir required.'); process.exit(2); }
  const ctlRaw = loadDir(ctlDir);
  const armRaw = loadDir(armDir);
  const ctl = loadDir(ctlDir);
  const arm = loadDir(armDir);
  for (const k of Object.keys(ctl.bySeed)) ctl.bySeed[k] = seedAnalysis(ctl.bySeed[k]);
  for (const k of Object.keys(arm.bySeed)) arm.bySeed[k] = seedAnalysis(arm.bySeed[k]);
  const ctlS = summarize(ctl);
  const armS = summarize(arm);

  // Drift check: if the armed leg fields a second ally 0 times, the
  // flag never changed behavior, so the legs must be trajectory-identical.
  let driftDivergences = null;
  if (armS.b1SecondJoins === 0) {
    driftDivergences = 0;
    const divSeeds = [];
    for (const k of Object.keys(ctlRaw.bySeed)) {
      const a = ctlRaw.bySeed[k], b = armRaw.bySeed[k];
      if (!b) { driftDivergences++; divSeeds.push(k + ':missing'); continue; }
      if (trajDigest(a) !== trajDigest(b)) { driftDivergences++; divSeeds.push(k); }
    }
    driftDivergences = { count: driftDivergences, seeds: divSeeds };
  }
  // D2 (optional rec leg): recorder-off armed run must be
  // trajectory-identical to the armed leg.
  let d2Divergences = null;
  if (recDir) {
    const recRaw = loadDir(recDir);
    d2Divergences = 0;
    for (const k of Object.keys(armRaw.bySeed)) {
      const a = armRaw.bySeed[k], b = recRaw.bySeed[k];
      if (!b) { d2Divergences++; continue; }
      if (trajDigest(a) !== trajDigest(b)) d2Divergences++;
    }
  }

  const b1 = judgeB1(armS);
  const b1Pass = b1.judged && b1.pass;
  const b2 = judgeB2(armS);
  const b3Pass = armS.expedDeaths <= ctlS.expedDeaths * 1.10 && armS.deaths <= ctlS.deaths * 1.10;
  const instrClean = ctlS.instrumentErrors === 0 && armS.instrumentErrors === 0 &&
    ctlS.files === EXPECTED_FILES && armS.files === EXPECTED_FILES && ctlS.missingHp === 0 && armS.missingHp === 0;
  const verdict = (b1Pass && b3Pass && instrClean && (!b2.judged || b2.pass)) ? 'GO' : 'NO-GO';

  const out = {
    arm: 'fightallycap-b', run: 'fightallycap-b',
    ctlDir: path.basename(ctlDir), armDir: path.basename(armDir), recDir: recDir ? path.basename(recDir) : null,
    ctl: ctlS, arm: armS,
    drift: driftDivergences, d2Divergences: d2Divergences,
    bars: {
      b1Joining: b1,
      b2DamageShare: b2,
      b3Guardrail: { pass: b3Pass, expedDeaths: { ctl: ctlS.expedDeaths, arm: armS.expedDeaths, limit: round(ctlS.expedDeaths * 1.10, 1) },
        deaths: { ctl: ctlS.deaths, arm: armS.deaths, limit: round(ctlS.deaths * 1.10, 1) } },
      instrument: { pass: instrClean, ctlErrors: ctlS.instrumentErrors, armErrors: armS.instrumentErrors,
        ctlFiles: ctlS.files, armFiles: armS.files, missingHp: { ctl: ctlS.missingHp, arm: armS.missingHp },
        recMismatch: { ctl: ctlS.recMismatch, arm: armS.recMismatch } },
    },
    verdict: verdict,
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-17', 'fightallycap-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== fightallycap-b (ctl -> arm) ===');
  console.log('launches: ' + ctlS.launches + ' -> ' + armS.launches +
    '  sizes ctl ' + JSON.stringify(ctlS.launchedSizes) + ' arm ' + JSON.stringify(armS.launchedSizes));
  console.log('B1 joining allies: ctl mean ' + ctlS.b1MeanJoins + ' (n=' + ctlS.b1N + ', dist ' + JSON.stringify(ctlS.b1Dist) + ')' +
    '  arm mean ' + armS.b1MeanJoins + ' (n=' + armS.b1N + ', dist ' + JSON.stringify(armS.b1Dist) + ', secondJoins ' + armS.b1SecondJoins + ')' +
    '  expFoughtA2 ctl/arm ' + ctlS.expFoughtA2 + '/' + armS.expFoughtA2);
  console.log('c2cands: ' + ctlS.c2cands + ' -> ' + armS.c2cands +
    '  c3cands: ' + ctlS.c3cands + ' -> ' + armS.c3cands + '  c3commits: ' + ctlS.c3commits + ' -> ' + armS.c3commits);
  console.log('pool: ctl ' + JSON.stringify(ctlS.poolDist) + ' arm ' + JSON.stringify(armS.poolDist));
  console.log('launched meetings: ' + ctlS.launchedMeetings + ' -> ' + armS.launchedMeetings +
    '  mean share ctl ' + ctlS.launchedMeanShare + ' (n=' + ctlS.launchedSharesN + ')' +
    '  size4 meetings arm ' + armS.size4Meetings + ' mean share ' + armS.size4MeanShare + ' (n=' + armS.size4SharesN + ')');
  console.log('deaths: ' + ctlS.deaths + ' -> ' + armS.deaths +
    '  exped: ' + ctlS.expedDeaths + ' -> ' + armS.expedDeaths + '  starv: ' + ctlS.starvDeaths + ' -> ' + armS.starvDeaths);
  console.log('wall ctl: ' + JSON.stringify(ctlS.wall) + ' medianSurvival ' + ctlS.medianSurvival);
  console.log('wall arm: ' + JSON.stringify(armS.wall) + ' medianSurvival ' + armS.medianSurvival);
  console.log('drift (secondJoins=0 => identical): ' + JSON.stringify(driftDivergences) + '  d2div: ' + d2Divergences);
  console.log('bars: B1=' + (b1.judged ? (b1.pass ? 'PASS' : 'FAIL') : 'UNJUDGEABLE') + ' B2=' + (b2.judged ? (b2.pass ? 'PASS' : 'FAIL') : 'UNJUDGEABLE') +
    ' B3=' + (b3Pass ? 'PASS' : 'FAIL') + ' instrument=' + (instrClean ? 'CLEAN' : 'DIRTY') +
    ' recMismatch ctl/arm=' + ctlS.recMismatch + '/' + armS.recMismatch);
  console.log('VERDICT: ' + verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!b1Pass || !b3Pass || !instrClean || (b2.judged && !b2.pass)) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { launchesForSeed: launchesForSeed, seedAnalysis: seedAnalysis, summarize: summarize, trajDigest: trajDigest, judgeB1: judgeB1, judgeB2: judgeB2 };
