#!/usr/bin/env node
// scripts/proof-telemetry-20261013.js — PROOF OF EFFECT for the exhaustive
// player-verb telemetry (sim-harness.js PLAYER-VERB TELEMETRY block).
//
// The skill (proof-of-effect) demands the artifact BE the effect: a scripted
// sequence of known player actions through the harness must produce EXACTLY
// the expected per-category counts, and an internal-only game tick must
// produce ZERO deliberate-action counts. A test that counts its own
// scaffolding is a lie — so the controls below assert exact numbers.
//
// Controls:
//   A (scripted): 3-day run, daily = 2x forage + 1x eat + 1x talkTo.
//      Expects totalDeliberate == 12, byCategory == {field:6, food:3, social:3},
//      driver doAction:wait == 9 (3 forced day-loop waits/day), policyCalls == 3.
//   B (idle): 3-day run, no policy hooks. Expects totalDeliberate == 0 —
//      proves internal game-code verb traffic never leaks into deliberate.
//   C (old-metric-fails): on A's data, the OLD upper-bound metric
//      (meanVerbsPerDayLegacy, all origins) must EXCEED the new deliberate
//      count — demonstrating the old label "player decisions" was wrong and
//      the separation matters. Also asserts the accounting identity:
//      deliberate + driver + internal == legacy raw total (nothing lost).
//   D (no-behavior-change): same seed, 10 days, TELEMETRY_VERBS=1 vs 0 —
//      end state (days, endReason, pop, pantry, waveKills) must be identical.
//      Wrappers are pure passthrough; RNG untouched.
//
// Usage: node scripts/proof-telemetry-20261013.js
'use strict';
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');

const HARNESS_VERSION = (() => {
  try { return execSync('git log --format="%h %ad" --date=short -1 -- scripts/sim-harness.js', { cwd: __dirname }).toString().trim(); }
  catch (e) { return 'unknown'; }
})();

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}
const sumActs = (perDay) => {
  const out = {};
  for (const r of perDay) for (const [k, n] of Object.entries(r.acts || {})) out[k] = (out[k] || 0) + n;
  return out;
};

async function controlA() {
  console.log('CONTROL A: scripted policy, exact deliberate counts');
  const scripted = {
    id: 'telemetry-scripted',
    daily: (Game) => {
      Game.doAction('forage');
      Game.doAction('forage');
      Game.eat();
      const mine = Game.villagerId;
      const vids = ((Game.state.village || {}).roster || []).filter(id => id !== mine);
      if (vids[0]) { try { Game.talkTo(vids[0]); } catch (e) {} }
    },
  };
  const { Game } = await loadGame({ seed: 7, mode: 'telemetry-proof-A' });
  await setupGame(Game);
  const result = await runDays(Game, scripted, { days: 3, sampleEvery: 3 });
  const p = result.pacing;
  const acts = sumActs(p.perDay);
  console.log('  acts:', JSON.stringify(acts));
  check('totalDeliberate == 12', p.totalDeliberate === 12, `got ${p.totalDeliberate}`);
  check('byCategory == {field:6, food:3, social:3}',
    p.byCategory.field === 6 && p.byCategory.food === 3 && p.byCategory.social === 3,
    JSON.stringify(p.byCategory));
  check('driver doAction:wait == 9', acts['driver:doAction:wait'] === 9, `got ${acts['driver:doAction:wait']}`);
  const pc = p.perDay.reduce((t, r) => t + (r.policyCalls || 0), 0);
  check('policyCalls == 3 (daily x3)', pc === 3, `got ${pc}`);
  // accounting identity
  const legacy = p.perDay.reduce((t, r) => t + (r.verbs || 0), 0);
  check('deliberate+driver+internal == legacy raw',
    p.totalDeliberate + p.totalDriver + p.totalInternal === legacy,
    `${p.totalDeliberate}+${p.totalDriver}+${p.totalInternal}=${p.totalDeliberate + p.totalDriver + p.totalInternal} vs legacy ${legacy}`);
  return { legacy, deliberate: p.totalDeliberate };
}

async function controlB() {
  console.log('CONTROL B: idle policy, internal-only ticks');
  const { Game } = await loadGame({ seed: 7, mode: 'telemetry-proof-B' });
  await setupGame(Game);
  const result = await runDays(Game, { id: 'telemetry-idle' }, { days: 3, sampleEvery: 3 });
  const p = result.pacing;
  check('totalDeliberate == 0 (internal never leaks)', p.totalDeliberate === 0, `got ${p.totalDeliberate}`);
  console.log('  internalByVerb (game-code-internal traffic, excluded):', JSON.stringify(p.internalByVerb));
  console.log('  byCategoryDriver:', JSON.stringify(p.byCategoryDriver));
}

async function controlC(a) {
  console.log('CONTROL C: old upper-bound metric mislabels (old-code-fails)');
  check('legacy raw > deliberate (old metric inflated)',
    a.legacy > a.deliberate, `legacy=${a.legacy} deliberate=${a.deliberate}`);
  console.log(`  The old metric would have reported ${a.legacy} "player verbs" over 3 days;`);
  console.log(`  only ${a.deliberate} were deliberate player decisions. The separation is load-bearing.`);
}

async function controlD() {
  console.log('CONTROL D: no behavior change (TELEMETRY_VERBS=1 vs 0)');
  const snap = async (verbsOn) => {
    process.env.TELEMETRY_VERBS = verbsOn ? '1' : '0';
    const { Game } = await loadGame({ seed: 11, mode: 'telemetry-proof-D' });
    await setupGame(Game);
    const { competent } = require('./policies/competent');
    const result = await runDays(Game, competent, { days: 10, sampleEvery: 10 });
    let pantry = 0;
    try {
      pantry = ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    } catch (e) {}
    return {
      days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      pop: ((Game.state.village || {}).roster || []).length,
      pantry: Math.round(pantry), waveKills: JSON.stringify(result.waveKills || {}),
    };
  };
  const on = await snap(true);
  const off = await snap(false);
  delete process.env.TELEMETRY_VERBS;
  console.log('  on :', JSON.stringify(on));
  console.log('  off:', JSON.stringify(off));
  check('end state identical with/without instrumentation', JSON.stringify(on) === JSON.stringify(off));
}

(async () => {
  console.log(`proof-telemetry-20261013 — harness sim-harness.js @ ${HARNESS_VERSION}`);
  const a = await controlA();
  await controlB();
  await controlC(a);
  await controlD();
  console.log(failures ? `\n${failures} FAILURES` : '\nALL CONTROLS GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
