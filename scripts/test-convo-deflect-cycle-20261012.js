#!/usr/bin/env node
// test-convo-deflect-cycle-20261012.js — PROOF for the journey-social blank:
// the self-repeat fallback ("I just said — did you miss it?") was a single
// hardcoded string, ledger-exempt by design, so consecutive no-repeat blocks
// parroted it VERBATIM. Observed 2026-10-12 in journey-social-life evidence
// (seed 424242, Jimena day 18): three identical "I just said — did you miss
// it?" lines in a row — the exact filler-loop Steve called out.
// Fix: Game.convoSelfRepeatLine(vid) — per-conversation cycling pool of
// self-repeat deflections (never verbatim, mirrors convoDryLine). Wired at
// the three call sites (base turn tail, betrayal finish, dlg:help blocked
// repeat); the dlg:help path hands the SAME cycled line in as sayLine's
// fallback so re-fired cycles can't desync the claimed line from the
// transcript.
// Usage: node scripts/test-convo-deflect-cycle-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const themLines = (Game, vid) =>
  Game.convoGet(vid).transcript.filter(e => e.who === 'them').map(e => String(e.text));

(async () => {
  const SEED = 20261012;
  const { Game } = await loadGame({ seed: SEED, mode: 'test-deflect-cycle' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [v1, v2] = vids;

  console.log('T1: convoSelfRepeatLine cycles per-conversation, never verbatim x3');
  Game.startConvo(v1);
  const cyc = [Game.convoSelfRepeatLine(v1), Game.convoSelfRepeatLine(v1), Game.convoSelfRepeatLine(v1)];
  ok(new Set(cyc).size === 3, 'first three draws are all distinct', JSON.stringify(cyc));
  ok(cyc[0].indexOf('did you miss it') !== -1, 'first draw keeps the canonical line', cyc[0]);
  const cyc4 = Game.convoSelfRepeatLine(v1);
  ok(cyc4 === cyc[0], 'fourth draw cycles back (never ledgered)', cyc4);
  // r6 2026-10-12: the old "past 9 -> canonical" cap collapsed right back
  // into the verbatim parrot (78x in one run's evidence — the counter lived
  // on the persistent conv object and startConvo never reset it). The pool
  // now cycles FOREVER: a spamming player gets rotating honest brush-offs.
  const cyc10 = Game.convoSelfRepeatLine(v1); // 5th draw
  for (let i = 5; i < 13; i++) Game.convoSelfRepeatLine(v1); // draws 6..13
  const cyc14 = Game.convoSelfRepeatLine(v1); // 14th draw: used=13 -> POOL[1]; old cap returned POOL[0]
  ok(cyc14 === cyc[1], 'past old cap still cycles (no canonical collapse)', cyc14);
  void cyc10;
  Game.endConvo(v1, 'left');
  // per-conversation: a NEW conversation starts the cycle fresh (startConvo
  // resets the counter — r6; previously this passed only via the cap)
  Game.startConvo(v1);
  ok(Game.convoSelfRepeatLine(v1) === cyc[0], 'cycle resets per conversation', '');
  Game.endConvo(v1, 'left');

  console.log('T2: base turn-tail contract (conversation.js fallback) never parrots verbatim');
  Game.startConvo(v2);
  const L = '"A favor line spoken once, already said."';
  const s0 = Game.sayLine(v2, L);
  ok(s0 !== null, 'favor line speaks first', s0);
  const deflections = [];
  for (let i = 0; i < 4; i++) {
    // exactly how conversation.js's turn tail wires it post-fix
    Game.sayLine(v2, L, { fallback: Game.convoSelfRepeatLine(v2) });
    deflections.push(themLines(Game, v2).slice(-1)[0]);
  }
  ok(deflections.every(d => d !== L), 'the blocked line itself never re-emits', JSON.stringify(deflections));
  ok(new Set(deflections.slice(0, 3)).size === 3, 'three consecutive blocks are all distinct', JSON.stringify(deflections));
  Game.endConvo(v2, 'left');

  console.log('T3: dlg:help blocked repeat — no transcript desync, no verbatim parrot');
  Game.startConvo(v1);
  const c = Game.convoGet(v1);
  const FAVOR = '"I need someone to haul water with me."';
  // the handler pushes the player text before composing — mirror it so the
  // composed string we pre-ledger matches the handler's exactly
  c.transcript.push({ who: 'you', text: '"How can I help?"' });
  const composed = Game.convoComposeDlg(v1, FAVOR, 'dlg:help');
  Game.sayLine(v1, composed, { tag: 'favor' });
  // a live ask_favor whose stated line is now in the ledger -> the handler's
  // sayLine blocks -> BLOCKED REPEAT branch
  c.want = { id: 'ask_favor', stage: 1, def: { engageBeat: function () { return FAVOR; } } };
  const got = [];
  for (let i = 0; i < 3; i++) {
    const before = themLines(Game, v1).length;
    let res = null;
    try { res = Game.convoTurn(v1, 'dlg:help'); } catch (e) { res = null; }
    const after = themLines(Game, v1);
    got.push({ line: res && res.line, last: after.slice(-1)[0], n: after.length - before });
  }
  console.log('   ', JSON.stringify(got.map(g => ({ line: String(g.line).slice(0, 52), n: g.n }))));
  ok(got.every(g => g.n === 1), 'each blocked re-ask adds exactly one transcript entry (no desync)');
  ok(got.every(g => String(g.line) === String(g.last)), 'claimed line matches the spoken line every time', '');
  ok(new Set(got.map(g => String(g.line))).size === 3, 'three consecutive blocked re-asks are all distinct', '');
  Game.endConvo(v1, 'left');

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
