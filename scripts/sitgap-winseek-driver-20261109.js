// sitgap-winseek-driver-20261109.js — the SIT GAP WINSEEK DIAG driver
// (arm sim-sitgap-winseek-b, run fleshout-loop-b-20261109T0330Z). DIAG, zero src/js.
// The sitgap-driver pattern (scripts/sitgap-driver-20261108.js) with the
// policy leg swapped to winseek (scripts/policies/winseek.js): the policy
// that reaches the table and never sits (sim-flipsocial-b §
// reached-but-never-sat: row.table 7/8 → 5/8, entered 0/8 on both endpoints).
// Frozen band 53001–53008, 150d death-aware, current master. Winseek runs
// at default env (no POINTER_GATED, WINSEEK_R8 default on) — the same
// defaults the flipsocial panel used.
//
// WINSEEK HAS NO SIT DRIVE (verified from code before the prereg — see
// evidence/2026-11-08/sim-sitgap-winseek-b-prereg.md): winseek extends base
// competent (never linkfeast), competent never calls tableTakeSeat, and
// winseek's tableRoad only answers pending tableChoices prompts, which can
// never exist pre-sit. The sitgap recorder is therefore fed a ZERO-STATS
// STUB (pure function, fresh zero object, no game-state read, no RNG draw):
// sitgap.tsSkips is {} and tsAttempts/tsTaken are 0 on every row BY
// CONSTRUCTION. The classification is carried by the sitstep snapshot
// fields (preview.ready window, scholarAtHaven, entryBlock, preview.why),
// not by skip reasons that never fire. If any tableTakeSeat call is ever
// recorded (sitAttempts / doorVerbMsgs), that contradicts the code
// verification and must be reported loudly, never smoothed.
// DIAG_RECORDER=0 runs the identical driver WITHOUT either recorder (the
// G2 neutrality control).
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=winseek POLICY=winseek OUTDIR=evidence/2026-11-08/perseed-sitgap-winseek-b node scripts/sitgap-winseek-driver-20261109.js
//   DIAG_RECORDER=0 OUTDIR=/tmp/sitgap-winseek-unrec node scripts/sitgap-winseek-driver-20261109.js  (G2 control)
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const WINSEEK = require(path.join(REPO, 'scripts', 'policies', 'winseek'));
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
const POLICY = process.env.POLICY || 'winseek';
const RECORDER_ON = process.env.DIAG_RECORDER !== '0';
if (!SEEDS.length) { console.error('SITGAP-WINSEEK STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'winseek') { console.error('SITGAP-WINSEEK STOP: POLICY must be winseek.'); process.exit(2); }
// Winseek has no TAKESEAT_B / DOORWALK_B gates; make sure no stale gate
// env leaks in from a sibling driver invocation in the same shell.
delete process.env.TAKESEAT_B;
delete process.env.DOORWALK_B;
const policy = WINSEEK.winseek;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

// ZERO-STATS STUB (see header): winseek has no takeSeatDrive and no
// takeseatStats. The recorder requires a function, so it gets a pure one
// returning a fresh zero object. Any non-zero value here would be a lie.
function zeroTakeseatStats() {
  return { skips: {}, seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, events: [] };
}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-08', 'perseed-sitgap-winseek-b');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'sitgap-winseek-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('SITGAP-WINSEEK STOP: refusing to overwrite ' + file); process.exit(3); }
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
  const { Game } = await loadGame({ seed: seed, mode: 'winseek-' + POLICY, fullTelemetry: false });
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
    try { REC2.install(Game, inst, zeroTakeseatStats); } catch (e) { errors.push('recorder-sitgap-install: ' + String(e.message).slice(0, 80)); }
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

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'sitgap-winseek-b', run: RUN, policy: 'winseek-' + POLICY, anchorCommit: ANCHOR, instrumentOff: !RECORDER_ON,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: null, stageallyStats: null, linkdriveStats: null,
    feastdriveStats: null, takeseatStats: zeroTakeseatStats(), doorwalkStats: null,
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
    const file = path.join(outDir, 'sitgap-winseek-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const diagDays = daily.filter(function (d) { return !!d.diag; }).length;
    const sitgapDays = daily.filter(function (d) { return !!d.sitgap; }).length;
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, recorder: RECORDER_ON, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      sitAttempts: (out.sitAttempts || []).length, sitVerbMsgs: out.sitVerbMsgs.length, doorVerbMsgs: out.doorVerbMsgs.length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, diagDays: diagDays, sitgapDays: sitgapDays, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
