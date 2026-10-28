#!/usr/bin/env node
// test-thiefhall-b.js — proof for sim-thiefhall-b
// (prereg: evidence/2026-10-28/sim-thiefhall-b-prereg.md).
//
// Legs (all against the committed corpus, no new sims):
//  T1 corpus completeness: 8 files, 40 tap days, every tap day
//     carries accessBefore + position components + outcome.
//  T2 exhaustive negative: every accessBefore === 'none',
//     37 attempted taps all hall-refused, 0 successes.
//  T3 gate reproduction: the gate as read in code
//     (src/js/game.js havenStoresAccess) reproduces every
//     traced access value from the traced components — 0
//     mismatches. A mismatch would mean the named gate is
//     wrong, and the verdict could not be DIAG-GO.
//  T4 no confounds: ownership 40/40, pantry never empty,
//     exile never true, stage never >= 3.
//  T5 copy-not-modified: the playpath driver carries no
//     trace field (it was copied, not edited in place);
//     the thiefhall driver carries the trace and the
//     single thief key.
//  T6 post-payment refusal: every attempted tap moved
//     ticks/kcal (5 ticks, -120 kcal) before refusing —
//     the button read ok, the tap paid, the impl refused.
//  T7 button-refused taps still carry an access value.
// Exit 0 + PROOF-GREEN iff every leg passes.
// Usage: node scripts/test-thiefhall-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { gateOf } = require('./analyze-thiefhall-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefhall-b-corpus');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}

const files = fs.readdirSync(CORPUS).filter((f) => f.endsWith('.json')).sort();
const instances = files.map((f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
const taps = [];
for (const inst of instances) for (const t of (inst.taps || [])) taps.push({ seed: inst.seed, endReason: inst.endReason, ...t });
const attempted = taps.filter((t) => t.outcome === 'attempted');
const hallLine = (t) => (t.sayWindow || []).some((l) => /The pantry is in the hall\. Your hands are not\./.test(l));

// T1
check('T1 files=8', files.length === 8, 'got ' + files.length);
check('T1 tapDays=40', taps.length === 40, 'got ' + taps.length);
check('T1 all survived', instances.every((i) => i.endReason === 'survived'), instances.map((i) => i.endReason).join(','));
check('T1 every tap has access+position+outcome',
  taps.every((t) => typeof t.accessBefore === 'string' && typeof t.insideHavenBefore === 'boolean' &&
    typeof t.tileTypeBefore === 'string' && typeof t.outcome === 'string' &&
    typeof t.mapPxBefore === 'number' && typeof t.integrationStageBefore === 'number'),
  'bad rows: ' + taps.filter((t) => !(typeof t.accessBefore === 'string' && typeof t.insideHavenBefore === 'boolean')).length);
check('T1 accessAfter present on every attempted tap',
  attempted.every((t) => typeof t.accessAfter === 'string'),
  'missing: ' + attempted.filter((t) => typeof t.accessAfter !== 'string').length);

// T2
check('T2 every accessBefore=none', taps.every((t) => t.accessBefore === 'none'),
  'non-none: ' + taps.filter((t) => t.accessBefore !== 'none').length);
check('T2 attempted=37', attempted.length === 37, 'got ' + attempted.length);
check('T2 all attempted hall-refused', attempted.every((t) => t.tapResult === false && hallLine(t)),
  'non-hall: ' + attempted.filter((t) => !(t.tapResult === false && hallLine(t))).length);
check('T2 succeeded=0', attempted.filter((t) => t.tapResult === true).length === 0);
check('T2 inside=true count=0', taps.filter((t) => t.insideHavenBefore === true).length === 0);
check('T2 havenTileOutside=35', taps.filter((t) => t.tileTypeBefore === 'haven' && t.insideHavenBefore === false).length === 35,
  'got ' + taps.filter((t) => t.tileTypeBefore === 'haven' && t.insideHavenBefore === false).length);

// T3
const mism = taps.filter((t) => gateOf(t) !== t.accessBefore);
check('T3 gate reproduces all 40 access values', mism.length === 0, 'mismatches: ' + JSON.stringify(mism));

// T4
check('T4 ownsThief=40/40', taps.filter((t) => t.ownsThiefBefore === true).length === 40);
check('T4 pantry never empty', taps.every((t) => (t.pantryStacksBefore || 0) > 0 && (t.pantryKcalBefore || 0) > 0));
check('T4 exile never true', taps.filter((t) => t.exiledBefore === true).length === 0,
  'exiled absent(field) on ' + taps.filter((t) => t.exiledBefore === null).length + '/40 — absent reads falsy in the gate, same as false');
check('T4 stage never >=3', taps.every((t) => (t.integrationStageBefore || 0) < 3) && taps.every((t) => t.integrationStageBefore === 0));

// T5
const playpath = fs.readFileSync(path.join(__dirname, 'playpath-spandraw-b.js'), 'utf8');
const thiefhall = fs.readFileSync(path.join(__dirname, 'thiefhall-trace-b.js'), 'utf8');
check('T5 playpath driver unmodified by this arm (no trace field)', !playpath.includes('accessBefore') && !playpath.includes('thiefhall'));
check('T5 thiefhall driver carries the trace', thiefhall.includes('accessBefore') && thiefhall.includes('havenStoresAccess') && thiefhall.includes('insideHavenBefore'));
check('T5 thiefhall driver restricted to the thief key', thiefhall.includes("PREREG_KEYS = ['thief.steal_pantry']"));

// T6
check('T6 every attempted tap paid 5 ticks then refused',
  attempted.every((t) => (t.dayTicksAfter - t.dayTicksBefore) === 5),
  'deltas: ' + [...new Set(attempted.map((t) => t.dayTicksAfter - t.dayTicksBefore))].join(','));
check('T6 every attempted tap paid -120 kcal then refused',
  attempted.every((t) => (t.kcalAfter - t.kcalBefore) === -120),
  'deltas: ' + [...new Set(attempted.map((t) => t.kcalAfter - t.kcalBefore))].join(','));

// T7
const btnRef = taps.filter((t) => t.outcome === 'button-refused');
check('T7 button-refused=3, all carry access=none', btnRef.length === 3 && btnRef.every((t) => t.accessBefore === 'none'),
  'got ' + btnRef.length);

console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
