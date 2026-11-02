#!/usr/bin/env node
// arrears-route-replay-20261102.js — arrears-route muster-call replay
// for sim-arrears-route-a (Loop A 20261102T0605Z, axis scale-onramp).
// Adapts scripts/sumtrigger-replay-20261101.js UNMODIFIED in policy
// stack, recorders, env flags, transcript capture (extended to the
// deferral/sound/stand-down lines), responder verification, and wall
// fields. Behavior changes, all pre-registered
// (evidence/2026-11-02/sim-arrears-route-a-prereg.md):
//  (1) the startCombat interceptor computes readiness with the
//      DEPLOYED Game.titanCallReadiness('herald') at EVERY refused
//      Herald attempt and applies the arrears-route state machine
//      (scripts/policies/arrears-route.js): an arrears-only block
//      starts a deferral; refusals during a deferral are observations
//      only and never sound (sounding at a mid-week refusal would
//      be the sumtrigger rule, not this arm's);
//  (2) the wrapped daily runs weekly re-check ticks (deferDay + 7 /
//      +14 / +21 / +28) BEFORE the base policy's daily; a tick that
//      finds readiness ready sounds (soundTitanCall + two
//      titanCommitOwn taps, exactly as sumtrigger did); the +28
//      tick, still not ready, stands down without sounding;
//  (3) ARREARS_ROUTE=baseline records the same check rows but never
//      defers, never sounds, never says a deferral line — the in-run
//      control (0445Z lesson: re-run controls in-run, never trust
//      prior corpora across sibling landings);
//  (4) fight outcome + muster casualties recorded for every sounded
//      call, as in sumtrigger.
// DIAG/POLICY ONLY: zero src/js changes. The policy module calls NO
// game mutator; this replay performs the sound, and the game
// function performs the readiness check. titanMonsterPresent is NOT
// exported on Game, so monster presence at a sounding tick is read
// from the sound's own return: null means nothing located (no
// muster created, no refusal penalty) and is recorded as
// ready-but-absent, NEVER counted as sounded. Game.titanStandDown
// is deliberately NEVER called — it dissolves an existing muster
// and a stood-down deferral has none.
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "ar": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the sumtrigger replay, plus ARREARS_ROUTE):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 ARREARS_ROUTE=armed \
//   DAYS=180 SEEDS=97101 node scripts/arrears-route-replay-20261102.js > evidence/2026-11-02/perseed-arrears-route-a/armed.stdout 2> evidence/2026-11-02/perseed-arrears-route-a/armed.stderr
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
const AR = require(path.join(REPO, 'scripts', 'policies', 'arrears-route'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error(`ARREARS STOP: ${k}=1 is required.`); process.exit(2); }
}
const MODE = process.env.ARREARS_ROUTE || 'armed';
if (MODE !== 'armed' && MODE !== 'baseline') { console.error('ARREARS STOP: ARREARS_ROUTE must be armed or baseline.'); process.exit(2); }
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

const CALL_LINE_RE = /CALL GOES OUT|answers!|REFUSES|no free fighters|volunteers already march|waits|stands down|still stands|nothing located/;

function compactSnap(snap) {
  return { day: snap.day, callYield: snap.callYield, omenStage: snap.omenStage,
    links: (snap.links || []).map(function (l) { return { villageId: l.villageId, name: l.name, trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota, facesFree: l.facesFree, wouldYield: l.wouldYield, wouldRefuse: l.wouldRefuse }; }),
    activeCount: (snap.links || []).length };
}

function fmtK(n) { try { return Math.round(n).toLocaleString(); } catch (e) { return String(n); } }

// The sound procedure, shared by every sounding tick: exactly the
// sumtrigger replay's sound block. Returns the muster, or null when
// the call itself refuses to sound (nothing located). Records
// responder verification, Haven commits, and ready-after on post.
function soundCall(Game, post, day, readinessRow) {
  try { post.linkCountBefore = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
  var muster = null;
  try { muster = Game.soundTitanCall('herald'); } catch (e) {
    post.interceptorErrors.push('sound: ' + String((e && e.message) || e).slice(0, 120));
    return null;
  }
  if (!muster) return null;
  var allies = muster.allies || [];
  post.actualAllies = allies.length;
  post.perVillage = {};
  allies.forEach(function (a) {
    (post.perVillage[a.villageId] = post.perVillage[a.villageId] || []).push({ vid: a.vid, name: a.name });
  });
  post.respondersVerified = true;
  allies.forEach(function (a) {
    var person = null;
    try { var ov = Game._otherVillage(a.villageId); person = ov && (ov.roster || []).find(function (x) { return x.id === a.vid; }); } catch (e) {}
    if (!person) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' not on roster'); }
    else if (!person.alive) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' dead'); }
    else if (person.age != null && person.age < 18) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' underage'); }
    else if (person.health !== undefined && person.health <= 0) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' unhealthy'); }
    else if (!a.name) { post.respondersVerified = false; post.responderProblems.push(a.villageId + ':' + a.vid + ' unnamed'); }
  });
  post.commitReturns.push(Game.titanCommitOwn('herald'));
  post.commitReturns.push(Game.titanCommitOwn('herald'));
  var m2 = (Game.state.titans.musters || {}).herald;
  post.havenAfter = m2 ? (m2.haven || []).length : null;
  try { post.havenVids = Game.titanHavenBlades ? Game.titanHavenBlades(m2).map(function (h) { return h.vid; }) : null; } catch (e) { post.havenVids = null; }
  try { post.readyAfter = Game.titanMusterReady('herald'); } catch (e) { post.readyAfter = null; }
  try { post.linkCountAfter = (Game.hierarchyState ? Game.hierarchyState().filter(function (l) { return l && l.status === 'active'; }).length : null); } catch (e) {}
  console.error('ARREARS sounded seed day=' + day + ' tickTotal=' + (readinessRow ? readinessRow.total : null) +
    ' actual=' + post.actualAllies + ' haven=' + post.havenAfter + ' ready=' + post.readyAfter +
    ' links=' + post.linkCountBefore + '->' + post.linkCountAfter);
  return muster;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);
  const ar = AR.newState();

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

  const post = { mode: MODE, sounded: false, day: null, soundTick: null, preSoundReadiness: null,
    deferral: null, stoodDownDay: null, stoodDownReason: null, readyButAbsentDays: [],
    linkCountBefore: null, linkCountAfter: null,
    actualAllies: null, perVillage: null, respondersVerified: null, responderProblems: [],
    commitReturns: [], havenAfter: null, havenVids: null, readyAfter: null, interceptorErrors: [],
    checkTrajectory: [], tickChecks: [], projectionSkipped: 0, projectionSkipReasons: [] };
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
      if (refusedHere) {
        if (!last || last.day !== curDay) {
          post.projectionSkipped++;
          post.projectionSkipReasons.push('day ' + curDay + ': no same-day snapshot');
        } else {
          var readiness = null;
          try {
            if (typeof Game.titanCallReadiness !== 'function') throw new Error('titanCallReadiness missing');
            readiness = Game.titanCallReadiness('herald');
          } catch (e) {
            post.interceptorErrors.push('readiness: ' + String((e && e.message) || e).slice(0, 120));
          }
          if (readiness) {
            var row = { kind: 'refusal', day: curDay, snapIdx: snaps.length - 1,
              links: readiness.links, alliesProj: readiness.alliesProj, havenProj: readiness.havenProj,
              volunteers: readiness.volunteers, total: readiness.total, naiveTotal: readiness.naiveTotal,
              ready: readiness.ready, arrearsOnly: AR.isArrearsOnlyBlock(readiness),
              generatedNow: readiness.generatedNow, errors: readiness.errors };
            post.checkTrajectory.push(row);
            if (MODE === 'armed') {
              var action = AR.observeRefusal(ar, curDay, readiness);
              if (action === 'defer') {
                var bl = AR.firstArrearsLink(readiness);
                post.deferral = { day: curDay, firstCheck: row,
                  fire: bl ? (bl.name || bl.villageId) : null,
                  arrears: bl ? bl.arrears : null };
                try {
                  Game.say('⏳ The call waits. ' + (bl ? (bl.name || 'An allied fire') : 'An allied fire') +
                    ' cannot answer while ' + fmtK(bl ? bl.arrears : 0) +
                    ' kcal of debts unpaid between you — Haven waits, and counts again in a week, rather than sounding into a refusal.');
                } catch (e) {}
              }
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
    daily(Gm, ctx) {
      // Weekly re-check ticks, BEFORE the base policy's daily so a
      // sound lands before that day's actions.
      try {
        if (MODE === 'armed' && ar.status === 'deferring') {
          var curDay = ((Gm.state || {}).scholar || {}).day || 0;
          var tick = AR.dueTick(ar, curDay);
          if (tick) {
            var readiness = null;
            try {
              if (typeof Gm.titanCallReadiness !== 'function') throw new Error('titanCallReadiness missing');
              readiness = Gm.titanCallReadiness('herald');
            } catch (e) {
              post.interceptorErrors.push('tick-readiness: ' + String((e && e.message) || e).slice(0, 120));
            }
            if (readiness) {
              var tickRow = { kind: 'tick', tick: tick, day: curDay,
                links: readiness.links, alliesProj: readiness.alliesProj, havenProj: readiness.havenProj,
                volunteers: readiness.volunteers, total: readiness.total, naiveTotal: readiness.naiveTotal,
                ready: readiness.ready, arrearsOnly: AR.isArrearsOnlyBlock(readiness),
                generatedNow: readiness.generatedNow, errors: readiness.errors };
              post.tickChecks.push(tickRow);
              var bl = AR.firstArrearsLink(readiness);
              if (readiness.ready) {
                var muster = soundCall(Gm, post, curDay, tickRow);
                if (muster) {
                  post.sounded = true;
                  post.day = curDay;
                  post.soundTick = tick;
                  post.preSoundReadiness = tickRow;
                  AR.onTickResult(ar, tick, 'sounded');
                } else {
                  post.readyButAbsentDays.push(curDay);
                  var st1 = AR.onTickResult(ar, tick, 'ready-absent');
                  if (st1 === 'stood-down') {
                    post.stoodDownDay = curDay;
                    post.stoodDownReason = 'ready-but-absent-at-tick-4';
                    try { Gm.say('⏳ The wait is over — four weeks, and the herald no longer stands in the field. The call stands down unsounded.'); } catch (e) {}
                  }
                }
              } else if (tick >= 4) {
                AR.onTickResult(ar, tick, 'not-ready');
                post.stoodDownDay = curDay;
                post.stoodDownReason = 'not-ready-at-tick-4';
                try {
                  Gm.say('⏳ The wait is over — ' + (bl ? (bl.name || 'the allied fire') : 'the allied fire') +
                    '’s debt of ' + fmtK(bl ? bl.arrears : 0) +
                    ' kcal still stands after four weeks, and the call stands down unsounded. No refusal was forced, and no muster was raised.');
                } catch (e) {}
              } else {
                AR.onTickResult(ar, tick, 'not-ready');
                try {
                  Gm.say('⏳ A week passes; ' + (bl ? (bl.name || 'the allied fire') : 'the allied fire') +
                    '’s debt of ' + fmtK(bl ? bl.arrears : 0) + ' kcal still stands. The call waits.');
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) { post.interceptorErrors.push('daily-tick: ' + String((e && e.message) || e).slice(0, 120)); }
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
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
  const firstCheck = post.checkTrajectory.length ? post.checkTrajectory[0] : null;
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
  const out = { seed, anchorCommit: ANCHOR, mode: MODE, post, transcript,
    deferred: !!post.deferral, sounded: !!post.sounded, stoodDown: ar.status === 'stood-down',
    deferDay: post.deferral ? post.deferral.day : null, soundDay: post.day, soundTick: post.soundTick,
    stoodDownDay: post.stoodDownDay, firstCheck: firstCheck,
    firstCheckArrearsOnly: firstCheck ? !!firstCheck.arrearsOnly : null,
    firstCheckReady: firstCheck ? !!firstCheck.ready : null,
    firstCheckTotal: firstCheck ? firstCheck.total : null,
    checkTrajectory: post.checkTrajectory, tickChecks: post.tickChecks,
    refusalTrajectory: allSnaps, refusalCountTotal: allSnaps.length,
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
  if (!SEEDS.length) { console.error('ARREARS STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, ar: r }));
      const fo = r.fightOutcome;
      console.error(`done s${seed} mode=${r.mode}: deferred=${r.deferred} deferDay=${r.deferDay} sounded=${r.sounded} soundDay=${r.soundDay} tick=${r.soundTick} stoodDown=${r.stoodDown} firstCheck arrearsOnly=${r.firstCheckArrearsOnly} total=${r.firstCheckTotal} checks=${r.checkTrajectory.length} ticks=${r.tickChecks.length} foughtSameDay=${fo ? fo.foughtSameDay.join(',') : null} slain=${fo ? fo.heraldSlain : null} nat=${r.national} table=${r.table} won=${r.won} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
