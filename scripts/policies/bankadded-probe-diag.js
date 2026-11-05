// bankadded-probe-diag — probe-given-food staging for the narrow
// BANK-ADDED retention case (sim-bankadded-substrate-a, 2026-11-05,
// flesh-out loop, axis food-economy). Prereg: evidence/2026-11-05/
// sim-bankadded-substrate-a-prereg.md + prereg-addendum (instrument
// fix: waits cannot park the clock at 449 — see the addendum).
//
// POLICY-SIDE INSTRUMENT ONLY: zero src/js changes, zero edits to any
// existing policy file. Env-gated: BANKADDED_PROBE=1 arms it;
// unset/0 delegates to inner.daily/inner.upkeep untouched.
//
// WHAT IT STAGES: on a stranded-away evening, the post-bank state a
// successful bank-mode forage haul would produce — known-edible food
// added to the pack during the evening phase, in the bank clock band
// (dayTicks >= 449). The judged mechanism is OVERNIGHT RETENTION of
// evening-added food, which is identical whether the food arrived by
// forage press or by staged injection; the acquisition mechanism is
// NOT what is judged, and the prereg says so plainly. The injection
// is recorded per event (probeAddedKcal, stacks, rests, presses,
// clock) and is visible in the corpus; nothing about it is hidden.
//
// HOW IT STAGES (addendum fix): wraps the bankfood stack. After
// inner.daily returns (the bankfood evening phase has already run
// inside it):
//   - genuine bank-mode delta > 0  -> record genuine, inject NOTHING.
//   - underlying evening already added food (any mode, delta > 0)
//     -> skip 'already-added', inject NOTHING (never mix flip-added
//     with injected food in one delta).
//   - else, if stranded and this seed has staged < 2 probe-produced
//     events: advance the clock to the bank band with the engine's
//     own small-step actions — 'rest' (+96 ticks, 40 kcal) while the
//     clock is below 416, 'forage' presses (+16 ticks, 60 kcal) in
//     the 416–448 window where a rest would roll the day — then:
//       press delta > 0 -> kind 'press-added', inject NOTHING
//         (the presses added the food; per-press records are the
//         provenance);
//       press delta 0   -> inject the fixed haul (18 x 40 kcal
//         Muscadine Grapes, spoilDay = scholarDay + 2 — the same
//         haul shape as scripts/bankfood-probe.js's diagnostic
//         inject), kind 'staged'.
//     Stop the advancer at once on day-roll (the night has begun),
//     gameOver, combat, press/rest error, a press that advances no
//     ticks, or the 8-action cap — record the skip, inject nothing.
//   - otherwise: no staging (not stranded / cap hit).
// The probe says NOTHING: no Game.say line, because the probe must
// not narrate the retention mechanism it is measuring.
// The per-seed cap (first 2 probe-produced events per seed:
// 'staged' + 'press-added') is pre-registered.
'use strict';

const { packSnap, pressTotals, strandedEveningDecision } = require('./bankfood-diag');

const PROBE_UNITS = 18;
const PROBE_KCAL_EACH = 40;
const PROBE_ADDED_KCAL = PROBE_UNITS * PROBE_KCAL_EACH; // 720
const PROBE_STACK_NAME = 'Muscadine Grapes';
const BANK_CLOCK = 449;
const MAX_ADVANCER_ACTIONS = 8;
const REST_TICKS = 96;
const REST_ROLL_FLOOR = 416; // clock >= 416: a +96 rest would roll the day (416+96=512)
const PER_SEED_STAGE_CAP = 2;

function leverOn() {
  try { return process.env.BANKADDED_PROBE === '1'; } catch (e) { return false; }
}

function newStore() {
  return { evenings: [], errs: 0, errors: [] };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && (e.message || e)) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function gameOver(Game) {
  try { return !!Game.over; } catch (e) { return false; }
}
function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) {}
  try { if (Game.pendingEncounter) return true; } catch (e) {}
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) {}
  return false;
}
function scholarKcal(Game) {
  try { return Math.round((Game.state || {}).scholar.kcal || 0); } catch (e) { return 0; }
}
function dayTicks(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function scholarDay(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Staging decision (pure, unit-tested). Input o:
// { gameOver, combatLive, stranded, genuineBankAdded,
//   underlyingAdded, stagedSoFar, cap, clock }.
// Returns { stage: true, via } or { stage: false, skip: reason }.
function stagingDecision(o) {
  if (o.gameOver) return { stage: false, skip: 'game-over' };
  if (o.combatLive) return { stage: false, skip: 'combat' };
  if (!o.stranded) return { stage: false, skip: 'not-stranded' };
  if (o.genuineBankAdded) return { stage: false, skip: 'genuine-bank-added' };
  if (o.underlyingAdded) return { stage: false, skip: 'already-added' };
  if (o.stagedSoFar >= o.cap) return { stage: false, skip: 'per-seed-cap' };
  return { stage: true, via: (o.clock >= BANK_CLOCK) ? 'already-in-band' : 'advance-to-band' };
}

// The fixed staged haul, in the exact shape bankfood-probe.js injects.
function probeHaul(day) {
  return { plantId: 'muscadine_grape', foodKind: 'plant',
    foodState: 'raw', edible: true, units: PROBE_UNITS, unit: 'bunch',
    kcalEach: PROBE_KCAL_EACH, spoilDay: day + 2,
    name: PROBE_STACK_NAME, kg: 0.1 };
}
function stackKey(s) { return [s.name, s.kcalEach, s.edible, s.foodState].join('|'); }
function probeStackKey() { return [PROBE_STACK_NAME, PROBE_KCAL_EACH, true, 'raw'].join('|'); }

// One probe forage press (mirrors bankfood-diag's doForagePress
// recording shape, using the imported canonical snapshot + press
// totals). Returns the press record; never throws.
function doProbePress(Game) {
  const before = packSnap(Game);
  const kcalBefore = scholarKcal(Game), ticksBefore = dayTicks(Game);
  let pressErr = null, retNull = null;
  try { const ret = Game.doAction('forage'); retNull = (ret === null || ret === undefined); }
  catch (e) { pressErr = String((e && (e.message || e)) || e).slice(0, 300); }
  const after = packSnap(Game);
  const totals = pressTotals(before.stacks, after.stacks);
  return { kind: 'forage', kcalBefore, kcalAfter: scholarKcal(Game),
    ticksBefore, ticksAfter: dayTicks(Game), err: pressErr, retNull,
    Eknown: totals.knownEdibleKcal, unknownUnits: totals.unknownUnits,
    unknownForms: totals.unknownForms,
    packEdibleBefore: before.edibleKcal, packEdibleAfter: after.edibleKcal,
    lumpUnitsBefore: before.lumpUnits, lumpUnitsAfter: after.lumpUnits };
}

// Advance the clock to the bank band with the engine's own
// small-step actions. 'rest' (+96 ticks) while the clock is below
// REST_ROLL_FLOOR; 'forage' presses (+16 ticks) in the window where
// a rest would roll the day. Stops at once on day-roll, gameOver,
// combat, an action error, a press that advances no ticks, or the
// action cap. Mutates rec (rests, pressRecords, stopReason,
// dayRolled) and returns { reached: bool }.
function advanceToBand(Game, rec) {
  let actions = 0;
  let stopReason = null;
  const startDay = scholarDay(Game);
  while (dayTicks(Game) < BANK_CLOCK && actions < MAX_ADVANCER_ACTIONS) {
    if (gameOver(Game)) { stopReason = 'game-over'; break; }
    if (combatLive(Game)) { stopReason = 'combat'; break; }
    if (scholarDay(Game) !== startDay) { rec.dayRolled = true; stopReason = 'day-rolled'; break; }
    if (dayTicks(Game) >= REST_ROLL_FLOOR) {
      const pr = doProbePress(Game);
      rec.pressRecords.push(pr);
      actions++;
      if (pr.err) { stopReason = 'press-error'; break; }
      if (pr.retNull) { stopReason = 'press-null'; break; }
      if (pr.ticksAfter === pr.ticksBefore && scholarDay(Game) === startDay) { stopReason = 'press-no-advance'; break; }
    } else {
      let restErr = null;
      try { Game.doAction('rest'); } catch (e) { restErr = String((e && (e.message || e)) || e).slice(0, 120); }
      rec.rests++;
      actions++;
      if (restErr) { rec.restErr = restErr; stopReason = 'rest-error'; break; }
    }
    if (scholarDay(Game) !== startDay) { rec.dayRolled = true; stopReason = 'day-rolled'; break; }
  }
  if (!stopReason && dayTicks(Game) < BANK_CLOCK) stopReason = 'advancer-cap';
  if (!stopReason && scholarDay(Game) !== startDay) { rec.dayRolled = true; stopReason = 'day-rolled'; }
  // A rest/press can start a fight mid-advancer (villagerTurn runs on
  // every action): never stage into live combat or after game-over.
  if (!stopReason && gameOver(Game)) stopReason = 'game-over';
  if (!stopReason && combatLive(Game)) stopReason = 'combat';
  rec.advancerStop = stopReason;
  return { reached: dayTicks(Game) >= BANK_CLOCK && scholarDay(Game) === startDay && !stopReason };
}

function withBankaddedProbe(inner, bfStore, store) {
  const st = store || newStore();
  let call = 0;
  return Object.assign({}, inner, {
    id: 'bankadded-probe',
    desc: 'bankfood stack + probe-given-food staging for bank-added retention (BANKADDED_PROBE=1)',
    upkeep(Game, ctx) {
      // The bankfood wrapper owns the first-upkeep snapshot; delegate
      // untouched (BANKADDED_PROBE=0 delegates inside withBankfood too).
      return inner.upkeep ? inner.upkeep(Game, ctx) : undefined;
    },
    daily(Game, ctx) {
      call++;
      const loopDay = call;
      if (!leverOn()) return inner.daily ? inner.daily(Game, ctx) : undefined;
      // ---- INNER DAY (full bankfood stack incl. its evening phase) ----
      if (inner.daily) inner.daily(Game, ctx);
      if (gameOver(Game) || combatLive(Game)) return;
      // ---- PROBE STAGING (after inner.daily; before harness sleep) ----
      try {
        let nt = null;
        try { nt = (ctx && ctx._ntLast) || null; } catch (e) { nt = null; }
        let eveTileType = null, eveInsideHaven = null;
        try { const t = Game.playerTile(); eveTileType = t ? (t.type || null) : null; } catch (e) {}
        try { eveInsideHaven = ((Game.state || {}).scholar || {}).insideHaven; } catch (e) {}
        const stranded = strandedEveningDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          ntOutcome: nt ? nt.outcome : null,
          tileType: eveTileType, insideHaven: eveInsideHaven === true,
        }).fire;
        // Underlying bankfood evening for this loop-day (if any).
        let bfEvening = null;
        try {
          const evs = (bfStore && bfStore.evenings) || [];
          bfEvening = evs.find((a) => a.loopDay === loopDay) || null;
        } catch (e) { bfEvening = null; }
        let genuineBankAdded = false, genuineDelta = null;
        let underlyingAdded = false, underlyingDelta = null;
        if (bfEvening && bfEvening.packBefore && bfEvening.packAfter) {
          const d = (bfEvening.packAfter.edibleKcal || 0) - (bfEvening.packBefore.edibleKcal || 0);
          underlyingDelta = d;
          if (d > 0) {
            underlyingAdded = true;
            if (bfEvening.mode === 'bank') { genuineBankAdded = true; genuineDelta = d; }
          }
        }
        // Per-seed cap counts probe-produced events ('staged' +
        // 'press-added'); 'genuine' involves no intervention.
        const stagedSoFar = st.evenings.filter((a) => a.kind === 'staged' || a.kind === 'press-added').length;
        const decision = stagingDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          stranded, genuineBankAdded, underlyingAdded, stagedSoFar,
          cap: PER_SEED_STAGE_CAP, clock: dayTicks(Game),
        });
        const rec = { loopDay, gameDay: scholarDay(Game), mode: 'bank-probe',
          kind: null, staged: false, genuine: genuineBankAdded, genuineDelta,
          underlyingMode: bfEvening ? bfEvening.mode : null,
          underlyingAdded, underlyingDelta,
          ntOutcome: nt ? nt.outcome : null,
          eveTileType, eveInsideHaven: eveInsideHaven === true,
          clockBefore: dayTicks(Game), kcalBefore: scholarKcal(Game),
          packBefore: packSnap(Game),
          rests: 0, restErr: null, pressRecords: [], pressDelta: null, pressEknown: null,
          dayRolled: false, advancerStop: null,
          clockAfter: null, kcalAfter: null,
          packAfter: null, probeAddedKcal: 0, probeUnits: 0,
          probeSpoilDay: null, skip: decision.stage ? null : decision.skip,
          via: decision.stage ? decision.via : null };
        if (!decision.stage) { st.evenings.push(rec); return; }
        // Advance the clock to the bank band (rest + forage presses).
        const adv = advanceToBand(Game, rec);
        rec.clockAfter = dayTicks(Game);
        if (!adv.reached) {
          rec.skip = rec.advancerStop || 'advancer-cap';
          st.evenings.push(rec);
          return;
        }
        // Press yield: food the advancer presses added (pack after the
        // advancer vs pack before it).
        const packAfterAdvancer = packSnap(Game);
        const pressDelta = (packAfterAdvancer.edibleKcal || 0) - (rec.packBefore.edibleKcal || 0);
        rec.pressDelta = pressDelta;
        rec.pressEknown = rec.pressRecords.reduce((t, p) => t + (p.Eknown || 0), 0);
        if (pressDelta > 0) {
          // Press-added: the evening's own work added the food; no injection.
          rec.kind = 'press-added';
          rec.kcalAfter = scholarKcal(Game);
          rec.packAfter = packAfterAdvancer;
          st.evenings.push(rec);
          return;
        }
        // Inject the fixed haul directly into the scholar inventory
        // (the ONLY inventory write in a variant leg; recorded here).
        const day = scholarDay(Game);
        const haul = probeHaul(day);
        try {
          Game.state.scholar.inventory.push(haul);
        } catch (e) { noteErr(st, 'inject', e); rec.skip = 'inject-error'; st.evenings.push(rec); return; }
        rec.kind = 'staged';
        rec.staged = true;
        rec.probeAddedKcal = PROBE_ADDED_KCAL;
        rec.probeUnits = PROBE_UNITS;
        rec.probeSpoilDay = day + 2;
        rec.kcalAfter = scholarKcal(Game);
        rec.packAfter = packSnap(Game);
        st.evenings.push(rec);
      } catch (e) { noteErr(st, 'probe-evening', e); }
    },
  });
}

module.exports = { withBankaddedProbe, newStore, stagingDecision, advanceToBand, doProbePress,
  probeHaul, probeStackKey, stackKey,
  PROBE_UNITS, PROBE_KCAL_EACH, PROBE_ADDED_KCAL, PROBE_STACK_NAME,
  BANK_CLOCK, MAX_ADVANCER_ACTIONS, REST_TICKS, REST_ROLL_FLOOR, PER_SEED_STAGE_CAP };
