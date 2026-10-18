#!/usr/bin/env node
// test-sitting-repeat-20261018.js -- journey-social r24 proof.
// The no-repeat self-block read the FLAT c.saidLines, which persists across
// sittings — so small-pool lines (goodbyes, mood-silence, subject acks)
// said days ago blocked their own repeats forever and fell back to
// deflection-class dry lines ("...Sorry, lost my train of thought." AS a
// goodbye). Fix: the self-block (and convoWouldBlock) read the per-sitting
// ledger c.saidLinesConvo. Plus: the betrayal:accept outcome now rides the
// inviteBeat diegetic-act exemption (the r23 dry-after-"Sure." wart).
// RED verified pre-fix via patch round-trip (no stash): T1/T2/T3/T5 fail,
// T4 passes (control: within-sitting blocking must survive the fix).
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

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-sitting-repeat' });
  await setupGame(Game);
  const me = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== me);

  // T1: goodbye repeats honestly across sittings (read the TRANSCRIPT —
  // endConvo's return carries the pick, not the emission).
  Game.startConvo(vid);
  let c = Game.convoGet(vid);
  // Simulate prior sittings: all 3 leftexit lines live in the flat ledger.
  c.saidLines.push('"Oh — okay. Later, then."', '"Sure. I\'ll be around."', '"Right. Go on, then."');
  Game.endConvo(vid, 'left');
  const g1 = lastNpc(Game, vid);
  ok('T1 goodbye not deflection-class across sittings', g1 && !isDefl(Game, g1), 'got: ' + g1.slice(0, 60));

  // T2: a real mood-silence line repeats honestly across sittings.
  Game.startConvo(vid);
  Game.convoTurn(vid, 'silence');
  const L = lastNpc(Game, vid); // the exact emitted (possibly composed) line
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  c = Game.convoGet(vid);
  // Simulate DAYS passing: the run-ledger window decayed, but the flat
  // self ledger still holds the line (the pre-fix bug).
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  let Lkey = String(L).trim();
  try { Lkey = Game.convoSplitBeats(L)[0].trim(); } catch (e) {}
  if (L && !isDefl(Game, L)) {
    if (!c.saidLines.includes(Lkey)) c.saidLines.push(Lkey); // "said days ago"
    const out2 = Game.sayLine(vid, L, {});
    ok('T2 silence beat not deflection-class across sittings', !!out2 && !isDefl(Game, out2), 'got: ' + String(out2).slice(0, 60));
  } else {
    ok('T2 silence beat not deflection-class across sittings', false, 'sitting-1 silence was already dry: ' + L.slice(0, 60));
  }
  Game.endConvo(vid, 'left');

  // T3: diegetic-act exemption — a run-blocked primary emits with inviteBeat.
  Game.startConvo(vid);
  const primary = '"The ridge walk was quiet. Good quiet."';
  const key3 = '"The ridge walk was quiet. Good quiet."';
  Game.convoRunLedger().push(key3);
  const out3 = Game.sayLine(vid, primary, { inviteBeat: true });
  ok('T3 inviteBeat exemption emits the blocked primary', out3 === primary, 'got: ' + String(out3).slice(0, 60));
  Game.endConvo(vid, 'left');
  // Control: a run-blocked line in a FRESH sitting (not said here) still
  // falls back to the honest dry line for non-exempt callers.
  Game.startConvo(vid);
  const blocked2 = '"A run-blocked line, never said here."';
  Game.convoRunLedger().push(blocked2);
  const out3c = Game.sayLine(vid, blocked2, {});
  ok('T3 control: non-exempt run-block still falls back dry', isDefl(Game, out3c), 'got: ' + String(out3c).slice(0, 60));
  Game.endConvo(vid, 'left');

  // T4 (control): within-sitting repeats are still blocked.
  Game.startConvo(vid);
  const r4a = Game.sayLine(vid, '"A sitting-local line."', {});
  const r4b = Game.sayLine(vid, '"A sitting-local line."', {});
  ok('T4 within-sitting repeat still blocked', r4a === '"A sitting-local line."' && r4b === null, 'got: ' + String(r4b).slice(0, 40));
  Game.endConvo(vid, 'left');

  // T5: convoWouldBlock is per-sitting.
  Game.startConvo(vid);
  c = Game.convoGet(vid);
  if (!c.saidLines.includes('"An old sitting line."')) c.saidLines.push('"An old sitting line."');
  const wbOld = Game.convoWouldBlock(vid, '"An old sitting line."');
  Game.sayLine(vid, '"A fresh sitting line."', {});
  const wbNew = Game.convoWouldBlock(vid, '"A fresh sitting line."');
  ok('T5 convoWouldBlock false for old-sitting line, true for this-sitting', wbOld === false && wbNew === true,
    `old=${wbOld} new=${wbNew}`);
  Game.endConvo(vid, 'left');

  console.log(`\n${pass}/${pass + fail} GREEN`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
