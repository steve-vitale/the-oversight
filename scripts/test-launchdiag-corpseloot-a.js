// scripts/test-launchdiag-corpseloot-a.js — proof test + fixture for
// sub-arm (1b): corpseloot — Omar's corpse thread (tracker blank #3).
//
// Part A (no harness): census analyzer selftest + frozen-band census
// checks against prereg §5 expectations.
// Part B (live harness): forced wild-corpse fixture matrix F1–F8
// (prereg §6). Each cell gets a FRESH loadGame (sequential loads are
// the harness's designed pattern; each cell asserts on its own game
// instance only). KILLBUNDLE=1 + CELLGATE=1 are set once for staging;
// REARM_CELLS is toggled per cell and verified live via _rearmCellsOn
// (the test-rearm-b pattern — the gate reads process.env at call time).
//
//   node scripts/test-launchdiag-corpseloot-a.js [--census-only]
//       [--cells F1,F3] [--seed-base N]
// Reads only; never writes into the repo (harness runs in-memory).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const census = require(path.join(REPO, 'scripts', 'analyze-launchdiag-corpseloot-a'));
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- shared counters (test-rearm-b helpers, same definitions) ----
function countIn(items, id) {
  let n = 0;
  for (const e of (items || [])) {
    const eid = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (eid === id) n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function gunsOf(p) { return countIn(p.items || [], 'searcaster'); }
function cellsOf(p) { return countIn(p.items || [], 'fusion_cell'); }
function corpseGuns(c) { return countIn(c.items || [], 'searcaster'); }
function corpseCells(c) { return countIn(c.items || [], 'fusion_cell'); }
function stageArrival(Game, vid) {
  const staged = driver.stageFirstKillLoot(Game.villagerKillLoot);
  return staged.call(Game, vid, { wave: 4, id: 'test-beast' });
}
function havenNode(Game) {
  const v = Game.state.village || {};
  return { x: (v.px != null ? v.px : 4), y: (v.py != null ? v.py : 4) };
}
function rosterOf(Game) {
  return ((Game.state.village || {}).roster || []).filter(function (r) { return r && r !== Game.villagerId; });
}
function livePerson(Game, vid) { return Game.getPerson ? Game.getPerson(vid) : null; }

// ---- Part A: census proof checks (no harness) ----
function censusChecks() {
  check('census-selftest-green', census.selftest());
  const a = census.analyzeBands();
  const b = census.analyzeBands();
  check('census-determinism-byte-identical', JSON.stringify(a) === JSON.stringify(b));
  check('census-crosscheck-all', a.crossCheckAll === true);
  check('census-totals', a.totals.takes === 2376 && a.totals.scholar === 2376 &&
    a.totals.villager === 0 && a.totals.unclassified === 0,
    JSON.stringify(a.totals));
  check('census-gunCell-takes-11', a.totals.gunCellTakes === 11);
  check('census-rearm-takes-4-haven', a.totals.rearmTakes === 4 &&
    a.bands.filter(function (x) { return x.band === 'rearm-arm'; })[0].rearmByChannel.haven === 4);
  check('census-rearm-witness-0', a.bands.every(function (x) {
    return (x.rearmByChannel.witness || 0) === 0;
  }));
  check('census-emma-row', a.emma.pass === true && a.emma.gun === 1 && a.emma.cells === 0 &&
    a.emma.buried === false && a.emma.deathDay === 86 && a.emma.deathPlayer === true,
    JSON.stringify(a.emma));
  check('census-instrument-errors-0', a.totals.instrumentErrors === 0);
  return a;
}

// ---- Part B: fixture matrix ----
function setRearm(on) {
  if (on) process.env.REARM_CELLS = '1'; else delete process.env.REARM_CELLS;
}
async function freshGame(seed, mode) {
  const loaded = await loadGame({ seed: seed, mode: mode, fullTelemetry: false });
  await setupGame(loaded.Game);
  return loaded.Game;
}
// Capture Game.say / Game.tele lines around a block (loadGame silences
// say; the wrap below restores capture, as in the F3 probe).
function captureLines(Game) {
  const says = [], teles = [];
  const origSay = Game.say.bind(Game);
  const origTele = Game.tele ? Game.tele.bind(Game) : null;
  Game.say = function (t) { says.push(String(t)); return origSay(t); };
  if (origTele) {
    Game.tele = function (ev, data) {
      teles.push({ ev: ev, data: data || null, day: ((Game.state || {}).scholar || {}).day || 0 });
      return origTele(ev, data);
    };
  }
  return { says: says, teles: teles };
}

async function cellF1(seedBase) {
  // Wild villager corpse, no witnesses, REARM on: no take, ever.
  const Game = await freshGame(seedBase + 1, 'launchdiag-F1');
  setRearm(true);
  check('F1: gate reads on', Game._rearmCellsOn() === true);
  const roster = rosterOf(Game);
  const h = roster[0];
  const holder = livePerson(Game, h);
  check('F1: staged arrival returns searcaster', stageArrival(Game, h) === 'searcaster');
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: h, name: holder.name || 'holder',
    cause: 'combat', node: { x: 1, y: 2 } });
  check('F1: corpse registered at a wild node', !!corpse && corpse.node.x === 1 && corpse.node.y === 2);
  check('F1: corpse holds the gun (1-cell collapse)', corpseGuns(corpse) === 1 && corpseCells(corpse) === 1,
    'guns=' + corpseGuns(corpse) + ' cells=' + corpseCells(corpse));
  let took = 0;
  for (let i = 0; i < 3; i++) took += (Game.villagerRearmHavenSweep() || []).length;
  check('F1: three Haven sweeps take nothing', took === 0, 'takes=' + took);
  check('F1: corpse keeps gun + cell after 3 sweeps', corpseGuns(corpse) === 1 && corpseCells(corpse) === 1);
}

async function cellF2(seedBase) {
  // Villager corpse AT Haven, no witnesses, REARM on: Haven sweep takes.
  const Game = await freshGame(seedBase + 2, 'launchdiag-F2');
  setRearm(true);
  const roster = rosterOf(Game);
  const h = roster[0];
  const holder = livePerson(Game, h);
  check('F2: staged arrival returns searcaster', stageArrival(Game, h) === 'searcaster');
  const hn = havenNode(Game);
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: h, name: holder.name || 'holder',
    cause: 'a wound that would not close' });
  check('F2: corpse registered', !!corpse);
  if (corpse) corpse.node = { x: hn.x, y: hn.y }; // home death, at the fire
  const havenPeople = (Game.campPeopleIds ? Game.campPeopleIds('haven') : []).filter(function (id) { return id && id !== Game.villagerId; });
  const takerVid = havenPeople.find(function (id) { const p = livePerson(Game, id); return p && !p.dead && gunsOf(p) === 0; });
  check('F2: a gun-less villager is at Haven', !!takerVid);
  const recs = Game.villagerRearmHavenSweep() || [];
  check('F2: sweep takes exactly once', recs.length === 1, 'takes=' + recs.length);
  check('F2: take is second-life via haven', !!(recs[0] && recs[0].kind === 'second-life' && recs[0].channel === 'haven'),
    JSON.stringify(recs[0] || null));
  const taker = takerVid ? livePerson(Game, takerVid) : null;
  check('F2: taker gains the gun + 1 cell', !!taker && gunsOf(taker) === 1 && cellsOf(taker) === 1,
    taker ? ('guns=' + gunsOf(taker) + ' cells=' + cellsOf(taker)) : 'no taker');
  check('F2: corpse gun + cells are gone', corpseGuns(corpse) === 0 && corpseCells(corpse) === 0);
}

// Stage a scholar death in the wild the faithful way: walk the scholar
// to a wild tile, seat gun + cells on the SCHOLAR's own kit
// (state.scholar.inventory / equipped — what playerDeath packs), then
// call the real playerDeath. Returns { Game, corpse, oldSid, cap }.
async function stageScholarWildDeath(seedBase, n, cells) {
  const Game = await freshGame(seedBase + n, 'launchdiag-F' + n);
  Game.map.px = 1; Game.map.py = 2; // wild tile, not Haven
  const s = Game.state.scholar;
  s.inventory = s.inventory || [];
  if (cells > 0) s.inventory.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
  s.equipped = s.equipped || {};
  s.equipped.ranged = { itemId: 'searcaster', name: 'Searcaster' };
  const oldSid = Game.villagerId;
  Game.playerDeath('the wild');
  const corpse = (Game.corpses() || []).filter(function (c) { return c.villagerId === oldSid; })[0] || null;
  const cap = captureLines(Game);
  return { Game: Game, corpse: corpse, oldSid: oldSid, cap: cap };
}

async function cellF3(seedBase) {
  // Scholar dies wild holding gun + 2 cells, REARM on: recovery next
  // night + Haven sweep take on the day after death (Omar, lever on).
  const { Game, corpse, cap } = await stageScholarWildDeath(seedBase, 3, 2);
  setRearm(true);
  check('F3: gate reads on', Game._rearmCellsOn() === true);
  check('F3: scholar corpse at a wild node with gun + 2 cells', !!corpse && corpse.node.x === 1 && corpse.node.y === 2 &&
    corpseGuns(corpse) === 1 && corpseCells(corpse) === 2,
    corpse ? ('node=' + JSON.stringify(corpse.node) + ' guns=' + corpseGuns(corpse) + ' cells=' + corpseCells(corpse)) : 'no corpse');
  check('F3: no witnesses on a scholar corpse', !!corpse && (corpse.witnesses || []).length === 0);
  Game.endDay();
  check('F3: after endDay#1 the corpse is still wild (not due)', !!corpse && corpse.node.x === 1 && corpse.node.y === 2 && !corpse.recovered);
  check('F3: no take after endDay#1', cap.teles.filter(function (t) { return t.ev === 'rearm_take'; }).length === 0);
  const dayBefore = Game.state.scholar.day;
  Game.endDay();
  check('F3: after endDay#2 the corpse is recovered to Haven', !!corpse && corpse.node.x === 4 && corpse.node.y === 4 && corpse.recovered === true,
    corpse ? JSON.stringify(corpse.node) : 'no corpse');
  const takes = cap.teles.filter(function (t) { return t.ev === 'rearm_take'; });
  check('F3: exactly one rearm take fires', takes.length === 1, 'takes=' + takes.length);
  check('F3: take is second-life, haven channel, gun + 2 cells', !!(takes[0] && takes[0].data &&
    takes[0].data.kind === 'second-life' && takes[0].data.channel === 'haven' &&
    takes[0].data.gun === true && takes[0].data.cells === 2), JSON.stringify(takes[0] || null));
  check('F3: take is recorded the day after death', takes.length === 1 && takes[0].day === dayBefore,
    'take day=' + (takes[0] && takes[0].day) + ' expected=' + dayBefore);
  check('F3: corpse gun + cells are gone', corpseGuns(corpse) === 0 && corpseCells(corpse) === 0);
  const sayLine = cap.says.filter(function (t) { return /Searcaster/i.test(t); })[0] || null;
  check('F3: the take is voiced', !!sayLine, sayLine);
  console.log('F3 say line: ' + (sayLine || '(none)'));
}

async function cellF4(seedBase) {
  // Same as F3, REARM off: recovery happens, take does not.
  const { Game, corpse, cap } = await stageScholarWildDeath(seedBase, 4, 2);
  setRearm(false);
  check('F4: gate reads off', Game._rearmCellsOn() === false);
  check('F4: scholar corpse at a wild node with gun + 2 cells', !!corpse && corpseGuns(corpse) === 1 && corpseCells(corpse) === 2);
  Game.endDay();
  Game.endDay();
  check('F4: corpse recovered to Haven anyway', !!corpse && corpse.node.x === 4 && corpse.node.y === 4 && corpse.recovered === true);
  check('F4: no rearm take fires', cap.teles.filter(function (t) { return t.ev === 'rearm_take'; }).length === 0);
  check('F4: corpse keeps gun + 2 cells at Haven', corpseGuns(corpse) === 1 && corpseCells(corpse) === 2);
}

async function cellF5(seedBase) {
  // Villager dies wild WITH a witness, REARM on: witness take at death.
  const Game = await freshGame(seedBase + 5, 'launchdiag-F5');
  setRearm(true);
  const roster = rosterOf(Game);
  const h = roster[0], t = roster[1];
  const holder = livePerson(Game, h), taker = livePerson(Game, t);
  check('F5: staged arrival returns searcaster', stageArrival(Game, h) === 'searcaster');
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: h, name: holder.name || 'holder',
    cause: 'combat', node: { x: 1, y: 2 }, witnesses: [t] });
  check('F5: corpse registered at a wild node', !!corpse && corpse.node.x === 1 && corpse.node.y === 2);
  check('F5: witness gains the gun at death time', gunsOf(taker) === 1, 'guns=' + gunsOf(taker));
  check('F5: witness gains 1 cell (corpse supply cap)', cellsOf(taker) === 1, 'cells=' + cellsOf(taker));
  check('F5: corpse gun + cells are gone', corpseGuns(corpse) === 0 && corpseCells(corpse) === 0);
}

async function cellF6(seedBase) {
  // Same as F5, REARM off: no take.
  const Game = await freshGame(seedBase + 6, 'launchdiag-F6');
  setRearm(false);
  check('F6: gate reads off', Game._rearmCellsOn() === false);
  const roster = rosterOf(Game);
  const h = roster[0], t = roster[1];
  const holder = livePerson(Game, h), taker = livePerson(Game, t);
  check('F6: staged arrival returns searcaster', stageArrival(Game, h) === 'searcaster');
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: h, name: holder.name || 'holder',
    cause: 'combat', node: { x: 1, y: 2 }, witnesses: [t] });
  check('F6: corpse registered', !!corpse);
  check('F6: witness gains no gun (REARM off)', gunsOf(taker) === 0, 'guns=' + gunsOf(taker));
  check('F6: witness gains no cells (REARM off)', cellsOf(taker) === 0, 'cells=' + cellsOf(taker));
  check('F6: corpse keeps gun + 1 cell', corpseGuns(corpse) === 1 && corpseCells(corpse) === 1);
}

async function cellF7(seedBase) {
  // Scholar dies wild holding a DRY gun (0 cells), REARM on: recovered,
  // but no take — cells-gated (Emma s107539, live).
  const { Game, corpse, cap } = await stageScholarWildDeath(seedBase, 7, 0);
  setRearm(true);
  check('F7: scholar corpse holds the gun and 0 cells', !!corpse && corpseGuns(corpse) === 1 && corpseCells(corpse) === 0);
  Game.endDay();
  Game.endDay();
  check('F7: corpse recovered to Haven', !!corpse && corpse.node.x === 4 && corpse.node.y === 4 && corpse.recovered === true);
  check('F7: no rearm take fires (dry gun)', cap.teles.filter(function (t) { return t.ev === 'rearm_take'; }).length === 0);
  check('F7: corpse keeps the dry gun', corpseGuns(corpse) === 1);
}

async function cellF8(seedBase) {
  // Villager dies wild, no witnesses, REARM on: the SCHOLAR can still
  // loot the wild corpse by walking to it (scholar-only path, F8 is
  // the control proving the corpse IS lootable — just not by villagers).
  const Game = await freshGame(seedBase + 8, 'launchdiag-F8');
  setRearm(true);
  const roster = rosterOf(Game);
  const h = roster[0];
  const holder = livePerson(Game, h);
  check('F8: staged arrival returns searcaster', stageArrival(Game, h) === 'searcaster');
  const corpse = Game.registerDeath({ kind: 'villager', villagerId: h, name: holder.name || 'holder',
    cause: 'combat', node: { x: 1, y: 2 } });
  check('F8: corpse registered at a wild node', !!corpse && corpse.node.x === 1 && corpse.node.y === 2);
  check('F8: no villager take from the wild corpse', (Game.villagerRearmHavenSweep() || []).length === 0);
  // Walk the scholar to the body and loot it.
  Game.map.px = 1; Game.map.py = 2;
  const s = Game.state.scholar;
  s.mx = corpse.mx; s.my = corpse.my;
  const before = (s.inventory || []).length;
  const took = Game.lootCorpse(corpse.id, true);
  check('F8: scholar loots the wild corpse', !!took && took.length > 0, 'took=' + JSON.stringify(took && took.map(function (t) { return t.itemId || t.name; })));
  check('F8: scholar gains the gun', countIn(s.inventory || [], 'searcaster') >= 1);
  check('F8: scholar gains the cell', countIn(s.inventory || [], 'fusion_cell') >= 1);
  check('F8: corpse gun + cells are gone', corpseGuns(corpse) === 0 && corpseCells(corpse) === 0);
  void before;
}

const CELLS = { F1: cellF1, F2: cellF2, F3: cellF3, F4: cellF4, F5: cellF5, F6: cellF6, F7: cellF7, F8: cellF8 };

async function main() {
  const args = process.argv.slice(2);
  process.env.KILLBUNDLE = '1';
  process.env.CELLGATE = '1';
  let seedBase = 71;
  const si = args.indexOf('--seed-base'); if (si !== -1 && args[si + 1]) seedBase = parseInt(args[si + 1], 10);
  // Part A always runs (fast, no harness).
  censusChecks();
  if (args.indexOf('--census-only') !== -1) {
    console.log('test-launchdiag-corpseloot-a (census only): ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail === 0 ? 0 : 1);
  }
  // Part B: fixture matrix.
  let wanted = Object.keys(CELLS);
  const ci = args.indexOf('--cells');
  if (ci !== -1 && args[ci + 1]) wanted = args[ci + 1].split(',').map(function (x) { return x.trim(); });
  for (const name of wanted) {
    if (!CELLS[name]) { console.log('FAIL: unknown cell ' + name); fail++; continue; }
    try { await CELLS[name](seedBase); }
    catch (e) { fail++; console.log('FAIL: ' + name + ' threw — ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); }
  }
  delete process.env.KILLBUNDLE;
  delete process.env.REARM_CELLS;
  delete process.env.CELLGATE;
  console.log('test-launchdiag-corpseloot-a: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail === 0 ? 0 : 1);
}

if (require.main === module) main().catch(function (e) { console.log('FATAL', e.stack); process.exit(1); });
module.exports = { CELLS: CELLS, censusChecks: censusChecks };
