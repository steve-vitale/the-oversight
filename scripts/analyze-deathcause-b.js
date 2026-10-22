#!/usr/bin/env node
// analyze-deathcause-b.js — sim-deathcause-b analyzer (DIAG).
//
// Reads evidence/2026-10-22/perseed-deathcause-b/deathcause-*.json and
// prints: the PRIMARY attribution report (>=95% person deaths named +
// >=95% starvation deaths to named channels, 0 unexplained), death-cause
// family shares, the full starvation-channel census (per starvation death:
// day, who, days-hungry, pantry at death, realm, channel, who-ate-what
// summary), pantry-crash anatomy, loss-site split, national-live-at-death,
// and wall numbers.
//
// Usage: node scripts/analyze-deathcause-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-deathcause-b');

function load() {
  return fs.readdirSync(DIR)
    .filter(function (f) { return /^deathcause-.*\.json$/.test(f); })
    .map(function (f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); });
}

function family(cls) {
  if (cls === 'starvation') return 'starvation';
  if (cls === 'dehydration') return 'dehydration';
  if (cls === 'wound') return 'wound';
  if (/^combat-/.test(cls)) return 'combat';
  if (/^sickness-/.test(cls)) return 'sickness';
  if (cls === 'raid') return 'raid';
  if (cls === 'contest') return 'contest';
  if (/^other/.test(cls)) return 'other';
  if (/^monster:/.test(cls)) return 'monster-kind';
  return 'unexplained';
}

function isPerson(r) { return r.kind === 'person' || r.kind === 'villager'; }

function main() {
  const rows = load();
  console.log('=== sim-deathcause-b analyzer: ' + rows.length + ' per-seed files ===\n');

  // ---------- PRIMARY (a): proximate attribution ----------
  let totP = 0, namedP = 0, unexpl = 0;
  const unexplRows = [];
  for (const r of rows) {
    for (const d of (r.deaths || [])) {
      if (!isPerson(d)) continue;
      totP++;
      if (d.pclass === 'unexplained') { unexpl++; unexplRows.push({ seed: r.seed, policy: r.policy, row: d }); }
      else namedP++;
    }
  }
  const pct = totP ? (100 * namedP / totP) : 100;
  console.log('PRIMARY (a) — >=95% named, 0 unexplained:');
  console.log('  person deaths: ' + totP + ', named: ' + namedP + ' (' + pct.toFixed(1) + '%), unexplained: ' + unexpl);
  console.log('  verdict: ' + (pct >= 95 && unexpl === 0 ? 'PASS' : 'FAIL') + '\n');
  if (unexplRows.length) {
    console.log('  unexplained rows:');
    for (const u of unexplRows.slice(0, 10)) console.log('   ', JSON.stringify(u));
    console.log('');
  }

  // ---------- PRIMARY (b): starvation-channel attribution ----------
  let totS = 0, namedS = 0, unatt = 0;
  const unattRows = [];
  const chanCount = {};
  for (const r of rows) {
    for (const s of (((r.starvechan || {}).starv) || [])) {
      totS++;
      const ch = s.channel || 'unattributed';
      chanCount[ch] = (chanCount[ch] || 0) + 1;
      if (ch === 'unattributed') { unatt++; unattRows.push({ seed: r.seed, policy: r.policy, row: s }); }
      else namedS++;
    }
  }
  const spct = totS ? (100 * namedS / totS) : 100;
  console.log('PRIMARY (b) — >=95% starvation deaths to a named channel:');
  console.log('  starvation deaths: ' + totS + ', named-channel: ' + namedS + ' (' + spct.toFixed(1) + '%), unattributed: ' + unatt);
  console.log('  channel shares: ' + Object.keys(chanCount).sort().map(function (c) { return c + '=' + chanCount[c]; }).join(', '));
  console.log('  verdict: ' + (totS >= 4 ? (spct >= 95 ? 'PASS' : 'FAIL') : 'DIAG-insufficient-data (n=' + totS + ')') + '\n');

  // ---------- death-cause shares ----------
  const fam = {}, detail = {};
  for (const r of rows) {
    for (const d of (r.deaths || [])) {
      if (!isPerson(d)) continue;
      const f = family(d.pclass);
      fam[f] = (fam[f] || 0) + 1;
      detail[d.pclass] = (detail[d.pclass] || 0) + 1;
    }
  }
  console.log('death-cause shares (n=' + totP + '):');
  for (const f of Object.keys(fam).sort(function (a, b) { return fam[b] - fam[a]; })) {
    console.log('  ' + f + ': ' + fam[f] + ' (' + (100 * fam[f] / totP).toFixed(1) + '%)');
  }
  console.log('  combat-unknown: ' + (detail['combat-unknown'] || 0));
  console.log('');

  // ---------- starvation deaths: the full census ----------
  console.log('--- starvation death census (days-hungry, pantry at death, realm, channel, who-ate-what) ---');
  for (const r of rows) {
    for (const s of (((r.starvechan || {}).starv) || [])) {
      console.log('  ' + r.policy + ' s' + r.seed + ' d' + s.day + ' ' + s.who +
        ' | below60=' + s.daysBelow60 + '/' + s.mealDays + 'd' +
        ' fast=' + s.fastingDays + ' away=' + s.awayDaysOwn +
        ' | ownEat~' + s.ownEatMean + '/d pantry~' + s.pantryDrawnMean + '/d prod~' + s.producedMean + '/d' +
        ' | panAtDeath=' + s.pantryAtDeath + ' natLive=' + s.nationalLive +
        ' | CHANNEL=' + s.channel + (s.channelFlags.length > 1 ? ' flags=[' + s.channelFlags.join(',') + ']' : ''));
    }
  }
  console.log('');

  // ---------- pantry-crash anatomy per village loss ----------
  console.log('--- village losses: day, site, pantry crash, realm ---');
  for (const r of rows) {
    const vl = r.villageLost || {};
    if (!vl.lost) continue;
    const daily = r.daily || [];
    const win = daily.filter(function (dr) { return dr.day >= vl.day - 14 && dr.day <= vl.day; });
    const first = win.length ? win[0].pantryKcal : null;
    const last = win.length ? win[win.length - 1].pantryKcal : null;
    let natLiveAt = null;
    for (const dr of daily) if (dr.day === vl.day) natLiveAt = dr.nationalLive;
    console.log('  ' + r.policy + ' s' + r.seed + ' d' + vl.day + ' site=' + vl.site +
      ' pantry14d=' + first + '->' + last + ' natLive@loss=' + natLiveAt);
  }
  console.log('');

  // ---------- wall ----------
  let nat = 0, everNat = 0, table = 0, won = 0, w4 = 0, w5 = 0, ex = 0;
  const surv = [];
  for (const r of rows) {
    if (r.national) nat++; if (r.everNational) everNat++; if (r.table) table++;
    if (r.won) won++; if (r.wave4) w4++; if (r.wave5) w5++; if (r.exiled) ex++;
    surv.push(r.gameDays || 0);
  }
  surv.sort(function (a, b) { return a - b; });
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  console.log('WALL (n=' + rows.length + '): won ' + won + ', national(end) ' + nat +
    ', national(ever) ' + everNat + ', table ' + table + ', wave4 ' + w4 + ', wave5 ' + w5 +
    ', exiled ' + ex + ', median ' + med + 'd, max ' + (surv[surv.length - 1] || 0) + 'd');
  console.log('');

  // ---------- depositgate/homecoming sanity ----------
  let hcN = 0, hcGiven = 0, schMeals = 0;
  for (const r of rows) {
    const sc = r.starvechan || {};
    hcN += ((sc.homecomings) || []).length;
    for (const h of ((sc.homecomings) || [])) hcGiven += (h.givenKcal || 0);
    schMeals += ((sc.scholarMeals) || []).length;
  }
  console.log('homecomings: ' + hcN + ' total, ' + Math.round(hcGiven) + ' kcal pooled; scholar meals: ' + schMeals);
  console.log('rot lost (floor): fresh ' + rows.reduce(function (t, r) { return t + (((r.starvechan || {}).rotLostFresh) || 0); }, 0) +
    ' kcal, preserved ' + rows.reduce(function (t, r) { return t + (((r.starvechan || {}).rotLostPres) || 0); }, 0) +
    ' kcal; rot eaten (desperation): ' + Math.round(rows.reduce(function (t, r) { return t + (((r.starvechan || {}).rotEaten) || 0); }, 0)) + ' kcal');
}

main();
