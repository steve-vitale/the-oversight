#!/usr/bin/env node
// Assimilated path proof test (2026-10-11): always-earned prereq, three
// placement picks (branch/tier/secrets), contraband show component (never
// televised), light/dark twists, branch finals. By design almost no failure —
// the safe ending. Sense-read printed.
//
// Run: node scripts/test-table-assimilated-20261011.js   (SEED env override)
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
  Game.progState().ledger = { might: 1, brokerage: 1, showmanship: 1, embrace: 3, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 4, killed: 0, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
}
function darkLedger() {
  Game.progState().ledger = { might: 1, brokerage: 0, showmanship: 0, embrace: 6, defiance: 0, exposed: 0, unified: 0, fractured: 0, foodShared: 0, foodHoarded: 0, protected: 0, killed: 0, betrayed: 0 };
  Game.state.village.promises = {};
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  lesserSeat(); lightLedger();

  console.log('— prereq: always open —');
  const p = Game.tableEarnedPaths().find(x => x.id === 'assimilated');
  ok(p && p.earned, 'assimilated earned at lesser+', p && p.why);

  console.log('— light run: the long con —');
  resetAll();
  Game.tableScene();
  Game.chooseTableOption('path:assimilated');
  ok(T().branch === 'light', 'light branch (Trojan horse)');
  ok(transcript.some(([k, t]) => t.indexOf('CONTRABAND') >= 0), 'show component is contraband, never televised');
  ok(!transcript.some(([k, t]) => k === 'sys' && t.indexOf('LIVE') >= 0), 'no LIVE broadcast for the assimilation');
  ok(T().meters.comfort === 2, 'soft-landing: comfort starts at 2');
  Game.chooseTableOption('beat:archives'); // comfort+1, self+1
  Game.chooseTableOption('beat:grey'); // comfort+0, self+2
  ok(tc().options.some(o => o.id === 'beat:truth'), 'light twist: the intake scan');
  Game.chooseTableOption('beat:truth'); // self+2
  ok(T().phase === 'finals', 'finals reached — no failure state by design');
  Game.chooseTableOption('final:grief');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('horse bolts') >= 0), 'light assimilated: the horse bolts');

  console.log('— dark run: true believer —');
  resetAll(); lesserSeat(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:assimilated');
  ok(T().branch === 'dark', 'dark branch (true believer)');
  ok(T().meters.comfort === 4, 'true-face: comfort starts at 4', 'comfort=' + T().meters.comfort);
  Game.chooseTableOption('beat:kitchens');
  Game.chooseTableOption('beat:citizen');
  ok(tc().options.some(o => o.id === 'beat:village'), 'dark twist: name the village');
  Game.chooseTableOption('beat:village');
  Game.chooseTableOption('final:comfort');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('point of comfort') >= 0), 'dark assimilated resolves');

  console.log('— placement tradeoffs are real —');
  resetAll(); lesserSeat(); lightLedger();
  Game.tableScene();
  Game.chooseTableOption('path:assimilated');
  const c0 = T().meters.comfort, s0 = T().meters.self;
  Game.chooseTableOption('beat:nurseries'); // light: comfort+1, self+2
  ok(T().meters.comfort === c0 + 1 && T().meters.self === s0 + 2, 'nurseries: the tradeoff priced', JSON.stringify(T().meters));

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
