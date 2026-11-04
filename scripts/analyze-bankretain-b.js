#!/usr/bin/env node
// analyze-bankretain-b.js — known-edible bank retention analyzer (pure reads).
// Usage: node scripts/analyze-bankretain-b.js --variant <dir> [--off <dir>]
// Reads bankfood-b-nighttravel-s<seed>.json corpora (one file per seed)
// and extracts KNOWN-EDIBLE BANK events per the sim-bankretain-a prereg:
//   - evening mode bank|flip with >= 1 forage action, where
//     bankedEdibleDelta = postDailyPack.edibleKcal - packBefore.edibleKcal > 0
//   - a FOLLOWING MORNING IN-STACK (next loop-day row + firstUpkeep for
//     scholarDay = gameDay + 1) makes the event JUDGED; otherwise CENSORED.
// Judged events are classified RETAINED / VANISHED / PARTIAL-UNEXPLAINED
// from the first-upkeep (true post-sleep morning) pack vs the post-bank
// pack, with per-stack spoil naming: a shortfall on a stack whose
// spoilDay <= the new scholarDay is a named dawn spoil sweep, not a vanish.
// Also reports the daily-entry morning-phase record (packBefore, ate,
// scholar kcal chain) for every judged event, and the off-vs-variant
// survival/endReason neutrality check when --off is given.
// Output: one JSON report on stdout. Never writes into the repo.
'use strict';
const fs = require('fs');
const path = require('path');

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
function stackKey(s) { return [s.name, s.kcalEach, s.edible, s.foodState].join('|'); }
function edibleStacks(pack) {
  if (!pack || !Array.isArray(pack.stacks)) return [];
  return pack.stacks.filter((s) => s && (s.kcalEach || 0) > 0 && s.edible !== false);
}
// Classify one judged event's first-upkeep pack vs its post-bank pack.
// Returns { verdict, shortfalls: [{key,name,kcalEach,spoilDay,postBankUnits,firstUpkeepUnits,lostKcal,namedSpoil}] }
function classifyRetention(postBank, firstUp) {
  const pb = {};
  for (const s of edibleStacks(postBank)) {
    const k = stackKey(s);
    pb[k] = pb[k] || { name: s.name, kcalEach: s.kcalEach, spoilDay: s.spoilDay, units: 0 };
    pb[k].units += s.units || 0;
  }
  const fu = {};
  for (const s of edibleStacks(firstUp.pack)) {
    const k = stackKey(s);
    fu[k] = (fu[k] || 0) + (s.units || 0);
  }
  const shortfalls = [];
  for (const k of Object.keys(pb)) {
    const lost = pb[k].units - (fu[k] || 0);
    if (lost > 0) {
      shortfalls.push({ key: k, name: pb[k].name, kcalEach: pb[k].kcalEach,
        spoilDay: pb[k].spoilDay, postBankUnits: pb[k].units,
        firstUpkeepUnits: fu[k] || 0, lostKcal: lost * (pb[k].kcalEach || 0),
        namedSpoil: pb[k].spoilDay !== null && pb[k].spoilDay !== undefined &&
          pb[k].spoilDay <= firstUp.scholarDay });
    }
  }
  const fuEdible = (firstUp.pack && firstUp.pack.edibleKcal) || 0;
  const pbEdible = (postBank && postBank.edibleKcal) || 0;
  let verdict;
  if (shortfalls.length === 0) verdict = 'RETAINED';
  else if (fuEdible === 0 && pbEdible > 0) verdict = 'VANISHED';
  else if (shortfalls.every((s) => s.namedSpoil)) verdict = 'RETAINED-SPOIL-SWEPT';
  else verdict = 'PARTIAL-UNEXPLAINED';
  return { verdict, shortfalls, fuEdible, pbEdible };
}
function edibleBankEvents(inst) {
  const rows = inst.evenings || [];
  const store = inst.bankfoodStore || {};
  const events = [];
  for (const r of rows) {
    const ev = r.bankfoodEvening;
    if (!ev || (ev.mode !== 'bank' && ev.mode !== 'flip') || !(ev.actions || []).length) continue;
    const forageActs = ev.actions.filter((a) => a.kind === 'forage');
    if (!forageActs.length) continue;
    const eknownSum = forageActs.reduce((t, a) => t + (a.Eknown || 0), 0);
    const unknownSum = forageActs.reduce((t, a) => t + (a.unknownUnits || 0), 0);
    const postBank = r.postDailyPack || ev.packAfter || null;
    const beforeEdible = ev.packBefore ? (ev.packBefore.edibleKcal || 0) : null;
    const delta = postBank && beforeEdible !== null ? (postBank.edibleKcal || 0) - beforeEdible : null;
    if (!(delta !== null && delta > 0)) continue; // not a known-edible bank
    const nextLoopDay = r.loopDay + 1;
    const nextRow = rows.find((x) => x.loopDay === nextLoopDay) || null;
    const firstUp = (inst.firstUpkeeps || []).find((u) => u.scholarDay === (r.gameDay + 1)) || null;
    const morning = (store.mornings || []).find((m) => m.loopDay === nextLoopDay) || null;
    const judged = !!(nextRow && firstUp);
    const rec = { seed: inst.seed, loopDay: r.loopDay, gameDay: r.gameDay,
      mode: ev.mode, clockBefore: ev.clockBefore, clockAfter: ev.clockAfter,
      eknownSum, unknownSum, packBeforeEdible: beforeEdible,
      postBank: postBank ? { edibleKcal: postBank.edibleKcal, grossKcal: postBank.grossKcal,
        lumpUnits: postBank.lumpUnits, stacks: postBank.stacks } : null,
      bankedEdibleDelta: delta, judged, censoredReason: judged ? null :
        (!nextRow ? 'no-next-loop-day' : 'no-first-upkeep-for-next-day'),
      scholarKcalEvening: ev.kcalAfter };
    if (judged) {
      rec.firstUpkeep = { scholarDay: firstUp.scholarDay, kcal: firstUp.kcal,
        dayTicks: firstUp.dayTicks,
        pack: { edibleKcal: firstUp.pack.edibleKcal, grossKcal: firstUp.pack.grossKcal,
          lumpUnits: firstUp.pack.lumpUnits, stacks: firstUp.pack.stacks } };
      rec.classification = classifyRetention(postBank, firstUp);
      rec.verdict = rec.classification.verdict;
      rec.morningPhase = morning ? { ate: morning.ate, eatErr: morning.eatErr || null,
        skip: morning.skip || null, kcalBefore: morning.kcalBefore,
        kcalAfterEat: morning.kcalAfterEat,
        packBefore: morning.packBefore ? { edibleKcal: morning.packBefore.edibleKcal,
          grossKcal: morning.packBefore.grossKcal, lumpUnits: morning.packBefore.lumpUnits } : null,
        packAfter: morning.packAfter ? { edibleKcal: morning.packAfter.edibleKcal,
          grossKcal: morning.packAfter.grossKcal, lumpUnits: morning.packAfter.lumpUnits } : null,
        wakeTile: morning.wakeTile || null } : null;
    }
    events.push(rec);
  }
  return events;
}
function main() {
  const a = args();
  if (!a.variant) { console.error('usage: --variant <dir> [--off <dir>]'); process.exit(2); }
  const vrn = loadDir(a.variant), off = loadDir(a.off);
  const report = { seeds: {}, judgedEvents: [], censoredEvents: [],
    neutrality: { match: true, mismatches: [] }, totals: {} };
  for (const seed of Object.keys(vrn).sort()) {
    const inst = vrn[seed];
    const evs = edibleBankEvents(inst);
    const judged = evs.filter((e) => e.judged), cens = evs.filter((e) => !e.judged);
    report.seeds[seed] = { daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked || null,
      bfErrs: (inst.bankfoodStore && inst.bankfoodStore.errs) || 0,
      judged: judged.length, censored: cens.length,
      offDaysAlive: off[seed] ? off[seed].daysAlive : null,
      offEndReason: off[seed] ? off[seed].endReason : null };
    report.judgedEvents.push(...judged);
    report.censoredEvents.push(...cens);
    if (off[seed] && (off[seed].daysAlive !== inst.daysAlive || off[seed].endReason !== inst.endReason)) {
      report.neutrality.match = false;
      report.neutrality.mismatches.push(seed);
    }
  }
  const j = report.judgedEvents;
  report.totals = { judged: j.length, censored: report.censoredEvents.length,
    retained: j.filter((e) => e.verdict === 'RETAINED' || e.verdict === 'RETAINED-SPOIL-SWEPT').length,
    retainedClean: j.filter((e) => e.verdict === 'RETAINED').length,
    retainedSpoilSwept: j.filter((e) => e.verdict === 'RETAINED-SPOIL-SWEPT').length,
    vanished: j.filter((e) => e.verdict === 'VANISHED').length,
    partialUnexplained: j.filter((e) => e.verdict === 'PARTIAL-UNEXPLAINED').length,
    morningEatFired: j.filter((e) => e.morningPhase && e.morningPhase.ate).length };
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { edibleBankEvents, classifyRetention };
