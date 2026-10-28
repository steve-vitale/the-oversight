#!/usr/bin/env node
// test-thiefinside-confirm-b.js — confirm-band check for
// sim-thiefinside-b (addendum:
// evidence/2026-10-28/sim-thiefinside-b-confirm-prereg.md).
// Same legs as scripts/test-thiefinside-b.js, minus T7
// (thiefhall determinism cannot apply to fresh seeds with no
// thiefhall row): completeness, verdict numbers, gate
// reproduction, entry honesty, no src/ changes, already-inside
// chain. Exit 0 + CONFIRM-PROOF-GREEN iff every leg passes.
// Usage: node scripts/test-thiefinside-confirm-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { gateOfPre, gateOfAtTap } = require('./analyze-thiefinside-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefinside-b-confirm-corpus');
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

check('C1 files=16', files.length === 16, 'got ' + files.length);
check('C1 tapDays=80', taps.length === 80, 'got ' + taps.length);
const nonGameOver = taps.filter((t) => t.outcome !== 'game-over');
check('C1 every non-game-over tap has accessBefore+eveningOutcome+outcome',
  nonGameOver.every((t) => typeof t.accessBefore === 'string' && typeof t.eveningOutcome === 'string' && typeof t.outcome === 'string'),
  'bad: ' + nonGameOver.filter((t) => !(typeof t.accessBefore === 'string' && typeof t.eveningOutcome === 'string')).length);
check('C1 every attempted tap has accessAtTap+tapOutcomeClass',
  attempted.every((t) => typeof t.accessAtTap === 'string' && typeof t.tapOutcomeClass === 'string'),
  'bad: ' + attempted.filter((t) => !(typeof t.accessAtTap === 'string' && typeof t.tapOutcomeClass === 'string')).length);

const perSeedSuccess = {};
for (const inst of instances) {
  perSeedSuccess[inst.seed] = (inst.taps || []).some((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
}
const seedSuccessCount = Object.values(perSeedSuccess).filter(Boolean).length;
check('C2 seedSuccess>=12', seedSuccessCount >= 12, 'got ' + seedSuccessCount + '/16: ' + JSON.stringify(perSeedSuccess));
check('C2 inside taps all access=inside at tap', insideTaps.length > 0 && insideTaps.every((t) => t.accessAtTap === 'inside'), 'inside=' + insideTaps.length);
check('C2 every inside tap outcome classified',
  insideTaps.every((t) => ['success-caught', 'success-clean', 'impl-refused-hall', 'impl-refused-empty', 'impl-refused-heavy', 'other-refusal', 'other-success'].includes(t.tapOutcomeClass)));
check('C2 no inside tap is a hall refusal', insideTaps.filter((t) => t.tapOutcomeClass === 'impl-refused-hall').length === 0);

const mismPre = nonGameOver.filter((t) => gateOfPre(t) !== t.accessBefore);
check('C3 gate reproduces all pre-evening access values', mismPre.length === 0, JSON.stringify(mismPre.map((t) => t.seed + ':' + t.tapDay)));
const mismAtTap = attempted.filter((t) => gateOfAtTap(t) !== t.accessAtTap);
check('C3 gate reproduces all at-tap access values', mismAtTap.length === 0, JSON.stringify(mismAtTap.map((t) => t.seed + ':' + t.tapDay)));

const walkEntries = taps.filter((t) => t.entryMethod === 'walk+go-inside');
check('C4 walk entries have adjacency<=1 + Go-inside button + true return',
  walkEntries.every((t) => t.entryAdjacency <= 1 && Array.isArray(t.entryCellActions) && t.entryCellActions.includes('Go inside') && t.entryReturn === true),
  'bad: ' + walkEntries.filter((t) => !(t.entryAdjacency <= 1 && Array.isArray(t.entryCellActions) && t.entryCellActions.includes('Go inside') && t.entryReturn === true)).length);
check('C4 walk entries land (4,7) inside on haven tile',
  walkEntries.every((t) => t.mxAfterEntry === 4 && t.myAfterEntry === 7 && t.insideHavenAfterEntry === true && t.tileAfterEntry === 'haven' && t.accessAfterEntry === 'inside'));
const alreadyInside = attempted.filter((t) => t.entryMethod === 'already-inside');
check('C4 already-inside taps made no entry call',
  alreadyInside.every((t) => t.entryReturn === undefined || t.entryReturn === null));
check('C4 every inside tap has an entryMethod',
  insideTaps.every((t) => typeof t.entryMethod === 'string'));

let srcDiff = '';
try { srcDiff = execSync('git status --porcelain -- src/', { cwd: ROOT }).toString().trim(); } catch (e) { srcDiff = 'GIT-ERROR:' + String(e && e.message); }
check('C6 no src/ changes (measurement only)', srcDiff === '', 'git status src/: ' + srcDiff.slice(0, 200));

let t8bad = [];
for (const inst of instances) {
  const itaps = inst.taps || [];
  itaps.forEach((t, idx) => {
    if (t.entryMethod !== 'already-inside') return;
    if (idx === 0) return;
    const priorCompleted = itaps.slice(0, idx).some((p) => p.eveningOutcome === 'completed');
    if (!priorCompleted) t8bad.push(inst.seed + ':' + t.tapDay);
  });
}
check('C8 already-inside chain traceable', t8bad.length === 0, 'untraceable: ' + t8bad.join(','));

console.log(failures === 0 ? 'CONFIRM-PROOF-GREEN' : 'CONFIRM-PROOF-RED (' + failures + ' failures)');
process.exit(failures === 0 ? 0 : 1);
