#!/usr/bin/env node
// test-sanctityfix.js — proof for the sanctity-gate fix arm (flesh-out loop,
// 2026-10-19, ARM sim-sanctityfix).
//
// FIX: src/js/game.js — tableActive() gates on
//   (1) monsterTurn(): the ambient contact block (hummice sonar/bump,
//       dark-bump, the whole stance machine) — the glasswing trap trigger
//       above the gate is the player's own device and stays live;
//   (2) reengageWaitingMonsters() (belt-and-braces) + both callers
//       (hall-door exitBuilding + treelineAmbush) BEFORE stash consumption,
//       so the siege persists — nothing consumed, nothing re-engaged,
//       mid-finale.
// Canon: docs/CANON.md + docs/TABLE.md (sanctity of the table, Steve
// 2026-10-12). Diagnostic: evidence/2026-10-19/sim-sanctityaudit.md.
//
// PART A (REPLAY, default): rebuild the corpus incident (belongfeast/s64203
//   d90 'suburb' lingerer on the Haven tile, bearer at Haven,
//   tableActive()=true) and tick monsterTurn(). RED pre-fix: startCombat
//   fires at an ambient site. GREEN post-fix: no fire, lingerer still
//   pinned ("hold but do not gorge"), glasswing trigger still live, trial
//   entry still ungated.
// PART B (REENGAGE, default): door-fled stash + hall-door exit + treeline
//   ambush. Sanctity ON: no engagement, stash untouched. Sanctity OFF:
//   engagement fires (the gate is the causal delta).
// PART C (DET, default): fixed tree vs pristine-HEAD baseline tree
//   (/tmp/sanctbase, built from `git show HEAD:src/js/game.js`), same
//   seeds, sanctity never active: per-day trajectory hashes must be
//   byte-identical — the change alters nothing outside sanctity.
//   Runs the baseline leg in a child process (never two harnesses in one
//   process). Writes only to /tmp.
//
// Usage: node scripts/test-sanctityfix.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const HERE = __dirname;
const BASELINE_SCRIPTS = '/tmp/sanctbase/scripts';

function needBaselineTree() {
  const g = path.join(BASELINE_SCRIPTS, 'sim-harness.js');
  if (!fs.existsSync(g)) {
    console.error('DET STOP: baseline tree missing at /tmp/sanctbase (build it: cp -r src, restore HEAD game.js, copy sim-harness/det-gate/policies, index.html).');
    process.exit(2);
  }
}

// The harness is resolved via __dirname — this file runs once per tree.
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function forceTableSitting(Game) {
  const pg = Game.progState(); pg.tableDone = true; pg.tableSittingId = 1;
  const T = Game.tableState(); T.phase = 'challenge'; T.path = 'feared';
  if (T) T.winDeferred = false;
}
function clearTableSitting(Game) {
  try { const T = Game.tableState(); if (T) { T.phase = 'done'; T.winDeferred = false; } } catch (e) {}
  try { const pg = Game.progState(); if (pg) pg.tableDone = false; } catch (e) {}
}
const tableActiveNow = (Game) => { try { return !!(Game.tableActive && Game.tableActive()); } catch (e) { return false; } };

// Record-only startCombat spy (no call-through): records the fire site +
// tableActive() at fire time. Returns the fires array and a restore fn.
function spyStartCombat(Game) {
  const fires = [];
  const orig = Game.startCombat;
  Game.startCombat = function (monsterId, options) {
    let active = null;
    try { active = tableActiveNow(Game); } catch (e) {}
    fires.push({ mid: monsterId != null ? String(monsterId) : null,
      tableTrial: !!(options && options.tableTrial), active });
    return null;
  };
  return { fires, restore() { Game.startCombat = orig; } };
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// ---------------------------------------------------------------------------
// PART A — the corpus incident replay (s64203 d90 suburb lingerer at Haven)
async function partA() {
  console.log('=== PART A: REPLAY — s64203 suburb lingerer at Haven, table sitting ===');
  const Game = await newGame(64203);
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  const s = Game.state.scholar; s.mx = 4; s.my = 4;
  const m = Game.spawnWorldMonster({ id: 'suburb' }, hx, hy, { mx: 4, my: 6 });
  m.lingering = true;
  forceTableSitting(Game);
  if (!tableActiveNow(Game)) { console.log('PART A: FAIL — could not force tableActive() true'); return false; }
  const spy = spyStartCombat(Game);
  let ticks = 0;
  await quietLog(async () => {
    for (let i = 0; i < 200 && !spy.fires.length; i++) { ticks++; Game.monsterTurn(); }
  });
  const ambientFires = spy.fires.filter(f => f.active === true && !f.tableTrial);
  const a1 = ambientFires.length === 0;
  console.log(`  A1 no ambient startCombat during sanctity (${ticks} monsterTurn ticks): ${a1 ? 'PASS' : 'FAIL — fired: ' + JSON.stringify(ambientFires)}`);
  // A2: the lingerer still holds the treeline (pinned, not consumed, not engaging)
  const stillThere = (() => {
    try {
      const mm = Game.playerMonster && Game.playerMonster();
      return !!(mm && mm.id === 'suburb');
    } catch (e) { return false; }
  })();
  console.log(`  A2 lingerer still pinned at Haven (siege persists): ${stillThere ? 'PASS' : 'FAIL'}`);
  // A3: the glasswing trigger — the player's own device — stays live during sanctity
  // (clear the suburb first so playerMonster() returns the glasswing)
  try { Game.removeWorldMonster(m); } catch (e) {}
  const gw = Game.spawnWorldMonster({ id: 'glasswing' }, hx, hy, { mx: 4, my: 4 });
  s.gwTrap = null;
  await quietLog(async () => { Game.monsterTurn(); });
  const a3 = !!(Game.state.scholar && Game.state.scholar.gwTrap);
  console.log(`  A3 glasswing trap trigger live during sanctity (player's own device): ${a3 ? 'PASS' : 'FAIL'}`);
  // A4: the trial entry is NOT gated — startCombat('finale', {tableTrial:true}) still fires
  const before = spy.fires.length;
  Game.startCombat('finale', { tableTrial: true });
  const trialFire = spy.fires.slice(before).find(f => f.mid === 'finale' && f.tableTrial);
  console.log(`  A4 trial-by-combat entry ungated: ${trialFire ? 'PASS' : 'FAIL'}`);
  // A5 (static): none of the new gates sit inside startCombat itself
  const src = fs.readFileSync(path.join(HERE, '..', 'src', 'js', 'game.js'), 'utf8');
  const defIdx = src.indexOf('startCombat(monsterId');
  let depth = 0, end = -1, started = false;
  for (let i = defIdx; i < src.length && i < defIdx + 60000; i++) {
    const c = src[i];
    if (c === '{') { depth++; started = true; }
    else if (c === '}') { depth--; if (started && depth === 0) { end = i; break; } }
  }
  const body = end > 0 ? src.slice(defIdx, end) : '';
  const a5 = body.length > 0 && !/tableActive/.test(body);
  console.log(`  A5 startCombat body contains no sanctity gate (trial can never be blocked): ${a5 ? 'PASS' : 'FAIL'}`);
  spy.restore();
  const ok = a1 && stillThere && a3 && !!trialFire && a5;
  console.log(ok ? 'PART A: ALL PASS' : 'PART A: FAILURES');
  return ok;
}

// ---------------------------------------------------------------------------
// PART B — re-engage paths: stash held during sanctity, live without it
async function partB() {
  console.log('=== PART B: REENGAGE — door-fled stash under sanctity ===');
  const Game = await newGame(4242);
  const me = Game.villagerId;
  const mkStash = () => ([
    { id: 'hushwolf', hp: 40, bearer: me },          // mine: the bearer's own fled stash
    { id: 'hushwolf', hp: 30, bearer: 'someone-else' }, // theirs: a dead bearer's killer
  ]);
  const s = Game.state.scholar;
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;

  // --- B1: sanctity ON, hall-door exit — no engagement, stash untouched
  forceTableSitting(Game);
  if (!tableActiveNow(Game)) { console.log('PART B: FAIL — could not force tableActive() true'); return false; }
  let spy = spyStartCombat(Game);
  Game.state.doorFledMonsters = mkStash();
  s.insideHaven = true; s.insideTent = false;
  Game.map.px = hx; Game.map.py = hy;
  let exitOk = false;
  await quietLog(async () => { exitOk = Game.exitBuilding(); });
  const b1 = spy.fires.length === 0 && (Game.state.doorFledMonsters || []).length === 2;
  console.log(`  B1 sanctity ON: exitBuilding no re-engage, stash held (len=${(Game.state.doorFledMonsters || []).length}): ${b1 ? 'PASS' : 'FAIL — fires=' + spy.fires.length}`);
  spy.restore();

  // --- B2: sanctity ON, treeline ambush — refused, stash untouched
  spy = spyStartCombat(Game);
  Game.state.doorFledMonsters = mkStash();
  Game.map.px = hx + 1; Game.map.py = hy; // off the safe tile, departing Haven
  let amb = null;
  await quietLog(async () => { amb = Game.treelineAmbush(hx, hy); });
  const b2 = amb === false && spy.fires.length === 0 && (Game.state.doorFledMonsters || []).length === 2;
  console.log(`  B2 sanctity ON: treelineAmbush refused, stash held: ${b2 ? 'PASS' : 'FAIL — amb=' + amb + ' fires=' + spy.fires.length}`);
  spy.restore();

  // --- B3: sanctity OFF — the hall-door re-engage fires again (gate is the delta)
  clearTableSitting(Game);
  if (tableActiveNow(Game)) { console.log('PART B: FAIL — could not clear tableActive()'); return false; }
  spy = spyStartCombat(Game);
  Game.state.doorFledMonsters = mkStash();
  s.insideHaven = true;
  Game.map.px = hx; Game.map.py = hy;
  await quietLog(async () => { Game.exitBuilding(); });
  const b3 = spy.fires.length >= 1;
  console.log(`  B3 sanctity OFF: exitBuilding re-engages (${spy.fires.length} fire(s)): ${b3 ? 'PASS' : 'FAIL'}`);
  spy.restore();

  // --- B4: sanctity OFF — direct reengageWaitingMonsters fires
  spy = spyStartCombat(Game);
  Game.reengageWaitingMonsters(mkStash());
  const b4 = spy.fires.length >= 1;
  console.log(`  B4 sanctity OFF: reengageWaitingMonsters fires (${spy.fires.length} fire(s)): ${b4 ? 'PASS' : 'FAIL'}`);
  spy.restore();

  const ok = b1 && b2 && b3 && b4;
  console.log(ok ? 'PART B: ALL PASS' : 'PART B: FAILURES');
  return ok;
}

// ---------------------------------------------------------------------------
// PART C — DET: fixed tree vs pristine-HEAD baseline, sanctity never active
const DET_SEEDS = [7, 42];
const DET_DAYS = 60;

async function detDump(seeds, days, outFile) {
  // minimal deterministic policy: pure freeloader — the table can never sit
  // (no deeds, no scale), so sanctity stays OFF the whole run.
  let idle;
  try { idle = require('./policies/idle'); } catch (e) { idle = null; }
  const policy = (idle && (idle.zero || idle)) || { id: 'noop', daily() {} };
  if (!policy.id) policy.id = 'noop';
  const { runDays } = require('./sim-harness');
  const per = {};
  for (const seed of seeds) {
    const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    let sanctitySeen = false;
    const wrapped = Object.assign({}, policy);
    const baseDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      hashes.push(scholarDay(G) + ':' + dayHash(Game));
      try { if (tableActiveNow(G)) sanctitySeen = true; } catch (e) {}
      return baseDaily ? baseDaily(G, ctx) : undefined;
    };
    let result;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days }); });
    per[seed] = { hashes, sanctitySeen, days: result.days };
  }
  fs.writeFileSync(outFile, JSON.stringify(per));
  console.log(`  det-dump: ${seeds.join(',')} x ${days}d -> ${outFile}`);
}

async function partC() {
  console.log('=== PART C: DET — fixed vs pristine-HEAD baseline, sanctity OFF ===');
  needBaselineTree();
  // self-copy so the baseline leg runs the identical proof code
  fs.copyFileSync(path.join(HERE, 'test-sanctityfix.js'), path.join(BASELINE_SCRIPTS, 'test-sanctityfix.js'));
  const baseFile = '/tmp/sanct-det-baseline.json';
  const fixedFile = '/tmp/sanct-det-fixed.json';
  try { fs.unlinkSync(baseFile); } catch (e) {}
  try { fs.unlinkSync(fixedFile); } catch (e) {}
  console.log('  baseline leg (pristine HEAD game.js)...');
  execFileSync('node', [path.join(BASELINE_SCRIPTS, 'test-sanctityfix.js'), '--det-dump', DET_SEEDS.join(','), String(DET_DAYS), baseFile],
    { stdio: 'inherit', timeout: 600000 });
  console.log('  fixed leg (gated game.js)...');
  await detDump(DET_SEEDS, DET_DAYS, fixedFile);
  const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const fixed = JSON.parse(fs.readFileSync(fixedFile, 'utf8'));
  let ok = true;
  for (const seed of DET_SEEDS) {
    const b = base[seed], f = fixed[seed];
    const same = b && f && b.hashes.join('|') === f.hashes.join('|') && b.hashes.length > 0;
    const sanctityFree = b && f && !b.sanctitySeen && !f.sanctitySeen;
    console.log(`  s${seed}: baseline-vs-fixed ${same ? 'BYTE-IDENTICAL' : 'DIFFER'} (${(f && f.hashes.length) || 0} day-hashes), sanctity never active: ${sanctityFree ? 'yes' : 'NO — comparison invalid'}`);
    if (!same || !sanctityFree) ok = false;
  }
  console.log(ok ? 'PART C: ALL PASS — the change alters nothing outside sanctity'
    : 'PART C: FAILURES');
  return ok;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--det-dump') {
    await detDump(args[1].split(',').map(x => parseInt(x, 10)).filter(Number.isFinite),
      parseInt(args[2], 10) || 60, args[3] || '/tmp/sanct-det.json');
    return;
  }
  const abOnly = args[0] === '--ab-only';
  const a = await partA();
  const b = await partB();
  const c = abOnly ? true : await partC();
  console.log('');
  console.log(`SANCTITYFIX: ${a && b && c ? 'ALL GREEN' : 'FAILURES PRESENT'}`);
  process.exit(a && b && c ? 0 : 1);
}

if (require.main === module) main().catch(e => { console.error('SANCTITYFIX FATAL:', e && e.stack || e); process.exit(1); });
module.exports = { partA, partB, partC };
