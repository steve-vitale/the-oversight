#!/usr/bin/env node
// scripts/analyze-dissolve-a.js — sim-dissolve-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of committed corpora, never game state,
// never writes into either corpus. Corpus: the draftflag corpus
// (evidence/2026-10-30/perseed-draftflag-a/), read-only; the
// scholarmelt analysis (evidence/2026-10-30/sim-scholarmelt-a-analysis.json)
// is read ONLY for the per-(seed,fightSeq) fate cross-check.
// Judges the prereg (evidence/2026-10-30/sim-dissolve-a-prereg.md):
// Path A — apply scholarmelt-a's post-end identity-check method
// (restored-first dissolved branch, verbatim) to the dissolved 120
// in the draftflag corpus; report the band fate split, the
// lingerer-origin (lift.lingering) fate split, the fled count, and
// the cross-check against scholarmelt-a's published fates.
// Usage:
//   node scripts/analyze-dissolve-a.js [--dir <dir>] [--out <file>]
//     [--seeds 75101,...] [--sense]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const SM_ANALYSIS = path.join(REPO, 'evidence', '2026-10-30', 'sim-scholarmelt-a-analysis.json');
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
  if (!out.out) out.out = path.join(REPO, 'evidence', '2026-10-30', 'sim-dissolve-a-analysis.json');
  return out;
}

// classifyDissolved(f): the restored-first dissolved branch, VERBATIM
// from scholarmelt-a's classifyFight (scripts/analyze-scholarmelt-a.js).
// Returns {fate, sub, why}. Non-dissolved rows return null (not in
// this arm's population).
function classifyDissolved(f) {
  if (!f || typeof f !== 'object') return { fate: 'UNCLASSIFIED', sub: 'no-row', why: 'missing row' };
  if (f.result !== 'dissolved-no-tbend') return null;
  if (f.restoredIdentity) return { fate: 'SCHOLAR-RESTORED', sub: 'dissolved-restored', why: 'flushed dissolved but lifted object is back by identity' };
  if (f.restoredEntry) return { fate: 'SCHOLAR-RESTORED', sub: 'dissolved-restored-entry', why: 'flushed dissolved; id+tile entry present post-end (identity absent)' };
  if (f.lifted === true) return { fate: 'DISSOLVED-MELT', sub: 'dissolved', why: 'flushed dissolved; lifted and absent (tbEnd is the only restore path)' };
  if (f.lifted === false && !f.lift) return { fate: 'SPAWN-ENDED', sub: 'dissolved-spawned', why: 'flushed dissolved; no lift (spawned fight)' };
  if (f.lifted === false) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'dissolved-never-lifted', why: 'flushed dissolved; lift object present at start post-record — this fight never removed it' };
  if (f.bystander) return { fate: 'BYSTANDER-OR-NONMONSTER', sub: 'dissolved-bystander', why: 'flushed dissolved; tile monster was a bystander, not a fighter' };
  return { fate: 'UNCLASSIFIED', sub: 'dissolved-ambiguous', why: 'flushed dissolved with ambiguous lift/restore state' };
}

// isLingererOrigin(f): the prereg's measurable lingerer-origin rule
// for dissolved rows. worldOrigin is null on every dissolved row by
// construction (no tbEnd), so the rule reads the pre-start lift
// snapshot: a lingering tile monster at fight start.
function isLingererOrigin(f) { return !!(f && f.lift && f.lift.lingering === true); }

function censusInfo(census, rowDays) {
  const snaps = census.snapshots || [];
  let sorted = true;
  for (let i = 1; i < snaps.length; i++) if (snaps[i].day < snaps[i - 1].day) sorted = false;
  const lastDay = snaps.length ? snaps[snaps.length - 1].day : null;
  return { snapshots: snaps.length, sorted, lastDay, within1: lastDay !== null && Math.abs(lastDay - rowDays) <= 1 };
}

function medianOf(arr) { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; }

function analyze(dir, seeds, smAnalysisPath) {
  const sm = JSON.parse(fs.readFileSync(smAnalysisPath || SM_ANALYSIS, 'utf8'));
  const smFateByKey = {};
  for (const f of (sm.fights || [])) smFateByKey[`${f.seed}|${f.fightSeq}`] = f.fate;
  const perSeed = [];
  const dissolvedRows = [];
  const lingererRows = [];
  const mismatchRows = [];
  const identityEntryMismatch = [];
  const fateCounts = {};
  const lingererFateCounts = {};
  let fledTotal = 0;
  const fledPerSeed = {};
  const dissolvedPerSeed = {};
  const wall = { won: 0, nationalEver: 0, nationalFinal: 0, tableReached: 0, tableEntered: 0,
    waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, days: [], deaths: 0 };
  let validSeeds = 0;
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-fresh.json`), 'utf8'));
    const census = JSON.parse(fs.readFileSync(path.join(dir, `census-s${seed}.json`), 'utf8'));
    const smStore = (row.scholarmelt && row.scholarmelt.meetings) || [];
    const smDiag = (row.scholarmelt && row.scholarmelt.diag) || {};
    const cInfo = censusInfo(census, row.days);
    const valid = row.days > 0 && smDiag.errs === 0 && Object.keys(smDiag.overflow || {}).length === 0
      && cInfo.sorted && cInfo.within1;
    if (valid) validSeeds++;
    // Fled population: tbend events in the draftflag field.
    const events = ((row.draftflag || {}).events || []);
    const tbends = events.filter(e => e.type === 'tbend');
    const fled = tbends.filter(e => e.result === 'fled');
    fledPerSeed[seed] = fled.length;
    fledTotal += fled.length;
    const dissolved = smStore.filter(m => m.result === 'dissolved-no-tbend');
    dissolvedPerSeed[seed] = dissolved.length;
    const seedFateCounts = {};
    for (const m of dissolved) {
      const c = classifyDissolved(m);
      const rec = { seed, fightSeq: m.fightSeq, dayStart: m.dayStart, dayEnd: m.dayEnd,
        intendedMid: m.intendedMid, kind: m.kind, tableTrial: !!m.tableTrial,
        tile: [m.tilePx, m.tilePy],
        lift: m.lift ? { id: m.lift.id, hp: m.lift.hp, maxHp: m.lift.maxHp, tx: m.lift.tx, ty: m.lift.ty,
          lingering: !!m.lift.lingering, titan: !!m.lift.titan, wave: m.lift.wave } : null,
        lifted: m.lifted, restoredIdentity: !!m.restoredIdentity, restoredEntry: !!m.restoredEntry,
        restoredHp: m.restoredHp, scholarHpStart: m.scholarHpStart, scholarHpEnd: m.scholarHpEnd,
        fate: c.fate, sub: c.sub, why: c.why,
        lingererOrigin: isLingererOrigin(m),
        smFate: smFateByKey[`${seed}|${m.fightSeq}`] || null };
      rec.crosscheckAgree = (rec.smFate === rec.fate);
      if (!rec.crosscheckAgree) mismatchRows.push(rec);
      if (rec.restoredIdentity && !rec.restoredEntry) identityEntryMismatch.push(rec);
      fateCounts[rec.fate] = (fateCounts[rec.fate] || 0) + 1;
      seedFateCounts[rec.fate] = (seedFateCounts[rec.fate] || 0) + 1;
      dissolvedRows.push(rec);
      if (rec.lingererOrigin) {
        lingererRows.push(rec);
        lingererFateCounts[rec.fate] = (lingererFateCounts[rec.fate] || 0) + 1;
      }
    }
    perSeed.push({ seed, days: row.days, valid, scholarmeltErrs: smDiag.errs || 0,
      census: cInfo, dissolved: dissolved.length, fateCounts: seedFateCounts,
      tbendEvents: tbends.length, fled: fled.length });
    // Wall numbers (carried, verified from this corpus).
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
  const lingererLacking = lingererRows.filter(r => r.fate === 'DISSOLVED-MELT' || r.fate === 'UNCLASSIFIED');
  const result = { corpusDir: dir, seeds, validSeeds, perSeed, dissolvedTotal: dissolvedRows.length,
    dissolvedPerSeed, fateCounts, unclassified: fateCounts.UNCLASSIFIED || 0,
    dissolvedRows, lingererOrigin: { total: lingererRows.length, fateCounts: lingererFateCounts,
      lackingRestoreFate: lingererLacking.length, lackingRows: lingererLacking },
    identityEntryMismatch: identityEntryMismatch.map(r => ({ seed: r.seed, fightSeq: r.fightSeq,
      dayStart: r.dayStart, fate: r.fate, sub: r.sub, lift: r.lift })),
    fled: { total: fledTotal, perSeed: fledPerSeed, dissolvedFledContribution: 0 },
    crosscheck: { compared: dissolvedRows.length, agree: dissolvedRows.length - mismatchRows.length,
      mismatches: mismatchRows },
    wall };
  return result;
}

function main(argv) {
  const args = parseArgs(argv);
  const res = analyze(args.dir, args.seeds, SM_ANALYSIS);
  fs.writeFileSync(args.out, JSON.stringify(res, null, 2) + '\n');
  console.log(`DISSOLVE: seeds=${res.seeds.length} valid=${res.validSeeds} dissolved=${res.dissolvedTotal} ` +
    `fates=${JSON.stringify(res.fateCounts)} lingererOrigin=${res.lingererOrigin.total} ` +
    `lingererFates=${JSON.stringify(res.lingererOrigin.fateCounts)} ` +
    `lingererLacking=${res.lingererOrigin.lackingRestoreFate} fledTbend=${res.fled.total} ` +
    `crosscheck=${res.crosscheck.agree}/${res.crosscheck.compared} mismatches=${res.crosscheck.mismatches.length} ` +
    `identityEntryMismatch=${res.identityEntryMismatch.length}`);
  if (args.sense) {
    // Sense print: per-seed dissolved day-clusters + the rows in them.
    const bySeedDay = {};
    for (const r of res.dissolvedRows) {
      const k = `${r.seed}|${r.dayStart}`;
      (bySeedDay[k] = bySeedDay[k] || []).push(r);
    }
    for (const k of Object.keys(bySeedDay).sort()) {
      const rows = bySeedDay[k];
      console.log(`SENSE ${k}: n=${rows.length} seqs=${rows.map(r => r.fightSeq).join(',')} ` +
        `scholarHpStart=${rows.map(r => r.scholarHpStart).join(',')} ` +
        `liftHp=${rows.map(r => (r.lift && r.lift.hp)).join(',')} ` +
        `lingering=${rows.map(r => (r.lift && r.lift.lingering)).join(',')} ` +
        `fates=${rows.map(r => r.fate).join(',')}`);
    }
  }
  return res;
}

module.exports = { classifyDissolved, isLingererOrigin, analyze };
if (require.main === module) main(process.argv.slice(2));
