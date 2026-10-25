#!/usr/bin/env node
// scripts/analyze-echodraft-context.js — second-pass breakdowns for
// sim-echodraft-a, computed from the committed per-seed corpus
// (evidence/2026-10-25/perseed-sim-echodraft-a/s*.json). Pure reads;
// prints JSON + human lines. These splits decide whether the
// defwound echo gap lives in the DRAFT (raid re-drafts) or in
// FIELD re-meets, and whether wounded entities sit nearer in the
// POOL (not just among the drafted).
//
// - remeetContext: for each defender below-line wound EVENT
//   (defwound convention), later resolve rows for the same seq
//   split by context (raid vs field), grouped by the event being
//   manufactured vs pre-wounded, and by the entity's whole-timeline
//   first-wound source.
// - poolDistByClass: all pool entries (drafted or not) at every
//   raid, median/mean distance by prior-history class.
// - rankByClass: drafted entities' mean draft rank by prior class.
// - draftCounts: distinct drafted entities, drafts per entity,
//   re-draft share of all drafts.
'use strict';
const fs = require('fs');
const path = require('path');
const { priorClassOf, medianOf, meanOf } = require('./test-echodraft-a');

const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const EVID = process.env.EVID || path.join(__dirname, '..', 'evidence', '2026-10-25', 'perseed-sim-echodraft-a');

function main() {
  const remeet = { manufactured: { events: 0, raid: 0, field: 0 }, preWounded: { events: 0, raid: 0, field: 0 } };
  const remeetByFirstSrc = {};
  const poolByClass = {};
  const rankByClass = {};
  const draftsPerEntity = {};
  let totalDrafts = 0, redrafts = 0;
  for (const seed of SEEDS) {
    const row = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
    const defRows = (row.defwound && row.defwound.resolveFights) || [];
    defRows.forEach((r, i) => { r._idx = i; });
    const bySeq = {};
    for (const r of defRows) { if (r.seq == null) continue; (bySeq[r.seq] = bySeq[r.seq] || []).push(r); }
    const firstSrc = {};
    for (const r of defRows) {
      if (r.seq == null || !r.belowLineEnd) continue;
      if (firstSrc[r.seq]) continue;
      firstSrc[r.seq] = r.manufactured ? (r.raid ? 'defender-manufactured' : 'field-manufactured') : 'arrived-wounded';
    }
    for (const ev of defRows) {
      if (!ev.raid || ev.outcome !== 'mFlee' || !ev.belowLineEnd || ev.seq == null) continue;
      const g = ev.manufactured ? remeet.manufactured : remeet.preWounded;
      g.events++;
      const later = (bySeq[ev.seq] || []).filter(r => r._idx > ev._idx);
      for (const r of later) { if (r.raid) g.raid++; else g.field++; }
      const src = firstSrc[ev.seq] || 'healthy';
      if (!remeetByFirstSrc[src]) remeetByFirstSrc[src] = { events: 0, raid: 0, field: 0 };
      remeetByFirstSrc[src].events++;
      for (const r of later) { if (r.raid) remeetByFirstSrc[src].raid++; else remeetByFirstSrc[src].field++; }
    }
    const seen = new Set();
    for (const raid of ((row.echodraft && row.echodraft.raids) || [])) {
      for (const p of (raid.pool || [])) {
        const cls = priorClassOf(p.seq, raid.day, defRows);
        if (!poolByClass[cls]) poolByClass[cls] = [];
        if (p.dist != null) poolByClass[cls].push(p.dist);
      }
      for (const d of (raid.drafted || [])) {
        totalDrafts++;
        const cls = priorClassOf(d.seq, raid.day, defRows);
        if (!rankByClass[cls]) rankByClass[cls] = [];
        rankByClass[cls].push(d.rank);
        if (d.seq != null) {
          if (seen.has(d.seq)) redrafts++;
          seen.add(d.seq);
          const k = seed + ':' + d.seq;
          draftsPerEntity[k] = (draftsPerEntity[k] || 0) + 1;
        }
      }
    }
  }
  const summ = (arr) => ({ n: arr.length, median: medianOf(arr), mean: meanOf(arr) });
  const classSumm = (map) => { const o = {}; for (const k of Object.keys(map)) o[k] = summ(map[k]); return o; };
  const out = {
    remeetContextByEventKind: remeet,
    remeetContextByFirstWoundSource: remeetByFirstSrc,
    poolDistByClass: classSumm(poolByClass),
    draftedRankByClass: classSumm(rankByClass),
    draftCounts: {
      totalDrafts: totalDrafts, redrafts: redrafts, redraftShare: totalDrafts ? redrafts / totalDrafts : null,
      distinctDraftedEntities: Object.keys(draftsPerEntity).length,
      meanDraftsPerEntity: Object.keys(draftsPerEntity).length ? totalDrafts / Object.keys(draftsPerEntity).length : null,
      maxDraftsOneEntity: Math.max(0, ...Object.values(draftsPerEntity)),
    },
  };
  console.log(JSON.stringify(out, null, 1));
  console.log(`REMEET-CONTEXT manufactured: events=${remeet.manufactured.events} raid=${remeet.manufactured.raid} field=${remeet.manufactured.field}`);
  console.log(`REMEET-CONTEXT preWounded: events=${remeet.preWounded.events} raid=${remeet.preWounded.raid} field=${remeet.preWounded.field}`);
  console.log(`POOL-DIST-BY-CLASS: ${JSON.stringify(out.poolDistByClass)}`);
  console.log(`DRAFT-RANK-BY-CLASS: ${JSON.stringify(out.draftedRankByClass)}`);
  console.log(`DRAFT-COUNTS: ${JSON.stringify(out.draftCounts)}`);
}
main();
