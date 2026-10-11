#!/usr/bin/env node
// test-journey-endgame-table-sense-20261011.js — endgame-leg sense fixes proof (2026-10-11).
// Proves the blanks found by the sense walkthrough:
//  1. Witness testimony is person-specific and never repeats across the two
//     witnesses (was: identical line x2).
//  2. Relay unlocks respect the table branch mid-challenge (was: dark run's
//     deepens granted light-unique Sanctuary/Advocate).
//  3. sysBond level 5 has a name ("kin", was: flat "here").
//  4. tableChoose never mutates the path def's shared effect objects
//     (was: oathbound permanently rewrote kill's horror 2->1 across walks).
//  5. Path-door grants don't re-announce already-held relay abilities.
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
Math.random = mulberry32(777);
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
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
Game.startCombat = function () {};

function resetAll() {
  const pg = Game.progState();
  pg.tableDone = false; pg.table = null; pg.sysBond = 0;
  Game.state.scholar.tableChoices = null;
  Game.state.scholar.grounding = 100;
  Game.state.scholar.relayAbils = null;
  Game.state.scholar.relay = null;
  Game.state.switchboard = null;
  Game.over = false; Game.won = false;
}
function lesserSeat(ledger) {
  Game.state.systemArrived = true; Game.state.scholar.integration = 55;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
  Game.progState().ledger = ledger;
  Game.state.village.trust = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 3) % 30; });
  Game.state.village.viewership = 20;
}
const T = () => Game.tableState();

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  console.log('— 1. witness testimony: person-specific, never repeated —');
  resetAll();
  lesserSeat({ might: 4, brokerage: 2, showmanship: 8, embrace: 0, defiance: 0, exposed: 4, unified: 3, fractured: 0, foodShared: 6, foodHoarded: 0, protected: 7, killed: 2, betrayed: 0 });
  Game.state.village.dead = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  if (roster[5]) Game.state.village.dead[roster[5]] = { cause: 'combat', day: 40 };
  Game.tableScene();
  Game.chooseTableOption('path:witness');
  Game.chooseTableOption('beat:cold');
  const prompt = Game.state.scholar.tableChoices.prompt || '';
  const sworn = (prompt.match(/sworn:/g) || []).length;
  ok(sworn === 2, 'two villagers take the stand', 'sworn count=' + sworn);
  // Extract the two testimony lines; they must differ.
  const lines = prompt.split(/sworn:/).slice(1).map(s => s.split('<')[0].trim());
  ok(lines.length === 2 && lines[0] !== lines[1], 'witnesses never testify verbatim identically', lines.join(' || ').slice(0, 160));
  ok(lines.every(l => l.length > 20), 'testimony has substance', lines[0].slice(0, 80));

  console.log('— 2. relay unlocks respect the table branch —');
  resetAll();
  lesserSeat({ might: 8, brokerage: 1, showmanship: 6, embrace: 1, defiance: 2, exposed: 5, unified: 0, fractured: 2, foodShared: 1, foodHoarded: 4, protected: 1, killed: 12, betrayed: 1 });
  Game.state.scholar.relayAbils = { rewriteUses: 3, skimUses: 2 };
  Game.claimRelay();
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  ok(T().branch === 'dark', 'dark branch', 'branch=' + T().branch);
  const before = Object.keys(Game.state.scholar.relayAbils || {}).filter(k => !/Uses$/.test(k));
  Game.chooseTableOption('beat:deepen'); // bond rises; must NOT grant sanctuary/advocate/translate
  const has = (id) => !!((Game.state.scholar.relayAbils || {})[id]);
  ok(!has('sanctuary') && !has('advocate') && !has('translate'), 'dark challenge: no light-unique unlocks from verbs', 'abilities=' + before.join(','));
  ok(has('rewrite') && has('skim') && has('omnipresence'), 'dark door grants intact', 'abilities=' + Object.keys(Game.state.scholar.relayAbils || {}).filter(k => !/Uses$/.test(k)).join(','));

  console.log('— 3. sysBond level 5 named —');
  resetAll();
  const pg = Game.progState(); pg.sysBond = 4;
  transcript.length = 0;
  Game.addSysBond(1, 'test');
  ok(transcript.some(t => t.indexOf('It is kin now') >= 0), 'sixth bond stage named "kin"', transcript.join(' ').slice(0, 120));

  console.log('— 4. tableChoose never corrupts the def —');
  resetAll();
  lesserSeat({ might: 8, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 2, foodShared: 0, foodHoarded: 2, protected: 6, killed: 2, betrayed: 0 });
  Game.tableScene();
  Game.chooseTableOption('path:feared'); // light branch: oathbound halves horror
  ok(T().branch === 'light', 'light branch for the corruption check');
  Game.chooseTableOption('beat:kill'); // horror+2 halved -> +1 (mutates the COPY now)
  const h1 = T().meters.horror;
  // Walk the path AGAIN in a fresh table state — the def must be intact.
  resetAll();
  lesserSeat({ might: 8, brokerage: 0, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 0, fractured: 2, foodShared: 0, foodHoarded: 2, protected: 6, killed: 2, betrayed: 0 });
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  Game.chooseTableOption('beat:kill');
  const h2 = T().meters.horror;
  ok(h1 === 1 && h2 === 1, 'oathbound halves horror identically on repeat walks (def not corrupted)', `h1=${h1} h2=${h2}`);

  console.log('— 5. door grants do not re-announce held abilities —');
  // Direct: claim relay first (holds relay-sight), then start the path.
  // relay-sight is held -> soft; rewrite is NEW -> full announcement.
  // (2026-10-11: the check must run BEFORE the grant, which itself sets
  // unlocked — a check after the grant would always read "held".)
  resetAll();
  lesserSeat({ might: 4, brokerage: 2, showmanship: 0, embrace: 0, defiance: 0, exposed: 0, unified: 2, fractured: 0, foodShared: 3, foodHoarded: 0, protected: 5, killed: 1, betrayed: 0 });
  Game.state.scholar.integration = 85; // stage 3 -> relay earned by depth
  Game.claimRelay();
  Game.relayGrant('relay-sight');
  transcript.length = 0;
  Game.tableScene();
  Game.chooseTableOption('path:relay');
  const sight = transcript.filter(t => t.indexOf('Relay-sight') >= 0);
  ok(sight.length === 1 && sight[0].indexOf('already in your hands') >= 0, 'held ability announced once, softly', sight.join(' | ').slice(0, 100));
  // Light branch door grants translate/sanctuary/advocate — genuinely new here.
  const translate = transcript.filter(t => t.indexOf('Translate:') >= 0);
  ok(translate.length === 1 && translate[0].indexOf('already in your hands') < 0, 'new door ability announces in full', translate.join(' | ').slice(0, 120));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (failures.length) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
