# sim-food-round-1752 — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b-20261025T1752Z, axis food-economy
(converging). Sibling loop A live at run start on scale-onramp
(1715Z claim, tileentry + w5births) — NOT touched; A landed mid-run
(89c6eacbe coordinator evidence + journey-deepening r47 e7d34d80c
on top). Both B branches were rebased clean in their own worktrees
onto the moved master (zero file overlap with A/ship landings),
re-proved, then merged --ff-only, no force, no conflict.

Both arms are MEASUREMENT ONLY (zero src/js). No game lever landed,
no rot verdict re-judged, no before/after lever pair exists in this
run — so the balanced panel (§15) is inapplicable here, same as the
1630Z round: the panel compares before/after levers, and these arms
build instruments. The pre-registered thresholds below are each
arm's own judge.

## Arm 1 — sim-deathrow-b: GO (causeext-b block CLOSED)

Commit 655df0a32 (rebased from b8c38c5a2; proof ALL LEGS PASS
post-rebase and on merged master). The 1630Z run proved the
tableseat-nowait corpus discards per-death rows, so no kind-filtered
pooled cause list could be built. This arm builds the recorder and
the list.

- Recorder: scripts/sweep-deathrow-b.js + scripts/analyze-deathrow-b.js
  (pool / compare / neutrality / rerun modes), proof
  scripts/test-deathrow-b.js. Zero src/js — persistence only.
- Pre-registered gates G1–G7, all GO: pilot 8/8 files carry deathRows
  (234 rows, kind/flag/cause-missing 0/0/0); kind filter applicable
  (analyzer pool exits 0); neutrality PASS (73701 identical to the
  pristine tableseat-nowait sweep: days 82 = 82, deathTotal 36 = 36);
  determinism MATCH (73701 re-run byte-identical); multi-band pool
  builds on all five bands; guardrail matched PASS / mismatched
  SCOPE-MISMATCH (exit 2, both scopes named); N = 3 calibrated from
  this pool's own histogram (churn max 2), same N as the competent
  baseline but NOT borrowed from it.
- Pooled list: 1,203 rows = 859 monster-kind + 200 scholar + 144
  villager deaths, 21 labels, file
  evidence/2026-10-25/sim-deathrow-b-baseline.json (analyzer output,
  scope included, byte-reproducible). Villager causes: monster 51,
  a wound that wouldn't close 22, ambush 22, sickness 15, starvation
  7, alien 6, thirst 5, Choir Toad 2, combat 2, singletons incl.
  Lockpick, Buffering, Ad Break, "a dog-shaped silence at the
  treeline", contest (1 each). The old aggregated dict would have
  counted the 859 monster kills and 200 mantle-passings as village
  blood; the filter removes 1,059 of 1,203 rows and the remaining
  144 are, on inspection, actual villagers.
- Sense read (full 144-row list): ambushes cluster early (~20 of 22
  before day 30, trust still unformed); sickness arrives in
  outbreaks (73728: four in days 54–68); one village loses three to
  starvation on a single day (73741 d30 — a famine day, not three
  coincidences); wounds kill late (days 40–164, the slow aftermath,
  correctly distinguished from combat). LIMIT stated by the worker:
  rows carry day/who/cause/kind only — no fight detail, no last
  words; the narrative death layer belongs to the deathcensus-a
  transcript recorder, not duplicated here.
- Wall (deathrow corpus, tableseat-nowait substrate, n = 40, 180d):
  won 16/40, national-ever 36/40, national-final 27/40,
  table-reached 19/40, entered 16/40, wave4 23/40, wave5 0/40,
  maxArc 3: 21 / 4: 19, median survival 147d, max 180d. End reasons:
  wins 16, village-lost 11, survived-to-cap 13. Same wall shape as
  the tableseat-nowait pilot, more seeds, no new breach: national
  is routine, the table is reachable, wave 5 is not.

## Arm 2 — sim-haulinvert-b: GO (instrument only)

Commits 42f88095b + dbcab1c57 (rebased; proof 95 PASS post-rebase
and on merged master). The 1630Z metric review proposed inverting
the haulcount predicate (count every deposit as a haul EXCEPT known
non-haul names) because a census rots. This arm is that revision,
judged ONLY on the identical-pilot comparison.

- Inversion rule, derived from EVERY stockPantry /
  depositPantryPieces call site (read 2026-10-25, not guessed):
  every deposit counts except an exact-name exclusion list
  (Weregild, Hoarder's interest, System-replicated stew/meals,
  System aid cache, SYNTHETIC SUSTENANCE BRICKS, Trial feast,
  Refunded trade goods, Meal leftovers, Restitution, Ration
  returned), two prefixes (Aid from / Remedy stores from), tribute
  pieces to home, and pieces to non-home villages. Buckets are
  disjoint and the arithmetic closes on every file.
- Pre-registered thresholds H1–H6, all GO: superset holds on all 16
  files — in fact exactly equal, delta +0/+0 on actions AND kcal
  everywhere; zero disagreements on all 4 traces; all traces
  recompute exactly; every non-anchor field reproduces the prior
  corpus exactly; zero src/js touched; determinism byte-identical.
- ZERO-DELTA IS A GO, NOT A NON-RESULT: the pre-registration judged
  superset + explanation + recomputation, not "must find new
  hauls". On this pilot the census was already complete; the
  inversion's value is forward-looking (it cannot rot). Do NOT
  re-judge the inversion on the same pilot expecting a different
  number.
- Code-proven, pilot-unproven classes (stated, not hidden):
  Expedition meat, Buried cache, Genesis fruit, custom haulLabels
  are real call sites the inversion counts and the census missed,
  but no pilot event exercised them — the first trace showing one
  is the confirmation event. Foreign bucket unexercised (0
  everywhere). TRIBUTE GRAIN IS BIG: home-excluded tribute pieces
  run 4,000–50,000 kcal per file — an analyzer reading
  "deposits minus hauls" as non-haul inflow must NOT collapse the
  buckets, or tribute grain will masquerade as aid.

## Village assessment (plain words)

Forty villages walked the road to the table, and now their death
story is actually written down — that is the whole result, and it
is a big one, because the last run proved the story was unwritten.
Thirty-six of forty reached national at some point; nineteen
reached the table; sixteen took the seat and won. Eleven villages
died out entirely; thirteen survived the full 180 days without
winning. Nobody reached wave 5 — the wall past wave 4 is still
the wall.

How they died: monsters first (about a third of village blood),
then wounds that wouldn't close and betrayal ambushes (about a
sixth each), then sickness, then hunger and thirst. The early days
kill by betrayal — neighbors turning on neighbors before trust
forms. The middle kills by monsters and by wounds that fester
after the fight is over. The late days kill by hunger, thirst,
and sickness moving through a tired village. The haul ledger, for
its part, turns out to have been complete all along on this pilot
— the inverted rule changes nothing today and protects everything
tomorrow, because the next haul name a future caller invents will
count automatically instead of silently vanishing.

What this run does NOT say: nothing about traps, nothing about
counters learned, nothing about which young links held after a
succession — those instruments don't exist on this substrate yet.
What it does say, for the first time on this road to the table, is
exactly who died, of what, and when — with monster kills and
mantle-passings kept out of the village's blood count.

## Telemetry deviation check

- Deathrow corpus: 2 LOUD lines (national 12 -> 0, wins 16 -> 0),
  both the known artifact class — the script reads top-level
  national/wins paths, per-seed rows carry nationalEver/won/
  entered instead (actuals: national-ever 36/40, wins 16/40).
  Baseline NOT rolled, no investigation item.
- Haulinvert corpus: 2 LOUD lines (table/wins 16 -> 0), same
  artifact class (competent pre-seat substrate, SEATDRIVE=0, no
  seat instruments; rows carry per-seed fields, not top-level
  paths). Baseline NOT rolled.

## Metric review (this run; revisions apply to the NEXT run)

- Deathrow: no metric re-scored; all seven gates as written. The
  driver/test originally carried a misformulated sanity check
  ("every label below N must be churn") — WRONG, fixed mid-run,
  not a re-score (G5 never required it): a PRESENT label below N
  that is not churn ("combat" at n = 2 on 2 seeds) does not break
  N, because N governs only labels ABSENT from the baseline. N =
  churnMax + 1. Caveat carried: a future NEW generic label at n = 2
  would not flag under N = 3 — the same blind spot the competent
  baseline carries; lowering N to 2 would flag routine new monster
  names (an open class) as "new". A future arm wanting generic-mode
  sensitivity at n = 2 must say so explicitly and accept the
  monster-name false positives.
- Scale honesty for the NEXT run: 144 villager deaths across 40
  seeds is credible, but NOT the competent pool's scale (570
  deaths / 144 runs) and NOT the audit's >= 300-death scale bar.
  Bands 73751+ are fresh for the extension; a 300-death pool might
  re-shape the tail and re-calibrate N — a new calibration, not a
  correction of this one.
- Haulinvert: see "code-proven, pilot-unproven" above. Do not
  collapse tribute/aid buckets in future summaries.

## Infrastructure

- Worktree registration slow (~2 min each) under sibling load, all
  succeeded. One registration call hit a service restart with a
  partial side effect: a stray ~/workspace/worktrees/sim-deathrow-b/
  directory containing a 1.2 GB partial copy of repo evidence/
  (19,997 files, verified a strict byte-identical subset of the
  main-tree evidence, 0 stray-only files). Removed before
  re-registering; the registered tree was then created clean.
  No repo state was harmed; the copy duplicated committed
  evidence only.
- Safe-commit index clobber hit the deathrow worker commit —
  repaired via cacheinfo, commit verified correct (worker report).
  No clobber on the haulinvert commits or the coordinator commit
  (verified below). No EPERM flap blocked this run.
- check.js --quick NOT re-run: zero src/js in either arm, zero
  green-list files, and the standing 280/7 pre-existing profile
  was recorded by loop A runs this same day. The designated proofs
  above (deathrow ALL LEGS PASS, haulinvert 95 PASS, both
  post-rebase and on merged master) are the verification of
  record.
- Sibling lanes active at closeout (untouched): loop A 1815Z claim
  (sim-oldcore-a, sim-palisade-a trees), journey-scale (locked),
  journey2-social. Main tree clean at closeout.

## Convergence state

food-economy stays converging (NOT converged): the causeext-b block
is closed (pooled list + N + guardrail exist and are usable) and
the haulcount predicate is now a definition instead of a census —
but no food-economy game lever has landed, the pooled list is
below the 300-death scale bar, and the wave-5/national wall is
untouched by this axis. scale-onramp stays converging (untouched;
sibling loop A). Next blanks, in order: (1) extend the deathrow
pooled list to the >= 300-death scale bar (fresh bands 73751+),
re-calibrating N on the bigger tail if it moves; (2) adopt the
inverted haul predicate as the primary haul measure in the next
deciding rot corpus, with the first-trace confirmation event for
the code-proven haul classes; (3) the away-ration fix itself
(size packs to dayWant, floor/drop the hunger penalty on pack
draws, voice away hunger for low-health travelers) — still
waiting on its own pre-registration, not rushed here.

Claim deleted; lock deleted. Evidence: this file (coordinator
commit below) + evidence/2026-10-25/sim-deathrow-b.md +
evidence/2026-10-25/sim-deathrow-b-baseline.json +
perseed-deathrow-b/ (commit 655df0a32) +
evidence/2026-10-25/sim-haulinvert-b.md + haulinvert-b-corpus/
(commits 42f88095b, dbcab1c57). Merged locally, pending ship.
