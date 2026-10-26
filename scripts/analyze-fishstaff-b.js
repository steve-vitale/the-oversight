#!/usr/bin/env node
// analyze-fishstaff-b.js — aggregates sim-fishstaff-b per-seed JSONs into
// the classification table for evidence/2026-10-26/sim-fishstaff-b.md.
// Usage: node scripts/analyze-fishstaff-b.js <corpus-dir> [glob-substring]
// Prints one line per seed + the band-consistency verdict inputs. No game
// code, no writes.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const sub = process.argv[3] || 'fishstaff-b-';
const files = fs.readdirSync(dir).filter(f => f.startsWith(sub) && f.endsWith('.json') && !f.includes('neutral')).sort();
for (const f of files) {
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
  catch (e) { console.log(`${f} UNPARSEABLE (${e.message}) — skipped`); continue; }
  const a = j.fishAgg;
  const starv = j.deathCauses && j.deathCauses.starvation ? j.deathCauses.starvation : 0;
  console.log(`${f} seed=${j.seed} pd=${j.plentydepri} days=${j.daysAlive} end=${j.endReason} deaths=${j.deaths} starv=${starv} calls=${a.fishCalls} ok=${a.fishOk} refused=${a.fishRefused} null=${a.fishNull} snapFishDays=${a.snapFishDays} holders=${JSON.stringify(a.holdersByClass)} staleDays=${JSON.stringify(a.staleDays)} gapDays=${JSON.stringify(a.gapDays)} resolved=${a.resolveFishResolved} kept=${a.resolveFishKept} deal=${a.dealCalls}/${a.dealOk} appeal=${a.appealCalls}/${a.appealOk} win=${j.win} wave=${j.waveReach} national=${j.national}`);
  console.log(`   refusedByVid=${JSON.stringify(a.refusedByVid)} okByVid=${JSON.stringify(a.okByVid)} refusedTrust<10=${a.refusedTrustBelow10} >=10=${a.refusedTrustAt10Plus}`);
}
