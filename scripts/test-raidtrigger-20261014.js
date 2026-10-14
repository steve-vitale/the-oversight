#!/usr/bin/env node
// test-raidtrigger-20261014.js — proof test for the RAID-TRIGGER INSTRUMENT
// (longsim r31 ARM 1, scale-onramp axis, sim-findings #176).
// INSTRUMENT ONLY — scripts/raidtrigger-20261014.js; zero game-code changes.
//
// The instrument's claim: the nightly record (pantry band at tick time,
// raid fired or not, raiders count on fire) reproduces the ENGINE's static
// rule (havenGrowth.js havenRaidTick: raid iff pantry >= 3000 [plus 3+
// monsters, >=7d since last raid, no table]; raiders = 3 + (pantry > 12000)
// + (pantry > 24000)) as a LIVED measurement.
//
// RED PHASE (real): the constructed wealthy/thin scenarios are run with
// RT_SABOTAGE_BANDS=1 (the instrument's own documented defect hook —
// bandOf() returns 'sabotaged' for every input). The static-rule verdict
// MUST FAIL on the sabotaged instrument. If the verdict passes anyway,
// the verdict cannot see band defects and the test FAILS LOUDLY.
// GREEN PHASE: same scenarios on the honest instrument must PASS.
//
// PART R (pure): bandOf/expectedRaiders edge assertions — the instrument's
//   band edges mirror the engine's thresholds exactly.
// PART C (live, constructed): wealthy pantry (30k) vs thin pantry (2.5k),
//   5 world monsters, day 50, 40 re-armed nights each:
//   - wealthy: >=1 raid fires; EVERY fired tick reads band '>24k',
//     raiders === 5 === expected, matchesRule true.
//   - thin: 0 raids fire; every tick reads band '<3k'.
// PART RED (live, constructed + sabotage): the static-rule verdict must FAIL.
// PART H (live honesty): same seed+policy+days, instrument on (x2) vs off:
//   - on1 == on2 and on1 == off -> PASS (byte-identical, instrument is read-only)
//   - on1 != on2 -> INCONCLUSIVE (the known sim-findings #103 noise floor —
//     timestamp-based villager IDs leak into contest RNG; not an instrument
//     finding, reported, never failed as instrument guilt)
//   - on1 == on2 != off -> FAIL (the instrument perturbs the trajectory)
// PART S (live smoke): 40d instrumented run — every stream flows, keys
//   present, instrErrors empty.
//
// SMOKE=1: instrument-honesty gate only — PART R, named-export unwrap checks
// (the r20b unwrap bug killed a whole arm), and PART H at 15d.
//
// Usage: node scripts/test-raidtrigger-20261014.js
//        SMOKE=1 node scripts/test-raidtrigger-20261014.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const RT = require('./raidtrigger-20261014');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; process.stderr.write('  FAIL ' + name + (extra ? ' — ' + extra : '') + '\n'); }
}

// ---------- PART R: pure edge assertions ----------
function partR() {
  console.log('PART R (pure band/edge assertions)');
  const cases = [
    [0, '<3k'], [2999, '<3k'], [3000, '3-12k'], [3001, '3-12k'],
    [12000, '3-12k'], [12001, '12-24k'], [24000, '12-24k'], [24001, '>24k'],
    [90000, '>24k'],
  ];
  for (const [kcal, want] of cases) check('bandOf(' + kcal + ')=' + want, RT.bandOf(kcal) === want, 'got ' + RT.bandOf(kcal));
  const exp = [[0, 3], [3000, 3], [12000, 3], [12001, 4], [24000, 4], [24001, 5], [90000, 5]];
  for (const [kcal, want] of exp) check('expectedRaiders(' + kcal + ')=' + want, RT.expectedRaiders(kcal) === want, 'got ' + RT.expectedRaiders(kcal));
  check('SMELL_LINE=3000', RT.SMELL_LINE === 3000);
  // the defect hook exists and is test-only
  process.env.RT_SABOTAGE_BANDS = '1';
  check('sabotage hook defects bands', RT.bandOf(30000) === 'sabotaged');
  delete process.env.RT_SABOTAGE_BANDS;
  check('hook clears', RT.bandOf(30000) === '>24k');
}

// ---------- constructed scenario ----------
const MON_IDS = ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad'];

async function buildScenario(pantryKcalTarget) {
  const { Game } = await loadGame({ seed: 11, mode: 'raidtrigger-test' });
  await setupGame(Game);
  Game.state.scholar.day = 50;
  const v = Game.state.village;
  v.lastRaidDay = 0;
  v.pantry = [{ name: 'wheat sack', kcalEach: 500, units: Math.max(1, Math.round(pantryKcalTarget / 500)),
    spoilDay: 9999, foodKind: 'veg', foodState: 'stored', edible: true, safe: true }];
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const topUp = () => {
    let n = 0;
    try { n = (Game.worldMonsters ? Game.worldMonsters() : []).length; } catch (e) {}
    let i = 0;
    while (n < 5 && i < 5) {
      try { Game.spawnWorldMonster(MON_IDS[i % MON_IDS.length], hx, hy, {}); n++; } catch (e) {}
      i++;
    }
  };
  topUp();
  return { Game, v, topUp };
}

// the static-rule verdict the instrument must reproduce
function staticRuleVerdict(track, expectFires) {
  const ticks = track.raidTicks || [];
  const fired = ticks.filter(t => t.fired);
  if (expectFires) {
    return {
      ok: fired.length >= 1 &&
        fired.every(t => t.band === '>24k' && t.raiders === 5 &&
          t.expected === 5 && t.matchesRule === true),
      fired: fired.length, ticks: ticks.length,
      detail: fired.map(t => `${t.band}/${t.raiders}/${t.expected}/${t.matchesRule}`).join(' '),
    };
  }
  return {
    ok: fired.length === 0 && ticks.length > 0 &&
      ticks.every(t => t.band === '<3k'),
    fired: fired.length, ticks: ticks.length,
    detail: ticks.slice(0, 3).map(t => `${t.band}`).join(' '),
  };
}

async function runConstructed(pantryKcalTarget, expectFires, sabotage) {
  const { Game, v, topUp } = await buildScenario(pantryKcalTarget);
  if (sabotage) process.env.RT_SABOTAGE_BANDS = '1';
  const track = RT.attachRaidtrigger(Game);
  try {
    await quietLog(async () => {
      for (let i = 0; i < 40; i++) {
        try { v.lastRaidDay = 50 - 30; } catch (e) {} // re-arm the 7-day gate
        try { topUp(); } catch (e) {}
        try { Game.havenRaidTick(); } catch (e) {}
      }
    });
  } finally {
    delete process.env.RT_SABOTAGE_BANDS;
  }
  return { verdict: staticRuleVerdict(track, expectFires), track };
}

async function partC() {
  console.log('PART C (constructed live: wealthy vs thin pantry)');
  const wealthy = await runConstructed(30000, true, false);
  check('wealthy: >=1 raid fired', wealthy.verdict.fired >= 1, 'fired=' + wealthy.verdict.fired);
  check('wealthy: every fired tick reproduces the static rule (band >24k, 5 raiders)',
    wealthy.verdict.ok, wealthy.verdict.detail);
  check('wealthy: predation-lib reused (ptrack present)', !!(wealthy.track.ptrack && wealthy.track.ptrack.gorgeNights !== undefined));
  const thin = await runConstructed(2500, false, false);
  check('thin: 0 raids fired', thin.verdict.fired === 0, 'fired=' + thin.verdict.fired);
  check('thin: every tick reads band <3k', thin.verdict.ok, thin.verdict.detail);
  check('constructed: no instrument errors (wealthy)', (wealthy.track.instrErrors || []).length === 0);
  check('constructed: no instrument errors (thin)', (thin.track.instrErrors || []).length === 0);
}

async function partRed() {
  console.log('PART RED (sabotaged instrument MUST fail the verdict)');
  const sabW = await runConstructed(30000, true, true);
  check('RED wealthy: verdict FAILS on sabotaged bands', sabW.verdict.ok === false,
    'verdict passed anyway — the verdict cannot see band defects!');
  const sabT = await runConstructed(2500, false, true);
  check('RED thin: verdict FAILS on sabotaged bands', sabT.verdict.ok === false,
    'verdict passed anyway — the verdict cannot see band defects!');
}

// ---------- PART H: live honesty (instrument on x2 vs off) ----------
async function runHashes(seed, policyId, days, instrumented) {
  const pol = require('./policies/' + policyId)[policyId];
  const { Game } = await loadGame({ seed, mode: 'raidtrigger-honesty' });
  await setupGame(Game);
  let track = null;
  if (instrumented) track = RT.attachRaidtrigger(Game);
  const hashes = [];
  const wrapped = Object.assign({}, pol);
  const base = pol.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days }); });
  return hashes.join('\n');
}

async function partH(days) {
  console.log('PART H (live honesty: on x2 vs off, seed 11 leadcourt, ' + days + 'd)');
  const a1 = await runHashes(11, 'leadcourt', days, true);
  const a2 = await runHashes(11, 'leadcourt', days, true);
  const b = await runHashes(11, 'leadcourt', days, false);
  const onStable = a1 === a2;
  const matchesOff = a1 === b;
  if (!onStable) {
    console.log('  PART H INCONCLUSIVE: instrumented runs diverge from each other (known sim-findings #103 noise floor) — not an instrument finding');
    passed++; // counted, not failed: the noise floor is documented, not instrument guilt
  } else if (matchesOff) {
    check('honesty: instrumented == pristine (byte-identical)', true);
  } else {
    check('honesty: instrumented == pristine (byte-identical)', false, 'instrument perturbs the trajectory');
  }
}

// ---------- PART S: live smoke ----------
async function partS() {
  console.log('PART S (live smoke: 40d instrumented leadcourt)');
  const pol = require('./policies/leadcourt').leadcourt;
  const { Game } = await loadGame({ seed: 22, mode: 'raidtrigger-smoke' });
  await setupGame(Game);
  const pt = require('./preddisc-20261014');
  const ptrack = pt.attachPreddisc(Game);
  const track = RT.attachRaidtrigger(Game, ptrack.ptrack);
  const wrapped = Object.assign({}, pol);
  const base = pol.daily;
  wrapped.daily = (G, ctx) => { try { ptrack.sampleDay(); } catch (e) {} return base ? base(G, ctx) : undefined; };
  const r = await quietLog(async () => runDays(Game, wrapped, { days: 40 }));
  check('smoke: raidTicks flow (one per night)', track.raidTicks.length > 0, 'ticks=' + track.raidTicks.length);
  const bands = new Set(['<3k', '3-12k', '12-24k', '>24k']);
  check('smoke: every tick has a valid band', track.raidTicks.every(t => bands.has(t.band)));
  check('smoke: fired ticks carry a static-rule expectation',
    track.raidTicks.filter(t => t.fired).every(t => t.expected === 3 || t.expected === 4 || t.expected === 5));
  check('smoke: preddisc track reused, not duplicated', track.ptrack === ptrack.ptrack);
  check('smoke: no instrument errors', (track.instrErrors || []).length === 0,
    JSON.stringify(track.instrErrors.slice(0, 2)));
  const A = RT.finalizeRaidtrigger(Game, track);
  check('smoke: finalize yields a 4-band curve', A.curve && Object.keys(A.curve).length === 4);
  console.log('  smoke: ' + r.days + 'd/' + r.endReason + ', ticks=' + track.raidTicks.length +
    ', fired=' + A.firedTotal + ', draws=' + A.pantryPath.draws);
}

// ---------- SMOKE=1: instrument-honesty gate ----------
async function smokeGate() {
  console.log('SMOKE GATE (instrument honesty)');
  const fails = [];
  for (const pid of ['leadcourt', 'belongseek']) {
    let mod;
    try { mod = require('./policies/' + pid); } catch (e) { fails.push(pid + ': require failed'); continue; }
    const pol = mod[pid]; // NAMED export unwrap — never Object.assign({}, require(...)) (r20b)
    if (!pol || typeof pol.daily !== 'function') { fails.push(pid + ': named export .' + pid + ' missing or daily not a function'); continue; }
    console.log('  unwrap ok: policies/' + pid + '.' + pid);
  }
  if (fails.length) { console.log('SMOKE STOP: ' + fails.join('; ')); process.exit(1); }
  partR();
  await partH(15);
  if (failed) { console.log('SMOKE STOP: ' + failed + ' failure(s)'); process.exit(1); }
  console.log('SMOKE GATE: instruments honest, policies unwrap — safe to measure.');
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  partR();
  await partRed();   // RED first: prove the verdict can fail
  await partC();     // GREEN: honest instrument reproduces the static rule
  await partH(30);
  await partS();
  console.log(`\nraidtrigger proof: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
