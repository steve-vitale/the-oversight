#!/usr/bin/env node
// test-silence-grammar-20261018.js -- journey-social r25 proof.
// Mood-silence lines are conversation GRAMMAR (stage directions), not
// content: the run-ledger anti-parrot block must not turn a single player
// silence into a dry-line deflection ("...Sorry, lost my train of thought."
// as the answer to saying nothing — transcript-caught on fresh sittings,
// turn 0, in the post-r24-fix pilot on seeds 1701/1702/1801/1802).
// Fix: the mood-silence turn sets structuralTurn (same exemption as the r17
// resume/recap beats) — exempt from the run-ledger block, per-sitting
// ledger still applies.
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
// The neutral/friendly mood-silence pool (convo-mood.js msil:fill).
const FILL_POOL = [
  'They fill the quiet. "Anyway — where was I?"',
  '"You\'re a good listener, you know that?" A tired smile.',
  'They glance at the fire, then back. The quiet doesn\'t seem to bother them.',
];
const keyOf = (Game, L) => { try { return Game.convoSplitBeats(L)[0].trim(); } catch (e) { return String(L).trim(); } };

(async () => {
  const { Game } = await loadGame({ seed: 5150, mode: 'test-silence-grammar' });
  await setupGame(Game);
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);

  // Pollute the run ledger the way a busy day does: every mood-fill line
  // "said" recently by other villagers.
  const rl = Game.convoRunLedger();
  for (const L of FILL_POOL) { const k = keyOf(Game, L); if (rl.indexOf(k) === -1) rl.push(k); }

  // T1: a single silence on a fresh sitting is answered with a real mood
  // line, not a deflection — even with the whole pool in the run ledger.
  const vid = vids[0];
  Game.startConvo(vid);
  Game.convoGet(vid).mood = 0; // neutral band -> msil:fill pool
  Game.convoTurn(vid, 'silence');
  const L1 = lastNpc(Game, vid);
  ok('T1 run-ledgered mood-silence goes through honestly', L1 && !isDefl(Game, L1), 'got: ' + L1.slice(0, 70));
  Game.endConvo(vid, 'left');

  // T2: consecutive silences still cycle real lines (per-sitting ledger
  // keeps working — no verbatim parrot, no deflection).
  const vid2 = vids[1];
  Game.startConvo(vid2);
  Game.convoGet(vid2).mood = 0;
  const seen = [];
  for (let i = 0; i < 3; i++) { Game.convoTurn(vid2, 'silence'); seen.push(lastNpc(Game, vid2)); }
  ok('T2 three silences: no deflection lines', seen.every(l => l && !isDefl(Game, l)), 'got: ' + seen.map(l => l.slice(0, 44)).join(' | '));
  ok('T2b three silences: lines cycle, not verbatim', new Set(seen).size > 1, 'got ' + new Set(seen).size + ' unique');
  Game.endConvo(vid2, 'left');

  // T3 control: the exemption is scoped — a CONTENT line in the run ledger
  // still blocks through sayLine (no structural flag).
  const vid3 = vids[2];
  Game.startConvo(vid3);
  const contentLine = '"The river took the south bridge in the night."';
  const ck = keyOf(Game, contentLine);
  if (rl.indexOf(ck) === -1) rl.push(ck);
  const out = Game.sayLine(vid3, contentLine, {});
  ok('T3 control: run-ledgered content line still dry-blocks', !!out && isDefl(Game, out), 'got: ' + String(out).slice(0, 60));
  Game.endConvo(vid3, 'left');

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
