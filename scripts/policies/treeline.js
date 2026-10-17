// treeline — the treeline-raid answer layer (sim-treeline, 2026-10-17,
// scale-onramp axis, compoundidx named next #1, finding #460).
//
// THE FINDING (sim-compoundidx, evidence/2026-10-17/sim-compoundidx.md):
// raid-kcal hemorrhage is SYSTEMATIC — 17/17 village-lost runs, median
// ~27k kcal/run. Two channels: commons raids (500-1,500 kcal, NO answer
// channel exists) and treeline raids, which the census policies NEVER
// answer — the engine auto-resolves them for 800 kcal each
// (villageAgency.js: unanswered pendingRaidDefense → _removePantryKcal(800),
// opinion -5).
//
// THE LEVER: answer the treeline raid through the engine's own answer
// channel — Game.answerRaidDefense('give'|'hold'|'fight'):
//   give: pay the demand (~2,000 kcal), opinion -5. NEVER beats auto (800).
//   hold: the standoff — show spears. roster.length >= raiders+1 → they
//     leave, 0 kcal, opinion -3, no blood (+1 viewership moment). Outnumbered
//     → 1,500 kcal + opinion -10 (WORSE than auto).
//   fight: blood — muster up to 4, 15% death / 30% wounded PER mustered
//     villager, kills 1-2 of theirs, opinion -25. A villager's life is worth
//     more than 800 kcal; force is not the answer (raidshield lesson,
//     sim-raidshield fleshout-20261016T1215Z; raiddef lesson, sim-raiddef
//     2026-10-14; besiegeanswer lesson, 2026-10-15 — all three killed arms
//     proved engagement costs blood the lever can't repay).
//
// THE POLICY: 'hold' iff the village outnumbers the raiders (mirroring the
// engine's own comparison exactly — no RNG, deterministic); otherwise LEAVE
// UNANSWERED (800 auto strictly beats give 2,000 / failed-hold 1,500 /
// fight blood). Answered in upkeep AND daily — idempotent (the engine
// clears pendingRaidDefense on answer, so a second call no-ops).
//
// COMPOSITION: withTreeline wraps the census seatdrive stack
// (SD.leadseat / SD.belongseat — windefer-wrapped tribfloor base), the same
// stack the compoundidx census measured. DEFAULT-OFF: TREELINE=1 arms it;
// unset (or anything else) is pure delegation to the wrapped policy.
// The gate-off delegation is pinned byte-identical by
// scripts/det-gate-treeline-20261017.js.
//
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const SD = require('./seatdrive');

// Default-OFF (the measurement discipline): TREELINE=1 is the only opt-in.
function layerOn() { return process.env.TREELINE === '1'; }

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

// answerRaid: the whole lever. Read-only until the answer verb itself;
// every early exit is classified, never an error.
function answerRaid(Game, ctx) {
  let pr = null;
  try { pr = Game.state.pendingRaidDefense || null; } catch (e) { return; }
  if (!pr) return; // nothing staged — not an answer
  ctx.tlRaidsSeen = (ctx.tlRaidsSeen | 0) + 1;
  const raiderCount = (pr.raiders || []).length;
  const theirs = raiderCount + 1; // champion + raiders, per the engine
  let roster = 0;
  try { roster = ((Game.state.village || {}).roster || []).length; } catch (e) {}
  // Mirror the engine's hold comparison exactly: hold wins iff the village
  // shows at least as many spears as they brought. A weak village never
  // holds — the overrun (1,500) is worse than the auto-resolve (800).
  if (roster < theirs) {
    ctx.tlSkippedWeak = (ctx.tlSkippedWeak | 0) + 1;
    return; // leave unanswered: 800 auto beats every other option
  }
  let r = null;
  try { r = Game.answerRaidDefense('hold'); } catch (e) { r = null; }
  if (r === 'held') ctx.tlHolds = (ctx.tlHolds | 0) + 1;
  else ctx.tlHoldOther = (ctx.tlHoldOther | 0) + 1; // 'overrun'/'gave'/null — should not happen; counted, not hidden
}

function withTreeline(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    upkeep(Game, ctx) {
      if (layerOn()) { try { answerRaid(Game, ctx); } catch (e) { ctx.tlAnswerError = (ctx.tlAnswerError | 0) + 1; } }
      return base.upkeep ? base.upkeep(Game, ctx) : undefined;
    },
    daily(Game, ctx) {
      if (layerOn()) { try { answerRaid(Game, ctx); } catch (e) { ctx.tlAnswerError = (ctx.tlAnswerError | 0) + 1; } }
      return base.daily ? base.daily(Game, ctx) : undefined;
    },
  });
}

// Precomposed stacks for the sweep + the §15 balance panel.
// Control side is the bare seatdrive stack (TREELINE unset); armed side is
// the same stack wrapped here (TREELINE=1). Both sides share the objects.
const leadfeastTreeline = withTreeline(
  SD.leadseat,
  'leadfeast-treeline',
  'leadfeast-windefer + treeline (default-OFF; TREELINE=1 arms): answers treeline raids with hold when the village outnumbers the raiders, else leaves them to the 800-kcal auto-resolve'
);
const belongfeastTreeline = withTreeline(
  SD.belongseat,
  'belongfeast-treeline',
  'belongfeast-windefer + treeline (default-OFF; TREELINE=1 arms): answers treeline raids with hold when the village outnumbers the raiders, else leaves them to the 800-kcal auto-resolve'
);

module.exports = {
  layerOn, withTreeline, answerRaid,
  leadfeastTreeline, belongfeastTreeline,
};
