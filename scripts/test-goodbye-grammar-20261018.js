#!/usr/bin/env node
// test-goodbye-grammar-20261018.js -- journey-social r25 proof.
// Goodbyes are conversation GRAMMAR (closural stage directions), not
// content: the run-ledger anti-parrot block must not turn a farewell into a
// dry-line deflection ("...Actually, forget it." AS the goodbye —
// transcript-caught on <leave> picks in the post-r24-fix pilot).
// Fix: endConvo's goodbye emission passes { structural: true } — same
// exemption as the r17 resume/recap beats and the r25 mood-silence turn.
// RED verified pre-fix via patch round-trip (no stash).
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const isDefl = (Game, t) => { try { return !!Game.convoIsDeflectionLine(t); } catch (e) { return false; } };
const lastNpc = (Game, vid) => {
  const tr = (Game.convoGet(vid).transcript || []).filter(e => e.who !== 'you');
  return tr.length ? String(tr[tr.length - 1].text || '') : '';
};
const keyOf = (Game, L) => { try { return Game.convoSplitBeats(L)[0].trim(); } catch (e) { return String(L).trim(); } };
// The 'left' exit pool (conversation.js endConvo) — pollute ALL of them;
// convoPickCycle is per-villager so we can't assume the index.
const LEFT_POOL = [
  '"Oh \u2014 okay. Later, then."',
  '"Sure. I\'ll be around."',
  '"Right. Go on, then."',
];

(async () => {
  const { Game } = await loadGame({ seed: 6161, mode: 'test-goodbye-grammar' });
  await setupGame(Game);
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);

  // Pollute the run ledger the way a busy day does: every exit-pool line
  // "said" recently by other villagers.
  const rl = Game.convoRunLedger();
  for (const L of LEFT_POOL) { const k = keyOf(Game, L); if (rl.indexOf(k) === -1) rl.push(k); }

  // T1: leaving speaks an honest goodbye, not a deflection — even with the
  // pool's first line in the run ledger.
  const vid = vids[0];
  Game.startConvo(vid);
  Game.endConvo(vid, 'left');
  const L1 = lastNpc(Game, vid);
  ok('T1 run-ledgered goodbye goes through honestly', L1 && !isDefl(Game, L1), 'got: ' + L1.slice(0, 70));

  // T2: a second villager leaving right after also gets an honest goodbye
  // (no cross-villager parrot panic on closural grammar).
  const vid2 = vids[1];
  Game.startConvo(vid2);
  Game.endConvo(vid2, 'left');
  const L2 = lastNpc(Game, vid2);
  ok('T2 adjacent goodbye also honest', L2 && !isDefl(Game, L2), 'got: ' + L2.slice(0, 70));

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
