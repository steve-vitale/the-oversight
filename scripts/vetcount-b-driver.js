// vetcount-b-driver.js — kill-log vs veteran-counter reconciliation census
// (arm sim-vetcount-reconcile-b, Loop B run fleshout-loop-b-20261110T1248Z,
// backlog #2077; base 7c2591d1f).
// Derived from scripts/capstoneready-b-driver.js (same daily census: plain
// competent policy, 150d death-aware) PLUS kill-call accounting: every
// recordWaveKill / recordPyrrhicKill call records {method, day, mid, by,
// via, logged, dup} so the before-leg can name, per call, whether it wrote
// a log entry, whether it was a same-key repeat, and which method it was.
// Also records the final `killers` table (capstoneready-b-driver
// buildKillers: every distinct wave-4+ killer INCLUDING the current
// scholar) and a per-wave log-vs-counter reconciliation in each per-seed
// file. The LOG is the source of truth: for each wave w, state.waveKills[w]
// must equal the count of waveKillLog entries with wave w and !pyrrhic.
// Usage:
//   SEEDS=140201..140208 DAYS=150 OUTDIR=evidence/2026-11-10/perseed-vetcount-reconcile-b/before node scripts/vetcount-b-driver.js
// Writes evidence/2026-11-10/perseed-vetcount-reconcile-b/<leg>/vetcount-b-s<seed>.json
// (refuses to overwrite an existing per-seed file).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const CAP = require(path.join(REPO, 'scripts', 'capstoneready-b-driver'));
const snapshotLadder = CAP.snapshotLadder;
const summarize = CAP.summarize;
// personAlive / personName: the data-array alive/name lookup the
// capstoneready driver's snapshotLadder uses (duplicated here so this
// driver is self-contained for the before-leg, which runs on the
// pre-fix engine while the capstoneready driver is stashed).
function personAlive(Game, vid) {
  try {
    const p = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
      || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; });
    if (!p) return null;
    return !p.dead;
  } catch (e) { return null; }
}
function personName(Game, vid) {
  try {
    const p = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; })
      || ((Game.data || {}).background_survivors || []).find(function (x) { return x && x.id === vid; });
    return (p && p.name) || null;
  } catch (e) { return null; }
}
// buildKillers(Game, rows): the fates-table source (vetcount fix 4).
// Every distinct wave-4+ killer in the FINAL waveKillLog, INCLUDING the
// current scholar — the daily rows' `veterans` list deliberately excludes
// the current scholar (correct for the daily readiness read), so it cannot
// serve the fates table. Only the recorder, with Game access at end of
// run, can build this authoritatively. (Same function as
// capstoneready-b-driver buildKillers; duplicated here so the before-leg
// runs on the pre-fix engine without depending on the stashed file.)
function buildKillers(Game, rows) {
  const out = [];
  try {
    const scholarDays = {};
    for (const r of (rows || [])) { if (r.scholarId) scholarDays[r.scholarId] = (scholarDays[r.scholarId] | 0) + 1; }
    const log = ((Game.state || {}).waveKillLog) || [];
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const v = seen[e.by] || (seen[e.by] = { vid: e.by, waves: [], firstKillDay: null, lastKillDay: null, kills: 0, pyrrhicKills: 0 });
      v.kills++;
      if (e.pyrrhic === true) v.pyrrhicKills++;
      if (!v.waves.includes(e.w)) v.waves.push(e.w);
      if (e.d != null) {
        if (v.firstKillDay == null || e.d < v.firstKillDay) v.firstKillDay = e.d;
        if (v.lastKillDay == null || e.d > v.lastKillDay) v.lastKillDay = e.d;
      }
    }
    const scholarAtEnd = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
    for (const vid of Object.keys(seen)) {
      const v = seen[vid];
      out.push({
        vid: vid, name: personName(Game, vid), alive: personAlive(Game, vid),
        waves: v.waves.sort(), kills: v.kills, pyrrhicKills: v.pyrrhicKills,
        firstKillDay: v.firstKillDay, lastKillDay: v.lastKillDay,
        everScholar: (scholarDays[vid] | 0) > 0, scholarDays: (scholarDays[vid] | 0),
        scholarAtEnd: vid === scholarAtEnd,
      });
    }
  } catch (e) { /* killers is diagnostic; a failure must never break the run */ }
  return out;
}

const DEEDS = ['military_tribute', 'trade_charter', 'feast_embassy'];

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

let SEEDS = [];
let DAYS = 150;
let ANCHOR = 'unknown';
let outDir = null;
function loadConfig() {
  SEEDS = expandSeeds(process.env.SEEDS);
  DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
  if (!SEEDS.length) { console.error('VETCOUNT-B STOP: SEEDS required (e.g. SEEDS=140201..140208).'); process.exit(2); }
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-vetcount-reconcile-b', 'before');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'vetcount-b-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('VETCOUNT-B STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// wrapKillRecorder(Game, samples, calls, errors): kill-time veteran
// sampling (as in the capstoneready driver) PLUS kill-call accounting.
// Per call: {method, day, mid, by, via, logged, dup} — logged is true when
// the call added a waveKillLog entry; dup is true when it added none AND
// an entry with the same (day, mid, by, via, trick) key already sits in
// the log (the recordWaveKill dedupe verdict). Pure reads around the
// original call; sampling failures are caught and recorded, never thrown.
function wrapKillRecorder(Game, samples, calls, errors) {
  const methods = ['recordWaveKill', 'recordPyrrhicKill'];
  const installed = {};
  for (const name of methods) {
    const orig = Game[name];
    if (typeof orig !== 'function') continue;
    installed[name] = (function (origFn, methodName) {
      return function (monsterId, killerVid, via, detail) {
        let beforeLen = -1;
        let beforeLog = null;
        try {
          beforeLog = ((Game.state || {}).waveKillLog) || [];
          beforeLen = beforeLog.length;
        } catch (e) {}
        const ret = origFn.apply(Game, arguments);
        try {
          const log = ((Game.state || {}).waveKillLog) || [];
          const logged = beforeLen >= 0 && log.length > beforeLen;
          let dup = false;
          if (!logged && beforeLog) {
            const d = gday(Game);
            dup = beforeLog.some(function (e) {
              return e && e.d === d && e.mid === monsterId
                && (e.by || null) === (killerVid || null)
                && (e.via || 'unknown') === (via || 'unknown')
                && (e.trick || null) === (detail || null);
            });
          }
          calls.push({
            method: methodName, day: gday(Game), mid: monsterId,
            by: killerVid || null, via: via || 'unknown',
            logged: logged, dup: dup,
          });
          if (logged) {
            const entry = log[log.length - 1];
            if (entry && entry.mid === monsterId && (entry.by || null) === (killerVid || null)) {
              let living = null;
              try { living = Game._ladderLivingVeterans(4); } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
              samples.push({
                day: gday(Game), mid: entry.mid, by: entry.by, w: entry.w | 0,
                via: entry.via || via || 'unknown', method: methodName,
                pyrrhic: entry.pyrrhic === true,
                livingVeteransAtKill: living,
                scholarIdAtKill: (function () { try { return Game.villagerId || null; } catch (e) { return null; } })(),
              });
            }
          }
        } catch (e) { errors.push(methodName + ' sample: ' + String(e.message).slice(0, 120)); }
        return ret;
      };
    })(orig, name);
    Game[name] = installed[name];
  }
  return Object.keys(installed).length ? installed : null;
}

// reconcile(Game): per-wave log-vs-counter table from live state. The LOG
// is the source of truth: counter[w] must equal non-pyrrhic log entries
// with wave w. Returns {waves: {w: {counter, logAll, logCounted, agree}},
// allAgree}.
function reconcile(Game) {
  const out = { waves: {}, allAgree: true };
  try {
    const counter = (Game.state || {}).waveKills || {};
    const log = ((Game.state || {}).waveKillLog) || [];
    for (let w = 1; w <= 5; w++) {
      const entries = log.filter(function (e) { return e && ((e.w | 0) === w); });
      const counted = entries.filter(function (e) { return e.pyrrhic !== true; });
      const c = (counter[w] | 0) || (counter[String(w)] | 0) || 0;
      const agree = c === counted.length;
      out.waves[w] = { counter: c, logAll: entries.length, logCounted: counted.length, agree: agree };
      if (!agree) out.allAgree = false;
    }
  } catch (e) { out.error = String(e.message).slice(0, 120); out.allAgree = false; }
  return out;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'vetcount-b', fullTelemetry: false });
  const rows = [];
  const errors = [];
  const killTimeSamples = [];
  const killCalls = [];
  let lastSnapDay = -1;
  await setupGame(Game);
  wrapKillRecorder(Game, killTimeSamples, killCalls, errors);
  const wrapped = Object.assign({}, COMPETENT.competent, {
    daily: function (Gm, ctx) {
      try { return COMPETENT.competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; rows.push(snapshotLadder(Game)); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 120)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { const d = gday(Game); if (d !== lastSnapDay) rows.push(snapshotLadder(Game)); } catch (e) { errors.push('final-snapshot: ' + String(e.message).slice(0, 120)); }
  const st = Game.state || {};
  const summary = summarize(rows);
  summary.killTimeSamples = killTimeSamples.length;
  summary.killTimePeakVeterans = killTimeSamples.reduce(function (m, s) { return (typeof s.livingVeteransAtKill === 'number' && s.livingVeteransAtKill > m) ? s.livingVeteransAtKill : m; }, 0);
  summary.killTimeEverTwoVeterans = killTimeSamples.some(function (s) { return (s.livingVeteransAtKill | 0) >= 2; });
  summary.killCalls = killCalls.length;
  summary.killCallsLogged = killCalls.filter(function (c) { return c.logged; }).length;
  summary.killCallsDup = killCalls.filter(function (c) { return c.dup; }).length;
  summary.killCallsPyrrhic = killCalls.filter(function (c) { return c.method === 'recordPyrrhicKill'; }).length;
  const out = {
    seed: seed, arm: 'vetcount-reconcile-b', run: 'fleshout-loop-b-20261110T1248Z',
    policy: 'competent', anchorCommit: ANCHOR, days: DAYS,
    resultDays: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    scaleTrajectory: (result.samples && result.samples.scale) || [],
    teleDeaths: (result.samples && result.samples.deaths) || [],
    summary: summary, killTimeSamples: killTimeSamples, killCalls: killCalls,
    killers: buildKillers(Game, rows),
    reconciliation: reconcile(Game),
    daily: rows, recorderErrors: errors,
  };
  return out;
}

async function main() {
  loadConfig();
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vetcount-b-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, killTimePeakVets: s.killTimePeakVeterans, killTimeEverTwo: s.killTimeEverTwoVeterans,
      everReady: s.everReady, firstReadyDay: s.firstReadyDay,
      everChartered: s.everCharteredLinks, everBundle: s.everFeastBundle,
      killCalls: s.killCalls, logged: s.killCallsLogged, dup: s.killCallsDup, pyrrhic: s.killCallsPyrrhic,
      killers: out.killers.length,
      reconcile: out.reconciliation.allAgree, reconcileWaves: out.reconciliation.waves,
      rows: s.days, recorderErrors: out.recorderErrors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { snapshotLadder: snapshotLadder, summarize: summarize, wrapKillRecorder: wrapKillRecorder, buildKillers: buildKillers, reconcile: reconcile, DEEDS: DEEDS };
