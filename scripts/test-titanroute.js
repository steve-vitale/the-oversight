#!/usr/bin/env node
// test-titanroute.js — unit proof for scripts/policies/titanroute.js
// (sim-titanroute-a). Synthetic stub Game only; no harness load, no RNG.
// Proves the prereg's policy claims:
//   1. march targets the HEARD lair tile only, never a roster position;
//   2. the policy never reads Game.worldMonsters() (perception law);
//   3. no heard lair => no march, byte-identical to base;
//   4. the call sounds at most once per run;
//   5. guardrails block a starving/dehydrated/wounded march;
//   6. a slain titan => no march, no call.
'use strict';
const { withTitanRoute } = require('./policies/titanroute');

let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log('PASS ' + name); }
  else { failures++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

function stubGame(opts) {
  opts = opts || {};
  const G = {
    state: { scholar: { day: opts.day || 130, kcal: opts.kcal != null ? opts.kcal : 1800,
      hydration: opts.hydration != null ? opts.hydration : 80,
      // Real Game shape: scholar HP lives in `health`, not `hp`
      // (competent reads s.hp || s.health). Stubs use health only
      // unless the case explicitly passes hp.
      health: opts.health != null ? opts.health : (opts.hp != null ? opts.hp : 100),
      maxHp: 100 },
      titans: { slain: opts.slain ? { herald: true } : {} } },
    map: { px: opts.px != null ? opts.px : 4, py: opts.py != null ? opts.py : 4 },
    over: false, tbfight: null,
    sayCalls: [],
    travelCalls: [],
    rosterReads: 0,
    callCount: 0,
    say(s) { this.sayCalls.push(s); },
    kcalCap() { return 2000; },
    travelTargets() {
      // Engine-offered steps: orthogonal neighbors within the 9x9 map.
      const out = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = this.map.px + dx, y = this.map.py + dy;
        if (x >= 0 && y >= 0 && x < 9 && y < 9) out.push({ x: x, y: y });
      }
      return out;
    },
    travelTo(x, y) { this.travelCalls.push([x, y]); this.map.px = x; this.map.py = y; },
    worldMonsters() { this.rosterReads++; return [{ id: 'herald', tx: 0, ty: 0 }]; },
    playerMonster() { return null; },
    titanMusterState() { return null; },
    soundTitanCall(id) { this.callCount++; return { allies: [] }; },
  };
  return G;
}

function runDaily(G, policy, ctx) {
  policy.setup(G, ctx);
  return policy.daily(G, ctx);
}

// 1+2: heard lair 7,4; roster says herald at 0,0 (a decoy). March must
// end at 7,4, never touch the roster.
{
  const G = stubGame({});
  const ctx = {};
  const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
  policy.setup(G, ctx);
  G.say('🗺️ Scouts found its lair — tile 7,4. THE HERALD — it waits. Sound the call.');
  policy.daily(G, ctx);
  check('march ends at heard lair 7,4', G.map.px === 7 && G.map.py === 4, G.map);
  check('march never reads the roster', G.rosterReads === 0, G.rosterReads);
  check('march never targets roster tile 0,0', !G.travelCalls.some(c => c[0] === 0 && c[1] === 0), G.travelCalls);
  check('call sounded once on arrival', G.callCount === 1, G.callCount);
  check('marches recorded', (ctx.titan.marches || []).length === 1 && ctx.titan.marches[0].arrived === true, ctx.titan.marches);
}
// 3: no heard lair => no march, no call.
{
  const G = stubGame({});
  const ctx = {};
  const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
  runDaily(G, policy, ctx);
  check('no lair => no march', G.travelCalls.length === 0, G.travelCalls);
  check('no lair => no call', G.callCount === 0, G.callCount);
  check('no lair => scholar unmoved', G.map.px === 4 && G.map.py === 4, G.map);
}
// 4: call sounds at most once across repeated lair nights.
{
  const G = stubGame({});
  const ctx = {};
  const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
  policy.setup(G, ctx);
  G.say('Scouts found its lair — tile 5,4.');
  policy.daily(G, ctx); // marches 4,4 -> 5,4, calls
  G.map.px = 4; G.map.py = 4; // next night: march again
  policy.daily(G, ctx);
  policy.daily(G, ctx); // already there: no re-call
  check('call sounds at most once', G.callCount === 1, G.callCount);
}
// 5: guardrails block starving / dehydrated / wounded marches.
{
  for (const [nm, o] of [['starving', { kcal: 500 }], ['dehydrated', { hydration: 10 }], ['wounded', { hp: 30 }]]) {
    const G = stubGame(o);
    const ctx = {};
    const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
    policy.setup(G, ctx);
    G.say('Scouts found its lair — tile 7,4.');
    policy.daily(G, ctx);
    check('guardrail blocks ' + nm + ' march', G.travelCalls.length === 0, G.travelCalls);
    check('guardrail blocks ' + nm + ' call', G.callCount === 0, G.callCount);
  }
}
// 6: slain titan => no march, no call.
{
  const G = stubGame({ slain: true });
  const ctx = {};
  const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
  policy.setup(G, ctx);
  G.say('Scouts found its lair — tile 7,4.');
  policy.daily(G, ctx);
  check('slain => no march', G.travelCalls.length === 0, G.travelCalls);
  check('slain => no call', G.callCount === 0, G.callCount);
}
// 7: preexisting muster => march still happens, call not re-sounded.
{
  const G = stubGame({});
  G.titanMusterState = function () { return { allies: [] }; };
  const ctx = {};
  const policy = withTitanRoute({ daily() {}, setup() {} }, 't', 't');
  policy.setup(G, ctx);
  G.say('Scouts found its lair — tile 7,4.');
  policy.daily(G, ctx);
  check('preexisting muster => march still happens', G.map.px === 7 && G.map.py === 4, G.map);
  check('preexisting muster => no re-sound', G.callCount === 0, G.callCount);
}

console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
