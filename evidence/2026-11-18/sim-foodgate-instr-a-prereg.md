# sim-foodgate-instr-a — FROZEN PREREG

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp. Worker arm
sim-foodgate-instr-a. Finding **#2557-A / carrier food-gate
instrumentation** (Loop B reused the number #2557 the same day for a
different finding, the post-quad launch drought — this arm cites its
finding as #2557-A throughout to avoid confusion).

## Question

Finding #2557 (evidence/2026-11-18/sim-scale-onramp-round-1715.md):
the field-engine Rage carrier (held branch sim-fieldcarrier-a, NOT on
master) fired in the wild — arm 16 held / 6 fired, control 0/0 — but 2
of 8 engaged held fights never fired, and a probe verified BOTH
candidate gates live: (a) food tier `tight`/`starving` blocks
`fieldAct`; (b) hunger 79 blocks the 60-kcal Rage pay. The corpus
records NEITHER tier nor hunger. This arm instruments both gates on
the field-fight encounter row and measures how often each bites, so
the next carrier retune argues from counts, not from a probe.

## Instrument (committable on master on its own)

- `src/js/godpath.js`: `fieldAct` tier-gate early returns set
  `G.tierBlocked` (`'starving'` | `'tight'`), first round, and a
  blocked-round count; `fieldPay` records a failed pay on `G`
  (count, first blocked `{id, actId, kcal, hunger}`, and a
  `payBlockedRage` flag); the Rage branch sets `G.rageFired`.
  Reads only, no RNG, no behavior change: flag-setting on paths that
  already returned.
- `src/js/fieldFights.js`: the fight record carries `foodTier`
  (fight-start tier, from the live `fieldBegin` state when present),
  `hungerStart` (fighter hunger at fight start, via `npcNeeds`),
  `holdsRage` / `gpActive`, the copied gate flags
  (`foodgateTierBlocked`, `foodgateTierBlockedRound`,
  `foodgateTierBlockedCount`, `foodgatePayBlocked`,
  `foodgatePayBlockedRage`, `foodgatePayBlockedFirst`),
  `rageFired`, and `carrierRageHeld` / `carrierRageFired` (copied
  when the carrier is staged; false on master). No proxy: every flag
  is set by the code that actually checked the gate (finding #2553's
  snapshot-proxy retirement stands — no reintroduction).
- Driver `scripts/foodgate-driver-a.js` (adapted from the carrier
  driver, same recorder): encounter rows also carry the foodgate
  fields plus `trickLog` (finding #2558's competing explanation).
  Analyzer `scripts/analyze-foodgate-a.js` computes the bite rates
  below from raw rows. Panel builder
  `scripts/build-foodgate-panels-a.js` (§15).

## Primary metric (frozen)

Bite rate of each gate on the **engaged held population**:

- Denominator N (arm leg): engaged held fights = encounter rows with
  `carrierRageHeld === true` AND `outcome !== 'evade'` (wave 4+,
  150d, competent policy, seeds 104601–104608).
- Tier-gate bite: `foodgateTierBlocked != null` → n_tier / N.
- Hunger-gate bite: `foodgatePayBlockedRage === true` among the
  tier-unblocked engaged held fights → n_hunger / (N − n_tier).
  (Sequential gates: the tier gate runs first; a tier-blocked fight
  never reaches the pay, so the hunger denominator excludes it.)
- Fires: `carrierRage === true` → n_fires / N.
- Never-fired decomposition (must sum to N − n_fires): tier-blocked /
  hunger-blocked-rage / trick-displaced (`trickLog` non-empty) /
  other (listed by seed/day/vid/mid).

Secondary (master-alone, ctl leg): the same three rates on the
real-Rage population — engaged wave-4+ rows with `holdsRage === true`
AND `gpActive === true` — where `rageFired` replaces `carrierRage`.
This is the fallback measurement if the carrier cannot be staged
cleanly, and the context for whether the gates bite real Rage too.

## GO threshold (frozen)

GO iff ALL of:

1. Instrument landed: proof test
   `scripts/test-foodgate-instr-a.js` green (tier/hunger recorded
   truthfully; gate flags set only by the checking code; analyzer
   selftest green), 0 instrument errors on both legs.
2. Field completeness: 100% of engaged rows on both legs carry
   non-null `foodTier` and `hungerStart` (a null on an engaged row is
   an instrument failure, not a zero).
3. Bite rates measured with counts on the arm leg: N ≥ 4 engaged held
   fights (half the 1715Z count of 8 — a floor that keeps the rate
   meaningful), each rate reported as n/N with the denominator
   defined above. If N < 4 the verdict is THIN-POOL (instrument still
   landed; measurement inconclusive), never a re-scored GO.
4. Panel expectation (§15, pre-registered): instrument-only, zero
   behavior deltas — panel before (pristine master, same driver,
   FIELDCAPDMG unset) vs after (instrument, FIELDCAPDMG unset)
   returns `no_material_signal`. A `review_required` on a secondary
   metric is an investigation note, not a re-score; a
   `regression_signal` is a same-run investigation item.

Cost bars (guardrails, not the judge): community loss, starvation,
median survival on the arm leg within the 1715Z arm leg's values ±
the usual tolerance (arm 2/8 community loss, 2 starvation, 150d
median) — the instrument must not move trajectories; any move is
investigated as an instrument bug, not a lever effect.

## Horizon, seeds, policies (frozen)

- Horizon 150d, death-aware (dead villages stop simulating; +10d
  tail max). Same horizon as the 1715Z carrier pilot, so the
  engaged-held pool is comparable.
- Seeds 104601–104608 (8 seeds, pilot). DELIBERATE matched-band
  reuse: this is the band where the carrier fired 6x in the wild
  (1715Z). Anchor differs — this tree is at master 6a97f3a07
  (journey r145 landed after 1715Z's 41a47a7b9) — so bit-identity
  with the 1715Z corpora is NOT assumed; the 1715Z numbers (16 held
  / 8 engaged held / 6 fired) are a sanity read, not a bar.
- Policy: competent verbatim (`scripts/policies/competent.js`),
  150d. Env both legs: VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1.
- Legs: ctl = instrument on master, FIELDCAPDMG unset; arm =
  instrument + carrier staged (cherry-pick of sim-fieldcarrier-a
  e3a77c411 into a SCRATCH worktree only), FIELDCAPDMG=1. The
  carrier staging is diagnostic-only and is reverted before commit:
  the committed instrument stands alone on master. If the carrier
  cannot be staged cleanly, measure on master alone (secondary
  population above) and say so explicitly.

## Sense-test (frozen)

Read one or two full fight logs where a gate bites (staged proof
fights + corpus rows): does the narration explain — or at least not
contradict — why the fighter's strength never came? A tier-blocked
fight that narrates a full-strength fighter is a sense failure to
record, not to fix mid-run.

## Metric review

(To be filled at closeout. The tier/hunger denominators are
sequential by construction — if the arm leg shows the tier gate
biting on fights where the hunger gate would also have bitten, that
overlap is unmeasurable from this instrument and belongs here, not
in a re-scored rate.)

## Claims

- Axis: scale-onramp (standing directive). Arm: foodgate
  instrumentation (#2557-A). No other arm claims this finding in
  this run.
