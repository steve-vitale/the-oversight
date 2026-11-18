// analyze-foodgate-a.js — analyzer + judge, arm sim-foodgate-instr-a.
// CAPABILITY: carrier food-gate instrumentation (finding #2557-A).
// Reads the foodgate corpora (ctl + arm legs) and computes the frozen
// prereg's primary metric: the bite rate of each food gate on the
// engaged held population, plus the master-alone real-Rage rates and
// wall metrics. Standalone on raw per-seed JSONs (no legStats
// dependency) — the populations are defined directly from the
// encounter rows, so the counts are auditable from the corpus alone.
//   Arm leg (instrument + carrier staged, FIELDCAPDMG=1):
//     engaged held = rows with carrierRageHeld === true AND
//       outcome !== 'evade' (wave 4+, N = denominator).
//     tier bite    = foodgateTierBlocked != null            -> n/N.
//     hunger bite  = foodgatePayBlockedRage === true among the
//       tier-unblocked engaged held fights                -> n/(N-n_tier).
//       (Sequential gates: the tier gate runs first; a tier-blocked
//       fight never reaches the pay.)
//     fires        = carrierRage === true                  -> n/N.
//     never-fired decomposition (must sum to N - n_fires):
//       tier / hunger / trick-displaced (trickLog non-empty) / other.
//   Ctl leg (instrument on master, carrier off) — the master-alone
//   secondary population: engaged rows with holdsRage === true AND
//   gpActive === true; rageFired replaces carrierRage. A ctl row with
//   carrierRage === true is an instrument failure (the carrier cannot
//   fire with the flag off).
//   Completeness: every engaged row on both legs must carry non-null
//   foodTier and hungerStart — a null on an engaged row is an
//   instrument failure, not a zero.
//   Judge (frozen prereg GO): instrument errors 0 both legs;
//   completeness 100% both legs; N >= 4 engaged held fights on the
//   arm leg; ctl carrier fires 0; cost guardrails (arm community loss
//   <= 3, starvation <= 4, median survival >= 120d — the 1715Z arm
//   leg's 2/8, 2, 150d with tolerance). N < 4 with everything else
//   green is THIN-POOL (instrument landed; measurement inconclusive).
//   A cost-guardrail miss is NO-GO / COST: the instrument must not
//   move trajectories, so a move is investigated as an instrument
//   bug, not a lever effect.
// Usage:
//   node scripts/analyze-foodgate-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]
//   node scripts/analyze-foodgate-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');

function isEngaged(r) { return r && r.outcome != null && r.outcome !== 'evade'; }
function rate(n, d) { return d > 0 ? (n + '/' + d + ' (' + (n / d).toFixed(3) + ')') : (n + '/0 (n/a)'); }

function loadCorpus(dir) {
  const out = { dir: dir, files: [], perSeed: [], rows: [], errors: 0, missing: [] };
  let files = [];
  try { files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : []; } catch (e) { files = []; }
  if (!files.length) out.missing.push('no .json files in ' + dir);
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { out.missing.push('unparsable ' + f); continue; }
    out.files.push(f);
    out.perSeed.push(d);
    out.errors += ((d.instrumentErrors || []).length);
    for (const r of (d.v4encounters || [])) out.rows.push(Object.assign({ _seed: d.seed, _file: f }, r));
  }
  return out;
}

function wallStats(perSeed) {
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const w = { n: perSeed.length, won: 0, national: 0, table: null, wave4: 0, wave5: 0,
    medianDays: null, communityLost: 0, starvation: 0, deaths: 0 };
  const days = [];
  for (const d of perSeed) {
    if (d.won) w.won++;
    if ((RANK[d.scaleRank] || 0) >= 2) w.national++;
    if ((d.maxWave || 0) >= 4) w.wave4++;
    if ((d.maxWave || 0) >= 5) w.wave5++;
    if (typeof d.gameDays === 'number') days.push(d.gameDays);
    if (['village-lost', 'village-dead', 'pop-zero'].indexOf(d.endReason) !== -1) w.communityLost++;
    for (const x of (d.deaths || [])) {
      w.deaths++;
      if (String((x.cause || '') + ' ' + (x.kind || '')).toLowerCase().indexOf('starv') !== -1) w.starvation++;
    }
  }
  if (days.length) {
    days.sort(function (a, b) { return a - b; });
    w.medianDays = days.length % 2 ? days[(days.length - 1) / 2] : (days[days.length / 2 - 1] + days[days.length / 2]) / 2;
  }
  return w;
}

function armPopulation(rows) {
  const held = rows.filter(function (r) { return r.carrierRageHeld === true; });
  const eng = held.filter(isEngaged);
  const tierBitten = eng.filter(function (r) { return r.foodgateTierBlocked != null; });
  const tierUnblocked = eng.filter(function (r) { return r.foodgateTierBlocked == null; });
  const hungerBitten = tierUnblocked.filter(function (r) { return r.foodgatePayBlockedRage === true; });
  const fires = eng.filter(function (r) { return r.carrierRage === true; });
  const never = eng.filter(function (r) { return r.carrierRage !== true; });
  const buckets = { tier: 0, hunger: 0, trick: 0, other: 0 };
  const otherRows = [];
  for (const r of never) {
    if (r.foodgateTierBlocked != null) buckets.tier++;
    else if (r.foodgatePayBlockedRage === true) buckets.hunger++;
    else if (Array.isArray(r.trickLog) && r.trickLog.length > 0) buckets.trick++;
    else {
      buckets.other++;
      if (otherRows.length < 20) otherRows.push({ seed: r._seed, day: r.day, vid: r.vid, mid: r.mid, outcome: r.outcome, tier: r.foodTier, hungerStart: r.hungerStart, trickLog: r.trickLog || [] });
    }
  }
  const gaps = eng.filter(function (r) { return r.foodTier == null || r.hungerStart == null; });
  return { heldN: held.length, N: eng.length, tierN: tierBitten.length, tierUnblockedN: tierUnblocked.length,
    hungerN: hungerBitten.length, firesN: fires.length, neverN: never.length, buckets: buckets,
    otherRows: otherRows, gapsN: gaps.length,
    rows: eng.map(function (r) { return { seed: r._seed, day: r.day, vid: r.vid, mid: r.mid, outcome: r.outcome, tier: r.foodTier, hungerStart: r.hungerStart, tierBlocked: r.foodgateTierBlocked, tierBlockedRound: r.foodgateTierBlockedRound, payBlockedRage: !!r.foodgatePayBlockedRage, payBlockedFirst: r.foodgatePayBlockedFirst || null, fired: !!r.carrierRage, trickLog: r.trickLog || [] }; }) };
}

function ctlPopulation(rows) {
  const eng = rows.filter(isEngaged);
  const real = eng.filter(function (r) { return r.holdsRage === true && r.gpActive === true; });
  const tierBitten = real.filter(function (r) { return r.foodgateTierBlocked != null; });
  const tierUnblocked = real.filter(function (r) { return r.foodgateTierBlocked == null; });
  const hungerBitten = tierUnblocked.filter(function (r) { return r.foodgatePayBlockedRage === true; });
  const fires = real.filter(function (r) { return r.rageFired === true; });
  const carrierFires = eng.filter(function (r) { return r.carrierRage === true; });
  const gaps = eng.filter(function (r) { return r.foodTier == null || r.hungerStart == null; });
  return { engagedN: eng.length, N: real.length, tierN: tierBitten.length, tierUnblockedN: tierUnblocked.length,
    hungerN: hungerBitten.length, firesN: fires.length, carrierFiresN: carrierFires.length, gapsN: gaps.length,
    rows: real.map(function (r) { return { seed: r._seed, day: r.day, vid: r.vid, mid: r.mid, outcome: r.outcome, tier: r.foodTier, hungerStart: r.hungerStart, tierBlocked: r.foodgateTierBlocked, payBlockedRage: !!r.foodgatePayBlockedRage, fired: !!r.rageFired }; }) };
}

function analyze(ctlDir, armDir) {
  const ctl = loadCorpus(ctlDir);
  const arm = loadCorpus(armDir);
  const ctlWall = wallStats(ctl.perSeed);
  const armWall = wallStats(arm.perSeed);
  const ap = armPopulation(arm.rows);
  const cp = ctlPopulation(ctl.rows);
  const bars = [];
  const errPass = ctl.errors === 0 && arm.errors === 0;
  bars.push({ id: 'instrument-errors', pass: errPass,
    detail: 'instrument errors ctl ' + ctl.errors + ' / arm ' + arm.errors + ' (bar 0)' });
  const compPass = cp.gapsN === 0 && ap.gapsN === 0;
  bars.push({ id: 'field-completeness', pass: compPass,
    detail: 'engaged rows with null foodTier/hungerStart: ctl ' + cp.gapsN + ' / arm ' + ap.gapsN + ' (bar 0)' });
  const poolOk = ap.N >= 4;
  bars.push({ id: 'pool-floor-engaged-held', pass: poolOk,
    detail: 'engaged held fights (arm): ' + ap.N + ' (floor 4; 1715Z had 8)' });
  const ctlFirePass = cp.carrierFiresN === 0;
  bars.push({ id: 'carrier-fires-ctl-zero', pass: ctlFirePass,
    detail: 'carrier-rage rows on the control leg: ' + cp.carrierFiresN + ' (bar 0; any ctl fire is an instrument failure)' });
  const costPass = armWall.communityLost <= 3 && armWall.starvation <= 4 && (armWall.medianDays == null || armWall.medianDays >= 120);
  bars.push({ id: 'cost-guardrails', pass: costPass,
    detail: 'arm community loss ' + armWall.communityLost + '/8 (bar <=3), starvation ' + armWall.starvation + ' (bar <=4), median ' + armWall.medianDays + 'd (bar >=120d) — 1715Z arm leg: 2/8, 2, 150d' });
  let verdict = 'NO-GO', kind = '';
  if (!errPass || !compPass || !ctlFirePass) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (!costPass) { verdict = 'NO-GO'; kind = 'COST'; }
  else if (!poolOk) { verdict = 'NO-GO'; kind = 'THIN-POOL'; }
  else { verdict = 'GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars,
    arm: { N: ap.N, heldN: ap.heldN, tier: rate(ap.tierN, ap.N), hunger: rate(ap.hungerN, ap.tierUnblockedN),
      fires: rate(ap.firesN, ap.N), neverN: ap.neverN, buckets: ap.buckets, otherRows: ap.otherRows,
      gapsN: ap.gapsN, errors: arm.errors, rows: ap.rows, wall: armWall },
    ctl: { N: cp.N, engagedN: cp.engagedN, tier: rate(cp.tierN, cp.N), hunger: rate(cp.hungerN, cp.tierUnblockedN),
      fires: rate(cp.firesN, cp.N), carrierFiresN: cp.carrierFiresN, gapsN: cp.gapsN, errors: ctl.errors,
      rows: cp.rows, wall: ctlWall },
    corpus: { ctlFiles: ctl.files, armFiles: arm.files, ctlMissing: ctl.missing, armMissing: arm.missing } };
}

function printSummary(res) {
  console.log('verdict: ' + res.verdict + (res.kind ? ' ' + res.kind : ''));
  for (const b of res.bars) console.log('  [' + (b.pass ? 'PASS' : 'FAIL') + '] ' + b.id + ' — ' + b.detail);
  console.log('ARM (instrument + carrier staged): engaged held N=' + res.arm.N + ' (held ' + res.arm.heldN + ')');
  console.log('  tier bite:   ' + res.arm.tier);
  console.log('  hunger bite: ' + res.arm.hunger + ' (among tier-unblocked)');
  console.log('  fires:       ' + res.arm.fires);
  console.log('  never-fired ' + res.arm.neverN + ': tier ' + res.arm.buckets.tier + ' / hunger ' + res.arm.buckets.hunger + ' / trick ' + res.arm.buckets.trick + ' / other ' + res.arm.buckets.other);
  if (res.arm.otherRows.length) console.log('  other rows: ' + JSON.stringify(res.arm.otherRows));
  console.log('CTL (instrument on master): real-Rage engaged N=' + res.ctl.N + ' (engaged ' + res.ctl.engagedN + ')');
  console.log('  tier bite:   ' + res.ctl.tier);
  console.log('  hunger bite: ' + res.ctl.hunger + ' (among tier-unblocked)');
  console.log('  rage fires:  ' + res.ctl.fires);
  console.log('WALL arm: won ' + res.arm.wall.won + '/' + res.arm.wall.n + ' national ' + res.arm.wall.national + '/' + res.arm.wall.n + ' wave4 ' + res.arm.wall.wave4 + ' wave5 ' + res.arm.wall.wave5 + ' median ' + res.arm.wall.medianDays + 'd communityLost ' + res.arm.wall.communityLost + ' starvation ' + res.arm.wall.starvation);
  console.log('WALL ctl: won ' + res.ctl.wall.won + '/' + res.ctl.wall.n + ' national ' + res.ctl.wall.national + '/' + res.ctl.wall.n + ' wave4 ' + res.ctl.wall.wave4 + ' wave5 ' + res.ctl.wall.wave5 + ' median ' + res.ctl.wall.medianDays + 'd communityLost ' + res.ctl.wall.communityLost + ' starvation ' + res.ctl.wall.starvation);
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'foodgate-selftest-'));
  function writeCorpus(dir, files) {
    fs.mkdirSync(dir, { recursive: true });
    for (const f of files) fs.writeFileSync(path.join(dir, f.name), JSON.stringify(f.data));
  }
  function seedFile(seed, rows, extra) {
    const d = Object.assign({ seed: seed, won: false, scaleRank: 'village', gameDays: 150,
      maxWave: 4, endReason: 'survived', deaths: [], instrumentErrors: [], v4encounters: rows }, extra || {});
    return { name: 'foodgate-a-s' + seed + '-foodgate-a-ctl.json', data: d };
  }
  function row(o) {
    return Object.assign({ day: 90, vid: 'v1', mid: 'eulogy', wave: 4, outcome: 'vFlee',
      foodTier: 'secure', hungerStart: 10, holdsRage: false, gpActive: true,
      carrierRageHeld: false, carrierRage: false, foodgateTierBlocked: null,
      foodgateTierBlockedRound: null, foodgateTierBlockedCount: 0,
      foodgatePayBlocked: 0, foodgatePayBlockedRage: false, foodgatePayBlockedFirst: null,
      rageFired: false, trickLog: [] }, o);
  }
  // DIRTY pair: every bucket + a completeness gap + a ctl carrier fire.
  const armRows = [
    row({ day: 91, vid: 'a', mid: 'eulogy', outcome: 'vFlee', carrierRageHeld: true, foodgateTierBlocked: 'tight', foodgateTierBlockedRound: 1, foodgateTierBlockedCount: 3 }),
    row({ day: 92, vid: 'b', mid: 'audit', outcome: 'vKill', carrierRageHeld: true, foodgatePayBlocked: 2, foodgatePayBlockedRage: true, foodgatePayBlockedFirst: { id: 'rage', actId: 'unleash_rage', kcal: 60, hunger: 79 } }),
    row({ day: 93, vid: 'c', mid: 'reunion', outcome: 'mFlee', carrierRageHeld: true, carrierRage: true, rageFired: true }),
    row({ day: 94, vid: 'd', mid: 'eulogy', outcome: 'vFlee', carrierRageHeld: true, trickLog: ['contradict', 'contradict'] }),
    row({ day: 95, vid: 'e', mid: 'algorithm', outcome: 'vDie', carrierRageHeld: true }),
    row({ day: 96, vid: 'f', mid: 'eater', outcome: 'evade', carrierRageHeld: true }),
    row({ day: 97, vid: 'g', mid: 'strike', outcome: 'vFlee', carrierRageHeld: true, foodTier: null }),
    row({ day: 98, vid: 'h', mid: 'influencer', outcome: 'vFlee' }),
  ];
  const ctlRows = [
    row({ day: 91, vid: 'a', mid: 'eulogy', outcome: 'vKill', holdsRage: true, rageFired: true }),
    row({ day: 92, vid: 'b', mid: 'audit', outcome: 'vFlee', holdsRage: true, foodgateTierBlocked: 'starving', foodgateTierBlockedRound: 1 }),
    row({ day: 93, vid: 'c', mid: 'reunion', outcome: 'vFlee', holdsRage: true, foodgatePayBlockedRage: true, foodgatePayBlockedFirst: { id: 'rage', actId: 'unleash_rage', kcal: 60, hunger: 79 } }),
    row({ day: 94, vid: 'd', mid: 'eulogy', outcome: 'mFlee', holdsRage: false }),
    row({ day: 95, vid: 'e', mid: 'algorithm', outcome: 'vFlee', holdsRage: true, carrierRage: true }),
    row({ day: 96, vid: 'f', mid: 'eater', outcome: 'vDie', holdsRage: true, foodTier: null }),
  ];
  const dirtyCtl = path.join(tmp, 'ctl'), dirtyArm = path.join(tmp, 'arm');
  writeCorpus(dirtyCtl, [seedFile(104601, ctlRows)]);
  writeCorpus(dirtyArm, [seedFile(104601, armRows)]);
  const dirty = analyze(dirtyCtl, dirtyArm);
  check('arm: engaged held N=6 (evade + unheld excluded)', dirty.arm.N === 6, 'N=' + dirty.arm.N);
  check('arm: tier bite 1/6', dirty.arm.tier === '1/6 (0.167)', dirty.arm.tier);
  check('arm: hunger bite 1/5 among tier-unblocked', dirty.arm.hunger === '1/5 (0.200)', dirty.arm.hunger);
  check('arm: fires 1/6', dirty.arm.fires === '1/6 (0.167)', dirty.arm.fires);
  check('arm: never-fired buckets tier 1 / hunger 1 / trick 1 / other 2', dirty.arm.buckets.tier === 1 && dirty.arm.buckets.hunger === 1 && dirty.arm.buckets.trick === 1 && dirty.arm.buckets.other === 2, JSON.stringify(dirty.arm.buckets));
  check('arm: completeness gap counted (null foodTier)', dirty.arm.gapsN === 1, 'gaps=' + dirty.arm.gapsN);
  check('ctl: real-Rage engaged N=5', dirty.ctl.N === 5, 'N=' + dirty.ctl.N);
  check('ctl: tier bite 1/5', dirty.ctl.tier === '1/5 (0.200)', dirty.ctl.tier);
  check('ctl: hunger bite 1/4', dirty.ctl.hunger === '1/4 (0.250)', dirty.ctl.hunger);
  check('ctl: rage fires 1/5', dirty.ctl.fires === '1/5 (0.200)', dirty.ctl.fires);
  check('ctl: carrier fire on ctl counted as instrument failure', dirty.ctl.carrierFiresN === 1, 'carrierFires=' + dirty.ctl.carrierFiresN);
  check('ctl: completeness gap counted', dirty.ctl.gapsN === 1, 'gaps=' + dirty.ctl.gapsN);
  check('dirty pair verdict is NO-GO INSTRUMENT', dirty.verdict === 'NO-GO' && dirty.kind === 'INSTRUMENT', dirty.verdict + ' ' + dirty.kind);
  // CLEAN pair: drop the gap rows + the ctl carrier fire -> GO.
  const cleanArmRows = armRows.filter(function (r) { return r.foodTier != null; });
  const cleanCtlRows = ctlRows.filter(function (r) { return r.foodTier != null && r.carrierRage !== true; });
  const cleanCtl = path.join(tmp, 'ctl-clean'), cleanArm = path.join(tmp, 'arm-clean');
  writeCorpus(cleanCtl, [seedFile(104601, cleanCtlRows)]);
  writeCorpus(cleanArm, [seedFile(104601, cleanArmRows)]);
  const clean = analyze(cleanCtl, cleanArm);
  check('clean pair: arm N=5, gaps 0', clean.arm.N === 5 && clean.arm.gapsN === 0, 'N=' + clean.arm.N + ' gaps=' + clean.arm.gapsN);
  check('clean pair verdict is GO', clean.verdict === 'GO', clean.verdict + ' ' + clean.kind);
  // THIN-POOL pair: 3 engaged held, everything else clean.
  const thinArmRows = cleanArmRows.slice(0, 3);
  const thinArm = path.join(tmp, 'arm-thin');
  writeCorpus(thinArm, [seedFile(104601, thinArmRows)]);
  const thin = analyze(cleanCtl, thinArm);
  check('thin pair verdict is NO-GO THIN-POOL', thin.verdict === 'NO-GO' && thin.kind === 'THIN-POOL', thin.verdict + ' ' + thin.kind);
  // Wall stats: starvation deaths counted by cause, median days.
  const wall = analyze(cleanCtl, cleanArm);
  check('wall: starvation counted from death causes', (function () {
    const wdir = path.join(tmp, 'wall');
    writeCorpus(wdir, [seedFile(104602, [], { gameDays: 100, deaths: [{ day: 10, cause: 'starvation' }, { day: 20, cause: 'monster' }], endReason: 'village-lost', scaleRank: 'regional', maxWave: 5 })]);
    const w = analyze(wdir, cleanArm);
    return w.ctl.wall.starvation === 1 && w.ctl.wall.communityLost === 1 && w.ctl.wall.wave5 === 1 && w.ctl.wall.medianDays === 100;
  })());
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

function main() {
  if (process.argv.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  function argvVal(flag, dflt) {
    return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
  }
  const ctlDir = argvVal('--ctl', null);
  const armDir = argvVal('--arm', null);
  if (!ctlDir || !armDir) { console.error('usage: node scripts/analyze-foodgate-a.js --ctl DIR --arm DIR [--out FILE] [--no-judge]'); process.exit(2); }
  const res = analyze(ctlDir, armDir);
  if (process.argv.indexOf('--no-judge') === -1) printSummary(res);
  else console.log(JSON.stringify(res, null, 2));
  const out = argvVal('--out', null);
  if (out) fs.writeFileSync(out, JSON.stringify(res, null, 2) + '\n');
  if (process.argv.indexOf('--no-judge') === -1) console.log('verdict: ' + res.verdict + (res.kind ? ' ' + res.kind : ''));
}

if (require.main === module) main();
module.exports = { analyze: analyze, loadCorpus: loadCorpus, armPopulation: armPopulation, ctlPopulation: ctlPopulation, wallStats: wallStats, rate: rate };
