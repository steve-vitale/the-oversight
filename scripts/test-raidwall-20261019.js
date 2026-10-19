#!/usr/bin/env node
// test-raidwall-20261019.js — proof for scripts/policies/raidwall.js
// (flesh-out loop arm sim-raidwall, run fleshout-20261019T07xxZ, axis scale-onramp).
//
// The lever: the hold-Haven raid doctrine — during raids (raid crisis live
// or lingerers at the treeline) nobody sallies and no aid parties leave
// Haven; defense is static/positional:
//   1. HOLD HAVEN — outward travel refused at the verb while the raid is
//      live (travelTo wrapper; homeward travel + combat exits delegate).
//   2. BAR THE DOOR — the roster shelters (engine-honest verb); released
//      when the window closes (only the vids this layer sheltered).
//   3. THE BEDROLL FIGHT IS FOUGHT, NOT FLED — fight is pure delegation.
// Policy-side only, RAIDWALL=1 gated, default OFF, zero src/js.
//
// RED->GREEN: written BEFORE scripts/policies/raidwall.js existed (RED:
// module missing). Behavioral fixtures below pin the contract; the
// implementation must make them GREEN.
//
// Sections:
//   GATE         — RAIDWALL unset: pure delegation (setup/daily/upkeep/fight
//                  call base exactly, ctx untouched, travelTo unwrapped).
//   RAID-ACTIVE  — raidActive reads the raid crisis (raiders, unresolved)
//                  and lingering raiders only; resolved/non-raid crises and
//                  empty treelines read false.
//   TRAVEL-GUARD — raid live + at Haven: outward travelTo refused (null),
//                  homeward allowed; raid not live: delegates; away scholar:
//                  allowed (musters home); combatExit: delegates.
//   SHELTER      — daily with raid live shelters the roster (scholar never),
//                  tracks vids; window close releases only tracked vids;
//                  already-sheltered (game-side muster) vids untouched.
//   SMOKE        — real harness, 30d, RAIDWALL=1: no crash, delegation
//                  integrity on a real Game.
//   DET          — RAIDWALL=1 vs unset, 2 seeds x 30d: per-day hashes
//                  byte-identical until the first raid response morning.
//                  The layer is pure delegation until a raid fires.
//   KILL-PROTOCOL — if scripts/policies/raidwall.js was deleted per the
//                  kill protocol, INFO-SKIP (the layer is gone zero-trace;
//                  the test must not fail the tree).
//
// Usage: node scripts/test-raidwall-20261019.js
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
const LAYER_PATH = path.join(__dirname, 'policies', 'raidwall.js');
const layerGone = !fs.existsSync(LAYER_PATH);
let RW = null;
if (!layerGone) RW = require('./policies/raidwall');

// ---- fixture Game -------------------------------------------------------
function fixtureGame(over) {
  const calls = { travelTo: [], sheltered: [], released: [] };
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
    shelteredVillagers() {
      const sh = (this.state.village || {}).sheltered || {};
      return Object.keys(sh).filter(k => sh[k]);
    },
    shelterVillagers(vids, opts) {
      const sh = (this.state.village.sheltered = this.state.village.sheltered || {});
      let n = 0;
      for (const vid of (vids || [])) {
        if (vid === this.villagerId) continue;
        if (!(this.state.village.roster || []).includes(vid)) continue;
        if (sh[vid]) continue;
        sh[vid] = true; n++;
        calls.sheltered.push(vid);
      }
      return n;
    },
    releaseShelter(vids) {
      const sh = (this.state.village || {}).sheltered || {};
      const list = vids || Object.keys(sh);
      let n = 0;
      for (const vid of list) { if (sh[vid]) { delete sh[vid]; n++; calls.released.push(vid); } }
      return n;
    },
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
  infoSkip('scripts/policies/raidwall.js deleted per kill protocol — all sections INFO-SKIP');
  console.log(`\nRESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  process.exit(0);
}
ok(!!RW.layerOn && !!RW.raidActive && !!RW.withRaidwall, 'layer exports layerOn/raidActive/withRaidwall');

section('GATE — RAIDWALL unset: pure delegation');
{
  delete process.env.RAIDWALL;
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RW.withRaidwall(base, 't-rw', 't');
  p.setup(G, ctx);
  p.daily(G, ctx);
  p.upkeep(G, ctx);
  const fr = p.fight(G, ctx);
  ok(base._calls.setup === 1 && base._calls.daily === 1 && base._calls.upkeep === 1 && base._calls.fight === 1,
    'gate-off: setup/daily/upkeep/fight each call base exactly once');
  ok(fr === 'base-fight', 'gate-off: fight returns base value');
  ok(!G.__rwTravelGuard, 'gate-off: travelTo never wrapped');
  ok(!('rwHoldDays' in ctx) && !('rwTravelRefusals' in ctx), 'gate-off: ctx untouched by layer counters');
  ok(!(G.state.rwLedger && G.state.rwLedger.holdDays), 'gate-off: no ledger writes');
}

section('RAID-ACTIVE — reads the raid crisis and lingerers only');
{
  const G = fixtureGame();
  ok(RW.raidActive(G) === false, 'no crisis, no lingerers -> false');
  G._crisis = { raiders: true, resolved: false };
  ok(RW.raidActive(G) === true, 'unresolved raid crisis -> true');
  G._crisis = { raiders: true, resolved: true };
  ok(RW.raidActive(G) === false, 'resolved raid crisis -> false');
  G._crisis = { raiders: false, resolved: false };
  ok(RW.raidActive(G) === false, 'non-raid crisis -> false');
  G._crisis = null;
  G._lingerers = [{ id: 'm1' }];
  ok(RW.raidActive(G) === true, 'lingering raider, no crisis -> true');
  G._lingerers = [];
  ok(RW.raidActive(G) === false, 'cleared treeline -> false');
}

section('TRAVEL-GUARD — hold Haven while the raid is live');
{
  process.env.RAIDWALL = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RW.withRaidwall(base, 't-rw', 't');
  p.setup(G, ctx);
  ok(!!G.__rwTravelGuard, 'gate-on: travelTo wrapped in setup');
  // raid not live: delegates
  let r = G.travelTo(5, 4);
  ok(r === 'delegated' && G._calls.travelTo.length === 1, 'no raid: outward travel delegates');
  // raid live, at haven: outward refused
  G._crisis = { raiders: true, resolved: false };
  r = G.travelTo(5, 4);
  ok(r === null, 'raid live + at haven: outward travel refused (null)');
  ok(ctx.rwTravelRefusals === 1, 'refusal counted on ctx');
  ok(G.state.rwLedger.travelRefusals === 1, 'refusal counted on ledger');
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
  delete process.env.RAIDWALL;
}

section('SHELTER — bar the door on the raid, stand down after');
{
  process.env.RAIDWALL = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RW.withRaidwall(base, 't-rw', 't');
  // no raid: no shelter
  p.daily(G, ctx);
  ok(G.shelteredVillagers().length === 0, 'no raid: nobody sheltered');
  ok(!ctx._rwSheltered, 'no raid: shelter flag unset');
  // raid live: shelter the roster (scholar never)
  G._crisis = { raiders: true, resolved: false };
  p.daily(G, ctx);
  const sh = G.shelteredVillagers().sort();
  ok(JSON.stringify(sh) === JSON.stringify(['v1', 'v2', 'v3']), 'raid live: roster sheltered, scholar excluded (got ' + sh + ')');
  ok(ctx._rwSheltered === true, 'shelter flag set');
  ok(ctx.rwHoldDays === 1, 'hold day counted');
  ok(G.state.rwLedger.holdDays === 1, 'hold day on ledger');
  ok(G.state.rwLedger.shelters.length === 1 && G.state.rwLedger.shelters[0].n === 3, 'shelter recorded on ledger');
  // second raid day: idempotent (no double-shelter)
  p.daily(G, ctx);
  ok(G._calls.sheltered.length === 3, 'second raid day: no re-shelter of the sheltered');
  // game-side muster sheltered v9 independently: untouched by stand-down
  G.state.village.sheltered['v9'] = true;
  // window closes: release only the tracked vids
  G._crisis = { raiders: true, resolved: true };
  G._lingerers = [];
  p.daily(G, ctx);
  ok(ctx._rwSheltered === false, 'stand-down: flag cleared');
  ok(G.shelteredVillagers().length === 1 && G.shelteredVillagers()[0] === 'v9',
    'stand-down: only layer-sheltered released; game-side muster v9 untouched');
  ok(G.state.rwLedger.releases.length === 1, 'release recorded on ledger');
  delete process.env.RAIDWALL;
}

section('SMOKE — real harness, 30d, RAIDWALL=1');
async function smoke() {
  process.env.RAIDWALL = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RW2 = require('./policies/raidwall');
  const policy = RW2.withRaidwall(TF.leadfeast, 't-rw', 't');
  const { Game } = await loadGame({ seed: 63801, mode: 'raidwall-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' holdDays=' + (ctx.rwHoldDays || 0) + ' refusals=' + (ctx.rwTravelRefusals || 0));
  delete process.env.RAIDWALL;
}

section('DET — RAIDWALL=1 vs unset: identical until the first raid');
async function det() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const RW2 = require('./policies/raidwall');
  async function runOnce(seed, rwOn) {
    if (rwOn) process.env.RAIDWALL = '1'; else delete process.env.RAIDWALL;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = RW2.withRaidwall(stack, 't-rw', 't');
    const { Game } = await loadGame({ seed, mode: 'raidwall-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      const r = oDaily(G, ctx);
      try { hashes.push({ day: G.state.scholar.day, h: dayHash(G) }); } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    const firstShelterDay = (() => {
      try {
        const sh = (Game.state.rwLedger || {}).shelters || [];
        return sh.length ? sh[0].day : null;
      } catch (e) { return null; }
    })();
    delete process.env.RAIDWALL;
    return { hashes, firstShelterDay };
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
    // No raid (no shelter) -> fully identical required.
    const fsd = a.firstShelterDay;
    const pass = fsd == null ? (firstDiverge == null) : (firstDiverge == null || firstDiverge >= fsd);
    ok(pass, `s${seed}: first divergence day ${firstDiverge} vs first raid-response day ${fsd} (identical until the raid)`);
    if (!pass) allOk = false;
  }
  console.log(allOk ? '  DET: ALL PASS' : '  DET: FAILURES');
}


(async () => {
  const wantSmoke = process.env.SMOKE === '1';
  const wantDet = process.env.DET === '1';
  if (wantSmoke) await smoke();
  if (wantDet) await det();
  if (!wantSmoke && !wantDet) console.log('  (SMOKE=1 / DET=1 to run the live sections)');
  console.log(`\nRESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  process.exit(fail ? 1 : 0);
})();
