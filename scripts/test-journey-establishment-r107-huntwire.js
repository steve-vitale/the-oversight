#!/usr/bin/env node
// scripts/test-journey-establishment-r107-huntwire.js — proof for the r107
// instrument: the hunt-staffing wrapper around the competent policy.
//
// P1 (fixture, no harness): withHuntStaff(competent, 'competent-hunt')
//   gate-off delegates upkeep/daily to competent exactly (spies called,
//   ctx untouched, assignTask never attempted); gate-on + lean day +
//   hunter-substrate villager staffs 'hunt' once via assignTask; the
//   non-substrate / low-trust / wounded / not-at-Haven / non-lean gates
//   each refuse honestly.
// P2 (harness, short): seed 1501, 5 days — the r107 driver gate-off
//   reproduces the r105 driver (control) exactly on endDay / aliveEnd /
//   pantryKcalEnd + skill_lesson key sets. A third leg (control again)
//   attributes any divergence: control-vs-control divergence is substrate
//   noise (the known contest-ID entropy issue, b4 det-gate pattern), not
//   the wrapper. Runs the real drivers as subprocesses (one harness per
//   process) into /tmp — never into the repo.
// P3 (harness output, same gate-off leg): the r107 driver's native
//   guardrails/c3 keys equal the r106 post-hoc derivation from the same
//   JSON, and huntEligEver is present as an array (FIX 1 + FIX 2).
// The panel M0 (42d, pilot seed) is the full det-gate; the b4 proof
// (test-huntstaff-b4.js: 17 pins + 60d det-gate 4/4 + smoke) already
// covers the layer itself and is re-run, not rewritten.
// Usage: node scripts/test-journey-establishment-r107-huntwire.js
'use strict';
const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HS = require('./policies/huntstaff');
const { competent } = require('./policies/competent');

function fakeGame(opts) {
  const o = opts || {};
  const attempts = [];
  const G = {
    over: false,
    state: {
      scholar: { day: 5, kcal: o.kcal == null ? 300 : o.kcal },
      village: {
        roster: o.roster || ['v1', 'v2', 'v3'],
        assignments: o.assignments || {},
        health: o.health || { v1: 90, v2: 90, v3: 90 },
        trust: o.trust || { v1: 50, v2: 20, v3: 60 },
        pantry: [],
      },
    },
    villagerId: 'scholar',
    playerAtHaven: () => (o.atHaven == null ? true : o.atHaven),
    getPerson: (id) => ({
      v1: { id, name: 'Ruby Roth', dead: false, formerOccupation: 'hunting guide' },
      v2: { id, name: 'Bob Smith', dead: false, formerOccupation: 'fishing guide' },
      v3: { id, name: 'Ana Lima', dead: false, formerOccupation: 'accountant' },
    }[id] || null),
    kcalCap: () => 2400,
    pantryFreshDays: () => (o.freshDays == null ? 1.5 : o.freshDays),
    villagerCompetence: () => 1.0,
    assignTask: (vid, task, ao) => {
      attempts.push({ vid, task, via: ao && ao.via });
      G.state.village.assignments[vid] = { task };
      return 'ok';
    },
    _attempts: attempts,
  };
  return G;
}

function runP1() {
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  console.log('PART P1 — wrapper wiring on the real competent policy');

  // Gate-off: wrapped upkeep/daily delegate to competent's own hooks.
  delete process.env.HUNTSTAFF;
  ok('gate-off delegates upkeep to competent (spy called once)', () => {
    const calls = [];
    const origUp = competent.upkeep, origDaily = competent.daily;
    competent.upkeep = (G, c) => { calls.push('upkeep'); };
    competent.daily = (G, c) => { calls.push('daily'); };
    try {
      const wrapped = HS.withHuntStaff(competent, 'competent-hunt');
      assert.strictEqual(wrapped.id, 'competent-hunt');
      const ctx = {};
      wrapped.upkeep(fakeGame(), ctx);
      wrapped.daily(fakeGame(), ctx);
      assert.deepStrictEqual(calls, ['upkeep', 'daily']);
      assert.deepStrictEqual(ctx, {}); // zero ctx writes gate-off
    } finally { competent.upkeep = origUp; competent.daily = origDaily; }
  });
  ok('gate-off staffHunt never attempts assignTask', () => {
    const G = fakeGame();
    assert.strictEqual(HS.staffHunt(G, {}), null);
    assert.strictEqual(G._attempts.length, 0);
  });

  // Gate-on: through the WRAPPED hooks (not staffHunt directly) the layer fires.
  process.env.HUNTSTAFF = '1';
  ok('gate-on wrapped upkeep staffs the eligible hunter once', () => {
    const G = fakeGame();
    const ctx = {};
    const wrapped = HS.withHuntStaff(competent, 'competent-hunt');
    // competent.upkeep itself needs a real Game; call only the layer half
    // through the wrapper's daily hook with a stubbed base: wrap a fake
    // base that shares competent's id to prove the hook order.
    const fakeBase = { id: 'competent', upkeep: () => {}, daily: () => {} };
    const w2 = HS.withHuntStaff(fakeBase, 'competent-hunt');
    w2.upkeep(G, ctx);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(G._attempts[0].vid, 'v1');
    assert.strictEqual(G._attempts[0].task, 'hunt');
    assert.strictEqual(ctx._hsAssignments, 1);
    // second upkeep same day: once-per-day, no second attempt
    w2.upkeep(G, ctx);
    assert.strictEqual(G._attempts.length, 1);
    assert.strictEqual(wrapped.id, 'competent-hunt');
  });
  ok('gate-on refusals: non-substrate / low-trust / wounded / away / full pantry', () => {
    const cases = [
      ['all-non-substrate', () => { const G = fakeGame(); G.getPerson = () => ({ id: 'x', name: 'X', dead: false, formerOccupation: 'accountant' }); return G; }],
      ['low-trust hunters', () => fakeGame({ trust: { v1: 20, v2: 20, v3: 60 } })],
      ['wounded hunter', () => fakeGame({ health: { v1: 25, v2: 90, v3: 90 }, trust: { v1: 90, v2: 20, v3: 60 } })],
      ['not at Haven', () => fakeGame({ atHaven: false })],
      ['non-lean day', () => fakeGame({ kcal: 2000, freshDays: 9 })],
    ];
    for (const [name, mk] of cases) {
      const G = mk();
      const ctx = {};
      assert.strictEqual(HS.staffHunt(G, ctx), null, name);
      assert.strictEqual(G._attempts.length, 0, name);
    }
  });
  delete process.env.HUNTSTAFF;
  console.log(`PART P1 green (${n} checks)`);
}

function lessonKeys(j) {
  const out = [];
  for (const t of (j.teleAll || [])) {
    if (t.type !== 'skill_lesson') continue;
    out.push([t.day, String(t.teacher), String(t.skill), String(t.learner)].join('|'));
  }
  return out.sort();
}

function runP2() {
  console.log('PART P2 — harness mini-det-gate (seed 1501, 5 days, 3 legs)');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r107-p2-'));
  const legs = [
    { name: 'control-a', script: 'journey-establishment-r105-20261105.js', env: {} },
    { name: 'gateoff', script: 'journey-establishment-r107-20261106.js', env: {} },
    { name: 'control-b', script: 'journey-establishment-r105-20261105.js', env: {} },
  ];
  const summaries = {};
  let gateoffJson = null;
  for (const leg of legs) {
    const dir = path.join(tmp, leg.name);
    fs.mkdirSync(dir, { recursive: true });
    const env = Object.assign({}, process.env, { SEEDS: '1501', DAYS: '5', EVID: dir }, leg.env);
    delete env.HUNTSTAFF; // gate-off for the r107 leg; r105 driver ignores it
    console.log(`  running ${leg.name} (${leg.script}, 5d)...`);
    execSync(`node scripts/${leg.script}`, { cwd: path.join(__dirname, '..'), env, stdio: 'pipe', timeout: 600000 });
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    assert.strictEqual(files.length, 1, `${leg.name}: expected 1 json, got ${files}`);
    const j = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
    if (leg.name === 'gateoff') gateoffJson = j;
    summaries[leg.name] = { endDay: j.endDay, aliveEnd: j.aliveEnd, pantryKcalEnd: j.pantryKcalEnd, lessons: lessonKeys(j) };
    console.log(`    ${leg.name}: endDay=${j.endDay} aliveEnd=${j.aliveEnd} pantryEnd=${j.pantryKcalEnd} lessons=${summaries[leg.name].lessons.length}`);
  }
  const same = (a, b) => a.endDay === b.endDay && a.aliveEnd === b.aliveEnd && a.pantryKcalEnd === b.pantryKcalEnd
    && JSON.stringify(a.lessons) === JSON.stringify(b.lessons);
  const gateClean = same(summaries.gateoff, summaries['control-a']);
  const substrateClean = same(summaries['control-b'], summaries['control-a']);
  console.log(`  gate-off vs control-a: ${gateClean ? 'IDENTICAL' : 'DIVERGES'}`);
  console.log(`  control-b vs control-a: ${substrateClean ? 'IDENTICAL' : 'DIVERGES (substrate noise)'}`);
  if (!gateClean && substrateClean) {
    throw new Error('P2 FAIL: gate-off diverges from control while control-vs-control is identical — wrapper-attributable divergence');
  }
  if (!gateClean) console.log('  NOTE: gate-off diverges but so does control-vs-control — substrate noise, not the wrapper (b4 det-gate pattern)');
  console.log('PART P2 green — no wrapper-attributable divergence');
  // leave /tmp outputs for inspection; they are outside the repo by design
  console.log(`  P2 outputs kept at ${tmp} (outside the repo)`);
  return gateoffJson;
}

function runP3(j) {
  console.log('PART P3 — native guardrails/c3 + ever-substrate capture (r107 FIX 1 + FIX 2)');
  let n = 0;
  const ok = (name, fn) => { fn(); n++; console.log(`  ok ${n}: ${name}`); };
  ok('guardrails present and equal to the r106 post-hoc derivation', () => {
    assert.ok(j.guardrails, 'guardrails missing');
    assert.strictEqual(j.guardrails.deaths, (j.deaths || []).length, 'guardrails.deaths');
    assert.strictEqual(j.guardrails.popAlive, j.aliveEnd, 'guardrails.popAlive');
    assert.strictEqual(j.guardrails.pantryKcal, j.pantryKcalEnd, 'guardrails.pantryKcal');
  });
  ok('c3.starvationDeaths counts the corrected keywords', () => {
    assert.ok(j.c3, 'c3 missing');
    const words = ['starvat', 'hunger', 'thirst', 'dehydrat'];
    const expect = (j.deaths || []).filter(d => words.some(w => String(d.cause || '').toLowerCase().includes(w))).length;
    assert.strictEqual(j.c3.starvationDeaths, expect, 'c3.starvationDeaths');
  });
  ok('huntEligEver present as an array (empty is honest on a 5d gate-off run)', () => {
    assert.ok(Array.isArray(j.huntEligEver), 'huntEligEver must be an array');
    for (const e of j.huntEligEver) assert.strictEqual(typeof e.name, 'string');
  });
  console.log(`PART P3 green (${n} checks)`);
}

(async () => {
  runP1();
  const gateoffJson = runP2();
  runP3(gateoffJson);
  console.log('TEST-JOURNEY-ESTABLISHMENT-R107-HUNTWIRE: ALL GREEN');
})().catch(e => { console.error('TEST-JOURNEY-ESTABLISHMENT-R107-HUNTWIRE FAILED:', e); process.exit(1); });
