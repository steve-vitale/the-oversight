#!/usr/bin/env node
// scripts/test-fleepolicy-a.js — sim-fleepolicy-a proof.
//
// MODES:
//   node scripts/test-fleepolicy-a.js
//       fixtures only (pure policy-logic tests on stub games, fast,
//       no harness).
//   node scripts/test-fleepolicy-a.js --scenarios [--seed N] [--out PATH]
//       fixtures (must pass) + two real-engine scenarios driven by
//       the policy itself: a lingerer fight inside Haven (door exit)
//       and a chaser lingerer fight outside (barrier exits). Each
//       scenario passes only if the fight reaches tbEnd('fled')
//       through the policy's own fight() — a policy that never
//       triggers is a failed instrument, and this is where that
//       failure would show before any judged band runs.
//       Writes the scenario JSON to --out (or stdout).
//
// The stub fixtures test policy LOGIC (origin gating, strike-then-
// flee phasing, door/edge path switch, abandonment, gate-off
// delegation); the scenarios test the policy against the REAL
// engine (exit branches, chase persistence, tbEnd result).
'use strict';
const fs = require('fs');
const path = require('path');

const POL = require('./policies/fleepolicy-a');

// ---- tbend classification (same rule as fledcover-a/blockedrestore) ----
function isLingerer(o) { return !!(o && o.lingering && !o.titan); }
function classifyFled(ev) {
  if (!ev || ev.result !== 'fled') return 'NOT-FLED:' + (ev ? String(ev.result) : 'none');
  if (!isLingerer(ev.origin)) return 'NOT-LINGERER';
  if (ev.restored) return 'RESTORED';
  if (ev.occupantAfter) return 'BLOCKED';
  return 'UNCLASSIFIED';
}

// ---- stub game for pure fixtures ----
function stubGame(opts) {
  opts = opts || {};
  const monster = { kind: 'monster', key: 'm_0', hp: opts.monsterHp || 100, maxHp: 100, alive: true, fled: false, mx: 4, my: 5 };
  const player = { kind: 'player', key: 'p', hp: 100, maxHp: 100, alive: true, mx: 4, my: 4, moveLeft: 9, acted: false };
  const f = { worldOrigin: { lingering: true, titan: false, id: 'gallowdeer' }, fighters: [monster, player], over: false, result: null };
  const Game = {
    tbfight: f,
    map: { px: 4, py: 4 },
    state: { scholar: { insideHaven: opts.insideHaven !== false } },
    tbIsPlayerTurn: () => !f.over,
    tbFighter: (k) => (k === 'p' ? player : monster),
    equippedWeapon: () => ({ range: 1 }),
    tbPlayerStrike: (k) => { const t = f.fighters.find(x => x.key === k); if (t) t.hp -= 10; player.acted = true; },
    tbAfterPlayerAction: () => { player.moveLeft = 9; player.acted = false; },
    findPath: (x0, y0, x1, y1) => {
      if (opts.noPath) return null;
      const path = [];
      let x = x0, y = y0;
      while (x !== x1 || y !== y1) {
        if (x < x1) x++; else if (x > x1) x--;
        else if (y < y1) y++; else if (y > y1) y--;
        path.push([x, y]);
      }
      return path;
    },
    tbTerrainCost: () => 1,
    tbPlayerMove: (x, y) => {
      player.mx = x; player.my = y;
      if (opts.doorExits && x === 4 && y === 6) { f.over = true; f.result = 'fled'; }
    },
    tbBarrierExit: (dx, dy) => {
      if (opts.barrierExits) { f.over = true; f.result = 'fled'; }
    },
  };
  return { Game, f, monster, player };
}

function runFixtures() {
  let pass = 0, fail = 0;
  const failures = [];
  const check = (name, got, want) => {
    if (got === want) pass++;
    else { fail++; failures.push(name + ': got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want)); }
  };
  // isLingererOrigin
  check('linger origin true', POL.isLingererOrigin({ worldOrigin: { lingering: true, titan: false } }), true);
  check('linger origin titan false', POL.isLingererOrigin({ worldOrigin: { lingering: true, titan: true } }), false);
  check('linger origin non-lingering false', POL.isLingererOrigin({ worldOrigin: { lingering: false, titan: false } }), false);
  check('linger origin null false', POL.isLingererOrigin({ worldOrigin: null }), false);
  check('linger origin no fight false', POL.isLingererOrigin(null), false);
  // classification
  check('classify restored', classifyFled({ result: 'fled', origin: { lingering: true, titan: false }, restored: true, occupantAfter: null }), 'RESTORED');
  check('classify blocked', classifyFled({ result: 'fled', origin: { lingering: true, titan: false }, restored: false, occupantAfter: { id: 'callback' } }), 'BLOCKED');
  check('classify unclassified', classifyFled({ result: 'fled', origin: { lingering: true, titan: false }, restored: false, occupantAfter: null }), 'UNCLASSIFIED');
  check('classify lost not fled', classifyFled({ result: 'lost', origin: { lingering: true, titan: false }, restored: false, occupantAfter: null }), 'NOT-FLED:lost');
  check('classify fled non-lingerer', classifyFled({ result: 'fled', origin: { lingering: false, titan: false }, restored: true, occupantAfter: null }), 'NOT-LINGERER');
  // gate-off delegation: FLEEPOLICY unset in this process (sweep sets
  // it only inside runOne); force the check by deleting the env var.
  const savedEnv = process.env.FLEEPOLICY;
  delete process.env.FLEEPOLICY;
  check('gate off', POL.layerOn(), false);
  {
    const { Game } = stubGame({ doorExits: true });
    const ctx = {};
    let baseCalled = 0;
    const base = () => { baseCalled++; return true; };
    const r = POL.fleepolicyFight(Game, ctx, base);
    check('gate-off delegates to base', baseCalled, 1);
    check('gate-off returns base value', r, true);
  }
  // gate-on: stub with door exit — 2 strikes then door flee.
  process.env.FLEEPOLICY = '1';
  check('gate on', POL.layerOn(), true);
  {
    const { Game, f, monster } = stubGame({ doorExits: true });
    const ctx = {};
    let baseCalled = 0;
    const base = () => { baseCalled++; return true; };
    let calls = 0;
    while (!f.over && calls++ < 50) {
      const p = Game.tbFighter('p');
      p.moveLeft = 9;
      POL.fleepolicyFight(Game, ctx, base);
    }
    check('door scenario ends fled', f.result, 'fled');
    check('door scenario strikes dealt', monster.hp < 100, true);
    check('door scenario base never called on lingerer fight', baseCalled, 0);
    check('door scenario flee phase entered', (ctx.fpFleePhaseFights || 0), 1);
    check('door scenario door turns counted', (ctx.fpDoorFlees || 0) >= 1, true);
  }
  // gate-on: edge path when outside, barrier exits.
  {
    const { Game, f } = stubGame({ insideHaven: false, barrierExits: true });
    const ctx = {};
    const base = () => true;
    let calls = 0;
    while (!f.over && calls++ < 80) {
      const p = Game.tbFighter('p');
      p.moveLeft = 9;
      POL.fleepolicyFight(Game, ctx, base);
    }
    check('edge scenario ends fled', f.result, 'fled');
    check('edge scenario edge turns counted', (ctx.fpEdgeFlees || 0) >= 1, true);
  }
  // gate-on: no path anywhere -> path switch fires, then abandonment
  // after 30 flee turns delegates to base.
  {
    const { Game, f } = stubGame({ noPath: true, barrierExits: false });
    const ctx = {};
    let baseCalled = 0;
    const base = () => { baseCalled++; return true; };
    let calls = 0;
    while (!f.over && calls++ < 200) {
      const p = Game.tbFighter('p');
      p.moveLeft = 9;
      POL.fleepolicyFight(Game, ctx, base);
      if (baseCalled > 0) break;
    }
    check('stuck scenario abandons to base', baseCalled >= 1, true);
    check('stuck scenario abandon counted', (ctx.fpFleeAbandoned || 0), 1);
  }
  // non-lingerer delegates to base even when gate on.
  {
    const { Game } = stubGame({});
    Game.tbfight.worldOrigin = { lingering: false, titan: false };
    const ctx = {};
    let baseCalled = 0;
    const base = () => { baseCalled++; return true; };
    POL.fleepolicyFight(Game, ctx, base);
    check('non-lingerer delegates to base', baseCalled, 1);
  }
  if (savedEnv === undefined) delete process.env.FLEEPOLICY;
  else process.env.FLEEPOLICY = savedEnv;
  return { pass, fail, failures, total: pass + fail };
}

// ---- real-engine scenarios ----
async function runScenario(Game, name, opts) {
  const hx = Game.map.px, hy = Game.map.py;
  if (opts.outside) Game.state.scholar.insideHaven = false;
  for (const rid of (Game.state.village.roster || [])) {
    if (rid !== Game.villagerId) { try { Game.npcSetNode(rid, 3, 4); } catch (e) {} }
  }
  const lingerer = Game.spawnWorldMonster(opts.monster, hx, hy,
    { lingering: true, raidBorn: true, mx: 5, my: 5, hp: opts.hp, maxHp: opts.hp });
  const preHp = lingerer.hp;
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.startCombat(opts.monster);
  const f = Game.tbfight;
  const origin = f && f.worldOrigin;
  const log = { scenario: name, monster: opts.monster,
    origin: origin ? { id: origin.id, lingering: !!origin.lingering, titan: !!origin.titan, tx: origin.tx, ty: origin.ty, hp: origin.hp } : null,
    strikes: 0, turns: 0, result: null };
  if (!f || !origin) { log.production = 'FAILED-NO-ORIGIN'; return log; }
  const ctx = {};
  // Force the gate on inside this process for the scenario run.
  process.env.FLEEPOLICY = '1';
  const { fleepolicyNowait } = require('./policies/fleepolicy-a');
  let guard = 0;
  while (Game.tbfight && !Game.tbfight.over && guard++ < 400) {
    if (Game.tbIsPlayerTurn()) {
      fleepolicyNowait.fight(Game, ctx);
    } else {
      try { Game.tbAdvance(); } catch (e) { break; }
    }
    log.turns++;
  }
  log.result = f.result || null;
  log.over = !!f.over;
  log.ctx = { fpLingererFights: ctx.fpLingererFights || 0, fpStrikeTurns: ctx.fpStrikeTurns || 0,
    fpFleePhaseFights: ctx.fpFleePhaseFights || 0, fpFleeTurns: ctx.fpFleeTurns || 0,
    fpFleeAbandoned: ctx.fpFleeAbandoned || 0, fpDoorFlees: ctx.fpDoorFlees || 0, fpEdgeFlees: ctx.fpEdgeFlees || 0 };
  const inWorld = Game.worldMonsters().find(m => m === origin);
  const occ = origin ? Game.monsterAt(origin.tx, origin.ty) : null;
  log.originInWorld = !!inWorld;
  log.originHpAfter = inWorld ? inWorld.hp : null;
  log.occupantAfter = occ ? { id: occ.id, hp: occ.hp, wave: occ.wave || null, lingering: !!occ.lingering, tx: occ.tx, ty: occ.ty, sameAsOrigin: occ === origin } : null;
  log.classification = classifyFled({ result: f.result, origin: log.origin, restored: log.originInWorld, occupantAfter: log.occupantAfter });
  log.production = (f.result === 'fled' && isLingerer(log.origin)) ? 'FLED-LINGERER' : 'FAILED-PRODUCTION:' + String(f.result);
  log.preHp = preHp;
  return log;
}

async function runScenarios(seed) {
  const { loadGame, setupGame } = require('./sim-harness');
  const out = [];
  const defs = [
    ['P-door', { monster: 'gallowdeer', hp: 400 }],
    ['P-chase', { monster: 'bulldozer', hp: 400, outside: true }],
  ];
  for (const [name, opts] of defs) {
    const { Game } = await loadGame({ seed, mode: 'fleepolicy-a', fullTelemetry: false });
    await setupGame(Game);
    out.push(await runScenario(Game, name, opts));
  }
  return { seed, scenarios: out };
}

async function main() {
  const args = process.argv.slice(2);
  const fx = runFixtures();
  if (fx.fail) {
    console.log('FIXTURES-FAIL ' + fx.pass + '/' + fx.total);
    for (const m of fx.failures) console.log('  FAIL ' + m);
    process.exit(1);
  }
  console.log('FIXTURES-PASS ' + fx.pass + '/' + fx.total);
  if (!args.includes('--scenarios')) return;
  let seed = 75102, outPath = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--seed') seed = parseInt(args[i + 1], 10);
    if (args[i] === '--out') outPath = args[i + 1];
  }
  const doc = await runScenarios(seed);
  const body = JSON.stringify(doc, null, 1) + '\n';
  if (outPath) fs.writeFileSync(outPath, body);
  else process.stdout.write(body);
  const bad = doc.scenarios.filter(s => s.production !== 'FLED-LINGERER');
  console.log('SCENARIOS ' + doc.scenarios.map(s => s.scenario + '=' + s.classification + '(' + s.result + ')').join(' '));
  if (bad.length) {
    console.log('SCENARIO-FAIL ' + bad.map(s => s.scenario + ':' + s.production).join(' '));
    process.exit(1);
  }
  console.log('SCENARIOS-PASS 2/2 policy-driven fled lingerer fights');
}
main().catch(e => { console.error('TEST-FLEEPOLICY-FAIL', e && e.stack || e); process.exit(1); });

module.exports = { isLingerer, classifyFled, runFixtures };
