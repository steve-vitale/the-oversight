#!/usr/bin/env node
// test-contest-gaps-20261011.js — Steve 2026-10-11 "Address any gaps!"
// Gap 1: ~13% of seeds miss the day 14-21 contest pilot window (pilot is the
//   diegetic on-ramp; canon: contests are UNAVOIDABLE).
// Gap 2: prize lanes (ability/synergy/knowledge) rarely visible in-leg
//   (~0.5/leg) — wins are the throttle, but the first win should SHOW a lane.
// Harness: full src/js list in index.html order (minus DOM-only), mulberry32
// seeded BEFORE eval. Never stub Game.save.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const { execSync } = require('child_process');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"]*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  const lines = [];
  Game.say = function (t) { lines.push(t); };
  Game.sysSay = function (t) { lines.push(t); };
  Game.audioEvent = function () {};
  if (Game.drama === undefined) Game.drama = function () {};
  await Game.init();

  const realRandom = Math.random;
  function seatVillagers() {
    const v = Game.state.village;
    v.positions = v.positions || {};
    (v.roster || []).forEach((rid, i) => {
      try { Game.npcSetNode(rid, Game.map.px, Game.map.py); } catch (e) {}
      v.positions[rid] = { mx: 1 + (i % 7), my: 1 + (Math.floor(i / 7) % 7) };
    });
  }
  function freshEstablished() {
    for (let attempt = 0; attempt < 8; attempt++) {
      Game.genRoster('Columbus, Ohio');
      Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
      Game.depart();
      seatVillagers();
      const { eligible } = Game.contestEligible();
      if (eligible.length >= 3) break;
    }
    Game.state.systemArrived = true;
    Game.state.pilotAired = false;
    Game.state.pendingContest = null;
    Game.state.activeContest = null;
    Game.state.showBudget = { week: 3, used: 0 };
    const s = Game.state.scholar;
    s.abilities = []; s.abilityChoices = null; s.synergies = []; s.synergyAttempts = {};
    delete Game.state.cxFirstWinGift;
    lines.length = 0;
  }
  function contestIds() { return new Set(Game.contestPool().map(c => c.id)); }

  // ---------- Gap 1a: pilot guarantee, hostile RNG ----------
  console.log('Gap1a: pilot forced at day 21 under hostile RNG');
  freshEstablished();
  Game.state.scholar.day = 21;
  Math.random = () => 0.99; // every chance roll fails
  let ev = null;
  try { ev = Game.contestTick(); } finally { Math.random = realRandom; }
  const ids = contestIds();
  ok(ev && ev.id && ids.has(ev.id), 'day-21 tick forces a CONTEST event under hostile RNG', ev && ev.id);

  // ---------- Gap 1b: pilot coverage across seeds, days 14-21 ----------
  console.log('Gap1b: pilot coverage, 40 seeds, days 14-21');
  let pilotBy21 = 0;
  const SEEDS = 40;
  for (let si = 0; si < SEEDS; si++) {
    Math.random = mulberry32(9000 + si);
    freshEstablished();
    let fired = false;
    for (let d = 14; d <= 21 && !fired; d++) {
      Game.state.scholar.day = d;
      Game.state.pendingContest = null;
      Game.state.activeContest = null;
      Game.state.showBudget = { week: Math.floor(d / 7), used: 0 };
      const e2 = Game.contestTick();
      if (e2 && e2.id && ids.has(e2.id)) { Game.fireContest(e2); fired = true; }
    }
    if (Game.state.pilotAired) pilotBy21++;
  }
  Math.random = realRandom;
  console.log('  pilot by day 21: ' + pilotBy21 + '/' + SEEDS);
  ok(pilotBy21 >= SEEDS - 1, 'pilot airs by day 21 on ~all seeds (>=39/40)', pilotBy21 + '/' + SEEDS);

  // ---------- Gap 2a: first win always brings a System gift ----------
  console.log('Gap2a: first-win gift under hostile RNG');
  freshEstablished();
  Math.random = () => 0.99; // the 0.60 lane roll would fail
  let granted = false;
  try { granted = Game._cxPrizeLane({ variant: null }, { id: 'pit', cat: 'blood', risk: 'high' }); }
  finally { Math.random = realRandom; }
  ok(granted === true, 'first win of the run grants a System lane gift even when the roll fails');

  // ---------- Gap 2b: not a fountain — later wins keep the roll ----------
  console.log('Gap2b: second win still rolls (no fountain)');
  Math.random = () => 0.99;
  let granted2 = false;
  try { granted2 = Game._cxPrizeLane({ variant: null }, { id: 'pit', cat: 'blood', risk: 'high' }); }
  finally { Math.random = realRandom; }
  ok(granted2 === false, 'second win with a failed roll grants nothing (0.60 roll intact)');

  // ---------- Gap 2c: visibility measurement, 40 seeds x one win ----------
  console.log('Gap2c: lane visibility per single win, 40 seeds (natural RNG)');
  let seen = 0;
  for (let si = 0; si < SEEDS; si++) {
    Math.random = mulberry32(40000 + si);
    freshEstablished();
    if (Game._cxPrizeLane({ variant: null }, { id: 'pit', cat: 'blood', risk: 'high' })) seen++;
  }
  Math.random = realRandom;
  console.log('  wins that showed a lane: ' + seen + '/' + SEEDS);
  ok(seen === SEEDS, 'every first win shows a lane (40/40)', seen + '/' + SEEDS);

  // ---------- Sense: the pilot must feel like an event ----------
  console.log('Sense: pilot announcement text');
  freshEstablished();
  Game.state.scholar.day = 21;
  Math.random = () => 0.5;
  try {
    const e3 = Game.contestTick();
    if (e3 && e3.id) Game.fireContest(e3);
  } finally { Math.random = realRandom; }
  const pilotLines = lines.filter(t => /PILOT|test broadcast|jank/i.test(t));
  console.log('  --- pilot says ---');
  pilotLines.slice(0, 4).forEach(t => console.log('  ' + t.slice(0, 110)));
  console.log('  ------------------');
  ok(pilotLines.length >= 2, 'pilot announces itself out loud (>=2 pilot lines)', pilotLines.length);

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
