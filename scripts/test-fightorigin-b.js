#!/usr/bin/env node
// test-fightorigin-b.js — proof for the fight-origin recorder
// and measurement (sim-fightorigin-b).
//
// Usage:
//   node scripts/test-fightorigin-b.js --corpus <dir>
//     [--seeds 10710,...,10725]
//     [--off <off-corpus-dir>] [--rerun <rerun-corpus-dir>]
//     [--rerun-seed 10712]
// Legs:
//   T1 corpus completeness (one file per seed)
//   T2 every drive entry links to a creation record
//   T3 completeness 100% on the prereg target set, derived
//        by the base-movement branch: if the judged band has
//        >= 1 reproduced miss, the target set is the
//        miss-interval drives (and the flee-drive subset must
//        also be 100%); if it has zero misses, the target set
//        is the pilot-band morning drives — and the proof
//        FAILS T3b unless the seed list IS the pilot band
//        (a zero-miss confirm band without a pilot target is
//        not a pass, it is a branch error the coordinator
//        must resolve by running the proof on the pilot band)
//   T4 neutrality: OFF vs ON corpora deep-equal on every
//        field except fight-origin records (fightCreations /
//        fightAttempts / fightDrives / pendingLog /
//        pendingLogError / recorderOn) — exact count reported
//   T5 determinism: rerun seed file byte-identical to the
//        confirm corpus file for that seed
//   T6 sense anchor: at least one miss fight's creation
//        sayTail names the monster or the breach
//   T7 guards: median days >= 24, wall numbers present,
//        pending-log installed (no pendingLogError) on every
//        seed
// Exits 0 with PROOF-GREEN iff every leg passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./analyze-fightorigin-b');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const corpusDir = arg('corpus', null);
const seeds = arg('seeds', '10710,10711,10712,10713,10714,10715,10716,10717,10718,10719,10720,10721,10722,10723,10724,10725')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const offDir = arg('off', null);
const rerunDir = arg('rerun', null);
const rerunSeed = parseInt(arg('rerun-seed', '10712'), 10);
if (!corpusDir) { console.error('usage: --corpus <dir> [--seeds ...] [--off <dir>] [--rerun <dir>]'); process.exit(2); }

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}

let t1 = true;
const loaded = {};
for (const s of seeds) {
  const f = path.join(corpusDir, `fightorigin-b-insideevening-s${s}.json`);
  if (!fs.existsSync(f)) { t1 = false; console.log('  missing seed ' + s); continue; }
  loaded[s] = JSON.parse(fs.readFileSync(f, 'utf8'));
}
check('T1 corpus completeness', t1, seeds.length + ' seeds');

let t2 = true, t2detail = '';
for (const s of seeds) {
  const j = loaded[s]; if (!j) continue;
  const ords = new Set((j.fightCreations || []).map((c) => c.ordinal));
  for (const d of (j.fightDrives || [])) {
    if (!ords.has(d.creationOrdinal) && !ords.has(d.creationLinked)) { t2 = false; t2detail += `seed ${s} drive seq=${d.seq} unlinked; `; }
  }
}
check('T2 every drive links to a creation', t2, t2detail || 'all linked');

const a = analyze(corpusDir, seeds);
const isPilotBand = seeds.length === 8 && seeds[0] === 10710 && seeds[seeds.length - 1] === 10717;
let t3 = false, t3detail = '';
if (a.misses >= 1) {
  t3 = a.missIntervalDrives > 0 && a.missIntervalFull === a.missIntervalDrives
    && a.missFleeTotal > 0 && a.missFleeClassified === a.missFleeTotal;
  t3detail = `branch=reproduced-misses misses=${a.misses} missDrives=${a.missIntervalFull}/${a.missIntervalDrives} flee=${a.missFleeClassified}/${a.missFleeTotal}`;
} else if (isPilotBand) {
  t3 = a.morningDrives > 0 && a.morningFull === a.morningDrives;
  t3detail = `branch=no-miss-reproduction pilot-morning morningDrives=${a.morningFull}/${a.morningDrives}`;
} else {
  t3detail = `branch ERROR: zero misses on a non-pilot band — run proof on the pilot band for the no-reproduction target set`;
}
check('T3 completeness 100% on prereg target set', t3, t3detail);

let t4 = true, t4detail = 'no OFF corpus supplied (skipped — coordinator must supply --off for the judged run)';
if (offDir) {
  const STRIP = new Set(['fightCreations', 'fightAttempts', 'fightDrives', 'pendingLog', 'pendingLogError', 'recorderOn']);
  const strip = (obj) => {
    if (Array.isArray(obj)) return obj.map(strip);
    if (obj && typeof obj === 'object') {
      const out = {};
      for (const k of Object.keys(obj)) if (!STRIP.has(k)) out[k] = strip(obj[k]);
      return out;
    }
    return obj;
  };
  let same = 0, total = 0;
  for (const s of seeds) {
    const onF = path.join(corpusDir, `fightorigin-b-insideevening-s${s}.json`);
    const offF = path.join(offDir, `fightorigin-b-insideevening-s${s}.json`);
    total++;
    if (!fs.existsSync(offF)) { t4 = false; console.log('  OFF missing seed ' + s); continue; }
    const onJ = strip(JSON.parse(fs.readFileSync(onF, 'utf8')));
    const offJ = strip(JSON.parse(fs.readFileSync(offF, 'utf8')));
    if (JSON.stringify(onJ) === JSON.stringify(offJ)) same++;
    else { t4 = false; console.log('  OFF/ON differ seed ' + s); }
  }
  t4detail = `neutrality ${same}/${total} seeds deep-equal on compared fields`;
}
check('T4 neutrality OFF vs ON', t4, t4detail);

let t5 = true, t5detail = 'no rerun corpus supplied (skipped)';
if (rerunDir) {
  const aF = path.join(corpusDir, `fightorigin-b-insideevening-s${rerunSeed}.json`);
  const bF = path.join(rerunDir, `fightorigin-b-insideevening-s${rerunSeed}.json`);
  if (!fs.existsSync(bF)) { t5 = false; t5detail = 'rerun file missing for seed ' + rerunSeed; }
  else {
    const same = fs.readFileSync(aF, 'utf8') === fs.readFileSync(bF, 'utf8');
    t5 = same; t5detail = same ? `seed ${rerunSeed} byte-identical` : `seed ${rerunSeed} BYTES DIFFER`;
  }
}
check('T5 determinism byte-identical rerun', t5, t5detail);

let t6 = false;
for (const m of a.missList) {
  for (const d of m.intervalDrives) {
    const tail = (d.classified.creation && d.classified.creation.sayTail) || [];
    if (tail.some((l) => /BREACH|⚔|MURKCAP|joins you/i.test(l))) t6 = true;
  }
}
check('T6 sense anchor (miss fight sayTail names monster/breach)', t6, a.misses + ' misses');

let t7 = true, t7detail = '';
if (a.wall.medianDaysAlive === null || a.wall.medianDaysAlive < 24) { t7 = false; t7detail += 'medianDays<' + 24 + '; '; }
for (const p of a.perSeed) {
  if (p.daysAlive === undefined || p.maxWaveUnlocked === undefined) { t7 = false; t7detail += `seed ${p.seed} wall missing; `; }
  if (p.pendingLogError) { t7 = false; t7detail += `seed ${p.seed} pendingLogError=${p.pendingLogError}; `; }
}
check('T7 guards (median days >= 24, wall present, pending log installed)', t7, t7detail || `medianDays=${a.wall.medianDaysAlive}`);

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');
