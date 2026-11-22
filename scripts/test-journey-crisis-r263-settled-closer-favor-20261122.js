#!/usr/bin/env node
// test-journey-crisis-r263-settled-closer-favor-20261122.js — PROOF
// (journey-crisis r263, fix for the r262 C3b NO-GO / regression of r240).
//
// THE WILD FAILURE (r262 panel, seed 14594 d30, Fiona Wen): a broken
// heal_help favor — "You said you'd help with this wound. It's still
// open — but that promise is dead." — and the sitting's want was the
// REPAY of that favor, so the thread label was 'that debt', not 'that
// wound care'. The r201 favor-want gate in convoCloseLine anchors on
// the LEDGER favor via its label, so the label mismatch let the closer
// fire: "Good — that debt, settled. Feels better said out loud." —
// while the wound was still open and the village well fed (pantryPer
// d30 2256 kcal/person: hunger was not the live need).
//
// AFTER (the fix, conversation.js convoCloseLine): the gate anchors on
// the SITTING's favor (c.want.favor) when the sitting carries one —
// the want thread IS that favor's thread, whatever its label says —
// and falls back to the ledger-label match for favorless sittings, so
// a pending favor still never blocks an unrelated want thread (the
// r201 anchor protection). Same state rule in both anchors: a favor
// want is settled only when the favor is fulfilled / thanked.
//
// FIXTURE: a fresh game per part; a broken heal_help ledger favor with
// a live wound (v.health 40 < 60, so convoFavorNeedLive is true — the
// wild shape); the sitting's want set to the repay of that favor; the
// want thread planted ('that debt') and noted (lastClosed), with a real
// beat in the threadLog so the no-real-beat gate passes first.
// Part A is the fail-before/pass-after core. Exits nonzero on failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}

const BEAT = '"You said you\'d help with this wound. It\'s still open — but that promise is dead."';

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-settled-closer-favor-r263' });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  return { Game, living };
}

// Start a convo with the first living villager who takes one.
function stageConvo(Game, living) {
  for (const id of living) {
    try {
      const r = Game.startConvo(id);
      const c = Game.convoGet(id);
      if (c && c.count != null) return { vid: id, open: r, c };
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) { /* try the next villager */ }
  }
  return null;
}

function plantBrokenWoundFavor(Game, vid) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  v.health = v.health || {};
  v.health[vid] = 40; // wound still open: heal_help need live (< 60)
  const f = { id: 'favor-' + vid + '-test', vid, kind: 'heal_help', state: 'broken', short: 'this wound' };
  v.favorLedger[vid] = f;
  return f;
}

// Plant the want thread under `label` with a real beat, and resolve it
// so convoCloseLine has a lastClosed to judge.
function plantClosedWantThread(Game, vid, c, label) {
  Game.convoThreadOpen(vid, 'want', label, 'the sitting circled back to it', BEAT);
  Game.convoNoteTopic(vid, 'want', label);
  c.threadLog = c.threadLog || [];
  c.threadLog.push({ thread: 'want', snippet: BEAT });
}

(async () => {
  // --- Part A (core, fail-before/pass-after): broken favor + repay sitting
  // + 'that debt' label -> the closer must be WITHHELD.
  {
    const { Game, living } = await freshGame(6001);
    check('A setup: living villagers exist', living.length > 0, 'living=' + living.length);
    const st = stageConvo(Game, living);
    check('A staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      const favor = plantBrokenWoundFavor(Game, st.vid);
      check('A staged: the wound need is live (health 40 < 60)',
        Game.convoFavorNeedLive(favor) === true, 'live=' + Game.convoFavorNeedLive(favor));
      check('A staged: the ledger favor is the broken one',
        Game.convoGetFavor(st.vid) === favor, 'state=' + (Game.convoGetFavor(st.vid) || {}).state);
      st.c.want = { id: 'repay', favor }; // the sitting IS the favor's repay
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('A1 broken favor + repay sitting: no "settled" closer is served', line === null, 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part B (control): the SAME sitting with the favor fulfilled ->
  // the closer fires, naming the debt.
  {
    const { Game, living } = await freshGame(6002);
    const st = stageConvo(Game, living);
    check('B staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      const favor = plantBrokenWoundFavor(Game, st.vid);
      favor.state = 'fulfilled';
      st.c.want = { id: 'repay', favor };
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('B1 fulfilled favor: the settled closer fires',
        typeof line === 'string' && /that debt, settled/.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part C (r201 anchor guard): a favorless sitting (a visit, no
  // favor) while the ledger holds a broken wound favor with a live need
  // -> the visit thread still settles; the pending favor blocks nothing.
  {
    const { Game, living } = await freshGame(6003);
    const st = stageConvo(Game, living);
    check('C staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantBrokenWoundFavor(Game, st.vid);
      st.c.want = { id: 'just_company' }; // favorless want
      plantClosedWantThread(Game, st.vid, st.c, 'that visit');
      const line = Game.convoCloseLine(st.vid);
      check('C1 unrelated want thread settles despite the pending broken favor',
        typeof line === 'string' && /that visit, settled/.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part D (r201 regression guard): favorless sitting, ledger favor
  // broken, thread labeled by the favor ('that wound care') -> withheld,
  // exactly as the r201 gate already did.
  {
    const { Game, living } = await freshGame(6004);
    const st = stageConvo(Game, living);
    check('D staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantBrokenWoundFavor(Game, st.vid);
      st.c.want = { id: 'just_company' }; // favorless want
      plantClosedWantThread(Game, st.vid, st.c, 'that wound care');
      const line = Game.convoCloseLine(st.vid);
      check('D1 label-matched broken favor: no "settled" closer is served', line === null, 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'}: ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
