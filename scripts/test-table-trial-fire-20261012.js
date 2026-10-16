#!/usr/bin/env node
// test-table-trial-fire-20261012.js — trial-by-combat fire proof (journey-endgame r4).
// BLANK (found in sweep transcripts): choosing "Demand the champion" at the
// table STRANDED the challenge — the finale campaign's gate in titans.js
// refuses with a SAY + return null (no throw), which the old tableTrialByCombat
// never caught: tableChoices=null, no fight, trialPending stuck forever, no
// options. The opt-in existential risk was UNFIREABLE for any realistic run.
// FIX: the table summons the champion directly (finale-campaign gates don't
// apply when the table issues the challenge — a single blow-by-blow fight);
// belt-and-suspenders: if no fight begins, the refusal is said aloud, the
// trial door is withdrawn for this walk, and the beat re-runs — never stranded.
// RED/GREEN: RED = the pre-fix code path (startCombat with no bypass) strands;
// GREEN = the fixed path fires a real fight and resumes correctly.
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
Math.random = mulberry32(12012);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// (2026-10-16) load the FULL index.html script list per the AGENTS.md harness
// standard -- head -80 went stale when shelter.js landed, pushing table-feared.js
// to #81 and hiding Game.tableTrialResume from this harness.
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html ", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(String(t)); };
Game.sysSay = function (t) { transcript.push('SYS:' + String(t)); };
Game.save = function () {};
Game.wipe = function () {};

const T = () => Game.tableState();
const tc = () => Game.state.scholar.tableChoices;

function monstersOfWave(w, n) {
  return (Game.data.monsters || []).filter(m => (m.wave || 1) === w).slice(0, n).map(m => m.id);
}
function afterScene() {
  // Dark ledgers open the pods conscript beat before the challenge proper.
  const T = Game.tableState();
  if (T.phase === 'conscript') Game.chooseTableOption('conscript:no');
}
function setup() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 140;
  Game.state.systemArrived = true;
  Game.state.scholar.integration = 55;
  for (const [k, v] of Object.entries({ might: 9, protected: 1, killed: 12, betrayed: 2, promisesBroken: 3, defiance: 6 })) {
    try { Game.ledgerAdd(k, v); } catch (e) {}
  }
  for (const w of [1, 2, 3]) for (const id of monstersOfWave(w, w === 3 ? 3 : 4)) Game.recordDeedFight(id);
  Game.deedState().contestsSurvived = 2;
  Game.fireCrisis('breach'); Game.fireCrisis('first-grave');
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {};
  Game.state.scholar.prog.feastSurgeUsed = true;
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null;
  Game.state.scholar.tableChoices = null;
  Game.over = false; Game.won = false;
  Game.tbfight = null;
}

(async () => {
  await Game.init();
  const realStartCombat = Game.startCombat;

  console.log('— 1. RED: the pre-fix path strands (gate refusal is silent) —');
  setup();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  afterScene();
  ok(T().phase === 'challenge' && T().beat === 0, 'feared walk open at beat 0');
  Game.chooseTableOption('beat:kill'); // advance to beat 1
  // Simulate EXACTLY what the old tableTrialByCombat did: set pending, close
  // the modal, call startCombat with no bypass. The titans gate answers with
  // a say + return null — no throw.
  T().trialPending = true;
  Game.state.scholar.tableChoices = null;
  const r = Game.startCombat('finale');
  const stranded = (r === null || r === undefined) && !Game.tbfight && Game.state.scholar.tableChoices === null && T().trialPending === true;
  ok(stranded, 'gate refusal (no bypass) strands the old path: no throw, no fight, trialPending stuck, no options', 'returned=' + r);
  Game.tbfight = null; T().trialPending = false;

  console.log('— 2. GREEN: the fixed trial fires a real fight —');
  setup();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  afterScene();
  Game.chooseTableOption('beat:kill');
  transcript.length = 0;
  Game.chooseTableOption('beat:trial');
  ok(!!Game.tbfight, 'trial fired: a REAL fight began (tbfight set)');
  ok(T().trialPending === true, 'challenge paused with trial pending');
  const fighters = (Game.tbfight && Game.tbfight.fighters) || [];
  ok(fighters.some(f => f.monsterId === 'finale'), 'the champion is in the ring: the Finale itself', fighters.map(f => f.key + ':' + (f.monsterId || f.kind)).join(',').slice(0, 120));
  ok(transcript.some(t => t.indexOf('not a metaphor') >= 0), 'existential risk stated legibly');

  console.log('— 3. GREEN: trial resumes — win —');
  Game.tableTrialResume('won');
  ok(T().meters.terror === 10 && T().beat === 2, 'trial won: terror maxes, beat advances', `terror=${T().meters.terror} beat=${T().beat}`);
  ok(transcript.some(t => t.indexOf('TRIAL WON') >= 0), 'trial won beat said aloud');
  ok(T().phase === 'challenge' && tc() && (tc().options || []).length > 0, 'challenge resumes with options');

  console.log('— 4. GREEN: trial resumes — loss with death —');
  setup();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  afterScene();
  Game.chooseTableOption('beat:kill');
  const bearerBefore = Game.villagerId;
  Game.chooseTableOption('beat:trial');
  ok(!!Game.tbfight, 'second trial also fires');
  // Simulate the mantle passing mid-table (playerDeath's real effect).
  const roster = (Game.data.villagers || []).filter(v => v.id !== bearerBefore);
  if (roster.length) Game.villagerId = roster[0].id;
  Game.tbfight = null;
  Game.tableTrialResume('lost');
  ok(T().weakened === 1, 'loss weakens the village at the table');
  ok(transcript.some(t => t.indexOf('mantle passes mid-table') >= 0), 'mantle pass narrated — story continues, not game over');
  ok(Game.over !== true, 'run NOT over after trial death');
  Game.villagerId = bearerBefore;

  console.log('— 5. GREEN: silent refusal is said aloud, door withdrawn, beat re-runs —');
  setup();
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  afterScene();
  Game.chooseTableOption('beat:kill');
  // Force the silent-refusal shape: startCombat says its line, returns null.
  Game.startCombat = function () { Game.say('gate refusal (simulated)'); return null; };
  transcript.length = 0;
  Game.chooseTableOption('beat:trial');
  ok(T().trialRefused === true && T().trialPending !== true, 'refusal: trialRefused set, pending cleared');
  ok(tc() && (tc().options || []).length > 0, 'beat re-ran with options');
  ok(!(tc().options || []).some(o => o.id === 'beat:trial'), 'the trial door is withdrawn — not offered again');
  ok(transcript.some(t => t.indexOf('withdraws the trial') >= 0), 'refusal said aloud, honestly');
  // The challenge continues: lean still works.
  Game.startCombat = realStartCombat;
  const before = T().beat;
  Game.chooseTableOption('beat:lean');
  ok(T().beat === before + 1 || T().phase === 'finals', 'challenge continues after refusal');
  Game.startCombat = realStartCombat;

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
