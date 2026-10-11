#!/usr/bin/env node
// probe-catchup-20261011.js — catch-up sim reachability probe (travel lever).
// Run a world to day 60, walk to an ungenerated village, verify
// checkVillageProximity runs the catch-up sim: generated=true, named roster,
// news entries, emerged knowledge profile, day caught up, first-sight line.
// Captures say-lines for SENSE-TESTING review.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');

async function main() {
  const out = { seed: 4242, catchup: null, say: [] };
  const { Game } = await loadGame({ seed: 4242, mode: 'probe', fullTelemetry: false });
  await setupGame(Game);
  const osay = Game.say;
  Game.say = function (m) { try { if (typeof m === 'string') out.say.push('d' + (((Game.state.scholar) || {}).day || 0) + ': ' + m.slice(0, 500)); } catch (e) {} return osay.apply(this, arguments); };
  const { competent } = require('./policies/competent');
  await runDays(Game, competent, { days: 60 });
  const day = (Game.state.scholar || {}).day || 0;
  const ovs = Game.state.otherVillages || [];
  const target = ovs.find(v => v.id !== 'haven' && !v.generated);
  if (!target) { out.catchup = { error: 'no ungenerated village found' }; }
  else {
    const before = { generated: !!target.generated, day: target.day, roster: (target.roster || []).length, news: (target.news || []).length, kp: !!target.knowledgeProfile };
    Game.map.px = target.x; Game.map.py = target.y;
    Game.checkVillageProximity();
    out.catchup = {
      day, village: target.name || target.id, dist: Math.abs(target.x - Game.map.px) + Math.abs(target.y - Game.map.py),
      before,
      after: {
        generated: !!target.generated, day: target.day,
        roster: (target.roster || []).length,
        rosterNamed: (target.roster || []).filter(p => p.name && p.alive).length,
        news: (target.news || []).length,
        newsSample: (target.news || []).slice(0, 4),
        kpFocus: (target.knowledgeProfile || {}).focus,
        kpPlants: Object.keys((target.knowledgeProfile || {}).plants || {}).length,
        pantryKcal: Math.round(target.pantryKcal || 0),
        population: target.population,
      },
    };
  }
  // approach AGAIN later (re-sync): advance 20 days, re-approach, verify day re-caught-up
  await runDays(Game, competent, { days: 20 });
  const day2 = (Game.state.scholar || {}).day || 0;
  if (target) {
    const t2 = (Game.state.otherVillages || []).find(v => v.id === target.id);
    Game.map.px = t2.x; Game.map.py = t2.y;
    Game.checkVillageProximity();
    out.catchup.resync = { day: day2, villageDay: t2.day, news: (t2.news || []).length };
  }
  fs.writeFileSync('/tmp/probe-catchup.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.catchup, null, 1));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
