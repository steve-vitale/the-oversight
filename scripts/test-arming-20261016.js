#!/usr/bin/env node
// test-arming-20261016.js — proof for scripts/policies/arming.js
// (flesh-out loop, 2026-10-16, run sim-arming, axis scale-onramp,
// finding #427: the readiness-substrate diagnostic).
//
// RED->GREEN on the layer:
//   C1 gate honesty: ARMING unset -> pure delegation (no arming ctx keys).
//   C2 armory drive: ARMING=1, empty armory -> crafts stone_knife + donates.
//   C3 companion protocol: ARMING=1, wave-3 unlocked -> invites fire.
//   C4 veteran hunt leg: ARMING=1, wave-3 unlocked, companions present ->
//      vetHunts=1; cadence gate (3d) blocks the second.
//   C5 scholarIsVeteran: waveKillLog w3 by current vid -> true; by other -> false.
//   C6 veteran preservation: fight wrapper sets _huntCommit for wave-3 fights
//      when the scholar is NOT a veteran; leaves it false when they are.
//   C7 armor preservation: companion selection never invites P>=15 wearers.
//   C8 det-gate (real harness): gate-off byte-identical to the base feast
//      policies (2 seeds x 60d); gate-on deterministic; gate-ON non-vacuous
//      on a fabricated mid-game state.
// Usage: node scripts/test-arming-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (ARMING_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'arming.js'))) {
  if (process.env.ARMING_KILLED === '1') {
    console.log('INFO-SKIP: arming layer deleted per kill protocol (sim-arming PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/arming.js missing and ARMING_KILLED not set.');
  process.exit(1);
}

const AR = require('./policies/arming');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const invited = [];
  const G = {
    over: false, tbfight: null,
    villagerId: o.villagerId || 'scholar1',
    state: {
      scholar: Object.assign({ hp: 120, health: 120, day: 100, kcal: 500, exiled: false, inventory: [] }, o.scholar || {}),
      village: Object.assign({ roster: ['scholar1', 'v1', 'v2', 'v3'], trust: { v1: 50, v2: 50, v3: 50 }, health: { v1: 90, v2: 90, v3: 90 }, away: {}, px: 4, py: 4 }, o.village || {}),
      codex: { recipes: Object.assign({ stone_knife: { level: 3 } }, o.recipes || {}) },
      waveKillLog: o.waveKillLog || [],
      systemArrived: true,
    },
    map: { px: 4, py: 4 },
    data: { monsters: o.monsters || [{ id: 'spool', wave: 3 }], items: o.items || [] },
    _wave: o.wave || 3,
    _armory: o.armory || [],
    _invited: invited,
    maxHealth: () => 120,
    unlockedWave: function () { return this._wave; },
    havenStoresAccess: () => 'hall',
    inCombat: () => false,
    stashState: function () { return { weapons: this._armory }; },
    craft: function (rid) {
      if (rid === 'stone_knife') { this.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 }); return { itemId: 'stone_knife' }; }
      if (rid === 'bark_armor') { this.state.scholar.inventory.push({ itemId: 'bark_armor', units: 1 }); return { itemId: 'bark_armor' }; }
      return null;
    },
    donateWeapon: function (idx) {
      const inv = this.state.scholar.inventory;
      const it = inv[idx];
      if (!it) return null;
      inv.splice(idx, 1);
      this._armory.push({ itemId: it.itemId || it.id, units: 1 });
      return { ok: true };
    },
    equip: function () { return { ok: true }; },
    armorBonus: () => (o.scholarArmor || 0),
    askAbout: function (vid, topic) {
      if (topic === 'beasttricks' && (o.teachable !== false)) return { ok: true, taught: 'hushwolf' };
      return { ok: true, none: true };
    },
    counterTeachable: () => (o.teachable === false ? null : 'hushwolf'),
    vpOf: function (vid) {
      const arm = (o.armorOf || {})[vid] || 0;
      const wb = (o.weaponBonusOf || {})[vid] || 0;
      return {
        dead: false, items: [],
        equipped: arm >= 15 ? { torso: { itemId: 'hide_armor' } } : (wb > 0 ? { melee: { itemId: 'stone_knife' } } : {}),
      };
    },
    partyMembers: () => (o.party || []),
    partyFull: () => false,
    inviteToParty: function (vid) { invited.push(vid); return { ok: true }; },
    travelTargets: () => (o.travelTargets !== undefined ? o.travelTargets : [{ x: 5, y: 4, d: 1 }]),
    tileAt: () => ({ type: 'thicket', revealed: true }),
    travelTo: function (x, y) { this.map.px = x; this.map.py = y; },
    monsterAt: function () { return (o.monsterAt !== undefined ? o.monsterAt : { id: 'spool', tx: 5, ty: 4 }); },
    waveCombatReadiness: function () {
      const log = this.state.waveKillLog || [];
      const seen = new Set();
      for (const e of log) if (e && e.by && (e.w | 0) >= 3) seen.add(e.by);
      return { ready: false, armored: 4, armed: 5, tricks: 3, veterans: seen.size, demand: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 }, short: seen.size < 2 ? ['veterans'] : [] };
    },
  };
  // Scattering.equipment stub for armorOf/weaponBonusOf reads.
  const armorOfMap = o.armorOf || {}, wbMap = o.weaponBonusOf || {};
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = {
    armorOf: (vp) => {
      const eq = (vp && vp.equipped) || {};
      if (eq.torso && eq.torso.itemId === 'hide_armor') return 20;
      return 0;
    },
    weaponBonusOf: (vp) => {
      const eq = (vp && vp.equipped) || {};
      if (eq.melee && eq.melee.itemId === 'stone_knife') return 12;
      return 0;
    },
  };
  return G;
}
function stubCtx() { return {}; }

// C1: gate honesty — ARMING unset -> pure delegation.
{
  delete process.env.ARMING;
  const g = stubGame();
  const ctx = stubCtx();
  // Call the component functions directly (daily would also run base.daily;
  // components must no-op with the gate off).
  AR.armoryDrive(g, ctx);
  AR.scholarArmor(g, ctx);
  AR.counterPursuit(g, ctx);
  AR.companionProtocol(g, ctx);
  AR.veteranHuntLeg(g, ctx);
  const keys = ['armoryCrafted', 'armoryDonated', 'barkCrafted', 'tricksTaught', 'companionInvitesOk', 'vetHunts'];
  check('C1: gate-off pure delegation (no arming ctx keys)',
    keys.every(k => (ctx[k] || 0) === 0) && g._armory.length === 0 && g._invited.length === 0,
    `keys=${keys.map(k => k + '=' + (ctx[k] || 0)).join(',')}`);
}

// C2: armory drive — ARMING=1, empty armory -> crafts; unarmed scholar keeps
// the first knife, the second day's spare is donated.
{
  process.env.ARMING = '1';
  const g = stubGame({ armory: [] });
  const ctx = stubCtx();
  AR.armoryDrive(g, ctx); // day 100: craft 1, scholar keeps it
  check('C2: armory drive crafts a stone_knife (unarmed scholar keeps the first)',
    (ctx.armoryCrafted || 0) >= 1 && (ctx.armoryDonated || 0) === 0 && g._armory.length === 0,
    `crafted=${ctx.armoryCrafted || 0} donated=${ctx.armoryDonated || 0} armory=${g._armory.length}`);
  const g2 = stubGame({ armory: [] });
  g2.state.scholar.day = 101;
  // scholar already holds a knife from yesterday
  g2.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 });
  const ctxB = stubCtx();
  AR.armoryDrive(g2, ctxB); // day 101: craft another, donate the spare
  check('C2b: second day donates the spare to the armory',
    (ctxB.armoryDonated || 0) === 1 && g2._armory.length === 1,
    `donated=${ctxB.armoryDonated || 0} armory=${g2._armory.length}`);
  // Throttle: same day twice.
  const ctx2 = stubCtx(); ctx2._armoryDay = 100;
  AR.armoryDrive(g, ctx2);
  check('C2c: armory drive throttles to one push per day', (ctx2.armoryCrafted || 0) === 0);
  delete process.env.ARMING;
}

// C3: companion protocol — ARMING=1, wave-3 unlocked -> invites fire.
{
  process.env.ARMING = '1';
  const g = stubGame({ wave: 3, weaponBonusOf: { v1: 12, v2: 0, v3: 0 } });
  const ctx = stubCtx();
  AR.companionProtocol(g, ctx);
  check('C3: companion protocol invites villagers',
    (ctx.companionInvitesOk || 0) >= 1 && g._invited.length >= 1,
    `invitesOk=${ctx.companionInvitesOk || 0} invited=${g._invited.join(',')}`);
  delete process.env.ARMING;
}

// C4: veteran hunt leg — fires post wave-3 with companions; cadence blocks.
{
  process.env.ARMING = '1';
  const g = stubGame({ wave: 3, party: ['v1'] });
  const ctx = stubCtx();
  AR.veteranHuntLeg(g, ctx);
  check('C4: hunt leg fires with companions post wave-3',
    (ctx.vetHunts || 0) === 1, `vetHunts=${ctx.vetHunts || 0}`);
  const ctx2 = stubCtx(); ctx2._lastVetHuntDay = 100;
  const g2 = stubGame({ wave: 3, party: ['v1'] });
  AR.veteranHuntLeg(g2, ctx2);
  check('C4b: 3-day cadence blocks back-to-back hunts', (ctx2.vetHunts || 0) === 0);
  // No companions -> no hunt (the 2nd veteran needs a villager).
  const ctx3 = stubCtx();
  const g3 = stubGame({ wave: 3, party: [] });
  AR.veteranHuntLeg(g3, ctx3);
  check('C4c: no companions -> no hunt', (ctx3.vetHunts || 0) === 0);
  delete process.env.ARMING;
}

// C5: scholarIsVeteran reads the log.
{
  const g1 = stubGame({ waveKillLog: [{ d: 69, mid: 'spool', w: 3, by: 'scholar1', via: 'player' }] });
  check('C5: scholar with a wave-3 kill is a veteran', AR.scholarIsVeteran(g1) === true);
  const g2 = stubGame({ waveKillLog: [{ d: 69, mid: 'spool', w: 3, by: 'someone_else', via: 'player' }] });
  check('C5b: another killer does not make the scholar a veteran', AR.scholarIsVeteran(g2) === false);
  const g3 = stubGame({ waveKillLog: [{ d: 69, mid: 'hushwolf', w: 1, by: 'scholar1', via: 'player' }] });
  check('C5c: wave-1 kill does not count', AR.scholarIsVeteran(g3) === false);
}

// C6: veteran preservation — fight wrapper commit flag.
{
  process.env.ARMING = '1';
  const mkFight = (vet) => {
    const g = stubGame({
      wave: 3,
      waveKillLog: vet ? [{ d: 69, mid: 'spool', w: 3, by: 'scholar1', via: 'player' }] : [],
    });
    g.tbfight = { over: false, fighters: [{ kind: 'monster', hp: 300, maxHp: 300, monsterId: 'spool' }] };
    return g;
  };
  const base = { fight: (G, ctx) => { ctx._baseFightCalled = true; return true; } };
  const wrapped = AR.withArming(base, 'test-id', 'test');
  const ctxA = stubCtx();
  wrapped.fight(mkFight(false), ctxA);
  check('C6: non-veteran wave-3 fight commits (_huntCommit)',
    ctxA._huntCommit === true && (ctxA.vetHuntFights || 0) === 1 && ctxA._baseFightCalled === true);
  const ctxB = stubCtx();
  wrapped.fight(mkFight(true), ctxB);
  check('C6b: veteran scholar wave-3 fight does NOT commit (35% eject preserved)',
    ctxB._huntCommit === false && ctxB._baseFightCalled === true);
  delete process.env.ARMING;
}

// C7: armor preservation — P>=15 wearers never invited.
{
  process.env.ARMING = '1';
  const g = stubGame({ wave: 3, armorOf: { v1: 20, v2: 0, v3: 0 }, weaponBonusOf: { v1: 12, v2: 12, v3: 0 } });
  const ctx = stubCtx();
  AR.companionProtocol(g, ctx);
  check('C7: armored (P>=15) villagers are never invited as companions',
    !g._invited.includes('v1') && g._invited.length >= 1,
    `invited=${g._invited.join(',')}`);
  delete process.env.ARMING;
}

// C8: det-gate (real harness).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.ARMING = '1'; else delete process.env.ARMING;
    const { Game } = await loadGame({ seed, mode: 'arming-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const base = policyObj;
    const oDaily = base.daily;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    return hs.join('|');
  }
  const tOff1 = await trajectory(204, false, AR.armingLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  check('C8a det-gate: gate-off arming-lead byte-identical to leadfeast (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, AR.armingBelong);
  const tOff4 = await trajectory(315, false, belongfeast);
  check('C8b det-gate: gate-off arming-belong byte-identical to belongfeast (s315)',
    tOff3 === tOff4 && tOff3.length > 0, `len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, AR.armingLead);
  const tOn2 = await trajectory(204, true, AR.armingLead);
  check('C8c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2);
  // Gate-ON non-vacuity on a fabricated mid-game state: the armory drive
  // fires with the gate on and stays silent with it off (two-day flow).
  process.env.ARMING = '1';
  const gOn = stubGame({ armory: [] });
  gOn.state.scholar.day = 101;
  gOn.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 });
  const ctxOn = stubCtx();
  AR.armoryDrive(gOn, ctxOn);
  delete process.env.ARMING;
  const gOff = stubGame({ armory: [] });
  gOff.state.scholar.day = 101;
  gOff.state.scholar.inventory.push({ itemId: 'stone_knife', units: 1 });
  const ctxOff = stubCtx();
  AR.armoryDrive(gOff, ctxOff);
  check('C8d det-gate: gate-ON genuinely moves (non-vacuous)',
    (ctxOn.armoryDonated || 0) === 1 && (ctxOff.armoryDonated || 0) === 0,
    `on=${ctxOn.armoryDonated || 0} off=${ctxOff.armoryDonated || 0}`);

  delete process.env.ARMING;
  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
