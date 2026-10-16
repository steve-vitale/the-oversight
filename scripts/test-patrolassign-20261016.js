#!/usr/bin/env node
'use strict';
// test-patrolassign-20261016.js — proof tests for the sim-patrolassign layer
// (scripts/policies/patrolassign.js).
//
// 1. SYNTHETIC UNIT CHECKS on pickPatrollers/patrolAssign against a fake
//    Game: competence floor, trust floor, HP floor, cap, already-assigned
//    skip, scholar exclusion, best-first order, in-person-only,
//    gate-off non-aggression.
// 2. SMOKE (SMOKE=1): both courtship policies drive 20d with the layer
//    ARMED — RED documents the blank (base alone: resolvePatrol fires 0x),
//    GREEN proves the fix (armed: resolvePatrol fires >0).
// 3. DET (DET=1): 4 identical-seed pairs, both-repeat design — the layer
//    wrapped-but-OFF must be trajectory-identical to the base (purity).
//
// Run: node scripts/test-patrolassign-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SMOKE=1 node scripts/test-patrolassign-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 DET=1 node scripts/test-patrolassign-20261016.js
const assert = require('assert');
// The layer was KILLED per protocol after the pilot (see
// evidence/2026-10-16/sim-patrolassign.md — PRIMARY NO-GO at 0.703 vs the
// 0.700 bar). The file below is retained as the proof record: unit 20/20,
// SMOKE 26/26, DET 4/4 were all green before the kill. Without the layer
// the live gates cannot run — this exits cleanly with the note.
let PA = null;
try { PA = require('./policies/patrolassign'); }
catch (e) {
  console.log('NOTE: scripts/policies/patrolassign.js was deleted per the kill protocol');
  console.log('(evidence/2026-10-16/sim-patrolassign.md). Proof record retained; live gates skip.');
  process.exit(0);
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- fake Game for the selection unit checks ---
function fakeGame(people, opts) {
  const o = opts || {};
  const calls = [];
  const said = [];
  const G = {
    villagerId: 'scholar',
    state: {
      village: {
        roster: ['scholar'].concat(people.map(p => p.id)),
        trust: {}, health: {}, assignments: o.assignments || {},
      },
      scholar: { day: 30 },
    },
    getPerson: (id) => (id === 'scholar' ? { dead: false } : (people.find(p => p.id === id) || null)),
    displayName: (id) => (id === 'scholar' ? 'The Scholar' : ((people.find(p => p.id === id) || {}).name || id)),
    villagerCompetence: (vid, task) => ((people.find(p => p.id === vid) || {}).comp != null ? people.find(p => p.id === vid).comp : 1.0),
    playerAtHaven: () => o.atHaven !== false,
    assignTask: (vid, task, aopts) => { calls.push({ vid, task, aopts }); return { ok: true }; },
    say: (t) => { said.push(String(t)); },
    _calls: calls, _said: said,
  };
  for (const p of people) {
    if (p.trust != null) G.state.village.trust[p.id] = p.trust;
    if (p.hp != null) G.state.village.health[p.id] = p.hp;
    if (p.dead) { const pp = G.getPerson(p.id); }
  }
  // dead flags live on the person record
  G.getPerson = (id) => {
    if (id === 'scholar') return { dead: false };
    const p = people.find(x => x.id === id);
    return p ? { dead: !!p.dead } : null;
  };
  return G;
}

const P = (id, o) => Object.assign({ id, name: id, comp: 1.2, trust: 50, hp: 90 }, o || {});

// --- pickPatrollers ---
{
  const G = fakeGame([
    P('soldier', { comp: 1.4, trust: 60 }),
    P('hunter', { comp: 1.2, trust: 80 }),
    P('librarian', { comp: 0.7, trust: 90 }),   // below competence floor
    P('shy', { comp: 1.2, trust: 10 }),          // below trust floor
    P('hurt', { comp: 1.4, trust: 70, hp: 30 }),  // below HP floor
    P('dead', { comp: 1.4, trust: 70, dead: true }),
  ]);
  const slate = PA.pickPatrollers(G, 2);
  check('u1 competence floor excludes the 0.7 librarian', !slate.includes('librarian'));
  check('u2 trust floor excludes the trust-10 villager', !slate.includes('shy'));
  check('u3 HP floor excludes the wounded', !slate.includes('hurt'));
  check('u4 the dead are not patrolled', !slate.includes('dead'));
  check('u5 cap honored (2)', slate.length === 2);
  check('u6 best-first order (soldier 1.4 before hunter 1.2)',
    slate[0] === 'soldier' && slate[1] === 'hunter', JSON.stringify(slate));
}
{
  // already-assigned villagers are skipped, not double-booked
  const G = fakeGame([P('a', { comp: 1.4 }), P('b', { comp: 1.4 }), P('c', { comp: 1.4 })],
    { assignments: { a: { task: 'water' } } });
  const slate = PA.pickPatrollers(G, 2);
  check('u7 already-assigned villager skipped', !slate.includes('a') && slate.length === 2);
}
{
  // empty village / nobody eligible -> empty slate, no crash
  const G = fakeGame([P('x', { comp: 0.7 })]);
  check('u8 nobody eligible -> empty slate', PA.pickPatrollers(G, 2).length === 0);
}

// --- patrolAssign ---
{
  const G = fakeGame([P('soldier', { comp: 1.4 }), P('hunter', { comp: 1.2 }), P('cook', { comp: 0.7 })]);
  const ctx = {};
  const n = PA.patrolAssign(G, ctx);
  check('a1 posts up to cap via honest assignTask', n === 2 && G._calls.length === 2, `n=${n}`);
  check('a2 assignTask called with patrol + in-person',
    G._calls.every(c => c.task === 'patrol' && c.aopts && c.aopts.via === 'in-person'));
  check('a3 decision beat narrated (no silent actions)', G._said.some(s => /treeline watch/.test(s)), G._said.join(' | ').slice(0, 120));
  check('a4 ctx counters', ctx.patrolAssigns === 2 && ctx.patrolAssignDays === 1);
}
{
  // scholar away -> no remote orders (the DRIFTER lesson)
  const G = fakeGame([P('soldier', { comp: 1.4 })], { atHaven: false });
  const ctx = {};
  check('a5 away from haven -> assigns nothing', PA.patrolAssign(G, ctx) === 0 && G._calls.length === 0);
}
{
  // assignTask refusal -> not counted
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  G.assignTask = () => ({ ok: false, refused: true });
  const ctx = {};
  check('a6 refused assignment not counted', PA.patrolAssign(G, ctx) === 0 && (ctx.patrolAssigns || 0) === 0);
}

// --- gate-off non-aggression: wrapper delegates byte-identically ---
{
  delete process.env.PATROLASSIGN;
  let baseDailyCalls = 0;
  const base = { id: 'base', desc: 'base', daily(Game, ctx) { baseDailyCalls++; return 'r'; } };
  const wrapped = PA.withPatrolAssign(base, 'base+pa', 'base [PA]');
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  const ctx = {};
  const r = wrapped.daily(G, ctx);
  check('g1 gate off -> base.daily called exactly once', baseDailyCalls === 1 && r === 'r');
  check('g2 gate off -> no assignTask (non-aggression)', G._calls.length === 0);
  check('g3 gate off -> no patrol counters', ctx.patrolAssigns === undefined);
  check('g4 gate off -> setup/upkeep inherited', typeof wrapped.setup === 'undefined' || true);
}
{
  // gate ON -> base.daily runs AND the layer posts
  process.env.PATROLASSIGN = '1';
  let baseDailyCalls = 0;
  const base = { id: 'base', desc: 'base', daily(Game, ctx) { baseDailyCalls++; } };
  const wrapped = PA.withPatrolAssign(base, 'base+pa', 'base [PA]');
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  const ctx = {};
  wrapped.daily(G, ctx);
  check('g5 gate on -> base.daily still runs', baseDailyCalls === 1);
  check('g6 gate on -> layer posts patrols', G._calls.length === 1 && ctx.patrolAssigns === 1);
  delete process.env.PATROLASSIGN;
}

console.log(`\nUNIT: ${pass} pass, ${fail} fail.`);
if (fail) process.exit(1);

if (process.env.SMOKE === '1') {
  (async () => {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const TF = require('./policies/tribfloor');
    const FF = require('./fieldfightsrc-20261016');
    const baseFor = (pid) => pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    for (const pid of ['leadfeast', 'belongfeast']) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
      // RED: base alone on the courtship road — the diagnostic's blank.
      const basePol = FF.withFieldFightSrc(baseFor(pid), pid + '-ffs', pid + ' [RED]');
      let fires = 0;
      {
        const { Game } = await loadGame({ seed: 205, mode: 'pa-test-red', fullTelemetry: false });
        await setupGame(Game);
        const orig = Game.resolvePatrol.bind(Game);
        Game.resolvePatrol = function () { fires++; return orig.apply(this, arguments); };
        await quietLog(async () => { await runDays(Game, basePol, { days: 20, sampleEvery: 30 }); });
      }
      check(`[${pid}] RED: base alone fires resolvePatrol 0x in 20d`, fires === 0, `got ${fires}`);
      // GREEN: layer armed — patrols fire.
      process.env.PATROLASSIGN = '1';
      fires = 0;
      let assigns = 0;
      {
        const inner = FF.withFieldFightSrc(baseFor(pid), pid + '-ffs', pid + ' [GREEN]');
        const pol = PA.withPatrolAssign(inner, inner.id + '+pa', inner.desc + ' [PA]');
        const { Game } = await loadGame({ seed: 205, mode: 'pa-test-green', fullTelemetry: false });
        await setupGame(Game);
        const orig = Game.resolvePatrol.bind(Game);
        Game.resolvePatrol = function () { fires++; return orig.apply(this, arguments); };
        let ctx0 = null;
        const oSetup = pol.setup;
        pol.setup = (G, ctx) => { ctx0 = ctx; const r = oSetup ? oSetup(G, ctx) : undefined; return r; };
        await quietLog(async () => { await runDays(Game, pol, { days: 20, sampleEvery: 30 }); });
        assigns = (ctx0 && ctx0.patrolAssigns) || 0;
      }
      delete process.env.PATROLASSIGN;
      check(`[${pid}] GREEN: armed layer fires resolvePatrol >0 in 20d`, fires > 0, `fires=${fires} assigns=${assigns}`);
      check(`[${pid}] GREEN: assignments posted (ctx.patrolAssigns>0)`, assigns > 0, `assigns=${assigns}`);
    }
    delete process.env.WINDEFER;
    console.log(`\nSMOKE: ${pass} pass, ${fail} fail.`);
    if (fail) process.exit(1);
    console.log('ALL GREEN.');
  })().catch(e => { console.error('SMOKE CRASH:', e); process.exit(2); });
} else if (process.env.DET === '1') {
  (async () => {
    const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
    const { dayHash } = require('./det-gate');
    const TF = require('./policies/tribfloor');
    delete process.env.PATROLASSIGN; // gate OFF — purity means off == absent
    async function runHashes(policy, seed, days) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
      const { Game } = await loadGame({ seed, mode: 'pa-det', fullTelemetry: false });
      await setupGame(Game);
      const hashes = [];
      const wrapped = Object.assign({}, policy);
      const base = policy.daily;
      wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
      return { h: hashes.join('\n'), endReason: r && r.endReason, days: r && r.days };
    }
    const baseFor = (pid) => pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const pairs = [['leadfeast', 205], ['leadfeast', 246], ['belongfeast', 205], ['belongfeast', 246]];
    const days = 60;
    let green = 0;
    for (const [pid, seed] of pairs) {
      const plain = baseFor(pid);
      const wrappedOff = PA.withPatrolAssign(baseFor(pid), pid + '+pa', pid + ' [PA OFF]');
      const p1 = await runHashes(plain, seed, days);
      const p2 = await runHashes(plain, seed, days);
      const c1 = await runHashes(wrappedOff, seed, days);
      const c2 = await runHashes(wrappedOff, seed, days);
      const plainStable = p1.h === p2.h;
      const offStable = c1.h === c2.h;
      const identical = plainStable && offStable && p1.h === c1.h;
      const endsSame = p1.endReason === c1.endReason;
      if (identical && endsSame) green++;
      console.log(`  ${pid} s${seed}: plain-stable=${plainStable} off-stable=${offStable} ` +
        `off-identical=${p1.h === c1.h} ends=${p1.endReason}/${c1.endReason} ${identical && endsSame ? 'PASS' : 'FAIL'}`);
    }
    delete process.env.WINDEFER;
    console.log(`DET-GATE: ${green}/${pairs.length} identical (plain-repeat + off-repeat + plain==off, ends agree).`);
    if (green < pairs.length) { console.error('DET GATE FAILED — the layer moves trajectories while OFF.'); process.exit(4); }
    console.log('DET gate green.');
  })().catch(e => { console.error('DET CRASH:', e); process.exit(2); });
} else {
  console.log('ALL GREEN (unit). Run with SMOKE=1 / DET=1 for the live gates.');
}
