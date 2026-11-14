// rageprecheck-driver-20261114.js — engine precheck (B) check
// (arm sim-rageprecheck-b, run fleshout-loop-b-20261114T0330Z).
// Copied from scripts/rageloop-driver-20261113.js on branch sim-rageloop-b
// (NOT re-derived); adapted only: evidence dir 2026-11-14, arm label
// rageprecheck-b, primary counts SUCCESSFUL presses only (a refused
// re-press costs nothing and is not waste), refused presses counted
// separately, caller classified from the stack (capable-path vs
// competent-fallback-path inside a capable run).
// Steeple-driver shape: wraps Game.useAbility (logs every rage press
// with its pre-state: rageActive rounds or null) and Game.tbPlayerStrike
// (counts strikes landed via monster-HP delta), plus Game.say for the
// rage narration lines (sense-testing sample). Per-seed JSON to
// evidence/2026-11-13/perseed-rageloop-b-{before,after}/ (OUTDIR env).
// Policies: competent (the lever policy) + capable (already-guarded
// contrast). Horizon 150d death-aware. Seeds 98801-98808 (pilot).
// Usage:
//   SEEDS=98801,98802 POLICY=competent,capable DAYS=150 RUN=rageprecheck-b-before \
//     OUTDIR=perseed-rageprecheck-b-before node scripts/rageprecheck-driver-20261114.js
// As a module: require('./rageloop-driver-20261113').oneRun(seed, policyName)
// returns the per-seed summary (used by test-rageloop-b.js §3).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { capable } = require(path.join(REPO, 'scripts', 'policies', 'capable'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const POLICIES = (process.env.POLICY ? process.env.POLICY.split(',').map(function (s) { return s.trim(); }) : ['competent', 'capable']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'rageprecheck-b';
const OUTDIR = process.env.OUTDIR || 'perseed-rageprecheck-b-before';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

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

const RAGE_RE = /The red comes down\. Your next 3 strikes deal \+100% damage/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function fightId(Game) { try { return (Game.tbfight && Game.tbfight.id) || null; } catch (e) { return null; } }
function fightRound(Game) { try { return (Game.tbfight && Game.tbfight.round) || null; } catch (e) { return null; } }
function monsterHpSum(Game) {
  try {
    const f = Game.tbfight;
    if (!f || !f.fighters) return null;
    return f.fighters.reduce(function (s, x) { return s + ((x && x.kind === 'monster' && (x.hp || 0) > 0) ? (x.hp || 0) : 0); }, 0);
  } catch (e) { return null; }
}

async function oneRun(seed, policyName) {
  const policy = policyName === 'capable' ? capable : competent;
  if (policyName !== 'competent' && policyName !== 'capable') throw new Error('Unknown policy ' + policyName);
  const { Game } = await loadGame({ seed: seed, mode: 'rageprecheck-' + policyName, fullTelemetry: false });
  const rageLines = [];
  const ragePresses = [];
  let strikesAttempted = 0, strikesLanded = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && RAGE_RE.test(String(arg))) {
          rageLines.push({ day: gday(Game), fight: fightId(Game), round: fightRound(Game), line: String(arg).slice(0, 300) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origUse = Game.useAbility;
    if (typeof origUse === 'function') {
      Game.useAbility = function (aid, act, target) {
        let pre = null;
        if (aid === 'rage' && act === 'unleash_rage') {
          try {
            const s = (Game.state || {}).scholar || {};
            const ra = s.rageActive || null;
            pre = {
              day: gday(Game), fight: fightId(Game), round: fightRound(Game),
              rageActiveRounds: ra ? (ra.rounds ?? null) : null,
              rageActive: !!ra, kcal: s.kcal ?? null,
            };
          } catch (e) { errors.push('rage-pre: ' + String(e.message).slice(0, 80)); }
        }
        let ret = null;
        try { ret = origUse.apply(this, arguments); } catch (e) { throw e; }
        if (pre) {
          pre.returned = ret;
          try {
            const st = (new Error('rage-caller').stack || '');
            const lines = st.split('\n');
            let caller = 'unknown';
            for (const ln of lines) {
              if (ln.indexOf('policies/competent.js') !== -1) { caller = 'competent'; break; }
              if (ln.indexOf('policies/capable.js') !== -1) { caller = 'capable'; break; }
            }
            // Inside a capable run, a competent.js frame means capable's
            // fallback into competent's fight code (capable.js:471).
            pre.caller = (policyName === 'capable' && caller === 'competent') ? 'competent-fallback' : caller;
          } catch (e) { pre.caller = 'unknown'; }
          ragePresses.push(pre);
        }
        return ret;
      };
    } else errors.push('useAbility-wrap: not a function');
  } catch (e) { errors.push('useAbility-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origStrike = Game.tbPlayerStrike;
    if (typeof origStrike === 'function') {
      Game.tbPlayerStrike = function (targetKey) {
        const before = monsterHpSum(Game);
        let ret = null;
        try { ret = origStrike.apply(this, arguments); } catch (e) { throw e; }
        try {
          if (ret) {
            strikesAttempted++;
            const after = monsterHpSum(Game);
            if (before != null && after != null && after < before) strikesLanded++;
          }
        } catch (e) { errors.push('strike-count: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('tbPlayerStrike-wrap: not a function');
  } catch (e) { errors.push('tbPlayerStrike-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let waveKills = {};
  try { waveKills = Object.assign({}, st.waveKills || {}); } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  // PRIMARY (prereg): SUCCESSFUL presses only — a refused re-press
  // costs no turn/kcal and is not waste. Refused presses are counted
  // separately as proof the engine choke point fired.
  let rageFresh = 0, rageRefresh = 0, rageRefreshUnspent = 0, rageRefreshPartly = 0, rageKcal = 0;
  let rageRefused = 0, rageRefusedUnspent = 0, rageRefusedPartly = 0;
  const ragePerFight = {};
  const rageByCaller = {};
  for (const p of ragePresses) {
    const c = p.caller || 'unknown';
    rageByCaller[c] = rageByCaller[c] || { presses: 0, fresh: 0, refreshUnspent: 0, refreshPartly: 0, refused: 0, refusedUnspent: 0 };
    rageByCaller[c].presses++;
    if (!p.returned) {
      rageRefused++;
      rageByCaller[c].refused++;
      if (p.rageActive) {
        if (p.rageActiveRounds === 3) { rageRefusedUnspent++; rageByCaller[c].refusedUnspent++; }
        else { rageRefusedPartly++; }
      }
      continue;
    }
    if (!p.rageActive) { rageFresh++; rageByCaller[c].fresh++; }
    else {
      rageRefresh++;
      if (p.rageActiveRounds === 3) { rageRefreshUnspent++; rageByCaller[c].refreshUnspent++; }
      else { rageRefreshPartly++; rageByCaller[c].refreshPartly++; }
    }
    rageKcal += 60;
    const k = String(p.fight || '?');
    ragePerFight[k] = (ragePerFight[k] || 0) + 1;
  }
  let rageMaxPerFight = 0, rageMaxFight = null;
  for (const k of Object.keys(ragePerFight)) {
    if (ragePerFight[k] > rageMaxPerFight) { rageMaxPerFight = ragePerFight[k]; rageMaxFight = k; }
  }

  return {
    seed: seed, policy: policyName, arm: 'rageloop-b', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    waveKills: waveKills,
    rageCount: rageLines.length,
    ragePressCount: ragePresses.length, ragePressFresh: rageFresh,
    ragePressRefresh: rageRefresh, ragePressRefreshUnspent: rageRefreshUnspent,
    ragePressRefreshPartly: rageRefreshPartly,
    ragePressRefused: rageRefused, ragePressRefusedUnspent: rageRefusedUnspent,
    ragePressRefusedPartly: rageRefusedPartly, rageByCaller: rageByCaller,
    rageKcal: rageKcal, rageMaxPerFight: rageMaxPerFight, rageMaxPerFightId: rageMaxFight,
    ragePresses: ragePresses, rageLines: rageLines.slice(0, 40),
    strikesAttempted: strikesAttempted, strikesLanded: strikesLanded,
    deaths: deaths, instrumentErrors: errors,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('RAGEPRECHECK STOP: SEEDS required.'); process.exit(2); }
  if (!POLICIES.length) { console.error('RAGEPRECHECK STOP: POLICY required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-14', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const file = path.join(outDir, 'rageprecheck-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('RAGEPRECHECK STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const out = await oneRun(seed, pol);
    const file = path.join(outDir, 'rageprecheck-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      waveKills: out.waveKills,
      ragePresses: out.ragePressCount, rageFresh: out.ragePressFresh,
      rageRefresh: out.ragePressRefresh, rageRefreshUnspent: out.ragePressRefreshUnspent,
      rageRefreshPartly: out.ragePressRefreshPartly,
      rageRefused: out.ragePressRefused, rageRefusedUnspent: out.ragePressRefusedUnspent,
      rageByCaller: out.rageByCaller,
      rageKcal: out.rageKcal, rageMaxPerFight: out.rageMaxPerFight,
      strikesAttempted: out.strikesAttempted, strikesLanded: out.strikesLanded,
      deaths: out.deaths.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, RAGE_RE: RAGE_RE };
