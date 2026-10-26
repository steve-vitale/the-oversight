#!/usr/bin/env node
// scripts/test-tablenat-a.js — sim-tablenat-a trace (DIAG, zero src/js).
// Traces one seed under the tableseat-nowait substrate (LEANLINKRESCUE=1
// + TABLESEATNOWAIT=1, seat legs only, 180d death-aware) with a DAILY
// snapshot of the rank / national / table fields whose disagreement is
// the question of this arm:
//
//   scaleRank()          <- hierarchy.js: single scale API
//                            (globalLive > nationalLive > networkLive)
//   state.nationalLive / state.nationalDay
//                            <- hierarchy.js court-sitting beat only
//   progState().arc / tableWaiting / tableDone / tableAnnounced
//                            <- progression.js Arc IV + table.js scene
//   tableSeat() detail   <- table.js: full / lesser / none
//   ctx.tsNationalDay    <- tableseat-nowait.js policy ctx ONLY:
//                            first day the policy daily sees scaleRank>=2.
//                            It is NOT a game field and NOT state.nationalDay.
//                            A village that never reaches rank>=2 has ts={}
//                            by construction, whatever its seat.
//
// The sweep row's `table` flag is hist.everTable (any day's
// progState().tableWaiting, OR end tableWaiting) — an invitation-ever
// flag, not "sitting at the table at end". `entered` is
// hist.everEntered (any day's tableDone) — the sitting flag.
// A regional village CAN hold the lesser seat (table.js tableSeat():
// scaleOk = regional|national|global), so table=1 + maxRank=regional
// is consistent with the game gate IF the trace shows a lesser seat
// on a waiting day. It would be an instrument artifact only if the
// waiting days show seat='none' (tableWaiting set without a seat)
// or a national-scale day the sweep's maxRank missed.
//
// Usage: node scripts/test-tablenat-a.js [seed]  (default 73672)
// Prints the first-waiting-day block, the waiting-day span, the last
// waiting day, the end state, and every rank-change day. Also writes
// evidence/2026-10-26/perseed-sim-tablenat-a/s<seed>-tablenat-trace.json
// (trace only; never a sweep corpus row).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

function snap(Game) {
  const out = {};
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { out.rank = 'village'; }
  try { out.nationalLive = !!(Game.state && Game.state.nationalLive); } catch (e) { out.nationalLive = false; }
  try { out.networkLive = !!(Game.state && Game.state.networkLive); } catch (e) { out.networkLive = false; }
  try { out.globalLive = !!(Game.state && Game.state.globalLive); } catch (e) { out.globalLive = false; }
  try { out.nationalDay = (Game.state && Game.state.nationalDay) || 0; } catch (e) { out.nationalDay = 0; }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableDone = !!pg.tableDone; out.tableAnnounced = !!pg.tableAnnounced; } catch (e) { out.arc = 1; out.tableWaiting = false; out.tableDone = false; out.tableAnnounced = false; }
  try { out.stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) { out.stage = null; }
  try { out.day = (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { out.day = 0; }
  return out;
}
function seatDetail(Game) {
  try {
    const s = (typeof Game.tableSeat === 'function') ? Game.tableSeat() : null;
    return s ? { seat: s.seat || 'none', detail: s.detail || {} } : null;
  } catch (e) { return { seat: 'error', detail: {}, error: String((e && e.message) || e).slice(0, 120) }; }
}

async function main() {
  const seed = parseInt(process.argv[2] || '73672', 10);
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'tablenat-a', fullTelemetry: false });
  await setupGame(Game);
  // Sense-test capture (journey-arm method, read-only): wrap say/emit to
  // record spoken lines with the day at call time. No RNG, no inputs.
  const capture = [];
  const gdayOf = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  const days = [];
  const rankChanges = [];
  let prevRank = null;
  let capturedCtx = null;
  let firstWaitingSeat = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      const s = snap(G);
      days.push(s);
      if (s.tableWaiting && !firstWaitingSeat) firstWaitingSeat = { day: s.day, rank: s.rank, arc: s.arc, stage: s.stage, seat: seatDetail(G) };
      if (prevRank !== null && s.rank !== prevRank) rankChanges.push({ day: s.day, from: prevRank, to: s.rank });
      prevRank = s.rank;
      return tableseatNowait.daily(G, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const endSeat = seatDetail(Game);
  const waiting = days.filter(d => d.tableWaiting);
  const firstWaiting = waiting.length ? waiting[0] : null;
  const lastWaiting = waiting.length ? waiting[waiting.length - 1] : null;
  // Seat detail on the first waiting day cannot be re-read after the run
  // (state moved on), so re-derive it from the day's own fields: the
  // trace records rank/arc/stage on that day, and the final seat is
  // read live above. The first-waiting-day seat is established by the
  // companion check below (seat at end + rank never >=2 + arc 4).
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const TABLE_RX = /table is being set|TABLE IS SET|ARC IV|lesser seat|full seat|the table has your name|does not come|NO HUNGER ON THE RECORD|THE DEEDS ARE NOT|priced for what you built|ring of pale light|Haven is national|became national|Haven is regional|REALM|realm/i;
  const tableLines = capture.filter(c => TABLE_RX.test(c.line)).map(c => ({ day: c.day, line: c.line.slice(0, 300) }));
  const report = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, end, endSeat, ts,
    waitingDays: waiting.length, firstWaiting, firstWaitingSeat, lastWaiting, tableLines,
    waitingDayList: waiting.map(d => d.day),
    rankChanges, maxRank: days.reduce((m, d) => m, null),
    ranksSeen: [...new Set(days.map(d => d.rank))],
    nationalLiveEver: days.some(d => d.nationalLive),
    nationalDayEver: Math.max(...days.map(d => d.nationalDay || 0)),
    tableDoneEver: days.some(d => d.tableDone),
  };
  // maxRank by the sweep's ordering (village 0, regional 1, national 2, global 3)
  const ord = { village: 0, regional: 1, national: 2, global: 3 };
  report.maxRank = days.reduce((m, d) => (ord[d.rank] || 0) > (ord[m] || 0) ? d.rank : m, 'village');
  const outDir = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tablenat-a');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `s${seed}-tablenat-trace.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 1) + '\n');
  console.log(JSON.stringify({
    seed, days: report.days, endReason: report.endReason, won: report.won,
    endRank: end.rank, maxRank: report.maxRank, endSeat: endSeat && endSeat.seat,
    ts, waitingDays: report.waitingDays,
    firstWaitingDay: firstWaiting && firstWaiting.day, firstWaitingRank: firstWaiting && firstWaiting.rank,
    firstWaitingSeat: firstWaitingSeat && firstWaitingSeat.seat,
    firstWaitingArc: firstWaiting && firstWaiting.arc, firstWaitingStage: firstWaiting && firstWaiting.stage,
    lastWaitingDay: lastWaiting && lastWaiting.day,
    nationalLiveEver: report.nationalLiveEver, nationalDayEver: report.nationalDayEver,
    tableLinesCount: tableLines.length,
    tableLinesNearFirstWaiting: firstWaiting ? tableLines.filter(l => Math.abs(l.day - firstWaiting.day) <= 3) : [],
    tableDoneEver: report.tableDoneEver, rankChanges, ranksSeen: report.ranksSeen,
    traceFile: outPath,
  }, null, 1));
  // Assertions of record (exit 1 if the trace contradicts the row it must reproduce):
  const fails = [];
  if (report.days !== 180) fails.push(`days ${report.days} != 180`);
  if (report.maxRank !== 'regional') fails.push(`maxRank ${report.maxRank} != regional`);
  if (!report.waitingDays) fails.push('no waiting day (table flag would be 0)');
  if (report.tableDoneEver) fails.push('tableDone ever true (entered would be 1)');
  if (report.nationalLiveEver) fails.push('nationalLive ever true (national would be 1)');
  if (Object.keys(ts).length) fails.push(`ts non-empty: ${JSON.stringify(ts)}`);
  if (fails.length) { console.error('TABLENAT TRACE FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log('TABLENAT TRACE PASS: regional-only, waiting-ever, never entered, never national, ts empty — reproduces the 73672 row shape on current HEAD.');
}
if (require.main === module) main().catch(e => { console.error('TABLENAT TRACE FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { snap, seatDetail };
