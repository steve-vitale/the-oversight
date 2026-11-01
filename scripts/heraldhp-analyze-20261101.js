#!/usr/bin/env node
// heraldhp-analyze-20261101.js — sim-heraldhp2-a analysis.
//
// Heraldhp-b analyzer copied verbatim, plus censusSeed() for the
// frequency census. Derives every judged number from the per-seed
// JSONs ONLY (no re-simulation). Attribution rule: a ledger row is
// DEEPEST (childless) when no other row names its span as parent;
// only deepest rows are summed, so a fight inside
// villagerMonsterTick inside worldTick counts once, at the fight.
//
// Usage: node scripts/heraldhp-analyze-20261101.js [out.json]
//   (reads evidence/2026-11-01/perseed-heraldhp2-a/leadfeast/*.json
//    and, for trajectory identity, perseed-heraldhp-b/leadfeast/*.json)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const DIR = process.env.HERALDHP_DIR || path.join(REPO, 'evidence', '2026-11-01', 'perseed-heraldhp2-a', 'leadfeast');
const OLD = path.join(REPO, 'evidence', '2026-10-31', 'perseed-heraldhp-b', 'leadfeast');

function median(nums) {
  if (!nums.length) return null;
  const s = nums.slice().sort((a, b) => a - b);
  const n = s.length;
  return (n % 2 === 1) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// Cause taxonomy (prereg): FIELD / TB / DAWN / WORLD / RAID / SPAWN / OTHER.
function classifyRow(row) {
  const fn = row.fn;
  if (fn === 'fieldFight' || fn === 'aidFight') return 'FIELD';
  if (fn === 'startCombat' || fn === 'tbEnd') return 'TB';
  if (fn === 'titanDawnTick') return 'DAWN';
  if (fn === 'havenRaidTick' || fn === 'havenGrowthDaily') return 'RAID';
  if (fn === 'spawnWorldMonster' || fn === 'removeWorldMonster') return 'SPAWN';
  if (fn === 'worldTick' || fn === 'villagerMonsterTick' || fn === 'wanderWorldMonsters' ||
      fn === 'maintainWorldMonsters' || fn === 'monsterTurn' || fn === 'animalTurn' ||
      fn === 'resolveWildMonsterEncounter' || fn === 'resolvePatrol') return 'WORLD';
  return 'OTHER';
}
const ATTRIBUTED = { FIELD: 1, TB: 1, DAWN: 1, WORLD: 1, RAID: 1, SPAWN: 1 };

function deepestRows(ledger) {
  const hasChild = {};
  (ledger || []).forEach(function (r) { if (r.parent !== null && r.parent !== undefined) hasChild[r.parent] = 1; });
  return (ledger || []).filter(function (r) { return !hasChild[r.span]; });
}

// Per-tag deltas for one row: [{tag, before, after, delta, kind}]
// kind: 'damage' (both sides), 'spawn' (after only), 'removal' (before only).
function rowDeltas(row) {
  const out = [];
  const bmap = {};
  (row.before || []).forEach(function (e) { bmap[e.tag] = e; });
  const amap = {};
  (row.after || []).forEach(function (e) { amap[e.tag] = e; });
  const tags = {};
  Object.keys(bmap).forEach(function (t) { tags[t] = 1; });
  Object.keys(amap).forEach(function (t) { tags[t] = 1; });
  Object.keys(tags).forEach(function (t) {
    const b = bmap[t], a = amap[t];
    if (b && a) out.push({ tag: Number(t), before: b.hp, after: a.hp, delta: (a.hp - b.hp), kind: 'damage', bEnt: b, aEnt: a });
    else if (!b && a) out.push({ tag: Number(t), before: null, after: a.hp, delta: a.hp, kind: 'spawn', bEnt: null, aEnt: a });
    else out.push({ tag: Number(t), before: b.hp, after: null, delta: -b.hp, kind: 'removal', bEnt: b, aEnt: null });
  });
  return out;
}

function analyzeSeed(d) {
  const hp = d.heraldhp || {};
  const ledger = hp.ledger || [];
  const deep = deepestRows(ledger);
  const refusals = (d.attempts || []).filter(function (a) { return a.mid === 'herald' && a.cls === 'REFUSED'; });
  const refusedDays = refusals.map(function (a) { return a.day; });
  const firstRef = refusals[0] || null;
  const lastRef = refusals.length ? refusals[refusals.length - 1] : null;
  const firstHp = (firstRef && firstRef.entityHp) ? firstRef.entityHp.hp : null;
  const lastHp = (lastRef && lastRef.entityHp) ? lastRef.entityHp.hp : null;
  const windowDrop = (firstHp !== null && lastHp !== null) ? (firstHp - lastHp) : null;

  // Primary tag: tag most frequent among deepest damage rows in the
  // refusal window; fallback: tag of the first refusal's entity
  // (matched by hp + tile in ledger/daily snapshots).
  let windowRows = [];
  if (firstRef && lastRef) {
    windowRows = deep.filter(function (r) { return r.day >= firstRef.day && r.day <= lastRef.day; });
  }
  const tagCount = {};
  windowRows.forEach(function (r) {
    rowDeltas(r).forEach(function (dl) { if (dl.kind === 'damage') tagCount[dl.tag] = (tagCount[dl.tag] || 0) + 1; });
  });
  let primaryTag = null, primaryN = 0;
  Object.keys(tagCount).forEach(function (t) { if (tagCount[t] > primaryN) { primaryN = tagCount[t]; primaryTag = Number(t); } });

  const chunks = [];
  const byCause = {};
  let attributed = 0, otherDamage = 0;
  windowRows.forEach(function (r) {
    const cause = classifyRow(r);
    rowDeltas(r).forEach(function (dl) {
      if (dl.kind !== 'damage' || dl.delta >= 0) {
        if (dl.kind !== 'damage') chunks.push({ day: r.day, fn: r.fn, cause: cause, kind: dl.kind, tag: dl.tag, before: dl.before, after: dl.after, delta: dl.delta, span: r.span, detail: r.detail || null });
        return;
      }
      const dmg = -dl.delta;
      chunks.push({ day: r.day, fn: r.fn, cause: cause, kind: 'damage', tag: dl.tag, before: dl.before, after: dl.after, delta: dl.delta, span: r.span, detail: r.detail || null });
      if (dl.tag === primaryTag || primaryTag === null) {
        byCause[cause] = (byCause[cause] || 0) + dmg;
        if (ATTRIBUTED[cause]) attributed += dmg; else otherDamage += dmg;
      }
    });
  });
  // Restrict chunk list to the primary tag for the window verdict
  // (other tags, if any, are reported separately as multi-entity rows).
  const primaryChunks = (primaryTag === null) ? chunks : chunks.filter(function (c) { return c.tag === primaryTag || c.kind !== 'damage'; });
  const otherTagChunks = (primaryTag === null) ? [] : chunks.filter(function (c) { return c.kind === 'damage' && c.tag !== primaryTag; });

  // Pre-window chunk: spawn row for the primary tag (or any herald
  // spawn) -> first refusal HP.
  let spawnHp = null, spawnDay = null, spawnTag = null;
  deep.forEach(function (r) {
    rowDeltas(r).forEach(function (dl) {
      if (dl.kind === 'spawn' && (primaryTag === null || dl.tag === primaryTag)) {
        if (spawnHp === null) { spawnHp = dl.after; spawnDay = r.day; spawnTag = dl.tag; }
      }
    });
  });
  const preWindowDrop = (spawnHp !== null && firstHp !== null) ? (spawnHp - firstHp) : null;

  // Field cross-check: herald field rows (all callers) vs FIELD chunks.
  const heraldFieldRows = (hp.fieldRows || []).filter(function (f) { return f.mid === 'herald'; });
  const fieldDealtTotal = heraldFieldRows.reduce(function (n, f) { return n + ((f.mDealt | 0) || 0); }, 0);
  const fieldChunkTotal = (byCause.FIELD || 0);
  const fieldMismatches = [];
  heraldFieldRows.forEach(function (f) {
    if (f.mDealt === null || f.mDealt === undefined) return;
    const w = (f.entryHp !== null && f.entryHp !== undefined) ? (f.entryHp - (f.mHpLeft !== null ? f.mHpLeft : f.entryHp)) : null;
    if (w !== null && w !== f.mDealt) fieldMismatches.push({ span: f.span, day: f.day, vid: f.vid, mDealt: f.mDealt, entryMinusLeft: w });
  });

  // Replacement verdict: distinct tags ever + tags at window bounds.
  const allTags = {};
  (hp.daily || []).forEach(function (sn) { (sn.ents || []).forEach(function (e) { allTags[e.tag] = 1; }); });
  ledger.forEach(function (r) {
    (r.before || []).forEach(function (e) { allTags[e.tag] = 1; });
    (r.after || []).forEach(function (e) { allTags[e.tag] = 1; });
  });
  const distinctTags = Object.keys(allTags).map(Number);

  // Deepest-row completeness: sum of ALL deepest damage deltas for
  // the primary tag across the whole run vs first-seen -> last-seen HP.
  let deepDamageSum = 0;
  deep.forEach(function (r) {
    rowDeltas(r).forEach(function (dl) { if (dl.kind === 'damage' && dl.tag === primaryTag) deepDamageSum += dl.delta; });
  });

  const share = (windowDrop !== null && windowDrop > 0) ? (attributed / windowDrop) : null;
  return {
    seed: d.seed, anchorCommit: d.anchorCommit,
    maxWave: d.maxWave, wave4: d.wave4, wave5: d.wave5, w4Day: d.w4Day, w5Day: d.w5Day,
    national: d.national, table: d.table, won: d.won,
    gameDays: d.gameDays, endReason: d.endReason,
    refusals: refusals.length,
    firstRefusalDay: firstRef ? firstRef.day : null, lastRefusalDay: lastRef ? lastRef.day : null,
    firstHp: firstHp, lastHp: lastHp, windowDrop: windowDrop,
    primaryTag: primaryTag, distinctTags: distinctTags,
    spawnHp: spawnHp, spawnDay: spawnDay, spawnTag: spawnTag, preWindowDrop: preWindowDrop,
    attributed: attributed, otherDamage: otherDamage, byCause: byCause,
    attributedShare: share,
    chunks: primaryChunks, otherTagChunks: otherTagChunks,
    heraldFieldRows: heraldFieldRows.length, fieldDealtTotal: fieldDealtTotal,
    fieldChunkTotal: fieldChunkTotal, fieldMismatches: fieldMismatches,
    ledgerRows: ledger.length, deepestRows: deep.length,
    deepDamageSumPrimary: deepDamageSum,
    instrumentErrors: (d.instrumentErrors || []).length,
    musterErrs: d.musterErrs, hpErrors: (hp.errors || []).length,
    wrapped: hp.wrapped || {},
    dailySnapshots: (hp.daily || []).length,
  };
}

// --- sim-heraldhp2-a frequency census (prereg definitions) ---
// located: >= 1 sleep-exit daily snapshot holds a herald entity,
//   OR >= 1 heraldhp ledger row exists.
// drafts / wallLost: OWN-DELTA partition of havenRaidTick rows
//   (see note below) — a raid row counts as a draft when its
//   own-delta for a herald tag is < 0 (wall damage) OR the tag's
//   raidBorn goes false -> true across the row itself; wallLost
//   sums -ownDelta over raid rows. draftsDeepest / wallLostDeepest
//   keep the prereg-literal deepest-only values for comparison.
//   OWN-DELTA NOTE (2026-11-01, found on seed 85123): a raid row
//   can NEST a field fight (raid drafts the Herald to Haven's
//   tile, then a wild encounter fires inside the same tick).
//   The raid row then shows net -183 = -175 wall + -8 fight,
//   and the deepest-only rule drops the raid row entirely
//   (it has a child), hiding the wall chunk. Own-delta =
//   row delta minus direct children's deltas recovers exactly
//   -175. Heraldhp-b's metric review prescribed own-delta for
//   the next ledger arm; this arm adopts it, with both values
//   reported so the refinement is auditable, not silent.
// raidRowsTouching: deepest havenRaidTick rows with any herald tag
//   present in before or after (incl. no-damage re-draft rows).
// fieldFights: heraldhp fieldRows with mid === 'herald'.
// firstSeenHp: first ledger spawn HP for a herald tag, else first
//   daily snapshot HP; lastSeenHp: last daily snapshot HP, else
//   last ledger after-HP. totalLost = firstSeenHp - lastSeenHp.
function censusSeed(d) {
  const hp = d.heraldhp || {};
  const ledger = hp.ledger || [];
  const deep = deepestRows(ledger);
  const daily = hp.daily || [];
  const dailyLocated = daily.some(function (sn) { return (sn.ents || []).length > 0; });
  const located = dailyLocated || ledger.length > 0;
  let drafts = 0, wallLost = 0, draftsDeepest = 0, wallLostDeepest = 0, raidRowsTouching = 0;
  const raidDays = [], raidDaysDeepest = [];
  // Direct children by parent span.
  const childrenByParent = {};
  ledger.forEach(function (r) {
    if (r.parent !== null && r.parent !== undefined) {
      (childrenByParent[r.parent] = childrenByParent[r.parent] || []).push(r);
    }
  });
  function tagDelta(row, tag) {
    const b = (row.before || []).find(function (e) { return e.tag === tag; });
    const a = (row.after || []).find(function (e) { return e.tag === tag; });
    if (b && a) return a.hp - b.hp;
    return null;
  }
  function tagPair(row, tag) {
    const b = (row.before || []).find(function (e) { return e.tag === tag; });
    const a = (row.after || []).find(function (e) { return e.tag === tag; });
    return { b: b, a: a };
  }
  ledger.forEach(function (r) {
    if (r.fn !== 'havenRaidTick') return;
    const tags = {};
    (r.before || []).forEach(function (e) { tags[e.tag] = 1; });
    (r.after || []).forEach(function (e) { tags[e.tag] = 1; });
    if (!Object.keys(tags).length) return;
    const isDeep = !ledger.some(function (o) { return o.parent === r.span; });
    if (isDeep) raidRowsTouching++;
    let rowIsDraft = false, rowIsDraftDeepest = false;
    Object.keys(tags).forEach(function (t) {
      const tag = Number(t);
      const dlt = tagDelta(r, tag);
      let own = dlt;
      if (dlt !== null) {
        (childrenByParent[r.span] || []).forEach(function (ch) {
          const cd = tagDelta(ch, tag);
          if (cd !== null) own -= cd;
        });
      }
      const p = tagPair(r, tag);
      if (own !== null && own < 0) { wallLost += -own; rowIsDraft = true; }
      if (p.b && p.a && !p.b.raidBorn && p.a.raidBorn) rowIsDraft = true;
      if (isDeep) {
        if (dlt !== null && dlt < 0) { wallLostDeepest += -dlt; rowIsDraftDeepest = true; }
        if (p.b && p.a && !p.b.raidBorn && p.a.raidBorn) rowIsDraftDeepest = true;
      }
    });
    if (rowIsDraft) { drafts++; raidDays.push(r.day); }
    if (rowIsDraftDeepest) { draftsDeepest++; raidDaysDeepest.push(r.day); }
  });
  const heraldFieldRows = (hp.fieldRows || []).filter(function (f) { return f.mid === 'herald'; });
  const fieldDealt = heraldFieldRows.reduce(function (n, f) { return n + ((f.mDealt | 0) || 0); }, 0);
  const fieldOutcomes = {};
  heraldFieldRows.forEach(function (f) { const k = f.outcome || 'null'; fieldOutcomes[k] = (fieldOutcomes[k] || 0) + 1; });
  // First/last seen HP.
  let firstSeenHp = null, lastSeenHp = null;
  deep.forEach(function (r) {
    rowDeltas(r).forEach(function (dl) {
      if (dl.kind === 'spawn' && firstSeenHp === null) firstSeenHp = dl.after;
    });
  });
  daily.forEach(function (sn) {
    (sn.ents || []).forEach(function (e) {
      if (firstSeenHp === null) firstSeenHp = e.hp;
      lastSeenHp = e.hp;
    });
  });
  if (lastSeenHp === null) {
    deep.forEach(function (r) {
      (r.after || []).forEach(function (e) { lastSeenHp = e.hp; });
    });
  }
  const totalLost = (firstSeenHp !== null && lastSeenHp !== null) ? (firstSeenHp - lastSeenHp) : null;
  const refusals = (d.attempts || []).filter(function (a) { return a.mid === 'herald' && a.cls === 'REFUSED'; });
  const fought = (d.attempts || []).filter(function (a) { return a.mid === 'herald' && a.cls === 'FOUGHT'; });
  return {
    seed: d.seed, located: located,
    drafts: drafts, wallLost: wallLost, raidDays: raidDays,
    draftsDeepest: draftsDeepest, wallLostDeepest: wallLostDeepest, raidDaysDeepest: raidDaysDeepest,
    raidRowsTouching: raidRowsTouching,
    fieldFights: heraldFieldRows.length, fieldDealt: fieldDealt, fieldOutcomes: fieldOutcomes,
    firstSeenHp: firstSeenHp, lastSeenHp: lastSeenHp, totalLost: totalLost,
    heraldRefusals: refusals.length, heraldFought: fought.length,
    endOmenStage: d.endOmenStage, ledgerRows: ledger.length,
    instrumentErrors: (d.instrumentErrors || []).length, hpErrors: (hp.errors || []).length,
  };
}

function main() {
  const files = fs.readdirSync(DIR).filter(function (f) { return /^s\d+\.json$/.test(f); }).sort();
  const seeds = [];
  const perSeed = files.map(function (f) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    const a = analyzeSeed(d);
    // Trajectory identity vs mustercall corpus (same keys mustercall used).
    let ident = null;
    try {
      const old = JSON.parse(fs.readFileSync(path.join(OLD, f), 'utf8'));
      const keys = ['maxWave', 'national', 'table', 'won', 'gameDays', 'endReason'];
      const diffs = keys.filter(function (k) { return JSON.stringify(old[k]) !== JSON.stringify(d[k]); });
      ident = { identical: diffs.length === 0, diffs: diffs, oldAnchor: old.anchorCommit };
    } catch (e) { ident = { identical: null, diffs: ['no-mustercall-corpus'], oldAnchor: null }; }
    a.trajectoryIdentity = ident;
    seeds.push(a);
    return a;
  });
  const s85106 = seeds.filter(function (s) { return s.seed === 85106; })[0] || null;
  const census = files.map(function (f) {
    const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    return censusSeed(d);
  });
  const located = census.filter(function (c) { return c.located; });
  const censusSummary = {
    screened: census.length,
    located: located.length,
    locatedSeeds: located.map(function (c) { return c.seed; }),
    withDraftDamage: located.filter(function (c) { return c.wallLost > 0; }).length,
    withDrafts: located.filter(function (c) { return c.drafts > 0; }).length,
    withFieldFights: located.filter(function (c) { return c.fieldFights > 0; }).length,
    draftDamageFrequency: located.length ? (located.filter(function (c) { return c.wallLost > 0; }).length / located.length) : null,
    draftFrequency: located.length ? (located.filter(function (c) { return c.drafts > 0; }).length / located.length) : null,
    fieldFrequency: located.length ? (located.filter(function (c) { return c.fieldFights > 0; }).length / located.length) : null,
    withDraftDamageDeepest: located.filter(function (c) { return c.wallLostDeepest > 0; }).length,
    draftDamageFrequencyDeepest: located.length ? (located.filter(function (c) { return c.wallLostDeepest > 0; }).length / located.length) : null,
    totalWallLost: located.reduce(function (n, c) { return n + c.wallLost; }, 0),
    totalWallLostDeepest: located.reduce(function (n, c) { return n + c.wallLostDeepest; }, 0),
    totalFieldDealt: located.reduce(function (n, c) { return n + c.fieldDealt; }, 0),
  };
  const summary = {
    census: census,
    censusSummary: censusSummary,
    seeds: seeds.map(function (s) { return s.seed; }),
    n: seeds.length,
    national: seeds.filter(function (s) { return s.national; }).length,
    table: seeds.filter(function (s) { return s.table; }).length,
    wins: seeds.filter(function (s) { return s.won; }).length,
    wave4: seeds.filter(function (s) { return s.wave4; }).length,
    wave5: seeds.filter(function (s) { return s.wave5; }).length,
    medianSurvival: median(seeds.map(function (s) { return s.gameDays; })),
    maxSurvival: Math.max.apply(null, seeds.map(function (s) { return s.gameDays; })),
    trajectoryIdentical: seeds.filter(function (s) { return s.trajectoryIdentity && s.trajectoryIdentity.identical; }).length,
    s85106: s85106,
    perSeed: seeds,
  };
  const outPath = process.argv[2] || path.join(REPO, 'evidence', '2026-11-01', 'perseed-heraldhp2-a', 'heraldhp2-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 1) + '\n');
  console.log('seeds=' + summary.n + ' nat=' + summary.national + ' table=' + summary.table + ' wins=' + summary.wins +
    ' w4=' + summary.wave4 + ' w5=' + summary.wave5 + ' median=' + summary.medianSurvival + ' max=' + summary.maxSurvival +
    ' trajIdentical=' + summary.trajectoryIdentical + '/' + summary.n);
  console.log('census: screened=' + censusSummary.screened + ' located=' + censusSummary.located +
    ' (' + censusSummary.locatedSeeds.join(',') + ') withDraftDamage=' + censusSummary.withDraftDamage +
    ' withDrafts=' + censusSummary.withDrafts + ' withField=' + censusSummary.withFieldFights +
    ' freqDamage=' + (censusSummary.draftDamageFrequency === null ? 'null' : censusSummary.draftDamageFrequency.toFixed(4)) +
    ' freqDraft=' + (censusSummary.draftFrequency === null ? 'null' : censusSummary.draftFrequency.toFixed(4)) +
    ' totalWall=' + censusSummary.totalWallLost + ' totalField=' + censusSummary.totalFieldDealt);
  if (s85106) {
    console.log('s85106: refusals=' + s85106.refusals + ' window=' + s85106.firstRefusalDay + '..' + s85106.lastRefusalDay +
      ' hp=' + s85106.firstHp + '->' + s85106.lastHp + ' drop=' + s85106.windowDrop +
      ' spawn=' + s85106.spawnHp + '(day ' + s85106.spawnDay + ') preDrop=' + s85106.preWindowDrop +
      ' attributed=' + s85106.attributed + ' other=' + s85106.otherDamage +
      ' share=' + (s85106.attributedShare === null ? 'null' : s85106.attributedShare.toFixed(4)) +
      ' byCause=' + JSON.stringify(s85106.byCause) + ' tags=' + JSON.stringify(s85106.distinctTags) +
      ' fieldDealt=' + s85106.fieldDealtTotal + ' fieldChunk=' + s85106.fieldChunkTotal +
      ' ledger=' + s85106.ledgerRows + ' deepest=' + s85106.deepestRows);
  }
  return summary;
}

if (require.main === module) main();
module.exports = { classifyRow, deepestRows, rowDeltas, analyzeSeed, censusSeed, median, ATTRIBUTED };
