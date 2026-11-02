#!/usr/bin/env node
// stancelayer-replay-20261102.js — stance-layer trace for
// sim-stancelayer-a (Loop A 20261102T0915Z, axis scale-onramp).
// Extends scripts/locatedengage-replay-20261102.js with the SAME frozen
// policy stack, env flags, herald-v1 instrument, and DAYS=180 cap, plus
// the stance layer (pre-registered in
// evidence/2026-11-02/sim-stancelayer-a-prereg.md):
//  (1) a read-only Game.monsterTurn bracket: a call row is recorded
//      ONLY when the herald is the playerMonster() (tile-shared)
//      before the call — pre/post stance, watchTurns, cautiousTurns,
//      warnTurns, turns, lostSight, scholar/herald detail cells,
//      Chebyshev detail distance, coincidence flag, _sleeping flag,
//      havenTier(), still-shared flag, and herald attempt delta
//      during the call;
//  (2) travelTo arrival rows: whenever a travelTo lands the scholar
//      on the herald's CURRENT tile, the arrival state (scholar
//      detail entry cell, herald detail cells, distance, stance,
//      watchTurns, lostSight) is recorded before any monsterTurn
//      runs on that tile;
//  (3) pre/post daily trace rows gain herald watchTurns, lostSight,
//      detail-coincidence flag, havenTier, _sleeping.
// DIAG ONLY: zero src/js changes, nothing sounded, deferred, or
// mutated by this replay beyond the base policy. The wraps read only
// (no RNG consumed, no game state written), so 0815Z milestones must
// reproduce. STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "sl": {...}}`) to stdout and writes NOTHING itself.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97301 node scripts/stancelayer-replay-20261102.js > evidence/2026-11-02/perseed-stancelayer-a/run.stdout 2> evidence/2026-11-02/perseed-stancelayer-a/run.stderr
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
  if (process.env[k] !== '1') { console.error(`STANCELAYER STOP: ${k}=1 is required.`); process.exit(2); }
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
  const arrivalRows = [];
  const monsterTurnCalls = [];
  const readinessRows = [];
  const interceptorErrors = [];
  const travelErrors = [];
  const mtErrors = [];
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
      let hWatch = null, hLost = null, hTurns = null, hTier = null, sleeping = null, coinc = null;
      try { hWatch = hm ? (hm.watchTurns != null ? hm.watchTurns : null) : null; } catch (e) {}
      try { hLost = hm ? (hm.lostSight != null ? hm.lostSight : null) : null; } catch (e) {}
      try { hTurns = hm ? (hm.turns != null ? hm.turns : null) : null; } catch (e) {}
      try { hTier = (typeof Game.havenTier === 'function') ? Game.havenTier() : null; } catch (e) {}
      try { sleeping = !!Game._sleeping; } catch (e) {}
      try { coinc = (hm && smx != null && hm.mx != null) ? (smx === hm.mx && smy === hm.my) : null; } catch (e) {}
      traces.push({ day: day, phase: phase, sx: sx, sy: sy, hx: hx, hy: hy,
        htx: hm ? hm.tx : null, hty: hm ? hm.ty : null,
        hmx: hm ? (hm.mx != null ? hm.mx : null) : null,
        hmy: hm ? (hm.my != null ? hm.my : null) : null,
        hstance: hm ? (hm.stance || null) : null,
        hWatch: hWatch, hLost: hLost, hTurns: hTurns,
        detailCoincide: coinc, havenTier: hTier, sleeping: sleeping,
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
        // ARRIVAL ROW: landed on the herald's CURRENT tile (not the lair
        // tile) — the state a march policy starts from, before any
        // monsterTurn runs on that tile.
        try {
          if (kind === 'moved' && after && hmAfter && after.x === hmAfter.tx && after.y === hmAfter.ty) {
            const hmA = heraldMon(Game);
            const stA = Game.state || {};
            arrivalRows.push({ day: day, tile: { x: after.x, y: after.y },
              smx: (stA.scholar && stA.scholar.mx != null) ? stA.scholar.mx : null,
              smy: (stA.scholar && stA.scholar.my != null) ? stA.scholar.my : null,
              hmx: hmA ? (hmA.mx != null ? hmA.mx : null) : null,
              hmy: hmA ? (hmA.my != null ? hmA.my : null) : null,
              stance: hmA ? (hmA.stance || null) : null,
              watch: hmA ? (hmA.watchTurns != null ? hmA.watchTurns : null) : null,
              lost: hmA ? (hmA.lostSight != null ? hmA.lostSight : null) : null,
              stack: stack });
          }
        } catch (e) { travelErrors.push('arrival log: ' + String((e && e.message) || e).slice(0, 120)); }
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

  // MONSTERTURN WRAP (read-only): record a call row ONLY when the
  // herald is the playerMonster() (tile-shared) before the call.
  // The wrap consumes no RNG and writes no game state.
  try {
    const origMT = Game.monsterTurn;
    Game.monsterTurn = function () {
      let pre = null;
      try {
        const pm = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null;
        if (pm && pm.id === 'herald' && pm.mx !== undefined) {
          const st0 = Game.state || {};
          const s0 = st0.scholar || {};
          pre = { stance: pm.stance || null,
            watch: pm.watchTurns != null ? pm.watchTurns : null,
            caut: pm.cautiousTurns != null ? pm.cautiousTurns : null,
            warn: pm.warnTurns != null ? pm.warnTurns : null,
            turns: pm.turns != null ? pm.turns : null,
            lost: pm.lostSight != null ? pm.lostSight : null,
            smx: s0.mx != null ? s0.mx : null, smy: s0.my != null ? s0.my : null,
            hmx: pm.mx, hmy: pm.my,
            dist: Math.max(Math.abs((s0.mx ?? 4) - pm.mx), Math.abs((s0.my ?? 4) - pm.my)),
            coinc: (s0.mx === pm.mx && s0.my === pm.my),
            tile: (Game.map ? { x: Game.map.px, y: Game.map.py } : null) };
        }
      } catch (e) { mtErrors.push('mt pre: ' + String((e && e.message) || e).slice(0, 120)); }
      const attBefore = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; }).length;
      let tableActive = null;
      try { tableActive = (typeof Game.tableActive === 'function') ? !!Game.tableActive() : null; } catch (e) {}
      let r;
      try { r = origMT.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (pre) {
          const attAfter = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; }).length;
          const hm1 = heraldMon(Game);
          const st1 = Game.state || {};
          const s1 = st1.scholar || {};
          let tier = null, sleeping = null;
          try { tier = (typeof Game.havenTier === 'function') ? Game.havenTier() : null; } catch (e) {}
          try { sleeping = !!Game._sleeping; } catch (e) {}
          monsterTurnCalls.push({ day: gday(Game), sleeping: sleeping, havenTier: tier, tableActive: tableActive,
            pre: pre,
            post: { stance: hm1 ? (hm1.stance || null) : null,
              watch: hm1 ? (hm1.watchTurns != null ? hm1.watchTurns : null) : null,
              caut: hm1 ? (hm1.cautiousTurns != null ? hm1.cautiousTurns : null) : null,
              warn: hm1 ? (hm1.warnTurns != null ? hm1.warnTurns : null) : null,
              turns: hm1 ? (hm1.turns != null ? hm1.turns : null) : null,
              lost: hm1 ? (hm1.lostSight != null ? hm1.lostSight : null) : null,
              smx: s1.mx != null ? s1.mx : null, smy: s1.my != null ? s1.my : null,
              hmx: hm1 ? (hm1.mx != null ? hm1.mx : null) : null,
              hmy: hm1 ? (hm1.my != null ? hm1.my : null) : null,
              dist: (hm1 && hm1.mx != null && s1.mx != null) ? Math.max(Math.abs(s1.mx - hm1.mx), Math.abs(s1.my - hm1.my)) : null,
              coinc: (hm1 && s1.mx != null) ? (s1.mx === hm1.mx && s1.my === hm1.my) : null,
              present: !!hm1,
              tile: (Game.map ? { x: Game.map.px, y: Game.map.py } : null) },
            attemptDelta: attAfter - attBefore });
        }
      } catch (e) { mtErrors.push('mt post: ' + String((e && e.message) || e).slice(0, 120)); }
      return r;
    };
  } catch (e) { mtErrors.push('mt wrap: ' + String((e && e.message) || e).slice(0, 120)); }

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
    traces: traces, travelEvents: travelEvents, arrivalRows: arrivalRows, monsterTurnCalls: monsterTurnCalls, lairTile: lairTile,
    milestones: milestones,
    transcript: transcript, anchoredLines: anchoredLines,
    instrumentTranscripts: (t.transcripts || []).map(x => ({ cls: x.cls, day: x.day, sayDuring: x.sayDuring || [] })),
    instrumentErrors: t.instrumentErrors, interceptorErrors: interceptorErrors, travelErrors: travelErrors, mtErrors: mtErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endOmen: endOmen, endLinks: endLinks, endPend: endPend, endPendMid: endPendMid,
    deaths };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('STANCELAYER STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, sl: r }));
      console.error(`done s${seed}: attempts=${r.attemptCount} lair=${r.lairTile ? r.lairTile.x + ',' + r.lairTile.y : 'none'} wave4day=${r.milestones.wave4Day} stage2=${r.milestones.omenStage2Day} present=${r.milestones.firstPresentDay}..${r.milestones.lastPresentDay} traces=${r.traces.length} travel=${r.travelEvents.length} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.interceptorErrors.length}+${r.travelErrors.length}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
