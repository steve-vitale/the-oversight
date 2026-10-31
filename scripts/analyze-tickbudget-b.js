#!/usr/bin/env node
// analyze-tickbudget-b.js — tick-budget census analyzer (sim-tickbudget-b).
// PURE READS over tickbudget-trace-b.js corpora. No game code, no RNG,
// no state edits. Usage:
//   node scripts/analyze-tickbudget-b.js <corpusPrefix> <outputPrefix>
// corpusPrefix + '-' + leg gives the leg dir, legs:
//   on-control, on-variant, guard-control, guard-variant.
// Outputs: <outputPrefix>-census.json, <outputPrefix>-morning-table.json,
//   <outputPrefix>-compare.md
// Classification (prereg): raw gates wood>=4, kcal>=60, ticks>=96.
// ticks-short-alone: ticks fail, wood+kcal pass (== skip ticks-short).
// ticks-short-plus-*: ticks fail + wood and/or kcal fail (skip names
// the earlier gate, so the ticks shortfall is invisible in narration).
// Attribution (prereg + one refinement, disclosed in evidence):
//   PRESS-DECISIVE: ticks-short-alone + press fired with ticksSpent
//     >= shortfall + counterpart (same seed/day, same WOODWARM,
//     opposite PRESSB) is a creek evening with ticksGate true.
//     A missing/non-creek counterpart can NOT establish decisive,
//     so it falls to PRESS-CONTRIBUTING with counterpartStatus
//     recorded (this only makes decisive harder to claim).
//   PRESS-CONTRIBUTING: press fired with ticksSpent > 0 but not
//     decisive (counterpart also ticks-short, ticksSpent < shortfall,
//     plus-gate dominates, or counterpart unusable).
//   ROUTINE-ONLY: no press fired that loop-day.
// Reconciliation (still evenings): dailyTotal = eveningDayTicks -
//   morningDayTicks == pressbOwn + woodwarmOwn + woodcarryOwn +
//   routine; classificationDayTicks == morningDayTicks + pressbOwn
//   + woodcarryOwn + routine (woodwarm fire runs AFTER the bridge
//   decision, so it is excluded). Rescued evenings skip the second
//   equality (bridge build ticks land between classification and
//   eveningDayTicks); their classification-vs-evening gap is
//   reported as bridge+entry ticks, informational only.
'use strict';
const fs = require('fs');
const path = require('path');

const LEGS = [
  { name: 'on-control', woodwarm: 1, pressb: 0 },
  { name: 'on-variant', woodwarm: 1, pressb: 1 },
  { name: 'guard-control', woodwarm: 0, pressb: 0 },
  { name: 'guard-variant', woodwarm: 0, pressb: 1 },
];
const NEED_TICKS = 96, NEED_WOOD = 4, NEED_KCAL = 60;
const BANK = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];

function counterpartLeg(legName) {
  const l = LEGS.find((x) => x.name === legName);
  return LEGS.find((x) => x.woodwarm === l.woodwarm && x.pressb !== l.pressb).name;
}

function probeTotals(row) {
  const tp = row.tickProbe || [];
  const by = {};
  for (const p of tp) by[p.layer] = p.spent;
  const routine = (by.nighttravel === undefined ? null : by.nighttravel);
  const woodcarryTotal = (by.woodcarry === undefined ? null : by.woodcarry);
  const woodwarmTotal = (by.woodwarm === undefined ? null : by.woodwarm);
  const dailyTotal = (row.morningDayTicks === null || row.morningDayTicks === undefined
    || row.eveningDayTicks === null || row.eveningDayTicks === undefined)
    ? null : (row.eveningDayTicks - row.morningDayTicks);
  const pressbOwn = (dailyTotal === null || woodwarmTotal === null) ? null : (dailyTotal - woodwarmTotal);
  const woodwarmOwn = (woodwarmTotal === null || woodcarryTotal === null) ? null : (woodwarmTotal - woodcarryTotal);
  const woodcarryOwn = (woodcarryTotal === null || routine === null) ? null : (woodcarryTotal - routine);
  return { routine, woodcarryTotal, woodwarmTotal, dailyTotal, pressbOwn, woodwarmOwn, woodcarryOwn };
}

function classifyEvening(row) {
  const wc = row.woodcarry || {};
  const cls = wc.classification || {};
  const wood = cls.woodPlayer;
  const kcal = (cls.kcalLive === null || cls.kcalLive === undefined) ? cls.kcal : cls.kcalLive;
  const kcalFallback = (cls.kcalLive === null || cls.kcalLive === undefined);
  const ticks = cls.ticksToDayEnd;
  const dayTicks = cls.dayTicks;
  const skip = (wc.bridge || {}).skip || null;
  const rescued = !!wc.rescued;
  const gates = (wood === null || wood === undefined || kcal === null || kcal === undefined || ticks === null || ticks === undefined)
    ? null
    : { woodGate: wood >= NEED_WOOD, kcalGate: kcal >= NEED_KCAL, ticksGate: ticks >= NEED_TICKS };
  let tickClass = null, skipAgrees = null;
  if (gates) {
    if (gates.ticksGate) tickClass = 'not-ticks-short';
    else if (gates.woodGate && gates.kcalGate) tickClass = 'ticks-short-alone';
    else if (!gates.woodGate && gates.kcalGate) tickClass = 'ticks-short-plus-wood';
    else if (gates.woodGate && !gates.kcalGate) tickClass = 'ticks-short-plus-kcal';
    else tickClass = 'ticks-short-plus-both';
    const expectedSkip = !gates.woodGate ? 'wood-short'
      : (!gates.kcalGate ? 'kcal-short' : (!gates.ticksGate ? 'ticks-short' : null));
    skipAgrees = (skip === expectedSkip);
  }
  const shortfall = (ticks === null || ticks === undefined) ? null : Math.max(0, NEED_TICKS - ticks);
  return { wood, kcal, kcalFallback, ticks, dayTicks, skip, rescued, gates, tickClass, skipAgrees, shortfall };
}

function extractStrands(stillDays) {
  // stillDays: sorted loopDays of still evenings. Maximal consecutive runs.
  const strands = [];
  let cur = null;
  for (const d of stillDays) {
    if (cur && d === cur.end + 1) cur.end = d;
    else { cur = { start: d, end: d }; strands.push(cur); }
  }
  for (const s of strands) s.length = s.end - s.start + 1;
  return strands;
}

function main() {
  const corpusPrefix = process.argv[2];
  const outPrefix = process.argv[3];
  if (!corpusPrefix || !outPrefix) { console.error('usage: analyze-tickbudget-b.js <corpusPrefix> <outputPrefix>'); process.exit(2); }
  const root = path.join(__dirname, '..');
  const data = { legs: {}, strands: {}, morningTable: [], ticksShort: [], reconciliationMismatches: [] };
  const index = {}; // index[leg][seed][loopDay] = evening record (creek only)
  for (const leg of LEGS) {
    const dir = path.join(root, corpusPrefix + '-' + leg.name);
    const legOut = { seeds: {}, creekEvenings: 0, stillEvenings: 0, rescuedEvenings: 0,
      nonCreekRefused: 0, ticksShortAlone: 0, ticksShortPlus: 0, ticksShortTotal: 0,
      errs: 0, stalls: 0, files: 0, missingFiles: [] };
    for (const seed of BANK) {
      const file = path.join(dir, 'tickbudget-b-nighttravel-s' + seed + '.json');
      if (!fs.existsSync(file)) { legOut.missingFiles.push(seed); continue; }
      const inst = JSON.parse(fs.readFileSync(file, 'utf8'));
      legOut.files++;
      legOut.errs += (inst.woodcarryStore ? inst.woodcarryStore.errs : 0)
        + (inst.warmthStore ? inst.warmthStore.errs : 0)
        + (inst.pressbStore ? inst.pressbStore.errs : 0);
      const seedRec = { daysAlive: inst.daysAlive, endReason: inst.endReason,
        maxWaveUnlocked: inst.maxWaveUnlocked, waveKills: inst.waveKills,
        allDeaths: (inst.deaths || []).length,
        bearerDeaths: (inst.deaths || []).filter((d) => d.player).map((d) => ({ day: d.day, cause: d.cause })),
        creek: 0, still: 0, rescued: 0, ticksAlone: 0, ticksPlus: 0 };
      index[leg.name] = index[leg.name] || {};
      index[leg.name][seed] = index[leg.name][seed] || {};
      const stillDays = [];
      for (const row of (inst.evenings || [])) {
        const wc = row.woodcarry || {};
        if (!wc.classification) {
          if (wc.bucket && wc.bucket !== 'creek') legOut.nonCreekRefused++;
          continue;
        }
        if (wc.bucket !== 'creek') { legOut.nonCreekRefused++; continue; }
        const ce = classifyEvening(row);
        const probe = probeTotals(row);
        const warmth = row.warmth || null;
        const carry = row.woodcarryCarry || null;
        const press = row.pressbAttempt || null;
        const pressSkip = row.pressbSkip || null;
        const rec = { leg: leg.name, seed, loopDay: row.loopDay,
          wood: ce.wood, kcal: ce.kcal, kcalFallback: ce.kcalFallback,
          ticksToDayEnd: ce.ticks, classificationDayTicks: ce.dayTicks,
          skip: ce.skip, skipAgrees: ce.skipAgrees, rescued: ce.rescued,
          gates: ce.gates, tickClass: ce.tickClass, shortfall: ce.shortfall,
          morningDayTicks: row.morningDayTicks, eveningDayTicks: row.eveningDayTicks,
          morningTicksLeft: (row.morningDayTicks === null || row.morningDayTicks === undefined) ? null : (512 - row.morningDayTicks),
          morningWood: row.morningWood,
          pressFired: !!press, pressTicksSpent: press ? press.ticksSpent : null,
          pressE: press ? press.E : null, pressSkip: pressSkip ? pressSkip.skip : null,
          carryActed: carry ? !!carry.acted : null, carryTook: carry ? (carry.took || 0) : null,
          carrySkip: carry ? (carry.skip || null) : null,
          warmthActed: warmth ? !!warmth.acted : null,
          warmthTicksSpent: (warmth && warmth.acted && warmth.ticksBefore !== null && warmth.ticksAfter !== null)
            ? (warmth.ticksBefore - warmth.ticksAfter) : null,
          warmthMiss: warmth ? (warmth.miss || null) : null,
          probe, fullDaySay: row.fullDaySay || null };
        index[leg.name][seed][row.loopDay] = rec;
        seedRec.creek++; legOut.creekEvenings++;
        if (ce.rescued) { seedRec.rescued++; legOut.rescuedEvenings++; }
        else { seedRec.still++; legOut.stillEvenings++; stillDays.push(row.loopDay); }
        if (ce.tickClass === 'ticks-short-alone') { seedRec.ticksAlone++; legOut.ticksShortAlone++; }
        else if (ce.tickClass && ce.tickClass !== 'not-ticks-short') { seedRec.ticksPlus++; legOut.ticksShortPlus++; }
        if (ce.tickClass && ce.tickClass !== 'not-ticks-short') {
          legOut.ticksShortTotal++;
          data.ticksShort.push(rec);
        }
        // Reconciliation (still evenings only; loopDay 1 has no morning row).
        if (!ce.rescued && row.morningDayTicks !== null && row.morningDayTicks !== undefined) {
          const problems = [];
          if (probe.dailyTotal !== null && probe.pressbOwn !== null && probe.woodwarmOwn !== null
            && probe.woodcarryOwn !== null && probe.routine !== null) {
            const sum = probe.pressbOwn + probe.woodwarmOwn + probe.woodcarryOwn + probe.routine;
            if (sum !== probe.dailyTotal) problems.push('daily-sum ' + sum + ' != dailyTotal ' + probe.dailyTotal);
            const atDecision = row.morningDayTicks + probe.pressbOwn + probe.woodcarryOwn + probe.routine;
            if (ce.dayTicks !== null && ce.dayTicks !== undefined && atDecision !== ce.dayTicks)
              problems.push('decision-sum ' + atDecision + ' != classificationDayTicks ' + ce.dayTicks);
            if (ce.ticks !== null && ce.ticks !== undefined && (512 - ce.dayTicks) !== ce.ticks)
              problems.push('ticksLeft 512-dayTicks=' + (512 - ce.dayTicks) + ' != ticksToDayEnd ' + ce.ticks);
          } else problems.push('probe-incomplete');
          if (press && probe.pressbOwn !== null && probe.pressbOwn !== press.ticksSpent)
            problems.push('pressbOwn ' + probe.pressbOwn + ' != attempt ticksSpent ' + press.ticksSpent);
          if (!press && probe.pressbOwn !== null && probe.pressbOwn !== 0)
            problems.push('pressbOwn ' + probe.pressbOwn + ' != 0 with no press');
          if (problems.length) data.reconciliationMismatches.push({ leg: leg.name, seed, loopDay: row.loopDay, problems });
        }
      }
      const strands = extractStrands(stillDays.sort((a, b) => a - b));
      data.strands[leg.name] = data.strands[leg.name] || {};
      data.strands[leg.name][seed] = strands;
      legOut.seeds[seed] = seedRec;
    }
    data.legs[leg.name] = legOut;
  }
  // Attribution for every ticks-short evening.
  for (const rec of data.ticksShort) {
    const cpLeg = counterpartLeg(rec.leg);
    const cp = (index[cpLeg] && index[cpLeg][rec.seed] && index[cpLeg][rec.seed][rec.loopDay]) || null;
    let counterpartStatus;
    if (!cp) counterpartStatus = 'no-creek-evening';
    else if (!cp.gates) counterpartStatus = 'unclassified';
    else counterpartStatus = cp.gates.ticksGate ? 'not-ticks-short' : 'ticks-short';
    rec.counterpartLeg = cpLeg;
    rec.counterpartStatus = counterpartStatus;
    rec.counterpartTicksToDayEnd = cp ? cp.ticksToDayEnd : null;
    rec.counterpartRescued = cp ? cp.rescued : null;
    rec.counterpartRoutine = cp ? cp.probe.routine : null;
    rec.routineEqualCounterpart = (cp && rec.probe.routine !== null && cp.probe.routine !== null)
      ? (rec.probe.routine === cp.probe.routine) : null;
    if (rec.tickClass === 'ticks-short-alone' && rec.pressFired && rec.pressTicksSpent !== null
      && rec.shortfall !== null && rec.pressTicksSpent >= rec.shortfall && counterpartStatus === 'not-ticks-short') {
      rec.attribution = 'PRESS-DECISIVE';
    } else if (rec.pressFired && rec.pressTicksSpent !== null && rec.pressTicksSpent > 0) {
      rec.attribution = 'PRESS-CONTRIBUTING';
    } else {
      rec.attribution = 'ROUTINE-ONLY';
    }
    if (rec.tickClass !== 'ticks-short-alone') {
      rec.outcomeDecisiveGate = (!rec.gates.woodGate && !rec.gates.kcalGate) ? 'wood+kcal'
        : (!rec.gates.woodGate ? 'wood' : 'kcal');
    } else rec.outcomeDecisiveGate = 'ticks';
  }
  // Morning-behavior table: every strand morning on every strand leg.
  for (const leg of LEGS) {
    for (const seed of BANK) {
      const strands = (data.strands[leg.name] && data.strands[leg.name][seed]) || [];
      if (!strands.length) continue;
      const dir = path.join(root, corpusPrefix + '-' + leg.name);
      const file = path.join(dir, 'tickbudget-b-nighttravel-s' + seed + '.json');
      if (!fs.existsSync(file)) continue;
      const inst = JSON.parse(fs.readFileSync(file, 'utf8'));
      const morningsByDay = {};
      for (const m of (inst.mornings || [])) morningsByDay[m.loopDay] = m;
      for (const s of strands) {
        for (let d = s.start; d <= s.end; d++) {
          const ev = (index[leg.name][seed] || {})[d] || null;
          const m = morningsByDay[d] || null;
          data.morningTable.push({ leg: leg.name, seed, loopDay: d,
            strandStart: s.start, strandEnd: s.end,
            wakeTile: m ? m.tile : null, wakeCell: m ? (m.mx + ',' + m.my) : null,
            morningKcal: m ? m.kcal : null, morningWood: m ? m.morningWood : null,
            morningDayTicks: m ? m.morningDayTicks : null,
            morningTicksLeft: (m && m.morningDayTicks !== null && m.morningDayTicks !== undefined) ? (512 - m.morningDayTicks) : null,
            forageableCells: m ? (m.sweepAnalysis ? m.sweepAnalysis.forageableCells : null) : null,
            pressFired: ev ? ev.pressFired : null, pressTicksSpent: ev ? ev.pressTicksSpent : null,
            pressE: ev ? ev.pressE : null, pressSkip: ev ? ev.pressSkip : null,
            carryActed: ev ? ev.carryActed : null, carryTook: ev ? ev.carryTook : null,
            carrySkip: ev ? ev.carrySkip : null,
            eveningTickClass: ev ? ev.tickClass : null, eveningTicksToDayEnd: ev ? ev.ticksToDayEnd : null,
            eveningShortfall: ev ? ev.shortfall : null, eveningSkip: ev ? ev.skip : null,
            attribution: ev ? (ev.attribution || null) : null });
        }
      }
    }
  }
  // Summary.
  const alone = data.ticksShort.filter((r) => r.tickClass === 'ticks-short-alone');
  const plus = data.ticksShort.filter((r) => r.tickClass !== 'ticks-short-alone');
  const decisive = data.ticksShort.filter((r) => r.attribution === 'PRESS-DECISIVE');
  const contributing = data.ticksShort.filter((r) => r.attribution === 'PRESS-CONTRIBUTING');
  const routineOnly = data.ticksShort.filter((r) => r.attribution === 'ROUTINE-ONLY');
  const distinctSeeds = [...new Set(data.ticksShort.map((r) => r.seed))].sort((a, b) => a - b);
  const distinctLegs15215 = [...new Set(data.ticksShort.filter((r) => r.seed === 15215).map((r) => r.leg))].sort();
  data.summary = {
    creekEvenings: Object.values(data.legs).reduce((t, l) => t + l.creekEvenings, 0),
    stillEvenings: Object.values(data.legs).reduce((t, l) => t + l.stillEvenings, 0),
    rescuedEvenings: Object.values(data.legs).reduce((t, l) => t + l.rescuedEvenings, 0),
    ticksShortTotal: data.ticksShort.length,
    ticksShortAlone: alone.length, ticksShortPlus: plus.length,
    plusWood: data.ticksShort.filter((r) => r.tickClass === 'ticks-short-plus-wood').length,
    plusKcal: data.ticksShort.filter((r) => r.tickClass === 'ticks-short-plus-kcal').length,
    plusBoth: data.ticksShort.filter((r) => r.tickClass === 'ticks-short-plus-both').length,
    pressDecisive: decisive.length, pressContributing: contributing.length, routineOnly: routineOnly.length,
    distinctSeedsWithTicksShort: distinctSeeds, legs15215WithTicksShort: distinctLegs15215,
    reconciliationMismatches: data.reconciliationMismatches.length,
  };
  fs.mkdirSync(path.dirname(path.join(root, outPrefix + '-census.json')), { recursive: true });
  fs.writeFileSync(path.join(root, outPrefix + '-census.json'), JSON.stringify(data, null, 2));
  const mt = { rows: data.morningTable, count: data.morningTable.length };
  fs.writeFileSync(path.join(root, outPrefix + '-morning-table.json'), JSON.stringify(mt, null, 2));
  // Paired compare .md (per WOODWARM group, control vs variant, per seed).
  const lines = [];
  lines.push('# sim-tickbudget-b — paired compare (NOT an official panel run)');
  lines.push('');
  lines.push('Paired control-vs-variant on the pre-registered ticks metrics, per');
  lines.push('WOODWARM group, per seed. The official balance-panel driver cannot');
  lines.push('express the nighttravel+woodcarry+woodwarm strand stack or the');
  lines.push('ticks-short / shortfall / morning-tick-cost metrics (see prereg');
  lines.push('Panel section). This compare is attached because a paired comparison');
  lines.push('IS judged here; it is never presented as an official panel run.');
  lines.push('');
  for (const ww of [1, 0]) {
    const cLeg = LEGS.find((l) => l.woodwarm === ww && l.pressb === 0).name;
    const vLeg = LEGS.find((l) => l.woodwarm === ww && l.pressb === 1).name;
    lines.push('## WOODWARM=' + ww + ': ' + cLeg + ' vs ' + vLeg);
    lines.push('');
    lines.push('| seed | daysAlive c → v | maxWave c → v | creek c → v | still c → v | ticks-alone c → v | ticks-plus c → v | decisive c → v |');
    lines.push('|------|-----------------|---------------|-------------|-------------|-------------------|-----------------|---------------|');
    for (const seed of BANK) {
      const cs = (data.legs[cLeg].seeds[seed] || {});
      const vs = (data.legs[vLeg].seeds[seed] || {});
      const count = (legName, s, pred) => data.ticksShort.filter((r) => r.leg === legName && r.seed === s && pred(r)).length;
      lines.push('| ' + seed + ' | ' + (cs.daysAlive ?? '?') + ' → ' + (vs.daysAlive ?? '?')
        + ' | ' + (cs.maxWaveUnlocked ?? '?') + ' → ' + (vs.maxWaveUnlocked ?? '?')
        + ' | ' + (cs.creek ?? '?') + ' → ' + (vs.creek ?? '?')
        + ' | ' + (cs.still ?? '?') + ' → ' + (vs.still ?? '?')
        + ' | ' + count(cLeg, seed, (r) => r.tickClass === 'ticks-short-alone') + ' → ' + count(vLeg, seed, (r) => r.tickClass === 'ticks-short-alone')
        + ' | ' + count(cLeg, seed, (r) => r.tickClass !== 'ticks-short-alone') + ' → ' + count(vLeg, seed, (r) => r.tickClass !== 'ticks-short-alone')
        + ' | ' + count(cLeg, seed, (r) => r.attribution === 'PRESS-DECISIVE') + ' → ' + count(vLeg, seed, (r) => r.attribution === 'PRESS-DECISIVE') + ' |');
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(root, outPrefix + '-compare.md'), lines.join('\n'));
  console.log(JSON.stringify(data.summary, null, 2));
  console.log('wrote ' + outPrefix + '-census.json, -morning-table.json, -compare.md');
}

main();
