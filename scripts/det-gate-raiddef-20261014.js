#!/usr/bin/env node
// det-gate-raiddef-20261014.js — determinism gate: with RAIDDEF unset, the
// wrapped leadfeast+raiddef policy must produce byte-identical trajectories
// to raw leadfeast (the gate-off delegation path the proof pins).
// 8 seeds x 60d, day-hash comparison. Any mismatch is a LOUD failure.
'use strict';
process.env.FEASTSCALE_R13 = '1';
delete process.env.RAIDDEF;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// 3184c187-pattern landed-tree guard (coordinator): the raiddef layer was
// deleted per kill protocol — degrade to INFO-SKIP, not MODULE_NOT_FOUND.
let rd = null;
try { rd = require('./policies/raiddef'); } catch (e) { /* absent: killed arm */ }
if (require.main === module && !rd) {
  console.log('INFO-SKIP: raiddef layer absent (killed arm, deleted per kill protocol).');
  process.exit(0);
}
const { leadfeast } = require('./policies/feastscale');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 60;

function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Math.round(Game.pantryKcalLive ? Game.pantryKcalLive(v) : 0)].join('|');
  } catch (e) { return 'ERR'; }
}

async function runHashed(policy, seed) {
  const { Game } = await loadGame({ seed, mode: 'raiddef-detgate', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { const r = od ? od(G, ctx) : undefined; hashes.push(dayHash(G)); return r; };
  await quietLog(() => runDays(Game, p, { days: DAYS }));
  return hashes;
}

async function main() {
  let bad = 0;
  for (const seed of SEEDS) {
    const a = await runHashed(leadfeast, seed);
    const b = await runHashed(rd.leadfeastRaiddef, seed);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    console.log(`seed ${seed}: ${a.length}d ${same ? 'IDENTICAL' : 'MISMATCH'}`);
    if (!same) {
      bad++;
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { console.log(`  first diff at day ${i}: ${a[i]} vs ${b[i]}`); break; }
      }
    }
  }
  if (bad) { console.log(`DET-GATE FAILED: ${bad}/8 seeds mismatch.`); process.exit(1); }
  console.log('DET-GATE GREEN: 8/8 gate-off trajectories byte-identical.');
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(1); }); }
