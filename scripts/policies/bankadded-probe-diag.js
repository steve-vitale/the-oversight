// bankadded-probe-diag — probe-given-food staging for the narrow
// BANK-ADDED retention case (sim-bankadded-substrate-a, 2026-11-05,
// flesh-out loop, axis food-economy). Prereg: evidence/2026-11-05/
// sim-bankadded-substrate-a-prereg.md, committed BEFORE any judged sim.
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
// is recorded per event (probeAddedKcal, stacks, waits, clock) and is
// visible in the corpus; nothing about it is hidden.
//
// HOW IT STAGES: wraps the bankfood stack. After inner.daily returns
// (the bankfood evening phase has already run inside it):
//   - genuine bank-mode delta > 0  -> record genuine, inject NOTHING.
//   - else, if stranded and this seed has staged < 2 events:
//     honest waits (Game.doAction('wait'), cap 12) to dayTicks >= 449,
//     then inject the fixed haul (18 x 40 kcal Muscadine Grapes,
//     spoilDay = scholarDay + 2 — the same haul shape as
//     scripts/bankfood-probe.js's diagnostic inject) and record the
//     probe evening. No Game.say line: the probe must not narrate the
//     retention mechanism it is measuring.
//   - otherwise: no staging (not stranded / cap hit / wait-cap).
// The per-seed cap (first 2 staged events per seed) is pre-registered.
'use strict';

const { packSnap, strandedEveningDecision } = require('./bankfood-diag');

const PROBE_UNITS = 18;
const PROBE_KCAL_EACH = 40;
const PROBE_ADDED_KCAL = PROBE_UNITS * PROBE_KCAL_EACH; // 720
const PROBE_STACK_NAME = 'Muscadine Grapes';
const BANK_CLOCK = 449;
const MAX_WAITS = 12;
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
// { gameOver, combatLive, stranded, genuineBankAdded, stagedSoFar,
//   cap, clock }.
// Returns { stage: true, via } or { stage: false, skip: reason }.
function stagingDecision(o) {
  if (o.gameOver) return { stage: false, skip: 'game-over' };
  if (o.combatLive) return { stage: false, skip: 'combat' };
  if (!o.stranded) return { stage: false, skip: 'not-stranded' };
  if (o.genuineBankAdded) return { stage: false, skip: 'genuine-bank-added' };
  if (o.stagedSoFar >= o.cap) return { stage: false, skip: 'per-seed-cap' };
  return { stage: true, via: (o.clock >= BANK_CLOCK) ? 'already-in-band' : 'wait-to-band' };
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
        if (bfEvening && bfEvening.mode === 'bank' && bfEvening.packBefore && bfEvening.packAfter) {
          const d = (bfEvening.packAfter.edibleKcal || 0) - (bfEvening.packBefore.edibleKcal || 0);
          genuineDelta = d;
          if (d > 0) genuineBankAdded = true;
        }
        const stagedSoFar = st.evenings.filter((a) => a.staged).length;
        const decision = stagingDecision({
          gameOver: gameOver(Game), combatLive: combatLive(Game),
          stranded, genuineBankAdded, stagedSoFar, cap: PER_SEED_STAGE_CAP,
          clock: dayTicks(Game),
        });
        const rec = { loopDay, gameDay: scholarDay(Game), mode: 'bank-probe',
          staged: false, genuine: genuineBankAdded, genuineDelta,
          underlyingMode: bfEvening ? bfEvening.mode : null,
          ntOutcome: nt ? nt.outcome : null,
          eveTileType, eveInsideHaven: eveInsideHaven === true,
          clockBefore: dayTicks(Game), kcalBefore: scholarKcal(Game),
          packBefore: packSnap(Game),
          waits: 0, waitErr: null, clockAfter: null, kcalAfter: null,
          packAfter: null, probeAddedKcal: 0, probeUnits: 0,
          probeSpoilDay: null, skip: decision.stage ? null : decision.skip,
          via: decision.stage ? decision.via : null };
        if (!decision.stage) { st.evenings.push(rec); return; }
        // Honest waits to the bank clock band (same wait verb the
        // harness itself uses; each wait runs villagerTurn).
        let waits = 0, waitErr = null;
        while (dayTicks(Game) < BANK_CLOCK && waits < MAX_WAITS && !gameOver(Game) && !combatLive(Game)) {
          try { Game.doAction('wait'); } catch (e) { waitErr = String((e && (e.message || e)) || e).slice(0, 120); break; }
          waits++;
        }
        rec.waits = waits; rec.waitErr = waitErr;
        rec.clockAfter = dayTicks(Game);
        if (dayTicks(Game) < BANK_CLOCK) {
          rec.skip = 'wait-cap';
          rec.staged = false;
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

module.exports = { withBankaddedProbe, newStore, stagingDecision, probeHaul, probeStackKey, stackKey,
  PROBE_UNITS, PROBE_KCAL_EACH, PROBE_ADDED_KCAL, PROBE_STACK_NAME, BANK_CLOCK, MAX_WAITS, PER_SEED_STAGE_CAP };
