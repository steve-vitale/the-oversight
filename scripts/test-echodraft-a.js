#!/usr/bin/env node
// scripts/test-echodraft-a.js — analyzer unit proof for sim-echodraft-a
// (axis scale-onramp, 2026-10-25: raid-draft echo trace, DIAG ONLY).
//
// Pure functions (no Game reads) so every branch is drivable on
// synthetic rows. The sweep imports analyzeEcho; running this file
// directly executes the unit suite and exits non-zero on failure.
//
// CLASSIFICATIONS (fixed before any sim, same as the evidence
// pre-registration):
// - prior-history class at draft time, from defwound resolve rows
//   with day STRICTLY before the draft day, same instance seq:
//   defender-wounded = an earlier raid fight ended below the line
//   for this entity (manufactured by that fight); field-wounded =
//   an earlier field fight ended below the line (manufactured);
//   arrived-wounded = the earliest earlier below-line end started
//   already below the line (no earlier fight manufactured it);
//   healthy = no earlier below-line end at all.
// - previously-drafted = the seq appeared in an earlier raid's
//   drafted list in the same seed (raid array order).
// - nearest quartile of a raid's pool = the first ceil(livingN/4)
//   pool entries by rank; the random-draft expectation for a raid
//   is raidN * quartileSize / livingN, summed over raids.
'use strict';

function breakLineOf(wave) { return (wave | 0) >= 2 ? 0.15 : 0.25; }

function medianOf(arr) {
  const s = (arr || []).filter(x => x != null && isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return null;
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  const s = (arr || []).filter(x => x != null && isFinite(x));
  if (!s.length) return null;
  return s.reduce((t, x) => t + x, 0) / s.length;
}

// Spearman rho with tie-averaged ranks. Returns null when either
// side is constant (no rank variation to correlate).
function spearman(xs, ys) {
  if (!xs || !ys || xs.length !== ys.length || xs.length < 2) return null;
  const ranks = (vals) => {
    const order = vals.map((v, i) => ({ v: v, i: i })).sort((a, b) => a.v - b.v);
    const r = new Array(vals.length);
    let k = 0;
    while (k < order.length) {
      let j = k;
      while (j + 1 < order.length && order[j + 1].v === order[k].v) j++;
      const avg = (k + j) / 2 + 1; // 1-based average rank
      for (let t = k; t <= j; t++) r[order[t].i] = avg;
      k = j + 1;
    }
    return r;
  };
  const rx = ranks(xs), ry = ranks(ys);
  const mx = meanOf(rx), my = meanOf(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < rx.length; i++) {
    const a = rx[i] - mx, b = ry[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  if (dx === 0 || dy === 0) return null;
  return num / Math.sqrt(dx * dy);
}

function priorClassOf(seq, draftDay, defRows) {
  if (seq == null) return 'untagged';
  let firstBelow = null;
  for (const r of (defRows || [])) {
    if (r.seq !== seq) continue;
    if (!(r.day < draftDay)) continue;
    if (!r.belowLineEnd) continue;
    if (!firstBelow) firstBelow = r;
  }
  if (!firstBelow) return 'healthy';
  if (firstBelow.manufactured) return firstBelow.raid ? 'defender-wounded' : 'field-wounded';
  return 'arrived-wounded';
}

function analyzeEcho(echoRaids, defRows) {
  const raids = (echoRaids || []).slice();
  const rows = defRows || [];
  const draftedSeqsSeen = new Set();
  let totalDrafted = 0, totalPool = 0, untaggedDrafted = 0, untaggedPool = 0;
  let constructionMismatches = 0;
  const draftedDists = [], poolDists = [];
  const draftedDistByWound = { below: [], above: [] };
  const draftedDistByClass = {};
  const poolDistByClass = {};
  const draftedCountByClass = {};
  const draftedDistByPrev = { 'previously-drafted': [], 'never-drafted': [] };
  const spearX = [], spearY = [];
  let quartileObserved = 0, quartileExpected = 0;
  const draftsBySeq = {}; // seq -> [{day,dist,frac,belowLine,rank,priorClass}]
  const poolBySeqCount = {};

  for (const raid of raids) {
    const pool = raid.pool || [];
    const q = Math.ceil((raid.livingN || pool.length) / 4);
    quartileExpected += (raid.raidN * q) / Math.max(1, (raid.livingN || pool.length));
    for (const p of pool) {
      totalPool++;
      if (p.seq == null) untaggedPool++;
      const shouldDraft = p.rank < raid.raidN;
      if (!!p.drafted !== shouldDraft) constructionMismatches++;
      if (p.dist != null) poolDists.push(p.dist);
      if (p.dist != null) { spearX.push(p.dist); spearY.push(p.drafted ? 1 : 0); }
      if (p.drafted && p.rank < q) quartileObserved++;
      const cls = priorClassOf(p.seq, raid.day, rows);
      if (!poolDistByClass[cls]) poolDistByClass[cls] = [];
      if (p.dist != null) poolDistByClass[cls].push(p.dist);
      if (p.seq != null) poolBySeqCount[p.seq] = (poolBySeqCount[p.seq] || 0) + 1;
    }
    for (const d of (raid.drafted || [])) {
      totalDrafted++;
      if (d.seq == null) untaggedDrafted++;
      const cls = priorClassOf(d.seq, raid.day, rows);
      const prev = (d.seq != null && draftedSeqsSeen.has(d.seq)) ? 'previously-drafted' : 'never-drafted';
      if (d.dist != null) {
        draftedDists.push(d.dist);
        draftedDistByPrev[prev].push(d.dist);
        if (d.belowLine === true) draftedDistByWound.below.push(d.dist);
        else if (d.belowLine === false) draftedDistByWound.above.push(d.dist);
        if (!draftedDistByClass[cls]) draftedDistByClass[cls] = [];
        draftedDistByClass[cls].push(d.dist);
      }
      draftedCountByClass[cls] = (draftedCountByClass[cls] || 0) + 1;
      if (d.seq != null) {
        if (!draftsBySeq[d.seq]) draftsBySeq[d.seq] = [];
        draftsBySeq[d.seq].push({ day: raid.day, dist: d.dist, frac: d.frac, belowLine: d.belowLine, rank: d.rank, priorClass: cls, prev: prev, type: d.type, wave: d.wave });
      }
    }
    for (const d of (raid.drafted || [])) if (d.seq != null) draftedSeqsSeen.add(d.seq);
  }

  const dist0 = (arr) => arr.length ? arr.filter(d => d === 0).length / arr.length : null;
  const summarize = (arr) => ({ n: arr.length, median: medianOf(arr), mean: meanOf(arr), dist0Share: dist0(arr) });
  const classSummary = (map) => {
    const out = {};
    for (const k of Object.keys(map)) out[k] = summarize(map[k]);
    return out;
  };

  // Draft-side echo gap: for each defender below-line wound EVENT
  // (defwound convention), count LATER drafts of the same seq
  // (raid day strictly after the event day — the event's own
  // draft is the same-day draft, never counted as a re-draft).
  const woundEvents = rows.filter(r => r.raid && r.outcome === 'mFlee' && r.belowLineEnd && r.seq != null);
  const laterDraftsBySource = {};
  const laterDraftsPerEntity = {};
  for (const ev of woundEvents) {
    const src = ev.manufactured ? 'defender-manufactured' : 'defender-pre-wounded';
    const later = (draftsBySeq[ev.seq] || []).filter(d => d.day > ev.day).length;
    if (!laterDraftsBySource[src]) laterDraftsBySource[src] = { events: 0, laterDrafts: 0 };
    laterDraftsBySource[src].events++;
    laterDraftsBySource[src].laterDrafts += later;
  }
  // Per-entity first-wound source (whole timeline, secondary):
  // first below-line end in any context for the seq.
  const firstWoundSrc = {};
  for (const r of rows) {
    if (r.seq == null || !r.belowLineEnd) continue;
    if (firstWoundSrc[r.seq]) continue;
    firstWoundSrc[r.seq] = r.manufactured ? (r.raid ? 'defender-manufactured' : 'field-manufactured') : 'arrived-wounded';
  }
  const entityDrafts = {};
  for (const seq of Object.keys(draftsBySeq)) {
    const ds = draftsBySeq[seq];
    const firstBelowDraft = ds.find(d => d.belowLine === true);
    entityDrafts[seq] = {
      seq: Number(seq), type: ds[0].type, wave: ds[0].wave, drafts: ds.length,
      firstWoundSource: firstWoundSrc[seq] || 'healthy',
      everBelowLineAtDraft: !!firstBelowDraft,
      draftsList: ds,
    };
  }
  for (const seq of Object.keys(entityDrafts)) {
    const e = entityDrafts[seq];
    const k = e.firstWoundSource;
    if (!laterDraftsPerEntity[k]) laterDraftsPerEntity[k] = { entities: 0, drafts: 0 };
    laterDraftsPerEntity[k].entities++;
    laterDraftsPerEntity[k].drafts += e.drafts;
  }
  // Most-drafted wounded entity (sense subject): max drafts among
  // entities ever below-line at a draft; ties -> earliest first draft.
  let senseEntity = null;
  for (const e of Object.values(entityDrafts)) {
    if (!e.everBelowLineAtDraft) continue;
    if (!senseEntity || e.drafts > senseEntity.drafts) senseEntity = e;
  }
  let senseTimeline = null;
  if (senseEntity) {
    const fights = rows.filter(r => r.seq === senseEntity.seq).map(r => ({
      day: r.day, context: r.context, outcome: r.outcome, rounds: r.rounds,
      startFrac: r.mHpStartFrac, endFrac: r.mHpEndFrac, manufactured: !!r.manufactured,
    }));
    senseTimeline = { entity: senseEntity, drafts: senseEntity.draftsList, fights: fights };
  }

  return {
    raids: raids.length, totalDrafted: totalDrafted, totalPool: totalPool,
    untaggedDrafted: untaggedDrafted, untaggedPool: untaggedPool,
    constructionMismatches: constructionMismatches,
    draftedDist: summarize(draftedDists), poolDist: summarize(poolDists),
    draftedDistByWound: { below: summarize(draftedDistByWound.below), above: summarize(draftedDistByWound.above) },
    draftedDistByClass: classSummary(draftedDistByClass),
    poolDistByClass: classSummary(poolDistByClass),
    draftedCountByClass: draftedCountByClass,
    draftedDistByPrev: { 'previously-drafted': summarize(draftedDistByPrev['previously-drafted']), 'never-drafted': summarize(draftedDistByPrev['never-drafted']) },
    spearmanDistDrafted: spearman(spearX, spearY),
    spearmanN: spearX.length,
    quartile: { observed: quartileObserved, expected: quartileExpected, size: null },
    laterDraftsBySource: laterDraftsBySource,
    laterDraftsPerEntity: laterDraftsPerEntity,
    distinctDraftedEntities: Object.keys(draftsBySeq).length,
    senseTimeline: senseTimeline,
  };
}

// ---- unit suite (runs only when executed directly) ----
function assert(cond, msg) { if (!cond) throw new Error('ASSERT: ' + msg); }
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }

function runTests() {
  let n = 0;
  const t = (name, fn) => { fn(); n++; console.log('  ok: ' + name); };

  t('prior class: defender/field/arrived/healthy', () => {
    const rows = [
      { seq: 1, day: 5, raid: true, belowLineEnd: true, manufactured: true },
      { seq: 2, day: 5, raid: false, belowLineEnd: true, manufactured: true },
      { seq: 3, day: 5, raid: false, belowLineEnd: true, manufactured: false },
      { seq: 4, day: 5, raid: true, belowLineEnd: false, manufactured: false },
    ];
    assert(priorClassOf(1, 10, rows) === 'defender-wounded', 'def');
    assert(priorClassOf(2, 10, rows) === 'field-wounded', 'field');
    assert(priorClassOf(3, 10, rows) === 'arrived-wounded', 'arrived');
    assert(priorClassOf(4, 10, rows) === 'healthy', 'healthy');
    assert(priorClassOf(1, 5, rows) === 'healthy', 'same-day rows do not classify');
    assert(priorClassOf(null, 10, rows) === 'untagged', 'untagged');
  });

  t('spearman: perfect negative and null on constant', () => {
    assert(approx(spearman([0, 1, 2, 3], [1, 1, 0, 0]), -0.894427, 1e-5), 'neg rho');
    assert(spearman([0, 1, 2], [1, 1, 1]) === null, 'constant y null');
    assert(spearman([1, 1, 1], [0, 1, 0]) === null, 'constant x null');
  });

  t('analyzeEcho: splits, quartile, construction, prev-draft', () => {
    const mk = (rank, drafted, dist, seq, below) => ({ rank: rank, drafted: drafted, seq: seq, type: 't', wave: 1, dist: dist, preTx: 0, preTy: 0, preHp: 10, maxHp: 20, frac: below ? 0.1 : 0.9, breakLine: 0.25, belowLine: below, poolIdx: rank });
    const raids = [
      { day: 10, raidN: 2, livingN: 4, pool: [mk(0, true, 0, 1, false), mk(1, true, 1, 2, false), mk(2, false, 5, 3, false), mk(3, false, 9, 4, false)], drafted: [mk(0, true, 0, 1, false), mk(1, true, 1, 2, false)] },
      { day: 20, raidN: 2, livingN: 4, pool: [mk(0, true, 0, 1, true), mk(1, true, 2, 5, false), mk(2, false, 6, 3, false), mk(3, false, 9, 4, false)], drafted: [mk(0, true, 0, 1, true), mk(1, true, 2, 5, false)] },
    ];
    const rows = [
      { seq: 1, day: 10, raid: true, outcome: 'mFlee', belowLineEnd: true, manufactured: true },
    ];
    const a = analyzeEcho(raids, rows);
    assert(a.raids === 2 && a.totalDrafted === 4 && a.totalPool === 8, 'counts');
    assert(a.constructionMismatches === 0, 'construction clean');
    assert(a.draftedDist.median === 1, 'drafted median dist');
    assert(a.draftedDistByPrev['previously-drafted'].n === 1 && a.draftedDistByPrev['previously-drafted'].median === 0, 'prev-drafted at 0');
    assert(a.draftedDistByClass['defender-wounded'].n === 1, 'defender-wounded drafted once');
    assert(a.quartile.observed === 2, 'quartile observed (both raids draft rank 0 in quartile of 1)');
    assert(approx(a.quartile.expected, 2 * (2 * 1 / 4), 1e-9), 'quartile expected');
    assert(a.spearmanDistDrafted < 0, 'spearman negative');
    assert(a.senseTimeline && a.senseTimeline.entity.seq === 1, 'sense entity is the wounded re-draft');
    assert(a.laterDraftsBySource['defender-manufactured'].laterDrafts === 1, 'later draft counted');
  });

  t('analyzeEcho: construction mismatch flagged', () => {
    const mk = (rank, drafted, dist, seq) => ({ rank: rank, drafted: drafted, seq: seq, type: 't', wave: 1, dist: dist, preTx: 0, preTy: 0, preHp: 10, maxHp: 20, frac: 0.9, breakLine: 0.25, belowLine: false, poolIdx: rank });
    const raids = [{ day: 10, raidN: 1, livingN: 2, pool: [mk(0, false, 0, 1), mk(1, true, 3, 2)], drafted: [mk(0, true, 3, 2)] }];
    const a = analyzeEcho(raids, []);
    assert(a.constructionMismatches === 2, 'both flags wrong');
  });

  console.log(`test-echodraft-a: ${n} unit tests passed`);
}

if (require.main === module) {
  try { runTests(); } catch (e) { console.error('test-echodraft-a FAILED: ' + e.message); process.exit(1); }
}

module.exports = { breakLineOf, medianOf, meanOf, spearman, priorClassOf, analyzeEcho };
