#!/usr/bin/env node
// test-belonghunt-20261016.js — proof for scripts/policies/belonghunt.js
// (flesh-out loop, 2026-10-16, run fleshout-20261016T0215Z, axis
// scale-onramp). RED->GREEN on the layer:
//   C1 gate honesty: the stranding state (wave-4 unlocked, tableWaiting
//      PENDING, table NOT active — finding #369) must keep the hunt LIVE.
//      The LANDED wave5reach.js huntLive strands here (REAL-RED of the
//      old mechanism); belonghunt.huntLive stays true (GREEN).
//   C2 the sitting still stands the hunt down (tableActive()=true ->
//      huntLive false).
//   C3 road gate: lead ids pure delegation even opted in.
//   C4 readiness math (#374/#352): burst-block, dpr-block, and ready
//      cases pinned on fabricated inputs.
//   C5 per-engagement burst gate: lethal burst -> not engaged; wave-4
//      facing burst-gated only (no DPR bar on the facing).
//   C6 pantry gate: 'starving' tier blocks the leg (w5PantryBlocked=1).
//   C7 weekly cap: 2 legs in trailing 7d blocks the third (w5CapBlocked=1).
//   C8 det-gate: gate-off byte-identity (2/2 seeds, 60d, real harness);
//      gate-on determinism (identical armed 60d runs byte-identical);
//      gate-ON non-vacuity on a fabricated mid-game state (the w5reach3
//      det-vacuity lesson: the gate must genuinely move the trajectory).
//   C9 35% eject preserved: the layer holds no flee/eject logic —
//      competent.js's eject line is the only 0.35 in the composition.
// Usage: node scripts/test-belonghunt-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (BELONGHUNT_KILLED=1
// set by the coordinator after a killed arm), this proof exits green
// with an INFO-SKIP instead of FATAL-ing. Without the layer and without
// the flag, absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'belonghunt.js'))) {
  if (process.env.BELONGHUNT_KILLED === '1') {
    console.log('INFO-SKIP: belonghunt layer deleted per kill protocol (sim-belonghunt PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/belonghunt.js missing and BELONGHUNT_KILLED not set.');
  process.exit(1);
}

const BH = require('./policies/belonghunt');
const SD = require('./policies/seatdrive');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const G = {
    over: false, tbfight: null,
    state: { scholar: Object.assign({ hp: 120, health: 120, day: 100, kcal: 500, exiled: false }, o.scholar || {}) },
    map: { px: 0, py: 0 },
    data: { monsters: o.monsters || [], items: [] },
    progState: () => ({ tableDone: !!o.tableDone, tableWaiting: !!o.tableWaiting }),
    unlockedWave: () => (o.wave == null ? 4 : o.wave),
    tableActive: () => !!o.tableSitting,
    maxHealth: () => 120,
    equippedWeapon: () => ({ bonus: o.weaponBonus == null ? 27 : o.weaponBonus, id: 'probe-blade' }),
    villageFoodTier: () => o.tier || 'secure',
    travelTargets: () => (o.targets === undefined ? [{ x: 1, y: 0, d: 1 }] : o.targets),
    tileAt: (x, y) => ({ type: 'thicket', revealed: true }),
    travelTo: (x, y) => { G.map.px = x; G.map.py = y; },
    monsterAt: () => (o.worldMonster === undefined ? null : o.worldMonster),
    pathStep: () => false,
    inCombat: () => false,
  };
  return G;
}
function stubCtx() { return {}; }

// The armor seam: scholarArmorP reads globalThis.Scattering.equipment.
// The test injects it (the harness has the real one).
function setArmor(P) {
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = { armorOf: () => P };
}

console.log('== test-belonghunt-20261016 ==');
process.env.BELONGHUNT = '1';

// C1: gate honesty — the #369 stranding state.
{
  setArmor(0);
  const strand = stubGame({ wave: 4, tableWaiting: true, tableSitting: false, scholar: { hp: 120, day: 100, kcal: 500 } });
  // The LANDED mechanism strands here (its tableBusy = tableDone||tableWaiting):
  const WR = require('./policies/wave5reach');
  let oldStrands = null;
  process.env.WAVE5REACH = '1';
  try { oldStrands = !WR.huntLive(strand); } catch (e) { oldStrands = 'err'; }
  delete process.env.WAVE5REACH;
  check('C1a REAL-RED: landed wave5reach strands on pending invitation', oldStrands === true, `huntLive=${!oldStrands}`);
  check('C1b GREEN: belonghunt huntLive TRUE in the stranding state',
    BH.huntLive(strand, 'belongfeast-windefer') === true);
  check('C1c: belonghunt tableSitting FALSE in the stranding state',
    BH.tableSitting(strand) === false);
}

// C2: the sitting stands the hunt down.
{
  const sitting = stubGame({ wave: 4, tableDone: true, tableSitting: true });
  check('C2a: tableSitting TRUE when the table sits', BH.tableSitting(sitting) === true);
  check('C2b: huntLive FALSE while the table sits', BH.huntLive(sitting, 'belongfeast-windefer') === false);
  const ctx = stubCtx();
  BH.huntLeg(sitting, ctx, 'belongfeast-windefer');
  check('C2c: huntLeg fires nothing while sitting', (ctx.w5Hunts || 0) === 0 && (ctx.w5TableBlocked || 0) >= 1,
    `hunts=${ctx.w5Hunts || 0} tableBlocked=${ctx.w5TableBlocked || 0}`);
}

// C3: road gate.
{
  const g = stubGame({ wave: 4 });
  check('C3a: huntLive FALSE on the lead road even opted in', BH.huntLive(g, 'leadfeast-windefer') === false);
  check('C3b: roadOf classifies', BH.roadOf('leadfeast-windefer') === 'lead' && BH.roadOf('belongfeast-windefer') === 'belong');
  const ctx = stubCtx();
  setArmor(64);
  BH.huntLeg(g, ctx, 'leadfeast-windefer');
  check('C3c: lead huntLeg fires nothing', (ctx.w5Hunts || 0) === 0);
}

// C4: readiness math (#374/#352).
{
  // burst-block: sharpened-stick scholar (DPR 18), no armor, HP 100.
  // burst2 = 2*throughArmor(70,0) = 140 >= 100 -> not ready.
  setArmor(0);
  const g1 = stubGame({ scholar: { hp: 100, day: 100, kcal: 500 }, weaponBonus: 5 });
  const r1 = BH.huntReadiness(g1);
  check('C4a burst-block: stick scholar not ready', r1.ready === false && r1.reasons.includes('burst'),
    `burst2=${r1.burst2} hp=${r1.hp} reasons=${r1.reasons}`);
  check('C4b: stick DPR estimate = 13+5', r1.playerDPR === 18);
  // dpr-block: geared-but-soft scholar — burst survivable, DPR vs the band not.
  // P=20: throughArmor(70) = 70-35 = 35; burst2 = 70 < 120 ok.
  // exposure = 120/45 = 2.67; killPace = 330/18 = 18.3; 2.67 < 18.3*0.25 -> dpr.
  setArmor(20);
  const g2 = stubGame({ scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 5 });
  const r2 = BH.huntReadiness(g2);
  check('C4c dpr-block: burst ok but DPR not', r2.ready === false && r2.reasons.includes('dpr') && !r2.reasons.includes('burst'),
    `reasons=${r2.reasons} exposure=${r2.exposure.toFixed(2)} killPace=${r2.killPace.toFixed(2)}`);
  // ready: mid build (DPR 40, P=64, HP 120).
  // throughArmor(70,64) = 70-min(69,53) = 17; burst2 = 34 < 120 ok.
  // exposure = 2.67; killPace = 330/40 = 8.25; 2.67 >= 2.06 ok.
  setArmor(64);
  const g3 = stubGame({ scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const r3 = BH.huntReadiness(g3);
  check('C4d ready: mid build passes', r3.ready === true, `reasons=${r3.reasons}`);
  check('C4e armor curve: throughArmor(70,64)=17', BH.throughArmor(70, 64) === 17);
  check('C4f armor curve: throughArmor(70,0)=70', BH.throughArmor(70, 0) === 70);
  check('C4g armor curve: at least 1 always lands', BH.throughArmor(1, 9999) === 1);
}

// C5: per-engagement burst gate.
{
  setArmor(0);
  const w3 = { id: 'wm1', monsterId: 'spool', hp: 300, mx: 4, my: 4 };
  const G = stubGame({ monsters: [{ id: 'spool', wave: 3, attack: { damage: [20, 70] } }, { id: 'the_nielsen', wave: 4, attack: { damage: [35, 95] } }] });
  const eg1 = BH.engageableMonster(G, w3, 18, 0, 100);
  check('C5a: burst-lethal wave-3 not engaged', eg1.ok === false && eg1.why === 'burst');
  // wave-4 champion, armored scholar: burst = 2*throughArmor(95,64) = 2*23 = 46 < 120 -> engaged.
  const w4 = { id: 'wm2', monsterId: 'the_nielsen', hp: 1200, mx: 4, my: 4 };
  const eg2 = BH.engageableMonster(G, w4, 40, 64, 120);
  check('C5b: survivable wave-4 facing engaged (burst-gated only)', eg2.ok === true && eg2.wave === 4);
  // wave-3 stalemate: burst survivable but unkillable in 60 rounds.
  const eg3 = BH.engageableMonster(G, Object.assign({}, w3, { hp: 420 }), 5, 64, 120);
  check('C5c: wave-3 stalemate not engaged', eg3.ok === false && eg3.why === 'stalemate');
  // wave-4 facing is NOT dpr-gated: unkillable-in-60-rounds still engaged.
  const eg4 = BH.engageableMonster(G, Object.assign({}, w4, { hp: 1500 }), 5, 64, 120);
  check('C5d: wave-4 facing never dpr-gated', eg4.ok === true, `why=${eg4.why}`);
}

// C6: pantry gate (w3drive lesson — the don't-hunt gate reads the pantry).
{
  setArmor(64);
  const g = stubGame({ wave: 4, tier: 'starving', scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const ctx = stubCtx();
  BH.huntLeg(g, ctx, 'belongfeast-windefer');
  check('C6a: starving pantry blocks the leg', (ctx.w5Hunts || 0) === 0 && (ctx.w5PantryBlocked || 0) === 1,
    `hunts=${ctx.w5Hunts || 0} pantryBlocked=${ctx.w5PantryBlocked || 0}`);
  const g2 = stubGame({ wave: 4, tier: 'tight', scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const ctx2 = stubCtx();
  BH.huntLeg(g2, ctx2, 'belongfeast-windefer');
  check('C6b: tight pantry does NOT block (design call)', (ctx2.w5Hunts || 0) === 1,
    `hunts=${ctx2.w5Hunts || 0}`);
}

// C7: weekly cap.
{
  setArmor(64);
  const g = stubGame({ wave: 4, tier: 'secure', scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const ctx = stubCtx();
  ctx._w5HuntDays = [94, 97]; ctx._lastW5HuntDay = 94; // cadence passes (d100), cap must bite
  BH.huntLeg(g, ctx, 'belongfeast-windefer');
  check('C7: 2 legs in trailing 7d blocks the third', (ctx.w5Hunts || 0) === 0 && (ctx.w5CapBlocked || 0) === 1,
    `hunts=${ctx.w5Hunts || 0} capBlocked=${ctx.w5CapBlocked || 0}`);
}

// C8: det-gate (real harness).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.BELONGHUNT = '1'; else delete process.env.BELONGHUNT;
    const { Game } = await loadGame({ seed, mode: 'belonghunt-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const base = policyObj;
    const policy = Object.assign({}, base);
    const oDaily = base.daily;
    policy.daily = (G, ctx) => {
      let r; if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, BH.belongseat);
  const tOff2 = await trajectory(204, false, SD.belongseat);
  check('C8a det-gate: gate-off byte-identical to seatdrive composition (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, BH.belongseat);
  const tOff4 = await trajectory(315, false, SD.belongseat);
  check('C8b det-gate: gate-off byte-identical (s315)', tOff3 === tOff4 && tOff3.length > 0);
  // lead id with the gate ON: pure delegation (road gate).
  const tLeadOn = await trajectory(204, true, BH.leadseat);
  const tLeadOff = await trajectory(204, false, SD.leadseat);
  check('C8c det-gate: lead-armed byte-identical to lead gate-off (road gate)', tLeadOn === tLeadOff);
  // gate-on determinism.
  const tOn1 = await trajectory(204, true, BH.belongseat);
  const tOn2 = await trajectory(204, true, BH.belongseat);
  check('C8d det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2);
  // gate-ON non-vacuity on a fabricated mid-game state (the w5reach3
  // det-vacuity lesson): with the gate on, a ready in-window scholar
  // fires a hunt; with the gate off, nothing fires.
  setArmor(64);
  const gOn = stubGame({ wave: 4, tier: 'secure', scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const ctxOn = stubCtx();
  process.env.BELONGHUNT = '1';
  BH.huntLeg(gOn, ctxOn, 'belongfeast-windefer');
  delete process.env.BELONGHUNT;
  const gOff = stubGame({ wave: 4, tier: 'secure', scholar: { hp: 120, day: 100, kcal: 500 }, weaponBonus: 27 });
  const ctxOff = stubCtx();
  BH.huntLeg(gOff, ctxOff, 'belongfeast-windefer');
  check('C8e det-gate: gate-ON genuinely moves the trajectory (non-vacuous)',
    (ctxOn.w5Hunts || 0) === 1 && (ctxOff.w5Hunts || 0) === 0,
    `on=${ctxOn.w5Hunts || 0} off=${ctxOff.w5Hunts || 0}`);

  // C9: the 35% eject is preserved — this layer holds no flee logic.
  const src = fs.readFileSync(path.join(__dirname, 'policies', 'belonghunt.js'), 'utf8');
  const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  check('C9a: no eject/flee thresholds in the layer', !/0\.35|0\.12|flee\(|eject/i.test(codeOnly));
  check('C9b: commit flags delegate to competent.js convention', /_huntCommit/.test(src) && /_w5Commit/.test(src));

  delete process.env.BELONGHUNT;
  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST CRASH:', e); process.exit(2); });
