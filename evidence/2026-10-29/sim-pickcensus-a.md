# sim-pickcensus-a — EXPANDED WAVE-4 HUNT PICK CENSUS: DIAG-NO-GO (the tie does NOT break — because the universe did not grow)

Run: flesh-out loop, run fleshout-20261029T0915Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-pickcensus-a.
Assignment: READ-ONLY DIAGNOSTIC on existing corpora — NO new sims,
NO game-code changes, NO policy changes. Classify EVERY wave-4 HUNT
pick in the larger existing corpora using sim-pickdepart-a's exact
classification scheme, to test whether pickdepart's 1/1/1/1 tie at
n=4 breaks on a bigger sample.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-pickcensus-a-prereg.md (commit c13d64273
on branch sim-pickcensus-a). This evidence judges the census
against that prereg. No metric was changed mid-run. No new sims
were run: every field the prereg needs is derivable from the
existing corpora, and the analyzer's re-proof + determinism legs
both pass.

VERDICT: DIAG-NO-GO — the DIAG-NO-GO from pickdepart STANDS on the
larger sample, for a reason nobody pre-registered: the larger
sample contains no new wave-4 HUNT picks at all. The pooled n is
still 4, the split is still 1/1/1/1, and the dominance leg fails
twice over (n=4 < 10, max share 0.25 < 0.50). The census is
complete (0 unknown) and the machinery is proven (re-proof exact,
dedup exact, determinism byte-identical) — but a census cannot
break a tie in a population that did not grow. The finding is
the scarcity itself: across 16 base-code seeds and 8 lever-code
seeds, exactly four villagers ever picked a wave-4 hunt.

## Plain words first

We went back to count every time anyone in a bigger set of villages
decided to go back for a wave-4 beast — and found no new decisions
to count. The bigger set added eight whole villages, ninety-one
more recorded decisions, and zero new wave-4 hunts. The four picks
we already knew are still the whole story: one woman who walked
out, one woman whose dinner replaced her hunt the same afternoon,
one man who picked the hunt twice and then never left because his
memory went one day too old, and his first pick replaced by his
second. Same four, same four-way tie, same quarter each. The
decision to go back for a big beast is not a common event that
we under-sampled — on these bands it is a rare event, two picks
per eight villages at best. Counting harder in the same bands
will not break the tie; only a band where more villagers survive
a wave-4 fight and get the offer could. Until then, the honest
statement is the family one, reported alongside but not
substituted for the leg: three of the four decisions died before
the walk (75%), one survived to a walk (25%).

## Header (pre-registered) vs result

Pooled definition (binding): funnel-a (16 base-code seeds,
75101-75116) + lottery-arm (8 lever-code seeds, 75101-75108).
Lottery-base is NEVER pooled (verified byte-duplicate band, see
below). Corpora included/excluded exactly as pre-registered; no
corpus was added or dropped after the prereg.

- GO LEG 1 — COMPLETENESS: 100% of wave-4 HUNT picks classified
  into a named mechanism (classes 1-7), <= 1 unknown across the
  pooled corpora: RESULT 4/4 classified, 0 unknown -> PASS.
- GO LEG 2 — DOMINANCE: pooled n >= 10 AND largest single class
  share >= 0.50: RESULT pooled n = 4 (< 10) AND max share 0.25
  (< 0.50) -> FAIL, on both halves of the bar. The bar was not
  moved after seeing the split.
- OVERALL: DIAG-GO requires BOTH legs -> DIAG-NO-GO.
- TIE STATUS (secondary, descriptive): the 1/1/1/1 tie does NOT
  break. Pooled split is 1/1/1/1 across the same four classes as
  pickdepart, because the pooled picks ARE pickdepart's picks.
- Guards (restated from the rows, NOT re-scored): funnel-a
  (16 seeds): median survival 180d, starvation deaths 4, death
  total 600, wave-4 reach 11/16, wins 4, national ever 13/16.
  Lottery-arm (8 seeds): median 119d, starvation 1, deaths 248,
  wave-4 reach 5/8, wins 5, national ever 7/8 (lottery rows,
  restated).

## The classified universe (4 picks — the whole pooled universe)

Per-stratum splits (the pooled number never appears without them):

FUNNEL-A (base code, 16 seeds): 2 picks, both seed 75106, both
d135, both eulogy huntDay 132:
- visjoin_113/eulogy, d135 part 536 -> SUPERSEDED-BY-NEEDS-PICK.
  First later pick d135 part 539 (same day, 3 parts later) chose
  EAT while the candidate was still eulogy.
- visjoin_115/eulogy, d135 part 536 -> DEPARTED-PICK-LINKED.
  Departure d137 part 544 (lag 2 days, 8 parts), no intervening
  pick; the walk found an empty tile (returns-a / funnel-a: drop
  d137 at (5,3), quarry gone).

LOTTERY-ARM (lever code, 8 seeds): 2 picks, both seed 75104,
nikos_papadopoulos, both eulogy huntDay 170:
- d172 part 685 -> SUPERSEDED-BY-RE-PICK. First later pick d173
  part 690 chose HUNT for the same eulogy while the candidate
  was still eulogy (re-affirmation, per pickdepart).
- d173 part 690 (age 3, last fresh day) -> CANDIDATE-NULL-
  AFTER-PICK. First later pick d174 part 692 chose SEEK with
  candidate null; closed gate: age = 4 (> 3, stale). Every other
  gate green on the d174 record (pickdepart's explanation,
  re-derived exactly by this analyzer).

Pooled: departed-pick-linked 1/4 (25%), superseded-by-needs-pick
1/4 (25%), superseded-by-re-pick 1/4 (25%),
candidate-null-after-pick 1/4 (25%), gate-blocked 0,
died-before-departure 0, horizon 0, unknown 0.
Replaced-before-departure family (classes 3+4+5): 3/4 = 75%.
Departed share: 1/4 = 25%.

WHY THE UNIVERSE DID NOT GROW (the census's real finding):
- The task brief described funnel-a as "10 seeds, 75101-75110".
  The corpus on disk is 16 seeds, 75101-75116 — and even the
  corrected 16-seed band adds nothing: seeds 75109-75116
  contributed 91 funnel picks (183 total vs lottery-base's 92)
  but ZERO wave-4 HUNT picks (independent cross-check: a
  separate python count over the corpora agrees, 2 wave-4 picks
  in funnel-a, both seed 75106; 2 in lottery-arm, both seed
  75104).
- Lottery-base (8 seeds, 92 picks) is a byte-duplicate of
  funnel-a's first 8 seeds (analyzer dedup leg: all 8 rows
  byte-identical, SHA-256 compared — not sampled, all rows).
  Pooling it would have double-counted the same two picks and
  faked n=6 with a 2/2/1/1 split. Excluding it is what keeps
  the census honest, and it is why "larger corpora" did not
  mean "larger universe": two of the five named corpora are the
  same band twice, and two carry no pick records at all (below).
- Per-seed wave-4 HUNT pick rate on the base band: 2 picks in
  16 seeds. A dominance bar at n >= 10 would need roughly
  five times this band at the same rate — or a band where
  wave-4 survivor stories are denser. That is a next-prereg
  decision (see metric review), not a mid-run re-score.

## Corpus disposition (as pre-registered, verified by the analyzer)

- perseed-funnel-a/ — INCLUDED (primary base-code universe).
  16 seeds, 75101-75116, 183 funnel picks, has funnel.picks +
  returns.departures + deathsList.
- perseed-lottery-base/ — EXCLUDED from pooled (duplicate band),
  USED for re-proof only. 8 seeds, 92 picks; all 8 rows
  byte-identical to same-seed funnel-a rows (dedup PASS).
- perseed-lottery-arm/ — INCLUDED as separate stratum
  (lever-code second population). 8 seeds, 20 funnel picks, has
  all three record types. The lever is already killed; nothing
  here re-judges it.
- perseed-returns-a/ — EXCLUDED. 16 seeds, but NO funnel.picks
  and NO deathsList (returns.departures present). Departures
  alone cannot classify picks.
- perseed-w4dpr2/ — EXCLUDED. 16 seeds, but NO funnel.picks,
  NO returns.departures, NO deathsList. It carries none of the
  three record types the classification needs.

## Coverage limits (as pre-registered, with observed bite)

- PICK COVERAGE HOLDS: the funnel recorder records any pick
  where the villager held a wave-4 memory OR chose a wave-4
  HUNT (scripts/policies/funnel-diag.js, read before the
  prereg), so no wave-4 HUNT pick can hide from it. The 2-pick
  funnel-a count is a real scarcity, not a recorder hole —
  confirmed by the independent python recount, which uses no
  analyzer code.
- E1 EVICTION GAP: 0 picks flagged. No funnel.notes eviction of
  a hunt mid falls between any pooled pick and its first later
  recorded pick (or corpus end). The first-later-pick-gap caveat
  therefore did NOT bite on this universe; it remains a stated
  limit for future bands, not an observed distortion here.
- E2 NAMED-GATE NOTES: none. No pick landed in gate-blocked or
  horizon, so no extra gate note arises.
- DEPARTURE JOIN / DEATH GRANULARITY: inherited from pickdepart
  unchanged (returns departures as the departure side; deaths
  day-granular, SAME-DAY flag unused — no pooled pick is
  died-before-departure).
- SUBSTRATE MIX: the pooled total mixes base-code trajectories
  (funnel-a) with lever-code trajectories (lottery-arm). On this
  run the mix is moot for the verdict — each stratum contributes
  exactly its pickdepart pair, and neither stratum alone reaches
  n >= 10 either — but the split is reported so no future pooled
  claim can hide a stratum effect.

## Secondary census: all-wave HUNT picks (funnel-recorded only)

Same taxonomy, ALL HUNT picks (all waves) in the pooled corpora —
labeled as pickdepart labeled it: funnel-recorded picks only
(picks by wave-4 memory holders or wave-4 HUNT choosers), so this
is a subset of all HUNT picks, not all of them.

- Funnel-a: 9 picks — departed-pick-linked 5, superseded-by-
  re-pick 2, superseded-by-needs-pick 2. (Pickdepart's lottery-
  base secondary was 8; the extension band 75109-75116 adds
  exactly 1 all-wave pick.)
- Lottery-arm: 3 picks — departed-pick-linked 1 (the callback
  hunt, d177 pick -> d178 departure -> drop), re-pick 1,
  candidate-null 1.
- Pooled all-wave: 12 picks — departed 6/12 = 50%, re-pick 3,
  needs 2, candidate-null 1.
- Contrast: all-wave departed share 50% vs wave-4 departed share
  25%. Wave-4 pick-to-departure still reads worse than HUNT
  pick-to-departure in general — on the same small base as
  pickdepart, now with one more all-wave pick and no more
  wave-4 picks. The contrast direction is unchanged; its
  strength is unchanged in any meaningful sense.

## Sense review (verbatim traces, SENSE-TESTING LAW)

There is NO extension-band wave-4 trace to quote: seeds
75109-75116 produced no wave-4 HUNT pick, so no new villager
story exists in the extension. The trace below is the baseline
needs-supersession case (seed 75106, visjoin_113), quoted
verbatim from the analyzer's --sense output — the same decision
pickdepart classified, now shown with its neighboring picks,
which add one human-shaped beat pickdepart did not emphasize:

```
  PICK d134 part=532 visjoin_113 chosen=VISIT candidate=eulogy@(5,3)/day132 pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2],["gallowdeer",3,4,133,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d134 part=535 visjoin_113 chosen=EAT candidate=eulogy@(5,3)/day132 pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2],["gallowdeer",3,4,133,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d135 part=536 visjoin_113 chosen=HUNT/eulogy candidate=eulogy@(5,3)/day132 pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2],["gallowdeer",3,4,133,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d135 part=539 visjoin_113 chosen=EAT candidate=eulogy@(5,3)/day132 pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2],["gallowdeer",3,4,133,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d136 part=540 visjoin_113 chosen=HUNT/gallowdeer candidate=gallowdeer@(3,4)/day133 pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2],["gallowdeer",3,4,133,3]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  PICK d137 part=545 visjoin_113 chosen=HAVEN_CHORE candidate=null pre=[["moderator",5,3,125,3],["gavel",3,3,129,3],["eulogy",5,3,132,2]] gates={"armed":true,"sheltered":false,"postFleeResting":false,"maxD":1}
  DEP d133 part=529 FORAGE -> (3,4)
  DEP d136 part=540 HUNT/gallowdeer -> (3,4)
  DEP d139 part=553 VISIT -> (4,5)
  DEP d141 part=562 GUARD -> (5,5)
```

Judgment: this still reads as an errand queue overwriting a
decision, not a person holding a plan — but the neighboring
picks sharpen it. The same villager, the day after dinner
replaced her eulogy hunt, picked a wave-1 gallowdeer hunt and
departed on it the SAME part (d136 part 540 pick -> part 540
departure). She is not unable to depart; she is not
unwilling to hunt. The wave-4 decision died in 3 parts while
the wave-1 decision lived instantly. That asymmetry — same
person, same week, same gates green — is the sense case for
pickdepart's reading in one trace: the wave-4 pick is the one
the queue eats. The nikos trace (arm, seed 75104) re-derives
verbatim and unchanged from pickdepart (analyzer --sense
output, same lines d171-d180 + departures d174-d178); its
judgment stands as pickdepart wrote it and is not repeated
here to avoid re-judging carried evidence.

## Village assessment in plain words

The villages did not produce more hunters who decide; they
produced the same two decisions per band, and the extension
band produced none. What the village looks like, on the full
16-seed base band: 11 of 16 villages reach wave 4, 13 of 16
touch national at some point, 4 win — but only ONE village
(75106) ever turns a wave-4 fight memory into a hunt pick, and
only one of its two picks ever walks out. Who thrived: nobody
on this measure — the band's wave-4 hunts still produce zero
meetings (the one departure found an empty tile). Who died and
why is not the story here; the story is who never got the
chance to decide: wave-4 survivor stories themselves are the
rare event, and the pick is rarer still. Missing capabilities,
in order, unchanged from pickdepart: a danger verdict a hunt
can survive; a record of that verdict so the next measurement
does not have to infer it; and behind both, a way to find a
beast that moved. Blank filled by this run: the classified
sample is now proven to be the whole available sample, not an
under-count — the tie is not a sampling artifact of the pilot
band, it is the shape of the full existing corpora. Blank
documented, not filled: a dominance verdict needs a denser
universe, which no existing corpus supplies.

## Metric review (for the NEXT run — never a mid-run re-score)

- (a) PER-CLASS vs FAMILY DOMINANCE: this run judged per-class
  as pre-registered (max 0.25, fail) and reports the family
  alongside (replaced 0.75). The family number is stable across
  pickdepart and this census (3/4 both times — because the
  picks are the same). The next prereg must decide, BEFORE
  seeing any new split, whether the family rollup becomes the
  judged metric or per-class dominance stays with a larger
  band requirement. What it must not do is pick the reading
  after seeing the split — this run did not.
- (b) POOLED vs SINGLE-STRATUM JUDGING: the pooled mix of
  base-code and lever-code strata was judged here as
  pre-registered, but on this run both strata are too small
  alone (2 each) for the distinction to matter. A future census
  with a denser universe should pre-register whether the
  base-code stratum alone is the judged population, with the
  arm as context — especially since lever-code trajectories
  diverge from base trajectories from the first animal fight
  onward (lottery evidence).
- (c) UNIVERSE DENSITY AS A PRE-REGISTRATION INPUT: this run's
  bar (n >= 10) assumed the expanded corpora would supply >= 10
  picks. They supplied 4. A future prereg should either (i)
  pre-register a seed band sized from the measured pick rate
  (~2 picks / 16 base seeds — so ~80 seeds for n >= 10 at the
  same rate, or a band chosen for denser wave-4 survivor
  stories), or (ii) judge dominance on the all-wave census
  (n = 12 pooled here, departed 6/12 = 50% — note: this is
  reported, NOT judged, because the prereg bound the leg to
  wave-4 picks). Option (ii) must be pre-registered, not
  adopted retroactively on the strength of this paragraph.
- (d) FIRST-LATER-PICK LAG: lags reported alongside every class
  (departure 2d/8 parts; needs supersession 0d/3 parts; re-pick
  1d; candidate-null 1d). Unchanged from pickdepart; a future
  prereg can judge lag-weighted conversion without re-reading
  the corpora.
- (e) E1 EVICTION GAP: 0 flags on this universe. The caveat
  stands for future bands; if a future band shows flags, the
  prereg for that band must say whether flagged picks keep
  their first-recorded-later-pick class or move to a named
  gap class — decided before analysis.
- (f) PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-seed corpora are the §15
  substitute, as in returns-a/funnel-a/lottery-a/pickdepart-a.
  No panel artifact faked, no panel verdict claimed.

## Reproducibility

- Analyzer: scripts/test-pickcensus-a.js (pure reads; node
  --check clean; determinism: two runs byte-identical output).
  Run: node scripts/test-pickcensus-a.js --sense --out
  evidence/2026-10-29/pickcensus-a-analysis.json -> dedup PASS
  (8/8 byte-identical), re-proof PASS (exact pickdepart 4),
  primary funnel 2 (needs 1, departed 1), arm 2 (re-pick 1,
  candidate-null 1), pooled 4, unknown 0, secondary pooled
  all-wave 12, E1 flags 0.
- Independent cross-check (not analyzer code): python recount
  over the corpora agrees — funnel-a wave-4 picks 2 (both
  75106), lottery-arm wave-4 picks 2 (both 75104); eulogy wave
  4, gallowdeer wave 1, callback wave 3 per src/data/
  monsters.json.
- Corpora reused read-only (never overwritten):
  evidence/2026-10-29/perseed-funnel-a/ (16 rows + summary),
  perseed-lottery-arm/ (8 rows + summary), perseed-lottery-base/
  (8 rows + summary, re-proof/dedup only). Excluded corpora
  (returns-a, w4dpr2) were read for inventory only (row keys),
  not classified.
- Zero src/js diff on this branch (verified at closeout). No
  push, no bump, no live verification (ship-loop line). Ready
  for coordinator merge, pending ship — via the coordinator.
- INDEX-CLOBBER NOTE (run mechanics, not a result): after the
  prereg safe-commit, the worktree index showed the prereg file
  as a staged deletion while the worktree file was byte-identical
  to HEAD (the safe-commit index-clobber class recorded in
  AGENTS.md). Repaired with the documented route only
  (git update-index --add --cacheinfo with the HEAD blob hash,
  verified identical to the worktree file); no reset, no
  checkout, no ref surgery. Status verified clean-empty diff
  vs HEAD before the final commit, and re-checked after it.

## Commits

- c13d64273 prereg (before any judged analysis).
- Analyzer + analysis JSON + this evidence: final commit(s) on
  this branch (hashes in the run report to the coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the pick
census is now proven complete over every corpus that can
support it (4/4 classified, dedup + re-proof + determinism
all pass, eviction gap clean) — but no single mechanism
dominates at n=4, no wave-4 field party has yet killed in the
field, the full seat stays 0, wave 5 stays 0, and the departure
fix itself is still unbuilt. The directive stands until the
tracker records this axis converged on measured evidence.
