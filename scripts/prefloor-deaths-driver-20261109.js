// prefloor-deaths-driver-20261109.js — the PRE-FLOOR DEATHS DIAG driver
// (arm sim-prefloor-deaths-b, run fleshout-loop-b-20261109T1230Z). DIAG, zero src/js.
// The sitgap-winseek-driver pattern (scripts/sitgap-winseek-driver-20261109.js)
// with a LEG switch: LEG=winseek runs plain winseek (no sit drive by
// construction — the zero-stats stub feeds the recorder); LEG=doorwalk runs
// the doorwalk policy (scripts/policies/competent-doorwalk-b.js) with BOTH
// gates OFF (TAKESEAT_B unset, DOORWALK_B unset) — no sitting, no door
// walking — so floor survival is measured cleanly on both legs. This
// DEPARTS from sitgap-b's baseline (which set TAKESEAT_B=1 and sat 6/8);
// the departure is pre-registered (evidence/2026-11-09/
// sim-prefloor-deaths-b-prereg.md) and is the point: neither leg may end a
// run early at the table, so the pre-day-90 death decomposition is
// observed on full trajectories. Any sit-verb call on either leg
// contradicts the configuration and must be reported loudly, never smoothed.
// Fresh band 55201–55212, 150d death-aware, current master.
// DIAG_RECORDER=0 runs the identical driver WITHOUT either recorder (the
// G2 neutrality control).
// Usage:
//   DAYS=150 SEEDS=55201..55212 LEG=winseek RUN=winseek OUTDIR=evidence/2026-11-09/perseed-prefloor-deaths-b node scripts/prefloor-deaths-driver-20261109.js
//   DAYS=150 SEEDS=55201..55212 LEG=doorwalk RUN=doorwalk-baseline OUTDIR=evidence/2026-11-09/perseed-prefloor-deaths-b-doorwalk node scripts/prefloor-deaths-driver-20261109.js
//   DIAG_RECORDER=0 OUTDIR=/tmp/prefloor-unrec node scripts/prefloor-deaths-driver-20261109.js  (G2 control)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const WINSEEK = require(path.join(REPO, 'scripts', 'policies', 'winseek'));
const DOORWALK = require(path.join(REPO, 'scripts', 'policies', 'competent-doorwalk-b'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const INST = require(path.join(REPO, 'scripts', 'sitstep-instrument-20261107'));
const REC = require(path.join(REPO, 'scripts', 'recorder-53007-20261108'));
const REC2 = require(path.join(REPO, 'scripts', 'recorder-sitgap-20261108'));

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
const RUN = process.env.RUN || 'winseek';
const LEG = process.env.LEG || 'winseek';
const RECORDER_ON = process.env.DIAG_RECORDER !== '0';
// BOTH legs run with no seat-walking and no door-walking: delete the gates
// rather than setting them, so no stale gate env leaks in from a sibling
// driver invocation in the same shell. (sitgap-b's baseline set
// TAKESEAT_B=1 — this arm deliberately does not.)
delete process.env.TAKESEAT_B;
delete process.env.DOORWALK_B;
const policy = LEG === 'winseek' ? WINSEEK.winseek : DOORWALK.doorwalk;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// ZERO-STATS STUB (winseek leg only — see header): winseek has no
// takeSeatDrive and no takeseatStats. The recorder requires a function,
// so it gets a pure one returning a fresh zero object. Any non-zero value
// here would be a lie.
function zeroTakeseatStats() {
  return { skips: {}, seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, events: [] };
}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-09', 'perseed-prefloor-deaths-b');

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
  if (LEG === 'doorwalk') process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'prefloor-' + LEG, fullTelemetry: false });
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
          // TIGHTENED death regex (sitdrive prereg): word boundaries, so
          // "deadfall" forage lines stop polluting the death sample.
          if (/\bdead\b|\bdied\b|didn't come back|\bgrave\b|\bburied\b|\bscreams\b|starts digging|\bslain\b|\bis dead\b|\bveteran\b/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (/TABLE|table is being set|lesser seat|take your seat|ring of pale light|the table has your name|does not come|still be here|TABLE IS SET|TABLE RETURNS|TABLE WAITS|table kept|TABLE — the ring|THE AUDIT|EVERYONE\. SIT|seven doors|Choose your door|Walk the path|downgrade|conscript|final choice|The middle road is open|holding|The table is holding|The table will still/i.test(arg) && tableLines.length < 300) tableLines.push({ day: gday(Game), line: String(arg).slice(0, 800) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  if (RECORDER_ON) {
    try { REC.install(Game, inst); } catch (e) { errors.push('recorder-install: ' + String(e.message).slice(0, 80)); }
    try {
      if (LEG === 'winseek') REC2.install(Game, inst, zeroTakeseatStats);
      else REC2.install(Game, inst, DOORWALK.takeseatStats);
    } catch (e) { errors.push('recorder-sitgap-install: ' + String(e.message).slice(0, 80)); }
  }
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

  if (LEG === 'doorwalk') {
    try { RALLY.resetBankkillerStats(); } catch (e) { errors.push('rally-reset: ' + String(e.message).slice(0, 80)); }
    try { STAGED.resetStageallyStats(); } catch (e) { errors.push('stageally-reset: ' + String(e.message).slice(0, 80)); }
    try { DOORWALK.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
    try { DOORWALK.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
    try { DOORWALK.resetTakeseatStats(); } catch (e) { errors.push('takeseat-reset: ' + String(e.message).slice(0, 80)); }
    try { DOORWALK.resetDoorwalkStats(); } catch (e) { errors.push('doorwalk-reset: ' + String(e.message).slice(0, 80)); }
  }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, linkStats = null, feastStats = null, takeStats = null, doorStats = null;
  if (LEG === 'doorwalk') {
    try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
    try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
    try { linkStats = DOORWALK.linkdriveStats(); } catch (e) { errors.push('linkdrive-stats: ' + String(e.message).slice(0, 80)); }
    try { feastStats = DOORWALK.feastdriveStats(); } catch (e) { errors.push('feastdrive-stats: ' + String(e.message).slice(0, 80)); }
    try { takeStats = DOORWALK.takeseatStats(); } catch (e) { errors.push('takeseat-stats: ' + String(e.message).slice(0, 80)); }
    try { doorStats = DOORWALK.doorwalkStats(); } catch (e) { errors.push('doorwalk-stats: ' + String(e.message).slice(0, 80)); }
  }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'prefloor-deaths-b', leg: LEG, run: RUN, policy: (LEG === 'winseek' ? 'winseek' : 'doorwalk') + '-' + RUN, anchorCommit: ANCHOR, instrumentOff: !RECORDER_ON,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, linkdriveStats: linkStats,
    feastdriveStats: feastStats, takeseatStats: LEG === 'winseek' ? zeroTakeseatStats() : takeStats, doorwalkStats: doorStats,
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

// writeFileRetry(file, content): the host write flap (EPERM on plain
// writes, flapping minute to minute — see AGENTS.md EPERM FLAP entries)
// can refuse the corpus write at the very end of a finished sim. The sim
// is deterministic, but re-running it for a write failure is waste; the
// write itself is retried in-process instead: each attempt writes to a
// unique temp name and renames into place, then verifies by reading the
// file back (size + JSON parse). Up to 40 attempts, 15s apart (~10 min).
// A total failure still throws loudly — never a silent partial corpus.
function writeFileRetry(file, content, opts) {
  const o = opts || {};
  const attempts = o.attempts || 40;
  const sleepS = o.sleepS || 15;
  const dir = path.dirname(file);
  let lastErr = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const tmp = file + '.tmp-' + process.pid + '-' + attempt;
    try {
      fs.writeFileSync(tmp, content);
      fs.renameSync(tmp, file);
      const back = fs.readFileSync(file, 'utf8');
      if (back.length !== content.length) throw new Error('read-back length mismatch (' + back.length + ' vs ' + content.length + ')');
      JSON.parse(back);
      return;
    } catch (e) {
      lastErr = e;
      try { fs.unlinkSync(tmp); } catch (e2) {}
      if (attempt < attempts) { try { execSync('sleep ' + sleepS, { stdio: 'ignore' }); } catch (e3) {} }
    }
  }
  throw lastErr;
}

if (require.main === module) {
if (!SEEDS.length) { console.error('PREFLOOR STOP: SEEDS required.'); process.exit(2); }
if (LEG !== 'winseek' && LEG !== 'doorwalk') { console.error('PREFLOOR STOP: LEG must be winseek or doorwalk.'); process.exit(2); }
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'prefloor-deaths-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('PREFLOOR STOP: refusing to overwrite ' + file); process.exit(3); }
}
(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'prefloor-deaths-b-s' + seed + '-' + RUN + '.json');
    writeFileRetry(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const diagDays = daily.filter(function (d) { return !!d.diag; }).length;
    const sitgapDays = daily.filter(function (d) { return !!d.sitgap; }).length;
    const pre90 = (out.fallen || []).filter(function (f) { return f && f.day != null && (f.day | 0) < 90; }).length;
    console.log(JSON.stringify({
      seed: out.seed, leg: out.leg, policy: out.policy, recorder: RECORDER_ON, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      fallen: (out.fallen || []).length, pre90fallen: pre90,
      sitVerbMsgs: out.sitVerbMsgs.length, doorVerbMsgs: out.doorVerbMsgs.length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, diagDays: diagDays, sitgapDays: sitgapDays, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { writeFileRetry: writeFileRetry, zeroTakeseatStats: zeroTakeseatStats, oneRun: oneRun };
