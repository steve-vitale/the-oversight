#!/usr/bin/env node
// scripts/test-journey-establishment-r68-topiclabels.js — proof test for the
// r68 blank #1 fix (want-thread topicLabels, journey-establishment r67
// next-blank #1). r67 transcripts showed recaps naming the category, not
// the thing: Elena 345 "Still on what they want." (goal thread), Ezra 348
// "Still on their secret." (secret thread), Reagan 348 "Still on their
// request." (request thread). Fix (conversation.js convoTopicLabel):
//   - 'goal' -> the villager's live goal-def want phrase ("wanting to
//     keep everyone fed"), fallback 'what they want' when unknown.
//   - 'request' -> the sitting's current want (def.topicLabel, then
//     ask_favor need-kind map via pure convoFindFavorNeed, then wid map),
//     fallback 'their request' when nothing resolves.
//   - 'secret' -> 'what they confided' (the thread exists only because
//     the NPC confided something this sitting; free-text secrets carry
//     no kind, so the act — not an invented topic — is named).
// GREEN means the recap line names the thing on all three threads, and
// the fallbacks/pass-throughs are untouched. BEFORE the fix, A/B/C fail
// with the generic labels (verified by stash-run, see run note).
// Usage: node scripts/test-journey-establishment-r68-topiclabels.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const ok = (name, cond, detail) => {
    if (cond) console.log(`ok - ${name}`);
    else fails.push(`${name}: ${detail}`);
  };

  const { Game } = await loadGame({ seed: 349001, mode: 'r68-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  if (roster.length < 3) { console.error('construction invalid: roster too small'); process.exit(2); }

  // A. GOAL: first villager whose goal resolves to a def with a want phrase.
  let goalVid = null, goalWant = null;
  for (const id of roster) {
    try {
      const goal = (typeof Game.npcGoal === 'function') ? Game.npcGoal(id) : null;
      const def = goal ? ((Game.data.characterGen.goals || []).find(g => g.id === goal)) : null;
      if (def && def.want) { goalVid = id; goalWant = String(def.want); break; }
    } catch (e) {}
  }
  if (!goalVid) { console.error('construction invalid: no goal-def villager'); process.exit(2); }
  const cG = Game.convoGet(goalVid);
  cG.threadLog = [{ thread: 'goal' }];
  const recapG = String(Game.convoRecapLine(goalVid));
  ok('A. goal recap names the goal want',
    recapG.includes('wanting ' + goalWant) && !/what they want/.test(recapG),
    `recap=${recapG} goalWant=${goalWant}`);
  ok('A2. goal topicLabel is the want phrase',
    Game.convoTopicLabel(goalVid, 'goal') === 'wanting ' + goalWant,
    String(Game.convoTopicLabel(goalVid, 'goal')));

  // B. REQUEST via ask_favor need: make the villager sick (sev2) so the
  // pure need scan returns sick_help, then set the sitting want.
  const H = roster[1];
  v.sick = v.sick || {};
  v.sick[H] = { name: 'gut rot', severity: 2, daysLeft: 5 };
  v.promises = v.promises || {};
  delete v.promises[H];
  v.favorDeclined = v.favorDeclined || {};
  delete v.favorDeclined[H];
  const cH = Game.convoGet(H);
  cH.want = { id: 'ask_favor', def: {} };
  const labelB = Game.convoTopicLabel(H, 'request');
  ok('B. request recap resolves the favor need (sick_help -> wound/sickness)',
    labelB === 'that sickness help', `label=${labelB}`);
  cH.threadLog = [{ thread: 'request' }];
  const recapB = String(Game.convoRecapLine(H));
  ok('B2. request recap line names the need, not the category',
    /that sickness help/.test(recapB) && !/their request/.test(recapB), `recap=${recapB}`);

  // B3. REQUEST via wid map (non-favor want, no need scan involved).
  const H3 = roster[2];
  const cH3 = Game.convoGet(H3);
  cH3.want = { id: 'warn_you', def: {} };
  ok('B3. request falls back to the want map (warn_you)',
    Game.convoTopicLabel(H3, 'request') === 'that warning',
    String(Game.convoTopicLabel(H3, 'request')));

  // B4. SEEK_TAKEN (panel-surfaced, seed 351 Miles): the one want id
  // missing from the wid map — its recap fell back to 'what was on
  // their mind' after a Taken/pod sitting about his niece Betty.
  // The want persists mid-sitting (convoResolveWant runs at endConvo),
  // so the map entry names the recap in the wild, not just here.
  const cH4 = Game.convoGet(roster[0]);
  cH4.want = { id: 'seek_taken', def: {} };
  cH4.threadLog = [{ thread: 'want' }];
  const recapT = String(Game.convoRecapLine(roster[0]));
  ok('B4. seek_taken recap names the taken person',
    /that taken person/.test(recapT) && !/what was on their mind/.test(recapT),
    `recap=${recapT}`);

  // C. SECRET: the confided act, not the category.
  const cS = Game.convoGet(roster[0]);
  cS.threadLog = [{ thread: 'secret' }];
  const recapS = String(Game.convoRecapLine(roster[0]));
  ok('C. secret recap names the confided act',
    /what they confided/.test(recapS) && !/their secret/.test(recapS), `recap=${recapS}`);

  // D. FALLBACKS + PASS-THROUGH untouched.
  const cD = Game.convoGet(roster[1]);
  cD.want = null;
  cD.threadLog = [{ thread: 'request' }];
  const recapD = String(Game.convoRecapLine(roster[1]));
  ok('D. request with no want keeps the old category label',
    /their request/.test(recapD), `recap=${recapD}`);
  const cW = Game.convoGet(roster[2]);
  cW.want = null;
  cW.threadLog = [{ thread: 'want' }];
  const recapW = String(Game.convoRecapLine(roster[2]));
  ok('D2. want with no want keeps the old fallback',
    /what was on their mind/.test(recapW), `recap=${recapW}`);
  ok('D3. village label passes through untouched',
    Game.convoTopicLabel(roster[0], 'village') === 'the village',
    String(Game.convoTopicLabel(roster[0], 'village')));

  if (fails.length) {
    console.error('FAILURES:\n' + fails.join('\n'));
    process.exit(1);
  }
  console.log('ALL GREEN');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
