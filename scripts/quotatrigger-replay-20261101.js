#!/usr/bin/env node
// quotatrigger-replay-20261101.js — quota-at-trigger replay for
// sim-quotatrigger-a (Loop A 20261102T0045Z, axis scale-onramp).
// Adapts scripts/musterroster-adopt-replay-20261101.js UNMODIFIED in
// policy stack, recorders, env flags, transcript capture, responder
// verification, and wall fields. The ONLY behavior change: the
// startCombat interceptor sounds the call at the TRUSTED-TIER TRIGGER
// (prereg evidence/2026-11-01/sim-quotatrigger-a-prereg.md) instead of
// at the first refusal, and records the full refusal trajectory.
// Trigger (code, not invented): first REFUSED Herald attempt whose
// same-day muster-diag snapshot shows >= 1 active link and EVERY
// active link with trust >= 70 (titans _coalition trustedAt) AND
// opinion >= 10 (trustedOpinion) — equivalently every quota == 6.
// DIAG ONLY: zero src/js changes. Sounds the call once, at most, per
// seed, then two titanCommitOwn taps, exactly as the musterroster
// replay did — so ready-after-commit is comparable with 2315Z 9/10.
//
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "quota": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the muster3 sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=180 SEEDS=90111 node scripts/quotatrigger-replay-20261101.js > evidence/2026-11-01/perseed-quotatrigger-a/pilot.stdout 2> evidence/2026-11-01/perseed-quotatrigger-a/pilot.stderr
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
  if (process.env[k] !== '1') { console.error(`QUOTA STOP: ${k}=1 is required.`); process.exit(2); }
}
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

const CALL_LINE_RE = /CALL GOES OUT|answers!|REFUSES|no free fighters|volunteers already march/;

function isTrustedLink(l) { return l && (l.trust || 0) >= 70 && (l.opinion || 0) >= 10; }
function triggerMet(snap) {
  if (!snap || !snap.links || !snap.links.length) return false;
  return snap.links.every(isTrustedLink);
}
function compactSnap(snap) {
  return { day: snap.day, callYield: snap.callYield, omenStage: snap.omenStage,
    links: (snap.links || []).map(function (l) { return { villageId: l.villageId, name: l.name, trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota, facesFree: l.facesFree, wouldYield: l.wouldYield, wouldRefuse: l.wouldRefuse }; }),
    allTrusted: triggerMet(snap), activeCount: (snap.links || []).length };
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

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
    commitReturns: [], havenAfter: null, readyAfter: null, interceptorErrors: [],
    triggerSnapCount: null };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      // Stricter than the musterroster replay: require the herald
      // instrument's own record of THIS attempt (pushed by its
      // startCombat wrap before returning here) to be a same-day
      // REFUSED herald attempt, not just a same-day snapshot.
      const hatt = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; });
      const lastAtt = hatt.length ? hatt[hatt.length - 1] : null;
      const refusedHere = lastAtt && lastAtt.day === curDay && lastAtt.cls === 'REFUSED';
      if (!post.sounded && refusedHere && last && last.day === curDay && triggerMet(last)) {
        post.sounded = true;
        post.day = curDay;
        post.triggerSnapCount = snaps.length;
        post.snapshotCallYield = last.callYield;
        post.snapshotLinks = last.links;
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
        console.error('QUOTA sounded seed=' + seed + ' day=' + curDay + ' snapYield=' + post.snapshotCallYield +
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
  const allSnaps = (mstore.refusals || []).map(compactSnap);
  const triggerIdx = post.sounded ? (post.triggerSnapCount - 1) : -1;
  const preTrajectory = post.sounded ? allSnaps.slice(0, post.triggerSnapCount) : allSnaps;
  const firstRefusal = preTrajectory.length ? preTrajectory[0] : null;
  const firstAttempt = att.length ? att[0] : null;
  let triggerUndefinedReason = null;
  if (!post.sounded) {
    if (!att.length) triggerUndefinedReason = 'no-herald-attempt';
    else if (!preTrajectory.length) triggerUndefinedReason = 'no-refusal-snapshot';
    else if (!preTrajectory.some(function (s) { return s.activeCount > 0; })) triggerUndefinedReason = 'no-active-link-at-any-refusal';
    else triggerUndefinedReason = 'trust-never-all-trusted';
  }
  const maxTrustByVillage = {};
  preTrajectory.forEach(function (s) { (s.links || []).forEach(function (l) {
    const k = l.name || l.villageId;
    if (maxTrustByVillage[k] == null || l.trust > maxTrustByVillage[k].trust) maxTrustByVillage[k] = { trust: l.trust, opinion: l.opinion, day: s.day };
  }); });
  const out = { seed, anchorCommit: ANCHOR, post, transcript,
    triggerDefined: !!post.sounded,
    triggerUndefinedReason: triggerUndefinedReason,
    firstContactDay: firstAttempt ? firstAttempt.day : null,
    firstRefusal: firstRefusal,
    refusalTrajectory: preTrajectory,
    refusalCountPre: preTrajectory.length,
    refusalCountTotal: allSnaps.length,
    maxTrustByVillage: maxTrustByVillage,
    foughtBeforeTriggerDays: att.filter(function (a) { return a.cls === 'FOUGHT' && (post.day == null || a.day < post.day); }).map(function (a) { return a.day; }),
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
  if (!SEEDS.length) { console.error('QUOTA STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, quota: r }));
      console.error(`done s${seed}: trigger=${r.triggerDefined} day=${r.post.day} snap=${r.post.snapshotCallYield} actual=${r.post.actualAllies} haven=${r.post.havenAfter} ready=${r.post.readyAfter} refusalsPre=${r.refusalCountPre} firstRef=${r.firstRefusal ? r.firstRefusal.day : null} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
