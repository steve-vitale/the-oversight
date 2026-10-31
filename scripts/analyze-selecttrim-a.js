#!/usr/bin/env node
// analyze-selecttrim-a.js — pure-read analysis of the four
// sim-selecttrim-a legs (control/trim x guard/on, seed 15215).
// Reads ONLY the corpus JSONs; writes a census JSON + compare
// .md under evidence/2026-10-31/. No state edits, no RNG.
// Routine total on a refused evening = the selecttrim-layer
// probe spent (on trim days: beats + nightStep, and nightStep
// spends 0 on refused evenings, so it IS the beats total; on
// control legs the layer passes through, so it is the full
// daily total, likewise nightStep-free on refused evenings).
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');

function load(leg) {
  const dir = path.join(BASE, 'sim-selecttrim-a-corpus-' + leg);
  const file = path.join(dir, 'selecttrim-a-nighttravel-s15215.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function probeSpent(evening, layer) {
  const rec = (evening.tickProbe || []).find((p) => p.layer === layer);
  return rec ? rec.spent : null;
}

function summarize(leg, data) {
  const evenings = data.evenings;
  const creek = evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek');
  const still = creek.filter((e) => !e.woodcarry.rescued);
  const rescued = creek.filter((e) => e.woodcarry.rescued);
  // Ticks-short is judged at the BRIDGE DECISION, before the
  // warmth fire spends its 48 ticks: woodcarry's ticksToDayEnd.
  // (Evening dayTicks on ON legs includes warmth and would
  // misclassify evenings ticks-b priced as clear.)
  const ticksShort = still.filter((e) => e.woodcarry && e.woodcarry.classification && e.woodcarry.classification.ticksToDayEnd < 96);
  const presses = ((data.pressbStore || {}).attempts || []).filter((a) => a.fired);
  const trims = (data.selecttrimStore || {}).trims || [];
  const days = {};
  for (const e of evenings) {
    const m = (data.mornings || []).find((x) => x.loopDay === e.loopDay) || {};
    days[e.loopDay] = {
      loopDay: e.loopDay,
      morningCell: (m.mx === undefined || m.mx === null) ? null : (m.mx + ',' + m.my),
      morningTile: m.tile || null,
      morningDayTicks: (e.morningDayTicks === undefined ? null : e.morningDayTicks),
      morningKcal: (m.kcal === undefined ? null : m.kcal),
      eveningCell: (e.mx === undefined || e.mx === null) ? null : (e.mx + ',' + e.my),
      eveningDayTicks: e.eveningDayTicks,
      ticksLeft: 512 - (e.eveningDayTicks || 0),
      decisionTicksLeft: (e.woodcarry && e.woodcarry.classification) ? e.woodcarry.classification.ticksToDayEnd : null,
      eveningKcal: e.kcal,
      routineTotal: probeSpent(e, 'selecttrim'),
      trim: e.selecttrimTrim || null,
      trimSkip: e.selecttrimSkip || null,
      press: e.pressbAttempt || null,
      pressSkip: e.pressbSkip || null,
      wc: e.woodcarry ? { bucket: e.woodcarry.bucket, rescued: e.woodcarry.rescued,
        wood: (e.woodcarry.classification ? e.woodcarry.classification.woodPlayer : null),
        kcal: (e.woodcarry.classification ? e.woodcarry.classification.kcal : null),
        dayTicks: (e.woodcarry.classification ? e.woodcarry.classification.dayTicks : null),
        ticksToDayEnd: (e.woodcarry.classification ? e.woodcarry.classification.ticksToDayEnd : null),
        bridge: e.woodcarry.bridge || null } : null,
      warmth: e.warmth || null,
      ntOutcome: e.eveningOutcome || null,
      fullDaySay: e.fullDaySay || null,
    };
  }
  return { leg, creek: creek.length, still: still.length, rescued: rescued.length,
    ticksShort: ticksShort.length, ticksShortDays: ticksShort.map((e) => e.loopDay),
    presses: presses.map((a) => ({ loopDay: a.loopDay, E: a.E, wake: a.wake })),
    pressCount: presses.length, trims: trims.map((t) => t.loopDay),
    trimCount: trims.length, daysAlive: data.daysAlive, endReason: data.endReason,
    maxWave: data.maxWaveUnlocked, errs: { wc: data.woodcarryStore.errs, ww: data.warmthStore.errs,
      pb: data.pressbStore.errs, st: data.selecttrimStore.errs },
    days };
}

const legs = ['guard-control', 'guard-trim', 'on-control', 'on-trim'];
const out = {};
for (const leg of legs) out[leg] = summarize(leg, load(leg));

// Paired walk + verdict tables per leg pair.
function pair(baseLeg, trimLeg) {
  const b = out[baseLeg], t = out[trimLeg];
  const walkRows = [];
  for (const td of t.trims) {
    const next = td + 1;
    const bDay = b.days[next], tDay = t.days[next];
    walkRows.push({ trimDay: td, nextMorning: next,
      controlWake: bDay ? bDay.morningCell : null, trimWake: tDay ? tDay.morningCell : null,
      match: !!(bDay && tDay && bDay.morningCell === tDay.morningCell),
      controlStillStranded: !!(bDay && bDay.wc && bDay.wc.bucket === 'creek' && !bDay.wc.rescued) });
  }
  const ticksRows = [];
  for (const td of t.trims) {
    const bDay = b.days[td], tDay = t.days[td];
    ticksRows.push({ trimDay: td,
      controlRoutine: bDay ? bDay.routineTotal : null, trimRoutine: tDay ? tDay.routineTotal : null,
      saved: (bDay && tDay && bDay.routineTotal !== null && tDay.routineTotal !== null) ? (bDay.routineTotal - tDay.routineTotal) : null,
      controlTicksLeft: bDay ? bDay.decisionTicksLeft : null, trimTicksLeft: tDay ? tDay.decisionTicksLeft : null,
      controlEveningTicks: bDay ? bDay.eveningDayTicks : null, trimEveningTicks: tDay ? tDay.eveningDayTicks : null,
      controlEvening: bDay && bDay.wc ? (bDay.wc.rescued ? 'rescued' : 'still') : null,
      trimEvening: tDay && tDay.wc ? (tDay.wc.rescued ? 'rescued' : 'still') : null });
  }
  // Gate-shift: control rescued evenings that are still on trim (same loopDay).
  const gateShift = [];
  for (const d of Object.values(b.days)) {
    if (d.wc && d.wc.bucket === 'creek' && d.wc.rescued) {
      const td = t.days[d.loopDay];
      if (td && td.wc && td.wc.bucket === 'creek' && !td.wc.rescued) gateShift.push(d.loopDay);
    }
  }
  // Conversions: control still (any gate) -> trim rescued same loopDay.
  const conversions = [];
  for (const d of Object.values(b.days)) {
    if (d.wc && d.wc.bucket === 'creek' && !d.wc.rescued) {
      const td = t.days[d.loopDay];
      if (td && td.wc && td.wc.bucket === 'creek' && td.wc.rescued) conversions.push(d.loopDay);
    }
  }
  const day7Trim = !!t.days[7].trim;
  // Walk verdict counts ONLY rows where control is still
  // stranded next morning: when control already rescued, the
  // next-morning wake is a haven wake, and a still-stranded
  // trim leg cannot and should not match it (that divergence
  // is the gate-shift / rescue story, not a walk loss).
  const strandRows = walkRows.filter((r) => r.controlStillStranded);
  return { baseLeg, trimLeg, walkRows, ticksRows, gateShift, conversions, day7Trim,
    walkPreserved: strandRows.length > 0 && strandRows.every((r) => r.match),
    walkStrandRows: strandRows.length,
    pressesPreserved: t.pressCount > 0 && b.pressCount > 0 };
}

const pairs = { guard: pair('guard-control', 'guard-trim'), on: pair('on-control', 'on-trim') };
const census = { legs: out, pairs };
fs.writeFileSync(path.join(BASE, 'sim-selecttrim-a-census.json'), JSON.stringify(census, null, 1));

let md = '# sim-selecttrim-a compare (NOT an official panel run)\n\n';
for (const leg of legs) {
  const o = out[leg];
  md += '## ' + leg + '\n\n';
  md += '- creek ' + o.creek + ' / still ' + o.still + ' / rescued ' + o.rescued +
    ' / ticks-short ' + o.ticksShort + ' (days ' + o.ticksShortDays.join(',') + ')\n';
  md += '- presses ' + o.pressCount + ': ' + o.presses.map((p) => 'd' + p.loopDay + ' E' + p.E).join(', ') + '\n';
  md += '- trims ' + o.trimCount + ': days ' + o.trims.join(',') + '\n';
  md += '- daysAlive ' + o.daysAlive + ' end ' + o.endReason + ' maxWave ' + o.maxWave +
    ' errs wc/ww/pb/st ' + o.errs.wc + '/' + o.errs.ww + '/' + o.errs.pb + '/' + o.errs.st + '\n\n';
}
for (const [name, p] of Object.entries(pairs)) {
  md += '## paired: ' + name + ' (' + p.baseLeg + ' -> ' + p.trimLeg + ')\n\n';
  md += 'walk preserved (every still-stranded next-morning wake matches control): ' + p.walkPreserved + ' (' + p.walkStrandRows + ' strand rows)\n\n';
  md += '| trim day | control wake next morning | trim wake next morning | match | control still stranded |\n|---|---|---|---|---|\n';
  for (const r of p.walkRows) md += '| ' + r.trimDay + ' | ' + r.controlWake + ' | ' + r.trimWake + ' | ' + r.match + ' | ' + r.controlStillStranded + ' |\n';
  md += '\n| trim day | control routine | trim routine | saved | control ticksLeft | trim ticksLeft | control evening | trim evening |\n|---|---|---|---|---|---|---|---|\n';
  for (const r of p.ticksRows) md += '| ' + r.trimDay + ' | ' + r.controlRoutine + ' | ' + r.trimRoutine + ' | ' + r.saved + ' | ' + r.controlTicksLeft + ' | ' + r.trimTicksLeft + ' | ' + r.controlEvening + ' | ' + r.trimEvening + ' |\n';
  md += '\ngate-shift (control rescued -> trim still, same day): ' + (p.gateShift.length ? p.gateShift.join(',') : 'none') + '\n';
  md += 'conversions (control still -> trim rescued, same day): ' + (p.conversions.length ? p.conversions.join(',') : 'none') + '\n';
  md += 'day-7 trim fired (must be false): ' + p.day7Trim + '\n\n';
}
fs.writeFileSync(path.join(BASE, 'sim-selecttrim-a-compare.md'), md);
console.log(md);
