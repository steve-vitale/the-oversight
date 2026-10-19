#!/usr/bin/env node
// test-lately-norepeat-20261018.js -- PROOF TEST (journey-social r26).
// t2pick's `|| pool[0]` fallback defeats the no-repeat ledger: when a
// lately pool is exhausted (single-line pools like 'gratitude'), the
// second ask re-serves the VERBATIM line instead of letting topic2Ask's
// honest exhausted-pool fallback fire.
// (transcript-caught 2026-10-18, s1902-deep-1-Asiri: "What's going on out
// there?" got the ack "Huh. I answered that once" + the verbatim same
// "Someone helped me recently..." line seconds after "What's new with
// you?" got it.)
// GREEN = the second ask does NOT parrot the first line verbatim.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'lately-norepeat-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  // Force the single-line gratitude pool.
  const origEv = Game.t2LatelyEvent;
  Game.t2LatelyEvent = () => ({ kind: 'gratitude' });
  Game.startConvo(vid);
  const line1 = safe(() => Game.topic2Ask(vid, 'lately'), null);
  const line2 = safe(() => Game.topic2Ask(vid, 'lately'), null);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  Game.t2LatelyEvent = origEv;
  console.log('ask 1:', String(line1).slice(0, 100));
  console.log('ask 2:', String(line2).slice(0, 100));
  if (!line1) { console.log('FAIL: first ask returned nothing'); process.exit(1); }
  // Strip the change-ack preamble before comparing content.
  const strip = (l) => String(l || '').replace(/^"[^"]*" "(?=[A-Z])/, '"');
  const s1 = String(line1), s2 = String(line2);
  // The content beat of ask 2 must not be the verbatim content beat of ask 1.
  const verbatim = s2.includes('Someone helped me recently') && s1.includes('Someone helped me recently');
  if (verbatim) {
    console.log('FAIL: second lately ask parroted the first line verbatim (no-repeat ledger defeated)');
    process.exit(1);
  }
  console.log('ALL GREEN: no verbatim lately repeat');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
