#!/usr/bin/env node
// analyze-throttledays-b.js — throttle-denominator analyzer (sim-throttledays-b).
//
// Reads evidence/2026-10-26/sim-throttledays-b-corpus/*.json (the sweep's
// own corpus; the prior gardenbar corpus carries NO denominator fields and
// cannot answer this question — see the evidence file). Judges ONLY the
// pre-registration in evidence/2026-10-26/sim-throttledays-b-prereg.md:
//   drain-days = Game.pantryFreshDays() at garden-resolution entry
//   need-days  = pantryFreshKcal / (roster x 2000) at the same entry
//   plenty (primary) = days > 4 on each clock
//   GO iff day coverage >= 95% AND resolution coverage >= 95% AND the
//   disagreement share is reported at primary + sensitivity thresholds.
// The disagreement share itself carries no pass/fail bar: it IS the answer.
//
// Usage: node scripts/analyze-throttledays-b.js [corpus-dir]
// Prints the verdict + all secondary figures; exit 0 always (the verdict
// line carries GO/NO-GO; the proof script asserts it).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-throttledays-b-corpus');
const EXPECT = { resolutions: 761, engaged: 750, npcSows: 11, keeperTurns: 3167, beds: 32, playerSows: 235 };

function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : 'n/a'; }
function qtiles(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const at = (q) => s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))];
  return { min: s[0], p25: at(0.25), median: at(0.5), p75: at(0.75), max: s[s.length - 1] };
}
function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; }

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (files.length !== 8) { console.error('FATAL: expected 8 corpus files, found ' + files.length); process.exit(2); }
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

let totRes = 0, totEng = 0, totNonEng = 0, flagMismatch = 0, anomalyEngDrainLow = 0;
let covRes = 0, fallbackEng = 0, exemptNonEng = 0, reversePlenty = 0, reverseBase = 0;
let disRes4 = 0, disRes2 = 0, disRes1 = 0, disRes4NoFb = 0, nonFbEng = 0;
let multiEngDays = 0, firstAnyDiff = 0;
const engDays = new Map(); // key seed|day -> {first, anyDis4, count, covered}
const engKcal = [], needAtEng = [], drainAtEng = [], rosterAtEng = [];
const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survival: [], deaths: 0 };
const deathCauses = {};
let rep = { resolutions: 0, engaged: 0, npcSows: 0, keeperTurns: 0, beds: 0, playerSows: 0 };
let rebuiltBad = 0, rebuiltChecked = 0, rebuiltMaxDiff = 0;

for (const s of seeds) {
  const tr = (s.throttleEvents && s.throttleEvents.resolutions) || [];
  const gr = (s.gardenEvents && s.gardenEvents.resolutions) || [];
  rep.resolutions += gr.length;
  rep.engaged += gr.filter(r => r.throttle === true).length;
  rep.npcSows += ((s.gardenEvents && s.gardenEvents.npcSows) || []).length;
  rep.keeperTurns += ((s.gardenEvents && s.gardenEvents.keeperTurns) || []).length;
  rep.beds += ((s.gardenEvents && s.gardenEvents.makes) || []).length;
  rep.playerSows += ((s.gardenEvents && s.gardenEvents.sows) || []).length;
  // Flag cross-check: my flag (read just before garden's) vs garden's flag.
  const n = Math.min(tr.length, gr.length);
  for (let i = 0; i < n; i++) if (tr[i].throttle !== gr[i].throttle) flagMismatch++;
  if (tr.length !== gr.length) console.log('NOTE seed ' + s.seed + ': throttleRes ' + tr.length + ' != gardenRes ' + gr.length);
  for (const r of tr) {
    totRes++;
    // Rebuild check: drain-days from components (non-fallback only).
    if (r.freshKcal != null && r.burnMean != null && r.burnMean > 0 && r.freshDays != null) {
      rebuiltChecked++;
      const rebuilt = r.freshKcal / r.burnMean;
      const diff = Math.abs(rebuilt - r.freshDays) / Math.max(1, Math.abs(r.freshDays));
      if (diff > rebuiltMaxDiff) rebuiltMaxDiff = diff;
      if (diff > 0.01) rebuiltBad++;
    }
    if (r.throttle === true) {
      totEng++;
      const covered = (r.freshDays != null && r.needDays != null);
      if (covered) covRes++;
      if (r.fallback) fallbackEng++;
      if (r.freshDays != null && r.freshDays <= 4) anomalyEngDrainLow++;
      if (covered) {
        engKcal.push(r.freshKcal);
        needAtEng.push(r.needDays);
        drainAtEng.push(r.freshDays);
        rosterAtEng.push(r.roster);
        if (r.needDays <= 4) disRes4++;
        if (r.needDays <= 2) disRes2++;
        if (r.needDays <= 1) disRes1++;
        if (!r.fallback) {
          nonFbEng++;
          if (r.needDays <= 4) disRes4NoFb++;
        }
      }
      const key = s.seed + '|' + r.day;
      if (!engDays.has(key)) engDays.set(key, { first: r, anyDis4: false, count: 0, covered: false });
      const d = engDays.get(key);
      d.count++;
      if (covered && r.needDays <= 4) d.anyDis4 = true;
      if (d.count === 1) d.covered = covered;
    } else if (r.throttle === false) {
      totNonEng++;
      if (r.hungerExempt) exemptNonEng++;
      else if (r.freshDays != null && r.freshDays <= 4 && r.needDays != null) {
        reverseBase++;
        if (r.needDays > 4) reversePlenty++;
      }
    }
  }
  for (const d of engDays.values()) { /* per-seed day map merged below */ }
  wall.national += s.national ? 1 : 0;
  wall.table += s.table ? 1 : 0;
  wall.wins += s.win ? 1 : 0;
  wall.wave4 += (s.waveReach || []).includes(4) ? 1 : 0;
  wall.wave5 += (s.waveReach || []).includes(5) ? 1 : 0;
  wall.survival.push(s.daysAlive);
  wall.deaths += s.deaths || 0;
  for (const [k, v] of Object.entries(s.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
}
// Day rollup across seeds (map already keyed by seed|day).
let dayCov = 0, dayDis4 = 0, dayDis2 = 0, dayDis1 = 0;
for (const d of engDays.values()) {
  if (d.count > 1) multiEngDays++;
  if (d.covered) dayCov++;
  const f = d.first;
  if (f.freshDays != null && f.needDays != null) {
    if (f.needDays <= 4) dayDis4++;
    if (f.needDays <= 2) dayDis2++;
    if (f.needDays <= 1) dayDis1++;
    const firstDis = f.needDays <= 4;
    if (firstDis !== d.anyDis4) firstAnyDiff++;
  }
}
const engDayCount = engDays.size;
const dayCovPct = engDayCount ? dayCov / engDayCount : 0;
const resCovPct = totEng ? covRes / totEng : 0;
const dayDisPct = engDayCount ? dayDis4 / engDayCount : 0;
const go = dayCovPct >= 0.95 && resCovPct >= 0.95;
const reproExact = rep.resolutions === EXPECT.resolutions && rep.engaged === EXPECT.engaged &&
  rep.npcSows === EXPECT.npcSows && rep.keeperTurns === EXPECT.keeperTurns &&
  rep.beds === EXPECT.beds && rep.playerSows === EXPECT.playerSows;

console.log('=== sim-throttledays-b: drain-days vs need-days on garden throttle days ===');
console.log('corpus: ' + DIR + ' (' + files.length + ' seeds)');
console.log('reproduction vs gardenbar: resolutions ' + rep.resolutions + ' (exp ' + EXPECT.resolutions + '), engaged ' + rep.engaged + ' (exp ' + EXPECT.engaged + '), npcSows ' + rep.npcSows + ' (exp ' + EXPECT.npcSows + '), keeperTurns ' + rep.keeperTurns + ' (exp ' + EXPECT.keeperTurns + '), beds ' + rep.beds + ' (exp ' + EXPECT.beds + '), playerSows ' + rep.playerSows + ' (exp ' + EXPECT.playerSows + ') => ' + (reproExact ? 'REPRODUCED' : 'FRESH BAND (see evidence)'));
console.log('flag cross-check: throttle-flag mismatches (mine vs garden-capture) = ' + flagMismatch + ' / ' + Math.min(totRes, totRes));
console.log('drain rebuild check: ' + rebuiltChecked + ' checked, ' + rebuiltBad + ' beyond 1%, max rel diff ' + (rebuiltMaxDiff * 100).toFixed(3) + '%');
console.log('--- PRIMARY (pre-registered) ---');
console.log('garden resolutions total: ' + totRes + '; engaged: ' + totEng + ' (' + pct(totEng, totRes) + '); non-engaged: ' + totNonEng);
console.log('engagement days: ' + engDayCount);
console.log('coverage (resolution): ' + covRes + '/' + totEng + ' = ' + pct(covRes, totEng) + ' (bar >= 95%)');
console.log('coverage (day): ' + dayCov + '/' + engDayCount + ' = ' + pct(dayCov, engDayCount) + ' (bar >= 95%)');
console.log('DISAGREEMENT share (day, primary need>4): ' + dayDis4 + '/' + engDayCount + ' = ' + pct(dayDis4, engDayCount));
console.log('DISAGREEMENT share (resolution, primary need>4): ' + disRes4 + '/' + covRes + ' = ' + pct(disRes4, covRes));
console.log('sensitivity (day): need>2 disagreement ' + pct(dayDis2, engDayCount) + ' (' + dayDis2 + '), need>1 ' + pct(dayDis1, engDayCount) + ' (' + dayDis1 + ')');
console.log('sensitivity (resolution): need>2 ' + pct(disRes2, covRes) + ', need>1 ' + pct(disRes1, covRes));
console.log('fallback days: engaged resolutions on burn-fallback ' + fallbackEng + '/' + totEng + ' = ' + pct(fallbackEng, totEng));
console.log('disagreement excluding fallback (resolution): ' + disRes4NoFb + '/' + nonFbEng + ' = ' + pct(disRes4NoFb, nonFbEng));
console.log('--- SECONDARY ---');
console.log('reverse disagreement (non-engaged, drain-scarce, need>4): ' + reversePlenty + '/' + reverseBase + ' = ' + pct(reversePlenty, reverseBase));
console.log('hunger-exempt stand-downs (non-engaged, drain>4, streak>=3): ' + exemptNonEng);
console.log('multi-engaged-resolution days: ' + multiEngDays + '; first-vs-any classification differs on ' + firstAnyDiff + ' days');
console.log('anomaly: engaged resolutions with reported drain-days <= 4: ' + anomalyEngDrainLow + ' (must be 0: engagement requires drain>4)');
console.log('freshKcal at engaged resolutions: ' + JSON.stringify(qtiles(engKcal)));
console.log('need-days at engaged resolutions: ' + JSON.stringify(qtiles(needAtEng)));
console.log('drain-days at engaged resolutions: ' + JSON.stringify(qtiles(drainAtEng)));
console.log('roster at engaged resolutions: mean ' + (mean(rosterAtEng) == null ? 'n/a' : mean(rosterAtEng).toFixed(2)) + ', range ' + (rosterAtEng.length ? Math.min(...rosterAtEng) + '-' + Math.max(...rosterAtEng) : 'n/a'));
console.log('--- WALL (band facts) ---');
console.log('national ' + wall.national + '/8; table ' + wall.table + '; wins ' + wall.wins + '; wave4 ' + wall.wave4 + '/8; wave5 ' + wall.wave5 + '/8');
console.log('survival per seed: ' + wall.survival.join(', ') + '; median ' + qtiles(wall.survival).median + 'd');
console.log('deaths total ' + wall.deaths + '; causes ' + JSON.stringify(deathCauses));
console.log('=== VERDICT: ' + (go ? 'GO' : 'NO-GO') + ' (day coverage ' + pct(dayCov, engDayCount) + ', resolution coverage ' + pct(covRes, totEng) + ', day disagreement ' + pct(dayDis4, engDayCount) + ') ===');
