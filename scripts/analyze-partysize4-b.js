// analyze-partysize4-b.js — analyzer + judge, arm sim-partysize4-b.
// Reads per-seed JSONs (the partysize4 driver recorder, same shape as
// the partyquads corpora) from two dirs and judges the frozen prereg:
// the PARTYSIZE4 lever itself — a quad must actually LAUNCH on the
// armed leg (partySize >= 4 in v4departs) AND winPlanStats.partyQuads
// must count it, while the control leg (same code, flag off) launches
// no quads and counts none. Finding #2550 (decided in the prereg):
// partyQuads counts LAUNCHES only — gate-4s (field joins at the
// fight) do not count, so this judge reads v4departs only.
// Reuses analyze-partyquads-b.js perSeed/wall/summarizeLeg for the
// launch census (same join, same pool floor) and adds a per-seed
// partyQuads-vs-observed-quads table, a per-seed partyTrios-vs-
// observed-trios accounting table, a size-4 damage-share report,
// and the wall numbers. The partyquads "trio counts untouched
// across legs" bar is deliberately DROPPED here: with the lever on,
// a trio legitimately becomes a quad and trajectories diverge —
// cross-leg equality is the wrong check for a lever arm;
// per-seed accounting is the right one.
// Usage:
//   node scripts/analyze-partysize4-b.js --ctl evidence/2026-11-18/perseed-partysize4-b-ctl --arm evidence/2026-11-18/perseed-partysize4-b-arm [--out evidence/2026-11-18/partysize4-b-analysis.json]
//   node scripts/analyze-partysize4-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const PQ = require(path.join(__dirname, 'analyze-partyquads-b.js'));
const perSeed = PQ.perSeed;
const wall = PQ.wall;
const summarizeLeg = PQ.summarizeLeg;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Size-4 damage share, REPORTED not binding (prereg): the
// fight-ally cap is known-binding (a 4th member travels but cannot
// join the fight), so a share claim from this pilot would overreach.
// Computed from the per-seed files' v4encounters with the
// partysize-b launch join: an encounter belongs to a quad launch
// when its day falls within [launch day, launch day + 21], its
// monster matches the launch target (or the target is null), and
// its fighter (or ally) is in the launch party. Share = mDealt /
// mHpStart (vKill = 1.0 by definition); the recorder repair
// supplies mHpStart on fought rows (no-contact evades are correct
// nulls and excluded).
function size4Shares(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const shares = [];
  let fought = 0, noHp = 0;
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    const quads = [];
    for (const r of (d.v4departs || [])) {
      if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
      const size = r.partySize != null ? r.partySize : ((r.party || []).length + 1);
      if (size >= 4) quads.push({ day: r.day, vid: r.vid, target: r.target || null, party: [r.vid].concat(r.party || []) });
    }
    for (const e of (d.v4encounters || [])) {
      if (e.origin !== 'expedition') continue;
      if ((e.rounds || 0) === 0 && (e.mDealt || 0) === 0) continue; // no-contact evade: no monster spawned
      let launched = null;
      for (const l of quads) {
        if (e.day < l.day || e.day > l.day + 21) continue;
        if (l.target && e.mid !== l.target) continue;
        if (e.vid === l.vid || l.party.indexOf(e.vid) !== -1) { launched = l; break; }
        if (e.allyVid && (e.allyVid === l.vid || l.party.indexOf(e.allyVid) !== -1)) { launched = l; break; }
      }
      if (!launched) continue;
      fought++;
      if (e.outcome === 'vKill') { shares.push(1.0); continue; }
      if (e.mHpStart == null) { noHp++; continue; }
      shares.push((e.mDealt || 0) / e.mHpStart);
    }
  }
  return { n: shares.length, fought: fought, noHp: noHp,
    mean: shares.length ? shares.reduce(function (a, b) { return a + b; }, 0) / shares.length : null };
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
  const primaryPass = poolOk && ratio != null && ratio >= 0.80 &&
    ctl.partyQuads === 0 && ctl.quadLaunches === 0 &&
    exactTotal > 0 && exactSeeds >= Math.max(1, exactTotal - 1);
  bars.push({ id: 'primary-quad-fire', pass: primaryPass,
    detail: 'arm partyQuads ' + arm.partyQuads + ' / observed quads ' + arm.quadLaunches +
      ' = ' + (ratio == null ? 'n/a (no quads observed)' : ratio.toFixed(2)) + ' (bar >= 0.80); ctl partyQuads ' + ctl.partyQuads + ' + observed quads ' + ctl.quadLaunches + ' (bar 0/0); per-seed exact ' + exactSeeds + '/' + exactTotal + ' (bar >=7/8)' });
  // No-misfire: with zero observed quads the arm counter must read
  // exactly 0 — a nonzero count there means the bump fires on a trio
  // (wrong placement), which is NO-GO outright, not a vacuous pass.
  const misfirePass = arm.quadLaunches === 0 ? arm.partyQuads === 0 : true;
  bars.push({ id: 'no-misfire', pass: misfirePass,
    detail: 'observed quads arm ' + arm.quadLaunches + '; arm partyQuads ' + arm.partyQuads + ' (bar == 0 when no quads observed)' });
  // Trio accounting (replaces the partyquads cross-leg equality bar):
  // per-seed partyTrios must equal observed size>=3 launches on each
  // leg — the counter stays honest when trajectories diverge.
  function trioExact(rows) {
    return (rows || []).filter(function (r) { return r.partyTrios === r.observedTrios; }).length;
  }
  const ctlTrioExact = trioExact(ctl.perSeed);
  const armTrioExact = trioExact(arm.perSeed);
  const ctlTrioTotal = (ctl.perSeed || []).length;
  const armTrioTotal = (arm.perSeed || []).length;
  const trioPass = ctlTrioTotal > 0 && armTrioTotal > 0 &&
    ctlTrioExact >= Math.max(1, ctlTrioTotal - 1) && armTrioExact >= Math.max(1, armTrioTotal - 1);
  bars.push({ id: 'trio-accounting', pass: trioPass,
    detail: 'per-seed partyTrios==observedTrios ctl ' + ctlTrioExact + '/' + ctlTrioTotal + ' arm ' + armTrioExact + '/' + armTrioTotal + ' (bar >=7/8 each leg)' });
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
  function mkSeeds(n, quad, counted, trios, trioCounted) {
    const rows = [];
    for (let i = 0; i < n; i++) rows.push({ seed: 105201 + i, observedQuads: quad, partyQuads: counted, observedTrios: trios, partyTrios: trioCounted });
    return rows;
  }
  // GO shape: 6 quads counted 6/6, ctl 0/0, trio accounting exact.
  let j = judge(
    mkLeg({ trioLaunches: 10, partyTrios: 10, perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: 0, partyQuads: 0, observedTrios: i < 2 ? 2 : 1, partyTrios: i < 2 ? 2 : 1 }; }) }),
    mkLeg({ trioLaunches: 9, partyTrios: 10, quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: i < 6 ? 2 : 1, partyTrios: i < 6 ? 2 : 1 }; }) }));
  check('judge GO shape passes (6/6 quads, exact per seed, ctl 0/0, trio accounting exact)', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 6, partyQuads: 0, perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO when the arm counter stays 0 with quads present (the bug)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 6, partyQuads: 4, perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 4 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO at 4/6 = 0.67 (< 0.80)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 0, partyQuads: 0, perSeed: mkSeeds(8, 0, 0, 1, 1) }));
  check('judge NO-QUAD-POOL when no quads launch on either leg (vacuous 0==0 is not GO)', j.verdict === 'NO-GO' && j.kind === 'NO-QUAD-POOL', JSON.stringify(j));
  j = judge(mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 0, partyQuads: 2, perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: 0, partyQuads: i < 2 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO on misfire (counter 2 with 0 quads observed)', j.verdict === 'NO-GO' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6, starvation: 3,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO when the starvation cost bar breaches', j.verdict === 'NO-GO' && !j.bars[4].pass, JSON.stringify(j.bars));
  j = judge(mkLeg({ launches: 3, perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ launches: 8, quadLaunches: 5, partyQuads: 5, perSeed: mkSeeds(8, 0, 0, 1, 1) }));
  check('judge METRIC-BROKEN below the launch floor', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkLeg({ partyQuads: 1, perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO when the control counter is nonzero', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  j = judge(
    mkLeg({ partyQuads: 0, quadLaunches: 0, perSeed: mkSeeds(8, 0, 0, 1, 1) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge GO even when trio totals move across legs (divergence is legitimate)', j.verdict === 'GO', JSON.stringify(j.bars));
  j = judge(
    mkLeg({ perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: 0, partyQuads: 0, observedTrios: 2, partyTrios: 1 }; }) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO when trio accounting breaks on the control leg', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(
    mkLeg({ quadLaunches: 1, partyQuads: 0, perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i === 0 ? 1 : 0, partyQuads: 0, observedTrios: 1, partyTrios: 1 }; }) }),
    mkLeg({ quadLaunches: 6, partyQuads: 6,
      perSeed: mkSeeds(8, 0, 0, 1, 1).map(function (r, i) { return { seed: r.seed, observedQuads: i < 6 ? 1 : 0, partyQuads: i < 6 ? 1 : 0, observedTrios: 1, partyTrios: 1 }; }) }));
  check('judge NO-GO when the control leg launches a quad (flag-off leak)', j.verdict === 'NO-GO' && !j.bars[1].pass, JSON.stringify(j.bars));
  // size4Shares join: day window [launch, launch+21], target==mid,
  // party membership — a wrong-monster or out-of-window meeting
  // must not count toward the quad share.
  (function () {
    const os2 = require('os');
    const tmp2 = fs.mkdtempSync(path.join(os2.tmpdir(), 'ps4-shares-'));
    const dir2 = path.join(tmp2, 'leg');
    fs.mkdirSync(dir2);
    fs.writeFileSync(path.join(dir2, 's105201.json'), JSON.stringify({
      seed: 105201,
      v4departs: [{ day: 98, vid: 'giulia', result: 'launch', targetWave: 4, target: 'strike', party: ['yara', 'james', 'omar'], partySize: 4 }],
      v4encounters: [
        { day: 100, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 4, mDealt: 180, mHpStart: 900, origin: 'expedition' },
        { day: 100, vid: 'giulia', mid: 'eater', wave: 4, outcome: 'fled', rounds: 3, mDealt: 90, mHpStart: 900, origin: 'expedition' },
        { day: 130, vid: 'giulia', mid: 'strike', wave: 4, outcome: 'fled', rounds: 2, mDealt: 50, mHpStart: 900, origin: 'expedition' },
        { day: 101, vid: 'yara', mid: 'strike', wave: 4, outcome: 'vKill', rounds: 6, mDealt: 0, mHpStart: null, origin: 'expedition' },
      ],
    }));
    const sh2 = size4Shares(dir2);
    check('size4Shares joins the in-window same-target meeting only, vKill counts 1.0',
      sh2.n === 2 && sh2.fought === 2 && sh2.noHp === 0 && Math.abs(sh2.mean - 0.6) < 1e-9, JSON.stringify(sh2));
    try { fs.rmSync(tmp2, { recursive: true, force: true }); } catch (e) {}
  })();
  console.log('analyze-partysize4-b --selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!ctlDir || !armDir) { console.error('usage: analyze-partysize4-b.js --ctl DIR --arm DIR [--out FILE] | --selftest'); process.exit(2); }
  const ctl = summarizeLeg(ctlDir);
  const arm = summarizeLeg(armDir);
  const j = judge(ctl, arm);
  const ctlShares = size4Shares(ctlDir);
  const armShares = size4Shares(armDir);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, ctl: ctl, arm: arm,
    size4Shares: { ctl: ctlShares, arm: armShares } };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    ctl: { launches: ctl.launches, trioLaunches: ctl.trioLaunches, quadLaunches: ctl.quadLaunches, partyTrios: ctl.partyTrios, partyQuads: ctl.partyQuads, wall: ctl.wall },
    arm: { launches: arm.launches, trioLaunches: arm.trioLaunches, quadLaunches: arm.quadLaunches, partyTrios: arm.partyTrios, partyQuads: arm.partyQuads, wall: arm.wall },
    size4Shares: { ctl: ctlShares, arm: armShares } }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { perSeed: perSeed, wall: wall, judge: judge, summarizeLeg: summarizeLeg, size4Shares: size4Shares };
