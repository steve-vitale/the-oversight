// BREAK-IT r16: SHOWS & BROADCAST (2026-10-11) — hostile-player attacks NOT
// covered by r10-r15. Reads docs/CANON.md + docs/CONTESTS.md first.
//   K1 — DEAD COMMENTARY POOL: G.BROADCAST_LINES.summons (3 authored lines)
//        is NEVER fired — nothing in fireRatingsSummons / _showEnd routes a
//        beat name that classifies to 'summons' into broadcastBeat.
//   K2 — UNDISCLOSED CHOICE COSTS: SHOW_BEATS choices move real resources
//        (kcal/trauma/dmg/heal/prize) with no pre-commit disclosure in
//        label/sub; d.heal has NO post-hoc sysSay (contestChoose narrates
//        dmg but heal/kcal/trauma were silent until the fix); the
//        mystery_smell win text lies ("feeds the village" — the engine
//        grants +200 kcal to the PLAYER only).
//   K3 — SIBLING SWEEP: (a) contest phase-builder do: disclosure counts +
//        active-contradiction scan; (b) every BROADCAST_LINES pool reachable
//        via classifyBeat over all call sites; (c) SHOW_BEATS end values
//        all in {won,lost,mixed}, lose:'' texts unreachable-but-covered.
// Usage: node scripts/test-shows-breakit-r16-20261011.js [SEED]  (run x3 seeds)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || process.argv[2] || '424242', 10);

// ---------- data preload ----------
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
const LIST = ['engine/state.js', 'engine/modifiers.js', 'engine/combat.js', 'engine/calories.js', 'engine/day.js',
  'engine/forage.js',
  'game.js', 'encounters.js', 'conversation.js',
  'convo-mood.js', 'convoTopics.js', 'convo-wants.js', 'convo-dialogue.js', 'convo-beats.js',
  'convo-scene.js', 'examine.js', 'equipment.js', 'journal.js', 'party.js', 'party-formal.js',
  'truth.js', 'contests.js', 'broadcast.js', 'contestEngine.js', 'alienPlayers.js', 'storage.js',
  'perceive.js', 'carexplore.js', 'justice.js', 'food.js', 'betrayal.js', 'corpses.js',
  'corruption.js', 'lifeseed.js', 'progression.js', 'ledger.js', 'abilityActions.js',
  'monsterBehaviors.js', 'statusEffects.js', 'villager-agency.js', 'fieldFights.js',
  'villager-objectives.js', 'codex-people.js', 'membership.js', 'hierarchy.js',
  'debug-scenarios.js', 'build.js'];
for (const f of LIST) {
  try { eval(fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
}
delete global.window;
const Game = globalThis.Scattering.Game;
Game.data = global.SCATTER_DATA;

// ---------- plumbing ----------
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function sec(t) { console.log('\n### ' + t); }

const said = [];
Game.sysSay = function(t) { said.push(String(t)); };
Game.audioEvent = function() {};
Game.drama = function() {};
Game.tele = function() {};
Game.leadShift = function() {};
Game.recordMoment = function() {};
Game.contestLearn = function() {};
Game.villagerGainXP = function() {};
const favorCalls = [];
Game.apAdjustFavor = function(n, why, lane) { favorCalls.push({ n, why, lane }); };
Game.kcalCap = function() { return 2400; };
Game.maxHealth = function() { return 100; };
Game.havenViewership = function() { return (this.state.village || {}).viewership || 0; };
Game.unlockedWave = function() { return 1; };
Game.monsterWavePool = function() { return (this.data.monsters || []).filter(m => (m.wave || 1) <= 1); };
Game.apCarePackage = function() { return false; };
Game.apWackyGift = function() { return null; };
Game.addNotability = function() {};
Game.displayName = function(id) { return String(id); };
Game.villagerId = 'player';

function freshGame(day) {
  rng.reset(SEED);
  said.length = 0; favorCalls.length = 0;
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const s = Game.state.scholar;
  s.day = day || 15;
  Game.state.systemArrived = true;
  s.health = 100; s.kcal = 2000; s.trauma = 0; s.exiled = false;
  s.inventory = s.inventory || [];
  Game.state.over = false;
  Game.state.activeContest = null;
  Game.state.pendingContest = null;
  Game.state.arenaContest = null;
  Game.state.broadcast = null;
  Game.state.notability = {};
  Game.state.showBudget = { week: Math.floor(s.day / 7), used: 0 };
  const v = Game.state.village;
  v.viewership = 50; v._lastWeekViewership = 50; v._peakViewership = 50;
  Game.state.alienPlayers = { fanClubs: { showbiz: 60, fight: 10, survival: 5, social: 5 }, lastPackageDay: -999, favor: 0 };
}

// classifyBeat copy (same rules as broadcast.js, verified against source —
// INCLUDING the '__pull' synthetic-override special case)
function classifyBeat(b) {
  if (b === '__pull') return 'pull';
  b = String(b || '');
  if (/feast/i.test(b)) return 'feast';
  if (/deathreel|replay|judging/i.test(b)) return 'deathreel';
  if (/summons/i.test(b)) return 'summons';
  if (/declare|pull/i.test(b)) return 'declare';
  if (/escalate|climax/i.test(b)) return 'tension';
  if (/won|triumph|fans/i.test(b)) return 'triumph';
  if (/lost|shame|embarrass/i.test(b)) return 'embarrassment';
  if (/refus/i.test(b)) return 'refused';
  if (/mixed|both|together|watch/i.test(b)) return 'together';
  if (/win/i.test(b)) return 'triumph';
  if (/lose/i.test(b)) return 'embarrassment';
  return 'generic';
}

// ================= K1 — DEAD COMMENTARY POOL =================
sec('K1 — the summons commentary pool must actually air during a ratings summons');
{
  freshGame(15);
  const fired = [];
  const origBeat = Game.broadcastBeat.bind(Game);
  Game.broadcastBeat = function(beatName, ctx) {
    fired.push({ beat: String(beatName), type: classifyBeat(beatName) });
    return origBeat(beatName, ctx);
  };
  const ac = Game.fireRatingsSummons();
  ok('summons modal opened', !!ac);
  // Play all three choices paths (stunt -> WIN, phone-in -> LOSE, refuse -> REFUSE)
  const plays = [0, 1, 2];
  for (const idx of plays) {
    freshGame(15);
    fired.length = 0;
    Game.state.scholar.kcal = 2000;
    const ac2 = Game.fireRatingsSummons();
    if (ac2) Game.contestChoose(idx);
  }
  Game.broadcastBeat = origBeat;
  const summonsFired = fired.filter(f => f.beat === '__summons' || f.type === 'summons');
  ok('a beat classifying to the summons pool fired during fireRatingsSummons',
     summonsFired.length >= 1,
     'beats fired: ' + JSON.stringify(fired.slice(0, 8).map(f => f.beat)));
  // And the fired line must come from the summons pool text
  freshGame(15);
  Game.broadcastStart('summons', { showId: '__summons', showName: 'Ratings Summons', participant: 'player' });
  const line = Game.broadcastBeat('__summons', {});
  const summonsTexts = (Game.BROADCAST_LINES.summons || []).map(l => l[1]);
  ok('broadcastBeat(\'__summons\') lands a summons-pool line in the ticker',
     !!line && summonsTexts.some(t => line[1] === t), line ? line[1] : '(null — broadcast not live)');
  Game.broadcastEnd();
}

// ================= K2a — d.heal narrates (nap_wars) =================
sec('K2a — d.heal is said out loud (was silent; contestChoose narrated only dmg)');
{
  freshGame(15);
  const s = Game.state.scholar;
  s.health = 70;
  Game.state.activeContest = {
    kind: 'show', showId: 'nap_wars', showName: 'Nap Wars', participant: 'player',
    phase: 'intro', phaseIdx: 0,
    phases: Game.showPhases({ id: 'nap_wars', name: 'Nap Wars', desc: 'sleep' }, 'player'),
    wounds: 0,
  };
  said.length = 0;
  const res = Game.contestChoose(0); // 'Commit to the nap' — do: {heal: 5, ...}
  ok('choice resolved', !!res && res.done === true);
  ok('health moved (+5)', s.health === 75, 'health=' + s.health);
  const healed = said.some(t => /recover|heal|health/i.test(t) && !/notability/i.test(t));
  ok('a heal line was said out loud', healed, 'said: ' + JSON.stringify(said.slice(0, 4)));
}

// ================= K2b — mystery_smell win text honesty =================
sec('K2b — mystery_smell win text: the engine feeds the PLAYER, the copy must agree');
{
  freshGame(15);
  const s = Game.state.scholar;
  s.kcal = 1000;
  Game.state.activeContest = {
    kind: 'show', showId: 'mystery_smell', showName: 'The Mystery Smell', participant: 'player',
    phase: 'intro', phaseIdx: 0,
    phases: Game.showPhases({ id: 'mystery_smell', name: 'The Mystery Smell', desc: 'smell' }, 'player'),
    wounds: 0,
  };
  said.length = 0;
  const res = Game.contestChoose(0); // 'Follow your nose' — do: {kcal: 200, prize: true}
  ok('choice resolved', !!res && res.done === true);
  ok('engine granted +200 kcal to the player', s.kcal === 1200, 'kcal=' + s.kcal);
  const winText = said.join('\n');
  ok('win text does NOT claim the village was fed', !/feeds the village|Everybody eats/i.test(winText),
     'text said: ' + JSON.stringify(winText.match(/catering crate[^.]*\./i) || winText.slice(0, 80)));
  ok('win text says the PLAYER ate', /you eat|your dinner|you polish/i.test(winText),
     'said: ' + JSON.stringify(said.slice(0, 6)));
}

// ================= K2c — static audit: all 90 SHOW_BEATS choices disclose =================
sec('K2c — static audit: every SHOW_BEATS choice discloses material costs/rewards in label/sub');
{
  const src = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
  const _start = src.indexOf('G.SHOW_BEATS = {');
  const _endMarker = '  };\n\n  // SHOW GENERIC BEAT';
  const _end = src.indexOf(_endMarker) + 4;
  const block = src.slice(_start, _end).replace(/^G\.SHOW_BEATS = /m, 'module.exports = ');
  const m = new module.constructor();
  m._compile(block, path.join(ROOT, 'tmp-beats.js'));
  const BEATS = m.exports;
  const flagged = [];
  let total = 0;
  for (const [beat, b] of Object.entries(BEATS)) {
    for (const c of b.choices || []) {
      total++;
      const d = c.do || {};
      const t = ((c.label || '') + ' ' + (c.sub || '')).toLowerCase();
      const miss = [];
      if (d.kcal && !/kcal/.test(t)) miss.push('kcal ' + d.kcal);
      if (d.reqKcal && !/kcal/.test(t)) miss.push('reqKcal ' + d.reqKcal);
      if (d.trauma >= 2 && !/trauma/.test(t)) miss.push('trauma ' + d.trauma);
      if (d.dmg && !/dmg|damage/.test(t)) miss.push('dmg ' + JSON.stringify(d.dmg));
      if (d.heal && !/heal|health|\bhp\b/.test(t)) miss.push('heal ' + d.heal);
      if (d.prize && !/prize/.test(t)) miss.push('prize');
      if (miss.length) flagged.push(`${beat} "${c.label}" [${miss.join(', ')}]`);
    }
  }
  ok('30 beats present', Object.keys(BEATS).length === 30, Object.keys(BEATS).length + ' beats');
  ok('90 choices audited', total === 90, total + ' choices');
  ok('zero choices with undisclosed material costs/rewards', flagged.length === 0,
     flagged.length + ' flagged: ' + flagged.slice(0, 6).join(' | '));
}

// ================= K3b — every BROADCAST_LINES pool reachable =================
sec('K3b — sibling sweep: every commentary pool has a real producer');
{
  const src = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
  const beatNames = new Set();
  for (const mt of src.matchAll(/beat:\s*'([^']+)'/g)) beatNames.add(mt[1]);
  for (const mt of fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8').matchAll(/grab\('([^']+)'\)/g)) beatNames.add(mt[1]);
  // literal broadcastBeat('<name>' call sites — the ground truth of what is
  // actually fired (NOT assumed): after the r16 fix, fireRatingsSummons
  // contains broadcastBeat('__summons').
  const allSrc = src + fs.readFileSync(path.join(ROOT, 'src/js/broadcast.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
  for (const mt of allSrc.matchAll(/broadcastBeat\('([^']+)'/g)) beatNames.add(mt[1]);
  // dynamic concatenations (verified at call sites): 'SHOW_VILLAGER_'+outcome, 'SHOW_'+outcome
  if (/broadcastBeat\('SHOW_VILLAGER_'/.test(allSrc)) for (const o of ['WON', 'LOST', 'MIXED', 'REFUSED']) beatNames.add('SHOW_VILLAGER_' + o);
  if (/broadcastBeat\('SHOW_' \+/.test(allSrc)) for (const o of ['WON', 'LOST', 'MIXED', 'REFUSED']) beatNames.add('SHOW_' + o);
  const covered = new Set();
  for (const b of beatNames) covered.add(classifyBeat(b));
  const pools = Object.keys(Game.BROADCAST_LINES || {});
  const dead = pools.filter(p => !covered.has(p));
  ok('all commentary pools reachable', dead.length === 0, 'dead pools: ' + dead.join(', '));
  ok('summons pool reachable via __summons', covered.has('summons'));
  console.log('  pools covered: ' + pools.map(p => `${p}:${covered.has(p) ? 'Y' : 'N'}`).join(' '));
}

// ================= K3c — end values + unreachable lose texts =================
sec('K3c — sibling sweep: every SHOW_BEATS choice end is won/lost/mixed; lose:"" beats noted');
{
  const src = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
  const _start2 = src.indexOf('G.SHOW_BEATS = {');
  const _endMarker2 = '  };\n\n  // SHOW GENERIC BEAT';
  const _end2 = src.indexOf(_endMarker2) + 4;
  const block = src.slice(_start2, _end2).replace(/^G\.SHOW_BEATS = /m, 'module.exports = ');
  const m = new module.constructor();
  m._compile(block, path.join(ROOT, 'tmp-beats2.js'));
  const BEATS = m.exports;
  const badEnds = [];
  const emptyLoseBeats = [];
  for (const [beat, b] of Object.entries(BEATS)) {
    const ends = (b.choices || []).map(c => c.end);
    for (const e of ends) if (!['won', 'lost', 'mixed'].includes(e)) badEnds.push(`${beat}:${e}`);
    if (!String(b.lose || '').trim()) {
      emptyLoseBeats.push(beat);
      const hasLostChoice = ends.includes('lost');
      ok(`lose:"" unreachable for ${beat} (no 'lost' choice) + fallback covers`, !hasLostChoice);
    }
  }
  ok('all choice ends in {won,lost,mixed}', badEnds.length === 0, badEnds.join(', '));
  console.log('  beats with empty lose text: ' + emptyLoseBeats.join(', '));
  // fallback exists in _showEnd
  const fn = String(Game._showEnd);
  ok('_showEnd has a non-empty lose fallback', /beat\.lose \|\|/.test(fn) || /It went badly/.test(fn));
}

// ================= K3a — contest phase-builder disclosure counts =================
sec('K3a — sibling sweep: contest phase-builder material do: fields — counts + contradiction scan');
{
  const src = fs.readFileSync(path.join(ROOT, 'src/js/contests.js'), 'utf8');
  const lines = src.split('\n');
  // SHOW_BEATS + ratingsSummonsPhases span (audited separately) — locate by markers, not line numbers
  const _bStart = src.indexOf('G.SHOW_BEATS = {');
  const _bEnd = src.indexOf('  };\n\n  // SHOW GENERIC BEAT') + 4;
  const _sStart = src.indexOf('G.ratingsSummonsPhases = function()');
  const _sEnd = src.indexOf('// SHOW BEATS (audit-shows');
  const inBlock = (pos) => (pos >= _bStart && pos <= _bEnd) || (pos >= _sStart && pos <= _sEnd);
  const counts = { kcal: 0, trauma: 0, dmg: 0, heal: 0, prize: 0 };
  const contra = [];
  const choicePat = /\{\s*label:\s*'([^']*)'[^}]*?sub:\s*(?:'([^']*)'|"([^"]*)"|(\w+))[^}]*?do:\s*\{([^}]*)\}/;
  // documented exemption: 'Play it safe' (contestDice) — the 50-kcal ante is
  // said out loud in the phase text ("ANTE, FIFTY"), the sub just names the
  // cheaper line of play relative to staking memories/pride.
  const EXEMPT = new Set(['contestDice|Play it safe']);
  let _off = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const lineStart = _off;
    _off += l.length + 1;
    if (inBlock(lineStart)) continue; // SHOW_BEATS + summons (audited separately)
    if (l.indexOf('label:') < 0 || l.indexOf('do:') < 0) continue;
    const mm = choicePat.exec(l);
    if (!mm) continue;
    const label = mm[1], sub = (mm[2] || mm[3] || ''), d = mm[5];
    const beat = (src.slice(0, lines.slice(0, i).join('\n').length).match(/beat:\s*'([^']+)'/g) || []).pop() || '?';
    const hasMat = /\b(kcal|trauma|dmg|heal|prize)\b/.test(d);
    for (const k of Object.keys(counts)) if (new RegExp('\\b' + k + '\\b').test(d)) counts[k]++;
    const t = (label + ' ' + sub).toLowerCase();
    if (/\bsafe\b|\bpainless\b|\bfree\b|costs? nothing|no cost|harmless/.test(t) && /\bdmg\b|\btrauma\b|kcal:\s*-/.test(d)) {
      const key = beat.replace(/beat:\s*'([^']+)'/, '$1') + '|' + label;
      if (![...EXEMPT].some(e => label === e.split('|')[1])) contra.push(`L${n}: "${label}" sub="${sub}" do={${d.trim()}}`);
    }
  }
  console.log('  phase-builder do: lines w/ material fields (excl. SHOW_BEATS/summons): ' + JSON.stringify(counts));
  ok('no actively-contradicting contest subs (claim safe/free while costing dmg/trauma/kcal)',
     contra.length === 0, contra.slice(0, 4).join(' || '));
}

console.log('\n==== r16: ' + pass + ' pass, ' + fail + ' fail ====');
if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
process.exit(fail ? 1 : 0);
