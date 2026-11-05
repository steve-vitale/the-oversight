// standaccum2-run-analyze-20261105.js — run + analyze IN PROCESS (arm
// sim-standaccum2-b). The host write flap + a process-state quirk make
// post-sim file writes from a game-loaded process fail with EPERM
// (proven by scripts/diag-gameload-write-20261105.js: pre-sim writes
// OK, post-sim writes EPERM, pipes fine). So this driver NEVER writes
// corpus files: it runs each seed, analyzes the in-memory row with the
// same analyzeSeed() the file analyzer uses, and prints ONLY small
// summaries to stdout (tool capture, a pipe — proven reliable).
// Full dayTables print ONLY for interesting seeds (killersEver >= 2,
// gatedPeak >= 199, or readyDays > 0); fightSays samples print ONLY
// for those seeds (cap 40 lines). No src/js, no game changes.
// Usage:
//   DAYS=150 SEEDS=99117,99118 RUN=standaccum2-pilot node scripts/standaccum2-run-analyze-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'vetprod-instrument-20261104'));
const AN = require(path.join(REPO, 'scripts', 'standaccum2-analyze-20261105'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'standaccum2-pilot';
if (!SEEDS.length) { console.error('STANDACCUM2 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-standaccum2', fullTelemetry: false });
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
          if (/fought|slain|killed|veteran|blood your|HELD|draft waits|stood and fought/i.test(arg) && fightSays.length < 300) fightSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
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

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  return {
    seed: seed, arm: 'standaccum2', run: RUN, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, fightSays: fightSays, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
}

(async function () {
  const summaries = [];
  for (const seed of SEEDS) {
    const row = await oneRun(seed);
    const s = AN.analyzeSeed(row);
    const interesting = s.killersEver >= 2 || (s.gatedPeak != null && s.gatedPeak >= 199) || s.readyDays.length > 0;
    const summary = {
      seed: s.seed, days: s.days, endReason: s.endReason,
      won: s.won, scaleRank: s.scaleRank, unlockedWave: s.unlockedWave, maxWave: s.maxWave,
      wave4met: s.wave4met, w4fights: s.w4fights, w4kills: s.w4kills, w4facedTypes: s.w4facedTypes,
      killersEver: s.killersEver, killers: s.killers,
      killToDeathIntervals: s.killToDeathIntervals,
      maxLiving: s.maxLiving, living2Days: s.living2Days,
      gatedPeak: s.gatedPeak, gatedPeakDay: s.gatedPeakDay, rawPeak: s.rawPeak,
      releaseDays: s.releaseDays, releaseDayDetail: s.releaseDayDetail,
      readyDays: s.readyDays, mismatchDays: s.mismatchDays, snapshotDays: s.snapshotDays,
      bindingRaw200: s.bindingRaw200, instrumentErrors: s.instrumentErrors,
      sayCount: row.sayCount,
    };
    summaries.push(summary);
    // Print the small summary as ONE line (easy to split apart later).
    console.log('SA2-SEED ' + JSON.stringify(summary));
    if (interesting) {
      // Full dayTables flood context; print them only on demand (a
      // release seed gets a dedicated re-run with SA2_DAYTABLE=1 —
      // trajectories are deterministic, so the re-run matches).
      if (process.env.SA2_DAYTABLE === '1') console.log('SA2-DAYTABLE ' + seed + ' ' + JSON.stringify(s.dayTable));
      // Key-window says only: around the gated-peak day and around
      // each killer's bank/death days — the standing story, not the
      // first 40 combat lines.
      const keyDays = {};
      [s.gatedPeakDay].concat(s.killers.map(function (k) { return k.firstDay; }), s.killers.map(function (k) { return k.deathDay; }))
        .forEach(function (d) { if (d != null) for (let o = -5; o <= 5; o++) keyDays[d + o] = true; });
      const keySays = row.fightSays.filter(function (x) { return keyDays[x.day]; }).slice(0, 40);
      console.log('SA2-SAYS ' + seed + ' ' + JSON.stringify(keySays));
    }
  }
  console.log('SA2-DONE ' + JSON.stringify({ n: summaries.length, releasedSeeds: summaries.filter(function (s) { return s.releaseDays.length > 0; }).map(function (s) { return s.seed; }) }));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
