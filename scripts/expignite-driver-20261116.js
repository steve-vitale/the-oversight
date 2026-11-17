// expignite-driver-20261116.js — JUDGED driver, arm sim-expignite-b
// (DIAG: findings backlog #2463 — TWO SEEDS NEVER ATTEMPT A LAUNCH AT
// ALL. On the medicduty band 102801-102808, seeds 102803/102806 record
// 0 startExpedition calls in 150 days; the medicduty recorder only sees
// startExpedition calls, so it cannot tell no-EXPEDITION-commit from
// commit-but-no-depart from the agency chance roll never firing.)
// Extends the medicduty recorder (scripts/medicduty-driver-20261116.js):
// the same launch/return/death/open-expedition rows, PLUS the ignition
// chain upstream of startExpedition — score rows from a vbrainScorePick
// wrap (candidates offered, pick, override, raw feeder inputs), gate
// rows from a vbrainLogGate wrap (hard body gates pre-empt the lottery),
// depart rows from a vbrainExecuteDepart wrap (commit at call time,
// return, expedition after), per-tick gate snapshots for EXPEDITION
// commit holders from an agencyTick wrap, and a part-0 daily census
// (the per-day denominator). Two legs, zero src/js change: OFF = master
// as-is, recorder off (trajectory reference); ON = master as-is +
// recorder wraps only. Policy: competent verbatim
// (scripts/policies/competent.js), 150d death-aware. All recorder wraps
// are pure reads plus writes to driver-local arrays — no game-state
// writes, no RNG draws. Never calls winPlanOf (creates a plan),
// agencyState / agencyOf (initializes agency sub-state), or
// npcTrigger (registry dispatch) — raw state reads and
// Game.objVillageDanger (pure belief + weather) stand in for those.
// EXPIGNITE_RECORDER=off skips installing the wraps (determinism leg D2).
// Usage:
//   MODE=off OUTDIR=perseed-expignite-b-off SEEDS=103001,103002 RUN=expignite-b node scripts/expignite-driver-20261116.js
//   MODE=on  OUTDIR=perseed-expignite-b-on  SEEDS=103001,103002 RUN=expignite-b node scripts/expignite-driver-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'expignite-b';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-expignite-b-' + MODE);
const RECORDER_ON = process.env.EXPIGNITE_RECORDER !== 'off';

if (MODE !== 'off' && MODE !== 'on') { console.error('EXPIGNITE STOP: MODE must be off|on, got ' + JSON.stringify(MODE)); process.exit(2); }

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function gpart(Game) { try { return (typeof Game.dayPart === 'number') ? Game.dayPart : 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function usableMedicineExists(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    const pile = (st && st.medicine) || [];
    const defs = {};
    (Game.data.items || []).forEach(function (i) { defs[i.id] = i; });
    for (let i = 0; i < pile.length; i++) {
      const e = pile[i];
      if ((e.units != null ? e.units : 1) <= 0 || (e.doses != null && e.doses <= 0)) continue;
      if (((defs[e.itemId || e.id] || {}).healAmount || 0) > 0) return true;
    }
  } catch (e) {}
  return false;
}
function hasCampHealer(Game, vid) {
  try {
    let place = null;
    if (Game.campPeopleIds && Game.campPeopleIds('haven').indexOf(vid) !== -1) place = 'haven';
    else if (Game.campPeopleIds && Game.campPeopleIds().indexOf(vid) !== -1) place = 'here';
    if (place && Game.campHealerId && Game.campHealerId(place)) return true;
  } catch (e) {}
  return false;
}
// gateSnapshot: the startExpedition gate inputs as PURE reads,
// taken BEFORE the original call runs. (From the medicduty driver,
// unchanged — the heal check can patch a villager once the call runs.)
function gateSnapshot(Game, vid, hasOpts) {
  const v = (Game.state || {}).village || {};
  let dutyHolder = null, dutyName = null;
  try { dutyHolder = Game.medicDutyHolder ? Game.medicDutyHolder() : null; } catch (e) {}
  try { dutyName = dutyHolder && Game.displayName ? Game.displayName(dutyHolder) : null; } catch (e) {}
  let health = null;
  try { health = (v.health || {})[vid]; if (health === undefined) health = 100; } catch (e) { health = null; }
  let sick = false;
  try { sick = !!((v.sick || {})[vid]); } catch (e) {}
  let maxDist = null;
  try { maxDist = Game.npcMaxDist ? Game.npcMaxDist(vid) : null; } catch (e) {}
  return { dutyHolder: dutyHolder, dutyName: dutyName, health: health, sick: sick,
    maxDist: maxDist, medicineExists: usableMedicineExists(Game),
    campHealer: hasCampHealer(Game, vid), directed: !!hasOpts };
}
function deriveBlockReasonFromGate(gate, vid) {
  if (!gate) return 'unknown-block';
  if (!gate.directed && gate.dutyHolder && gate.dutyHolder === vid) return 'medic-duty';
  if (gate.health != null && gate.health < 70 && !gate.medicineExists && !gate.campHealer) return 'hurt-no-care';
  if (gate.sick) return 'sick';
  if (gate.maxDist != null && gate.maxDist < 1) return 'range-0';
  return 'unknown-block';
}
function launchEligiblePool(Game, vid, gate) {
  const v = (Game.state || {}).village || {};
  const roster = v.roster || [];
  let havenIds = [];
  try { havenIds = Game.campPeopleIds ? (Game.campPeopleIds('haven') || []) : []; } catch (e) {}
  const away = v.away || {};
  const sick = v.sick || {};
  const exped = ((v.agency || {}).exped || {});
  const health = v.health || {};
  const med = gate ? !!gate.medicineExists : usableMedicineExists(Game);
  const pool = [];
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    if (!id || id === vid) continue;
    if (id === Game.villagerId) continue;
    if (gate && gate.dutyHolder && id === gate.dutyHolder) continue;
    let p = null;
    try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    if (!p || p.dead) continue;
    if (havenIds.indexOf(id) === -1) continue;
    if (away[id]) continue;
    if (exped[id]) continue;
    if (sick[id]) continue;
    let md = null;
    try { md = Game.npcMaxDist ? Game.npcMaxDist(id) : null; } catch (e) {}
    if (md != null && md < 1) continue;
    const hp = (health[id] !== undefined) ? health[id] : 100;
    let healer = false;
    try { healer = hasCampHealer(Game, id); } catch (e) {}
    if (hp < 70 && !med && !healer) continue;
    let nm = null;
    try { nm = Game.displayName ? Game.displayName(id) : null; } catch (e) {}
    pool.push({ vid: id, name: nm });
  }
  return pool;
}
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
function cloneExped(ex) {
  if (!ex) return null;
  return {
    tx: ex.tx != null ? ex.tx : null, ty: ex.ty != null ? ex.ty : null,
    dist: ex.dist != null ? ex.dist : null, legs: ex.legs != null ? ex.legs : null,
    sinceDay: ex.sinceDay != null ? ex.sinceDay : null,
    sincePart: ex.sincePart != null ? ex.sincePart : null,
    duration: ex.duration != null ? ex.duration : null,
    finds: (ex.finds || []).map(function (f) { return { kcal: f.kcal != null ? f.kcal : null }; }),
    encounters: (ex.encounters || []).slice(),
    meat: (ex.meat || []).map(function (m) { return { kcal: m.kcal != null ? m.kcal : null, unknown: (m.unknown || []).length }; }),
  };
}
function xpOf(Game, vid) {
  try {
    const x = (((Game.state || {}).village || {}).agency || {}).xp || {};
    const e = x[vid];
    if (!e) return { tracking: 0, survival: 0 };
    return { tracking: e.tracking != null ? e.tracking : 0, survival: e.survival != null ? e.survival : 0 };
  } catch (e2) { return null; }
}
// planOfRaw: the launch-time win-plan snapshot as a PURE read.
// winPlanOf CREATES a plan when none exists — never call it here.
function planOfRaw(Game, vid) {
  try {
    const p = (((Game.state || {}).village || {}).winPlan || {})[vid];
    if (!p) return null;
    return { stage: p.stage || null, target: p.target || null,
      node: p.node ? { nx: p.node.nx, ny: p.node.ny } : null,
      needWave: p.needWave != null ? p.needWave : null };
  } catch (e) { return null; }
}
// agencyExped: the live expedition record as a PURE read.
// agencyState() initializes agency sub-state — same no-write rule.
function agencyExped(Game, vid) {
  try { return ((((Game.state || {}).village || {}).agency || {}).exped || {})[vid] || null; }
  catch (e) { return null; }
}
// agencyPotentialRaw: rising-star flag as a PURE read (raw state;
// agencyState() would initialize/transfer — never called in a wrap).
function agencyPotentialRaw(Game, vid) {
  try { return !!((((Game.state || {}).village || {}).agency || {}).potential || {})[vid]; }
  catch (e) { return false; }
}
function deriveOrigin(stack, hasOpts) {
  if (!stack) return 'unknown';
  if (stack.indexOf('win-plan.js') !== -1) return 'winplan-party_launch';
  if (stack.indexOf('villager-brain.js') !== -1) return 'vbrain-party_launch';
  if (stack.indexOf('villager-agency.js') !== -1) return hasOpts ? 'directed-other' : 'random-agency';
  return 'unknown';
}
// scoreInputs: the feeder inputs vbrainFeedExtras read when scoring
// this villager, as PURE reads taken after the score call (scoring
// writes only the brain commit/log, never these). The analyzer
// re-derives "EXPEDITION candidate offered?" from these + the plan
// stage (D3); the game's own candidate list on the row is the
// stored counterpart.
function scoreInputs(Game, vid) {
  let profile = null, maxDist = null, sick = false, potential = false;
  let danger = null, night = false, plan = null, pool = null;
  try { profile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
  try { maxDist = Game.npcMaxDist ? Game.npcMaxDist(vid) : null; } catch (e) {}
  try { sick = !!(((Game.state || {}).village || {}).sick || {})[vid]; } catch (e) {}
  try { potential = agencyPotentialRaw(Game, vid); } catch (e) {}
  try { danger = Game.objVillageDanger ? Game.objVillageDanger(vid) : null; } catch (e) {}
  try { night = !!Game.isNight ? !!Game.isNight() : false; } catch (e) {}
  try { plan = planOfRaw(Game, vid); } catch (e) {}
  try {
    const gate = gateSnapshot(Game, vid, false);
    pool = launchEligiblePool(Game, vid, gate);
  } catch (e) { pool = null; }
  return { profile: profile, maxDist: maxDist, sick: sick, potential: potential,
    danger: danger, night: night, planStage: plan ? plan.stage : null,
    planNeedWave: plan ? plan.needWave : null, poolDepth: pool ? pool.length : null };
}
// tickGateSnapshot: the agencyTick gates in front of vbrainExecuteDepart
// for one EXPEDITION-commit holder, as PURE reads taken BEFORE the tick
// runs (the tick itself departs villagers and mutates these). The
// trigger is re-derived from the danger belief (objVillageDanger >= 4,
// the verbatim npc-triggers.js predicate) — npcTrigger is registry
// dispatch and is never called in a wrap.
function tickGateSnapshot(Game, vid, hx, hy) {
  const v = (Game.state || {}).village || {};
  let dead = false, engaged = false, hasExped = false, profile = null;
  let atHaven = false, night = false, indoorObj = false, danger = null;
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; dead = !!(p && p.dead); } catch (e) {}
  try { engaged = !!(Game.isEngaged ? Game.isEngaged(vid) : false); } catch (e) {}
  try { hasExped = !!agencyExped(Game, vid); } catch (e) {}
  try { profile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
  try { const n = Game.npcNode ? Game.npcNode(vid) : null; atHaven = !!(n && n.nx === hx && n.ny === hy); } catch (e) {}
  try { night = !!Game.isNight ? !!Game.isNight() : false; } catch (e) {}
  try {
    const o = Game.objOf ? Game.objOf(vid) : null;
    indoorObj = !!(o && o.indoor && o.state === 'indoor');
  } catch (e) {}
  try { danger = Game.objVillageDanger ? Game.objVillageDanger(vid) : null; } catch (e) {}
  return { dead: dead, engaged: engaged, hasExped: hasExped, profile: profile,
    atHaven: atHaven, night: night, indoorObj: indoorObj, danger: danger,
    trigger: (danger != null ? danger >= 4 : false) };
}
// deriveFirstTickGate: first agencyTick gate that `continue`s past this
// villager BEFORE vbrainExecuteDepart, in villager-agency.js code order.
// The profile gate is bypassed for today's party_launch commit; the
// indoor gate is bypassed for today's EXPEDITION commit. Returns the
// gate id, 'depart-reached' when every gate passes, or 'unknown-gate'
// when the snapshot cannot explain a missed depart (counted, never
// silently binned). Exported for the proof test; the analyzer
// re-implements it independently (D3).
function deriveFirstTickGate(snap, commit) {
  if (!snap) return 'unknown-gate';
  if (snap.dead) return 'D-dead';
  if (snap.engaged) return 'D-engaged';
  if (snap.hasExped) return 'D-already-out';
  const isPartyLaunch = !!(commit && commit.winPlanAction === 'party_launch');
  if (snap.profile !== 'wanderer' && snap.profile !== 'explorer' && !isPartyLaunch) return 'D-profile';
  if (!snap.atHaven) return 'D-node';
  if (snap.night) return 'D-night';
  const isExpedCommit = !!(commit && commit.kind === 'EXPEDITION');
  if (snap.indoorObj && !isExpedCommit) return 'D-indoor';
  if (snap.trigger) return 'D-trigger';
  return 'depart-reached';
}

const SAY_RE = /expedition|shoulders a pack|back from|🎒|🧭|camp healer|no healer|doctoring|medic/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'expignite-' + MODE, fullTelemetry: false });
  const errors = [];
  const launches = [];
  const returns = [];
  const expedDeaths = [];
  const dailySig = [];
  const sayLines = [];
  const scoreRows = [];
  const gateRows = [];
  const departRows = [];
  const tickRows = [];
  const censusRows = [];
  let sayCount = 0;
  let seq = 0;

  if (RECORDER_ON) try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && sayLines.length < 400) sayLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);

  // ---- IGNITION RECORDER (pure reads + driver-local writes) ----
  if (RECORDER_ON) {
    // 1. Dawn score: what was offered, what won, what the feeders saw.
    try {
      const origScore = Game.vbrainScorePick;
      if (typeof origScore !== 'function') errors.push('vbrainScorePick-wrap: not a function');
      else Game.vbrainScorePick = function (vid, cands, opts) {
        const ret = origScore.apply(this, arguments);
        try {
          let entry = null;
          try { entry = (typeof Game.vbrainLastLog === 'function') ? Game.vbrainLastLog(vid) : null; } catch (e) { entry = null; }
          let name = null;
          try { name = Game.displayName ? Game.displayName(vid) : null; } catch (e) { name = null; }
          let inputs = null;
          try { inputs = scoreInputs(Game, vid); } catch (e) { inputs = null; }
          const candsOut = (entry && entry.candidates) ? entry.candidates.map(function (c) {
            return { kind: c.kind, score: c.score, vbrainSrc: c.vbrainSrc || null,
              winPlanAction: c.winPlanAction || null, companion: c.companion || null };
          }) : null;
          scoreRows.push({ seq: seq++, day: gday(Game), part: gpart(Game), vid: vid, name: name,
            mode: entry ? (entry.mode || null) : null,
            pick: entry ? (entry.pick || null) : null,
            corePick: entry ? (entry.corePick || null) : null,
            override: entry ? (entry.override || null) : null,
            winPlanAction: entry ? (entry.winPlanAction || null) : null,
            pickSrc: entry ? (entry.pickSrc || null) : null,
            candidates: candsOut, inputs: inputs });
        } catch (e) { errors.push('vbrainScorePick-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('vbrainScorePick-wrap-install: ' + String(e.message).slice(0, 80)); }

    // 2. Hard body gates: they return from objPick before the lottery,
    // so a gate day carries no score row — record it, or the analyzer
    // would misread the day as "scorer never ran".
    try {
      const origGate = Game.vbrainLogGate;
      if (typeof origGate !== 'function') errors.push('vbrainLogGate-wrap: not a function');
      else Game.vbrainLogGate = function (vid, kind, gateId, detail) {
        const ret = origGate.apply(this, arguments);
        try {
          let name = null;
          try { name = Game.displayName ? Game.displayName(vid) : null; } catch (e) { name = null; }
          gateRows.push({ seq: seq++, day: gday(Game), part: gpart(Game), vid: vid, name: name,
            kind: kind, gateId: gateId });
        } catch (e) { errors.push('vbrainLogGate-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('vbrainLogGate-wrap-install: ' + String(e.message).slice(0, 80)); }

    // 3. Depart: the commit at call time, the return, the expedition after.
    try {
      const origDepart = Game.vbrainExecuteDepart;
      if (typeof origDepart !== 'function') errors.push('vbrainExecuteDepart-wrap: not a function');
      else Game.vbrainExecuteDepart = function (vid, hx, hy, announce) {
        let commit = null, name = null;
        try {
          const c = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null;
          if (c) commit = { kind: c.kind || null, winPlanAction: c.winPlanAction || null,
            companion: c.companion || null, companion2: c.companion2 || null,
            day: c.day != null ? c.day : null };
        } catch (e) { commit = null; }
        try { name = Game.displayName ? Game.displayName(vid) : null; } catch (e) { name = null; }
        const d0 = gday(Game), p0 = gpart(Game);
        const ret = origDepart.apply(this, arguments);
        try {
          let expedAfter = false, tx = null, ty = null;
          try {
            const ex = agencyExped(Game, vid);
            expedAfter = !!ex;
            if (ex) { tx = ex.tx; ty = ex.ty; }
          } catch (e) {}
          departRows.push({ seq: seq++, day: d0, part: p0, vid: vid, name: name,
            commit: commit, ret: (typeof ret === 'string') ? ret : String(ret),
            expedAfter: expedAfter, expedTx: tx, expedTy: ty });
        } catch (e) { errors.push('vbrainExecuteDepart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('vbrainExecuteDepart-wrap-install: ' + String(e.message).slice(0, 80)); }

    // 4. Agency tick: pre-tick gate snapshots for EXPEDITION commit
    // holders (the D population) + the part-0 daily census.
    try {
      const origTick = Game.agencyTick;
      if (typeof origTick !== 'function') errors.push('agencyTick-wrap: not a function');
      else Game.agencyTick = function () {
        const d0 = gday(Game), p0 = gpart(Game);
        try {
          const v = (Game.state || {}).village || {};
          const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
          const roster = v.roster || [];
          if (p0 === 0) {
            for (let i = 0; i < roster.length; i++) {
              const rid = roster[i];
              if (!rid || rid === Game.villagerId) continue;
              try {
                let alive = true;
                try { const pp = Game.getPerson ? Game.getPerson(rid) : null; if (pp && pp.dead) alive = false; } catch (e) {}
                let away = false;
                try { away = !!((v.away || {})[rid]); } catch (e) {}
                let engaged = false;
                try { engaged = !!(Game.isEngaged ? Game.isEngaged(rid) : false); } catch (e) {}
                let atHaven = false;
                try { const nn = Game.npcNode ? Game.npcNode(rid) : null; atHaven = !!(nn && nn.nx === hx && nn.ny === hy); } catch (e) {}
                let profile = null;
                try { profile = Game.npcRangeProfile ? Game.npcRangeProfile(rid) : null; } catch (e) {}
                let hasExped = false;
                try { hasExped = !!agencyExped(Game, rid); } catch (e) {}
                let plan = null;
                try { plan = planOfRaw(Game, rid); } catch (e) {}
                let commit = null;
                try {
                  const cc = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(rid) : null;
                  if (cc) commit = { kind: cc.kind || null, winPlanAction: cc.winPlanAction || null, day: cc.day != null ? cc.day : null };
                } catch (e) {}
                let objKind = null, objState = null;
                try { const oo = Game.objOf ? Game.objOf(rid) : null; if (oo) { objKind = oo.kind || null; objState = oo.state || null; } } catch (e) {}
                let nm = null;
                try { nm = Game.displayName ? Game.displayName(rid) : null; } catch (e) {}
                censusRows.push({ seq: seq++, day: d0, part: p0, vid: rid, name: nm,
                  alive: alive, away: away, engaged: engaged, atHaven: atHaven,
                  profile: profile, hasExped: hasExped,
                  planStage: plan ? plan.stage : null, commit: commit,
                  objKind: objKind, objState: objState });
              } catch (e) { errors.push('census-row: ' + String(e.message).slice(0, 80)); }
            }
          }
          for (let i = 0; i < roster.length; i++) {
            const rid = roster[i];
            if (!rid || rid === Game.villagerId) continue;
            try {
              let commit = null;
              try {
                const cc = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(rid) : null;
                if (cc) commit = { kind: cc.kind || null, winPlanAction: cc.winPlanAction || null,
                  companion: cc.companion || null, day: cc.day != null ? cc.day : null };
              } catch (e) { commit = null; }
              if (!commit || commit.kind !== 'EXPEDITION' || commit.day !== d0) continue;
              let snap = null;
              try { snap = tickGateSnapshot(Game, rid, hx, hy); } catch (e) { snap = null; }
              tickRows.push({ seq: seq++, day: d0, part: p0, vid: rid, commit: commit, gates: snap });
            } catch (e) { errors.push('tick-row: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('agencyTick-pre: ' + String(e.message).slice(0, 80)); }
        return origTick.apply(this, arguments);
      };
    } catch (e) { errors.push('agencyTick-wrap-install: ' + String(e.message).slice(0, 80)); }

    // 5. startExpedition / expeditionReturn / expedDeath — medicduty
    // recorder, unchanged (launch/return/death rows + pre-call gate).
    try {
      const origStart = Game.startExpedition;
      if (typeof origStart !== 'function') errors.push('startExpedition-wrap: not a function');
      else Game.startExpedition = function (vid, hx, hy, announce, opts) {
        let row = null;
        let gate = null, pool = null;
        try {
          const stack = (new Error().stack || '').split('\n').slice(1, 9).join('\n');
          const hasOpts = !!(opts && opts.tx != null && opts.ty != null);
          try { gate = gateSnapshot(Game, vid, hasOpts); } catch (e) { gate = null; }
          try { pool = launchEligiblePool(Game, vid, gate); } catch (e) { pool = null; }
          let overwrote = null;
          try { overwrote = cloneExped(agencyExped(Game, vid)); } catch (e) { overwrote = null; }
          let plan = null;
          try { plan = planOfRaw(Game, vid); } catch (e) { plan = null; }
          let commit = null;
          try {
            const c = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null;
            if (c) commit = { kind: c.kind || null, winPlanAction: c.winPlanAction || null,
              companion: c.companion || null, day: c.day != null ? c.day : null };
          } catch (e) { commit = null; }
          let node = null;
          try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) { node = null; }
          let profile = null;
          try { profile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) { profile = null; }
          let name = null;
          try { name = Game.displayName ? Game.displayName(vid) : null; } catch (e) { name = null; }
          row = { seq: seq++, day: gday(Game), part: gpart(Game), vid: vid, name: name, profile: profile,
            hx: hx, hy: hy, node: node,
            optsTx: hasOpts ? opts.tx : null, optsTy: hasOpts ? opts.ty : null,
            optsDuration: (opts && opts.duration != null) ? opts.duration : null,
            hasOpts: hasOpts, stackTop: stack, origin: deriveOrigin(stack, hasOpts),
            plan: plan, dawnCommit: commit, xpAtLaunch: xpOf(Game, vid),
            candidate: { vid: vid, name: name, isDuty: !!(gate && gate.dutyHolder && gate.dutyHolder === vid) },
            dutyHolder: gate ? { vid: gate.dutyHolder, name: gate.dutyName } : null,
            gate: gate, pool: pool, poolDepth: pool ? pool.length : null,
            overwrote: overwrote };
        } catch (e) { errors.push('startExpedition-log: ' + String(e.message).slice(0, 80)); }
        const ret = origStart.apply(this, arguments);
        try {
          let landed = false, ex = null;
          try {
            ex = agencyExped(Game, vid);
            landed = !!ex;
          } catch (e) { landed = false; }
          if (row) {
            row.landed = landed;
            row.blockReason = landed ? null : deriveBlockReasonFromGate(gate, vid);
            if (ex) row.exped = { tx: ex.tx, ty: ex.ty, dist: ex.dist, duration: ex.duration,
              sinceDay: ex.sinceDay, sincePart: ex.sincePart };
            launches.push(row);
          }
        } catch (e) { errors.push('startExpedition-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('startExpedition-wrap-install: ' + String(e.message).slice(0, 80)); }

    try {
      const origReturn = Game.expeditionReturn;
      if (typeof origReturn !== 'function') errors.push('expeditionReturn-wrap: not a function');
      else Game.expeditionReturn = function (vid, playerAtHaven) {
        let ex = null, panBefore = 0, hpBefore = null;
        try {
          ex = cloneExped(agencyExped(Game, vid));
          panBefore = pantryKcal(Game);
          hpBefore = (((Game.state || {}).village || {}).health || {})[vid];
          if (hpBefore === undefined) hpBefore = null;
        } catch (e) { errors.push('expeditionReturn-pre: ' + String(e.message).slice(0, 80)); }
        const retDay = gday(Game), retPart = gpart(Game);
        const ret = origReturn.apply(this, arguments);
        try {
          if (ex) {
            const clockParts = (retDay - (ex.sinceDay || 0)) * 4 + (retPart - (ex.sincePart || 0));
            let alive = true;
            try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) alive = false; } catch (e) {}
            returns.push({ day: retDay, part: retPart, vid: vid, exped: ex,
              clockParts: clockParts, legs: ex.legs,
              findsKcal: (ex.finds || []).reduce(function (t, f) { return t + (f.kcal || 0); }, 0),
              pantryBefore: panBefore, pantryAfter: pantryKcal(Game),
              hpAtReturn: hpBefore, alive: alive, xpAtReturn: xpOf(Game, vid) });
          }
        } catch (e) { errors.push('expeditionReturn-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('expeditionReturn-wrap-install: ' + String(e.message).slice(0, 80)); }

    try {
      const origDeath = Game.expedDeath;
      if (typeof origDeath !== 'function') errors.push('expedDeath-wrap: not a function');
      else Game.expedDeath = function (vid, mName, nm, playerAtHaven, monsterId) {
        let ex = null;
        try { ex = cloneExped(agencyExped(Game, vid)); }
        catch (e) { errors.push('expedDeath-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origDeath.apply(this, arguments);
        try { expedDeaths.push({ day: gday(Game), part: gpart(Game), vid: vid, monster: mName || null, monsterId: monsterId || null, exped: ex }); }
        catch (e) { errors.push('expedDeath-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('expedDeath-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            dailySig.push({ day: d, alive: aliveCount(Game), pantryKcal: pantryKcal(Game) });
          }
        } catch (e) { errors.push('dailySig: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  let openExped = [];
  try {
    const exps = (((Game.state || {}).village || {}).agency || {}).exped || {};
    for (const vid of Object.keys(exps)) {
      const ex = cloneExped(exps[vid]);
      if (ex) openExped.push({ vid: vid, exped: ex, endDay: gday(Game) });
    }
  } catch (e) { errors.push('openExped: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const village = st.village || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryEnd = pantryKcal(Game);
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
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
    seed: seed, arm: 'expignite-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    scholarId: Game.villagerId || null,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    haven: { nx: village.px != null ? village.px : 4, ny: village.py != null ? village.py : 4 },
    endPantryKcal: pantryEnd,
    w3kills: w3kills, w4kills: w4kills, w5kills: w5kills,
    sayCount: sayCount, sayLines: sayLines,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    launches: launches, returns: returns, expedDeaths: expedDeaths,
    openExped: openExped, dailySig: dailySig,
    scoreRows: scoreRows, gateRows: gateRows, departRows: departRows,
    tickRows: tickRows, censusRows: censusRows,
  };
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('EXPIGNITE STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'expignite-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('EXPIGNITE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'expignite-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      launches: out.launches.length, landed: out.launches.filter(function (l) { return l.landed; }).length,
      blocked: out.launches.filter(function (l) { return !l.landed; }).length,
      blockedByReason: out.launches.filter(function (l) { return !l.landed; }).reduce(function (a, l) { a[l.blockReason || 'unknown-block'] = (a[l.blockReason || 'unknown-block'] || 0) + 1; return a; }, {}),
      scoreRows: out.scoreRows.length, gateRows: out.gateRows.length,
      departRows: out.departRows.length, tickRows: out.tickRows.length, censusRows: out.censusRows.length,
      returns: out.returns.length, expedDeaths: out.expedDeaths.length, openExped: out.openExped.length,
      dailySig: out.dailySig.length, sayLines: out.sayLines.length,
      deaths: out.deaths.length, w4kills: out.w4kills,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, deriveOrigin: deriveOrigin, cloneExped: cloneExped,
  deriveBlockReasonFromGate: deriveBlockReasonFromGate, gateSnapshot: gateSnapshot,
  launchEligiblePool: launchEligiblePool, deriveFirstTickGate: deriveFirstTickGate,
  scoreInputs: scoreInputs, tickGateSnapshot: tickGateSnapshot };
