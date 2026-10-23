// probe-alien-abilities-20261022.js -- DEEPENING r34 P1:
// Do the three alien-pool ABILITIES fire on their real trigger paths?
// r32 proved the vector channel fires (scholar-only) but left the abilities
// "untested, not broken". This probe applies each status via the real
// applyStatus and drives the real trigger function — zero src/js changes.
//
// east_nile: wanderer cast in checkEncounter() -> crow direction warning.
// eurika:    wanderer on scholar tile in checkEncounter() -> mosquito-sense
//            warning, no ambush (same slot as eyes_in_back).
// lemons:    eat() with food -> +20% kcal absorbed, narrated.
//
// Usage: node scripts/probe-alien-abilities-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const CROW_RX = /crows are screaming/i;
const QUIET_RX = /birds went quiet/i;
const SENSE_RX = /skin prickles before your eyes catch up|no ambush [—-] your skin knew first/i;
const AMBUSH_RX = /Something big is HERE/i;
const ENGORGE_RX = /occupied joints drink deeper/i;

let lines = [];
function hookSay(Game) {
  const _say = Game.say.bind(Game);
  Game.say = function (s) { try { if (s != null) lines.push(String(s)); } catch (e) {} return _say(s); };
}
async function freshGame(seed) {
  lines = [];
  const { Game } = await loadGame({ seed, mode: 'probe-alien-abilities-r34' });
  hookSay(Game);
  await setupGame(Game);
  return Game;
}
function hasStatus(Game, id) {
  try { return !!(Game.hasStatus && Game.hasStatus('scholar', id)); } catch (e) { return false; }
}
// checkEncounter() early-returns on safe tiles (villages). The fresh scholar
// starts at haven — move to a wild tile so the real encounter path runs.
function goWild(Game) {
  const tiles = (Game.map && Game.map.tiles) || [];
  for (let y = 0; y < tiles.length; y++) for (let x = 0; x < tiles[y].length; x++) {
    try { if (!Game.isSafeTile(x, y)) { Game.map.px = x; Game.map.py = y; return { x, y }; } } catch (e) {}
  }
  throw new Error('no wild tile found');
}
const results = [];
function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail: detail || '' });
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function probeCrow() {
  console.log('\n--- Probe A: east_nile crow warning (checkEncounter wanderer cast) ---');
  // CONTROL: no status -> birds go quiet
  let G = await freshGame(4242);
  goWild(G);
  G.state.scholar.day = 5;
  G.state.wandererNextDay = 5;
  G.wanderer = null;
  lines = [];
  try { G.checkEncounter(); } catch (e) { check('A-control checkEncounter runs', false, 'threw: ' + e.message); return; }
  const castC = !!G.wanderer;
  const quietC = lines.some(l => QUIET_RX.test(l));
  const crowC = lines.some(l => CROW_RX.test(l));
  check('A-control wanderer casts', castC, `wanderer=${castC}`);
  check('A-control birds go quiet (no status)', quietC && !crowC, `quiet=${quietC} crow=${crowC}`);

  // TEST: east_nile held -> crows scream the direction
  G = await freshGame(4243);
  goWild(G);
  G.state.scholar.day = 5;
  G.state.wandererNextDay = 5;
  G.wanderer = null;
  G.applyStatus('scholar', 'east_nile', { source: 'probe' });
  check('A-test status applied', hasStatus(G, 'east_nile'));
  lines = [];
  try { G.checkEncounter(); } catch (e) { check('A-test checkEncounter runs', false, 'threw: ' + e.message); return; }
  const castT = !!G.wanderer;
  const crowLines = lines.filter(l => CROW_RX.test(l));
  const quietT = lines.some(l => QUIET_RX.test(l));
  check('A-test wanderer casts', castT, `wanderer=${castT}`);
  check('A-test crows scream direction', crowLines.length > 0 && !quietT,
    crowLines.length ? crowLines[0].slice(0, 110) : 'no crow line; quiet=' + quietT);
}

async function probeEurika() {
  console.log('\n--- Probe B: eurika mosquito-sense (wanderer on tile -> no ambush) ---');
  // TEST: eurika held, wanderer on scholar tile
  let G = await freshGame(4343);
  goWild(G);
  G.state.scholar.day = 5;
  const px = G.map.px, py = G.map.py;
  G.wanderer = { x: px, y: py, dir: 1, monsterId: 'hushwolf', veteran: false, warned: false };
  G.applyStatus('scholar', 'eurika', { source: 'probe' });
  check('B-test status applied', hasStatus(G, 'eurika'));
  lines = [];
  try { G.checkEncounter(); } catch (e) { check('B-test checkEncounter runs', false, 'threw: ' + e.message); return; }
  const senseT = lines.some(l => SENSE_RX.test(l));
  const ambushT = lines.some(l => AMBUSH_RX.test(l));
  const warnedT = !!(G.wanderer && G.wanderer.warned);
  check('B-test mosquito-sense warns', senseT && warnedT, `sense=${senseT} warned=${warnedT}`);
  check('B-test no ambush spawn', !ambushT, `ambushSpawn=${ambushT}`);

  // CONTROL: no status -> ambush spawns in the grid
  G = await freshGame(4344);
  goWild(G);
  G.state.scholar.day = 5;
  G.wanderer = { x: G.map.px, y: G.map.py, dir: 1, monsterId: 'hushwolf', veteran: false, warned: false };
  lines = [];
  try { G.checkEncounter(); } catch (e) { check('B-control checkEncounter runs', false, 'threw: ' + e.message); return; }
  const ambushC = lines.some(l => AMBUSH_RX.test(l));
  const senseC = lines.some(l => SENSE_RX.test(l));
  check('B-control ambush spawns without eurika', ambushC && !senseC, `ambush=${ambushC} sense=${senseC}`);
}

async function probeLemons() {
  console.log('\n--- Probe C: lemons engorge (eat -> +20% kcal) ---');
  // TEST: lemons held
  let G = await freshGame(4444);
  const s = G.state.scholar;
  s.kcal = 0;
  s.inventory = [];
  G.applyStatus('scholar', 'lemons', { source: 'probe' });
  check('C-test status applied', hasStatus(G, 'lemons'));
  s.inventory.push({ plantId: 'probe_meat', foodKind: 'meat', foodState: 'cooked', edible: true, units: 1, kcalEach: 500, spoilDay: 9999, name: 'Probe meat' });
  const before = s.kcal || 0;
  lines = [];
  try { G.eat(); } catch (e) { check('C-test eat runs', false, 'threw: ' + e.message); return; }
  const gained = (s.kcal || 0) - before;
  const engorgeT = lines.some(l => ENGORGE_RX.test(l));
  check('C-test +20% kcal absorbed', gained === 600, `gained=${gained} expected=600`);
  check('C-test engorge narrated', engorgeT, `engorgeLine=${engorgeT}`);

  // CONTROL: no lemons -> flat 500
  G = await freshGame(4445);
  const s2 = G.state.scholar;
  s2.kcal = 0;
  s2.inventory = [];
  s2.inventory.push({ plantId: 'probe_meat', foodKind: 'meat', foodState: 'cooked', edible: true, units: 1, kcalEach: 500, spoilDay: 9999, name: 'Probe meat' });
  const before2 = s2.kcal || 0;
  try { G.eat(); } catch (e) { check('C-control eat runs', false, 'threw: ' + e.message); return; }
  const gained2 = (s2.kcal || 0) - before2;
  check('C-control flat kcal without lemons', gained2 === 500, `gained=${gained2} expected=500`);
}

async function main() {
  try { await probeCrow(); } catch (e) { console.log('PROBE A FATAL: ' + (e && e.stack || e)); }
  try { await probeEurika(); } catch (e) { console.log('PROBE B FATAL: ' + (e && e.stack || e)); }
  try { await probeLemons(); } catch (e) { console.log('PROBE C FATAL: ' + (e && e.stack || e)); }
  const pass = results.filter(r => r.pass).length;
  console.log(`\n########## PROBE COMPLETE: ${pass}/${results.length} PASS ##########`);
  const fails = results.filter(r => !r.pass);
  if (fails.length) { console.log('FAILURES:'); for (const f of fails) console.log(` - ${f.name}: ${f.detail}`); process.exitCode = 1; }
}
main().catch(e => { console.error('PROBE HARNESS ERROR:', e); process.exit(2); });
