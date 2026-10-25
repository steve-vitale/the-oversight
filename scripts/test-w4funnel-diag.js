#!/usr/bin/env node
// scripts/test-w4funnel-diag.js — wave-4 kill-funnel analyzer for
// sim-w4funnel-a (scale-onramp axis, 2026-10-25, DIAG ONLY).
//
// Reads one corpus dir of test-w4funnel-diag-sweep.js rows
// (perseed-sim-w4funnel-a/s<seed>-armed.json) and writes
// analysis.json + prints the census tables. Pure analysis: no
// harness, no RNG, no game state — re-runnable over the same
// corpus with identical output.
//
// DEFINITIONS (from the pre-registration, repeated here so the
// analyzer is self-describing):
//   ARRIVAL = one world-monster birth with wave 4 (oldcore birth
//     joined to its spawnsrc spawn on seq; fled-recovery re-entry
//     is a NEW arrival with its own seq, reported separately).
//   OUTCOME classes, in precedence order:
//     still-present (seq in final present list, or in any daily
//       snapshot dated after its last removal — re-appearance
//       cancels the exit, per oldcore) >
//     pending-in-fight (seq in pendingLifts at run end) >
//     last removal kind mapped: player-fight-kill ->
//       killed-by-player-fight; villager-fight-kill ->
//       killed-by-villager-fight; raid-defense-kill ->
//       killed-by-defender-fight; aid-crisis-kill / trap-capture /
//       scripted-clear / raid-lingerer-sortie-kill ->
//       killed-other-cause; departure-* / monsterTurn-departure ->
//       departed; fled-record -> fled-record; player-fight-melt ->
//       melted; unclassified / other-named:* -> unknown.
//     No removal + not present + not pending -> vanished -> unknown.
//   UNKNOWN (for the >=95% classified rule) = untagged seq,
//     vanished, unclassified/other-named removal, pending-in-fight.
//   FOUGHT = at least one defwound resolve row or oldcore tbEnd
//     for the seq.
//   LIVING veterans (daily) = w5births daily rd5.veterans (last
//     point per day; duplicate-day disagreements flagged).
//   CUMULATIVE killers (daily) = distinct waveKillLog `by` with
//     w >= 4 and kill day <= that day. DIVERGENCE = cumulative -
//     living (never clamped; a negative value is reported as-is).
'use strict';
const fs = require('fs');
const path = require('path');

const KILL_KINDS = {
  'player-fight-kill': 'killed-by-player-fight',
  'villager-fight-kill': 'killed-by-villager-fight',
  'raid-defense-kill': 'killed-by-defender-fight',
  'aid-crisis-kill': 'killed-other-cause',
  'trap-capture': 'killed-other-cause',
  'scripted-clear': 'killed-other-cause',
  'raid-lingerer-sortie-kill': 'killed-other-cause',
  'departure-lost-trail': 'departed',
  'departure-watched-away': 'departed',
  'monsterTurn-departure': 'departed',
  'fled-record': 'fled-record',
  'player-fight-melt': 'melted',
};
function mapOutcomeKind(kind) {
  if (!kind) return 'unknown';
  if (KILL_KINDS[kind]) return KILL_KINDS[kind];
  return 'unknown';
}
function isKillOutcome(outcome) {
  return outcome === 'killed-by-player-fight' || outcome === 'killed-by-villager-fight'
    || outcome === 'killed-by-defender-fight' || outcome === 'killed-other-cause';
}

function analyzeW4funnel(row) {
  const seed = row.seed;
  const endDay = row.days | 0;
  const spawns = ((row.spawnsrc || {}).spawns || []).filter(s => (s.wave | 0) === 4);
  const births = ((row.oldcore || {}).births || []).filter(b => (b.wave | 0) === 4);
  const removals = ((row.oldcore || {}).removals || []).filter(r => (r.wave | 0) === 4);
  const tbEnds = ((row.oldcore || {}).tbEnds || []).filter(t => (t.wave | 0) === 4);
  const resolve = ((row.defwound || {}).resolveFights || []).filter(f => (f.wave | 0) === 4);
  const finalPresent = ((row.oldcore || {}).finalPresent || []).filter(p => (p.wave | 0) === 4);
  const pending = ((row.oldcore || {}).pendingLifts || []);
  const snapshots = ((row.oldcore || {}).snapshots || []);
  const logEntries = ((row.raftdraft || {}).logEntries || []).filter(e => (e.w | 0) === 4);
  const logEntriesW5plus = ((row.raftdraft || {}).logEntries || []).filter(e => (e.w | 0) >= 5);

  const spawnBySeq = new Map();
  for (const s of spawns) if (s.seq != null) spawnBySeq.set(s.seq, s);
  const birthBySeq = new Map();
  for (const b of births) if (b.seq != null) birthBySeq.set(b.seq, b);
  const joinIssues = [];
  for (const s of spawns) if (s.seq == null) joinIssues.push('spawn-untagged:' + s.type);
  for (const b of births) if (b.seq == null) joinIssues.push('birth-untagged:' + b.type);
  const spawnOnly = [];
  for (const s of spawns) if (s.seq != null && !birthBySeq.has(s.seq)) spawnOnly.push(s.seq);
  const birthOnly = [];
  for (const b of births) if (b.seq != null && !spawnBySeq.has(b.seq)) birthOnly.push(b.seq);

  const removalsBySeq = new Map();
  for (const r of removals) {
    if (r.seq == null) continue;
    if (!removalsBySeq.has(r.seq)) removalsBySeq.set(r.seq, []);
    removalsBySeq.get(r.seq).push(r);
  }
  const resolveBySeq = new Map();
  for (const f of resolve) {
    if (f.seq == null) continue;
    if (!resolveBySeq.has(f.seq)) resolveBySeq.set(f.seq, []);
    resolveBySeq.get(f.seq).push(f);
  }
  const tbBySeq = new Map();
  for (const t of tbEnds) {
    if (t.seq == null) continue;
    if (!tbBySeq.has(t.seq)) tbBySeq.set(t.seq, []);
    tbBySeq.get(t.seq).push(t);
  }
  const presentSeqs = new Set(finalPresent.map(p => p.seq).filter(s => s != null));
  const pendingSeqs = new Set(pending.map(p => p.seq).filter(s => s != null));
  // Snapshot presence after a removal day cancels the exit.
  const snapshotDaysBySeq = new Map();
  for (const snap of snapshots) {
    const day = snap.day | 0;
    for (const p of (snap.present || [])) {
      if (p.seq == null) continue;
      if (!snapshotDaysBySeq.has(p.seq)) snapshotDaysBySeq.set(p.seq, []);
      snapshotDaysBySeq.get(p.seq).push(day);
    }
  }

  const arrivals = [];
  const untaggedArrivals = [];
  for (const b of births) {
    if (b.seq == null) { untaggedArrivals.push({ type: b.type, day: b.day, src: b.src || null }); continue; }
    const sp = spawnBySeq.get(b.seq) || null;
    arrivals.push({ seq: b.seq, type: b.type, day: b.day, src: (sp && sp.src) || b.src || null, srcAgree: !sp || (sp.src === b.src), spawnDay: sp ? sp.day : null });
  }
  // Spawns with no birth record are arrivals too (join gap, counted
  // separately so the two funnels reconcile, never silently added).
  for (const s of spawns) {
    if (s.seq != null && !birthBySeq.has(s.seq)) {
      arrivals.push({ seq: s.seq, type: s.type, day: s.day, src: s.src || null, srcAgree: null, spawnDay: s.day, joinGap: 'spawn-only' });
    }
  }
  arrivals.sort((a, b) => (a.day - b.day) || (a.seq - b.seq));

  const outcomeCounts = {};
  const detail = [];
  for (const a of arrivals) {
    const rems = (removalsBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const res = (resolveBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const tbs = (tbBySeq.get(a.seq) || []).slice().sort((x, y) => (x.day - y.day));
    const fought = (res.length + tbs.length) > 0;
    let outcome, outcomeKind = null, outcomeDay = null;
    const lastRem = rems.length ? rems[rems.length - 1] : null;
    const reappeared = lastRem && (snapshotDaysBySeq.get(a.seq) || []).some(d => d > (lastRem.day | 0));
    if (presentSeqs.has(a.seq) || reappeared) {
      outcome = 'still-present'; outcomeDay = null;
    } else if (pendingSeqs.has(a.seq)) {
      outcome = 'pending-in-fight'; outcomeDay = null;
    } else if (lastRem) {
      outcome = mapOutcomeKind(lastRem.kind); outcomeKind = lastRem.kind; outcomeDay = lastRem.day;
    } else {
      outcome = 'unknown'; outcomeKind = 'vanished';
    }
    const known = outcome !== 'unknown' && outcome !== 'pending-in-fight';
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
    // Kill-log match for kill outcomes: a log entry with the same
    // monster id and kill day as the removal day.
    let logMatch = null;
    if (isKillOutcome(outcome) && outcomeDay != null) {
      logMatch = logEntries.find(e => e.mid === a.type && (e.d | 0) === (outcomeDay | 0)) || null;
    }
    detail.push({
      seq: a.seq, type: a.type, arrivalDay: a.day, src: a.src, srcAgree: a.srcAgree,
      daysAvailable: endDay - (a.day | 0),
      fought, fights: res.length + tbs.length,
      resolveFights: res.length, tbFights: tbs.length,
      resolveOutcomes: res.map(f => f.outcome), tbResults: tbs.map(t => t.result),
      firstFightDay: (res.concat(tbs).length ? Math.min(...res.concat(tbs).map(f => f.day | 0)) : null),
      outcome, outcomeKind, outcomeDay, reappearedAfterRemoval: !!reappeared,
      multiRemoval: rems.length > 1, removals: rems.length,
      logMatch: logMatch ? { d: logMatch.d, by: logMatch.by, via: logMatch.via } : null,
      known,
    });
  }
  const knownCount = detail.filter(d => d.known).length;
  const unknownCount = detail.length - knownCount;
  const untaggedCount = untaggedArrivals.length;

  // Funnel stages.
  const foughtCount = detail.filter(d => d.fought).length;
  const neverFought = detail.filter(d => !d.fought).length;
  const foughtNotKilled = detail.filter(d => d.fought && !isKillOutcome(d.outcome)).length;
  const killed = detail.filter(d => isKillOutcome(d.outcome)).length;
  const killsWithLogMatch = detail.filter(d => isKillOutcome(d.outcome) && d.logMatch).length;
  const killsWithoutLogMatch = killed - killsWithLogMatch;

  // Kill-log reconciliation (both directions).
  const killedKeys = new Set(detail.filter(d => isKillOutcome(d.outcome) && d.outcomeDay != null).map(d => d.type + '@' + d.outcomeDay));
  const logWithoutArrival = logEntries.filter(e => !killedKeys.has(e.mid + '@' + (e.d | 0)));

  // Daily living-vs-cumulative series.
  const dailyPoints = {};
  let dupDays = 0, dupDisagreements = 0;
  for (const p of (((row.w5births || {}).days) || [])) {
    const day = p.day | 0;
    const vet = (p.rd5 && typeof p.rd5.veterans === 'number') ? p.rd5.veterans : null;
    if (dailyPoints[day] !== undefined) {
      dupDays++;
      if (dailyPoints[day] !== vet) dupDisagreements++;
    }
    dailyPoints[day] = vet; // last point per day wins
  }
  const seriesDays = Object.keys(dailyPoints).map(Number).sort((a, b) => a - b);
  const cumKillersByDay = {};
  {
    const seen = new Set();
    const byDay = {};
    for (const e of (((row.raftdraft || {}).logEntries) || []).filter(x => (x.w | 0) >= 4)) {
      const d = e.d | 0;
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(e.by);
    }
    const daysSorted = Object.keys(byDay).map(Number).sort((a, b) => a - b);
    for (const d of daysSorted) for (const by of byDay[d]) seen.add(by === null || by === undefined ? '\0null' : String(by));
    // Cumulative at each series day = distinct killers with kill day <= day.
    for (const sd of seriesDays) {
      const s2 = new Set();
      for (const e of (((row.raftdraft || {}).logEntries) || []).filter(x => (x.w | 0) >= 4)) {
        if ((e.d | 0) <= sd) s2.add(e.by === null || e.by === undefined ? '\0null' : String(e.by));
      }
      cumKillersByDay[sd] = s2.size;
    }
  }
  const series = seriesDays.map(d => ({
    day: d, living: dailyPoints[d],
    cumulative: cumKillersByDay[d],
    divergence: (dailyPoints[d] === null ? null : cumKillersByDay[d] - dailyPoints[d]),
  }));
  const livingDays1 = series.filter(s => (s.living || 0) >= 1).length;
  const livingDays2 = series.filter(s => (s.living || 0) >= 2).length;
  const maxLiving = series.reduce((m, s) => Math.max(m, s.living || 0), 0);
  const maxCumulative = series.reduce((m, s) => Math.max(m, s.cumulative || 0), 0);
  const maxDivergence = series.reduce((m, s) => (s.divergence === null ? m : Math.max(m, s.divergence)), 0);
  const endSeries = series.length ? series[series.length - 1] : null;
  const endLivingFromSeries = endSeries ? endSeries.living : null;
  const endCumulativeFromSeries = endSeries ? endSeries.cumulative : null;
  // End-state pair, independent of the series bound: cumulative
  // through the run's end day (the full log, not just kills before
  // the last daily point) vs living killers from the post-run
  // killer-status snapshot. A kill after the last daily point
  // shows up here even when the series cannot see it.
  const cumulativeThroughEnd = new Set(
    (((row.raftdraft || {}).logEntries) || []).filter(x => (x.w | 0) >= 4)
      .map(e => (e.by === null || e.by === undefined) ? '\0null' : String(e.by)),
  ).size;

  // Killer end status (from the sweep's killer-status snapshot).
  const ks = row.killerStatus || {};
  const killers = (ks.killers || []).map(k => ({
    vid: k.vid, kills4: k.kills4, firstDay: k.firstDay, lastDay: k.lastDay, vias: k.vias,
    isScholar: !!k.isScholar, inRoster: k.inRoster, inFallen: k.inFallen,
    vpFound: k.vpFound, vpDead: k.vpDead, gateLiving: k.gateLiving,
    status: k.isScholar ? 'living-scholar'
      : k.gateLiving === true ? 'living-villager'
      : k.vpDead === true ? 'dead'
      : k.vpFound === false ? 'not-a-person-record'
      : 'not-counted-unknown',
  }));
  const livingKillersAtEnd = killers.filter(k => k.gateLiving === true).length;
  const deadKillersAtEnd = killers.filter(k => k.status === 'dead').length;
  const notCountedKillersAtEnd = killers.filter(k => k.gateLiving !== true && k.status !== 'dead').length;

  // Raid-draft verification: every wave-4 pool entity at raid time
  // traces to a spawn seq.
  const poolW4 = [];
  for (const raid of (((row.spawnsrc || {}).raids) || [])) {
    for (const p of (raid.pool || [])) if ((p.wave | 0) === 4) poolW4.push({ raidDay: raid.day, seq: p.seq, src: p.src, type: p.type });
  }
  const poolTraced = poolW4.filter(p => p.seq != null && spawnBySeq.has(p.seq)).length;
  const poolUntraced = poolW4.length - poolTraced;

  // Arrival source vocabulary (all waves, for the raid-draft check).
  const allSrcs = {};
  for (const s of ((row.spawnsrc || {}).spawns || [])) allSrcs[s.src || 'unknown'] = (allSrcs[s.src || 'unknown'] || 0) + 1;

  // Stage losses for the largest-loss verdict.
  const stageLosses = [
    { stage: 'never-fought', count: neverFought, shareOfArrivals: detail.length ? neverFought / detail.length : 0 },
    { stage: 'fought-not-killed', count: foughtNotKilled, shareOfArrivals: detail.length ? foughtNotKilled / detail.length : 0, shareOfFought: foughtCount ? foughtNotKilled / foughtCount : 0 },
    { stage: 'killer-not-living-at-end', count: Math.max(0, killed - livingKillersAtEnd), shareOfArrivals: detail.length ? Math.max(0, killed - livingKillersAtEnd) / detail.length : 0, note: 'kills minus living wave-4 killers at end (kills and killers differ when one killer has 2+ kills)' },
  ];
  // Note: killer-not-living uses kills, not killers, so it can
  // exceed the killed count only if kills > killers; it is a
  // veteran-stage loss, not an arrival-stage loss, and is compared
  // on count for the headline only when kills > 0.
  const largestStage = stageLosses.slice().sort((a, b) => b.count - a.count)[0] || null;
  const largestOutcome = Object.keys(outcomeCounts).sort((a, b) => outcomeCounts[b] - outcomeCounts[a])[0] || null;

  return {
    seed, endDay, endReason: row.endReason || null, won: row.won || 0,
    waveReach: row.waveReach || 1, nationalEver: row.nationalEver || 0,
    arrivals: detail.length, untaggedArrivals, untaggedCount,
    joinIssues, spawnOnly, birthOnly,
    arrivalDays: detail.map(d => d.arrivalDay),
    arrivalSrcCounts: detail.reduce((m, d) => { m[d.src || 'unknown'] = (m[d.src || 'unknown'] || 0) + 1; return m; }, {}),
    fledRecoveryArrivals: detail.filter(d => d.src === 'fled-recovery').length,
    freshArrivals: detail.filter(d => d.src !== 'fled-recovery').length,
    outcomeCounts, largestOutcome,
    knownCount, unknownCount,
    classifiedShare: detail.length ? knownCount / detail.length : 0,
    foughtCount, neverFought, foughtNotKilled, killed, killsWithLogMatch, killsWithoutLogMatch,
    logEntries4: logEntries.length, logWithoutArrival: logWithoutArrival.map(e => ({ d: e.d, mid: e.mid, by: e.by, via: e.via })),
    logW5plus: logEntriesW5plus.length,
    stageLosses, largestStage,
    series, livingDays1, livingDays2, maxLiving, maxCumulative, maxDivergence,
    endLivingFromSeries, endCumulativeFromSeries, cumulativeThroughEnd,
    endDivergenceSnapshot: cumulativeThroughEnd - livingKillersAtEnd,
    dupDays, dupDisagreements,
    killers, livingKillersAtEnd, deadKillersAtEnd, notCountedKillersAtEnd,
    poolW4: poolW4.length, poolTraced, poolUntraced,
    poolW4Detail: poolW4,
    allSrcs,
    detail,
  };
}

function rollup(perSeed) {
  const sum = (f) => perSeed.reduce((t, s) => t + (f(s) || 0), 0);
  const outcomeCounts = {};
  for (const s of perSeed) for (const k of Object.keys(s.outcomeCounts)) outcomeCounts[k] = (outcomeCounts[k] || 0) + s.outcomeCounts[k];
  const srcCounts = {};
  for (const s of perSeed) for (const k of Object.keys(s.arrivalSrcCounts)) srcCounts[k] = (srcCounts[k] || 0) + s.arrivalSrcCounts[k];
  const arrivals = sum(s => s.arrivals);
  const known = sum(s => s.knownCount);
  const stageTotals = {};
  for (const s of perSeed) for (const st of s.stageLosses) stageTotals[st.stage] = (stageTotals[st.stage] || 0) + st.count;
  const largestStage = Object.keys(stageTotals).sort((a, b) => stageTotals[b] - stageTotals[a])[0] || null;
  const largestOutcome = Object.keys(outcomeCounts).sort((a, b) => outcomeCounts[b] - outcomeCounts[a])[0] || null;
  return {
    seeds: perSeed.length, arrivals, known, unknown: arrivals - known,
    classifiedShare: arrivals ? known / arrivals : 0,
    untagged: sum(s => s.untaggedCount),
    outcomeCounts, largestOutcome,
    srcCounts,
    fledRecoveryArrivals: sum(s => s.fledRecoveryArrivals),
    freshArrivals: sum(s => s.freshArrivals),
    fought: sum(s => s.foughtCount), neverFought: sum(s => s.neverFought),
    foughtNotKilled: sum(s => s.foughtNotKilled), killed: sum(s => s.killed),
    killsWithLogMatch: sum(s => s.killsWithLogMatch), killsWithoutLogMatch: sum(s => s.killsWithoutLogMatch),
    logEntries4: sum(s => s.logEntries4),
    logWithoutArrival: perSeed.reduce((t, s) => t + s.logWithoutArrival.length, 0),
    stageTotals, largestStage,
    livingDays1: sum(s => s.livingDays1), livingDays2: sum(s => s.livingDays2),
    maxLiving: Math.max(...perSeed.map(s => s.maxLiving)),
    maxCumulative: Math.max(...perSeed.map(s => s.maxCumulative)),
    maxDivergence: Math.max(...perSeed.map(s => s.maxDivergence)),
    livingKillersAtEnd: sum(s => s.livingKillersAtEnd),
    deadKillersAtEnd: sum(s => s.deadKillersAtEnd),
    notCountedKillersAtEnd: sum(s => s.notCountedKillersAtEnd),
    poolW4: sum(s => s.poolW4), poolTraced: sum(s => s.poolTraced), poolUntraced: sum(s => s.poolUntraced),
  };
}

async function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-sim-w4funnel-a');
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678').split(',').map(s => parseInt(s.trim(), 10));
  const perSeed = [];
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
    perSeed.push(analyzeW4funnel(row));
  }
  const band = rollup(perSeed);
  const out = { label: 'sim-w4funnel-a analysis', seeds, perSeed, band, generated: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('\n=== sim-w4funnel-a funnel analysis ===');
  console.log(`  arrivals=${band.arrivals} known=${band.known} unknown=${band.unknown} classifiedShare=${(band.classifiedShare * 100).toFixed(1)}% untagged=${band.untagged}`);
  console.log(`  outcomes: ${JSON.stringify(band.outcomeCounts)} (largest: ${band.largestOutcome})`);
  console.log(`  sources: ${JSON.stringify(band.srcCounts)} (fresh=${band.freshArrivals} fled-recovery=${band.fledRecoveryArrivals})`);
  console.log(`  fought=${band.fought} neverFought=${band.neverFought} foughtNotKilled=${band.foughtNotKilled} killed=${band.killed} (log-matched=${band.killsWithLogMatch} unmatched=${band.killsWithoutLogMatch})`);
  console.log(`  stages: ${JSON.stringify(band.stageTotals)} (largest: ${band.largestStage})`);
  console.log(`  veterans: livingDays>=1=${band.livingDays1} livingDays>=2=${band.livingDays2} maxLiving=${band.maxLiving} maxCumulative=${band.maxCumulative} maxDivergence=${band.maxDivergence}`);
  console.log(`  killers at end: living=${band.livingKillersAtEnd} dead=${band.deadKillersAtEnd} not-counted=${band.notCountedKillersAtEnd}`);
  console.log(`  raid pool wave-4: ${band.poolW4} traced=${band.poolTraced} untraced=${band.poolUntraced}`);
  console.log(`  log entries w4=${band.logEntries4} without arrival=${band.logWithoutArrival}`);
  for (const s of perSeed) {
    console.log(`  seed ${s.seed}: end d${s.endDay} ${s.endReason} wave=${s.waveReach} nat=${s.nationalEver} arrivals=${s.arrivals} (${s.detail.map(d => d.type + '@d' + d.arrivalDay + ':' + d.src + '->' + d.outcome).join('; ')}) livingDays1=${s.livingDays1} livingDays2=${s.livingDays2} maxLiv=${s.maxLiving} maxCum=${s.maxCumulative} maxDiv=${s.maxDivergence} killersEnd liv=${s.livingKillersAtEnd}/dead=${s.deadKillersAtEnd}/nc=${s.notCountedKillersAtEnd}`);
  }
  console.log(`  -> ${path.join(dir, 'analysis.json')}`);
}

if (require.main === module) main().catch(e => { console.error('W4FUNNEL ANALYZER FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { analyzeW4funnel, rollup, mapOutcomeKind };
