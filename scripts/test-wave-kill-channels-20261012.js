// WAVE-KILL CHANNEL AUDIT (longsim wave lever r4, 2026-10-12).
// Steve's standing law: "wave unlocks count villager experiences alongside
// the player's." This test inventories EVERY channel that can produce a
// real wave-monster kill and asserts each one feeds recordWaveKill (the
// ledger's only scorer).
//
// Scored (verified by this test's structural scan):
//   1. player TB fight kills — game.js tbEnd, won/routed, lineage-deduped
//   2. villager patrol fieldFight vKill — resolvePatrol (game.js)
//   3. villager wild-encounter fieldFight vKill — resolveWildMonsterEncounter
//   4. villager expedition vKill — villager-agency.js
//   5. contest blood/gauntlet/siege vKill — contestEngine.js _cxBlood
//   6. contest hide seeker vKill — contestEngine.js hide
//   7. contest beastmaster vKill — contestEngine.js beastmaster
//   8. aid-crisis aidFight vKill — comms.js (was the ONE unscored channel;
//      fixed this run: recordWaveKill(mdef.id) on vKill)
// Deliberately unscored (design): vDie (the dead told no tale), evade,
// alreadyDead, mFlee/drive-offs, TB 'fled' (abandoned the field), vanish/
// lost-sight despawns (not kills), prey-animal hunting traps (prey aren't
// wave monsters; recordWaveKill looks up monsters.json only).
// Usage: node scripts/test-wave-kill-channels-20261012.js [SEED] — run x3 seeds.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '777012', 10);

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
  ['dramaEffects.json', 'dramaEffects'], ['monsterBehaviors.json', 'monsterBehaviors'],
  ['contests.json', 'contests'], ['events.json', 'events'],
  ['statusEffects.json', 'statusEffects'], ['cooking.json', 'cooking'],
];
global.SCATTER_DATA = {};
for (const [f, key] of PAIRS) {
  try { global.SCATTER_DATA[key] = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data', f), 'utf8')); }
  catch (e) { global.SCATTER_DATA[key] = key === 'contests' || key === 'items' || key === 'monsters' ? [] : {}; }
}

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

global.window = global;
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js', 'engine/combat.js', 'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js', 'party-formal.js',
  'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js', 'alienPlayers.js', 'storage.js',
  'perceive.js', 'carexplore.js', 'justice.js', 'food.js', 'betrayal.js', 'corpses.js',
  'corruption.js', 'lifeseed.js', 'progression.js', 'waveLedger.js', 'ledger.js',
  'abilityActions.js', 'monsterBehaviors.js', 'statusEffects.js', 'metaProgression.js',
  'villager-agency.js', 'fieldFights.js', 'villager-objectives.js', 'codex-people.js',
  'membership.js', 'hierarchy.js', 'comms.js', 'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;
try { if (Game.initData) Game.initData(); } catch (e) {}

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }

// ---------- A. structural: every fieldFight kill channel feeds recordWaveKill
sec('A. structural — fieldFight call sites and their scoring');
// For each production .fieldFight( call site (not the definition, not the
// summary), extract the enclosing function's source block (up to 400 lines
// after the call) and require recordWaveKill within it — the vKill branch
// must score.
const FF_FILES = ['src/js/game.js', 'src/js/villager-agency.js', 'src/js/contestEngine.js', 'src/js/comms.js'];
const sites = [];
for (const rel of FF_FILES) {
  const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln.includes('.fieldFight(')) continue;
    if (ln.includes('fieldFightSummary')) continue;
    if (/^\s*fieldFight[: (]/.test(ln)) continue; // definition
    // enclosing function name: nearest line above that opens a block
    let fnName = 'top';
    for (let j = i; j >= Math.max(0, i - 60); j--) {
      const m = lines[j].match(/^\s*([A-Za-z_$][\w$]*)\s*[\(:=]/);
      if (m && /function|\(|:/.test(lines[j]) && !lines[j].includes('.fieldFight(')) { fnName = m[1]; break; }
    }
    const block = lines.slice(i, i + 400).join('\n');
    sites.push({ file: rel, line: i + 1, fn: fnName, scores: block.includes('recordWaveKill') });
  }
}
ok('fieldFight call sites found (expect 7)', sites.length === 7, JSON.stringify(sites.map(s => s.file.split('/').pop() + ':' + s.line)));
for (const s of sites) {
  ok(`scores: ${s.file.split('/').pop()}:${s.line} (${s.fn})`, s.scores);
}

// ---------- B. structural: player TB kill path
sec('B. structural — player TB end path');
const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
ok('TB end scores won+routed kills (recordWaveKill(m.mdef.id) in tbEnd)',
  /recordWaveKill\(m\.mdef\.id\)/.test(gameSrc));
ok("TB 'fled' stays forfeit (no kill scoring on fled)",
  !/result === 'fled'[\s\S]{0,300}recordWaveKill/.test(gameSrc));
ok('snake-lineage dedupe present at the TB scoring loop',
  /tbSnakeLineageKey\(m\)/.test(gameSrc.split('recordWaveKill(m.mdef.id)')[0].slice(-800)));

// ---------- C. dynamic: aidFight vKill now scores
sec('C. dynamic — aidFight vKill reaches recordWaveKill');
try { Game.initState && Game.initState(); } catch (e) {}
try {
  Game.state = Game.state || {};
  Game.state.scholar = Game.state.scholar || { day: 30 };
  Game.state.village = Game.state.village || { px: 4, py: 4 };
  Game.state.waveLedger = undefined;
} catch (e) {}
Game.say = function () {};
Game.sysSay = function () {};
const scoredCalls = [];
const origRWK = Game.recordWaveKill.bind(Game);
Game.recordWaveKill = function (mid) { scoredCalls.push(mid); return origRWK(mid); };
// rig fieldFight to a clean vKill; neutralise crisis resolution side effects
const origFF = Game.fieldFight.bind(Game);
Game.fieldFight = function () { return { outcome: 'vKill', rounds: 4, vTaken: 12, mTaken: 88, log: ['rigged'] }; };
Game.resolveAidCrisis = function () { return true; };
const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf') || { id: 'hushwolf', wave: 1 };
let rec = null;
try { rec = Game.aidFight('villager-1', mdef, null, {}); } catch (e) { console.log('  (aidFight threw: ' + e.message + ')'); }
ok('aidFight returns the fight rec', !!rec && rec.outcome === 'vKill');
ok('aidFight vKill calls recordWaveKill once', scoredCalls.length === 1, JSON.stringify(scoredCalls));
ok('aidFight scores the mdef id', scoredCalls[0] === 'hushwolf');
let pts = 0;
try { pts = Game.waveLedgerPoints(1); } catch (e) {}
ok('ledger wave-1 shows the point', pts === 1, 'points=' + pts);
let slain = 0;
try { slain = (Game.state.villageSlain || {}).hushwolf || 0; } catch (e) {}
ok('villageSlain tracks it (beasttricks channel)', slain === 1);
Game.fieldFight = origFF;
Game.recordWaveKill = origRWK;

// ---------- D. dynamic: ledger choke point still rejects non-monsters
sec('D. dynamic — recordWaveKill only scores real monsters');
let before = 0;
try { before = Game.waveLedgerPoints(1); } catch (e) {}
try { Game.recordWaveKill('turkey'); } catch (e) {}       // prey animal, not a monster
try { Game.recordWaveKill('not-a-thing'); } catch (e) {}  // unknown id
let after = 0;
try { after = Game.waveLedgerPoints(1); } catch (e) {}
ok('prey/unknown kills score nothing', after === before, before + '->' + after);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
