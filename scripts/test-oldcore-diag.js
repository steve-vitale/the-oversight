#!/usr/bin/env node
// scripts/test-oldcore-diag.js — analyzer for sim-oldcore-a (old-core
// turnover audit). Reads per-seed armed rows from EVID (default
// evidence/2026-10-25/perseed-sim-oldcore-a), reconstructs one fate
// per world-monster seq, and prints the old-core table + gates.
// Usage: node scripts/test-oldcore-diag.js --summary
// Exit 1 if any row is missing or any recorder reports errors/overflow.
//
// FATE RECONSTRUCTION (per seq, in order):
//   1. present in finalPresent -> still-present-at-end (a removal
//      followed by a re-push is cancelled: presence at end wins).
//   2. else lifted into a player fight still pending at run end
//      (store.pendingLifts) -> pending-in-fight (classified).
//   3. else last removal event -> that kind, UNLESS a daily snapshot
//      after the removal day still shows the seq (re-push the
//      recorder missed) -> re-entry-then-vanished (UNKNOWN).
//   4. else no removal event -> vanished-unrecorded (UNKNOWN).
// A removal kind of 'unclassified' is UNKNOWN. 'other-named:*' is
// classified-other (named, counted classified, listed separately).
// Lifespan = exit day - birth day (still-present: censored at run
// end day, reported separately, never mixed into the exited median).
// Appearances = raid-pool appearances of the seq (spawnsrc raids).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const OLD_SRCS = ['maintain', 'scripted-hushwolf'];
const UNKNOWN_KINDS = new Set(['vanished-unrecorded', 'unclassified', 're-entry-then-vanished']);

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function meanOf(arr) {
  if (!arr.length) return null;
  return arr.reduce((t, x) => t + x, 0) / arr.length;
}
function countBy(arr, key) {
  const c = {};
  for (const x of arr) { const k = String(x[key]); c[k] = (c[k] || 0) + 1; }
  return c;
}

function analyzeRow(row) {
  const oc = row.oldcore, sp = row.spawnsrc;
  const endDay = row.days;
  const births = new Map(); // seq -> birth
  for (const b of (oc.births || [])) {
    if (b.seq == null) continue;
    if (!births.has(b.seq)) births.set(b.seq, b);
  }
  const removalsBySeq = new Map();
  for (const r of (oc.removals || [])) {
    if (r.seq == null) continue;
    if (!removalsBySeq.has(r.seq)) removalsBySeq.set(r.seq, []);
    removalsBySeq.get(r.seq).push(r);
  }
  const snapAfter = new Map(); // seq -> max snapshot day present
  for (const s of (oc.snapshots || [])) {
    for (const p of (s.present || [])) {
      if (p.seq == null) continue;
      if (!snapAfter.has(p.seq) || s.day > snapAfter.get(p.seq)) snapAfter.set(p.seq, s.day);
    }
  }
  const finalSet = new Set((oc.finalPresent || []).map(p => p.seq).filter(s => s != null));
  const pendingSet = new Set((oc.pendingLifts || []).map(p => p.seq).filter(s => s != null));
  const appearances = new Map(); // seq -> raid-pool appearances
  const raidEntities = new Set();
  for (const raid of (sp.raids || [])) {
    for (const p of (raid.pool || [])) {
      if (p.seq == null) continue;
      raidEntities.add(p.seq);
      appearances.set(p.seq, (appearances.get(p.seq) || 0) + 1);
    }
  }
  // Fate per birth seq.
  const fates = new Map();
  for (const [seq, b] of births) {
    const rems = removalsBySeq.get(seq) || [];
    const lastRem = rems.length ? rems[rems.length - 1] : null;
    let fate, exitDay;
    if (finalSet.has(seq)) { fate = 'still-present-at-end'; exitDay = endDay; }
    else if (pendingSet.has(seq)) { fate = 'pending-in-fight'; exitDay = endDay; }
    else if (lastRem) {
      const maxSnap = snapAfter.get(seq);
      if (maxSnap != null && maxSnap > lastRem.day) { fate = 're-entry-then-vanished'; exitDay = lastRem.day; }
      else { fate = lastRem.kind; exitDay = lastRem.day; }
    } else { fate = 'vanished-unrecorded'; exitDay = null; }
    fates.set(seq, {
      seq, src: b.src, type: b.type, wave: b.wave, birthDay: b.day,
      fate, exitDay, lifespan: exitDay != null ? exitDay - b.day : null,
      appearances: appearances.get(seq) || 0, inRaidPool: raidEntities.has(seq),
      removals: rems.length,
    });
  }
  // Entities in raid pools or final present but with no oldcore birth
  // (untagged stock, or a birth the recorder missed): count, never hide.
  const noBirth = [];
  for (const seq of raidEntities) if (!births.has(seq)) noBirth.push(seq);
  for (const seq of finalSet) if (!births.has(seq) && !raidEntities.has(seq)) noBirth.push(seq);
  return { endDay, births, fates, noBirth, raidEntities, appearances };
}

function oldCoreOf(fates) {
  return [...fates.values()].filter(f => OLD_SRCS.indexOf(f.src) >= 0 && (f.wave || 1) <= 2);
}

function summarizeSeed(row) {
  const a = analyzeRow(row);
  const core = oldCoreOf(a.fates);
  const exited = core.filter(f => f.fate !== 'still-present-at-end');
  const still = core.filter(f => f.fate === 'still-present-at-end');
  const unknown = core.filter(f => UNKNOWN_KINDS.has(f.fate));
  const raidFates = [...a.raidEntities].map(seq => a.fates.get(seq)).filter(Boolean);
  const raidUnknown = raidFates.filter(f => UNKNOWN_KINDS.has(f.fate));
  const raidNoBirth = a.noBirth.filter(seq => a.raidEntities.has(seq));
  return {
    seed: row.seed, endDay: a.endDay, endReason: row.endReason,
    births: a.births.size, oldcoreBirths: core.length,
    oldcoreBySrc: countBy(core, 'src'),
    oldcoreByType: countBy(core, 'type'),
    stillPresent: still.length,
    stillShare: core.length ? still.length / core.length : null,
    medianLifespanExited: medianOf(exited.map(f => f.lifespan)),
    medianAgeStill: medianOf(still.map(f => f.lifespan)),
    medianLifespanAll: medianOf(core.map(f => f.lifespan)),
    exitCauses: countBy(core, 'fate'),
    appearancesPerBirth: core.length ? core.reduce((t, f) => t + f.appearances, 0) / core.length : null,
    totalAppearances: core.reduce((t, f) => t + f.appearances, 0),
    unknownOldcore: unknown.length,
    raidEntities: a.raidEntities.size,
    raidUnknown: raidUnknown.length + raidNoBirth.length,
    raidNoBirth: raidNoBirth.length,
    noBirthTotal: a.noBirth.length,
    fateBySeq: [...a.fates.values()],
  };
}

function main() {
  const args = process.argv.slice(2);
  if (!args.includes('--summary')) { console.error('usage: --summary'); process.exit(2); }
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-oldcore-a');
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-armed.json`);
    if (!fs.existsSync(p)) { console.error('MISSING ROW ' + p); process.exit(1); }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  for (const r of rows) {
    if (!r.oldcore || r.oldcore.diag.errs !== 0 || Object.keys(r.oldcore.diag.overflow || {}).length) {
      console.error(`ROW seed=${r.seed} oldcore recorder errors/overflow`); process.exit(1);
    }
  }
  const perSeed = rows.map(summarizeSeed);
  // Pooled old-core table.
  const pooledFates = [];
  for (const s of perSeed) pooledFates.push(...s.fateBySeq.filter(f => OLD_SRCS.indexOf(f.src) >= 0 && (f.wave || 1) <= 2));
  const pooledExited = pooledFates.filter(f => f.fate !== 'still-present-at-end');
  const pooledStill = pooledFates.filter(f => f.fate === 'still-present-at-end');
  const pooled = {
    births: pooledFates.length,
    bySrc: countBy(pooledFates, 'src'),
    stillPresent: pooledStill.length,
    stillShare: pooledFates.length ? pooledStill.length / pooledFates.length : null,
    medianLifespanExited: medianOf(pooledExited.map(f => f.lifespan)),
    medianAgeStill: medianOf(pooledStill.map(f => f.lifespan)),
    exitCauses: countBy(pooledFates, 'fate'),
    appearancesPerBirth: pooledFates.length ? pooledFates.reduce((t, f) => t + f.appearances, 0) / pooledFates.length : null,
    totalAppearances: pooledFates.reduce((t, f) => t + f.appearances, 0),
    unknown: pooledFates.filter(f => UNKNOWN_KINDS.has(f.fate)).length,
  };
  // Gate (a): all raid-time pool entities, pooled distinct seqs.
  const allRaid = new Map(); // seq -> fate (first seed wins; seqs are per-run, so per-seed sets are disjoint — pooled by summing)
  let raidTotal = 0, raidUnknown = 0, raidNoBirth = 0;
  for (const s of perSeed) { raidTotal += s.raidEntities; raidUnknown += s.raidUnknown; raidNoBirth += s.raidNoBirth; }
  const gateA = {
    raidEntities: raidTotal, unknown: raidUnknown, unknownShare: raidTotal ? raidUnknown / raidTotal : null,
    pass: raidTotal > 0 && (raidUnknown / raidTotal) <= 0.05,
  };
  // Turnover comparison: births from the spawnsrc census (authoritative),
  // appearances from spawnsrc raid pools, joined by seq.
  const birthApp = new Map(); // seq -> appearances (all seeds pooled; seqs disjoint across runs)
  for (const r of rows) for (const raid of (r.spawnsrc.raids || [])) for (const p of (raid.pool || [])) {
    if (p.seq == null) continue;
    birthApp.set(r.seed + ':' + p.seq, (birthApp.get(r.seed + ':' + p.seq) || 0) + 1);
  }
  const turnover = (pred) => {
    let births = 0, apps = 0;
    for (const r of rows) for (const b of (r.spawnsrc.spawns || [])) {
      if (!pred(b)) continue;
      births++;
      apps += birthApp.get(r.seed + ':' + b.seq) || 0;
    }
    return { births, appearances: apps, perBirth: births ? apps / births : null };
  };
  const turnoverTable = {
    oldcore: turnover(b => OLD_SRCS.indexOf(b.src) >= 0 && (b.wave || 1) <= 2),
    wave3plus: turnover(b => (b.wave || 1) >= 3),
    tileentryWave3plus: turnover(b => b.src === 'tile-entry' && (b.wave || 1) >= 3),
    tileentryAll: turnover(b => b.src === 'tile-entry'),
    all: turnover(() => true),
  };
  // Core share over time: per raid, old-core share + w3+ share.
  const raids = [];
  for (const r of rows) for (const raid of (r.spawnsrc.raids || [])) {
    const pool = raid.pool || [];
    const coreN = pool.filter(p => OLD_SRCS.indexOf(p.src) >= 0 && (p.wave || 1) <= 2).length;
    const w3N = pool.filter(p => (p.wave || 1) >= 3).length;
    raids.push({ seed: r.seed, day: raid.day, n: pool.length, coreN, w3N, coreShare: pool.length ? coreN / pool.length : null, w3Share: pool.length ? w3N / pool.length : null });
  }
  const buckets = [[0, 30], [30, 60], [60, 90], [90, 120], [120, 10000]];
  const bucketTable = buckets.map(([lo, hi]) => {
    const rs = raids.filter(x => x.day >= lo && x.day < hi);
    const n = rs.reduce((t, x) => t + x.n, 0), core = rs.reduce((t, x) => t + x.coreN, 0), w3 = rs.reduce((t, x) => t + x.w3N, 0);
    return { bucket: lo + '-' + (hi === 10000 ? '+' : hi), raids: rs.length, poolN: n, coreShare: n ? core / n : null, w3Share: n ? w3 / n : null };
  });
  const milestone = [30, 60, 120, 180].map(d => {
    const rs = raids.filter(x => x.day <= d).sort((a, b) => a.day - b.day);
    const last = rs.length ? rs[rs.length - 1] : null;
    return { day: d, raid: last ? { seed: last.seed, day: last.day, n: last.n, coreShare: last.coreShare, w3Share: last.w3Share } : null };
  });
  // Cross-check: oldcore births vs spawnsrc spawns per seed.
  const crossCheck = rows.map(r => ({
    seed: r.seed,
    oldcoreBirths: (r.oldcore.births || []).length,
    spawnsrcSpawns: (r.spawnsrc.spawns || []).length,
    oldcoreRemovals: (r.oldcore.removals || []).length,
    tbEnds: (r.oldcore.tbEnds || []).length,
    finalPresent: (r.oldcore.finalPresent || []).length,
    untaggedBirths: (r.oldcore.births || []).filter(b => b.seq == null).length,
  }));
  const out = {
    label: 'sim-oldcore-a analysis', seeds: SEEDS, evidDir,
    perSeed: perSeed.map(s => {
      const { fateBySeq, ...rest } = s;
      return rest;
    }),
    pooled, gateA, turnoverTable, bucketTable, milestone, crossCheck,
    fateDetail: perSeed.map(s => ({ seed: s.seed, fates: s.fateBySeq })),
  };
  const outPath = path.join(evidDir, 'oldcore-summary.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('\n=== sim-oldcore-a analysis ===');
  console.log(`  gate (a) raid entities=${gateA.raidEntities} unknown=${gateA.unknown} share=${gateA.unknownShare != null ? (gateA.unknownShare * 100).toFixed(2) + '%' : 'n/a'} -> ${gateA.pass ? 'PASS' : 'FAIL'}`);
  console.log(`  pooled old-core: births=${pooled.births} bySrc=${JSON.stringify(pooled.bySrc)} still=${pooled.stillPresent} (${pooled.stillShare != null ? (pooled.stillShare * 100).toFixed(1) + '%' : 'n/a'}) medLifeExited=${pooled.medianLifespanExited} medAgeStill=${pooled.medianAgeStill} app/birth=${pooled.appearancesPerBirth != null ? pooled.appearancesPerBirth.toFixed(2) : 'n/a'} unknown=${pooled.unknown}`);
  console.log(`  exit causes pooled: ${JSON.stringify(pooled.exitCauses)}`);
  console.log(`  turnover: oldcore=${JSON.stringify(turnoverTable.oldcore)} w3+=${JSON.stringify(turnoverTable.wave3plus)} tileW3+=${JSON.stringify(turnoverTable.tileentryWave3plus)} all=${JSON.stringify(turnoverTable.all)}`);
  console.log(`  buckets: ${JSON.stringify(bucketTable)}`);
  console.log(`  milestones: ${JSON.stringify(milestone)}`);
  console.log(`  cross-check: ${JSON.stringify(crossCheck)}`);
  console.log(`  -> ${outPath}`);
  if (!gateA.pass) { console.error('GATE (a) FAILED'); process.exit(1); }
}
if (require.main === module) main();
module.exports = { analyzeRow, oldCoreOf, UNKNOWN_KINDS };
