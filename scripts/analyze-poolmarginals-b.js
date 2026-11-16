// analyze-poolmarginals-b.js — classifier for arm sim-poolmarginals-b (DIAG).
// Requires the companionpool analyzer (not copied): reuses its
// classifyPool for the plan-instance buckets + first-fail decomposition,
// then computes the per-condition MARGINAL table from the raw pool rows'
// `members` arrays joined to the classified dawns.
// Frozen definitions: evidence/2026-11-16/sim-poolmarginals-b-prereg.md.
// A scored dawn is MARGINAL-CLASSIFIED iff it is companionpool-classified
// AND its pool row carries a valid `members` array (length == rosterN,
// every member's firstFail matches the row's fails map, firstFail
// tallies equal the row's counts, and every non-self member carries its
// flag fields). Anything else is `unknown` and fails the run.
// Populations: Pop-A = non-self members (dead marginal over Pop-A);
// Pop-B = living non-self members (the other six flags over Pop-B).
// Usage:
//   node scripts/analyze-poolmarginals-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/poolmarginals-b-analysis.json. Exits 0 iff
// every plan-holder scored dawn in the instrument leg is classified
// with full per-member profiles (unknown == 0), all files parse, and no
// instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const COMPANION = require(path.join(REPO, 'scripts', 'analyze-companionpool-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const MARGINAL_CONDITIONS = ['away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'];
const MARGINAL_PAIRS = [['trustLow', 'away'], ['trustLow', 'notRanger'], ['away', 'notRanger']];
const BUCKETS = COMPANION.BUCKETS;

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

// flagsFor(member, haven): the six Pop-B condition flags from the
// member's EFFECTIVE values — the same effective values the first-fail
// loop uses (trust default 10, node-null -> not-at-Haven,
// profile-null -> not-ranger). Self/scholar members never reach here.
function flagsFor(m, haven) {
  const atHaven = !!(m.node && haven && m.node.nx === haven.nx && m.node.ny === haven.ny);
  return {
    away: m.away === true,
    trustLow: typeof m.trust === 'number' && m.trust < 15,
    notAtHaven: !atHaven,
    engaged: m.engaged === true,
    notRanger: m.profile !== 'wanderer' && m.profile !== 'explorer',
    onExped: m.onExped === true,
  };
}

// classifyMarginals(j): companionpool classification + members validation
// + marginal aggregates over the marginal-classified dawns.
function classifyMarginals(j) {
  const base = COMPANION.classifyPool(j);
  const poolRows = (j.companionPool || []).slice();
  const byKey = {};
  for (const r of poolRows) {
    if (r && r.vid != null && r.day != null) byKey[r.vid + '|' + r.day + '|' + (r.target || '')] = r;
  }
  const marginalUnknownList = [];
  for (const d of base.unknownList) marginalUnknownList.push({ vid: d.vid, target: d.target, day: d.day, reason: d.reason });

  // Marginal aggregates (over marginal-classified dawns only).
  const agg = {
    popA: 0, popB: 0, dead: 0,
    cond: {}, pair: {}, alone: {}, inCombo: {},
    unknownNode: 0, unknownProfile: 0, trustDefaulted: 0,
  };
  for (const c of MARGINAL_CONDITIONS) { agg.cond[c] = 0; agg.alone[c] = 0; agg.inCombo[c] = 0; }
  for (const p of MARGINAL_PAIRS) agg.pair[p.join('x')] = 0;

  let marginalClassified = 0;
  for (const dawn of base.poolDawns) {
    dawn.marginalClassified = false;
    dawn.marginalUnknownReason = null;
    if (!dawn.classified) {
      dawn.marginalUnknownReason = dawn.unknownReason;
      continue;
    }
    const row = byKey[dawn.vid + '|' + dawn.day + '|' + (dawn.target || '')] || null;
    let reason = null;
    if (!row) reason = 'members-missing';
    else if (!Array.isArray(row.members)) reason = 'members-missing';
    else if (row.members.length !== row.rosterN) reason = 'members-length:' + row.members.length + '!=' + row.rosterN;
    else {
      // Every member's firstFail must match the fails map, and the
      // firstFail tallies must equal the row's counts.
      const tally = {};
      for (const c of Object.keys(row.counts || {})) tally[c] = 0;
      for (const m of row.members) {
        if (!m || m.id == null || m.firstFail == null) { reason = 'members-shape'; break; }
        if ((row.fails || {})[m.id] !== m.firstFail) { reason = 'members-fails-mismatch:' + m.id; break; }
        tally[m.firstFail] = (tally[m.firstFail] || 0) + 1;
        if (m.firstFail !== 'selfOrScholar') {
          if (typeof m.trust !== 'number' || typeof m.away !== 'boolean' || typeof m.engaged !== 'boolean' ||
            typeof m.onExped !== 'boolean' || typeof m.alive !== 'boolean' ||
            !(typeof m.profile === 'string' || m.profile === null) ||
            !(m.node === null || (typeof m.node === 'object' && typeof m.node.nx === 'number'))) {
            reason = 'members-shape:' + m.id; break;
          }
        }
      }
      if (!reason) {
        for (const c of Object.keys(row.counts || {})) {
          if ((tally[c] || 0) !== (row.counts[c] | 0)) { reason = 'members-counts-mismatch:' + c; break; }
        }
      }
    }
    if (reason) {
      dawn.marginalUnknownReason = reason;
      marginalUnknownList.push({ vid: dawn.vid, target: dawn.target, day: dawn.day, reason: reason });
      continue;
    }
    // Valid members: accumulate the marginals.
    dawn.marginalClassified = true;
    marginalClassified++;
    const haven = row.haven || null;
    for (const m of row.members) {
      if (m.firstFail === 'selfOrScholar') continue;
      agg.popA++;
      if (m.alive === false) { agg.dead++; continue; }
      agg.popB++;
      if (m.node === null) agg.unknownNode++;
      if (m.profile === null) agg.unknownProfile++;
      if (m.trustRaw === null || m.trustRaw === undefined) agg.trustDefaulted++;
      const f = flagsFor(m, haven);
      let trueCount = 0;
      for (const c of MARGINAL_CONDITIONS) if (f[c]) { agg.cond[c]++; trueCount++; }
      for (const p of MARGINAL_PAIRS) if (f[p[0]] && f[p[1]]) agg.pair[p.join('x')]++;
      for (const c of MARGINAL_CONDITIONS) {
        if (!f[c]) continue;
        if (trueCount === 1) agg.alone[c]++;
        else agg.inCombo[c]++;
      }
    }
  }

  const marginalUnknown = base.poolDawns.length - marginalClassified;
  return Object.assign({}, base, {
    marginalScoredDawns: base.poolDawns.length,
    marginalClassifiedDawns: marginalClassified,
    marginalUnknownDawns: marginalUnknown,
    marginalUnknownList: marginalUnknownList,
    marginals: agg,
  });
}

function marginalShares(agg) {
  const shares = {};
  shares.dead = agg.popA ? round(agg.dead / agg.popA, 4) : null;
  for (const c of MARGINAL_CONDITIONS) shares[c] = agg.popB ? round(agg.cond[c] / agg.popB, 4) : null;
  const pairs = {};
  for (const p of MARGINAL_PAIRS) {
    const key = p.join('x');
    const both = agg.pair[key];
    pairs[key] = {
      both: both,
      shareOfPopB: agg.popB ? round(both / agg.popB, 4) : null,
      pFirstGivenSecond: agg.cond[p[1]] ? round(both / agg.cond[p[1]], 4) : null,
      pSecondGivenFirst: agg.cond[p[0]] ? round(both / agg.cond[p[0]], 4) : null,
    };
  }
  const aloneCombo = {};
  for (const c of MARGINAL_CONDITIONS) {
    aloneCombo[c] = {
      alone: agg.alone[c], inCombo: agg.inCombo[c],
      aloneShareOfTrue: agg.cond[c] ? round(agg.alone[c] / agg.cond[c], 4) : null,
      inComboShareOfTrue: agg.cond[c] ? round(agg.inCombo[c] / agg.cond[c], 4) : null,
    };
  }
  return { popA: agg.popA, popB: agg.popB, dead: agg.dead, shares: shares, pairs: pairs, aloneCombo: aloneCombo,
    unknownNode: agg.unknownNode, unknownProfile: agg.unknownProfile, trustDefaulted: agg.trustDefaulted };
}

function summarizeMarginals(leg) {
  const firstFail = COMPANION.summarizePool(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const agg = {
    popA: 0, popB: 0, dead: 0,
    cond: {}, pair: {}, alone: {}, inCombo: {},
    unknownNode: 0, unknownProfile: 0, trustDefaulted: 0,
  };
  for (const c of MARGINAL_CONDITIONS) { agg.cond[c] = 0; agg.alone[c] = 0; agg.inCombo[c] = 0; }
  for (const p of MARGINAL_PAIRS) agg.pair[p.join('x')] = 0;
  let scored = 0, classified = 0, unknown = 0;
  const wallDetail = [];
  for (const s of seeds) {
    scored += s.marginalScoredDawns;
    classified += s.marginalClassifiedDawns;
    unknown += s.marginalUnknownDawns;
    const m = s.marginals;
    agg.popA += m.popA; agg.popB += m.popB; agg.dead += m.dead;
    for (const c of MARGINAL_CONDITIONS) { agg.cond[c] += m.cond[c]; agg.alone[c] += m.alone[c]; agg.inCombo[c] += m.inCombo[c]; }
    for (const p of MARGINAL_PAIRS) agg.pair[p.join('x')] += m.pair[p.join('x')];
    agg.unknownNode += m.unknownNode; agg.unknownProfile += m.unknownProfile; agg.trustDefaulted += m.trustDefaulted;
    wallDetail.push({ seed: s.seed, standing: s.standing, scaleRank: s.scaleRank,
      nationalByStanding: (s.standing || 0) >= 200, nationalByRank: s.scaleRank === 'national',
      won: !!s.won, maxWave: s.maxWave, gameDays: s.gameDays });
  }
  return {
    firstFail: firstFail,
    marginalScoredDawns: scored,
    marginalClassifiedDawns: classified,
    marginalUnknownDawns: unknown,
    marginalClassifiedShare: scored ? round(classified / scored, 4) : null,
    marginals: marginalShares(agg),
    wallDetail: wallDetail,
    wall: {
      nationalByStanding: wallDetail.filter(function (w) { return w.nationalByStanding; }).length,
      nationalByRank: wallDetail.filter(function (w) { return w.nationalByRank; }).length,
      table: 0, wins: wallDetail.filter(function (w) { return w.won; }).length,
      wave4: wallDetail.filter(function (w) { return (w.maxWave || 1) >= 4; }).length,
      wave5: wallDetail.filter(function (w) { return (w.maxWave || 1) >= 5; }).length,
    },
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    perSeed: seeds.map(function (s) {
      return { seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
        standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
        seedCallsW4: s.seedCallsW4, instancesOpened: s.instancesOpened,
        scoredDawns: s.marginalScoredDawns, classifiedDawns: s.marginalClassifiedDawns,
        unknownDawns: s.marginalUnknownDawns, eligible0Dawns: s.eligibleHist['0'],
        byBucket: s.byBucket };
    }),
  };
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('POOLMARGINALS ANALYZE STOP: instrumentDir required.'); process.exit(2); }
  // Wave-4 id set check (frozen list vs live data).
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const inst = loadDir(instrumentDir);
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifyMarginals(inst.bySeed[k]);
  const instSummary = summarizeMarginals(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifyMarginals(ctrl.bySeed[k]);
    ctrlSummary = summarizeMarginals(ctrl);
  }
  const instErrors = instSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = instSummary.marginalScoredDawns > 0 && instSummary.marginalClassifiedShare >= 0.9 && instSummary.marginalUnknownDawns === 0;
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.firstFail.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'poolmarginals-b', run: 'poolmarginals-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    bars: {
      classification: { pass: bar1, classifiedShare: instSummary.marginalClassifiedShare, unknown: instSummary.marginalUnknownDawns, scoredDawns: instSummary.marginalScoredDawns, classifiedDawns: instSummary.marginalClassifiedDawns },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.firstFail.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'poolmarginals-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  const ff = instSummary.firstFail;
  const mg = instSummary.marginals;
  console.log('=== poolmarginals-b marginal decomposition (instrument leg) ===');
  console.log('seeds: ' + ff.seeds + '  files: ' + ff.files +
    '  seedCallsW4: ' + ff.seedCallsW4 + '  instancesOpened: ' + ff.instancesOpened);
  console.log('scoredDawns: ' + instSummary.marginalScoredDawns + '  classified(with members): ' + instSummary.marginalClassifiedDawns +
    '  unknown: ' + instSummary.marginalUnknownDawns + '  share: ' + instSummary.marginalClassifiedShare);
  console.log('first-fail counts: ' + JSON.stringify(ff.pooledCounts) + ' over ' + ff.pooledChecks + ' checks');
  console.log('marginal populations: popA(non-self)=' + mg.popA + ' popB(living non-self)=' + mg.popB);
  console.log('marginal shares: ' + JSON.stringify(mg.shares));
  console.log('co-occurrence pairs: ' + JSON.stringify(mg.pairs));
  console.log('alone vs in-combo: ' + JSON.stringify(mg.aloneCombo));
  console.log('eligible histogram: ' + JSON.stringify(ff.eligibleHist) + '  eligible0Share: ' + ff.eligible0Share);
  console.log('wall (instrument): ' + JSON.stringify(instSummary.wall) + '  medianSurvival: ' + instSummary.medianSurvival);
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('seeds: ' + ctrlSummary.firstFail.seeds + '  files: ' + ctrlSummary.firstFail.files +
      '  seedCallsW4: ' + ctrlSummary.firstFail.seedCallsW4 + '  instancesOpened: ' + ctrlSummary.firstFail.instancesOpened +
      '  scoredDawns: ' + ctrlSummary.marginalScoredDawns + '  classified: ' + ctrlSummary.marginalClassifiedDawns +
      '  unknown: ' + ctrlSummary.marginalUnknownDawns);
    console.log('wall (control): ' + JSON.stringify(ctrlSummary.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyMarginals: classifyMarginals, summarizeMarginals: summarizeMarginals, flagsFor: flagsFor, MARGINAL_CONDITIONS: MARGINAL_CONDITIONS, MARGINAL_PAIRS: MARGINAL_PAIRS };
