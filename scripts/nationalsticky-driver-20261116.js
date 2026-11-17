// nationalsticky-driver-20261116.js — JUDGED driver, arm sim-nationalsticky-b
// (DIAG: is reached-national lost, and how? — findings #2452, from
// evidence/2026-11-16/sim-seasoning-b.md §National is not sticky).
// Two legs, zero src/js change: OFF = master as-is, recorder off
// (trajectory reference); ON = master as-is + recorder wraps only.
// Policy: competent verbatim (scripts/policies/competent.js), 200d
// death-aware, band 103011–103018. All recorder wraps are pure reads
// plus writes to driver-local arrays — no game-state writes, no RNG
// draws. NATIONALSTICKY_RECORDER=off skips installing the wraps
// (determinism leg D2).
// Daily snapshot: the stand199 instrument pattern
// (scripts/standing199-instrument-20261110.js) plus the onlylead
// shape-candidate roll (scripts/onlylead-driver-20261115.js) —
// standing raw + capped, link roll with seasoned flags, the engine's
// own staging predicates, pendingNational, nationalLive. The analyzer
// derives every reach / lapse / re-stage from the series + verbEvents.
// villageStandingTotal() is read ONCE at end-of-run (it fires
// release/hold beats, so a recorder call could shift a beat; never
// call it daily — the onlylead-driver precedent).
// Usage:
//   MODE=off OUTDIR=perseed-nationalsticky-b-off SEEDS=103011,103012 RUN=nationalsticky-b node scripts/nationalsticky-driver-20261116.js
//   MODE=on  OUTDIR=perseed-nationalsticky-b-on  SEEDS=103011,103012 RUN=nationalsticky-b node scripts/nationalsticky-driver-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '200', 10) || 200;
const RUN = process.env.RUN || 'nationalsticky-b';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-nationalsticky-b-' + MODE);
const RECORDER_ON = process.env.NATIONALSTICKY_RECORDER !== 'off';

if (MODE !== 'off' && MODE !== 'on') { console.error('NATIONALSTICKY STOP: MODE must be off|on, got ' + JSON.stringify(MODE)); process.exit(2); }

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}
function aliveCount(Game) {
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    let n = 0;
    for (let i = 0; i < roster.length; i++) {
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (p && p.dead) dead = true; } catch (e) {}
      if (!dead) n++;
    }
    return n;
  } catch (e) { return 0; }
}

// One daily snapshot: pure reads only. Returns null when the day is
// not readable (counts as an instrument error upstream).
// Link roll fields per link: id, o=other village, k=kind, p=primary,
// sub=subordinate, st=status, t=trust, f=formed day, age, cq=conquered,
// se=seasoned, rp=regional+.
function snapshot(Game, errors) {
  try {
    const st = Game.state || {};
    const s = st.scholar || {};
    const day = s.day || 0;
    const standing = safe(function () { return Game.villageStanding() || {}; }, {});
    const capped = safe(function () { return Game.standingPlentyCappedTotal ? Game.standingPlentyCappedTotal() : null; }, null);
    const links = [];
    let linkErr = null;
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) {
        if (!l) continue;
        const other = safe(function () { return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary); }, (l.primary === 'haven' ? l.subordinate : l.primary));
        const se = safe(function () { return Game._linkSeasoned ? !!Game._linkSeasoned(l, !!l.conquered) : false; }, false);
        const rp = safe(function () { return Game._linkRegionalPlus ? !!Game._linkRegionalPlus(l) : false; }, false);
        links.push({
          id: l.id || null, o: other || null, k: l.kind || 'link',
          p: l.primary || null, sub: l.subordinate || null,
          st: l.status || null, t: l.trust | 0, f: l.day | 0,
          age: day - (l.day | 0), cq: l.conquered ? 1 : 0,
          se: se ? 1 : 0, rp: rp ? 1 : 0,
        });
      }
    } catch (e) { linkErr = String(e.message).slice(0, 80); }
    if (linkErr) errors.push('linkroll: ' + linkErr);
    // Shape-candidate roll — the engine's own staging predicates,
    // read daily as pure reads (onlylead-driver precedent). Any read
    // failure here is an instrument error.
    function shapeSummary(x) {
      if (!x) return null;
      return { shape: x.shape || null, size: x.size | 0, primary: x.primary || null, led: !!x.led };
    }
    const candLead = safe(function () { return Game.polityOf ? Game.polityOf('haven') : null; }, null);
    const candBelong = safe(function () { return Game._belongPolity ? Game._belongPolity() : null; }, null);
    const candCov = safe(function () { return Game._covenantPolity ? Game._covenantPolity() : null; }, null);
    const candTrade = safe(function () { return Game._tradePolity ? Game._tradePolity() : null; }, null);
    const shapeCands = {
      lead: (candLead && candLead.shape === 'lead') ? shapeSummary(candLead) : null,
      conquest: (candLead && candLead.shape === 'conquest') ? shapeSummary(candLead) : null,
      belong: shapeSummary(candBelong),
      covenant: shapeSummary(candCov),
      trade: shapeSummary(candTrade),
    };
    if (typeof Game.polityOf !== 'function' || typeof Game._belongPolity !== 'function' ||
      typeof Game._covenantPolity !== 'function' || typeof Game._tradePolity !== 'function') {
      errors.push('shapecands: staging predicate missing');
    }
    const hp = safe(function () { return Game._havenPolity ? Game._havenPolity() : null; }, null);
    const rd4 = safe(function () { return Game.waveCombatReadiness(4) || {}; }, {});
    const rd5 = safe(function () { return Game.waveCombatReadiness(5) || {}; }, {});
    return {
      d: day,
      scale: safe(function () { return Game.scaleRank() || 'village'; }, 'village'),
      stRaw: standing.total | 0, war: standing.war | 0, dip: standing.diplomacy | 0,
      plenty: standing.plenty | 0, warPts: standing.warPts | 0, links: standing.links | 0,
      feasts: standing.feasts | 0,
      capped: capped,
      nationalLive: !!st.nationalLive,
      nationalDay: st.nationalDay != null ? st.nationalDay : null,
      nationalFirstDay: st.nationalFirstDay != null ? st.nationalFirstDay : null,
      nationalShape: st.nationalShape || null,
      pendingNational: st.pendingNational ? { shape: st.pendingNational.shape || null, primary: st.pendingNational.primary || null, day: st.pendingNational.day | 0 } : null,
      shapeCands: shapeCands,
      havenPolity: hp ? { shape: hp.shape || null, size: hp.size | 0, led: !!hp.led } : null,
      linksRoll: links,
      nActive: links.filter(function (l) { return l.st === 'active'; }).length,
      nSeasoned: links.filter(function (l) { return l.st === 'active' && l.se; }).length,
      nCounted: links.filter(function (l) { return l.st === 'active' && l.se && l.rp; }).length,
      rd4ready: !!rd4.ready, rd5ready: !!rd5.ready,
      vet4: rd4.veterans | 0, vet5: rd5.veterans | 0,
      wk: Object.assign({}, st.waveKills || {}),
      pop: ((st.village || {}).roster || []).length,
      alive: aliveCount(Game),
      pantry: pantryKcal(Game),
      exiled: !!((st.scholar || {}).exiled),
      scaleRefused: !!st.scaleRefused,
    };
  } catch (e) {
    errors.push('snapshot: ' + String(e.message).slice(0, 80));
    return null;
  }
}

const SAY_RE = /realm came apart|national|First Court|Founding Council|Binding|Charter|Iron Court|tend|trust/i;
const MEAL_LINE_RE = /village meal|cooked for the haven|communal pantry|you keep a day's food|meals stretched/i;
const SAY_CAP = 900;

function linkTrust(Game, id) {
  try {
    const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    for (const l of hs) if (l && l.id === id) return l.trust | 0;
  } catch (e) {}
  return null;
}
function linkOther(Game, id) {
  try {
    const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    for (const l of hs) if (l && l.id === id) {
      return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary);
    }
  } catch (e) {}
  return null;
}

async function oneRun(seed, opts) {
  opts = opts || {};
  const daysRun = (opts.days | 0) || DAYS;
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'nationalsticky-' + MODE, fullTelemetry: false });
  const series = [];
  const verbEvents = [];
  const sayLines = [];
  const errors = [];
  let lastDay = -1;
  let inDaily = false;
  let sayCount = 0;

  function snap() {
    const sn = snapshot(Game, errors);
    if (!sn) return;
    if (sn.d === lastDay) return; // one snapshot per game day
    lastDay = sn.d;
    series.push(sn);
  }

  if (RECORDER_ON) {
    try {
      const origSay = Game.say;
      Game.say = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string') {
            sayCount++;
            if (SAY_RE.test(String(arg)) && !MEAL_LINE_RE.test(String(arg)) && sayLines.length < SAY_CAP) {
              sayLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
            }
          }
        } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
        return origSay.apply(this, arguments);
      };
    } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

    // answerNationalChoice: record the staged shape (read from
    // state.pendingNational BEFORE the call) alongside the answer,
    // so reach days need no snapshot join (onlylead precedent).
    try {
      const orig = Game.answerNationalChoice;
      if (typeof orig !== 'function') errors.push('answerNationalChoice-wrap: not a function');
      else Game.answerNationalChoice = function (how) {
        let shape = null;
        try { shape = ((Game.state || {}).pendingNational || {}).shape || null; } catch (e) {}
        let ret = null, threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          verbEvents.push({
            day: gday(Game), verb: 'answerNationalChoice', caller: inDaily ? 'policy' : 'engine',
            shape: shape, answer: String(how),
            result: ret === true ? 'sat' : (ret === null ? 'died-aloud' : String(ret).slice(0, 80)),
            threw: threw ? String(threw.message).slice(0, 80) : null,
          });
        } catch (e) { errors.push('answerNationalChoice-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push('answerNationalChoice-wrap-install: ' + String(e.message).slice(0, 80)); }

    // tendLink: recovery tends after a lapse are visible as
    // before/after trust deltas, with the caller (policy vs engine).
    try {
      const orig = Game.tendLink;
      if (typeof orig !== 'function') errors.push('tendLink-wrap: not a function');
      else Game.tendLink = function (linkId) {
        const before = (typeof linkId === 'string') ? linkTrust(Game, linkId) : null;
        let ret = null, threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          const after = (typeof linkId === 'string') ? linkTrust(Game, linkId) : null;
          verbEvents.push({
            day: gday(Game), verb: 'tendLink', caller: inDaily ? 'policy' : 'engine',
            linkId: (typeof linkId === 'string') ? linkId : null,
            other: (typeof linkId === 'string') ? linkOther(Game, linkId) : null,
            before: before, after: after,
            dTrust: (before !== null && after !== null) ? (after - before) : null,
            result: ret === true ? 'tended' : String(ret).slice(0, 80),
            threw: threw ? String(threw.message).slice(0, 80) : null,
          });
        } catch (e) { errors.push('tendLink-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push('tendLink-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      inDaily = true;
      try { return policy.daily ? policy.daily(Gm, ctx) : undefined; }
      finally {
        inDaily = false;
        try { snap(); } catch (e) { errors.push('snap-after-daily: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: daysRun, manifest: undefined, sampleEvery: 1 }); });
  try { snap(); } catch (e) {}

  const st = Game.state || {};
  let scaleRank = null, standingGated = null, standingRaw = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { standingGated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { errors.push('standingGated: ' + String(e.message).slice(0, 80)); }
  try { standingRaw = Game.villageStanding ? (Game.villageStanding() || {}).total : null; } catch (e) {}
  let tableState = null;
  try { tableState = Game.tableState ? Game.tableState() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  let w3kills = 0, w4kills = 0, w5kills = 0;
  try {
    const log = st.waveKillLog || [];
    for (let i = 0; i < log.length; i++) {
      const w = (log[i] && log[i].w) | 0;
      if (w === 3) w3kills++;
      else if (w === 4) w4kills++;
      else if (w >= 5) w5kills++;
    }
  } catch (e) { errors.push('waveKillLog: ' + String(e.message).slice(0, 80)); }

  return {
    seed: seed, arm: 'nationalsticky-b', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, standing: standingGated,
    standingRaw: standingRaw,
    waveKills: Object.assign({}, st.waveKills || {}),
    w3kills: w3kills, w4kills: w4kills, w5kills: w5kills,
    tableState: tableState ? {
      path: tableState.path || null, branch: tableState.branch || null,
      phase: tableState.phase || null, final: tableState.final || null,
      seat: (tableState.seatTaker && tableState.seatTaker.name) || null,
      seatSelf: !!(tableState.seatTaker && tableState.seatTaker.self),
    } : null,
    sayCount: sayCount, sayLines: sayLines,
    series: series, verbEvents: verbEvents,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('NATIONALSTICKY STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'nationalsticky-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('NATIONALSTICKY STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'nationalsticky-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: (out.policySha || '').slice(0, 12), recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, standingRaw: out.standingRaw,
      scaleRank: out.scaleRank, seriesDays: out.series.length,
      nationalDays: out.series.filter(function (s) { return s.nationalLive; }).length,
      verbEvents: out.verbEvents.length, sayLines: out.sayLines.length,
      deaths: out.deaths.length, w4kills: out.w4kills,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, snapshot: snapshot, SAY_RE: SAY_RE, SAY_CAP: SAY_CAP };
