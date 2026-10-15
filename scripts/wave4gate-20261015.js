#!/usr/bin/env node
'use strict';
// scripts/wave4gate-20261015.js — wave-4/5 unlock gate audit instrument
// (fleshout-a-2026-10-15T151641Z, loop A, axis scale-onramp, 2026-10-15).
//
// DIAGNOSTIC INSTRUMENT — zero game-code changes. 16 runs: seeds
// 11/22/33/44/55/66/77/88 x {leadfeast, belongfeast}, 180d death-aware,
// FEASTSCALE_R13=1 asserted up front (the r13 feast layer on the courtship
// roads; unset delegates to the parent policies byte-identically — the
// task pre-registers this substrate for both sides).
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14), written verbatim into
// the evidence header before any seed ran:
//   primary metric: wave-4 unlock share + binding-rung attribution on
//     non-unlocking runs. For each run that never unlocks wave 4 by end:
//     the binding rung named and numbered (w3-day-floor | w3-ledger2 |
//     standing-raw | standing-defer4), with the actual numbers.
//   GO threshold: 100% of runs classified (unlocked with day+rung, or
//     non-unlocked with the binding rung named and numbered).
//   horizon: 180d, death-aware (+10d dead-village tail in sim-harness; dead
//     villages stop simulating). The question is whether the gate binds on
//     runs that live long enough to knock on it; short deaths classify at
//     their own rungs (day-floor/ledger).
//   seeds: 8 (11..88) x 2 policies = 16 runs. PILOT GATE: this IS the pilot
//     (n=16 screens whether a confirm round is worth it — a second 16 with
//     different seeds if wave-4 unlocks cluster or the rung mix looks noisy).
//   policies: leadfeast (leadcourt + feastscale r13), belongfeast
//     (belongseek + feastscale r13) — the two courtship roads the scale-wall
//     work pushed. FEASTSCALE_R13=1 asserted at the top of this file.
//   secondary: wave-5 unlock share + binding rung (standing<t5, split
//     standing-raw vs standing-defer5 vs standing-cap (plenty cap — the
//     bread-alone rung), vs w4faced=0); median day of wave-4 unlock.
// Sampling: bounded, every 5 game-days (day, uw, pts1/2, raw/gated standing
// + breakdown, engaged3/4, readiness, peak ratchet, standingLine) + first-day
// unlock transitions + filtered say capture (wave/standing beats only,
// <=500 lines/run). Instrument is engine-read-equivalent (see lib header).
// The harness silences sysSay for sims, so the sweep instrument-routes
// sysSay through the wrapped say (the engine's own routing, systemArrived
// honored) — otherwise the standing hold/release beats are computed but
// narrated to nobody and the sense test can't hear them. Rung history:
// classifySample (pure) is run over every stored row, so rungs that bound
// mid-run and released are reported, not just the end-state binding.
//
// Usage:
//   node scripts/wave4gate-20261015.js
//   OUT=evidence/2026-10-15/wave4gate-rows.json DAYS=180 node scripts/wave4gate-20261015.js
process.env.FEASTSCALE_R13 = '1';
if (process.env.FEASTSCALE_R13 !== '1') { console.error('FATAL: FEASTSCALE_R13=1 not set'); process.exit(1); }
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { sampleGate, classifyGate, classifySample, SAYRE } = require('./wave4gate-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => +s.trim()).filter(Boolean);
const POLICIES = [['leadfeast', leadfeast], ['belongfeast', belongfeast]];
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || 'evidence/2026-10-15/wave4gate-rows.json';
const ROW_EVERY = 5;
const SAY_CAP = 500;

const gday = (G) => { try { return ((G && G.state && G.state.scholar) || {}).day || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId, POLICY) {
  const t0 = Date.now();
  const { Game } = await loadGame({ seed, mode: 'wave4gate', fullTelemetry: true });
  await setupGame(Game);
  const track = { unlockDay: {}, rows: [], sayLines: [], instrErrors: [], lastRowDay: -999, lastUw: 1 };
  // say wrap: wave/standing beats only, bounded. sysSay() routes through
  // Game.say, so the standing hold/release beats and the unlock beats land
  // here too. Read-only: call-through preserved.
  try {
    const origSay = Game.say ? Game.say.bind(Game) : null;
    Game.say = function (msg) {
      try {
        const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
        if (SAYRE.test(text) && track.sayLines.length < SAY_CAP) {
          track.sayLines.push({ day: gday(Game),
            text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 280) });
        }
      } catch (e) { track.instrErrors.push('sayWrap: ' + e.message); }
      return origSay ? origSay(msg) : msg;
    };
  } catch (e) { track.instrErrors.push('sayWrapInstall: ' + e.message); }
  // sysSay routing (instrument-side): the harness silences sysSay for sims
  // (loadGame installs a no-op), so the standing hold/release beats ("The
  // Mirror Draft is not for strangers", "The fifth draft is not bought with
  // bread alone", "RATINGS ARE UP") never reach say in sims — the
  // no-silent-gates machinery computes (gated numbers, _standingDeferBeat)
  // but narrates to nobody. The sense test needs to hear them. Restore the
  // engine's own routing (game.js sysSay: 📺 SYSTEM: "<text>", minus audio)
  // through the wrapped say above, honoring the systemArrived gate exactly
  // as the engine does. No game-code or harness change; origSysSay is the
  // harness no-op, so behavior is capture-only.
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
  let classification = null, finalSample = null, scaleRank = null, tableEver = false;
  try { classification = classifyGate(Game); } catch (e) { track.instrErrors.push('classify: ' + e.message); }
  try { finalSample = sampleGate(Game); } catch (e) {}
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; tableEver = !!(pg.tableWaiting || pg.tableEntered); } catch (e) {}
  const deaths = (result && result.samples && result.samples.deaths) || [];
  // RUNG HISTORY: which rungs bound mid-run, not just at end. classifySample
  // is pure over the stored rows (same code as the end-state classifier).
  const rungHistory = [];
  let last4 = null, last5 = null;
  try {
    for (const row of track.rows) {
      const cs = classifySample(row, row.cfg);
      if (cs.w4.binding !== last4) { rungHistory.push({ day: row.gameDay, wave: 4, binding: cs.w4.binding }); last4 = cs.w4.binding; }
      if (cs.w5.binding !== last5) { rungHistory.push({ day: row.gameDay, wave: 5, binding: cs.w5.binding }); last5 = cs.w5.binding; }
    }
  } catch (e) { track.instrErrors.push('rungHistory: ' + e.message); }
  const out = {
    seed, policyId, FEASTSCALE_R13: '1', horizon: DAYS,
    gameDays: gday(Game), endReason: result ? result.endReason : ('ERROR:' + endErr),
    ms: Date.now() - t0,
    unlockDay: track.unlockDay,
    classification,
    rungHistory,
    finalSample,
    scaleRank, tableEver,
    playerDeaths: deaths.filter(d => d.player).length,
    villagerDeaths: deaths.filter(d => !d.player).length,
    sayLines: track.sayLines,
    rows: track.rows,
    instrErrors: track.instrErrors.slice(0, 20),
  };
  return out;
}

(async () => {
  console.log('== wave4gate audit: ' + SEEDS.length + ' seeds x ' + POLICIES.length +
    ' policies = ' + (SEEDS.length * POLICIES.length) + ' runs, ' + DAYS + 'd death-aware, FEASTSCALE_R13=1 ==');
  const all = [];
  for (const [policyId, POLICY] of POLICIES) {
    for (const seed of SEEDS) {
      const r = await runOne(seed, policyId, POLICY);
      all.push(r);
      const c = r.classification || {};
      console.log(`  ${policyId} s${seed}: days=${r.gameDays} end=${r.endReason} uw=${(c.uw || '?')} ` +
        `w4=${(c.w4 && c.w4.unlocked) ? 'UNLOCKED@' + (r.unlockDay[4] != null ? 'd' + r.unlockDay[4] : '?') : 'NO:' + (c.w4 && c.w4.binding)} ` +
        `w5=${(c.w5 && c.w5.unlocked) ? 'UNLOCKED' : 'no:' + (c.w5 && c.w5.binding)} ` +
        `rank=${r.scaleRank} raw=${r.finalSample ? r.finalSample.raw : '?'} gated=${r.finalSample ? r.finalSample.gated : '?'} (${((Date.now()) / 1000) | 0})`);
    }
  }
  try {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ preReg: {
      primary: 'wave-4 unlock share + binding-rung attribution on non-unlocking runs',
      go: '100% of runs classified (unlocked with day+rung, or non-unlocked with binding rung named+numbered)',
      horizon: DAYS + 'd death-aware', seeds: SEEDS, policies: POLICIES.map(p => p[0]),
      substrate: 'FEASTSCALE_R13=1 asserted at top of script',
      secondary: 'wave-5 unlock share + binding rung (standing<t5 split raw vs defer5 vs cap, vs w4faced=0); median wave-4 unlock day; standing breakdown at the bar',
    }, runs: all }, null, 1));
  } catch (e) { console.error('WRITE FAIL: ' + e.message); process.exit(1); }
  // --- summary table ---
  const u4 = all.filter(r => r.classification && r.classification.w4 && r.classification.w4.unlocked);
  const u5 = all.filter(r => r.classification && r.classification.w5 && r.classification.w5.unlocked);
  const u4days = u4.map(r => r.unlockDay[4]).filter(d => d != null).sort((a, b) => a - b);
  const med = u4days.length ? u4days[Math.floor(u4days.length / 2)] : null;
  const rung4 = {}, rung5 = {};
  for (const r of all) {
    const b4 = (r.classification && r.classification.w4 && r.classification.w4.binding) || 'unclassified';
    const b5 = (r.classification && r.classification.w5 && r.classification.w5.binding) || 'unclassified';
    rung4[b4] = (rung4[b4] || 0) + 1;
    rung5[b5] = (rung5[b5] || 0) + 1;
  }
  console.log('\n== SUMMARY ==');
  console.log(`wave-4 unlock: ${u4.length}/${all.length}   median unlock day: ${med == null ? 'n/a' : med}   wave-5 unlock: ${u5.length}/${all.length}`);
  console.log('w4 rungs (end-state): ' + Object.keys(rung4).sort().map(k => `${k}=${rung4[k]}`).join('  '));
  console.log('w5 rungs (end-state): ' + Object.keys(rung5).sort().map(k => `${k}=${rung5[k]}`).join('  '));
  const ever4 = {}, ever5 = {};
  for (const r of all) for (const h of (r.rungHistory || [])) {
    const b = (h.wave === 4 ? ever4 : ever5);
    b[h.binding] = (b[h.binding] || 0) + 1;
  }
  const everRuns4 = {}, everRuns5 = {};
  for (const r of all) {
    const seen4 = new Set(), seen5 = new Set();
    for (const h of (r.rungHistory || [])) (h.wave === 4 ? seen4 : seen5).add(h.binding);
    for (const b of seen4) everRuns4[b] = (everRuns4[b] || 0) + 1;
    for (const b of seen5) everRuns5[b] = (everRuns5[b] || 0) + 1;
  }
  console.log('w4 rungs ever binding (runs): ' + Object.keys(everRuns4).sort().map(k => `${k}=${everRuns4[k]}`).join('  '));
  console.log('w5 rungs ever binding (runs): ' + Object.keys(everRuns5).sort().map(k => `${k}=${everRuns5[k]}`).join('  '));
  const unclassified = all.filter(r => !r.classification || !r.classification.w4 || !r.classification.w4.binding);
  console.log(`GO check (100% classified): ${unclassified.length === 0 ? 'GO' : 'MISS — ' + unclassified.length + ' unclassified'}`);
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
