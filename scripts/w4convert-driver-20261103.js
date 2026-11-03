// w4convert-driver-20261103.js — wave-4 kill-conversion split driver
// (arm sim-w4convert-a). Same policy (competent VERBATIM), same seeds
// (99101-99108), same 140d death-aware horizon as the vetbar pilot
// and census; only the instrument differs. Per-seed JSON to
// evidence/2026-11-03/perseed-w4convert-a/; refuses to overwrite.
// Prints a per-seed summary incl. trajectory identity vs the vetbar
// pilot file AND the vetbar census file, plus wrap fire counts.
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=w4convert node scripts/w4convert-driver-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'w4convert-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'w4convert';
if (!SEEDS.length) { console.error('W4CONVERT STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-w4convert-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'w4convert-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('W4CONVERT STOP: refusing to overwrite ' + file); process.exit(3); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-w4convert', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  // Trajectory identity vs vetbar pilot (all kill rows) and census (normal rows).
  function identityVs(file, normalOnly) {
    try {
      const other = JSON.parse(fs.readFileSync(file, 'utf8'));
      const mine = t.killRows.filter(function (r) { return !normalOnly || !r.pyrrhic; })
        .map(function (r) { return [r.day, r.mid, r.by, r.via]; });
      const theirs = (other.killRows || []).map(function (r) { return [r.day, r.mid, r.by, r.via]; });
      const sameKills = JSON.stringify(theirs) === JSON.stringify(mine);
      return (other.days === result.days && other.endReason === result.endReason && sameKills) ? 'MATCH' : 'DIVERGED';
    } catch (e) { return 'read-error: ' + String(e.message).slice(0, 60); }
  }
  const pilotFile = path.join(REPO, 'evidence', '2026-11-03', 'perseed-vetbar-a', 'vetbar-s' + seed + '-vetbar-pilot.json');
  const censusFile = path.join(REPO, 'evidence', '2026-11-03', 'perseed-vetbar-census-a', 'census-s' + seed + '-vetbar-census.json');
  return {
    seed: seed, run: RUN, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    identity: identityVs(pilotFile, false), censusIdentity: identityVs(censusFile, true),
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls,
    tbStarted: t.exposures.filter(function (e) { return e.type === 'tb'; }).length,
    fieldsW4: t.exposures.filter(function (e) { return e.type === 'field'; }).length,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, daily: t.daily, deathDays: t.deathDays, deathEvents: t.deathEvents,
    orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'w4convert-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason,
      identity: out.identity, censusIdentity: out.censusIdentity,
      spawnsW4: out.spawnsW4, tbCalls: out.tbCalls, tbStarted: out.tbStarted,
      fieldsW4: out.fieldsW4, exposures: out.exposures.length, killsW4: out.killsW4,
      unlinked: out.unlinkedKills.length, orphans: out.orphanTbEnds.length,
      errors: out.instrumentErrors.length, wrapCounts: out.wrapCounts,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
