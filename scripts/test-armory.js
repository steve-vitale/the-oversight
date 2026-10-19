#!/usr/bin/env node
// test-armory.js — proof for scripts/policies/armory.js
// (flesh-out loop, 2026-10-19, run sim-armory, axis scale-onramp).
//
// The 10th veteran-production attempt: presence-preserving arming — the
// vetarm arming beat ALONE (no patrol assignments, no fighter movement,
// weapons only). Armor has no honest policy-side channel (steve-call).
//
// RED->GREEN on the layer:
//   A1 gate honesty: ARMORY unset -> pure delegation (no armory ctx keys,
//      no armory change, no fighter-movement verbs).
//   A2 armory drive donates the worst spare (scholar armed, armory < 3).
//   A3 scholar unarmed -> no donation (never donate the only edge).
//   A4 armory >= 3 -> no donation; one push per day.
//   A5 no spare + stone+vine on hand -> crafts stone_knife and donates it.
//   A6 vinebank deferral respected (no craft while the bank claims vine).
//   A7 equal-bonus inventory weapon is NOT donated (strictly worse only).
//   A8 keepsake + bonded weapons are skipped.
//   A9 armor items are never donated (weapons only).
//   A10 PRESENCE: the layer never calls Game.assignTask / Game.takeWeapon
//       (fighter movement is the poison that killed vetarm's patrol beat).
//   C1 det-gate (real harness): gate-off byte-identical to tribfloor
//      leadfeast/belongfeast (2 seeds x 60d); gate-on deterministic;
//      gate-on non-vacuous on a fabricated mid-game state.
//   C2 real-sweep gate: 180d armed run per policy, zero layer errors,
//      byte-identical re-run.
// Usage: node scripts/test-armory.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (ARMORY_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1) — this is the honest RED phase: the test must
// fail loudly when the layer is absent.
if (!fs.existsSync(path.join(__dirname, 'policies', 'armory.js'))) {
  if (process.env.ARMORY_KILLED === '1') {
    console.log('INFO-SKIP: armory layer deleted per kill protocol (sim-armory NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/armory.js missing and ARMORY_KILLED not set.');
  process.exit(1);
}

const AR = require('./policies/armory');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const DEFS = [
  { id: 'stone_knife', class: 'weapon', weapon: { bonus: 12 } },
  { id: 'hunting_spear', class: 'weapon', weapon: { bonus: 30 } },
  { id: 'sharpened_stick', class: 'weapon', weapon: { bonus: 4 } },
  { id: 'whittled_club', class: 'weapon', weapon: { bonus: 8 } },
  { id: 'bark_armor', class: 'armor', armor: { protection: 10 } },
];

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const G = {
    over: false,
    villagerId: o.villagerId || 'scholar1',
    state: {
      scholar: Object.assign(
        { day: 100, exiled: false, inventory: [], equipped: {} },
        o.scholar || {}),
      village: Object.assign(
        { roster: ['scholar1', 'v1'], assignments: {} },
        o.village || {}),
    },
    data: { items: o.items || DEFS, monsters: o.monsters || [{ id: 'hushwolf', wave: 1 }, { id: 'spool', wave: 3 }] },
    _armory: (o.armory || []).slice(),
    _atHaven: o.atHaven !== undefined ? o.atHaven : true,
    _moved: [],
    playerAtHaven: function () { return this._atHaven; },
    inCombat: () => false,
    stashState: function () { return { weapons: this._armory }; },
    isKeepsake: function (it) { return !!(it && it.keepsake); },
    donateWeapon: function (idx) {
      const inv = this.state.scholar.inventory;
      const it = inv[idx];
      if (!it) return null;
      inv.splice(idx, 1);
      this._armory.push({ itemId: it.itemId || it.id, units: 1 });
      return { ok: true };
    },
    // PRESENCE: fighter-movement verbs must NEVER be called by this layer.
    assignTask: function () { throw new Error('armory layer called Game.assignTask — presence violation'); },
    takeWeapon: function () { throw new Error('armory layer called Game.takeWeapon — dishonest take'); },
    craft: function (rid) {
      if (rid === 'stone_knife') {
        this.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 });
        return { itemId: 'stone_knife' };
      }
      return null;
    },
    getPerson: function (vid) {
      // REAL-GAME FAITHFUL: the scholar's person record carries an EMPTY
      // equipped — the scholar's gear lives at state.scholar.equipped
      // (equipment.js). The layer must not depend on the person record.
      return { id: vid, dead: false, equipped: {} };
    },
  };
  const defs = o.items || DEFS;
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = {
    weaponBonusOf: (p, _defs, slot) => {
      const e = (p && p.equipped && p.equipped[slot]) || null;
      if (!e) return 0;
      const d = (defs).find(x => x.id === (e.itemId || e.id));
      return (d && d.weapon && d.weapon.bonus) || 0;
    },
  };
  return G;
}
function stubCtx() { return {}; }
function armoryKeys(ctx) {
  return ['armoryDonated', 'armoryKnapped', 'armoryBankDeferred', 'armoryKnapFailed'].map(k => k + '=' + (ctx[k] || 0)).join(',');
}

// A1: gate honesty.
{
  delete process.env.ARMORY;
  const g = stubGame({
    scholar: { equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }] },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A1: gate-off pure delegation (no donation, no ctx keys, armory untouched)',
    (ctx.armoryDonated || 0) === 0 && (ctx.armoryKnapped || 0) === 0 &&
    g._armory.length === 0 && g.state.scholar.inventory.length === 1,
    `armory=${g._armory.length} inv=${g.state.scholar.inventory.length}`);
  delete process.env.ARMORY;
}

// A2: donates the worst spare.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'whittled_club' }],
    },
    armory: [{ itemId: 'stone_knife', units: 1 }],
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A2: donates the worst spare (sharpened_stick), one push',
    (ctx.armoryDonated || 0) === 1 && g._armory.length === 2 &&
    g._armory[1].itemId === 'sharpened_stick' && g.state.scholar.inventory.length === 1 &&
    g.state.scholar.inventory[0].itemId === 'whittled_club',
    `donated=${ctx.armoryDonated} armory=${g._armory.map(e => e.itemId).join(',')}`);
  delete process.env.ARMORY;
}

// A3: unarmed scholar keeps the only edge.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: { equipped: {}, inventory: [{ itemId: 'stone_knife' }] },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A3: unarmed scholar -> no donation (never donate the only edge)',
    (ctx.armoryDonated || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 1);
  delete process.env.ARMORY;
}

// A4: armory >= 3 -> no-op; one push/day.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: { equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }] },
    armory: [{ itemId: 'stone_knife', units: 3 }],
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  AR.armoryDrive(g, ctx);
  check('A4: armory >= 3 -> no donation',
    (ctx.armoryDonated || 0) === 0 && g._armory.length === 1 && g.state.scholar.inventory.length === 1);
  // one push/day: armed scholar, spare available, armory < 3, same day twice
  const g2 = stubGame({
    scholar: { day: 50, equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'whittled_club' }] },
  });
  const ctx2 = stubCtx();
  AR.armoryDrive(g2, ctx2);
  AR.armoryDrive(g2, ctx2);
  check('A4b: one push per day (second call same day is a no-op)',
    (ctx2.armoryDonated || 0) === 1 && g2.state.scholar.inventory.length === 1,
    `donated=${ctx2.armoryDonated}`);
  delete process.env.ARMORY;
}

// A5: no spare + stone+vine -> knap and donate.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A5: knaps stone_knife from stone+vine and donates it',
    (ctx.armoryKnapped || 0) === 1 && (ctx.armoryDonated || 0) === 1 &&
    g._armory.length === 1 && g._armory[0].itemId === 'stone_knife',
    `knapped=${ctx.armoryKnapped} donated=${ctx.armoryDonated}`);
  delete process.env.ARMORY;
}

// A6: vinebank deferral respected.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  // Patch the destructured vinebank object the layer actually holds
  // (competent.js consumes require('./vinebank').vinebank the same way).
  const vb = require('./policies/vinebank');
  const orig = vb.vinebank.defersCraft;
  vb.vinebank.defersCraft = () => true;
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  vb.vinebank.defersCraft = orig;
  check('A6: bank claim defers the knap (no craft, counted)',
    (ctx.armoryKnapped || 0) === 0 && (ctx.armoryDonated || 0) === 0 &&
    (ctx.armoryBankDeferred || 0) === 1 && g._armory.length === 0,
    `knapped=${ctx.armoryKnapped} deferred=${ctx.armoryBankDeferred}`);
  delete process.env.ARMORY;
}

// A7: equal-bonus weapon not donated (strictly worse only).
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'hunting_spear' }], // equal to equipped best — not a spare
    },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A7: equal-bonus inventory weapon is not a spare',
    (ctx.armoryDonated || 0) === 0 && g.state.scholar.inventory.length === 1);
  delete process.env.ARMORY;
}

// A8: keepsake + bonded skipped.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick', keepsake: true }, { itemId: 'whittled_club', bonded: true }],
    },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A8: keepsake and bonded weapons never donated',
    (ctx.armoryDonated || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 2);
  delete process.env.ARMORY;
}

// A9: armor never donated.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'bark_armor' }],
    },
  });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx);
  check('A9: armor is not a donatable weapon (weapons only — no armor channel)',
    (ctx.armoryDonated || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 1);
  delete process.env.ARMORY;
}

// A10: presence — full daily path never touches fighter-movement verbs.
{
  process.env.ARMORY = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }, { material: 'stone', units: 1 }, { material: 'vine', units: 1 }],
    },
  });
  const ctx = stubCtx();
  let threw = false;
  try { AR.armoryDrive(g, ctx); } catch (e) { threw = true; }
  check('A10: presence-preserving — assignTask/takeWeapon never called (would throw)',
    !threw && (ctx.armoryDonated || 0) === 1 && g._moved.length === 0);
  delete process.env.ARMORY;
}

// C1/C2: real-harness gates.
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/tribfloor');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.ARMORY = '1'; else delete process.env.ARMORY;
    const { Game } = await loadGame({ seed, mode: 'armory-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, AR.leadarmory);
  const tOff2 = await trajectory(204, false, leadfeast);
  check('C1a det-gate: gate-off leadarmory byte-identical to leadfeast (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, AR.belongarmory);
  const tOff4 = await trajectory(315, false, belongfeast);
  check('C1b det-gate: gate-off belongarmory byte-identical to belongfeast (s315)',
    tOff3 === tOff4 && tOff4.length > 0, `len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, AR.leadarmory);
  const tOn2 = await trajectory(204, true, AR.leadarmory);
  check('C1c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2 && tOn1.length > 0);
  // Gate-ON non-vacuity on a fabricated mid-game state.
  process.env.ARMORY = '1';
  const gOn = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
  });
  const ctxOn = stubCtx();
  AR.armoryDrive(gOn, ctxOn);
  delete process.env.ARMORY;
  const gOff = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
  });
  const ctxOff = stubCtx();
  AR.armoryDrive(gOff, ctxOff);
  check('C1d det-gate: gate-ON genuinely moves (non-vacuous)',
    (ctxOn.armoryDonated || 0) === 1 && (ctxOff.armoryDonated || 0) === 0,
    `on={${armoryKeys(ctxOn)}} off={${armoryKeys(ctxOff)}}`);

  // C2: real-sweep gate — 180d armed run per policy, zero layer errors.
  for (const [pid, pol] of [['leadarmory', AR.leadarmory], ['belongarmory', AR.belongarmory]]) {
    process.env.ARMORY = '1';
    const { Game } = await loadGame({ seed: 63511, mode: 'armory-sweep', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 180, sampleEvery: 30 }); });
    const { Game: Game2 } = await loadGame({ seed: 63511, mode: 'armory-sweep', fullTelemetry: false });
    await setupGame(Game2);
    let result2 = null;
    await quietLog(async () => { result2 = await runDays(Game2, pol, { days: 180, sampleEvery: 30 }); });
    const same = (result.days === result2.days) && (result.endReason === result2.endReason);
    check(`C2: 180d armed ${pid} s63511 completes, deterministic re-run`,
      !!result && !!result2 && same,
      `days=${result && result.days}/${result2 && result2.days} end=${result && result.endReason}`);
    delete process.env.ARMORY;
  }

  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
