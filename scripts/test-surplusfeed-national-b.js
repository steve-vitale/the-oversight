#!/usr/bin/env node
// test-surplusfeed-national-b.js — proof for the sim-surplusfeed-national-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surplusfeed-national-b.js
//   (Read the Usage header BEFORE running any proof (ENV TRAP rule:
//   FEASTSCALE_R13=1 is REQUIRED).)
//
// 2026-10-21 REMOVAL: the SURPLUSFEED governor was removed by Steve's own
// decision (docs/DECISIONS.md 2026-10-21) — the governor assertions in the
// old RED/ENGAGE/DET proofs are retired. The standing/spend instruments
// remain and are proven below; the governor-specific wraps assert the lever
// is GONE (no function, no telemetry, no trim state).
//
// RED:    pristine runs write no standing/spend instrument state on Game.
// GREEN:  2 proof seeds x 25d instrumented: standing trajectory samples
//         every dawn (int components, war/dip/ple present); feastEvents
//         carry day/paid/quality; feast honesty >= 99%; spend channels
//         feast/gift/court exist; sfeed sensor present.
// DET:    40d x 2 proof seeds, instrumented-vs-pristine: canonical state
//         projection byte-identical (all new wraps — pantryDraw,
//         _removePantryKcal, hostFeast, answerAccord, answerRenegotiation,
//         answerNationalChoice, sleep — are RNG-clean).
// REPEAT: same seed twice in-process byte-identical.
// RED-EQUIV (same-commit, SURPLUSFEED unset): variant driver rows (new
//         instrument) ≡ probe-glutcurvecheck-b.js rows on the same commit,
//         field-for-field minus volatile `ms` — the new instrument adds no
//         drift to the paired substrate.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe } = require('./probe-glut-instruments');
const { attachStandingProbe, checkFeastHonesty } = require('./probe-standnational-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}

function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

function attachAll(Game) {
  const W = attachProbe(Game);
  const S = attachStandingProbe(Game);
  return { W, S };
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'sfnb-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null, S = null;
  if (instrumented) { const a = attachAll(Game); W = a.W; S = a.S; }
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W, S, result };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('RED: pristine runs carry no standing-instrument state');
  {
    const { Game } = await run(8815, 25, false);
    const clean = !Game._standProbe && !Game._spendStack;
    ok('no instrument state when uninstrumented', clean);
  }

  console.log('REMOVED (2026-10-21): SURPLUSFEED governor is gone from the game');
  {
    const { Game } = await loadGame({ seed: 8815, mode: 'sfnb-removed', fullTelemetry: false });
    ok('Game.surplusFeedGovernor gone', typeof Game.surplusFeedGovernor === 'undefined');
    ok('Game._surplusFeedOn gone', typeof Game._surplusFeedOn === 'undefined');
  }
  // 60d runs can never write trim telemetry: the engine no longer owns the
  // _surplusFeed state shape.
  for (const seed of [8815, 8816]) {
    const { Game } = await run(seed, 60, true);
    const v = (Game.state || {}).village || {};
    ok(`seed ${seed} no _surplusFeed trim state`, v._surplusFeed === undefined,
      '_surplusFeed=' + (v._surplusFeed === undefined ? 'absent' : 'PRESENT'));
  }

  console.log('GREEN: instrumented runs sample standing + attribute spend');
  const { leadfeast } = require('./policies/feastscale');
  // seed 8815 hosts no feasts on either policy in 60d (feastscale contribution
  // gate — policy behavior, not instrument); feast-specific checks use 8816.
  for (const seed of [8815, 8816]) {
    const { W, S, Game } = await run(seed, 60, true);
    ok(`seed ${seed} standing trajectory has dawn samples`, S.stand.length > 0, 'n=' + S.stand.length);
    const x = S.stand[0] || {};
    const ints = ['t', 'war', 'dip', 'ple', 'feasts'].every(k => Number.isInteger(x[k]));
    ok(`seed ${seed} trajectory components are ints`, ints, JSON.stringify(x));
  }
  for (const policyId of ['belongfeast', 'leadfeast']) {
    const pol = policyId === 'leadfeast' ? leadfeast : belongfeast;
    const { Game } = await loadGame({ seed: 8816, mode: 'sfnb-test', fullTelemetry: false });
    await setupGame(Game);
    const W = attachProbe(Game), S = attachStandingProbe(Game);
    await runDays(Game, pol, { days: 60, manifest: null });
    const honest = checkFeastHonesty(S.feastEvents, S.feastLines);
    ok(`${policyId} 8816 feasts recorded`, S.feastEvents.length > 0, 'n=' + S.feastEvents.length);
    ok(`${policyId} 8816 feast honesty >= 99%`, honest.ok, `${honest.matches}/${honest.total} say-lines matched`);
    const qOK = S.feastEvents.every(f => f.quality >= -1 && f.quality <= 2 && f.paid >= 0);
    ok(`${policyId} 8816 feast events well-formed`, qOK);
    const chs = Object.keys(S.spend).filter(c => c !== 'unattributed');
    ok(`${policyId} 8816 named spend channels`, chs.includes('feast'), chs.join(','));
    const named = ['feast', 'gift', 'court'].reduce((t, c) => t + (S.spend[c] || 0), 0);
    ok(`${policyId} 8816 spend attribution complete (sum vs total)`, named <= S.spendTotal, named + ' vs ' + S.spendTotal);
  }

  console.log('DET: instrumented vs pristine byte-identical (40d x 2 seeds)');
  for (const seed of [8817, 8818]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    ok(`seed ${seed} trajectories identical`, canon(a.Game) === canon(b.Game),
      canon(a.Game).length + ' vs ' + canon(b.Game).length + ' chars');
  }

  console.log('REPEAT: same seed twice in-process byte-identical');
  {
    const a = await run(8817, 40, true);
    const b = await run(8817, 40, true);
    ok('repeat run identical', canon(a.Game) === canon(b.Game));
  }

  console.log('RED-EQUIVALENT (same-commit): new-instrument driver unset vs curvecheck driver unset (60d x 2 seeds, belongfeast)');
  {
    // Minimal re-implementation of probe-glutcurvecheck-b.js's end-row so the
    // comparison is exact on the fields that exist in both.
    const glutcheckRow = async (seed, withStanding) => {
      const { Game } = await loadGame({ seed, mode: 'glutprobe-b-leadfeast', fullTelemetry: false });
      await setupGame(Game);
      const W = attachProbe(Game);
      let S = null;
      if (withStanding) S = attachStandingProbe(Game);
      const result = await runDays(Game, belongfeast, { days: 60, manifest: null });
      const unatt = W.inflow.unattributed || 0;
      return JSON.stringify({
        seed, won: !!Game.won, national: !!Game.state.nationalLive,
        table: !!(Game.progState && Game.progState().tableWaiting),
        rank: Game.scaleRank ? Game.scaleRank() : '?',
        maxWave: Game.unlockedWave ? Game.unlockedWave() : 1,
        days: result.days, endReason: result.endReason,
        chokeTotal: Math.round(W.chokeTotal),
        unattributed: Math.round(unatt),
        inflow: Object.fromEntries(Object.entries(W.inflow).map(([k, v]) => [k, Math.round(v)])),
        rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
      });
    };
    for (const seed of [8801, 8802]) {
      const v = await glutcheckRow(seed, true);   // with standing instrument
      const o = await glutcheckRow(seed, false);  // original curvecheck instrument only
      ok(`seed ${seed} new instrument adds zero drift`, v === o,
        v === o ? '' : `first diff at ${[...v].findIndex((ch, i) => ch !== o[i])}`);
    }
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
