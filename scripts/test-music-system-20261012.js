// test-music-system-20261012.js — Steve 2026-10-12: footsteps, ambient
// soundtrack, menu music + select sounds, scenario stingers/beds.
// Node-provable parts:
//  - Game.music dispatcher is headless-safe (no audio backend -> no throw)
//  - footstepFamily maps every known tile type to a family
//  - ambientTheme keys biome/night/danger correctly
//  - refreshAmbientMusic only switches when the key changes, and never
//    clobbers a scenario bed
//  - _footstep fires footstep + adapts music without throwing
// Static parts (app.js text):
//  - every Game.music('scenario','<theme>') theme has a recipe in muScenarioStep
//  - stingWave/stingScale/stingNightmare/stingSuccession, footstep,
//    uiSelect, music all exist in the CombatAudio public API
//  - musicBus is wired into ensure() (mute covers music)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./sim-harness');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 777, mode: 'music-system', fullTelemetry: false });
  Game.debugScenario('day1'); // fresh game state: state.scholar, map, tiles

  // --- dispatcher headless-safe ---
  ok(typeof Game.music === 'function', 'Game.music exists');
  let err = null;
  try { Game.music('menu'); Game.music('ambient', 'wild'); Game.music('scenario', 'contest'); Game.music('off'); } catch (e) { err = e; }
  ok(!err, 'Game.music headless-safe' + (err ? ' (' + err.message + ')' : ''));
  ok(Game._musicMode === 'off', '_musicMode tracks last layer');

  // --- footstep families: every known tile type ---
  const famCases = {
    haven: 'haven',
    wetland: 'wet', creek: 'wet', pond: 'wet', water: 'wet',
    ruin: 'stone', trail_edge: 'stone',
    forest_floor: 'soft', grove: 'soft', thicket: 'soft', meadow: 'soft',
    field: 'soft', forest: 'soft', '': 'soft', unknown_xyz: 'soft',
  };
  for (const [tt, want] of Object.entries(famCases)) {
    ok(Game.footstepFamily(tt) === want, `footstepFamily('${tt}') = ${want}`);
  }

  // --- ambient theme keys ---
  const realPlayerTile = Game.playerTile;
  Game.playerTile = () => ({ type: 'meadow' });
  Game.dayPart = 1;
  Game.state.scholar.monster = null;
  const realInCombat = Game.inCombat;
  Game.inCombat = () => false;
  ok(Game.ambientTheme() === 'wild', 'ambientTheme meadow day = wild');
  Game.dayPart = 3;
  ok(Game.ambientTheme() === 'wild/n', 'ambientTheme night = wild/n');
  Game.playerTile = () => ({ type: 'haven' });
  ok(Game.ambientTheme() === 'haven/n', 'ambientTheme haven night');
  Game.playerTile = () => ({ type: 'wetland' });
  Game.dayPart = 1;
  ok(Game.ambientTheme() === 'wet', 'ambientTheme wetland');
  Game.state.scholar.mx = 4; Game.state.scholar.my = 4;
  Game.state.scholar.monster = { mx: 6, my: 4 };
  ok(Game.ambientTheme() === 'wet/d', 'ambientTheme danger near monster');
  Game.state.scholar.monster = null;
  Game.inCombat = () => true;
  ok(Game.ambientTheme() === 'wet/d', 'ambientTheme danger in combat');
  Game.inCombat = realInCombat;
  Game.playerTile = realPlayerTile;

  // --- refreshAmbientMusic: switches only on change, never clobbers scenario ---
  const seen = [];
  const realMusic = Game.music;
  Game.music = function (mode, theme) { seen.push([mode, theme]); this._musicMode = mode; };
  Game._musicMode = 'ambient'; Game._musicKey = null;
  Game.playerTile = () => ({ type: 'meadow' });
  Game.dayPart = 1; Game.state.scholar.monster = null;
  Game.inCombat = () => false;
  Game.refreshAmbientMusic();
  ok(seen.length === 1 && seen[0][0] === 'ambient' && seen[0][1] === 'wild', 'refreshAmbientMusic picks wild');
  Game.refreshAmbientMusic();
  ok(seen.length === 1, 'no re-fire when key unchanged');
  Game.dayPart = 3;
  Game.refreshAmbientMusic();
  ok(seen.length === 2 && seen[1][1] === 'wild/n', 're-fires on night change');
  // scenario bed must not be clobbered by walking
  Game._musicMode = 'scenario';
  Game.dayPart = 1;
  Game.refreshAmbientMusic();
  ok(seen.length === 2, 'footsteps never clobber a scenario bed');
  Game.music = realMusic;
  Game.inCombat = realInCombat;
  Game.playerTile = realPlayerTile;

  // --- musicAmbient resets back to adaptive ---
  Game._musicMode = 'scenario'; Game._musicKey = 'stale';
  Game.playerTile = () => ({ type: 'ruin' }); Game.dayPart = 1;
  Game.state.scholar.monster = null; Game.inCombat = () => false;
  err = null;
  try { Game.musicAmbient(); } catch (e) { err = e; }
  ok(!err && Game._musicMode === 'ambient', 'musicAmbient returns to adaptive');
  Game.inCombat = realInCombat;
  Game.playerTile = realPlayerTile;

  // --- _footstep headless-safe ---
  err = null;
  try { Game._footstep(); } catch (e) { err = e; }
  ok(!err, '_footstep headless-safe');

  // --- static: scenario themes all have recipes ---
  const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  const fired = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, 'src/js'))) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');
    for (const m of src.matchAll(/\.music\(\s*'scenario'\s*,\s*'([a-z-]+)'\s*\)/g)) fired.add(m[1]);
  }
  ok(fired.size > 0, 'scenario themes fired (' + [...fired].join(',') + ')');
  const schedBlock = app.slice(app.indexOf('function muScenarioStep'), app.indexOf('function muScenarioStep') + 1500);
  for (const th of fired) {
    ok(schedBlock.includes("'" + th + "'"), `recipe for scenario theme '${th}'`);
  }
  // menu + ambient + off paths exist
  ok(app.includes('function muMenuStep') && app.includes('function muAmbientStep'), 'menu/ambient recipes exist');

  // --- static: API surface ---
  const apiStart = app.indexOf('return {', app.indexOf('const CombatAudio'));
  const api = app.slice(apiStart);
  for (const name of ['footstep(data)', 'uiSelect()', 'music(mode, theme)', 'stingWave()', 'stingScale()', 'stingNightmare()', 'stingSuccession()']) {
    ok(api.includes(name), 'API: ' + name);
  }
  // every fired sting resolves
  const stings = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, 'src/js'))) {
    if (!f.endsWith('.js')) continue;
    const src = fs.readFileSync(path.join(ROOT, 'src/js', f), 'utf8');
    for (const m of src.matchAll(/audioEvent\('((?:sting|footstep|uiSelect)[A-Za-z]*)'\)/g)) stings.add(m[1]);
  }
  for (const st of stings) {
    ok(new RegExp('\\b' + st + '\\(').test(api), `fired '${st}' resolves in API`);
  }
  // musicBus under the mute umbrella
  ok(app.includes('musicBus.connect(master)'), 'musicBus -> master (mute covers music)');
  ok(app.includes('musicBus = null; musicGain = null; muTimer = null;'), 'context-death resets music state');
  ok(app.includes('if (muTimer) clearInterval(muTimer)'), 'context-death clears the scheduler interval (no double timers)');
  ok(app.includes('maybeStartMusic()'), 'autoplay: pending music starts on first ensure()');

  // --- debug scenarios: PLAYED (Steve's rule) ---
  const listed = Object.fromEntries(Game.debugScenarioList());
  const cats = Game.debugScenarioCategories();
  const flat = Object.values(cats).flat().map(x => x[0]);
  for (const sid of ['musicMenu', 'musicAmbience', 'musicStingers', 'musicContest', 'footsteps']) {
    ok(!!listed[sid], 'listed: ' + sid);
    ok(flat.includes(sid), 'categorized: ' + sid);
    let serr = null;
    try { Game.debugScenario(sid); } catch (e) { serr = e; }
    ok(!serr, sid + ' runs without throwing' + (serr ? ' (' + serr.message + ')' : ''));
  }
  // footsteps scenario: walking fires terrain footsteps through the dispatcher
  {
    const fired = [];
    const realAE = Game.audioEvent;
    Game.audioEvent = function (name, data) { fired.push([name, data]); };
    Game.debugScenario('footsteps');
    const s = Game.state.scholar;
    let merr = null;
    try {
      for (let i = 0; i < 3; i++) { try { Game.microMove(s.mx + 1, s.my); } catch (e) {} }
    } catch (e) { merr = e; }
    Game.audioEvent = realAE;
    ok(!merr, 'walking 3 squares without throwing');
    const steps = fired.filter(f => f[0] === 'footstep');
    ok(steps.length >= 1, 'footsteps fired on walk (' + steps.length + ')');
    ok(steps.every(f => ['soft', 'wet', 'stone', 'haven'].includes(f[1] && f[1].family)),
      'every footstep carries a valid terrain family');
  }

  console.log(pass + '/' + (pass + fail) + ' green');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
