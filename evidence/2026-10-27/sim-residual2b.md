# sim-residual2b — trace the two left-open residuals (DIAG only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0630Z, axis
food-economy, arm sim-residual2b. Measurement only: zero src/js changes,
no default flips, no game-code lever. Judged ONLY against
evidence/2026-10-27/sim-residual2b-prereg.md (committed as 8e1381424
BEFORE any judged trace). This arm does NOT re-judge the stockdoors
NO-GO or the residualhunt GO — its verdict is ONLY whether the two
targets below trace.

## Verdict against the pre-registered bar: phase-1 NO-GO, phase-2 traces both

GO iff BOTH targets are traced exactly to named records, OR one is traced
exactly and the other is decomposed with its dominant component exact and
its remainder itself itemized. A target counts as TRACED iff the trace
names the specific records (or the specific boundary mechanism with the
specific records) whose kcal sum equals the residual exactly.

- Phase 1 (the judged verdict, corpus only): NO-GO. Neither target is
  traced exactly to named records in the committed residualhunt corpus.
  Both decompose to a single isolated, record-free, partial-stack
  shrinkage of a dried channel — itemized to the transition, the stack
  count, and the unit count, but with NO naming record in any of the
  six instruments. Zero targets are fully traced, so the GO's second
  clause (one traced + the other decomposed) cannot hold either. No
  re-scoring was done: the steps are not called "traced" on the
  strength of being located, and no friendlier metric was substituted.
- Phase 2 (contingency, stated in the prereg BEFORE judging, reported
  separately, does NOT retroactively change the phase-1 verdict): both
  targets traced exactly. A DIAG-only pantry-diff tracer on a pilot
  rerun (seed 9825, 83 days, pinned base) names the same unwrapped
  path for both steps: the unanswered-raid take in
  `villageAgencyDaily` — `_removePantryKcal(800)` at endDay. The
  phase-1 NO-GO stands as judged; what phase 2 adds is the mechanism,
  for the next ledger run's instrument (see "Metric review").

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: per-target trace exactness — named records' kcal sum
  vs the target residual (LQ dried -800; Muscadine 9825 -864), plus for
  LQ the net -120 family-residual arithmetic.
- GO threshold: verbatim from the assignment (see "Verdict" above).
- Horizon + why: 100d, inherited from the residualhunt corpus — the
  residuals are defined over that horizon (closing snapshot day 100,
  post-horizon flows day 101); phase 1 traces a committed corpus and
  sets no new horizon. Phase 2 runs 83 days (covers both steps: day 76
  and day 82, plus one confirming snapshot each).
- Seeds: 9820–9827 (corpus substrate); the targets live on seed 9825.
  Phase 2 runs seed 9825 only.
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).

## Phase 1 — per-target traces (corpus only)

Corpus cited, not duplicated:
evidence/2026-10-27/sim-residualhunt-b-corpus/ (8 files, integrity
proven: per-seed counts match the residualhunt census exactly —
stockdoor 640/849/693/465/501/398/827/757, direct 23/115/128/237/73/97/
9/8, dried 163/109/97/107/73/139/98/107, mealDraw 1249/1390/1330/1291/
1352/1468/1366/1339, inflows 255/197/227/287/175/462/313/280).

Instrument: scripts/trace-residual2b.js (vendored from
trace-residualhunt-b.js under a residual2b name; header only changed)
plus the NEW scripts/trace-residual2b-dried.js, which traces one exact
channel with both its freshKcal and spoiledKcal series. Trace caveats
from the residualhunt evidence were binding and were honored:
single-transition steps were never taken as verdicts (the Muscadine
lag dance oscillates by thousands and nets to zero — see below); only
persistent steps and post-horizon flows were allowed to name a
residual, and within-horizon was separated from post-horizon first
(both targets: post-horizon net 0).

### Target (a) — Lamb's Quarters dried -800: DECOMPOSED, remainder open in phase 1

Family decomposition (independent recomputation, analyzer NEW
definition): family +1,130 = base +1,250 + dried −120.
- Base +1,250 = exactly the day-100 base draws (player 7u × 50 = 350
  + villager-home 17u × 50 = 850 + villager-home 1u × 50 = 50, all
  spoilDay 101) — the residualhunt closing-boundary artifact, already
  traced, not re-judged here.
- Dried −120 = +680 day-100 dried draw (player 17u × 40 = 680,
  spoilDay 101, unreflected in the closing snapshot: the dried trace
  shows transition #100 with actual 0 vs predicted −680, stepDiv
  +680) netted against the −800 step below. 680 − 800 = −120. ✓
- The −800 step: dried-channel transition #82 (days 81 → 82):
  fresh 3,840 → 3,040, predicted 0 from every instrument, stepDiv
  −800, and the cumulative dried divergence stays at −800 from #82
  onward except for the day-100 +680 (final −120). Stacks: 3 on both
  snapshots — no stack removed, a partial-stack shrink of exactly
  20u × 40. Spoiled: 0 → 0 — NOT a fresh→spoiled reclassification
  (refuted, not assumed). Flows in the interval: none in any
  instrument — no dried draw, sweep, transform-out, direct record, or
  inflow on days 81–82, and day-82 flows for other families are
  recorded normally (not a blanket snapshot gap). The preceding
  transition (#80) is clean: the day-80 split transform-in
  (+2,200, 55u × 40, spoilDay 95) accounts exactly for 1,640 → 3,840;
  the following transition (#83) is clean: the day-83 transform-in
  (+560) accounts exactly for 3,040 → 3,600. The −800 is the only
  unexplained dried movement in the whole 100 days.
- Phase-1 status: the −800 is itemized (transition, channel, 20u × 40,
  stacks 3→3, spoiled 0→0, no records) but NOT traced — no record
  names it. The family residual's dominant dried component is the
  −800 itself, so the "dominant component exact" clause does not
  rescue it in phase 1.

### Target (b) — Muscadine 9825 −864: DECOMPOSED, remainder open in phase 1

Family decomposition (independent recomputation): family −864 =
base 0 + dried −864. The base channel closes exactly (open 0, close
1,710, inflow 222,750, draws 120,780, sweep 71,820, transform-pre
28,440) — the whole residual lives in the dried channel (open 0,
close 0, transform-post 22,752, draws 21,888, sweep 0).
- The −864 step: dried-channel transition #76 (days 75 → 76):
  fresh 9,504 → 8,640, predicted 0, stepDiv −864. Stacks: 3 on both
  snapshots — a partial-stack shrink of exactly 12u × 72. Spoiled:
  0 → 0 — again NOT a reclassification. No record of any kind
  touches the channel on days 75–76 (nearest records: the day-74
  split transform-in +3,168, accounted in transition #74, and the
  day-77 transform-in +720, accounted in transition #77).
- The rest is lag, not signal: the family trace's wild oscillations
  after #76 (steps of ±2,448, ±2,304, ±2,682 — draws reflected one
  transition late, e.g. day-78 draw 864 reflected in snapshot 79,
  day-79 draws 2,304 reflected in snapshot 80) net to exactly 0
  across transitions #78–#100 (verified: the dance returns to −864
  at #80, #84, #89, #92 and ends at −864). Zero day-100 draws and
  zero post-horizon flows — this is NOT a closing-boundary case, as
  the assignment said. The single #76 step is the entire residual.
- Phase-1 status: same as (a) — itemized exactly, traced to no
  record. Two targets, one phenomenon: an isolated, record-free,
  partial-stack shrinkage of a dried channel, mid-run, permanent
  (never returns in later snapshots).

### What phase 1 rules out (both targets)

- Not a closing-boundary case: (b) has zero day-100 draws and zero
  post-horizon flows; (a)'s −800 sits at day 82, not at the boundary.
- Not spoilage reclassification: spoiledKcal is 0 on both sides of
  both steps, and no stack crosses its spoilDay+bonus boundary there
  (all three stacks' bonus horizons tick down by exactly 1).
- Not a whole-stack removal: stack counts are unchanged (3 → 3).
- Not a snapshot gap: other families' flows on the same days are
  recorded normally.
- Not a transform, draw, sweep, direct take, inflow, or stockdoor
  event: every instrument was searched for the exact channel name on
  the step days and adjacent days — nothing touches the channel.

## Phase 2 — the unwrapped path, named (reported separately)

Contingency invoked exactly as pre-registered: the corpus alone could
not name a component, so a second-phase DIAG-only recorder plus a
pilot rerun on seed 9825 on the pinned base (pre-c04d4e0cb game.js,
blob b2ba423afdfbdce8c98751ef544f10805b46cfa6; backed up outside the
repo, swapped, run, restored, `git diff HEAD -- src/js/game.js`
verified empty, NEVER committed) was added. Phase-2 corpora:
evidence/2026-10-27/sim-residual2b-corpus/ (first run, pantry-diff
log) and evidence/2026-10-27/sim-residual2b-corpus2/ (second run,
same counts, with call stacks).

- Reproduction: both steps reproduce exactly on the pinned base —
  Muscadine dried 9,504 → 8,640 at days 75–76, LQ dried 3,840 → 3,040
  at days 81–82 — and the rerun's per-seed counts match the corpus
  shape (83 days, 6 deaths, sweeps 83, driedEvents 115, mealDraw
  1,263, inflows 412, stockdoor 294, direct 92, identical across both
  phase-2 runs).
- The tracer (scripts/pantrydiff-residual2b.js) wraps every own
  function of Game with depth tracking and logs only innermost
  diffs on the two target channels. Across 83 days it logs exactly
  48 entries — and exactly TWO `_removePantryKcal` entries, the two
  target steps, nothing else:
  - Day 75 (tracer day): `_removePantryKcal(800)` — Muscadine Grapes
    (dried) 44u → 32u, spoilDay 89. 12u × 72 = 864.
  - Day 81 (tracer day): `_removePantryKcal(800)` — Lamb's Quarters
    (dried) 55u → 35u, spoilDay 95. 20u × 40 = 800.
- Call stack (corpus2, both entries identical): `_removePantryKcal`
  ← `villageAgencyDaily` (src/js/villageAgency.js:203) ←
  `hierarchyDaily` ← `membershipDaily` ← `endDay`. The caller is the
  unanswered-raid branch: when a raid defense sits unanswered
  (`pendingRaidDefense`, `day > pr.day`), the raiders take
  `_removePantryKcal(800)` at endDay — after that day's policy
  snapshot, before the next day's snapshot, which is why the corpus
  step appears at the (75→76] / (81→82] transitions with no flow
  recorded on either day. The raid is narrated in-game ("You weren't
  at the treeline. … they hit the stores and melted back into the
  dark with N kcal.") and journaled — the kcal removal itself is
  what no instrument wrapped.
- Why 864 from an 800 call: `_removePantryKcal` (hierarchy.js)
  sorts the pantry by spoilDay ascending and iterates from the end
  (longest-lived first), taking whole units —
  `takeUnits = ceil(need / kcalEach)`. For Muscadine dried at 72:
  ceil(800/72) = 12 units = 864 (honest over-removal by design;
  callers report actuals). For LQ dried at 40: ceil(800/40) = 20
  units = exactly 800. In both cases the first stack touched was a
  dried stack (dried goods keep longest, so they sit at the
  latest-spoilDay end), its units covered the whole need, and no
  second stack was touched.
- Phase-2 trace tables (exact):
  - (a) LQ dried: raid −800 (day-81 endDay, 20u × 40, spoilDay-95
    stack 55→35u) + day-100 dried draw +680 = dried residual −120;
    family +1,130 = base +1,250 + dried −120. ✓
  - (b) Muscadine: raid −864 (day-75 endDay, 12u × 72, spoilDay-89
    stack 44→32u) + base 0 + all other dried flows net 0 = family
    −864. ✓
- Both targets are therefore traced exactly in phase 2 — to a named
  mechanism with named records (the tracer log entries + the code
  branch). The phase-1 NO-GO is NOT retroactively changed: phase 1
  judged the corpus, and the corpus does not contain this path.
  The finding belongs to the next ledger run's instrument, not to a
  re-score of this one.

## Reachability verdict (from the corpus, not invented)

On this band (competent-nofeast, seeds 9820–9827, 100d): waves 1–3
reached (wave 3 on 9822/9824/9825, wave 2 on the rest); waves 4–5 on
0/8 seeds. Regional, national, table, wins: 0/8. Rank stayed village
on all 8 seeds. Arc II/III/IV, four-realm formation, trap acquisition,
counter discovery/kill, and young-link succession survival are not
recorded in this corpus and are not estimated here. The scale wall
stands on this band; this arm measures a pantry ledger, it does not
move the wall numbers.

## Wall numbers (this band, competent-nofeast, seeds 9820–9827)

National / table / wins: 0/8. Wave-4/5 unlocks: 0/8. Wave reach per
seed: 9820: 2, 9821: 2, 9822: 3, 9823: 2, 9824: 3, 9825: 3, 9826: 2,
9827: 2. Median survival: 100d (censored at the 100d horizon; all 8
seeds survived to day 100). Deaths: 38 total (9820: 4, 9821: 1,
9822: 4, 9823: 9, 9824: 10, 9825: 6, 9826: 2, 9827: 2) — sickness
dominates, then monsters and fights, not the pantry.

## Village assessment (plain words)

Eight villages, all surviving the full 100 days around pantries that
are now watched down to the unit: the food story here was never
hunger — nobody starved, and the villages that lost the most people
(9824, 9823) lost them to sickness and fights, not to empty shelves.
What the villages looked like, up close on seed 9825: a working
pantry economy where Wilhelm cooks for the haven and works the smoke
racks (8 batches on day 82 alone), dried greens and grapes put up for
weeks, and — twice in 83 days — a night raid at the treeline that
nobody answered, so raiders walked off with a fixed 800-kcal share
of the longest-keeping stores. The villagers acted like people
around this: they cooked, preserved, ate, and left a raid
unanswered, and the game said so out loud. What was missing was
never food: it was a witness. The ledger's instruments watched the
meals, the racks, the sweeps, and the direct takes — but nobody
watched the raid take, so two 800-kcal bites looked like bookkeeping
ghosts. Blanks filled: (1) both left-open residuals are now traced
to the kcal in phase 2 — the LQ −800 and the Muscadine −864 are the
same unanswered-raid mechanism, not two mysteries; (2) the raid
take's whole-unit overshoot (800 asked, 864 taken) is documented
from the code, not guessed; (3) the lag dance on high-volume
families is characterized (draws reflect one transition late and
net to zero — a trace reader who chases single steps on Muscadine
will hallucinate residuals). Documented, not fixed: no game-code
change was made (DIAG only), and wrapping the raid take into the
ledger instrument belongs to the next run's prereg. Sibling note
(reported plainly, outcome not assumed): the sibling ledgerbound arm
is re-judging legs under a boundary-aware closing in its own tree;
if its LQ 9825 net still shows −120, this run's decomposition
(+680 day-100 draw − 800 raid) explains it — the coordinator
reconciles.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

Sampled day, seed 9825, day 82 (the LQ raid's snapshot day): "Wilhelm
cooked for the haven — meals stretched. Wilhelm worked the smoke
racks too — 8 batches preserved (~2737 kcal, keeps a couple of
weeks)." This reads as a person doing a day's work, not a counter:
one named villager, two jobs (cooking, preserving), a concrete
yield, and a shelf-life judgment ("keeps a couple of weeks") that
matches the preservation ladder. It is also coherent with the
ledger on the same day: the day-82 driedEvents list exactly 8
batches (Winner's share, Fish × 2, Foraged × 5) — the line and the
records agree. The raid's own in-game line (from the code branch
that phase 2 identified, not from the corpus say-lines, which only
capture smoke-rack lines): "You weren't at the treeline. [Champion]
of [village] didn't wait — they hit the stores and melted back into
the dark with [N] kcal. The village will talk about this for a long
time." That is a consequence with a social tail (opinion −5,
journal entry), not a silent debit — the game narrates the raid;
only the ledger instrument was deaf to it. Nothing robotic, static,
or repeated was found in the sampled dialogue.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: phase 1 judges the corpus, and the corpus names
  no record for either step — NO-GO, honestly, without re-scoring
  (no calling a located step "traced", no switching to pooled
  residuals, no claiming the raid from code alone as a phase-1
  trace). The GO bar's "traced" definition did its job: it kept a
  located-but-unexplained step from passing as explained.
- Bar lesson for the NEXT run: the ledger instrument's blind spot
  is now named — `_removePantryKcal` (raid takes, tributes, and
  every other caller of that helper) is outside all six instruments.
  The next ledger arm should pre-register a raid/tribute door (wrap
  `_removePantryKcal`, or snapshot-diff endDay) and re-judge the
  SAME family-seeds on the SAME base. Expected outcome under that
  instrument: LQ 9825 closes at −120 → 0 after the raid door (or at
  the boundary-aware −120 the sibling arm judges), Muscadine 9825
  closes at −864 → 0, and the stockdoors leg-3 rate moves with the
  raid door included — the next prereg should say which closing
  counts.
- Instrument lesson: a trace that only follows the six instruments
  cannot see endDay processing at all. The day snapshot is taken
  after the policy day but before endDay, so ANY endDay removal
  (raids, and anything else riding endDay) appears as a step with
  no flow on either adjacent day. Future traces must treat
  "step with no flow, stacks unchanged-or-partial, spoiled flat"
  as the signature of an endDay removal and check the endDay
  callers first — not the snapshot timing.
- Trace-caveat confirmation: the ~1-transition lag is real and
  large on high-volume families (Muscadine steps of ±2,682 that net
  to zero). The binding rule held: only the persistent component
  (the #76 step, surviving every later oscillation) named the
  residual; the dance around it named nothing.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no
  before/after to panel. The det-gate is the instrument
  before/after (the residualhunt proof's det-gate, reproduced by
  reference: identical records with the instrument off vs on, and
  the phase-2 rerun's byte-shape reproduction of the corpus counts
  on seed 9825). Not re-judged here.

## Reproduction check (this run)

- Prereg committed BEFORE any judged trace (8e1381424); judged
  traces ran only on the committed residualhunt corpus (cited, not
  duplicated).
- Proof scripts/test-residual2b.js GREEN (31 checks): corpus
  integrity on all 8 seeds, trace reproduction on both targets via
  the vendored scripts, independent family decompositions
  (Muscadine base 0 / dried −864; LQ base 1,250 / dried −120),
  isolated-step stack/spoiled facts, phase-2 reproduction of both
  steps, exactly 2 `_removePantryKcal` entries with the exact unit
  counts, both stacks naming villageAgencyDaily, hygiene clean
  (zero src/js modified apart from the pinned-game.js allowance in
  BOTH checks, zero sibling files modified), pinned-base discipline
  (worktree game.js restored to its HEAD blob bfa3631982cb2233fdc40ff54c4269bd2649c1fd;
  backup outside the repo at
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-residual2b-gamejs-backup.js,
  NOT committed). No jest was run (nothing to test in jest — the
  proof is node, not jest). No [needs-eyes]: this lands a
  measurement, not a player-visible change.
- Phase-2 discipline: pinned base swapped in twice (first run +
  stack rerun), restored after each, `git diff HEAD -- src/js/game.js`
  verified empty after each restore, pin never committed.
- Infrastructure notes (loud): the container EPERM write flap
  blocked git writes for ~40 minutes at the start of this run
  (120 rapid safe-commit attempts failed; a background retry loop
  finally landed the prereg as 8e1381424) — the same flap the
  sibling ledgerbound arm's long-retry loop is fighting. After the
  prereg commit, the safe-commit index-clobber variant hit again
  (prereg showed staged-deleted in the main index) — repaired per
  the documented recipe (`update-index --add --cacheinfo` from the
  HEAD blob), verified `git status` clean + `git diff HEAD` empty
  + hash-object match, before proceeding. The phase-2 sweeps each
  took ~3.5 min wall for 1 seed (the residualhunt ~60s inter-seed
  gaps recur). The worktree's game.js is restored to its HEAD blob
  and verified; the pinned-base backup remains in the goal
  hidden_files dir for reference, NOT committed.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit 8e1381424 (prereg only) and the
  evidence commit (evidence file + 2 phase-2 corpus dirs + 5
  scripts: trace-residual2b, trace-residual2b-dried,
  pantrydiff-residual2b, sweep-residual2b, test-residual2b).

## Convergence line

converging — phase-1 NO-GO on corpus-only tracing, phase-2 traces
both residuals exactly to the unanswered-raid mechanism; the
left-open residual question converges, and the remaining work is
instrumental (wrap the raid take into the next ledger's prereg),
not investigative.

## Verdict (judged against the pre-registered bar, not re-scored): phase-1 NO-GO, phase-2 traces both

On the committed corpus alone, neither the Lamb's Quarters dried
−800 nor the Muscadine 9825 −864 traces to a named record — both
are isolated, record-free, partial-stack shrinkages of dried
channels (20u × 40 at transition #82; 12u × 72 at transition #76),
with stack counts and spoiled levels unchanged. The phase-2
contingency names the mechanism for both: the unanswered treeline
raid in `villageAgencyDaily`, `_removePantryKcal(800)` at endDay —
800 kcal asked, 800 taken from Lamb's Quarters (20u × 40) and 864
taken from Muscadine (12u × 72, whole-unit overshoot) — a path no
ledger instrument wrapped. The next ledger run should wrap that
door and re-judge; this run spends no confirm band.
