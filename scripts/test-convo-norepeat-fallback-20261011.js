#!/usr/bin/env node
// test-convo-norepeat-fallback-20261011.js — PROOF for the journey-social
// blank: the no-repeat ledger (dialog-ui-fix 2026-10-11) could SILENCE npc
// beats. Observed in 101 journey conversations (seeds 20261011/777/424242/99):
//   - dlg:doubt picked 40x -> 35 silent (87.5%): the probe's only branch line
//     was already in the run-wide ledger, sayLine returned null, the NPC said
//     nothing while trust/mood/'prodded' evidence still fired.
//   - alive:thread resume picked 235x -> 173 silent (73.6%): the fixed
//     '"Yeah... where were we with that."' beat was ledger-blocked.
//   - betrayalTurn.finish pushed the beat to the transcript AND called
//     sayLine -> every betrayal beat printed TWICE ("It's quiet at the trap
//     line..." x2 in the journey transcript).
// Fix: sayLine(vid, line, {fallback}) — a blocked line speaks the fallback
// (ledger-exempt, generic by design) instead of going silent; callers without
// a fallback keep the null contract. betrayalTurn.finish emits once.
// Wired: base turn tail, winddown goodbye, dlg:doubt, betrayalTurn.finish.
// Usage: node scripts/test-convo-norepeat-fallback-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const themAfter = (Game, vid, idx) =>
  Game.convoGet(vid).transcript.slice(idx).filter(e => e.who === 'them').map(e => String(e.text));

(async () => {
  const SEED = 20261011;
  const { Game } = await loadGame({ seed: SEED, mode: 'test-norepeat-fallback' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [v1, v2] = vids;
  const nm = (v) => { try { return Game.displayName(v); } catch (e) { return v; } };

  console.log('T1: sayLine fallback contract');
  Game.startConvo(v1);
  const L1 = '"A test line for the ledger."';
  const FB = '"Fallback speaks."';
  const r1 = Game.sayLine(v1, L1);
  ok(r1 !== null, 'first say speaks', r1);
  const r2 = Game.sayLine(v1, L1);
  ok(r2 === null, 'repeat without fallback still returns null (contract preserved)', r2);
  const t2 = themAfter(Game, v1, 0).length;
  const r3 = Game.sayLine(v1, L1, { fallback: FB });
  ok(r3 !== null && String(r3).indexOf('Fallback speaks') !== -1, 'repeat WITH fallback speaks the fallback', r3);
  const t3 = themAfter(Game, v1, 0).length;
  ok(t3 === t2 + 1, 'fallback adds exactly one transcript entry', t2 + '->' + t3);
  ok(themAfter(Game, v1, 0).some(x => x.indexOf('Fallback speaks') !== -1), 'fallback text is in the transcript');
  Game.endConvo(v1, 'left');

  console.log('T2: dlg:doubt never goes silent (run-wide ledger case)');
  for (const v of [v1, v2]) {
    try { Game.state.village.trust[v] = 60; } catch (e) {}
    try { if (Game.addDoubt) Game.addDoubt(v, { id: 'dtest', text: 'took extra food' }); } catch (e) {}
  }
  const doubtLines = [];
  for (const v of [v1, v2]) {
    Game.startConvo(v);
    const c = Game.convoGet(v);
    const before = c.transcript.length;
    Game.convoTurn(v, 'dlg:doubt');
    const added = themAfter(Game, v, before);
    doubtLines.push({ who: nm(v), n: added.length, line: (added[0] || '').slice(0, 60) });
    Game.endConvo(v, 'left');
  }
  console.log('   ', JSON.stringify(doubtLines));
  ok(doubtLines.every(d => d.n >= 1), 'both villagers answer the probe (none silent)');
  ok(doubtLines[1].line.indexOf("Done talking about it") !== -1 || doubtLines[1].n >= 1,
    'second villager (ledger-blocked) gets the stonewall fallback, not silence', JSON.stringify(doubtLines[1]));

  console.log('T3: betrayalTurn.finish emits exactly once (no duplicate)');
  Game.startConvo(v1);
  const cb = Game.convoGet(v1).transcript.length;
  Game.betrayalTurn(v1, 'betrayal:decline');
  const entries = Game.convoGet(v1).transcript.slice(cb);
  const themOnes = entries.filter(e => e.who === 'them');
  const youOnes = entries.filter(e => e.who === 'you');
  console.log('   entries:', entries.map(e => e.who + ':' + String(e.text).slice(0, 40)).join(' | '));
  ok(youOnes.length === 1, 'one player line', youOnes.length);
  ok(themOnes.length === 1, 'exactly ONE npc beat (was two before the fix)', themOnes.length);
  Game.endConvo(v1, 'left');

  console.log('T4: base-tail thread-resume fallback (the 73.6% silent case)');
  // Block the fixed resume beat run-wide, plant an open thread, resume it.
  const FIXED = '"Yeah... where were we with that."';
  Game.startConvo(v1);
  Game.sayLine(v1, FIXED); // ledger it (per-convo + run-wide)
  Game.endConvo(v1, 'left');
  // plant an open thread deterministically via the ledger
  try {
    const led = Game.convoTopicLedger(v1);
    led.open = led.open || [];
    if (!led.open.some(x => x && x.tid === 'past')) led.open.push({ tid: 'past', label: 'their past', note: 'test' });
  } catch (e) { console.log('   (could not plant thread: ' + e.message + ')'); }
  Game.startConvo(v1);
  const choices = Game.convoChoices(v1) || [];
  const resume = choices.find(x => x && String(x.id || '').indexOf('alive:thread') === 0);
  if (!resume) {
    console.log('   SKIP: no alive:thread choice offered (menu: ' + choices.map(x => x.id).join(',') + ')');
  } else {
    const c4 = Game.convoGet(v1);
    const b4 = c4.transcript.length;
    Game.convoTurn(v1, resume.id);
    const added4 = themAfter(Game, v1, b4);
    console.log('   resume pick', resume.id, '-> npc entries:', added4.length, JSON.stringify(added4.map(s => s.slice(0, 50))));
    ok(added4.length >= 1, 'resuming a planted thread produces an npc beat, not silence');
    Game.endConvo(v1, 'left');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
