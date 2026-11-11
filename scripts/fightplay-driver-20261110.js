// fightplay-driver-20261110.js — fight-play census pilot driver
// (arm sim-fightplay-b). Runs a fresh band with the fightplay instrument,
// competent policy verbatim, 150d death-aware horizon. Per-seed JSON goes to
// evidence/2026-11-10/perseed-fightplay-b/, or $OUTDIR when set.
// Refuses to overwrite. STDOUT mode (FIGHTPLAY_STDOUT=1) is the host-write-
// flap escape hatch: bash (not node) writes the file via redirection.
// FIGHTPLAY_OFF=1 runs with the instrument NOT installed (neutrality leg);
// the digest field is computed from instrument-independent state reads,
// so on/off digests are comparable.
// Usage:
//   DAYS=150 SEEDS=180225,180226 RUN=fightplay-b node scripts/fightplay-driver-20261110.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'fightplay-instrument-20261110'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'fightplay-b';
const OFF = process.env.FIGHTPLAY_OFF === '1';
if (!SEEDS.length) { console.error('FIGHTPLAY STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-fightplay-b');
const STDOUT_MODE = process.env.FIGHTPLAY_STDOUT === '1';
if (!STDOUT_MODE) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'fightplay-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('FIGHTPLAY STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const base = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-fightplay', fullTelemetry: false });
  const fightSays = [];
  const spawnSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/fought|slain|killed|veteran|blood your|HELD|draft waits|stood and fought|gave .* room|not ready alone/i.test(arg) && fightSays.length < 300) fightSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/Something moves out there|Something big is/i.test(arg) && spawnSays.length < 300) spawnSays.push({ day: gday(Game), tile: (Game.map ? (Game.map.px + ',' + Game.map.py) : null), line: String(arg).slice(0, 300) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { spawns: [], casts: [], fights: [], gateCalls: [], daily: [], instrumentErrors: [] };
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, base, {
    daily: function (Gm, ctx) {
      try { return base.daily(Gm, ctx); } finally {
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
    // OFF (neutrality leg): read the same finalize fields directly from
    // state, so the digest is comparable with the ON run. (A null here
    // would fake a neutrality failure — the game itself is identical.)
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      fin = {
        waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(),
        fallen: (((Game.state || {}).village || {}).fallen || []).slice(),
        wavesFaced: (ds && ds.wavesFaced) || null,
        scaleRank: Game.scaleRank ? Game.scaleRank() : null,
        unlockedWave: Game.unlockedWave ? Game.unlockedWave() : null,
        standing: Game.villageStandingTotal ? Game.villageStandingTotal() : null,
        readiness5: Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null,
      };
    } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }

  const st = Game.state || {};
  // Neutrality digest: instrument-independent state reads only, so an
  // OFF run and an ON run on the same seed must digest identically when
  // the instrument is truly read-only.
  let digest = null;
  try {
    let living = null;
    try {
      const roster = (((Game.state || {}).village || {}).roster || []).slice();
      living = 0;
      roster.forEach(function (vid) {
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && !p.dead) living++; } catch (e) {}
      });
    } catch (e) {}
    digest = JSON.stringify({
      days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
      endReason: result.endReason, won: !!Game.won, over: !!Game.over,
      villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
      unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
      killsTotal: fin && fin.waveKillLog ? fin.waveKillLog.length : null,
      fallenTotal: fin && fin.fallen ? fin.fallen.length : null, living: living,
    });
  } catch (e) { digest = 'digest-error:' + String(e.message).slice(0, 60); }

  const out = {
    seed: seed, arm: 'fightplay', run: RUN, policy: 'competent', anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null, digest: digest,
    spawns: t.spawns, casts: t.casts, fights: t.fights, gateCalls: t.gateCalls, daily: t.daily,
    fightSays: fightSays, spawnSays: spawnSays, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

function writeWithRetry(file, content) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 120; attempt++) {
    try { fs.unlinkSync(file); } catch (e) { /* missing file is fine */ }
    try {
      fs.writeFileSync(file, content);
      const st = fs.statSync(file);
      if (st.size === 0) throw new Error('zero-size write');
      JSON.parse(fs.readFileSync(file, 'utf8'));
      return;
    } catch (e) { lastErr = e; try { console.error('WRITE-RETRY att=' + attempt + ' code=' + (e && e.code) + ' msg=' + String(e && e.message).slice(0, 120)); } catch (e2) { /* log-only */ } Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); }
  }
  throw lastErr;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const last = out.daily[out.daily.length - 1] || {};
    const file = path.join(outDir, 'fightplay-s' + seed + '-' + RUN + '.json');
    if (STDOUT_MODE) {
      fs.writeSync(1, JSON.stringify(out, null, 2) + '\n');
    } else {
      writeWithRetry(file, JSON.stringify(out, null, 2) + '\n');
    }
    const grounded = out.fights.filter(function (f) { return f.channel === 'field' && f.seq != null && !f.psycho; }).length;
    const agency = out.fights.filter(function (f) { return f.channel === 'field' && f.cls === 'other'; }).length;
    const w4kills = (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length;
    (STDOUT_MODE ? console.error : console.log)(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, unlockedWave: out.unlockedWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null, endRaw: last.raw != null ? last.raw : null,
      spawns: out.spawns.length, fights: out.fights.length, grounded: grounded, agency: agency,
      gateCalls: out.gateCalls.length, w4kills: w4kills,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      digest: (out.digest || '').slice(0, 120), file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
