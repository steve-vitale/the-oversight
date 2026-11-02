#!/usr/bin/env node
// sumtrigger-replay-20261101.js — sum-trigger muster-call replay for
// sim-sumtrigger-a (Loop A 20261102T0250Z, axis scale-onramp).
// Adapts scripts/quotatrigger-replay-20261101.js UNMODIFIED in
// policy stack, recorders, env flags, transcript capture, responder
// verification, and wall fields. Behavior changes, all pre-registered
// (evidence/2026-11-02/sim-sumtrigger-a-prereg.md):
//  (1) the startCombat interceptor projects with
//      scripts/policies/sumtrigger.js at EVERY refused Herald attempt
//      and sounds ONLY at the first ready refusal (faithful
//      projection >= need 10), at most once per seed, then two
//      titanCommitOwn taps exactly as the quotatrigger replay did;
//  (2) one projection row per qualifying refusal (day, per-link
//      trust/opinion/arrears/quota/freeAdults/contribution, naive
//      sum, faithful sum, HavenProj, ready flag, generatedNow);
//  (3) fight outcome + muster casualties recorded at run end for
//      every sounded call (same-day FOUGHT attempt, herald slain
//      flag, outcomes records, per-responder fate, Haven fate).
// DIAG/POLICY ONLY: zero src/js changes.
//
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "sum": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the quotatrigger replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=180 SEEDS=90111 node scripts/sumtrigger-replay-20261101.js > evidence/2026-11-02/perseed-sumtrigger-a/pilot.stdout 2> evidence/2026-11-02/perseed-sumtrigger-a/pilot.stderr
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
const ST = require(path.join(REPO, 'scripts', 'policies', 'sumtrigger'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`SUM STOP: ${k}=1 is required.`); process.exit(2); }
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

function compactSnap(snap) {
  return { day: snap.day, callYield: snap.callYield, omenStage: snap.omenStage,
    links: (snap.links || []).map(function (l) { return { villageId: l.villageId, name: l.name, trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota, facesFree: l.facesFree, wouldYield: l.wouldYield, wouldRefuse: l.wouldRefuse }; }),
    activeCount: (snap.links || []).length };
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
    commitReturns: [], havenAfter: null, havenVids: null, readyAfter: null, interceptorErrors: [],
    triggerSnapCount: null, projectionTrajectory: [], projectionSkipped: 0, projectionSkipReasons: [],
    projectedAllies: null, projectedHaven: null, projectedTotal: null, naiveTotalAtTrigger: null,
    triggerProjection: null };
  const origSC = Game.startCombat;
  Game.startCombat = function () {
    const r = origSC.apply(this, arguments);
    try {
      const snaps = mstore.refusals;
      const last = snaps.length ? snaps[snaps.length - 1] : null;
      const curDay = ((Game.state || {}).scholar || {}).day || 0;
      const hatt = (t.attempts || []).filter(function (a) { return a.mid === 'herald'; });
      const lastAtt = hatt.length ? hatt[hatt.length - 1] : null;
      const refusedHere = lastAtt && lastAtt.day === curDay && lastAtt.cls === 'REFUSED';
      if (!post.sounded && refusedHere) {
        if (!last || last.day !== curDay) {
          post.projectionSkipped++;
          post.projectionSkipReasons.push('day ' + curDay + ': no same-day snapshot');
        } else {
          // Project BEFORE sounding: this is the decision moment.
          // Generation inside the projection is the call's own
          // generator (see sumtrigger.js); the sound below reuses
          // the generated rosters, so projected == sounded.
          let proj = null;
          try { proj = ST.projectMusterCall(Game); } catch (e) {
            post.interceptorErrors.push('project: ' + String((e && e.message) || e).slice(0, 120));
          }
          if (proj) {
            const row = { day: curDay, snapIdx: snaps.length - 1, snapshotCallYield: last.callYield,
              links: proj.links, alliesProj: proj.alliesProj, havenProj: proj.havenProj,
              volunteers: proj.volunteers, total: proj.total, naiveTotal: proj.naiveTotal,
              ready: proj.ready, generatedNow: proj.generatedNow, errors: proj.errors };
            post.projectionTrajectory.push(row);
            if (proj.ready) {
              post.sounded = true;
              post.day = curDay;
              post.triggerSnapCount = snaps.length;
              post.triggerProjection = row;
              post.projectedAllies = proj.alliesProj;
              post.projectedHaven = proj.havenProj;
              post.projectedTotal = proj.total;
              post.naiveTotalAtTrigger = proj.naiveTotal;
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
              try { post.havenVids = Game.titanHavenBlades ? Game.titanHavenBlades(m2).map(function (h) { return h.vid; }) : null; } catch (e) { post.havenVids = null; }
              try { post.readyAfter = Game.titanMusterReady('herald'); } catch (e) { post.readyAfter = null; }
              try { post.linkCountAfter = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
              console.error('SUM sounded seed=' + seed + ' day=' + curDay + ' projAllies=' + post.projectedAllies +
                ' projHaven=' + post.projectedHaven + ' projTotal=' + post.projectedTotal + ' naive=' + post.naiveTotalAtTrigger +
                ' snapYield=' + post.snapshotCallYield +
                ' actual=' + post.actualAllies + ' haven=' + post.havenAfter + ' ready=' + post.readyAfter +
                ' links=' + post.linkCountBefore + '->' + post.linkCountAfter);
            }
          }
        }
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
    else triggerUndefinedReason = 'sum-never-ready';
  }
  const maxTrustByVillage = {};
  preTrajectory.forEach(function (s) { (s.links || []).forEach(function (l) {
    const k = l.name || l.villageId;
    if (maxTrustByVillage[k] == null || l.trust > maxTrustByVillage[k].trust) maxTrustByVillage[k] = { trust: l.trust, opinion: l.opinion, day: s.day };
  }); });
  // Fight outcome + muster casualties (new vs quotatrigger).
  let fightOutcome = null;
  if (post.sounded) {
    const foughtSameDay = att.filter(function (a) { return a.cls === 'FOUGHT' && a.day === post.day; }).map(function (a) { return a.day; });
    const foughtAfterDays = att.filter(function (a) { return a.cls === 'FOUGHT' && a.day > post.day; }).map(function (a) { return a.day; });
    const refusedAfterDays = att.filter(function (a) { return a.cls === 'REFUSED' && a.day > post.day; }).map(function (a) { return a.day; });
    let heraldSlain = false;
    try { heraldSlain = !!((st.titans || {}).slain || {}).herald; } catch (e) {}
    let outcomeRecords = [];
    try { outcomeRecords = (((st.titans || {}).outcomes || []).filter(function (r) { return r && r.titan === 'herald'; })).map(function (r) { return { day: r.day, outcome: r.outcome, endDay: r.endDay || null, result: r.result || null }; }); } catch (e) {}
    let tbHerald = [];
    try { tbHerald = Object.keys(t.tbOutcomes || {}).map(function (k) { return t.tbOutcomes[k]; }).filter(function (o) { return o && o.mid === 'herald'; }).map(function (o) { return { day: o.day, result: o.result }; }); } catch (e) {}
    const responderFates = [];
    try {
      Object.keys(post.perVillage || {}).forEach(function (vid) {
        (post.perVillage[vid] || []).forEach(function (a) {
          let fate = 'roster-missing', person = null;
          try {
            const ov = Game._otherVillage(vid);
            if (ov && ov.roster) {
              person = (ov.roster || []).find(function (x) { return x.id === a.vid; });
              if (!person) fate = 'missing';
              else if (!person.alive) fate = 'dead';
              else if (person.health !== undefined && person.health <= 0) fate = 'unhealthy';
              else fate = 'alive';
            }
          } catch (e) { fate = 'lookup-error'; }
          responderFates.push({ villageId: vid, vid: a.vid, name: a.name, fate: fate });
        });
      });
    } catch (e) {}
    const havenFates = [];
    try {
      const hroster = ((st.village || {}).roster || []);
      const rchars = ((st.village || {}).rosterChars || {});
      (post.havenVids || []).forEach(function (vid) {
        let fate = 'off-roster';
        if (hroster.indexOf(vid) >= 0) {
          const rc = rchars[vid];
          fate = (rc && rc.dead) ? 'on-roster-dead' : 'on-roster-alive';
        }
        havenFates.push({ vid: vid, fate: fate });
      });
    } catch (e) {}
    let musterAlliesEnd = null, musterExistsEnd = false, readyEnd = null;
    try {
      const mEnd = ((st.titans || {}).musters || {}).herald;
      musterExistsEnd = !!mEnd;
      musterAlliesEnd = mEnd ? (mEnd.allies || []).length : null;
    } catch (e) {}
    try { readyEnd = Game.titanMusterReady('herald'); } catch (e) { readyEnd = null; }
    fightOutcome = { foughtSameDay: foughtSameDay, foughtAfterDays: foughtAfterDays, refusedAfterDays: refusedAfterDays,
      heraldSlain: heraldSlain, outcomeRecords: outcomeRecords, tbHerald: tbHerald,
      responderFates: responderFates, havenFates: havenFates,
      musterAlliesEnd: musterAlliesEnd, musterExistsEnd: musterExistsEnd, readyEnd: readyEnd };
  }
  const maxFaithful = (post.projectionTrajectory || []).reduce(function (acc, row) {
    return (row.total != null && (acc.total == null || row.total > acc.total)) ? { total: row.total, day: row.day } : acc;
  }, { total: null, day: null });
  const firstReadyRow = (post.projectionTrajectory || []).filter(function (row) { return row.ready; })[0] || null;
  const out = { seed, anchorCommit: ANCHOR, post, transcript,
    triggerDefined: !!post.sounded,
    triggerUndefinedReason: triggerUndefinedReason,
    firstContactDay: firstAttempt ? firstAttempt.day : null,
    firstRefusal: firstRefusal,
    refusalTrajectory: preTrajectory,
    refusalCountPre: preTrajectory.length,
    refusalCountTotal: allSnaps.length,
    projectionTrajectory: post.projectionTrajectory,
    projectionCount: post.projectionTrajectory.length,
    firstProjection: post.projectionTrajectory.length ? post.projectionTrajectory[0] : null,
    firstReadyRow: firstReadyRow,
    maxFaithfulTotal: maxFaithful.total, maxFaithfulDay: maxFaithful.day,
    maxTrustByVillage: maxTrustByVillage,
    foughtBeforeTriggerDays: att.filter(function (a) { return a.cls === 'FOUGHT' && (post.day == null || a.day < post.day); }).map(function (a) { return a.day; }),
    foughtAfterDays: att.filter(a => a.day >= (post.day || 0) && post.sounded && a.cls === 'FOUGHT').map(a => a.day),
    refusedAfterDays: att.filter(a => a.day >= (post.day || 0) && post.sounded && a.cls === 'REFUSED').map(a => a.day),
    heraldAttempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    fightOutcome: fightOutcome,
    musterRefusals: mstore.refusals, musterCalls: mstore.callTotals,
    musterErrs: mstore.errs, musterErrors: mstore.errors, instrumentErrors: t.instrumentErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    deaths, hashes };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('SUM STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, sum: r }));
      const fo = r.fightOutcome;
      console.error(`done s${seed}: trigger=${r.triggerDefined} day=${r.post.day} proj=${r.post.projectedAllies}+${r.post.projectedHaven}=${r.post.projectedTotal} naive=${r.post.naiveTotalAtTrigger} actual=${r.post.actualAllies} haven=${r.post.havenAfter} ready=${r.post.readyAfter} projRows=${r.projectionCount} firstProj=${r.firstProjection ? (r.firstProjection.alliesProj + '+' + r.firstProjection.havenProj + '=' + r.firstProjection.total) : null} foughtSameDay=${fo ? fo.foughtSameDay.join(',') : null} slain=${fo ? fo.heraldSlain : null} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
