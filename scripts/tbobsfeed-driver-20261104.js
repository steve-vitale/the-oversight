// tbobsfeed-driver-20261104.js — TB-observation-feed arm driver
// (arm sim-tbobsfeed-a). Reuses the trickcensus instrument VERBATIM
// (scripts/trickcensus-instrument-20261104.js) and analyzer summary;
// adds only: per-seed JSON under evidence/2026-11-04/perseed-tbobsfeed-a/
// and the harness live-death list (result.samples.deaths) for the
// pre-registered cost bar. Policy competent VERBATIM, 140d death-aware.
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=tbobsfeed-base node scripts/tbobsfeed-driver-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'trickcensus-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'tbobsfeed';
if (!SEEDS.length) { console.error('TBOBSFEED STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-tbobsfeed-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tbobsfeed-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TBOBSFEED STOP: refusing to overwrite ' + file); process.exit(3); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-tbobsfeed', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshotDaily(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshotDaily(); } catch (e) {}
  let finalInv = null;
  try { finalInv = inst.finalInventory(); } catch (e) { errors.push('finalInventory: ' + String(e.message).slice(0, 80)); }
  let endUnlockedWave = null;
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  return {
    seed: seed, arm: 'tbobsfeed', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls, fieldCallsW4: t.fieldCallsW4,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors), notes: t.notes,
    trickEvents: t.trickEvents, actionAvailLog: t.actionAvailLog,
    daily: t.daily, endInventory: finalInv,
    deaths: (result.samples && result.samples.deaths) || [],
  };
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'trickcensus-analyze-20261104'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'tbobsfeed-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = AN.summarizeSeed(out);
    const starv = (out.deaths || []).filter(function (d) { return d.cause === 'starvation' || d.cause === 'hunger'; }).length;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, end: out.endReason,
      spawnsW4: out.spawnsW4, tbCalls: out.tbCalls, tbStarted: s.exposures,
      fieldCallsW4: out.fieldCallsW4, killsW4: out.killsW4,
      endBars: s.endBars, deaths: (out.deaths || []).length, starvationDeaths: starv,
      errors: s.instrumentErrors, orphans: s.orphanTbEnds,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error('TBOBSFEED FATAL: ' + (e && e.stack || e)); process.exit(1); });
