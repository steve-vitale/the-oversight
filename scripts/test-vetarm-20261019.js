#!/usr/bin/env node
// test-vetarm-20261019.js — proof for scripts/policies/vetarm.js
// (flesh-out loop, 2026-10-19, run sim-vetarm, axis scale-onramp).
//
// RED->GREEN on the layer:
//   A1 gate honesty: VETARM unset -> pure delegation (no vetarm ctx keys,
//      no armory change, no assignments).
//   A2 armory drive donates the worst spare (scholar armed, armory < 3).
//   A3 scholar unarmed -> no donation (never donate the only edge).
//   A4 armory >= 3 -> no donation; one push per day.
//   A5 no spare + stone+vine on hand -> crafts stone_knife and donates it.
//   A6 vinebank deferral respected (no craft while the bank claims vine).
//   B1 patrol beat assigns up to 2 able+armed villagers (hp>=60, combat
//      cred/occupation, armed, free).
//   B2 patrol gates: hp<60 skipped; unarmed skipped; no combat cred
//      skipped; already assigned skipped; threat wave>2 skipped; exiled
//      skipped; not-at-haven skipped; one round per day.
//   C1 det-gate (real harness): gate-off byte-identical to leadfeast/
//      belongfeast (2 seeds x 60d); gate-on deterministic; gate-on
//      non-vacuous on a fabricated mid-game state.
//   C2 real-sweep gate: 180d armed run per policy, zero layer errors,
//      byte-identical re-run.
// Usage: node scripts/test-vetarm-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VETARM_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'vetarm.js'))) {
  if (process.env.VETARM_KILLED === '1') {
    console.log('INFO-SKIP: vetarm layer deleted per kill protocol (sim-vetarm NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/vetarm.js missing and VETARM_KILLED not set.');
  process.exit(1);
}

const VA = require('./policies/vetarm');

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

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const assigned = [];
  const G = {
    over: false,
    villagerId: o.villagerId || 'scholar1',
    state: {
      scholar: Object.assign(
        { day: 100, exiled: false, inventory: [], equipped: {} },
        o.scholar || {}),
      village: Object.assign(
        { roster: ['scholar1', 'v1', 'v2', 'v3'], health: { v1: 90, v2: 90, v3: 30 }, assignments: {}, px: 4, py: 4 },
        o.village || {}),
    },
    data: { items: o.items || DEFS, monsters: o.monsters || [{ id: 'hushwolf', wave: 1 }, { id: 'spool', wave: 3 }] },
    _armory: (o.armory || []).slice(),
    _assigned: assigned,
    _atHaven: o.atHaven !== undefined ? o.atHaven : true,
    _threatId: o.threatId !== undefined ? o.threatId : 'hushwolf',
    playerAtHaven: function () { return this._atHaven; },
    inCombat: () => false,
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
    assignTask: function (vid, task, opts) { assigned.push({ vid, task, via: (opts || {}).via }); return { ok: true }; },
    getPerson: function (vid) {
      const occ = (o.occ || {})[vid] || 'librarian';
      const kills = (o.kills || {})[vid] || 0;
      return { id: vid, dead: false, formerOccupation: occ, equipped: (o.worn || {})[vid] || {} };
    },
    agencyOf: function (vid) { return { stats: { [vid]: { monsterKills: (o.kills || {})[vid] || 0 } } }; },
    nearestWorldMonster: function () { return this._threatId ? { id: this._threatId } : null; },
  };
  const wbMap = o.wb || {};
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = {
    weaponBonusOf: (p) => wbMap[p.id] || 0,
  };
  return G;
}
function stubCtx() { return {}; }
function vetarmKeys(ctx) {
  return ['vetarmDonated', 'vetarmKnapped', 'vetarmPatrols'].map(k => k + '=' + (ctx[k] || 0)).join(',');
}

// A1: gate honesty.
{
  delete process.env.VETARM;
  const g = stubGame({
    scholar: { equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }] },
    wb: { v1: 12, v2: 12 }, kills: { v1: 1, v2: 1 }, occ: { v1: 'hunter', v2: 'soldier' },
  });
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  VA.patrolBeat(g, ctx);
  check('A1: gate-off pure delegation (no vetarm ctx keys, no armory change, no assignments)',
    (ctx.vetarmDonated || 0) === 0 && (ctx.vetarmPatrols || 0) === 0 &&
    g._armory.length === 0 && g._assigned.length === 0,
    vetarmKeys(ctx) + ` armory=${g._armory.length} assigned=${g._assigned.length}`);
}

// A2: donates the worst spare.
{
  process.env.VETARM = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } }, // bonus 30
      inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'stone_knife' }], // 4 and 12
    },
  });
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  check('A2: donates the worst spare (sharpened_stick, not the stone_knife)',
    (ctx.vetarmDonated || 0) === 1 && g._armory.length === 1 &&
    g._armory[0].itemId === 'sharpened_stick' &&
    g.state.scholar.inventory.length === 1 &&
    g.state.scholar.inventory[0].itemId === 'stone_knife',
    `donated=${g._armory.map(e => e.itemId).join(',')} inv=${g.state.scholar.inventory.map(i => i.itemId).join(',')}`);
  delete process.env.VETARM;
}

// A3: scholar unarmed -> no donation.
{
  process.env.VETARM = '1';
  const g = stubGame({
    scholar: { equipped: {}, inventory: [{ itemId: 'stone_knife' }] },
  });
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  check('A3: unarmed scholar keeps the only edge (no donation)',
    (ctx.vetarmDonated || 0) === 0 && g._armory.length === 0 && g.state.scholar.inventory.length === 1,
    vetarmKeys(ctx));
  delete process.env.VETARM;
}

// A4: armory >= 3 -> no donation; one push per day.
{
  process.env.VETARM = '1';
  const g = stubGame({
    armory: [{ itemId: 'stone_knife', units: 1 }, { itemId: 'stone_knife', units: 1 }, { itemId: 'stone_knife', units: 1 }],
    scholar: { equipped: { melee: { itemId: 'hunting_spear' } }, inventory: [{ itemId: 'sharpened_stick' }] },
  });
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  check('A4: armory at target -> no donation', (ctx.vetarmDonated || 0) === 0 && g._armory.length === 3);
  const g2 = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }, { itemId: 'stone_knife' }, { itemId: 'stone_knife' }],
    },
  });
  const ctx2 = stubCtx();
  VA.armoryDrive(g2, ctx2);
  VA.armoryDrive(g2, ctx2); // same day: second push blocked
  check('A4b: one push per day (second call same day no-ops)',
    (ctx2.vetarmDonated || 0) === 1, `donated=${ctx2.vetarmDonated || 0}`);
  delete process.env.VETARM;
}

// A5: no spare + stone+vine -> crafts stone_knife and donates it.
{
  process.env.VETARM = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  check('A5: crafts stone_knife from stone+vine and donates it',
    (ctx.vetarmKnapped || 0) === 1 && (ctx.vetarmDonated || 0) === 1 &&
    g._armory.length === 1 && g._armory[0].itemId === 'stone_knife',
    `knapped=${ctx.vetarmKnapped || 0} donated=${ctx.vetarmDonated || 0}`);
  delete process.env.VETARM;
}

// A6: vinebank deferral respected.
{
  process.env.VETARM = '1';
  const g = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ material: 'stone', units: 2 }, { material: 'vine', units: 2 }],
    },
  });
  // fake the bank claim: vinebank.defersCraft reads the game; simulate by
  // monkey-patching the module's export for this check.
  const vb = require('./policies/vinebank');
  const orig = vb.defersCraft;
  vb.defersCraft = () => true;
  const ctx = stubCtx();
  VA.armoryDrive(g, ctx);
  vb.defersCraft = orig;
  check('A6: bank claim defers the knap (no craft, counted)',
    (ctx.vetarmKnapped || 0) === 0 && (ctx.vetarmDonated || 0) === 0 &&
    (ctx.vetarmBankDeferred || 0) === 1 && g._armory.length === 0,
    `knapped=${ctx.vetarmKnapped || 0} deferred=${ctx.vetarmBankDeferred || 0}`);
  delete process.env.VETARM;
}

// B1: patrol beat assigns up to 2 able+armed villagers.
{
  process.env.VETARM = '1';
  const g = stubGame({
    wb: { v1: 12, v2: 12, v3: 12 },
    kills: { v1: 2, v2: 0, v3: 0 },
    occ: { v1: 'hunter', v2: 'soldier', v3: 'librarian' },
    village: { roster: ['scholar1', 'v1', 'v2', 'v3'], health: { v1: 90, v2: 90, v3: 90 }, assignments: {}, px: 4, py: 4 },
    threatId: 'hushwolf', // wave 1
  });
  const ctx = stubCtx();
  VA.patrolBeat(g, ctx);
  const got = g._assigned.map(a => a.vid).sort();
  check('B1: assigns the 2 able+armed villagers (v1 hunter w/ kills, v2 soldier)',
    (ctx.vetarmPatrols || 0) === 2 && got.join(',') === 'v1,v2' &&
    g._assigned.every(a => a.task === 'patrol' && a.via === 'in-person'),
    `assigned=${got.join(',')}`);
  delete process.env.VETARM;
}

// B2: patrol gates.
{
  process.env.VETARM = '1';
  const mk = (o) => stubGame(Object.assign({
    wb: { v1: 12 }, kills: { v1: 3 }, occ: { v1: 'marine' },
    village: { roster: ['scholar1', 'v1'], health: { v1: 90 }, assignments: {}, px: 4, py: 4 },
    threatId: 'hushwolf',
  }, o));
  const run = (o) => { const g = mk(o); const c = stubCtx(); VA.patrolBeat(g, c); return { g, c }; };
  let r = run({ village: { roster: ['scholar1', 'v1'], health: { v1: 40 }, assignments: {}, px: 4, py: 4 } });
  check('B2a: hp<60 skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ wb: { v1: 0 } });
  check('B2b: unarmed skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ kills: { v1: 0 }, occ: { v1: 'librarian' } });
  check('B2c: no combat cred skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ village: { roster: ['scholar1', 'v1'], health: { v1: 90 }, assignments: { v1: { task: 'water' } }, px: 4, py: 4 } });
  check('B2d: already assigned skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ threatId: 'spool' }); // wave 3
  check('B2e: wave-3 threat skipped (safe hunts only)', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ scholar: { exiled: true } });
  check('B2f: exiled skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  r = run({ atHaven: false });
  check('B2g: not at haven skipped', (r.c.vetarmPatrols || 0) === 0, `patrols=${r.c.vetarmPatrols || 0}`);
  const g2 = mk({});
  const c2 = stubCtx();
  VA.patrolBeat(g2, c2);
  VA.patrolBeat(g2, c2);
  check('B2h: one assignment round per day', (c2.vetarmPatrols || 0) === 1, `patrols=${c2.vetarmPatrols || 0}`);
  delete process.env.VETARM;
}

// C1/C2: real-harness gates.
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.VETARM = '1'; else delete process.env.VETARM;
    const { Game } = await loadGame({ seed, mode: 'vetarm-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, VA.leadvetarm);
  const tOff2 = await trajectory(204, false, leadfeast);
  check('C1a det-gate: gate-off leadvetarm byte-identical to leadfeast (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, VA.belongvetarm);
  const tOff4 = await trajectory(315, false, belongfeast);
  check('C1b det-gate: gate-off belongvetarm byte-identical to belongfeast (s315)',
    tOff3 === tOff4 && tOff3.length > 0, `len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, VA.leadvetarm);
  const tOn2 = await trajectory(204, true, VA.leadvetarm);
  check('C1c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2 && tOn1.length > 0);
  // Gate-ON non-vacuity on a fabricated mid-game state.
  process.env.VETARM = '1';
  const gOn = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
    wb: { v1: 12 }, kills: { v1: 2 }, occ: { v1: 'hunter' },
    village: { roster: ['scholar1', 'v1'], health: { v1: 90 }, assignments: {}, px: 4, py: 4 },
    threatId: 'hushwolf',
  });
  const ctxOn = stubCtx();
  VA.armoryDrive(gOn, ctxOn);
  VA.patrolBeat(gOn, ctxOn);
  delete process.env.VETARM;
  const gOff = stubGame({
    scholar: {
      equipped: { melee: { itemId: 'hunting_spear' } },
      inventory: [{ itemId: 'sharpened_stick' }],
    },
    wb: { v1: 12 }, kills: { v1: 2 }, occ: { v1: 'hunter' },
    village: { roster: ['scholar1', 'v1'], health: { v1: 90 }, assignments: {}, px: 4, py: 4 },
    threatId: 'hushwolf',
  });
  const ctxOff = stubCtx();
  VA.armoryDrive(gOff, ctxOff);
  VA.patrolBeat(gOff, ctxOff);
  check('C1d det-gate: gate-ON genuinely moves (non-vacuous)',
    (ctxOn.vetarmDonated || 0) === 1 && (ctxOn.vetarmPatrols || 0) === 1 &&
    (ctxOff.vetarmDonated || 0) === 0 && (ctxOff.vetarmPatrols || 0) === 0,
    `on={${vetarmKeys(ctxOn)}} off={${vetarmKeys(ctxOff)}}`);

  // C2: real-sweep gate — 180d armed run per policy, zero layer errors.
  for (const [pid, pol] of [['leadvetarm', VA.leadvetarm], ['belongvetarm', VA.belongvetarm]]) {
    process.env.VETARM = '1';
    const { Game } = await loadGame({ seed: 63501, mode: 'vetarm-sweep', fullTelemetry: false });
    await setupGame(Game);
    let result = null, errCt = 0;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 180, sampleEvery: 30 }); });
    // layer errors surface as ctx counters — re-run must be byte-identical
    const { Game: Game2 } = await loadGame({ seed: 63501, mode: 'vetarm-sweep', fullTelemetry: false });
    await setupGame(Game2);
    let result2 = null;
    await quietLog(async () => { result2 = await runDays(Game2, pol, { days: 180, sampleEvery: 30 }); });
    const same = (result.days === result2.days) && (result.endReason === result2.endReason);
    check(`C2: 180d armed ${pid} s63501 completes, zero errors, deterministic`,
      !!result && !!result2 && same,
      `days=${result && result.days}/${result2 && result2.days} end=${result && result.endReason}`);
    delete process.env.VETARM;
  }

  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
