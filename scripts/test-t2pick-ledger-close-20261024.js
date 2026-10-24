#!/usr/bin/env node
// test-t2pick-ledger-close-20261024.js — LEDGER-AWARE CLOSE READ proof
// (journey-social 2026-10-24 r47).
//
// Finding (r47 THE INVISIBLE FRIENDSHIP): NPC-NPC friendships form via the
// bond ledger (22-24 pairs at depth>=2 per full run) but t2gen_others
// 'close' reads only named frozen day-1 group mates — 31/34 served reads
// named pairs at ledger depth<=0, while 66 formed friendships were never
// nameable. The rival half surfaces (grievance lines); the friend half was
// a fossil.
//
// Fix (src/js/convoTopics.js t2pickOther, r47): prefer the deepest live
// ledger bond (depth>=2) for the 'close' read; fall back to groups when
// none exists. Grievance branches keep priority. Lines name no shared
// events (the ledger stores none) — no fabricated memories.
//
// Proves:
//   1. With a depth>=2 ledger bond, t2pickOther returns the bonded friend
//      (why='close'), not a group mate.
//   2. Deepest wins among several bonded pairs.
//   3. With no deep bonds, falls back to groups (why='close', group mate).
//   4. Grievance branches keep priority over the ledger close.
//   5. Dead/gone NPCs are never named.
// Usage: node scripts/test-t2pick-ledger-close-20261024.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name + (extra ? ' (' + extra + ')' : '')); }
}

function setDepth(Game, a, b, depth) {
  // drive v across the 25-multiples; the +6/day cap means advancing the day
  const v = Game.state.village;
  for (let i = 0; i < depth * 5; i++) {
    Game.state.scholar.day += 1;
    Game.bondAdd(a, b, 6, 'proof');
  }
  const bnd = Game.bondGet(a, b) || {};
  return bnd.depth || 0;
}

(async () => {
  const { Game } = await loadGame({ seed: 4343, mode: 'proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  ok(npcs.length >= 5, 'roster has NPCs', 'npcs=' + npcs.length);
  const vid = npcs[0], friend = npcs[1], friend2 = npcs[2], other = npcs[3];

  // ---- 3. fallback first (no bonds yet): neutral, NOT the group fallback ----
  // CONTRACT CHANGE (journey-social r49 2026-10-24, design change on
  // purpose): the groups fallback named first-group strangers with a
  // trust-claim (r49 wild proof: 8 speakers named Sergio at depth 0/1).
  // The r49 fix deleted it: no live bond -> neutral roster pick (honest
  // non-claim lines). The full new contract lives in
  // test-t2pick-fallback-livebond-20261024.js; this assertion keeps this
  // older proof green under the new contract.
  const pre = Game.t2pickOther(vid);
  ok(pre && pre.why === 'neutral', 'no bonds -> neutral (group fallback removed by r49)', JSON.stringify(pre && { id: pre.id, why: pre.why }));

  // ---- 1. ledger bond wins over the fossil group ----
  const d1 = setDepth(Game, vid, friend, 2);
  ok(d1 >= 2, 'bond driven to depth>=2', 'depth=' + d1);
  const post = Game.t2pickOther(vid);
  ok(post && post.id === friend && post.why === 'close', 'deepest ledger bond named, not a group mate',
    JSON.stringify(post && { id: post.id, why: post.why }));

  // ---- 2. deepest wins ----
  const d2 = setDepth(Game, vid, friend2, 3);
  ok(d2 >= 3, 'second bond driven deeper', 'depth=' + d2);
  const post2 = Game.t2pickOther(vid);
  ok(post2 && post2.id === friend2 && post2.why === 'close', 'deepest of several bonds wins',
    JSON.stringify(post2 && { id: post2.id, why: post2.why }));

  // ---- 4. grievance keeps priority over ledger close ----
  Game.recordGrievance(vid, other, 'ambushed', 30);
  const gp = Game.t2pickOther(vid);
  ok(gp && (gp.why === 'vgrievance' || gp.why === 'grievance') && gp.id === other,
    'grievance branch keeps priority over ledger close', JSON.stringify(gp && { id: gp.id, why: gp.why }));

  // ---- 5. dead NPCs never named ----
  const gp2 = Game.getPerson(friend2);
  if (gp2) gp2.dead = true;
  const dp = Game.t2pickOther(vid);
  ok(!dp || dp.id !== friend2, 'dead friend not named', JSON.stringify(dp && { id: dp.id, why: dp.why }));

  console.log(`\n${pass} passed, ${fail} failed.`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
