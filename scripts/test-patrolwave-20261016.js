#!/usr/bin/env node
'use strict';
// test-patrolwave-20261016.js — proof tests for the sim-patrolwave layer
// (scripts/policies/patrolwave.js).
//
// 1. SYNTHETIC UNIT CHECKS (31): pickPatrollers gates, patrolWaveAssign
//    honesty, gate-off purity (byte-identical delegation), gate-on posting,
//    and the WAVE GATE itself (stand-down vs wave 4/5, engage vs wave <=3,
//    raiders/aid path untouched, table sanctity preserved, knowledge-gated
//    beats, deterministic beat rotation).
// 2. SMOKE (SMOKE=1): both courtship policies drive 20d with the layer
//    ARMED — RED documents the blank (base alone: resolvePatrol fires 0x),
//    GREEN proves contact (armed: fires >0, routed through the gate wrap).
// 3. DET (DET=1): 4 identical-seed pairs, both-repeat design — the layer
//    wrapped-but-OFF must be trajectory-identical to the base (purity).
//
// Run: node scripts/test-patrolwave-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 SMOKE=1 node scripts/test-patrolwave-20261016.js
//      FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 DET=1 node scripts/test-patrolwave-20261016.js
const assert = require('assert');
// The layer is DELETED per the kill protocol on NO-GO (see
// evidence/2026-10-16/sim-patrolwave.md). This file is then the proof
// record: live gates skip cleanly without it.
let PW = null;
try { PW = require('./policies/patrolwave'); }
catch (e) {
  console.log('NOTE: scripts/policies/patrolwave.js was deleted per the kill protocol');
  console.log('(evidence/2026-10-16/sim-patrolwave.md). Proof record retained; live gates skip.');
  process.exit(0);
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// --- fake Game for the synthetic checks ---
function fakeGame(people, opts) {
  const o = opts || {};
  const calls = [], said = [], trustBumps = [], prevCalls = [];
  const G = {
    villagerId: 'scholar',
    state: {
      village: {
        roster: ['scholar'].concat(people.map(p => p.id)),
        trust: {}, health: {}, assignments: o.assignments || {}, px: 4, py: 4,
      },
      scholar: { day: 30 },
    },
    data: { monsters: o.monsters || [] },
    getPerson: (id) => {
      if (id === 'scholar') return { dead: false };
      const p = people.find(x => x.id === id);
      return p ? { dead: !!p.dead } : null;
    },
    displayName: (id) => (id === 'scholar' ? 'Scholar C' : ((people.find(p => p.id === id) || {}).name || id)),
    villagerCompetence: (vid, task) => { const p = people.find(x => x.id === vid); return (p && p.comp != null) ? p.comp : 1.0; },
    playerAtHaven: () => o.atHaven !== false,
    assignTask: (vid, task, aopts) => { calls.push({ vid, task, aopts }); return { ok: true }; },
    say: (t) => { said.push(String(t)); },
    bumpTrust: (vid, n) => { trustBumps.push({ vid, n }); },
    nearestWorldMonster: (x, y) => o.worldMonster || null,
    tableActive: () => !!o.tableActive,
    monsterNoun: (id) => { const m = (o.monsters || []).find(x => x.id === id); return (m && m.descriptor) || 'the beast'; },
    resolvePatrol: function (vid, first) { prevCalls.push({ vid, first }); return 'engaged'; },
    _calls: calls, _said: said, _trustBumps: trustBumps, _prevCalls: prevCalls,
  };
  for (const p of people) {
    if (p.trust != null) G.state.village.trust[p.id] = p.trust;
    if (p.hp != null) G.state.village.health[p.id] = p.hp;
  }
  return G;
}

const P = (id, o) => Object.assign({ id, name: id, comp: 1.2, trust: 50, hp: 90 }, o || {});
const MONS = [
  { id: 'hushpuppy', wave: 1, name: 'Hushpuppy', descriptor: 'the small loud thing' },
  { id: 'highbeam_deer', wave: 1, name: 'Highbeam Deer', descriptor: 'the deer with headlights' },
  { id: 'grief_counselor', wave: 2, name: 'Grief Counselor', descriptor: 'the mirror-faced deer' },
  { id: 'the_redactor', wave: 3, name: 'The Redactor', descriptor: 'the censor with edge-handles' },
  { id: 'the_reunion', wave: 4, name: 'The Reunion', descriptor: 'the village you failed' },
  { id: 'the_eater', wave: 4, name: 'THE EATER', descriptor: 'the eating thing' },
  { id: 'the_finale', wave: 5, name: 'The Finale', descriptor: 'the countdown' },
];

// --- pickPatrollers ---
{
  const G = fakeGame([
    P('soldier', { comp: 1.4, trust: 60 }),
    P('hunter', { comp: 1.2, trust: 80 }),
    P('librarian', { comp: 0.7, trust: 90 }),
    P('shy', { comp: 1.2, trust: 10 }),
    P('hurt', { comp: 1.4, trust: 70, hp: 30 }),
    P('dead', { comp: 1.4, trust: 70, dead: true }),
  ]);
  const slate = PW.pickPatrollers(G, 2);
  check('u1 competence floor excludes the 0.7 librarian', !slate.includes('librarian'));
  check('u2 trust floor excludes the trust-10 villager', !slate.includes('shy'));
  check('u3 HP floor excludes the wounded', !slate.includes('hurt'));
  check('u4 the dead are not patrolled', !slate.includes('dead'));
  check('u5 cap honored (2)', slate.length === 2);
  check('u6 best-first order (soldier 1.4 before hunter 1.2)',
    slate[0] === 'soldier' && slate[1] === 'hunter', JSON.stringify(slate));
}
{
  const G = fakeGame([P('a', { comp: 1.4 }), P('b', { comp: 1.4 }), P('c', { comp: 1.4 })],
    { assignments: { a: { task: 'water' } } });
  const slate = PW.pickPatrollers(G, 2);
  check('u7 already-assigned villager skipped', !slate.includes('a') && slate.length === 2);
}
{
  const G = fakeGame([P('x', { comp: 0.7 })]);
  check('u8 nobody eligible -> empty slate', PW.pickPatrollers(G, 2).length === 0);
}

// --- patrolWaveAssign ---
{
  process.env.PATROLWAVE = '1';
  const G = fakeGame([P('soldier', { comp: 1.4 }), P('hunter', { comp: 1.2 }), P('cook', { comp: 0.7 })]);
  const ctx = {};
  const n = PW.patrolWaveAssign(G, ctx);
  check('a1 posts up to cap via honest assignTask', n === 2 && G._calls.length === 2, `n=${n}`);
  check('a2 assignTask called with patrol + in-person',
    G._calls.every(c => c.task === 'patrol' && c.aopts && c.aopts.via === 'in-person'));
  check('a3 decision beat narrated (no silent actions)', G._said.some(s => /treeline watch/.test(s)), G._said.join(' | ').slice(0, 140));
  check('a4 ctx counters', ctx.patrolWaveAssigns === 2 && ctx.patrolWaveAssignDays === 1);
  delete process.env.PATROLWAVE;
}
{
  process.env.PATROLWAVE = '1';
  const G = fakeGame([P('soldier', { comp: 1.4 })], { atHaven: false });
  const ctx = {};
  check('a5 away from haven -> assigns nothing', PW.patrolWaveAssign(G, ctx) === 0 && G._calls.length === 0);
  delete process.env.PATROLWAVE;
}
{
  process.env.PATROLWAVE = '1';
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  G.assignTask = () => ({ ok: false, refused: true });
  const ctx = {};
  check('a6 refused assignment not counted', PW.patrolWaveAssign(G, ctx) === 0 && (ctx.patrolWaveAssigns || 0) === 0);
  check('a8 all-refused -> honest beat, never a phantom patrol name',
    G._said.some(s => /nobody takes it up/.test(s)) && !G._said.some(s => /undefined/.test(s)),
    G._said.join(' | ').slice(0, 140));
  delete process.env.PATROLWAVE;
}
{
  process.env.PATROLWAVE = '1';
  const G = fakeGame([P('lamb', { comp: 0.5 })]);
  const ctx = {};
  const n = PW.patrolWaveAssign(G, ctx);
  check('a7 empty slate -> honest stand-down beat, day counted, 0 assigns',
    n === 0 && ctx.patrolWaveAssignDays === 1 && G._said.some(s => /nobody fit to walk/.test(s)),
    G._said.join(' | ').slice(0, 140));
  delete process.env.PATROLWAVE;
}

// --- gate-off non-aggression: wrapper delegates byte-identically ---
{
  delete process.env.PATROLWAVE;
  let baseDailyCalls = 0;
  const base = { id: 'base', desc: 'base', daily(Game, ctx) { baseDailyCalls++; return 'r'; } };
  const wrapped = PW.withPatrolWave(base, 'base+pw', 'base [PW]');
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  const origResolve = G.resolvePatrol;
  const ctx = {};
  wrapped.setup(G, ctx);
  const r = wrapped.daily(G, ctx);
  check('g1 gate off -> base.daily called exactly once', baseDailyCalls === 1 && r === 'r');
  check('g2 gate off -> no assignTask (non-aggression)', G._calls.length === 0);
  check('g3 gate off -> no patrol counters', ctx.patrolWaveAssigns === undefined && ctx.pwPatrolFires === undefined);
  check('g4 gate off -> resolvePatrol NOT wrapped (identity untouched)', G.resolvePatrol === origResolve);
}
{
  process.env.PATROLWAVE = '1';
  let baseDailyCalls = 0;
  const base = { id: 'base', desc: 'base', daily(Game, ctx) { baseDailyCalls++; } };
  const wrapped = PW.withPatrolWave(base, 'base+pw', 'base [PW]');
  const G = fakeGame([P('soldier', { comp: 1.4 })]);
  const ctx = {};
  wrapped.setup(G, ctx);
  wrapped.daily(G, ctx);
  check('g5 gate on -> base.daily still runs', baseDailyCalls === 1);
  check('g6 gate on -> layer posts patrols', G._calls.length === 1 && ctx.patrolWaveAssigns === 1);
  delete process.env.PATROLWAVE;
}

// --- the WAVE GATE ---
{
  // w1: wave-4 target -> stand down, no engagement
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'the_reunion', tx: 5, ty: 5 } });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut');
  check('w1 wave-4 -> prev NOT called (no engagement)', G._prevCalls.length === 0);
  check('w2 wave-4 -> stand-down beat narrated', G._said.some(s => /stands down/.test(s)), G._said.join(' | ').slice(0, 160));
  check('w3 wave-4 -> counters', ctx.pwStanddowns === 1 && ctx.pwPatrolFires === 1);
  check('w4 wave-4 -> trust +1 (uneventful-patrol reward)', G._trustBumps.some(b => b.vid === 'knut' && b.n === 1));
}
{
  // w5: wave-5 target -> stand down too
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'the_finale', tx: 5, ty: 5 } });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut');
  check('w5 wave-5 -> stand down', G._prevCalls.length === 0 && ctx.pwStanddowns === 1);
}
{
  // w6/w7: wave <= 3 -> engage (delegate to the engine's real fight path)
  for (const [mid, want] of [['the_redactor', 3], ['grief_counselor', 2], ['hushpuppy', 1]]) {
    const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: mid, tx: 5, ty: 5 } });
    const ctx = {};
    PW.installWaveGate(G, ctx);
    G.resolvePatrol('knut', 'Knut');
    check(`w6 wave-${want} ${mid} -> engages (prev called)`, G._prevCalls.length === 1 && ctx.pwStanddowns === 0);
  }
  // w8: no monster -> delegate (the engine's uneventful branch)
  {
    const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: null });
    const ctx = {};
    PW.installWaveGate(G, ctx);
    G.resolvePatrol('knut', 'Knut');
    check('w8 no monster -> delegate', G._prevCalls.length === 1 && ctx.pwStanddowns === 0);
  }
}
{
  // w9: raider (no monster def -> wave 1 by convention) -> delegate; the
  // aid-crisis path is untouched by the gate.
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'raider_band', tx: 5, ty: 5, lingering: true } });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut');
  check('w9 raider (no def) -> delegate, never gated', G._prevCalls.length === 1 && ctx.pwStanddowns === 0);
}
{
  // w10: table active -> target nulled (table sanctity, engine's own rule)
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'the_reunion', tx: 5, ty: 5 }, tableActive: true });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut');
  check('w10 table active -> delegate (sanctity preserved)', G._prevCalls.length === 1 && ctx.pwStanddowns === 0);
}
{
  // w11: knowledge-gated beat — descriptor, never the System's true name
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'the_reunion', tx: 5, ty: 5 } });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut');
  const beat = G._said.find(s => /stands down/.test(s)) || '';
  check('w11 beat names what the village calls it (descriptor)',
    /the village you failed/.test(beat) && !/The Reunion/.test(beat), beat.slice(0, 160));
}
{
  // w12: deterministic beat rotation (3 distinct lines across 3 stand-downs)
  const G = fakeGame([P('knut', { comp: 1.4 })], { monsters: MONS, worldMonster: { id: 'the_eater', tx: 5, ty: 5 } });
  const ctx = {};
  PW.installWaveGate(G, ctx);
  G.resolvePatrol('knut', 'Knut'); G.resolvePatrol('knut', 'Knut'); G.resolvePatrol('knut', 'Knut');
  const beats = G._said.filter(s => /stands down|Stand down/.test(s));
  check('w12 3 stand-downs -> 3 distinct beat lines (no robotic repeat)',
    beats.length === 3 && new Set(beats).size === 3, beats.map(b => b.slice(0, 60)).join(' | '));
  check('w13 missing first name -> falls back to displayName, never "undefined"',
    beats.every(b => !/undefined/.test(b)));
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
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '0';
      // RED: base alone on the courtship road — the diagnostic's blank.
      const basePol = FF.withFieldFightSrc(baseFor(pid), pid + '-ffs', pid + ' [RED]');
      let fires = 0;
      {
        const { Game } = await loadGame({ seed: 917, mode: 'pw-test-red', fullTelemetry: false });
        await setupGame(Game);
        const orig = Game.resolvePatrol.bind(Game);
        Game.resolvePatrol = function () { fires++; return orig.apply(this, arguments); };
        await quietLog(async () => { await runDays(Game, basePol, { days: 20, sampleEvery: 30 }); });
      }
      check(`[${pid}] RED: base alone fires resolvePatrol 0x in 20d`, fires === 0, `got ${fires}`);
      // GREEN: layer armed — patrols fire, routed through the gate wrap.
      process.env.PATROLWAVE = '1';
      fires = 0;
      let assigns = 0, gateFires = 0, gateLive = false;
      {
        const inner = FF.withFieldFightSrc(baseFor(pid), pid + '-ffs', pid + ' [GREEN]');
        const pol = PW.withPatrolWave(inner, inner.id + '+pw', inner.desc + ' [PW]');
        const { Game } = await loadGame({ seed: 917, mode: 'pw-test-green', fullTelemetry: false });
        await setupGame(Game);
        const orig = Game.resolvePatrol.bind(Game);
        Game.resolvePatrol = function () { fires++; return orig.apply(this, arguments); };
        let ctx0 = null;
        const oSetup = pol.setup;
        pol.setup = (G, ctx) => { ctx0 = ctx; const r = oSetup ? oSetup(G, ctx) : undefined; return r; };
        await quietLog(async () => { await runDays(Game, pol, { days: 20, sampleEvery: 30 }); });
        assigns = (ctx0 && ctx0.patrolWaveAssigns) || 0;
        gateFires = (ctx0 && ctx0.pwPatrolFires) || 0;
        gateLive = !!(ctx0 && ctx0._pwGateInstalled);
      }
      delete process.env.PATROLWAVE;
      check(`[${pid}] GREEN: armed layer fires resolvePatrol >0 in 20d`, fires > 0, `fires=${fires} assigns=${assigns}`);
      check(`[${pid}] GREEN: wave-gate wrap live on the armed path`, gateLive, `installed=${gateLive}`);
      check(`[${pid}] GREEN: every fire routed through the gate (gateFires==fires)`, gateFires === fires && fires > 0, `gateFires=${gateFires} fires=${fires}`);
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
    delete process.env.PATROLWAVE; // gate OFF — purity means off == absent
    async function runHashes(policy, seed, days) {
      process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '0';
      const { Game } = await loadGame({ seed, mode: 'pw-det', fullTelemetry: false });
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
    const pairs = [['leadfeast', 917], ['leadfeast', 928], ['belongfeast', 917], ['belongfeast', 928]];
    const days = 60;
    let green = 0;
    for (const [pid, seed] of pairs) {
      const plain = baseFor(pid);
      const wrappedOff = PW.withPatrolWave(baseFor(pid), pid + '+pw', pid + ' [PW OFF]');
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
