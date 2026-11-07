// trajfrag-driver-20261107.js — trajectory-fragility re-run driver
// (arm sim-trajfrag-b, run fleshout-loop-b-20261107T0230Z). Stageally
// driver shape, staged policy only. The ONLY difference between the
// two legs of a seed is the displacement: PERTURB=1 draws Math.random()
// exactly once after setupGame, before runDays (see
// scripts/trajfrag-instrument-20261107.js); PERTURB unset draws
// nothing extra. Per-seed JSON goes to
// evidence/2026-11-07/perseed-trajfrag-b/ (sims write once, on purpose),
// or $OUTDIR when set (proof legs use /tmp). Refuses to overwrite.
// Death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness (loadGame per seed).
// Usage:
//   DAYS=150 SEEDS=53004,53006 RUN=trajfrag-unperturbed node scripts/trajfrag-driver-20261107.js
//   DAYS=150 SEEDS=53004,53006 RUN=trajfrag-perturbed PERTURB=1 node scripts/trajfrag-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const TRAJ = require(path.join(REPO, 'scripts', 'trajfrag-instrument-20261107'));

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
const RUN = process.env.RUN || 'trajfrag-pilot';
const PERTURB = process.env.PERTURB === '1';
if (!SEEDS.length) { console.error('TRAJFRAG STOP: SEEDS required.'); process.exit(2); }
if (RUN !== 'trajfrag-unperturbed' && RUN !== 'trajfrag-perturbed' && !/^trajfrag-/.test(RUN)) {
  console.error('TRAJFRAG STOP: RUN must start with trajfrag-.'); process.exit(2);
}
if (PERTURB && RUN !== 'trajfrag-perturbed') { console.error('TRAJFRAG STOP: PERTURB=1 requires RUN=trajfrag-perturbed.'); process.exit(2); }
if (!PERTURB && RUN === 'trajfrag-perturbed') { console.error('TRAJFRAG STOP: RUN=trajfrag-perturbed requires PERTURB=1.'); process.exit(2); }
const policy = STAGED.stagedPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-trajfrag-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'trajfrag-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TRAJFRAG STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-stageally-staged', fullTelemetry: false });
  const deathSays = [];
  const fightLines = [];
  let sayCount = 0;
  const errors = [];
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

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  // THE DISPLACEMENT (perturbed leg only): one extra game-RNG draw at
  // day 0, after setupGame, before runDays. Recorded, never repeated.
  let displacedValue = null;
  if (PERTURB) displacedValue = TRAJ.displace();
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
    seed: seed, arm: 'trajfrag', run: RUN, policy: 'staged', anchorCommit: ANCHOR,
    perturbed: PERTURB, displacedValue: displacedValue,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats,
    deathSays: deathSays, fightLines: fightLines, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'trajfrag-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, perturbed: out.perturbed, displacedValue: out.displacedValue,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
