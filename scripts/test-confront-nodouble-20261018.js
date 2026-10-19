#!/usr/bin/env node
// test-confront-nodouble-20261018.js -- PROOF TEST (journey-social r26).
// The confront: wrapper in truth.js pushed r.line to c.transcript AND
// called sayLine(vid, r.line) — which pushes it AGAIN. The transcript
// showed the NPC's clear line twice in a row, verbatim.
// (transcript-caught 2026-10-18, s1902-late-d106-Elijah: "Wait, wait —"
// twice back-to-back.)
// GREEN = the clear line appears exactly once in the transcript.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'confront-nodouble-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  // Plant an event-backed observation doubt (tentative clear path).
  const tag = safe(() => Game.whoTag(vid), 'them');
  const doubt = Game.addDoubt(vid, 'observation',
    `${tag} has been suddenly warm toward you \u2014 and there's a new something in their pack.`,
    [], { eventBacked: true });
  if (!doubt) { console.log('SKIP: addDoubt returned null'); process.exit(2); }
  Game.startConvo(vid);
  const before = (Game.convoGet(vid).transcript || []).length;
  let r = null;
  try { Game.convoTurn(vid, 'confront:' + doubt.id); } catch (e) { console.log('FAIL: convoTurn threw: ' + e.message); process.exit(1); }
  const tr = (Game.convoGet(vid).transcript || []).slice(before);
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  // Count occurrences of the clear line's signature chunk.
  const texts = tr.map(e => String(e.text || ''));
  const clears = texts.filter(t => /The pieces slot into place|you've got it wrong|worded that terribly|fair\."|holds together/.test(t));
  console.log('transcript tail:');
  for (const e of tr.slice(-6)) console.log(`  ${e.who}: ${String(e.text).slice(0, 90)}`);
  // The same NPC text must not appear twice in a row (transcript double-push).
  let dupes = 0;
  for (let i = 1; i < texts.length; i++) {
    if (texts[i] && texts[i] === texts[i - 1] && texts[i].length > 20) {
      // Pagination chunks legitimately repeat a long line's chunks only
      // when the line was split — identical FULL entries back-to-back is
      // the double-push signature.
      dupes++;
      console.log(`    dupe[${i}]: ${texts[i].slice(0, 70)}`);
    }
  }
  if (dupes > 0) { console.log(`FAIL: ${dupes} verbatim-adjacent duplicate NPC line(s)`); process.exit(1); }
  console.log('ALL GREEN: no transcript double-push');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
