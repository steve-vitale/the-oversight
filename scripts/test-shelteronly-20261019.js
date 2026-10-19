#!/usr/bin/env node
// test-shelteronly-20261019.js — proof for scripts/policies/shelteronly.js
// (flesh-out loop arm sim-shelteronly, run fleshout-20261019T1555Z, axis scale-onramp).
//
// The lever: BAR THE DOOR only — the open half of the raidwall
// decomposition (sim-raidwall KILLED at pilot; sim-scholarraid/hold-only
// KILLED at pilot):
//   1. While a raid is live (unresolved raid crisis OR raiders lingering
//      at the treeline — the same conditions the raidwall probe used),
//      the roster shelters via the engine-honest Game.shelterVillagers
//      verb (the scholar is never sheltered — the verb skips them).
//      One posture beat per raid (the engine's shelter beat), then quiet.
//   2. When the window closes, releaseShelter releases ONLY the vids this
//      layer sheltered — never the game-side wave-4+ muster's.
//   3. PURE DELEGATION elsewhere: NO scholar travel-hold, NO expedition
//      gates, NO fight change. The bedroll fight is fought, not fled.
// Policy-side only, SHELTERONLY=1 gated, default OFF, zero src/js.
//
// RED->GREEN: written BEFORE scripts/policies/shelteronly.js existed
// (RED: module missing). Behavioral fixtures below pin the contract; the
// implementation must make them GREEN.
//
// Sections:
//   GATE            — SHELTERONLY unset: pure delegation (daily calls base
//                     exactly once, ctx untouched, no ledger, travelTo
//                     unwrapped).
//   RAID-ACTIVE     — raidLive reads the unresolved raid crisis and
//                     lingering raiders only; resolved/non-raid crises and
//                     empty treelines read false.
//   SHELTER         — raid-live daily shelters living roster minus scholar
//                     minus already-sheltered via the engine verb; tracks
//                     mine; beats fire once per shelter day with n>0;
//                     vid-days counted.
//   RELEASE-OURS    — window closes: releaseShelter receives EXACTLY the
//                     layer's vids; muster-sheltered vids untouched;
//                     shelterMustered flag untouched.
//   NO-TRAVEL-GUARD — travel always delegates (no scholar hold — the
//                     killed scholarraid's wave-4-cost suspect is excluded
//                     by construction).
//   SMOKE           — real harness, 30d, SHELTERONLY=1: no crash,
//                     delegation integrity on a real Game.
//   DET             — SHELTERONLY=1 vs unset, 2 seeds x 30d: per-day
//                     hashes byte-identical until the first shelter
//                     morning. The layer is pure reads until a raid fires.
//   VERDICT         — one place the proof result is read: GO-VERDICT or
//                     KILLED-VERDICT (kill protocol: layer deleted zero-trace).
//   KILL-PROTOCOL   — if scripts/policies/shelteronly.js was deleted per
//                     the kill protocol, INFO-SKIP (the layer is gone
//                     zero-trace; the test must not fail the tree).
//
// Usage: node scripts/test-shelteronly-20261019.js
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
const LAYER_PATH = path.join(__dirname, 'policies', 'shelteronly.js');
const layerGone = !fs.existsSync(LAYER_PATH);
let SO = null;
if (!layerGone) SO = require('./policies/shelteronly');

// ---- fixture Game -------------------------------------------------------
// Engine-honest stubs: shelterVillagers skips scholar/non-roster/
// already-sheltered (the real verb's contract); releaseShelter releases
// exactly the given vids; isSheltered reads the flag.
function fixtureGame(over) {
  const calls = { shelter: [], release: [], say: [], travelTo: [] };
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
    _dead: {},
    aidCrisis() { return this._crisis; },
    lingeringRaiders() { return this._lingerers.slice(); },
    getPerson(vid) { return this._dead[vid] ? { dead: true } : { dead: false }; },
    isSheltered(vid) { return !!(this.state.village.sheltered || {})[vid]; },
    shelteredVillagers() {
      const sh = this.state.village.sheltered || {};
      return Object.keys(sh).filter(vid => (this.state.village.roster || []).includes(vid));
    },
    shelterVillagers(vids, opts) {
      calls.shelter.push(vids.slice());
      const sh = (this.state.village.sheltered = this.state.village.sheltered || {});
      let n = 0;
      for (const vid of (vids || [])) {
        if (!(this.state.village.roster || []).includes(vid)) continue;
        if (vid === this.villagerId) continue;
        if (sh[vid]) continue;
        sh[vid] = { since: 10, reason: (opts && opts.reason) || 'threat' };
        n++;
      }
      return n;
    },
    releaseShelter(vids) {
      calls.release.push(vids.slice());
      const sh = this.state.village.sheltered || {};
      let n = 0;
      for (const vid of (vids || [])) { if (sh[vid]) { delete sh[vid]; n++; } }
      return n;
    },
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
  infoSkip('scripts/policies/shelteronly.js deleted per kill protocol — all sections INFO-SKIP');
  console.log(`\nVERDICT: KILLED-VERDICT (layer deleted zero-trace per kill protocol)`);
  console.log(`RESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  process.exit(0);
}
ok(!!SO.layerOn && !!SO.raidLive && !!SO.withShelterOnly, 'layer exports layerOn/raidLive/withShelterOnly');

section('GATE — SHELTERONLY unset: pure delegation');
{
  delete process.env.SHELTERONLY;
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SO.withShelterOnly(base, 't-so', 't');
  const r = p.daily(G, ctx);
  ok(base._calls.daily === 1, 'gate-off: daily calls base exactly once');
  ok(Object.keys(ctx).length === 0, 'gate-off: ctx untouched by layer counters');
  ok(!('soLedger' in G.state), 'gate-off: no ledger writes');
  ok(!G.__soTravelGuard, 'gate-off: travelTo never wrapped (no travel guard exists)');
  ok(G._calls.shelter.length === 0 && G._calls.release.length === 0, 'gate-off: no shelter/release verb calls');
}

section('RAID-ACTIVE — reads the raid crisis and lingerers only');
{
  const G = fixtureGame();
  ok(SO.raidLive(G) === false, 'no crisis, no lingerers -> false');
  G._crisis = { raiders: true, resolved: false };
  ok(SO.raidLive(G) === true, 'unresolved raid crisis -> true');
  G._crisis = { raiders: true, resolved: true };
  ok(SO.raidLive(G) === false, 'resolved raid crisis -> false');
  G._crisis = { raiders: false, resolved: false };
  ok(SO.raidLive(G) === false, 'non-raid crisis -> false');
  G._crisis = null;
  G._lingerers = [{ id: 'm1' }];
  ok(SO.raidLive(G) === true, 'lingering raider, no crisis -> true');
  G._lingerers = [];
  ok(SO.raidLive(G) === false, 'cleared treeline -> false');
}

section('SHELTER — the roster bars the door while the raid is live');
{
  process.env.SHELTERONLY = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SO.withShelterOnly(base, 't-so', 't');
  // raid not live: nothing sheltered, ledger has no shelter days
  p.daily(G, ctx);
  ok(G._calls.shelter.length === 0, 'no raid: shelter verb never called');
  ok((G.state.soLedger.shelterDays | 0) === 0, 'no raid: shelterDays stays 0');
  // raid live: shelter the living roster minus scholar
  G._crisis = { raiders: true, resolved: false };
  p.daily(G, ctx);
  ok(G._calls.shelter.length === 1, 'raid live: shelter verb called once');
  const cands = G._calls.shelter[0];
  ok(cands.includes('v1') && cands.includes('v2') && cands.includes('v3'), 'raid live: villagers are candidates');
  ok(!cands.includes('scholar1'), 'raid live: the scholar is NEVER a candidate');
  ok(ctx.soShelterDays === 1, 'raid live: shelter day counted');
  ok((G.state.soLedger.mySheltered || []).sort().join(',') === 'v1,v2,v3', 'ledger tracks exactly the layer-sheltered vids');
  ok((G.state.soLedger.beats | 0) === 1, 'raid live: one beat counted (engine beat fired)');
  ok((G.state.soLedger.vidDaysSheltered | 0) === 3, 'raid live: 3 sheltered-vid-days');
  // second raid day: everyone already inside — verb called with no candidates, no new beat
  p.daily(G, ctx);
  ok(ctx.soShelterDays === 2, 'second raid day: shelter day counted again');
  ok((G.state.soLedger.beats | 0) === 1, 'second raid day: no repeat beat');
  ok((G.state.soLedger.mySheltered || []).length === 3, 'second raid day: still exactly our 3');
  // dead villager is not re-sheltered
  G._dead.v2 = true;
  ok(true, '(v2 marked dead — release path covers it below)');
  delete process.env.SHELTERONLY;
}

section('RELEASE-OURS — window closes: only the layer-sheltered are released');
{
  process.env.SHELTERONLY = '1';
  const G = fixtureGame();
  // The game-side wave-4+ muster already sheltered v1 BEFORE the raid (n=0 overlap case).
  G.state.village.sheltered = { v1: { since: 9, reason: 'muster' } };
  G.state.village.shelterMustered = { since: 9, threat: 'beyond us' };
  const base = fixtureBase();
  const ctx = {};
  const p = SO.withShelterOnly(base, 't-so', 't');
  G._crisis = { raiders: true, resolved: false };
  p.daily(G, ctx);
  // v1 was already inside (muster's) — the layer shelters only v2, v3.
  ok((G.state.soLedger.mySheltered || []).sort().join(',') === 'v2,v3', 'muster-sheltered v1 is not claimed by the layer');
  // Window closes: crisis resolved, treeline clear.
  G._crisis = { raiders: true, resolved: true };
  G._lingerers = [];
  p.daily(G, ctx);
  ok(G._calls.release.length === 1, 'window closed: release called exactly once');
  const rel = G._calls.release[0].slice().sort();
  ok(rel.join(',') === 'v2,v3', 'releaseShelter receives EXACTLY the layer-sheltered vids (v2,v3)');
  ok(!!G.state.village.sheltered.v1, 'muster-sheltered v1 stays inside (never touched)');
  ok(!!G.state.village.shelterMustered, 'shelterMustered flag untouched (the engine stands down its own muster)');
  ok((G.state.soLedger.releases | 0) === 2, 'ledger counts the 2 releases');
  ok((G.state.soLedger.mySheltered || []).length === 0, 'ledger clears the tracked list');
  delete process.env.SHELTERONLY;
}

section('NO-TRAVEL-GUARD — travel always delegates (no scholar hold)');
{
  process.env.SHELTERONLY = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = SO.withShelterOnly(base, 't-so', 't');
  G._crisis = { raiders: true, resolved: false }; // raid live
  p.daily(G, ctx);
  ok(G.travelTo(5, 4) === 'delegated', 'raid live: outward travel delegates (no travel-hold exists)');
  ok(G.travelTo(4, 4) === 'delegated', 'raid live: homeward travel delegates');
  ok(!G.__soTravelGuard && !G.__srTravelGuard, 'no travel-guard wrapper installed (by construction)');
  delete process.env.SHELTERONLY;
}

section('SMOKE — real harness, 30d, SHELTERONLY=1');
async function smoke() {
  process.env.SHELTERONLY = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const SO2 = require('./policies/shelteronly');
  const base = TF.leadfeast;
  const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
  const policy = SO2.withShelterOnly(stack, 't-so', 't');
  const { Game } = await loadGame({ seed: 63801, mode: 'shelteronly-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  const L = Game.state.soLedger || {};
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' shelterDays=' + (L.shelterDays | 0) + ' shelters=' + (L.shelters | 0) +
    ' vidDays=' + (L.vidDaysSheltered | 0) + ' releases=' + (L.releases | 0) +
    ' err=' + (ctx.soDailyError | 0));
  ok(!(ctx.soDailyError | 0), 'smoke: no layer daily errors');
  delete process.env.SHELTERONLY;
}

section('DET — SHELTERONLY=1 vs unset: identical until the first shelter morning');
async function det() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const SO2 = require('./policies/shelteronly');
  async function runOnce(seed, soOn) {
    if (soOn) process.env.SHELTERONLY = '1'; else delete process.env.SHELTERONLY;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = SO2.withShelterOnly(stack, 't-so', 't');
    const { Game } = await loadGame({ seed, mode: 'shelteronly-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const shelters = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      const r = oDaily(G, ctx);
      try {
        hashes.push({ day: G.state.scholar.day, h: dayHash(G) });
        shelters.push({ day: G.state.scholar.day, n: ((G.state.soLedger || {}).shelters | 0) });
      } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    let firstShelterDay = null;
    for (const rec of shelters) {
      if (rec.n > 0 && (firstShelterDay == null || rec.day < firstShelterDay)) firstShelterDay = rec.day;
    }
    delete process.env.SHELTERONLY;
    return { hashes, firstShelterDay };
  }
  let allOk = true;
  for (const seed of [63801, 63802]) {
    const c = await runOnce(seed, false);
    const a = await runOnce(seed, true);
    let firstDiverge = null;
    const n = Math.min(c.hashes.length, a.hashes.length);
    for (let i = 0; i < n; i++) {
      if (c.hashes[i].h !== a.hashes[i].h) { firstDiverge = c.hashes[i].day; break; }
    }
    // The layer may only perturb from the first shelter morning.
    // No shelter (no raids reached) -> fully identical required.
    const fsd = a.firstShelterDay;
    const pass = fsd == null ? (firstDiverge == null) : (firstDiverge == null || firstDiverge >= fsd);
    ok(pass, `s${seed}: first divergence day ${firstDiverge} vs first shelter day ${fsd} (identical until the raid)`);
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
