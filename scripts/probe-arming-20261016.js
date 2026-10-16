#!/usr/bin/env node
// scripts/probe-arming-20261016.js — ARMING DIAGNOSTIC (sim-arming).
//
// Measures where the wave-4 readiness bars sit on the pre-seat courtship
// substrate WITHOUT any arming layer: per-day snapshot of
// Game.waveCombatReadiness(4) + standing totals, per policy x seed.
// Runs leadfeast / belongfeast baselines, SEATDRIVE=0, FEASTSCALE_R13=1.
//
// Usage: SEEDS="11,22" DAYS=180 node scripts/probe-arming-20261016.js
'use strict';
process.env.SEATDRIVE = '0';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function readiness(Game) {
  try {
    const r = Game.waveCombatReadiness(4);
    const tot = Game.villageStandingTotal();
    return {
      ready: r.ready, armored: r.armored, armed: r.armed, tricks: r.tricks, veterans: r.veterans,
      short: (r.short || []).join('|') || 'NONE',
      standing: (tot && (tot.gated != null ? tot.gated : tot.total)) | 0,
      wave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    };
  } catch (e) { return { err: String(e && e.message).slice(0, 60) }; }
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const policies = [leadfeast, belongfeast];
  for (const pol of policies) {
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'probe-arming-' + pol.id });
      await setupGame(Game);
      const trace = [];
      const base = pol;
      const policy = Object.assign({}, base, {
        daily(G, ctx) {
          const d = dayOf(G);
          if (d % 15 === 0 || d === 1) trace.push({ d, ...readiness(G) });
          if (base.daily) base.daily(G, ctx);
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 15 });
      trace.push({ d: dayOf(Game), ...readiness(Game), final: true });
      console.log(`[${pol.id} s${seed}] days=${result.days} end=${result.endReason || 'alive'}`);
      for (const t of trace) console.log('   ', JSON.stringify(t));
    }
  }
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
