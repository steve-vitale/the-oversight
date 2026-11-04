// approachfall-driver-20261104.js — TB approach-fallback pilot driver
// (arm sim-approachfall-b). Reuses the fleerepair instrument verbatim;
// adapted from the fleerepair driver: same 140d death-aware horizon,
// same instrument shape, but the policy is selectable (below) and the
// corpus lands in perseed-approachfall-b/ with an approachfall- prefix
// so no fleerepair file is ever overwritten. The driver refuses to
// overwrite, as the fleerepair driver does.
// policy is selectable: POLICY=competent (baseline, verbatim) or
// POLICY=approachfall (scripts/policies/competent-approachfall-b.js).
// Per-seed JSON to evidence/2026-11-04/perseed-approachfall-b/; refuses
// to overwrite. Death-cause shares come from the harness result where
// available and are summarized by the evidence step, not here.
// Usage:
//   DAYS=140 SEEDS=99101,99102 POLICY=competent RUN=baseline node scripts/approachfall-driver-20261104.js
//   DAYS=140 SEEDS=99101,99102 POLICY=approachfall RUN=approachfall node scripts/approachfall-driver-20261104.js
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
else { console.error('APPROACHFALL STOP: unknown POLICY ' + POLICY); process.exit(2); }
const policy = policyMod.competent;
const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || ('approachfall-' + POLICY);
if (!SEEDS.length) { console.error('APPROACHFALL STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachfall-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'approachfall-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('APPROACHFALL STOP: refusing to overwrite ' + file); process.exit(3); }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-approachfall', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
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
    // the cost bar's starvation accounting reads from here. (Driver v1
    // saved result.deathEvents, which runDays does not return — null on
    // all v1 legs; fixed here, baseline re-run to reproduce + capture.)
    deaths: (result.samples && result.samples.deaths) || null, resultKeys: result ? Object.keys(result) : [],
    scaleSamples: scaleSamples, standingSamples: standingSamples,
    scaleRankFinal: scaleSnap.rankFinal, standingFinal: scaleSnap.standingFinal,
    arcFinal: scaleSnap.arcFinal, tableWaiting: scaleSnap.tableWaiting,
    tableEntered: scaleSnap.tableEntered, nationalReached: nationalReached,
    maxStanding: maxStanding, scaleReadError: scaleSnap.scaleReadError,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'approachfall-s' + seed + '-' + RUN + '.json');
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
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
