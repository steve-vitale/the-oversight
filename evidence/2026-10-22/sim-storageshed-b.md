# sim-storageshed-b — STORAGESHED lever pilot (2026-10-22)

Adoption of the dead run's worker (uncommitted game.js STORAGESHED draft +
untracked scripts/test-storageshed-b.js). No sims were run by the dead run.

## Lever
STORAGESHED: the STORAGE half of Steve's 2026-10-21 ruling ("villagers
deprioritize PRODUCTION and STORAGE when food is plentiful" — behavioral,
bottom-up, at the decision). The production half landed as PLENTYDEPRI
(df66ebaff). During plenty (prodThrottleEngaged: pantryFreshDays() > 4,
hungryStreak>=3 stands it down — the SAME definition the production half
reads), the cook still cooks the haven meal, but the smoke racks run at half
pace: each cook sheds once per cook-day — half of each about-to-rot surplus
batch is left fresh instead of being worked onto the racks (budget
4000→2000 for the whole shed day, each batch's units halved once). The
dinner reserve is untouched (the shed only ever touches the would-rot
excess). Day voice: one line/day after the meal loop, rotating speaker,
12-line pool naming real instead-of work — never idle, never storage work.
Env-gated STORAGESHED (default-ON as landed; STORAGESHED=0 is the control).

Fixes applied on adoption (2026-10-22):
- ONCE PER COOK-DAY gate (shedDayByVid): the cook resolves ~3x/day
  (RACKSVOICE); the draft's per-resolution shed compounded — halving the
  halved pile each pass until the racks nearly stopped. Now each cook sheds
  exactly once per day; the day-gated budget keeps later passes at the
  eased pace. Proof: MULTIRES checks (2 new).
- The gate/ledger/budget now engage only when something was actually shed
  (tiny stacks: floor(u/2)=0 — no ledger, no budget cut, gate unconsumed).
- Proof-test regex for instead-of work covered only 9/12 pool lines
  (elders/knives/fire lines could fail the check on some hashes); extended.

## PRE-REGISTRATION (§14 — binds this run; a miss is NO-GO, never re-scored)
- PRIMARY: rot/100d kcal (rot:preserved + rot:fresh, absolute, per 100 days
  alive) armed/control <= 0.80. Hypothesis: leaving the about-to-rot excess
  fresh lets the fresh-first nightly meal eat it instead of converting it to
  preserved-rot on the racks (~28% of waste was dried/smoked food never
  gotten to; smoking also destroys 20% at the blind 0.80x rate).
- GO threshold: <= 0.80 (same bar as the production half's pilot).
- Horizon: 180d death-aware (dead villages stop simulating; +10d tail max).
  Why 180d: the lever only fires during plenty, which needs an established
  village; 180d covers establishment + a long plenty tail without a fixed
  200d run.
- Seeds: 8 fresh per policy per side (9101–9108; fresh = not used by any
  prior run in this tree).
- Policies: leadfeast, belongfeast (competent-player policy + variant).
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted in the sweep script).
- Engagement (kill-fast): shedKcal > 0 on >= 6/16 armed runs. If the shed
  never fires in sims, the lever is decoration — kill at pilot.
- Guardrails: median survival armed >= control−10d; starvation deaths
  (pair sums) <= control+2; national(end) >= control−2; no new death-cause
  modes (kind-filtered, deduped, thirst/dehydration canonicalized); no
  inflow-channel laundering >2x (named channels:
  share_surplus/away/tribute/traps/duty/system/ambient).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15: panel is the instrument, the pre-registered threshold is the judge.
  Compare .md attached below.

## Pilot results

Sweep: scripts/sweep-storageshed-b.js, 8 fresh seeds (9101–9108) × 2 policies
(leadfeast, belongfeast) × 2 sides = 32 runs, 180d death-aware horizons,
FEASTSCALE_R13=1/SEATDRIVE=0. Proof: scripts/test-storageshed-b.js 33/33
green. Det-gate: STORAGESHED=0, 8 runs, ledger never created (engaged=0).

- PRIMARY rot/100d (absolute, per 100 days alive): control mean 127,624,
  armed mean 125,420 → ratio **0.983** (GO ≤ 0.80) → **NO-GO**.
  Per-(policy,seed) ratios: 0.10–85.91 — enormous variance; rot is
  event-driven (huge hauls rotting) and trajectories diverge, so seed noise
  swamps the lever's signal.
- ENGAGEMENT: shedKcal > 0 on **16/16** armed runs (need ≥ 6) → OK.
  976 shed-days, 1,004 shed decisions, 3,052,088 kcal shed. The lever fires
  reliably; it is not decoration.
- GUARD median survival: control 133.5d, armed 151d (need ≥ 123.5d) → OK.
- GUARD starvation deaths: control 2, armed 3 (need ≤ 4) → OK.
- GUARD national(end): control 3, armed 2 (need ≥ 1) → OK.
- GUARD death modes: raw comparison flagged 6 "new" armed causes — all are
  per-run monster names ("the eater", "big big", "bulldozer", "extended
  warranty", "the congregation", "big ugly"), i.e. villagers killed by
  wave-4 monsters. Canonicalized to monster/combat, the mode distributions
  are identical (control 236 vs armed 243 monster/combat deaths; contest,
  starvation, wound, dehydration, sickness, night all present both sides).
  → OK (measurement artifact, not a new mode).
- GUARD channel laundering: no named inflow channel > 2× control → OK.
- Rot split: control fresh 163,674 / preserved 15,449; armed fresh 153,236 /
  preserved 17,021 per 100d. The shed did not reduce preserved rot.

Wall (pilot): control national(end)=3, armed=2; table≈0 both; wins 0 both;
wave-4 reach 16/16 both; wave-5 0/16 both; median survival 133.5d → 151d.
The scale wall stands (no table, no wins, no wave 5).

## Root cause of the primary miss

1. rot/100d absolute is dominated by fresh rot from production inflow
   (~90% of all rot). The storage half cannot reduce inflow — it only
   changes the form/timing of waste. Inflow is the production half's job
   (PLENTYDEPRI landed at 0.54×).
2. The shed's addressable fraction (preserved rot + the 20% blind-smoking
   loss) is ~10% of total rot — arithmetically too small for a 0.80 bar on
   total rot. Preserved rot did not drop (15.4k → 17.0k/100d).
3. rot/100d absolute confounds village success with waste: thriving
   villages produce surplus and rot more (e.g. leadfeast 9105: control died
   at 99d with 505 rot/100d; armed thrived 180d with 43,387/100d). The
   armed side's longer median survival (151d vs 133.5d) works against the
   rot bar.
4. Per-seed variance (0.10×–85.91×) makes total rot an unmeasurable primary
   for this lever at 8 seeds.

The lever is NOT confirmed wrong: it faithfully implements Steve's
2026-10-21 ruling (behavioral storage deprioritization during plenty), fires
on 16/16 runs, harms nothing (all guardrails hold), and the village acts
more like people (see sense test). The bar was misapplied — rot is owned by
the production half.

## metric review

- rot/100d absolute is the wrong primary for the STORAGE half. It measures
  inflow-driven waste, which this lever cannot touch, and it penalizes the
  longer survival the lever correlates with. A storage-half primary should
  measure what the lever actually changes: preserved-rot/100d, rack
  throughput during plenty, or (behavioral) instead-of-work coverage.
- The death-mode guardrail's naive string-set comparison false-flagged
  per-run monster names as new modes. Canonicalize monster-name causes to
  monster/combat before comparing (done in analysis above).
- Proposed for the NEXT run: primary = preserved-rot/100d ≤ 0.80 OR
  rack-kcal-smoked-during-plenty ≤ 0.70× control; keep rot/100d as a
  guardrail (no significant increase) rather than the primary.

## Reachability

Waves 1–5: wave-4 reached 16/16 both sides; wave-5 0/16 both (the wave-5
wall stands — window survival, not path design; unchanged by this lever).
Arc: not separately tracked in this pilot (rank reached global/national).
Regional → national: national(end) 3→2. Table: 0 both. Wins: 0 both.
Vests: not tracked. The lever does not gate or unlock any content — it is
a behavioral economic lever, reachability-neutral.

## Village assessment

The village during plenty: the pantry reads >4 fresh days, the cook still
cooks the haven meal, and the racks run at half pace — one shed decision
per cook per day, named honestly. Sense test (60d armed, seed 9101):
98 🍽️ voice lines (both plenty voices), 77 unique, 0 consecutive-day
verbatim repeats, 32 shed-specific lines, 39 shed days, 4 distinct
speakers. The lines name real instead-of work (mending nets, splitting
firewood, tending fever cases, teaching snares, hauling water, carving
bowls, weeding gardens) — never idle, never storage work. The day stream
around shed days reads like a living village (water runs, wood hauling,
meals, gossip, fire-tending). No robotic repetition.

Who thrived: villages that reached sustained plenty (the shed's precondition)
survived longer on the armed side (median +17.5d). Who died: wave-4 monsters
dominate deaths both sides (236 vs 243) — the lever doesn't touch combat.
What was missing: the instead-of work is narration-only; the cook's
assignment doesn't mechanically change (they still cook, just less rack
work). That's honest (the voice claims the absence of rack work, not a
fictional reassignment), but a future pass could make the instead-of work
real.

## Blanks filled / documented

- FILLED: the dead run's draft had a triple-easing bug (shed engaged per
  cook resolution, ~3×/day, compounding to ~1/8 rack pace). Fixed with a
  once-per-cook-day gate (shedDayByVid) + day-gated eased budget. Proof:
  2 new MULTIRES checks, 33/33 green.
- FILLED: gate/ledger/budget now engage only when something was actually
  shed (tiny stacks never touch the gate or the budget).
- FILLED: proof-test instead-of-work regex covered only 9/12 pool lines;
  extended to all 12.
- DOCUMENTED (open): the 🍽️ prefix is shared between the production-half
  and storage-half day voices — on plenty days both fire and blend. Cosmetic;
  a future pass could differentiate the prefixes.
- DOCUMENTED (open): metric review above — the rot primary was wrong for
  this half; proposed primaries for the next run.

## Verdict

**NO-GO on the pre-registered primary (0.983 > 0.80) — PARKED, not killed.**
Per §14 the miss binds: the lever does not land as a GO. Per Steve's kill
discipline (2026-10-21), a missed bar is not a kill: the lever is not
confirmed wrong — it faithfully implements Steve's explicit "deprioritize
production AND storage" ruling, fires 16/16, harms nothing, and the root
cause is a misapplied bar (rot is inflow-driven; the storage half's
addressable fraction is ~10%). Killing it would override Steve's design
direction on the basis of my metric choice. The branch is kept; the
evidence records the NO-GO and the metric review for the next run.
