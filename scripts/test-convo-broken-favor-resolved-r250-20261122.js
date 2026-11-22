#!/usr/bin/env node
// test-convo-broken-favor-resolved-r250-20261122.js — PROOF (journey-scale r250):
// A broken favor whose need resolves without the player is voided with no
// account of how it resolved.
//
// BEFORE (wild evidence — journey-scale r250, seed 106261, Daniyar):
// the player promises the creek water run d120 ("I'll come back to help."
// -> "Dawn, then. Bring something to carry — and thank you."). The promise
// breaks (deadline passes). d128 the NPC names it honestly: "About the
// creek water run — still open. That promise is dead, but the need isn't."
// (the cistern was dry d128). d129, water having arrived overnight, the
// same NPC says: "You said you'd help with the creek water run. ...It's
// done now. Forget it." — open -> done in one day with nothing in between
// the player saw, and no word on HOW it got done. The r240 false-settlement
// guard fixed the live-need case ("don't call a live need done"); the
// dead-need case still collapses "need met" and "promise settled" into one
// flat "done".
//
// AFTER (the fix, convo-wants.js): the broken+not-live branches name the
// resolution as outside the player — "The run got done without you." when
// the outing completed, "It's handled now, not by you." when the need
// simply passed — and the promise stays broken (the settle to
// 'acknowledged' still records, as before: the NEED is gone, the PROMISE
// stays broken). Four spots share the phrase family: repay opener,
// repay staleOpener, repay engageBeat, convoFavorFollowup.
//
// FIXTURE NOTES: one fresh game per part (a stated opener in one part
// must not run-ledger-block the next, and the opener settles broken ->
// 'acknowledged' on speak via repay.onSurfaced). Parts B/C/D/F stage the
// d129 shape (run returned + water plentiful); Part E stages the
// metric-crossed shape (no run + water plentiful); Part A is the r240
// live-need regression guard (run absent + water low -> the "still open"
// line must be unchanged). Seeds: 5001–5006.
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-broken-favor-resolved-r250' });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  return { Game, living };
}

function firstLiving(Game, living) {
  return living[0];
}

// Plant a BROKEN creek-water favor with a known short. waterRun null ->
// no outing object (metric decides liveness); {returned:true} -> the
// outing completed without the player (d129 shape).
function plantBrokenFavor(Game, vid, waterRun) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  const f = { id: 'favor-' + vid + '-test', vid, kind: 'water_haul', state: 'broken', short: 'the creek water run' };
  if (waterRun !== undefined) f.waterRun = waterRun;
  v.favorLedger[vid] = f;
  return f;
}

function setWater(Game, clean) {
  const v = Game.state.village;
  v.water = v.water || {};
  v.water.clean = clean;
}

(async () => {
  // --- Part A (regression guard for r240): need LIVE -> the "still open"
  // line is unchanged by this fix.
  {
    const { Game, living } = await freshGame(5001);
    const vid = firstLiving(Game, living);
    check('A setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, undefined); // no run object
      setWater(Game, 2); // cistern near-dry: water_haul gate is water < 10
      check('A staged: need reads LIVE', Game.convoFavorNeedLive(favor) === true,
        'live=' + Game.convoFavorNeedLive(favor));
      const r = Game.startConvo(vid);
      const c = Game.convoGet(vid);
      const line = (r && r.line) || '';
      check('A1 want is repay', c && c.want && c.want.id === 'repay', 'want=' + (c && c.want && c.want.id));
      check('A2 live need: opener says "still open — but that promise is dead"',
        line.includes("It's still open") && line.includes('that promise is dead'), 'line=' + JSON.stringify(line));
      check('A3 live need: opener does NOT void it as done', !/done now/i.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(vid, 'done');
    }
  }

  // --- Part B (core, fail-before/pass-after): run returned + water
  // plentiful -> the opener must name the resolution, not void it.
  {
    const { Game, living } = await freshGame(5002);
    const vid = firstLiving(Game, living);
    check('B setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, { returned: true });
      setWater(Game, 50);
      check('B staged: need reads NOT live', Game.convoFavorNeedLive(favor) === false,
        'live=' + Game.convoFavorNeedLive(favor));
      const r = Game.startConvo(vid);
      const c = Game.convoGet(vid);
      const line = (r && r.line) || '';
      check('B1 want is repay', c && c.want && c.want.id === 'repay', 'want=' + (c && c.want && c.want.id));
      check('B2 resolved run: opener names it done WITHOUT the player',
        /got done without you/i.test(line), 'line=' + JSON.stringify(line));
      check('B3 resolved run: opener does NOT say flat "It\'s done now"',
        !/It's done now/i.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(vid, 'done');
    }
  }

  // --- Part C: staleOpener, same staging as B (direct call; the stale
  // opener is the d128 line's path when the fresh opener is blocked).
  {
    const { Game, living } = await freshGame(5003);
    const vid = firstLiving(Game, living);
    check('C setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, { returned: true });
      setWater(Game, 50);
      check('C staged: need reads NOT live', Game.convoFavorNeedLive(favor) === false,
        'live=' + Game.convoFavorNeedLive(favor));
      const sel = Game.convoSelectWant(vid);
      check('C staged: repay selected', sel && sel.id === 'repay', 'want=' + (sel && sel.id));
      const c = Game.convoGet(vid);
      c.want = sel; c.want.favor = favor;
      const line = sel.def.staleOpener.call(Game, vid) || '';
      check('C1 stale opener names the resolution without the player',
        /got done without you|handled now, not by you/i.test(line), 'line=' + JSON.stringify(line));
      check('C2 stale opener does NOT say flat "it\'s done now"',
        !/it's done now/i.test(line), 'line=' + JSON.stringify(line));
    }
  }

  // --- Part D: convoFavorFollowup, same staging as B.
  {
    const { Game, living } = await freshGame(5004);
    const vid = firstLiving(Game, living);
    check('D setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, { returned: true });
      setWater(Game, 50);
      check('D staged: need reads NOT live', Game.convoFavorNeedLive(favor) === false,
        'live=' + Game.convoFavorNeedLive(favor));
      const line = Game.convoFavorFollowup(vid, favor) || '';
      check('D1 followup names the resolution without the player',
        /got done without you|handled now, not by you/i.test(line), 'line=' + JSON.stringify(line));
      check('D2 followup does NOT say flat "It\'s done now"',
        !/It's done now/i.test(line), 'line=' + JSON.stringify(line));
    }
  }

  // --- Part E: metric-crossed shape (no run object, water plentiful) ->
  // the handled-not-by-you line, not the run line.
  {
    const { Game, living } = await freshGame(5005);
    const vid = firstLiving(Game, living);
    check('E setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, undefined); // no run object
      setWater(Game, 50);
      check('E staged: need reads NOT live', Game.convoFavorNeedLive(favor) === false,
        'live=' + Game.convoFavorNeedLive(favor));
      const r = Game.startConvo(vid);
      const c = Game.convoGet(vid);
      const line = (r && r.line) || '';
      check('E1 want is repay', c && c.want && c.want.id === 'repay', 'want=' + (c && c.want && c.want.id));
      check('E2 need passed: opener says handled, not by the player',
        /handled now, not by you/i.test(line), 'line=' + JSON.stringify(line));
      check('E3 need passed: opener does NOT claim the run got done',
        !/got done without you/i.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(vid, 'done');
    }
  }

  // --- Part F: repay engageBeat (dlg:help), same staging as B.
  {
    const { Game, living } = await freshGame(5006);
    const vid = firstLiving(Game, living);
    check('F setup: living villager exists', !!vid, 'vid=' + vid);
    if (vid) {
      const favor = plantBrokenFavor(Game, vid, { returned: true });
      setWater(Game, 50);
      check('F staged: need reads NOT live', Game.convoFavorNeedLive(favor) === false,
        'live=' + Game.convoFavorNeedLive(favor));
      const sel = Game.convoSelectWant(vid);
      check('F staged: repay selected', sel && sel.id === 'repay', 'want=' + (sel && sel.id));
      const c = Game.convoGet(vid);
      c.want = sel; c.want.favor = favor;
      const line = sel.def.engageBeat.call(Game, vid) || '';
      check('F1 engageBeat names the resolution without the player',
        /got done without you|handled now, not by you/i.test(line), 'line=' + JSON.stringify(line));
      check('F2 engageBeat does NOT say flat "It\'s done now"',
        !/It's done now/i.test(line), 'line=' + JSON.stringify(line));
    }
  }

  console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'}: ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
