# sim-hurthome-fix-a — VERDICT: INSUFFICIENT-DATA (prereg census bar missed in BOTH cells; fix NOT landed)

Run: oversight-flesh-out-loop, run fleshout-20261104T1015Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-a. Axis: food-economy.
Arm: hurt-aware turn-home rule for TRIPS — the NAMED NEXT ARM from
Loop A sim-hurthome-a (evidence/2026-11-04/sim-hurthome-a.md, DIAG-GO).
Binding prereg: evidence/2026-11-04/sim-hurthome-fix-a-prereg.md (read
in full before judging; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon doc
covers away-return timing or hurt-traveler behavior — the mechanism
is code-read, not invented canon.
Fix commit (TESTED, then REVERTED — see "What lands" below):
299d94403180e2854e2e54453a0875090edafddf (game.js hurt check +
hurt return line + proof test, [needs-eyes]). The revert commit is
listed in the report; the fix commit stays in branch history so a
future arm can re-apply it exactly.

## THE DECISION UNDER TEST (chosen in the prereg, before any judged sim)

ONE mechanism: a health check on the return path. In npcNodeTravel
(game.js), a ledger-away villager on a TRIP (any purpose except
'leave') with hp <= 7 (the awayHungerVoice gate, alive) returns at
the next travel tick, regardless of the trip clock. LEAVE walk-outs
are excluded by purpose, not by clock arithmetic. The expedHurt
write-back was REJECTED as the arm in the prereg (it reaches only
expedition monster-flee hurts; diag trips span 7 purposes; the
health check subsumes the expedition case) and was NOT added
mid-run. The hurt-aware return line fires only on the hurt branch,
only when the player is at Haven to see it: "🧭 {first} returns
from the wilds hurt (health {hp}/100) — the trip cut short."

## INSTRUMENT (diag instrument, extended — pinned in the prereg)

- scripts/hurthome-a-lib.js UNCHANGED (dawn episode definition,
  classification, buckets: died-away / same-day / next-day /
  stayed-out >= 3 days / censored-early, death first).
- scripts/sweep-hurthome-fix-a.js = the diag sweep plus a pre-travel
  hp snapshot: a return closed on a travel tick whose pre-travel hp
  was <= 7 on a non-LEAVE trip records hurtTriggered=true.
  CORRECTION to the prereg's wording (diagnostic label only, not a
  judged metric): in the BASELINE cell this flag means the return
  tick COINCIDED with a hurt state, not that the rule "would have
  pulled them earlier" — earlier firing depends on hurt state at
  earlier ticks, which the snapshot does not record. The judged
  metric never used this flag; the correction changes no verdict.
- scripts/analyze-hurthome-fix-a.js: per-cell pooled tables, TRIPS
  vs WALK-OUTS always split, BOTH rates for trips (come-home =
  returned / all trip episodes; conditional turn-home = same+next /
  returned), meal-line counts (BOTH censuses kept), guardrails.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE in the prereg before
  the pilot (panel measures no hurt-episode metric; fabricating a
  compare file would be dishonest). Comparison instrument is the
  pre-registered per-seed matched table below (identical seeds,
  policy, horizon, env, one instrument).

## CELLS (identical except the one fix commit)

- Policy: competent, unchanged. Horizon: 100d death-aware cap.
  Env: PLENTYDEPRI=1, DEPOSITGATE=1. Seeds: PILOT 97501–97508,
  CONFIRM 97509–97516 (fresh band; no s97501+ per-seed files
  existed in evidence). BASELINE ran FIRST on pristine code;
  ARMED ran after the fix commit, same seeds, same instrument.
- Corpus: evidence/2026-11-04/perseed-hurthome-fix-a/
  (16 per-seed JSONs per cell + sweep-baseline.json +
  sweep-armed.json). Instrument errors: 0 in both cells.
  Every episode classified: 0 unclassified in both cells.

## VERDICT: INSUFFICIENT-DATA

Prereg judged-census bar: pooled trip episodes >= 16 in EACH cell.
- Baseline trips: 15 (< 16). Armed trips: 6 (< 16).
The bar fails in both cells, so the preregistered rate verdict is
WITHHELD — no GO, no NO-GO on the primary. The numbers below are
DESCRIPTIVE ONLY, labelled as such, never as the verdict.
- The pilot gate also missed (baseline pilot trips 6 < 8), and
  exactly as the prereg prescribes, the confirm band ran anyway
  and judging moved to the pooled census — the threshold was
  never lowered, the hp gate never widened, the horizon never
  extended to manufacture episodes.
- Descriptively, the primary lift is +0.067 (armed 1.000 − baseline
  0.933), below the +0.15 bar — but that descriptive lift is
  itself biased (see "Why the census collapsed"), so it is NOT
  reported as a NO-GO either. The experiment as designed cannot
  judge this fix. What it CAN say, on direct evidence, is in the
  next three sections.

## THE NUMBERS (pooled 16 seeds per cell, descriptive only)

TRIPS (purpose != 'leave'):
- Baseline: n=15, returned 14, died 1. Come-home 14/15 = 0.933.
  Conditional turn-home 13/14 = 0.929 (same-day 12, next-day 1,
  stayed-out >= 3 days 1). Died-away share 1/15 = 0.067.
- Armed: n=6, returned 6, died 0. Come-home 6/6 = 1.000.
  Conditional turn-home 6/6 = 1.000 (same-day 6, next-day 0,
  stayed-out >= 3 days 0). Died-away share 0/6 = 0.000.
- Lift (descriptive): come-home +0.067; died-away share −0.067.
WALK-OUTS (purpose 'leave'):
- Baseline: n=3, returned 0, died 3. Armed: n=2, returned 0,
  died 2. Come-home 0 in both cells. NO walk-out was pulled home
  by the rule — the purpose exclusion holds in behavior, and
  no hurt-return line names a walk-out villager (checked:
  Zoltan, Jaspreet, 0 lines each).
GUARDRAILS (hard, prereg — both HOLD, descriptively):
- Median daysAlive: baseline 86, armed 79 (delta −7, tolerance
  −10). Survived-seed count: baseline 5, armed 6 (delta +1,
  tolerance −2). Died-away share (trips) did not rise.
- Total deaths: 188 in BOTH cells (per-seed deaths differ — a
  coincidence of totals, not identity; trajectories diverge
  after the first hurt return, see below).
MEAL CENSUS (second census, both kept):
- Hurt meal lines: baseline 35, armed 10. The drop is the rule
  working as designed: hurt travelers come home before their
  next away meal, so fewer away meals are eaten while hurt.
  Meal lines are context, not the judged metric.

## WHY THE CENSUS COLLAPSED (the finding that voids the metric)

The dawn census only sees a hurt traveler who is STILL away at
the next dawn. The rule fires at the next TRAVEL TICK after any
hurt — including mid-day hurts — so most hurt travelers are home
before the next dawn and never open a dawn episode at all:
- Armed hurt-return lines (the new line, fired ONLY on the hurt
  branch): 39 across 16 seeds (~2.4/seed). Baseline: 0 (the line
  does not exist in baseline code — a clean control).
- Of the armed lines sampled, the ones with a dawn episode match
  it exactly (Greta guard hp 3, Arturo expedition hp 5, Sari
  water hp 2, Mateo expedition hp 4 — line hp = episode hpAtOpen);
  the rest name villagers with NO dawn episode (Marcus, Ebrahim,
  Aria, Emma, Aminah, Adaeze, Meera, Teresa, Sal, Hannah, Desmond,
  Jovan...) — mid-day hurt returns the dawn census cannot see.
- Baseline come-home was already 0.933 on this band (vs 0.682 on
  the diag band), so the maximum possible lift was 0.067 — the
  +0.15 bar was unreachable before the armed cell ran. The bar
  assumed the diag band's baseline; this band's clock returns
  were already fast (12/14 same-day).
Conclusion: the rule demonstrably fires (39 lines, 0 stayed-out
trips, 0 died trips in the armed dawn census), but the dawn
episode population is the WRONG population for judging it. A
future arm must instrument from hurt EVENTS (hurtVillager →
return latency in parts; hurt-return count per seed; died-while-
away among event-defined hurt travelers), not from dawn samples.
That redesign is documented here, not smuggled into this verdict.

## PER-SEED MATCHED TABLE (descriptive)

seed | B days | B eps | A days | A eps | A hurt lines
97501 | 100 | 0 | 100 | 0 | 1
97502 | 100 | 1 | 100 | 1 | 3
97503 | 64 | 1 | 64 | 1 | 0
97504 | 59 | 1 | 100 | 0 | 3
97505 | 86 | 0 | 91 | 0 | 1
97506 | 21 | 0 | 21 | 0 | 0
97507 | 100 | 3 | 100 | 1 | 3
97508 | 65 | 1 | 45 | 1 | 5
97509 | 89 | 3 | 100 | 1 | 3
97510 | 64 | 0 | 64 | 0 | 0
97511 | 100 | 0 | 69 | 0 | 1
97512 | 100 | 0 | 79 | 1 | 4
97513 | 49 | 3 | 41 | 0 | 1
97514 | 21 | 4 | 100 | 0 | 2
97515 | 86 | 0 | 64 | 1 | 5
97516 | 73 | 1 | 57 | 1 | 7
Note the cascade: one early hurt return re-routes the whole
village's RNG future (97514: died d21 → survived 100d; 97511:
survived 100d → died d69). Matched-seed MEDIANS are the unit of
comparison here, never individual seeds — a single seed flipping
either way is noise from the cascade, not a verdict.

## SENSE TEST — HURT RETURNS READ AS PEOPLE COMING HOME HURT

Armed lines (quoted, judged against their episodes):
- "🧭 Greta returns from the wilds hurt (health 3/100) — the trip
  cut short." (97502, guard trip, episode hpAtOpen 3, same-day.)
  TRUE: name, hp, and reason all match the episode. Greta then
  went out again and returned hurt twice more the same day
  (hp 2, hp 4 lines) — three distinct hurt returns, each true.
- "🧭 Ella returns from the wilds hurt (health 1/100) — the trip
  cut short." (97504, d38.) The baseline Ella (visit trip, hp 4)
  is a different world after divergence; the armed line stands
  on its own: a villager at 1 HP coming home because she is hurt,
  not because a clock ran out. TRUE by construction (the line
  fires only on the hurt branch, with hp read at that tick).
- "🧭 Citlali returns from the wilds hurt (health 5/100) — the
  trip cut short." (97501, d83, no dawn episode — a mid-day hurt
  return.) The line is the ONLY record that this trip ended
  early for a hurt reason; without it, Citlali's return would
  read as routine. This is exactly the blank the diag named
  ("return lines never mention hurt"), now filled where the
  player is at Haven to see it.
Baseline contrast (the stayed-out case the rule would have cut
short): Aki, 97507, expedition, 3 hurt dawns (hp 5 → 3 → 1),
voice lines "the trip isn't over yet" then "due home — the
trip's time is up, they just haven't walked in yet", returned
d70 with "🧭 Aki is back from far past the west (+1524 kcal for
the pantry, 7 stories, a new scar)". Haul, stories, scar — no
mention of 3 dawns spent hurt at hp 1. (Her expedDuration was 2
vs awayDuration 14 — the expedHurt disconnect firing again, as
in the diag corpus.) The armed line says what Aki's return line
could not: she came home BECAUSE she was hurt.
Judgment: where the line fires, the behavior reads as a person
deciding (hurt → coming home), not a clock running out. The
line's limit is its gate: it fires only when the player is at
Haven at the return tick, so some hurt returns still read as
routine — the same limit every return line already has.

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 97501–97516 — an early/mid window, not a full-arc run.
- Survived to 100d: baseline 5/16, armed 6/16. Wave reach: wave 4
  in both cells (maxWave 4). National / table / wins: 0/16 in
  both cells — the scale wall is untouched by this arm, as
  expected; a 100d hurt-return corpus is not a scale panel, and
  nothing here claims otherwise.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck plus, in the armed cell, the
  RNG cascade after the first hurt return. The blank this run
  fills is the record itself: the rule fires (39 lines), the
  walk-out exclusion holds, guardrails hold, and the dawn census
  is proven to be the wrong instrument for this question. The
  village assessment is that hurt travelers DO come home fast
  even without the rule on this band (0.933) — the rule's
  visible contribution is the mid-day returns and the tail
  (stayed-out 1 → 0, died trips 1 → 0, descriptively), not a
  come-home lift the baseline left room for.

## PROOF

- scripts/test-hurthome-fix-a.js: 10/10 green WITH the fix
  (predicate fixtures: hurt trip true for hp 1–7 across all
  non-leave purposes; hp 8+/0 false; LEAVE false at hp 1 and 7;
  no away / missing health false without throwing; predicate
  reads no RNG and mutates nothing; wiring: return branch calls
  shouldHurtReturn, exactly one hurt-line site, LEAVE exclusion
  by purpose). The test was green before any judged armed sim.
  It is REVERTED with the fix (see below) — it asserts a
  function the reverted tree does not have, so keeping it would
  be a red test, not evidence.
- Baseline determinism: not re-run (the diag arm already proved
  the instrument deterministic on its band; this arm's baseline
  is a fresh band, and its value is the matched comparison, not
  a determinism claim).
- Instrument errors: 0 across all 32 judged cell-seeds
  (16 baseline + 16 armed). No unclassified episodes.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg + this evidence; baseline
  + armed corpora (32 per-seed JSONs + both sweep summaries);
  sweep + analyzer (the instrument, reusable by the next arm).
- DOES NOT LAND (reverted in the revert commit listed in the
  report): src/js/game.js hurt check + hurt line, and
  scripts/test-hurthome-fix-a.js. Reason: the verdict is
  INSUFFICIENT-DATA, not GO — an unproven behavior change must
  not ship through this branch. The fix commit (299d94403...)
  remains in branch history; a future arm re-applies it with
  `git revert <revert-commit>` or cherry-pick, re-proofs it,
  and judges it with an event-based instrument (below).
- DOES NOT LAND: no gate/price/deed/readyDemand change; no
  policy-default change; no other lane's files; no expedHurt
  write-back (rejected in the prereg, not added).

## NAMED NEXT ARM (documented, not landed)

sim-hurthome-fix-b (proposed): re-apply fix commit 299d94403...,
judge with an EVENT-BASED instrument — open a hurt-traveler case
at the hurtVillager event while ledger-away (any part of day, not
just dawn), close at return/death, judge return latency in parts,
hurt-return count per seed, and died-while-away share among
event-defined cases. Pre-register the population (event-defined,
not dawn-defined) and a metric with headroom (latency / tail,
not come-home lift on a saturated baseline). Keep the trip /
walk-out split, the LEAVE exclusion, both censuses, and the
guardrails from this prereg.

## METRIC REVIEW

- The dawn episode definition was the RIGHT instrument for the
  diag (it isolated "hurt at the start of a day") and the WRONG
  instrument for this fix (the fix acts intra-day, so it removes
  cases from the dawn population instead of moving them between
  buckets). Future arms on return TIMING must be event-based.
- The +0.15 come-home lift bar was wrong for this band: it
  assumed a diag-like baseline (~0.68) and left no headroom
  against a 0.933 baseline. A lift bar needs a baseline measured
  on the SAME band first, or a metric with headroom (latency,
  tail share, died share).
- The >= 16 trip-episode bar did its job, including failing
  twice: it forced the INSUFFICIENT-DATA verdict instead of a
  rate claim on 15 and 6 cases. Keep a census bar, but size it
  to the instrument's actual yield (event-based cases will be
  far more numerous than dawn episodes — the 39 lines vs 6
  episodes gap is the size of that difference).
- The trip / walk-out split, the LEAVE exclusion, and the
  "report come-home AND conditional rates, never just the
  conditional one" rule all held up and must be kept: pooling
  would have hidden both the exclusion success and the census
  collapse.
- Convergence state for this axis (food-economy, hurt-traveler
  blank): BEHAVIOR MEASURED + FIX PROTOTYPED (fires, reads true,
  guardrails hold) BUT UNJUDGED — the fix decision is open
  pending an event-based arm, and the pantry-empty story remains
  a separate question.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-traveler corpus: no wider dialogue verdict is
claimed — the transcript capture was instrumented for
hurt-traveler lines, return lines, and lines naming episode
villagers only, so no broader robotic/static/repeated dialogue
judgment is made here.
