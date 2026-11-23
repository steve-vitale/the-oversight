// analyze-homebody-pool-a.js — CORRECTED-METRIC judge, arm
// sim-homebody-metric-a (findings #2498/#2568). The 0215Z re-judge
// verdict was NO-GO on a METRIC-BROKEN bar (armed launches >= 1.5x
// control — a multiple of TOTAL launches, which the handoff cannot
// touch). This judge implements the corrected bars frozen in
// evidence/2026-11-23/sim-homebody-metric-a-prereg.md §7:
//   PRIMARY: converted share of the convertible-hold pool >= 50%
//     AND party conversions >= 2.
//   GUARDRAILS: total deaths armed <= ceil(1.1 x control);
//     median survival armed >= 0.8 x control.
// The pool is the set of cases the lever faced: DISTINCT
// (seed, oldHolder, target) triples among armed-leg handoff rows
// with result 'launch' or 'hold', oldHolderMaxD strictly 0, and
// wave-4+ (needWave >= 4 OR a wave-4+ target). 'skip' rows are
// non-cases by the method's own filters and never enter the pool.
// Distinct triples, not rows: one held plan is re-attempted every
// dawn (36 hold rows were 2 plans on the re-judge band). A triple
// converts iff a matching handoff row launched with party >= 1
// (solo launches are reported, never counted).
// The analyzer's own bars/verdict (2115Z bars) are NOT the judge:
// this script reads the analyzer JSON only for detPass, instrument
// errors, and launch counts (cross-checked against its own count
// from the per-seed corpora), and computes the corrected verdict.
// Usage:
//   node scripts/analyze-homebody-pool-a.js --ctl <dir> --arm <dir>
//     --analyzer <analysis.json> --seeds 107455,...,107470 --out <file>
//   node scripts/analyze-homebody-pool-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

const W4P_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());
function isW4(needWave, target) {
  return ((needWave | 0) >= 4) || (target != null && W4P_SET.has(target));
}
function isStarvationDeath(d) {
  return !!d && (/starv|hunger/i.test(String(d.kind || '')) || /starv|hunger/i.test(String(d.cause || '')));
}
function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}
function key3(seed, holder, target) { return seed + '|' + holder + '|' + (target == null ? '' : target); }

// Pure judge: ctlSeeds/armSeeds are parsed per-seed JSON objects;
// analyzer is the parsed analyze-homebody-a.js output (may be null
// in selftest, in which case det/instrument/launches come from the
// corpora alone and analyzerChecked is false).
function judgePool(ctlSeeds, armSeeds, analyzer) {
  // --- Pool (armed-leg handoff cases, distinct triples) ---
  const poolMap = {}; // key -> {seed, oldHolder, target, cases, launches, partyLaunches, soloLaunches, holds}
  for (const out of armSeeds) {
    for (const h of (out.handoffs || [])) {
      if (h.result !== 'launch' && h.result !== 'hold') continue; // 'skip' is a non-case
      if (h.oldHolderMaxD !== 0) continue;
      if (!isW4(h.needWave, h.target)) continue;
      const k = key3(out.seed, h.oldHolder, h.target);
      const t = poolMap[k] || (poolMap[k] = { seed: out.seed, oldHolder: h.oldHolder, target: h.target || null,
        cases: 0, launches: 0, partyLaunches: 0, soloLaunches: 0, holds: 0, partySizes: [] });
      t.cases++;
      if (h.result === 'launch') {
        t.launches++;
        const plen = Array.isArray(h.party) ? h.party.length : 0;
        t.partySizes.push(plen);
        if (plen >= 1) t.partyLaunches++; else t.soloLaunches++;
      } else { t.holds++; }
    }
  }
  const poolTriples = Object.keys(poolMap).map(function (k) { return poolMap[k]; });
  const partyConverted = poolTriples.filter(function (t) { return t.partyLaunches >= 1; });
  const soloOnly = poolTriples.filter(function (t) { return t.partyLaunches === 0 && t.soloLaunches >= 1; });
  const holdOnly = poolTriples.filter(function (t) { return t.launches === 0; });
  const pool = poolTriples.length;
  const share = pool ? partyConverted.length / pool : null;
  // --- Pool cross-check (control-leg distinct held plans) ---
  const ctlMap = {};
  for (const out of ctlSeeds) {
    for (const d of (out.v4departs || [])) {
      if (d.result !== 'hold') continue;
      if (!isW4(d.needWave, d.target)) continue;
      const m0 = (d.members || [])[0];
      if (!m0 || m0.maxD !== 0) continue;
      ctlMap[key3(out.seed, d.vid, d.target)] = { seed: out.seed, holder: d.vid, target: d.target || null };
    }
  }
  const poolCtl = Object.keys(ctlMap).map(function (k) { return ctlMap[k]; });
  // --- Launches (own count, for the zero-launch rule + cross-check) ---
  function launchesOf(rows) {
    let n = 0;
    for (const out of rows) for (const d of (out.v4departs || [])) {
      if (d.result === 'launch' && isW4(d.needWave, d.target)) n++;
    }
    return n;
  }
  const ctlLaunches = launchesOf(ctlSeeds);
  const armLaunches = launchesOf(armSeeds);
  // --- Deaths + survival ---
  function deathsOf(rows) {
    let total = 0, starv = 0;
    for (const out of rows) for (const d of (out.deaths || [])) { total++; if (isStarvationDeath(d)) starv++; }
    return { total: total, starv: starv };
  }
  const ctlDeaths = deathsOf(ctlSeeds);
  const armDeaths = deathsOf(armSeeds);
  const ctlMed = median(ctlSeeds.map(function (o) { return o.gameDays; }));
  const armMed = median(armSeeds.map(function (o) { return o.gameDays; }));
  // --- Instrument / det / analyzer cross-check ---
  let instrumentErrors = 0;
  for (const out of ctlSeeds.concat(armSeeds)) instrumentErrors += (out.instrumentErrors || []).length;
  let detPass = null, analyzerChecked = false, analyzerMismatch = null;
  if (analyzer) {
    analyzerChecked = true;
    detPass = !!analyzer.detPass;
    if ((analyzer.ctl ? analyzer.ctl.launches : null) !== ctlLaunches ||
        (analyzer.arm ? analyzer.arm.launches : null) !== armLaunches) {
      analyzerMismatch = 'launch count differs from analyzer: own ' + ctlLaunches + '/' + armLaunches +
        ' vs analyzer ' + (analyzer.ctl && analyzer.ctl.launches) + '/' + (analyzer.arm && analyzer.arm.launches);
    }
    if ((analyzer.ctl ? analyzer.ctl.instrumentErrors : 0) + (analyzer.arm ? analyzer.arm.instrumentErrors : 0) !== instrumentErrors) {
      analyzerMismatch = (analyzerMismatch ? analyzerMismatch + '; ' : '') + 'instrument-error count differs from analyzer';
    }
  }
  const instrument = (instrumentErrors === 0) && !analyzerMismatch;
  const det = detPass;
  // --- Bars (frozen prereg §7) ---
  const zeroLaunch = (ctlLaunches < 5 || armLaunches < 5);
  const poolEmpty = (pool === 0);
  const bars = {
    instrument: instrument,
    detGate: det === true,
    share: (share != null) && (share >= 0.5),
    partyConversions: partyConverted.length >= 2,
    totalDeaths: armDeaths.total <= ctlDeaths.total + Math.ceil(ctlDeaths.total / 10),
    survival: (ctlMed != null && armMed != null) && (armMed >= 0.8 * ctlMed),
  };
  let verdict = 'NO-GO';
  if (zeroLaunch || poolEmpty) verdict = 'INCONCLUSIVE';
  else if (bars.instrument && bars.detGate && bars.share && bars.partyConversions && bars.totalDeaths && bars.survival) verdict = 'GO';
  return {
    verdict: verdict, zeroLaunch: zeroLaunch, poolEmpty: poolEmpty,
    seeds: ctlSeeds.map(function (o) { return o.seed; }),
    pool: pool, share: share,
    partyConversions: partyConverted.length, soloOnlyConversions: soloOnly.length,
    holdOnlyTriples: holdOnly.length,
    poolTriples: poolTriples, poolCtl: poolCtl.length, poolCtlTriples: poolCtl,
    ctlLaunches: ctlLaunches, armLaunches: armLaunches,
    launchDelta: armLaunches - ctlLaunches,
    ctlDeaths: ctlDeaths, armDeaths: armDeaths,
    totalDeathsCap: ctlDeaths.total + Math.ceil(ctlDeaths.total / 10),
    ctlMedianSurvival: ctlMed, armMedianSurvival: armMed,
    instrumentErrors: instrumentErrors, detPass: detPass,
    analyzerChecked: analyzerChecked, analyzerMismatch: analyzerMismatch,
    bars: bars,
  };
}

function loadLeg(dir, mode, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'homebody-a-s' + seed + '-homebody-a-' + mode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(JSON.parse(fs.readFileSync(fp, 'utf8')));
  }
  return rows;
}
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
function main() {
  const ctlDir = argvVal('--ctl', null);
  const armDir = argvVal('--arm', null);
  const analyzerPath = argvVal('--analyzer', null);
  const outPath = argvVal('--out', null);
  const seeds = (argvVal('--seeds', '') || '').split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  if (!ctlDir || !armDir || !seeds.length) {
    console.error('usage: node scripts/analyze-homebody-pool-a.js --ctl <dir> --arm <dir> [--analyzer <analysis.json>] --seeds 107455,... [--out <file>]');
    process.exit(2);
  }
  const ctlSeeds = loadLeg(ctlDir, 'ctl', seeds);
  const armSeeds = loadLeg(armDir, 'arm', seeds);
  const analyzer = analyzerPath ? JSON.parse(fs.readFileSync(analyzerPath, 'utf8')) : null;
  const res = judgePool(ctlSeeds, armSeeds, analyzer);
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
  console.log('verdict: ' + res.verdict);
  console.log('pool: ' + res.pool + ' (ctl cross-check: ' + res.poolCtl + ')' +
    '  share: ' + (res.share == null ? 'n/a' : (res.share * 100).toFixed(1) + '%') +
    '  party conversions: ' + res.partyConversions + '  solo-only: ' + res.soloOnlyConversions +
    '  hold-only: ' + res.holdOnlyTriples);
  console.log('launches: ctl ' + res.ctlLaunches + ' arm ' + res.armLaunches + ' (delta ' + (res.launchDelta >= 0 ? '+' : '') + res.launchDelta + ', reported not judged)');
  console.log('total deaths: ctl ' + res.ctlDeaths.total + ' arm ' + res.armDeaths.total + ' (cap ' + res.totalDeathsCap + ')' +
    '  starvation: ctl ' + res.ctlDeaths.starv + ' arm ' + res.armDeaths.starv);
  console.log('median survival: ctl ' + res.ctlMedianSurvival + ' arm ' + res.armMedianSurvival);
  console.log('instrument errors: ' + res.instrumentErrors + '  det: ' + res.detPass +
    (res.analyzerMismatch ? '  MISMATCH: ' + res.analyzerMismatch : ''));
  console.log('bars: ' + JSON.stringify(res.bars));
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  function seedOut(o) {
    return Object.assign({ seed: 107455, mode: 'arm', gameDays: 150, instrumentErrors: [],
      v4departs: [], deaths: [], handoffs: [] }, o || {});
  }
  function hf(o) {
    return Object.assign({ day: 80, oldHolder: 'dale', oldHolderProfile: 'homebody',
      oldHolderMaxD: 0, newLeader: 'maya', target: 'herald', needWave: 4,
      party: ['bob'], result: 'launch' }, o || {});
  }
  function hold(o) {
    return Object.assign({ day: 80, vid: 'dale', result: 'hold', target: 'herald', needWave: 4,
      members: [{ vid: 'dale', profile: 'homebody', maxD: 0 }] }, o || {});
  }
  function launch(o) {
    return Object.assign({ day: 100, vid: 'alice', result: 'launch', target: 'herald', needWave: 4,
      party: ['bob'], partySize: 2, members: [] }, o || {});
  }
  const ctlBase = [seedOut({ mode: 'ctl', seed: 107455, v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ mode: 'ctl', seed: 107456, v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  // Matching fake analyzer (det true, launch counts as the corpora
  // carry them): the judge needs an analyzer to certify det/instrument.
  function an(ctlL, armL, det) {
    return { detPass: det !== false, ctl: { launches: ctlL, instrumentErrors: 0 }, arm: { launches: armL, instrumentErrors: 0 } };
  }
  // 1. Pool counts DISTINCT triples, not rows (repeat dawn attempts of one plan = 1).
  let arm1 = [seedOut({ seed: 107455, handoffs: [hf(), hf({ day: 81 }), hf({ day: 82 }), hf({ day: 83, result: 'skip', newLeader: null, party: null, target: null, needWave: null })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [hf({ oldHolder: 'erin', target: 'eulogy' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r1 = judgePool(ctlBase, arm1, an(12, 12));
  check('pool is 2 distinct triples despite 5 case rows', r1.pool === 2, r1.pool);
  check('share 2/2 = 1', r1.share === 1, r1.share);
  check('party conversions 2', r1.partyConversions === 2);
  check('verdict GO on clean synthetic', r1.verdict === 'GO', r1.verdict);
  // 2. Skip rows never enter the pool; wave-3 and walker rows excluded.
  let arm2 = [seedOut({ seed: 107455, handoffs: [
      hf({ result: 'skip', newLeader: null, party: null, target: null, needWave: null }),
      hf({ oldHolderMaxD: 1 }), // walker holder: not a case
      hf({ target: 'spool', needWave: 3 }), // wave-3: not a case
      hf({ oldHolderMaxD: null }), // null maxD never counts
    ], v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [], v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r2 = judgePool(ctlBase, arm2, an(12, 12));
  check('skips/walkers/wave-3/null-maxD excluded: pool 0', r2.pool === 0, r2.pool);
  check('pool 0 -> INCONCLUSIVE', r2.verdict === 'INCONCLUSIVE', r2.verdict);
  // 3. Solo conversion does not count; hold-only triple does not convert.
  let arm3 = [seedOut({ seed: 107455, handoffs: [hf({ party: [] })], // solo launch
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [hf({ oldHolder: 'erin', target: 'eulogy', result: 'hold', newLeader: null, party: null })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r3 = judgePool(ctlBase, arm3, an(12, 12));
  check('pool 2 (solo + hold-only)', r3.pool === 2, r3.pool);
  check('share 0 (solo never counts)', r3.share === 0, r3.share);
  check('solo-only 1, hold-only 1', r3.soloOnlyConversions === 1 && r3.holdOnlyTriples === 1, [r3.soloOnlyConversions, r3.holdOnlyTriples]);
  check('share 0 -> NO-GO', r3.verdict === 'NO-GO', r3.verdict);
  // 4. Share exactly 50% with 2 conversions passes bars 3-4.
  let arm4 = [seedOut({ seed: 107455, handoffs: [hf(), hf({ oldHolder: 'erin', target: 'eulogy' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [hf({ oldHolder: 'femi', target: 'audit', result: 'hold', newLeader: null, party: null }),
        hf({ oldHolder: 'gail', target: 'suburb', result: 'hold', newLeader: null, party: null })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r4 = judgePool(ctlBase, arm4, an(12, 12));
  check('pool 4, share 50%', r4.pool === 4 && r4.share === 0.5, [r4.pool, r4.share]);
  check('share 50% + 2 conversions -> GO', r4.verdict === 'GO', r4.verdict);
  // 5. Pool 1 caps at NO-GO (bar 4 needs 2).
  let arm5 = [seedOut({ seed: 107455, handoffs: [hf()], v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [], v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r5 = judgePool(ctlBase, arm5, an(12, 12));
  check('pool 1, share 100%, conversions 1 -> NO-GO', r5.verdict === 'NO-GO' && r5.bars.share && !r5.bars.partyConversions, r5.verdict);
  // 6. Guardrails: total deaths cap ceil(1.1x); survival 0.8x.
  function dead(n, starv) {
    const ds = [];
    for (let i = 0; i < n; i++) ds.push(starv && i === 0 ? { kind: 'starvation', cause: 'hunger' } : { kind: 'old age', cause: 'age' });
    return ds;
  }
  let ctl6 = [seedOut({ mode: 'ctl', seed: 107455, gameDays: 150, deaths: dead(100), v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ mode: 'ctl', seed: 107456, gameDays: 100, deaths: dead(100), v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let arm6 = [seedOut({ seed: 107455, gameDays: 150, deaths: dead(110), handoffs: [hf(), hf({ oldHolder: 'erin', target: 'eulogy' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, gameDays: 100, deaths: dead(110), handoffs: [],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r6 = judgePool(ctl6, arm6, an(12, 12));
  check('total deaths 220 vs cap ceil(1.1*200)=220 passes', r6.bars.totalDeaths && r6.totalDeathsCap === 220, [r6.armDeaths.total, r6.totalDeathsCap]);
  check('median survival 125 vs 125 passes', r6.bars.survival, [r6.ctlMedianSurvival, r6.armMedianSurvival]);
  check('guardrails at cap still GO', r6.verdict === 'GO', r6.verdict);
  let arm6b = [seedOut({ seed: 107455, gameDays: 150, deaths: dead(111), handoffs: [hf(), hf({ oldHolder: 'erin', target: 'eulogy' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, gameDays: 100, deaths: dead(110), handoffs: [],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r6b = judgePool(ctl6, arm6b, an(12, 12));
  check('total deaths 221 > cap 220 fails guardrail', !r6b.bars.totalDeaths && r6b.verdict === 'NO-GO', r6b.verdict);
  // 7. Zero-launch rule: either leg < 5 launches -> INCONCLUSIVE.
  let ctl7 = [seedOut({ mode: 'ctl', seed: 107455, v4departs: [launch(), launch()] }),
    seedOut({ mode: 'ctl', seed: 107456, v4departs: [launch(), launch(), launch()] })];
  let r7 = judgePool(ctl7, arm1, an(5, 12));
  check('ctl launches 5... arm 12, ctl 5: not zero-launch', !r7.zeroLaunch, r7.zeroLaunch);
  let ctl7b = [seedOut({ mode: 'ctl', seed: 107455, v4departs: [launch()] }),
    seedOut({ mode: 'ctl', seed: 107456, v4departs: [launch(), launch()] })];
  let r7b = judgePool(ctl7b, arm1, an(3, 12));
  check('ctl launches 3 < 5 -> INCONCLUSIVE', r7b.zeroLaunch && r7b.verdict === 'INCONCLUSIVE', r7b.verdict);
  // 8. Pool cross-check from control holds (distinct triples, maxD-0 only).
  let ctl8 = [seedOut({ mode: 'ctl', seed: 107455, v4departs: [hold(), hold({ day: 81 }), hold({ day: 82 }),
      hold({ vid: 'erin', members: [{ vid: 'erin', profile: 'forager', maxD: 1 }] }),
      hold({ vid: 'femi', target: 'audit' }), launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ mode: 'ctl', seed: 107456, v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r8 = judgePool(ctl8, arm1, an(12, 12));
  check('poolCtl 2 (dale/herald x3 rows = 1, femi/audit = 1; walker excluded)', r8.poolCtl === 2, r8.poolCtl);
  // 9. Wave-4 target with null needWave is a case (OR definition).
  let arm9 = [seedOut({ seed: 107455, handoffs: [hf({ needWave: null, target: 'herald' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] }),
    seedOut({ seed: 107456, handoffs: [hf({ oldHolder: 'erin', target: 'eulogy' })],
      v4departs: [launch(), launch(), launch(), launch(), launch(), launch()] })];
  let r9 = judgePool(ctlBase, arm9, an(12, 12));
  check('null-needWave wave-4 target counts: pool 2, GO', r9.pool === 2 && r9.verdict === 'GO', [r9.pool, r9.verdict]);
  // 10. Analyzer mismatch (launch count differs) fails instrument.
  let fakeAnalyzer = { detPass: true, ctl: { launches: 999, instrumentErrors: 0 }, arm: { launches: 12, instrumentErrors: 0 } };
  let r10 = judgePool(ctlBase, arm1, fakeAnalyzer);
  check('analyzer launch mismatch -> instrument false -> NO-GO', !r10.bars.instrument && r10.verdict === 'NO-GO' && !!r10.analyzerMismatch, r10.verdict);
  // 11. Det-gate failure -> NO-GO.
  let fakeAnalyzer2 = { detPass: false, ctl: { launches: 12, instrumentErrors: 0 }, arm: { launches: 12, instrumentErrors: 0 } };
  let r11 = judgePool(ctlBase, arm1, fakeAnalyzer2);
  check('det false -> NO-GO', !r11.bars.detGate && r11.verdict === 'NO-GO', r11.verdict);
  console.log('pool selftest: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) selftest();
  else main();
}
module.exports = { judgePool: judgePool, isW4: isW4 };
