// namelessadm-probe-20261113.js — probe-band driver for arm sim-namelessadm-b.
//
// Runs the voicejoins-b probe band (190391–190398, 150d, competent) with a
// FULL Game.say capture, counting fire-makes-room lines (and the blank-names
// variant) per seed, plus the wall numbers (national/table/wins, wave 4–5
// unlocks, median survival). Run BEFORE the fix for the baseline and AFTER
// for the after-leg; the two runs must be byte-identical on survival/wave
// numbers (the fix is narration-only) and the blank-names line must be 0
// in both.
//
// Usage:
//   SEEDS=190391,190392,190393,190394,190395,190396,190397,190398 DAYS=150 \
//     OUTDIR=evidence/2026-11-13/perseed-namelessadm-b node scripts/namelessadm-probe-20261113.js
// Output: <OUTDIR>/namelessadm-probe-s<seed>.json + a one-line summary per seed.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [190391, 190392, 190393, 190394, 190395, 190396, 190397, 190398]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const OUTDIR = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-13', 'perseed-namelessadm-b');
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-namelessadm-probe', fullTelemetry: false });
  const fireLines = []; // every "The fire makes room" line, with its day
  const blankLines = []; // the blank-names variant (finding #2309)
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          const s = String(arg);
          if (/The fire makes room/.test(s)) fireLines.push({ day: gday(Game), line: s.slice(0, 300) });
          if (/The fire makes room\.  — said aloud/.test(s)) blankLines.push({ day: gday(Game), line: s.slice(0, 300) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) {}
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) {}
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}

  return {
    seed: seed, arm: 'namelessadm-probe', anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    sayCount: sayCount, fireLines: fireLines, blankLines: blankLines,
    instrumentErrors: errors,
  };
}

(async function () {
  if (!SEEDS.length) { console.error('NAMELESSADM-PROBE STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(OUTDIR, 'namelessadm-probe-s' + seed + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, scaleRank: out.scaleRank, standing: out.standing,
      won: out.won, fireLines: out.fireLines.length, blankLines: out.blankLines.length,
      file: file,
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
