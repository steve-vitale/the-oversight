// passiveuse-driver-20261103.js — ability-use game-code arm, combined
// before-leg + passive-audit leg in ONE run (one 8-seed panel serves both:
// the prior instrument records twins-before NPC rows, the passive
// instrument records fight-start passives). Install order: prior FIRST,
// passive SECOND; uninstall REVERSE (passive first, prior second) so
// each wrap restores correctly.
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=twins-before OUTDIR=perseed-abilityuse-gc-before \
//     PASSIVE_OUTDIR=perseed-abilityuse-gc-passive PASSIVE_RUN=passive-gc \
//     node scripts/passiveuse-driver-20261103.js
// Policy: stock scripts/policies/competent.js on this branch (master).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'abilityuse-instrument-20261103'));
const PINST = require(path.join(REPO, 'scripts', 'passiveuse-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'twins-before';
const OUTDIR = process.env.OUTDIR || 'perseed-abilityuse-gc-before';
const PASSIVE_RUN = process.env.PASSIVE_RUN || 'passive-gc';
const PASSIVE_OUTDIR = process.env.PASSIVE_OUTDIR || 'perseed-abilityuse-gc-passive';
if (!SEEDS.length) { console.error('GC STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', OUTDIR);
const pOutDir = path.join(REPO, 'evidence', '2026-11-03', PASSIVE_OUTDIR);
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(pOutDir, { recursive: true });
for (const seed of SEEDS) {
  const f1 = path.join(outDir, 'gc-s' + seed + '-' + RUN + '.json');
  const f2 = path.join(pOutDir, 'gc-s' + seed + '-' + PASSIVE_RUN + '.json');
  if (fs.existsSync(f1)) { console.error('GC STOP: refusing to overwrite ' + f1); process.exit(3); }
  if (fs.existsSync(f2)) { console.error('GC STOP: refusing to overwrite ' + f2); process.exit(3); }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-gc', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const pinst = PINST.install(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { pinst.uninstall(); } catch (e) { errors.push('passive-uninstall: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('prior-uninstall: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  const t = inst.t, pt = pinst.t;
  return {
    seed: seed, run: RUN, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    spawnsW4: t.spawns.length, tbCalls: t.tbCalls, fieldCallsW4: t.fieldCallsW4,
    exposures: t.exposures, killsW4: t.killRows.length,
    killRows: t.killRows, unlinkedKills: t.unlinkedKills,
    spawns: t.spawns, orphanTbEnds: t.orphanTbEnds, wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors), notes: t.notes,
    passive: { fights: pt.fights, instrumentErrors: pt.instrumentErrors, wrapCounts: pt.wrapCounts },
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    fs.writeFileSync(path.join(outDir, 'gc-s' + seed + '-' + RUN + '.json'), JSON.stringify(out, null, 2) + '\n');
    fs.writeFileSync(path.join(pOutDir, 'gc-s' + seed + '-' + PASSIVE_RUN + '.json'),
      JSON.stringify({ seed: out.seed, run: PASSIVE_RUN, anchorCommit: out.anchorCommit, days: out.days,
        gameDays: out.gameDays, endReason: out.endReason, passive: out.passive }, null, 2) + '\n');
    const tb = out.exposures.length;
    const ended = out.exposures.filter(function (e) { return !!e.end; }).length;
    const npcCasts = out.exposures.reduce(function (s, e) { return s + (e.npcAbilityCalls || []).filter(function (c) { return c.returned; }).length; }, 0);
    const pf = out.passive.fights.length;
    console.log(JSON.stringify({ seed: out.seed, days: out.days, end: out.endReason,
      spawnsW4: out.spawnsW4, tbCalls: out.tbCalls, tbStarted: tb, tbEnded: ended,
      fieldCallsW4: out.fieldCallsW4, killsW4: out.killsW4,
      unlinked: out.unlinkedKills.length, orphans: out.orphanTbEnds.length,
      npcCasts: npcCasts, passiveFights: pf,
      errors: out.instrumentErrors.length, passiveErrors: out.passive.instrumentErrors.length,
      notes: out.notes, wrapCounts: out.wrapCounts, passiveWrapCounts: out.passive.wrapCounts }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
