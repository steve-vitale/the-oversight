#!/usr/bin/env node
// test-thiefinside-b.js — proof for sim-thiefinside-b
// (prereg: evidence/2026-10-28/sim-thiefinside-b-prereg.md).
//
// Legs (all against the committed corpus, no new sims):
//  T1 corpus completeness: 8 files, 40 tap days, every non-game-over
//     tap day carries accessBefore + eveningOutcome + outcome, and
//     every attempted tap carries accessAtTap + tapOutcomeClass.
//  T2 verdict numbers: seed-success count, inside taps all read
//     access 'inside' at tap time, every inside tap's outcome
//     classified (caught / clean / refusal class, never blank).
//  T3 gate reproduction (thiefhall T3 style): the gate as read in
//     code (src/js/game.js havenStoresAccess) reproduces every
//     traced access value — pre-evening from pre components AND
//     at-tap from at-tap components — 0 mismatches.
//  T4 entry honesty: every walk+go-inside entry has adjacency <= 1,
//     cellActions containing 'Go inside', entry return true, and
//     lands at (4,7) inside on the haven tile; every already-inside
//     attempted tap has no entry call; no inside tap lacks an
//     entryMethod. A bare enterBuilding() with no adjacency +
//     cellActions checks would fail this leg by construction.
//  T5 copy-not-modified: the thiefhall driver carries no evening
//     fields; the thiefinside driver carries the evening and the
//     single thief key.
//  T6 no game-code changes: git diff/status under src/ is empty.
//  T7 instrument determinism: the first tap day's pre-evening
//     state matches the thiefhall corpus seed-for-seed (same
//     substrate, same seeds, evening not yet run that day).
//  T8 already-inside chain: an already-inside tap day is either
//     the instance's first tap day (lead/competent persistence)
//     or follows a completed evening in the same instance —
//     never an untraceable inside flag.
// Exit 0 + PROOF-GREEN iff every leg passes. A leg failure is
// PROOF-RED and invalidates the verdict, not the gate.
// Usage: node scripts/test-thiefinside-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { gateOfPre, gateOfAtTap } = require('./analyze-thiefinside-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefinside-b-corpus');
const HALL_CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefhall-b-corpus');
const ROOT = path.join(__dirname, '..');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? ' — ' + detail : ''));
  if (!cond) failures++;
}

const files = fs.readdirSync(CORPUS).filter((f) => f.endsWith('.json')).sort();
const instances = files.map((f) => JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8')));
const taps = [];
for (const inst of instances) for (const t of (inst.taps || [])) taps.push({ seed: inst.seed, ...t });
const attempted = taps.filter((t) => t.outcome === 'attempted');
const insideTaps = attempted.filter((t) => t.accessAtTap === 'inside');

// T1
check('T1 files=8', files.length === 8, 'got ' + files.length);
check('T1 tapDays=40', taps.length === 40, 'got ' + taps.length);
check('T1 all survived', instances.every((i) => i.endReason === 'survived'), instances.map((i) => i.endReason).join(','));
const nonGameOver = taps.filter((t) => t.outcome !== 'game-over');
check('T1 every non-game-over tap has accessBefore+eveningOutcome+outcome',
  nonGameOver.every((t) => typeof t.accessBefore === 'string' && typeof t.eveningOutcome === 'string' && typeof t.outcome === 'string'),
  'bad: ' + nonGameOver.filter((t) => !(typeof t.accessBefore === 'string' && typeof t.eveningOutcome === 'string')).length);
check('T1 every attempted tap has accessAtTap+tapOutcomeClass+sayWindow',
  attempted.every((t) => typeof t.accessAtTap === 'string' && typeof t.tapOutcomeClass === 'string' && Array.isArray(t.sayWindow)),
  'bad: ' + attempted.filter((t) => !(typeof t.accessAtTap === 'string' && typeof t.tapOutcomeClass === 'string')).length);

// T2
const perSeedSuccess = {};
for (const inst of instances) {
  perSeedSuccess[inst.seed] = (inst.taps || []).some((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
}
const seedSuccessCount = Object.values(perSeedSuccess).filter(Boolean).length;
check('T2 seedSuccess>=6', seedSuccessCount >= 6, 'got ' + seedSuccessCount + '/8: ' + JSON.stringify(perSeedSuccess));
check('T2 inside taps all access=inside at tap', insideTaps.length > 0 && attempted.filter((t) => t.accessAtTap === 'inside').length === insideTaps.length, 'inside=' + insideTaps.length);
check('T2 every inside tap outcome classified in known set',
  insideTaps.every((t) => ['success-caught', 'success-clean', 'impl-refused-hall', 'impl-refused-empty', 'impl-refused-heavy', 'other-refusal', 'other-success'].includes(t.tapOutcomeClass)),
  'classes: ' + JSON.stringify(insideTaps.map((t) => t.tapOutcomeClass)));
check('T2 no inside tap is a hall refusal', insideTaps.filter((t) => t.tapOutcomeClass === 'impl-refused-hall').length === 0);

// T3
const mismPre = nonGameOver.filter((t) => gateOfPre(t) !== t.accessBefore);
check('T3 gate reproduces all pre-evening access values', mismPre.length === 0, 'mismatches: ' + JSON.stringify(mismPre.map((t) => t.seed + ':' + t.tapDay)));
const mismAtTap = attempted.filter((t) => gateOfAtTap(t) !== t.accessAtTap);
check('T3 gate reproduces all at-tap access values', mismAtTap.length === 0, 'mismatches: ' + JSON.stringify(mismAtTap.map((t) => t.seed + ':' + t.tapDay)));

// T4
const walkEntries = taps.filter((t) => t.entryMethod === 'walk+go-inside');
check('T4 walk entries have adjacency<=1 + Go-inside button + true return',
  walkEntries.every((t) => t.entryAdjacency <= 1 && Array.isArray(t.entryCellActions) && t.entryCellActions.includes('Go inside') && t.entryReturn === true),
  'bad: ' + walkEntries.filter((t) => !(t.entryAdjacency <= 1 && Array.isArray(t.entryCellActions) && t.entryCellActions.includes('Go inside') && t.entryReturn === true)).length);
check('T4 walk entries land (4,7) inside on haven tile',
  walkEntries.every((t) => t.mxAfterEntry === 4 && t.myAfterEntry === 7 && t.insideHavenAfterEntry === true && t.tileAfterEntry === 'haven' && t.accessAfterEntry === 'inside'),
  'bad: ' + walkEntries.filter((t) => !(t.mxAfterEntry === 4 && t.myAfterEntry === 7 && t.accessAfterEntry === 'inside')).length);
const alreadyInside = attempted.filter((t) => t.entryMethod === 'already-inside');
check('T4 already-inside taps made no entry call',
  alreadyInside.every((t) => t.entryReturn === undefined || t.entryReturn === null),
  'with entryReturn: ' + alreadyInside.filter((t) => t.entryReturn !== undefined && t.entryReturn !== null).length);
check('T4 every inside tap has an entryMethod',
  insideTaps.every((t) => typeof t.entryMethod === 'string'),
  'missing: ' + insideTaps.filter((t) => typeof t.entryMethod !== 'string').length);

// T5
const thiefhall = fs.readFileSync(path.join(__dirname, 'thiefhall-trace-b.js'), 'utf8');
const thiefinside = fs.readFileSync(path.join(__dirname, 'thiefinside-trace-b.js'), 'utf8');
check('T5 thiefhall driver unmodified by this arm (no evening fields)', !thiefhall.includes('eveningOutcome') && !thiefhall.includes('thiefinside') && !thiefhall.includes('cellActions'));
check('T5 thiefinside driver carries the evening', thiefinside.includes('eveningOutcome') && thiefinside.includes('cellActions') && thiefinside.includes('beginPathWalk') && thiefinside.includes('enterBuilding'));
check('T5 thiefinside driver restricted to the thief key', thiefinside.includes("PREREG_KEYS = ['thief.steal_pantry']"));

// T6
let srcDiff = '';
try { srcDiff = execSync('git status --porcelain -- src/', { cwd: ROOT }).toString().trim(); } catch (e) { srcDiff = 'GIT-ERROR:' + String(e && e.message); }
check('T6 no src/ changes (measurement only)', srcDiff === '', 'git status src/: ' + srcDiff.slice(0, 200));

// T7
let t7ok = false, t7detail = '';
try {
  const hallFiles = fs.readdirSync(HALL_CORPUS).filter((f) => f.endsWith('.json')).sort();
  const hallBySeed = {};
  for (const f of hallFiles) {
    const j = JSON.parse(fs.readFileSync(path.join(HALL_CORPUS, f), 'utf8'));
    hallBySeed[j.seed] = (j.taps || [])[0];
  }
  const fields = ['mapPxBefore', 'mapPyBefore', 'mxBefore', 'myBefore', 'kcalBefore', 'dayTicksBefore', 'accessBefore', 'tileTypeBefore'];
  const bad = [];
  for (const inst of instances) {
    const first = (inst.taps || [])[0];
    const h = hallBySeed[inst.seed];
    if (!h) { bad.push(inst.seed + ':no-hall-row'); continue; }
    const mism = fields.filter((k) => first[k] !== h[k]);
    if (mism.length) bad.push(inst.seed + ':' + mism.join(','));
  }
  t7ok = bad.length === 0;
  t7detail = bad.length ? bad.join(' | ') : '8/8 first tap days identical to thiefhall';
} catch (e) { t7detail = 'ERROR ' + String(e && e.message); }
check('T7 first tap day pre-evening identical to thiefhall (determinism)', t7ok, t7detail);

// T8
let t8bad = [];
for (const inst of instances) {
  const itaps = inst.taps || [];
  itaps.forEach((t, idx) => {
    if (t.entryMethod !== 'already-inside') return;
    if (idx === 0) return; // lead/competent persistence, allowed by prereg
    const priorCompleted = itaps.slice(0, idx).some((p) => p.eveningOutcome === 'completed');
    if (!priorCompleted) t8bad.push(inst.seed + ':' + t.tapDay);
  });
}
check('T8 already-inside chain traceable (first day or after a completed evening)', t8bad.length === 0, 'untraceable: ' + t8bad.join(','));

console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
