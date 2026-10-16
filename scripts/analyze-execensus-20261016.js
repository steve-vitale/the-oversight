#!/usr/bin/env node
// analyze-execensus-20261016.js — the sim-execensus execution-window judge.
// Reads evidence/2026-10-16/perseed-execensus/*.json (16 runs: 8 fresh seeds
// x {leadfeast, belongfeast}, NODEWITNESS=1, pre-seat) and judges the
// pre-registered PRIMARY plus the three execution-window questions:
//
//   1. Do witness-learned tricks ever fire in live fights?
//   2. When they fire, what happens?
//   3. Where does the funnel break — conditions never met, execution never
//      attempted, attempted but failed?
//
// PRIMARY (binding, §14): 100% attribution — every witness-sourced learning
// in the 16 runs is traced to a classified execution outcome or an explicit
// no-opportunity verdict. A miss means the instrument is incomplete, not
// that the window is empty.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-execensus');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
if (!files.length) { console.error('no per-seed JSONs in ' + DIR); process.exit(2); }
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log(`runs: ${runs.length} (${files[0]} .. ${files[files.length - 1]})`);

// ---- wall numbers (context) ----
let nat = 0, tab = 0, won = 0, w4 = 0, w5 = 0, days = [], fieldDeaths = [];
for (const r of runs) {
  nat += r.national | 0; tab += r.table | 0; won += r.won | 0;
  w4 += r.wave4Reached | 0; w5 += r.wave5Reached | 0;
  days.push(r.days); fieldDeaths.push(r.fieldDeaths | 0);
}
days.sort((a, b) => a - b);
const median = days[Math.floor(days.length / 2)];
console.log(`wall: national ${nat}/${runs.length} table ${tab}/${runs.length} won ${won}/${runs.length} wave4 ${w4}/${runs.length} wave5 ${w5}/${runs.length} median ${median}d max ${days[days.length - 1]}d`);

// ---- learnings ----
// pure/shared relabeled from raw fields (via + witnessObsBefore): the
// sweep's stored witnessSourced used the via-only rule, but a
// via='node-witnessed' discovery can rest on 1 witness + 1 survived
// observation (the shared-bar story). pure = witness channel wrote both
// observations; shared = it wrote the decisive one.
const learnings = [];
for (const r of runs) for (const l of (r.witnessLearnings || [])) {
  const src = (l.via === 'node-witnessed' && (l.witnessObsBefore | 0) >= 2) ? 'pure' : 'shared';
  learnings.push({ run: r.policyId + '-s' + r.seed, ...l, witnessSourced: src });
}
console.log(`\nwitness-sourced learnings: ${learnings.length}`);
const byWave = {}, byStore = {}, bySrc = {};
for (const l of learnings) {
  byWave['w' + l.wave] = (byWave['w' + l.wave] || 0) + 1;
  byStore[l.store] = (byStore[l.store] || 0) + 1;
  bySrc[l.witnessSourced] = (bySrc[l.witnessSourced] || 0) + 1;
}
console.log('  by wave:', JSON.stringify(byWave), ' by store:', JSON.stringify(byStore), ' pure/shared:', JSON.stringify(bySrc));
for (const l of learnings) console.log(`  - ${l.run} d${l.day} ${l.id} (w${l.wave}, ${l.store}, ${l.witnessSourced}): ${l.trick} — ${l.trickText.slice(0, 90)}`);

// ---- PRIMARY: 100% attribution ----
const funnels = [];
for (const r of runs) for (const f of (r.funnel || [])) funnels.push({ run: r.policyId + '-s' + r.seed, ...f });
const unattributed = funnels.filter(f => ['traced', 'no-opportunity'].indexOf(f.verdict) < 0);
const attribution = funnels.length ? (funnels.length - unattributed.length) / funnels.length : 1;
console.log(`\nPRIMARY (100% attribution): ${funnels.length - unattributed.length}/${funnels.length} = ${(attribution * 100).toFixed(1)}%`);
if (unattributed.length) { console.log('  UNATTRIBUTED:'); for (const u of unattributed) console.log('   ', u.run, u.learnId, u.verdict); }
console.log(attribution >= 1 ? '  VERDICT: GO' : '  VERDICT: NO-GO');

// ---- the funnel ----
let nTraced = 0, nNoOpp = 0;
const clsCounts = {}, execOutcomes = [], trickFires = {};
for (const f of funnels) {
  if (f.verdict === 'traced') nTraced++;
  else if (f.verdict === 'no-opportunity') nNoOpp++;
  for (const e of (f.fights || []).concat(f.tbFights || [])) {
    const k = e.path + ':' + e.cls;
    clsCounts[k] = (clsCounts[k] || 0) + 1;
    if ((e.fires | 0) > 0 || (e.performances || []).length > 0) {
      const tk = (e.trickLog || e.performances || []).join(',');
      trickFires[tk] = (trickFires[tk] || 0) + 1;
      execOutcomes.push({ run: f.run, species: f.id, path: e.path, cls: e.cls, sub: e.sub, day: e.day, vid: e.vid || e.result });
    }
  }
}
console.log(`\nfunnel: ${nTraced} learnings traced to post-learning fights, ${nNoOpp} with zero post-learning fights (no-opportunity verdict)`);
console.log('post-learning fight classes:');
for (const k of Object.keys(clsCounts).sort()) console.log(`  ${k}: ${clsCounts[k]}`);
console.log(`\nexecutions (trick fired): ${execOutcomes.length}`);
for (const tk of Object.keys(trickFires).sort()) console.log(`  trick-log [${tk}]: ${trickFires[tk]}x`);
for (const e of execOutcomes) console.log(`  - ${e.run} d${e.day} ${e.species} [${e.path}] ${e.cls} — ${e.sub}`);

// ---- where does it break ----
const field = Object.keys(clsCounts).filter(k => k.startsWith('field:'));
const totalField = field.reduce((a, k) => a + clsCounts[k], 0);
console.log('\nfield-path break-down (of ' + totalField + ' post-learning field fights):');
for (const k of field.sort()) {
  const c = clsCounts[k];
  console.log(`  ${k.replace('field:', '')}: ${c} (${(c / totalField * 100).toFixed(1)}%)`);
}

// per-learning detail
console.log('\nper-learning funnel detail:');
for (const f of funnels) {
  console.log(`  ${f.run} d${f.day} ${f.id} [${f.witnessSourced}] verdict=${f.verdict} execs=${f.execs} classes=${JSON.stringify(f.summary)}`);
}
