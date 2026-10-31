#!/usr/bin/env node
// heraldpos-analyze-20261031.js — sim-heraldpos-a position analyzer.
//
// Reads per-seed JSONs from the heraldpos sweep (perseed-heraldpos)
// and answers, per seed: (a) lair placement, (b) movement, (c)
// proximity / first contact. Pure functions over JSON rows; no sims,
// no Game access. Exported for the proof test.
'use strict';
const fs = require('fs');
const path = require('path');

function man(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }
function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }
function isEdge(x, y) { return x === 0 || x === 8 || y === 0 || y === 8; }

function placementOf(seed) {
  const arr = seed.posPlacement || [];
  if (!arr.length) return null;
  const p = arr[0];
  return {
    day: p.day, spoken: p.spoken || null, entry: p.entry || null,
    agrees: !!p.agrees, player: p.player || null, haven: p.haven || null,
    distHaven: p.distHaven != null ? p.distHaven : null,
    distPlayer: p.distPlayer != null ? p.distPlayer : null,
    tileType: p.tileType || null,
    line: p.line || null,
  };
}

function firstContactDay(seed) {
  let best = null;
  const consider = (d) => { if (d != null && (best === null || d < best)) best = d; };
  (seed.attempts || []).forEach((a) => { if (a.mid === 'herald') consider(a.day); });
  (seed.fieldFights || []).forEach((f) => { if (f.mid === 'herald') consider(f.day); });
  (seed.musterRefusals || []).forEach((s) => { if (s.day != null) consider(s.day); });
  (seed.musterEvents || []).forEach((e) => { if (e.titan === 'herald') consider(e.day); });
  return best;
}

function completenessOf(seed, placement) {
  // Located = ended at omen stage 2. Completeness is judged only on
  // located seeds; unlocated seeds return {applicable:false}.
  if (seed.endOmenStage !== 2) return { applicable: false };
  const daily = (seed.posDaily || []).slice().sort((a, b) => a.day - b.day);
  const placeDay = placement ? placement.day : (seed.endOmenDay != null ? seed.endOmenDay : null);
  const windowDaily = placeDay != null ? daily.filter((r) => r.day >= placeDay) : [];
  let maxGap = 0;
  const gaps = [];
  for (let i = 1; i < windowDaily.length; i++) {
    const g = windowDaily[i].day - windowDaily[i - 1].day;
    if (g > maxGap) maxGap = g;
    if (g > 2) gaps.push({ from: windowDaily[i - 1].day, to: windowDaily[i].day });
  }
  const ok = !!placement && !!placement.agrees && windowDaily.length > 0 &&
    (placeDay == null || windowDaily[0].day <= placeDay + 2) &&
    !!seed.posFinal && gaps.length === 0;
  return {
    applicable: true, complete: ok,
    placementPresent: !!placement, placementAgrees: !!(placement && placement.agrees),
    windowDailyCount: windowDaily.length,
    windowDailyFirstDay: windowDaily.length ? windowDaily[0].day : null,
    windowDailyLastDay: windowDaily.length ? windowDaily[windowDaily.length - 1].day : null,
    finalPresent: !!seed.posFinal, maxGap: maxGap, gaps: gaps,
  };
}

function analyzeSeed(seed) {
  const placement = placementOf(seed);
  const located = seed.endOmenStage === 2;
  const placeDay = placement ? placement.day : null;
  const lair = placement && placement.entry ? { x: placement.entry.tx, y: placement.entry.ty } : null;
  const daily = (seed.posDaily || []).slice().sort((a, b) => a.day - b.day);
  const tick = (seed.posTick || []).slice().sort((a, b) => a.day - b.day);
  const contactDay = firstContactDay(seed);
  const windowEnd = contactDay != null ? contactDay : seed.gameDays;
  const inWindow = (r) => placeDay == null ? false : (r.day >= placeDay && r.day <= windowEnd);
  const wDaily = daily.filter(inWindow);
  const wTick = tick.filter(inWindow);

  // Movement over window daily rows (+ final if inside window).
  const moves = seed.posMoves || [];
  const wMoves = placeDay == null ? [] : moves.filter((m) => m.day >= placeDay && m.day <= windowEnd);
  const tiles = {};
  const tileSeq = [];
  wDaily.forEach((r) => { const k = r.herald.tx + ',' + r.herald.ty; tiles[k] = 1; tileSeq.push(k); });
  if (seed.posFinal && placeDay != null && seed.posFinal.day >= placeDay && seed.posFinal.day <= windowEnd) {
    tiles[seed.posFinal.herald.tx + ',' + seed.posFinal.herald.ty] = 1;
  }
  let maxDisp = 0, stationary = 0, changes = 0;
  for (let i = 1; i < tileSeq.length; i++) {
    if (tileSeq[i] === tileSeq[i - 1]) stationary++;
    else changes++;
  }
  Object.keys(tiles).forEach((k) => {
    if (!lair) return;
    const parts = k.split(',');
    const d = man(parseInt(parts[0], 10), parseInt(parts[1], 10), lair.x, lair.y);
    if (d > maxDisp) maxDisp = d;
  });
  const finalTile = seed.posFinal ? { x: seed.posFinal.herald.tx, y: seed.posFinal.herald.ty } : null;
  const finalDisp = (lair && finalTile) ? man(finalTile.x, finalTile.y, lair.x, lair.y) : null;

  // Proximity over window rows, daily and tick separately (tick rows
  // can share a day, so days and rows are never mixed).
  function prox(rows, dayMode) {
    const coincideDays = {}, adjDays = {};
    let rowsCoincide = 0, rowsAdj = 0, minMan = null, minCheb = null;
    rows.forEach((r) => {
      if (r.nOn > 0) { rowsCoincide++; if (dayMode) coincideDays[r.day] = 1; }
      if (r.nAdj > 0) { rowsAdj++; if (dayMode) adjDays[r.day] = 1; }
      if (r.playerCoincide) { rowsCoincide++; if (dayMode) coincideDays[r.day] = 1; }
      if (r.playerAdjacent) { rowsAdj++; if (dayMode) adjDays[r.day] = 1; }
      if (r.nearest) {
        if (minMan === null || r.nearest.man < minMan) minMan = r.nearest.man;
        if (minCheb === null || r.nearest.cheb < minCheb) minCheb = r.nearest.cheb;
      }
      if (r.player && r.herald) {
        const pm = man(r.player.x, r.player.y, r.herald.tx, r.herald.ty);
        if (minMan === null || pm < minMan) minMan = pm;
      }
    });
    return {
      coincideDays: dayMode ? Object.keys(coincideDays).map(Number).sort((a, b) => a - b) : null,
      coincideRows: rowsCoincide, adjDays: dayMode ? Object.keys(adjDays).map(Number).sort((a, b) => a - b) : null,
      adjRows: rowsAdj, minNearestMan: minMan, minNearestCheb: minCheb,
    };
  }
  const proxDaily = prox(wDaily, true);
  const proxTick = prox(wTick, false);

  // Lair on a villager path: any daily nodeList (whole run) containing
  // the lair tile, with first day and timing vs the window.
  let lairOnPathDay = null;
  if (lair) {
    const key = lair.x + ',' + lair.y;
    daily.forEach((r) => {
      if (r.nodeList && r.nodeList.indexOf(key) >= 0 && lairOnPathDay === null) lairOnPathDay = r.day;
    });
  }
  let lairOnPathTiming = null;
  if (lairOnPathDay != null && placeDay != null) {
    lairOnPathTiming = lairOnPathDay < placeDay ? 'before-placement' : (lairOnPathDay <= windowEnd ? 'in-window' : 'after-window');
  }

  // Escalation lines captured by the position instrument.
  const escLines = (seed.posSayLines || []).filter((s) => /fed in the night|struck .* in the night/.test(s.line || ''))
    .map((s) => ({ day: s.day, line: s.line }));

  return {
    seed: seed.seed, gameDays: seed.gameDays, won: seed.won, national: seed.national,
    table: seed.table, maxWave: seed.maxWave, w4Day: seed.w4Day, endReason: seed.endReason,
    endOmenStage: seed.endOmenStage, endOmenDay: seed.endOmenDay, located: located,
    placement: placement, lair: lair,
    windowDays: (placeDay != null) ? (windowEnd - placeDay) : null,
    windowEnd: windowEnd, contactDay: contactDay,
    completeness: completenessOf(seed, placement),
    movement: {
      wanderMoves: wMoves.filter((m) => m.kind === 'wander').length,
      otherMoves: wMoves.filter((m) => m.kind !== 'wander').length,
      moves: wMoves,
      distinctTiles: Object.keys(tiles).length,
      maxDisplacementFromLair: maxDisp,
      stationaryDailySteps: stationary, changedDailySteps: changes,
      stationaryShare: (stationary + changes) > 0 ? stationary / (stationary + changes) : null,
      finalTile: finalTile, finalDisplacementFromLair: finalDisp,
    },
    proximityDaily: proxDaily, proximityTick: proxTick,
    lairOnPathDay: lairOnPathDay, lairOnPathTiming: lairOnPathTiming,
    escalationLines: escLines,
    heraldAttempts: (seed.attempts || []).filter((a) => a.mid === 'herald').length,
    heraldFieldFights: (seed.fieldFights || []).filter((f) => f.mid === 'herald').length,
    posErrors: (seed.posInstrumentErrors || []).length,
    heraldErrors: (seed.instrumentErrors || []).length,
    posDailyCount: daily.length, posTickCount: tick.length,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => /^s\d+\.json$/.test(f)).sort();
  const seeds = files.map((f) => analyzeSeed(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
  const wall = {
    n: seeds.length,
    national: seeds.filter((s) => s.national).length,
    table: seeds.filter((s) => s.table).length,
    won: seeds.filter((s) => s.won).length,
    wave4: seeds.filter((s) => s.maxWave >= 4).length,
    wave5: seeds.filter((s) => s.maxWave >= 5).length,
    medianSurvival: null, maxSurvival: null,
  };
  const surv = seeds.map((s) => s.gameDays).sort((a, b) => a - b);
  if (surv.length) {
    wall.maxSurvival = surv[surv.length - 1];
    wall.medianSurvival = surv.length % 2 ? surv[(surv.length - 1) / 2]
      : (surv[surv.length / 2 - 1] + surv[surv.length / 2]) / 2;
  }
  const located = seeds.filter((s) => s.located);
  const complete = located.filter((s) => s.completeness.complete).length;
  return { wall: wall, seeds: seeds, locatedCount: located.length, completeLocated: complete };
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-heraldpos', 'leadfeast');
  const out = analyzeDir(dir);
  const dest = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-10-31', 'perseed-heraldpos', 'heraldpos-analysis.json');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 1) + '\n');
  console.log(JSON.stringify({ wall: out.wall, located: out.locatedCount, complete: out.completeLocated }, null, 1));
  out.seeds.forEach((s) => {
    console.log(`s${s.seed}: located=${s.located} place=${s.placement ? (s.placement.spoken ? s.placement.spoken.x + ',' + s.placement.spoken.y : '?') + (s.placement.agrees ? '' : ' MISMATCH') : 'none'} window=${s.windowDays} moves=${s.movement.wanderMoves}w/${s.movement.otherMoves}o tiles=${s.movement.distinctTiles} maxDisp=${s.movement.maxDisplacementFromLair} statShare=${s.movement.stationaryShare} coincDays=${(s.proximityDaily.coincideDays || []).length} adjDays=${(s.proximityDaily.adjDays || []).length} minMan=${s.proximityDaily.minNearestMan} lairOnPath=${s.lairOnPathDay}(${s.lairOnPathTiming}) contact=${s.contactDay} complete=${s.completeness.complete}`);
  });
}

module.exports = { analyzeSeed, analyzeDir, placementOf, completenessOf, firstContactDay, man, cheb, isEdge };
