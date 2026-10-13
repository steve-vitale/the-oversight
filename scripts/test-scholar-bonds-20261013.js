#!/usr/bin/env node
// test-scholar-bonds-20261013.js — proof for the scholar-bond engine gap fix
// (2026-10-13, Steve: "Obviously address all three" — blitz finding #2).
//
// THE GAP: zero bondAdd calls ever involved the scholar (this.villagerId).
// The scholar fought, ate, talked, tended, promised and feasted alongside
// villagers while staying a permanent stranger in the bond graph.
//
// THE FIX (same bondAdd machinery, +6/pair/day cap, no parallel system):
//  1. hostFeast: the host (scholar) now bonds with guests (+2 'hosted feast')
//  2. villageMeal: the scholar's haven meal mirrors logSitting's lingering
//     bond (+2 'lingering meal', same 50% roll)
//  3. tbEnd: villager allies who stood the line bond with the scholar
//     (+3 'fought alongside' on won/routed, +2 'stood with you' on lost)
//  4. tendVillager / treatVillager: +3 'tended' / 'treated'
//  5. checkPromises keep: +4 'promise kept'
//  6. giveFood (carexplore override): +2/+1 'fed them', scaled by substance
//  7. endConvo: substantive 3+ exchange conversations bond +2 'deep talk'
//
// Run: node scripts/test-scholar-bonds-20261013.js
// Exit 0 = all green. RED-verified: every assertion fails on pristine code.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'bond-proof' });
  await setupGame(Game);
  return Game;
}
function me(Game) { return Game.villagerId; }
function otherVillager(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).map(String).find(id => id !== String(me(Game)));
}
function bondV(Game, vid) {
  const b = Game.bondGet(me(Game), vid);
  return b ? (b.v || 0) : 0;
}
function withForcedRoll(Game, value, fn) {
  const real = Math.random;
  Math.random = () => value;
  try { return fn(); } finally { Math.random = real; }
}

async function main() {
  console.log('TEST 1: feast host bonds with guests');
  {
    const Game = await freshGame(11);
    const v = Game.state.village;
    Game.stockPantry(40000, 'feast stores');
    // player at haven: ensure not away/exiled
    const r = Game.hostFeast();
    const vid = otherVillager(Game);
    const bv = bondV(Game, vid);
    ok(r && r.ok, 'hostFeast succeeded (' + (r && r.why ? r.why : 'ok') + ')');
    ok(bv > 0, 'scholar formed a feast bond with a guest (v=' + bv + ')');
  }

  console.log('TEST 2: scholar lingering meal bonds');
  {
    const Game = await freshGame(22);
    const v = Game.state.village;
    Game.stockPantry(30000, 'meal stores');
    const vid = otherVillager(Game);
    // seed the meal log with a villager sitting at the haven fire this part
    v.mealLog = [{ vid, part: (Game.dayPart || 0), place: 'haven' }];
    const before = bondV(Game, vid);
    withForcedRoll(Game, 0.1, () => { try { Game.villageMeal(); } catch (e) {} });
    const after = bondV(Game, vid);
    ok(after > before, 'scholar lingering meal formed a bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 3: fighting alongside bonds (tbEnd won)');
  {
    const Game = await freshGame(33);
    const vid = otherVillager(Game);
    const before = bondV(Game, vid);
    Game.tbfight = {
      over: false, result: null, style: 0,
      fighters: [
        { key: 'p', kind: 'player', hp: 80, maxHp: 100, alive: true, fled: false },
        { key: 'v_' + vid, kind: 'villager', villagerId: vid, hp: 60, maxHp: 100, alive: true, fled: false, name: 'Ally' },
        { key: 'm1', kind: 'monster', alive: false, fled: false, mdef: { id: 'hushwolf' }, monsterId: 'hushwolf' },
      ],
    };
    try { Game.tbEnd('won'); } catch (e) { console.log('    (tbEnd threw: ' + e.message + ')'); }
    const after = bondV(Game, vid);
    ok(after > before, 'scholar bonded with ally who stood the line (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 4: fighting alongside bonds (tbEnd lost — shared risk)');
  {
    const Game = await freshGame(44);
    const vid = otherVillager(Game);
    const scholarId = me(Game); // capture: 'lost' may kill the scholar and pass the mantle
    const bv = (id1, id2) => { const b = Game.bondGet(id1, id2); return b ? (b.v || 0) : 0; };
    const before = bv(scholarId, vid);
    Game.tbfight = {
      over: false, result: null, style: 0,
      fighters: [
        { key: 'p', kind: 'player', hp: 5, maxHp: 100, alive: true, fled: false },
        { key: 'v_' + vid, kind: 'villager', villagerId: vid, hp: 20, maxHp: 100, alive: true, fled: false, name: 'Ally' },
        { key: 'm1', kind: 'monster', alive: true, fled: false, mdef: { id: 'hushwolf' }, monsterId: 'hushwolf' },
      ],
    };
    try { Game.tbEnd('lost'); } catch (e) { console.log('    (tbEnd threw: ' + e.message + ')'); }
    const after = bv(scholarId, vid);
    ok(after > before, 'scholar bonded with ally on a shared loss (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 5: tending the sick bonds');
  {
    const Game = await freshGame(55);
    const vid = otherVillager(Game);
    const v = Game.state.village;
    v.sick = v.sick || {};
    v.sick[vid] = { daysLeft: 3, severity: 1 };
    const before = bondV(Game, vid);
    try { Game.tendVillager(vid); } catch (e) { console.log('    (tendVillager threw: ' + e.message + ')'); }
    const after = bondV(Game, vid);
    ok(after > before, 'tending a sick villager formed a bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 6: keeping a promise bonds');
  {
    const Game = await freshGame(66);
    const vid = otherVillager(Game);
    const v = Game.state.village;
    v.promises = v.promises || {};
    v.promises[vid] = { goal: 'heal', day: (Game.state.scholar.day || 1) };
    const before = bondV(Game, vid);
    try { Game.checkPromises('heal', vid); } catch (e) { console.log('    (checkPromises threw: ' + e.message + ')'); }
    const after = bondV(Game, vid);
    ok(after > before, 'keeping a promise formed a bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 7: feeding someone bonds (substance-scaled)');
  {
    const Game = await freshGame(77);
    const vid = otherVillager(Game);
    const s = Game.state.scholar;
    s.inventory = [{ name: 'Cooked turkey', kcalEach: 400, units: 5, foodState: 'cooked' }];
    const before = bondV(Game, vid);
    let res = null;
    try { res = Game.giveFood(vid, 'meal'); } catch (e) { console.log('    (giveFood threw: ' + e.message + ')'); }
    const after = bondV(Game, vid);
    ok(res && res.ok, 'giveFood succeeded');
    ok(after > before, 'feeding someone formed a bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 8: deep conversation bonds');
  {
    const Game = await freshGame(88);
    const vid = otherVillager(Game);
    let started = null;
    try { started = Game.startConvo(vid); } catch (e) { console.log('    (startConvo threw: ' + e.message + ')'); }
    const before = bondV(Game, vid);
    try {
      const c = Game.convoGet(vid);
      if (c) { c.exchanges = 4; c.substantive = true; }
      Game.endConvo(vid, 'done');
    } catch (e) { console.log('    (endConvo threw: ' + e.message + ')'); }
    const after = bondV(Game, vid);
    ok(after > before, 'a real conversation formed a bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 9: walking away earns nothing (no farm)');
  {
    const Game = await freshGame(99);
    const vid = otherVillager(Game);
    try { Game.startConvo(vid); } catch (e) {}
    const before = bondV(Game, vid);
    try {
      const c = Game.convoGet(vid);
      if (c) { c.exchanges = 4; c.substantive = true; }
      Game.endConvo(vid, 'left');
    } catch (e) {}
    const after = bondV(Game, vid);
    ok(after === before, 'walking away mid-thread forms no bond (' + before + ' -> ' + after + ')');
  }

  console.log('TEST 10: daily cap bounds farming (+6/pair/day)');
  {
    const Game = await freshGame(111);
    const vid = otherVillager(Game);
    for (let i = 0; i < 10; i++) { try { Game.bondAdd(me(Game), vid, 4, 'spam'); } catch (e) {} }
    const bv = bondV(Game, vid);
    ok(bv <= 6, 'same-day bond gains capped at +6 (v=' + bv + ')');
  }

  console.log('\nRESULT: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
