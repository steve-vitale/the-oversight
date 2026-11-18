// analyze-vetguard-b.js — analyzer for arm sim-vetguard-b.
// Reads the survey corpus (8 seeds) + staged corpus (1 seed), computes
// the veteran-guard chain counts, and judges the frozen prereg bars:
//   S1 instrument (8 files, frozen seeds, 0 errors, complete gate rows,
//      census cross-check vs the fightgate corpus on the same seeds)
//   S2 survey population (>= 1 living wave-4 veteran on the band)
//   T2 staged leg reaches 'table' through game code + >= 1 depart row
// The guard-fire verdict itself (DIAG-GO branch) is computed here and
// reported, but the final verdict also needs T1 (proof test, judged
// separately in scripts/test-vetguard-b.js).
// Usage:
//   node scripts/analyze-vetguard-b.js [--survey-dir DIR] [--stage-dir DIR]
//       [--fightgate-dir DIR] [--out FILE]
//   node scripts/analyze-vetguard-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const SURVEY_SEEDS = [104301, 104302, 104303, 104304, 104305, 104306, 104307, 104308];
const STAGE_SEED = 104301;

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function listJson(dir) {
  try { return fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort().map(function (f) { return path.join(dir, f); }); }
  catch (e) { return []; }
}
function standingTotal(st) {
  if (st == null) return null;
  if (typeof st === 'number') return st;
  if (typeof st.total === 'number') return st.total;
  return null;
}

// judgeSurvey(files): the frozen S1/S2 judges + chain counts.
// Returns {ok, bars, chain, perSeed, errors}.
function judgeSurvey(files, fightgateDir, determinismDir, reproDir) {
  const errors = [];
  const bars = {};
  const perSeed = {};
  const chain = { livingVets4: 0, tablePlans: 0, tableVeterans: 0,
    gateCallsW3: 0, gateTableVetCalls: 0, guardFires: 0,
    outmatchedAvoids: 0, seekContacts: 0, vetDepartRows: 0,
    beat5Seeds: 0, maxStanding: 0, at199: 0 };
  const seedsSeen = [];
  for (const f of files) {
    let o = null;
    try { o = readJson(f); } catch (e) { errors.push('unreadable ' + path.basename(f)); continue; }
    seedsSeen.push(o.seed);
    const ps = { seed: o.seed, days: o.days, endReason: o.endReason, won: o.won,
      villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave,
      standing: standingTotal(o.standing), maxStanding: o.maxStanding,
      maxCapped: o.maxCappedStanding, deaths: (o.deaths || []).length,
      livingVets4: 0, tablePlans: 0, tableVeterans: 0,
      gateCallsW3: 0, gateTableVetCalls: 0, guardFires: 0, vetDeparts: 0,
      beat5Ever: false, errors: (o.instrumentErrors || []).length };
    if ((o.instrumentErrors || []).length) errors.push('seed ' + o.seed + ' instrument errors: ' + o.instrumentErrors.slice(0, 3).join(' | '));
    // Chain counts from the daily census (max over days) + event rows.
    for (const r of (o.dailyCensus || [])) {
      if (r.beat5 != null) ps.beat5Ever = true;
      if ((r.livingVets4 | 0) > ps.livingVets4) ps.livingVets4 = r.livingVets4 | 0;
      if ((r.nTablePlans | 0) > ps.tablePlans) ps.tablePlans = r.nTablePlans | 0;
      if ((r.nTableVeterans | 0) > ps.tableVeterans) ps.tableVeterans = r.nTableVeterans | 0;
    }
    ps.tableEvents = (o.tableEvents || []).length;
    // VETCHAIN (supplementary, not a frozen bar): the next link of
    // the chain — on how many days did a living veteran hold a
    // standing/hunt plan, and on how many of those were they at Haven
    // (both are required for winPlanHavenTick to advance them to
    // 'table' once beat[5] exists).
    ps.vetDays = 0; ps.vetStandingHuntDays = 0; ps.vetAtHavenStandingDays = 0;
    ps.vetDaysNPC = null; ps.vetStandingHuntDaysNPC = null; ps.vetAtHavenStandingDaysNPC = null;
    let npcFlagSeen = false;
    for (const r of (o.dailyCensus || [])) {
      const vd = r.vetDetail || [];
      if (!vd.length) continue;
      ps.vetDays++;
      let sh = false, shHaven = false;
      let shNPC = false, shHavenNPC = false;
      for (const v of vd) {
        if (v.isScholar !== undefined) npcFlagSeen = true;
        if (v.planStage === 'standing' || v.planStage === 'hunt') { sh = true; if (v.atHaven) shHaven = true; }
        if (v.isScholar === false && (v.planStage === 'standing' || v.planStage === 'hunt')) { shNPC = true; if (v.atHaven) shHavenNPC = true; }
      }
      if (sh) ps.vetStandingHuntDays++;
      if (shHaven) ps.vetAtHavenStandingDays++;
      if (npcFlagSeen) {
        if (ps.vetDaysNPC == null) { ps.vetDaysNPC = 0; ps.vetStandingHuntDaysNPC = 0; ps.vetAtHavenStandingDaysNPC = 0; }
        // NPC day counts need the per-day NPC presence, not just
        // shNPC: count a day when ANY non-scholar veteran is alive.
        if (vd.some(function (v) { return v.isScholar === false; })) ps.vetDaysNPC++;
        if (shNPC) ps.vetStandingHuntDaysNPC++;
        if (shHavenNPC) ps.vetAtHavenStandingDaysNPC++;
      }
    }
    chain.vetDays = (chain.vetDays || 0) + ps.vetDays;
    chain.vetStandingHuntDays = (chain.vetStandingHuntDays || 0) + ps.vetStandingHuntDays;
    chain.vetAtHavenStandingDays = (chain.vetAtHavenStandingDays || 0) + ps.vetAtHavenStandingDays;
    if (ps.vetDaysNPC != null) {
      chain.vetDaysNPC = (chain.vetDaysNPC || 0) + ps.vetDaysNPC;
      chain.vetStandingHuntDaysNPC = (chain.vetStandingHuntDaysNPC || 0) + ps.vetStandingHuntDaysNPC;
      chain.vetAtHavenStandingDaysNPC = (chain.vetAtHavenStandingDaysNPC || 0) + ps.vetAtHavenStandingDaysNPC;
    }
    for (const g of (o.v3gates || [])) {
      if (g.probe) continue;
      ps.gateCallsW3++;
      if (g.isVeteran == null || !g.party || !g.party.length || g.allArmed == null) errors.push('seed ' + o.seed + ' incomplete gate row day ' + g.day);
      // NOTE: planStage null is VALID (the fighter holds no plan) —
      // only a missing party / isVeteran / allArmed is incomplete.
      if (g.isTableVeteran) ps.gateTableVetCalls++;
      if (g.reason === 'veteran-guard') ps.guardFires++;
      if (g.reason === 'outmatched') ps.outmatchedAvoids = (ps.outmatchedAvoids || 0) + 1;
      if (g.result === 'seek') ps.seekContacts = (ps.seekContacts || 0) + 1;
    }
    ps.vetDeparts = (o.vetDeparts || []).length;
    perSeed[o.seed] = ps;
    chain.livingVets4 += ps.livingVets4;
    chain.tablePlans += ps.tablePlans;
    chain.tableVeterans += ps.tableVeterans;
    chain.gateCallsW3 += ps.gateCallsW3;
    chain.gateTableVetCalls += ps.gateTableVetCalls;
    chain.guardFires += ps.guardFires;
    chain.outmatchedAvoids += (ps.outmatchedAvoids || 0);
    chain.seekContacts += (ps.seekContacts || 0);
    chain.vetDepartRows += ps.vetDeparts;
    if (ps.beat5Ever) chain.beat5Seeds++;
    if (ps.maxStanding != null && ps.maxStanding > chain.maxStanding) chain.maxStanding = ps.maxStanding;
    if (ps.maxStanding === 199) chain.at199++;
  }
  bars.files = files.length;
  bars.seedsExact = JSON.stringify(seedsSeen.slice().sort(function (a, b) { return a - b; })) === JSON.stringify(SURVEY_SEEDS);
  bars.zeroErrors = errors.length === 0;
  // S1 cross-check (prereg AMENDMENT #2, pre-judging): the original
  // fightgate-census comparison is unachievable — that corpus is base
  // 62b1e749d and seven game-code commits landed since (see prereg).
  // Two same-base checks replace it:
  //   (a) DETERMINISM: the clean survey (v2) vs the v1 run
  //       (perseed-vetguard-b-survey-v1) — row-identical deaths /
  //       won / maxWave / endReason / standing on all 8 seeds. The
  //       only difference between the runs is the recorder's standing
  //       reads, so identity proves those reads do not move
  //       trajectories.
  //   (b) CROSS-DRIVER: the fightgate driver re-run on 104308 at the
  //       CURRENT base (perseed-fightgate-scope-b-repro-8709e9f87) vs
  //       the vetguard survey on 104308 — row-identical deaths /
  //       endReason. The two drivers agree on this base.
  const cross = { checked: 0, mismatches: [] };
  const norm = function (ds) { return (ds || []).map(function (d) { return [d.day, d.who, d.cause, d.kind].join('|'); }).sort(); };
  const comparePair = function (label, a, b) {
    cross.checked++;
    if (JSON.stringify(norm(a.deaths)) !== JSON.stringify(norm(b.deaths))) cross.mismatches.push(label + ': deaths differ');
    if (!!a.won !== !!b.won) cross.mismatches.push(label + ': won differs');
    if ((a.maxWave || 1) !== (b.maxWave || 1)) cross.mismatches.push(label + ': maxWave differs');
    if (a.endReason !== b.endReason) cross.mismatches.push(label + ': endReason differs');
    if (standingTotal(a.standing) !== standingTotal(b.standing)) cross.mismatches.push(label + ': standing differs');
  };
  if (determinismDir) {
    for (const seed of SURVEY_SEEDS) {
      const v1f = listJson(determinismDir).filter(function (f) { return f.indexOf('-s' + seed + '-') !== -1; })[0];
      const sf = files.filter(function (f) { return f.indexOf('-s' + seed + '-') !== -1; })[0];
      if (!v1f || !sf) { cross.mismatches.push('seed ' + seed + ': missing corpus for determinism check'); continue; }
      let v1o = null, so = null;
      try { v1o = readJson(v1f); so = readJson(sf); } catch (e) { cross.mismatches.push('seed ' + seed + ': corpus unreadable for determinism check'); continue; }
      comparePair('seed ' + seed + ' v2-vs-v1', v1o, so);
    }
  }
  if (reproDir) {
    const rf = listJson(reproDir).filter(function (f) { return f.indexOf('-s104308-') !== -1; })[0];
    const sf = files.filter(function (f) { return f.indexOf('-s104308-') !== -1; })[0];
    if (!rf || !sf) { cross.mismatches.push('104308: missing corpus for cross-driver check'); }
    else {
      let ro = null, so = null;
      try { ro = readJson(rf); so = readJson(sf); } catch (e) { cross.mismatches.push('104308: corpus unreadable for cross-driver check'); }
      if (ro && so) comparePair('104308 fightgate-repro-vs-vetguard', ro, so);
    }
  }
  // Legacy fightgate-corpus comparison (base 62b1e749d): reported for
  // the record only — NOT part of S1 (stale base; see prereg
  // amendment #2). Mismatches here are expected, not failures.
  const legacy = { checked: 0, mismatches: [] };
  if (fightgateDir) {
    for (const seed of SURVEY_SEEDS) {
      const fg = listJson(fightgateDir).filter(function (f) { return f.indexOf('-s' + seed + '-') !== -1; })[0];
      const sf = files.filter(function (f) { return f.indexOf('-s' + seed + '-') !== -1; })[0];
      if (!fg || !sf) continue;
      let fo = null, so = null;
      try { fo = readJson(fg); so = readJson(sf); } catch (e) { continue; }
      legacy.checked++;
      if (JSON.stringify(norm(fo.deaths)) !== JSON.stringify(norm(so.deaths))) legacy.mismatches.push('seed ' + seed + ': deaths differ (stale base)');
      if (fo.endReason !== so.endReason) legacy.mismatches.push('seed ' + seed + ': endReason differs (stale base)');
    }
  }
  bars.crossChecked = cross.checked;
  bars.crossMismatches = cross.mismatches;
  bars.s1 = (bars.files === 8 && bars.seedsExact && bars.zeroErrors && cross.mismatches.length === 0);
  bars.s2 = chain.livingVets4 >= 1;
  // Unreachability branch (prereg, AMENDED 2026-11-18 pre-judging):
  // table veterans 0 AND beat5 0 on all seeds AND max CAPPED
  // standing < 200 on all seeds. The code gates the fifth-draft beat
  // on standingPlentyCappedTotal (bread capped at 100), not the raw
  // total — the fightgate corpus already shows raw 350/505/350 on
  // three seeds, so the raw total would misjudge the mechanism.
  const maxCappedAll = Object.keys(perSeed).map(function (k) { return perSeed[k].maxCapped || 0; });
  bars.unreachableProven = (chain.tableVeterans === 0 && chain.beat5Seeds === 0 &&
    maxCappedAll.length === 8 && maxCappedAll.every(function (m) { return m < 200; }));
  bars.maxCappedAll = maxCappedAll;
  bars.guardFires = chain.guardFires;
  return { bars: bars, chain: chain, perSeed: perSeed, cross: cross, legacy: legacy, errors: errors };
}

// judgeStage(file): frozen T2 — the staged veteran reaches 'table'
// through game code (daily census observation, never a driver write)
// and >= 1 depart-side row for them.
function judgeStage(file) {
  if (!file) return { bars: { t2: false, reason: 'no-stage-corpus' }, staging: null };
  let o = null;
  try { o = readJson(file); } catch (e) { return { bars: { t2: false, reason: 'unreadable' }, staging: null }; }
  const staging = (o.stagingEvents || [])[0] || null;
  let tableDay = null;
  for (const ev of (o.tableEvents || [])) {
    if (staging && ev.vid === staging.vid) { tableDay = ev.day; break; }
  }
  // Also accept the daily census as the table witness.
  let censusTableDay = null;
  if (tableDay == null && staging) {
    for (const r of (o.dailyCensus || [])) {
      if ((r.tableVeteranVids || []).indexOf(staging.vid) !== -1) { censusTableDay = r.day; break; }
    }
  }
  const departRows = (o.vetDeparts || []).filter(function (r) { return staging && r.vid === staging.vid; });
  const probe = (o.probeRows || [])[0] || null;
  const naturalGate = (o.v3gates || []).filter(function (g) { return staging && g.vid === staging.vid && !g.probe; });
  const havenTicks = (o.havenTicks || []).filter(function (r) { return staging && r.vid === staging.vid; });
  const havenTickStandingAtHaven = havenTicks.filter(function (r) { return r.stageBefore === 'standing' && r.atHaven; });
  const bars = {
    staged: !!staging && !!staging.stageOk,
    grantedKill: !!(staging && staging.grantedKill),
    tableDay: (tableDay != null ? tableDay : censusTableDay),
    reachedTable: (tableDay != null || censusTableDay != null),
    departRows: departRows.length,
    naturalGateCalls: naturalGate.length,
    probe: probe ? { result: probe.result, reason: probe.reason } : null,
    havenTickCalls: (o.havenTickCalls | 0),
    havenTicksForStaged: havenTicks.length,
    havenTickStandingAtHaven: havenTickStandingAtHaven.length,
    t2: false,
  };
  bars.t2 = bars.staged && bars.reachedTable && bars.departRows >= 1;
  return { bars: bars, staging: staging, departRows: departRows, naturalGate: naturalGate, probe: probe, havenTicks: havenTicks };
}

function wallNumbers(perSeed) {
  const seeds = Object.keys(perSeed).map(function (k) { return perSeed[k]; });
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  const wins = seeds.filter(function (s) { return s.won; }).length;
  // "national" follows the fightgate/round-note convention:
  // nationalStanding = raw standing total >= 200 (the scale-onramp
  // figure), reported alongside nationalRank (scaleRank >= national).
  const nationalStanding = seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length;
  const nationalRank = seeds.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length;
  const table = seeds.filter(function (s) { return s.scaleRank && (s.scaleRank.table || (typeof s.scaleRank === 'string' && s.scaleRank.indexOf('table') !== -1)); }).length;
  const w4 = seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length;
  const w5 = seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length;
  const survivals = seeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
  const median = survivals.length ? survivals[Math.floor(survivals.length / 2)] : null;
  return { seeds: seeds.length, wins: wins, national: nationalStanding, nationalStanding: nationalStanding, nationalRank: nationalRank, table: table, wave4: w4, wave5: w5, medianSurvival: median, maxSurvival: survivals.length ? survivals[survivals.length - 1] : null };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) { if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name); } }
  // Synthetic survey: 8 files, 1 living vet, 0 table vets, 0 beat5,
  // max standing 199 everywhere -> S1 true (no fightgate dir), S2
  // true, unreachable proven true, guard fires 0.
  const tmp = fs.mkdtempSync(path.join('/tmp', 'vetguard-selftest-'));
  const sdir = path.join(tmp, 'survey');
  fs.mkdirSync(sdir, { recursive: true });
  SURVEY_SEEDS.forEach(function (seed, i) {
    const o = { seed: seed, days: 150, endReason: 'days', won: false, villageLost: false,
      scaleRank: null, maxWave: 4, standing: { total: 199 }, maxStanding: 199, maxCappedStanding: 199,
      instrumentErrors: [], deaths: [], v3gates: [], vetDeparts: [],
      dailyCensus: [{ day: 150, nTablePlans: 0, nTableVeterans: 0, livingVets4: (i === 0 ? 1 : 0), beat5: null, standing: { total: 199 } }],
      tableEvents: [] };
    if (i === 0) o.dailyCensus[0].livingVets4Vids = ['v1'];
    fs.writeFileSync(path.join(sdir, 'vetguard-b-s' + seed + '-vetguard-b-survey.json'), JSON.stringify(o));
  });
  const res = judgeSurvey(listJson(sdir), null);
  check('synthetic S1 (no cross-check dir)', res.bars.s1 === true);
  check('synthetic S2', res.bars.s2 === true);
  check('synthetic unreachable proven', res.bars.unreachableProven === true);
  check('synthetic guard fires 0', res.bars.guardFires === 0);
  check('synthetic chain livingVets4', res.chain.livingVets4 === 1);
  // Synthetic survey with a guard fire -> unreachable false.
  const sdir2 = path.join(tmp, 'survey2');
  fs.mkdirSync(sdir2, { recursive: true });
  SURVEY_SEEDS.forEach(function (seed, i) {
    const o = { seed: seed, days: 150, endReason: 'days', won: false, villageLost: false,
      scaleRank: null, maxWave: 4, standing: { total: 199 }, maxStanding: 199, maxCappedStanding: 199,
      instrumentErrors: [], deaths: [],
      v3gates: (i === 0 ? [{ day: 100, vid: 'v1', mid: 'redactor', wave: 3, result: 'avoid', reason: 'veteran-guard', party: ['v1'], partySize: 1, allArmed: true, allArmored: false, planStage: 'table', isVeteran: true, isTableVeteran: true, probe: false }] : []),
      vetDeparts: [],
      dailyCensus: [{ day: 150, nTablePlans: (i === 0 ? 1 : 0), nTableVeterans: (i === 0 ? 1 : 0), livingVets4: 1, beat5: null, standing: { total: 199 } }],
      tableEvents: (i === 0 ? [{ day: 90, vid: 'v1', via: 'census' }] : []) };
    fs.writeFileSync(path.join(sdir2, 'vetguard-b-s' + seed + '-vetguard-b-survey.json'), JSON.stringify(o));
  });
  const res2 = judgeSurvey(listJson(sdir2), null);
  check('synthetic guard fire counted', res2.bars.guardFires === 1);
  check('synthetic unreachable false with fire', res2.bars.unreachableProven === false);
  check('synthetic table veterans 1', res2.chain.tableVeterans === 1);
  // Synthetic stage: staged, reached table day 70, 2 depart rows -> T2 true.
  const stageFile = path.join(tmp, 'stage.json');
  fs.writeFileSync(stageFile, JSON.stringify({ seed: 104301, mode: 'stage',
    stagingEvents: [{ vid: 'v9', day: 60, grantedKill: false, atHaven: true, stageOk: true }],
    tableEvents: [{ day: 70, vid: 'v9', via: 'census' }],
    dailyCensus: [{ day: 70, tableVeteranVids: ['v9'] }],
    vetDeparts: [{ day: 71, vid: 'v9', result: 'hold' }, { day: 78, vid: 'v9', result: 'normal' }],
    v3gates: [], probeRows: [{ day: 150, vid: 'v9', result: 'avoid', reason: 'veteran-guard', probe: true }] }));
  const st = judgeStage(stageFile);
  check('synthetic T2', st.bars.t2 === true);
  check('synthetic T2 tableDay', st.bars.tableDay === 70);
  check('synthetic T2 departRows', st.bars.departRows === 2);
  // Synthetic stage: staged but never table -> T2 false.
  const stageFile2 = path.join(tmp, 'stage2.json');
  fs.writeFileSync(stageFile2, JSON.stringify({ seed: 104301, mode: 'stage',
    stagingEvents: [{ vid: 'v9', day: 60, grantedKill: true, atHaven: true, stageOk: true }],
    tableEvents: [], dailyCensus: [], vetDeparts: [], v3gates: [], probeRows: [] }));
  check('synthetic T2 false when no table', judgeStage(stageFile2).bars.t2 === false);
  // Wall numbers.
  const w = wallNumbers({ 1: { won: true, scaleRank: null, maxWave: 5, days: 150 }, 2: { won: false, scaleRank: null, maxWave: 4, days: 110 } });
  check('wall wins', w.wins === 1);
  check('wall wave5', w.wave5 === 1);
  check('wall median', w.medianSurvival === 150);
  console.log('SELFTEST: ' + pass + ' passed, ' + fail + ' failed');
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  return fail === 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  function argVal(name, def) {
    const i = args.indexOf(name);
    return (i !== -1 && args[i + 1]) ? args[i + 1] : def;
  }
  const surveyDir = argVal('--survey-dir', path.join(REPO, 'evidence', '2026-11-18', 'perseed-vetguard-b-survey'));
  const stageDir = argVal('--stage-dir', path.join(REPO, 'evidence', '2026-11-18', 'perseed-vetguard-b-stage'));
  const fightgateDir = argVal('--fightgate-dir', path.join(REPO, 'evidence', '2026-11-18', 'perseed-fightgate-scope-b-diag'));
  const determinismDir = argVal('--determinism-dir', path.join(REPO, 'evidence', '2026-11-18', 'perseed-vetguard-b-survey-v1'));
  const reproDir = argVal('--repro-dir', path.join(REPO, 'evidence', '2026-11-18', 'perseed-fightgate-scope-b-repro-8709e9f87'));
  const outFile = argVal('--out', path.join(REPO, 'evidence', '2026-11-18', 'vetguard-b-analysis.json'));
  const surveyFiles = listJson(surveyDir);
  const survey = judgeSurvey(surveyFiles, fightgateDir, determinismDir, reproDir);
  const stageFiles = listJson(stageDir);
  const stage = judgeStage(stageFiles[0] || null);
  const wall = wallNumbers(survey.perSeed);
  // DIAG-GO needs T1 too (proof test, judged separately); report the
  // survey+stage side here as diagGoMinusT1.
  const diagGoMinusT1 = survey.bars.s1 && survey.bars.s2 && stage.bars.t2 &&
    (survey.bars.guardFires >= 1 || survey.bars.unreachableProven);
  const analysis = {
    arm: 'vetguard-b', run: 'vetguard-b',
    surveyDir: path.relative(REPO, surveyDir), stageDir: path.relative(REPO, stageDir),
    survey: survey, stage: stage, wall: wall,
    diagGoMinusT1: diagGoMinusT1,
    verdictNote: 'DIAG-GO iff diagGoMinusT1 AND T1 (proof test scripts/test-vetguard-b.js green).',
  };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n');
  console.log(JSON.stringify({
    s1: survey.bars.s1, s2: survey.bars.s2, t2: stage.bars.t2,
    guardFires: survey.bars.guardFires, unreachableProven: survey.bars.unreachableProven,
    chain: survey.chain, wall: wall, diagGoMinusT1: diagGoMinusT1,
    stageBars: stage.bars, crossMismatches: survey.bars.crossMismatches,
    out: path.relative(REPO, outFile),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { judgeSurvey: judgeSurvey, judgeStage: judgeStage, wallNumbers: wallNumbers, standingTotal: standingTotal, SURVEY_SEEDS: SURVEY_SEEDS, selftest: selftest };
