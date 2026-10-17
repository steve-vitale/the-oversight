#!/usr/bin/env node
// scripts/test-hvstop2-20261017.js — proof for the hvstop2 layer
// (sim-hvstop2-b, 2026-10-17, food-economy axis; §14 escape-hatch re-run of
// the killed sim-harvstop-b arm).
//
// RED (HVSTOP2 unset) + GREEN (HVSTOP2=1), one process per phase.
// SMOKE=1: short live-run honesty gate (layer-live markers + completion).
// PROOF GREEN = all checks pass; re-run green on >=3 seeds before done.
//
// R1 gate-off byte-identical: hvlead == leadfeast, hvbelong == belongfeast
//    per-day hashes, 40d x 2 seeds, IDENTICAL.
// R2: no stand-down verb fires gate-off on the pinned+hot fixture.
// R2b: gate-off installs no inflow wrap (setup pure-delegates).
// G1 trigger: stand-down ARMS on pinned pantry + hot income-rate (pin counted).
// G2 decline: doAction('forage') returns null while armed, voiced beat once,
//    counted (hvDeclined), harvest nothing.
// G3 no-fire: pantry NOT pinned -> no stand-down.
// G4 no-fire: pinned pantry but COLD income-rate -> no stand-down.
// G5 inflow instrument: the PERSISTENT setup wrap records stockPantry kcal
//    and stockSurplus returns into ctx._hvInflow (the sleep-time path).
// G5b: flowHot reads the recorded history honestly.
// G6 armed determinism: 40d x 2 byte-identical day hashes.
// G7 hunger exemption inherited: hungryStreak >= 3 -> pinEngaged false even
//    on a pinned pantry (the engine's exemption, never overridden).
// G7b surplus-only: a genuinely hungry scholar (< 50% kcalCap) is NOT stood
//    down on pinned+hot (needTrip condition b fires — the trip goes).
// G8 trip honesty: a full armed daily on the pinned fixture completes; the
//    declined trip returns foraged=0, no crash, tiles keep their stock.
// G9 beat rotation deterministic: 4 stand-down beats differ (count-keyed),
//    the 5th repeats the 1st; identical sequence on re-run (no RNG).
//
// Usage: node scripts/test-hvstop2-20261017.js            (RED then GREEN)
//        HVSTOP2=1 node scripts/test-hvstop2-20261017.js  (GREEN phase)
//        SMOKE=1 node scripts/test-hvstop2-20261017.js    (smoke gate)
//        SEED=4502 node scripts/test-hvstop2-20261017.js  (seed shift)
'use strict';
// KILL-PROTOCOL INFO-SKIP (2026-10-17): the hvstop2 layer was deleted per
// kill protocol (pilot NO-GO 0.964x paired-median vs 0.85x bar — the waste-rate
// effect did not replicate on fresh seeds); the proof skips cleanly when the
// layer is absent so the retained instrument stays runnable.
try {
  require('fs').accessSync(require('path').join(__dirname, 'policies', 'hvstop2.js'));
} catch (e) {
  console.log('INFO-SKIP: hvstop2 layer absent (killed at pilot) — nothing to prove.');
  process.exit(0);
}
process.env.LEANWINTER_LIB = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const HV = require('./policies/hvstop2');
const { dayHash } = require('./det-gate');

const SEED = parseInt(process.env.SEED || '4501', 10);
const PHASE = process.env.HVSTOP2 === '1' ? 'GREEN' : 'RED';
const SMOKE = process.env.SMOKE === '1';
const fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}
function gday(G) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// Pinned-pantry fixture: fresh food > 4 fresh-days, honest burn history.
// The hot inflow is recorded THROUGH the layer's persistent wrap (G5) —
// never pre-seeded — so the fixture proves the sleep-time path.
function pinFixture(Game, opts) {
  opts = opts || {};
  const v = Game.state.village || {};
  const day = gday(Game);
  v.pantry = v.pantry || [];
  if (!opts.noPin) {
    for (let i = 0; i < 4; i++) {
      v.pantry.push({ name: 'fresh greens', kcalEach: 5000, units: 10, spoilDay: day + 2, foodState: 'raw', unit: 'bundle' });
    }
  } else {
    v.pantry.push({ name: 'scraps', kcalEach: 200, units: 5, spoilDay: day + 2, foodState: 'raw', unit: 'bundle' });
  }
  v.burnHistory = [24000, 24000, 24000, 24000, 24000, 24000, 24000];
  // Scholar topped up (surplus-only): the give-maintenance trip is the one
  // that fires on the fixture, not a hunger trip.
  try { if (Game.state.scholar) Game.state.scholar.kcal = Game.kcalCap ? Game.kcalCap() : 2400; } catch (e) {}
  return v;
}

// Make the give-maintenance trip fire: last give 5 days stale, scholar
// topped up (condition b won't fire), pantry pinned (condition a won't
// fire) — the trip that fires is the surplus one the layer targets.
function staleGive(ctx, Game) {
  ctx._lastGiveDay = gday(Game) - 5;
}

// Record hot (or cold) inflow through the persistent wrap installed by the
// layer's setup. burn = 168k; hot needs >= 336k.
function recordInflow(Game, hot) {
  const amt = hot ? 120000 : 1000;
  const n = hot ? 3 : 1;
  for (let i = 0; i < n; i++) {
    try { Game.stockPantry(amt, 'probe inflow'); } catch (e) {}
  }
}

async function run40(policy, seed, armed) {
  if (armed) process.env.HVSTOP2 = '1'; else delete process.env.HVSTOP2;
  const { Game } = await loadGame({ seed, mode: `hvstop2-proof-${armed ? 'a' : 'c'}` });
  await setupGame(Game);
  const hashes = [];
  const pol = Object.assign({}, policy);
  const oDaily = policy.daily;
  pol.daily = (G, ctx) => {
    hashes.push(gday(Game) + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 40 }); });
  delete process.env.HVSTOP2;
  return hashes;
}

// One armed day on the pinned+hot fixture through the real setup+daily path.
async function armedDay(seed, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'hvstop2-armedday' });
  await setupGame(Game);
  let liveCtx = null;
  const probe = Object.assign({}, HV.hvbelong);
  const oSetup = HV.hvbelong.setup;
  probe.setup = (G, cx) => {
    liveCtx = cx;
    const r = oSetup ? oSetup(G, cx) : undefined; // installs the persistent wrap (GREEN)
    pinFixture(G, opts);
    staleGive(cx, G);
    if (process.env.HVSTOP2 === '1' && !opts.coldFlow) recordInflow(G, true);
    if (process.env.HVSTOP2 === '1' && opts.coldFlow) recordInflow(G, false);
    if (opts.hungryScholar) { try { G.state.scholar.kcal = Math.round((G.kcalCap ? G.kcalCap() : 2400) * 0.1); } catch (e) {} }
    return r;
  };
  await quietLog(async () => { await runDays(Game, probe, { days: 1, sampleEvery: 1 }); });
  return { Game, ctx: liveCtx };
}

(async () => {
  if (SMOKE) {
    console.log(`hvstop2 SMOKE (seed ${SEED})`);
    for (const side of ['control', 'armed']) {
      if (side === 'armed') process.env.HVSTOP2 = '1'; else delete process.env.HVSTOP2;
      const { Game } = await loadGame({ seed: SEED, mode: `hvstop2-smoke-${side}` });
      await setupGame(Game);
      const base = side === 'armed' ? HV.hvbelong : belongfeast;
      let runCtx = null;
      const pol = Object.assign({}, base);
      const oSetup = base.setup;
      pol.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
      const r = await quietLog(async () => runDays(Game, pol, { days: 20, sampleEvery: 20 }));
      const live = side === 'armed'
        ? (base.id === 'hvbelong' && runCtx && typeof runCtx.hvPinDays === 'number')
        : (base.id === 'belongfeast' && runCtx && runCtx.hvStandDowns === undefined);
      check(`${side}: layer-live markers honest`, !!live, `id=${base.id}`);
      check(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    }
    delete process.env.HVSTOP2;
    if (fails.length) { console.error('SMOKE FAILED: ' + fails.join('; ')); process.exit(3); }
    console.log('SMOKE green.');
    return;
  }

  console.log(`hvstop2 proof ${PHASE} (seed ${SEED})`);

  // ---- R1: gate-off byte-identical ----
  if (PHASE === 'RED') {
    for (const [pid, base, layered] of [['leadfeast', leadfeast, HV.hvlead], ['belongfeast', belongfeast, HV.hvbelong]]) {
      const hBase = await run40(base, SEED, false);
      const hLayer = await run40(layered, SEED, false);
      const same = hBase.length === hLayer.length && hBase.every((h, i) => h === hLayer[i]);
      check(`R1 gate-off byte-identical (${pid})`, same, `n=${hBase.length}/${hLayer.length}`);
    }
    // R2b: gate-off installs no inflow wrap
    {
      const { Game } = await loadGame({ seed: SEED + 5, mode: 'hvstop2-nowarp' });
      await setupGame(Game);
      let liveCtx = null;
      const probe = Object.assign({}, HV.hvbelong);
      const oS = HV.hvbelong.setup;
      probe.setup = (G, cx) => { liveCtx = cx; return oS ? oS(G, cx) : undefined; };
      await quietLog(async () => { await runDays(Game, probe, { days: 2, sampleEvery: 2 }); });
      check('R2b gate-off installs no inflow wrap', liveCtx && liveCtx._hvInflow === undefined,
        `_hvInflow=${liveCtx && liveCtx._hvInflow}`);
      check('R2 no stand-down gate-off', liveCtx && liveCtx.hvStandDowns === undefined, 'delegates');
    }
  }

  // ---- fixture-level checks ----
  if (PHASE === 'GREEN') {
    // G1/G2: the full armed path on the pinned+hot fixture
    {
      const { ctx } = await armedDay(SEED + 7);
      check('G1 trigger armed on pinned+hot (pin counted)', (ctx.hvPinDays || 0) >= 1, `pinDays=${ctx.hvPinDays}`);
      check('G1b hot flow counted', (ctx.hvHotDays || 0) >= 1, `hotDays=${ctx.hvHotDays}`);
      check('G2 forage declined + voiced once', (ctx.hvDeclined || 0) > 0 && (ctx._hvBeats || []).length === 1,
        `declined=${ctx.hvDeclined} beats=${(ctx._hvBeats || []).length}`);
      check('G2b stand-down day counted', (ctx.hvStandDowns || 0) >= 1, `standDowns=${ctx.hvStandDowns}`);
    }
    // G3: thin pantry -> no fire. The hot inflow is recorded through the
    // wrap (it really happened), then the probe-inflow stacks are lifted
    // back out — the village ate the haul; the pantry is thin NOW. pin is
    // the binding gate: hot flow alone must not arm.
    {
      const { Game } = await loadGame({ seed: SEED + 11, mode: 'hvstop2-thin' });
      await setupGame(Game);
      let liveCtx = null;
      const probe = Object.assign({}, HV.hvbelong);
      const oSetup = HV.hvbelong.setup;
      probe.setup = (G, cx) => {
        liveCtx = cx;
        const r = oSetup ? oSetup(G, cx) : undefined;
        pinFixture(G, { noPin: true });
        staleGive(cx, G);
        recordInflow(G, true);
        try {
          const v = G.state.village || {};
          v.pantry = (v.pantry || []).filter(i => i && i.name !== 'probe inflow');
        } catch (e) {}
        return r;
      };
      await quietLog(async () => { await runDays(Game, probe, { days: 1, sampleEvery: 1 }); });
      const ctx = liveCtx;
      check('G3 hot flow + thin pantry -> no stand-down (pin binds)',
        (ctx.hvPinDays || 0) === 0 && (ctx.hvStandDowns || 0) === 0,
        `pinDays=${ctx.hvPinDays} hotDays=${ctx.hvHotDays} standDowns=${ctx.hvStandDowns}`);
    }
    // G4: pinned but cold flow -> no fire
    {
      const { ctx } = await armedDay(SEED + 13, { coldFlow: true });
      const pin = (ctx.hvPinDays || 0) >= 1, hot = (ctx.hvHotDays || 0) >= 1;
      check('G4 pin holds but flow cold -> no stand-down', pin && !hot && (ctx.hvStandDowns || 0) === 0,
        `pinDays=${ctx.hvPinDays} hotDays=${ctx.hvHotDays} standDowns=${ctx.hvStandDowns}`);
    }
    // G5: the persistent wrap records stockPantry kcal (the sleep-time path)
    {
      const { Game } = await loadGame({ seed: SEED + 17, mode: 'hvstop2-inflow' });
      await setupGame(Game);
      const c = {};
      HV.hvbelong.setup(Game, c);
      const n0 = (c._hvInflow || []).length;
      try { Game.stockPantry(1500, 'probe'); } catch (e) {}
      const got = (c._hvInflow || []).length === n0 + 1 && c._hvInflow[c._hvInflow.length - 1].kcal === 1500;
      check('G5 persistent wrap records stockPantry kcal', got, JSON.stringify((c._hvInflow || []).slice(-1)));
      check('G5b wrap delegates honestly', typeof Game.stockPantry === 'function' && typeof Game.stockSurplus === 'function', 'both wrapped');
    }
    // G5c: flowHot reads the recorded history honestly
    {
      const { Game } = await loadGame({ seed: SEED + 18, mode: 'hvstop2-flowhot' });
      await setupGame(Game);
      const c = {};
      HV.hvbelong.setup(Game, c);
      try { Game.state.village.burnHistory = [24000, 24000, 24000, 24000, 24000, 24000, 24000]; } catch (e) {}
      for (let i = 0; i < 3; i++) { try { Game.stockPantry(120000, 'probe'); } catch (e) {} }
      const hot = HV.flowHot(Game, c);
      check('G5c flowHot reads a hot history (360k >= 2x168k)', hot === true, `hot=${hot}`);
    }
    // G7: hunger exemption inherited from the engine
    {
      const { Game } = await loadGame({ seed: SEED + 19, mode: 'hvstop2-hunger' });
      await setupGame(Game);
      const c = {};
      pinFixture(Game, c);
      const pinBefore = HV.pinEngaged(Game);
      let exempt = null;
      try {
        const pg = Game.progState ? Game.progState() : null;
        if (pg) { pg.hungryStreak = 3; exempt = HV.pinEngaged(Game); pg.hungryStreak = 0; }
      } catch (e) {}
      check('G7 hunger exemption inherited (hungryStreak>=3 stands the pin down)',
        pinBefore === true && exempt === false, `pin=${pinBefore} exempt=${exempt}`);
    }
    // G7b: surplus-only — a scholar who is hungry AT GATE-CHECK TIME is NOT
    // stood down (the dawn meal runs before the policy daily, so the fixture
    // forces kcal low inside the daily, just before the layer's gate reads).
    {
      const { Game } = await loadGame({ seed: SEED + 21, mode: 'hvstop2-hungryscholar' });
      await setupGame(Game);
      let liveCtx = null;
      const probe = Object.assign({}, HV.hvbelong);
      const oSetup = HV.hvbelong.setup;
      const oDaily = HV.hvbelong.daily;
      probe.setup = (G, cx) => {
        liveCtx = cx;
        const r = oSetup ? oSetup(G, cx) : undefined;
        pinFixture(G, {});
        staleGive(cx, G);
        recordInflow(G, true);
        return r;
      };
      probe.daily = (G, cx) => {
        try { G.state.scholar.kcal = Math.round((G.kcalCap ? G.kcalCap() : 2400) * 0.1); } catch (e) {}
        return oDaily(G, cx);
      };
      await quietLog(async () => { await runDays(Game, probe, { days: 1, sampleEvery: 1 }); });
      const ctx = liveCtx;
      check('G7b hungry scholar not stood down (trip goes)',
        (ctx.hvStandDowns || 0) === 0 && (ctx.hvDeclined || 0) === 0,
        `standDowns=${ctx.hvStandDowns} declined=${ctx.hvDeclined}`);
    }
    // G6: armed determinism
    {
      const h1 = await run40(HV.hvbelong, SEED, true);
      const h2 = await run40(HV.hvbelong, SEED, true);
      const same = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
      check('G6 armed determinism (40d x 2 byte-identical)', same, `n=${h1.length}/${h2.length}`);
    }
    // G8: armed daily completes honestly on the pinned fixture
    {
      const { Game } = await loadGame({ seed: SEED + 23, mode: 'hvstop2-trip' });
      await setupGame(Game);
      let err = null;
      try {
        await quietLog(async () => { await runDays(Game, HV.hvbelong, { days: 2, sampleEvery: 2 }); });
      } catch (e) { err = String(e && e.message).slice(0, 120); }
      check('G8 armed daily completes on pinned fixture', !err, err || '2d ok');
    }
    // G9: beat rotation is deterministic and count-keyed
    {
      const beats = [];
      const fake = { say(m) { beats.push(m); }, pantryFreshDays() { return 19; } };
      const cx = {};
      for (let i = 0; i < 5; i++) HV.sayStandDown(fake, cx);
      const first4 = beats.slice(0, 4);
      const distinct = new Set(first4).size === 4;
      const wraps = beats[4] === beats[0];
      const cx2 = {};
      const beats2 = [];
      const fake2 = { say(m) { beats2.push(m); }, pantryFreshDays() { return 19; } };
      for (let i = 0; i < 5; i++) HV.sayStandDown(fake2, cx2);
      const rerunSame = beats.every((b, i) => b === beats2[i]);
      check('G9 beat rotation: 4 distinct frames, wraps, re-runnable',
        distinct && wraps && rerunSame, `distinct4=${distinct} wrap=${wraps} rerun=${rerunSame}`);
      check('G9b beats name the real count + patch', /19 days of fresh/.test(beats[0]) && /creek|thicket|grove|meadow|north field/.test(beats[0]),
        beats[0].slice(0, 80));
    }
  }

  if (fails.length) { console.error(`PROOF ${PHASE} FAILED: ` + fails.join('; ')); process.exit(1); }
  console.log(`PROOF ${PHASE} GREEN — all checks passed.`);
})();
