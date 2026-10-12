#!/usr/bin/env node
// test-convo-deflect-cycle-20261012-r6.js — PROOF for the journey-social r6 blank:
// the r5 fix (convoSelfRepeatLine cycling pool) had TWO holes that reintroduced
// the exact verbatim parrot it was built to kill — observed in r6 evidence
// (seed 222): 7-78 identical "I just said — did you miss it?" lines in a row.
//
// HOLE 1 (the big one): the pool's "past 9 uses -> canonical" cap. The counter
// lives on the persistent v.conv[vid] object and startConvo never reset it,
// so after 9 LIFETIME self-repeat calls the pool collapsed to the canonical
// line VERBATIM, forever. Instrumented sim: emma_larsen 78x, lena_ruiz 20x,
// gen_aplgycf 19x canonical in a single run.
// HOLE 2: convo-dialogue.js's dlg:details blocked-repeat branch still used the
// hardcoded line — a fourth call site the r5 fix missed.
//
// Fixes (this run):
//   1. convoSelfRepeatLine cycles FOREVER — no cap collapse. A spamming player
//      gets rotating honest brush-offs, which is what a real person does.
//   2. startConvo resets c.selfRepeatLines (true per-conversation pool, as documented).
//   3. sayLine accepts a FUNCTION fallback, invoked lazily only when the block
//      fires — eager evaluation burned a pool slot on every successful sayLine
//      and phase-shifted the cycle (first deflect showed variant1, not canonical).
//   4. betrayal.js finish + conversation.js turn tail pass thunks.
//   5. dlg:details blocked branch wired to convoSelfRepeatLine.
// Usage: node scripts/test-convo-deflect-cycle-20261012-r6.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const POOL0 = '"I just said — did you miss it?"';
const themLines = (Game, vid) =>
  Game.convoGet(vid).transcript.filter(e => e.who === 'them').map(e => String(e.text));

(async () => {
  const SEED = 20261012;
  const { Game } = await loadGame({ seed: SEED, mode: 'test-deflect-cycle-r6' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [v1, v2, v3] = vids;

  console.log('T1: pool cycles forever — 12 draws, no adjacent verbatim, no cap collapse');
  Game.startConvo(v1);
  const draws = [];
  for (let i = 0; i < 12; i++) draws.push(Game.convoSelfRepeatLine(v1));
  ok(draws[0] === POOL0, 'first draw is the canonical line', draws[0]);
  ok(new Set(draws.slice(0, 3)).size === 3, 'first three draws distinct', JSON.stringify(draws.slice(0, 3)));
  let adjacent = false;
  for (let i = 1; i < draws.length; i++) if (draws[i] === draws[i - 1]) adjacent = true;
  ok(!adjacent, 'no two adjacent draws identical across 12', JSON.stringify(draws.slice(6, 12)));
  ok(draws[9] !== POOL0 || draws[8] !== POOL0 || draws[10] !== POOL0, 'past old cap still cycles (no collapse)', draws.slice(8, 11).join(' | '));
  Game.endConvo(v1, 'left');

  console.log('T2: startConvo resets the pool (true per-conversation)');
  Game.startConvo(v1);
  ok(Game.convoSelfRepeatLine(v1) === POOL0, 'after restart, first draw is canonical again', '');
  Game.endConvo(v1, 'left');

  console.log('T3: sayLine blocked path with lazy thunk — canonical first, then cycles');
  Game.startConvo(v2);
  const L = '"A favor line spoken once, already said."';
  const s0 = Game.sayLine(v2, L);
  ok(s0 !== null, 'line speaks the first time', s0);
  const deflections = [];
  for (let i = 0; i < 6; i++) {
    // exactly how the fixed call sites wire it: thunk, evaluated only on block
    Game.sayLine(v2, L, { fallback: () => Game.convoSelfRepeatLine(v2) });
    deflections.push(themLines(Game, v2).slice(-1)[0]);
  }
  ok(deflections[0] === POOL0, 'first blocked deflect is canonical (no phase shift)', deflections[0]);
  ok(new Set(deflections.slice(0, 3)).size === 3, 'three consecutive blocks all distinct', JSON.stringify(deflections.slice(0, 3)));
  let adj2 = false;
  for (let i = 1; i < deflections.length; i++) if (deflections[i] === deflections[i - 1]) adj2 = true;
  ok(!adj2, 'six consecutive blocks, never adjacent-verbatim', JSON.stringify(deflections));
  Game.endConvo(v2, 'left');

  console.log('T4: dlg:details blocked branch uses the cycling pool (was hardcoded)');
  Game.startConvo(v3);
  const c = Game.convoGet(v3);
  const FAVOR = '"I need someone to haul water with me."';
  c.transcript.push({ who: 'you', text: '"Tell me more about it."' });
  // pre-ledger the exact composed string so the handler's sayLine blocks
  const composed = Game.convoComposeDlg(v3, FAVOR, 'dlg:details');
  Game.sayLine(v3, composed, { tag: 'favor' });
  c.want = { id: 'ask_favor', stage: 2, favor: { whyLine: FAVOR }, def: { engageBeat: function () { return FAVOR; } } };
  const got = [];
  for (let i = 0; i < 4; i++) {
    const r = Game.convoTurn(v3, 'dlg:details');
    got.push(r && r.line);
  }
  ok(got.every(g => typeof g === 'string' && g.length > 0), 'blocked details never goes silent', JSON.stringify(got));
  ok(new Set(got.slice(0, 3)).size === 3, 'details deflects cycle, no verbatim parrot', JSON.stringify(got));
  Game.endConvo(v3, 'left');

  console.log('T5: betrayal finish pattern — 8 identical investigate beats, no verbatim run');
  Game.startConvo(v1);
  const BL = 'Nothing you can prove — yet. Dig again; the trail is still warm.';
  const outs = [];
  for (let i = 0; i < 8; i++) {
    // mirror betrayal.js finish(): sayLine with lazy fallback
    const r = Game.sayLine(v1, BL, { fallback: () => Game.convoSelfRepeatLine(v1) }) || BL;
    outs.push(r);
  }
  ok(outs[0] === BL, 'first beat speaks', outs[0].slice(0, 40));
  let adj3 = false;
  for (let i = 2; i < outs.length; i++) if (outs[i] === outs[i - 1]) adj3 = true;
  ok(!adj3, 'deflects never repeat adjacently across 8', JSON.stringify(outs.slice(1, 4)));
  Game.endConvo(v1, 'left');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
