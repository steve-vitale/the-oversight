#!/usr/bin/env node
// test-armorydrive-20261022.js — proof for scripts/policies/armorydrive.js
// (flesh-out loop, 2026-10-22, arm sim-armorydrive, axis scale-onramp,
// findings #793/#714b/#735).
//
// RED->GREEN on the donation-priority design calls + det-gates + D2.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the non-seat long substrate — finding #714b):
//   control = AD.substrateFor(base)  (seatdrive's prebuilt leadseat/
//             belongseat = withSeatDrive(withWinDefer(TF leadfeast/
//             belongfeast)), with SEATDRIVE=0 so the seat wrapper is pure
//             delegation — the win-side stack minus the seat)
//   armed   = AD.armedFor(base)      (withArmoryDrive OUTSIDE the substrate)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 KILLDISC=1. ARMORYDRIVE toggled per gate.
//
// Gates:
//   E0 module shape (exports, normBase, adOn, armedFor id tag).
//   E1 DET: ARMORYDRIVE unset -> armedFor trajectories byte-identical to
//      substrateFor (2 seeds x 60d) — "ARMORYDRIVE-off reproduces control".
//   E1b COMPOSITION: SEATDRIVE=0 -> substrateFor(leadfeast) trajectory ==
//      WD.withWinDefer(TF.leadfeast) byte-identical (the seat wrapper is
//      pure delegation on the non-seat substrate).
//   E2 env-gate: adOn reads ARMORYDRIVE exactly.
//   E3 synthetic RED->GREEN on the donation design calls (the layer's
//      differentiator vs VGEAR's worst-spare):
//      E3a best-spare donated first (35, not 12 — the RED is VGEAR's
//          worst-spare behavior);
//      E3b keep-one-spare: with 1 spare left, no donation fires;
//      E3c keepsake/bonded excluded; E3d craft fallback builds+donates the
//          best known makeable weapon; E3e off = zero counters.
//   E3f stagingLive unit fixtures (bar-met stand-down, pre-wave-4
//      stand-down, live case).
//   E4 180d ARMORYDRIVE=1 armed run completes per policy + deterministic
//      re-run (D2), KILLDISC v2 installed (the sweep's exact config).
//   E5 mechanism smoke: ARMORYDRIVE=1 120d run fires donations (the beat
//      acts in a real run).
//
// Usage: node scripts/test-armorydrive-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'armorydrive.js'))) {
  console.error('RED: scripts/policies/armorydrive.js missing.');
  process.exit(1);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}

const AD = require('./policies/armorydrive');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}
function setAD(on) { if (on) process.env.ARMORYDRIVE = '1'; else delete process.env.ARMORYDRIVE; }

async function trajectory(seed, adOnFlag, policyObj, days) {
  setAD(adOnFlag);
  const { Game } = await loadGame({ seed, mode: 'armorydrive-det', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  if (t.instrumentErrors.length) throw new Error('instrument errors: ' + t.instrumentErrors.join('; '));
  const r = { traj: hs.join('|'), days: hs.length };
  setAD(false);
  return r;
}

// Synthetic haven Game: scholar with a controlled inventory, at the hall.
async function havenGame(seed, invItems, equippedId) {
  setAD(true);
  const { Game } = await loadGame({ seed, mode: 'armorydrive-synth', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  s.inventory = invItems.map(id => typeof id === 'string' ? { itemId: id } : id);
  s.equipped = { melee: { itemId: equippedId || 'phase_blade' } };
  Game.playerAtHaven = () => true;
  Game.tbfight = null;
  return Game;
}
function donatedIds(Game, before) {
  // donateWeapon moves the item into the stash; read the stash weapon pile.
  try {
    const st = Game.stashState ? Game.stashState() : null;
    const pile = ((st && st.weapons) || []).map(e => e && (e.itemId || e.id)).filter(Boolean);
    return pile.filter(id => !(before || []).includes(id));
  } catch (e) { return ['ERR:' + e.message]; }
}
function stashIds(Game) {
  try {
    const st = Game.stashState ? Game.stashState() : null;
    return ((st && st.weapons) || []).map(e => e && (e.itemId || e.id)).filter(Boolean);
  } catch (e) { return []; }
}

(async () => {
  // E0: shape.
  check('E0a: exports', ['adOn', 'wave4Unlocked', 'hasWave4Kill', 'w5VetBarMet', 'stagingLive',
    'combatScore', 'scholarBestBonus', 'armoryUnits', 'spareWeapons', 'bestCraftableWeapon',
    'armoryDrive', 'fighterStaging', 'withArmoryDrive', 'normBase', 'substrateFor', 'armedFor']
    .every(k => typeof AD[k] === 'function'));
  check('E0b: normBase', AD.normBase('lead') === 'leadfeast' && AD.normBase('belongfeast') === 'belongfeast');
  let threw = false;
  try { AD.normBase('nope'); } catch (e) { threw = true; }
  check('E0c: normBase throws on unknown', threw);
  check('E0d: armedFor id tag', String(AD.armedFor('leadfeast').id || '').indexOf('armorydrive') >= 0);
  check('E0e: adOn reads ARMORYDRIVE', (() => { setAD(false); const a = AD.adOn(); setAD(true); const b = AD.adOn(); setAD(false); return a === false && b === true; })());
  check('E0f: substrateFor is the seatdrive prebuilt (identity)', AD.substrateFor('leadfeast') === SD.leadseat && AD.substrateFor('belongfeast') === SD.belongseat);

  // E1: ARMORYDRIVE-off armed == control, byte-identical (60d x2).
  const e1a1 = await trajectory(65411, false, AD.armedFor('leadfeast'), 60);
  const e1a2 = await trajectory(65411, false, AD.substrateFor('leadfeast'), 60);
  check('E1a: ARMORYDRIVE-off armed(leadfeast) == control byte-identical (s65411 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0, 'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length);
  const e1b1 = await trajectory(65412, false, AD.armedFor('belongfeast'), 60);
  const e1b2 = await trajectory(65412, false, AD.substrateFor('belongfeast'), 60);
  check('E1b: ARMORYDRIVE-off armed(belongfeast) == control byte-identical (s65412 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0);

  // E1b: SEATDRIVE=0 -> seat wrapper delegates: substrateFor == withWinDefer(TF.leadfeast).
  const plainLead = WD.withWinDefer(TF.leadfeast, 'plain-lead-det', 'det only');
  const e1c1 = await trajectory(65413, false, AD.substrateFor('leadfeast'), 60);
  const e1c2 = await trajectory(65413, false, plainLead, 60);
  check('E1c: SEATDRIVE=0 seat wrapper delegates (substrateFor == withWinDefer(TF.leadfeast), s65413 60d)',
    e1c1.traj === e1c2.traj && e1c1.traj.length > 0, 'len ' + e1c1.traj.length + ' vs ' + e1c2.traj.length);

  // E3 synthetic fixtures: the donation design calls.
  // Scholar: equipped phase_blade (60); spares stone_knife (12), hunting_spear (30), machete (35).
  const mkCtx = () => ({});
  {
    const G = await havenGame(65414, ['stone_knife', 'hunting_spear', 'machete'], 'phase_blade');
    const before = stashIds(G);
    const ctx = mkCtx();
    AD.armoryDrive(G, ctx);
    const got = donatedIds(G, before);
    check('E3a: best spare donated first (machete 35, not stone_knife 12)',
      got.length === 1 && got[0] === 'machete' && (ctx.adDonations | 0) === 1, 'donated=' + JSON.stringify(got));
    // Next day: 2 spares left (30, 12) -> donate the 30.
    G.state.scholar.day = (G.state.scholar.day || 0) + 1;
    const ctx2 = mkCtx();
    const before2 = stashIds(G);
    AD.armoryDrive(G, ctx2);
    const got2 = donatedIds(G, before2);
    check('E3a2: second day donates next-best (hunting_spear 30)',
      got2.length === 1 && got2[0] === 'hunting_spear', 'donated=' + JSON.stringify(got2));
    // Third day: 1 spare left -> keep-one-spare rule: NO donation, no craft (no materials).
    G.state.scholar.day = (G.state.scholar.day || 0) + 1;
    const ctx3 = mkCtx();
    const before3 = stashIds(G);
    AD.armoryDrive(G, ctx3);
    const got3 = donatedIds(G, before3);
    check('E3b: keep-one-spare — 1 spare left, no donation fires',
      got3.length === 0 && (ctx3.adDonations | 0) === 0, 'donated=' + JSON.stringify(got3));
    setAD(false);
  }
  {
    // E3c: keepsake/bonded excluded — the best spare is a keepsake -> donate next-best.
    const G = await havenGame(65415, [{ itemId: 'machete' }, 'hunting_spear', 'stone_knife'], 'phase_blade');
    G.isKeepsake = (it) => (it.itemId || it.id) === 'machete';
    const before = stashIds(G);
    const ctx = mkCtx();
    AD.armoryDrive(G, ctx);
    const got = donatedIds(G, before);
    check('E3c: keepsake best-spare excluded (donates hunting_spear 30)',
      got.length === 1 && got[0] === 'hunting_spear', 'donated=' + JSON.stringify(got));
    setAD(false);
  }
  {
    // E3d: craft fallback — no spares; materials for stone_knife (12) AND
    // fire_hardened_spear (15), both known -> builds+donates the BEST
    // (fire_hardened_spear), adCraftDonations=1.
    const G = await havenGame(65416, [
      { material: 'stone', units: 2 }, { material: 'vine', units: 2 },
      { material: 'branch', units: 2 }, { material: 'wood', units: 2 },
    ], 'phase_blade');
    G.state.codex = G.state.codex || {};
    G.state.codex.recipes = Object.assign({}, G.state.codex.recipes,
      { stone_knife: { level: 3 }, fire_hardened_spear: { level: 2 } });
    const before = stashIds(G);
    const ctx = mkCtx();
    AD.armoryDrive(G, ctx);
    const got = donatedIds(G, before);
    check('E3d: craft fallback builds+donates the BEST known (fire_hardened_spear 15, adCraftDonations=1)',
      got.length === 1 && got[0] === 'fire_hardened_spear' && (ctx.adCraftDonations | 0) === 1, 'donated=' + JSON.stringify(got));
    setAD(false);
  }
  {
    // E3e: gate off = zero counters, zero donations.
    const G = await havenGame(65417, ['stone_knife', 'hunting_spear', 'machete'], 'phase_blade');
    setAD(false);
    const before = stashIds(G);
    const ctx = mkCtx();
    AD.armoryDrive(G, ctx);
    const got = donatedIds(G, before);
    check('E3e: ARMORYDRIVE-off = zero counters, zero donations',
      got.length === 0 && (ctx.adDonations | 0) === 0, 'donated=' + JSON.stringify(got));
  }
  {
    // E3f: stock target — armory already at 6 units (stubbed stash read) ->
    // no-op even with spares on hand.
    const G = await havenGame(65418, ['stone_knife', 'hunting_spear', 'machete'], 'phase_blade');
    G.stashState = () => ({ weapons: [{ itemId: 'stone_knife', units: 6 }] });
    const ctx = mkCtx();
    const invBefore = (G.state.scholar.inventory || []).length;
    AD.armoryDrive(G, ctx);
    const invAfter = (G.state.scholar.inventory || []).length;
    check('E3f: stocked armory (>=6) -> no-op (no donation, inventory untouched)',
      (ctx.adDonations | 0) === 0 && invAfter === invBefore,
      'adDonations=' + (ctx.adDonations | 0) + ' inv ' + invBefore + '->' + invAfter);
    setAD(false);
  }

  // E3g: stagingLive unit fixtures on stubbed Games.
  {
    setAD(true);
    const stub = (wave, vets) => ({
      unlockedWave: () => wave,
      waveCombatReadiness: () => ({ veterans: vets, demand: { veterans: 2 } }),
    });
    check('E3g1: stagingLive true (w4 unlocked, bar unmet)', AD.stagingLive(stub(4, 0)) === true);
    check('E3g2: stagingLive false when bar met', AD.stagingLive(stub(4, 2)) === false);
    check('E3g3: stagingLive false pre-wave-4', AD.stagingLive(stub(3, 0)) === false);
    setAD(false);
    check('E3g4: stagingLive false when gate off', AD.stagingLive(stub(4, 0)) === false);
  }

  // E4: 180d ARMORYDRIVE=1 armed run completes + deterministic re-run (D2).
  // Death-aware: a village that dies at d125 has COMPLETED (dead villages
  // stop +10d tail) — the gate asserts completion + determinism, not 180d.
  const e4a = await trajectory(65419, true, AD.armedFor('leadfeast'), 180);
  const e4b = await trajectory(65419, true, AD.armedFor('leadfeast'), 180);
  check('E4a: ARMORYDRIVE=1 armed(leadfeast) completes per policy (s65419)', e4a.days > 0 && e4a.traj.length > 0, 'days=' + e4a.days);
  check('E4b: deterministic re-run byte-identical', e4a.traj === e4b.traj && e4a.traj.length > 0);

  // E5: mechanism smoke — the beat acts in a real run (donations fire).
  async function smokeDonations(seed, base) {
    setAD(true);
    const { Game } = await loadGame({ seed, mode: 'armorydrive-smoke', fullTelemetry: false });
    const policy = AD.armedFor(base);
    const oDaily = policy.daily;
    let lastCtx = null;
    const wrapped = Object.assign({}, policy, { daily(G, ctx) { lastCtx = ctx; return oDaily(G, ctx); } });
    await setupGame(Game);
    await quietLog(async () => { await runDays(Game, wrapped, { days: 120, sampleEvery: 30 }); });
    setAD(false);
    return (lastCtx && lastCtx.adDonations) | 0;
  }
  const e5 = await smokeDonations(65420, 'leadfeast');
  check('E5: ARMORYDRIVE=1 120d real run fires donations (s65420)', e5 > 0, 'adDonations=' + e5);

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });
