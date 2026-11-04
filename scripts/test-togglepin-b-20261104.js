// test-togglepin-b-20261104.js — proof script for the togglepin-b arm.
// No game code is changed by this arm, so the proofs are:
//  (1) classifier sanity: V-full pilot classes on the pinned base must
//      reproduce r118 (89702 won-lesser, 89704 scattered, 89705
//      won-lesser); sat-day deltas are reported, not asserted.
//  (2) corpus integrity: every expected per-seed JSON exists, parses,
//      carries gameDays + census + fightCensus, and its transcript
//      exists and is non-empty.
//  (3) flip accounting: given two classified corpora (vfull + variant),
//      prints per-seed flip vs V-full (used for Stage 1/2 judging).
// Usage:
//   node scripts/test-togglepin-b-20261104.js sanity <dir> vfull-
//   node scripts/test-togglepin-b-20261104.js flips <dir> vfull- <variant-prefix>
const fs = require('fs');
const path = require('path');
const mode = process.argv[2], dir = process.argv[3], prefix = process.argv[4];
if (!mode || !dir || !prefix) { console.error('usage: test-togglepin-b-20261104.js <sanity|flips> <dir> <prefix> [variant-prefix]'); process.exit(2); }
const SEEDS = [89701, 89702, 89703, 89704, 89705, 89706, 89707];
function readSeed(seed, pfx) {
  const fp = path.join(dir, pfx + seed + '.json');
  if (!fs.existsSync(fp)) return { seed, missing: true };
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
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
    wave5: uw >= 5 || w5sat > 0, uw, gameDays: d.gameDays,
    hasCensus: !!d.census, fights: fights.length, txOk };
}
function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
if (mode === 'sanity') {
  // Pilot-only sanity: only seeds present in the dir are judged.
  const expected = { 89702: 'won-lesser', 89704: 'scattered', 89705: 'won-lesser' };
  let checked = 0, matched = 0;
  for (const seed of [89702, 89704, 89705]) {
    const r = readSeed(seed, prefix);
    if (r.missing) fail('missing ' + prefix + seed + '.json');
    if (!r.hasCensus) fail('no census in ' + prefix + seed);
    if (!r.txOk) fail('empty/missing transcript ' + prefix + seed);
    if (typeof r.gameDays !== 'number') fail('no gameDays in ' + prefix + seed);
    console.log(JSON.stringify(r));
    checked++;
    if (r.class === expected[seed]) matched++; else console.log('DIVERGENCE seed ' + seed + ': got ' + r.class + ', r118 expected ' + expected[seed]);
  }
  console.log('SANITY pilot ' + matched + '/' + checked + ' class matches vs r118');
  if (matched < 2) fail('Stage 0 gate: V-full matches r118 on <2/3 pilot seeds');
  console.log('SANITY PASS (gate threshold >=2/3 met)');
} else if (mode === 'flips') {
  const vpfx = process.argv[5];
  if (!vpfx) fail('flips mode needs a variant prefix');
  let flips = 0, compared = 0;
  for (const seed of SEEDS) {
    const a = readSeed(seed, prefix), b = readSeed(seed, vpfx);
    if (a.missing || b.missing) { console.log(JSON.stringify({ seed, status: 'missing', base: a.missing ? 'missing' : a.class, variant: b.missing ? 'missing' : b.class })); continue; }
    compared++;
    const flipped = a.class !== b.class;
    if (flipped) flips++;
    console.log(JSON.stringify({ seed, base: a.class, baseSat: a.satDay, variant: b.class, variantSat: b.satDay, flipped, wave5base: a.wave5, wave5variant: b.wave5 }));
  }
  console.log('FLIPS ' + flips + '/' + compared + ' seeds vs V-full');
} else fail('unknown mode ' + mode);
