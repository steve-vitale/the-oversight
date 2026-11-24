// havenlink-b-driver-20261124.js — foreign-polity membership census
// driver (arm sim-havenlink-b). Competent policy VERBATIM, default
// env, death-aware horizon. Seeds run sequentially in one process
// via the shared harness (loadGame per seed). Per-seed JSON goes to
// evidence/2026-11-24/perseed-havenlink-b/ (replay) or
// evidence/2026-11-24/perseed-havenlink-b-fresh/ (FRESH=1).
// Refuses to overwrite an existing per-seed file. The daily snapshot
// never calls villageStandingTotal or unlockedWave (side-effecting);
// ONE end-of-run unlockedWave call is made AFTER the run and
// reported separately (endUnlockedWave, endCallMovedPeak) — never
// counted as a natural door-open. After each replay seed the driver
// compares the frozen reproduction fields against the pilot corpus
// and STOPS (exit 3) on the first divergence — the replay is then
// abandoned and the fresh band is the judged leg.
// Usage:
//   DAYS=150 SEEDS=109301,109302 RUN=havenlink-b node scripts/havenlink-b-driver-20261124.js
//   FRESH=1 SEEDS=109325,109326,... RUN=havenlink-b node scripts/havenlink-b-driver-20261124.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'havenlink-b-instrument-20261124'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'havenlink-b';
const FRESH = process.env.FRESH === '1';
if (!SEEDS.length) { console.error('HAVENLINK STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-24', FRESH ? 'perseed-havenlink-b-fresh' : 'perseed-havenlink-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'havenlink-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('HAVENLINK STOP: refusing to overwrite ' + file); process.exit(3); }
}
const pilotDir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-standing-gearready-b');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-havenlink-b', fullTelemetry: false });
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
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  let otherVillages = [];
  try { otherVillages = inst.otherVillages(); } catch (e) { errors.push('otherVillages: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  const out = {
    seed: seed, arm: 'havenlink-b', run: RUN, anchorCommit: ANCHOR,
    fresh: FRESH,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    daily: t.daily, killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, releaseLines: t.releaseLines, saySample: t.saySample,
    linkEvents: t.linkEvents, proposeEvents: t.proposeEvents, counterEvents: t.counterEvents,
    nationalEvents: t.nationalEvents, linkLines: t.linkLines,
    otherVillages: otherVillages,
    wrapCounts: t.wrapCounts,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  const AN = require(path.join(REPO, 'scripts', 'havenlink-b-analyze-20261124'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'havenlink-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const c = AN.classifySeed(out);
    let repro = null;
    if (!FRESH) {
      const pilotFile = path.join(pilotDir, 'standing-gearready-b-s' + seed + '-standing-gearready-b.json');
      if (fs.existsSync(pilotFile)) {
        const pilot = JSON.parse(fs.readFileSync(pilotFile, 'utf8'));
        repro = AN.reproductionCheck(out, pilot);
      } else {
        repro = { seed: seed, match: false, mismatches: [{ field: 'pilot-file', replay: 'present', pilot: 'MISSING ' + pilotFile }] };
      }
    }
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      linkTarget: c.havenLink.last ? (c.havenLink.last.otherName + ' (' + c.havenLink.last.other + ', ' + c.havenLink.last.role + ')') : null,
      foreignPrimary: c.foreignPolity ? (c.foreignPolity.primaryName + ' (' + c.foreignPolity.primary + ', size ' + c.foreignPolity.maxSize + ')') : null,
      isTargetForeignPrimary: c.isTargetForeignPrimary,
      havenMember: c.havenMember, joinPath: c.joinPath,
      unclassified: c.unclassified, unclassifiedReasons: c.unclassifiedReasons,
      orphanLinkEvents: c.orphanLinkEvents.length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
      reproMatch: repro ? repro.match : null, reproMismatches: repro ? repro.mismatches : null,
    }));
    if (repro && !repro.match) {
      console.error('HAVENLINK REPRO DIVERGENCE seed ' + seed + ': ' + JSON.stringify(repro.mismatches) + ' — replay abandoned, run the fresh band instead.');
      process.exit(3);
    }
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
