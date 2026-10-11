#!/usr/bin/env node
// test-winpath-lesser-invite-20261011.js — win-path lever proof (2026-10-11).
// Proves the binding-constraint fix: the LESSER seat's invitation was dead
// code — tableWaiting was only ever set on the FULL gate (deedGateReady),
// so the designed "reachable bar" (docs/TABLE.md) never fired. After the
// fix, checkArc advances arc 3->4 on the lesser bar and the table comes.
//
// Also proves the epilogue pantheon-beat fix: the old else-if chain made
// "asc.length > 1" unreachable (asc partitions into facAscended+unbacked),
// so the pantheon politics beat TABLE.md promises never fired.
//
// State scaffolding: the gate inputs are built with real feeds where cheap
// (recordDeedFight with REAL monster ids, fireCrisis with real kinds,
// state.networkLive / scholar.integration which the engine itself sets);
// contestsSurvived / sentimentTaught / feastSurgeUsed are set directly and
// documented (their real feeds are _cxCountHeld / teachSentiment / combat
// feast use — the gate logic under test is identical either way).
//
// Run: node scripts/test-winpath-lesser-invite-20261011.js   (SEED override)
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
const SEED = parseInt(process.env.SEED || '424242', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
const loadFails = [];
order.forEach(f => { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { loadFails.push(f + ': ' + e.message); } });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(String(t)); };
Game.sysSay = function (t) { transcript.push(String(t)); };
Game.wipe = function () { transcript.push('(wipe called — run ends here)'); };
Game.save = function () {};

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}

// Build the LESSER bar via real feeds. Returns the seat.
function buildLesserSeat() {
  for (const w of [1, 2, 3]) {
    for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id); // real feed
  }
  Game.deedState().contestsSurvived = 2;                       // scaffold (real feed: _cxCountHeld)
  Game.fireCrisis('breach'); Game.fireCrisis('hunger-winter'); // real feed
  Game.state.networkLive = true;                              // regional (engine-set flag)
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 50;                        // stage 2
  Game.progState().sentimentTaught = true;                    // scaffold (real: teachSentiment)
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;              // scaffold (real: combat feast use)
  Game.state.scholar.day = 90;
  return Game.tableSeat();
}

function resetArc() {
  const pg = Game.progState();
  pg.arc = 3; pg.arcSeen = { 1: true, 2: true, 3: true };
  pg.tableWaiting = false; pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  transcript.length = 0;
  // Scaffold the arc-2/3 prereqs (orthogonal to the 3->4 gate under test):
  // codex breadth >= 12 via the real codex structure, a held contest.
  const cx = (Game.state.codex = Game.state.codex || {});
  cx.plants = cx.plants || {};
  for (let i = 0; i < 14; i++) cx.plants['testplant' + i] = { level: 2 };
  Game.state.contestsHeld = 1;
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (loadFails.length) console.log('  LOAD FAILS: ' + loadFails.join('; '));

  console.log('— lesser-seat bar is met —');
  const seat = buildLesserSeat();
  ok(seat.seat === 'lesser', 'tableSeat() prices the lesser seat', 'got ' + seat.seat);
  ok(Game.deedGateReady().ok === false, 'full gate still NOT met (control)', JSON.stringify(Game.deedGateReady()));

  console.log('— the invitation (the fix) —');
  resetArc();
  Game.checkArc();
  const pg = Game.progState();
  ok(pg.arc === 4, 'checkArc advances arc 3 -> 4 on the lesser bar', 'arc=' + pg.arc);
  ok(pg.tableWaiting === true, 'tableWaiting set on the lesser bar (was dead code)', 'tableWaiting=' + pg.tableWaiting);
  ok(transcript.some(t => /lesser seat, priced for what you built/.test(t)), 'invitation names the lesser seat honestly');
  ok(transcript.some(t => /yours, though unfinished, are undeniable/.test(t)), 'arc-4 beat uses the lesser variant (no wave 4/5 claims)');
  ok(!transcript.some(t => /Mirror Draft/.test(t) && /Producers themselves/.test(t)), 'lesser beat never claims waves 4-5');

  console.log('— the table scene fires the lesser audit —');
  Game.tableScene();
  ok(transcript.some(t => /A lesser seat/.test(t)), 'audit reads the lesser seat aloud');
  ok(!transcript.some(t => /does not come/.test(t)), 'no withdrawal beat on a lesser seat');
  ok(!!Game.state.scholar.tableChoices, 'paths are offered (tableChoices set)');

  console.log('— full-seat control (unchanged behavior) —');
  resetArc();
  Game.state.nationalLive = true;
  // Full gate needs 5/5/4/3/2 DISTINCT faced (lesser build gave 4/4/3/0/0).
  const need = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
  for (const w of [1, 2, 3, 4, 5]) {
    const ids = monstersOfWave(w, need[w]);
    ok(ids.length >= need[w], `roster has ${need[w]}+ distinct wave-${w} monsters`, 'found ' + ids.length);
    for (const id of ids) Game.recordDeedFight(id);
  }
  Game.deedState().contestsSurvived = 3;
  Game.fireCrisis('schism');
  Game.state.scholar.integration = 85; // stage 3
  const seatF = Game.tableSeat();
  ok(seatF.seat === 'full', 'full bar prices the full seat', 'got ' + seatF.seat);
  Game.checkArc();
  ok(Game.progState().arc === 4, 'full seat still reaches arc 4');
  ok(transcript.some(t => /The table is being set\. They are watching/.test(t)), 'full invitation line unchanged');
  ok(transcript.some(t => /the Mirror Draft, the Producers themselves/.test(t)), 'full beat names all five waves');

  console.log('— pantheon beat (was dead code) —');
  transcript.length = 0;
  const vils = (Game.data.villagers || []).filter(v => v && v.id !== Game.villagerId).slice(0, 2);
  ok(vils.length === 2, 'two villagers available', 'found ' + vils.length);
  for (const v of vils) {
    v.abilities = ['a1', 'a2', 'a3'];       // 3 System abilities -> 24
    v.knowledgeBreadth = 20;                // -> 20
    v.traits = { bold: true };              // -> 10  (total 54 >= 45)
  }
  // trust map lives on state.village.trust; set both villagers trusted.
  Game.state.village.trust = {};
  Game.state.village.trust[vils[0].id] = 40;
  Game.state.village.trust[vils[1].id] = 40; // +10 each -> 64
  const s0 = Game.villagerAscensionScore(vils[0].id);
  const s1 = Game.villagerAscensionScore(vils[1].id);
  ok(s0.score >= 45 && s1.score >= 45, 'both villagers clear the ascension bar', s0.score + '/' + s1.score);
  Game.tableFacilitate('teach', vils[0].id); // architect's credit for one
  Game.tableEpilogue({ name: 'the Defiant' }, 'light', { label: 'walk away' });
  const tx = transcript.join('\n');
  ok(/THE ARCHITECT/.test(tx), 'architect beat fires for the facilitated ascension');
  ok(/THE PANTHEON/.test(tx), 'pantheon beat fires when 2+ ascend (was unreachable)');
  // Unbacked pair: outshone + pantheon together.
  transcript.length = 0;
  Game.progState().table = { facilitated: {} };
  Game.tableEpilogue({ name: 'the Defiant' }, 'light', { label: 'walk away' });
  const tx2 = transcript.join('\n');
  ok(/OUTSHONE/.test(tx2), 'outshone beat fires for unbacked ascensions');
  ok(/THE PANTHEON/.test(tx2), 'pantheon beat also fires for the unplanned pair');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
