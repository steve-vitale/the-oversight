#!/usr/bin/env node
// PROOF TEST: wave 4/5 pacing coherence + ledger-beat honesty
// (longsim wave lever r3 2026-10-11).
//
// Waves 4-5 are scale-bound in every sim (0/20 reach regional), so the dials
// themselves must be verified by construction, not by sweep:
//   1. unlockedWave() gates: w4 = w3-bar (4 pts) + regional, NO day floor;
//      w5 = w4-bar (3 pts) + national, NO day floor (canon: "ledger points +
//      scale, never pure calendar" — MONSTER-WAVES.md).
//   2. The scale floor HOLDS: bar full at village rank -> no unlock.
//   3. perTypeCap interaction: w4's bar (4) needs 2+ types at cap 2;
//      w5's bar (3) needs 2+ types (2+1). One farmed type cannot fill either.
//   4. checkWaveUnlockBeat fires the woven wave beats honestly: RATINGS line
//      only promises talent when the roster has it (hasTalent), Mirror Draft
//      / Producers beats land, idempotent (no re-fire).
//   5. _ledgerAnnounce 100% beat names the REAL next gate per wave
//      (sense-fix r3): w1->day floor, w2->day floor, w3->regional,
//      w4->national, w5->terminal line (no "next wave" lie).
//   6. monsterWavePool admits the new wave once unlocked (the pool is the
//      delivery side of the gate).
//
// Method: node harness (full module list via sim-harness), seeded BEFORE
// eval. Ledger filled via the real scoreLedgerKill path (counter kills
// avoided: no monsterCounters set, so 1 pt/kill).
//
// Green: node scripts/test-wave45-coherence-20261011.js
'use strict';
const H = require('./sim-harness.js');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};

(async () => {
  const { Game } = await H.loadGame({ seed: 424242 });
  await H.setupGame(Game);
  const sayLines = [], sysLines = [];
  Game.say = function (...a) { sayLines.push(a.join(' ')); };
  Game.sysSay = function (...a) { sysLines.push(a.join(' ')); };
  console.log('== WAVE 4/5 PACING COHERENCE ==');

  const resetLedger = () => { Game.state.waveLedger = null; Game.ledgerState(); };
  const resetAnn = () => { Game.state._ledgerAnn50 = {}; Game.state._ledgerAnnFull = {}; };
  const fill = (mid, n) => { for (let i = 0; i < n; i++) Game.scoreLedgerKill(mid); };
  const w3 = ['redactor', 'gavel'], w4 = ['congregation', 'strike'];

  // ---- 1+2: w4 gate = bar + regional, no day floor; floor holds at village
  resetLedger(); Game.state.networkLive = false; Game.state.nationalLive = false;
  Game.state.scholar.day = 40; // past the day-25 floor
  fill('hushwolf', 2); fill('hummice', 2); fill('sunbasker', 1); // w1 bar: 5
  fill('voice_mimic_radio', 2); fill('mirror_stag', 2); // w2 bar: 4
  ok('prereq: wave 3 unlocked (bars + day floor)', Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
  fill('redactor', 2); fill('gavel', 2); // 4 pts, 2 types
  ok('w3 bar full (4 pts)', Game.waveLedgerPoints(3) === 4, String(Game.waveLedgerPoints(3)));
  ok('w4 stays locked at village rank', Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
  Game.state.scholar.day = 10; // below the day-25 floor on purpose
  Game.state.networkLive = true; // Regional Dawn
  ok('w4 unlocks at day 10 with bar+regional (no day floor)', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  Game.state.scholar.day = 40;

  // ---- 3: perTypeCap interaction — one type cannot fill the w4 bar
  resetLedger();
  fill('redactor', 4); // 4 kills, one type, cap 2
  ok('one farmed type caps at 2 pts (w3 bar unfilled)', Game.waveLedgerPoints(3) === 2, String(Game.waveLedgerPoints(3)));
  fill('gavel', 2);
  ok('two types fill the w4 bar (breadth, not farming)', Game.waveLedgerPoints(3) === 4, String(Game.waveLedgerPoints(3)));
  resetLedger();
  fill('congregation', 3); // w4 bar is 3, cap 2
  ok('w4 bar (3) at cap 2: one type = 2 pts, bar unfilled', Game.waveLedgerPoints(4) === 2, String(Game.waveLedgerPoints(4)));
  fill('strike', 1);
  ok('w4 bar filled by 2+1 (two types)', Game.waveLedgerPoints(4) === 3, String(Game.waveLedgerPoints(4)));

  // ---- 4: unlock beats fire honestly and idempotently
  resetLedger(); fill('redactor', 2); fill('gavel', 2);
  Game.state.networkLive = true; Game.state.nationalLive = false;
  Game.state._waveAnnounced = 3;
  sysLines.length = 0; sayLines.length = 0;
  Game.checkWaveUnlockBeat();
  ok('w4 beat fired (announced=4)', Game.state._waveAnnounced === 4, String(Game.state._waveAnnounced));
  ok('RATINGS line promises real talent (w4 roster exists)',
    sysLines.some(l => /RATINGS ARE UP/.test(l) && /Wave 4 talent has been released/.test(l)),
    sysLines.filter(l => /RATINGS/.test(l)).join(' | ').slice(0, 120));
  ok('Mirror Draft woven beat fired',
    sayLines.some(l => /MIRROR DRAFT/.test(l)), sayLines.join(' ').slice(0, 120));
  const n1 = sysLines.length + sayLines.length;
  Game.checkWaveUnlockBeat();
  ok('beat idempotent (no re-fire)', sysLines.length + sayLines.length === n1);

  // wave 5
  resetLedger(); fill('congregation', 2); fill('strike', 1);
  Game.state.nationalLive = true;
  ok('w5 gate = w4 bar + national', Game.unlockedWave() === 5, 'wave=' + Game.unlockedWave());
  Game.state._waveAnnounced = 4;
  sysLines.length = 0; sayLines.length = 0;
  Game.checkWaveUnlockBeat();
  ok('Producers woven beat fired', sayLines.some(l => /PRODUCERS/.test(l)));
  ok('RATINGS line for wave 5', sysLines.some(l => /Wave 5 talent has been released/.test(l)));

  // ---- 5: ledger 100% beats name the real next gate (sense-fix)
  const beats = {};
  for (const w of [1, 2, 3, 4, 5]) {
    resetLedger(); resetAnn(); sysLines.length = 0;
    const mids = { 1: ['hushwolf', 'hummice', 'sunbasker'], 2: ['voice_mimic_radio', 'mirror_stag'], 3: w3, 4: w4, 5: ['cancellation', 'editor'] }[w];
    const bar = Game.waveLedgerCfg().barsPerWave[w];
    // fill at cap 2 across the listed types (3 types needed for the w1 bar of 5)
    let need = bar;
    for (const m of mids) { const n = Math.min(2, need); fill(m, n); need -= n; }
    beats[w] = sysLines.filter(l => /bar is full/.test(l)).join(' ');
  }
  ok('w1 100% beat names the day-8 floor', /day 8/.test(beats[1]) && !/scale/i.test(beats[1]), beats[1].slice(0, 140));
  ok('w2 100% beat names the day-25 floor', /day 25/.test(beats[2]) && !/scale/i.test(beats[2]), beats[2].slice(0, 140));
  ok('w3 100% beat names regional', /regional/i.test(beats[3]) && !/day \d/.test(beats[3]), beats[3].slice(0, 140));
  ok('w4 100% beat names national', /national/i.test(beats[4]), beats[4].slice(0, 140));
  ok('w5 100% beat promises NO next wave', !/next wave opens/i.test(beats[5]) && /whole ledger|Producers themselves/i.test(beats[5]), beats[5].slice(0, 160));

  // ---- 6: the pool admits the new wave once unlocked
  resetLedger(); fill('redactor', 2); fill('gavel', 2);
  Game.state.networkLive = true; Game.state.nationalLive = false;
  const pool = Game.monsterWavePool();
  ok('pool admits wave-4 monsters once unlocked', pool.some(m => (m.wave || 1) === 4));
  ok('pool still holds earlier waves', pool.some(m => (m.wave || 1) === 1) && pool.some(m => (m.wave || 1) === 3));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
