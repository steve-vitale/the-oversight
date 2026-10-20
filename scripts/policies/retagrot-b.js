// retagrot-b — the ROT re-tag (arm sim-retagrot-b, run fleshout-loop-b-20261020T0930Z).
//
// Zero src/js. Env-gated RETAGROT_B=1 (default OFF — RETAGROT_B unset means
// the wrapper delegates to its feastscale parent byte-identically; the
// proof's RED phase pins that). Requires FEASTSCALE_R13=1 (loud RETAGROT
// STOP otherwise).
//
// Mechanic: the villager share write is re-tagged into the PANTRY funnel:
//   Game.stockPantry(give, 'Foraged food') in <=500-kcal pieces, fresh clock.
//
// Rebuilt from evidence/2026-10-20/sim-sharelean-b.md (the killed sharelean
// valve), NOT copied from a leftover — sharelean.js was deleted zero-trace
// per kill protocol. Unlike sharelean this layer is NOT lean-gated and does
// NOT touch the share gate: no trustFactor override. The engine's own sharing
// culture — trust-gated sharing plus the engine's CRISIS SHARING ("when the
// pantry is nearly empty, people share more", villagerMealDay bal-survival
// 2026-10-10) — decides HOW MUCH is shared; the layer only redirects WHERE
// the shared surplus is stored. The honest question (backlog #691, claimed
// side-observation): does eating arrivals instead of storing them buy rot
// reduction without eating the buffer dangerously?
//
// Wiring (the harness runs Game.sleep() AFTER policy.daily() returns, and the
// meals run inside sleep): the layer installs a PERSISTENT, idempotent
// wrapper on Game.villagerMealDay on the first armed daily. Each wrapped meal
// patches Game.stockSurplus per-meal (save/restored in finally — the
// sharelean "scoped to one villagerMealDay call" design) so the share write
// lands in the PANTRY funnel. The wrap is per-run (every harness run loads a
// fresh Game), so no cross-run leak is possible; the daily's finally does not
// need to tear it down.
//
// When CAPDOOR=1 the per-meal patch defers to the original stockSurplus (the
// landed cap-door's refusal honesty outranks the funnel tag). The return is
// the kcal actually stored (pantryKcal before/after diff) so any caller-side
// ledger stays honest.
//
// Design calls (Steve: "figure it out yourself" — numbered, overrulable):
// R1: always-on re-tag — the lever is the funnel, not a lean valve. Lean
//     gating + gate-forcing died with sharelean (its kill verdict: the
//     engine's CRISIS SHARING already opens the gate on lean days).
// R2: RETAGROT_B unset -> pure delegation to the parent policy (RED phase).
// R3: RETAGROT_B=1 without FEASTSCALE_R13=1 -> loud RETAGROT STOP — the arm
//     can never silently run on the wrong substrate.
// R4: CAPDOOR=1 -> defer to the original stockSurplus (refusal honesty first).
// R5: stockPantry(give, 'Foraged food') in <=500-kcal pieces, fresh clock —
//     the sharelean instrument signature, so analyzers classify the write as
//     away_wild and stay comparable across arms.
// R6: voice — at most one line per day, only when the re-tag actually moved
//     kcal that day, day-keyed among 3 honest variants (deterministic; avoids
//     the verbatim-repetition class the sharelean sense read flagged, without
//     transcript spam).
'use strict';
const { belongfeast, leadfeast } = require('./feastscale');

const ENV = () => (typeof process !== 'undefined' && process.env) || {};
function layerOn() { return ENV().RETAGROT_B === '1'; }
function capDoorOn() { return ENV().CAPDOOR === '1'; }
function feastOn() { return ENV().FEASTSCALE_R13 === '1'; }
function loudStop() {
  throw new Error('RETAGROT STOP: RETAGROT_B=1 requires FEASTSCALE_R13=1 (substrate gate)');
}

const PIECE = 500;
const VOICE = [
  "🍲 Today's surplus goes to the common store, not into packs — what the village hauls together, it eats together.",
  '🍲 The sharers\' extra finds the common shelves tonight — packs stay light, the pantry carries it.',
  '🍲 Surplus folds into the common store again — the village eats what it brings home.',
];

function scholarDay(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function pantryKcalOf(Game) {
  try { return Game.pantryKcal(); } catch (e) { return -1; }
}

// installVmdWrap: persistent, idempotent wrapper on Game.villagerMealDay.
// Each wrapped meal re-tags the share write per-meal (save/restored in
// finally), then the day's first moved-kcal meal voices the re-tag once.
function installVmdWrap(Game, ctx) {
  if (Game._rgVmdWrapped) return;
  Game._rgVmdWrapped = true;
  const oVmd = Game.villagerMealDay;
  Game.villagerMealDay = function () {
    const oSur = Game.stockSurplus;
    const oPan = Game.stockPantry;
    const self = Game;
    Game.stockSurplus = function (v, give) {
      if (typeof give !== 'number' || !(give > 0)) return oSur.apply(this, arguments);
      if (capDoorOn() || typeof oPan !== 'function') return oSur.apply(this, arguments);
      let stored = 0;
      try {
        const before = pantryKcalOf(self);
        let remaining = give;
        while (remaining > 0) {
          const piece = Math.min(remaining, PIECE);
          oPan.call(self, piece, 'Foraged food');
          remaining -= piece;
        }
        const after = pantryKcalOf(self);
        stored = (before >= 0 && after >= 0) ? Math.max(0, after - before) : Math.round(give);
      } catch (e) {
        // a failed pantry write must never eat the kcal: fall back to the
        // original share path so the surplus lands somewhere honest
        try { stored = oSur.apply(this, arguments); } catch (e2) { stored = 0; }
        return stored;
      }
      try {
        ctx._rgMovedKcal = (ctx._rgMovedKcal || 0) + stored;
        const day = scholarDay(self);
        if (!self._rgDayAcc || self._rgDayAcc.day !== day) self._rgDayAcc = { day, moved: 0 };
        self._rgDayAcc.moved += stored;
      } catch (e) {}
      return stored;
    };
    try {
      const r = oVmd.apply(this, arguments);
      try {
        const day = scholarDay(self);
        const acc = self._rgDayAcc;
        if (acc && acc.day === day && acc.moved > 0 && self._rgVoicedDay !== day) {
          self._rgVoicedDay = day;
          ctx._rgDays = (ctx._rgDays || 0) + 1;
          self.say(VOICE[day % VOICE.length]);
        }
      } catch (e) {}
      return r;
    } finally {
      Game.stockSurplus = oSur; // per-meal save/restore
    }
  };
}

function withRetagrot(base, id, desc) {
  return Object.assign({}, base, {
    id,
    desc,
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      if (!feastOn()) loudStop();
      installVmdWrap(Game, ctx); // persistent, idempotent, per-run
      ctx._rgArms = (ctx._rgArms || 0) + 1;
      return base.daily(Game, ctx);
    },
  });
}

const belongretagrot = withRetagrot(
  belongfeast, 'belongretagrot',
  'belongfeast + retagrot (RETAGROT_B=1): share write re-tagged into the PANTRY funnel, always-on, no gate-forcing'
);
const leadretagrot = withRetagrot(
  leadfeast, 'leadretagrot',
  'leadfeast + retagrot (RETAGROT_B=1): share write re-tagged into the PANTRY funnel, always-on, no gate-forcing'
);

module.exports = { belongretagrot, leadretagrot, withRetagrot, layerOn, capDoorOn, loudStop };
