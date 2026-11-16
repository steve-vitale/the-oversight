// analyze-profileshadow-a.js — classifier for arm sim-profileshadow-a (DIAG).
// Requires the poolmarginals analyzer (not copied): reuses its
// classifyMarginals for the plan-instance buckets + first-fail
// decomposition + marginals, then computes the SHADOW tables from the
// raw pool rows' `shadow` objects joined to the marginal-classified
// dawns: per shadow (S0 current gates / S1 profile dropped / S2
// foragers admitted) the eligible histogram, eligible-0 share,
// would-be-biddable dawns, and the would-be companion identity
// distribution (picked profile), plus the comparison against ACTUAL
// launches on the same band. Frozen definitions:
// evidence/2026-11-16/sim-profileshadow-a-prereg.md.
// A scored dawn is SHADOW-CLASSIFIED iff it is marginal-classified
// AND its pool row carries a valid `shadow` object (s0/s1/s2 each with
// eligible/rankedPick/rankedVia/pickProfile/profileCounts; S0 eligible
// set == the row's eligible set; S0 rankedPick == the row's
// rankedPick; rankedPick non-null iff eligible non-empty; eligible a
// subset of the row's non-self living members; S0 ⊆ S2 ⊆ S1 as sets;
// profileCounts sums to the eligible count; pickProfile matches the
// ranked pick's member profile). Anything else is `unknown` and fails
// the run.
// Usage:
//   node scripts/analyze-profileshadow-a.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/profileshadow-a-analysis.json. Exits 0 iff
// every plan-holder scored dawn in the instrument leg is
// shadow-classified (unknown == 0), all files parse, no instrument
// errors, and S0 agrees with the real findCompanion pick on 100% of
// biddable dawns.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const MARGINALS = require(path.join(REPO, 'scripts', 'analyze-poolmarginals-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const SHADOWS = ['s0', 's1', 's2'];
const PROFILE_KEYS = ['explorer', 'wanderer', 'forager', 'homebody', 'null'];
const BUCKETS = MARGINALS.BUCKETS || require(path.join(REPO, 'scripts', 'analyze-companionpool-b.js')).BUCKETS;

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
function setEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const sa = a.slice().sort();
  const sb = b.slice().sort();
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
  return true;
}
function isSubset(sub, sup) {
  const s = new Set(sup);
  for (const x of sub) if (!s.has(x)) return false;
  return true;
}

function emptyShadowAgg() {
  const per = {};
  for (const sh of SHADOWS) {
    per[sh] = {
      hist: { '0': 0, '1': 0, '2': 0, '3+': 0 },
      eligible0: 0, biddable: 0, eligibleTotal: 0,
      pickProfileCounts: { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 },
      pooledProfileCounts: { explorer: 0, wanderer: 0, forager: 0, homebody: 0, null: 0 },
      nullProfileEligible: 0,
    };
  }
  return {
    per: per,
    paired: { s0ZeroS1Open: 0, s0ZeroS2Open: 0, s0ZeroS1Zero: 0 },
    s0Agreement: { biddableDawns: 0, agreeDawns: 0 },
  };
}

// classifyShadow(j): marginal classification + shadow validation +
// shadow aggregates over the shadow-classified dawns.
function classifyShadow(j) {
  const base = MARGINALS.classifyMarginals(j);
  const poolRows = (j.companionPool || []).slice();
  const byKey = {};
  for (const r of poolRows) {
    if (r && r.vid != null && r.day != null) byKey[r.vid + '|' + r.day + '|' + (r.target || '')] = r;
  }
  const shadowUnknownList = [];
  for (const d of base.marginalUnknownList) shadowUnknownList.push({ vid: d.vid, target: d.target, day: d.day, reason: d.reason });

  const agg = emptyShadowAgg();
  const aggW4 = emptyShadowAgg();
  let shadowClassified = 0;

  // Guard metric inputs (report, do not judge).
  const deaths = (j.deaths || []);
  const guard = {
    totalDeaths: deaths.length,
    expeditionDeaths: deaths.filter(function (d) { return d && d.cause === 'expedition'; }).length,
  };

  for (const dawn of base.poolDawns) {
    dawn.shadowClassified = false;
    dawn.shadowUnknownReason = null;
    if (!dawn.marginalClassified) {
      dawn.shadowUnknownReason = dawn.marginalUnknownReason;
      continue;
    }
    const row = byKey[dawn.vid + '|' + dawn.day + '|' + (dawn.target || '')] || null;
    let reason = null;
    let sh = null;
    if (!row) reason = 'shadow-missing';
    else if (!row.shadow || typeof row.shadow !== 'object') reason = 'shadow-missing';
    else {
      sh = row.shadow;
      for (const s of SHADOWS) {
        const o = sh[s];
        if (!o || !Array.isArray(o.eligible) || !('rankedPick' in o) || typeof o.rankedVia !== 'string' ||
          !('pickProfile' in o) || !o.profileCounts || typeof o.profileCounts !== 'object') {
          reason = 'shadow-shape:' + s; break;
        }
        if (o.eligible.length > 0 && !o.rankedPick) { reason = 'shadow-no-pick:' + s; break; }
        if (o.eligible.length === 0 && o.rankedPick) { reason = 'shadow-pick-no-eligible:' + s; break; }
        let pcSum = 0;
        for (const k of PROFILE_KEYS) pcSum += (o.profileCounts[k] | 0);
        if (pcSum !== o.eligible.length) { reason = 'shadow-counts-mismatch:' + s; break; }
      }
      if (!reason) {
        // S0 must reproduce the row's own eligible set + ranked pick.
        if (!setEq(sh.s0.eligible, row.eligible || [])) reason = 'shadow-s0-mismatch:eligible';
        else if (sh.s0.rankedPick !== row.rankedPick) reason = 'shadow-s0-mismatch:pick';
      }
      if (!reason) {
        // Eligible must be non-self living members; nesting S0 ⊆ S2 ⊆ S1.
        const memberById = {};
        for (const m of (row.members || [])) if (m && m.id != null) memberById[m.id] = m;
        for (const s of SHADOWS) {
          for (const id of sh[s].eligible) {
            const m = memberById[id];
            if (!m || m.firstFail === 'selfOrScholar' || m.alive === false) { reason = 'shadow-not-member:' + s + ':' + id; break; }
            if (s === 's0' || s === 's2') {
              if (s === 's0' && m.profile !== 'wanderer' && m.profile !== 'explorer') { reason = 'shadow-profile:' + s + ':' + id; break; }
              if (s === 's2' && m.profile !== 'wanderer' && m.profile !== 'explorer' && m.profile !== 'forager') { reason = 'shadow-profile:' + s + ':' + id; break; }
            }
          }
          if (reason) break;
          // pickProfile must match the ranked pick's member profile.
          if (sh[s].rankedPick != null) {
            const pm = memberById[sh[s].rankedPick];
            if (!pm) { reason = 'shadow-pick-not-member:' + s; break; }
            const pp = (pm.profile != null ? pm.profile : null);
            if (sh[s].pickProfile !== pp) { reason = 'shadow-pickprofile-mismatch:' + s; break; }
          } else if (sh[s].pickProfile !== null) { reason = 'shadow-pickprofile-nonnull:' + s; break; }
        }
      }
      if (!reason) {
        if (!isSubset(sh.s0.eligible, sh.s2.eligible) || !isSubset(sh.s2.eligible, sh.s1.eligible)) reason = 'shadow-not-nested';
      }
    }
    if (reason) {
      dawn.shadowUnknownReason = reason;
      shadowUnknownList.push({ vid: dawn.vid, target: dawn.target, day: dawn.day, reason: reason });
      continue;
    }
    // Valid shadow: accumulate.
    dawn.shadowClassified = true;
    shadowClassified++;
    const targets = [agg];
    if (W4_SET.has(dawn.target)) targets.push(aggW4);
    for (const t of targets) {
      for (const s of SHADOWS) {
        const o = sh[s];
        const n = o.eligible.length;
        const hk = n >= 3 ? '3+' : String(n);
        t.per[s].hist[hk]++;
        if (n === 0) t.per[s].eligible0++;
        else t.per[s].biddable++;
        t.per[s].eligibleTotal += n;
        if (n > 0) {
          const pk = o.pickProfile != null ? o.pickProfile : 'null';
          if (PROFILE_KEYS.indexOf(pk) !== -1) t.per[s].pickProfileCounts[pk]++;
          t.per[s].nullProfileEligible += (o.profileCounts['null'] | 0);
        }
        for (const k of PROFILE_KEYS) t.per[s].pooledProfileCounts[k] += (o.profileCounts[k] | 0);
      }
      if (sh.s0.eligible.length === 0 && sh.s1.eligible.length > 0) t.paired.s0ZeroS1Open++;
      if (sh.s0.eligible.length === 0 && sh.s2.eligible.length > 0) t.paired.s0ZeroS2Open++;
      if (sh.s0.eligible.length === 0 && sh.s1.eligible.length === 0) t.paired.s0ZeroS1Zero++;
    }
    // S0 agreement with the real findCompanion pick on biddable dawns.
    if (dawn.bidCompanion != null) {
      agg.s0Agreement.biddableDawns++;
      if (sh.s0.rankedPick === dawn.bidCompanion) agg.s0Agreement.agreeDawns++;
      if (W4_SET.has(dawn.target)) {
        aggW4.s0Agreement.biddableDawns++;
        if (sh.s0.rankedPick === dawn.bidCompanion) aggW4.s0Agreement.agreeDawns++;
      }
    }
  }

  const shadowUnknown = base.poolDawns.length - shadowClassified;
  return Object.assign({}, base, {
    shadowScoredDawns: base.poolDawns.length,
    shadowClassifiedDawns: shadowClassified,
    shadowUnknownDawns: shadowUnknown,
    shadowUnknownList: shadowUnknownList,
    shadow: agg,
    shadowW4: aggW4,
    guard: guard,
  });
}

function shadowShares(agg, classifiedDawns) {
  const out = { per: {}, paired: agg.paired, s0Agreement: agg.s0Agreement };
  for (const s of SHADOWS) {
    const p = agg.per[s];
    out.per[s] = {
      hist: p.hist,
      eligible0: p.eligible0,
      eligible0Share: classifiedDawns ? round(p.eligible0 / classifiedDawns, 4) : null,
      biddable: p.biddable,
      biddableShare: classifiedDawns ? round(p.biddable / classifiedDawns, 4) : null,
      eligibleTotal: p.eligibleTotal,
      meanEligible: classifiedDawns ? round(p.eligibleTotal / classifiedDawns, 4) : null,
      pickProfileCounts: p.pickProfileCounts,
      pickProfileShares: {},
      pooledProfileCounts: p.pooledProfileCounts,
      nullProfileEligible: p.nullProfileEligible,
    };
    for (const k of PROFILE_KEYS) {
      out.per[s].pickProfileShares[k] = p.biddable ? round(p.pickProfileCounts[k] / p.biddable, 4) : null;
    }
  }
  out.s0Agreement.agreementShare = agg.s0Agreement.biddableDawns ?
    round(agg.s0Agreement.agreeDawns / agg.s0Agreement.biddableDawns, 4) : null;
  return out;
}

function summarizeShadow(leg) {
  const baseSummary = MARGINALS.summarizeMarginals(leg);
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const agg = emptyShadowAgg();
  const aggW4 = emptyShadowAgg();
  let scored = 0, classified = 0, unknown = 0;
  let guardTotal = 0, guardExped = 0;
  const perSeed = [];
  for (const s of seeds) {
    scored += s.shadowScoredDawns;
    classified += s.shadowClassifiedDawns;
    unknown += s.shadowUnknownDawns;
    guardTotal += s.guard.totalDeaths;
    guardExped += s.guard.expeditionDeaths;
    for (const sname of SHADOWS) {
      for (const hk of Object.keys(agg.per[sname].hist)) agg.per[sname].hist[hk] += s.shadow.per[sname].hist[hk];
      agg.per[sname].eligible0 += s.shadow.per[sname].eligible0;
      agg.per[sname].biddable += s.shadow.per[sname].biddable;
      agg.per[sname].eligibleTotal += s.shadow.per[sname].eligibleTotal;
      for (const k of PROFILE_KEYS) {
        agg.per[sname].pickProfileCounts[k] += s.shadow.per[sname].pickProfileCounts[k];
        agg.per[sname].pooledProfileCounts[k] += s.shadow.per[sname].pooledProfileCounts[k];
      }
      agg.per[sname].nullProfileEligible += s.shadow.per[sname].nullProfileEligible;
      for (const hk of Object.keys(aggW4.per[sname].hist)) aggW4.per[sname].hist[hk] += s.shadowW4.per[sname].hist[hk];
      aggW4.per[sname].eligible0 += s.shadowW4.per[sname].eligible0;
      aggW4.per[sname].biddable += s.shadowW4.per[sname].biddable;
      aggW4.per[sname].eligibleTotal += s.shadowW4.per[sname].eligibleTotal;
      for (const k of PROFILE_KEYS) {
        aggW4.per[sname].pickProfileCounts[k] += s.shadowW4.per[sname].pickProfileCounts[k];
        aggW4.per[sname].pooledProfileCounts[k] += s.shadowW4.per[sname].pooledProfileCounts[k];
      }
      aggW4.per[sname].nullProfileEligible += s.shadowW4.per[sname].nullProfileEligible;
    }
    for (const k of Object.keys(agg.paired)) {
      agg.paired[k] += s.shadow.paired[k];
      aggW4.paired[k] += s.shadowW4.paired[k];
    }
    agg.s0Agreement.biddableDawns += s.shadow.s0Agreement.biddableDawns;
    agg.s0Agreement.agreeDawns += s.shadow.s0Agreement.agreeDawns;
    aggW4.s0Agreement.biddableDawns += s.shadowW4.s0Agreement.biddableDawns;
    aggW4.s0Agreement.agreeDawns += s.shadowW4.s0Agreement.agreeDawns;
    perSeed.push({
      seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
      standing: s.standing, scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
      seedCallsW4: s.seedCallsW4, instancesOpened: s.instancesOpened,
      scoredDawns: s.shadowScoredDawns, classifiedDawns: s.shadowClassifiedDawns,
      unknownDawns: s.shadowUnknownDawns,
      eligible0: { s0: s.shadow.per.s0.eligible0, s1: s.shadow.per.s1.eligible0, s2: s.shadow.per.s2.eligible0 },
      biddable: { s0: s.shadow.per.s0.biddable, s1: s.shadow.per.s1.biddable, s2: s.shadow.per.s2.biddable },
      byBucket: s.byBucket,
      guard: s.guard,
    });
  }
  const w4Classified = seeds.reduce(function (t, s) {
    return t + (s.poolDawns || []).filter(function (d) { return d.shadowClassified && W4_SET.has(d.target); }).length;
  }, 0);
  return {
    marginals: baseSummary,
    shadowScoredDawns: scored,
    shadowClassifiedDawns: classified,
    shadowUnknownDawns: unknown,
    shadowClassifiedShare: scored ? round(classified / scored, 4) : null,
    shadow: shadowShares(agg, classified),
    shadowW4: shadowShares(aggW4, w4Classified),
    shadowW4ClassifiedDawns: w4Classified,
    launchedInstances: baseSummary.firstFail.byBucket.launched || 0,
    guard: { totalDeaths: guardTotal, expeditionDeaths: guardExped },
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    perSeed: perSeed,
  };
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('PROFILESHADOW ANALYZE STOP: instrumentDir required.'); process.exit(2); }
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
  for (const k of Object.keys(inst.bySeed)) inst.bySeed[k] = classifyShadow(inst.bySeed[k]);
  const instSummary = summarizeShadow(inst);
  let ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    for (const k of Object.keys(ctrl.bySeed)) ctrl.bySeed[k] = classifyShadow(ctrl.bySeed[k]);
    ctrlSummary = summarizeShadow(ctrl);
  }
  const instErrors = instSummary.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.marginals.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const agree = instSummary.shadow.s0Agreement;
  const bar1 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.marginals.firstFail.files === 8) &&
    instErrors === 0 && ctrlErrors === 0 &&
    agree.agreeDawns === agree.biddableDawns;
  const bar2 = instSummary.shadowScoredDawns > 0 && instSummary.shadowClassifiedShare === 1 && instSummary.shadowUnknownDawns === 0;

  const out = {
    arm: 'profileshadow-a', run: 'profileshadow-a',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: instSummary, control: ctrlSummary,
    bars: {
      instrumentValid: { pass: bar1, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.marginals.firstFail.files : null,
        instrumentErrors: instErrors, controlErrors: ctrlErrors,
        s0Agreement: agree.biddableDawns + '/' + agree.agreeDawns, agreementShare: agree.agreementShare },
      shadowComplete: { pass: bar2, classifiedShare: instSummary.shadowClassifiedShare, unknown: instSummary.shadowUnknownDawns,
        scoredDawns: instSummary.shadowScoredDawns, classifiedDawns: instSummary.shadowClassifiedDawns },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'profileshadow-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  const mg = instSummary.marginals;
  console.log('=== profileshadow-a shadow tables (instrument leg) ===');
  console.log('seeds: ' + mg.firstFail.seeds + '  files: ' + mg.firstFail.files +
    '  seedCallsW4: ' + mg.firstFail.seedCallsW4 + '  instancesOpened: ' + mg.firstFail.instancesOpened);
  console.log('scoredDawns: ' + instSummary.shadowScoredDawns + '  shadow-classified: ' + instSummary.shadowClassifiedDawns +
    '  unknown: ' + instSummary.shadowUnknownDawns + '  share: ' + instSummary.shadowClassifiedShare);
  console.log('S0 agreement with the real findCompanion pick: ' + agree.agreeDawns + '/' + agree.biddableDawns + ' biddable dawns (share ' + agree.agreementShare + ')');
  for (const s of SHADOWS) {
    const p = instSummary.shadow.per[s];
    console.log(s.toUpperCase() + ': eligible hist ' + JSON.stringify(p.hist) +
      '  eligible0 ' + p.eligible0 + ' (' + p.eligible0Share + ')' +
      '  biddable ' + p.biddable + ' (' + p.biddableShare + ')' +
      '  meanEligible ' + p.meanEligible);
    console.log('  ' + s.toUpperCase() + ' pick profiles: ' + JSON.stringify(p.pickProfileCounts) +
      ' shares ' + JSON.stringify(p.pickProfileShares) +
      '  pooled eligible by profile: ' + JSON.stringify(p.pooledProfileCounts) +
      '  null-profile eligible: ' + p.nullProfileEligible);
  }
  console.log('paired (S0-empty dawns that open under a relaxation): ' + JSON.stringify(instSummary.shadow.paired));
  console.log('actual launched instances (same band): ' + instSummary.launchedInstances +
    '  vs would-be-biddable dawns S0/S1/S2: ' +
    instSummary.shadow.per.s0.biddable + '/' + instSummary.shadow.per.s1.biddable + '/' + instSummary.shadow.per.s2.biddable);
  console.log('guard (instrument): total deaths ' + instSummary.guard.totalDeaths +
    '  expedition deaths ' + instSummary.guard.expeditionDeaths);
  console.log('wall (instrument): ' + JSON.stringify(mg.wall) + '  medianSurvival: ' + instSummary.medianSurvival);
  console.log('S0 first-fail counts: ' + JSON.stringify(mg.firstFail.pooledCounts) + ' over ' + mg.firstFail.pooledChecks + ' checks');
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('seeds: ' + ctrlSummary.marginals.firstFail.seeds + '  files: ' + ctrlSummary.marginals.firstFail.files +
      '  seedCallsW4: ' + ctrlSummary.marginals.firstFail.seedCallsW4 + '  instancesOpened: ' + ctrlSummary.marginals.firstFail.instancesOpened +
      '  scoredDawns: ' + ctrlSummary.shadowScoredDawns + '  shadow-classified: ' + ctrlSummary.shadowClassifiedDawns +
      '  unknown: ' + ctrlSummary.shadowUnknownDawns);
    for (const s of SHADOWS) {
      const p = ctrlSummary.shadow.per[s];
      console.log('  ' + s.toUpperCase() + ': eligible0 ' + p.eligible0 + ' (' + p.eligible0Share + ')' +
        '  biddable ' + p.biddable + ' (' + p.biddableShare + ')');
    }
    console.log('  actual launched instances (control): ' + ctrlSummary.launchedInstances);
    console.log('  guard (control): total deaths ' + ctrlSummary.guard.totalDeaths +
      '  expedition deaths ' + ctrlSummary.guard.expeditionDeaths);
    console.log('  wall (control): ' + JSON.stringify(ctrlSummary.marginals.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival);
  }
  console.log('bars: instrumentValid=' + (bar1 ? 'PASS' : 'FAIL') +
    ' shadowComplete=' + (bar2 ? 'PASS' : 'FAIL') + ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyShadow: classifyShadow, summarizeShadow: summarizeShadow, SHADOWS: SHADOWS, PROFILE_KEYS: PROFILE_KEYS };
