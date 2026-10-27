#!/usr/bin/env node
// scripts/test-fullseatfixture-a.js — proof for sim-fullseatfixture-a
// (flesh-out loop, axis scale-onramp): the fullseat-diag TEST mock
// fixture must agree with the real deedGateReady() scale gate.
//
// Steve ruling 2026-10-27: the full seat requires national standing —
// deedGateReady() ok includes scale (national/global). The scalegate
// run fixed ONE fixture (superset test, nationalLive); this arm closes
// the named next blank: the fullseat-diag TEST's mockGame gate, which
// computed old-ok from the deed bars alone (no scale term), so a
// regional village meeting every bar read as full-seat-ready in the
// mock while the real gate said lesser.
//
// Method (no fixture proven from a copy of itself):
//  - The mock's ok expression is EXTRACTED from the file under test
//    (working copy = NEW) and from git HEAD text (OLD), by paren-depth
//    scan, then evaluated on the SAME fixture inputs.
//  - The real gate is exercised on a REAL loaded Game (godpath/lib
//    harness, seed 7, same bar-setting method as test-scalegate-a.js).
//  - Judged assertions are on the NEW formula + the real gate. The OLD
//    leg is a demonstration: run before the fix commit it shows the
//    trap (regional true); after the fix commit, HEAD text IS the fixed
//    text, so the OLD leg reads the fixed formula — the pre-commit trap
//    demonstration is recorded in evidence/2026-10-27/
//    sim-fullseatfixture-a.md, not re-proven by re-running.
//
// Fixture villages (all full-seat bars met, only rank varies):
//   regional: waves 5/6/4/3/2, contests 4, crises 3, stage 3,
//     sentiment + surge true, rank regional.
//   national / global / village: same bars, rank varied.
//
// Usage: node scripts/test-fullseatfixture-a.js
// Exit 0 only if every judged assertion passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const K = require('./godpath/lib');

const REPO = path.join(__dirname, '..');
const DIAG_TEST = path.join(REPO, 'scripts', 'test-fullseat-diag-20261021.js');

// Extract the mock gate's ok expression from file text by paren scan.
function extractOkExpr(text) {
  const marker = 'ok: !!(';
  const start = text.indexOf(marker);
  if (start < 0) throw new Error('mock ok expression not found in file text');
  let i = start + marker.length, depth = 1;
  while (i < text.length && depth > 0) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') depth--;
    i++;
  }
  if (depth !== 0) throw new Error('unbalanced parens in mock ok expression');
  return text.slice(start + marker.length, i - 1);
}
function evalOk(expr, f) {
  return !!new Function('f', 'return !!(' + expr + ')')(f);
}

const REGIONAL = { w1: 5, w2: 6, w3: 4, w4: 3, w5: 2, contests: 4, crises: 3, stage: 3, sentiment: true, surge: true, rank: 'regional' };
const NATIONAL = Object.assign({}, REGIONAL, { rank: 'national' });
const GLOBAL = Object.assign({}, REGIONAL, { rank: 'global' });
const VILLAGE = Object.assign({}, REGIONAL, { rank: 'village' });

(async () => {
  const T = K.reporter('test-fullseatfixture-a');

  // ---- File-text legs: OLD (git HEAD) vs NEW (working copy) ----
  const newText = fs.readFileSync(DIAG_TEST, 'utf8');
  let oldText = null;
  try { oldText = execFileSync('git', ['show', 'HEAD:scripts/test-fullseat-diag-20261021.js'], { cwd: REPO, encoding: 'utf8' }); }
  catch (e) { oldText = null; }
  const newExpr = extractOkExpr(newText);
  T.ok('new file: mock ok expression extracts', !!newExpr);
  T.ok('new file: mock ok carries the scale term (national/global rank)',
    /f\.rank === 'national'/.test(newExpr) && /f\.rank === 'global'/.test(newExpr), newExpr);
  T.ok('new file: mock comment cites the 2026-10-27 scale ruling',
    /2026-10-27/.test(newText) && /scale/.test(newText));
  T.ok('new mock formula: regional all-bars village -> ok FALSE', evalOk(newExpr, REGIONAL) === false);
  T.ok('new mock formula: national all-bars village -> ok TRUE', evalOk(newExpr, NATIONAL) === true);
  T.ok('new mock formula: global all-bars village -> ok TRUE', evalOk(newExpr, GLOBAL) === true);
  T.ok('new mock formula: village all-bars village -> ok FALSE', evalOk(newExpr, VILLAGE) === false);
  if (oldText) {
    const oldExpr = extractOkExpr(oldText);
    const oldRegional = evalOk(oldExpr, REGIONAL);
    const oldNational = evalOk(oldExpr, NATIONAL);
    // Demonstration only (see header): pre-commit this prints the trap
    // (old regional TRUE); post-commit HEAD is the fixed text.
    console.log('  INFO old-formula (HEAD text) regional=' + oldRegional + ' national=' + oldNational
      + (oldText === newText ? ' (HEAD == working copy: fix already committed)' : ' (HEAD differs: pre-fix text)'));
    if (oldText !== newText) {
      T.ok('DEMONSTRATED TRAP (pre-fix HEAD text): old mock ok TRUE for regional all-bars village',
        oldRegional === true);
    }
  } else {
    console.log('  INFO old-formula leg skipped: git show HEAD failed');
  }

  // ---- Instrument comment leg (doc-only, no behavior) ----
  const diagText = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'fullseat-diag.js'), 'utf8');
  T.ok('fullseat-diag instrument: stale "NOT gating" claim removed',
    !/REPORTED but NOT gating/.test(diagText));
  T.ok('fullseat-diag instrument: header cites the 2026-10-27 ruling',
    /2026-10-27/.test(diagText) && /scale IS enforced/.test(diagText));

  // ---- Superset test leg (file-text: fixture already fixed by scalegate) ----
  const supText = fs.readFileSync(path.join(REPO, 'scripts', 'test-fullseat-superset-20261014.js'), 'utf8');
  T.ok('superset test: full-seat assertion fixture sets nationalLive',
    /nationalLive = true/.test(supText) && /stage 2 \+ food deeds \+ bars -> full/.test(supText));

  // ---- Real-gate legs (real loaded Game, no stubs) ----
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const byWave = {};
  for (const m of Game.data.monsters || []) (byWave[m.wave || 1] = byWave[m.wave || 1] || []).push(m.id);
  const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
  const d = Game.deedState();
  for (const w of Object.keys(need)) for (const id of byWave[w].slice(0, need[w])) d.wavesFaced[id] = +w;
  d.contestsSurvived = 3;
  const pg = Game.progState();
  pg.crises = { a: 1, b: 1, c: 1 };
  pg.sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 45;
  T.ok('setup: integration stage 2', Game.integrationStage() === 2);
  function setRank(rank) {
    Game.state.networkLive = false;
    Game.state.nationalLive = false;
    Game.state.globalLive = false;
    if (rank === 'regional') Game.state.networkLive = true;
    if (rank === 'national') Game.state.nationalLive = true;
    if (rank === 'global') Game.state.globalLive = true;
  }
  setRank('regional');
  T.ok('setup: scaleRank regional', Game.scaleRank() === 'regional');
  let g = Game.deedGateReady();
  T.ok('real gate regional: all non-scale bars pass', !!(g.waves && g.contests && g.crises && g.stageOk && g.foodDeeds), JSON.stringify(g));
  T.ok('real gate regional: ok FALSE', g.ok === false);
  T.ok('real gate regional: seat lesser (downgrade, not loss)', Game.tableSeat().seat === 'lesser');
  T.ok('mock agrees with real on regional (both false)',
    evalOk(newExpr, REGIONAL) === false && g.ok === false);
  setRank('national');
  T.ok('setup: scaleRank national', Game.scaleRank() === 'national');
  g = Game.deedGateReady();
  T.ok('real gate national: ok TRUE', g.ok === true);
  T.ok('real gate national: seat full', Game.tableSeat().seat === 'full');
  T.ok('mock agrees with real on national (both true)',
    evalOk(newExpr, NATIONAL) === true && g.ok === true);
  T.done();
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
