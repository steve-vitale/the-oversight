#!/usr/bin/env node
// analyze-fightorigin-b.js — fight-origin completeness analysis
// (sim-fightorigin-b; prereg + amendment:
// evidence/2026-10-29/sim-fightorigin-b-prereg.md).
//
// Usage:
//   node scripts/analyze-fightorigin-b.js --corpus <dir>
//     [--seeds 10710,...,10725] [--out <file>]
// Prints a human summary and, with --out, writes the full
// machine-readable analysis.
//
// Morning interval (as in morningpersist): evening snapshot
// post-daily pre-sleep on loop-day M-1 -> morning snapshot at
// the next loop-day's daily wrapper, pre-daily (loop-day M).
// A fight-drive entry belongs to a morning interval iff its
// loopDay == M and its slot is not 'daily' (daily-slot drives
// are the previous loop-day's evening-step drives, which label
// M via the callIdx+1 convention but run before sleep).
// A miss is an evening-inside -> morning-outside pair.
// Classification (prereg, amended): pending-resolved first
// (pending-transition log match + driveContestsImpl caller
// stack, or pending true immediately before creation),
// then same-slot-live (creation slot == drive slot), then
// direct-live (created in an earlier slot, already live at
// drive entry). A record is FULL iff fighters exist at
// creation and at entry (player + every monster fighter with
// monsterId + wave + hp), the provenance class is one of
// the three, the slot is present, pending state is present
// before creation and at entry, and caller-stack lines are
// present. Anything else is UNCLASSIFIED and breaks GO.
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };

function load(dir, seed) {
  const f = path.join(dir, `fightorigin-b-insideevening-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function isInside(p) { return p && p.inside === true && p.tile === 'haven'; }
function monsterFighters(fighters) {
  return (fighters || []).filter((f) => f && f.kind === 'monster');
}
function fightersFull(fighters) {
  if (!fighters || !fighters.length) return false;
  if (!fighters.some((f) => f.kind === 'player')) return false;
  const ms = monsterFighters(fighters);
  if (!ms.length) return false;
  return ms.every((f) => f.monsterId && f.wave !== null && f.wave !== undefined && f.hp !== null && f.hp !== undefined);
}

function classifyDrive(j, drive) {
  const creation = (j.fightCreations || []).find((c) => c.ordinal === drive.creationOrdinal)
    || (j.fightCreations || []).find((c) => c.ordinal === drive.creationLinked) || null;
  const reasons = [];
  if (!creation) return { classification: 'unclassified', reason: 'no linked creation record', creation: null };
  if (!fightersFull(creation.fighters)) reasons.push('creation fighters incomplete');
  if (!fightersFull(drive.fightersAtEntry)) reasons.push('entry fighters incomplete');
  if (!drive.slot) reasons.push('no slot');
  if (!creation.stackLines || !creation.stackLines.length) reasons.push('no caller-stack lines');
  if (!creation.pendingBefore || drive.pendingAtEntry === undefined) reasons.push('missing pending state');
  const monsterId = (creation.fighters && monsterFighters(creation.fighters)[0] && monsterFighters(creation.fighters)[0].monsterId)
    || creation.argMonsterId || null;
  // Pending-resolved (a): transition log shows pending=true
  // with this monster id before the creation, and the caller
  // stack names driveContestsImpl (the harness resolver).
  let pendingResolvedA = false;
  if (monsterId && creation.foSeq !== undefined) {
    const hit = (j.pendingLog || []).find((e) => e.foSeq !== undefined && e.foSeq < creation.foSeq
      && e.pendingEncounter === true && e.pendingMonsterId === monsterId);
    const stackNamesResolver = (creation.stackLines || []).some((l) => l.includes('driveContestsImpl'));
    if (hit && stackNamesResolver) pendingResolvedA = true;
  } else if (monsterId && creation.seq !== undefined) {
    const hit = (j.pendingLog || []).find((e) => e.seq !== undefined && e.seq < creation.seq
      && e.pendingEncounter === true && e.pendingMonsterId === monsterId);
    const stackNamesResolver = (creation.stackLines || []).some((l) => l.includes('driveContestsImpl'));
    if (hit && stackNamesResolver) pendingResolvedA = true;
  }
  const pendingResolvedB = !!(creation.pendingBefore && creation.pendingBefore.pendingEncounter === true);
  if (pendingResolvedA || pendingResolvedB) {
    return reasons.length
      ? { classification: 'unclassified', reason: reasons.join('; '), creation, monsterId, pendingVia: pendingResolvedA ? 'transition-log+stack' : 'pending-before' }
      : { classification: 'pending-resolved', reason: null, creation, monsterId, pendingVia: pendingResolvedA ? 'transition-log+stack' : 'pending-before' };
  }
  if (creation.slot && drive.slot && creation.slot === drive.slot) {
    return reasons.length
      ? { classification: 'unclassified', reason: reasons.join('; '), creation, monsterId }
      : { classification: 'same-slot-live', reason: null, creation, monsterId };
  }
  // Direct-live: created in an earlier slot (creation seq <
  // drive seq) and already live at drive entry.
  if (creation.foSeq !== undefined && drive.foSeq !== undefined && creation.foSeq < drive.foSeq && drive.inCombat) {
    return reasons.length
      ? { classification: 'unclassified', reason: reasons.join('; '), creation, monsterId }
      : { classification: 'direct-live', reason: null, creation, monsterId };
  }
  return { classification: 'unclassified', reason: (reasons.length ? reasons.join('; ') : 'no provenance class matched (creation not before drive or not in combat at entry)'), creation, monsterId };
}

function analyze(corpusDir, seeds) {
  const perSeed = [];
  const misses = [];
  const morningDrives = []; // all drives in morning intervals
  let denom = 0, missCount = 0;
  const wall = { daysAlive: [], maxWave: [], waveKills: 0, deaths: [], scaleLast: [], standingLast: [] };
  for (const seed of seeds) {
    const j = load(corpusDir, seed);
    if (!j) { perSeed.push({ seed, missing: true }); continue; }
    const ev = {};
    for (const e of (j.evenings || [])) ev[e.loopDay] = e;
    const cps = (j.checkpoints || []);
    const mvs = (j.moves || []);
    let sDenom = 0, sMiss = 0;
    for (const m of (j.mornings || [])) {
      const prev = ev[m.loopDay - 1];
      if (!prev || !isInside(prev)) continue;
      sDenom++; denom++;
      // Morning-interval drives: loopDay == morning loop-day,
      // slot not 'daily' (see header).
      const intervalDrives = (j.fightDrives || []).filter((d) => d.loopDay === m.loopDay && d.slot !== 'daily')
        .map((d) => ({ seed, morningLoopDay: m.loopDay, drive: d, classified: classifyDrive(j, d) }));
      const isMiss = !isInside(m);
      if (isMiss) {
        sMiss++; missCount++;
        // Flee linkage: exitBuilding(true) moves in this
        // interval's loop-day with phase 'fight' — attach each
        // to the drive whose seq window contains it.
        const fleeMoves = mvs.filter((v) => v.loopDay === m.loopDay && v.phase === 'fight' && v.verb === 'exitBuilding'
          && Array.isArray(v.args) && v.args[0] === 'true' && v.after && v.after.inside === false);
        const evCp = cps.find((c) => c.checkpoint === 'evening' && c.loopDay === m.loopDay - 1);
        const moCp = cps.find((c) => c.checkpoint === 'morning' && c.loopDay === m.loopDay);
        const fleeDrives = [];
        for (const fm of fleeMoves) {
          const sorted = [...intervalDrives].sort((a, b) => (a.drive.seq || 0) - (b.drive.seq || 0));
          let owner = null;
          for (let i = 0; i < sorted.length; i++) {
            const nextSeq = (i + 1 < sorted.length) ? (sorted[i + 1].drive.seq || Infinity) : (moCp ? moCp.seq : Infinity);
            if ((sorted[i].drive.seq || 0) <= fm.seq && fm.seq < nextSeq) { owner = sorted[i]; break; }
          }
          fleeDrives.push({ moveSeq: fm.seq, ownerDriveSeq: owner ? owner.drive.seq : null, ownerClassification: owner ? owner.classified.classification : null });
        }
        misses.push({
          seed, morningLoopDay: m.loopDay, eveningLoopDay: m.loopDay - 1,
          eveningOutcome: prev.eveningOutcome,
          eveningPos: { inside: prev.inside, mx: prev.mx, my: prev.my },
          morningPos: { inside: m.inside, mx: m.mx, my: m.my, tile: m.tile, vid: m.vid },
          intervalDrives, fleeMoves: fleeMoves.map((v) => ({ seq: v.seq, args: v.args, from: { inside: v.before.inside, mx: v.before.mx, my: v.before.my }, to: { inside: v.after.inside, mx: v.after.mx, my: v.after.my }, sayTail: v.sayTail })),
          fleeDrives,
          eveningSayTail: prev.eveningSayTail || [],
        });
      }
      for (const d of intervalDrives) morningDrives.push(d);
    }
    perSeed.push({ seed, denom: sDenom, misses: sMiss, daysAlive: j.daysAlive, endReason: j.endReason, maxWaveUnlocked: j.maxWaveUnlocked, waveKills: j.waveKills, scaleLast: j.scaleLast, standingLast: j.standingLast, creations: (j.fightCreations || []).length, drives: (j.fightDrives || []).length, pendingLogError: j.pendingLogError || null });
    wall.daysAlive.push(j.daysAlive);
    wall.maxWave.push(j.maxWaveUnlocked);
    const wk = j.waveKills;
    wall.waveKills += (wk && typeof wk === 'object' ? Object.values(wk).reduce((t, v) => t + (v || 0), 0) : (wk || 0));
    wall.deaths.push(...(j.deaths || []));
    wall.scaleLast.push(j.scaleLast);
    wall.standingLast.push(j.standingLast);
  }
  const missDrives = misses.flatMap((m) => m.intervalDrives);
  const missFull = missDrives.filter((d) => d.classified.classification !== 'unclassified').length;
  const morningFull = morningDrives.filter((d) => d.classified.classification !== 'unclassified').length;
  const missFleeClassified = misses.flatMap((m) => m.fleeDrives).filter((f) => f.ownerClassification && f.ownerClassification !== 'unclassified').length;
  const missFleeTotal = misses.flatMap((m) => m.fleeDrives).length;
  const sortedDays = [...wall.daysAlive].sort((a, b) => a - b);
  const medianDays = sortedDays.length ? sortedDays[Math.floor(sortedDays.length / 2)] : null;
  const deathCauses = {};
  for (const d of wall.deaths) deathCauses[d.cause || 'unknown'] = (deathCauses[d.cause || 'unknown'] || 0) + 1;
  return {
    corpusDir, seeds, denom, misses: missCount, missList: misses,
    missIntervalDrives: missDrives.length, missIntervalFull: missFull,
    missIntervalCompleteness: missDrives.length ? missFull / missDrives.length : null,
    missFleeTotal, missFleeClassified,
    morningDrives: morningDrives.length, morningFull,
    morningCompleteness: morningDrives.length ? morningFull / morningDrives.length : null,
    perSeed,
    wall: {
      medianDaysAlive: medianDays, maxWaveUnlocked: wall.maxWave,
      waveKillsTotal: wall.waveKills, deaths: wall.deaths.length,
      deathCauses, scaleLast: wall.scaleLast, standingLast: wall.standingLast,
      national: null, table: null, wins: null,
      note: '30-day instances: national/table/wins NOT OBSERVABLE in this horizon; reported as null, not zero-movement.',
    },
  };
}

if (require.main === module) {
  const corpusDir = arg('corpus', null);
  const seeds = arg('seeds', '10710,10711,10712,10713,10714,10715,10716,10717,10718,10719,10720,10721,10722,10723,10724,10725')
    .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  const out = arg('out', null);
  if (!corpusDir) { console.error('usage: --corpus <dir> [--seeds ...] [--out <file>]'); process.exit(2); }
  const a = analyze(corpusDir, seeds);
  console.log(`fightorigin: denom=${a.denom} misses=${a.misses} missIntervalDrives=${a.missIntervalDrives} missFull=${a.missIntervalFull} missCompleteness=${a.missIntervalCompleteness} flee=${a.missFleeClassified}/${a.missFleeTotal} morningDrives=${a.morningDrives} morningFull=${a.morningFull} morningCompleteness=${a.morningCompleteness}`);
  for (const m of a.missList) {
    console.log(`  miss seed=${m.seed} morning=${m.morningLoopDay} (${m.eveningPos.mx},${m.eveningPos.my}) -> (${m.morningPos.mx},${m.morningPos.my}) drives=${m.intervalDrives.length} flee=${JSON.stringify(m.fleeDrives)}`);
    for (const d of m.intervalDrives) {
      const c = d.classified;
      console.log(`    drive seq=${d.drive.seq} slot=${d.drive.slot} creation=${d.drive.creationOrdinal} class=${c.classification} monster=${c.monsterId || '?'}${c.reason ? ' reason=' + c.reason : ''}`);
    }
  }
  console.log(`  wall: medianDays=${a.wall.medianDaysAlive} maxWave=${JSON.stringify(a.wall.maxWaveUnlocked)} waveKills=${a.wall.waveKillsTotal} deaths=${a.wall.deaths} national/table/wins=NOT-OBSERVABLE(30d)`);
  if (out) fs.writeFileSync(out, JSON.stringify(a, null, 2));
}
module.exports = { analyze, classifyDrive };
