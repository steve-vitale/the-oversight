#!/usr/bin/env node
// test-winpath-crisis-kinds-20261011.js — win-path lever 10 proof (2026-10-11).
// Proves THE SIEGE: the new crisis kind for the documented blank "crisis
// sparsity for stable villages." A peaceful-competent run saw ~1 crisis
// kind/180d (first-grave only); Arc III and the lesser seat bar need 2.
// Measured on identical seeds (scripts/census-crisis-candidates-20261011.js):
//   - 'the-siege' hook condition (raid crisis resolved 'fought'): 29/32 runs
//   - 'the-fever' hook condition (villager sickness death): 1/32 runs —
//     REJECTED as a crisis kind (would be decoration); documented, not built.
// The hook: comms.js resolveAidCrisis('fought') fires 'the-siege' when the
// resolved aid crisis is a raid (crisis.raiders, set by havenRaidTick).
// Once per run (fireCrisis dedupes). Bars unchanged (crises>=2 stays).
//
// RED→GREEN: PRE_FIX=1 evals the HEAD (pre-fix) copies of comms.js and
// progression.js — the hook and beat are absent there, so the fix assertions
// fail (RED). Without it they pass (GREEN).
//
// Run: node scripts/test-winpath-crisis-kinds-20261011.js
//      PRE_FIX=1 node scripts/test-winpath-crisis-kinds-20261011.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const PRE_FIX = process.env.PRE_FIX === '1';

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
function srcOf(f) {
  if (PRE_FIX && (f === 'src/js/comms.js' || f === 'src/js/progression.js')) {
    return execSync(`git show HEAD:${f}`, { cwd: ROOT }).toString(); // pre-fix
  }
  return fs.readFileSync(path.join(ROOT, f), 'utf8');
}
order.forEach(f => { try { eval(srcOf(f)); } catch (e) { loadFails.push(f + ': ' + e.message); } });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

const transcript = [];
Game.say = function (t) { transcript.push(String(t)); };
Game.sysSay = function (t) { transcript.push(String(t)); };
Game.wipe = function () { transcript.push('(wipe called — run ends here)'); };
Game.save = function () {};

function raiseAidCrisis(raiders) {
  Game.state.aidCrisis = {
    kind: 'monster', name: 'raiders at the door', wave: 1,
    sinceDay: (Game.state.scholar || {}).day || 1, sincePart: 0,
    calls: [], helpAtDoor: [], attracted: 0, resolved: false,
  };
  if (raiders) Game.state.aidCrisis.raiders = true;
}
function resetCrises() {
  Game.progState().crises = {};
  transcript.length = 0;
}
function siegeInTranscript() { return transcript.some(t => /THE SIEGE/.test(t)); }

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  if (loadFails.length) console.log('  LOAD FAILS: ' + loadFails.join('; '));

  if (PRE_FIX) {
    console.log('— RED check on pre-fix code (HEAD) —');
    resetCrises();
    raiseAidCrisis(true);
    Game.resolveAidCrisis('fought');
    const pg = Game.progState();
    const redHook = !pg.crises['the-siege'];
    const redBeat = !siegeInTranscript();
    ok(redHook && redBeat, 'pre-fix: raid resolved fought fires NO siege crisis', 'crises=' + JSON.stringify(pg.crises));
    console.log(`\n${pass} passed, ${fail} failed (PRE_FIX — failures here would mean the fix is already present)`);
    process.exit(fail ? 1 : 0);
  }

  console.log('— the beat reads —');
  resetCrises();
  Game.fireCrisis('the-siege');
  const pg0 = Game.progState();
  ok(pg0.crises['the-siege'] === true, 'fireCrisis records the-siege in pg.crises');
  ok(siegeInTranscript(), 'the siege beat is said aloud');
  const line = transcript.find(t => /THE SIEGE/.test(t)) || '';
  ok(/pantry/.test(line) && /drove them back into the dark/.test(line), 'beat line: pantry + driven off (wealth drew teeth, teeth answered)', line.slice(0, 80));
  ok(!/waves? [1-5]|wave one|Final Draft|Producers/i.test(line), 'no wave claims in the beat');
  // no invented people: the line names nobody from the roster
  const rosterNames = (Game.data.villagers || []).map(v => String(v.name || '').split(' ')[0]).filter(Boolean);
  ok(!rosterNames.some(n => n.length > 2 && line.includes(n)), 'no roster names in the beat (invented no people)');
  Game.state.systemArrived = true;
  transcript.length = 0;
  Game.progState().crises = {};
  Game.fireCrisis('the-siege');
  ok(transcript.some(t => /SYSTEM:.*defensive liability/.test(t)), 'System line fires after arrival, in voice');

  console.log('— the hook: raid crisis resolved fought —');
  resetCrises();
  raiseAidCrisis(true);
  Game.resolveAidCrisis('fought');
  ok(Game.progState().crises['the-siege'] === true, 'raid+fought records the-siege');
  ok(siegeInTranscript(), 'raid+fought says the siege beat');

  console.log('— exactly once per run —');
  const before = transcript.filter(t => /THE SIEGE/.test(t)).length;
  raiseAidCrisis(true); // a second raid later in the run
  Game.resolveAidCrisis('fought');
  const after = transcript.filter(t => /THE SIEGE/.test(t)).length;
  ok(after === before, 'second raid does not re-fire the beat', `${before} -> ${after}`);
  ok(Object.keys(Game.progState().crises).filter(k => k === 'the-siege').length === 1, 'pg.crises holds one the-siege entry');

  console.log('— gates: non-raid aid crises do not qualify —');
  resetCrises();
  raiseAidCrisis(false); // generic monster-at-the-door, no raiders flag
  Game.resolveAidCrisis('fought');
  ok(!Game.progState().crises['the-siege'], 'non-raid crisis resolved fought fires no siege');
  resetCrises();
  raiseAidCrisis(true);
  Game.resolveAidCrisis('moved-on'); // raiders drifted off — weathered, not driven off
  ok(!Game.progState().crises['the-siege'], 'raid resolved moved-on fires no siege (only fought)');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
