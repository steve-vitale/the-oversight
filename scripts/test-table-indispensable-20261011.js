#!/usr/bin/env node
// Indispensable path proof test (2026-10-11): full-seat-only prereq,
// clause drafting (leverage vs cage), anchor halving cage gains,
// light/dark twists, cage-closed failure, branch finals. Sense-read printed.
//
// Run: node scripts/test-table-indispensable-20261011.js   (SEED env override)
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
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -90", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(['say', String(t).slice(0, 240)]); };
Game.sysSay = function (t) { transcript.push(['sys', String(t).slice(0, 240)]); };
Game.wipe = function () { transcript.push(['sys', '(wipe — honest run end)']); };
Game.save = function () {};
Game.tableRegisterPath({
  id: 'testbeta', name: 'the Test Beta', minSeat: 'lesser', showGenre: 'test', showLive: 'x', openLine: 'y',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 40, why: 'weak' }; },
  beats: [{ say: ['b'], choices: [{ id: 'ok', label: 'OK', effects: {} }] }],
  finals: { light: [{ id: 'z', label: 'Z', outcome: ['d'] }] },
});

function resetAll() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  transcript.length = 0;
}
function fullSeat() {
  Game.state.systemArrived = true; Game.state.scholar.integration = 85;
  Game.state.nationalLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 5], [2, 5], [3, 4], [4, 3], [5, 2]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 3 };
  Game.progState().crises = { c1: 1, c2: 1, c3: 1 };
}
function lesserOnly() {
  Game.state.nationalLive = false; Game.state.networkLive = true;
  Game.state.scholar.integration = 50;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
}
function lightLedger() {
  Game.progState().ledger = { might: 3, brokerage: 5, showmanship: 1, embrace: 0, defiance: 0, exposed: 0, unified: 3, fractured: 0, foodShared: 4, foodHoarded: 0, protected: 3, killed: 1, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
}
function darkLedger() {
  Game.progState().ledger = { might: 4, brokerage: 5, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 3, foodShared: 1, foodHoarded: 4, protected: 1, killed: 6, betrayed: 1 };
  Game.state.village.promises = { v1: { kept: 'broken', favorId: 'f1' } };
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  fullSeat(); lightLedger();

  console.log('— prereq: full seat only —');
  lesserOnly();
  let p = Game.tableEarnedPaths().find(x => x.id === 'indispensable');
  ok(p && !p.earned && p.why.indexOf('full seat') >= 0, 'lesser seat: indispensable not earned', p && p.why);
  fullSeat();
  p = Game.tableEarnedPaths().find(x => x.id === 'indispensable');
  ok(p && p.earned, 'full seat + shared truth: earned', p && (p.strength + ' — ' + p.why));
  Game.progState().ledger.foodShared = 0;
  p = Game.tableEarnedPaths().find(x => x.id === 'indispensable');
  ok(p && !p.earned, 'hoarder cannot play indispensable', p && p.why);
  lightLedger();

  console.log('— light run: clauses —');
  resetAll();
  Game.state.village.pantry = [{ kcalEach: 12000, units: 3, name: 'stores' }];
  Game.tableScene();
  Game.chooseTableOption('path:indispensable');
  ok(T().branch === 'light', 'light branch');
  ok(T().abils.indexOf('ledger-eye') >= 0 && T().abils.indexOf('anchor') >= 0, 'ledger-eye + light-branch anchor granted');
  ok(T().meters.leverage === 3, 'ledger-eye + openhand: leverage starts at 3', 'lev=' + T().meters.leverage);
  ok(tc().prompt.indexOf('36,000 kcal') >= 0, 'beat 0 names the REAL pantry number in the modal');
  Game.chooseTableOption('beat:real'); // lev+2=5
  Game.chooseTableOption('beat:free'); // lev+2=7, cage-1
  ok(T().meters.cage === -1, 'cage can go negative (deliberate slack)', 'cage=' + T().meters.cage);
  // Anchor halves cage gains: rig and inflate.
  T().meters.cage = 3; T().meters.leverage = 6;
  // (can't re-pick; verify via next run) — instead check the twist beat renders light.
  ok(tc().options.some(o => o.id === 'beat:keep'), 'light twist: keep the ramp offered');
  Game.chooseTableOption('beat:keep');
  ok(T().phase === 'finals', 'finals reached');
  ok(tc().options.some(o => o.id === 'final:teach'), 'light finals offered');
  Game.chooseTableOption('final:teach');
  ok(Game.won, 'light indispensable resolves');

  console.log('— anchor halves cage gains —');
  resetAll(); fullSeat(); lightLedger();
  Game.tableScene();
  Game.chooseTableOption('path:indispensable');
  Game.chooseTableOption('beat:inflate'); // cage+3 -> halved to +1 by anchor (light branch)
  ok(T().meters.cage === 1, 'anchor: cage gain halved', 'cage=' + T().meters.cage);

  console.log('— dark run + cage-closed failure —');
  resetAll(); fullSeat(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:indispensable');
  ok(T().branch === 'dark', 'dark branch');
  ok(T().abils.indexOf('anchor') < 0, 'dark branch: no anchor — the cage closes faster', T().abils.join(','));
  ok(T().meters.leverage === 4 && T().meters.cage === 3, 'chokepoint grant applied', JSON.stringify(T().meters));
  // The honest cage-close (2026-10-11): three cage-tightening clauses and
  // then claiming the cage as your own idea — no rigged meters needed.
  Game.chooseTableOption('beat:inflate'); // lev 5, cage 6
  Game.chooseTableOption('beat:price'); // lev 6, cage 9
  ok(tc().options.some(o => o.id === 'beat:own'), 'dark twist: own it offered');
  Game.chooseTableOption('beat:own'); // lev 8, cage 14 > 12 -> the cage closes
  ok(T().phase === 'downgrade', 'cage closed -> downgrade, never a wipe');
  ok(transcript.some(([k, t]) => t.indexOf('cage closed') >= 0), 'failure said aloud');
  Game.chooseTableOption('downgrade:testbeta');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won, 'weakened path resolves');

  console.log('— dark finals —');
  resetAll(); fullSeat(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:indispensable');
  Game.chooseTableOption('beat:real');
  Game.chooseTableOption('beat:price');
  Game.chooseTableOption('beat:deny');
  ok(tc().options.some(o => o.id === 'final:cage'), 'dark finals: sign the cage');
  Game.chooseTableOption('final:cage');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('follows you home') >= 0), 'dark ending lands');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
