#!/usr/bin/env node
// scripts/sweep-cisterncheck-b.js — pilot/confirm sweep driver for sim-cisterncheck-b.
// Paired before/after on one commit: ARM=control sets CISTERNCHECK_OFF=1 (old
// always-haul shape bit-for-bit); ARM=armed leaves the fix on.
// Per-seed JSONs -> OUTDIR (explicit files; safe-commit.sh rejects dirs).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 ARM=control OUTDIR=evidence/2026-10-21/perseed-cisterncheck-b \
//     SEEDS=66061,66062,66063,66064 node scripts/sweep-cisterncheck-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { runComparison } = require('./sweep-compare');

const arm = process.env.ARM || 'armed';
if (arm === 'control') process.env.CISTERNCHECK_OFF = '1';
const seeds = (process.env.SEEDS || '66061,66062,66063,66064').split(',').map(s => parseInt(s.trim(), 10));
const outdir = process.env.OUTDIR || 'evidence/2026-10-21/perseed-cisterncheck-b';
fs.mkdirSync(outdir, { recursive: true });

function deathCount(deaths, re) {
  let n = 0;
  for (const [k, v] of Object.entries(deaths || {})) if (re.test(k)) n += v;
  return n;
}

(async () => {
  const rep = await runComparison({
    label: 'cisterncheck-' + arm,
    seeds,
    policies: ['leadfeast', 'belongfeast'],
    days: 180,
    extraMetrics: (Game) => {
      const v = Game.state.village || {};
      let pantryKcal = 0;
      try { pantryKcal = (v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0); } catch (e) {}
      const w = v.water || {};
      return {
        overflowHauls: v.cisternOverflowHauls || 0,
        overflowL: Math.round(v.cisternOverflowL || 0),
        waterHauls: v.waterHauls || 0,
        redirects: v.cisternRedirects || 0,
        pantryKcalEnd: Math.round(pantryKcal),
        cisternEnd: Math.round((w.clean || 0) + (w.dirty || 0)),
      };
    },
  });
  for (const r of rep.runs) {
    const d = r.deaths || {};
    r.guard = {
      dehyDeaths: deathCount(d, /dehydrat|thirst/i),
      starveDeaths: deathCount(d, /starv|hunger/i),
    };
    const fn = path.join(outdir, `${arm}-${r.policy}-s${r.seed}.json`);
    fs.writeFileSync(fn, JSON.stringify(r, null, 1));
    console.log('wrote ' + fn);
  }
  fs.writeFileSync(path.join(outdir, `${arm}-aggregate.json`), JSON.stringify(rep.byPolicy, null, 1));
  console.log('aggregate written for ' + arm);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
