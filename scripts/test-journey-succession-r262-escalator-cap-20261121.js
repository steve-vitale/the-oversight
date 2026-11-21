#!/usr/bin/env node
// test-journey-succession-r262-escalator-cap-20261121.js -- PROOF TEST (journey-succession r262, Arm 1).
// BLANK (panel-caught, r260): the M12-native NO-GO on ONE sitting (Ines,
// seed 45787, D-talk-request, day 27): the driver pressed "Forage this
// patch together" 7x in one outing sitting and the favor-requirements
// escalator served As I said -> Like I said -> Still the same thing ->
// "I've told you three times now" -> "We're going in circles" -> "three
// times now" AGAIN -> "circles" AGAIN -> "three times now" a THIRD time.
// Mechanism (src/js/convo-dialogue.js): the r35/r180 spend-out fires the
// circles exit and then RESETS _favorReqEscalations to 0, so the next
// repeat re-serves the escalation and the cycle repeats as long as the
// player keeps pressing (the spend only drops dlg:favor_requirements
// from the menu; the outing action re-enters the same path). The count
// in the line is a lie the second time it serves.
// FIX (r262): per-sitting, per-block-reason latch
// c._favorReqCirclesServed[escKey]. Once the circles exit has fired for
// an escKey, every further repeat for that key serves the circles line
// (and re-spends the choice), never "three times now" again. A new block
// reason re-arms honestly (fresh escKey); a fresh sitting resets the
// latch with the convo object. "Three times now" max 1 per sitting per
// key — the r260 M12-native bar shape.
// This test drives the REAL turn dispatch (Game.convoTurn) with the
// r195 staging (door-blocked food_share favor, seed 777036, all pool
// variants pre-marked said), 8 presses — past the 5-press horizon the
// r195 test covers. Assertions read the transcript's door lines.
// GREEN: 8 transcript door lines; "three times now" exactly once (4th);
// lines 5-8 all "going in circles"; spent['dlg:favor_requirements']
// true after press 5 and still true after press 8; fresh sitting resets
// counters + latch.
// RED (pre-fix): three-times 3x (presses 4, 6, 8), circles 2x (5, 7);
// the 6th and 8th lines re-serve the escalation.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777036, mode: 'escalator-cap-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // Door-block staging (r189 wild case, r195 harness): scholar OUTSIDE
  // the Haven hall, villager INSIDE — same node and tile, adjacent, so
  // the door-side mismatch is the block that fires (reasonKey
  // 'favorblock').
  const s0 = Game.state.scholar, v0 = Game.state.village;
  s0.mx = 4; s0.my = 4; s0.insideHaven = false;
  v0.px = 4; v0.py = 4; Game.map.px = 4; Game.map.py = 4;
  v0.nodePos = v0.nodePos || {}; v0.nodePos[vid] = { nx: 4, ny: 4 };
  v0.positions = v0.positions || {}; v0.positions[vid] = { mx: 4, my: 4 };
  v0.npcInside = v0.npcInside || {}; v0.npcInside[vid] = true;
  v0.away = v0.away || {}; delete v0.away[vid];
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Staged blocked favor: food_share, asked — the door check fires
  // before the kind-specific gates, so any asked favor blocks here.
  c.want = { id: 'ask_favor', stage: 2, favor: { id: 'f-req', vid, kind: 'food_share', state: 'asked' } };
  // Wild precondition: the block was already explained in an earlier
  // sitting, so every variant is marked said and the first ask reframes.
  const pool = Game.convoFavorBlockPool();
  c._favorReqSaid = {};
  for (const v of pool) c._favorReqSaid[v] = true;

  for (let i = 0; i < 8; i++) {
    const r = safe(() => Game.convoTurn(vid, 'dlg:favor_requirements'), null);
    console.log(`req ${i + 1} return:`, String(r && r.line ? r.line : r).slice(0, 80));
  }

  // Transcript door lines: the player-visible requirement lines.
  const CORE = 'Haven door';
  const reqLines = (Game.convoGet(vid).transcript || [])
    .filter(e => e && (e.who === 'them' || e.who === 'NPC') && String(e.text || '').includes(CORE))
    .map(e => String(e.text));
  console.log('transcript door lines: ' + reqLines.length);
  reqLines.forEach((l, i) => console.log(`  t${i + 1}:`, l.slice(0, 110)));
  if (reqLines.length !== 8) fail('expected 8 transcript door lines, got ' + reqLines.length);
  const threeTimes = reqLines.filter(l => /three times now/i.test(l));
  if (threeTimes.length !== 1) fail('expected the "three times" escalation exactly once in 8 presses, got ' + threeTimes.length);
  if (reqLines[3] && !/three times now/i.test(reqLines[3])) fail('4th door line should be the honest escalation: ' + (reqLines[3] || '').slice(0, 70));
  for (let i = 4; i < 8; i++) {
    if (reqLines[i] && /three times now/i.test(reqLines[i])) fail(`door line ${i + 1} re-serves the escalation after the cap: ` + reqLines[i].slice(0, 70));
    if (reqLines[i] && !/going in circles/i.test(reqLines[i])) fail(`door line ${i + 1} should be the capped circles exit: ` + (reqLines[i] || '').slice(0, 70));
  }
  // The pre-cap lines are distinct reframes, not a verbatim repeat.
  const seen = new Set();
  reqLines.slice(0, 5).forEach((l, i) => {
    if (seen.has(l)) fail(`transcript door line ${i + 1} repeats a verbatim line: ${l.slice(0, 70)}`);
    seen.add(l);
  });

  // Spend-out: the exit press writes the ledger — the menu drops the choice,
  // and it stays spent through the capped presses.
  const spent = (Game.convoGet(vid).spent || {})['dlg:favor_requirements'];
  console.log('spent[dlg:favor_requirements] after 8 presses:', !!spent);
  if (!spent) fail('capped presses did not keep dlg:favor_requirements spent');

  // Fresh sitting: per-sitting counters + latch reset.
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  if ((c2._favorReqReframes || 0) !== 0 || (c2._favorReqEscalations || 0) !== 0) {
    fail('favor-req counters leaked across sittings');
  }
  if (c2._favorReqCirclesServed && Object.keys(c2._favorReqCirclesServed).length) {
    fail('favor-req circles latch leaked across sittings');
  }
  Game.endConvo(vid, 'left');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — favor-requirements escalator caps at "circles" instead of cycling back to "three times now"');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
