#!/usr/bin/env node
// scripts/sim-tabletalk-sit-a-sweep.js — sim-tabletalk-sit-a pick-time
// situation snapshot sweep (scale-onramp axis, table-talk situation
// availability measurement, run fleshout-20261026T~1418Z).
// MEASUREMENT ONLY — zero src/js changes, zero dialogue-string changes,
// zero picker-behavior changes. It WRAPS Game.tableWaitTalk in the
// harness (a read-only instrument wrapper, never game code) to record,
// at each actual tableWaitTalk FIRE, the situation snapshot that was
// readable at pick time. It does not change what fires, what line is
// picked, or any game state (see neutrality check: band + fireside /
// table-talk counts must match the sim-tableline-a corpus exactly;
// any divergence is reported, not hidden).
//
// Substrate (identical to the 1715Z / 1816Z band): tableseat-nowait
// policy (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only),
// 180d DEATH-AWARE horizon, seeds 73671-73678. Corpus under
// evidence/2026-10-26/perseed-sim-tabletalk-sit-a/ — NEVER overwriting
// perseed-sim-tableline-a/, perseed-sim-tablenat-a/, or any other run.
//
// What is recorded per FIRE (not per invocation, not per day):
//   - The pick-time snapshot: day, scholar id, seat kind (tableSeat()
//     live recompute), stage, rank, arc, pantry kcal (+source), pantry
//     class, pellet state (fusionReactorOnline, holder, in-pack),
//     nation-prod state (state.scaleDiscover.nation day/via),
//     overtime state (tier, active, days, started, losses, standing
//     penalty), pg flags (waiting/announced/done), pop, waiting
//     duration (wrapper-tracked first-waiting day — see note below),
//     days since announce, days since pellet, days since prod,
//     lastTableTalkDay BEFORE the call, and the pg-field presence
//     check for any stored waiting-since field.
//   - WAIT-DURATION READABILITY NOTE (read this before judging):
//     no pg/state field stores the first waiting day. The wrapper
//     derives it by observing the first dawn on which pg.tableWaiting
//     is true (cross-checked against the policy-daily firstWaitingDay
//     and the tableline corpus). The duration IS therefore readable
//     at pick time to any observer standing at pick time with run
//     history, and recordable by a future picker that stores its own
//     first-seen day — but it is NOT picker-native today: the current
//     tableWaitTalk code reads only pg.tableWaiting/pg.tableDone,
//     scholar day, hg.lastTableTalkDay, roster, and villagerId. The
//     analyzer reports picker-native vs observer-derived explicitly
//     for every fact, so the gap table never pretends the picker
//     already reads a fact it does not.
//   - Speaker / listener / template (same exact-case keys as the
//     tableline analyzer) and the verbatim line.
// Band fields per seed (re-baseline vs the 806ef430e/1816Z table):
//   days, endReason, won, maxRank, finalRank, table (everWaiting),
//   entered (everDone), waveReach (runDays maxWaveUnlocked),
//   deathTotal (runDays live-death capture), starvation deaths,
//   firstWaitingDay, waitingDays, markers (announce/pellet/prod/arcIV
//   from the say capture, as in tableline).
//
// Modes:
//   --one <seed> : run one seed, write its row.
//   --summary   : build summary.json from rows on disk, print the
//                 band table + comparison vs the 1816Z wave5gate
//                 rebaseline band + the tableline corpus. Exit 1 only
//                 if the corpus is incomplete or any row errored;
//                 band drift is REPORTED, never a gate here (the proof
//                 script judges it).
// Exit 1 in --one mode if the run throws.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const OUTDIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tabletalk-sit-a');
const TABLELINE_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-tableline-a');
const REBASELINE_DIR = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-wave5gate-a-rebaseline');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const FIRE_RX = /^🗣️ (.+?) to (.+?), by the fire: (.*)$/s;
const TABLE_RX = /table|pale light/i;
const TEMPLATES = [
  { id: 'T0', key: 'ring of pale light' },
  { id: 'T1', key: "Nobody's sleeping" },
  { id: 'T2', key: 'Too many angles' },
  { id: 'T3', key: 'check the snares' },
  { id: 'T4', key: 'Herald feeds' },
  { id: 'T5', key: 'Why them?' },
];
function classify(text) {
  for (const t of TEMPLATES) if (text.indexOf(t.key) >= 0) return t.id;
  return 'OTHER';
}
function waitDurClass(firstWaitingDay, day) {
  if (!firstWaitingDay || day < firstWaitingDay) return 'n/a';
  const d = day - firstWaitingDay;
  if (d <= 14) return 'early';
  if (d <= 60) return 'mid';
  return 'late';
}
function pantryClass(p) {
  if (p === null || p === undefined) return 'unknown';
  if (p === 0) return 'empty';
  if (p < 1000) return 'low';
  return 'ok';
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function tried(fn) {
  try { const v = fn(); return { ok: true, value: (v === undefined ? null : v) }; }
  catch (e) { return { ok: false, value: null, error: String((e && e.message) || e).slice(0, 120) }; }
}
function pantryOf(Game) {
  try {
    if (typeof Game.pantryKcalLive === 'function' && Game.state && Game.state.village) {
      const v = Game.pantryKcalLive(Game.state.village);
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcalLive' };
    }
  } catch (e) {}
  try {
    if (typeof Game.pantryKcal === 'function') {
      const v = Game.pantryKcal();
      if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'pantryKcal' };
    }
  } catch (e) {}
  try {
    const v = Game.state && Game.state.village && Game.state.village.pantryKcal;
    if (typeof v === 'number' && Number.isFinite(v)) return { kcal: v, src: 'state.village.pantryKcal' };
  } catch (e) {}
  return { kcal: null, src: 'none' };
}

async function runOne(seed) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'tabletalk-sit-a', fullTelemetry: false });
  await setupGame(Game);
  const capture = [];
  const gdayOf = () => { try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; } };
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { try { capture.push({ day: gdayOf(), line: String(a[0]) }); } catch (e) {} try { return _emit(...a); } catch (e) { return a[0]; } };
  }

  // --- pick-time instrument: wrap Game.tableWaitTalk (harness only) ---
  const fires = [];
  let tableWaitCalls = 0, tableWaitCallsWaiting = 0;
  let firstWaitingDayWrap = null, firstAnnouncedDayWrap = null;
  let firstPelletOnlineDayWrap = null, firstNationProdDayWrap = null;
  const origTableWaitTalk = (typeof Game.tableWaitTalk === 'function') ? Game.tableWaitTalk.bind(Game) : null;
  if (origTableWaitTalk) {
    Game.tableWaitTalk = function (...args) {
      tableWaitCalls++;
      const day = gdayOf();
      const pg = (() => { try { return Game.progState ? Game.progState() : {}; } catch (e) { return {}; } })();
      const waiting = !!pg.tableWaiting;
      if (waiting) {
        tableWaitCallsWaiting++;
        if (!firstWaitingDayWrap) firstWaitingDayWrap = day;
      }
      if (pg.tableAnnounced && !firstAnnouncedDayWrap) firstAnnouncedDayWrap = day;
      // Snapshot BEFORE the pick (pre-call state = pick-time state).
      // hg.lastTableTalkDay below is the PREVIOUS fire day, not today's:
      // the original assigns today's day only after picking the line.
      let snap = null;
      if (waiting) {
        const p = pantryOf(Game);
        const seat = tried(() => (typeof Game.tableSeat === 'function' ? Game.tableSeat() : null));
        const stage = tried(() => (typeof Game.integrationStage === 'function' ? Game.integrationStage() : null));
        const rank = tried(() => (typeof Game.scaleRank === 'function' ? Game.scaleRank() : null));
        const pelletOnline = tried(() => (typeof Game.fusionReactorOnline === 'function' ? !!Game.fusionReactorOnline() : null));
        if (pelletOnline.ok && pelletOnline.value && !firstPelletOnlineDayWrap) firstPelletOnlineDayWrap = day;
        const nation = (() => { try { return (Game.state && Game.state.scaleDiscover && Game.state.scaleDiscover.nation) || null; } catch (e) { return null; } })();
        if (nation && !firstNationProdDayWrap) firstNationProdDayWrap = day;
        const otTier = tried(() => (typeof Game.overtimeTier === 'function' ? Game.overtimeTier() : null));
        const otActive = tried(() => (typeof Game.overtimeActive === 'function' ? !!Game.overtimeActive() : null));
        const otStanding = tried(() => (typeof Game.overtimeStanding === 'function' ? Game.overtimeStanding() : null));
        const holder = (() => { try { return Game.state ? (Game.state.fusionReactorHolder || null) : null; } catch (e) { return null; } })();
        const inPack = tried(() => (typeof Game.hasFusionPellet === 'function' ? !!Game.hasFusionPellet() : null));
        const hg = (() => { try { return (Game.state && Game.state.village && Game.state.village.havenGrowth) || {}; } catch (e) { return {}; } })();
        const waitDurDays = firstWaitingDayWrap ? (day - firstWaitingDayWrap) : null;
        snap = {
          day, scholarId: (() => { try { return Game.villagerId || null; } catch (e) { return null; } })(),
          seatKind: (seat.ok && seat.value) ? (seat.value.seat || null) : null,
          seatOk: seat.ok, seatDetail: (seat.ok && seat.value) ? (seat.value.detail || null) : null,
          stage: stage.ok ? stage.value : null, stageOk: stage.ok,
          rank: rank.ok ? rank.value : null, rankOk: rank.ok,
          arc: pg.arc || null,
          tableWaiting: !!pg.tableWaiting, tableAnnounced: !!pg.tableAnnounced, tableDone: !!pg.tableDone,
          pantryKcal: p.kcal, pantrySrc: p.src, pantryClass: pantryClass(p.kcal),
          pelletOnline: pelletOnline.ok ? pelletOnline.value : null, pelletOnlineOk: pelletOnline.ok,
          pelletHolder: holder, pelletInPack: inPack.ok ? inPack.value : null, pelletInPackOk: inPack.ok,
          nationProd: nation, nationProdFired: !!nation,
          overtimeTier: otTier.ok ? otTier.value : null, overtimeTierOk: otTier.ok,
          overtimeActive: otActive.ok ? otActive.value : null, overtimeActiveOk: otActive.ok,
          overtimeDays: (pg.overtimeDays | 0) || 0, overtimeStarted: !!pg.overtimeStarted,
          overtimeLosses: (pg.overtimeLosses | 0) || 0,
          overtimeStanding: otStanding.ok ? otStanding.value : null, overtimeStandingOk: otStanding.ok,
          pop: (() => { try { const r = Game.state && Game.state.village && Game.state.village.roster; return Array.isArray(r) ? r.length : null; } catch (e) { return null; } })(),
          firstWaitingDayWrap, waitDurDays, waitDurClass: waitDurClass(firstWaitingDayWrap, day),
          firstAnnouncedDayWrap, daysSinceAnnounce: firstAnnouncedDayWrap ? (day - firstAnnouncedDayWrap) : null,
          firstPelletOnlineDayWrap, daysSincePellet: firstPelletOnlineDayWrap ? (day - firstPelletOnlineDayWrap) : null,
          firstNationProdDayWrap, daysSinceProd: firstNationProdDayWrap ? (day - firstNationProdDayWrap) : null,
          lastTableTalkDayBefore: (hg.lastTableTalkDay === undefined ? null : hg.lastTableTalkDay),
          // Stored-field presence check: is there ANY pg/state field that
          // already stores the first waiting day / invitation day?
          storedWaitingSinceFields: (() => {
            const out = {};
            const cands = ['tableWaitingSince', 'waitingSince', 'tableWaitStart', 'firstWaitingDay', 'waitingStarted', 'tableWaitDay', 'tableInvitationDay'];
            for (const k of cands) out[k] = (k in pg) ? pg[k] : null;
            out.pgKeys = Object.keys(pg).sort();
            return out;
          })(),
        };
      }
      // Capture say lines emitted by THIS call only.
      const perCall = [];
      const outerSay = Game.say;
      Game.say = function (...a) { try { perCall.push(String(a[0])); } catch (e) {} return outerSay(...a); };
      let ret;
      try { ret = origTableWaitTalk(...args); } finally { Game.say = outerSay; }
      if (snap) {
        for (const line of perCall) {
          const m = FIRE_RX.exec(line);
          if (!m) continue;
          const template = classify(m[3]);
          if (template === 'OTHER') continue; // a haven-need line from the same tick is not a table fire
          fires.push({
            day: snap.day, speaker: m[1], listener: m[2], template, text: m[3],
            snapshot: snap,
          });
        }
      }
      return ret;
    };
  }

  const days = [];
  let waitingSoFar = 0;
  const snapDaily = (Game_, waitingSoFar_) => {
    const out = { day: 0, rank: 'village', arc: 1, tableWaiting: false, tableDone: false, tableAnnounced: false, stage: null, pop: null, pantry: null, pantrySrc: 'none', waitingDays: waitingSoFar_ };
    try { out.day = (Game_.state && Game_.state.scholar && Game_.state.scholar.day) || 0; } catch (e) {}
    try { out.rank = (Game_.scaleRank ? Game_.scaleRank() : 'village') || 'village'; } catch (e) {}
    try {
      const pg = Game_.progState ? Game_.progState() : {};
      out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableDone = !!pg.tableDone; out.tableAnnounced = !!pg.tableAnnounced;
    } catch (e) {}
    try { out.stage = (typeof Game_.integrationStage === 'function') ? Game_.integrationStage() : null; } catch (e) {}
    try { const r = Game_.state && Game_.state.village && Game_.state.village.roster; out.pop = Array.isArray(r) ? r.length : null; } catch (e) {}
    const p = pantryOf(Game_);
    out.pantry = p.kcal; out.pantrySrc = p.src;
    return out;
  };
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      const s = snapDaily(G, waitingSoFar);
      if (s.tableWaiting) waitingSoFar++;
      s.waitingDays = waitingSoFar;
      days.push(s);
      return tableseatNowait.daily(G, ctx);
    },
  });
  const result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 10 });
  const end = snapDaily(Game, waitingSoFar);

  const fireside = [];
  const tableLines = [];
  for (const c of capture) {
    const m = FIRE_RX.exec(c.line);
    if (m) { fireside.push({ day: c.day, speaker: m[1], listener: m[2], text: m[3] }); continue; }
    if (TABLE_RX.test(c.line)) tableLines.push({ day: c.day, line: c.line.slice(0, 400) });
  }
  const firstDayWhere = (pred) => { const d = days.find(pred); return d ? d.day : null; };
  const markerDay = (rx) => { const c = capture.find(x => rx.test(x.line)); return c ? c.day : null; };
  const ranksSeen = [...new Set(days.map(d => d.rank))];
  const maxRank = days.reduce((m, d) => (RANK_ORDER[d.rank] || 0) > (RANK_ORDER[m] || 0) ? d.rank : m, 'village');
  const firstWaitingDay = firstDayWhere(d => d.tableWaiting);
  const firstEnteredDay = firstDayWhere(d => d.tableDone);
  const deathsArr = (result.samples && result.samples.deaths) || [];
  const STARV_RE = /starv|hunger|famine/i;
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won, maxRank, finalRank: end.rank, waveReach: result.maxWaveUnlocked || 1,
    deathTotal: deathsArr.length,
    starvationDeaths: deathsArr.filter(d => STARV_RE.test(String((d && d.cause) || ''))).length,
    table: days.some(d => d.tableWaiting) || end.tableWaiting,
    entered: days.some(d => d.tableDone) || end.tableDone,
    arcMax: Math.max(1, ...days.map(d => d.arc || 1)),
    ranksSeen, firstWaitingDay, firstEnteredDay,
    waitingDays: days.filter(d => d.tableWaiting).length,
    markers: {
      announceDay: markerDay(/TABLE IS SET/),
      pelletDay: markerDay(/never be hungry again/i),
      nationProdDay: markerDay(/FINALES need a NATION/i),
      arcIVDay: markerDay(/ARC IV/),
    },
    end: { rank: end.rank, pop: end.pop, pantry: end.pantry, pantrySrc: end.pantrySrc, stage: end.stage },
    pantrySrcs: [...new Set(days.map(d => d.pantrySrc))],
    snapshots: days,
    fireside, firesideCount: fireside.length,
    tableLines, tableLinesCount: tableLines.length,
    captureCount: capture.length,
    tableWaitCalls, tableWaitCallsWaiting,
    firstWaitingDayWrap, firstAnnouncedDayWrap, firstPelletOnlineDayWrap, firstNationProdDayWrap,
    wrapperIntercepted: !!origTableWaitTalk,
    fires, firesCount: fires.length,
    error: null,
  };
  writeFileRetry(path.join(OUTDIR, `s${seed}.json`), JSON.stringify(row, null, 1) + '\n');
  console.log(JSON.stringify({
    seed, days: row.days, endReason: row.endReason, won: row.won,
    maxRank, finalRank: row.finalRank, waveReach: row.waveReach, deathTotal: row.deathTotal,
    table: row.table, entered: row.entered,
    firstWaitingDay, firstWaitingDayWrap, waitingDays: row.waitingDays,
    firesideCount: row.firesideCount, firesCount: row.firesCount,
    tableWaitCalls, tableWaitCallsWaiting,
    markers: row.markers, pantrySrcs: row.pantrySrcs,
  }, null, 1));
  return row;
}

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function summary() {
  const rows = [];
  const missing = [];
  for (const seed of SEEDS) {
    const p = path.join(OUTDIR, `s${seed}.json`);
    if (!fs.existsSync(p)) { missing.push(seed); continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const fails = [];
  if (missing.length) fails.push(`missing rows: ${missing.join(',')}`);
  for (const r of rows) if (r.error) fails.push(`seed ${r.seed} errored: ${r.error}`);
  const norm = (v) => (typeof v === 'boolean' ? (v ? 1 : 0) : v);
  // Comparison vs the 1816Z wave5gate rebaseline band (the 806ef430e table).
  let rebaseBand = null;
  try {
    const sp = path.join(REBASELINE_DIR, 'summary.json');
    if (fs.existsSync(sp)) rebaseBand = JSON.parse(fs.readFileSync(sp, 'utf8')).band;
  } catch (e) {}
  // Comparison vs the tableline corpus (fireside / table-talk counts).
  const tlCmp = [];
  for (const r of rows) {
    const tp = path.join(TABLELINE_DIR, `s${r.seed}.json`);
    let t = null;
    if (fs.existsSync(tp)) { try { t = JSON.parse(fs.readFileSync(tp, 'utf8')); } catch (e) {} }
    if (!t) { tlCmp.push({ seed: r.seed, tablelineRow: false }); continue; }
    const diffs = [];
    for (const [mine, theirs] of [['days', 'days'], ['endReason', 'endReason'], ['won', 'won'], ['maxRank', 'maxRank'], ['finalRank', 'finalRank'], ['table', 'table'], ['entered', 'entered'], ['firesideCount', 'firesideCount']]) {
      if (theirs in t && norm(r[mine]) !== norm(t[theirs])) diffs.push(`${mine}: sit-a=${JSON.stringify(r[mine])} tableline=${JSON.stringify(t[theirs])}`);
    }
    // Fires must match tableline's classified table-talk lines exactly
    // (day + template + speaker), else the instrument perturbed the run.
    const tlFires = [];
    try {
      const ta = JSON.parse(fs.readFileSync(path.join(TABLELINE_DIR, 'analysis.json'), 'utf8'));
      for (const l of (ta.lines || [])) if (l.seed === r.seed && l.template !== 'OTHER') tlFires.push({ day: l.day, template: l.template, speaker: l.speaker });
    } catch (e) {}
    const myFires = (r.fires || []).map(f => ({ day: f.day, template: f.template, speaker: f.speaker }));
    const firesMatch = JSON.stringify(myFires) === JSON.stringify(tlFires);
    if (!firesMatch) diffs.push(`fires: sit-a=${JSON.stringify(myFires)} tableline=${JSON.stringify(tlFires)}`);
    tlCmp.push({ seed: r.seed, tablelineRow: true, firesMatch, diffs });
  }
  const band = rows.length ? {
    seeds: rows.length, wins: rows.filter(r => r.won).length,
    table: rows.filter(r => r.table).length, entered: rows.filter(r => r.entered).length,
    nationalEver: rows.filter(r => (RANK_ORDER[r.maxRank] || 0) >= 2).length,
    nationalFinal: rows.filter(r => (RANK_ORDER[r.finalRank] || 0) >= 2).length,
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    maxDays: Math.max(...rows.map(r => r.days)),
    deathTotal: rows.reduce((a, r) => a + (r.deathTotal || 0), 0),
    starvationTotal: rows.reduce((a, r) => a + (r.starvationDeaths || 0), 0),
    totalFireside: rows.reduce((a, r) => a + r.firesideCount, 0),
    totalFires: rows.reduce((a, r) => a + r.firesCount, 0),
    waitingSeeds: rows.filter(r => r.table).map(r => r.seed),
  } : null;
  const sum = { generated: new Date().toISOString(), seeds: SEEDS, band, rebaselineBand1816: rebaseBand,
    rows: rows.map(r => ({
      seed: r.seed, days: r.days, endReason: r.endReason, won: r.won, maxRank: r.maxRank,
      finalRank: r.finalRank, waveReach: r.waveReach, deathTotal: r.deathTotal, starvationDeaths: r.starvationDeaths,
      table: r.table, entered: r.entered, arcMax: r.arcMax,
      firstWaitingDay: r.firstWaitingDay, firstWaitingDayWrap: r.firstWaitingDayWrap, waitingDays: r.waitingDays,
      firesideCount: r.firesideCount, firesCount: r.firesCount,
      tableWaitCalls: r.tableWaitCalls, tableWaitCallsWaiting: r.tableWaitCallsWaiting,
      markers: r.markers,
    })), tablelineComparison: tlCmp };
  writeFileRetry(path.join(OUTDIR, 'summary.json'), JSON.stringify(sum, null, 1) + '\n');
  console.log(JSON.stringify(sum, null, 1));
  if (fails.length) { console.error('TABLETALK-SIT CORPUS FAILS: ' + fails.join('; ')); process.exit(1); }
  console.log(`TABLETALK-SIT CORPUS PASS: ${rows.length}/${SEEDS.length} seeds, no row errors.`);
}

async function main() {
  const mode = process.argv[2];
  if (mode === '--one') {
    const seed = parseInt(process.argv[3], 10);
    if (!Number.isFinite(seed)) { console.error('usage: --one <seed>'); process.exit(1); }
    await runOne(seed);
  } else if (mode === '--summary') {
    summary();
  } else {
    console.error('usage: sim-tabletalk-sit-a-sweep.js --one <seed> | --summary');
    process.exit(1);
  }
}
if (require.main === module) main().catch(e => { console.error('TABLETALK-SIT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { FIRE_RX, TABLE_RX, classify, TEMPLATES };
