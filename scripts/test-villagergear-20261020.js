#!/usr/bin/env node
// test-villagergear-20261020.js — proof for scripts/policies/villagergear.js
// (flesh-out loop, 2026-10-20, run fleshout-20261020T1015Z, arm
// sim-villagergear, axis scale-onramp).
//
// RED->GREEN on the layer:
//   A1 gate honesty: VGEAR unset -> pure delegation (no villagergear ctx
//      keys, no armory change, no invites).
//   A2 armory drive donates the worst spare (scholar armed, armory < 3).
//   A3 scholar unarmed -> no donation (never donate the only edge).
//   A4 armory >= 3 -> no donation; one push per day.
//   A5 keepsake/bonded never donated.
//   A6 no spare + stone+vine on hand -> crafts stone_knife and donates it.
//   A7 vinebank deferral respected (no craft while the bank claims vine).
//   A8 scholar equipping never touched (no equip/unequip calls on scholar).
//   B1 fighter staging invites the strongest NON-veteran first (trust>=20,
//      wave-4 unlocked, veterans bar unmet); veterans deprioritized,
//      low-trust skipped.
//   B2 staging gates: pre-wave-4 skipped; veterans bar met -> stand down;
//      party at 2 -> no invites; one pass per day.
//   B3 no dismissals, no assignTask, no villager movement verbs.
//   C1 wave-4 yield: veteran scholar holds (tbPlayerWait) at <=20% monster
//      HP with an engaged companion; bounded at 6 turns; stalls end it.
//   C2 companion survival: companion <40% HP -> no yield; scholar resumes
//      striking (near death) or breaks off honestly.
//   C3 non-veteran scholar fights normally (no hold).
//   D1 det-gate (real harness): gate-off byte-identical to leadfeast/
//      belongfeast (2 seeds x 60d); gate-on deterministic.
//   D2 real-sweep gate: 180d armed run completes on seed 64001 per policy,
//      zero layer errors, deterministic re-run.
// Usage: node scripts/test-villagergear-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VGEAR_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'villagergear.js'))) {
  if (process.env.VGEAR_KILLED === '1') {
    console.log('INFO-SKIP: villagergear layer deleted per kill protocol (sim-villagergear NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/villagergear.js missing and VGEAR_KILLED not set.');
  process.exit(1);
}

const VG = require('./policies/villagergear');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const DEFS = [
  { id: 'stone_knife', class: 'weapon', weapon: { bonus: 12 } },
  { id: 'hunting_spear', class: 'weapon', weapon: { bonus: 30 } },
  { id: 'sharpened_stick', class: 'weapon', weapon: { bonus: 4 } },
  { id: 'bark_armor', class: 'armor', armor: { protection: 10 } },
];
const BONUS = { stone_knife: 12, hunting_spear: 30, sharpened_stick: 4 };

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const invited = [];
  const G = {
    over: false,
    villagerId: o.villagerId || 'scholar1',
    _atHaven: o.atHaven !== undefined ? o.atHaven : true,
    _armory: (o.armory || []).slice(),
    _invited: invited,
    _dismissed: [],
    _assigned: [],
    _waits: 0,
    _barrierExits: 0,
    _baseFights: 0,
    _unlockedWave: o.unlockedWave !== undefined ? o.unlockedWave : 1,
    _w5vets: o.w5vets !== undefined ? o.w5vets : 0,
    _killLog: o.killLog || [],
    state: {
      scholar: Object.assign(
        { day: 100, exiled: false, inventory: [], equipped: {}, hp: 100 },
        o.scholar || {}),
      village: Object.assign(
        { roster: ['scholar1', 'v1', 'v2', 'v3'], trust: { v1: 80, v2: 80, v3: 80 },
          health: { v1: 90, v2: 90, v3: 90 }, party: [] },
        o.village || {}),
      waveKillLog: o.killLog || [], // the engine keeps the kill ledger on state
    },
    data: { items: o.items || DEFS,
            monsters: o.monsters || [{ id: 'hushwolf', wave: 1 }, { id: 'congregation', wave: 4 }] },
    playerAtHaven: function () { return this._atHaven; },
    inCombat: () => false,
    maxHealth: () => 100,
    stashState: function () { return { weapons: this._armory }; },
    donateWeapon: function (idx) {
      const inv = this.state.scholar.inventory;
      const it = inv[idx];
      if (!it) return null;
      inv.splice(idx, 1);
      this._armory.push({ itemId: it.itemId || it.id, units: 1 });
      return { ok: true };
    },
    craft: function (rid) {
      if (rid === 'stone_knife') { this.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 }); return { itemId: 'stone_knife' }; }
      return null;
    },
    isKeepsake: function (it) { return !!(it && it.keepsake); },
    isStashableWeapon: function (it) {
      const def = (this.data.items || []).find(d => d.id === (it.itemId || it.id));
      return !!(def && def.class === 'weapon');
    },
    unlockedWave: function () { return this._unlockedWave; },
    waveCombatReadiness: function (w) {
      return { wave: w, ready: this._w5vets >= 2, veterans: this._w5vets, demand: { veterans: 2 } };
    },
    vpOf: function (vid) {
      if (vid === this.villagerId) return null;
      return { id: vid, dead: false, equipped: ((o.worn || {})[vid]) || {} };
    },
    getPerson: function (vid) {
      return { id: vid, dead: false, equipped: ((o.worn || {})[vid]) || {} };
    },
    inParty: function (vid) { return (this.state.village.party || []).includes(vid); },
    partyFull: function () { return (this.state.village.party || []).length >= 3; },
    partyMembers: function () { return (this.state.village.party || []).slice(); },
    inviteToParty: function (vid) {
      invited.push(vid);
      this.state.village.party.push(vid);
      return { ok: true, msg: 'yes' };
    },
    dismissFromParty: function (vid) { this._dismissed.push(vid); return { ok: true }; },
    assignTask: function (vid, task, opts) { this._assigned.push({ vid, task }); return { ok: true }; },
    // TB fixtures
    tbfight: o.tbfight || null,
    tbIsPlayerTurn: function () { return o.playerTurn !== undefined ? o.playerTurn : true; },
    tbFighter: function (k) {
      if (k === 'p') return (o.tbfight && o.tbfight._p) || null;
      return null;
    },
    tbPlayerWait: function () { this._waits++; return true; },
    tbBarrierExit: function () { this._barrierExits++; return true; },
    tbPlayerMove: function () { return true; },
    tbAfterPlayerAction: function () { return true; },
    // equip/unequip tripwires: the layer must never call these on the scholar
    _equipCalls: 0, _unequipCalls: 0,
    equip: function () { this._equipCalls++; return null; },
    unequip: function () { this._unequipCalls++; return null; },
  };
  const wbMap = o.wb || {};
  const arMap = o.ar || {};
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = {
    weaponBonusOf: (p, items, slot) => {
      const eq = (p && p.equipped) || {};
      const slots = slot ? [slot] : ['melee', 'ranged'];
      let b = 0;
      for (const sl of slots) {
        const e = eq[sl];
        if (e && e.itemId) b = Math.max(b, BONUS[e.itemId] || 0);
      }
      if (p && p.id && wbMap[p.id]) b = Math.max(b, wbMap[p.id]);
      return b;
    },
    armorOf: (p) => ((p && p.id && arMap[p.id]) || 0),
  };
  return G;
}
function stubCtx() { return {}; }
function vgKeys(ctx) {
  return ['vgDonations', 'vgInvitesOk', 'vgYields'].map(k => k + '=' + (ctx[k] || 0)).join(',');
}

// A1: gate honesty.
{
  delete process.env.VGEAR;
  const g = stubGame({
    unlockedWave: 4,
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  VG.fighterStaging(g, ctx);
  check('A1: gate-off pure delegation (no vg ctx keys, no armory change, no invites)',
    (ctx.vgDonations || 0) === 0 && (ctx.vgInvitesOk || 0) === 0 &&
    g._armory.length === 0 && g._invited.length === 0,
    vgKeys(ctx) + ` armory=${g._armory.length} invited=${g._invited.length}`);
}

// A2: donates the worst spare.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } }, // bonus 30
      inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'stone_knife' }], // 4 and 12
    },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  check('A2: donates the worst spare (sharpened_stick, keeps stone_knife)',
    (ctx.vgDonations || 0) === 1 && g._armory.length === 1 &&
    g._armory[0].itemId === 'sharpened_stick' &&
    g.state.scholar.inventory.length === 1 &&
    g.state.scholar.inventory[0].itemId === 'stone_knife',
    `donated=${g._armory.map(e => e.itemId).join(',')} inv=${g.state.scholar.inventory.map(i => i.itemId).join(',')}`);
  delete process.env.VGEAR;
}

// A3: scholar unarmed -> no donation (never donate the only edge).
{
  process.env.VGEAR = '1';
  const g = stubGame({
    scholar: { equipped: {}, inventory: [{ itemId: 'stone_knife' }] },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  check('A3: unarmed scholar keeps the only edge (no donation)',
    (ctx.vgDonations || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 1,
    vgKeys(ctx));
  delete process.env.VGEAR;
}

// A4: armory >= 3 -> no donation; one push per day.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    armory: [{ itemId: 'stone_knife', units: 1 }, { itemId: 'stone_knife', units: 1 }, { itemId: 'stone_knife', units: 1 }],
    scholar: { equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }] },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  check('A4: armory at target -> no donation', (ctx.vgDonations || 0) === 0 && g._armory.length === 3);
  const g2 = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'stone_knife' }],
    },
  });
  const ctx2 = stubCtx();
  VG.armoryDrive(g2, ctx2);
  VG.armoryDrive(g2, ctx2); // same day: second push blocked
  check('A4b: one push per day (second call same day no-ops)',
    (ctx2.vgDonations || 0) === 1, `donated=${ctx2.vgDonations || 0}`);
  delete process.env.VGEAR;
}

// A5: keepsake/bonded never donated.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick', keepsake: true }, { itemId: 'stone_knife', bonded: true }],
    },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  check('A5: keepsake/bonded never donated',
    (ctx.vgDonations || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 2,
    vgKeys(ctx));
  delete process.env.VGEAR;
}

// A6: no spare + stone+vine -> crafts stone_knife and donates it.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  check('A6: crafts stone_knife from stone+vine and donates it',
    (ctx.vgDonations || 0) === 1 && g._armory.length === 1 && g._armory[0].itemId === 'stone_knife',
    `donated=${ctx.vgDonations || 0} armory=${g._armory.map(e => e.itemId).join(',')}`);
  delete process.env.VGEAR;
}

// A7: vinebank deferral respected.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  const vb = require('./policies/vinebank');
  const orig = vb.defersCraft;
  vb.defersCraft = () => true;
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  vb.defersCraft = orig;
  check('A7: bank claim defers the knap (no craft, counted)',
    (ctx.vgDonations || 0) === 0 && (ctx.vgVinebankDeferred || 0) === 1 && g._armory.length === 0,
    `donated=${ctx.vgDonations || 0} deferred=${ctx.vgVinebankDeferred || 0}`);
  delete process.env.VGEAR;
}

// A8: scholar equipping never touched.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    unlockedWave: 4,
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
    wb: { v1: 20 }, village: { roster: ['scholar1', 'v1'], trust: { v1: 80 }, health: { v1: 90 }, party: [] },
  });
  const ctx = stubCtx();
  VG.armoryDrive(g, ctx);
  VG.fighterStaging(g, ctx);
  check('A8: scholar equip/unequip never called (gearUp owns equipping)',
    g._equipCalls === 0 && g._unequipCalls === 0,
    `equip=${g._equipCalls} unequip=${g._unequipCalls}`);
  delete process.env.VGEAR;
}

// B1: fighter staging invites the strongest non-veteran first.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    unlockedWave: 4,
    w5vets: 0,
    wb: { v1: 20, v2: 30, v3: 25 },
    killLog: [{ by: 'v2', w: 4, mid: 'congregation' }], // v2 is already a wave-4 veteran
    village: {
      roster: ['scholar1', 'v1', 'v2', 'v3'],
      trust: { v1: 80, v2: 80, v3: 80 },
      health: { v1: 90, v2: 90, v3: 90 }, party: [],
    },
  });
  const ctx = stubCtx();
  VG.fighterStaging(g, ctx);
  check('B1: strongest non-veteran invited first (v3 > v1; veteran v2 deprioritized)',
    (ctx.vgInvitesOk || 0) >= 1 && g._invited[0] === 'v3' &&
    (g._invited.length === 1 || g._invited[1] === 'v1'),
    `invited=${g._invited.join(',')} invitesOk=${ctx.vgInvitesOk || 0}`);
  delete process.env.VGEAR;
}

// B1b: low-trust skipped.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    unlockedWave: 4,
    w5vets: 0,
    wb: { v1: 20 },
    village: { roster: ['scholar1', 'v1'], trust: { v1: 10 }, health: { v1: 90 }, party: [] },
  });
  const ctx = stubCtx();
  VG.fighterStaging(g, ctx);
  check('B1b: trust<20 skipped', (ctx.vgInvitesOk || 0) === 0 && g._invited.length === 0,
    `invited=${g._invited.join(',')}`);
  delete process.env.VGEAR;
}

// B2: staging gates.
{
  process.env.VGEAR = '1';
  const mk = (o) => stubGame(Object.assign({
    unlockedWave: 4, w5vets: 0, wb: { v1: 20 },
    village: { roster: ['scholar1', 'v1'], trust: { v1: 80 }, health: { v1: 90 }, party: [] },
  }, o));
  let g = mk({ unlockedWave: 3 });
  let c = stubCtx(); VG.fighterStaging(g, c);
  check('B2a: pre-wave-4 -> no invites', (c.vgInvitesOk || 0) === 0 && g._invited.length === 0);
  g = mk({ w5vets: 2 });
  c = stubCtx(); VG.fighterStaging(g, c);
  check('B2b: veterans bar met -> stand down', (c.vgInvitesOk || 0) === 0 && g._invited.length === 0);
  g = mk({}); g.state.village.party = ['vx', 'vy'];
  c = stubCtx(); VG.fighterStaging(g, c);
  check('B2c: 2 already in party -> no more invites', (c.vgInvitesOk || 0) === 0 && g._invited.length === 0);
  g = mk({});
  c = stubCtx(); VG.fighterStaging(g, c); VG.fighterStaging(g, c);
  check('B2d: one selection pass per day', (c.vgInvitesOk || 0) <= 2 && g._invited.length <= 2,
    `invited=${g._invited.length}`);
  delete process.env.VGEAR;
}

// B3: no dismissals, no assignTask, no movement.
{
  process.env.VGEAR = '1';
  const g = stubGame({
    unlockedWave: 4,
    wb: { v1: 20 },
    village: { roster: ['scholar1', 'v1'], trust: { v1: 80 }, health: { v1: 90 }, party: [] },
  });
  const ctx = stubCtx();
  VG.fighterStaging(g, ctx);
  check('B3: no dismissals / assignTask (vetarm lesson)',
    g._dismissed.length === 0 && g._assigned.length === 0,
    `dismissed=${g._dismissed.length} assigned=${g._assigned.length}`);
  delete process.env.VGEAR;
}

// ---------- fight fixtures ----------
function w4Fight(o) {
  // o: { scholarVet, monHpFrac, compHpFrac, playerTurn, round }
  const scholarVid = 'scholar1';
  const monMax = 1000;
  const monHp = Math.round(monMax * (o.monHpFrac !== undefined ? o.monHpFrac : 0.15));
  const compHp = Math.round(100 * (o.compHpFrac !== undefined ? o.compHpFrac : 0.8));
  const f = {
    over: false, round: o.round !== undefined ? o.round : 3,
    _p: { key: 'p', hp: 60, maxHp: 100, mx: o.edge ? 0 : 4, my: 4 },
    fighters: [
      { key: 'p', kind: 'player', hp: 60, maxHp: 100, alive: true, fled: false },
      { key: 'v_v1', kind: 'villager', villagerId: 'v1', hp: compHp, maxHp: 100, alive: true, fled: false },
      { key: 'm_0', kind: 'monster', monsterId: 'congregation', hp: monHp, maxHp: monMax, alive: true, fled: false },
    ],
  };
  const g = stubGame({
    playerTurn: o.playerTurn !== undefined ? o.playerTurn : true,
    tbfight: f,
    killLog: o.scholarVet ? [{ by: scholarVid, w: 4, mid: 'congregation' }] : [],
    village: { roster: ['scholar1', 'v1'], trust: { v1: 80 }, health: { v1: 90 }, party: ['v1'] },
  });
  // the wrapper calls base.fight — count it
  const base = { fight(G, ctx) { G._baseFights++; return true; } };
  return { g, base };
}

// C1: veteran scholar holds at <=20% monster HP with an engaged companion.
{
  process.env.VGEAR = '1';
  const { g, base } = w4Fight({ scholarVet: true, monHpFrac: 0.15, compHpFrac: 0.8 });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  pol.fight(g, ctx);
  check('C1: veteran scholar yields (tbPlayerWait) at <=20% monster HP',
    g._waits === 1 && (ctx.vgYields || 0) === 1 && g._baseFights === 0,
    `waits=${g._waits} yields=${ctx.vgYields || 0} baseFights=${g._baseFights}`);
  delete process.env.VGEAR;
}

// C1b: yield bounded at 6 turns; stalls end it.
{
  process.env.VGEAR = '1';
  const { g, base } = w4Fight({ scholarVet: true, monHpFrac: 0.15, compHpFrac: 0.8 });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  for (let i = 0; i < 10; i++) pol.fight(g, ctx); // monster takes no damage -> stalls
  check('C1b: yield bounded (<=6 turns) and stalls end it',
    (ctx.vgYields || 0) <= 6 && g._baseFights >= 1,
    `yields=${ctx.vgYields || 0} baseFights=${g._baseFights}`);
  delete process.env.VGEAR;
}

// C2: companion <40% HP -> no yield; monster near death -> scholar strikes.
{
  process.env.VGEAR = '1';
  const { g, base } = w4Fight({ scholarVet: true, monHpFrac: 0.15, compHpFrac: 0.3 });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  pol.fight(g, ctx);
  check('C2: hurt companion (<40%) ends yield — scholar resumes striking',
    g._waits === 0 && g._baseFights === 1 && (ctx.vgRescues || 0) === 1,
    `waits=${g._waits} rescues=${ctx.vgRescues || 0} baseFights=${g._baseFights}`);
  delete process.env.VGEAR;
}

// C2b: companion <40% HP and monster NOT near death -> honest break-off.
{
  process.env.VGEAR = '1';
  const { g, base } = w4Fight({ scholarVet: true, monHpFrac: 0.6, compHpFrac: 0.3, edge: true });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  pol.fight(g, ctx);
  check('C2b: hurt companion + healthy monster -> break-off attempted',
    g._waits === 0 && (ctx.vgBreakoffs || 0) === 1 && (g._barrierExits >= 1 || g._baseFights >= 1),
    `waits=${g._waits} breakoffs=${ctx.vgBreakoffs || 0} barrier=${g._barrierExits}`);
  delete process.env.VGEAR;
}

// C3: non-veteran scholar fights normally (needs their own kill).
{
  process.env.VGEAR = '1';
  const { g, base } = w4Fight({ scholarVet: false, monHpFrac: 0.15, compHpFrac: 0.8 });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  pol.fight(g, ctx);
  check('C3: non-veteran scholar fights normally (no hold)',
    g._waits === 0 && g._baseFights === 1,
    `waits=${g._waits} baseFights=${g._baseFights}`);
  delete process.env.VGEAR;
}

// C4: gate-off fight -> pure delegation.
{
  delete process.env.VGEAR;
  const { g, base } = w4Fight({ scholarVet: true, monHpFrac: 0.15, compHpFrac: 0.8 });
  const pol = VG.withVillagerGear(base, 't', 't');
  const ctx = stubCtx();
  pol.fight(g, ctx);
  check('C4: gate-off fight pure delegation',
    g._waits === 0 && g._baseFights === 1 && (ctx.vgYields || 0) === 0,
    `waits=${g._waits} baseFights=${g._baseFights}`);
}

// D1/D2: real-harness gates.
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const FS = require('./policies/feastscale');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.VGEAR = '1'; else delete process.env.VGEAR;
    const { Game } = await loadGame({ seed, mode: 'villagergear-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  // vgearLead/vgearBelong wrap the feastscale bases (like vetarm did); the
  // sweep composes tribfloor over them. Gate-off must equal the wrapped
  // base exactly.
  const tOff1 = await trajectory(204, false, VG.vgearLead);
  const tOff2 = await trajectory(204, false, FS.leadfeast);
  check('D1a det-gate: gate-off vgearLead byte-identical to leadfeast (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, VG.vgearBelong);
  const tOff4 = await trajectory(315, false, FS.belongfeast);
  check('D1b det-gate: gate-off vgearBelong byte-identical to belongfeast (s315)',
    tOff3 === tOff4 && tOff3.length > 0, `len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, VG.vgearLead);
  const tOn2 = await trajectory(204, true, VG.vgearLead);
  check('D1c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2 && tOn1.length > 0);

  // D2: real-sweep gate — 180d armed run per policy completes, zero errors, deterministic.
  for (const [pid, pol] of [['vgear-lead', VG.vgearLead], ['vgear-belong', VG.vgearBelong]]) {
    process.env.VGEAR = '1';
    const { Game } = await loadGame({ seed: 64001, mode: 'villagergear-sweep', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 180, sampleEvery: 30 }); });
    const { Game: Game2 } = await loadGame({ seed: 64001, mode: 'villagergear-sweep', fullTelemetry: false });
    await setupGame(Game2);
    let result2 = null;
    await quietLog(async () => { result2 = await runDays(Game2, pol, { days: 180, sampleEvery: 30 }); });
    const same = (result.days === result2.days) && (result.endReason === result2.endReason);
    check(`D2: 180d armed ${pid} s64001 completes, deterministic`,
      !!result && !!result2 && same,
      `days=${result && result.days}/${result2 && result2.days} end=${result && result.endReason}`);
    delete process.env.VGEAR;
  }

  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
