# sim-raidday100-general-b — judged analyzer run on seed 20118 under the GENERALIZED (focal-or-taken) GO

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-general-b.
Backlog line 1224 (food-economy/ledger): POST-SNAPSHOT RAID ADJUSTMENT
UNEXERCISED under the focal formulation.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, the day99demand GO, or the raidday100-judge-b NO-GO — their
verdicts stand in their own evidence. Its verdict is ONLY whether the
raiddor post-snapshot raid adjustment is EXERCISED by seed 20118 under
the GENERALIZED clauses of
evidence/2026-10-27/sim-raidday100-general-b-prereg.md (committed as
ea6897680 BEFORE any judged sweep — the fresh judged sweep, analyzer,
row trace, TRACE_FULL replay, and proof all ran after that commit, in
that order). The 1330Z judge-b judged corpus was NOT re-scored against
the new wording: this verdict rests entirely on the FRESH post-prereg
judged sweep below.

## Verdict against the pre-registered GO: GO

GO required ALL of (a)-(f) under the generalized wording. Every clause
passes on the fresh judged sweep, and the proof is GREEN with its
section 3d passing NON-vacuously (one touched row, closing exactly):

- (a) PASS (re-verified, not assumed): the fresh post-prereg judged
  sweep of 20118 itself shows daysAlive == 100, endReason survived,
  lastSnapDay == 100, a demand dated 99, and a take dated 100. The
  fresh corpus matches the judge-b judged corpus on every field except
  the raid record's stackTop path (worktree path + capture line number
  — expected, the capture file lives under the new general name) and
  `ms` and mode. Counts identical: inflowSeen 257, mealDrawRecords
  1,336, deaths 2, driedEvents 120, stockdoorRecords 861,
  directRecords 235, raidRecords 1.
- (b) PASS (generalized): the day-100 raid touches exactly one
  focal-or-taken family row — Canned soup, the taken-item row,
  raid100 = 1,000. No focal row is touched (raid100 = 0 on both counted
  focal rows), and that is no longer a failure under this prereg: the
  taken row counts. Honest reading, as the prereg fixed it: (b) here
  is satisfied by the taken row itself — the discriminating work is
  in (c) and (d), and both pass exactly, so this (b) pass is carried
  by exact numbers, not by wording alone.
- (c) PASS (non-vacuous on the touched set): the one touched row,
  Canned soup (taken, boundary inflow 0, share undefined), closes
  EXACTLY with the adjustment: rBResidual = 0. No focal-counted row
  is touched, so no 1% share check applies on this seed — stated
  plainly, not hidden: (c) passes via the taken row's exact-0 rule,
  and the focal 1% rule has no touched row to judge here.
- (d) PASS (non-vacuous): WITHOUT the adjustment the touched row is
  off by exactly the day-100 raid amount: noAdj residual +1,000,
  WITH residual 0, difference 1,000 = raid100 (total channel); dried
  difference 0 = raid100D. The leg was exercised, not vacuous.
- (e) PASS (focal control, unchanged): pooled focal channels close
  WITH the adjustment under the raiddor bars where counted rows
  exist: named pooled 0 / 15,660 = 0.000% (<= 1%, 1 named row counted),
  generic pooled -191 / 382,626 = 0.050% (<= 1%, 1 generic row
  counted), dried pooled 0 / 132,518 = 0.00% (<= 2%). The taken row
  is NOT pooled into the focal pools (not focal, inflow 0) — (e)
  passes on focal numbers alone.
- (f) PASS: the proof (scripts/test-raidday100-general-b.js) is GREEN
  on the fresh judged corpus: 40 PASS lines, 0 FAIL lines, including
  the det-gate and the generalized section 3d (see "Proof detail").

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: day-100 raid exercise on seed 20118 under the
  generalized clauses — the fresh judged sweep's day-100 raid
  touching a focal-or-taken row, that row closing with the
  adjustment (focal-counted within 1%, taken rows below the filter
  exactly 0), and off by exactly the raid amount without it.
- GO threshold: verbatim from the general prereg (see "Verdict" above
  and the prereg for the full text, including the honest-reading note
  on (b), the vacuity rules, and the verdict vocabulary).
- Horizon + why: 100 days, death-aware — the horizon the boundary
  question lives on. Seed 20118 survived the full horizon
  (daysAlive 100, endReason survived).
- Seeds: 20118 ONLY, FRESH post-prereg judged sweep. No screen, no
  confirm band: one exercised leg on one supplied seed. The judge-b
  judged corpus was not re-scored.
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
- Base: NO pin. Worktree HEAD at prereg time 60e260dc0, unchanged
  through the fresh judged sweep except this arm's own prereg commit
  ea6897680 (no sibling commit between prereg and judging; verified
  by git log at evidence time). Zero src/js files modified.

## Closing-snapshot day + the adjustment (as pre-registered)

Closing-snapshot day = lastSnapDay = 100 on this seed (last spoilDays
snapshot day 100, freshKcal 110,054, taken during the day-100
policy.daily before that day's sleep/endDay). The day-100 take is
dated == lastSnapDay, so raid100 = 1,000 (total), raid100D = 0 (the
take is all Canned soup, foodState null, no dried item). The
adjustment: rBClosing = bClosing - raid100, rBClosingDried =
bClosingDried - raid100D, per family.

## Per-row table (fresh judged corpus, analyzer raid-door legs + proof section 3d)

Counted focal iff boundary inflow >= 10000. rBResidual = residual WITH
the post-snapshot adjustment; noAdj = residual WITHOUT it (raid draws
still counted, closing unsubtracted). Taken rows are GO inputs under
this prereg; focal rows are GO inputs under (e) and, when touched,
under (c)/(d).

| Family row | Kind | Boundary inflow | raid100 | raid100D | rBResidual (WITH) | rB share | noAdj residual | noAdj - with | Touched? |
|---|---|---|---|---|---|---|---|---|---|
| Canned soup (taken item) | taken | 0 | 1,000 | 0 | 0 (exact) | n/a (inflow 0) | +1,000 | 1,000 = raid100 | YES |
| Muscadine Grapes (named) | focal-counted | 15,660 | 0 | 0 | 0 | 0.00% | 0 | 0 | NO |
| Foraged food (generic) | focal-counted | 382,626 | 0 | 0 | -191 | 0.050% | -191 | 0 | NO |
| Lamb's Quarters (named) | focal, no row | — (no row) | — | — | — | — | — | — | NO |
| Burdock (named) | focal, no row | — (no row) | — | — | — | — | — | — | NO |
| Purslane (named) | focal, no row | — (no row) | — | — | — | — | — | — | NO |

Pooled (clause (e), focal only): named 0 / 15,660 = 0.000%; generic
-191 / 382,626 = 0.050%; dried 0 / 132,518 = 0.00%. All under the
raiddor bars (1% / 1% / 2%).

## Before/after numbers (WITHOUT vs WITH the adjustment)

The before/after here is the adjustment itself, on identical seeds
(the same fresh judged corpus, recomputed both ways — the
instrument before/after, since no lever or game code changed):

- Touched row, Canned soup: WITHOUT +1,000 (overstates the pantry by
  exactly the raid); WITH 0 (exact). Difference exactly raid100.
- Dried channel, Canned soup: WITHOUT 0, WITH 0, difference 0 =
  raid100D.
- Focal rows: WITHOUT == WITH on both counted rows (Muscadine 0, 0;
  Foraged food -191, -191) — the adjustment moves nothing on focal
  rows on this seed, because the take never touches them. That is
  expected, not a weakness: the adjustment's case on this seed IS the
  taken row.
- Pooled focal channels WITH: named 0.000%, generic 0.050%, dried
  0.00% (see table). WITHOUT the adjustment the pooled focal figures
  are identical on this seed (raid100 = 0 on focal rows), so (e)
  cannot distinguish the adjustment here — again expected: (e) is
  the focal control, and the exercise proof lives in (c)/(d) on the
  taken row.

## Corroboration (trace, on the fresh corpus, family "Canned soup")

scripts/trace-raidday100-general-b.js on the fresh corpus: opening
7,500, closing 7,500, within-horizon cumulative divergence 1,000,
post-horizon net 0, analyzer-style newResidual 1,000, identity
(cumDiv - postNet == analyzerCheck) true. The persistent divergence
starts at transition #100 (days 99 -> 100], stepDiv 1,000 — the window
shows the raid-unanswered draw (Canned soup 4u x 250 = -1,000, day 100,
asked 800) against a snapshot actual of 0. The snapshot does not
reflect the post-snapshot take; the boundary closing must subtract it.
That is the adjustment's case, shown independently of the analyzer's
legs and of the proof's recomputation — three code paths, one number.

## Instrument (vendored under NEW raidday100-general names, zero sibling modifications)

- scripts/sweep-raidday100-general-b.js (fresh judged sweep; seed
  20118, 2,081 ms compute, file
  raidday100-general-b-competent-nofeast-s20118.json written).
- scripts/analyze-raidday100-general-b.js (log:
  evidence/2026-10-27/sim-raidday100-general-b-analyzer.log).
- scripts/test-raidday100-general-b.js (proof; log:
  evidence/2026-10-27/sim-raidday100-general-b-proof.log).
- scripts/trace-raidday100-general-b.js (row trace above).
- scripts/stockdoors-capture-raidday100-general.js (internal raid
  field names raidRecords/raiddorOn and the RAIDDOORS env name
  retained for analyzer compatibility).
- scripts/trace-day100raid-code-b.js (UNMODIFIED sibling file) for the
  TRACE_FULL fidelity replay only (see below).
- NEVER modified: any sibling capture file (inflow/mealdraw/
  spoilvol/driedpath/stockdoor-capture, ledgerbound, raiddor,
  raidday100, day99demand, raidday100-judge-b files) or any src/js
  file. Proof hygiene confirms: zero src/js modified, zero sibling
  files modified, no modified tracked file outside this run's own
  files.
- Analyzer verdict strings are NOT this arm's verdict: the
  analyzer's "RAID-DOOR VERDICT: NO-GO" and "VERDICT (legs 2-5):
  NO-GO" are driven by leg 2 (coverage 1/1 vs the >= 7-seed bar),
  which the prereg states is NOT applicable to a 1-seed corpus and
  NOT part of this arm's GO. The raid-door legs themselves
  (leg3r/leg4r/leg5r) all PASS. The OLD-definition legs are controls
  only: OLD named leg 3 FAILs (resid 1,800, 11.49%) under the OLD
  pantryDraw-only definition, exactly as on the judge-b corpus —
  not a judged leg.

## Proof detail (what passed — everything — and the det-gate)

- Corpus validity PASS (1 fresh judged file; policy competent-nofeast;
  stockdoorsOn + raiddorOn true; no truncation; all 7 direct methods
  wrapped, none missing; raid fields present).
- Det-gate PASS (clause (f)'s det-gate leg, the instrument leg):
  instrument on (RAIDDOORS=1) vs off (RAIDDOORS=0) byte-identical
  on non-raid fields; inflow, mealdraw, spoilvol, driedpath, and
  death lists identical; wall fields identical; the on-run
  reproduces the fresh judged corpus counts exactly (257 / 1,336 /
  2 / 120); the on-run records raid=1, the off-run raid=0. The
  instrument does not move the trajectory except through the raid
  fields it exists to record.
- Independent recomputation PASS on all nine pooled figures (old,
  boundary, and raiddor named/generic/dried) — a second code path
  reproduces the analyzer exactly.
- Section 3d (generalized) PASS, non-vacuously: day-100 seed present
  (day100 seeds: 20118); touched focal-or-taken row present (20118
  Canned soup (taken) raid100=1,000); touched rows close WITH the
  adjustment (Canned soup (taken) withResid=0, exact-0 rule); WITHOUT
  identity exact (noAdj=1,000, with=0, raid100=1,000; dried noAdjD=0,
  withD=0, raid100D=0). This is the section that failed twice on the
  judge-b corpus — it passes here because the touched set now
  includes the taken row, and the row's numbers are exact.
- Raid integrity PASS (item sums equal returned kcal, retMismatch
  0), no unknown raid path or wrong caller (sole record:
  raid-unanswered, caller villageAgencyDaily), raid door disjoint
  from direct door (no shared day/name/spoilDay/units tuple).
- Hygiene PASS (see Instrument). Total: 40 PASS, 0 FAIL, PROOF GREEN.
- No jest was run (nothing to test in jest — the proof is node,
  not jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.

## Recorder fidelity (disclosed, never a GO override)

The fresh judged trajectory is a SWEEP-INSTRUMENT trajectory: the
sweep's death wrapper suppresses the original Game.registerDeath,
exactly as the day99demand prereg proved. The plain-recorder
divergence on 20118 (demandDays [], takeDays []) stands as a reported
leg from the day99demand run and is not re-litigated here; the plain
recorder was NOT run as a GO input on this arm. The fidelity anchor
is the faithful TRACE_FULL replay, re-run on this arm (unmodified
sibling script, TRACE_FULL=1, competent-nofeast env; log:
evidence/2026-10-27/sim-raidday100-general-b-tracefull-20118.json):
demandDays [99], takeDays [100], day-100 VAD call takeFired true,
takeFiredCalls [{day 100, pendingBefore 99}]. The hit reproduces
exactly under faithful sweep replication, and the fresh judged sweep
— same instrument class, same policy, same horizon — reproduces it
again (demand 99, take 100, same items, same kcal). Within-instrument
comparisons stay apples-to-apples. Whether to fix the sweep to call
through to the original registerDeath remains a coordinator/Steve
call and is NOT done here.

## The day-99 demand line and day-100 take line (quoted from the FRESH judged corpus)

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

## Reachability verdict (fresh judged seed, competent-nofeast, 100d)

Waves 1-2 reached (waveReach [1, 2]); waves 3-5 on 0/1 seeds.
Regional, national, table, wins: 0/1. Rank stayed village. The
scale wall stands on this seed; this arm measures a ledger leg, it
does not move the wall numbers. Arc II/III/IV, four-realm
formation, trap acquisition by source, counter discovery/
counter-kill rate, and young-link succession survival are not
recorded in this corpus and are not estimated here.

## Wall numbers (single fresh judged seed, competent-nofeast)

National / table / wins: 0/1. Wave-4/5 unlocks: 0/1. Wave reach:
wave 2 (max). Median survival 100d (n = 1). Deaths 2: ambush 1 (day
7), "the night" 1 (day 81) — the same two deaths as the judge-b
corpus, confirming the fresh sweep reproduces the supplied seed's
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
one the ledger now accounts for after the snapshot, or it
overstates what the village has by exactly that 1,000. What was
missing is now closed on the generalized wording: not a day-100
raid — that existed — and not a focal-row take — that never
happened on this seed — but a day-100 raid whose taken row closes
exactly once the post-snapshot subtraction is applied. Blanks
filled: (1) the generalized GO — the adjustment closes a real row
exactly with it and misses by exactly the raid amount without it,
on a fresh post-prereg sweep, under a proof that passes
non-vacuously; (2) the clause-by-clause numbers that show why the
focal formulation said NO-GO while the generalized formulation says
GO on the same substance. Documented, not fixed: no game-code change
was made (DIAG only); the formulation question is now answered for
this seed, and any wish for a focal-row demonstration on its own
terms is a separate future arm, not a gap in this verdict.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The demand/take pair reads exactly like raiddor's, raidday100's,
day99demand's, and judge-b's, with numbers that ARE the ledger's
numbers: a named champion of a named village, an honest demand
size, a same-day Codex entry recording the demand, then the
"didn't wait" take line with the take's exact kcal, plus the "talk
about this for a long time" tail — a social consequence (opinion
-5, journal entry), not flavor. Nothing robotic, static, or
repeated was found beyond the mechanism's own honest whole-unit
arithmetic (the 800-ask / 1,000-take shape on Canned soup). The one
sense note that stands, carried from the earlier arms unchanged:
the demand line's "~2,000 kcal" is the spoken ask, the ledger's
asked field is 800, and the take is 1,000 — three different numbers,
and only the take (1,000) is the adjustment amount. Any future arm
that quotes "~2,000" as raid100 is wrong by 2x.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: clause (a) was re-verified on the fresh judged
  sweep itself (not assumed from the screen, not borrowed from the
  judge-b corpus), (b)-(e) pass on the fresh numbers, (f) is green
  with section 3d passing non-vacuously, and no clause was
  re-scored. The proof's section 3d is a faithful instrument for
  the generalized formulation — it failed twice on the focal
  formulation and passes here on the exact numbers, which is what
  a reworded instrument should do when the substance is real.
- What the metric proved, honestly stated: the generalization
  moves the burden from "which row" to "does the row close
  exactly" — and on this seed the answer to the second question
  is exact (0 vs +1,000). But the honest limit travels with the
  verdict: (b) under the new wording is satisfied by the taken row
  itself whenever a take is recorded and mapped, so (b) alone no
  longer discriminates; the discrimination lives entirely in (c)'s
  exact-0 rule and (d)'s exact identity. A reader who quotes "(b)
  PASS" without the (c)/(d) numbers beside it is overselling the
  verdict, and this evidence refuses that reading by printing the
  numbers in the same breath. The focal 1% rule had no touched row
  to judge on this seed — the focal-row demonstration on its own
  terms remains unshown, and this GO does not claim it.
- Proposed revision for the NEXT run (not applied here): none
  needed to close backlog line 1224 — this GO closes it under the
  generalized formulation (see "Backlog notes"). If the coordinator
  wants the focal-row demonstration on its own terms, that is a NEW
  arm with its own prereg (screen for a day-100 take that includes
  a focal item, e.g. Foraged food (dried) as on seed 10105), not a
  revision of this verdict and not a re-score of this corpus.
  Alternatively, a future formulation could strengthen (b) to
  require the touched set to include a row whose boundary inflow is
  > 0 — that would FAIL this corpus (Canned soup inflow 0) and is
  NOT recommended: it would re-impose the focal presumption through
  the back door, against the substance this run proved.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/
  after to panel, exactly as raidday100, day99demand, and judge-b
  stated. The det-gate (instrument on vs off, byte-identical on
  non-raid fields) plus the with/without-adjustment recomputation
  is the instrument before/after. Not forced, not faked.
- Infrastructure notes (loud): (1) After the prereg commit
  ea6897680, the safe-commit index-clobber variant hit again
  (committed files staged-as-deleted in the main index) — repaired
  per the documented recipe (update-index --add --cacheinfo from
  HEAD blobs), verified git status clean + git diff HEAD empty +
  hash-object matches HEAD blobs, before any judged sweep. The
  commit itself was correct. (2) No EPERM write flap blocked this
  run's writes; the sweep's in-memory pending-flush path was never
  needed. (3) Per-seed sim compute 2,081 ms; the proof's two
  det-gate runs dominate the proof's wall time under sibling load.
  (4) All sim outputs live under
  evidence/2026-10-27/sim-raidday100-general-b-corpus/, never /tmp;
  the analyzer, proof, and TRACE_FULL logs are committed alongside
  the evidence.

## Backlog notes (evidence notes ONLY — this arm does not edit goal hidden_files)

- Backlog line 1224 (post-snapshot raid adjustment): CLOSED under
  the generalized formulation by this GO — adjustment exercised on
  the taken-item row (Canned soup, seed 20118, fresh judged sweep),
  proof green non-vacuously. The coordinator should record it as
  "exercised on taken-item row (Canned soup, 20118), generalized
  formulation GO", with the judge-b NO-GO standing for the old focal
  formulation. NOT recorded as "fixed" under the old formulation,
  and NOT recorded as still-unexercised.
- No NEW out-of-scope gaps surfaced on this run: the sense note
  (spoken ~2,000 vs asked 800 vs take 1,000) is carried from the
  earlier arms, not new, and the focal-row demonstration remains an
  optional future arm (see "Metric review"), not a gap found here.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (ea6897680); the fresh
  judged sweep, analyzer, row trace, TRACE_FULL replay, and proof
  all ran after that commit, in that order. The fresh judged corpus
  was committed after the proof, with the evidence file — the
  corpus was not edited after judging.
- Proof scripts/test-raidday100-general-b.js on the fresh judged
  corpus: PROOF GREEN, 40 PASS lines, 0 FAIL lines. No jest was run
  (nothing to test in jest — the proof is node, not jest). No
  [needs-eyes]: this lands a measurement, not a player-visible
  change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit ea6897680 (prereg + 5 vendored
  general scripts) and the evidence commit (this file + fresh
  judged corpus + analyzer log + proof log + TRACE_FULL log).
- The judge-b judged corpus was not opened for scoring on this
  run; its numbers are cited only as the motivation for the new
  prereg, never as GO inputs.

## Convergence line

Converged under the generalized formulation: the post-snapshot raid
adjustment is exercised on the current base (Canned soup row: WITH
0, WITHOUT +1,000, difference exactly raid100 = 1,000, dried
difference exactly raid100D = 0), the instrument is proven sound
(det-gate + independent recomputation + hygiene all PASS, proof
green non-vacuously), and the fresh judged corpus contains
everything the verdict needs. The focal formulation's NO-GO stands
as history; the open work on this item is now only the optional
focal-row demonstration, if the coordinator wants it on its own
terms.

## Verdict (judged against the pre-registered bar, not re-scored): GO

Clause (a) re-verified on the fresh judged sweep (daysAlive 100,
lastSnapDay 100, demand 99, take 100); clause (b) passes
(generalized — taken row Canned soup touched, raid100 = 1,000);
clause (c) passes (taken row closes exactly, withResid = 0; no
focal row touched, so no 1% check applies); clause (d) passes
(without +1,000 vs with 0, difference exactly raid100; dried 0 =
raid100D); clause (e) passes (named 0.000%, generic 0.050%, dried
0.00%); clause (f) passes (proof GREEN, 40 PASS, 0 FAIL, det-gate
included). The wall stands unchanged on this seed
(national/table/wins 0/1, waves 4-5 0/1, median survival 100d).
