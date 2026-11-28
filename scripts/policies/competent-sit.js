// policies/competent-sit.js — sim-sitpolicy-a (Loop A run
// fleshout-20261128T0815Z, axis scale-onramp).
//
// Competent verbatim PLUS the sitting verbs, nothing else.
// POLICY-SIDE ONLY. ZERO src/js changes.
//
// The competent policy has no sit verb: the scalecensus band
// reaches the lesser seat 8/8 and then waits 58–108 days for a
// better seat that never comes (seated 0/8). This policy sits
// when the lesser seat is offered, waits through the wait,
// delivers the capstone when it reads deliverable, answers
// court beats when staged, and keeps feast-bundle contributions
// going — and then PLAYS the table it sat at, through whatever
// doors the run actually earned.
//
// THE ADDITION (frozen in evidence/2026-11-28/
// sim-sitpolicy-a-prereg.md §2 — do not tune), at the START of
// daily() — dawn, at Haven, before competent.daily() runs the
// day's trips (the capstonedeliver placement) — plus the wait
// leg after competent.daily():
//   1. Court beats: a staged pendingNational is answered with
//      the frozen mapping (lead feast / conquest mercy / belong
//      swear / covenant pact / trade sign, copied verbatim from
//      sim-answercourt-b / leadcourt.js). Unknown shape: never
//      answered. 'refuse'/'walk' never chosen. pendingGlobal
//      beats are NOT answered (they can only stage after
//      national is live).
//   2. Feast bundle: if the feast_embassy reads not-ready with
//      reason 'no-bundle-feast' AND the pantry holds >= 16,000
//      kcal (the 8,000-kcal buy-out plus a full buy-out in
//      reserve — never buy the village into famine), call
//      feastBundleBuyOut() once.
//   3. Capstone delivery: deliver the FIRST kind that reads
//      deliverable, fixed order military_tribute ->
//      trade_charter -> feast_embassy, at most one delivery
//      attempt per dawn. Deliverable = ready AND, for the
//      tribute, payable >= 2 (the scholar-veteran split).
//      Charter/feast deliver on ready alone.
//   4. Sit: if !pg.tableDone, read tablePreview(); if ready,
//      call tableTakeSeat() (as the player character) and drain
//      the modal on ok. Attempted on the FIRST ready dawn —
//      never wait for a better seat. The preview is null before
//      day 90 (winDayFloorOk), so the earliest sit is day 90.
//   5. Table drain: while scholar.tableChoices has options,
//      pick the FIRST presented option — EXCEPT a
//      'conscript:*' option is never accepted (pick
//      'conscript:no', or stop if there is no no-option), a
//      trial opt-in ('beat:trial') is never taken (first
//      non-trial option, or stop if the trial is the only
//      option), and a 'seat:*' option picks the player
//      character's own id when present. Cap 30 answers per
//      dawn, stall guard, break on Game.over / live tbfight.
//      Branches stay ledger-earned — the drain NEVER overrides
//      tableBranch. The drain also runs at dawn when a modal is
//      pending from a previous dawn, even though tableDone is
//      already true.
//   6. Wait leg (after competent.daily()): while tableWaiting
//      && !tableDone, end the day at Haven (4,4) — walk there
//      if needed (the tableseat pattern).
//
// A GO verdict here means GO CANDIDATE as an instrument —
// landing this as competent play is a coordinator/Steve call,
// NOT made by this arm. No default flips. No Math.random in
// this file: the only new RNG draws are the engine's own,
// inside the called verbs.
'use strict';
const { competent, walkTo } = require('./competent');

// Frozen per-shape court answers (answercourt-b / leadcourt.js).
const NATIONAL_ANSWERS = {
  lead: 'feast',
  conquest: 'mercy',
  belong: 'swear',
  covenant: 'pact',
  trade: 'sign',
};

const CAPSTONE_KINDS = ['military_tribute', 'trade_charter', 'feast_embassy'];
// Buy-out cost is 8,000 kcal (game.js feastBundleBuyOut); the policy
// keeps a full buy-out in reserve, so the floor is 2x the cost.
const BUNDLE_COST = 8000;
const BUNDLE_MIN_PANTRY = 16000;
const DRAIN_CAP = 30;
const HAVEN_X = 4, HAVEN_Y = 4;

// sitLog: the attempt/event log, in call order. The driver reads it
// after runDays. Entries are plain JSON (no wall-clock fields) so
// per-seed rows stay byte-identical across reruns. Reset per run by
// the driver (see resetSitLog); a policy module is process-scoped,
// and drivers run one seed per process, so the log cannot leak
// across seeds — but the reset exists anyway so a proof test that
// runs two villages in one process stays honest.
const sitLog = [];
function resetSitLog() { sitLog.length = 0; }
function sitLogSlice() { return JSON.parse(JSON.stringify(sitLog)); }
function logEvent(ev) {
  sitLog.push(ev);
  if (sitLog.length > 2000) sitLog.splice(0, sitLog.length - 2000);
}

function gdayOf(Game) {
  try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; }
  catch (e) { return 0; }
}

function scholarAlive(Game) {
  try {
    const sid = Game.villagerId;
    if (!sid || typeof Game.getPerson !== 'function') return true;
    const p = Game.getPerson(sid);
    if (!p) return true;
    return !p.dead;
  } catch (e) { return true; }
}

function canPropose(Game) {
  try { const s = (Game.state || {}).scholar || {}; return !s.exiled && !s.joinedVillage; }
  catch (e) { return false; }
}

function atHaven(Game) {
  try { return Game.map.px === HAVEN_X && Game.map.py === HAVEN_Y; }
  catch (e) { return false; }
}

function pantryKcal(Game) {
  try {
    if (typeof Game.pantryKcalLive === 'function' && Game.state && Game.state.village) {
      const v = Game.pantryKcalLive(Game.state.village);
      if (typeof v === 'number' && Number.isFinite(v)) return v;
    }
  } catch (e) {}
  return null;
}

// deliverableOf(kind, read): the readiness/delivery split, frozen
// in the prereg §2. Ready is the BAR; deliverable is the PAYMENT.
// tribute: ready AND payable >= 2 (a scholar-veteran + 1 villager
// reads ready but must stay undelivered). charter/feast: ready
// alone — the delivery records the deed and takes no payment. An
// already-delivered capstone is never deliverable again (its read
// carries ready:false with reason 'delivered').
function deliverableOf(kind, read) {
  if (!read || typeof read !== 'object' || read.error) return false;
  if (!read.ready) return false;
  if (kind === 'military_tribute') return ((read.payable | 0) >= 2);
  return true;
}

function readCapstone(Game, kind) {
  try {
    if (typeof Game.ladderCapstoneReady !== 'function') return { kind, error: 'no-ladderCapstoneReady' };
    const r = Game.ladderCapstoneReady(kind);
    if (!r || typeof r !== 'object') return { kind, error: 'ladderCapstoneReady-null' };
    return r;
  } catch (e) {
    return { kind, error: 'ladderCapstoneReady-threw:' + String((e && e.message) || e).slice(0, 80) };
  }
}

// tryDeliverCapstone(Game): deliver the FIRST deliverable kind in
// the frozen order, at most one attempt per call. Returns the
// attempt record, or null when nothing was deliverable (no attempt,
// no log — the capstonedeliver precedent: a non-attempt is not an
// event). A thrown delivery is logged as a failed attempt.
function tryDeliverCapstone(Game) {
  const day = gdayOf(Game);
  try {
    if (typeof Game.ladderCapstoneDelivered === 'function' && Game.ladderCapstoneDelivered()) return null;
    if (typeof Game.ladderDeliverCapstone !== 'function') return null;
    for (const kind of CAPSTONE_KINDS) {
      const read = readCapstone(Game, kind);
      if (!deliverableOf(kind, read)) continue;
      let res = null;
      try { res = Game.ladderDeliverCapstone(kind); }
      catch (e) { res = { ok: false, kind, reason: 'deliver-threw:' + String((e && e.message) || e).slice(0, 80) }; }
      const attempt = {
        day, kind: 'deliver', capKind: kind,
        ok: !!(res && res.ok),
        reason: (res && typeof res.reason === 'string') ? res.reason : (res && res.ok ? 'delivered' : 'unknown'),
        veterans: (res && Array.isArray(res.veterans)) ? res.veterans.slice() : null,
        names: (res && Array.isArray(res.names)) ? res.names.slice() : null,
      };
      logEvent(attempt);
      return attempt;
    }
    return null;
  } catch (e) {
    logEvent({ day, kind: 'deliver-error', reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80) });
    return null;
  }
}

// tryBuyBundle(Game): buy the feast bundle out of the pantry when
// the embassy is blocked ONLY by the missing bundle AND the pantry
// holds the frozen reserve (BUNDLE_MIN_PANTRY). At most one attempt
// per call. No attempt (and no log) when the pantry is short, the
// bundle is already banked, or the embassy is blocked by anything
// else — the policy does not call a verb it cannot afford.
function tryBuyBundle(Game) {
  const day = gdayOf(Game);
  try {
    if (typeof Game.feastBundleBuyOut !== 'function') return null;
    const read = readCapstone(Game, 'feast_embassy');
    if (!read || read.error || read.ready) return null;
    if (read.reason !== 'no-bundle-feast') return null; // the bundle is not the blocker
    const have = pantryKcal(Game);
    if (have == null || have < BUNDLE_MIN_PANTRY) return null;
    if (!atHaven(Game)) return null; // the verb refuses away from Haven; do not spend the call
    let res = null;
    try { res = Game.feastBundleBuyOut(); }
    catch (e) { res = { ok: false, why: 'buyout-threw:' + String((e && e.message) || e).slice(0, 80) }; }
    const attempt = {
      day, kind: 'bundle',
      ok: !!(res && res.ok),
      why: (res && typeof res.why === 'string') ? res.why : (res && res.ok ? 'The bundle is bought.' : 'unknown'),
      spent: (res && typeof res.spent === 'number') ? res.spent : null,
      bundleStage: (res && typeof res.bundleStage === 'number') ? res.bundleStage : null,
      pantryBefore: have,
    };
    logEvent(attempt);
    return attempt;
  } catch (e) {
    logEvent({ day, kind: 'bundle-error', reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80) });
    return null;
  }
}

// answerCourtBeat(Game): answer ONE staged national beat with the
// pre-registered per-shape answer. Exported for the proof test (a
// fake Game can stage a pendingNational per shape without a full
// run). Returns the answer given, 'unknown-shape' (not answered),
// or null (no beat pending).
function answerCourtBeat(Game) {
  const day = gdayOf(Game);
  try {
    if (Game.over) return null;
    const st = Game.state || {};
    if (!st.pendingNational) return null;
    if (typeof Game.answerNationalChoice !== 'function') {
      logEvent({ day, kind: 'court-error', reason: 'no-answerNationalChoice' });
      return null;
    }
    const shape = st.pendingNational.shape;
    const how = NATIONAL_ANSWERS[shape];
    if (!how) {
      logEvent({ day, kind: 'court-unknown', shape: shape || null,
        villages: (st.pendingNational.villages || []).length });
      return 'unknown-shape';
    }
    let ret = null;
    try { ret = Game.answerNationalChoice(how); }
    catch (e) { logEvent({ day, kind: 'court-error', shape, reason: 'answer-threw:' + String((e && e.message) || e).slice(0, 80) }); return null; }
    logEvent({ day, kind: 'court', shape, answer: how,
      result: (ret === true ? 'sat' : (ret === null ? 'died-aloud' : String(ret).slice(0, 60))) });
    return how;
  } catch (e) {
    logEvent({ day, kind: 'court-error', reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80) });
    return null;
  }
}

// pickTableOption(tc, Game): the frozen drain pick rule. First
// presented option, with three fail-closed carve-outs:
//   - conscript: never accepted ('conscript:no', or null when no
//     no-option exists — the drain stops rather than conscripting);
//   - trial: never taken (first non-trial option, or null when the
//     trial is the only option);
//   - seat-taker: the player character's own id when present.
// Returns the option object, or null when no option may be taken.
function pickTableOption(tc, Game) {
  try {
    const opts = (tc && Array.isArray(tc.options)) ? tc.options : [];
    if (!opts.length) return null;
    const hasConscript = opts.some(o => o && typeof o.id === 'string' && o.id.indexOf('conscript:') === 0);
    if (hasConscript) {
      const no = opts.find(o => o && o.id === 'conscript:no');
      return no || null;
    }
    const seatOpts = opts.filter(o => o && typeof o.id === 'string' && o.id.indexOf('seat:') === 0);
    if (seatOpts.length) {
      const own = seatOpts.find(o => o.id === 'seat:' + Game.villagerId);
      return own || seatOpts[0];
    }
    const nonTrial = opts.filter(o => !(o && o.id === 'beat:trial'));
    if (nonTrial.length < opts.length) return nonTrial[0] || null;
    return opts[0];
  } catch (e) { return null; }
}

// drainTableChoices(Game, ctx): answer the pending table modal
// until it clears, the cap is hit, the same modal repeats (stall),
// the game ends, or a live turn-based fight pauses it. Logs every
// answer with day / frame / option id / label, and the path walked.
function drainTableChoices(Game, ctx) {
  try {
    let n = 0, lastSig = null, stall = 0;
    for (;;) {
      if (Game.over || n >= DRAIN_CAP) break;
      if (Game.tbfight && !Game.tbfight.over) break;
      const tc = (Game.state.scholar || {}).tableChoices;
      if (!tc || !tc.options || !tc.options.length || !Game.chooseTableOption) break;
      const sig = tc.frame + '|' + tc.options.map(o => o.id).join(',');
      if (sig === lastSig && ++stall >= 2) break;
      lastSig = sig;
      const opt = pickTableOption(tc, Game);
      if (!opt) {
        logEvent({ day: gdayOf(Game), kind: 'drain-blocked', frame: tc.frame || null,
          options: tc.options.map(o => o.id).slice(0, 8) });
        break;
      }
      try { Game.chooseTableOption(opt.id); }
      catch (e) {
        logEvent({ day: gdayOf(Game), kind: 'drain-error', frame: tc.frame || null,
          reason: String((e && e.message) || e).slice(0, 80) });
        break;
      }
      n++;
      if (ctx) ctx.sitTableAnswers = (ctx.sitTableAnswers || 0) + 1;
      const ev = { day: gdayOf(Game), kind: 'drain-answer', frame: tc.frame || null,
        optionId: opt.id, label: (typeof opt.label === 'string') ? opt.label.slice(0, 120) : null };
      if (String(opt.id).indexOf('path:') === 0) {
        ev.path = opt.id.slice(5);
        if (ctx) ctx.sitTablePath = ev.path;
      }
      logEvent(ev);
    }
  } catch (e) {
    logEvent({ day: gdayOf(Game), kind: 'drain-error',
      reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80) });
  }
}

// driveSeat(Game, ctx): sit on the FIRST ready dawn — never wait
// for a better seat once the preview is ready. Returns the sit
// record, or null when no sit was attempted.
function driveSeat(Game, ctx) {
  const day = gdayOf(Game);
  try {
    if (typeof Game.tablePreview !== 'function' || typeof Game.tableTakeSeat !== 'function') return null;
    let pv = null;
    try { pv = Game.tablePreview(); }
    catch (e) { logEvent({ day, kind: 'sit-error', reason: String((e && e.message) || e).slice(0, 80) }); return null; }
    if (!pv) return null; // null before day 90, or no seat priced, or already seated
    logEvent({ day, kind: 'preview', seat: pv.seat || null, ready: !!pv.ready,
      why: (typeof pv.why === 'string' && pv.why) ? pv.why.slice(0, 120) : null,
      fullReady: !!pv.fullReady });
    if (!pv.ready) return null;
    if (!scholarAlive(Game)) { logEvent({ day, kind: 'sit-no-scholar' }); return null; }
    if (!canPropose(Game)) { logEvent({ day, kind: 'sit-guard' }); return null; }
    let r = null;
    try { r = Game.tableTakeSeat(); }
    catch (e) { logEvent({ day, kind: 'sit-error', reason: String((e && e.message) || e).slice(0, 80) }); return null; }
    if (r && r.ok) {
      logEvent({ day, kind: 'sit-ok', seat: pv.seat || null });
      if (ctx) { ctx.sitSeatTaken = (ctx.sitSeatTaken || 0) + 1; ctx.sitSeatDay = day; ctx.sitSeatKind = pv.seat || null; }
      drainTableChoices(Game, ctx);
      return { ok: true, day, seat: pv.seat || null };
    }
    logEvent({ day, kind: 'sit-failed', msg: (r && typeof r.msg === 'string') ? r.msg.slice(0, 120) : null });
    return { ok: false, day, seat: pv.seat || null };
  } catch (e) {
    logEvent({ day, kind: 'sit-error', reason: 'policy-threw:' + String((e && e.message) || e).slice(0, 80) });
    return null;
  }
}

// waitLeg(Game, ctx): while the table waits and the seat is not
// taken, end the day at Haven so the next dawn can sit. Mirrors
// the tableseat WAIT leg.
function waitLeg(Game, ctx) {
  const day = gdayOf(Game);
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (pg.tableDone || !pg.tableWaiting) return;
    const ev = { day, kind: 'wait', atHaven: false, returned: false, stranded: false };
    if (atHaven(Game)) {
      ev.atHaven = true;
    } else {
      try { walkTo(Game, HAVEN_X, HAVEN_Y); } catch (e) { ev.walkErr = String((e && e.message) || e).slice(0, 80); }
      if (atHaven(Game)) ev.returned = true;
      else ev.stranded = true;
    }
    logEvent(ev);
    if (ctx) {
      ctx.sitWaitDays = (ctx.sitWaitDays || 0) + 1;
      if (ev.atHaven) ctx.sitWaitAtHaven = (ctx.sitWaitAtHaven || 0) + 1;
      if (ev.returned) ctx.sitWaitReturns = (ctx.sitWaitReturns || 0) + 1;
      if (ev.stranded) ctx.sitWaitStranded = (ctx.sitWaitStranded || 0) + 1;
    }
  } catch (e) {
    logEvent({ day, kind: 'wait-error', reason: String((e && e.message) || e).slice(0, 80) });
  }
}

const competentSit = Object.assign({}, competent, {
  id: 'competent-sit',
  desc: 'competent verbatim + sit at the table when the lesser seat is offered (deliver capstone, answer court beats, buy the feast bundle, play the table first-option; sim-sitpolicy-a)',
  daily(Game, ctx) {
    // A modal pending from a previous dawn is played FIRST — the
    // table is never left mid-challenge while the dawn verbs run.
    // If the drain leaves a modal pending (or a fight is live),
    // the dawn verbs are skipped: the table owns this dawn.
    try { drainTableChoices(Game, ctx); } catch (e) {}
    let blocked = false;
    try {
      const tc = (Game.state.scholar || {}).tableChoices;
      if ((tc && tc.options && tc.options.length) || (Game.tbfight && !Game.tbfight.over)) blocked = true;
    } catch (e) {}
    if (!blocked) {
      try { answerCourtBeat(Game); } catch (e) {}
      try { tryBuyBundle(Game); } catch (e) {}
      try { tryDeliverCapstone(Game); } catch (e) {}
      try { driveSeat(Game, ctx); } catch (e) {}
    }
    // A win during the sit leg ends the run — do not run the day's
    // trips into a won game.
    if (Game.over) return;
    const r = competent.daily(Game, ctx);
    try { waitLeg(Game, ctx); } catch (e) {}
    return r;
  },
});

module.exports = {
  competentSit, sitLog, resetSitLog, sitLogSlice,
  tryDeliverCapstone, tryBuyBundle, answerCourtBeat,
  drainTableChoices, pickTableOption, driveSeat, waitLeg,
  NATIONAL_ANSWERS, CAPSTONE_KINDS, BUNDLE_COST, BUNDLE_MIN_PANTRY,
  deliverableOf,
};
