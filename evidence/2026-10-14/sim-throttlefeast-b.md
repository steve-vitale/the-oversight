# sim-throttlefeast-b — does the production throttle starve the feast road?

fleshout-b, 2026-10-14 (run 2026-10-14T04:35Z) | axis: scale-onramp (via food-economy lens) | arm: throttlefeast
Type: MEASUREMENT ONLY — no game-code changes, no policy-code changes. The
"off" arm neutralizes the throttle through a post-load instrument wrap in the
sweep script (THROTTLE_OFF=1); game.js is untouched on disk, nothing to commit
or revert. Proof test scripts/test-throttlefeast-20261014.js pins the wrap
(R1 RED-probe: pristine gate engages true on a stocked pantry; wrap reads false).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binds the run)

- Question: the landed production-throttle (game.js prodThrottleEngaged(),
  afb736e6, unconditional: pantryFreshDays() > 4 -> duty forage/garden/fish
  redirected to wood/water/stone) caps the fresh pantry at ~4 days-on-hand.
  Major feasts need surplus (feast affordability gate: pantry >= cost x 1.5).
  Unmeasured: does the throttle starve the feast/plenty road to wave-5?
- Policy (fixed): leadfeast = leadcourt + FEASTSCALE_R13=1
  (scripts/policies/feastscale.js). Two game-code arms:
  - throttle-OFF: instrument wraps Game.prodThrottleEngaged() to () => false
  - throttle-ON: as landed
  Identical seeds both sides. The ONLY delta between arms is the wrap.
- PRIMARY METRIC: mean feasts/run (hostFeast ok=true, "major" feast count)
  + mean plenty-max/run (max of villageStanding().plenty over the run).
- GO (no regression): ON mean feasts >= OFF mean - 2 AND ON mean
  plenty-max >= OFF mean - 20. Either misses = KILL: the throttle regresses
  the feast road — documented as a finding (the fix is a design call, not a
  silent tune).
- GUARDRAILS: national wall-neutral (ON >= OFF - 2), median survival within
  +-10d, hungryDays delta <= +1.
- Horizon: 180d death-aware (runDays stops on village-dead per finding #95;
  10d tail). Why: feasts/plenty/table are late-chain metrics; pacing-law max.
- Seeds: 11,22,33,44,55,66,77,88 (8), IDENTICAL both sides. Pilot (8) before
  any confirm spend; this 8-seed suite IS the pilot gate — no confirm on a
  visible effect.
- Secondaries (wall numbers, every run): national / table / wins, exiled,
  wave-4 unlocks, wave-5 unlocks, wave-4 faced, t4/t5, median/max survival,
  grants, redirects, death-cause shares.
- Instrument honesty: SMOKE=1 gate before spend (policy unwrap, daily calls,
  policy-origin acts, prodThrottleEngaged reachable). Fail loudly on
  policy-less. See sim-findings #99.

## RESULTS

Both arms complete: 8/8 seeds, leadfeast + FEASTSCALE_R13=1, 180d death-aware,
identical seeds. Per-seed JSON: evidence/2026-10-14/throttlefeast-per-seed/
(`throttlefeast-{off,on}-s<seed>.json`; top-level national/table/wins/exiled
for telemetry-check). Aggregates: evidence/2026-10-14/throttlefeast-{off,on}.json.

| metric (8 runs/arm) | throttle OFF (wrap) | throttle ON (as landed) |
|---|---|---|
| **mean feasts/run (PRIMARY)** | 5.50 | 5.38 |
| **mean plenty-max/run (PRIMARY)** | 110.0 | 92.5 |
| total feasts / grants | 44 / 36 | 43 / 22 |
| throttle redirects | 0 | 2,924 |
| national | 3 | 4 |
| table | 2 | 2 |
| won / exiled | 0 / 0 | 0 / 0 |
| wave-4 unlock / wave-5 unlock | 5 / 3 | 5 / 3 |
| wave-4 faced | 5 | 3 |
| t4 / t5 | 5 / 4 | 6 / 4 |
| median survival | 108d | 109d |
| max survival | 138d | 180d (s22 survived) |
| hungryDays (village) | 21 | 16 |
| starvation deaths (individual) | 1 | 12 |

**Pre-registered verdict rule, honored as written:**
- ON mean feasts 5.38 >= OFF mean 5.50 − 2 = 3.50 ✓
- ON mean plenty-max 92.5 >= OFF mean 110 − 20 = 90.0 ✓ (margin 2.5 — near
  the band edge, reported honestly; see metric review)
- Guardrails: national 4 >= 3 − 2 = 1 ✓; median survival 109 vs 108, within
  ±10d ✓; hungryDays 16 vs 21, delta −5 <= +1 ✓

**VERDICT: GO — the landed throttle does NOT regress the feast/plenty road
on the pre-registered primaries.** Feast frequency is essentially identical
(44 vs 43). Plenty points dip (110 → 92.5) but stay inside the pre-registered
band. The throttle does not starve feasts. Nothing lands — measurement only.

## Why the primaries are clean (mechanism)

1. **The pantry cap is leaky.** The throttle only redirects DUTY
   forage/garden/fish; hunt meat, tribute grain, and other inflows bypass it.
   ON seed 22's pantry sat at ~158 fresh days-on-hand mid-run ("the shelves
   are full, ~158 days of fresh on hand…") — the feast affordability gate
   (pantry >= cost x 1.5) never binds on the ON arm in practice. The lever
   throttles a tributary, not the river.
2. **Engagement is policy-contingent.** The throttle fired 2,924× across the
   8 ON runs (median ~250/run) vs 10× across 16 runs in the prodthrottle
   pilot (leadcourt/belongseek). The feast road's surpluses (tribute grain,
   feast prep) engage it constantly; the bare courtship road barely does. The
   lever's effect profile depends on the policy's surplus regime.

## Observations (NOT verdict inputs — secondaries, reported honestly)

- **Grants 36 → 22.** Same-seed divergence concentrates in s22 (12→2) and
  s44 (9→0): ON feasts were devotion-armed (surgeSpent>0) but grantFeastBuff
  refused via the fusion-reactor ceiling (Steve's design, working as
  intended). 60d diagnostic on s22: reactorOnline=true ON vs false OFF
  (wood 1152 vs 9 — the redirect stockpiles wood). The pellet is loot-driven
  and the arms diverge from the first redirect; ON also survived more total
  days (870 vs 727 → more pellet chances). Confounded on n=8 — mechanism
  unproven, filed as a finding, not a throttle verdict.
- **Starvation deaths 12 ON vs 1 OFF** (spread across 5 ON seeds; s11 alone
  had 5 with village hungryDays=0 and 221 redirects — full pantry, starving
  individuals). Village-level hungryDays PASSED its guardrail (16 vs 21), so
  this is a distribution-vs-stockpile question, not a stockpile one. Needs a
  dedicated arm with per-villager meal/away telemetry; filed as a finding.
- **wave-4 faced 5 → 3** with unlocks equal (5/5): trajectories diverge after
  the first redirect; not a pre-registered metric, noted.

## Wall numbers (scale wall — reported every run)

| metric | throttle OFF | throttle ON |
|---|---|---|
| national | 3/8 | 4/8 |
| table | 2/8 | 2/8 |
| wins | 0/8 | 0/8 |
| exiled | 0/8 | 0/8 |
| wave-4 unlocks | 5/8 | 5/8 |
| wave-5 unlocks | 3/8 | 3/8 |
| median survival | 108d | 109d |

Telemetry-check vs the scale-wall baseline: one LOUD line — `table newly
appeared: baseline 0 -> current 4 (n=16)`. Explanation, not a regression:
the baseline predates the feast layer (table=0); this suite runs leadfeast
+ FEASTSCALE_R13=1 on BOTH arms, and the feast layer is what opens the table
chain (plentycost measured the same 0→table effect). Tables appear equally
on OFF (2) and ON (2) — a policy-suite effect, not a throttle effect. The
baseline is NOT rolled for a policy-experiment suite (per instructions).

## Sense-testing (SENSE-TESTING LAW — beats read, judged for meaning)

Read feast/pantry beats from OFF s22 (12 feasts, table), OFF s44, ON s22
(12 feasts, 1355 redirects). Evidence/2026-10-14/throttlefeast-beats/.

- The feast broadcast reads as a real event: "🍖 FEAST 📺 — Thabo opens the
  pantry wide: 1× Tribute grain from Stonebridge, 1× Tribute grain from
  Thornfield, 2× Foraged food (dried). Someone, Someone, Someone, Adaeze and
  2 more eat until the fire burns low. Somebody laughs so hard they cry. For
  one evening, nobody is surviving — they're just together. (−2,900 kcal
  from the pantry)". Named guests, real menu, honest kcal cost, a laugh
  line. Coherent.
- The redirect beat reads as a village decision: "🌿 Walt checks the pantry
  before heading out — the shelves are full, ~158 days of fresh on hand…
  leaves the fish nets standing and turns to the wood run instead. The
  pantry can't take more; the wild will keep." Named villager, specific
  alt-task, legible reason. Coherent — and it fired 32× in the kept window
  without reading stale.
- The scavenger-draw beat works: "🌙 The cookfire's smell carried further
  than the laughter did — smoke and grease on the night wind. ... It
  followed the feast here." Cause and effect legible.
- Robotic notes (filed as findings, not this arm's to fix):
  - The sentimental-item arming line ("The feast was the weapon.") repeats
    VERBATIM across feasts, alternating Hilda's Ring / Beat-up Paperback —
    no memory, no variation.
  - "Someone, Someone, Someone" — canon-consistent (stranger descriptors
    until names are learned) but triplicated it reads as a placeholder.
  - "Big Big is circling the edge of the light" — monster-name doubling
    (name-generator glitch).

## Village assessment (plain words)

The OFF villages feast their way up the plenty road: tribute grain flows
in, the pantry swells, feasts fire every week or two, plenty points pile to
60–240, and on the good seeds (s22, s44, s55) the standing bar crosses
t5=200, wave-5 unlocks, and the table appears — twice. They die anyway,
mostly to the wave-4/5 fights the road promotes them into (death-cause
shares: combat 38%, monster 9-13% — the same killers as baseline).

The ON villages look the same from the fire. The difference is in the
daytime: villagers keep checking the pantry, finding it full, and turning
to the woodpile, the water run, the stone pile — hundreds of times. The
woodpile grows enormous (1,152 on s22 at d60). The feasts still happen on
schedule; the pantry is still full when the fire is lit. One ON village
(s22) even survived the full 180 days. The throttle changed the village's
days, not its evenings.

Who thrived: scholars who seasoned diplomacy links early AND paid tribute
regularly (tribute is the feast fuel — the s22/s44/s55 pattern on both
arms). Who died: everyone, eventually, to combat — the wave-4/5 transition
is the measured wall here, not the scale on-ramp. What was missing: nothing
on the feast road itself. The blank this arm was built to check (throttle
starving feasts) is not there — the throttle is clean on the plenty road.

## Blanks filled / documented

- FILLED: the arm's question — throttle vs feast road, measured 8 seeds,
  identical-seed, GO on both primaries. The landed lever is clean on the
  plenty road.
- DOCUMENTED (sim-findings candidates, not chased mid-run):
  - Grants 36→22 on identical seeds; fusion-reactor ceiling refusals ride on
    divergent trajectories (pellet loot + survival-days confound). A future
    arm with pellet-controlled fixtures could isolate whether the throttle
    systematically accelerates reactor acquisition.
  - Starvation deaths 12 ON vs 1 OFF with village hungryDays passing the
    guardrail (16 vs 21): distribution-vs-stockpile question; needs
    per-villager meal/away telemetry.
  - Sentimental arming line repeats verbatim across feasts (no memory).
  - Monster name doubling ("Big Big").
  - "Someone" triplication in feast guest lists (canon-consistent but
    robotic in triplicate).

## Metric review (§14)

- Pre-registered verdict rule honored as written; no re-score. The plenty
  primary passed with a 2.5-point margin on a ±20 band — near the band edge,
  and I am reporting the margin rather than rounding it away. Had plenty
  landed at 89.9, the verdict would have been KILL per the same rule.
- Grants and starvation-death skew were NOT pre-registered and are reported
  as observations, not verdict inputs — exactly the anti-drift discipline
  §14 requires. They are filed as findings for future arms, not folded into
  this run's GO.
- Seed 55's ~7 CPU-min trajectory (d97, table reached, long survivor) is
  legitimate long-survivor cost, not pathology — confirmed by a bounded 60d
  re-run (3.6s CPU, cheap early; cost is late-game wave-4/5 content).
- Instrument honesty held: SMOKE gate green before spend; proof test
  17/17; the OFF arm's wrap is the only delta (R1 RED-probe pins pristine
  engagement; game.js untouched on disk).
