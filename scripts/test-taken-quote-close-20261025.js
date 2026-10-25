#!/usr/bin/env node
// TAKEN-KIN FIRST-TELLING CLOSING QUOTE (journey establishment r39, 2026-10-25):
// r37/r38 transcripts show Giovanni's taken-kin first telling opening with a
// double quote and never closing it:
//   "It's my grandmother, Lisa. Was taken. Eighty-one years old and they
//   called her boring. Eighty-one years. Some nights I swear I hear them
//   before I sleep -- the pods, rows deep, humming. Then morning comes
//   and I can't say whether it was real.
// (no closing quote — convo-wants.js seek_taken engageBeat returned
// `"It's my ${rel}, ${first}. ${cap}. ${takenPodTailFor(vid)}` with no
// trailing `"`; every sibling line closes its quote.)
// FIX: append the closing quote. No RNG, no meaning change — the line is
// rendered speech, and voiceLine() only touches fully-quoted lines, so the
// unclosed line also skipped voice inflection.
// Usage: node scripts/test-taken-quote-close-20261025.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  PASS ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

function takenWant(Game) {
  const roster = (Game.state.village || {}).roster || [];
  for (const id of roster) {
    if (!id || id === Game.villagerId) continue;
    let p = null;
    try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    if (!p || p.dead) continue;
    if (!(Game.takenKinOf && Game.takenKinOf(id).length)) continue;
    try { Game.startConvo(id); Game.endConvo(id, 'done'); Game.startConvo(id); Game.endConvo(id, 'done'); } catch (e) {}
    let sel = null;
    try { sel = Game.convoSelectWant ? Game.convoSelectWant(id) : null; } catch (e) {}
    if (sel && sel.id === 'seek_taken') {
      const d2 = sel.def || sel;
      if (d2 && typeof d2.engageBeat === 'function') return { def: d2, vid: id };
    }
  }
  return null;
}

(async () => {
  const SEEDS = [209, 228, 238, 239, 61, 82];
  let found = 0;
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed });
    await setupGame(Game);
    const got = takenWant(Game);
    if (!got) { console.log(`  SKIP seed ${seed}: no seek_taken def found`); continue; }
    found++;
    const { def, vid } = got;
    let beat = null;
    try { beat = def.engageBeat.call(Game, vid); } catch (e) { beat = 'ERROR ' + e.message; }
    beat = String(beat);
    ok(beat.startsWith('"'), `seed ${seed}: first telling opens with a quote`);
    ok(beat.endsWith('"'), `seed ${seed}: first telling CLOSES its quote`);
    ok((beat.match(/"/g) || []).length >= 2, `seed ${seed}: first telling has balanced quotes`);
    // Meaning preserved: still names the kin and the pods tail.
    const kin = (Game.takenKinOf(vid) || [])[0] || {};
    const first = (kin.name || 'they').split(' ')[0];
    ok(beat.indexOf(first) >= 0, `seed ${seed}: first telling still names the taken kin (${first})`);
    ok(/pods/i.test(beat), `seed ${seed}: first telling still carries the pods tail`);
  }
  ok(found > 0, `at least one seed produced a seek_taken first telling (found ${found})`);
  console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
