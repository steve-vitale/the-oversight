#!/usr/bin/env node
// natprobe-driver-20261103.js — ARM 4 national-chain stage probe (JUDGED batch driver).
// Arms: POLICY=closecommit (baseline) or POLICY=natwindow (variant).
// One process, seeds sequential. Policy = closecommit stack VERBATIM
// (tribfloor leadfeast + windefer + seatdrive + fullseat-diag + titanroute
// + musterclose + mustergap) under the same env gates as npcdeadfilter-confirm,
// OR plain competent when POLICY=competent. Instrument reads ONLY:
// hierarchyState link fields, state flags, _havenPolity() (pure read),
// scaleRank(). It NEVER calls villageStandingTotal (side-effecting),
// _otherVillage, titanCallReadiness, or any roster generator, so the
// trajectory is the baseline trajectory. Output: one JSON per seed to
// $OUTDIR (default /tmp/natprobe-out).
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || '/home/hatch/workspace/the-scattering';
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));
const COMP = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const NW = require(path.join(REPO, 'scripts', 'policies', 'natwindow'));

const POLICY = process.env.POLICY || 'closecommit';
if (POLICY === 'closecommit' || POLICY === 'natwindow') {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
    if (process.env[k] !== '1') { console.error(`NATPROBE STOP: ${k}=1 required for closecommit.`); process.exit(2); }
  }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUTDIR = process.env.OUTDIR || '/tmp/natprobe-out';
if (!SEEDS.length) { console.error('NATPROBE STOP: SEEDS required.'); process.exit(2); }
fs.mkdirSync(OUTDIR, { recursive: true });
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  if (POLICY === 'competent') return COMP.competent;
  if (POLICY === 'natwindow') {
    const base = TF.leadfeast;
    const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
    const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
    const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
    const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
    const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
    const mg = MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
    return NW.withNatWindow(mg, 'lead-natwindow', 'closecommit + natwindow');
  }
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fb) { try { const v = fn(); return v === undefined ? fb : v; } catch (e) { return fb; } }

const NAT_RE = /national|realm|First Court|Iron Court|Founding Council|Charter|Binding|oath/i;
const LINK_RE = /link|tribute|arrears|trust|bond|courtship|proposal|counter/i;

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const daily = [];
  const events = [];
  const says = [];
  const errors = [];
  let lastDay = -1;
  let prevLinks = new Map();
  let prevPending = null, prevNational = false, prevRank = null;

  function snapshot() {
    const day = gday(Game);
    const st = Game.state || {};
    let links = [];
    try { links = (Game.hierarchyState ? Game.hierarchyState() : []) || []; } catch (e) { errors.push('links:' + String(e.message).slice(0, 80)); }
    const linkRows = [];
    let seasonedSubs = 0, activeSubs = 0, activeLinks = 0;
    for (const l of links) {
      if (!l) continue;
      const active = l.status === 'active';
      if (active) activeLinks++;
      const isSub = active && l.primary === 'haven';
      if (isSub) activeSubs++;
      let seasoned = false;
      try { seasoned = !!(Game._linkSeasoned && Game._linkSeasoned(l, !!l.conquered, true)); } catch (e) {}
      if (isSub && seasoned) seasonedSubs++;
      const other = l.primary === 'haven' ? l.subordinate : (l.subordinate === 'haven' ? l.primary : (l.a === 'haven' ? l.b : l.b));
      linkRows.push({ id: l.id || null, kind: l.kind || null, primary: l.primary || null, subordinate: l.subordinate || null,
        other: other || null, status: l.status || null, formedDay: l.day || 0, age: day - (l.day || 0),
        trust: l.trust || 0, arrears: l.arrears || 0, tribute: l.tributeKcalPerWeek || 0, conquered: !!l.conquered, seasoned });
      // link lifecycle events (id-keyed)
      const key = String(l.id || (other + ':' + (l.kind || '')));
      const prev = prevLinks.get(key);
      if (!prev) events.push({ day, type: 'link-appears', other, kind: l.kind || null, primary: l.primary || null, trust: l.trust || 0 });
      else if (prev.status !== l.status) events.push({ day, type: 'link-status', other, from: prev.status, to: l.status, trust: l.trust || 0, arrears: l.arrears || 0 });
      else if (prev.seasoned !== seasoned) events.push({ day, type: seasoned ? 'link-seasoned' : 'link-unseasoned', other, trust: l.trust || 0, age: day - (l.day || 0) });
    }
    for (const [key, prev] of prevLinks) {
      if (!linkRows.some(r => String(r.id || (r.other + ':' + (r.kind || ''))) === key)) events.push({ day, type: 'link-vanishes', other: prev.other });
    }
    prevLinks = new Map(linkRows.map(r => [String(r.id || (r.other + ':' + (r.kind || ''))), r]));
    let polity = null;
    try { const p = Game._havenPolity ? Game._havenPolity() : null; if (p) polity = { shape: p.shape || null, led: !!p.led, primary: p.primary || null, villages: (p.villages || []).slice(), size: p.size || 0 }; } catch (e) { errors.push('polity:' + String(e.message).slice(0, 80)); }
    const rank = safe(() => Game.scaleRank(), null);
    const pend = st.pendingNational ? { shape: st.pendingNational.shape || null, day: st.pendingNational.day || 0, villages: (st.pendingNational.villages || []).slice() } : null;
    if (JSON.stringify(pend) !== JSON.stringify(prevPending)) {
      events.push({ day, type: pend ? 'pendingNational-staged' : 'pendingNational-cleared', shape: pend ? pend.shape : (prevPending ? prevPending.shape : null) });
      prevPending = pend;
    }
    if (!!st.nationalLive !== prevNational) { events.push({ day, type: st.nationalLive ? 'nationalLive-on' : 'nationalLive-off' }); prevNational = !!st.nationalLive; }
    if (rank !== prevRank) { events.push({ day, type: 'rank', rank }); prevRank = rank; }
    daily.push({ day, rank, networkLive: !!st.networkLive, networkLiveDay: st.networkLiveDay || 0,
      pendingCounter: st.pendingCounter ? { target: st.pendingCounter.targetId || null, asSub: !!st.pendingCounter.asSubordinate } : null,
      pendingAccord: !!st.pendingAccord,
      daysSinceRegional: st.networkLive ? (day - (st.networkLiveDay || 0)) : null,
      nationalLive: !!st.nationalLive, nationalDay: st.nationalDay || 0, scaleRefused: !!st.scaleRefused,
      pendingNational: pend, polity, activeLinks, activeSubs, seasonedSubs,
      scholarExiled: !!((st.scholar || {}).exiled), scholarJoined: !!((st.scholar || {}).joinedVillage),
      pantryKcal: safe(() => ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0), null),
      links: linkRows });
    lastDay = day;
  }

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && (NAT_RE.test(arg) || LINK_RE.test(arg))) says.push({ day: gday(Game), line: String(arg).slice(0, 400) });
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap:' + String(e.message).slice(0, 80)); }
  await setupGame(Game);
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try { const d = gday(Game); if (d !== lastDay) snapshot(); } catch (e) { errors.push('snapshot:' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { snapshot(); } catch (e) {}
  const st = Game.state || {};
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  // Derive stage summary from daily series (no extra engine reads).
  function firstDay(pred) { const r = daily.find(pred); return r ? r.day : null; }
  const summary = {
    firstLinkDay: firstDay(d => d.activeLinks > 0),
    thirdSubDay: firstDay(d => d.activeSubs >= 3),
    firstSeasoned3Day: firstDay(d => d.seasonedSubs >= 3),
    firstPolityDay: firstDay(d => !!d.polity),
    firstPolityShape: (daily.find(d => !!d.polity) || {}).polity || null,
    networkLiveDay: firstDay(d => d.networkLive),
    regionalPlus30Day: (() => { const r = daily.find(d => d.networkLive); return r ? r.networkLiveDay + 30 : null; })(),
    firstPendingDay: firstDay(d => !!d.pendingNational),
    firstNationalDay: firstDay(d => d.nationalLive),
    everNational: daily.some(d => d.nationalLive),
    everPending: daily.some(d => !!d.pendingNational),
    everPolity: daily.some(d => !!d.polity),
    everSeasoned3: daily.some(d => d.seasonedSubs >= 3),
    maxSeasonedSubs: Math.max.apply(null, daily.map(d => d.seasonedSubs)),
    maxActiveSubs: Math.max.apply(null, daily.map(d => d.activeSubs)),
    maxActiveLinks: Math.max.apply(null, daily.map(d => d.activeLinks)),
    finalSeasonedSubs: daily.length ? daily[daily.length - 1].seasonedSubs : 0,
    finalActiveSubs: daily.length ? daily[daily.length - 1].activeSubs : 0,
  };
  const out = { seed, policy: POLICY, anchorCommit: ANCHOR, days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over, villageLost: !!Game.villageLost,
    scaleRank: safe(() => Game.scaleRank(), null), tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
    summary, events, daily, says: says.slice(0, 400), sayKept: says.length, instrumentErrors: errors };
  fs.writeFileSync(path.join(OUTDIR, `natprobe-${POLICY}-s${seed}.json`), JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ seed, policy: POLICY, days: out.days, endReason: out.endReason, won: out.won, scaleRank: out.scaleRank, summary }));
}

(async () => {
  for (const seed of SEEDS) await oneRun(seed);
})();
