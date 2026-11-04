# Pre-registration — arm sim-vetshape-b (Loop B run fleshout-loop-b-20261104T2125Z)

INSTRUMENT ONLY, zero src/js game changes. No default, gate, price,
deed, or readyDemand number changes. The veterans bar is NOT flipped
to count dead killers; this arm only computes what WOULD have happened
if it had.

## Question (track B shape question, from the 2026-11-04 2015Z Loop B run)

Vetprod (evidence/2026-11-04/sim-vetprod-b.md) found, on the shared
gearbar band: 8 wave-4 kills / 42 fights, kill-to-death median 3.5 days,
max simultaneous LIVING veterans 1 on every seed, classification
4 NEVER-FACED-WAVE4 / 3 KILLED-DEAD-KILLER / 1 KILLED-LIVING-SHORT /
0 FACED-NO-KILL. The 2015Z tracker entry names the VETSHAPE
living-OR-DEAD instrument as the probe for track B's shape question.
This arm answers: would counting dead killers change the release
outcome on any seed, and by how much simultaneity is missed?

## Corpus

- Band/seeds/policies: EXACTLY vetprod's — seeds 99101–99108 (the
  gearbar band re-run on current master), competent policy VERBATIM,
  default env, no policy-side lever (no armed side; this is a
  counterfactual computed from one corpus, not an A/B).
- Horizon: 150d death-aware (dead villages stop simulating, +10d tail
  max), same as vetprod.
- Fresh runs: the vetshape driver re-runs all 8 seeds with the vetprod
  instrument reused verbatim and writes
  evidence/2026-11-04/perseed-vetshape-b/. The analyzer ALSO reads the
  vetprod corpus as a cross-check; agreement on shared numbers is the
  sanity check (see "Reproduction check").
- Pilot gate: 8 seeds before any confirm spend. This is an 8-seed
  probe; NO confirm spend.

## Definitions (fixed before any judged sim)

- Killer = a vid with >= 1 wave-4+ kill in state.waveKillLog
  (base-wave rule as in vetprod: log entry w >= 4; a hardened
  older-wave monster counts as its base wave, per code).
- Living(d) = killers with firstKillDay <= d < deathDay, deathDay
  null = alive through end of run. Same-day kill-and-die contributes
  to NO living day (vetprod rule, kept).
- Shape(d) = cumulative killers ever with firstKillDay <= d
  (living-or-dead; the counterfactual bar).
- Window_W(d) = killers with firstKillDay <= d AND (deathDay null OR
  d - deathDay < W), for W in {14, 30, 60}. On the death day itself
  (d - deathDay = 0) the killer still counts in the window — that is
  the "recently dead" semantics. A same-day kill-and-die counts in
  every window on its day.
- Death day / cause: earliest fallen entry for the vid with day >=
  first kill day, exactly as vetprod's killerFates (reused, not
  re-implemented divergently). A killer with no such entry is alive
  at end of run.
- Counterfactual-ready day: a daily-snapshot day with Shape(d) >= 2
  AND gated standing >= 200 AND the day's readiness5.short subset of
  {veterans} (i.e. every other readiness leg already met, so counting
  dead killers is the ONLY remaining change). Other-legs-met is read
  from the engine's own daily readiness5 snapshot, not inferred.
- "Died before a second killer was banked": seed has >= 2 killers ever
  AND killer 1's deathDay < killer 2's firstKillDay (strictly before;
  same-day banking counts as banked in time).

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: seeds reaching Shape >= 2 (shape) vs seeds reaching
  Living >= 2 (living), over the run.
- Verdict DIAG-GO for a survivorship lever iff shape reaches >= 2 on
  >= 5/8 seeds WHILE living reaches >= 2 on <= 1/8 seeds (kills exist
  but simultaneity is the binding shape). Otherwise
  DIAG-NO-CANDIDATE. INSUFFICIENT-DATA only if > 2 seeds carry
  instrument errors.
- SECONDARY: peak Shape count per seed; days at Shape >= 2 per seed;
  first day at Shape >= 2; counterfactual-ready days per seed
  (and whether any exist); peak Window_14/30/60 per seed and days at
  Window >= 2; kill-to-death interval distribution (sorted list,
  median) and death-cause tally; per-seed "died before second banked"
  flag; killer survivorship table (all killers, all seeds).
- REPRODUCTION CHECK (sanity, not judged): the fresh vetshape corpus
  must reproduce vetprod's shared numbers — days, end reasons, peak
  gated standing per seed, wave-4 fight/kill counts, engine daily max
  vets (1 / 0 / 1 / 1 / 1 / 0 / 0 / 0), max simultaneous living 1 on
  every facing seed. Any mismatch is reported as a finding, not
  silently averaged away. Balanced panel (§15): INAPPLICABLE for a
  pure diagnostic counterfactual — stated, not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a GO; the
  verdict degrades per the rule above otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this arm's
own corpus and judged for meaning (not counts): the veteran-word
collision flagged by vetprod is the standing sense-test item to
re-check (monster "veteran" warnings vs villager-veterans bar lines).

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand change. If
the shape finding motivates a lever (e.g. killer protection/rotation),
it is NAMED in the evidence as a next-arm proposal only.
