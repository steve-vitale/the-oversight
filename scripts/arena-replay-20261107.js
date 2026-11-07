// arena-replay-20261107.js — replay driver for sim-arena-b (DIAG only).
// Re-runs baseline seeds 53004 + 53006 (the stageally-confirm corpus
// band — NO fresh seed band) with the stageally instrument (which chains
// bankkiller + killerdeath) plus the arena capture wrapper, so the two
// residual killer deaths can be traced with the contest/arena/alien
// state the corpus never recorded:
//   53004 baseline d87: gen_93bg7ex, fallen 'the arena', unfinished
//     Audit TB fight the same day.
//   53006 baseline d86: gen_76n8yer, fallen 'a stranger', no fight row.
// Policy: competent baseline verbatim (POLICY=baseline, default).
// Death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness. Per-seed JSON goes
// to evidence/2026-11-07/perseed-arena-b/ (sims write once, on purpose),
// or $OUTDIR when set. Refuses to overwrite.
// Usage:
//   DAYS=150 SEEDS=53004,53006 RUN=arena-b node scripts/arena-replay-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'stageally-instrument-20261106'));
const CAP = require(path.join(REPO, 'scripts', 'arena-capture-20261107'));

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
const RUN = process.env.RUN || 'arena-b';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('ARENA STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline') { console.error('ARENA STOP: POLICY must be baseline.'); process.exit(2); }
const policy = competent;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-arena-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'arena-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('ARENA STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-arena-b', fullTelemetry: false });
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
  const inst = INST.install(Game);
  const cap = CAP.install(Game);
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
  try { cap.uninstall(); } catch (e) { errors.push('cap-uninstall: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'arena-b', run: RUN, policy: POLICY, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason || null, won: !!result.won, over: !!result.over,
    villageLost: !!result.villageLost,
    scaleRank: fin ? fin.scaleRank : null, maxWave: fin ? fin.maxWave : null,
    unlockedWave: fin ? fin.unlockedWave : null,
    standing: fin ? fin.standing : null, readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive,
    scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights,
    bankkillerStats: t.bankkillerStats || null, stageallyStats: t.stageallyStats || null,
    deathSays: deathSays, fightLines: fightLines, inviteLines: inviteLines,
    sayCount: sayCount, waveKillLog: fin ? fin.waveKillLog : null,
    fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    teleDeaths: t.teleDeaths || [],
    arenaTbEnds: cap.t.tbEnds, arenaDeaths: cap.t.deaths,
    instrumentErrors: (t.instrumentErrors || []).concat(cap.t.instrumentErrors).concat(errors),
  };
  const file = path.join(outDir, 'arena-s' + seed + '-' + RUN + '.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log('arena-b seed ' + seed + ': days=' + result.days + ' end=' + (result.endReason || '?') +
    ' standing=' + (fin && fin.standing) + ' scholarDeaths=' + (t.scholarDeaths || []).length +
    ' arenaDeaths=' + cap.t.deaths.length + ' -> ' + file);
}

(async function () {
  for (const seed of SEEDS) await oneRun(seed);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
