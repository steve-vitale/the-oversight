#!/usr/bin/env node
// test-tendhalf-20261019.js — proof for scripts/policies/tendhalf.js
// (flesh-out loop arm sim-tendhalf, run fleshout-20261019T10xxZ, axis scale-onramp).
//
// THE LEVER — TEND-ONLY window support (the one unindicted half of the
// killed sim-winsupport-decomp layer, evidence/2026-10-19/sim-winsupport-decomp.md
// named next #2): when the def5 window is live (reuses wsWindowLive from
// scripts/policies/winsupport.js — the parked file is NOT modified), tend
// wounded companions AT HAVEN (cap 2/day), and do NOTHING else: no travelTo
// extract, no rest verb, no fight recording. Pure policy-side, TENDHALF=1
// default OFF. Zero src/js changes.
//
// RED->GREEN: written BEFORE scripts/policies/tendhalf.js existed
// (RED: module missing). Behavioral fixtures below pin the contract.
//
// Sections:
//   GATE        — TENDHALF unset: pure delegation (daily/upkeep/fight call
//                 base exactly, ctx untouched, no verbs fire).
//   TEND        — window live + haven + wounded party (<70): tendVillager
//                 fires, cap 2/day, wounded-only, skips the scholar's own
//                 vid, skips the dead.
//   TEND-BOUND  — no tend when the window is not live; no tend away from
//                 haven; no tend when gate off.
//   NOTHING-ELSE— travelTo never fires; doAction('rest') never fires; the
//                 fight path records nothing (ctx carries no _ws* keys on
//                 any path).
//   SMOKE       — real harness, 30d, control + tendhalf: no crash, ctx
//                 moves only on the armed arm.
//   DET         — TENDHALF=1 vs unset byte-identical (window never opens
//                 that early): the layer is pure delegation until the window
//                 opens.
//   KILLED-VERDICT — re-pins the kill verdict on the committed pilot corpus
//                 via the analyzer's judge (added at the kill finish;
//                 runs with or without the layer).
//
// Usage: node scripts/test-tendhalf-20261019.js
//   SMOKE=1: only the SMOKE section. DET=1: only the DET section.
'use strict';

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL: ' + name); }
}
function section(n) { console.log(n); }
function armOn() { process.env.TENDHALF = '1'; }
function clearEnv() { delete process.env.TENDHALF; }

// ---- fixture Game -------------------------------------------------------
function fixtureGame(over) {
  const calls = { rest: 0, travelTo: [], tend: [], doActionKinds: [] };
  const G = {
    _calls: calls,
    state: {
      scholar: { day: 10, health: 100, hp: 100, kcal: 500, hydration: 80, dead: false, exiled: false },
      village: { health: {}, roster: ['scholar1', 'v1', 'v2', 'v3'] },
      weather: 'clear',
    },
    data: { monsters: [{ id: 'the_eulogy', wave: 4 }, { id: 'the_gavel', wave: 3 }, { id: 'hushwolf', wave: 1 }] },
    location: 'haven',
    villagerId: 'scholar1',
    over: false,
    tbfight: null,
    _def5: false,
    _atHaven: true,
    _dead: {},
    standingDeferral(w) { return w === 5 ? { wave: 5, deferred: !!this._def5 } : { wave: w, deferred: false }; },
    playerAtHaven() { return !!this._atHaven; },
    playerTile() { return { type: this._atHaven ? 'haven' : 'thicket' }; },
    maxHealth() { return 100; },
    inCombat() { return false; },
    tbIsPlayerTurn() { return true; },
    tbFighter(k) { return k === 'p' ? { hp: this._pHp != null ? this._pHp : 100, maxHp: 100 } : null; },
    doAction(kind) { calls.doActionKinds.push(kind); if (kind === 'rest') { calls.rest++; this.state.scholar.health = Math.min(100, this.state.scholar.health + 5); } return true; },
    travelTo(x, y) { calls.travelTo.push([x, y]); this._atHaven = (x === 4 && y === 4); },
    tendVillager(vid) { calls.tend.push(vid); const vh = this.state.village.health; vh[vid] = Math.min(100, ((vh[vid] !== undefined) ? vh[vid] : 100) + 25); },
    partyMembers() { return this._party || []; },
    vpOf(vid) { return this._dead[vid] ? { dead: true } : { dead: false }; },
    getPerson(vid) { return this._dead[vid] ? { dead: true } : { dead: false }; },
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

const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP (precedent: test-presence-confirm.js,
// test-winsupportdecomp-20261019.js): the layer scripts/policies/tendhalf.js
// was deleted per the kill protocol — TEND-ONLY NO-GO at pilot (primary
// -7d vs the +10d bar, guardrails hold; 16 runs/arm on seeds 65201–65208).
// Pre-deletion proof was 21/21 green (RED->GREEN documented). Layer-
// dependent sections INFO-SKIP; the KILLED-VERDICT section below pins the
// kill verdict on the committed pilot corpus via the analyzer's own judge
// function and runs with or without the layer.
const LAYER_PATH = path.join(__dirname, 'policies', 'tendhalf.js');
const LAYER_GONE = !fs.existsSync(LAYER_PATH);
const TH = LAYER_GONE ? null : require('./policies/tendhalf');
function sectionIfLayer(name) {
  section(name);
  if (LAYER_GONE) console.log('  INFO-SKIP: layer deleted per kill protocol (tendhalf NO-GO at pilot)');
}

sectionIfLayer('GATE — TENDHALF unset: pure delegation, ctx untouched, no verbs fire');
if (TH) (function () {
  clearEnv();
  const base = fixtureBase();
  const p = TH.withTendHalf(base, 'th-test', 'test');
  const G = fixtureGame(); G._def5 = true; G.state.scholar.health = 60;
  G._party = ['v1']; G.state.village.health = { v1: 50 };
  const ctx = {};
  const keysBefore = Object.keys(ctx).join(',');
  const r1 = p.daily(G, ctx), r2 = p.upkeep(G, ctx), r3 = p.fight(G, ctx);
  ok(r1 === 'daily' && base._calls.daily === 1, 'daily delegates exactly once');
  ok(r2 === 'upkeep' && base._calls.upkeep === 1, 'upkeep delegates exactly once');
  ok(r3 === false && base._calls.fight === 1, 'fight delegates exactly once');
  ok(Object.keys(ctx).join(',') === keysBefore, 'ctx untouched when gate off');
  ok(G._calls.tend.length === 0 && G._calls.rest === 0 && G._calls.travelTo.length === 0, 'no verbs fire when gate off (window live, wounded present)');
  clearEnv();
})();

sectionIfLayer('TEND — window live + haven: wounded party tended, cap 2/day');
if (TH) (function () {
  armOn();
  const base = fixtureBase();
  const p = TH.withTendHalf(base, 'th-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  G._party = ['v1', 'v2', 'v3', 'scholar1'];
  G.state.village.health = { v1: 40, v2: 45, v3: 50 };
  const ctx = {};
  p.daily(G, ctx);
  ok(G._calls.tend.length === 2, 'tend capped at 2/day');
  ok(!G._calls.tend.includes('scholar1'), 'the scholar\'s own vid is never tended');
  ok((ctx.thTends || 0) === 2, 'tend count recorded on ctx');
  // healthy party member untouched
  const G2 = fixtureGame(); G2._def5 = true;
  G2._party = ['v1', 'v2'];
  G2.state.village.health = { v1: 95, v2: 40 };
  p.daily(G2, {});
  ok(G2._calls.tend.length === 1 && G2._calls.tend[0] === 'v2', 'only the wounded (<70) are tended');
  // dead villager skipped
  const G3 = fixtureGame(); G3._def5 = true;
  G3._party = ['v1']; G3._dead = { v1: true };
  G3.state.village.health = { v1: 30 };
  p.daily(G3, {});
  ok(G3._calls.tend.length === 0, 'the dead are not tended');
  // the verb heals
  const G4 = fixtureGame(); G4._def5 = true;
  G4._party = ['v1']; G4.state.village.health = { v1: 50 };
  p.daily(G4, {});
  ok(G4.state.village.health.v1 === 75, 'tend heals via the real verb (+25)');
  clearEnv();
})();

sectionIfLayer('TEND-BOUND — no tend off-window, off-haven, or gate-off');
if (TH) (function () {
  armOn();
  const base = fixtureBase();
  const p = TH.withTendHalf(base, 'th-test', 'test');
  // window not live
  const G = fixtureGame(); G._def5 = false;
  G._party = ['v1']; G.state.village.health = { v1: 40 };
  p.daily(G, {});
  ok(G._calls.tend.length === 0, 'no tend when the def5 window is not live');
  // away from haven
  const G2 = fixtureGame(); G2._def5 = true; G2._atHaven = false; G2.location = 'wilds';
  G2._party = ['v1']; G2.state.village.health = { v1: 40 };
  p.daily(G2, {});
  ok(G2._calls.tend.length === 0, 'no tend away from haven');
  // gate off, window live, wounded, at haven
  clearEnv();
  const G3 = fixtureGame(); G3._def5 = true;
  G3._party = ['v1']; G3.state.village.health = { v1: 40 };
  p.daily(G3, {});
  ok(G3._calls.tend.length === 0, 'no tend when the gate is off');
  clearEnv();
})();

sectionIfLayer('NOTHING-ELSE — no extract, no rest verb, no fight recording, on any path');
if (TH) (function () {
  armOn();
  const base = fixtureBase();
  const p = TH.withTendHalf(base, 'th-test', 'test');
  const G = fixtureGame(); G._def5 = true; G._atHaven = false; G.location = 'wilds';
  G.state.scholar.health = 55; // wounded scholar away from haven
  G._party = ['v1']; G.state.village.health = { v1: 40 };
  const ctx = {};
  G._pHp = 100;
  G.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p.fight(G, ctx);
  G.tbfight.over = true; G.tbfight = null;
  G.state.scholar.health = 50; // scholar takes 50% damage in a wave-4 fight
  p.daily(G, ctx); p.upkeep(G, ctx);
  ok(G._calls.travelTo.length === 0, 'EXTRACT never fires (wounded, away, mauled — still no travelTo)');
  ok(G._calls.rest === 0 && !G._calls.doActionKinds.includes('rest'), 'the rest verb never fires');
  ok(!Object.keys(ctx).some(k => /^_ws/.test(k)), 'no _ws* fight-recording keys in ctx (record nothing)');
  ok(!('_wsTriageUntil' in ctx) && !('_wsFight' in ctx), 'no triage-flag / fight-record state');
  // gate off: identical purity
  clearEnv();
  const G2 = fixtureGame(); G2._def5 = true; G2._atHaven = false; G2.location = 'wilds';
  G2._party = ['v1']; G2.state.village.health = { v1: 40 };
  const ctx2 = {};
  p.daily(G2, ctx2); p.upkeep(G2, ctx2); p.fight(G2, ctx2);
  ok(Object.keys(ctx2).length === 0, 'gate off: ctx untouched on every path');
  clearEnv();
})();

section('KILLED-VERDICT — analyzer verdict re-derived on the committed pilot corpus (runs with or without the layer)');
(function () {
  // Pins the kill: the SAME judge function the arm-shift verdict rests on,
  // re-run against the committed per-seed pilot corpus (seeds 65201–65208).
  // Must reproduce the pre-registered NO-GO verdict exactly.
  process.env.SEEDS = '65201,65202,65203,65204,65205,65206,65207,65208';
  const A = require('./analyze-tendhalf-20261019');
  const W = require('./analyze-windowsurvive-20261019');
  const { byArm, bad } = A.loadValid();
  ok(bad.length === 0, `pilot corpus loads clean (bad files: ${bad.length})`);
  const C = A.summarize(byArm.control.map(W.attribute));
  const v = A.verdictFor(C, A.summarize(byArm.tendhalf.map(W.attribute)));
  ok(v.verdict === 'NO-GO (primary miss, guardrails hold — killed)', `pilot corpus verdict reproduces: ${v.verdict}`);
  ok(v.dMed === -7, `pilot corpus delta reproduces: ${v.dMed}d (bar +10d)`);
})();

section('SMOKE — real harness, 30d, control + tendhalf');
async function smoke() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'VETREL']) process.env[k] = '1';
  process.env.SEATDRIVE = '0';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WDf = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  for (const armOnNow of [false, true]) {
    if (armOnNow) armOn(); else clearEnv();
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WDf.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = TH.withTendHalf(stack, 't-th', 't');
    const { Game } = await loadGame({ seed: 65201, mode: 'tendhalf-smoke', fullTelemetry: false });
    await setupGame(Game);
    const ctx = {};
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    ok(result && result.gameDays >= 1, `smoke ${armOnNow ? 'tendhalf' : 'control'} completes: gameDays=${result && result.gameDays}`);
    console.log(`  SMOKE ${armOnNow ? 'tendhalf' : 'control'}: days=${result.gameDays} end=${Game.over ? 'over' : 'alive'} tends=${ctx.thTends || 0}`);
    clearEnv();
  }
}

section('DET — TENDHALF=1 vs unset byte-identical (window never opens early)');
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
  async function runOnce(seed, armed) {
    if (armed) armOn(); else clearEnv();
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WDf.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = TH.withTendHalf(stack, 't-th', 't');
    const { Game } = await loadGame({ seed, mode: 'tendhalf-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => { const r = oDaily(G, ctx); try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} return r; };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    clearEnv();
    return hashes.join('|');
  }
  let allOk = true;
  for (const seed of [65201, 65202]) {
    const hOff = await runOnce(seed, false);
    const hOn = await runOnce(seed, true);
    const same = hOff === hOn && hOff.length > 0;
    ok(same, `TENDHALF=1 identical to unset on s${seed} (30d, window never opens)`);
    if (!same) allOk = false;
  }
  console.log(allOk ? '  DET: ALL PASS' : '  DET: FAILURES');
}

(async () => {
  const wantSmoke = process.env.SMOKE === '1';
  const wantDet = process.env.DET === '1';
  if (LAYER_GONE && (wantSmoke || wantDet)) {
    console.log('  INFO-SKIP: SMOKE/DET need the deleted layer (kill protocol)');
  } else {
    if (wantSmoke) await smoke();
    if (wantDet) await det();
  }
  if (!wantSmoke && !wantDet) console.log('  (SMOKE=1 / DET=1 to run the live sections)');
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
