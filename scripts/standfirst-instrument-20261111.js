// standfirst-instrument-20261111.js — standing points first-numbers
// recorder (arm sim-standfirst-b, run fleshout-loop-b-20261111T1131Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) LADDER TICK (ladderTick): every daily call — stage/peak/counted/
//       capped before/after, beat marks written.
//   (2) STAGE BEATS (ladderStageBeat): every call — stage, ladder line.
//   (3) CAP BEATS (ladderCapBeat): every call — track, rung attempted.
//   (4) STAGE REWARDS (ladderGrantStageReward): every call — stage arg,
//       granted [{stage, kind}] / skipped [{stage, why}].
//   (5) CASH-OUT (ladderCashOut): every call — returned ok/kind/banked/
//       peak/day.
//   (6) BANK (ladderBankPoints): every call — kind, points banked,
//       already flag. (Engine-called at game over via the wipe wrap.)
//   (7) CAPSTONE READINESS (ladderCapstoneReady): every ENGINE call —
//       kind, ready, reason, veterans/payable/charteredLinks/stage.
//       Snapshot readiness reads use the ORIGINAL (unwrapped) function
//       and are recorded in the daily snapshot, never as events.
//   (8) CAPSTONE DELIVERY (ladderDeliverCapstone): every call — kind,
//       ok, reason.
//   (9) FEAST BUNDLE (feastBundleCheck): every call — contributions,
//       count, complete, ctx star/surge.
//  (10) BUY-OUT (feastBundleBuyOut): every call — ok, why, spent,
//       bundleStage.
//  (11) FEASTS (hostFeast): every call — feast-log length before/after,
//       last entry (day/quality/bundle/bundleStage), returned ok/why.
//  (12) OVERTIME (overtimeTick): every call — active/tier/interval/
//       penalty before/after.
//  (13) TELEMETRY CROSS-CHECK (tele, if present): 'overtime_tier' events
//       only — the only tele type any standing/ladder/overtime module
//       fires (ladder.js and standing.js fire no tele).
//  (14) DAILY SNAPSHOT: villageLadder() full object; capstone readiness
//       per kind (original-function reads); capstone delivered;
//       ladderBankedHeadStart(); old standing: villageStanding(),
//       standingPlentyCappedTotal(), standingDeferral(4/5),
//       _standingPeakWave(), waveCombatReadiness(4/5); overtime:
//       overtimeActive/Tier/Interval/Standing(); tableSeat() (pure read);
//       scaleRank, nationalLive, globalLive, unlockedWave;
//       waveLedgerPoints(3/4/5); deedState contestsSurvived; feastLog
//       summary; progState ladder fields; pantry kcal, roster, bearer,
//       ladderLine/standingLine strings.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game. Snapshot reads are PURE: villageStandingTotal() is
// deliberately NOT called from the snapshot (it writes the peak
// ratchet and fires beats) — the gated total is recomputed in the
// analyzer from the snapshot's raw/capped/readiness/peak fields.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-standfirst-b.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Usage: const SF = require('./standfirst-instrument-20261111');
//   const sf = SF.install(Game); sf.snapshot(); ... sf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function ladderSummary(Game) {
  try {
    const L = (typeof Game.villageLadder === 'function') ? Game.villageLadder() : null;
    if (!L) return null;
    return { stage: L.stage, peakStage: L.peakStage, counted: L.counted, total: L.total,
      capped: (L.capped || []).slice(), nextThreshold: L.nextThreshold, shortfall: L.shortfall,
      tracks: clone(L.tracks || {}), countedTracks: clone(L.countedTracks || {}),
      bundleBonus: (L.detail && L.detail.bundleBonus) || 0,
      bundleStages: (L.detail && L.detail.bundleStages) ? L.detail.bundleStages.slice() : [] };
  } catch (e) { return null; }
}
function feastLogSummary(Game) {
  try {
    const log = (Game.state && Game.state.feastLog) || [];
    const bundles = log.filter(function (f) { return f && f.bundle === true; });
    return { entries: log.length,
      bundles: bundles.length,
      bundleStages: bundles.map(function (f) { return (f.bundleStage | 0) || 0; }),
      qualities: log.map(function (f) { return (f && f.quality) | 0; }),
      last: log.length ? clone(log[log.length - 1]) : null };
  } catch (e) { return null; }
}
function overtimeSummary(Game) {
  try {
    const active = (typeof Game.overtimeActive === 'function') ? !!Game.overtimeActive() : null;
    const tier = (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : null;
    const interval = (typeof Game.overtimeInterval === 'function') ? (Game.overtimeInterval() | 0) : null;
    let pen = null;
    try { const st = (typeof Game.overtimeStanding === 'function') ? Game.overtimeStanding() : null; pen = st ? { tier: st.tier, losses: st.losses, penalty: st.penalty } : null; } catch (e) {}
    return { active: active, tier: tier, interval: interval, penalty: pen };
  } catch (e) { return null; }
}

function install(Game) {
  const t = {
    ladderTickEvents: [], stageBeatEvents: [], capBeatEvents: [],
    rewardEvents: [], cashOutEvents: [], bankEvents: [],
    capReadyEvents: [], capDeliverEvents: [], bundleEvents: [],
    buyOutEvents: [], feastEvents: [], overtimeEvents: [],
    teleEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
  };
  let seq = 0;
  const origs = {};

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function err(where, msg) {
    try { t.instrumentErrors.push(where + ': ' + String(msg).slice(0, 100)); } catch (e) {}
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { err(name + '-wrap', e.message); }
  }

  // ---- (1) ladder tick ----
  wrap('ladderTick', function () {
    mark('ladderTick');
    const before = ladderSummary(Game);
    let peakBefore = null, capBeatBefore = null;
    try { peakBefore = (Game.state && Game.state._ladderPeakStage) | 0; } catch (e) {}
    try { capBeatBefore = clone((Game.state && Game.state._ladderCapBeat) || {}); } catch (e) {}
    let ret;
    try { ret = origs.ladderTick.apply(Game, arguments); } catch (e) { err('ladderTick-call', e.message); }
    try {
      const after = ladderSummary(Game);
      let peakAfter = null, capBeatAfter = null;
      try { peakAfter = (Game.state && Game.state._ladderPeakStage) | 0; } catch (e) {}
      try { capBeatAfter = clone((Game.state && Game.state._ladderCapBeat) || {}); } catch (e) {}
      t.ladderTickEvents.push({ seq: ++seq, day: dayOf(Game), before: before, after: after,
        peakBefore: peakBefore, peakAfter: peakAfter,
        capBeatBefore: capBeatBefore, capBeatAfter: capBeatAfter,
        stack: stackText(2), via: 'ladderTick' });
    } catch (e) { err('ladderTick-log', e.message); }
    return ret;
  });

  // ---- (2) stage beats ----
  wrap('ladderStageBeat', function (stage) {
    mark('ladderStageBeat');
    let ret;
    try { ret = origs.ladderStageBeat.call(Game, stage); } catch (e) { err('ladderStageBeat-call', e.message); }
    try {
      let line = null;
      try { line = (typeof Game.ladderLine === 'function') ? Game.ladderLine() : null; } catch (e) {}
      t.stageBeatEvents.push({ seq: ++seq, day: dayOf(Game), stage: (stage == null ? null : stage),
        line: line, stack: stackText(2), via: 'ladderStageBeat' });
    } catch (e) { err('ladderStageBeat-log', e.message); }
    return ret;
  });

  // ---- (3) cap beats ----
  wrap('ladderCapBeat', function (track) {
    mark('ladderCapBeat');
    let ret;
    try { ret = origs.ladderCapBeat.call(Game, track); } catch (e) { err('ladderCapBeat-call', e.message); }
    try {
      const L = ladderSummary(Game);
      t.capBeatEvents.push({ seq: ++seq, day: dayOf(Game), track: track || null,
        rungAttempted: L ? (L.stage + 1) : null, capped: L ? L.capped : null,
        stack: stackText(2), via: 'ladderCapBeat' });
    } catch (e) { err('ladderCapBeat-log', e.message); }
    return ret;
  });

  // ---- (4) stage rewards ----
  wrap('ladderGrantStageReward', function (stage) {
    mark('ladderGrantStageReward');
    let ret = null;
    try { ret = origs.ladderGrantStageReward.call(Game, stage); } catch (e) { err('ladderGrantStageReward-call', e.message); }
    try {
      t.rewardEvents.push({ seq: ++seq, day: dayOf(Game), stageArg: (stage == null ? null : stage),
        granted: ret ? (ret.granted || []) : [], skipped: ret ? (ret.skipped || []) : [],
        stack: stackText(2), via: 'ladderGrantStageReward' });
    } catch (e) { err('ladderGrantStageReward-log', e.message); }
    return ret;
  });

  // ---- (5) cash-out ----
  wrap('ladderCashOut', function () {
    mark('ladderCashOut');
    let ret = null;
    try { ret = origs.ladderCashOut.apply(Game, arguments); } catch (e) { err('ladderCashOut-call', e.message); }
    try {
      t.cashOutEvents.push({ seq: ++seq, day: dayOf(Game),
        ok: !!(ret && ret.ok), kind: (ret && ret.kind) || null,
        banked: (ret && ret.banked) || 0, peak: (ret && ret.peak) || 0,
        why: (ret && ret.why) || null, stack: stackText(2), via: 'ladderCashOut' });
    } catch (e) { err('ladderCashOut-log', e.message); }
    return ret;
  });

  // ---- (6) bank ----
  wrap('ladderBankPoints', function (kind) {
    mark('ladderBankPoints');
    let ret = null;
    try { ret = origs.ladderBankPoints.call(Game, kind); } catch (e) { err('ladderBankPoints-call', e.message); }
    try {
      t.bankEvents.push({ seq: ++seq, day: dayOf(Game), kind: kind || null,
        ok: !!(ret && ret.ok), banked: (ret && ret.banked) || 0,
        points: (ret && ret.points) || 0, already: !!(ret && ret.already),
        why: (ret && ret.why) || null, stack: stackText(2), via: 'ladderBankPoints' });
    } catch (e) { err('ladderBankPoints-log', e.message); }
    return ret;
  });

  // ---- (7) capstone readiness (engine calls only; snapshot uses origs) ----
  wrap('ladderCapstoneReady', function (kind) {
    mark('ladderCapstoneReady');
    let ret = null;
    try { ret = origs.ladderCapstoneReady.call(Game, kind); } catch (e) { err('ladderCapstoneReady-call', e.message); }
    try {
      t.capReadyEvents.push({ seq: ++seq, day: dayOf(Game), kind: kind || null,
        ready: !!(ret && ret.ready), reason: (ret && ret.reason) || null,
        veterans: (ret && ret.veterans) == null ? null : ret.veterans,
        payable: (ret && ret.payable) == null ? null : ret.payable,
        need: (ret && ret.need) == null ? null : ret.need,
        charteredLinks: (ret && ret.charteredLinks) == null ? null : ret.charteredLinks,
        scale: (ret && ret.scale) == null ? null : ret.scale,
        stage: (ret && ret.stage) == null ? null : ret.stage,
        bundle: (ret && ret.bundle) == null ? null : ret.bundle,
        stack: stackText(2), via: 'ladderCapstoneReady' });
    } catch (e) { err('ladderCapstoneReady-log', e.message); }
    return ret;
  });

  // ---- (8) capstone delivery ----
  wrap('ladderDeliverCapstone', function (kind) {
    mark('ladderDeliverCapstone');
    let ret = null;
    try { ret = origs.ladderDeliverCapstone.call(Game, kind); } catch (e) { err('ladderDeliverCapstone-call', e.message); }
    try {
      t.capDeliverEvents.push({ seq: ++seq, day: dayOf(Game), kind: kind || null,
        ok: !!(ret && ret.ok), reason: (ret && ret.reason) || null,
        stack: stackText(2), via: 'ladderDeliverCapstone' });
    } catch (e) { err('ladderDeliverCapstone-log', e.message); }
    return ret;
  });

  // ---- (9) feast bundle check ----
  wrap('feastBundleCheck', function (servedItems, ctx) {
    mark('feastBundleCheck');
    let ret = null;
    try { ret = origs.feastBundleCheck.call(Game, servedItems, ctx); } catch (e) { err('feastBundleCheck-call', e.message); }
    try {
      t.bundleEvents.push({ seq: ++seq, day: dayOf(Game),
        contributions: ret ? (ret.contributions || []).slice() : [],
        count: ret ? (ret.count | 0) : 0, complete: !!(ret && ret.complete),
        star: !!(ctx && ctx.star), surge: !!(ctx && ctx.surge),
        servedCount: Array.isArray(servedItems) ? servedItems.length : null,
        stack: stackText(2), via: 'feastBundleCheck' });
    } catch (e) { err('feastBundleCheck-log', e.message); }
    return ret;
  });

  // ---- (10) buy-out ----
  wrap('feastBundleBuyOut', function () {
    mark('feastBundleBuyOut');
    let ret = null;
    try { ret = origs.feastBundleBuyOut.apply(Game, arguments); } catch (e) { err('feastBundleBuyOut-call', e.message); }
    try {
      t.buyOutEvents.push({ seq: ++seq, day: dayOf(Game),
        ok: !!(ret && ret.ok), why: (ret && ret.why) || null,
        spent: (ret && ret.spent) || 0, bundleStage: (ret && ret.bundleStage) == null ? null : ret.bundleStage,
        stack: stackText(2), via: 'feastBundleBuyOut' });
    } catch (e) { err('feastBundleBuyOut-log', e.message); }
    return ret;
  });

  // ---- (11) feasts ----
  wrap('hostFeast', function () {
    mark('hostFeast');
    const logBefore = feastLogSummary(Game);
    let ret = null;
    try { ret = origs.hostFeast.apply(Game, arguments); } catch (e) { err('hostFeast-call', e.message); }
    try {
      const logAfter = feastLogSummary(Game);
      t.feastEvents.push({ seq: ++seq, day: dayOf(Game),
        logBefore: logBefore, logAfter: logAfter,
        retOk: !!(ret && ret.ok), retWhy: (ret && (ret.why || ret.reason)) || null,
        stack: stackText(2), via: 'hostFeast' });
    } catch (e) { err('hostFeast-log', e.message); }
    return ret;
  });

  // ---- (12) overtime ----
  wrap('overtimeTick', function () {
    mark('overtimeTick');
    const before = overtimeSummary(Game);
    let ret;
    try { ret = origs.overtimeTick.apply(Game, arguments); } catch (e) { err('overtimeTick-call', e.message); }
    try {
      const after = overtimeSummary(Game);
      t.overtimeEvents.push({ seq: ++seq, day: dayOf(Game), before: before, after: after,
        stack: stackText(2), via: 'overtimeTick' });
    } catch (e) { err('overtimeTick-log', e.message); }
    return ret;
  });

  // ---- (13) telemetry cross-check ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { err('tele-call', e.message); }
        try {
          if (type === 'overtime_tier') {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
          mark('tele');
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
    }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (14) daily snapshot (pure reads only) ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try {
      const L = (typeof Game.villageLadder === 'function') ? Game.villageLadder() : null;
      snap.ladder = L ? clone(L) : null;
    } catch (e) { snap.ladder = null; }
    try {
      // Readiness reads use the ORIGINAL (unwrapped) function so the
      // snapshot never creates capReadyEvents.
      const fn = origs.ladderCapstoneReady || Game.ladderCapstoneReady;
      snap.capReady = {};
      ['military_tribute', 'trade_charter', 'feast_embassy'].forEach(function (k) {
        try { snap.capReady[k] = (typeof fn === 'function') ? clone(fn.call(Game, k)) : null; } catch (e) { snap.capReady[k] = null; }
      });
    } catch (e) { snap.capReady = null; }
    try { snap.capDelivered = (typeof Game.ladderCapstoneDelivered === 'function') ? Game.ladderCapstoneDelivered() : null; } catch (e) { snap.capDelivered = null; }
    try { snap.bankHeadStart = (typeof Game.ladderBankedHeadStart === 'function') ? Game.ladderBankedHeadStart() : null; } catch (e) { snap.bankHeadStart = null; }
    try { snap.standing = (typeof Game.villageStanding === 'function') ? clone(Game.villageStanding()) : null; } catch (e) { snap.standing = null; }
    try { snap.cappedTotal = (typeof Game.standingPlentyCappedTotal === 'function') ? Game.standingPlentyCappedTotal() : null; } catch (e) { snap.cappedTotal = null; }
    try { snap.deferral4 = (typeof Game.standingDeferral === 'function') ? clone(Game.standingDeferral(4)) : null; } catch (e) { snap.deferral4 = null; }
    try { snap.deferral5 = (typeof Game.standingDeferral === 'function') ? clone(Game.standingDeferral(5)) : null; } catch (e) { snap.deferral5 = null; }
    try { snap.peakWave = (typeof Game._standingPeakWave === 'function') ? Game._standingPeakWave() : null; } catch (e) { snap.peakWave = null; }
    try { snap.readiness4 = (typeof Game.waveCombatReadiness === 'function') ? clone(Game.waveCombatReadiness(4)) : null; } catch (e) { snap.readiness4 = null; }
    try { snap.readiness5 = (typeof Game.waveCombatReadiness === 'function') ? clone(Game.waveCombatReadiness(5)) : null; } catch (e) { snap.readiness5 = null; }
    try { snap.overtime = overtimeSummary(Game); } catch (e) { snap.overtime = null; }
    try { snap.seat = (typeof Game.tableSeat === 'function') ? clone(Game.tableSeat()) : null; } catch (e) { snap.seat = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try { snap.globalLive = !!(Game.state || {}).globalLive; } catch (e) { snap.globalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try {
      snap.ledger = {};
      [3, 4, 5].forEach(function (w) {
        try { snap.ledger[w] = (typeof Game.waveLedgerPoints === 'function') ? Game.waveLedgerPoints(w) : null; } catch (e) { snap.ledger[w] = null; }
      });
    } catch (e) { snap.ledger = null; }
    try { snap.contestsSurvived = (typeof Game.deedState === 'function') ? ((Game.deedState() || {}).contestsSurvived | 0) : null; } catch (e) { snap.contestsSurvived = null; }
    try { snap.feastLog = feastLogSummary(Game); } catch (e) { snap.feastLog = null; }
    try {
      const pg = (typeof Game.progState === 'function') ? Game.progState() : null;
      snap.prog = pg ? { ladderRewards: clone(pg.ladderRewards || {}), ladderCapstone: pg.ladderCapstone || null,
        ladderCashedOut: pg.ladderCashedOut || null, overtime: pg.overtime | 0,
        tableDone: !!pg.tableDone, tableWaiting: !!pg.tableWaiting, tableAnnounced: !!pg.tableAnnounced,
        sentimentTaught: !!pg.sentimentTaught } : null;
    } catch (e) { snap.prog = null; }
    try { snap.ladderLine = (typeof Game.ladderLine === 'function') ? Game.ladderLine() : null; } catch (e) { snap.ladderLine = null; }
    try { snap.standingLine = (typeof Game.standingLine === 'function') ? Game.standingLine() : null; } catch (e) { snap.standingLine = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    try { snap.roster = ((Game.state.village || {}).roster || []).slice(); } catch (e) { snap.roster = null; }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        try { Game[name] = origs[name]; } catch (e) { err('uninstall-' + name, e.message); }
      });
    } catch (e) { err('uninstall', e.message); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install };
