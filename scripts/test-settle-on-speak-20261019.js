#!/usr/bin/env node
// test-settle-on-speak-20261019.js — proof for the r28 Henriette fix.
// BUG (journey-succession r28, seed 8303): the repay want's opener flipped
// favor.state fulfilled->'thanked' as a SIDE EFFECT of computing the
// gratitude line — before the no-repeat ledger check. A ledger-blocked
// gratitude fell through to another opener with the state already flipped:
// the ledger said 'thanked' while the NPC never spoke the line.
// FIX: settle-on-speak — the opener records the pending settle on
// c.want._favorSettle; favorSettleOnSurfaced applies it only when the line
// actually speaks; favorSettleReplant replants the repay seed at resolve if
// the line was blocked.
// RED: on pre-fix code, test 1 fails (state flips despite the block).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function seedRepay(Game, vid, favorId) {
  const v = Game.state.village;
  v.convoSeeds = v.convoSeeds || {};
  v.convoSeeds[vid] = { wantId: 'repay', favorId, note: 'this wound you promised', plantedDay: 1 };
}

// Deterministic voice: the voiced line is always exactly the raw line, so a
// pre-pushed ledger entry blocks (or not) deterministically.
function fixedVoice(Game) {
  Game.voiceLine = function (vid, line) { return line; };
}

async function newWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-settle-on-speak' });
  await setupGame(Game);
  const v = Game.state.village;
  const vid = v.roster[1];
  const favor = { id: 't-f1', vid, kind: 'heal_help', short: 'this wound', state: 'fulfilled', deadline: 999 };
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = favor;
  return { Game, vid, favor };
}

function transcriptHas(transcript, re) {
  return transcript.some(t => re.test(String(t.text || '')));
}

async function main() {
  // TEST 1 (the bug): blocked gratitude must NOT flip the state, and the
  // repay seed must be replanted at resolve.
  {
    const { Game, vid, favor } = await newWorld(101);
    fixedVoice(Game);
    seedRepay(Game, vid, favor.id);
    const line = '"You came through on this wound. I won\'t forget it."';
    Game.convoRunLedger().push(line); // exact voiced string, as if spoken recently
    Game.startConvo(vid);
    const cc = Game.convoGet(vid);
    const said = transcriptHas(cc.transcript || [], /You came through on/);
    ok('blocked: gratitude not spoken', !said);
    ok('blocked: state stays fulfilled (no silent settle)', favor.state === 'fulfilled', 'state=' + favor.state);
    Game.endConvo(vid, 'left');
    const seed = (Game.state.village.convoSeeds || {})[vid];
    ok('blocked: repay seed replanted at resolve', !!(seed && seed.wantId === 'repay' && seed.favorId === favor.id),
      'seed=' + JSON.stringify(seed));
  }
  // TEST 2 (normal path): unblocked gratitude speaks and settles.
  {
    const { Game, vid, favor } = await newWorld(202);
    seedRepay(Game, vid, favor.id);
    Game.startConvo(vid);
    const cc = Game.convoGet(vid);
    const said = transcriptHas(cc.transcript || [], /You came through on/);
    ok('unblocked: gratitude spoken', said);
    ok('unblocked: state thanked', favor.state === 'thanked', 'state=' + favor.state);
    Game.endConvo(vid, 'left');
    const seed = (Game.state.village.convoSeeds || {})[vid];
    ok('unblocked: seed consumed (business closed)', !seed, 'seed=' + JSON.stringify(seed));
  }
  // TEST 3: broken -> acknowledged on speak.
  {
    const { Game, vid, favor } = await newWorld(303);
    favor.state = 'broken';
    seedRepay(Game, vid, favor.id);
    Game.startConvo(vid);
    const cc = Game.convoGet(vid);
    const said = transcriptHas(cc.transcript || [], /You said you'd help with/);
    ok('broken: acknowledgment spoken', said);
    ok('broken: state acknowledged', favor.state === 'acknowledged', 'state=' + favor.state);
    Game.endConvo(vid, 'left');
  }
  // TEST 4: blocked broken -> seed replanted, state stays broken.
  {
    const { Game, vid, favor } = await newWorld(404);
    fixedVoice(Game);
    favor.state = 'broken';
    seedRepay(Game, vid, favor.id);
    Game.convoRunLedger().push('"You said you\'d help with this wound. ...It\'s done now. Forget it."');
    Game.startConvo(vid);
    const cc = Game.convoGet(vid);
    const said = transcriptHas(cc.transcript || [], /You said you'd help with/);
    ok('blocked broken: acknowledgment not spoken', !said);
    ok('blocked broken: state stays broken', favor.state === 'broken', 'state=' + favor.state);
    Game.endConvo(vid, 'left');
    const seed = (Game.state.village.convoSeeds || {})[vid];
    ok('blocked broken: repay seed replanted', !!(seed && seed.wantId === 'repay'), 'seed=' + JSON.stringify(seed));
  }
  // TEST 5: ask_favor follow-up path (convoFavorFollowup) also settles on speak.
  {
    const { Game, vid, favor } = await newWorld(505);
    Game.state.village.convoSeeds = Game.state.village.convoSeeds || {};
    Game.state.village.convoSeeds[vid] = { wantId: 'ask_favor', favorId: favor.id, note: 'the help I asked you for', plantedDay: 1 };
    Game.startConvo(vid);
    const cc = Game.convoGet(vid);
    const said = transcriptHas(cc.transcript || [], /You came through on/);
    ok('ask_favor followup: gratitude spoken', said);
    ok('ask_favor followup: state thanked', favor.state === 'thanked', 'state=' + favor.state);
    Game.endConvo(vid, 'left');
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
