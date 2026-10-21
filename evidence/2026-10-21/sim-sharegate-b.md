# sim-sharegate-b — threshold-gated confirm of the SURPLUSFEED upkeep-skip tradeoff

Run: fleshout-loop-b-20261021T1257Z, arm sim-sharegate-b, axis food-economy.
The named next of sim-surpluskeep-diag-b (DIAG-open, evidence/2026-10-21/
sim-surpluskeep-diag-b.md, landed 440cacf77 + 406893331): "a threshold-gated
confirm arm (pre-register gate-crossing weeks + post-gate trust trajectories,
not trim dose)."

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Lever** (policy-side, env-gated SHAREGATE_B=1, default OFF, ZERO src/js
  changes): keep the SURPLUSFEED glut-trim (ENGINE code,
  src/js/game.js surplusFeedGovernor, env-gated SURPLUSFEED=1 — the
  hypothetical scripts/policies/surplusfeed.js does not exist anywhere; the
  trim rides the engine verb, so the layer does not re-implement it), but
  gate the UPKEEP-SKIP in a new layer scripts/policies/sharegate-b.js:
  never skip a tend/tribute week when the link's trust < 40 (the
  _linkSeasoned floor), and cap consecutive quietly-skipped weeks at 2 per
  link. The trim fires; the upkeep cut is threshold-gated. Gate OFF =
  pure delegation to the base leadfeast/belongfeast (byte-identical; the
  proof's RED/DET phases pin it). Every gate decision is voiced (say);
  the engine's tendLink/payTribute verbs do the paying (their
  mourning/bare-pantry refusals are never re-litigated — attempted-tracking
  wrap, like sim-upkeepgate-b's). Voice every skip/trim honestly; no
  silent actions.
- **Paired design isolating the gate**: control = SURPLUSFEED=1 (governor
  on, no gate) + base policy; armed = SURPLUSFEED=1 + SHAREGATE_B=1 +
  sharegate variant policy. Same commit, identical seeds (8 fresh seeds
  9011–9018 x {leadfeast, belongfeast} x {control, armed} = 32 runs).
- **PRIMARY (all must hold; any miss = NO-GO, never re-scored per §14)**:
  1. armed rot (rotFresh+rotPreserved corpus totals) <= 0.90x control
     (the trim still works under the gate);
  2. gate-crossing skips on the armed side = 0 — a quiet skip on a link
     with trust < 40, or a third consecutive quiet skip, anywhere in the
     armed corpus;
  3. post-gate trust trajectories never cross trust-40 on the armed side —
     for every armed link the second pass decided on, its dawn trust never
     drops below 40 after the first gate decision;
  4. trust-crater weeks (a link going trust >= 90 → < 40 within a window
     containing ≥ 1 quiet skip) = 0 on the armed side.
- **Guardrails (all must hold)**: starvation deaths armed <= control;
  median survival armed >= control − 10d; realm dissolutions (national-lost
  edges) armed <= control; national (end-state) armed >= control − 2;
  laundering 0 (armed shareSurplus <= 1.05x control — the layer moves only
  existing pantry kcal through engine verbs, never conjures/stores); no
  new death mechanism (death-cause sets identical).
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max — the
  sim-harness death stop), FEASTSCALE_R13=1 + SEATDRIVE=0 explicit (env
  trap honored). Pilot 8 seeds; confirm (12–16) ONLY if pilot passes.
- **Balanced panel** per §15: attempted; the env-gated-policy-treatment
  inexpressibility class is known (SURPLUSFEED/SHAREGATE_B are not panel
  case identity; the §15 contract substrate and metrics don't cover the
  pre-registered primaries). Attempt, document, never ship a bogus compare.
- **Kill protocol**: zero-trace on pilot miss — DELETE
  scripts/policies/sharegate-b.js; instruments, sweep driver, proof,
  evidence, and corpus land as the verdict record.

## Canon

docs/CANON.md + docs/PRESERVATION.md read first. The feast is the village's
social engine; tribute/tendLink are the REALM's upkeep engine — real pantry
kcal for trust, priced honestly (partial pantries aid partially; thin
tribute accrues arrears, said aloud). "Rot can't be smoked back into food"
untouched. The sharegate layer speaks in the villager's register (a named
villager decides to tend anyway — not a System intervention). Purify/skill
lanes untouched.

## Proof results (pre-sweep — all green)

scripts/test-sharegate-b.js (run with FEASTSCALE_R13=1 SEATDRIVE=0 per the
Usage header):

- (a) trust-30 fixture: two weeks at trust 30, lean pantry → both weeks
  covered (cover-fray), tendLink called twice, quiet skips = 0, voice line
  present ("wearing thin (trust 30)"). The gate never skips below the
  floor.
- (b) skip cap: 5 eligible weeks at trust 50 →
  skip,skip,cover-cap,skip,skip — max consecutive quiet skips exactly 2.
- (c) belong trust-30: payTribute covered both weeks, no skips.
- (d) bare-pantry refusal: engine returns 0 → attempt recorded as
  cover-fray with kept=false, paid=0; counted refused-not-covered; no
  layer cover-voice fires over the engine's own bare-pantry refusal.
- ENGAGE (8802 leadfeast-sharegate, SURPLUSFEED=1 + SHAREGATE_B=1, 150d):
  gate fires on the exemplar shape (coverTend = 17), trim still fires
  (trimKcal > 0), every quiet skip at trust >= 40, and the INDEPENDENT
  week ledger (rebuilt from the upkeep instrument — tend events, dawn
  tdw stamps, cover attempts; a base-pass late-week tend keeps the week,
  a refused cover is an honest engine refusal) shows zero gate-crossing
  weeks. One timing subtlety found and fixed during proof: the layer
  evaluates trust at decision time (daytime); dawn snapshots can lag it
  (linkTick settles at the week boundary — trust 48 at the d28 decision
  vs 38 at the d28 dawn). The ledger samples decision-time trust when the
  layer decided that week, dawn otherwise; the kept/skip reconstruction
  stays fully instrument-based.
- RED (SHAREGATE_B unset): variant ≡ base byte-identical rows,
  leadfeast-sharegate≡leadfeast and belongfeast-sharegate≡belongfeast,
  pilot's exact control env (SURPLUSFEED=1), seeds 8801/8802, 60d — 4/4
  pairs identical.
- DET: gate-off repeat byte-identical; gate-on repeat byte-identical.

One design addition during proof: the gate's covers ride feastscale's
trackTribute wrap (the same feast-contribution accounting as the base
pass) — the kcal was really paid, so the feast layer sees it; no shadow
ledger. Follows the sim-upkeepgate-b precedent.

PROOF GREEN — the pilot sweep may proceed. The gate-off path is inert;
the gate-on path is deterministic.
