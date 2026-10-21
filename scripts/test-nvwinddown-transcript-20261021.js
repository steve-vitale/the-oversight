#!/usr/bin/env node
// Proof test: the r19 nv-winddown delivery must record its gesture beat in
// the conversation transcript EXACTLY once.
// RED (pre-R35 fix): the delivery called sayLine (which records the them-line
// itself) AND pushed a second explicit copy — the winddown line appeared twice
// in the player-visible transcript (transcript-caught as a verbatim repeat in
// the wild: journey-landing r35 pilot, seed 202 day 2).
// GREEN: exactly one them-entry carries the winddown line after surfacing.
// Usage: node scripts/test-nvwinddown-transcript-20261021.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const { Game } = await loadGame({ seed: 515001, mode: 'nvwinddown-proof' });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId && !Game.getPerson(id).dead);
  if (!roster.length) throw new Error('no villagers on roster');
  const vid = roster[0];
  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  // force the language-barrier path (as a real 'none'-language opener does)
  c.nativeLang = 'Twi'; c.thread = 'nonverbal'; c.wasNonverbal = true;
  c.pendingQ = null; c.heldAsk = null;

  let surfacedLine = null;
  for (let t = 1; t <= 12; t++) {
    const r = Game.convoTurn(vid, 'nv:nod');
    const cc = Game.convoGet(vid);
    if (cc.windingDown && surfacedLine === null) surfacedLine = r && r.line;
    if (r && r.ended) break;
  }
  if (!surfacedLine) { console.log('FAIL: winddown never surfaced'); process.exit(1); }

  const themTexts = (c.transcript || []).filter(e => e && e.who === 'them').map(e => String(e.text));
  // the surfaced line may be paginated into chunks; count entries whose text
  // is contained in (or contains) the surfaced line's first 40 chars
  const key = String(surfacedLine).slice(0, 40);
  const hits = themTexts.filter(t => t.indexOf(key) !== -1 || key.indexOf(t.slice(0, 40)) !== -1);
  console.log(`surfaced: "${String(surfacedLine).slice(0, 80)}"`);
  console.log(`them entries: ${themTexts.length}, matching the winddown line: ${hits.length}`);
  if (hits.length !== 1) {
    console.log(`FAIL: winddown beat recorded ${hits.length}x in the transcript (want exactly 1)`);
    process.exit(1);
  }
  // the player's gesture is recorded once too
  const gestures = (c.transcript || []).filter(e => e && e.who === 'you' && String(e.text) === '(gesture)').length;
  console.log(`player (gesture) entries: ${gestures}`);
  console.log('GREEN: winddown beat recorded exactly once in the transcript.');
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
