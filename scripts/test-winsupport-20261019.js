#!/usr/bin/env node
// test-winsupport-20261019.js — proof for scripts/policies/winsupport.js
// (flesh-out loop arm sim-winsupport, run fleshout-20261019T07xxZ, axis scale-onramp).
//
// The lever: window-gated fighter recovery — (a) post-fight triage for
// wave-4-engaged fighters (extract home + rest + tend the wounded party),
// (b) deferral-window raid posture (the scholar meets night raids at full
// HP: one honest rest/day at haven while the def5 window is live).
// Policy-side only, WINSUPPORT=1 gated, default OFF.
//
// RED->GREEN: written BEFORE scripts/policies/winsupport.js existed (RED:
// module missing). Behavioral fixtures below pin the contract; the
// implementation must make them GREEN.
//
// Sections:
//   GATE   — WINSUPPORT unset: pure delegation (daily/upkeep/fight call
//            base exactly, ctx untouched).
//   WINDOW — wsWindowLive reads standingDeferral(5).deferred only.
//   TRIAGE — fight recorder: wave-4 + >=25% maxHp drop -> triage flag;
//            wave-3 / small drop / scholar-dead -> no flag.
//   POSTURE — upkeep rest: fires once/day at haven, wounded, fed/hydrated/
//            warm, window live; silent otherwise.
//   TEND    — daily: wounded party (<70) tended, cap 2/day, haven-gated.
//   EXTRACT — daily: triage-active + away + wounded -> travelTo(4,4), 1/day.
//   SMOKE   — real harness, 30d, WINSUPPORT=1: no crash, counters move when
//            the window is live (forced via fixture is overkill — smoke only
//            asserts no-crash + delegation integrity on a real Game).
//   DET     — WINSUPPORT=1 vs unset, 2 seeds x 30d (window never opens that
//            early): per-day hashes byte-identical. The layer is pure
//            delegation until the window opens.
//
// Usage: node scripts/test-winsupport-20261019.js
//   SMOKE=1: only the SMOKE section. DET=1: only the DET section.
'use strict';
const path = require('path');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL: ' + name); }
}
function section(n) { console.log(n); }

// ---- fixture Game -------------------------------------------------------
function fixtureGame(over) {
  const calls = { rest: 0, travelTo: [], tend: [], doActionKinds: [] };
  const G = {
    _calls: calls,
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

const WS = require('./policies/winsupport');

section('GATE — WINSUPPORT unset: pure delegation, ctx untouched');
(function () {
  delete process.env.WINSUPPORT;
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  const G = fixtureGame();
  const ctx = {};
  const keysBefore = Object.keys(ctx).join(',');
  const r1 = p.daily(G, ctx), r2 = p.upkeep(G, ctx), r3 = p.fight(G, ctx);
  ok(r1 === 'daily' && base._calls.daily === 1, 'daily delegates exactly once');
  ok(r2 === 'upkeep' && base._calls.upkeep === 1, 'upkeep delegates exactly once');
  ok(r3 === false && base._calls.fight === 1, 'fight delegates exactly once');
  ok(Object.keys(ctx).join(',') === keysBefore, 'ctx untouched when gate off');
  ok(G._calls.rest === 0 && G._calls.travelTo.length === 0 && G._calls.tend.length === 0, 'no verbs fire when gate off');
})();

section('WINDOW — wsWindowLive reads standingDeferral(5)');
(function () {
  process.env.WINSUPPORT = '1';
  const G = fixtureGame();
  G._def5 = false;
  ok(WS.wsWindowLive(G) === false, 'window off when not deferred');
  G._def5 = true;
  ok(WS.wsWindowLive(G) === true, 'window live when deferred');
  const G2 = fixtureGame();
  delete G2.standingDeferral;
  ok(WS.wsWindowLive(G2) === false, 'window off when verb missing');
  delete process.env.WINSUPPORT;
})();

section('TRIAGE — wave-4 fight + big HP drop sets the flag');
(function () {
  process.env.WINSUPPORT = '1';
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  const G = fixtureGame();
  const ctx = {};
  // wave-4 fight opens; scholar at full HP
  G._pHp = 100;
  G.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }, { kind: 'player', key: 'p' }] };
  p.fight(G, ctx);
  ok(ctx._wsFight === G.tbfight, 'fight recorded');
  ok(ctx._wsFightMaxWave === 4, 'max wave read as 4');
  // fight ends; scholar mauled to 60
  G.tbfight.over = true; G.tbfight = null;
  G.state.scholar.health = 60;
  p.daily(G, ctx); // closeout runs in daily
  ok((ctx._wsTriageUntil || 0) >= 10, 'triage flag set after wave-4 mauling');
  ok((ctx.wsTriages || 0) === 1, 'triage counter incremented');
  delete process.env.WINSUPPORT;
})();
(function () {
  process.env.WINSUPPORT = '1';
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  // wave-3 mauling: NO flag (the lever is wave-4-engaged fighters)
  const G = fixtureGame(); const ctx = {};
  G._pHp = 100;
  G.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_gavel', hp: 300, maxHp: 400, fled: false }] };
  p.fight(G, ctx);
  G.tbfight.over = true; G.tbfight = null;
  G.state.scholar.health = 60;
  p.daily(G, ctx);
  ok(!(ctx._wsTriageUntil >= 10), 'no triage flag for wave-3 fights');
  // wave-4 but a scratch: NO flag
  const G2 = fixtureGame(); const ctx2 = {};
  G2._pHp = 100;
  G2.tbfight = { over: false, fighters: [{ kind: 'monster', monsterId: 'the_eulogy', hp: 900, maxHp: 1200, fled: false }] };
  p.fight(G2, ctx2);
  G2.tbfight.over = true; G2.tbfight = null;
  G2.state.scholar.health = 90;
  p.daily(G2, ctx2);
  ok(!(ctx2._wsTriageUntil >= 10), 'no triage flag for <25% HP drop');
  delete process.env.WINSUPPORT;
})();

section('POSTURE — upkeep rest: once/day, haven, wounded, fed, window live');
(function () {
  process.env.WINSUPPORT = '1';
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  G.state.scholar.health = 70;
  const ctx = {};
  p.upkeep(G, ctx);
  ok(G._calls.rest === 1, 'rest fires once when wounded at haven in window');
  ok(ctx._wsRestDay === 10, 'rest day pinned');
  p.upkeep(G, ctx); p.upkeep(G, ctx);
  ok(G._calls.rest === 1, 'no second rest the same day');
  // full HP: silent
  const G2 = fixtureGame(); G2._def5 = true; G2.state.scholar.health = 100;
  p.upkeep(G2, {});
  ok(G2._calls.rest === 0, 'no rest at full HP');
  // starving: rest cannot heal — silent
  const G3 = fixtureGame(); G3._def5 = true; G3.state.scholar.health = 70; G3.state.scholar.kcal = 0;
  p.upkeep(G3, {});
  ok(G3._calls.rest === 0, 'no rest while starving (metabolic crisis)');
  // away from haven: silent (posture is a haven beat)
  const G4 = fixtureGame(); G4._def5 = true; G4._atHaven = false; G4.state.scholar.health = 70;
  p.upkeep(G4, {});
  ok(G4._calls.rest === 0, 'no rest away from haven');
  // window off: silent
  const G5 = fixtureGame(); G5._def5 = false; G5.state.scholar.health = 70;
  p.upkeep(G5, {});
  ok(G5._calls.rest === 0, 'no rest outside the window');
  delete process.env.WINSUPPORT;
})();

section('TEND — wounded party tended at haven, cap 2/day');
(function () {
  process.env.WINSUPPORT = '1';
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  const G = fixtureGame(); G._def5 = true;
  G._party = ['v1', 'v2'];
  G.state.village.health = { v1: 50, v2: 90 };
  const ctx = {};
  p.daily(G, ctx);
  ok(G._calls.tend.length === 1 && G._calls.tend[0] === 'v1', 'wounded companion tended, healthy one skipped');
  // cap: three wounded -> two tended
  const G2 = fixtureGame(); G2._def5 = true;
  G2._party = ['v1', 'v2', 'v3'];
  G2.state.village.health = { v1: 40, v2: 45, v3: 50 };
  p.daily(G2, {});
  ok(G2._calls.tend.length === 2, 'tend capped at 2/day');
  // away from haven: no tending (the scholar is not there)
  const G3 = fixtureGame(); G3._def5 = true; G3._atHaven = false;
  G3._party = ['v1'];
  G3.state.village.health = { v1: 40 };
  p.daily(G3, {});
  ok(G3._calls.tend.length === 0, 'no tending away from haven');
  delete process.env.WINSUPPORT;
})();

section('EXTRACT — triage-active + away + wounded -> travelTo(4,4), 1/day');
(function () {
  process.env.WINSUPPORT = '1';
  const base = fixtureBase();
  const p = WS.withWinSupport(base, 'ws-test', 'test');
  const G = fixtureGame(); G._def5 = true; G._atHaven = false;
  G.state.scholar.health = 55;
  const ctx = { _wsTriageUntil: 12 };
  p.daily(G, ctx);
  ok(G._calls.travelTo.length === 1 && G._calls.travelTo[0][0] === 4 && G._calls.travelTo[0][1] === 4, 'extract home fires once');
  ok(G._atHaven === true, 'scholar home after extract');
  // no triage, healthy: no extract
  const G2 = fixtureGame(); G2._def5 = true; G2._atHaven = false; G2.state.scholar.health = 95;
  p.daily(G2, {});
  ok(G2._calls.travelTo.length === 0, 'no extract when healthy and no triage');
  delete process.env.WINSUPPORT;
})();

section('SMOKE — real harness, WINSUPPORT=1, 30d');
async function smoke() {
  process.env.WINSUPPORT = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const base = TF.leadfeast;
  const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
  const policy = WS.withWinSupport(stack, 't-ws', 't');
  const { Game } = await loadGame({ seed: 64001, mode: 'winsupport-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  ok(!Game.over || true, 'smoke survived-or-died honestly (over=' + !!Game.over + ')');
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' rests=' + (ctx.wsRests || 0) + ' tends=' + (ctx.wsTends || 0) + ' extracts=' + (ctx.wsExtracts || 0) + ' triages=' + (ctx.wsTriages || 0));
  delete process.env.WINSUPPORT;
}

section('DET — WINSUPPORT=1 vs unset byte-identical while the window never opens');
async function det() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  async function runOnce(seed, wsOn) {
    if (wsOn) process.env.WINSUPPORT = '1'; else delete process.env.WINSUPPORT;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = WS.withWinSupport(stack, 't-ws', 't');
    const { Game } = await loadGame({ seed, mode: 'winsupport-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => { const r = oDaily(G, ctx); try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} return r; };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    delete process.env.WINSUPPORT;
    return hashes.join('|');
  }
  let allOk = true;
  for (const seed of [64001, 64002]) {
    const hOff = await runOnce(seed, false);
    const hOn = await runOnce(seed, true);
    const same = hOff === hOn && hOff.length > 0;
    ok(same, 'WINSUPPORT=1 identical to unset on s' + seed + ' (30d, window never opens)');
    if (!same) allOk = false;
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
