#!/usr/bin/env node
// analyze-mealdraw-reprereg-b.js — re-preregged meal-draw reconciliation (DIAG only).
//
// sim-mealdraw-reprereg-b, 2026-10-26, oversight-flesh-out-loop-b.
// Parameterized by corpus directory: it reads the CONTROL numbers
// from the control corpus AT ANALYSIS TIME and compares the
// judged corpus against them. It hardcodes NO prior corpus's
// numbers — that hardcoding is what voided the prior arm when
// the base moved. Thresholds are the prereg's forms: exact
// field equality (neutrality) and residual exactly 0 (windows).
//
// Inputs (CLI or defaults):
//   --control <dir>   stockdoor-only control corpus (stockdoor-b-cap1 files)
//   --judged <dir>    mealdraw judged corpus (mealdraw-b-cap1 files)
//   --focus <seed>    focus seed for the window legs (0 = no focus seed)
// Outputs: control pre-fourth-door view, determinism, focus +
// generalized surplus windows, cross-checks, wall numbers, leg flags.
'use strict';
const fs = require('fs');
const path = require('path');
const { countedKcal } = require('./analyze-preservesched-b');

const THREE_DOORS = new Set(['stock', 'deposit', 'pantryAdd']);

function classKey5(name, kcalEach, spoilDay, granaryDays, foodState) {
  return [name, kcalEach, (spoilDay == null ? null : spoilDay),
    (granaryDays == null ? null : granaryDays),
    (foodState == null ? null : foodState)].join('|');
}
function itemClass(it) {
  return classKey5(it.name, it.kcalEach, it.spoilDay, it.granaryDays, it.foodState);
}
function med(xs) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function loadCorpus(dir, pattern) {
  const files = fs.readdirSync(dir).filter(f => pattern.test(f)).sort();
  const bySeed = new Map();
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed.set(d.seed, d);
  }
  return { files: files.length, bySeed };
}
function inWindow(rec, D) {
  return (rec.day === D && (rec.cookLinesSeenToday || 0) >= 1) ||
    (rec.day === D + 1 && (rec.cookLinesSeenToday || 0) === 0);
}
function pantryByClass(entry) {
  const map = new Map();
  if (!entry) return map;
  for (const s of (entry.stacks || [])) {
    const k = classKey5(s.name, s.kcalEach, s.spoilDay, s.granaryDays, s.foodState);
    map.set(k, (map.get(k) || 0) + (s.kcalEach || 0) * (s.units || 0));
  }
  return map;
}

// Pre-fourth-door view over ONE corpus (three doors only), with the
// identical counting rules of analyze-mealdraw-b.js / analyze-stockdoor-b.js.
function preFourthDoorView(bySeed) {
  let totBound = 0, totAttr = 0, totUnattr = 0, attrFlagMismatch = 0;
  const lagDist = {};
  const rows = [];
  let ctxMismatch = 0, ctxChecked = 0, residJoinMiss = 0;
  for (const seed of [...bySeed.keys()].sort((a, b) => a - b)) {
    const d = bySeed.get(seed);
    const inflows = (d.inflows || []).filter(r => THREE_DOORS.has(r.door));
    const byDay = new Map();
    for (const r of inflows) {
      const k = countedKcal(r);
      if (!byDay.has(r.day)) byDay.set(r.day, { kcal: 0 });
      byDay.get(r.day).kcal += k;
    }
    const cookByDay = new Map();
    for (const c of (d.cookLines || [])) {
      if (!cookByDay.has(c.day)) cookByDay.set(c.day, []);
      cookByDay.get(c.day).push(c);
    }
    const residByKey = new Map();
    for (const r of (d.residLines || [])) residByKey.set(r.cook + '|' + r.day + '|' + r.resIndex, r);
    for (const c of (d.cookLines || [])) {
      if (!residByKey.has(c.cook + '|' + c.day + '|' + c.resIndex)) residJoinMiss++;
    }
    for (const r of (d.residLines || [])) {
      if (r.ctxKcalMatch === false) ctxMismatch++;
      if (r.ctxKcalMatch !== null) ctxChecked++;
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
      if (r.attributed) continue;
      const priorDays = [...byDay.keys()].filter(x => x < D && (byDay.get(x).kcal > 0)).sort((a, b) => a - b);
      const lastDay = priorDays.length ? priorDays[priorDays.length - 1] : null;
      const lag = lastDay === null ? null : D - lastDay;
      lagDist[lag === null ? 'none' : lag] = (lagDist[lag === null ? 'none' : lag] || 0) + 1;
      const dr = dayRow.get(D) || {};
      const lines = cookByDay.get(D) || [];
      const boundLines = lines.filter(c => c.frame === 'racksFull' || (c.frame === 'plain' && c.racksFull === true));
      const firstBound = boundLines.length ? boundLines[0] : null;
      const explained = (lag === 1 || lag === 2) && !!dr.eligibleAny &&
        !!(firstBound && firstBound.racksFull === true);
      rows.push({ seed, day: D, lag, explained });
    }
  }
  rows.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  const explained = rows.filter(r => r.explained);
  const residuals = rows.filter(r => !r.explained);
  return {
    neutrality: { bound: totBound, attributed: totAttr, unattributed: totUnattr },
    attrFlagMismatch, lagDistribution: lagDist,
    medianLag: med(rows.map(r => r.lag).filter(x => x !== null)),
    coverage: { explained: explained.length, total: rows.length },
    residuals: residuals.map(r => ({ seed: r.seed, day: r.day, lag: r.lag })),
    instrument: { ctxChecked, ctxMismatch, residJoinMiss },
  };
}

function truncFlags(d) {
  return {
    inflow: !!d.inflowTruncated, resid: !!d.residTruncated,
    stockdoor: !!d.stockdoorTruncated, cook: !!d.cookTruncated,
    event: !!d.eventTruncated, mealdraw: !!d.mealdrawTruncated,
  };
}
function anyTrunc(flags) {
  return Object.values(flags).some(Boolean);
}

// Surplus windows for ONE seed in the judged corpus. A window D is
// checkable iff stockdoorWrites(D) > 0 and both dayPantry endpoints exist.
function seedWindows(d) {
  const sdByDay = new Map();
  for (const r of (d.stockdoorRecords || [])) {
    if (Math.round(r.kcal || 0) <= 0) continue;
    sdByDay.set(r.day, (sdByDay.get(r.day) || 0) + Math.round(r.kcal || 0));
  }
  const pantry = new Map();
  for (const e of (d.dayPantry || [])) pantry.set(e.day, e);
  const draws = (d.mealDrawRecords || []).filter(r => r.kind === 'pantryDraw' || r.kind === 'drawSpoiled');
  const windows = [];
  for (const D of [...sdByDay.keys()].sort((a, b) => a - b)) {
    const beforeEntry = pantry.get(D), afterEntry = pantry.get(D + 1);
    const surplusKey = classKey5('Foraged food', 200, D + 3, null, null);
    const before = pantryByClass(beforeEntry).get(surplusKey) || 0;
    const after = pantryByClass(afterEntry).get(surplusKey) || 0;
    let windowDraws = 0;
    for (const r of draws) {
      if (!inWindow(r, D)) continue;
      for (const it of (r.items || [])) {
        if (itemClass(it) === surplusKey) windowDraws += (it.units || 0) * (it.kcalEach || 0);
      }
    }
    const writes = sdByDay.get(D) || 0;
    const checkable = !!beforeEntry && !!afterEntry;
    windows.push({
      day: D, checkable, gross: writes, surviving: after,
      before, draws: windowDraws, after,
      residual: checkable ? (after - (before + writes - windowDraws)) : null,
      closed: checkable ? (after - (before + writes - windowDraws)) === 0 : null,
    });
  }
  return { windows, stockdoorByDay: Object.fromEntries(sdByDay) };
}

function crossChecks(bySeed) {
  let mealCallChecked = 0, mealCallMismatch = [];
  let spoilChecked = 0, spoilMismatch = [];
  const truncBad = [];
  for (const seed of [...bySeed.keys()].sort((a, b) => a - b)) {
    const d = bySeed.get(seed);
    if (anyTrunc(truncFlags(d))) truncBad.push(seed);
    for (const mc of (d.mealDrawRecords || []).filter(r => r.kind === 'mealCall')) {
      if (mc.context !== 'villager-home') continue;
      mealCallChecked++;
      if (mc.freshTaken + mc.spoiledGot !== (mc.ret ? mc.ret.drawn : null)) {
        mealCallMismatch.push({ seed, seq: mc.seq, day: mc.day, vid: mc.vid,
          fresh: mc.freshTaken, spoiled: mc.spoiledGot, drawn: mc.ret ? mc.ret.drawn : null });
      }
    }
    for (const r of (d.mealDrawRecords || []).filter(x => x.kind === 'drawSpoiled')) {
      spoilChecked++;
      if (r.got !== r.diffSum) spoilMismatch.push({ seed, seq: r.seq, day: r.day, vid: r.vid, got: r.got, diffSum: r.diffSum });
    }
  }
  return {
    mealCallChecked, mealCallMismatchTotal: mealCallMismatch.length,
    mealCallMismatch: mealCallMismatch.slice(0, 20),
    spoilChecked, spoilMismatchTotal: spoilMismatch.length,
    spoilMismatch: spoilMismatch.slice(0, 20),
    truncBad,
    pass: mealCallMismatch.length === 0 && spoilMismatch.length === 0 && truncBad.length === 0,
  };
}

function wallNumbers(bySeed) {
  const wall = { n: bySeed.size, national: 0, table: 0, win: 0, wave4: 0, wave5: 0,
    daysAlive: [], deaths: 0, deathCauses: {}, waveReach: {} };
  for (const seed of [...bySeed.keys()].sort((a, b) => a - b)) {
    const d = bySeed.get(seed);
    if (d.national) wall.national++;
    if (d.table) wall.table++;
    if (d.win) wall.win++;
    const wr = d.waveReach || [];
    if (wr.includes(4)) wall.wave4++;
    if (wr.includes(5)) wall.wave5++;
    wall.waveReach[wr.length] = (wall.waveReach[wr.length] || 0) + 1;
    wall.daysAlive.push(d.daysAlive || 0);
    wall.deaths += (d.deaths || 0);
    for (const [c, n] of Object.entries(d.deathCauses || {})) wall.deathCauses[c] = (wall.deathCauses[c] || 0) + n;
  }
  wall.medianDaysAlive = med(wall.daysAlive);
  return wall;
}

function determinism(controlBySeed, judgedBySeed) {
  const mismatches = [];
  const seeds = [...judgedBySeed.keys()].sort((a, b) => a - b);
  for (const seed of seeds) {
    const n = judgedBySeed.get(seed), o = controlBySeed.get(seed);
    if (!o) { mismatches.push(seed + ':missing-control'); continue; }
    const same = (a, b, label) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) mismatches.push(seed + ':' + label);
    };
    same((n.dayTable || []).map(r => [r.day, r.class]), (o.dayTable || []).map(r => [r.day, r.class]), 'dayTable');
    same((n.attributionTable || []).map(r => [r.day, r.attributed]), (o.attributionTable || []).map(r => [r.day, r.attributed]), 'attribution');
    same(n.daysAlive, o.daysAlive, 'daysAlive');
    same(n.deaths, o.deaths, 'deaths');
    same(n.deathCauses, o.deathCauses, 'deathCauses');
    same(n.rank, o.rank, 'rank');
    same(n.waveReach, o.waveReach, 'waveReach');
    same(n.national, o.national, 'national');
    same(n.table, o.table, 'table');
    same(n.win, o.win, 'win');
    same(n.endReason, o.endReason, 'endReason');
  }
  return { mismatches, pass: mismatches.length === 0, seeds };
}

function analyze(opts) {
  const control = loadCorpus(opts.controlDir, /^stockdoor-b-cap1-.*\.json$/);
  const judged = loadCorpus(opts.judgedDir, /^mealdraw-b-cap1-.*\.json$/);
  const controlView = preFourthDoorView(control.bySeed);
  const controlTruncBad = [];
  for (const seed of [...control.bySeed.keys()].sort((a, b) => a - b)) {
    const f = truncFlags(control.bySeed.get(seed));
    if (f.inflow || f.resid || f.stockdoor || f.cook || f.event) controlTruncBad.push(seed);
  }
  const det = determinism(control.bySeed, judged.bySeed);
  const checks = crossChecks(judged.bySeed);
  // Focus-seed windows.
  let focus = null;
  if (opts.focusSeed) {
    const fd = judged.bySeed.get(opts.focusSeed);
    if (fd) {
      const sw = seedWindows(fd);
      const checkable = sw.windows.filter(w => w.checkable);
      const byDay = new Map(sw.windows.map(w => [w.day, w]));
      focus = {
        seed: opts.focusSeed, windows: sw.windows, checkable: checkable.length,
        open: checkable.filter(w => !w.closed),
        allClosed: checkable.length >= 3 && checkable.every(w => w.closed),
        window81: byDay.get(81) || null, window82: byDay.get(82) || null,
        window83: byDay.get(83) || null,
        stockdoorByDay: sw.stockdoorByDay,
      };
    } else {
      focus = { seed: opts.focusSeed, missing: true, allClosed: false, checkable: 0, open: [], windows: [] };
    }
  }
  // Generalized windows across all judged seeds.
  const genWindows = [];
  for (const seed of [...judged.bySeed.keys()].sort((a, b) => a - b)) {
    const sw = seedWindows(judged.bySeed.get(seed));
    for (const w of sw.windows) if (w.checkable) genWindows.push({ seed, ...w });
  }
  const genOpen = genWindows.filter(w => !w.closed);
  return {
    controlFiles: control.files, judgedFiles: judged.files,
    controlSeeds: [...control.bySeed.keys()].sort((a, b) => a - b),
    judgedSeeds: [...judged.bySeed.keys()].sort((a, b) => a - b),
    controlView, controlTruncBad,
    controlGatePass: control.files === judged.files && controlTruncBad.length === 0,
    determinism: det,
    crossChecks: checks,
    focus, generalized: { total: genWindows.length, open: genOpen, allClosed: genOpen.length === 0, windows: genWindows },
    wallJudged: wallNumbers(judged.bySeed),
    wallControl: wallNumbers(control.bySeed),
    judgedInstrument: {
      ctxChecked: controlView.instrument.ctxChecked, ctxMismatch: controlView.instrument.ctxMismatch,
      residJoinMiss: controlView.instrument.residJoinMiss,
    },
  };
}

if (require.main === module) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf('--' + name);
    return i < 0 ? fallback : process.argv[i + 1];
  };
  const out = analyze({
    controlDir: arg('control', path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-mealdraw-reprereg-b-control-corpus')),
    judgedDir: arg('judged', path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-mealdraw-reprereg-b-corpus')),
    focusSeed: parseInt(arg('focus', '9750'), 10) || 0,
  });
  console.log('control files/seeds:', out.controlFiles, JSON.stringify(out.controlSeeds));
  console.log('judged files/seeds:', out.judgedFiles, JSON.stringify(out.judgedSeeds));
  console.log('control view:', JSON.stringify(out.controlView, null, 1));
  console.log('control truncBad:', JSON.stringify(out.controlTruncBad));
  console.log('determinism:', JSON.stringify(out.determinism));
  console.log('crossChecks:', JSON.stringify(out.crossChecks, null, 1));
  if (out.focus) {
    console.log('focus windows:');
    for (const w of out.focus.windows) {
      console.log(`  day=${w.day} checkable=${w.checkable} gross=${w.gross} surviving=${w.surviving} before=${w.before} draws=${w.draws} after=${w.after} residual=${w.residual} closed=${w.closed}`);
    }
  }
  console.log('generalized windows:', out.generalized.total, 'checkable,', out.generalized.open.length, 'open');
  for (const w of out.generalized.open) console.log('  OPEN', JSON.stringify(w));
  console.log('wall judged:', JSON.stringify(out.wallJudged));
  console.log('wall control:', JSON.stringify(out.wallControl));
}

module.exports = { analyze };
