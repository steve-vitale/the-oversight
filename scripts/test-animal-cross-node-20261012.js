'use strict';
// Proof: animals crossing a node edge stay live on the neighboring tile
// (Steve 2026-10-12 — "nothing just disappears off the map for no reason").
// 1. encAnimalCrossNode parks the LIVE animal on the neighbor at the entry edge.
// 2. World edge keeps the old release behavior.
// 3. animalTurn drives the edgeTurns escape through the crossing.
// 4. travelTo onto the neighbor resumes the encounter (continuity pickup).
// 5. Legitimate vanishes are untouched: alarmed burrow still releases.
//
// RED check: `git stash` the src/ changes (keep this file) and this test fails.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name, extra ? '— ' + extra : ''); }
}

// ---- seeded RNG BEFORE eval (modules capture Math.random at load) ----
function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(20261012);

// ---- environment stubs ----
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
global.localStorage = { _d: {}, getItem(k) { return (k in this._d) ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };

// ---- eval full script list in index.html order, minus DOM-only ----
// equipment.js needs `window` at load; stub it for eval, then delete before
// playing so combat takes the sync path (AGENTS.md lesson).
global.window = global;
const SKIP = new Set(['src/js/drama.js', 'src/js/move-anim.js', 'src/js/sprites.js', 'src/js/tile-scenes.js', 'src/js/app.js']);
const ORDER = "src/js/engine/state.js|src/js/engine/modifiers.js|src/js/engine/calories.js|src/js/engine/day.js|src/js/engine/forage.js|src/js/engine/combat.js|src/js/audio-registry.js|src/js/game.js|src/js/encounters.js|src/js/conversation.js|src/js/convo-mood.js|src/js/convoTopics.js|src/js/convo-wants.js|src/js/convo-dialogue.js|src/js/convo-beats.js|src/js/convo-scene.js|src/js/voice-piper.js|src/js/voice-system.js|src/js/examine.js|src/js/equipment.js|src/js/journal.js|src/js/party.js|src/js/party-formal.js|src/js/truth.js|src/js/galactic-cast.js|src/js/contests.js|src/js/broadcast.js|src/js/contestEngine.js|src/js/alienPlayers.js|src/js/storage.js|src/js/perceive.js|src/js/carexplore.js|src/js/justice.js|src/js/food.js|src/js/betrayal.js|src/js/corpses.js|src/js/corruption.js|src/js/lifeseed.js|src/js/spawn-knack.js|src/js/trial-deeds.js|src/js/practice-deeds.js|src/js/progression.js|src/js/waveLedger.js|src/js/feastBuff.js|src/js/ledger.js|src/js/abilityActions.js|src/js/monsterBehaviors.js|src/js/partyTactics.js|src/js/sigW3a.js|src/js/statusEffects.js|src/js/sigW3b.js|src/js/metaProgression.js|src/js/sigW3c.js|src/js/sigW4.js|src/js/sigW5.js|src/js/villager-agency.js|src/js/fieldFights.js|src/js/villager-objectives.js|src/js/codex-people.js|src/js/membership.js|src/js/havenGrowth.js|src/js/hierarchy.js|src/js/comms.js|src/js/table.js|src/js/pods.js|src/js/titans.js|src/js/finale-campaign.js|src/js/godhood.js|src/js/table-feared.js|src/js/table-indispensable.js|src/js/table-beloved.js|src/js/table-witness.js|src/js/table-assimilated.js|src/js/table-defiant.js|src/js/relay-ext.js|src/js/relay-dialogue.js|src/js/table-relay.js|src/js/safetynets.js|src/js/villageAgency.js|src/js/debug-scenarios.js|src/js/build.js".split('|');
for (const f of ORDER) {
  if (SKIP.has(f)) continue;
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.log('EVAL FAIL', f, e.message); process.exit(2); }
}
const Game = globalThis.Scattering.Game;
delete global.window; // sync combat path from here on
ok('Game loads', !!Game && !!Game.encAnimalCrossNode);

async function main() {
await Game.init();
ok('data loads', !!(Game.data && Game.data.abilities));

function flatGrid() { return Array.from({ length: 9 }, () => Array(9).fill('grass')); }
function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.mx = 4; s.my = 4; s.kcal = 3000; s.energy = 60; s.health = 100;
  Game.genDetail = flatGrid;
  Game.log = [];
  return s;
}
function logText() { const t = Game.log.map(String).join('\n'); Game.log = []; return t; }
function mkDeer(mx, my, extra) {
  const cfg = Game.encPreyCfg('white_tailed_deer');
  return Object.assign({ id: 'white_tailed_deer', mx, my, aware: 1, stamina: 5, pstate: 'bolt', edgeTurns: 0, wild: true, hunger: 40, turns: 3 }, extra || {});
}

// ---------- 1. direct crossing: east edge -> neighbor holds the live animal ----------
{
  const s = freshGame();
  const px = Game.map.px, py = Game.map.py;
  const dir = px < 8 ? 1 : -1; // east unless at world edge
  const a = mkDeer(dir === 1 ? 8 : 0, 4);
  s.animal = a;
  const ntBefore = Game.tileAt(px + dir, py);
  ok('neighbor tile exists', !!ntBefore);
  const said = Game.encAnimalCrossNode(a);
  const nt = Game.tileAt(px + dir, py);
  ok('cross returns true', said === true);
  ok('neighbor holds the LIVE animal object', nt.animal === a);
  ok('scholar.animal cleared', s.animal === null);
  ok('parked at entry edge', nt.animal.mx === (dir === 1 ? 0 : 8));
  ok('still bolting, fresh edge clock', nt.animal.pstate === 'bolt' && nt.animal.edgeTurns === 0);
  const t = logText();
  ok('narrates direction + follow?', /bolts (east|west) into the .* — follow\?/.test(t), t.slice(0, 120));
}

// ---------- 2. world edge: no neighbor -> old release ----------
{
  const s = freshGame();
  Game.map.px = 8; // force world-east edge
  const a = mkDeer(8, 4);
  s.animal = a;
  const tile = Game.tileAt(8, Game.map.py);
  const before = (tile.wildlife && tile.wildlife['white_tailed_deer']) || 0;
  const r = Game.encAnimalCrossNode(a);
  ok('world edge returns false', r === false);
  ok('animal not parked anywhere absurd', s.animal === a); // caller decides; we only parked nothing
}

// ---------- 3. hint direction: dash hint wins over position ----------
{
  const s = freshGame();
  const px = Game.map.px, py = Game.map.py;
  if (px > 0 && py > 0) {
    const a = mkDeer(0, 0); // corner
    s.animal = a;
    Game.encAnimalCrossNode(a, -1, -0.2); // dashing west-ish
    const nt = Game.tileAt(px - 1, py);
    ok('hint picks west neighbor', nt.animal === a && a.mx === 8);
  } else { ok('hint test skipped (map corner)', true); }
}

// ---------- 4. animalTurn drives the edge escape through the crossing ----------
{
  const s = freshGame();
  const px = Game.map.px, py = Game.map.py;
  const dir = px < 8 ? 1 : -1;
  const a = mkDeer(dir === 1 ? 8 : 0, 4, { edgeTurns: 1 }); // edgeNeed=2 for wary
  s.animal = a;
  s.mx = dir === 1 ? 6 : 2; s.my = 4; // dist 2: close enough to keep it bolting, far enough to avoid the corner
  Game.animalTurn();
  const nt = Game.tileAt(px + dir, py);
  ok('animalTurn crossed the animal', nt.animal === a);
  ok('scholar.animal cleared by turn', s.animal === null);
  const t = logText();
  ok('no silent vanish ("melts into the treeline. Gone." absent)', !/melts into the treeline\. Gone\./.test(t));
}

// ---------- 5. travelTo resumes the encounter ----------
{
  const s = freshGame();
  const px = Game.map.px, py = Game.map.py;
  const dir = px < 8 ? 1 : -1;
  const a = mkDeer(dir === 1 ? 8 : 0, 4);
  s.animal = a;
  Game.encAnimalCrossNode(a);
  ok('crossed before travel', Game.tileAt(px + dir, py).animal === a);
  Game.travelTo(px + dir, py);
  ok('encounter resumes on arrival', Game.state.scholar.animal === a);
  ok('tile slot consumed', !Game.tileAt(px + dir, py).animal);
}

// ---------- 6. legitimate vanish untouched: alarmed burrow ----------
{
  const s = freshGame();
  const px = Game.map.px, py = Game.map.py;
  const dir = px < 8 ? 1 : -1;
  const a = Object.assign(mkDeer(dir === 1 ? 8 : 0, 4), { id: 'groundhog', edgeTurns: 5 });
  s.animal = a;
  s.mx = dir === 1 ? 6 : 2; s.my = 4; // dist 2: keeps it engaged, not cornered
  const tile = Game.tileAt(px, py);
  const before = (tile.wildlife && tile.wildlife['groundhog']) || 0;
  Game.animalTurn();
  const after = (tile.wildlife && tile.wildlife['groundhog']) || 0;
  ok('groundhog burrows (wildlife pool +1)', after === before + 1, `before=${before} after=${after}`);
  ok('no neighbor parking for burrow', !Game.tileAt(px + 1, py) || Game.tileAt(px + 1, py).animal !== a);
  const t = logText();
  ok('burrow narration kept', /burrow/.test(t));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
}

main().catch(e => { console.log('HARNESS FAIL', e); process.exit(2); });
