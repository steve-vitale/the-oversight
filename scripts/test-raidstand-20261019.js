#!/usr/bin/env node
// test-raidstand-20261019.js — proof for scripts/policies/raidstand.js
// (flesh-out loop arm sim-raidstand, run fleshout-20261019T1815Z, axis scale-onramp).
//
// The lever: THE STAND — the last untested quadrant of the raid
// decomposition (sim-raidwall / sim-scholarraid / sim-shelteronly all
// KILLED at pilot):
//   1. While a raid is live (unresolved raid crisis OR raiders lingering
//      at the treeline — the same conditions the raidwall probe used),
//      combat-capable villagers STAND at the treeline and ENGAGE raiders
//      with engine-honest combat: Game.resolveWildMonsterEncounter(vid, m,
//      {raid: true}) — the engine's own raid fight verb, fought
//      blow-by-blow, never rolled. No stat edits, no re-equipping, no
//      re-drafting the game-side wave-4+ muster (sheltered never
//      candidates). One villager per lingering raider per day, one
//      engagement per fighter per day. One honest posture beat per raid,
//      then quiet.
//   2. NOBODY moves: no sheltering, no scholar travel-hold, no expedition
//      gates, no duty pauses — the village keeps working normally. No
//      travelTo wrapper exists (homeward travel and mid-fight barrier
//      exits always delegate, by construction). The bedroll fight is
//      fought, not fled (pure delegation).
// Policy-side only, RAIDSTAND=1 gated, default OFF, zero src/js.
//
// Sections:
//   GATE            — RAIDSTAND unset: pure delegation (daily calls base
//                     exactly once, ctx untouched, no ledger, travelTo
//                     unwrapped, no fight verb calls).
//   RAID-ACTIVE     — raidLive reads the unresolved raid crisis and
//                     lingering raiders only; resolved/non-raid crises and
//                     empty treelines read false.
//   STAND           — raid-live daily: capable villagers engage lingering
//                     raiders via the engine verb with {raid:true}, one per
//                     raider/day, shielded last; no raid -> nothing moves;
//                     scholar/sheltered/away/unhealthy/unarmed/unarmored
//                     never candidates; one beat per raid.
//   NO-TRAVEL-GUARD — travel always delegates; no shelter/duty changes.
//   SMOKE           — real harness, 30d, RAIDSTAND=1: no crash,
//                     delegation integrity on a real Game.
//   DET             — RAIDSTAND=1 vs unset, 2 seeds x 30d: per-day
//                     hashes byte-identical until the first engagement
//                     morning. The layer is pure reads until then.
//   VERDICT         — one place the proof result is read: GO-VERDICT or
//                     KILLED-VERDICT (kill protocol: layer deleted zero-trace).
//   KILL-PROTOCOL   — if scripts/policies/raidstand.js was deleted per
//                     the kill protocol, INFO-SKIP (the layer is gone
//                     zero-trace; the test must not fail the tree).
//
// Usage: node scripts/test-raidstand-20261019.js
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
const LAYER_PATH = path.join(__dirname, 'policies', 'raidstand.js');
const layerGone = !fs.existsSync(LAYER_PATH);
let RS = null;
if (!layerGone) RS = require('./policies/raidstand');

// ---- fixture Game -------------------------------------------------------
// Engine-honest stubs: lingeringRaiders returns the lingerers; aidCrisis
// returns the crisis; resolveWildMonsterEncounter records (vid, m.id,
// opts) and kills the raider (deterministic, no RNG); combat-capability is
// read from a fixture vp record through the Scattering.equipment stub
// (weapon/armor reads, never writes).
function fixtureGame(over) {
  const calls = { say: [], travelTo: [], fights: [] };
  const ITEMS = [
    { id: 'spear', weapon: { dmg: [4, 9] } },
    { id: 'hide_armor', armor: 8 },
    { id: 'stick' },
  ];
  const G = {
    _calls: calls,
    state: {
      scholar: { day: 10, hp: 100, maxHp: 100, kcal: 500, hydration: 80, dead: false, exiled: false },
      village: {
        roster: ['scholar1', 'v1', 'v2', 'v3', 'v4'],
        px: 4, py: 4, lastRaidDay: 10,
        health: { v1: 90, v2: 90, v3: 30, v4: 90 },
        away: { v4: true },
        sheltered: {},
        shielded: {},
      },
    },
    data: { items: ITEMS },
    map: { px: 4, py: 4 },
    villagerId: 'scholar1',
    over: false,
    _crisis: null,
    _lingerers: [],
    _vp: {
      // v1: armed + armored -> capable. v2: armed, no armor -> NOT capable.
      // v3: armed + armored but health 30 -> NOT capable. v4: armed + armored
      // but away -> NOT capable.
      v1: { dead: false, items: [{ itemId: 'spear' }], armorWorn: true },
      v2: { dead: false, items: [{ itemId: 'spear' }], armorWorn: false },
      v3: { dead: false, items: [{ itemId: 'spear' }], armorWorn: true },
      v4: { dead: false, items: [{ itemId: 'spear' }], armorWorn: true },
    },
    aidCrisis() { return this._crisis; },
    lingeringRaiders() { return this._lingerers.filter(m => (m.hp || 0) > 0); },
    vpOf(vid) { return this._vp[vid] || null; },
    getPerson(vid) { return { name: vid + ' Name', dead: false }; },
    isSheltered(vid) { return !!(this.state.village.sheltered || {})[vid]; },
    resolveWildMonsterEncounter(vid, m, opts) {
      calls.fights.push({ vid, mid: m && m.id, raid: !!(opts && opts.raid) });
      if (m) m.hp = 0; // the stand killed it — deterministic fixture outcome
      return 'fought';
    },
    say(x) { calls.say.push(String(x)); },
    travelTo(x, y) { calls.travelTo.push([x, y]); return 'delegated'; },
  };
  // The equipment readers the layer uses (mirrors standing.js's reads).
  const eqStub = {
    armorOf(vp) { return vp && vp.armorWorn ? 8 : 0; },
    meleeWeaponOf(vp) {
      if (!vp) return null;
      const has = (vp.items || []).some(e => (e.itemId || e.id) === 'spear');
      return has ? { id: 'spear' } : null;
    },
    rangedWeaponOf() { return null; },
  };
  const prev = globalThis.Scattering;
  globalThis.Scattering = Object.assign({}, prev, { equipment: eqStub });
  G._restoreScattering = () => { globalThis.Scattering = prev; };
  if (over) Object.assign(G, over);
  return G;
}
function fixtureBase() {
  const calls = { setup: 0, daily: 0 };
  return {
    _calls: calls,
    setup() { calls.setup++; },
    daily() { calls.daily++; },
  };
}

section('KILL-PROTOCOL — layer presence');
if (layerGone) {
  infoSkip('scripts/policies/raidstand.js deleted per kill protocol — all sections INFO-SKIP');
  console.log(`\nVERDICT: KILLED-VERDICT (layer deleted zero-trace per kill protocol)`);
  console.log(`RESULT: ${pass} pass, ${fail} fail, ${skipped} skipped`);
  process.exit(0);
}
ok(!!RS.layerOn && !!RS.raidLive && !!RS.combatCapable && !!RS.withRaidstand, 'layer exports layerOn/raidLive/combatCapable/withRaidstand');
const G0 = fixtureGame(); G0._restoreScattering();

section('GATE — RAIDSTAND unset: pure delegation');
{
  delete process.env.RAIDSTAND;
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RS.withRaidstand(base, 't-rs', 't');
  p.daily(G, ctx);
  ok(base._calls.daily === 1, 'gate-off: daily calls base exactly once');
  ok(Object.keys(ctx).length === 0, 'gate-off: ctx untouched by layer counters');
  ok(!('rsLedger' in G.state), 'gate-off: no ledger writes');
  ok(G.travelTo(5, 4) === 'delegated', 'gate-off: travelTo delegates');
  ok(G._calls.fights.length === 0, 'gate-off: no fight verb calls');
  ok(G._calls.say.length === 0, 'gate-off: no posture beats');
  G._restoreScattering();
}

section('RAID-ACTIVE — reads the raid crisis and lingerers only');
{
  const G = fixtureGame();
  ok(RS.raidLive(G) === false, 'no crisis, no lingerers -> false');
  G._crisis = { raiders: true, resolved: false };
  ok(RS.raidLive(G) === true, 'unresolved raid crisis -> true');
  G._crisis = { raiders: true, resolved: true };
  ok(RS.raidLive(G) === false, 'resolved raid crisis -> false');
  G._crisis = { raiders: false, resolved: false };
  ok(RS.raidLive(G) === false, 'non-raid crisis -> false');
  G._crisis = null;
  G._lingerers = [{ id: 'm1', hp: 20 }];
  ok(RS.raidLive(G) === true, 'lingering raider, no crisis -> true');
  G._lingerers = [];
  ok(RS.raidLive(G) === false, 'cleared treeline -> false');
  G._restoreScattering();
}

section('STAND — capable villagers engage lingering raiders, nobody else moves');
{
  process.env.RAIDSTAND = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RS.withRaidstand(base, 't-rs', 't');
  // raid not live: nothing moves, no fights, standDays untouched
  p.daily(G, ctx);
  ok(G._calls.fights.length === 0, 'no raid: no fight verb calls');
  ok(!('rsLedger' in G.state), 'no raid: no ledger (the window is closed)');
  // raid live with 2 lingering raiders: only v1 is capable (v2 unarmored,
  // v3 hurt, v4 away) -> 1 engagement, 1 raider still lingering
  G._crisis = { raiders: true, resolved: false };
  G._lingerers = [{ id: 'm1', hp: 20 }, { id: 'm2', hp: 20 }];
  p.daily(G, ctx);
  ok(G._calls.fights.length === 1, 'raid live: exactly one engagement (one capable fighter)');
  ok(G._calls.fights[0].vid === 'v1', 'raid live: v1 (armed+armored) stands');
  ok(G._calls.fights[0].mid === 'm1' && G._calls.fights[0].raid === true, 'raid live: fight is {raid:true} against a lingerer');
  ok(G._lingerers.filter(m => (m.hp || 0) > 0).length === 1, 'raid live: unmet raider stays lingering (the honest gap)');
  ok((G.state.rsLedger.engagements | 0) === 1, 'ledger: 1 engagement counted');
  ok((G.state.rsLedger.vidDaysEngaged | 0) === 1, 'ledger: 1 vid-day engaged');
  ok((G.state.rsLedger.standDays | 0) === 1, 'ledger: 1 stand day');
  ok((G.state.rsLedger.beats | 0) === 1, 'raid live: one posture beat fired');
  ok(G._calls.say.length === 1, 'raid live: exactly one SAY beat (then quiet)');
  ok(/treeline/i.test(G._calls.say[0]) && !/muster/i.test(G._calls.say[0]), 'beat reads as defense, not a muster');
  // second raid day: same raid (lastRaidDay unchanged), one lingerer left,
  // v1 engages again (one per fighter per day), no repeat beat
  p.daily(G, ctx);
  ok(G._calls.fights.length === 2, 'second raid day: v1 engages the remaining raider');
  ok((G.state.rsLedger.beats | 0) === 1, 'second raid day: no repeat beat');
  ok(G._calls.say.length === 1, 'second raid day: still one SAY line (quiet)');
  // shielded sorts last: add a second capable fighter, shielded
  G._vp.v5 = { dead: false, items: [{ itemId: 'spear' }], armorWorn: true };
  G.state.village.roster.push('v5');
  G.state.village.health.v5 = 90;
  G.state.village.shielded.v5 = true;
  G._lingerers = [{ id: 'm3', hp: 20 }, { id: 'm4', hp: 20 }];
  p.daily(G, ctx);
  const day3 = G._calls.fights.slice(2);
  ok(day3.length === 2, 'third raid day: two engagements (v1 + v5)');
  ok(day3[0].vid === 'v1' && day3[1].vid === 'v5', 'shielded v5 stands last');
  // window closes: crisis resolved, treeline clear -> no fights, standDays not counted
  const sd = G.state.rsLedger.standDays | 0;
  G._crisis = { raiders: true, resolved: true };
  G._lingerers = [];
  p.daily(G, ctx);
  ok(G._calls.fights.length === 4, 'window closed: no new engagements');
  ok((G.state.rsLedger.standDays | 0) === sd, 'window closed: standDays not counted');
  // the scholar is never a candidate, even unarmored-everyone
  G._vp.v1.armorWorn = false;
  G._vp.v5.armorWorn = false;
  G._crisis = { raiders: true, resolved: false };
  G._lingerers = [{ id: 'm5', hp: 20 }];
  const f0 = G._calls.fights.length;
  p.daily(G, ctx);
  ok(G._calls.fights.length === f0, 'nobody capable: no engagements (the honest gap, scholar never a candidate)');
  ok((G.state.rsLedger.standDays | 0) === sd + 1, 'nobody capable: the posture day still counts');
  G._restoreScattering();
  delete process.env.RAIDSTAND;
}

section('NO-TRAVEL-GUARD — travel always delegates; no shelter/duty changes');
{
  process.env.RAIDSTAND = '1';
  const G = fixtureGame();
  const base = fixtureBase();
  const ctx = {};
  const p = RS.withRaidstand(base, 't-rs', 't');
  G._crisis = { raiders: true, resolved: false }; // raid live
  G._lingerers = [{ id: 'm1', hp: 20 }];
  p.daily(G, ctx);
  ok(G.travelTo(5, 4) === 'delegated', 'raid live: outward travel delegates (no travel-hold exists)');
  ok(G.travelTo(4, 4) === 'delegated', 'raid live: homeward travel delegates');
  ok(!G.__rsTravelGuard, 'no travel-guard wrapper installed (by construction)');
  ok(typeof G.shelterVillagers === 'undefined', 'no shelter verb touched by the layer');
  ok((G.state.rsLedger.standDays | 0) === 1, 'the stand engaged (sanity: the doctrine ran)');
  G._restoreScattering();
  delete process.env.RAIDSTAND;
}

section('SMOKE — real harness, 30d, RAIDSTAND=1');
async function smoke() {
  process.env.RAIDSTAND = '1';
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const RS2 = require('./policies/raidstand');
  const base = TF.leadfeast;
  const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
  const policy = RS2.withRaidstand(stack, 't-rs', 't');
  const { Game } = await loadGame({ seed: 63901, mode: 'raidstand-smoke', fullTelemetry: false });
  await setupGame(Game);
  const ctx = {};
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 30, manifest: undefined, sampleEvery: 30 }); });
  ok(result && result.gameDays >= 1, 'smoke run completes: gameDays=' + (result && result.gameDays));
  const L = Game.state.rsLedger || {};
  console.log('  SMOKE days=' + result.gameDays + ' end=' + (Game.over ? 'over' : 'alive') +
    ' standDays=' + (L.standDays | 0) + ' engagements=' + (L.engagements | 0) +
    ' vidDays=' + (L.vidDaysEngaged | 0) + ' beats=' + (L.beats | 0) +
    ' err=' + (ctx.rsDailyError | 0));
  ok(!(ctx.rsDailyError | 0), 'smoke: no layer daily errors');
  delete process.env.RAIDSTAND;
}

section('DET — RAIDSTAND=1 vs unset: identical until the first engagement morning');
async function det() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const RS2 = require('./policies/raidstand');
  async function runOnce(seed, rsOn) {
    if (rsOn) process.env.RAIDSTAND = '1'; else delete process.env.RAIDSTAND;
    const base = TF.leadfeast;
    const stack = SD.withSeatDrive(WD.withWinDefer(VR.withVetrel(RP.withReposition(base, 't-rp', 't'), 't-vet', 't'), 't-wd', 't'), 't-sd', 't');
    const policy = RS2.withRaidstand(stack, 't-rs', 't');
    const { Game } = await loadGame({ seed, mode: 'raidstand-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const engaged = [];
    const wrapped = Object.assign({}, policy);
    const oDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      const r = oDaily(G, ctx);
      try {
        hashes.push({ day: G.state.scholar.day, h: dayHash(G) });
        engaged.push({ day: G.state.scholar.day, n: ((G.state.rsLedger || {}).engagements | 0) });
      } catch (e) {}
      return r;
    };
    await quietLog(async () => { await runDays(Game, wrapped, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    let firstEngageDay = null;
    for (const rec of engaged) {
      if (rec.n > 0 && (firstEngageDay == null || rec.day < firstEngageDay)) firstEngageDay = rec.day;
    }
    delete process.env.RAIDSTAND;
    return { hashes, firstEngageDay };
  }
  let allOk = true;
  for (const seed of [63901, 63902]) {
    const c = await runOnce(seed, false);
    const a = await runOnce(seed, true);
    let firstDiverge = null;
    const n = Math.min(c.hashes.length, a.hashes.length);
    for (let i = 0; i < n; i++) {
      if (c.hashes[i].h !== a.hashes[i].h) { firstDiverge = c.hashes[i].day; break; }
    }
    // The layer may only perturb from the first engagement morning.
    // No engagement (no raids reached) -> fully identical required.
    const fed = a.firstEngageDay;
    const pass = fed == null ? (firstDiverge == null) : (firstDiverge == null || firstDiverge >= fed);
    ok(pass, `s${seed}: first divergence day ${firstDiverge} vs first engagement day ${fed} (identical until the stand acts)`);
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
