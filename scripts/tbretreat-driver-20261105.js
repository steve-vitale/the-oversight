// tbretreat-driver-20261105.js — TB retreat-and-refind driver
// (arm sim-tbretreat-b, run fleshout-loop-b-20261105T1423Z). Two legs on
// identical seeds: baseline (competent verbatim, TBRETREAT_RESTORE OFF)
// and armed (competent-tbretreat-b driver + TBRETREAT_RESTORE=1). The
// driver OWNS the flag: baseline deletes it from process.env, armed
// sets it — a leg can never run with the wrong flag. Death-aware horizon
// (runDays ends on village death / win). Seeds run sequentially in one
// process via the shared harness (loadGame per seed, as the dmground
// driver does). Per-seed JSON goes to
// evidence/2026-11-05/perseed-tbretreat-b/ (sims write once, on
// purpose), or $OUTDIR when set (proof legs use /tmp). Refuses to
// overwrite. TBRETREAT_OFF=1 runs without the instrument (neutrality
// leg only — off-mode baseline must match on-mode baseline on
// days/endReason/kill-log length).
// Usage:
//   DAYS=150 SEEDS=99721,99722 RUN=tbretreat-baseline POLICY=baseline node scripts/tbretreat-driver-20261105.js
//   DAYS=150 SEEDS=99721..99728 RUN=tbretreat-armed POLICY=tbretreat node scripts/tbretreat-driver-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const TBR = require(path.join(REPO, 'scripts', 'policies', 'competent-tbretreat-b'));
const INST = require(path.join(REPO, 'scripts', 'tbretreat-instrument-20261105'));

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
const RUN = process.env.RUN || 'tbretreat-diag';
const OFF = process.env.TBRETREAT_OFF === '1';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('TBRETREAT STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'tbretreat') { console.error('TBRETREAT STOP: POLICY must be baseline or tbretreat.'); process.exit(2); }
// The driver OWNS the game flag: a leg can never run with the wrong one.
// Armed sets it (the restore is ON); baseline deletes it (OFF, default).
if (POLICY === 'tbretreat') { process.env.TBRETREAT_RESTORE = '1'; }
else { delete process.env.TBRETREAT_RESTORE; }
const FLAG_ON = process.env.TBRETREAT_RESTORE === '1';
if (POLICY === 'tbretreat' && !FLAG_ON) { console.error('TBRETREAT STOP: armed leg without the flag.'); process.exit(2); }
if (POLICY === 'baseline' && FLAG_ON) { console.error('TBRETREAT STOP: baseline leg with the flag set.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-05', 'perseed-tbretreat-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'tbretreat-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TBRETREAT STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-tbretreat', fullTelemetry: false });
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
          // TBRETREAT: barrier + retreat lines are captured too
          // (staypolicy-a's measurement gap — its say-wrap regex never
          // captured a barrier line, so no exit was visible in the
          // transcript). The restore line ("slip away … bleeding")
          // must appear for a counted restore.
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran|blood your|HELD|draft waits|stood and fought|killed|pack|scatter|BARRIER|barrier holds|known world ends|slip away|stays where you left it|treeline holds|didn't leave/i.test(arg) && (deathSays.length + fightLines.length) < 600) {
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
  // TBRETREAT: armed leg uses the tbretreat wrapper (flee-when-losing
  // verbatim); module-level stay stats are reset per seed so the
  // corpus carries per-seed trigger/exit counts.
  const policy = (POLICY === 'tbretreat') ? TBR.tbRetreat : competent;
  if (POLICY === 'tbretreat') { try { TBR.resetStayStats(); } catch (e) { errors.push('stayStats-reset: ' + String(e.message).slice(0, 80)); } }
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
  let stayStats = null;
  if (POLICY === 'tbretreat') { try { stayStats = TBR.stayStats(); } catch (e) { errors.push('stayStats-capture: ' + String(e.message).slice(0, 80)); } }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'tbretreat', run: RUN, policy: POLICY, flagOn: FLAG_ON, anchorCommit: ANCHOR, instrumentOff: OFF,
    stayStats: stayStats,
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
    const file = path.join(outDir, 'tbretreat-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const last = out.daily[out.daily.length - 1] || {};
    const r5 = last.readiness5 || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, flagOn: out.flagOn, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing,
      endGated: last.gated != null ? last.gated : null,
      endReadyVets: r5.veterans != null ? r5.veterans : null,
      fights: out.fights.length, w4fights: out.fights.filter(function (f) { return (f.wave | 0) >= 4; }).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      tbFled: out.fights.filter(function (f) { return f.channel === 'player-tb' && f.ending === 'flee'; }).length,
      tbRestored: out.fights.filter(function (f) { return f.channel === 'player-tb' && f.restored === true; }).length,
      stayFires: out.stayStats ? out.stayStats.triggerFires : null,
      stayExits: out.stayStats ? out.stayStats.exits : null,
      snapshots: out.daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
