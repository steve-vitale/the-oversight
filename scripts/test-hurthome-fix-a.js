'use strict';
// test-hurthome-fix-a.js — proof for the sim-hurthome-fix-a hurt-return fix.
// (2026-11-04, oversight-flesh-out-loop, run fleshout-20261104T1015Z,
// axis food-economy; the NAMED NEXT ARM from sim-hurthome-a DIAG-GO.)
//
// The fix is one predicate (Game.shouldHurtReturn, the exact function
// npcNodeTravel's return branch calls) plus one hurt-aware return line
// fired only on that branch. This test proves the predicate on fixture
// state borrowed from a real loaded Game, proves the wiring in source,
// and proves the predicate reads no RNG and mutates no state.
// Live proof (the rule firing on real sims, the line reading true) is
// the armed sweep corpus itself, judged in the evidence file — not
// duplicated here.
//
// Usage: node scripts/test-hurthome-fix-a.js
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./sim-harness');

let pass = 0;
function check(name, fn) {
  fn();
  pass += 1;
  console.log('ok - ' + name);
}

function ctxFor(away, health) {
  return { state: { village: { away: away || {}, health: health || {} } } };
}

(async () => {
  const { Game } = await loadGame({ seed: 97501, mode: 'hurthome-fix-a-proof', fullTelemetry: false });
  assert.strictEqual(typeof Game.shouldHurtReturn, 'function', 'shouldHurtReturn must exist on Game (RED on pristine)');
  const pred = Game.shouldHurtReturn;

  check('hurt trip returns true (hp 1..7)', () => {
    for (const hp of [1, 2, 4, 7]) {
      assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'expedition', duration: 12 } }, { v1: hp }), 'v1'), true, 'hp ' + hp);
    }
  });
  check('healthy trip returns false (hp 8+)', () => {
    for (const hp of [8, 50, 100]) {
      assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'forage', duration: 8 } }, { v1: hp }), 'v1'), false, 'hp ' + hp);
    }
  });
  check('hp 0 returns false (not an alive hurt traveler)', () => {
    assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'expedition', duration: 12 } }, { v1: 0 }), 'v1'), false);
  });
  check('LEAVE walk-out never returns true, even at hp 1', () => {
    assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'leave', duration: 999 } }, { v1: 1 }), 'v1'), false);
    assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'leave', duration: 999 } }, { v1: 7 }), 'v1'), false);
  });
  check('no away record returns false', () => {
    assert.strictEqual(pred.call(ctxFor({}, { v1: 3 }), 'v1'), false);
  });
  check('missing health returns false, never throws', () => {
    assert.strictEqual(pred.call(ctxFor({ v1: { purpose: 'visit', duration: 8 } }, {}), 'v1'), false);
    assert.strictEqual(pred.call({ state: {} }, 'v1'), false);
    assert.strictEqual(pred.call({}, 'v1'), false);
  });
  check('every non-leave trip purpose is covered', () => {
    for (const p of ['expedition', 'forage', 'hunt', 'visit', 'guard', 'water', 'haul', 'traps', 'explore']) {
      assert.strictEqual(pred.call(ctxFor({ v1: { purpose: p, duration: 8 } }, { v1: 5 }), 'v1'), true, p);
    }
  });
  check('predicate reads no RNG and mutates nothing', () => {
    const ctx = ctxFor({ v1: { purpose: 'expedition', duration: 12 } }, { v1: 5 });
    const before = JSON.stringify(ctx);
    const realRandom = Math.random;
    let reads = 0;
    Math.random = () => { reads += 1; return realRandom(); };
    try {
      assert.strictEqual(pred.call(ctx, 'v1'), true);
    } finally { Math.random = realRandom; }
    assert.strictEqual(reads, 0, 'predicate must not read Math.random');
    assert.strictEqual(JSON.stringify(ctx), before, 'predicate must not mutate state');
  });
  check('wiring: npcNodeTravel return branch calls shouldHurtReturn and the hurt line fires only there', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    const travelIdx = src.indexOf('npcNodeTravel()');
    assert.ok(travelIdx >= 0, 'npcNodeTravel must exist');
    const branch = src.slice(travelIdx, travelIdx + 4000);
    assert.ok(branch.includes('shouldHurtReturn(rid)'), 'return branch must call shouldHurtReturn');
    assert.ok(branch.includes('returns from the wilds hurt'), 'hurt return line must live in the return branch');
    assert.ok(branch.includes('hurtReturn &&'), 'hurt line must be gated on the hurt branch');
    // The hurt line must not appear anywhere else (single firing site).
    const lineHits = src.split('returns from the wilds hurt').length - 1;
    assert.strictEqual(lineHits, 1, 'exactly one hurt return line site, got ' + lineHits);
  });
  check('wiring: LEAVE exclusion is by purpose, not by clock', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'game.js'), 'utf8');
    assert.ok(src.includes("away.purpose === 'leave'"), 'predicate must exclude purpose leave');
  });

  console.log(`test-hurthome-fix-a: ${pass}/${pass} green`);
})().catch((e) => { console.error('test-hurthome-fix-a FAILED', e); process.exit(1); });
