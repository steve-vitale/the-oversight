#!/usr/bin/env node
// scripts/test-breakline-a.js — sim-breakline-a analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Primary: evidence/2026-10-29/perseed-breakline-a/s<seed>-fresh.json
//   (fieldparty.meetings + w4dpr.meetings + breakline.meetings,
//   seeds 75101-75108).
// Join: per seed, all three recorders join by fight-order index;
// VERIFIED (mid, vid, day must match at every index); join errors
// must be 0 (the returns join method).
// Universe U (judgedA shape, waves 1-4): wave in 1..4, channel ==
// 'field', caller in {resolve, patrol, aid}, leader NOT the scholar.
// Fought = rounds >= 1; unfought counted separately.
// Break lines via scripts/breakline-lib.js classifyBranch (headline)
// plus classifyFlags cross-tab (w4dpr flag taxonomy).
// Party split: tile-present = fieldparty `tile` list at fight start
// excluding deadKnown === true, length >= 1; else solo-tile.
// Neutrality bar (w4dpr2 subset, exact): fieldparty meetings 1272,
// deaths 286, won 3, nationalEver 7, wave-4 judgedA per-seed
// 75106:15, 75108:9, others 0.
// Usage: node scripts/test-breakline-a.js [--out <path>]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyBranch, classifyFlags } = require('./breakline-lib');
const SEEDS = [];
for (let s = 75101; s <= 75108; s++) SEEDS.push(s);
const EXPECTED_W4_PER_SEED = { 75106: 15, 75108: 9 };
function round1(v) { return (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 10) / 10; }
function share(n, d) { return d ? Math.round(1000 * n / d) / 10 : null; }
const BREAK_ORDER = ['KILL', 'CAP', 'DRIVE-OFF', 'PARTY-DEATH', 'HOPELESS-BRANCH', 'LEARN-BRANCH', 'TRICK-EXIT', 'FLOOR-BRANCH', 'OTHER'];
const FLAG_ORDER = ['KILL', 'CAP', 'DRIVE-OFF', 'PARTY-DEATH', 'HOPELESS', 'LEARN-WITHDRAWAL', 'TRICK-EXIT', 'WOUND-FLOOR', 'OTHER'];

function analyze(evidDir) {
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && storeOk(r.fieldparty) && storeOk(r.w4dpr) && storeOk(r.breakline));
  // Join + branch recomputation check.
  let joinErrors = 0, joinTotal = 0, branchMismatches = 0;
  const joined = []; // {seed, fp, dp, bl}
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [], bl = r.breakline.meetings || [];
    const n = Math.min(fp.length, dp.length, bl.length);
    joinErrors += Math.abs(fp.length - dp.length) + Math.abs(fp.length - bl.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i], c = bl[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day
        || a.mid !== c.mid || a.vid !== c.vid || a.day !== c.day) { joinErrors++; continue; }
      const recomputed = classifyBranch(c);
      if (recomputed.reason !== c.branch) branchMismatches++;
      joined.push({ seed: r.seed, fp: a, dp: b, bl: c });
    }
  }
  const isJudged = (m) => (m.wave | 0) >= 1 && (m.wave | 0) <= 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar);
  const U = joined.filter(j => isJudged(j.fp));
  const fought = U.filter(j => (j.bl.rounds | 0) >= 1);
  const unfought = U.filter(j => (j.bl.rounds | 0) < 1);
  const unfoughtOutcomes = {};
  for (const j of unfought) unfoughtOutcomes[j.bl.outcome || 'null'] = (unfoughtOutcomes[j.bl.outcome || 'null'] || 0) + 1;
  // Supplemental (never pooled).
  const scholarLed = joined.filter(j => (j.fp.wave | 0) >= 1 && (j.fp.wave | 0) <= 4 && j.fp.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(j.fp.caller) >= 0 && (j.fp.leader && j.fp.leader.isScholar));
  const otherCaller = joined.filter(j => (j.fp.wave | 0) >= 1 && (j.fp.wave | 0) <= 4 && j.fp.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(j.fp.caller) < 0);
  const nonField = joined.filter(j => (j.fp.wave | 0) >= 1 && (j.fp.wave | 0) <= 4 && j.fp.channel !== 'field');
  const wave5plus = joined.filter(j => (j.fp.wave | 0) >= 5);

  function tilePresent(j) {
    const tile = (j.fp.tile || []).filter(t => t.deadKnown !== true);
    return tile.length >= 1;
  }
  function census(list) {
    const out = { n: list.length, byBreak: {}, byWave: {}, byParty: {}, byWaveParty: {},
      flagByBreak: {}, vFleeSplit: {}, fightList: [] };
    for (const k of BREAK_ORDER) out.byBreak[k] = 0;
    for (const k of FLAG_ORDER) out.flagByBreak[k] = 0;
    for (const j of list) {
      const br = classifyBranch(j.bl);
      const fl = classifyFlags(j.bl);
      const party = tilePresent(j) ? 'party' : 'solo';
      const foughtSize = j.bl.joinedAllyVid ? 2 : 1;
      const joinedWasTile = j.bl.joinedAllyVid
        ? ((j.fp.tile || []).some(t => String(t.vid) === String(j.bl.joinedAllyVid)) ? 'joined-was-tile' : 'joined-not-tile')
        : 'no-join';
      out.byBreak[br.reason]++;
      out.flagByBreak[fl.reason]++;
      const w = 'w' + (j.fp.wave | 0);
      out.byWave[w] = out.byWave[w] || { n: 0, byBreak: {} };
      out.byWave[w].n++; out.byWave[w].byBreak[br.reason] = (out.byWave[w].byBreak[br.reason] || 0) + 1;
      out.byParty[party] = out.byParty[party] || { n: 0, byBreak: {} };
      out.byParty[party].n++; out.byParty[party].byBreak[br.reason] = (out.byParty[party].byBreak[br.reason] || 0) + 1;
      const wp = w + '-' + party;
      out.byWaveParty[wp] = out.byWaveParty[wp] || { n: 0, byBreak: {} };
      out.byWaveParty[wp].n++; out.byWaveParty[wp].byBreak[br.reason] = (out.byWaveParty[wp].byBreak[br.reason] || 0) + 1;
      if (j.bl.outcome === 'vFlee') {
        const key = br.reason + '|' + fl.reason + '|' + joinedWasTile;
        out.vFleeSplit[key] = (out.vFleeSplit[key] || 0) + 1;
      }
      out.fightList.push({ seed: j.seed, day: j.bl.day, mid: j.bl.mid, wave: j.fp.wave,
        caller: j.fp.caller, outcome: j.bl.outcome, reason: br.reason, sub: br.sub,
        flagReason: fl.reason, rounds: j.bl.rounds, mHpStart: j.bl.mHpStart,
        mDealt: j.bl.mDealt, vTaken: j.bl.vTaken, party: party, foughtSize: foughtSize,
        joinedWasTile: joinedWasTile, tileCount: (j.fp.tile || []).filter(t => t.deadKnown !== true).length,
        tileUnknown: j.fp.tileUnknown, intent: j.bl.intent,
        fleeHopeless: j.bl.fleeHopeless, fleeLearn: j.bl.fleeLearn, fleeWise: j.bl.fleeWise });
    }
    out.byBreakShares = {};
    for (const k of BREAK_ORDER) out.byBreakShares[k] = share(out.byBreak[k], out.n);
    out.otherCount = out.byBreak.OTHER || 0;
    out.assignedPct = out.n ? share(out.n - out.otherCount, out.n) : null;
    return out;
  }
  const cen = census(fought);
  const w4 = census(fought.filter(j => (j.fp.wave | 0) === 4));
  const perSeedW4 = {};
  for (const j of fought.filter(x => (x.fp.wave | 0) === 4)) perSeedW4[j.seed] = (perSeedW4[j.seed] || 0) + 1;
  const perSeedW4Match = SEEDS.every(s => (perSeedW4[s] || 0) === (EXPECTED_W4_PER_SEED[s] || 0));
  const fpMeetingsTotal = rows.reduce((t, r) => t + (r.fieldparty.meetings || []).length, 0);
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const nationalFinal = rows.reduce((t, r) => t + r.nationalFinal, 0);
  const table = rows.reduce((t, r) => t + r.table, 0);
  const entered = rows.reduce((t, r) => t + r.entered, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const waveReachCount = (w) => rows.filter(r => (r.waveReach || 1) >= w).length;
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const medianDays = (() => { const ds = rows.map(r => r.days).sort((a, b) => a - b); return ds[Math.floor(ds.length / 2)]; })();
  const neutralityExact = fpMeetingsTotal === 1272 && deaths === 286 && won === 3 && nationalEver === 7 && perSeedW4Match;
  const coverage = { seeds: rows.length, fought: fought.length, assigned: fought.length - cen.otherCount,
    assignedPct: cen.assignedPct, other: cen.otherCount,
    pass: rows.length === 8 && fought.length >= 50 && cen.otherCount === 0 };
  const machinePass = corpusOk && joinErrors === 0 && branchMismatches === 0 && neutralityExact && coverage.pass;
  // Sense availability per seed (first-of-branch logs).
  const senseAvailable = {};
  for (const r of rows) {
    const s = (r.breakline || {}).sense || {};
    for (const k of ['floor', 'hopeless', 'learn']) if (s[k]) senseAvailable[k] = (senseAvailable[k] || 0) + 1;
  }
  return { corpusOk, joinTotal, joinErrors, branchMismatches,
    universe: U.length, fought: fought.length, unfought: unfought.length, unfoughtOutcomes,
    supplemental: { scholarLed: scholarLed.length, otherCaller: otherCaller.length, nonField: nonField.length, wave5plus: wave5plus.length },
    census: cen, w4census: w4, perSeedW4, perSeedW4Match,
    wall: { won, wonFull, nationalEver, nationalFinal, table, entered,
      wave1: waveReachCount(1), wave2: waveReachCount(2), wave3: waveReachCount(3), wave4: waveReachCount(4), wave5: waveReachCount(5),
      medianDays, deaths, deathsByCause, fpMeetingsTotal },
    neutralityExact, coverage, senseAvailable, machinePass };
}

function printReport(r) {
  console.log('=== sim-breakline-a census ===');
  console.log(`corpus: ok=${r.corpusOk} join=${r.joinTotal - r.joinErrors}/${r.joinTotal} errs=${r.joinErrors} branchMismatches=${r.branchMismatches}`);
  console.log(`UNIVERSE: U=${r.universe} fought=${r.fought} unfought=${r.unfought} (${JSON.stringify(r.unfoughtOutcomes)}) supplemental=${JSON.stringify(r.supplemental)}`);
  console.log(`WALL: won=${r.wall.won} (full=${r.wall.wonFull}) natEver=${r.wall.nationalEver} natFinal=${r.wall.nationalFinal} table=${r.wall.table} entered=${r.wall.entered} waves 1-5 reach=${r.wall.wave1}/${r.wall.wave2}/${r.wall.wave3}/${r.wall.wave4}/${r.wall.wave5} medianDays=${r.wall.medianDays} deaths=${r.wall.deaths} fpMeetings=${r.wall.fpMeetingsTotal} neutralityExact=${r.neutralityExact ? 'PASS' : 'FAIL'}`);
  console.log(`PER-SEED w4 fought: ${JSON.stringify(r.perSeedW4)} match=${r.perSeedW4Match ? 'PASS' : 'FAIL'}`);
  console.log(`CENSUS (fought wild, waves 1-4): n=${r.census.n}`);
  console.log(`  BY-BREAK: ${JSON.stringify(r.census.byBreak)} shares%: ${JSON.stringify(r.census.byBreakShares)} OTHER=${r.census.otherCount}`);
  console.log(`  BY-WAVE: ${JSON.stringify(r.census.byWave)}`);
  console.log(`  BY-PARTY: ${JSON.stringify(r.census.byParty)}`);
  console.log(`  BY-WAVE-PARTY: ${JSON.stringify(r.census.byWaveParty)}`);
  console.log(`  FLAG-CROSSTAB: ${JSON.stringify(r.census.flagByBreak)}`);
  console.log(`  VFLEE-SPLIT (branch|flag|join): ${JSON.stringify(r.census.vFleeSplit)}`);
  console.log(`W4-SUBSET: n=${r.w4census.n} BY-BREAK=${JSON.stringify(r.w4census.byBreak)} BY-PARTY=${JSON.stringify(r.w4census.byParty)} FLAG=${JSON.stringify(r.w4census.flagByBreak)}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(r.wall.deathsByCause)}`);
  console.log(`SENSE-AVAILABLE (seeds with a first-of-branch log): ${JSON.stringify(r.senseAvailable)}`);
  console.log(`COVERAGE: seeds=${r.coverage.seeds} fought=${r.coverage.fought} assigned=${r.coverage.assigned} assignedPct=${r.coverage.assignedPct}% other=${r.coverage.other} pass=${r.coverage.pass ? 'PASS' : 'FAIL'}`);
  console.log(`MACHINE LEGS: ${r.machinePass ? 'PASS' : 'FAIL'}`);
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-breakline-a');
  const r = analyze(evidDir);
  printReport(r);
  if (outIdx >= 0 && args[outIdx + 1]) {
    fs.mkdirSync(path.dirname(args[outIdx + 1]), { recursive: true });
    fs.writeFileSync(args[outIdx + 1], JSON.stringify(r, null, 1) + '\n');
    console.log('wrote ' + args[outIdx + 1]);
  }
  if (!r.machinePass) { console.log('MACHINE-LEGS-FAIL'); process.exit(1); }
  console.log('MACHINE-LEGS-PASS');
}
if (require.main === module) main().catch(e => { console.error('ANALYZER-FAIL', e && e.stack || e); process.exit(1); });
module.exports = { analyze, printReport };
