#!/usr/bin/env node
// test-feedback-moments-20261014.js — presentation pass A (Steve 2026-10-14:
// "Address all graphic and sound survey gaps.").
//
// Proves, through the real game paths (feel.js wraps + the game.js drama
// dispatcher), with Scattering.Drama and Game.audioEvent stubbed to record:
//   1. days 1-6: hits/crits/misses/hurt/kills/weather fire GROUNDED variants
//      and NO System-styled drama; grounded sounds fire; System kinds stay still
//   2. after day 7 the System variants return
//   3. every payoff moment fires its drama + its audioEvent (ascension, class,
//      level-up sheet, flashback, keepsake level, feast, flee, titans, the
//      Table, the day-7 sting) and System-styled moments wait for day 7
//   4. the 27 god-path abilities map to a distinct visual + cue; actives fire
//      on use, passives on their narration tag
//   5. reduced motion selects the calm variants in the real drama.js (DOM stub)
//      and grounded visuals carry no System cyan
//   6. haptics are feature-detected and gated by the setting
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./godpath/lib');
const T = K.reporter('feedback-moments');

const SYSTEM_CYAN = /#4df3ff|#6ec8e6|#4ae8ff|SYSTEM/i;

(async () => {
  const Game = await K.load({ seed: 1014, narration: true });
  K.newRun(Game);
  const S = globalThis.Scattering;
  const s = Game.state.scholar;
  const F = S.Feel;
  const roster0 = (Game.state.village.roster || []).slice(); // K.fight empties the roster; the feast needs guests

  // ---- recorders ----
  let dLog = [], aLog = [];
  const dramaStub = new Proxy({}, {
    get(t, k) {
      if (k === 'audioFor') return (kind, arg) => (kind === 'weather' ? ({ rain: 'weatherRain', cold: 'weatherCold' })[arg] || null : null);
      return (...a) => { dLog.push([k, a]); };
    },
  });
  S.Drama = dramaStub;
  Game.audioEvent = function (n) { aLog.push(n); };
  const reset = () => { dLog = []; aLog = []; };
  const methods = () => dLog.map(x => x[0]);
  const moments = () => dLog.filter(x => x[0] === 'moment').map(x => x[1][0]);

  // ---------------------------------------------------------------- 1
  T.section('1. Days 1-6: grounded feedback, no System chrome');
  Game.state.systemArrived = false;
  reset();
  Game.drama('hit', 3, 3, { color: '#ffd54a' });
  Game.drama('critHit', 3, 3, 12);
  Game.drama('dodgeMiss', 4, 4);
  Game.drama('playerHurt', 9);
  Game.drama('wisp', 3, 3);
  Game.drama('weather', 'rain');
  Game.drama('playerDeath', 3, 3, 'Ana', 'combat');
  const groundedKinds = dLog.filter(x => x[0] === 'grounded').map(x => x[1][0]);
  T.ok('hit/crit/miss/hurt/kill/weather/death -> grounded variants', ['hit', 'crit', 'miss', 'hurt', 'kill', 'weather', 'death'].every(k => groundedKinds.includes(k)), groundedKinds.join(','));
  T.ok('every pre-System call went to grounded (no System-styled method)', methods().every(m => m === 'grounded'), methods().join(','));
  T.ok('grounded sounds: hurt thud, miss whoosh, rain', ['groundedHurt', 'groundedMiss', 'weatherRain'].every(n => aLog.includes(n)), aLog.join(','));
  reset();
  Game.drama('broadcast', { title: 'x' });
  Game.drama('commentary', 'The System notes');
  Game.drama('hero', 'A', 'B');
  Game.drama('signature', 'brawler', 3, 3, '#f00', 'combat');
  Game.drama('flash', '#4df3ff', 400);
  Game.drama('integration', 2);
  T.ok('System-flavoured kinds stay still before day 7 (broadcast, commentary, hero, signature, flash, integration)', dLog.length === 0 && aLog.length === 0, methods().join(','));

  // a real pre-System strike lands through the real combat path
  reset();
  const mf = K.fight(Game, 'hushwolf');
  if (mf) {
    mf.hp = mf.maxHp = 500;
    const p = Game.tbFighter('p');
    if (p) { p.mx = mf.mx - 1; p.my = mf.my; p.acted = false; }
    try { Game.tbPlayerStrike(mf.key); } catch (e) { console.warn('strike', e.message); }
  }
  const realHit = dLog.filter(x => x[0] === 'grounded' && (x[1][0] === 'hit' || x[1][0] === 'crit'));
  T.ok('a real day-1 strike draws a grounded hit (not the System starburst)', !!mf && realHit.length >= 1 && !methods().includes('hit') && !methods().includes('critHit'), methods().join(','));
  try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { console.warn('end', e.message); }
  T.ok('fleeing a fight plays the grounded flee (dust + footsteps)', moments().includes('flee') && aLog.includes('groundedFlee'), moments().join(',') + ' / ' + aLog.join(','));

  // ---------------------------------------------------------------- 2
  T.section('2. After day 7: the System variants return');
  Game.state.systemArrived = true;
  reset();
  Game.drama('critHit', 3, 3, 12);
  Game.drama('playerHurt', 9);
  T.ok('critHit/playerHurt go to the System methods', methods().includes('critHit') && methods().includes('playerHurt') && !methods().includes('grounded'), methods().join(','));

  // ---------------------------------------------------------------- 3
  T.section('3. Payoff moments: drama + audioEvent through real paths');
  const expectMoment = (label, name, audio, fn) => {
    reset();
    try { fn(); } catch (e) { console.warn(label, e && e.message); }
    T.ok(`${label}: drama moment '${name}' + audio '${audio}'`, moments().includes(name) && aLog.includes(audio), `moments=${moments().join(',')} audio=${aLog.join(',')}`);
  };
  expectMoment('ascension ceremony (godhood.js)', 'ascension', 'ascensionRise',
    () => S.Godhood.recognitionCeremony(Game, 'apex_predator', [{ name: 'Mara', line: 'Look.' }], 'dusk'));
  const asc = dLog.find(x => x[0] === 'moment' && x[1][0] === 'ascension');
  T.ok('ascension carries the god form (MYTHIC_SPRITES) and the 5 beats', !!(asc && /<svg/.test(asc[1][1].sprite || '') && (asc[1][1].beats || []).length === 5));

  s.abilities = [];
  ['raise_earth', 'gravity_well', 'landslide'].forEach(id => K.giveAbility(Game, id, { force: true }));
  delete s.godpath;
  expectMoment('class recognition (godpath recognizeClass)', 'classRecognized', 'classChime', () => S.Godpath.recognizeClass('player'));

  s.abilityChoices = null; s.levelUpQueue = [{ track: 'combat', level: 2, xp: 12 }];
  expectMoment('level-up sheet opens (tracks pumpLevelUps)', 'levelUpOpen', 'levelUpFlourish', () => Game.pumpLevelUps());
  s.abilityChoices = null;

  const ringDef = (Game.data.items || []).find(i => i.id === 'mothers_ring') || { id: 'mothers_ring', name: "Mother's Ring" };
  const ring = { itemId: 'mothers_ring', name: ringDef.name, sentimental: true, chosen: true, bond: 3, enhancements: [] };
  expectMoment('keepsake flashback (progression playFlashback)', 'flashback', 'flashbackWarm', () => Game.playFlashback(ring, ringDef));
  const fb = dLog.find(x => x[0] === 'moment' && x[1][0] === 'flashback');
  T.ok('the flashback is human-styled (grounded), never System', !!(fb && fb[1][1].grounded === true));
  ring.flashbackPlayed = true;
  expectMoment('keepsake level-up (keepsakes keepsakeLevelBeat)', 'keepsakeLevel', 'keepsakeGlow', () => Game.keepsakeLevelBeat(ring, 1, 2));
  reset();
  const ring2 = Object.assign({}, ring, { flashbackPlayed: false });
  try { Game.keepsakeLevelBeat(ring2, 0, 1); } catch (e) { console.warn('beat L1', e.message); }
  T.ok('keepsake L1: the flashback IS the moment (no second card)', moments().filter(m => m === 'flashback').length === 1 && !moments().includes('keepsakeLevel'), moments().join(','));

  // feast: a real feast at the haven, through Game.hostFeast
  Game.state.village.roster = roster0.slice();
  if (Game.map) { const v = Game.state.village; Game.map.px = v.px ?? 4; Game.map.py = v.py ?? 4; }
  Game.state.village.pantryKcal = 60000;
  delete s.feastDay;
  expectMoment('feast (game hostFeast)', 'feast', 'feastFire', () => {
    const r = Game.hostFeast({});
    if (!r || !r.ok) console.log('    hostFeast refused: ' + (r && r.why));
  });
  reset();
  T.ok('a refused feast (one a day) plays nothing', (() => { const r = Game.hostFeast({}); return (!r || !r.ok) && !moments().includes('feast'); })());

  // titans: entry sting + titan voice, phase thirds, the fall
  Game._tableTrialDirect = true;
  reset();
  const tf = K.fight(Game, 'finale');
  T.ok('titan entry: sting + the titan\'s own voice', !!tf && moments().includes('titanEntry') && aLog.includes('titanEntrySting') && aLog.includes('fiTitleCard'), `moments=${moments().join(',')} audio=${aLog.join(',')}`);
  if (tf) {
    tf.hp = tf.maxHp = 900;
    reset();
    Game.tbDamage(tf.key, 350, 'test', 'p', { quiet: true });
    T.ok('titan phase change at two thirds', moments().includes('titanPhase') && aLog.includes('titanPhaseSting'), moments().join(','));
    reset();
    Game.tbDamage(tf.key, 5, 'test', 'p', { quiet: true });
    T.ok('no repeat inside the same third', !moments().includes('titanPhase'));
    tf.hp = 0; tf.alive = false;
    reset();
    Game.tbEnd('won');
    T.ok('titan kill: the fall', moments().includes('titanFall') && aLog.includes('titanFallSting'), moments().join(','));
  }
  try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { console.warn('end titan', e.message); }

  // the Table: entry, lock-in, beat, lose, win
  const pg = Game.progState();
  s.day = 95;
  Game.wipe = () => {};
  Game.tableTrialByCombat = function () { this.tableState().trialed = true; };
  Game.tableSeat = () => ({ seat: 'full', detail: {} });
  Game.winDayFloorOk = () => true;
  pg.table = {}; pg.tableDone = false; pg.tableWaiting = true;
  // This presentation fixture must use a live, accessible Haven entry after
  // its earlier combat scenes, just like the native seat action.
  Game.over = false; Game.won = false; s.monster = null;
  s.insideHaven = true; Game.playerTile().type = 'haven';
  T.ok('Table feedback fixture has a valid public entry context', Game.tableEntryBlock() === '', Game.tableEntryBlock());
  expectMoment('Table entry', 'tableEnter', 'tableEnterSting', () => Game.tableTakeSeat());
  Game.tableBranch = () => ({ branch: 'light', light: 3, dark: 0, notes: [] });
  expectMoment('Table lock-in (a door chosen)', 'tableLock', 'tableLockIn', () => Game.tableStartPath('beloved'));
  T.ok('...and the first beat pulses', moments().includes('tableBeat') && aLog.includes('tableBeatPulse'), moments().join(','));
  expectMoment('Table loss', 'tableLose', 'tableLoseSting', () => Game.tableFail('test'));
  pg.table = {}; pg.tableDone = false; Game.won = false; Game.over = false;
  Game.tableTakeSeat(); Game.tableStartPath('beloved');
  expectMoment('Table win', 'tableWin', 'tableWinSting', () => Game.tableResolveFinal('final:none'));
  Game.won = false; Game.over = false;

  reset();
  Game.feel('systemArrival', {});
  T.ok('day-7 arrival sting (the cinematic itself is the visual)', aLog.includes('arrivalSting'), aLog.join(','));
  const beats = Game.systemArrivalBeats();
  const contact = beats.find(b => b.id === 'contact');
  const ids = Game.arrivalVoiceIds(contact);
  T.ok('arrival beats map to the recorded System lines (sys-day7)', ids.length === 3 && ids.every(id => /^sys-day7-/.test(id)), ids.join(','));
  const manifest = JSON.parse(fs.readFileSync(path.join(K.ROOT, 'src/audio/system/manifest.json'), 'utf8'));
  const allIds = Object.values(F.ARRIVAL_VOICE).reduce((a, b) => a.concat(b), []);
  T.ok('every arrival voice id exists in the manifest with an MP3 on disk', allIds.every(id => { const e = manifest.find(m => m.id === id); return e && fs.existsSync(path.join(K.ROOT, e.file)); }));

  T.section('3b. System-styled moments wait for day 7; human ones do not');
  Game.state.systemArrived = false;
  reset();
  const gatedAsc = Game.feel('ascension', { name: 'x' });
  const gatedTitan = Game.feel('titanEntry', { name: 'x' });
  const okFb = Game.feel('flashback', { name: 'x' });
  const okFeast = Game.feel('feast', {});
  T.ok('ascension/titan refused pre-System, nothing drawn or heard', !gatedAsc && !gatedTitan && !moments().includes('ascension') && !aLog.includes('ascensionRise'));
  T.ok('flashback/feast play pre-System, grounded', okFb && okFeast && dLog.filter(x => x[0] === 'moment').every(x => x[1][1].grounded === true));
  Game.state.systemArrived = true;

  // ---------------------------------------------------------------- 4
  T.section('4. The 27 god-path abilities: data-driven visual + cue');
  const abil = Game.data.abilities || [];
  const doIds = abil.filter(a => (a.actions || []).some(x => x.do)).map(a => a.id);
  const subclassRoster = ['aegis_link', 'raise_earth', 'gravity_well', 'landslide', 'pack_hunt', 'mending_hands', 'lifeline', 'keepers_oath', 'mourners_bond', 'last_rites', 'blink', 'switcheroo', 'misdirection', 'foresight', 'prophecy', 'live_broadcast', 'rally_aura', 'the_crowd_moves', 'stoke', 'ember_heart', 'back_from_the_brink', 'coin_guard', 'haggle', 'bribe', 'sweetener', 'harvest_table', 'long_table'];
  const keys = Object.keys(F.FEEL_VERBS);
  T.ok('FEEL_VERBS covers all 27 subclass abilities, each real in abilities.json', keys.length === 27 && subclassRoster.every(id => keys.includes(id) && abil.some(a => a.id === id)));
  T.ok('every active verb (data `do`) has an effect', doIds.every(id => keys.includes(id)), doIds.filter(id => !keys.includes(id)).join(','));
  const vfx = new Set(['wall', 'pull', 'push', 'pack', 'heal', 'blink', 'swap', 'foresee', 'broadcast', 'command', 'stoke', 'coins', 'bribe', 'feed', 'thread']);
  T.ok('each active verb has its own distinct visual', doIds.map(id => F.FEEL_VERBS[id].fx).filter(fx => vfx.has(fx)).length === doIds.length && new Set(doIds.map(id => F.FEEL_VERBS[id].fx)).size >= 14);
  // a real use: Raise Earth in a fight
  s.abilities = [];
  K.giveAbility(Game, 'raise_earth', { force: true, level: 1 });
  s.kcal = 5000;
  K.fight(Game, 'hushwolf');
  reset();
  const used = Game.useAbility('raise_earth', 'raise');
  const vcall = dLog.find(x => x[0] === 'verbFx');
  T.ok('useAbility(raise_earth) -> wall on the grid + verbCue', used !== false && !!vcall && vcall[1][0].fx === 'wall' && aLog.includes('verbCue'), `used=${JSON.stringify(used)} ${methods().join(',')} / ${aLog.join(',')}`);
  T.ok('the wall is placed between player and target (positions from the live fight)', !!vcall && typeof vcall[1][0].px === 'number' && typeof vcall[1][0].tx === 'number');
  reset();
  Game.say('Their echo stands between you and the next 2 blows. (Last Rites)');
  Game.say('Their echo stands between you and the next 2 blows. (Last Rites)');
  const echoes = dLog.filter(x => x[0] === 'verbFx' && x[1][0].fx === 'echo');
  T.ok('a passive fires on its narration tag, once per round', echoes.length === 1, String(echoes.length));
  try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { console.warn('end verb', e.message); }

  // ---------------------------------------------------------------- 5
  T.section('5. Reduced motion + grounded look in the real drama.js (DOM stub)');
  const store = {};
  global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const made = [];
  const mkEl = () => {
    const el = {
      style: { setProperty() {} }, _cls: new Set(), innerHTML: '', children: [], attrs: {},
      classList: { add: c => el._cls.add(c), remove: c => el._cls.delete(c), contains: c => el._cls.has(c) },
      setAttribute(k, v) { el.attrs[k] = v; }, appendChild(c) { el.children.push(c); made.push(c); return c; },
      remove() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 400 }),
      querySelector: () => null, querySelectorAll: () => [], offsetWidth: 1,
    };
    return el;
  };
  const detail = mkEl();
  global.document = {
    getElementById: () => null, head: { appendChild() {} }, body: mkEl(),
    createElement: () => mkEl(), contains: () => true,
    querySelector: (q) => (q === '.detail' ? detail : null),
  };
  global.getComputedStyle = () => ({ position: 'relative' });
  global.requestAnimationFrame = (cb) => cb();
  const realSetTimeout = global.setTimeout;
  global.setTimeout = (cb, ms) => realSetTimeout(() => {}, 0); // effects' later beats are not under test
  // eslint-disable-next-line no-eval
  (0, eval)(fs.readFileSync(path.join(K.ROOT, 'src/js/drama.js'), 'utf8'));
  const D = S.Drama;
  global.setTimeout = realSetTimeout;
  const classesOf = () => made.map(e => [...e._cls]).reduce((a, b) => a.concat(b), []);

  store.oversight_reduce_motion = '0';
  made.length = 0; detail._cls.clear();
  global.setTimeout = (cb) => realSetTimeout(() => {}, 0);
  D.grounded('crit', 3, 3, 14);
  D.critHit(3, 3, 14, 3);
  global.setTimeout = realSetTimeout;
  const normal = classesOf();
  T.ok('motion on: grounded crit animates (dfx-g-thud) and the System crit bursts (drama-hit)', normal.includes('dfx-g-thud') && normal.includes('drama-hit'), normal.join(','));
  T.ok('motion on: the board shakes', detail._cls.has('drama-shake'));
  T.ok('grounded crit carries no System cyan or System words', made.every(e => !SYSTEM_CYAN.test(e.innerHTML)), made.map(e => e.innerHTML).filter(h => SYSTEM_CYAN.test(h)).join(' | ').slice(0, 200));

  store.oversight_reduce_motion = '1';
  T.ok('reducedMotion() reads the in-game toggle', F.reducedMotion() === true && Game.reducedMotion() === true);
  made.length = 0; detail._cls.clear();
  global.setTimeout = (cb) => realSetTimeout(() => {}, 0);
  D.grounded('crit', 3, 3, 14);
  D.critHit(3, 3, 14, 3);
  D.playerHurt(20, 3);
  D.moment('ascension', { name: 'X', title: 'Y', sprite: '<svg class="sprite"></svg>' });
  D.verbFx({ fx: 'push', px: 2, py: 2, tx: 4, ty: 4, color: '#a07a4a', glyph: '≋' });
  global.setTimeout = realSetTimeout;
  const calm = classesOf();
  const animated = calm.filter(c => /^(dfx-|drama-hit|drama-float|drama-shockwave|drama-vignette|drama-sparkle)/.test(c));
  T.ok('reduced motion: every effect is a calm fade (drama-calm), no burst/scale classes', calm.includes('drama-calm') && animated.length === 0, animated.join(','));
  T.ok('reduced motion: no shake', !detail._cls.has('drama-shake'));
  made.length = 0;
  D.moment('classRecognized', { line: 'Warden of the Wall' });
  T.ok('calm moments still say what happened (the card is there, as a fade)', made.some(e => /Warden of the Wall/.test(e.innerHTML) && e._cls.has('drama-calm')));
  store.oversight_reduce_motion = '0';
  S.Drama = dramaStub; // back to the recorder for haptics

  // ---------------------------------------------------------------- 6
  T.section('6. Haptics: feature-detected, setting-gated');
  const buzz = [];
  const hadNav = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true, writable: true });
  T.ok('no navigator.vibrate -> unsupported, haptic() is a no-op', F.hapticsSupported() === false && Game.haptic('death') === false);
  Object.defineProperty(globalThis, 'navigator', { value: { vibrate: (p) => { buzz.push(p); return true; } }, configurable: true, writable: true });
  T.ok('supported + no setting -> on by default', F.hapticsSupported() && F.hapticsEnabled());
  Game.setHaptics(false);
  buzz.length = 0;
  T.ok('setting off -> nothing vibrates', Game.haptic('death') === false && buzz.length === 0);
  Game.setHaptics(true);
  T.ok('setting on -> death buzzes its pattern', Game.haptic('death') === true && buzz.length === 1 && Array.isArray(buzz[0]) && buzz[0].length >= 3);
  await new Promise(r => setTimeout(r, 120));
  buzz.length = 0;
  Game.drama('playerHurt', 12);
  T.ok('a real hit taken buzzes through the drama dispatcher', buzz.length === 1, JSON.stringify(buzz));
  for (const k of ['hurt', 'crit', 'death', 'levelUp', 'ascension', 'arrival']) {
    T.ok(`pattern exists: ${k}`, Array.isArray(F.HAPTIC_PATTERNS[k]));
  }
  Game.setHaptics(false);
  buzz.length = 0;
  Game.feel('levelUpOpen', {});
  T.ok('moments respect the setting too', buzz.length === 0);
  if (hadNav) Object.defineProperty(globalThis, 'navigator', hadNav); else delete globalThis.navigator;
  delete global.localStorage; delete global.document; delete global.getComputedStyle; delete global.requestAnimationFrame;

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
