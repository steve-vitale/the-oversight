#!/usr/bin/env node
// heraldcontact-replay-20261102.js — herald-CONTACT diagnosis replay
// for sim-heraldcontact-a (Loop A 20261102T0725Z, axis scale-onramp).
// Adapts scripts/arrears-route-replay-20261102.js with the
// intervention REMOVED: no deferral, no sound, no stand-down, no
// armed/baseline split — one run per seed, because there is no lever
// to compare. What it adds, all pre-registered
// (evidence/2026-11-02/sim-heraldcontact-a-prereg.md):
//  (1) a wrapped daily that samples the herald pipeline EVERY day
//      before the base policy's daily: unlockedWave, scaleRank,
//      omen stage/day for 'herald', herald-monster presence in
//      Game.worldMonsters(), pendingEncounter / pendingMonsterId;
//  (2) a startCombat interceptor that, at every REFUSED herald
//      attempt recorded by the herald instrument, computes a
//      readiness row with the DEPLOYED Game.titanCallReadiness
//      ('herald') (same per-link fields as the arrears replay);
//      FOUGHT attempts record no readiness row;
//  (3) a Game.say wrapper that additionally captures every line
//      matching /herald|titan|omen|lair/i for the sense test.
// muster-diag is NOT installed: its same-day-snapshot role is
// replaced by direct joins to instrument attempt rows (day + cls +
// reason). DIAG ONLY: zero src/js changes, nothing is sounded,
// deferred, or mutated by this replay beyond the base policy.
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "hc": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the arrears replay, minus MUSTER):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/heraldcontact-replay-20261102.js > evidence/2026-11-02/perseed-heraldcontact-a/pilot.stdout 2> evidence/2026-11-02/perseed-heraldcontact-a/pilot.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`HERALDCONTACT STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

const CALL_LINE_RE = /CALL GOES OUT|answers!|REFUSES|no free fighters|volunteers already march|waits|stands down|still stands|nothing located/;
const HERALD_LINE_RE = /herald|titan|omen|lair/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  const transcript = [];
  const heraldLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (CALL_LINE_RE.test(arg)) transcript.push(String(arg).slice(0, 500));
          if (HERALD_LINE_RE.test(arg) && heraldLines.length < 400) heraldLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}

  // Pipeline samples, one per wrapped-daily call (before base daily).
  const samples = [];
  const readinessRows = [];
  const interceptorErrors = [];
  let processedAttempts = 0;

  function samplePipeline(Game) {
    try {
      const day = gday(Game);
      let wave = null, rank = null;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      try { rank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
      let omenStage = null, omenDay = null;
      try {
        const o = ((Game.state || {}).titans || {}).omens || {};
        if (o.herald) { omenStage = o.herald.stage; omenDay = o.herald.day; }
      } catch (e) {}
      let present = false;
      try {
        const mons = Game.worldMonsters ? Game.worldMonsters() : [];
        present = (mons || []).some(function (m) { return m && m.id === 'herald'; });
      } catch (e) {}
      let pend = false, pendMid = null;
      try { pend = !!Game.pendingEncounter; pendMid = Game.pendingMonsterId || null; } catch (e) {}
      samples.push({ day: day, wave: wave, rank: rank, omenStage: omenStage, omenDay: omenDay, present: present, pend: pend, pendMid: pendMid });
    } catch (e) { interceptorErrors.push('sample: ' + String((e && e.message) || e).slice(0, 120)); }
  }

  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const curDay = gday(Game);
      const hatt = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; });
      // Process only attempt rows not yet seen by this interceptor.
      for (let i = processedAttempts; i < hatt.length; i++) {
        const att = hatt[i];
        if (att.cls === 'REFUSED') {
          let readiness = null;
          try {
            if (typeof Game.titanCallReadiness !== 'function') throw new Error('titanCallReadiness missing');
            readiness = Game.titanCallReadiness('herald');
          } catch (e) {
            interceptorErrors.push('readiness: ' + String((e && e.message) || e).slice(0, 120));
          }
          if (readiness) {
            readinessRows.push({ day: att.day, attemptDay: att.day, reason: att.reason || null,
              links: readiness.links, alliesProj: readiness.alliesProj, havenProj: readiness.havenProj,
              volunteers: readiness.volunteers, total: readiness.total, naiveTotal: readiness.naiveTotal,
              ready: readiness.ready, generatedNow: readiness.generatedNow, errors: readiness.errors });
          }
        }
      }
      processedAttempts = hatt.length;
    } catch (e) { interceptorErrors.push(String(e && e.message)); }
    return r;
  };

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      samplePipeline(Gm);
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let w4Day = null, w5Day = null;
  for (const c of t.census) {
    if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
    if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
  }
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  let endRank = null, endOmen = null, endLinks = null, endPend = null, endPendMid = null;
  try { endRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { const o = ((st.titans || {}).omens || {}).herald; endOmen = o ? { stage: o.stage, day: o.day } : null; } catch (e) {}
  try { endLinks = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
  try { endPend = !!Game.pendingEncounter; endPendMid = Game.pendingMonsterId || null; } catch (e) {}

  // Milestones derived from samples (also re-derived by the analyzer).
  function firstDay(pred) { for (const s of samples) { if (pred(s)) return s.day; } return null; }
  const milestones = {
    wave4Day: firstDay(s => (s.wave | 0) >= 4),
    regionalDay: firstDay(s => ['regional', 'national', 'global'].indexOf(s.rank) >= 0),
    omenStartDay: firstDay(s => s.omenStage !== null && s.omenStage !== undefined),
    omenStage1Day: firstDay(s => (s.omenStage | 0) >= 1),
    omenStage2Day: firstDay(s => (s.omenStage | 0) >= 2),
    firstPresentDay: firstDay(s => s.present === true),
    lastPresentDay: (function () { let d = null; for (const s of samples) { if (s.present === true) d = s.day; } return d; })(),
    sampleCount: samples.length,
  };

  const out = { seed, anchorCommit: ANCHOR, mode: 'diag',
    attempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    attemptCount: att.length,
    firstAttempt: att.length ? { day: att[0].day, cls: att[0].cls, reason: att[0].reason || null } : null,
    readinessRows: readinessRows,
    firstReadiness: readinessRows.length ? { day: readinessRows[0].day, total: readinessRows[0].total, ready: readinessRows[0].ready } : null,
    samples: samples, milestones: milestones,
    transcript: transcript, heraldLines: heraldLines,
    instrumentTranscripts: (t.transcripts || []).map(x => ({ cls: x.cls, day: x.day, sayDuring: x.sayDuring || [] })),
    instrumentErrors: t.instrumentErrors, interceptorErrors: interceptorErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    endRank: endRank, endOmen: endOmen, endLinks: endLinks, endPend: endPend, endPendMid: endPendMid,
    deaths, hashes };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('HERALDCONTACT STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, hc: r }));
      console.error(`done s${seed}: attempts=${r.attemptCount} firstAtt=${r.firstAttempt ? r.firstAttempt.day + '/' + r.firstAttempt.cls : 'none'} readiness=${r.readinessRows.length} wave4day=${r.milestones.wave4Day} regionalDay=${r.milestones.regionalDay} omenStart=${r.milestones.omenStartDay} stage2=${r.milestones.omenStage2Day} present=${r.milestones.firstPresentDay}..${r.milestones.lastPresentDay} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.interceptorErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
