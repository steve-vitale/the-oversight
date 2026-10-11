#!/usr/bin/env node
// test-contest-fear-20261011.js — proof for the contest-fear lever.
// Baseline (2026-10-11, 8x200d competent): 35 contests, 97.1% win, 0 deaths,
// blood 1/35 (~3%), extreme-risk 4/4 won. Contests were decoration.
// The lever (all in src/js/contests.js + one contestEngine.js call site):
//  1. blood_weight: blood contests get 4x scheduling weight at wave 1.
//  2. fear_damage: high/extreme phase damage x1.5 (stacks w/ hardened x1.25),
//     said aloud once per contest; shows/summons keep the no-kill cap.
//  3. death_ledger: state.contestDeathsById fed by _contestDie (player) and
//     _cxKillContestant(pid, contestId) (villagers); the participate/refuse
//     screen states billing + real death count + current health.
//  4. shame_bites: villager show shame lands rep damage (REP only, never
//     trust); the galaxy still loves the trainwreck (+1 favor kept).
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
  if (cond) { pass++; } else { fail++; console.log('FAIL:', name); }
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
  const said = [];
  Game.say = function () {}; Game.audioEvent = function () {};
  Game.sysSay = (t) => { said.push(String(t)); };
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 20;

  // --- F1: blood weight — 400 picks at wave 1, blood share ~18% (was ~5%).
  ok(Game.unlockedWave() <= 1, 'F1: at wave 1 (got ' + Game.unlockedWave() + ')');
  let blood = 0; const N = 400;
  for (let i = 0; i < N; i++) { try { if (Game.pickContest().cat === 'blood') blood++; } catch (e) {} }
  const share = blood / N;
  ok(share > 0.10 && share < 0.28, `F1: blood share ~18% (got ${(share * 100).toFixed(1)}%, n=${N})`);

  // --- F2: high-risk phase damage x1.5, said aloud once.
  said.length = 0;
  Game.state.scholar.health = 100;
  Game.state.activeContest = {
    contestId: 'duel', participant: 'player', phase: 'x', phaseIdx: 0,
    phases: [{ choices: [{ label: 'x', do: { dmg: [10, 10] }, next: 'LOSE' }] }],
  };
  Game.contestChoose(0);
  const hpAfterHigh = Game.state.scholar.health;
  ok(hpAfterHigh === 85, `F2: high-risk dmg [10,10] x1.5 = 15 (100 -> ${hpAfterHigh})`);
  ok(said.some(s => /doesn't pull its punches/i.test(s)), 'F2: the multiplier is said aloud');
  const fearLines = said.filter(s => /doesn't pull its punches/i.test(s)).length;
  // second hit in the SAME contest: still multiplied, not re-announced.
  Game.state.scholar.health = 100; said.length = 0;
  Game.state.activeContest = {
    contestId: 'duel', participant: 'player', phase: 'x', phaseIdx: 0,
    phases: [
      { choices: [{ label: 'x', do: { dmg: [10, 10] }, next: 1 }] },
      { choices: [{ label: 'y', do: { dmg: [10, 10] }, next: 'LOSE' }] },
    ],
  };
  Game.contestChoose(0);
  Game.contestChoose(0);
  ok(Game.state.scholar.health === 70, 'F2: both hits x1.5 within one contest (100 -> ' + Game.state.scholar.health + ')');
  ok(said.filter(s => /doesn't pull its punches/i.test(s)).length === 1, 'F2: announced once per contest (not per hit)');
  ok(fearLines === 1, 'F2: exactly one announcement');

  // --- F3: medium risk untouched (control).
  Game.state.scholar.health = 100; said.length = 0;
  Game.state.activeContest = {
    contestId: 'no_such_contest', participant: 'player', phase: 'x', phaseIdx: 0,
    phases: [{ choices: [{ label: 'x', do: { dmg: [10, 10] }, next: 'LOSE' }] }],
  };
  Game.contestChoose(0);
  ok(Game.state.scholar.health === 90, `F3: unknown/medium risk dmg unscaled (100 -> ${Game.state.scholar.health})`);

  // --- F4: shows keep the no-kill cap even at high billing.
  Game.state.scholar.health = 30; said.length = 0;
  Game.state.activeContest = {
    contestId: 'duel', kind: 'show', participant: 'player', phase: 'x', phaseIdx: 0,
    phases: [{ choices: [{ label: 'x', do: { dmg: [50, 50] }, next: 'LOSE' }] }],
  };
  Game.contestChoose(0);
  ok(Game.state.scholar.health >= 1, `F4: show damage capped above death (30 -> ${Game.state.scholar.health})`);

  // --- F5: death ledger — villager path via _cxKillContestant(pid, id).
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0, 'F5: roster has villagers');
  const vid = roster[0];
  Game.state.contestDeathsById = {};
  Game._cxKillContestant(vid, 'pit');
  ok((Game.state.contestDeathsById.pit || 0) === 1, 'F5: villager contest death ledgered to pit');
  ok(!(Game.state.village.roster || []).includes(vid), 'F5: and actually removed from roster');

  // --- F6: honest stakes on the choice screen.
  said.length = 0;
  Game.state.contestDeathsById = { pit: 3 };
  Game.state.scholar.health = 67;
  const base = Game.contestPool().find(c => c.id === 'pit');
  const scaled = Game._contestScaled(base, null);
  scaled.givesChoice = true; // force the participate/refuse screen, not the grab
  Game.contestInterruption(scaled, ['player']);
  const ac = Game.state.activeContest;
  ok(ac && ac.phases && ac.phases[0], 'F6: choice phase built');
  const ct = ac.phases[0].text || '';
  ok(/HIGH RISK/i.test(ct), 'F6: billing stated');
  ok(/killed 3 before/i.test(ct), 'F6: honest death count stated');
  ok(/67 health/i.test(ct), 'F6: current health stated');
  ok(/participate/i.test(ct) && /refuse/i.test(ct), 'F6: the choice is still the choice');
  Game.state.activeContest = null; // don't leave a live contest

  // --- F7: shame bites — rep damage, said aloud, favor kept.
  const roster2 = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  // find a villager whose debut show resolves to 'shame'
  let shamePid = null;
  for (const id of roster2) {
    try { if (Game.showResolveVillager(id, { id: 'break_room' }, {}).outcome === 'shame') { shamePid = id; break; } } catch (e) {}
  }
  ok(!!shamePid, 'F7: found a debut-shame villager');
  if (shamePid) {
    const repBefore = JSON.stringify(Game.repOf(shamePid));
    const repCalls = [];
    const origRep = Game.applyRep.bind(Game);
    Game.applyRep = function (t, d, w, nt, tr) { repCalls.push({ t, d, w, nt }); return origRep(t, d, w, nt, tr); };
    said.length = 0;
    Game._showVillagerEnd({ participant: shamePid, showId: 'break_room', showName: 'Break Room', cheer: 0 });
    Game.applyRep = origRep;
    const bite = repCalls.find(c => c.t === shamePid && (c.d.kind || 0) < 0);
    ok(!!bite, 'F7: shame applied rep damage');
    ok(bite && bite.nt === true, 'F7: rep only — trust untouched (standing rule)');
    ok(said.some(s => /never, ever let it go/i.test(s)), 'F7: the bite is said aloud');
  }

  // --- F8: sense-read the new copy (Steve's sensicality law).
  console.log('--- new copy sense-read ---');
  for (const s of said.slice(-6)) console.log('  |', s.slice(0, 160));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
