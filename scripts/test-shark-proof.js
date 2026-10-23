#!/usr/bin/env node
// scripts/test-shark-proof.js — proof for the shark adversary policy probe
// (roguelike-celebration audit Talk 1, P1-2).
//
// Usage:
//   node scripts/test-shark-proof.js
//
// Env:
//   SHARK_SEEDS    comma seeds, default "7,42,99,101,202,303,404,505" (8 =
//                  the balance contract's minimumPairs)
//   SHARK_DAYS     days per run, default 90
//   SHARK_POLICIES comma policy ids, default "shark,competent" (identical
//                  seeds x both policies; the inverted read needs the pair)
//
// What it proves:
//   1. The shark PLAYS: N seeds complete without a policy exception killing
//      a run; upkeep/daily/fight/contest/pending hooks all fire.
//   2. Wins are RECORDED per seed (Game.won), for shark and competent.
//   3. The shark's behavior is interpretable as degenerate-optimal: the
//      diagnostics show the known levers engaged (top-up preloads,
//      need-based patrols, exile-edge drain, contest EV refusals, table rush).
//   4. Prints the INVERTED read: shark.won >= competent.won -> the win
//      metric is reachable by degenerate play (investigation, never a
//      verdict, never a tuning directive).
//
// Exit 0: all assertions hold. Exit 1: the instrument is broken (a run died,
// missing diagnostics, zero patrol decisions). Zero wins is a VALID probe
// result, not a failure.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { shark } = require('./policies/shark');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SHARK_SEEDS || '7,42,99,101,202,303,404,505')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.SHARK_DAYS || '90', 10);
const POLICY_IDS = (process.env.SHARK_POLICIES || 'shark,competent')
  .split(',').map(s => s.trim()).filter(Boolean);
const REGISTRY = { shark, competent };

const failures = [];
function assert(cond, msg) {
  if (!cond) { failures.push(msg); console.error('  ASSERT FAIL: ' + msg); }
  else console.log('  ok: ' + msg);
}

(async () => {
  console.log(`shark proof: policies=[${POLICY_IDS.join(',')}] seeds=[${SEEDS.join(',')}] days=${DAYS}`);
  const rows = [];
  for (const pid of POLICY_IDS) {
    const base = REGISTRY[pid];
    if (!base) { console.error(`unknown policy: ${pid}`); process.exit(2); }
    for (const seed of SEEDS) {
      const { Game, manifest } = await loadGame({ seed, mode: 'shark-proof-' + pid, fullTelemetry: false });
      await setupGame(Game);
      const policy = Object.assign({}, base);
      let pctx = null;
      const baseSetup = policy.setup;
      policy.setup = (G, ctx) => { pctx = ctx; if (baseSetup) return baseSetup(G, ctx); };
      let result = null, err = null;
      try {
        result = await runDays(Game, policy, { days: DAYS, manifest, sampleEvery: 10 });
      } catch (e) { err = e; }
      assert(!err, `${pid} seed ${seed}: run completed without exception` + (err ? ` (${err.message})` : ''));
      if (err) continue;
      let diag = null;
      try { diag = (typeof base.diagnostics === 'function' && pctx) ? base.diagnostics(pctx) : null; }
      catch (e) { diag = { _err: String(e.message).slice(0, 60) }; }
      const row = {
        policy: pid, seed,
        days: result.days, gameDays: result.gameDays,
        endReason: result.endReason,
        won: !!Game.won,
        maxWave: result.maxWaveUnlocked || 1,
        diag,
      };
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.maxWave} won=${row.won ? 1 : 0}`);
    }
  }

  // --- assertions on the instrument ---
  const sharkRows = rows.filter(r => r.policy === 'shark');
  assert(sharkRows.length === SEEDS.length, `shark completed all ${SEEDS.length} seeds`);
  for (const r of sharkRows) {
    const d = r.diag || {};
    assert(d.sharkTopUps > 0, `shark seed ${r.seed}: top-up preloads fired (${d.sharkTopUps})`);
    assert((d.sharkPatrols || 0) + (d.sharkPatrolSkippedHungry || 0) + (d.sharkPatrolSkippedDrain || 0) > 0,
      `shark seed ${r.seed}: patrol decisions made (patrols=${d.sharkPatrols})`);
    assert(d.probe === 'MEASUREMENT PROBE, not shipped AI', `shark seed ${r.seed}: probe label present`);
  }
  // degenerate signature in aggregate: the shark must visibly skim the commons
  const drains = sharkRows.map(r => (r.diag || {}).sharkDrain || 0);
  const meanDrain = drains.reduce((a, b) => a + b, 0) / Math.max(1, drains.length);
  console.log(`  shark mean end-of-run net drain (takes-gives): ${Math.round(meanDrain)} kcal`);
  assert(meanDrain > 3000, `shark skims past winseek's 3000 guard on average (${Math.round(meanDrain)})`);
  const topped = sharkRows.reduce((t, r) => t + ((r.diag || {}).sharkFightsTopped || 0), 0);
  const untopped = sharkRows.reduce((t, r) => t + ((r.diag || {}).sharkFightsUntopped || 0), 0);
  console.log(`  shark fight entries: topped=${topped} untopped=${untopped}`);
  const refusals = sharkRows.reduce((t, r) => t + ((r.diag || {}).sharkContestRefusals || 0), 0);
  const takes = sharkRows.reduce((t, r) => t + ((r.diag || {}).sharkContestTakes || 0), 0);
  console.log(`  shark contests: takes=${takes} refusals=${refusals}`);

  // --- the inverted read (investigation, never a verdict) ---
  const wins = {};
  for (const pid of POLICY_IDS) wins[pid] = rows.filter(r => r.policy === pid && r.won).length;
  console.log('--- INVERTED READ ---');
  for (const pid of POLICY_IDS) console.log(`  ${pid}: ${wins[pid]}/${SEEDS.length} wins`);
  if (POLICY_IDS.includes('shark') && POLICY_IDS.includes('competent')) {
    if (wins.shark >= wins.competent)
      console.log('  READ: shark >= competent -> win metric reachable by degenerate play; levers above are DEGENERATE (investigate, do not tune).');
    else
      console.log('  READ: shark < competent -> degenerate play does not dominate; the win metric currently rewards the fuller game (investigate, do not tune).');
  }
  console.log('shark wins must NEVER tune the game harder or declare regressions (Steve 2026-10-15).');

  if (failures.length) { console.error(`PROOF FAILED: ${failures.length} assertion(s)`); process.exit(1); }
  console.log('PROOF GREEN: shark plays, wins recorded, degenerate signature interpretable.');
})().catch(e => { console.error('PROOF ERROR: ' + (e && e.stack || e)); process.exit(1); });
