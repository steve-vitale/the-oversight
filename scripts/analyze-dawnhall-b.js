#!/usr/bin/env node
// analyze-dawnhall-b.js — dawn-hall fight-origin analysis
// (sim-dawnhall-b; prereg:
// evidence/2026-10-28/sim-dawnhall-b-prereg.md).
//
// Usage:
//   node scripts/analyze-dawnhall-b.js --corpus <dir>
//     [--seeds 10710,...,10725] [--out <file>]
// Prints a human summary and, with --out, writes the full
// machine-readable analysis (misses with their interval
// records, classification, wall numbers).
//
// Classification (prereg): a miss is TRACED iff the first
// inside->outside transition in its interval is either
// (a) a verb record (named verb + phase + args), or
// (b) a checkpoint transition evidencing a specific path:
//     a villagerId change (succession) or a say line that
//     names the exit ('push through the doors', 'dive
//     through the doors', 'duck through the doors').
// Anything else (checkpoint-interval-only with no verb and
// no evidenced path) is UNTRACED.
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };

function load(dir, seed) {
  const f = path.join(dir, `dawnhall-b-insideevening-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function isInside(p) { return p && p.inside === true && p.tile === 'haven'; }

function analyze(corpusDir, seeds) {
  const perSeed = [];
  const misses = [];
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
      if (isInside(m)) continue;
      sMiss++; missCount++;
      const evCp = cps.find((c) => c.checkpoint === 'evening' && c.loopDay === m.loopDay - 1);
      const moCp = cps.find((c) => c.checkpoint === 'morning' && c.loopDay === m.loopDay);
      const evSeq = evCp ? evCp.seq : -1;
      const moSeq = moCp ? moCp.seq : Infinity;
      const interval = [];
      for (const c of cps) if (c.seq > evSeq && c.seq < moSeq) interval.push({ kind: 'checkpoint', seq: c.seq, name: c.checkpoint, loopDay: c.loopDay, pos: c.pos, sayTail: c.sayTail || [] });
      for (const v of mvs) if (v.seq > evSeq && v.seq < moSeq) interval.push({ kind: 'verb', seq: v.seq, name: v.verb, loopDay: v.loopDay, phase: v.phase, args: v.args, before: v.before, after: v.after, ret: v.ret, sayTail: v.sayTail || [] });
      interval.sort((a, b) => a.seq - b.seq);
      // First inside->outside transition.
      let prevPos = prev; // evening position (inside)
      let first = null;
      for (const r of interval) {
        const pos = r.kind === 'verb' ? r.after : r.pos;
        if (isInside(prevPos) && !isInside(pos)) { first = { record: r, prevPos }; break; }
        prevPos = pos;
      }
      // Morning endpoint itself (if no interval record showed it).
      if (!first && moCp && isInside(prevPos) && !isInside(moCp.pos)) {
        first = { record: { kind: 'checkpoint', seq: moCp.seq, name: 'morning', loopDay: moCp.loopDay, pos: moCp.pos, sayTail: moCp.sayTail || [] }, prevPos };
      }
      let classification = 'untraced';
      let mover = null;
      if (first) {
        const r = first.record;
        if (r.kind === 'verb') {
          classification = 'traced-verb';
          const walkPrefix = interval.filter((x) => x.kind === 'verb' && x.seq < r.seq && x.phase === r.phase)
            .map((x) => ({ verb: x.name, args: x.args, to: { inside: x.after.inside, mx: x.after.mx, my: x.after.my } }));
          mover = { verb: r.name, phase: r.phase, args: r.args, walkPrefix, from: { inside: r.before.inside, mx: r.before.mx, my: r.before.my }, to: { inside: r.after.inside, mx: r.after.mx, my: r.after.my }, sayTail: r.sayTail };
        } else {
          const vidChanged = (first.prevPos.vid !== undefined && r.pos.vid !== undefined && first.prevPos.vid !== r.pos.vid);
          const exitLine = (r.sayTail || []).find((l) => /push through the doors|dive through the doors|duck through the doors/.test(l));
          if (vidChanged) { classification = 'traced-succession'; mover = { verb: null, phase: 'checkpoint:' + r.name, fromVid: first.prevPos.vid, toVid: r.pos.vid, to: { inside: r.pos.inside, mx: r.pos.mx, my: r.pos.my }, sayTail: r.sayTail }; }
          else if (exitLine) { classification = 'traced-exit-line'; mover = { verb: null, phase: 'checkpoint:' + r.name, exitLine, to: { inside: r.pos.inside, mx: r.pos.mx, my: r.pos.my }, sayTail: r.sayTail }; }
          else mover = { verb: null, phase: 'checkpoint:' + r.name, to: { inside: r.pos.inside, mx: r.pos.mx, my: r.pos.my }, sayTail: r.sayTail };
        }
      }
      // ---- Fight origin (sim-dawnhall-b prereg) ----
      const allOrigins = (j.fightOrigins || []);
      const intervalOrigins = allOrigins.filter((o) => o.seq > evSeq && o.seq < moSeq);
      const postSleepCp = cps.find((c) => c.checkpoint === 'post-sleep' && c.seq > evSeq && c.seq < moSeq);
      const postSleepFight = postSleepCp && postSleepCp.pos ? postSleepCp.pos.fight : null;
      const pendingAtPostSleep = !!(postSleepFight && postSleepFight.pending);
      const pendingAtPostSleepId = postSleepFight ? (postSleepFight.pendingMonsterId || null) : null;
      const fleeFight = (() => {
        if (!first) return null;
        const r = first.record;
        if (r.kind === 'verb') return (r.before && r.before.fight && r.before.fight.fight) || null;
        return (r.pos && r.pos.fight && r.pos.fight.fight) || null;
      })();
      const monsterFighters = fleeFight ? (fleeFight.fighters || []).filter((x) => x && x.kind === 'monster') : [];
      const primaryMid = monsterFighters.length ? (monsterFighters[0].monsterId || null) : null;
      const fleeSeq = first ? first.record.seq : moSeq;
      const creations = allOrigins.filter((o) => o.slot === 'creator' && o.trigger === 'startCombat'
        && o.fight && o.fight.fight && fleeFight && o.fight.fight.id === fleeFight.id && o.seq < fleeSeq);
      const creation = creations.length ? creations[creations.length - 1] : null;
      const PENDING_CREATORS = ['triggerEncounter', 'wandererTentBreach', 'drawFeastScavenger', 'havenRaidTick'];
      const pendingCreations = allOrigins.filter((o) => o.slot === 'creator' && PENDING_CREATORS.indexOf(o.trigger) >= 0
        && o.fight && o.fight.pending && o.fight.pendingMonsterId === primaryMid
        && o.seq > evSeq && (!creation || o.seq < creation.seq));
      const pendingCreation = pendingCreations.length ? pendingCreations[pendingCreations.length - 1] : null;
      const fallbackStack = !!(creation && (creation.stack || []).some((l) => /driveContests/.test(l)));
      const pendingRoute = !!(pendingCreation || (creation && creation.beforeFight && creation.beforeFight.pending)
        || (pendingAtPostSleep && pendingAtPostSleepId === primaryMid) || fallbackStack);
      const driveEntries = intervalOrigins.filter((o) => (o.slot === 'fight-drive' || o.slot === 'contest-drive' || o.slot === 'pending-drive')
        && o.fight && o.fight.fight && fleeFight && o.fight.fight.id === fleeFight.id);
      const originReasons = [];
      if (!fleeFight) originReasons.push('no-flee-fight');
      if (fleeFight && !monsterFighters.length) originReasons.push('no-monster-fighter');
      if (!creation) originReasons.push('no-startCombat-creation-for-flee-fight');
      if (pendingRoute && !pendingCreation) originReasons.push('pending-route-but-no-pending-creation');
      const fightOriginComplete = originReasons.length === 0;
      const fightOrigin = {
        complete: fightOriginComplete, incompleteReasons: originReasons,
        fleeFight: fleeFight ? { id: fleeFight.id, over: fleeFight.over, result: fleeFight.result, round: fleeFight.round, fighters: fleeFight.fighters } : null,
        monsterFighters: monsterFighters.map((x) => ({ key: x.key, monsterId: x.monsterId, name: x.name, hp: x.hp, maxHp: x.maxHp, mx: x.mx, my: x.my, veteran: x.veteran, veteranVariant: x.veteranVariant })),
        creation: creation ? { seq: creation.seq, phase: creation.phase, trigger: creation.trigger, args: creation.args, stack: creation.stack, sayTail: creation.sayTail, beforePending: creation.beforeFight ? { pending: creation.beforeFight.pending, pendingMonsterId: creation.beforeFight.pendingMonsterId } : null } : null,
        pendingCreation: pendingCreation ? { seq: pendingCreation.seq, phase: pendingCreation.phase, trigger: pendingCreation.trigger, stack: pendingCreation.stack, sayTail: pendingCreation.sayTail } : null,
        pendingRoute, fallbackStack,
        pendingAtPostSleep, pendingAtPostSleepId,
        pendingAtEvening: prev.fight ? { pending: !!prev.fight.pending, pendingMonsterId: prev.fight.pendingMonsterId || null } : null,
        driveEntries: driveEntries.map((o) => ({ seq: o.seq, phase: o.phase, slot: o.slot, trigger: o.trigger, sayTail: o.sayTail })),
        intervalOriginCount: intervalOrigins.length,
        intervalOrigins: intervalOrigins.map((o) => ({ seq: o.seq, phase: o.phase, slot: o.slot, trigger: o.trigger, stack: o.stack || null, sayTail: o.sayTail, fightId: (o.fight && o.fight.fight) ? o.fight.fight.id : null, pending: o.fight ? o.fight.pending : null, pendingMonsterId: o.fight ? o.fight.pendingMonsterId : null })),
      };
      misses.push({
        seed, morningLoopDay: m.loopDay, eveningLoopDay: m.loopDay - 1,
        fightOrigin,
        eveningOutcome: prev.eveningOutcome,
        eveningPos: { inside: prev.inside, mx: prev.mx, my: prev.my },
        morningPos: { inside: m.inside, mx: m.mx, my: m.my, tile: m.tile, mapPx: m.mapPx, mapPy: m.mapPy, vid: m.vid },
        classification, mover,
        intervalCount: interval.length,
        interval: interval.map((r) => ({ kind: r.kind, seq: r.seq, name: r.name, phase: r.phase || null, loopDay: r.loopDay, pos: r.kind === 'verb' ? { inside: r.after.inside, mx: r.after.mx, my: r.after.my, tile: r.after.tile, vid: r.after.vid, feasted: r.after.feasted } : { inside: r.pos.inside, mx: r.pos.mx, my: r.pos.my, tile: r.pos.tile, vid: r.pos.vid, feasted: r.pos.feasted }, sayTail: r.sayTail })),
        eveningSayTail: prev.eveningSayTail || [],
      });
    }
    perSeed.push({ seed, denom: sDenom, misses: sMiss, daysAlive: j.daysAlive, endReason: j.endReason, maxWaveUnlocked: j.maxWaveUnlocked, waveKills: j.waveKills, scaleLast: j.scaleLast, standingLast: j.standingLast });
    wall.daysAlive.push(j.daysAlive);
    wall.maxWave.push(j.maxWaveUnlocked);
    const wk = j.waveKills;
    wall.waveKills += (wk && typeof wk === 'object' ? Object.values(wk).reduce((t, v) => t + (v || 0), 0) : (wk || 0));
    wall.deaths.push(...(j.deaths || []));
    wall.scaleLast.push(j.scaleLast);
    wall.standingLast.push(j.standingLast);
  }
  const traced = misses.filter((m) => m.classification !== 'untraced').length;
  const originComplete = misses.filter((m) => m.fightOrigin && m.fightOrigin.complete).length;
  const expectedKeys = ['10712:21', '10720:18', '10722:30'];
  const expectedMisses = misses.filter((m) => expectedKeys.indexOf(m.seed + ':' + m.morningLoopDay) >= 0);
  const expectedOriginComplete = expectedMisses.filter((m) => m.fightOrigin && m.fightOrigin.complete).length;
  const sortedDays = [...wall.daysAlive].sort((a, b) => a - b);
  const medianDays = sortedDays.length ? sortedDays[Math.floor(sortedDays.length / 2)] : null;
  const deathCauses = {};
  for (const d of wall.deaths) deathCauses[d.cause || 'unknown'] = (deathCauses[d.cause || 'unknown'] || 0) + 1;
  return {
    corpusDir, seeds, denom, misses: missCount, traced, untraced: missCount - traced,
    traceCompleteness: missCount ? traced / missCount : null,
    originComplete, originCompleteness: missCount ? originComplete / missCount : null,
    expectedMisses: expectedMisses.length, expectedOriginComplete,
    expectedOriginCompleteness: expectedMisses.length ? expectedOriginComplete / expectedMisses.length : null,
    missList: misses, perSeed,
    wall: {
      medianDaysAlive: medianDays, maxWaveUnlocked: wall.maxWave,
      waveKillsTotal: wall.waveKills, deaths: wall.deaths.length,
      deathCauses, scaleLast: wall.scaleLast, standingLast: wall.standingLast,
      national: 0, table: 0, wins: 0,
      note: '30-day instances: national/table/wins not observable in this horizon; reported as 0, not omitted.',
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
  console.log(`dawnhall: denom=${a.denom} misses=${a.misses} traced=${a.traced} untraced=${a.untraced} completeness=${a.traceCompleteness === null ? 'n/a (0 misses)' : a.traceCompleteness}`);
  console.log(`  origin: complete=${a.originComplete}/${a.misses} expected3=${a.expectedOriginComplete}/${a.expectedMisses}`);
  for (const m of a.missList) {
    console.log(`  miss seed=${m.seed} morning=${m.morningLoopDay} evening=${m.eveningOutcome} (${m.eveningPos.mx},${m.eveningPos.my}) -> (${m.morningPos.mx},${m.morningPos.my}) ${m.classification} mover=${m.mover ? JSON.stringify(m.mover) : 'null'} intervalRecords=${m.intervalCount}`);
    const fo = m.fightOrigin || {};
    console.log(`    origin complete=${fo.complete} reasons=${JSON.stringify(fo.incompleteReasons)} fighters=${JSON.stringify(fo.monsterFighters)} creation=${fo.creation ? JSON.stringify(fo.creation) : 'null'} pendingCreation=${fo.pendingCreation ? JSON.stringify(fo.pendingCreation) : 'null'} pendingRoute=${fo.pendingRoute} pendingAtPostSleep=${fo.pendingAtPostSleep}:${fo.pendingAtPostSleepId} driveEntries=${(fo.driveEntries || []).length}`);
  }
  console.log(`  wall: medianDays=${a.wall.medianDaysAlive} maxWave=${JSON.stringify(a.wall.maxWaveUnlocked)} waveKills=${a.wall.waveKillsTotal} deaths=${a.wall.deaths} causes=${JSON.stringify(a.wall.deathCauses)} national=${a.wall.national} table=${a.wall.table} wins=${a.wall.wins}`);
  if (out) fs.writeFileSync(out, JSON.stringify(a, null, 2));
}
module.exports = { analyze };
