#!/usr/bin/env node
// scripts/test-w4dpr2.js — sim-w4dpr2 analyzer / judge.
// DIAGNOSIS ONLY: pure reads of the sim corpus, never game state.
// Primary: evidence/2026-10-29/perseed-w4dpr2/s<seed>-fresh.json
//   (fieldparty.meetings + w4dpr.meetings, seeds 75101-75116).
// Join: per seed, w4dpr meetings join to fieldparty meetings by
// fight-order index; VERIFIED (mid, vid, day must match at every
// index); join errors must be 0 (the returns join method).
// Universe U (judgedA verbatim): wave == 4, channel == 'field',
// caller in {resolve, patrol, aid}, leader NOT the scholar.
// Per-round decomposition parses the engine's rec.log via
// scripts/w4dpr2-lib.js (parseFightLog); break reasons via
// classifyBreak (prereg priority order). Wall reproduction bar
// (returns-a, exact): wins 4/16 all lesser, nationalEver 13/16,
// deaths 600, per-seed judgedA 75106:15, 75108:9, 75109:8,
// 75115:5, 75116:4, 75110:1, others 0.
// Exit 1 on corpus invalidity, control-shape failure, join
// errors, wall mismatch, or coverage failure. The DIAG-GO
// verdict additionally requires the sense transcripts + ranked
// next step in the evidence file (not checkable here).
// Usage: node scripts/test-w4dpr2.js [--out <path>]
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { parseFightLog, classifyBreak, loadoutClass, quartiles } = require('./w4dpr2-lib');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);
const EXPECTED_PER_SEED = { 75106: 15, 75108: 9, 75109: 8, 75115: 5, 75116: 4, 75110: 1 };
function round1(v) { return (v === null || v === undefined || !Number.isFinite(v)) ? null : Math.round(v * 10) / 10; }
function mean(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : null; }
function share(n, d) { return d ? Math.round(1000 * n / d) / 10 : null; }

function analyze(evidDir) {
  const rows = [];
  for (const seed of SEEDS16) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS16.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.w4dpr && Array.isArray(r.w4dpr.meetings)
    && r.w4dpr.diag.errs === 0 && Object.values(r.w4dpr.diag.overflow || {}).every(v => (v | 0) === 0));
  // Join + judged universes.
  let joinErrors = 0, joinTotal = 0;
  const joined = []; // {seed, fp, dp}
  for (const r of rows) {
    const fp = r.fieldparty.meetings || [], dp = r.w4dpr.meetings || [];
    if (fp.length !== dp.length) joinErrors += Math.abs(fp.length - dp.length);
    const n = Math.min(fp.length, dp.length);
    for (let i = 0; i < n; i++) {
      joinTotal++;
      const a = fp[i], b = dp[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day) joinErrors++;
      else joined.push({ seed: r.seed, fp: a, dp: b });
    }
  }
  const isJudged = (m, wave) => (m.wave | 0) === wave && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar);
  const U = joined.filter(j => isJudged(j.fp, 4));
  const W3 = joined.filter(j => isJudged(j.fp, 3));
  const judgedA = U.length;
  const formedA = U.filter(j => ((j.fp.crewRaw || []).filter(v => v !== j.fp.vid)).length > 0 && (j.fp.calledHelp || j.fp.joinedAllyVid)).length;
  const killsA = U.filter(j => j.fp.outcome === 'vKill').length;
  const judgedB = joined.filter(j => (j.fp.wave | 0) === 4 && j.fp.channel === 'field' && ['resolve', 'patrol'].indexOf(j.fp.caller) >= 0 && !(j.fp.leader && j.fp.leader.isScholar));
  const formedB = judgedB.filter(j => ((j.fp.crewRaw || []).filter(v => v !== j.fp.vid)).length > 0 && (j.fp.calledHelp || j.fp.joinedAllyVid)).length;
  const killsB = judgedB.filter(j => j.fp.outcome === 'vKill').length;
  const controlShape = formedA === 0 && formedB === 0 && killsA === 0 && killsB === 0;
  const perSeed = {};
  for (const j of U) perSeed[j.seed] = (perSeed[j.seed] || 0) + 1;
  const perSeedMatch = SEEDS16.every(s => (perSeed[s] || 0) === (EXPECTED_PER_SEED[s] || 0));
  const won = rows.reduce((t, r) => t + r.won, 0);
  const wonFull = rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length;
  const nationalEver = rows.reduce((t, r) => t + r.nationalEver, 0);
  const deaths = rows.reduce((t, r) => t + r.deathTotal, 0);
  const wallExact = won === 4 && wonFull === 0 && nationalEver === 13 && deaths === 600 && perSeedMatch;
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;

  // Decomposition of one universe (U or W3 contrast).
  function decompose(list) {
    const fought = list.filter(j => (j.dp.rounds | 0) >= 1);
    const unfought = list.filter(j => (j.dp.rounds | 0) < 1);
    const out = { n: list.length, fought: fought.length, unfought: unfought.length,
      unfoughtOutcomes: {}, breaks: {}, breakList: [], parse: { exact: 0, mismatch: 0, mismatches: [] },
      dpr: {}, takenPerRound: {}, survival: {}, byComp: {}, byLoadout: {}, byRound: {}, capFit: {}, fights: [] };
    for (const j of unfought) out.unfoughtOutcomes[j.dp.outcome || 'null'] = (out.unfoughtOutcomes[j.dp.outcome || 'null'] || 0) + 1;
    for (const j of fought) {
      const f = j.dp;
      const parsed = parseFightLog(f);
      const br = classifyBreak(f);
      const lo = (f.loadoutPost && (f.loadoutPost.melee || f.loadoutPost.ranged)) ? f.loadoutPost : f.loadoutPre;
      const loClass = loadoutClass(lo);
      const loUsed = (f.loadoutPost && (f.loadoutPost.melee || f.loadoutPost.ranged)) ? 'post' : 'pre';
      const foughtSize = f.joinedAllyVid ? 2 : 1;
      const joinKind = !f.joinedAllyVid ? 'solo' : (f.allyFromStart ? 'from-start' : 'shout-joined');
      const dpr = f.rounds ? f.mDealt / f.rounds : 0;
      const takenPr = f.rounds ? (f.vTaken + f.allyTaken) / f.rounds : 0;
      const reqRounds = dpr > 0 ? f.mHpStart / dpr : Infinity;
      const parseOk = parsed.dealtDelta === 0 && parsed.takenDelta === 0 && parsed.allyDelta === 0;
      if (parseOk) out.parse.exact++; else { out.parse.mismatch++; if (out.parse.mismatches.length < 30) out.parse.mismatches.push({ seed: j.seed, day: f.day, mid: f.mid, outcome: f.outcome, rounds: f.rounds, dealtDelta: parsed.dealtDelta, takenDelta: parsed.takenDelta, allyDelta: parsed.allyDelta, unknownDealt: parsed.unknownDealt, unknownTaken: parsed.unknownTaken }); }
      out.breaks[br.reason] = (out.breaks[br.reason] || 0) + 1;
      out.breakList.push({ seed: j.seed, day: f.day, mid: f.mid, outcome: f.outcome, reason: br.reason, sub: br.sub, rounds: f.rounds, mHpStart: f.mHpStart, mHpLeft: f.mHpLeft, mDealt: f.mDealt, dpr: round1(dpr), reqRounds: Number.isFinite(reqRounds) ? round1(reqRounds) : null, capFit: reqRounds <= 15, parseOk: parseOk, trickLog: f.trickLog || [] });
      const rec = { seed: j.seed, day: f.day, mid: f.mid, outcome: f.outcome, reason: br.reason, sub: br.sub,
        rounds: f.rounds, mHpStart: f.mHpStart, mHpLeft: f.mHpLeft, mDealt: f.mDealt, vTaken: f.vTaken, allyDealt: f.allyDealt, allyTaken: f.allyTaken,
        dpr: round1(dpr), takenPerRound: round1(takenPr), reqRounds: Number.isFinite(reqRounds) ? round1(reqRounds) : null, capFit: reqRounds <= 15,
        foughtSize: foughtSize, joinKind: joinKind, loadout: loClass, loadoutUsed: loUsed,
        leaderArmed: (j.fp.leader && j.fp.leader.armed), leaderArmorP: (j.fp.leader && j.fp.leader.armorP),
        trickKnown: j.fp.trickKnown, intent: f.intent, everHopeless: f.everHopeless, everWinning: f.everWinning,
        volleyDealt: parsed.volleyDealt, leaderDealt: parsed.leaderDealt, parsedAllyDealt: parsed.allyDealt,
        leaderTaken: parsed.leaderTaken, parsedAllyTaken: parsed.allyTaken, heals: parsed.heals,
        parseOk: parseOk, dealtDelta: parsed.dealtDelta, takenDelta: parsed.takenDelta, allyDelta: parsed.allyDelta,
        perRound: parsed.per };
      out.fights.push(rec);
      const byC = out.byComp[joinKind] || (out.byComp[joinKind] = { n: 0, dprs: [], takenPrs: [], rounds: [], kills: 0 });
      byC.n++; byC.dprs.push(dpr); byC.takenPrs.push(takenPr); byC.rounds.push(f.rounds); if (f.outcome === 'vKill') byC.kills++;
      const byL = out.byLoadout[loClass] || (out.byLoadout[loClass] = { n: 0, dprs: [], takenPrs: [], rounds: [], kills: 0 });
      byL.n++; byL.dprs.push(dpr); byL.takenPrs.push(takenPr); byL.rounds.push(f.rounds); if (f.outcome === 'vKill') byL.kills++;
      for (const pr of parsed.per) {
        if (pr.round === 0) continue;
        const br2 = out.byRound[pr.round] || (out.byRound[pr.round] = { n: 0, dealt: [], taken: [], leaderDealt: [], allyDealt: [] });
        br2.n++; br2.dealt.push(pr.leaderDealt + pr.allyDealt); br2.taken.push(pr.leaderTaken + pr.allyTaken); br2.leaderDealt.push(pr.leaderDealt); br2.allyDealt.push(pr.allyDealt);
      }
    }
    const dprs = out.fights.map(f => f.dpr);
    const dprsHealthy500 = out.fights.filter(f => f.mHpStart >= 500).map(f => f.dpr);
    const dprsFresh850 = out.fights.filter(f => f.mHpStart >= 850).map(f => f.dpr);
    const takenPrs = out.fights.map(f => f.takenPerRound);
    const surv = out.fights.map(f => f.rounds);
    out.dpr = { all: quartiles(dprs), ge500: quartiles(dprsHealthy500), ge850: quartiles(dprsFresh850), meanAll: round1(mean(dprs)) };
    out.takenPerRound = quartiles(takenPrs);
    out.survival = quartiles(surv);
    out.survivalByOutcome = {};
    for (const o of ['vKill', 'mFlee', 'vFlee', 'vDie']) {
      const rs = out.fights.filter(f => f.outcome === o).map(f => f.rounds);
      if (rs.length) out.survivalByOutcome[o] = { n: rs.length, quartiles: quartiles(rs) };
    }
    for (const k of Object.keys(out.byComp)) { const c = out.byComp[k]; c.dprQ = quartiles(c.dprs); c.takenQ = quartiles(c.takenPrs); c.roundQ = quartiles(c.rounds); delete c.dprs; delete c.takenPrs; delete c.rounds; }
    for (const k of Object.keys(out.byLoadout)) { const c = out.byLoadout[k]; c.dprQ = quartiles(c.dprs); c.takenQ = quartiles(c.takenPrs); c.roundQ = quartiles(c.rounds); delete c.dprs; delete c.takenPrs; delete c.rounds; }
    for (const k of Object.keys(out.byRound)) { const c = out.byRound[k]; c.dealtQ = quartiles(c.dealt); c.takenQ = quartiles(c.taken); c.leaderDealtMean = round1(mean(c.leaderDealt)); c.allyDealtMean = round1(mean(c.allyDealt)); delete c.dealt; delete c.taken; delete c.leaderDealt; delete c.allyDealt; }
    const capFits = out.fights.filter(f => f.capFit).length;
    out.capFit = { fits: capFits, total: out.fights.length, pct: share(capFits, out.fights.length),
      atMedianDpr: out.dpr.all.med ? { req850: round1(850 / out.dpr.all.med), req1100: round1(1100 / out.dpr.all.med), req1500: round1(1500 / out.dpr.all.med) } : null,
      atBand57: { req850: round1(850 / 57), req1100: round1(1100 / 57), req1500: round1(1500 / 57) },
      atBand80: { req850: round1(850 / 80), req1100: round1(1100 / 80), req1500: round1(1500 / 80) } };
    out.breakShares = {};
    for (const k of Object.keys(out.breaks)) out.breakShares[k] = share(out.breaks[k], out.fought);
    out.otherCount = out.breaks.OTHER || 0;
    out.assignedPct = out.fought ? share(out.fought - out.otherCount, out.fought) : null;
    return out;
  }

  const w4 = decompose(U);
  const w3 = decompose(W3);
  const coverage = { seeds: rows.length, fightsWithBreak: w4.fought - w4.otherCount, fought: w4.fought, assignedPct: w4.assignedPct,
    pass: rows.length === 16 && (w4.fought - w4.otherCount) >= 20 && (w4.assignedPct || 0) >= 90 };
  const machinePass = corpusOk && joinErrors === 0 && controlShape && wallExact && coverage.pass;
  const result = { corpusOk, joinTotal, joinErrors, controlShape,
    judgedA, formedA, killsA, judgedB: judgedB.length, formedB, killsB, perSeed,
    wall: { won, wonFull, nationalEver, deaths, medianDays: null, deathsByCause },
    wallExact, w4, w3, coverage, machinePass };
  result.wall.medianDays = (() => { const ds = rows.map(r => r.days).sort((a, b) => a - b); return ds[Math.floor(ds.length / 2)]; })();
  return result;
}

function printReport(r) {
  console.log('=== sim-w4dpr2 decomposition ===');
  console.log(`corpus: ok=${r.corpusOk} join=${r.joinTotal - r.joinErrors}/${r.joinTotal} errs=${r.joinErrors} controlShape=${r.controlShape ? 'PASS' : 'FAIL'} (judgedA=${r.judgedA} formedA=${r.formedA} killsA=${r.killsA}; judgedB=${r.judgedB} formedB=${r.formedB} killsB=${r.killsB})`);
  console.log(`WALL-REPRO: won=${r.wall.won} (full=${r.wall.wonFull}) natEver=${r.wall.nationalEver} deaths=${r.wall.deaths} medianDays=${r.wall.medianDays} exact=${r.wallExact ? 'PASS' : 'FAIL'}`);
  console.log(`PER-SEED judgedA: ${JSON.stringify(r.perSeed)}`);
  for (const [label, d] of [['W4', r.w4], ['W3-contrast', r.w3]]) {
    console.log(`--- ${label}: n=${d.n} fought=${d.fought} unfought=${d.unfought} (${JSON.stringify(d.unfoughtOutcomes)}) parseExact=${d.parse.exact} parseMismatch=${d.parse.mismatch}`);
    console.log(`  BREAKS: ${JSON.stringify(d.breaks)} shares%: ${JSON.stringify(d.breakShares)} OTHER=${d.otherCount}`);
    console.log(`  DPR quartiles all=${JSON.stringify(d.dpr.all)} ge500=${JSON.stringify(d.dpr.ge500)} ge850=${JSON.stringify(d.dpr.ge850)} meanAll=${d.dpr.meanAll}`);
    console.log(`  TAKEN/round quartiles=${JSON.stringify(d.takenPerRound)} SURVIVAL rounds quartiles=${JSON.stringify(d.survival)} byOutcome=${JSON.stringify(d.survivalByOutcome)}`);
    console.log(`  CAPFIT: fits=${d.capFit.fits}/${d.capFit.total} (${d.capFit.pct}%) atMedianDpr=${JSON.stringify(d.capFit.atMedianDpr)} at57=${JSON.stringify(d.capFit.atBand57)} at80=${JSON.stringify(d.capFit.atBand80)}`);
    console.log(`  BY-COMP: ${JSON.stringify(d.byComp)}`);
    console.log(`  BY-LOADOUT: ${JSON.stringify(d.byLoadout)}`);
    console.log(`  BY-ROUND: ${JSON.stringify(d.byRound)}`);
    if (d.parse.mismatches.length) console.log(`  PARSE-MISMATCHES (first ${d.parse.mismatches.length}): ${JSON.stringify(d.parse.mismatches)}`);
  }
  console.log(`COVERAGE: seeds=${r.coverage.seeds} fightsWithBreak=${r.coverage.fightsWithBreak} fought=${r.coverage.fought} assignedPct=${r.coverage.assignedPct}% pass=${r.coverage.pass ? 'PASS' : 'FAIL'}`);
  console.log(`MACHINE LEGS: ${r.machinePass ? 'PASS' : 'FAIL'}`);
}

async function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4dpr2');
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
