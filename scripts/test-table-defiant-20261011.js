#!/usr/bin/env node
// Defiant path proof test (2026-10-11): defiance prereq, reverse auction
// (real pantry kcal, named relay person, REAL de-integration), can't-pay
// stall failure, long-road cover, light/dark twists + finals. Sense-read.
//
// Run: node scripts/test-table-defiant-20261011.js   (SEED env override)
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
function lesserSeat() {
  Game.state.systemArrived = true; Game.state.scholar.integration = 50;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
}
function lightLedger() {
  Game.progState().ledger = { might: 2, brokerage: 1, showmanship: 0, embrace: 0, defiance: 6, exposed: 0, unified: 2, fractured: 0, foodShared: 1, foodHoarded: 0, protected: 3, killed: 1, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
  Game.state.village.trust = Game.state.village.trust || {};
}
function darkLedger() {
  Game.progState().ledger = { might: 3, brokerage: 0, showmanship: 0, embrace: 0, defiance: 9, exposed: 0, unified: 0, fractured: 1, foodShared: 0, foodHoarded: 0, protected: 0, killed: 6, betrayed: 0 };
  Game.state.village.promises = {};
  Game.state.village.trust = Game.state.village.trust || {};
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  lesserSeat(); lightLedger();

  console.log('— prereq: the no must be earned —');
  Game.progState().ledger.defiance = 1;
  let p = Game.tableEarnedPaths().find(x => x.id === 'defiant');
  ok(p && !p.earned, 'thin defiance: not earned', p && p.why);
  Game.progState().ledger.defiance = 6;
  p = Game.tableEarnedPaths().find(x => x.id === 'defiant');
  ok(p && p.earned, 'defiance 6: earned', p && p.why);

  console.log('— light run: the reverse auction —');
  resetAll();
  Game.state.village.pantry = [{ kcalEach: 15000, units: 3, name: 'stores' }]; // 45k
  const roster = (Game.data.villagers || []).filter(v => v.id !== Game.villagerId);
  if (roster[0]) Game.state.village.trust[roster[0].id] = 50;
  Game.tableScene();
  Game.chooseTableOption('path:defiant');
  ok(T().branch === 'light', 'light branch');
  ok(tc().prompt.indexOf('45,000 kcal') >= 0, 'price one names the REAL pantry');
  Game.chooseTableOption('beat:half'); // paid+2
  ok(tc().prompt.indexOf('relay') >= 0 || tc().prompt.indexOf('RELAY') >= 0, 'price two: the relay person');
  // The person is named — a real villager.
  ok(/look at \w+/.test(tc().prompt), 'the price has a face', tc().prompt.slice(0, 200));
  Game.chooseTableOption('beat:buyback'); // paid+1, promise planted
  const integBefore = Game.state.scholar.integration;
  Game.chooseTableOption('beat:overlay'); // REAL de-integration: 50 -> 39
  ok(Game.state.scholar.integration === 39, 'de-integration is REAL (stage 2 -> 1)', `was ${integBefore}, now ${Game.state.scholar.integration}`);
  ok(T().meters.paid === 5, 'paid meter tracks', 'paid=' + T().meters.paid);
  ok(tc().options.some(o => o.id === 'beat:notwice'), 'light twist: say no twice');
  Game.chooseTableOption('beat:notwice');
  ok(T().phase === 'finals', 'finals reached');
  Game.chooseTableOption('final:walk');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('highest-rated footage') >= 0), 'light defiant resolves');

  console.log('— cant-pay stall —');
  resetAll(); lesserSeat(); lightLedger();
  Game.state.village.pantry = []; // thin shelves
  Game.state.village.trust = {}; // no one to name
  Game.tableScene();
  Game.chooseTableOption('path:defiant');
  Game.chooseTableOption('beat:harvest'); // needs 20000, has 0 -> stall... unless long-road
  // Long Road covers it once (shared ability).
  ok(T().phase === 'challenge' && T().longRoadUsed === true, 'long-road covers the unpayable price once');
  // Second unpayable price: the person, no cover left -> stall.
  transcript.length = 0;
  Game.chooseTableOption('beat:name'); // no one to name
  ok(T().phase === 'downgrade', 'second unpayable price stalls the walk -> downgrade');
  ok(transcript.some(([k, t]) => t.indexOf('stalled at the door') >= 0), 'the stall said aloud');
  ok(!transcript.some(([k, t]) => t.indexOf('You name someone') >= 0), 'failed choice narrates its failure, not its success (no "You name someone")');
  const falter = transcript.find(([k, t]) => t.indexOf('THE TABLE FALTERS') >= 0);
  ok(falter && (falter[1].match(/stalled at the door/g) || []).length === 1, 'stall frame said once, not duplicated', falter && falter[1].slice(0, 140));
  Game.chooseTableOption('downgrade:testbeta');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won, 'weakened path resolves');

  console.log('— dark run: scorched earth —');
  resetAll(); lesserSeat(); darkLedger();
  Game.state.village.pantry = [{ kcalEach: 15000, units: 3, name: 'stores' }];
  Game.state.scholar.integration = 50;
  Game.tableScene();
  Game.chooseTableOption('path:defiant');
  ok(T().branch === 'dark', 'dark branch');
  Game.chooseTableOption('beat:grain');
  Game.chooseTableOption('beat:noone');
  Game.chooseTableOption('beat:tear');
  ok(tc().options.some(o => o.id === 'beat:fields'), 'dark twist: what burns');
  Game.chooseTableOption('beat:fields');
  Game.chooseTableOption('final:walk');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('salt and ash') >= 0), 'dark defiant resolves');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
