#!/usr/bin/env node
// analyze-wakeforage-b.js — census + stranded-morning sweep +
// replay-yield join for sim-wakeforage-b corpora
// (scripts/wakeforage-trace-b.js recorder legs +
// scripts/wakeforage-replay-b.js replay legs). Pure reads;
// no game code.
// Usage: node scripts/analyze-wakeforage-b.js <corpusDir> <leg>
//   [replayDir] [outJson]
// Stranded morning = morning snap of a loop-day whose evening
// row is bucket creek + rescued false. Field morning = wake
// tile type != 'haven'. Verdicts per prereg (DAY_NEED 2200;
// SELF 60; BRIDGE morningKcal-60+E>=60; Y* walkKcal+200-
// morningKcal from the replay snap's nearest-cut steps).
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2], leg = process.argv[3];
const replayDir = process.argv[4] || null;
const outJson = process.argv[5] || null;
if (!dir || !leg) { console.error('usage: analyze-wakeforage-b.js <corpusDir> <leg> [replayDir] [outJson]'); process.exit(2); }

function eveningWood(e) {
  const c = ((e.woodcarry || {}).classification || {});
  return (c.woodPlayer === undefined ? null : c.woodPlayer);
}
function eveningKcal(e) {
  const wc = e.woodcarry || {};
  if (wc.kcal !== undefined && wc.kcal !== null) return wc.kcal;
  const c = wc.classification || {};
  if (c.kcal !== undefined && c.kcal !== null) return c.kcal;
  if (e.preStepKcal !== undefined && e.preStepKcal !== null) return e.preStepKcal;
  return null;
}
function eveningTicksLeft(e) {
  const wc = e.woodcarry || {};
  if (wc.ticksToDayEnd !== undefined && wc.ticksToDayEnd !== null) return wc.ticksToDayEnd;
  const c = wc.classification || {};
  if (c.ticksToDayEnd !== undefined && c.ticksToDayEnd !== null) return c.ticksToDayEnd;
  return null;
}
function forageYields(lines) {
  const out = [];
  for (const l of (lines || [])) {
    if (!/patch|forag|harvest|gather/i.test(l)) continue;
    const m = l.match(/\((\d+)\s*kcal\)/);
    if (m) out.push(parseInt(m[1], 10));
  }
  return out;
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const perSeed = {};
const strands = [];
const mornings = [];
const allForageYields = [];
let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
let warmActed = 0, warmLogSpent = 0, recorderErrors = 0;

for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = inst.seed;
  seeds++;
  const evs = inst.evenings || [];
  evenings += evs.length;
  const mornByDay = {};
  for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
  perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, warmActed: 0, warmLogSpent: 0, strands: [], strandedMornings: 0, daysAlive: inst.daysAlive, endReason: inst.endReason };
  for (const e of evs) {
    const wc = e.woodcarry || {};
    const ww = e.warmth || null;
    if (ww && ww.acted) {
      warmActed++; perSeed[s].warmActed++;
      if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
    }
    if (wc.bucket !== 'creek') continue;
    creekEvenings++; perSeed[s].creek++;
    if (wc.rescued) { rescued++; perSeed[s].rescued++; }
    else { stillRefused++; perSeed[s].still++; }
  }
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length, eveningWoods: run.map((e) => eveningWood(e)) };
    strands.push(rec); perSeed[s].strands.push(rec); run = [];
  };
  const sorted = [...evs].sort((a, b) => a.loopDay - b.loopDay);
  for (const e of sorted) {
    const wc = e.woodcarry || {};
    if (wc.bucket === 'creek' && !wc.rescued) {
      if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
      run.push(e);
    } else flush();
  }
  flush();
  const strandDays = new Set();
  for (const st of perSeed[s].strands) for (const d of st.nights) strandDays.add(d);
  for (const e of sorted) {
    const wc = e.woodcarry || {};
    if (!(wc.bucket === 'creek' && !wc.rescued)) continue;
    const m = mornByDay[e.loopDay] || null;
    const sw = (m && m.sweepAnalysis) || (e.morningSweep) || null;
    if (!sw || sw.error) recorderErrors++;
    const cells = (sw && sw.cells) || [];
    const fy = forageYields(e.fullDaySay || []);
    for (const y of fy) allForageYields.push({ seed: s, loopDay: e.loopDay, yield: y });
    const rec = {
      seed: s, leg, loopDay: e.loopDay, inStrand: strandDays.has(e.loopDay),
      wakeTile: m ? (m.mapPx + ',' + m.mapPy) : null, wakeTileType: m ? m.tile : null,
      wake: sw ? sw.wake : (m ? [m.mx, m.my] : null), wakeCell: sw ? sw.wakeCell : null,
      insideTent: m ? m.insideTent : null, insideHaven: m ? m.inside : null,
      morningKcal: m ? m.kcal : null, morningWood: (m && m.morningWood !== undefined) ? m.morningWood : (e.morningWood !== undefined ? e.morningWood : null),
      ticksLeftMorning: sw ? sw.ticksLeft : null,
      sweepCells: cells, forageableCells: sw ? sw.forageableCells : null,
      tileCanForage: sw ? sw.tileCanForage : null,
      eveningKcal: eveningKcal(e), eveningTicksLeft: eveningTicksLeft(e), eveningWood: eveningWood(e),
      recorderError: (sw && sw.error) || (!sw ? 'no-sweepAnalysis' : null),
      grid: sw ? sw.grid : null,
      forageYieldsDay: fy, fullDaySay: e.fullDaySay || null,
    };
    mornings.push(rec);
    perSeed[s].strandedMornings++;
  }
}

// Replay join
const pressByKey = {}, controlByKey = {};
if (replayDir && fs.existsSync(replayDir)) {
  for (const f of fs.readdirSync(replayDir).filter((x) => x.endsWith('.json')).sort()) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(replayDir, f), 'utf8'));
      if (r.leg !== leg) continue;
      const key = r.seed + '|' + r.targetDay;
      if (r.mode === 'press') pressByKey[key] = r;
      else if (r.mode === 'control') controlByKey[key] = r;
      else if (r.mode === 'press-aborted') pressByKey[key] = r;
    } catch (e) { /* skip unreadable replay file loudly below via missing join */ }
  }
}
for (const m of mornings) {
  const key = m.seed + '|' + m.loopDay;
  const press = pressByKey[key] || null, control = controlByKey[key] || null;
  m.replayControl = control ? { judgedDiffs: control.judgedDiffs } : null;
  if (press) {
    const t = press.totals || {};
    const E = (t.knownEdibleKcal === undefined ? null : t.knownEdibleKcal);
    const walkSteps = (press.snap && press.snap.walk && press.snap.walk.steps !== undefined) ? press.snap.walk.steps : null;
    const walkKcalPer = (press.snap && press.snap.walk && press.snap.walk.walkStepKcal !== undefined) ? press.snap.walk.walkStepKcal : null;
    const walkKcal = (walkSteps === null || walkKcalPer === null) ? null : walkSteps * walkKcalPer;
    const yStar = (walkKcal === null || m.morningKcal === null) ? null : (walkKcal + 80 + 60 + 60 - m.morningKcal);
    let outcome = null;
    if (press.mode === 'press-aborted') outcome = 'ABORTED';
    else if (E === null) outcome = 'NO-TOTALS';
    else if (E > 0) outcome = 'KNOWN-EDIBLE';
    else if ((t.unknownUnits || 0) > 0) outcome = 'UNKNOWN-ONLY';
    else outcome = 'NOTHING';
    m.yield = { mode: press.mode, E, unknownUnits: t.unknownUnits || 0, unknownForms: t.unknownForms || [],
      knownInedibleHiddenKcal: t.knownInedibleHiddenKcal || 0, deadfall: t.deadfall || null,
      pressSay: press.pressSay || [], kcalBefore: press.kcalBefore, kcalAfter: press.kcalAfter,
      walkSteps, walkKcalPer, walkKcal, yStar,
      dayNeed: (E === null ? null : E >= 2200),
      selfFunding: (E === null ? null : E >= 60),
      bridgeCovering: (E === null || m.morningKcal === null ? null : (m.morningKcal - 60 + E >= 60)),
      yStarCover: (E === null || yStar === null ? null : E >= yStar),
      judgedDiffs: press.judgedDiffs || null,
      addedItems: press.addedItems || [] };
  } else m.yield = null;
}

const fieldMornings = mornings.filter((m) => m.wakeTileType !== 'haven');
const fieldWithYield = fieldMornings.filter((m) => m.yield && m.yield.mode === 'press');
const totals = {
  strandedMornings: mornings.length, fieldMornings: fieldMornings.length,
  fieldWithYield: fieldWithYield.length,
  dayNeed: fieldWithYield.filter((m) => m.yield.dayNeed === true).length,
  selfFunding: fieldWithYield.filter((m) => m.yield.selfFunding === true).length,
  bridgeCovering: fieldWithYield.filter((m) => m.yield.bridgeCovering === true).length,
  yStarCover: fieldWithYield.filter((m) => m.yield.yStarCover === true).length,
  outcomeKnownEdible: fieldWithYield.filter((m) => m.yield && m.yield.mode === 'press' && m.yield.E > 0).length,
  outcomeUnknownOnly: fieldWithYield.filter((m) => m.yield && m.yield.mode === 'press' && m.yield.E === 0 && (m.yield.unknownUnits || 0) > 0).length,
  outcomeNothing: fieldWithYield.filter((m) => m.yield && m.yield.mode === 'press' && m.yield.E === 0 && (m.yield.unknownUnits || 0) === 0).length,
  outcomeAborted: fieldMornings.filter((m) => m.yield && m.yield.mode === 'press-aborted').length,
  controlMismatch: fieldMornings.filter((m) => m.replayControl && m.replayControl.judgedDiffs && m.replayControl.judgedDiffs.length).length,
  pressMismatch: fieldMornings.filter((m) => m.yield && m.yield.judgedDiffs && m.yield.judgedDiffs.length).length,
};
const ys = allForageYields.map((y) => y.yield).sort((a, b) => a - b);
const census = { dir, leg, replayDir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
  warmActed, warmLogSpent, perSeed, strands, mornings, recorderErrors, totals,
  forageYields: { n: ys.length, min: ys.length ? ys[0] : null, median: ys.length ? ys[Math.floor(ys.length / 2)] : null, max: ys.length ? ys[ys.length - 1] : null, all: allForageYields } };

console.log('leg ' + leg + ' seeds: ' + seeds + ' files: ' + files.length + ' evenings: ' + evenings);
console.log('creek evenings: ' + creekEvenings + ' still-refused: ' + stillRefused + ' rescued: ' + rescued);
console.log('warmth acted: ' + warmActed + ' log-spent: ' + warmLogSpent);
console.log('strands: ' + strands.length);
for (const st of strands) console.log('  STRAND seed ' + st.seed + ' nights ' + st.nights.join(',') + ' eveningWoods ' + st.eveningWoods.join(','));
console.log('stranded mornings: ' + mornings.length + ' field: ' + fieldMornings.length + ' withYield: ' + totals.fieldWithYield + ' recorderErrors: ' + recorderErrors);
console.log('verdicts on field-with-yield: dayNeed2200 ' + totals.dayNeed + ' selfFunding60 ' + totals.selfFunding + ' bridgeCovering ' + totals.bridgeCovering + ' yStarCover ' + totals.yStarCover);
console.log('outcomes: knownEdible ' + totals.outcomeKnownEdible + ' unknownOnly ' + totals.outcomeUnknownOnly + ' nothing ' + totals.outcomeNothing + ' aborted ' + totals.outcomeAborted);
for (const m of fieldMornings) {
  const y = m.yield;
  console.log('  MORNING seed ' + m.seed + ' day ' + m.loopDay + ' tile ' + m.wakeTile + ' (' + m.wakeTileType + ') wake ' + JSON.stringify(m.wake) +
    ' kcal ' + m.morningKcal + ' wood ' + m.morningWood + ' sweepForageable ' + m.forageableCells +
    (y ? ' E ' + y.E + ' unkUnits ' + y.unknownUnits + ' outcome ' + (y.E > 0 ? 'KNOWN-EDIBLE' : (y.unknownUnits > 0 ? 'UNKNOWN-ONLY' : 'NOTHING')) +
      ' dayNeed ' + y.dayNeed + ' self ' + y.selfFunding + ' bridge ' + y.bridgeCovering + ' yStar ' + y.yStar + ' yStarCover ' + y.yStarCover +
      ' walkSteps ' + y.walkSteps + ' say ' + JSON.stringify((y.pressSay || []).slice(0, 1)) : ' NO-YIELD') +
    (m.replayControl && m.replayControl.judgedDiffs && m.replayControl.judgedDiffs.length ? ' CONTROL-MISMATCH ' + JSON.stringify(m.replayControl.judgedDiffs) : '') +
    (y && y.judgedDiffs && y.judgedDiffs.length ? ' PRESS-MISMATCH ' + JSON.stringify(y.judgedDiffs) : '') +
    (m.recorderError ? ' RECORDER-ERR ' + m.recorderError : ''));
  for (const c of (m.sweepCells || [])) console.log('    SWEEP ' + c.x + ',' + c.y + ' ' + c.cell + ' species ' + c.species + ' assigned ' + c.assigned + ' known ' + c.known + ' regrow ' + c.regrow + ' scorched ' + c.scorched + ' forageable ' + c.forageable);
}
console.log('per-seed: ' + JSON.stringify(perSeed));
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(census, null, 2)); console.log('wrote ' + outJson); }
