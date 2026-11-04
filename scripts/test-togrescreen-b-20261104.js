// test-togrescreen-b-20261104.js — proof script for the tog rescreen arm.
// No game code is changed by this arm, so the proofs are:
//  (1) integrity: every expected per-seed JSON exists, parses, carries
//      gameDays + census + fightCensus, and its transcript is non-empty.
//  (2) flips: per-seed class flip vs V-full for a variant prefix.
//  (3) repeat: two dirs' per-seed JSON + transcript bytes are identical
//      (Stage 0 determinism gate: 2-seed V-full repeat bit-identical).
// Usage:
//   node scripts/test-togrescreen-b-20261104.js integrity <dir> <prefix>
//   node scripts/test-togrescreen-b-20261104.js flips <dir> vfull- <variant-prefix>
//   node scripts/test-togrescreen-b-20261104.js repeat <dirA> <dirB> <prefix>
const fs = require('fs');
const path = require('path');
const SEEDS = [89801, 89802, 89803, 89804, 89805, 89806, 89807, 89808];
const mode = process.argv[2];
function fail(m) { console.error('FAIL: ' + m); process.exit(1); }
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
  else cls = 'other';
  const tx = path.join(dir, pfx + seed + '-transcript.txt');
  const txOk = fs.existsSync(tx) && fs.statSync(tx).size > 0;
  return { seed, class: cls, satDay: d.satDay != null ? d.satDay : null,
    satSeatKind: d.satSeatKind || null, wave5: uw >= 5 || w5sat > 0, uw,
    w5sat, gameDays: d.gameDays, alive: d.census ? d.census.alive : null,
    endReason: d.endReason || null, scale: d.census ? d.census.scale : null,
    fights: fights.length, kills: fights.filter(f => f.outcome === 'vKill').length,
    vDie: fights.filter(f => f.outcome === 'vDie').length, txOk,
    hasCensus: !!d.census, hasFightCensus: !!d.fightCensus };
}
if (mode === 'integrity') {
  const dir = process.argv[3], pfx = process.argv[4];
  if (!dir || !pfx) fail('usage: integrity <dir> <prefix>');
  let ok = 0;
  for (const seed of SEEDS) {
    const r = readSeed(dir, pfx, seed);
    if (r.missing) fail('missing ' + pfx + seed + '.json');
    if (r.badJson) fail('bad JSON ' + pfx + seed);
    if (!r.hasCensus || !r.hasFightCensus || !r.txOk || typeof r.gameDays !== 'number')
      fail('incomplete corpus ' + pfx + seed + ': ' + JSON.stringify(r));
    console.log(JSON.stringify(r)); ok++;
  }
  console.log('INTEGRITY PASS ' + ok + '/' + SEEDS.length + ' ' + pfx);
} else if (mode === 'flips') {
  const dir = process.argv[3], base = process.argv[4], vpfx = process.argv[5];
  if (!dir || !base || !vpfx) fail('usage: flips <dir> <base-prefix> <variant-prefix>');
  let flips = 0, compared = 0;
  for (const seed of SEEDS) {
    const a = readSeed(dir, base, seed), b = readSeed(dir, vpfx, seed);
    if (a.missing || b.missing) { console.log(JSON.stringify({ seed, status: 'missing' })); continue; }
    compared++;
    const flipped = a.class !== b.class;
    if (flipped) flips++;
    console.log(JSON.stringify({ seed, base: a.class, baseSat: a.satDay, variant: b.class, variantSat: b.satDay,
      flipped, wave5base: a.wave5, wave5variant: b.wave5,
      fightsBase: a.fights, fightsVar: b.fights, killsBase: a.kills, killsVar: b.kills,
      daysBase: a.gameDays, daysVar: b.gameDays }));
  }
  console.log('FLIPS ' + flips + '/' + compared + ' seeds vs V-full');
} else if (mode === 'repeat') {
  const dirA = process.argv[3], dirB = process.argv[4], pfx = process.argv[5];
  if (!dirA || !dirB || !pfx) fail('usage: repeat <dirA> <dirB> <prefix>');
  // Only seeds present in BOTH dirs are compared (gate runs 2 seeds).
  let compared = 0, identical = 0;
  for (const seed of SEEDS) {
    const fa = path.join(dirA, pfx + seed + '.json'), fb = path.join(dirB, pfx + seed + '.json');
    const ta = path.join(dirA, pfx + seed + '-transcript.txt'), tb = path.join(dirB, pfx + seed + '-transcript.txt');
    if (!fs.existsSync(fa) || !fs.existsSync(fb)) continue;
    compared++;
    const jSame = fs.readFileSync(fa, 'utf8') === fs.readFileSync(fb, 'utf8');
    const tSame = fs.existsSync(ta) && fs.existsSync(tb) && fs.readFileSync(ta, 'utf8') === fs.readFileSync(tb, 'utf8');
    console.log(JSON.stringify({ seed, jsonIdentical: jSame, transcriptIdentical: tSame }));
    if (jSame && tSame) identical++;
  }
  console.log('REPEAT ' + identical + '/' + compared + ' bit-identical');
  if (compared === 0) fail('no overlapping seeds for repeat check');
  if (identical !== compared) fail('repeat run NOT bit-identical');
  console.log('REPEAT PASS');
} else fail('unknown mode ' + mode);
