#!/usr/bin/env node
// scripts/run-bowldecline-20261015.js — PILOT driver for the bowldecline
// policy layer (loop B 2026-10-15, finding #340).
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14 — binding; judged against
// this header, never re-scored mid-run):
//   design: 8 seeds (11/22/33/44/55/66/77/88) x {leadcourt, belongseek} x
//     {control (BOWLDECLINE off), armed (BOWLDECLINE=1)}, 180d death-aware,
//     identical-seed before/after, own control in the same sweep.
//     Trust metrics via the TRUSTCENSUS=1 instrument (scripts/
//     trustcensus-lib-20261015.js); wall numbers via stdSnapshot.
//   PRIMARY: mean(armedCrossDay - controlCrossDay) >= +7d, where crossDay is
//     the first day the CUMULATIVE -5000 trust-drop bar trips (game.js
//     takeFromPantry; the bar the arm attacks) and a non-crossing run counts
//     its end day. Pooled over all 16 seed-policy pairs; GO additionally
//     requires no policy with a negative mean delay (no policy-level
//     backfire on the bar).
//   CO-PRIMARY: mean hunger-days (STARVING nights, census rows) armed <=
//     1.0x mean hunger-days control (pooled). Declined bowls are replaced by
//     packed meals — no hunger backfire.
//   GUARDRAILS (all binding): starvation deaths armed <= control+2; median
//     survival armed >= control-10d; national reach armed >= control-2;
//     no new death mode in armed; SOCIAL: sense-tested transcripts — decline
//     beats must not read as insult or antisocial coldness.
//   CONVERGENCE on this run: converging | converged | parked | killed-at-pilot.
//
// Usage: OUT=evidence/2026-10-15/bowldecline-pilot.json node scripts/run-bowldecline-20261015.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { stdSnapshot } = require('./sweep-compare');
const { installTrustCensus } = require('./trustcensus-lib-20261015');
const { layerBowlDecline } = require('./policies/bowldecline');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const SEEDS = process.env.SEEDS
  ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite)
  : [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = { leadcourt, belongseek };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const DAYS = parseInt(process.env.DAYS || '180', 10);

async function runOne(policyId, seed, armed) {
  if (armed) process.env.BOWLDECLINE = '1'; else delete process.env.BOWLDECLINE;
  process.env.TRUSTCENSUS = '1';
  const { Game, manifest } = await loadGame({ seed, mode: `bowldecline-${policyId}-${armed ? 'on' : 'off'}` });
  await setupGame(Game);
  const track = installTrustCensus(Game);
  const base = POLICIES[policyId];
  const policy = armed ? layerBowlDecline(base) : Object.assign({}, base);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const origDaily = policy.daily;
  policy.daily = (G, ctx) => {
    try { track.dawn(G); } catch (e) {}
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (s.tableEntered) hist.everEntered = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest });
  let fin = null;
  try { fin = track.finalize(); } catch (e) { fin = { error: String(e.message) }; }
  try { track.uninstall(); } catch (e) {}
  const end = stdSnapshot(Game);
  const cum = fin && fin.crossings && fin.crossings.cum;
  const rows = (fin && fin.rows) || [];
  const deaths = (result.samples && result.samples.deaths) || [];
  const starvDeaths = deaths.filter(d => /starv/i.test(String((d && d.cause) || ''))).length;
  const deathModes = {};
  for (const d of deaths) {
    const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
    deathModes[k] = (deathModes[k] || 0) + 1;
  }
  const declines = Game._bowlDeclines || [];
  return {
    policy: policyId, seed, armed: armed ? 1 : 0,
    days: result.days, endReason: result.endReason,
    crossDay: cum && cum.crossed ? cum.day : result.days,
    crossed: !!(cum && cum.crossed),
    mealShare: cum && cum.crossed ? cum.mealShare : null,
    trustAtCross: cum && cum.crossed ? cum.trust : null,
    hungerDays: rows.filter(r => r.hunger).length,
    declines: declines.length,
    declineDays: declines.map(d => d.day),
    // sense-testing: first 3 decline beats + 2 around the crossing
    declineBeats: declines.slice(0, 3).map(d => ({ day: d.day, beats: d.beats })),
    crossingBeats: (fin && fin.crossingBeats) || [],
    starvDeaths, deathModes,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: Math.max(hist.maxArc, end.arc || 1),
    national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
  };
}

function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }
function median(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }

(async () => {
  const runs = [];
  for (const policyId of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      for (const armed of [false, true]) {
        const r = await runOne(policyId, seed, armed);
        runs.push(r);
        console.log(`  [${r.policy}${r.armed ? '+bowl' : '      '} seed ${seed}] days=${r.days} end=${r.endReason} crossDay=${r.crossDay}${r.crossed ? '' : '(no)'} mealShare=${r.mealShare} hunger=${r.hungerDays} declines=${r.declines} nat=${r.national} won=${r.won}`);
      }
    }
  }
  // Paired analysis: delay = armed.crossDay - control.crossDay per (policy, seed).
  const pairs = [];
  for (const policyId of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const c = runs.find(r => r.policy === policyId && r.seed === seed && !r.armed);
      const a = runs.find(r => r.policy === policyId && r.seed === seed && r.armed);
      pairs.push({ policy: policyId, seed, delay: a.crossDay - c.crossDay, cCross: c.crossDay, aCross: a.crossDay });
    }
  }
  const byPolicy = {};
  for (const policyId of Object.keys(POLICIES)) {
    const ps = pairs.filter(p => p.policy === policyId);
    byPolicy[policyId] = { meanDelay: +mean(ps.map(p => p.delay)).toFixed(1), n: ps.length };
  }
  const armed = runs.filter(r => r.armed), control = runs.filter(r => !r.armed);
  const verdict = {
    meanDelay: +mean(pairs.map(p => p.delay)).toFixed(1),
    byPolicy,
    goPrimary: mean(pairs.map(p => p.delay)) >= 7 &&
      Object.values(byPolicy).every(b => b.meanDelay >= 0),
    hungerRatio: +(mean(armed.map(r => r.hungerDays)) / Math.max(0.5, mean(control.map(r => r.hungerDays)))).toFixed(2),
    starvArmed: armed.reduce((t, r) => t + r.starvDeaths, 0),
    starvControl: control.reduce((t, r) => t + r.starvDeaths, 0),
    medSurvArmed: median(armed.map(r => r.days)),
    medSurvControl: median(control.map(r => r.days)),
    natArmed: armed.reduce((t, r) => t + r.national, 0),
    natControl: control.reduce((t, r) => t + r.national, 0),
    winArmed: armed.reduce((t, r) => t + r.won, 0),
    winControl: control.reduce((t, r) => t + r.won, 0),
  };
  const armedModes = new Set(), controlModes = new Set();
  for (const r of armed) Object.keys(r.deathModes).forEach(k => armedModes.add(k));
  for (const r of control) Object.keys(r.deathModes).forEach(k => controlModes.add(k));
  verdict.newDeathModes = [...armedModes].filter(k => !controlModes.has(k));
  verdict.guardrails = {
    hunger: verdict.hungerRatio <= 1.0,
    starv: verdict.starvArmed <= verdict.starvControl + 2,
    surv: verdict.medSurvArmed >= verdict.medSurvControl - 10,
    nat: verdict.natArmed >= verdict.natControl - 2,
    deathModes: verdict.newDeathModes.length === 0,
  };
  const go = verdict.goPrimary && Object.values(verdict.guardrails).every(Boolean);
  console.log('\n=== PILOT VERDICT ===');
  console.log(JSON.stringify(verdict, null, 1));
  console.log(go ? 'GO — proceed to 12-16 seed confirm' : 'NO-GO — kill or revise per metric review');
  const out = process.env.OUT;
  const report = { label: 'bowldecline pilot', seeds: SEEDS, days: DAYS, runs, pairs, verdict, go,
    generated: new Date().toISOString() };
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1)); console.log('wrote ' + out); }
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
