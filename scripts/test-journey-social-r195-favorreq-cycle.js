#!/usr/bin/env node
// test-journey-social-r195-favorreq-cycle.js -- PROOF TEST (journey-social r195).
// BLANK (panel-caught, r189): the r35 favor-requirements spend-out NEVER
// fires for the cycling Haven-door block. Worst sitting (43801,
// D-talk-request grace_obi, 10 turns): the driver asks "Why can't I do
// this now?" 7 times and the NPC serves the door instruction 7 times,
// the reframe stuck at "I've told you three times now —" for asks 4, 5,
// 6, 7 — the line LIES about the count and repeats. Mechanism: the r35
// spend-out keys its escalation counter on the RAW line
// (_favorReqLastRaw === rawReq), but the r130 cycle rotates the raw line
// every ask (four variants, convoPickCycle), so the counter resets every
// press and the escalation can never reach 2. Only stable-raw blocks
// (the food blocker) can trigger it — which is why the r180 proof test,
// staged on the food blocker, is green while the wild door case still
// repeats. The r180 test's own comment acknowledges the gap ("a
// non-adjacent scholar never sees a stable raw line and the escalation
// never accumulates").
// FIX (src/js/convo-dialogue.js): key the escalation on the block reason
// (status.reasonKey — 'favorblock' / 'favorpartner', stable per pool)
// with fallback to the raw line when reasonKey is absent (food and other
// stable blocks, preserving r180 behavior exactly). A state change (new
// block reason, new raw line) still re-arms honestly. The r180 test must
// stay green: its food blocker has no reasonKey, so the fallback keeps
// its exact behavior.
// This test drives the REAL turn dispatch (Game.convoTurn) with a staged
// door-blocked food_share favor (scholar outside, villager inside the
// Haven hall — the r189 wild case verbatim), the r35/r180 harness
// (seed 777036). The block is pre-explained: all four pool variants are
// marked said, the state _favorReqSaid carries across sittings
// (conversation.js: "they told you before") — exactly the wild
// precondition, where the first ask of the sitting already reframes.
// Assertions read the transcript's door lines, not the return values:
// the sitting winds down on the exit press, so convoTurn returns the
// wind-down line while the exit is already spoken into the transcript.
// GREEN: 5 presses -> 5 transcript door lines, never repeating the
// escalation; line 4 is the escalation; line 5 is the exit (not the
// escalation); spent['dlg:favor_requirements'] is true after press 5;
// counters reset on a fresh sitting.
// RED (pre-fix): transcript lines 4 and 5 are the byte-identical
// escalation ("I've told you three times now — ..." twice), no exit
// line, the choice never spends out.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777036, mode: 'favorreq-cycle-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // Door-block staging (r189 wild case): scholar OUTSIDE the Haven hall,
  // villager INSIDE — same node and tile, adjacent, so the door-side
  // mismatch is the block that fires (reasonKey 'favorblock').
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

  for (let i = 0; i < 5; i++) {
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
  if (reqLines.length !== 5) fail('expected 5 transcript door lines, got ' + reqLines.length);
  const threeTimes = reqLines.filter(l => /three times now/i.test(l));
  if (threeTimes.length !== 1) fail('expected the "three times" escalation exactly once, got ' + threeTimes.length);
  if (reqLines[3] && !/three times now/i.test(reqLines[3])) fail('4th door line should be the honest escalation: ' + (reqLines[3] || '').slice(0, 70));
  if (reqLines[4] && /three times now/i.test(reqLines[4])) fail('5th door line still voices the escalation repeat: ' + reqLines[4].slice(0, 70));
  if (reqLines[4] && !/going in circles/i.test(reqLines[4])) fail('5th door line should be the honest exit: ' + (reqLines[4] || '').slice(0, 70));
  const seen = new Set();
  reqLines.forEach((l, i) => {
    if (seen.has(l)) fail(`transcript door line ${i + 1} repeats a verbatim line: ${l.slice(0, 70)}`);
    seen.add(l);
  });

  // Spend-out: the exit press writes the ledger — the menu drops the choice.
  const spent = (Game.convoGet(vid).spent || {})['dlg:favor_requirements'];
  console.log('spent[dlg:favor_requirements] after exit:', !!spent);
  if (!spent) fail('exit press did not spend dlg:favor_requirements (menu will keep offering it)');

  // Fresh sitting: per-sitting counters reset.
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  if ((c2._favorReqReframes || 0) !== 0 || (c2._favorReqEscalations || 0) !== 0) {
    fail('favor-req counters leaked across sittings');
  }
  Game.endConvo(vid, 'left');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — favor-requirements exits under the door-block cycle instead of re-serving the escalation');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
