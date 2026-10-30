#!/usr/bin/env node
// scripts/analyze-dissolvecause-a.js — sim-dissolvecause-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the fresh corpus (and, for the substrate
// leg only, the draftflag corpus), never game state, never writes into
// either corpus. Judges the prereg
// (evidence/2026-10-30/sim-dissolvecause-a-prereg.md): dissolve-cause
// coverage, scholar-HP-at-dissolve coverage, the (a) phantom-herald and
// (b) within-fight-HP questions, classification completeness, substrate
// identity, and wall numbers recomputed from the fresh corpus.
// Classification REUSES scripts/analyze-dissolve-a.js (classifyDissolved,
// isLingererOrigin) by require — never re-implemented.
// Usage:
//   node scripts/analyze-dissolvecause-a.js [--dir <dir>] [--out <file>]
//     [--seeds 75101,...] [--sense]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyDissolved, isLingererOrigin } = require('./analyze-dissolve-a');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-30', 'perseed-dissolvecause-a');
const DRAFTFLAG = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const DEFAULT_SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108,
  75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];

function parseArgs(argv) {
  const out = { dir: EVID, out: null, seeds: DEFAULT_SEEDS, sense: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') out.dir = argv[++i];
    else if (argv[i] === '--out') out.out = argv[++i];
    else if (argv[i] === '--sense') out.sense = true;
    else if (argv[i] === '--seeds') out.seeds = argv[i + 1].split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite), i++;
  }
  if (!out.out) out.out = path.join(REPO, 'evidence', '2026-10-30', 'sim-dissolvecause-a-analysis.json');
  return out;
}

function censusInfo(census, rowDays) {
  const snaps = census.snapshots || [];
  let sorted = true;
  for (let i = 1; i < snaps.length; i++) if (snaps[i].day < snaps[i - 1].day) sorted = false;
  const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
  return { snapshots: snaps.length, sorted, lastDay, within1: lastDay !== null && Math.abs(lastDay - rowDays) <= 1 };
}

function medianOf(arr) { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }
function bump(m, k) { m[k] = (m[k] || 0) + 1; }
function stripScholarmelt(row) { const c = JSON.parse(JSON.stringify(row)); delete c.scholarmelt; return c; }
// normalizeWorktreePaths(s): the removal recorder's stack frames embed
// the ABSOLUTE worktree path of the sweep process, so a corpus written
// from worktree sim-draftflag-a and a corpus written from worktree
// sim-dissolvecause-a differ in exactly that slug (same file, same
// line — verified on the pilot band). That is a recording-environment
// artifact, not game data: normalizing the slug is what makes the
// substrate comparison test the game rather than the directory name.
// Both raw and normalized results are reported; the leg judges the
// normalized one, with the raw one disclosed.
function normalizeWorktreePaths(s) {
  return String(s)
    .replace(/\/home\/hatch\/workspace\/worktrees\/[^\/\s)"']+/g, '<worktree>')
    .replace(/\/home\/hatch\/workspace\/the-scattering/g, '<worktree>');
}

function analyze(dir, seeds, draftflagDir) {
  draftflagDir = draftflagDir || DRAFTFLAG;
  const perSeed = [];
  const dissolvedRows = [];
  let validSeeds = 0;
  const fateCounts = {};
  const causeCounts = {};
  const observedAtCounts = {};
  const causeByObservedAt = {};
  const causeByFate = {};
  const fateByLift = { lifted: {}, spawnEnded: {} };
  let causeCovered = 0, hpCovered = 0, barrierStamped = 0, exactHpRows = 0, boundHpRows = 0;
  let unclassified = 0;
  const lingererRows = [];
  const lingererFateCounts = {};
  const lingererCauseCounts = {};
  const spawnEndedRows = [];
  const spawnEndedCauseCounts = {};
  let spawnEndedBarrier = 0;
  const withinDeltas = []; // start-post rows only: exact within-fight HP cost
  const betweenDeltasExact = []; // pairs whose EARLIER row is start-post (exact anchor)
  let betweenPairsBound = 0;
  const substrate = { perSeedRow: {}, perSeedRowRaw: {}, perSeedCensus: {},
    allRows: true, allRowsRaw: true, allCensus: true };
  const wall = { won: 0, nationalEver: 0, nationalFinal: 0, tableReached: 0, tableEntered: 0,
    waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, days: [], deaths: 0 };
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const census = JSON.parse(fs.readFileSync(path.join(dir, `census-s${seed}.json`), 'utf8'));
    const smStore = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const smDiag = (row.scholarmelt && row.scholarmelt.diag) || {};
    const cInfo = censusInfo(census, row.days);
    const valid = row.days > 0 && smDiag.errs === 0 && Object.keys(smDiag.overflow || {}).length === 0
      && cInfo.sorted && cInfo.within1;
    if (valid) validSeeds++;
    // Substrate leg: row-minus-scholarmelt vs draftflag row-minus-scholarmelt.
    try {
      const freshStripped = JSON.stringify(stripScholarmelt(row), null, 1) + '\n';
      const dfRow = JSON.parse(fs.readFileSync(path.join(draftflagDir, `s${seed}-fresh.json`), 'utf8'));
      const dfStripped = JSON.stringify(stripScholarmelt(dfRow), null, 1) + '\n';
      substrate.perSeedRowRaw[seed] = (freshStripped === dfStripped);
      substrate.perSeedRow[seed] = (normalizeWorktreePaths(freshStripped) === normalizeWorktreePaths(dfStripped));
    } catch (e) { substrate.perSeedRow[seed] = false; substrate.perSeedRowRaw[seed] = false; }
    if (!substrate.perSeedRow[seed]) substrate.allRows = false;
    if (!substrate.perSeedRowRaw[seed]) substrate.allRowsRaw = false;
    try {
      const a = fs.readFileSync(path.join(dir, `census-s${seed}.json`));
      const b = fs.readFileSync(path.join(draftflagDir, `census-s${seed}.json`));
      substrate.perSeedCensus[seed] = a.equals(b);
    } catch (e) { substrate.perSeedCensus[seed] = false; }
    if (!substrate.perSeedCensus[seed]) substrate.allCensus = false;
    const dissolved = smStore.filter(m => m.result === 'dissolved-no-tbend');
    const seedRows = [];
    for (const m of dissolved) {
      const c = classifyDissolved(m);
      const rec = { seed, fightSeq: m.fightSeq, dayStart: m.dayStart, dayEnd: m.dayEnd,
        intendedMid: m.intendedMid, tile: [m.tilePx, m.tilePy],
        lift: m.lift ? { id: m.lift.id, hp: m.lift.hp, maxHp: m.lift.maxHp, tx: m.lift.tx, ty: m.lift.ty,
          lingering: !!m.lift.lingering, titan: !!m.lift.titan, wave: m.lift.wave } : null,
        lifted: m.lifted, restoredIdentity: !!m.restoredIdentity, restoredEntry: !!m.restoredEntry,
        restoredHp: m.restoredHp, scholarHpStart: m.scholarHpStart, scholarHpEnd: m.scholarHpEnd,
        fate: c.fate, sub: c.sub,
        lingererOrigin: isLingererOrigin(m),
        dissolveCause: (m.dissolveCause != null ? String(m.dissolveCause) : null),
        dissolveObservedAt: (m.dissolveObservedAt != null ? String(m.dissolveObservedAt) : null),
        scholarHpAtDissolve: (m.scholarHpAtDissolve != null ? m.scholarHpAtDissolve : null),
        dissolveProbe: m.dissolveProbe || null,
        barrierDeathStamp: !!m.barrierDeathStamp,
        barrierStampHp: (m.barrierStampHp != null ? m.barrierStampHp : null),
        barrierStampDay: (m.barrierStampDay != null ? m.barrierStampDay : null),
        barrierStampBearerChanged: (m.barrierStampBearerChanged != null ? !!m.barrierStampBearerChanged : null),
        barrierStampGameOver: (m.barrierStampGameOver != null ? !!m.barrierStampGameOver : null),
        startPostFightGone: !!m.startPostFightGone, dissolvedFlushed: !!m.dissolvedFlushed };
      if (rec.fate === 'UNCLASSIFIED') unclassified++;
      bump(fateCounts, rec.fate);
      if (rec.dissolveCause != null) { causeCovered++; bump(causeCounts, rec.dissolveCause); }
      if (rec.scholarHpAtDissolve != null && Number.isFinite(rec.scholarHpAtDissolve)) hpCovered++;
      if (rec.dissolveObservedAt != null) {
        bump(observedAtCounts, rec.dissolveObservedAt);
        causeByObservedAt[rec.dissolveObservedAt] = causeByObservedAt[rec.dissolveObservedAt] || {};
        bump(causeByObservedAt[rec.dissolveObservedAt], rec.dissolveCause || 'null');
      }
      causeByFate[rec.fate] = causeByFate[rec.fate] || {};
      bump(causeByFate[rec.fate], rec.dissolveCause || 'null');
      if (rec.barrierDeathStamp) barrierStamped++;
      if (rec.dissolveObservedAt === 'start-post') {
        exactHpRows++;
        if (rec.scholarHpStart != null && rec.scholarHpAtDissolve != null) {
          withinDeltas.push({ seed: rec.seed, fightSeq: rec.fightSeq, dayStart: rec.dayStart,
            hpStart: rec.scholarHpStart, hpAtDissolve: rec.scholarHpAtDissolve,
            delta: rec.scholarHpAtDissolve - rec.scholarHpStart });
        }
      } else boundHpRows++;
      if (rec.lifted === true) bump(fateByLift.lifted, rec.fate);
      else if (rec.lifted === false && !rec.lift) bump(fateByLift.spawnEnded, rec.fate);
      if (rec.lingererOrigin) {
        lingererRows.push(rec);
        bump(lingererFateCounts, rec.fate);
        bump(lingererCauseCounts, rec.dissolveCause || 'null');
      }
      if (rec.lifted === false && !rec.lift) {
        spawnEndedRows.push(rec);
        bump(spawnEndedCauseCounts, rec.dissolveCause || 'null');
        if (rec.barrierDeathStamp) spawnEndedBarrier++;
      }
      dissolvedRows.push(rec);
      seedRows.push(rec);
    }
    // Between-fight deltas: consecutive dissolved rows on this seed.
    for (let i = 1; i < seedRows.length; i++) {
      const prev = seedRows[i - 1], cur = seedRows[i];
      if (prev.dissolveObservedAt === 'start-post'
        && prev.scholarHpAtDissolve != null && cur.scholarHpStart != null) {
        betweenDeltasExact.push({ seed, prevFightSeq: prev.fightSeq, curFightSeq: cur.fightSeq,
          prevDayStart: prev.dayStart, curDayStart: cur.dayStart, sameDay: prev.dayStart === cur.dayStart,
          prevHpAtDissolve: prev.scholarHpAtDissolve, curHpStart: cur.scholarHpStart,
          delta: cur.scholarHpStart - prev.scholarHpAtDissolve });
      } else betweenPairsBound++;
    }
    perSeed.push({ seed, days: row.days, valid, scholarmeltErrs: smDiag.errs || 0,
      census: cInfo, dissolved: dissolved.length, substrateRow: substrate.perSeedRow[seed],
      substrateCensus: substrate.perSeedCensus[seed] });
    if (row.won) wall.won++;
    if (row.nationalEver) wall.nationalEver++;
    if (row.nationalFinal) wall.nationalFinal++;
    if (row.table) wall.tableReached++;
    if (row.entered) wall.tableEntered++;
    const wr = row.waveReach || 0;
    for (let w = 1; w <= 5; w++) if (wr >= w) wall.waveReach[w]++;
    wall.days.push(row.days);
    wall.deaths += (row.deathTotal || 0);
  }
  wall.medianDays = medianOf(wall.days);
  wall.daysSorted = wall.days.slice().sort((a, b) => a - b);
  const withinSummary = (function () {
    if (!withinDeltas.length) return { n: 0, negative: 0, zero: 0, positive: 0, mean: null };
    let neg = 0, zero = 0, pos = 0, sum = 0;
    for (const d of withinDeltas) { sum += d.delta; if (d.delta < 0) neg++; else if (d.delta === 0) zero++; else pos++; }
    return { n: withinDeltas.length, negative: neg, zero, positive: pos, mean: sum / withinDeltas.length };
  })();
  const betweenSummary = (function () {
    if (!betweenDeltasExact.length) return { n: 0, negative: 0, zero: 0, positive: 0, mean: null };
    let neg = 0, zero = 0, pos = 0, sum = 0;
    for (const d of betweenDeltasExact) { sum += d.delta; if (d.delta < 0) neg++; else if (d.delta === 0) zero++; else pos++; }
    return { n: betweenDeltasExact.length, negative: neg, zero, positive: pos, mean: sum / betweenDeltasExact.length };
  })();
  const dissolvedPerSeed = {};
  for (const s of seeds) dissolvedPerSeed[s] = dissolvedRows.filter(r => r.seed === s).length;
  const result = { corpusDir: dir, draftflagDir, seeds, validSeeds, perSeed,
    dissolvedTotal: dissolvedRows.length, dissolvedPerSeed,
    fateCounts, unclassified,
    causeCounts, observedAtCounts, causeByObservedAt, causeByFate, fateByLift,
    coverage: { causeCovered, causeTotal: dissolvedRows.length,
      causePct: dissolvedRows.length ? causeCovered / dissolvedRows.length : null,
      hpCovered, hpTotal: dissolvedRows.length,
      hpPct: dissolvedRows.length ? hpCovered / dissolvedRows.length : null,
      barrierStamped, exactHpRows, boundHpRows },
    lingererOrigin: { total: lingererRows.length, fateCounts: lingererFateCounts,
      causeCounts: lingererCauseCounts,
      lackingRestoreFate: lingererRows.filter(r => r.fate === 'DISSOLVED-MELT' || r.fate === 'UNCLASSIFIED').length },
    spawnEnded: { total: spawnEndedRows.length, causeCounts: spawnEndedCauseCounts,
      barrierStamped: spawnEndedBarrier,
      rows: spawnEndedRows.map(r => ({ seed: r.seed, fightSeq: r.fightSeq, dayStart: r.dayStart,
        dayEnd: r.dayEnd, intendedMid: r.intendedMid, scholarHpStart: r.scholarHpStart,
        scholarHpAtDissolve: r.scholarHpAtDissolve, dissolveCause: r.dissolveCause,
        dissolveObservedAt: r.dissolveObservedAt, fate: r.fate })) },
    withinDeltas, withinSummary,
    betweenDeltasExact, betweenSummary, betweenPairsBound,
    dissolvedRows,
    substrate: { perSeedRow: substrate.perSeedRow, perSeedRowRaw: substrate.perSeedRowRaw,
      perSeedCensus: substrate.perSeedCensus,
      allRows: substrate.allRows, allRowsRaw: substrate.allRowsRaw, allCensus: substrate.allCensus,
      all: substrate.allRows && substrate.allCensus },
    wall };
  return result;
}

function main(argv) {
  const args = parseArgs(argv);
  const res = analyze(args.dir, args.seeds);
  fs.writeFileSync(args.out, JSON.stringify(res, null, 2) + '\n');
  console.log(`DISSOLVECAUSE: seeds=${res.seeds.length} valid=${res.validSeeds} dissolved=${res.dissolvedTotal} ` +
    `causeCovered=${res.coverage.causeCovered}/${res.coverage.causeTotal} ` +
    `hpCovered=${res.coverage.hpCovered}/${res.coverage.hpTotal} ` +
    `barrierStamped=${res.coverage.barrierStamped} exactHp=${res.coverage.exactHpRows} boundHp=${res.coverage.boundHpRows}`);
  console.log(`CAUSES: ${JSON.stringify(res.causeCounts)} OBSERVED_AT: ${JSON.stringify(res.observedAtCounts)}`);
  console.log(`FATES: ${JSON.stringify(res.fateCounts)} unclassified=${res.unclassified}`);
  console.log(`LINGERER: total=${res.lingererOrigin.total} fates=${JSON.stringify(res.lingererOrigin.fateCounts)} causes=${JSON.stringify(res.lingererOrigin.causeCounts)}`);
  console.log(`SPAWNENDED: total=${res.spawnEnded.total} causes=${JSON.stringify(res.spawnEnded.causeCounts)} barrier=${res.spawnEnded.barrierStamped}`);
  console.log(`WITHIN (exact, start-post only): ${JSON.stringify(res.withinSummary)}`);
  console.log(`BETWEEN (exact-anchor pairs): ${JSON.stringify(res.betweenSummary)} boundPairs=${res.betweenPairsBound}`);
  console.log(`SUBSTRATE: all=${res.substrate.all} rows=${res.substrate.allRows} rowsRaw=${res.substrate.allRowsRaw} census=${res.substrate.allCensus}`);
  console.log(`WALL: won=${res.wall.won} natEver=${res.wall.nationalEver} natFinal=${res.wall.nationalFinal} table=${res.wall.tableReached} entered=${res.wall.tableEntered} wave=${JSON.stringify(res.wall.waveReach)} median=${res.wall.medianDays} deaths=${res.wall.deaths}`);
  if (args.sense) {
    const bySeedDay = {};
    for (const r of res.dissolvedRows) {
      const k = `${r.seed}|${r.dayStart}`;
      (bySeedDay[k] = bySeedDay[k] || []).push(r);
    }
    for (const k of Object.keys(bySeedDay).sort()) {
      const rows = bySeedDay[k];
      console.log(`SENSE ${k}: n=${rows.length} seqs=${rows.map(r => r.fightSeq).join(',')} ` +
        `causes=${rows.map(r => r.dissolveCause).join(',')} ` +
        `hpStart=${rows.map(r => r.scholarHpStart).join(',')} ` +
        `hpDiss=${rows.map(r => r.scholarHpAtDissolve).join(',')} ` +
        `liftHp=${rows.map(r => (r.lift && r.lift.hp)).join(',')} ` +
        `lingering=${rows.map(r => (r.lift && r.lift.lingering)).join(',')} ` +
        `fates=${rows.map(r => r.fate).join(',')}`);
    }
  }
  return res;
}

module.exports = { analyze };
if (require.main === module) main(process.argv.slice(2));
