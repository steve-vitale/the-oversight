// doorwalk-feared-b-driver-20261110.js — the feared/witness door driver
// (arm sim-doorwalk-feared-b, run oversight-playtest-loop-2, 2026-11-10,
// Lane B leg 4 endgame). Copy of scripts/doorwalk-b-driver-20261107.js
// with: new names/dirs (evidence/2026-11-10/perseed-doorwalk-feared-b-),
// the armed leg sets DOORWALK_ROTATION=feared-witness, the tableLines
// filter gains "You won"/"both-hands" (doorwalk metric review #5), and
// the door-verb wrap also records the offered options' TEXT
// (offeredFull: id + label + line at call time, read-only) so the
// sense-test can read the beats as the player saw them. Everything
// else — sit recorder, snapshot extensions, stats resets — is the
// doorwalk driver verbatim.
// Usage:
//   DAYS=150 SEEDS=53001..53008 RUN=doorwalk-feared-baseline POLICY=baseline node scripts/doorwalk-feared-b-driver-20261110.js
//   DAYS=150 SEEDS=53001..53008 RUN=doorwalk-feared-armed POLICY=armed node scripts/doorwalk-feared-b-driver-20261110.js
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
const RUN = process.env.RUN || 'doorwalk-feared-baseline';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('DOORWALK-FEARED-B STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'armed') { console.error('DOORWALK-FEARED-B STOP: POLICY must be baseline|armed.'); process.exit(2); }
// The sit-drive gate AND the door-drive gate are env-read live by the
// policies (layerOn). One leg per process, so set them here before any
// sim runs. The baseline leg SITS (TAKESEAT_B=1) but never walks a
// door; the armed leg sits AND walks the feared/witness rotation.
process.env.TAKESEAT_B = '1';
if (POLICY === 'armed') { process.env.DOORWALK_B = '1'; process.env.DOORWALK_ROTATION = 'feared-witness'; }
else { delete process.env.DOORWALK_B; delete process.env.DOORWALK_ROTATION; }
const policy = DOORWALK.doorwalk;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-10', 'perseed-doorwalk-feared-b-' + POLICY);
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'doorwalk-feared-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('DOORWALK-FEARED-B STOP: refusing to overwrite ' + file); process.exit(3); }
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
// offeredFull(Game): the offered options WITH their text (id + label +
// line), read-only — the sense-test reads the beats as the player saw
// them, not just their ids. Capped per option; the verb log caps at
// 200 records per seed in the policy stats, the corpora hold the rest.
function offeredFull(Game) {
  try {
    const tc = ((Game.state || {}).scholar || {}).tableChoices;
    const opts = (tc && tc.options) || [];
    return opts.map(function (o) {
      return { id: String(o.id || ''), label: (o.label != null ? String(o.label) : null), line: (o.line != null ? String(o.line).slice(0, 600) : null) };
    });
  } catch (e) { return []; }
}

async function oneRun(seed) {
  // The door rotation is seeded per seed (the policy reads it live).
  process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'competent-doorwalk-feared-b-' + POLICY, fullTelemetry: false });
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
          if (/TABLE|table is being set|lesser seat|take your seat|ring of pale light|the table has your name|does not come|still be here|TABLE IS SET|TABLE RETURNS|TABLE WAITS|table kept|TABLE — the ring|THE AUDIT|EVERYONE\. SIT|seven doors|Choose your door|Walk the path|downgrade|conscript|final choice|The middle road is open|You won|both-hands/i.test(arg) && tableLines.length < 300) tableLines.push({ day: gday(Game), line: String(arg).slice(0, 800) });
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
      try { snap.tableSnap = snapTable(Game); } catch (e) { snap.tableSnap = null; }
    } catch (e) { errors.push('snapshot-ext: ' + String(e.message).slice(0, 80)); }
    return snap;
  };
  // Door-verb msg wrap OUTSIDE the instrument wrap: records every
  // table verb call with the modal state before/after and the offered
  // option ids at call time (the offered-doors record the takeseat
  // metric review asked for). Returns the original result untouched;
  // never throws into game code. Installed after inst.install;
  // inst.uninstall() restores the pre-instrument originals, which
  // drops this wrap too — records live in doorVerbMsgs.
  ['tableTakeSeat', 'tableOfferSeatTaker', 'tableChooseSeatTaker', 'chooseTableOption'].forEach(function (name) {
    try {
      const inner = Game[name];
      if (typeof inner !== 'function') { errors.push('doorverb-missing-' + name); return; }
      Game[name] = function () {
        const before = snapTable(Game);
        const offered = offeredIds(Game);
        const offeredText = offeredFull(Game);
        let arg = null;
        try { arg = (arguments.length && arguments[0] != null) ? String(arguments[0]) : null; } catch (e) {}
        let ret;
        try { ret = inner.apply(this, arguments); } catch (e) { throw e; }
        try {
          const rec = { day: gday(Game), call: name, arg: arg, ok: !!(ret && ret.ok), msg: (ret && typeof ret.msg === 'string') ? ret.msg.slice(0, 200) : null, before: before, after: snapTable(Game), offered: offered, offeredFull: offeredText };
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
    seed: seed, arm: 'doorwalk-feared-b', run: RUN, policy: 'doorwalk-feared-' + POLICY, anchorCommit: ANCHOR, instrumentOff: false,
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
    const file = path.join(outDir, 'doorwalk-feared-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const seatDays = daily.filter(function (d) { return d.seat && d.seat !== 'none'; });
    const seatSeen = {};
    daily.forEach(function (d) { seatSeen[d.seat || 'none'] = (seatSeen[d.seat || 'none'] | 0) + 1; });
    const ts = out.takeseatStats || {};
    const dw = out.doorwalkStats || {};
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      finalSeat: out.finalSeat ? out.finalSeat.seat : null,
      seatDays: seatSeen, firstSeatDay: seatDays.length ? seatDays[0].day : null,
      previewReadyDays: daily.filter(function (d) { return d.preview && d.preview.ready; }).length,
      previewSeenDays: daily.filter(function (d) { return !!d.preview; }).length,
      sitAttempts: (out.sitAttempts || []).length, sitVerbMsgs: (out.sitVerbMsgs || []).length,
      tsTaken: ts.seatTaken | 0, tsDay: ts.seatDay, tsKind: ts.seatKind, tsDoors: ts.doorsOffered,
      dwEntered: dw.doorsEntered | 0, dwWalked: (dw.walked || []).map(function (w) { return w.path + '@d' + w.day; }),
      dwAnswers: dw.answers | 0, dwSkips: dw.skips || {},
      tableDoneDays: daily.filter(function (d) { return d.tableDone; }).length,
      tableChoicesDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
      tableLines: (out.tableLines || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
