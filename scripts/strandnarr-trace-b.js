#!/usr/bin/env node
// strandnarr-trace-b.js — stranded-night narration census + upkeep-
// breakfast adjudication (sim-strandnarr-a; prereg:
// evidence/2026-11-04/sim-strandnarr-a-prereg.md, committed BEFORE
// any judged leg).
//
// Adapted from scripts/bankfood-trace-b.js with ONLY the disclosed
// changes: the policy stack is IDENTICAL (bankfood(warmed(woodcarry(
// nighttravel))) over competent, same env gates), and the ONLY
// additions are observational: a full-transcript recorder
// (scripts/policies/strandnarr-diag.js) that wraps Game.say/sysSay
// and stamps phase markers at upkeep entry/exit, daily entry/exit,
// and sleep entry/exit. The recorder draws no RNG and edits no
// state; STRANDNARR=0 runs the stack untouched (the det-gate leg).
//
// Env (same substrate gates as bankfood-trace-b, all FATAL in main):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0"|"1" BANKFOOD="1"
//   STRANDNARR="0"|"1" (1 = recorder armed)
//   SEEDS (default: the 8 pilot seeds from the prereg)
//   DAYS (default 60) OUTDIR (default
//   evidence/2026-11-04/sim-strandnarr-a-corpus)
// Write transport mirrors the bankfood driver: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.strandnarr-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withBankfood, newStore: newBfStore, packSnap } = require('./policies/bankfood-diag');
const sn = require('./policies/strandnarr-diag');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

// ---- position/sweep readers (copied from bankfood-trace-b.js) ----
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined || sch.mx === null ? null : sch.mx),
    my: (sch.my === undefined || sch.my === null ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
  };
}
function morningWood(Game) {
  try { return (typeof Game.woodCount === 'function') ? Game.woodCount() : null; } catch (e) { return null; }
}

const WOOD_LINE_RE = /wood|cut|clear|lash|bridge|tree|brush/i;

async function oneInstance(seed, opts) {
  const days = (opts && opts.days) || parseInt(process.env.DAYS || '60', 10);
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const snStore = sn.newStore();
  const uninstallTranscript = sn.installTranscript(Game, snStore);
  await setupGame(Game);

  // Sleep wrap: the harness calls Game.sleep() directly (not via
  // policy), so the wrap lives here. Phase + markers bracket the
  // whole call; the end marker always records (finally), even on
  // woke-with-a-start / game-over exits.
  let callIdx = 0, lastUpkeepLoopDay = 0, upkeepPart = 0;
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function' && process.env.STRANDNARR === '1') {
    Game.sleep = function (...args) {
      const ld = callIdx >= 1 ? callIdx : 1;
      snStore.loopDay = ld; snStore.part = 0; snStore.phase = 'sleep';
      sn.snapMarker(this, snStore, 'sleep-start');
      let ret;
      try { ret = origSleep.apply(this, args); }
      finally {
        sn.snapMarker(this, snStore, 'sleep-end');
        snStore.phase = 'harness';
      }
      return ret;
    };
  }

  const evenings = [], mornings = [];
  const wcStore = newStore();
  const base = withWoodcarry(nighttravel, wcStore);
  const wwStore = newWwStore();
  const warmed = withWoodwarm(base, wwStore);
  const pbStore = newBfStore();
  const dayPolicy = withBankfood(warmed, pbStore);
  const policy = Object.assign({}, base, {
    upkeep(Game2, ctx) {
      if (process.env.STRANDNARR === '1') {
        const ld = callIdx + 1;
        if (ld !== lastUpkeepLoopDay) { lastUpkeepLoopDay = ld; upkeepPart = 1; }
        else upkeepPart++;
        snStore.loopDay = ld; snStore.part = upkeepPart; snStore.phase = 'upkeep';
        sn.snapMarker(Game2, snStore, 'upkeep-start');
        try { return dayPolicy.upkeep ? dayPolicy.upkeep(Game2, ctx) : (base.upkeep ? base.upkeep(Game2, ctx) : undefined); }
        finally { sn.snapMarker(Game2, snStore, 'upkeep-end'); snStore.phase = 'harness'; }
      }
      return dayPolicy.upkeep ? dayPolicy.upkeep(Game2, ctx) : (base.upkeep ? base.upkeep(Game2, ctx) : undefined);
    },
    daily(Game2, ctx) {
      callIdx++;
      const armed = process.env.STRANDNARR === '1';
      if (armed) { snStore.loopDay = callIdx; snStore.part = 0; snStore.phase = 'daily'; sn.snapMarker(Game2, snStore, 'daily-start'); }
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m, morningWood: morningWood(Game2) });
      }
      const sayBefore = snStore.lines.length;
      dayPolicy.daily(Game2, ctx);
      const dayLines = snStore.lines.slice(sayBefore).map((x) => x.text);
      const dayWoodLines = dayLines.filter((l) => WOOD_LINE_RE.test(l));
      const eveningSayTail = dayLines.slice(Math.max(0, dayLines.length - 30));
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: false, ...pos, eveningSayTail };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const nt = ctx._ntLast || {};
        row.eveningOutcome = nt.outcome || 'policy-no-record';
        row.eveningMethod = nt.method || null;
        row.travelledHome = !!nt.travelledHome;
        row.havenDistance = (nt.havenDistance === undefined ? null : nt.havenDistance);
        row.travelOffered = (nt.travelOffered === undefined ? null : nt.travelOffered);
        row.travel = nt.travel || null;
      }
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      row.bankfoodMorning = (pbStore.mornings || []).find((a) => a.loopDay === callIdx) || null;
      row.bankfoodEvening = (pbStore.evenings || []).find((a) => a.loopDay === callIdx) || null;
      try { row.postDailyPack = packSnap(Game2); } catch (e) { row.postDailyPack = null; }
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
      if (armed) { sn.snapMarker(Game2, snStore, 'daily-end'); snStore.phase = 'harness'; }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: null });
  try { uninstallTranscript(); } catch (e) {}
  try { if (typeof origSleep === 'function') Game.sleep = origSleep; } catch (e) {}
  return {
    seed, policy: 'nighttravel', daysAlive: result.days, endReason: result.endReason,
    gameDays: result.gameDays, maxWaveUnlocked: result.maxWaveUnlocked,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings,
    bankfoodStore: { mornings: pbStore.mornings, evenings: pbStore.evenings, firstUpkeeps: pbStore.firstUpkeeps, errs: pbStore.errs, errors: pbStore.errors },
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors },
    warmthStore: { errs: wwStore.errs, errors: wwStore.errors, acted: wwStore.acted },
    transcript: { lines: snStore.lines, markers: snStore.markers, errs: snStore.errs, errors: snStore.errors, installed: !!snStore.installed },
  };
}

// ---- analysis (runs in-process on the FULL transcript) ----
function sleepPair(markers, loopDay) {
  // Last sleep pair for the loop-day (the harness sleep, after daily).
  let pair = null;
  for (let i = 0; i < markers.length; i++) {
    if (markers[i].kind === 'sleep-start' && markers[i].loopDay === loopDay) {
      let end = null;
      for (let j = i + 1; j < markers.length; j++) {
        if (markers[j].kind === 'sleep-end' && markers[j].loopDay === loopDay) { end = markers[j]; break; }
        if (markers[j].kind === 'sleep-start' && markers[j].loopDay === loopDay) break;
      }
      if (end) pair = { start: markers[i], end };
    }
  }
  return pair;
}

function analyzeInstance(inst) {
  const { lines, markers } = inst.transcript;
  const store = { lines, markers };
  const stranded = [];
  for (const row of inst.evenings) {
    if (!(row.eveningOutcome === 'travel-refused' || row.eveningOutcome === 'out-of-reach')) continue;
    if (row.inside === true) continue;
    const pair = sleepPair(markers, row.loopDay);
    let win = null, sleptThrough = null;
    if (pair) {
      win = sn.classifySleepWindow(sn.windowLines(store, pair.start, pair.end));
      sleptThrough = pair.end.scholarDay > pair.start.scholarDay;
    }
    stranded.push({ loopDay: row.loopDay, tile: row.tile, outcome: row.eveningOutcome,
      evening: row.bankfoodEvening || null, sleepPair: pair ? { startDay: pair.start.scholarDay, endDay: pair.end.scholarDay } : null,
      sleptThrough, sleepWindow: win });
  }
  const slept = stranded.filter((s) => s.sleptThrough === true);
  const beddingOk = slept.filter((s) => s.sleepWindow && s.sleepWindow.bedding.length > 0);
  const refused = stranded.filter((s) => s.sleepWindow && s.sleepWindow.refused.length > 0);
  const woke = stranded.filter((s) => s.sleepWindow && s.sleepWindow.wokeStart.length > 0);

  // Stranded mornings: loopDay L whose evening L-1 was stranded.
  const strandedLoopDays = new Set(stranded.map((s) => s.loopDay));
  const mornings = [];
  for (const m of inst.mornings) {
    if (!strandedLoopDays.has(m.loopDay - 1)) continue;
    const fu = (inst.bankfoodStore.firstUpkeeps || []).find((f) => f.scholarDay === m.gameDay) || null;
    const upLines = lines.filter((l) => l.phase === 'upkeep' && l.loopDay === m.loopDay);
    const up = sn.classifyUpkeepWindow(upLines);
    const bm = m.loopDay ? (inst.evenings.find((e) => e.loopDay === m.loopDay) || {}).bankfoodMorning || null : null;
    const dailyKcalBefore = bm ? bm.kcalBefore : null;
    const delta = (fu && dailyKcalBefore != null) ? (dailyKcalBefore - fu.kcal) : null;
    // Pantry movement across the upkeep window: first upkeep-start
    // marker vs the daily-start marker of the same loop-day.
    const upStarts = markers.filter((k) => k.kind === 'upkeep-start' && k.loopDay === m.loopDay);
    const dStart = markers.find((k) => k.kind === 'daily-start' && k.loopDay === m.loopDay);
    const pantryDelta = (upStarts.length && dStart) ? (dStart.pantryKcal - upStarts[0].pantryKcal) : null;
    const accessValues = [...new Set(upStarts.map((k) => k.access))];
    const matched = (delta != null && delta >= 50)
      ? (up.mealKcal > 0 && up.mealKcal >= delta - 200)
      : null;
    mornings.push({ loopDay: m.loopDay, gameDay: m.gameDay, tile: m.tile,
      firstUpkeepKcal: fu ? fu.kcal : null, dailyKcalBefore, delta,
      mealKcal: up.mealKcal, meals: up.meals, matched,
      pantryDelta, accessValues, inside: m.inside,
      pantryHallLines: up.pantryHall.length, gossipLines: up.gossip.length });
  }
  const gainMornings = mornings.filter((x) => x.delta != null && x.delta >= 50);
  const matchedMornings = gainMornings.filter((x) => x.matched === true);

  // Anchor: loop-days 51-53 evenings + loop-day 52 morning.
  const anchor = {};
  for (const ld of [51, 52, 53]) {
    const row = inst.evenings.find((e) => e.loopDay === ld) || null;
    const s = stranded.find((x) => x.loopDay === ld) || null;
    anchor['evening' + ld] = row ? { outcome: row.eveningOutcome, tile: row.tile, inside: row.inside,
      bankfoodEvening: row.bankfoodEvening, stranded: !!s,
      sleptThrough: s ? s.sleptThrough : null,
      sleepWindow: s ? s.sleepWindow : null } : null;
  }
  const m52 = mornings.find((x) => x.loopDay === 52) || null;
  anchor.morning52 = m52;
  return { stranded, sleptCount: slept.length, beddingCount: beddingOk.length,
    refusedCount: refused.length, wokeCount: woke.length,
    coverage: slept.length ? (beddingOk.length / slept.length) : null,
    mornings, gainMornings: gainMornings.length, matchedMornings: matchedMornings.length,
    upkeepCoverage: gainMornings.length ? (matchedMornings.length / gainMornings.length) : null,
    anchor };
}

// Trim a full transcript for the corpus file: seed 17021 keeps every
// line (the anchor adjudication must be re-auditable verbatim);
// other seeds keep judged windows (stranded sleep + stranded-morning
// upkeep lines), every pattern line, per-loop-day counts, and the
// discard count. The analysis above already ran on the full text.
function trimTranscript(inst, analysis) {
  const { lines } = inst.transcript;
  if (inst.seed === 17021) return { kept: 'full', lines, markers: inst.transcript.markers };
  const keepIdx = new Set();
  for (const s of analysis.stranded) {
    const pair = sleepPair(inst.transcript.markers, s.loopDay);
    if (pair) for (let i = pair.start.idx; i < pair.end.idx; i++) keepIdx.add(i);
  }
  for (const m of analysis.mornings) {
    for (const l of lines) if (l.phase === 'upkeep' && l.loopDay === m.loopDay) keepIdx.add(l.idx);
  }
  for (const l of lines) {
    if (sn.mealBeat(l.text) || sn.isBeddingLine(l.text) || sn.isNightOutLine(l.text)
      || sn.isSleepRefusedLine(l.text) || sn.isWokeStartLine(l.text)
      || sn.isPantryHallLine(l.text) || sn.isHavenGossipLine(l.text)) keepIdx.add(l.idx);
  }
  const kept = lines.filter((l) => keepIdx.has(l.idx));
  const counts = {};
  for (const l of lines) { const k = l.loopDay + ':' + l.phase; counts[k] = (counts[k] || 0) + 1; }
  return { kept: 'judged-windows+pattern-lines', lines: kept,
    markers: inst.transcript.markers, totalLines: lines.length,
    discarded: lines.length - kept.length, perLoopDayPhaseCounts: counts };
}

function assertEnv() {
  const fail = (m) => { console.error('FATAL: ' + m); process.exit(2); };
  if (process.env.COMPETENT_FEAST !== '0') fail('COMPETENT_FEAST=0 must be set explicitly');
  if (process.env.SEATDRIVE !== '0') fail('SEATDRIVE=0 must be set explicitly');
  if (process.env.PLENTYDEPRI !== '0') fail('PLENTYDEPRI=0 must be set explicitly');
  if (process.env.DEPOSITGATE !== '1') fail('DEPOSITGATE=1 must be set explicitly');
  if (process.env.WOODCARRY !== '1') fail('WOODCARRY must be 1');
  if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') fail('WOODWARM must be 0 or 1');
  if (process.env.POLICY !== 'nighttravel') fail('POLICY must be nighttravel');
  if (process.env.BANKFOOD !== '1') fail('BANKFOOD must be 1 for the variant leg');
  if (process.env.STRANDNARR !== '1') fail('STRANDNARR must be 1 for the census leg');
}

async function main() {
  assertEnv();
  const SEEDS = (process.env.SEEDS || '17021,15003,15009,15091,15211,15215,15220,15221')
    .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-strandnarr-a-corpus');
  const STAGING_DIR = path.join(__dirname, '..', '.strandnarr-staging');
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    const analysis = analyzeInstance(inst);
    const corpus = { seed, policy: inst.policy, daysAlive: inst.daysAlive,
      endReason: inst.endReason, gameDays: inst.gameDays,
      maxWaveUnlocked: inst.maxWaveUnlocked, deaths: inst.deaths,
      evenings: inst.evenings, mornings: inst.mornings,
      bankfoodStore: inst.bankfoodStore, woodcarryStore: inst.woodcarryStore,
      warmthStore: inst.warmthStore,
      transcriptErrs: inst.transcript.errs, transcriptErrors: inst.transcript.errors,
      transcript: trimTranscript(inst, analysis), analysis };
    const name = 'strandnarr-s' + seed + '.json';
    const data = JSON.stringify(corpus);
    const ok = tryWrite(path.join(OUTDIR, name), data, 6);
    if (ok) console.log('strandnarr woodwarm=' + process.env.WOODWARM + ' seed=' + seed + ' end=' + inst.endReason + ' days=' + inst.daysAlive + ' stranded=' + analysis.stranded.length + ' slept=' + analysis.sleptCount + ' bedding=' + analysis.beddingCount + ' strandedMornings=' + analysis.mornings.length + ' gainMornings=' + analysis.gainMornings + ' matched=' + analysis.matchedMornings + ' written');
    else { pending.push({ name, data }); console.error('strandnarr seed=' + seed + ' WRITE PENDING (EPERM flap) — kept in memory'); }
    done++;
  }
  if (pending.length) {
    const deadline = Date.now() + 30 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' strandnarr files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('STRANDNARR CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance, analyzeInstance, trimTranscript, sleepPair };
