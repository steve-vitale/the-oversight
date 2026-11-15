#!/usr/bin/env node
'use strict';
// Proof: lapsed `want` thread names the CURRENT favor, not the stale one
// (journey-crisis r208).
//
// RED (wild case: crisis r208, seed 14452, Hank d34): the villager's
// favor was forage_help at d10, when the `want` thread was planted as
// "that foraging help". By d34 the favor is heal_help (wound care,
// declined) and the whole sitting is about the wound — but the
// goodbye nod says "Glad we circled back to that foraging help.",
// naming a topic the sitting never touched. Root cause: convoNoteTopic
// recorded lastLapsed with the STORED lapsed label (was.label) even
// though the caller passes the live label (convoTopicLabel) naming the
// favor this sitting discussed. The same staleness sat in lastClosed,
// where a stale label also bypasses the r201 favor-want gate (the gate
// matches the thread label against the current favor's label).
//
// GREEN (post-fix): for `want`/`request` threads, convoNoteTopic
// records the live label the caller passes. The lapse nod names the
// sitting's favor; a changed favor can no longer smuggle its old name
// into either closing beat. Non-favor threads keep their stored label.
//
// The fix spends no RNG and touches no trajectory: it only changes
// which human phrase one spoken closing line uses (and, for the
// settled line, which label the r201 gate matches — exactly as
// designed). Uses the shared harness (scripts/godpath/lib). Exits
// nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const SECRET = "I wasn't a Veterinarian. I was an army medic. It's safer if people don't know. Please don't tell the others.";
const STEW = "Someone saved me the last of the stew once. Didn't say anything, just put the bowl down and walked off. I think about that bowl more than I think about the monsters.";
const GRIEF = "Mateo always took the burnt piece. Said someone had to. I take it now.";
const SETTLED_RE = /Good — .*settled\. Feels better said out loud\./;
const LAPSE_RE = /Glad we circled back to .*\.\"$/;

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

// Open a sitting for one villager and stage the sitting's want + favor
// ledger entry (r201 stageClose order: startConvo first, then stage).
function stageSitting(Game, vid, day, wantKind, favorState) {
  Game.state.scholar.day = day;
  const opened = Game.startConvo(vid);
  assert(opened && !opened.refused && !opened.ended, 'conversation opens for ' + vid + ' day ' + day);
  const c = Game.convoGet(vid);
  c.want = { id: 'ask_favor', favor: { kind: wantKind, state: favorState, vid } };
  Game.convoStoreFavor({ kind: wantKind, state: favorState, vid });
  return c;
}

// Restore the exact wild ledger shape before the note under test: the
// opener may already have resolved the thread (recording a label from
// ITS moment, e.g. a curious question) — that is opener nondeterminism,
// not the mechanism under test. Reset the close/lapse record and put
// the thread back where the wild run had it (open, or lapsed) carrying
// its stale label, so the note under test is the one that records.
function resetThread(Game, vid, tid, staleLabel, plantDay, lapsed) {
  const L = Game.convoTopicLedger(vid);
  L.lastClosed = null;
  L.lastLapsed = null;
  if (lapsed) {
    L.open = (L.open || []).filter(o => o.tid !== tid);
    if (!(L.lapsed || []).some(o => o.tid === tid)) {
      (L.lapsed = L.lapsed || []).push({ tid, label: staleLabel, day: plantDay });
    }
  } else {
    L.lapsed = (L.lapsed || []).filter(o => o.tid !== tid);
    if (!(L.open || []).some(o => o.tid === tid)) {
      Game.convoThreadOpen(vid, tid, staleLabel, 'unfinished business', SECRET);
    }
  }
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
  // Real wounds + low hunger so the live need scan sees heal_help, not
  // food_share or forage_help (the scan outranks by presence).
  for (const id of speakers) {
    v.health = v.health || {};
    v.health[id] = 40;
    v.hunger = v.hunger || {};
    v.hunger[id] = 30;
  }

  // ---- 1. The Hank d34 case: lapsed want, favor changed forage -> wound. ----
  stageSitting(Game, speakers[0], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[0], 'want', 'that foraging help', 'unfinished business', SECRET);
  check('d10 want thread planted', Game.convoTopicLedger(speakers[0]).open.some(o => o.tid === 'want'), JSON.stringify(Game.convoTopicLedger(speakers[0]).open));
  stageSitting(Game, speakers[0], 34, 'heal_help', 'declined');
  const live34 = Game.convoTopicLabel(speakers[0], 'want');
  console.log('  d34 live want label -> ' + JSON.stringify(live34));
  check('d34 live label names the wound care', live34 === 'that wound care', 'got: ' + live34);
  resetThread(Game, speakers[0], 'want', 'that foraging help', 10, true);
  Game.convoNoteTopic(speakers[0], 'want', Game.convoTopicLabel(speakers[0], 'want'));
  const lapse1 = Game.convoLapseLine(speakers[0]);
  console.log('  d34 lapse line -> ' + JSON.stringify(lapse1));
  check('lapse nod names the wound care, not the old forage', typeof lapse1 === 'string' && lapse1.includes('that wound care') && !lapse1.includes('foraging'), 'got: ' + lapse1);

  // ---- 2. Non-favor thread keeps its stored label (Angela d29 shape). ----
  stageSitting(Game, speakers[1], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[1], 'lately', "what's been happening", 'unfinished business', GRIEF);
  stageSitting(Game, speakers[1], 34, 'heal_help', 'declined');
  resetThread(Game, speakers[1], 'lately', "what's been happening", 10, true);
  Game.convoNoteTopic(speakers[1], 'lately', "what's been happening");
  const lapse2 = Game.convoLapseLine(speakers[1]);
  console.log('  lately lapse line -> ' + JSON.stringify(lapse2));
  check("non-favor lapse nod keeps its stored label", typeof lapse2 === 'string' && lapse2.includes("what's been happening"), 'got: ' + lapse2);

  // ---- 3. Latent settled-line bypass: favor changed within 14 days (OPEN thread). ----
  // Plant the want thread as forage at d10; at d20 the favor is wound care
  // (still open, not lapsed) and undone. The r201 gate must withhold the
  // "settled" line — before the fix the stale label bypassed the gate and
  // the line declared the OLD favor settled.
  stageSitting(Game, speakers[2], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[2], 'want', 'that foraging help', 'unfinished business', SECRET);
  const c3 = stageSitting(Game, speakers[2], 20, 'heal_help', 'asked');
  c3.threadLog = [{ thread: 'want', snippet: STEW, ex: 1 }];
  resetThread(Game, speakers[2], 'want', 'that foraging help', 10, false);
  Game.convoNoteTopic(speakers[2], 'want', Game.convoTopicLabel(speakers[2], 'want'));
  const close3 = Game.convoCloseLine(speakers[2]);
  console.log('  open-thread undone favor close -> ' + JSON.stringify(close3));
  check('undone favor, changed label: no settled line', close3 == null, 'got: ' + close3);

  // ---- 4. Fulfilled favor still settles, under the CURRENT favor's name. ----
  stageSitting(Game, speakers[3], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[3], 'want', 'that foraging help', 'unfinished business', SECRET);
  const c4 = stageSitting(Game, speakers[3], 20, 'heal_help', 'fulfilled');
  c4.threadLog = [{ thread: 'want', snippet: STEW, ex: 1 }];
  resetThread(Game, speakers[3], 'want', 'that foraging help', 10, false);
  Game.convoNoteTopic(speakers[3], 'want', Game.convoTopicLabel(speakers[3], 'want'));
  const close4 = Game.convoCloseLine(speakers[3]);
  console.log('  fulfilled favor close -> ' + JSON.stringify(close4));
  check("fulfilled favor: settled line fires naming the wound care", typeof close4 === 'string' && SETTLED_RE.test(close4) && close4.includes('that wound care') && !close4.includes('foraging'), 'got: ' + close4);

  // ---- 5. Same favor across the lapse: label unchanged, nod still fires. ----
  stageSitting(Game, speakers[4], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[4], 'want', 'that foraging help', 'unfinished business', SECRET);
  const c5 = stageSitting(Game, speakers[4], 34, 'forage_help', 'asked');
  // The sitting's want still names the forage (same favor as d10) — stage
  // that directly so the case does not depend on the live need scan's
  // ranking (the wound staged for the other cases would outrank forage).
  c5.want.def = { topicLabel: 'that foraging help' };
  resetThread(Game, speakers[4], 'want', 'that foraging help', 10, true);
  Game.convoNoteTopic(speakers[4], 'want', Game.convoTopicLabel(speakers[4], 'want'));
  const lapse5 = Game.convoLapseLine(speakers[4]);
  console.log('  same-favor lapse line -> ' + JSON.stringify(lapse5));
  check('unchanged favor: lapse nod still names it', typeof lapse5 === 'string' && LAPSE_RE.test(lapse5) && lapse5.includes('that foraging help'), 'got: ' + lapse5);

  // ---- 6. No favor at all: lapse nod for a plain want thread still works. ----
  stageSitting(Game, speakers[5], 10, 'forage_help', 'asked');
  Game.convoThreadOpen(speakers[5], 'want', 'that foraging help', 'unfinished business', SECRET);
  const c6 = stageSitting(Game, speakers[5], 34, 'heal_help', 'declined');
  c6.want = { id: 'link', def: { topicLabel: 'that link' } };
  resetThread(Game, speakers[5], 'want', 'that foraging help', 10, true);
  Game.convoNoteTopic(speakers[5], 'want', Game.convoTopicLabel(speakers[5], 'want'));
  const lapse6 = Game.convoLapseLine(speakers[5]);
  console.log('  non-favor want lapse line -> ' + JSON.stringify(lapse6));
  check('non-favor want: lapse nod names the sitting want', typeof lapse6 === 'string' && lapse6.includes('that link'), 'got: ' + lapse6);

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
