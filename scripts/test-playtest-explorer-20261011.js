// PLAYTEST LOOP 2026-10-11 — explorer adversarial attacks (rotation idx 1).
// Prior art: break-it travel r1–r12 (fog leaks, examine spam, corpse-walks,
// ping-pong, glasswing, diagonal blockage, MoveAnim, state.over phantoms,
// away-party double-booking), explorer loop guards (examineCell post-death +
// mid-fight 2026-10-09, dowsing/echo 13-tile free-reveal fixes 2026-10-10,
// hive_sight display-only 2026-10-10). This run attacks what they did NOT:
//
//   E1 — EXPLOIT: theorizeWith (dialog rebuild 2026-10-11) has NO post-death
//     or mid-fight guards — the same class examineCell got on 2026-10-09.
//     Theorizing is time-only (tickAction(2), which no-ops in combat) and
//     grants REAL effects: skill encounters (analytical: +2/theorize ->
//     level 1 in 2 theorizes), trust via resolver, energy, cheer, goals.
//     A stale conversation card post-death / mid-fight farms all of it for
//     free (mid-fight) or for a corpse (post-death).
//   S1 — SOFTLOCK-adjacent: the corpse conversation. Post-death theorizeWith
//     narrates full theory lines, teaches skills, builds trust, raises
//     energy — the dead advancing the world.
//   H1 — HONESTY (fog): dowsing's fix (2026-10-10) narrowed the free reveal
//     to the single water tile ("the tile itself is the find") but wrote
//     tile.revealed WITHOUT markSeen — the world-map overlay (seenTiles-
//     gated) still reads "Unexplored — you haven't been here" for ground
//     the log just told you about. Same mismatch class as the scout r8 fix
//     (map must agree with the log). echo_location's "3x3 revealed" has the
//     identical gap: t.revealed=true, overlay fogged.
//   H2 — HONESTY: the monstersGated knowledge gate (dialog rebuild
//     2026-10-11). Assert the ungated monster-theory pools carry no true
//     monster names, and that gated lines only draw once the village has a
//     real encounter codex entry (ensureMonsterEntry = faced, not rumored).
//   FUN: the theorize lines are genuinely good ("terrarium", "Learn the
//     quiet") — this verb deserves the guards, not a nerf.
//
// Usage: node scripts/test-playtest-explorer-20261011.js [SEED]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '424242', 10);

const PAIRS = [
  ['plants.json', 'plants'], ['biomes.json', 'biomes'], ['monsters.json', 'monsters'],
  ['villagers.json', 'villagers'], ['abilities.json', 'abilities'], ['items.json', 'items'],
  ['background_survivors.json', 'background_survivors'], ['cell_defs.json', 'cellDefs'],
  ['animals.json', 'animals'], ['recipes.json', 'recipes'], ['books.json', 'books'],
  ['relicEnhancements.json', 'relicEnhancements'], ['locations.json', 'locations'],
  ['characterGen.json', 'characterGen'], ['knowledge.json', 'knowledge'],
  ['nameCultures.json', 'nameCultures'], ['originPicker.json', 'originPicker'],
  ['foreignSpeech.json', 'foreignSpeech'], ['lifeseeds.json', 'lifeseeds'],
  ['arrivalText.json', 'arrivalText'], ['justiceVoice.json', 'justiceVoice'],
  ['alienPlayers.json', 'alienPlayers'], ['regions.json', 'regions'],
  ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = (key === 'contests' || key === 'items' || key === 'monsters') ? [] : {}; }
}

// ---------- seeded RNG BEFORE eval ----------
function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let _rng = mulberry32(SEED);
function rng() { return _rng(); }
rng.reset = (s) => { _rng = mulberry32(s); };
Math.random = rng;

// ---------- eval FULL script list in index.html order, minus DOM-only ----------
global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js',
  'game.js', 'encounters.js', 'conversation.js', 'convo-mood.js',
  'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js',
  'party-formal.js', 'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js',
  'alienPlayers.js', 'storage.js', 'perceive.js', 'carexplore.js', 'justice.js',
  'food.js', 'betrayal.js', 'corpses.js', 'corruption.js', 'lifeseed.js',
  'progression.js', 'waveLedger.js', 'feastBuff.js', 'ledger.js', 'abilityActions.js',
  'monsterBehaviors.js', 'partyTactics.js', 'sigW3a.js', 'statusEffects.js',
  'sigW3b.js', 'metaProgression.js', 'sigW3c.js', 'villager-agency.js',
  'fieldFights.js', 'villager-objectives.js', 'codex-people.js', 'membership.js',
  'havenGrowth.js', 'hierarchy.js', 'comms.js', 'safetynets.js', 'villageAgency.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  let code;
  try { code = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8'); }
  catch (e) { console.error('MISSING', f); process.exit(2); }
  try { eval.call(global, code + '\n//# sourceURL=' + f); }
  catch (e) { console.error('EVAL FAIL', f, e.message); process.exit(2); }
}
delete global.window; // sync-path combat etc.

const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name, extra || ''); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

// ---------- plumbing ----------
const said = [];
Game.sysSay = function(t) { said.push(String(t)); };
Game.say = function(t) { said.push(String(t)); };
Game.audioEvent = function() {};
Game.drama = function() {};
Game.tele = function() {};
Game.recordMoment = function() {};
Game.contestLearn = function() {};
Game.villagerGainXP = function() {};
Game.kcalCap = function() { return 2400; };
Game.maxHealth = function() { return 100; };
Game.havenViewership = function() { return (this.state.village || {}).viewership || 0; };
Game.unlockedWave = function() { return 2; };
Game.monsterWavePool = function() { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };

// ---------- minimal game boot ----------
function bootGame() {
  rng.reset(SEED);
  said.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  try { Game.depart(); } catch (e) {}
  const s = Game.state.scholar;
  s.day = 15;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  s.energy = 50; s.actionClock = 0; s.dayTicks = 0;
  s.inventory = s.inventory || [];
  Game.over = false; // NOTE: over is a direct Game property (game.js:2244), not state.over
  Game.state.over = false;
  Game.tbfight = null;
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.encounters = {};
  Game.state.codex.skills = {};
  Game.state.codex.monsters = {};
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.cheer = 0;
  Game.state.village.goalsKnown = {};
  Game.state.village.theoriesSaid = {};
}
function scholarVid() { return Game.villagerId; }
function pickVillager() {
  const roster = (Game.state.village.roster || []).filter(id => id !== scholarVid());
  const vid = roster[0];
  // force analytical/practical so mechanical effects are deterministic.
  // npcIntel prefers the hydrated person's intelligence over bgIntel.
  try {
    const p = Game.getPerson(vid);
    if (p) p.intelligence = { primary: 'analytical', secondary: 'practical' };
  } catch (e) {}
  Game.state.village.bgIntel = Game.state.village.bgIntel || {};
  Game.state.village.bgIntel[vid] = { primary: 'analytical', secondary: 'practical' };
  return vid;
}
function snap() {
  const s = Game.state.scholar, v = Game.state.village;
  return {
    enc: JSON.stringify(s && Game.state.codex.encounters || {}),
    skills: JSON.stringify(Game.state.codex.skills || {}),
    trust: JSON.stringify(v.trust || {}),
    energy: s.energy, cheer: v.cheer,
    goals: JSON.stringify(v.goalsKnown || {}),
    clock: s.actionClock || 0,
    saidN: said.length,
    theoriesSaid: JSON.stringify(v.theoriesSaid || {}),
  };
}
function diffKeys(a, b) {
  const out = [];
  for (const k of Object.keys(a)) if (a[k] !== b[k]) out.push(k);
  return out;
}

console.log('== E1/S1: theorizeWith post-death and mid-fight guards ==');
bootGame();
const vid = pickVillager();

// --- E1a: the corpse theorizes ---
const before0 = snap();
Game.over = true; // dead (direct property, cf. game.js:2244)
let threw0 = null;
try { Game.theorizeWith(vid, 'system'); } catch (e) { threw0 = e.message; }
const after0 = snap();
const d0 = diffKeys(before0, after0);
ok('dead: no throw', !threw0, threw0 || '');
ok('dead: nothing narrated for the corpse', after0.saidN === before0.saidN, `said ${before0.saidN}->${after0.saidN}`);
ok('dead: no skill encounters granted', d0.indexOf('enc') === -1 && d0.indexOf('skills') === -1, 'changed: ' + d0.join(','));
ok('dead: no trust/energy/cheer/goals moved', ['trust','energy','cheer','goals'].every(k => d0.indexOf(k) === -1), 'changed: ' + d0.join(','));

// --- E1b: mid-fight theorize farms encounters with zero time cost ---
Game.over = false;
Game.tbfight = { over: false }; // live fight
const before1 = snap();
const clock1 = Game.state.scholar.actionClock || 0;
let threw1 = null;
try { Game.theorizeWith(vid, 'monsters'); } catch (e) { threw1 = e.message; }
const after1 = snap();
const d1 = diffKeys(before1, after1);
const clockDelta1 = (Game.state.scholar.actionClock || 0) - clock1;
ok('mid-fight: no throw', !threw1, threw1 || '');
ok('mid-fight: encounters do not accrue while the world stands still', d1.indexOf('enc') === -1 && d1.indexOf('skills') === -1, 'changed: ' + d1.join(','));
ok('mid-fight: no trust/energy/cheer/goals moved', ['trust','energy','cheer','goals'].every(k => d1.indexOf(k) === -1), 'changed: ' + d1.join(','));
ok('mid-fight: tick cost evaporates or refusal is clean (clock delta 0)', clockDelta1 === 0, 'delta=' + clockDelta1);
Game.tbfight = null;

// --- T3: alive-and-well theorize still works and costs real time ---
const before2 = snap();
const clock2 = Game.state.scholar.actionClock || 0;
Game.theorizeWith(vid, 'system');
const after2 = snap();
const d2 = diffKeys(before2, after2);
const clockDelta2 = (Game.state.scholar.actionClock || 0) - clock2;
ok('alive: theorizing grants skill encounters', (Game.state.codex.encounters['system_theology'] || 0) >= 2, 'enc=' + JSON.stringify(Game.state.codex.encounters));
ok('alive: the 2-tick cost is real when the world is running', clockDelta2 === 2, 'delta=' + clockDelta2);
ok('alive: theories said recorded', d2.indexOf('theoriesSaid') !== -1);

console.log('== H1: dowsing / echo map honesty (fog) ==');
// --- dowsing: the found tile must agree with the log ---
bootGame();
const s = Game.state.scholar;
s.abilities = s.abilities || [];
if (!s.abilities.some(a => (a.id || a) === 'dowsing')) s.abilities.push({ id: 'dowsing' });
// guarantee a water tile exists within reach
const tiles = Game.map.tiles;
let waterTile = null;
outer: for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
  if (tiles[y][x].type === 'creek' || tiles[y][x].type === 'wetland') { waterTile = { x, y }; break outer; }
}
if (!waterTile) { tiles[2][6].type = 'creek'; waterTile = { x: 6, y: 2 }; }
console.log('   water at', waterTile.x + ',' + waterTile.y, 'player at', Game.map.px + ',' + Game.map.py);
// fire dowsing (retry seeds until the 70% roll lands)
let dowsed = null;
for (let tries = 0; tries < 12 && !dowsed; tries++) {
  rng.reset(SEED + 1000 + tries);
  said.length = 0;
  const n0 = said.length;
  Game.activateAbility('dowsing');
  const line = said.slice(n0).find(t => /twitches/.test(t));
  if (line) {
    // find the tile dowsing marked: seenTiles entry by:'dowsing'
    const st = Game.state.scholar.seenTiles || {};
    for (const k of Object.keys(st)) {
      if (st[k] && st[k].by === 'dowsing') {
        const [x, y] = k.split(',').map(Number);
        dowsed = { x, y };
      }
    }
  }
  // reset revealed flags + dowsing marks between attempts so detection is per-attempt
  if (!dowsed) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
    const k = x + ',' + y;
    const e = (Game.state.scholar.seenTiles || {})[k];
    if (e && e.by === 'dowsing') delete Game.state.scholar.seenTiles[k];
    if (!((Game.state.scholar.seenTiles || {})[k])) Game.tileAt(x, y).revealed = false;
  }
}
ok('dowsing fired within 12 seeds', !!dowsed, dowsed ? `at ${dowsed.x},${dowsed.y}` : '');
if (dowsed) {
  const seen = Game.mapSeen(dowsed.x, dowsed.y);
  ok('dowsed tile: map agrees with the log (seenTiles shared, not fogged)', seen === 'shared', 'mapSeen=' + seen);
  const tt = (Game.travelTargets() || []).some(t => t.x === dowsed.x && t.y === dowsed.y);
  console.log('   travelTargets offers dowsed tile:', tt);
}

// --- echo_location: "3x3 revealed" must mean revealed on the map ---
bootGame();
const s2 = Game.state.scholar;
s2.abilities = s2.abilities || [];
if (!s2.abilities.some(a => (a.id || a) === 'echo_location')) s2.abilities.push({ id: 'echo_location' });
said.length = 0;
Game.activateAbility('echo_location');
let echoBad = [];
for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
  const nx = Game.map.px + dx, ny = Game.map.py + dy;
  if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
  const t = Game.tileAt(nx, ny);
  if (!t.revealed) echoBad.push(`${nx},${ny}:not-revealed`);
  else if (nx === Game.map.px && ny === Game.map.py) { /* visited by position */ }
  else if (Game.mapSeen(nx, ny) !== 'shared') echoBad.push(`${nx},${ny}:seen=` + Game.mapSeen(nx, ny));
}
ok('echo 3x3: every tile revealed AND map-visible (shared)', echoBad.length === 0, echoBad.slice(0, 4).join(' '));

console.log('== H2: monstersGated theories stay gated ==');
bootGame();
const vid2 = pickVillager();
Game.state.codex.monsters = {}; // no encounters yet
const gatedPools = [];
{
  const th = (Game.data.characterGen || {}).theories || {};
  for (const idef of Object.values(th)) for (const l of (idef.monstersGated || [])) gatedPools.push(l);
}
ok('gated pools exist to test', gatedPools.length > 0, gatedPools.length + ' lines');
const seenLines = new Set();
for (let i = 0; i < 60; i++) {
  Game.state.village.theoriesSaid = {}; // allow line repeats to sample the pool
  const line = Game.theorizeWith(vid2, 'monsters');
  if (line) seenLines.add(line);
}
const leaked = [...seenLines].filter(l => gatedPools.indexOf(l) !== -1);
ok('no gated line fires before any monster encounter', leaked.length === 0, leaked.slice(0, 2).join(' | '));
// now earn an encounter and re-sample: gated lines should become reachable
Game.ensureMonsterEntry('hushwolf');
const seenLines2 = new Set();
for (let i = 0; i < 60; i++) {
  Game.state.village.theoriesSaid = {};
  const line = Game.theorizeWith(vid2, 'monsters');
  if (line) seenLines2.add(line);
}
const gatedSeen = [...seenLines2].filter(l => gatedPools.indexOf(l) !== -1);
ok('gated lines become reachable after a real encounter', gatedSeen.length > 0, gatedSeen.slice(0, 2).join(' | '));

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
