# sim-foodskill-b — #524 food-skill table lever (78 occupations) — NO-GO / KILLED
run: 2026-10-18 (loop B) | arm sim-foodskill-b | axis food-economy | verdict: KILLED at mechanism gate

## PRE-REGISTRATION (docs/MEASUREMENT.md §14 — binding, written BEFORE any sim)

- **MECHANISM gate**: instrument computing expected occupationFoodSkill over the
  genCharacter uniform pool (78 occupations) = **1.062 ± 0.004** — the pre-gengap
  baseline recomputed on the same pool definition. Proof fixture pins it.
  Honest ratings only; no inflation to hit the number.
- **PRIMARY (food-economy)** — gated on mechanism GO, pilot 8 seeds first:
  paired villager starvation-days armed ≤ control + 2 AND lean-day pantry kcal
  ≥ control (paired sign test).
- **GUARDRAILS** — gated on mechanism GO: wall sweep 8 FRESH seeds (verified zero
  overlap by grepping evidence/ SEEDS= lists) × {leadfeast,belongfeast} ×
  {control,armed}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 explicit,
  identical seeds: national ≥ control−2, wins within ±2, no new death mode
  (kind-captured death instruments, canonicalized causes — findings #517/#525),
  |mean paired survival Δ| ≤ 15d noise-scaled.
- **SENSE-TEST**: sample a foraging day's narration for 2 villagers — do the
  higher-skilled read as more capable people?
- **Kill protocol**: NO-GO → revert data change, commit evidence only as KILLED.

## Scope correction (builder finding, before work)

The arm brief assumed a "food-skill table" in `src/data/characterGen.json`.
There is none: characterGen.json carries NO foodSkill field
(verified: only "food" strings are teachTags entries). The table is
`Game.occupationFoodSkill()` (src/js/game.js:27412) — a NAME-substring heuristic
(1.5 land-feeders / 1.3 food people / 1.1 outdoors-practical / 1.0 default /
0.8 indoor / 0.6 desk). A real lever would be explicit per-definition ratings
in data + a lookup shim in the function. The instrument below computes exactly
what that armed build would produce, through the REAL function, with the 23
honest ratings as an in-script override map — no repo data touched, so nothing
to revert on kill. characterGen.json verified CLEAN (`git diff --quiet HEAD`).

## Proof (scripts/test-foodskill-b.js — PART A/B/C/D, node harness, seeded before eval)

- **PART A — baseline recomputed via real `Game.occupationFoodSkill` over the
  uniform genCharacter pool (78)**: old55 mean = 1.0618 ✓ (matches pre-gengap
  1.062); all78 = 1.0410 ✓; new23 = 0.9913 ✓ — the gengap finding reproduces
  exactly. Old-55 distribution: 10×1.5, 4×1.3, 10×1.1, 14×1.0, 15×0.8, 2×0.6.
- **PART B — honest re-ratings of the 23** (ladder kept; justifications below):
  10×1.1 + 4×1.0 + 9×0.8 → new23 honest avg **0.9652** → armed all78 mean
  **1.0333**. **MECHANISM GATE: FAIL** (1.0333 ∉ 1.062 ± 0.004).
- **PART C — dishonest-ceiling bound** (all four debatable 1.0s stretched to
  1.1): 1.0385 — still misses. NO-GO is robust, not a judgment call.
- **PART D — sense sample**: farmer (1.5, identity base 2250 kcal): "grew soy
  and sweet corn on two hundred acres. They know soil by smell and weather by
  the ache in their knees. This ground is strange, but ground is ground."
  piano tuner (0.8, base 1500 kcal): "tuned pianos for thirty years, by ear
  and by feel. They can hear a pin slipping a quarter-turn before it goes."
  Verdict: the higher-skilled villager reads as a genuinely more capable
  forager — the skill number tracks the fiction. PASS (2.25x vs 1.5x base).

### Honest rating table (id: rating — justification)

- 1.1 (10): dockworker (waterside physical labor; sailor/truck-driver analog);
  florist (daily plant handling + knowledge-route foraging/forage_sense/
  herbal_medicine); postal_worker (pathfinder-granted foot navigation);
  taxi_driver (truck-driver analog); bike_messenger (pathfinding + endurance);
  lifeguard (sailor analog); zookeeper (veterinarian analog: animal handling);
  chimney_sweep (exterminator analog: heights/flues/solitary physical trade);
  arborist (tree work, plant structure); bus_driver (truck-driver analog).
- 1.0 (4): crossing_guard, night_security_guard (vigilance, not land skill);
  aquarium_keeper (captive fish ≠ wild fishing); rail_conductor (train ops).
- 0.8 (9): barber (tailor analog), piano_tuner, radio_dj, pottery_instructor
  (artist analog), hotel_housekeeper, comic_shop_owner, tattoo_artist (artist
  analog), dry_cleaner, sign_painter (artist analog).

## Verdict: NO-GO — arm KILLED

The honest lever cannot restore 1.062. Per kill protocol: **no data change
committed** (none was made), no PRIMARY/GUARDRAIL sims run (the gate they would
test did not pass — spending 16+ seed-runs on a reverted lever is waste),
evidence + proof script committed as KILLED. Fast kills are throughput.

## Metric review

- The mechanism gate was calibrated to RESTORE the pre-gengap baseline
  (1.062 ± 0.004). Honest ratings land at 1.0333 — a 0.029 miss, ~7× the
  tolerance. The gate is not wrong for this arm (the arm promised restoration);
  the verdict is NO-GO, not a re-score.
- Root finding: **1.062 is an artifact of the curated 55-occupation pool**
  (10×1.5/4×1.3/10×1.1 food-trade bias). A 78-occupation world of real trades
  averages ~1.034 honestly; even dishonest stretching caps at 1.0385. There is
  no honest rating set that gets back to 1.062 — the dilution is structural.
- The 0630Z adjudication already proved the gengap wiring wall-neutral on
  current master, so no wall action is owed by this arm. Decision for Steve
  (his call): (a) accept ~1.034 as the honest 78-occupation world, (b) accept
  the 1.041 status quo, or (c) add NEW food-trade occupations to the background
  survivors (new content — a design decision, not a re-rating lever).
- Instrument note: the armed value was computed through the REAL
  `occupationFoodSkill()` with the 23 overrides applied in-script — identical
  to what an explicit-rating data table + lookup shim would produce. If Steve
  picks (a) or (b), that shim is the follow-up build; if (c), a content pass.

## Wall numbers

Killed at mechanism gate — no sims run, no wall numbers owed. Status quo
(control) wall numbers stand from the 0630Z adjudication.

## Findings for sim-findings.md

- [open] 2026-10-18 — food-skill "table" is a name heuristic — characterGen.json
  carries NO foodSkill field; `Game.occupationFoodSkill()` (game.js:27412) rates
  by occupation-name substring. A real data-driven lever needs explicit
  per-definition ratings + a lookup shim. (run sim-foodskill-b).
- [open] 2026-10-18 — 1.062 pool baseline is a curated-pool artifact —
  sim-foodskill-b proved honest 78-occupation ratings cap at ~1.034 (dishonest
  ceiling 1.0385); restoring 1.062 requires either new food-trade content or
  dishonest inflation. Steve's call. (run sim-foodskill-b).
