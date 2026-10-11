#!/usr/bin/env node
// Witness path proof test (2026-10-11): exposure prereq, three-beat trial,
// villagers testifying about YOUR leadership in their own words, subpoena,
// light/dark twists, record-convicts-you failure, branch finals. Sense-read.
//
// Run: node scripts/test-table-witness-20261011.js   (SEED env override)
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
  Game.progState().ledger = { might: 2, brokerage: 2, showmanship: 1, embrace: 0, defiance: 1, exposed: 4, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 5, killed: 1, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
}
function darkLedger() {
  Game.progState().ledger = { might: 3, brokerage: 1, showmanship: 1, embrace: 0, defiance: 1, exposed: 5, unified: 0, fractured: 1, foodShared: 0, foodHoarded: 1, protected: 1, killed: 7, betrayed: 1 };
  Game.state.village.promises = { v1: { kept: 'broken', favorId: 'f1' } };
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  lesserSeat(); lightLedger();

  console.log('— prereq: keep the list —');
  Game.progState().ledger.exposed = 1;
  let p = Game.tableEarnedPaths().find(x => x.id === 'witness');
  ok(p && !p.earned, 'thin list: witness not earned', p && p.why);
  Game.progState().ledger.exposed = 4;
  p = Game.tableEarnedPaths().find(x => x.id === 'witness');
  ok(p && p.earned, '4 exposures: earned', p && (p.strength + ' — ' + p.why));

  console.log('— light run: the trial —');
  resetAll();
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  ok(T().branch === 'light', 'light branch');
  ok(T().meters.swing === 3, 'docket + clean-hands: swing starts at 3', 'swing=' + T().meters.swing);
  ok(tc().prompt.indexOf('4 exposures') >= 0, 'opening names the REAL exposure count');
  Game.chooseTableOption('beat:cold'); // +2 -> 5
  // The defense: villagers testify in their own words.
  ok(tc().prompt.indexOf('sworn:') >= 0, 'villagers testify about your leadership');
  ok(tc().options.some(o => o.id === 'beat:subpoena'), 'subpoena offered once');
  Game.chooseTableOption('beat:subpoena'); // +1, once — advances to the twist
  ok(T().beat === 2, 'subpoena advances past the defense');
  ok(tc().options.some(o => o.id === 'beat:public'), 'light twist: refuse the settlement');
  Game.chooseTableOption('beat:public');
  ok(T().phase === 'finals', 'finals reached');
  Game.chooseTableOption('final:charges');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('new precedent') >= 0), 'light witness resolves');

  console.log('— dark run: the chant —');
  resetAll(); lesserSeat(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  ok(T().branch === 'dark', 'dark branch');
  Game.chooseTableOption('beat:names');
  // Defense on a bloody ledger: honest testimony hurts.
  Game.chooseTableOption('beat:let'); // killed>protected: -2
  ok(T().meters.swing < 6, 'bloody ledger: your own witnesses hurt', 'swing=' + T().meters.swing);
  ok(tc().options.some(o => o.id === 'beat:blood'), 'dark twist: give them blood');
  Game.chooseTableOption('beat:blood');
  Game.chooseTableOption('final:gavel');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('show trials end') >= 0), 'dark witness resolves');

  console.log('— failure: your record convicts you —');
  resetAll(); lesserSeat(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  ok(T().branch === 'dark', 'dark branch: dirty record', 'branch=' + T().branch);
  ok(T().meters.swing === 3, 'docket + gavel: swing starts at 3', 'swing=' + T().meters.swing);
  // The honest conviction (2026-10-11): hold a charge back, then try to
  // silence your own witnesses on a dirty record — no rigged meters needed.
  Game.chooseTableOption('beat:reserve'); // +0 -> 3
  Game.chooseTableOption('beat:silence'); // dark: -4 -> -1 -> convicted mid-trial
  ok(T().phase === 'downgrade', 'convicted by your own record -> downgrade');
  ok(transcript.some(([k, t]) => t.indexOf('convicted you mid-trial') >= 0), 'failure said aloud');
  Game.chooseTableOption('downgrade:testbeta');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won, 'weakened path resolves');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
