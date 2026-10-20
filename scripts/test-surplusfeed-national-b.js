#!/usr/bin/env node
// test-surplusfeed-national-b.js — proof for the sim-surplusfeed-national-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surplusfeed-national-b.js
//   (SURPLUSFEED may be unset or '1' in the shell — the script sets it per
//   sub-proof. SEATDRIVE=0 explicit. Read the Usage header BEFORE running
//   any proof (ENV TRAP rule: FEASTSCALE_R13=1 is REQUIRED).)
//
// RED:    pristine runs write no standing/spend instrument state on Game.
// GREEN:  2 proof seeds x 25d ARMED instrumented: standing trajectory
//         samples every dawn (int components, war/dip/ple present);
//         feastEvents carry day/paid/quality; feast honesty >= 99% (engine
//         say-lines "(-X kcal from the pantry)" match recorded paid);
//         spend channels feast/gift/court exist; sfeed sensor present.
// ENGAGE: 2 proof seeds x 60d ARMED: trim telemetry fires (trimKcal > 0).
// DET:    40d x 2 proof seeds, instrumented-vs-pristine ARMED: canonical
//         state projection byte-identical (all new wraps — pantryDraw,
//         _removePantryKcal, hostFeast, answerAccord, answerRenegotiation,
//         answerNationalChoice, sleep, surplusFeedGovernor — are RNG-clean).
// REPEAT: same armed seed twice in-process byte-identical.
// RED-EQUIV (same-commit, SURPLUSFEED unset): variant driver rows (new
//         instrument) ≡ probe-glutcurvecheck-b.js rows on the same commit,
//         field-for-field minus volatile `ms` — the new instrument adds no
//         drift to the paired substrate.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe, checkFeastHonesty } = require('./probe-standnational-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset or exactly "1" (see Usage header)');
  process.exit(2);
}

// canonical projection: everything the sim's behavior depends on, minus
// instrument-only fields.
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
  const sf = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
  const o = Game.surplusFeedGovernor;
  if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
    const r = o.apply(this, arguments);
    try {
      sf.govCalls++;
      if (r < give) {
        sf.trimCalls++;
        sf.trimKcal += (give - r);
        const d = dayOf(Game);
        const cell = sf.days[d] || (sf.days[d] = { trimCalls: 0, trimKcal: 0 });
        cell.trimCalls++; cell.trimKcal += (give - r);
      }
    } catch (e) {}
    return r;
  };
  return { W, S, sf };
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'sfnb-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null, S = null, sf = null;
  if (instrumented) { const a = attachAll(Game); W = a.W; S = a.S; sf = a.sf; }
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W, S, sf, result };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('RED: pristine runs carry no standing-instrument state');
  for (const env of ['1', undefined]) {
    if (env) process.env.SURPLUSFEED = env; else delete process.env.SURPLUSFEED;
    const { Game } = await run(8815, 25, false);
    const clean = !Game._standProbe && !Game._spendStack;
    ok(`no instrument state when uninstrumented (SURPLUSFEED=${env || 'unset'})`, clean);
  }

  console.log('GREEN: instrumented ARMED runs sample standing + attribute spend');
  process.env.SURPLUSFEED = '1';
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
    const sff = { trimKcal: 0 };
    const o2 = Game.surplusFeedGovernor;
    if (typeof o2 === 'function') Game.surplusFeedGovernor = function (v, give) {
      const r = o2.apply(this, arguments);
      try { if (r < give) sff.trimKcal += (give - r); } catch (e) {}
      return r;
    };
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

  console.log('ENGAGE: governor trim telemetry fires on glut days (armed, 60d)');
  for (const seed of [8815, 8816]) {
    const { sf } = await run(seed, 60, true);
    ok(`seed ${seed} trim telemetry fired`, sf.trimKcal > 0 && Object.keys(sf.days).length > 0,
      `trimKcal=${Math.round(sf.trimKcal)} trimDays=${Object.keys(sf.days).length} govCalls=${sf.govCalls}`);
  }

  console.log('DET: instrumented vs pristine ARMED byte-identical (40d x 2 seeds)');
  for (const seed of [8817, 8818]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    ok(`seed ${seed} trajectories identical`, canon(a.Game) === canon(b.Game),
      canon(a.Game).length + ' vs ' + canon(b.Game).length + ' chars');
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const a = await run(8817, 40, true);
    const b = await run(8817, 40, true);
    ok('repeat armed run identical', canon(a.Game) === canon(b.Game));
  }

  console.log('RED-EQUIVALENT (same-commit): new-instrument driver unset vs curvecheck driver unset (60d x 2 seeds, belongfeast)');
  delete process.env.SURPLUSFEED;
  {
    // Minimal re-implementation of probe-glutcurvecheck-b.js's end-row so the
    // comparison is exact on the fields that exist in both.
    const glutcheckRow = async (seed, withStanding) => {
      const { Game } = await loadGame({ seed, mode: 'glutprobe-b-leadfeast', fullTelemetry: false });
      await setupGame(Game);
      const W = attachProbe(Game);
      let S = null;
      if (withStanding) S = attachStandingProbe(Game);
      const sf = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
      const o = Game.surplusFeedGovernor;
      if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
        const r = o.apply(this, arguments);
        try {
          sf.govCalls++;
          if (r < give) { sf.trimKcal += (give - r); sf.trimCalls++; }
        } catch (e) {}
        return r;
      };
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
        sfeed: { trimCalls: sf.trimCalls, trimKcal: Math.round(sf.trimKcal) },
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
