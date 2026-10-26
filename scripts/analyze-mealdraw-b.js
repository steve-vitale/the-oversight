#!/usr/bin/env node
// analyze-mealdraw-b.js — meal-draw reconciliation (DIAG only).
//
// sim-mealdraw-b, 2026-10-26, oversight-flesh-out-loop-b.
// Read-only analysis of the NEW corpus
// (evidence/2026-10-26/sim-mealdraw-b-corpus/,
// mealdraw-b-cap1 files, 8 seeds 9750-9757, competent-nofeast,
// 100d) plus the committed stockdoor corpus for the determinism
// leg and the dayPantry endpoints (prereg-literal: endpoints
// are the stockdoor corpus's first-cook snapshots).
//
// CONTROL: the pre-fourth-door view re-derives the stockdoor
// control exactly (327/289/38, lag, coverage, residuals).
// PRIMARY (prereg): legs 2–5 reconcile the night-82 gap and
// the day-84 pile from meal-draw records, gross and surviving
// pile judged separately; leg 6 cross-checks; leg 7 is
// determinism vs the stockdoor corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const { countedKcal } = require('./analyze-preservesched-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-mealdraw-b-corpus');
const OLD = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stockdoor-b-corpus');
const THREE_DOORS = new Set(['stock', 'deposit', 'pantryAdd']);

function loadCorpus(dir, pattern) {
  const files = fs.readdirSync(dir).filter(f => pattern.test(f)).sort();
  const bySeed = new Map();
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed.set(d.seed, d);
  }
  return { files: files.length, bySeed };
}
function med(xs) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function classKey(name, kcalEach, spoilDay, granaryDays, foodState) {
  return [name, kcalEach, (spoilDay == null ? null : spoilDay),
    (granaryDays == null ? null : granaryDays),
    (foodState == null ? null : foodState)].join('|');
}
function itemClass(it) {
  return classKey(it.name, it.kcalEach, it.spoilDay, it.granaryDays, it.foodState);
}
// Window W (first-cook day D -> first-cook day D+1): a draw record
// belongs iff (day == D and cookLinesSeenToday >= 1) or
// (day == D+1 and cookLinesSeenToday == 0).
function inWindow(rec, D) {
  return (rec.day === D && (rec.cookLinesSeenToday || 0) >= 1) ||
    (rec.day === D + 1 && (rec.cookLinesSeenToday || 0) === 0);
}
function pantryByClass(dayPantryEntry) {
  const map = new Map();
  if (!dayPantryEntry) return map;
  for (const s of (dayPantryEntry.stacks || [])) {
    const k = classKey(s.name, s.kcalEach, s.spoilDay, s.granaryDays, s.foodState);
    map.set(k, (map.get(k) || 0) + (s.kcalEach || 0) * (s.units || 0));
  }
  return map;
}

function analyze(corpusDir, oldDir) {
  const dir = corpusDir || CORPUS;
  const old = oldDir || OLD;
  const { files, bySeed } = loadCorpus(dir, /^mealdraw-b-cap1-.*\.json$/);
  const oldC = loadCorpus(old, /^stockdoor-b-cap1-.*\.json$/);
  const seeds = [...bySeed.keys()].sort((a, b) => a - b);
  let totBound = 0, totAttr = 0, totUnattr = 0, attrFlagMismatch = 0;
  const lagDist = {};
  const rows38 = [];
  const wall = { national: 0, table: 0, win: 0, wave4: 0, wave5: 0,
    daysAlive: [], deaths: 0, deathCauses: {}, waveReach: {} };
  let ctxMismatch = 0, ctxChecked = 0, residJoinMiss = 0;
  const truncBad = [];
  let mealRecTotal = 0;
  const mealContexts = {};
  for (const seed of seeds) {
    const d = bySeed.get(seed);
    if (d.inflowTruncated || d.residTruncated || d.stockdoorTruncated ||
        d.cookTruncated || d.eventTruncated || d.mealdrawTruncated) truncBad.push(seed);
    const inflows = (d.inflows || []).filter(r => THREE_DOORS.has(r.door));
    const byDay = new Map();
    for (const r of inflows) {
      const k = countedKcal(r);
      if (!byDay.has(r.day)) byDay.set(r.day, { kcal: 0 });
      byDay.get(r.day).kcal += k;
    }
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
    const cookByDay = new Map();
    for (const c of (d.cookLines || [])) {
      if (!cookByDay.has(c.day)) cookByDay.set(c.day, []);
      cookByDay.get(c.day).push(c);
    }
    for (const arr of cookByDay.values()) arr.sort((a, b) => a.seq - b.seq);
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
      rows38.push({ seed, day: D, lag, explained });
    }
    for (const r of (d.mealDrawRecords || [])) {
      mealRecTotal++;
      mealContexts[r.context || (r.kind === 'mealCall' ? r.context : 'other')] =
        (mealContexts[r.context] || 0) + 1;
    }
  }
  rows38.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
  const explained = rows38.filter(r => r.explained);
  const residuals = rows38.filter(r => !r.explained);
  const control = {
    neutrality: { bound: totBound, attributed: totAttr, unattributed: totUnattr },
    neutralityPass: totBound === 327 && totAttr === 289 && totUnattr === 38,
    attrFlagMismatch,
    lagDistribution: lagDist,
    lagPass: JSON.stringify(lagDist) === JSON.stringify({ 1: 32, 2: 4, 3: 1, 4: 1 }),
    medianLag: med(rows38.map(r => r.lag).filter(x => x !== null)),
    coverage: { explained: explained.length, total: rows38.length },
    coveragePass: explained.length === 36 && rows38.length === 38,
    residuals: residuals.map(r => ({ seed: r.seed, day: r.day, lag: r.lag })),
    residualsPass: JSON.stringify(residuals.map(r => [r.seed, r.day])) === JSON.stringify([[9750, 83], [9750, 84]]),
  };
  control.pass = control.neutralityPass && control.attrFlagMismatch === 0 && control.lagPass &&
    control.medianLag === 1 && control.coveragePass && control.residualsPass;

  // ---- Seed 9750 meal-draw reconciliation ----
  const d = bySeed.get(9750);
  const od = oldC.bySeed.get(9750);
  const draws = (d.mealDrawRecords || []).filter(r => r.kind === 'pantryDraw' || r.kind === 'drawSpoiled');
  const mealCalls = (d.mealDrawRecords || []).filter(r => r.kind === 'mealCall');
  // Stockdoor gross writes per scholar day (stockdoor record day == scholar day).
  const sdByDay = new Map();
  for (const r of (d.stockdoorRecords || [])) {
    if (Math.round(r.kcal || 0) <= 0) continue;
    sdByDay.set(r.day, (sdByDay.get(r.day) || 0) + Math.round(r.kcal || 0));
  }
  function windowSums(D) {
    // pileKcal (units x kcalEach) and takenKcal (units x effectiveKcal)
    // per class, per context, over draw records in window D.
    const perClass = new Map(), perClassTaken = new Map(), perContext = new Map();
    const detail = [];
    for (const r of draws) {
      if (!inWindow(r, D)) continue;
      for (const it of (r.items || [])) {
        const k = itemClass(it);
        const pile = (it.units || 0) * (it.kcalEach || 0);
        const taken = (it.units || 0) * (it.effectiveKcal || 0);
        perClass.set(k, (perClass.get(k) || 0) + pile);
        perClassTaken.set(k, (perClassTaken.get(k) || 0) + taken);
        perContext.set(r.context, (perContext.get(r.context) || 0) + pile);
        detail.push({ seq: r.seq, kind: r.kind, day: r.day, context: r.context,
          vid: r.vid, name: it.name, kcalEach: it.kcalEach, units: it.units,
          spoilDay: it.spoilDay, granaryDays: it.granaryDays,
          foodState: it.foodState, pile, taken });
      }
    }
    return { perClass, perClassTaken, perContext, detail };
  }
  const w1 = windowSums(82);
  const w2 = windowSums(83);
  const CLASS_A = classKey('Foraged food', 200, 85, null, null);
  const GRAN122 = classKey('Foraged food', 122, 85, 3, null);
  const GRAN220 = classKey('Foraged food', 220, 85, 3, null);
  const WIN300 = classKey("Winner's share (alien rations)", 300, 86, 3, null);
  const FOR200_86 = classKey('Foraged food', 200, 86, null, null);
  const FOR178 = classKey('Foraged food', 178, 86, 3, null);
  const FOR189 = classKey('Foraged food', 189, 86, 3, null);
  function at85(map) {
    return atSpoil(map, '85');
  }
  function atSpoil(map, day) {
    let tot = 0;
    for (const [k, v] of map) {
      const parts = k.split('|');
      if (parts[2] === String(day)) tot += v;
    }
    return tot;
  }
  const leg2 = {
    classA: w1.perClass.get(CLASS_A) || 0,
    classAByContext: (() => {
      const m = {};
      for (const x of w1.detail) {
        if (itemClass(x) === CLASS_A || (x.name === 'Foraged food' && x.kcalEach === 200 && x.spoilDay === 85 && x.granaryDays == null)) {
          m[x.context] = (m[x.context] || 0) + x.pile;
        }
      }
      return m;
    })(),
    gran122: w1.perClass.get(GRAN122) || 0,
    gran220: w1.perClass.get(GRAN220) || 0,
    at85Total: at85(w1.perClass),
    stockdoorGross82: sdByDay.get(82) || 0,
    equation: null, pass: false,
  };
  leg2.equation = 342 + leg2.stockdoorGross82 - leg2.at85Total;
  leg2.pass = leg2.classA === 800 && leg2.at85Total === 1142 && leg2.equation === 2000 &&
    (leg2.classAByContext['villager-home'] || 0) === 800 &&
    Object.keys(leg2.classAByContext).every(c => c === 'villager-home');
  const leg2DetailA = w1.detail.filter(x => x.name === 'Foraged food' && x.kcalEach === 200 && x.spoilDay === 85 && x.granaryDays == null);

  // Day-84 pile: endpoints from the STOCKDOOR corpus dayPantry.
  const oPantry = new Map();
  for (const e of (od.dayPantry || [])) oPantry.set(e.day, e);
  const pan83 = pantryByClass(oPantry.get(83));
  const pan84 = pantryByClass(oPantry.get(84));
  // New dried stacks in dayPantry84 vs dayPantry83 (smoke candidates).
  const driedNew = [];
  for (const [k, v] of pan84) {
    const parts = k.split('|');
    if (parts[4] !== 'preserved') continue;
    const old = pan83.get(k) || 0;
    if (v > old) driedNew.push({ key: k, kcal: v - old, name: parts[0], kcalEach: Number(parts[1]), spoilDay: parts[2] });
  }
  // Day-84 first worked line kcal (from the NEW corpus cook lines).
  let worked84Kcal = null, worked84Text = null;
  for (const c of (d.cookLines || [])) {
    if (c.day === 84 && c.frame === 'worked') {
      worked84Text = c.text || '';
      const m = /~\s*([\d,]+)\s*kcal/.exec(worked84Text);
      if (m) worked84Kcal = Number(m[1].replace(/,/g, ''));
      break;
    }
  }
  // Smoke candidates: dried kcalEach / 0.80 -> fresh kcalEach; map to
  // @86 fresh classes by kcalEach + name stem.
  const smoke = {};
  let smokeFreshTotal = 0;
  for (const s of driedNew) {
    const freshEach = s.kcalEach / 0.8;
    const units = Math.round(s.kcal / s.kcalEach);
    const freshKcal = Math.round(units * freshEach);
    smokeFreshTotal += freshKcal;
    let target = null;
    const stem = s.name.replace(/ \(dried\)$/, '');
    if (stem === "Winner's share (alien rations)" && Math.abs(freshEach - 300) < 0.01) target = WIN300;
    else if (stem === 'Foraged food' && Math.abs(freshEach - 200) < 0.01) target = FOR200_86;
    smoke[target || ('unmapped:' + s.key)] = (smoke[target || ('unmapped:' + s.key)] || 0) + freshKcal;
  }
  const leg4 = {
    classA: w2.perClass.get(CLASS_A) || 0,
    pass: (w2.perClass.get(CLASS_A) || 0) === 0,
  };
  const classes86 = [
    { key: WIN300, label: 'Winner-300@86', before: pan83.get(WIN300) || 0, after: pan84.get(WIN300) || 0, writes: 0 },
    { key: FOR200_86, label: 'Foraged-200@86', before: pan83.get(FOR200_86) || 0, after: pan84.get(FOR200_86) || 0, writes: sdByDay.get(83) || 0 },
    { key: FOR178, label: 'Foraged-178@86', before: pan83.get(FOR178) || 0, after: pan84.get(FOR178) || 0, writes: 0 },
    { key: FOR189, label: 'Foraged-189@86', before: pan83.get(FOR189) || 0, after: pan84.get(FOR189) || 0, writes: 0 },
  ];
  for (const c of classes86) {
    c.draws = w2.perClass.get(c.key) || 0;
    c.smoke = smoke[c.key] || 0;
    c.predicted = c.before + c.writes - c.draws - c.smoke;
    c.pass = c.predicted === c.after;
  }
  const leg5 = {
    classes: classes86,
    driedNew, smoke, smokeFreshTotal, worked84Kcal, worked84Text,
    smokeKcalMatch: worked84Kcal != null &&
      Math.abs(smokeFreshTotal * 0.8 - worked84Kcal) <= Math.max(1, 0.05 * worked84Kcal),
    pass: classes86.every(c => c.pass) && Object.keys(smoke).every(k => !k.startsWith('unmapped')),
  };
  leg5.pass = leg5.pass && leg5.smokeKcalMatch;

  // Leg 6 cross-checks.
  let mealCallChecked = 0, mealCallMismatch = [];
  for (const mc of mealCalls) {
    if (mc.context !== 'villager-home') continue;
    mealCallChecked++;
    if (mc.freshTaken + mc.spoiledGot !== (mc.ret ? mc.ret.drawn : null)) {
      mealCallMismatch.push({ seq: mc.seq, day: mc.day, vid: mc.vid,
        fresh: mc.freshTaken, spoiled: mc.spoiledGot, drawn: mc.ret ? mc.ret.drawn : null });
    }
  }
  let spoilChecked = 0, spoilMismatch = [];
  for (const r of draws) {
    if (r.kind !== 'drawSpoiled') continue;
    spoilChecked++;
    if (r.got !== r.diffSum) spoilMismatch.push({ seq: r.seq, day: r.day, vid: r.vid, got: r.got, diffSum: r.diffSum });
  }
  const leg6 = {
    mealCallChecked, mealCallMismatch: mealCallMismatch.slice(0, 20), mealCallMismatchTotal: mealCallMismatch.length,
    spoilChecked, spoilMismatch: spoilMismatch.slice(0, 20), spoilMismatchTotal: spoilMismatch.length,
    truncBad,
    pass: mealCallMismatch.length === 0 && spoilMismatch.length === 0 && truncBad.length === 0,
  };

  // Leg 7 determinism vs stockdoor corpus.
  const detMismatches = [];
  for (const seed of seeds) {
    const n = bySeed.get(seed), o = oldC.bySeed.get(seed);
    if (!o) { detMismatches.push(seed + ':missing-old'); continue; }
    const same = (a, b, label) => {
      if (JSON.stringify(a) !== JSON.stringify(b)) detMismatches.push(seed + ':' + label);
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
  const leg7 = { detMismatches, pass: detMismatches.length === 0 };

  // Night-81 corroboration (not a GO leg): window 81, @84 classes.
  const w81 = windowSums(81);
  const pan81 = pantryByClass(oPantry.get(81));
  const pan82 = pantryByClass(oPantry.get(82));
  let at84Before = 0, at84After = 0;
  for (const [k, v] of pan81) { if (k.split('|')[2] === '84') at84Before += v; }
  for (const [k, v] of pan82) { if (k.split('|')[2] === '84') at84After += v; }
  const night81 = {
    stockdoorGross81: sdByDay.get(81) || 0,
    at84Before, at84After,
    at84Draws: atSpoil(w81.perClass, 84),
    equation: at84Before + (sdByDay.get(81) || 0) - atSpoil(w81.perClass, 84),
  };

  // New-corpus dayPantry vs stockdoor dayPantry for days 82-84 (sanity).
  const nPantry = new Map();
  for (const e of (d.dayPantry || [])) nPantry.set(e.day, e);
  const pantryMatch = {};
  for (const day of [82, 83, 84]) {
    const a = pantryByClass(oPantry.get(day)), b = pantryByClass(nPantry.get(day));
    const keys = new Set([...a.keys(), ...b.keys()]);
    pantryMatch[day] = [...keys].every(k => (a.get(k) || 0) === (b.get(k) || 0));
  }

  const verdict = (control.pass && leg2.pass && leg4.pass && leg5.pass && leg6.pass && leg7.pass)
    ? 'GO' : 'NO-GO';
  return {
    seeds, files,
    control, instrument: { ctxChecked, ctxMismatch, residJoinMiss, truncBad, mealRecTotal, mealContexts },
    wall: { n: seeds.length, national: wall.national, table: wall.table, win: wall.win,
      wave4: wall.wave4, wave5: wall.wave5, medianDaysAlive: med(wall.daysAlive),
      daysAlive: wall.daysAlive, deaths: wall.deaths, deathCauses: wall.deathCauses,
      waveReach: wall.waveReach },
    leg2, leg2DetailA, leg4, leg5, leg6, leg7, night81, pantryMatch,
    w1Contexts: Object.fromEntries(w1.perContext),
    w2Contexts: Object.fromEntries(w2.perContext),
    checks: { controlPass: control.pass, leg2Pass: leg2.pass, leg4Pass: leg4.pass,
      leg5Pass: leg5.pass, leg6Pass: leg6.pass, leg7Pass: leg7.pass },
    verdict,
  };
}

if (require.main === module) {
  const out = analyze();
  console.log('control:', JSON.stringify(out.control, null, 1));
  console.log('instrument:', JSON.stringify(out.instrument));
  console.log('wall:', JSON.stringify(out.wall));
  console.log('checks:', JSON.stringify(out.checks));
  console.log('leg2:', JSON.stringify(out.leg2, null, 1));
  console.log('leg2 Class-A draws:');
  for (const x of out.leg2DetailA) {
    console.log(`  seq=${x.seq} day=${x.day} ${x.context} vid=${x.vid} ${x.name} ${x.kcalEach}x${x.units} spoilDay=${x.spoilDay} pile=${x.pile}`);
  }
  console.log('leg4:', JSON.stringify(out.leg4));
  console.log('leg5:', JSON.stringify(out.leg5, null, 1));
  console.log('leg6:', JSON.stringify(out.leg6, null, 1));
  console.log('leg7:', JSON.stringify(out.leg7));
  console.log('night81:', JSON.stringify(out.night81));
  console.log('pantryMatch:', JSON.stringify(out.pantryMatch));
  console.log('w1Contexts:', JSON.stringify(out.w1Contexts));
  console.log('w2Contexts:', JSON.stringify(out.w2Contexts));
  console.log('VERDICT:', out.verdict);
}

module.exports = { analyze };
