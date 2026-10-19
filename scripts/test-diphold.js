#!/usr/bin/env node
// test-diphold.js — proof for the sim-diphold policy layer (flesh-out loop A, 2026-10-19).
//
// Proves the LAYER (scripts/policies/diphold.js), not the sweep: trigger math,
// arrears-clearing priority, tribute-first ordering, tribfloor interplay, and
// DET self-consistency of the armed composition. The sweep's before/after on
// identical seeds is the effect proof (evidence/2026-10-19/sim-diphold.md).
//
// Fixtures (all deterministic — no RNG, no Date.now):
//   D0 gate-off: DIPHOLD unset -> pure delegation (no payTribute, base.daily x1)
//   D1 arrears-clearing: arrears>0 -> payTribute(linkId, owed+arrears), honest books
//   D2 pre-settlement: unpaid with settlement <=2d -> early full-week pay
//   D3 no trigger: paid week, trust 100, arrears 0 -> no payment
//   D4 ordering: the discipline pays BEFORE the base daily sees the pantry
//   D5 tribfloor interplay: under withTribFloor the layer's request is floor-capped
//   D6 wiring: probe policyFor('belongfeast-dh') builds with the right id/daily
//   D7 DET: armed composition byte-identical across reruns (2 seeds x 2)
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const DH = require('./policies/diphold.js');
const TF = require('./policies/tribfloor.js');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) { saved[k] = process.env[k]; process.env[k] = env[k]; }
  try { return fn(); } finally {
    for (const k of Object.keys(env)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
  }
}

function fakeLink(o) {
  return Object.assign({
    id: 'link1', status: 'active', subordinate: 'haven', primary: 'thornfield', kind: null,
    tributeKcalPerWeek: 7500, arrears: 0, trust: 100, day: 10,
    tributePaidWeek: -1, tributeWeek: -1, tributePaidKcal: 0,
  }, o);
}
function fakeGame(day, link, pantryUnits) {
  const calls = [];
  return {
    state: { scholar: { day }, village: { pantry: [{ kcalEach: 1000, units: pantryUnits }] } },
    hierarchyState: () => (link ? [link] : []),
    payTribute: (id, kcal) => { calls.push(['payTribute', id, kcal]); return kcal; },
    say: (s) => { calls.push(['say', String(s).slice(0, 60)]); },
    _week: () => Math.floor(day / 7),
    calls,
  };
}
function baseReturning(tag) {
  return { id: 'base', daily(G, ctx) { ctx.baseDailyCalls = (ctx.baseDailyCalls | 0) + 1; ctx.baseSawPantry = DH.pantryKcal(G); return tag; } };
}

// D0: gate-off = pure delegation
withEnv({ DIPHOLD: undefined }, () => {
  delete process.env.DIPHOLD;
  const G = fakeGame(100, fakeLink({ arrears: 5000 }), 50);
  const ctx = {};
  const p = DH.withDipHold(baseReturning('r'), 't', 'd');
  const r = p.daily(G, ctx);
  ok('D0 gate-off delegates (no payTribute)', G.calls.filter(c => c[0] === 'payTribute').length === 0 && ctx.baseDailyCalls === 1 && r === 'r');
});

// D1: arrears-clearing fires with the honest total (owed + arrears)
withEnv({ DIPHOLD: '1' }, () => {
  const G = fakeGame(100, fakeLink({ arrears: 5000 }), 50);
  const ctx = {};
  DH.withDipHold(baseReturning('r'), 't', 'd').daily(G, ctx);
  const pays = G.calls.filter(c => c[0] === 'payTribute');
  ok('D1 arrears-clear pays owed+arrears (12500)', pays.length === 1 && pays[0][2] === 12500, JSON.stringify(pays));
  ok('D1 says the priority aloud', G.calls.some(c => c[0] === 'say' && /books come first/.test(c[1])));
  ok('D1 ctx counts the clear', ctx.dhArrearsClears === 1);
});

// D2: pre-settlement early pay (day 96: week 13, settlement in 2 days)
withEnv({ DIPHOLD: '1' }, () => {
  const G = fakeGame(96, fakeLink({}), 50);
  const ctx = {};
  DH.withDipHold(baseReturning('r'), 't', 'd').daily(G, ctx);
  const pays = G.calls.filter(c => c[0] === 'payTribute');
  ok('D2 pre-settlement pays the week early (7500)', pays.length === 1 && pays[0][2] === 7500, JSON.stringify(pays));
  ok('D2 ctx counts the early pay', ctx.dhEarlyPays === 1);
});

// D3: no trigger -> no payment
withEnv({ DIPHOLD: '1' }, () => {
  const G = fakeGame(90, fakeLink({ tributePaidWeek: 12 }), 50); // week 12 paid
  const ctx = {};
  DH.withDipHold(baseReturning('r'), 't', 'd').daily(G, ctx);
  ok('D3 paid week stays quiet', G.calls.filter(c => c[0] === 'payTribute').length === 0 && (ctx.dhArrearsClears | 0) === 0);
});

// D4: tribute-first ordering — the base daily sees the post-payment pantry
withEnv({ DIPHOLD: '1' }, () => {
  const link = fakeLink({ arrears: 5000 });
  const G = fakeGame(100, link, 50); // 50,000 kcal
  const realPay = G.payTribute;
  G.payTribute = (id, kcal) => { // engine-honest fake: debit the pantry
    G.state.village.pantry[0].units = Math.max(0, G.state.village.pantry[0].units - Math.ceil(kcal / 1000));
    return realPay(id, kcal);
  };
  const ctx = {};
  DH.withDipHold(baseReturning('r'), 't', 'd').daily(G, ctx);
  // engine-honest whole units: 12,500 kcal -> 13 whole 1,000-kcal units = 13,000 removed
  ok('D4 base sees pantry AFTER the tribute payment', ctx.baseSawPantry === 50000 - 13000, 'saw ' + ctx.baseSawPantry);
});

// D5: tribfloor interplay — under withTribFloor the layer's request is capped at the floor
withEnv({ DIPHOLD: '1', TRIBFLOOR: '1' }, () => {
  const link = fakeLink({ arrears: 5000 });
  const G = fakeGame(100, link, 8); // 8,000 kcal pantry, ~24k burn floor -> binds
  G.state.village.burnHistory = [24000, 24000, 24000, 24000, 24000, 24000, 24000];
  const underlying = [];
  const basePay = G.payTribute;
  G.payTribute = (id, kcal) => { underlying.push(kcal); return basePay(id, kcal); };
  const ctx = {};
  const inner = DH.withDipHold(baseReturning('r'), 'inner', 'd');
  TF.withTribFloor(inner, 't', 'd').daily(G, ctx);
  ok('D5 floor binds: underlying gets < requested 12500', underlying.length >= 1 && underlying[0] < 12500, JSON.stringify(underlying));
  ok('D5 no throw, base still ran', ctx.baseDailyCalls === 1);
});

// D6: probe wiring (the probe module guards on the substrate env at require
// time — set it before requiring)
const SUBSTRATE_ENV = {
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
  WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', NODEWITNESS: '1', KILLDISC: '1',
  DIPHOLD: '1',
};
let probe = null;
withEnv(SUBSTRATE_ENV, () => { probe = require('./probe-diphold-20261019.js'); });
{
  const p = probe.policyFor('belongfeast-dh');
  // note: the outer RP/WD/SD wrappers relabel the id ('belong-dh-windefer');
  // the sweep's policyId label ('belongfeast-dh') is what the analyzer uses.
  ok('D6 armed policy builds (belong-dh composition)', p && /belong-dh/.test(p.id) && typeof p.daily === 'function', p && p.id);
  const c = probe.policyFor('belongfeast');
  ok('D6 control policy builds (belong composition)', c && /belong-windefer/.test(c.id) && typeof c.daily === 'function', c && c.id);
}

// D7: DET — armed composition byte-identical across reruns (probe's own det gate, armed only)
{
  const env = Object.assign({}, process.env, SUBSTRATE_ENV, { ONLY: 'belongfeast-dh', SEEDS: '64201,64207' });
  // armed-only DET: 2 seeds x 2 runs -> 'DET: 2/2'
  // (the control side is pinned by the FIDELITY gate vs the seasonblock corpus)
  try {
    const out = execFileSync('node', [path.join(__dirname, 'probe-diphold-20261019.js'), 'det'],
      { env, encoding: 'utf8', timeout: 600000 });
    ok('D7 DET armed 2/2 byte-identical', /DET: 2\/2/.test(out), out.trim().split('\n').slice(-2).join(' | '));
  } catch (e) {
    ok('D7 DET armed 4/4 byte-identical', false, String((e.stdout || '') + (e.message || '')).slice(0, 300));
  }
}

console.log(`\ntest-diphold: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
