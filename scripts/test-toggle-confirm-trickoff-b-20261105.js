// test-toggle-confirm-trickoff-b-20261105.js — proof script for the trickoff-confirm-b arm.
// No game code is changed by this arm, so the proofs are:
//  (1) integrity: every expected per-seed JSON exists, parses, carries
//      gameDays + census + fightCensus, and its transcript is non-empty.
//  (2) flips: per-seed class flip vs V-full for a variant prefix, with
//      sat-day / kill / fight deltas (the screen-bar inputs).
//  (3) screen: judges the prereg screen bar for one variant prefix vs
//      V-full in the same dir — S1 (flip >=1 seed) OR S2 (|sat-day d| >= 9)
//      OR S3 (wave-4 census kill swing >=2 or fight swing >=3). Prints
//      GO-CANDIDATE or DIAG-NO-CANDIDATE. Exit 0 either way: the verdict
//      is a finding, not a failure.
//  (5) confirm: judges the CONFIRM bar (prereg, binding) for one variant
//      prefix vs V-full — signal = S1 (class flip) OR S3 (kill/fight
//      swing) on a seed; GO iff the signal fires on >=2 of 12 seeds,
//      NO-GO iff <=1. S2 is reported, never deciding; net wins never
//      judge. Prints CONFIRM GO or CONFIRM NO-GO. Exit 0 either way.
//  (4) repeat: Stage 0(b) determinism gate — two passes' per-seed JSONs
//      must agree on satDay + class on every seed (the binding gate).
//      Byte-identity of JSON + transcript is reported; a byte difference
//      with equal satDay/class is flagged but does not fail the gate.
// Usage:
//   node scripts/test-toggle-confirm-trickoff-b-20261105.js integrity <dir> <prefix> [seed,seed,...]
//   node scripts/test-toggle-confirm-trickoff-b-20261105.js flips <dir> vfull- <variant-prefix> [seed,seed,...]
//   node scripts/test-toggle-confirm-trickoff-b-20261105.js screen <dir> <variant-prefix> [seed,seed,...]
//   node scripts/test-toggle-confirm-trickoff-b-20261105.js confirm <dir> <variant-prefix> [seed,seed,...]
//   node scripts/test-toggle-confirm-trickoff-b-20261105.js repeat <dir> vfull- vfull2- [seed,seed,...]
//   (default seeds 99761-99772; repeat compares <prefixA><seed> vs <prefixB><seed>
//    in the same dir, so pass 2 lives beside pass 1 as vfull2-.)
const fs = require('fs');
const path = require('path');
const mode = process.argv[2];
function fail(m) { console.error('FAIL: ' + m); process.exit(1); }
function seedsFrom(argvIdx) {
  return process.argv[argvIdx]
    ? process.argv[argvIdx].split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite)
    : [99761, 99762, 99763, 99764, 99765, 99766, 99767, 99768, 99769, 99770, 99771, 99772];
}
function readSeed(dir, pfx, seed) {
  const fp = path.join(dir, pfx + seed + '.json');
  if (!fs.existsSync(fp)) return { seed, missing: true };
  let d;
  try { d = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { return { seed, badJson: true }; }
  const fights = ((d.fightCensus && d.fightCensus.fights) || []);
  const uw = (d.veterans && d.veterans.unlockedWave) || 0;
  const w5sat = (d.satWaves && d.satWaves.w5) || 0;
  let cls;
  if (d.satDay != null && d.satSeatKind) cls = 'won-' + d.satSeatKind;
  else if (d.endReason === 'village-lost') cls = 'scattered';
  else if (d.satDay != null) cls = 'sat-unknown';
  else if (d.endReason === 'survived') cls = 'survived';
  else cls = 'other';
  const tx = path.join(dir, pfx + seed + '-transcript.txt');
  const txOk = fs.existsSync(tx) && fs.statSync(tx).size > 0;
  return { seed, class: cls, satDay: d.satDay != null ? d.satDay : null,
    satSeatKind: d.satSeatKind || null, wave5: uw >= 5 || w5sat > 0, uw,
    w5sat, gameDays: d.gameDays, alive: d.census ? d.census.alive : null,
    endReason: d.endReason || null, scale: d.census ? d.census.scale : null,
    fights: fights.length, kills: fights.filter(f => f.outcome === 'vKill').length,
    vDie: fights.filter(f => f.outcome === 'vDie').length, txOk,
    hasCensus: !!d.census, hasFightCensus: !!d.fightCensus,
    jsonBytes: fs.readFileSync(fp, 'utf8'), txBytes: txOk ? fs.readFileSync(tx, 'utf8') : null };
}
if (!mode) fail('usage: test-toggle-confirm-trickoff-b-20261105.js <integrity|flips|screen|repeat|confirm> ...');
if (mode === 'integrity') {
  const dir = process.argv[3], pfx = process.argv[4];
  if (!dir || !pfx) fail('usage: integrity <dir> <prefix> [seeds]');
  const SEEDS = seedsFrom(5);
  let ok = 0;
  for (const seed of SEEDS) {
    const r = readSeed(dir, pfx, seed);
    if (r.missing) fail('missing ' + pfx + seed + '.json');
    if (r.badJson) fail('bad JSON ' + pfx + seed);
    if (!r.hasCensus || !r.hasFightCensus || !r.txOk || typeof r.gameDays !== 'number')
      fail('incomplete corpus ' + pfx + seed + ': ' + JSON.stringify(r));
    console.log(JSON.stringify({ seed: r.seed, class: r.class, satDay: r.satDay, wave5: r.wave5, uw: r.uw, gameDays: r.gameDays, alive: r.alive, fights: r.fights, kills: r.kills, vDie: r.vDie, endReason: r.endReason, scale: r.scale }));
    ok++;
  }
  console.log('INTEGRITY ' + ok + '/' + SEEDS.length + ' complete for prefix ' + pfx);
} else if (mode === 'flips' || mode === 'screen' || mode === 'confirm') {
  const dir = process.argv[3];
  const basePfx = mode === 'flips' ? process.argv[4] : 'vfull-';
  const varPfx = mode === 'flips' ? process.argv[5] : process.argv[4];
  if (!dir || !varPfx) fail('usage: flips <dir> <base-prefix> <variant-prefix> [seeds] | screen|confirm <dir> <variant-prefix> [seeds]');
  const SEEDS = seedsFrom(mode === 'flips' ? 6 : 5);
  let flips = 0, s2 = 0, s3 = 0, compared = 0;
  for (const seed of SEEDS) {
    const a = readSeed(dir, basePfx, seed), b = readSeed(dir, varPfx, seed);
    if (a.missing || b.missing) { console.log(JSON.stringify({ seed, status: 'missing', base: a.missing ? 'missing' : a.class, variant: b.missing ? 'missing' : b.class })); continue; }
    compared++;
    const flipped = a.class !== b.class;
    const satDelta = (a.satDay != null && b.satDay != null) ? b.satDay - a.satDay : null;
    const killDelta = b.kills - a.kills;
    const fightDelta = b.fights - a.fights;
    const hitS2 = satDelta != null && Math.abs(satDelta) >= 9;
    const hitS3 = Math.abs(killDelta) >= 2 || Math.abs(fightDelta) >= 3;
    if (flipped) flips++;
    if (hitS2) s2++;
    if (hitS3) s3++;
    console.log(JSON.stringify({ seed, base: a.class, baseSat: a.satDay, variant: b.class, variantSat: b.satDay, flipped, satDelta, killsBase: a.kills, killsVar: b.kills, killDelta, fightsBase: a.fights, fightsVar: b.fights, fightDelta, S1: flipped, S2: hitS2, S3: hitS3, wave5base: a.wave5, wave5variant: b.wave5 }));
  }
  console.log('FLIPS ' + flips + '/' + compared + ' seeds vs V-full; S2 seeds ' + s2 + '; S3 seeds ' + s3);
  if (mode === 'screen') {
    const go = flips >= 1 || s2 >= 1 || s3 >= 1;
    console.log('SCREEN ' + varPfx + ' ' + (go ? 'GO-CANDIDATE' : 'DIAG-NO-CANDIDATE') + ' (S1 flips=' + flips + ' S2=' + s2 + ' S3=' + s3 + ')');
  }
  if (mode === 'confirm') {
    // Signal seeds: S1 (class flip) OR S3 (kill/fight swing). S2 descriptive only.
    // The per-seed rows above carry S1/S3 flags; recount signal seeds here.
    let signal = 0;
    for (const seed of SEEDS) {
      const a = readSeed(dir, 'vfull-', seed), b = readSeed(dir, varPfx, seed);
      if (a.missing || b.missing) continue;
      const flipped = a.class !== b.class;
      const hitS3 = Math.abs(b.kills - a.kills) >= 2 || Math.abs(b.fights - a.fights) >= 3;
      if (flipped || hitS3) signal++;
    }
    const go = signal >= 2;
    console.log('CONFIRM ' + varPfx + ' ' + (go ? 'GO' : 'NO-GO') + ' (signal seeds=' + signal + ' of ' + compared + '; S1 flips=' + flips + ' S3=' + s3 + ' S2=' + s2 + ' descriptive)');
  }
} else if (mode === 'repeat') {
  const dir = process.argv[3], pfxA = process.argv[4], pfxB = process.argv[5];
  if (!dir || !pfxA || !pfxB) fail('usage: repeat <dir> <prefixA> <prefixB> [seeds]');
  const SEEDS = seedsFrom(6);
  let gateOk = true;
  for (const seed of SEEDS) {
    const a = readSeed(dir, pfxA, seed), b = readSeed(dir, pfxB, seed);
    if (a.missing || b.missing) { console.log(JSON.stringify({ seed, status: 'missing' })); gateOk = false; continue; }
    const satSame = a.satDay === b.satDay;
    const classSame = a.class === b.class;
    const jsonSame = a.jsonBytes === b.jsonBytes;
    const txSame = a.txBytes === b.txBytes;
    console.log(JSON.stringify({ seed, satA: a.satDay, satB: b.satDay, satSame, classA: a.class, classB: b.class, classSame, gameDaysA: a.gameDays, gameDaysB: b.gameDays, jsonByteIdentical: jsonSame, txByteIdentical: txSame }));
    if (!satSame || !classSame) gateOk = false;
  }
  console.log('REPEAT ' + (gateOk ? 'PASS sat days + classes exact on all compared seeds' : 'FAIL sat-day/class divergence — Stage 0(b) gate NOT met'));
  if (!gateOk) process.exit(1);
} else fail('unknown mode ' + mode);
