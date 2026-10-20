#!/usr/bin/env node
// test-glutcurvecheck-b.js — proof for the sim-surplusfeed-curvecheck-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-glutcurvecheck-b.js
//   (SURPLUSFEED may be unset or '1' in the shell — the script sets it per
//   sub-proof. SEATDRIVE=0 explicit. Read the Usage header BEFORE running
//   any proof (ENV TRAP rule: FEASTSCALE_R13=1 is REQUIRED).)
//
// RED:    pristine (uninstrumented) runs write no _diagCh/_diagArr tags
//         (armed and unset).
// GREEN:  2 proof seeds x 25d ARMED instrumented: chokeTotal > 0;
//         unattributed < 1% of chokeTotal (instrument honesty >= 99%,
//         the binding bar); dawnSamples carry freshDays + doomedKcal;
//         >= 4 named channels.
// ENGAGE: 2 proof seeds x 60d ARMED: the surplusFeedGovernor trim telemetry
//         fires (trimKcal > 0, trimDays > 0) — the governor ENGAGES on glut
//         days, not just present in code.
// DET:    40d x 2 proof seeds, instrumented-vs-pristine ARMED: canonical
//         state projection byte-identical (instruments + sensor are
//         RNG-clean; the governor's own _surplusFeed writes are engine
//         behavior, present on both sides, excluded from the projection).
// RED-EQUIV (same-commit, 60d x 2 seeds, SURPLUSFEED unset): the variant
//         driver (with its sfeed sensor) ≡ the original probe-glut-b.js on
//         the same commit — full row JSONs byte-identical, no `ms` involved.
//         The landed corpus is NOT reproducible on current master (master
//         movement 16:30Z→19:26Z shifted the RNG stream; diagnosed: the
//         original probe reproduces the divergence identically), so a
//         same-commit 16-run control re-run is the paired before — the
//         byte-identical claim is variant-unset vs original-unset, which is
//         what "the variant introduces zero drift" means.
// REPEAT (det-gate (d)): same armed seed run twice in-process — canonical
//         projection byte-identical.
'use strict';
const assert = require('assert');
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset or exactly "1" (see Usage header)');
  process.exit(2);
}

// canonical projection: everything the sim's behavior depends on, minus
// instrument-only fields (_diag*) and engine trim bookkeeping (_surplusFeed).
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'glutcurvecheck-test', fullTelemetry: false });
  await setupGame(Game);
  let W = null;
  if (instrumented) {
    W = attachProbe(Game);
    W.sfeed = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
    const o = Game.surplusFeedGovernor;
    if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
      const r = o.apply(this, arguments);
      try {
        W.sfeed.govCalls++;
        if (r < give) {
          W.sfeed.trimCalls++;
          W.sfeed.trimKcal += (give - r);
          const d = dayOf(Game);
          const cell = W.sfeed.days[d] || (W.sfeed.days[d] = { trimCalls: 0, trimKcal: 0 });
          cell.trimCalls++; cell.trimKcal += (give - r);
        }
      } catch (e) {}
      return r;
    };
  }
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W, result };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('RED: pristine runs write no instrument tags (armed + unset)');
  for (const env of ['1', undefined]) {
    if (env) process.env.SURPLUSFEED = env; else delete process.env.SURPLUSFEED;
    const { Game } = await run(8815, 25, false);
    let tagged = 0;
    for (const it of (((Game.state || {}).village || {}).pantry || [])) {
      if (it && ('_diagCh' in it || '_diagArr' in it)) tagged++;
    }
    ok(`no tags when uninstrumented (SURPLUSFEED=${env || 'unset'})`, tagged === 0, tagged + ' tagged items');
  }

  console.log('GREEN: instrumented ARMED runs conserve + attribute fully');
  process.env.SURPLUSFEED = '1';
  for (const seed of [8815, 8816]) {
    const { W } = await run(seed, 25, true);
    const sum = Object.values(W.inflow).reduce((a, b) => a + b, 0);
    ok(`seed ${seed} chokeTotal > 0`, W.chokeTotal > 0, 'chokeTotal=' + W.chokeTotal);
    ok(`seed ${seed} channels sum === chokeTotal`, sum === W.chokeTotal, sum + ' vs ' + W.chokeTotal);
    const un = W.inflow.unattributed || 0;
    ok(`seed ${seed} unattributed < 1%`, un < 0.01 * W.chokeTotal, 'unattributed=' + un + ' of ' + W.chokeTotal);
    const hasDawn = W.dawnSamples.length > 0 && W.dawnSamples.every(s => typeof s.freshDays === 'number' && typeof s.doomedKcal === 'number');
    ok(`seed ${seed} dawnSamples carry freshDays+doomedKcal`, hasDawn, 'n=' + W.dawnSamples.length);
    const chanNames = Object.keys(W.inflow).filter(c => c !== 'unattributed');
    ok(`seed ${seed} >= 4 named channels`, chanNames.length >= 4, chanNames.join(','));
  }

  console.log('ENGAGE: governor trim telemetry fires on glut days (armed)');
  for (const seed of [8815, 8816]) {
    const { W, Game } = await run(seed, 60, true);
    let glutDawns = 0;
    for (const s of W.dawnSamples) if (s.freshDays >= 7) glutDawns++;
    ok(`seed ${seed} reached glut dawns`, glutDawns > 0, 'glutDawns=' + glutDawns + '/' + W.dawnSamples.length);
    ok(`seed ${seed} trim telemetry fired`, W.sfeed.trimKcal > 0 && Object.keys(W.sfeed.days).length > 0,
      `trimKcal=${Math.round(W.sfeed.trimKcal)} trimDays=${Object.keys(W.sfeed.days).length} govCalls=${W.sfeed.govCalls}`);
    const beats = (Game._sayLog || []);
    console.log(`    seed ${seed}: govCalls=${W.sfeed.govCalls} trimCalls=${W.sfeed.trimCalls} trimKcal=${Math.round(W.sfeed.trimKcal / 1000)}k over ${Object.keys(W.sfeed.days).length}d`);
  }

  console.log('DET: instrumented vs pristine ARMED byte-identical (40d x 2 seeds)');
  for (const seed of [8817, 8818]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed} trajectories identical`, ca === cb, ca.length + ' vs ' + cb.length + ' chars');
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const a = await run(8817, 40, true);
    const b = await run(8817, 40, true);
    ok('repeat armed run identical', canon(a.Game) === canon(b.Game));
  }

  // RED-EQUIV (same-commit): variant driver (SURPLUSFEED unset) ≡ original
// probe-glut-b.js on the same commit — the landed corpus is NOT reproducible
// on current master (master movement between 16:30Z and 19:26Z shifted the
// RNG stream; diagnosed: original probe reproduces the divergence
// identically, seed 8801 leadfeast days=152 village-lost vs landed 180
// survived, first dawn divergence day 3). The honest same-commit
// RED-equivalent is variant-unset vs original-unset: full row JSONs
// byte-identical minus the volatile `ms` field. A same-commit 16-run
// control re-run (original probe, SURPLUSFEED unset) is the paired before.
console.log('RED-EQUIVALENT (same-commit): variant unset vs original probe (2 seeds x 60d, leadfeast)');
delete process.env.SURPLUSFEED;
  {
    const { leadfeast } = require('./policies/feastscale');
    const runLike = async (seed, variantSensor) => {
      const { Game } = await loadGame({ seed, mode: 'glutprobe-b-leadfeast', fullTelemetry: false });
      await setupGame(Game);
      const W = attachProbe(Game);
      if (variantSensor) {
        // the sweep driver's sfeed wrap — must be behavior-transparent when unset
        W.sfeed = { govCalls: 0, trimCalls: 0, trimKcal: 0, days: {} };
        const o = Game.surplusFeedGovernor;
        if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
          const r = o.apply(this, arguments);
          try {
            W.sfeed.govCalls++;
            if (r < give) {
              W.sfeed.trimCalls++; W.sfeed.trimKcal += (give - r);
              const d = dayOf(Game);
              const cell = W.sfeed.days[d] || (W.sfeed.days[d] = { trimCalls: 0, trimKcal: 0 });
              cell.trimCalls++; cell.trimKcal += (give - r);
            }
          } catch (e) {}
          return r;
        };
      }
      const result = await runDays(Game, leadfeast, { days: 60, manifest: null });
      const unatt = W.inflow.unattributed || 0;
      const unattShare = W.chokeTotal > 0 ? unatt / W.chokeTotal : 0;
      let nationalLive = false, tableWaiting = false, rank = '?', maxWave = 1, arc = 1, rosterEnd = 0;
      try {
        nationalLive = !!((Game.state || {}).nationalLive);
        const ps = Game.progState ? Game.progState() : {};
        tableWaiting = !!(ps.tableWaiting);
        rank = Game.scaleRank ? Game.scaleRank() : '?';
        maxWave = Game.unlockedWave ? Game.unlockedWave() : 1;
        arc = (ps || {}).arc || 1;
        rosterEnd = (((Game.state || {}).village || {}).roster || []).length;
      } catch (e) {}
      return {
        seed, won: !!Game.won, national: nationalLive, table: tableWaiting,
        rank, maxWave, arc, rosterEnd, days: result.days, endReason: result.endReason,
        chokeTotal: Math.round(W.chokeTotal),
        unattributed: Math.round(unatt), unattShare: +unattShare.toFixed(4),
        inflow: Object.fromEntries(Object.entries(W.inflow).map(([k, v]) => [k, Math.round(v)])),
        rotFresh: Math.round(W.rotFresh), rotPreserved: Math.round(W.rotPreserved),
        rotByCh: Object.fromEntries(Object.entries(W.rotByCh).map(([k, v]) => [k, Math.round(v)])),
        rotByChFast: Object.fromEntries(Object.entries(W.rotByChFast).map(([k, v]) => [k, Math.round(v)])),
        dutyPreserved: Math.round(W.dutyPreserved), laundered: W.laundered,
        throttleCalls: W.throttleCalls, throttleEngaged: W.throttleEngaged,
        starveDays: W.starveDays, deaths: W.deaths, dawnSamples: W.dawnSamples,
        dayInflow: W.dayInflow, dayDuty: W.dayDuty, dayThrottle: W.dayThrottle,
      };
    };
    for (const seed of [8801, 8802]) {
      const v = await runLike(seed, true);   // variant (with sensor), SURPLUSFEED unset
      const o = await runLike(seed, false);  // original (no sensor)
      const g = JSON.stringify(v), w = JSON.stringify(o);
      ok(`seed ${seed} variant-unset ≡ original (same commit)`, g === w,
        g === w ? '' : `first diff at ${[...g].findIndex((ch, i) => ch !== w[i])}`);
    }
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
