#!/usr/bin/env node
// analyze-raidname-b1-b.js — staged-B1 leg analyzer
// (sim-raidname-b1-b; prereg:
// evidence/2026-10-29/sim-raidname-b1-b-prereg.md).
//
// Reads the ON corpus (STAGE_B1=1) and the OFF corpus
// (STAGE_B1=0) on identical seeds, links each staged
// event to its startCombat record, classifies it, checks
// pre-staging determinism OFF vs ON, and aggregates wall
// numbers (report-only).
//
// Classification (prereg, checked not assumed):
//   MISFIRE-B: raidLineFired && !pendingMatch &&
//     entityMatchCandidate (entry snapshot verified).
//   NON-MISFIRE: !raidLineFired on a verified staged fight.
//   UNCLASSIFIED: pendingMatch true, missing entry
//     snapshot, missing say tail, or unlinked event that
//     is not a recorded staging miss.
// Staging misses are counted separately and never enter
// the misfire rate denominator.
'use strict';
const fs = require('fs');
const path = require('path');

function classifyStagedFight(f) {
  if (!f) return 'unclassified';
  if (f.shadowAtEntry === undefined || f.originAtEntry === undefined) return 'unclassified';
  if (!f.originAtEntry || !f.originAtEntry.raidBorn) return 'unclassified';
  if (!Array.isArray(f.sayTail)) return 'unclassified';
  if (f.pendingMatch) return 'unclassified'; // isolation broken: shadow matched
  if (!f.entityMatchCandidate) return 'unclassified'; // entry snapshot fails B1
  return f.raidLineFired ? 'misfire-b' : 'non-misfire';
}

function loadCorpus(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue;
    const inst = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    out[inst.seed] = inst;
  }
  return out;
}

function fightSig(f) {
  return [f.kind || null, f.fightSpecies || null, !!f.raidLineFired].join('|');
}

function analyze(corpusDir, baseDir) {
  const on = loadCorpus(corpusDir);
  const off = loadCorpus(baseDir);
  const seeds = Object.keys(on).map(Number).sort((a, b) => a - b);
  const perSeed = [];
  let stagedConfigs = 0, misfires = 0, nonMisfires = 0, unclassified = 0, stagingMisses = 0;
  let detMismatches = [];
  let windowsOn = 0, windowsOff = 0, skippedShadow = 0;
  const wall = { scaleLast: {}, standingLast: [], maxWave: {}, wins: 0, daysAlive: [] };
  for (const seed of seeds) {
    const inst = on[seed];
    const base = off[seed] || null;
    windowsOn += (inst.windows || []).length;
    if (base) windowsOff += (base.windows || []).length;
    skippedShadow += (inst.windows || []).filter((w) => w.decision === 'skipped-shadow').length;
    wall.scaleLast[inst.scaleLast] = (wall.scaleLast[inst.scaleLast] || 0) + 1;
    wall.standingLast.push(inst.standingLast);
    wall.maxWave[inst.maxWaveUnlocked] = (wall.maxWave[inst.maxWaveUnlocked] || 0) + 1;
    if (inst.won) wall.wins++;
    wall.daysAlive.push(inst.daysAlive);
    const row = { seed, staged: [], detOk: null, detDetail: null };
    for (const ev of (inst.stagedEvents || [])) {
      if (ev.status === 'miss') {
        stagingMisses++;
        row.staged.push({ species: ev.species, loopDay: ev.loopDay, status: 'miss', reason: ev.missReason || null });
        continue;
      }
      if (ev.status !== 'linked' || ev.fightSeq === undefined) {
        unclassified++;
        row.staged.push({ species: ev.species, loopDay: ev.loopDay, status: 'unclassified', reason: 'unlinked-event' });
        continue;
      }
      const f = (inst.fights || [])[ev.fightSeq] || null;
      const cls = classifyStagedFight(f);
      stagedConfigs++;
      if (cls === 'misfire-b') misfires++;
      else if (cls === 'non-misfire') nonMisfires++;
      else unclassified++;
      row.staged.push({
        species: ev.species, loopDay: ev.loopDay, fightKind: ev.fightKind || (f && f.kind) || null,
        classification: cls,
        shadowAtEntry: f ? f.shadowAtEntry : null,
        originAtEntry: f ? f.originAtEntry : null,
        raidLineFired: f ? !!f.raidLineFired : null,
        pendingMatch: f ? !!f.pendingMatch : null,
        entityMatchCandidate: f ? !!f.entityMatchCandidate : null,
        sayFullLines: Array.isArray(inst.stagedSayFull) ? inst.stagedSayFull.length : null,
      });
      // Pre-staging determinism: ON fights before the staged
      // fight must equal OFF's first k fights (k = staged index).
      if (base) {
        const k = ev.fightSeq;
        const onPre = (inst.fights || []).slice(0, k).map(fightSig);
        const offPre = (base.fights || []).slice(0, k).map(fightSig);
        const ok = onPre.length === offPre.length && onPre.every((s, i) => s === offPre[i]);
        row.detOk = ok;
        if (!ok) {
          row.detDetail = { k, onPre, offPre };
          detMismatches.push(seed);
        }
      }
    }
    if (!row.staged.length) row.detOk = null;
    perSeed.push(row);
  }
  const median = (arr) => {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const rate = stagedConfigs ? misfires / stagedConfigs : null;
  let verdict;
  if (stagedConfigs < 8 || unclassified > 0 || detMismatches.length) verdict = 'INSUFFICIENT-DATA';
  else if (rate >= 0.75) verdict = 'DIAG-GO';
  else verdict = 'DIAG-NO-GO';
  return {
    seeds, seedCount: seeds.length,
    stagedConfigs, misfires, nonMisfires, unclassified, stagingMisses,
    misfireRate: rate,
    verdict,
    detMismatches,
    windowsOn, windowsOff, skippedShadow,
    wall: {
      scaleLast: wall.scaleLast, standingLast: wall.standingLast,
      maxWaveUnlocked: wall.maxWave, wins: wall.wins,
      medianDaysAlive: median(wall.daysAlive), maxDaysAlive: wall.daysAlive.length ? Math.max(...wall.daysAlive) : null,
      nationalTableWinsNote: 'NOT OBSERVABLE in 30-day instances (report-only, never zeros)',
    },
    perSeed,
  };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
  const corpus = get('--corpus'), base = get('--base-corpus'), out = get('--out');
  if (!corpus || !base || !out) {
    console.error('usage: node scripts/analyze-raidname-b1-b.js --corpus <on-dir> --base-corpus <off-dir> --out <json>');
    process.exit(2);
  }
  const res = analyze(corpus, base);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(JSON.stringify({
    seeds: res.seedCount, stagedConfigs: res.stagedConfigs, misfires: res.misfires,
    nonMisfires: res.nonMisfires, unclassified: res.unclassified, stagingMisses: res.stagingMisses,
    misfireRate: res.misfireRate, verdict: res.verdict,
    detMismatches: res.detMismatches, windowsOn: res.windowsOn, windowsOff: res.windowsOff,
    skippedShadow: res.skippedShadow,
  }, null, 2));
}

module.exports = { analyze, classifyStagedFight, fightSig };
