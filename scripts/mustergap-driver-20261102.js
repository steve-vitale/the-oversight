#!/usr/bin/env node
// mustergap-driver-20261102.js — audit driver for sim-mustergap-b (Loop B
// 20261102T1030Z, axis scale-onramp). One process per seed-arm; never two
// harnesses in one process. Prints one JSON summary line per seed to stdout
// and writes one per-seed JSON file into evidence/2026-11-02/perseed-
// mustergap-b/ (sims write once, on purpose, into evidence/<date>/).
//
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read link,
// muster, and roster state to record the audit snapshot. The POLICIES
// (titanroute.js, mustergap.js) may NOT — they decide only from heard
// lines, their own tile, and their own muster record. Arms:
//   route = titanroute pilot stack (baseline for this audit)
//   gap   = route + mustergap commit-own leg
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=route DAYS=180 SEEDS=97301,97310 node scripts/mustergap-driver-20261102.js
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
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`MUSTERGAP STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'route';
if (ARM !== 'route' && ARM !== 'gap' && ARM !== 'gap2') { console.error('MUSTERGAP STOP: ARM must be route|gap|gap2.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
if (!SEEDS.length) { console.error('MUSTERGAP STOP: SEEDS required.'); process.exit(2); }
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
  if (ARM === 'gap' || ARM === 'gap2') return MG.withMusterGap(rt, 'lead-mustergap', 'lead-titanroute + mustergap commit-own');
  return rt;
}

const ANCHORED_RE = /THE CALL GOES OUT|answers!|REFUSES|Haven commits its own|steps? forward\.|No one is free to march|already march/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function linkOther(Game, link) {
  try { if (Game._linkOther) return Game._linkOther(link, 'haven'); } catch (e) {}
  return link.primary === 'haven' ? link.subordinate : link.primary;
}

function snapshot(Game, errors) {
  // DRIVER-ONLY reads: links, allied rosters, own volunteers, muster.
  const snap = { links: [], muster: null, volunteers: null };
  try {
    const cfg = ((Game.data || {}).titans || {})._coalition || {};
    const trustedAt = cfg.trustedAt == null ? 70 : cfg.trustedAt;
    const trustedOpinion = cfg.trustedOpinion == null ? 10 : cfg.trustedOpinion;
    const trustedBlades = cfg.trustedBlades || 6;
    const baseBlades = cfg.baseBlades || 2;
    let muster = null;
    try { muster = Game.titanMusterState ? Game.titanMusterState('herald') : null; } catch (e) {}
    const committed = {};
    if (muster) (muster.allies || []).forEach(function (a) { committed[a.villageId + ':' + a.vid] = true; });
    let links = [];
    try { links = Game.hierarchyState ? (Game.hierarchyState() || []) : []; } catch (e) { errors.push('links: ' + String(e.message).slice(0, 80)); }
    snap.linkTotal = links.length;
    snap.linksActive = links.filter(function (l) { return l && l.status === 'active'; }).length;
    links.filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
      try {
        const vid = linkOther(Game, link);
        let ov = null;
        try { ov = Game._otherVillage ? Game._otherVillage(vid) : null; } catch (e) {}
        const trust = link.trust || 0;
        const opinion = (ov && ov.opinion) || 0;
        const arrears = link.arrears || 0;
        const wouldRefuse = trust < 25 || opinion < -10 || arrears > 0;
        const quota = trust >= trustedAt && opinion >= trustedOpinion ? trustedBlades : baseBlades;
        const roster = (ov && ov.roster) || [];
        const freeAdults = roster.filter(function (r) {
          return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
        }).length;
        snap.links.push({ villageId: vid, name: (ov && ov.name) || null, trust: trust, opinion: opinion,
          arrears: arrears, quota: quota, wouldRefuse: wouldRefuse,
          rosterLen: roster.length, freeAdults: freeAdults, rosterPresent: roster.length > 0,
          alliesHere: muster ? (muster.allies || []).filter(function (a) { return a.villageId === vid; }).length : 0 });
      } catch (e) { errors.push('link-snap: ' + String(e.message).slice(0, 80)); }
    });
    if (muster) {
      snap.muster = { allies: (muster.allies || []).map(function (a) { return { villageId: a.villageId, name: a.name }; }),
        alliesN: (muster.allies || []).length,
        haven: (muster.haven || []).map(function (h) { return h.vid || h; }),
        havenN: (muster.haven || []).length };
    }
    try {
      const vols = Game.titanVolunteers ? Game.titanVolunteers() : null;
      if (vols) {
        snap.volunteers = { n: vols.length, names: vols.slice(0, 10).map(function (id) {
          try { return Game.displayName ? String(Game.displayName(id)).split(' ')[0] : id; } catch (e) { return id; }
        }) };
      }
    } catch (e) { errors.push('volunteers: ' + String(e.message).slice(0, 80)); }
    try { snap.ready = Game.titanMusterReady ? !!Game.titanMusterReady('herald') : null; } catch (e) {}
  } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
  return snap;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  let lairTile = null;
  const anchoredLines = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          if (ANCHORED_RE.test(arg) && anchoredLines.length < 400) {
            anchoredLines.push({ day: gday(Game), line: String(arg).slice(0, 500) });
          }
          const lm = LAIR_RE.exec(arg);
          if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  function heraldMon() {
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      return (mons || []).find(function (m) { return m && m.id === 'herald'; }) || null;
    } catch (e) { return null; }
  }

  const samples = [];
  let capturedCtx = null;
  const snaps = {};
  function sample(phase) {
    try {
      const hm = heraldMon();
      const sx = Game.map ? Game.map.px : null, sy = Game.map ? Game.map.py : null;
      samples.push({ day: gday(Game), phase: phase, sx: sx, sy: sy,
        htx: hm ? hm.tx : null, hty: hm ? hm.ty : null,
        same: !!(hm && sx != null && hm.tx === sx && hm.ty === sy),
        present: !!hm });
    } catch (e) { errors.push('sample: ' + String(e.message).slice(0, 80)); }
  }
  function maybeSnap() {
    try {
      const tc = capturedCtx && capturedCtx.titan;
      if (!tc || !tc.called || typeof tc.called !== 'object') return;
      const callDay = tc.called.day;
      const today = gday(Game);
      if (today === callDay && !snaps.callDay) snaps.callDay = { day: today, snap: snapshot(Game, errors) };
      if (today === callDay + 2 && !snaps.callDayPlus2) snaps.callDayPlus2 = { day: today, snap: snapshot(Game, errors) };
    } catch (e) { errors.push('maybeSnap: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
    upkeep(Gm, ctx) { sample('upkeep'); if (policy.upkeep) return policy.upkeep(Gm, ctx); },
    daily(Gm, ctx) {
      sample('daily-pre');
      try { return policy.daily(Gm, ctx); } finally { sample('daily-post'); maybeSnap(); }
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
  const shareDays = [];
  const shareSeen = {};
  for (const s of samples) {
    if (s.same && !shareSeen[s.day]) { shareSeen[s.day] = true; shareDays.push(s.day); }
  }
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const mgCtx = capturedCtx ? (capturedCtx.mustergap || null) : null;
  const out = { seed, arm: ARM, anchorCommit: ANCHOR,
    lairTile: lairTile,
    shareDays: shareDays, shareCount: shareDays.length,
    attempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    attemptCount: att.length,
    callLines: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)),
    callCount: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)).length,
    anchoredLines: anchoredLines,
    snapshots: snaps,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, table: table, won: won,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    deaths: ((result.samples || {}).deaths || []).length,
    errors: errors.concat(t.instrumentErrors || []),
    titanCtx: titanCtx, mustergapCtx: mgCtx };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-mustergap-b');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `mg-${ARM}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const line = { seed: rec.seed, arm: rec.arm, lairTile: rec.lairTile,
      shareCount: rec.shareCount, shareDays: rec.shareDays,
      attemptCount: rec.attemptCount, callCount: rec.callCount,
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
