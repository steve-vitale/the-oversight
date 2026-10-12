#!/usr/bin/env node
// PROOF TEST: wave bar counting audit (longsim wave lever r6, 2026-10-12).
// Steve's standing law (2026-10-11 22:06): wave unlocks count villager
// experiences alongside the player's, definitions not weakened.
// This test pins the per-wave bar-counting contract:
//
//   1. Each wave's unlock bar reads ONLY waveLedgerPoints(w) vs
//      barsPerWave[w] (kills only) — plus the day/scale floors, which never
//      read killer identity either.
//   2. Killer-blindness (structural): recordWaveKill / scoreLedgerKill /
//      waveLedgerPoints / unlockedWave contain no killer branching
//      (comment-stripped source scan).
//   3. Behavioral: interleaved "villager-channel" and "player-channel" kills
//      score identically; perTypeCap is shared per TYPE, not per killer
//      (no double allowance — a villager kill and a player kill of one type
//      share the cap of 2).
//   4. The counter bonus is killer-blind: a counter-known kill scores 2
//      whether the village or the player earned it.
//   5. Villager kills ALONE can unlock a wave: w1 bar filled purely by
//      "villager" kills at day >= 8 -> unlockedWave() >= 2.
//   6. LEDGER-ANNOUNCE HONESTY (fix this run): the full-beat gate sentence
//      names the day floor only when it's still in the future. Bar fills
//      after the floor passed -> no stale "opens once day N passes"
//      (the unlock beat fires in the same stack). Bar fills before the
//      floor -> the honest future gate is still named.
//
// The kill channels themselves (TB, patrol/wild/expedition field fights,
// aid, contests) were audited in test-wave-kill-channels-20261012.js —
// every channel funnels through recordWaveKill, which takes only a
// monsterId. This test proves what that funnel guarantees per wave.
//
// Green across 3 seeds: SEED=1/2/3 node scripts/test-wave-bar-counting-20261012.js
'use strict';
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '20261012', 10);

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

const stripComments = (src) => String(src || '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1');

(async () => {
  const { Game } = await H.loadGame({ seed: SEED });
  await H.setupGame(Game);
  console.log('== WAVE BAR COUNTING AUDIT, SEED ' + SEED + ' ==');

  const resetLedger = () => { Game.state.waveLedger = null; Game.ledgerState(); Game.state._ledgerAnn50 = {}; Game.state._ledgerAnnFull = {}; };
  const cfg = Game.waveLedgerCfg();

  // ---- 1. bars match canon ----
  ok('bar w1 = 5 (canon: 5 wave-1 points -> wave 2)', cfg.barsPerWave[1] === 5);
  ok('bar w2 = 4 (canon: 4 wave-2 points -> wave 3)', cfg.barsPerWave[2] === 4);
  ok('bar w3 = 4 (canon: 4 wave-3 points -> wave 4)', cfg.barsPerWave[3] === 4);
  ok('bar w4 = 3 (canon: 3 wave-4 points -> wave 5)', cfg.barsPerWave[4] === 3);
  ok('floors: wave2DayFloor=8, dayFloor=25', cfg.wave2DayFloor === 8 && cfg.dayFloor === 25);

  // ---- 2. killer-blindness, structural ----
  const DENY = ['killer', 'killerId', 'villagerId', 'isPlayer', 'playerKill', 'villKill', 'byPlayer', 'byVillager'];
  for (const fn of ['recordWaveKill', 'scoreLedgerKill', 'waveLedgerPoints', 'unlockedWave']) {
    const src = stripComments(Game[fn].toString());
    const hits = DENY.filter(t => new RegExp('\\b' + t + '\\b').test(src));
    ok(fn + ' has no killer branching', hits.length === 0, 'found: ' + hits.join(','));
  }

  // ---- 3. behavioral: channels score identically, cap shared ----
  resetLedger();
  Game.state.monsterCounters = {};
  // "villager channel" then "player channel" — the API takes only monsterId,
  // so attribution is by call-site; the ledger must not distinguish.
  Game.recordWaveKill('bulldozer'); // villager
  ok('villager-channel kill scores 1', Game.waveLedgerPoints(1) === 1);
  Game.recordWaveKill('bulldozer'); // player
  ok('player-channel kill scores 1 (cap now full for bulldozer)', Game.waveLedgerPoints(1) === 2);
  const before = Game.waveLedgerPoints(1);
  Game.recordWaveKill('bulldozer'); // villager, third of type
  ok('third kill of type scores 0 — cap shared, not per killer', Game.waveLedgerPoints(1) === before);

  // ---- 4. counter bonus killer-blind ----
  resetLedger();
  Game.state.monsterCounters = { heckler: true }; // village knows the trick
  Game.recordWaveKill('heckler'); // villager kill, counter known
  ok('counter-known villager kill scores 2', Game.waveLedgerPoints(2) === 2,
    'got ' + Game.waveLedgerPoints(2));
  resetLedger();
  Game.state.monsterCounters = {}; // unknown
  Game.recordWaveKill('heckler'); // player kill, counter unknown
  ok('counter-unknown kill scores 1 (never punished)', Game.waveLedgerPoints(2) === 1);

  // ---- 5. villager kills alone unlock wave 2 ----
  resetLedger();
  Game.state.monsterCounters = {};
  Game.state.scholar.day = 30;
  Game.state._waveAnnounced = 1;
  for (const id of ['bulldozer', 'bulldozer', 'hummice', 'hummice', 'voice_mimic_radio']) {
    // voice_mimic_radio is wave 2 — must NOT feed the w1 bar (wave-resolved)
    Game.recordWaveKill(id);
  }
  ok('w1 bar filled by villager-channel kills (w2 kill excluded by wave)',
    Game.waveLedgerPoints(1) === 4 && Game.waveLedgerPoints(2) === 1,
    `w1=${Game.waveLedgerPoints(1)} w2=${Game.waveLedgerPoints(2)}`);
  Game.recordWaveKill('gallowdeer'); // third type -> the 5th point
  ok('villager kills alone unlock wave 2 at day>=8', Game.unlockedWave() >= 2,
    'unlockedWave=' + Game.unlockedWave());
  // ---- 6. ledger-announce honesty (the fix) ----
  const said = [];
  Game.sysSay = function (...a) { said.push(String(a.join(' '))); };
  // (a) bar fills AFTER the floor passed -> no stale gate sentence
  resetLedger();
  Game.state.monsterCounters = {};
  Game.state.scholar.day = 60;
  Game.state._waveAnnounced = 2;
  said.length = 0;
  for (const id of ['voice_mimic_radio', 'voice_mimic_radio', 'heckler', 'heckler']) Game.recordWaveKill(id);
  const full2 = said.find(s => s.includes("wave 2's bar is full"));
  ok('w2 full beat fires', !!full2);
  ok('no stale "opens once day 25 passes" after floor passed',
    full2 && !full2.includes('opens once day'), full2);
  // (b) bar fills BEFORE the floor -> honest future gate still named
  resetLedger();
  Game.state.scholar.day = 10;
  Game.state._waveAnnounced = 2;
  said.length = 0;
  for (const id of ['voice_mimic_radio', 'voice_mimic_radio', 'heckler', 'heckler']) Game.recordWaveKill(id);
  const full2b = said.find(s => s.includes("wave 2's bar is full"));
  ok('future gate still named when floor not yet met',
    full2b && full2b.includes('opens once day 25 passes'), full2b);
  // (c) same for the w1 bar / day-8 floor
  resetLedger();
  Game.state.scholar.day = 30;
  Game.state._waveAnnounced = 1;
  said.length = 0;
  for (const id of ['bulldozer', 'bulldozer', 'hummice', 'hummice', 'gallowdeer']) Game.recordWaveKill(id);
  const full1 = said.find(s => s.includes("wave 1's bar is full"));
  ok('w1 full beat fires', !!full1);
  ok('no stale "opens once day 8 passes" after floor passed',
    full1 && !full1.includes('opens once day'), full1);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERR', e && e.stack || e); process.exit(1); });
