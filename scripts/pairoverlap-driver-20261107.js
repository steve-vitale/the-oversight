// pairoverlap-driver-20261107.js — the yield-the-blow driver
// (arm sim-pairoverlap-b, run fleshout-loop-b-20261107T2130Z).
// Replays a policy on band 53001–53008 with the feast-chain recorder
// (scripts/feastdrive-instrument-20261107.js, reused — not copied).
// Death-aware horizon (runDays ends on village death / win). Seeds
// run sequentially in one process via the shared harness (loadGame
// per seed). Per-seed JSON goes to
// evidence/2026-11-07/perseed-pairoverlap-b-<leg>/, or $OUTDIR
// when set (proof legs use /tmp). Refuses to overwrite. Band
// 53001–53008 is DELIBERATELY REUSED (a re-read of the
// feastdrive/feastcost/feastcap/feaststopspend trajectories, not a
// fresh band — see the prereg). Two legs on current master: the
// re-baseline (POLICY=feastdrive, the drive as-is) and the armed leg
// (POLICY=pairoverlap, the drive + yield-the-blow).
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=pairoverlap-baseline POLICY=feastdrive node scripts/pairoverlap-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=pairoverlap-armed POLICY=pairoverlap node scripts/pairoverlap-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'feastdrive-instrument-20261107'));

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
const RUN = process.env.RUN || 'pairoverlap-baseline';
const POLICY = process.env.POLICY || 'feastdrive';
if (!SEEDS.length) { console.error('PAIROVERLAP STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'staged' && POLICY !== 'feastdrive' && POLICY !== 'pairoverlap') { console.error('PAIROVERLAP STOP: POLICY must be staged|feastdrive|pairoverlap.'); process.exit(2); }
let policy = STAGED.stagedPolicy;
let policyId = 'staged';
if (POLICY === 'feastdrive') {
  const FD = require(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b'));
  policy = FD.feastdrive;
  policyId = 'feastdrive';
}
if (POLICY === 'pairoverlap') {
  const PO = require(path.join(REPO, 'scripts', 'policies', 'competent-pairoverlap-b'));
  policy = PO.pairoverlap;
  policyId = 'pairoverlap';
}
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-pairoverlap-b-' + RUN.replace(/^pairoverlap-/, ''));
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'pairoverlap-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('PAIROVERLAP STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-pairoverlap-' + POLICY, fullTelemetry: false });
  const feastLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/FEASTED|feast|surge|scavenger|keepsake|channel|devotion|drove off|edge of the light/i.test(arg) && feastLines.length < 400) feastLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
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
  if (POLICY === 'feastdrive' || POLICY === 'pairoverlap') {
    try { const FD = require(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b')); if (FD.resetFeastdriveStats) FD.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
  }
  if (POLICY === 'pairoverlap') {
    try { const PO = require(path.join(REPO, 'scripts', 'policies', 'competent-pairoverlap-b')); if (PO.resetPairoverlapStats) PO.resetPairoverlapStats(); } catch (e) { errors.push('pairoverlap-reset: ' + String(e.message).slice(0, 80)); }
  }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, feastStats = null, pairStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  if (POLICY === 'feastdrive' || POLICY === 'pairoverlap') {
    try { const FD = require(path.join(REPO, 'scripts', 'policies', 'competent-feastdrive-b')); if (FD.feastdriveStats) feastStats = FD.feastdriveStats(); } catch (e) { errors.push('feastdrive-stats: ' + String(e.message).slice(0, 80)); }
  }
  if (POLICY === 'pairoverlap') {
    try { const PO = require(path.join(REPO, 'scripts', 'policies', 'competent-pairoverlap-b')); if (PO.pairoverlapStats) pairStats = PO.pairoverlapStats(); } catch (e) { errors.push('pairoverlap-stats: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'pairoverlap', run: RUN, policy: policyId, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, feastdriveStats: feastStats, pairoverlapStats: pairStats,
    sitAttempts: t.sitAttempts || [],
    regionalAttempts: t.regionalAttempts || [], talkCalls: t.talkCalls || [],
    firstLinkDay: fin ? fin.firstLinkDay : null, firstAccordDay: fin ? fin.firstAccordDay : null,
    feastEvents: fin ? fin.feastEvents : null,
    firstArmDay: fin ? fin.firstArmDay : null, firstFeastDay: fin ? fin.firstFeastDay : null,
    firstGrantDay: fin ? fin.firstGrantDay : null, firstDrawDay: fin ? fin.firstDrawDay : null,
    firstSpendDay: fin ? fin.firstSpendDay : null, endFeastGate: fin ? fin.endFeastGate : null,
    feastLines: feastLines, sayCount: sayCount,
    waveKillLog: fin ? fin.waveKillLog : null, fallen: fin ? fin.fallen : null, wavesFaced: fin ? fin.wavesFaced : null,
    deadMap: fin ? fin.deadMap : null, endScholarId: fin ? fin.endScholarId : null,
    finalSeat: fin ? fin.finalSeat : null, finalFullShortfall: fin ? fin.finalFullShortfall : null,
    teleDeaths: (result.samples && result.samples.deaths) || null,
    instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return out;
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'pairoverlap-s' + seed + '-' + RUN + '.json');
    // Write with retry: the host EPERM flap (2026-11-05+) refuses
    // file writes in bursts while plain probes succeed seconds
    // later. Same bytes, same path — only the write is retried, so
    // the corpus is byte-identical to a single clean write.
    var written = false, writeErr = null;
    for (var w = 0; w < 60 && !written; w++) {
      try {
        fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
        written = true;
      } catch (e) {
        writeErr = e;
        if (w < 59) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
      }
    }
    if (!written) throw writeErr;
    const daily = out.daily || [];
    const pairDays = daily.filter(function (d) { return d.pairDay; }).length;
    const last = daily[daily.length - 1] || {};
    const gates = {};
    daily.forEach(function (d) { gates[d.feastGate || '?'] = (gates[d.feastGate || '?'] | 0) + 1; });
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      endFeastGate: out.endFeastGate, feastGates: gates, pairDays: pairDays,
      channels: last.channels | 0, arms: last.arms | 0, feasts: last.feasts | 0,
      grants: last.grants | 0, draws: last.draws | 0, faced: last.facedOk | 0,
      drivenOff: last.drivenOff | 0, spent: !!last.spent, resonance: last.surgeResonance,
      l3: last.l3Count, feastLines: (out.feastLines || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, errors: out.instrumentErrors.length,
      donatedKcal: (out.feastdriveStats || {}).donatedKcal | 0,
      yields: (out.pairoverlapStats || {}).yields | 0,
      yieldFights: (out.pairoverlapStats || {}).yieldFights | 0,
      firstYieldDay: (out.pairoverlapStats || {}).firstYieldDay,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
