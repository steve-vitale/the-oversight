#!/usr/bin/env node
// scripts/test-sortiedpr-a-sweep.js — sim-sortiedpr-a sortie-DPR bands.
// MEASUREMENT ONLY: base code, no game change, no policy-default change.
// Two bands on identical seeds, same VERBATIM substrate as the 2115Z
// rounds (tableseat-nowait, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d
// death-aware) + the fieldparty-form-diag recorder reused VERBATIM
// (never edited):
//   AUTO   — no sortie-answering layer: do sorties ever happen alone?
//            Opportunity counts (episodes, lingerer-days, gorge nights,
//            answerLingerer calls) are the finding if sorties are 0.
//   PLAYED — tableseat-nowait + a sortie-driver layer living ONLY in
//            this script (never a policy default): once per lingerer
//            episode, when a gorge line has been seen for it, call
//            answerLingerer('sortie'). NO HP GATE (unlike partyfinish's
//            min<=80/sum<=300 gate): this arm measures DPR against the
//            real lingerer population, healthy beasts included. The
//            engine's own gates still apply (no-fighters, rations).
// Episode tracking is the r50 journey script's object-identity method
// (lingeringRaiders() list, gorgeSeen approximation: a gorge line names
// a display name, not an entity id, so any gorge line marks all
// currently-tracked lingerers gorgeSeen — stated, as r50 stated it).
// Say/answerLingerer wraps are recorder-only: no game-state writes, no
// RNG draws, engine throws rethrown unchanged.
// Modes:
//   --one <band> <seed> : run one seed, write its row.
//   --summary <band>    : build summary.json from rows on disk.
//   (no args)           : pilot seeds, both bands, then summaries.
// Corpus: evidence/2026-10-28/perseed-sortiedpr-a/<band>/ (EVID override).
// Exit 1 in --summary mode if the corpus is incomplete or any recorder
// errored/overflowed.
// Sense capture: SORTIEDPR_SENSE=1 wraps fieldFight to stash rec.log for
// sortie fights only + keeps say lines on sortie days; the sense script
// (test-sortiedpr-a-sense.js) replays one seed through runOne with this
// flag and prints the transcript. Never on in judged sweeps.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const GORGE_RE = /🌙 Night\. The lingering (.*?) gorges at the treeline — ([\d,]+) kcal/;
const MUSTER_RE = /⚔️ SORTIE — (.*?) take up arms/;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const SENSE = process.env.SORTIEDPR_SENSE === '1';

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
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
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) { return 0; }
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function lingerersNow(Game) {
  try { if (typeof Game.lingeringRaiders === 'function') return Game.lingeringRaiders() || []; } catch (e) {}
  try { return (Game.worldMonsters() || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) { return []; }
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function evidDirOf(band) { return path.join(process.env.EVID || path.join(REPO, 'evidence', '2026-10-28', 'perseed-sortiedpr-a'), band); }

async function runOne(seed, days, evidDir, band) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  const fpStore = newFieldpartyStore();
  const base = withFieldpartyDiag(tableseatNowait, 'fieldparty-diag', 'tableseat-nowait + field-party formation census', fpStore);
  const { Game } = await loadGame({ seed, mode: 'sortiedpr-a-' + band, fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}

  // Opportunity + sortie counters (recorder-only).
  const opp = { gorgeNights: [], sortieMusters: [], sortieAttempts: [], episodes: [], lingererDays: 0, answerCalls: 0 };
  const senseFights = [];
  const senseSay = [];
  const sortieDays = new Set();
  const _say = Game.say ? Game.say.bind(Game) : null;
  if (_say) {
    Game.say = function (t) {
      try {
        const line = String(t), day = dayOf(Game);
        const gm = GORGE_RE.exec(line);
        if (gm) opp.gorgeNights.push({ day, monster: gm[1], kcal: parseInt(gm[2].replace(/,/g, ''), 10) || 0, line: line.slice(0, 200) });
        if (MUSTER_RE.test(line)) { opp.sortieMusters.push({ day, line: line.slice(0, 300) }); sortieDays.add(day); }
        if (SENSE && (sortieDays.has(day) || MUSTER_RE.test(line) || GORGE_RE.test(line))) senseSay.push({ day, line: line.slice(0, 400) });
      } catch (e) {}
      return _say(t);
    };
  }
  const _ans = Game.answerLingerer ? Game.answerLingerer.bind(Game) : null;
  if (_ans) {
    Game.answerLingerer = function (how) {
      const before = pantryKcal(Game);
      let lingBefore = [];
      try { lingBefore = lingerersNow(Game).map(m => ({ id: m.id, hp: m.hp || 0 })); } catch (e) {}
      let r = null;
      try { r = _ans(how); } catch (e) { r = { threw: String(e && e.message).slice(0, 120) }; }
      try {
        opp.answerCalls++;
        opp.sortieAttempts.push({
          day: dayOf(Game), how: String(how),
          ret: (r && typeof r === 'object') ? { ok: !!r.ok, cleared: r.cleared, broke: !!r.broke, remaining: r.remaining, paid: r.paid, why: r.why || null } : String(r),
          pantryBefore: before, pantryAfter: pantryKcal(Game), lingerersBefore: lingBefore,
        });
        if (String(how) === 'sortie') sortieDays.add(dayOf(Game));
      } catch (e) {}
      return r;
    };
  }
  if (SENSE && Game.fieldFight) {
    const _ff = Game.fieldFight.bind(Game);
    Game.fieldFight = function (...args) {
      let r = null;
      try { r = _ff(...args); } catch (e) { throw e; }
      try {
        const stack = (new Error()).stack || '';
        if (/lingererSortie/.test(stack) && r) {
          senseFights.push({ day: dayOf(Game), leader: String(args[0]), leaderName: rawName(Game, args[0]),
            monster: (args[1] || {}).id || (args[2] && args[2].id) || '?',
            outcome: r.outcome || '?', rounds: r.rounds | 0, mDealt: r.mDealt | 0, allyDealt: r.allyDealt | 0,
            vTaken: r.vTaken | 0, partySize: r.partySize || null, corneredHold: !!r.corneredHold,
            log: (r.log || []).slice(0, 120) });
        }
      } catch (e) {}
      return r;
    };
  }

  // Episode tracker (r50 method) + PLAYED driver.
  const tracked = new Map();
  function episodeDayHook() {
    try {
      const now = lingerersNow(Game);
      const nowSet = new Set(now);
      for (const [obj, ep] of [...tracked]) {
        if (!nowSet.has(obj)) {
          opp.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null });
          tracked.delete(obj);
        }
      }
      for (const obj of now) {
        if (!tracked.has(obj)) tracked.set(obj, { firstDay: dayOf(Game), gorgeSeen: false, sortied: false, sortieDay: null });
      }
      opp.lingererDays += now.length;
      if (opp.gorgeNights.some(g => g.day <= dayOf(Game))) for (const ep of tracked.values()) ep.gorgeSeen = true;
      if (band === 'played' && _ans) {
        const cands = [...tracked.values()].filter(ep => ep.gorgeSeen && !ep.sortied);
        if (cands.length) {
          for (const ep of cands) { ep.sortied = true; ep.sortieDay = dayOf(Game); }
          try { Game.answerLingerer('sortie'); } catch (e) {}
        }
      }
    } catch (e) {}
  }

  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (base.daily) { try { base.daily(G, ctx); } catch (e) {} }
      episodeDayHook();
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  for (const [obj, ep] of [...tracked]) {
    opp.episodes.push({ firstDay: ep.firstDay, lastDay: dayOf(Game), gorgeSeen: ep.gorgeSeen, sortied: ep.sortied, sortieDay: ep.sortieDay || null, open: true });
  }
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const row = {
    policy: band === 'played' ? 'played-sortie-driver' : 'autonomous', band, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    tableState,
    opportunities: opp,
    senseFights: SENSE ? senseFights : undefined,
    senseSay: SENSE ? senseSay : undefined,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${band}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

async function summaryMode(band) {
  const evidDir = evidDirOf(band);
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-${band}.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0));
  const meetings = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const sorties = meetings.filter(m => m.caller === 'sortie');
  const aids = meetings.filter(m => m.caller === 'aid');
  const bandOut = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const opp = {
    episodes: rows.reduce((t, r) => t + (r.opportunities.episodes || []).length, 0),
    episodesGorgeSeen: rows.reduce((t, r) => t + (r.opportunities.episodes || []).filter(e => e.gorgeSeen).length, 0),
    episodesSortied: rows.reduce((t, r) => t + (r.opportunities.episodes || []).filter(e => e.sortied).length, 0),
    lingererDays: rows.reduce((t, r) => t + (r.opportunities.lingererDays || 0), 0),
    gorgeNights: rows.reduce((t, r) => t + (r.opportunities.gorgeNights || []).length, 0),
    answerCalls: rows.reduce((t, r) => t + (r.opportunities.answerCalls || 0), 0),
    sortieAttempts: rows.reduce((t, r) => t + (r.opportunities.sortieAttempts || []).length, 0),
  };
  const summary = { band, bandOut, deathsByCause, meetings: meetings.length,
    sortieMeetings: sorties.length, aidMeetings: aids.length, opp, corpusOk };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log(`=== sim-sortiedpr-a ${band} ===`);
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} meetings=${meetings.length} sortieMeetings=${sorties.length} aidMeetings=${aids.length}`);
  console.log(`OPP: episodes=${opp.episodes} gorgeSeen=${opp.episodesGorgeSeen} sortied=${opp.episodesSortied} lingererDays=${opp.lingererDays} gorgeNights=${opp.gorgeNights} answerCalls=${opp.answerCalls} attempts=${opp.sortieAttempts}`);
  console.log(`WALL: won=${bandOut.won} (full=${bandOut.wonFull}) natEver=${bandOut.nationalEver} natFinal=${bandOut.nationalFinal} table=${bandOut.table} entered=${bandOut.entered} wave4=${bandOut.wave4} wave5=${bandOut.wave5} median=${bandOut.medianDays} starv=${bandOut.starvationTotal} deaths=${bandOut.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  for (const r of rows) {
    const sm = sorties.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} end=${r.endReason} won=${r.won} wave=${r.waveReach} sorties=${sm.length} ep=${(r.opportunities.episodes || []).length} gorge=${(r.opportunities.gorgeNights || []).length} starv=${r.starvationDeaths} deaths=${r.deathTotal}`);
  }
  if (!corpusOk) { console.log('CORPUS-INVALID'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  if (args[0] === '--summary') { await summaryMode(args[1] || 'auto'); return; }
  if (args[0] === '--one') {
    const band = args[1], seed = parseInt(args[2], 10);
    const evidDir = evidDirOf(band);
    fs.mkdirSync(evidDir, { recursive: true });
    const row = await runOne(seed, days, evidDir, band);
    console.log(`  [${band} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} ep=${(row.opportunities.episodes || []).length} attempts=${(row.opportunities.sortieAttempts || []).length}`);
    return;
  }
  for (const band of ['auto', 'played']) {
    const evidDir = evidDirOf(band);
    fs.mkdirSync(evidDir, { recursive: true });
    for (const seed of SEEDS) {
      const row = await runOne(seed, days, evidDir, band);
      console.log(`  [${band} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} fpMeetings=${row.fieldparty.meetings.length} fpErrs=${row.fieldparty.diag.errs} ep=${(row.opportunities.episodes || []).length} attempts=${(row.opportunities.sortieAttempts || []).length}`);
    }
    await summaryMode(band);
  }
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP-FAIL', e && e.stack || e); process.exit(1); });
}
module.exports = { runOne, summaryMode, evidDirOf, SEEDS };
