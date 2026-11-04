#!/usr/bin/env node
// union-bankretain-substrate-a.js — distinct-event union across the
// guard-variant and ON-variant legs of the sim-bankretain-substrate-a
// census. The rerun analyzer judges one leg at a time; this script
// answers the prereg's distinct-event question: leg-instances are
// replication, NOT sample size. Distinct key = seed + loopDay.
// Consensus rule (pre-registered): a distinct judged event is
// RETAINED iff every judged leg-instance of it is retained at the
// true morning (RETAINED or RETAINED-SPOIL-SWEPT); any judged
// instance vanished / partial-unexplained makes the event NOT
// retained, and differing instance verdicts flag the event
// DISAGREED (it fails unanimity, it is never averaged away).
// A leg on which the same seed+loopDay is censored contributes no
// judged instance and does not veto the event.
// Usage: node scripts/union-bankretain-substrate-a.js
//   --guard-variant <dir> [--on-variant <dir>]
// Output: one JSON report on stdout. Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { retainedEvents } = require('./analyze-bankretain-rerun');

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) a[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
  return a;
}
function loadDir(dir) {
  const out = {};
  if (!dir) return out;
  for (const f of fs.readdirSync(dir).filter((x) => /^bankfood-b-nighttravel-s\d+\.json$/.test(x)).sort()) {
    const seed = f.match(/s(\d+)\.json$/)[1];
    out[seed] = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  }
  return out;
}
// legInstances: [{leg, inst}] where inst is a driver corpus object.
// Returns {distinctJudged, distinctCensored, perSeed, totals}.
function unionLegs(legInstances) {
  const byKey = {};
  const perSeed = {};
  for (const { leg, inst } of legInstances) {
    const seed = String(inst.seed);
    if (!perSeed[seed]) perSeed[seed] = { judgedKeys: [], censoredKeys: [], eventKeys: [] };
    const evs = retainedEvents(inst);
    for (const e of evs) {
      const key = seed + '/' + e.loopDay;
      if (!byKey[key]) {
        byKey[key] = { key, seed, loopDay: e.loopDay, gameDay: e.gameDay,
          mode: e.mode, source: e.source, postBankEdible: e.postBankEdible,
          bankedEdibleDelta: e.bankedEdibleDelta, instances: [] };
        perSeed[seed].eventKeys.push(key);
      }
      byKey[key].instances.push({ leg, judged: e.judged,
        verdict: e.judged ? e.verdict : null,
        retainedAtTrueMorning: e.judged ? e.retainedAtTrueMorning : null,
        censoredReason: e.judged ? null : e.censoredReason,
        morningDisposition: e.judged && e.morningDisposition ? e.morningDisposition.disposition : null });
    }
  }
  const distinctJudged = [], distinctCensored = [];
  for (const key of Object.keys(byKey).sort()) {
    const rec = byKey[key];
    const judgedInsts = rec.instances.filter((i) => i.judged);
    if (judgedInsts.length > 0) {
      const verdicts = [...new Set(judgedInsts.map((i) => i.verdict))];
      rec.judgedInstances = judgedInsts.length;
      rec.instanceVerdicts = verdicts;
      rec.disagreed = verdicts.length > 1;
      rec.retained = judgedInsts.every((i) => i.retainedAtTrueMorning === true);
      rec.verdict = rec.disagreed ? 'DISAGREED' :
        (rec.retained ? (verdicts[0] || 'RETAINED') : verdicts.find((v) => v !== 'RETAINED' && v !== 'RETAINED-SPOIL-SWEPT') || verdicts[0]);
      distinctJudged.push(rec);
      perSeed[rec.seed].judgedKeys.push(key);
    } else {
      rec.judgedInstances = 0;
      rec.censoredReasons = [...new Set(rec.instances.map((i) => i.censoredReason))];
      distinctCensored.push(rec);
      perSeed[rec.seed].censoredKeys.push(key);
    }
  }
  const totals = { distinctJudged: distinctJudged.length,
    distinctCensored: distinctCensored.length,
    distinctRetained: distinctJudged.filter((e) => e.retained).length,
    distinctDisagreed: distinctJudged.filter((e) => e.disagreed).length,
    distinctVanished: distinctJudged.filter((e) => !e.retained).length,
    screenedSeedsWithJudged: Object.keys(perSeed).filter((s) => perSeed[s].judgedKeys.length > 0).length,
    screenedSeedsTotal: Object.keys(perSeed).length };
  return { distinctJudged, distinctCensored, perSeed, totals };
}
function main() {
  const a = args();
  if (!a['guard-variant'] && !a['on-variant']) {
    console.error('usage: --guard-variant <dir> [--on-variant <dir>]'); process.exit(2);
  }
  const legs = [];
  for (const [leg, dir] of [['guard-variant', a['guard-variant']], ['on-variant', a['on-variant']]]) {
    const loaded = loadDir(dir);
    for (const seed of Object.keys(loaded).sort()) legs.push({ leg, inst: loaded[seed] });
  }
  const report = unionLegs(legs);
  report.legs = legs.map((l) => l.leg + ':' + l.inst.seed).sort();
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { unionLegs, loadDir };
