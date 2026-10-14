#!/usr/bin/env node
// PROOF: ability/synergy discoverability (Steve 2026-10-13).
// "This knowledge must be discovered somehow" — NO free wiki. The ability
// codex (state.codex.abilities) fills ONLY through diegetic paths:
//   L1 heard-of: gossip/hearing a grant / System mention
//   L2 seen: witnessing a villager use it, mentor teaching
//   L3 understood: personal use (reveals synergy links)
// Plus: System progressive revelation at integration thresholds (L1 for the
// noticed build's pool), and hintBeat as a knowledge-gated build guide
// (names only L1+ abilities, teases the rest).
//
// RED: a fresh codex is empty — no browsable list (the wiki is absent).
// GREEN: each diegetic path fills the codex; the UI section renders only
// discovered entries.
//
// MEASUREMENT.md: seeded PRNG before module load; SEED env override;
// green on >=3 seeds. Sense-reads: prints codex beats + hint text.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
function loadAll(seed) {
  delete globalThis.Scattering;
  Math.random = mulberry32(seed);
  global.window = global;
  global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
  global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const files = [...html.matchAll(/<script src="([^"]+)"/g)]
    .map(m => m[1].split('?')[0])
    .filter(f => f.startsWith('src/js/'))
    .filter(f => !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(f));
  for (const f of files) eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  delete global.window;
  return globalThis.Scattering.Game;
}
const Game = loadAll(SEED);
// item tier map (normally injected at Game.init data load)
try {
  const S = globalThis.Scattering;
  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
  S.ITEM_TIER = {};
  for (const it of items) if (it && it.id && it.lootTier) S.ITEM_TIER[it.id] = it.lootTier;
  // GOD-PATH REDESIGN (2026-10-14): godhood.json retired; capstones derive
  // from godpaths.json + the path tags on abilities.json.
  S.GODPATHS = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/godpaths.json'), 'utf8'));
} catch (e) {}

let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures++;
}

// fresh minimal game state (no full newGame — we test the codex unit)
Game.state = Game.state || {};
Game.state.codex = { abilities: {} };
Game.state.scholar = { day: 50, abilities: [], synergies: [], activeSynergies: [] };
Game.state.village = { roster: [], npcAbilities: {}, npcSynergies: {} };
Game.state.systemArrived = true;
const said = [];
Game.say = (t) => said.push(String(t));
Game.sysSay = (t) => said.push('[SYS] ' + String(t));
Game.data = Game.data || {};
try {
  Game.data.abilities = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/abilities.json'), 'utf8'));
  Game.data.synergies = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/synergies.json'), 'utf8'));
} catch (e) {}

// ---- RED: no wiki — fresh codex is empty, unknown abilities have no entry ----
check('RED fresh codex knows nothing (no free wiki)', Game.codexAbilityLevel('tracker') === 0);
check('RED codex has no entry for unseen ability', !((Game.state.codex.abilities || {})['tracker']));

// ---- GREEN: diegetic paths ----
// D1: hearing a villager grant -> L1 (name + rumor, NOT the description)
Game.state.village.roster = ['v1'];
Game.villagerId = 'player';
Game.vpOf = () => null;
Game.getPerson = () => null;
Game.displayName = (id) => id;
Game.codexLearnAbility('tracker', 1, 'grant-heard');
check('D1 grant-heard -> L1', Game.codexAbilityLevel('tracker') === 1);
const l1say = said.join('\n');
check('D1 L1 beat names it but hides mechanics', /heard of/.test(l1say) && !/find_chance/.test(l1say), 'beat: ' + said[said.length-1].slice(0, 80));

// D2: witnessing use -> L2 (description revealed)
said.length = 0;
Game.noteVillagerAbilityUse('v1', 'tracker');
check('D2 witnessed use -> L2', Game.codexAbilityLevel('tracker') === 2);
check('D2 L2 beat shows what it does', said.join('\n').includes('SEEN'), said[said.length-1].slice(0, 90));

// D3: personal use -> L3 (synergy links revealed)
said.length = 0;
Game.state.scholar.synergies = ['apex_sense'];
Game.codexLearnAbility('tracker', 3, 'personal-use');
check('D3 personal use -> L3', Game.codexAbilityLevel('tracker') === 3);
const hints = Game.codexAbilitySynergyHints('tracker');
check('D3 L3 reveals synergy link', /Apex Sense/.test(hints), 'hints: ' + hints);

// D4: levels never decrease
Game.codexLearnAbility('tracker', 1, 'gossip');
check('D4 knowledge never decreases', Game.codexAbilityLevel('tracker') === 3);

// D5: mentor teaching path exists and is callable (25% chance — force by seeding attempts)
let taught = false;
for (let i = 0; i < 40 && !taught; i++) {
  Game.state.codex.abilities = {}; // reset
  Game.state.village.npcAbilities = { v1: ['diplomat'] };
  Game.partyMembers = () => ['v1'];
  Game.isPlayer = (id) => id === 'player';
  Game.getPerson = (id) => ({ name: 'Mara Test', dead: false, abilityWeights: { care: 1, fieldcraft: 1, system: 1 } });
  Game.playerAtHaven = () => false;
  Game.plantsKnownBy = () => [];
  try { Game.mentorTick(Game.state.village); } catch (e) {}
  if (Game.codexAbilityLevel('diplomat') >= 2) taught = true;
}
check('D5 mentor can teach L2 (observed within 40 ticks)', taught);

// D6: System revelation at integration threshold (L1 for noticed build's pool)
Game.state.codex.abilities = {};
// GOD-PATH (2026-10-14): pools are magic only; a hunter build is magic.
Game.state.scholar.abilities = [{ id: 'static_toss' }, { id: 'bloodhound' }, { id: 'lucky_rock' }];
Game.state.scholar.day = 50;
Game.state.day = 50;
said.length = 0;
Game.systemRevealPoolAbilities(40);
const revealed = Object.keys(Game.state.codex.abilities || {});
check('D6 system reveals L1 pool abilities at threshold 40', revealed.length > 0 && revealed.every(aid => Game.codexAbilityLevel(aid) === 1),
  'revealed: ' + revealed.join(','));
check('D6 revelation is L1 only (no free L2)', revealed.every(aid => Game.codexAbilityLevel(aid) < 2));

// D7: hintBeat build guide — names L1+ missing cores, teases unknown
const S = globalThis.Scattering;
// GOD-PATH (2026-10-14): 3 stalker abilities = class recognised (close);
// the missing core is the stalker payoff, Trophy Room.
Game.state.codex.abilities = { trophy_room: { level: 1, sources: ['gossip'] } };
Game.state.scholar.abilities = [{ id: 'static_toss' }, { id: 'bloodhound' }, { id: 'lucky_rock' }]; // 3 pool, close
Game.state.scholar.activeSynergies = [];
Game.state.scholar.inventory = [];
Game.state.scholar.godhood = { recognized: {}, active: [] };
Game.data.abilities = Game.data.abilities; // for abilName lookup
said.length = 0;
const hint = S.Godhood.hintBeat(Game, 'apex_predator');
check('D7 hintBeat fires when close', typeof hint === 'string' && hint.length > 0);
check('D7 hint names heard-of core (trophy_room)', /Trophy Room/i.test(hint), (hint || '').slice(0, 300));
// D7b: unknown core stays teased, not named
Game.state.codex.abilities = {}; // heard of nothing
Game.state.scholar.godhood = { recognized: {}, active: [], hinted: {} };
said.length = 0;
const hintB = S.Godhood.hintBeat(Game, 'apex_predator');
check('D7b hint teases unheard cores (no free names)', /never even heard of/.test(hintB || '') && !/Trophy Room/i.test(hintB || ''), (hintB || '').slice(0, 200));
const hint2 = S.Godhood.hintBeat(Game, 'apex_predator');
check('D7 hint fires once', hint2 === null);

// ---- sense-read ----
console.log('\n--- SENSE-READ: codex beats ---');
Game.state.codex.abilities = {};
said.length = 0;
Game.codexLearnAbility('rage', 1, 'gossip');
Game.codexLearnAbility('rage', 2, 'witnessed:v9');
for (const s of said) console.log('BEAT:', s.slice(0, 150));
console.log('\nHINT-BEAT:', (hint || '').slice(0, 400));

console.log(`\n${failures ? 'FAILURES: ' + failures : 'ALL GREEN'} (seed ${SEED})`);
process.exit(failures ? 1 : 0);
