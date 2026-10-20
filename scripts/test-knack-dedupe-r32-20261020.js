#!/usr/bin/env node
// PROOF TEST: knack gossip ("people talk about each other") never re-serves
// the same target twice in one sitting (journey landing r32 2026-10-20).
//
// The walk-down dedupes LEDGER gossip per sitting (r28/r31), but the
// "people talk about each other" branch (askAbout, game.js) had no dedupe:
// r32 pilot, seed 205 day 4 — Nora's iron_stomach knack served at turns 2,
// 3 AND 6 of one conversation. The player hears a parrot.
//
// FIX (src/js/game.js, askAbout): filter the knack-target pool by the
// sitting's skipSigs ('about:'+id, the same sigs convoGossipBeat records).
// When every target is served, fall through to the walk-down.
//
// RED (pre-fix, verified via the patch-file recipe in the header): the
//   second askAbout re-serves the same target -> FAIL.
// GREEN (fixed): the second serve picks a different target.
// RED recipe (no stash — repo-global stack): git diff src/js/game.js >
//   /tmp/knackdedupe.patch && git checkout HEAD -- src/js/game.js &&
//   node scripts/test-knack-dedupe-r32-20261020.js (expect FAIL) &&
//   git apply /tmp/knackdedupe.patch &&
//   node scripts/test-knack-dedupe-r32-20261020.js (expect PASS)
//
// Usage: node scripts/test-knack-dedupe-r32-20261020.js
// (uses scripts/sim-harness.js loadGame — seeded RNG before eval, per repo
// rules; never two harnesses in one process)

const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + '  <--'); }
}

async function main() {
  await loadGame({ seed: 777, mode: 'probe' });
  const Game = globalThis.Scattering.Game;
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  const scholar = Game.generatedRoster[0].id;
  Game.newGame('Columbus, Ohio', null, scholar);
  Game.depart();

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const L = roster[0];
  const T1 = roster[1], T2 = roster[2];
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[L] = 30;

  // Deterministic knack branch: stub npcGossipAbout to always have a line,
  // force Math.random so the 50% coin flip always fires and pool[0] picks.
  const realNga = Game.npcGossipAbout;
  const realRandom = Math.random;
  Game.npcGossipAbout = (vid, target) => ({ line: `"${target} has a knack, they say."`, target });
  Math.random = () => 0.1;
  const said = [];
  const ask = (skipSigs) => {
    said.length = 0;
    const origSay = Game.say;
    Game.say = (x) => { said.push(String(x)); };
    let res = null;
    try { res = Game.askAbout(L, 'gossip', { inConvo: true, skipSigs }); }
    finally { Game.say = origSay; }
    return res;
  };
  try {
    // Sitting, beat 1: serves some target (pool[0] — the interviewed bias
    // may reorder, so capture the ACTUAL sig rather than assuming roster
    // order).
    const r1 = ask([]);
    const sig1 = r1 && r1.gossipSig;
    ok(sig1 && sig1.indexOf('about:') === 0,
      `first knack serve targets someone (sig=${sig1})`);
    // Sitting, beat 2 (sig1 already served this sitting): must NOT re-serve
    // the same target.
    const r2 = ask([sig1]);
    const sig2 = r2 && r2.gossipSig;
    ok(sig2 !== sig1,
      `second knack serve is not the same target again (sig1=${sig1} sig2=${sig2})`);
    ok(sig2 && sig2.indexOf('about:') === 0,
      `second knack serve moves to another target (sig=${sig2})`);
    // Sitting, beat 3 (all others served): falls through, never repeats.
    const allButL = roster.filter(id => id !== L).map(id => 'about:' + id);
    const r3 = ask(allButL);
    const sig3 = r3 && r3.gossipSig;
    ok(sig3 !== sig1 && sig3 !== sig2,
      `exhausted pool never re-serves (sig=${sig3})`);
  } finally {
    Game.npcGossipAbout = realNga;
    Math.random = realRandom;
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROBE ERROR', e); process.exit(2); });
