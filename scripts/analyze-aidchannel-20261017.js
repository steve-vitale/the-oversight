#!/usr/bin/env node
// scripts/analyze-aidchannel-20261017.js — SIM-AIDCHANNEL-B analysis.
// (flesh-out loop B, ARM 2, 2026-10-17, food-economy axis).
//
// Fills the filed blank from sim-aidfeastint-b: the aid verb is
// road-dependent — 0 aids on 16 belong runs despite 796+ trigger-days;
// belongseek never forms haven-primary thin-subordinate links; aid is a
// relationship verb. REUSES the 16 sim-wallcensus-b per-seed JSONs — no
// second sweep (base courtship policies only, no aid driver layers).
//
// Reads the per-seed JSONs and prints the pre-registered verdict:
//   1. aid verb fires by road (Game.tendLink invocations — the LEAD road's
//      weekly 1500-kcal tend on active primary-haven links)
//   2. haven-primary thin-subordinate link formation by road
//   3. trigger-day exposure (fresh-days > 4, the aiddrain trigger) split by
//      link presence — where links are absent, was the trigger open?
//
// PRE-REGISTERED (binding, §14):
//   PRIMARY = 100% aid-fire attribution across the 16 runs (every tend fire
//     attributed to the correct road; 0 instrument errors).
//   REPLICATION GATE: belong roads ≈ 0 aids with no links formed
//     (replicates the filed finding on fresh seeds 4201-4208);
//     lead roads fire where links exist.
//   VERDICT named: "structurally road-dead on belong" (trigger open on many
//     belong days but links never form — the channel cannot exist) vs
//     "trigger-starved" (links form on belong but the trigger is rarely
//     open — the channel exists but never gets a day).
//
// Usage:
//   node scripts/analyze-aidchannel-20261017.js [evidence/2026-10-17/perseed-wallcensus-b]
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-wallcensus-b');

// The road comes from the RECORD's own policyId — never from the filename,
// never from array position (schema-drift LOUD class). Throws LOUD on a
// record with no road rather than misattributing silently.
function attributeRoad(rec) {
  if (!rec || (rec.policyId !== 'leadcourt' && rec.policyId !== 'belongseek')) {
    throw new Error('attributeRoad: record has no valid policyId — refusing to misattribute');
  }
  return rec.policyId;
}

function loadRecords(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    r._file = f;
    return r;
  });
}

function main() {
  const recs = loadRecords(DIR);
  if (recs.length !== 16) console.log(`NOTE: expected 16 records, found ${recs.length}`);
  const byRoad = { leadcourt: [], belongseek: [] };
  for (const r of recs) byRoad[attributeRoad(r)].push(r);

  const sum = (rs, f) => rs.reduce((a, r) => a + (f(r) || 0), 0);
  console.log('== aidchannel-b analysis ==');
  for (const road of ['leadcourt', 'belongseek']) {
    const rs = byRoad[road];
    const n = rs.length;
    const tend = sum(rs, r => r.aid.tendFires);
    const tkcal = sum(rs, r => r.aid.tendKcal);
    const runsWithTend = rs.filter(r => r.aid.tendFires > 0).length;
    const formed = sum(rs, r => r.links.havenPrimaryFormed);
    // links.havenPrimaryActiveDays counts DAILY SAMPLES, not link-days
    // (instrument labels preserved from the sweep; see evidence note).
    // Link-days upper bound = sum over formed links of (gameDays - formedDay).
    const linkDaysUB = rs.reduce((a, r) => a + r.links.formed.reduce((x, f) => x + Math.max(0, (r.gameDays || 0) - (f.day || 0)), 0), 0);
    const samples = sum(rs, r => r.links.havenPrimaryActiveDays);
    const trig = sum(rs, r => r.trigger.freshDaysGt4Days);
    const trigNoLink = sum(rs, r => r.trigger.triggerDaysNoLink);
    const trigWithLink = sum(rs, r => r.trigger.triggerDaysWithLink);
    const instErr = sum(rs, r => r.instrumentErrors);
    console.log(`\n${road.toUpperCase()} (n=${n})`);
    console.log(`  aid fires: ${tend} tends, ${tkcal} kcal, ${runsWithTend}/${n} runs with >=1`);
    console.log(`  links: ${formed} primary-haven links formed, ~${linkDaysUB} link-days (upper bound: formed→run end; ${samples} census sample-days)`);
    console.log(`  links formed per run: ${rs.map(r => r.links.havenPrimaryFormed).join(',')}`);
    console.log(`  trigger (freshDays>4): ${trig} days — noLink ${trigNoLink}, withLink ${trigWithLink}`);
    console.log(`  instrument errors: ${instErr}`);
    for (const r of rs) {
      console.log(`    s${r.seed}: tend=${r.aid.tendFires} (${r.aid.tendKcal}kcal) links=${r.links.havenPrimaryFormed} activeD=${r.links.havenPrimaryActiveDays} trig=${r.trigger.freshDaysGt4Days}(noLink ${r.trigger.triggerDaysNoLink}) gameDays=${r.gameDays}`);
    }
  }
  // ---- pre-registered gates ----
  const L = byRoad.leadcourt, B = byRoad.belongseek;
  const bTend = sum(B, r => r.aid.tendFires), bFormed = sum(B, r => r.links.havenPrimaryFormed);
  const lTend = sum(L, r => r.aid.tendFires), lFormed = sum(L, r => r.links.havenPrimaryFormed);
  const bTrig = sum(B, r => r.trigger.freshDaysGt4Days), bTrigNoLink = sum(B, r => r.trigger.triggerDaysNoLink);
  const instErr = sum(recs, r => r.instrumentErrors);
  console.log('\n== pre-registered gates ==');
  console.log(`PRIMARY attribution: 16/16 records attributed, instrument errors ${instErr} (gate: 0) — ${instErr === 0 ? 'GO' : 'NO-GO'}`);
  const rep = bTend === 0 && bFormed === 0;
  console.log(`REPLICATION gate: belong tends=${bTend} (gate ≈0), belong links formed=${bFormed} (gate 0) — ${rep ? 'REPLICATES filed finding' : 'DOES NOT replicate'}`);
  console.log(`lead fires where links exist: tends=${lTend}, links formed=${lFormed} — ${lTend > 0 && lFormed > 0 ? 'YES' : 'NO'}`);
  let verdict;
  if (bTrigNoLink > 0 && bFormed === 0) {
    verdict = 'structurally road-dead on belong — the overstock trigger stood open on ' + bTrigNoLink +
      ' belong run-days with zero haven-primary links to receive it; the channel cannot exist there, the trigger is not the binding constraint.';
  } else if (bTrig < 20 && bFormed > 0) {
    verdict = 'trigger-starved — belong forms links but the overstock trigger rarely opens (only ' + bTrig + ' days).';
  } else {
    verdict = 'UNDECIDED — data do not separate the two: belong trigger days=' + bTrig + ' (noLink ' + bTrigNoLink + '), links formed=' + bFormed + '.';
  }
  console.log(`\nVERDICT: ${verdict}`);
}

module.exports = { attributeRoad };

if (require.main === module) main();
