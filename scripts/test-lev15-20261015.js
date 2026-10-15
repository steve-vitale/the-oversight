#!/usr/bin/env node
// scripts/test-lev15-20261015.js — proof for the succession ×1.5
// tribute-leverage census (sim-lev15census, 2026-10-15, #323 informer).
//
// The instrument (scripts/lev15-lib-20261015.js) is READ-ONLY: zero src/js,
// spies on successionCrisis / theirLeaderDied / answerRenegotiation /
// breakLink. This proof demonstrates:
//   G1–G6: the instrument attributes ×1.5 leverage applications with the
//          right numbers on fixtures with known succession events,
//          including compounding depth (two stacked ×1.5s), the 7-day
//          expiry path (_renegotiationTick calls _resolveRenegotiation directly),
//          and the young
//          link (<21d) zero-leverage path (the #323 asymmetry).
//   D1: determinism — same run twice with the instrument on, byte-identical.
//   D2: mechanism isolation — instrument ON vs OFF is byte-identical
//       (the census changes no game behavior).
//   H1: honesty — events serialize with a complete trail; attributionAudit
//       reports rate 1.0 on a clean fixture.
//
// HARNESS QUIRK (2026-10-15, test-tribshield): back-to-back loadGame()
// calls diverge by one trust point. All fixtures use the interleaved
// create-run-create-run pattern — never create two games before running one.
//
// Usage: node scripts/test-lev15-20261015.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const LEV = require('./lev15-lib-20261015');
const RB = require('./readinessbind-lib');

let passed = 0, failed = 0;
function ok(name, fn) {
  return Promise.resolve().then(fn).then(
    () => { passed++; console.log('  PASS ' + name); },
    (e) => { failed++; console.log('  FAIL ' + name + ' — ' + (e && e.message)); });
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed: seed || 4242, mode: 'lev15-fixture' });
  await setupGame(Game);
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 80;
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = [{ kcalEach: 1000, units: 40 }]; // 40k kcal
  Game.mshipState().links = [];
  Game.state.nationalLive = false;
  return Game;
}
// Haven-subordinate link (the ×1.5-UP side), age set via formedDay.
function subLink(Game, id, opts) {
  const l = Object.assign({ id, status: 'active', primary: 'emberhold',
    subordinate: 'haven', trust: 55, day: 50, tributeKcalPerWeek: 6000,
    arrears: 1200, tributePaidWeek: -1 }, opts || {});
  Game.mshipState().links.push(l);
  return l;
}
// Haven-primary link (theirLeaderDied ×1.5-UP side).
function primLink(Game, id, opts) {
  const l = Object.assign({ id, status: 'active', primary: 'haven',
    subordinate: 'v-' + id, trust: 60, day: 50, tributeKcalPerWeek: 4000,
    arrears: 0, tendedWeek: -1 }, opts || {});
  Game.mshipState().links.push(l);
  return l;
}
// A 60d run with/without the census, for the det-gate.
async function run60(seed, withCensus) {
  const { leadfeast } = require('./policies/tribshield');
  delete process.env.TRIBSHIELD;
  const { Game } = await loadGame({ seed, mode: 'lev15-detgate' });
  await setupGame(Game);
  const census = withCensus ? LEV.attachCensus(Game) : null;
  const hashes = [];
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) origDaily(G, ctx);
    if (census) census.tick();
    hashes.push(RB.trajectoryHash(G));
  };
  await runDays(Game, policy, { days: 60, sampleEvery: 10 });
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(hashes.join('|')).digest('hex');
}

async function main() {
  console.log('\nG1–G6: attribution on known succession events');

  await ok('G1 successionCrisis on an old sub-link attributes the ×1.5', async () => {
    const Game = await freshGame();
    subLink(Game, 'l-old');
    const census = LEV.attachCensus(Game);
    const r = Game.successionCrisis('l-old');
    assert.notStrictEqual(r, 'grace', 'old link must take the leverage path, got ' + r);
    assert.strictEqual(census.events.length, 1, 'expected 1 event, got ' + census.events.length);
    const e = census.events[0];
    assert.strictEqual(e.callSite, 'successionCrisis');
    assert.strictEqual(e.role, 'subordinate');
    assert.strictEqual(e.kind, '?', 'fixture link has no kind, got ' + e.kind);
    assert.strictEqual(e.ageDays, 30, 'age 80-50=30, got ' + e.ageDays);
    assert.strictEqual(e.oldLink, true);
    assert.strictEqual(e.trustBefore, 55);
    assert.strictEqual(e.trustAfter, 47, 'the -8 haircut, got ' + e.trustAfter);
    assert.strictEqual(e.arrearsBefore, 1200);
    assert.strictEqual(e.arrearsAfter, 1200, 'crisis moves tribute, not arrears');
    assert.strictEqual(e.tributeBefore, 6000);
    assert.strictEqual(e.tributeAfter, 9000, '6000×1.5, got ' + e.tributeAfter);
    assert.strictEqual(e.weeklyHike, 3000);
    assert.strictEqual(e.depthPrior, 0);
    assert.strictEqual(e.depthNew, 1);
    assert.strictEqual(e.youngNational, false);
    assert.ok(e.verdict && /grief is leverage/i.test(e.verdict), 'verdict bound, got: ' + e.verdict);
    const audit = LEV.attributionAudit(census, Game);
    assert.strictEqual(audit.rate, 1, 'attribution rate ' + audit.rate);
  });

  await ok('G2 a second death compounds: depth 1→2, 9000→13500', async () => {
    const Game = await freshGame();
    const l = subLink(Game, 'l-old');
    const census = LEV.attachCensus(Game);
    Game.successionCrisis('l-old');
    l.mourningUntil = 0; // grief coalesces only while the mourning window is live
    Game.successionCrisis('l-old');
    assert.strictEqual(census.events.length, 2, 'expected 2 events, got ' + census.events.length);
    const e2 = census.events[1];
    assert.strictEqual(e2.depthPrior, 1);
    assert.strictEqual(e2.depthNew, 2);
    assert.strictEqual(e2.tributeBefore, 9000);
    assert.strictEqual(e2.tributeAfter, 13500);
  });

  await ok('G3 theirLeaderDied on a Haven-primary link: ×1.5 up', async () => {
    const Game = await freshGame();
    primLink(Game, 'l-prim');
    const census = LEV.attachCensus(Game);
    Game.theirLeaderDied('l-prim');
    assert.strictEqual(census.events.length, 1, 'expected 1 event, got ' + census.events.length);
    const e = census.events[0];
    assert.strictEqual(e.callSite, 'theirLeaderDied');
    assert.strictEqual(e.role, 'primary');
    assert.strictEqual(e.tributeBefore, 4000);
    assert.strictEqual(e.tributeAfter, 6000);
    assert.strictEqual(e.ageDays, 30);
  });

  await ok('G4 young link (<21d) stages a beat: zero leverage (the #323 asymmetry)', async () => {
    const Game = await freshGame();
    subLink(Game, 'l-young', { day: 70 }); // age 10
    const census = LEV.attachCensus(Game);
    const r = Game.successionCrisis('l-young');
    assert.strictEqual(r, 'grace', 'young link stages the beat, got ' + r);
    assert.strictEqual(census.events.length, 0, 'young links take NO leverage — got ' + census.events.length + ' events');
  });

  await ok('G5 answerRenegotiation wait lands the deferred ×1.5 (via _resolveRenegotiation)', async () => {
    const Game = await freshGame();
    subLink(Game, 'l-beat', { pendingRenegotiation: { day: 80, sub: true }, tributeKcalPerWeek: 8000 });
    const census = LEV.attachCensus(Game);
    const r = Game.answerRenegotiation('l-beat', 'wait');
    assert.strictEqual(r, 'lapsed');
    assert.strictEqual(census.events.length, 1, 'expected 1 event, got ' + census.events.length);
    const e = census.events[0];
    assert.strictEqual(e.callSite, 'renegotiation:wait-chosen');
    assert.strictEqual(e.tributeBefore, 8000);
    assert.strictEqual(e.tributeAfter, 12000);
    assert.ok(e.verdict && /grief became leverage/i.test(e.verdict), 'verdict bound, got: ' + e.verdict);
  });

  await ok('G6 the 7-day expiry lands ×1.5 through _renegotiationTick (the unattributed path)', async () => {
    const Game = await freshGame();
    // scholar.day = 80; beat staged day 73 → 7 days elapsed → expiry fires.
    subLink(Game, 'l-exp', { pendingRenegotiation: { day: 73, sub: true }, tributeKcalPerWeek: 8000 });
    const census = LEV.attachCensus(Game);
    Game._renegotiationTick();
    assert.strictEqual(census.events.length, 1, 'expected 1 event from the expiry tick, got ' + census.events.length);
    const e = census.events[0];
    assert.strictEqual(e.callSite, 'renegotiation:expiry-7d');
    assert.strictEqual(e.tributeBefore, 8000);
    assert.strictEqual(e.tributeAfter, 12000);
    assert.ok(e.verdict && /grief became leverage/i.test(e.verdict), 'verdict bound, got: ' + e.verdict);
    const audit = LEV.attributionAudit(census, Game);
    assert.strictEqual(audit.rate, 1, 'expiry must be fully attributable, got ' + audit.rate);
  });

  console.log('\nD1–D2 (det-gate): determinism + mechanism isolation');
  await ok('D1 instrument-on 60d is deterministic (seed 11, leadfeast)', async () => {
    const h1 = await run60(11, true);
    const h2 = await run60(11, true);
    assert.strictEqual(h1, h2, 'instrument-on runs diverged');
  });
  await ok('D2 instrument ON vs OFF is byte-identical (seed 11, leadfeast)', async () => {
    const hOn = await run60(11, true);
    const hOff = await run60(11, false);
    assert.strictEqual(hOn, hOff, 'the instrument changed game behavior');
  });

  console.log('\nH1 (honesty): full trails serialize, audit clean');
  await ok('H1 event trail fields are all present and JSON-clean', async () => {
    const Game = await freshGame();
    subLink(Game, 'l-old');
    const census = LEV.attachCensus(Game);
    Game.successionCrisis('l-old');
    const json = JSON.stringify(census.events);
    const ev = JSON.parse(json)[0];
    const required = ['linkId', 'day', 'callSite', 'role', 'kind', 'ageDays', 'oldLink',
      'trustBefore', 'trustAfter', 'arrearsBefore', 'arrearsAfter',
      'tributeBefore', 'tributeAfter', 'weeklyHike',
      'depthPrior', 'depthNew', 'rankAtEvent', 'youngNational', 'natAgeDays', 'verdict'];
    for (const f of required) assert.ok(ev[f] !== undefined, 'trail missing field: ' + f);
    assert.ok('natAgeDays' in ev, 'trail missing field: natAgeDays');
    assert.strictEqual(ev.natAgeDays, null, 'no national reached — natAgeDays must be null, not invented');
    assert.strictEqual(census.errors.length, 0, 'instrument errors: ' + JSON.stringify(census.errors));
    const audit = LEV.attributionAudit(census, Game);
    assert.strictEqual(audit.rate, 1);
    const oc = LEV.linkOutcome(census, Game, 'l-old');
    assert.strictEqual(oc.outcome, 'hold', 'active link with leverage standing, got ' + oc.outcome);
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
  console.log('LEV15 PROOF GREEN');
}

main().catch((e) => { console.error('PROOF FATAL', e); process.exit(2); });
