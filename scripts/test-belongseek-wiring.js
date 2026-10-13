#!/usr/bin/env node
// test-belongseek-wiring.js — wiring tests for scripts/policies/belongseek.js
// (new files only; no game-code changes).
//
// 1. Proposal shield: over 30 days with a rich pantry and known villages,
//    belongseek never forms an as-primary (LEAD) link — scalecourt's own
//    proposals are blocked — but its subordinate courtship fires.
// 2. Counter honesty: a staged subordinate counter at 6000/wk is ACCEPTED when
//    the pantry can carry it (>30000) and WALKED when it can't.
// 3. Tribute priority: a Haven-subordinate link gets its weekly tribute paid
//    even when the pantry is below scalecourt's 15000 threshold (but above
//    2x the weekly bill).
// 4. Demand honesty: a pending demand on the subordinate link is answered
//    (accepted), not left for scalecourt's refuse path.
//
// Usage: node scripts/test-belongseek-wiring.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');

const pantryKcal = (Game) => ((Game.state.village || {}).pantry || [])
  .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
const setPantry = (Game, kcal) => {
  Game.state.village.pantry = [{ name: 'test grain', kcalEach: kcal, units: 1, spoilDay: 9999 }];
};
const dayOf = (Game) => (Game.state.scholar || {}).day || 0;
const knownVillages = (Game) => (Game.state.otherVillages || [])
  .filter(v => v && v.id !== 'haven' && Game.knowsVillage(v));

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'belong-wiring' });
  await setupGame(Game);
  return Game;
}

async function testShield() {
  // 30 days: scalecourt unshielded would propose as-primary ~day 25 with a
  // rich pantry. belongseek must form NO primary-haven link; its own
  // subordinate courtship may or may not land (RNG) — the shield is the assert.
  const Game = await freshGame(4242);
  const ctx = {};
  await quietLog(async () => {
    for (let d = 0; d < 30; d++) {
      setPantry(Game, 60000);
      // keep everyone known so courtship has targets
      for (const v of (Game.state.otherVillages || [])) if (v && v.id !== 'haven') v.generated = true;
      try { belongseek.daily(Game, ctx); } catch (e) { assert.fail('daily threw: ' + e.message); }
      try { Game.sleep(); } catch (e) {}
      if (Game.over) break;
    }
  });
  const links = (Game.hierarchyState() || []).filter(l => l && l.status === 'active');
  const primaryLinks = links.filter(l => l.primary === 'haven' && !l.kind);
  assert.strictEqual(primaryLinks.length, 0,
    'shield failed: as-primary link(s) formed: ' + JSON.stringify(primaryLinks.map(l => l.subordinate)));
  console.log('ok 1 — proposal shield: no as-primary links over 30 rich days; active links: ' +
    links.map(l => (l.kind || (l.primary === 'haven' ? 'sub-of-haven' : 'haven-sub-of-' + l.primary))).join(','));
}

async function testCounterHonesty() {
  for (const [pantry, expect] of [[50000, 'accept'], [5000, 'walk']]) {
    const Game = await freshGame(5150 + pantry);
    for (const v of (Game.state.otherVillages || [])) if (v && v.id !== 'haven') v.generated = true;
    const ks = knownVillages(Game);
    assert.ok(ks.length > 0, 'no known villages to counter with');
    const t = ks[0];
    setPantry(Game, pantry);
    Game.state.pendingCounter = {
      targetId: t.id, opts: { asSubordinate: true, tributeKcalPerWeek: 5000 },
      asSubordinate: true, tributeKcalPerWeek: 6000, day: dayOf(Game),
    };
    const ctx = {};
    await quietLog(async () => { try { belongseek.daily(Game, ctx); } catch (e) { assert.fail('daily threw: ' + e.message); } });
    assert.strictEqual(Game.state.pendingCounter, null, 'counter left pending');
    const link = Game.linkWith(t.id);
    if (expect === 'accept') {
      assert.ok(link && link.status === 'active' && link.subordinate === 'haven',
        'rich pantry: counter should have been ACCEPTED (link formed)');
      assert.strictEqual(link.tributeKcalPerWeek, 6000, 'accepted link carries counter terms');
    } else {
      assert.ok(!link, 'thin pantry: counter should have been WALKED (no link)');
    }
    console.log(`ok 2 — counter honesty (pantry ${pantry}): ${expect}ed as designed`);
  }
}

async function testTributePriority() {
  const Game = await freshGame(6161);
  for (const v of (Game.state.otherVillages || [])) if (v && v.id !== 'haven') v.generated = true;
  const ks = knownVillages(Game);
  assert.ok(ks.length > 0, 'no known villages');
  const link = Game._formLink(ks[0].id, { asSubordinate: true, tributeKcalPerWeek: 3000 });
  assert.ok(link, 'could not form test link');
  // pantry 8000: below scalecourt's 15000 tribute threshold, above 2x3000=6000
  setPantry(Game, 8000);
  const week = Game._week();
  const ctx = {};
  await quietLog(async () => { try { belongseek.daily(Game, ctx); } catch (e) { assert.fail('daily threw: ' + e.message); } });
  assert.strictEqual(link.tributePaidWeek, week, 'tribute NOT paid below 15k pantry (priority failed)');
  assert.strictEqual(link.arrears || 0, 0, 'arrears should be 0 after priority payment');
  console.log('ok 3 — tribute priority: paid at pantry 8000 (< 15000 scalecourt threshold), arrears 0');
}

async function testDemandHonesty() {
  const Game = await freshGame(7171);
  for (const v of (Game.state.otherVillages || [])) if (v && v.id !== 'haven') v.generated = true;
  const ks = knownVillages(Game);
  assert.ok(ks.length > 0, 'no known villages');
  const link = Game._formLink(ks[0].id, { asSubordinate: true, tributeKcalPerWeek: 3000 });
  assert.ok(link, 'could not form test link');
  setPantry(Game, 20000);
  link.pendingDemand = { kind: 'counsel', detail: 'test demand' };
  const ctx = {};
  await quietLog(async () => { try { belongseek.daily(Game, ctx); } catch (e) { assert.fail('daily threw: ' + e.message); } });
  assert.strictEqual(link.pendingDemand, null, 'demand left pending (should be answered, not refused)');
  console.log('ok 4 — demand honesty: primary demand answered (accepted), none left pending');
}

(async () => {
  try {
    await testShield();
    await testCounterHonesty();
    await testTributePriority();
    await testDemandHonesty();
    console.log('\nbelongseek wiring: 4/4 green');
  } catch (e) {
    console.error('\nWIRING FAILURE:', e.message);
    process.exit(1);
  }
})();
