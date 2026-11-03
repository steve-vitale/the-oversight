#!/usr/bin/env node
// test-gap-hidecraft-player.js — proof for wave-2 item 10 (player hide-craft block).
//
// QUESTION: the player's OWN hide-armor recipe never fires in automated play.
// The learning path works (handling a hide teaches hide_armor L1, witnessed),
// and the engine's direct craft works from a prepared fixture — but the
// default sim player (competent, the balance-panel player; capable and the
// scale-courtship policies all delegate to its gearUp) never ATTEMPTS the
// craft: gearUp's armor section only ever crafts bark armor, and only when
// nothing decent is worn or owned. So a player who learns hide (L1+), carries
// 2 hide + 1 vine in the pack, and already wears bark (P=10) — or owns any
// armor at all — never gets a hide attempt on any day.
//
// THIS SCRIPT checks the attempt, not the independent craft roll: every
// gearUp call runs with Math.random forced to 0.05, so a reached craft()
// succeeds (blind 35% at L1, 85% at L2+). Before the fix every variant
// below reports 0 crafts; after it, variants A and B craft on day 1 and
// wear the piece, while the knowledge gate (C) and no-duplicate rule (D)
// still hold. Seeded harness (modules capture Math.random at load), one
// harness per variant via freshGame, identical seeds before/after.
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function freshGame(seed) {
  let s = seed >>> 0;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const { Game } = await loadGame({ seed, mode: 'hide-r15', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function givePackMats(Game) {
  const inv = Game.state.scholar.inventory;
  for (let i = 0; i < 2; i++) inv.push({ plantId: 'animal_hide', material: 'hide', name: 'Hide', units: 1, kg: 1.0, kcalEach: 0 });
  inv.push({ material: 'vine', name: 'Vine', units: 1, kg: 0.1, kcalEach: 0 });
}

function packMat(Game, m) {
  return (Game.state.scholar.inventory || []).filter(i => i && i.material === m)
    .reduce((t, i) => t + (i.units || 0), 0);
}
function ownHide(Game) {
  const s = Game.state.scholar;
  const isHide = (it) => it && ((it.itemId || it.id) === 'hide_armor');
  if (Object.values(s.equipped || {}).some(isHide)) return true;
  return (s.inventory || []).some(isHide);
}
function wornHide(Game) {
  return Object.values(Game.state.scholar.equipped || {})
    .some(it => it && ((it.itemId || it.id) === 'hide_armor'));
}
function setRecipe(Game, level) {
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  if (level == null) delete Game.state.codex.recipes.hide_armor;
  else Game.state.codex.recipes.hide_armor = { level, learnedDay: 1, learnedFrom: 'test', via: 'witnessed' };
}

// One gearUp call with a forced-success craft roll and silenced narration.
function gearUpForced(Game, ctx, policyPath) {
  const { gearUp } = require(policyPath || './policies/competent');
  const oldRandom = Math.random, oldSay = Game.say;
  Math.random = () => 0.05;
  Game.say = function () {};
  try { gearUp(Game, ctx); } catch (e) { console.log('  gearUp err', e.message); }
  finally { Math.random = oldRandom; Game.say = oldSay; }
}

function fixture(Game, opts) {
  const s = Game.state.scholar;
  s.inventory = [];
  s.equipped = {};
  s.kcal = 4000;
  if (opts.barkWorn) s.equipped.torso = { itemId: 'bark_armor', name: 'Bark armor', units: 1 };
  if (opts.hideWorn) s.equipped.torso = { itemId: 'hide_armor', name: 'Hide armor', units: 1 };
  setRecipe(Game, opts.level);
  if (opts.mats) givePackMats(Game);
}

async function runVariant(label, opts, seeds, policyPath) {
  for (const seed of seeds) {
    const Game = await freshGame(seed);
    fixture(Game, opts);
    const ctx = {};
    for (let d = 1; d <= 5; d++) {
      Game.state.scholar.day = d;
      gearUpForced(Game, ctx, policyPath);
    }
    const got = ownHide(Game), worn = wornHide(Game);
    const hideLeft = packMat(Game, 'hide'), vineLeft = packMat(Game, 'vine');
    console.log(`-- ${label} seed=${seed} policy=${policyPath || './policies/competent'}: ownHide=${got} wornHide=${worn} hideLeft=${hideLeft} vineLeft=${vineLeft} hideCrafted=${ctx.hideArmorCrafted || 0}`);
    if (label === 'A') {
      check(`A seed ${seed}: hide crafted from pack materials`, got, `ownHide=${got}`);
      check(`A seed ${seed}: hide worn on torso`, worn, `worn=${worn}`);
      check(`A seed ${seed}: materials consumed`, hideLeft === 0 && vineLeft === 0, `hide=${hideLeft} vine=${vineLeft}`);
    } else if (label === 'B') {
      check(`B seed ${seed}: bark wearer upgrades to hide`, worn, `worn=${worn}`);
      check(`B seed ${seed}: materials consumed`, hideLeft === 0 && vineLeft === 0, `hide=${hideLeft} vine=${vineLeft}`);
    } else if (label === 'C') {
      check(`C seed ${seed}: L0 never crafts (knowledge gate holds)`, !got, `ownHide=${got}`);
      check(`C seed ${seed}: L0 materials untouched`, hideLeft === 2 && vineLeft === 1, `hide=${hideLeft} vine=${vineLeft}`);
    } else if (label === 'D') {
      check(`D seed ${seed}: no duplicate craft when already wearing hide`, hideLeft === 2 && vineLeft === 1, `hide=${hideLeft} vine=${vineLeft}`);
      check(`D seed ${seed}: still wearing hide`, worn, `worn=${worn}`);
    }
  }
}

(async () => {
  const seeds = [7, 42, 99];
  // E: the witnessing-learn path still works (regression sanity).
  {
    const Game = await freshGame(7);
    check('E noteHideHandled exists (hide-handling beat)', typeof Game.noteHideHandled === 'function');
    if (typeof Game.noteHideHandled === 'function') {
      Game.state.codex.recipes = Game.state.codex.recipes || {};
      delete Game.state.codex.recipes.hide_armor;
      const oldSay = Game.say; Game.say = function () {};
      try { Game.noteHideHandled({ material: 'hide', units: 1 }); } finally { Game.say = oldSay; }
      const rk = (Game.state.codex.recipes || {}).hide_armor || {};
      check('E handling a hide teaches hide_armor L1 (witnessed)', rk.level === 1 && rk.via === 'witnessed',
        `level=${rk.level} via=${rk.via}`);
    }
  }
  // A: L1 (witnessed) + pack mats, nothing worn — the pure pack case.
  await runVariant('A', { level: 1, mats: true }, seeds);
  // B: L1 + pack mats while wearing bark (P=10) — the previously-impossible upgrade.
  await runVariant('B', { level: 1, mats: true, barkWorn: true }, seeds);
  // C: L0 + pack mats — the knowledge gate must still refuse.
  await runVariant('C', { level: null, mats: true }, seeds);
  // D: already wearing hide + pack mats — no duplicate craft.
  await runVariant('D', { level: 1, mats: true, hideWorn: true }, seeds);
  // A-family: the same pack case through the nofallback copies of the player
  // (byte-identical armor block, same fix) — one seed each as a spot check.
  await runVariant('A', { level: 1, mats: true }, [7], './policies/competent-nofallback');
  await runVariant('A', { level: 1, mats: true }, [7], './policies/competent-nofallback-socialD');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
