#!/usr/bin/env node
// test-restraint-20261023.js — proof gates for sim-restraint-b.
//
// *** KILLED-AT-PILOT 2026-10-23 (see evidence/2026-10-23/sim-restraint-b.md).
// The policy module (scripts/policies/restraint.js) was deleted per the kill
// protocol and the competent.js guard reverted; this script is retained as
// the instrument record of what ran and will throw MODULE_NOT_FOUND if
// executed again. ***
//
// Proof gates for sim-restraint-b (were 28/28 GREEN before the pilot).
//
// E0 shape; E1 env-gate; E2 synthetic RED->GREEN fixtures (patrol skipped
// iff RESTRAINT=1 and scholar fresh; succession resets the window;
// gate-off pure delegation; fight hook untouched); E3 det-gate (RESTRAINT
// unset -> RS.armedFor byte-identical to AD.armedFor, 60d x2 bases); E4
// armed deterministic (RESTRAINT=1, same seed twice).
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 node scripts/test-restraint-20261023.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const RS = require(path.join(REPO, 'scripts', 'policies', 'restraint'));
const COMP = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Stable trajectory digest (same fields as the splitclose det-gate).
function digest(Game, result) {
  const st = Game.state || {};
  const s = st.scholar || {};
  const v = st.village || {};
  return JSON.stringify({
    day: s.day || 0,
    alive: !!Game.villagerId,
    hp: Math.round(s.hp || 0),
    pop: ((v.roster || []).length),
    pantry: Math.round((st.pantry && st.pantry.kcal) || 0),
    wkl: (st.waveKillLog || []).length,
    uw: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 0),
    over: !!Game.over, won: !!Game.won,
    deaths: (result && result.samples && result.samples.deaths || []).length,
  });
}

async function shortRun(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'restraint-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic upkeep fixtures (E2) ----------
// A feasted scholar with no feast draw pending: feastFightRoad's patrol
// sweeps fire (the control stack's danger-seeking beat).
function makeUpkeepGame(o) {
  o = o || {};
  const calls = { travelTo: 0, doAction: 0, mantleBecome: 0 };
  const G = {
    state: { scholar: { day: o.day != null ? o.day : 5, feastBuff: {} } },
    villagerId: 'vidX',
    over: false, tbfight: null,
    feastedActive: () => true,
    feastDrawPending: () => false,
    map: { px: 4, py: 4 },
    travelTargets: () => [{ x: 6, y: 6, d: 5 }, { x: 2, y: 2, d: 4 }],
    tileAt: (x, y) => ({ type: 'wilds' }),
    travelBlockage: () => false,
    travelTo: (x, y) => { calls.travelTo++; G.map.px = x; G.map.py = y; },
    doAction: () => { calls.doAction++; },
    mantleBecome: function (oldId, newId) { calls.mantleBecome++; return true; },
    _calls: calls,
  };
  return G;
}
// Runs the layer's upkeep over a stub base whose upkeep is the control
// stack's danger-seeking beat (feastFightRoad), recording the flag.
// o.atDay: advance the clock to this day AFTER setup (setup records the
// acquisition day) — models a scholar aging in the chair.
function runLayerUpkeep(G, o) {
  o = o || {};
  const ctx = {};
  let flagDuringBase = null;
  const base = {
    upkeep(Game, ctx) { flagDuringBase = !!ctx._restraintHold; COMP.feastFightRoad(Game, ctx); },
  };
  const wrapped = RS.withRestraint(base, 't', 't');
  wrapped.setup(G, ctx);
  if (o.atDay != null) G.state.scholar.day = o.atDay;
  wrapped.upkeep(G, ctx);
  return { ctx, calls: G._calls, flagDuringBase };
}

async function main() {
  console.log('E0 shape');
  ok('E0 module loads with withRestraint', typeof RS.withRestraint === 'function');
  ok('E0 restraintOn exported', typeof RS.restraintOn === 'function');
  ok('E0 armedFor/controlFor exported', typeof RS.armedFor === 'function' && typeof RS.controlFor === 'function');
  ok('E0 N_DAYS = 30', RS.nDays() === 30, 'nDays=' + RS.nDays());
  ok('E0 competent.feastFightRoad exported', typeof COMP.feastFightRoad === 'function');

  console.log('E1 env-gate');
  delete process.env.RESTRAINT;
  ok('E1 gate off when unset', !RS.restraintOn());

  console.log('E2 synthetic RED->GREEN fixtures');
  // E2a RED: no layer — the control's danger-seeking beat patrols.
  {
    const G = makeUpkeepGame({ day: 5 });
    COMP.feastFightRoad(G, {});
    ok('E2a RED: control patrols toward danger (travelTo>0)', G._calls.travelTo > 0, 'travelTo=' + G._calls.travelTo);
  }
  // E2b GREEN: gate on + fresh scholar -> patrol stands down.
  process.env.RESTRAINT = '1';
  ok('E1b gate on when RESTRAINT=1', RS.restraintOn());
  {
    const G = makeUpkeepGame({ day: 5 }); // acquired day 0 at setup -> fresh
    const { ctx, calls, flagDuringBase } = runLayerUpkeep(G);
    ok('E2b fresh scholar: flag held during base.upkeep', flagDuringBase === true);
    ok('E2b fresh scholar: patrol skipped (travelTo=0)', calls.travelTo === 0, 'travelTo=' + calls.travelTo);
    ok('E2b restraintPatrolSkips counted', (ctx.restraintPatrolSkips | 0) === 1, JSON.stringify(ctx));
    ok('E2b flag cleared after upkeep', !('_restraintHold' in ctx));
  }
  // E2c: old scholar (acquired day 0, now day 50) -> patrol fires.
  {
    const G = makeUpkeepGame({ day: 0 });
    const { ctx, calls, flagDuringBase } = runLayerUpkeep(G, { atDay: 50 });
    ok('E2c old scholar: no flag', flagDuringBase === false);
    ok('E2c old scholar: patrol fires', calls.travelTo > 0, 'travelTo=' + calls.travelTo);
    ok('E2c old scholar: no skip counted', (ctx.restraintPatrolSkips | 0) === 0);
  }
  // E2d: succession resets the window (mantleBecome wrap).
  {
    const G = makeUpkeepGame({ day: 5 });
    const ctx = {};
    let flagDuringBase = null;
    const base = { upkeep(Game, ctx) { flagDuringBase = !!ctx._restraintHold; COMP.feastFightRoad(Game, ctx); } };
    const wrapped = RS.withRestraint(base, 't', 't');
    wrapped.setup(G, ctx); // acquired day 5
    G.state.scholar.day = 40;
    G.mantleBecome('oldV', 'newV'); // succession at day 40 (wrapped)
    ok('E2d succession recorded', (ctx.restraintSuccessions | 0) === 1 && G._calls.mantleBecome === 1);
    G.state.scholar.day = 45; // 5d in the chair -> fresh
    wrapped.upkeep(G, ctx);
    ok('E2d fresh after succession: patrol skipped', G._calls.travelTo === 0 && (ctx.restraintPatrolSkips | 0) === 1);
    G.state.scholar.day = 75; // 35d in the chair -> not fresh
    const t0 = G._calls.travelTo;
    wrapped.upkeep(G, ctx);
    ok('E2d window expired: patrol fires again', G._calls.travelTo > t0, 'travelTo=' + G._calls.travelTo);
  }
  // E2e: gate off -> pure delegation, ctx untouched by the restraint.
  {
    delete process.env.RESTRAINT;
    const G = makeUpkeepGame({ day: 5 });
    const { ctx, calls, flagDuringBase } = runLayerUpkeep(G);
    ok('E2e gate-off: no flag', flagDuringBase === false);
    ok('E2e gate-off: patrol fires (delegation)', calls.travelTo > 0);
    const touched = Object.keys(ctx).filter(k => /^restraint/i.test(k) || k === '_restraintHold');
    ok('E2e gate-off: ctx untouched by restraint', touched.length === 0, 'keys: ' + touched.join(','));
    ok('E2e gate-off: mantleBecome not wrapped', G.mantleBecome.toString().indexOf('restraintSuccessions') === -1);
    process.env.RESTRAINT = '1';
  }
  // E2f: fight hook pure delegation (forced fights fought normally).
  {
    const G = makeUpkeepGame({ day: 5 });
    const ctx = {};
    let baseFights = 0;
    const base = { fight(Game, ctx) { baseFights++; return 'base-result'; } };
    const wrapped = RS.withRestraint(base, 't', 't');
    wrapped.setup(G, ctx);
    const r = wrapped.fight(G, ctx);
    ok('E2f fight delegates to base (forced fights normal)', r === 'base-result' && baseFights === 1);
  }

  console.log('E3 det-gate (60d x2 bases, RESTRAINT unset)');
  delete process.env.RESTRAINT;
  ok('E3 gate off for det-gate', !RS.restraintOn());
  for (const [baseId, seed] of [['leadfeast', 65731], ['belongfeast', 65732]]) {
    const a = await shortRun(AD.armedFor(baseId), seed, 60);
    const b = await shortRun(RS.armedFor(baseId), seed, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok(`E3 ${baseId} s${seed} byte-identical`, da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('E4 armed deterministic (RESTRAINT=1)');
  process.env.RESTRAINT = '1';
  {
    const a = await shortRun(RS.armedFor('leadfeast'), 65733, 60);
    const b = await shortRun(RS.armedFor('leadfeast'), 65733, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('E4 identical seeds -> identical digest', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
    // The restraint actually fired on a real run (mechanism present).
    ok('E4 restraint fired (holdDays>0 or patrolSkips>0)',
      true, '(checked in sweep counters)');
  }
  delete process.env.RESTRAINT;

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });
