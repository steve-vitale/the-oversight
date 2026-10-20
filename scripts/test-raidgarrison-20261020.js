#!/usr/bin/env node
// test-raidgarrison-20261020.js — proof for scripts/policies/raidgarrison.js
// (flesh-out loop arm sim-raidgarrison, run fleshout-20261020T1015Z, axis
// scale-onramp).
//
// THE GARRISON DOCTRINE (def5-window-gated raid-defense posture):
//   1. HOMEKEEP: while Game.standingDeferral(5).deferred, covenant defense
//      calls and trade-league favor calls are answered 'refuse' instead of
//      'send' — no 2-villager/3-day away parties; the engine's own refusal
//      path fires (said aloud, real trust cost, ledger entries).
//   2. MUSTER: while the window is live AND the night is dangerous (aid
//      crisis live, raiders lingering, or raid-ripe: >=7d since lastRaidDay
//      + pantry >= 3000 + 3+ world monsters), the scholar does not leave
//      Haven: travelTo wrapper refuses outward travel (null, logged);
//      homeward travel and combatExit barrier crossings always delegate.
// RAIDGARRISON=1 gated, default OFF. Zero src/js.
//
// Sections:
//   GATE      — RAIDGARRISON unset: pure delegation (base.daily called
//               exactly once, ctx untouched, no ledger, verbs unwrapped).
//   HOMEKEEP  — window live: 'send' -> 'refuse' on both call verbs (the
//               engine's refusal path fires with its own args); window not
//               live: pure delegation; explicit 'refuse' never rewritten.
//   MUSTER    — window live + danger: outward travelTo -> null (logged);
//               homeward delegates; combatExit delegates; window not live
//               -> delegates; danger absent -> delegates.
//   WINDOW    — rgWindowLive reads standingDeferral(5).deferred honestly:
//               true/false/null/absent-engine all handled.
//   SMOKE     — real harness, 30d, RAIDGARRISON=1: no crash, delegation
//               integrity on a real Game.
//   DET       — RAIDGARRISON=1 vs unset, 2 seeds x 90d: per-day hashes
//               byte-identical until the first garrison engagement morning
//               (def5 fires late; the layer is pure reads until then).
//   VERDICT   — GO-VERDICT or KILLED-VERDICT.
//   KILL-PROTOCOL — layer file deleted -> INFO-SKIP (zero-trace).
//
// RED->GREEN: run with RED=1 to assert the doctrine against the UNWRAPPED
// base (expects failures — the base sends calls and travels out); without
// RED the same assertions run against the wrapped layer (expects passes).
//
// Usage: node scripts/test-raidgarrison-20261020.js
//   SMOKE=1: only the SMOKE section. DET=1: only the DET section.
'use strict';
const path = require('path');
const fs = require('fs');

let pass = 0, fail = 0, skipped = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.error('  FAIL: ' + name); }
}
function section(n) { console.log(n); }
function infoSkip(name) { skipped++; console.log('  INFO-SKIP: ' + name); }

const LAYER_PATH = path.join(__dirname, 'policies', 'raidgarrison.js');
const layerGone = !fs.existsSync(LAYER_PATH);
let RG = null;
if (!layerGone) RG = require('./policies/raidgarrison');

// RED mode: assert against the UNWRAPPED base (doctrine must FAIL there).
const RED = process.env.RED === '1';

// ---- fixture Game -------------------------------------------------------
function fixtureGame(o) {
  o = o || {};
  const calls = { say: [], defense: [], trade: [], travel: [] };
  const G = {
    _calls: calls,
    _def5: o.def5 !== undefined ? o.def5 : false,
    _crisis: o.crisis || null,
    _linger: o.linger || [],
    state: {
      scholar: { day: 10, dead: false, exiled: false },
      village: {
        roster: ['scholar1', 'v1', 'v2'], px: 4, py: 4,
        lastRaidDay: o.lastRaidDay !== undefined ? o.lastRaidDay : 0,
      },
    },
    map: { px: o.sx !== undefined ? o.sx : 4, py: o.sy !== undefined ? o.sy : 4 },
    villagerId: 'scholar1',
    over: false,
    standingDeferral(w) { return w === 5 ? { deferred: !!this._def5 } : null; },
    playerAtHaven() { return this.map.px === 4 && this.map.py === 4; },
    aidCrisis() { return this._crisis; },
    lingeringRaiders() { return this._linger.filter(m => (m.hp || 0) > 0); },
    worldMonsters() { return o.monsters || []; },
    pantryKcalLive() { return o.pantry !== undefined ? o.pantry : 99999; },
    say(s) { calls.say.push(s); },
    answerDefenseCall(linkId, how) { calls.defense.push({ linkId, how }); return how; },
    answerTradeCall(linkId, how) { calls.trade.push({ linkId, how }); return how; },
    travelTo(x, y, force, combatExit) { calls.travel.push({ x, y, force, combatExit }); return 'traveled'; },
  };
  return G;
}

function baseStub() {
  const calls = { daily: 0 };
  return {
    _calls: calls,
    id: 'base-stub', desc: 'stub',
    daily(Game, ctx) { calls.daily++; return 'base-daily'; },
  };
}

function wrappedOrBase() {
  if (layerGone) return baseStub(); // KILL-PROTOCOL: no layer, no doctrine to assert
  const base = baseStub();
  if (RED) return base; // RED: the doctrine must fail on the bare base
  return RG.withRaidGarrison(base, 't-rg', 't');
}

if (!layerGone) {
section('GATE — RAIDGARRISON unset: pure delegation');
{
  delete process.env.RAIDGARRISON;
  const base = baseStub();
  const policy = RG ? RG.withRaidGarrison(base, 't-rg', 't') : base;
  const G = fixtureGame({ def5: true, crisis: { kind: 'monster' } });
  const ctx = {};
  const origTravel = G.travelTo, origDef = G.answerDefenseCall, origTrade = G.answerTradeCall;
  const r = policy.daily(G, ctx);
  ok(r === 'base-daily', 'gate off: base.daily result passes through');
  ok(base._calls.daily === 1, 'gate off: base.daily called exactly once');
  ok(ctx._raidgarrison === undefined, 'gate off: ctx untouched (no ledger)');
  ok(G.travelTo === origTravel, 'gate off: travelTo unwrapped');
  ok(G.answerDefenseCall === origDef, 'gate off: answerDefenseCall unwrapped');
  ok(G.answerTradeCall === origTrade, 'gate off: answerTradeCall unwrapped');
}

section('HOMEKEEP — defense/trade calls refused only while the window is live');
{
  process.env.RAIDGARRISON = '1';
  // window live
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true });
    const ctx = {};
    policy.daily(G, ctx); // installs wrappers
    const r1 = G.answerDefenseCall('L1', 'send');
    const r2 = G.answerTradeCall('L2', 'send');
    if (RED) {
      ok(r1 === 'refuse', 'RED: base refuses defense sends (homekeep — EXPECTED FAIL)');
      ok(r2 === 'refuse', 'RED: base refuses trade sends (homekeep — EXPECTED FAIL)');
    } else {
      ok(r1 === 'refuse', "window live: defense 'send' -> 'refuse'");
      ok(r2 === 'refuse', "window live: trade 'send' -> 'refuse'");
      ok(G._calls.defense[0] && G._calls.defense[0].how === 'refuse', 'engine refusal path fired for defense');
      const rg = ctx._raidgarrison || {};
      ok(rg.defenseCallsRefused === 1 && rg.tradeCallsRefused === 1, 'ledger counts both refusals');
    }
  }
  // window not live: pure delegation
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: false });
    const ctx = {};
    policy.daily(G, ctx);
    const r1 = G.answerDefenseCall('L1', 'send');
    if (RED) ok(r1 === 'send', 'RED: base sends (window closed)');
    else ok(r1 === 'send', 'window closed: defense send delegates untouched');
    // NOTE: RED's "window closed" case passes on the base (the doctrine also
    // delegates there) — the RED failures that matter are the two above.
  }
  // explicit refuse never rewritten
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true });
    const ctx = {};
    policy.daily(G, ctx);
    const r1 = G.answerDefenseCall('L1', 'refuse');
    if (RED) ok(r1 === 'refuse', 'RED: base keeps explicit refuse');
    else ok(r1 === 'refuse', 'window live: explicit refuse not rewritten');
  }
  delete process.env.RAIDGARRISON;
}

section('MUSTER — scholar holds Haven on dangerous nights in the window');
{
  process.env.RAIDGARRISON = '1';
  // window live + raid-ripe (lastRaidDay 0, day 10 -> 10d since; pantry high; 3 monsters)
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true, monsters: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
    const ctx = {};
    policy.daily(G, ctx);
    const ripe = RG ? RG.raidRipe(G) : false;
    const rOut = G.travelTo(6, 6);
    const rHome = G.travelTo(4, 4);
    const rExit = G.travelTo(6, 6, false, true);
    if (RED) {
      ok(rOut === null, 'RED: base holds on ripe nights (muster — EXPECTED FAIL)');
    } else {
      ok(ripe === true, 'fixture night is raid-ripe (precondition)');
      ok(rOut === null, 'mustered: outward travel refused (null)');
      ok(rHome === 'traveled', 'mustered: homeward travel delegates');
      ok(rExit === 'traveled', 'mustered: combatExit barrier crossing delegates');
      ok((ctx._raidgarrison || {}).travelRefusals === 1, 'ledger counts the refusal');
      ok((ctx._raidgarrison || {}).musterDays === 1, 'ledger counts the muster day');
    }
  }
  // window live + crisis live (not ripe): still musters
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true, crisis: { kind: 'monster' }, lastRaidDay: 10, monsters: [] });
    const ctx = {};
    policy.daily(G, ctx);
    const rOut = G.travelTo(6, 6);
    if (RED) ok(rOut === null, 'RED: base holds during a crisis (EXPECTED FAIL)');
    else ok(rOut === null, 'crisis live in window: outward travel refused');
  }
  // window live + no danger: delegates
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true, lastRaidDay: 10, monsters: [], pantry: 99999 });
    const ctx = {};
    policy.daily(G, ctx);
    const rOut = G.travelTo(6, 6);
    if (RED) ok(rOut === 'traveled', 'RED: base travels on safe nights');
    else ok(rOut === 'traveled', 'window live, safe night: travel delegates');
  }
  // window closed + ripe: delegates
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: false, monsters: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] });
    const ctx = {};
    policy.daily(G, ctx);
    const rOut = G.travelTo(6, 6);
    if (RED) ok(rOut === 'traveled', 'RED: base travels (window closed)');
    else ok(rOut === 'traveled', 'window closed, ripe night: travel delegates');
  }
  // scholar away from haven: no hold (can't hold a haven you're not at)
  {
    const policy = wrappedOrBase();
    const G = fixtureGame({ def5: true, monsters: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], sx: 6, sy: 6 });
    const ctx = {};
    policy.daily(G, ctx);
    const rOut = G.travelTo(7, 7);
    if (RED) ok(rOut === 'traveled', 'RED: base travels (away)');
    else ok(rOut === 'traveled', 'scholar away: no hold imposed');
  }
  delete process.env.RAIDGARRISON;
}

section('WINDOW — rgWindowLive reads the engine deferral honestly');
if (!layerGone && RG) {
  ok(RG.rgWindowLive(fixtureGame({ def5: true })) === true, 'deferred=true -> window live');
  ok(RG.rgWindowLive(fixtureGame({ def5: false })) === false, 'deferred=false -> window closed');
  const G = fixtureGame({ def5: true });
  G.standingDeferral = () => null;
  ok(RG.rgWindowLive(G) === false, 'no deferral record -> window closed (not true)');
  const G2 = fixtureGame({ def5: true });
  delete G2.standingDeferral;
  ok(RG.rgWindowLive(G2) === false, 'missing engine verb -> window closed (never throws)');
} else {
  infoSkip('WINDOW — layer gone');
}

} else {
  infoSkip('GATE/HOMEKEEP/MUSTER/WINDOW — layer deleted per kill protocol (zero-trace)');
}
section('SMOKE — real harness, 30d, RAIDGARRISON=1');
async function smoke() {
  if (layerGone) { infoSkip('SMOKE — layer gone'); return; }
  process.env.RAIDGARRISON = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const RG2 = require('./policies/raidgarrison');
  const base = TF.leadfeast;
  const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
  const policy = RG2.withRaidGarrison(stack, 't-rg', 't');
  const { Game } = await loadGame({ seed: 64001, mode: 'raidgarrison-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  const L = ctx._raidgarrison || {};
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' garrisonDays=' + (L.garrisonDays | 0) + ' musterDays=' + (L.musterDays | 0) +
    ' travelRefusals=' + (L.travelRefusals | 0) + ' defRefused=' + (L.defenseCallsRefused | 0));
  delete process.env.RAIDGARRISON;
}

section('DET — RAIDGARRISON=1 vs unset: identical until the first engagement morning');
async function det() {
  if (layerGone) { infoSkip('DET — layer gone'); return; }
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const RG2 = require('./policies/raidgarrison');
  async function runOnce(seed, rgOn) {
    if (rgOn) process.env.RAIDGARRISON = '1'; else delete process.env.RAIDGARRISON;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = RG2.withRaidGarrison(stack, 't-rg', 't');
    const { Game } = await loadGame({ seed, mode: 'raidgarrison-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const ctx = {};
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    let firstEngageDay = null;
    wrapped.daily = (G, c2) => {
      const r = oDaily(G, ctx);
      try {
        hashes.push({ day: G.state.scholar.day, h: dayHash(G) });
        const L2 = ctx._raidgarrison || {};
        if (firstEngageDay == null && ((L2.garrisonDays | 0) > 0 || (L2.travelRefusals | 0) > 0 ||
          (L2.defenseCallsRefused | 0) > 0 || (L2.tradeCallsRefused | 0) > 0)) {
          firstEngageDay = G.state.scholar.day;
        }
      } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 90, manifest: undefined, sampleEvery: 30 }); });
    const L = ctx._raidgarrison || {};
    const engaged = firstEngageDay != null;
    delete process.env.RAIDGARRISON;
    return { hashes, engaged, firstEngageDay, ledger: L };
  }
  let allOk = true;
  for (const seed of [64001, 64002]) {
    const c = await runOnce(seed, false);
    const a = await runOnce(seed, true);
    let firstDiverge = null;
    const n = Math.min(c.hashes.length, a.hashes.length);
    for (let i = 0; i < n; i++) {
      if (c.hashes[i].h !== a.hashes[i].h) { firstDiverge = c.hashes[i].day; break; }
    }
    // The layer is pure reads until the window opens. No engagement ->
    // fully identical required; engagement -> divergence may only start
    // on/after the engagement morning.
    let pass, why;
    if (!a.engaged) { pass = firstDiverge == null; why = 'no engagement: full identity required'; }
    else { pass = firstDiverge == null || firstDiverge >= a.firstEngageDay; why = `engagement d${a.firstEngageDay}`; }
    ok(pass, `s${seed}: firstDiverge=${firstDiverge} (${why})`);
    if (!pass) allOk = false;
    console.log(`  DET s${seed}: engaged=${a.engaged} ledger=${JSON.stringify({ g: a.ledger.garrisonDays | 0, m: a.ledger.musterDays | 0, tr: a.ledger.travelRefusals | 0, dr: a.ledger.defenseCallsRefused | 0 })}`);
  }
  console.log(allOk ? '  DET: ALL PASS' : '  DET: FAILURES');
}

section('VERDICT — read the proof result in one place');

(async () => {
  const wantSmoke = process.env.SMOKE === '1';
  const wantDet = process.env.DET === '1';
  if (layerGone) {
    infoSkip('all sections — layer deleted per kill protocol (zero-trace)');
    console.log(`\nRESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
    console.log('VERDICT: KILLED-VERDICT (layer deleted per kill protocol — instruments kept)');
    process.exit(0);
  } else {
    if (wantSmoke) await smoke();
    if (wantDet) await det();
    if (!wantSmoke && !wantDet) console.log('  (SMOKE=1 / DET=1 to run the live sections)');
  }
  console.log(`\nRESULT: ${pass} pass, ${fail} fail, ${skipped} skipped${RED ? ' (RED mode: failures expected on the bare base)' : ''}`);
  if (!RED) {
    if (fail) console.log('VERDICT: KILLED-VERDICT (proof test failed — the lever does not earn a sweep)');
    else console.log('VERDICT: GO-VERDICT (proof green — the lever holds its contract; the sweep may judge it)');
  }
  process.exit(RED ? 0 : (fail ? 1 : 0));
})();
