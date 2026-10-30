#!/usr/bin/env node
// scripts/test-starveplenty-b.js — proof for sim-starveplenty-b (DIAG only).
// Asserts, without re-running sims:
//  1. Trace leg fidelity: trace-9983 death sequence equals the wall corpus
//     sense file's death sequence (day, kind, who, cause, player) exactly.
//  2. Census completeness: all 8 preregistered seeds 9991-9998 present.
//  3. Census reconciliation: classified starvation deaths sum to 5
//     (9994: adaeze_nwosu d51, luis_fernandez d58; 9995: gen_k1gx1tz d31,
//     gen_2o2a6ve d31, owen_smith d32); plenty-test (>=5,000 kcal
//     villageEats-entry within 7 days before death) passes for exactly 1
//     (adaeze_nwosu, 13,585 @ d44).
//  4. Mechanism evidence present: every classified death's window has
//     zero away days on -8 hit days, zero unknown/spoiled pantry turns,
//     and a first -8 hit at health < 50 (low-health-compounded in all).
//  5. DIAG-ONLY guard: no src/js file differs from HEAD.
// Usage: node scripts/test-starveplenty-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-30');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function load(n) { return JSON.parse(fs.readFileSync(path.join(EV, n), 'utf8')); }

const trace = load('sim-starveplenty-b-trace-9983.json');
const sense = load('sim-wall-b-sense-9983.json');
const norm = ds => ds.map(d => [d.day, d.kind, d.who, d.cause, !!d.player].join('|')).join('\n');
check('trace-9983 deaths == wall sense deaths', norm(trace.deaths) === norm(sense.deaths),
  'trace ' + trace.deaths.length + ' vs sense ' + sense.deaths.length);
check('trace-9983 end village-lost day 39', trace.days === 39 && trace.endReason === 'village-lost');
check('trace-9983 scattered (not extinct)', (() => { const l = trace.daily[trace.daily.length - 1]; return l.exit.scattered === true && l.exit.extinct === false; })());
check('trace-9983 final roster 7 living members', trace.finalRoster.length === 7 && trace.finalRoster.every(r => !r.dead && r.member === true));

const censusSeeds = [9991, 9992, 9993, 9994, 9995, 9996, 9997, 9998];
const census = {};
for (const s of censusSeeds) {
  const f = 'sim-starveplenty-b-census-' + s + '.json';
  check('census seed ' + s + ' present', fs.existsSync(path.join(EV, f)));
  if (fs.existsSync(path.join(EV, f))) census[s] = load(f);
}
const starvDeaths = [];
for (const s of censusSeeds) {
  const t = census[s]; if (!t) continue;
  for (const d of t.deaths) if (d.cause === 'starvation' && d.kind === 'villager') starvDeaths.push({ seed: s, day: d.day, vid: d.who });
}
check('census starvation deaths == 5', starvDeaths.length === 5, JSON.stringify(starvDeaths));
const expected = [['9994', 51, 'adaeze_nwosu'], ['9994', 58, 'luis_fernandez'], ['9995', 31, 'gen_k1gx1tz'], ['9995', 31, 'gen_2o2a6ve'], ['9995', 32, 'owen_smith']];
const got = starvDeaths.map(x => [String(x.seed), x.day, x.vid]);
check('census starvation deaths are the expected five', JSON.stringify(got.sort()) === JSON.stringify(expected.sort()), JSON.stringify(got));
// Plenty test + mechanism evidence per death (recomputed from raw rows).
function plentyAndEvidence(t, vid, day) {
  const win = t.daily.filter(x => x.day >= day - 7 && x.day < day);
  const plenty = win.length ? Math.max(...win.map(x => (x.entry && x.entry.pantry ? x.entry.pantry.total : 0))) : 0;
  const meals = t.meals.filter(m => m.vid === vid && m.day >= day - 7 && m.day <= day);
  const hits8 = t.starveHits.filter(h => h.vid === vid && h.damage === 8 && h.day <= day);
  const first8 = hits8.length ? hits8.reduce((a, h) => (h.day < a.day ? h : a), hits8[0]) : null;
  const hitDays = new Set(hits8.map(h => h.day));
  const awayOnHit = meals.filter(m => hitDays.has(m.day) && m.away).length;
  const unknownTurns = meals.filter(m => m.pantryBefore.unknown > 0).length;
  const spoiledTurns = meals.filter(m => m.pantryBefore.spoiled > 0).length;
  return { plenty, first8Health: first8 ? first8.healthBefore : null, awayOnHit, unknownTurns, spoiledTurns };
}
const plentyPass = [];
for (const x of starvDeaths) {
  const e = plentyAndEvidence(census[x.seed], x.vid, x.day);
  if (e.plenty >= 5000) plentyPass.push(x.seed + ':' + x.vid);
  check('death ' + x.seed + ':' + x.vid + ' plenty=' + e.plenty, true); // informational
  check('death ' + x.seed + ':' + x.vid + ' zero away on hit days', e.awayOnHit === 0, 'awayOnHit=' + e.awayOnHit);
  check('death ' + x.seed + ':' + x.vid + ' zero unknown/spoiled turns', e.unknownTurns === 0 && e.spoiledTurns === 0, 'unknown=' + e.unknownTurns + ' spoiled=' + e.spoiledTurns);
  check('death ' + x.seed + ':' + x.vid + ' first -8 hit health < 50', e.first8Health !== null && e.first8Health < 50, 'health=' + e.first8Health);
}
check('plenty-test passes == 1 (adaeze only)', plentyPass.length === 1 && plentyPass[0] === '9994:adaeze_nwosu', JSON.stringify(plentyPass));

let srcDiff = '';
try { srcDiff = execSync('git diff --name-only HEAD -- src/js', { cwd: ROOT }).toString().trim(); } catch (e) { srcDiff = 'GIT-ERROR:' + e.message; }
check('diag-only: no src/js diff vs HEAD', srcDiff === '', srcDiff);

console.log('\n' + pass + '/' + (pass + fail) + ' GREEN');
process.exit(fail ? 1 : 0);
