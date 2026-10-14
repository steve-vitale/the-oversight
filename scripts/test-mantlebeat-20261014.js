#!/usr/bin/env node
// scripts/test-mantlebeat-20261014.js — proof for the mantlebeat policy layer.
//
// RED PHASE (gate off = pure delegation): identical seeds, 30 loop-days,
// raw leadcourt vs wrapMantlebeat(leadcourt) with MANTLEBEAT unset —
// semantic telemetry + samples + pacing must be IDENTICAL. Any divergence
// fails: the layer must be invisible when the gate is off.
//
// GREEN PHASE (gate on, MANTLEBEAT=1): a REAL engine succession
// (Game.playerDeath -> the village chooses a successor) must trigger the
// repositioning beat: the wrapped daily runs a rest day instead of the base
// daily (base daily not called, scholar still at haven, no travel, no free
// healing), and the control with the gate off delegates normally.
//
// Node harness rules: loadGame seeds Math.random BEFORE eval (modules
// capture it at load); Game.save is never stubbed; no concurrent jest.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const { wrapMantlebeat } = require('./policies/mantlebeat');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { failures++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

// Semantic signature of the telemetry stream: (day|part|type|who|cause|kind|player)
// per event — wall-clock `t` and kcal/hp floats scrubbed.
function teleSig(Game) {
  const evs = Game.state.telemetry || [];
  return evs.map(e => [
    e.day, e.part, e.type, e.who, e.cause, e.kind, e.player ? 1 : 0,
  ].join('|')).join('\n');
}
function runSig(result) {
  return JSON.stringify({
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    pop: result.samples.pop, pantry: result.samples.pantry,
    knowledge: result.samples.knowledge, deaths: result.samples.deaths,
    trust: result.samples.trust,
    verbs: result.pacing ? result.pacing.meanVerbsPerDay : null,
  });
}

async function run30(policy, seed, mode) {
  const { Game, manifest } = await loadGame({ seed, mode, fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) await policy.setup(Game, ctx);
  const result = await runDays(Game, policy, { days: 30, manifest, sampleEvery: 10 });
  return { sig: teleSig(Game) + '\n@@RUN@@\n' + runSig(result), ctx };
}

async function red() {
  console.log('RED: gate off = pure delegation (identical seeds, 30d)');
  delete process.env.MANTLEBEAT;
  const wrapped = wrapMantlebeat(leadcourt);
  check('wrapped id distinct', wrapped.id === 'leadcourt-mantlebeat', wrapped.id);
  for (const seed of [11, 22]) {
    const a = await run30(leadcourt, seed, 'red-base-' + seed);
    const b = await run30(wrapped, seed, 'red-wrap-' + seed);
    check(`seed ${seed}: telemetry semantic-identical`, a.sig === b.sig,
      a.sig === b.sig ? '' : `lens ${a.sig.length}/${b.sig.length}`);
    check(`seed ${seed}: ctx counters clean`, (b.ctx.mbRestDays || 0) === 0 && (b.ctx.mbSuccessions || 0) === 0,
      JSON.stringify({ r: b.ctx.mbRestDays, s: b.ctx.mbSuccessions }));
  }
}

async function green() {
  console.log('GREEN: real succession triggers the repositioning beat (gate on)');
  process.env.MANTLEBEAT = '1';
  const base = Object.assign({}, leadcourt);
  let baseCalls = 0;
  const origDaily = base.daily;
  base.daily = (G, C) => { baseCalls++; return origDaily(G, C); };
  const wrapped = wrapMantlebeat(base);

  const { Game } = await loadGame({ seed: 11, mode: 'green', fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: wrapped.id, notes: [] };
  await wrapped.setup(Game, ctx);
  const oldBearer = ctx._mbBearer;
  check('setup recorded a bearer', !!oldBearer, String(oldBearer));
  const dayBefore = (Game.state.scholar || {}).day || 0;
  const healthBefore = Game.state.scholar.health;
  const mapBefore = Game.map.px + ',' + Game.map.py;
// REAL succession: the engine kills the Bearer; the village chooses.
  Game.playerDeath('combat');
  const newBearer = (Game.state.scholar || {}).villagerId;
  check('succession happened (bearer changed)', !!newBearer && newBearer !== oldBearer,
    `${oldBearer} -> ${newBearer}`);
  check('successor wakes at haven', Game.state.scholar.insideHaven === true &&
    Game.map.px === (Game.state.village.px ?? 4) && Game.map.py === (Game.state.village.py ?? 4),
    `insideHaven=${Game.state.scholar.insideHaven} map=${Game.map.px},${Game.map.py}`);
  await wrapped.daily(Game, ctx);
  check('succession counted', ctx.mbSuccessions === 1, String(ctx.mbSuccessions));
  check('rest day fired', ctx.mbRestDays === 1, String(ctx.mbRestDays));
  check('rest day logged on the death day', (ctx.mbSuccessionDays || [])[0] === dayBefore,
    JSON.stringify(ctx.mbSuccessionDays));
  check('base daily NOT called on succession day', baseCalls === 0, String(baseCalls));
  check('no travel on the rest day', Game.map.px + ',' + Game.map.py === mapBefore,
    `${mapBefore} -> ${Game.map.px},${Game.map.py}`);
  check('no free healing on the rest day', Game.state.scholar.health === healthBefore,
    `${healthBefore} -> ${Game.state.scholar.health}`);
  check('still at haven after rest day', Game.state.scholar.insideHaven === true);

  // Fight-hook: gate on + rest day, no fight active -> must not crash, must not invent combat.
  let threw = false, r = 'unset';
  try { r = wrapped.fight(Game, ctx); } catch (e) { threw = true; }
  check('fight hook safe with no active fight', !threw && r === false, `r=${r} threw=${threw}`);

  // Control: gate OFF, same forced succession -> pure delegation, no rest day.
  console.log('CONTROL: gate off, same forced succession -> delegation');
  delete process.env.MANTLEBEAT;
  const base2 = Object.assign({}, leadcourt);
  let base2Calls = 0;
  const orig2 = base2.daily;
  base2.daily = (G, C) => { base2Calls++; return orig2(G, C); };
  const wrapped2 = wrapMantlebeat(base2);
  const g2 = (await loadGame({ seed: 11, mode: 'green-ctrl', fullTelemetry: true })).Game;
  await setupGame(g2);
  const ctx2 = { policyId: wrapped2.id, notes: [] };
  await wrapped2.setup(g2, ctx2);
  g2.playerDeath('combat');
  await wrapped2.daily(g2, ctx2);
  check('gate off: base daily delegated', base2Calls === 1, String(base2Calls));
  check('gate off: no rest day', (ctx2.mbRestDays || 0) === 0, String(ctx2.mbRestDays));
  check('gate off: no succession counter', (ctx2.mbSuccessions || 0) === 0, String(ctx2.mbSuccessions));
}

(async () => {
  await red();
  await green();
  console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
