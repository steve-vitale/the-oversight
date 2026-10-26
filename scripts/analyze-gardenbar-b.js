#!/usr/bin/env node
// analyze-gardenbar-b.js — garden bar-revision analysis for sim-gardenbar-b.
//
// Reads evidence/2026-10-26/sim-gardenbar-b-corpus/*.json (fresh band
// seeds 9760-9767, competent-nofeast, SEATDRIVE=0, 100d).
//
// PRIMARY metric (brief, literal): raw snapshot classes per seed-day —
//   (a) planted == 0
//   (b) planted > 0, ripe == 0
//   (c) ripe > 0
// reported as a share of seed-days, with a pre/post-first-sow phase split.
// First-sow day = first snapshot day with planted > 0 in that seed;
// pre phase = snapshot days < first-sow day (all days if never sown),
// post phase = snapshot days >= first-sow day.
// SECONDARY (comparability with gardenstate): the cascade classes
// (d)/(H)/(e)/(a)/(b)/(c) from analyze-gardenstate-b.js, where a (d)
// deposit day is counted as (d) even if its snapshot is (a)/(b).
// The verdict is judged in the evidence file against the pre-registered
// bar: raw (a)+(b) >= 95% AND (a) concentrated pre-first-sow, (b)
// dominant post-first-sow.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-gardenbar-b-corpus');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('no corpus files in ' + DIR); process.exit(2); }

const raw = { a: 0, b: 0, c: 0, days: 0 };
const cas = { d: 0, H: 0, e: 0, a: 0, b: 0, c: 0, days: 0 };
const phase = {
  pre: { days: 0, a: 0, b: 0, c: 0, casA: 0, casB: 0 },
  post: { days: 0, a: 0, b: 0, c: 0, casA: 0, casB: 0 },
};
const perSeed = [];
const wall = { national: 0, table: 0, wins: 0, wave4: 0, wave5: 0, survivals: [] };
const tallies = { assigns: 0, keeperTurns: 0, resolutions: 0, throttleRes: 0,
  makes: 0, sows: 0, npcSows: 0, keeperSets: 0, gardenInflows: 0,
  inflowGardenHarvest: 0, ripeSafeDays: 0, ripeUnsafeDays: 0 };
let sensePlanted = null;
let senseGardenDay = null;

for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const ev = s.gardenEvents || {};
  const inflowByDay = {};
  for (const r of (ev.gardenInflows || [])) {
    (inflowByDay[r.day] = inflowByDay[r.day] || []).push(r);
  }
  const dutyDays = new Set();
  for (const e of [...(ev.assigns || []), ...(ev.keeperTurns || []), ...(ev.resolutions || []), ...(ev.keeperSets || []).filter(k => k.ok)]) dutyDays.add(e.day);
  const daysSorted = [...(s.gardenDays || [])].sort((x, y) => x.day - y.day);
  let firstPlanted = null;
  for (const snap of daysSorted) {
    if (firstPlanted == null && (snap.planted || 0) > 0) firstPlanted = snap.day;
  }
  const c = { seed: s.seed, days: 0, rawA: 0, rawB: 0, rawC: 0,
    d: 0, H: 0, e: 0, a: 0, b: 0, cc: 0,
    firstPlanted, firstRipe: null, firstHarvest: null,
    preDays: 0, preA: 0, preB: 0, postDays: 0, postA: 0, postB: 0 };
  let dutyEver = false;
  for (const snap of daysSorted) {
    const d = snap.day;
    if (dutyDays.has(d)) dutyEver = true;
    const infl = inflowByDay[d] || [];
    const otherDoor = infl.filter(r => !(r.door === 'stock' && r.name === 'Garden harvest'));
    const harvest = infl.filter(r => r.door === 'stock' && r.name === 'Garden harvest' && (r.kcal || 0) > 0);
    // Raw class (snapshot only, ignores inflows).
    let rcls;
    if ((snap.planted || 0) === 0) rcls = 'a';
    else if ((snap.ripe || 0) === 0) rcls = 'b';
    else rcls = 'c';
    // Cascade class (gardenstate order).
    let ccls;
    if (otherDoor.length) ccls = 'd';
    else if (harvest.length) ccls = 'H';
    else if (!dutyEver) ccls = 'e';
    else if ((snap.planted || 0) === 0) ccls = 'a';
    else if ((snap.ripe || 0) === 0) ccls = 'b';
    else ccls = 'c';
    raw[rcls]++; raw.days++;
    cas[ccls]++; cas.days++;
    if (rcls === 'a') c.rawA++; else if (rcls === 'b') c.rawB++; else c.rawC++;
    if (ccls === 'd') c.d++; else if (ccls === 'H') c.H++; else if (ccls === 'e') c.e++;
    else if (ccls === 'a') c.a++; else if (ccls === 'b') c.b++; else c.cc++;
    c.days++;
    if (c.firstRipe == null && (snap.ripe || 0) > 0) c.firstRipe = d;
    if (c.firstHarvest == null && harvest.length) c.firstHarvest = d;
    if ((snap.ripeSafe || 0) > 0) tallies.ripeSafeDays++;
    if ((snap.ripeUnsafe || 0) > 0) tallies.ripeUnsafeDays++;
    // Phase split.
    const ph = (firstPlanted == null || d < firstPlanted) ? phase.pre : phase.post;
    ph.days++;
    ph[rcls]++;
    if (ccls === 'a') ph.casA++;
    if (ccls === 'b') ph.casB++;
    if (ph === phase.pre) { c.preDays++; if (rcls === 'a') c.preA++; if (rcls === 'b') c.preB++; }
    else { c.postDays++; if (rcls === 'a') c.postA++; if (rcls === 'b') c.postB++; }
    if (!sensePlanted && (snap.planted || 0) > 0) {
      const line = (ev.sayLines || []).find(l => l.day === d);
      if (line) sensePlanted = { seed: s.seed, day: d, line: line.line };
    }
    if (!senseGardenDay) {
      const line = (ev.sayLines || []).find(l => l.day === d);
      if (line) senseGardenDay = { seed: s.seed, day: d, line: line.line };
    }
  }
  perSeed.push(c);
  tallies.assigns += (ev.assigns || []).length;
  tallies.keeperTurns += (ev.keeperTurns || []).length;
  tallies.resolutions += (ev.resolutions || []).length;
  tallies.throttleRes += (ev.resolutions || []).filter(r => r.throttle).length;
  tallies.makes += (ev.makes || []).length;
  tallies.sows += (ev.sows || []).length;
  tallies.npcSows += (ev.npcSows || []).length;
  tallies.keeperSets += (ev.keeperSets || []).length;
  tallies.gardenInflows += (ev.gardenInflows || []).length;
  tallies.inflowGardenHarvest += (s.inflows || []).filter(r => r.name === 'Garden harvest').length;
  if (s.national) wall.national++;
  if (s.table) wall.table++;
  if (s.win) wall.wins++;
  if ((s.waveReach || []).includes(4)) wall.wave4++;
  if ((s.waveReach || []).includes(5)) wall.wave5++;
  wall.survivals.push(s.daysAlive);
}
wall.survivals.sort((a, b) => a - b);
const median = wall.survivals.length
  ? wall.survivals[Math.floor(wall.survivals.length / 2)] : null;
const pct = (n, d) => (d ? (100 * n / d).toFixed(1) : '0');

console.log('seeds: ' + files.length);
console.log('seed-days: ' + raw.days);
console.log('raw a: ' + raw.a + ' (' + pct(raw.a, raw.days) + '%)');
console.log('raw b: ' + raw.b + ' (' + pct(raw.b, raw.days) + '%)');
console.log('raw c: ' + raw.c + ' (' + pct(raw.c, raw.days) + '%)');
console.log('raw a+b: ' + (raw.a + raw.b) + ' (' + pct(raw.a + raw.b, raw.days) + '%)');
for (const k of ['d', 'H', 'e', 'a', 'b', 'c']) {
  console.log('cascade ' + k + ': ' + cas[k] + ' (' + pct(cas[k], cas.days) + '%)');
}
console.log('cascade a+b: ' + (cas.a + cas.b) + ' (' + pct(cas.a + cas.b, cas.days) + '%)');
console.log('phase pre: days=' + phase.pre.days + ' a=' + phase.pre.a + ' (' + pct(phase.pre.a, phase.pre.days) + '%) b=' + phase.pre.b + ' (' + pct(phase.pre.b, phase.pre.days) + '%) c=' + phase.pre.c + ' casA=' + phase.pre.casA + ' casB=' + phase.pre.casB);
console.log('phase post: days=' + phase.post.days + ' a=' + phase.post.a + ' (' + pct(phase.post.a, phase.post.days) + '%) b=' + phase.post.b + ' (' + pct(phase.post.b, phase.post.days) + '%) c=' + phase.post.c + ' casA=' + phase.post.casA + ' casB=' + phase.post.casB);
console.log('per-seed (seed rawA/rawB/rawC d/H/e/a/b/c days firstPlanted firstRipe firstHarvest preDays/preA/preB postDays/postA/postB):');
for (const c of perSeed) {
  console.log(`  ${c.seed} ${c.rawA}/${c.rawB}/${c.rawC} ${c.d}/${c.H}/${c.e}/${c.a}/${c.b}/${c.cc} days=${c.days} planted=${c.firstPlanted} ripe=${c.firstRipe} harvest=${c.firstHarvest} pre=${c.preDays}/${c.preA}/${c.preB} post=${c.postDays}/${c.postA}/${c.postB}`);
}
console.log('tallies: ' + JSON.stringify(tallies));
console.log('wall: national=' + wall.national + '/' + files.length + ' table=' + wall.table + ' wins=' + wall.wins +
  ' wave4=' + wall.wave4 + ' wave5=' + wall.wave5 + ' medianSurvival=' + median + ' survivals=' + JSON.stringify(wall.survivals));
console.log('sense plantedDay: ' + JSON.stringify(sensePlanted));
console.log('sense gardenDay: ' + JSON.stringify(senseGardenDay));
