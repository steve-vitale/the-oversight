#!/usr/bin/env node
// test-journey-crisis-r85-investigate-cold.js -- PROOF TEST (Lane B crisis r85).
// Transcript-caught 2026-10-31, seed 9503 d9/d10: the bribery-investigate
// pick burned the 8-line dig pool twice as fast as designed, and past the
// pool it parroted the cold line verbatim with the choice still offered.
// Root cause (betrayal.js `investigate` act): investigateBribery speaks a
// miss line (pool advance #1, narration) and the handler then called
// bribeDigMissLine AGAIN for the beat (advance #2) — so beats showed
// pool[1], pool[3], pool[5], pool[7], cold, cold... and cold never spent
// the choice out, unlike the recap / favor-requirements spend-outs.
// GREEN = (A) three picks speak pool[0], pool[1], pool[2] in order with
// digMisses == 3 (one advance per pick); (B) a case already past the pool
// speaks cold once and the investigate choice leaves the next menu.
// RED (pre-fix) = beats pool[1], pool[3], pool[5] with digMisses == 6,
// and cold re-offered.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

function lastNpcLine(Game, vid, before) {
  const tr = safe(() => (Game.convoGet(vid) || {}).transcript || [], []);
  const fresh = tr.slice(before);
  for (let i = fresh.length - 1; i >= 0; i--) {
    if (fresh[i] && fresh[i].who !== 'you') return String(fresh[i].text || '');
  }
  return null;
}

async function main() {
  const { Game } = await loadGame({ seed: 777085, mode: 'investigate-cold-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  const vid = roster[0], acc = roster[1] || roster[0];
  const v = Game.state.village;
  v.betrayal = v.betrayal || {};
  v.betrayal.cases = v.betrayal.cases || [];
  // No bribes on the case, so every investigate pick misses.
  v.betrayal.cases.push({
    id: 'case_inv85', plotId: 'p_none', target: sid, status: 'open',
    accused: [acc], foundBribes: [], exposedBribes: [], bribes: [],
    belief: {}, evidence: [],
  });
  const cs = () => Game.getCase('case_inv85');

  Game.startConvo(vid);
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // (A) single advance: three picks, pool order, digMisses == 3.
  const beats = [];
  for (let i = 0; i < 3; i++) {
    const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
    Game.betrayalTurn(vid, 'betrayal:investigate:case_inv85');
    beats.push(lastNpcLine(Game, vid, before));
  }
  beats.forEach((l, i) => console.log(`pick ${i + 1}:`, l));
  console.log('digMisses after 3 picks:', cs().digMisses);
  if (cs().digMisses !== 3) fail(`digMisses should be 3 after 3 picks, got ${cs().digMisses}`);
  if (beats.some(l => !l)) fail('a pick produced no NPC beat line');
  if (beats[0] && beats[1] && beats[0] === beats[1]) fail('first two beats identical (pool skipping or repeat)');
  // The pool's first line names following food/gifts; the second watches who
  // eats with whom — order matters, not just distinctness.
  if (beats[0] && beats[0].indexOf('follow the food') === -1) fail('first beat is not pool[0] (follow the food)');
  if (beats[1] && beats[1].indexOf('eats with whom') === -1) fail('second beat is not pool[1] (eats with whom)');

  // (B) cold spend-out: exhaust the pool, then one more pick speaks cold
  // once and the investigate choice leaves the betrayal menu for this
  // sitting (convoSpendChoice is now honored by betrayalChoices — before
  // this run's fix it filtered nothing there, so a spent betrayal choice
  // would have stayed offered).
  cs().digMisses = 8;
  const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
  const res = Game.betrayalTurn(vid, 'betrayal:investigate:case_inv85');
  const coldBeat = lastNpcLine(Game, vid, before);
  console.log('cold beat:', coldBeat);
  if (!coldBeat || coldBeat.indexOf('trail is going cold') === -1) fail('exhausted pick did not speak the cold line');
  if (res && res.ended) fail('convo ended on the cold pick — menu assertion would be vacuous');
  const spent = (Game.convoGet(vid) || {}).spent || {};
  if (!spent['betrayal:investigate:case_inv85']) fail('cold pick did not spend the choice in the sitting ledger');
  const menu = safe(() => Game.betrayalChoices(vid) || [], []);
  if (menu.some(ch => ch && ch.id === 'betrayal:investigate:case_inv85')) {
    fail('investigate choice still offered after the cold line (no spend-out)');
  } else {
    console.log('[ok] investigate choice spent out after cold');
  }

  console.log(fails ? `RESULT: ${fails} FAILURE(S)` : 'RESULT: ALL PASS');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });
