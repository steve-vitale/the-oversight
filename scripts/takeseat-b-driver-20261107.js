// takeseat-b-driver-20261107.js — the sit-drive driver
// (arm sim-takeseat-b, run fleshout-loop-b-20261107T1330Z). Replays the
// NEW linkfeast composite policy
// (scripts/policies/competent-linkfeast-b.js — frozen staged +
// linkdrive + feastdrive + sit drive) on band 53001–53008 with the
// sit recorder (scripts/sitstep-instrument-20261107.js, reused
// VERBATIM via require) plus driver-side scholar-availability and
// sit-verb-msg extensions (the sitstep2-driver pattern — no
// instrument edit). Death-aware horizon (runDays ends on village
// death / win). Seeds run sequentially in one process via the shared
// harness (loadGame per seed). Per-seed JSON goes to
// evidence/2026-11-07/perseed-takeseat-b-<leg>/, or $OUTDIR when set
// (proof legs use /tmp). Refuses to overwrite. Band 53001–53008 is
// DELIBERATELY REUSED (a re-run, not a fresh band — see the prereg);
// the baseline leg is the composite with the sit drive OFF, the
// armed leg the same composite with TAKESEAT_B=1.
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=takeseat-baseline POLICY=baseline node scripts/takeseat-b-driver-20261107.js
//   DAYS=150 SEEDS=53001..53008 RUN=takeseat-armed POLICY=armed node scripts/takeseat-b-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const LINKFEAST = require(path.join(REPO, 'scripts', 'policies', 'competent-linkfeast-b'));
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));

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
const RUN = process.env.RUN || 'takeseat-baseline';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('TAKESEAT-B STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'armed') { console.error('TAKESEAT-B STOP: POLICY must be baseline|armed.'); process.exit(2); }
// The sit-drive gate is env-read live by the policy (layerOn). One leg
// per process, so set it here before any sim runs.
if (POLICY === 'armed') process.env.TAKESEAT_B = '1';
else delete process.env.TAKESEAT_B;
const policy = LINKFEAST.linkfeast;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-takeseat-b-' + POLICY);
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'takeseat-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('TAKESEAT-B STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scholarAtHaven(Game) {
  try { return (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null; } catch (e) { return null; }
}
function scholarAlive(Game) {
  try {
    const vs = (Game.data || {}).villagers || [];
    const me = vs.find(function (v) { return v && v.id === Game.villagerId; });
    if (!me) return null;
    return !me.dead;
  } catch (e) { return null; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'competent-takeseat-b-' + POLICY, fullTelemetry: false });
  const deathSays = [];
  const tableLines = [];
  let sayCount = 0;
  const errors = [];
  const sitVerbMsgs = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/TABLE|table is being set|lesser seat|take your seat|ring of pale light|the table has your name|does not come|still be here|TABLE IS SET|TABLE RETURNS|TABLE WAITS|table kept|TABLE — the ring|THE AUDIT|EVERYONE\. SIT|seven doors|Choose your door/i.test(arg) && tableLines.length < 200) tableLines.push({ day: gday(Game), line: String(arg).slice(0, 800) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  // Driver-side snapshot extensions (read-only): scholar availability
  // on every daily row — the sit chain's "scholar absent?" link.
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.scholarAtHaven = scholarAtHaven(Game);
      snap.scholarAlive = scholarAlive(Game);
      try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    } catch (e) { errors.push('snapshot-ext: ' + String(e.message).slice(0, 80)); }
    return snap;
  };
  // Sit-verb msg wrap OUTSIDE the instrument wrap: records the returned
  // msg per call (the instrument wrap records call + ok). Returns the
  // original result untouched; never throws into game code. Installed
  // after inst.install; inst.uninstall() restores the pre-instrument
  // originals, which drops this wrap too — records live in sitVerbMsgs.
  ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'].forEach(function (name) {
    try {
      const inner = Game[name];
      if (typeof inner !== 'function') { errors.push('sitmsg-missing-' + name); return; }
      Game[name] = function () {
        let ret;
        try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
        try {
          sitVerbMsgs.push({ day: gday(Game), call: name, ok: !!(ret && ret.ok), msg: (ret && typeof ret.msg === 'string') ? ret.msg.slice(0, 200) : null });
        } catch (e2) { errors.push('sitmsg-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('sitmsg-install-' + name + ': ' + String(e.message).slice(0, 80)); }
  });

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
  try { LINKFEAST.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { LINKFEAST.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { LINKFEAST.resetTakeseatStats(); } catch (e) { errors.push('takeseat-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, linkStats = null, feastStats = null, takeStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  try { linkStats = LINKFEAST.linkdriveStats(); } catch (e) { errors.push('linkdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { feastStats = LINKFEAST.feastdriveStats(); } catch (e) { errors.push('feastdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { takeStats = LINKFEAST.takeseatStats(); } catch (e) { errors.push('takeseat-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'takeseat-b', run: RUN, policy: 'linkfeast-' + POLICY, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, linkdriveStats: linkStats,
    feastdriveStats: feastStats, takeseatStats: takeStats,
    sitAttempts: t.sitAttempts || [], sitVerbMsgs: sitVerbMsgs,
    deathSays: deathSays, tableLines: tableLines, sayCount: sayCount,
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
    const file = path.join(outDir, 'takeseat-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const seatDays = daily.filter(function (d) { return d.seat && d.seat !== 'none'; });
    const seatSeen = {};
    daily.forEach(function (d) { seatSeen[d.seat || 'none'] = (seatSeen[d.seat || 'none'] | 0) + 1; });
    const ts = out.takeseatStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      seatDays: seatSeen, firstSeatDay: seatDays.length ? seatDays[0].day : null,
      previewReadyDays: daily.filter(function (d) { return d.preview && d.preview.ready; }).length,
      previewSeenDays: daily.filter(function (d) { return !!d.preview; }).length,
      sitAttempts: (out.sitAttempts || []).length, sitVerbMsgs: (out.sitVerbMsgs || []).length,
      tsTaken: ts.seatTaken | 0, tsDay: ts.seatDay, tsKind: ts.seatKind, tsDoors: ts.doorsOffered,
      tableDoneDays: daily.filter(function (d) { return d.tableDone; }).length,
      tableChoicesDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
      tableLines: (out.tableLines || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
