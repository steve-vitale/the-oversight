// steeple-check-driver-20261113.js — Unleash Rage + Steeple narration
// current-master CHECK (arm sim-steeple-a, run fleshout-20261113T1615Z).
// Step 1 only: reproduce the counts on current master and determine each
// line's trigger (per-attack vs per-round vs per-fight re-application).
// Competent policy verbatim, 150d death-aware, seeds 190391-190398
// (matched band) + 190407 (targeted: the applystatus-a band already
// contains the exact observation seed 190396 d130, Congregation fight,
// rage x17 + steeple x57).
// Wraps Game.say (captures both target lines + ignition beats +
// freezeline/applystatus controls + bellow context), Game.useAbility
// (logs every rage press with its pre-state: rageActive rounds or null),
// and MonsterBehaviorHooks.sigCongregation (logs every hook call with
// monster key + sigCong phase/cycle, and whether the steeple line fired
// inside that call — precise per-(fight, monster) attribution).
// Per-seed JSON to evidence/2026-11-13/perseed-steeple-a-check/
// (writeRobust, flap-proof, refuse-overwrite). Refuses to run unless HEAD
// is exactly the prereg commit 05b9bb4553d1acab5490245508f4191746114d2a
// (or EXPECTED_ANCHOR override for the after leg).
// Usage:
//   SEEDS=190391,190392 DAYS=150 RUN=steeple-check node scripts/steeple-check-driver-20261113.js
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
const RUN = process.env.RUN || 'steeple-check';
// Anchor override for the AFTER leg: the after leg runs on the fix
// commit, not the prereg commit — pass EXPECTED_ANCHOR=<fix-sha>.
// The guard still refuses any other HEAD; the per-seed JSON records
// the anchor it actually ran on, so a mislabeled leg is impossible.
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || '05b9bb4553d1acab5490245508f4191746114d2a';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (ANCHOR !== EXPECTED_ANCHOR) {
    console.error('STEEPLE STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the expected anchor ' + EXPECTED_ANCHOR.slice(0, 12) + ' — check out that commit first (see prereg).');
    process.exit(2);
  }
}

// FLAP SHAPE (measured 2026-11-12 04:19–04:23Z): clear windows last
// ~1–2s and recur every ~2–3 min. Sample every 250ms for up to 120s.
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
const STEEPLE_RE = /steeple RINGS \u2014 the bell is the telegraph\. ABSOLUTION falls like a beam/;
const IGNITE_ABSOLUTION_RE = /\uD83D\uDCA5 Absolution!/;
const IGNITE_EXCOMM_RE = /\uD83D\uDCA5 Excommunication!/;
// The Congregation INVITE line (sigW4.js:164) — added after the check leg
// to measure the invite/absolve alternation (same hook, second line).
// It is a CONTROL for the after leg: the fix never touches the invite
// branch, so this count must be byte-identical before/after.
const INVITE_RE = /steeple RINGS \u2014 one clear note\. The chapel doors swing wide/;
// Controls (after-leg totals from the sibling arms on this band).
const FREEZELINE_RE = /still frozen from your scream/i;
const APPLY_RE = /is frozen \u2014 .*\(stunned: no movement\)/i;
const BELLOW_RE = /BELLOWS? — raw, wordless/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function fightId(Game) { try { return (Game.tbfight && Game.tbfight.id) || null; } catch (e) { return null; } }
function fightRound(Game) { try { return (Game.tbfight && Game.tbfight.round) || null; } catch (e) { return null; } }

function countByDay(list) {
  const by = {};
  for (const e of list) by[e.day] = (by[e.day] || 0) + 1;
  return by;
}

// Largest identical-text group on one seed-day: the repeat metric.
function maxGroup(lines) {
  const groups = {};
  for (const e of lines) {
    const k = e.day + '|' + e.line;
    groups[k] = (groups[k] || 0) + 1;
  }
  let best = { size: 0, day: null, line: null };
  for (const k of Object.keys(groups)) {
    if (groups[k] > best.size) {
      const bar = k.indexOf('|');
      best = { size: groups[k], day: parseInt(k.slice(0, bar), 10), line: k.slice(bar + 1) };
    }
  }
  return best;
}

// Largest count of one line per (fight, monster-key): the dedup metric.
// For rage lines the monster key is null (scholar-side) — group by fight.
function maxPerFight(lines, keyFn) {
  const groups = {};
  for (const e of lines) {
    const k = keyFn(e);
    groups[k] = (groups[k] || 0) + 1;
  }
  let best = { size: 0, key: null };
  for (const k of Object.keys(groups)) {
    if (groups[k] > best.size) best = { size: groups[k], key: k };
  }
  return best;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-steeple', fullTelemetry: false });
  const rageLines = [];
  const steepleLines = [];
  const inviteLines = [];
  const igniteAbsolution = [];
  const igniteExcomm = [];
  const freezelineLines = [];
  const applyLines = [];
  const bellowLines = [];
  const ragePresses = [];
  const congHookCalls = [];
  let sayCount = 0;
  let steepleSayCount = 0; // steeple lines seen so far (for hook-call correlation)
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const line = String(arg);
          const ctx = { day: gday(Game), fight: fightId(Game), round: fightRound(Game), line: line.slice(0, 600) };
          if (RAGE_RE.test(line)) rageLines.push(ctx);
          else if (STEEPLE_RE.test(line)) { steepleLines.push(ctx); steepleSayCount++; }
          else if (INVITE_RE.test(line)) inviteLines.push(ctx);
          else if (IGNITE_ABSOLUTION_RE.test(line)) igniteAbsolution.push(ctx);
          else if (IGNITE_EXCOMM_RE.test(line)) igniteExcomm.push(ctx);
          else if (FREEZELINE_RE.test(line)) freezelineLines.push(ctx);
          else if (APPLY_RE.test(line)) applyLines.push(ctx);
          else if (BELLOW_RE.test(line) && bellowLines.length < 1000) bellowLines.push(ctx);
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Rage-press instrumentation: pre-state of the buff at every press.
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
        if (pre) { pre.returned = ret; ragePresses.push(pre); }
        return ret;
      };
    } else errors.push('useAbility-wrap: not a function');
  } catch (e) { errors.push('useAbility-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Congregation-hook instrumentation: one record per monster-turn.
  try {
    const HB = (typeof global !== 'undefined' && global.MonsterBehaviorHooks) || null;
    if (HB && typeof HB.sigCongregation === 'function') {
      const origHook = HB.sigCongregation;
      HB.sigCongregation = function (game, m) {
        let rec = null;
        try {
          const C = (m && m.sigCong) || {};
          rec = {
            day: gday(Game), fight: fightId(Game), round: fightRound(Game),
            mkey: (m && m.key) || null, mname: (m && m.name) || null,
            phase: C.phase || null, cycle: C.cycle ?? null,
            geas: C.geas ?? null, offered: !!C.offered, refused: !!C.refused,
            steepleBefore: steepleSayCount,
          };
        } catch (e) { errors.push('cong-pre: ' + String(e.message).slice(0, 80)); }
        let ret = false;
        try { ret = origHook.apply(this, arguments); } catch (e) { throw e; }
        if (rec) { rec.returned = ret; rec.steepleFired = steepleSayCount > rec.steepleBefore; congHookCalls.push(rec); }
        return ret;
      };
    } else errors.push('cong-hook-wrap: MonsterBehaviorHooks.sigCongregation missing');
  } catch (e) { errors.push('cong-hook-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try { pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const rageByDay = countByDay(rageLines);
  const steepleByDay = countByDay(steepleLines);
  let rageMaxPerDay = 0, rageMaxDay = null;
  for (const k of Object.keys(rageByDay)) { if (rageByDay[k] > rageMaxPerDay) { rageMaxPerDay = rageByDay[k]; rageMaxDay = parseInt(k, 10); } }
  let steepleMaxPerDay = 0, steepleMaxDay = null;
  for (const k of Object.keys(steepleByDay)) { if (steepleByDay[k] > steepleMaxPerDay) { steepleMaxPerDay = steepleByDay[k]; steepleMaxDay = parseInt(k, 10); } }

  // Per-(fight, monster) steeple max, from hook-call records (exact).
  const steeplePerFightMonster = {};
  for (const c of congHookCalls) {
    if (!c.steepleFired) continue;
    const k = (c.fight || '?') + '|' + (c.mkey || '?');
    steeplePerFightMonster[k] = (steeplePerFightMonster[k] || 0) + 1;
  }
  let steepleMaxPFM = { size: 0, key: null };
  for (const k of Object.keys(steeplePerFightMonster)) {
    if (steeplePerFightMonster[k] > steepleMaxPFM.size) steepleMaxPFM = { size: steeplePerFightMonster[k], key: k };
  }
  // Ignitions per fight (say lines carry fight id).
  const ignitePerFight = {};
  for (const e of igniteAbsolution.concat(igniteExcomm)) {
    const k = (e.fight || '?');
    ignitePerFight[k] = (ignitePerFight[k] || 0) + 1;
  }
  // Rage per fight (say lines carry fight id).
  const ragePerFight = maxPerFight(rageLines, function (e) { return (e.fight || '?'); });
  // Rage press pre-state split.
  let rageFresh = 0, rageRefresh = 0, rageRefreshUnspent = 0;
  for (const p of ragePresses) {
    if (!p.rageActive) rageFresh++;
    else { rageRefresh++; if (p.rageActiveRounds === 3) rageRefreshUnspent++; }
  }

  return {
    seed: seed, arm: 'steeple-check', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA, fixPresent: FIX_PRESENT,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    rageCount: rageLines.length, rageByDay: rageByDay,
    rageMaxPerDay: rageMaxPerDay, rageMaxPerDayDay: rageMaxDay,
    rageMaxGroup: maxGroup(rageLines),
    rageMaxPerFight: ragePerFight,
    rageLines: rageLines,
    ragePressCount: ragePresses.length, ragePressFresh: rageFresh,
    ragePressRefresh: rageRefresh, ragePressRefreshUnspent: rageRefreshUnspent,
    ragePresses: ragePresses,
    steepleCount: steepleLines.length, steepleByDay: steepleByDay,
    steepleMaxPerDay: steepleMaxPerDay, steepleMaxPerDayDay: steepleMaxDay,
    steepleMaxGroup: maxGroup(steepleLines),
    steepleMaxPerFightMonster: steepleMaxPFM,
    steepleLines: steepleLines,
    inviteCount: inviteLines.length, inviteLines: inviteLines,
    inviteMaxPerFightMonster: maxPerFight(inviteLines, function (e) { return (e.fight || '?'); }),
    igniteAbsolutionCount: igniteAbsolution.length,
    igniteExcommCount: igniteExcomm.length,
    ignitePerFight: ignitePerFight,
    igniteAbsolutionLines: igniteAbsolution,
    igniteExcommLines: igniteExcomm,
    congHookCallCount: congHookCalls.length,
    congHookCalls: congHookCalls,
    freezelineCount: freezelineLines.length, freezelineLines: freezelineLines,
    applyCount: applyLines.length, applyLines: applyLines,
    bellowCount: bellowLines.length, bellowLines: bellowLines,
    sayCount: sayCount, instrumentErrors: errors, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-13', process.env.OUTDIR || 'perseed-steeple-a-check');
const aaText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'abilityActions.js'), 'utf8'); } catch (e) { return ''; } })();
const sigText = (function () { try { return fs.readFileSync(path.join(REPO, 'src', 'js', 'sigW4.js'), 'utf8'); } catch (e) { return ''; } })();
const FIX_PRESENT = aaText.indexOf('_rageAnnounced') !== -1 || sigText.indexOf('_steepleAnnounced') !== -1;

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('STEEPLE STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'steeple-check-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('STEEPLE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'steeple-check-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      rageCount: out.rageCount, rageMaxPerDay: out.rageMaxPerDay, rageMaxPerDayDay: out.rageMaxPerDayDay,
      rageMaxPerFight: out.rageMaxPerFight, ragePresses: out.ragePressCount,
      rageFresh: out.ragePressFresh, rageRefresh: out.ragePressRefresh,
      rageRefreshUnspent: out.ragePressRefreshUnspent,
      steepleCount: out.steepleCount, steepleMaxPerDay: out.steepleMaxPerDay, steepleMaxPerDayDay: out.steepleMaxPerDayDay,
      steepleMaxPerFightMonster: out.steepleMaxPerFightMonster,
      igniteAbsolution: out.igniteAbsolutionCount, igniteExcomm: out.igniteExcommCount,
      inviteCount: out.inviteCount,
      congHookCalls: out.congHookCallCount,
      freezelineCount: out.freezelineCount, applyCount: out.applyCount, bellowCount: out.bellowCount,
      deaths: out.deaths.length, errors: out.instrumentErrors.length,
      fixPresent: out.fixPresent,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, RAGE_RE: RAGE_RE, STEEPLE_RE: STEEPLE_RE, INVITE_RE: INVITE_RE, IGNITE_ABSOLUTION_RE: IGNITE_ABSOLUTION_RE, IGNITE_EXCOMM_RE: IGNITE_EXCOMM_RE, FREEZELINE_RE: FREEZELINE_RE, APPLY_RE: APPLY_RE, BELLOW_RE: BELLOW_RE, countByDay: countByDay, maxGroup: maxGroup, EXPECTED_ANCHOR: EXPECTED_ANCHOR };
