#!/usr/bin/env node
// analyze-deathcensus-b.js — sim-deathcensus-b analyzer (DIAG).
//
// Reads evidence/2026-10-21/perseed-deathcensus-b/deathcensus-*.json and
// prints: the PRIMARY attribution report (every person death to a named
// proximate cause), death-cause shares, pantry-crash anatomy per village
// death, national-live-at-death share, the d100-150 cluster reproduction,
// wall numbers, wave-4/5 reach, median/max survival.
//
// HONESTY NOTES (what the instrument cannot say):
//   - Inflow vs rot vs consumption are NOT separately instrumented. The
//     daily series captures dawn pantry + feast/tribute/trim outflows +
//     pop. "Implied net inflow" = pantry[t+1] - pantry[t] + measured
//     outflows; a negative residual is rot + consumption + unmeasured
//     draws, inseparable. Reported as labeled, never as "rot".
//   - Trap acquisition by source is NOT captured by this instrument
//     (no trap hooks). Reported as not-instrumented, not as zero.
//   - Contest-arena deaths arrive via combat-family causes; the venue is
//     not separately captured (honest-scope note in the instrument).
//
// Usage: node scripts/analyze-deathcensus-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-21', 'perseed-deathcensus-b');

function load() {
  return fs.readdirSync(DIR)
    .filter(function (f) { return /^deathcensus-.*\.json$/.test(f); })
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

function main() {
  const rows = load();
  console.log('=== sim-deathcensus-b analyzer: ' + rows.length + ' per-seed files ===\n');

  // ---------- PRIMARY: attribution completeness ----------
  let totP = 0, namedP = 0, unexpl = 0;
  const unexplRows = [];
  for (const r of rows) {
    for (const d of (r.deaths || [])) {
      if (d.kind !== 'person' && d.kind !== 'villager') continue;
      totP++;
      if (d.pclass === 'unexplained') { unexpl++; unexplRows.push({ seed: r.seed, policy: r.policy, row: d }); }
      else namedP++;
    }
  }
  const pct = totP ? (100 * namedP / totP) : 100;
  console.log('PRIMARY (DIAG-GO: >=95% named, 0 unexplained):');
  console.log('  person deaths: ' + totP + ', named: ' + namedP + ' (' + pct.toFixed(1) + '%), unexplained: ' + unexpl);
  console.log('  verdict: ' + (pct >= 95 && unexpl === 0 ? 'DIAG-GO' : 'NO-GO') + '\n');
  if (unexplRows.length) {
    console.log('  unexplained rows:');
    for (const u of unexplRows.slice(0, 10)) console.log('   ', JSON.stringify(u));
    console.log('');
  }

  // ---------- death-cause shares ----------
  const fam = {}, detail = {};
  const famPol = {};
  for (const r of rows) {
    for (const d of (r.deaths || [])) {
      if (d.kind !== 'person' && d.kind !== 'villager') continue;
      const f = family(d.pclass);
      fam[f] = (fam[f] || 0) + 1;
      detail[d.pclass] = (detail[d.pclass] || 0) + 1;
      const pk = r.policy + '|' + f;
      famPol[pk] = (famPol[pk] || 0) + 1;
    }
  }
  console.log('death-cause shares (person deaths, n=' + totP + '):');
  for (const f of Object.keys(fam).sort(function (a, b) { return fam[b] - fam[a]; }))
    console.log('  ' + f + ': ' + fam[f] + ' (' + (100 * fam[f] / totP).toFixed(1) + '%)');
  console.log('\nper policy:');
  for (const p of ['leadfeast', 'belongfeast']) {
    const keys = Object.keys(famPol).filter(function (k) { return k.indexOf(p + '|') === 0; });
    const n = keys.reduce(function (t, k) { return t + famPol[k]; }, 0);
    console.log('  ' + p + ' (n=' + n + '): ' + keys.map(function (k) {
      return k.split('|')[1] + '=' + famPol[k];
    }).join(', '));
  }
  console.log('\ncombat-<monster> detail (top):');
  const combatDetail = Object.keys(detail).filter(function (k) { return /^combat-/.test(k); })
    .sort(function (a, b) { return detail[b] - detail[a]; });
  for (const k of combatDetail.slice(0, 12)) console.log('  ' + k + ': ' + detail[k]);
  const otherDetail = Object.keys(detail).filter(function (k) { return /^other/.test(k); })
    .sort(function (a, b) { return detail[b] - detail[a]; });
  if (otherDetail.length) {
    console.log('other detail:');
    for (const k of otherDetail.slice(0, 12)) console.log('  ' + k + ': ' + detail[k]);
  }
  console.log('');

  // ---------- village-loss census ----------
  const losses = rows.filter(function (r) { return r.villageLost && r.villageLost.lost; });
  console.log('village losses: ' + losses.length + '/' + rows.length);
  const bySite = {};
  const lossDays = [];
  let natLiveAtDeath = 0;
  for (const r of losses) {
    const vl = r.villageLost;
    bySite[vl.site] = (bySite[vl.site] || 0) + 1;
    if (vl.day != null) lossDays.push(vl.day);
    // nationalLive at the loss day from the daily series
    const dr = (r.daily || []).filter(function (x) { return vl.day != null && x.day === vl.day; })[0]
      || (r.daily || []).filter(function (x) { return vl.day != null && x.day < vl.day; }).slice(-1)[0];
    if (dr && dr.nationalLive) natLiveAtDeath++;
    console.log('  s' + r.seed + '/' + r.policy + ': site=' + vl.site + ' day=' + vl.day +
      ' natLive@death=' + (dr ? dr.nationalLive : '?') + ' shape=' + (dr ? dr.nationalShape : '?') +
      ' end=' + r.endReason);
    console.log('    beat: ' + String(vl.beat || '(no beat captured)').slice(0, 160));
  }
  console.log('loss sites: ' + JSON.stringify(bySite));
  console.log('national-live-at-death: ' + natLiveAtDeath + '/' + losses.length +
    ' (' + (losses.length ? (100 * natLiveAtDeath / losses.length).toFixed(0) : 0) + '%)\n');

  // ---------- d100-150 cluster reproduction ----------
  const sorted = lossDays.slice().sort(function (a, b) { return a - b; });
  const inCluster = sorted.filter(function (d) { return d >= 100 && d <= 150; }).length;
  console.log('loss-day distribution: ' + (sorted.length ? ('min=' + sorted[0] + ' med=' + sorted[Math.floor(sorted.length / 2)] + ' max=' + sorted[sorted.length - 1]) : 'n/a'));
  console.log('d100-150 cluster: ' + inCluster + '/' + sorted.length + ' losses' +
    (sorted.length ? ' — ' + (inCluster / sorted.length >= 0.5 ? 'REPRODUCED' : 'not reproduced') : '') + '\n');

  // ---------- pantry-crash anatomy (per village death) ----------
  console.log('pantry-crash anatomy (final 14d before loss; flows in kcal):');
  for (const r of losses) {
    const vl = r.villageLost;
    const daily = (r.daily || []).slice().sort(function (a, b) { return a.day - b.day; });
    if (!daily.length || vl.day == null) { console.log('  s' + r.seed + '/' + r.policy + ': no daily series'); continue; }
    const win = daily.filter(function (x) { return x.day > vl.day - 14 && x.day <= vl.day; });
    if (!win.length) { console.log('  s' + r.seed + '/' + r.policy + ': empty final window'); continue; }
    const p0 = win[0].pantryKcal, p1 = win[win.length - 1].pantryKcal;
    const feast = win.reduce(function (t, x) { return t + (x.feastKcalOut || 0); }, 0);
    const trib = win.reduce(function (t, x) { return t + (x.tributeKcal || 0); }, 0);
    const trim = win.reduce(function (t, x) { return t + (x.trimKcal || 0); }, 0);
    const pop0 = win[0].pop, pop1 = win[win.length - 1].pop;
    // steepest 7d pantry drop inside the window
    let crash = null;
    for (let i = 0; i + 7 < win.length; i++) {
      const drop = win[i].pantryKcal - win[i + 7].pantryKcal;
      if (!crash || drop > crash.drop) crash = { from: win[i].day, to: win[i + 7].day, drop: drop };
    }
    // implied net inflow = pantry delta + measured outflows (honest label:
    // positive = food arrived; negative = rot+consumption+unmeasured draws)
    const implied = (p1 - p0) + feast + trib;
    console.log('  s' + r.seed + '/' + r.policy + ' loss@d' + vl.day + ' (' + vl.site + '):');
    console.log('    pantry ' + p0.toLocaleString() + ' -> ' + p1.toLocaleString() +
      ' (Δ ' + (p1 - p0).toLocaleString() + '), pop ' + pop0 + ' -> ' + pop1);
    console.log('    measured outflows: feast ' + feast.toLocaleString() + ', tribute ' + trib.toLocaleString() +
      ', trim ' + trim.toLocaleString());
    console.log('    implied net inflow (inflow minus rot/consumption/unmeasured): ' + implied.toLocaleString());
    if (crash) console.log('    steepest 7d crash: d' + crash.from + '->d' + crash.to + ' Δ ' + crash.drop.toLocaleString() + ' kcal');
  }
  console.log('');

  // ---------- wall numbers ----------
  const n = rows.length;
  const sum = function (k) { return rows.filter(function (r) { return r[k]; }).length; };
  const days = rows.map(function (r) { return r.gameDays || r.days || 0; }).sort(function (a, b) { return a - b; });
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  console.log('WALL NUMBERS (n=' + n + '):');
  console.log('  won ' + sum('won') + '/' + n + ', national(end) ' + sum('national') + '/' + n +
    ', national(ever) ' + sum('everNational') + '/' + n + ', table ' + sum('table') + '/' + n);
  console.log('  wave4 ' + sum('wave4') + '/' + n + ', wave5 ' + sum('wave5') + '/' + n +
    ', exiled ' + sum('exiled') + '/' + n);
  console.log('  survival: median ' + med + 'd, max ' + (days.length ? days[days.length - 1] : 0) + 'd\n');

  // ---------- player-vessel deaths ----------
  let pv = 0;
  const pvCauses = {};
  for (const r of rows) for (const d of (r.deaths || [])) {
    if ((d.kind === 'person' || d.kind === 'villager') && d.player) {
      pv++; pvCauses[d.pclass] = (pvCauses[d.pclass] || 0) + 1;
    }
  }
  console.log('player-vessel deaths: ' + pv + ' of ' + totP + ' person deaths');
  for (const k of Object.keys(pvCauses).sort(function (a, b) { return pvCauses[b] - pvCauses[a]; }).slice(0, 8))
    console.log('  ' + k + ': ' + pvCauses[k]);
  console.log('');

  // ---------- combat-unknown breakdown (honest characterization) ----------
  const unkDetail = {};
  for (const r of rows) for (const d of (r.deaths || [])) {
    if ((d.kind === 'person' || d.kind === 'villager') && d.pclass === 'combat-unknown') {
      const k = 'cause=' + d.cause + (d.monsterName ? ' monsterName=' + d.monsterName : '');
      unkDetail[k] = (unkDetail[k] || 0) + 1;
    }
  }
  if (Object.keys(unkDetail).length) {
    console.log('combat-unknown breakdown (engine records no monster id on these paths):');
    for (const k of Object.keys(unkDetail).sort(function (a, b) { return unkDetail[b] - unkDetail[a]; }))
      console.log('  ' + unkDetail[k] + 'x ' + k);
    console.log('  note: cause=monster = died of fight wounds at hurtVillager time (game.js:7695 passes');
    console.log('  the literal cause "monster"; the fight record with the monster id is not threaded through).');
    console.log('');
  }

  // ---------- honest gaps ----------
  console.log('HONEST GAPS (not instrumented, not zero):');
  console.log('  - trap acquisition by source: no trap hooks in this instrument — unmeasured');
  console.log('  - inflow vs rot vs consumption: only implied net (see anatomy) — inseparable');
  console.log('  - contest venue IS captured (deathVenue: state.arenaContest/activeContest);');
  console.log('    ' + rows.reduce(function (t, r) { return t + r.deaths.filter(function (d) { return d.venue === 'contest'; }).length; }, 0) +
    ' person deaths had contest venue');
  console.log('  - instrument errors: ' + rows.reduce(function (t, r) { return t + (r.instrumentErrors || []).length; }, 0));
  console.log('  - unexplained person deaths: ' + unexpl);
}

main();
