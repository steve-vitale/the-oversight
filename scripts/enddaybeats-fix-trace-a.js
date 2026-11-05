#!/usr/bin/env node
// enddaybeats-fix-trace-a.js — endDay haven-beats family FIX census on
// stranded scholars (sim-enddaybeats-fix-a; prereg:
// evidence/2026-11-05/sim-enddaybeats-fix-a-prereg.md, committed BEFORE
// any judged leg).
//
// Adapted from scripts/enddaybeats-trace-a.js with ONLY the disclosed
// changes: the policy stack is IDENTICAL (bankfood(warmed(woodcarry(
// nighttravel))) over competent, same env gates, WOODWARM=0), the
// transcript recorder is the SAME judged instrument
// (scripts/policies/strandnarr-diag.js, STRANDNARR=1 arms it), the
// analysis is the SAME enddaybeats-diag classification, and the ONLY
// additions are: (a) OUTDIR/prefix for the fix corpus (before/after
// legs), (b) ONE read-only observation — pendingHavenNews depth per
// evening + at run end (held-volume accounting for the relay; a
// length read, no state edit, no RNG). The recorder draws no RNG and
// edits no state; STRANDNARR=0 runs the stack untouched (the
// det-gate leg).
//
// Env (same substrate gates as gossipcensus-trace-a.js, all FATAL in main):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0" BANKFOOD="1"
//   STRANDNARR="0"|"1" (1 = recorder armed)
//   SEEDS (default: the 8 pilot seeds from the prereg)
//   DAYS (default 60) OUTDIR (default
//   evidence/2026-11-05/sim-enddaybeats-fix-a-corpus/before)
// Write transport mirrors the gossipcensus driver: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.enddaybeats-staging, never /tmp) and exits loudly.
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
const gc = require('./policies/gossipcensus-diag');
const eb = require('./policies/enddaybeats-diag');

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

// ---- position/sweep readers (copied from strandnarr-trace-b.js) ----
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

  // mark(Game, store, kind): strandnarr snapMarker PLUS the scholar's
  // map coordinates (read-only) on the marker itself, so a gossip
  // line's fire-time position is the marker's position. When the
  // recorder is OFF no marker is written at all (det-gate identity).
  function mark(Game2, store, kind) {
    sn.snapMarker(Game2, store, kind);
    try {
      const m = store.markers[store.markers.length - 1];
      if (m) { const p = gc.scholarPos(Game2); m.mx = p.mx; m.my = p.my; }
    } catch (e) { /* position is observational; a failed read never breaks the run */ }
  }

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
      mark(this, snStore, 'sleep-start');
      let ret;
      try { ret = origSleep.apply(this, args); }
      finally {
        mark(this, snStore, 'sleep-end');
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
        mark(Game2, snStore, 'upkeep-start');
        try { return dayPolicy.upkeep ? dayPolicy.upkeep(Game2, ctx) : (base.upkeep ? base.upkeep(Game2, ctx) : undefined); }
        finally { mark(Game2, snStore, 'upkeep-end'); snStore.phase = 'harness'; }
      }
      return dayPolicy.upkeep ? dayPolicy.upkeep(Game2, ctx) : (base.upkeep ? base.upkeep(Game2, ctx) : undefined);
    },
    daily(Game2, ctx) {
      callIdx++;
      const armed = process.env.STRANDNARR === '1';
      if (armed) { snStore.loopDay = callIdx; snStore.part = 0; snStore.phase = 'daily'; mark(Game2, snStore, 'daily-start'); }
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
      // HELD-VOLUME (fix arm, read-only): relay queue depth tonight.
      try { row.pendingHavenNews = ((Game2.state || {}).pendingHavenNews || []).length; } catch (e) { row.pendingHavenNews = null; }
      row.warmth = ctx._wwLast || null;
      row.bankfoodMorning = (pbStore.mornings || []).find((a) => a.loopDay === callIdx) || null;
      row.bankfoodEvening = (pbStore.evenings || []).find((a) => a.loopDay === callIdx) || null;
      try { row.postDailyPack = packSnap(Game2); } catch (e) { row.postDailyPack = null; }
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
      if (armed) { mark(Game2, snStore, 'daily-end'); snStore.phase = 'harness'; }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: null });
  let pendingHavenNewsEnd = null;
  try { pendingHavenNewsEnd = ((Game.state || {}).pendingHavenNews || []).length; } catch (e) {}
  try { uninstallTranscript(); } catch (e) {}
  try { if (typeof origSleep === 'function') Game.sleep = origSleep; } catch (e) {}
  return {
    seed, policy: 'nighttravel', daysAlive: result.days, endReason: result.endReason,
    pendingHavenNewsEnd,
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
  // Per-kind window tallies: { kind: { windows, lines } } where
  // windows counts windows holding >= 1 line of that kind (the
  // primary metric). Raid events collapse the 🐗 line + 🚨 call.
  function emptyTallies() {
    const t = {};
    for (const k of eb.BEAT_KINDS.concat(eb.CONTROL_KINDS)) t[k] = { windows: 0, lines: 0 };
    t['raid-event'] = { windows: 0, lines: 0 };
    t['burst-event'] = { windows: 0, lines: 0 };
    t['settle'] = { windows: 0, lines: 0 };
    return t;
  }
  function addWindow(tallies, w) {
    for (const k of Object.keys(w.perKind)) {
      tallies[k].windows += w.perKind[k].windows;
      tallies[k].lines += w.perKind[k].lines;
    }
    tallies['raid-event'].windows += w.raidEvent ? 1 : 0;
    tallies['raid-event'].lines += (w.perKind['raid-call'].lines + w.perKind['raid-line'].lines + w.perKind['raid-aftermath'].lines);
    tallies['burst-event'].windows += w.burstEvents ? 1 : 0;
    tallies['burst-event'].lines += w.burstLines;
    tallies['settle'].windows += w.settleLines ? 1 : 0;
    tallies['settle'].lines += w.settleLines;
  }
  const stranded = [];
  for (const row of inst.evenings) {
    if (!(row.eveningOutcome === 'travel-refused' || row.eveningOutcome === 'out-of-reach')) continue;
    if (row.inside === true) continue;
    const pair = sleepPair(markers, row.loopDay);
    let win = null, sleptThrough = null;
    if (pair) {
      win = eb.classifyEnddayWindow(sn.windowLines(store, pair.start, pair.end), markers);
      sleptThrough = pair.end.scholarDay > pair.start.scholarDay;
    }
    stranded.push({ loopDay: row.loopDay, tile: row.tile, outcome: row.eveningOutcome,
      sleptThrough, sleepWindow: win,
      sleepStartPos: pair ? { inside: pair.start.inside, mx: pair.start.mx, my: pair.start.my, tile: pair.start.tile } : null });
  }

  // Stranded mornings: loopDay L whose evening L-1 was stranded.
  const strandedLoopDays = new Set(stranded.map((s) => s.loopDay));
  const mornings = [];
  for (const m of inst.mornings) {
    if (!strandedLoopDays.has(m.loopDay - 1)) continue;
    const upLines = lines.filter((l) => l.phase === 'upkeep' && l.loopDay === m.loopDay);
    const up = eb.classifyEnddayWindow(upLines, markers);
    const upStarts = markers.filter((k) => k.kind === 'upkeep-start' && k.loopDay === m.loopDay);
    mornings.push({ loopDay: m.loopDay, gameDay: m.gameDay, tile: m.tile, inside: m.inside,
      upkeepWindow: up, upkeepStartPos: upStarts.length
        ? { inside: upStarts[0].inside, mx: upStarts[0].mx, my: upStarts[0].my, tile: upStarts[0].tile } : null });
  }

  // Non-stranded contrast: every sleep pair whose evening was NOT
  // stranded, and every upkeep loopDay whose previous evening was
  // NOT stranded. Windows with no sleep pair (game over mid-sleep)
  // are unobserved, not zero — they are excluded, not counted.
  const strandedSet = new Set(stranded.map((s) => s.loopDay));
  const nsSleepTallies = emptyTallies();
  const nsSleepHits = [];
  let nsSleepWindows = 0;
  const maxLoopDay = Math.max(0, ...inst.evenings.map((e) => e.loopDay));
  for (let ld = 1; ld <= maxLoopDay; ld++) {
    if (strandedSet.has(ld)) continue;
    const pair = sleepPair(markers, ld);
    if (!pair) continue;
    nsSleepWindows++;
    const w = eb.classifyEnddayWindow(sn.windowLines(store, pair.start, pair.end), markers);
    addWindow(nsSleepTallies, w);
    for (const h of w.hits) nsSleepHits.push({ loopDay: ld, ...h });
    for (const h of w.gossipHits) nsSleepHits.push({ loopDay: ld, ...h, family: 'burst' });
  }
  const upkeepLoopDays = [...new Set(lines.filter((l) => l.phase === 'upkeep').map((l) => l.loopDay))];
  const nsUpkeepTallies = emptyTallies();
  const nsUpkeepHits = [];
  let nsUpkeepWindows = 0;
  for (const ld of upkeepLoopDays) {
    if (strandedSet.has(ld - 1)) continue;
    nsUpkeepWindows++;
    const upLines = lines.filter((l) => l.phase === 'upkeep' && l.loopDay === ld);
    const w = eb.classifyEnddayWindow(upLines, markers);
    addWindow(nsUpkeepTallies, w);
    for (const h of w.hits) nsUpkeepHits.push({ loopDay: ld, ...h });
    for (const h of w.gossipHits) nsUpkeepHits.push({ loopDay: ld, ...h, family: 'burst' });
  }

  // Every family/control/burst line anywhere in the run (phase
  // distribution + the sense-test pool), with fire-time position.
  // Tale lines outside sleep windows matter: a tale said while the
  // scholar is away in the daily phase would prove the relay
  // bypassed; a tale said at Haven before an evening stranding is
  // the coherent case.
  const allFamily = [];
  for (const l of lines) {
    const kind = eb.kindOf(l.text);
    if (!kind) continue;
    allFamily.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase, part: l.part,
      kind, text: l.text, position: gc.positionAt(markers, l.idx) });
  }
  const allBursts = [];
  for (const l of lines) {
    const kind = gc.kindOf(l.text);
    if (kind !== 'word' && kind !== 'debate') continue;
    allBursts.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase, part: l.part,
      kind, text: l.text, position: gc.positionAt(markers, l.idx) });
  }
  const allSettles = [];
  for (const l of lines) {
    if (gc.kindOf(l.text) !== 'settle') continue;
    allSettles.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase, part: l.part,
      text: l.text, position: gc.positionAt(markers, l.idx) });
  }

  const sSleep = stranded.filter((s) => s.sleepWindow);
  const sSleepTallies = emptyTallies();
  for (const s of sSleep) addWindow(sSleepTallies, s.sleepWindow);
  const sUpTallies = emptyTallies();
  for (const m of mornings) addWindow(sUpTallies, m.upkeepWindow);
  return { stranded, mornings,
    strandedSleepWindows: sSleep.length, strandedSleepTallies: sSleepTallies,
    strandedUpkeepWindows: mornings.length, strandedUpkeepTallies: sUpTallies,
    strandedWindows: sSleep.length + mornings.length,
    nonStranded: { sleepWindows: nsSleepWindows, sleepTallies: nsSleepTallies,
      sleepHits: nsSleepHits, upkeepWindows: nsUpkeepWindows, upkeepTallies: nsUpkeepTallies,
      upkeepHits: nsUpkeepHits },
    allFamily, allBursts, allSettles };
}

// Trim a full transcript for the corpus file: keep stranded sleep
// windows + stranded-morning upkeep lines in FULL (the sense-test
// pool AND the "other"-beat enumeration pool), every classified
// family/control/burst/settle line anywhere with its position,
// every pattern line, per-loop-day counts, and the discard count.
// The analysis above already ran on the full text.
function trimTranscript(inst, analysis) {
  const { lines } = inst.transcript;
  const keepIdx = new Set();
  for (const s of analysis.stranded) {
    const pair = sleepPair(inst.transcript.markers, s.loopDay);
    if (pair) for (let i = pair.start.idx; i < pair.end.idx; i++) keepIdx.add(i);
  }
  for (const m of analysis.mornings) {
    for (const l of lines) if (l.phase === 'upkeep' && l.loopDay === m.loopDay) keepIdx.add(l.idx);
  }
  for (const l of lines) {
    if (eb.kindOf(l.text) || gc.kindOf(l.text) || sn.mealBeat(l.text) || sn.isBeddingLine(l.text) || sn.isNightOutLine(l.text)
      || sn.isSleepRefusedLine(l.text) || sn.isWokeStartLine(l.text)
      || sn.isPantryHallLine(l.text)) keepIdx.add(l.idx);
  }
  const kept = lines.filter((l) => keepIdx.has(l.idx));
  const counts = {};
  for (const l of lines) { const k = l.loopDay + ':' + l.phase; counts[k] = (counts[k] || 0) + 1; }
  return { kept: 'stranded-windows+family-lines', lines: kept,
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
  const SEEDS = (process.env.SEEDS || '46001,46002,46003,46004,46005,46006,46007,46008')
    .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-05', 'sim-enddaybeats-fix-a-corpus', 'before');
  const STAGING_DIR = path.join(__dirname, '..', '.enddaybeats-fix-staging');
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
    const name = 'enddaybeats-fix-s' + seed + '.json';
    const data = JSON.stringify(corpus);
    const ok = tryWrite(path.join(OUTDIR, name), data, 6);
    if (ok) console.log('enddaybeats-fix woodwarm=' + process.env.WOODWARM + ' seed=' + seed + ' end=' + inst.endReason + ' days=' + inst.daysAlive + ' stranded=' + analysis.stranded.length + ' strandedSleepWindows=' + analysis.strandedSleepWindows + ' sSleepRaid=' + analysis.strandedSleepTallies['raid-event'].windows + ' sSleepPantry=' + (analysis.strandedSleepTallies['pantry-deposit'].windows + analysis.strandedSleepTallies['pantry-plenty'].windows) + ' sSleepTale=' + analysis.strandedSleepTallies['tale'].windows + ' sSleepBurst=' + analysis.strandedSleepTallies['burst-event'].windows + ' nsSleep=' + analysis.nonStranded.sleepWindows + ' written');
    else { pending.push({ name, data }); console.error('enddaybeats-fix seed=' + seed + ' WRITE PENDING (EPERM flap) — kept in memory'); }
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
  console.log('wrote ' + done + ' enddaybeats-fix files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('ENDDAYBEATS-FIX CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance, analyzeInstance, trimTranscript, sleepPair };
