#!/usr/bin/env node
// analyze-bankfood-b.js — bankfood census analyzer (pure reads).
// Usage: node scripts/analyze-bankfood-b.js --control <dir> --variant <dir>
//   [--off <dir>]
// Reads bankfood-b-nighttravel-s<seed>.json corpora (one file per seed)
// and reports, per seed and in total:
//   - creek / still / rescued evening counts + still-day lists
//     (woodcarry.bucket === 'creek'; still = creek && !rescued)
//   - bank events (bankfoodEvening mode bank|flip with >= 1 action)
//     with the full stage chain: post-bank canonical pack
//     (evening row postDailyPack) -> first-upkeep pack (true morning)
//     -> daily-entry morning-phase packBefore + eat firing
//   - retention verdict per bank event: retained / vanished, and
//     whether the vanish coincides with scholar kcal 0 at first upkeep
//   - det-gate: OFF legs reproduce control legs exactly on per-seed
//     creek/still/rescued counts and still-day lists.
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
function census(inst) {
  const rows = inst.evenings || [];
  let creek = 0, still = 0, rescued = 0;
  const stillDays = [];
  // Stranded-away (addendum 2026-11-04): nighttravel failed to bring
  // the scholar home and the evening ends away — independent of the
  // woodcarry bucket, which is null on out-of-reach evenings.
  let strandedAway = 0;
  const strandedAwayDays = [];
  for (const r of rows) {
    const wc = r.woodcarry;
    if (wc && wc.bucket === 'creek') {
      creek++;
      if (wc.rescued) rescued++;
      else { still++; stillDays.push(r.loopDay); }
    }
    if ((r.eveningOutcome === 'travel-refused' || r.eveningOutcome === 'out-of-reach') && r.tile !== 'haven' && r.inside !== true) {
      strandedAway++; strandedAwayDays.push(r.loopDay);
    }
  }
  return { creek, still, rescued, stillDays, strandedAway, strandedAwayDays,
    survived: inst.daysAlive, endReason: inst.endReason,
    bfErrs: (inst.bankfoodStore && inst.bankfoodStore.errs) || 0,
    wcErrs: (inst.woodcarryStore && inst.woodcarryStore.errs) || 0,
    wwErrs: (inst.warmthStore && inst.warmthStore.errs) || 0 };
}
function bankEvents(inst) {
  const rows = inst.evenings || [];
  const store = inst.bankfoodStore || {};
  const events = [];
  for (const r of rows) {
    const ev = r.bankfoodEvening;
    if (!ev || (ev.mode !== 'bank' && ev.mode !== 'flip') || !(ev.actions || []).length) continue;
    const postBank = r.postDailyPack || ev.packAfter || null;
    const nextLoopDay = r.loopDay + 1;
    const morning = (store.mornings || []).find((m) => m.loopDay === nextLoopDay) || null;
    const gameDay = r.gameDay;
    const firstUp = (inst.firstUpkeeps || []).find((u) => u.scholarDay === gameDay + 1)
      || (inst.firstUpkeeps || []).find((u) => u.scholarDay > gameDay) || null;
    const banked = (postBank && ((postBank.edibleKcal || 0) > 0 || (postBank.lumpUnits || 0) > 0));
    const fuPack = firstUp ? firstUp.pack : null;
    const vanishedAtFirstUpkeep = banked && fuPack &&
      (fuPack.edibleKcal || 0) === 0 && (fuPack.lumpUnits || 0) === 0;
    const mPack = morning ? morning.packBefore : null;
    const vanishedAtMorning = banked && mPack &&
      (mPack.edibleKcal || 0) === 0 && (mPack.lumpUnits || 0) === 0;
    events.push({ seed: inst.seed, loopDay: r.loopDay, gameDay,
      mode: ev.mode, clockBefore: ev.clockBefore, clockAfter: ev.clockAfter,
      kcalBefore: ev.kcalBefore, kcalAfter: ev.kcalAfter,
      postBank: postBank ? { edibleKcal: postBank.edibleKcal, grossKcal: postBank.grossKcal, lumpUnits: postBank.lumpUnits } : null,
      firstUpkeep: firstUp ? { scholarDay: firstUp.scholarDay, kcal: firstUp.kcal, dayTicks: firstUp.dayTicks,
        pack: { edibleKcal: firstUp.pack.edibleKcal, grossKcal: firstUp.pack.grossKcal, lumpUnits: firstUp.pack.lumpUnits } } : null,
      morningPhase: morning ? { ate: morning.ate, skip: morning.skip, kcalBefore: morning.kcalBefore,
        packBefore: morning.packBefore ? { edibleKcal: morning.packBefore.edibleKcal, grossKcal: morning.packBefore.grossKcal, lumpUnits: morning.packBefore.lumpUnits } : null } : null,
      banked, vanishedAtFirstUpkeep, vanishedAtMorning,
      morningEatFired: !!(morning && morning.ate) });
  }
  return events;
}
function main() {
  const a = args();
  if (!a.control || !a.variant) { console.error('usage: --control <dir> --variant <dir> [--off <dir>]'); process.exit(2); }
  const ctl = loadDir(a.control), vrn = loadDir(a.variant), off = loadDir(a.off);
  const seeds = Object.keys(ctl).sort();
  const report = { seeds: {}, bankEvents: [], morningEats: 0, detGate: { match: true, mismatches: [] },
    totals: { control: { creek: 0, still: 0, rescued: 0 }, variant: { creek: 0, still: 0, rescued: 0 } } };
  for (const seed of seeds) {
    const c = census(ctl[seed]), v = census(vrn[seed] || { evenings: [] });
    report.seeds[seed] = { control: c, variant: v, off: off[seed] ? census(off[seed]) : null };
    report.totals.control.creek += c.creek; report.totals.control.still += c.still; report.totals.control.rescued += c.rescued;
    report.totals.variant.creek += v.creek; report.totals.variant.still += v.still; report.totals.variant.rescued += v.rescued;
    const evs = bankEvents(vrn[seed] || { evenings: [] });
    report.bankEvents.push(...evs);
    report.morningEats += evs.filter((e) => e.morningEatFired).length;
    if (off[seed]) {
      const o = census(off[seed]);
      const same = o.creek === c.creek && o.still === c.still && o.rescued === c.rescued &&
        JSON.stringify(o.stillDays) === JSON.stringify(c.stillDays);
      if (!same) { report.detGate.match = false; report.detGate.mismatches.push(seed); }
    }
  }
  const banked = report.bankEvents.filter((e) => e.banked);
  report.totals.bankEvents = report.bankEvents.length;
  report.totals.bankedEvents = banked.length;
  report.totals.vanishedAtFirstUpkeep = banked.filter((e) => e.vanishedAtFirstUpkeep).length;
  report.totals.vanishedAtMorning = banked.filter((e) => e.vanishedAtMorning).length;
  report.totals.retainedAtMorning = banked.filter((e) => !e.vanishedAtMorning).length;
  report.totals.vanishedWithScholarZero = banked.filter((e) => e.vanishedAtFirstUpkeep &&
    e.firstUpkeep && e.firstUpkeep.kcal === 0).length;
  console.log(JSON.stringify(report, null, 1));
}
main();
