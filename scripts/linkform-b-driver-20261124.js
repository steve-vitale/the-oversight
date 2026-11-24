// linkform-b-driver-20261124.js — second-link stage classification
// driver (arm sim-linkform-b, run fleshout-loop-b-20261124T1030Z).
// Competent policy VERBATIM, default env, death-aware horizon.
// Seeds run sequentially in one process via the shared harness
// (loadGame per seed). Installs BOTH reused instruments:
//   havenlink-b (layers over the standing instrument: foreign
//     polity, link/propose/counter/national events, reproduction
//     fields) FIRST, then secondlink (raise recorder) SECOND —
//     both wrap proposeLink; the chain is call-through both ways.
// Uninstall in reverse. Per-seed JSON goes to
// evidence/2026-11-24/perseed-linkform-b/. Refuses to overwrite.
// The driver LOGS a reproduction divergence per seed but does NOT
// stop the run (unlike the havenlink driver): the prereg freezes
// reproduction as a judged leg on the completed corpus, not an
// abort — the stage classification is computed from this arm's
// own corpus either way.
// Usage:
//   DAYS=150 SEEDS=109309,109310 RUN=linkform-b node scripts/linkform-b-driver-20261124.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const HAVEN_INST = require(path.join(REPO, 'scripts', 'havenlink-b-instrument-20261124'));
const SL_INST = require(path.join(REPO, 'scripts', 'secondlink-instrument-20261110'));

const SEEDS_ENV = process.env.SEEDS || '';
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN_ENV = process.env.RUN || 'linkform-b';
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-linkform-b');
const confirmDir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-standing-gearready-b');

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// Merge the two instruments' daily rows by day. The standing row
// wins on conflicting keys: both snapshots carry `standing`
// (standing instrument: the villageStanding() OBJECT; secondlink:
// the villageStandingTotal() NUMBER) and `links` (standing shape:
// {key, kind, status, seasoned, counts, ...} with NO `other` and
// including inactive links; secondlink shape: {other, kind, ...,
// active-only}). The merged `links` are therefore the STANDING
// shape, for summarizeSeed (which reads l.key / l.counts) and the
// havenlink classifier (which reads d.havenLinks, not d.links).
// Secondlink link rows live untouched in `secondlinkDaily`, and
// the analyzer runs the secondlink analyzer on THOSE rows, not on
// the merged ones. Secondlink-only keys (pendingRaises,
// raiseState, raisers, scholarLore, linkTickRoll,
// eligibleRaisers, villages, polity, pending) survive the merge.
function mergeDailyRows(standingRows, secondlinkRows) {
  const byDay = {};
  (secondlinkRows || []).forEach(function (r) { if (r && r.day != null) byDay[r.day] = r; });
  return (standingRows || []).map(function (s) {
    const sl = byDay[s.day] || null;
    if (!sl) return s;
    const m = Object.assign({}, sl, s);
    return m;
  });
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-linkform-b', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const haven = HAVEN_INST.install(Game);
  const sl = SL_INST.install(Game);
  const t = haven.t;
  const t2 = sl.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          sl.installTeleLazy();
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            haven.snapshot();
            sl.snapshot();
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { haven.snapshot(); } catch (e) {}
  try { sl.snapshot(); } catch (e) {}
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  let otherVillages = [];
  try { otherVillages = haven.otherVillages(); } catch (e) { errors.push('otherVillages: ' + String(e.message).slice(0, 80)); }
  try { sl.uninstall(); } catch (e) { errors.push('uninstall-secondlink: ' + String(e.message).slice(0, 80)); }
  try { haven.uninstall(); } catch (e) { errors.push('uninstall-havenlink: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const out = {
    seed: seed, arm: 'linkform-b', run: RUN_ENV, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    standing: standing,
    daily: mergeDailyRows(t.daily, t2.daily),
    secondlinkDaily: t2.daily,
    killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, releaseLines: t.releaseLines, saySample: t.saySample,
    linkEvents: t.linkEvents, proposeEvents: t.proposeEvents, counterEvents: t.counterEvents,
    nationalEvents: t.nationalEvents, linkLines: t.linkLines,
    otherVillages: otherVillages,
    wrapCounts: t.wrapCounts,
    bondEvents: t2.bondEvents, stageCalls: t2.stageCalls,
    acceptCalls: t2.acceptCalls, declineCalls: t2.declineCalls,
    proposeCalls: t2.proposeCalls, linkTickCalls: t2.linkTickCalls,
    instrumentErrors: t.instrumentErrors.concat(t2.instrumentErrors).concat(errors),
  };
  return out;
}

async function main() {
  const SEEDS = (SEEDS_ENV ? SEEDS_ENV.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
  const RUN = RUN_ENV;
  if (!SEEDS.length) { console.error('LINKFORM STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'linkform-b-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('LINKFORM STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  const AN = require(path.join(REPO, 'scripts', 'linkform-b-analyze-20261124'));
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'linkform-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const c = AN.classifySeed(out);
    let repro = null;
    const confirmFile = path.join(confirmDir, 'standing-gearready-b-s' + seed + '-standingconfirm-b.json');
    if (fs.existsSync(confirmFile)) {
      const confirm = JSON.parse(fs.readFileSync(confirmFile, 'utf8'));
      repro = AN.reproductionCheck(out, confirm);
    } else {
      repro = { seed: seed, match: null, mismatches: [{ field: 'confirm-file', replay: 'present', pilot: 'NO STANDINGCONFIRM COUNTERPART (seed 109309, prereg note)' }] };
    }
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      stage: c.stage, stageLabel: c.stageLabel,
      firstLink: c.firstLink ? (c.firstLink.otherName || c.firstLink.other) + '@d' + c.firstLink.day + ' via ' + c.firstLinkProvenance : null,
      secondStagings: c.secondStagings.length,
      maxActiveLinks: c.maxActiveLinks,
      seasonedAtEnd: c.seasonedAtEnd,
      foreignPolity: c.foreignPolity ? (c.foreignPolity.primaryName + ' size ' + c.foreignPolity.maxSize) : null,
      unclassified: c.unclassified, unclassifiedReasons: c.unclassifiedReasons,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
      reproMatch: repro ? repro.match : null, reproMismatches: repro ? repro.mismatches : null,
    }));
    if (repro && repro.match === false) {
      console.error('LINKFORM REPRO DIVERGENCE seed ' + seed + ': ' + JSON.stringify(repro.mismatches) + ' — logged, run continues (prereg leg 4 judges the completed corpus).');
    }
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { mergeDailyRows: mergeDailyRows };
