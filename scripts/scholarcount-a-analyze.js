// scholarcount-a-analyze.js — verdict table for the sim-scholarcount-a build.
// Reads evidence/2026-11-10/perseed-scholarcount-a/scholarcount-a-s<seed>.json
// (or PERSEED_DIR) and compares against the control corpus
// evidence/2026-11-10/perseed-vetcount-reconcile-b/after/vetcount-b-s<seed>.json
// (or CONTROL_DIR) on identical seeds.
// Judges the prereg (evidence/2026-11-10/sim-scholarcount-a-prereg.md):
//   (a) peak living veterans >=1 (daily OR kill-time) on >=7/8 seeds;
//   (b) pooled scholar-veteran days >=80;
//   guard: legacy (payable) ever-ready 2/8 AND legacy peak per seed
//     identical to control [2,0,0,0,1,1,0,2]; trajectories identical
//     per seed (days, end, deaths, waveKills, maxWave);
//   cost bar: starvation armed <= control+2, arm-only starvation <=
//     control, median survival armed >= 0.8x control.
// Pure read; writes nothing.
// Usage: node scripts/scholarcount-a-analyze.js
//   PERSEED_DIR=evidence/2026-11-10/perseed-scholarcount-a CONTROL_DIR=evidence/2026-11-10/perseed-vetcount-reconcile-b/after node scripts/scholarcount-a-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.env.PERSEED_DIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-scholarcount-a');
const controlDir = process.env.CONTROL_DIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-vetcount-reconcile-b', 'after');
const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

const files = fs.readdirSync(dir).filter(function (f) { return /^scholarcount-a-s\d+\.json$/.test(f); }).sort();
if (!files.length) { console.error('SCHOLARCOUNT-A ANALYZE STOP: no per-seed files in ' + dir); process.exit(2); }
const seeds = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = s.length / 2;
  return s.length % 2 ? s[Math.floor(m)] : (s[m - 1] + s[m]) / 2;
}
function starvationDeaths(o) {
  return (o.teleDeaths || []).filter(function (d) { return d && /starv/i.test(d.cause || ''); }).length;
}

const controls = {};
try {
  const cf = fs.readdirSync(controlDir).filter(function (f) { return /^vetcount-b-s\d+\.json$/.test(f); }).sort();
  for (const f of cf) {
    const o = JSON.parse(fs.readFileSync(path.join(controlDir, f), 'utf8'));
    controls[o.seed] = o;
  }
} catch (e) { console.error('SCHOLARCOUNT-A ANALYZE WARN: control corpus unreadable: ' + e.message); }

const rows = [];
for (const o of seeds) {
  const s = o.summary;
  const c = controls[o.seed] || null;
  const cs = c ? c.summary : null;
  const trajMatch = c ? (
    o.resultDays === c.resultDays && o.endReason === c.endReason &&
    o.maxWaveUnlocked === c.maxWaveUnlocked &&
    JSON.stringify(o.waveKills || {}) === JSON.stringify(c.waveKills || {}) &&
    (o.teleDeaths || []).length === (c.teleDeaths || []).length
  ) : null;
  const kt = o.killTimeSamples || [];
  const ktPeak = kt.reduce(function (m, x) { return (typeof x.livingVeteransAtKill === 'number' && x.livingVeteransAtKill > m) ? x.livingVeteransAtKill : m; }, 0);
  const ktPeakLegacy = kt.reduce(function (m, x) { return (typeof x.livingVeteransLegacyAtKill === 'number' && x.livingVeteransLegacyAtKill > m) ? x.livingVeteransLegacyAtKill : m; }, 0);
  const peakAny = Math.max(s.peakLivingVeterans | 0, ktPeak | 0);
  rows.push({
    seed: o.seed, days: o.resultDays, end: o.endReason, won: o.won,
    maxWave: o.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
    peakVets: s.peakLivingVeterans, peakVetsLegacy: s.peakLivingVeteransLegacy,
    ktPeak: ktPeak, ktPeakLegacy: ktPeakLegacy, peakAny: peakAny,
    scholarVetDays: s.scholarVeteranDays | 0,
    everReady: s.everReady, everReadyLegacy: (s.everReadyLegacy || {}),
    firstReady: s.firstReadyDay, firstReadyLegacy: (s.firstReadyDayLegacy || {}),
    newReadyDays: s.newReadyDays | 0, legacyReadyDays: s.legacyReadyDays | 0,
    starvation: starvationDeaths(o), deaths: (o.teleDeaths || []).length,
    trajMatch: trajMatch,
    controlPeakLegacy: cs ? (cs.peakLivingVeterans | 0) : null,
    controlEverReadyM: cs ? !!(cs.everReady || {}).military_tribute : null,
    controlDays: c ? c.resultDays : null,
    controlStarvation: c ? starvationDeaths(c) : null,
  });
}

console.log('seed   days end        won maxW stage scale     peakNew peakLeg ktNew ktLeg peakAny schVetDays everReady(M new/leg) firstReady(M new/leg) newRD legRD starv trajMatch');
for (const r of rows) {
  console.log(String(r.seed).padEnd(7) + String(r.days).padEnd(5) + String(r.end).padEnd(11) + String(r.won).padEnd(4) + String(r.maxWave).padEnd(5) + String(r.peakStage).padEnd(6) + String(r.peakScale).padEnd(10)
    + String(r.peakVets).padEnd(8) + String(r.peakVetsLegacy).padEnd(8) + String(r.ktPeak).padEnd(6) + String(r.ktPeakLegacy).padEnd(6) + String(r.peakAny).padEnd(8) + String(r.scholarVetDays).padEnd(11)
    + ((r.everReady.military_tribute ? 'Y' : '.') + '/' + (r.everReadyLegacy.military_tribute ? 'Y' : '.')).padEnd(10)
    + ((r.firstReady.military_tribute == null ? '-' : 'd' + r.firstReady.military_tribute) + '/' + (r.firstReadyLegacy.military_tribute == null ? '-' : 'd' + r.firstReadyLegacy.military_tribute)).padEnd(14)
    + String(r.newReadyDays).padEnd(6) + String(r.legacyReadyDays).padEnd(6) + String(r.starvation).padEnd(6) + String(r.trajMatch));
}
console.log('');
const n = rows.length;
const peakGe1 = rows.filter(function (r) { return r.peakAny >= 1; }).length;
const pooledScholarVetDays = rows.reduce(function (t, r) { return t + r.scholarVetDays; }, 0);
console.log('PRIMARY (a): peak living veterans >=1 (daily OR kill-time) on >=7/8 seeds: ' + peakGe1 + '/' + n + ' — ' + (peakGe1 >= 7 ? 'GO' : 'NO-GO'));
console.log('PRIMARY (b): pooled scholar-veteran days >=80: ' + pooledScholarVetDays + ' — ' + (pooledScholarVetDays >= 80 ? 'GO' : 'NO-GO'));
const legacyEver = rows.filter(function (r) { return r.everReadyLegacy.military_tribute; }).length;
const legacyPeaksMatch = rows.every(function (r) { return r.controlPeakLegacy == null || r.peakVetsLegacy === r.controlPeakLegacy; });
console.log('GUARD legacy ever-ready (payable): ' + legacyEver + '/' + n + ' (control 2/8) — ' + (legacyEver === 2 ? 'HELD' : 'MOVED'));
console.log('GUARD legacy peak per seed identical to control: ' + (legacyPeaksMatch ? 'HELD ' + JSON.stringify(rows.map(function (r) { return r.peakVetsLegacy; })) : 'MOVED ' + JSON.stringify(rows.map(function (r) { return r.peakVetsLegacy + ' vs ' + r.controlPeakLegacy; }))));
const trajAllMatch = rows.every(function (r) { return r.trajMatch === true; });
console.log('GUARD trajectories identical to control: ' + rows.filter(function (r) { return r.trajMatch; }).length + '/' + n + ' — ' + (trajAllMatch ? 'HELD' : 'DIVERGED (investigate)'));
const starvArmed = rows.reduce(function (t, r) { return t + r.starvation; }, 0);
const starvControl = rows.reduce(function (t, r) { return t + (r.controlStarvation | 0); }, 0);
const medArmed = median(rows.map(function (r) { return r.days; }));
const medControl = median(rows.map(function (r) { return r.controlDays; }).filter(function (x) { return x != null; }));
const armOnlyStarv = rows.filter(function (r) { return r.trajMatch !== true; }).reduce(function (t, r) { return t + r.starvation; }, 0);
console.log('COST BAR: starvation armed ' + starvArmed + ' vs control ' + starvControl + ' (bar <= control+2) — ' + (starvArmed <= starvControl + 2 ? 'HELD' : 'BREACH'));
console.log('COST BAR: arm-only starvation (diverged seeds) ' + armOnlyStarv + ' vs control ' + starvControl + ' — ' + (armOnlyStarv <= starvControl ? 'HELD' : 'BREACH'));
console.log('COST BAR: median survival armed ' + medArmed + 'd vs control ' + medControl + 'd (bar >= 0.8x = ' + (medControl * 0.8) + 'd) — ' + (medArmed >= medControl * 0.8 ? 'HELD' : 'BREACH'));
console.log('Per-deed ever-ready (new): ' + DEEDS.map(function (k) { return k + ' ' + rows.filter(function (r) { return r.everReady[k]; }).length + '/' + n; }).join(', '));
console.log('Per-deed ever-ready (legacy/payable): military_tribute ' + legacyEver + '/' + n);
console.log('Peak living veterans distribution (new, daily): ' + JSON.stringify(rows.map(function (r) { return r.peakVets; }).sort()));
console.log('Peak living veterans distribution (legacy, daily): ' + JSON.stringify(rows.map(function (r) { return r.peakVetsLegacy; }).sort()));
console.log('Kill-time peak (new) distribution: ' + JSON.stringify(rows.map(function (r) { return r.ktPeak; }).sort()));
console.log('Kill-time ever-2-veterans (new): ' + rows.filter(function (r) { return r.ktPeak >= 2; }).length + '/' + n + ' (legacy: ' + rows.filter(function (r) { return r.ktPeakLegacy >= 2; }).length + '/' + n + ')');
console.log('Ready-days pooled: new ' + rows.reduce(function (t, r) { return t + r.newReadyDays; }, 0) + ' vs legacy ' + rows.reduce(function (t, r) { return t + r.legacyReadyDays; }, 0));
console.log('--- scale wall ---');
console.log('national: ' + rows.filter(function (r) { return r.peakScale === 'national' || r.peakScale === 'global'; }).length + '/' + n
  + ' | table (won): ' + rows.filter(function (r) { return r.won; }).length + '/' + n
  + ' | wins: ' + rows.filter(function (r) { return r.won; }).length + '/' + n);
console.log('wave 4 unlocked: ' + rows.filter(function (r) { return r.maxWave >= 4; }).length + '/' + n
  + ' | wave 5 unlocked: ' + rows.filter(function (r) { return r.maxWave >= 5; }).length + '/' + n);
console.log('median survival (result days): ' + medArmed + ' (days: ' + JSON.stringify(rows.map(function (r) { return r.days; }).sort()) + ')');
console.log('wave-4 kills per seed: ' + JSON.stringify(seeds.map(function (o) { return (o.waveKills || {})['4'] | 0; }).sort()) + ' (total ' + seeds.reduce(function (t, o) { return t + (((o.waveKills || {})['4'] | 0)); }, 0) + ')');
console.log('recorder errors: ' + JSON.stringify(seeds.map(function (o) { return (o.recorderErrors || []).length; })));
// Veteran fates (same shape as capstoneready-b-analyze.js): every wave-4+
// killer from o.killers, with scholar flags.
console.log('--- veteran fates ---');
for (const o of seeds) {
  const last = o.daily[o.daily.length - 1];
  const fromKillers = Array.isArray(o.killers) && o.killers.length > 0;
  const vets = fromKillers ? o.killers : ((last && last.veterans) || []);
  const deaths = {};
  for (const d of (o.teleDeaths || [])) { if (d && d.who) deaths[d.who] = d; }
  const scholarDays = {};
  for (const r of (o.daily || [])) { if (r.scholarId) scholarDays[r.scholarId] = (scholarDays[r.scholarId] | 0) + 1; }
  console.log('seed ' + o.seed + ': ' + vets.length + ' wave-4+ killers ever; ' + vets.filter(function (v) { return v.alive; }).length + ' alive at end'
    + '; ever-scholar: ' + vets.filter(function (v) { return scholarDays[v.vid] || v.everScholar; }).length
    + (fromKillers ? ' (killers table)' : ' (LAST-ROW FALLBACK)'));
  for (const v of vets) {
    const dd = deaths[v.vid];
    console.log('  ' + (v.name || v.vid) + ' waves[' + v.waves.join(',') + '] kills=' + v.kills + ' firstKill d' + v.firstKillDay + ' lastKill d' + v.lastKillDay + ' alive=' + v.alive + (dd ? ' died d' + dd.day + ' (' + dd.cause + ')' : '')
      + ((scholarDays[v.vid] || v.everScholar) ? ' ever-scholar (' + (v.scholarDays != null ? v.scholarDays : scholarDays[v.vid]) + 'd)' : '')
      + (v.pyrrhicKills ? ' pyrrhicKills=' + v.pyrrhicKills : '')
      + (v.scholarAtEnd ? ' SCHOLAR-AT-END' : ''));
  }
}
const primaryGo = peakGe1 >= 7 && pooledScholarVetDays >= 80;
const guardHeld = legacyEver === 2 && legacyPeaksMatch && trajAllMatch;
const costHeld = starvArmed <= starvControl + 2 && armOnlyStarv <= starvControl && medArmed >= medControl * 0.8;
console.log('VERDICT: primary ' + (primaryGo ? 'GO' : 'NO-GO') + ' | guard ' + (guardHeld ? 'HELD' : 'FAILED') + ' | cost bar ' + (costHeld ? 'HELD' : 'BREACH') + ' => ' + ((primaryGo && guardHeld && costHeld) ? 'GO' : 'NO-GO'));
