#!/usr/bin/env node
// test-eggdriver-a-20261026.js — proof tests for the eggdriver variants.
//
// 1. predictedBlades mirrors soundTitanCall quotas (base 2, trusted 6,
//    refusal at trust<25 / opinion<-10 / arrears>0).
// 2. snapshotImproves fires only on a new link, an upward 25/70 crossing,
//    or predicted blades above the stood-down count — never on decay or
//    stasis.
// 3. pantryGateOk / reserveFloor / topup arithmetic match the pre-registered
//    P10 definitions (gate x 1000 x 7; roster x 2000 x 3; deficit-only draw
//    never below the reserve floor).
// 4. armFlags: base enables nothing (default driver unchanged by
//    construction — the pilot probe is untouched).
// 5. Live smoke: 1 seed x 5 days under the base-arm eggdriver policy —
//    driver + sit-gate wrap run without throwing, census populates.
// Usage: node scripts/test-eggdriver-a-20261026.js (no env required)
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const E = require('./probe-eggdriver-a-20261026');
const P = require('./probe-eggroad-a-20261026');

async function main() {
  // --- 1. predicted blades ---
  assert.strictEqual(E.predictedBlades([]), 0, 'no links = 0');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 38, opinion: 0, arrears: 0 }]), 2, 'trust 38 = base 2');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 71, opinion: 10, arrears: 0 }]), 6, 'trust 71 + opinion 10 = trusted 6');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 71, opinion: 9, arrears: 0 }]), 2, 'trust 71 but opinion 9 = base 2');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 24, opinion: 0, arrears: 0 }]), 0, 'trust 24 refuses');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 50, opinion: -11, arrears: 0 }]), 0, 'opinion -11 refuses');
  assert.strictEqual(E.predictedBlades([{ other: 'a', trust: 50, opinion: 0, arrears: 1 }]), 0, 'arrears refuse');
  assert.strictEqual(E.predictedBlades([
    { other: 'a', trust: 38, opinion: 0, arrears: 0 },
    { other: 'b', trust: 71, opinion: 10, arrears: 0 },
    { other: 'c', trust: 35, opinion: 0, arrears: 0 },
  ]), 10, '88111 herald call = 2+6+2 = 10');

  // --- 2. snapshot improvement ---
  const prev = [
    { other: 'a', trust: 71, opinion: 10, arrears: 0 },
    { other: 'b', trust: 35, opinion: 0, arrears: 0 },
  ];
  let r = E.snapshotImproves(prev, prev, 8);
  assert.strictEqual(r.improved, false, 'identical snapshot must not permit re-call');
  r = E.snapshotImproves(prev, [
    { other: 'a', trust: 58, opinion: 10, arrears: 0 },
    { other: 'b', trust: 24, opinion: 0, arrears: 0 },
  ], 8);
  assert.strictEqual(r.improved, false, '88111 decay (71->58, 35->24) must not permit re-call');
  r = E.snapshotImproves(
    [{ other: 'a', trust: 20, opinion: 0, arrears: 0 }],
    [{ other: 'a', trust: 30, opinion: 0, arrears: 0 }],
    0);
  assert.strictEqual(r.improved, true, 'crossing 25 upward must permit');
  assert.ok(r.reasons.some(x => x.indexOf('cross-25') === 0), 'reason must name cross-25');
  r = E.snapshotImproves(
    [{ other: 'a', trust: 58, opinion: 10, arrears: 0 }],
    [{ other: 'a', trust: 72, opinion: 10, arrears: 0 }],
    2);
  assert.strictEqual(r.improved, true, 'crossing 70 upward must permit');
  assert.ok(r.reasons.some(x => x.indexOf('cross-70') === 0), 'reason must name cross-70');
  r = E.snapshotImproves(prev, prev.concat([{ other: 'c', trust: 40, opinion: 0, arrears: 0 }]), 8);
  assert.strictEqual(r.improved, true, 'new link must permit');
  assert.ok(r.reasons.some(x => x.indexOf('new-link') === 0), 'reason must name new-link');
  r = E.snapshotImproves(
    [{ other: 'a', trust: 40, opinion: 0, arrears: 0 }],
    [{ other: 'a', trust: 45, opinion: 0, arrears: 0 }],
    2);
  assert.strictEqual(r.improved, false, 'trust rise without a crossing and without beating stood-down blades must not permit');

  // --- 3. P10 arithmetic ---
  assert.strictEqual(E.pantryGateOk(10, 69999, 0), false, 'herald gate needs 70000');
  assert.strictEqual(E.pantryGateOk(10, 70000, 0), true, 'herald gate met at 70000');
  assert.strictEqual(E.pantryGateOk(12, 84000, 0), true, 'nielsen gate met at 84000');
  assert.strictEqual(E.pantryGateOk(10, 60000, 10000), true, 'pack counts toward the reservoir');
  assert.strictEqual(E.reserveFloor(12), 72000, 'reserve = 12 x 2000 x 3');
  assert.strictEqual(E.topupDeficit(10, 5020), 6980, '10 blades at pack 5020 need 6980 more');
  assert.strictEqual(E.topupDeficit(10, 12000), 0, 'no deficit when pack covers need + own need');
  assert.strictEqual(E.topupAllowedDraw(50000, 72000, 6980), 0, 'never draw below the reserve floor');
  assert.strictEqual(E.topupAllowedDraw(80000, 72000, 6980), 6980, 'draw the deficit when above reserve');
  assert.strictEqual(E.topupAllowedDraw(75000, 72000, 6980), 3000, 'draw only down to the reserve floor');

  // --- 4. arm flags ---
  assert.deepStrictEqual(E.armFlags('base'), { p6: false, p10: false }, 'base enables nothing');
  assert.deepStrictEqual(E.armFlags('p6'), { p6: true, p10: false }, 'p6 alone');
  assert.deepStrictEqual(E.armFlags('p10'), { p6: false, p10: true }, 'p10 alone');
  assert.deepStrictEqual(E.armFlags('p6p10'), { p6: true, p10: true }, 'combined');

  // --- 5. live smoke: base-arm eggdriver policy, 5 days ---
  const { Game } = await loadGame({ seed: 88101, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const pol = E.eggdriverPolicy({ p6: false, p10: false });
  const origTakeSeat = Game.tableTakeSeat ? Game.tableTakeSeat.bind(Game) : null;
  if (origTakeSeat) {
    Game.tableTakeSeat = function () {
      if (!P.sitAllowed(Game)) return { ok: false, msg: '' };
      return origTakeSeat.apply(this, arguments);
    };
  }
  await runDays(Game, pol, { days: 5, manifest: undefined, sampleEvery: 1 });
  const c2 = P.eggroadCensus(Game);
  assert.ok(c2.day >= 5, 'smoke must advance days, got ' + c2.day);
  assert.ok(c2.titans && c2.titans.herald, 'smoke census must populate chain fields');
  console.log('eggdriver-a proof: predicted 8/8, snapshot 7/7, P10 arithmetic 9/9, flags 4/4, live smoke day=' + c2.day + ' — GREEN');
}

main().catch(e => { console.error('eggdriver-a proof FAILED:', e); process.exit(1); });
