// helpcall — the aid-system engagement layer (sim-helpcall, 2026-10-16,
// scale-onramp axis).
//
// THE ARM: commit f6cecf3c fixed raid crisis tiers to read actual raider
// waves (pre-fix every raid crisis was tier 1; the wave>=3 apex call-for-
// help penalty (score -10, comms.js aidAskVillage) never applied). But the
// sweep policies NEVER call for help, so the fix was behavior-neutral on
// the sweep substrate: the aid system sat unmeasured. This layer ENGAGES
// it: on an apex raid crisis (crisis.raiders && crisis.wave >= 3) with no
// call placed yet, the policy calls for help via the engine's aid verb.
//
// TIER CHOICE: 'runner'. Canon (comms.js four_tiers_honest_costs +
// signal_is_indiscriminate): the signal fire is fast but loud and
// indiscriminate — smoke draws company (crisis.attracted grows, pack
// members arrive in the fight) AND blocks fleeing while the beacon's
// attention holds. Lighting it on an apex raid is the opposite of
// competent play. The runner is targeted (nearest linked village), and
// its costs are honest and attributable: road danger (the runner can be
// hurt or die — registerDeath cause 'aid-runner'), real march day-parts,
// and the far end's decision said aloud, fast. System relay is
// integration-gated and garbled (wrong-threat comedy + a favor owed);
// the ability cry is build-gated. Runner is the competent default; a
// later arm can compare tiers against it.
//
// PLACEMENT GATING: exactly one call per crisis — the driver requires
// (crisis.calls||[]).length === 0. The engine pushes an entry into
// crisis.calls for every placed call, so repeat placement is impossible
// by construction (not by driver memory).
//
// ATTRIBUTION (the PRIMARY metric demands 100%): every placement is
// recorded into Game.state.hcLedger.calls — engine-true, read back from
// the tail crisis.calls entry ({tier, day, part, targetId, runner,
// result:'sent'|'died'}), not reconstructed. Every aidAskVillage verdict
// is recorded into Game.state.hcLedger.verdicts via a call-through
// wrapper installed ONCE per Game — and only ever installed when a call
// is actually placed (gate-off installs nothing; the det-gate pins the
// zero trace). Verdicts match placements by (via==='runner',
// villageId===targetId, day>=placement.day), first match wins.
// Outcome buckets: accepted (→ pendingHelp → aidHelpArrived: 'arrived'
// writes pg.ledgerEvents 'aid-arrived:<v>:<n>'; 'stood-down' when the
// door went quiet), refused-trust / refused-crisis / refused-score (the
// engine's own say taxonomy, matched by the link-note kinds it writes),
// runner-died (ret 'died', death cause 'aid-runner'), nolink / hot /
// no-runner (the engine's own returns — 'nolink', 'hot', null).
//
// GATE: HELPCALL=1, default OFF. Gate-off is pure delegation: the
// proof's det-gate pins byte-identical trajectories (HELPCALL=0
// armed-object vs the unwrapped tribfloor stack, identical seeds).
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const TF = require('./tribfloor');

// Default-OFF: HELPCALL=1 is the only opt-in.
function layerOn() { return process.env.HELPCALL === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// The attribution ledger: engine-true, read back after the run.
function ledger(Game) {
  try {
    Game.state.hcLedger = Game.state.hcLedger || { calls: [], verdicts: [] };
    return Game.state.hcLedger;
  } catch (e) { return { calls: [], verdicts: [] }; }
}

// installVerdictHook: call-through wrap of Game.aidAskVillage. Records
// every verdict {day, via, villageId, verdict} — no RNG reads, no state
// mutation beyond the ledger, no behavior change. Installed once per
// Game, and ONLY on the placement path (gate-off never installs).
function installVerdictHook(Game) {
  try {
    if (Game.__hcAskHook || typeof Game.aidAskVillage !== 'function') return;
    const orig = Game.aidAskVillage.bind(Game);
    Game.aidAskVillage = function (villageId, via, msg) {
      let res = null;
      try { res = orig(villageId, via, msg || {}); } catch (e) { res = null; }
      try {
        ledger(Game).verdicts.push({
          day: gday(Game), via: String(via || '?'),
          villageId: String(villageId || '?'), verdict: String(res || 'null'),
        });
      } catch (e) {}
      return res;
    };
    Game.__hcAskHook = true;
  } catch (e) {}
}

// crisisIsApexCall: is there an apex raid crisis that wants exactly one
// call? Every early exit is classified (never a "placement").
function crisisIsApexCall(Game) {
  try {
    if (typeof Game.aidCrisis !== 'function') return { ok: false, why: 'no-verb' };
    const crisis = Game.aidCrisis();
    if (!crisis) return { ok: false, why: 'no-crisis' };
    if (crisis.resolved) return { ok: false, why: 'resolved' };
    if (!crisis.raiders) return { ok: false, why: 'not-raid' };
    if (((crisis.wave | 0) || 1) < 3) return { ok: false, why: 'sub-apex' };
    if ((crisis.calls || []).length) return { ok: false, why: 'already-called' };
    return { ok: true, crisis };
  } catch (e) { return { ok: false, why: 'read-error' }; }
}

// driveHelpCall: the whole driver. Read-only until the callForHelp verb
// itself; every early exit is classified, never a placement.
function driveHelpCall(Game, ctx) {
  ctx = ctx || {};
  const gate = crisisIsApexCall(Game);
  if (!gate.ok) {
    ctx.hcSkip = ctx.hcSkip || {};
    ctx.hcSkip[gate.why] = (ctx.hcSkip[gate.why] || 0) + 1;
    return;
  }
  const crisis = gate.crisis;
  const day = gday(Game);
  // Verdict hook before the call — the runner's verdict lands later via
  // commsTick -> aidAskVillage, and must be recorded.
  installVerdictHook(Game);
  const placement = {
    day, crisisSince: crisis.sinceDay, wave: (crisis.wave | 0) || 1, tier: 'runner',
  };
  let ret = null;
  try { ret = (typeof Game.callForHelp === 'function') ? Game.callForHelp('runner', {}) : 'no-verb'; }
  catch (e) { ret = 'error'; }
  // Engine-true attribution: read the tail crisis.calls entry the engine
  // itself pushed (carries targetId + runner on 'sent'/'died').
  let tail = null;
  try {
    const calls = crisis.calls || [];
    tail = calls.length ? calls[calls.length - 1] : null;
  } catch (e) {}
  placement.ret = (ret == null) ? 'null' : String(ret);
  placement.targetId = tail ? String(tail.targetId || '') : '';
  placement.runner = tail ? String(tail.runner || '') : '';
  placement.engineResult = tail ? String(tail.result || '') : '';
  try { ledger(Game).calls.push(placement); } catch (e) {}
  ctx.hcPlacements = (ctx.hcPlacements || 0) + 1;
}

function withHelpCall(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try { driveHelpCall(Game, ctx); }
      catch (e) {
        ctx.hcDriveError = (ctx.hcDriveError | 0) + 1;
        // ctx does not survive the run — mirror to the ledger so the
        // analyzer can enforce the "no aid-system errors" guardrail.
        try {
          ledger(Game).errors = ledger(Game).errors || [];
          ledger(Game).errors.push({ day: gday(Game), msg: String((e && e.message) || e).slice(0, 120) });
        } catch (e2) {}
      }
      return base.daily(Game, ctx);
    },
  });
}

// The sweep arms these ids over the pre-seat courtship substrate
// (SEATDRIVE=0 explicit, FEASTSCALE_R13=1, NODEWITNESS=1): the same
// tribfloor base the control side uses; HELPCALL is the only switch.
const leadhc = withHelpCall(
  TF.leadfeast,
  'leadfeast-helpcall',
  'leadfeast + helpcall (HELPCALL=1): calls for help via runner on apex raid crises, then the base'
);
const belonghc = withHelpCall(
  TF.belongfeast,
  'belongfeast-helpcall',
  'belongfeast + helpcall (HELPCALL=1): calls for help via runner on apex raid crises, then the base'
);

module.exports = {
  layerOn, ledger, installVerdictHook, crisisIsApexCall, driveHelpCall, withHelpCall,
  leadhc, belonghc,
};
