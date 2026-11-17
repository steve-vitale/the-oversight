// companionguard-driver-20261116.js — JUDGED driver, arm sim-companionguard-b
// (BUILD: the companion call clobbers a live expedition — findings
// backlog #2462, evidence/2026-11-16/sim-medicduty-b.md §Overwritten
// trips). Extends the medicduty recorder
// (scripts/medicduty-driver-20261116.js): the same launch/return/
// death/open-expedition rows, gate snapshot, launch-eligible pool,
// and the pre-call `overwrote` capture — PLUS the guard-skip capture
// this arm needs: the pre-call expedition record OBJECT (reference,
// not clone) and the village companionGuardSkips counter, so a call
// the guard skips is distinguishable from a call that lands (a skip
// leaves the OLD record in place, so "record exists after the call"
// is not landing). Two legs on the SAME guard-commit tree, differing
// only by env: CONTROL (MODE=off, COMPANIONGUARD unset) vs ARMED
// (MODE=on, COMPANIONGUARD=1). Both legs run the recorder; the
// recorder is the instrument, the guard is the lever. Policy:
// competent verbatim (scripts/policies/competent.js), 150d
// death-aware. All recorder wraps are pure reads plus writes to
// driver-local arrays — no game-state writes, no RNG draws.
// COMPANIONGUARD_RECORDER=off skips installing the wraps
// (determinism leg D2).
// Usage:
//   MODE=off OUTDIR=perseed-companionguard-b-control SEEDS=103021,103022 RUN=companionguard-b node scripts/companionguard-driver-20261116.js
//   COMPANIONGUARD=1 MODE=on OUTDIR=perseed-companionguard-b-armed SEEDS=103021,103022 RUN=companionguard-b node scripts/companionguard-driver-20261116.js
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
const RUN = process.env.RUN || 'companionguard-b';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-companionguard-b-' + MODE);
const RECORDER_ON = process.env.COMPANIONGUARD_RECORDER !== 'off';
// Guard env: the lever under test. MODE=on REQUIRES the guard on and
// MODE=off FORBIDS it — the two legs must differ ONLY by the guard,
// never by an ambient env leak.
const GUARD_ON = process.env.COMPANIONGUARD === '1';

if (MODE !== 'off' && MODE !== 'on') { console.error('COMPANIONGUARD STOP: MODE must be off|on, got ' + JSON.stringify(MODE)); process.exit(2); }
if (MODE === 'on' && !GUARD_ON) { console.error('COMPANIONGUARD STOP: MODE=on requires COMPANIONGUARD=1.'); process.exit(2); }
if (MODE === 'off' && GUARD_ON) { console.error('COMPANIONGUARD STOP: MODE=off forbids COMPANIONGUARD=1.'); process.exit(2); }

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
// taken BEFORE the original call runs. The heal check can patch a
// villager (HP up, medicine spent) and the medic-duty gate runs
// before all of it, so a post-call read would rewrite the reason:
// a villager both sick and hurt-without-care is blocked by the heal
// check, not by sickness. The analyzer re-derives the reason from
// these raw fields (D3).
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
// deriveBlockReasonFromGate: why a startExpedition call landed
// nothing, in startExpedition's own gate order (villager-agency.js:
// medic-duty gate, then villagerHealCheck, then sick, then range).
// 'unknown-block' means no read explains it; the analyzer counts
// those. Exported for the proof test; the analyzer re-implements it
// independently (D3).
function deriveBlockReasonFromGate(gate, vid) {
  if (!gate) return 'unknown-block';
  if (!gate.directed && gate.dutyHolder && gate.dutyHolder === vid) return 'medic-duty';
  if (gate.health != null && gate.health < 70 && !gate.medicineExists && !gate.campHealer) return 'hurt-no-care';
  if (gate.sick) return 'sick';
  if (gate.maxDist != null && gate.maxDist < 1) return 'range-0';
  return 'unknown-block';
}
// launchEligiblePool: the villagers who COULD have been the dawn
// candidate instead — launch-eligible by startExpedition's gates,
// excluding the candidate themself and the duty holder. Pure reads
// only (roster + camp + health + sick + away + expedition + maxDist).
// The candidate-selection question ("did anyone else exist?") is
// answered by poolDepth, not by the gate alone.
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
  // Pure read: an absent xp entry means zeros by construction
  // (agencyOf creates {tracking:0, survival:0, bravery:0}).
  try {
    const x = (((Game.state || {}).village || {}).agency || {}).xp || {};
    const e = x[vid];
    if (!e) return { tracking: 0, survival: 0 };
    return { tracking: e.tracking != null ? e.tracking : 0, survival: e.survival != null ? e.survival : 0 };
  } catch (e2) { return null; }
}
// planOfRaw: the launch-time win-plan snapshot as a PURE read.
// winPlanOf CREATES a plan when none exists (win-plan.js:218)
// — calling it in a recorder wrap writes game state and moves
// trajectories (caught by D2, 2026-11-16). Never call it here.
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
// agencyState() initializes agency sub-state (and transfers
// pending potential) — same no-write rule as planOfRaw.
function agencyExped(Game, vid) {
  try { return ((((Game.state || {}).village || {}).agency || {}).exped || {})[vid] || null; }
  catch (e) { return null; }
}

// deriveOrigin(stack, hasOpts): stack-derived launch origin. Order
// matters: win-plan and vbrain launches run THROUGH the agency tick,
// so their stacks also contain villager-agency.js frames — the
// directed callers must be checked first. The analyzer re-derives
// this from the raw stackTop (D3); the driver stores both.
function deriveOrigin(stack, hasOpts) {
  if (!stack) return 'unknown';
  if (stack.indexOf('win-plan.js') !== -1) return 'winplan-party_launch';
  if (stack.indexOf('villager-brain.js') !== -1) return 'vbrain-party_launch';
  if (stack.indexOf('villager-agency.js') !== -1) return hasOpts ? 'directed-other' : 'random-agency';
  return 'unknown';
}

const SAY_RE = /expedition|shoulders a pack|back from|🎒|🧭|camp healer|no healer|doctoring|medic/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'companionguard-' + MODE, fullTelemetry: false });
  const errors = [];
  const launches = [];
  const returns = [];
  const expedDeaths = [];
  const dailySig = [];
  const sayLines = [];
  let sayCount = 0;

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

  // ---- EXPEDITION RECORDER (pure reads + driver-local writes) ----
  if (RECORDER_ON) {
    try {
      const origStart = Game.startExpedition;
      if (typeof origStart !== 'function') errors.push('startExpedition-wrap: not a function');
      else Game.startExpedition = function (vid, hx, hy, announce, opts) {
        let row = null;
        let gate = null, pool = null;
        // Guard-skip capture (this arm): the pre-call record OBJECT
        // (reference) and the village guard counter, declared at wrap
        // scope so the post-call block can see them. A guard skip
        // leaves the old record in place (same object), and a gate
        // block does the same — so identity, not existence, decides
        // landing, and the counter is the exact discriminator.
        let preExpedRef = null, preGuardCount = 0;
        try {
          const stack = (new Error().stack || '').split('\n').slice(1, 9).join('\n');
          const hasOpts = !!(opts && opts.tx != null && opts.ty != null);
          // Pre-call gate snapshot + pool: the heal check can patch
          // the villager (HP up, medicine spent) once the call runs,
          // so the reason and the pool must be read BEFORE origStart.
          try { gate = gateSnapshot(Game, vid, hasOpts); } catch (e) { gate = null; }
          try { pool = launchEligiblePool(Game, vid, gate); } catch (e) { pool = null; }
          // Overwrite capture: a startExpedition call for a villager
          // who is ALREADY on an expedition replaces the live record
          // outright (no already-out guard — a companion call can
          // clobber the companion's own trip, losing its legs/finds
          // with no return ever firing). Clone the live record
          // before the call so the analyzer can name the orphan.
          // On the ARMED leg a skip keeps this record: `overwrote`
          // on a skipped row is the trip that SURVIVED, not one that
          // was lost — the analyzer separates them by `landed`.
          let overwrote = null;
          try { overwrote = cloneExped(agencyExped(Game, vid)); } catch (e) { overwrote = null; }
          try { preExpedRef = agencyExped(Game, vid); } catch (e) { preExpedRef = null; }
          try { preGuardCount = ((((Game.state || {}).village || {}).companionGuardSkips) || 0); } catch (e) { preGuardCount = 0; }
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
          row = { day: gday(Game), part: gpart(Game), vid: vid, name: name, profile: profile,
            hx: hx, hy: hy, node: node,
            optsTx: hasOpts ? opts.tx : null, optsTy: hasOpts ? opts.ty : null,
            optsDuration: (opts && opts.duration != null) ? opts.duration : null,
            hasOpts: hasOpts, stackTop: stack, origin: deriveOrigin(stack, hasOpts),
            plan: plan, dawnCommit: commit, xpAtLaunch: xpOf(Game, vid),
            // Medic-duty candidacy (this arm): the dawn-brain
            // candidate, the duty holder at call time, the raw gate
            // fields, and the launch-eligible non-duty pool.
            candidate: { vid: vid, name: name, isDuty: !!(gate && gate.dutyHolder && gate.dutyHolder === vid) },
            dutyHolder: gate ? { vid: gate.dutyHolder, name: gate.dutyName } : null,
            gate: gate, pool: pool, poolDepth: pool ? pool.length : null,
            // The live expedition this call replaced, if any (null
            // when the villager was not out). Only a LANDED call
            // overwrites; a blocked call leaves the record intact.
            // On a guard-skipped row this is the record that was
            // KEPT (the companion's own trip survives).
            overwrote: overwrote,
            // Guard-skip raw fields (D3): whether a live record
            // existed before the call, and the village guard counter
            // before the call (the post-call value is added below).
            hadLiveExped: !!preExpedRef, preGuardCount: preGuardCount };
        } catch (e) { errors.push('startExpedition-log: ' + String(e.message).slice(0, 80)); }
        const ret = origStart.apply(this, arguments);
        try {
          // The launch either landed (a FRESH exped record exists) or
          // the callee returned early (sick / hurt / medic-duty block
          // — or the companion guard, which leaves the OLD record in
          // place). Landing is object IDENTITY: the old record still
          // existing after the call is a skip/block, not a landing.
          // Record the outcome AFTER the call, on the same row — but
          // the reason comes from the PRE-CALL gate snapshot (or the
          // guard counter, for guard skips).
          let landed = false, guardSkipped = false, ex = null, postGuardCount = 0;
          try { ex = agencyExped(Game, vid); } catch (e) { ex = null; }
          try { postGuardCount = ((((Game.state || {}).village || {}).companionGuardSkips) || 0); } catch (e) { postGuardCount = 0; }
          try {
            guardSkipped = (postGuardCount > preGuardCount) ||
              (GUARD_ON && !!preExpedRef && ex === preExpedRef);
          } catch (e) { guardSkipped = false; }
          landed = !!ex && ex !== preExpedRef && !guardSkipped;
          if (row) {
            row.landed = landed;
            row.guardSkipped = guardSkipped;
            row.postGuardCount = postGuardCount;
            row.blockReason = guardSkipped ? 'companion-guard' : (landed ? null : deriveBlockReasonFromGate(gate, vid));
            if (landed && ex) row.exped = { tx: ex.tx, ty: ex.ty, dist: ex.dist, duration: ex.duration,
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

  // Open expeditions at end of run (launched, never returned).
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
  // Wave-kill ledger counts (waveKillLog entries carry .w and .by).
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

  // Guard-skip totals for this seed (this arm): rows the guard
  // skipped + the village counter at end of run (cross-check — the
  // counter counts every guard firing, the rows count every
  // recorded call; they agree unless a skip happened outside a
  // recorded call, which cannot happen: every startExpedition call
  // runs through the wrap when the recorder is on).
  let guardSkipsState = 0;
  try { guardSkipsState = (((Game.state || {}).village || {}).companionGuardSkips) || 0; } catch (e) { guardSkipsState = 0; }
  const out = {
    seed: seed, arm: 'companionguard-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, recorderOn: RECORDER_ON,
    guardOn: GUARD_ON,
    guardSkips: launches.filter(function (l) { return !!l.guardSkipped; }).length,
    guardSkipsState: guardSkipsState,
    policySha: POLICY_SHA, policy: 'competent',
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
  };
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('COMPANIONGUARD STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'companionguard-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('COMPANIONGUARD STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'companionguard-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      guardOn: out.guardOn, guardSkips: out.guardSkips, guardSkipsState: out.guardSkipsState,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      launches: out.launches.length, landed: out.launches.filter(function (l) { return l.landed; }).length,
      blocked: out.launches.filter(function (l) { return !l.landed; }).length,
      blockedByReason: out.launches.filter(function (l) { return !l.landed; }).reduce(function (a, l) { a[l.blockReason || 'unknown-block'] = (a[l.blockReason || 'unknown-block'] || 0) + 1; return a; }, {}),
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
  launchEligiblePool: launchEligiblePool };
