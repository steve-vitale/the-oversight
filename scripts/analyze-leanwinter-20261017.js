#!/usr/bin/env node
// scripts/analyze-leanwinter-20261017.js — ARM 1 analyzer for sim-leanwinter-b.
// Reads evidence/2026-10-17/perseed-leanwinter-b/*.json (the shared sweep)
// and delivers the lean-season starvation census: full attribution of every
// starvation death, the #418 water contract, the #340 half-ration watch,
// the per-seed heterogeneity map, and the wall numbers with the substrate
// verdict. PRIMARY GO gates are printed at the end (binding §14).
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-leanwinter-b');
const recs = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

function line(s) { console.log(s); }
const sum = (arr, f) => arr.reduce((a, r) => a + (f(r) | 0), 0);
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const n = recs.length;

line(`== sim-leanwinter-b — lean-season starvation census (n=${n} runs) ==`);

// ---- 0. completeness ----
const complete = recs.length === 16 && recs.every(r => Number.isFinite(r.gameDays) && Array.isArray(r.deaths));
const schemaOK = recs.every(r => ['national', 'table', 'wins', 'exiled', 'wave4', 'wave5', 'medianDays'].every(k => typeof r[k] === 'number'));
const errs = sum(recs, r => r.instrumentErrors);
line(`completion: ${recs.length}/16 runs, schema-numeric wall keys=${schemaOK}, instrument errors=${errs}`);

// ---- 1. cause inventory ----
const inv = {};
let totalDeaths = 0;
for (const r of recs) for (const d of r.deaths) {
  totalDeaths++;
  const key = d.cause == null ? '<null>' : d.cause;
  const e = inv[key] || (inv[key] = { n: 0, cls: d.cls, player: 0, villager: 0 });
  e.n++; if (d.player) e.player++; else e.villager++;
}
line(`\n-- cause inventory (total deaths=${totalDeaths}) --`);
for (const [cs, e] of Object.entries(inv).sort((a, b) => b[1].n - a[1].n)) {
  line(`  '${cs}': n=${e.n} cls=${e.cls} player=${e.player} villager=${e.villager}`);
}

// ---- 2. starvation attribution (100% binding) ----
const starv = [];
for (const r of recs) for (const d of r.deaths) {
  if (d.cls === 'STARVATION') starv.push({ r, d });
}
line(`\n-- STARVATION attribution: ${starv.length}/${totalDeaths} deaths (${(100 * starv.length / Math.max(1, totalDeaths)).toFixed(1)}%) --`);
const fully = starv.filter(({ d }) => d.at && d.at.seasonId != null && typeof d.at.freshDays === 'number' && typeof d.player === 'boolean');
line(`  fully attributed (season+freshDays+road+role): ${fully.length}/${starv.length} = ${(100 * fully.length / Math.max(1, starv.length)).toFixed(1)}%`);
// role split
const sPlayer = starv.filter(({ d }) => d.player).length;
const sVill = starv.length - sPlayer;
line(`  role: scholar(player)=${sPlayer}, villager=${sVill}`);
// road split
const sLead = starv.filter(({ r }) => r.policyId === 'leadfeast').length;
const sBel = starv.length - sLead;
line(`  road: leadfeast=${sLead}, belongfeast=${sBel}`);
// season split
const sLean = starv.filter(({ d }) => d.at && d.at.lean).length;
const sNonLean = starv.filter(({ d }) => d.at && !d.at.lean).length;
const sNoSeason = starv.length - sLean - sNonLean;
line(`  season: lean(winter)=${sLean}, non-lean=${sNonLean}, unknown=${sNoSeason}`);
// pantry-at-onset buckets
const buckets = { bare: 0, thin: 0, low: 0, stocked: 0, unknown: 0 };
for (const { d } of starv) {
  const at = d.at || {};
  if (typeof at.freshDays !== 'number') { buckets.unknown++; continue; }
  if (at.empty || at.freshDays === 0) buckets.bare++;
  else if (at.freshDays < 2) buckets.thin++;
  else if (at.freshDays < 4) buckets.low++;
  else buckets.stocked++;
}
line(`  pantry fresh-days at onset: bare(0)=${buckets.bare} thin(<2)=${buckets.thin} low(2-4)=${buckets.low} stocked(>=4)=${buckets.stocked} unknown=${buckets.unknown}`);
// scholar starvation with a stocked pantry (the food-but-no-access class):
const sStockedScholar = starv.filter(({ d }) => d.player && d.at && typeof d.at.freshDays === 'number' && d.at.freshDays >= 2).length;
line(`  scholar starvation with freshDays>=2 at onset (stocked-pantry class): ${sStockedScholar}`);
// day-of-year spread
const doys = starv.map(({ d }) => d.at && d.at.dayOfYear).filter(x => typeof x === 'number');
if (doys.length) line(`  day-of-year spread: min=${Math.min(...doys)} max=${Math.max(...doys)} (lean=winter ids: ${JSON.stringify([...new Set(starv.filter(({ d }) => d.at && d.at.lean).map(({ d }) => d.at.seasonId))])})`);
// night-over (hunger-adjacent, NOT starvation)
const nightOver = recs.flatMap(r => r.deaths).filter(d => d.cls === 'NIGHT-OVER');
line(`  NIGHT-OVER (hunger-adjacent, excluded from starvation): ${nightOver.length}`);

// ---- 3. water contract (#418): BOTH strings, roles split ----
const water = { thirst: 0, dehyd: 0, thirstP: 0, dehydP: 0, thirstV: 0, dehydV: 0 };
for (const r of recs) for (const d of r.deaths) {
  if (d.cls === 'WATER-THIRST') { water.thirst++; d.player ? water.thirstP++ : water.thirstV++; }
  if (d.cls === 'WATER-DEHYDRATION') { water.dehyd++; d.player ? water.dehydP++ : water.dehydV++; }
}
line(`\n-- WATER contract #418 --`);
line(`  'thirst': ${water.thirst} (player=${water.thirstP}, villager=${water.thirstV})`);
line(`  'dehydration': ${water.dehyd} (player=${water.dehydP}, villager=${water.dehydV})`);
line(`  strings kept separate: YES (no merging in this instrument)`);

// ---- 4. half-ration watch (#340) ----
const halfLead = recs.filter(r => r.policyId === 'leadfeast');
const halfBel = recs.filter(r => r.policyId === 'belongfeast');
const hrRate = (rs) => sum(rs, r => r.halfRationDays) / Math.max(1, sum(rs, r => r.gameDays));
line(`\n-- HALF-RATION watch (#340) --`);
line(`  leadfeast:   ${sum(halfLead, r => r.halfRationDays)} half-ration days / ${sum(halfLead, r => r.gameDays)} day-alive = ${hrRate(halfLead).toFixed(4)}/day`);
line(`  belongfeast: ${sum(halfBel, r => r.halfRationDays)} half-ration days / ${sum(halfBel, r => r.gameDays)} day-alive = ${hrRate(halfBel).toFixed(4)}/day`);
line(`  combined:    ${sum(recs, r => r.halfRationDays)} / ${sum(recs, r => r.gameDays)} = ${hrRate(recs).toFixed(4)}/day`);
line(`  starvedDays (engine hungry-days): ${sum(recs, r => r.starvedDays)}`);

// ---- 5. per-seed heterogeneity map ----
line(`\n-- PER-SEED heterogeneity map (starvation deaths per seed x road) --`);
const perSeed = {};
for (const r of recs) {
  const e = perSeed[r.seed] || (perSeed[r.seed] = { seed: r.seed, lead: 0, belong: 0, leadDeaths: 0, belongDeaths: 0, leadDays: 0, belongDays: 0 });
  const k = r.policyId === 'leadfeast' ? 'lead' : 'belong';
  e[k] = r.deaths.filter(d => d.cls === 'STARVATION').length;
  e[k + 'Deaths'] = r.deaths.length;
  e[k + 'Days'] = r.gameDays;
}
const rows = Object.values(perSeed).sort((a, b) => a.seed - b.seed);
for (const e of rows) {
  const tot = e.lead + e.belong;
  line(`  s${e.seed}: lead=${e.lead} (d=${e.leadDeaths}/${e.leadDays}d) belong=${e.belong} (d=${e.belongDeaths}/${e.belongDays}d) total=${tot}`);
}
const totals = rows.map(e => e.lead + e.belong);
const deltas = rows.map(e => Math.abs(e.lead - e.belong));
const worst = rows.reduce((a, b) => (a.lead + a.belong >= b.lead + b.belong ? a : b));
line(`  starvation per seed: min=${Math.min(...totals)} max=${Math.max(...totals)} median=${median(totals)}`);
line(`  |lead-belong| per-seed delta: min=${Math.min(...deltas)} max=${Math.max(...deltas)} median=${median(deltas)}`);
line(`  worst seed: s${worst.seed} (${worst.lead + worst.belong} starvation deaths: lead=${worst.lead} belong=${worst.belong})`);

// ---- 6. wall numbers + substrate verdict ----
line(`\n-- WALL numbers (pre-seat substrate; telemetry baseline expects national=12 table=16 wins=16 exiled=0 — LOUD deviations EXPECTED per substrate-mismatch class) --`);
const gd = recs.map(r => r.gameDays);
line(`  national=${sum(recs, r => r.national)}/${n} table=${sum(recs, r => r.table)}/${n} wins=${sum(recs, r => r.wins)}/${n} exiled=${sum(recs, r => r.exiled)}/${n}`);
line(`  wave4=${sum(recs, r => r.wave4)}/${n} wave5=${sum(recs, r => r.wave5)}/${n} arc2=${sum(recs, r => r.arc2)}/${n} arc3=${sum(recs, r => r.arc3)}/${n} arc4=${sum(recs, r => r.arc4)}/${n} fourRealm=${sum(recs, r => r.fourRealm)}/${n}`);
line(`  survival: median=${median(gd).toFixed(1)}d max=${Math.max(...gd)}d min=${Math.min(...gd)}d`);

// ---- 7. PRIMARY GO gates (binding §14) ----
line(`\n== PRIMARY GO gates (binding) ==`);
const g1 = recs.length === 16;
const g2 = starv.length > 0 && fully.length === starv.length;
const g3 = rows.length === 8 && rows.every(e => Number.isInteger(e.lead) && Number.isInteger(e.belong));
line(`  G1 16/16 complete: ${g1 ? 'GO' : 'NO-GO'} (${recs.length}/16)`);
line(`  G2 100% starvation attribution: ${g2 ? 'GO' : 'NO-GO'} (${fully.length}/${starv.length})`);
line(`  G3 heterogeneity map present: ${g3 ? 'GO' : 'NO-GO'}`);
line(`  G4 0 instrument errors: ${errs === 0 ? 'GO' : 'NO-GO'} (${errs})`);
