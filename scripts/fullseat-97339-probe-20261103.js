#!/usr/bin/env node
// fullseat-97339-probe-20261103.js — full-seat diagnostic, seed 97339 ONLY.
// Measurement only: zero game-code change, zero policy change vs the
// 1825Z wonflag probe. Re-runs the 1715Z closecommit stack verbatim
// (tribfloor leadfeast + windefer + seatdrive + fullseat-diag +
// titanroute + musterclose + mustergap), mode 'herald', 250d cap,
// FULL say capture, and records tableProg + the full-seat gate vector
// (progression.js deedGateReady, via fullseat-diag snapFullSeat) at
// every table-audit line AND at run end, so the seat grade announced
// at the table can be compared with the gate state at that moment.
//
// Env (same flags as the 1715Z driver header):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
//   FULLSEAT=1 HERALD=1
// Missing flags print a warning (the judged run sets all seven).
// Output: compact analysis JSON on stdout AND to FULLSEAT_OUT
// (default: evidence/2026-11-02/fullseat-97339-analysis.json, relative
// to this worktree). The full say transcript is NOT written to the
// repo: it goes only to FULLSEAT_SAYS_OUT (default /tmp).
// Usage: node scripts/fullseat-97339-probe-20261103.js 97339
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));

const FLAGS = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD'];
const flagState = {};
for (const k of FLAGS) {
  flagState[k] = process.env[k] || null;
  if (process.env[k] !== '1') console.error(`FULLSEAT-PROBE WARN: ${k}!=1 (judged run sets all seven).`);
}

function policyFor() {
  const b = FD.withFullseatDiag(
    SD.withSeatDrive(WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x'), 'lead-seatdrive', 'x'),
    'lead-fullseat', 'x');
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'x');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'x');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'x');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function earnedPaths(Game) {
  try {
    const ps = (typeof Game.tableEarnedPaths === 'function') ? Game.tableEarnedPaths() : [];
    return (ps || []).map(p => ({ id: p.id, earned: !!p.earned, strength: p.strength | 0, why: String(p.why || '').slice(0, 200) }));
  } catch (e) { return [{ error: String(e.message).slice(0, 120) }]; }
}

function gateSnap(Game) {
  try { return FD.snapFullSeat(Game); } catch (e) { return { error: String(e.message).slice(0, 200) }; }
}

(async () => {
  const seed = parseInt(process.argv[2], 10);
  if (seed !== 97339) { console.error('FULLSEAT-PROBE STOP: this probe is seed 97339 only.'); process.exit(2); }
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const policy = policyFor();
  await setupGame(Game);
  const says = [];
  const auditSnaps = [];
  const wrapErrors = [];
  const AUDIT_RX = /A lesser seat|A full seat|THE TABLE|table.*audit|Choose your door|Seven doors|The ring waits/i;
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') {
        const line = String(arg).slice(0, 600);
        says.push({ day: gday(Game), line });
        if (AUDIT_RX.test(line) && auditSnaps.length < 20) {
          auditSnaps.push({ day: gday(Game), trigger: line.slice(0, 200), gate: gateSnap(Game), earnedPaths: earnedPaths(Game) });
        }
      }
    } catch (e) { wrapErrors.push('say-wrap: ' + String(e.message).slice(0, 120)); }
    return origSay.apply(this, arguments);
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 250, manifest: undefined, sampleEvery: 30 }); });
  const st = Game.state || {};
  let road = null;
  try { road = Game.nomadRoad ? Game.nomadRoad() : (st.road || null); } catch (e) { road = 'err:' + e.message; }
  let tableProg = null;
  try { tableProg = (st.scholar && st.scholar.prog && st.scholar.prog.table) || null; } catch (e) { wrapErrors.push('tableProg: ' + String(e.message).slice(0, 120)); }
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { wrapErrors.push('scaleRank: ' + String(e.message).slice(0, 120)); }
  const endGate = gateSnap(Game);
  const endPaths = earnedPaths(Game);
  const tableProgSafe = tableProg ? JSON.parse(JSON.stringify(tableProg)) : null;

  // Reproduction match vs the 1825Z branch row for 97339.
  const expected = { days: 92, endReason: 'over-other', won: true, scaleRank: 'national', maxWave: 4, seat: 'lesser', path: 'feared', final: 'mercy', taker: 'Elif Demir', takerSelf: true };
  const finalId = tableProg && tableProg.resolution ? tableProg.resolution.finalId : null;
  const finalLabel = tableProg && tableProg.resolution ? tableProg.resolution.label : null;
  const finalIsMercy = (String(finalId || '') === 'mercy') || /mercy/i.test(String(finalLabel || ''));
  const got = {
    days: result.days, endReason: result.endReason, won: !!Game.won, scaleRank,
    maxWave: result.maxWaveUnlocked, seat: tableProg ? tableProg.seat : null,
    path: tableProg ? tableProg.path : null, finalId, finalLabel,
    taker: tableProg && tableProg.seatTaker ? tableProg.seatTaker.name : null,
    takerSelf: tableProg && tableProg.seatTaker ? !!tableProg.seatTaker.self : null,
  };
  const match = {
    days: got.days === expected.days, endReason: got.endReason === expected.endReason,
    won: got.won === expected.won, scaleRank: got.scaleRank === expected.scaleRank,
    maxWave: got.maxWave === expected.maxWave, seat: got.seat === expected.seat,
    path: got.path === expected.path, finalMercy: finalIsMercy,
    taker: got.taker === expected.taker, takerSelf: got.takerSelf === expected.takerSelf,
  };
  match.all = Object.keys(match).every(k => k === 'all' || match[k] === true);

  const analysis = {
    probe: 'fullseat-97339-probe-20261103', seed, expected, got, match,
    over: !!Game.over, villageLost: !!Game.villageLost,
    roadActive: road ? !!road.active : false,
    tablePhase: tableProg ? tableProg.phase : null,
    tableProg: tableProgSafe, endGate, endEarnedPaths: endPaths, auditSnaps,
    sayCount: says.length, flags: flagState, wrapErrors: wrapErrors.slice(0, 20),
  };
  const outPath = process.env.FULLSEAT_OUT || path.join(REPO, 'evidence', '2026-11-02', 'fullseat-97339-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 2) + '\n');
  const saysOut = process.env.FULLSEAT_SAYS_OUT || '/tmp/fullseat-97339-says.jsonl';
  try { fs.writeFileSync(saysOut, says.map(s => JSON.stringify(s)).join('\n') + '\n'); } catch (e) { console.error('FULLSEAT-PROBE WARN: says write failed: ' + e.message); }
  console.log(JSON.stringify(analysis, null, 2));
  console.log('=== LAST 40 SAY LINES ===');
  for (const s of says.slice(-40)) console.log(`d${s.day}: ${s.line}`);
  console.log('=== AUDIT-TRIGGER LINES (all) ===');
  for (const s of says) if (AUDIT_RX.test(s.line)) console.log(`d${s.day}: ${s.line}`);
  console.log('=== ENDING-KEYWORD LINES (all) ===');
  const rx = /road ends|You stop walking|Everyone's found|Long Way|THE PRICE|PODS OPEN|galactic|table.*done|Hosts|HOSTS|seat.*taken|takes the seat|epilogue|You won/i;
  for (const s of says) if (rx.test(s.line)) console.log(`d${s.day}: ${s.line}`);
})().catch(e => { console.error('PROBE-FAILED', e && e.stack || e); process.exit(1); });
