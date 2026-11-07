// routstall-driver-20261106.js — 159-round rout reproduction driver
// (arm sim-routstall-b, run fleshout-loop-b-20261106T2300Z). DIAG ONLY,
// zero src/js. Re-runs seed 53001 with the fightinterior recorder lineage
// (midnightkill ±1-day matcher, 'routed'->'rout' normalization) on both
// legs, horizon 150d death-aware (same as the stageally-confirm corpus),
// and adds a TERMINATOR RECORDER: every Game.tbEnd call is logged with
// the game day, fight round, the frozen-sleep streak (consecutive sleeps
// with an unchanged scholar day while a fight is open), and the call
// stack's first frames — so the run can tell the engine's tbEndCheck
// 'routed' (stack through game.js tbEndCheck / tbMonsterTurn / ability)
// apart from the sim-harness TIME-FREEZE WATCHDOG's forced
// Game.tbEnd('routed') (stack through sim-harness.js runDays).
// Wrappers are read-only counters: zero RNG draws, zero game-state writes.
// Usage (from the repo root whose code is being reproduced):
//   DAYS=150 SEEDS=53001 RUN=routstall-baseline OUTDIR=<dir> POLICY=baseline node scripts/routstall-driver-20261106.js
//   DAYS=150 SEEDS=53001 RUN=routstall-staged OUTDIR=<dir> POLICY=staged node scripts/routstall-driver-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'fightinterior-instrument-20261106'));

function expandSeeds(raw) {
  const out = [];
  (raw || '').split(',').forEach(function (part) {
    const t = part.trim();
    if (!t) return;
    const m = t.match(/^(\d+)\.\.(\d+)$/);
    if (m) { for (let s = parseInt(m[1], 10); s <= parseInt(m[2], 10); s++) out.push(s); }
    else if (Number.isFinite(parseInt(t, 10))) out.push(parseInt(t, 10));
  });
  return out;
}

const SEEDS = expandSeeds(process.env.SEEDS);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'routstall-pilot';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('ROUTSTALL STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'staged') { console.error('ROUTSTALL STOP: POLICY must be baseline|staged.'); process.exit(2); }
let policy = competent;
if (POLICY === 'staged') policy = STAGED.stagedPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = process.env.ANCHOR_COMMIT || execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-06', 'perseed-routstall-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'routstall-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('ROUTSTALL STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'routstall-' + POLICY, fullTelemetry: false });
  const deathSays = [];
  const fightLines = [];
  let sayCount = 0;
  const errors = [];
  const tbEndCalls = [];
  const frozenStreaks = [];
  // ---- terminator recorder state (driver-side only) ----
  let lastSday = null, frozenSleeps = 0, loopDay = 0;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/ON ME|Rally|rally|line closes|hold the line|TOGETHER/i.test(arg) && fightLines.length < 200) fightLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  inst = INST.install(Game);
  const t = inst.t;
  // ---- tbEnd wrapper (OUTERMOST: installed after the instrument, so it
  // sees the call first and the instrument's closeTrace still runs inside).
  // Records the caller stack so the watchdog's forced tbEnd('routed')
  // (stack through sim-harness.js) is distinguishable from the engine's
  // tbEndCheck 'routed' (stack through game.js). Read-only.
  try {
    const origTbEnd = Game.tbEnd;
    Game.tbEnd = function (result) {
      try {
        let stack = '';
        try { stack = (new Error('tbEnd-caller').stack || '').split('\n').slice(1, 7).map(function (l) { return l.trim(); }).join(' | '); } catch (e2) {}
        let round = null;
        try { round = (Game.tbfight && Game.tbfight.round != null) ? (Game.tbfight.round | 0) : null; } catch (e2) {}
        tbEndCalls.push({ result: result != null ? String(result) : null, day: gday(Game), round: round, frozenSleeps: frozenSleeps, loopDay: loopDay, stack: stack });
      } catch (e) { errors.push('tbEnd-wrap: ' + String(e.message).slice(0, 80)); }
      return origTbEnd.apply(this, arguments);
    };
  } catch (e) { errors.push('tbEnd-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- sleep wrapper: count consecutive sleeps with an unchanged scholar
  // day while a fight is open — the watchdog's own trigger (8). Read-only.
  try {
    const origSleep = Game.sleep;
    if (typeof origSleep === 'function') {
      Game.sleep = function () {
        let ret;
        try { ret = origSleep.apply(this, arguments); } catch (e) { throw e; }
        try {
          loopDay += 1;
          const sday = gday(Game);
          const fightOpen = !!(Game.tbfight && !Game.tbfight.over);
          if (fightOpen && lastSday !== null && sday === lastSday) {
            frozenSleeps += 1;
            if (frozenSleeps >= 8) frozenStreaks.push({ loopDay: loopDay, sday: sday, frozen: frozenSleeps });
          } else {
            if (fightOpen && frozenSleeps > 0) frozenStreaks.push({ loopDay: loopDay, sday: sday, frozen: frozenSleeps, ended: true });
            frozenSleeps = 0;
            lastSday = sday;
          }
        } catch (e) { errors.push('sleep-wrap: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else { errors.push('sleep-missing'); }
  } catch (e) { errors.push('sleep-wrap-install: ' + String(e.message).slice(0, 80)); }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'routstall', run: RUN, policy: POLICY, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [], traces: t.traces || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats,
    deathSays: deathSays, fightLines: fightLines, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
    tbEndCalls: tbEndCalls, frozenStreaks: frozenStreaks,
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'routstall-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const w4tb = (out.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; });
    const w4tr = (out.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    const cong = (out.traces || []).filter(function (x) { return x.mid === 'congregation'; });
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      w4tbFights: w4tb.length, w4traces: w4tr.length,
      congTraces: cong.map(function (c) { return { day: c.day, rounds: c.rounds, ending: c.ending, mHp: c.mHpLeftFrac, sHp: c.scholarHpFracEnd }; }),
      tbEndRouted: (out.tbEndCalls || []).filter(function (c) { return c.result === 'routed'; }).map(function (c) { return { day: c.day, round: c.round, frozen: c.frozenSleeps, stack: (c.stack || '').slice(0, 220) }; }),
      frozenStreaks: out.frozenStreaks,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
