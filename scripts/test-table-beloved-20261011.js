#!/usr/bin/env node
// Beloved path proof test (2026-10-11): audience prereq (viewership/fan favor),
// three-act variety finale with live audience meter, callback once, standing-o
// floor, light/dark twists, audience-turn failure, branch finals. Sense-read.
//
// Run: node scripts/test-table-beloved-20261011.js   (SEED env override)
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
  Game.progState().ledger = { might: 1, brokerage: 1, showmanship: 6, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 6, killed: 0, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
}
function darkLedger() {
  Game.progState().ledger = { might: 1, brokerage: 0, showmanship: 8, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 1, foodShared: 0, foodHoarded: 1, protected: 1, killed: 2, betrayed: 1 };
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

  console.log('— prereq: needs an audience —');
  Game.state.village.viewership = 0;
  let p = Game.tableEarnedPaths().find(x => x.id === 'beloved');
  ok(p && !p.earned, 'no audience: beloved not earned', p && p.why);
  Game.state.village.viewership = 20;
  p = Game.tableEarnedPaths().find(x => x.id === 'beloved');
  ok(p && p.earned && p.strength > 0, 'viewership 20: earned', p && (p.strength + ' — ' + p.why));

  console.log('— light run: three acts —');
  resetAll();
  Game.tableScene();
  Game.chooseTableOption('path:beloved');
  ok(T().branch === 'light', 'light branch');
  ok(T().abils.indexOf('spotlight') >= 0 && T().abils.indexOf('standing-o') >= 0, 'shared + light abilities');
  ok(T().meters.audience === 2, 'spotlight: audience starts at 2');
  ok(tc().prompt.indexOf('ACT ONE') >= 0, 'act one in the modal');
  // Cast names are real villagers (not placeholders) — in the act text and choices.
  ok(/Tonight that's \w+, \w+, \w+/.test(tc().prompt) && tc().options.some(o => /'s story/.test(o.label)), 'cast named in the act');
  Game.chooseTableOption('beat:hunter'); // +2 -> 4
  ok(T().meters.audience === 4, 'act one lands', 'aud=' + T().meters.audience);
  Game.chooseTableOption('beat:song'); // +2 -> 6
  ok(tc().options.some(o => o.id === 'beat:quiet'), 'light twist: the quiet ones');
  Game.chooseTableOption('beat:quiet'); // +3 -> 9
  ok(T().meters.audience === 9, 'eulogy act lands big');
  ok(T().phase === 'finals', 'finals reached');
  ok(tc().options.some(o => o.id === 'final:quiet'), 'light finals');
  Game.chooseTableOption('final:quiet');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('what the show was for') >= 0), 'light beloved resolves');

  console.log('— standing-o floor + callback —');
  resetAll(); lesserSeat(); lightLedger();
  Game.state.village.viewership = 20;
  Game.tableScene();
  Game.chooseTableOption('path:beloved');
  ok(tc().options.some(o => o.id === 'beat:callback'), 'callback offered once');
  T().meters.audience = 1;
  Game.chooseTableOption('beat:funny'); // +1 -> 2 (act one)
  Game.chooseTableOption('beat:risk'); // -4 -> -2, floored at 0 by standing-o (act two)
  ok(T().meters.audience === 0, 'standing-o: audience cannot crater below 0', 'aud=' + T().meters.audience);

  console.log('— dark run: audience turns —');
  resetAll(); lesserSeat(); darkLedger();
  Game.state.village.viewership = 20;
  Game.tableScene();
  Game.chooseTableOption('path:beloved');
  ok(T().branch === 'dark', 'dark branch');
  ok(T().abils.indexOf('plant') >= 0, 'dark ability: plant', T().abils.join(','));
  ok(T().meters.audience === 4, 'spotlight + plant: audience starts at 4', 'aud=' + T().meters.audience);
  // The honest turn (2026-10-11): manufactured sincerity (-3) followed by a
  // dead improv (-4) turns the room at -3 — no rigged meters needed.
  Game.chooseTableOption('beat:truth'); // dark: -3 -> 1, the room cools
  ok(T().phase === 'challenge', 'truth alone does not turn the room');
  Game.chooseTableOption('beat:risk'); // -4 -> -3 -> the audience turns
  ok(T().phase === 'downgrade', 'audience turned -> downgrade, never a wipe');
  ok(transcript.some(([k, t]) => t.indexOf('audience turned') >= 0), 'the turn said aloud');
  Game.chooseTableOption('downgrade:testbeta');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won, 'weakened path resolves');

  console.log('— dark finals —');
  resetAll(); lesserSeat(); darkLedger();
  Game.state.village.viewership = 20;
  Game.tableScene();
  Game.chooseTableOption('path:beloved');
  Game.chooseTableOption('beat:hunter');
  Game.chooseTableOption('beat:song');
  Game.chooseTableOption('beat:raw');
  ok(tc().options.some(o => o.id === 'final:contract'), 'dark finals: the network contract');
  Game.chooseTableOption('final:contract');
  ok(Game.won && transcript.some(([k, t]) => t.indexOf('most-watched cage') >= 0), 'dark ending lands');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
