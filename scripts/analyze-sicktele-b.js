#!/usr/bin/env node
// scripts/analyze-sicktele-b.js — classify every roster exit in a
// trace-sicktele-b trace into exactly one bucket (see prereg):
//   TELE-DEATH | REGISTER-NO-TELE | REMOVAL-NO-REGISTER |
//   NON-DEATH-EXIT | UNEXPLAINED-DELTA
// A "delta-death" is an exit in the first three buckets where the person
// is dead by end of run (getPerson-equivalent: fallen entry, or a lethal
// hurt row healthAfter 0, or a removal with how killed/ambushed), plus
// any lethal hurt row with no tele even without a roster exit.
// Usage: node scripts/analyze-sicktele-b.js <trace.json> [trace.json...]
// Prints one JSON summary per trace to stdout.
'use strict';
const fs = require('fs');

function analyze(t) {
  // Entry snapshots in order (villageEats entry per day).
  const entries = t.daily.filter(d => d.when === 'entry').map(d => d.snap);
  const exits = [];
  for (let i = 0; i + 1 < entries.length; i++) {
    const a = entries[i], b = entries[i + 1];
    for (const vid of a.roster) {
      if (!b.roster.includes(vid)) exits.push({ vid, exitDay: b.day, lastSeenDay: a.day });
    }
  }
  // End-of-run exits: present at last entry, absent at final snapshot.
  const last = entries[entries.length - 1];
  if (last) {
    for (const vid of last.roster) {
      if (!t.finalSnap.roster.includes(vid)) exits.push({ vid, exitDay: t.finalSnap.day, lastSeenDay: last.day, endOfRun: true });
    }
  }
  const fallenIds = new Set((t.finalSnap.fallen || []).concat(...t.daily.map(d => d.snap.fallen || [])));
  const teleByVid = {};
  for (const tel of (t.teles || [])) (teleByVid[tel.who] = teleByVid[tel.who] || []).push(tel);
  const regByVid = {};
  for (const r of (t.registers || [])) (regByVid[r.vid] = regByVid[r.vid] || []).push(r);
  const remByVid = {};
  for (const r of (t.removals || [])) (remByVid[r.vid] = remByVid[r.vid] || []).push(r);
  const lethalByVid = {};
  for (const h of (t.hurts || [])) if (h.healthAfter === 0) (lethalByVid[h.vid] = lethalByVid[h.vid] || []).push(h);

  const classified = exits.map(ex => {
    const rems = remByVid[ex.vid] || [];
    // Removal nearest the exit interval (day in [lastSeenDay, exitDay], else any).
    const inWindow = rems.filter(r => r.day >= ex.lastSeenDay && r.day <= ex.exitDay);
    const rem = inWindow.length ? inWindow[inWindow.length - 1] : (rems.length ? rems[rems.length - 1] : null);
    const tels = teleByVid[ex.vid] || [];
    const tel = tels.length ? tels[tels.length - 1] : null;
    const regs = regByVid[ex.vid] || [];
    const reg = regs.length ? regs[regs.length - 1] : null;
    let bucket, mechanism;
    if (tel) { bucket = 'TELE-DEATH'; mechanism = `tele day ${tel.day} kind ${tel.kind} cause ${tel.cause}`; }
    else if (reg) { bucket = 'REGISTER-NO-TELE'; mechanism = `registerDeath day ${reg.day} kind ${reg.kind} cause ${reg.cause} caller ${reg.caller}`; }
    else if (rem && (rem.how === 'killed' || rem.how === 'ambushed')) { bucket = 'REMOVAL-NO-REGISTER'; mechanism = `removeVillager day ${rem.day} how ${rem.how} caller ${rem.caller}`; }
    else if (rem) { bucket = 'NON-DEATH-EXIT'; mechanism = `removeVillager day ${rem.day} how ${rem.how} caller ${rem.caller}`; }
    else { bucket = 'UNEXPLAINED-DELTA'; mechanism = 'no removal, no register, no tele in trace'; }
    const isDead = fallenIds.has(ex.vid) || !!(lethalByVid[ex.vid] || []).length ||
      (rem && (rem.how === 'killed' || rem.how === 'ambushed'));
    const deltaDeath = bucket !== 'NON-DEATH-EXIT' && isDead;
    const gap = deltaDeath && !tel;
    return { ...ex, bucket, mechanism, teleDay: tel ? tel.day : null,
      registerDay: reg ? reg.day : null, removal: rem || null,
      inFallen: fallenIds.has(ex.vid), lethalHurt: !!(lethalByVid[ex.vid] || []).length,
      isDead, deltaDeath, gap };
  });
  // Lethal hurts with no tele and no roster exit (should not happen, but
  // a death pipeline that never removes would be a gap of its own).
  const phantomLethal = Object.keys(lethalByVid).filter(vid =>
    !(teleByVid[vid] || []).length && !classified.some(c => c.vid === vid));
  const deltaDeaths = classified.filter(c => c.deltaDeath);
  const gaps = classified.filter(c => c.gap);
  const named = classified.filter(c => c.bucket !== 'UNEXPLAINED-DELTA').length;
  return { seed: t.seed, days: t.days, endReason: t.endReason,
    harnessDeaths: (t.harnessDeaths || []).length, traceTeles: (t.teles || []).length,
    registers: (t.registers || []).length, removals: (t.removals || []).length,
    exits: classified.length, named, coverage: classified.length ? named / classified.length : null,
    deltaDeaths: deltaDeaths.length, teleDeaths: deltaDeaths.filter(c => !c.gap).length,
    gaps: gaps.length, gapRate: deltaDeaths.length ? gaps.length / deltaDeaths.length : null,
    phantomLethal: phantomLethal.length, classified, phantomLethalVids: phantomLethal };
}

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: analyze-sicktele-b.js <trace.json>...'); process.exit(2); }
for (const f of files) {
  const t = JSON.parse(fs.readFileSync(f, 'utf8'));
  const a = analyze(t);
  console.log(JSON.stringify({ file: f, ...a, classified: a.classified.map(c => ({
    vid: c.vid, exitDay: c.exitDay, bucket: c.bucket, mechanism: c.mechanism,
    deltaDeath: c.deltaDeath, gap: c.gap })) }, null, 2));
}
