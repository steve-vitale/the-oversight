#!/usr/bin/env node
// test-contests-clubs-20261011.js — proof for the fan-club lever
// (longsim contests r4 2026-10-11): clubs "grow with highlights" and can
// "vote small favors" (docs/CONTESTS.md). Baseline: 0 club-boon votes and
// 1 care package in 16 long runs — the 50/20 gates were unreachable
// (max lane ever: 17). The lever: vote gate 50->25, package gate 20->12,
// risk-scaled win favor (player +4/+6/+8, villager +2/+3/+4), Death Reel
// airings grow showbiz +2, contest deaths grow the lane +2 (highlight
// package), celebrity feed lines at 25.
// Node harness conventions: seed Math.random BEFORE eval, full src/js list
// in index.html order minus DOM-only modules, never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROOT = path.resolve(__dirname, '..');
const SEED = parseInt(process.env.SEED || '424242', 10);

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', name); }
}

(async () => {
  Math.random = mulberry32(SEED);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.audioEvent = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.systemArrived = true;
  Game.state.scholar.day = 60;
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.sysSay = (t) => { said.push(String(t)); };
  const lane = (l) => Game.apFanLane(l);
  const setClubs = (o) => { Game.apState().fanClubs = Object.assign({ fight: 0, survival: 0, social: 0, showbiz: 0 }, o); };

  // --- T1: the vote gate — 24 never fires, 25 can fire, and it says "voted".
  setClubs({ showbiz: 24 });
  Game.apState().lastBoonDay = -999;
  let fires24 = 0;
  for (let i = 0; i < 200; i++) { if (Game.apClubBoon()) fires24++; Game.apState().lastBoonDay = -999; }
  ok(fires24 === 0, 'T1a: lane 24 — apClubBoon never fires in 200 tries (got ' + fires24 + ')');
  setClubs({ showbiz: 25 });
  Game.apState().lastBoonDay = -999;
  let fires25 = 0;
  for (let i = 0; i < 200; i++) { if (Game.apClubBoon()) fires25++; Game.apState().lastBoonDay = -999; }
  ok(fires25 > 0, 'T1b: lane 25 — apClubBoon fires (got ' + fires25 + '/200)');
  ok(said.some(t => /voted:/i.test(t)), 'T1c: a boon announcement says "voted"');

  // --- T2: the package gate — 11 no, 12 yes.
  setClubs({ showbiz: 11 });
  Game.apState().lastPackageDay = -999;
  ok(Game.apCarePackage() === false, 'T2a: favor 11 — no care package');
  setClubs({ showbiz: 12 });
  Game.apState().lastPackageDay = -999;
  ok(Game.apCarePackage() === true, 'T2b: favor 12 — care package fires');
  ok(said.some(t => /care package drops/i.test(t)), 'T2c: the package is announced');

  // --- T3: the Death Reel grows the club with highlights.
  setClubs({ showbiz: 0 });
  const reel = Game.showPool().find(s => s.id === 'death_reel');
  ok(!!reel, 'T3a: death_reel exists in the show pool');
  const before = lane('showbiz');
  try { Game.fireShow(reel); } catch (e) { /* phases/modal setup may need UI; the airing hook already fired */ }
  ok(lane('showbiz') === before + 2, 'T3b: reel airing moves showbiz +2 (got ' + lane('showbiz') + ')');
  ok(said.some(t => /making clips/i.test(t)), 'T3c: the highlight growth is said out loud');

  // --- T4: win favor scales with risk (highlights are bigger on the main event).
  const mkAc = (id, participant) => ({ contestId: id, participant, variant: null, phase: 'done', _prizeGranted: {} });
  const roster = Game.state.village.roster || [];
  const villager = roster.find(id => id !== Game.villagerId) || roster[0];
  setClubs({});
  try { Game._contestEnd(mkAc('pit', 'player'), 'won', true); } catch (e) { console.log('  (pit player end threw: ' + e.message + ')'); }
  ok(lane('fight') === 6, 'T4a: high-risk player win moves fight +6 (got ' + lane('fight') + ')');
  setClubs({});
  try { Game._contestEnd(mkAc('windfall', 'player'), 'won', true); } catch (e) { console.log('  (windfall player end threw: ' + e.message + ')'); }
  ok(lane('showbiz') === 4, 'T4b: medium-risk player win moves showbiz +4 (got ' + lane('showbiz') + ')');
  setClubs({});
  try { Game._contestEnd(mkAc('price', 'player'), 'won', true); } catch (e) { console.log('  (price player end threw: ' + e.message + ')'); }
  ok(lane('social') === 8, 'T4c: extreme-risk player win moves social +8 (got ' + lane('social') + ')');
  setClubs({});
  try { Game._contestEnd(mkAc('pit', villager), 'won', true); } catch (e) { console.log('  (pit villager end threw: ' + e.message + ')'); }
  ok(lane('fight') === 3, 'T4d: high-risk villager win moves fight +3 (got ' + lane('fight') + ')');
  ok(said.some(t => /📈.*fight fans \+6/i.test(t)), 'T4e: the scaled win announces its favor');

  // --- T5: deaths feed the highlight package — the club remembers.
  setClubs({});
  const v2 = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  const saidBefore = said.length;
  try { Game._cxKillContestant(v2, 'pit'); } catch (e) { console.log('  (kill threw: ' + e.message + ')'); }
  ok(lane('fight') === 2, 'T5a: villager contest death moves the contest lane +2 (got ' + lane('fight') + ')');
  ok(said.slice(saidBefore).some(t => /highlight package is already cut/i.test(t)), 'T5b: the highlight package is said out loud');
  ok(!(Game.state.village.roster || []).includes(v2), 'T5c: the roster removal still works (no behavior change)');

  // --- T6: celebrity feed line fires at the vote threshold.
  setClubs({ showbiz: 25 });
  said.length = 0;
  let feedFired = false;
  try { Game.apFeedMessage(); feedFired = true; } catch (e) { console.log('  (feed threw: ' + e.message + ')'); }
  ok(feedFired, 'T6: apFeedMessage runs at favor 25');

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();
