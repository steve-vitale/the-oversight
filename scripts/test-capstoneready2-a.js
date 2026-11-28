#!/usr/bin/env node
// scripts/test-capstoneready2-a.js — proof test, arm sim-capstoneready-a leg 2.
//
// Proves the delivery-verb measurement chain on a LIVE loaded game:
//   A. Staged-state delivery honesty: a fresh village whose wave ledger
//      is staged (real wave-4 kills in the live waveKillLog for two
//      living non-scholar villagers) — the policy's tryDeliverTribute
//      delivers: returns ok:true, pg.ladderCapstone ===
//      'military_tribute', BOTH veterans off the roster (payment
//      verified live), attempt logged with day + veterans. A second
//      call delivers nothing (already delivered). A scholar-veteran +
//      1 villager staging delivers NOTHING (the split: ready but not
//      deliverable — zero attempts logged, delivered stays null).
//   B. Driver live run: `capstoneready2-driver-a.js --one` on seed
//      113301 (30d, temp OUTDIR) writes a row whose every snapshot
//      carries a complete readiness breakdown (no readinessError),
//      whose seats are valid, whose deliveryAttempts is empty (no
//      delivery before day 94 on this seed), and whose analyzer
//      reconciliation is empty.
//   C. Determinism: the same seed run twice writes byte-identical
//      per-seed JSON (no wall-clock/counter leakage in rows).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged ledger
// is a mid-run village's — two living wave-4 veterans — never a
// fresh un-geared solo scholar. The staging writes the ledger through
// the live state objects and reads it back through the live
// ladderCapstoneReady()/ladderDeliverCapstone() — the measurement
// chain is what's proved, not the ledger itself.
//
// Usage: node scripts/test-capstoneready2-a.js
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
const driver = require('./capstoneready2-driver-a');
const policy = require('./policies/competent-capstonedeliver-a');
const { reconcileRow, analyzeRow } = require('./analyze-capstoneready2-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- A. Staged-state delivery honesty (live game, staged ledger) ----
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'capstoneready2-unit' });
  check('harness loads', !loadFails || loadFails.length === 0, JSON.stringify(loadFails || []));
  await quietLog(async () => { await setupGame(Game); });

  policy.resetDeliveryAttempts();

  // Fresh village: no attempt (not ready).
  let attempt = policy.tryDeliverTribute(Game);
  check('fresh village: no delivery attempt', attempt === null, JSON.stringify(attempt));
  check('fresh village: attempt log empty', policy.deliveryAttempts.length === 0, 'n=' + policy.deliveryAttempts.length);
  check('fresh village: delivered null', (typeof Game.ladderCapstoneDelivered === 'function' ? Game.ladderCapstoneDelivered() : 'missing') === null);

  // Stage tribute: two living non-scholar villagers with wave-4 kills.
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).filter(v => v !== Game.villagerId);
  check('roster has 2+ non-scholar villagers to stage', roster.length >= 2, 'roster=' + roster.length);
  const vA = roster[0], vB = roster[1];
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: vA, w: 4, d: 40 }, { by: vB, w: 4, d: 41 });
  const readBefore = Game.ladderCapstoneReady('military_tribute');
  check('staged tribute deliverable before the call', readBefore && readBefore.ready === true && (readBefore.payable | 0) >= 2, JSON.stringify(readBefore));
  attempt = policy.tryDeliverTribute(Game);
  check('staged tribute: delivery returns ok:true', attempt && attempt.ok === true, JSON.stringify(attempt));
  check('staged tribute: attempt logged with the paid veterans', attempt && Array.isArray(attempt.veterans) && attempt.veterans.length === 2, JSON.stringify(attempt));
  const pg = Game.progState();
  check('staged tribute: pg.ladderCapstone recorded', pg && pg.ladderCapstone === 'military_tribute', 'capstone=' + (pg && pg.ladderCapstone));
  check('staged tribute: pg.ladderCapstoneDay recorded', pg && typeof pg.ladderCapstoneDay === 'number', 'day=' + (pg && pg.ladderCapstoneDay));
  const rosterAfter = ((Game.state && Game.state.village && Game.state.village.roster) || []);
  check('staged tribute: both veterans off the roster (payment landed)', rosterAfter.indexOf(vA) < 0 && rosterAfter.indexOf(vB) < 0,
    `vA on roster=${rosterAfter.indexOf(vA) >= 0} vB on roster=${rosterAfter.indexOf(vB) >= 0}`);
  check('staged tribute: driver paymentVerified reads true', driver.paymentVerified(Game) === true);
  check('staged tribute: snapshot delivered reads military_tribute', driver.snap(Game, 0).delivered === 'military_tribute');
  // A second call delivers nothing (already delivered).
  const second = policy.tryDeliverTribute(Game);
  check('second call: no delivery (already delivered)', second === null, JSON.stringify(second));
  check('second call: attempt log still has exactly 1 entry', policy.deliveryAttempts.length === 1, 'n=' + policy.deliveryAttempts.length);

  // Fresh village again (new load): the split — scholar-veteran + 1 villager.
  const { Game: Game2 } = await loadGame({ seed: 8, mode: 'capstoneready2-unit2' });
  await quietLog(async () => { await setupGame(Game2); });
  policy.resetDeliveryAttempts();
  const roster2 = ((Game2.state && Game2.state.village && Game2.state.village.roster) || []).filter(v => v !== Game2.villagerId);
  check('split village: roster has 1+ non-scholar villager', roster2.length >= 1, 'roster=' + roster2.length);
  Game2.state.waveKillLog = Game2.state.waveKillLog || [];
  Game2.state.waveKillLog.push({ by: Game2.villagerId, w: 4, d: 40 }, { by: roster2[0], w: 4, d: 41 });
  const readSplit = Game2.ladderCapstoneReady('military_tribute');
  check('split staging ready but payable 1', readSplit && readSplit.ready === true && readSplit.payable === 1, JSON.stringify(readSplit));
  const splitAttempt = policy.tryDeliverTribute(Game2);
  check('split staging: NO delivery attempt (not deliverable)', splitAttempt === null, JSON.stringify(splitAttempt));
  check('split staging: attempt log empty', policy.deliveryAttempts.length === 0, 'n=' + policy.deliveryAttempts.length);
  check('split staging: delivered stays null', Game2.ladderCapstoneDelivered() === null);
  check('split staging: both villagers still on the roster', ((Game2.state.village.roster) || []).indexOf(roster2[0]) >= 0);

  // ---- B+C. Driver live run + determinism (child processes, temp dirs) ----
  const tmpA = '/tmp/capstoneready2-proof-a';
  const tmpB = '/tmp/capstoneready2-proof-b';
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
  const runChild = (outdir) => {
    execFileSync('node', [path.join(REPO, 'scripts', 'capstoneready2-driver-a.js'), '--one', '113301'],
      { cwd: REPO, env: Object.assign({}, process.env, { DAYS: '30', OUTDIR: outdir, SEEDS: '113301' }), stdio: 'pipe', timeout: 600000 });
  };
  let rowA = null, rowB = null, bytesA = null, bytesB = null;
  try {
    runChild(tmpA);
    bytesA = fs.readFileSync(path.join(tmpA, 's113301.json'));
    rowA = JSON.parse(bytesA.toString('utf8'));
    runChild(tmpB);
    bytesB = fs.readFileSync(path.join(tmpB, 's113301.json'));
    rowB = JSON.parse(bytesB.toString('utf8'));
  } catch (e) {
    check('driver --one runs (30d)', false, String((e && e.message) || e).slice(0, 200));
  }
  if (rowA) {
    check('driver row has snapshots', Array.isArray(rowA.snapshots) && rowA.snapshots.length >= 25, 'n=' + (rowA.snapshots || []).length);
    const complete = (rowA.snapshots || []).filter(x => x.readiness && !x.readinessError).length;
    check('every snapshot carries complete readiness', complete === (rowA.snapshots || []).length, `complete=${complete}/${(rowA.snapshots || []).length}`);
    check('no readiness errors', (rowA.readinessErrors | 0) === 0, 'readinessErrors=' + rowA.readinessErrors);
    check('no gate errors', (rowA.gateErrors | 0) === 0, 'gateErrors=' + rowA.gateErrors);
    check('no driver errors', (rowA.errors || []).length === 0, JSON.stringify(rowA.errors || []));
    check('no delivery attempts in 30d (first ready day 94)', (rowA.deliveryAttempts || []).length === 0, JSON.stringify(rowA.deliveryAttempts || []));
    check('delivered stays null in 30d', rowA.end.delivered === null, 'delivered=' + rowA.end.delivered);
    check('paymentVerified null with no delivery', rowA.paymentVerified === null, 'paymentVerified=' + rowA.paymentVerified);
    const rec = reconcileRow(rowA);
    check('analyzer reconciliation empty', rec.length === 0, JSON.stringify(rec).slice(0, 400));
    const an = analyzeRow(rowA);
    check('analyzer reads the row', an && an.seed === 113301 && Array.isArray(an.deliveryAttempts), 'seed=' + (an && an.seed));
    console.log(`  INFO live 30d: days=${rowA.days} endReason=${rowA.endReason} finalSeat=${rowA.end.seat} readyDays=${JSON.stringify(rowA.readyDays)} deliverableDays=${JSON.stringify(rowA.deliverableDays)} attempts=${(rowA.deliveryAttempts || []).length}`);
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
