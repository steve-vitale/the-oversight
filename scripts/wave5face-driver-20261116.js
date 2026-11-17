// wave5face-driver-20261116.js — JUDGED driver, arm sim-wave5face-b
// (DIAG follow-up: seed 102706 released on the final day (d151) — does
// it face wave 5? tracker blank #8). Per-seed, per-day gated + raw
// standing with the stand199 breakdown (REUSED instrument), PLUS a
// wave-5 engagement entry point: a wrap on Game.recordDeedFight (the
// choke point every real blow-by-blow fight flows through —
// progression.js:652, fed by the startCombat / recordWaveKill /
// fieldFight deed wraps) that records each NEW distinct wave-5 monster
// faced, with day, standing, living-veteran count, and an outcome
// resolved at end of run from state.waveKillLog + the run's death
// samples (killed = same-day wave-5 kill of that type; died = no
// same-day kill and a combat death that day; fled = otherwise).
// Two legs, zero src/js change: OFF = master as-is, recorder off
// (trajectory reference); ON = master as-is + recorder wraps only.
// Policy: competent verbatim (scripts/policies/competent.js), 200d
// death-aware. Instrument: REUSED
// scripts/standing199-instrument-20261110.js (arm sim-standing199-a).
// The driver augments each snapshot (driver-side only) with scaleRank +
// nationalLive (stand199) and w5facedCount + w5facedIds (this arm).
// WAVE5FACE_RECORDER=off skips installing the wraps (D2 leg).
// Usage:
//   WAVE5FACE_RECORDER=off SEEDS=102701,102702 RUN=wave5face-b node scripts/wave5face-driver-20261116.js
//   WAVE5FACE_RECORDER=on  SEEDS=102701,102702 RUN=wave5face-b node scripts/wave5face-driver-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'standing199-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const RUN = process.env.RUN || 'wave5face-b';
const RECORDER = process.env.WAVE5FACE_RECORDER || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-wave5face-b-' + RECORDER);
if (RECORDER !== 'off' && RECORDER !== 'on') { console.error('WAVE5FACE STOP: WAVE5FACE_RECORDER must be off|on, got ' + JSON.stringify(RECORDER)); process.exit(2); }
const RECORDER_ON = RECORDER === 'on';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// writeRobust: host write-flap guard (haventarget lesson). Retries a
// refused write; on total failure dumps to stdout with @@FALLBACK and
// returns false so the caller can fail loudly instead of silently
// losing the corpus.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return false; }
      sleepMs(250);
    }
  }
  return false;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function aliveCount(Game) {
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    let n = 0;
    for (let i = 0; i < roster.length; i++) {
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && p.dead) dead = true; } catch (e) {}
      if (!dead) n++;
    }
    return n;
  } catch (e) { return 0; }
}
function scaleRankOf(Game) { return safe(function () { return Game.scaleRank ? Game.scaleRank() : null; }, null); }
function nationalLiveOf(Game) { return safe(function () { return !!(Game.state || {}).nationalLive; }, false); }

// w5FacedIdsPure(Game): the wave-5 keys of deedState().wavesFaced, read
// DIRECTLY off state.scholar.prog (no deedState()/progState() call, so
// no initializer ever runs — a pure read on both legs).
function w5FacedIdsPure(Game) {
  try {
    const prog = ((Game.state || {}).scholar || {}).prog;
    const faced = (prog && prog.deeds && prog.deeds.wavesFaced) || {};
    return Object.keys(faced).filter(function (mid) { return (faced[mid] | 0) === 5; }).sort();
  } catch (e) { return []; }
}
function w5FacedCountOf(Game) {
  try { return Game.waveEngaged ? (Game.waveEngaged(5) | 0) : w5FacedIdsPure(Game).length; } catch (e) { return w5FacedIdsPure(Game).length; }
}
// sigOf: the daily trajectory signature, identical shape on both legs
// (D2 compares OFF vs ON on exactly these fields).
function sigOf(Game) {
  const st = Game.villageStanding ? safe(function () { return Game.villageStanding(); }, null) : null;
  return {
    day: gday(Game),
    living: aliveCount(Game),
    pantryKcal: pantryKcal(Game),
    gated: safe(function () { return Game.villageStandingTotal ? Game.villageStandingTotal() : null; }, null),
    raw: st ? (st.total | 0) : null,
    war: st ? (st.war | 0) : null,
    diplomacy: st ? (st.diplomacy | 0) : null,
    plenty: st ? (st.plenty | 0) : null,
    capped: safe(function () { return Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; }, null),
    peakWave: safe(function () { return Game._standingPeakWave ? Game._standingPeakWave() : null; }, null),
    scaleRank: scaleRankOf(Game),
    nationalLive: nationalLiveOf(Game),
    w5facedCount: w5FacedCountOf(Game),
    w5facedIds: w5FacedIdsPure(Game),
  };
}

// installFacingWrap(Game): wrap Game.recordDeedFight (the deed-feed
// choke point) and record each NEW distinct wave-5 monster faced.
// Before/after diff on the pure-read faced set; the original is always
// called with its own arguments and its return value is returned.
// Records driver-locally only — no game-state writes, no RNG draws.
// Returns { engagements, errors, uninstall }.
function installFacingWrap(Game) {
  const engagements = [];
  const errors = [];
  const orig = Game.recordDeedFight;
  if (typeof orig !== 'function') {
    errors.push('recordDeedFight missing');
    return { engagements: engagements, errors: errors, uninstall: function () {} };
  }
  function monsterWave(mid) {
    try {
      const list = (Game.data && Game.data.monsters) || [];
      for (let i = 0; i < list.length; i++) if (list[i].id === mid) return (list[i].wave | 0);
      return null;
    } catch (e) { return null; }
  }
  Game.recordDeedFight = function (monsterId) {
    let before = null;
    try { before = w5FacedIdsPure(Game); } catch (e) { before = []; }
    const r = orig.apply(this, arguments);
    try {
      const after = w5FacedIdsPure(Game);
      const beforeSet = {};
      (before || []).forEach(function (m) { beforeSet[m] = true; });
      for (let i = 0; i < after.length; i++) {
        const mid = after[i];
        if (beforeSet[mid]) continue;
        if (monsterWave(mid) !== 5) continue;
        let st = null, gated = null;
        try { st = Game.villageStanding ? Game.villageStanding() : null; } catch (e) {}
        try { gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
        let vets = null;
        try { vets = INST.livingVeteranVids(Game).length; } catch (e) {}
        engagements.push({
          day: gday(Game), mid: mid,
          gated: gated,
          raw: st ? (st.total | 0) : null,
          war: st ? (st.war | 0) : null,
          diplomacy: st ? (st.diplomacy | 0) : null,
          plenty: st ? (st.plenty | 0) : null,
          veterans: vets, scaleRank: scaleRankOf(Game),
          outcome: null, combatDeathsSameDay: null,
        });
      }
    } catch (e) { errors.push('facing-wrap: ' + String(e.message).slice(0, 80)); }
    return r;
  };
  return {
    engagements: engagements, errors: errors,
    uninstall: function () { try { Game.recordDeedFight = orig; } catch (e) {} },
  };
}

// classifyEngagements(engagements, killLog, deaths, w5Names): frozen
// outcome rules (prereg §Code read, as CORRECTED — see Correction 1 in
// the prereg). killed = a wave-5 kill-log entry for this monster id on
// the engagement day. died = no same-day kill and >= 1 PERSON combat
// death that day (a villager/scholar who died fighting — kind
// 'villager'|'person' with a combat cause: 'the wild', 'monster', or
// the name/id of a wave-5 monster). fled = otherwise.
// CORRECTION (why the person/combat-cause read, not the prereg's
// kind-in-(monster, wild) read): the run-days death samples mix TWO
// kinds of death (corpses.js registerDeath: "kind covers
// person/monster/animal"). kind='monster' rows are MONSTER deaths (the
// village killed something — who is the monster id), NOT fighter
// deaths; kind='wild' never occurs. Counting kind='monster' as a
// fighter death mislabels engagements whose only same-day death is a
// monster the village killed (102706 d158 nielsen: the only death that
// day is an influencer the villagers killed). combatDeathsSameDay counts
// qualifying person combat deaths, not monster deaths.
// deaths: the mapped run-days death list [{day, kind, who, cause, ...}].
// w5Names: wave-5 monster ids + display names (for the named-cause
// rule); defaults to [] (only the generic combat causes then count).
function classifyEngagements(engagements, killLog, deaths, w5Names) {
  const log = killLog || [];
  const ds = deaths || [];
  const names = {};
  (w5Names || []).forEach(function (n) { names[String(n).toLowerCase()] = true; });
  function isPersonCombatDeath(d) {
    if (!d || (d.kind !== 'villager' && d.kind !== 'person')) return false;
    const c = String(d.cause || '');
    if (c === 'the wild' || c === 'monster') return true;
    return !!names[c.toLowerCase()];
  }
  for (let i = 0; i < engagements.length; i++) {
    const e = engagements[i];
    let killed = false;
    for (let j = 0; j < log.length; j++) {
      const k = log[j];
      if (k && k.mid === e.mid && (k.w | 0) === 5 && (k.d | 0) === (e.day | 0)) { killed = true; break; }
    }
    if (killed) { e.outcome = 'killed'; e.combatDeathsSameDay = 0; continue; }
    let cd = 0;
    for (let j = 0; j < ds.length; j++) {
      if ((ds[j].day | 0) === (e.day | 0) && isPersonCombatDeath(ds[j])) cd++;
    }
    e.combatDeathsSameDay = cd;
    e.outcome = (cd > 0) ? 'died' : 'fled';
  }
  return engagements;
}

// reconcileFacing(engagements, Game): the wrap must capture exactly what
// the engine counts as faced — recorded engagements == waveEngaged(5)
// AND the recorded mid set == the wavesFaced wave-5 key set.
function reconcileFacing(engagements, Game) {
  let engagedCount = null, facedIds = null;
  try { engagedCount = Game.waveEngaged ? (Game.waveEngaged(5) | 0) : null; } catch (e) {}
  try { facedIds = w5FacedIdsPure(Game); } catch (e) { facedIds = null; }
  const recordedIds = engagements.map(function (e) { return e.mid; }).sort();
  const mismatch = (engagedCount !== engagements.length) ||
    (JSON.stringify(facedIds) !== JSON.stringify(recordedIds));
  return {
    engagedCount: engagedCount, recordedCount: engagements.length,
    facedIds: facedIds, recordedIds: recordedIds, mismatch: !!mismatch,
  };
}

// Tight say filter (standaccum-b lesson: loose /held|feast/ fills the
// cap with fight/storm/keepsake noise). Only standing-line and hold-beat
// shapes, which is what the sense read needs.
const SAY_RE = /^Standing \d|HELD at wave|draft (stays|waits)|blood your fighters|fifth draft is not bought/;

async function oneRun(seed, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const recorderOn = opts.recorderOn != null ? !!opts.recorderOn : RECORDER_ON;
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-wave5face-b', fullTelemetry: false });
  await setupGame(Game);
  const standSays = [];
  let sayCount = 0;
  const errors = [];
  let inst = null;
  let facing = null;
  const dailySig = [];
  if (recorderOn) {
    try {
      const origSay = Game.say;
      Game.say = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string') {
            sayCount++;
            if (SAY_RE.test(arg) && standSays.length < 150) standSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          }
        } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
        return origSay.apply(this, arguments);
      };
    } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
    inst = INST.install(Game);
    facing = installFacingWrap(Game);
  }
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            if (recorderOn) {
              const snap = inst.snapshot();
              // Driver-side augmentation only (instrument module
              // untouched): scaleRank + nationalLive for the H4 table,
              // w5facedCount + w5facedIds for the facing table.
              snap.scaleRank = scaleRankOf(Game);
              snap.nationalLive = nationalLiveOf(Game);
              snap.w5facedCount = w5FacedCountOf(Game);
              snap.w5facedIds = w5FacedIdsPure(Game);
              dailySig.push({
                day: snap.day, living: snap.living, pantryKcal: pantryKcal(Game),
                gated: snap.gated, raw: snap.standing ? (snap.standing.total | 0) : null,
                war: snap.standing ? (snap.standing.war | 0) : null,
                diplomacy: snap.standing ? (snap.standing.diplomacy | 0) : null,
                plenty: snap.standing ? (snap.standing.plenty | 0) : null,
                capped: snap.capped, peakWave: snap.peakWave,
                scaleRank: snap.scaleRank, nationalLive: snap.nationalLive,
                w5facedCount: snap.w5facedCount, w5facedIds: snap.w5facedIds,
              });
            } else {
              dailySig.push(sigOf(Game));
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: days, manifest: undefined, sampleEvery: 30 }); });

  // End-of-run facing resolution (ON leg only): outcomes + reconciliation.
  let engagements = null, facingReconcile = null;
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  if (recorderOn) {
    try {
      const snap = inst.snapshot();
      snap.scaleRank = scaleRankOf(Game);
      snap.nationalLive = nationalLiveOf(Game);
      snap.w5facedCount = w5FacedCountOf(Game);
      snap.w5facedIds = w5FacedIdsPure(Game);
    } catch (e) {}
    try {
      const killLog = ((Game.state || {}).waveKillLog) || [];
      facingReconcile = reconcileFacing(facing.engagements, Game);
      let w5Names = [];
      try {
        const mons = (Game.data && Game.data.monsters) || [];
        for (let i = 0; i < mons.length; i++) {
          if ((mons[i].wave | 0) === 5) { w5Names.push(mons[i].id); if (mons[i].name) w5Names.push(mons[i].name); }
        }
      } catch (e) {}
      classifyEngagements(facing.engagements, killLog, deaths, w5Names);
      engagements = facing.engagements;
      if (facingReconcile.mismatch) errors.push('facing-reconcile: recorded ' + facingReconcile.recordedCount + ' vs engaged ' + facingReconcile.engagedCount);
    } catch (e) { errors.push('facing-resolve: ' + String(e.message).slice(0, 80)); }
    try { facing.uninstall(); } catch (e) { errors.push('facing-uninstall: ' + String(e.message).slice(0, 80)); }
    try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, memorial = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { memorial = Game.memorialRoll ? Game.memorialRoll() : null; } catch (e) { memorial = null; errors.push('memorialRoll: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let standingRaw = null;
  try { standingRaw = Game.villageStanding ? Game.villageStanding().total : null; } catch (e) {}
  let w3kills = 0, w4kills = 0, w5kills = 0;
  try {
    const log = st.waveKillLog || [];
    for (let i = 0; i < log.length; i++) {
      const w = (log[i] && log[i].w) | 0;
      if (w === 3) w3kills++;
      else if (w === 4) w4kills++;
      else if (w >= 5) w5kills++;
    }
  } catch (e) { errors.push('waveKillLog: ' + String(e.message).slice(0, 80)); }

  const out = {
    seed: seed, arm: 'wave5face-b', run: RUN, leg: recorderOn ? 'on' : 'off',
    anchorCommit: ANCHOR, recorderOn: recorderOn,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked,
    standing: standing, standingRaw: standingRaw,
    memorial: memorial, deaths: deaths,
    w3kills: w3kills, w4kills: w4kills, w5kills: w5kills,
    daily: recorderOn ? inst.t.daily : null,
    dailySig: dailySig,
    engagements: engagements,
    facingReconcile: facingReconcile,
    w5facedCount: w5FacedCountOf(Game),
    w5facedIds: w5FacedIdsPure(Game),
    standSays: standSays, sayCount: sayCount,
    instrumentErrors: (recorderOn ? inst.t.instrumentErrors.concat(facing ? facing.errors : []) : []).concat(errors),
  };
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('WAVE5FACE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'wave5face-b-s' + seed + '-' + RUN + '-' + RECORDER + '.json');
    if (fs.existsSync(file)) { console.error('WAVE5FACE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let failed = false;
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'wave5face-b-s' + seed + '-' + RUN + '-' + RECORDER + '.json');
    const ok = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!ok) failed = true;
    const last = (out.daily && out.daily[out.daily.length - 1]) || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, leg: out.leg, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: (out.policySha || '').slice(0, 12), recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, standingRaw: out.standingRaw,
      scaleRank: out.scaleRank,
      endGated: last.gated != null ? last.gated : (out.dailySig.length ? out.dailySig[out.dailySig.length - 1].gated : null),
      endRaw: last.standing ? last.standing.total : (out.dailySig.length ? out.dailySig[out.dailySig.length - 1].raw : null),
      endReady: r5.ready != null ? r5.ready : null,
      snapshots: out.daily ? out.daily.length : 0, sigDays: out.dailySig.length,
      deaths: out.deaths.length, w4kills: out.w4kills, w5kills: out.w5kills,
      engagements: out.engagements ? out.engagements.length : null,
      faced: out.w5facedCount,
      reconcileMismatch: out.facingReconcile ? out.facingReconcile.mismatch : null,
      errors: out.instrumentErrors.length, wrote: ok,
      file: path.relative(REPO, file),
    }));
  }
  if (failed) { console.error('WAVE5FACE STOP: a corpus write fell back to stdout — see @@FALLBACK above.'); process.exit(3); }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = {
  oneRun: oneRun, sigOf: sigOf, writeRobust: writeRobust,
  installFacingWrap: installFacingWrap,
  classifyEngagements: classifyEngagements,
  reconcileFacing: reconcileFacing,
  w5FacedIdsPure: w5FacedIdsPure, w5FacedCountOf: w5FacedCountOf,
};
