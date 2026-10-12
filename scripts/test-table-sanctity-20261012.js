#!/usr/bin/env node
// Table sanctity proof test (2026-10-12, Steve's pick): while the table
// sits, the world holds its breath. Ambient monster pressure against
// villagers is suspended for the whole sequence — no wild-encounter
// targeting, no patrol contact, no expedition meetings. The table's OWN
// stakes (trial by combat, pricing) still fire. The flag clears on every
// resolve. The System clears the stage aloud, once.
//
// Run: node scripts/test-table-sanctity-20261012.js   (SEED env override)
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
const SEED = parseInt(process.env.SEED || '20261012', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

// Transcript capture for the sense-read.
const transcript = [];
const _say = Game.say, _sysSay = Game.sysSay;
Game.say = function (t) { transcript.push(['say', String(t).slice(0, 220)]); return _say.call(this, t); };
Game.sysSay = function (t) { transcript.push(['sys', String(t).slice(0, 220)]); return _sysSay.call(this, t); };
// NOTE: Game.save is intentionally NOT stubbed (real save exercises the
// real path in node per the sim-harness lesson).

function resetTable() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  transcript.length = 0;
}
function mkDeeds(waves, contests, crises) {
  const faced = {};
  waves.forEach(([wave, n], wi) => { for (let i = 0; i < n; i++) faced['w' + wave + 'm' + i] = wave; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: contests };
  Game.progState().crises = {};
  for (let i = 0; i < crises; i++) Game.progState().crises['c' + i] = 1;
}

// One synthetic path so the challenge has somewhere to go.
Game.tableRegisterPath({
  id: 'testsigma', name: 'the Test Sigma', minSeat: 'lesser', showGenre: 'test', showLive: 'TEST SIGMA LIVE',
  openLine: 'The test begins.',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 60, why: 'Test earned.' }; },
  beats: [
    { say: ['Beat one: the ring steadies.'], choices: [{ id: 'a', label: 'Choose A', effects: {} }] },
  ],
  finals: {
    light: [{ id: 'x', label: 'Finish X (light)', outcome: ['The light finish.'] }],
    dark: [{ id: 'y', label: 'Finish Y (dark)', outcome: ['The dark finish.'] }],
  },
  failure: { beat: 'custom', offerLine: 'Custom smaller doors.' },
});
// Second synthetic path so the downgrade pick is fully controlled (the real
// assimilated path is always earned and would otherwise be first in line).
Game.tableRegisterPath({
  id: 'testtau', name: 'the Test Tau', minSeat: 'lesser', showGenre: 'test', showLive: 'TEST TAU LIVE',
  openLine: 'The tau test begins.',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 40, why: 'Test earned weakly.' }; },
  beats: [
    { say: ['Tau beat one.'], choices: [{ id: 'a', label: 'Choose A', effects: {} }] },
  ],
  finals: {
    light: [{ id: 'x', label: 'Finish X (light)', outcome: ['The tau light finish.'] }],
    dark: [{ id: 'y', label: 'Finish Y (dark)', outcome: ['The tau dark finish.'] }],
  },
  failure: { beat: 'custom', offerLine: 'Custom smaller doors.' },
});

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.systemArrived = true;

  const vid = Game.state.village.roster.find(id => id !== Game.villagerId) || Game.state.village.roster[0];
  const first = (() => { try { return Game.displayName(vid).split(' ')[0]; } catch (e) { return 'Someone'; } })();

  console.log('— RED: no table, no sanctity —');
  resetTable();
  ok(Game.tableActive() === false, 'fresh run: tableActive() false');
  ok(typeof Game.tableActive === 'function', 'tableActive is a Game method (guarded callers degrade clean)');

  console.log('— tableScene fires sanctity —');
  Game.state.scholar.integration = 50;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  mkDeeds([[1, 4], [2, 4], [3, 3]], 2, 2);
  Game.progState().ledger = { might: 0, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 0, foodShared: 0, foodHoarded: 0, protected: 0, killed: 0, betrayed: 0 };
  Game.tableScene();
  ok(Game.progState().tableDone === true, 'table fires once (tableDone set)');
  ok(Game.tableActive() === true, 'tableActive() true while the table sits');
  const stageLines = transcript.filter(([k, t]) => k === 'sys' && t.indexOf('SIT. WATCH') >= 0);
  ok(stageLines.length === 1, 'System clears the stage aloud, exactly once', 'got ' + stageLines.length);
  console.log('    stage line: ' + (stageLines[0] ? stageLines[0][1] : '(missing)'));

  console.log('— ambient suppression: wild-encounter tick —');
  // Rig: a world monster sitting on a villager's tile.
  const _worldMonsters = Game.worldMonsters, _npcsOnNode = Game.npcsOnNode;
  Game.map = Game.map || {}; Game.map.px = 0; Game.map.py = 0;
  Game.worldMonsters = () => [{ id: 'hushwolf', tx: 5, ty: 5 }];
  Game.npcsOnNode = () => [vid];
  let wildCalls = 0;
  const _resolveWild = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (v, m) { wildCalls++; return _resolveWild.call(this, v, m); };
  Game.villagerMonsterTick();
  ok(wildCalls === 0, 'table active: villagerMonsterTick targets nobody', 'calls=' + wildCalls);
  // RED control: same rig, flag off. Force the tick's bloodbath draw under
  // 0.5 so the control is deterministic across seeds (test-side RNG fix).
  resetTable();
  wildCalls = 0;
  const _rnd = Math.random;
  Math.random = () => 0.1;
  Game.villagerMonsterTick();
  Math.random = _rnd;
  ok(wildCalls >= 1, 'RED: flag off, the tick still routes encounters', 'calls=' + wildCalls);
  Game.resolveWildMonsterEncounter = _resolveWild;
  Game.worldMonsters = _worldMonsters; Game.npcsOnNode = _npcsOnNode;
  // Re-fire the table for the remaining suppression checks.
  Game.tableScene();

  console.log('— ambient suppression: patrols —');
  const _nearest = Game.nearestWorldMonster, _fieldFight = Game.fieldFight;
  Game.nearestWorldMonster = () => ({ id: 'hushwolf', tx: 1, ty: 1 });
  let fightCalls = 0;
  Game.fieldFight = function () { fightCalls++; return { outcome: 'evade', rounds: 0, vTaken: 0, mTaken: 0 }; };
  ok(Game.tableActive() === true, 'table still active for patrol check');
  Game.resolvePatrol(vid, first);
  ok(fightCalls === 0, 'table active: patrol meets nothing (uneventful branch)', 'calls=' + fightCalls);
  ok(transcript.some(([k, t]) => /patrol|perimeter|watch/i.test(t)), 'patrol still walks, honestly uneventful');
  // RED control.
  resetTable(); fightCalls = 0;
  Game.resolvePatrol(vid, first);
  ok(fightCalls >= 1, 'RED: flag off, patrol fights the threat', 'calls=' + fightCalls);
  Game.nearestWorldMonster = _nearest; Game.fieldFight = _fieldFight;
  Game.tableScene();

  console.log('— ambient suppression: expeditions —');
  Game.fieldFight = function () { fightCalls++; return { outcome: 'evade', rounds: 0, vTaken: 0, mTaken: 0 }; };
  fightCalls = 0;
  ok(Game.tableActive() === true, 'table still active for expedition check');
  try { Game.expeditionMonster(vid, 3, true); } catch (e) { /* agency rig may be thin; the gate is before it */ }
  ok(fightCalls === 0, 'table active: expedition meets nothing', 'calls=' + fightCalls);
  Game.fieldFight = _fieldFight;

  console.log('— the table\'s own stakes still fire —');
  // fieldFight itself is not neutered: direct calls still resolve real fights.
  const rec = Game.fieldFight(vid, { id: 'hushwolf', name: 'hushwolf' }, null, { awareness: true });
  ok(rec && typeof rec.rounds === 'number' && rec.outcome, 'direct fieldFight still resolves (engine intact)', JSON.stringify({ rounds: rec && rec.rounds, outcome: rec && rec.outcome }));
  // Trial by combat — the one opt-in existential risk — is not gated.
  let trialStarted = false;
  const _startCombat = Game.startCombat, _runBeat = Game.tableRunBeat;
  Game.startCombat = function () { trialStarted = true; };
  Game.tableRunBeat = function () {};
  const T = Game.tableState();
  T.phase = 'challenge'; T.path = 'feared'; T.beat = 0; T.trialPending = false;
  ok(Game.tableActive() === true, 'flag on during trial check');
  try { Game.tableTrialByCombat(); } catch (e) {}
  ok(trialStarted === true, 'trial by combat still summons the champion under sanctity');
  Game.startCombat = _startCombat; Game.tableRunBeat = _runBeat;

  console.log('— the no-seat path grants no sanctity —');
  resetTable();
  Game.progState().deeds = { wavesFaced: {}, contestsSurvived: 0 };
  Game.progState().crises = {};
  Game.tableScene();
  ok(Game.tableActive() === false, 'withdrawn table: no sanctity without a seat');
  ok(Game.progState().tableDone !== true, 'tableDone not set on withdrawal');

  console.log('— flag clears on resolve (win) —');
  resetTable();
  mkDeeds([[1, 4], [2, 4], [3, 3]], 2, 2);
  Game.tableScene();
  ok(Game.tableActive() === true, 'active before resolve');
  Game.chooseTableOption('path:testsigma');
  Game.chooseTableOption('beat:a');
  ok(Game.tableState().phase === 'finals', 'finals reached');
  Game.chooseTableOption('final:x');
  ok(Game.won === true && Game.tableState().phase === 'done', 'run resolves won');
  ok(Game.tableActive() === false, 'sanctity lifts when the table resolves');

  console.log('— flag clears on lesser-frame resolve (failure -> downgrade -> win) —');
  resetTable();
  mkDeeds([[1, 4], [2, 4], [3, 3]], 2, 2);
  Game.tableScene();
  Game.chooseTableOption('path:testsigma');
  // Force a failure: tableFail straight to the downgrade offer.
  Game.tableFail('the test failed on purpose');
  ok(Game.tableActive() === true, 'still active through the downgrade');
  let tc = Game.state.scholar.tableChoices;
  const dg = (tc.options || []).find(o => o.id === 'downgrade:testtau');
  ok(!!dg, 'downgrade offered, never a wipe', JSON.stringify((tc.options || []).map(o => o.id)));
  Game.chooseTableOption(dg.id);
  Game.chooseTableOption('beat:a');
  Game.chooseTableOption('final:x');
  ok(Game.won === true && Game.tableActive() === false, 'lesser frame resolves; sanctity lifts');

  console.log('— gate placement audit —');
  const src = fs.readFileSync(path.join(ROOT, 'src/js/table.js'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8')
    + fs.readFileSync(path.join(ROOT, 'src/js/villager-agency.js'), 'utf8');
  const gates = (src.match(/tableActive\(\)\)/g) || []).length;
  // tableActive def + 3 ambient gates. If this count grows, a new gate was
  // added — the table's own stakes must never be among them.
  ok(gates === 3, 'exactly 3 ambient gates on the predicate (no stake neutered)', 'tableActive()) hits=' + gates);

  console.log('\n— sense-read: the stage-clearing moment —');
  transcript.filter(([k, t]) => /AUDIT|SIT\. WATCH|HUMANITY PRESENTS/i.test(t)).forEach(([k, t]) => console.log('  [' + k + '] ' + t));

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
