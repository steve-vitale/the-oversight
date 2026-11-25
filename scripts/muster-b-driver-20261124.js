#!/usr/bin/env node
// muster-b-driver-20261124.js — call-sounding muster measurement driver
// (arm sim-muster-b, Loop B 20261124, axis winnability-chain).
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-24/perseed-muster-b/ (sims write once, on
// purpose, into evidence/<date>/). Refuses to overwrite an existing
// per-seed file.
//
// POLICY: muster-sound-b (competent + titanroute + musterclose +
// mustergap + commitrefresh) — the full sounding stack, policy-only,
// zero src/js changes. The control leg is the EXISTING tbrefuse corpus
// (competent verbatim, same seeds 109310-109325, same 150d); this driver
// runs only the sounding leg, paired per seed.
//
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read link,
// muster, and roster state to record the trace (same dispensation as
// the closedecay driver). The POLICIES may NOT — they decide only from
// heard lines, their own tile, their own muster record, and (musterclose)
// their own links' trust/opinion/arrears and pantry. The driver reuses
// the tbrefuse instrument verbatim (daily snapshots, refusals with the
// spoken have/need line, deathEvents) so the sounding leg's fields are
// identical in shape to the control corpus, plus a closedecay-style
// daily gate trace after the call sounds and attempt-time gate snaps.
// Usage:
//   DAYS=150 SEEDS=109317,109318,109319,109320,109321,109325,109310,109311 RUN=muster-b node scripts/muster-b-driver-20261124.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { musterSoundB } = require(path.join(REPO, 'scripts', 'policies', 'muster-sound-b'));
const INST = require(path.join(REPO, 'scripts', 'tbrefuse-b-instrument-20261124'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const { writeFileFlapSafe } = require(path.join(REPO, 'scripts', 'muster-b-write'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'muster-b';
if (!SEEDS.length) { console.error('MUSTER-B STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-24', 'perseed-muster-b');
// Write-flap resilience (2026-11-24): per-seed writes go through
// writeFileFlapSafe (temp sibling + rename, 30 x 10s retries) — a plain
// writeFileSync leaves a 0-byte file on a refused write and every retry
// against that empty path is refused again. mkdirRetry keeps the
// outDir creation resilient the same way.
function mkdirRetry(dir) {
  let last = null;
  for (let attempt = 1; attempt <= 30; attempt++) {
    try { fs.mkdirSync(dir, { recursive: true }); return; }
    catch (e) { last = e; if (!/EPERM|EACCES/.test(String(e.code || e.message))) throw e; }
    try { execSync('sleep 10'); } catch (e) {}
  }
  throw last;
}
mkdirRetry(outDir);
for (const seed of SEEDS) {
  const file = path.join(outDir, 'muster-b-s' + seed + '-muster-b-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('MUSTER-B STOP: refusing to overwrite ' + file); process.exit(3); }
}

const ANCHORED_RE = /THE CALL GOES OUT|answers!|REFUSES|Haven commits its own|steps? forward\.|No one is free to march|already march|does not notice you|you have \d+|counts \d+ blades|muster is hungry|struck .* in the night|fed in the night|fire is quieter/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function linkOther(Game, link) {
  try { if (Game._linkOther) return Game._linkOther(link, 'haven'); } catch (e) {}
  return link.primary === 'haven' ? link.subordinate : link.primary;
}

// Driver-side replication of the engine's judged gate (src/js/titans.js):
// titanMusterReady = titanUniqueAllies.length + valid Haven blades.
// (Copied from closedecay-driver-20261102.js, same comments apply.)
// The engine's own titanMusterReady flag is recorded alongside, so any
// replication drift is visible, not hidden.
function gateDecomposition(Game, errors) {
  const out = { rawAllies: 0, rawHaven: 0, livingAllies: 0, validHaven: 0,
    gateRaw: 0, gateLiving: 0, ready: null, faces: [], havenFaces: [] };
  try {
    let muster = null;
    try { muster = Game.titanMusterState ? Game.titanMusterState('herald') : null; } catch (e) { errors.push('musterState: ' + String(e.message).slice(0, 80)); }
    if (!muster) return out;
    const allies = muster.allies || [];
    const haven = muster.haven || [];
    out.rawAllies = allies.length;
    out.rawHaven = haven.length;
    const seen = {};
    allies.forEach(function (a) {
      if (!a || !a.vid) return;
      const key = a.villageId + ':' + a.vid;
      let person = null;
      try { const ov = Game._otherVillage ? Game._otherVillage(a.villageId) : null; person = ov && (ov.roster || []).find(function (r) { return r.id === a.vid; }); } catch (e) {}
      const rosterAlive = person ? !!person.alive : null;
      const rosterHealth = person ? (person.health === undefined ? null : person.health) : null;
      const living = !!(!seen[key] && (a.hp === undefined || a.hp > 0) && (!person || (person.alive && (person.health === undefined || person.health > 0))));
      if (living) seen[key] = true;
      out.faces.push({ villageId: a.villageId, vid: a.vid, name: a.name || null,
        musterHp: a.hp === undefined ? null : a.hp, rosterAlive: rosterAlive,
        rosterHealth: rosterHealth, living: living, duplicate: !!seen[key] && !living && key in seen });
      if (living) out.livingAllies++;
    });
    out.livingAllies = out.faces.filter(function (f) { return f.living; }).length;
    const roster = ((Game.state || {}).village || {}).roster || [];
    const bearer = Game.villagerId;
    const hseen = {};
    haven.forEach(function (h) {
      const vid = h && (h.vid || h);
      const valid = !!(vid && vid !== bearer && !hseen[vid] && roster.indexOf(vid) >= 0);
      if (valid) hseen[vid] = true;
      out.havenFaces.push({ vid: vid || null, inRoster: vid ? roster.indexOf(vid) >= 0 : false,
        isBearer: vid === bearer, valid: valid });
    });
    out.validHaven = out.havenFaces.filter(function (f) { return f.valid; }).length;
    out.gateRaw = out.rawAllies + out.rawHaven;
    out.gateLiving = out.livingAllies + out.validHaven;
    try { out.ready = Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; } catch (e) { errors.push('ready: ' + String(e.message).slice(0, 80)); }
  } catch (e) { errors.push('gateDecomp: ' + String(e.message).slice(0, 80)); }
  return out;
}

function linkRows(Game, muster, errors) {
  const rows = [];
  try {
    const cfg = ((Game.data || {}).titans || {})._coalition || {};
    const trustedAt = cfg.trustedAt == null ? 70 : cfg.trustedAt;
    const trustedOpinion = cfg.trustedOpinion == null ? 10 : cfg.trustedOpinion;
    const trustedBlades = cfg.trustedBlades || 6;
    const baseBlades = cfg.baseBlades || 2;
    const committed = {};
    if (muster) (muster.allies || []).forEach(function (a) { committed[a.villageId + ':' + a.vid] = true; });
    let links = [];
    try { links = Game.hierarchyState ? (Game.hierarchyState() || []) : []; } catch (e) { errors.push('links: ' + String(e.message).slice(0, 80)); }
    links.filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
      try {
        const vid = linkOther(Game, link);
        let ov = null;
        try { ov = Game._otherVillage ? Game._otherVillage(vid) : null; } catch (e) {}
        const trust = link.trust || 0;
        const opinion = (ov && ov.opinion) || 0;
        const arrears = link.arrears || 0;
        const roster = (ov && ov.roster) || [];
        const freeAdults = roster.filter(function (r) {
          return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
        }).length;
        rows.push({ villageId: vid, name: (ov && ov.name) || null, trust: trust, opinion: opinion,
          arrears: arrears, quota: trust >= trustedAt && opinion >= trustedOpinion ? trustedBlades : baseBlades,
          wouldRefuse: trust < 25 || opinion < -10 || arrears > 0,
          direction: link.primary === 'haven' ? 'primary' : (link.subordinate === 'haven' ? 'subordinate' : 'peer'),
          rosterLen: roster.length, freeAdults: freeAdults,
          alliesHere: muster ? (muster.allies || []).filter(function (a) { return a.villageId === vid; }).length : 0 });
      } catch (e) { errors.push('link-row: ' + String(e.message).slice(0, 80)); }
    });
  } catch (e) { errors.push('linkRows: ' + String(e.message).slice(0, 80)); }
  return rows;
}

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = musterSoundB();
  const { Game } = await loadGame({ seed: seed, mode: 'muster-b', fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  const ht = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const hiUninstall = HI.install(Game, ht);

  let lairTile = null;
  const anchoredLines = [];
  const attemptGateSnaps = [];
  const dailyTrace = [];
  let capturedCtx = null;
  let traceStarted = false;

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 800) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
          }
          const lm = LAIR_RE.exec(arg);
          if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  // Attempt-time gate snapshot (instrument only): wrap startCombat after
  // both instruments installed, chaining through whatever they set.
  try {
    const origSC = Game.startCombat;
    if (typeof origSC === 'function' && !origSC.__musterbWrapped) {
      const wrappedSC = function (mid) {
        try {
          if (mid === 'herald' || (Game.isTitan && Game.isTitan(mid))) {
            attemptGateSnaps.push({ day: gday(Game), mid: mid, gate: gateDecomposition(Game, errors) });
          }
        } catch (e) { errors.push('attempt-snap: ' + String(e.message).slice(0, 80)); }
        return origSC.apply(this, arguments);
      };
      wrappedSC.__musterbWrapped = true;
      Game.startCombat = wrappedSC;
    }
  } catch (e) { errors.push('startCombat-wrap: ' + String(e.message).slice(0, 80)); }

  function heraldMon() {
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  function maybeTrace() {
    try {
      const tc = capturedCtx && capturedCtx.titan;
      if (!tc || !tc.called || typeof tc.called !== 'object') return;
      if (!traceStarted) traceStarted = true;
      const today = gday(Game);
      if (dailyTrace.some(function (r) { return r.day === today; })) return;
      let muster = null;
      try { muster = Game.titanMusterState ? Game.titanMusterState('herald') : null; } catch (e) {}
      const hm = heraldMon();
      const sx = Game.map ? Game.map.px : null, sy = Game.map ? Game.map.py : null;
      const gate = gateDecomposition(Game, errors);
      const v = Game.state.village || {};
      const roster = v.roster || [];
      dailyTrace.push({ day: today, callDay: tc.called.day,
        sameTile: !!(hm && sx != null && hm.tx === sx && hm.ty === sy),
        heraldPresent: !!hm, gate: gate,
        links: linkRows(Game, muster, errors), pantryKcal: pantryKcal(Game),
        rosterLen: roster.length, fallenLen: (v.fallen || []).length });
    } catch (e) { errors.push('maybeTrace: ' + String(e.message).slice(0, 80)); }
  }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
        maybeTrace();
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  let peakBeforeEndCall = null, endUnlockedWave = null, peakAfterEndCall = null;
  try { peakBeforeEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { endUnlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('endUnlockedWave: ' + String(e.message).slice(0, 80)); }
  try { peakAfterEndCall = Game._standingPeakWave ? Game._standingPeakWave() : null; } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  try { hiUninstall(); } catch (e) { errors.push('hi-uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  let national = 0, table = 0;
  try { const r = scaleRank || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) { errors.push('prog: ' + String(e.message).slice(0, 80)); }
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const callDay = (titanCtx && titanCtx.called && typeof titanCtx.called === 'object') ? titanCtx.called.day : null;
  const maxGateRow = dailyTrace.reduce(function (best, r) {
    const g = (r.gate && r.gate.gateLiving != null) ? r.gate.gateLiving : -1;
    return (!best || g > best.gate) ? { day: r.day, gate: g, ready: !!(r.gate && r.gate.ready), allies: r.gate.livingAllies, haven: r.gate.validHaven } : best;
  }, null);
  // Gate at call day itself (trace starts the day after the call if the
  // call sounded during daily; the call-day row may be absent — the
  // analyzer recomputes from attempt snaps + anchored lines too).
  const out = {
    seed: seed, arm: 'muster-b', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    national: national, table: table,
    maxWave: result.maxWaveUnlocked || 1,
    endUnlockedWave: endUnlockedWave,
    peakBeforeEndCall: peakBeforeEndCall, peakAfterEndCall: peakAfterEndCall,
    endCallMovedPeak: (peakBeforeEndCall != null && peakAfterEndCall != null && (peakAfterEndCall | 0) > (peakBeforeEndCall | 0)),
    lairTile: lairTile, callDay: callDay,
    callCount: anchoredLines.filter(function (l) { return /THE CALL GOES OUT/.test(l.line); }).length,
    callLines: anchoredLines.filter(function (l) { return /THE CALL GOES OUT/.test(l.line); }),
    anchoredLines: anchoredLines,
    dailyTrace: dailyTrace, traceDays: dailyTrace.map(function (r) { return r.day; }),
    maxGateRow: maxGateRow,
    attemptGateSnaps: attemptGateSnaps,
    attempts: (ht.attempts || []).filter(function (a) { return a.mid === 'herald'; }).map(function (a) { return { day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null, muster: a.muster || null }; }),
    attemptCount: (ht.attempts || []).filter(function (a) { return a.mid === 'herald'; }).length,
    deaths: ((result.samples || {}).deaths || []).length,
    daily: t.daily, killEvents: t.killEvents, deathEvents: t.deathEvents,
    feastEvents: t.feastEvents, standingLines: t.standingLines, releaseLines: t.releaseLines, saySample: t.saySample,
    fieldFights: t.fieldFights, tbStarts: t.tbStarts, tbKillCtx: t.tbKillCtx,
    refusals: t.refusals, tbEnds: t.tbEnds,
    refusalSayLines: t.refusalSayLines, refusalSayCount: t.refusalSayCount,
    wrapCounts: t.wrapCounts,
    titanCtx: titanCtx,
    mustercloseCtx: capturedCtx ? (capturedCtx.musterclose || null) : null,
    mustergapCtx: capturedCtx ? (capturedCtx.mustergap || null) : null,
    commitrefreshCtx: capturedCtx ? (capturedCtx.commitrefresh || null) : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'muster-b-s' + seed + '-muster-b-' + RUN + '.json');
    writeFileFlapSafe(file, JSON.stringify(out, null, 2) + '\n');
    const s = out.maxGateRow;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      scaleRank: out.scaleRank, maxWave: out.maxWave, endUnlockedWave: out.endUnlockedWave,
      lairTile: out.lairTile, callDay: out.callDay, callCount: out.callCount,
      maxGate: s ? s.gate : null, maxGateDay: s ? s.day : null,
      maxGateReady: s ? s.ready : null, maxAllies: s ? s.allies : null, maxHaven: s ? s.haven : null,
      traceDays: out.dailyTrace.length, attemptCount: out.attemptCount,
      refusals: (out.refusals || []).length,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
