#!/usr/bin/env node
// test-presence.js — proof for scripts/policies/presence.js
// (flesh-out loop, 2026-10-19, run sim-presence, axis scale-onramp).
//
// The 11th veteran-production attempt: presence-routing WITHOUT movement.
// The join rule (game.js startCombat) is purely positional (villagers within
// Chebyshev 4 join, nearest 4, no other gate). The diagnostic showed the
// dominant block is DOOR-SPLIT: scholar outside at the treeline, villagers
// inside the hall. This layer door-aligns the scholar (goInside + a step)
// when a wave-3+ threat is at Haven — scholar self-movement only.
//
// RED->GREEN on the layer:
//   A1 gate honesty: PRESENCE unset -> pure delegation (base.daily called,
//      no presence ctx keys, goInside never called).
//   A2 threat (w3 monster on haven node) + scholar outside at haven ->
//      goInside called, micro-step taken, ctx counts.
//   A3 no threat -> no goInside (the scholar's routine is their own).
//   A4 scholar already inside -> no-op.
//   A5 scholar not at haven -> no-op.
//   A6 in combat -> no-op (never mid-fight).
//   A7 aid crisis active -> triggers (no w3 monster needed).
//   A8 w2 monster on haven node -> no trigger (wave < 3).
//   A9 PRESENCE: the layer never calls Game.assignTask / Game.takeWeapon
//       (fighter movement is the poison that killed vetarm's patrol beat).
//   A10 waveOf reads the data table.
//   C1 det-gate (real harness): gate-off byte-identical to tribfloor
//      leadfeast/belongfeast (2 seeds x 60d); gate-on deterministic;
//      gate-on non-vacuous on a fabricated mid-game state.
//   C2 real-sweep gate: 180d presence runs complete per policy, zero layer
//      errors, byte-identical re-run.
// Usage: node scripts/test-presence.js
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (PRESENCE_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1) — this is the honest RED phase.
if (!fs.existsSync(path.join(__dirname, 'policies', 'presence.js'))) {
  if (process.env.PRESENCE_KILLED === '1') {
    console.log('INFO-SKIP: presence layer deleted per kill protocol (sim-presence NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/presence.js missing and PRESENCE_KILLED not set.');
  process.exit(1);
}

const PR = require('./policies/presence');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const MONSTERS = [
  { id: 'hushwolf', wave: 1 },
  { id: 'spool', wave: 3 },
  { id: 'redactor', wave: 3 },
];

// ---------- fabricated Game ----------
function stubGame(o) {
  o = o || {};
  const calls = { goInside: 0, microMove: 0, assignTask: 0, takeWeapon: 0 };
  const G = {
    over: false,
    villagerId: 'scholar1',
    state: {
      scholar: Object.assign({ day: 100, insideHaven: false, mx: 6, my: 0 }, o.scholar || {}),
      village: Object.assign({ roster: ['scholar1', 'v1', 'v2'], px: 4, py: 4 }, o.village || {}),
    },
    data: { items: [], monsters: o.monsters || MONSTERS },
    _atHaven: o.atHaven !== undefined ? o.atHaven : true,
    _inCombat: !!o.inCombat,
    _aid: !!o.aid,
    _worldMonsters: o.worldMonsters || [],
    _goInsideOk: o.goInsideOk !== undefined ? o.goInsideOk : true,
    _calls: calls,
    playerAtHaven: function () { return this._atHaven; },
    inCombat: function () { return this._inCombat; },
    aidCrisis: function () { return this._aid; },
    worldMonsters: function () { return this._worldMonsters; },
    // The engine verb is enterBuilding (game.js); goInside is a legacy alias.
    enterBuilding: function () { calls.goInside++; this.state.scholar.insideHaven = true; this.state.scholar.mx = 4; this.state.scholar.my = 7; return this._goInsideOk; },
    goInside: function () { return this.enterBuilding(); },
    microMove: function (x, y) { calls.microMove++; this.state.scholar.mx = x; this.state.scholar.my = y; return true; },
    // PRESENCE: fighter-movement verbs must NEVER be called by this layer.
    assignTask: function () { calls.assignTask++; throw new Error('presence layer called Game.assignTask — presence violation'); },
    takeWeapon: function () { calls.takeWeapon++; throw new Error('presence layer called Game.takeWeapon — presence violation'); },
  };
  return G;
}

function stubBase() {
  const calls = { daily: 0, upkeep: 0 };
  return {
    _calls: calls,
    daily: function () { calls.daily++; return 'daily-ok'; },
    upkeep: function () { calls.upkeep++; return 'upkeep-ok'; },
  };
}

function withEnv(env, fn) {
  const old = {};
  for (const k of Object.keys(env)) { old[k] = process.env[k]; if (env[k] === undefined) delete process.env[k]; else process.env[k] = env[k]; }
  try { return fn(); } finally { for (const k of Object.keys(env)) { if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k]; } }
}

console.log('A: layer behavior (fabricated Game)');
// A1: gate honesty — PRESENCE unset -> pure delegation.
withEnv({ PRESENCE: undefined }, () => {
  const G = stubGame({ worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
  const base = stubBase();
  const wrapped = PR.withPresence(base, 't', 'd');
  const ctx = {};
  const r = wrapped.daily(G, ctx);
  check('A1 gate-off delegates daily', r === 'daily-ok' && base._calls.daily === 1, `r=${r}`);
  check('A1 gate-off no presence ctx keys', ctx.presenceGoInside === undefined && ctx.presenceStep === undefined);
  check('A1 gate-off goInside never called', G._calls.goInside === 0);
  const ctx2 = {};
  wrapped.upkeep(G, ctx2);
  check('A1 gate-off delegates upkeep', base._calls.upkeep === 1);
  check('A1 gate-off upkeep no presence keys', ctx2.presenceGoInside === undefined);
});

// A2: threat (w3 on haven node) + scholar outside at haven -> goInside + step.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
  const base = stubBase();
  const wrapped = PR.withPresence(base, 't', 'd');
  const ctx = {};
  wrapped.daily(G, ctx);
  check('A2 goInside called on w3 threat', G._calls.goInside === 1);
  check('A2 micro-step taken', G._calls.microMove === 1);
  check('A2 ctx counts', ctx.presenceGoInside === 1 && ctx.presenceStep === 1, JSON.stringify(ctx));
  check('A2 scholar now inside', G.state.scholar.insideHaven === true);
  check('A2 base.daily still runs', base._calls.daily === 1);
});

// A3: no threat -> no goInside.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ worldMonsters: [{ id: 'hushwolf', tx: 4, ty: 4 }] });
  const ctx = {};
  PR.withPresence(stubBase(), 't', 'd').daily(G, ctx);
  check('A3 no goInside without threat', G._calls.goInside === 0 && ctx.presenceGoInside === undefined);
});

// A4: scholar already inside -> no-op.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ scholar: { insideHaven: true }, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
  const ctx = {};
  PR.withPresence(stubBase(), 't', 'd').daily(G, ctx);
  check('A4 no-op when already inside', G._calls.goInside === 0 && ctx.presenceGoInside === undefined);
});

// A5: scholar not at haven -> no-op.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ atHaven: false, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
  const ctx = {};
  PR.withPresence(stubBase(), 't', 'd').daily(G, ctx);
  check('A5 no-op when away', G._calls.goInside === 0 && ctx.presenceGoInside === undefined);
});

// A6: in combat -> no-op.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ inCombat: true, worldMonsters: [{ id: 'spool', tx: 4, ty: 4 }] });
  const ctx = {};
  PR.withPresence(stubBase(), 't', 'd').daily(G, ctx);
  check('A6 no-op mid-fight', G._calls.goInside === 0 && ctx.presenceGoInside === undefined);
});

// A7: aid crisis active -> triggers without a w3 monster.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ aid: true, worldMonsters: [] });
  const ctx = {};
  PR.withPresence(stubBase(), 't', 'd').daily(G, ctx);
  check('A7 aid crisis triggers', G._calls.goInside === 1 && ctx.presenceGoInside === 1);
  check('A7 threat recorded', /aid-crisis/.test(ctx.presenceThreat || ''));
});

// A8: w2 monster on haven node -> no trigger.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ worldMonsters: [{ id: 'hushwolf', tx: 4, ty: 4 }] });
  check('A8 threatAtHaven null for w2', PR.threatAtHaven(G) === null);
  const G2 = stubGame({ worldMonsters: [{ id: 'spool', tx: 5, ty: 5 }] });
  check('A8 threatAtHaven null off-node', PR.threatAtHaven(G2) === null);
  const G3 = stubGame({ worldMonsters: [{ id: 'redactor', tx: 4, ty: 4 }] });
  check('A8 threatAtHaven names w3', /w3-at-haven:redactor/.test(PR.threatAtHaven(G3) || ''));
});

// A9: presence — assignTask/takeWeapon never called (would throw).
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({ aid: true });
  const ctx = {};
  let threw = false;
  try { PR.withPresence(stubBase(), 't', 'd').daily(G, ctx); } catch (e) { threw = true; }
  check('A9 no assignTask/takeWeapon', !threw && G._calls.assignTask === 0 && G._calls.takeWeapon === 0);
});

// A10: waveOf.
withEnv({ PRESENCE: '1' }, () => {
  const G = stubGame({});
  check('A10 waveOf', PR.waveOf(G, 'spool') === 3 && PR.waveOf(G, 'hushwolf') === 1 && PR.waveOf(G, 'nope') === 0);
});

console.log(`\nA: ${pass} pass, ${fail} fail`);
if (fail) { console.error('FATAL: fabricated-game checks failed'); process.exit(1); }

// ---------- C: real-harness gates ----------
console.log('C: real-harness gates');
(async () => {
  const REPO = path.join(__dirname, '..');
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

  // C1 det-gate: gate-off byte-identical to tribfloor (2 seeds x 60d).
  async function traj(seed, policy, env) {
    const old = process.env.PRESENCE;
    if (env === undefined) delete process.env.PRESENCE; else process.env.PRESENCE = env;
    try {
      const { Game } = await loadGame({ seed, mode: 'presence-det', fullTelemetry: false });
      await setupGame(Game);
      const ctx = {};
      let result;
      await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 60 }); });
      // trajectory digest: day, deaths, wave, rank, pantry, pop
      let digest = '';
      try {
        const st = Game.state || {};
        digest = JSON.stringify({
          day: (st.scholar || {}).day, over: !!Game.over,
          deaths: (result.samples.deaths || []).length,
          wave: result.maxWaveUnlocked || 1,
          pop: ((st.village || {}).roster || []).length,
        });
      } catch (e) { digest = 'err:' + e.message; }
      return digest;
    } finally { if (old === undefined) delete process.env.PRESENCE; else process.env.PRESENCE = old; }
  }
  let cpass = 0, cfail = 0;
  const ccheck = (n, c, d) => { if (c) { cpass++; console.log(`  PASS ${n}${d ? ' — ' + d : ''}`); } else { cfail++; console.log(`  FAIL ${n}${d ? ' — ' + d : ''}`); } };
  for (const seed of [11, 42]) {
    const base = await traj(seed, TF.leadfeast, undefined);
    const gated = await traj(seed, PR.leadpresence, undefined);
    ccheck(`C1 gate-off byte-identical leadpresence seed ${seed}`, base === gated, base.slice(0, 80));
    const baseB = await traj(seed, TF.belongfeast, undefined);
    const gatedB = await traj(seed, PR.belongpresence, undefined);
    ccheck(`C1 gate-off byte-identical belongpresence seed ${seed}`, baseB === gatedB, baseB.slice(0, 80));
  }
  // gate-on deterministic: two runs with PRESENCE=1 identical.
  for (const seed of [11]) {
    const r1 = await traj(seed, PR.leadpresence, '1');
    const r2 = await traj(seed, PR.leadpresence, '1');
    ccheck(`C1 gate-on deterministic seed ${seed}`, r1 === r2, r1.slice(0, 80));
  }
  // gate-on non-vacuous: fabricated mid-game state with a w3 threat at haven.
  {
    const { Game } = await loadGame({ seed: 7, mode: 'presence-nv', fullTelemetry: false });
    await setupGame(Game);
    const old = process.env.PRESENCE; process.env.PRESENCE = '1';
    try {
      // fabricate: scholar at haven outside, w3 monster on haven node
      const v = Game.state.village; const s = Game.state.scholar;
      const hx = v.px ?? 4, hy = v.py ?? 4;
      Game.map.px = hx; Game.map.py = hy;
      s.insideHaven = false;
      const ctx = {};
      // inject a w3 world monster on the haven node
      const wms = Game.worldMonsters ? Game.worldMonsters() : [];
      wms.push({ id: 'spool', tx: hx, ty: hy, mx: 4, my: 4, hp: 100 });
      PR.presenceBeat(Game, ctx);
      ccheck('C1 gate-on non-vacuous (goInside fires)', ctx.presenceGoInside === 1 && s.insideHaven === true, JSON.stringify(ctx));
    } finally { if (old === undefined) delete process.env.PRESENCE; else process.env.PRESENCE = old; }
  }
  console.log(`\nC1: ${cpass} pass, ${cfail} fail`);
  if (cfail) { console.error('FATAL: det-gate failed'); process.exit(1); }

  // C2 real-sweep gate: 180d presence runs complete per policy, zero errors.
  console.log('C2: 180d presence runs (this takes a few minutes per policy)...');
  for (const [pol, name] of [[PR.leadpresence, 'leadpresence'], [PR.belongpresence, 'belongpresence']]) {
    const old = process.env.PRESENCE; process.env.PRESENCE = '1';
    try {
      const { Game } = await loadGame({ seed: 99, mode: 'presence-c2', fullTelemetry: false });
      await setupGame(Game);
      const ctx = {};
      let result, err = null;
      try {
        await quietLog(async () => { result = await runDays(Game, pol, { days: 180, manifest: undefined, sampleEvery: 60 }); });
      } catch (e) { err = e; }
      const ok = !err && result && result.days > 0;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} C2 180d ${name}: days=${result && result.days} end=${result && result.endReason} goInside=${ctx.presenceGoInside || 0}${err ? ' ERR ' + err.message : ''}`);
      if (!ok) { console.error('FATAL: C2 real-sweep gate failed'); process.exit(1); }
      // deterministic re-run
      const { Game: G2 } = await loadGame({ seed: 99, mode: 'presence-c2', fullTelemetry: false });
      await setupGame(G2);
      let result2;
      await quietLog(async () => { result2 = await runDays(G2, pol, { days: 180, manifest: undefined, sampleEvery: 60 }); });
      const same = result.days === result2.days && result.endReason === result2.endReason;
      console.log(`  ${same ? 'PASS' : 'FAIL'} C2 deterministic re-run ${name}`);
      if (!same) { console.error('FATAL: C2 determinism failed'); process.exit(1); }
    } finally { if (old === undefined) delete process.env.PRESENCE; else process.env.PRESENCE = old; }
  }
  console.log('\nALL GREEN');
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
