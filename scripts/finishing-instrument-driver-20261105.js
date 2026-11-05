// finishing-instrument-driver-20261105.js — finishing-instrument panel
// driver (arm build-finish-instrument). Competent policy verbatim ONLY (no
// probe variant in this arm). Death-aware horizon (runDays ends on village
// death / win). Seeds run sequentially in one process via the shared harness
// (loadGame per seed, as the secondkiller driver does). The instrument lives
// in game code (src/js/finishLog.js): per-seed JSON carries the runtime ring
// Game._finishLog, the fight_finish telemetry events, and
// Game._finishLogErrors. Per-seed JSON goes to
// evidence/2026-11-05/perseed-finish-instrument/ (sims write once, on
// purpose), or $OUTDIR when set (proof legs use /tmp). Refuses to
// overwrite. FINISHLOG_OFF=1 runs without the instrument (neutrality leg
// only — off-mode baseline must match on-mode baseline on
// days/endReason/kill-log length).
// Usage:
//   DAYS=150 SEEDS=99311,99312 RUN=finish-instrument-smoke node scripts/finishing-instrument-driver-20261105.js
//   DAYS=150 SEEDS=99311..99318 RUN=finish-instrument-pilot node scripts/finishing-instrument-driver-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

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
const RUN = process.env.RUN || 'finish-instrument-pilot';
const OFF = process.env.FINISHLOG_OFF === '1';
if (!SEEDS.length) { console.error('FINISHLOG STOP: SEEDS required.'); process.exit(2); }
if (process.env.POLICY && process.env.POLICY !== 'baseline') { console.error('FINISHLOG STOP: this arm is competent-verbatim only; POLICY must be baseline or unset.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-finish-instrument');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'finish-instrument-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('FINISHLOG STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  // fullTelemetry: true — the prereg's coverage bar requires a matching
  // fight_finish telemetry event for EVERY fight, and the 300-event ring
  // would evict early fights over a 150d run. Sims keep the full stream.
  const { Game } = await loadGame({ seed: seed, mode: 'competent-finish-instrument', fullTelemetry: true });
  const errors = [];
  await setupGame(Game);
  const policy = competent;
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // A TB fight still open at run end (village died mid-fight) is closed
  // as 'unfinished' by the instrument itself, never dropped silently.
  try { if (typeof Game.finishLogCloseOpen === 'function') Game.finishLogCloseOpen('unfinished'); } catch (e) { errors.push('closeOpen: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let teleFinish = [];
  try { teleFinish = (st.telemetry || []).filter(function (t) { return t && t.type === 'fight_finish'; }); } catch (e) { errors.push('tele-read: ' + String(e.message).slice(0, 80)); }
  const fights = (Game._finishLog || []).slice();
  const finErrors = (Game._finishLogErrors || []).slice();
  const out = {
    seed: seed, arm: 'finish-instrument', run: RUN, policy: 'baseline', anchorCommit: ANCHOR, instrumentOff: OFF,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    unlockedWave: (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null,
    standing: (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null,
    fights: fights, teleFinishCount: teleFinish.length,
    teleFinish: teleFinish,
    waveKillLog: ((st.waveKillLog) || []).slice(),
    fallen: (((st.village || {}).fallen) || []).slice(),
    wavesFaced: (typeof Game.deedState === 'function') ? ((Game.deedState() || {}).wavesFaced || null) : null,
    scaleRank: (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null,
    instrumentErrors: finErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'finish-instrument-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      fights: out.fights.length, teleFinish: out.teleFinishCount,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
