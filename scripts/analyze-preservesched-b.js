#!/usr/bin/env node
// analyze-preservesched-b.js — preserve-scheduling timing analysis (DIAG only).
//
// sim-preservesched-b, 2026-10-26, oversight-flesh-out-loop-b.
// Read-only analysis of the COMMITTED inflow-b corpus
// (evidence/2026-10-26/sim-inflow-b-corpus/, cap1 files only, 8 seeds
// 9750-9757, competent-nofeast, 100d, SEATDRIVE=0 band). No fresh sweep:
// the committed corpora DO carry the scheduling fields — preserve-action
// day (the racks-bound day set), per-cook-line trigger state (racksFull
// recompute, eligiblePresent/Count/Kcal, preservedKcal, rackCap, pantry
// snapshot, throttle), and counted inflow records by day/door — so the
// brief's fresh-sweep condition ("corpora lack the scheduling fields")
// does not trigger. What the corpora lack (eligible-stack spoilDays and
// haven tier) is named as a limitation, not bridged by a sweep.
//
// QUESTION (from sim-inflowtrail-b): provenance is CLOSED — all 38
// unattributed racks-bound days had inflow within the trailing 4 days
// (median lag 1.0d). The open question is TIMING: why racks-bound days
// fall on no-inflow days.
//
// NAMED RULE under test (read from code BEFORE running; see evidence):
//   SPOIL-CLOCK + RACKS-FULL: a racks-bound day fires when (a) the
//   preserved stockpile is at/over the cook's rack cap AND (b) an
//   about-to-rot surplus (spoilDay within 2 days, not spoiled) sits in
//   the pantry. Stock-door arrivals carry spoilDay = arrival + 3
//   (game.js stockPantry; granary bonus 0 below haven tier 3), and the
//   cook's eligible window is spoilDay - day <= 2 (game.js cook branch;
//   stacksMatch gates merges on identical spoilDay, so merged stacks
//   share the clock). Hence a stock arrival first becomes eligible the
//   NEXT day — never on its arrival day — and stays eligible one more
//   day. A bound day therefore lands 1-2 days after the inflow that fed
//   it, and a bound day with no inflow of its own is the normal case:
//   the inflow that matters arrived yesterday, and today's inflow (if
//   any) is still too fresh to smoke.
//
// PRIMARY COVERAGE (fixed here, before the verdict is computed):
//   A day is EXPLAINED iff ALL of: lag to most recent counted-inflow
//   day in {1,2} AND eligibleAny true on that day AND the first bound
//   cook line's racksFull recompute true.
//   GO iff explained / 38 >= 0.80 (i.e. >= 31 days). Below 80% is
//   DIAG-NO-GO with the residual decomposition named. Never re-scored.
//
// Counting rule for "counted inflow" (identical to inflow-days.js):
//   a record counts iff it is not a refused pantryAdd (added === false)
//   and kcal > 0. A day "has inflow" iff its counted kcal > 0.
//   This must reproduce attributionTable.attributed for all 327 days.
//
// Secondary (reported, never judged as primary): stock-window variant
// (primary legs + stock-door kcal > 0 on days D-2..D-1), throttle share,
// within-day say-order (bound line seq vs forage-return event seq on
// attributed bound days; shared substrate-capture counter), lag-to-prior
// for attributed days (excluding same-day inflow), base rate of
// no-inflow days over days 1..daysAlive, day-mod-7 distribution,
// wall numbers for the band.
'use strict';
const fs = require('fs');
const path = require('path');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-inflow-b-corpus');

function counted(rec) {
  if (!rec) return false;
  if (rec.door === 'pantryAdd' && !rec.added) return false;
  return Math.round(rec.kcal || 0) > 0;
}
function countedKcal(rec) {
  return counted(rec) ? Math.round(rec.kcal || 0) : 0;
}

function analyze(corpusDir) {
  const dir = corpusDir || CORPUS;
  const files = fs.readdirSync(dir)
    .filter(f => /^inflow-b-cap1-.*\.json$/.test(f)).sort();
  const seeds = [];
  const rows38 = [];
  const rowsAttr = [];
  let totBound = 0, totAttr = 0, totUnattr = 0;
  let attrFlagMismatch = 0;
  const wall = { national: 0, table: 0, win: 0, wave4: 0, wave5: 0,
    daysAlive: [], deaths: 0, deathCauses: {} };
  const baseRate = { days: 0, noInflowDays: 0, perSeed: {} };
  const order = { compared: 0, boundBeforeReturn: 0, returnBeforeBound: 0, sameSeq: 0 };
  const mod7 = {};
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const seed = d.seed;
    seeds.push(seed);
    const inflows = d.inflows || [];
    const byDay = new Map();
    for (const r of inflows) {
      const k = countedKcal(r);
      if (!byDay.has(r.day)) byDay.set(r.day, { kcal: 0, stock: 0, deposit: 0, pantryAdd: 0, recs: [] });
      const e = byDay.get(r.day);
      e.kcal += k; e.recs.push(r);
      if (r.door === 'stock') e.stock += k;
      else if (r.door === 'deposit') e.deposit += k;
      else if (r.door === 'pantryAdd') e.pantryAdd += k;
    }
    // Base rate over days 1..daysAlive.
    let nd = 0, ni = 0;
    for (let day = 1; day <= (d.daysAlive || 0); day++) {
      nd++;
      if (!(byDay.get(day) && byDay.get(day).kcal > 0)) ni++;
    }
    baseRate.days += nd; baseRate.noInflowDays += ni;
    baseRate.perSeed[seed] = { days: nd, noInflowDays: ni };
    // Wall numbers.
    if (d.national) wall.national++;
    if (d.table) wall.table++;
    if (d.win) wall.win++;
    const wr = d.waveReach || [];
    if (wr.includes(4)) wall.wave4++;
    if (wr.includes(5)) wall.wave5++;
    wall.daysAlive.push(d.daysAlive || 0);
    wall.deaths += (d.deaths || 0);
    for (const [c, n] of Object.entries(d.deathCauses || {})) {
      wall.deathCauses[c] = (wall.deathCauses[c] || 0) + n;
    }
    // Cook lines indexed by day (seq order = say order).
    const cookByDay = new Map();
    for (const c of (d.cookLines || [])) {
      if (!cookByDay.has(c.day)) cookByDay.set(c.day, []);
      cookByDay.get(c.day).push(c);
    }
    for (const arr of cookByDay.values()) arr.sort((a, b) => a.seq - b.seq);
    const eventsByDay = new Map();
    for (const e of (d.events || [])) {
      if (!eventsByDay.has(e.day)) eventsByDay.set(e.day, []);
      eventsByDay.get(e.day).push(e);
    }
    const dayRow = new Map();
    for (const r of (d.dayTable || [])) dayRow.set(r.day, r);
    const at = d.attributionTable || [];
    totBound += at.length;
    for (const r of at) {
      const D = r.day;
      const dayInfl = byDay.get(D);
      const hasInfl = !!(dayInfl && dayInfl.kcal > 0);
      if (hasInfl !== !!r.attributed) attrFlagMismatch++;
      if (r.attributed) totAttr++; else totUnattr++;
      const priorDays = [...byDay.keys()].filter(x => x < D && (byDay.get(x).kcal > 0)).sort((a, b) => a - b);
      const lastDay = priorDays.length ? priorDays[priorDays.length - 1] : null;
      const lag = lastDay === null ? null : D - lastDay;
      const lastMix = lastDay === null ? null : (() => {
        const e = byDay.get(lastDay);
        return { day: lastDay, kcal: e.kcal, stock: e.stock, deposit: e.deposit,
          pantryAdd: e.pantryAdd,
          names: [...new Set(e.recs.filter(counted).map(x => x.name || '(unnamed)'))] };
      })();
      // Stock-window kcal: stock-door arrivals on D-2..D-1 (the arrivals
      // whose eligible window covers day D at granary bonus 0).
      let stockWindow = 0;
      for (const w of [D - 2, D - 1]) {
        const e = byDay.get(w);
        if (e) stockWindow += e.stock;
      }
      const dr = dayRow.get(D) || {};
      const lines = cookByDay.get(D) || [];
      const boundLines = lines.filter(c => c.frame === 'racksFull' || (c.frame === 'plain' && c.racksFull === true));
      const firstBound = boundLines.length ? boundLines[0] : null;
      const row = {
        seed, day: D, attributed: !!r.attributed,
        lag, lastInflow: lastMix, stockWindowKcal: stockWindow,
        eligibleAny: !!dr.eligibleAny, eligibleKcalMax: dr.eligibleKcalMax || 0,
        throttleFirst: dr.throttleFirst === undefined ? null : !!dr.throttleFirst,
        throttleLast: dr.throttleLast === undefined ? null : !!dr.throttleLast,
        preservedFirst: dr.preservedFirst === undefined ? null : dr.preservedFirst,
        freshFirst: dr.freshFirst === undefined ? null : dr.freshFirst,
        racksFullSpoken: dr.racksFullSpoken || 0, silenced: dr.silenced || 0,
        cookLines: dr.cookLines || 0, workedLines: dr.workedLines || 0,
        firstBound: firstBound ? {
          seq: firstBound.seq, cook: firstBound.cook, frame: firstBound.frame,
          resIndex: firstBound.resIndex, racksFull: firstBound.racksFull,
          preservedKcal: firstBound.preservedKcal, rackCap: firstBound.rackCap,
          eligiblePresent: firstBound.eligiblePresent,
          eligibleKcal: firstBound.eligibleKcal, ctxOk: firstBound.ctxOk,
          text: firstBound.text || '',
        } : null,
        boundLineCount: boundLines.length,
        class: dr.class || null,
      };
      if (r.attributed) {
        rowsAttr.push(row);
        // Within-day order: first bound line vs first same-day forage return.
        const fr = (eventsByDay.get(D) || []).filter(e => e.kind === 'forageReturn')
          .sort((a, b) => a.seq - b.seq);
        if (firstBound && fr.length) {
          order.compared++;
          if (firstBound.seq < fr[0].seq) order.boundBeforeReturn++;
          else if (firstBound.seq > fr[0].seq) order.returnBeforeBound++;
          else order.sameSeq++;
        }
      } else {
        rows38.push(row);
      }
      mod7[D % 7] = (mod7[D % 7] || 0) + 1;
    }
  }
  rows38.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  rowsAttr.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  const lagDist = {};
  for (const r of rows38) {
    const k = r.lag === null ? 'none' : String(r.lag);
    lagDist[k] = (lagDist[k] || 0) + 1;
  }
  const explained = rows38.filter(r =>
    (r.lag === 1 || r.lag === 2) && r.eligibleAny &&
    !!(r.firstBound && r.firstBound.racksFull === true));
  const stockVariant = explained.filter(r => r.stockWindowKcal > 0);
  const throttleShare = rows38.filter(r => r.throttleFirst === true).length;
  const eligShare = rows38.filter(r => r.eligibleAny).length;
  const spokenShare = rows38.filter(r => r.racksFullSpoken > 0).length;
  const lagPriorAttr = {};
  for (const r of rowsAttr) {
    const k = r.lag === null ? 'none' : String(r.lag);
    lagPriorAttr[k] = (lagPriorAttr[k] || 0) + 1;
  }
  const med = (xs) => {
    const s = [...xs].sort((a, b) => a - b);
    if (!s.length) return null;
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const lagVals = rows38.map(r => r.lag).filter(x => x !== null).sort((a, b) => a - b);
  const medianLag = med(lagVals);
  return {
    seeds, files: files.length,
    neutrality: { bound: totBound, attributed: totAttr, unattributed: totUnattr,
      expected: [327, 289, 38], pass: totBound === 327 && totAttr === 289 && totUnattr === 38 },
    attrFlagMismatch,
    rows38, rowsAttr,
    lagDistribution: lagDist, medianLag,
    primary: { explained: explained.length, total: rows38.length,
      coverage: rows38.length ? explained.length / rows38.length : 0,
      bar: 0.80, verdict: (rows38.length && explained.length / rows38.length >= 0.80) ? 'GO' : 'DIAG-NO-GO' },
    secondary: {
      stockWindowVariant: { explained: stockVariant.length, total: rows38.length,
        coverage: rows38.length ? stockVariant.length / rows38.length : 0 },
      eligibleAnyCount: eligShare, throttleFirstCount: throttleShare,
      spokenCount: spokenShare,
      lagToPriorForAttributed: lagPriorAttr,
      withinDayOrder: order,
      baseRate: { days: baseRate.days, noInflowDays: baseRate.noInflowDays,
        share: baseRate.days ? baseRate.noInflowDays / baseRate.days : 0,
        perSeed: baseRate.perSeed,
        boundNoInflowShare: totBound ? totUnattr / totBound : 0 },
      dayMod7ForAllBound: mod7,
    },
    wall: { n: seeds.length, national: wall.national, table: wall.table, win: wall.win,
      wave4: wall.wave4, wave5: wall.wave5, medianDaysAlive: med(wall.daysAlive),
      daysAlive: wall.daysAlive, deaths: wall.deaths, deathCauses: wall.deathCauses },
  };
}

if (require.main === module) {
  const out = analyze();
  console.log('neutrality:', JSON.stringify(out.neutrality));
  console.log('attrFlagMismatch:', out.attrFlagMismatch);
  console.log('lagDistribution (38):', JSON.stringify(out.lagDistribution), 'median:', out.medianLag);
  console.log('PRIMARY:', JSON.stringify(out.primary));
  console.log('secondary:', JSON.stringify(out.secondary, null, 1));
  console.log('wall:', JSON.stringify(out.wall));
  console.log('--- 38-row table (seed,day,lag,eligAny,eligKcalMax,throttleFirst,preservedFirst,rackCap,spoken,silenced,stockWindow) ---');
  for (const r of out.rows38) {
    console.log([r.seed, r.day, r.lag, r.eligibleAny, r.eligibleKcalMax, r.throttleFirst,
      r.preservedFirst, r.firstBound ? r.firstBound.rackCap : null,
      r.racksFullSpoken, r.silenced, r.stockWindowKcal].join(','));
  }
}

module.exports = { analyze, counted, countedKcal };
