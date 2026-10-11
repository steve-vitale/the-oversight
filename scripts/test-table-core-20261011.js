#!/usr/bin/env node
// Table core proof test (2026-10-11): seat pricing, earned paths, light/dark
// axis, grounding tiers + food-conversion weakening, the challenge runner
// (beats -> finals -> resolve), and failure downgrades (never a wipe).
// Sense-read: every say/sysSay line prints for the transcript review.
//
// Run: node scripts/test-table-core-20261011.js   (SEED env override)
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
Game.wipe = function () { transcript.push(['sys', '(wipe called — run ends here)']); };
Game.save = function () {};

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

// Two synthetic paths so failure downgrades have somewhere to go.
Game.tableRegisterPath({
  id: 'testalpha', name: 'the Test Alpha', minSeat: 'lesser', showGenre: 'test', showLive: 'TEST ALPHA LIVE',
  openLine: 'The test begins.',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 60, why: 'Test earned.' }; },
  beats: [
    { say: ['Beat one: the ring steadies.'], choices: [
      { id: 'a', label: 'Choose A (terror +2)', effects: { terror: 2 }, say: ['You chose A.'] },
      { id: 'b', label: 'Choose B (fail)', effects: { fail: 'the test failed on purpose' } },
    ]},
    { say: ['Beat two: the faces lean in.'], meterLine: (T) => 'terror: ' + ((T.meters || {}).terror | 0), choices: [
      { id: 'c', label: 'Choose C', effects: {} },
    ]},
  ],
  finals: {
    light: [{ id: 'x', label: 'Finish X (light)', outcome: ['The light finish.'] }],
    dark: [{ id: 'y', label: 'Finish Y (dark)', outcome: ['The dark finish.'] }],
  },
  failure: { beat: 'custom', offerLine: 'Custom smaller doors.' },
});
Game.tableRegisterPath({
  id: 'testbeta', name: 'the Test Beta', minSeat: 'lesser', showGenre: 'test', showLive: 'TEST BETA LIVE',
  openLine: 'The second test begins.',
  prereq(seat) { return seat.seat === 'none' ? { earned: false, strength: 0, why: 'No seat.' } : { earned: true, strength: 40, why: 'Test earned weakly.' }; },
  beats: [ { say: ['Beta beat.'], choices: [{ id: 'ok', label: 'OK', effects: {} }] } ],
  finals: { light: [{ id: 'z', label: 'Finish Z', outcome: ['Beta done.'] }] },
});

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  console.log('— seat pricing —');
  resetTable();
  ok(Game.tableSeat().seat === 'none', 'fresh run: no seat');
  // Lesser seat.
  Game.state.systemArrived = true; Game.state.scholar.integration = 50;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true; Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  mkDeeds([[1, 4], [2, 4], [3, 3]], 2, 2);
  let seat = Game.tableSeat();
  ok(seat.seat === 'lesser', 'lesser seat priced', JSON.stringify(seat.detail));
  // Full seat.
  Game.state.nationalLive = true;
  Game.state.scholar.integration = 85;
  mkDeeds([[1, 5], [2, 5], [3, 4], [4, 3], [5, 2]], 3, 3);
  seat = Game.tableSeat();
  ok(seat.seat === 'full', 'full seat priced', JSON.stringify(seat.detail));
  // Back to lesser for the path tests.
  Game.state.nationalLive = false; Game.state.scholar.integration = 50;
  mkDeeds([[1, 4], [2, 4], [3, 3]], 2, 2);

  console.log('— branch axis —');
  Game.progState().ledger = { might: 5, brokerage: 2, showmanship: 1, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 3, foodHoarded: 0, protected: 5, killed: 1, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
  let br = Game.tableBranch('testalpha');
  ok(br.branch === 'light', 'light read from behavior', br.notes.join('; '));
  Game.progState().ledger.killed = 12; Game.progState().ledger.betrayed = 1;
  Game.state.village.promises = { v1: { kept: 'broken', favorId: 'f1' } };
  br = Game.tableBranch('testalpha');
  ok(br.branch === 'dark', 'dark read from behavior', br.notes.join('; '));
  // Reset to light for the challenge run.
  Game.progState().ledger = { might: 5, brokerage: 2, showmanship: 1, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 3, foodHoarded: 0, protected: 5, killed: 1, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };

  console.log('— grounding —');
  Game.state.scholar.grounding = 100;
  ok(Game.groundingTier() === 'grounded' && Game.groundingMult() === 1, 'grounded: full conversions');
  Game.addGrounding(-30, 'test');
  ok(Game.groundingTier() === 'fraying' && Game.groundingMult() === 0.9, 'fraying: x0.9', 'tier=' + Game.groundingTier());
  ok(transcript.some(([k, t]) => t.indexOf('half-step of distance') >= 0), 'fraying fires villager reaction beat');
  Game.addGrounding(-30, 'test');
  ok(Game.groundingTier() === 'estranged' && Game.groundingMult() === 0.75, 'estranged: x0.75');
  Game.addGrounding(-30, 'test');
  ok(Game.groundingTier() === 'hollow' && Game.groundingMult() === 0.6, 'hollow: x0.6');
  ok(transcript.some(([k, t]) => t.indexOf('grieve you while') >= 0), 'hollow fires grief-while-alive beat');
  // Food conversion weakening through feastedMult.
  Game.state.scholar.feastBuff = { mult: 1.5, untilDay: 9999, untilPart: 0 };
  Game.state.scholar.day = 1; Game.dayPart = 0;
  const fm = Game.feastedMult();
  ok(Math.abs(fm - 0.9) < 0.001, 'feastedMult weakened by grounding', 'got ' + fm);
  const fl = Game.feastedLine();
  ok(fl.indexOf('hollow') >= 0 && fl.indexOf('0.9') >= 0, 'feastedLine telegraphs honestly', fl.slice(0, 120));
  // Restoration.
  Game.addGrounding(50, 'test');
  ok(Game.groundingTier() === 'fraying', 'human verbs climb back', 'tier=' + Game.groundingTier());
  Game.state.scholar.grounding = 100;

  console.log('— table scene: audit + path selection —');
  resetTable();
  // Isolate: zero the ledger so only the synthetic test paths are earned.
  Game.progState().ledger = { might: 0, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 0, foodShared: 0, foodHoarded: 0, protected: 0, killed: 0, betrayed: 0 };
  Game.tableScene();
  let tc = Game.state.scholar.tableChoices;
  ok(!!tc && tc.options.length === 2, 'two earned test paths offered', 'options=' + (tc && tc.options.length));
  ok(transcript.some(([k, t]) => t.indexOf('lesser seat') >= 0), 'audit prices the lesser seat aloud');
  ok(Game.progState().tableDone === true, 'tableDone set — the table fires once');

  console.log('— challenge run: beats -> finals -> resolve —');
  Game.chooseTableOption('path:testalpha');
  tc = Game.state.scholar.tableChoices;
  ok(Game.tableState().phase === 'challenge' && tc.options[0].id === 'beat:a', 'beat 0 rendered');
  Game.chooseTableOption('beat:a');
  ok(Game.tableState().meters.terror === 2, 'meter effect applied');
  tc = Game.state.scholar.tableChoices;
  ok(tc.prompt.indexOf('terror: 2') >= 0, 'meter line rendered honestly');
  Game.chooseTableOption('beat:c');
  ok(Game.tableState().phase === 'finals', 'finals phase reached');
  tc = Game.state.scholar.tableChoices;
  ok(tc.options[0].id === 'final:x', 'light final offered (branch=light)');
  Game.chooseTableOption('final:x');
  ok(Game.won === true && Game.tableState().phase === 'done', 'run resolves won — story ends, not wiped mid-run');
  ok(transcript.some(([k, t]) => t.indexOf('(wipe called') >= 0), 'wipe called at honest run end');

  console.log('— failure downgrade —');
  resetTable();
  Game.tableScene();
  Game.chooseTableOption('path:testalpha');
  Game.chooseTableOption('beat:b'); // fail on purpose
  ok(Game.tableState().phase === 'downgrade', 'failure -> downgrade phase, never a wipe');
  ok(Game.over !== true, 'run NOT over after failure');
  tc = Game.state.scholar.tableChoices;
  ok(tc && tc.options.length === 1 && tc.options[0].id === 'downgrade:testbeta', 'remaining earned path offered weakened');
  ok(tc.prompt.indexOf('smaller doors') >= 0, 'downgrade priced honestly');
  Game.chooseTableOption('downgrade:testbeta');
  ok(Game.tableState().path === 'testbeta' && Game.tableState().phase === 'challenge', 'downgrade pick starts weakened path');
  Game.chooseTableOption('beat:ok');
  Game.chooseTableOption('final:z');
  ok(Game.won === true, 'weakened path still resolves to a real ending');

  console.log('— theme hook —');
  resetTable();
  Game.tableScene();
  Game.chooseTableOption('path:testalpha');
  const theme = Game.tableTheme();
  ok(theme.key === 'none' && theme.path === 'testalpha' && theme.groundingTier === 'grounded', 'theme hook exposes path/branch/stage/grounding', JSON.stringify(theme));

  console.log('\n=== SENSE-READ TRANSCRIPT (all table dialogue) ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
