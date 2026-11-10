// scholardrain-b-driver.js — quantify the scholar drain on veteran-days
// (arm sim-scholardrain-b, Loop B run fleshout-loop-b-20261110T1248Z,
//  axis scale-onramp / winnability chain).
// DIAG ONLY, zero src/js: a daily recorder (pure reads) wrapped around the
// plain competent policy's daily() hook. Reuses the capstoneready-b
// instrument (snapshotLadder + kill-time sampling via wrapKillRecorder —
// imported, not copied) and adds, per day: (a) killerFates — for every
// distinct wave-4+ killer in state.waveKillLog so far (INCLUDING scholar
// kills, which the daily `veterans` list excludes): alive? scholar?; and
// (b) scholarChanges — scholarId transitions between consecutive daily
// rows, with the outgoing scholar's alive state observed at the change.
// The KILL LOG is the source of the killer list — never the waveKills
// counter (backlog #2077: log and counter disagree; the log is right).
// Usage:
//   SEEDS=140217..140224 DAYS=150 OUTDIR=evidence/2026-11-10/perseed-scholardrain-b node scripts/scholardrain-b-driver.js
// Writes evidence/2026-11-10/perseed-scholardrain-b/scholardrain-b-s<seed>.json
// (refuses to overwrite an existing per-seed file).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPETENT = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { snapshotLadder, summarize, wrapKillRecorder } = require(path.join(REPO, 'scripts', 'capstoneready-b-driver'));

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
  if (!SEEDS.length) { console.error('SCHOLARDRAIN-B STOP: SEEDS required (e.g. SEEDS=140217..140224).'); process.exit(2); }
  try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}
  outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-scholardrain-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'scholardrain-b-s' + seed + '.json');
    if (fs.existsSync(file)) { console.error('SCHOLARDRAIN-B STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

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

// snapshotDrain(Game, row): add the per-day killer-fates table to a
// capstoneready daily row. PURE READS ONLY. Every distinct wave-4+ killer
// in the log so far — scholar kills INCLUDED (unlike row.veterans, which
// excludes the scholar by design) — with alive/scholar status observed
// at this snapshot. A killer who has killed but is not yet in any row
// cannot exist: killerFates is computed from the same log the samples
// come from, at the same snapshot.
function snapshotDrain(Game, row) {
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const seen = {};
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 4)) continue;
      const v = seen[e.by] || (seen[e.by] = { vid: e.by, kills: 0, firstKillDay: null, lastKillDay: null });
      v.kills++;
      if (e.d != null) {
        if (v.firstKillDay == null || e.d < v.firstKillDay) v.firstKillDay = e.d;
        if (v.lastKillDay == null || e.d > v.lastKillDay) v.lastKillDay = e.d;
      }
    }
    row.killerFates = Object.keys(seen).map(function (vid) {
      const v = seen[vid];
      return {
        vid: vid, name: personName(Game, vid), kills: v.kills,
        firstKillDay: v.firstKillDay, lastKillDay: v.lastKillDay,
        alive: personAlive(Game, vid), isScholar: vid === Game.villagerId,
      };
    });
  } catch (e) { row.errors.push('killerFates: ' + String(e.message).slice(0, 120)); row.killerFates = []; }
  return row;
}

async function runDrainSeed(seed, days) {
  const { Game } = await loadGame({ seed: seed, mode: 'scholardrain-b', fullTelemetry: false });
  const rows = [];
  const errors = [];
  const killTimeSamples = [];
  const scholarChanges = [];
  let lastSnapDay = -1;
  let prevScholarId = undefined; // undefined = no row yet (first row records from:null)
  await setupGame(Game);
  wrapKillRecorder(Game, killTimeSamples, errors);
  const wrapped = Object.assign({}, COMPETENT.competent, {
    daily: function (Gm, ctx) {
      try { return COMPETENT.competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            const row = snapshotDrain(Game, snapshotLadder(Game));
            const cur = row.scholarId || null;
            if (prevScholarId === undefined) {
              scholarChanges.push({ day: d, from: null, fromName: null, fromAlive: null, to: cur, toName: personName(Game, cur) });
            } else if (cur !== prevScholarId) {
              scholarChanges.push({ day: d, from: prevScholarId, fromName: personName(Game, prevScholarId), fromAlive: personAlive(Game, prevScholarId), to: cur, toName: personName(Game, cur) });
            }
            prevScholarId = cur;
            rows.push(row);
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 120)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });
  // Final end-state row (post-runDays: Game.over may have cut the loop
  // before the last daily fired).
  try {
    const d = gday(Game);
    if (d !== lastSnapDay) {
      const row = snapshotDrain(Game, snapshotLadder(Game));
      const cur = row.scholarId || null;
      if (prevScholarId === undefined) {
        scholarChanges.push({ day: d, from: null, fromName: null, fromAlive: null, to: cur, toName: personName(Game, cur) });
      } else if (cur !== prevScholarId) {
        scholarChanges.push({ day: d, from: prevScholarId, fromName: personName(Game, prevScholarId), fromAlive: personAlive(Game, prevScholarId), to: cur, toName: personName(Game, cur) });
      }
      prevScholarId = cur;
      rows.push(row);
    }
  } catch (e) { errors.push('final-snapshot: ' + String(e.message).slice(0, 120)); }
  const st = Game.state || {};
  const summary = summarize(rows);
  summary.killTimeSamples = killTimeSamples.length;
  summary.killTimePeakVeterans = killTimeSamples.reduce(function (m, s) { return (typeof s.livingVeteransAtKill === 'number' && s.livingVeteransAtKill > m) ? s.livingVeteransAtKill : m; }, 0);
  summary.killTimeEverTwoVeterans = killTimeSamples.some(function (s) { return (s.livingVeteransAtKill | 0) >= 2; });
  summary.scholarChanges = scholarChanges.length;
  const out = {
    seed: seed, arm: 'scholardrain-b', run: 'fleshout-loop-b-20261110T1248Z',
    policy: 'competent', anchorCommit: ANCHOR, days: days,
    resultDays: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWaveUnlocked: result.maxWaveUnlocked || 1,
    waveKills: result.waveKills || {},
    scaleTrajectory: (result.samples && result.samples.scale) || [],
    teleDeaths: (result.samples && result.samples.deaths) || [],
    summary: summary, killTimeSamples: killTimeSamples,
    scholarChanges: scholarChanges, daily: rows, recorderErrors: errors,
  };
  return out;
}

async function main() {
  loadConfig();
  for (const seed of SEEDS) {
    const out = await runDrainSeed(seed, DAYS);
    const file = path.join(outDir, 'scholardrain-b-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.summary;
    console.log(JSON.stringify({
      seed: out.seed, days: out.resultDays, endReason: out.endReason, won: out.won,
      maxWave: out.maxWaveUnlocked, peakStage: s.peakLadderStage, peakScale: s.peakScaleRank,
      peakVets: s.peakLivingVeterans, killTimePeakVets: s.killTimePeakVeterans, killTimeEverTwo: s.killTimeEverTwoVeterans,
      everReady: s.everReady, firstReadyDay: s.firstReadyDay,
      scholarChanges: out.scholarChanges.length, killTimeSamples: out.killTimeSamples.length,
      rows: s.days, recorderErrors: out.recorderErrors.length, file: path.relative(REPO, file),
    }));
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { snapshotDrain: snapshotDrain, runDrainSeed: runDrainSeed };
