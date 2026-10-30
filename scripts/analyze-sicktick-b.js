#!/usr/bin/env node
// scripts/analyze-sicktick-b.js — classify every sickness-damage step-up
// in trace-sicktick-b.js outputs. For each vid, consecutive sickness hurt
// rows; a step-up is damage > previous sickness damage for that vid.
// Classification uses the enclosing villageSicknessTick invocation's
// sick-record snapshot (name/severity/daysLeft), healer snapshot, caller,
// intervening invocations (record absent between = expiry + reinfection),
// day gap, and same-day starvation rows (starving phase flag).
// Usage: node scripts/analyze-sicktick-b.js <trace.json...> <summary-out.json>
// Prints a human summary; writes the summary JSON as the last arg when it
// ends in .json and more than one input is given... simpler: last arg is
// ALWAYS the summary out path; all preceding args are traces.
'use strict';
const fs = require('fs');

function enclosing(ticks, idx) {
  for (const t of ticks) if (idx >= t.hurtStart && idx < t.hurtEnd) return t;
  return null;
}
function analyzeOne(trace) {
  const { hurtRows, tickInvocations, deaths } = trace;
  const starveDays = {}; // vid -> Set(day)
  for (const r of hurtRows) {
    if (r.cause === 'starvation') {
      (starveDays[r.vid] = starveDays[r.vid] || new Set()).add(r.day);
    }
  }
  const byVid = {};
  for (const r of hurtRows) {
    if (r.cause === 'sickness' || /disease|gutrot|wound_fever/.test(r.cause)) {
      (byVid[r.vid] = byVid[r.vid] || []).push(r);
    }
  }
  const stepUps = [];
  const sequences = {};
  for (const [vid, rows] of Object.entries(byVid)) {
    sequences[vid] = rows.map(r => {
      const t = enclosing(tickInvocations, r.idx);
      const rec = t ? (t.sickBefore[vid] || null) : null;
      return { day: r.day, damage: r.damage, cause: r.cause, caller: r.caller,
        healthBefore: r.healthBefore, healthAfter: r.healthAfter,
        record: rec, healerHaven: t ? t.healersBefore.haven : null,
        healerHere: t ? t.healersBefore.here : null,
        starvingDay: !!(starveDays[vid] && starveDays[vid].has(r.day)),
        tickSeq: t ? t.seq : null };
    });
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1], cur = rows[i];
      if (!(cur.damage > prev.damage)) continue;
      const tp = enclosing(tickInvocations, prev.idx);
      const tc = enclosing(tickInvocations, cur.idx);
      const rp = tp ? tp.sickBefore[vid] : null;
      const rc = tc ? tc.sickBefore[vid] : null;
      // Was the vid sick in every tick invocation between the two rows?
      let absentBetween = false;
      if (tp && tc) {
        for (let s = tp.seq + 1; s < tc.seq; s++) {
          const inv = tickInvocations[s];
          if (inv && !inv.sickBefore[vid] && !inv.sickAfter[vid]) { absentBetween = true; break; }
        }
      }
      // daysLeft continuity for the same record: next tick's before.daysLeft
      // should equal previous tick's after.daysLeft (tick decrements by 1,
      // treatment may shorten further — continuity is a same-record hint,
      // not a proof by itself).
      const contHint = (rp && rc && rp.name === rc.name && rp.severity === rc.severity);
      let shape;
      if (!rp || !rc) shape = 'record-missing-snapshot';
      else if (tp && !tp.sickAfter[vid]) shape = 'new-record-after-gap';
      else if (absentBetween) shape = 'new-record-after-gap';
      else if (rp.name !== rc.name || rp.severity !== rc.severity) shape = 'record-changed-in-place-or-replaced';
      else shape = 'same-record-damage-changed';
      stepUps.push({ vid, prevDay: prev.day, prevDamage: prev.damage, curDay: cur.day,
        curDamage: cur.damage, prevCause: prev.cause, curCause: cur.cause,
        prevCaller: prev.caller, curCaller: cur.caller,
        prevRecord: rp, curRecord: rc, shape, absentBetween,
        healerChanged: !!(tp && tc && (tp.healersBefore.haven !== tc.healersBefore.haven ||
          tp.healersBefore.here !== tc.healersBefore.here)),
        prevHealer: tp ? tp.healersBefore : null, curHealer: tc ? tc.healersBefore : null,
        gapDays: cur.day - prev.day,
        starvingPrev: !!(starveDays[vid] && starveDays[vid].has(prev.day)),
        starvingCur: !!(starveDays[vid] && starveDays[vid].has(cur.day)),
        contHint });
    }
  }
  return { seed: trace.seed, days: trace.days, endReason: trace.endReason,
    deaths: (deaths || []).length, tickInvocations: tickInvocations.length,
    sicknessVids: Object.keys(sequences).length, stepUps, sequences };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) { console.error('usage: analyze-sicktick-b.js <trace.json...> <summary.json>'); process.exit(2); }
  const outPath = args[args.length - 1];
  const inputs = args.slice(0, -1);
  const perSeed = inputs.map(f => analyzeOne(JSON.parse(fs.readFileSync(f, 'utf8'))));
  fs.writeFileSync(outPath, JSON.stringify({ perSeed }, null, 2));
  for (const s of perSeed) {
    console.log(`seed ${s.seed}: days ${s.days} end ${s.endReason} deaths ${s.deaths} ` +
      `sickness-vids ${s.sicknessVids} step-ups ${s.stepUps.length}`);
    for (const u of s.stepUps) {
      console.log(`  STEP ${u.vid}: d${u.prevDay} -${u.prevDamage} (${u.prevCaller}, ` +
        `${u.prevRecord ? u.prevRecord.name + '/sev' + u.prevRecord.severity + '/dl' + u.prevRecord.daysLeft : 'no-rec'}, ` +
        `starving=${u.starvingPrev}) -> d${u.curDay} -${u.curDamage} (${u.curCaller}, ` +
        `${u.curRecord ? u.curRecord.name + '/sev' + u.curRecord.severity + '/dl' + u.curRecord.daysLeft : 'no-rec'}, ` +
        `starving=${u.starvingCur}) shape=${u.shape} gap=${u.gapDays}d healerChanged=${u.healerChanged}`);
    }
  }
  console.log('summary:', outPath);
}
main();
