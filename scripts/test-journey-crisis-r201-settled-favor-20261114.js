#!/usr/bin/env node
'use strict';
// Proof: favor-want "settled" close line fires on an undone favor
// (journey-crisis r201).
//
// RED (wild case: crisis r201, seed 14445, Ella d10): the villager's
// favor is a heal_help favor, still 'asked' in the favor ledger. The
// sitting's beats are about regrets, kindness, and stew — never wound
// care — but the threadLog attributes every beat of a want-driven
// sitting to the `want` thread, so the r183 real-beat gate passes and
// convoCloseLine declares "Good — that wound care, settled." for a
// favor nobody did. The favor sat 'asked' through the whole sitting
// (FAVOR-PROBE: heal_help/asked).
//
// GREEN (post-fix): convoCloseLine withholds the "settled" line while
// the favor the thread names is not done (asked / promised / broken /
// moot — a promise is not a settlement, a broken or lapsed favor is not
// one either). It still fires when the favor is done (fulfilled /
// thanked), and non-favor threads keep the r183 behavior (a real beat
// on the thread earns its closing beat).
//
// ANCHOR (r201 postfix correction — the first fix missed the wild
// case): the close line keys on the LEDGER thread, which outlives the
// sitting that planted it — by d10 the sitting's want was a link
// proposal, not the favor, so gating on the sitting's want never fires
// in the wild. The gate keys on the villager's favor ledger (one
// current favor per villager, surviving across conversations) and only
// when the thread's label IS that favor's label, so a pending favor
// never blocks an unrelated want thread. Cases 1-4 stage the sitting's
// want as a NON-favor want (the wild shape); case 8 pins the
// label-match precision.
// 
// The fix spends no RNG and touches no trajectory: it only withholds
// one spoken closing line, falling back to the existing quiet close
// (the r183 no-real-beat path already clears lastClosed and says
// nothing). Uses the shared harness (scripts/godpath/lib). Exits
// nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const SECRET = "I wasn't a Veterinarian. I was an army medic. It's safer if people don't know. Please don't tell the others.";
const STEW = "Someone saved me the last of the stew once. Didn't say anything, just put the bowl down and walked off. I think about that bowl more than I think about the monsters.";
const GRIEF = "Mateo always took the burnt piece. Said someone had to. I take it now.";
const SETTLED_RE = /Good — .*settled\. Feels better said out loud\./;
// A non-favor want, the shape the wild d10 sitting actually had: the
// villager's want was a link proposal, not the favor.
const LINK_WANT = { id: 'link', def: { topicLabel: 'that link' } };

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

// Stage one sitting's close-line decision for a thread:
// plant the open thread (as the previous sitting left it), stage this
// sitting's threadLog with one real beat, resolve the thread the way a
// discussed topic resolves, then ask convoCloseLine for the goodbye line.
// favor: null (no favor in the ledger) or {kind, state} staged via the
// game's own favor-ledger write; want: the sitting's want object.
function stageClose(Game, vid, tid, label, beat, favor, want) {
  const opened = Game.startConvo(vid);
  assert(opened && !opened.refused && !opened.ended, 'conversation opens for ' + vid);
  const c = Game.convoGet(vid);
  if (want) c.want = want;
  if (favor) Game.convoStoreFavor({ kind: favor.kind, state: favor.state, vid });
  Game.convoThreadOpen(vid, tid, label, 'unfinished business', SECRET);
  c.threadLog = [{ thread: tid, snippet: beat, ex: 1 }];
  Game.convoNoteTopic(vid, tid, label);
  return Game.convoCloseLine(vid);
}

async function main() {
  const Game = await K.load({ seed: parseInt(process.env.SEED || '4242', 10) });
  K.newRun(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speakers = [];
  for (const id of roster) {
    try { if (Game.commLevel(id).level !== 'full') continue; } catch (e) { continue; }
    v.trust = v.trust || {};
    v.trust[id] = 50;
    speakers.push(id);
    if (speakers.length >= 8) break;
  }
  check('enough full-comm speakers for 8 cases', speakers.length >= 8, 'found ' + speakers.length);
  const favor = (state) => ({ kind: 'heal_help', state });

  // ---- 1. favor still 'asked', sitting's want NOT the favor: the Ella d10 case. ----
  const l1 = stageClose(Game, speakers[0], 'want', 'that wound care', STEW, favor('asked'), LINK_WANT);
  console.log('  asked + link want -> ' + JSON.stringify(l1));
  check("asked favor: no 'settled' line", l1 == null, 'got: ' + l1);

  // ---- 2. favor 'promised': a promise is not a settlement. ----
  const l2 = stageClose(Game, speakers[1], 'want', 'that wound care', STEW, favor('promised'), LINK_WANT);
  console.log('  promised + link want -> ' + JSON.stringify(l2));
  check("promised favor: no 'settled' line", l2 == null, 'got: ' + l2);

  // ---- 3. favor 'broken': failure acknowledged elsewhere, not settled here. ----
  const l3 = stageClose(Game, speakers[2], 'want', 'that wound care', STEW, favor('broken'), LINK_WANT);
  console.log('  broken + link want -> ' + JSON.stringify(l3));
  check("broken favor: no 'settled' line", l3 == null, 'got: ' + l3);

  // ---- 4. favor 'moot': the need went away — lapsed, not settled. ----
  const l4 = stageClose(Game, speakers[3], 'want', 'that wound care', STEW, favor('moot'), LINK_WANT);
  console.log('  moot + link want -> ' + JSON.stringify(l4));
  check("moot favor: no 'settled' line", l4 == null, 'got: ' + l4);

  // ---- 5. favor 'fulfilled': done — the close line earns its beat. ----
  const l5 = stageClose(Game, speakers[4], 'want', 'that wound care', STEW, favor('fulfilled'), { id: 'ask_favor', favor: { kind: 'heal_help', state: 'fulfilled', vid: speakers[4] } });
  console.log('  fulfilled + favor want -> ' + JSON.stringify(l5));
  check("fulfilled favor: 'settled' line fires", typeof l5 === 'string' && SETTLED_RE.test(l5) && l5.includes('that wound care'), 'got: ' + l5);

  // ---- 6. favor 'thanked': done and thanked — the Shizuka d64 case. ----
  const l6 = stageClose(Game, speakers[5], 'want', 'that wound care', STEW, favor('thanked'), LINK_WANT);
  console.log('  thanked + link want -> ' + JSON.stringify(l6));
  check("thanked favor: 'settled' line fires", typeof l6 === 'string' && SETTLED_RE.test(l6) && l6.includes('that wound care'), 'got: ' + l6);

  // ---- 7. non-favor thread, no favor at all: r183 behavior untouched. ----
  const l7 = stageClose(Game, speakers[6], 'lately', "what's been happening", GRIEF, null, LINK_WANT);
  console.log('  lately, no favor -> ' + JSON.stringify(l7));
  check("non-favor thread: 'settled' line still fires", typeof l7 === 'string' && SETTLED_RE.test(l7), 'got: ' + l7);

  // ---- 8. favor pending, but the thread names something else: precision. ----
  const l8 = stageClose(Game, speakers[7], 'want', 'that question', STEW, favor('asked'), LINK_WANT);
  console.log('  asked favor, unrelated want thread -> ' + JSON.stringify(l8));
  check("pending favor does not block an unrelated want thread", typeof l8 === 'string' && SETTLED_RE.test(l8), 'got: ' + l8);

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
