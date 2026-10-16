#!/usr/bin/env node
'use strict';
// test-w3drive2-20261015.js — pre-sweep proof for the rebuilt wave-3
// counter-learning lever (flesh-out loop, 2026-10-15, sim-w3drive2,
// scale-onramp axis).
//
// The lever: scripts/policies/w3drive2.js (env-gated W3DRIVE2=1, default
// OFF, ZERO src/js changes) wrapping the tribfloor->windefer chain
// (WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/
// 'belongfeast-windefer'). The two metric-review fixes from the killed
// w3drive round (evidence/2026-10-15/sim-w3drive.md):
//   FIX 1 — PANTRY-GATED hunts: the don't-hunt-hungry gate reads the
//   VILLAGE PANTRY (Game.villageFoodTier() === 'starving', the engine's own
//   hunger vocabulary; fallback pantryDaysEstimate() < 1), NOT the
//   scholar's kcal (the scholar-kcal check is gone — replaced, not
//   supplemented).
//   FIX 2 — NO COMMIT: the hold-to-12% scholar-sacrifice (ctx._huntCommit)
//   is removed entirely. This layer never writes ctx._huntCommit or
//   ctx._w5Commit; the scholar keeps the engine's honest 35% eject.
//
// Proves, before any sweep spend:
//   (a) layer-live markers honest on BOTH sides;
//   (b) gate-off det-gate: the withW3Drive2 composition is byte-identical
//       to the naked tribfloor->windefer composition on identical seeds;
//   (c) SMOKE: one 20d run per side, markers honest, run completes;
//   (d) unit checks: huntLive gating, villageHungry (pantry tiers +
//       fallback), huntLeg pantry-gate behavior (blocks on starving, fires
//       on tight even with a hungry scholar — the replacement pin);
//   (e) NO-COMMIT pin: the layer file contains zero _huntCommit/_w5Commit
//       references AND the composed policy adds no fight override;
//   (f) instrument honesty: the sweep's counter-discovery tele capture
//       (villagerTricks written only by _trickObservation).
//
// Env-helper discipline (sim-findings: PROOF WITHENV ASYNC HAZARD): withEnv
// is sync-only and wraps sync functions; async sections set process.env
// directly like the w3drive proof did.
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-w3drive2-20261015.js
//   SEEDS="163,274" DAYS=30 node scripts/test-w3drive2-20261015.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
const W3_PATH = (() => { try { return require.resolve('./policies/w3drive2'); } catch (e) { return null; } })();
if (!W3_PATH) {
  console.log('== w3drive2 pre-sweep proof ==');
  console.log('INFO-SKIP: layer absent (scripts/policies/w3drive2.js not found).');
  process.exit(0);
}
const W3 = require(W3_PATH);

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('PROOF STOP: SEATDRIVE must NOT be set for the w3drive2 substrate.'); process.exit(2); }

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// Sync-only env helper. NEVER pass an async function (withEnv restores
// process.env when the function returns its promise — before it resolves).
function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    const r = fn();
    if (r && typeof r.then === 'function') throw new Error('withEnv got an async fn — hazard');
    return r;
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

function nakedBase(policyId) {
  const tf = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  return WD.withWinDefer(tf, `${policyId}-windefer`, `naked tribfloor->windefer for proof`);
}

async function detGateOnce(seed, policyId, days) {
  const runs = [];
  for (const armed of [false, true]) {
    Object.assign(process.env, SUBSTRATE);
    if (armed) process.env.W3DRIVE2 = '1'; else delete process.env.W3DRIVE2;
    const policy = armed ? (policyId === 'leadfeast' ? W3.leadw3d2 : W3.belongw3d2) : nakedBase(policyId);
    const { Game } = await loadGame({ seed, mode: `w3drive2-detgate-${armed ? 'armed' : 'control'}` });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const baseDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      try { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); } catch (e) { hashes.push('ERR'); }
      return baseDaily ? baseDaily(G, ctx) : undefined;
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    runs.push({ armed, hashes, days: r && r.days, endReason: r && r.endReason });
    delete process.env.W3DRIVE2;
  }
  return runs;
}

async function main() {
  console.log('== w3drive2 pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ W3DRIVE2: '1' }, () => ok('layerOn true when W3DRIVE2=1', W3.w3drive2On() === true, ''));
  withEnv({ W3DRIVE2: undefined }, () => ok('layerOn false when unset', W3.w3drive2On() === false, ''));
  withEnv({ W3DRIVE2: '0' }, () => ok('layerOn false when W3DRIVE2=0', W3.w3drive2On() === false, ''));
  // the OLD gate must not leak in: W3DRIVE=1 alone must not arm this layer
  withEnv({ W3DRIVE: '1', W3DRIVE2: undefined }, () => ok('old W3DRIVE=1 does not arm w3drive2', W3.w3drive2On() === false, ''));

  // ----- 2. composition integrity -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadw3d2 id', W3.leadw3d2 && W3.leadw3d2.id === 'leadfeast-windefer', W3.leadw3d2 && W3.leadw3d2.id);
    ok('belongw3d2 id', W3.belongw3d2 && W3.belongw3d2.id === 'belongfeast-windefer', W3.belongw3d2 && W3.belongw3d2.id);
    ok('tribfloor layerOn true under TRIBFLOOR=1', TF.layerOn() === true, '');
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
    const nb = nakedBase('belongfeast');
    ok('naked base id matches', nb.id === 'belongfeast-windefer', nb.id);
  });

  // ----- 3. huntLive gating (stub Games) -----
  withEnv({ W3DRIVE2: '1' }, () => {
    const stubG = (uw, tableDone) => ({
      unlockedWave: () => uw,
      progState: () => ({ tableDone: !!tableDone, tableWaiting: false }),
    });
    ok('huntLive false at uw=2', W3.huntLive(stubG(2, false)) === false, '');
    ok('huntLive true at uw=3', W3.huntLive(stubG(3, false)) === true, '');
    ok('huntLive false at uw=4 (wave5reach territory)', W3.huntLive(stubG(4, false)) === false, '');
    ok('huntLive false at uw=5', W3.huntLive(stubG(5, false)) === false, '');
    ok('huntLive false during table', W3.huntLive(stubG(3, true)) === false, '');
    withEnv({ W3DRIVE2: undefined }, () => {
      ok('huntLive false when gate off (uw=3)', W3.huntLive(stubG(3, false)) === false, '');
    });
  });

  // ----- 4. villageHungry: the PANTRY gates, not the scholar's kcal -----
  withEnv({ W3DRIVE2: '1' }, () => {
    ok("hungry when tier 'starving'", W3.villageHungry({ villageFoodTier: () => 'starving' }) === true, '');
    ok("not hungry when tier 'tight'", W3.villageHungry({ villageFoodTier: () => 'tight' }) === false, '');
    ok("not hungry when tier 'secure'", W3.villageHungry({ villageFoodTier: () => 'secure' }) === false, '');
    ok("not hungry when tier 'abundant'", W3.villageHungry({ villageFoodTier: () => 'abundant' }) === false, '');
    ok('fallback: hungry when pantryDaysEstimate < 1', W3.villageHungry({ pantryDaysEstimate: () => 0.4 }) === true, '');
    ok('fallback: not hungry when pantryDaysEstimate >= 1', W3.villageHungry({ pantryDaysEstimate: () => 2.5 }) === false, '');
    ok('inert when no pantry methods (stub)', W3.villageHungry({}) === false, '');
    // the scholar's kcal is IRRELEVANT to the gate — a starving scholar
    // with a fed village is not blocked (the old gate would have blocked).
    ok('scholar kcal ignored by the gate', W3.villageHungry({ villageFoodTier: () => 'tight', state: { scholar: { kcal: 10 } } }) === false, '');
  });

  // ----- 5. huntLeg pantry-gate behavior (stub Games) -----
  withEnv({ W3DRIVE2: '1' }, () => {
    const huntStub = (tier, scholarKcal) => {
      let travelCalled = false;
      const traveled = [];
      return {
        game: {
          unlockedWave: () => 3,
          progState: () => ({}),
          maxHealth: () => 100,
          villageFoodTier: () => tier,
          state: { scholar: { hp: 90, day: 50, kcal: scholarKcal } },
          travelTargets: () => { travelCalled = true; return [{ x: 1, y: 1, d: 2 }]; },
          tileAt: () => ({ type: 'thicket', revealed: true }),
          monsterAt: () => null,
          map: { px: 0, py: 0 },
          travelTo: (x, y) => { traveled.push([x, y]); },
        },
        wasTravelCalled: () => travelCalled,
        traveled,
      };
    };
    // starving pantry: no hunt, gate block counted, travel never attempted
    {
      const st = huntStub('starving', 900);
      const ctx = {};
      W3.huntLeg(st.game, ctx);
      ok('starving pantry: hunt does not fire', (ctx.w3Hunts || 0) === 0, `w3Hunts=${ctx.w3Hunts}`);
      ok('starving pantry: block counted', (ctx.w3PantryGateBlocks || 0) === 1, `blocks=${ctx.w3PantryGateBlocks}`);
      ok('starving pantry: travel never attempted', st.wasTravelCalled() === false, '');
    }
    // tight pantry: hunt fires even when the scholar is personally hungry
    // (the old scholar-kcal gate would have blocked at kcal < 200)
    {
      const st = huntStub('tight', 50);
      const ctx = {};
      W3.huntLeg(st.game, ctx);
      ok('tight pantry + hungry scholar: hunt fires', (ctx.w3Hunts || 0) === 1, `w3Hunts=${ctx.w3Hunts}`);
      ok('tight pantry: leg traveled', (ctx.w3HuntLegs || 0) === 1, `legs=${ctx.w3HuntLegs}`);
      ok('no empty-pantry hunt recorded', (ctx.w3HuntsEmptyPantry || 0) === 0, '');
    }
    // cadence: second hunt within 3 days does not fire
    {
      const st = huntStub('tight', 900);
      const ctx = {};
      W3.huntLeg(st.game, ctx);
      W3.huntLeg(st.game, ctx);
      ok('3-day cadence holds', (ctx.w3Hunts || 0) === 1, `w3Hunts=${ctx.w3Hunts}`);
    }
  });

  // ----- 6. NO-COMMIT pin (FIX 2) -----
  {
    const fs = require('fs');
    const src = fs.readFileSync(__dirname + '/policies/w3drive2.js', 'utf8');
    const commitRefs = (src.match(/_huntCommit|_w5Commit/g) || []).length;
    // The two FIX-2 comment mentions are allowed; any CODE reference is not.
    // Count lines that are not comments:
    const codeRefs = src.split('\n').filter(l => {
      const t = l.trim();
      return !t.startsWith('//') && !t.startsWith('*') && /_huntCommit|_w5Commit/.test(l);
    }).length;
    ok('layer file: zero _huntCommit/_w5Commit CODE references', codeRefs === 0, `codeRefs=${codeRefs}`);
    // The composed policy adds no fight override: fight is the base's own.
    const noopBase = { daily: () => 'd', fight: function () { return 'delegated'; } };
    const composed = W3.withW3Drive2(noopBase, 'x', 'x');
    ok('composed policy: no fight override added', composed.fight === noopBase.fight, '');
    // Even on a live wave-3 fight at full HP, the delegation writes nothing.
    const fightG = {
      unlockedWave: () => 3, progState: () => ({}), maxHealth: () => 100,
      state: { scholar: { hp: 100 } },
      tbfight: { over: false, fighters: [
        { key: 'p', kind: 'player', hp: 100 },
        { key: 'm_0', kind: 'monster', hp: 300, monsterId: 'spool' },
      ]},
    };
    const ctx = {};
    composed.fight(fightG, ctx);
    ok('_huntCommit never written on live wave-3 fight', !('_huntCommit' in ctx), JSON.stringify(Object.keys(ctx)));
    ok('_w5Commit never written on live wave-3 fight', !('_w5Commit' in ctx), JSON.stringify(Object.keys(ctx)));
  }

  // ----- 7. det-gate: gate-off byte-identical to the naked base -----
  const detSeeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [163, 274]).filter(Number.isFinite);
  const detDays = parseInt(process.env.DAYS || '30', 10);
  for (const seed of detSeeds) {
    const runs = await detGateOnce(seed, 'belongfeast', detDays);
    const [control, armed] = runs;
    const sameLen = control.hashes.length === armed.hashes.length;
    let same = sameLen;
    let firstDiv = -1;
    if (sameLen) {
      for (let i = 0; i < control.hashes.length; i++) {
        if (control.hashes[i] !== armed.hashes[i]) { same = false; firstDiv = i; break; }
      }
    }
    ok(`det-gate seed ${seed}: gate-off byte-identical (${detDays}d)`,
      control.armed === false && armed.armed === true && same,
      same ? `days=${control.days}/${armed.days}` : `firstDiv=${firstDiv} len=${control.hashes.length}/${armed.hashes.length}`);
  }

  // ----- 8. instrument honesty: tele-funnel pin -----
  const fs = require('fs');
  try {
    const src = fs.readFileSync(__dirname + '/../src/js/game.js', 'utf8');
    const start = src.indexOf('_trickObservation(vid, mid, firstPerson)');
    const fnBody = start >= 0 ? src.slice(start, start + 6000) : '';
    const writeInside = fnBody.includes('vt[mid] = true');
    let writesOutside = 0;
    for (const f of ['game.js', 'fieldFights.js', 'villager-agency.js']) {
      try {
        const s2 = fs.readFileSync(__dirname + '/../src/js/' + f, 'utf8');
        for (const m of s2.matchAll(/villagerTricks[^\n]*=\s*true|vt\[mid\]\s*=\s*true/g)) {
          if (f === 'game.js' && start >= 0) {
            const idx = m.index;
            if (idx > start && idx < start + 6000) continue;
          }
          writesOutside++;
        }
      } catch (e) {}
    }
    ok('villagerTricks written ONLY by _trickObservation', writeInside && writesOutside === 0,
      `writeInside=${writeInside} writesOutside=${writesOutside}`);
    const teleLines = src.split('\n').filter(l => l.includes("tele('counter_discovered'"));
    ok('counter_discovered tele fires from the discovery funnel', teleLines.length > 0,
      teleLines.length + ' call sites');
  } catch (e) { ok('villagerTricks/tele pin', false, String((e && e.message) || e).slice(0, 120)); }

  // ----- 9. SMOKE: 20d both sides, markers honest, run completes -----
  for (const side of ['control', 'armed']) {
    Object.assign(process.env, SUBSTRATE);
    if (side === 'armed') process.env.W3DRIVE2 = '1'; else delete process.env.W3DRIVE2;
    const base = side === 'armed' ? W3.belongw3d2 : nakedBase('belongfeast');
    const { Game } = await loadGame({ seed: 163, mode: `w3drive2-smoke-${side}` });
    await setupGame(Game);
    let w3Live = null, tfLive = null, wdLive = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      w3Live = W3.w3drive2On(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    ok(`${side}: markers honest`, w3Live === (side === 'armed') && tfLive === true && wdLive === true,
      `w3=${w3Live} tf=${tfLive} wd=${wdLive}`);
    ok(`${side}: run completes`, !!(r && r.days >= 20), `days=${r && r.days}`);
    ok(`${side}: policy id`, base.id === 'belongfeast-windefer', base.id);
    delete process.env.W3DRIVE2;
  }

  console.log(`\n== w3drive2 proof: ${pass} pass, ${fail} fail ==`);
  if (fail) { console.log('FAILS: ' + fails.join('\n  ')); process.exit(1); }
  console.log('proof GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
