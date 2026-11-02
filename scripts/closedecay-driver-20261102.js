#!/usr/bin/env node
// closedecay-driver-20261102.js — daily muster trace for sim-closedecay-a
// (Loop A 20261102, axis scale-onramp, blank (4) from 1155Z review).
// One process per seed; never two harnesses in one process. Prints one
// JSON summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-02/perseed-closedecay-a/ (sims write once, on
// purpose, into evidence/<date>/).
//
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read link,
// muster, and roster state to record the trace (same dispensation as the
// mustergap/musterclose drivers). The POLICIES (titanroute.js,
// musterclose.js, mustergap.js) may NOT — they decide only from heard
// lines, their own tile, their own muster record, and (musterclose) their
// own links' trust/opinion/arrears and pantry. Arm:
//   closecommit = titanroute stack + musterclose deepening leg
//     (recovered verbatim from deleted musterclose branch commit
//     ef378b534 — diagnosis reproduction only) + mustergap one-episode
//     commit-own leg. Zero src/js changes.
//   refresh      = closecommit + commitrefresh re-commit-on-drop leg
//     (prototype measured against closecommit on identical seeds).
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=closecommit DAYS=180 SEEDS=97330 RUN=r1 node scripts/closedecay-driver-20261102.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));
const CR = require(path.join(REPO, 'scripts', 'policies', 'commitrefresh'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`CLOSEDECAY STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'closecommit';
if (ARM !== 'closecommit' && ARM !== 'refresh') { console.error('CLOSEDECAY STOP: ARM must be closecommit|refresh.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
const DIAG = process.env.DIAG === '1';
const DIAG_RE = /Aroha|Vera|Nora|falls\.|has died|died of|starv|buried|🪦|☠|💀/;
if (!SEEDS.length) { console.error('CLOSEDECAY STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { /* anchor stays unknown */ }

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  const mg = MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
  if (ARM === 'refresh') return CR.withCommitRefresh(mg, 'lead-commitrefresh', 'lead-musterclose-commit + commitrefresh');
  return mg;
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
// titanUniqueAllies: dedup by villageId:vid, drop muster-hp <= 0, drop
// roster person not alive or health <= 0. titanHavenBlades: in Haven
// roster, not the bearer, dedup. The engine's own titanMusterReady flag
// is recorded alongside, so any replication drift is visible, not hidden.
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
    // Recompute livingAllies from the faces list (dedup-safe): count living flags.
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
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  let lairTile = null;
  const anchoredLines = [];
  const deathLines = [];
  const errors = [];
  const attemptGateSnaps = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 800) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
          }
          if (DIAG && deathLines.length < 1000) {
            try {
              const tc0 = capturedCtx && capturedCtx.titan;
              if (tc0 && tc0.called && typeof tc0.called === 'object' && DIAG_RE.test(arg)) {
                deathLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
              }
            } catch (e) { /* never break narration */ }
          }
          const lm = LAIR_RE.exec(arg);
          if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  // Attempt-time gate snapshot (instrument only): wrap startCombat after
  // the herald instrument installed, chaining through whatever it set.
  try {
    const origSC = Game.startCombat;
    if (typeof origSC === 'function' && !origSC.__closedecayWrapped) {
      const wrappedSC = function (mid) {
        try {
          if (mid === 'herald' || (Game.isTitan && Game.isTitan(mid))) {
            attemptGateSnaps.push({ day: gday(Game), mid: mid, gate: gateDecomposition(Game, errors) });
          }
        } catch (e) { errors.push('attempt-snap: ' + String(e.message).slice(0, 80)); }
        return origSC.apply(this, arguments);
      };
      wrappedSC.__closedecayWrapped = true;
      Game.startCombat = wrappedSC;
    }
  } catch (e) { errors.push('startCombat-wrap: ' + String(e.message).slice(0, 80)); }

  function heraldMon() {
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  const dailyTrace = [];
  let capturedCtx = null;
  let traceStarted = false;
  let trackedVids = [];
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
      if (!trackedVids.length) {
        trackedVids = gate.havenFaces.map(function (f) { return f.vid; }).filter(Boolean);
      }
      const row = { day: today, callDay: tc.called.day,
        sameTile: !!(hm && sx != null && hm.tx === sx && hm.ty === sy),
        heraldPresent: !!hm, gate: gate,
        links: linkRows(Game, muster, errors), pantryKcal: pantryKcal(Game) };
      if (DIAG) {
        try {
          const v = Game.state.village || {};
          const roster = v.roster || [];
          row.rosterWatch = { bearer: Game.villagerId || null, rosterLen: roster.length,
            committed: v.titanCommitted || {},
            tracked: trackedVids.map(function (vid) {
              return { vid: vid, inRoster: roster.indexOf(vid) >= 0, isBearer: vid === Game.villagerId };
            }),
            fallen: (v.fallen || []).slice(-20) };
        } catch (e) { errors.push('rosterWatch: ' + String(e.message).slice(0, 80)); }
      }
      dailyTrace.push(row);
    } catch (e) { errors.push('maybeTrace: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { maybeTrace(); }
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) { errors.push('rank: ' + String(e.message).slice(0, 80)); }
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) { errors.push('prog: ' + String(e.message).slice(0, 80)); }
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) { /* won stays 0 */ }
  const gameDays = (st.scholar && st.scholar.day) || 0;
  const maxWave = result.maxWaveUnlocked || 1;
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const mcCtx = capturedCtx ? (capturedCtx.musterclose || null) : null;
  const mgCtx = capturedCtx ? (capturedCtx.mustergap || null) : null;
  const crCtx = capturedCtx ? (capturedCtx.commitrefresh || null) : null;
  const callDay = (titanCtx && titanCtx.called && typeof titanCtx.called === 'object') ? titanCtx.called.day : null;
  const out = { seed, arm: ARM, run: RUN, anchorCommit: ANCHOR,
    lairTile: lairTile, callDay: callDay,
    dailyTrace: dailyTrace,
    traceDays: dailyTrace.map(function (r) { return r.day; }),
    attemptGateSnaps: attemptGateSnaps,
    attempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    attemptCount: att.length,
    callLines: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)),
    callCount: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)).length,
    anchoredLines: anchoredLines,
    deathLines: deathLines,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, table: table, won: won,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    deaths: ((result.samples || {}).deaths || []).length,
    errors: errors.concat(t.instrumentErrors || []),
    titanCtx: titanCtx, mustercloseCtx: mcCtx, mustergapCtx: mgCtx, commitrefreshCtx: crCtx };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-closedecay-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `cd-${ARM}-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const callRow = rec.dailyTrace.find(function (r) { return r.day === rec.callDay; });
    const line = { seed: rec.seed, arm: rec.arm, run: rec.run, callDay: rec.callDay,
      callGateRaw: callRow ? callRow.gate.gateRaw : null,
      callGateLiving: callRow ? callRow.gate.gateLiving : null,
      callReady: callRow ? callRow.gate.ready : null,
      traceDays: rec.dailyTrace.length,
      attemptCount: rec.attemptCount,
      attempts: rec.attempts,
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
