#!/usr/bin/env node
// scripts/test-dissolve-a.js — sim-dissolve-a fixtures.
// Proves, BEFORE the judged classification is analyzed, on synthetic
// rows: the restored-first dissolved branch in priority order, the
// lingerer-origin population rule, and the corpus readability leg.
// Plain node; no jest; no game state; never writes into a corpus.
// Usage: node scripts/test-dissolve-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyDissolved, isLingererOrigin } = require('./analyze-dissolve-a');

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
  else console.log(`ok ${name}`);
}
function base(over) {
  return Object.assign({ result: 'dissolved-no-tbend', kind: 'start', tableTrial: false,
    intendedMid: 'herald', tilePx: 4, tilePy: 4, lift: null, lifted: false,
    restoredIdentity: false, restoredEntry: false, restoredHp: null,
    fightersStart: null, fightersEnd: null, worldOrigin: null, bystander: false }, over);
}

// 1. Dissolved branch, priority order (verbatim from scholarmelt-a).
check('identity-restored beats lifted-melt',
  classifyDissolved(base({ restoredIdentity: true, lifted: true, lift: { id: 'herald', hp: 700, lingering: true, titan: true } })).fate === 'SCHOLAR-RESTORED');
check('identity-restored subflag',
  classifyDissolved(base({ restoredIdentity: true })).sub === 'dissolved-restored');
check('entry-restored when identity absent',
  classifyDissolved(base({ restoredIdentity: false, restoredEntry: true })).fate === 'SCHOLAR-RESTORED'
  && classifyDissolved(base({ restoredIdentity: false, restoredEntry: true })).sub === 'dissolved-restored-entry');
check('melt on lifted + absent',
  classifyDissolved(base({ lifted: true, lift: { id: 'herald', hp: 700 } })).fate === 'DISSOLVED-MELT');
check('spawn-ended on no lift + lifted false',
  classifyDissolved(base({ lifted: false, lift: null })).fate === 'SPAWN-ENDED');
check('never-lifted bystander on lift present + lifted false + no restore',
  classifyDissolved(base({ lifted: false, lift: { id: 'herald', hp: 700, lingering: true, titan: true } })).fate === 'BYSTANDER-OR-NONMONSTER');
check('bystander flag path',
  classifyDissolved(base({ lifted: null, lift: null, bystander: true })).fate === 'BYSTANDER-OR-NONMONSTER');
check('ambiguous dissolved => UNCLASSIFIED (never a silent fate)',
  classifyDissolved(base({ lifted: null, lift: null, bystander: false })).fate === 'UNCLASSIFIED');
check('non-dissolved row => null (outside this population)',
  classifyDissolved(base({ result: 'lost' })) === null);
check('missing row => UNCLASSIFIED',
  classifyDissolved(null).fate === 'UNCLASSIFIED');

// 2. Lingerer-origin population rule (prereg definition).
check('lift.lingering true => lingerer-origin',
  isLingererOrigin(base({ lift: { id: 'herald', hp: 700, lingering: true, titan: true } })) === true);
check('lift.lingering false => not lingerer-origin',
  isLingererOrigin(base({ lift: { id: 'herald', hp: 700, lingering: false, titan: true } })) === false);
check('no lift => never lingerer-origin (spawn-ended excluded)',
  isLingererOrigin(base({ lift: null })) === false);
check('worldOrigin null does not block lingerer-origin (no tbEnd on dissolved rows)',
  isLingererOrigin(base({ worldOrigin: null, lift: { id: 'herald', hp: 700, lingering: true, titan: true } })) === true);
check('titan non-lingering lift => not lingerer-origin (titan alone is not the rule)',
  isLingererOrigin(base({ lift: { id: 'herald', hp: 700, lingering: false, titan: true } })) === false);

// 3. Corpus readability leg (structural only — no judged counts asserted).
const DRAFTFLAG = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
let readable = true, diagClean = true;
for (let s = 75101; s <= 75116; s++) {
  try {
    const row = JSON.parse(fs.readFileSync(path.join(DRAFTFLAG, `s${s}-fresh.json`), 'utf8'));
    const cen = JSON.parse(fs.readFileSync(path.join(DRAFTFLAG, `census-s${s}.json`), 'utf8'));
    if (!row.scholarmelt || !Array.isArray(row.scholarmelt.meetings)) readable = false;
    if ((row.scholarmelt.diag.errs || 0) !== 0) diagClean = false;
    if (!cen.snapshots || !cen.snapshots.length) readable = false;
  } catch (e) { readable = false; }
}
check('draftflag corpus 16/16 rows + censuses parse, scholarmelt meetings present', readable);
check('draftflag corpus scholarmelt diag errs 0 on 16/16', diagClean);
const SM = path.join(REPO, 'evidence', '2026-10-30', 'sim-scholarmelt-a-analysis.json');
let smOk = false;
try { const a = JSON.parse(fs.readFileSync(SM, 'utf8')); smOk = Array.isArray(a.fights) && a.fights.length > 0; } catch (e) { smOk = false; }
check('scholarmelt analysis readable for cross-check (fights present)', smOk);

console.log(fails === 0 ? `FIXTURES-PASS (${checks} checks, 0 fails)` : `FIXTURES-FAIL (${fails}/${checks} fails)`);
process.exit(fails === 0 ? 0 : 1);
