#!/usr/bin/env node
// test-journey-social-r125-ambush-fallen.js — PROOF for the journey-social
// r125 blank: an NPC-NPC ambush that kills its victim leaves NO entry in
// village.fallen, while every other villager death path records there
// (monster/wild/sickness/wounds/combat/contest all push fallen).
// Observed in the wild in r125 seeds 41501 (Sari, d8) and 41502
// (Penelope, d11): telemetry death tele fires (cause 'ambush'), the
// corpse + grief event + murder case all exist, the victim leaves the
// roster — but village.fallen has no entry, so the village's own death
// record forgets its murder victims (and any census reading fallen
// undercounts dark-channel kills).
// Fix (betrayal.js simNpcAmbush killed branch): push the fallen entry
// ({ villagerId, day, cause: 'ambush', name }) alongside registerDeath.
// Usage: node scripts/test-journey-social-r125-ambush-fallen.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}

(async () => {
  const { Game } = await loadGame({ seed: 41501, mode: 'test-ambush-fallen' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [leader, target] = vids;
  const fallenBefore = (Game.state.village.fallen || []).length;
  let killedPlot = null, tries = 0;
  for (; tries < 40; tries++) {
    const plot = Game.armPlot(leader, [], target, { reasons: ['grievance'], score: 60 });
    const r = Game.simNpcAmbush(plot);
    if (r && r.outcome === 'killed') { killedPlot = plot; break; }
    // hurt/escaped: target still alive, re-arm and try again for a kill
    if (!Game.state.village.roster.includes(target)) break; // died some other way; stop
  }
  ok(!!killedPlot, 'a killed ambush outcome occurred within 40 tries', 'tries=' + tries);
  if (killedPlot) {
    const fallen = Game.state.village.fallen || [];
    const entries = fallen.filter(f => f.villagerId === target);
    ok(entries.length === 1, 'exactly one fallen entry for the ambush victim', 'found=' + entries.length);
    ok(entries.length >= 1 && entries[0].cause === 'ambush', 'fallen cause is ambush', entries.length ? entries[0].cause : 'none');
    ok(entries.length >= 1 && entries[0].day === (Game.state.scholar || {}).day, 'fallen day is today', entries.length ? String(entries[0].day) : 'none');
    ok(!Game.state.village.roster.includes(target), 'victim left the roster', '');
    ok(fallen.length === fallenBefore + 1, 'fallen grew by exactly one', fallenBefore + '->' + fallen.length);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERROR', e); process.exit(1); });
