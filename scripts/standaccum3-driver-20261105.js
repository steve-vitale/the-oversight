// standaccum3-driver-20261105.js — STANDACCUM3 driver (arm sim-standaccum3-b).
// Runs the anchor (99145) + fresh band 99191-99198 with the standaccum3
// instrument (vetprod reused verbatim + standing decomposition).
// Competent policy VERBATIM, default env, 150d death-aware horizon.
// Per-seed JSON goes to evidence/2026-11-05/perseed-standaccum3-b/,
// or $OUTDIR when set (proof legs use /tmp). Refuses to overwrite.
// Usage:
//   DAYS=150 SEEDS=99145,99191 RUN=standaccum3-pilot node scripts/standaccum3-driver-20261105.js
//   STANDACCUM3_STDOUT=1 ... (corpus JSON on stdout, summary on stderr;
//   bash redirection is the write-flap escape hatch — see standaccum2).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'standaccum3-instrument-20261105'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'standaccum3-pilot';
const OFF = process.env.STANDACCUM3_OFF === '1';
if (!SEEDS.length) { console.error('STANDACCUM3 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-standaccum3-b');
const STDOUT_MODE = process.env.STANDACCUM3_STDOUT === '1';
if (!STDOUT_MODE) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'standaccum3-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('STANDACCUM3 STOP: refusing to overwrite ' + file); process.exit(3); }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-standaccum3', fullTelemetry: false });
  const fightSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          // standaccum2 filter + standing lines (hold/release beats,
          // ledger beats, feasts) so the sense-test can quote what the
          // village is TOLD about its standing. Cap 300, as standaccum2.
          if (/fought|slain|killed|veteran|blood your|HELD|draft waits|stood and fought|Standing|next act|fifth draft|WAVE LEDGER|feast|RATINGS ARE UP/i.test(arg) && fightSays.length < 300) fightSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { fights: [], daily: [], instrumentErrors: [] };
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
    try { fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(), fallen: (((Game.state || {}).village || {}).fallen || []).slice(), wavesFaced: null, scaleRank: null, unlockedWave: null, standing: null, readiness5: null }; } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'standaccum3', run: RUN, anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    standingBreakdown: fin ? fin.standingBreakdown : null,
    w3pts: fin ? fin.w3pts : null, w4pts: fin ? fin.w4pts : null, w5pts: fin ? fin.w5pts : null,
    perType3: fin ? fin.perType3 : null, perType4: fin ? fin.perType4 : null, perType5: fin ? fin.perType5 : null,
    feastLog: fin ? fin.feastLog : null,
    fights: t.fights, daily: t.daily, fightSays: fightSays, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

// writeWithRetry: the host write flap (EPERM) can deny the final corpus
// write and leave a 0-byte stub. Retry the WRITE (up to 120 x 10s, with
// size + JSON verification), never re-run the sim.
function writeWithRetry(file, content) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 120; attempt++) {
    try { fs.unlinkSync(file); } catch (e) {}
    try {
      fs.writeFileSync(file, content);
      const st = fs.statSync(file);
      if (st.size === 0) throw new Error('zero-size write');
      JSON.parse(fs.readFileSync(file, 'utf8'));
      return;
    } catch (e) { lastErr = e; try { console.error('WRITE-RETRY att=' + attempt + ' code=' + (e && e.code) + ' msg=' + String(e && e.message).slice(0, 120)); } catch (e2) {} Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); }
  }
  throw lastErr;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const last = out.daily[out.daily.length - 1] || {};
    const file = path.join(outDir, 'standaccum3-s' + seed + '-' + RUN + '.json');
    if (STDOUT_MODE) {
      fs.writeSync(1, JSON.stringify(out, null, 2) + '\n');
    } else {
      writeWithRetry(file, JSON.stringify(out, null, 2) + '\n');
    }
    const r5 = last.readiness5 || {};
    (STDOUT_MODE ? console.error : console.log)(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endRaw: last.raw != null ? last.raw : null,
      endWar: last.war != null ? last.war : null,
      endDiplomacy: last.diplomacy != null ? last.diplomacy : null,
      endPlenty: last.plenty != null ? last.plenty : null,
      endW3pts: last.w3pts != null ? last.w3pts : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
