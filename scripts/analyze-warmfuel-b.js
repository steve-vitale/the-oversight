#!/usr/bin/env node
// analyze-warmfuel-b.js — warmth-fuel ledger + protected-log
// counterfactual for sim-warmfuel-b corpora (scripts/kcalshort-trace-b.js).
// Usage: node scripts/analyze-warmfuel-b.js <corpusDir> [outJson]
// Pure reads; no game code.
//
// Classification logic copied from scripts/analyze-kcalshort-b.js
// (raw gates, never the bridge skip's first-failure reason).
// Strand: maximal run of still-refused creek evenings on
// CONSECUTIVE loop-days, including length-1 runs.
// Spend night: strand evening with warmth acted=true,
// fireLit=true, logSpent>=1. Counterfactual (accounting, not
// re-simulation): preservedBefore(e) = sum of logSpent on
// EARLIER strand evenings of the same strand; cfLogs(e) =
// logs(e) + preservedBefore(e); kcal/ticks held at observed
// values. Independently rescued: wood-only AND cfLogs>=4
// (full gate check run). Sequential shortening: observed
// still-count minus still evenings strictly before the
// earliest independently rescued evening (0 if none).
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
    narration: wc.narration || null,
  };
}

// Pure counterfactual over one strand's evening rows
// (rows: {loopDay, logs, kcal, ticks, mode, spend} where spend
// is logSpent on that evening, 0 when none). Exported for tests.
function counterfactual(rows) {
  let preserved = 0;
  let firstRescue = null;
  const table = rows.map((r) => {
    const preservedBefore = preserved;
    const cfLogs = r.logs + preservedBefore;
    const cfPasses = cfLogs >= WOOD_NEEDED && r.kcal >= KCAL_NEEDED && r.ticks >= TICKS_NEEDED;
    const rescued = r.mode === 'wood-only' && cfPasses;
    if (rescued && firstRescue === null) firstRescue = r.loopDay;
    preserved += (r.spend || 0);
    return { loopDay: r.loopDay, logs: r.logs, kcal: r.kcal, ticks: r.ticks,
      mode: r.mode, spend: r.spend || 0, preservedBefore, cfLogs, rescued };
  });
  const stillBefore = firstRescue === null ? rows.length
    : table.filter((t) => t.loopDay < firstRescue).length;
  return { table, totalLogs: preserved,
    spendNights: rows.filter((r) => (r.spend || 0) >= 1).length,
    rescuedNights: table.filter((t) => t.rescued).map((t) => t.loopDay),
    firstRescue, shortening: rows.length - stillBefore };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = {};
  const strands = [];
  const table = [];
  const unclassified = [];
  const kcalFallback = [];
  const ledgerMismatches = [];
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
    wall.push({ seed: s, daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked, deaths: (inst.deaths || []).length });
    perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0,
      warmActed: 0, warmLogSpent: 0, strands: [], daysAlive: inst.daysAlive, endReason: inst.endReason };
    // Warmth ledger totals over ALL evenings (not just strand).
    for (const e of evs) {
      const ww = e.warmth || null;
      if (ww && ww.acted) {
        warmActed++; perSeed[s].warmActed++;
        if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
        else if (!ww.fireLit) warmFireFailed++;
      }
    }
    // Strand extraction: still-refused creek evenings, consecutive loop-days.
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const rows = run.map((e) => {
        const c = classify(e);
        const ww = e.warmth || {};
        const spend = (ww.acted && ww.fireLit && ww.logSpent) ? ww.logSpent : 0;
        return { evening: e, cls: c, spend };
      });
      // Ledger cross-checks on this strand.
      for (const r of rows) {
        const ww = r.evening.warmth || {};
        if (r.cls.unclassified) continue;
        if (ww.woodBefore !== undefined && ww.woodBefore !== null && ww.woodBefore !== r.cls.logs) {
          ledgerMismatches.push({ seed: s, loopDay: r.evening.loopDay, kind: 'woodBefore!=logs', woodBefore: ww.woodBefore, logs: r.cls.logs });
        }
        if (r.spend >= 1 && ww.woodAfter !== undefined && ww.woodAfter !== null
            && (ww.woodBefore - ww.woodAfter) !== r.spend) {
          ledgerMismatches.push({ seed: s, loopDay: r.evening.loopDay, kind: 'spend!=woodDelta', spend: r.spend, woodBefore: ww.woodBefore, woodAfter: ww.woodAfter });
        }
        if (ww.acted && !ww.fireLit && r.spend !== 0) {
          ledgerMismatches.push({ seed: s, loopDay: r.evening.loopDay, kind: 'failed-fire-spend', spend: r.spend });
        }
      }
      const cf = counterfactual(rows.map((r) => ({
        loopDay: r.evening.loopDay,
        logs: r.cls.unclassified ? 0 : r.cls.logs,
        kcal: r.cls.unclassified ? 0 : r.cls.kcal,
        ticks: r.cls.unclassified ? 0 : r.cls.ticks,
        mode: r.cls.unclassified ? 'unclassified' : r.cls.mode,
        spend: r.spend,
      })));
      const rec = { seed: s, nights: run.map((e) => e.loopDay), length: run.length,
        eveningWoods: run.map((e) => { const cls = (e.woodcarry || {}).classification || {}; return (cls.woodPlayer === undefined ? null : cls.woodPlayer); }),
        eveningRows: rows.map((r, i) => ({
          loopDay: r.evening.loopDay,
          mode: r.cls.unclassified ? 'unclassified' : r.cls.mode,
          logs: r.cls.logs, kcal: r.cls.kcal, ticks: r.cls.ticks,
          kcalGap: r.cls.kcalGap, woodDeficit: r.cls.woodDeficit, ticksGap: r.cls.ticksGap,
          kcalFallbackUsed: !!r.cls.kcalFallbackUsed,
          warmthActed: !!(r.evening.warmth && r.evening.warmth.acted),
          warmthFireLit: (r.evening.warmth && r.evening.warmth.fireLit) || null,
          warmthMiss: (r.evening.warmth && r.evening.warmth.miss) || null,
          logSpent: r.spend,
          woodBefore: (r.evening.warmth && r.evening.warmth.woodBefore) !== undefined ? r.evening.warmth.woodBefore : null,
          woodAfter: (r.evening.warmth && r.evening.warmth.woodAfter) !== undefined ? r.evening.warmth.woodAfter : null,
          pantryKcal: r.evening.eveningPantryKcal !== undefined ? r.evening.eveningPantryKcal : null,
          packFoodKcal: r.evening.eveningPackFoodKcal !== undefined ? r.evening.eveningPackFoodKcal : null,
          preservedBefore: cf.table[i].preservedBefore,
          cfLogs: cf.table[i].cfLogs,
          rescued: cf.table[i].rescued,
        })),
        totalLogs: cf.totalLogs, spendNights: cf.spendNights,
        spendNightDays: rows.filter((r) => r.spend >= 1).map((r) => r.evening.loopDay),
        rescuedNights: cf.rescuedNights, firstRescue: cf.firstRescue,
        shortening: cf.shortening };
      strands.push(rec);
      perSeed[s].strands.push({ nights: rec.nights, length: rec.length,
        totalLogs: rec.totalLogs, spendNights: rec.spendNights,
        rescuedNights: rec.rescuedNights, firstRescue: rec.firstRescue, shortening: rec.shortening });
      for (const row of rec.eveningRows) {
        table.push({ seed: s, ...row });
        if (row.mode === 'unclassified') unclassified.push({ seed: s, loopDay: row.loopDay });
        if (row.kcalFallbackUsed) kcalFallback.push({ seed: s, loopDay: row.loopDay });
      }
      run = [];
    };
    for (const e of evs) {
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      creekEvenings++; perSeed[s].creek++;
      if (wc.rescued) { rescued++; perSeed[s].rescued++; if (run.length) flush(); }
      else {
        stillRefused++; perSeed[s].still++;
        if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
        run.push(e);
      }
    }
    flush();
  }
  const modeCounts = {};
  for (const t of table) modeCounts[t.mode] = (modeCounts[t.mode] || 0) + 1;
  return { dir, seeds, evenings, creekEvenings, stillRefused, rescued,
    warmActed, warmLogSpent, warmFireFailed, recorderErrs, pantryPackErrs,
    perSeed, strands, table, modeCounts, unclassified, kcalFallback,
    ledgerMismatches, wall,
    medianKcalGap: median(table.filter((t) => t.kcalGap > 0).map((t) => t.kcalGap)),
    medianWoodDeficit: median(table.filter((t) => t.woodDeficit > 0).map((t) => t.woodDeficit)) };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir) { console.error('usage: analyze-warmfuel-b.js <corpusDir> [outJson]'); process.exit(2); }
  const result = analyzeDir(dir);
  const text = JSON.stringify(result, null, 1);
  if (out) fs.writeFileSync(out, text + '\n');
  else process.stdout.write(text + '\n');
  console.error(`seeds=${result.seeds} creek=${result.creekEvenings} still=${result.stillRefused} rescued=${result.rescued} strands=${result.strands.length} unclassified=${result.unclassified.length} ledgerMismatches=${result.ledgerMismatches.length}`);
}

module.exports = { analyzeDir, classify, counterfactual, WOOD_NEEDED, KCAL_NEEDED, TICKS_NEEDED };
