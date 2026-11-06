#!/usr/bin/env node
// gossipcensus-trace-a.js — haven-gossip census on stranded scholars
// (sim-gossipcensus-a; prereg:
// evidence/2026-11-05/sim-gossipcensus-a-prereg.md, committed BEFORE
// any judged leg).
//
// Adapted from scripts/strandnarr-trace-b.js with ONLY the disclosed
// changes: the policy stack is IDENTICAL (bankfood(warmed(woodcarry(
// nighttravel))) over competent, same env gates, WOODWARM=0), the
// transcript recorder is the SAME judged instrument
// (scripts/policies/strandnarr-diag.js, STRANDNARR=1 arms it), and
// the ONLY additions are observational: (a) each phase marker is
// augmented with the scholar's map coordinates (mx/my — a read, no
// state edit, no RNG), so every gossip line resolves to a fire-time
// position; (b) the analysis classifies haven-gossip burst lines by
// window (stranded sleep / stranded upkeep / non-stranded sleep /
// non-stranded upkeep) instead of bedding-down/meal beats.
// The recorder draws no RNG and edits no state; STRANDNARR=0 runs the
// stack untouched (the det-gate leg).
//
// Env (same substrate gates as strandnarr-trace-b, all FATAL in main):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0" BANKFOOD="1"
//   STRANDNARR="0"|"1" (1 = recorder armed)
//   SEEDS (default: the 8 pilot seeds from the prereg)
//   DAYS (default 60) OUTDIR (default
//   evidence/2026-11-05/sim-gossipcensus-a-corpus)
// Write transport mirrors the strandnarr driver: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.gossipcensus-staging, never /tmp) and exits loudly.
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

// queueLens (sim-awaynaming-cap-a 2026-11-05): observational snapshot
// of the two haven-news queues — reads only, no RNG, no state edits.
// awayNamingLen is 0 on pre-fix code (the field does not exist yet);
// pendingHavenNewsLen is the r141 relay queue (cap 20, flush filters).
function queueLens(Game2) {
  let awayNamingLen = null, pendingHavenNewsLen = null;
  try { const q = (Game2.state.scholar || {}).awayNaming; awayNamingLen = Array.isArray(q) ? q.length : 0; } catch (e) {}
  try { const q = (Game2.state || {}).pendingHavenNews; pendingHavenNewsLen = Array.isArray(q) ? q.length : 0; } catch (e) {}
  return { awayNamingLen, pendingHavenNewsLen };
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
        mornings.push({ loopDay: callIdx, ...m, morningWood: morningWood(Game2), ...queueLens(Game2) });
      }
      const sayBefore = snStore.lines.length;
      dayPolicy.daily(Game2, ctx);
      const dayLines = snStore.lines.slice(sayBefore).map((x) => x.text);
      const dayWoodLines = dayLines.filter((l) => WOOD_LINE_RE.test(l));
      const eveningSayTail = dayLines.slice(Math.max(0, dayLines.length - 30));
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: false, ...pos, eveningSayTail, ...queueLens(Game2) };
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
      if (armed) { mark(Game2, snStore, 'daily-end'); snStore.phase = 'harness'; }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: null });
  try { uninstallTranscript(); } catch (e) {}
  try { if (typeof origSleep === 'function') Game.sleep = origSleep; } catch (e) {}
  // namingLedger (sim-awaynaming-cap-a 2026-11-05): the kick ledger for
  // ledger conservation — per monster entry, what the debate machinery
  // kicked/settled, read at end of run. Reads only; no RNG, no state
  // edits. endQueues records what is still held at run end (kinds +
  // mids only). Together with the said-line counts they close the
  // conservation identity: said + stillHeld + dropped == kicked.
  let namingLedger = [], endQueues = { awayNaming: [], pendingHavenNews: [] };
  try {
    const mons = (Game.state.codex || {}).monsters || {};
    for (const [mid, e] of Object.entries(mons)) {
      namingLedger.push({ mid, namingKicked: !!e.namingKicked,
        villageName: e.villageName || null,
        proposalCount: Object.keys(e.proposals || {}).length });
    }
  } catch (e) {}
  try {
    endQueues.awayNaming = ((Game.state.scholar || {}).awayNaming || [])
      .map((h) => ({ kind: h.kind || null, mid: h.mid || null }));
    endQueues.pendingHavenNews = ((Game.state || {}).pendingHavenNews || [])
      .map((h) => ({ kind: h.kind || null, mid: h.mid || null }));
  } catch (e) {}
  return {
    seed, policy: 'nighttravel', daysAlive: result.days, endReason: result.endReason,
    gameDays: result.gameDays, maxWaveUnlocked: result.maxWaveUnlocked,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, namingLedger, endQueues,
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
      win = gc.classifyGossipWindow(sn.windowLines(store, pair.start, pair.end), markers);
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
    const up = gc.classifyGossipWindow(upLines, markers);
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
  let nsSleepWindows = 0, nsSleepEvents = 0, nsSleepLines = 0;
  const nsSleepHits = [];
  const maxLoopDay = Math.max(0, ...inst.evenings.map((e) => e.loopDay));
  for (let ld = 1; ld <= maxLoopDay; ld++) {
    if (strandedSet.has(ld)) continue;
    const pair = sleepPair(markers, ld);
    if (!pair) continue;
    nsSleepWindows++;
    const w = gc.classifyGossipWindow(sn.windowLines(store, pair.start, pair.end), markers);
    nsSleepEvents += w.events; nsSleepLines += w.burstLines;
    for (const h of w.burstHits) nsSleepHits.push({ loopDay: ld, ...h });
  }
  const upkeepLoopDays = [...new Set(lines.filter((l) => l.phase === 'upkeep').map((l) => l.loopDay))];
  let nsUpkeepWindows = 0, nsUpkeepEvents = 0, nsUpkeepLines = 0;
  const nsUpkeepHits = [];
  for (const ld of upkeepLoopDays) {
    if (strandedSet.has(ld - 1)) continue;
    nsUpkeepWindows++;
    const upLines = lines.filter((l) => l.phase === 'upkeep' && l.loopDay === ld);
    const w = gc.classifyGossipWindow(upLines, markers);
    nsUpkeepEvents += w.events; nsUpkeepLines += w.burstLines;
    for (const h of w.burstHits) nsUpkeepHits.push({ loopDay: ld, ...h });
  }

  // Every burst line anywhere in the run (phase distribution + the
  // sense-test pool), with fire-time position.
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

  // Catch-up summaries (sim-catchup-summary-a 2026-11-06): framing +
  // burst/settle summary lines, with parsed counts (the revised
  // ledger's input). A summary line must never be SAID inside a
  // stranded window — delivery happens at the fire on return, never
  // while away — so any summary whose idx falls inside a stranded
  // sleep pair, or whose phase is upkeep on a stranded morning, is
  // recorded here for the compare to fail on. Reads only.
  const allSummaries = [];
  for (const l of lines) {
    const p = gc.parseSummaryLine(l.text);
    if (!p) continue;
    allSummaries.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase, part: l.part,
      text: l.text, parsed: p, position: gc.positionAt(markers, l.idx) });
  }
  const strandedSummaries = [];
  for (const s of stranded) {
    const pair = sleepPair(markers, s.loopDay);
    if (!pair) continue;
    for (const sm of allSummaries) {
      if (sm.idx > pair.start.idx && sm.idx < pair.end.idx) {
        strandedSummaries.push({ idx: sm.idx, loopDay: sm.loopDay, phase: sm.phase,
          text: sm.text, window: 'sleep', strandedLoopDay: s.loopDay });
      }
    }
  }
  for (const m of mornings) {
    for (const sm of allSummaries) {
      if (sm.phase === 'upkeep' && sm.loopDay === m.loopDay) {
        strandedSummaries.push({ idx: sm.idx, loopDay: sm.loopDay, phase: sm.phase,
          text: sm.text, window: 'upkeep', strandedLoopDay: m.loopDay - 1 });
      }
    }
  }

  const sSleep = stranded.filter((s) => s.sleepWindow);
  const sSleepEvents = sSleep.reduce((t, s) => t + (s.sleepWindow.events || 0), 0);
  const sSleepLines = sSleep.reduce((t, s) => t + (s.sleepWindow.burstLines || 0), 0);
  const sUpEvents = mornings.reduce((t, m) => t + (m.upkeepWindow.events || 0), 0);
  const sUpLines = mornings.reduce((t, m) => t + (m.upkeepWindow.burstLines || 0), 0);
  return { stranded, mornings,
    strandedSleepWindows: sSleep.length, strandedSleepEvents: sSleepEvents, strandedSleepLines: sSleepLines,
    strandedUpkeepWindows: mornings.length, strandedUpkeepEvents: sUpEvents, strandedUpkeepLines: sUpLines,
    strandedWindows: sSleep.length + mornings.length,
    strandedEvents: sSleepEvents + sUpEvents, strandedLines: sSleepLines + sUpLines,
    nonStranded: { sleepWindows: nsSleepWindows, sleepEvents: nsSleepEvents, sleepLines: nsSleepLines,
      sleepHits: nsSleepHits, upkeepWindows: nsUpkeepWindows, upkeepEvents: nsUpkeepEvents,
      upkeepLines: nsUpkeepLines, upkeepHits: nsUpkeepHits },
    allBursts, allSettles, allSummaries, strandedSummaries };
}

// Trim a full transcript for the corpus file: keep stranded sleep
// windows + stranded-morning upkeep lines in FULL (the sense-test
// pool), every burst/settle line anywhere with its position, every
// pattern line, per-loop-day counts, and the discard count. The
// analysis above already ran on the full text.
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
    if (gc.kindOf(l.text) || gc.parseSummaryLine(l.text) || sn.mealBeat(l.text) || sn.isBeddingLine(l.text) || sn.isNightOutLine(l.text)
      || sn.isSleepRefusedLine(l.text) || sn.isWokeStartLine(l.text)
      || sn.isPantryHallLine(l.text)) keepIdx.add(l.idx);
  }
  const kept = lines.filter((l) => keepIdx.has(l.idx));
  const counts = {};
  for (const l of lines) { const k = l.loopDay + ':' + l.phase; counts[k] = (counts[k] || 0) + 1; }
  return { kept: 'stranded-windows+burst-lines', lines: kept,
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
  const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-05', 'sim-gossipcensus-a-corpus');
  const STAGING_DIR = path.join(__dirname, '..', '.gossipcensus-staging');
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    const analysis = analyzeInstance(inst);
    const corpus = { seed, policy: inst.policy, daysAlive: inst.daysAlive,
      endReason: inst.endReason, gameDays: inst.gameDays,
      maxWaveUnlocked: inst.maxWaveUnlocked, deaths: inst.deaths,
      evenings: inst.evenings, mornings: inst.mornings,
      namingLedger: inst.namingLedger, endQueues: inst.endQueues,
      bankfoodStore: inst.bankfoodStore, woodcarryStore: inst.woodcarryStore,
      warmthStore: inst.warmthStore,
      transcriptErrs: inst.transcript.errs, transcriptErrors: inst.transcript.errors,
      transcript: trimTranscript(inst, analysis), analysis };
    const name = 'gossipcensus-s' + seed + '.json';
    const data = JSON.stringify(corpus);
    const ok = tryWrite(path.join(OUTDIR, name), data, 6);
    if (ok) console.log('gossipcensus woodwarm=' + process.env.WOODWARM + ' seed=' + seed + ' end=' + inst.endReason + ' days=' + inst.daysAlive + ' stranded=' + analysis.stranded.length + ' strandedWindows=' + analysis.strandedWindows + ' strandedEvents=' + analysis.strandedEvents + ' nsSleep=' + analysis.nonStranded.sleepWindows + '/' + analysis.nonStranded.sleepEvents + ' nsUpkeep=' + analysis.nonStranded.upkeepWindows + '/' + analysis.nonStranded.upkeepEvents + ' written');
    else { pending.push({ name, data }); console.error('gossipcensus seed=' + seed + ' WRITE PENDING (EPERM flap) — kept in memory'); }
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
  console.log('wrote ' + done + ' gossipcensus files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('GOSSIPCENSUS CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance, analyzeInstance, trimTranscript, sleepPair };
