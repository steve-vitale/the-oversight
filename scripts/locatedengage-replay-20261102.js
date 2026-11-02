#!/usr/bin/env node
// locatedengage-replay-20261102.js — located-titan engagement trace
// for sim-locatedengage-a (Loop A 20261102T0815Z, axis scale-onramp).
// Adapts scripts/heraldcontact-replay-20261102.js with the SAME frozen
// policy stack, env flags, herald-v1 instrument, and DAYS=180 cap, plus
// a position/route trace (pre-registered in
// evidence/2026-11-02/sim-locatedengage-a-prereg.md):
//  (1) the wrapped daily samples a trace row BEFORE the base policy's
//      daily and again AFTER it returns: scholar tile, haven tile,
//      herald tile + detail coords, scholar detail coords, Manhattan
//      scholar-herald distance, same-tile flags, omen stage, herald
//      presence, pendingEncounter / pendingMonsterId;
//  (2) a Game.travelTo wrap logs EVERY scholar tile move in the run
//      (day, from, to, moved/blocked/refused, top-3 stack functions)
//      — the policy's route target, recorded directly, not inferred;
//  (3) the Game.say wrapper captures ONLY anchored herald lines
//      ("THE HERALD" / "Scouts found its lair" / "fed in the night" /
//      "struck .* in the night" / "THE HERALD came" / "pads into the
//      clearing") — NEVER bare /omen/ (matches "moment" in routine
//      lines); the lair tile is parsed from the lair line.
// DIAG ONLY: zero src/js changes, nothing sounded, deferred, or
// mutated by this replay beyond the base policy. The wraps read only
// (no RNG consumed, no game state written), so pilot milestones must
// reproduce. STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "le": {...}}`) to stdout and writes NOTHING itself.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97307 node scripts/locatedengage-replay-20261102.js > evidence/2026-11-02/perseed-locatedengage-a/run.stdout 2> evidence/2026-11-02/perseed-locatedengage-a/run.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`LOCATEDENGAGE STOP: ${k}=1 is required.`); process.exit(2); }
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
// ANCHORED ONLY (heraldcontact metric review): never bare /omen/.
const ANCHORED_RE = /THE HERALD|Scouts found its lair|fed in the night|struck .* in the night|THE HERALD came|pads into the clearing/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackTop3() {
  try {
    const st = (new Error('le-stack').stack || '').split('\n').slice(2, 5);
    return st.map(function (line) {
      const m = /at ([^\s(]+)/.exec(line);
      return m ? m[1] : line.trim();
    });
  } catch (e) { return []; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  const transcript = [];
  const anchoredLines = [];
  let lairTile = null;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (CALL_LINE_RE.test(arg)) transcript.push(String(arg).slice(0, 500));
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 400) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
            const lm = LAIR_RE.exec(arg);
            if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
          }
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}

  const traces = [];
  const travelEvents = [];
  const readinessRows = [];
  const interceptorErrors = [];
  const travelErrors = [];
  let processedAttempts = 0;

  function heraldMon(Game) {
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  function sampleTrace(Game, phase) {
    try {
      const day = gday(Game);
      const st = Game.state || {};
      const sx = Game.map ? Game.map.px : null, sy = Game.map ? Game.map.py : null;
      const hx = (st.village && st.village.px != null) ? st.village.px : null;
      const hy = (st.village && st.village.py != null) ? st.village.py : null;
      const hm = heraldMon(Game);
      const smx = (st.scholar && st.scholar.mx != null) ? st.scholar.mx : null;
      const smy = (st.scholar && st.scholar.my != null) ? st.scholar.my : null;
      let wave = null, rank = null;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
      try { rank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
      let omenStage = null, omenDay = null;
      try {
        const o = ((st.titans || {}).omens || {}).herald;
        if (o) { omenStage = o.stage; omenDay = o.day; }
      } catch (e) {}
      let pend = false, pendMid = null;
      try { pend = !!Game.pendingEncounter; pendMid = Game.pendingMonsterId || null; } catch (e) {}
      const dist = (hm && sx != null && sy != null) ? (Math.abs(hm.tx - sx) + Math.abs(hm.ty - sy)) : null;
      const same = !!(hm && sx != null && hm.tx === sx && hm.ty === sy);
      traces.push({ day: day, phase: phase, sx: sx, sy: sy, hx: hx, hy: hy,
        htx: hm ? hm.tx : null, hty: hm ? hm.ty : null,
        hmx: hm ? (hm.mx != null ? hm.mx : null) : null,
        hmy: hm ? (hm.my != null ? hm.my : null) : null,
        hstance: hm ? (hm.stance || null) : null,
        smx: smx, smy: smy, dist: dist, same: same,
        wave: wave, rank: rank, omenStage: omenStage, omenDay: omenDay,
        present: !!hm, pend: pend, pendMid: pendMid });
    } catch (e) { interceptorErrors.push('trace: ' + String((e && e.message) || e).slice(0, 120)); }
  }

  // travelTo wrap: read-only logging (no RNG, no state writes).
  try {
    const origTT = Game.travelTo;
    Game.travelTo = function (x, y) {
      const before = (Game.map ? { x: Game.map.px, y: Game.map.py } : null);
      const day = gday(Game);
      const stack = stackTop3();
      let hmBefore = null;
      try { const hm0 = heraldMon(Game); hmBefore = hm0 ? { tx: hm0.tx, ty: hm0.ty } : null; } catch (e) {}
      let r;
      try { r = origTT.apply(this, arguments); } catch (e) { travelErrors.push('travelTo throw: ' + String((e && e.message) || e).slice(0, 120)); throw e; }
      try {
        const after = (Game.map ? { x: Game.map.px, y: Game.map.py } : null);
        let hmAfter = null;
        try { const hm1 = heraldMon(Game); hmAfter = hm1 ? { tx: hm1.tx, ty: hm1.ty } : null; } catch (e) {}
        let kind = 'refused';
        if (after && before && after.x === x && after.y === y) kind = 'moved';
        else if (r && (r.blockType || r.blocked)) kind = 'blocked';
        else if (r && typeof r === 'object' && r.kind) kind = 'step-' + String(r.kind).slice(0, 40);
        travelEvents.push({ day: day, from: before, to: { x: x, y: y }, after: after, kind: kind, hBefore: hmBefore, hAfter: hmAfter, stack: stack });
      } catch (e) { travelErrors.push('travel log: ' + String((e && e.message) || e).slice(0, 120)); }
      return r;
    };
  } catch (e) { travelErrors.push('travel wrap: ' + String((e && e.message) || e).slice(0, 120)); }

  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const hatt = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; });
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
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      sampleTrace(Gm, 'pre');
      try { return policy.daily(Gm, ctx); } finally { sampleTrace(Gm, 'post'); }
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
  let endOmen = null, endLinks = null, endPend = null, endPendMid = null;
  try { const o = ((st.titans || {}).omens || {}).herald; endOmen = o ? { stage: o.stage, day: o.day } : null; } catch (e) {}
  try { endLinks = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
  try { endPend = !!Game.pendingEncounter; endPendMid = Game.pendingMonsterId || null; } catch (e) {}

  function firstDayPre(pred) {
    for (const s of traces) { if (s.phase === 'pre' && pred(s)) return s.day; }
    return null;
  }
  const milestones = {
    wave4Day: firstDayPre(s => (s.wave | 0) >= 4),
    regionalDay: firstDayPre(s => ['regional', 'national', 'global'].indexOf(s.rank) >= 0),
    omenStartDay: firstDayPre(s => s.omenStage !== null && s.omenStage !== undefined),
    omenStage1Day: firstDayPre(s => (s.omenStage | 0) >= 1),
    omenStage2Day: firstDayPre(s => (s.omenStage | 0) >= 2),
    firstPresentDay: firstDayPre(s => s.present === true),
    lastPresentDay: (function () { let d = null; for (const s of traces) { if (s.phase === 'pre' && s.present === true) d = s.day; } return d; })(),
    traceRows: traces.length,
    travelEvents: travelEvents.length,
  };

  const out = { seed, anchorCommit: ANCHOR, mode: 'diag-trace',
    attempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    attemptCount: att.length,
    firstAttempt: att.length ? { day: att[0].day, cls: att[0].cls, reason: att[0].reason || null } : null,
    readinessRows: readinessRows,
    firstReadiness: readinessRows.length ? { day: readinessRows[0].day, total: readinessRows[0].total, ready: readinessRows[0].ready } : null,
    traces: traces, travelEvents: travelEvents, lairTile: lairTile,
    milestones: milestones,
    transcript: transcript, anchoredLines: anchoredLines,
    instrumentTranscripts: (t.transcripts || []).map(x => ({ cls: x.cls, day: x.day, sayDuring: x.sayDuring || [] })),
    instrumentErrors: t.instrumentErrors, interceptorErrors: interceptorErrors, travelErrors: travelErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endOmen: endOmen, endLinks: endLinks, endPend: endPend, endPendMid: endPendMid,
    deaths };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('LOCATEDENGAGE STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, le: r }));
      console.error(`done s${seed}: attempts=${r.attemptCount} lair=${r.lairTile ? r.lairTile.x + ',' + r.lairTile.y : 'none'} wave4day=${r.milestones.wave4Day} stage2=${r.milestones.omenStage2Day} present=${r.milestones.firstPresentDay}..${r.milestones.lastPresentDay} traces=${r.traces.length} travel=${r.travelEvents.length} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.interceptorErrors.length}+${r.travelErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
