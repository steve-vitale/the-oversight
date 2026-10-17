#!/usr/bin/env node
// test-promise-keep-r20.js — proof for the r20 competent-policy fix.
//
// BUG (journey landing r19/r20): the competent policy accepted favors and
// broke every one — r19: favorKept 0, favorBroken 5; r20 baseline (fresh
// seeds 70-73): 5 accepted, 0 kept, 5 broken ("Promises rot. (-15 trust)"
// x5). The policy never attempted a keep: no food handoff, no tending, no
// keeping conversation. The promise machinery (Game.checkPromises +
// promiseKeepKind) worked fine — the POLICY was the promise-breaker.
//
// FIX: keepPromises() in scripts/policies/competent.js, called each
// morning in daily() before outings. Scans open promises, nearest
// deadline first, and works the per-person kinds with real acts:
//   food   -> Game.giveFood(vid, 'meal') (buffer-guarded: keeps one unit
//             and requires kcal >= 500 — no self-starvation)
//   social -> holdConversation (the engine keeps belong/understand on a
//             substantive 3+ exchange sitting; pickTalkChoice never takes
//             commit choices, so no new promises are minted)
//   heal   -> treatVillager (skilled + able) / tendVillager (sick) /
//             comfort 'silent' (words-keep through the honest 40 talk cap)
// Broadcast kinds (fight/task/travel) keep through the policy's normal
// daily acts and are counted, not chased.
//
// PROOF (RED -> GREEN on the same fixture shape):
//   RED:  a planted 'feed' promise left alone past its favor deadline rots
//         via the daily checkPromises() sweep -> kept === 'broken',
//         "Promises rot" said. (The old policy's behavior, measured.)
//   GREEN: keepPromises() with food in the buffer keeps it the same day ->
//         kept === true, "You kept your word" said.
//   GREEN: a 'heal' promise for a sick villager is kept via tending.
//   GREEN: a 'belong' promise triggers a keeping conversation attempt.
//   GREEN: dead villagers' promises are skipped; broadcast-kind promises
//         don't crash the scan.
//
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const { loadGame, quietLog, setupGame } = require('./sim-harness');
const { competent, keepPromises } = require('./policies/competent');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name); console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}

function firstVillager(Game) {
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try { const p = Game.getPerson(id); if (p && !p.dead) return id; } catch (e) {}
  }
  return roster[0];
}
function giveBufferFood(Game) {
  Game.state.scholar.inventory.push({ name: 'test jerky', kcalEach: 400, units: 4 });
  Game.state.scholar.kcal = 1800;
}
function plantPromise(Game, vid, goal, task, deadlineAbs) {
  const today = Game.state.scholar.day || 0;
  (Game.state.village.promises = Game.state.village.promises || {})[vid] =
    { goal, day: today, kept: false, maker: Game.villagerId, favorId: 'test-favor', favorTask: task, favorDeadline: deadlineAbs };
}
function captureSay(Game) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (s) { lines.push(String(s)); try { return orig.call(this, s); } catch (e) {} };
  return { lines, restore() { Game.say = orig; } };
}

async function main() {
  // ---------- RED: the old behavior — a promise left alone rots ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7070 });
    ok(!loadFails.length, 'RED: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    ok(!!vid, 'RED: fixture villager found');
    giveBufferFood(Game);
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'feed', 'test food promise', today + 1);
    // The old policy never called keepPromises: simulate by jumping past
    // the favor deadline and running the daily rot sweep.
    Game.state.scholar.day = today + 2;
    const cap = captureSay(Game);
    await quietLog(async () => { Game.checkPromises(); });
    cap.restore();
    const p = Game.state.village.promises[vid];
    ok(p.kept === 'broken', 'RED: unkept feed promise rots past its deadline', 'kept=' + p.kept);
    ok(cap.lines.some(l => /Promises rot/i.test(l)), 'RED: the village says "Promises rot"',
      cap.lines.filter(l => /Promises rot/i.test(l)).slice(0, 1).join(' | ').slice(0, 120));
  }

  // ---------- GREEN: keepPromises keeps a feed promise the same day ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7071 });
    ok(!loadFails.length, 'GREEN: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    giveBufferFood(Game);
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'feed', 'test food promise', today + 1);
    const cap = captureSay(Game);
    const ctx = {};
    await quietLog(async () => { keepPromises(Game, ctx); });
    cap.restore();
    const p = Game.state.village.promises[vid];
    ok(p.kept === true, 'GREEN: feed promise kept the same day', 'kept=' + p.kept);
    ok(cap.lines.some(l => /You kept your word/i.test(l)), 'GREEN: the villager says "You kept your word"',
      cap.lines.filter(l => /kept your word/i.test(l)).slice(0, 1).join(' | ').slice(0, 140));
    ok((ctx.promiseFoodKept || 0) >= 1, 'GREEN: ctx.promiseFoodKept counted', 'ctx=' + JSON.stringify(ctx));
    // The scholar kept a buffer: they did not starve themselves.
    ok((Game.state.scholar.kcal || 0) > 0, 'GREEN: scholar still fed after keeping',
      'kcal=' + Game.state.scholar.kcal);
  }

  // ---------- GREEN: a heal promise for a sick villager is tended ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7072 });
    ok(!loadFails.length, 'GREEN/heal: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    (Game.state.village.sick = Game.state.village.sick || {})[vid] = { daysLeft: 3, severity: 1 };
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'heal', 'test heal promise', today + 2);
    const ctx = {};
    await quietLog(async () => { keepPromises(Game, ctx); });
    const p = Game.state.village.promises[vid];
    ok(p.kept === true, 'GREEN: heal promise kept via tending', 'kept=' + p.kept);
    ok(((ctx.promiseHealTended || 0) + (ctx.promiseHealTreated || 0)) >= 1,
      'GREEN: tending/treating counted', 'ctx=' + JSON.stringify(ctx));
  }

  // ---------- GREEN: a belong promise triggers a keeping conversation ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7073 });
    ok(!loadFails.length, 'GREEN/social: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'belong', 'test belong promise', today + 1);
    const ctx = {};
    await quietLog(async () => { keepPromises(Game, ctx); });
    const p = Game.state.village.promises[vid];
    ok((ctx.promiseSocialTried || 0) >= 1, 'GREEN: keeping conversation attempted',
      'ctx=' + JSON.stringify(ctx));
    // The engine keeps on a substantive 3+ exchange sitting — record whether
    // this fixture's conversation reached the bar (informational either way).
    console.log('  info: belong promise kept=' + p.kept + ' (engine bar: substantive + 3 exchanges)');
  }

  // ---------- GREEN: thin pack + stocked pantry -> step inside, draw, keep ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7075 });
    ok(!loadFails.length, 'GREEN/pantry: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    // Empty pack, fed body, stocked pantry, scholar on the haven grounds
    // (outside the hall — the policy's normal state after day 2).
    Game.state.scholar.inventory = [];
    Game.state.scholar.kcal = 1800;
    Game.state.scholar.insideHaven = false;
    const pantryBefore = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
    ok(pantryBefore > 5000, 'GREEN/pantry: pantry stocked', 'pantryKcal=' + Math.round(pantryBefore));
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'feed', 'test pantry-draw promise', today + 1);
    const ctx = {};
    await quietLog(async () => { keepPromises(Game, ctx); });
    const p = Game.state.village.promises[vid];
    ok(p.kept === true, 'GREEN/pantry: feed promise kept via pantry draw', 'kept=' + p.kept);
    ok((ctx.promisePantryDraws || 0) >= 1, 'GREEN/pantry: pantry draw counted',
      'draws=' + ctx.promisePantryDraws);
    ok(Game.state.scholar.insideHaven === false, 'GREEN/pantry: scholar back outside after the draw',
      'insideHaven=' + Game.state.scholar.insideHaven);
    const pantryAfter = (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0);
    ok(pantryAfter < pantryBefore, 'GREEN/pantry: the food came from somewhere real',
      'pantry ' + Math.round(pantryBefore) + ' -> ' + Math.round(pantryAfter));
  }

  // ---------- GREEN: a heal promise for a WOUNDED (not sick) villager ----------
  // (journey landing r20: the heal_help favor had no keep path for a plain
  // wound — tendVillager refused the un-sick. Wound care is now a real deed.)
  {
    const { Game, loadFails } = await loadGame({ seed: 7076 });
    ok(!loadFails.length, 'GREEN/wound: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    // A wound, not a sickness: low health, no sick record, neutral mood
    // (comfort would refuse: "They don't need comforting right now.").
    // Villager health lives in state.village.health[vid] (default 100).
    const vhealth = (Game.state.village.health || (Game.state.village.health = {}));
    vhealth[vid] = 45;
    ok(!((Game.state.village.sick || {})[vid]), 'GREEN/wound: villager wounded, not sick');
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'heal', 'test wound promise', today + 1);
    const hpBefore = vhealth[vid];
    const cap = captureSay(Game);
    const ctx = {};
    await quietLog(async () => { keepPromises(Game, ctx); });
    cap.restore();
    const p = Game.state.village.promises[vid];
    ok(p.kept === true, 'GREEN/wound: wound promise kept via wound care', 'kept=' + p.kept);
    ok(vhealth[vid] > hpBefore, 'GREEN/wound: the wound was actually treated',
      'health ' + hpBefore + ' -> ' + vhealth[vid]);
    ok(cap.lines.some(l => /wound properly/i.test(l)), 'GREEN/wound: honest wound-care narration',
      cap.lines.filter(l => /wound/i.test(l)).slice(0, 1).join(' | ').slice(0, 120));
  }

  // ---------- GREEN: wound care works when the scholar is SKILLED ----------
  // (regression: the first wound-care draft checked `skilled` before
  // `wound`, crashing on rec.daysLeft with rec undefined — caught only in
  // natural play, where the scholar has herbal_remedy.)
  {
    const { Game, loadFails } = await loadGame({ seed: 7077 });
    ok(!loadFails.length, 'GREEN/wound-skilled: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    const vhealth = (Game.state.village.health || (Game.state.village.health = {}));
    vhealth[vid] = 40;
    // Grant a healing skill at L2 (the natural-play condition that crashed).
    try {
      Game.state.scholar.abilities = Game.state.scholar.abilities || {};
      Game.state.scholar.abilities['herbal_remedy'] = { level: 2, xp: 0 };
    } catch (e) {}
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'heal', 'test skilled wound promise', today + 1);
    const ctx = {};
    let threw = null;
    await quietLog(async () => { try { keepPromises(Game, ctx); } catch (e) { threw = e; } });
    ok(!threw, 'GREEN/wound-skilled: no crash on wound+skilled', threw && threw.message);
    const p = Game.state.village.promises[vid];
    ok(p.kept === true, 'GREEN/wound-skilled: wound promise kept', 'kept=' + p.kept);
    ok(vhealth[vid] > 40, 'GREEN/wound-skilled: wound treated', 'health 40 -> ' + vhealth[vid]);
  }

  // ---------- GREEN: dead villagers skipped; broadcast kinds don't crash ----------
  {
    const { Game, loadFails } = await loadGame({ seed: 7074 });
    ok(!loadFails.length, 'GREEN/edge: all modules load', loadFails.join('; '));
    await quietLog(async () => { setupGame(Game, 'Columbus, Ohio'); });
    const vid = firstVillager(Game);
    const today = Game.state.scholar.day || 0;
    plantPromise(Game, vid, 'prove', 'test prove promise', today + 2); // broadcast kind
    // A dead villager's promise must be skipped, not crash.
    const deadId = 'dead_test_vid';
    (Game.state.village.promises = Game.state.village.promises || {})[deadId] =
      { goal: 'feed', day: today, kept: false, favorTask: 'ghost promise', favorDeadline: today + 1 };
    const ctx = {};
    let threw = null;
    await quietLog(async () => { try { keepPromises(Game, ctx); } catch (e) { threw = e; } });
    ok(!threw, 'GREEN: scan survives dead-villager + broadcast-kind promises', threw && threw.message);
    ok((ctx.promiseOpen_task || 0) >= 1, 'GREEN: broadcast-kind promise counted, not chased',
      'ctx=' + JSON.stringify(ctx));
  }

  console.log(`\ntest-promise-keep-r20: ${pass} passed, ${fail} failed`);
  if (fail) process.exit(1);
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
