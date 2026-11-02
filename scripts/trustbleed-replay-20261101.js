#!/usr/bin/env node
// trustbleed-replay-20261101.js — DIAG ONLY (zero src/js changes).
// Per-link trust time series from first Herald contact through horizon,
// for the sim-trustbleed-a arm (prereg evidence/2026-11-01/
// sim-trustbleed-a-prereg.md). Adapts scripts/musterroster-adopt-replay-
// 20261101.js: same policy stack + recorders, plus a daily census of
// every hierarchy link (trust/opinion/arrears/status/lastKeptDay/
// mourningUntil/tributePaidWeek/pendingRenegotiation), the day's new
// link.history entries (the game's own attribution channel), and every
// Game.say line mentioning trust (plus muster-call and muster-hunger
// lines). MODE=observe sounds no call; MODE=intervene sounds the call
// at the first refused Herald attempt exactly as the musterroster
// replay did, so the 90111 bleed timeline is reproducible.
// STDOUT-RUNNER PATTERN: prints one JSON line per seed to stdout and
// writes NOTHING itself.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   MODE=observe DAYS=180 SEEDS=90111 node scripts/trustbleed-replay-20261101.js > out.stdout 2> out.stderr
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const HI = require(path.join(REPO, 'scripts', 'herald-instrument-20261030'));
const MD = require(path.join(REPO, 'scripts', 'policies', 'muster-diag'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`TRUSTBLEED STOP: ${k}=1 is required.`); process.exit(2); }
}
const MODE = process.env.MODE || 'observe';
if (MODE !== 'observe' && MODE !== 'intervene') { console.error('TRUSTBLEED STOP: MODE must be observe|intervene.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

const TRUST_LINE_RE = /trust|REFUSES|muster is hungry|answers!|struck .* in the night|turned on the coalition|Tribute .* arrives|tribute .* thin|Nothing comes from|REFUSED|refusals are remembered/i;
const CALL_LINE_RE = /CALL GOES OUT|answers!|REFUSES|no free fighters|volunteers already march/;

function otherIdOf(link) {
  if (!link) return null;
  if (link.subordinate === 'haven') return link.primary;
  if (link.primary === 'haven') return link.subordinate;
  if (link.a === 'haven') return link.b;
  if (link.b === 'haven') return link.a;
  return link.subordinate || link.primary || link.a || link.b || null;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  const trustLines = [];
  const callLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          const day = ((Game.state || {}).scholar || {}).day || 0;
          if (TRUST_LINE_RE.test(arg) && trustLines.length < 4000) trustLines.push({ day, line: String(arg).slice(0, 500) });
          if (CALL_LINE_RE.test(arg) && callLines.length < 500) callLines.push({ day, line: String(arg).slice(0, 500) });
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { t.instrumentErrors.push('say-wrap: ' + String(e && e.message)); }

  // Daily trust census, captured from the policy daily wrapper (after
  // the policy's own daily work, so each row is an end-of-day state).
  const series = [];
  const histSeen = {};
  function snapshotDay() {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      let links = [];
      try { links = Game.hierarchyState ? Game.hierarchyState() : []; } catch (e) { links = []; }
      const rows = (links || []).map(function (l) {
        const oid = otherIdOf(l);
        let ov = null;
        try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(oid) : null; } catch (e) {}
        const hist = Array.isArray(l.history) ? l.history : [];
        const seen = histSeen[l.id] || 0;
        const fresh = hist.slice(seen).map(function (h) { return { day: h.day, kind: h.kind, note: String(h.note || '').slice(0, 300) }; });
        histSeen[l.id] = hist.length;
        let musterAllies = null, musterHaven = null;
        try {
          const m = ((Game.state || {}).titans || {}).musters || {};
          if (m.herald) { musterAllies = (m.herald.allies || []).length; musterHaven = (m.herald.haven || []).length; }
        } catch (e) {}
        return {
          id: l.id, villageId: oid, name: (ov && ov.name) || null, status: l.status || null,
          kind: l.kind || null, trust: (l.trust == null ? null : l.trust),
          opinion: (ov && ov.opinion == null ? null : (ov ? ov.opinion : null)),
          arrears: l.arrears || 0, lastKeptDay: (l.lastKeptDay == null ? null : l.lastKeptDay),
          mourningUntil: (l.mourningUntil == null ? null : l.mourningUntil),
          tributePaidWeek: (l.tributePaidWeek == null ? null : l.tributePaidWeek),
          pendingRenegotiation: !!l.pendingRenegotiation, conquered: !!l.conquered,
          linkDay: (l.day == null ? null : l.day),
          historyNew: fresh, musterAllies, musterHaven,
        };
      });
      series.push({ day, links: rows });
    } catch (e) { t.instrumentErrors.push('snapshotDay: ' + String(e && e.message)); }
  }

  const post = { sounded: false, day: null, snapshotCallYield: null, snapshotLinks: null,
    actualAllies: null, perVillage: null, commitReturns: [], havenAfter: null, readyAfter: null,
    interceptorErrors: [] };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      if (MODE !== 'intervene') return r;
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      if (!post.sounded && last && last.day === curDay && r === null) {
        post.sounded = true;
        post.day = curDay;
        post.snapshotCallYield = last.callYield;
        post.snapshotLinks = last.links;
        const muster = Game.soundTitanCall('herald');
        post.actualAllies = ((muster && muster.allies) || []).length;
        post.perVillage = {};
        ((muster && muster.allies) || []).forEach(function (a) {
          (post.perVillage[a.villageId] = post.perVillage[a.villageId] || []).push({ vid: a.vid, name: a.name });
        });
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        const m2 = (Game.state.titans.musters || {}).herald;
        post.havenAfter = m2 ? (m2.haven || []).length : null;
        try { post.readyAfter = Game.titanMusterReady('herald'); } catch (e) { post.readyAfter = null; }
        console.error('TRUSTBLEED sounded seed=' + seed + ' day=' + curDay + ' actual=' + post.actualAllies);
      }
    } catch (e) { post.interceptorErrors.push(String(e && e.message)); }
    return r;
  };

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) { const r = policy.daily(Gm, ctx); hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); snapshotDay(); return r; },
  });
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let w4Day = null, w5Day = null;
  for (const c of t.census) {
    if ((c.uw | 0) >= 4 && w4Day === null) w4Day = c.day;
    if ((c.uw | 0) >= 5 && w5Day === null) w5Day = c.day;
  }
  let deaths = [];
  try { deaths = ((result.samples || {}).deaths || []).slice(); } catch (e) {}
  const att = (t.attempts || []).filter(a => a.mid === 'herald');
  const out = { seed, mode: MODE, anchorCommit: ANCHOR, post, series, trustLines, callLines,
    heraldAttempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    musterRefusals: mstore.refusals, musterCalls: mstore.callTotals,
    musterErrs: mstore.errs, musterErrors: mstore.errors, instrumentErrors: t.instrumentErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    deaths, hashes };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('TRUSTBLEED STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, trustbleed: r }));
      const att = (r.heraldAttempts || []);
      const ref = att.filter(a => a.cls === 'REFUSED');
      console.error(`done s${seed} mode=${MODE}: attempts=${att.length} refused=${ref.length} firstRefDay=${ref.length ? ref[0].day : 'none'} sounded=${r.post.sounded} seriesDays=${r.series.length} nat=${r.national} table=${r.table} won=${r.won} maxWave=${r.maxWave} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
