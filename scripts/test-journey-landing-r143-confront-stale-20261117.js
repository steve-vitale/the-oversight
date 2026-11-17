#!/usr/bin/env node
'use strict';
// Proof: stale-confessed confront stops looping (journey-landing r143 F1).
// Panel shape: seed 1213 d11, Mia — the sitting's volunteered secret had
// already set the one-confession flag, so every confront press landed on
// the confessedThisSitting deflect branch: the doubt stays open by design,
// the 4-variant staleConfessed pool exhausts, and the hardcoded fallback
// "That one's told already. Ask me something else." served verbatim 18x
// while the menu re-offered the same confront option every turn.
// RED: after one already-confessed deflect, the menu still offers that
// doubt's confront: option, so a player (or the wind-down probe) can
// press it forever and hear the same one-line fallback.
// GREEN (post-fix): the choice is spent for the sitting — the menu no
// longer offers it — while the doubt stays open (it returns tomorrow:
// a new sitting re-offers it) and the first press still speaks a
// staleConfessed variant. The normal detective loop is untouched: a
// deflect on a LIVE lie (flag clear) still leaves the option offered,
// so evidence can mount across presses in the sitting.
// Cases: (1) doubt path — live lie + slip doubt, flag set; (2) theft
// path — same shape via confrontTheft; (3) control — live lie, flag
// clear, roll forced to deflect: the option stays offered.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const STALE_MARKERS = [
  'We went over this',
  'That again?',
  'I told you the truth',
  'say it again',
  "That one's told already",
];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const _usedSpeakers = new Set();
function freshSpeaker(Game, v) {
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId && !_usedSpeakers.has(id));
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  _usedSpeakers.add(speaker);
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  return speaker;
}

// Clear the pending opening question so the confront option is offered.
function clearOpeningQ(Game, vid) {
  const menu = Game.convoChoices(vid).map(ch => ch.id);
  const ans = menu.find(id => id.indexOf('ans:') === 0);
  if (ans) Game.convoTurn(vid, ans);
}

function menuIds(Game, vid) {
  return Game.convoChoices(vid).map(ch => ch.id);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const seededRandom = Math.random;

  // ---- (1) DOUBT PATH: live lie + slip doubt, flag set (secret told) ----
  const s1 = freshSpeaker(Game, v);
  const vp1 = Game.vpOf(s1);
  const lie1 = Game.makeLie(vp1, 'origin', 'shame');
  lie1.confessed = false;
  vp1.lies = { origin: lie1 };
  Game.truthSlip(s1, lie1);
  check('(1) one open slip doubt planted', Game.getDoubts(s1).length === 1,
    'got ' + Game.getDoubts(s1).length);
  const opened1 = Game.startConvo(s1);
  check('(1) sitting opens', !!(opened1 && !opened1.refused && !opened1.ended));
  const c1 = Game.convoGet(s1);
  // The volunteered secret already bared one secret this sitting (r172
  // case 5 proves the opener sets this flag); set it directly so the
  // fixture does not depend on the opener's RNG. The doubt's lie stays
  // LIVE — the secret confessed something else — so the 1515 stale path
  // does not fire and the press lands on the confessedThisSitting branch.
  c1.confessedThisSitting = true;
  clearOpeningQ(Game, s1);
  const conf1 = menuIds(Game, s1).find(id => id.indexOf('confront:') === 0);
  check('(1) confront offered before the press', !!conf1, JSON.stringify(menuIds(Game, s1)));
  const prevLen1 = (c1.transcript || []).length;
  const r1 = Game.convoTurn(s1, conf1);
  const turn1 = (c1.transcript || []).slice(prevLen1);
  const them1 = turn1.filter(e => e.who === 'them').map(e => String(e.text)).join(' ');
  check('(1) the press speaks a stale-confessed line',
    STALE_MARKERS.some(m => them1.indexOf(m) >= 0), them1.slice(0, 200));
  check('(1) the doubt stays open (not resolved by the deflect)',
    Game.getDoubts(s1).length === 1 && !Game.getDoubts(s1, true)[0].resolved,
    'open=' + Game.getDoubts(s1).length);
  check('(1) the menu no longer offers that confront option',
    !(r1.choices || []).some(ch => ch.id === conf1),
    JSON.stringify((r1.choices || []).map(ch => ch.id)));
  Game.endConvo(s1, 'done');
  Game.startConvo(s1);
  const conf1b = menuIds(Game, s1).find(id => id === conf1);
  check('(1) a new sitting re-offers the option (spent is per-sitting)',
    !!conf1b, JSON.stringify(menuIds(Game, s1)));
  Game.endConvo(s1, 'done');

  // ---- (2) THEFT PATH: same shape via confrontTheft ----
  const s2 = freshSpeaker(Game, v);
  const dT = Game.addDoubt(s2, 'theft',
    `${Game.firstRef(s2)} was seen taking salt from the cache.`,
    ['witnessed taking salt from the cache'], {});
  dT.theft = { label: 'salt', place: 'the pantry', day: Game.state.scholar.day };
  const opened2 = Game.startConvo(s2);
  check('(2) sitting opens', !!(opened2 && !opened2.refused && !opened2.ended));
  const c2 = Game.convoGet(s2);
  c2.confessedThisSitting = true;
  clearOpeningQ(Game, s2);
  const conf2 = menuIds(Game, s2).find(id => id.indexOf('confront:') === 0);
  check('(2) theft confront offered before the press', !!conf2, JSON.stringify(menuIds(Game, s2)));
  const prevLen2 = (c2.transcript || []).length;
  const r2 = Game.convoTurn(s2, conf2);
  const turn2 = (c2.transcript || []).slice(prevLen2);
  const them2 = turn2.filter(e => e.who === 'them').map(e => String(e.text)).join(' ');
  check('(2) the press speaks a stale-confessed line',
    STALE_MARKERS.some(m => them2.indexOf(m) >= 0), them2.slice(0, 200));
  check('(2) the theft doubt stays open',
    Game.getDoubts(s2).length === 1 && !Game.getDoubts(s2, true)[0].resolved,
    'open=' + Game.getDoubts(s2).length);
  check('(2) the menu no longer offers that confront option',
    !(r2.choices || []).some(ch => ch.id === conf2),
    JSON.stringify((r2.choices || []).map(ch => ch.id)));
  Game.endConvo(s2, 'done');

  // ---- (3) CONTROL: live lie, flag clear, roll forced to deflect ----
  // The detective loop's same-sitting re-press must survive: a deflect
  // on a live lie mounts evidence and raises the next confess chance,
  // so the option stays offered.
  const s3 = freshSpeaker(Game, v);
  const vp3 = Game.vpOf(s3);
  const lie3 = Game.makeLie(vp3, 'origin', 'shame');
  lie3.confessed = false;
  vp3.lies = { origin: lie3 };
  Game.truthSlip(s3, lie3);
  const opened3 = Game.startConvo(s3);
  check('(3) sitting opens', !!(opened3 && !opened3.refused && !opened3.ended));
  clearOpeningQ(Game, s3);
  const conf3 = menuIds(Game, s3).find(id => id.indexOf('confront:') === 0);
  check('(3) confront offered before the press', !!conf3, JSON.stringify(menuIds(Game, s3)));
  Math.random = () => 0.999; // roll loses to any confessP <= ~0.9: deflect
  let r3;
  try { r3 = Game.convoTurn(s3, conf3); } finally { Math.random = seededRandom; }
  check('(3) the deflect leaves the doubt open',
    Game.getDoubts(s3).length === 1 && !Game.getDoubts(s3, true)[0].resolved,
    'open=' + Game.getDoubts(s3).length);
  check('(3) the menu STILL offers the option (detective loop intact)',
    (r3.choices || []).some(ch => ch.id === conf3),
    JSON.stringify((r3.choices || []).map(ch => ch.id)));
  Game.endConvo(s3, 'done');

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
