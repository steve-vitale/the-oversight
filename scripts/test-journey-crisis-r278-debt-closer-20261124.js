#!/usr/bin/env node
// test-journey-crisis-r278-debt-closer-20261124.js — PROOF
// (journey-crisis r278, FIX 4 for the r274 C3b fresh-band NO-GO).
//
// THE WILD FAILURE (r274 panel, seed 14603 d84, Raul Schumacher): a
// broken water_haul favor — "You said you'd help with the creek water
// run. It's still open — but that promise is dead." — and the sitting
// opened with a RESUME of the old favor thread, so the fresh want's
// opener never ran and c.want.favor was never set. The player picked
// "Don't worry about it" ("...Fine. But I don't like owing." — "The
// debt stays on their face."), the recap still said "Still on that
// debt.", and then the silence-ending closer declared "Good — that
// debt, settled. Feels better said out loud." — while the debt was
// explicitly still on their face.
//
// WHY THE r263 GATE MISSED IT: the sitting-favor anchor (r263) requires
// c.want.favor, which a resume-pre-empted sitting never carries, and
// the kind-label match fails because a repay sitting labels the debt
// 'that debt', not 'that water haul'. The gate never saw the broken
// favor. FIX 4 anchors on the LEDGER favor whenever the thread label
// is 'that debt' — the repay label IS the favor's debt label, so the
// broken/open favor blocks the "settled" line.
//
// FIXTURE: modeled on test-journey-crisis-r263-settled-closer-favor-
// 20261122.js, but staging the WILD shape — the sitting's want carries
// NO favor (the resume-pre-empted / stale-opener case the r263 test
// never staged). Part A is the fail-before/pass-after core.
// Exits nonzero on failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}

const BEAT = '"You said you\'d help with the creek water run. It\'s still open — but that promise is dead."';

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-debt-closer-r278' });
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

function plantBrokenWaterFavor(Game, vid) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  const f = { id: 'favor-' + vid + '-test', vid, kind: 'water_haul', state: 'broken', short: 'the creek water run' };
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
  // --- Part A (core, fail-before/pass-after): broken favor + FAVORLESS
  // sitting (resume pre-empted the want opener) + 'that debt' label ->
  // the closer must be WITHHELD.
  {
    const { Game, living } = await freshGame(6101);
    check('A setup: living villagers exist', living.length > 0, 'living=' + living.length);
    const st = stageConvo(Game, living);
    check('A staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      const favor = plantBrokenWaterFavor(Game, st.vid);
      check('A staged: the ledger favor is the broken one',
        Game.convoGetFavor(st.vid) === favor, 'state=' + (Game.convoGetFavor(st.vid) || {}).state);
      st.c.want = { id: 'just_company' }; // favorless: the resume pre-empted the want opener
      check('A staged: the sitting carries no favor', !st.c.want.favor, 'favor=' + JSON.stringify(st.c.want.favor));
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('A1 broken favor + favorless sitting + that-debt thread: no "settled" closer is served', line === null, 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part B (control): the SAME shape with the favor fulfilled ->
  // the closer fires, naming the debt.
  {
    const { Game, living } = await freshGame(6102);
    const st = stageConvo(Game, living);
    check('B staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      const favor = plantBrokenWaterFavor(Game, st.vid);
      favor.state = 'fulfilled';
      st.c.want = { id: 'just_company' };
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('B1 fulfilled favor: the settled closer fires',
        typeof line === 'string' && /that debt, settled/.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part C (r201 anchor guard): a favorless sitting (a visit, no
  // favor) while the ledger holds a broken water favor, thread labeled
  // 'that visit' -> the visit thread still settles; the pending favor
  // blocks nothing unrelated.
  {
    const { Game, living } = await freshGame(6103);
    const st = stageConvo(Game, living);
    check('C staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantBrokenWaterFavor(Game, st.vid);
      st.c.want = { id: 'just_company' }; // favorless want
      plantClosedWantThread(Game, st.vid, st.c, 'that visit');
      const line = Game.convoCloseLine(st.vid);
      check('C1 unrelated want thread settles despite the pending broken favor',
        typeof line === 'string' && /that visit, settled/.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part D (r263 regression guard): repay want CARRYING the favor
  // (the r263 shape) + broken favor + 'that debt' -> withheld, exactly
  // as the r263 gate already did.
  {
    const { Game, living } = await freshGame(6104);
    const st = stageConvo(Game, living);
    check('D staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      const favor = plantBrokenWaterFavor(Game, st.vid);
      st.c.want = { id: 'repay', favor };
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('D1 favor-carrying repay + broken favor: no "settled" closer is served', line === null, 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part E (wild variant): repay want WITHOUT the favor (stale-opener
  // path — the want IS repay but its opener never attached the favor) +
  // broken favor + 'that debt' -> withheld.
  {
    const { Game, living } = await freshGame(6105);
    const st = stageConvo(Game, living);
    check('E staged: a conversation started', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantBrokenWaterFavor(Game, st.vid);
      st.c.want = { id: 'repay' }; // repay want, favor never attached
      check('E staged: the sitting carries no favor', !st.c.want.favor, 'favor=' + JSON.stringify(st.c.want.favor));
      plantClosedWantThread(Game, st.vid, st.c, 'that debt');
      const line = Game.convoCloseLine(st.vid);
      check('E1 favorless repay + broken favor: no "settled" closer is served', line === null, 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'}: ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
