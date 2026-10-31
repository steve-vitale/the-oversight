#!/usr/bin/env node
// replay-mustercall-20261031.js — POST-BLOCK ONLY (not judged).
//
// Replays seed 85106 on the full mustercall sweep stack. At the FIRST
// day-112 refused Herald attempt (the first cluster day on which
// call+commit arithmetic reaches the gate), sounds the call once,
// commits Haven's blades (two taps), and then lets the run continue,
// recording whether a later Herald startCombat attempt is FOUGHT.
// Nothing here enters the census tables: the judged sweep never
// calls a muster verb. This replay exists only to validate the
// snapshot callYield arithmetic (predicted 9) against a real
// soundTitanCall result at refusal-moment state, in the muster-a
// style — and to show what happens after the buttons are pressed.
//
// Usage (same env as the sweep, plus REPLAY=1):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   node scripts/replay-mustercall-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
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

(async () => {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'x');
  const policy = FD.withFullseatDiag(sd, 'lead-fullseat', 'x');
  const { Game } = await loadGame({ seed: 85106, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  // Post-attempt interceptor: after the ORIGINAL (instrumented)
  // startCombat returns, if this was the first day-112 refused
  // Herald attempt, sound the call + commit twice, and record.
  const post = { sounded: false, day: null, predictedYield: null, actualAllies: null,
    commitReturns: [], havenAfter: null, readyAfter: null, foughtAfter: [] };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      if (!post.sounded && last && last.day === 112 && r === null) {
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
        console.log('POST-BLOCK sounded on day 112: predictedYield=' + post.predictedYield +
          ' actualAllies=' + post.actualAllies + ' commitReturns=' + JSON.stringify(post.commitReturns) +
          ' havenAfter=' + post.havenAfter + ' readyAfter=' + post.readyAfter);
      }
      if (post.sounded) {
        const att = (t.attempts || []).filter(a => a.mid === 'herald');
        const lastAtt = att.length ? att[att.length - 1] : null;
        if (lastAtt && lastAtt.day >= 112 && lastAtt.cls === 'FOUGHT') post.foughtAfter.push(lastAtt.day);
      }
    } catch (e) { console.log('POST-BLOCK interceptor error: ' + e.message); }
    return r;
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 200, manifest: undefined, sampleEvery: 30 }); });
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  const foughtAfter = att.filter(a => a.day >= 112 && a.cls === 'FOUGHT');
  const refusedAfter = att.filter(a => a.day >= 112 && a.cls === 'REFUSED');
  console.log('POST-BLOCK summary: sounded=' + post.sounded + ' predictedYield=' + post.predictedYield +
    ' actualAllies=' + post.actualAllies + ' havenAfter=' + post.havenAfter + ' readyAfter=' + post.readyAfter);
  console.log('POST-BLOCK herald attempts day>=112: fought=' + foughtAfter.length + ' refused=' + refusedAfter.length +
    ' foughtDays=' + JSON.stringify(foughtAfter.map(a => a.day)) +
    ' endDays=' + JSON.stringify(result.days) + ' endReason=' + result.endReason);
  const day112plus = att.filter(a => a.day >= 112).map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null }));
  console.log('POST-BLOCK day>=112 herald attempts: ' + JSON.stringify(day112plus));
  const tbHerald = Object.keys(t.tbOutcomes).map(k => t.tbOutcomes[k]).filter(v => v && v.mid === 'herald');
  console.log('POST-BLOCK herald tbEnds: ' + JSON.stringify(tbHerald));
  const mEnd = (Game.state.titans.musters || {}).herald;
  console.log('POST-BLOCK end muster: exists=' + !!mEnd + ' allies=' + (mEnd ? (mEnd.allies || []).length : null) + ' haven=' + (mEnd ? (mEnd.haven || []).length : null));
  const out = { post: post, foughtAfterDays: foughtAfter.map(a => a.day), refusedAfterDays: refusedAfter.map(a => a.day),
    day112plus: day112plus, tbHerald: tbHerald,
    endReason: result.endReason, days: result.days };
  fs.writeFileSync(path.join(REPO, 'evidence', '2026-10-31', 'perseed-mustercall', 'replay-s85106-postblock.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote evidence/2026-10-31/perseed-mustercall/replay-s85106-postblock.json');
})();
