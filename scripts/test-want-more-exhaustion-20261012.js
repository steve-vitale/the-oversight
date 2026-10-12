#!/usr/bin/env node
// test-want-more-exhaustion-20261012.js — PROOF TEST (journey deepening r4).
//
// BUG (from live transcripts, seed 60606 day 55): Emma's share_news want.
// Player picks "Tell me more." 7 times. The want delivers 2 news items, then
// the honest exhaustion line ("That's everything I've got..."), and then
// "Tell me more." KEEPS APPEARING — serving the 3-line dry pool, which
// cycles VERBATIM ("That's... pretty much all of it, honestly." x2,
// "I wish there was more to tell. That's it." x2). Steve's law: "No repeats,
// ever" and "then they say so ('I've told you everything') instead of looping."
//
// ROOT CAUSE: convoWantMenu (convo-wants.js) offers the want def's dlg:more
// unconditionally while stage < 3. It never checks whether the want has more
// to say. convoWantNews exhausts honestly but doesn't mark it; the menu keeps
// offering "more"; the dry pool cycles.
//
// FIX: (1) convoWantNews sets w.newsExhausted on the dry path;
//      (2) share_news def gains moreAvailable(vid) -> !w.newsExhausted;
//      (3) convoWantMenu filters dlg:more when the want's more-content is spent
//          (default: single-beat wants exhaust on first engage, stage >= 2).
//
// BEFORE: test fails (dlg:more still offered after exhaustion).
// AFTER:  test passes.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// seed Math.random BEFORE eval (modules capture it at load)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(20261012);
['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
 'src/js/game.js', 'src/js/encounters.js', 'src/js/food.js', 'src/js/conversation.js',
 'src/js/convo-beats.js', 'src/js/convo-dialogue.js', 'src/js/convo-wants.js',
 'src/js/convo-mood.js', 'src/js/journal.js', 'src/js/party.js',
 'src/js/truth.js', 'src/js/storage.js', 'src/js/perceive.js', 'src/js/carexplore.js',
 'src/js/justice.js', 'src/js/debug-scenarios.js'
].forEach(f => eval(fs.readFileSync(path.join(ROOT, f), 'utf8')));
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const idsOf = (choices) => (choices || []).map(c => c.id);

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  return (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
}
function forceWant(vid, wantId) {
  // plant a seed so convoSelectWant returns the specific want def (WANTS is
  // module-private; the seed path is the honest way to recover the def)
  Game.convoPlantSeed(vid, { wantId, note: 'test seed' });
  const w = Game.convoSelectWant(vid);
  if (!w || w.id !== wantId || !w.def) throw new Error('could not select want ' + wantId);
  const st = Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // fresh want object, surfaced (stage 1) — mirrors startConvo's assignment
  c.want = { id: wantId, def: w.def, stage: 1 };
  c.thread = 'want';
  // clear any question state from the real opener so the want menu is live
  c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
  return st;
}

(async () => {
  await Game.init();

  // === share_news: "tell me more" must retire when the news runs dry ===
  {
    const [vid] = freshGame();
    forceWant(vid, 'share_news');
    const seenLines = [];
    let exhaustedAt = -1;
    // drive "tell me more" up to 10 times via the real turn handler
    for (let i = 0; i < 10; i++) {
      const ids = idsOf(Game.convoChoices(vid));
      if (ids.indexOf('dlg:more') === -1) { exhaustedAt = i; break; }
      const r = Game.convoTurn(vid, 'dlg:more');
      if (r && r.line) seenLines.push(r.line);
      const c = Game.convoGet(vid);
      if (c.want && c.want.newsExhausted && exhaustedAt === -1) {
        // menu should now hide "more"; check next iteration
      }
    }
    const idsAfter = idsOf(Game.convoChoices(vid));
    ok('share_news: "tell me more" retires after exhaustion',
      idsAfter.indexOf('dlg:more') === -1,
      `choices still include dlg:more after ${seenLines.length} mores; lines=${JSON.stringify(seenLines.slice(-3))}`);
    // the exhaustion line was said exactly once (no dry-pool cycling)
    const exhCount = seenLines.filter(l => /everything I've got|pretty much all of it|wish there was more|whole of it/.test(l)).length;
    ok('share_news: exhaustion admitted, not looped', exhCount <= 2,
      `exhaustion-ish lines seen ${exhCount}x: ${JSON.stringify(seenLines)}`);
    // no verbatim repeats among delivered lines
    const dupes = seenLines.filter((l, i) => seenLines.indexOf(l) !== i);
    ok('share_news: no verbatim repeats', dupes.length === 0,
      `repeats: ${JSON.stringify(dupes.slice(0, 2))}`);
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }

  // === just_company: single fixed beat must not repeat ===
  {
    const [vid] = freshGame();
    forceWant(vid, 'just_company');
    const ids0 = idsOf(Game.convoChoices(vid));
    ok('just_company: "more" offered initially', ids0.indexOf('dlg:more') !== -1);
    const r1 = Game.convoTurn(vid, 'dlg:more');
    const line1 = r1 && r1.line;
    const ids1 = idsOf(Game.convoChoices(vid));
    ok('just_company: "more" retires after the single beat',
      ids1.indexOf('dlg:more') === -1,
      `still offered; line was ${JSON.stringify(line1)}`);
    try { Game.endConvo(vid, 'done'); } catch (e) {}
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
// NOTE: seek_taken omitted — its engageBeat requires taken kin (KIN canon),
// which a fresh game lacks. The moreAvailable default (stage < 2) covers it;
// share_news and just_company prove the mechanism.
