#!/usr/bin/env node
// test-social-r35-favorreq-spendout-20261020.js -- PROOF TEST (journey-social r35).
// BLANK (transcript-caught, pilot r35): the r21 favor-requirements reframe
// pool has NO cap — asking "why can't I do this now?" back-to-back served
// the reframes, then parroted the escalation "I've told you three times
// now — ..." verbatim x5+ in one sitting (s3204 d49 Misky t4-t8, d132
// Farid). The r31 recap failure mode recurring: the reframe became the
// repeat (r31 fixed recap with a spend-out; favor_requirements never got it).
// FIX (src/js/convo-dialogue.js): once the escalation is itself re-served
// for the same raw requirements line, the choice spends out of the menu for
// this sitting via convoSpendChoice(vid, 'dlg:favor_requirements') — the
// same per-sitting discipline as the recap/dlg:help spend-outs. Keyed on the
// raw line: a state change (new rawReq) re-arms honestly. Counters reset per
// sitting (conversation.js reset block).
// This test drives the REAL turn dispatch (Game.convoTurn) with a staged
// blocked food_share favor (empty player pack -> deterministic blocker).
// GREEN: picks 1-5 never repeat a line verbatim; after the escalation is
// re-served, spent['dlg:favor_requirements'] is true (menu drops the choice).
// RED (pre-fix): pick 5 and pick 6 serve the identical escalation verbatim,
// and the spent ledger is never written.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 777036, mode: 'favorreq-spendout-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Staged blocked favor: food_share, asked, empty player pack -> the
  // deterministic "You need edible, unspoiled food in your pack..." blocker.
  c.want = { id: 'ask_favor', stage: 2, favor: { id: 'f-req', vid, kind: 'food_share', state: 'asked' } };
  try { Game.state.scholar.pack = []; } catch (e) {}

  const lines = [];
  for (let i = 0; i < 6; i++) {
    const r = safe(() => Game.convoTurn(vid, 'dlg:favor_requirements'), null);
    const line = r && r.line ? String(r.line) : String(r);
    lines.push(line);
    console.log(`req ${i + 1}:`, line.slice(0, 90));
  }

  // Reframe discipline: first five firings never repeat verbatim.
  const seen = new Set();
  lines.slice(0, 5).forEach((l, i) => {
    if (seen.has(l)) fail(`req ${i + 1} repeats a verbatim line: ${l.slice(0, 60)}`);
    seen.add(l);
  });
  // The escalation names the repetition honestly (r21).
  if (!/three times now/i.test(lines[4])) fail('5th firing should be the honest escalation: ' + lines[4].slice(0, 60));

  // Spend-out: the turn that re-serves the escalation writes the ledger — the
  // menu (pre-existing spent filter, r31-proven) drops the choice next turn.
  // The 6th firing still voices the escalation; the 7th can never be offered.
  const spent = (Game.convoGet(vid).spent || {})['dlg:favor_requirements'];
  console.log('spent[dlg:favor_requirements] after escalation re-serve:', !!spent);
  if (!spent) fail('escalation re-serve did not spend dlg:favor_requirements (menu will keep parroting)');

  // Fresh sitting: per-sitting counters reset.
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  const c2 = Game.convoGet(vid);
  if ((c2._favorReqReframes || 0) !== 0 || (c2._favorReqEscalations || 0) !== 0) {
    fail('favor-req counters leaked across sittings');
  }
  Game.endConvo(vid, 'left');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — favor-requirements spends out after the escalation');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
