#!/usr/bin/env node
// sim-muster-a-analyze.js — per-seed + pooled muster-formation analysis.
// Reads the splitter output dir (s<seed>.json), prints a JSON summary
// to stdout and a human table to stderr. Pure aggregation: no game
// loaded, no policy, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const LIB = require(path.join(__dirname, 'sim-muster-a-lib'));

const TITAN_IDS = ['herald', 'nielsen', 'finale', 'the_network'];
const dir = process.argv[2];
if (!dir) { console.error('Usage: node scripts/sim-muster-a-analyze.js <corpus-dir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();

function perTitan(seed, tid) {
  const traj = (seed.trajectory || []).filter(t => t.tid === tid);
  let omenMax = null, firstOmen2Day = null, yieldAtFirstOmen2 = null, linksAtFirstOmen2 = null;
  let musterMax = 0;
  traj.forEach(function (t) {
    if (t.omenStage != null && (omenMax == null || t.omenStage > omenMax)) omenMax = t.omenStage;
    if (firstOmen2Day == null && t.omenStage >= 2) { firstOmen2Day = t.day; yieldAtFirstOmen2 = t.yieldTotal; linksAtFirstOmen2 = t.linksActive; }
    if (t.size > musterMax) musterMax = t.size;
  });
  const last = traj.length ? traj[traj.length - 1] : null;
  const end = seed.endSnaps && seed.endSnaps[tid] ? seed.endSnaps[tid] : null;
  const endSize = end ? end.size : (last ? last.size : null);
  if (endSize != null && endSize > musterMax) musterMax = endSize;
  const fe = (seed.firstEvents && seed.firstEvents[tid]) || {};
  return {
    tid: tid, need: (traj.length ? traj[0].need : (end ? null : null)),
    omenStageMax: omenMax,
    firstOmen2Day: (fe.firstOmen2Day != null ? fe.firstOmen2Day : firstOmen2Day),
    yieldAtFirstOmen2: (fe.yieldAtFirstOmen2 != null ? fe.yieldAtFirstOmen2 : yieldAtFirstOmen2),
    linksAtFirstOmen2: (fe.linksAtFirstOmen2 != null ? fe.linksAtFirstOmen2 : linksAtFirstOmen2),
    yieldAtEnd: last ? last.yieldTotal : null,
    linksAtEnd: last ? last.linksActive : null,
    musterMax: musterMax, endSize: endSize,
    firstPositiveDay: (fe.firstPositiveDay != null ? fe.firstPositiveDay : null),
    trajEntries: traj.length,
    refusals: (seed.refusals || []).filter(r => r.mid === tid).length,
  };
}

const perSeed = [];
let heraldRefusals = 0, totalCalls = 0, seedsWithCall = 0, seedsWithMuster = 0;
const classCounts = {};
files.forEach(function (f) {
  const seed = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const ct = (seed.musterDiag && seed.musterDiag.callTotals) || { soundTitanCall: 0, titanCommitOwn: 0, titanSelfDo: 0, titanWarCouncil: 0 };
  const callsSounded = ct.soundTitanCall || 0;
  const titans = TITAN_IDS.map(tid => perTitan(seed, tid));
  // need: fill from trajectory need (first entry) else known titans.json values
  const NEEDS = { herald: 10, nielsen: 12, finale: 20, the_network: 20 };
  titans.forEach(function (t) { if (t.need == null) t.need = NEEDS[t.tid]; });
  const cls = LIB.classifySeed({ callsSounded: callsSounded, titans: titans });
  classCounts[cls.cls] = (classCounts[cls.cls] || 0) + 1;
  const hRef = (seed.refusals || []).filter(r => r.mid === 'herald').length;
  heraldRefusals += hRef;
  totalCalls += callsSounded;
  if (callsSounded > 0) seedsWithCall++;
  if (titans.some(t => t.musterMax > 0)) seedsWithMuster++;
  const sayKinds = {};
  (seed.sayLines || []).forEach(function (l) { sayKinds[l.kind] = (sayKinds[l.kind] || 0) + 1; });
  perSeed.push({
    seed: seed.seed, days: seed.gameDays, endReason: seed.endReason,
    maxWave: seed.maxWave, national: seed.national, table: seed.table, won: seed.won,
    endScaleRank: seed.endScaleRank, captureErrs: seed.captureErrs,
    mdErrs: seed.musterDiag ? seed.musterDiag.errs : null,
    verbs: ct, callsSounded: callsSounded,
    heraldRefusals: hRef, sayKinds: sayKinds, titans: titans,
    classification: cls.cls, classificationDetail: cls.detail,
    mdRefusalSnaps: seed.musterDiag ? seed.musterDiag.refusals.length : null,
  });
});

const summary = {
  seeds: perSeed.length,
  heraldRefusalsTotal: heraldRefusals,
  totalCallsSounded: totalCalls,
  seedsWithAnyCall: seedsWithCall,
  seedsWithAnyMuster: seedsWithMuster,
  classCounts: classCounts,
  perSeed: perSeed,
};
process.stdout.write(JSON.stringify(summary, null, 1) + '\n');
perSeed.forEach(function (s) {
  const t = s.titans.map(function (x) { return x.tid + ':omen' + x.omenStageMax + '/max' + x.musterMax + '/yEnd' + x.yieldAtEnd; }).join(' ');
  console.error(`s${s.seed}: ${s.classification} calls=${s.callsSounded} hRef=${s.heraldRefusals} days=${s.days} ${s.endReason} wave=${s.maxWave} | ${t}`);
});
console.error(`POOLED: seeds=${perSeed.length} heraldRefusals=${heraldRefusals} calls=${totalCalls} seedsWithCall=${seedsWithCall} seedsWithMuster=${seedsWithMuster} classes=${JSON.stringify(classCounts)}`);
