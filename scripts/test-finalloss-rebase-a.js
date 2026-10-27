#!/usr/bin/env node
// scripts/test-finalloss-rebase-a.js — proof for sim-finalloss-rebase-a.
// Re-derives EVERY summary number from the per-seed corpus rows
// (evidence/2026-10-27/perseed-finalloss-rebase-a/) using the sweep
// module's own pure functions, then checks the evidence's
// claims: re-baseline tables (1920Z and 0525Z), G2 neutrality,
// G1 det-gate record, cross-checks (a)-(c),(e), final-loss
// classification, re-baselined known-instance re-derivation, and the
// DIAG-GO verdict rule. Exits non-zero on any FAIL. No game code
// is loaded here — this is a pure re-derivation over files on disk.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-27', 'perseed-finalloss-rebase-a');
const { finalLossInstances, bandOf, BAND1920, BAND0525, SEEDS } = require('./test-finalloss-rebase-a-sweep');
const { classifyStart } = require('./policies/nonworldkill-diag');

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra !== undefined ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function stripFinal(f) {
  return { seed: f.seed, seq: f.seq, seqKey: f.seqKey, id: f.id, day: f.day,
    fightId: f.fightId, result: f.result, chainLength: f.chainLength,
    leg: f.leg, verdict: f.verdict, verdictTickDay: f.verdictTickDay,
    tickPresent: f.tickPresent, postPresent: f.postPresent, staleTickSkipped: f.staleTickSkipped || 0 };
}

const summary = JSON.parse(fs.readFileSync(path.join(EVID, 'summary.json'), 'utf8'));
const detgate = JSON.parse(fs.readFileSync(path.join(EVID, 'detgate.json'), 'utf8'));
const rows = [];
for (const seed of SEEDS) for (const pid of ['baseline', 'armed']) {
  rows.push(JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-${pid}.json`), 'utf8')));
}
check('corpus rows 16', rows.length === 16, rows.length);
check('summary label', summary.label === 'sim-finalloss-rebase-a', summary.label);
check('summary seeds', JSON.stringify(summary.seeds) === JSON.stringify(SEEDS), summary.seeds);
check('detgate pass', detgate.pass === true, detgate);
check('summary detPass flag', summary.gates.detPass === true, summary.gates.detPass);

const bb = bandOf(rows, 'baseline');
const ab = bandOf(rows, 'armed');
check('summary baselineBand matches rows', JSON.stringify(summary.baselineBand) === JSON.stringify(bb), { summary: summary.baselineBand, rows: bb });
check('summary armedBand matches rows', JSON.stringify(summary.armedBand) === JSON.stringify(ab), { summary: summary.armedBand, rows: ab });
// Rebaseline vs 1920Z is a DIFF on this base (base movement is the
// finding, reported field-by-field) — the proof checks the
// summary's DIFF matches the recomputed diff, NOT that the
// baseline equals 1920Z. Vs 0525Z the rebaseline is EXACT, so
// those equalities are asserted directly.
function diffOf(band, ref) {
  return { wins: band.won - ref.wins, nationalEver: band.nationalEver - ref.nationalEver,
    nationalFinal: band.nationalFinal - ref.nationalFinal, table: band.table - ref.table,
    entered: band.entered - ref.entered, wave4: band.wave4 - ref.wave4, wave5: band.wave5 - ref.wave5,
    medianDays: band.medianDays - ref.medianDays, deaths: band.deathTotal - ref.deaths,
    starvation: band.starvationTotal - ref.starvation };
}
check('summary diffVs1920 matches recomputed', JSON.stringify(summary.gates.diffVs1920) === JSON.stringify(diffOf(bb, BAND1920)), { summary: summary.gates.diffVs1920, rows: diffOf(bb, BAND1920) });
check('summary diffVs0525 matches recomputed', JSON.stringify(summary.gates.diffVs0525) === JSON.stringify(diffOf(bb, BAND0525)), { summary: summary.gates.diffVs0525, rows: diffOf(bb, BAND0525) });
check('baseline wins vs 0525Z', bb.won === BAND0525.wins, [bb.won, BAND0525.wins]);
check('baseline nationalEver vs 0525Z', bb.nationalEver === BAND0525.nationalEver, [bb.nationalEver, BAND0525.nationalEver]);
check('baseline nationalFinal vs 0525Z', bb.nationalFinal === BAND0525.nationalFinal, [bb.nationalFinal, BAND0525.nationalFinal]);
check('baseline table vs 0525Z', bb.table === BAND0525.table, [bb.table, BAND0525.table]);
check('baseline entered vs 0525Z', bb.entered === BAND0525.entered, [bb.entered, BAND0525.entered]);
check('baseline wave4 vs 0525Z', bb.wave4 === BAND0525.wave4, [bb.wave4, BAND0525.wave4]);
check('baseline wave5 vs 0525Z', bb.wave5 === BAND0525.wave5, [bb.wave5, BAND0525.wave5]);
check('baseline medianDays vs 0525Z', bb.medianDays === BAND0525.medianDays, [bb.medianDays, BAND0525.medianDays]);
check('baseline deaths vs 0525Z', bb.deathTotal === BAND0525.deaths, [bb.deathTotal, BAND0525.deaths]);
check('baseline starvation vs 0525Z', bb.starvationTotal === BAND0525.starvation, [bb.starvationTotal, BAND0525.starvation]);
check('summary rebaselineExact1920 flag', summary.gates.rebaselineExact1920 === (bb.won === BAND1920.wins && bb.nationalEver === BAND1920.nationalEver && bb.nationalFinal === BAND1920.nationalFinal && bb.table === BAND1920.table && bb.entered === BAND1920.entered && bb.wave4 === BAND1920.wave4 && bb.wave5 === BAND1920.wave5 && bb.medianDays === BAND1920.medianDays && bb.deathTotal === BAND1920.deaths && bb.starvationTotal === BAND1920.starvation), summary.gates.rebaselineExact1920);
check('summary rebaselineExact0525 flag', summary.gates.rebaselineExact0525 === (bb.won === BAND0525.wins && bb.nationalEver === BAND0525.nationalEver && bb.nationalFinal === BAND0525.nationalFinal && bb.table === BAND0525.table && bb.entered === BAND0525.entered && bb.wave4 === BAND0525.wave4 && bb.wave5 === BAND0525.wave5 && bb.medianDays === BAND0525.medianDays && bb.deathTotal === BAND0525.deaths && bb.starvationTotal === BAND0525.starvation), summary.gates.rebaselineExact0525);

let g2ok = true;
for (const seed of SEEDS) {
  const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
  const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const ok = c.days === a.days && c.gameDays === a.gameDays && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
  const facedOk = JSON.stringify(c.faced) === JSON.stringify(a.faced);
  const killsOk = JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
  check(`G2 seed ${seed}`, ok && facedOk && killsOk, { ok, facedOk, killsOk });
  if (!ok || !facedOk || !killsOk) g2ok = false;
}
check('summary g2Pass flag', summary.gates.g2Pass === g2ok, summary.gates.g2Pass);

let allFinalsRe = [];
for (const seed of SEEDS) {
  const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const sp = summary.perSeed.find(p => p.seed === seed);
  const fl = finalLossInstances(armed);
  const finalsRe = fl.finals.map(f => Object.assign({}, stripFinal(f), { wave: null }));
  // Summary finals carry a wave field; strip it for comparison.
  const finalsSum = (sp.finals || []).map(f => { const s = stripFinal(f); return s; });
  check(`seed ${seed} finals match summary`, JSON.stringify(finalsSum) === JSON.stringify(finalsRe.map(f => { const x = Object.assign({}, f); delete x.wave; return x; })), { summary: finalsSum.length, rows: finalsRe.length });
  check(`seed ${seed} verdictCounts match summary`, JSON.stringify(sp.verdictCounts) === JSON.stringify(fl.finals.reduce((m, f) => { m[f.verdict] = (m[f.verdict] || 0) + 1; return m; }, {})), { summary: sp.verdictCounts });
  check(`seed ${seed} diag errs zero`, sp.diagErrs === 0, sp.diagErrs);
  check(`seed ${seed} overflow zero`, sp.overflowN === 0, sp.overflowN);
  check(`seed ${seed} field count match`, sp.fieldCountMatch === true, [sp.field4, sp.waveField4]);
  check(`seed ${seed} source-sum clean`, sp.sumFail === 0, sp.sumFail);
  check(`seed ${seed} fin unjoined empty`, sp.finUnjoined.length === 0, sp.finUnjoined);
  check(`seed ${seed} tb unjoined named`, Array.isArray(sp.tbUnjoined), sp.tbUnjoined);
  check(`seed ${seed} fin tbEnds present`, sp.finTbEnds > 0, sp.finTbEnds);
  check(`seed ${seed} ticks present`, armed.seq51gap.ticks.length > 0, armed.seq51gap.ticks.length);
  allFinalsRe = allFinalsRe.concat(fl.finals);
}
check('summary allFinals count', summary.allFinals.length === allFinalsRe.length, [summary.allFinals.length, allFinalsRe.length]);
check('all finals classified', allFinalsRe.every(f => !!f.verdict), allFinalsRe.filter(f => !f.verdict).length);
check('summary allClassified flag', summary.allClassified === allFinalsRe.every(f => !!f.verdict), summary.allClassified);

// Re-baselined known instances (rebase prereg): K1 moderator
// 73671 d167 maxHp 150 (F1), K2 reunion 73675 d169 maxHp 1200
// (F6), K3 influencer 73677 d112 maxHp 850 (F8). Identity is
// (seed, day, origin maxHp); adopt-corpus seqs (27, 38, 39) are
// confirmed, not assumed — the proof asserts them because the
// rerun is deterministic on the same base, and any renumbering
// would surface here as a FAIL, never silently.
function knownRe(seed, day, maxHp) {
  const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
  const fl = finalLossInstances(armed);
  return fl.finals.filter(f => {
    if (f.day !== day) return false;
    const chain = fl.chains.find(c => c.day === day && c.rows[c.rows.length - 1].fightId === f.fightId);
    return chain && chain.rows[chain.rows.length - 1].origin && chain.rows[chain.rows.length - 1].origin.maxHp === maxHp;
  });
}
const k1 = knownRe(73671, 167, 150);
const k2 = knownRe(73675, 169, 1200);
const k3 = knownRe(73677, 112, 850);
check('known K1 73671 d167 maxHp150 re-derives', k1.length >= 1, k1.length);
check('known K1 verdict BLOCKED (F1)', k1.every(f => f.verdict === 'BLOCKED (F1)'), k1.map(f => f.verdict));
check('known K1 seq 27 (adopt corpus)', k1.every(f => f.seq === 27), k1.map(f => f.seq));
check('known K1 id moderator', k1.every(f => f.id === 'moderator'), k1.map(f => f.id));
check('known K2 73675 d169 maxHp1200 re-derives', k2.length >= 1, k2.length);
check('known K2 verdict RESTORED (F6)', k2.every(f => f.verdict === 'RESTORED (F6)'), k2.map(f => f.verdict));
check('known K2 seq 38 (adopt corpus)', k2.every(f => f.seq === 38), k2.map(f => f.seq));
check('known K2 id reunion', k2.every(f => f.id === 'reunion'), k2.map(f => f.id));
check('known K3 73677 d112 maxHp850 re-derives', k3.length >= 1, k3.length);
check('known K3 verdict REMOVED-AFTERWARDS (F8)', k3.every(f => f.verdict === 'REMOVED-AFTERWARDS (F8)'), k3.map(f => f.verdict));
check('known K3 seq 39 (adopt corpus)', k3.every(f => f.seq === 39), k3.map(f => f.seq));
check('known K3 id influencer', k3.every(f => f.id === 'influencer'), k3.map(f => f.id));
check('summary knownOk flag', summary.knownOk === (k1.length >= 1 && k1.every(f => f.verdict === 'BLOCKED (F1)') && k2.length >= 1 && k2.every(f => f.verdict === 'RESTORED (F6)') && k3.length >= 1 && k3.every(f => f.verdict === 'REMOVED-AFTERWARDS (F8)')), summary.knownOk);
check('summary known k1 count', summary.known.k1.found.length === k1.length, [summary.known.k1.found.length, k1.length]);
check('summary known k2 count', summary.known.k2.found.length === k2.length, [summary.known.k2.found.length, k2.length]);
check('summary known k3 count', summary.known.k3.found.length === k3.length, [summary.known.k3.found.length, k3.length]);

const expectVerdict = (allFinalsRe.every(f => !!f.verdict) && summary.knownOk && g2ok && detgate.pass
  && summary.perSeed.every(p => p.diagErrs === 0 && p.overflowN === 0)) ? 'DIAG-GO' : 'DIAG-NO-GO';
check('summary verdict', summary.verdict === expectVerdict, [summary.verdict, expectVerdict]);

const causeTotals = {};
for (const r of rows.filter(x => x.policy === 'baseline')) for (const k of Object.keys(r.deaths || {})) causeTotals[k] = (causeTotals[k] || 0) + (r.deaths[k] || 0);
const totalDeaths = Object.keys(causeTotals).reduce((t, k) => t + causeTotals[k], 0);
check('death totals match baseline band', totalDeaths === bb.deathTotal, [totalDeaths, bb.deathTotal]);
console.log(`\nproof: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
