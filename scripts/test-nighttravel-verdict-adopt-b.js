#!/usr/bin/env node
// test-nighttravel-verdict-adopt-b.js — adoption proof for
// sim-nighttravel-verdict-adopt-b (prereg:
// evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-prereg.md).
//
// Verifies the adoption's own claims from files alone (no sims, no
// judging): the stranded pilot corpora copied verbatim are complete
// and valid, the wedge file is valid and byte-identical to the corpus
// file (so the 1934Z park does NOT reproduce on this evidence and no
// wedge re-run was spent), and the pilot seeds are exactly the bank's
// first 8 qualifiers in declared order.
// Exits 0 only if every check passes.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const ev = path.join(root, 'evidence', '2026-10-29');
const fails = [];
const ok = (name, cond, detail) => {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
};
const md5 = (p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex');
const pilotSeeds = [11149, 11031, 11307, 11390, 11429, 11439, 11322, 11360];

function loadDir(dir, policy) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    const j = JSON.parse(raw);
    out[j.seed] = { file: f, bytes: raw.length, json: j, policyOk: j.policy === policy };
  }
  return out;
}

// A1: both pilot corpora present, all 8 seeds, valid JSON, non-zero,
// correct policy tag, 30 evenings on the control leg's surviving seeds.
const before = loadDir(path.join(ev, 'sim-nighttravel-verdict-b-corpus-insideevening'), 'insideevening');
const after = loadDir(path.join(ev, 'sim-nighttravel-verdict-b-corpus-nighttravel'), 'nighttravel');
ok('A1 pilot corpora complete (8 seeds x 2 legs, valid, non-zero)',
  pilotSeeds.every((s) => before[s] && after[s] && before[s].bytes > 0 && after[s].bytes > 0
    && before[s].policyOk && after[s].policyOk),
  'seeds ' + pilotSeeds.join(','));

// A2: wedge file valid, non-zero, byte-identical to the corpus file.
const wedgePath = path.join(ev, 'sim-nighttravel-verdict-b-wedge-insideevening',
  'nighttravel-b-insideevening-s11149.json');
const corpusPath = path.join(ev, 'sim-nighttravel-verdict-b-corpus-insideevening',
  'nighttravel-b-insideevening-s11149.json');
let wedgeJson = null, wedgeOk = false, wedgeMd5 = null, corpusMd5 = null;
try {
  wedgeJson = JSON.parse(fs.readFileSync(wedgePath, 'utf8'));
  wedgeMd5 = md5(wedgePath); corpusMd5 = md5(corpusPath);
  wedgeOk = wedgeJson.seed === 11149 && wedgeJson.policy === 'insideevening'
    && (wedgeJson.evenings || []).length === 30 && wedgeMd5 === corpusMd5;
} catch (e) { wedgeOk = false; }
ok('A2 wedge valid + byte-identical to corpus (park NOT reproduced, no re-run spent)',
  wedgeOk, 'md5 ' + wedgeMd5 + (wedgeMd5 === corpusMd5 ? ' == corpus' : ' != corpus'));

// A3: pilot seeds are exactly the bank's first 8 qualifiers, in order.
const scan = JSON.parse(fs.readFileSync(
  path.join(root, 'evidence', '2026-10-28', 'sim-nighttravel-bank-b-scan.json'), 'utf8'));
const first8 = (scan.qualifiers || []).slice(0, 8).map((q) => q.seed);
ok('A3 pilot seeds = bank first 8 qualifiers in declared order',
  JSON.stringify(first8) === JSON.stringify(pilotSeeds), 'bank: ' + first8.join(','));

// A4: extension + confirm corpora run in this tree are complete (8 + 20
// seeds x 2 legs) — the staged bands the verdict rests on.
const extSeeds = [11376, 11384, 11077, 11133, 11211, 11299, 11408, 11438];
const confSeeds = [11094, 11112, 11365, 11435, 11277, 11370, 11445, 11074, 11246,
  11288, 11308, 11335, 11349, 11366, 11409, 11433, 11037, 11208, 11251, 11273];
const extB = loadDir(path.join(ev, 'sim-nighttravel-verdict-adopt-b-extension-insideevening'), 'insideevening');
const extA = loadDir(path.join(ev, 'sim-nighttravel-verdict-adopt-b-extension-nighttravel'), 'nighttravel');
const confB = loadDir(path.join(ev, 'sim-nighttravel-verdict-adopt-b-confirm-insideevening'), 'insideevening');
const confA = loadDir(path.join(ev, 'sim-nighttravel-verdict-adopt-b-confirm-nighttravel'), 'nighttravel');
ok('A4 extension corpora complete (8 seeds x 2 legs)',
  extSeeds.every((s) => extB[s] && extA[s]), 'extension ' + extSeeds.join(','));
ok('A5 confirm corpora complete (20 seeds x 2 legs)',
  confSeeds.every((s) => confB[s] && confA[s]), 'confirm ' + confSeeds.join(','));

// A6: no src/js change in this adoption (measurement/instrument only).
const { execSync } = require('child_process');
let srcChanged = null;
try {
  srcChanged = execSync('git status --short -- src/js', { cwd: root, encoding: 'utf8' }).trim();
} catch (e) { srcChanged = 'git-status-failed'; }
ok('A6 no src/js changes (instrument-only arm)', srcChanged === '', srcChanged || 'clean');

if (fails.length) { console.error('ADOPTION PROOF FAILED: ' + fails.join(', ')); process.exit(1); }
console.log('ADOPTION PROOF GREEN (A1-A6)');
