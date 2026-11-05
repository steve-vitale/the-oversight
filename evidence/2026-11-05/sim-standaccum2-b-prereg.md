# Pre-registration — arm sim-standaccum2-b (Loop B run fleshout-loop-b-20261105T0139Z)

DIAGNOSTIC ONLY, zero src/js game changes. No readyDemand move, no
VETSHAPE flip, no gate/price/deed change. This arm takes the 2330Z
run's named next blank #2 (standing accumulation, part 2): whether
a village that meets wave 4 and keeps two killers alive reaches
200 gated AND ready — still never observed in the engine (survgear
showed it only counterfactually, under raw >= 200 with held legs).

## Question

On a FRESH band, does any village with two LIVING wave-4 killers
(veterans bar met) AND wave 4 met reach gated standing >= 200 AND
a readiness-5 ready day? And if not, what is the binding shortfall
on the closest seeds?

The 99101–99108 corpus is CONTEXT ONLY, never the verdict. The
verdict comes from the fresh band below. Do NOT re-judge
99101–99108 as this arm's verdict.

## Corpus

- Band/seeds: 99111–99126 (16 seeds, fresh — no overlap with the
  99101–99108 gearbar band).
- Policy: competent policy VERBATIM, default env, no policy-side
  lever. Same substrate as the 99101–99108 gearbar band (same
  driver shape: vetprod instrument reused verbatim, daily
  snapshots via the policy.daily wrapper, post-run snapshot).
- Horizon: 150d death-aware (dead villages stop simulating,
  +10d tail max), same as vetprod/vetshape/survgear.
- Fresh runs: the standaccum2 driver re-runs all 16 seeds and
  writes evidence/2026-11-05/perseed-standaccum2-b/. The analyzer
  reads this fresh corpus only for judged numbers.
- Pilot gate: first 8 seeds (99111–99118) before any confirm
  spend. If the pilot shows zero two-killer seeds, say so and
  STILL run the full 16 — the question is about existence, and
  16 seeds is the pre-registered band, not a rescue.

## Recorder (daily, per seed)

Same vetprod instrument reused verbatim: raw standing, gated
standing (villageStandingTotal(), side-effecting exactly as
standaccum/survgear did — peak release + hold beats), the
readiness-5 object (ready flag, armored/armed/tricks/veterans
counts, demand, short list), wave-4 kill/killer counts, roster
size. Finalize copies the full waveKillLog and the full fallen
list. Living killers per day are DERIVED offline from kill log +
fallen list via vetprod's killerFates (single source of truth,
reused not re-implemented divergently) — the snapshot's engine
veterans count is the cross-check, not a second derivation.

## Definitions (fixed before any judged sim)

- Killer = a vid with >= 1 wave-4+ kill in state.waveKillLog
  (base-wave rule as in vetprod/vetshape/survgear: log entry
  w >= 4).
- Killer fate: firstDay = first wave-4+ kill day; deathDay =
  earliest fallen entry with day >= firstDay, else null (alive
  at end of run); same-day kill-and-die contributes to NO day
  at E = 0 (vetprod rule, kept).
- Living killers on snapshot day d, L(d) = killers with
  firstDay <= d AND (deathDay null OR d < deathDay).
- Engine ready on day d, R(d) = snapshot readiness5.ready
  (true only when all four bars are met on live state).
- Gated on day d, G(d) = snapshot gated standing.
- Wave 4 met on a seed = unlockedWave >= 4 at finalize, OR
  any wave-4 fight/kill recorded (kills imply unlock, since the
  wave-4 pool is unlock-gated). Reported per seed; the primary
  conjunction below already implies it whenever kills exist,
  but it is reported separately so an unlock-without-kill seed
  is never mistaken for a release candidate.
- RELEASE DAY (primary event): a SNAPSHOT day d with L(d) >= 2
  AND G(d) >= 200 AND R(d) true. Note the engine mechanics that
  make this a genuine release, not a loose conjunction: while
  readiness-5 is unready, villageStandingTotal() holds gated at
  t5-1 = 199 (defer5 hold), and while plenty-capped it holds at
  199 (cap hold) — so gated >= 200 on a day can only appear
  once the holds have lifted, i.e. once the village is actually
  released. The peak ratchet (floor at 200 after release) means
  a later re-banking day could also satisfy the conjunction;
  that still counts as a release day and its day is reported,
  with the FIRST such day named as the release day.
- Closest seed (fallback, fixed ranking — no post-hoc picking):
  among seeds that ever bank >= 2 killers, the one with the
  highest gated peak; tie-break by most snapshot days with
  L(d) >= 2, then by lowest seed number. If NO seed ever banks
  >= 2 killers, the closest seed is the one with the highest
  gated peak (tie-break: lowest seed). For the closest seed,
  report: gated peak, raw peak, ready days (count of snapshot
  days with R true), killer bank/death days, and which leg
  binds (the engine short list on its peak-gated days, plus
  the derived short set on its best-L days).

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: count of error-free seeds with >= 1 release day as
  defined above.
- Verdict DIAG-GO iff >= 1 such seed is observed, with its full
  trajectory quoted (release day, gated/raw on that day, the
  four readiness bars on that day, killer bank/death days, wave-4
  unlock day if recoverable from snapshots, prior peak-gated
  days). Verdict DIAG-NO iff zero on all 16 error-free seeds —
  that is still an answer (a bound: no release observed in 16
  fresh competent runs), not a failure to report.
  INSUFFICIENT-DATA only if > 2 seeds carry instrument errors.
- SECONDARY (all reported, none judged): per-seed table —
  killers banked (ever), killer death days, max L(d), days with
  L(d) >= 2, gated peak, raw peak, ready days (R true count),
  wave-4 unlock / faced / kills, end reason, run days;
  cross-check mismatches between derived L(d) and engine
  veterans count (count of snapshot days where they differ);
  binding-leg day counts on raw >= 200 days (derived short
  sets); killer kill-to-death intervals (sorted, median).
- REPRODUCTION / SANITY (not judged): instrument errors must be
  0 on judged seeds; the driver must reproduce survgear's
  determinism property on a short leg (same seed twice, same
  summary) and on/off neutrality (instrument-off run does not
  change the trajectory summary at 30d). Balanced panel (§15):
  INAPPLICABLE for a pure diagnostic on a fresh band with no
  before/after comparison — stated, not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a
  clean verdict; the verdict degrades per the rule above
  otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this
arm's own corpus and judged for meaning (not counts): for the
closest seed(s), quote what the village's standing story
actually looks like — what it is told it lacks, and whether
that story reads as a coherent village situation.

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand
change, no VETSHAPE flip, no re-judging of 99101–99108, no
rebuild of the ability-use follow-up (main-session owned). If
the finding motivates a lever, it is NAMED in the evidence as
a next-arm proposal only.
