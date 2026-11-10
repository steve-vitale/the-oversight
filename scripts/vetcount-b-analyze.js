// vetcount-b-analyze.js — verdict table for the sim-vetcount-reconcile-b census.
// Reads evidence/2026-11-10/perseed-vetcount-reconcile-b/<leg>/vetcount-b-s<seed>.json
// (PERSEED_DIR) and prints per-seed log-vs-counter reconciliation, kill-call
// accounting, veteran fates from the `killers` table, and the scale-wall
// numbers. With COMPARE_DIR set to a second leg's directory, prints a
// before/after delta table (tribute ever-ready, veteran peaks, wave-4 kill
// totals, survival, starvation deaths) on identical seeds.
// Pure read; writes nothing.
// Usage:
//   PERSEED_DIR=evidence/2026-11-10/perseed-vetcount-reconcile-b/before node scripts/vetcount-b-analyze.js
//   PERSEED_DIR=evidence/2026-11-10/perseed-vetcount-reconcile-b/after COMPARE_DIR=evidence/2026-11-10/perseed-vetcount-reconcile-b/before node scripts/vetcount-b-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.env.PERSEED_DIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-vetcount-reconcile-b', 'before');
const compareDir = process.env.COMPARE_DIR || null;
const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

function loadDir(d) {
  const files = fs.readdirSync(d).filter(function (f) { return /^vetcount-b-s\d+\.json$/.test(f); }).sort();
  if (!files.length) { console.error('VETCOUNT-B ANALYZE STOP: no per-seed files in ' + d); process.exit(2); }
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); });
}
function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}
function starvationDeaths(o) {
  return (o.teleDeaths || []).filter(function (d) { return d && /starv/i.test(String(d.cause || '')); }).length;
}

const seeds = loadDir(dir);
console.log('=== reconciliation: counter (state.waveKills) vs log (non-pyrrhic waveKillLog entries) ===');
console.log('seed   w1(c/log) w2(c/log) w3(c/log) w4(c/log) w5(c/log) agree calls logged dup pyrrhic');
let agreeN = 0;
for (const o of seeds) {
  const r = o.reconciliation || { waves: {}, allAgree: false };
  const cells = [1, 2, 3, 4, 5].map(function (w) {
    const x = r.waves[w] || r.waves[String(w)] || {};
    return ((x.counter == null ? '?' : x.counter) + '/' + (x.logCounted == null ? '?' : x.logCounted));
  });
  if (r.allAgree) agreeN++;
  const s = o.summary || {};
  console.log(String(o.seed).padEnd(7) + cells.map(function (c) { return c.padEnd(10); }).join('') + String(!!r.allAgree).padEnd(6)
    + String(s.killCalls | 0).padEnd(6) + String(s.killCallsLogged | 0).padEnd(7) + String(s.killCallsDup | 0).padEnd(4) + String(s.killCallsPyrrhic | 0));
}
console.log('PRIMARY: log == counter on ' + agreeN + '/' + seeds.length + ' seeds (all waves 1-5) — GO needs 8/8');
// Kill-call detail: name the disagreeing calls per seed (method + dup).
for (const o of seeds) {
  const r = o.reconciliation || { waves: {} };
  if (r.allAgree) continue;
  console.log('seed ' + o.seed + ' DISAGREES:');
  for (let w = 1; w <= 5; w++) {
    const x = r.waves[w] || r.waves[String(w)] || {};
    if (x.agree !== false) continue;
    console.log('  wave ' + w + ': counter ' + x.counter + ' vs log-counted ' + x.logCounted + ' (log-all ' + x.logAll + ')');
  }
  const dups = (o.killCalls || []).filter(function (c) { return c.dup; });
  const pyrr = (o.killCalls || []).filter(function (c) { return c.method === 'recordPyrrhicKill'; });
  for (const c of dups) console.log('  DUP call: d' + c.day + ' ' + c.mid + ' by ' + c.by + ' via ' + c.via + ' (counter++, no log entry)');
  for (const c of pyrr) console.log('  PYRRHIC call: d' + c.day + ' ' + c.mid + ' by ' + c.by + ' via ' + c.via + ' (log entry, no counter++)');
}
console.log('');
console.log('--- secondaries ---');
console.log('military_tribute ever-ready: ' + seeds.filter(function (o) { return o.summary.everReady.military_tribute; }).length + '/' + seeds.length);
console.log('peak living veterans distribution (daily snapshot): ' + JSON.stringify(seeds.map(function (o) { return o.summary.peakLivingVeterans; }).sort()));
console.log('kill-time peak living veterans distribution: ' + JSON.stringify(seeds.map(function (o) { return o.summary.killTimePeakVeterans; }).sort()));
console.log('wave-4 kills per seed (counter): ' + JSON.stringify(seeds.map(function (o) { return (o.waveKills || {})['4'] | 0; }).sort()) + ' (total ' + seeds.reduce(function (t, o) { return t + (((o.waveKills || {})['4'] | 0)); }, 0) + ')');
console.log('wave-4 kills per seed (log, all entries): ' + JSON.stringify(seeds.map(function (o) { return (o.killTimeSamples || []).filter(function (s) { return s.w >= 4; }).length; }).sort()));
console.log('starvation deaths per seed: ' + JSON.stringify(seeds.map(starvationDeaths).sort()) + ' (total ' + seeds.reduce(function (t, o) { return t + starvationDeaths(o); }, 0) + ')');
console.log('--- scale wall ---');
console.log('national: ' + seeds.filter(function (o) { return o.summary.peakScaleRank === 'national' || o.summary.peakScaleRank === 'global'; }).length + '/' + seeds.length
  + ' | table (won): ' + seeds.filter(function (o) { return o.won; }).length + '/' + seeds.length
  + ' | wins: ' + seeds.filter(function (o) { return o.won; }).length + '/' + seeds.length);
console.log('wave 4 unlocked: ' + seeds.filter(function (o) { return o.maxWaveUnlocked >= 4; }).length + '/' + seeds.length
  + ' | wave 5 unlocked: ' + seeds.filter(function (o) { return o.maxWaveUnlocked >= 5; }).length + '/' + seeds.length);
console.log('median survival (result days): ' + median(seeds.map(function (o) { return o.resultDays; })) + ' (days: ' + JSON.stringify(seeds.map(function (o) { return o.resultDays; }).sort(function (a, b) { return a - b; })) + ')');
console.log('--- veteran fates (from killers table — includes current scholar) ---');
let totalKillers = 0;
for (const o of seeds) {
  const vets = o.killers || [];
  totalKillers += vets.length;
  const deaths = {};
  for (const d of (o.teleDeaths || [])) { if (d && d.who) deaths[d.who] = d; }
  console.log('seed ' + o.seed + ': ' + vets.length + ' wave-4+ killers ever; ' + vets.filter(function (v) { return v.alive; }).length + ' alive at end'
    + '; ever-scholar: ' + vets.filter(function (v) { return v.everScholar; }).length
    + '; scholar-at-end killer: ' + vets.filter(function (v) { return v.scholarAtEnd; }).length);
  for (const v of vets) {
    const dd = deaths[v.vid];
    console.log('  ' + (v.name || v.vid) + ' waves[' + v.waves.join(',') + '] kills=' + v.kills + ' firstKill d' + v.firstKillDay + ' lastKill d' + v.lastKillDay + ' alive=' + v.alive + (dd ? ' died d' + dd.day + ' (' + dd.cause + ')' : '')
      + (v.everScholar ? ' ever-scholar (' + v.scholarDays + 'd)' : '')
      + (v.pyrrhicKills ? ' pyrrhicKills=' + v.pyrrhicKills : '')
      + (v.scholarAtEnd ? ' SCHOLAR-AT-END' : ''));
  }
}
console.log('total distinct wave-4+ killers: ' + totalKillers + ' (re-measure counted 17; a lower total here means a dropped killer — NO-GO)');
if (compareDir) {
  const before = loadDir(compareDir);
  const bySeed = {};
  for (const o of before) bySeed[o.seed] = o;
  console.log('');
  console.log('=== before/after delta (identical seeds; PERSEED_DIR is AFTER, COMPARE_DIR is BEFORE) ===');
  console.log('seed   tribute(B->A) peakVets(B->A) w4counter(B->A) w4log(B->A) days(B->A) starv(B->A) reconcile(B->A)');
  for (const o of seeds) {
    const b = bySeed[o.seed];
    if (!b) { console.log(String(o.seed) + ' (no before row)'); continue; }
    const trib = function (x) { return x.summary.everReady.military_tribute ? 'Y' : '.'; };
    console.log(String(o.seed).padEnd(7)
      + (trib(b) + '->' + trib(o)).padEnd(15)
      + (b.summary.peakLivingVeterans + '->' + o.summary.peakLivingVeterans).padEnd(14)
      + (((b.waveKills || {})['4'] | 0) + '->' + ((o.waveKills || {})['4'] | 0)).padEnd(15)
      + ((b.killTimeSamples || []).filter(function (s) { return s.w >= 4; }).length + '->' + (o.killTimeSamples || []).filter(function (s) { return s.w >= 4; }).length).padEnd(12)
      + (b.resultDays + '->' + o.resultDays).padEnd(11)
      + (starvationDeaths(b) + '->' + starvationDeaths(o)).padEnd(11)
      + (((b.reconciliation || {}).allAgree ? 'agree' : 'DISAGREE') + '->' + ((o.reconciliation || {}).allAgree ? 'agree' : 'DISAGREE')));
  }
  const medB = median(before.map(function (o) { return o.resultDays; }));
  const medA = median(seeds.map(function (o) { return o.resultDays; }));
  const starvB = before.reduce(function (t, o) { return t + starvationDeaths(o); }, 0);
  const starvA = seeds.reduce(function (t, o) { return t + starvationDeaths(o); }, 0);
  console.log('median survival: ' + medB + ' -> ' + medA + ' (cost bar: after >= 0.8x before = ' + (medB * 0.8) + ')');
  console.log('starvation deaths total: ' + starvB + ' -> ' + starvA + ' (cost bar: after <= before + 2 = ' + (starvB + 2) + ')');
  console.log('tribute ever-ready: ' + before.filter(function (o) { return o.summary.everReady.military_tribute; }).length + '/8 -> ' + seeds.filter(function (o) { return o.summary.everReady.military_tribute; }).length + '/8');
  console.log('wave-4 kills total (counter): ' + before.reduce(function (t, o) { return t + (((o.waveKills || {})['4'] | 0)); }, 0) + ' -> ' + seeds.reduce(function (t, o) { return t + (((o.waveKills || {})['4'] | 0)); }, 0));
}
