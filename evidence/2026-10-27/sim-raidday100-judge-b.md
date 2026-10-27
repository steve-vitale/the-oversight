# sim-raidday100-judge-b — judged analyzer run on seed 20118: is the raiddor post-snapshot raid adjustment EXERCISED?

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-judge-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, or the day99demand GO — their verdicts stand in their own
evidence. Its verdict is ONLY whether the raiddor post-snapshot raid
adjustment is exercised by seed 20118 under the raidday100 GO clauses
(b)-(f), with clause (a) re-verified on this arm's own post-prereg
judged sweep. Judged ONLY against
evidence/2026-10-27/sim-raidday100-judge-b-prereg.md (committed as
1722f68e BEFORE any judged sweep — the judged sweep, analyzer, and
proof all ran after that commit, in that order).

## Verdict against the pre-registered GO: NO-GO

GO required ALL of (a)-(f). Clause (a) is re-verified on the judged
sweep itself, clause (e) passes, clauses (c) and (d) hold only
vacuously on focal rows — but clauses (b) and (f) FAIL, so the verdict
is NO-GO under the prereg's vocabulary (clause (a) verified, a later
clause fails). This is NOT a verdict that the adjustment is broken or
unexercised in substance: the adjustment IS exercised on the row the
take actually touches (Canned soup — off by exactly 1,000 without it,
closed exactly with it), but that row is not a focal row, so the
raidday100 focal formulation of (b) cannot see it. The distinction
between "exercised in substance" and "GO under the focal formulation"
is the finding of this run, and the evidence file keeps them separate
throughout — nothing here re-scores (b) to count the Canned soup row.

- (a) PASS (re-verified, not assumed): the post-prereg judged sweep of
  20118 itself shows daysAlive == 100, endReason survived,
  lastSnapDay == 100, a demand dated 99, and a take dated 100. The
  judged corpus matches the day99demand screen corpus on every field
  except the raid record's stackTop path (worktree path + capture
  line number — expected, the capture file lives under a different
  worktree name) and `ms`. Counts identical: inflowSeen 257,
  mealDrawRecords 1,336, deaths 2, driedEvents 120.
- (b) FAIL: the day-100 raid touches ZERO focal family-seed rows.
  The take is Canned soup 4u x 250 = 1,000 only, so under the
  analyzer's family mapping (famOf of the item name) it touches the
  Canned soup row alone (raid100 = 1,000 there) and no focal row
  (raid100 = 0 on every focal row). Counted focal rows on 20118 are
  Muscadine Grapes and Foraged food only (see table below);
  Lamb's Quarters, Burdock, and Purslane have no counted row (no
  inflow, opening, closing, or dried-event row at all on this seed).
- (c) VACUOUS (not a pass): zero focal rows are touched, so there is
  no touched row whose closure could fail — but per the prereg's
  vacuity rule a vacuous (c) never rescues a (b) miss, and the
  evidence labels it VACUOUS, not PASS. (The proof's touched-close
  check FAILs on the empty set because it requires touched >= 1;
  that is the (b) failure surfacing inside (f), not a separate (c)
  failure.)
- (d) VACUOUS on focal rows (not a pass): for every counted focal
  row, (residual WITHOUT) - (residual WITH) == 0 == raid100 (0),
  and the dried difference == 0 == raid100D (0) — the identity holds
  trivially because the adjustment moves nothing on focal rows.
  NON-VACUOUS on the taken-item row (exercise record, not a GO
  input): Canned soup differs by exactly 1,000 = raid100 (dried
  difference 0 = raid100D).
- (e) PASS: pooled focal channels close WITH the adjustment under
  the raiddor bars where counted rows exist: named pooled 0 /
  15,660 = 0.000% (<= 1%, 1 named row counted), generic pooled -191
  / 382,626 = 0.050% (<= 1%, 1 generic row counted), dried pooled 0
  / 132,518 = 0.00% (<= 2%). Stated plainly: these equal the
  boundary legs exactly, because raid100 == 0 on both focal rows —
  (e) passes without the adjustment moving anything on focal rows.
- (f) FAIL: the proof (scripts/test-raidday100-judge-b.js) is NOT
  green on the judged corpus: PROOF FAILED with exactly 2 failures,
  both in section 3d — "day-100 raid touches at least one focal
  family-seed row" (none) and "touched focal rows close WITH the
  post-snapshot adjustment" (none). Every other check PASSES (38
  PASS lines): corpus validity, the det-gate (see below),
  independent recomputation of all nine pooled figures, raid
  integrity, raid-door disjointness, and hygiene. The proof is
  faithful, not a rubber stamp: it fails exactly where (b) fails
  and nowhere else. Per the prereg, that double-counting is
  intended, and (f) fails accordingly.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: day-100 raid exercise on seed 20118 — the judged
  sweep's day-100 raid touching a focal row, closing with the
  adjustment, and off by exactly the raid amount without it.
- GO threshold: verbatim adapted from raidday100 clauses (b)-(f)
  plus clause (a) re-verification (see "Verdict" above and the
  prereg for the full text, including the vacuity rules and the
  verdict vocabulary).
- Horizon + why: 100 days, death-aware — the horizon the boundary
  question lives on. Seed 20118 survived the full horizon
  (daysAlive 100, endReason survived).
- Seeds: 20118 ONLY, post-prereg judged sweep. No screen, no
  confirm band: one exercised leg on one supplied seed.
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
- Base: NO pin. Worktree HEAD at prereg time b353f3817, unchanged
  through the judged sweep except this arm's own prereg commit
  1722f68e (no sibling commit between prereg and judging; verified
  by git log at evidence time). Zero src/js files modified.

## Closing-snapshot day + the adjustment (as pre-registered)

Closing-snapshot day = lastSnapDay = 100 on this seed (last spoilDays
snapshot day 100, freshKcal 110,054, taken during the day-100
policy.daily before that day's sleep/endDay). The day-100 take is
dated == lastSnapDay, so raid100 = 1,000 (total), raid100D = 0 (the
take is all Canned soup, foodState null, no dried item). The
adjustment: rBClosing = bClosing - raid100, rBClosingDried =
bClosingDried - raid100D, per family.

## Per-focal-row table (judged corpus, analyzer raid-door legs)

Counted iff boundary inflow >= 10000. rBResidual = residual WITH the
post-snapshot adjustment; noAdj = residual WITHOUT it (raid draws
still counted, closing unsubtracted).

| Family row | Boundary inflow | raid100 | raid100D | rBResidual | rB share | noAdj residual | noAdj - with | Touched? |
|---|---|---|---|---|---|---|---|---|
| Muscadine Grapes (named) | 15,660 | 0 | 0 | 0 | 0.00% | 0 | 0 | NO |
| Foraged food (generic) | 382,626 | 0 | 0 | -191 | 0.050% | -191 | 0 | NO |
| Lamb's Quarters (named) | — (no row) | — | — | — | — | — | — | NO |
| Burdock (named) | — (no row) | — | — | — | — | — | — | NO |
| Purslane (named) | — (no row) | — | — | — | — | — | — | NO |

Pooled (clause (e)): named 0 / 15,660 = 0.000%; generic -191 /
382,626 = 0.050%; dried 0 / 132,518 = 0.00%. All under the raiddor
bars (1% / 1% / 2%).

## Exercise record (OBSERVATION, never a GO input — prereg's exercise-record rule)

The family row the day-100 raid actually touches:

| Family row | Boundary inflow | bClosing | rBClosing | raid100 | raid100D | rBResidual (WITH) | noAdj residual (WITHOUT) | noAdj - with |
|---|---|---|---|---|---|---|---|---|
| Canned soup (taken item, NOT focal) | 0 | 7,500 | 6,500 | 1,000 | 0 | 0 | +1,000 | 1,000 = raid100 |

Dried channel on Canned soup: rBDriedResidual 0, bDriedResidual 0,
difference 0 = raid100D. The adjustment IS exercised here in
substance: the row closes exactly WITH it (0) and is off by exactly
the raid amount WITHOUT it (+1,000). Its boundary inflow is 0 (the
take draws on starting stock, not on inflow), so no share is
defined for it — the absolute residuals are the evidence, not a
percentage. This record does NOT satisfy (b), (c), or (d): those
clauses are focal-row clauses, and the prereg forbids converting
this observation into a pass.

Corroboration (trace, scripts/trace-raidday100-judge-b.js on the
judged corpus, family "Canned soup"): the persistent divergence
starts at transition #100 (days 99 -> 100], stepDiv 1,000 — the
window shows the raid-unanswered draw (Canned soup 4u x 250 =
-1,000, day 100, asked 800) against a snapshot actual of 0. The
snapshot does not reflect the post-snapshot take; the boundary
closing must subtract it. That is the adjustment's case, shown
independently of the analyzer's legs.

## Instrument (vendored under NEW raidday100-judge names, zero sibling modifications)

- scripts/sweep-raidday100-judge-b.js (judged sweep; seed 20118,
  2,081 ms compute, file
  raidday100-judge-b-competent-nofeast-s20118.json written).
- scripts/analyze-raidday100-judge-b.js (log:
  evidence/2026-10-27/sim-raidday100-judge-b-analyzer.log).
- scripts/test-raidday100-judge-b.js (proof; log:
  evidence/2026-10-27/sim-raidday100-judge-b-proof.log).
- scripts/trace-raidday100-judge-b.js (row trace above).
- scripts/stockdoors-capture-raidday100-judge.js (internal raid
  field names raidRecords/raiddorOn and the RAIDDOORS env name
  retained for analyzer compatibility).
- NEVER modified: any sibling capture file (inflow/mealdraw/
  spoilvol/driedpath/stockdoor-capture, ledgerbound, raiddor,
  raidday100, day99demand files) or any src/js file. Proof hygiene
  confirms: zero src/js modified, zero sibling files modified, no
  modified tracked file outside this run's own files.
- Analyzer verdict strings are NOT this arm's verdict: the
  analyzer's "RAID-DOOR VERDICT: NO-GO" and "VERDICT (legs 2-5):
  NO-GO" are driven by leg 2 (coverage 1/1 vs the >= 7-seed bar),
  which the prereg states is NOT applicable to a 1-seed corpus and
  NOT part of this arm's GO. The raid-door legs themselves
  (leg3r/leg4r/leg5r) all PASS. The OLD-definition legs are controls
  only: OLD named leg 3 FAILs (resid 1,800, 11.49%) under the OLD
  pantryDraw-only definition, exactly as on the screen corpus —
  not a judged leg.

## Proof detail (what passed, what failed, and the det-gate)

- Corpus validity PASS (1 judged file; policy competent-nofeast;
  stockdoorsOn + raiddorOn true; no truncation; all 7 direct
  methods wrapped, none missing; raid fields present).
- Det-gate PASS (clause (f)'s det-gate leg, the instrument leg):
  instrument on (RAIDDOORS=1) vs off (RAIDDOORS=0) byte-identical
  on non-raid fields; inflow, mealdraw, spoilvol, driedpath, and
  death lists identical; wall fields identical; the on-run
  reproduces the judged corpus counts exactly (257 / 1,336 / 2 /
  120); the on-run records raid=1, the off-run raid=0. The
  instrument does not move the trajectory except through the raid
  fields it exists to record.
- Independent recomputation PASS on all nine pooled figures (old,
  boundary, and raiddor named/generic/dried) — a second code path
  reproduces the analyzer exactly.
- Raid integrity PASS (item sums equal returned kcal, retMismatch
  0), no unknown raid path or wrong caller (sole record:
  raid-unanswered, caller villageAgencyDaily), raid door disjoint
  from direct door (no shared day/name/spoilDay/units tuple).
- Section 3d: day-100 seed present PASS (day100 seeds: 20118);
  touched focal row FAIL (none); touched-row closure FAIL (none);
  without-adjustment identity PASS on focal rows (vacuous, 0 == 0
  — labeled vacuous in this evidence, not oversold).
- No jest was run (nothing to test in jest — the proof is node,
  not jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.

## Recorder fidelity (disclosed, never a GO override)

The judged trajectory is a SWEEP-INSTRUMENT trajectory: the sweep's
death wrapper suppresses the original Game.registerDeath, exactly as
the day99demand prereg proved. The plain-recorder divergence on
20118 (demandDays [], takeDays []) stands as a reported leg from
the day99demand run and is not re-litigated here; the faithful
TRACE_FULL replay reproduced the hit exactly, and this judged sweep
— same instrument class, same policy, same horizon — reproduces it
again (demand 99, take 100, same items, same kcal). Within-instrument
comparisons stay apples-to-apples. Whether to fix the sweep to call
through to the original registerDeath remains a coordinator/Steve
call and is NOT done here.

## The day-99 demand line and day-100 take line (quoted from the JUDGED corpus)

Demand, day 99 (raidSayLines + Codex, same day):
"🌙 Night. Shouts from the treeline — Andre of Thornfield with 4
others, and they're not here to talk. \"Your pantry or your blood.
Choose.\" (They want ~2,000 kcal.)"
"📓 Codex: Andre of Thornfield raids Haven's treeline — demands
~2,000 kcal."

Take, day 100 (raidRecord + take line, same day):
"🌙 You weren't at the treeline. Andre of Thornfield didn't wait
— they hit the stores and melted back into the dark with 1,000
kcal. The village will talk about this for a long time."
Ledger: day 100, caller villageAgencyDaily, asked 800, Canned soup
4u x 250 = 1,000, retMismatch false, stack via villageAgencyDaily
(villageAgency.js:203) through hierarchyDaily (villageAgency.js:1356)
— the take branch, exactly as day100raid-code proved.

Numbers-match check: the spoken "~2,000 kcal" is the ASK as spoken,
not the take — the take is the 800-ask / 1,000-take ledger shape
(the whole-unit overshoot on Canned soup), and the narration's
"1,000 kcal" matches the ledger's 1,000 exactly. The demand line's
~2,000 must not be mistaken for the adjustment amount (raid100 =
1,000, the recorded take).

## Reachability verdict (judged seed, competent-nofeast, 100d)

Waves 1-2 reached (waveReach [1, 2]); waves 3-5 on 0/1 seeds.
Regional, national, table, wins: 0/1. Rank stayed village. The
scale wall stands on this seed; this arm measures a ledger leg, it
does not move the wall numbers. Arc II/III/IV, four-realm
formation, trap acquisition by source, counter discovery/
counter-kill rate, and young-link succession survival are not
recorded in this corpus and are not estimated here.

## Wall numbers (single judged seed, competent-nofeast)

National / table / wins: 0/1. Wave-4/5 unlocks: 0/1. Wave reach:
wave 2 (max). Median survival 100d (n = 1). Deaths 2: ambush 1 (day
7), "the night" 1 (day 81) — the same two deaths as the screen
corpus, confirming the judged sweep reproduces the supplied seed's
trajectory, not just its raid.

## Village assessment (plain words)

One village, standing at day 100 with a pantry of 110,054 kcal at
the closing snapshot and just two deaths in a hundred days — an
ambush in the first week and "the night" on day 81 — and the food
story was never hunger: the village eats from deep, named stores
(Foraged food, Blackberry, Muscadine Grapes, the smoke racks
working — "Yesenia cooked for the haven — meals stretched. Yesenia
worked the smoke racks too — 1 batch preserved"), shares surplus
back into the stores (861 stockSurplus records, 344,600 kcal), and
loses people to violence and the dark, not to the pantry. On the
last night that matters, Andre of Thornfield comes to the treeline
with four others and a demand the village does not answer — and
the next day the raiders walk off with four units of canned soup,
1,000 kcal against a six-figure pantry: a tax, not a famine, but
one the ledger must now account for after the snapshot, or it
overstates what the village has by exactly that 1,000. What was
missing is now precise: not a day-100 raid — that exists — but a
day-100 raid that reaches a focal pantry item. The village's raid
took soup, and the ledger's focal rows never held soup. Blanks
filled: (1) the judged exercise record — the adjustment closes a
real row exactly with it and misses by exactly the raid amount
without it, on the current base, under the judging instrument;
(2) the clause-by-clause numbers that show why the focal
formulation says NO-GO while the substance says exercised.
Documented, not fixed: no game-code change was made (DIAG only);
the formulation question belongs to the next prereg, not to a
mid-run re-score.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The demand/take pair reads exactly like raiddor's, raidday100's,
and day99demand's, with numbers that ARE the ledger's numbers: a
named champion of a named village, an honest demand size, a
same-day Codex entry recording the demand, then the "didn't wait"
take line with the take's exact kcal, plus the "talk about this for
a long time" tail — a social consequence (opinion -5, journal
entry), not flavor. Nothing robotic, static, or repeated was found
beyond the mechanism's own honest whole-unit arithmetic (the
800-ask / 1,000-take shape on Canned soup). The one sense note that
matters for the next arm: the demand line's "~2,000 kcal" is the
spoken ask, and the ledger's asked field is 800 — the spoken
number, the asked field, and the take (1,000) are three different
numbers, and only the take (1,000) is the adjustment amount. Any
future arm that quotes "~2,000" as raid100 is wrong by 2x.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: clause (a) was re-verified on the judged sweep
  itself (not assumed from the screen), (b) and (f) fail on the
  judged numbers, (c) and (d) are labeled vacuous rather than
  passed, and no clause was re-scored. The proof's two failures
  are the (b) failure, faithfully reported — not instrument
  failures (every non-3d check passes, including the det-gate).
- What the metric proved wrong: the raidday100 GO's clause (b)
  presumes the day-100 take touches a focal pantry item. That
  presumption came from mixed takes (e.g. raidday100 seed 10105's
  Foraged food (dried) take), but the game on this seed takes
  Canned soup — a starting-stock item, not a focal family-seed —
  and the analyzer attributes raid draws strictly by item family.
  The focal formulation therefore cannot see the most ordinary
  take class. This was foreseeable from the day99demand screen
  corpus itself (its 20118 raiddor rows equal its boundary rows
  exactly), which means the verbatim adoption of (b) carried a
  known risk into this prereg — recorded here so the next arm
  does not repeat it, not as a criticism of the adoption (the
  brief required verbatim clauses, and verbatim judging is what
  makes this NO-GO trustworthy rather than convenient).
- Proposed revision for the NEXT run (not applied here): amend
  clause (b) to "the day-100 raid touches at least one
  analyzer family row" — the taken item's row counts, focal or
  not — with the closure bar for a touched row stated in absolute
  residuals when its boundary inflow is 0 (share undefined), and
  keep the focal legs as controls. Under that revision, this same
  judged corpus would be re-judged WITHOUT new seeds (the
  exercised row is already in the corpus; re-judgment under a new
  pre-registered prereg is legitimate as long as the old verdict
  stands for the old prereg). The alternative — screening for a
  mixed take that reaches a focal item — spends seeds to re-prove
  in substance what this corpus already proves, and is NOT
  recommended unless the coordinator wants a focal-row
  demonstration on its own terms.
- Instrument lesson: the proof's section 3d is a faithful
  instrument for the focal formulation — it failed exactly on the
  empty touched set and passed everything else, including the
  vacuous identity check (which the evidence labels vacuous rather
  than letting it read as a pass). A future proof under the
  revised (b) must show section 3d passing NON-vacuously (touched
  rows with raid100 > 0 closing within bar) — this run's Canned
  soup row is the template for what that looks like.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/
  after to panel, exactly as raidday100 and day99demand stated.
  The det-gate (instrument on vs off, byte-identical on non-raid
  fields) plus the with/without-adjustment recomputation is the
  instrument before/after. Not forced, not faked.
- Infrastructure notes (loud): (1) After the prereg commit
  1722f68e, the safe-commit index-clobber variant hit again
  (committed files staged-as-deleted in the main index) — repaired
  per the documented recipe (update-index --add --cacheinfo from
  HEAD blobs), verified git status clean + git diff HEAD empty +
  hash-object matches HEAD blobs, before any judged sweep. The
  commit itself was correct. (2) No EPERM write flap blocked this
  run's writes; the sweep's in-memory pending-flush path was never
  needed. (3) Per-seed sim compute 2,081 ms; the proof's two
  det-gate runs dominate the proof's wall time under sibling load.
  (4) All sim outputs live under
  evidence/2026-10-27/sim-raidday100-judge-b-corpus/, never /tmp;
  the analyzer and proof logs are committed alongside the evidence.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (1722f68e); the judged
  sweep, analyzer, and proof all ran after that commit, in that
  order. The judged corpus was committed after the proof, with the
  evidence file — the corpus was not edited after judging.
- Proof scripts/test-raidday100-judge-b.js on the judged corpus:
  PROOF FAILED with exactly 2 failures (section-3d touched-row
  checks), all other checks PASS (see "Proof detail" above). No
  jest was run (nothing to test in jest — the proof is node, not
  jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit 1722f68e (prereg + 5 vendored
  judge scripts) and the evidence commit (this file + judged
  corpus + analyzer log + proof log).
- Backlog: the sim-findings.md line for the post-snapshot
  adjustment item is left for the coordinator to mark — this arm's
  verdict is NO-GO under the focal formulation with the adjustment
  exercised in substance on a non-focal row; the coordinator should
  record it as "exercised on taken-item row (Canned soup, 20118),
  focal formulation NO-GO, metric revision proposed", not as
  fixed under the old formulation and not as still-unexercised.

## Convergence line

Not converged under the raidday100 focal formulation — but the
open work is now a metric revision, not a seed hunt: the adjustment
is exercised on the current base (Canned soup row: WITH 0,
WITHOUT +1,000, difference exactly raid100), the instrument is
proven sound (det-gate + independent recomputation + hygiene all
PASS), and the judged corpus already contains everything the
revised prereg would need. Until that re-judgment, the
post-snapshot raid adjustment stands as: implemented, exercised
in substance on a taken-item row, NO-GO as a focal-row leg.

## What the next arm should do (NO-GO path, pre-registered here as advice, not as a verdict change)

1. Write a new prereg amending clause (b) to the taken-item-row
   formulation (see "Metric review"), keeping (a) re-verification,
   the focal legs as controls, and the proof's section 3d — and
   judge the SAME judged corpus under it, with no new seeds. If
   that re-judgment goes GO, the backlog item closes on the revised
   formulation with this evidence attached.
2. Only if the coordinator wants a focal-row demonstration on its
   own terms: screen for a day-100 take that includes a focal item
   (e.g. Foraged food (dried) as on seed 10105) — a new seed spend
   with its own prereg, not a re-score of this one.
3. Do NOT re-judge this corpus under the old prereg expecting a
   different answer, and do NOT count the Canned soup row toward
   the old (b) retroactively — the old verdict stands.

## Verdict (judged against the pre-registered bar, not re-scored): NO-GO

Clause (a) re-verified on the judged sweep (daysAlive 100,
lastSnapDay 100, demand 99, take 100); clause (b) fails (zero focal
rows touched — the take is Canned soup only); clause (c) vacuous;
clause (d) vacuous on focal rows; clause (e) passes (named 0.000%,
generic 0.050%, dried 0.00%); clause (f) fails (proof: 2 failures,
both section-3d touched-row checks, everything else PASS). The
adjustment is exercised in substance on the Canned soup row (WITH
0, WITHOUT +1,000, difference exactly raid100 = 1,000) — reported
as the exercise record, never as a satisfaction of (b). The wall
stands unchanged on this seed (national/table/wins 0/1, waves 4-5
0/1, median survival 100d).
