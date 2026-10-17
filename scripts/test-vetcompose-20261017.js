#!/usr/bin/env node
// test-vetcompose-20261017.js — proof for the sim-vetcompose composition
// (evidence/2026-10-17/sim-vetcompose.md; the wave-4 census's named next).
//
// The composition under test: withVetrel over the seatdrive-composed
// leadseat/belongseat (scripts/vetcompose-lib-20261017.js — the same module
// the sweep requires, so composition and instrument cannot drift).
//
// Checks:
//   C1 (wiring): the wrapper carries the composition id and delegates
//       daily/fight to the wrapped base when the gate is off.
//   C2 (SMOKE): layer markers honest both sides on the real harness
//       (VETREL live only armed, seatdrive live both sides), runs complete,
//       per-seed schema clean.
//   C3 (det-gate): control (wrapped, VETREL unset) byte-identical to the
//       naked seatdrive stack — 60d x 2 seeds x 2 policies.
//   C4 (det-gate): gate-on deterministic (armed 60d twice byte-identical).
//   C5 (instrument neutrality): the sweep's own instrument (makeInstrument,
//       the shared lib) doesn't perturb trajectories — bare vs instrumented
//       60d byte-identical, 2 seeds x 2 policies.
//   C6 (non-vacuity, real harness): on the full win-side substrate, the
//       composition actually drives the vetrel layer (vetHunts > 0 on a
//       180d armed run) while the control side shows zero vetrel activity.
// RED->GREEN: C1's delegation checks fail on a wrapper that preempts or
// perturbs (the composition's only real risk); C3 would fail on any
// gate-off ctx pollution. Written to catch the failure, not to pass.
'use strict';
const LIB = require('./vetcompose-lib-20261017');
const { SEEDS, SD, VR, policyFor, nakedFor, makeInstrument } = LIB;

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- substrate assertion (same as the sweep) ---
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.ALLOWGATE2 === '1') {
  console.error('PROOF STOP: ALLOWGATE2=1 set — substrate moved; STOP.'); process.exit(2);
}

// ---------- C1: wiring (fabricated state) ----------
{
  delete process.env.VETREL;
  for (const pid of ['leadseat', 'belongseat']) {
    const wrapped = policyFor(pid);
    const naked = nakedFor(pid);
    check(`C1a ${pid}: composition id set`, wrapped.id === pid + '-vetcomp', wrapped.id);
    check(`C1b ${pid}: wrapper differs from naked object`, wrapped !== naked);
    check(`C1c ${pid}: gate-off VETREL not live`, VR.vetrelOn() === false);
    // Gate-off daily delegates to base.daily exactly once and returns its value.
    let calls = 0;
    const fakeBase = { daily: (G, ctx) => { calls++; return 'base-daily-ret'; }, fight: (G, ctx) => { calls++; return 'base-fight-ret'; } };
    const w = VR.withVetrel(fakeBase, 'test-w', 'test');
    const ctx = {};
    const dr = w.daily({}, ctx);
    check('C1d gate-off daily pure delegation', calls === 1 && dr === 'base-daily-ret', `calls=${calls} ret=${dr}`);
    const fr = w.fight({}, ctx);
    check('C1e gate-off fight pure delegation', calls === 2 && fr === 'base-fight-ret', `calls=${calls} ret=${fr}`);
    check('C1f gate-off touches no vetrel ctx keys', Object.keys(ctx).filter(k => k.startsWith('vet')).length === 0, JSON.stringify(Object.keys(ctx)));
    // Gate-on: daily proceeds to base then additive pushes (no throw on empty state).
    process.env.VETREL = '1';
    let threw = false;
    try { w.daily({}, {}); } catch (e) { threw = true; }
    check('C1g gate-on daily runs without throwing on minimal state', !threw);
    delete process.env.VETREL;
  }
}

// ---------- real-harness checks ----------
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';

  // C2: SMOKE — markers honest both sides, run completes.
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.VETREL = '1'; else delete process.env.VETREL;
    const { Game } = await loadGame({ seed: SEEDS[0], mode: `vetcompose-proof-smoke-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let vetLive = null, seatLive = null;
    const base = policyFor('belongseat');
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      vetLive = VR.vetrelOn(); seatLive = SD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`C2a ${side}: VETREL marker honest`, vetLive === (side === 'armed'), `vetrel=${vetLive}`);
    check(`C2b ${side}: seatdrive marker live`, seatLive === true, `seat=${seatLive}`);
    check(`C2c ${side}: run completes 15d`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }

  async function trajectory(seed, policyObj, vetrel, instrumented, days) {
    if (vetrel) process.env.VETREL = '1'; else delete process.env.VETREL;
    const { Game } = await loadGame({ seed, mode: 'vetcompose-proof-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    let policy = policyObj;
    if (instrumented) {
      const hist = {};
      const instr = makeInstrument(hist, oDaily);
      policy = Object.assign({}, policyObj, {
        daily(G, ctx) {
          const r = instr(G, ctx);
          try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
          return r;
        },
      });
    } else {
      policy = Object.assign({}, policyObj, {
        daily(G, ctx) {
          let r;
          if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
          try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
          return r;
        },
      });
    }
    await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
    return hs.join('|');
  }

  // C3: control (wrapped, VETREL unset) byte-identical to naked stack.
  for (const seed of [SEEDS[0], SEEDS[1]]) {
    for (const pid of ['leadseat', 'belongseat']) {
      const tWrap = await trajectory(seed, policyFor(pid), false, false);
      const tNaked = await trajectory(seed, nakedFor(pid), false, false);
      check(`C3 det-gate control vs naked ${pid} s${seed} 60d byte-identical`,
        tWrap === tNaked && tWrap.length > 0, `len=${tWrap.length}`);
    }
  }
  // C4: gate-on deterministic.
  for (const pid of ['leadseat', 'belongseat']) {
    const t1 = await trajectory(SEEDS[0], policyFor(pid), true, false);
    const t2 = await trajectory(SEEDS[0], policyFor(pid), true, false);
    check(`C4 gate-on deterministic ${pid} s${SEEDS[0]}`, t1 === t2 && t1.length > 0, `len=${t1.length}`);
  }
  // C5: instrument neutrality (the sweep's own instrument vs bare).
  for (const seed of [SEEDS[0], SEEDS[1]]) {
    for (const pid of ['leadseat', 'belongseat']) {
      const tBare = await trajectory(seed, policyFor(pid), true, false);
      const tInstr = await trajectory(seed, policyFor(pid), true, true);
      check(`C5 instrument-neutral ${pid} s${seed} 60d byte-identical`,
        tBare === tInstr && tBare.length > 0, `len=${tBare.length}`);
    }
  }
  // C6: non-vacuity on the full win-side substrate (180d armed vs control).
  const snapOf = (ctx) => {
    const s = {};
    for (const k of ['vetInvitesOk', 'vetHunts', 'vetHuntLegs', 'vetHuntEngaged', 'vetHuntFights', 'vetYields', 'vetBreakoffs', 'vetRescues'])
      if (ctx && ctx[k] != null) s[k] = ctx[k];
    return s;
  };
  const c6 = {};
  for (const side of ['control', 'armed']) {
    if (side === 'armed') process.env.VETREL = '1'; else delete process.env.VETREL;
    const base = policyFor('leadseat');
    const { Game } = await loadGame({ seed: SEEDS[2], mode: `vetcompose-proof-c6-${side}`, fullTelemetry: false });
    await setupGame(Game);
    let runCtx = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
    await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
    c6[side] = snapOf(runCtx);
  }
  const armedHunts = c6.armed.vetHunts || 0;
  const controlKeys = Object.keys(c6.control).filter(k => (c6.control[k] | 0) > 0);
  check('C6a armed drives the vetrel layer on the win substrate (180d)', armedHunts > 0,
    `vetHunts=${armedHunts} yields=${c6.armed.vetYields || 0}`);
  check('C6b control side shows zero vetrel activity', controlKeys.length === 0,
    `nonzero=${controlKeys.join(',') || '(none)'}`);
  delete process.env.VETREL;

  console.log(`\nPROOF: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(1); });
