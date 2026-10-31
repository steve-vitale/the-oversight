#!/usr/bin/env node
// analyze-p4sleep-b.js — P4 sleep/upkeep-window analyzer (DIAG ONLY).
// Implements the prereg classification EXACTLY
// (evidence/2026-10-31/sim-p4sleep-b-prereg.md). Reads one corpus dir of
// per-seed JSON files (as written by scripts/split-p4sleep-jsonl-b.js)
// and writes a census JSON to <outFile>.
// Usage: node scripts/analyze-p4sleep-b.js <corpusDir> <outFile>
//
// Step 1 — re-derive unexplained away mornings with the absencehunt
// analyzer's own definitions (shared atHaven + classifySeed).
// Step 2 — for each unexplained morning, take its window (evening snap
// k-1 through morning snap k) and classify its haven->away move events:
//   EXPLAINED-MECHANISM: named hook segment + counter delta, say line,
//     or a known mover drive hook (fight/contest) with the position trace.
//   EXPLAINED-SEGMENT-ONLY: named hook segment, no counter/say/mover path.
//   UNEXPLAINED: no haven->away move event in the window, or an
//     unattributed move (no hook boundary recorded it — instrument failure).
// Narration (reported, never judged): narrated / partial / unnarrated.
'use strict';
const fs = require('fs');
const path = require('path');
const { atHaven, classifySeed, TRAVEL_RE } = require('./analyze-absencehunt-b');

const FIGHT_RE = /flee|barrier|fight|strike|combat/i;
const CONTEST_RE = /contest|watchers|trial|show/i;
const MOVE_RE = /travel \d+ tile|walk back into haven|you walk|walked to|you head|you set out|you leave|you slip|you make your way/i;

function sayLinesOf(inst, ev) {
  if (!Array.isArray(inst.sayLines)) return [];
  const out = [];
  for (const s of inst.sayLines) {
    if (s.seq >= (ev.saySeqBefore || 0) && s.seq < (ev.saySeqAfter || 0)) out.push(s.line);
  }
  return out;
}

function ctxHasMover(delta) {
  if (!delta) return null;
  if ((delta.capHuntSorties || 0) > 0) return 'deedHunt-sortie';
  if ((delta.capHuntAmbushed || 0) > 0) return 'deedHunt-ambushed';
  if ((delta.capHuntFeastFights || 0) > 0 || (delta.capHuntWaveFights || 0) > 0) return 'deedHunt-fight';
  if ((delta.capHuntNoticed || 0) > 0) return 'deedHunt-noticed';
  if ((delta.nomadMoves || 0) > 0 || (delta.nomadRoadDays || 0) > 0) return 'nomad-road';
  if ((delta.facedDraw || 0) > 0) return 'feastFightRoad-draw';
  if ((delta._feastFightSweeps || {}).after !== undefined && (delta._feastFightSweeps || {}).before !== undefined &&
      delta._feastFightSweeps.after !== delta._feastFightSweeps.before) return 'feastFightRoad-sweep';
  if (delta._capHuntAway && delta._capHuntAway.before !== delta._capHuntAway.after) return 'deedHunt-away-flag';
  return null;
}

// Name the mechanism for one haven->away move event. Returns
// { mechanism, evidence, traceOnly } — mechanism null means segment-only.
function nameMechanism(inst, ev) {
  const lines = sayLinesOf(inst, ev);
  const byCounter = ctxHasMover(ev.ctxDelta);
  if (byCounter) return { mechanism: byCounter, evidence: 'counter', traceOnly: false, lines };
  const hasTravelLine = lines.some((l) => MOVE_RE.test(l));
  const hasFightLine = lines.some((l) => FIGHT_RE.test(l));
  const hasContestLine = lines.some((l) => CONTEST_RE.test(l));
  if (ev.segment === 'fight-drive') {
    return { mechanism: 'fight-drive-move', evidence: hasFightLine ? 'say+trace' : 'trace', traceOnly: !hasFightLine, lines };
  }
  if (ev.segment === 'contest-drive') {
    return { mechanism: 'contest-drive-move', evidence: hasContestLine ? 'say+trace' : 'trace', traceOnly: !hasContestLine, lines };
  }
  if (hasTravelLine) {
    const first = lines.find((l) => MOVE_RE.test(l));
    return { mechanism: 'upkeep-travel', evidence: 'say', traceOnly: false, lines, firstTravelLine: first };
  }
  if (ev.segment === 'sleep' && hasFightLine) {
    return { mechanism: 'sleep-encounter-flight', evidence: 'say', traceOnly: false, lines };
  }
  if (ev.segment === 'sleep' && hasContestLine) {
    return { mechanism: 'sleep-contest-grab', evidence: 'say', traceOnly: false, lines };
  }
  return { mechanism: null, evidence: 'segment-only', traceOnly: false, lines };
}

function narrationOf(named, ev) {
  const lines = named.lines || [];
  if (lines.some((l) => MOVE_RE.test(l))) return 'narrated';
  if (lines.some((l) => FIGHT_RE.test(l) || CONTEST_RE.test(l))) return 'partial';
  return 'unnarrated';
}

function classifyMorning(inst, loopDay) {
  const win = (inst.windows || []).find((w) => w.closingLoopDay === loopDay);
  if (!win) return { loopDay, class: 'UNEXPLAINED', reason: 'no-window-record', mechanism: null, segment: null };
  const outMoves = (win.events || []).filter((ev) => atHaven(ev.from) && !atHaven(ev.to));
  const awayToHaven = (win.events || []).filter((ev) => !atHaven(ev.from) && atHaven(ev.to));
  const roundTrip = outMoves.length > 0 && awayToHaven.length > 0;
  if (outMoves.length === 0) {
    return {
      loopDay, class: 'UNEXPLAINED', reason: 'no-move-event-in-window', mechanism: null, segment: null,
      windowEvents: (win.events || []).length, awayToHavenMoves: awayToHaven.length, roundTrip,
      openingEvening: win.openingEvening || null, closingMorning: win.closingMorning || null,
    };
  }
  // The explaining event is the FIRST haven->away move (episode start).
  const ev = outMoves[0];
  const named = nameMechanism(inst, ev);
  const cls = named.mechanism ? 'EXPLAINED-MECHANISM' : 'EXPLAINED-SEGMENT-ONLY';
  return {
    loopDay, class: cls, reason: named.evidence,
    mechanism: named.mechanism, segment: ev.segment, hook: ev.hook,
    traceOnly: !!named.traceOnly,
    narration: narrationOf(named, ev),
    fromTile: ev.from.tile || null, toTile: ev.to.tile || null,
    fromMap: [ev.from.mapPx ?? null, ev.from.mapPy ?? null],
    toMap: [ev.to.mapPx ?? null, ev.to.mapPy ?? null],
    fromGrid: [ev.from.mx ?? null, ev.from.my ?? null],
    toGrid: [ev.to.mx ?? null, ev.to.my ?? null],
    ctxDelta: ev.ctxDelta || null,
    sayLines: named.lines,
    firstTravelLine: named.firstTravelLine || null,
    outMovesInWindow: outMoves.length, awayToHavenMoves: awayToHaven.length, roundTrip,
    windowEvents: (win.events || []).length,
  };
}

function classifySeedP4(inst) {
  const base = classifySeed(inst);
  const mornings = (base.unexplainedAwayMornings || []).map((loopDay) => classifyMorning(inst, loopDay));
  // All windows' away->haven moves (masking visibility) + round-trips.
  const awayToHavenWindows = [];
  for (const w of (inst.windows || [])) {
    const a2h = (w.events || []).filter((ev) => !atHaven(ev.from) && atHaven(ev.to));
    const o2a = (w.events || []).filter((ev) => atHaven(ev.from) && !atHaven(ev.to));
    if (a2h.length) awayToHavenWindows.push({ closingLoopDay: w.closingLoopDay, awayToHaven: a2h.length, outMoves: o2a.length });
  }
  const count = (c) => mornings.filter((m) => m.class === c).length;
  return {
    seed: inst.seed,
    policy: inst.policy,
    horizonDays: inst.days || null,
    daysAlive: inst.daysAlive ?? null,
    endReason: inst.endReason || null,
    errCount: inst.errCount ?? null,
    loopDays: base.loopDays,
    genuine: base.genuine, genuineDays: base.genuineDays,
    dayTrips: base.dayTrips, multiHop: base.multiHop,
    sleepReturns: base.sleepReturns, awayOriginDays: base.awayOriginDays,
    awayContinuations: base.awayContinuations, awayReturns: base.awayReturns,
    unexplainedMornings: mornings,
    unexplainedCount: mornings.length,
    explainedMechanism: count('EXPLAINED-MECHANISM'),
    explainedSegmentOnly: count('EXPLAINED-SEGMENT-ONLY'),
    stillUnexplained: count('UNEXPLAINED'),
    windowsRecorded: (inst.windows || []).length,
    awayToHavenWindows,
  };
}

function analyzeDir(corpusDir) {
  const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8'));
    perSeed.push(classifySeedP4(inst));
  }
  const sum = (k) => perSeed.reduce((t, s) => t + (s[k] || 0), 0);
  const totalUnex = sum('unexplainedCount');
  const totalExplMech = sum('explainedMechanism');
  const totalExplSeg = sum('explainedSegmentOnly');
  const totalUnexpl = sum('stillUnexplained');
  const classified = totalExplMech + totalExplSeg;
  const mechCounts = {};
  for (const s of perSeed) {
    for (const m of s.unexplainedMornings) {
      if (m.mechanism) mechCounts[m.mechanism] = (mechCounts[m.mechanism] || 0) + 1;
    }
  }
  let dominant = null, dominantCount = 0;
  for (const [k, v] of Object.entries(mechCounts)) if (v > dominantCount) { dominant = k; dominantCount = v; }
  return {
    corpusDir,
    policy: perSeed.length ? perSeed[0].policy : null,
    horizonDays: perSeed.length ? perSeed[0].horizonDays : null,
    legs: perSeed.length,
    seeds: perSeed.map((s) => s.seed),
    totalGenuine: sum('genuine'),
    totalDayTrips: sum('dayTrips'),
    totalSleepReturns: sum('sleepReturns'),
    totalAwayOriginDays: sum('awayOriginDays'),
    totalUnexplained: totalUnex,
    totalExplainedMechanism: totalExplMech,
    totalExplainedSegmentOnly: totalExplSeg,
    totalStillUnexplained: totalUnexpl,
    classifiedFraction: totalUnex ? classified / totalUnex : null,
    mechanismNamedFraction: totalUnex ? totalExplMech / totalUnex : null,
    dominantMechanism: dominant, dominantCount,
    dominantShare: totalUnex ? dominantCount / totalUnex : null,
    mechanismCounts: mechCounts,
    totalErrs: sum('errCount'),
    perSeed,
  };
}

if (require.main === module) {
  const dir = process.argv[2];
  const out = process.argv[3];
  if (!dir || !out) { console.error('usage: analyze-p4sleep-b.js <corpusDir> <outFile>'); process.exit(2); }
  const census = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(census, null, 2));
  console.log('p4sleep census: ' + census.legs + ' legs policy=' + census.policy + ' horizonDays=' + census.horizonDays +
    ' genuine=' + census.totalGenuine + ' unexplained=' + census.totalUnexplained +
    ' explMech=' + census.totalExplainedMechanism + ' explSeg=' + census.totalExplainedSegmentOnly +
    ' stillUnex=' + census.totalStillUnexplained +
    ' classifiedFrac=' + (census.classifiedFraction === null ? 'null' : census.classifiedFraction.toFixed(3)) +
    ' dominant=' + census.dominantMechanism + '(' + census.dominantCount + ')');
}

module.exports = { atHaven, nameMechanism, classifyMorning, classifySeedP4, analyzeDir, MOVE_RE, FIGHT_RE, CONTEST_RE };
