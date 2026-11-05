// trigger-driver-20261104.js — trigger-mechanism diag pilot driver
// (arm sim-trigger-b). Competent policy VERBATIM, default env,
// death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness (loadGame per seed,
// as the vetprod driver does). Per-seed JSON goes to
// evidence/2026-11-04/perseed-trigger-b/ (sims write once, on purpose),
// or $OUTDIR when set (proof legs use /tmp). Refuses to overwrite.
// TRIGGER_OFF=1 runs without the instrument (neutrality leg only).
// Usage:
//   DAYS=150 SEEDS=99101,99102 RUN=trigger-pilot node scripts/trigger-driver-20261104.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'trigger-instrument-20261104'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'trigger-pilot';
const OFF = process.env.TRIGGER_OFF === '1';
if (!SEEDS.length) { console.error('TRIGGER STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-04', 'perseed-trigger-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'trigger-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TRIGGER STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// EPERM flap (host intermittent write denial, active 2026-11-04 night):
// retry corpus writes instead of losing an in-memory seed result.
function sleepSync(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeRetry(file, content) {
  // The flap has two modes: EPERM throw, and a silent 0-byte "success".
  // Verify size after every apparent success; retry until it matches.
  const want = Buffer.byteLength(content);
  let lastErr = null;
  for (let i = 0; i < 120; i++) {
    try {
      fs.writeFileSync(file, content);
      try {
        const got = fs.statSync(file).size;
        if (got === want) return;
        lastErr = new Error('short-write: got ' + got + ' want ' + want);
      } catch (e) { lastErr = e; }
    } catch (e) { lastErr = e; if (e.code !== 'EPERM') throw e; }
    try { fs.unlinkSync(file); } catch (e) {}
    sleepSync(10000);
  }
  throw lastErr;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-trigger', fullTelemetry: false });
  const errors = [];
  // Say lines are captured by the instrument itself (pattern lines only,
  // sharing the event index) — no second wrapper here.
  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { spawns: [], removals: [], casts: [], fights: [], daily: [], mtCalls: [], tileChanges: [], sayLines: [], instrumentErrors: [] };
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (inst && d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (inst) { try { inst.snapshot(); } catch (e) {} }
  let fin = null;
  if (inst) { try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); } }
  else {
    try { fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(), fallen: (((Game.state || {}).village || {}).fallen || []).slice(), wavesFaced: null, scaleRank: null, unlockedWave: null, standing: null, readiness5: null, finalWorld: null }; } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'trigger', run: RUN, anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    spawns: t.spawns, removals: t.removals, casts: t.casts, fights: t.fights, daily: t.daily,
    mtCalls: t.mtCalls, tileChanges: t.tileChanges, sayLines: t.sayLines,
    sayCount: fin ? fin.sayCount : null,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    finalWorld: fin ? fin.finalWorld : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'trigger-s' + seed + '-' + RUN + '.json');
    writeRetry(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endRaw: last.raw != null ? last.raw : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      spawns: out.spawns.length, w4spawns: out.spawns.filter(function (s) { return (s.wave | 0) >= 4; }).length,
      casts: out.casts.length, w4casts: out.casts.filter(function (c) { return (c.wave | 0) >= 4; }).length,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4worldFights: out.fights.filter(function (f) { return (f.wave | 0) >= 4 && f.cls === 'world'; }).length,
      mtCalls: (out.mtCalls || []).length, tileChanges: (out.tileChanges || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
