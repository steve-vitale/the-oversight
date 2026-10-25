#!/usr/bin/env node
// Journey leg: ESTABLISHMENT r36 — ROSTER SCAN (pilot, 2026-10-25).
// r35 proved butcher/spotter widenings in the wild but cook/builder
// widenings stayed unproven: no living carpenter/mason/roofer/mechanic
// (builder) or butcher-occupation villager (cook) on seeds 61/82/103/124.
// This scan loads each candidate seed, runs setupGame, and reports the
// DAY-1 roster occupations for the r35 newcomer trades, so r36 can run
// its full 42d census on a band where those villagers actually exist.
// Read-only: prints JSON lines to stdout; writes nothing to the repo.
// Usage: SEEDS=201,202 node scripts/journey-establishment-r36-scan-20261025.js
//        or: node scripts/journey-establishment-r36-scan-20261025.js 201 202
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const BUILDER_NEW = ['carpenter', 'mason', 'roofer', 'mechanic'];
const COOK_NEW = ['butcher'];
const OTHER_NEW = ['hunting guide', 'fishing guide', 'line cook', 'rancher', 'sailor',
  'wild food forager', 'arborist', 'florist', 'mushroom grower', 'beekeeper'];

function occOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : {}; return p.occupation || p.formerOccupation || '?'; } catch (e) { return '?'; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}

async function scanSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  const roster = [];
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      if (String(id) === 'player') continue;
      let dead = false;
      try { dead = !!(Game.getPerson(id) || {}).dead; } catch (e) {}
      if (dead) continue;
      roster.push({ id: String(id), name: nameOf(Game, id), occ: occOf(Game, id) });
    }
  } catch (e) { console.error('seed ' + seed + ' roster error: ' + e.message); }
  const has = (list) => roster.filter(r => list.some(m => String(r.occ || '').toLowerCase().includes(m)));
  const out = { seed, rosterSize: roster.length,
    builderNew: has(BUILDER_NEW), cookNew: has(COOK_NEW), otherNew: has(OTHER_NEW),
    roster };
  console.log(JSON.stringify(out));
  return out;
}

async function main() {
  let seeds = [];
  if (process.env.SEEDS) seeds = process.env.SEEDS.split(',').map(s => parseInt(s, 10));
  else if (process.argv.length > 2) seeds = process.argv.slice(2).map(s => parseInt(s, 10));
  else { console.error('usage: SEEDS=201,202 node scripts/journey-establishment-r36-scan-20261025.js'); process.exit(2); }
  for (const seed of seeds) {
    try { await scanSeed(seed); } catch (e) { console.error('seed ' + seed + ' FATAL: ' + (e && e.message)); }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
