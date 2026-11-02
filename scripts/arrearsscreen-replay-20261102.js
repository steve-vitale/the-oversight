#!/usr/bin/env node
// arrearsscreen-replay-20261102.js — screened arrears band recorder for
// sim-arrearsscreen-a (Loop A 20261102T0725Z, axis scale-onramp).
// Adapts scripts/sumtrigger-replay-20261101.js UNMODIFIED in policy
// stack, recorders, env flags, and wall fields. Behavior changes,
// all pre-registered (evidence/2026-11-02/sim-arrearsscreen-a-prereg.md):
//  (1) the startCombat interceptor computes the DEPLOYED
//      Game.titanCallReadiness('herald') at EVERY refused Herald
//      attempt (same-day muster-diag snapshot required) and records
//      one check row — it NEVER sounds a call, never commits, never
//      stands down, so no refusal penalty ever perturbs the timeline;
//  (2) a daily census (read-only link fields, arrears-trace pattern)
//      backs the waiting observation leg for blocked seeds;
//  (3) transcript capture is anchored to arrears/tribute/debt
//      vocabulary (the route arm's bare /waits/ flaw is not repeated).
// POLICY/INSTRUMENT ONLY: zero src/js changes.
//
// STDOUT-RUNNER PATTERN: prints one JSON line per seed
// (`{"seed": N, "screen": {...}}`) to stdout and writes NOTHING itself.
// Usage (same env as the sumtrigger replay):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 MUSTER=1 \
//   DAYS=180 SEEDS=97301 node scripts/arrearsscreen-replay-20261102.js > evidence/2026-11-02/perseed-arrearsscreen-a/sweep.stdout 2> evidence/2026-11-02/perseed-arrearsscreen-a/sweep.stderr
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
const CLS = require(path.join(REPO, 'scripts', 'arrearsscreen-classify-20261102'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD', 'MUSTER']) {
  if (process.env[k] !== '1') { console.error('SCREEN STOP: ' + k + '=1 is required.'); process.exit(2); }
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

const SAY_RE = /arrears|tribute|waiv|debts|old books|REFUSES|books burn/i;

function linkRow(Game, link, day) {
  let other = null;
  try { other = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { other = null; }
  let ov = null;
  try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(other) : null; } catch (e) { ov = null; }
  const isPeer = (link.kind === 'covenant' || link.kind === 'trade');
  let direction = null;
  if (isPeer) { direction = 'peer:' + link.kind; }
  else if (link.primary === 'haven') { direction = 'Haven-primary'; }
  else if (link.subordinate === 'haven') { direction = 'Haven-subordinate'; }
  else { direction = 'other'; }
  return { villageId: other, name: (ov && ov.name) || null, direction: direction, kind: link.kind || 'tribute',
    trust: link.trust || 0, opinion: (ov && ov.opinion) || 0, arrears: link.arrears || 0,
    tributeKcalPerWeek: link.tributeKcalPerWeek || 0, status: link.status || null, linkDay: (link.day == null ? null : link.day) };
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const t = { attempts: [], tbOutcomes: {}, fieldFights: [], kills: [], musterEvents: [], census: [], transcripts: [], instrumentErrors: [] };
  const uninstall = HI.install(Game, t);
  const mstore = MD.newStore();
  MD.installMusterDiag(Game, mstore);

  const transcript = [];
  let transcriptTruncated = false;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && SAY_RE.test(arg)) {
          if (transcript.length < 2000) transcript.push({ day: ((Game.state || {}).scholar || {}).day || 0, line: String(arg).slice(0, 500) });
          else transcriptTruncated = true;
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}

  const checkRows = [];
  const skippedRows = [];
  const interceptorErrors = [];
  const census = {};
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
          skippedRows.push({ day: curDay, reason: 'no same-day snapshot' });
        } else {
          let readiness = null;
          try { readiness = Game.titanCallReadiness('herald'); } catch (e) {
            interceptorErrors.push('readiness day ' + curDay + ': ' + String((e && e.message) || e).slice(0, 120));
          }
          if (readiness) {
            let dirByVid = {};
            try {
              const links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
              (links || []).forEach(function (l) {
                const row = linkRow(Game, l, curDay);
                if (row.villageId != null) dirByVid[row.villageId] = row.direction;
              });
            } catch (e) { interceptorErrors.push('directions day ' + curDay + ': ' + String((e && e.message) || e).slice(0, 120)); }
            const links = (readiness.links || []).map(function (l) {
              return { villageId: l.villageId, name: l.name, direction: dirByVid[l.villageId] || null,
                trust: l.trust, opinion: l.opinion, arrears: l.arrears, quota: l.quota,
                already: l.already, snapFree: l.snapFree, generatedHere: l.generatedHere,
                freeAdults: l.freeAdults, wouldRefuse: l.wouldRefuse, contribution: l.contribution,
                naiveContribution: l.naiveContribution, faces: l.faces };
            });
            const row = { day: curDay, snapIdx: snaps.length - 1, snapshotCallYield: last.callYield,
              links: links, alliesProj: readiness.alliesProj, havenProj: readiness.havenProj,
              volunteers: readiness.volunteers, total: readiness.total, naiveTotal: readiness.naiveTotal,
              ready: readiness.ready, generatedNow: readiness.generatedNow, errors: readiness.errors };
            row.classification = CLS.classifyCheck(row);
            checkRows.push(row);
          } else {
            skippedRows.push({ day: curDay, reason: 'readiness null' });
          }
        }
      }
    } catch (e) { interceptorErrors.push(String(e && e.message)); }
    return r;
  };

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      const r = policy.daily(Gm, ctx);
      try {
        const day = ((Gm.state || {}).scholar || {}).day || 0;
        let links = [];
        try { links = (typeof Gm.hierarchyState === 'function') ? Gm.hierarchyState() : []; } catch (e) { links = []; }
        census[day] = (links || []).map(function (l) { return linkRow(Gm, l, day); });
      } catch (e) {}
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return r;
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
  const seedClass = CLS.classifySeed(checkRows, skippedRows, att.length);
  const fb = CLS.firstBlockRow(checkRows);
  const firstBlockDay = fb ? fb.row.day : null;
  const firstCheck = checkRows.length ? checkRows[0] : null;
  const firstCheckClass = !checkRows.length ? null : (checkRows[0].ready ? 'ready' : checkRows[0].classification.blockKind);
  let blockedLinks = [];
  if (fb) {
    blockedLinks = fb.row.classification.blockers.map(function (b) {
      return { villageId: b.villageId, name: b.name, direction: b.direction, trust: b.trust, opinion: b.opinion, arrears: b.arrears, quota: b.quota };
    });
  }
  // Waiting observation leg (from this same run's census — no re-sim).
  const censusDays = Object.keys(census).map(Number).sort((a, b) => a - b);
  const lastCensusDay = censusDays.length ? censusDays[censusDays.length - 1] : null;
  const waitingSeries = {};
  const waitingSummary = {};
  if (fb) {
    const winEnd = Math.min(firstBlockDay + 30, lastCensusDay == null ? firstBlockDay : lastCensusDay);
    blockedLinks.forEach(function (bl) {
      const series = [];
      for (let d = firstBlockDay; d <= winEnd; d++) {
        const rows = census[d] || [];
        const row = rows.filter(function (x) { return x.villageId === bl.villageId; })[0] || null;
        if (!row) series.push({ day: d, absent: true });
        else series.push({ day: d, arrears: row.arrears, trust: row.trust, opinion: row.opinion, status: row.status, direction: row.direction });
      }
      waitingSeries[bl.villageId] = series;
      let anyDecrease = false, maxDecrease = 0, firstArrears = null, lastArrears = null, clearsDay = null;
      let prev = null;
      series.forEach(function (s) {
        if (s.absent) return;
        if (firstArrears == null) firstArrears = s.arrears;
        lastArrears = s.arrears;
        if (prev != null && s.arrears < prev) { anyDecrease = true; maxDecrease = Math.max(maxDecrease, prev - s.arrears); }
        if (clearsDay == null && s.arrears === 0 && s.trust >= 25 && s.opinion >= -10) clearsDay = s.day;
        prev = s.arrears;
      });
      waitingSummary[bl.villageId] = { windowStart: firstBlockDay, windowEnd: winEnd, windowDays: series.length,
        firstArrears: firstArrears, lastArrears: lastArrears, anyDecrease: anyDecrease, maxDecrease: maxDecrease,
        netChange: (firstArrears == null || lastArrears == null) ? null : lastArrears - firstArrears,
        clearsDay: clearsDay, clears: clearsDay != null,
        trustStart: series.length ? (series[0].trust == null ? null : series[0].trust) : null,
        trustEnd: series.length ? (series[series.length - 1].trust == null ? null : series[series.length - 1].trust) : null };
    });
  }
  // Census arrears context for every seed (cheap, no extra run).
  let arrearsEver = false, maxArrearsSeen = 0, arrearsDays = 0;
  censusDays.forEach(function (d) {
    const any = (census[d] || []).some(function (x) { return (x.arrears || 0) > 0; });
    if (any) arrearsDays++;
    (census[d] || []).forEach(function (x) { if ((x.arrears || 0) > 0) arrearsEver = true; if ((x.arrears || 0) > maxArrearsSeen) maxArrearsSeen = x.arrears; });
  });

  const out = { seed, anchorCommit: ANCHOR, seedClass, firstCheckDay: firstCheck ? firstCheck.day : null,
    firstCheckClass, firstBlockDay, blockedLinks, blocked: !!fb,
    checkRows, skippedRows, interceptorErrors,
    checkCount: checkRows.length, heraldAttemptCount: att.length,
    heraldAttempts: att.map(a => ({ day: a.day, cls: a.cls, reason: a.reason || null, caller: a.caller || null })),
    waitingSeries, waitingSummary,
    censusArrears: { arrearsEver, maxArrearsSeen, arrearsDays, censusDays: censusDays.length, lastCensusDay },
    transcript, transcriptTruncated, transcriptCount: transcript.length,
    musterErrs: mstore.errs, musterErrors: mstore.errors, instrumentErrors: t.instrumentErrors,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0, w4Day, w5Day,
    national, table, won, days: result.days, gameDays, endReason: result.endReason,
    endScaleRank: (function () { try { return Game.scaleRank ? Game.scaleRank() : null; } catch (e) { return null; } })(),
    deaths, hashes };
  return out;
}

(async () => {
  if (!SEEDS.length) { console.error('SCREEN STOP: SEEDS env required (comma list).'); process.exit(2); }
  for (const seed of SEEDS) {
    try {
      const r = await oneRun(seed);
      console.log(JSON.stringify({ seed: seed, screen: r }));
      console.error(`done s${seed}: class=${r.seedClass} firstCheck=${r.firstCheckClass} firstBlock=${r.firstBlockDay} blockedLinks=${r.blockedLinks.map(b => b.name + ':' + b.direction + ':a' + b.arrears + ':t' + b.trust + ':o' + b.opinion).join('|') || '-'} checks=${r.checkCount} attempts=${r.heraldAttemptCount} nat=${r.national} table=${r.table} won=${r.won} w4=${r.wave4} w5=${r.wave5} end=${r.endReason} days=${r.gameDays} errs=${r.instrumentErrors.length}+${r.musterErrs}`);
    } catch (e) {
      console.error(`ERROR s${seed}: ${e && e.message}`);
      console.error(e && e.stack);
    }
  }
})();
