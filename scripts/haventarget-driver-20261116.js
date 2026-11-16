// haventarget-driver-20261116.js — JUDGED driver, arm sim-haventarget-b
// (DIAG: expeditions targeting the Haven tile — awayhaven finding #2,
// tracker blank 9). Records EVERY expedition launched on the band:
// launch (destination + origin), return (legs/finds/clock/pantry),
// death on expedition, and any expedition still open at horizon.
// Two legs, zero src/js change: OFF = master as-is, recorder off
// (trajectory reference); ON = master as-is + recorder wraps only.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. All recorder wraps are pure reads plus writes to
// driver-local arrays — no game-state writes, no RNG draws.
// HAVENTARGET_RECORDER=off skips installing the wraps (determinism
// leg D2).
// Usage:
//   MODE=off OUTDIR=perseed-haventarget-b-off SEEDS=102201,102202 RUN=haventarget-b node scripts/haventarget-driver-20261116.js
//   MODE=on  OUTDIR=perseed-haventarget-b-on  SEEDS=102201,102202 RUN=haventarget-b node scripts/haventarget-driver-20261116.js
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
const RUN = process.env.RUN || 'haventarget-b';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-haventarget-b-' + MODE);
const RECORDER_ON = process.env.HAVENTARGET_RECORDER !== 'off';

if (MODE !== 'off' && MODE !== 'on') { console.error('HAVENTARGET STOP: MODE must be off|on, got ' + JSON.stringify(MODE)); process.exit(2); }

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
// deriveBlockReason: why a startExpedition call landed nothing —
// pure reads only, in startExpedition's own gate order (medic duty,
// heal check, sick, range). 'unknown-block' means no read explains
// it; the analyzer counts those.
function deriveBlockReason(Game, vid) {
  try { if (Game.medicDutyHolder && Game.medicDutyHolder() === vid) return 'medic-duty'; } catch (e) {}
  try { if (((Game.state.village || {}).sick || {})[vid]) return 'sick'; } catch (e) {}
  try { if (Game.npcMaxDist && Game.npcMaxDist(vid) < 1) return 'range-0'; } catch (e) {}
  try {
    const cur = (((Game.state.village || {}).health || {})[vid] !== undefined)
      ? ((Game.state.village || {}).health || {})[vid] : 100;
    if (cur < 70 && !usableMedicineExists(Game) && !hasCampHealer(Game, vid)) return 'hurt-no-care';
  } catch (e) {}
  return 'unknown-block';
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

const SAY_RE = /expedition|shoulders a pack|back from|🎒|🧭/i;

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'haventarget-' + MODE, fullTelemetry: false });
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
        try {
          const stack = (new Error().stack || '').split('\n').slice(1, 9).join('\n');
          const hasOpts = !!(opts && opts.tx != null && opts.ty != null);
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
            plan: plan, dawnCommit: commit, xpAtLaunch: xpOf(Game, vid) };
        } catch (e) { errors.push('startExpedition-log: ' + String(e.message).slice(0, 80)); }
        const ret = origStart.apply(this, arguments);
        try {
          // The launch either landed (exped record exists) or the
          // callee returned early (sick / hurt / medic-duty block).
          // Record the outcome AFTER the call, on the same row.
          let landed = false, ex = null;
          try {
            ex = agencyExped(Game, vid);
            landed = !!ex;
          } catch (e) { landed = false; }
          if (row) {
            row.landed = landed;
            row.blockReason = landed ? null : deriveBlockReason(Game, vid);
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

  const out = {
    seed: seed, arm: 'haventarget-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, recorderOn: RECORDER_ON,
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
  if (!SEEDS.length) { console.error('HAVENTARGET STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'haventarget-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('HAVENTARGET STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'haventarget-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      launches: out.launches.length, landed: out.launches.filter(function (l) { return l.landed; }).length,
      returns: out.returns.length, expedDeaths: out.expedDeaths.length, openExped: out.openExped.length,
      dailySig: out.dailySig.length, sayLines: out.sayLines.length,
      deaths: out.deaths.length, w4kills: out.w4kills,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, deriveOrigin: deriveOrigin, cloneExped: cloneExped };
