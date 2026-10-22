// relaygrey — the grey-road layer (journey-endgame r40, lane B, 2026-10-22).
//
// THE GAP: the relay path's leaning gradient has three bands; light (r39)
// and dark (sim-tablepathdriver, 10 terminal) are walked. Grey — "the
// pragmatist's both-hands endings," "not a coin flip, not a lesser frame"
// (TABLE.md GRADIENT law; src/js/table-relay.js) — has never been walked.
//
// THE PROGRAM (pre-registered, POLICY-SIDE, not canon): play the relay as a
// pragmatist.
//   1. CLAIM: when switchboardAvailable() (needs a linked village; the
//      engine says so aloud otherwise — the layer waits).
//   2. DEEPEN: relayDeepen() until sysBond >= 2 (the relay door needs it).
//   3. THERMOSTAT: the leaning meter is player-visible (relayLeanLabel in
//      the relay panel; relayLeanNoticed voices every band change — the
//      System tells you when you're drifting). A pragmatist who reads
//      those notices self-corrects: lean > +10 → relayReroute('efficient')
//      (-2); lean < -10 → relayReroute('honest') (+2, +1 grounding).
//      Efficient reroutes are the relay's real work — carrying the
//      village's words faster. Never the dark verbs (rewrite/skim/
//      omnipresence) — the layer never calls them.
//   4. COMMUNE: answer pendingRelayScene with the least-extreme choice
//      (smallest |lean| — usually 'deflect'): the pragmatist refuses both
//      the tender sermon and the total shortcut. The authored grey anthem
//      ("Whichever hand the village needs.", lean 0) is in the choice set.
//   5. GROUNDING FLOOR: at grounding() <= 30 the layer pulls back — no
//      deepen, no efficient (only honest reroutes + commune answers, which
//      restore grounding). The two-way cost is real; the pragmatist feels
//      it and eases off.
//   6. THE DOOR: at the table's path offer, walk 'path:relay' — the
//      pragmatist walks the door they built. The cockpit beats are steered
//      by the same thermostat (deepen/probe/efficient/honest; merge 2s
//      preferred; honest when leaning low). The grey final is answered
//      'both-hands' — the flagship both-hands ending.
// TARGET (with margin): |lean| <= 30 at sitting, band 'grey', relay
// genuinely used (sysBond >= 2, >= 5 relay verbs, >= 1 commune answered).
//
// COMPOSITION: withRelayGrey wraps the capable base (daily + the
// chooseTableOption interceptor installed by the probe). RELAYGREY=1 is
// the env on-switch. Default-OFF: unset delegates to the base
// byte-identically (pinned by the probe's DET/FIDELITY=1 gates).
//
// POLICY-SIDE ONLY — zero src/js changes, zero new RNG draws (the layer
// never calls Math.random; the verbs draw the engine's seeded RNG).
'use strict';

function layerOn() { return process.env.RELAYGREY === '1'; }

function gday(Game) { try { return ((Game.state.scholar || {}).day || 0); } catch (e) { return 0; } }

function ensureRG(ctx) {
  let RG = ctx._relaygrey;
  if (!RG) {
    RG = ctx._relaygrey = {
      active: false,
      claimTried: 0, claimDone: 0, claimDay: null, claimWaiting: 0,
      firstAvailableDay: null, lastCommuneDay: -99,
      deepens: 0, deepensErr: 0,
      rerouteEff: 0, rerouteHon: 0, rerouteErr: 0,
      communes: 0, communeLean: [],
      leanTrace: [],           // {day, lean, band, grounding, bond} — daily
      floorStops: 0,
      doorRelay: 0, doorDelegated: 0,
      cockpitPicks: {},        // verb id -> count
      finalPick: null,
      stoppedTable: 0, quietExile: 0,
      rgError: 0,
    };
  }
  return RG;
}

function leanOf(Game) { try { return (typeof Game.relayLean === 'function') ? Game.relayLean() : 0; } catch (e) { return 0; } }
function bandOf(Game) { try { return (typeof Game.relayBand === 'function') ? Game.relayBand() : 'grey'; } catch (e) { return 'grey'; } }
function groundingOf(Game) { try { return (typeof Game.grounding === 'function') ? Game.grounding() : 100; } catch (e) { return 100; } }
function bondOf(Game) { try { return (typeof Game.sysBond === 'function') ? Game.sysBond() : 0; } catch (e) { return 0; } }
function heldBy(Game) { try { return (typeof Game.relayHeldByBearer === 'function') ? !!Game.relayHeldByBearer() : false; } catch (e) { return false; } }
function backfiresOf(Game) { try { return ((((Game.state || {}).scholar || {}).relay || {}).backfires | 0); } catch (e) { return 0; } }

// answerPendingScene(Game, RG): the pragmatist's answer — the choice with
// the smallest |lean| nudge. Returns the choice id or null.
function answerPendingScene(Game, RG) {
  try {
    const p = (typeof Game.pendingRelayScene === 'function') ? Game.pendingRelayScene() : null;
    if (!p || !p.resolved || !Array.isArray(p.resolved.choices) || !p.resolved.choices.length) return null;
    let best = null, bestAbs = Infinity;
    for (const c of p.resolved.choices) {
      const a = Math.abs(c.lean | 0);
      if (a < bestAbs) { bestAbs = a; best = c; }
    }
    if (!best) return null;
    const before = leanOf(Game);
    const r = (typeof Game.relayAnswer === 'function') ? Game.relayAnswer(best.id) : null;
    if (r === 'answered') {
      RG.communes = (RG.communes | 0) + 1;
      RG.communeLean.push({ day: gday(Game), choice: best.id, lean: best.lean | 0, before, after: leanOf(Game) });
      return best.id;
    }
    return null;
  } catch (e) { RG.rgError = (RG.rgError | 0) + 1; return null; }
}

// relayGreyDaily: the road's verbs, one day at a time.
function relayGreyDaily(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never touch ctx
  const RG = ensureRG(ctx);
  RG.active = true;
  if (Game.over) return;
  const s = Game.state.scholar || {};
  if (s.exiled) { RG.quietExile = 1; return; }
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  if (pg.tableDone) return;

  const day = gday(Game);
  // The road ends where the table begins: once the invitation is staged
  // the daily verbs go quiet (lean can't drift without verbs) — but the
  // System's check-ins still get answered, and the cockpit/final
  // interceptor (installed by the probe) owns the table walk.
  let pv = null;
  try { pv = (typeof Game.tablePreview === 'function') ? Game.tablePreview() : null; } catch (e) {}
  const held = heldBy(Game);

  if (!held) {
    // 1. CLAIM — wait for the region to link; the engine says so aloud.
    try {
      const avail = (typeof Game.switchboardAvailable === 'function') && Game.switchboardAvailable();
      if (avail && RG.firstAvailableDay == null) RG.firstAvailableDay = day;
      if (avail && typeof Game.claimRelay === 'function') {
        RG.claimTried = (RG.claimTried | 0) + 1;
        let r = null;
        try { r = Game.claimRelay(); } catch (e) { RG.rgError = (RG.rgError | 0) + 1; }
        // Belt and suspenders: the verb's return AND the holder read —
        // a mid-verb throw can leave the office held with a null return.
        if (r === 'claimed' || heldBy(Game)) { RG.claimDone = 1; RG.claimDay = day; }
        else RG.claimWaiting = (RG.claimWaiting | 0) + 1;
      } else {
        RG.claimWaiting = (RG.claimWaiting | 0) + 1;
      }
    } catch (e) { RG.rgError = (RG.rgError | 0) + 1; }
    return;
  }

  // lean trace (daily, small)
  try {
    if (!RG.leanTrace.length || RG.leanTrace[RG.leanTrace.length - 1].day !== day) {
      RG.leanTrace.push({ day, lean: leanOf(Game), band: bandOf(Game), grounding: groundingOf(Game), bond: bondOf(Game) });
      if (RG.leanTrace.length > 400) RG.leanTrace.splice(0, RG.leanTrace.length - 400);
    }
  } catch (e) {}

  // 4. COMMUNE — answer the System's scenes, pre-table and in the window.
  answerPendingScene(Game, RG);

  if (pv) { RG.stoppedTable = 1; return; } // road over; interceptor owns the walk

  const g = groundingOf(Game);
  const lean = leanOf(Game);
  // 5. GROUNDING FLOOR — pull back at <= 30: only honest work + answers.
  const floored = g <= 30;
  if (floored) RG.floorStops = (RG.floorStops | 0) + 1;

  try {
    // 2. DEEPEN to the door (sysBond >= 2), not past while healthy.
    if (bondOf(Game) < 2 && !floored && typeof Game.relayDeepen === 'function') {
      Game.relayDeepen();
      RG.deepens = (RG.deepens | 0) + 1;
    } else if (typeof Game.relayReroute === 'function' && !Game.tbfight) {
      let sw = null;
      try { sw = (typeof Game.switchboard === 'function') ? Game.switchboard() : null; } catch (e) {}
      const delayed = sw ? (sw.delayed | 0) : 0;
      // 3a. REAL WORK — messages are waiting: hurry them (efficient, -2).
      // 3b. THERMOSTAT — steer off the System's own lean notices.
      if (delayed >= 2 && !floored) { Game.relayReroute('efficient'); RG.rerouteEff = (RG.rerouteEff | 0) + 1; }
      else if (lean > 10 && !floored) { Game.relayReroute('efficient'); RG.rerouteEff = (RG.rerouteEff | 0) + 1; }
      else if (lean < -10) { Game.relayReroute('honest'); RG.rerouteHon = (RG.rerouteHon | 0) + 1; }
    }
    // 4b. COMMUNE CADENCE — the curiosity ladder (first 5) then check-ins
    // on the System's cadence. A pragmatist stays curious; the answers
    // stay least-extreme (answerPendingScene). Every other grey check-in
    // is the authored both-hands scene.
    if (!Game.tbfight && typeof Game.relayCommune === 'function'
        && (RG.communes | 0) < 8 && day - (RG.lastCommuneDay | 0) >= 6) {
      let pend = null;
      try { pend = (typeof Game.pendingRelayScene === 'function') ? Game.pendingRelayScene() : null; } catch (e) {}
      if (!pend) {
        try {
          const r = Game.relayCommune();
          if (r && r !== 'waiting') { RG.lastCommuneDay = day; }
        } catch (e) { RG.rgError = (RG.rgError | 0) + 1; }
      }
    }
  } catch (e) { RG.rerouteErr = (RG.rerouteErr | 0) + 1; }
}

// installRelayGreyChooser(Game, ctx): wrap Game.chooseTableOption so the
// pragmatist walks the door they built and steers the cockpit. Everything
// else delegates to the original (capable's word-scoring). Policy-side;
// the probe installs it after loadGame.
function installRelayGreyChooser(Game, ctx) {
  if (!layerOn()) return;
  const RG = ensureRG(ctx);
  const orig = Game.chooseTableOption.bind(Game);
  const COCKPIT = { probe: 1, honest: 1, efficient: 1, deepen: 1, commune: 1 };
  Game.chooseTableOption = function (id) {
    try {
      const tc = ((Game.state || {}).scholar || {}).tableChoices;
      const opts = (tc && tc.options) || [];
      const ids = opts.map(o => String(o.id || ''));
      // DOOR frame — walk the relay if it's offered.
      if (ids.some(x => x.indexOf('path:') === 0)) {
        if (ids.indexOf('path:relay') >= 0) {
          RG.doorRelay = (RG.doorRelay | 0) + 1;
          return orig('path:relay');
        }
        RG.doorDelegated = (RG.doorDelegated | 0) + 1;
        return orig(id);
      }
      // COCKPIT frames — option ids are 'beat:<verb>'. The build-aware
      // option can append a 6th choice, so match on >=3 cockpit verbs
      // rather than every-id.
      const stripped = ids.map(x => x.indexOf('beat:') === 0 ? x.slice(5) : x);
      const cockpitHits = stripped.filter(x => COCKPIT[x]).length;
      if (stripped.length >= 3 && cockpitHits >= 3
          && !ids.some(x => x.indexOf('path:') === 0)
          && !ids.some(x => x.indexOf('final:') === 0)) {
        const pick = cockpitPick(Game, RG);
        RG.cockpitPicks[pick] = (RG.cockpitPicks[pick] | 0) + 1;
        return orig('beat:' + pick);
      }
      // GREY FINALS — option ids are 'final:<id>'. both-hands is the
      // flagship both-hands ending.
      const finalIds = ids.map(x => x.indexOf('final:') === 0 ? x.slice(6) : x);
      if (finalIds.indexOf('both-hands') >= 0 || finalIds.indexOf('the-contract') >= 0) {
        let band = 'grey';
        try { const T = Game.tableState ? Game.tableState() : {}; band = T.branch || bandOf(Game); } catch (e) {}
        if (band === 'grey' && finalIds.indexOf('both-hands') >= 0) {
          RG.finalPick = 'both-hands';
          return orig('final:both-hands');
        }
        RG.finalPick = RG.finalPick || ('delegated:' + id);
        return orig(id);
      }
    } catch (e) { RG.rgError = (RG.rgError | 0) + 1; }
    return orig(id);
  };
}

// cockpitPick(Game, RG): the merge thermostat. Merge 2s preferred; steer
// the band with the reroute pair; honest when leaning low (it also
// restores grounding). Never the dark verbs — they aren't offered here.
function cockpitPick(Game, RG) {
  const lean = leanOf(Game);
  const g = groundingOf(Game);
  const bond = bondOf(Game);
  const bf = backfiresOf(Game);
  if (lean > 15) return 'efficient';                       // merge 2, lean -2
  if (lean < -15) return 'honest';                         // merge 1, lean +2, +1 grounding
  if (bond < 6 && g > 40 && bf < 2) return 'deepen';       // merge 2, lean 0
  if (bf < 2 && g > 45) return 'probe';                    // merge 2, lean 0
  if (g <= 35) return 'honest';                            // restore, keep merging
  return 'deepen';
}

function withRelayGrey(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      try { relayGreyDaily(Game, ctx); } catch (e) { const RG = ensureRG(ctx); RG.rgError = (RG.rgError | 0) + 1; }
      return base.daily(Game, ctx);
    },
  });
}

module.exports = { layerOn, withRelayGrey, relayGreyDaily, installRelayGreyChooser, cockpitPick, answerPendingScene, leanOf, bandOf, groundingOf, bondOf, ensureRG };
