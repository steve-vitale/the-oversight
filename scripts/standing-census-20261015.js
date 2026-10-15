#!/usr/bin/env node
'use strict';
// scripts/standing-census-20261015.js — standing-economy census sweep
// (sim-standecon, loop A, axis scale-onramp, 2026-10-15).
//
// DIAGNOSTIC INSTRUMENT — zero game-code changes. 16 runs: seeds
// 11/22/33/44/55/66/77/88 x {leadfeast, belongfeast}, 180d death-aware,
// FEASTSCALE_R13=1 asserted up front (same substrate as the wave4gate
// audit this run builds on; unset delegates to the parent policies
// byte-identically).
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14), written into the
// evidence header before any seed ran:
//   primary metric: 100% attribution of standing sources at unlock +
//     days-to-w4 per road — for every run that unlocks wave 4, the
//     war/diplomacy/plenty shares of raw standing at the unlock row
//     (from persisted rows, sampled every 5 game-days + unlock
//     transitions); days-to-w4 distribution per policy road.
//   GO threshold: all 16 runs fully classified (censusGo: every run
//     classified AND every w4-unlocking run's sources attributed) AND the
//     calibration brief written with measured-vs-intent numbers.
//   MISS (diagnostic): attribution < 100% on unlocking runs.
//   horizon: 180d, death-aware (+10d dead-village tail in sim-harness; dead
//     villages stop simulating). The question is what the standing
//     economy looks like on runs that live long enough to knock on the
//     wave-4 bar; short deaths census at their own standing numbers.
//   seeds: 8 (11..88) x 2 policies = 16 runs. No lever — diagnostic only.
//   policies: leadfeast (leadcourt + feastscale r13), belongfeast
//     (belongseek + feastscale r13).
//   secondary: the plenty-cap bind at w5 (gated-at-199 events per road);
//     source-gain traces (per-run per-day war/dip/plenty deltas);
//     feasts-at-unlock on the bread road (is t4=100 "nearly free"?);
//     wall numbers (national/table/wave-4-5/median survival/exiled).
// Sampling: bounded, every 5 game-days (day, uw, pts1/2, raw/gated/capped
// standing + breakdown, engaged3/4, readiness, peak, standingLine) +
// first-day unlock transitions + filtered say capture (wave/standing
// beats only, <=400 lines/run) — the sense test reads the standing
// hold/release beats for the rewritten defer text (SENSE-TESTING LAW).
// The harness silences sysSay for sims, so the sweep instrument-routes
// sysSay through the wrapped say with the engine's own routing
// (systemArrived honored) — the sanctioned instrument-side pattern from
// the wave4gate audit (harness default unchanged — loop-level call).
//
// Usage:
//   node scripts/standing-census-20261015.js
//   OUT=evidence/2026-10-15/standing-rows.json DAYS=180 node scripts/standing-census-20261015.js
process.env.FEASTSCALE_R13 = '1';
if (process.env.FEASTSCALE_R13 !== '1') { console.error('FATAL: FEASTSCALE_R13=1 not set'); process.exit(1); }
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { sampleGate, classifyGate, classifySample, censusRun, censusRoad, censusGo, SAYRE } = require('./standing-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => +s.trim()).filter(Boolean);
const POLICIES = [['leadfeast', leadfeast], ['belongfeast', belongfeast]];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-15/standing-rows.json';
const ROW_EVERY = 5;
const SAY_CAP = 400;

const gday = (G) => { try { return ((G && G.state && G.state.scholar) || {}).day || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId, POLICY) {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed, mode: 'standing-census', fullTelemetry: true });
  await setupGame(Game);
  const track = { unlockDay: {}, rows: [], sayLines: [], instrErrors: [], lastRowDay: -999, lastUw: 1 };
  try {
    const origSay = Game.say ? Game.say.bind(Game) : null;
    Game.say = function (msg) {
      try {
        const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
        if (SAYRE.test(text) && track.sayLines.length < SAY_CAP) {
          track.sayLines.push({ day: gday(Game),
            text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 300) });
        }
      } catch (e) { track.instrErrors.push('sayWrap: ' + e.message); }
      return origSay ? origSay(msg) : msg;
    };
  } catch (e) { track.instrErrors.push('sayWrapInstall: ' + e.message); }
  // sysSay routing (instrument-side, sanctioned pattern): the harness
  // installs a no-op sysSay for sims; the standing hold/release beats are
  // computed but narrated to nobody. Route through the wrapped say with the
  // engine's own routing (📺 SYSTEM: "<text>", systemArrived honored) so the
  // sense test can hear the rewritten defer text. No game-code/harness change.
  try {
    Game.sysSay = function (text) {
      try { if (Game.state && Game.state.systemArrived) Game.say('📺 SYSTEM: "' + text + '"'); } catch (e) {}
    };
  } catch (e) { track.instrErrors.push('sysSayWrap: ' + e.message); }
  const origDaily = POLICY.daily;
  const policy = Object.assign({}, POLICY);
  policy.daily = (G, ctx) => {
    try {
      const day = gday(G);
      let uw = 1;
      try { uw = (G.unlockedWave && G.unlockedWave()) || 1; } catch (e) {}
      for (let w = 1; w <= uw; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = day;
      if (uw !== track.lastUw || day - track.lastRowDay >= ROW_EVERY) {
        try {
          const row = sampleGate(G);
          row.gameDay = day;
          track.rows.push(row);
          track.lastRowDay = day;
        } catch (e) { track.instrErrors.push('sample: ' + e.message); }
      }
      track.lastUw = uw;
    } catch (e) { track.instrErrors.push('daily: ' + e.message); }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) { track.instrErrors.push('origDaily: ' + e.message); } }
  };
  let result = null, endErr = null;
  try {
    result = await quietLog(() => runDays(Game, policy, { days: DAYS, sampleEvery: 10 }));
  } catch (e) { endErr = String((e && e.message) || e); }
  let classification = null, finalSample = null, scaleRank = null, tableEver = false, exiled = false;
  try { classification = classifyGate(Game); } catch (e) { track.instrErrors.push('classify: ' + e.message); }
  try { finalSample = sampleGate(Game); } catch (e) {}
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; tableEver = !!(pg.tableWaiting || pg.tableEntered); } catch (e) {}
  try { exiled = !!(Game.state && Game.state.scholar && Game.state.scholar.exiled); } catch (e) {}
  const deaths = (result && result.samples && result.samples.deaths) || [];
  const rungHistory = [];
  let last4 = null, last5 = null;
  try {
    for (const row of track.rows) {
      const cs = classifySample(row, row.cfg);
      if (cs.w4.binding !== last4) { rungHistory.push({ day: row.gameDay, wave: 4, binding: cs.w4.binding }); last4 = cs.w4.binding; }
      if (cs.w5.binding !== last5) { rungHistory.push({ day: row.gameDay, wave: 5, binding: cs.w5.binding }); last5 = cs.w5.binding; }
    }
  } catch (e) { track.instrErrors.push('rungHistory: ' + e.message); }
  return {
    seed, policyId, FEASTSCALE_R13: '1', horizon: DAYS,
    gameDays: gday(Game), endReason: result ? result.endReason : ('ERROR:' + endErr),
    ms: Date.now() - t0,
    unlockDay: track.unlockDay,
    classification, rungHistory, finalSample,
    scaleRank, tableEver, exiled,
    playerDeaths: deaths.filter(d => d.player).length,
    villagerDeaths: deaths.filter(d => !d.player).length,
    sayLines: track.sayLines,
    rows: track.rows,
    instrErrors: track.instrErrors.slice(0, 20),
  };
}

(async () => {
  console.log('== standing census: ' + SEEDS.length + ' seeds x ' + POLICIES.length +
    ' policies = ' + (SEEDS.length * POLICIES.length) + ' runs, ' + DAYS + 'd death-aware, FEASTSCALE_R13=1 ==');
  const all = [];
  for (const [policyId, POLICY] of POLICIES) {
    for (const seed of SEEDS) {
      const r = await runOne(seed, policyId, POLICY);
      all.push(r);
      const c = r.classification || {};
      const cr = censusRun(r);
      console.log(`  ${policyId} s${seed}: days=${r.gameDays} end=${r.endReason} uw=${(c.uw || '?')} ` +
        `w4=${cr.w4.unlocked ? 'UNLOCKED@d' + cr.w4.day + ' dom=' + cr.w4.dominant : 'NO'} ` +
        `w5=${cr.w5.unlocked ? 'UNLOCKED' : 'no'} rank=${r.scaleRank} raw=${r.finalSample ? r.finalSample.raw : '?'}`);
    }
  }
  try {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ preReg: {
      primary: '100% attribution of standing sources at unlock + days-to-w4 per road',
      go: 'all 16 runs fully classified AND calibration brief written with measured-vs-intent numbers',
      miss: 'diagnostic MISS if attribution < 100% on unlocking runs',
      horizon: DAYS + 'd death-aware', seeds: SEEDS, policies: POLICIES.map(p => p[0]),
      substrate: 'FEASTSCALE_R13=1 asserted at top of script; no lever — diagnostic only',
      secondary: 'plenty-cap bind at w5 (gated-at-199 events per road); source-gain traces; feasts-at-unlock; wall numbers',
    }, runs: all }, null, 1));
  } catch (e) { console.error('WRITE FAIL: ' + e.message); process.exit(1); }
  const go = censusGo(all);
  console.log('\n== SUMMARY ==');
  for (const pid of POLICIES.map(p => p[0])) {
    const road = censusRoad(all, pid);
    console.log(`${pid}: runs=${road.runs} w4=${road.w4Unlock}/${road.runs} ` +
      `days-to-w4=[${road.w4Days.join(',')}] med=${road.w4Median} ` +
      `shares@unlock war=${(road.shareMeanAtUnlock.war * 100).toFixed(0)}% ` +
      `dip=${(road.shareMeanAtUnlock.diplomacy * 100).toFixed(0)}% ` +
      `bread=${(road.shareMeanAtUnlock.plenty * 100).toFixed(0)}% ` +
      `dom=${JSON.stringify(road.dominantAtUnlock)} ` +
      `w5=${road.w5Unlock}/${road.runs} capRuns=${road.capRuns} ` +
      `feasts@unlock med=${road.feastsMedian} ` +
      `attrib=${(road.attributionRate * 100).toFixed(0)}%`);
  }
  console.log(`GO check (censusGo): ${go.go ? 'GO' : 'MISS — ' + JSON.stringify(go.misses)}`);
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
