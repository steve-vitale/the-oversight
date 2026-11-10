// wave5face-driver-20261109.js — wave-5 facing driver
// (arm sim-wave5face-b, run fleshout-loop-b-20261110T0122Z). Competent policy
// verbatim, unmodified — ONE leg only (characterization, no lever).
// Death-aware horizon (runDays ends on village death / win). Seeds run
// sequentially in one process via the shared harness (loadGame per seed).
// Per-seed JSON goes to evidence/2026-11-09/perseed-wave5face-b/ (sims write
// once, on purpose), or $OUTDIR when set (proof legs use /tmp). Refuses
// to overwrite. W5_OFF=1 runs without the instrument (neutrality leg
// only; off-mode baseline must match on-mode baseline on days/endReason/
// kill-log length).
// Usage:
//   DAYS=150 SEEDS=99641..99648 RUN=wave5face-b node scripts/wave5face-driver-20261109.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'wave5face-instrument-20261109'));

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
const RUN = process.env.RUN || 'wave5face-b';
const OFF = process.env.W5_OFF === '1';
if (!SEEDS.length) { console.error('W5 STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-09', 'perseed-wave5face-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'w5-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('W5 STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'wave5face-b', fullTelemetry: false });
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
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought|Producers/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/Contact finish|Committed|cornered|does not let it slip|holds through|two blows from falling|breaks — wounded|turns and runs|ON ME|Rally|rally|line closes|hold the line|TOGETHER/i.test(arg) && fightLines.length < 200) fightLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let inst = null;
  if (!OFF) inst = INST.install(Game);
  const t = inst ? inst.t : { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], rallyCalls: [], tbFights: [], traces: [], fieldFights: [], instrumentErrors: [], w5spawns: [], w5casts: [], w5wanderers: [], w5livingVets: [] };
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
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
    // Off leg: the same end-state reads the instrument's finalize does,
    // taken directly from Game (pure reads, no wraps) so the neutrality
    // comparison is apples-to-apples. Field rows / scholar-death rows /
    // traces are instrument-recorded and therefore empty here by design
    // — they are NOT part of the on/off comparison (see prereg
    // correction); determinism of those rows is shown by the on/on
    // re-run in the proof test instead.
    try {
      let dead = null;
      try {
        dead = {};
        ((Game.data || {}).villagers || []).forEach(function (p) { if (p && p.id) dead[p.id] = !!p.dead; });
        ((Game.data || {}).background_survivors || []).forEach(function (p) { if (p && p.id && dead[p.id] === undefined) dead[p.id] = !!p.dead; });
      } catch (e2) { dead = null; }
      let wf = null;
      try { const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null; wf = (ds && ds.wavesFaced) || null; } catch (e2) {}
      fin = { waveKillLog: (((Game.state || {}).waveKillLog) || []).slice(),
        fallen: (((Game.state || {}).village || {}).fallen || []).slice(),
        wavesFaced: wf,
        scaleRank: Game.scaleRank ? Game.scaleRank() : null,
        unlockedWave: Game.unlockedWave ? Game.unlockedWave() : null,
        standing: Game.villageStandingTotal ? Game.villageStandingTotal() : null,
        readiness5: Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null,
        deadMap: dead, endScholarId: Game.villagerId || null };
    } catch (e) { fin = null; }
  }
  if (inst) { try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); } }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'wave5face', run: RUN, policy: 'baseline', anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [], traces: t.traces || [],
    fieldFights: t.fieldFights || [],
    w5spawns: t.w5spawns || [], w5casts: t.w5casts || [], w5wanderers: t.w5wanderers || [], w5livingVets: t.w5livingVets || [],
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
    const file = path.join(outDir, 'w5-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const w5ff = (out.fieldFights || []).filter(function (f) { return (f.wave | 0) >= 5; });
    const w5tr = (out.traces || []).filter(function (x) { return (x.wave | 0) >= 5; });
    const relDays = (out.daily || []).filter(function (d) { return (d.unlockedWaveSnap | 0) >= 5; }).length;
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      releaseDays: relDays,
      w5spawns: (out.w5spawns || []).length, w5casts: (out.w5casts || []).length,
      w5field: w5ff.length,
      w5fieldKills: w5ff.filter(function (f) { return f.outcome === 'vKill'; }).length,
      w5traces: w5tr.length,
      w5kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 5); }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      scholarDeaths: (out.scholarDeaths || []).length,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
