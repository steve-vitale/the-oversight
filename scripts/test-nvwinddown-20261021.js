// scripts/test-nvwinddown-20261021.js — proof test for the journey-scale r19
// blank-fill: the nonverbal (language-barrier) conversation path queued its
// budget-landing winddown beat in heldBeats, but the nonverbal thread offers
// no 'goon' continuer (convoChoices excludes it), so the beat sat queued
// forever — gesture-spam looped without end (8+ nods, no close). The
// winddown machinery was dead on this path.
//
// RED: 10 consecutive nv:nod turns never queue-and-deliver a winddown;
//   winddownQueued stays false or the held beat never surfaces.
// GREEN: the winddown queues at budget, the next gesture surfaces the
//   gesture beat aloud (no chop), and the following gesture ends the
//   conversation naturally.
// Usage: node scripts/test-nvwinddown-20261021.js
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
  const budget = c.budget;
  console.log(`budget=${budget}`);

  let queuedAt = -1, surfacedAt = -1, endedAt = -1, surfacedLine = null;
  for (let t = 1; t <= 12; t++) {
    const r = Game.convoTurn(vid, 'nv:nod');
    const cc = Game.convoGet(vid);
    if (queuedAt < 0 && cc.winddownQueued) queuedAt = t;
    if (surfacedAt < 0 && cc.windingDown) { surfacedAt = t; surfacedLine = r && r.line; }
    if (r && r.ended) { endedAt = t; break; }
  }
  console.log(`queuedAt=${queuedAt} surfacedAt=${surfacedAt} endedAt=${endedAt}`);
  if (queuedAt < 0) fails.push('winddown never queued (winddownQueued stayed false)');
  else if (queuedAt > budget + 1) fails.push(`winddown queued late: turn ${queuedAt} vs budget ${budget}`);
  if (surfacedAt < 0) fails.push('queued winddown beat never surfaced (windingDown never armed)');
  else {
    if (surfacedAt !== queuedAt + 1) fails.push(`winddown surfaced at turn ${surfacedAt}, expected ${queuedAt + 1} (beat first, not a chop)`);
    if (!/gestures slow|winding down|running its course/i.test(String(surfacedLine))) fails.push(`surfaced line is not the winddown beat: ${String(surfacedLine).slice(0, 120)}`);
  }
  if (endedAt < 0) fails.push('conversation never ended after the winddown');
  else if (surfacedAt > 0 && endedAt !== surfacedAt + 1) fails.push(`ended at turn ${endedAt}, expected ${surfacedAt + 1}`);

  if (fails.length) {
    console.log('FAILURES:');
    for (const f of fails) console.log('  ' + f);
    process.exit(1);
  }
  console.log(`GREEN: nv winddown queues at budget (${budget}), surfaces as a gesture beat on the next turn, and closes naturally on the following turn.`);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
