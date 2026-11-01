#!/usr/bin/env node
// muster3-replay-20261101.js — POST-BLOCK ONLY (not judged).
//
// Replays seed 90111 on the full muster3 sweep stack. At the FIRST
// day-87 refused Herald attempt (the first cluster day: 6 refusals,
// omen stage 2, snapshot call yield 3, commit UNBLOCKED), sounds
// the call once, commits Haven's blades (two taps), and then lets
// the run continue, recording whether a later Herald startCombat
// attempt is FOUGHT. Nothing here enters the census tables: the
// judged sweep never calls a muster verb. This replay exists only
// to validate the snapshot callYield arithmetic (predicted 3)
// against a real soundTitanCall result at refusal-moment state,
// and to show what happens after the buttons are pressed on a
// band where the ceiling (3 + commit <= 6) never reaches the
// 10-gate — the post-block question here is whether the fight
// even starts, not whether it is won.
//
// STDOUT-RUNNER PATTERN: prints one JSON line
// (`{"replay": {...}}`) to stdout and writes NOTHING itself; the
// idle splitter (muster3-split-20261101.js, replay mode) writes
// the replay file. A game-loaded process must not be trusted to
// write files.
//
// Usage (same env as the sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   node scripts/muster3-replay-20261101.js > evidence/2026-11-01/perseed-muster3/replay.stdout 2> evidence/2026-11-01/perseed-muster3/replay.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`REPLAY STOP: ${k}=1 is required.`); process.exit(2); }
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

(async () => {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  const policy = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
  const { Game } = await loadGame({ seed: 90111, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  // Post-attempt interceptor: after the ORIGINAL (instrumented)
  // startCombat returns, if this was the first day-87 refused
  // Herald attempt, sound the call + commit twice, and record.
  const post = { sounded: false, day: null, predictedYield: null, actualAllies: null,
    commitReturns: [], havenAfter: null, readyAfter: null, interceptorErrors: [] };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      if (!post.sounded && last && last.day === 87 && r === null) {
        post.sounded = true;
        post.day = last.day;
        post.predictedYield = last.callYield;
        const muster = Game.soundTitanCall('herald');
        post.actualAllies = muster ? (muster.allies || []).length : null;
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        const m2 = (Game.state.titans.musters || {}).herald;
        post.havenAfter = m2 ? (m2.haven || []).length : null;
        try { post.readyAfter = Game.titanMusterReady('herald'); } catch (e) { post.readyAfter = null; }
        console.error('POST-BLOCK sounded on day 87: predictedYield=' + post.predictedYield +
          ' actualAllies=' + post.actualAllies + ' commitReturns=' + JSON.stringify(post.commitReturns) +
          ' havenAfter=' + post.havenAfter + ' readyAfter=' + post.readyAfter);
      }
    } catch (e) { post.interceptorErrors.push(String(e && e.message)); }
    return r;
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 200, manifest: undefined, sampleEvery: 30 }); });
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  const foughtAfter = att.filter(a => a.day >= 87 && a.cls === 'FOUGHT');
  const refusedAfter = att.filter(a => a.day >= 87 && a.cls === 'REFUSED');
  const tbHerald = Object.keys(t.tbOutcomes).map(k => t.tbOutcomes[k]).filter(v => v && v.mid === 'herald');
  const mEnd = (Game.state.titans.musters || {}).herald;
  const out = { seed: 90111, anchorCommit: ANCHOR, post: post,
    foughtAfterDays: foughtAfter.map(a => a.day), refusedAfterDays: refusedAfter.map(a => a.day),
    day87plus: att.filter(a => a.day >= 87).map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    tbHerald: tbHerald,
    endMusterExists: !!mEnd, endMusterAllies: mEnd ? (mEnd.allies || []).length : null,
    endMusterHaven: mEnd ? (mEnd.haven || []).length : null,
    endReason: result.endReason, days: result.days, gameDays: (Game.state.scholar && Game.state.scholar.day) || 0 };
  console.log(JSON.stringify({ replay: out }));
  console.error('POST-BLOCK summary: sounded=' + post.sounded + ' predictedYield=' + post.predictedYield +
    ' actualAllies=' + post.actualAllies + ' havenAfter=' + post.havenAfter + ' readyAfter=' + post.readyAfter +
    ' foughtAfter=' + foughtAfter.length + ' refusedAfter=' + refusedAfter.length + ' end=' + result.endReason);
})();
