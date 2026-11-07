// linkdrive-driver-20261107.js — the link-forming drive pilot driver
// (arm sim-linkdrive-b, run fleshout-loop-b-20261107T1049Z). Replays band
// 53001–53008 (DELIBERATELY REUSED — balanced panel, before/after on
// identical seeds) at 150d death-aware, two legs through ONE driver:
//   POLICY=staged    -> the FROZEN staged policy (baseline leg; must
//                       reproduce the regionalstep replay EXACTLY)
//   POLICY=linkdrive -> staged + the link-forming drive (armed leg)
// Instrument: scripts/regionalstep-instrument-20261107.js reused VERBATIM
// (every daily gate field, link list, raise history, wrapped-call count),
// plus driver-side snapshot extensions (pantry kcal, pendingNational /
// pendingGlobal, pending-demand counts — read-only fields, no game-state
// effect) and a widened say-capture regex (adds bows|brings it home|
// Tribute:|grain|gesture — the askplus instrument finding: the
// regionalstep pattern misses the core link-formation lines).
// Per-seed JSON goes to evidence/2026-11-07/perseed-linkdrive-b/, or
// $OUTDIR when set (proof legs use /tmp). Refuses to overwrite.
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=linkdrive-base POLICY=staged node scripts/linkdrive-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=linkdrive-armed POLICY=linkdrive node scripts/linkdrive-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const LINKDRIVE = require(path.join(REPO, 'scripts', 'policies', 'competent-linkdrive-b'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'regionalstep-instrument-20261107'));

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
const RUN = process.env.RUN || 'linkdrive-base';
const POLICY_NAME = process.env.POLICY || 'staged';
if (!SEEDS.length) { console.error('LINKDRIVE STOP: SEEDS required.'); process.exit(2); }
if (POLICY_NAME !== 'staged' && POLICY_NAME !== 'linkdrive') { console.error('LINKDRIVE STOP: POLICY must be staged|linkdrive.'); process.exit(2); }
const policy = (POLICY_NAME === 'linkdrive') ? LINKDRIVE.linkdrivePolicy : STAGED.stagedPolicy;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-linkdrive-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'linkdrive-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('LINKDRIVE STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-linkdrive-' + POLICY_NAME, fullTelemetry: false });
  const diploLines = [];
  let sayCount = 0;
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/Regional Dawn|NETWORK|accord|first gesture|Three weeks|propose|decline|counter|doesn't answer the knock|Raid|tribute|ask them|link raise|bows to Haven|Haven bows|bows|brings it home|Tribute:|grain|gesture/i.test(arg) && diploLines.length < 300) diploLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  // Driver-side snapshot extensions (read-only): pantry + endgame beats +
  // pending demands. The instrument file itself is untouched.
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.pantryKcal = pantryKcal(Game);
      const st = Game.state || {};
      try { snap.pendingNational = st.pendingNational ? { shape: st.pendingNational.shape || null, day: (st.pendingNational.day | 0) } : null; } catch (e) { snap.pendingNational = null; }
      try { snap.pendingGlobal = st.pendingGlobal ? { day: (st.pendingGlobal.day | 0) } : null; } catch (e) { snap.pendingGlobal = null; }
      try {
        const links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
        snap.pendingDemands = links.filter(function (l) { return l && l.status === 'active' && l.pendingDemand; }).map(function (l) { return { linkId: l.id, kind: (l.pendingDemand && l.pendingDemand.kind) || null }; });
      } catch (e) { snap.pendingDemands = null; }
    } catch (e) { errors.push('snapshot-ext: ' + String(e.message).slice(0, 80)); }
    return snap;
  };
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
  try { LINKDRIVE.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, linkStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  try { linkStats = LINKDRIVE.linkdriveStats(); } catch (e) { errors.push('linkdrive-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'linkdrive', run: RUN, policy: POLICY_NAME, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, linkdriveStats: linkStats,
    sitAttempts: t.sitAttempts || [],
    regionalAttempts: t.regionalAttempts || [], talkCalls: t.talkCalls || [],
    firstLinkDay: fin ? fin.firstLinkDay : null, firstAccordDay: fin ? fin.firstAccordDay : null,
    diploLines: diploLines, sayCount: sayCount,
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
    const file = path.join(outDir, 'linkdrive-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const pairDays = daily.filter(function (d) { return d.pairDay; }).length;
    const last = daily[daily.length - 1] || {};
    const gateSeen = {};
    daily.forEach(function (d) { gateSeen[d.gate || '?'] = (gateSeen[d.gate || '?'] | 0) + 1; });
    const ld = out.linkdriveStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      gates: gateSeen, pairDays: pairDays,
      networkLive: !!last.networkLive, networkLiveDay: last.networkLiveDay || null,
      proposeCalls: last.proposeCalls | 0, proposeFormed: last.proposeFormed | 0,
      acceptRaises: last.acceptLinkRaiseCalls | 0, activeLinks: last.activeLinks | 0, everLinks: last.everLinks | 0,
      knownCount: last.knownCount | 0, bestDet: last.bestDet,
      ldPropose: (ld.proposeAccepted | 0) + '/' + (ld.proposeCounter | 0) + '/' + (ld.proposeDeclined | 0),
      ldRaises: (ld.raisesLinked | 0) + '/' + (ld.raisesCountered | 0) + '/' + (ld.raisesSkippedNotReady | 0),
      ldTends: ld.tends | 0, ldTribute: ld.tributePays | 0,
      diploLines: (out.diploLines || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
