#!/usr/bin/env node
// test-fellrepeat-a.js — proof for sim-fellrepeat-a (DIAG).
// Unit cases for the refusal counting rules + corpus checks over the
// judged legs + tracked-diff guard vs the pinned game base.
// Usage: node scripts/test-fellrepeat-a.js [corpus-guard corpus-on corpus-determinism]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { strandRuns, morningTable } = require('./analyze-fellrepeat-a');

const ROOT = path.join(__dirname, '..');
const FELL_REFUSAL_RE = /can't fell|need an axe to fell/i;
const FELL_SUCCESS_RE = /comes down with a crack/i;
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function countRefusals(lines) {
  return lines.filter((l) => FELL_REFUSAL_RE.test(l)).length;
}

// --- Unit: counting rules (mirrors the driver's regexes) ---
const GIANT = "Your Stone knife can't fell a giant — it takes branches, not trunks. You need an axe.";
const THIS = "Your Stone knife can't fell this — it takes branches, not trunks. You need an axe.";
const NONE = 'You need an axe to fell this giant.';
const SUCCESS = 'The big tree comes down with a crack that echoes. +5 wood.';
check('3x giant line counts 3', countRefusals([GIANT, GIANT, GIANT, 'You forage.']) === 3);
check('single giant line counts 1', countRefusals([GIANT]) === 1);
check('this-variant counts', countRefusals([THIS]) === 1);
check('tier-none variant counts', countRefusals([NONE]) === 1);
check('line matching both patterns counts once', countRefusals([GIANT]) === 1);
check('success line is not a refusal', countRefusals([SUCCESS]) === 0);
check('success pattern counts success', [SUCCESS].filter((l) => FELL_SUCCESS_RE.test(l)).length === 1);
check('unrelated wood lines do not count', countRefusals(['You lash logs together.', 'The pack holds 3 logs.']) === 0);
check('case-insensitive', countRefusals(["Your stone knife CAN'T FELL a giant."]) === 1);
check('empty transcript counts 0', countRefusals([]) === 0);

// --- Unit: strand extraction ---
check('strandRuns groups consecutive still days', JSON.stringify(strandRuns([
  { loopDay: 7, woodcarry: { bucket: 'creek', rescued: false } },
  { loopDay: 8, woodcarry: { bucket: 'creek', rescued: false } },
  { loopDay: 10, woodcarry: { bucket: 'creek', rescued: false } },
  { loopDay: 11, woodcarry: { bucket: 'creek', rescued: true } },
]).runs) === '[[7,8],[10]]');
check('morningTable includes named days even outside strand', (() => {
  const inst = {
    evenings: [7, 8, 9, 10, 11, 12, 13, 14].map((d) => ({
      loopDay: d, prevEveningStillCreek: d === 8,
      woodcarry: { bucket: 'home', rescued: false },
      fellRefusalCount: 0, fellSuccessCount: 0, fellRefusalLines: [],
    })),
    mornings: [],
  };
  const t = morningTable(inst);
  return t.map((r) => r.loopDay).join(',') === '8,10,12,14';
})());

// --- Corpus checks (only when dirs are given) ---
const dirs = process.argv.slice(2);
if (dirs.length >= 2) {
  const [guardDir, onDir, detDir] = dirs;
  for (const [label, dir] of [['guard', guardDir], ['on', onDir]]) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    check(label + ': 15215 file present', files.some((f) => f.includes('s15215')));
    for (const f of files) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      check(label + ' ' + f + ': rows carry fell counts', inst.evenings.every((e) => typeof e.fellRefusalCount === 'number' && typeof e.fellSuccessCount === 'number'));
      check(label + ' ' + f + ': refusal lines match count', inst.evenings.every((e) => (e.fellRefusalLines || []).length === e.fellRefusalCount));
      check(label + ' ' + f + ': refusal lines match patterns', inst.evenings.every((e) => (e.fellRefusalLines || []).every((l) => FELL_REFUSAL_RE.test(l))));
      check(label + ' ' + f + ': every strand morning has transcript', (() => {
        const t = morningTable(inst);
        return t.every((r) => r.transcriptStored || r.fellRefusalCount === 0);
      })());
      check(label + ' ' + f + ': store errs 0', ((inst.woodcarryStore && inst.woodcarryStore.errs) || 0) === 0);
    }
    const inst15215 = JSON.parse(fs.readFileSync(path.join(dir, files.find((f) => f.includes('s15215'))), 'utf8'));
    const t = morningTable(inst15215);
    check(label + ': 15215 table covers days 10/12/14', [10, 12, 14].every((d) => t.some((r) => r.loopDay === d)));
    check(label + ': 15215 table covers every strand morning', (() => {
      const { still } = strandRuns(inst15215.evenings);
      // Strand mornings = loop-days after a still evening (within the run).
      return still.every((d) => t.some((r) => r.loopDay === d + 1) || d + 1 > inst15215.evenings.length);
    })());
  }
  if (detDir) {
    const a = fs.readFileSync(path.join(onDir, 'fellrepeat-a-nighttravel-s15215.json'), 'utf8');
    const b = fs.readFileSync(path.join(detDir, 'fellrepeat-a-nighttravel-s15215.json'), 'utf8');
    check('determinism: 15215 ON re-run byte-identical', a === b);
  }
}

// --- Tracked-diff guard: no src/js or scripts/policies change vs pinned game base ---
// Pinned game base = parent of the prereg commit (prereg adds only itself).
const PINNED_GAME_BASE = '3c03d468b';
try {
  const diff = execSync('git diff --name-only ' + PINNED_GAME_BASE + ' -- src scripts/policies', { cwd: ROOT }).toString().trim();
  check('tracked-diff vs pinned game base: src/ + scripts/policies/ empty', diff === '', diff);
} catch (e) { check('tracked-diff guard runs', false, e.message); }

console.log(`test-fellrepeat-a: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
