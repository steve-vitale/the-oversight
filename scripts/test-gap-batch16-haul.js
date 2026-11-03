#!/usr/bin/env node
// test-gap-batch16-haul.js — gap batch item 16(b): favor haul
// retention. When a joint forage outing ends without its partner
// (partner dead/gone), the player's matched share must bank and the
// partner's virtual share must NEVER become pantry food (favor-
// forage.js rule end_without_partner, r81). The wild nonzero case —
// a natural campaign where such an ending banks player haul > 0 —
// has never appeared in the r102/r106 outing corpora (see the batch
// evidence note: 18 favor ends, 8 started outings, 6 joint
// deliveries, 0 partner-gone endings), so the wild half of this item
// is HELD with that census. This script proves the mechanism itself
// end to end in the harness, so the hold is about occurrence, not
// about an untested code path:
//
//   1. Partner gone (real removeVillager path) + player haul 2x100
//      kcal in the pack + partner haul 3x100 kcal virtual: ending
//      at home returns ok + close, banks exactly the player's 200
//      kcal (deliveredPlayerKcal 200, pantry grows by 200),
//      banks 0 of the partner's share, and names the loss.
//   2. Partner gone + player haul empty + partner haul 300 kcal:
//      ending still closes, banks 0 total — no conjured food.
//   3. Control: partner present + both shares: joint deliver banks
//      both shares (500 kcal) and keeps the promise.
//
// Usage: node scripts/test-gap-batch16-haul.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label, extra) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label + (extra != null ? ' :: ' + extra : '')); }
}
function pantryKcal(Game) {
  const p = (Game.state.village || {}).pantry || [];
  return p.reduce((n, it) => n + (Number(it.kcalEach) || 0) * (Number(it.units) || 0), 0);
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const s = Game.state.scholar || {};
  const bearer = Game.villagerId;
  const X = (v.roster || []).find(id => id !== bearer && Game.getPerson(id));
  ok(!!X, 'setup: a living non-bearer villager exists');
  if (!X) { console.log(`\ntest-gap-batch16-haul: ${pass} passed, ${fail} failed`); process.exit(1); }
  const name = (() => { try { return Game.displayName(X).split(' ')[0]; } catch (e) { return 'Partner'; } })();

  function setOuting(playerHaul, partnerHaul) {
    v.favorLedger = v.favorLedger || {};
    v.promises = v.promises || {};
    v.favorLedger[X] = { id: 'gap16-haul', vid: X, kind: 'forage_help', state: 'promised',
      task: 'Forage together', goal: 'feed', askedDay: 1, promisedDay: 1,
      deadline: 99, meetDay: 1,
      forageRun: { bearer, startedDay: 1, playerHaul, partnerHaul, forageCount: 1,
        talked: true, talkCount: 1, returned: false, deliveredKcal: 0 } };
    v.promises[X] = { goal: 'feed', day: 1, kept: false, maker: bearer,
      favorId: 'gap16-haul', favorTask: 'Forage together', favorDeadline: 99 };
  }
  function revive() {
    if (!(v.roster || []).includes(X)) (v.roster || []).push(X);
    const p = Game.getPerson(X);
    if (p) p.dead = false;
    try {
      const vr = (Game.data.villagers || []).find(r => r.id === X);
      if (vr) delete vr.dead;
    } catch (e) {}
    if (v.away) delete v.away[X];
    delete v.favorLedger[X];
    delete v.promises[X];
  }

  // Case 1: partner gone, player haul in pack.
  setOuting(
    [{ name: 'Test Berries', kcalEach: 100, units: 2, edible: true }],
    [{ name: 'Test Berries', kcalEach: 100, units: 3, edible: true }]);
  s.inventory = s.inventory || [];
  s.inventory.push({ name: 'Test Berries', kcalEach: 100, units: 2, edible: true });
  Game.removeVillager(X, 'killed');
  const st1 = Game.forageFavorAction(X, v.favorLedger[X], true);
  ok(st1 && st1.ready && st1.action === 'forage_end', '1: partner-gone ending is offered at home',
    'got: ' + JSON.stringify(st1));
  ok(String(st1.reason || '').includes('200 kcal'), '1: ending reason names the player haul (200 kcal)',
    'got: ' + JSON.stringify(st1 && st1.reason));
  const panBefore = pantryKcal(Game);
  const res1 = Game.performForageFavor(X, v.favorLedger[X], true);
  const r1 = v.favorLedger[X].forageRun;
  ok(res1 && res1.ok && res1.close, '1: partner-gone ending closes', 'got: ' + JSON.stringify(res1 && res1.line));
  ok(r1.deliveredPlayerKcal === 200, '1: player share banked (200 kcal)', 'got: ' + r1.deliveredPlayerKcal);
  ok(r1.deliveredPartnerKcal === 0, '1: partner share NOT banked (0 kcal)', 'got: ' + r1.deliveredPartnerKcal);
  ok(r1.deliveredKcal === 200, '1: total delivered is the player share only', 'got: ' + r1.deliveredKcal);
  ok(pantryKcal(Game) - panBefore === 200, '1: pantry grows by exactly the player share',
    'delta: ' + (pantryKcal(Game) - panBefore));
  ok(String(res1.line || '').includes('lost with them'), '1: return line names the partner share as lost',
    'got: ' + JSON.stringify(res1 && res1.line));
  revive();

  // Case 2: partner gone, player haul empty — closes, banks nothing.
  setOuting([], [{ name: 'Test Berries', kcalEach: 100, units: 3, edible: true }]);
  Game.removeVillager(X, 'killed');
  const res2 = Game.performForageFavor(X, v.favorLedger[X], true);
  const r2 = v.favorLedger[X].forageRun;
  ok(res2 && res2.ok && res2.close, '2: empty-haul partner-gone ending still closes');
  ok(r2.deliveredKcal === 0 && r2.deliveredPartnerKcal === 0,
    '2: nothing banked, no conjured food', 'got: ' + r2.deliveredKcal + '/' + r2.deliveredPartnerKcal);
  revive();

  // Case 3 (control): partner present, joint deliver banks both shares.
  setOuting(
    [{ name: 'Test Berries', kcalEach: 100, units: 2, edible: true }],
    [{ name: 'Test Berries', kcalEach: 100, units: 3, edible: true }]);
  s.inventory.push({ name: 'Test Berries', kcalEach: 100, units: 2, edible: true });
  // Partner must be adjacent at home for the deliver action.
  try {
    v.nodePos = v.nodePos || {};
    v.nodePos[X] = { nx: Game.map.px, ny: Game.map.py };
    v.positions = v.positions || {};
    v.positions[X] = { mx: (s.mx ?? 4) + 1 > 8 ? (s.mx ?? 4) - 1 : (s.mx ?? 4) + 1, my: s.my ?? 4 };
    v.npcInside = v.npcInside || {};
    v.npcInside[X] = (s.insideHaven !== false);
  } catch (e) {}
  const st3 = Game.forageFavorAction(X, v.favorLedger[X], false);
  ok(st3 && st3.ready && st3.action === 'forage_deliver', '3: joint deliver offered with partner present',
    'got: ' + JSON.stringify(st3));
  const res3 = Game.performForageFavor(X, v.favorLedger[X], false);
  const r3 = v.favorLedger[X].forageRun;
  ok(res3 && res3.ok && !res3.promiseMissed, '3: joint deliver keeps the promise',
    'got: ' + JSON.stringify(res3 && res3.line));
  ok(r3.deliveredPlayerKcal === 200 && r3.deliveredPartnerKcal === 300,
    '3: joint deliver banks both shares (200 + 300)',
    'got: ' + r3.deliveredPlayerKcal + '/' + r3.deliveredPartnerKcal);

  console.log(`\ntest-gap-batch16-haul: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('FATAL: ' + (e && e.stack || e)); process.exit(1); });
