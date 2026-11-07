// firstkiller-driver-20261107.js — first-killer survival replay driver
// (arm sim-firstkiller-b, run fleshout-loop-b-20261107T0530Z). Replays
// band 53001-53008, staged (scripts/policies/competent-stageally-a.js,
// unmodified) vs baseline (competent verbatim), 150d death-aware.
// A COPY of scripts/stageally-driver-20261106.js with only: OUTDIR /
// RUN defaults, file prefix, and the per-seed firstKillers table
// embedded at write time (computed by firstkiller-analyze-20261107
// from the run's own records — waveKillLog read at finalize, so the
// pyrrhic direct-write path and never-closed fights are included).
// The stageally instrument is installed VERBATIM; nothing in the
// harness, policy, or instrument differs from the confirm2 replay, so
// this replay is expected to reproduce the confirm2 corpus headline
// numbers (days / endReason / wave-4+ kill counts per seed per leg).
// Per-seed JSON goes to evidence/2026-11-07/perseed-firstkiller-b/
// (sims write once, on purpose), or $OUTDIR when set (proof legs use
// /tmp). Refuses to overwrite. STAGEALLY_OFF=1 runs without the
// instrument (neutrality leg only; firstKillers is then omitted —
// channel classification needs the instrument's scholarDeaths /
// tbFights rows).
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=firstkiller-baseline node scripts/firstkiller-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=firstkiller-staged POLICY=staged node scripts/firstkiller-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const FK = require(path.join(REPO, 'scripts', 'firstkiller-analyze-20261107'));

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
const RUN = process.env.RUN || 'firstkiller-baseline';
const OFF = process.env.STAGEALLY_OFF === '1';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('FIRSTKILLER STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'staged') { console.error('FIRSTKILLER STOP: POLICY must be baseline|staged.'); process.exit(2); }
let policy = competent;
if (POLICY === 'staged') policy = STAGED.stagedPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-firstkiller-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'firstkiller-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('FIRSTKILLER STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-firstkiller-' + POLICY, fullTelemetry: false });
  const deathSays = [];
  const fightLines = [];
  const inviteLines = [];
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
          if (/joins your party|JOINED THE PARTY|shakes their head|I work alone|I don't know you well enough/i.test(arg) && inviteLines.length < 100) inviteLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], rallyCalls: [], tbFights: [], instrumentErrors: [] };
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
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (inst) { try { inst.snapshot(); } catch (e) {} }
  let fin = null;
  if (inst) { try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); } }
  else {
    try { fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(), fallen: (((Game.state || {}).village || {}).fallen || []).slice(), wavesFaced: null, scaleRank: null, unlockedWave: null, standing: null, readiness5: null, deadMap: null, endScholarId: null }; } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }
  let rallyStats = null, stageStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'firstkiller', run: RUN, policy: POLICY, anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats,
    deathSays: deathSays, fightLines: fightLines, inviteLines: inviteLines, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  // First-killer death recorder: pure classification over this run's own
  // records (waveKillLog read at finalize — pyrrhic-safe). Omitted on
  // OFF legs, where the instrument rows it reads do not exist.
  if (inst) {
    try {
      const fk = FK.analyzeRow(out);
      out.firstKillers = fk.firstKillers;
      out.secondKillerGap = fk.secondKillerGap;
      out.secondKillGap = fk.secondKillGap;
      out.distinctKillers = fk.distinctKillers;
    } catch (e) { errors.push('firstkiller-record: ' + String(e.message).slice(0, 80)); }
  }
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'firstkiller-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    const ss = out.stageallyStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endRaw: last.raw != null ? last.raw : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      rallyCalls: (out.rallyCalls || []).length,
      rallyFires: out.bankkillerStats ? out.bankkillerStats.rallyFires : null,
      invites: ss.invites != null ? ss.invites : null,
      accepted: ss.accepted != null ? ss.accepted : null,
      partyDays2: out.daily.filter(function (d) { return (d.partySize | 0) >= 2; }).length,
      firstKillers: (out.firstKillers || []).length,
      firstKillerDeaths: (out.firstKillers || []).filter(function (k) { return !k.aliveAtEnd; }).length,
      secondKillerGap: out.secondKillerGap != null ? out.secondKillerGap : null,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
