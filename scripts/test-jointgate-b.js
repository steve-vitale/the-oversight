#!/usr/bin/env node
// test-jointgate-b.js — proof for sim-jointgate-b.
// Unit cases for the frozen joint definition + fell-target BFS, plus
// corpus checks (completeness, errs 0, tier/canFell agreement,
// determinism byte-identity, tracked-diff guard vs the pinned base).
// Usage: node scripts/test-jointgate-b.js [pilotGuardDir] [pilotOnDir]
//   [confirmGuardDir] [confirmOnDir] [determinismOnDir] — dirs
//   default to the evidence/2026-10-31 jointgate corpora (guard/ON
//   legs live in SEPARATE dirs because the driver writes the same
//   per-seed filename for both legs); missing confirm/determinism
//   dirs are skipped ONLY in pilot stage (JOINTGATE_STAGE=pilot).
// Exit non-zero on any failure. No game code, no policy files touched.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { fellTarget, jointEval } = require('./jointgate-pure-b');
const { censusLeg } = require('./analyze-jointgate-b');

const ROOT = path.join(__dirname, '..');
const PINNED = 'f239efe48e55d937f8da0fb71d8f558d19b32cdd';
const BASE = path.join(ROOT, 'evidence', '2026-10-31');
const STAGE = process.env.JOINTGATE_STAGE || 'full';

let checks = 0, failures = [];
function check(name, cond, extra) {
  checks++;
  if (!cond) failures.push(name + (extra ? ' :: ' + extra : ''));
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- unit: jointEval ----
{
  const j = (o) => jointEval(o);
  check('joint true at boundaries', j({ wood: 3, kcal: 80, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 0 }).joint === true);
  check('joint false kcal 79', j({ wood: 3, kcal: 79, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 0 }).joint === false);
  check('joint false tier whittle', j({ wood: 3, kcal: 200, tier: 'whittle', canFell: false, ticksLeft: 256, walkSteps: 0 }).joint === false);
  check('roomy boundary 232 passes', j({ wood: 3, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 232, walkSteps: 0 }).roomy === true);
  check('roomy boundary 231 fails', j({ wood: 3, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 231, walkSteps: 0 }).roomy === false);
  check('roomy with walk steps at boundary', j({ wood: 3, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 24 }).roomy === true); // 256-24-96-40=96
  check('roomy with walk steps projected', j({ wood: 3, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 24 }).projected === 96);
  check('roomy with walk steps over boundary fails', j({ wood: 3, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 25 }).roomy === false);
  check('pack-ready joint null', j({ wood: 4, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: 0 }).joint === null);
  check('pack-ready needsWood false', j({ wood: 4, kcal: 0, tier: 'none', canFell: false, ticksLeft: 128, walkSteps: 0 }).needsWood === false);
  check('no-target roomy null', j({ wood: 2, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: null }).roomy === null);
  check('no-target joint false', j({ wood: 2, kcal: 200, tier: 'fell', canFell: true, ticksLeft: 256, walkSteps: null }).joint === false);
  check('tier/canFell agree fell', j({ wood: 2, kcal: 0, tier: 'fell', canFell: true, ticksLeft: 128, walkSteps: 0 }).tierCanFellAgree === true);
  check('tier/canFell disagree flagged', j({ wood: 2, kcal: 0, tier: 'fell', canFell: false, ticksLeft: 128, walkSteps: 0 }).tierCanFellAgree === false);
  check('fed boundary 80', j({ wood: 2, kcal: 80, tier: 'none', canFell: false, ticksLeft: 128, walkSteps: 0 }).fed === true);
}

// ---- unit: fellTarget ----
{
  const blank = Array.from({ length: 9 }, () => Array(9).fill('grass'));
  const never = () => false;
  check('fellTarget empty null', fellTarget(blank, [4, 4], never) === null);
  check('fellTarget out-of-bounds null', fellTarget(blank, [9, 9], never) === null);
  const g1 = blank.map((r) => r.slice()); g1[4][5] = 'bigtree';
  const t1 = fellTarget(g1, [4, 4], never);
  check('fellTarget adjacent bigtree pathLen 0', t1 && t1.pathLen === 0 && t1.target.x === 5 && t1.target.y === 4);
  const g2 = blank.map((r) => r.slice()); g2[4][6] = 'tree'; g2[6][4] = 'bigtree';
  // Both stances at distance 1 (adjacent cells (5,4)/(4,5) resp.): tie -> bigtree wins.
  const t2 = fellTarget(g2, [4, 4], never);
  check('fellTarget bigtree tie-break', t2 && t2.target.cell === 'bigtree');
  const g3 = blank.map((r) => r.slice()); g3[0][0] = 'tree'; g3[0][8] = 'tree';
  const t3 = fellTarget(g3, [4, 4], never);
  check('fellTarget row-major tie', t3 && t3.target.x === 0 && t3.target.y === 0);
  const wall = (c) => c === 'wall';
  const g4 = blank.map((r) => r.slice());
  for (let y = 0; y < 9; y++) g4[y][5] = 'wall';
  g4[4][6] = 'tree';
  const t4 = fellTarget(g4, [4, 4], wall);
  check('fellTarget wall-unreachable null', t4 === null);
}

// ---- corpus checks ----
function corpusChecks(dir, label) {
  if (!fs.existsSync(dir)) {
    if (STAGE === 'pilot' && (label.startsWith('confirm') || label.startsWith('determinism'))) { console.log('skip ' + label + ' (pilot stage)'); return null; }
    check(label + ' dir exists', false, dir);
    return null;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  check(label + ' has files', files.length > 0, dir);
  const legs = [];
  for (const f of files) {
    let inst;
    try { inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { check(label + ' parses ' + f, false, String(e)); continue; }
    check(label + ' errs 0 ' + f, inst.errCount === 0, 'errCount=' + inst.errCount);
    check(label + ' wc errs 0 ' + f, inst.woodcarryStore && inst.woodcarryStore.errs === 0);
    check(label + ' ww errs 0 ' + f, inst.warmthStore && inst.warmthStore.errs === 0);
    check(label + ' mornings = evenings - 1 ' + f, inst.mornings.length === inst.evenings.length - 1,
      'm=' + inst.mornings.length + ' e=' + inst.evenings.length);
    check(label + ' spawn present ' + f, !!inst.spawn && !!inst.spawn.inv && inst.spawn.stash !== undefined);
    const leg = censusLeg(inst);
    legs.push(leg);
    check(label + ' strand mornings complete ' + f, leg.incomplete === 0, 'incomplete=' + leg.incomplete);
    for (const r of leg.rows) {
      check(label + ' tier/canFell agree ' + f + ' L' + r.loopDay, r.tierCanFellAgree !== false);
    }
  }
  return legs;
}

const pilotGuardDir = process.argv[2] || path.join(BASE, 'sim-jointgate-b-corpus-pilot-guard');
const pilotOnDir = process.argv[3] || path.join(BASE, 'sim-jointgate-b-corpus-pilot-on');
const confirmGuardDir = process.argv[4] || path.join(BASE, 'sim-jointgate-b-corpus-confirm-guard');
const confirmOnDir = process.argv[5] || path.join(BASE, 'sim-jointgate-b-corpus-confirm-on');
const detDir = process.argv[6] || path.join(BASE, 'sim-jointgate-b-corpus-determinism');
corpusChecks(pilotGuardDir, 'pilot-guard');
corpusChecks(pilotOnDir, 'pilot-on');
corpusChecks(confirmGuardDir, 'confirm-guard');
corpusChecks(confirmOnDir, 'confirm-on');
corpusChecks(detDir, 'determinism');

// Determinism byte-identity: determinism ON file vs pilot ON file
// (same per-seed filename, distinct dirs).
if (fs.existsSync(pilotOnDir) && fs.existsSync(detDir)) {
  const dFiles = fs.readdirSync(detDir).filter((f) => f.endsWith('.json')).sort();
  check('determinism has files', dFiles.length > 0);
  for (const f of dFiles) {
    const p = path.join(pilotOnDir, f);
    if (fs.existsSync(p)) {
      const a = fs.readFileSync(p, 'utf8'), b = fs.readFileSync(path.join(detDir, f), 'utf8');
      check('determinism byte-identical ' + f, a === b);
    } else {
      check('determinism pilot counterpart exists ' + f, false, p);
    }
  }
}

// Tracked-diff guard: src/ + scripts/policies/ unchanged vs pinned base.
try {
  const out = execSync('git diff --name-only ' + PINNED + ' -- src scripts/policies', { cwd: ROOT, encoding: 'utf8' }).trim();
  check('tracked-diff guard src/policies empty', out === '', out);
  const out2 = execSync('git diff --name-only -- src scripts/policies', { cwd: ROOT, encoding: 'utf8' }).trim();
  check('worktree-diff guard src/policies empty', out2 === '', out2);
} catch (e) {
  check('tracked-diff guard runs', false, String(e && e.message));
}

console.log('jointgate proof: ' + checks + ' checks, ' + failures.length + ' failures');
if (failures.length) { for (const f of failures) console.log('FAIL: ' + f); process.exit(1); }
console.log('jointgate proof: PASS');
