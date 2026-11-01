#!/usr/bin/env node
// analyze-detourclear-b.js — clearing-vs-detour analyzer (DIAG ONLY).
// (sim-detourclear-b; prereg: evidence/2026-11-01/sim-detourclear-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Cost table from src/js/game.js clearBlockage / buildBridge + app.js labels:
//   fallen_tree: clearable, 60 kcal, 32 ticks, 0 wood, yields +2 wood.
//   rubble:      clearable, 40 kcal, 32 ticks, 0 wood, yields +1-3 stone.
//   washed_out:  wood >= 4 -> bridge (60 kcal, 96 ticks, 4 wood);
//                wood < 4  -> scramble (80 kcal, 32 ticks, 0 wood).
//   creek:       NOT clearable by hand; bridge (60 kcal, 96 ticks, 4 wood)
//                or swim (20 kcal, swimmer only — and travelBlockage
//                returns no block for a swimmer, so a creek refusal
//                implies non-swimmer).
// kcal is NOT a hard gate (clearBlockage floors at 0); wood >= 4 IS a
// hard gate for bridges.
//
// Verdict rule (prereg, fixed): per probe attempt, with detour length
// and census repeat count (same seed + blocked tile on >= 2 census
// nights) from the census corpus:
//   clearable + probe cleared + re-hop reached haven:
//     'clear-beats-detour' if detourLength >= 4 OR repeatNights >= 2,
//     else 'both-work-detour-cheaper-tonight'.
//   clearable + probe did not clear/reach:
//     'clear-fails-detour-wins' if detour exists, else 'both-fail'.
//   not clearable: 'detour-only' if detour exists, else 'neither'.
// A probe attempt counts as "cleared + reached" only when
// actionReturn is truthy AND blockGone === true AND reHopMoved === true.
//
// Usage:
//   node scripts/analyze-detourclear-b.js --census <dir...> <outFile>
//   node scripts/analyze-detourclear-b.js --probe <dir...> <outFile>
//   node scripts/analyze-detourclear-b.js --verdict <censusOut> <probeOut> <outFile>
'use strict';
const fs = require('fs');
const path = require('path');

function costFor(blockType, wood) {
  if (blockType === 'fallen_tree') return { clearable: true, kcal: 60, ticks: 32, wood: 0, yields: '+2 wood', method: 'clearBlockage' };
  if (blockType === 'rubble') return { clearable: true, kcal: 40, ticks: 32, wood: 0, yields: '+1-3 stone', method: 'clearBlockage' };
  if (blockType === 'washed_out') {
    if ((wood || 0) >= 4) return { clearable: true, kcal: 60, ticks: 96, wood: 4, yields: 'bridge', method: 'buildBridge(via clearBlockage)' };
    return { clearable: true, kcal: 80, ticks: 32, wood: 0, yields: 'passable', method: 'clearBlockage(scramble)' };
  }
  if (blockType === 'creek') return { clearable: false, kcal: null, ticks: null, wood: null, yields: null, method: 'bridge(60 kcal, 96 ticks, 4 wood) or swim(20 kcal, swimmer only)', bridge: { kcal: 60, ticks: 96, wood: 4 }, swim: { kcal: 20, ticks: 0 } };
  return { clearable: null, kcal: null, ticks: null, wood: null, yields: null, method: 'unknown-block-type' };
}
function median(xs) {
  const v = xs.filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
function classificationComplete(c) {
  if (!c) return false;
  const fields = ['blockType', 'blockedTile', 'approachTile', 'detourLength', 'approachWalkSteps', 'kcal', 'wood', 'swimmer', 'dayTicks', 'ticksToDayEnd'];
  return fields.every((f) => c[f] !== null && c[f] !== undefined);
}
function readCorpusDirs(dirs) {
  const files = [];
  for (const d of dirs) {
    const names = fs.readdirSync(d).filter((n) => n.endsWith('.json')).sort();
    for (const n of names) files.push({ dir: d, name: n, data: JSON.parse(fs.readFileSync(path.join(d, n), 'utf8')) });
  }
  return files;
}
function analyzeCensus(dirs) {
  const files = readCorpusDirs(dirs);
  const rows = [];
  const surprises = [];
  for (const f of files) {
    for (const e of (f.data.evenings || [])) {
      if (e.eveningOutcome !== 'travel-refused') continue;
      const c = e.classification || null;
      const row = {
        seed: f.data.seed, loopDay: e.loopDay,
        blockType: c ? c.blockType : null,
        blockedTile: c ? c.blockedTile : null,
        approachTile: c ? c.approachTile : null,
        departure: c ? c.departure : null,
        hopDistance: c ? c.hopDistance : null,
        hopReturnKind: e.hopReturnKind || null,
        scanFirstIsHopBlock: c ? c.scanFirstIsHopBlock : null,
        detourLength: c ? c.detourLength : null,
        detourPath: c ? c.detourPath : null,
        approachWalkSteps: c ? c.approachWalkSteps : null,
        kcal: c ? c.kcal : null, wood: c ? c.wood : null,
        swimmer: c ? c.swimmer : null,
        dayTicks: c ? c.dayTicks : null, ticksToDayEnd: c ? c.ticksToDayEnd : null,
        blockedTileProps: c ? c.blockedTileProps : null,
        complete: classificationComplete(c),
        sayTail: e.eveningSayTail || null,
      };
      if (!row.complete) surprises.push({ seed: row.seed, loopDay: row.loopDay, reason: 'incomplete-classification', row });
      if (c && c.scanFirstIsHopBlock === false) surprises.push({ seed: row.seed, loopDay: row.loopDay, reason: 'scan-first-differs-from-hop', hop: row.hopReturnKind, scanBlock: c.blockType });
      rows.push(row);
    }
  }
  const byType = {};
  for (const r of rows) {
    const t = r.blockType || 'unknown';
    byType[t] = byType[t] || { n: 0, complete: 0, kcal: [], wood: [], ticksLeft: [], detourLength: [], approachWalkSteps: [], hopDistance: [] };
    byType[t].n++;
    if (r.complete) byType[t].complete++;
    byType[t].kcal.push(r.kcal); byType[t].wood.push(r.wood); byType[t].ticksLeft.push(r.ticksToDayEnd);
    byType[t].detourLength.push(r.detourLength); byType[t].approachWalkSteps.push(r.approachWalkSteps); byType[t].hopDistance.push(r.hopDistance);
  }
  for (const t of Object.keys(byType)) {
    const b = byType[t];
    b.medianKcal = median(b.kcal); b.medianWood = median(b.wood); b.medianTicksLeft = median(b.ticksLeft);
    b.medianDetourLength = median(b.detourLength); b.medianApproachWalkSteps = median(b.approachWalkSteps);
    b.medianHopDistance = median(b.hopDistance);
    delete b.kcal; delete b.wood; delete b.ticksLeft; delete b.detourLength; delete b.approachWalkSteps; delete b.hopDistance;
  }
  // Repeat blocked tiles: same seed + blocked tile on >= 2 census nights.
  const tileCounts = {};
  for (const r of rows) {
    if (!r.blockedTile) continue;
    const k = r.seed + '|' + r.blockedTile.x + ',' + r.blockedTile.y;
    tileCounts[k] = (tileCounts[k] || 0) + 1;
  }
  const repeats = {};
  for (const [k, n] of Object.entries(tileCounts)) if (n >= 2) repeats[k] = n;
  const seeds = [...new Set(files.map((f) => f.data.seed))].sort((a, b) => a - b);
  return {
    dirs, seeds, files: files.length,
    refusedTotal: rows.length, refusedComplete: rows.filter((r) => r.complete).length,
    byType, repeats, rows, surprises,
  };
}
function analyzeProbe(dirs) {
  const files = readCorpusDirs(dirs);
  const attempts = [];
  for (const f of files) {
    for (const e of (f.data.evenings || [])) {
      if (!e.probe) continue;
      const p = e.probe, c = e.classification || {};
      const clearedReached = !!p.actionReturn && p.blockGone === true && p.reHopMoved === true;
      attempts.push({
        seed: f.data.seed, loopDay: e.loopDay,
        blockType: p.blockType, blockedTile: p.blockedTile, approachTile: p.approachTile,
        detourLength: c.detourLength !== undefined ? c.detourLength : null,
        approachWalkSteps: c.approachWalkSteps !== undefined ? c.approachWalkSteps : null,
        walkOk: p.walkOk, walkSteps: p.walkSteps,
        action: p.action, actionReturn: p.actionReturn, actionErr: p.actionErr,
        kcalBefore: p.kcalBefore, kcalAfterAction: p.kcalAfterAction,
        dayTicksBefore: p.dayTicksBefore, dayTicksAfterAction: p.dayTicksAfterAction,
        gameDayBefore: p.gameDayBefore, gameDayAfterAction: p.gameDayAfterAction,
        dayRolled: p.dayRolled, woodBefore: p.woodBefore, woodAfterAction: p.woodAfterAction,
        blockGone: p.blockGone, blockGoneErr: p.blockGoneErr,
        reHopMoved: p.reHopMoved, reHopErr: p.reHopErr,
        reHopCombatLive: p.reHopCombatLive, reHopGameOver: p.reHopGameOver,
        walkCombatLive: p.walkCombatLive, walkGameOver: p.walkGameOver,
        clearedReached, sayWindow: p.sayWindow || null,
      });
    }
  }
  const byType = {};
  for (const a of attempts) {
    const t = a.blockType || 'unknown';
    byType[t] = byType[t] || { n: 0, clearedReached: 0, walkOk: 0, blockGone: 0, dayRolled: 0, kcalDelta: [], tickDelta: [] };
    byType[t].n++;
    if (a.clearedReached) byType[t].clearedReached++;
    if (a.walkOk) byType[t].walkOk++;
    if (a.blockGone === true) byType[t].blockGone++;
    if (a.dayRolled) byType[t].dayRolled++;
    if (a.kcalBefore !== null && a.kcalAfterAction !== null) byType[t].kcalDelta.push(a.kcalAfterAction - a.kcalBefore);
    if (a.dayTicksBefore !== null && a.dayTicksAfterAction !== null) byType[t].tickDelta.push(a.dayTicksAfterAction - a.dayTicksBefore);
  }
  for (const t of Object.keys(byType)) {
    const b = byType[t];
    b.medianKcalDelta = median(b.kcalDelta); b.medianTickDelta = median(b.tickDelta);
    delete b.kcalDelta; delete b.tickDelta;
  }
  return { dirs, attemptsTotal: attempts.length, byType, attempts };
}
function verdictFor(attempt, censusRepeatNights) {
  const cost = costFor(attempt.blockType, attempt.woodBefore);
  const detourExists = attempt.detourLength !== null && attempt.detourLength !== undefined;
  if (cost.clearable) {
    if (attempt.clearedReached) {
      if ((attempt.detourLength !== null && attempt.detourLength >= 4) || (censusRepeatNights || 0) >= 2) return 'clear-beats-detour';
      return 'both-work-detour-cheaper-tonight';
    }
    return detourExists ? 'clear-fails-detour-wins' : 'both-fail';
  }
  return detourExists ? 'detour-only' : 'neither';
}
function analyzeVerdict(censusOut, probeOut) {
  const repeatByKey = {};
  for (const [k, n] of Object.entries(censusOut.repeats || {})) repeatByKey[k] = n;
  const rows = probeOut.attempts.map((a) => {
    const key = a.seed + '|' + (a.blockedTile ? a.blockedTile.x + ',' + a.blockedTile.y : '?');
    const repeatNights = repeatByKey[key] || 0;
    return Object.assign({}, a, { censusRepeatNights: repeatNights, verdict: verdictFor(a, repeatNights) });
  });
  const byType = {};
  for (const r of rows) {
    const t = r.blockType || 'unknown';
    byType[t] = byType[t] || { n: 0, verdicts: {}, clearedReached: 0 };
    byType[t].n++;
    byType[t].verdicts[r.verdict] = (byType[t].verdicts[r.verdict] || 0) + 1;
    if (r.clearedReached) byType[t].clearedReached++;
    const cost = costFor(t, r.woodBefore);
    byType[t].codeClearable = cost.clearable;
    byType[t].codeCost = cost;
  }
  // Census-only block types (no probe attempt) still get a verdict-table row.
  for (const t of Object.keys(censusOut.byType || {})) {
    if (!byType[t]) {
      const cost = costFor(t, null);
      byType[t] = { n: 0, verdicts: { 'no-probe-attempt': (censusOut.byType[t].n || 0) }, clearedReached: 0, codeClearable: cost.clearable, codeCost: cost, censusN: censusOut.byType[t].n || 0 };
    } else {
      byType[t].censusN = censusOut.byType[t].n || 0;
    }
  }
  return { byType, rows };
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];
  if (mode === '--census') {
    const out = args[args.length - 1];
    const dirs = args.slice(1, -1);
    const res = analyzeCensus(dirs);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(res, null, 1));
    console.log('census refused=' + res.refusedTotal + ' complete=' + res.refusedComplete + ' byType=' + JSON.stringify(res.byType));
  } else if (mode === '--probe') {
    const out = args[args.length - 1];
    const dirs = args.slice(1, -1);
    const res = analyzeProbe(dirs);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(res, null, 1));
    console.log('probe attempts=' + res.attemptsTotal + ' byType=' + JSON.stringify(res.byType));
  } else if (mode === '--verdict') {
    const censusOut = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const probeOut = JSON.parse(fs.readFileSync(args[2], 'utf8'));
    const out = args[3];
    const res = analyzeVerdict(censusOut, probeOut);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(res, null, 1));
    console.log('verdict byType=' + JSON.stringify(res.byType));
  } else {
    console.error('usage: --census|--probe|--verdict ...');
    process.exit(2);
  }
}
if (require.main === module) main();
module.exports = { costFor, median, classificationComplete, verdictFor, analyzeCensus, analyzeProbe, analyzeVerdict };
