#!/usr/bin/env node
// PROBE: are non-feared ledger frames reachable? (journey endgame 2026-10-11)
//
// Last run's blank #5: 8/8 deed-seeking runs read as "feared". The frame is
// an argmax over ledger entries recorded from real events — so a different
// playstyle (kind: shares, protects, doesn't kill) should read differently.
// This probe runs kind vs deed-seeking on identical seeds × 60 days and
// reports the ledger frame + entries. Measurement, not a lever (MEASUREMENT.md #8).
//
// Usage: node scripts/probe-frame-reach-20261011.js
//   env: SEEDS=7,42,99 DAYS=60

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { kind } = require('./policies/kind');
const { deedSeeking } = require('./policies/deed-seeking');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [7, 42, 99]);
const DAYS = parseInt(process.env.DAYS || '60', 10);

async function one(policy, policyName, seed) {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  await runDays(Game, policy, { days: DAYS });
  let frame = '?', entries = {};
  try { frame = Game.endingFrame(); } catch (e) { frame = 'err'; }
  try { entries = Game.ledger(); } catch (e) {}
  let alive = '?';
  try { alive = (Game.state.village.roster || []).filter(id => { try { return !Game.villagerDead(id); } catch (e) { return true; } }).length; } catch (e) {}
  const day = (() => { try { return Game.state.scholar.day; } catch (e) { return '?'; } })();
  return { policy: policyName, seed, frame, day, alive, entries };
}

async function main() {
  const rows = [];
  for (const seed of SEEDS) {
    rows.push(await one(kind, 'kind', seed));
    rows.push(await one(deedSeeking, 'deed-seeking', seed));
  }
  for (const r of rows) {
    console.log(`${r.policy} seed=${r.seed} day=${r.day} alive=${r.alive} frame=${r.frame}`);
    console.log(`  ledger: ${JSON.stringify(r.entries)}`);
  }
  const frames = {};
  for (const r of rows) frames[r.policy + ':' + r.frame] = (frames[r.policy + ':' + r.frame] || 0) + 1;
  console.log('frame distribution:', JSON.stringify(frames));
}
main().catch(e => { console.error('PROBE ERROR:', e); process.exit(2); });
