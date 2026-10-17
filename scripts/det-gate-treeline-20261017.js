#!/usr/bin/env node
// det-gate-treeline-20261017.js — determinism gate: with TREELINE unset, the
// wrapped treeline policy must produce byte-identical trajectories to the
// raw seatdrive stack (the gate-off delegation path). 4 sweep seeds x 60d
// (the raiddef precedent's depth; the box is saturated — 90d x 8 was
// projected at 6+ hours wall), per-dawn day-hash comparison. Any mismatch
// is a LOUD failure — do NOT trust a before/after comparison on a seed the
// gate fails.
//
// (Modeled on scripts/det-gate-raiddef-20261014.js; the raiddef layer was
// deleted per kill protocol, this gate pins the treeline layer instead.)
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.TRIBFLOOR = '1';
process.env.SUCCGRACE = '1';
process.env.RAIDDENSITY = '1';
process.env.WINPURSUIT = '1';
process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0';
delete process.env.TREELINE;
delete process.env.ALLOWGATE2;
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const TL = require('./policies/treeline');

const SEEDS = [9911, 9913, 9915, 9917];
const DAYS = 60;
const PAIRS = [
  ['leadfeast', SD.leadseat, TL.leadfeastTreeline],
  ['belongfeast', SD.belongseat, TL.belongfeastTreeline],
];

async function runHashed(policy, seed) {
  const { Game } = await loadGame({ seed, mode: 'treeline-detgate', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const p = Object.assign({}, policy);
  const od = policy.daily;
  p.daily = (G, ctx) => { const r = od ? od(G, ctx) : undefined; hashes.push(G.state.scholar.day + ':' + dayHash(G)); return r; };
  await quietLog(() => runDays(Game, p, { days: DAYS }));
  return hashes;
}

async function main() {
  if (TL.layerOn()) { console.error('DET-GATE STOP: TREELINE is set — gate-off pin requires it unset.'); process.exit(2); }
  let bad = 0;
  for (const seed of SEEDS) for (const [pid, raw, wrapped] of PAIRS) {
    const a = await runHashed(raw, seed);
    const b = await runHashed(wrapped, seed);
    const same = a.length === b.length && a.length > 0 && a.every((h, i) => h === b[i]);
    console.log(`${same ? 'IDENTICAL' : 'MISMATCH'} ${pid} s${seed} (${a.length}/${b.length} dawns)`);
    if (!same) {
      bad++;
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) { console.log(`  first diff at dawn ${i}: ${a[i]} vs ${b[i]}`); break; }
      }
    }
  }
  if (bad) { console.log(`DET-GATE FAILED: ${bad}/16 pairs mismatch.`); process.exit(1); }
  console.log('DET-GATE GREEN: 16/16 gate-off trajectories byte-identical.');
}

if (require.main === module) { main().catch(e => { console.error('FATAL', e); process.exit(2); }); }
