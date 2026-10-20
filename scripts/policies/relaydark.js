// relaydark — the dark-relay road (sim-tablepathdriver, 2026-10-20,
// flesh-out loop, axis scale-onramp, lever-10 win-path end to end).
//
// THE GAP (sim-seatdrive-posttable + sim-tablepaths, 2026-10-19): dark
// branches are unexercised everywhere. Per docs/TABLE.md the light/dark
// axis is "earned through play — never a menu choice", and the relay is
// the ONE path whose dark side resolves on play the policy can actually
// do: relay verbs (comms.js/relay-ext.js — the same verbs app.js wires to
// the relay panel buttons), not the moral ledger. tableBranch('relay')
// reads: darkUses > lightUses (+3 dark), grounding < 50 (+2 dark), and the
// GRADIENT band (relayLean <= -40, +3 dark). This layer plays the relay
// dark through the real verb surface — claim, reroute-efficient,
// relayDeepen, rewrite, skim — and records whether the road completes.
//
// THE PROGRAM (pre-registered, POLICY-SIDE, not canon):
//   1. claim the relay when switchboardAvailable() (needs a linked
//      village — the engine says so aloud otherwise; the layer waits).
//   2. bond: relayDeepen() until sysBond >= 2 (the relay door needs
//      sysBond >= 2; deepen is +1 bond, -3 grounding, 25% backfire).
//   3. unlock: relayReroute('efficient') until switchboard.delayed >= 3
//      (unlocks rewrite) AND switchboard.routed >= 15 (unlocks skim).
//      Efficient moves lean -2 each (darkOpen = lean < 40 holds).
//   4. dark uses: rewrite/skim until lean <= -44 AND grounding <= 48 AND
//      darkUses >= 6. Each use: -4 lean, -4 grounding (the two-way cost,
//      real). Holding the relay also ticks -1 grounding/day (relayTick).
// TARGETS (with margin): lean <= -44 (band dark at <= -40), grounding <=
// 48 (< 50), darkUses >= 6 > lightUses (= 0). FLOOR: grounding <= 32 stops
// the verbs (never drive to estranged on purpose — the pilot measures
// whether the targets are reachable above the floor).
// STOP: the layer goes quiet once the invitation is staged
// (tablePreview() non-null) or the seat is taken — the road is over; it
// never perturbs the table window. It never touches the ledger, the
// branch, or any door choice.
//
// COMPOSITION: withRelayDark wraps the tribfloor base INSIDE the windefer
// wrap (driver -> seatdrive -> windefer -> relaydark -> base). The `active`
// composition param gates the layer per run (the sweep activates it only
// on relay-assigned runs); RELAYDARK=1 is the env on-switch. Default-OFF:
// RELAYDARK unset (or active=false) delegates to the base byte-identically
// (pinned by the probe's DET/FIDELITY=1 gates).
//
// POLICY-SIDE ONLY — zero src/js changes, zero new RNG draws (the layer
// never calls Math.random; the verbs draw the engine's seeded RNG).
// NEVER edit seatdrive.js, windefer.js, or tablepaths.js.
'use strict';

function layerOn() { return process.env.RELAYDARK === '1'; }

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// relayState(Game): the dark-road state. PURE reads — also used by the
// probe at sitting time.
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

function ensureRD(ctx) {
  let RD = ctx._relaydark;
  if (!RD) {
    RD = ctx._relaydark = {
      active: false, claimed: 0, claimDay: null, claimAttempts: 0, claimFailed: 0,
      waitingLink: 0, held: 0, deepens: 0, efficients: 0, rewrites: 0, skims: 0,
      nullVerbs: 0, verbError: 0, noDarkAbil: 0,
      done: 0, doneDay: null, floorStop: 0, stoppedTable: 0,
      lean: null, grounding: null, darkUses: 0, lightUses: 0, bond: 0, stage: 0,
    };
  }
  return RD;
}

// relayDarkDaily: one verb per day, play-like cadence. Read-only until the
// verb itself; every early exit is classified in ctx (never an attempt).
function relayDarkDaily(Game, ctx, params) {
  params = params || {};
  if (!layerOn() || !params.active) return; // gate off or not this run: pure delegation — never touch ctx
  const RD = ensureRD(ctx);
  RD.active = true;
  if (Game.over) return;
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return;
  // The road ends where the table begins: once the invitation is staged
  // the layer goes quiet (never perturb the table window).
  let pv = null;
  try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
  if (pv) { RD.stoppedTable = 1; return; }
  if (RD.done || RD.floorStop) return;

  // 1. claim.
  let st = relayState(Game);
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

  // 2. completion check (targets with margin, per the pre-registered program).
  if (st.lean != null && st.lean <= -44 && st.grounding != null && st.grounding <= 48 &&
      st.darkUses >= 6 && (st.bond | 0) >= 2) {
    RD.done = 1; RD.doneDay = gday(Game);
    return;
  }
  // 3. grounding floor — never drive to estranged on purpose.
  if (st.grounding != null && st.grounding <= 32) { RD.floorStop = 1; return; }

  // 4. one verb per day.
  let acted = null, tried = false;
  try {
    if ((st.bond | 0) < 2 && typeof Game.relayDeepen === 'function') {
      acted = Game.relayDeepen(); tried = true; RD.deepens = (RD.deepens | 0) + 1;
    } else if ((st.delayed < 3 || st.routed < 15) && typeof Game.relayReroute === 'function') {
      acted = Game.relayReroute('efficient'); tried = true; RD.efficients = (RD.efficients | 0) + 1;
    } else if (st.darkUses < 6 || st.lean == null || st.lean > -44 || st.grounding == null || st.grounding > 48) {
      const hasR = st.hasRewrite, hasS = st.hasSkim;
      if (hasR && (st.lean == null || st.lean > -44 || (RD.rewrites | 0) <= (RD.skims | 0)) && typeof Game.relayRewrite === 'function') {
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

function withRelayDark(base, id, desc, params) {
  params = params || {};
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      try { relayDarkDaily(Game, ctx, params); } catch (e) { ctx.rdError = (ctx.rdError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

module.exports = { layerOn, withRelayDark, relayDarkDaily, relayState, ensureRD };
