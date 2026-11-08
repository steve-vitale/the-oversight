// darkwit-b-driver-20261107.js — the dark-branch witness driver
// (arm sim-darkwit-b, run fleshout-loop-b-20261108T0245Z). Replays
// the NEW darkwit wrapper policy
// (scripts/policies/competent-darkwit-b.js — ledger-dark road under
// the witness-first door drive) on pilot band 53201–53208 / confirm
// band 53201–53212 (JUDGED comparison band reuse, see prereg;
// fallback fresh band 53701–53712 if the pilot baseline fails
// substrate sanity) with the sit recorder
// (scripts/sitstep-instrument-20261107.js, reused VERBATIM via
// require) plus driver-side door-verb recording (the
// doorwalk-b-driver pattern — no instrument edit), ledger-vector
// recording on every daily row, and a tablePrompt wrap capturing
// the beat framing lines (the #1888 instrument: beat.say text
// renders into the modal prompt, never through Game.say).
// Death-aware horizon (runDays ends on village death / win).
// Seeds run sequentially in one process via the shared harness
// (loadGame per seed). Per-seed JSON goes to
// evidence/2026-11-07/perseed-darkwit-b-<leg>/, or $OUTDIR when
// set (proof legs use /tmp). Refuses to overwrite. The baseline
// leg walks witness LIGHT (WITNESSDOOR_B=1, LEDGERDARK unset);
// the armed leg adds the dark-ledger road (LEDGERDARK=1).
// Usage:
//   DAYS=150 SEEDS=53201..53208 RUN=darkwit-pilot-baseline POLICY=baseline node scripts/darkwit-b-driver-20261107.js
//   DAYS=150 SEEDS=53201..53208 RUN=darkwit-pilot-armed POLICY=armed node scripts/darkwit-b-driver-20261107.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const STAGED = require(path.join(REPO, 'scripts', 'policies', 'competent-stageally-a'));
const RALLY = require(path.join(REPO, 'scripts', 'policies', 'competent-rally-bankkiller-b'));
const DW = require(path.join(REPO, 'scripts', 'policies', 'competent-darkwit-b'));
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
const RUN = process.env.RUN || 'darkwit-baseline';
const POLICY = process.env.POLICY || 'baseline';
if (!SEEDS.length) { console.error('DARKWIT-B STOP: SEEDS required.'); process.exit(2); }
if (POLICY !== 'baseline' && POLICY !== 'armed') { console.error('DARKWIT-B STOP: POLICY must be baseline|armed.'); process.exit(2); }
// The sit-drive gate, the door-drive gate, and the witness-drive gate
// are env-read live by the policies (layerOn). The road gate
// (LEDGERDARK) is env-read live by ledgerdark. One leg per process,
// so set them here before any sim runs. The baseline leg SITS and
// walks witness LIGHT (WITNESSDOOR_B=1, LEDGERDARK unset); the
// armed leg adds the dark-ledger road (LEDGERDARK=1).
process.env.TAKESEAT_B = '1';
process.env.DOORWALK_B = '1';
process.env.WITNESSDOOR_B = '1';
if (POLICY === 'armed') process.env.LEDGERDARK = '1';
else delete process.env.LEDGERDARK;
const policy = DW.darkwit;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = process.env.OUTDIR || path.join(REPO, 'evidence', '2026-11-07', 'perseed-darkwit-b-' + POLICY);
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'darkwit-b-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('DARKWIT-B STOP: refusing to overwrite ' + file); process.exit(3); }
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
// ledgerSnap(Game): the moral-ledger vector + the witness branch
// margin, pure reads (tableBranch is a pure read of ledger /
// promise tally / switchboard tally). Recorded on every daily row
// so the analyzer can reconstruct the branch at sit time exactly.
function ledgerSnap(Game) {
  const s = {};
  try {
    const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
    s.killed = (L.killed | 0); s.protected = (L.protected | 0);
    s.betrayed = (L.betrayed | 0);
    s.foodShared = (L.foodShared | 0); s.foodHoarded = (L.foodHoarded | 0);
    s.showmanship = (L.showmanship | 0); s.might = (L.might | 0);
    s.exposed = (L.exposed | 0);
  } catch (e) {}
  try {
    const b = (typeof Game.tableBranch === 'function') ? Game.tableBranch('witness') : null;
    if (b) s.witnessBranch = { branch: b.branch, dark: b.dark | 0, light: b.light | 0, notes: (b.notes || []).slice() };
  } catch (e) {}
  return s;
}
function offeredIds(Game) {
  try {
    const tc = ((Game.state || {}).scholar || {}).tableChoices;
    return (tc && tc.options) ? tc.options.map(function (o) { return String(o.id); }) : [];
  } catch (e) { return []; }
}
function stripHtml(html) {
  try {
    return String(html || '').replace(/<[^>]+>/g, '\n').replace(/[ \t]+/g, ' ')
      .split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; }).join('\n');
  } catch (e) { return ''; }
}

async function oneRun(seed) {
  // The door rotation is seeded per seed (the policy reads it live).
  process.env.DOORWALK_SEED = String(seed);
  const { Game } = await loadGame({ seed: seed, mode: 'competent-darkwit-b-' + POLICY, fullTelemetry: false });
  const deathSays = [];
  const tableLines = [];
  const tablePrompts = [];
  let sayCount = 0;
  const errors = [];
  const sitVerbMsgs = [];
  const doorVerbMsgs = [];
  let capturedCtx = null;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (/dead|died|didn't come back|grave|buried|screams|starts digging|slain|is dead|veteran/i.test(arg) && deathSays.length < 400) deathSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          // #1888 EXTENSION (witnessdoor's filter missed the beat
          // choice lines): the cold/let/cross/subpoena/silence/
          // blood/disappoint choice say lines are added, so the
          // transcript is complete; the witness lines (the trial
          // open, the convict-mid-trial failure, the finals)
          // stay. Beat FRAMING lines never pass through say —
          // they are captured by the tablePrompt wrap below.
          if (/TABLE|table is being set|lesser seat|take your seat|ring of pale light|the table has your name|does not come|still be here|TABLE IS SET|TABLE RETURNS|TABLE WAITS|table kept|TABLE — the ring|THE AUDIT|EVERYONE\. SIT|seven doors|Choose your door|Walk the path|downgrade|conscript|final choice|The middle road is open|You won|both-hands|the trial of the judges|the dock has a second chair|Your own record convicted you|Read the charges|Offer them a way back|the list is complete|the galaxy's court|read them cold|no heat, no adjectives|let them speak|prosecutor who doesn|Cross-examine your own|call the one you chose|Move to silence|Give them what they chant|Disappoint trillions|measured verdict|the chant dies|the gavel is heavy/i.test(arg) && tableLines.length < 400) tableLines.push({ day: gday(Game), line: String(arg).slice(0, 800) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  // tablePrompt wrap (#1888 instrument): the beat framing lines
  // (opening charges, defense framing, witness testimony) render
  // into the modal prompt and never reach Game.say. Record the
  // prompt text + options at every call, with the table state at
  // call time. Installed BEFORE setupGame; restored manually
  // after runDays (the sit instrument does not wrap tablePrompt).
  let origTablePrompt = null;
  try {
    if (typeof Game.tablePrompt === 'function') {
      origTablePrompt = Game.tablePrompt;
      Game.tablePrompt = function (promptHtml, options, frame) {
        try {
          const text = stripHtml(promptHtml);
          if (tablePrompts.length < 60) {
            tablePrompts.push({ day: gday(Game), frame: frame || null,
              table: snapTable(Game),
              options: (options || []).map(function (o) { return String(o.id); }),
              text: text.slice(0, 4000) });
          }
        } catch (e) { errors.push('prompt-wrap: ' + String(e.message).slice(0, 80)); }
        return origTablePrompt.apply(this, arguments);
      };
    } else { errors.push('tablePrompt-missing'); }
  } catch (e) { errors.push('prompt-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  // Driver-side snapshot extensions (read-only): scholar availability
  // on every daily row — the sit chain's "scholar absent?" link —
  // plus the ledger vector + witness branch margin.
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.scholarAtHaven = scholarAtHaven(Game);
      snap.scholarAlive = scholarAlive(Game);
      try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
      try { snap.tableSnap = snapTable(Game); } catch (e) { snap.tableSnap = null; }
      try { snap.ledger = ledgerSnap(Game); } catch (e) { snap.ledger = null; }
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
      try { if (ctx) capturedCtx = ctx; } catch (e) {}
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
  try { DW.resetLinkdriveStats(); } catch (e) { errors.push('linkdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DW.resetFeastdriveStats(); } catch (e) { errors.push('feastdrive-reset: ' + String(e.message).slice(0, 80)); }
  try { DW.resetTakeseatStats(); } catch (e) { errors.push('takeseat-reset: ' + String(e.message).slice(0, 80)); }
  try { DW.resetDoorwalkStats(); } catch (e) { errors.push('doorwalk-reset: ' + String(e.message).slice(0, 80)); }
  try { DW.resetWitnessdoorStats(); } catch (e) { errors.push('witnessdoor-reset: ' + String(e.message).slice(0, 80)); }
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  let fin = null;
  try { fin = inst.finalize(); } catch (e) { errors.push('finalize: ' + String(e.message).slice(0, 80)); }
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  try { if (origTablePrompt) Game.tablePrompt = origTablePrompt; } catch (e) { errors.push('prompt-restore: ' + String(e.message).slice(0, 80)); }
  let rallyStats = null, stageStats = null, linkStats = null, feastStats = null, takeStats = null, doorStats = null, witStats = null;
  try { rallyStats = RALLY.bankkillerStats(); } catch (e) { errors.push('rally-stats: ' + String(e.message).slice(0, 80)); }
  try { stageStats = STAGED.stageallyStats(); } catch (e) { errors.push('stageally-stats: ' + String(e.message).slice(0, 80)); }
  try { linkStats = DW.linkdriveStats(); } catch (e) { errors.push('linkdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { feastStats = DW.feastdriveStats(); } catch (e) { errors.push('feastdrive-stats: ' + String(e.message).slice(0, 80)); }
  try { takeStats = DW.takeseatStats(); } catch (e) { errors.push('takeseat-stats: ' + String(e.message).slice(0, 80)); }
  try { doorStats = DW.doorwalkStats(); } catch (e) { errors.push('doorwalk-stats: ' + String(e.message).slice(0, 80)); }
  try { witStats = DW.witnessdoorStats(); } catch (e) { errors.push('witnessdoor-stats: ' + String(e.message).slice(0, 80)); }
  let ledgerDarkStats = null;
  try { ledgerDarkStats = (capturedCtx && capturedCtx._ledgerdark) ? JSON.parse(JSON.stringify(capturedCtx._ledgerdark)) : null; } catch (e) { errors.push('ledgerdark-stats: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  const out = {
    seed: seed, arm: 'darkwit-b', run: RUN, policy: 'darkwit-' + POLICY, anchorCommit: ANCHOR, instrumentOff: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: fin ? fin.scaleRank : null,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: fin ? fin.unlockedWave : null, standing: fin ? fin.standing : null,
    readiness5: fin ? fin.readiness5 : null,
    fights: t.fights, daily: t.daily, killsLive: t.killsLive, scholarDeaths: t.scholarDeaths, killerTrack: t.killerTrack,
    rallyCalls: t.rallyCalls || [], tbFights: t.tbFights || [],
    bankkillerStats: rallyStats, stageallyStats: stageStats, linkdriveStats: linkStats,
    feastdriveStats: feastStats, takeseatStats: takeStats, doorwalkStats: doorStats, witnessdoorStats: witStats,
    ledgerDarkStats: ledgerDarkStats,
    sitAttempts: t.sitAttempts || [], sitVerbMsgs: sitVerbMsgs, doorVerbMsgs: doorVerbMsgs,
    deathSays: deathSays, tableLines: tableLines, tablePrompts: tablePrompts, sayCount: sayCount,
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
    const file = path.join(outDir, 'darkwit-b-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    const daily = out.daily || [];
    const seatDays = daily.filter(function (d) { return d.seat && d.seat !== 'none'; });
    const seatSeen = {};
    daily.forEach(function (d) { seatSeen[d.seat || 'none'] = (seatSeen[d.seat || 'none'] | 0) + 1; });
    const ts = out.takeseatStats || {};
    const dw = out.doorwalkStats || {};
    const wd = out.witnessdoorStats || {};
    const ld = out.ledgerDarkStats || {};
    const lastLedger = daily.length ? (daily[daily.length - 1].ledger || {}) : {};
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
      wdEntered: wd.doorsEntered | 0, wdWalked: (wd.walked || []).map(function (w) { return w.path + '@d' + w.day + '/' + (w.branch || '?'); }),
      wdAnswers: wd.answers | 0, wdSkips: wd.skips || {},
      ldActive: !!ld.active, ldBegs: ld.begsRefused | 0, ldHoard: ld.hoardTakes | 0, ldHoardKcal: ld.hoardTakeKcal | 0,
      ldRecruit: ld.recruitDone | 0, ldBetrayal: ld.betrayalDone | 0, ldBetrayalDay: ld.betrayalDay,
      ledgerEnd: { killed: lastLedger.killed, protected: lastLedger.protected, betrayed: lastLedger.betrayed, shared: lastLedger.foodShared, hoarded: lastLedger.foodHoarded, exposed: lastLedger.exposed, witnessBranch: lastLedger.witnessBranch ? lastLedger.witnessBranch.branch + ' ' + lastLedger.witnessBranch.dark + 'v' + lastLedger.witnessBranch.light : null },
      tableDoneDays: daily.filter(function (d) { return d.tableDone; }).length,
      tableChoicesDays: daily.filter(function (d) { return d.tableChoicesSurfaced; }).length,
      tableLines: (out.tableLines || []).length, tablePrompts: (out.tablePrompts || []).length,
      w4kills: (out.waveKillLog || []).filter(function (e2) { return ((e2.w | 0) >= 4); }).length,
      snapshots: daily.length, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
