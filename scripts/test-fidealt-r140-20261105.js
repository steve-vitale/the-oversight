#!/usr/bin/env node
// test-fidealt-r140-20261105.js — journey-endgame r140, fix F1.
// BUG (r138 dark probe, reproduced r140): the Finale's "PREVIOUSLY ON"
// card says "you struck for X (Y total)" where Y double-counts —
// fiFinale adds the CUMULATIVE player damage (f.sigW5PDmg) to m.fiDealt
// on EVERY finale turn, so Y is a triangular sum: v1a "struck for 5
// (15 total)" = 1+2+3+4+5; v1c "439 (1103 total)" = 114+222+328+439.
// Y must be the total damage the finale has actually TAKEN, all sources.
// This test calls the real Game.fiFinale across 3 synthetic rounds with
// known HP drops and asserts fiDealt == total HP lost, and that the card
// line prints that total. RED on baseline (425), GREEN on fix (175).
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const HB = globalThis.MonsterBehaviorHooks || {};
  // finale-campaign.js wraps fiFinale with fiFinaleHeart once a finale
  // fight starts; the accumulation bug lives in the ORIGINAL, so test that.
  const fiFinale = HB.__fiFinaleOrig || HB.fiFinale;
  assert.equal(typeof fiFinale, 'function', 'MonsterBehaviorHooks.fiFinale must exist');

  const lines = [];
  const origSay = Game.say;
  Game.say = function (t) { lines.push(String(t)); return ''; };

  // Minimal fight: player + finale. The handler reads game.tbfight,
  // game.tbFighter('p'), m.hp/maxHp, m.mdef; the declare/countdown
  // branches need fiDeclared + fiCountdown preset so the card line prints.
  const player = { key: 'p', kind: 'player', name: 'You', hp: 100, maxHp: 100, alive: true, mx: 4, my: 4, speed: 5 };
  const m = { key: 'm_0', kind: 'monster', monsterId: 'finale', mdef: {}, hp: 2000, maxHp: 2000, alive: true, mx: 5, my: 5, speed: 3 };
  Game.tbfight = { id: 'test', round: 5, over: false, fighters: [player, m] };
  // Force the countdown branch so the "PREVIOUSLY ON" line prints.
  // Countdown 4 so all three calls print a card line (the 3rd call with
  // countdown 3 would fall the title card instead of recapping).
  m.fiInit = true; m.fiGrowth = 0; m.fiDealt = 0;
  m.fiDeclared = true; m.fiCountdown = 4;

  // Round 1: player strikes for 100 (cumulative sigW5PDmg = 100).
  Game.tbfight.round = 5;
  Game.tbfight.sigW5PDmg = 100;
  m.hp = 1900;
  fiFinale(Game, m);
  // Round 2: player strikes 50 more (cumulative 150).
  Game.tbfight.round = 6;
  Game.tbfight.sigW5PDmg = 150;
  m.hp = 1850;
  fiFinale(Game, m);
  // Round 3: player strikes 25 more (cumulative 175).
  Game.tbfight.round = 7;
  Game.tbfight.sigW5PDmg = 175;
  m.hp = 1825;
  fiFinale(Game, m);

  // The finale took 100 + 50 + 25 = 175 total. Baseline reports the
  // triangular sum 100 + 150 + 175 = 425.
  console.log('fiDealt =', m.fiDealt, '(expected 175)');
  assert.strictEqual(m.fiDealt, 175, 'fiDealt must equal total HP lost (100+50+25), not the triangular sum');
  const card = lines.filter(l => /PREVIOUSLY ON: you struck for/.test(l));
  console.log('card lines:', JSON.stringify(card));
  assert.ok(card.length >= 1, 'a PREVIOUSLY ON card line must print during the countdown');
  assert.ok(card.some(l => /\(175 total\)/.test(l)), 'the card line must show (175 total)');
  assert.ok(!card.some(l => /\(425 total\)/.test(l)), 'the card line must NOT show the triangular (425 total)');

  Game.say = origSay;
  console.log('PASS test-fidealt-r140');
  process.exit(0);
})().catch(e => { console.error('FAIL test-fidealt-r140:', e && e.message); process.exit(1); });
