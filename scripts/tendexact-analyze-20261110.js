// tendexact-analyze-20261110.js — judge the tendexact pilot corpus.
// Reads evidence/2026-11-10/perseed-tendexact-a/ (or $CORPUS) and prints
// the per-seed table plus the prereg verdict: primary (every tend pays
// exactly 1,500 on the armed leg, none overpays), secondary (trust lost
// to the 100 cap, measured only), cost bar (starvation armed <= control
// + 2 AND arm-only starvation <= control AND median armed >= 0.8x
// control median, standard median), and wall numbers. Exit 0 prints
// the verdict; exit 1 when the corpus is incomplete.
// Usage: node scripts/tendexact-analyze-20261110.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || process.env.CORPUS || path.join(REPO, 'evidence', '2026-11-10', 'perseed-tendexact-a');

function median(xs) {
  const s = xs.slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function starvDeaths(run) {
  return ((run.teleDeaths || []).filter(function (e) { return e && e.cause === 'starvation'; })).length;
}
function armOnlyStarv(base, armed) {
  // Deaths attributable to the arm: per-seed excess of armed over
  // control starvation deaths, summed (matches the answermail-a
  // confirm's "arm-only starvation" reading).
  let n = 0;
  Object.keys(armed).forEach(function (seed) {
    const a = starvDeaths(armed[seed]);
    const c = base[seed] ? starvDeaths(base[seed]) : 0;
    n += Math.max(0, a - c);
  });
  return n;
}

const files = fs.readdirSync(DIR).filter(function (f) { return /^tendexact-s\d+-tendexact-(base|armed)\.json$/.test(f); });
const legs = { base: {}, armed: {} };
files.forEach(function (f) {
  const run = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const leg = /-armed\.json$/.test(f) ? 'armed' : 'base';
  legs[leg][run.seed] = run;
});
const seeds = Object.keys(legs.base).map(Number).sort(function (a, b) { return a - b; });
const missing = seeds.filter(function (s) { return !legs.armed[s]; });
const extraArmed = Object.keys(legs.armed).map(Number).filter(function (s) { return !legs.base[s]; });
if (!seeds.length || missing.length || extraArmed.length) {
  console.error('TENDEXACT ANALYZE STOP: base seeds ' + JSON.stringify(seeds)
    + ' missing armed ' + JSON.stringify(missing) + ' extra armed ' + JSON.stringify(extraArmed));
  process.exit(1);
}

function summarize(leg) {
  let tends = 0, exact = 0, over = 0, partial = 0, paidTotal = 0, capped = 0, capLost = 0;
  let starv = 0, deaths = 0, wins = 0, national = 0, table = 0, w4 = 0, w5 = 0;
  const days = [];
  seeds.forEach(function (s) {
    const r = leg[s];
    days.push(r.days);
    (r.tendPaid || []).forEach(function (tp) {
      tends += 1; paidTotal += tp.paid;
      if (tp.paid === 1500) exact += 1;
      else if (tp.paid > 1500) over += 1;
      else partial += 1;
    });
    (r.cappedTends || []).forEach(function (c) { capped += 1; capLost += c.lost; });
    starv += starvDeaths(r); deaths += (r.teleDeaths || []).length;
    if (r.won) wins += 1;
    if (r.scaleRank === 'national') national += 1;
    if (r.scaleRank === 'table' || r.scaleRank === 'galactic') table += 1;
    if ((r.maxWave || 1) >= 4) w4 += 1;
    if ((r.maxWave || 1) >= 5) w5 += 1;
  });
  return { tends: tends, exact: exact, over: over, partial: partial, paidTotal: paidTotal,
    capped: capped, capLost: capLost, starv: starv, deaths: deaths, wins: wins,
    national: national, table: table, w4: w4, w5: w5, medianDays: median(days), days: days };
}

const b = summarize(legs.base), a = summarize(legs.armed);
console.log('seed | days base->armed | tends | paid base->armed | exact/over/partial armed | capped (lost) | starv base->armed | maxWave base->armed | scale base->armed');
seeds.forEach(function (s) {
  const rb = legs.base[s], ra = legs.armed[s];
  const pb = (rb.tendPaid || []).map(function (x) { return x.paid; }).join(',');
  const pa = (ra.tendPaid || []).map(function (x) { return x.paid; }).join(',');
  console.log(s + ' | ' + rb.days + '->' + ra.days + ' (' + rb.endReason + '->' + ra.endReason + ')'
    + ' | ' + (rb.tendPaid || []).length + '->' + (ra.tendPaid || []).length
    + ' | [' + pb + ']->[' + pa + ']'
    + ' | ' + (ra.tendPaid || []).filter(function (x) { return x.paid === 1500; }).length + '/'
    + (ra.tendPaid || []).filter(function (x) { return x.paid > 1500; }).length + '/'
    + (ra.tendPaid || []).filter(function (x) { return x.paid < 1500; }).length
    + ' | ' + (ra.cappedTends || []).length + ' (' + (ra.cappedTends || []).reduce(function (t, c) { return t + c.lost; }, 0) + ')'
    + ' | ' + starvDeaths(rb) + '->' + starvDeaths(ra)
    + ' | ' + (rb.maxWave || 1) + '->' + (ra.maxWave || 1)
    + ' | ' + rb.scaleRank + '->' + ra.scaleRank);
});
console.log('--- band totals (' + seeds.length + ' seeds/leg) ---');
console.log('tends base ' + b.tends + ' armed ' + a.tends + ' | paid base ' + b.paidTotal + ' (sticker ' + (b.tends * 1500) + ', over +' + (b.paidTotal - b.tends * 1500) + ')'
  + ' armed ' + a.paidTotal + ' (sticker ' + (a.tends * 1500) + ', over +' + (a.paidTotal - a.tends * 1500) + ')');
console.log('armed exact ' + a.exact + '/' + a.tends + ' overpaid ' + a.over + ' partial ' + a.partial);
console.log('capped tends base ' + b.capped + ' (trust lost ' + b.capLost + ') armed ' + a.capped + ' (trust lost ' + a.capLost + ')');
console.log('starvation base ' + b.starv + ' armed ' + a.starv + ' (arm-only seeds ' + armOnlyStarv(legs.base, legs.armed) + ')'
  + ' | deaths base ' + b.deaths + ' armed ' + a.deaths);
console.log('median survival base ' + b.medianDays + ' armed ' + a.medianDays + ' (bar ' + (0.8 * b.medianDays) + ')');
console.log('wall: wins ' + b.wins + '->' + a.wins + ' national ' + b.national + '->' + a.national + ' table ' + b.table + '->' + a.table
  + ' wave4 ' + b.w4 + '->' + a.w4 + ' wave5 ' + b.w5 + '->' + a.w5);
const errs = seeds.reduce(function (n, s) { return n + (legs.base[s].instrumentErrors || []).length + (legs.armed[s].instrumentErrors || []).length; }, 0);
console.log('instrument errors (both legs): ' + errs);
const primaryGO = a.tends >= 8 && a.over === 0 && a.exact === a.tends;
const costGO = a.starv <= b.starv + 2 && armOnlyStarv(legs.base, legs.armed) <= b.starv && a.medianDays >= 0.8 * b.medianDays;
console.log('PRIMARY (every tend == 1500, >= 8 tends, none over): ' + (primaryGO ? 'GO' : 'NO-GO'));
console.log('COST BAR (starv <= ctrl+2 AND arm-only <= ctrl AND median >= 0.8x ctrl): ' + (costGO ? 'PASS' : 'FAIL'));
console.log('VERDICT: ' + ((primaryGO && costGO) ? 'GO' : 'NO-GO'));
