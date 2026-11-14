// capablewinpath-driver-20261114.js — DIAG arm sim-capablewinpath-b
// (run fleshout-loop-b-20261114T1030Z). Decomposes finding #2321: capable
// wins 16/16 by ~day 90 while competent wins 0/16 on identical seeds
// 98801-98816, 150d.
//
// INSTRUMENT-ONLY: zero src/js changes. Driver-side recorder: wraps the
// policy object passed to runDays (one snapshot after each daily() call,
// deduped by game day) and wraps Game.tableTakeSeat /
// Game.chooseTableOption / Game.unlockedWave / Game.villageStandingTotal /
// Game.say. The two gated reads (unlockedWave, villageStandingTotal) are
// LOG-ON-CHANGE ONLY — the recorder never calls them; the engine's own
// calls surface the values (villageStandingTotal() fires release/hold
// beats and writes _standingPeakWave, so a recorder call could shift a
// beat — never call it). Daily snapshot reads are PURE reads only:
// villageStanding() (raw war/diplomacy/plenty), deedGateReady(),
// tableSeat(), tablePreview() (only when pg.tableWaiting), progState(),
// deedState(), playerTracks(), integrationStage(), codexBreadth(),
// waveCombatReadiness(4/5), state.waveKills, scholar abilities, roster.
// villageStandingTotal() is read ONCE at end-of-run (rageprecheck
// precedent). Per-seed JSON to evidence/2026-11-14/perseed-capablewinpath-b/.
// Policies: competent verbatim vs capable, identical seeds.
// Usage:
//   SEEDS=98801,98802 POLICY=competent,capable DAYS=150 RUN=capablewinpath-b \
//     OUTDIR=perseed-capablewinpath-b node scripts/capablewinpath-driver-20261114.js
// As a module: require('./capablewinpath-driver-20261114').oneRun(seed, policyName)
// returns the per-seed record (used by test-capablewinpath-b.js §2).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { capable, capableSummary } = require(path.join(REPO, 'scripts', 'policies', 'capable'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const POLICIES = (process.env.POLICY ? process.env.POLICY.split(',').map(function (s) { return s.trim(); }) : ['competent', 'capable']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'capablewinpath-b';
const OUTDIR = process.env.OUTDIR || 'perseed-capablewinpath-b';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// One daily snapshot: pure reads only (see header). Returns null when the
// day is not readable (counts as an instrument error upstream).
function snapshot(Game, errors) {
  try {
    const st = Game.state || {};
    const s = st.scholar || {};
    const pg = safe(function () { return Game.progState() || {}; }, {});
    const d = safe(function () { return Game.deedState() || {}; }, {});
    const faced = d.wavesFaced || {};
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
      else if (w === 4) w4++; else if (w === 5) w5++;
    }
    const standing = safe(function () { return Game.villageStanding() || {}; }, {});
    const seat = safe(function () { return Game.tableSeat() || {}; }, {});
    const gate = safe(function () { return Game.deedGateReady() || {}; }, {});
    const rd4 = safe(function () { return Game.waveCombatReadiness(4) || {}; }, {});
    const rd5 = safe(function () { return Game.waveCombatReadiness(5) || {}; }, {});
    const tracks = safe(function () { return Game.playerTracks() || {}; }, {});
    let preview = null;
    if (pg.tableWaiting) {
      preview = safe(function () { return Game.tablePreview(); }, null);
      if (preview) {
        preview = {
          seat: preview.seat || null, ready: !!preview.ready, why: preview.why || null,
          doors: (preview.doors || []).slice(), overtime: preview.overtime | 0,
          key: !!preview.key, fullReady: !!preview.fullReady,
          fullShortfall: preview.fullShortfall || '',
          ladder: preview.ladder ? {
            stage: preview.ladder.stage | 0, peakStage: preview.ladder.peakStage | 0,
            counted: preview.ladder.counted | 0, tracks: preview.ladder.tracks || {},
            countedTracks: preview.ladder.countedTracks || {}, capped: (preview.ladder.capped || []).slice(),
          } : null,
        };
      }
    }
    return {
      d: s.day || 0,
      arc: pg.arc | 0,
      scale: safe(function () { return Game.scaleRank() || 'village'; }, 'village'),
      stRaw: standing.total | 0, war: standing.war | 0, dip: standing.diplomacy | 0,
      plenty: standing.plenty | 0, warPts: standing.warPts | 0, links: standing.links | 0,
      feasts: standing.feasts | 0,
      ladCounted: (seat.detail && seat.detail.ladderCounted) | 0,
      ladPeak: (seat.detail && seat.detail.ladderPeakStage) | 0,
      ladStage: (seat.detail && seat.detail.ladderStage) | 0,
      w1: w1, w2: w2, w3: w3, w4: w4, w5: w5,
      cont: (d.contestsSurvived | 0) || 0,
      cris: Object.keys(pg.crises || {}).length,
      stage: (gate.stage | 0) || (safe(function () { return Game.integrationStage() || 0; }, 0)),
      sent: pg.sentimentTaught ? 1 : 0,
      surge: (s.prog && s.prog.feastSurgeUsed) ? 1 : 0,
      seat: seat.seat || 'none',
      seatDetail: seat.detail || null,
      gateOk: !!gate.ok,
      preview: preview,
      tableWaiting: !!pg.tableWaiting, tableAnnounced: !!pg.tableAnnounced,
      tableDone: !!pg.tableDone,
      capstone: pg.ladderCapstone || null,
      wk: Object.assign({}, st.waveKills || {}),
      vet4: rd4.veterans | 0, vet5: rd5.veterans | 0,
      rd4ready: !!rd4.ready, rd5ready: !!rd5.ready,
      rd4short: (rd4.short || []).slice(), rd5short: (rd5.short || []).slice(),
      pop: ((st.village || {}).roster || []).length,
      abilN: ((s.abilities || []).length),
      abil: (s.abilities || []).map(function (a) { return (a && a.id) || a; }),
      tracks: tracks,
      breadth: safe(function () { return Game.codexBreadth() || 0; }, 0),
    };
  } catch (e) {
    errors.push('snapshot: ' + String(e.message).slice(0, 80));
    return null;
  }
}

const TABLE_LINE_RE = /table|seat|lesser|overtime|network|hosts|the pods/i;

async function oneRun(seed, policyName) {
  const policy = policyName === 'capable' ? capable : competent;
  if (policyName !== 'competent' && policyName !== 'capable') throw new Error('Unknown policy ' + policyName);
  const { Game } = await loadGame({ seed: seed, mode: 'capablewinpath-' + policyName, fullTelemetry: false });
  const series = [];
  const events = [];
  const tableLines = [];
  const seatTakes = [];
  const tableChoices = [];
  const errors = [];
  let lastDay = -1;
  let lastUnw = null;
  let lastGated = null;

  function snap(tag) {
    const sn = snapshot(Game, errors);
    if (!sn) return;
    if (sn.d === lastDay) return; // one snapshot per game day
    lastDay = sn.d;
    series.push(sn);
  }

  // Wrap engine reads that fire on the game's own calls (log-on-change).
  function wrapLogChange(name, key) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const ret = orig.apply(this, arguments);
        try {
          if (key === 'unw') {
            if (ret !== lastUnw) { lastUnw = ret; events.push({ day: gday(Game), kind: 'unlockedWave', wave: ret }); }
          } else if (key === 'gated') {
            if (ret !== lastGated) { lastGated = ret; events.push({ day: gday(Game), kind: 'standingGated', total: ret }); }
          }
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapLogChange('unlockedWave', 'unw');
  wrapLogChange('villageStandingTotal', 'gated');

  try {
    const origSeat = Game.tableTakeSeat;
    if (typeof origSeat === 'function') {
      Game.tableTakeSeat = function () {
        let pv = null;
        try { pv = Game.tablePreview ? Game.tablePreview() : null; } catch (e) {}
        let ret = null;
        try { ret = origSeat.apply(this, arguments); } catch (e) { throw e; }
        try {
          seatTakes.push({ day: gday(Game), seat: (pv && pv.seat) || null, ready: !!(pv && pv.ready), ok: !!(ret && ret.ok), ret: ret ? String(JSON.stringify(ret)).slice(0, 200) : null });
          events.push({ day: gday(Game), kind: 'seatTaken', seat: (pv && pv.seat) || null, ok: !!(ret && ret.ok) });
        } catch (e) { errors.push('seat-take-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('tableTakeSeat-wrap: not a function');
  } catch (e) { errors.push('tableTakeSeat-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origChoice = Game.chooseTableOption;
    if (typeof origChoice === 'function') {
      Game.chooseTableOption = function (id) {
        let ret = null;
        try { ret = origChoice.apply(this, arguments); } catch (e) { throw e; }
        try { tableChoices.push({ day: gday(Game), id: String(id), ret: ret }); } catch (e) { errors.push('table-choice-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('chooseTableOption-wrap: not a function');
  } catch (e) { errors.push('chooseTableOption-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && TABLE_LINE_RE.test(String(arg)) && tableLines.length < 80) {
          tableLines.push({ day: gday(Game), line: String(arg).slice(0, 400) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Policy wrapper: snapshot after each daily() call (one per game day).
  // Capture the harness ctx the policy closes over — runDays does not
  // return it, but the same object is passed to every policy hook, so the
  // end-of-run capableSummary / counter dump reads live policy counters.
  let capturedCtx = null;
  const recPolicy = Object.assign({}, policy, {
    daily: function (G, ctx) {
      capturedCtx = ctx;
      let r;
      try { r = policy.daily ? policy.daily(G, ctx) : undefined; }
      catch (e) { errors.push('policy.daily threw: ' + String(e.message).slice(0, 80)); throw e; }
      try { snap('daily'); } catch (e) { errors.push('snap-after-daily: ' + String(e.message).slice(0, 80)); }
      return r;
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, recPolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  let capSummary = null, ctxCounters = null;
  try {
    if (policyName === 'capable' && capturedCtx) capSummary = capableSummary(capturedCtx);
  } catch (e) { errors.push('capSummary: ' + String(e.message).slice(0, 80)); }
  try {
    if (capturedCtx) {
      ctxCounters = {};
      for (const k of Object.keys(capturedCtx)) {
        if (k === 'notes' || k === 'policyId' || k[0] === '_') continue;
        const v = capturedCtx[k];
        if (typeof v === 'number') ctxCounters[k] = v;
        else if (v && typeof v === 'object' && !Array.isArray(v)) {
          const flat = {};
          for (const kk of Object.keys(v)) if (typeof v[kk] === 'number') flat[kk] = v[kk];
          if (Object.keys(flat).length) ctxCounters[k] = flat;
        }
      }
    }
  } catch (e) { errors.push('ctxCounters: ' + String(e.message).slice(0, 80)); }
  try { snap('final'); } catch (e) {}

  const st = Game.state || {};
  let scaleRank = null, standingGated = null, standingRaw = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { standingGated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { errors.push('standingGated: ' + String(e.message).slice(0, 80)); }
  try { standingRaw = Game.villageStanding ? (Game.villageStanding() || {}).total : null; } catch (e) {}
  let tableState = null, earnedPaths = null;
  try { tableState = Game.tableState ? Game.tableState() : null; } catch (e) {}
  try { earnedPaths = Game.tableEarnedPaths ? Game.tableEarnedPaths() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  const villagerCombatDeaths = deaths.filter(function (d) { return !d.player; }).length;

  return {
    seed: seed, policy: policyName, arm: 'capablewinpath-b', run: RUN,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, standing: standingGated,
    standingRaw: standingRaw,
    waveKills: Object.assign({}, st.waveKills || {}),
    series: series, events: events, tableLines: tableLines,
    seatTakes: seatTakes, tableChoices: tableChoices,
    tableState: tableState ? {
      path: tableState.path || null, branch: tableState.branch || null,
      phase: tableState.phase || null, final: tableState.final || null,
      seat: (tableState.seatTaker && tableState.seatTaker.name) || null,
      seatSelf: !!(tableState.seatTaker && tableState.seatTaker.self),
    } : null,
    earnedPaths: (earnedPaths || []).map(function (p) {
      return { id: p.id, name: p.name, earned: !!p.earned, strength: p.strength | 0 };
    }),
    deaths: deaths, villagerCombatDeaths: villagerCombatDeaths,
    capSummary: capSummary, ctxCounters: ctxCounters,
    instrumentErrors: errors,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('CAPABLEWINPATH STOP: SEEDS required.'); process.exit(2); }
  if (!POLICIES.length) { console.error('CAPABLEWINPATH STOP: POLICY required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-14', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const file = path.join(outDir, 'capablewinpath-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('CAPABLEWINPATH STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const out = await oneRun(seed, pol);
    const file = path.join(outDir, 'capablewinpath-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      waveKills: out.waveKills, seriesDays: out.series.length,
      seatTakes: out.seatTakes.length, tableChoices: out.tableChoices.length,
      tableState: out.tableState, deaths: out.deaths.length,
      villagerCombatDeaths: out.villagerCombatDeaths, errors: out.instrumentErrors.length,
      capSeatTaken: out.capSummary ? out.capSummary.capSeatTaken : null,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
