// fleerepair-driver-20261104.js — TB flee-repair pilot driver (arm
// sim-fleerepair-a). Adapted from the tbfinish driver: same band
// (seeds 99101–99108, 140d death-aware), same instrument shape, but the
// policy is selectable: POLICY=competent (baseline, verbatim) or
// POLICY=fleerepair (scripts/policies/competent-fleerepair-a.js).
// Per-seed JSON to evidence/2026-11-04/perseed-fleerepair-a/; refuses
// to overwrite. Death-cause shares come from the harness result where
// available and are summarized by the evidence step, not here.
// Usage:
//   DAYS=140 SEEDS=99101,99102 POLICY=competent RUN=baseline node scripts/fleerepair-driver-20261104.js
//   DAYS=140 SEEDS=99101,99102 POLICY=fleerepair RUN=fleerepair node scripts/fleerepair-driver-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const POLICY = process.env.POLICY || 'competent';
let policyMod;
if (POLICY === 'fleerepair') policyMod = require(path.join(REPO, 'scripts', 'policies', 'competent-fleerepair-a'));
else if (POLICY === 'competent') policyMod = require(path.join(REPO, 'scripts', 'policies', 'competent'));
else { console.error('FLEEREPAIR STOP: unknown POLICY ' + POLICY); process.exit(2); }
const policy = policyMod.competent;
const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || ('fleerepair-' + POLICY);
if (!SEEDS.length) { console.error('FLEEREPAIR STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-fleerepair-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'fleerepair-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('FLEEREPAIR STOP: refusing to overwrite ' + file); process.exit(3); }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-fleerepair', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  return {
    seed: seed, run: RUN, policy: POLICY, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls, fieldCallsW4: t.fieldCallsW4,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors), notes: t.notes,
    deathEvents: result.deathEvents || null, resultKeys: result ? Object.keys(result) : [],
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'fleerepair-s' + seed + '-' + RUN + '.json');
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
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
