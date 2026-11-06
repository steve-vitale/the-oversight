#!/usr/bin/env node
// mootgate-trace-a.js — before/after driver for the moot-convening
// gate (sim-mootgate-a; prereg:
// evidence/2026-11-06/sim-mootgate-a-prereg.md, committed BEFORE
// any judged leg).
//
// Adapted from scripts/mootsummon-trace-a.js with ONLY the disclosed
// changes: the policy stack is IDENTICAL (bankfood(warmed(woodcarry(
// nighttravel))) over competent, same env gates, WOODWARM=0), the
// transcript recorder is the SAME judged instrument
// (scripts/policies/strandnarr-diag.js, STRANDNARR=1 arms it), and
// the additions are observational:
//   (1) follow-up window 3 -> 5 loop-days, with case identity (the
//       accused set parsed from the summons window's LIVE line) and
//       an overlap flag when two summonses with different accused
//       sets share a window (mootsummon metric-review item 2);
//   (2) the dead-case line classifier (mootsummon metric-review
//       item 3): a dead-case line naming one of the accused within
//       the window classifies the case as closed-by-accused-death;
//       a summons with no resolution of any kind by run end is
//       flagged still-open;
//   (3) the LOOP-DAY primary rate (mootsummon metric-review
//       item 1): summons on stranded loop-days / stranded
//       loop-days, any phase, with the sleep-window rate alongside;
//   (4) per-evening betrayal-case snapshots (read-only state reads,
//       armed only when STRANDNARR=1 so the det-gate OFF leg runs
//       the stack untouched) for the held-open case duration
//       (stall measure): days from convene-eligibility
//       (c.day + mootIn, default 2 for player-accused cases via
//       playerCaseTick, 3 otherwise via npcMootTick) to the first
//       evening snapshot showing a trial. A trial convened during
//       a night's sleep first appears in the NEXT evening's
//       snapshot, so held days may lag the true convening by <= 1
//       day; the > 14-day stall flag is unaffected by that lag.
// The recorder draws no RNG and edits no state; STRANDNARR=0 runs the
// stack untouched (the det-gate leg).
//
// Env (same substrate gates as mootsummon-trace-a.js, all FATAL in main):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="nighttravel" WOODCARRY="1" WOODWARM="0" BANKFOOD="1"
//   STRANDNARR="0"|"1" (1 = recorder armed)
//   SEEDS (default: the 8 pilot seeds from the prereg)
//   DAYS (default 60) OUTDIR (default
//   evidence/2026-11-06/sim-mootgate-a-corpus-before)
// Write transport mirrors the mootsummon driver: failed writes are
// kept in memory and flushed at the end (EPERM flap waited out,
// never forced); deadline exhaustion stages inside this worktree
// (.mootgate-staging, never /tmp) and exits loudly.
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
const mm = require('./policies/mootsummon-diag');

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

// snapCases(Game): read-only snapshot of the open betrayal cases at
// this evening, for the held-open (stall) measure. Pure state reads
// — no RNG, no edits — so it cannot move the trajectory; it runs
// only when the recorder is armed (STRANDNARR=1), so the det-gate
// OFF leg runs the stack untouched.
function snapCases(Game) {
  try {
    const bs = (typeof Game.betrayalState === 'function') ? Game.betrayalState() : null;
    if (!bs || !Array.isArray(bs.cases)) return [];
    return bs.cases.map((c) => ({
      id: c.id || null, status: c.status || null, day: (c.day === undefined ? null : c.day),
      mootIn: (c.mootIn === undefined ? null : c.mootIn),
      accused: Array.isArray(c.accused) ? c.accused.slice() : [],
      target: c.target || null, playerRole: c.playerRole || null,
      trial: !!c.trial, trialDay: (c.trial && c.trial.day !== undefined ? c.trial.day : null),
      awaitingPlayerVote: (c.trial ? !!c.trial.awaitingPlayerVote : null),
      resolution: c.resolution || null,
    }));
  } catch (e) { return null; }
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
      row.warmth = ctx._wwLast || null;
      row.bankfoodMorning = (pbStore.mornings || []).find((a) => a.loopDay === callIdx) || null;
      row.bankfoodEvening = (pbStore.evenings || []).find((a) => a.loopDay === callIdx) || null;
      try { row.postDailyPack = packSnap(Game2); } catch (e) { row.postDailyPack = null; }
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningWood = mRow ? mRow.morningWood : null;
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      row.cases = armed ? snapCases(Game2) : null;
      evenings.push(row);
      if (armed) { mark(Game2, snStore, 'daily-end'); snStore.phase = 'harness'; }
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
  // Per-kind window tallies: { kind: { windows, lines } } where
  // windows counts windows holding >= 1 line of that kind (the
  // primary metric). summonsWindows counts windows holding >= 1
  // summons line; summonsAtFiring counts windows holding >= 1
  // summons line that is NOT post-return (the firing-time rule).
  function emptyTallies() {
    const t = {};
    for (const k of mm.BEAT_KINDS) t[k] = { windows: 0, lines: 0 };
    t['summonsWindows'] = { windows: 0, lines: 0 };
    t['summonsAtFiring'] = { windows: 0, lines: 0 };
    return t;
  }
  function addWindow(tallies, w) {
    for (const k of Object.keys(w.perKind)) {
      tallies[k].windows += w.perKind[k].windows;
      tallies[k].lines += w.perKind[k].lines;
    }
    tallies['summonsWindows'].windows += w.summonsWindows ? 1 : 0;
    tallies['summonsWindows'].lines += w.summonsHits.length;
    tallies['summonsAtFiring'].windows += w.summonsAtFiring ? 1 : 0;
    tallies['summonsAtFiring'].lines += w.summonsHits.filter((s) => !s.postReturn).length;
  }
  const stranded = [];
  for (const row of inst.evenings) {
    if (!(row.eveningOutcome === 'travel-refused' || row.eveningOutcome === 'out-of-reach')) continue;
    if (row.inside === true) continue;
    const pair = sleepPair(markers, row.loopDay);
    let win = null, sleptThrough = null;
    if (pair) {
      win = mm.classifyMootWindow(sn.windowLines(store, pair.start, pair.end), markers);
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
    const up = mm.classifyMootWindow(upLines, markers);
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
    const w = mm.classifyMootWindow(sn.windowLines(store, pair.start, pair.end), markers);
    addWindow(nsSleepTallies, w);
    for (const h of w.hits) nsSleepHits.push({ loopDay: ld, ...h });
  }
  const upkeepLoopDays = [...new Set(lines.filter((l) => l.phase === 'upkeep').map((l) => l.loopDay))];
  const nsUpkeepTallies = emptyTallies();
  const nsUpkeepHits = [];
  let nsUpkeepWindows = 0;
  for (const ld of upkeepLoopDays) {
    if (strandedSet.has(ld - 1)) continue;
    nsUpkeepWindows++;
    const upLines = lines.filter((l) => l.phase === 'upkeep' && l.loopDay === ld);
    const w = mm.classifyMootWindow(upLines, markers);
    addWindow(nsUpkeepTallies, w);
    for (const h of w.hits) nsUpkeepHits.push({ loopDay: ld, ...h });
  }

  // Every moot line anywhere in the run (phase distribution + the
  // sense-test pool), with fire-time position. A summons said while
  // the scholar is away in the daily phase would be a second
  // delivery channel; a summons said at Haven before an evening
  // stranding is the coherent case.
  const allMoot = [];
  for (const l of lines) {
    const kind = mm.kindOf(l.text);
    if (!kind) continue;
    allMoot.push({ idx: l.idx, loopDay: l.loopDay, phase: l.phase, part: l.part,
      kind, text: l.text, position: gc.positionAt(markers, l.idx) });
  }

  const sSleep = stranded.filter((s) => s.sleepWindow);
  const sSleepTallies = emptyTallies();
  for (const s of sSleep) addWindow(sSleepTallies, s.sleepWindow);
  const sUpTallies = emptyTallies();
  for (const m of mornings) addWindow(sUpTallies, m.upkeepWindow);

  // ---- per-summons follow-up (question (c)): for EVERY summons in
  // the run (stranded and non-stranded alike), what happens to the
  // moot in the following 5 loop-days? First backstop / exiled /
  // verdict-count / verdict / vote-cast / vote-lands line at or
  // after the summons idx, PLUS the dead-case line naming one of
  // the accused (case-identity match: the accused set is parsed
  // from the summons window's LIVE line). Attribution is by
  // recency; when two summonses with DIFFERENT accused sets are
  // in session inside the same window, the overlap flag marks the
  // attribution ambiguous instead of silently crossing it
  // (mootsummon metric-review item 2 — 48020 ld13/ld17 shared
  // one ld19 backstop). A summons with no resolution of any kind
  // by run end is flagged stillOpen (mootsummon metric-review
  // item 3 — 48006 ld19, 48039 ld13 never resolved on the record).
  const eveningsByDay = {};
  for (const e of inst.evenings) eveningsByDay[e.loopDay] = e;
  const summonsEvents = [];
  for (const l of lines) {
    if (mm.kindOf(l.text) !== 'summons') continue;
    const loopDay = l.loopDay;
    const strandedAtSummon = strandedSet.has(loopDay);
    const res = { backstop: null, exiled: null, verdictCount: null,
      verdict: null, voteCast: null, voteLands: null, deadCase: null };
    // Case identity: the accused set from the LIVE line on the same
    // loop-day before the summons (null when the System has not
    // arrived, so no broadcast was said — identity unknown, not
    // guessed).
    let accusedSet = null, liveLine = null;
    for (const l0 of lines) {
      if (l0.loopDay !== loopDay || l0.idx >= l.idx) continue;
      const parsed = mm.accusedSetFromLive(l0.text);
      if (parsed) { accusedSet = parsed; liveLine = l0.text; }
    }
    for (const l2 of lines) {
      if (l2.idx <= l.idx) continue;
      if (l2.loopDay > loopDay + 5) break;
      const k2 = mm.kindOf(l2.text);
      if (!k2) continue;
      if (k2 === 'backstop' && !res.backstop) res.backstop = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'exiled' && !res.exiled) res.exiled = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'verdict-count' && !res.verdictCount) res.verdictCount = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'verdict' && !res.verdict) res.verdict = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'vote-cast' && !res.voteCast) res.voteCast = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'vote-lands' && !res.voteLands) res.voteLands = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text };
      else if (k2 === 'dead-case' && !res.deadCase) {
        const nm = mm.deadCaseName(l2.text);
        const matchesAccused = !!(accusedSet && nm && accusedSet.some((a) => a.toUpperCase() === nm.toUpperCase()));
        res.deadCase = { idx: l2.idx, loopDay: l2.loopDay, phase: l2.phase, text: l2.text,
          name: nm, matchesAccused };
      }
    }
    // Kind by context: the moot-call / LIVE lines precede the summons
    // in the same window; scan the same loop-day's lines before it.
    const dayLines = lines.filter((x) => x.loopDay === loopDay && x.idx < l.idx);
    const mootKind = mm.summonsKind(dayLines.concat([{ idx: l.idx, text: l.text }]), l.idx);
    const eveningsAfter = [];
    for (let d = loopDay + 1; d <= loopDay + 5; d++) {
      const e = eveningsByDay[d];
      eveningsAfter.push(e ? { loopDay: d, inside: e.inside, tile: e.tile, outcome: e.eveningOutcome } : { loopDay: d, inside: null, tile: null, outcome: null });
    }
    const returnedWithin2 = eveningsAfter.slice(0, 2).some((e) => e.inside === true);
    const resolved = !!(res.backstop || res.exiled || res.verdictCount || res.verdict
      || res.voteCast || res.voteLands || (res.deadCase && res.deadCase.matchesAccused));
    summonsEvents.push({ idx: l.idx, loopDay, phase: l.phase,
      stranded: strandedAtSummon, mootKind, text: l.text,
      position: gc.positionAt(markers, l.idx),
      accusedSet, liveLine,
      resolution: res, eveningsAfter, returnedWithin2,
      resolved, stillOpen: !resolved, overlap: false });
  }
  // Overlap flag: another summons with a DIFFERENT accused set
  // (or an unknown one) inside the same 5-day window — the
  // recency attribution may cross between them.
  for (const ev of summonsEvents) {
    for (const other of summonsEvents) {
      if (other === ev) continue;
      if (Math.abs(other.loopDay - ev.loopDay) > 5) continue;
      const sig = (s) => (s ? s.slice().sort().join('+') : '?');
      if (sig(other.accusedSet) !== sig(ev.accusedSet)) { ev.overlap = true; break; }
    }
  }

  // ---- loop-day primary rate (mootsummon metric-review item 1):
  // summons on stranded loop-days / stranded loop-days, ANY phase
  // (sleep + harness + daily). The sleep-window rate is kept
  // alongside for comparability with the mootsummon census.
  const allLoopDays = inst.evenings.map((e) => e.loopDay);
  const strandedLoopDaySet = new Set(stranded.map((s) => s.loopDay));
  const summonsLoopDaysStranded = new Set(summonsEvents.filter((ev) => ev.stranded).map((ev) => ev.loopDay));
  const summonsLoopDaysNonStranded = new Set(summonsEvents.filter((ev) => !ev.stranded).map((ev) => ev.loopDay));
  const loopDayRates = {
    strandedLoopDays: strandedLoopDaySet.size,
    strandedLoopDaysWithSummons: summonsLoopDaysStranded.size,
    nonStrandedLoopDays: allLoopDays.filter((ld) => !strandedLoopDaySet.has(ld)).length,
    nonStrandedLoopDaysWithSummons: summonsLoopDaysNonStranded.size,
  };

  // ---- stall measure: held-open case duration from the
  // per-evening case snapshots. For each case id: eligibility =
  // c.day + mootIn (default 2 for player-accused cases, which the
  // playerCaseTick convenes, 3 otherwise via npcMootTick);
  // convening = the first evening snapshot showing a trial
  // (a trial convened during a night's sleep first appears in the
  // NEXT evening's snapshot — held days may lag by <= 1 day).
  // heldDays = conveneScholarDay - eligibleScholarDay. Cases that
  // resolve without a trial (e.g. accused_died) are listed
  // separately, not counted as held. Cases still open at run end
  // are listed with held days to the last evening.
  const stall = { cases: [], heldWhileAway: [], maxHeldWhileAway: null,
    medianHeldWhileAway: null, openAtEnd: [], resolvedWithoutTrial: [] };
  {
    const byId = {};
    for (const e of inst.evenings) {
      if (!Array.isArray(e.cases)) continue;
      for (const c of e.cases) {
        if (!c || c.id === null || c.id === undefined) continue;
        const rec = byId[c.id] || (byId[c.id] = { id: c.id, firstSeenLoopDay: e.loopDay,
          firstSeenScholarDay: (e.gameDay === undefined ? null : e.gameDay),
          day: c.day, mootIn: c.mootIn, playerRole: c.playerRole,
          accused: c.accused, target: c.target,
          conveneLoopDay: null, conveneScholarDay: null,
          firstTerminalScholarDay: null,
          lastStatus: c.status, lastResolution: c.resolution,
          lastScholarDay: (e.gameDay === undefined ? null : e.gameDay) });
        if (c.trial && rec.conveneLoopDay === null) {
          rec.conveneLoopDay = e.loopDay;
          rec.conveneScholarDay = (e.gameDay === undefined ? null : e.gameDay);
        }
        // A case that resolves WITHOUT a trial (e.g. accused_died)
        // stops being held on the day its status leaves
        // open/dormant/advisory — not at run end. (Stall-fix
        // 2026-11-06: the first version used the last evening for
        // every never-convened case and overstated a 2-day hold as
        // 49 days on 48040 case_2.)
        if (rec.firstTerminalScholarDay === null && c.status !== 'open'
          && c.status !== 'dormant' && c.status !== 'advisory') {
          rec.firstTerminalScholarDay = (e.gameDay === undefined ? null : e.gameDay);
        }
        rec.lastStatus = c.status; rec.lastResolution = c.resolution;
        rec.lastScholarDay = (e.gameDay === undefined ? null : e.gameDay);
      }
    }
    const strandedScholarDays = new Set();
    for (const e of inst.evenings) {
      if (e.eveningOutcome === 'travel-refused' || e.eveningOutcome === 'out-of-reach') {
        if (e.gameDay !== undefined && e.gameDay !== null) strandedScholarDays.add(e.gameDay);
      }
    }
    const heldRows = [];
    for (const id of Object.keys(byId)) {
      const r = byId[id];
      const defMootIn = r.playerRole === 'accused' ? 2 : 3;
      const mootIn = (r.mootIn === null || r.mootIn === undefined) ? defMootIn : r.mootIn;
      const eligible = (r.day === null || r.day === undefined) ? null : r.day + mootIn;
      const row = { id: r.id, day: r.day, mootIn, playerRole: r.playerRole,
        accused: r.accused, target: r.target,
        eligibleScholarDay: eligible,
        conveneLoopDay: r.conveneLoopDay, conveneScholarDay: r.conveneScholarDay,
        lastStatus: r.lastStatus, lastResolution: r.lastResolution,
        heldDays: null, strandedDaysDuringHold: 0, openAtEnd: false };
      if (eligible !== null) {
        const endDay = r.conveneScholarDay !== null ? r.conveneScholarDay
          : (r.firstTerminalScholarDay !== null ? r.firstTerminalScholarDay : r.lastScholarDay);
        if (endDay !== null && endDay !== undefined) {
          row.heldDays = endDay - eligible;
          let n = 0;
          for (let d = eligible; d <= endDay; d++) if (strandedScholarDays.has(d)) n++;
          row.strandedDaysDuringHold = n;
        }
        if (r.conveneLoopDay === null && (r.lastStatus === 'open' || r.lastStatus === 'dormant' || r.lastStatus === 'advisory')) {
          row.openAtEnd = true;
          stall.openAtEnd.push(row);
        } else if (r.conveneLoopDay === null && r.lastStatus === 'resolved') {
          stall.resolvedWithoutTrial.push(row);
        }
      }
      stall.cases.push(row);
      if (row.heldDays !== null && row.strandedDaysDuringHold > 0) heldRows.push(row);
    }
    if (heldRows.length) {
      const sorted = heldRows.map((x) => x.heldDays).sort((a, b) => a - b);
      stall.heldWhileAway = heldRows;
      stall.maxHeldWhileAway = sorted[sorted.length - 1];
      stall.medianHeldWhileAway = sorted[Math.floor(sorted.length / 2)];
    }
  }

  return { stranded, mornings,
    strandedSleepWindows: sSleep.length, strandedSleepTallies: sSleepTallies,
    strandedUpkeepWindows: mornings.length, strandedUpkeepTallies: sUpTallies,
    strandedWindows: sSleep.length + mornings.length,
    nonStranded: { sleepWindows: nsSleepWindows, sleepTallies: nsSleepTallies,
      sleepHits: nsSleepHits, upkeepWindows: nsUpkeepWindows, upkeepTallies: nsUpkeepTallies,
      upkeepHits: nsUpkeepHits },
    allMoot, summonsEvents, loopDayRates, stall };
}

// Trim a full transcript for the corpus file: keep stranded sleep
// windows + stranded-morning upkeep lines in FULL (the sense-test
// pool), every classified moot line anywhere with its position, the
// per-summons follow-up lines (backstop / verdict / vote), every
// pattern line, per-loop-day counts, and the discard count.
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
    if (mm.kindOf(l.text) || sn.mealBeat(l.text) || sn.isBeddingLine(l.text) || sn.isNightOutLine(l.text)
      || sn.isSleepRefusedLine(l.text) || sn.isWokeStartLine(l.text)
      || sn.isPantryHallLine(l.text)) keepIdx.add(l.idx);
  }
  const kept = lines.filter((l) => keepIdx.has(l.idx));
  const counts = {};
  for (const l of lines) { const k = l.loopDay + ':' + l.phase; counts[k] = (counts[k] || 0) + 1; }
  return { kept: 'stranded-windows+moot-lines', lines: kept,
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
  const SEEDS = (process.env.SEEDS || '48001,48002,48003,48004,48005,48006,48007,48008')
    .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-11-06', 'sim-mootgate-a-corpus-before');
  const STAGING_DIR = path.join(__dirname, '..', '.mootgate-staging');
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
    const name = 'mootgate-s' + seed + '.json';
    const data = JSON.stringify(corpus);
    const ok = tryWrite(path.join(OUTDIR, name), data, 6);
    if (ok) console.log('mootgate woodwarm=' + process.env.WOODWARM + ' seed=' + seed + ' end=' + inst.endReason + ' days=' + inst.daysAlive + ' stranded=' + analysis.stranded.length + ' strandedLoopDays=' + analysis.loopDayRates.strandedLoopDays + ' sLoopSummons=' + analysis.loopDayRates.strandedLoopDaysWithSummons + ' nsLoopSummons=' + analysis.loopDayRates.nonStrandedLoopDaysWithSummons + ' sSleepSummons=' + analysis.strandedSleepTallies['summonsWindows'].windows + ' nsSleepSummons=' + analysis.nonStranded.sleepTallies['summonsWindows'].windows + ' summonsEvents=' + analysis.summonsEvents.length + ' stillOpen=' + analysis.summonsEvents.filter((e) => e.stillOpen).length + ' maxHeldWhileAway=' + analysis.stall.maxHeldWhileAway + ' written');
    else { pending.push({ name, data }); console.error('mootgate seed=' + seed + ' WRITE PENDING (EPERM flap) — kept in memory'); }
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
  console.log('wrote ' + done + ' mootgate files to ' + OUTDIR);
}

if (require.main === module) {
  main().catch((e) => { console.error('MOOTGATE CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance, analyzeInstance, trimTranscript, sleepPair };
