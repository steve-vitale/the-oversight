// approachlive-driver-20261105.js — LIVE approach-fallback firing panel
// driver (arm sim-approachlive-b, Loop B run fleshout-loop-b-20261105T0930Z).
// Copy of the approachbranch driver (arm sim-approachbranch-a) with the
// corpus dir + filename prefix changed so no earlier file is ever
// overwritten, PLUS the direct-counter instrument: policy.fight is wrapped
// (call-through; return value and RNG untouched) so the policy's OWN ctx
// counters are snapshotted before/after every fight call into the bus
// (scripts/approachlive-bus-20261105.js). The bus records are joined to
// instrument exposures by fightId after runDays returns and embedded per
// exposure as `fallback` (rollup) plus run-level `fallbackCalls`.
// Policy selectable: POLICY=competent (baseline, verbatim) or
// POLICY=approachfall (scripts/policies/competent-approachfall-b.js, the
// already-landed variant — used verbatim, never edited here).
// Per-seed JSON to evidence/2026-11-05/perseed-approachlive-b/; refuses
// to overwrite. Death-cause shares come from the harness result where
// available and are summarized by the evidence step, not here.
// OUTDIR env override exists ONLY for the proof test's smoke run (into
// /tmp); the judged panel always uses the default corpus dir.
// Usage:
//   DAYS=140 SEEDS=99601,99602 POLICY=competent RUN=baseline node scripts/approachlive-driver-20261105.js
//   DAYS=140 SEEDS=99601,99602 POLICY=approachfall RUN=armed node scripts/approachlive-driver-20261105.js
// RUN tags are 'baseline' / 'armed' (NOT 'approachfall'): the pilot's
// summarizer footgun was a filter matching both legs, so run tags are
// disjoint suffixes and the summarizer filters on them.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const POLICY = process.env.POLICY || 'competent';
let policyMod;
if (POLICY === 'approachfall') policyMod = require(path.join(REPO, 'scripts', 'policies', 'competent-approachfall-b'));
else if (POLICY === 'competent') policyMod = require(path.join(REPO, 'scripts', 'policies', 'competent'));
else { console.error('APPROACHLIVE STOP: unknown POLICY ' + POLICY); process.exit(2); }
const policy = policyMod.competent;
const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));
const BUS = require(path.join(REPO, 'scripts', 'approachlive-bus-20261105'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || ('approachlive-' + POLICY);
if (!SEEDS.length) { console.error('APPROACHLIVE STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-approachlive-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'approachlive-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('APPROACHLIVE STOP: refusing to overwrite ' + file); process.exit(3); }
}

// DIRECT-COUNTER WRAP: call-through around policy.fight. Reads ctx only
// (snapCounters), never writes it, never calls a mutating game function,
// never uses Math.random. The original return value (handled boolean)
// is preserved exactly, including the throw path (driveFights catches
// policy.fight throws; the bus still records the after-snapshot).
function wrapFight(origFight) {
  return function (Game, ctx) {
    const before = BUS.snapCounters(ctx);
    let playerTurn = false;
    try { playerTurn = !!(Game && typeof Game.tbIsPlayerTurn === 'function' && Game.tbIsPlayerTurn()); } catch (e) {}
    const meta = { playerTurn: playerTurn, monsterBefore: BUS.monsterSig(Game), playerBefore: BUS.playerPos(Game) };
    let r, threw = null;
    try { r = origFight(Game, ctx); } catch (e) { threw = e; }
    const after = BUS.snapCounters(ctx);
    if (threw) meta.threw = threw;
    try { BUS.record(Game, before, after, meta); } catch (e) {}
    if (threw) throw threw;
    return r;
  };
}

async function oneRun(seed) {
  BUS.reset();
  const { Game } = await loadGame({ seed: seed, mode: 'competent-approachlive', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  // The wrapped policy is a shallow copy: setup/upkeep/daily/contest/
  // pending are the verbatim originals; only fight carries the counter
  // read. The wrapper is per-leg (fresh bus per seed via BUS.reset()).
  const wrappedPolicy = Object.assign({}, policy, { fight: wrapFight(policy.fight) });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  // SCALE SNAPSHOT (confirm extension, 2026-11-04 — fixes the pilot
  // caveat that national/table were hard-coded 0 in the summarizer).
  // Pure reads behind try/catch; a hostile read must never kill a leg.
  // Failures land in scaleReadError, never in instrumentErrors.
  const scaleSnap = { rankFinal: null, standingFinal: null, arcFinal: null,
    tableWaiting: false, tableEntered: false, scaleReadError: null };
  try { scaleSnap.rankFinal = Game.scaleRank ? (Game.scaleRank() || null) : null; }
  catch (e) { scaleSnap.scaleReadError = 'scaleRank: ' + String(e.message).slice(0, 80); }
  try { const vs = Game.villageStanding ? Game.villageStanding() : null;
    scaleSnap.standingFinal = vs ? (vs.total | 0) : null; }
  catch (e) { scaleSnap.scaleReadError = (scaleSnap.scaleReadError || '') + ' villageStanding: ' + String(e.message).slice(0, 80); }
  try { const pg = Game.progState ? Game.progState() : {};
    scaleSnap.arcFinal = pg.arc || null; scaleSnap.tableWaiting = !!pg.tableWaiting;
    scaleSnap.tableEntered = !!pg.tableDone; }
  catch (e) { scaleSnap.scaleReadError = (scaleSnap.scaleReadError || '') + ' progState: ' + String(e.message).slice(0, 80); }
  const scaleSamples = (result.samples && result.samples.scale) || null;
  const standingSamples = (result.samples && result.samples.standing) || null;
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  let nationalReached = false;
  if (scaleSamples) for (const row of scaleSamples) {
    if (row && (RANK_ORDER[row[1]] || 0) >= 2) nationalReached = true;
  }
  if ((RANK_ORDER[scaleSnap.rankFinal] || 0) >= 2) nationalReached = true;
  let maxStanding = scaleSnap.standingFinal;
  if (standingSamples) for (const row of standingSamples) {
    if (row && Number.isFinite(row[1]) && (maxStanding == null || row[1] > maxStanding)) maxStanding = row[1];
  }
  // DIRECT-COUNTER JOIN: bus records grouped by fightId, joined to the
  // instrument's wave-4 exposures (exposure.fightId is the same live
  // fight id). Fights with no exposure (waves 1-3, field fights that
  // never became TB exposures) keep their records at run level only.
  const byFight = {};
  for (const rec of BUS.calls) {
    const k = (rec.fightId == null ? '__null__' : String(rec.fightId));
    (byFight[k] = byFight[k] || []).push(rec);
  }
  for (const ex of (t.exposures || [])) {
    const recs = byFight[String(ex.fightId)] || [];
    ex.fallback = BUS.rollupFight(recs);
    ex.fallback.fightId = ex.fightId;
  }
  const fallbackTotals = { calls: BUS.calls.length, marks: 0, waits: 0, repicks: 0, stuck: 0,
    fightsWithMarks: 0, fightsWithCalls: Object.keys(byFight).length };
  const markedNonExposure = [];
  const exposureIds = {};
  for (const ex of (t.exposures || [])) exposureIds[String(ex.fightId)] = true;
  for (const k of Object.keys(byFight)) {
    const roll = BUS.rollupFight(byFight[k]);
    fallbackTotals.marks += roll.marks; fallbackTotals.waits += roll.waits;
    fallbackTotals.repicks += roll.repicks; fallbackTotals.stuck += roll.stuck;
    if (roll.marks >= 1) {
      fallbackTotals.fightsWithMarks++;
      if (!exposureIds[k]) {
        markedNonExposure.push({ fightId: (k === '__null__' ? null : k),
          mids: (byFight[k][0] || {}).mids || [], marks: roll.marks,
          waits: roll.waits, repicks: roll.repicks });
      }
    }
  }
  return {
    seed: seed, run: RUN, policy: POLICY, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls, fieldCallsW4: t.fieldCallsW4,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors), notes: t.notes,
    // LIVE DEATH CAPTURE (sim-harness runDays): samples.deaths holds the
    // live-captured death tele records {day, kind, who, cause, player} —
    // the cost bar's starvation accounting reads from here.
    deaths: (result.samples && result.samples.deaths) || null, resultKeys: result ? Object.keys(result) : [],
    scaleSamples: scaleSamples, standingSamples: standingSamples,
    scaleRankFinal: scaleSnap.rankFinal, standingFinal: scaleSnap.standingFinal,
    arcFinal: scaleSnap.arcFinal, tableWaiting: scaleSnap.tableWaiting,
    tableEntered: scaleSnap.tableEntered, nationalReached: nationalReached,
    maxStanding: maxStanding, scaleReadError: scaleSnap.scaleReadError,
    // DIRECT-COUNTER INSTRUMENT (this arm): per-call counter snapshots
    // for every policy.fight call in the leg, plus run totals.
    fallbackCalls: BUS.calls.slice(), fallbackTotals: fallbackTotals,
    fallbackMarkedNonExposure: markedNonExposure,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'approachlive-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const tb = out.exposures.length;
    const ended = out.exposures.filter(function (e) { return !!e.end; }).length;
    const hits = out.exposures.reduce(function (s, e) { return s + (e.hits || []).length; }, 0);
    const turns = out.exposures.reduce(function (s, e) { return s + (e.turns || []).length; }, 0);
    const npc = out.exposures.reduce(function (s, e) { return s + (e.npcTurns || []).length; }, 0);
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason,
      spawnsW4: out.spawnsW4, tbCalls: out.tbCalls, tbStarted: tb, tbEnded: ended,
      fieldCallsW4: out.fieldCallsW4, killsW4: out.killsW4,
      unlinked: out.unlinkedKills.length, orphans: out.orphanTbEnds.length,
      hits: hits, turns: turns, npcTurns: npc, errors: out.instrumentErrors.length, notes: out.notes,
      wrapCounts: out.wrapCounts,
      rankFinal: out.scaleRankFinal, national: out.nationalReached,
      standingFinal: out.standingFinal, maxStanding: out.maxStanding,
      tableEntered: out.tableEntered, tableWaiting: out.tableWaiting,
      scaleReadError: out.scaleReadError,
      fbCalls: out.fallbackTotals.calls, fbMarks: out.fallbackTotals.marks,
      fbWaits: out.fallbackTotals.waits, fbRepicks: out.fallbackTotals.repicks,
      fbFightsWithMarks: out.fallbackTotals.fightsWithMarks,
      fbMarkedNonExposure: out.fallbackMarkedNonExposure.length,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
