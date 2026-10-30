#!/usr/bin/env node
// analyze-kcalshort-b.js — strand-evening failure-mode census for
// sim-kcalshort-b corpora (scripts/kcalshort-trace-b.js).
// Usage: node scripts/analyze-kcalshort-b.js <corpusDir> [outJson]
// Pure reads; no game code.
//
// Strand: maximal run of still-refused creek evenings on
// CONSECUTIVE loop-days (bucket creek, rescued false) — the
// woodday analyzer's definition, including length-1 runs.
// Failure-mode class from RAW refusal-time gates (canon costs:
// bridge needs 4 logs, 60 kcal, 96 ticks), never the bridge
// decision's first-failure skip (wood, kcal, ticks order hides
// "both"): kcal-only, wood-only, both, ticks-only, kcal+ticks,
// wood+ticks, all-three, neither/other. Any null gate number
// is UNCLASSIFIED (fails the prereg bar, never folded in).
// Evening numbers come from woodcarry.classification:
// logs = woodPlayer, kcal = kcalLive (fallback kcal, named),
// ticks = ticksToDayEnd. Pricing numbers (pantry, pack food)
// come from the recorder's post-evening row snapshots.
'use strict';
const fs = require('fs');
const path = require('path');

const WOOD_NEEDED = 4;
const KCAL_NEEDED = 60;
const TICKS_NEEDED = 96;

function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function classify(e) {
  const wc = e.woodcarry || {};
  const cls = wc.classification || null;
  if (!cls) return { unclassified: true, reason: 'no-classification' };
  const logs = (cls.woodPlayer === undefined ? null : cls.woodPlayer);
  const kcalLiveNull = (cls.kcalLive === undefined || cls.kcalLive === null);
  const kcal = kcalLiveNull ? (cls.kcal === undefined ? null : cls.kcal) : cls.kcalLive;
  const ticks = (cls.ticksToDayEnd === undefined ? null : cls.ticksToDayEnd);
  if (logs === null || kcal === null || ticks === null) {
    return { unclassified: true, reason: 'null-gate', logs, kcal, ticks };
  }
  const woodShort = logs < WOOD_NEEDED;
  const kcalShort = kcal < KCAL_NEEDED;
  const ticksShort = ticks < TICKS_NEEDED;
  let mode;
  if (woodShort && kcalShort && ticksShort) mode = 'all-three';
  else if (woodShort && kcalShort) mode = 'both';
  else if (woodShort && ticksShort) mode = 'wood+ticks';
  else if (kcalShort && ticksShort) mode = 'kcal+ticks';
  else if (woodShort) mode = 'wood-only';
  else if (kcalShort) mode = 'kcal-only';
  else if (ticksShort) mode = 'ticks-only';
  else mode = 'neither/other';
  return {
    unclassified: false, mode, logs, kcal, ticks,
    kcalFallbackUsed: kcalLiveNull,
    woodShort, kcalShort, ticksShort,
    kcalGap: kcalShort ? (KCAL_NEEDED - kcal) : 0,
    woodDeficit: woodShort ? (WOOD_NEEDED - logs) : 0,
    ticksGap: ticksShort ? (TICKS_NEEDED - ticks) : 0,
    bridgeSkip: (wc.bridge && wc.bridge.skip) || null,
    bridgeAttempted: !!(wc.bridge && wc.bridge.attempted),
    bridgeBuilt: (wc.bridge && wc.bridge.built) || null,
    narration: wc.narration || null,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = {};
  const strands = [];
  const table = [];
  const unclassified = [];
  const kcalFallback = [];
  const ppNull = [];
  let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
  let warmActed = 0, warmLogSpent = 0, warmFireFailed = 0;
  let recorderErrs = 0, pantryPackErrs = 0;
  const wall = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = inst.seed;
    seeds++;
    const evs = inst.evenings || [];
    evenings += evs.length;
    recorderErrs += ((inst.woodcarryStore && inst.woodcarryStore.errs) || 0)
      + ((inst.warmthStore && inst.warmthStore.errs) || 0);
    pantryPackErrs += (inst.pantryPackErrs || 0);
    const mornByDay = {};
    for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
    wall.push({ seed: s, daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked, deaths: (inst.deaths || []).length });
    perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0,
      warmActed: 0, warmLogSpent: 0, strands: [], daysAlive: inst.daysAlive, endReason: inst.endReason };
    for (const e of evs) {
      const wc = e.woodcarry || {};
      const ww = e.warmth || null;
      if (ww && ww.acted) {
        warmActed++; perSeed[s].warmActed++;
        if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
        else if (!ww.fireLit) warmFireFailed++;
      }
      if (wc.bucket !== 'creek') continue;
      creekEvenings++; perSeed[s].creek++;
      if (wc.rescued) { rescued++; perSeed[s].rescued++; }
      else { stillRefused++; perSeed[s].still++; }
    }
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length,
        eveningWoods: run.map((e) => {
          const cls = (e.woodcarry || {}).classification || {};
          return (cls.woodPlayer === undefined ? null : cls.woodPlayer);
        }) };
      strands.push(rec);
      perSeed[s].strands.push(rec);
      for (const e of run) {
        const c = classify(e);
        const m = mornByDay[e.loopDay] || null;
        const row = { seed: s, loopDay: e.loopDay,
          morningKcal: m ? m.kcal : null, morningWood: m ? m.morningWood : null,
          postEveningKcal: (e.kcal === undefined ? null : e.kcal),
          eveningPantryKcal: (e.eveningPantryKcal === undefined ? null : e.eveningPantryKcal),
          eveningPackFoodKcal: (e.eveningPackFoodKcal === undefined ? null : e.eveningPackFoodKcal),
          warmthActed: !!(e.warmth && e.warmth.acted),
          warmthFireLit: (e.warmth && e.warmth.fireLit) || null,
          warmthLogSpent: (e.warmth && e.warmth.logSpent) || null,
          ...c };
        table.push(row);
        if (c.unclassified) unclassified.push({ seed: s, loopDay: e.loopDay, reason: c.reason, logs: c.logs, kcal: c.kcal, ticks: c.ticks });
        if (!c.unclassified && c.kcalFallbackUsed) kcalFallback.push({ seed: s, loopDay: e.loopDay });
        if (row.eveningPantryKcal === null || row.eveningPackFoodKcal === null) {
          ppNull.push({ seed: s, loopDay: e.loopDay, pantry: row.eveningPantryKcal, pack: row.eveningPackFoodKcal });
        }
      }
      run = [];
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
  }
  const byClass = {};
  for (const r of table) {
    if (r.unclassified) continue;
    byClass[r.mode] = (byClass[r.mode] || 0) + 1;
  }
  const kcalShortRows = table.filter((r) => !r.unclassified && r.kcalShort);
  const woodShortRows = table.filter((r) => !r.unclassified && r.woodShort);
  const ticksShortRows = table.filter((r) => !r.unclassified && r.ticksShort);
  const summary = {
    dir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
    warmActed, warmLogSpent, warmFireFailed, recorderErrs, pantryPackErrs,
    strandCount: strands.length, strandEvenings: table.length,
    unclassifiedCount: unclassified.length,
    kcalShortCount: kcalShortRows.length, woodShortCount: woodShortRows.length,
    ticksShortCount: ticksShortRows.length,
    bothCount: byClass.both || 0,
    kcalShortShare: table.length ? kcalShortRows.length / table.length : null,
    woodShortShare: table.length ? woodShortRows.length / table.length : null,
    medianKcalGap: median(kcalShortRows.map((r) => r.kcalGap)),
    medianWoodDeficit: median(woodShortRows.map((r) => r.woodDeficit)),
    medianTicksGap: median(ticksShortRows.map((r) => r.ticksGap)),
    medianPantryKcal: median(table.filter((r) => r.eveningPantryKcal !== null).map((r) => r.eveningPantryKcal)),
    medianPackFoodKcal: median(table.filter((r) => r.eveningPackFoodKcal !== null).map((r) => r.eveningPackFoodKcal)),
    byClass, perSeed, strands, table, unclassified, kcalFallback, ppNull, wall,
  };
  return summary;
}

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: analyze-kcalshort-b.js <corpusDir> [outJson]'); process.exit(2); }
  const outJson = process.argv[3] || null;
  const c = analyzeDir(dir);
  console.log('seeds: ' + c.seeds + ' files: ' + c.files + ' evenings: ' + c.evenings);
  console.log('creek evenings: ' + c.creekEvenings + ' still-refused: ' + c.stillRefused + ' rescued: ' + c.rescued);
  console.log('warmth acted: ' + c.warmActed + ' log-spent: ' + c.warmLogSpent + ' fire-failed: ' + c.warmFireFailed);
  console.log('recorder errs: ' + c.recorderErrs + ' pantryPackErrs: ' + c.pantryPackErrs);
  console.log('strands: ' + c.strandCount + ' strand evenings: ' + c.strandEvenings + ' unclassified: ' + c.unclassifiedCount);
  console.log('by class: ' + JSON.stringify(c.byClass));
  console.log('kcal-short: ' + c.kcalShortCount + ' share ' + c.kcalShortShare
    + ' median gap ' + c.medianKcalGap + ' | wood-short: ' + c.woodShortCount + ' share ' + c.woodShortShare
    + ' median deficit ' + c.medianWoodDeficit + ' | ticks-short: ' + c.ticksShortCount);
  console.log('median pantry kcal: ' + c.medianPantryKcal + ' median pack-food kcal: ' + c.medianPackFoodKcal);
  for (const st of c.strands) console.log('  STRAND seed ' + st.seed + ' nights ' + st.nights.join(','));
  for (const r of c.table) {
    if (r.unclassified) console.log('  UNCLASSIFIED seed ' + r.seed + ' day ' + r.loopDay + ' reason ' + r.reason);
    else console.log('  EVENING seed ' + r.seed + ' day ' + r.loopDay + ' class ' + r.mode
      + ' logs ' + r.logs + ' kcal ' + r.kcal + ' (gap ' + r.kcalGap + ') ticks ' + r.ticks
      + ' pantry ' + r.eveningPantryKcal + ' packFood ' + r.eveningPackFoodKcal
      + ' postKcal ' + r.postEveningKcal + ' skip ' + (r.bridgeSkip || 'attempted/built'));
  }
  for (const u of c.unclassified) console.log('  UNCLASSIFIED DETAIL ' + JSON.stringify(u));
  for (const f of c.kcalFallback) console.log('  KCAL-FALLBACK ' + JSON.stringify(f));
  for (const p of c.ppNull) console.log('  PANTRY-PACK-NULL ' + JSON.stringify(p));
  console.log('per-seed: ' + JSON.stringify(c.perSeed));
  console.log('wall: ' + JSON.stringify(c.wall));
  if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(c, null, 2)); console.log('wrote ' + outJson); }
}

if (require.main === module) main();
module.exports = { classify, median, analyzeDir, WOOD_NEEDED, KCAL_NEEDED, TICKS_NEEDED };
