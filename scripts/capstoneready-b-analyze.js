// capstoneready-b-analyze.js — verdict table for the sim-capstoneready-b census.
// Reads evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s<seed>.json
// (or PERSEED_DIR) and prints per-seed + aggregate numbers against the prereg's
// primary metric plus per-deed ever-ready rates and the scale-wall numbers.
// Pure read; writes nothing.
// Re-measure revision: judges the NEW primary metric (per-deed binding blocker
// named on >=7/8 seeds per deed) and prints kill-time veteran peaks. It stays
// backward-compatible with the old corpus format: rows without scholarId /
// kill-time fields still analyze (per-deed blockers are recomputed from the
// daily rows, kill-time columns print n/a when absent).
// Usage: node scripts/capstoneready-b-analyze.js
//   PERSEED_DIR=evidence/2026-11-10/perseed-capstoneready-remeasure-b node scripts/capstoneready-b-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.env.PERSEED_DIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-capstoneready-b');
const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

const files = fs.readdirSync(dir).filter(function (f) { return /^capstoneready-b-s\d+\.json$/.test(f); }).sort();
if (!files.length) { console.error('CAPSTONEREADY-B ANALYZE STOP: no per-seed files in ' + dir); process.exit(2); }
const seeds = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}
const rows = [];
// perDeedBlockerFromRows(o): recompute the per-deed modal blocker from the
// daily rows, so old-corpus files (no summary.perDeedBlocker) analyze too.
function perDeedBlockerFromRows(o) {
  const out = {};
  for (const kind of DEEDS) {
    const counts = {};
    let blocked = 0;
    for (const r of (o.daily || [])) {
      const d = (r.deeds || {})[kind];
      if (!d || d.ready) continue;
      blocked++;
      const reason = d.reason || 'unknown';
      counts[reason] = (counts[reason] | 0) + 1;
    }
    let modal = null, modalN = 0;
    for (const k of Object.keys(counts)) { if (counts[k] > modalN) { modalN = counts[k]; modal = k; } }
    out[kind] = {
      blockedDays: blocked,
      blocker: blocked === 0 ? null : modal,
      share: blocked ? +(modalN / blocked).toFixed(3) : null,
      named: blocked === 0 || (modalN / blocked) >= 0.5,
    };
  }
  return out;
}
for (const o of seeds) {
  const s = o.summary;
  const peakStage = s.peakLadderStage;
  const peakScale = s.peakScaleRank;
  const pdb = (s.perDeedBlocker && DEEDS.every(function (k) { return s.perDeedBlocker[k]; })) ? s.perDeedBlocker : perDeedBlockerFromRows(o);
  const kt = o.killTimeSamples || null;
  const ktPeak = kt ? kt.reduce(function (m, x) { return (typeof x.livingVeteransAtKill === 'number' && x.livingVeteransAtKill > m) ? x.livingVeteransAtKill : m; }, 0) : null;
  const ktEverTwo = kt ? kt.some(function (x) { return (x.livingVeteransAtKill | 0) >= 2; }) : null;
  rows.push({
    seed: o.seed, days: o.resultDays, end: o.endReason, won: o.won,
    maxWave: o.maxWaveUnlocked, peakStage: peakStage, peakScale: peakScale,
    peakVets: s.peakLivingVeterans, ktPeak: ktPeak, ktEverTwo: ktEverTwo, ktN: kt ? kt.length : null,
    everReady: s.everReady, firstReady: s.firstReadyDay,
    blocker: s.bindingBlocker, share: s.bindingBlockerShare, named: s.bindingBlockerNamed,
    perDeed: pdb,
    chartered: s.everCharteredLinks, bundle: s.everFeastBundle,
    blocked: s.totalBlockedDeedDays, reasons: s.reasonDays,
  });
}
console.log('seed   days end        won maxW stage scale     peakVets ktPeak everReady(M/T/F) firstReady(M/T/F) blocker            share named');
for (const r of rows) {
  const er = DEEDS.map(function (k) { return r.everReady[k] ? 'Y' : '.'; }).join('/');
  const fr = DEEDS.map(function (k) { return r.firstReady[k] == null ? '-' : ('d' + r.firstReady[k]); }).join('/');
  console.log(String(r.seed).padEnd(7) + String(r.days).padEnd(5) + String(r.end).padEnd(11) + String(r.won).padEnd(4) + String(r.maxWave).padEnd(5) + String(r.peakStage).padEnd(6) + String(r.peakScale).padEnd(10) + String(r.peakVets).padEnd(9) + String(r.ktPeak == null ? 'n/a' : r.ktPeak).padEnd(7) + er.padEnd(17) + fr.padEnd(18) + String(r.blocker).padEnd(19) + String(r.share).padEnd(6) + String(r.named));
}
console.log('');
console.log('--- per-deed blockers (modal reason over that deed\'s own blocked days) ---');
for (const kind of DEEDS) {
  const namedN = rows.filter(function (r) { return r.perDeed[kind].named; }).length;
  const blockers = {};
  for (const r of rows) { const b = r.perDeed[kind].blocker || '(unblocked)'; blockers[b] = (blockers[b] | 0) + 1; }
  console.log(kind + ': named on ' + namedN + '/' + rows.length + ' seeds; blockers ' + JSON.stringify(blockers)
    + '; shares ' + JSON.stringify(rows.map(function (r) { return r.perDeed[kind].share; })));
}
const allDeedsNamed = DEEDS.every(function (kind) { return rows.filter(function (r) { return r.perDeed[kind].named; }).length >= 7; });
console.log('PRIMARY (re-measure prereg): per-deed blocker named on >=7/8 seeds PER DEED — GO needs all three deeds: ' + (allDeedsNamed ? 'GO' : 'NO-GO'));
console.log('Per-deed ever-ready: ' + DEEDS.map(function (k) { return k + ' ' + rows.filter(function (r) { return r.everReady[k]; }).length + '/' + rows.length; }).join(', '));
console.log('Peak living veterans distribution (daily snapshot): ' + JSON.stringify(rows.map(function (r) { return r.peakVets; }).sort()));
console.log('Kill-time peak living veterans distribution: ' + JSON.stringify(rows.map(function (r) { return r.ktPeak; }).sort()) + ' (n/a = old corpus, no kill-time samples)');
console.log('Kill-time ever-2-veterans: ' + rows.filter(function (r) { return r.ktEverTwo; }).length + '/' + rows.length + ' (n/a rows excluded)');
console.log('Kill-time samples per seed: ' + JSON.stringify(rows.map(function (r) { return r.ktN; }).sort()));
const pooledNamed = rows.filter(function (r) { return r.named; }).length;
console.log('Pooled-share blocker (baseline metric, comparison only): named on ' + pooledNamed + '/' + rows.length + ' seeds');
console.log('Peak ladder stage distribution: ' + JSON.stringify(rows.map(function (r) { return r.peakStage; }).sort()));
console.log('Peak scale distribution: ' + JSON.stringify(rows.map(function (r) { return r.peakScale; }).sort()));
console.log('Ever chartered links (max per seed): ' + JSON.stringify(rows.map(function (r) { return r.chartered; }).sort()));
console.log('Ever feast bundle: ' + rows.filter(function (r) { return r.bundle; }).length + '/' + rows.length);
console.log('--- scale wall ---');
console.log('national: ' + rows.filter(function (r) { return r.peakScale === 'national' || r.peakScale === 'global'; }).length + '/' + rows.length
  + ' | table (won): ' + rows.filter(function (r) { return r.won; }).length + '/' + rows.length
  + ' | wins: ' + rows.filter(function (r) { return r.won; }).length + '/' + rows.length);
console.log('wave 4 unlocked: ' + rows.filter(function (r) { return r.maxWave >= 4; }).length + '/' + rows.length
  + ' | wave 5 unlocked: ' + rows.filter(function (r) { return r.maxWave >= 5; }).length + '/' + rows.length);
console.log('median survival (result days): ' + median(rows.map(function (r) { return r.days; })) + ' (days: ' + JSON.stringify(rows.map(function (r) { return r.days; }).sort()) + ')');
console.log('wave-4 kills per seed: ' + JSON.stringify(seeds.map(function (o) { return (o.waveKills || {})['4'] | 0; }).sort()) + ' (total ' + seeds.reduce(function (t, o) { return t + (((o.waveKills || {})['4'] | 0)); }, 0) + ')');
console.log('--- blocked deed-days by reason (all seeds) ---');
const tot = {};
for (const r of rows) for (const k of Object.keys(r.reasons)) tot[k] = (tot[k] | 0) + r.reasons[k];
console.log(JSON.stringify(tot));
// Veteran fate table: for each seed, every wave-4+ killer: first/last kill day,
// whether alive at end, and (from tele deaths) death day + cause when dead.
// When rows carry scholarId, also note whether the killer was ever observed
// as the scholar (the baseline's veteran-to-scholar promotion drain).
console.log('--- veteran fates ---');
for (const o of seeds) {
  const last = o.daily[o.daily.length - 1];
  const vets = (last && last.veterans) || [];
  const deaths = {};
  for (const d of (o.teleDeaths || [])) { if (d && d.who) deaths[d.who] = d; }
  const scholarDays = {};
  for (const r of (o.daily || [])) { if (r.scholarId) scholarDays[r.scholarId] = (scholarDays[r.scholarId] | 0) + 1; }
  const hasScholarIds = Object.keys(scholarDays).length > 0;
  console.log('seed ' + o.seed + ': ' + vets.length + ' wave-4+ killers ever; ' + vets.filter(function (v) { return v.alive; }).length + ' alive at end'
    + (hasScholarIds ? '; ever-scholar: ' + vets.filter(function (v) { return scholarDays[v.vid]; }).length : ''));
  for (const v of vets) {
    const dd = deaths[v.vid];
    console.log('  ' + (v.name || v.vid) + ' waves[' + v.waves.join(',') + '] kills=' + v.kills + ' firstKill d' + v.firstKillDay + ' lastKill d' + v.lastKillDay + ' alive=' + v.alive + (dd ? ' died d' + dd.day + ' (' + dd.cause + ')' : '')
      + (hasScholarIds && scholarDays[v.vid] ? ' ever-scholar (' + scholarDays[v.vid] + 'd)' : ''));
  }
}
