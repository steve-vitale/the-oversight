#!/usr/bin/env node
// pantrymealword-trace-a.js — stranded-night pantry-wording census
// (sim-pantrymealword-a; prereg: evidence/2026-11-04/sim-pantrymealword-a.md).
//
// Reuses the strandnarr census stack WITHOUT changing it: the same
// policy (bankfood(warmed(woodcarry(nighttravel))) over competent),
// the same env gates, the same recorder (scripts/policies/
// strandnarr-diag.js). The only addition is observational: for each
// stranded night, classify the camp-wild line in its sleep window
// (OLD vs NEW vs none) and join it to the following morning's upkeep
// access + pantry movement (from analyzeInstance's morning rows).
//
// A FALSE no-meal claim (the pre-registered primary metric) is a
// stranded night whose sleep window carries the OLD line AND whose
// following morning's upkeep shows havenStoresAccess='remote' with a
// pantry kcal gain > 0 (pantryDelta < 0 across the upkeep window).
//
// Env (all FATAL unless noted; same substrate gates as
// strandnarr-trace-b.js, which this driver calls through):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1
//   SEEDS (default: the 8 strandnarr pilot seeds)
//   DAYS (default 60) TAG (before|after, default before)
//   OUTDIR (default evidence/2026-11-04/sim-pantrymealword-a-corpus-<TAG>)
// Writes one judged JSON + one full-transcript JSON per seed. Failed
// writes retry (EPERM flap waited out, never forced); a still-failed
// write exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { oneInstance, analyzeInstance, sleepPair } = require('./strandnarr-trace-b');
const sn = require('./policies/strandnarr-diag');

const OLD_LINE = 'You camp wild tonight — no pantry meal. Eat from your pack.';
const NEW_LINE = 'You camp wild tonight — no hall meal, but the pantry still reaches you through System requisition. Eat from your pack tonight.';
const CAMP_WILD_RE = /camp wild tonight/i;

function isOldLine(t) { return t === OLD_LINE; }
function isNewLine(t) { return t === NEW_LINE; }
function isCampWildLine(t) { return CAMP_WILD_RE.test(t || ''); }

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

function assertEnv() {
  const fail = (m) => { console.error('FATAL: ' + m); process.exit(2); };
  if (process.env.COMPETENT_FEAST !== '0') fail('COMPETENT_FEAST=0 must be set explicitly');
  if (process.env.SEATDRIVE !== '0') fail('SEATDRIVE=0 must be set explicitly');
  if (process.env.PLENTYDEPRI !== '0') fail('PLENTYDEPRI=0 must be set explicitly');
  if (process.env.DEPOSITGATE !== '1') fail('DEPOSITGATE=1 must be set explicitly');
  if (process.env.WOODCARRY !== '1') fail('WOODCARRY must be 1');
  if (process.env.WOODWARM !== '0') fail('WOODWARM must be 0 (the strandnarr anchor leg)');
  if (process.env.POLICY !== 'nighttravel') fail('POLICY must be nighttravel');
  if (process.env.BANKFOOD !== '1') fail('BANKFOOD must be 1 for the variant leg');
  if (process.env.STRANDNARR !== '1') fail('STRANDNARR must be 1 for the census leg');
}

async function main() {
  assertEnv();
  const TAG = process.env.TAG || 'before';
  const SEEDS = (process.env.SEEDS || '17021,15003,15009,15091,15211,15215,15220,15221')
    .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-pantrymealword-a-corpus-' + TAG);
  let pooledStranded = 0, pooledFalse = 0, pooledHonest = 0, pooledOld = 0, pooledNew = 0, pooledSilent = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    const analysis = analyzeInstance(inst);
    const store = { lines: inst.transcript.lines, markers: inst.transcript.markers };
    const nights = [];
    for (const s of analysis.stranded) {
      const pair = sleepPair(inst.transcript.markers, s.loopDay);
      const winLines = pair ? sn.windowLines(store, pair.start, pair.end) : null;
      const campLines = winLines ? winLines.filter((l) => isCampWildLine(l.text)).map((l) => l.text) : [];
      const nightAccess = pair ? pair.start.access : null;
      const morning = analysis.mornings.find((m) => m.loopDay === s.loopDay + 1) || null;
      const pantryGain = (morning && morning.pantryDelta != null && morning.pantryDelta < 0)
        ? -morning.pantryDelta : 0;
      const morningRemote = !!(morning && (morning.accessValues || []).includes('remote'));
      const hasOld = campLines.some(isOldLine);
      const hasNew = campLines.some(isNewLine);
      const falseClaim = hasOld && morningRemote && pantryGain > 0;
      const honestLine = campLines.length > 0;
      nights.push({ loopDay: s.loopDay, tile: s.tile, outcome: s.outcome,
        sleptThrough: s.sleptThrough, nightAccess,
        campLines, hasOld, hasNew, honestLine,
        morning: morning ? { loopDay: morning.loopDay, accessValues: morning.accessValues,
          pantryDelta: morning.pantryDelta, pantryGain, mealKcal: morning.mealKcal,
          delta: morning.delta } : null,
        morningRemote, pantryGain, falseClaim });
    }
    const falseN = nights.filter((n) => n.falseClaim).length;
    const honestN = nights.filter((n) => n.honestLine).length;
    pooledStranded += nights.length; pooledFalse += falseN; pooledHonest += honestN;
    pooledOld += nights.filter((n) => n.hasOld).length;
    pooledNew += nights.filter((n) => n.hasNew).length;
    pooledSilent += nights.filter((n) => !n.honestLine).length;
    const judged = { tag: TAG, seed, daysAlive: inst.daysAlive, endReason: inst.endReason,
      gameDays: inst.gameDays, nights, pooled: { stranded: nights.length, falseClaims: falseN,
        honestLines: honestN, oldLines: nights.filter((n) => n.hasOld).length,
        newLines: nights.filter((n) => n.hasNew).length,
        silent: nights.filter((n) => !n.honestLine).length } };
    const transcript = inst.transcript.lines.map((l) => ({ idx: l.idx, phase: l.phase,
      loopDay: l.loopDay, part: l.part, text: l.text }));
    const okJ = tryWrite(path.join(OUTDIR, 'pantrymealword-' + TAG + '-s' + seed + '.json'), JSON.stringify(judged), 6);
    const okT = tryWrite(path.join(OUTDIR, 'pantrymealword-' + TAG + '-s' + seed + '-transcript.json'), JSON.stringify(transcript), 6);
    if (!okJ || !okT) { console.error('PANTRYMEALWORD WRITE FAIL seed=' + seed); process.exit(3); }
    console.log('pantrymealword tag=' + TAG + ' seed=' + seed + ' end=' + inst.endReason
      + ' days=' + inst.daysAlive + ' stranded=' + nights.length + ' false=' + falseN
      + ' honest=' + honestN + ' old=' + judged.pooled.oldLines + ' new=' + judged.pooled.newLines
      + ' silent=' + judged.pooled.silent + ' written');
  }
  console.log('POOLED tag=' + TAG + ' stranded=' + pooledStranded + ' falseClaims=' + pooledFalse
    + ' honestLines=' + pooledHonest + ' old=' + pooledOld + ' new=' + pooledNew + ' silent=' + pooledSilent);
  console.log('wrote ' + SEEDS.length + ' judged + transcript files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('PANTRYMEALWORD CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { OLD_LINE, NEW_LINE, isOldLine, isNewLine, isCampWildLine };
