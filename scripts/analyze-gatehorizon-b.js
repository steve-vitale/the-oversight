// analyze-gatehorizon-b.js — horizon analyzer, arm sim-gatehorizon-b.
// Judges the frozen bars (H1a/H1b/D5/D6 + guardrails) over the two
// horizon corpus dirs (control gate OFF, armed LEADERPROJ=1), one file
// per seed per leg. NOT a reuse of analyze-gateavoid-b.js: that judges
// staged-door D1 on a matched pool; the horizon question is downstream
// deltas over 150 days, so the attribution and the bars are different.
//
// Pool-door leader-death attribution (frozen in the prereg): a
// v4encounters row with wave >= 4 AND leaderEntryHp <= 75 AND
// leaderDied true (the leader was dead immediately after that fight
// returned). Scholar-led rows never carry leaderDied (the wrap only
// sets it for villager leaders), so they can never attribute.
//
// Usage:
//   node scripts/analyze-gatehorizon-b.js --control evidence/2026-11-23/perseed-gatehorizon-b-control --armed evidence/2026-11-23/perseed-gatehorizon-b-armed --seeds 109101,...,109108 [--json evidence/2026-11-23/gatehorizon-b-analysis.json]
//   node scripts/analyze-gatehorizon-b.js --selftest
// Exit 0 = all frozen bars pass; exit 1 = any bar fails (the verdict
// kind is printed: SUPPLY-THIN / METRIC-BROKEN / NO-GO).
'use strict';
const fs = require('fs');
const path = require('path');

function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}

function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function poolDoorLeaderDeaths(r) {
  // Attributed pool-door leader deaths on this seed.
  let n = 0;
  const rows = [];
  for (const row of (r.v4encounters || [])) {
    if ((row.wave | 0) >= 4 && row.leaderEntryHp != null && (row.leaderEntryHp | 0) <= 75 && row.leaderDied === true) {
      n++;
      rows.push({ day: row.day, mid: row.mid, leaderEntryHp: row.leaderEntryHp, outcome: row.outcome, staged: !!row.staged });
    }
  }
  return { n: n, rows: rows };
}

function d5Check(r, leg, anchor) {
  const errs = [];
  if (r.anchorCommit !== anchor) errs.push('anchorCommit mismatch: ' + String(r.anchorCommit).slice(0, 12) + ' want ' + String(anchor).slice(0, 12));
  if (String(r.policySha || '').slice(0, 12) !== '4c4d1535d76c') errs.push('policySha mismatch: ' + String(r.policySha || '').slice(0, 12));
  if (String(r.basePolicySha || '').slice(0, 12) !== '1884c8852d38') errs.push('basePolicySha mismatch: ' + String(r.basePolicySha || '').slice(0, 12));
  for (const f of ['pinquadFlag', 'dmgpinFlag', 'doorflee2Flag', 'hypofloorFlag', 'hpgateFlag']) {
    if (r[f] !== '1') errs.push(f + ' != 1 (got ' + JSON.stringify(r[f]) + ')');
  }
  if (r.leaderhpgateFlag != null) errs.push('leaderhpgateFlag must be null');
  if (leg === 'control' && r.leaderprojFlag != null) errs.push('leaderprojFlag must be null on control');
  if (leg === 'armed' && r.leaderprojFlag !== '1') errs.push('leaderprojFlag must be 1 on armed');
  for (const f of ['leaderprojFires', 'leaderhpgateFires', 'hpgateFires']) {
    if (typeof r[f] !== 'number') errs.push(f + ' not a number');
  }
  if (!Array.isArray(r.gateAvoidNotes) || !Array.isArray(r.gateAvoidLog)) errs.push('gateAvoidNotes/gateAvoidLog not arrays');
  if (!r.slotPresent || !r.pinPresent) errs.push('slotPresent/pinPresent false');
  if (r.scored && !r.stagedDoor) errs.push('scored seed without stagedDoor');
  return errs;
}

function d6Check(r) {
  const errs = [];
  const total = ((r.hpgateFires | 0) + (r.leaderhpgateFires | 0) + (r.leaderprojFires | 0));
  const log = Array.isArray(r.gateAvoidLog) ? r.gateAvoidLog : [];
  if (log.length !== total) errs.push('gateAvoidLog length ' + log.length + ' != total fires ' + total);
  const kinds = { hold: 0, lead: 0, proj: 0, unknown: 0 };
  for (const e of log) {
    if (e && (e.kind === 'hold' || e.kind === 'lead' || e.kind === 'proj')) kinds[e.kind]++;
    else kinds.unknown++;
  }
  if (kinds.hold !== (r.hpgateFires | 0)) errs.push('hold log ' + kinds.hold + ' != hpgateFires ' + r.hpgateFires);
  if (kinds.lead !== (r.leaderhpgateFires | 0)) errs.push('lead log ' + kinds.lead + ' != leaderhpgateFires ' + r.leaderhpgateFires);
  if (kinds.proj !== (r.leaderprojFires | 0)) errs.push('proj log ' + kinds.proj + ' != leaderprojFires ' + r.leaderprojFires);
  if (kinds.unknown) errs.push(kinds.unknown + ' log entries of unknown kind');
  return errs;
}

function loadLeg(dir, leg, seeds, prefix, run) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, prefix + '-s' + seed + '-' + run + '-pinquaddoor.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}

function analyze(controlDir, armedDir, seeds, opts) {
  opts = opts || {};
  const prefix = opts.prefix || 'gatehorizon-b';
  const run = opts.run || 'gatehorizon-b';
  const control = loadLeg(controlDir, 'control', seeds, prefix, run);
  const armed = loadLeg(armedDir, 'armed', seeds, prefix, run);
  const anchor = (control[0] && control[0].r.anchorCommit) || 'unknown';
  const res = {
    seeds: seeds, anchor: anchor, legs: {},
    bars: {}, verdict: null, kind: null,
  };
  for (const [leg, rows] of [['control', control], ['armed', armed]]) {
    const scored = rows.filter(function (x) { return x.r.scored; });
    const unscored = rows.filter(function (x) { return !x.r.scored; });
    let poolDeaths = 0, poolDeathRows = [];
    let w4down = 0, w4total = 0, w5total = 0;
    let starv = 0, vdeaths = 0, leaderAlive = 0, stagedDeaths = 0;
    let projFires = 0, hpFires = 0, leadFires = 0;
    let won = 0, national = 0, table = 0, entered = 0, w4unlock = 0, w5unlock = 0;
    const survivals = [];
    const d5errs = [], d6errs = [];
    const RANK = { village: 0, regional: 1, national: 2, global: 3 };
    for (const x of rows) {
      const r = x.r;
      d5errs.push.apply(d5errs, d5Check(r, leg, anchor).map(function (e) { return 'seed ' + x.seed + ': ' + e; }));
      d6errs.push.apply(d6errs, d6Check(r).map(function (e) { return 'seed ' + x.seed + ': ' + e; }));
      projFires += (r.leaderprojFires | 0);
      hpFires += (r.hpgateFires | 0);
      leadFires += (r.leaderhpgateFires | 0);
      vdeaths += Array.isArray(r.deaths) ? r.deaths.length : (r.deaths | 0);
      starv += (r.starvationDeaths | 0);
      survivals.push(r.gameDays | 0);
      if (r.won) won++;
      if ((RANK[r.scaleRank] || 0) >= 2) national++;
      if (r.tableWaiting) table++;
      if (r.tableEntered) entered++;
      if ((r.maxWaveUnlocked | 0) >= 4) w4unlock++;
      if ((r.maxWaveUnlocked | 0) >= 5) w5unlock++;
    }
    for (const x of scored) {
      const r = x.r;
      const pd = poolDoorLeaderDeaths(r);
      poolDeaths += pd.n;
      poolDeathRows.push.apply(poolDeathRows, pd.rows.map(function (rw) { return Object.assign({ seed: x.seed }, rw); }));
      w4down += (r.wave4KillsDownstream | 0);
      w4total += (r.wave4KillsTotal | 0);
      w5total += (r.wave5KillsTotal | 0);
      if (r.leaderAliveAtEnd === true) leaderAlive++;
      if (r.stagedDoor && r.stagedDoor.leaderDied === true) stagedDeaths++;
    }
    res.legs[leg] = {
      n: rows.length, scored: scored.length,
      unscored: unscored.map(function (x) { return { seed: x.seed, reason: x.r.unscoredReason }; }),
      poolDoorLeaderDeaths: poolDeaths, poolDeathRows: poolDeathRows,
      wave4KillsDownstream: w4down, wave4KillsTotal: w4total, wave5KillsTotal: w5total,
      starvationDeaths: starv, villageDeaths: vdeaths,
      medianSurvival: median(survivals), survivals: survivals,
      leaderAliveAtEnd: leaderAlive, stagedDoorLeaderDeaths: stagedDeaths,
      projFires: projFires, hpgateFires: hpFires, leaderhpgateFires: leadFires,
      won: won, national: national, table: table, entered: entered,
      wave4Unlocks: w4unlock, wave5Unlocks: w5unlock,
      d5Errors: d5errs, d6Errors: d6errs,
    };
  }
  const c = res.legs.control, a = res.legs.armed;
  const n = seeds.length;
  const scoredMin = Math.ceil(n * 0.75);
  const b = res.bars;
  b.supply = { need: scoredMin, controlScored: c.scored, armedScored: a.scored,
    pass: c.scored >= scoredMin && a.scored >= scoredMin };
  b.H1a = { control: c.poolDoorLeaderDeaths, armed: a.poolDoorLeaderDeaths,
    delta: a.poolDoorLeaderDeaths - c.poolDoorLeaderDeaths, need: 'armed <= control - 1',
    pass: a.poolDoorLeaderDeaths <= c.poolDoorLeaderDeaths - 1 };
  b.H1b = { control: c.wave4KillsDownstream, armed: a.wave4KillsDownstream,
    delta: a.wave4KillsDownstream - c.wave4KillsDownstream, need: 'armed >= control - 1',
    pass: a.wave4KillsDownstream >= c.wave4KillsDownstream - 1 };
  b.D5 = { controlErrors: c.d5Errors, armedErrors: a.d5Errors,
    pass: c.d5Errors.length === 0 && a.d5Errors.length === 0 };
  b.D6 = { controlErrors: c.d6Errors, armedErrors: a.d6Errors,
    pass: c.d6Errors.length === 0 && a.d6Errors.length === 0 };
  b.guardStarvation = { control: c.starvationDeaths, armed: a.starvationDeaths,
    need: 'armed <= control + 2', pass: a.starvationDeaths <= c.starvationDeaths + 2 };
  b.guardVillageDeaths = { control: c.villageDeaths, armed: a.villageDeaths,
    need: 'armed <= control + 2', pass: a.villageDeaths <= c.villageDeaths + 2 };
  b.guardSurvival = { controlMedian: c.medianSurvival, armedMedian: a.medianSurvival,
    need: 'armed median >= 0.8x control', pass: a.medianSurvival >= 0.8 * c.medianSurvival };
  // Verdict, in order: supply, D6 (metric-broken), D5, H1a zero-control
  // (metric-broken), H1a/H1b, guardrails.
  if (!b.supply.pass) { res.verdict = 'DIAG-NO-GO'; res.kind = 'SUPPLY-THIN'; }
  else if (!b.D6.pass) { res.verdict = 'NO-GO'; res.kind = 'METRIC-BROKEN'; }
  else if (!b.D5.pass) { res.verdict = 'NO-GO'; res.kind = 'METRIC-BROKEN'; }
  else if (c.poolDoorLeaderDeaths === 0) { res.verdict = 'NO-GO'; res.kind = 'METRIC-BROKEN'; }
  else if (!b.H1a.pass || !b.H1b.pass) { res.verdict = 'NO-GO'; res.kind = 'CONCEPT-DEAD'; }
  else if (!b.guardStarvation.pass || !b.guardVillageDeaths.pass || !b.guardSurvival.pass) { res.verdict = 'NO-GO'; res.kind = 'GUARDRAIL'; }
  else { res.verdict = 'GO'; res.kind = null; }
  return res;
}

function printReport(res) {
  const c = res.legs.control, a = res.legs.armed;
  console.log('=== gatehorizon-b analysis ===  seeds=[' + res.seeds.join(',') + '] anchor=' + String(res.anchor).slice(0, 12));
  console.log('leg       n scored poolDeaths w4down w4tot w5tot starv vDeaths medSurv leadAlive stagedDeaths projFires');
  for (const [name, L] of [['control', c], ['armed', a]]) {
    console.log(name.padEnd(9) + ' ' + String(L.n).padEnd(2) + ' ' + String(L.scored).padEnd(6) + ' ' +
      String(L.poolDoorLeaderDeaths).padEnd(10) + ' ' + String(L.wave4KillsDownstream).padEnd(6) + ' ' +
      String(L.wave4KillsTotal).padEnd(5) + ' ' + String(L.wave5KillsTotal).padEnd(5) + ' ' +
      String(L.starvationDeaths).padEnd(5) + ' ' + String(L.villageDeaths).padEnd(7) + ' ' +
      String(L.medianSurvival).padEnd(7) + ' ' + String(L.leaderAliveAtEnd).padEnd(9) + ' ' +
      String(L.stagedDoorLeaderDeaths).padEnd(12) + ' ' + String(L.projFires));
  }
  console.log('wall: control won=' + c.won + ' national=' + c.national + ' table=' + c.table + ' entered=' + c.entered +
    ' w4unlock=' + c.wave4Unlocks + ' w5unlock=' + c.wave5Unlocks +
    ' | armed won=' + a.won + ' national=' + a.national + ' table=' + a.table + ' entered=' + a.entered +
    ' w4unlock=' + a.wave4Unlocks + ' w5unlock=' + a.wave5Unlocks);
  for (const k of ['supply', 'H1a', 'H1b', 'D5', 'D6', 'guardStarvation', 'guardVillageDeaths', 'guardSurvival']) {
    console.log(k + ': ' + (res.bars[k].pass ? 'PASS' : 'FAIL') + ' ' + JSON.stringify(res.bars[k]));
  }
  console.log('VERDICT: ' + res.verdict + (res.kind ? ' kind ' + res.kind : ''));
}

// ---- selftest: synthetic corpora exercising the bars (no Game load) ----
function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  function mkSeed(o) {
    const base = {
      seed: 1, anchorCommit: 'anchor12', policySha: '4c4d1535d76cXXXX', basePolicySha: '1884c8852d38XXXX',
      pinquadFlag: '1', dmgpinFlag: '1', doorflee2Flag: '1', hypofloorFlag: '1', hpgateFlag: '1',
      leaderhpgateFlag: null, leaderprojFlag: null,
      leaderprojFires: 0, leaderhpgateFires: 0, hpgateFires: 0,
      gateAvoidNotes: [], gateAvoidLog: [], slotPresent: true, pinPresent: true,
      scored: true, stagedDoor: { door: 1, leaderDied: false },
      v4encounters: [], wave4KillsDownstream: 0, wave4KillsTotal: 0, wave5KillsTotal: 0,
      leaderAliveAtEnd: true, starvationDeaths: 0, deaths: [], gameDays: 150,
      won: false, scaleRank: 'village', tableWaiting: false, tableEntered: false,
      maxWaveUnlocked: 4,
    };
    return Object.assign(base, o || {});
  }
  // H1a attribution: only wave>=4, entry<=75, leaderDied.
  const attr = mkSeed({ v4encounters: [
    { wave: 4, leaderEntryHp: 55, leaderDied: true, mid: 'audit', staged: true },
    { wave: 4, leaderEntryHp: 76, leaderDied: true, mid: 'audit' }, // above the gate: not counted
    { wave: 3, leaderEntryHp: 40, leaderDied: true, mid: 'spool' }, // wave 3: not counted
    { wave: 4, leaderEntryHp: 70, leaderDied: false, mid: 'eater' }, // survived: not counted
    { wave: 5, leaderEntryHp: 45, leaderDied: true, mid: 'rerun', staged: false }, // organic wave-5: counted
  ]});
  check('H1a attribution counts staged + organic pool deaths only (2)', poolDoorLeaderDeaths(attr).n === 2, poolDoorLeaderDeaths(attr));
  check('H1a attribution rows carry staged flags', poolDoorLeaderDeaths(attr).rows.filter(function (r) { return r.staged; }).length === 1);
  // D5: flag mismatch detected.
  check('D5 detects a wrong policySha', d5Check(mkSeed({ policySha: 'deadbeef' }), 'control', 'anchor12').length === 1);
  check('D5 detects leaderprojFlag set on control', d5Check(mkSeed({ leaderprojFlag: '1' }), 'control', 'anchor12').length === 1);
  check('D5 passes a clean armed seed', d5Check(mkSeed({ leaderprojFlag: '1' }), 'armed', 'anchor12').length === 0);
  check('D5 detects a missing stagedDoor on a scored seed', d5Check(mkSeed({ stagedDoor: null }), 'control', 'anchor12').length === 1);
  // D6: log-vs-counter mismatch detected; clean passes.
  check('D6 detects log shorter than fires', d6Check(mkSeed({ leaderprojFires: 2, gateAvoidLog: [{ kind: 'proj' }] })).length > 0);
  check('D6 passes a clean log', d6Check(mkSeed({ leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }] })).length === 0);
  check('D6 detects an unknown log kind', d6Check(mkSeed({ leaderprojFires: 1, gateAvoidLog: [{ kind: 'weird' }] })).length > 0);
  // Verdict paths on synthetic leg dirs.
  const fsx = require('fs');
  const os = require('os');
  function writeLegs(cSeeds, aSeeds) {
    const dir = fsx.mkdtempSync(path.join(os.tmpdir(), 'gh-selftest-'));
    const cd = path.join(dir, 'c'), ad = path.join(dir, 'a');
    fsx.mkdirSync(cd); fsx.mkdirSync(ad);
    cSeeds.forEach(function (r, i) { fsx.writeFileSync(path.join(cd, 'gatehorizon-b-s' + (109101 + i) + '-gatehorizon-b-pinquaddoor.json'), JSON.stringify(Object.assign(mkSeed(), r, { seed: 109101 + i }))); });
    aSeeds.forEach(function (r, i) { fsx.writeFileSync(path.join(ad, 'gatehorizon-b-s' + (109101 + i) + '-gatehorizon-b-pinquaddoor.json'), JSON.stringify(Object.assign(mkSeed(), r, { seed: 109101 + i, leaderprojFlag: '1' }))); });
    return { dir: dir, cd: cd, ad: ad, seeds: cSeeds.map(function (_, i) { return 109101 + i; }) };
  }
  const go = writeLegs(
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { v4encounters: [{ wave: 4, leaderEntryHp: 55, leaderDied: true, mid: 'audit', staged: true }], stagedDoor: { door: 1, leaderDied: true }, leaderAliveAtEnd: false, deaths: [{}, {}] }; }),
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }], deaths: [{}] }; })
  );
  // control: 8 pool deaths, armed: 0 pool deaths, kills 0/0 -> H1a 0<=7 PASS, H1b 0>=0-1 PASS.
  const goRes = analyze(go.cd, go.ad, go.seeds);
  check('verdict GO on a clean 8-0 split', goRes.verdict === 'GO' && goRes.bars.H1a.pass && goRes.bars.H1b.pass, goRes.verdict + ' ' + goRes.kind);
  const thin = writeLegs(
    [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return i < 5 ? { scored: false, unscoredReason: 'no-unlock', stagedDoor: null } : {}; }),
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }] }; })
  );
  const thinRes = analyze(thin.cd, thin.ad, thin.seeds);
  check('verdict SUPPLY-THIN when scored < 6 of 8', thinRes.verdict === 'DIAG-NO-GO' && thinRes.kind === 'SUPPLY-THIN', thinRes.verdict + ' ' + thinRes.kind);
  const zeroc = writeLegs(
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return {}; }),
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }] }; })
  );
  const zeroRes = analyze(zeroc.cd, zeroc.ad, zeroc.seeds);
  check('verdict METRIC-BROKEN when control pool deaths are 0', zeroRes.verdict === 'NO-GO' && zeroRes.kind === 'METRIC-BROKEN', zeroRes.verdict + ' ' + zeroRes.kind);
  const killloss = writeLegs(
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { v4encounters: [{ wave: 4, leaderEntryHp: 55, leaderDied: true, mid: 'audit', staged: true }], stagedDoor: { door: 1, leaderDied: true }, wave4KillsDownstream: 1 }; }),
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }], wave4KillsDownstream: 0 }; })
  );
  // control kills 8, armed 0 -> H1b 0 >= 7 FAIL (more than one kill lost).
  const klRes = analyze(killloss.cd, killloss.ad, killloss.seeds);
  check('H1b fails when the armed leg loses more than one kill', klRes.verdict === 'NO-GO' && klRes.bars.H1b.pass === false, klRes.verdict + ' H1b=' + JSON.stringify(klRes.bars.H1b));
  const starv = writeLegs(
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { v4encounters: [{ wave: 4, leaderEntryHp: 55, leaderDied: true, mid: 'audit', staged: true }], stagedDoor: { door: 1, leaderDied: true } }; }),
    [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return { leaderprojFires: 1, gateAvoidLog: [{ kind: 'proj' }], starvationDeaths: 1 }; })
  );
  // armed starvation 8 vs control 0 -> guard fails (8 > 0+2).
  const stRes = analyze(starv.cd, starv.ad, starv.seeds);
  check('starvation guardrail fails when armed starves 8 vs control 0', stRes.verdict === 'NO-GO' && stRes.bars.guardStarvation.pass === false, stRes.verdict + ' ' + JSON.stringify(stRes.bars.guardStarvation));
  console.log(passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) {
    process.exit(selftest() ? 0 : 1);
  }
  const controlDir = argvVal('--control', null);
  const armedDir = argvVal('--armed', null);
  const seedsArg = argvVal('--seeds', null);
  if (!controlDir || !armedDir || !seedsArg) {
    console.error('usage: node scripts/analyze-gatehorizon-b.js --control <dir> --armed <dir> --seeds <csv> [--json <file>]');
    process.exit(2);
  }
  const seeds = seedsArg.split(',').map(function (s) { return parseInt(s.trim(), 10); });
  const res = analyze(controlDir, armedDir, seeds, {
    prefix: process.env.CORPUS_PREFIX || 'gatehorizon-b',
    run: process.env.RUN || 'gatehorizon-b',
  });
  printReport(res);
  const jsonOut = argvVal('--json', null);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(res, null, 2) + '\n');
  process.exit(res.verdict === 'GO' ? 0 : 1);
}

module.exports = { analyze: analyze, poolDoorLeaderDeaths: poolDoorLeaderDeaths, d5Check: d5Check, d6Check: d6Check, selftest: selftest, median: median };
