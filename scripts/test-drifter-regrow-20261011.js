#!/usr/bin/env node
// Drifter break-it, 2026-10-11 — hostile attacks on distance/catch-up.
//
// B1 EXPLOIT — catch-up regrow cadence keyed on the APPROACH day, not the
//     simmed days. regrowLand(dayIdx) -> regrowTiles() reads
//     `this.state.scholar.day` for its %2/%4 stock cadence and for the
//     `regDay <= day` detail-cell restoration. During catchUpSim over N
//     days, every simmed day heals with TODAY's parity:
//       - approach on an even scholar.day: +1 stock per simmed day (~N,
//         capped) — a late first approach lush-ifies the whole turf;
//       - approach on an odd scholar.day: ZERO regrowth over the same N
//         days — the village's turf arrives barren.
//     The land is one map and heals once per elapsed day (2026-10-08
//     watermark) — but the AMOUNT healed must not depend on which day you
//     happen to walk up. Hostile drifter: time first approaches for even
//     days, strip the windfall turf, walk away. (Also: detail cells tagged
//     due at end-of-today restore during a catch-up over PAST days —
//     regDay <= scholar.day fires for cells not yet due.)
//     FIX: regrowLand threads dayIdx into regrowTiles; the cadence and the
//     regDay gate use the day being healed. endDay's call is unchanged
//     (dayIdx === scholar.day there).
//
// HELD (attacked, verified, not broken):
//   S1 — new games always set state.village.px/py, so returnToVillage's
//        `?? 4` PIN fallback is dead armor, not a live teleport.
//   S2 — join-away meal honesty: joined to a foreign fire but standing
//        far from every fire, endDay camps wild — no remote pantry draw.
//   H1 — travel arrival copy vs engine: "Travel N tiles to <type>" names
//        the destination honestly; dayTicks don't move (free per Steve's
//        rule, documented in TIME-ECONOMY.md).
//
// Run: node scripts/test-drifter-regrow-20261011.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global; // stub for the eval phase only (flips combat async — deleted before play)
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
const said = [];
Game.say = (m) => { said.push(String(m)); };

async function freshGame() {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  said.length = 0;
  Game.dayPart = 1;
  return Game.state.scholar;
}

// a rested, barren grove tile far from every foreign village (their sim
// depletes within ~4 of their fire; keep >=5 away so only regrow moves it)
function mkBarrenTile() {
  const ovs = Game.state.otherVillages || [];
  let bx = -1, by = -1;
  outer:
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (Math.abs(x - 4) + Math.abs(y - 4) < 5) continue;
    for (const v of ovs) {
      if (Math.abs(x - (v.x || 0)) + Math.abs(y - (v.y || 0)) < 5) continue outer;
    }
    bx = x; by = y; break outer;
  }
  if (bx < 0) throw new Error('no isolated tile');
  const t = Game.tileAt(bx, by);
  t.type = 'grove'; t.maxStock = 100; t.stock = 0;
  t.vigor = 100; t.foragePressure = 0; t.foragedToday = false; t.erodedToday = false;
  t.detailRegrow = {}; t.detail = null;
  return t;
}

function farVillage() {
  const v = (Game.state.otherVillages || [])[0];
  if (!v) throw new Error('no otherVillages');
  v.day = 0; v.generated = false; v.knowledgeProfile = null; v.roster = null;
  return v;
}

(async () => {
  // ================= B1: catch-up regrow parity =================
  console.log('\n[B1] EXPLOIT: catch-up regrow cadence follows the approach day, not the simmed days');
  await freshGame();
  const v = farVillage();

  // --- even approach day (30): 30 simmed days should heal ~15 stock ---
  let t = mkBarrenTile();
  Game.state.scholar.day = 30;
  Game.state._landRegrowDay = 0;
  ok(t.stock === 0, 'pre: test tile barren');
  Game.catchUpSim(v);
  const evenStock = t.stock;
  console.log('    even-day approach (day 30): stock after 30-day catch-up = ' + evenStock);
  ok(evenStock >= 13 && evenStock <= 17,
    'even-day catch-up heals ~15 stock (one per 2 simmed days)',
    'got ' + evenStock + ' (bug: ~30)');

  // --- odd approach day (31): same 30 simmed days should heal ~15 ---
  await freshGame();
  const v2 = farVillage();
  t = mkBarrenTile();
  Game.state.scholar.day = 31;
  Game.state._landRegrowDay = 0;
  Game.catchUpSim(v2);
  const oddStock = t.stock;
  console.log('    odd-day approach (day 31): stock after 30-day catch-up = ' + oddStock);
  ok(oddStock >= 13 && oddStock <= 17,
    'odd-day catch-up heals ~15 stock (one per 2 simmed days)',
    'got ' + oddStock + ' (bug: 0)');
  ok(Math.abs(evenStock - oddStock) <= 4,
    'approach-day parity does not decide the harvest',
    'even=' + evenStock + ' odd=' + oddStock);

  // --- detail cells: a cell due at end-of-today must NOT restore during a
  //     catch-up that only covers past days ---
  await freshGame();
  const v3 = farVillage();
  t = mkBarrenTile();
  t.detail = [];
  for (let y = 0; y < 9; y++) { t.detail.push([]); for (let x = 0; x < 9; x++) t.detail[y].push(x === 0 && y === 0 ? 'dirt' : 'grass'); }
  Game.state.scholar.day = 30;
  Game.state._landRegrowDay = 0;
  // cell picked day 28 -> tag 30 (due at end of day 30, per the forager-loop
  // comment: tag D restores at end of day D). Catch-up covers days 0..29.
  t.detailRegrow = { '0,0': { day: 30, was: 'plant' } };
  Game.catchUpSim(v3);
  ok(t.detail[0][0] === 'dirt',
    'detail cell due end-of-today is not restored by catch-up over past days',
    'cell=' + t.detail[0][0] + ' (bug: restored early)');
  ok(!!t.detailRegrow['0,0'], 'its regrow tag survives for endDay', 'tag consumed early');

  // ================= S1: village.px/py always set (PIN armor) =================
  console.log('\n[S1] HELD: returnToVillage PIN fallback');
  await freshGame();
  // the PIN (map.px = village.px ?? 4) must land on the actual haven tile —
  // never a teleport. Haven gen-plants at (4,4); forks set px/py explicitly.
  let htx = -1, hty = -1;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++)
    if (Game.tileAt(x, y).type === 'haven') { htx = x; hty = y; }
  ok(htx >= 0, 'a haven tile exists');
  ok((Game.state.village.px ?? 4) === htx && (Game.state.village.py ?? 4) === hty,
    'PIN target equals the real haven tile — no teleport possible',
    'pin=(' + (Game.state.village.px ?? 4) + ',' + (Game.state.village.py ?? 4) + ') haven=(' + htx + ',' + hty + ')');

  // ================= S2: join-away meal honesty =================
  console.log('\n[S2] HELD: joined scholar far from every fire camps wild');
  await freshGame();
  const jv = farVillage();
  // fake a join: seat at their fire, then walk far away
  Game.state.scholar.joinedVillage = jv.id;
  jv.generated = true; jv.day = Game.state.scholar.day; jv.pantryKcal = 20000;
  // stand on a tile far from both haven and the joined village
  let fx = 0, fy = 0;
  const hx = Game.state.village.px ?? 4, hy = Game.state.village.py ?? 4;
  outer2:
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    if (Math.abs(x - hx) + Math.abs(y - hy) < 3) continue;
    if (Math.abs(x - (jv.x || 0)) + Math.abs(y - (jv.y || 0)) < 3) continue;
    fx = x; fy = y; break outer2;
  }
  Game.map.px = fx; Game.map.py = fy;
  const kcalBefore = Game.state.scholar.kcal || 0;
  said.length = 0;
  Game.villageMeal();
  const wildLine = said.join(' ').includes('camp wild');
  ok(wildLine, 'far-from-every-fire joined scholar camps wild (no remote draw)',
    'said: ' + said.join(' | ').slice(0, 160));
  ok((Game.state.scholar.kcal || 0) <= kcalBefore + 1,
    'no phantom meal kcal while far away', 'before=' + kcalBefore + ' after=' + Game.state.scholar.kcal);

  // ================= H1: travel arrival copy vs engine =================
  console.log('\n[H1] HONESTY: arrival copy vs engine');
  await freshGame();
  const sx = Game.map.px, sy = Game.map.py;
  const tgt = Game.travelTargets().find(tt => tt.d === 1 && Game.tileAt(tt.x, tt.y).revealed);
  if (!tgt) { ok(false, 'a revealed adjacent target exists'); }
  else {
    const ticksBefore = Game.state.scholar.dayTicks || 0;
    said.length = 0;
    Game.travelTo(tgt.x, tgt.y);
    const dest = Game.tileAt(tgt.x, tgt.y);
    const line = said.join('\n');
    const TILE_NAME = (globalThis.Scattering || {}).TILE_NAME || {};
    ok(line.includes('Travel 1 tile to ' + (TILE_NAME[dest.type] || dest.type)),
      'arrival line names the true destination', 'said: ' + line.split('\n')[0]);
    ok((Game.state.scholar.dayTicks || 0) === ticksBefore,
      'node travel costs the player no ticks (Steve: free)',
      'dayTicks ' + ticksBefore + ' -> ' + Game.state.scholar.dayTicks);
  }

  console.log('\n==== ' + pass + ' passed, ' + fail + ' failed ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
