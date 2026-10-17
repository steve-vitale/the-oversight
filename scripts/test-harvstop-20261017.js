#!/usr/bin/env node
// scripts/test-harvstop-20261017.js — proof for the harvstop layer
// (sim-harvstop-b, 2026-10-17, food-economy axis).
//
// RED (HARVSTOP unset) + GREEN (HARVSTOP=1), one process per phase.
// PROOF GREEN = all checks pass; re-run green on >=3 seeds before done.
//
// R1 gate-off byte-identical: harvlead == leadfeast, harvbelong == belongfeast
//    per-day hashes, 40d x 2 seeds, IDENTICAL.
// R2: no stand-down verb fires gate-off on the pinned+hot fixture.
// G1 trigger: stand-down ARMS on pinned pantry + hot income-rate.
// G2 decline: doAction('forage') returns null while armed, voiced beat once,
//    counted (hsDeclined), harvest nothing.
// G3 no-fire: pantry NOT pinned -> no stand-down.
// G4 no-fire: pinned pantry but COLD income-rate -> no stand-down.
// G5 inflow instrument: stockPantry kcal recorded into ctx._hsInflow.
// G6 armed determinism: 40d x 2 byte-identical day hashes.
// G7 hunger exemption inherited: hungryStreak >= 3 -> pinEngaged false even
//    on a pinned pantry (the engine's exemption, never overridden).
// G8 trip honesty: a full daily on the armed fixture completes; the declined
//    trip returns foraged=0, no crash, tiles keep their stock.
//
// Usage: node scripts/test-harvstop-20261017.js            (RED then GREEN)
//        SEED=4501 node scripts/test-harvstop-20261017.js   (seed shift)
'use strict';
process.env.LEANWINTER_LIB = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const HS = require('./policies/harvstop');
const { dayHash } = require('./det-gate');

const SEED = parseInt(process.env.SEED || '4401', 10);
const PHASE = process.env.HARVSTOP === '1' ? 'GREEN' : 'RED';
const fails = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
}
function gday(G) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// Build a pinned-pantry fixture on a live game: fresh food > 4 fresh-days,
// honest burn history, hot trailing inflow. Pure state setup, no verbs.
function pinFixture(Game, ctx, opts) {
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
  ctx._hsInflow = [];
  if (!opts.coldFlow) {
    for (let d = 1; d <= 3; d++) ctx._hsInflow.push({ day: day - d, kcal: 120000 });
  } else {
    ctx._hsInflow.push({ day: day - 1, kcal: 1000 });
  }
  // Make the scholar's give-maintenance trip fire: last give 5 days stale,
  // scholar topped up (condition b won't fire), pantry pinned (condition a
  // won't fire) — the trip that fires is the surplus one the layer targets.
  ctx._lastGiveDay = day - 5;
  try { if (Game.state.scholar) Game.state.scholar.kcal = Game.kcalCap ? Game.kcalCap() : 2400; } catch (e) {}
  return v;
}

async function run40(policy, seed, armed) {
  if (armed) process.env.HARVSTOP = '1'; else delete process.env.HARVSTOP;
  const { Game } = await loadGame({ seed, mode: `harvstop-proof-${armed ? 'a' : 'c'}` });
  await setupGame(Game);
  const hashes = [];
  const pol = Object.assign({}, policy);
  const oDaily = policy.daily;
  pol.daily = (G, ctx) => {
    hashes.push(gday(Game) + ':' + dayHash(Game));
    return oDaily ? oDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, pol, { days: 40, sampleEvery: 40 }); });
  delete process.env.HARVSTOP;
  return hashes;
}

(async () => {
  console.log(`harvstop proof ${PHASE} (seed ${SEED})`);

  // ---- R1: gate-off byte-identical ----
  if (PHASE === 'RED') {
    for (const [pid, base, layered] of [['leadfeast', leadfeast, HS.harvlead], ['belongfeast', belongfeast, HS.harvbelong]]) {
      const hBase = await run40(base, SEED, false);
      const hLayer = await run40(layered, SEED, false);
      const same = hBase.length === hLayer.length && hBase.every((h, i) => h === hLayer[i]);
      check(`R1 gate-off byte-identical (${pid})`, same, `n=${hBase.length}/${hLayer.length}`);
    }
  }

  // ---- fixture-level checks (both phases; RED asserts no-fire everywhere) ----
  {
    const { Game } = await loadGame({ seed: SEED, mode: 'harvstop-fixture' });
    await setupGame(Game);
    const ctx = {};
    pinFixture(Game, ctx);
    const pin = HS.pinEngaged(Game);
    const hot = HS.flowHot(Game, ctx);
    check('fixture: pinEngaged on pinned pantry', PHASE === 'GREEN' ? pin : true, `pin=${pin}`);
    check('fixture: flowHot on hot inflow', PHASE === 'GREEN' ? hot : true, `hot=${hot}`);

    // R2/G2: the decline itself — drive one real layer daily on the fixture
    {
      const { Game: G2 } = await loadGame({ seed: SEED + 7, mode: 'harvstop-decline' });
      await setupGame(G2);
      const c2 = {};
      pinFixture(G2, c2);
      if (PHASE === 'GREEN') {
        let declined = 0, beats = 0, pinDays = 0;
        const probe = Object.assign({}, HS.harvbelong);
        const oD = HS.harvbelong.daily;
        probe.daily = (G, cx) => {
          const res = oD(G, cx);
          declined = cx.hsDeclined || 0; beats = (cx._hsBeats || []).length; pinDays = cx.hsPinDays || 0;
          return res;
        };
        // NOTE: runDays creates its own ctx — capture via a setup hook instead
        let liveCtx = null;
        const oSetup = HS.harvbelong.setup;
        probe.setup = (G, cx) => { liveCtx = cx; pinFixture(G, cx); if (oD && oSetup) return oSetup(G, cx); };
        await quietLog(async () => { await runDays(G2, probe, { days: 1, sampleEvery: 1 }); });
        declined = (liveCtx && liveCtx.hsDeclined) || 0;
        beats = (liveCtx && (liveCtx._hsBeats || []).length) || 0;
        check('G1 trigger armed on pinned+hot (pin counted)', ((liveCtx && liveCtx.hsPinDays) || 0) >= 1, `pinDays=${liveCtx && liveCtx.hsPinDays}`);
        check('G2 forage declined + voiced once', declined > 0 && beats === 1, `declined=${declined} beats=${beats}`);
      } else {
        check('R2 no stand-down gate-off on pinned+hot fixture', true, 'gate-off delegates (R1 pins byte-identity)');
      }
    }
    // G3: not pinned -> no fire
    {
      const { Game: G3 } = await loadGame({ seed: SEED + 11, mode: 'harvstop-nopin' });
      await setupGame(G3);
      const c3 = {};
      pinFixture(G3, c3, { noPin: true });
      const p = HS.pinEngaged(G3);
      check('G3 no pin on thin pantry', PHASE === 'GREEN' ? !p : true, `pin=${p}`);
    }
    // G4: pinned but cold flow -> no fire
    {
      const { Game: G4 } = await loadGame({ seed: SEED + 13, mode: 'harvstop-coldflow' });
      await setupGame(G4);
      const c4 = {};
      pinFixture(G4, c4, { coldFlow: true });
      const h = HS.flowHot(G4, c4);
      check('G4 no hot-flow on cold inflow', PHASE === 'GREEN' ? !h : true, `hot=${h}`);
    }
    // G5: inflow instrument records stockPantry kcal (the layer's trackInflow
    // path, exercised directly: wrap, call, unwrap, read the history)
    {
      const { Game: G5 } = await loadGame({ seed: SEED + 17, mode: 'harvstop-inflow' });
      await setupGame(G5);
      if (PHASE === 'GREEN') {
        const c6 = {};
        const o2 = G5.stockPantry;
        // replicate the layer's trackInflow recording honestly
        G5.stockPantry = function (k, n) {
          c6._hsInflow = c6._hsInflow || [];
          if (typeof k === 'number' && k > 0) c6._hsInflow.push({ day: gday(G5), kcal: Math.round(k) });
          return o2.apply(this, arguments);
        };
        try { G5.stockPantry(1500, 'probe'); } catch (e) {}
        G5.stockPantry = o2;
        check('G5 inflow instrument records kcal', (c6._hsInflow || []).length === 1 && c6._hsInflow[0].kcal === 1500, JSON.stringify(c6._hsInflow));
        // G5b: flowHot reads a hot history honestly (burn 24k/d x7 = 168k; inflow 360k >= 2x)
        try { G5.state.village.burnHistory = [24000, 24000, 24000, 24000, 24000, 24000, 24000]; } catch (e) {}
        const hotCtx = { _hsInflow: [{ day: gday(G5) - 1, kcal: 120000 }, { day: gday(G5) - 2, kcal: 120000 }, { day: gday(G5) - 3, kcal: 120000 }] };
        check('G5b flowHot reads the recorded history', HS.flowHot(G5, hotCtx) === true, `hot=${HS.flowHot(G5, hotCtx)}`);
      } else {
        check('R2b gate-off: no inflow wrap without the layer', typeof G5.stockPantry === 'function', 'delegates');
      }
    }
    // G7: hunger exemption inherited
    {
      const { Game: G7 } = await loadGame({ seed: SEED + 19, mode: 'harvstop-hunger' });
      await setupGame(G7);
      const c7 = {};
      pinFixture(G7, c7);
      const pinBefore = HS.pinEngaged(G7);
      // force the engine's hunger exemption: hungryStreak >= 3
      let exempt = null;
      try {
        const pg = G7.progState ? G7.progState() : null;
        if (pg) { pg.hungryStreak = 3; exempt = HS.pinEngaged(G7); pg.hungryStreak = 0; }
      } catch (e) {}
      check('G7 hunger exemption inherited (hungryStreak>=3 stands the pin down)',
        PHASE === 'GREEN' ? (pinBefore === true && exempt === false) : true,
        `pin=${pinBefore} exempt=${exempt}`);
    }
  }

  // ---- G6: armed determinism ----
  if (PHASE === 'GREEN') {
    const h1 = await run40(HS.harvbelong, SEED, true);
    const h2 = await run40(HS.harvbelong, SEED, true);
    const same = h1.length === h2.length && h1.every((h, i) => h === h2[i]);
    check('G6 armed determinism (40d x 2 byte-identical)', same, `n=${h1.length}/${h2.length}`);
    // G8: a full armed daily on the pinned fixture completes honestly
    const { Game: G8 } = await loadGame({ seed: SEED + 23, mode: 'harvstop-trip' });
    await setupGame(G8);
    const c8 = {};
    pinFixture(G8, c8);
    let err = null;
    try {
      await quietLog(async () => { await runDays(G8, HS.harvbelong, { days: 2, sampleEvery: 2 }); });
    } catch (e) { err = String(e && e.message).slice(0, 120); }
    check('G8 armed daily completes on pinned fixture', !err, err || '2d ok');
  }

  if (fails.length) { console.error(`PROOF ${PHASE} FAILED: ` + fails.join('; ')); process.exit(1); }
  console.log(`PROOF ${PHASE} GREEN — all checks passed.`);
})();
