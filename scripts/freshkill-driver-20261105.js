// freshkill-driver-20261105.js — fresh-kill inversion DIAG driver
// (arm sim-freshkill-a, run fleshout-20261105T1515Z). Competent policy
// verbatim ONLY (DIAG leg; no lever in this leg). Death-aware horizon
// (runDays ends on village death / win). Seeds run sequentially in one
// process via the shared harness (loadGame per seed, as the grindfinish
// driver does). Instrument reused VERBATIM from grindfinish-b
// (scripts/grindfinish-instrument-20261105.js) — the channel split is an
// analyzer-side classification, no new capture. Per-seed JSON goes to
// evidence/2026-11-05/perseed-freshkill-a/ (sims write once, on purpose),
// or $OUTDIR when set (proof legs use /tmp). Refuses to overwrite.
// FRESHKILL_OFF=1 runs without the instrument (neutrality leg only —
// off-mode baseline must match on-mode baseline on days/endReason/
// kill-log length).
// Usage:
//   DAYS=150 SEEDS=99351,99352 RUN=freshkill-smoke node scripts/freshkill-driver-20261105.js
//   DAYS=150 SEEDS=99351..99358 RUN=freshkill-diag node scripts/freshkill-driver-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'grindfinish-instrument-20261105'));

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
const RUN = process.env.RUN || 'freshkill-diag';
const OFF = process.env.FRESHKILL_OFF === '1';
if (!SEEDS.length) { console.error('FRESHKILL STOP: SEEDS required.'); process.exit(2); }
if (process.env.POLICY && process.env.POLICY !== 'baseline') { console.error('FRESHKILL STOP: this arm is competent-verbatim only; POLICY must be baseline or unset.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-freshkill-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'freshkill-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('FRESHKILL STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-freshkill', fullTelemetry: false });
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
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought|killed|pack|scatter/i.test(arg) && (deathSays.length + fightLines.length) < 600) {
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
  const policy = competent;
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

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'freshkill', run: RUN, policy: 'baseline', anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
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
    const file = path.join(outDir, 'freshkill-s' + seed + '-' + RUN + '.json');
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
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
