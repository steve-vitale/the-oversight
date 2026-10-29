#!/usr/bin/env node
// test-blockscreen2-b.js — staging + classification + guard proof
// for sim-blockscreen2-b (prereg:
// evidence/2026-10-29/sim-blockscreen2-b-prereg.md, committed
// BEFORE any judged leg).
//
//   node scripts/test-blockscreen2-b.js --dir <screen-corpus-dir>
//     --scan <scan.json> [--off-dir <off-corpus-dir>]
//     [--rerun-dir <dir> --rerun-seeds a,b,c]
//     [--range 13000,13599] [--block 40] [--target 12]
//
// Checks (exit 1 on any failure):
//   V1 prior-corpus classification reproduction: the
//      blockscreen-b validation set (seeds 12206, 12356,
//      12434, 12403, 12464; 48 refused evenings) must
//      classify to EXACTLY creek 23, washed_out 17,
//      fallen_tree 8, rubble 0, unclassified 0,
//      uncovered 0 — the recorder classifies known
//      refused evenings identically, before any new
//      census number is trusted.
//   S1 screen seeds lie inside the declared range and
//      form complete blocks of --block seeds from the
//      range start (no partial blocks: scanning stops
//      at block ends), consecutive with no gaps.
//   S2 no screen seed lies in any excluded range
//      (11000-11447 bank, 11500-11519 detour confirm,
//      12000-12079 blocktype blind, 12200-12559
//      blockscreen) and no seed appears twice.
//   S3 bank = exactly the qualifiers: every banked
//      seed has refused >= 1, every scanned non-banked
//      seed has refused 0.
//   S4 bank order is scan order (seed asc).
//   S5 stop rule: if bank >= target, dropping the last
//      scanned block must drop the bank below target
//      (the scan stopped at the first block reaching
//      the bar); if bank < target, the scan ran the
//      full cap (range end reached in complete blocks).
//   C1 every screen file carries policy 'nighttravel'
//      and recorderOn true (screen legs are recorder-ON
//      census legs, not control legs).
//   P1 partition sums hold on every screen seed
//      (evenings == sum of the outcome partition).
//   U1 unclassified refused evenings == 0 on the bank.
//   G1 (only when --off-dir given): OFF-vs-ON
//      deep-equal with blocktype stripped shows zero
//      diffs on the validation subset.
//   D1 (only when --rerun-dir given): for each rerun
//      seed, the rerun file is byte-identical to the
//      screen file and the qualifier classification
//      recomputed from it matches.
// Prints the per-type table under BOTH countings
// (evenings-per-type and seeds-per-type) plus the
// uncovered list, then PROOF-GREEN, else PROOF-RED.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadCorpus, analyzeSeed, pool, diffCorpora } = require('./analyze-blocktype-b');

const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const dir = arg('dir', null);
const scanFile = arg('scan', null);
const offDir = arg('off-dir', null);
const rerunDir = arg('rerun-dir', null);
const rerunSeeds = (arg('rerun-seeds', '') || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite);
const [rangeLo, rangeHi] = (arg('range', '13000,13599') || '13000,13599').split(',').map((x) => parseInt(x.trim(), 10));
const block = parseInt(arg('block', '40'), 10);
const target = parseInt(arg('target', '12'), 10);
const EXCLUDED = [[11000, 11447], [11500, 11519], [12000, 12079], [12200, 12559]];
if (!dir || !scanFile) { console.error('usage: --dir <screen-corpus-dir> --scan <scan.json> [--off-dir <d>] [--rerun-dir <d> --rerun-seeds a,b]'); process.exit(2); }

const fails = [];
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
};

// V1: prior-corpus classification reproduction.
const VALIDATION_SEEDS = [12206, 12356, 12434, 12403, 12464];
const VALIDATION_EXPECT = { creek: 23, washed_out: 17, fallen_tree: 8, rubble: 0 };
try {
  const vcorpus = loadCorpus(path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-blockscreen-b-corpus-on'), VALIDATION_SEEDS);
  const vrows = vcorpus.map(analyzeSeed);
  const vpool = pool(vrows);
  const vcounts = {};
  for (const [t, v] of Object.entries(vpool.byType)) vcounts[t] = v.refused;
  const vOk = vpool.refused === 48 && vpool.unclassified === 0 && vpool.uncovered.length === 0 &&
    Object.entries(VALIDATION_EXPECT).every(([t, n]) => (vcounts[t] || 0) === n) &&
    Object.keys(vcounts).every((t) => VALIDATION_EXPECT[t] !== undefined);
  check('V1 prior-corpus-reproduction', vOk,
    `refused=${vpool.refused} unclassified=${vpool.unclassified} uncovered=${vpool.uncovered.length} byType=${JSON.stringify(vcounts)}`);
} catch (e) {
  check('V1 prior-corpus-reproduction', false, 'error: ' + String(e && e.message));
}

// Screen corpus.
const corpus = loadCorpus(dir);
const seedRows = corpus.map(analyzeSeed);
const scan = JSON.parse(fs.readFileSync(scanFile, 'utf8'));
const rows = scan.rows || [];
const bank = scan.bank || [];
const seeds = seedRows.map((r) => r.seed).sort((a, b) => a - b);
const bySeed = new Map(seedRows.map((r) => [r.seed, r]));

// S1: range + complete consecutive blocks.
const inRange = seeds.every((s) => s >= rangeLo && s <= rangeHi);
const nBlocks = seeds.length / block;
const consecutive = seeds.length > 0 && seeds.every((s, i) => s === rangeLo + i);
check('S1 range+complete-blocks', inRange && Number.isInteger(nBlocks) && consecutive,
  `${seeds.length} seeds, ${Number.isInteger(nBlocks) ? nBlocks : 'NON-INTEGER'} blocks of ${block} from ${rangeLo}`);
// S2: excluded ranges + uniqueness.
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const dupes = seeds.filter((s, i) => seeds.indexOf(s) !== i);
const bad = seeds.filter((s) => EXCLUDED.some(([lo, hi]) => s >= lo && s <= hi));
check('S2 no-excluded-no-duplicate', bad.length === 0 && dupes.length === 0 && files.length === seeds.length,
  bad.length ? `excluded: ${bad.join(',')}` : (dupes.length ? `dupes: ${dupes.join(',')}` : `${files.length} files for ${seeds.length} seeds`));
// S3: bank = exactly qualifiers.
const qualifiers = seedRows.filter((r) => r.refused >= 1).map((r) => r.seed).sort((a, b) => a - b);
const bankOk = bank.length === qualifiers.length && bank.every((s, i) => s === qualifiers[i]);
check('S3 bank-is-qualifiers', bankOk, `bank ${bank.length}: ${bank.join(',')}`);
// S4: bank order is scan order (seed asc).
const ascOk = bank.every((s, i) => i === 0 || s > bank[i - 1]);
check('S4 bank-scan-order', ascOk, `${bank.length} banked seeds ascending`);
// S5: stop rule.
if (bank.length >= target) {
  const lastBlockStart = rangeLo + (Math.floor((seeds.length - 1) / block) * block);
  const beforeLast = qualifiers.filter((s) => s < lastBlockStart).length;
  check('S5 stop-at-first-bar-block', beforeLast < target,
    `qualifiers before last block: ${beforeLast} < target ${target}; scanned ${seeds.length} seeds`);
} else {
  check('S5 cap-exhausted-below-bar', seeds.length === (rangeHi - rangeLo + 1),
    `bank ${bank.length} < target ${target}; scanned full cap ${seeds.length} seeds`);
}
// Scan.json consistency with corpus.
const scanRowOk = rows.length === seeds.length && rows.every((r) => {
  const sr = bySeed.get(r.seed);
  return sr && sr.refused === r.refused && (r.refused >= 1) === !!r.qualifies;
});
check('S6 scan-json-matches-corpus', scanRowOk, `${rows.length} scan rows`);
// C1: corpus identity.
const nonOn = corpus.filter((c) => c.policy !== 'nighttravel' || c.recorderOn !== true);
check('C1 nighttravel-recorder-on', nonOn.length === 0,
  nonOn.length ? `non-conforming: ${nonOn.map((c) => c.seed).join(',')}` : `${corpus.length} ON legs`);
// P1: partition sums.
const partBad = seedRows.filter((r) => {
  const sum = Object.values(r.partition).reduce((a, b) => a + b, 0);
  return sum !== r.evenings;
});
check('P1 partition-sums', partBad.length === 0,
  partBad.length ? `mismatch seeds: ${partBad.map((r) => r.seed).join(',')}` : `all ${seedRows.length} seeds sum`);
// U1: unclassified == 0 on the bank.
const bankRows = seedRows.filter((r) => bank.includes(r.seed));
const pooled = pool(bankRows);
check('U1 unclassified-zero', pooled.unclassified === 0,
  `unclassified=${pooled.unclassified} on ${pooled.refused} refused evenings`);
// Recorder errors.
const maxErrs = bankRows.reduce((m, r) => Math.max(m, r.recorderErrs || 0), 0);
check('G0 recorder-errors-zero', maxErrs === 0, `max recorderErrs=${maxErrs}`);
// G1: OFF-vs-ON deep-equal on validation subset.
if (offDir) {
  const valSeeds = bank.slice(0, Math.min(4, bank.length));
  const diff = diffCorpora(offDir, dir, valSeeds);
  check('G1 off-vs-on-deep-equal', diff.diffs.length === 0,
    `validation subset ${valSeeds.join(',') || '(none)'}; diffs=${diff.diffs.length}` +
    (diff.diffs.length ? ` ${JSON.stringify(diff.diffs)}` : ''));
}
// D1: determinism.
if (rerunDir) {
  for (const s of rerunSeeds) {
    const origFiles = fs.readdirSync(dir).filter((f) => f.includes('-s' + s + '.json'));
    const rerunFiles = fs.readdirSync(rerunDir).filter((f) => f.includes('-s' + s + '.json'));
    if (origFiles.length !== 1 || rerunFiles.length !== 1) { check(`D1 rerun-${s}`, false, `${origFiles.length} orig / ${rerunFiles.length} rerun files`); continue; }
    const origBytes = fs.readFileSync(path.join(dir, origFiles[0]), 'utf8');
    const rerunBytes = fs.readFileSync(path.join(rerunDir, rerunFiles[0]), 'utf8');
    const rj = JSON.parse(rerunBytes);
    const refused = (rj.evenings || []).filter((e) => e.eveningOutcome === 'travel-refused').length;
    const origRow = bySeed.get(s);
    check(`D1 rerun-${s}`, rerunBytes === origBytes && origRow && (refused >= 1) === bank.includes(s),
      `byte-identical=${rerunBytes === origBytes}, refused rerun=${refused} orig=${origRow ? origRow.refused : '?'}`);
  }
}
// Report: per-type table under BOTH countings + uncovered list.
console.log('--- census table (banked seeds only) ---');
console.log(`banked seeds: ${bank.length}; scanned seeds: ${seeds.length}; qualifier rate: ${(bank.length / Math.max(1, seeds.length) * 100).toFixed(2)}%`);
console.log(`refused evenings: ${pooled.refused}; classified: ${pooled.classified}; unclassified: ${pooled.unclassified}`);
for (const [t, v] of Object.entries(pooled.byType)) {
  const seedsWith = bankRows.filter((r) => (r.byType[t] || {}).refused > 0).length;
  console.log(`type ${t}: evenings ${v.refused} (${pooled.refused ? (v.refused / pooled.refused * 100).toFixed(1) : '0.0'}% of evenings); ` +
    `seeds ${seedsWith}/${bank.length} (${bank.length ? (seedsWith / bank.length * 100).toFixed(1) : '0.0'}% of seeds); ` +
    `covered ${v.covered} uncovered ${v.uncovered}; lengths ${JSON.stringify(v.lengths)}; tiles ${JSON.stringify(v.tiles)}`);
}
console.log(`uncovered list: ${JSON.stringify(pooled.uncovered)}`);
console.log(`per-seed: ${JSON.stringify(bankRows.map((r) => ({ seed: r.seed, refused: r.refused, daysAlive: r.daysAlive, endReason: r.endReason, maxWave: r.maxWaveUnlocked, byType: Object.fromEntries(Object.entries(r.byType).map(([t, v]) => [t, v.refused])) })))}`);
console.log(fails.length ? 'PROOF-RED: ' + fails.join(', ') : 'PROOF-GREEN');
process.exit(fails.length ? 1 : 0);
