# sim-fullseat-stage-a — TABLE full-seat stage audit (held claim from sim-sysbond-a)

Run: fleshout loop, run fleshout-20261028T0836Z. Axis: scale-onramp.
Worker: sim-fullseat-stage-a. Worktree: `~/workspace/worktrees/sim-fullseat-stage-a`.
AUDIT ARM ONLY: zero src/js change, zero gating change, zero behavior
change landed. No balanced panel (audit, no before/after behavior
comparison — same standing exception as the sysbond arm). No
[needs-eyes]: doc-only audit; no behavior fix proposed (see verdict rule).

Pre-registration: evidence/2026-10-28/sim-fullseat-stage-a-prereg.md
(written BEFORE any judged fixture, per MEASUREMENT §§9–12, 14–15).
Metric binding: the pre-registered audit GO is judged below; no metric
was re-scored mid-run.

## Verdict: GO (doc correction) — the DOC is wrong, the code is not

docs/TABLE.md's full-seat line said stage ≥ 3. The code's full seat
(`deedGateReady()`, src/js/progression.js) requires stage ≥ 2, and
the table.js seat comment says so too. A village at stage 2 with
every other full leg met sits at the FULL seat in fixtures and in
the pre-existing superset proof test. No code-wrong proof met the
pre-registered bar (see "Code-wrong test" below), so per the task
default the DOC is corrected to match the code. The correction is
confined to docs/TABLE.md's full-seat line: no other doc claim was
touched, and two other docs plus three in-code comments that repeat
the old ≥ 3 claim are reported below as a held follow-up, NOT
silently fixed and NOT claimed fixed.

## The gap, exactly

Doc claim (docs/TABLE.md, "The seat: full / lesser / none", before
this run):
> The 2026-10-10 deed gate (`deedGateReady()`) becomes the **full
> seat** — national/global scale, all wave bars (5/5/4/3/2 distinct
> fought), 3+ contests survived, 3+ crises, stage ≥ 3, food-thesis
> deeds.

Code path (src/js/progression.js, `deedGateReady()`, lines 613–652):
- waves 5/5/4/3/2 distinct fought, contests ≥ 3, crises ≥ 3,
  scale national/global (`scale` in `ok` since the Steve 2026-10-27
  scalegate ruling, commit 234d3a825), food-thesis deeds
  (sentimentTaught + feastSurgeUsed), and:
- `const stageOk = stage >= 2;` (line 651), with `stage` from
  `integrationStage()` (progression.js lines 132–137: 3 at
  integration ≥ 80, 2 at ≥ 40, 1 below, 0 before the System arrives).
- `ok` requires `stageOk` — so stage 2 satisfies the full seat and
  stage 1 does not. There is no `stage >= 3` comparison in the gate.

Seat path (src/js/table.js, `tableSeat()`, lines 73–110):
- The comment at lines 73–75 states the same bar: "deedGateReady()
  is the FULL seat (all wave bars 5/5/4/3/2, 3 contests, 3 crises,
  stage>=2, food-thesis deeds, national/global scale …)". The
  comment and the code AGREE; the doc disagreed with both.
- Full is checked FIRST (line 82: `deedGateReady()`); only if it
  fails does the lesser branch run (line 102: waves 4/4/3, 2+
  contests, 2+ crises, regional+ scale, stage ≥ 2, food deeds).
  Full and lesser therefore share the SAME stage bar (≥ 2) — the
  full seat is stricter on waves, contests, crises, and scale, but
  NOT on stage.

## Fixture proof (scripts/test-fullseat-stage-a.js, 22/22)

Full src/js list in index.html order via scripts/sim-harness.js
(seeded Math.random before eval; Game.save never stubbed). NO gate
function is stubbed anywhere: every seat answer is read out of the
REAL deedGateReady() + REAL tableSeat(), and every Relay answer
out of the REAL tableEarnedPaths() under a REAL lesser seat (the
lesser-legs state genuinely prices as 'lesser' — no tableSeat stub,
unlike the sysbond arm's prereq isolation, which this arm did not
need). Only narration (say) is silenced. Each cell asserts the
mapped integration stage before the seat is judged.

| legs met | stage (integration) | deedGateReady ok | stageOk | tableSeat |
|---|---|---|---|---|
| full | 0 (no system) | no | false | none |
| full | 1 (5) | no | false | none |
| full | 2 (45) | YES | true | FULL |
| full | 3 (85) | YES | true | FULL |
| full, no feast surge | 2 | no | — | not full |
| full, national off (rank village) | 2 | no (scale false) | — | none |
| full, contests 2 (not 3) | 2 | no | — | lesser |
| lesser | 2 | no (full bars unmet) | — | lesser |
| lesser | 1 | — | — | none |
| lesser | 3 | no (full bars unmet) | — | lesser |

Relay branches under a real lesser seat (PATH prereq, not a seat —
reported here only so the stage-3 figure is never misread as a
seat bar):
| seat | stage | office | relay earned | strength |
|---|---|---|---|---|
| lesser | 3 | no | YES | 40 |
| lesser | 2 | yes | YES | 25 |
| lesser | 2 | no | no | 0 |

Run: `node scripts/test-fullseat-stage-a.js` → 22 passed, 0 failed.
Corroboration, not re-judgment: the pre-existing
scripts/test-fullseat-superset-20261014.js (9/9 this run) already
asserts "stage 2 + food deeds + bars -> full", and
scripts/test-sysbond-a.js (14/14 this run) is untouched and green.

## Code-wrong test (pre-registered bar — NOT met)

Code-wrong required at least one of:
(i) A Steve ruling AFTER the code landed ordering a full-seat stage
bar different from the code. NOT FOUND: no Steve-attributed text
orders a stage bar for the full seat. The 2026-10-27 ruling in
docs/steve-call-decision-pack-20261024.md:645 orders NATIONAL
standing for the full seat; its implementing commit (234d3a825,
sim-scalegate-a) edited exactly deedGateReady()'s return line and
LEFT `stageOk = stage >= 2` untouched — the ≥ 2 bar was reviewed
under a Steve ruling touching the same function and kept. The
2026-10-14 superset audit comment in the same function
(progression.js lines 640–642) states the design explicitly: the
full seat "carries the lesser seat's integration-stage (>=2) …
a full seat must never be easier than the lesser one on those."
(ii) A second code path assuming the doc's ≥ 3 bar and breaking
under the code's ≥ 2 bar. NOT FOUND: the other `stage >= 3`
comparisons are unrelated gates, not seat assumptions —
game.js:11451 (havenStoresAccess remote pantry access at stage 3),
table-defiant.js:211 (de-integration step-down arithmetic:
stage 3 → 79, stage 2 → 39), table-relay.js:70 (the Relay PATH
prereq, not a seat — fixture-proven above). Arc III (checkArc)
uses stage ≥ 2; Arc IV uses the seat itself (seatNow full/lesser).
No downstream gate breaks at stage 2: a stage-2 full seat walks
the table through the same tableSeat/tableEarnedPaths path as a
stage-3 one, with indispensable (FULL only) open in both cases.
(iii) A corpus case where a stage-2 full seat produces a broken or
incoherent state attributable to the bar. NOT FOUND: the fixture's
stage-2 full seat prices, voices, and offers paths exactly as the
stage-3 one does; the only stage-3-specific behavior anywhere is
the Relay path's stronger standing (40 vs the full seat itself,
which has no stage-graded standing).
Therefore: DOC CORRECTION governs. No behavior fix is specified
as a landing item; the minimal code change, IF a future Steve
ruling reverses this verdict, would be: in progression.js
deedGateReady(), change `stageOk = stage >= 2` to `stage >= 3`
(and update the table.js seat comment, the superset test, and the
superset comment to match) — and re-measure, because it would
close the full seat to every stage-2 village that currently holds
it. That fix is SPECIFIED ONLY, not landed, per the task's
coordinator-approval requirement.

## Doc correction landed (this arm, docs only)

docs/TABLE.md, "The seat: full / lesser / none" — see the commit
diff. Exact corrected sentence:
> The 2026-10-10 deed gate (`deedGateReady()`) becomes the **full
> seat** — national/global scale, all wave bars (5/5/4/3/2 distinct
> fought), 3+ contests survived, 3+ crises, stage ≥ 2, food-thesis
> deeds (the full seat carries the lesser seat's stage ≥ 2 bar — a
> full seat is never easier than a lesser one on stage).

Nothing else in TABLE.md changed: the lesser-seat stage ≥ 2 line
(line 73) was already correct, and the Relay stage ≥ 3 / stage 2 +
office lines (lines 82, 246) are path prereqs, not seat bars, and
were already corrected by the sysbond arm.

## NOT corrected here (held follow-up for the coordinator — read this)

The old ≥ 3 claim for the deed gate survives in texts this arm was
forbidden to touch (other docs; src/js). They are reported, not
fixed, not claimed fixed:
- docs/PROGRESSION.md:20 — "`deedGateReady()`: … stage ≥ 3."
- docs/MONSTER-WAVES.md:354 — "sentimentTaught + feastSurgeUsed +
  stage >= 3" for the deed gate.
- src/js/progression.js:27 (ontology header: "stage>=3 kept"),
  lines 581–582 (deedState comment: "stage >= 3 (earned standing)"),
  lines 682–683 (checkArc comment: "stage>=3 stays (earned
  standing)") — in-code comments, and src/js is out of bounds for
  this arm, so these need a follow-up arm with code-comment scope,
  not a silent edit here.
A follow-up that corrects only TABLE.md and leaves these would
re-create this exact discrepancy in the next audit; the
coordinator should queue that follow-up rather than treating this
arm as closing the claim everywhere.

## What was NOT done (scope guard)

- No src/js edit, no gating/deed-bar edit, no policy default
  flipped, no sibling worktree touched (sim-calmbeast-b /
  sim-wave4flip-b untouched), no claim/lock file written or
  deleted, no push, no version bump, no live check, no balanced
  panel (standing audit exception, stated in prereg).
- Sysbond was NOT re-judged: its Relay-door findings are cited
  only as the already-landed correction and as the branch
  distinction (Relay stage ≥ 3 is a path prereq, never a seat bar).

## Metric review

Pre-registered audit GO judged as stated: (Q1–Q6) all six audit
questions answered against code + fixtures — DONE; (F1–F4) fixture
bar met — 22/22, real gates, real seats, stage construction
asserted per cell — DONE; gap closed in docs — DONE (TABLE.md
full-seat line corrected; the surviving repeats are named above
as a held follow-up, not hidden); zero behavior change landed —
DONE. No metric proved wrong; no revision proposed for the next
run. This is an audit arm with no sim band, so NO wall numbers
(national / table / wins, wave 4–5 unlocks, median survival) are
claimed from it, and nothing here is pooled with any other arm's
band. The one judgment call — doc-corrects vs code-fix — followed
the pre-registered rule (code-wrong needs proof, not suspicion)
and the proof bar was not met on any of its three prongs.
