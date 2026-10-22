#!/usr/bin/env node
// analyze-starveprobe-depositgate-b2.js — #798 decision-rule evaluation.
//
// Reads probe-starvation-b2-{leadfeast,belongfeast}.json and applies the
// pre-registered decision rule from evidence/2026-10-22/sim-depositgate-b2.md:
//   CONFIRM iff (i) >=60% of armed starvation deaths are transition deaths
//     (pantry NOT plentiful at death AND >=10 prior eased days) AND
//     (ii) victims' lifetime eased-kcal < 50% of the run's per-capita eased mean.
//   REJECT iff <40% transition-clustered OR victims' eased >= per-capita mean.
//   Else INCONCLUSIVE.
'use strict';
const fs = require('fs');
const files = process.argv.slice(2);
if (!files.length) { console.error('usage: ... <probe json>...'); process.exit(2); }

let deaths = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of d.rows) {
    for (const sd of (r.starveDeaths || [])) {
      deaths.push({ seed: r.seed, policy: d.meta.policy, ...sd,
        perCapita: r.perCapitaEased, easedDays: r.easedDays, easedTotal: r.easedTotal });
    }
  }
}
console.log(`starvation deaths (armed): ${deaths.length}`);
for (const x of deaths) {
  console.log(`  ${x.policy} seed=${x.seed} day=${x.day} who=${x.who} ` +
    `plentifulAtDeath=${x.pantryPlentifulAtDeath} pantryKcal=${x.pantryKcalAtDeath} ` +
    `priorEasedDays=${x.priorEasedDays} transition=${x.transitionDeath} ` +
    `victimEased=${x.victimEasedKcal} vsPerCapita=${x.victimEasedVsPerCapita}`);
}
if (!deaths.length) { console.log('NO STARVATION DEATHS — mechanism cannot be confirmed; recorded as no-signal.'); process.exit(0); }
const trans = deaths.filter(x => x.transitionDeath).length;
const fracTrans = trans / deaths.length;
const ratios = deaths.map(x => x.victimEasedVsPerCapita).filter(v => v != null);
const meanRatio = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
console.log(`\ntransition deaths: ${trans}/${deaths.length} = ${(100*fracTrans).toFixed(0)}%`);
console.log(`victim eased vs per-capita ratios: [${ratios.map(v => v.toFixed(2)).join(', ')}] mean=${meanRatio == null ? 'n/a' : meanRatio.toFixed(2)}`);
let verdict;
if (fracTrans >= 0.6 && meanRatio != null && meanRatio < 0.5) verdict = 'CONFIRM';
else if (fracTrans < 0.4 || (meanRatio != null && meanRatio >= 1.0)) verdict = 'REJECT';
else verdict = 'INCONCLUSIVE';
console.log(`\n#798 VERDICT: ${verdict}`);
