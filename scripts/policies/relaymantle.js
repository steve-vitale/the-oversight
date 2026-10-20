// relaymantle — the dark-relay road with a parameterized grounding floor
// (sim-relaymantle, 2026-10-20, flesh-out loop, axis scale-onramp,
// lever-10 win-path end to end).
//
// THE STUDY (named nexts #4 + #5 of sim-tablepathdriver, 2026-10-20):
//   #4 — the pilot's 4/5 dark walks passed the mantle mid-road: the
//   mechanism works (lean persists in relay state) but the burn rate is
//   the price of the road. Is the grounding floor-stop (<=32) too
//   permissive? This layer parameterizes the floor (and the targets) so
//   the arms floor32 / floor44 / floor56 can be compared on identical
//   seeds: road completion, mid-road bearer deaths, dark-band sittings,
//   mantle passes, terminal resolution, win-side impact.
//   #5 — PROBE HYGIENE, the done-before-invitation fix: the pilot's
//   relayDarkDaily checked the invitation-stop BEFORE the completion
//   check, leaving done=0 on leadfeast-s64203 though the state was fully
//   dark at sitting (the invitation staged the same day the road
//   completed). THE FIX: the completion check is a PURE READ evaluated
//   BEFORE the invitation-stop. The layer still goes quiet once the
//   invitation is staged (no verbs past it — the road ends where the
//   table begins); only the RECORD is ordered first. The trajectory is
//   unchanged by the reorder (no verbs fire either way on that day); the
//   done/doneDay record becomes truthful.
//
// THE PROGRAM (pre-registered, POLICY-SIDE, not canon) — same as the
// pilot's relaydark, parameterized:
//   1. claim the relay when switchboardAvailable().
//   2. bond: relayDeepen() until sysBond >= bondTarget (default 2).
//   3. unlock: relayReroute('efficient') until switchboard.delayed >= 3
//      AND switchboard.routed >= 15.
//   4. dark uses: rewrite/skim until lean <= leanTarget (default -44) AND
//      grounding <= groundTarget (default 48) AND darkUses >=
//      darkUsesTarget (default 6).
// TARGETS (with margin): lean <= leanTarget (band dark at <= -40),
// grounding <= groundTarget (< 50, the engine's dark signal), darkUses >=
// darkUsesTarget > lightUses (= 0).
// FLOOR (the study's question): grounding <= floor (default 32, the
// pilot's value; arms 44 and 56) stops the verbs — never drive deeper on
// purpose. Evaluated AFTER the completion check (a completed road is done,
// the floor is moot) and BEFORE any verb.
// STOP: the layer goes quiet once the invitation is staged
// (tablePreview() non-null) or the seat is taken — the road is over; it
// never perturbs the table window. It never touches the ledger, the
// branch, or any door choice.
//
// BURN RECORDS (for the mantle join): minGrounding (the deepest grounding
// seen while active), verb counts, doneDay/floorStopDay, stoppedTable.
//
// COMPOSITION: withRelayMantle wraps the tribfloor base INSIDE the windefer
// wrap (driver -> seatdrive -> windefer -> relaymantle -> base) — the same
// slot relaydark occupied in the pilot. The `active` composition param
// gates the layer per run; RELAYMANTLE=1 is the env on-switch;
// RELAYMANTLE_FLOOR sets the floor (default 32). Default-OFF: RELAYMANTLE
// unset (or active=false) delegates to the base byte-identically (pinned
// by the probe's DET/FIDELITY gates).
//
// POLICY-SIDE ONLY — zero src/js changes, zero new RNG draws (the layer
// never calls Math.random; the verbs draw the engine's seeded RNG).
// NEVER edit seatdrive.js, windefer.js, tablepaths.js, tablepathdriver.js,
// or relaydark.js.
'use strict';

function layerOn() { return process.env.RELAYMANTLE === '1'; }
function floorOf() {
  const f = parseInt(process.env.RELAYMANTLE_FLOOR || '32', 10);
  return Number.isFinite(f) ? f : 32;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// relayState(Game): the dark-road state. PURE reads — also used by the
// probe at sitting time. (Copied from relaydark.js — the read surface is
// identical; the write surface is what's new.)
function relayState(Game) {
  const s = { held: false, lean: null, band: null, grounding: null, darkUses: 0, lightUses: 0, bond: 0, stage: 0, delayed: 0, routed: 0, hasRewrite: false, hasSkim: false };
  try {
    s.held = !!(typeof Game.relayHeldByBearer === 'function' && Game.relayHeldByBearer());
    s.lean = (typeof Game.relayLean === 'function') ? Game.relayLean() : null;
    s.band = (typeof Game.relayBand === 'function') ? Game.relayBand() : null;
    s.grounding = (typeof Game.grounding === 'function') ? Game.grounding() : null;
    const ra = ((Game.state || {}).scholar || {}).relayAbils || {};
    s.darkUses = ((ra.rewrite || {}).uses | 0) + ((ra.skim || {}).uses | 0) + ((ra.omnipresence || {}).uses | 0);
    s.lightUses = ((ra.translate || {}).uses | 0) + ((ra.sanctuary || {}).uses | 0) + ((ra.advocate || {}).uses | 0);
    s.bond = (typeof Game.sysBond === 'function') ? Game.sysBond() : 0;
    s.stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0;
    const sw = (typeof Game.switchboard === 'function') ? Game.switchboard() : null;
    if (sw) { s.delayed = sw.delayed | 0; s.routed = sw.routed | 0; }
    s.hasRewrite = !!(typeof Game.relayHas === 'function' && Game.relayHas('rewrite'));
    s.hasSkim = !!(typeof Game.relayHas === 'function' && Game.relayHas('skim'));
  } catch (e) {}
  return s;
}

function ensureRM(ctx) {
  let RM = ctx._relaymantle;
  if (!RM) {
    RM = ctx._relaymantle = {
      active: false, claimed: 0, claimDay: null, claimAttempts: 0, claimFailed: 0,
      waitingLink: 0, held: 0, deepens: 0, efficients: 0, rewrites: 0, skims: 0,
      nullVerbs: 0, verbError: 0, noDarkAbil: 0,
      done: 0, doneDay: null, floorStop: 0, floorStopDay: null, stoppedTable: 0,
      floor: null, lean: null, grounding: null, minGrounding: null,
      darkUses: 0, lightUses: 0, bond: 0, stage: 0,
    };
  }
  return RM;
}

// doneTargetsMet(st, P): the pre-registered completion predicate. PURE.
function doneTargetsMet(st, P) {
  return !!(st && st.held && st.lean != null && st.lean <= P.leanTarget &&
    st.grounding != null && st.grounding <= P.groundTarget &&
    st.darkUses >= P.darkUsesTarget && (st.bond | 0) >= P.bondTarget);
}

function defaults(P) {
  P = P || {};
  return {
    active: !!P.active,
    floor: (P.floor != null) ? P.floor : floorOf(),
    leanTarget: (P.leanTarget != null) ? P.leanTarget : -44,
    groundTarget: (P.groundTarget != null) ? P.groundTarget : 48,
    darkUsesTarget: (P.darkUsesTarget != null) ? P.darkUsesTarget : 6,
    bondTarget: (P.bondTarget != null) ? P.bondTarget : 2,
  };
}

// relayMantleDaily: one verb per day, play-like cadence. Read-only until
// the verb itself; every early exit is classified in ctx (never an
// attempt).
function relayMantleDaily(Game, ctx, params) {
  params = params || {};
  if (!layerOn() || !params.active) return; // gate off or not this run: pure delegation — never touch ctx
  const P = defaults(params);
  const RD = ensureRM(ctx);
  RD.active = true;
  if (RD.floor == null) RD.floor = P.floor;
  if (Game.over) return;
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return;
  if (RD.done || RD.floorStop) return;

  // ---- THE #5 FIX: completion BEFORE the invitation-stop. ----
  // The completion check is a PURE READ. The pilot evaluated the
  // invitation-stop first, so a road that completed the same day the
  // invitation staged was recorded done=0 (s64203). Evaluating done first
  // makes the record truthful; the layer still goes quiet below (no verbs
  // past the invitation). Trajectory-neutral: no verb fires on that day
  // either way.
  let st = relayState(Game);
  if (st.held) {
    if (RD.minGrounding == null || (st.grounding != null && st.grounding < RD.minGrounding)) RD.minGrounding = st.grounding;
    if (doneTargetsMet(st, P)) { RD.done = 1; RD.doneDay = gday(Game); return; }
  }
  // The road ends where the table begins: once the invitation is staged
  // the layer goes quiet (never perturb the table window).
  let pv = null;
  try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
  if (pv) { RD.stoppedTable = 1; return; }

  // 1. claim.
  if (!st.held) {
    let avail = false;
    try { avail = (typeof Game.switchboardAvailable === 'function') ? Game.switchboardAvailable() : false; } catch (e) {}
    if (!avail) { RD.waitingLink = (RD.waitingLink | 0) + 1; return; }
    RD.claimAttempts = (RD.claimAttempts | 0) + 1;
    let r = null;
    try { r = (typeof Game.claimRelay === 'function') ? Game.claimRelay() : null; }
    catch (e) { RD.verbError = (RD.verbError | 0) + 1; return; }
    if (r) { RD.claimed = 1; RD.claimDay = gday(Game); }
    else { RD.claimFailed = (RD.claimFailed | 0) + 1; return; }
    st = relayState(Game);
    if (!st.held) { RD.claimFailed = (RD.claimFailed | 0) + 1; return; }
  }
  RD.held = 1;
  RD.lean = st.lean; RD.grounding = st.grounding; RD.darkUses = st.darkUses;
  RD.lightUses = st.lightUses; RD.bond = st.bond; RD.stage = st.stage;
  if (RD.minGrounding == null || (st.grounding != null && st.grounding < RD.minGrounding)) RD.minGrounding = st.grounding;

  // 2. completion check (targets with margin, per the pre-registered program).
  if (doneTargetsMet(st, P)) {
    RD.done = 1; RD.doneDay = gday(Game);
    return;
  }
  // 3. grounding floor — never drive deeper on purpose. Evaluated AFTER
  // the completion check (a completed road is done; the floor is moot).
  if (st.grounding != null && st.grounding <= P.floor) {
    RD.floorStop = 1; RD.floorStopDay = gday(Game);
    return;
  }

  // 4. one verb per day.
  let acted = null, tried = false;
  try {
    if ((st.bond | 0) < P.bondTarget && typeof Game.relayDeepen === 'function') {
      acted = Game.relayDeepen(); tried = true; RD.deepens = (RD.deepens | 0) + 1;
    } else if ((st.delayed < 3 || st.routed < 15) && typeof Game.relayReroute === 'function') {
      acted = Game.relayReroute('efficient'); tried = true; RD.efficients = (RD.efficients | 0) + 1;
    } else if (st.darkUses < P.darkUsesTarget || st.lean == null || st.lean > P.leanTarget || st.grounding == null || st.grounding > P.groundTarget) {
      const hasR = st.hasRewrite, hasS = st.hasSkim;
      if (hasR && (st.lean == null || st.lean > P.leanTarget || (RD.rewrites | 0) <= (RD.skims | 0)) && typeof Game.relayRewrite === 'function') {
        acted = Game.relayRewrite(); tried = true; RD.rewrites = (RD.rewrites | 0) + 1;
      } else if (hasS && typeof Game.relaySkim === 'function') {
        acted = Game.relaySkim(); tried = true; RD.skims = (RD.skims | 0) + 1;
      } else if (hasR && typeof Game.relayRewrite === 'function') {
        acted = Game.relayRewrite(); tried = true; RD.rewrites = (RD.rewrites | 0) + 1;
      } else {
        RD.noDarkAbil = (RD.noDarkAbil | 0) + 1;
      }
    }
  } catch (e) { RD.verbError = (RD.verbError | 0) + 1; }
  if (tried && acted == null) RD.nullVerbs = (RD.nullVerbs | 0) + 1;
}

function withRelayMantle(base, id, desc, params) {
  params = params || {};
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      try { relayMantleDaily(Game, ctx, params); } catch (e) { ctx.rmError = (ctx.rmError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

module.exports = { layerOn, floorOf, withRelayMantle, relayMantleDaily, relayState, ensureRM, doneTargetsMet, defaults };
