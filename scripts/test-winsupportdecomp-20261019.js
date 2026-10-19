#!/usr/bin/env node
// test-winsupportdecomp-20261019.js — proof for scripts/policies/winsupportdecomp.js
// (flesh-out loop arm sim-winsupport-decomp, run fleshout-20261019T08xxZ, axis scale-onramp).
//
// The lever: DECOMPOSITION of the parked sim-winsupport window-watch layer
// into its two halves plus the pantry-floor-gated full:
//   triage  — post-fight triage only (extract + tend), no raid posture
//   posture — raid-night posture only (honest rest), no triage
//   gated   — full parked stack + pantry-floor gate on the rest verb
//             (skip the 40-kcal rest when pantryKcalLive(village) < 4000 —
//             the engine's own "stores running thin" line).
// Policy-side only, WINSUPPORT=1 + WINSUPPORT_ARM required, default OFF.
//
// RED->GREEN: written BEFORE scripts/policies/winsupportdecomp.js existed
// (RED: module missing). Behavioral fixtures below pin the contract.
//
// Sections:
//   GATE        — WINSUPPORT unset: pure delegation for every WINSUPPORT_ARM
//                 value (daily/upkeep/fight call base exactly, ctx untouched).
//   ARM-SPLIT   — triage arm: upkeep never rests, fight records, daily tends;
//                 posture arm: fight never records, daily never tends/extracts,
//                 upkeep rests; gated arm: both halves present; unknown ARM:
//                 pure delegation.
//   TRIAGE      — (a) half pins: wave-4 + >=25% maxHp drop -> flag; wave-3 /
//                 scratch -> no flag (through the triage arm).
//   POSTURE     — (b) half pins: once/day, haven, wounded, fed, window live
//                 (through the posture arm).
//   TEND        — wounded party tended at haven, cap 2/day (triage arm).
//   EXTRACT     — triage-active + away + wounded -> travelTo(4,4), 1/day (triage arm).
//   PANTRY-FLOOR— gated arm: rest fires when pantry >= 4000; skipped below
//                 4000 (ctx.wsdcFloorSkips counts); fail-open when the pantry
//                 read throws (parked behavior, ctx.wsdcFloorReadMiss counts).
//   SMOKE       — real harness, 30d, per arm: no crash, counters move only
//                 on their own arm.
//   DET         — per arm: WINSUPPORT=1+ARM vs unset, 2 seeds x 30d (window
//                 never opens that early): per-day hashes byte-identical.
//                 The layer is pure delegation until the window opens.
//
// Usage: node scripts/test-winsupportdecomp-20261019.js
//   SMOKE=1: only the SMOKE section. DET=1: only the DET section.
//   DET_ARM=triage|posture|gated: restrict DET to one arm (infra workaround).
'use strict';

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL: ' + name); }
}
function section(n) { console.log(n); }
function setArm(a) { process.env.WINSUPPORT = '1'; if (a == null) delete process.env.WINSUPPORT_ARM; else process.env.WINSUPPORT_ARM = a; }
function clearEnv() { delete process.env.WINSUPPORT; delete process.env.WINSUPPORT_ARM; }

// ---- fixture Game -------------------------------------------------------
function fixtureGame(over) {
  const calls = { rest: 0, travelTo: [], tend: [], doActionKinds: [] };
  const G = {
    _calls: calls,
    _pantryKcal: 20000,
    _pantryThrow: false,
    state: {
      scholar: { day: 10, health: 100, hp: 100, kcal: 500, hydration: 80, dead: false, exiled: false },
      village: { health: {}, roster: ['scholar1', 'v1', 'v2'] },
      weather: 'clear',
    },
    data: { monsters: [{ id: 'the_eulogy', wave: 4 }, { id: 'the_gavel', wave: 3 }, { id: 'hushwolf', wave: 1 }] },
    location: 'haven',
    villagerId: 'scholar1',
    over: false,
    tbfight: null,
    _def5: false,
    _atHaven: true,
    standingDeferral(w) { return w === 5 ? { wave: 5, deferred: !!this._def5 } : { wave: w, deferred: false }; },
    playerAtHaven() { return !!this._atHaven; },
    playerTile() { return { type: this._atHaven ? 'haven' : 'thicket' }; },
    maxHealth() { return 100; },
    inCombat() { return false; },
    tbIsPlayerTurn() { return true; },
    tbFighter(k) { return k === 'p' ? { hp: this._pHp != null ? this._pHp : 100, maxHp: 100 } : null; },
    pantryKcalLive(v) { if (this._pantryThrow) throw new Error('pantry boom'); return this._pantryKcal; },
    doAction(kind) { calls.doActionKinds.push(kind); if (kind === 'rest') { calls.rest++; this.state.scholar.health = Math.min(100, this.state.scholar.health + 5); } return true; },
    travelTo(x, y) { calls.travelTo.push([x, y]); this._atHaven = (x === 4 && y === 4); },
    tendVillager(vid) { calls.tend.push(vid); const vh = this.state.village.health; vh[vid] = Math.min(100, ((vh[vid] !== undefined) ? vh[vid] : 100) + 25); },
    partyMembers() { return this._party || []; },
    vpOf(vid) { return { dead: false }; },
    getPerson(vid) { return { dead: false }; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function fixtureBase() {
  const calls = { daily: 0, upkeep: 0, fight: 0 };
  return {
    _calls: calls,
    id: 'base', desc: 'fixture base',
    daily(G, ctx) { calls.daily++; return 'daily'; },
    upkeep(G, ctx) { calls.upkeep++; return 'upkeep'; },
    fight(G, ctx) { calls.fight++; return false; },
  };
}

const WD = require('./policies/winsupportdecomp');

section('GATE — WINSUPPORT unset: pure delegation for every ARM value, ctx untouched');
(function () {
  for (const a of ['triage', 'posture', 'gated', 'bogus', undefined]) {
    clearEnv();
    if (a !== undefined) process.env.WINSUPPORT_ARM = a; // ARM set but WINSUPPORT unset
    const base = fixtureBase();
    const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
    const G = fixtureGame(); G._def5 = true; G.state.scholar.health = 60;
    const ctx = {};
    const keysBefore = Object.keys(ctx).join(',');
    const r1 = p.daily(G, ctx), r2 = p.upkeep(G, ctx), r3 = p.fight(G, ctx);
    ok(r1 === 'daily' && base._calls.daily === 1, `daily delegates exactly once (ARM=${a})`);
    ok(r2 === 'upkeep' && base._calls.upkeep === 1, `upkeep delegates exactly once (ARM=${a})`);
    ok(r3 === false && base._calls.fight === 1, `fight delegates exactly once (ARM=${a})`);
    ok(Object.keys(ctx).join(',') === keysBefore, `ctx untouched when gate off (ARM=${a})`);
    ok(G._calls.rest === 0 && G._calls.travelTo.length === 0 && G._calls.tend.length === 0, `no verbs fire when gate off (ARM=${a})`);
  }
  clearEnv();
})();

section('ARM-SPLIT — each arm carries only its own half');
(function () {
  // triage arm: upkeep never rests; fight records; daily tends
  setArm('triage');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  const G = fixtureGame(); G._def5 = true; G.state.scholar.health = 60;
  const ctx = {};
  p.upkeep(G, ctx);
  ok(G._calls.rest === 0, 'triage arm: upkeep never rests (posture absent)');
  G._pHp = 100;
  G.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p.fight(G, ctx);
  ok(ctx._wsFight === G.tbfight, 'triage arm: fight records');
  G.tbfight.over = true; G.tbfight = null; G.state.scholar.health = 60;
  G._party = ['v1']; G.state.village.health = { v1: 50 };
  p.daily(G, ctx);
  ok(G._calls.tend.length === 1, 'triage arm: daily tends the wounded');
  // posture arm: fight never records; daily never tends/extracts; upkeep rests
  setArm('posture');
  const base2 = fixtureBase();
  const p2 = WD.withWinSupportDecomp(base2, 'wsd-test', 'test');
  const G2 = fixtureGame(); G2._def5 = true; G2.state.scholar.health = 60;
  const ctx2 = {};
  G2._pHp = 100;
  G2.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p2.fight(G2, ctx2);
  ok(ctx2._wsFight === undefined, 'posture arm: fight never records');
  G2.tbfight.over = true; G2.tbfight = null;
  G2._party = ['v1']; G2.state.village.health = { v1: 50 };
  p2.daily(G2, ctx2);
  ok(G2._calls.tend.length === 0 && G2._calls.travelTo.length === 0, 'posture arm: daily never tends/extracts');
  p2.upkeep(G2, ctx2);
  ok(G2._calls.rest === 1, 'posture arm: upkeep rests when wounded at haven in window');
  // gated arm: both halves present
  setArm('gated');
  const base3 = fixtureBase();
  const p3 = WD.withWinSupportDecomp(base3, 'wsd-test', 'test');
  const G3 = fixtureGame(); G3._def5 = true; G3.state.scholar.health = 60;
  const ctx3 = {};
  G3._pHp = 100;
  G3.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p3.fight(G3, ctx3);
  ok(ctx3._wsFight === G3.tbfight, 'gated arm: fight records');
  G3.tbfight.over = true; G3.tbfight = null;
  G3._party = ['v1']; G3.state.village.health = { v1: 50 };
  p3.daily(G3, ctx3);
  ok(G3._calls.tend.length === 1, 'gated arm: daily tends');
  p3.upkeep(G3, ctx3);
  ok(G3._calls.rest === 1, 'gated arm: upkeep rests (pantry full)');
  // unknown ARM: pure delegation
  setArm('bogus');
  const base4 = fixtureBase();
  const p4 = WD.withWinSupportDecomp(base4, 'wsd-test', 'test');
  const G4 = fixtureGame(); G4._def5 = true; G4.state.scholar.health = 60;
  const ctx4 = {};
  p4.upkeep(G4, ctx4); p4.daily(G4, ctx4); p4.fight(G4, ctx4);
  ok(G4._calls.rest === 0 && G4._calls.tend.length === 0 && Object.keys(ctx4).length === 0, 'unknown ARM: pure delegation, ctx untouched');
  clearEnv();
})();

section('TRIAGE — wave-4 fight + big HP drop sets the flag (triage arm)');
(function () {
  setArm('triage');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  const ctx = {};
  G._pHp = 100;
  G.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p.fight(G, ctx);
  G.tbfight.over = true; G.tbfight = null;
  G.state.scholar.health = 60;
  p.daily(G, ctx);
  ok((ctx._wsTriageUntil || 0) >= 10, 'triage flag set after wave-4 mauling');
  // wave-3 mauling: NO flag
  const G2 = fixtureGame(); G2._def5 = true; const ctx2 = {};
  G2._pHp = 100;
  G2.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_gavel', hp: 300, maxHp: 400, fled: false }] };
  p.fight(G2, ctx2);
  G2.tbfight.over = true; G2.tbfight = null;
  G2.state.scholar.health = 60;
  p.daily(G2, ctx2);
  ok(!(ctx2._wsTriageUntil >= 10), 'no triage flag for wave-3 fights');
  clearEnv();
})();

section('POSTURE — upkeep rest: once/day, haven, wounded, fed, window live (posture arm)');
(function () {
  setArm('posture');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  G.state.scholar.health = 70;
  const ctx = {};
  p.upkeep(G, ctx);
  ok(G._calls.rest === 1, 'rest fires once when wounded at haven in window');
  p.upkeep(G, ctx);
  ok(G._calls.rest === 1, 'no second rest the same day');
  const G2 = fixtureGame(); G2._def5 = true; G2.state.scholar.health = 100;
  p.upkeep(G2, {});
  ok(G2._calls.rest === 0, 'no rest at full HP');
  clearEnv();
})();

section('TEND — wounded party tended at haven, cap 2/day (triage arm)');
(function () {
  setArm('triage');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  G._party = ['v1', 'v2', 'v3'];
  G.state.village.health = { v1: 40, v2: 45, v3: 50 };
  p.daily(G, {});
  ok(G._calls.tend.length === 2, 'tend capped at 2/day');
  clearEnv();
})();

section('EXTRACT — triage-active + away + wounded -> travelTo(4,4), 1/day (triage arm)');
(function () {
  setArm('triage');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  const G = fixtureGame(); G._def5 = true; G._atHaven = false;
  G.state.scholar.health = 55;
  const ctx = { _wsTriageUntil: 12 };
  p.daily(G, ctx);
  ok(G._calls.travelTo.length === 1 && G._calls.travelTo[0][0] === 4 && G._calls.travelTo[0][1] === 4, 'extract home fires once');
  const G2 = fixtureGame(); G2._def5 = true; G2._atHaven = false; G2.state.scholar.health = 95;
  p.daily(G2, {});
  ok(G2._calls.travelTo.length === 0, 'no extract when healthy and no triage');
  clearEnv();
})();

section('PANTRY-FLOOR — gated arm skips the 40-kcal rest below 4000 pantry kcal');
(function () {
  ok(WD.PANTRY_FLOOR_KCAL === 4000, 'floor is the engine\'s own 4000-kcal "stores running thin" line');
  setArm('gated');
  const base = fixtureBase();
  const p = WD.withWinSupportDecomp(base, 'wsd-test', 'test');
  // pantry full: rest fires
  const G = fixtureGame(); G._def5 = true; G.state.scholar.health = 60; G._pantryKcal = 20000;
  const ctx = {};
  p.upkeep(G, ctx);
  ok(G._calls.rest === 1, 'rest fires when pantry >= 4000');
  // pantry thin: rest skipped, skip counted
  const G2 = fixtureGame(); G2._def5 = true; G2.state.scholar.health = 60; G2._pantryKcal = 3999;
  const ctx2 = {};
  p.upkeep(G2, ctx2);
  ok(G2._calls.rest === 0, 'rest skipped when pantry < 4000');
  ok((ctx2.wsdcFloorSkips || 0) === 1, 'floor skip counted');
  // boundary: exactly 4000 -> fires (below, not at-or-below)
  const G3 = fixtureGame(); G3._def5 = true; G3.state.scholar.health = 60; G3._pantryKcal = 4000;
  p.upkeep(G3, {});
  ok(G3._calls.rest === 1, 'rest fires at exactly 4000 (floor is strict <)');
  // pantry read throws: fail OPEN to parked behavior, miss counted
  const G4 = fixtureGame(); G4._def5 = true; G4.state.scholar.health = 60; G4._pantryThrow = true;
  const ctx4 = {};
  p.upkeep(G4, ctx4);
  ok(G4._calls.rest === 1, 'fail-open: rest fires when the pantry read throws');
  ok((ctx4.wsdcFloorReadMiss || 0) === 1, 'read miss counted');
  // triage/posture arms ignore the floor entirely (no floor logic on their verbs)
  setArm('triage');
  const p2 = WD.withWinSupportDecomp(fixtureBase(), 'wsd-test', 'test');
  const G5 = fixtureGame(); G5._def5 = true; G5._atHaven = false; G5.state.scholar.health = 55; G5._pantryKcal = 100;
  const ctx5 = { _wsTriageUntil: 12 };
  p2.daily(G5, ctx5);
  ok(G5._calls.travelTo.length === 1, 'triage EXTRACT ignores the floor (floor is rest-verb-only by design)');
  ok((ctx5.wsdcFloorSkips || 0) === 0, 'no floor accounting on the triage arm');
  clearEnv();
})();

section('SMOKE — real harness, per arm, 30d');
async function smoke() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL']) process.env[k] = '1';
  process.env.SEATDRIVE = '0';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WDf = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  for (const arm of ['triage', 'posture', 'gated']) {
    setArm(arm);
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WDf.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = WD.withWinSupportDecomp(stack, 't-wsd', 't');
    const { Game } = await loadGame({ seed: 65001, mode: 'winsupportdecomp-smoke', fullTelemetry: false });
    await setupGame(Game);
    const ctx = {};
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    ok(result && result.gameDays >= 1, `smoke ${arm} completes: gameDays=${result && result.gameDays}`);
    console.log(`  SMOKE ${arm}: days=${result.gameDays} end=${Game.over ? 'over' : 'alive'} rests=${ctx.wsRests || 0} tends=${ctx.wsTends || 0} extracts=${ctx.wsExtracts || 0} triages=${ctx.wsTriages || 0} floorSkips=${ctx.wsdcFloorSkips || 0}`);
    clearEnv();
  }
}

section('DET — per arm: WINSUPPORT=1+ARM vs unset byte-identical (window never opens early)');
async function det() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL']) process.env[k] = '1';
  process.env.SEATDRIVE = '0';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WDf = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  async function runOnce(seed, armOn) {
    if (armOn) setArm(armOn); else clearEnv();
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WDf.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = WD.withWinSupportDecomp(stack, 't-wsd', 't');
    const { Game } = await loadGame({ seed, mode: 'winsupportdecomp-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => { const r = oDaily(G, ctx); try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} return r; };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    clearEnv();
    return hashes.join('|');
  }
  const onlyArm = (process.env.DET_ARM || '').toLowerCase();
  const arms = ['triage', 'posture', 'gated'].filter(a => !onlyArm || a === onlyArm);
  let allOk = true;
  for (const arm of arms) {
    for (const seed of [65001, 65002]) {
      const hOff = await runOnce(seed, null);
      const hOn = await runOnce(seed, arm);
      const same = hOff === hOn && hOff.length > 0;
      ok(same, `ARM=${arm} identical to unset on s${seed} (30d, window never opens)`);
      if (!same) allOk = false;
    }
  }
  console.log(allOk ? '  DET: ALL PASS' : '  DET: FAILURES');
}

(async () => {
  const wantSmoke = process.env.SMOKE === '1';
  const wantDet = process.env.DET === '1';
  if (wantSmoke) await smoke();
  if (wantDet) await det();
  if (!wantSmoke && !wantDet) console.log('  (SMOKE=1 / DET=1 to run the live sections)');
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
