#!/usr/bin/env node
// census-spandraw-b.js — span-draw census across ability types
// (sim-spandraw-census-b; prereg:
// evidence/2026-10-27/sim-spandraw-census-b-prereg.md).
//
// DIAG/measurement ONLY: zero src/js changes. The detector is the
// already-landed scripts/dedupspan-ledger-b.js applySpanDedup
// (item-matched, span-keyed); this module only pairs nestEvents
// into spans, attributes that module's exclusions back to spans,
// and classifies each fired ability.action key under the prereg
// rules. It never re-invents the dedup rule and never matches
// by day label or by amount.
//
// Classification (prereg-fixed):
//  PROVEN-SPAN-DOUBLE-COUNT: >=1 span with excludedKcal > 0,
//    enterDay != exitDay, and >=1 span-internal pantryDraw.
//  SPAN-CROSSES-DAY-NO-DRAW: >=1 span with enterDay != exitDay,
//    zero span-internal draws, zero exclusions.
//  NO-DAY-CROSSING: fired, zero day-crossing spans, zero exclusions.
//  NOT-FIRED-ON-BAND: zero spans; reported with an owned /
//    never-owned split from the post-run abilityOwnership snapshot
//    (end-of-run observation only — an ability owned mid-run and
//    lost before post-run can be missed; stated, not hidden).
// A day-crossing span whose internal draw matches no record item
// is NOT promoted: it is reported as crosses-day with an
// unmatched-draw note (applySpanDedup leaves unmatched items
// counted under the meal draw by design).
//
// When run, prints a JSON census for a corpus directory
// (default evidence/2026-10-27/sim-spandraw-census-b-corpus/).
'use strict';
const fs = require('fs');
const path = require('path');
const { applySpanDedup } = require('./dedupspan-ledger-b');

function pairSpans(events) {
  const ev = (events || []).slice().sort((a, b) => (a.evt || 0) - (b.evt || 0));
  const stack = [];
  const spans = [];
  const draws = [];
  let pending = null;
  for (const e of ev) {
    if (e.kind === 'spanEnter') {
      const s = { ability: e.ability, action: e.action, depth: e.depth,
        enterEvt: e.evt, enterDay: e.day, directBefore: e.directBefore,
        exitEvt: null, exitDay: null, directAfter: null, internalDraws: [] };
      stack.push(s);
    } else if (e.kind === 'spanExit') {
      let idx = -1;
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].ability === e.ability && stack[i].action === e.action && stack[i].depth === e.depth) { idx = i; break; }
      }
      if (idx < 0) continue;
      const s = stack[idx];
      s.exitEvt = e.evt; s.exitDay = e.day; s.directAfter = e.directAfter;
      spans.push(s);
      stack.splice(idx, 1);
    } else if (e.kind === 'drawEnter') {
      pending = { enterEvt: e.evt, enterDay: e.day, want: e.want, frames: e.frames || [],
        span: stack.length ? stack[stack.length - 1] : null };
    } else if (e.kind === 'drawExit' && pending) {
      pending.exitEvt = e.evt; pending.exitDay = e.day;
      pending.taken = e.taken; pending.items = e.items || [];
      draws.push(pending);
      if (pending.span) pending.span.internalDraws.push(pending);
      pending = null;
    }
  }
  return { spans, draws };
}

function censusPayload(payload) {
  const { spans, draws } = pairSpans(payload.nestEvents || []);
  const dedup = applySpanDedup(payload);
  // Attribute ledger exclusions back to spans by (ability, action, enterEvt, exitEvt).
  const exclBySpan = new Map();
  for (const ex of dedup.exclusions) {
    const k = [ex.spanAbility, ex.spanAction, ex.spanEnterEvt, ex.spanExitEvt].join('|');
    if (!exclBySpan.has(k)) exclBySpan.set(k, []);
    exclBySpan.get(k).push(ex);
  }
  const perKey = {};
  function keyFor(s) { return s.ability + '.' + s.action; }
  for (const s of spans) {
    const k = keyFor(s);
    if (!perKey[k]) perKey[k] = { key: k, ability: s.ability, action: s.action,
      spans: 0, dayCrossingSpans: 0, spansCreatingRecord: 0,
      internalDraws: 0, exclusionsKcal: 0, exclusionsGenericKcal: 0,
      exclusionSpans: 0, seeds: new Set(), traces: [] };
    const row = perKey[k];
    row.spans++;
    row.seeds.add(payload.seed);
    const crosses = s.enterDay !== s.exitDay;
    if (crosses) row.dayCrossingSpans++;
    if (s.directAfter === s.directBefore + 1) row.spansCreatingRecord++;
    row.internalDraws += s.internalDraws.length;
    const exs = exclBySpan.get([s.ability, s.action, s.enterEvt, s.exitEvt].join('|')) || [];
    if (exs.length) {
      row.exclusionSpans++;
      row.exclusionsKcal += exs.reduce((t, e) => t + e.kcal, 0);
      row.exclusionsGenericKcal += exs.filter((e) => e.generic).reduce((t, e) => t + e.kcal, 0);
      if (row.traces.length < 3) row.traces.push({ seed: payload.seed, enterEvt: s.enterEvt, exitEvt: s.exitEvt,
        enterDay: s.enterDay, exitDay: s.exitDay, internalDraws: s.internalDraws, exclusions: exs });
    }
  }
  for (const row of Object.values(perKey)) {
    row.seeds = [...row.seeds].sort((a, b) => a - b);
    if (row.exclusionsKcal > 0 && row.dayCrossingSpans > 0 && row.internalDraws > 0) row.classification = 'PROVEN-SPAN-DOUBLE-COUNT';
    else if (row.dayCrossingSpans > 0 && row.internalDraws === 0 && row.exclusionsKcal === 0) row.classification = 'SPAN-CROSSES-DAY-NO-DRAW';
    else if (row.dayCrossingSpans === 0 && row.exclusionsKcal === 0) row.classification = 'NO-DAY-CROSSING';
    else row.classification = 'MIXED-NEEDS-READ'; // day-crossing with draws but no item match, or exclusions without a clean crossing — named, never silently bucketed
    // A day-crossing key whose internal draws exist but match nothing
    // keeps MIXED-NEEDS-READ only when exclusions are 0 AND draws > 0;
    // the prereg's SPAN-CROSSES-DAY-NO-DRAW requires zero internal draws.
    row.seedsWithSpans = row.seeds.length;
    delete row.seeds;
  }
  // Wall fields straight from the payload, never estimated.
  const wall = { seed: payload.seed, daysAlive: payload.daysAlive, endReason: payload.endReason,
    rank: payload.rank, national: !!payload.national, table: !!payload.table, win: !!payload.win,
    waveReach: payload.waveReach || [], deaths: payload.deaths, deathCauses: payload.deathCauses || {} };
  const owned = new Set();
  try {
    const ao = payload.abilityOwnership || {};
    for (const a of (ao.player || [])) owned.add(String(a));
    for (const v of Object.values(ao.npc || {})) for (const a of (v || [])) owned.add(String(a));
  } catch (e) {}
  return { perKey, dedup: { hasSpanData: dedup.hasSpanData, spans: dedup.spans, drawPairs: dedup.drawPairs,
    spanInternalDraws: dedup.spanInternalDraws, unmatchedDrawLinks: dedup.unmatchedDrawLinks,
    ambiguousSpans: dedup.ambiguousSpans, totalExcludedKcal: dedup.totalExcludedKcal,
    totalExcludedGenericKcal: dedup.totalExcludedGenericKcal, changedRecords: dedup.changedRecords },
    wall, owned: [...owned].sort() };
}

function censusDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = [];
  const agg = {};
  const ownedSeeds = {}; // ability id -> Set(seeds owned at post-run)
  const wallRows = [];
  for (const f of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const c = censusPayload(payload);
    perSeed.push({ file: f, dedup: c.dedup, wall: c.wall });
    wallRows.push(c.wall);
    for (const oid of c.owned) {
      if (!ownedSeeds[oid]) ownedSeeds[oid] = new Set();
      ownedSeeds[oid].add(payload.seed);
    }
    for (const row of Object.values(c.perKey)) {
      if (!agg[row.key]) agg[row.key] = { key: row.key, ability: row.ability, action: row.action,
        spans: 0, dayCrossingSpans: 0, spansCreatingRecord: 0, internalDraws: 0,
        exclusionsKcal: 0, exclusionsGenericKcal: 0, exclusionSpans: 0, seedsWithSpans: new Set(), traces: [] };
      const a = agg[row.key];
      a.spans += row.spans; a.dayCrossingSpans += row.dayCrossingSpans;
      a.spansCreatingRecord += row.spansCreatingRecord; a.internalDraws += row.internalDraws;
      a.exclusionsKcal += row.exclusionsKcal; a.exclusionsGenericKcal += row.exclusionsGenericKcal;
      a.exclusionSpans += row.exclusionSpans;
      // One perKey row per key per seed, so adding the payload seed once here is exact.
      a.seedsWithSpans.add(payload.seed);
      if (a.traces.length < 3) a.traces.push(...row.traces.slice(0, 3 - a.traces.length));
    }
  }
  for (const a of Object.values(agg)) {
    a.seedsWithSpans = a.seedsWithSpans.size;
    if (a.exclusionsKcal > 0 && a.dayCrossingSpans > 0 && a.internalDraws > 0) a.classification = 'PROVEN-SPAN-DOUBLE-COUNT';
    else if (a.dayCrossingSpans > 0 && a.internalDraws === 0 && a.exclusionsKcal === 0) a.classification = 'SPAN-CROSSES-DAY-NO-DRAW';
    else if (a.dayCrossingSpans === 0 && a.exclusionsKcal === 0) a.classification = 'NO-DAY-CROSSING';
    else a.classification = 'MIXED-NEEDS-READ';
  }
  let abilityIds = [];
  try {
    const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
    abilityIds = abs.map((a) => a.id);
  } catch (e) {}
  const firedIds = new Set(Object.values(agg).map((a) => a.ability));
  const notFired = abilityIds.filter((id) => !firedIds.has(id)).map((id) => ({
    ability: id, ownedSeeds: ownedSeeds[id] ? ownedSeeds[id].size : 0,
    ownedSeedList: ownedSeeds[id] ? [...ownedSeeds[id]].sort((x, y) => x - y) : [],
    opportunity: ownedSeeds[id] && ownedSeeds[id].size > 0 ? 'owned-but-unfired' : 'never-owned-on-band',
  }));
  const days = wallRows.map((w) => w.daysAlive).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : null;
  const causeTotals = {};
  for (const w of wallRows) for (const [k, v] of Object.entries(w.deathCauses || {})) causeTotals[k] = (causeTotals[k] || 0) + v;
  const wall = { seeds: wallRows.length, national: wallRows.filter((w) => w.national).length,
    table: wallRows.filter((w) => w.table).length, wins: wallRows.filter((w) => w.win).length,
    wave45: wallRows.filter((w) => (w.waveReach || []).some((x) => x >= 4)).length,
    waveReachMax: wallRows.map((w) => Math.max(0, ...(w.waveReach || []))),
    medianDaysAlive: median, maxDaysAlive: days.length ? days[days.length - 1] : null,
    totalDeaths: wallRows.reduce((t, w) => t + (w.deaths || 0), 0), deathCauses: causeTotals,
    rows: wallRows };
  return { files, perSeed, keys: agg, notFired, wall };
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-census-b-corpus');
  const out = censusDir(dir);
  console.log(JSON.stringify(out, null, 2));
}

module.exports = { pairSpans, censusPayload, censusDir };
if (require.main === module) main();
