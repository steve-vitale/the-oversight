#!/usr/bin/env node
// test-rosterlot-20261031.js — sim-rosterlot-a proof test.
// Pure-function pins + pool scans + live determinism leg. Writes
// ONLY to /tmp (never into the repo). Usage:
//   node scripts/test-rosterlot-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'rosterlot-analyze-20261031'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 0.00005); }

// --- 1. combatOcc regex: delegate.js verbatim, incl. edge cases ---
check('combatOcc firefighter', AN.combatOcc('firefighter') === true);
check('combatOcc police officer', AN.combatOcc('police officer') === true);
check('combatOcc infantry soldier', AN.combatOcc('infantry soldier') === true);
check('combatOcc night security guard', AN.combatOcc('night security guard') === true);
check('combatOcc hunter literal', AN.combatOcc('hunter') === true);
check('combatOcc hunting guide NEGATIVE (edge case)', AN.combatOcc('hunting guide') === false);
check('combatOcc farmer negative', AN.combatOcc('farmer') === false);
check('combatOcc wild food forager negative', AN.combatOcc('wild food forager') === false);
check('combatOcc trail crew lead negative', AN.combatOcc('trail crew lead') === false);
check('combatOcc marine biologist (regex arm, no pool occ)', AN.combatOcc('marine biologist') === true);
check('combatOcc empty', AN.combatOcc('') === false);
check('combatOcc null', AN.combatOcc(null) === false);

// --- 2. Wilson interval pins (z=1.96, independently computed) ---
(function () {
  const w1424 = AN.wilson(14, 24);
  check('wilson 14/24', approx(w1424[0], 0.3883, 0.0001) && approx(w1424[1], 0.7553, 0.0001), w1424);
  const w08 = AN.wilson(0, 8);
  check('wilson 0/8', approx(w08[0], 0, 0.0001) && approx(w08[1], 0.3244, 0.0001), w08);
  const w88 = AN.wilson(8, 8);
  check('wilson 8/8', approx(w88[0], 0.6756, 0.0001) && approx(w88[1], 1, 0.0001), w88);
  check('wilson monotone', AN.wilson(6, 8)[0] > AN.wilson(0, 8)[0] && AN.wilson(6, 8)[1] > AN.wilson(0, 8)[1]);
})();

// --- 3. Naive-draw expectation pins ---
(function () {
  const e = AN.naiveExpectation();
  check('expectation gen part', approx(e.gen, 0.7630, 0.0001), e.gen);
  check('expectation bg part', approx(e.bg, 0.7777, 0.0001), e.bg);
  check('expectation product', approx(e.product, 0.5934, 0.0001), e.product);
  check('comb sanity', AN.comb(5, 2) === 10 && AN.comb(78, 0) === 1);
})();

// --- 4. analyzeSeed on a synthetic shape + contrast seed ---
(function () {
  const shape = { seed: 1, rosterN: 12, askableN: 11, generatedN: 6, backgroundN: 6,
    askableHolders: [], fullHolders: [], playerIsCombat: false, shape85107: true,
    personMissingN: 0, nonzeroKillsN: 0, errors: [], trapKnowledgeAskable: [],
    members: [{ vid: 'a', isScholar: false, source: 'generated', name: 'X', occ: 'farmer', combatOcc: false, knowsSnare: true, knowsPit: false, kills: null }] };
  const r = AN.analyzeSeed(shape);
  check('analyzeSeed shape', r.shape85107 === true && r.holdersAskable === 0 && r.trapAskableN === 0);
  const contra = JSON.parse(JSON.stringify(shape));
  contra.askableHolders = [{ vid: 'b', occ: 'Firefighter', source: 'generated' }];
  contra.fullHolders = contra.askableHolders;
  contra.shape85107 = false;
  const r2 = AN.analyzeSeed(contra);
  check('analyzeSeed contrast', r2.shape85107 === false && r2.holdersAskable === 1);
})();

// --- 5. Pool scans: the prereg's "exactly 4 combat occupations" claim ---
(function () {
  const cg = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'characterGen.json'), 'utf8'));
  const genCombat = (cg.occupations || []).filter(o => AN.combatOcc(String(o.name || '').toLowerCase()));
  check('generated pool combat occs == 4', genCombat.length === 4, genCombat.map(o => o.name));
  check('generated pool combat names', JSON.stringify(genCombat.map(o => String(o.name).toLowerCase()).sort()) ===
    JSON.stringify(['firefighter', 'infantry soldier', 'night security guard', 'police officer']));
  const trapOccs = (cg.occupations || []).filter(o => o.knowsSnare || o.knowsPit).map(o => o.id).sort();
  check('generated trap-knowledge occs == 9', trapOccs.length === 9, trapOccs);
  const bg = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'background_survivors.json'), 'utf8'));
  const bgCombat = bg.filter(b => AN.combatOcc(String(b.formerOccupation || '').toLowerCase()));
  check('background pool combat seeds == 4', bgCombat.length === 4, bgCombat.map(b => b.formerOccupation));
})();

// --- 6. Live determinism leg: seed 85201 re-run in a FRESH process ---
(function () {
  const tmpDir = '/tmp/rosterlot-proof-' + process.pid;
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    execSync('SEEDS=85201 EVID=' + tmpDir + ' node scripts/rosterlot-sweep-20261031.js', { cwd: REPO, stdio: 'pipe', timeout: 120000 });
    const fresh = JSON.parse(fs.readFileSync(path.join(tmpDir, 's85201.json'), 'utf8'));
    const committed = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-31', 'perseed-rosterlot-a', 's85201.json'), 'utf8'));
    check('live determinism roster identical', JSON.stringify(fresh.roster) === JSON.stringify(committed.roster));
    check('live determinism scholar identical', fresh.scholarId === committed.scholarId);
    check('live determinism members identical', JSON.stringify(fresh.members) === JSON.stringify(committed.members));
    check('live determinism shape identical', fresh.shape85107 === committed.shape85107 && fresh.shape85107 === true);
    check('live roster size 12 askable 11', fresh.rosterN === 12 && fresh.askableN === 11);
    check('live errors 0 missing 0', fresh.errors.length === 0 && fresh.personMissingN === 0);
  } catch (e) {
    check('live determinism leg ran', false, String((e && e.message) || e));
  }
})();

console.log(`\nrosterlot proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
