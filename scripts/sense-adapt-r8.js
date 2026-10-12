#!/usr/bin/env node
// sense-adapt-r8.js — SENSE-TESTING for lever 6 r8 (Steve 2026-10-11: read
// transcripts, judge meaning, not just counts).
//
// Drives TWO full sequences with all say/sysSay captured verbatim:
//   1. a repeat-winner blood contest (heat>=1, dossier bans, stipulation,
//      rival beast named) — the hardened path;
//   2. a stale show (showStale>=2) with a twist, plus villager reactions.
// Writes /tmp/sense-adapt-r8-contest.txt and /tmp/sense-adapt-r8-show.txt.
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
  const lines = [];
  Game.say = (t) => lines.push('[say] ' + String(t));
  Game.sysSay = (t) => lines.push('[sys] ' + String(t));
  Game.audioEvent = function () {};
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 30;

  // ---------- SCENE 1: hardened blood contest with a full adaptation file ----------
  // Pick a blood contest from the pool and build the player's file by hand.
  const pool = Game.contestPool();
  const blood = pool.find(c => c.cat === 'blood') || pool[0];
  const cid = blood.id;
  const fakeAc = (approach) => ({ contestId: cid, participant: 'player', _approach: approach });
  Game.contestLearn(cid, 'won'); Game._cxRecordOutcome(fakeAc({ 0: 0, 1: 0, 2: 0 }), 'won');
  Game.contestLearn(cid, 'won'); Game._cxRecordOutcome(fakeAc({ 0: 0, 1: 1, 2: 0 }), 'won');
  Game.contestLearn(cid, 'won'); Game._cxRecordOutcome(fakeAc({ 0: 0, 1: 0, 2: 0 }), 'won');
  Game._cxAdapt().boredom[cid] = 2; // crowd bored -> stipulation
  lines.push('=== SETUP: heat=' + Game._cxHeatFor(cid) + ' dossierWins=' +
    ((Game._cxAdapt().dossier[cid] && Object.keys(Game._cxAdapt().dossier[cid].approaches).length) || 0) +
    ' boredom=' + Game._cxAdapt().boredom[cid] + ' ===');
  // Fire: restrict the pool to this contest so fireContest picks it.
  const realPool = Game.contestPool;
  Game.contestPool = () => [Object.assign({}, blood)];
  Game.state.contestsSeen = Game.state.contestsSeen || {};
  Game.state.contestsSeen[cid] = 6;
  lines.push('=== fireContest(' + cid + ') ===');
  try { Game.fireContest(Object.assign({}, blood)); } catch (e) { lines.push('[ERR fire] ' + e.message); }
  lines.push('=== pendingContest variant: ' + ((Game.state.pendingContest || {}).variant || 'n/a') + ' ===');
  // Advance a day through the countdown: the grab lands, resolveContest runs.
  const { driveFights, driveContests } = require('./sim-harness');
  const pol = {};
  try { Game.doAction('wait'); } catch (e) { lines.push('[ERR wait] ' + e.message); }
  try { driveFights(Game, pol, {}); driveContests(Game, pol, {}); } catch (e) { lines.push('[ERR drive1] ' + e.message); }
  lines.push('=== after wait: activeContest=' + !!Game.state.activeContest + ' pendingContest=' + !!Game.state.pendingContest + ' ===');
  try { Game.sleep(); } catch (e) { lines.push('[ERR sleep] ' + e.message); }
  try { driveFights(Game, pol, {}); driveContests(Game, pol, {}); } catch (e) { lines.push('[ERR drive2] ' + e.message); }
  lines.push('=== after sleep: activeContest=' + !!Game.state.activeContest + ' pendingContest=' + !!Game.state.pendingContest + ' over=' + !!Game.over + ' ===');
  // Countdown is one more day — advance again so the grab lands.
  try { Game.doAction('wait'); } catch (e) {}
  try { driveFights(Game, pol, {}); driveContests(Game, pol, {}); } catch (e) { lines.push('[ERR drive3] ' + e.message); }
  try { Game.sleep(); } catch (e) {}
  try { driveFights(Game, pol, {}); driveContests(Game, pol, {}); } catch (e) { lines.push('[ERR drive4] ' + e.message); }
  lines.push('=== after day 2: activeContest=' + !!Game.state.activeContest + ' pendingContest=' + !!Game.state.pendingContest + ' over=' + !!Game.over + ' ===');
  lines.push('=== heat now: ' + Game._cxHeatFor(cid) + ' ===');
  Game.contestPool = realPool;
  fs.writeFileSync('/tmp/sense-adapt-r8-contest.txt', lines.join('\n'));
  console.log('contest transcript:', lines.length, 'lines -> /tmp/sense-adapt-r8-contest.txt');

  // ---------- SCENE 2: stale show with twist ----------
  lines.length = 0;
  Game.state.scholar.day = 31;
  const show = { id: 'why_eat', name: 'WHY DO THEY EAT?' };
  Game._cxAdapt().showStale['why_eat'] = 3;
  lines.push('=== SETUP: showStale.why_eat=3 ===');
  lines.push('=== fireShow(why_eat) ===');
  try { Game.fireShow(show); } catch (e) { lines.push('[ERR show] ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')); }
  try { driveFights(Game, pol, {}); driveContests(Game, pol, {}); } catch (e) { lines.push('[ERR showdrive] ' + e.message); }
  fs.writeFileSync('/tmp/sense-adapt-r8-show.txt', lines.join('\n'));
  console.log('show transcript:', lines.length, 'lines -> /tmp/sense-adapt-r8-show.txt');
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
