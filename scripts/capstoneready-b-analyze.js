// capstoneready-b-analyze.js — verdict table for the sim-capstoneready-b census.
// Reads evidence/2026-11-10/perseed-capstoneready-b/capstoneready-b-s<seed>.json
// and prints per-seed + aggregate numbers against the prereg's primary metric
// (binding blocker named on >=7/8 seeds) plus per-deed ever-ready rates and
// the scale-wall numbers. Pure read; writes nothing.
// Usage: node scripts/capstoneready-b-analyze.js
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
for (const o of seeds) {
  const s = o.summary;
  const peakStage = s.peakLadderStage;
  const peakScale = s.peakScaleRank;
  rows.push({
    seed: o.seed, days: o.resultDays, end: o.endReason, won: o.won,
    maxWave: o.maxWaveUnlocked, peakStage: peakStage, peakScale: peakScale,
    peakVets: s.peakLivingVeterans, everReady: s.everReady, firstReady: s.firstReadyDay,
    blocker: s.bindingBlocker, share: s.bindingBlockerShare, named: s.bindingBlockerNamed,
    chartered: s.everCharteredLinks, bundle: s.everFeastBundle,
    blocked: s.totalBlockedDeedDays, reasons: s.reasonDays,
  });
}
console.log('seed   days end        won maxW stage scale     peakVets everReady(M/T/F) firstReady(M/T/F) blocker            share named');
for (const r of rows) {
  const er = DEEDS.map(function (k) { return r.everReady[k] ? 'Y' : '.'; }).join('/');
  const fr = DEEDS.map(function (k) { return r.firstReady[k] == null ? '-' : ('d' + r.firstReady[k]); }).join('/');
  console.log(String(r.seed).padEnd(7) + String(r.days).padEnd(5) + String(r.end).padEnd(11) + String(r.won).padEnd(4) + String(r.maxWave).padEnd(5) + String(r.peakStage).padEnd(6) + String(r.peakScale).padEnd(10) + String(r.peakVets).padEnd(9) + er.padEnd(17) + fr.padEnd(18) + String(r.blocker).padEnd(19) + String(r.share).padEnd(6) + String(r.named));
}
console.log('');
const named = rows.filter(function (r) { return r.named; }).length;
console.log('PRIMARY (prereg): binding blocker named on ' + named + '/' + rows.length + ' seeds — GO needs >=7/8: ' + (named >= 7 ? 'GO' : 'NO-GO'));
console.log('Per-deed ever-ready: ' + DEEDS.map(function (k) { return k + ' ' + rows.filter(function (r) { return r.everReady[k]; }).length + '/' + rows.length; }).join(', '));
console.log('Peak living veterans distribution: ' + JSON.stringify(rows.map(function (r) { return r.peakVets; }).sort()));
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
console.log('--- veteran fates ---');
for (const o of seeds) {
  const last = o.daily[o.daily.length - 1];
  const vets = (last && last.veterans) || [];
  const deaths = {};
  for (const d of (o.teleDeaths || [])) { if (d && d.who) deaths[d.who] = d; }
  console.log('seed ' + o.seed + ': ' + vets.length + ' wave-4+ killers ever; ' + vets.filter(function (v) { return v.alive; }).length + ' alive at end');
  for (const v of vets) {
    const dd = deaths[v.vid];
    console.log('  ' + (v.name || v.vid) + ' waves[' + v.waves.join(',') + '] kills=' + v.kills + ' firstKill d' + v.firstKillDay + ' lastKill d' + v.lastKillDay + ' alive=' + v.alive + (dd ? ' died d' + dd.day + ' (' + dd.cause + ')' : ''));
  }
}
