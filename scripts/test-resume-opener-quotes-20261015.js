#!/usr/bin/env node
// test-resume-opener-quotes-20261015.js — PROOF TEST for the social-life
// blank: the resume opener's memory quote nested double quotes inside the
// opener's own double quotes, rendering a doubled "" at the seam.
// Transcript-verified (r15 pilot, seed 1202 larceny-leaning):
//   NPC: "We never finished talking about the neighbors — we wandered off
//   it. "We started on that favor, then got onto the neighbors.""
// Root cause: convoResumeOpener (deepening r11 2026-10-15) appended the
// snippet wrapped in "..." and voiceLine wrapped the whole opener in "..."
// — the snippet's closing quote and the opener's closing quote collided.
// Fix: the snippet nests in single quotes (proper typography), with any
// stray double quotes inside it converted.
// RED: the opener contains '""' or '" "'. GREEN: neither, snippet still quoted.
// Usage: node scripts/test-resume-opener-quotes-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); }
}

async function main() {
  const { Game } = await loadGame({ seed: 7 });
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  await setupGame(Game);
  const v = Game.state.village || {};
  const me = Game.villagerId;
  const vid = (v.roster || []).find(id => id !== me);
  if (!vid) { console.log('FAIL: no villager'); process.exit(1); }
  try { Game.state.village.trust[vid] = 60; } catch (e) {}

  // plant a thread carrying a snippet (the last NPC-spoken beat, quotes
  // stripped at plant time per convoNoteBeat — the opener re-quotes it)
  Game.startConvo(vid);
  try {
    const L = Game.convoTopicLedger(vid);
    L.open = [{
      tid: 'favor', label: 'that favor', day: Game.state.scholar.day,
      why: 'changed the subject',
      snippet: 'We started on that favor, then got onto the neighbors.',
    }, {
      tid: 'neighbors', label: 'the neighbors', day: Game.state.scholar.day,
      why: 'changed the subject', snippet: null,
    }];
  } catch (e) { console.log('FAIL: could not plant thread: ' + e.message); process.exit(1); }
  // force the opener to pick our thread: only 'favor' has a snippet and the
  // opener picks at random — retry until it fires on 'favor' (bounded)
  let line = null;
  for (let i = 0; i < 40 && !line; i++) {
    try { Game.convoGet(vid)._resumedOnce = false; } catch (e) {}
    const r = Game.convoResumeOpener(vid);
    if (r && r.thread === 'favor') line = r.line;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  ok(typeof line === 'string' && line.length > 0, 'resume opener fires with a snippet thread');
  if (line) {
    console.log('  opener:', JSON.stringify(line.slice(0, 200)));
    ok(line.indexOf('We started on that favor') !== -1, 'the snippet is quoted in the opener');
    // strip the opener's own outer quotes — no double quotes may remain
    // inside (nested "" is the defect, whether mid-sentence or doubled at
    // the seam as transcript-verified)
    const innerOnly = line.replace(/^"/, '').replace(/"$/, '');
    ok(innerOnly.indexOf('"') === -1, 'no nested double quotes inside the opener', JSON.stringify(innerOnly.slice(0, 160)));
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the blank is present'); process.exit(1); }
  console.log('GREEN: the memory quote nests cleanly in single quotes');
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
