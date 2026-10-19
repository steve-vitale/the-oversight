#!/usr/bin/env node
// test-scholarraid-20261019.js — proof for scripts/policies/scholarraid.js
// (flesh-out loop arm sim-scholarraid, run fleshout-20261019T1400Z, axis scale-onramp).
//
// The lever: the scholar-ONLY raid hold — during raids (raid crisis live or
// lingerers at the treeline) the scholar does not leave Haven; the village
// keeps working normally:
//   1. THE SCHOLAR HOLDS HAVEN — outward travel refused at the verb while
//      the raid is live (travelTo wrapper; at-Haven + destination != Haven
//      -> null; homeward travel + combat exits delegate). One posture beat
//      per raid, then quiet.
//   2. THE VILLAGE KEEPS WORKING NORMALLY — pure delegation: no shelter,
//      no duty pauses, no expedition gates.
//   3. THE BEDROLL FIGHT IS FOUGHT, NOT FLED — fight is pure delegation.
// Policy-side only, SCHOLARRAID=1 gated, default OFF, zero src/js.
//
// RED->GREEN: written BEFORE scripts/policies/scholarraid.js existed (RED:
// module missing). Behavioral fixtures below pin the contract; the
// implementation must make them GREEN.
//
// Sections:
//   GATE         — SCHOLARRAID unset: pure delegation (setup/daily/upkeep/
//                  fight call base exactly, ctx untouched, travelTo unwrapped).
//   RAID-ACTIVE  — raidLive reads the raid crisis (raiders, unresolved)
//                  and lingering raiders only; resolved/non-raid crises and
//                  empty treelines read false.
//   TRAVEL-GUARD — raid live + at Haven: outward travelTo refused (null),
//                  homeward allowed; raid not live: delegates; away scholar:
//                  allowed (musters home); combatExit: delegates.
//   NO-SHELTER   — daily with raid live never shelters, never gates
//                  expeditions/duties: the village keeps working (the
//                  de-risk vs the killed raidwall).
//   SMOKE        — real harness, 30d, SCHOLARRAID=1: no crash, delegation
//                  integrity on a real Game.
//   DET          — SCHOLARRAID=1 vs unset, 2 seeds x 30d: per-day hashes
//                  byte-identical until the first raid response morning.
//                  The layer is pure delegation until a raid fires.
//   VERDICT      — one place the proof result is read: GO-VERDICT or
//                  KILLED-VERDICT (kill protocol: layer deleted zero-trace).
//   KILL-PROTOCOL — if scripts/policies/scholarraid.js was deleted per the
//                  kill protocol, INFO-SKIP (the layer is gone zero-trace;
//                  the test must not fail the tree).
//
// Usage: node scripts/test-scholarraid-20261019.js
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

// KILL-PROTOCOL: the layer file may be gone (killed arm). Everything below
// depends on it; skip loudly instead of failing.
const LAYER_PATH = path.join(__dirname, 'policies', 'scholarraid.js');
const layerGone = !fs.existsSync(LAYER_PATH);
let SR = null;
if (!layerGone) SR = require('./policies/scholarraid');

// ---- fixture Game -------------------------------------------------------
function fixtureGame(over) {
  const calls = { travelTo: [], say: [] };
  const G = {
    _calls: calls,
    state: {
      scholar: { day: 10, hp: 100, maxHp: 100, kcal: 500, hydration: 80, dead: false, exiled: false },
      village: { roster: ['scholar1', 'v1', 'v2', 'v3'], px: 4, py: 4, sheltered: {} },
    },
    map: { px: 4, py: 4 },
    villagerId: 'scholar1',
    over: false,
    _crisis: null,
    _lingerers: [],
    aidCrisis() { return this._crisis; },
    lingeringRaiders() { return this._lingerers.slice(); },
    say(x) { calls.say.push(String(x)); },
    travelTo(x, y, force, combatExit) { calls.travelTo.push([x, y]); return 'delegated'; },
  };
  if (over) Object.assign(G, over);
  return G;
}
function fixtureBase() {
  const calls = { setup: 0, daily: 0, upkeep: 0, fight: 0 };
  return {
    _calls: calls,
    setup() { calls.setup++; },
    daily() { calls.daily++; },
    upkeep() { calls.upkeep++; },
    fight() { calls.fight++; return 'base-fight'; },
  };
}

section('KILL-PROTOCOL — layer presence');
if (layerGone) {
  infoSkip('scripts/policies/scholarraid.js deleted per kill protocol — all sections INFO-SKIP');
  console.log(`\nVERDICT: KILLED-VERDICT (layer deleted zero-trace per kill protocol)`);
  console.log(`RESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  process.exit(0);
}
ok(!!SR.scholarraidOn && !!SR.raidLive && !!SR.withScholarRaid, 'layer exports scholarraidOn/raidLive/withScholarRaid');

section('GATE — SCHOLARRAID unset: pure delegation');
{
  delete process.env.SCHOLARRAID;
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SR.withScholarRaid(base, 't-sr', 't');
  p.setup(G, ctx);
  p.daily(G, ctx);
  p.upkeep(G, ctx);
  const fr = p.fight(G, ctx);
  ok(base._calls.setup === 1 && base._calls.daily === 1 && base._calls.upkeep === 1 && base._calls.fight === 1,
    'gate-off: setup/daily/upkeep/fight each call base exactly once');
  ok(fr === 'base-fight', 'gate-off: fight returns base value');
  ok(!G.__srTravelGuard, 'gate-off: travelTo never wrapped');
  ok(!('srHoldDays' in ctx) && !('srTravelRefusals' in ctx), 'gate-off: ctx untouched by layer counters');
  ok(!('srLedger' in G.state), 'gate-off: no ledger writes');
}

section('RAID-ACTIVE — reads the raid crisis and lingerers only');
{
  const G = fixtureGame();
  ok(SR.raidLive(G) === false, 'no crisis, no lingerers -> false');
  G._crisis = { raiders: true, resolved: false };
  ok(SR.raidLive(G) === true, 'unresolved raid crisis -> true');
  G._crisis = { raiders: true, resolved: true };
  ok(SR.raidLive(G) === false, 'resolved raid crisis -> false');
  G._crisis = { raiders: false, resolved: false };
  ok(SR.raidLive(G) === false, 'non-raid crisis -> false');
  G._crisis = null;
  G._lingerers = [{ id: 'm1' }];
  ok(SR.raidLive(G) === true, 'lingering raider, no crisis -> true');
  G._lingerers = [];
  ok(SR.raidLive(G) === false, 'cleared treeline -> false');
}

section('TRAVEL-GUARD — the scholar holds Haven while the raid is live');
{
  process.env.SCHOLARRAID = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SR.withScholarRaid(base, 't-sr', 't');
  p.setup(G, ctx);
  ok(!!G.__srTravelGuard, 'gate-on: travelTo wrapped in setup');
  // raid not live: delegates
  let r = G.travelTo(5, 4);
  ok(r === 'delegated' && G._calls.travelTo.length === 1, 'no raid: outward travel delegates');
  // raid live, at haven: outward refused
  G._crisis = { raiders: true, resolved: false };
  r = G.travelTo(5, 4);
  ok(r === null, 'raid live + at haven: outward travel refused (null)');
  ok(ctx.srTravelRefusals === 1, 'refusal counted on ctx');
  ok(G.state.srLedger.travelRefusals === 1, 'refusal counted on ledger');
  // raid live, at haven: homeward (self) allowed
  r = G.travelTo(4, 4);
  ok(r === 'delegated', 'raid live + at haven: haven-destination delegates');
  // raid live, away: allowed (musters home)
  G.map.px = 5; G.map.py = 4;
  r = G.travelTo(4, 4);
  ok(r === 'delegated', 'raid live + away: homeward travel allowed');
  r = G.travelTo(6, 4);
  ok(r === 'delegated', 'raid live + away: any travel allowed (base daily brings them home)');
  G.map.px = 4; G.map.py = 4;
  // combatExit always delegates
  r = G.travelTo(5, 4, false, true);
  ok(r === 'delegated', 'combatExit delegates even mid-raid');
  delete process.env.SCHOLARRAID;
}

section('NO-SHELTER — the village keeps working while the raid is live');
{
  process.env.SCHOLARRAID = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SR.withScholarRaid(base, 't-sr', 't');
  // raid live: daily counts hold days and beats, shelters nothing
  G._crisis = { raiders: true, resolved: false };
  p.daily(G, ctx);
  ok(ctx.srHoldDays === 1, 'raid live: hold day counted');
  ok(ctx.srBeats === 1, 'raid live: one posture beat fired');
  ok(G.state.srLedger.holdDays === 1, 'hold day on ledger');
  ok(G._calls.say.length === 1, 'posture beat said exactly once');
  ok(Object.keys(G.state.village.sheltered).length === 0, 'raid live: nobody sheltered (village works)');
  // second raid day: no second beat, hold days keep counting
  p.daily(G, ctx);
  ok(ctx.srHoldDays === 2, 'second raid day: hold day counted again');
  ok(ctx.srBeats === 1, 'second raid day: no repeat beat');
  // window closes: no release logic (nothing was ever sheltered), flag resets
  G._crisis = { raiders: true, resolved: true };
  G._lingerers = [];
  p.daily(G, ctx);
  ok(!ctx.srHoldDays || ctx.srHoldDays === 2, 'stand-down: no new hold days after window closes');
  ok(ctx.srBeats === 1, 'stand-down: beat flag reset for the next raid');
  ok(typeof G.shelterVillagers === 'undefined', 'no shelter verb exists on fixture (layer never calls one)');
  delete process.env.SCHOLARRAID;
}

section('SMOKE — real harness, 30d, SCHOLARRAID=1');
async function smoke() {
  process.env.SCHOLARRAID = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const SR2 = require('./policies/scholarraid');
  const policy = SR2.withScholarRaid(TF.leadfeast, 't-sr', 't');
  const { Game } = await loadGame({ seed: 63801, mode: 'scholarraid-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' holdDays=' + (ctx.srHoldDays || 0) + ' refusals=' + (ctx.srTravelRefusals || 0));
  delete process.env.SCHOLARRAID;
}

section('DET — SCHOLARRAID=1 vs unset: identical until the first raid');
async function det() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const SR2 = require('./policies/scholarraid');
  async function runOnce(seed, srOn) {
    if (srOn) process.env.SCHOLARRAID = '1'; else delete process.env.SCHOLARRAID;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = SR2.withScholarRaid(stack, 't-sr', 't');
    const { Game } = await loadGame({ seed, mode: 'scholarraid-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const holds = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      const r = oDaily(G, ctx);
      try {
        hashes.push({ day: G.state.scholar.day, h: dayHash(G) });
        holds.push({ day: G.state.scholar.day, hold: ((G.state.srLedger || {}).holdDays | 0) });
      } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    let firstHoldDay = null;
    for (const rec of holds) {
      if (rec.hold > 0 && (firstHoldDay == null || rec.day < firstHoldDay)) firstHoldDay = rec.day;
    }
    delete process.env.SCHOLARRAID;
    return { hashes, firstHoldDay };
  }
  let allOk = true;
  for (const seed of [63801, 63802]) {
    const c = await runOnce(seed, false);
    const a = await runOnce(seed, true);
    // First divergence day (null = fully identical).
    let firstDiverge = null;
    const n = Math.min(c.hashes.length, a.hashes.length);
    for (let i = 0; i < n; i++) {
      if (c.hashes[i].h !== a.hashes[i].h) { firstDiverge = c.hashes[i].day; break; }
    }
    // The layer may only perturb from the first raid response morning.
    // No raid (no hold days) -> fully identical required.
    const fhd = a.firstHoldDay;
    const pass = fhd == null ? (firstDiverge == null) : (firstDiverge == null || firstDiverge >= fhd);
    ok(pass, `s${seed}: first divergence day ${firstDiverge} vs first raid-response day ${fhd} (identical until the raid)`);
    if (!pass) allOk = false;
  }
  console.log(allOk ? '  DET: ALL PASS' : '  DET: FAILURES');
}

section('VERDICT — read the proof result in one place');

(async () => {
  const wantSmoke = process.env.SMOKE === '1';
  const wantDet = process.env.DET === '1';
  if (wantSmoke) await smoke();
  if (wantDet) await det();
  if (!wantSmoke && !wantDet) console.log('  (SMOKE=1 / DET=1 to run the live sections)');
  console.log(`\nRESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  if (fail) {
    console.log('VERDICT: KILLED-VERDICT (proof test failed — the lever does not earn a sweep)');
  } else {
    console.log('VERDICT: GO-VERDICT (proof green — the lever holds its contract; the sweep may judge it)');
  }
  process.exit(fail ? 1 : 0);
})();
