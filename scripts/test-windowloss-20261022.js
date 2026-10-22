#!/usr/bin/env node
// Proof for the wave-5 window-loss instrument (scripts/windowloss-20261022.js).
//
// Proves the instrument reads the landed corpora DETERMINISTICALLY and that
// the window inventory, channel tally, and coverage match the pre-registered
// DIAG expectations. Re-analysis only: no sims, no game code, no writes
// (this test must not write into the repo).
//
// Run: node scripts/test-windowloss-20261022.js   (exit 0 = all PASS)
'use strict';
const { analyze, CORPORA } = require('./windowloss-20261022.js');
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const r1 = analyze();
const r2 = analyze();

// E1 — determinism: two runs over the corpora are byte-identical.
check('E1 deterministic (two runs byte-identical)', eq(r1, r2));

// E2 — corpus completeness: every landed config is read.
check('E2 corpus file counts', eq(r1.corpusCounts, {
  'armorydrive-confirm': 64, 'vetwindow-pilot': 32, 'vetwindow-probe': 12, 'stagemuster': 32,
}), JSON.stringify(r1.corpusCounts));
check('E2b total observations scanned', r1.observationsScanned === 140,
  String(r1.observationsScanned));

// E3 — window inventory: 16 window observations across the corpora,
// pilot corpus contributes zero (max vetsMax=1 there).
check('E3 window observations total', r1.windowObservations === 16,
  String(r1.windowObservations));
check('E3b by-corpus window counts', eq(r1.windowObservationsByCorpus, {
  'armorydrive-confirm': 4, 'vetwindow-probe': 8, 'stagemuster': 4,
}), JSON.stringify(r1.windowObservationsByCorpus));

// E4 — unique windows: W1..W4 (DIAG-rich) + W5..W8 (stagemuster coarse);
// the 8 probe observations are replication duplicates, excluded from the tally.
check('E4 unique window count', r1.uniqueWindowCount === 8,
  String(r1.uniqueWindowCount));
check('E4b unique window ids', eq(r1.uniqueWindows,
  ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']), JSON.stringify(r1.uniqueWindows));
check('E4c probe duplicate count', r1.probeDuplicateCount === 8,
  String(r1.probeDuplicateCount));

// E5 — outcome + channel tally (binding for the DIAG verdict).
check('E5 outcome tally', eq(r1.tally, { opened: 4, killed: 4, held: 0 }),
  JSON.stringify(r1.tally));
check('E5b killer-channel distribution', eq(r1.channels, {
  veterans: 2, armor: 0, 'rerun-escalation': 1, 'mantle-succession': 1, other: 0,
}), JSON.stringify(r1.channels));
check('E5c verdict: no dominant channel', r1.dominantLossChannel === 'no-dominant-channel',
  r1.dominantLossChannel);

// E6 — blocker consistency on fully-instrumented never-opened windows:
// armor the sole short bar on 28/28 window-days (W1: 20/20, W2: 8/8).
check('E6 armor sole-blocker days', r1.armorSoleBlockerDays === 28 &&
  r1.instrumentedNeverOpenedDays === 28,
  r1.armorSoleBlockerDays + '/' + r1.instrumentedNeverOpenedDays);

// E7 — coverage: every unique window gets a table row (>=80% pre-reg bar).
check('E7 coverage 8/8 >= 80%', r1.coverageRows === 8 && r1.coveragePct >= 0.8,
  r1.coverageRows + '/' + r1.uniqueWindowCount);

// E8 — fact-sheet auditability: provenance + deterministic attribution rule present.
const facts = JSON.parse(fs.readFileSync(
  path.join(__dirname, 'windowloss-facts-20261022.json'), 'utf8'));
check('E8 fact-sheet provenance', !!(facts.provenance && facts.provenance.census &&
  facts.provenance.narrative && facts.attribution_rule && facts.attribution_rule.precedence),
  'provenance/attribution_rule missing');
check('E8b every rich window has a cited channel', ['W1', 'W2', 'W3', 'W4'].every(id => {
  const w = facts.windows[id];
  return w && (w.outcome === 'opened' ? w.lossChannel === null : CHANNELS_OK(w.lossChannel));
}), 'rich window channel missing');
function CHANNELS_OK(c) {
  return ['veterans', 'armor', 'rerun-escalation', 'mantle-succession', 'other'].includes(c);
}

// E9 — the instrument is read-only: running it must not create/modify repo files.
// (Snapshot mtimes of scripts/ + evidence/2026-10-22 top level around a third run.)
function snapTop(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    try { out[f] = fs.statSync(path.join(dir, f)).mtimeMs; } catch (e) { /* gone */ }
  }
  return out;
}
const before = {
  scripts: snapTop(path.join(__dirname)),
  ev: snapTop(path.join(__dirname, '..', 'evidence', '2026-10-22')),
};
analyze();
const after = {
  scripts: snapTop(path.join(__dirname)),
  ev: snapTop(path.join(__dirname, '..', 'evidence', '2026-10-22')),
};
check('E9 instrument is read-only (no repo writes)', eq(before, after),
  'file mtimes changed under scripts/ or evidence/2026-10-22/');

console.log('\n' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
