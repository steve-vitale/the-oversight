// winplandepart-driver-b.js — JUDGED driver, arm sim-winplandepart-b
// (DIAGNOSTIC: exercise the win-plan depart path, which has NEVER been
// measured firing — 0/17 on the LP band, 0/43 on the triodrought band.
// The trigger is a gate, not a seed: winPlanDepart is called only from
// villager-agency.js:446, in the branch taken when vbrainOwnsDawn() is
// FALSE — and vbrainOwnsDawn() returns true unconditionally
// (villager-brain.js:738, since phase-1 brain, commit 1671d28b8).
// This driver stages the path by overriding Game.vbrainOwnsDawn to
// false (harness-level, after loadGame, before setupGame; asserted +
// recorded as brainOff:true in every corpus file). The override is
// BROAD — ALL dawn decisions revert to legacy (chance rolls +
// winPlanDepart) — so this leg's survival/standing numbers describe
// staged legacy mode, not live mode, and are never judged as a lever
// effect. The driver touches no game file.
//   Recorder: every winPlanDepart call (return, stage, needWave,
// party after, partyTrios before/after); every winPlanSecondCompanion
// pick with its caller frame (stack read, pure — only picks called
// from winPlanDepart count as launch-time re-picks; the dawn pass
// also calls it); every vbrainExecuteDepart call (expect 0 —
// agencyTick never calls it when the brain is off).
// Policy: competent verbatim, 150d death-aware. Pilot band
// 104021-104028 (fresh — see prereg). Substrate VETREENGAGE=1 +
// PARTYSIZE4=1 + FLEEREPAIR2=1 (FIGHTALLY2 unset, LAUNCHPARTY unset).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 MODE=brainoff OUTDIR=perseed-winplandepart-b-brainoff SEEDS=104021,104022 RUN=winplandepart-b node scripts/winplandepart-driver-b.js
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
const RUN = process.env.RUN || 'winplandepart-b';
const MODE = process.env.MODE || 'brainoff';
const OUTDIR = process.env.OUTDIR || ('perseed-winplandepart-b-' + MODE);

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
let BRAIN_SHA = 'unknown';
let WINPLAN_SHA = 'unknown';
try {
  BRAIN_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8')).digest('hex').slice(0, 12);
  WINPLAN_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8')).digest('hex').slice(0, 12);
} catch (e) {}

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
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// firstCallerFrame(stack): the first stack frame BELOW the wrap itself
// (the wrap's own frame + the Error-construction frame are skipped),
// truncated — recorded on the row so a pick's caller can be audited.
function firstCallerFrame(stack) {
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i] || '';
      if (/winplandepart-driver-b\.js/.test(l)) continue;
      if (/at Object\.|at Game\.winPlanSecondCompanion/.test(l) && /win-plan\.js/.test(l)) continue;
      return l.trim().slice(0, 160);
    }
    return lines.length ? lines[0].trim().slice(0, 160) : 'unknown-no-stack';
  } catch (e) { return 'unknown-stack-error'; }
}
function callerKind(frame) {
  if (!frame) return 'unknown';
  if (frame.indexOf('winPlanDepart') !== -1) return 'winPlanDepart';
  if (frame.indexOf('winPlanCands') !== -1 || frame.indexOf('villager-brain.js') !== -1) return 'brain-dawn';
  return 'other';
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'winplandepart-' + MODE, fullTelemetry: false });
  const errors = [];

  // ---- BRAINOFF STAGING (the trigger) ----
  // The depart path fires only when vbrainOwnsDawn() is false. On this
  // tip it returns true unconditionally, so the driver overrides it at
  // the harness level (no game file touched) and asserts the override.
  try {
    Game.vbrainOwnsDawn = function () { return false; };
    if (Game.vbrainOwnsDawn() !== false) throw new Error('override did not take (pre-setup)');
  } catch (e) { throw new Error('WINPLANDEPART STOP: BRAINOFF override failed: ' + String(e.message)); }

  await setupGame(Game);
  try {
    if (typeof Game.vbrainOwnsDawn !== 'function' || Game.vbrainOwnsDawn() !== false) {
      Game.vbrainOwnsDawn = function () { return false; };
      if (Game.vbrainOwnsDawn() !== false) throw new Error('override did not take (post-setup)');
    }
  } catch (e) { throw new Error('WINPLANDEPART STOP: BRAINOFF override failed post-setup: ' + String(e.message)); }

  const departCalls = [];
  const secondPicks = [];
  const brainCalls = [];
  function planOf(vid) { try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; } }
  function triosNow() {
    try { const s = Game.winPlanStats ? Game.winPlanStats() : null; return (s && s.partyTrios != null) ? s.partyTrios : null; } catch (e) { return null; }
    try { const v = (Game.state || {}).village || {}; return (v.winPlanStats && v.winPlanStats.partyTrios != null) ? v.winPlanStats.partyTrios : null; } catch (e2) { return null; }
  }

  try {
    const origDepart = Game.winPlanDepart;
    if (typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        const before = planOf(vid);
        const triosBefore = triosNow();
        const ret = origDepart.apply(this, arguments);
        try {
          const plan = planOf(vid);
          if (before || plan) {
            departCalls.push({ day: gday(Game), vid: vid, result: ret,
              stageBefore: before ? (before.stage || null) : null,
              stageAfter: plan ? (plan.stage || null) : null,
              target: plan ? (plan.target || null) : (before ? (before.target || null) : null),
              targetWave: plan ? (plan.needWave != null ? plan.needWave : null) : (before ? (before.needWave != null ? before.needWave : null) : null),
              party: plan ? (plan.party || []).slice() : [],
              partySize: plan && plan.party ? plan.party.length + 1 : 1,
              triosBefore: triosBefore, triosAfter: triosNow() });
          }
        } catch (e) { errors.push('depart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origPick = Game.winPlanSecondCompanion;
    if (typeof origPick === 'function') {
      Game.winPlanSecondCompanion = function (vid, hx, hy, firstCid) {
        let frame = 'unknown-no-stack';
        try { frame = firstCallerFrame((new Error('winplandepart-caller')).stack || ''); } catch (e) {}
        const ret = origPick.apply(this, arguments);
        try {
          secondPicks.push({ day: gday(Game), vid: vid, firstCid: firstCid || null,
            pick: ret || null, caller: callerKind(frame), callerFrame: frame });
        } catch (e) { errors.push('secondpick-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanSecondCompanion-wrap: not a function');
  } catch (e) { errors.push('winPlanSecondCompanion-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origBrain = Game.vbrainExecuteDepart;
    if (typeof origBrain === 'function') {
      Game.vbrainExecuteDepart = function (vid, hx, hy, playerAtHaven) {
        const ret = origBrain.apply(this, arguments);
        try { brainCalls.push({ day: gday(Game), vid: vid, result: ret }); } catch (e) { errors.push('brain-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('vbrainExecuteDepart-wrap: not a function');
  } catch (e) { errors.push('vbrainExecuteDepart-wrap-install: ' + String(e.message).slice(0, 80)); }

  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}
  let ready4 = null, ready5 = null, ladderVets4 = null, winPlanStats = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { winPlanStats = (typeof Game.winPlanStats === 'function') ? Game.winPlanStats() : null; } catch (e) { errors.push('winPlanStats: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  return {
    seed: seed, arm: 'winplandepart-b', run: RUN, mode: MODE, leg: MODE,
    brainOff: true, brainOwnsDawn: false,
    anchorCommit: ANCHOR, brainSha: BRAIN_SHA, winplanSha: WINPLAN_SHA,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    departCalls: departCalls, secondPicks: secondPicks, brainCalls: brainCalls,
  };
}

if (require.main === module) (async function () {
  if (MODE !== 'brainoff') { console.error('WINPLANDEPART STOP: MODE must be brainoff, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('WINPLANDEPART STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('WINPLANDEPART STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('WINPLANDEPART STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 === '1') { console.error('WINPLANDEPART STOP: FIGHTALLY2 must be unset.'); process.exit(2); }
  if (process.env.LAUNCHPARTY === '1') { console.error('WINPLANDEPART STOP: LAUNCHPARTY must be unset.'); process.exit(2); }
  if (!SEEDS.length) { console.error('WINPLANDEPART STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-18', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'winplandepart-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('WINPLANDEPART STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'winplandepart-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, brainOff: out.brainOff,
      anchor: (out.anchorCommit || '').slice(0, 12),
      brainSha: out.brainSha, winplanSha: out.winplanSha,
      policySha: out.policySha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      deaths: out.deaths.length,
      departCalls: out.departCalls.length,
      departLaunches: out.departCalls.filter(function (r) { return r.result === 'launch'; }).length,
      departW4Launches: out.departCalls.filter(function (r) { return r.result === 'launch' && (r.targetWave | 0) >= 4; }).length,
      secondPicks: out.secondPicks.length,
      secondPicksDepart: out.secondPicks.filter(function (r) { return r.caller === 'winPlanDepart'; }).length,
      brainCalls: out.brainCalls.length,
      partyTrios: out.winPlanStats ? out.winPlanStats.partyTrios : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, firstCallerFrame: firstCallerFrame, callerKind: callerKind };
