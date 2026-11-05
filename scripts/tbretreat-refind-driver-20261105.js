// tbretreat-refind-driver-20261105.js — retreat-and-refind pilot driver
// (arm sim-tbretreat-refind-b, run fleshout-loop-b-20261105T1830Z).
// Death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness (loadGame per seed,
// as the staypolicy / tbretreat drivers do). Per-seed JSON goes to
// evidence/2026-11-05/perseed-tbretreat-refind-b/ (sims write once, on
// purpose), or $OUTDIR when set (proof legs use /tmp). Refuses to
// overwrite. REFIND_OFF=1 runs without the instrument (neutrality
// leg only — off-mode baseline must match on-mode baseline on
// days/endReason/kill-log length).
// POLICY selects the policy: baseline (competent verbatim) or refind
// (scripts/policies/tbretreat-refind.js). The variant module is required
// on both legs (require-time side-effect free, proven in the proof test)
// so per-seed refindStats can be captured uniformly; on the baseline leg
// the variant never runs and the stats stay zeroed.
// Usage:
//   DAYS=150 SEEDS=96811..96818 RUN=tbretreat-refind-baseline node scripts/tbretreat-refind-driver-20261105.js
//   DAYS=150 SEEDS=96811..96818 RUN=tbretreat-refind-armed POLICY=refind node scripts/tbretreat-refind-driver-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const REFIND = require(path.join(REPO, 'scripts', 'policies', 'tbretreat-refind'));
const INST = require(path.join(REPO, 'scripts', 'staypolicy-instrument-20261105'));

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
const RUN = process.env.RUN || 'tbretreat-refind-baseline';
const OFF = process.env.REFIND_OFF === '1';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('REFIND STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'refind') { console.error('REFIND STOP: POLICY must be baseline or refind, got ' + POLICY); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-tbretreat-refind-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tbretreat-refind-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('REFIND STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-tbretreat-refind', fullTelemetry: false });
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
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought|killed|pack|scatter|barrier|BARRIER CROSSED|flagging|right behind you|gives up the chase|known world ends|no escape that way/i.test(arg) && (deathSays.length + fightLines.length) < 600) {
            if (/dead|died|didn't come back|grave|buried|slain|is dead/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
            else if (fightLines.length < 200) fightLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          }
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], instrumentErrors: [] };
  let lastSnapDay = -1;
  const policy = POLICY === 'refind' ? REFIND.tbretreatRefind : competent;
  try { REFIND.resetRefindStats(); } catch (e) { errors.push('refind-reset: ' + String(e.message).slice(0, 80)); }
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
    try { fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(), fallen: (((Game.state || {}).village || {}).fallen || []).slice(), wavesFaced: null, scaleRank: null, unlockedWave: null, standing: null, readiness5: null, deadMap: null, endScholarId: null }; } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }

  let refind = null;
  try { refind = REFIND.refindStats(); } catch (e) { errors.push('refind-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'tbretreat-refind', run: RUN, policy: POLICY, anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    refindStats: refind,
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
    const file = path.join(outDir, 'tbretreat-refind-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      rfFires: out.refindStats ? out.refindStats.triggerFires : null,
      rfExits: out.refindStats ? out.refindStats.exits : null,
      rfCrossings: out.refindStats ? out.refindStats.crossings : null,
      rfConsumed: out.refindStats ? out.refindStats.consumedPushes : null,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
