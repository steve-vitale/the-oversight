// analyze-winplandepart-b.js — analyzer, arm sim-winplandepart-b.
// Joins each depart-path launch to its launch-time second-companion
// re-pick (caller frame 'winPlanDepart', same vid + day, sequential
// pairing per key) and classifies it picked+carried / picked+dropped /
// null / unjoined; sums partyTrios deltas and cross-checks them
// against the end-of-run winPlanStats.partyTrios and the counted trio
// departs. Scale-wall numbers are aggregated descriptively (the
// BRAINOFF leg is staged legacy mode, never a lever contrast).
// Usage:
//   node scripts/analyze-winplandepart-b.js --dir evidence/2026-11-18/perseed-winplandepart-b-brainoff
//   node scripts/analyze-winplandepart-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

function isW4Launch(r) { return r && r.result === 'launch' && ((r.targetWave | 0) >= 4); }

// Classify one launch's re-pick from the pick rows paired to it.
// pick: null row => 'null'; pick named + in party => 'carried';
// pick named + not in party => 'dropped'; no pick row => 'unjoined'.
function classifyRepick(launch, pickRow) {
  if (!pickRow) return 'unjoined';
  if (!pickRow.pick) return 'null';
  const party = launch.party || [];
  return party.indexOf(pickRow.pick) !== -1 ? 'carried' : 'dropped';
}

function analyzeSeed(f) {
  const departCalls = Array.isArray(f.departCalls) ? f.departCalls : [];
  const secondPicks = Array.isArray(f.secondPicks) ? f.secondPicks : [];
  const brainCalls = Array.isArray(f.brainCalls) ? f.brainCalls : [];
  const launches = departCalls.filter(function (r) { return r.result === 'launch'; });
  const w4Launches = launches.filter(isW4Launch);
  const holds = departCalls.filter(function (r) { return r.result === 'hold'; }).length;
  const normals = departCalls.filter(function (r) { return r.result === 'normal'; }).length;

  // Sequential pairing per (vid, day): the k-th w4 launch pairs with
  // the k-th winPlanDepart-caller pick for that key.
  const picksByKey = {};
  for (const p of secondPicks) {
    if (p.caller !== 'winPlanDepart') continue;
    const k = p.vid + '|' + p.day;
    (picksByKey[k] = picksByKey[k] || []).push(p);
  }
  const launchIdxByKey = {};
  const repicks = { carried: 0, dropped: 0, null: 0, unjoined: 0 };
  const launchRows = [];
  for (const l of w4Launches) {
    const k = l.vid + '|' + l.day;
    const idx = launchIdxByKey[k] || 0;
    launchIdxByKey[k] = idx + 1;
    const pickRow = (picksByKey[k] || [])[idx] || null;
    const cls = classifyRepick(l, pickRow);
    repicks[cls]++;
    launchRows.push({ day: l.day, vid: l.vid, stage: l.stageAfter || l.stageBefore || null,
      target: l.target || null, partySize: l.partySize || 1,
      party: (l.party || []).slice(), pick: pickRow ? pickRow.pick : null,
      repick: cls, triosDelta: (l.triosAfter != null && l.triosBefore != null) ? (l.triosAfter - l.triosBefore) : null });
  }
  let triosDeltaSum = 0, triosDeltaNull = 0;
  for (const l of w4Launches) {
    if (l.triosAfter != null && l.triosBefore != null) triosDeltaSum += (l.triosAfter - l.triosBefore);
    else triosDeltaNull++;
  }
  const trioDeparts = w4Launches.filter(function (l) { return (l.partySize | 0) >= 3; }).length;
  const endTrios = (f.winPlanStats && f.winPlanStats.partyTrios != null) ? f.winPlanStats.partyTrios : null;
  const starvation = (f.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;

  return {
    seed: f.seed, brainOff: !!f.brainOff,
    days: f.days, endReason: f.endReason || null, won: !!f.won,
    maxWave: f.maxWave || 1, standing: (f.standing != null ? f.standing : null),
    scaleRank: f.scaleRank || null,
    departCalls: departCalls.length, departLaunches: launches.length,
    w4Launches: w4Launches.length, holds: holds, normals: normals,
    trioDeparts: trioDeparts, repicks: repicks, launchRows: launchRows,
    triosDeltaSum: triosDeltaSum, triosDeltaNull: triosDeltaNull,
    endTrios: endTrios,
    triosMatch: (endTrios == null ? null : (endTrios === triosDeltaSum)),
    brainCalls: brainCalls.length,
    secondPicksTotal: secondPicks.length,
    secondPicksDepart: secondPicks.filter(function (p) { return p.caller === 'winPlanDepart'; }).length,
    secondPicksDawn: secondPicks.filter(function (p) { return p.caller === 'brain-dawn'; }).length,
    secondPicksOther: secondPicks.filter(function (p) { return p.caller === 'other' || p.caller === 'unknown'; }).length,
    deaths: (f.deaths || []).length, starvation: starvation,
    instrumentErrors: (f.instrumentErrors || []).length,
  };
}

// Frozen-corpus adapter: triodrought corpora carry v4departs (with a
// `source` field) instead of departCalls/secondPicks. Reproduce the
// frozen numbers: launches by source + end partyTrios.
function analyzeTriodroughtFile(f) {
  const rows = Array.isArray(f.v4departs) ? f.v4departs : [];
  const launches = rows.filter(function (r) { return r.result === 'launch' && ((r.targetWave | 0) >= 4); });
  return {
    seed: f.seed,
    launches: launches.length,
    departLaunches: launches.filter(function (r) { return r.source === 'winPlanDepart'; }).length,
    brainLaunches: launches.filter(function (r) { return r.source === 'brain'; }).length,
    endTrios: (f.winPlanStats && f.winPlanStats.partyTrios != null) ? f.winPlanStats.partyTrios : null,
  };
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (n) { return /^winplandepart-b-s\d+-.*\.json$/.test(n); }).sort();
  if (!files.length) throw new Error('no winplandepart corpus files in ' + dir);
  const seeds = files.map(function (n) { return analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'))); });
  const sum = function (k) { return seeds.reduce(function (a, s) { return a + (s[k] || 0); }, 0); };
  const repicks = { carried: 0, dropped: 0, null: 0, unjoined: 0 };
  for (const s of seeds) for (const k of Object.keys(repicks)) repicks[k] += s.repicks[k];
  const days = seeds.map(function (s) { return s.days; });
  const standings = seeds.map(function (s) { return s.standing; }).filter(function (x) { return x != null; });
  const scaleRanks = {};
  for (const s of seeds) scaleRanks[s.scaleRank || 'null'] = (scaleRanks[s.scaleRank || 'null'] || 0) + 1;
  return {
    dir: dir, seeds: seeds.length,
    departCalls: sum('departCalls'), departLaunches: sum('departLaunches'),
    w4Launches: sum('w4Launches'), holds: sum('holds'), normals: sum('normals'),
    trioDeparts: sum('trioDeparts'), repicks: repicks,
    triosDeltaSum: sum('triosDeltaSum'), triosDeltaNull: sum('triosDeltaNull'),
    endTriosTotal: seeds.reduce(function (a, s) { return a + (s.endTrios || 0); }, 0),
    triosMatchAll: seeds.every(function (s) { return s.triosMatch !== false; }),
    brainCalls: sum('brainCalls'),
    secondPicksTotal: sum('secondPicksTotal'),
    secondPicksDepart: sum('secondPicksDepart'),
    secondPicksDawn: sum('secondPicksDawn'),
    secondPicksOther: sum('secondPicksOther'),
    wins: seeds.filter(function (s) { return s.won; }).length,
    maxWaveDist: seeds.reduce(function (o, s) { o[s.maxWave] = (o[s.maxWave] || 0) + 1; return o; }, {}),
    scaleRanks: scaleRanks,
    medianDays: median(days),
    medianStanding: median(standings),
    deaths: sum('deaths'), starvation: sum('starvation'),
    instrumentErrors: sum('instrumentErrors'),
    perSeed: seeds,
  };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; }
    else { failed++; console.log('SELFTEST FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  // (a) Synthetic corpus: 3 w4 launches — carried, dropped, null —
  // plus 1 non-w4 launch, 1 hold, trios deltas 1/0/0, brain 0.
  const synth = {
    seed: 999999, brainOff: true, days: 150, endReason: 'horizon', won: false,
    maxWave: 5, standing: 300, scaleRank: 'regional',
    winPlanStats: { partyTrios: 1, partyDepartures: 4 },
    deaths: [], instrumentErrors: [],
    departCalls: [
      { day: 40, vid: 'v1', result: 'launch', stageBefore: 'party', stageAfter: 'hunt', target: 'reunion', targetWave: 4, party: ['v2', 'v3'], partySize: 3, triosBefore: 0, triosAfter: 1 },
      { day: 60, vid: 'v1', result: 'launch', stageBefore: 'hunt', stageAfter: 'hunt', target: 'reunion', targetWave: 4, party: ['v2'], partySize: 2, triosBefore: 1, triosAfter: 1 },
      { day: 80, vid: 'v4', result: 'launch', stageBefore: 'party', stageAfter: 'hunt', target: 'strike', targetWave: 4, party: ['v5'], partySize: 2, triosBefore: 1, triosAfter: 1 },
      { day: 90, vid: 'v1', result: 'launch', stageBefore: 'hunt', stageAfter: 'hunt', target: 'herald', targetWave: 3, party: ['v2'], partySize: 2, triosBefore: 1, triosAfter: 1 },
      { day: 20, vid: 'v1', result: 'hold', stageBefore: 'party', stageAfter: 'party', target: 'reunion', targetWave: 4, party: [], partySize: 1, triosBefore: 0, triosAfter: 0 },
    ],
    secondPicks: [
      { day: 40, vid: 'v1', firstCid: 'v2', pick: 'v3', caller: 'winPlanDepart', callerFrame: 'at Game.winPlanDepart (win-plan.js)' },
      { day: 60, vid: 'v1', firstCid: 'v2', pick: 'v3', caller: 'winPlanDepart', callerFrame: 'at Game.winPlanDepart (win-plan.js)' },
      { day: 80, vid: 'v4', firstCid: 'v5', pick: null, caller: 'winPlanDepart', callerFrame: 'at Game.winPlanDepart (win-plan.js)' },
      { day: 41, vid: 'v1', firstCid: 'v2', pick: 'v3', caller: 'brain-dawn', callerFrame: 'at winPlanCands (villager-brain.js)' },
    ],
    brainCalls: [],
  };
  const s = analyzeSeed(synth);
  check('synth: 4 depart launches, 3 wave-4', s.departLaunches === 4 && s.w4Launches === 3, JSON.stringify({ dl: s.departLaunches, w4: s.w4Launches }));
  check('synth: repicks carried 1 / dropped 1 / null 1 / unjoined 0',
    s.repicks.carried === 1 && s.repicks.dropped === 1 && s.repicks.null === 1 && s.repicks.unjoined === 0,
    JSON.stringify(s.repicks));
  check('synth: trioDeparts 1, triosDeltaSum 1, endTrios 1, match true',
    s.trioDeparts === 1 && s.triosDeltaSum === 1 && s.endTrios === 1 && s.triosMatch === true,
    JSON.stringify({ td: s.trioDeparts, sum: s.triosDeltaSum, end: s.endTrios, m: s.triosMatch }));
  check('synth: brainCalls 0, dawn picks excluded from repicks',
    s.brainCalls === 0 && s.secondPicksDawn === 1 && s.secondPicksDepart === 3,
    JSON.stringify({ bc: s.brainCalls, dawn: s.secondPicksDawn, dep: s.secondPicksDepart }));
  check('synth: hold counted, instrument 0', s.holds === 1 && s.instrumentErrors === 0, JSON.stringify({ h: s.holds }));
  // (b) Unjoined launch: a w4 launch with no depart-caller pick row.
  const synth2 = JSON.parse(JSON.stringify(synth));
  synth2.secondPicks = synth2.secondPicks.filter(function (p) { return p.caller !== 'winPlanDepart'; });
  const s2 = analyzeSeed(synth2);
  check('synth2: 3 w4 launches all unjoined when no depart picks',
    s2.repicks.unjoined === 3, JSON.stringify(s2.repicks));
  // (c) Frozen-corpus dry run: reproduce the triodrought numbers —
  // arm 25 launches / 0 depart-path / partyTrios 0; ctl 18 / 0 / 0.
  function frozenTotals(mode) {
    const dir = path.join(REPO, 'evidence', '2026-11-18', 'perseed-triodrought-b-' + mode);
    const files = fs.readdirSync(dir).filter(function (n) { return /\.json$/.test(n); }).sort();
    let launches = 0, depart = 0, trios = 0;
    for (const n of files) {
      const r = analyzeTriodroughtFile(JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')));
      launches += r.launches; depart += r.departLaunches; trios += (r.endTrios || 0);
    }
    return { files: files.length, launches: launches, depart: depart, trios: trios };
  }
  const arm = frozenTotals('arm');
  const ctl = frozenTotals('ctl');
  check('frozen arm: 8 files, 25 launches, 0 depart-path, partyTrios 0',
    arm.files === 8 && arm.launches === 25 && arm.depart === 0 && arm.trios === 0, JSON.stringify(arm));
  check('frozen ctl: 8 files, 18 launches, 0 depart-path, partyTrios 0',
    ctl.files === 8 && ctl.launches === 18 && ctl.depart === 0 && ctl.trios === 0, JSON.stringify(ctl));
  console.log('SELFTEST ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  const di = args.indexOf('--dir');
  if (di === -1 || !args[di + 1]) { console.error('Usage: node scripts/analyze-winplandepart-b.js --dir <corpus-dir> | --selftest'); process.exit(2); }
  const out = analyzeDir(path.resolve(args[di + 1]));
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, analyzeTriodroughtFile: analyzeTriodroughtFile, classifyRepick: classifyRepick, selftest: selftest };
