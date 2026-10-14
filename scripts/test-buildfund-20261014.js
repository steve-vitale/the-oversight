#!/usr/bin/env node
// scripts/test-buildfund-20261014.js — proof test for scale-wall r19 arm
// (BUILDFUND build-funding layer, scripts/policies/buildfund.js).
//
// Mechanism:
//   1. Gate OFF = pure delegation: buildfund-lead.daily byte-identical to
//      leadcourt.daily on identical seeds; fight() sets no _huntCommit and
//      no bf* keys (RED).
//   2. Craft leg: scripted materials + recipe knowledge → hunting_spear
//      crafted and equipped (GREEN); gate off → no craft (RED).
//   3. Armor leg: hide_armor knowledge + hides → crafted, armorBonus >= 20
//      (GREEN); gate off → nothing (RED).
//   4. Spool trick: villageKnowsTrick('spool') + record phase → tbPlayerWait
//      (GREEN); without the knowledge → no wait, normal fight (RED).
//   5. Chorus trick: beat-4 incoming + in the kick cone → flank move (GREEN);
//      without knowledge → no dodge (RED).
//   6. Buffering trick: 'predict' pending → wait (whiff); else closeEyes
//      cycle (GREEN); without knowledge → neither (RED).
//   7. Assessment: funded+healthy scholar vs spool → _huntCommit true
//      (GREEN); unfunded/fragile → false, honest decline (RED contrast);
//      <50% HP → false (suicide guard holds under the gate).
//
// Every gate-on assertion has a gate-off (or knowledge-off) contrast that
// must show the legacy behavior. Run:
//   node scripts/test-buildfund-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const bf = require('./policies/buildfund');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// A live wave-3 fight. Returns {Game, ctx, f, p}.
async function wave3Fight(seed, mid, pct) {
  const { Game } = await loadGame({ seed, mode: 'buildfund-test' });
  await setupGame(Game);
  Game.unlockedWave = () => 3; // policy-side: pretend wave-3 is unlocked
  Game.startCombat(mid);
  const f = Game.tbfight;
  const p = Game.tbFighter('p');
  p.maxHp = 200; p.hp = Math.round(200 * (pct == null ? 1 : pct));
  return { Game, ctx: {}, f, p };
}
function fighterOf(Game, mid) {
  return (Game.tbfight.fighters || []).find(x => x && x.kind === 'monster' && bf.bfMidOf(x) === mid);
}
// Fund the fixture scholar: spear + hide armor, honestly equipped
// (slot resolution mirrors the policy's bfEquipBest).
function equipSlot(Game, it) {
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
    const def = (Game.data.items || []).find(d => d.id === (it.itemId || it.id));
    if (def && def.class === 'weapon') {
      if (Seq && typeof Seq.isRangedWeapon === 'function' && Seq.isRangedWeapon(def)) return 'ranged';
      return 'melee';
    }
    if (Seq && typeof Seq.slotForItem === 'function') {
      const want = Seq.slotForItem(def);
      if (want) return want;
    }
  } catch (e) {}
  return 'armor';
}
function fundFixture(Game) {
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'hunting_spear', name: 'Hunting spear', units: 1 });
  s.inventory.push({ itemId: 'hide_armor', name: 'Hide armor', units: 1 });
  for (const iid of ['hunting_spear', 'hide_armor']) {
    const it = s.inventory.find(i => i.itemId === iid);
    const idx = s.inventory.indexOf(it);
    try { Game.equip(idx, equipSlot(Game, it)); } catch (e) {}
  }
}

(async () => {
  // ---- 1. gate OFF = pure delegation ----
  delete process.env.BUILDFUND;
  ok('gate OFF: buildFundOn() false', bf.buildFundOn() === false);
  const g1 = await loadGame({ seed: 42, mode: 'bf-delegate-a' }); await setupGame(g1.Game);
  const g2 = await loadGame({ seed: 42, mode: 'bf-delegate-b' }); await setupGame(g2.Game);
  const ctxA = {}, ctxB = {};
  leadcourt.daily(g1.Game, ctxA);
  bf.buildfundLead.daily(g2.Game, ctxB);
  ok('gate OFF: buildfund-lead.daily byte-identical to leadcourt.daily (same seed)',
    JSON.stringify(ctxA) === JSON.stringify(ctxB),
    'diverged keys: ' + JSON.stringify(Object.keys(ctxB).filter(k => !(k in ctxA))));

  // ---- 2. craft leg: hunting_spear ----
  process.env.BUILDFUND = '1';
  ok('gate ON: buildFundOn() true', bf.buildFundOn() === true);
  {
    const { Game } = await loadGame({ seed: 43, mode: 'bf-craft' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.inventory.push({ name: 'Branch', material: 'branch', units: 3 });
    s.inventory.push({ name: 'Stone', material: 'stone', units: 3 });
    s.inventory.push({ name: 'Vine', material: 'vine', units: 5 });
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.hunting_spear = { level: 2 };
    const ctx = {};
    bf.fundBuild(Game, ctx);
    ok('GREEN: spear crafted with knowledge+materials', (ctx.bfSpearCrafts || 0) >= 1, JSON.stringify({ tries: ctx.bfSpearTries, crafts: ctx.bfSpearCrafts }));
    ok('GREEN: spear equipped (bonus 30)', bf.equippedWeaponBonus(Game) >= 30, 'bonus=' + bf.equippedWeaponBonus(Game));
  }
  { // RED: gate off → no craft even with everything on hand
    delete process.env.BUILDFUND;
    const { Game } = await loadGame({ seed: 43, mode: 'bf-craft-red' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.inventory.push({ name: 'Branch', material: 'branch', units: 3 });
    s.inventory.push({ name: 'Stone', material: 'stone', units: 3 });
    s.inventory.push({ name: 'Vine', material: 'vine', units: 5 });
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.hunting_spear = { level: 2 };
    const ctx = {};
    bf.buildfundLead.daily(Game, ctx); // full daily, gate off
    ok('RED: gate off → no spear craft attempted', (ctx.bfSpearTries || 0) === 0);
    ok('RED: gate off → no bf* keys at all', Object.keys(ctx).filter(k => k.indexOf('bf') === 0 || k === '_huntCommit').length === 0,
      JSON.stringify(Object.keys(ctx).filter(k => k.indexOf('bf') === 0)));
    process.env.BUILDFUND = '1';
  }
  { // knowledge gate: no recipe → no craft (honest)
    const { Game } = await loadGame({ seed: 44, mode: 'bf-craft-unk' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.inventory.push({ name: 'Branch', material: 'branch', units: 3 });
    s.inventory.push({ name: 'Stone', material: 'stone', units: 3 });
    s.inventory.push({ name: 'Vine', material: 'vine', units: 5 });
    const ctx = {};
    bf.fundBuild(Game, ctx);
    ok('no recipe knowledge → no craft (knowledge gate honest)', (ctx.bfSpearTries || 0) === 0);
  }

  // ---- 3. armor leg: hide_armor ----
  {
    const { Game } = await loadGame({ seed: 45, mode: 'bf-armor' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.inventory.push({ name: 'Hide', material: 'hide', units: 3 });
    s.inventory.push({ name: 'Vine', material: 'vine', units: 3 });
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.hide_armor = { level: 2 };
    const ctx = {};
    bf.fundBuild(Game, ctx);
    ok('GREEN: hide armor crafted', (ctx.bfHideCrafts || 0) >= 1, JSON.stringify({ tries: ctx.bfHideTries, crafts: ctx.bfHideCrafts }));
    ok('GREEN: armor worn (P>=20)', bf.armorP(Game) >= 20, 'P=' + bf.armorP(Game));
  }
  {
    delete process.env.BUILDFUND;
    const { Game } = await loadGame({ seed: 45, mode: 'bf-armor-red' });
    await setupGame(Game);
    const s = Game.state.scholar;
    s.inventory.push({ name: 'Hide', material: 'hide', units: 3 });
    s.inventory.push({ name: 'Vine', material: 'vine', units: 3 });
    Game.state.codex.recipes = Game.state.codex.recipes || {};
    Game.state.codex.recipes.hide_armor = { level: 2 };
    const ctx = {};
    bf.buildfundLead.daily(Game, ctx);
    ok('RED: gate off → no hide craft attempted', (ctx.bfHideTries || 0) === 0);
    process.env.BUILDFUND = '1';
  }

  // ---- 4. spool trick: wait during record ----
  {
    const { Game, ctx, p } = await wave3Fight(46, 'spool', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.spool = { stage: 'observed' };
    Game.state.villagerTricks = { spool: true }; // village learned it non-lethally
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'record'; m.spRec = [];
    let waited = false;
    const origWait = Game.tbPlayerWait.bind(Game);
    Game.tbPlayerWait = function () { waited = true; return origWait(); };
    ok('fixture: player turn on entry', Game.tbIsPlayerTurn() === true);
    const r = bf.buildfundLead.fight(Game, ctx);
    ok('GREEN: spool record + known trick → wait played', waited && r === true, JSON.stringify({ waited, r }));
    ok('GREEN: trick counted', (ctx.bfSpoolWaits || 0) === 1);
    ok('GREEN: winnable race committed', ctx._huntCommit === true, JSON.stringify(ctx.bfFirstCommit && { rtk: ctx.bfFirstCommit.roundsToKill, rtd: ctx.bfFirstCommit.roundsToDie }));
  }
  { // RED: no village knowledge → no wait (fights blind, honestly)
    const { Game, ctx } = await wave3Fight(46, 'spool', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.spool = { stage: 'observed' };
    Game.state.villagerTricks = {}; // nobody knows the trick
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'record'; m.spRec = [];
    let waited = false;
    const origWait = Game.tbPlayerWait.bind(Game);
    Game.tbPlayerWait = function () { waited = true; return origWait(); };
    bf.buildfundLead.fight(Game, ctx);
    ok('RED: spool record + unknown trick → no wait (blind, honest)', waited === false && (ctx.bfSpoolWaits || 0) === 0);
  }

  // ---- 5. chorus trick: dodge the downbeat ----
  {
    const { Game, ctx, p } = await wave3Fight(47, 'chorus_line', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.chorus_line = { stage: 'observed' };
    Game.state.villagerTricks = { chorus_line: true };
    const m = fighterOf(Game, 'chorus_line');
    m.clBeat = 3; m.clFacing = { x: 1, y: 0 }; // beat 4 next, facing +x
    m.mx = 4; m.my = 4; p.mx = 6; p.my = 4; // scholar in the kick cone
    const before = p.mx + ',' + p.my;
    const beforeDot = (p.mx - m.mx) * 1 + (p.my - m.my) * 0;
    bf.buildfundLead.fight(Game, ctx);
    const after = p.mx + ',' + p.my;
    ok('GREEN: beat-4 incoming + in cone → dodge move', before !== after && (ctx.bfChorusMoves || 0) === 1,
      JSON.stringify({ before, after }));
    // the dodge steps out of the deepest part of the cone (moving on the
    // beat is the dodge: 0.25×; a full flank would be 0.125×)
    const afterDot = (p.mx - m.mx) * 1 + (p.my - m.my) * 0;
    ok('GREEN: dodge tile shallower in the cone (dot down)', afterDot < beforeDot,
      'dot ' + beforeDot + ' → ' + afterDot);
  }
  { // RED: unknown trick → no dodge
    const { Game, ctx, p } = await wave3Fight(47, 'chorus_line', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.chorus_line = { stage: 'observed' };
    Game.state.villagerTricks = {};
    const m = fighterOf(Game, 'chorus_line');
    m.clBeat = 3; m.clFacing = { x: 1, y: 0 };
    m.mx = 4; m.my = 4; p.mx = 6; p.my = 4;
    const before = p.mx + ',' + p.my;
    bf.buildfundLead.fight(Game, ctx);
    ok('RED: unknown trick → no dodge move', (ctx.bfChorusMoves || 0) === 0 && (p.mx + ',' + p.my) === before);
  }

  // ---- 6. buffering trick: wait the predicted strike ----
  {
    const { Game, ctx } = await wave3Fight(48, 'buffering', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.buffering = { stage: 'observed' };
    Game.state.villagerTricks = { buffering: true };
    const m = fighterOf(Game, 'buffering');
    m.bufPending = { type: 'predict', x: 5, y: 5 }; // announced strike
    let waited = false;
    const origWait = Game.tbPlayerWait.bind(Game);
    Game.tbPlayerWait = function () { waited = true; return origWait(); };
    bf.buildfundLead.fight(Game, ctx);
    ok('GREEN: predict announced + known trick → wait (whiff)', waited && (ctx.bfBufferWaits || 0) === 1);
  }
  { // closeEyes cycle when no predict pending
    const { Game, ctx, p } = await wave3Fight(49, 'buffering', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.buffering = { stage: 'observed' };
    Game.state.villagerTricks = { buffering: true };
    const m = fighterOf(Game, 'buffering');
    m.bufPending = null; m.bufSynced = false;
    p.bufEyesClosed = 0;
    const r = bf.buildfundLead.fight(Game, ctx);
    ok('GREEN: no predict pending → close eyes (faintest-frame setup)', (ctx.bfCloseEyes || 0) === 1 && r === true,
      'eyesClosed=' + p.bufEyesClosed);
  }
  { // RED: unknown trick → neither wait nor closeEyes
    const { Game, ctx } = await wave3Fight(48, 'buffering', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.buffering = { stage: 'observed' };
    Game.state.villagerTricks = {};
    const m = fighterOf(Game, 'buffering');
    m.bufPending = { type: 'predict', x: 5, y: 5 };
    let waited = false;
    const origWait = Game.tbPlayerWait.bind(Game);
    Game.tbPlayerWait = function () { waited = true; return origWait(); };
    bf.buildfundLead.fight(Game, ctx);
    ok('RED: unknown trick → no predict-wait', waited === false && (ctx.bfBufferWaits || 0) === 0);
  }

  // ---- 7. assessment: commit vs decline ----
  {
    // funded + healthy + observed + known trick → commit (GREEN)
    const { Game, ctx, p } = await wave3Fight(50, 'spool', 1.0);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.spool = { stage: 'observed' };
    Game.state.villagerTricks = { spool: true };
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'replay'; // not recording — no trick intercept; assessment only
    // neutralize the study leg: codex already observed, so no study turn
    bf.buildfundLead.fight(Game, ctx);
    ok('GREEN: funded healthy build vs spool → committed', ctx._huntCommit === true,
      JSON.stringify(ctx.bfFirstCommit ? { rtk: ctx.bfFirstCommit.roundsToKill, rtd: ctx.bfFirstCommit.roundsToDie, dpr: ctx.bfFirstCommit.playerDPR } : null));
  }
  {
    // unfunded + fragile → honest decline (RED contrast: the old policy
    // fled everything; the new one declines THIS race on the numbers)
    const { Game, ctx } = await wave3Fight(50, 'spool', 1.0);
    // no funding, no codex, no trick: bare scholar
    const p = Game.tbFighter('p');
    p.maxHp = 100; p.hp = 100;
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'replay';
    m.hp = m.maxHp = 340;
    bf.buildfundLead.fight(Game, ctx);
    ok('honest decline: bare scholar vs 340hp spool → no commit', ctx._huntCommit !== true && (ctx.bfDeclines || 0) === 1,
      JSON.stringify(ctx.bfFirstDecline ? { rtk: ctx.bfFirstDecline.roundsToKill, rtd: ctx.bfFirstDecline.roundsToDie } : null));
  }
  {
    // suicide guard: funded but badly hurt → no commit even under the gate
    const { Game, ctx } = await wave3Fight(50, 'spool', 0.4);
    fundFixture(Game);
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters.spool = { stage: 'observed' };
    Game.state.villagerTricks = { spool: true };
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'replay';
    bf.buildfundLead.fight(Game, ctx);
    ok('suicide guard: 40% HP → no commit under the gate', ctx._huntCommit !== true);
  }
  { // RED: gate off → wrapper never marks the fight
    delete process.env.BUILDFUND;
    const { Game, ctx } = await wave3Fight(50, 'spool', 1.0);
    fundFixture(Game);
    const m = fighterOf(Game, 'spool');
    m.spPhase = 'replay';
    bf.buildfundLead.fight(Game, ctx);
    ok('RED: gate off → no _huntCommit marking', !('_huntCommit' in ctx));
    process.env.BUILDFUND = '1';
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
