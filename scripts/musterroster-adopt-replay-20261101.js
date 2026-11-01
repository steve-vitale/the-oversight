#!/usr/bin/env node
// musterroster-adopt-replay-20261101.js — LIVE-SEED ADOPTION replay for the
// muster-roster build (11ea80917). Adapts scripts/muster3-replay-20261101.js:
// same policy stack + recorders, but SEEDS-parameterized, triggers on the
// FIRST refused Herald attempt on any day, and records the adoption evidence
// the fixture could not: pre-call roster presence per link, link count
// before/after, per-village named responders with roster verification, the
// call transcript lines, commit returns, ready-after, fought/refused
// attempts after the call, and the sweep's wall fields.
//
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "adopt": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the muster3 sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   SEEDS=90111,85106 node scripts/musterroster-adopt-replay-20261101.js > evidence/2026-11-01/perseed-musterroster-adopt/pilot.stdout 2> evidence/2026-11-01/perseed-musterroster-adopt/pilot.stderr
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
  if (process.env[k] !== '1') { console.error(`ADOPT STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers (WINPURSUIT=1 + WINDEFER=1)');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive (SEATDRIVE=1)');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder (FULLSEAT=1)');
}

const CALL_LINE_RE = /CALL GOES OUT|answers!|REFUSES|no free fighters|volunteers already march/;

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  // Transcript capture: wrap Game.say OUTSIDE the muster-diag wrap so the
  // final said lines are captured regardless of console suppression.
  const transcript = [];
  try {
    const origSay = Game.say;
    const wrappedSay = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && CALL_LINE_RE.test(arg)) transcript.push(String(arg).slice(0, 500));
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
    Game.say = wrappedSay;
  } catch (e) {}

  const post = { sounded: false, day: null, snapshotCallYield: null, snapshotLinks: null,
    preRoster: null, linkCountBefore: null, linkCountAfter: null,
    actualAllies: null, perVillage: null, respondersVerified: null, responderProblems: [],
    commitReturns: [], havenAfter: null, readyAfter: null, interceptorErrors: [] };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      // Trigger: first REFUSED herald attempt (r === null after an instrumented
      // refusal). The refusal say precedes this return, so the last snapshot
      // is this attempt's snapshot when its day matches the current day.
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      if (!post.sounded && last && last.day === curDay && r === null) {
        post.sounded = true;
        post.day = curDay;
        post.snapshotCallYield = last.callYield;
        post.snapshotLinks = last.links;
        // Pre-call roster presence + link count (pure reads only).
        post.preRoster = {};
        try {
          (last.links || []).forEach(function (l) {
            let ov = null;
            try { ov = Game._otherVillage(l.villageId); } catch (e) {}
            post.preRoster[l.villageId] = { name: l.name, rosterPresent: !!(ov && ov.roster),
              rosterLen: (ov && ov.roster) ? ov.roster.length : null,
              generated: (ov && ov.generated !== undefined) ? ov.generated : null };
          });
        } catch (e) { post.interceptorErrors.push('preRoster: ' + String(e && e.message)); }
        try { post.linkCountBefore = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
        const muster = Game.soundTitanCall('herald');
        const allies = (muster && muster.allies) || [];
        post.actualAllies = allies.length;
        post.perVillage = {};
        allies.forEach(function (a) {
          (post.perVillage[a.villageId] = post.perVillage[a.villageId] || []).push({ vid: a.vid, name: a.name });
        });
        // Verify every responder: named living adult present on its village roster.
        post.respondersVerified = true;
        allies.forEach(function (a) {
          let person = null;
          try { const ov = Game._otherVillage(a.villageId); person = ov && (ov.roster || []).find(function (x) { return x.id === a.vid; }); } catch (e) {}
          if (!person) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' not on roster'); }
          else if (!person.alive) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' dead'); }
          else if (person.age != null && person.age < 18) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' underage'); }
          else if (person.health !== undefined && person.health <= 0) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' unhealthy'); }
          else if (!a.name) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' unnamed'); }
        });
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        post.commitReturns.push(Game.titanCommitOwn('herald'));
        const m2 = (Game.state.titans.musters || {}).herald;
        post.havenAfter = m2 ? (m2.haven || []).length : null;
        try { post.readyAfter = Game.titanMusterReady('herald'); } catch (e) { post.readyAfter = null; }
        try { post.linkCountAfter = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
        console.error('ADOPT sounded seed=' + seed + ' day=' + curDay + ' snapYield=' + post.snapshotCallYield +
          ' actual=' + post.actualAllies + ' haven=' + post.havenAfter + ' ready=' + post.readyAfter +
          ' links=' + post.linkCountBefore + '->' + post.linkCountAfter);
      }
    } catch (e) { post.interceptorErrors.push(String(e && e.message)); }
    return r;
  };

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
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
  const out = { seed, anchorCommit: ANCHOR, post, transcript,
    foughtAfterDays: att.filter(a => a.day >= (post.day || 0) && post.sounded && a.cls === 'FOUGHT').map(a => a.day),
    refusedAfterDays: att.filter(a => a.day >= (post.day || 0) && post.sounded && a.cls === 'REFUSED').map(a => a.day),
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
  if (!SEEDS.length) { console.error('ADOPT STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, adopt: r }));
      console.error(`done s${seed}: sounded=${r.post.sounded} day=${r.post.day} snap=${r.post.snapshotCallYield} actual=${r.post.actualAllies} haven=${r.post.havenAfter} ready=${r.post.readyAfter} foughtAfter=${r.foughtAfterDays.length} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
