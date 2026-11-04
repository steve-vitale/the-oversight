#!/usr/bin/env node
// analyze-bankretain-rerun.js — redefined bank-retention analyzer.
// Usage: node scripts/analyze-bankretain-rerun.js --variant <dir> [--off <dir>]
// Reads bankfood-b-nighttravel-s<seed>.json corpora (one file per seed)
// and extracts REDEFINED judged events per the sim-bankretain-rerun-a
// prereg: an evening record with mode bank|flip AND post-bank edible
// food (postDailyPack.edibleKcal > 0), regardless of whether the food
// got there by bank/flip (banked) or was carried (carried/mixed).
// A FOLLOWING MORNING IN-STACK (next loop-day row + firstUpkeep for
// scholarDay = gameDay + 1) makes the event JUDGED; otherwise CENSORED.
// Primary verdict is at the first-upkeep (true post-sleep morning)
// pack vs the post-bank pack, with per-stack spoil naming. Morning
// disposition is secondary: morning-phase-eaten / upkeep-eaten
// (kcal chain exact) / still-in-pack / morning-unaccounted /
// no-morning-record. Upkeep-eaten counts as RETAINED at the true
// morning, NOT vanished (prereg mechanism decision).
// Also reports the revised neutrality guardrail per seed/leg-pair:
// trajectory equality through the last pre-action day + named
// divergence point, and the OFF-leg det-gate (errs 0, zero acted
// bank/flip evenings). Output: one JSON report on stdout.
// Never writes into the repo.
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
  // NOTE (substrate-a instrument correction, spec-conformant): the
  // spoil check MUST precede the vanish check. A FULL dawn sweep —
  // every edible stack's spoilDay arrived, so fuEdible is 0 — is a
  // fully-named spoil sweep under the prereg's definition ("every
  // shortfall is a named per-form dawn spoil sweep"), not a vanish.
  // The previous ordering (fuEdible==0 => VANISHED first) mislabeled
  // exactly that case; it was caught on screen event 17021/51
  // (Muscadine Grapes spoilDay 52, swept on scholarDay 52, the only
  // shortfall, named). VANISHED now means only: food gone with at
  // least one UNNAMED shortfall.
  else if (shortfalls.every((s) => s.namedSpoil)) verdict = 'RETAINED-SPOIL-SWEPT';
  else if (fuEdible === 0 && pbEdible > 0) verdict = 'VANISHED';
  else verdict = 'PARTIAL-UNEXPLAINED';
  return { verdict, shortfalls, fuEdible, pbEdible };
}
// Morning disposition: what happened between the first-upkeep snapshot
// and the daily-entry morning phase. kcalBefore is the scholar kcal at
// daily entry (AFTER upkeep eating); firstUp.kcal is at the first upkeep.
function morningDisposition(firstUp, morning) {
  if (!morning) return { disposition: 'no-morning-record' };
  const fuEdible = (firstUp.pack && firstUp.pack.edibleKcal) || 0;
  const mornEdible = (morning.packBefore && morning.packBefore.edibleKcal) || 0;
  const kcalGain = (morning.kcalBefore || 0) - (firstUp.kcal || 0);
  const lost = fuEdible - mornEdible;
  if (morning.ate) {
    return { disposition: 'morning-phase-eaten', fuEdible, mornEdible, kcalGain,
      morningKcalGain: (morning.kcalAfterEat || 0) - (morning.kcalBefore || 0) };
  }
  if (lost === 0) return { disposition: 'still-in-pack', fuEdible, mornEdible, kcalGain };
  if (lost > 0 && kcalGain === lost) {
    return { disposition: 'upkeep-eaten', fuEdible, mornEdible, kcalGain, lostKcal: lost };
  }
  if (lost > 0 && kcalGain > 0) {
    return { disposition: 'upkeep-eaten-unexact', fuEdible, mornEdible, kcalGain, lostKcal: lost };
  }
  return { disposition: 'morning-unaccounted', fuEdible, mornEdible, kcalGain, lostKcal: lost };
}
function sourceOf(beforeEdible, delta) {
  if (delta > 0 && beforeEdible === 0) return 'banked';
  if (delta === 0 && beforeEdible > 0) return 'carried';
  if (delta > 0 && beforeEdible > 0) return 'mixed';
  if (delta < 0 && beforeEdible > 0) return 'carried-with-loss';
  return 'other';
}
function retainedEvents(inst) {
  const rows = inst.evenings || [];
  const store = inst.bankfoodStore || {};
  const events = [];
  for (const r of rows) {
    const ev = r.bankfoodEvening;
    if (!ev || (ev.mode !== 'bank' && ev.mode !== 'flip')) continue;
    const postBank = r.postDailyPack || ev.packAfter || null;
    const postEdible = postBank ? (postBank.edibleKcal || 0) : 0;
    if (!(postEdible > 0)) continue; // lump-only / no-gain excluded
    const beforeEdible = ev.packBefore ? (ev.packBefore.edibleKcal || 0) : null;
    const delta = postBank && beforeEdible !== null ? postEdible - beforeEdible : null;
    const forageActs = (ev.actions || []).filter((a) => a.kind === 'forage');
    const eknownSum = forageActs.reduce((t, a) => t + (a.Eknown || 0), 0);
    const unknownSum = forageActs.reduce((t, a) => t + (a.unknownUnits || 0), 0);
    const nextLoopDay = r.loopDay + 1;
    const nextRow = rows.find((x) => x.loopDay === nextLoopDay) || null;
    const firstUp = (inst.firstUpkeeps || []).find((u) => u.scholarDay === (r.gameDay + 1)) || null;
    const morning = (store.mornings || []).find((m) => m.loopDay === nextLoopDay) ||
      (nextRow && nextRow.bankfoodMorning) || null;
    const judged = !!(nextRow && firstUp);
    const rec = { seed: inst.seed, loopDay: r.loopDay, gameDay: r.gameDay,
      mode: ev.mode, actionCount: (ev.actions || []).length,
      forageCount: forageActs.length,
      eknownSum, unknownSum, packBeforeEdible: beforeEdible,
      postBankEdible: postEdible,
      bankedEdibleDelta: delta, source: sourceOf(beforeEdible, delta),
      postBank: postBank ? { edibleKcal: postBank.edibleKcal, grossKcal: postBank.grossKcal,
        lumpUnits: postBank.lumpUnits, stacks: postBank.stacks } : null,
      judged, censoredReason: judged ? null :
        (!nextRow ? 'no-next-loop-day' : 'no-first-upkeep-for-next-day'),
      scholarKcalEvening: ev.kcalAfter };
    if (judged) {
      rec.firstUpkeep = { scholarDay: firstUp.scholarDay, kcal: firstUp.kcal,
        dayTicks: firstUp.dayTicks,
        pack: { edibleKcal: firstUp.pack.edibleKcal, grossKcal: firstUp.pack.grossKcal,
          lumpUnits: firstUp.pack.lumpUnits, stacks: firstUp.pack.stacks } };
      rec.classification = classifyRetention(postBank, firstUp);
      rec.verdict = rec.classification.verdict;
      rec.retainedAtTrueMorning = rec.verdict === 'RETAINED' || rec.verdict === 'RETAINED-SPOIL-SWEPT';
      rec.morningPhase = morning ? { ate: morning.ate, eatErr: morning.eatErr || null,
        skip: morning.skip || null, kcalBefore: morning.kcalBefore,
        kcalAfterEat: morning.kcalAfterEat,
        packBefore: morning.packBefore ? { edibleKcal: morning.packBefore.edibleKcal,
          grossKcal: morning.packBefore.grossKcal, lumpUnits: morning.packBefore.lumpUnits } : null,
        packAfter: morning.packAfter ? { edibleKcal: morning.packAfter.edibleKcal,
          grossKcal: morning.packAfter.grossKcal, lumpUnits: morning.packAfter.lumpUnits } : null,
        wakeTile: morning.wakeTile || null } : null;
      rec.morningDisposition = morningDisposition(firstUp, morning);
    }
    events.push(rec);
  }
  return events;
}
// Revised neutrality guardrail (prereg): trajectory equality through
// the last pre-action day + named divergence point. Returns the first
// acted variant evening loop-day, whether all earlier evening rows
// agree on (kcal, tile, mx, my, gameDay), and the kcal delta at the
// divergence evening.
function neutralityCheck(offInst, varInst) {
  const vrows = varInst.evenings || [];
  const orows = offInst.evenings || [];
  const firstActed = vrows.find((r) => r.bankfoodEvening &&
    (r.bankfoodEvening.mode === 'bank' || r.bankfoodEvening.mode === 'flip') &&
    (r.bankfoodEvening.actions || []).length > 0) || null;
  const divDay = firstActed ? firstActed.loopDay : null;
  const mismatches = [];
  for (const vr of vrows) {
    if (divDay !== null && vr.loopDay >= divDay) break;
    const or = orows.find((x) => x.loopDay === vr.loopDay);
    if (!or) { mismatches.push({ loopDay: vr.loopDay, field: 'missing-off-row' }); continue; }
    for (const f of ['kcal', 'tile', 'mx', 'my', 'gameDay']) {
      if (vr[f] !== or[f]) mismatches.push({ loopDay: vr.loopDay, field: f, off: or[f], variant: vr[f] });
    }
  }
  let divKcalDelta = null;
  if (firstActed) {
    const or = orows.find((x) => x.loopDay === divDay);
    if (or) divKcalDelta = (firstActed.kcal || 0) - (or.kcal || 0);
  }
  return { firstActedLoopDay: divDay, preActionMatch: mismatches.length === 0,
    preActionMismatches: mismatches, divergenceKcalDelta: divKcalDelta };
}
// OFF-leg det-gate: wrapper delegates untouched when OFF — errs 0 and
// zero acted bank/flip evenings.
function offDetGate(offInst) {
  const errs = (offInst.bankfoodStore && offInst.bankfoodStore.errs) || 0;
  const acted = (offInst.evenings || []).filter((r) => r.bankfoodEvening &&
    (r.bankfoodEvening.mode === 'bank' || r.bankfoodEvening.mode === 'flip') &&
    (r.bankfoodEvening.actions || []).length > 0).length;
  return { errs, actedEvenings: acted, pass: errs === 0 && acted === 0 };
}
function main() {
  const a = args();
  if (!a.variant) { console.error('usage: --variant <dir> [--off <dir>]'); process.exit(2); }
  const vrn = loadDir(a.variant), off = loadDir(a.off);
  const report = { seeds: {}, judgedEvents: [], censoredEvents: [],
    neutrality: {}, detGate: {}, totals: {} };
  for (const seed of Object.keys(vrn).sort()) {
    const inst = vrn[seed];
    const evs = retainedEvents(inst);
    const judged = evs.filter((e) => e.judged), cens = evs.filter((e) => !e.judged);
    report.seeds[seed] = { daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked || null,
      bfErrs: (inst.bankfoodStore && inst.bankfoodStore.errs) || 0,
      judged: judged.length, censored: cens.length,
      bySourceJudged: { banked: judged.filter((e) => e.source === 'banked').length,
        carried: judged.filter((e) => e.source === 'carried').length,
        mixed: judged.filter((e) => e.source === 'mixed').length,
        other: judged.filter((e) => !['banked', 'carried', 'mixed'].includes(e.source)).length },
      offDaysAlive: off[seed] ? off[seed].daysAlive : null,
      offEndReason: off[seed] ? off[seed].endReason : null };
    report.judgedEvents.push(...judged);
    report.censoredEvents.push(...cens);
    if (off[seed]) {
      report.neutrality[seed] = neutralityCheck(off[seed], inst);
      report.detGate[seed] = offDetGate(off[seed]);
    }
  }
  const j = report.judgedEvents;
  const retained = j.filter((e) => e.retainedAtTrueMorning);
  report.totals = { judged: j.length, censored: report.censoredEvents.length,
    retainedAtTrueMorning: retained.length,
    retainedClean: j.filter((e) => e.verdict === 'RETAINED').length,
    retainedSpoilSwept: j.filter((e) => e.verdict === 'RETAINED-SPOIL-SWEPT').length,
    vanished: j.filter((e) => e.verdict === 'VANISHED').length,
    partialUnexplained: j.filter((e) => e.verdict === 'PARTIAL-UNEXPLAINED').length,
    morningPhaseEaten: j.filter((e) => e.morningDisposition && e.morningDisposition.disposition === 'morning-phase-eaten').length,
    upkeepEaten: j.filter((e) => e.morningDisposition && e.morningDisposition.disposition === 'upkeep-eaten').length,
    stillInPack: j.filter((e) => e.morningDisposition && e.morningDisposition.disposition === 'still-in-pack').length,
    morningUnaccounted: j.filter((e) => e.morningDisposition && e.morningDisposition.disposition === 'morning-unaccounted').length };
  const surv = Object.values(report.seeds).map((s) => s.daysAlive).sort((x, y) => x - y);
  report.wall = { medianSurvival: surv.length ? surv[Math.floor(surv.length / 2)] : null,
    waveReach: (() => { const w = {}; for (const s of Object.values(report.seeds)) { const k = String(s.maxWaveUnlocked); w[k] = (w[k] || 0) + 1; } return w; })() };
  console.log(JSON.stringify(report, null, 1));
}
if (require.main === module) main();
module.exports = { retainedEvents, classifyRetention, morningDisposition, neutralityCheck, offDetGate, sourceOf };
