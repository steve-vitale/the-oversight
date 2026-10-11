#!/usr/bin/env node
// test-contests-freshface-20261011.js — proof for the show fresh-face lever
// (longsim contests 2026-10-11): once the show is established (someone is
// notable), 30% of show pulls go to a never-pulled castable villager,
// announced as "a new face". Baseline: 0/15 villager pulls across 16 long
// runs — the gossip lane's celebrities never got on screen.
//
// Node harness conventions: seed Math.random BEFORE eval (modules capture it
// at load), eval FULL src/js/*.js list in index.html order minus DOM-only
// modules, never stub Game.save, --cacheDirectory is a jest concern only.
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
  const order = execSync(`grep -o 'src/js/[^\"'\"'\"']*\\.js' index.html | head -80`, { cwd: ROOT })
    .toString().split('\n')
    .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
  global.window = global;
  for (const f of order) { try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { console.log('LOAD FAIL', f, e.message); process.exit(1); } }
  delete global.window;
  const Game = globalThis.Scattering.Game;
  Game.say = function () {}; Game.sysSay = function () {}; Game.audioEvent = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const day = () => (Game.state.scholar || {}).day || 1;
  const said = [];
  Game.sysSay = (t) => { said.push(String(t)); };

  // --- E1: debut preserved — nobody notable -> the player is first on screen.
  Game.state.scholar.day = 20;
  const cands0 = Game.showEligible();
  ok(cands0.some(c => c.id === 'player'), 'E1: player castable');
  const cast0 = Game.showCastPull();
  ok(cast0.who === 'player' && cast0.why === 'debut', 'E1: first-ever pull is the player debut (got ' + cast0.who + '/' + cast0.why + ')');

  // --- E2: fresh-face share ~30% once the player is notable.
  Game.addNotability('player', 'contestWin');
  Game.addNotability('player', 'showmanship');
  const villagers = cands0.filter(c => c.id !== 'player').map(c => c.id);
  ok(villagers.length >= 3, 'E2: at least 3 castable villagers (got ' + villagers.length + ')');
  let fresh = 0, N = 400, whim = 0, star = 0, together = 0;
  const freshWho = new Set();
  for (let i = 0; i < N; i++) {
    const c = Game.showCastPull();
    if (c.why === 'fresh') { fresh++; freshWho.add(c.who); }
    else if (c.why === 'whim') whim++;
    else if (c.why === 'star' || c.why === 'tie') star++;
    else if (c.why === 'milestone') together++;
  }
  const share = fresh / N;
  console.log(`E2: fresh=${fresh}/${N} (${(share * 100).toFixed(1)}%), whim=${whim}, star/tie=${star}, milestone=${together}`);
  ok(share > 0.20 && share < 0.42, 'E2: fresh-face share within 20-42% (30% target)');
  ok(freshWho.size > 1, 'E2: fresh picks spread across villagers (' + freshWho.size + ' distinct)');
  for (const w of freshWho) ok(villagers.includes(w), 'E2: fresh pick ' + w + ' is a castable villager');

  // --- E3: fresh pool drains — once everyone is pulled, no more fresh picks.
  const v = Game.state.village; v._showPulled = v._showPulled || {};
  for (const id of villagers) v._showPulled[id] = day();
  let freshAfter = 0;
  for (let i = 0; i < 200; i++) { if (Game.showCastPull().why === 'fresh') freshAfter++; }
  ok(freshAfter === 0, 'E3: no fresh picks once every villager has been pulled (got ' + freshAfter + ')');

  // --- E4: fresh pick is announced and the pull is playable.
  // Reset the E3 pool-poisoning first: E4 needs a full fresh pool.
  delete Game.state.village._showPulled;
  // Rig the draw THROUGH fireShow (it re-casts internally). Draw order in
  // showCastPull: milestone (trigger, not a draw), whim (< 0.10), fresh
  // (< 0.30), then uniform pick. A constant 0.15 threads it: skips the whim,
  // hits fresh, and picks fresh[0.15*n].
  const realRandom = Math.random;
  Math.random = () => 0.15;
  said.length = 0;
  const show = Game.showPool().find(s => s.id === 'why_eat') || Game.pickShow();
  let expectedWho = null;
  try {
    Game.fireShow(show);
    expectedWho = Game.state.activeContest ? Game.state.activeContest.participant : null;
  } finally { Math.random = realRandom; }
  ok(expectedWho && expectedWho !== 'player' && expectedWho !== 'together', 'E4: rigged draw yields a fresh villager pull (got ' + expectedWho + ')');
  ok(said.some(s => /new face/i.test(s)), 'E4: fresh-face announcement said out loud');
  ok(v._showPulled && expectedWho && v._showPulled[expectedWho] != null, 'E4: pulled villager recorded in _showPulled');
  ok(Game.state.activeContest && Game.state.activeContest.participant === expectedWho, 'E4: fresh villager pull creates a playable show modal');

  // --- E5: the villager pull resolves to fans/shame (downstream machinery works).
  let guard = 0;
  while (Game.state.activeContest && guard++ < 50) { try { Game.contestChoose(0); } catch (e) { break; } }
  ok(!Game.state.activeContest, 'E5: villager show modal resolves (choice-0 drive)');
  const gossipN = (Game.state.village.gossip || []).filter(g => String(g.action || '').indexOf('show_') === 0).length;
  ok(gossipN > 0, 'E5: village gossips about the pulled villager (' + gossipN + ' show gossip entries)');
  const nota = Game.notability(expectedWho);
  ok(nota.some(n => /audience favorite/i.test(n)), 'E5: pulled villager earned showmanship notability: ' + JSON.stringify(nota));

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
})();
