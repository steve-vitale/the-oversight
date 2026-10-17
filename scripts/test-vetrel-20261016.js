#!/usr/bin/env node
// test-vetrel-20261016.js — proof for scripts/policies/vetrel.js
// (flesh-out loop, 2026-10-16, run fleshout-20261016T2315Z, axis
// scale-onramp, finding #427's named next: make the companion-veteran
// channel RELIABLE).
//
// RED->GREEN on the layer:
//   V1 gate honesty: VETREL unset -> pure delegation (no vetrel ctx keys,
//      no invites, no hunts, no fight flags).
//   V2 companion selection: VETREL=1 -> invites the STRONGEST available
//      (ranked by combat stats), never the armored (P>=15), trust-gated.
//   V3 yield: veteran scholar, wave-3 near death, companion engaged ->
//      scholar holds (tbPlayerWait), wrapper handles the turn.
//   V4 no-yield for non-veteran scholar: _huntCommit=true, delegates.
//   V5 breakoff: companion <40% HP, monster not near death -> disengage
//      attempted (vetBreakoffs=1), wrapper handles the turn.
//   V6 rescue: companion <40% + monster near death -> NO breakoff;
//      delegates so the scholar strikes (fastest fight end).
//   V7 no-yield when scholar hurting (hpPct<0.5): delegates.
//   V8 det-gate (real harness): gate-off byte-identical to the base feast
//      policies (2 seeds x 60d); gate-on deterministic; gate-ON non-vacuous.
// Usage: node scripts/test-vetrel-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VETREL_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'vetrel.js'))) {
  if (process.env.VETREL_KILLED === '1') {
    console.log('INFO-SKIP: vetrel layer deleted per kill protocol (sim-vetrel PRIMARY NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/vetrel.js missing and VETREL_KILLED not set.');
  process.exit(1);
}

const VR = require('./policies/vetrel');

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
      village: Object.assign({ roster: ['scholar1', 'v1', 'v2', 'v3'], trust: { v1: 50, v2: 50, v3: 50 }, health: { v1: 90, v2: 90, v3: 90 }, px: 4, py: 4 }, o.village || {}),
      waveKillLog: o.waveKillLog || [],
      systemArrived: true,
    },
    map: { px: 4, py: 4 },
    data: { monsters: o.monsters || [{ id: 'spool', wave: 3 }], items: o.items || [] },
    _wave: o.wave || 3,
    _invited: invited,
    _party: o.party !== undefined ? o.party : [],
    maxHealth: () => 120,
    unlockedWave: function () { return this._wave; },
    playerAtHaven: () => (o.atHaven !== false),
    inCombat: () => false,
    partyMembers: function () { return this._party.slice(); },
    partyFull: function () { return this._party.length >= 3; },
    inParty: function (vid) { return this._party.includes(vid); },
    inviteToParty: function (vid) { invited.push(vid); this._party.push(vid); return { ok: true }; },
    vpOf: function (vid) {
      const gear = (o.gear || {})[vid] || {};
      return { id: vid, dead: false, equipped: gear };
    },
    travelTargets: () => (o.travelTargets !== undefined ? o.travelTargets : [{ x: 5, y: 4, d: 1 }]),
    tileAt: () => ({ type: 'thicket', revealed: true }),
    travelTo: function (x, y) { this.map.px = x; this.map.py = y; },
    monsterAt: function () { return (o.monsterAt !== undefined ? o.monsterAt : null); },
    pathStep: () => true,
    waveCombatReadiness: function () {
      const log = this.state.waveKillLog || [];
      const seen = new Set();
      for (const e of log) if (e && e.by && (e.w | 0) >= 3) seen.add(e.by);
      return { ready: false, veterans: seen.size, demand: { veterans: 2 }, short: seen.size < 2 ? ['veterans'] : [] };
    },
  };
  // Scattering.equipment stub for combatScore/armorP reads.
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.equipment = {
    weaponBonusOf: (vp, items, slot) => {
      const eq = (vp && vp.equipped) || {};
      const w = slot ? eq[slot] : eq.melee;
      return (w && w.bonus) || 0;
    },
    armorOf: (vp, items) => {
      const eq = (vp && vp.equipped) || {};
      return (eq.torso && eq.torso.prot) || 0;
    },
  };
  return G;
}
function stubCtx() { return {}; }

// Fight-fixture Game: a live TB fight with a wave-3 monster and optionally
// a companion fighter.
function fightGame(o) {
  o = o || {};
  const fighters = [
    { key: 'p', kind: 'player', hp: o.scholarHp != null ? o.scholarHp : 100, maxHp: o.scholarMaxHp || 120, mx: 4, my: 4, alive: true },
    { key: 'm_0', kind: 'monster', hp: o.monsterHp != null ? o.monsterHp : 200, maxHp: o.monsterMaxHp || 300, monsterId: 'spool', mx: 5, my: 4, alive: true },
  ];
  if (o.comp !== false) {
    fighters.push({ key: 'v_c1', kind: 'villager', villagerId: 'c1', name: 'C1',
      hp: o.compHp != null ? o.compHp : 80, maxHp: o.compMaxHp || 100, mx: 3, my: 4, alive: true });
  }
  const G = stubGame({
    waveKillLog: o.scholarVet ? [{ d: 69, mid: 'spool', w: 3, by: 'scholar1', via: 'player' }] : [],
    party: o.comp === false ? [] : ['c1'],
  });
  G.tbfight = { over: false, fighters, round: o.round != null ? o.round : 3 };
  G._waited = false; G._struck = false; G._moved = false; G._exited = false; G._ended = false;
  G.tbIsPlayerTurn = () => true;
  G.tbFighter = (k) => fighters.find(f => f.key === k);
  G.tbPlayerWait = function () { this._waited = true; return true; };
  G.tbPlayerMove = function (x, y) { this._moved = true; const p = this.tbFighter('p'); if (p) { p.mx = x; p.my = y; } return true; };
  G.tbBarrierExit = function () { this._exited = true; this.tbfight.over = true; return true; };
  G.tbAfterPlayerAction = function () { this._ended = true; return true; };
  return G;
}
function baseFightStub() {
  return { fight: (G, ctx) => { ctx._baseFightCalled = true; return true; } };
}

// V1: gate honesty — VETREL unset -> pure delegation.
{
  delete process.env.VETREL;
  const g = stubGame({ gear: { v1: { melee: { bonus: 12 } } } });
  const ctx = stubCtx();
  VR.companionProtocol(g, ctx);
  VR.veteranHuntLeg(g, ctx);
  const keys = ['vetInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntEngaged', 'vetYields', 'vetBreakoffs', 'vetRescues', '_huntCommit'];
  check('V1: gate-off pure delegation (no vetrel ctx keys, no invites)',
    keys.every(k => ctx[k] == null || ctx[k] === 0 || ctx[k] === false) && g._invited.length === 0,
    `invited=${g._invited.length}`);
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const gf = fightGame({});
  const ctxf = stubCtx();
  const r = wrapped.fight(gf, ctxf);
  check('V1b: gate-off fight pure-delegates (no flags, base called)',
    r === true && ctxf._baseFightCalled === true && ctxf._huntCommit == null,
    `_huntCommit=${ctxf._huntCommit}`);
}

// V2: companion selection — strongest first, armored excluded, trust-gated.
{
  process.env.VETREL = '1';
  const g = stubGame({
    gear: {
      v1: { melee: { bonus: 12 }, torso: { prot: 5 } },   // strongest eligible
      v2: {},                                              // weak but eligible
      v3: { melee: { bonus: 12 }, torso: { prot: 20 } },  // armored P>=15: excluded
    },
    village: { roster: ['scholar1', 'v1', 'v2', 'v3'], trust: { v1: 50, v2: 50, v3: 50 }, health: { v1: 90, v2: 90, v3: 90 }, px: 4, py: 4 },
  });
  const ctx = stubCtx();
  VR.companionProtocol(g, ctx);
  check('V2: strongest invited first (not first-available)',
    g._invited[0] === 'v1', `order=${g._invited.join(',')}`);
  check('V2b: armored (P>=15) never invited',
    !g._invited.includes('v3'), `invited=${g._invited.join(',')}`);
  check('V2c: invites counted', (ctx.vetInvitesOk || 0) === 2, `ok=${ctx.vetInvitesOk || 0}`);
  // Trust gate: v1 below the floor is skipped.
  const g2 = stubGame({
    gear: { v1: { melee: { bonus: 12 } }, v2: {} },
    village: { roster: ['scholar1', 'v1', 'v2'], trust: { v1: 10, v2: 50 }, health: { v1: 90, v2: 90 }, px: 4, py: 4 },
  });
  const ctx2 = stubCtx();
  VR.companionProtocol(g2, ctx2);
  check('V2d: trust<20 skipped by the verb floor',
    !g2._invited.includes('v1') && g2._invited.includes('v2'), `invited=${g2._invited.join(',')}`);
  delete process.env.VETREL;
}

// V3: yield — veteran scholar, wave-3 near death, companion engaged.
{
  process.env.VETREL = '1';
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const g = fightGame({ scholarVet: true, monsterHp: 50, monsterMaxHp: 300, compHp: 80 });
  const ctx = stubCtx();
  const r = wrapped.fight(g, ctx);
  check('V3: veteran scholar yields the killing blow (waits, handles turn)',
    r === true && g._waited === true && !ctx._baseFightCalled && (ctx.vetYields || 0) === 1,
    `waited=${g._waited} yields=${ctx.vetYields || 0}`);
  check('V3b: veteran scholar does NOT commit (35% discipline preserved)',
    ctx._huntCommit === false, `_huntCommit=${ctx._huntCommit}`);
  delete process.env.VETREL;
}

// V4: non-veteran scholar commits, no yield.
{
  process.env.VETREL = '1';
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const g = fightGame({ scholarVet: false, monsterHp: 50, monsterMaxHp: 300, compHp: 80 });
  const ctx = stubCtx();
  wrapped.fight(g, ctx);
  check('V4: non-veteran scholar commits (_huntCommit=true), no yield',
    ctx._huntCommit === true && (ctx.vetYields || 0) === 0 && ctx._baseFightCalled === true,
    `commit=${ctx._huntCommit} yields=${ctx.vetYields || 0}`);
  delete process.env.VETREL;
}

// V5: breakoff — companion <40%, monster NOT near death.
{
  process.env.VETREL = '1';
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const g = fightGame({ scholarVet: true, monsterHp: 200, monsterMaxHp: 300, compHp: 30, compMaxHp: 100 });
  const ctx = stubCtx();
  const r = wrapped.fight(g, ctx);
  check('V5: hurt companion breaks off the hunt (disengage, handled)',
    r === true && (ctx.vetBreakoffs || 0) === 1 && (g._moved || g._exited) && !ctx._baseFightCalled,
    `breakoffs=${ctx.vetBreakoffs || 0} moved=${g._moved}`);
  check('V5b: commitment cleared on breakoff', ctx._huntCommit === false);
  delete process.env.VETREL;
}

// V6: rescue — companion <40% + monster near death: NO breakoff, strike.
{
  process.env.VETREL = '1';
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const g = fightGame({ scholarVet: true, monsterHp: 50, monsterMaxHp: 300, compHp: 30, compMaxHp: 100 });
  const ctx = stubCtx();
  wrapped.fight(g, ctx);
  check('V6: near-death monster + hurt companion -> scholar strikes (no breakoff)',
    (ctx.vetBreakoffs || 0) === 0 && (ctx.vetRescues || 0) === 1 && ctx._baseFightCalled === true && !g._waited,
    `breakoffs=${ctx.vetBreakoffs || 0} rescues=${ctx.vetRescues || 0}`);
  delete process.env.VETREL;
}

// V7: no yield when the scholar is hurting.
{
  process.env.VETREL = '1';
  const wrapped = VR.withVetrel(baseFightStub(), 't', 't');
  const g = fightGame({ scholarVet: true, monsterHp: 50, monsterMaxHp: 300, compHp: 80, scholarHp: 40, scholarMaxHp: 120 });
  const ctx = stubCtx();
  wrapped.fight(g, ctx);
  check('V7: hurting scholar (hpPct<0.5) does not yield — delegates',
    (ctx.vetYields || 0) === 0 && ctx._baseFightCalled === true && !g._waited);
  delete process.env.VETREL;
}

// V2e/V4b: hunt leg fires with companions; cadence + no-companion gates.
{
  process.env.VETREL = '1';
  const g = stubGame({ party: ['c1'], monsterAt: null });
  const ctx = stubCtx();
  VR.veteranHuntLeg(g, ctx);
  check('V2e: hunt leg fires with companions post wave-3', (ctx.vetHunts || 0) === 1, `vetHunts=${ctx.vetHunts || 0}`);
  const ctx2 = stubCtx(); ctx2._lastVetHuntDay = 100;
  VR.veteranHuntLeg(stubGame({ party: ['c1'], monsterAt: null }), ctx2);
  check('V2f: 3-day cadence blocks back-to-back hunts', (ctx2.vetHunts || 0) === 0);
  const ctx3 = stubCtx();
  VR.veteranHuntLeg(stubGame({ party: [], monsterAt: null }), ctx3);
  check('V2g: no companions -> no hunt', (ctx3.vetHunts || 0) === 0);
  delete process.env.VETREL;
}

// V8: det-gate (real harness).
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  async function trajectory(seed, envOn, policyObj) {
    if (envOn) process.env.VETREL = '1'; else delete process.env.VETREL;
    process.env.SEATDRIVE = '0';
    process.env.FEASTSCALE_R13 = '1';
    const { Game } = await loadGame({ seed, mode: 'vetrel-det', fullTelemetry: false });
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
  const tOff1 = await trajectory(204, false, VR.vetrelLead);
  const tOff2 = await trajectory(204, false, leadfeast);
  check('V8a det-gate: gate-off vetrel-lead byte-identical to leadfeast (s204)',
    tOff1 === tOff2 && tOff1.length > 0, `len=${tOff1.length}`);
  const tOff3 = await trajectory(315, false, VR.vetrelBelong);
  const tOff4 = await trajectory(315, false, belongfeast);
  check('V8b det-gate: gate-off vetrel-belong byte-identical to belongfeast (s315)',
    tOff3 === tOff4 && tOff3.length > 0, `len=${tOff3.length}`);
  const tOn1 = await trajectory(204, true, VR.vetrelLead);
  const tOn2 = await trajectory(204, true, VR.vetrelLead);
  check('V8c det-gate: gate-on deterministic (identical armed 60d byte-identical)', tOn1 === tOn2);
  // Gate-ON non-vacuity on a fabricated state: the protocol invites with
  // the gate on and stays silent with it off.
  process.env.VETREL = '1';
  const gOn = stubGame({ gear: { v1: { melee: { bonus: 12 } } } });
  const ctxOn = stubCtx();
  VR.companionProtocol(gOn, ctxOn);
  delete process.env.VETREL;
  const gOff = stubGame({ gear: { v1: { melee: { bonus: 12 } } } });
  const ctxOff = stubCtx();
  VR.companionProtocol(gOff, ctxOff);
  check('V8d det-gate: gate-ON genuinely moves (non-vacuous)',
    (ctxOn.vetInvitesOk || 0) >= 1 && (ctxOff.vetInvitesOk || 0) === 0,
    `on=${ctxOn.vetInvitesOk || 0} off=${ctxOff.vetInvitesOk || 0}`);

  delete process.env.VETREL;
  delete globalThis.Scattering;
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
