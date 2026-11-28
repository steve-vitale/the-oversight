#!/usr/bin/env node
// scripts/test-scalecensus-a.js — proof test, arm sim-scalecensus-a (DIAG).
//
// Proves the scale-leg seat-bar measurement chain on a LIVE loaded game:
//   A. Staged-state snapshot honesty: a fresh village whose deed ledger
//      is staged (real monster ids per wave, real contests/crises
//      fields, sentimentTaught) records a snapshot whose gate
//      breakdown matches the staged ledger exactly, and the analyzer
//      names the binding bars off that live snapshot.
//   B. Driver live run: `scalecensus-driver-a.js --one` on seed 113101
//      (30d, temp OUTDIR) writes a row whose every snapshot carries
//      a gate (no gateError), whose seats are valid, and whose
//      analyzer reconciliation is empty.
//   C. Determinism: the same seed run twice writes byte-identical
//      per-seed JSON (no wall-clock/counter leakage in rows).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged ledger
// is a mid-run village's — wave 1-3 fights faced at the LESSER bars,
// 2 contests, 2 crises, sentiment taught — never a fresh un-geared
// solo scholar. The staging writes the ledger through the live
// deedState()/progState() objects and reads it back through the
// live deedGateReady()/tableSeat() — the measurement chain is what's
// proved, not the ledger itself.
//
// Usage: node scripts/test-scalecensus-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (child runs use temp OUTDIRs under
// /tmp, cleaned up after); prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const driver = require('./scalecensus-driver-a');
const { bindingBars, lesserUnmet, reconcileRow, analyzeRow } = require('./analyze-scalecensus-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- A. Staged-state snapshot honesty (live game, staged ledger) ----
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'scalecensus-unit' });
  check('harness loads', !loadFails || loadFails.length === 0, JSON.stringify(loadFails || []));
  await quietLog(async () => { await setupGame(Game); });

  // Stage the ledger: lesser wave bars (w1=4, w2=4, w3=3), 2 contests,
  // 2 crises, sentiment taught. Real monster ids from src/data/monsters.json.
  const deeds = Game.deedState();
  deeds.wavesFaced = {
    bulldozer: 1, hushwolf: 1, gallowdeer: 1, mirrormoth: 1,
    voice_mimic_radio: 2, mirror_stag: 2, review_drone: 2, bright_idea: 2,
    redactor: 3, gavel: 3, focus_group: 3,
  };
  deeds.contestsSurvived = 2;
  const pg = Game.progState();
  pg.crises = { firstGrave: 1, famine: 1 };
  pg.sentimentTaught = true;

  const s = driver.snap(Game, 0);
  check('snapshot has a gate', !!s.gate && !s.gateError, s.gateError || 'no gate');
  check('gate w1/w2/w3 match staged ledger', s.gate && s.gate.w1 === 4 && s.gate.w2 === 4 && s.gate.w3 === 3,
    s.gate ? `w1=${s.gate.w1} w2=${s.gate.w2} w3=${s.gate.w3}` : 'no gate');
  check('gate w4/w5 are 0', s.gate && s.gate.w4 === 0 && s.gate.w5 === 0);
  check('gate contestsN/crisesN match staged ledger', s.gate && s.gate.contestsN === 2 && s.gate.crisesN === 2,
    s.gate ? `contestsN=${s.gate.contestsN} crisesN=${s.gate.crisesN}` : 'no gate');
  check('gate foodDeeds true (sentiment taught)', s.gate && s.gate.foodDeeds === true);
  check('gate waves false (4/4/3 short of 5/5/4)', s.gate && s.gate.waves === false);
  check('seat is a valid value', ['none', 'lesser', 'full'].includes(s.seat), 'seat=' + s.seat);
  check('seat is none (village scale, no ladder peak)', s.seat === 'none', 'seat=' + s.seat);
  console.log(`  INFO staged stage=${s.stage} rank=${s.rank} ladderPeak=${s.ladderPeak} capstone=${s.capstone}`);

  const bb = bindingBars(s.gate, s.ladderPeak, s.capstone);
  check('binding bars include waves', bb.includes('waves'), JSON.stringify(bb));
  check('binding bars include contests', bb.includes('contests'), JSON.stringify(bb));
  check('binding bars include crises', bb.includes('crises'), JSON.stringify(bb));
  check('binding bars include scale', bb.includes('scale'), JSON.stringify(bb));
  check('binding bars include ladderPeak3', bb.includes('ladderPeak3'), JSON.stringify(bb));
  check('binding bars include capstone', bb.includes('capstone'), JSON.stringify(bb));
  check('binding bars exclude foodDeeds', !bb.includes('foodDeeds'), JSON.stringify(bb));
  const lu = lesserUnmet(s.gate, s.ladderPeak);
  check('lesser unmet excludes w1_4/contests2/foodDeeds', !lu.includes('w1_4') && !lu.includes('contests2') && !lu.includes('foodDeeds'), JSON.stringify(lu));
  check('lesser unmet includes scaleRegional + ladderPeak1', lu.includes('scaleRegional') && lu.includes('ladderPeak1'), JSON.stringify(lu));

  // ---- B+C. Driver live run + determinism (child processes, temp dirs) ----
  const tmpA = '/tmp/scalecensus-proof-a';
  const tmpB = '/tmp/scalecensus-proof-b';
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
  const runChild = (outdir) => {
    execFileSync('node', [path.join(REPO, 'scripts', 'scalecensus-driver-a.js'), '--one', '113101'],
      { cwd: REPO, env: Object.assign({}, process.env, { DAYS: '30', OUTDIR: outdir, SEEDS: '113101' }), stdio: 'pipe', timeout: 600000 });
  };
  let rowA = null, rowB = null, bytesA = null, bytesB = null;
  try {
    runChild(tmpA);
    bytesA = fs.readFileSync(path.join(tmpA, 's113101.json'));
    rowA = JSON.parse(bytesA.toString('utf8'));
    runChild(tmpB);
    bytesB = fs.readFileSync(path.join(tmpB, 's113101.json'));
    rowB = JSON.parse(bytesB.toString('utf8'));
  } catch (e) {
    check('driver --one runs (30d)', false, String((e && e.message) || e).slice(0, 200));
  }
  if (rowA) {
    check('driver row has snapshots', Array.isArray(rowA.snapshots) && rowA.snapshots.length >= 25, 'n=' + (rowA.snapshots || []).length);
    const gated = (rowA.snapshots || []).filter(x => x.gate).length;
    check('every snapshot carries a gate', gated === (rowA.snapshots || []).length, `gated=${gated}/${(rowA.snapshots || []).length}`);
    check('no gate errors', (rowA.gateErrors | 0) === 0, 'gateErrors=' + rowA.gateErrors);
    check('no driver errors', (rowA.errors || []).length === 0, JSON.stringify(rowA.errors || []));
    const badSeats = (rowA.snapshots || []).filter(x => !['none', 'lesser', 'full'].includes(x.seat));
    check('all snapshot seats valid', badSeats.length === 0, 'bad=' + badSeats.length);
    const rec = reconcileRow(rowA);
    check('analyzer reconciliation empty', rec.length === 0, JSON.stringify(rec));
    const an = analyzeRow(rowA);
    check('analyzer reads the row', an && an.seed === 113101 && Array.isArray(an.bindingBars), 'seed=' + (an && an.seed));
    console.log(`  INFO live 30d: days=${rowA.days} endReason=${rowA.endReason} finalSeat=${rowA.end.seat} finalGateOk=${rowA.end.gate ? rowA.end.gate.ok : null} binding=${JSON.stringify(an.bindingBars)}`);
  }
  if (bytesA && bytesB) {
    check('determinism: same seed twice byte-identical', bytesA.equals(bytesB), `lenA=${bytesA.length} lenB=${bytesB.length}`);
  } else {
    check('determinism: same seed twice byte-identical', false, 'missing row bytes');
  }
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }

  console.log(`RESULT: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('FAILURES: ' + fails.join('; ')); process.exit(1); }
}
main().catch(e => { console.error('PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
