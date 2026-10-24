#!/usr/bin/env node
// test-sim-singletier-b.js — proof test for arm sim-singletier-b (flesh-out
// loop, axis scale-onramp, parent run fleshout-20261024T1215Z).
// READ-ONLY (stdout only, exit non-zero on failure): asserts on the
// committed slim corpora in evidence/2026-10-24/perseed-singletier-b/.
// E1: corpus complete — 8 runner-lead (pilot) + 16 signal (lead+belong)
//   slim files, seeds exactly 70311-70318, anchor 141126b07eb5.
// E2: zero instrument errors (instrumentErrors + fhErrors) on all files.
// E3: runner pilot GO legs — arrivals 5/8 (FAIL, as judged), median
//   >= 117.5, multiTier 0, death-mode within 15pp of baseline-lead.
// E4: signal pilot + confirm GO legs — arrivals 7/8 pilot, median
//   >= 117.5 (pilot + full), multiTier 0, death-mode within 15pp.
// E5: no double-ask artifact anywhere (multiTierCrises 0 on all files)
//   and runner policy file absent (killed cleanly) OR present only if
//   this test runs pre-kill (see note: the kill deletes the file, so E5
//   asserts absence — run this test AFTER the kill).
// Usage: node scripts/test-sim-singletier-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const STDIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-singletier-b');
const FHDIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-foreignhelp');
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail != null ? ' — ' + detail : ''));
  if (!cond) failures++;
}
const load = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const slimFiles = fs.readdirSync(STDIR).filter(x => /^s703\d+-(lead|belong)-(runner|signal)\.json$/.test(x)).sort();
const runnerLead = slimFiles.filter(x => x.endsWith('-lead-runner.json')).map(f => load(path.join(STDIR, f)));
const signalLead = slimFiles.filter(x => x.endsWith('-lead-signal.json')).map(f => load(path.join(STDIR, f)));
const signalBelong = slimFiles.filter(x => x.endsWith('-belong-signal.json')).map(f => load(path.join(STDIR, f)));
const signalAll = [...signalLead, ...signalBelong];

// E1: completeness + seed band + anchor.
check('E1a runner pilot files = 8', runnerLead.length === 8, `got ${runnerLead.length}`);
check('E1b signal files = 16', signalAll.length === 16, `got ${signalAll.length}`);
check('E1c total slim files = 24', slimFiles.length === 24, `got ${slimFiles.length}`);
const seeds = new Set(slimFiles.map(f => parseInt(f.slice(1, 6), 10)));
check('E1d seed band exactly 70311-70318', seeds.size === 8 && [...seeds].every(s => s >= 70311 && s <= 70318), [...seeds].sort().join(','));
const anchors = new Set([...runnerLead, ...signalAll].map(d => d.anchor));
check('E1e single anchor 141126b07eb5', anchors.size === 1 && anchors.has('141126b07eb5'), [...anchors].join(','));
check('E1f all files slim:true', [...runnerLead, ...signalAll].every(d => d.slim === true));

// E2: zero instrument errors.
const errs = [...runnerLead, ...signalAll].reduce((a, d) => a + (d.instrumentErrors || 0) + (d.fhErrors || 0), 0);
check('E2 zero instrument/fh errors', errs === 0, `got ${errs}`);

// Baseline-lead death shares (recomputed from the full corpus).
function baseShares() {
  const files = fs.readdirSync(FHDIR).filter(x => /^s703\d+-lead-baseline\.json$/.test(x));
  let deaths = 0, starv = 0, combat = 0;
  for (const f of files) {
    const d = load(path.join(FHDIR, f));
    for (const x of (d.deaths || [])) { deaths++; if (x.cause === 'starvation') starv++; if (x.cause === 'combat') combat++; }
  }
  return { deaths, starv: starv / deaths, combat: combat / deaths };
}
const baseLead = baseShares();
function shares(rows) {
  let deaths = 0, starv = 0, combat = 0;
  for (const d of rows) for (const [k, v] of Object.entries(d.deaths.byCause)) {
    deaths += v; if (k === 'starvation') starv += v; if (k === 'combat') combat += v;
  }
  return { deaths, starv: starv / deaths, combat: combat / deaths };
}
function arrivedSeeds(rows) { return new Set(rows.filter(d => (d.arrivals.byResult.arrived || 0) > 0).map(d => d.seed)).size; }
function multiTier(rows) { return rows.reduce((a, d) => a + (d.tiers ? d.tiers.multiTierCrises : 0), 0); }

// E3: runner pilot legs.
const rShares = shares(runnerLead);
check('E3a runner arrivals 5/8 (NO-GO leg, as judged)', arrivedSeeds(runnerLead) === 5, `got ${arrivedSeeds(runnerLead)}`);
check('E3b runner median >= 117.5', med(runnerLead.map(d => d.gameDays)) >= 117.5, `median ${med(runnerLead.map(d => d.gameDays))}`);
check('E3c runner multiTier 0', multiTier(runnerLead) === 0);
check('E3d runner death-mode within 15pp', Math.abs((rShares.starv - baseLead.starv) * 100) <= 15 && Math.abs((rShares.combat - baseLead.combat) * 100) <= 15,
  `dStarv ${((rShares.starv - baseLead.starv) * 100).toFixed(1)}pp dCombat ${((rShares.combat - baseLead.combat) * 100).toFixed(1)}pp`);

// E4: signal pilot + confirm legs.
const sLeadShares = shares(signalLead);
check('E4a signal pilot arrivals 7/8', arrivedSeeds(signalLead) === 7, `got ${arrivedSeeds(signalLead)}`);
check('E4b signal pilot median >= 117.5', med(signalLead.map(d => d.gameDays)) >= 117.5, `median ${med(signalLead.map(d => d.gameDays))}`);
check('E4c signal multiTier 0 (all 16)', multiTier(signalAll) === 0);
check('E4d signal pilot death-mode within 15pp', Math.abs((sLeadShares.starv - baseLead.starv) * 100) <= 15 && Math.abs((sLeadShares.combat - baseLead.combat) * 100) <= 15,
  `dStarv ${((sLeadShares.starv - baseLead.starv) * 100).toFixed(1)}pp dCombat ${((sLeadShares.combat - baseLead.combat) * 100).toFixed(1)}pp`);
check('E4e signal confirm median >= 117.5', med(signalAll.map(d => d.gameDays)) >= 117.5, `median ${med(signalAll.map(d => d.gameDays))}`);
check('E4f signal confirm arrived seeds 7/8', arrivedSeeds(signalAll) === 7, `got ${arrivedSeeds(signalAll)}`);

// E5: kill cleanliness.
check('E5a multiTier 0 on every file', [...runnerLead, ...signalAll].every(d => (d.tiers ? d.tiers.multiTierCrises : 0) === 0));
check('E5b runner policy file deleted (killed cleanly)', !fs.existsSync(path.join(REPO, 'scripts', 'policies', 'sim-singletier-b-runner.js')));
check('E5c signal policy file present (GO tier kept)', fs.existsSync(path.join(REPO, 'scripts', 'policies', 'sim-singletier-b-signal.js')));

console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
