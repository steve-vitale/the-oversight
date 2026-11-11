#!/usr/bin/env node
// test-journey-social-r180-favorreq-exit.js -- PROOF TEST (journey-social r180).
// BLANK (panel-caught, r180): the r35 favor-requirements spend-out fires
// ONE PRESS LATE — the press that re-serves the escalation still voices
// the byte-identical "I've told you three times now — ..." line (Devon
// 43601 d40/d45: presses 5-6 identical, 12 occurrences panel-wide), and
// only then spends the choice. The recap handler solved this class in
// R31/audit #6 the other way: a real person stops answering, they don't
// find a fourth synonym — the re-serve press voices the honest exit
// instead of the repeat.
// FIX (src/js/convo-dialogue.js): when the escalation is about to be
// re-served for the same raw requirements line (escalations >= 2), the
// press voices "We're going in circles — <rawReq> Ask me something else
// if you want." and spends dlg:favor_requirements — the recap spend-out
// shape. Presses 1-5 are unchanged (three reframes, then the escalation
// once); the spend still fires on the same press; a state change (new
// rawReq) still re-arms honestly.
// This test drives the REAL turn dispatch (Game.convoTurn) with a staged
// blocked food_share favor (adjacent scholar, empty pack AND inventory ->
// the deterministic food blocker), the r35 harness (seed 777036).
// The repeat is visible in the TRANSCRIPT, not the press-6 return value:
// the sitting winds down on press 6, so convoTurn returns the wind-down
// line while the escalation repeat is already spoken into the transcript.
// Assertions therefore read the transcript's requirement lines (the stable
// food core), not the return values.
// GREEN: the six transcript requirement lines never repeat verbatim;
// line 5 is the escalation; line 6 is the exit (not the escalation);
// spent['dlg:favor_requirements'] is true after press 6; counters reset
// on a fresh sitting.
// RED (pre-fix): transcript lines 5 and 6 are the byte-identical escalation.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777036, mode: 'favorreq-exit-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // Adjacency (r180): the r130 favour-block rotation rotates the
  // partner-block line, so a non-adjacent scholar never sees a stable raw
  // line and the escalation never accumulates. Same tile, node, door side.
  const s0 = Game.state.scholar, v0 = Game.state.village;
  s0.mx = 4; s0.my = 4; s0.insideHaven = false;
  v0.px = 4; v0.py = 4; Game.map.px = 4; Game.map.py = 4;
  v0.nodePos = v0.nodePos || {}; v0.nodePos[vid] = { nx: 4, ny: 4 };
  v0.positions = v0.positions || {}; v0.positions[vid] = { mx: 4, my: 4 };
  v0.npcInside = v0.npcInside || {}; v0.npcInside[vid] = false;
  v0.away = v0.away || {}; delete v0.away[vid];
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Staged blocked favor: food_share, asked, empty pack AND inventory
  // (giveFoodOptions reads scholar.inventory) -> the deterministic food
  // blocker, the Devon wild case verbatim.
  c.want = { id: 'ask_favor', stage: 2, favor: { id: 'f-req', vid, kind: 'food_share', state: 'asked' } };
  try { Game.state.scholar.pack = []; Game.state.scholar.inventory = []; } catch (e) {}

  for (let i = 0; i < 6; i++) {
    const r = safe(() => Game.convoTurn(vid, 'dlg:favor_requirements'), null);
    console.log(`req ${i + 1} return:`, String(r && r.line ? r.line : r).slice(0, 80));
  }

  // Transcript requirement lines: the stable food core, as the player saw it.
  const CORE = 'You need edible, unspoiled food';
  const reqLines = (Game.convoGet(vid).transcript || [])
    .filter(e => e && (e.who === 'them' || e.who === 'NPC') && String(e.text || '').includes(CORE))
    .map(e => String(e.text));
  console.log('transcript requirement lines: ' + reqLines.length);
  reqLines.forEach((l, i) => console.log(`  t${i + 1}:`, l.slice(0, 100)));
  if (reqLines.length !== 6) fail('expected 6 transcript requirement lines, got ' + reqLines.length);
  const seen = new Set();
  reqLines.forEach((l, i) => {
    if (seen.has(l)) fail(`transcript requirement line ${i + 1} repeats a verbatim line: ${l.slice(0, 70)}`);
    seen.add(l);
  });
  if (reqLines[4] && !/three times now/i.test(reqLines[4])) fail('5th requirement line should be the honest escalation: ' + (reqLines[4] || '').slice(0, 70));
  if (reqLines[5] && /three times now/i.test(reqLines[5])) fail('6th requirement line still voices the escalation repeat: ' + reqLines[5].slice(0, 70));
  if (reqLines[5] && !/going in circles/i.test(reqLines[5])) fail('6th requirement line should be the honest exit: ' + (reqLines[5] || '').slice(0, 70));

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

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — favor-requirements exits instead of re-serving the escalation');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
