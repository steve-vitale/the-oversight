#!/usr/bin/env node
// test-wave-extra-cap-20261012.js — longsim wave lever r5 (2026-10-12).
// PROOF for the perTypeCap experiment: WAVE_EXTRA_CAP gives counter-kill
// extras their OWN per-type allowance, outside the shared perTypeCap.
// Legacy (env unset): a counter-known type caps at 2 lifetime points.
// Experiment (WAVE_EXTRA_CAP=2): base still caps at 2, extras pay up to 2
// more (4/type max); counter-unknown farming is UNCHANGED (2/type).
// RED: legacy behavior asserted first — the experiment path must differ.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const MID = 'voice_mimic_radio'; // wave-2, carries a counter field

async function fresh(seed, extraCap) {
  if (extraCap != null) process.env.WAVE_EXTRA_CAP = String(extraCap);
  else delete process.env.WAVE_EXTRA_CAP;
  const { Game } = await loadGame({ seed, mode: 'reach' });
  await setupGame(Game);
  return Game;
}
function pts(Game, w) { return Game.waveLedgerPoints(w); }
function perType(Game, w, mid) { return ((Game.ledgerState()[w] || {}).perType || {})[mid] | 0; }
function perTypeX(Game, w, mid) { return ((Game.ledgerState()[w] || {}).perTypeX || {})[mid] | 0; }

(async () => {
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log('ok -', name); } catch (e) { fail++; console.log('FAIL -', name, '::', e.message); } };

  // LEGACY: counter-known type — 2 lifetime points, extras clipped by the cap.
  {
    const Game = await fresh(501, null);
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.monsterCounters[MID] = true;
    const adds = [Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID)];
    t('legacy: counter-known kill scores [2,0,0]', () => assert.deepStrictEqual(adds, [2, 0, 0]));
    t('legacy: lifetime per-type total = 2', () => assert.strictEqual(perType(Game, 2, MID), 2));
    t('legacy: no perTypeX written', () => assert.strictEqual(perTypeX(Game, 2, MID), 0));
  }
  // LEGACY: counter-unknown — plain farming, 1/kill to the cap.
  {
    const Game = await fresh(502, null);
    const adds = [Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID)];
    t('legacy: unknown kill scores [1,1,0]', () => assert.deepStrictEqual(adds, [1, 1, 0]));
  }
  // EXPERIMENT: counter-known — base caps at 2, extras pay 2 more.
  {
    const Game = await fresh(503, 2);
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.monsterCounters[MID] = true;
    const adds = [Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID)];
    t('experiment: counter-known kill scores [2,2,0,0]', () => assert.deepStrictEqual(adds, [2, 2, 0, 0]));
    t('experiment: base per-type = 2', () => assert.strictEqual(perType(Game, 2, MID), 2));
    t('experiment: extra per-type = 2', () => assert.strictEqual(perTypeX(Game, 2, MID), 2));
    t('experiment: wave points = 4', () => assert.strictEqual(pts(Game, 2), 4));
  }
  // EXPERIMENT: counter-unknown farming UNCHANGED — the dial only turns for mastery.
  {
    const Game = await fresh(504, 2);
    const adds = [Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID), Game.scoreLedgerKill(MID)];
    t('experiment: unknown kill still scores [1,1,0]', () => assert.deepStrictEqual(adds, [1, 1, 0]));
    t('experiment: unknown earns no extras', () => assert.strictEqual(perTypeX(Game, 2, MID), 0));
  }
  // EXPERIMENT: counter learned MID-STREAM — the pat starts paying on the next kill.
  {
    const Game = await fresh(505, 2);
    const a1 = Game.scoreLedgerKill(MID); // unknown: 1 base
    Game.state.monsterCounters = Game.state.monsterCounters || {};
    Game.state.monsterCounters[MID] = true;
    const a2 = Game.scoreLedgerKill(MID); // known: 1 base + 1 extra
    const a3 = Game.scoreLedgerKill(MID); // base capped: 0 + 1 extra
    const a4 = Game.scoreLedgerKill(MID); // both capped: 0
    t('experiment: mid-stream discovery scores [1,2,1,0]', () => assert.deepStrictEqual([a1, a2, a3, a4], [1, 2, 1, 0]));
  }
  // HONESTY: a kill never scores less than 1 for the unknowing, both paths.
  for (const [seed, cap, label] of [[506, null, 'legacy'], [507, 2, 'experiment']]) {
    const Game = await fresh(seed, cap);
    t(`${label}: first kill >= 1`, () => assert.ok(Game.scoreLedgerKill(MID) >= 1));
  }
  // CONFIG: env parses; garbage -> 0 (legacy).
  {
    const Game = await fresh(508, 'junk');
    t('config: garbage env -> extraPerTypeCap 0', () => assert.strictEqual(Game.waveLedgerCfg().extraPerTypeCap, 0));
    const G2 = await fresh(509, 2);
    t('config: env 2 -> extraPerTypeCap 2', () => assert.strictEqual(G2.waveLedgerCfg().extraPerTypeCap, 2));
  }

  delete process.env.WAVE_EXTRA_CAP;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
