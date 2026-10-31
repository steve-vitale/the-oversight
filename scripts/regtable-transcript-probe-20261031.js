#!/usr/bin/env node
// regtable-transcript-probe-20261031.js — SCRATCH sense-read probe.
//
// Runs ONE seed on the regtable stack with Game.emit wrapped
// (call-through, pure read: appends {day, surface, text} to an
// external array, writes nothing to game state, draws no RNG) and
// prints the captured lines mentioning the endgame table
// ('table', 'lesser seat', 'full seat', 'audit', 'priced') to
// stdout as JSON. Output is a scratch transcript for the evidence's
// sense-testing section ONLY — it is NOT judged corpus, it is not
// det-gated, and its end fields are sanity-checked against the
// judged JSON for the same seed (printed to stderr).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//   FULLSEAT=1 WAVEGATE=1 REGTABLE=1 SEED=87107 \
//   node scripts/regtable-transcript-probe-20261031.js \
//   > scratch-regtable-transcript.json 2> scratch-regtable-transcript.log
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const WG = require(path.join(REPO, 'scripts', 'policies', 'wavegate-diag'));
const RT = require(path.join(REPO, 'scripts', 'policies', 'regtable-diag'));

const SEED = parseInt(process.env.SEED || '87107', 10);

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'probe');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'probe');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'probe');
  const wg = WG.withWavegateDiag(fd, 'lead-wavegate', 'probe');
  return RT.withRegtableDiag(wg, 'lead-regtable', 'probe');
}

(async () => {
  const policy = policyFor();
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  const captured = [];
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  // NOTE: wrapping Game.emit captures nothing in this harness (internal
  // code does not route through the returned object's emit), while
  // wrapping Game.sysSay DOES capture (proven by the judged recorders'
  // beats). The narration channel is say(), so wrap say() — sysSay
  // routes through say() on the same object.
  const origSay = Game.say.bind(Game);
  Game.say = function (text) {
    try { captured.push({ day: dayOf(), surface: 'narration', text: String(text == null ? '' : text) }); } catch (e) {}
    return origSay(text);
  };
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 200, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  let endRank = null;
  try { endRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  let table = 0;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  console.error(`probe s${SEED}: gameDays=${(st.scholar && st.scholar.day) || 0} won=${!!Game.won} table=${table} rank=${endRank} end=${result.endReason} captured=${captured.length}`);
  const needle = /table|lesser seat|full seat|audit|priced/i;
  const hits = captured.filter(c => needle.test(c.text));
  process.stdout.write(JSON.stringify({ seed: SEED, hits }, null, 1) + '\n');
})();
