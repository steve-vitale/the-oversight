// analyze-partyquads-b.js — analyzer + judge, arm sim-partyquads-b.
// Reads per-seed JSONs (the partyquads driver recorder, same shape as
// the partytrios corpora) from two dirs and judges the frozen prereg:
// the counter, not the launch. Primary: on the armed leg,
// winPlanStats.partyQuads counts the quads the analyzer observes in
// v4departs (partySize >= 4); on the control leg the counter stays 0.
// The quad-launch rate itself is NOT expected to be judged — the
// prereg's correction says no quad launch path exists on this tip
// (no candidate sets companion3, PARTYSIZE4 read by no code, max
// launch size 3), so the expected outcome is NO-QUAD-POOL: the pool
// floor fails with zero observed quads on both legs, and the arm
// verdict is HELD, not GO. A 0==0 match is vacuous and never a GO.
// Reuses analyze-triodrought-b.js legStats for the launch census
// (same join, same pool floor) and adds a per-seed
// partyQuads-vs-observed-quads table plus the wall numbers.
// Usage:
//   node scripts/analyze-partyquads-b.js --ctl evidence/2026-11-18/perseed-partyquads-b-ctl --arm evidence/2026-11-18/perseed-partyquads-b-arm [--out evidence/2026-11-18/partyquads-b-analysis.json]
//   node scripts/analyze-partyquads-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const TD = require(path.join(__dirname, 'analyze-triodrought-b.js'));

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function perSeed(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const rows = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    let trios = 0, quads = 0, launches = 0;
    for (const r of (d.v4departs || [])) {
      if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
      launches++;
      const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
      if (size >= 3) trios++;
      if (size >= 4) quads++;
    }
    rows.push({
      seed: d.seed, days: d.gameDays != null ? d.gameDays : (d.days != null ? d.days : 0),
      launches: launches, observedTrios: trios, observedQuads: quads,
      partyTrios: ((d.winPlanStats || {}).partyTrios || 0),
      partyQuads: ((d.winPlanStats || {}).partyQuads || 0),
      won: !!d.won, scaleRank: d.scaleRank || null, maxWave: d.maxWave || null,
      standing: d.standing != null ? d.standing : null,
      bumpPresent: d.bumpPresent != null ? d.bumpPresent : null,
      carryPresent: d.carryPresent != null ? d.carryPresent : null,
      errors: (d.instrumentErrors || []).length,
    });
  }
  return rows;
}

function wall(rows) {
  return {
    wins: rows.filter(function (r) { return r.won; }).length,
    national: rows.filter(function (r) { return (RANK_ORDER[r.scaleRank] || 0) >= 2; }).length,
    wave5: rows.filter(function (r) { return (r.maxWave || 0) >= 5; }).length,
    wave4: rows.filter(function (r) { return (r.maxWave || 0) >= 4; }).length,
    standing200: rows.filter(function (r) { return (r.standing || 0) >= 200; }).length,
    medianDays: median(rows.map(function (r) { return r.days; })),
    survived: rows.filter(function (r) { return (r.days || 0) >= 150; }).length,
  };
}

function judge(ctl, arm) {
  const bars = [];
  const launchesOk = ctl.launches >= 6 && arm.launches >= 6;
  const poolOk = launchesOk && arm.quadLaunches >= 1;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'launches ctl ' + ctl.launches + ' / arm ' + arm.launches + '; observed quads arm ' + arm.quadLaunches + ' (floor 6 launches/leg, >=1 arm quad)' });
  const ratio = arm.quadLaunches ? arm.partyQuads / arm.quadLaunches : null;
  const exactSeeds = (arm.perSeed || []).filter(function (r) { return r.partyQuads === r.observedQuads; }).length;
  const exactTotal = (arm.perSeed || []).length;
  const primaryPass = poolOk && ratio != null && ratio >= 0.80 && ctl.partyQuads === 0 && exactTotal > 0 && exactSeeds >= Math.max(1, exactTotal - 1);
  bars.push({ id: 'primary-counter', pass: primaryPass,
    detail: 'arm partyQuads ' + arm.partyQuads + ' / observed quads ' + arm.quadLaunches +
      ' = ' + (ratio == null ? 'n/a (no quads observed)' : ratio.toFixed(2)) + ' (bar >= 0.80); ctl partyQuads ' + ctl.partyQuads + ' (bar == 0); per-seed exact ' + exactSeeds + '/' + exactTotal + ' (bar >=7/8)' });
  // No-misfire: with zero observed quads the arm counter must read
  // exactly 0 — a nonzero count there means the bump fires on a trio
  // (wrong placement), which is NO-GO outright, not a vacuous pass.
  const misfirePass = arm.quadLaunches === 0 ? arm.partyQuads === 0 : true;
  bars.push({ id: 'no-misfire', pass: misfirePass,
    detail: 'observed quads arm ' + arm.quadLaunches + '; arm partyQuads ' + arm.partyQuads + ' (bar == 0 when no quads observed)' });
  // Trio counts must be untouched by the quad bump (same legs, same
  // launches — the arm must not steal or duplicate trio counts).
  const trioPass = ctl.partyTrios === arm.partyTrios;
  bars.push({ id: 'trio-counts-untouched', pass: trioPass,
    detail: 'partyTrios ctl ' + ctl.partyTrios + ' vs arm ' + arm.partyTrios + ' (bar equal)' });
  const starvPass = arm.starvation <= ctl.starvation + 2 && arm.starvationVillager <= ctl.starvationVillager + 2;
  bars.push({ id: 'cost-starvation', pass: starvPass,
    detail: 'starvation totals arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + '; villager arm ' + arm.starvationVillager + ' vs ctl ' + ctl.starvationVillager + ' (bar arm<=ctl+2 both)' });
  const medPass = ctl.medianDays == null || arm.medianDays == null || arm.medianDays >= 0.8 * ctl.medianDays;
  bars.push({ id: 'cost-median', pass: medPass,
    detail: 'median survival arm ' + arm.medianDays + 'd vs ctl ' + ctl.medianDays + 'd (bar arm>=0.8x ctl)' });
  const instrPass = ctl.errors === 0 && arm.errors === 0;
  bars.push({ id: 'instrument', pass: instrPass,
    detail: 'instrument errors ctl ' + ctl.errors + ' / arm ' + arm.errors + ' (bar 0)' });
  let verdict = 'NO-GO';
  let kind = '';
  if (!launchesOk) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (arm.quadLaunches === 0 && ctl.quadLaunches === 0) { verdict = 'NO-GO'; kind = 'NO-QUAD-POOL'; }
  else if (bars.every(function (b) { return b.pass; })) { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarizeLeg(dir) {
  const st = TD.legStats(dir);
  const seeds = perSeed(dir);
  const quadLaunches = seeds.reduce(function (a, r) { return a + r.observedQuads; }, 0);
  const partyQuads = seeds.reduce(function (a, r) { return a + r.partyQuads; }, 0);
  return {
    dir: dir, n: st.n, valid: st.valid, errors: st.errors,
    launches: st.launches, trioLaunches: st.trioLaunches, trioRate: st.trioRate,
    quadLaunches: quadLaunches, partyQuads: partyQuads,
    sizes: st.sizes, sources: st.sources, c2depart: st.c2depart,
    candC2: st.candC2, candC2carried: st.candC2carried, candC2dropped: st.candC2dropped,
    candC2null: st.candC2null, unjoined: st.unjoined, midday: st.midday, dawn: st.dawn,
    carryRate: st.carryRate, starvation: st.starvation, starvationVillager: st.starvationVillager,
    medianDays: st.medianDays, partyTrios: st.partyTrios,
    brainSha: st.brainSha, carryPresent: st.carryPresent,
    perSeed: seeds, wall: wall(seeds),
  };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  function mkLeg(o) {
    return Object.assign({ launches: 8, trioLaunches: 0, trioRate: 0, partyTrios: 0,
      quadLaunches: 0, partyQuads: 0, perSeed: [],
      starvation: 0, starvationVillager: 0, medianDays: 150, errors: 0 }, o);
  }
  function mkSeeds(n, quad, counted) {
    const rows = [];
    for (let i = 0; i < n; i++) rows.push({ seed: 105001 + i, observedQuads: quad, partyQuads: counted });
    return rows;
  }
  let j = judge(mkLeg({ trioLaunches: 0, partyTrios: 5 }), mkLeg({ trioLaunches: 19, partyTrios: 5, quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0 }; }) }));
  check('judge GO shape passes (6/6 quads, exact per seed, ctl 0)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkLeg({ trioLaunches: 0, partyTrios: 5 }), mkLeg({ trioLaunches: 19, partyTrios: 5, quadLaunches: 6, partyQuads: 0, perSeed: mkSeeds(8, 0, 0) }));
  check('judge NO-GO when the arm counter stays 0 with quads present (the bug)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({ quadLaunches: 6, partyQuads: 4, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 4 ? 1 : 0 }; }) }));
  check('judge NO-GO at 4/6 = 0.67 (< 0.80)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ trioLaunches: 0, partyTrios: 5 }), mkLeg({ trioLaunches: 19, partyTrios: 5, quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0 }; }) }));
  check('judge GO at 6/6 = 1.00 with trio counts untouched', j.verdict === 'GO', JSON.stringify(j.bars));
  j = judge(mkLeg({}), mkLeg({ quadLaunches: 0, partyQuads: 0, perSeed: mkSeeds(8, 0, 0) }));
  check('judge NO-QUAD-POOL when no quads launch on either leg (vacuous 0==0 is not GO)', j.verdict === 'NO-GO' && j.kind === 'NO-QUAD-POOL', JSON.stringify(j));
  j = judge(mkLeg({}), mkLeg({ quadLaunches: 0, partyQuads: 2, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: 0, partyQuads: i < 2 ? 1 : 0 }; }) }));
  check('judge NO-GO on misfire (counter 2 with 0 quads observed)', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ trioLaunches: 0, partyTrios: 5 }), mkLeg({ trioLaunches: 19, partyTrios: 6, quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0 }; }) }));
  check('judge NO-GO when trio counts move between legs', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ trioLaunches: 0, partyTrios: 5 }), mkLeg({ trioLaunches: 19, partyTrios: 5, quadLaunches: 6, partyQuads: 6, starvation: 3, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0 }; }) }));
  check('judge NO-GO when the starvation cost bar breaches', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ launches: 3 }), mkLeg({ launches: 8, quadLaunches: 5, partyQuads: 5, perSeed: mkSeeds(8, 0, 0) }));
  check('judge METRIC-BROKEN below the launch floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkLeg({ partyQuads: 1 }), mkLeg({ quadLaunches: 6, partyQuads: 6, perSeed: mkSeeds(8, 0, 0).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0 }; }) }));
  check('judge NO-GO when the control counter is nonzero', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  // perSeed + wall on a synthetic corpus dir.
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pq-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  const seed = {
    seed: 105001, days: 150, gameDays: 150, instrumentErrors: [], brainSha: 'abc', carryPresent: true, bumpPresent: true,
    winPlanStats: { partyTrios: 2, partyQuads: 1 },
    won: false, scaleRank: 'national', maxWave: 5, standing: 405,
    deaths: [{ day: 5, kind: 'starvation', cause: 'hunger', player: false }],
    v4departs: [
      { day: 10, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 4, companion2: 'c2', companion3: 'c3', party: ['c1', 'c2', 'c3'] },
      { day: 12, vid: 'h1', result: 'launch', source: 'brain', targetWave: 4, partySize: 3, companion2: 'c2', party: ['c1', 'c2'] },
      { day: 14, vid: 'h2', result: 'launch', source: 'brain', targetWave: 3, partySize: 2, companion2: null, party: ['c1'] },
    ],
    dawnbidDeparts: [], dawnbidScores: [], companionPool: [],
  };
  fs.writeFileSync(path.join(dir, 's105001.json'), JSON.stringify(seed));
  const rows = perSeed(dir);
  check('perSeed counts observed quads 1, trios 2, partyQuads 1',
    rows.length === 1 && rows[0].observedQuads === 1 && rows[0].observedTrios === 2 && rows[0].partyQuads === 1 && rows[0].launches === 2,
    JSON.stringify(rows));
  check('perSeed ignores wave-3 launches', rows[0].launches === 2);
  const w = wall(rows);
  check('wall counts national 1, wave5 1, standing200 1, survived 1',
    w.national === 1 && w.wave5 === 1 && w.standing200 === 1 && w.survived === 1 && w.wins === 0,
    JSON.stringify(w));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-partyquads-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let ctlDir = null, armDir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ctl') ctlDir = args[++i];
    else if (args[i] === '--arm') armDir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!ctlDir || !armDir) { console.error('usage: analyze-partyquads-b.js --ctl DIR --arm DIR [--out FILE] | --selftest'); process.exit(2); }
  const ctl = summarizeLeg(ctlDir);
  const arm = summarizeLeg(armDir);
  const j = judge(ctl, arm);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: ctl, arm: arm };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    ctl: { launches: ctl.launches, trioLaunches: ctl.trioLaunches, quadLaunches: ctl.quadLaunches, partyTrios: ctl.partyTrios, partyQuads: ctl.partyQuads, wall: ctl.wall },
    arm: { launches: arm.launches, trioLaunches: arm.trioLaunches, quadLaunches: arm.quadLaunches, partyTrios: arm.partyTrios, partyQuads: arm.partyQuads, wall: arm.wall } }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { perSeed: perSeed, wall: wall, judge: judge, summarizeLeg: summarizeLeg };
