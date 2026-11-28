#!/usr/bin/env node
// scripts/test-capstoneready-a.js — proof test, arm sim-capstoneready-a (DIAG).
//
// Proves the capstone-readiness measurement chain on a LIVE loaded game:
//   A. Staged-state snapshot honesty: a fresh village whose wave ledger
//      is staged (real wave-4 kills in the live waveKillLog for living
//      villagers) records a snapshot whose tribute readiness reads
//      ready with veterans/payable exactly as staged — and a
//      scholar-veteran + 1 villager staging reads ready with payable 1
//      and deliverable FALSE (the readiness/delivery split, live).
//      A staged chartered trade link reads charter `scale-short` on a
//      fresh village (sealed > 0, scale village — the scale leg proved
//      live; the national-positive leg is covered by the analyzer
//      selftest on synthetic snapshots). A staged feast-log bundle
//      entry with ladder stage < 3 reads feast `stage-short` (the
//      bundle flag alone never reads ready).
//   B. Driver live run: `capstoneready-driver-a.js --one` on seed
//      113301 (30d, temp OUTDIR) writes a row whose every snapshot
//      carries a complete readiness breakdown (no readinessError),
//      whose seats are valid, and whose analyzer reconciliation is
//      empty.
//   C. Determinism: the same seed run twice writes byte-identical
//      per-seed JSON (no wall-clock/counter leakage in rows).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged ledger
// is a mid-run village's — two living wave-4 veterans, a sealed
// charter, a bundle feast — never a fresh un-geared solo scholar.
// The staging writes the ledger through the live state objects and
// reads it back through the live ladderCapstoneReady() — the
// measurement chain is what's proved, not the ledger itself.
//
// Usage: node scripts/test-capstoneready-a.js
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
const driver = require('./capstoneready-driver-a');
const { reconcileRow, analyzeRow } = require('./analyze-capstoneready-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  // ---- A. Staged-state snapshot honesty (live game, staged ledger) ----
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'capstoneready-unit' });
  check('harness loads', !loadFails || loadFails.length === 0, JSON.stringify(loadFails || []));
  await quietLog(async () => { await setupGame(Game); });

  // Fresh village: all three kinds not-ready, reasons named.
  let s = driver.snap(Game, 0);
  check('snapshot has a readiness breakdown', !!s.readiness && !s.readinessError, s.readinessError || 'no readiness');
  const r0 = s.readiness || {};
  check('fresh tribute not ready (veterans-short)', r0.military_tribute && r0.military_tribute.ready === false && r0.military_tribute.reason === 'veterans-short',
    JSON.stringify(r0.military_tribute));
  check('fresh tribute veterans 0 payable 0 need 2', r0.military_tribute && r0.military_tribute.veterans === 0 && r0.military_tribute.payable === 0 && r0.military_tribute.need === 2,
    JSON.stringify(r0.military_tribute));
  check('fresh tribute not deliverable', r0.military_tribute && r0.military_tribute.deliverable === false);
  check('fresh charter not ready (no-sealed-charter)', r0.trade_charter && r0.trade_charter.ready === false && r0.trade_charter.reason === 'no-sealed-charter',
    JSON.stringify(r0.trade_charter));
  check('fresh feast not ready (no-bundle-feast)', r0.feast_embassy && r0.feast_embassy.ready === false && r0.feast_embassy.reason === 'no-bundle-feast',
    JSON.stringify(r0.feast_embassy));
  check('fresh delivered null', s.delivered === null, 'delivered=' + s.delivered);
  check('fresh seat valid', ['none', 'lesser', 'full'].includes(s.seat), 'seat=' + s.seat);
  console.log(`  INFO fresh stage=${s.stage} rank=${s.rank} ladderPeak=${s.ladderPeak}`);

  // Stage tribute: two living non-scholar villagers with wave-4 kills.
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).filter(v => v !== Game.villagerId);
  check('roster has 2+ non-scholar villagers to stage', roster.length >= 2, 'roster=' + roster.length);
  const vA = roster[0], vB = roster[1];
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  Game.state.waveKillLog.push({ by: vA, w: 4, d: 40 }, { by: vB, w: 4, d: 41 });
  s = driver.snap(Game, 0);
  const rT = s.readiness && s.readiness.military_tribute;
  check('staged tribute ready', rT && rT.ready === true && rT.reason === 'ready', JSON.stringify(rT));
  check('staged tribute veterans 2 payable 2', rT && rT.veterans === 2 && rT.payable === 2, JSON.stringify(rT));
  check('staged tribute deliverable true', rT && rT.deliverable === true, JSON.stringify(rT));

  // Stage the split: scholar-veteran + 1 villager — ready, NOT deliverable.
  Game.state.waveKillLog = [{ by: Game.villagerId, w: 4, d: 40 }, { by: vA, w: 4, d: 41 }];
  s = driver.snap(Game, 0);
  const rS = s.readiness && s.readiness.military_tribute;
  check('split staging ready (scholar counts)', rS && rS.ready === true && rS.reason === 'ready', JSON.stringify(rS));
  check('split staging veterans 2 payable 1', rS && rS.veterans === 2 && rS.payable === 1, JSON.stringify(rS));
  check('split staging deliverable FALSE (the split, live)', rS && rS.deliverable === false, JSON.stringify(rS));
  Game.state.waveKillLog = [];

  // Stage charter: a sealed chartered trade link on a fresh (village-scale) game.
  let charterStaged = false;
  try {
    if (typeof Game.mshipState === 'function') {
      const m = Game.mshipState();
      if (m && Array.isArray(m.links)) {
        m.links.push({ status: 'active', kind: 'trade', chartered: true, a: 'haven', b: 'emberhold' });
        charterStaged = true;
      }
    }
  } catch (e) { charterStaged = false; }
  if (charterStaged) {
    s = driver.snap(Game, 0);
    const rC = s.readiness && s.readiness.trade_charter;
    check('staged charter sealed link counted', rC && rC.charteredLinks === 1, JSON.stringify(rC));
    check('staged charter scale-short on village scale (not ready)', rC && rC.ready === false && rC.reason === 'scale-short',
      JSON.stringify(rC));
    check('staged charter not deliverable', rC && rC.deliverable === false);
    // Remove the staged link so later legs read the fresh state.
    try { const m = Game.mshipState(); m.links = m.links.filter(l => !(l && l.chartered === true && l.kind === 'trade')); } catch (e) {}
  } else {
    check('charter staging available (mshipState links)', false, 'mshipState().links not writable in this harness — negative leg only');
  }

  // Stage feast bundle: bundle flag with ladder stage < 3 reads stage-short, never ready.
  Game.state.feastLog = Game.state.feastLog || [];
  Game.state.feastLog.push({ bundle: true, day: 40, stage: 3 });
  s = driver.snap(Game, 0);
  const rF = s.readiness && s.readiness.feast_embassy;
  check('staged bundle counted', rF && rF.bundle === true, JSON.stringify(rF));
  check('bundle alone never ready (stage-short)', rF && rF.ready === false && rF.reason === 'stage-short', JSON.stringify(rF));
  check('bundle alone not deliverable', rF && rF.deliverable === false);
  Game.state.feastLog = Game.state.feastLog.filter(f => !(f && f.bundle === true));

  // ---- B+C. Driver live run + determinism (child processes, temp dirs) ----
  const tmpA = '/tmp/capstoneready-proof-a';
  const tmpB = '/tmp/capstoneready-proof-b';
  for (const d of [tmpA, tmpB]) { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} }
  const runChild = (outdir) => {
    execFileSync('node', [path.join(REPO, 'scripts', 'capstoneready-driver-a.js'), '--one', '113301'],
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
    const badSeats = (rowA.snapshots || []).filter(x => !['none', 'lesser', 'full'].includes(x.seat));
    check('all snapshot seats valid', badSeats.length === 0, 'bad=' + badSeats.length);
    const kindsOk = (rowA.snapshots || []).every(x => x.readiness && ['military_tribute', 'trade_charter', 'feast_embassy'].every(k => x.readiness[k] && typeof x.readiness[k].ready === 'boolean' && typeof x.readiness[k].reason === 'string'));
    check('all snapshots carry all three kinds well-formed', kindsOk);
    const rec = reconcileRow(rowA);
    check('analyzer reconciliation empty', rec.length === 0, JSON.stringify(rec).slice(0, 400));
    const an = analyzeRow(rowA);
    check('analyzer reads the row', an && an.seed === 113301 && an.perKind && typeof an.perKind.military_tribute.readyDays === 'number', 'seed=' + (an && an.seed));
    check('delivered stays null on leg 1', rowA.end.delivered === null, 'delivered=' + rowA.end.delivered);
    console.log(`  INFO live 30d: days=${rowA.days} endReason=${rowA.endReason} finalSeat=${rowA.end.seat} readyDays=${JSON.stringify(rowA.readyDays)} deliverableDays=${JSON.stringify(rowA.deliverableDays)}`);
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
