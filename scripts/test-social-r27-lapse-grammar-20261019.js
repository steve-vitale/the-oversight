#!/usr/bin/env node
// test-social-r27-lapse-grammar-20261019.js -- PROOF TEST (journey-social r27).
// The lapse line ("a thread that lapsed got circled back to") composed its
// template as "It's been a while since we left {label} hanging. Glad we
// circled back." — assuming the thread label is a noun phrase. A clause
// label ("the last time you laughed", from convo-wants q_laugh_memory)
// produced the nonsense line "It's been a while since we left the last
// time you laughed hanging. Glad we circled back."
// (transcript-verified 2026-10-19, seed 2001 gossip-1-Ines.)
// The fix (conversation.js convoLapseLine): reframe to "It's been a while.
// Glad we circled back to {label}." — grammatical for any label shape.
// GREEN = the clause label composes into a grammatical line and the old
// broken composition is gone; noun-phrase labels still read fine.
// RED (pre-fix) = "we left the last time you laughed hanging".
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

function armLapse(Game, vid, label, tid) {
  const day = (Game.state.scholar || {}).day || 1;
  const c = Game.convoGet(vid) || {};
  const v = Game.state.village;
  v.topicLog = v.topicLog || {};
  const L = v.topicLog[vid] || (v.topicLog[vid] = { discussed: {}, open: [], lapsed: [] });
  L.lastLapsed = { tid: tid || 'wants', label, day, convo: c.count };
  return L;
}

async function main() {
  const { Game } = await loadGame({ seed: 777004, mode: 'lapse-grammar-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }
  Game.startConvo(vid);

  armLapse(Game, vid, 'the last time you laughed', 'wants');
  const clause = Game.convoLapseLine(vid);
  armLapse(Game, vid, 'their past', 'past');
  const noun = Game.convoLapseLine(vid);
  console.log('clause label:', clause);
  console.log('noun label:  ', noun);

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  // The transcript-caught breakage must be gone.
  if (clause && /left the last time you laughed hanging/i.test(clause)) fail('broken composition still present: ' + clause);
  // The clause label must land in a grammatical frame.
  if (clause && !/circled back to the last time you laughed/i.test(clause)) fail('clause label not framed grammatically: ' + clause);
  // Noun-phrase labels still read fine.
  if (noun && !/circled back to their past/i.test(noun)) fail('noun label regressed: ' + noun);
  // The lapse is consumed (fires once per thread/day — existing behavior).
  const again = Game.convoLapseLine(vid);
  if (again !== null) fail('lapse line did not consume after firing: ' + again);

  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — lapse line grammatical for any label');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
