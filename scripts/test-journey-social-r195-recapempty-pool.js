#!/usr/bin/env node
// test-journey-social-r195-recapempty-pool.js -- PROOF TEST (journey-social r195).
// BLANK (panel-caught, r195): the empty-thread recap line is a ONE-line
// pool — '"We were just talking. Nothing important."' — so pressing recap
// twice in one sitting re-serves the same core and the M4 scan flags it.
// r181: 19 flags; r189: 1; r195 panel: 16 of 185 flags (8/7/1/0 across
// seeds 44101–44104) — the pre-registered >= 10 bar met, so the pool fix
// lands. The flags are real: the same core served 2–3 times per sitting
// with different suffixes ("That's still where we are." / "Ask me
// something else if you want.").
// FIX (src/js/conversation.js, convoRecapLine): four honest variants via
// convoPickCycle ('recapempty' key). The cycle serves distinct lines, and
// M9's 3-press cap bounds a sitting, so all serves in one sitting stay
// distinct. Every variant stays honest: nothing to recap means nothing
// to recap — no variant invents a topic, a shared event, or a promise.
// This test drives the REAL convoRecapLine on an empty thread log
// (seed 777036, r180 harness): 4 consecutive calls serve 4 distinct
// lines, all from the pool, and the analyzer's own near-dup property
// (same-opening first-3-words, jaccard >= 0.5) finds 0 flags among them.
// GREEN: 4 distinct pool lines, 0 near-dup flags, every line honest.
// RED (pre-fix): all 4 calls serve the byte-identical single line,
// 6 near-dup flags among them.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

const POOL = [
  '"We were just talking. Nothing important."',
  '"Just catching up, really. Nothing to sum up."',
  '"Nothing in particular — we were only talking."',
  '"Small talk, that\'s all. Nothing worth repeating."',
];

function normWords(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
}
function jaccard(a, b) {
  const sa = new Set(a), sb = new Set(b);
  let inter = 0;
  for (const w of sa) if (sb.has(w)) inter++;
  return inter / (sa.size + sb.size - inter);
}

async function main() {
  const { Game } = await loadGame({ seed: 777036, mode: 'recapempty-pool-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const vid = (Game.state.village.roster || []).find(id => id !== sid);
  if (!vid) { console.log('SKIP: no villager'); process.exit(2); }

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // Empty thread log: the recap has nothing to re-anchor to.
  c.threadLog = [];
  const lines = [];
  for (let i = 0; i < 4; i++) {
    const line = Game.convoRecapLine(vid);
    lines.push(String(line));
    console.log(`recap ${i + 1}:`, String(line).slice(0, 90));
  }
  Game.endConvo(vid, 'left');

  // Distinctness: 4 calls, 4 distinct lines.
  const distinct = new Set(lines).size;
  if (distinct !== 4) fail('expected 4 distinct recap lines, got ' + distinct + ': ' + JSON.stringify(lines));
  else console.log('PASS distinct lines (4)');

  // Pool membership: every served line is one of the four honest variants.
  for (const l of lines) {
    if (!POOL.includes(l)) fail('served line is not a pool variant: ' + l);
  }
  console.log('PASS all lines are pool variants');

  // Honesty: no variant invents a topic, event, or promise — each line
  // says only that there is nothing to recap.
  for (const l of lines) {
    if (!/nothing|small talk/i.test(l)) fail('variant is not an honest nothing-to-recap: ' + l);
  }
  console.log('PASS all variants honest (nothing to recap)');

  // Analyzer property: no same-opening pair, no jaccard >= 0.5 pair.
  let flags = 0;
  for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
    const wa = normWords(lines[i]), wb = normWords(lines[j]);
    if (wa.slice(0, 3).join(' ') === wb.slice(0, 3).join(' ')) { flags++; console.log('FLAG same-opening: ' + lines[i] + ' || ' + lines[j]); }
    else if (jaccard(wa, wb) >= 0.5) { flags++; console.log('FLAG jaccard: ' + lines[i] + ' || ' + lines[j]); }
  }
  if (flags !== 0) fail('expected 0 near-dup flags among the 4 variants, got ' + flags);
  else console.log('PASS 0 near-dup flags among variants');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — empty-thread recap cycles 4 honest distinct variants');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
