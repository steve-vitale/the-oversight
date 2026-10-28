#!/usr/bin/env node
// analyze-awayvoice-reproof-b.js — re-proof counts for the LANDED
// away-hunger voice beat on fresh seeds 96001–96008 (single cell
// "reproof": current master). Reads per-seed files ONLY from
// evidence/2026-10-28/sim-awayvoice-b-reproof-corpus/. Writes no files.
// A beat fire = a say line emitted during that packMeal call containing
// "away from the haven" (call-attributed, as in the landed sweep).
// Low-health = healthBefore <= 7; healthy = healthBefore >= 50.
// Name check: the fired line must contain the call's own firstName.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-awayvoice-b-reproof-corpus');
const SEEDS = [96001, 96002, 96003, 96004, 96005, 96006, 96007, 96008];
let totLow = 0, totLowFired = 0, totHealthy = 0, totHealthyFired = 0, totBorrow = 0, totCalls = 0;
const excerpts = [];
for (const seed of SEEDS) {
  const f = path.join(DIR, `awayvoice-b-reproof-s${seed}.json`);
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const calls = (d.packCalls || []).filter(c => c.away === true);
  let low = 0, lowFired = 0, healthy = 0, healthyFired = 0, borrow = 0;
  const seedEx = [];
  for (const c of calls) {
    totCalls++;
    const beats = (c.beatLines || []).filter(t => /away from the haven/.test(t));
    const fired = beats.length > 0;
    if (c.healthBefore != null && c.healthBefore <= 7) {
      low++;
      if (fired) {
        lowFired++;
        if (c.firstName && !beats[0].includes(c.firstName)) borrow++;
        if (seedEx.length < 2) seedEx.push(`d${c.day} ${c.firstName || '?'} hp${c.healthBefore} want${c.want} take${c.take}: ${beats[0]}`);
      }
    } else if (c.healthBefore != null && c.healthBefore >= 50) {
      healthy++;
      if (fired) { healthyFired++; borrow++; }
    }
  }
  totLow += low; totLowFired += lowFired; totHealthy += healthy; totHealthyFired += healthyFired; totBorrow += borrow;
  console.log(`seed ${seed} days=${d.daysAlive} packCallsAway=${calls.length} low=${low} lowFired=${lowFired} healthy=${healthy} healthyFired=${healthyFired} borrow=${borrow}`);
  for (const e of seedEx) excerpts.push(`s${seed} ${e}`);
  // death-day beats: packCall on a starvation death day for the same vid
  for (const death of (d.deathRows || [])) {
    if (!/starv/.test(String(death.cause))) continue;
    const dc = calls.find(c => String(c.vid) === String(death.who) && c.day === death.day);
    if (dc) {
      const beats = (dc.beatLines || []).filter(t => /away from the haven/.test(t));
      console.log(`  starvation death d${death.day} ${death.whoName} hpAtMeal=${dc.healthBefore} beat=${beats.length ? beats[0] : '(none)'}`);
    }
  }
}
console.log(`TOTAL awayPackCalls=${totCalls} low=${totLow} lowFired=${totLowFired} rate=${totLow ? (totLowFired / totLow).toFixed(3) : 'n/a'} healthy=${totHealthy} healthyFired=${totHealthyFired} borrow=${totBorrow}`);
console.log('EXCERPTS:');
for (const e of excerpts) console.log('  ' + e);
const ok = totLow > 0 && (totLowFired / totLow) >= 0.80 && totHealthyFired === 0 && totBorrow === 0;
console.log('REPROOF ' + (ok ? 'PASS' : 'FAIL') + ` (low>0=${totLow > 0}, rate>=0.80, healthyFired=0, borrow=0)`);
if (!ok) process.exitCode = 1;
