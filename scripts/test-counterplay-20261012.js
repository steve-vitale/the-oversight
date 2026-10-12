#!/usr/bin/env node
// PROOF: competent policy plays monster counters tactically (lever 1 r5,
// 2026-10-12). RED->GREEN against scripts/policies/competent.js.
//
// The blank (evidence/2026-10-11/sim-combat-r2.md): "counters discovered
// 91–103; policy still doesn't play them tactically." The policy fled bad
// fights but never performed a counter trick. This test proves the policy
// now performs each counter kind's trick through the real tb* actions, that
// discovery fires via checkMonsterCounter's observation contract, and that
// the knowledge gate holds (no hint -> no trick; known -> no wasted trick).
//
// Knowledge setup per case: codex.monsters[mid].stage='slain' (the hint IS
// revealed there — the player read it) with state.monsterCounters empty.
// Each case drives the policy's fight() through real combat turns.
//
// Usage: node scripts/test-counterplay-20261012.js   (exit 1 on any FAIL)
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

let passes = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { passes++; console.log('PASS: ' + name); }
  else { fails++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

function midOf(m) { return m.monsterId || (m.mdef || {}).id; }
function liveMonsters(Game) {
  const f = Game.tbfight;
  return f ? f.fighters.filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled) : [];
}

// Bounded fight driver: policy acts on player turns, tbAdvance otherwise.
// opts.beforePlayerTurn(): hook to inject telegraphs etc. opts.stopWhen():
// early exit (e.g. discovered). Returns iterations run.
function drive(Game, ctx, maxIters, opts) {
  opts = opts || {};
  let n = 0;
  while (Game.tbfight && !Game.tbfight.over && !Game.over && n++ < (maxIters || 40)) {
    if (opts.stopWhen && opts.stopWhen()) break;
    if (Game.tbIsPlayerTurn()) {
      if (opts.beforePlayerTurn) { try { opts.beforePlayerTurn(); } catch (e) {} }
      let handled = false;
      try { handled = competent.fight(Game, ctx); } catch (e) { handled = false; }
      if (!handled) {
        // default strike + force advance (mirrors sim-harness driveFights).
        // When the policy handled the turn it advanced itself — never
        // force-advance after handled=true (it skips rounds and breaks
        // consecutive-round tricks like move_x2).
        const tgt = liveMonsters(Game)[0];
        if (tgt) { try { Game.tbPlayerStrike(tgt.key); } catch (e) {} }
        if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
          try { const p = Game.tbFighter('p'); p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction(); }
          catch (e) {}
        }
      }
    } else {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
  }
  return n;
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-counterplay' });
  await setupGame(Game);
  Game.state.monsterCounters = {};
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  return Game;
}
function hintKnown(Game, mid) {
  Game.state.codex.monsters[mid] = Object.assign(Game.state.codex.monsters[mid] || {}, { stage: 'slain' });
}
// Beefy player: keep the new-fight assessment from fleeing so the trick gets
// its turn. (Flee behavior itself is covered by the flee-regression case.)
function beefy(Game, hp) {
  const p = Game.tbFighter('p');
  p.maxHp = hp || 500; p.hp = p.maxHp;
}
function discovered(Game, mid) { return !!((Game.state.monsterCounters || {})[mid]); }

async function tShout() {
  const Game = await freshGame(1101);
  hintKnown(Game, 'hummice');
  Game.startCombat('hummice');
  if (!Game.tbfight) { check('shout: fight starts', false); return; }
  beefy(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'hummice') });
  check('shout: policy bellows (trick performed)', (f.shouts | 0) > 0 || (ctx.beastTricks | 0) > 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('shout: hummice counter discovered', discovered(Game, 'hummice'));
}

async function tOfferFood() {
  const Game = await freshGame(1102);
  hintKnown(Game, 'lockpick_raccoon');
  Game.state.scholar.inventory.push({ itemId: 'test_jerky', name: 'Test jerky', units: 2, kcalEach: 120 });
  Game.startCombat('lockpick_raccoon');
  if (!Game.tbfight) { check('offer_food: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'lockpick_raccoon') });
  check('offer_food: policy bribes (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('offer_food: lockpick_raccoon counter discovered', discovered(Game, 'lockpick_raccoon'));
}

async function tWait() {
  const Game = await freshGame(1103);
  hintKnown(Game, 'heckler');
  Game.startCombat('heckler');
  if (!Game.tbfight) { check('wait: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'heckler') });
  check('wait: policy waits (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('wait: heckler counter discovered', discovered(Game, 'heckler'));
}

async function tKeepDistance() {
  const Game = await freshGame(1104);
  hintKnown(Game, 'speedbump_turtle'); // keep_distance, tiles 2
  Game.startCombat('speedbump_turtle');
  if (!Game.tbfight) { check('keep_distance: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'speedbump_turtle') });
  check('keep_distance: policy backs off (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('keep_distance: speedbump_turtle counter discovered', discovered(Game, 'speedbump_turtle'));
}

async function tMoveWindup() {
  const Game = await freshGame(1105);
  hintKnown(Game, 'gallowdeer'); // move_windup
  Game.startCombat('gallowdeer');
  if (!Game.tbfight) { check('move_windup: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  const p0 = Game.tbFighter('p');
  const sx = p0.mx, sy = p0.my;
  let moved = false;
  drive(Game, ctx, 25, {
    stopWhen: () => discovered(Game, 'gallowdeer'),
    beforePlayerTurn: () => {
      const p = Game.tbFighter('p');
      if (p && (p.mx !== sx || p.my !== sy)) moved = true;
      const m = liveMonsters(Game).find(x => midOf(x) === 'gallowdeer');
      if (m && !discovered(Game, 'gallowdeer')) m.telegraph = { cells: [] };
    },
  });
  check('move_windup: policy moves during the windup', moved || (ctx.beastTricks | 0) > 0,
    'moved=' + moved + ' beastTricks=' + (ctx.beastTricks | 0));
  check('move_windup: gallowdeer counter discovered', discovered(Game, 'gallowdeer'));
}

async function tSidestep() {
  const Game = await freshGame(1106);
  hintKnown(Game, 'bulldozer'); // sidestep
  Game.startCombat('bulldozer');
  if (!Game.tbfight) { check('sidestep: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 30, {
    stopWhen: () => discovered(Game, 'bulldozer'),
    beforePlayerTurn: () => {
      const m = liveMonsters(Game).find(x => midOf(x) === 'bulldozer');
      const p = Game.tbFighter('p');
      if (m && p && !discovered(Game, 'bulldozer')) {
        // the lane runs through the player's tile — step OFF it
        m.telegraph = { cells: [{ cx: p.mx, cy: p.my }, { cx: Math.min(8, p.mx + 1), cy: p.my }] };
      }
    },
  });
  check('sidestep: policy steps off the lane (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('sidestep: bulldozer counter discovered', discovered(Game, 'bulldozer'));
}

async function tMoveX2() {
  const Game = await freshGame(1107);
  hintKnown(Game, 'nightcourt'); // move_x2, plain
  Game.startCombat('nightcourt');
  if (!Game.tbfight) { check('move_x2: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'nightcourt') });
  check('move_x2: policy dodges twice (trick performed)', (ctx.beastTricks | 0) >= 2,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('move_x2: nightcourt counter discovered', discovered(Game, 'nightcourt'));
}

async function tMoveX2Tiles() {
  const Game = await freshGame(1108);
  hintKnown(Game, 'warranty_caller'); // move_x2, tiles: 2
  Game.startCombat('warranty_caller');
  if (!Game.tbfight) { check('move_x2/tiles: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'warranty_caller') });
  check('move_x2/tiles: policy covers 2+ tiles twice', (ctx.beastTricks | 0) >= 2,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('move_x2/tiles: warranty_caller counter discovered', discovered(Game, 'warranty_caller'));
}

async function tStrikeLead() {
  const Game = await freshGame(1109);
  hintKnown(Game, 'hushwolf'); // strike_lead
  Game.startCombat('hushwolf');
  const f = Game.tbfight;
  if (!f) { check('strike_lead: fight starts', false); return; }
  beefy(Game);
  // add a WEAKER non-lead packmate: the old policy strikes the weakest
  // (no discovery); the trick strikes the lead (first-spawned).
  const m0 = f.fighters.find(x => x.kind === 'monster');
  m0.hp = m0.maxHp = 200;
  const free = [[1, 1], [1, 7], [7, 1], [7, 7]].find(([tx, ty]) =>
    !f.fighters.some(x => x.mx === tx && x.my === ty));
  const m1 = Object.assign({}, m0, {
    key: 'm_test1', hp: 5, maxHp: 5, mx: free[0], my: free[1], telegraph: null,
  });
  f.fighters.push(m1);
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'hushwolf') });
  check('strike_lead: policy wounds the lead (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_lead: hushwolf counter discovered', discovered(Game, 'hushwolf'));
}

async function tStrikeWindup() {
  const Game = await freshGame(1110);
  hintKnown(Game, 'mirrormoth'); // strike_windup
  Game.startCombat('mirrormoth');
  if (!Game.tbfight) { check('strike_windup: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 25, {
    stopWhen: () => discovered(Game, 'mirrormoth'),
    beforePlayerTurn: () => {
      const m = liveMonsters(Game).find(x => midOf(x) === 'mirrormoth');
      if (m && !discovered(Game, 'mirrormoth')) m.telegraph = { cells: [] };
    },
  });
  check('strike_windup: policy hits during the fold (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_windup: mirrormoth counter discovered', discovered(Game, 'mirrormoth'));
}

async function tStrikeRecovery() {
  const Game = await freshGame(1111);
  hintKnown(Game, 'giant_mosquito'); // strike_recovery
  Game.startCombat('giant_mosquito');
  if (!Game.tbfight) { check('strike_recovery: fight starts', false); return; }
  beefy(Game);
  const ctx = {};
  drive(Game, ctx, 25, {
    stopWhen: () => discovered(Game, 'giant_mosquito'),
    beforePlayerTurn: () => {
      const m = liveMonsters(Game).find(x => midOf(x) === 'giant_mosquito');
      if (m && !discovered(Game, 'giant_mosquito')) { m._counterDischarged = true; m.telegraph = null; }
    },
  });
  check('strike_recovery: policy hits after it drinks (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_recovery: giant_mosquito counter discovered', discovered(Game, 'giant_mosquito'));
}

async function tStrikeFirst() {
  const Game = await freshGame(1112);
  hintKnown(Game, 'union_rep'); // strike_first
  Game.startCombat('union_rep');
  const f = Game.tbfight;
  if (!f) { check('strike_first: fight starts', false); return; }
  beefy(Game);
  // a weaker bystander: the old policy's first strike lands on it
  // (no discovery); the trick kills the rep first.
  const m0 = f.fighters.find(x => x.kind === 'monster');
  const free = [[1, 1], [1, 7], [7, 1], [7, 7]].find(([tx, ty]) =>
    !f.fighters.some(x => x.mx === tx && x.my === ty));
  const wdef = (Game.data.monsters || []).find(d => d.id === 'hushwolf');
  f.fighters.push({
    key: 'm_bystander', kind: 'monster', monsterId: 'hushwolf', mdef: wdef,
    name: 'bystander', emoji: '🐺', hp: 5, maxHp: 5, speed: 3,
    mx: free[0], my: free[1], alive: true, fled: false, telegraph: null,
  });
  void m0;
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'union_rep') });
  check('strike_first: policy hits the rep first (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_first: union_rep counter discovered', discovered(Game, 'union_rep'));
}

async function tStrikeNonhead() {
  const Game = await freshGame(1113);
  hintKnown(Game, 'ducks_in_a_row'); // strike_nonhead
  Game.startCombat('ducks_in_a_row');
  const f = Game.tbfight;
  if (!f) { check('strike_nonhead: fight starts', false); return; }
  beefy(Game);
  const segs = f.fighters.filter(x => x.kind === 'monster');
  check('strike_nonhead: ducks spawn segments', segs.length > 1 && segs.some(x => (x.segmentIndex | 0) > 0),
    'segments=' + segs.length);
  const ctx = {};
  drive(Game, ctx, 30, { stopWhen: () => discovered(Game, 'ducks_in_a_row') });
  check('strike_nonhead: policy breaks the line (trick performed)', (ctx.beastTricks | 0) > 0,
    'beastTricks=' + (ctx.beastTricks | 0));
  check('strike_nonhead: ducks_in_a_row counter discovered', discovered(Game, 'ducks_in_a_row'));
}

async function tFreshWeapon() {
  const Game = await freshGame(1114);
  hintKnown(Game, 'understudy'); // fresh_weapon
  const inv = Game.state.scholar.inventory;
  inv.push({ itemId: 'stone_knife', name: 'Stone knife', units: 1 });
  inv.push({ itemId: 'hunting_spear', name: 'Hunting spear', units: 1 });
  Game.startCombat('understudy');
  const f = Game.tbfight;
  if (!f) { check('fresh_weapon: fight starts', false); return; }
  beefy(Game);
  const m = f.fighters.find(x => x.kind === 'monster');
  // equip the knife by inventory index
  const ki = inv.findIndex(i => i && i.itemId === 'stone_knife');
  // NOTE: Game.equip returns null even on success — verify via equipped name
  try { Game.equip(ki, 'melee'); } catch (e) {}
  try { Game.equip(Game.state.scholar.inventory.findIndex(i => i && i.itemId === 'stone_knife'), 'ranged'); } catch (e) {}
  check('fresh_weapon: knife equips', /knife/i.test((Game.equippedWeapon() || {}).name || ''),
    'equipped=' + ((Game.equippedWeapon() || {}).name || '?'));
  // the understudy SEES the knife: one honest strike first
  while (!Game.tbIsPlayerTurn() && Game.tbfight && !Game.tbfight.over) { try { Game.tbAdvance(); } catch (e) { break; } }
  try { Game.tbPlayerStrike(m.key); } catch (e) {}
  const seen = Object.keys(m.usSeen || {});
  check('fresh_weapon: understudy has seen the knife', seen.length > 0, 'seen=' + JSON.stringify(seen));
  const ctx = {};
  drive(Game, ctx, 25, { stopWhen: () => discovered(Game, 'understudy') });
  const nowW = (Game.equippedWeapon() || {}).name || '';
  check('fresh_weapon: policy switches weapon mid-fight', /spear/i.test(nowW), 'equipped=' + nowW);
  check('fresh_weapon: understudy counter discovered', discovered(Game, 'understudy'));
}

// KNOWLEDGE GATE: no hint, no trick. The policy must fight normally.
async function tGateNoHint() {
  const Game = await freshGame(1115);
  // NOTE: no hintKnown call — the village never slew a hummice
  Game.startCombat('hummice');
  if (!Game.tbfight) { check('gate/no-hint: fight starts', false); return; }
  beefy(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 12);
  check('gate/no-hint: policy does NOT bellow blind', (f.shouts | 0) === 0 && (ctx.beastTricks | 0) === 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('gate/no-hint: no accidental discovery claimed', !discovered(Game, 'hummice'));
}

// KNOWN COUNTER: the trick is used for its mechanical benefit — a competent
// player who KNOWS the trick plays it (the shout still scatters the choir).
// Once per monster per fight, then normal fighting.
async function tGateKnown() {
  const Game = await freshGame(1116);
  Game.state.monsterCounters['hummice'] = true; // already learned
  Game.startCombat('hummice');
  if (!Game.tbfight) { check('gate/known: fight starts', false); return; }
  beefy(Game);
  const f = Game.tbfight, ctx = {};
  drive(Game, ctx, 12, { stopWhen: () => (f.shouts | 0) > 0 });
  check('gate/known: policy USES a known trick (shout still scatters)', (f.shouts | 0) > 0 && (ctx.beastTricks | 0) > 0,
    'shouts=' + (f.shouts | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
  check('gate/known: known trick attempted once per fight, not looped', (f.shouts | 0) <= 1,
    'shouts=' + (f.shouts | 0));
}

// FLEE REGRESSION: tricks never override the walk-away assessment.
async function tFleeStillWorks() {
  const Game = await freshGame(1117);
  hintKnown(Game, 'hummice');
  Game.startCombat('hummice');
  if (!Game.tbfight) { check('flee: fight starts', false); return; }
  const p = Game.tbFighter('p');
  p.hp = Math.max(1, Math.floor((p.maxHp || 100) * 0.2)); // 20% — below the 35% line
  const ctx = {};
  drive(Game, ctx, 12);
  check('flee: hopeless fight still fled, not tricked', (ctx.fled || 0) + (ctx.fledBad || 0) > 0 && (ctx.beastTricks | 0) === 0,
    'fled=' + (ctx.fled | 0) + ' fledBad=' + (ctx.fledBad | 0) + ' beastTricks=' + (ctx.beastTricks | 0));
}

(async () => {
  const t0 = Date.now();
  await tShout();
  await tOfferFood();
  await tWait();
  await tKeepDistance();
  await tMoveWindup();
  await tSidestep();
  await tMoveX2();
  await tMoveX2Tiles();
  await tStrikeLead();
  await tStrikeWindup();
  await tStrikeRecovery();
  await tStrikeFirst();
  await tStrikeNonhead();
  await tFreshWeapon();
  await tGateNoHint();
  await tGateKnown();
  await tFleeStillWorks();
  console.log(`\n${passes} passed, ${fails} failed (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
