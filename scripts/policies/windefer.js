// windefer — deferral-window discipline layer (sim-findings #310,
// 2026-10-15, scale-onramp axis).
//
// sim-findings #310: the winpursuit drain answers the table offer the dawn
// it appears. When a path resolves before the win-day floor (day 90) the
// engine's winDayFloorDefer opens a waiting window of (90 - day) days until
// the re-offer. Table sanctity holds during the window (ambient monster
// pressure suspended — TABLE.md) but disease, starvation and wounds do NOT
// stop: belongfeast s22 deferred at d60 and the village DIED d85 before the
// d90 re-offer ('deferred-died'). The waiting period is a lame-duck window
// of up to 30+ days.
//
// Env-gated WINDEFER=1 (default OFF — unset delegates to the base policy
// byte-identically; the proof pins that). The layer reproduces the
// winpursuit drain (winseek's tableRoad at the start of daily, then the
// base daily) and intercepts ONLY the walk-now-vs-defer decision at the
// 7-door offer:
//
//   At the offer (phase 'paths', no path entered, offer modal pending) with
//   the floor unmet (day < 90), answering now resolves the challenge today
//   (the drain plays every beat in one daily) and the deferral window
//   opens. The layer estimates the window's lethality from current village
//   state:
//     - disease load: villagers with active sickness (v.sick daysLeft > 0)
//     - wounded roster: living villagers below 75 on the village health map
//     - pantry fresh-days: Game.pantryFreshDays() against the window length
//     - scholar status: scholar sick or scholar.health below 50
//   DEFER (hold the offer unanswered until the floor) ONLY when the window
//   is plausibly survivable; otherwise WALK NOW (drain immediately — a
//   village that cannot survive the wait cannot afford to wait; the
//   challenge's grants and the deferral machinery are the remaining lever).
//
// Discipline notes:
//   - Never re-picks doors (a sibling arm owns path selection — the drain's
//     options[0] behavior is untouched).
//   - Never stalls mid-challenge: the hold applies ONLY to the unanswered
//     7-door offer (every option id 'path:'); downgrade/finals modals drain.
//   - Day >= 90: never hold (the floor is met — walk).
//   - Read-only except the ctx decision log: with WINDEFER=1 and zero holds
//     fired, runs are byte-identical to the winpursuit control on identical
//     seeds (the det-gate proves it).
//
// POLICY-SIDE ONLY — zero src/js changes. NEVER edit winpursuit.js.
'use strict';
const FS = require('./feastscale');
const { tableRoad } = require('./winseek');

function layerOn() { return process.env.WINDEFER === '1'; }

function policyForRun() {
  const pid = String(process.env.POLICY || 'belongseek').toLowerCase();
  return pid.indexOf('lead') === 0 ? FS.leadfeast : FS.belongfeast;
}

function livingRoster(Game) {
  const out = [];
  try {
    const v = Game.state.village || {};
    for (const vid of (v.roster || [])) {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p || p.dead) continue;
      out.push({ vid, p });
    }
  } catch (e) {}
  return out;
}

// Window lethality estimate — read-only. The window is (90 - day) days of
// disease/starvation/wound exposure (sanctity covers monsters, not these).
function windowLethality(Game) {
  const L = {
    day: 0, window: 0, pop: 0, sick: 0, wounded: 0, freshDays: 0,
    scholarSick: false, scholarHpFrac: 1, survivable: false, why: [],
  };
  try {
    const s = Game.state.scholar || {};
    L.day = s.day || 0;
    L.window = 90 - L.day;
    const v = Game.state.village || {};
    const sickMap = v.sick || {};
    const healthMap = v.health || {};
    const ros = livingRoster(Game);
    L.pop = ros.length;
    for (const r of ros) {
      // Disease load: active sickness on the village sick map.
      if ((((sickMap[r.vid] || {}).daysLeft) || 0) > 0) L.sick++;
      // Wounded roster: village health map (0–100, default 100 for the
      // never-hurt). Person records carry no combat hp outside fights —
      // v.health[vid] is the real store (hurtVillager).
      const h = (healthMap[r.vid] !== undefined) ? healthMap[r.vid] : 100;
      if (h < 75) L.wounded++;
    }
    try { L.freshDays = (typeof Game.pantryFreshDays === 'function') ? Game.pantryFreshDays() : 0; } catch (e) {}
    const sid = Game.villagerId;
    L.scholarSick = sid ? (((((v.sick || {})[sid] || {}).daysLeft) || 0) > 0) : false;
    // Scholar status: scholar.health is the real pool (0–100); v.health[sid]
    // is kept synced by hurtVillager. bloodPriceWound is a separate ledger
    // (the Price's cuts) — not counted here.
    const sHealth = (s.health !== undefined) ? s.health : 100;
    L.scholarHpFrac = sHealth / 100;
    const scholarOk = !L.scholarSick && sHealth >= 50;
    if (L.sick > 0) L.why.push(L.sick + ' sick');
    if (L.wounded > 1) L.why.push(L.wounded + ' wounded');
    if (!(L.freshDays >= L.window)) L.why.push('pantry ' + Number(L.freshDays).toFixed(1) + 'd < window ' + L.window + 'd');
    if (!scholarOk) L.why.push(L.scholarSick ? 'scholar sick' : 'scholar health ' + Math.round(sHealth));
    L.survivable = L.sick === 0 && L.wounded <= 1 && (L.freshDays >= L.window) && scholarOk;
    if (L.survivable) L.why.push('window plausibly survivable');
  } catch (e) {
    L.why.push('estimator error: ' + String((e && e.message) || e).slice(0, 80));
  }
  return L;
}

// Is the unanswered 7-door offer pending? (phase 'paths', no path entered,
// every option a 'path:' door — never the downgrade/finals modals.)
function offerPending(Game) {
  try {
    const T = Game.tableState ? Game.tableState() : {};
    if ((T.phase || '') !== 'paths' || T.path) return false;
    const tc = (Game.state.scholar || {}).tableChoices;
    const opts = (tc && tc.options) || [];
    if (!opts.length) return false;
    return opts.every(o => String((o && o.id) || '').indexOf('path:') === 0);
  } catch (e) { return false; }
}

// The walk-now-vs-defer decision. {hold, reason, ...}; hold=true means
// defer the walk (skip the drain today — the offer stays pending).
function shouldHoldOffer(Game) {
  const d = { hold: false, reason: 'no-offer', day: 0, window: 0, L: null };
  try {
    d.day = (Game.state.scholar || {}).day || 0;
    if (!offerPending(Game)) return d;
    if (d.day >= 90) { d.reason = 'floor-met'; return d; }
    const L = windowLethality(Game);
    d.L = L; d.window = L.window;
    if (L.survivable) { d.hold = true; d.reason = 'defer-survivable'; }
    else { d.hold = false; d.reason = 'walk-now'; }
  } catch (e) { d.reason = 'error-walk'; }
  return d;
}

function ensureWD(ctx) {
  let WD = ctx._windefer;
  if (!WD) WD = ctx._windefer = { decisions: [] };
  return WD;
}

function withWinDefer(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      let dec = null;
      try { dec = shouldHoldOffer(Game); } catch (e) { dec = { hold: false, reason: 'error-walk', day: 0 }; }
      // Log only real offer decisions (not the 170 no-offer dawns).
      if (dec.reason !== 'no-offer') {
        try {
          const WD = ensureWD(ctx);
          WD.decisions.push({
            day: dec.day, hold: !!dec.hold, reason: dec.reason, window: dec.window | 0,
            sick: dec.L ? dec.L.sick : -1, wounded: dec.L ? dec.L.wounded : -1,
            pop: dec.L ? dec.L.pop : -1,
            freshDays: dec.L ? +Number(dec.L.freshDays || 0).toFixed(1) : -1,
            scholarHp: dec.L ? +Number(dec.L.scholarHpFrac || 0).toFixed(2) : -1,
            why: dec.L ? dec.L.why.join('; ') : '',
          });
          if (WD.decisions.length > 400) WD.decisions.splice(0, WD.decisions.length - 400);
        } catch (e) {}
      }
      // The winpursuit drain, reproduced exactly (tableRoad at dawn, then
      // the base daily) — skipped only on a hold day.
      if (!dec.hold) { try { tableRoad(Game, ctx); } catch (e) {} }
      return base.daily(Game, ctx);
    },
  });
}

const leaddefer = withWinDefer(FS.leadfeast, 'leadfeast-windefer',
  'leadfeast + deferral-window discipline (WINDEFER=1): holds the table offer pre-floor only when the window is survivable');
const belongdefer = withWinDefer(FS.belongfeast, 'belongfeast-windefer',
  'belongfeast + deferral-window discipline (WINDEFER=1): holds the table offer pre-floor only when the window is survivable');

module.exports = {
  layerOn, policyForRun, withWinDefer,
  shouldHoldOffer, windowLethality, offerPending,
  leaddefer, belongdefer,
};
