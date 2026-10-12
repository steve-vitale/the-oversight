#!/usr/bin/env node
// SENSE-TEST: villagers talking about beast tricks (lever 1 r5, 2026-10-12).
// SENSE-TESTING LAW (Steve 2026-10-11): read transcripts — judge meaning,
// coherence, relevance, consequences, never just counts.
//
// Samples: run a short sim so the village slays beasts, then ask villagers
// about 'beasttricks' and read what they actually say.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

(async () => {
  const seed = parseInt(process.env.SEED || '7', 10);
  const days = parseInt(process.env.DAYS || '40', 10);
  const { Game } = await loadGame({ seed, mode: 'sense-beasttricks' });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); };
  const policy = Object.assign({}, competent);
  await runDays(Game, policy, { days, policyId: 'competent' });
  // keep the capture say installed for the askAbout sampling below

  const slain = Game.state.villageSlain || {};
  const slainTypes = Object.entries(slain).filter(([, n]) => n >= 1);
  console.log(`seed ${seed}, day ${((Game.state.scholar || {}).day)}: village slain ${slainTypes.length} types: ` +
    slainTypes.map(([id, n]) => `${id}×${n}`).join(', '));

  const teachable = Game.counterTeachable ? Game.counterTeachable() : null;
  console.log('counterTeachable():', teachable || '(none)');

  // Ask three different villagers about beasttricks; read every word.
  // For the third, simulate "slain but not yet learned" by clearing one
  // discovery — the teaching path only opens when there's a trick to learn.
  const roster = ((Game.state.village || {}).roster || []).slice(0, 3);
  const slainIds = slainTypes.map(([id]) => id);
  let n = 0;
  for (const vid of roster) {
    said.length = 0;
    if (n === 2 && slainIds.length) {
      const unlearn = slainIds.find(id => (Game.state.monsterCounters || {})[id]);
      if (unlearn) {
        delete Game.state.monsterCounters[unlearn];
        console.log(`\n(cleared discovery for ${unlearn} — simulating "slain but not yet learned")`);
      }
    }
    let r = null;
    try { r = Game.askAbout(vid, 'beasttricks'); } catch (e) { console.log(`askAbout threw: ${e.message}`); continue; }
    const person = ((Game.state.village || {}).people || {})[vid] || {};
    console.log(`\n--- villager ${++n}: ${person.name || vid} (taught=${r && r.taught}, none=${r && r.none}) ---`);
    for (const s of said) console.log('  ' + s.slice(0, 300));
    if (!said.length) console.log('  (silence — nothing said)');
  }

  // Also sample: what does the topic list show? (is beasttricks offered?)
  console.log('\nDone.');
})().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
