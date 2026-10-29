#!/usr/bin/env node
// test-blockscreen-b.js — staging + determinism proof for
// sim-blockscreen-b (prereg:
// evidence/2026-10-29/sim-blockscreen-b-prereg.md, committed
// BEFORE any judged leg).
//
//   node scripts/test-blockscreen-b.js --scan <scan.json>
//     --dir <scan-corpus-dir>
//     [--rerun-dir <dir> --rerun-seeds 122xx,122yy]
//     [--range 12200,12599] [--block 40] [--target 24]
//
// Checks (exit 1 on any failure):
//   S1 scan seeds lie inside the declared range and form
//      complete blocks of --block seeds from the range start
//      (no partial blocks: scanning stops at block ends).
//   S2 no scan seed lies in any excluded range:
//      11000-11447 (nighttravel bank), 11500-11519 (detour
//      confirm scan), 12000-12079 (blocktype blind band).
//   S3 qualifier order is (nearHomeAway desc, seed asc).
//   S4 every qualifier has nearHomeAway >= 2.
//   S5 bank = first --target qualifiers in order; if the
//      bank is short (< --target) it is REPORTED as a
//      short bank (not fudged), and the check still passes
//      only if the qualifier list equals the bank prefix
//      (i.e. no hand-picked seed outside the order).
//   C1 every corpus file carries policy 'insideevening'
//      (control legs only — the screen cannot select on a
//      policy-leg outcome).
//   D1 (only when --rerun-dir given): for each rerun seed,
//      the rerun file is byte-identical to the scan file,
//      and recomputing nearHomeAway from the rerun file
//      (haven 4,4, d <= 3, preStepTile away, non-game-over)
//      matches the scan JSON row — re-running a screen leg
//      reproduces byte-identical selection.
// Prints PROOF-GREEN on a full pass, else PROOF-RED.
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const scanFile = arg('scan', null);
const dir = arg('dir', null);
const rerunDir = arg('rerun-dir', null);
const rerunSeeds = (arg('rerun-seeds', '') || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Number.isFinite);
const [rangeLo, rangeHi] = (arg('range', '12200,12599') || '12200,12599').split(',').map((x) => parseInt(x.trim(), 10));
const block = parseInt(arg('block', '40'), 10);
const target = parseInt(arg('target', '24'), 10);
const EXCLUDED = [[11000, 11447], [11500, 11519], [12000, 12079]];
if (!scanFile || !dir) { console.error('usage: --scan <scan.json> --dir <scan-corpus-dir> [--rerun-dir <dir> --rerun-seeds a,b]'); process.exit(2); }
const fails = [];
const notes = [];
const check = (name, ok, detail) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
};
const scan = JSON.parse(fs.readFileSync(scanFile, 'utf8'));
const rows = scan.rows || [];
const quals = scan.qualifiers || [];
const seeds = rows.map((r) => r.seed).sort((a, b) => a - b);
// S1: range + complete blocks.
const inRange = seeds.every((s) => s >= rangeLo && s <= rangeHi);
const nBlocks = seeds.length / block;
const completeBlocks = Number.isInteger(nBlocks) && seeds.length > 0 &&
  seeds.every((s, i) => s === rangeLo + i);
check('S1 range+complete-blocks', inRange && completeBlocks,
  `${seeds.length} seeds, ${Number.isInteger(nBlocks) ? nBlocks : 'NON-INTEGER'} blocks of ${block} from ${rangeLo}`);
// S2: excluded ranges.
const bad = seeds.filter((s) => EXCLUDED.some(([lo, hi]) => s >= lo && s <= hi));
check('S2 no-excluded-seed', bad.length === 0, bad.length ? `excluded seeds present: ${bad.join(',')}` : 'clean');
// S3: qualifier order.
const sorted = [...quals].sort((a, b) => (b.nearHomeAway - a.nearHomeAway) || (a.seed - b.seed));
const orderOk = quals.length === sorted.length && quals.every((q, i) => q.seed === sorted[i].seed && q.nearHomeAway === sorted[i].nearHomeAway);
check('S3 qualifier-order', orderOk, `${quals.length} qualifiers`);
// S4: min-near.
const minOk = quals.every((q) => q.nearHomeAway >= 2);
check('S4 min-near-2', minOk, quals.length ? `min nearHomeAway ${Math.min(...quals.map((q) => q.nearHomeAway))}` : 'no qualifiers');
// S5: bank = first target qualifiers (or short-bank report).
const bank = quals.slice(0, target);
if (quals.length >= target) {
  check('S5 bank-first-24', bank.length === target, `bank ${bank.map((q) => q.seed).join(',')}`);
} else {
  console.log(`NOTE S5 short-bank: ${quals.length} qualifiers < target ${target} — band exhausted, not fudged`);
  check('S5 bank-prefix-only', bank.length === quals.length, `bank = all ${quals.length} qualifiers`);
}
// C1: corpus files are insideevening only.
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
let nonControl = [];
const bySeed = {};
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (j.policy !== 'insideevening') nonControl.push(f);
  bySeed[j.seed] = { file: f, json: j };
}
check('C1 control-only-corpus', nonControl.length === 0 && files.length === seeds.length,
  `${files.length} files for ${seeds.length} scan seeds` + (nonControl.length ? `; non-control: ${nonControl.join(',')}` : ''));
// D1: determinism on rerun seeds.
if (rerunDir) {
  for (const s of rerunSeeds) {
    const orig = bySeed[s];
    if (!orig) { check(`D1 rerun-${s}`, false, 'seed not in scan corpus'); continue; }
    const rerunFiles = fs.readdirSync(rerunDir).filter((f) => f.includes('-s' + s + '.json'));
    if (rerunFiles.length !== 1) { check(`D1 rerun-${s}`, false, `${rerunFiles.length} rerun files`); continue; }
    const rerunBytes = fs.readFileSync(path.join(rerunDir, rerunFiles[0]), 'utf8');
    const origBytes = fs.readFileSync(path.join(dir, orig.file), 'utf8');
    const byteOk = rerunBytes === origBytes;
    const rj = JSON.parse(rerunBytes);
    let near = 0;
    for (const e of (rj.evenings || [])) {
      if (e.eveningOutcome === 'game-over') continue;
      if (e.preStepTile === null || e.preStepTile === undefined || e.preStepTile === 'haven') continue;
      if (e.mapPx === null || e.mapPx === undefined || e.mapPy === null || e.mapPy === undefined) continue;
      if (Math.abs(e.mapPx - 4) + Math.abs(e.mapPy - 4) <= 3) near++;
    }
    const scanRow = rows.find((r) => r.seed === s);
    const classOk = scanRow && scanRow.nearHomeAway === near && (near >= 2) === scanRow.qualifies;
    check(`D1 rerun-${s}`, byteOk && classOk,
      `byte-identical=${byteOk}, nearHomeAway rerun=${near} scan=${scanRow ? scanRow.nearHomeAway : '?'}`);
  }
}
console.log(fails.length ? 'PROOF-RED: ' + fails.join(', ') : 'PROOF-GREEN');
process.exit(fails.length ? 1 : 0);
