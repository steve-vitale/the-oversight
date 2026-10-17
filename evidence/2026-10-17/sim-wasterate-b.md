# sim-wasterate-b — waste-rate instrument (food-economy axis diagnostic)

**Date:** 2026-10-17 | **Worktree:** sim-wasterate-b | **Axis:** food economy

## Pre-registration (binding, docs/MEASUREMENT.md §§9-12, 14)

**PRIMARY (attribution gate):** 100% attribution — every waste-rate number traced
to recorded fields. Schema-drift guard green on all four archives
(perseed-wallcensus-b, perseed-trig6, perseed-drawcap, perseed-wasterate).
Conservation residual |rel| ≤ 3% on all 16 new-sweep runs (proves the inflow
wrap set is complete — no missing flow above the threshold).

**VERDICT RULE (one named):** paired-by-seed waste-rate difference
leadfeast−belongfeast. Compute dbar (mean paired diff) and SE.
- (a) **POLICY-SENSITIVE** iff |dbar| > 2×SE AND |dbar|/mean(wasteRate) > 15%
  → write the next-lever spec with a volume-sanity check.
- (b) **SUBSTRATE-FLAT** iff not (a) → park the rot line, document the floor.

**GO = attribution gate green + verdict named.**

**Substrate:** FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat). 8 fresh seeds
4301–4308 (banned-list checked in-script; 4201–4208 are banned/wallcensus) ×
{leadfeast, belongfeast} = 16 runs, 180d death-aware. No lever — base substrate
only (trig6/drawcap layers deleted per kill protocol).

## Metric definition

**wasteRate** = pantryRotKcal / (pantryStartKcal + pantryInKcal), where:
- pantryRotKcal = fresh-kcal rotted in the player's village pantry
  (sweepSpoiled removal of fresh items) + desperationRotKcal (spoiled pantry
  kcal eaten desperately via drawSpoiled — it rotted; eating it doesn't un-rot it)
- pantryStartKcal = village pantry kcal right after setupGame (seed stock)
- pantryInKcal = cumulative kcal deposited into the player's village pantry,
  measured per wrapped deposit funnel as max(0, after−before)

**wasteRateAll** = (pantryRotKcal + pantryRotPreservedKcal) / (pantryStartKcal + pantryInKcal)
(includes preserved-item rot; archive-comparable primary is wasteRate).

**Conservation identity:** S0 + in − out − rot − desp = end. Must hold within
rounding on every run (|rel| ≤ 3%).

## Proof (scripts/test-wasterate-20261017.js)

RED→GREEN. RED: R1 (no fields), R2 (naive double-wrap foil counts 2×),
R3 (drawSpoiled archive blind spot documented). GREEN: G1–G13 (exact
accumulation, cap refusal, reentrancy guard, funnel round-trip, invisible-
mutation detection, outflow exactness, desperation rot, pantry/compat rot
split, preserved-rot split, S0, determinism, gate-off byte-identity, wrap
coverage incl. G13b counts and G2b stockPantry-direct).

**PROOF GREEN** on seed shifts 0, 100, 200.

### The conservation miss (found and fixed 2026-10-16)

The 1-seed validation showed residual −6% to −9.7% (negative = unaccounted
inflow). Root cause: direct `Game.stockPantry(kcal, label)` calls bypass the
`depositPantryPieces` wrap. Sites: betrayal caches, Hoarder's interest
(buildarounds.js), genesis fruit — +7,108 kcal over 12 days on seed 4301,
concentrated in sleep/doAction/makePlot (time-advancement paths). Fix: added
`stockPantry` to INFLOW (12 wraps); the reentrancy guard absorbs nested calls
(depositPantryPieces→stockPantry, resolveOneAssignment→stockPantry) so no
double-count. Residual now exactly 0.000%.

Also documented: `stockSurplus`'s `Math.round(give/200)` systematically mints
~+72 kcal/call phantom food (6,731 over 93 calls in 12d) when `give` sits in
[100,200) — the "symmetric error" comment is wrong for the observed `give`
distribution. The instrument measures the delta (real pantry gain), so the
phantom is correctly in both `in` and `end` and cancels in the identity. It
IS a real engine bug (phantom food), filed for the food-economy axis.

## Sweep results (16 runs)

Attribution gate: **GREEN**. Schema-drift guards green on all archives
(32+32+16 files, exact key sets, filename↔seed cross-check). Conservation
|rel| = 0.00% on all 16 runs, zero wrap failures, zero instrument errors.

| seed | leadfeast | belongfeast | paired diff |
|------|-----------|-------------|-------------|
| 4301 | 35.6% | 38.3% | −2.7pp |
| 4302 | 56.6% | 56.9% | −0.3pp |
| 4303 | 23.7% | 0.7%* | +23.0pp |
| 4304 | 31.0% | 25.6% | +5.4pp |
| 4305 | 47.0% | 51.7% | −4.7pp |
| 4306 | 0.0%* | 0.0%* | 0.0pp |
| 4307 | 57.0% | 36.4% | +20.6pp |
| 4308 | 21.0% | 32.6% | −11.6pp |

\* village lost at 39–47d (early death; T < 265k vs 700k–1900k for survivors).

**Verdict statistics:** n=8, dbar=+3.70pp (lead−belong), SE=4.30pp,
|dbar|/mean = 11.5%. Mean waste rate: lead=34.0%, belong=30.3%.

**VERDICT: (b) SUBSTRATE-FLAT.** |dbar| > 2×SE? No (3.70 < 8.60).
|dbar|/mean > 15%? No (11.5% < 15%). The feast-scale policy does not move
the waste rate beyond noise.

**The floor (documented honestly):** on surviving villages, ~1 in 3 pantry
kcal rots (mean 32%, range 21–57% across 13 surviving runs). The waste is
substrate, not policy: it comes from the spoil clock (freshDay = day+3)
outrunning consumption on the base economy, and no feast-scale lever changes
the ratio. Per the pre-registration, the rot line is parked.

## Archive analysis

The archives record NO pantry-throughput field:
- perseed-trig6 (32): freshRotKcal ✓, villagerDays ✓, throughput ✗
- perseed-drawcap (32): freshRotKcal ✓, villagerDays ✓, throughput ✗
- perseed-wallcensus-b (16): pantryKcalEnd ✓ (end-stock only), freshRotKcal ✗

A true waste rate (rot/throughput) is computable ONLY on the new sweep.
The archives contribute wall numbers + freshRot context; the gap is
documented, not papered over.

Archive freshRot (median): trig6 404k (n=32), drawcap 312k (n=32).
wallcensus-b median pantryKcalEnd 28k (end-stock only, not throughput).

## Wall numbers

| archive | n | wins | national | table | wave4 | wave5 | median days |
|---------|---|------|----------|-------|-------|-------|-------------|
| perseed-trig6 | 32 | 0 | 24 | 31 | 0 | 0 | 167 |
| perseed-drawcap | 32 | 0 | 25 | 31 | 0 | 0 | 147 |
| perseed-wallcensus-b | 16 | 0 | 15 | 0 | 0 | 0 | 180 |
| perseed-wasterate (new) | 16 | 0 | 13 | 12 | 0 | 0 | 170 |

Zero wins and zero wave-4/5 unlocks across all 96 runs. The wall sits at
national/table scale on the pre-seat substrate (FEASTSCALE_R13=1, SEATDRIVE=0):
villages reach the table but do not win; wave 4 never unlocks. (Seat-drive
effects are a separate axis; see the seatpath diagnostic.)

## Village assessment

The pantry is a flow-through, not a stockpile: median throughput T ≈ 1.2M
kcal over a full run, ending at ~28k (wallcensus-b). Villages eat what they
get; ~32% rots because the 3-day spoil clock outruns the consumption rate.
The two levers tested (leadfeast vs belongfeast) change WHO eats first, not
the rot fraction — the waste is in the substrate's timing, not the policy's
allocation.

## Blanks

1. **Archive throughput gap:** no archive records pantry-throughput; the
   waste-rate floor rests on the 16-run new sweep alone.
2. **drawSpoiled blind spot (R3):** pre-existing archives' freshRotKcal
   excludes desperation-eaten rot; the new instrument captures it separately.
3. **stockSurplus phantom:** ~+72 kcal/call systematic; in the rate's
   numerator and denominator equally (cancels), but it inflates absolute
   pantry levels.

## Metric review

The trig6-b §14 review named rot-per-pantry-kcal as the prize over absolute
rot (lever signal 337k drained vs ±591k/pair trajectory noise). This run
built that instrument and measured it: the waste rate is well-defined
(conservation 0.00% on 16/16), but it is SUBSTRATE-FLAT — the paired policy
test cannot distinguish leadfeast from belongfeast (dbar=3.70pp, SE=4.30pp).
The metric is sound; the lever is not. The §14 prize was the right question
— the answer is that the rot fraction lives in the spoil clock and the
consumption rate, neither of which the feast-scale policy moves. The next
lever, if any, belongs at the spoil/consumption substrate (shelf life,
meal sizing, preservation), not at feast allocation. Per the pre-registered
verdict rule, the rot line is parked and the floor (~32% on survivors) is
filed as the result.

## Verdict

**(b) SUBSTRATE-FLAT.** dbar=+3.70pp, SE=4.30pp, |dbar|/mean=11.5% — neither
prong of the pre-registered rule fires. The waste rate does not respond to
the feast-scale policy beyond noise. The rot line is parked; the floor is
~1-in-3 pantry kcal rots on surviving villages.
