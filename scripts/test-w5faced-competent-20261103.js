#!/usr/bin/env node
// test-w5faced-competent-20261103.js — proof test for the competent-policy
// wave-5 instrument + analyzer (scripts/w5faced-competent-instrument-20261103.js,
// scripts/w5faced-competent-analyze-20261103.js). Loads the game once
// (seeded harness), installs the instrument, and proves:
//  (1) wrap fire counts increment per wrapper call;
//  (2) synthetic wave-5 spawns carry campaignOnly flags (cancellation
//      false, finale_crew true) — the campaignOnly split;
//  (3) start-row identity is captured BEFORE the wrapped call runs: a
//      stub startCombat that clears pendingMonsterId still leaves the
//      pre-call provenance on the row (the 0815Z post-return-read failure
//      mode, inverted);
//  (4) tbEnd identity is captured BEFORE the wrapped call runs: a stub
//      tbEnd that nulls tbfight still leaves the pre-call fighter
//      snapshot on the row, with a fightSeq join to the start row;
//  (5) the analyzer, run over a two-seed /tmp fixture corpus, reports
//      the campaignOnly split, the tbEnd-join kill, the field vKill, and
//      population rates with denominator = all runs;
//  (6) uninstall restores the original methods.
// No game code is changed, no judged sim is run. Fixtures live in /tmp only.
// Usage: node scripts/test-w5faced-competent-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'w5faced-competent-instrument-20261103'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'competent-w5faced', fullTelemetry: false });
  await setupGame(Game);
  const origTarget = Game.spawnWaveTarget, origCast = Game.castMonster;
  const origSpawn = Game.spawnWorldMonster, origRemove = Game.removeWorldMonster;
  const origStart = Game.startCombat, origTbEnd = Game.tbEnd, origField = Game.fieldFight;
  const inst = INST.install(Game);
  const t = inst.t;

  // (1) wrap counts: one target call -> one row + count 1.
  const pool = Game.monsterWavePool ? Game.monsterWavePool() : Game.data.monsters;
  const target = Game.spawnWaveTarget(pool);
  check('target row recorded', t.targetRows.length === 1, t.targetRows);
  check('target wrap count is 1', t.wrapCounts.target === 1, t.wrapCounts);
  check('target in range', target >= 1 && target <= 5, target);

  // (2) campaignOnly split on synthetic spawns.
  const monA = Game.spawnWorldMonster({ id: 'cancellation' }, 3, 3, { mx: 4, my: 4 });
  const rowA = t.spawnRows[t.spawnRows.length - 1];
  check('cancellation spawn recorded wave 5', rowA && rowA.wave === 5, rowA);
  check('cancellation campaignOnly false', rowA && rowA.campaignOnly === false, rowA);
  check('spawn wrap count incremented', t.wrapCounts.spawn >= 1, t.wrapCounts);
  const monB = Game.spawnWorldMonster({ id: 'finale_crew' }, 2, 2, { mx: 4, my: 4 });
  const rowB = t.spawnRows[t.spawnRows.length - 1];
  check('finale_crew spawn recorded wave 5', rowB && rowB.wave === 5, rowB);
  check('finale_crew campaignOnly true', rowB && rowB.campaignOnly === true, rowB);
  Game.removeWorldMonster(monA);
  Game.removeWorldMonster(monB);
  check('remove rows carry campaignOnly', t.removeRows.length >= 2 &&
    t.removeRows[t.removeRows.length - 1].campaignOnly === true, t.removeRows.slice(-2));

  // (3) start-row pre-call capture, proved against a destructive stub.
  // Replace the wrapped startCombat's underlying original is not possible
  // post-install, so prove the ordering property on a fresh install over
  // stubbed methods instead (see below after uninstall).
  inst.uninstall();
  check('uninstall restores spawnWaveTarget', Game.spawnWaveTarget === origTarget);
  check('uninstall restores startCombat', Game.startCombat === origStart);

  // Fresh install over destructive stubs: the stub clears the very state
  // a post-return reader would need. Pre-call capture must survive it.
  const stubStart = function (mid) { Game.pendingMonsterId = null; Game.pendingEncounter = false; return 'stubbed-start'; };
  const stubTbEnd = function (result) { Game.tbfight = null; return 'stubbed-end'; };
  Game.startCombat = stubStart;
  Game.tbEnd = stubTbEnd;
  const inst2 = INST.install(Game);
  const t2 = inst2.t;
  Game.pendingMonsterId = 'editor';
  Game.pendingEncounter = true;
  const sr = Game.startCombat('editor');
  check('stub startCombat still called through', sr === 'stubbed-start', sr);
  const srow = t2.startRows[t2.startRows.length - 1];
  check('start row keeps pre-call pending provenance', srow && srow.provenance === 'pending:editor', srow);
  check('start row wave is 5', srow && srow.wave === 5, srow);
  check('start wrap count is 1', t2.wrapCounts.start === 1, t2.wrapCounts);
  Game.tbfight = { over: false, fighters: [{ kind: 'monster', mdef: { id: 'editor' }, alive: false, hp: 0 }] };
  const er = Game.tbEnd('won');
  check('stub tbEnd still called through', er === 'stubbed-end', er);
  const erow = t2.tbEndRows[t2.tbEndRows.length - 1];
  check('tbEnd row keeps pre-call fighter snapshot', erow && erow.fighters.length === 1 &&
    erow.fighters[0].id === 'editor' && erow.fighters[0].alive === false, erow);
  check('tbEnd row joins to start row by fightSeq', erow && erow.fightSeq === srow.startSeq, erow);
  check('tbEnd wrap count is 1', t2.wrapCounts.tbEnd === 1, t2.wrapCounts);
  inst2.uninstall();
  check('uninstall restores stub startCombat', Game.startCombat === stubStart);
  Game.startCombat = origStart;
  Game.tbEnd = origTbEnd;

  // (5) analyzer over a /tmp fixture corpus.
  const fixDir = '/tmp/w5faced-competent-fixture';
  fs.mkdirSync(fixDir, { recursive: true });
  const seedA = {
    seed: 98901, days: 90, endReason: 'won', won: true, scaleRank: 'global', maxWave: 5,
    tableLatch: 1, tableWaiting: false, tableDone: true, tableSeat: 'lesser', tablePath: 'feared',
    endGate: { w4: 3, w5: 1 },
    wrapCounts: { target: 40, cast: 5, spawn: 50, trigger: 2, start: 1, tbEnd: 1, field: 1, remove: 3 },
    targetRows: [{ day: 80, target: 5, poolTop: 5, unlocked: 5 }],
    castRows: [], triggerRows: [],
    spawnRows: [
      { day: 80, spawnSeq: 0, id: 'editor', wave: 5, campaignOnly: false, tx: 4, ty: 4, distPlayer: 0, distHome: 0, caller: 'checkEncounter' },
      { day: 81, spawnSeq: 1, id: 'finale_crew', wave: 5, campaignOnly: true, tx: 4, ty: 4, distPlayer: 1, distHome: 0, caller: 'other' },
    ],
    startRows: [{ day: 82, startSeq: 0, id: 'editor', wave: 5, provenance: 'world:editor', pendingLive: false, worldMonsterId: 'editor', feastDrawId: null }],
    tbEndRows: [{ day: 82, result: 'won', monsterId: null, monsterIdReadable: false, fighters: [{ id: 'editor', alive: false, hp: 0 }], fightSeq: 0 }],
    fieldRows: [{ day: 83, vid: 'v1', id: 'rerun', wave: 5, outcome: 'vKill', tx: 4, ty: 4, caller: 'other' }],
    removeRows: [],
    daily: [
      { day: 1, unlocked: 1, standing: 10, poolW5: [], worldW5: [], facedW5: [] },
      { day: 80, unlocked: 5, standing: 250, poolW5: ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'network_note'], worldW5: [], facedW5: [] },
      { day: 90, unlocked: 5, standing: 260, poolW5: ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'network_note'], worldW5: [], facedW5: ['editor', 'rerun'] },
    ],
    instrumentErrors: [],
  };
  const seedB = {
    seed: 98902, days: 60, endReason: 'village-lost', won: false, scaleRank: 'regional', maxWave: 3,
    tableLatch: 0, tableWaiting: false, tableDone: false, tableSeat: null, tablePath: null,
    endGate: { w4: 0, w5: 0 },
    wrapCounts: { target: 20, cast: 2, spawn: 30, trigger: 0, start: 0, tbEnd: 0, field: 0, remove: 1 },
    targetRows: [], castRows: [], triggerRows: [], spawnRows: [],
    startRows: [], tbEndRows: [], fieldRows: [], removeRows: [],
    daily: [
      { day: 1, unlocked: 1, standing: 10, poolW5: [], worldW5: [], facedW5: [] },
      { day: 60, unlocked: 3, standing: 120, poolW5: [], worldW5: [], facedW5: [] },
    ],
    instrumentErrors: [],
  };
  fs.writeFileSync(path.join(fixDir, 'w5-competent-s98901-compdiag.json'), JSON.stringify(seedA));
  fs.writeFileSync(path.join(fixDir, 'w5-competent-s98902-compdiag.json'), JSON.stringify(seedB));
  let ana = '';
  try { ana = execSync('node ' + path.join(REPO, 'scripts', 'w5faced-competent-analyze-20261103.js') + ' ' + fixDir, { encoding: 'utf8' }); }
  catch (e) { ana = (e.stdout || '') + '\n' + (e.stderr || ''); }
  check('analyzer splits fight-candidate from campaignOnly', ana.indexOf('"spawnW5FightCandidate": 1') !== -1 && ana.indexOf('"spawnW5CampaignOnly": 1') !== -1, ana.slice(ana.indexOf('=== AGGREGATE')));
  check('analyzer joins tbEnd kill (fightSeq, pre-call snapshot)', ana.indexOf('"tbKillW5": 1') !== -1, ana.slice(ana.indexOf('=== AGGREGATE')));
  check('analyzer counts field vKill', ana.indexOf('"fieldKillW5": 1') !== -1, ana.slice(ana.indexOf('=== AGGREGATE')));
  check('analyzer population rates use all runs', ana.indexOf('"facedRate": "1/2"') !== -1 && ana.indexOf('"unlockedRate": "1/2"') !== -1, ana.slice(ana.indexOf('=== AGGREGATE')));
  check('analyzer totals wrap counts', ana.indexOf('"target": 60') !== -1, ana.slice(ana.indexOf('=== AGGREGATE')));
  // Cleanup fixture (proof must not leave repo or /tmp corpus behind as judged data).
  try { fs.unlinkSync(path.join(fixDir, 'w5-competent-s98901-compdiag.json')); fs.unlinkSync(path.join(fixDir, 'w5-competent-s98902-compdiag.json')); fs.rmdirSync(fixDir); } catch (e) {}

  // (6) full uninstall restoration.
  check('uninstall restores castMonster', Game.castMonster === origCast);
  check('uninstall restores spawnWorldMonster', Game.spawnWorldMonster === origSpawn);
  check('uninstall restores removeWorldMonster', Game.removeWorldMonster === origRemove);
  check('uninstall restores tbEnd', Game.tbEnd === origTbEnd);
  check('uninstall restores fieldFight', Game.fieldFight === origField);

  console.log(`\n${checks - fails}/${checks} checks passed`);
  if (fails) process.exitCode = 1;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
