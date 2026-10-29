# sim-homebody-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: flesh-out loop, run fleshout-20261029T1215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-homebody-a.
Assignment: HOMEBODY CENSUS — measurement ONLY, zero game change.
This sizes backlog item #1409 (sim-findings.md, steve-call):
homebody villagers (maxD 0) can never be offered a HUNT under
objHuntCandidate; no lever may assume otherwise until Steve
rules. This arm measures the size of that block. It does NOT
rule on it and does NOT build a fix. It does NOT rebuild the
lottery lever (killed today, sim-lottery-a), the HUNT-holds
lever (build-pickdepart owns it), or trail-follow
(build-returns owns it).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; wave-4
bands) and docs/PARTY.md (context only — this arm touches no
party behavior). CANON GAP, stated instead of invented canon:
no CANON-registered doc covers the daily pick lottery,
departure gates, travel-to-known-monsters, or field-fight
returns. The mechanism below is derived from code, stated
exactly so it can be checked (same mechanism text as the
funnel-a prereg, plus the range facts this census adds):

- RETURN-TO-FIGHT (villager-objectives.js, game.js
  resolveWildMonsterEncounter): a villager who actually fights
  a living world monster remembers the fight's tile; only that
  villager may be offered a HUNT errand back to it. Memory
  store: state.village.monsterSightings[vid] = [{mid, tx, ty,
  day, part}], cap 4 per villager, oldest dropped first.
  Recorded for the fight leader AND the answering ally; never
  from a mere sighting, never from gossip, never from the
  monster list; never for the scholar (player); never for raid
  fights. Written by objNoteMonsterSighting; spent by
  objDropMonsterSighting, whose only caller in src/js is the
  HUNT arrival path (objAwayStep).
- HUNT OFFER (objPick + objHuntCandidate): at a dawn/idle
  pick, a villager with a fight memory may be offered HUNT at
  lottery weight 2.0 (food, water, hall life still compete —
  an offer is never a guarantee). Gates, all enforced by
  objHuntCandidate: memory fresh (age 0-3 days), villager
  armed, within roaming range (1 <= Chebyshev distance <=
  npcMaxDist), not sheltering, not resting off a bad flee.
  HUNT is solo by design.
- HOMEBODY (npcMaxDist, the range profile): a villager whose
  npcMaxDist (recorded as gates.maxD in every funnel pick
  record) is 0 can satisfy no distance in 1 <= d <= 0, so
  objHuntCandidate returns null for every memory, at every
  pick, forever. This is a structural zero, not a low weight:
  no lottery lever, no weight curve, and no last-day direct
  take can ever offer a homebody a HUNT unless the range
  rule itself is ruled on. Whether that is intended is a
  Steve-call (#1409); this census only sizes it.
- RANGE vs HOMEBODY (the distinction this census exists to
  draw): a non-homebody can also be range-blocked on one
  memory (fight tile farther than maxD, or at distance 0)
  while offerable on another. A fresh pick is
  HOMEBODY-RANGE-BLOCKED only when ALL of: the pick carries
  a fresh entry for the triple mid (age 0-3 days by the
  funnel rule, pick.day - entry day), the recomputed
  candidate is null, gates.maxD == 0, and the other gates
  are green (armed true, sheltered false, postFleeResting
  false). A fresh pick with candidate null, maxD > 0, and
  other gates green is OUT-OF-RANGE (merely out of range),
  NOT homebody-blocked. A fresh pick with another gate red
  (unarmed, sheltered, post-flee) is OTHER-GATE, even if
  maxD == 0 — the range fact is not the binding block there.

## Fresh band (this arm's own corpus, base code)

- Seeds 75101-75116 (16, the funnel-a band verbatim, so the
  19 triples are the same triples). scripts/policies/
  tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1, FUNNEL=1
  (fieldparty-form-diag + returns-diag + funnel-diag
  recorders reused VERBATIM, never edited). 180d
  death-aware (runDays stops on death/win, as in the
  predecessor sweeps), competent policy (tableseat-nowait).
- SUBSTRATE (named, never switched mid-run):
  tableseat-nowait. No other policy, no policy edit, no
  game-code edit, no default flip.
- CORPUS LAYOUT (funnel-a layout, NEW arm dir — predecessor
  corpora are never overwritten): evidence/2026-10-29/
  perseed-homebody-a/s<seed>-fresh.json, produced by running
  scripts/test-funnel-a-sweep.js VERBATIM with EVID and
  SEEDS overrides only (its resume logic means a flap- or
  restart-interrupted band finishes without re-simulating
  verified rows). Never write sweep outputs to /tmp (a
  sibling cleanup wipes /tmp mid-run — prior runs lost
  whole sweeps there); determinism scratch dirs live inside
  this worktree and are removed after byte-comparison.
- WHY 16 SEEDS: the 19 triples come from this band; reusing
  it exactly lets this census classify the known triples
  instead of drawing a new, incomparable set.

## Instruments (new, scripts/ only, zero game change)

- scripts/test-homebody-a.js: analyzer (pure reads).
  (a) Neutrality reproduction against the funnel-a corpus
  (see guards). (b) Triple re-derivation by running the
  funnel analyzer VERBATIM against this corpus
  (EVID=perseed-homebody-a, --out to the homebody analysis
  JSON) — the 19 triples and their funnel classes are
  reused, never re-derived by a second implementation.
  (c) The homebody census proper (see below), computed
  from the raw corpus rows + the funnel analyzer's triple
  table. --out JSON for the sense script and the evidence.
- scripts/test-homebody-a-fixtures.js: unit fixtures on
  synthetic pick/triple tables (every range class
  reachable, maxD-0 vs out-of-range vs other-gate
  separation, counterfactual counting, neutrality-compare
  helper). Exits non-zero on any failure.
- scripts/test-homebody-a-sense.js: S1 = the homebody-
  blocked triple trace quoted verbatim from the corpus
  (picks + notes for the triple vid+mid, in order) with a
  sense judgment in plain words: does it read as a person
  kept home by range, or as an artifact?

## Census definitions (fixed before any judged run)

SCOPE CAVEAT (stated up front, not discovered later):
the funnel recorder records picks ONLY for wave-4 memory
holders (or wave-4 HUNT choosers), and notes for every
memory formation. So "band-wide maxD distribution" is
measured over the corpus's PICK-RECORDED villagers (every
villager who picked while holding a wave-4 memory), NOT
over every villager who ever lived — villagers who never
held a wave-4 memory never pick on the record, and their
maxD is unobserved. That scoped population is the one
that matters for the ruling (it is the population that
could ever be offered a wave-4 HUNT), and the evidence
says so wherever the numbers appear.

- (a) BAND-WIDE maxD DISTRIBUTION: for each distinct
  pick-recorded villager (seed, vid), its maxD class from
  its pick records (the modal gates.maxD; any villager
  with mixed maxD values across picks is reported as
  MIXED with its value set, never silently moded away).
  Classes: maxD 0 (homebody), 1, 2, >=3, unknown (no
  gates.maxD on any pick — expected 0). Reported: counts
  and shares per class, and how many distinct wave-4
  fight memories are held by maxD-0 villagers, counted
  two ways and labeled: (i) held-at-pick — distinct
  (seed, vid, mid) pairs appearing in a pick's
  preSightings with mid wave 4, where the villager is
  maxD 0; (ii) formed — distinct (seed, vid, mid) pairs
  in funnel notes with mid wave 4, restricted to
  villagers whose maxD class is known (pick-recorded),
  where the villager is maxD 0. (ii) is a subset view
  of (i)'s population; neither is extrapolated to
  unobserved villagers.
- (b) PER-TRIPLE HOMEBODY CLASSIFICATION: for each of the
  19 funnel triples, from ALL picks of that (seed, vid)
  carrying the triple mid in preSightings (window-free:
  the funnel class already carries the window; this flag
  answers "did a fresh homebody block ever occur for
  this triple"), compute:
  - villagerMaxD: the triple villager's maxD class.
  - freshPicks: picks with a fresh entry for the mid.
  - homebodyFreshBlocked: at least one fresh pick with
    candidate null, maxD == 0, other gates green.
  - outOfRangeFreshBlocked: at least one fresh pick with
    candidate null, maxD > 0, other gates green
    (distance from (hx, hy) to the fresh entry tile
    outside 1..maxD, reported per pick).
  - otherGateFresh: at least one fresh pick with
    candidate null and another gate red.
  - offeredFreshPicks: fresh picks with candidate.mid ==
    triple mid.
  Reported per triple alongside its funnel class, so the
  reader can see both the headline (funnel taxonomy) and
  the range fact (this census). In particular the two
  triples the funnel evidence names (visjoin_174/eulogy
  GATE-BLOCKED, visjoin_138/algorithm MEMORY-OVERWRITTEN
  with a fresh-window range block) are checked against
  this flag, not assumed: if the flag disagrees with the
  funnel evidence's reading, the disagreement is reported
  as a finding, not resolved by editing either number.
- (c) OFFERED-PICK COUNTS BY RANGE CLASS: over ALL
  distinct corpus picks (183 expected, the funnel
  corpus's count): offered = candidate non-null; by the
  pick's gates.maxD class (0, 1, 2, >=3, unknown).
  Reported: picks, offered picks, offered share, and
  HUNT-chosen among offered, per class. Expectation
  (a structural prediction, not a GO leg): offered = 0
  for maxD 0 — any offered maxD-0 pick is a
  contradiction of the range rule and stops the census
  for investigation. Also reported: triple-window
  offered picks by range class, from the funnel triple
  table's per-triple offered counts joined to villager
  maxD (a secondary view, labeled as such).
- (d) COUNTERFACTUAL UPPER BOUND (labeled, NOT a lever
  result): the number of the 19 triples that would even
  become lottery-eligible if homebodies could hunt =
  triples with homebodyFreshBlocked true. This is an
  UPPER bound on what a homebody ruling could unlock in
  this band, and nothing more: it does not claim those
  triples would take the hunt, depart, or meet — the
  lottery (2/36 takes band-wide), departure lag, and
  empty-tile arrival would still apply. Also reported,
  separately and never folded into the upper bound:
  the count of the 19 triples whose villager is maxD 0
  regardless of pick history (a villager who died before
  picking is maxD 0 but never became pick-eligible, so
  she is NOT in the upper bound).

## Pre-registered DIAG-GO bar (binding — a miss is NO-GO)

GO requires ALL of:
  (1) all 19 funnel triples re-derived by the funnel rule
      and classified by range class, OTHER <= 1 — where
      "classified by range class" means every triple
      carries villagerMaxD + homebodyFreshBlocked +
      outOfRangeFreshBlocked + otherGateFresh +
      offeredFreshPicks (no triple left without a range
      verdict), and at most 1 triple falls in OTHER
      under the funnel taxonomy itself (the funnel
      analyzer's own OTHER count, reused verbatim);
  (2) determinism: seed 75106 re-run into a scratch dir
      inside this worktree produces a row JSON
      byte-identical to the corpus row (cmp clean;
      scratch dir removed after the diff);
  (3) neutrality: this sweep reproduces the funnel-a
      corpus wall numbers on identical seeds (see
      guards) — any divergence is explained, never
      redefined away.
Horizon 180d death-aware (why: matches the funnel corpus
band; dead villages stop simulating, +10d tail max per
the loop body). Seeds 75101-75116. Policy
tableseat-nowait (substrate named above — do NOT switch
substrates mid-run).

## Guards (reported, NOT judged — a guard miss is
investigated, never re-scored into a GO)

- RECORDER-NEUTRALITY REPRODUCTION (must be exact before
  any census number is judged): per-seed deep equality
  of fieldparty meetings, returns meetings/departures/
  drops, AND funnel picks/notes between perseed-
  homebody-a and perseed-funnel-a; wall fields identical
  (wins 4/16 all lesser, full 0/16, nationalEver 13/16,
  nationalFinal 9/16, table 10/16, entered 4/16, wave-4
  11/16, wave-5 0/16, median 180 capped, deaths 600,
  starvation 4, recorder errs 0 all three recorders,
  overflow 0, join errors 0); judgedA 42, judgedB 31,
  classes ACCIDENTAL 39 / MEMORY-ONLY 3 / DELIBERATE 0,
  chains 13 (all STILL-ALIVE), HUNT departures 326
  (wave-4 1), HUNT true drops 297 (wave-4 1). Any
  mismatch: STOP, report, do not judge the census
  against a perturbed corpus.
- STRUCTURAL PREDICTION (stops the census if violated):
  zero offered picks with gates.maxD == 0. A single
  such pick contradicts the range rule as recorded and
  must be investigated before any census claim.
- SENSE BAR: >= 1 homebody-blocked triple trace quoted
  verbatim (S1) with a plain-words judgment. A trace
  that does not read as a played sequence is reported
  as a sense failure even if the counts pass.

## Metric review (for the NEXT run — never a mid-run
re-score)

Doubts about the metric, the scope, or the flag rule go
here in the evidence file, for the next run's prereg. In
particular: (a) the pick-recorded scope for (a) excludes
villagers who never held a wave-4 memory — a census over
all villagers would need a maxD recorder on a broader
pick population, which this arm deliberately does not
build (measurement only, recorders verbatim); (b) the
per-triple flag in (b) is window-free by design, so a
fresh homebody block AFTER a later accidental meeting
would still set the flag — the funnel class carries the
window and the evidence reports both, so a reader can
tell a binding fresh-window block from a late one;
(c) the counterfactual in (d) counts lottery-eligibility
only — it is not a take, departure, or meeting forecast,
and must never be quoted without that label.
