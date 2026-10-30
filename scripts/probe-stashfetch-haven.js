#!/usr/bin/env node
// probe-stashfetch-haven.js — PRE-PREREG probe (not a judged leg): is the
// vessel at haven at sleep time on nighttravel sims, and does person.stashed
// still hold the hatchet then? Informs the fetch gate design.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

const SEED = parseInt(process.env.SEED || '16103', 10);
const DAYS = parseInt(process.env.DAYS || '20', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'nighttravel-b', fullTelemetry: false });
  const sleeps = [];
  const origSleep = Game.sleep;
  Game.sleep = function (...a) {
    let atHaven = null, stash = null;
    try { atHaven = (typeof Game.playerAtHaven === 'function') ? Game.playerAtHaven() : null; } catch (e) {}
    try {
      const p = (typeof Game.getPerson === 'function' && Game.villagerId) ? Game.getPerson(Game.villagerId) : null;
      stash = p ? (p.stashed || []).map(e => (e && (e.itemId || e.id)) || e) : null;
    } catch (e) {}
    sleeps.push({ day: (Game.state.scholar || {}).day || 0, atHaven, stash });
    return origSleep.apply(this, a);
  };
  await setupGame(Game);
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const policy = withWoodwarm(base, wwStore);
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  console.log('seed=' + SEED + ' end=' + result.endReason + ' days=' + result.days);
  for (const s of sleeps) console.log('sleep day=' + s.day + ' atHaven=' + s.atHaven + ' stash=' + JSON.stringify(s.stash));
  console.log('atHaven sleeps: ' + sleeps.filter(s => s.atHaven).length + '/' + sleeps.length);
})().catch((e) => { console.error('PROBE CRASH', e && (e.stack || e)); process.exit(2); });
