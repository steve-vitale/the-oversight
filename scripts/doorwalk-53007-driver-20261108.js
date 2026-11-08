// doorwalk-53007-driver-20261108.js — the 53007 DIAG driver
// (arm sim-53007-a, run fleshout-20261108T1622Z). DIAG, zero src/js.
// The doorwalk-b driver pattern (scripts/doorwalk-b-driver-20261107.js)
// with the 53007 DIAG recorder (scripts/recorder-53007-20261108.js)
// installed on the sitstep instrument snapshot. BASELINE leg only
// (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band
// 53001–53008, current master. DIAG_RECORDER=0 runs the identical
// driver WITHOUT the recorder (the G2 neutrality control).
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=doorwalk-baseline POLICY=baseline OUTDIR=evidence/2026-11-08/perseed-53007-a node scripts/doorwalk-53007-driver-20261108.js
//   DIAG_RECORDER=0 OUTDIR=/tmp/53007-unrec node scripts/doorwalk-53007-driver-20261108.js  (G2 control)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const DOORWALK = require(path.join(REPO, 'scripts', 'policies', 'competent-doorwalk-b'));
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));
const REC = require(path.join(REPO, 'scripts', 'recorder-53007-20261108'));

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
const RUN = process.env.RUN || 'doorwalk-baseline';
const POLICY = process.env.POLICY || 'baseline';
const RECORDER_ON = process.env.DIAG_RECORDER !== '0';
if (!SEEDS.length) { console.error('DOORWALK-53007 STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline') { console.error('DOORWALK-53007 STOP: POLICY must be baseline.'); process.exit(2); }
process.env.TAKESEAT_B = '1';
delete process.env.DOORWALK_B;
const policy = DOORWALK.doorwalk;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-08', 'perseed-53007-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'doorwalk-53007-a-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('DOORWALK-53007 STOP: refusing to overwrite ' + file); process.exit(3); }
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
function snapTable(Game) {
  const s = {};
  try {
    const T = (typeof Game.tableState === 'function') ? Game.tableState() : null;
    s.phase = T && T.phase != null ? String(T.phase) : null;
    s.path = T && T.path != null ? String(T.path) : null;
    s.branch = T && T.branch != null ? String(T.branch) : null;
    s.beat = T && T.beat != null ? (T.beat | 0) : null;
    s.trialPending = !!(T && T.trialPending);
  } catch (e) {}
  return s;
}
function offeredIds(Game) {
  try {
    const tc = ((Game.state || {}).scholar || {}).tableChoices;
    return (tc && tc.options) ? tc.options.map(function (o) { return String(o.id); }) : [];
  } catch (e) { return []; }
}

async function oneRun(seed) {
  process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'competent-doorwalk-b-' + POLICY, fullTelemetry: false });
  const deathSays = [];
  const tableLines = [];
  let sayCount = 0;
  const errors = [];
  const sitVerbMsgs = [];
  const doorVerbMsgs = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/TABLE|table is being set|lesser seat|take your seat|ring of pale light|the table has your name|does not come|still be here|TABLE IS SET|TABLE RETURNS|TABLE WAITS|table kept|TABLE — the ring|THE AUDIT|EVERYONE\. SIT|seven doors|Choose your door|Walk the path|downgrade|conscript|final choice|The middle road is open/i.test(arg) && tableLines.length < 300) tableLines.push({ day: gday(Game), line: String(arg).slice(0, 800) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  if (RECORDER_ON) { try { REC.install(Game, inst); } catch (e) { errors.push('recorder-install: ' + String(e.message).slice(0, 80)); } }
  const t = inst.t;
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.scholarAtHaven = scholarAtHaven(Game);
      snap.scholarAlive = scholarAlive(Game);
      try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
      try { snap.tableSnap = snapTable(Game); } catch (e) { snap.tableSnap = null; }
    } catch (e) { errors.push('snapshot-ext: ' + String(e.message).slice(0, 80)); }
    return snap;
  };
  ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'].forEach(function (name) {
    try {
      const inner = Game[name];
      if (typeof inner !== 'function') { errors.push('doorverb-missing-' + name); return; }
      Game[name] = function () {
        const before = snapTable(Game);
        const offered = offeredIds(Game);
        let arg = null;
        try { arg = (arguments.length && arguments[0] != null) ? String(arguments[0]) : null; } catch (e) {}
        let ret;
        try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
        try {
          const rec = { day: gday(Game), call: name, arg: arg, ok: !!(ret && ret.ok), msg: (ret && typeof ret.msg === 'string') ? ret.msg.slice(0, 200) : null, before: before, after: snapTable(Game), offered: offered };
          doorVerbMsgs.push(rec);
          if (name === 'tableTakeSeat' || name === 'tableOfferSeatTaker' || name === 'tableChooseSeatTaker') sitVerbMsgs.push(rec);
        } catch (e2) { errors.push('doorverb-record: ' + String(e2.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push('doorverb-install-' + name + ': ' + String(e.message).slice(0, 80)); }
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
  try { DOORWALK.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetTakeseatStats(); } catch (e) { errors.push('takeseat-reset: ' + String(e.message).slice(0, 80)); }
  try { DOORWALK.resetDoorwalkStats(); } catch (e) { errors.push('doorwalk-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, linkStats = null, feastStats = null, takeStats = null, doorStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  try { linkStats = DOORWALK.linkdriveStats(); } catch (e) { errors.push('linkdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { feastStats = DOORWALK.feastdriveStats(); } catch (e) { errors.push('feastdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { takeStats = DOORWALK.takeseatStats(); } catch (e) { errors.push('takeseat-stats: ' + String(e.message).slice(0, 80)); }
  try { doorStats = DOORWALK.doorwalkStats(); } catch (e) { errors.push('doorwalk-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'doorwalk-53007-a', run: RUN, policy: 'doorwalk-' + POLICY, anchorCommit: ANCHOR, instrumentOff: !RECORDER_ON,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, linkdriveStats: linkStats,
    feastdriveStats: feastStats, takeseatStats: takeStats, doorwalkStats: doorStats,
    sitAttempts: t.sitAttempts || [], sitVerbMsgs: sitVerbMsgs, doorVerbMsgs: doorVerbMsgs,
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
    const file = path.join(outDir, 'doorwalk-53007-a-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const diagDays = daily.filter(function (d) { return !!d.diag; }).length;
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, recorder: RECORDER_ON, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      sitAttempts: (out.sitAttempts || []).length,
      tsTaken: (out.takeseatStats || {}).seatTaken | 0, tsDay: (out.takeseatStats || {}).seatDay,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, diagDays: diagDays, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
