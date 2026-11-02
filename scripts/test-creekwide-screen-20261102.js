#!/usr/bin/env node
// test-creekwide-screen-20261102.js — proof for the sim-creekwide-a
// wide screen (follow-up to Loop A 1155Z blank 1).
// (1) The geometry tool reproduces the knowns: 97396 flags (5,4) AND
// (6,4) both needsBridge; 97307 flags (5,4) needsBridge and (6,4)
// wetland (not a creek). Each known runs in its own child process
// (one harness per process, never two in one).
// (2) Tier derivation from ledger rows reproduces all 10 prior
// nominations exactly (2C/L/M rule).
// (3) A merge of new rows onto a copy of the prior ledger leaves
// all 59 prior rows byte-identical (JSON.stringify equality, same
// order) and the prior tier lists intact as prefixes.
// Usage: node scripts/test-creekwide-screen-20261102.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const LEDGER = path.join(REPO, 'evidence', '2026-11-02', 'perseed-creekwood-a', 'confirm-geometry-ledger.json');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function geom(seed) {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'creekwood-geometry-20261102.js')],
    { env: Object.assign({}, process.env, { SEED: String(seed) }), encoding: 'utf8', timeout: 120000 });
  const line = out.split('\n').find(l => l.startsWith('GEOM-JSON:'));
  if (!line) throw new Error('no GEOM-JSON line for seed ' + seed);
  return JSON.parse(line.slice('GEOM-JSON:'.length));
}

function tiersOf(rows) {
  const t2c = [], tl = [], tm = [];
  for (const r of rows) {
    const t = r.tiles || {};
    const nb54 = !!(t['5,4'] && t['5,4'].needsBridge);
    const nb64 = !!(t['6,4'] && t['6,4'].needsBridge);
    if (nb54 && nb64) t2c.push(r.seed);
    else if (nb64) tl.push(r.seed);
    else if (nb54) tm.push(r.seed);
  }
  return { t2c, tl, tm };
}

// (1) Knowns via the real tool, one child process per seed.
const g396 = geom(97396);
check('97396 (5,4) creek needsBridge',
  g396.tiles['5,4'] && g396.tiles['5,4'].type === 'creek' && g396.tiles['5,4'].needsBridge === true,
  JSON.stringify(g396.tiles['5,4']));
check('97396 (6,4) creek needsBridge',
  g396.tiles['6,4'] && g396.tiles['6,4'].type === 'creek' && g396.tiles['6,4'].needsBridge === true,
  JSON.stringify(g396.tiles['6,4']));
const g307 = geom(97307);
check('97307 (5,4) needsBridge',
  g307.tiles['5,4'] && g307.tiles['5,4'].needsBridge === true,
  JSON.stringify(g307.tiles['5,4']));
check('97307 (6,4) wetland, not a creek',
  g307.tiles['6,4'] && g307.tiles['6,4'].type === 'wetland',
  JSON.stringify(g307.tiles['6,4']));

// (2) Tier derivation reproduces the prior nominations exactly.
const prior = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
check('prior ledger has 59 rows', prior.rows.length === 59, 'got ' + prior.rows.length);
const derived = tiersOf(prior.rows);
check('tier2C_both reproduces [97898]', JSON.stringify(derived.t2c) === JSON.stringify(prior.tier2C_both),
  JSON.stringify(derived.t2c));
check('tierL_64only reproduces prior list', JSON.stringify(derived.tl) === JSON.stringify(prior.tierL_64only),
  JSON.stringify(derived.tl));
check('tierM_54only reproduces prior list', JSON.stringify(derived.tm) === JSON.stringify(prior.tierM_54only),
  JSON.stringify(derived.tm));

// (3) Merge preservation: append synthetic new rows, prior rows
// byte-identical and prior tier lists intact as prefixes.
const priorRowsJson = prior.rows.map(r => JSON.stringify(r));
const merged = JSON.parse(JSON.stringify(prior));
const fake = { seed: 99999, haven: { x: null, y: null }, tiles: { '5,4': { type: 'creek', needsBridge: true, bridged: false, blockFrom: null }, '6,4': { type: 'creek', needsBridge: true, bridged: false, blockFrom: null } } };
merged.rows.push(fake);
const d2 = tiersOf(merged.rows);
merged.tier2C_both = d2.t2c; merged.tierL_64only = d2.tl; merged.tierM_54only = d2.tm;
merged.screened = merged.rows.length;
const mergedPriorJson = merged.rows.slice(0, 59).map(r => JSON.stringify(r));
check('merge preserves all 59 prior rows byte-identical',
  JSON.stringify(mergedPriorJson) === JSON.stringify(priorRowsJson));
check('merge keeps prior tier2C as prefix',
  JSON.stringify(merged.tier2C_both.slice(0, prior.tier2C_both.length)) === JSON.stringify(prior.tier2C_both));
check('merge keeps prior tierL as prefix',
  JSON.stringify(merged.tierL_64only.slice(0, prior.tierL_64only.length)) === JSON.stringify(prior.tierL_64only));
check('merge keeps prior tierM as prefix',
  JSON.stringify(merged.tierM_54only.slice(0, prior.tierM_54only.length)) === JSON.stringify(prior.tierM_54only));
check('merge appends synthetic 2C seed', merged.tier2C_both.includes(99999));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
