#!/usr/bin/env node
// laircontact-driver-20261102.js — daily lair-contact trace for
// sim-laircontact-a (Loop A 20261102, axis scale-onramp). One process
// per seed; never two harnesses in one process. Prints one JSON
// summary line per seed to stdout and writes one per-seed JSON file
// into evidence/2026-11-02/perseed-laircontact-a/ (sims write once,
// on purpose, into evidence/<date>/).
//
// CORRECTION THIS DRIVER EXISTS TO TEST: the musterupkeep evidence
// says fed scholars "never end a day on the lair tile", but its own
// records show fed marches ARRIVING at the lair (26/18 days) with
// zero herald startCombat attempts. This driver therefore records,
// per day from call to end: scholar tile, heard lair tile, herald
// monster tile (driver-side worldMonsters read — instrument only),
// scholar↔herald distance, onLair, coLocated, the day's march
// record + guard block, scholar kcal/hydration/health, pack kcal/kg
// vs carry capacity, pantry kcal, gate decomposition, and link rows.
// Attempt rows are kept IN FULL (day, cls, reason, caller, stackTop,
// scholarPos, entityPos, pending flags) — prior drivers dropped
// positions/caller, which is exactly what this question needs.
// INSTRUMENT/POLICY SEPARATION: this driver (instrument) MAY read
// link, muster, monster, and roster state to record the trace. The
// POLICIES may NOT — they decide only from heard lines, their own
// tile, their own muster record, and (musterfed/lairsham) the pack
// verb.
// Arms: closecommit | musterfed | lairsham | lairnoise, all sharing
// the closecommit stack (titanroute + musterclose + mustergap).
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   ARM=closecommit DAYS=180 SEEDS=97330 RUN=r1 node scripts/laircontact-driver-20261102.js
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
const MF = require(path.join(REPO, 'scripts', 'policies', 'musterfed'));
const SH = require(path.join(REPO, 'scripts', 'policies', 'lairsham'));
const NZ = require(path.join(REPO, 'scripts', 'policies', 'lairnoise'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`LAIRCONTACT STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || 'closecommit';
if (ARM !== 'closecommit' && ARM !== 'musterfed' && ARM !== 'lairsham' && ARM !== 'lairnoise') {
  console.error('LAIRCONTACT STOP: ARM must be closecommit|musterfed|lairsham|lairnoise.'); process.exit(2);
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
if (!SEEDS.length) { console.error('LAIRCONTACT STOP: SEEDS required.'); process.exit(2); }
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
  if (ARM === 'musterfed') return MF.withMusterFed(mg, 'lead-musterfed', 'lead-musterclose-commit + musterfed');
  if (ARM === 'lairsham') return SH.withLairSham(mg, 'lead-lairsham', 'lead-musterclose-commit + lairsham');
  if (ARM === 'lairnoise') return NZ.withLairNoise(mg, 'lead-lairnoise', 'lead-musterclose-commit + lairnoise');
  return mg;
}

const ANCHORED_RE = /THE CALL GOES OUT|answers!|REFUSES|Haven commits its own|steps? forward\.|No one is free to march|already march|does not notice you|you have \d+|counts \d+ blades|muster is hungry|struck .* in the night|fed in the night|fire is quieter|Packed:/;
const LAIR_RE = /Scouts found its lair — tile (\d+),(\d+)/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function linkOther(Game, link) {
  try { if (Game._linkOther) return Game._linkOther(link, 'haven'); } catch (e) {}
  return link.primary === 'haven' ? link.subordinate : link.primary;
}

// Driver-side replication of the engine's judged gate (src/js/titans.js),
// copied from the musterupkeep driver: titanUniqueAllies + titanHavenBlades.
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

function packKcal(Game) {
  try { if (typeof Game.playerPackKcal === 'function') return Game.playerPackKcal(); } catch (e) {}
  return 0;
}

function packKg(Game) {
  try {
    let kg = ((Game.state.scholar || {}).inventory || [])
      .reduce(function (t, i) { return t + (i.kg || 0) * (i.units || 1); }, 0);
    try { if (typeof Game.waterWeight === 'function') kg += Game.waterWeight(); } catch (e) {}
    return kg;
  } catch (e) { return 0; }
}

function carryCap(Game) {
  try { if (typeof Game.carryCapacity === 'function') return Game.carryCapacity(); } catch (e) {}
  return null;
}

function heraldTile(Game) {
  try {
    const mons = Game.worldMonsters ? Game.worldMonsters() : [];
    const h = (mons || []).find(function (m) { return m && m.id === 'herald'; });
    return h ? { x: h.tx, y: h.ty } : null;
  } catch (e) { return null; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);

  let lairTile = null;
  const anchoredLines = [];
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
          const lm = LAIR_RE.exec(arg);
          if (lm && !lairTile) lairTile = { x: parseInt(lm[1], 10), y: parseInt(lm[2], 10) };
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origSC = Game.startCombat;
    if (typeof origSC === 'function' && !origSC.__laircontactWrapped) {
      const wrappedSC = function (mid) {
        try {
          if (mid === 'herald' || (Game.isTitan && Game.isTitan(mid))) {
            attemptGateSnaps.push({ day: gday(Game), mid: mid, gate: gateDecomposition(Game, errors) });
          }
        } catch (e) { errors.push('attempt-snap: ' + String(e.message).slice(0, 80)); }
        return origSC.apply(this, arguments);
      };
      wrappedSC.__laircontactWrapped = true;
      Game.startCombat = wrappedSC;
    }
  } catch (e) { errors.push('startCombat-wrap: ' + String(e.message).slice(0, 80)); }

  const dailyTrace = [];
  let capturedCtx = null;
  function maybeTrace() {
    try {
      const tc = capturedCtx && capturedCtx.titan;
      if (!tc || !tc.called || typeof tc.called !== 'object') return;
      const today = gday(Game);
      if (dailyTrace.some(function (r) { return r.day === today; })) return;
      let muster = null;
      try { muster = Game.titanMusterState ? Game.titanMusterState('herald') : null; } catch (e) {}
      const ht = heraldTile(Game);
      const sx = Game.map ? Game.map.px : null, sy = Game.map ? Game.map.py : null;
      const lt = (tc.lair || lairTile) || null;
      const marches = (tc.marches || []).filter(function (m) { return m.day === today; });
      const gb = (tc.lastGuardBlock && tc.lastGuardBlock.day === today) ? tc.lastGuardBlock : null;
      const s = (Game.state || {}).scholar || {};
      var outerRec = null;
      try {
        if (ARM === 'musterfed') { const mf = capturedCtx.musterfed; if (mf && mf.packs) outerRec = mf.packs.filter(function (p) { return p.day === today; }).slice(-1)[0] || null; }
        else if (ARM === 'lairsham') { const sh = capturedCtx.lairsham; if (sh && sh.packs) outerRec = sh.packs.filter(function (p) { return p.day === today; }).slice(-1)[0] || null; }
        else if (ARM === 'lairnoise') { const nz = capturedCtx.lairnoise; if (nz && nz.draws) outerRec = nz.draws.filter(function (d) { return d.day === today; }).slice(-1)[0] || null; }
      } catch (e) { /* outer record stays null */ }
      const row = { day: today, callDay: tc.called.day,
        scholarTile: (sx == null ? null : { x: sx, y: sy }),
        lairTile: lt, heraldTile: ht,
        distScholarHerald: (sx == null || !ht) ? null : (Math.abs(sx - ht.x) + Math.abs(sy - ht.y)),
        onLair: !!(lt && sx === lt.x && sy === lt.y),
        coLocated: !!(ht && sx === ht.x && sy === ht.y),
        march: marches.length ? marches[marches.length - 1] : null,
        guardBlock: gb,
        scholarKcal: (s.kcal == null ? null : s.kcal),
        scholarHydration: (s.hydration == null ? null : s.hydration),
        scholarHealth: (s.health != null ? s.health : (s.hp != null ? s.hp : null)),
        packKcal: packKcal(Game), packKg: packKg(Game), carryCap: carryCap(Game),
        gate: gateDecomposition(Game, errors),
        links: linkRows(Game, muster, errors), pantryKcal: pantryKcal(Game), outerRec: outerRec };
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
  const att = (t.attempts || []).filter(a => a.mid === 'herald').map(function (a) {
    // Full attempt row minus the bulky gameOutcomes dump; sayDuring kept for refusals.
    return { day: a.day, mid: a.mid, wave: a.wave, aggression: a.aggression, titan: a.titan,
      caller: a.caller, stackTop: a.stackTop, cls: a.cls, reason: a.reason,
      liveBefore: a.liveBefore, pendingBefore: a.pendingBefore, pendingMidBefore: a.pendingMidBefore,
      pendingAfter: a.pendingAfter, pendingMidAfter: a.pendingMidAfter,
      scholarPos: a.scholarPos, entityPos: a.entityPos, entityHp: a.entityHp,
      muster: a.muster, sayDuring: a.sayDuring || [] };
  });
  const titanCtx = capturedCtx ? (capturedCtx.titan || null) : null;
  const mcCtx = capturedCtx ? (capturedCtx.musterclose || null) : null;
  const mgCtx = capturedCtx ? (capturedCtx.mustergap || null) : null;
  const mfCtx = capturedCtx ? (capturedCtx.musterfed || null) : null;
  const shCtx = capturedCtx ? (capturedCtx.lairsham || null) : null;
  const nzCtx = capturedCtx ? (capturedCtx.lairnoise || null) : null;
  const callDay = (titanCtx && titanCtx.called && typeof titanCtx.called === 'object') ? titanCtx.called.day : null;
  const out = { seed, arm: ARM, run: RUN, anchorCommit: ANCHOR,
    lairTile: lairTile, callDay: callDay,
    dailyTrace: dailyTrace,
    traceDays: dailyTrace.map(function (r) { return r.day; }),
    attemptGateSnaps: attemptGateSnaps,
    attempts: att,
    attemptCount: att.length,
    callLines: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)),
    callCount: anchoredLines.filter(l => /THE CALL GOES OUT/.test(l.line)).length,
    anchoredLines: anchoredLines,
    maxWave: maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national: national, table: table, won: won,
    days: result.days, gameDays: gameDays, endReason: result.endReason,
    deaths: ((result.samples || {}).deaths || []).length,
    errors: errors.concat(t.instrumentErrors || []),
    titanCtx: titanCtx, mustercloseCtx: mcCtx, mustergapCtx: mgCtx, musterfedCtx: mfCtx,
    lairshamCtx: shCtx, lairnoiseCtx: nzCtx };
  return out;
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-laircontact-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `lc-${ARM}-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    const callRow = rec.dailyTrace.find(function (r) { return r.day === rec.callDay; });
    const win = rec.dailyTrace.filter(function (r) { return r.day >= rec.callDay; });
    const line = { seed: rec.seed, arm: rec.arm, run: rec.run, callDay: rec.callDay,
      callGateRaw: callRow ? callRow.gate.gateRaw : null,
      callGateLiving: callRow ? callRow.gate.gateLiving : null,
      callReady: callRow ? callRow.gate.ready : null,
      traceDays: rec.dailyTrace.length,
      attemptCount: rec.attemptCount,
      attempts: rec.attempts.map(function (a) { return { day: a.day, cls: a.cls, reason: a.reason, caller: a.caller,
        scholarPos: a.scholarPos, entityPos: a.entityPos }; }),
      coLocatedDays: win.filter(function (r) { return r.coLocated; }).map(function (r) { return r.day; }),
      onLairDays: win.filter(function (r) { return r.onLair; }).map(function (r) { return r.day; }),
      maxWave: rec.maxWave, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, deaths: rec.deaths,
      file: path.relative(REPO, file) };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
