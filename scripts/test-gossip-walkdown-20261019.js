#!/usr/bin/env node
// test-gossip-walkdown-20261019.js — PROOF for journey landing r28:
// the r28-wild blank — repeated "tell me more" on a gossip thread
// re-served the SAME rumor verbatim. The salience-first picks in
// askAbout('gossip') always served heard[heard.length-1], so the
// transcript showed Rafael d11 (seed 101) hearing "Victor just walked
// away from Haven" THREE times in one sitting (near-dupe flagged).
// The fix: convoGossipBeat returns the gossip entry signature, the
// conversation accumulates served sigs (c.gossipServedSigs), and
// askAbout walks DOWN to the freshest UNSERVED item (skipSigs); when
// everything has been said the pool honestly dries out (the idle
// admission) instead of re-rendering.
//
// RED on the pre-fix code: beat2 === beat1 verbatim (and beat3 ===
// beat1). GREEN: three distinct gossip beats, then an honest dry
// admission. Seeded, deterministic.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 424243, mode: 'mvc' });
  setupGame(Game);

  let pass = 0, fail = 0;
  const t = (name, cond, extra) => {
    if (cond) { pass++; }
    else { fail++; console.log('  FAIL: ' + name + (extra ? ' :: ' + extra : '')); }
  };

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  t('roster has NPCs', roster.length >= 6);
  const vid = roster[0];
  const o1 = roster[1], o2 = roster[2], o3 = roster[3];
  // gossip needs rapport (effTrust>=20); the test grants it directly.
  v.trust = v.trust || {}; v.trust[vid] = 30;

  // Deterministic pool: knock out the two randomized side branches so the
  // engine-gossip walk-down is what's under test.
  Game.npcGossipAbout = () => null;
  Game.npcDark = () => null;

  // Three distinct rumors this NPC has heard — distinct partKeys so the
  // seeded dedupe can't collapse them.
  v.gossip = [
    { heard: [vid], dims: { who: o1 }, action: 'generous', distortion: 0, day: 1, partKey: 'wd1' },
    { heard: [vid], dims: { who: o2 }, action: 'departure', distortion: 0, day: 2, partKey: 'wd2' },
    { heard: [vid], dims: { who: o3, for: o1 }, action: 'rescue', distortion: 0, day: 3, partKey: 'wd3' },
  ];

  // Open the conversation and ask for gossip through the real menu path.
  let st = Game.startConvo(vid);
  t('startConvo opens', !!st && !!st.line);
  let choices = Game.convoChoices(vid) || [];
  const ans0 = choices.find(c => c && /^ans:/.test(c.id)) || choices.find(c => c && c.id === 'deflect_q');
  if (ans0) Game.convoTurn(vid, ans0.id);
  const g1 = Game.convoTurn(vid, 'ask:gossip');
  const line1 = String((g1 && g1.line) || '');
  t('ask:gossip delivers a line', line1.length > 10, line1.slice(0, 120));
  t('gossip thread set', Game.convoGet(vid).thread === 'gossip');
  console.log('  BEAT1: ' + line1.slice(0, 200));

  // Now the follow-up path: convoThreadBeat is what "tell me more" drives.
  const c = Game.convoGet(vid);
  c.thread = 'gossip'; c.depth = 1;
  const b2 = String(Game.convoThreadBeat(vid) || '');
  const b3 = String(Game.convoThreadBeat(vid) || '');
  const b4 = String(Game.convoThreadBeat(vid) || '');
  console.log('  BEAT2: ' + b2.slice(0, 200));
  console.log('  BEAT3: ' + b3.slice(0, 200));
  console.log('  BEAT4: ' + b4.slice(0, 200));

  // Salience order: the freshest rumor (rescue, o3) leads; the walk-down
  // then serves departure (o2) and generous (o1) — all distinct.
  t('beat1 leads with the freshest rumor', /ran into the treeline|treeline/.test(line1), line1.slice(0, 140));
  t('beat2 is a DIFFERENT rumor, not a repeat of beat1', b2.length > 10 && b2 !== line1,
    'beat2=' + b2.slice(0, 140));
  t('beat3 is a DIFFERENT rumor again', b3.length > 10 && b3 !== line1 && b3 !== b2,
    'beat3=' + b3.slice(0, 140));
  t('the three beats name three different villagers',
    [line1, b2, b3].some(x => x.includes(Game.displayName(o3).split(' ')[0])) &&
    [line1, b2, b3].some(x => x.includes(Game.displayName(o2).split(' ')[0])) &&
    [line1, b2, b3].some(x => x.includes(Game.displayName(o1).split(' ')[0])),
    [Game.displayName(o1), Game.displayName(o2), Game.displayName(o3)].join(' / '));

  // The pool is now exhausted: the honest dry admission, never a repeat.
  t('beat4 honestly declines instead of repeating', /quiet lately|nothing new|keeping to themselves/i.test(b4),
    b4.slice(0, 140));
  t('no served rumor was ever re-spoken', !/Victor just walked away.*Victor just walked away/i.test(b4));

  // The conversation records the served signatures (walk-down bookkeeping).
  const sigs = Game.convoGet(vid).gossipServedSigs || [];
  t('three distinct sigs recorded', sigs.length === 3 && new Set(sigs).size === 3,
    JSON.stringify(sigs));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
