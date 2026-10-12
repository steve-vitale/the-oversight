#!/usr/bin/env node
// Feared path proof test (2026-10-11): earned prereq, calibration beats with
// terror/horror tension, ability grants (dreadfield/oathbound/redharvest),
// trial by combat wiring (win/lose/death), branch twists, failure downgrade,
// light/dark finals. Sense-read: full transcript printed.
//
// Run: node scripts/test-table-feared-20261011.js   (SEED env override)
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

const transcript = [];
const _say = Game.say, _sysSay = Game.sysSay;
Game.say = function (t) { transcript.push(['say', String(t).slice(0, 240)]); return _say.call(this, t); };
Game.sysSay = function (t) { transcript.push(['sys', String(t).slice(0, 240)]); return _sysSay.call(this, t); };
Game.wipe = function () { transcript.push(['sys', '(wipe — honest run end)']); };
Game.save = function () {};
// No grid in the harness: the trial's startCombat is stubbed; the resume is
// driven directly (the real fight path is the combat engine's tested domain).
// The stub honors startCombat's contract — a started fight leaves tbfight set
// (2026-10-12: the table's refusal net reads tbfight, so the stub must too).
let trialStarted = null;
Game.startCombat = function (mid) { trialStarted = mid; Game.tbfight = {}; };

function resetAll() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  Game.tbfight = null;
  trialStarted = null;
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
  Game.progState().ledger = { might: 6, brokerage: 1, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 2, foodHoarded: 0, protected: 6, killed: 2, betrayed: 0 };
  Game.state.village.promises = { v1: { kept: true, favorId: 'f1' } };
  Game.state.village.favorLedger = {};
}
function darkLedger() {
  Game.progState().ledger = { might: 8, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 2, foodShared: 0, foodHoarded: 2, protected: 1, killed: 12, betrayed: 1 };
  Game.state.village.promises = { v1: { kept: 'broken', favorId: 'f1' } };
}
const tc = () => Game.state.scholar.tableChoices;
const T = () => Game.tableState();

// A second synthetic path so failure downgrades have somewhere to go.
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
  lesserSeat();

  console.log('— prereq —');
  resetAll(); lightLedger();
  Game.progState().ledger.might = 1; Game.progState().ledger.killed = 1;
  let paths = Game.tableEarnedPaths();
  let feared = paths.find(p => p.id === 'feared');
  ok(feared && !feared.earned, 'feared unearned on a thin ledger', feared && feared.why);
  lightLedger();
  paths = Game.tableEarnedPaths();
  feared = paths.find(p => p.id === 'feared');
  ok(feared && feared.earned && feared.strength > 0, 'feared earned on a fierce ledger', feared && (feared.strength + ' — ' + feared.why));

  console.log('— light run: calibration + abilities —');
  resetAll(); lightLedger();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  ok(T().branch === 'light', 'light branch from behavior');
  ok(T().abils.indexOf('dreadfield') >= 0 && T().abils.indexOf('oathbound') >= 0, 'shared + light abilities granted', T().abils.join(','));
  ok(T().meters.terror === 2, 'dreadfield: terror starts at 2');
  Game.chooseTableOption('beat:kill'); // terror+2, horror+2 (halved by oathbound -> +1)
  ok(T().meters.terror === 4, 'terror builds', 'terror=' + T().meters.terror);
  ok(T().meters.horror === 1, 'oathbound halves horror gains', 'horror=' + T().meters.horror);
  ok(transcript.some(([k, t]) => t.indexOf('Oathbound') >= 0), 'ability grant said aloud');

  console.log('— trial by combat: win —');
  Game.chooseTableOption('beat:trial');
  ok(trialStarted === 'finale', 'trial starts a REAL fight vs the Finale', 'started=' + trialStarted);
  ok(T().trialPending === true && tc() === null, 'modal closed, challenge paused');
  ok(transcript.some(([k, t]) => t.indexOf('TRIAL BY COMBAT') >= 0 && t.indexOf('not a metaphor') >= 0), 'existential risk stated legibly');
  Game.tableTrialResume('won');
  ok(T().meters.terror === 10 && T().beat === 2, 'trial won: terror maxes, calibration skipped');
  ok(transcript.some(([k, t]) => t.indexOf('TRIAL WON') >= 0), 'trial won beat');
  // Branch twist (light): spend the terror.
  Game.chooseTableOption('beat:spend');
  ok(T().phase === 'finals', 'finals reached after twist');
  ok(tc().options.some(o => o.id === 'final:mercy'), 'light finals offered');
  Game.chooseTableOption('final:mercy');
  ok(Game.won === true, 'light feared resolves to a real ending');

  console.log('— trial by combat: loss with death —');
  resetAll(); lightLedger();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  Game.chooseTableOption('beat:kill');
  const bearerBefore = Game.villagerId;
  Game.chooseTableOption('beat:trial');
  // Simulate the mantle passing mid-table (playerDeath's real effect).
  const roster = (Game.data.villagers || []).filter(v => v.id !== bearerBefore);
  if (roster.length) Game.villagerId = roster[0].id;
  Game.tableTrialResume('lost');
  ok(T().weakened === 1, 'loss weakens the village at the table');
  ok(transcript.some(([k, t]) => t.indexOf('mantle passes mid-table') >= 0), 'mantle pass narrated, story continues');
  ok(Game.over !== true, 'run NOT over after trial death — mantle passed');
  Game.villagerId = bearerBefore;

  console.log('— dark run: failure downgrade —');
  resetAll(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  ok(T().branch === 'dark', 'dark branch from behavior');
  ok(T().abils.indexOf('redharvest') >= 0, 'dark ability granted', T().abils.join(','));
  Game.chooseTableOption('beat:kill'); // terror 2+2+4(redharvest)=8, horror 2
  Game.chooseTableOption('beat:lean'); // terror+2=10, horror+2=4 — not failing yet (curdle at 5)
  // The honest curdle (2026-10-11): push fear a third beat without spending
  // it down and the demonstration curdles — no rigged meters needed.
  Game.chooseTableOption('beat:name'); // exemplum: terror+3=13, horror+3=7 >= 5 -> curdle
  ok(T().phase === 'downgrade', 'curdled demonstration -> downgrade, never a wipe');
  ok(Game.over !== true, 'run survives the failed path');
  ok(transcript.some(([k, t]) => t.indexOf('curdled') >= 0), 'failure reason said aloud');

  console.log('— dark finals —');
  resetAll(); darkLedger();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  Game.chooseTableOption('beat:fire');
  Game.chooseTableOption('beat:hold');
  Game.chooseTableOption('beat:name'); // exemplum
  ok(tc().options.some(o => o.id === 'final:tribute'), 'dark finals offered (tribute)');
  Game.chooseTableOption('final:tribute');
  ok(Game.won === true, 'dark feared resolves');
  ok(transcript.some(([k, t]) => t.indexOf('The village does too') >= 0), 'dark ending lands its cost');

  console.log('\n=== SENSE-READ TRANSCRIPT ===');
  const seen = new Set();
  for (const [k, t] of transcript) {
    if (seen.has(t)) continue; seen.add(t);
    console.log((k === 'sys' ? '[SYS] ' : '[SAY] ') + t);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
