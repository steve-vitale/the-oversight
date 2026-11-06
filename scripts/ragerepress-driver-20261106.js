// ragerepress-driver-20261106.js — rage re-press pilot driver
// (arm sim-ragerepress-b, run fleshout-loop-b-20261106T1730Z). Competent
// policy verbatim (POLICY=baseline, default) or the staging probe
// (POLICY=staged: scripts/policies/competent-stageally-a.js — the
// stageally-confirm armed leg, unchanged) or the rage re-press armed leg
// (POLICY=ragerepress: scripts/policies/competent-ragerepress-b.js —
// partydamage base with the rage cap lifted, nothing else). Death-aware
// horizon (runDays ends on village death / win). Seeds run sequentially
// in one process via the shared harness (loadGame per seed). Per-seed
// JSON goes to evidence/2026-11-06/perseed-ragerepress-b/ (sims write
// once, on purpose), or $OUTDIR when set (proof legs use /tmp). Refuses
// to overwrite. RAGEREPRESS_OFF=1 runs without the instrument
// (neutrality leg only; the policy still runs — off-mode baseline must
// match on-mode baseline on days/endReason/kill-log length).
// Usage:
//   DAYS=150 SEEDS=95001..95008 RUN=ragerepress-baseline node scripts/ragerepress-driver-20261106.js
//   DAYS=150 SEEDS=95001..95008 RUN=ragerepress-armed POLICY=ragerepress node scripts/ragerepress-driver-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
// The ragerepress policy is loaded LAZILY (below, only when
// POLICY=ragerepress): the pilot NO-GO'd on the lever and the policy file
// was deleted, so a top-level require would break the baseline legs and
// the instrument proof. Asking for POLICY=ragerepress without the file
// is a loud stop, not a silent fallback.
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'ragerepress-instrument-20261106'));

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
const RUN = process.env.RUN || 'ragerepress-pilot';
const OFF = process.env.RAGEREPRESS_OFF === '1';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('RAGEREPRESS STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'staged' && POLICY !== 'ragerepress') { console.error('RAGEREPRESS STOP: POLICY must be baseline|staged|ragerepress.'); process.exit(2); }
let policy = competent;
if (POLICY === 'staged') policy = STAGED.stagedPolicy;
let RAGEREPRESS = null;
if (POLICY === 'ragerepress') {
  try { RAGEREPRESS = require(path.join(REPO, 'scripts', 'policies', 'competent-ragerepress-b')); }
  catch (e) { console.error('RAGEREPRESS STOP: POLICY=ragerepress but the policy file is gone (killed lever — see evidence/2026-11-06/sim-ragerepress-b.md).'); process.exit(4); }
  policy = RAGEREPRESS.ragerepressPolicy;
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-06', 'perseed-ragerepress-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'ragerepress-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('RAGEREPRESS STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'ragerepress-' + POLICY, fullTelemetry: false });
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
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], rallyCalls: [], tbFights: [], traces: [], instrumentErrors: [] };
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

  try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
  try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
  try { if (RAGEREPRESS) RAGEREPRESS.resetRagerepressStats(); } catch (e) { errors.push('ragerepress-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (inst) { try { inst.snapshot(); } catch (e) {} }
  let fin = null;
  if (inst) { try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); } }
  else {
    try { fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(), fallen: (((Game.state || {}).village || {}).fallen || []).slice(), wavesFaced: null, scaleRank: null, unlockedWave: null, standing: null, readiness5: null, deadMap: null, endScholarId: null }; } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }
  let rallyStats = null, stageStats = null, partyStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  try { partyStats = RAGEREPRESS ? RAGEREPRESS.ragerepressStats() : null; } catch (e) { errors.push('ragerepress-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'ragerepress', run: RUN, policy: POLICY, anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [], traces: t.traces || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, ragerepressStats: partyStats,
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
    const file = path.join(outDir, 'ragerepress-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    const w4tb = (out.tbFights || []).filter(function (f) { return (f.wave | 0) >= 4; });
    const w4tr = (out.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endRaw: last.raw != null ? last.raw : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      w4tbFights: w4tb.length, w4traces: w4tr.length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      rallyFires: out.bankkillerStats ? out.bankkillerStats.rallyFires : null,
      rrStrikes: out.ragerepressStats ? out.ragerepressStats.strikes : null,
      rrCascadePresses: out.ragerepressStats ? out.ragerepressStats.cascadePresses : null,
      rrRagePresses: out.ragerepressStats ? out.ragerepressStats.ragePresses : null,
      rrRageRepresses: out.ragerepressStats ? out.ragerepressStats.rageRepresses : null,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
