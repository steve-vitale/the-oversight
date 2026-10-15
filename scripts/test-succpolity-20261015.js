#!/usr/bin/env node
// scripts/test-succpolity-20261015.js — proof for the succession-persistence
// lever (sim-succpolity, 2026-10-15, scale-onramp axis, sim-findings #301).
//
// Mechanic: when the scholar dies, onLeaderDeath shakes every link (-8 trust
// haircut, mourning, tribute renegotiation). The BELONG "good standing" bar
// (trust >= 50) and the seasoned bar (trust >= 40) can drop below threshold
// on the haircut alone -> _havenPolity() returns null -> the daily
// _checkNational sees nationalLive && no polity -> "the realm came apart".
// The lever (SUCCPOLITY=1, default OFF, src/js/hierarchy.js only): the link
// records its pre-death standing at the shake; for 14 days after, the
// polity-membership trust bars read the INHERITED standing — the bond is with
// the village, not the person (Steve's young-bond ruling: the bearer inherits
// the obligations). The chaos itself is untouched: the -8 haircut still lands
// on link.trust, mourning still gags gains 7d, tribute still renegotiates,
// the neglect snap (trust < 20 + 14d no upkeep) still kills, and after the
// 14-day proving window the realm dissolves aloud if trust was never
// re-tended. Persistence is a proving window, not immunity.
//
// REAL RED phases first (must FAIL on the unmodified engine with
// SUCCPOLITY=1), then GREEN on the levered engine:
//
//   R1: belong road (trust 52 -> 44) — the pre-change engine loses the
//       polity on the funeral hour. Asserts persistence -> must FAIL.
//   R2: lead road (3x trust 42 -> 34) — same, must FAIL.
//   R3: peer league (covenant, trust 42 -> 32 via crisis haircut) — same, must FAIL.
//   G1-G3: the three roads persist through the 14d grace (post-change).
//   G4: grace expiry without re-tending -> the realm dissolves ALOUD
//       (nationalLive clears via _checkNational) — persistence is not immunity.
//   G5: the chaos is untouched — link.trust still takes the -8 haircut and
//       the belong-road tribute still renegotiates x1.5 (no new relief valve).
//   G6: neglect snap still kills (trust 25, neglected -> broken link).
//   G7: gate OFF -> the old collapse still happens (env-gate is the switch).
//
// Usage: node scripts/test-succpolity-20261015.js   (SUCCPOLITY=1 for the RED/GREEN core;
//          G7 unsets it internally per-fixture)
'use strict';
process.env.SUCCPOLITY = '1';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let passed = 0, failed = 0;
function ok(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log('  PASS ' + name); },
    (e) => { failed++; console.log('  FAIL ' + name + ' — ' + e.message); });
}
// expectFail: the fn MUST throw — a RED that doesn't fail is itself a failure.
function expectFail(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { failed++; console.log('  FAIL(red) ' + name + ' — levered assert did NOT fail on the unmodified engine (RED is insensitive!)'); },
    () => { passed++; console.log('  PASS(red) ' + name + ' — correctly failed on the unmodified engine'); });
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 4242, mode: 'succpolity-fixture' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 80;
  Game.state.foreignPolities = [{ primary: 'emberhold', subs: ['v2', 'v3'], day: 40 }];
  Game.mshipState().links = [];
  Game.state.nationalLive = false;
  return Game;
}
function belongLink(Game, trust) {
  const l = { id: 'l-belong', status: 'active', primary: 'emberhold', subordinate: 'haven',
    trust: trust, day: 55, tributeKcalPerWeek: 16000, arrears: 0 };
  Game.hierarchyState().push(l);
  return l;
}
function leadLinks(Game, trust) {
  const ls = ['vA', 'vB', 'vC'].map((v, i) => ({ id: 'l-lead' + i, status: 'active',
    primary: 'haven', subordinate: v, trust: trust, day: 45, tributeKcalPerWeek: 4000, arrears: 0 }));
  ls.forEach(l => Game.hierarchyState().push(l));
  return ls;
}
function covenantLinks(Game, trust) {
  const ls = ['vX', 'vY', 'vZ'].map((v, i) => ({ id: 'l-cov' + i, status: 'active',
    kind: 'covenant', a: 'haven', b: v, trust: trust, day: 45, arrears: 0 }));
  ls.forEach(l => Game.hierarchyState().push(l));
  return ls;
}
function killScholar(Game) {
  Game.onLeaderDeath(Game.villagerId);
}

async function main() {
  // ---------- R1/R2/R3 (RED): the funeral hour dissolves the polity ----------
  console.log('\nR1-R3 (RED): pre-change engine must LOSE the polity on succession');
  await expectFail('R1 belong persists through the shake', async () => {
    const Game = await freshGame();
    belongLink(Game, 52);
    assert.ok(Game._belongPolity(), 'belong polity qualifies pre-death');
    killScholar(Game);
    assert.ok(Game._havenPolity(), 'polity persists through the succession grace');
  });
  await expectFail('R2 lead persists through the shake', async () => {
    const Game = await freshGame();
    leadLinks(Game, 42);
    assert.ok(Game.polityOf('haven'), 'lead polity qualifies pre-death');
    killScholar(Game);
    assert.ok(Game._havenPolity(), 'lead polity persists through the succession grace');
  });
  await expectFail('R3 covenant persists through the shake', async () => {
    const Game = await freshGame();
    covenantLinks(Game, 42);
    assert.ok(Game._covenantPolity(), 'covenant polity qualifies pre-death');
    killScholar(Game);
    assert.ok(Game._havenPolity(), 'covenant polity persists through the succession grace');
  });

  // ---------- GREEN ----------
  console.log('\nGREEN: levered engine');
  await ok('G1 belong persists through the 14d grace', async () => {
    const Game = await freshGame();
    const l = belongLink(Game, 52);
    killScholar(Game);
    const p = Game._havenPolity();
    assert.ok(p && p.shape === 'belong', 'polity still qualifies within grace, got ' + JSON.stringify(p && p.shape));
    assert.strictEqual(l._succDay, 80, 'death day recorded on the link');
    assert.strictEqual(l._succTrust, 52, 'pre-death standing inherited');
  });
  await ok('G2 lead persists through the 14d grace', async () => {
    const Game = await freshGame();
    leadLinks(Game, 42);
    killScholar(Game);
    const p = Game._havenPolity();
    assert.ok(p && p.shape === 'lead', 'lead realm still qualifies within grace, got ' + JSON.stringify(p && p.shape));
  });
  await ok('G3 covenant persists through the 14d grace (crisis stays played)', async () => {
    const Game = await freshGame();
    const ls = covenantLinks(Game, 42);
    killScholar(Game);
    const p = Game._havenPolity();
    assert.ok(p && p.shape === 'covenant', 'league still qualifies within grace, got ' + JSON.stringify(p && p.shape));
    assert.ok(ls[0].pendingCovenantCrisis, 'the league crisis is still staged and played');
  });
  await ok('G4 grace expiry without re-tending -> the realm dissolves aloud', async () => {
    const Game = await freshGame();
    belongLink(Game, 52);
    Game.state.nationalLive = true;
    killScholar(Game);
    assert.ok(Game._havenPolity(), 'persists inside the grace window');
    Game.state.scholar.day = 95; // 15 days on, no re-tending
    assert.strictEqual(Game._havenPolity(), null, 'no polity once the proving window lapses');
    Game._checkNational();
    assert.strictEqual(Game.state.nationalLive, false, 'nationalLive cleared — the realm came apart, aloud');
  });
  await ok('G5 the chaos is untouched: haircut + tribute renegotiation still fire', async () => {
    const Game = await freshGame();
    const l = belongLink(Game, 52);
    const trib0 = l.tributeKcalPerWeek;
    killScholar(Game);
    assert.strictEqual(l.trust, 44, 'the -8 chaos haircut still lands on link.trust (got ' + l.trust + ')');
    assert.strictEqual(l.tributeKcalPerWeek, Math.round(trib0 * 1.5), 'the chaos tribute renegotiation still fires (no new relief valve)');
    assert.ok((l.mourningUntil || 0) > 80, 'the 7-day mourning window still marks');
  });
  await ok('G6 neglect snap still kills: death + neglect, not death alone', async () => {
    const Game = await freshGame();
    const l = belongLink(Game, 25);
    l.day = 40; // 40 days old, never kept -> neglected
    killScholar(Game);
    assert.notStrictEqual(l.status, 'active', 'the neglected link still snaps on succession (status=' + l.status + ')');
    assert.strictEqual(Game._havenPolity(), null, 'a snapped link is no polity — persistence never resurrects the dead');
  });
  await ok('G7 gate OFF -> the old funeral-hour collapse still happens', async () => {
    const saved = process.env.SUCCPOLITY;
    delete process.env.SUCCPOLITY;
    try {
      const Game = await freshGame();
      belongLink(Game, 52);
      Game.state.nationalLive = true;
      killScholar(Game);
      assert.strictEqual(Game._havenPolity(), null, 'gate off: the haircut drops the polity as before');
      Game._checkNational();
      assert.strictEqual(Game.state.nationalLive, false, 'gate off: the realm still comes apart');
    } finally { process.env.SUCCPOLITY = saved; }
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
