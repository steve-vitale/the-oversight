#!/usr/bin/env node
// analyze-nighttravel-scan-b.js — away-presence screening for the
// screened nighttravel run (prereg:
// evidence/2026-10-28/sim-nighttravel-screened-b-prereg.md).
//
// Usage:
//   node scripts/analyze-nighttravel-scan-b.js --dir <control-corpus-dir>
//     [--haven 4,4] [--min-near 2] [--out <scan.json>]
//
// Reads ONLY a control-leg (insideevening) corpus directory — one
// file per seed, written by scripts/nighttravel-trace-b.js with
// POLICY=insideevening. It NEVER reads a policy leg, and control
// rows carry no travelOffered/converted fields at all, so the
// screen cannot select on conversion outcome even by accident:
// it selects on POSITION only (being away at evening, near home).
//
// Qualifier rule (pre-registered): a seed qualifies iff its
// control leg has >= --min-near (default 2) NEAR-HOME AWAY
// evenings, where a near-home away evening is an evening row with
// eveningOutcome != 'game-over', preStepTile != null and !=
// 'haven', and evening-end map coords (row.mapPx/mapPy) within
// Manhattan distance <= 3 of the haven node (default 4,4 —
// verified 4,4 on every 2126Z/2224Z policy row; the haven is the
// villager's OWN haven, state.village.px/py).
//
// Why the evening row's coords are the pre-step position on the
// control leg: insideevening's eveningStep returns
// 'not-attempted-away' / 'blocked-combat' for away evenings BEFORE
// any movement, so the post-daily driver position of an away
// evening IS the pre-step position. (On the haven tile the step
// walks, but those evenings are not away and are never counted.)
//
// Why distance <= 3: Game.travelTargets() offers revealed tiles
// within Manhattan d <= 3 (or adjacent unrevealed tiles), so a
// single honest hop home can only be offered from d <= 3. The
// screen enriches for the reach envelope; it does not promise
// reach (revealedness, blockages, and guards still decide).
//
// Output: per-seed counts, the qualifier list ordered by
// (nearHomeAway desc, seed asc) — the prereg's pilot/extension/
// confirm bands are assigned from that order — and a JSON file
// when --out is given. Exits 0 when the scan is complete (the
// qualifier list is data, not an exit code).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const dir = arg('dir', null);
const outFile = arg('out', null);
const havenArg = arg('haven', '4,4').split(',').map((x) => parseInt(x.trim(), 10));
const minNear = parseInt(arg('min-near', '2'), 10);
if (!dir) { console.error('usage: --dir <control-corpus-dir> [--haven 4,4] [--min-near 2] [--out <file>]'); process.exit(2); }
const [hx, hy] = havenArg;

const rows = [];
for (const f of fs.readdirSync(dir).sort()) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  if (j.policy && j.policy !== 'insideevening') {
    console.error('FATAL: scan input must be control-leg (insideevening) only; found policy ' + j.policy + ' in ' + f);
    process.exit(2);
  }
  let away = 0, nearHomeAway = 0, unlocatedAway = 0;
  for (const e of (j.evenings || [])) {
    if (e.eveningOutcome === 'game-over') continue;
    if (e.preStepTile === null || e.preStepTile === undefined || e.preStepTile === 'haven') continue;
    away++;
    if (e.mapPx === null || e.mapPx === undefined || e.mapPy === null || e.mapPy === undefined) { unlocatedAway++; continue; }
    const d = Math.abs(e.mapPx - hx) + Math.abs(e.mapPy - hy);
    if (d <= 3) nearHomeAway++;
  }
  rows.push({ seed: j.seed, away, nearHomeAway, unlocatedAway, qualifies: nearHomeAway >= minNear });
}
rows.sort((a, b) => a.seed - b.seed);
const qualifiers = rows.filter((r) => r.qualifies)
  .sort((a, b) => (b.nearHomeAway - a.nearHomeAway) || (a.seed - b.seed));
console.log('seed | away nearHomeAway unlocated qualifies (control leg only; haven ' + hx + ',' + hy + '; min-near ' + minNear + ')');
for (const r of rows) console.log(`${r.seed} | ${r.away} ${r.nearHomeAway} ${r.unlocatedAway} ${r.qualifies ? 'QUALIFIES' : '-'}`);
console.log('--- qualifiers in prereg order (nearHomeAway desc, seed asc) ---');
for (const r of qualifiers) console.log(`${r.seed} (nearHomeAway ${r.nearHomeAway}, away ${r.away})`);
console.log(`--- scanned ${rows.length} seeds, ${qualifiers.length} qualifiers ---`);
const result = { haven: { hx, hy }, minNear, scanned: rows.length, qualifierCount: qualifiers.length, rows, qualifiers };
if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
