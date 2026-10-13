#!/usr/bin/env node
// scripts/sweep-action-telemetry-20261013.js — ACTION TELEMETRY + VILLAGER-COUNTER GO SWEEP.
//
// MEASUREMENT ONLY. No game-code changes. 32-run courtship suite at the
// 180-day pacing-law horizon (WIN-PATH HORIZON 180, Steve 2026-10-13):
// seeds 11/22/33/44/55/66/77/88 x competent/winseek/belongseek/leadcourt.
// Carries the standing-tune measurements (wave-4 unlock rate etc.) AND the
// exhaustive player-verb telemetry (sim-harness.js PLAYER-VERB TELEMETRY):
// deliberate (policy-origin) actions per day by category, driver/internal
// separation, dayTicks utilization. Daily progress rows (standing, ledger
// magnitude, scale rank, codex counts) feed stall/tedium detection in the
// analyzer. Also the villager-counter arm GO check (parent task 2026-10-13):
// villager wave-3 kills > 0 across the suite (attributed via death telemetry:
// kind=monster, wave=3, cause='patrol combat') with no median-survival
// regression vs the standing-tune baseline medianDays=71.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="competent,winseek,belongseek,leadcourt" DAYS=180 \
//   OUT=evidence/2026-10-13/sim-action-telemetry.json \
//   node scripts/sweep-action-telemetry-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');

const POLICY_REGISTRY = { competent, winseek, belongseek, leadcourt };
const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// ---------- standing sampling ----------
function standingSample(Game) {
  const d = day(Game);
  let s = null, wave = 1;
  try { s = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null; } catch (e) {}
  try { wave = (typeof Game.unlockedWave === 'function') ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  return {
    day: d,
    total: s ? (s.total | 0) : 0,
    war: s ? (s.war | 0) : 0, diplomacy: s ? (s.diplomacy | 0) : 0, plenty: s ? (s.plenty | 0) : 0,
    warPts: s ? (s.warPts | 0) : 0, links: s ? (s.links | 0) : 0, feasts: s ? (s.feasts | 0) : 0,
    wave,
  };
}

// classifyDriver: which source drove the T4 crossing. Pure if one source is
// >= 80% of total, else hybrid. 'none' when total is 0 (defensive).
function classifyDriver(smp) {
  const total = smp.total | 0;
  if (total <= 0) return 'none';
  const shares = { war: smp.war / total, diplomacy: smp.diplomacy / total, plenty: smp.plenty / total };
  for (const k of ['war', 'diplomacy', 'plenty']) if (shares[k] >= 0.8) return k;
  return 'hybrid';
}

// detectCrossings: first-crossing days over an ordered sample array.
// Returns {t4Day, t5Day, wave4Day, wave5Day, atT4} where atT4 is the sample
// at (or just after) the T4 crossing, for driver classification.
function detectCrossings(rows, t4, t5) {
  const out = { t4Day: null, t5Day: null, wave4Day: null, wave5Day: null, atT4: null };
  for (const r of rows) {
    if (out.t4Day == null && r.total >= t4) { out.t4Day = r.day; out.atT4 = r; }
    if (out.t5Day == null && r.total >= t5) out.t5Day = r.day;
    if (out.wave4Day == null && r.wave >= 4) out.wave4Day = r.day;
    if (out.wave5Day == null && r.wave >= 5) out.wave5Day = r.day;
  }
  return out;
}

function attachStanding(Game, m) {
  const st = m.standing = { rows: [], cross: null };
  let cfg = { t4: 100, t5: 200 };
  try {
    const c = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
    if (c) { cfg = { t4: (c.t4 | 0) || 100, t5: (c.t5 | 0) || 200 }; }
  } catch (e) {}
  st.cfg = cfg;
  return st;
}

function finalizeStanding(Game, m) {
  const st = m.standing;
  const cross = detectCrossings(st.rows, st.cfg.t4, st.cfg.t5);
  st.cross = cross;
  const last = st.rows.length ? st.rows[st.rows.length - 1] : standingSample(Game);
  return {
    t4: st.cfg.t4, t5: st.cfg.t5,
    t4Day: cross.t4Day, t5Day: cross.t5Day,
    wave4Day: cross.wave4Day, wave5Day: cross.wave5Day,
    driver: cross.atT4 ? classifyDriver(cross.atT4) : 'none',
    atT4: cross.atT4 ? {
      day: cross.atT4.day, total: cross.atT4.total,
      war: cross.atT4.war, diplomacy: cross.atT4.diplomacy, plenty: cross.atT4.plenty,
      warPts: cross.atT4.warPts, links: cross.atT4.links, feasts: cross.atT4.feasts,
    } : null,
    endStanding: { total: last.total, war: last.war, diplomacy: last.diplomacy, plenty: last.plenty,
                   warPts: last.warPts, links: last.links, feasts: last.feasts },
    endWave: last.wave,
    // sparse trajectory for the evidence file (every 10th day + crossings)
    traj: st.rows.filter((r, i) => i % 10 === 0 || r.day === cross.t4Day || r.day === cross.wave4Day)
      .map(r => ({ d: r.day, tot: r.total, w: r.war, b: r.diplomacy, br: r.plenty, wave: r.wave })),
  };
}

// progressSample: the stall-detection axes, daily. Progress = movement on ANY
// of leadership vector (ledger magnitude), scale rank, codex counts, Standing.
function progressSample(Game) {
  const d = day(Game);
  const out = { day: d, ledgerMag: null, scaleRank: 'village', codexP: 0, codexM: 0, codexS: 0, standing: 0 };
  try {
    const L = ((Game.progState ? Game.progState() : {}) || {}).ledger || {};
    out.ledgerMag = Object.values(L).reduce((t, v) => t + Math.abs(v || 0), 0);
  } catch (e) {}
  try { out.scaleRank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}
  try {
    const cx = Game.state.codex || {};
    out.codexP = Object.keys(cx.plants || {}).length;
    out.codexM = Object.keys(cx.monsters || {}).length;
    out.codexS = Object.keys(cx.skills || {}).length;
  } catch (e) {}
  try { out.standing = Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : 0; } catch (e) {}
  return out;
}

// villager wave-3 kills, attributed via death telemetry (TELEMETRY_FULL=1).
// Kill channels: patrol path registers cause 'patrol combat' (game.js),
// expedition path 'villager combat' (game.js), player TB 'combat'.
// Aid-crisis (comms.js), contests, and agency-rescue kills call
// recordWaveKill WITHOUT registerDeath — they land in the ledger total with
// no death record, so the ledger remainder is reported as unattributed
// (on courtship policies the player doesn't hunt, so those are villager
// kills by construction — the pilot's original GO metric).
function goCounts(result) {
  const deaths = (result.samples && result.samples.deaths) || [];
  let w3villager = 0, w3player = 0;
  const byCause = {};
  for (const d of deaths) {
    if (d.kind === 'monster' && d.wave === 3) {
      byCause[d.cause] = (byCause[d.cause] || 0) + 1;
      if (d.cause === 'patrol combat' || d.cause === 'villager combat') w3villager++;
      else if (d.cause === 'combat') w3player++;
    }
  }
  const w3ledger = ((result.waveKills || {})['3']) || 0;
  return { w3ledger, w3villager, w3player, w3unattributed: Math.max(0, w3ledger - w3villager - w3player), byCause };
}

function pacingSummary(p) {
  if (!p) return null;
  return {
    totalDeliberate: p.totalDeliberate, totalDriver: p.totalDriver, totalInternal: p.totalInternal,
    meanDeliberatePerDay: p.meanDeliberatePerDay, medianDeliberatePerDay: p.medianDeliberatePerDay,
    meanDriverPerDay: p.meanDriverPerDay, byCategory: p.byCategory, byCategoryDriver: p.byCategoryDriver,
    internalByVerb: p.internalByVerb, meanVerbsPerDayLegacy: p.meanVerbsPerDayLegacy,
    meanPolicyCallsPerDay: p.meanPolicyCallsPerDay, meanTicksPerDay: p.meanTicksPerDay,
    tickUtilization: p.tickUtilization, perDay: p.perDay,
  };
}

async function runTune(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'standing-tune';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent,winseek,belongseek,leadcourt').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '180', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'action-telemetry-' + pid, fullTelemetry: true });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      attachStanding(Game, m);
      m.progress = { rows: [] };
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try { m.standing.rows.push(standingSample(G)); } catch (e) {}
        try { m.progress.rows.push(progressSample(G)); } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      const row = Object.assign(
        { label, policy: pid, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        finalizeStanding(Game, m),
        { pacing: pacingSummary(result.pacing), progress: m.progress.rows, go: goCounts(result) }
      );
      rows.push(row);
      const a = row.atT4;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} ` +
        `acts=${row.pacing ? row.pacing.totalDeliberate : '?'}@${row.pacing ? row.pacing.meanDeliberatePerDay : '?'} ` +
        `w3v=${row.go.w3villager}/w3p=${row.go.w3player}/w3u=${row.go.w3unattributed}/w3t=${row.go.w3ledger} ` +
        `t4=${row.t4Day == null ? '-' : 'd' + row.t4Day} wave4=${row.wave4Day == null ? '-' : 'd' + row.wave4Day} ` +
        `wave5=${row.wave5Day == null ? '-' : 'd' + row.wave5Day} driver=${row.driver} ` +
        (a ? `[w${a.warPts} l${a.links} f${a.feasts}]` : '') +
        ` end=${row.endStanding.total}(w${row.endStanding.war}/b${row.endStanding.diplomacy}/br${row.endStanding.plenty}) ` +
        `nat=${row.nationalFirstDay == null ? '-' : 'd' + row.nationalFirstDay} won=${row.won ? 1 : 0}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const day80 = rows.filter(r => r.days >= 80);
  const t4days = rows.map(r => r.t4Day).filter(x => x != null);
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    // (a) wave-4 organic unlock rate among day-80+ runs
    day80runs: day80.length,
    wave4Unlock80: day80.length ? agg(r => (r.days >= 80 && r.wave4Day != null) ? 1 : 0) : 0,
    wave4UnlockRate80: day80.length ? +(agg(r => (r.days >= 80 && r.wave4Day != null) ? 1 : 0) / day80.length).toFixed(3) : null,
    wave4Ever: agg(r => r.wave4Day != null ? 1 : 0),
    wave5Ever: agg(r => r.wave5Day != null ? 1 : 0),
    // (b) earliest T4 day
    earliestT4Day: t4days.length ? Math.min(...t4days) : null,
    medianT4Day: t4days.length ? med(t4days) : null,
    // (c) driver shares among unlocks
    drivers: {},
    // (d) speedrun smell: unlocks before day 45
    unlockBefore45: rows.filter(r => r.wave4Day != null && r.wave4Day < 45)
      .map(r => `${r.policy}/s${r.seed}@d${r.wave4Day}`),
    // wall numbers
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    table: agg(r => r.table), won: agg(r => r.won),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    exiled: agg(r => r.exiledEver || 0),
    // telemetry aggregates
    medianDeliberatePerDay: med(rows.map(r => (r.pacing && r.pacing.medianDeliberatePerDay) || 0)),
    meanDeliberatePerDay: med(rows.map(r => (r.pacing && r.pacing.meanDeliberatePerDay) || 0)),
    // villager-counter GO (parent task 2026-10-13): w3 villager kills > 0,
    // no median-survival regression vs standing-tune baseline medianDays=71
    goW3Villager: agg(r => (r.go && r.go.w3villager) || 0),
    goW3Player: agg(r => (r.go && r.go.w3player) || 0),
    goW3Ledger: agg(r => (r.go && r.go.w3ledger) || 0),
    goW3Unattributed: agg(r => (r.go && r.go.w3unattributed) || 0),
    goBaselineMedianDays: 71,
  };
  // strict: kills > 0 AND median survival not below the 71-day baseline
  summary.goVerdict = (summary.goW3Villager > 0 && summary.medianDays >= 71) ? 'GO' : 'NO-GO';
  for (const r of rows) {
    if (r.wave4Day != null) summary.drivers[r.driver] = (summary.drivers[r.driver] || 0) + 1;
  }
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runTune({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`(a) wave4 unlock rate (day80+): ${s.wave4UnlockRate80} (${s.wave4Unlock80}/${s.day80runs} of day80+ runs; ${s.wave4Ever}/${s.runs} overall) — target 0.30-0.50`);
    console.log(`(b) earliest T4 day: ${s.earliestT4Day} (median ${s.medianT4Day}) — target >= ~60`);
    console.log(`(c) drivers: ${JSON.stringify(s.drivers)}`);
    console.log(`(d) unlocks before day 45: ${s.unlockBefore45.length ? s.unlockBefore45.join(' ') : 'none'}`);
    console.log(`wall: national ${s.national}/${s.runs} table ${s.table}/${s.runs} won ${s.won}/${s.runs} medianDays ${s.medianDays} wave5ever ${s.wave5Ever} exiled ${s.exiled}`);
    console.log(`telemetry: medianDeliberatePerDay ${s.medianDeliberatePerDay} (mean ${s.meanDeliberatePerDay})`);
    console.log(`GO: w3 villager-attributed ${s.goW3Villager} player ${s.goW3Player} unattributed ${s.goW3Unattributed} (ledger ${s.goW3Ledger}) medianDays ${s.medianDays} vs baseline 71 -> ${s.goVerdict}`);
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runTune, standingSample, classifyDriver, detectCrossings, attachStanding, finalizeStanding };
