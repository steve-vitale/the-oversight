#!/usr/bin/env node
// scripts/sense-wildtile-20261015.js — SENSE-TESTING for the wildtile
// instrument (sim-findings #256). Counts are not the bar: read the actual
// death beats and judge whether the tile record and the narrative agree —
// a wild death recorded at (4,5) while the scholar is at (3,4) should read
// as away-news about a villager jumped in the wild, not as a Haven defense.
//
// Runs seed 33 (5 wild deaths d61-d100) to day 110 and prints the death
// beats (awayNews) alongside the instrument's tile rows.
// Usage: node scripts/sense-wildtile-20261015.js
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const wt = require('./wildtile-20261015');
const lib = require('./wildtile-lib-20261015');

async function main() {
  const { Game } = await loadGame({ seed: 33, mode: 'wildtile-sense', fullTelemetry: true });
  await setupGame(Game);
  const track = wt.attachWildtile(Game, 33);
  const policy = Object.assign({}, leadfeast);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 110, sampleEvery: 10 }); });
  const unlockDay = 58; // measured unlock for s33 on this tree
  const deaths = track.deaths.filter(d => lib.isVillagerCombatDeath(d) && d.day >= unlockDay);
  const fights = track.fights.filter(f => f.day >= unlockDay);
  const { pairs, unmatched } = lib.pairDeathsToFights(deaths, fights);
  console.log('=== seed 33 wild-channel tile rows vs death beats ===');
  for (const p of pairs) {
    const f = p.fight;
    if (f.channel !== 'wild') continue;
    console.log(`d${p.death.day} ${f.monsterId} (w${f.wave}) death@(${f.villagerTile.x},${f.villagerTile.y}) haven@(${f.havenTile.x},${f.havenTile.y}) scholar@(${f.scholarTile.x},${f.scholarTile.y}) onHaven=${f.onHavenTile} schAway=${f.scholarAwayFromHaven}`);
  }
  console.log(`\nunmatched deaths: ${unmatched.length}`);
  console.log('\n=== awayNews death beats (the narrative) ===');
  const news = ((Game.state.scholar || {}).awayNews || []);
  for (const n of news) {
    if (/💀|died|killed|dead/i.test(n)) console.log('  ' + n.slice(0, 160));
  }
  console.log(`\n(total awayNews entries: ${news.length})`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
