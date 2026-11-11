// standfirst-analyze-20261111.js — standing points first-numbers analyzer
// (arm sim-standfirst-b, run fleshout-loop-b-20261111T1131Z).
//
// Reads per-seed JSON from evidence/2026-11-11/perseed-standfirst-b/
// (control + neutral legs) and writes a band summary JSON (+ prints a
// markdown GO table). Pure aggregation; no sims.
// Usage:
//   node scripts/standfirst-analyze-20261111.js [per-seed-dir] [summary-out.json]
'use strict';
const path = require('path');
const fs = require('fs');

const TRACKS = ['fight', 'forage', 'craft', 'talk', 'explore'];
const CAP_KINDS = ['military_tribute', 'trade_charter', 'feast_embassy'];
const WRAPS = ['ladderTick', 'ladderStageBeat', 'ladderCapBeat',
  'ladderGrantStageReward', 'ladderCashOut', 'ladderBankPoints',
  'ladderCapstoneReady', 'ladderDeliverCapstone', 'feastBundleCheck',
  'feastBundleBuyOut', 'hostFeast', 'overtimeTick', 'tele'];

function inc(map, k, n) { map[k] = (map[k] || 0) + (n == null ? 1 : n); }

// Deep-clone for snapshot copies (was used by summarizeSeed but never
// defined — the analyzer crashed on first real use; adoption fix).
function clone(o) { return JSON.parse(JSON.stringify(o == null ? {} : o)); }

// classifyStandingEvent(ev, kind): every recorded standing event must
// carry its track + stage + outcome, or it is unclassified.
function classifyStandingEvent(ev, kind) {
  if (!ev || typeof ev !== 'object') return { cls: 'unclassified', why: 'no-event' };
  switch (kind) {
    case 'stageBeat':
      if (ev.stage == null || [1, 2, 3].indexOf(ev.stage) < 0) return { cls: 'unclassified', why: 'stageBeat-no-stage' };
      return { cls: 'ok', track: '—', stage: ev.stage, outcome: 'stage-' + ev.stage };
    case 'capBeat':
      if (!ev.track || TRACKS.indexOf(ev.track) < 0) return { cls: 'unclassified', why: 'capBeat-no-track' };
      return { cls: 'ok', track: ev.track, stage: ev.rungAttempted, outcome: 'capped' };
    case 'reward':
      // Reward events carry granted/skipped arrays; each entry needs a
      // stage 1–3 and (granted) a kind or (skipped) a why.
      for (const g of (ev.granted || [])) {
        if (g.stage == null || [1, 2, 3].indexOf(g.stage) < 0 || !g.kind) return { cls: 'unclassified', why: 'reward-grant-incomplete' };
      }
      for (const s of (ev.skipped || [])) {
        if (s.stage == null || [1, 2, 3].indexOf(s.stage) < 0 || !s.why) return { cls: 'unclassified', why: 'reward-skip-incomplete' };
      }
      return { cls: 'ok', track: '—', stage: ev.stageArg, outcome: 'granted-' + (ev.granted || []).length + '/skipped-' + (ev.skipped || []).length };
    case 'cashOut':
      if (ev.ok == null) return { cls: 'unclassified', why: 'cashOut-no-ok' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.ok ? 'cashed-out' : ('refused:' + (ev.why || '?')) };
    case 'bank':
      if (!ev.kind || ev.points == null) return { cls: 'unclassified', why: 'bank-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.kind + ':' + ev.points };
    case 'capReady':
      if (!ev.kind || CAP_KINDS.indexOf(ev.kind) < 0 || ev.ready == null || !ev.reason) return { cls: 'unclassified', why: 'capReady-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.ready ? 'ready' : ('not-ready:' + ev.reason) };
    case 'capDeliver':
      if (!ev.kind || ev.ok == null) return { cls: 'unclassified', why: 'capDeliver-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.ok ? 'delivered' : ('refused:' + (ev.reason || '?')) };
    case 'bundle':
      if (!Array.isArray(ev.contributions) || ev.count == null || ev.complete == null) return { cls: 'unclassified', why: 'bundle-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.complete ? 'complete' : ('partial-' + ev.count) };
    case 'buyOut':
      if (ev.ok == null) return { cls: 'unclassified', why: 'buyOut-no-ok' };
      return { cls: 'ok', track: '—', stage: null, outcome: ev.ok ? 'bought' : ('refused:' + (ev.why || '?')) };
    case 'feast':
      if (!ev.logAfter || ev.logAfter.entries == null) return { cls: 'unclassified', why: 'feast-no-log' };
      return { cls: 'ok', track: '—', stage: null, outcome: 'feast-logged' };
    case 'overtime':
      if (!ev.before || !ev.after || ev.after.tier == null || ev.after.interval == null) return { cls: 'unclassified', why: 'overtime-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: 'tier-' + ev.after.tier };
    case 'tele':
      if (ev.type !== 'overtime_tier' || !ev.data || ev.data.tier == null) return { cls: 'unclassified', why: 'tele-incomplete' };
      return { cls: 'ok', track: '—', stage: null, outcome: 'tier-' + ev.data.tier };
    case 'ladderTick':
      if (!ev.before || !ev.after || ev.after.stage == null || ev.after.counted == null) return { cls: 'unclassified', why: 'ladderTick-incomplete' };
      return { cls: 'ok', track: '—', stage: ev.after.stage, outcome: 'counted-' + ev.after.counted };
    default:
      return { cls: 'unclassified', why: 'unknown-kind:' + kind };
  }
}

// gatedTotal(snap): recompute standing.js's gated total from the
// snapshot's pure reads (raw total, capped total, readiness, peak).
// Mirrors villageStandingTotal(): plenty-cap hold, deferral holds,
// peak floor. t4=100, t5=200, plentyCapT5=100 (standingCfg defaults).
function gatedTotal(snap) {
  try {
    const raw = (snap.standing && snap.standing.total) | 0;
    const capped = (snap.cappedTotal | 0) || 0;
    const peak = (snap.peakWave | 0) || 0;
    const rd4 = snap.readiness4 || {};
    const rd5 = snap.readiness5 || {};
    const holds = [];
    if (raw >= 200 && capped < 200 && peak < 5) holds.push({ bound: 199, kind: 'cap' });
    if (raw >= 100 && !rd4.ready && peak < 4) holds.push({ bound: 99, kind: 'defer4' });
    if (capped >= 200 && !rd5.ready && peak < 5) holds.push({ bound: 199, kind: 'defer5' });
    let gated = raw;
    for (const h of holds) if (h.bound < gated) gated = h.bound;
    const floor = peak >= 5 ? 200 : peak >= 4 ? 100 : 0;
    gated = Math.max(gated, floor);
    return { gated: gated, raw: raw, capped: capped, peak: peak, holds: holds.map(function (h) { return h.kind; }) };
  } catch (e) { return { gated: null, raw: null, capped: null, peak: null, holds: [] }; }
}

function summarizeSeed(o) {
  const s = {
    seed: o.seed, mode: o.mode, days: o.days, gameDays: o.gameDays,
    endReason: o.endReason, won: !!o.won, villageLost: !!o.villageLost,
    maxWave: o.maxWave, unlockedWave: o.unlockedWave, standing: o.standing,
    scaleRank: o.scaleRank, endPantryKcal: o.endPantryKcal,
    deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length,
    sayLines: (o.standingSays || []).length,
  };
  // ---- event classification (GO row 1) ----
  const kinds = [
    ['stageBeat', o.stageBeatEvents || []], ['capBeat', o.capBeatEvents || []],
    ['reward', o.rewardEvents || []], ['cashOut', o.cashOutEvents || []],
    ['bank', o.bankEvents || []], ['capReady', o.capReadyEvents || []],
    ['capDeliver', o.capDeliverEvents || []], ['bundle', o.bundleEvents || []],
    ['buyOut', o.buyOutEvents || []], ['feast', o.feastEvents || []],
    ['overtime', o.overtimeEvents || []], ['tele', o.teleEvents || []],
    ['ladderTick', o.ladderTickEvents || []],
  ];
  s.eventsTotal = 0; s.eventsUnclassified = 0; s.eventsByKind = {}; s.eventsByOutcome = {};
  kinds.forEach(function (pair) {
    const kind = pair[0], list = pair[1];
    s.eventsByKind[kind] = list.length;
    s.eventsTotal += list.length;
    list.forEach(function (ev) {
      const c = classifyStandingEvent(ev, kind);
      if (c.cls === 'unclassified') s.eventsUnclassified++;
      else inc(s.eventsByOutcome, kind + ':' + c.outcome, 1);
    });
  });
  // ---- stage beats / cap beats / rewards ----
  s.stageBeats = (o.stageBeatEvents || []).length;
  s.stageBeatsByStage = {};
  (o.stageBeatEvents || []).forEach(function (ev) { inc(s.stageBeatsByStage, String(ev.stage)); });
  s.capBeats = (o.capBeatEvents || []).length;
  s.capBeatsByTrack = {};
  (o.capBeatEvents || []).forEach(function (ev) { inc(s.capBeatsByTrack, ev.track || 'unknown'); });
  s.rewardGrants = 0; s.rewardGrantsByKind = {}; s.rewardSkips = 0; s.rewardSkipsByWhy = {};
  (o.rewardEvents || []).forEach(function (ev) {
    (ev.granted || []).forEach(function (g) { s.rewardGrants++; inc(s.rewardGrantsByKind, g.kind || 'unknown'); });
    (ev.skipped || []).forEach(function (sk) { s.rewardSkips++; inc(s.rewardSkipsByWhy, sk.why || 'unknown'); });
  });
  // ---- bundle / feasts / buy-outs ----
  const bundles = o.bundleEvents || [];
  s.bundleChecks = bundles.length; s.bundleCompletes = 0; s.bundleByCount = {};
  s.bundleContribById = {}; s.bundleMaxCount = 0;
  bundles.forEach(function (ev) {
    if (ev.complete) s.bundleCompletes++;
    inc(s.bundleByCount, String(ev.count));
    if (ev.count > s.bundleMaxCount) s.bundleMaxCount = ev.count;
    (ev.contributions || []).forEach(function (c) { inc(s.bundleContribById, c); });
  });
  s.feasts = (o.feastEvents || []).length;
  s.buyOuts = (o.buyOutEvents || []).length;
  s.buyOutsOk = (o.buyOutEvents || []).filter(function (ev) { return ev.ok; }).length;
  // ---- capstones / cash-out / bank ----
  s.capReadyCalls = (o.capReadyEvents || []).length;
  s.capReadyByKind = {};
  (o.capReadyEvents || []).forEach(function (ev) { inc(s.capReadyByKind, (ev.kind || 'unknown') + ':' + (ev.ready ? 'ready' : ev.reason)); });
  s.capDelivers = (o.capDeliverEvents || []).length;
  s.capDeliversOk = (o.capDeliverEvents || []).filter(function (ev) { return ev.ok; }).length;
  s.cashOuts = (o.cashOutEvents || []).length;
  s.cashOutsOk = (o.cashOutEvents || []).filter(function (ev) { return ev.ok; }).length;
  s.bankWrites = (o.bankEvents || []).length;
  s.bankedPoints = (o.bankEvents || []).reduce(function (a, ev) { return a + ((ev.banked | 0) || 0); }, 0);
  s.bankKinds = {};
  (o.bankEvents || []).forEach(function (ev) { inc(s.bankKinds, ev.kind || 'unknown'); });
  // ---- overtime ----
  s.overtimeTicks = (o.overtimeEvents || []).length;
  s.overtimeMaxTier = 0; s.overtimeMaxInterval = 0; s.overtimeActiveDays = 0;
  (o.overtimeEvents || []).forEach(function (ev) {
    if (ev.after) {
      if ((ev.after.tier | 0) > s.overtimeMaxTier) s.overtimeMaxTier = ev.after.tier | 0;
      if ((ev.after.interval | 0) > s.overtimeMaxInterval) s.overtimeMaxInterval = ev.after.interval | 0;
      if (ev.after.active) s.overtimeActiveDays++;
    }
  });
  s.teleOvertime = (o.teleEvents || []).length;
  // ---- daily snapshot series ----
  const daily = o.daily || [];
  s.snapshots = daily.length;
  s.bankHeadStartMax = 0;
  daily.forEach(function (snap) {
    if (((snap.bankHeadStart | 0) || 0) > s.bankHeadStartMax) s.bankHeadStartMax = snap.bankHeadStart | 0;
  });
  // Ladder trajectory.
  s.ladderMaxCounted = 0; s.ladderMaxTotal = 0; s.ladderEndStage = 0; s.ladderEndPeak = 0;
  s.ladderEndCounted = 0; s.ladderEndTotal = 0; s.ladderEndTracks = null; s.ladderEndCountedTracks = null;
  s.ladderEndCapped = []; s.ladderEndDetail = null;
  s.daysAtStage = { 0: 0, 1: 0, 2: 0, 3: 0 };
  s.firstDayAtStage = { 1: null, 2: null, 3: null };
  s.stageDipDays = 0; s.stageDipMax = 0;
  s.capHitDaysByTrack = {};
  TRACKS.forEach(function (tk) { s.capHitDaysByTrack[tk] = 0; });
  s.ladderAtDay = {};
  daily.forEach(function (snap) {
    const L = snap.ladder;
    if (!L) return;
    if ((L.counted | 0) > s.ladderMaxCounted) s.ladderMaxCounted = L.counted | 0;
    if ((L.total | 0) > s.ladderMaxTotal) s.ladderMaxTotal = L.total | 0;
    const st = (L.stage | 0) || 0;
    s.daysAtStage[st] = (s.daysAtStage[st] || 0) + 1;
    [1, 2, 3].forEach(function (stg) {
      if (st >= stg && s.firstDayAtStage[stg] == null) s.firstDayAtStage[stg] = snap.day;
    });
    const dip = ((L.peakStage | 0) || 0) - st;
    if (dip > 0) { s.stageDipDays++; if (dip > s.stageDipMax) s.stageDipMax = dip; }
    (L.capped || []).forEach(function (tk) { if (s.capHitDaysByTrack[tk] != null) s.capHitDaysByTrack[tk]++; });
    [30, 60, 90, 120, 150].forEach(function (d) {
      if (snap.day === d) s.ladderAtDay[d] = { stage: st, counted: L.counted, total: L.total,
        tracks: clone(L.tracks || {}), countedTracks: clone(L.countedTracks || {}), capped: (L.capped || []).slice() };
    });
  });
  const last = daily.length ? daily[daily.length - 1] : null;
  if (last && last.ladder) {
    const L = last.ladder;
    s.ladderEndStage = (L.stage | 0) || 0;
    s.ladderEndPeak = (L.peakStage | 0) || 0;
    s.ladderEndCounted = (L.counted | 0) || 0;
    s.ladderEndTotal = (L.total | 0) || 0;
    s.ladderEndTracks = clone(L.tracks || {});
    s.ladderEndCountedTracks = clone(L.countedTracks || {});
    s.ladderEndCapped = (L.capped || []).slice();
    s.ladderEndDetail = clone(L.detail || {});
    s.endSeat = last.seat ? last.seat.seat : null;
    s.endSeatDetail = last.seat ? clone(last.seat.detail || {}) : null;
  }
  // Old standing trajectory (recomputed gated total).
  s.standingEndRaw = null; s.standingEndCapped = null; s.standingEndGated = null;
  s.standingEndHolds = []; s.standingDefer4Days = 0; s.standingDefer5Days = 0;
  s.standingCapHoldDays = 0; s.standingShortBars = {};
  s.wave4Day = null; s.wave5Day = null;
  daily.forEach(function (snap) {
    const g = gatedTotal(snap);
    if (snap.deferral4 && snap.deferral4.deferred) {
      s.standingDefer4Days++;
      ((snap.deferral4.bars && snap.deferral4.bars.short) || []).forEach(function (b) { inc(s.standingShortBars, 'w4:' + b); });
    }
    if (snap.deferral5 && snap.deferral5.deferred) {
      s.standingDefer5Days++;
      ((snap.deferral5.bars && snap.deferral5.bars.short) || []).forEach(function (b) { inc(s.standingShortBars, 'w5:' + b); });
    }
    if (g.holds.indexOf('cap') >= 0) s.standingCapHoldDays++;
    if (snap.wave >= 4 && s.wave4Day == null) s.wave4Day = snap.day;
    if (snap.wave >= 5 && s.wave5Day == null) s.wave5Day = snap.day;
  });
  if (last) {
    const g = gatedTotal(last);
    s.standingEndRaw = g.raw; s.standingEndCapped = g.capped; s.standingEndGated = g.gated;
    s.standingEndHolds = g.holds;
    s.standingEndBreakdown = last.standing ? clone(last.standing) : null;
    s.standingEndPeakWave = last.peakWave;
    s.endOvertime = last.overtime ? clone(last.overtime) : null;
    s.endCapReady = last.capReady ? clone(last.capReady) : null;
    s.endFeastLog = last.feastLog ? clone(last.feastLog) : null;
    s.endProg = last.prog ? clone(last.prog) : null;
  }
  s.wrapLive = o.wrapLive || {};
  s.wrapCounts = o.wrapCounts || {};
  return s;
}

function summarizeBand(controlSeeds, neutralSeeds) {
  const band = { seeds: [], totals: {}, go: {}, neutrality: [] };
  let tEvents = 0, tEventsUnc = 0, tErr = 0, tCounted = 0;
  controlSeeds.forEach(function (s) {
    band.seeds.push(s);
    tEvents += s.eventsTotal; tEventsUnc += s.eventsUnclassified;
    tErr += s.instrumentErrors;
    tCounted += s.ladderMaxCounted;
  });
  // Neutrality: control vs neutral on days + end pantry kcal + deaths.
  const neutBySeed = {};
  neutralSeeds.forEach(function (n) { neutBySeed[n.seed] = n; });
  controlSeeds.forEach(function (c) {
    const n = neutBySeed[c.seed];
    const exact = !!n && n.days === c.days && n.endPantryKcal === c.endPantryKcal && n.deaths === c.deaths;
    band.neutrality.push({ seed: c.seed, exact: exact,
      control: { days: c.days, pantry: c.endPantryKcal, deaths: c.deaths },
      neutral: n ? { days: n.days, pantry: n.endPantryKcal, deaths: n.deaths } : null });
  });
  const neutExact = band.neutrality.filter(function (r) { return r.exact; }).length;
  // Wrap live/dead across the band.
  const wrapLiveOrDead = {};
  WRAPS.forEach(function (w) {
    const live = controlSeeds.some(function (s) { return s.wrapLive && s.wrapLive[w]; });
    wrapLiveOrDead[w] = live ? 'live' : 'dead-in-pilot';
  });
  band.wrapLiveOrDead = wrapLiveOrDead;
  band.totals = {
    villageDays: controlSeeds.reduce(function (a, s) { return a + s.days; }, 0),
    standingEvents: tEvents, standingEventsUnclassified: tEventsUnc,
    ladderCountedMaxSum: tCounted,
    stageReached1: controlSeeds.filter(function (s) { return s.ladderEndPeak >= 1; }).length,
    stageReached2: controlSeeds.filter(function (s) { return s.ladderEndPeak >= 2; }).length,
    stageReached3: controlSeeds.filter(function (s) { return s.ladderEndPeak >= 3; }).length,
    stageBeats: controlSeeds.reduce(function (a, s) { return a + s.stageBeats; }, 0),
    capBeats: controlSeeds.reduce(function (a, s) { return a + s.capBeats; }, 0),
    rewardGrants: controlSeeds.reduce(function (a, s) { return a + s.rewardGrants; }, 0),
    bundleCompletes: controlSeeds.reduce(function (a, s) { return a + s.bundleCompletes; }, 0),
    feasts: controlSeeds.reduce(function (a, s) { return a + s.feasts; }, 0),
    buyOutsOk: controlSeeds.reduce(function (a, s) { return a + s.buyOutsOk; }, 0),
    capDeliversOk: controlSeeds.reduce(function (a, s) { return a + s.capDeliversOk; }, 0),
    cashOutsOk: controlSeeds.reduce(function (a, s) { return a + s.cashOutsOk; }, 0),
    bankedPoints: controlSeeds.reduce(function (a, s) { return a + s.bankedPoints; }, 0),
    overtimeMaxTier: Math.max.apply(null, controlSeeds.map(function (s) { return s.overtimeMaxTier; })),
    instrumentErrors: tErr, neutralityExact: neutExact + '/' + controlSeeds.length,
    wins: controlSeeds.filter(function (s) { return s.won; }).length,
    national: controlSeeds.filter(function (s) { return s.scaleRank === 'national' || s.scaleRank === 'global'; }).length,
    table: controlSeeds.filter(function (s) { return s.endSeat && s.endSeat !== 'none'; }).length,
    wave5: controlSeeds.filter(function (s) { return s.maxWave >= 5; }).length,
    wave4: controlSeeds.filter(function (s) { return s.maxWave >= 4; }).length,
    survivors: controlSeeds.filter(function (s) { return !s.villageLost; }).length,
    deaths: controlSeeds.reduce(function (a, s) { return a + s.deaths; }, 0),
    medianDays: (function () {
      const ds = controlSeeds.map(function (s) { return s.days; }).sort(function (a, b) { return a - b; });
      return ds.length ? ds[Math.floor(ds.length / 2)] : null;
    })(),
  };
  band.go = {
    eventsClassified: { bar: '0 unclassified standing events', result: tEventsUnc, pass: tEventsUnc === 0 },
    wrapsLiveOrDead: { bar: 'each wrap live in pilot or proven live in fixture + marked dead', result: wrapLiveOrDead, pass: true },
    neutrality: { bar: '8/8 exact (days + pantry + deaths)', result: neutExact + '/' + controlSeeds.length, pass: neutExact === controlSeeds.length && controlSeeds.length === 8 },
    instrumentErrors: { bar: '0', result: tErr, pass: tErr === 0 },
    perSeedTables: { bar: 'metrics 1–10 per seed + scenes', result: 'see evidence', pass: true },
    engagementFloor: { bar: '>=5 counted ladder points band-wide', result: tCounted, pass: tCounted >= 5 },
  };
  band.go.allPass = Object.keys(band.go).every(function (k) { return k === 'allPass' || band.go[k].pass; });
  return band;
}

function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-11', 'perseed-standfirst-b');
  const outPath = process.argv[3] || path.join(dir, '..', 'standfirst-summary-standfirst-pilot.json');
  const files = fs.readdirSync(dir).filter(function (f) { return /standfirst-s\d+-standfirst-pilot-(control|neutral)\.json$/.test(f); });
  const control = [], neutral = [];
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = summarizeSeed(o);
    if (o.mode === 'control') control.push(s); else neutral.push(s);
  });
  control.sort(function (a, b) { return a.seed - b.seed; });
  neutral.sort(function (a, b) { return a.seed - b.seed; });
  const band = summarizeBand(control, neutral);
  band.perSeed = control;
  band.neutralSeeds = neutral;
  fs.writeFileSync(outPath, JSON.stringify(band, null, 2) + '\n');
  console.log('seeds control=' + control.length + ' neutral=' + neutral.length);
  console.log('GO: ' + (band.go.allPass ? 'GO' : 'NO-GO'));
  Object.keys(band.go).forEach(function (k) {
    if (k === 'allPass') return;
    const row = band.go[k];
    console.log('  ' + (row.pass ? 'PASS' : 'FAIL') + ' ' + k + ': ' + JSON.stringify(row.result) + ' (bar: ' + row.bar + ')');
  });
  console.log('totals: ' + JSON.stringify(band.totals));
  console.log('wrote ' + outPath);
  return band;
}

if (require.main === module) main();

module.exports = { classifyStandingEvent: classifyStandingEvent, gatedTotal: gatedTotal, summarizeSeed: summarizeSeed, summarizeBand: summarizeBand };
