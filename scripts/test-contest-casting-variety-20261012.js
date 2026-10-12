#!/usr/bin/env node
// test-contest-casting-variety-20261012.js — proof for the casting-variety lever
// (long-run sim loop, lever 6 round 6). The r5 blank: the same villager got
// show-pulled every few days with identical "MADE for this" lines —
// notability-weighted casting doing its job a bit too well.
//
// Lever (all in src/js/contests.js):
//  1. Recency repel in showCastPull: recently-pulled notables get their
//     casting weight discounted (<=2d: x0.25, 3-5d: x0.5, 6-10d: x0.75,
//     >10d: x1) — a repel, NOT a ban. Whim + fresh-face paths skip it.
//     When the repel flips the winner, cast.cutStar carries the cut star
//     and fireShow announces it ~40% of the time ("The producers cut it").
//  2. Pull-day ledger (_showPullDays) recorded in fireShow for every pull.
//  3. Fans landing: 1 identical line -> 6 rotating lines (signature x2
//     weight). Shame landing: 1 -> 3 rotating lines. Same side effects.
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
  const realRandom = Math.random;
  const said = [];
  Game.say = function () {}; Game.audioEvent = function () {};
  Game.sysSay = (t) => { said.push(String(t)); };
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length >= 4, 'setup: 4+ villagers (got ' + roster.length + ')');
  const A = roster[0], B = roster[1];

  // Build notability: A = 2 contestWins (top), B = 1 contestWin (close).
  Game.addNotability(A, 'contestWin'); Game.addNotability(A, 'contestWin');
  Game.addNotability(B, 'contestWin');
  const wA = Game.notabilityWeight(A), wB = Game.notabilityWeight(B);
  ok(wA > wB && wB > 1, `setup: A(${wA.toFixed(1)}) > B(${wB.toFixed(1)}) > 1`);
  // Isolate the star path: every OTHER villager is "already pulled" so the
  // fresh-face pool is empty; the player stays weight-1 (not notable).
  for (const id of roster) { v._showPulled = v._showPulled || {}; v._showPulled[id] = 1; }
  delete v._showPulled[A]; delete v._showPulled[B];
  v._showPullDays = {};
  const realR = Math.random;

  // --- T1: no repel — the top star still wins (canon casting kept). ---
  Math.random = () => 0.99; // whim/fresh gates stay shut; band pick = index 0
  let c = Game.showCastPull();
  ok(c.who === A && c.why === 'star' && !c.cutStar,
    `T1: no recent pull — A is the star, no cut (got ${c.who}/${c.why}/cut=${c.cutStar})`);

  // --- T2: repel flips the winner — recently-pulled A loses to B. ---
  v._showPullDays[A] = [30]; // pulled TODAY
  c = Game.showCastPull();
  ok(c.who === B && c.cutStar === A,
    `T2: A pulled today — B picked, A cut (got ${c.who}/cut=${c.cutStar})`);
  ok(c.why === 'star', `T2b: still a star pick (got ${c.why})`);

  // --- T3: repel decays — 6 days ago the discount is small. ---
  v._showPullDays[A] = [24]; // gap 6 -> x0.75: A wins again
  c = Game.showCastPull();
  ok(c.who === A && !c.cutStar,
    `T3: A pulled 6d ago — A is the star again (got ${c.who}/cut=${c.cutStar})`);

  // --- T4: the repel is not a ban — a repelled A can still win ties. ---
  // Make B zero-weight (not notable) so repelled A (0.25xwA) stands alone.
  Game.state.notability[B] = {};
  v._showPullDays[A] = [30];
  c = Game.showCastPull();
  ok(c.who === A && !c.cutStar,
    `T4: repelled A alone — A still picked, no cut (got ${c.who}/cut=${c.cutStar})`);

  // --- T5: whim path skips the repel (no cutStar on whim). ---
  Game.addNotability(B, 'contestWin');
  v._showPullDays = { [A]: [30] };
  Math.random = () => 0.01; // whim gate opens (0.01 < 0.10)
  let sawWhimNoCut = true, n = 0;
  for (let i = 0; i < 40; i++) { const cc = Game.showCastPull(); if (cc.why === 'whim') { n++; if (cc.cutStar) sawWhimNoCut = false; } }
  ok(n > 0 && sawWhimNoCut, `T5: whim picks carry no cutStar (${n} whim pulls)`);

  // --- T6: the cut line announces ~40% of flips, tele always fires. ---
  Math.random = realR;
  const teleSeen = [];
  const origTele = Game.tele.bind(Game);
  Game.tele = function (t, d) { teleSeen.push({ t, d }); return origTele(t, d); };
  const castCut = { cutStar: A };
  Math.random = () => 0.99; // no line
  let line = Game._cxRepelCutLine(castCut, B);
  ok(line === null, 'T6a: unlucky roll — no line, but...');
  ok(teleSeen.some(x => x.t === 'show_cast_repel' && x.d.star === A && x.d.picked === B),
    'T6b: show_cast_repel tele fires on the flip regardless');
  Math.random = () => 0.10; // lucky roll
  line = Game._cxRepelCutLine(castCut, B);
  ok(typeof line === 'string' && /producers cut it/.test(line) && /AGAIN/.test(line),
    'T6c: lucky roll — the honest cut line (' + (line || 'null') + ')');
  ok(Game._cxRepelCutLine({}, B) === null, 'T6d: no cutStar — null');
  Math.random = realR;
  Game.tele = origTele;

  // --- T7: pull-day ledger — fireShow records every pull. ---
  // Stub the watch phases so the pull falls through to the announced
  // fallback (ledger runs before phases).
  const origWatch = Game.showWatchPhases;
  Game.showWatchPhases = () => [];
  const before = JSON.stringify(v._showPullDays || {});
  let whoPulled = null;
  for (let i = 0; i < 12; i++) {
    try {
      const s = Game.showPool().find(x => x.id === 'why_eat') || Game.pickShow();
      const pulled = Game.fireShow(s);
      // read back the last ledger entry via tele spy instead of guessing:
      whoPulled = whoPulled; // ledger check below is aggregate
    } catch (e) {}
  }
  const totalPulls = Object.values(v._showPullDays || {}).reduce((t, a) => t + a.length, 0);
  const totalBefore = Object.values(JSON.parse(before)).reduce((t, a) => t + a.length, 0);
  ok(totalPulls > totalBefore, `T7: ledger grows across fireShow pulls (${totalBefore} -> ${totalPulls})`);
  ok(totalPulls - totalBefore <= 12, 'T7b: ledger grows at most once per pull');
  const badDays = Object.values(v._showPullDays || {}).flat().some(d => typeof d !== 'number' || d < 1);
  ok(!badDays, 'T7c: ledger entries are valid days');
  Game.showWatchPhases = origWatch;

  // --- T8: fans landing — six voices, same side effects. ---
  const origResolve = Game.showResolveVillager;
  const origBeat = Game.broadcastBeat, origEnd = Game.broadcastEnd;
  Game.broadcastBeat = function () {}; Game.broadcastEnd = function () {};
  Game.showResolveVillager = () => ({ outcome: 'fans', score: 9 });
  const collapse = (t, id) => { const n = Game.displayName(id); return t.split(n).join('NAME'); };
  said.length = 0;
  const fansLines = new Set();
  const notBefore = ((Game.state.notability || {})[A] || {}).showmanship || 0;
  for (let i = 0; i < 60; i++) {
    const ac = { participant: A, showName: 'Why Do They Eat?', showId: 'why_eat', cheer: 0 };
    Game._showVillagerEnd(ac);
    for (const t of said) if (/comes home with fans|comes home famous/i.test(t)) fansLines.add(collapse(t, A));
  }
  const notAfter = ((Game.state.notability || {})[A] || {}).showmanship || 0;
  ok(fansLines.size >= 3, `T8a: fans landing rotates (${fansLines.size} distinct templates in 60)`);
  ok(notAfter - notBefore === 60, `T8b: every landing still grants showmanship (got +${notAfter - notBefore})`);
  ok(fansLines.size < 60, 'T8c: templates bounded — a pool, not a generator');
  Game.showResolveVillager = origResolve;
  Game.broadcastBeat = origBeat; Game.broadcastEnd = origEnd;

  // --- T9: shame landing — three voices, rep damage still lands. ---
  Game.broadcastBeat = function () {}; Game.broadcastEnd = function () {};
  Game.showResolveVillager = () => ({ outcome: 'shame', score: 2 });
  said.length = 0;
  const shameLines = new Set();
  for (let i = 0; i < 60; i++) {
    const ac = { participant: B, showName: 'Break Room', showId: 'break_room', cheer: 0 };
    Game._showVillagerEnd(ac);
    for (const t of said) if (/comes home with shame/i.test(t)) shameLines.add(collapse(t, B));
  }
  ok(shameLines.size >= 2, `T9a: shame landing rotates (${shameLines.size} distinct templates in 60)`);
  ok(said.some(t => /The village winces/i.test(t)), 'T9b: the village-wince follow-up survives');
  Game.showResolveVillager = origResolve;
  Game.broadcastBeat = origBeat; Game.broadcastEnd = origEnd;

  // --- T10: contest casting untouched — ratings_casting still raw weights. ---
  // notabilityWeight is the shared weight; the repel lives only in
  // showCastPull. Re-derive the depth+impact formula by hand (fireShow and
  // _showVillagerEnd above legitimately added showmanship deeds).
  const impactOf = (t) => (Game.NOTABILITY_IMPACT[t] != null ? Game.NOTABILITY_IMPACT[t] : 1);
  const manualW = (id) => {
    const deeds = (Game.state.notability || {})[id] || {};
    let s = 0;
    for (const t of Object.keys(deeds)) {
      const n = deeds[t] | 0;
      for (let k = 0; k < n; k++) s += impactOf(t) * (k === 0 ? 1 : k === 1 ? 0.5 : k === 2 ? 0.25 : 0.125);
    }
    return 1 + 2 * s;
  };
  ok(Math.abs(Game.notabilityWeight(A) - manualW(A)) < 1e-9 &&
     Math.abs(Game.notabilityWeight(B) - manualW(B)) < 1e-9,
    'T10: notabilityWeight still the depth+impact formula (no repel inside)');

  Math.random = realRandom;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
