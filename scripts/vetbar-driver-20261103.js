// vetbar-driver-20261103.js — veterans-bar autopsy pilot driver (arm
// sim-vetbar-a). Competent policy VERBATIM, default env, death-aware
// horizon (runDays ends on village death / win). One process per seed
// is NOT required here: seeds run sequentially in one process via the
// shared harness (loadGame per seed, as the w5faced driver does).
// Per-seed JSON goes to evidence/2026-11-03/perseed-vetbar-a/ (sims
// write once, on purpose). Refuses to overwrite an existing per-seed file.
// Veteran-mention say lines are kept (capped); full says go to /tmp only.
// Usage:
//   DAYS=140 SEEDS=99101,99102 RUN=vetbar-pilot node scripts/vetbar-driver-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'vetbar-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'vetbar-pilot';
if (!SEEDS.length) { console.error('VETBAR STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-vetbar-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'vetbar-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('VETBAR STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-vetbar', fullTelemetry: false });
  const vetSays = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/veteran/i.test(arg) && vetSays.length < 200) vetSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
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
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}

  const out = {
    seed: seed, arm: 'vetbar', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    killRows: t.killRows, daily: t.daily, deathDays: t.deathDays,
    wrapCounts: t.wrapCounts, vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'vetbar-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    const readyDays = out.daily.filter(function (s) { return s.readiness5 && s.readiness5.ready; }).length;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      w4kills: out.killRows.length,
      distinctKillers: last.killers ? Object.keys(last.killers).length : null,
      livingKillersRecount: last.gateCount != null ? last.gateCount : null,
      readinessVeterans: r5.veterans != null ? r5.veterans : null,
      ready5Days: readyDays, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
