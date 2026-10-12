#!/usr/bin/env node
// test-contest-recast-nodup-20261011.js — long-run sim lever 6, round 5
// (contests & shows): the RECAST must never take someone who is ALREADY
// cast.
//
// Found by sense-testing (Steve 2026-10-11 law): a 3-take contest's first
// take (David, away from Haven) recast to its own third take (Lena) —
// "Lena and Lena have been taken" — and the verdict then resolved Lena
// TWICE (double winner's share, double verdict, double death roll).
// Root cause: the recast's takenSet seeds empty, so a recast can pick a
// villager who is still in the upcoming cast list. Fix: seed takenSet with
// the whole original cast.
//   A. RED/BLACK: 3-take [a,b,c], a and b away, c the only eligible — the
//      recast for a must NOT take c (already cast); c appears exactly once.
//   B. the captured cast has no duplicate ids at all.
//   C. the show still goes on (not cancelled) — c is still taken.
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
  if (cond) { pass++; console.log('  ok:', name); }
  else { fail++; console.log('  FAIL:', name, extra === undefined ? '' : extra); }
}

async function main() {
  Math.random = mulberry32(20261011);
  global.fetch = (f) => Promise.resolve({
    json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
  });
  const order = execSync(`grep -o 'src/js/[^\"'"'"']*\\.js' index.html | head -80`, { cwd: ROOT })
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
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 21; // casting bar is day 14+

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length >= 3, 'roster has 3+ villagers', roster.length);
  const [a, b, c] = roster;
  // a and b away from Haven (the transcript's David/James); c home.
  Game.state.village.away = Game.state.village.away || {};
  for (const rid of roster) if (rid !== c) Game.state.village.away[rid] = true;
  // the player must not be a recast candidate — exiled scholars are off the board
  Game.state.scholar.exiled = true;
  const elig = Game.contestEligible();
  ok(elig.eligible.some(e => e.id === c), 'c is eligible (at Haven, member, alive)');
  ok(!elig.eligible.some(e => e.id === a) && !elig.eligible.some(e => e.id === b), 'a and b are off the board (away)');

  const captured = [];
  Game.contestInterruption = function (contest, ids) { captured.push((ids || []).slice()); };
  Game.state.pendingContest = { contestId: 'calorie_run', participant: a, participants: [a, b, c], variant: null };
  Game.resolveContest();

  console.log('captured cast:', JSON.stringify(captured));
  ok(captured.length === 1, 'interruption ran once (show not cancelled)');
  const cast = captured[0] || [];
  const uniq = new Set(cast);
  ok(uniq.size === cast.length, 'no duplicate ids in the final cast', JSON.stringify(cast));
  ok(cast.filter(id => id === c).length === 1, 'c appears exactly once (already-cast, not recast-fodder)', JSON.stringify(cast));
  ok(cast.includes(c), 'the show still goes on — c is still taken');
  ok(lines.some(t => /no one left to take instead/.test(t)), 'cancelled takes are said out loud, not silent');
  ok(!lines.some(t => / and .* have been taken/.test(t) && /(\w+) and \1/.test(t)), 'no "X and X have been taken" line');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
