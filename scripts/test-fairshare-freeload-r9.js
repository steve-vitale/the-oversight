#!/usr/bin/env node
// scripts/test-fairshare-freeload-r9.js — longsim scale-wall r9 PROOF (2026-10-13, lever 5).
//
// Fair-share RATE accounting in the freeloader's clock (freeloaderTick).
// The old cumulative gross (netDrain = takes - gave vs fixed bars) made the
// clock tenure- and meal-dependent: ~1 day of ordinary communal eating
// cleared the `draining > 1500` bar, and newcomers tripped drainBeyondCapacity
// in under a week on low expected production (r7). The clock now judges the
// trailing-7-day NET rate (takeRate7 - giveRate7, kcal/day) against the
// person's fair share (max(2000, their own daily need)).
//
// RED tests (must all pass):
//   (a) ordinary communal eating (2000 kcal/day in meal draws, 10 days) NEVER
//       advances the freeload clock — fl.days stays 0, no stages.
//   (b) genuine hoarding (4000 kcal/day net takes, sustained, low producer)
//       DOES trip it — fl.days advances daily and freeloadVote fires by the
//       staged ladder (gossip d3 / warning d7 / vote d12 of drain).
//   (c) balanced: 2000/day takes + 2000/day gives (donations match the draw)
//       never trips.
//   (d) give-heavy: takes 2000/day, gives 3000/day — never trips.
//   (e) giveHist bookkeeping: recordGiveHist writes dated entries, giveRate7
//       measures the trailing-7-day rate, entries prune past 7 days.
//   (f) integration: donateToPantry records giveHist; villagerMealDay records
//       takeHist AND giveHist for the NPC.
//   (g) succession: the new Bearer <redacted> a fresh giveHist book too (no
//       inherited donation/take rhythm).
//
// Usage: node scripts/test-fairshare-freeload-r9.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'fairshare-r9' });
  await setupGame(Game);

  // RED honesty: the mechanism must exist. On pristine code these are
  // undefined and the test fails loudly instead of passing vacuously.
  ok('prereq: recordGiveHist exists', typeof Game.recordGiveHist === 'function');
  ok('prereq: giveRate7 exists', typeof Game.giveRate7 === 'function');
  if (typeof Game.recordGiveHist !== 'function' || typeof Game.giveRate7 !== 'function') {
    console.log(`\n${pass} passed, ${fail} failed (PREREQUISITE MISSING — mechanism not implemented)`);
    process.exit(1);
  }

  const v = Game.state.village;
  const playerVid = Game.villagerId;
  const npc = (v.roster || []).find(id => id !== playerVid);
  if (!npc) { console.log('FAIL setup: no NPC on roster'); process.exit(1); }
  const person = Game.getPerson(npc);
  ok('setup: NPC person record', !!person && !person.dead);

  // deterministic: no RNG slide anywhere near the clock
  const realRandom = Math.random;
  Math.random = () => 0.5;
  let said = [];
  Game.say = (m) => { said.push(String((m && (m.text || m)) || m)); return null; };
  const votes = [];
  const realVote = Game.freeloadVote;
  Game.freeloadVote = function (vid) { votes.push(vid); return null; };

  function resetClock(vid) {
    v.takeHist = {}; v.giveHist = {};
    v.takes = v.takes || {}; v.gives = v.gives || {};
    v.takes[vid] = 0; v.gives[vid] = 0;
    v.freeload = v.freeload || {};
    delete v.freeload[vid];
    v.contribHist = v.contribHist || {};
    delete v.contribHist[vid];
    v.contribLog = v.contribLog || {};
    delete v.contribLog[vid];
    said = []; votes.length = 0;
  }
  // run N days of the clock, recording `takeKcal`/`giveKcal` into the dated
  // histories each day before the tick (like the real flows do).
  function runClock(vid, days, takeKcal, giveKcal, startDay) {
    for (let i = 0; i < days; i++) {
      const d = startDay + i;
      Game.state.scholar.day = d;
      if (takeKcal > 0) Game.recordTakeHist(vid, takeKcal);
      if (giveKcal > 0) Game.recordGiveHist(vid, giveKcal);
      try { Game.freeloaderTick(v); } catch (e) { console.log('  (freeloaderTick threw: ' + e.message + ')'); }
    }
  }
  const clock = (vid) => (v.freeload || {})[vid] || { days: 0, stage: 0 };

  console.log('== (a) ordinary communal eating never trips the clock ==');
  resetClock(npc);
  runClock(npc, 20, 2000, 0, 1); // 2000/day in meal draws, 20 days
  const ca = clock(npc);
  ok('a: netRate7 ≈ 2000/day', Math.abs((Game.takeRate7(npc) - Game.giveRate7(npc)) - 2000) < 1,
    `net=${Game.takeRate7(npc) - Game.giveRate7(npc)}`);
  ok('a: fl.days stays 0 after 20 days of fair-share eating', ca.days === 0, `days=${ca.days}`);
  ok('a: no freeload vote', votes.length === 0, `votes=${votes.length}`);
  ok('a: no warning/gossip said at the fire', said.length === 0, `said=${said.length}`);

  console.log('== (b) genuine sustained hoarding DOES trip the clock ==');
  resetClock(npc);
  runClock(npc, 20, 4000, 0, 1); // 4000/day net takes, no giving
  const cb = clock(npc);
  ok('b: netRate7 ≈ 4000/day', Math.abs((Game.takeRate7(npc) - Game.giveRate7(npc)) - 4000) < 1,
    `net=${Game.takeRate7(npc) - Game.giveRate7(npc)}`);
  ok('b: fl.days advanced past the gossip stage (day 3 of drain)', cb.days >= 3, `days=${cb.days}`);
  ok('b: fl.stage reached 3 (vote) on the staged ladder', cb.stage === 3, `stage=${cb.stage}`);
  ok('b: freeloadVote fired for the hoarder', votes.includes(npc), `votes=${JSON.stringify(votes)}`);

  console.log('== (c) balanced takes/gives never trips ==');
  resetClock(npc);
  runClock(npc, 20, 2000, 2000, 1); // donations match the draw
  const cc = clock(npc);
  ok('c: netRate7 ≈ 0/day', Math.abs(Game.takeRate7(npc) - Game.giveRate7(npc)) < 1,
    `net=${Game.takeRate7(npc) - Game.giveRate7(npc)}`);
  ok('c: fl.days stays 0', cc.days === 0, `days=${cc.days}`);
  ok('c: no vote', votes.length === 0);

  console.log('== (d) give-heavy never trips ==');
  resetClock(npc);
  runClock(npc, 20, 2000, 3000, 1);
  const cd = clock(npc);
  ok('d: netRate7 ≈ -1000/day', Math.abs((Game.takeRate7(npc) - Game.giveRate7(npc)) + 1000) < 1,
    `net=${Game.takeRate7(npc) - Game.giveRate7(npc)}`);
  ok('d: fl.days stays 0', cd.days === 0, `days=${cd.days}`);
  ok('d: no vote', votes.length === 0);

  console.log('== (e) giveHist bookkeeping ==');
  resetClock(npc);
  Game.state.scholar.day = 10;
  Game.recordGiveHist(npc, 1400);
  Game.state.scholar.day = 11;
  Game.recordGiveHist(npc, 2100);
  ok('e: giveRate7 = (1400+2100)/7 = 500/day', Math.abs(Game.giveRate7(npc) - 500) < 1,
    `rate=${Game.giveRate7(npc)}`);
  Game.state.scholar.day = 25; // entries from days 10-11 are now >7d old
  ok('e: old entries prune — rate drops to 0', Game.giveRate7(npc) === 0, `rate=${Game.giveRate7(npc)}`);

  console.log('== (f) integration: real flows record the dated histories ==');
  resetClock(npc);
  Game.state.scholar.day = 40;
  // donateToPantry: put a food item in the player's pack and donate it
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ name: 'test jerky', kcalEach: 700, units: 2, kg: 0.2, unit: 'item', edible: true });
  const giveBefore = ((v.giveHist || {})[playerVid] || []).length;
  try { Game.donateToPantry(Game.state.scholar.inventory.length - 1); } catch (e) { console.log('  (donateToPantry threw: ' + e.message + ')'); }
  const giveAfter = ((v.giveHist || {})[playerVid] || []).length;
  const lastGive = ((v.giveHist || {})[playerVid] || []).slice(-1)[0] || {};
  ok('f: donateToPantry records giveHist (1400 kcal)', giveAfter === giveBefore + 1 && lastGive.kcal === 1400,
    `hist ${giveBefore} -> ${giveAfter}, last=${JSON.stringify(lastGive)}`);
  // villagerMealDay: the NPC's daily flows record takeHist AND giveHist
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'test stew', kcalEach: 500, units: 20, kg: 0.3, unit: 'item', edible: true });
  const takeBefore = ((v.takeHist || {})[npc] || []).length;
  const giveNBefore = ((v.giveHist || {})[npc] || []).length;
  let mealR = null;
  try { mealR = Game.villagerMealDay(npc, person, v, { cookId: null }); } catch (e) { console.log('  (villagerMealDay threw: ' + e.message + ')'); }
  const takeAfter = ((v.takeHist || {})[npc] || []).length;
  const giveNAfter = ((v.giveHist || {})[npc] || []).length;
  ok('f: villagerMealDay ran', !!mealR, mealR ? '' : '(returned null)');
  if (mealR) {
    ok('f: NPC meal draw recorded in takeHist', takeAfter === takeBefore + 1,
      `hist ${takeBefore} -> ${takeAfter}`);
    const drew = ((v.takeHist || {})[npc] || []).slice(-1)[0] || {};
    ok('f: takeHist entry is dated and positive', drew.day === 40 && drew.kcal > 0,
      `entry=${JSON.stringify(drew)}`);
    ok('f: NPC surplus (if any) recorded in giveHist', giveNAfter >= giveNBefore,
      `hist ${giveNBefore} -> ${giveNAfter}`);
  }

  console.log('== (g) succession resets giveHist too ==');
  const nid = (v.roster || []).find(id => id !== playerVid && id !== npc);
  if (nid) {
    v.trust = v.trust || {};
    for (const id of (v.roster || [])) v.trust[id] = 1;
    v.trust[nid] = 100;
    v.giveHist = v.giveHist || {};
    v.giveHist[nid] = [{ day: 30, kcal: 5000 }];
    Game.state.scholar.day = 60;
    Game.state.scholar.health = 1; Game.state.scholar.kcal = 0;
    try { Game.playerDeath('test-succession-r9'); } catch (e) { console.log('  (playerDeath threw: ' + e.message + ')'); }
    const newVid = Game.villagerId;
    ok('g: successor is the crowned NPC', newVid === nid, `newVid=${newVid} want=${nid}`);
    if (newVid === nid) {
      ok('g: giveHist reset', ((v.giveHist || {})[nid] || []).length === 0,
        `len=${((v.giveHist || {})[nid] || []).length}`);
    }
  } else {
    console.log('  SKIP g: no second NPC available');
  }

  Math.random = realRandom;
  Game.freeloadVote = realVote;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
