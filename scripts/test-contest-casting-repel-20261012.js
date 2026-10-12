#!/usr/bin/env node
// test-contest-casting-repel-20261012.js — proof for the contest-casting
// repel lever (long-run sim loop, lever 6 round 7). The r6 blank:
// "contest-side casting still uses raw weights (fireContest weightedPick
// — the same notability concentration exists for contest co-stars)".
//
// Lever (all in src/js/contests.js), the contest-side mirror of r6's
// show-side repel:
//  1. Recency repel in fireContest's weightedPick: recently-cast notables
//     get their casting weight discounted (<=2d: x0.25, 3-5d: x0.5,
//     6-10d: x0.75, >10d: x1) — a repel, NOT a ban. The ONE shared
//     notabilityWeight is untouched (canon: depth + impact). The 10%
//     whim (uniform, announced) and the player's surest-star first slot
//     skip the repel — only the concentration path gets it.
//  2. Pull-day ledger (_contestPullDays, separate from r6's _showPullDays)
//     recorded in fireContest for every cast, villager AND player.
//  3. Flip announced diegetically ~40% ("The producers cut it"), tele
//     'contest_cast_repel' fires on every announced flip.
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
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length >= 3, 'setup: 3+ villagers (got ' + roster.length + ')');
  const A = roster[0], B = roster[1], C = roster[2];
  const nameA = Game.displayName(A), nameB = Game.displayName(B);

  // Build notability: A = 2 contestWins (top), B = 1 contestWin, C = none.
  Game.addNotability(A, 'contestWin'); Game.addNotability(A, 'contestWin');
  Game.addNotability(B, 'contestWin');
  const wA = Game.notabilityWeight(A), wB = Game.notabilityWeight(B), wC = Game.notabilityWeight(C);
  ok(wA > wB && wB > wC && wC === 1, `setup: A(${wA}) > B(${wB}) > C(${wC})`);

  // Fixed eligibility funnel: player + A + B + C, in that order. Lets the
  // weighted co-star path be read deterministically through fireContest.
  const entryFor = (id) => ({ id, name: id === 'player' ? 'You' : Game.displayName(id),
    notability: Game.notability(id), notes: [] });
  Game.contestEligible = () => ({ eligible: [entryFor('player'), entryFor(A), entryFor(B), entryFor(C)], ineligible: [] });

  const contest = (participants) => ({ id: 'test_gauntlet', name: 'Test Gauntlet',
    desc: 'a test arena', participants, cat: 'blood', risk: 'high', variant: null });
  const teleSeen = [];
  const origTele = Game.tele.bind(Game);
  Game.tele = function (t, d) { teleSeen.push({ t, d }); return origTele(t, d); };
  const cxTele = () => teleSeen.filter(x => x.t === 'contest_cast_repel');
  let seq = [];
  const seqRandom = () => (seq.length ? seq.shift() : 0.5);
  const castOf = (participants, s) => {
    said.length = 0; teleSeen.length = 0; seq = s.slice();
    Math.random = seqRandom;
    Game.fireContest(contest(participants));
    Math.random = mulberry32(SEED ^ 0x9e37);
    return ((Game.state.pendingContest || {}).participants || []).slice();
  };

  // --- T1: no repel — the top star still wins the co-star slot (canon kept).
  v._contestPullDays = {};
  let ids = castOf(3, [0.5, 0.5, 0.5, 0.99]);
  ok(ids.join(',') === ['player', A, B].join(','),
    `T1: no recent cast — player first, A then B (got ${ids.join(',')})`);
  ok(cxTele().length === 0, 'T1b: no repel telemetry when nothing is recent');

  // --- T2: repel flips the winner — A cast today loses the slot to B.
  v._contestPullDays = { [A]: [30] };
  ids = castOf(3, [0.5, 0.5, 0.5, 0.10]);
  ok(ids.join(',') === ['player', B, A].join(','),
    `T2: A cast today — B takes the co-star slot, A still later (got ${ids.join(',')})`);
  ok(cxTele().length === 1 && cxTele()[0].d.star === A && cxTele()[0].d.picked === B,
    'T2b: contest_cast_repel tele names the cut star and the pick');
  ok(said.some(t => /producers cut it/.test(t) && new RegExp(nameA).test(t)),
    'T2c: the honest cut line was said (lucky 0.10 roll)');

  // --- T3: repel decays — A cast 6d ago (x0.75) wins the slot back.
  v._contestPullDays = { [A]: [24] };
  ids = castOf(3, [0.5, 0.4, 0.5, 0.99]);
  ok(ids.join(',') === ['player', A, B].join(','),
    `T3: A cast 6d ago — A is the co-star again (got ${ids.join(',')})`);
  ok(cxTele().length === 0, 'T3b: no flip, no telemetry');

  // --- T4: the repel is not a ban — repelled A beats zero-weight B.
  Game.state.notability[B] = {};
  v._contestPullDays = { [A]: [30] };
  ids = castOf(3, [0.5, 0.1, 0.5, 0.99]);
  ok(ids[1] === A, `T4: repelled A still beats zero-weight B (co-star ${ids[1] === A ? 'A' : ids[1]})`);
  ok(cxTele().length === 0, 'T4b: repelled star still winning is not a flip');
  Game.addNotability(B, 'contestWin');

  // --- T5: whim skips the repel (uniform, announced, no flip).
  v._contestPullDays = { [A]: [30] };
  ids = castOf(1, [0.05]);
  ok(ids.length === 1, `T5: single-slot contest (got ${ids.length} picks)`);
  ok(said.some(t => /System's whim/.test(t)), 'T5b: the whim is announced');
  ok(cxTele().length === 0, 'T5c: whim pick carries no repel telemetry');

  // --- T6: the cut line helper — tele always, line ~40%, player naming.
  ok(typeof Game._cxContestRepelCutLine === 'function', 'T6: _cxContestRepelCutLine exists');
  if (typeof Game._cxContestRepelCutLine === 'function') {
    teleSeen.length = 0;
    Math.random = () => 0.99;
    let line = Game._cxContestRepelCutLine({ cutStar: A }, B);
    ok(line === null, 'T6a: unlucky roll — no line, but...');
    ok(cxTele().some(x => x.d.star === A && x.d.picked === B),
      'T6b: contest_cast_repel tele fires on the flip regardless');
    Math.random = () => 0.10;
    line = Game._cxContestRepelCutLine({ cutStar: A }, B);
    ok(typeof line === 'string' && /producers cut it/.test(line) && /AGAIN/.test(line) && new RegExp(nameA).test(line),
      'T6c: lucky roll — honest contest cut line (' + (line || 'null').slice(0, 90) + ')');
    line = Game._cxContestRepelCutLine({ cutStar: 'player' }, B);
    ok(typeof line === 'string' && /you AGAIN/.test(line), 'T6d: player cut star reads as "you"');
    ok(Game._cxContestRepelCutLine({}, B) === null, 'T6e: no cutStar — null');
    Math.random = mulberry32(SEED ^ 0x9e37);
  }

  // --- T7: pull-day ledger — every fireContest records every cast member.
  v._contestPullDays = {};
  castOf(3, [0.5, 0.5, 0.5, 0.99]);
  const led = v._contestPullDays || {};
  ok(led.player && led.player.includes(30) && led[A] && led[A].includes(30) && led[B] && led[B].includes(30),
    'T7: ledger records player + co-stars on the cast day');
  for (let i = 0; i < 40; i++) castOf(3, [0.5, 0.5, 0.5, 0.99]);
  const lens = Object.values(v._contestPullDays || {}).map(a => a.length);
  ok(lens.every(n => n <= 24), `T7b: ledger bounded at 24 (got max ${Math.max(...lens)})`);
  ok(Object.values(v._contestPullDays || {}).flat().every(d => typeof d === 'number' && d >= 1),
    'T7c: ledger entries are valid days');

  // --- T8: shows do NOT feed the contest repel (separate pools).
  v._contestPullDays = {};
  v._showPullDays = { [A]: [30] };
  ids = castOf(3, [0.5, 0.5, 0.5, 0.99]);
  ok(ids[1] === A && cxTele().length === 0,
    `T8: show pull yesterday does not repel contest casting (co-star ${ids[1] === A ? 'A' : ids[1]})`);

  // --- T9: notabilityWeight untouched — the repel multiplies, never edits.
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
     Math.abs(Game.notabilityWeight(C) - manualW(C)) < 1e-9,
    'T9: notabilityWeight still the depth+impact formula (no repel inside)');

  Game.tele = origTele;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
