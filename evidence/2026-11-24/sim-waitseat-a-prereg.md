# sim-waitseat-a — PRE-REGISTRATION (FROZEN 2026-11-24T12:31:00Z)

Run: fleshout-20261124T1215Z (Loop A). Axis: scale-onramp. Tracker blank #5.
Worker: sim-waitseat-a. Worktree: ~/workspace/worktrees/sim-waitseat-a.
Base: master c329b477d. Zero src/js — policy-side measurement only.

## Canon read first

- docs/CANON.md, docs/TABLE.md. Seat contract: full seat keeps the national
  bar; lesser seat priced without national; seat taken from Haven via
  tableTakeSeat; table sanctity suspends ambient monster pressure while it
  sits. No canon invented: both policies wrap leanlinkrescue.daily verbatim
  and copy the seat/wait legs from scripts/test-tablesit-sweep.js.

## Question

Does the WAIT leg matter on a band where the seat stays unready longer?
The 1955Z round (evidence/2026-10-24/sim-tableseat-round-1955.md) found
seat-only replicates seat+wait EXACTLY on band 73601–73608 (entered 3 vs 3,
wins 3 vs 3, medians 161 vs 161, starvation 5 vs 5; the one wait-stranded
day cost a day with no verdict change). Whether waiting matters where the
seat is not ready for longer is untested — this run tests exactly that.

## Arms (difference verified BEFORE sweeping)

- **wait**: scripts/policies/tableseat.js, TABLESEAT=1 — leanlinkrescue
  courtship + seat leg + wait leg (while tableWaiting + national+ +
  !tableDone, end the day at Haven (4,4)).
- **nowait (control)**: scripts/policies/tableseat-nowait.js,
  TABLESEATNOWAIT=1 — same courtship + seat leg only, wait leg omitted.
- **baseline (substrate check)**: leanlinkrescue-only, LEANLINKRESCUE=1,
  neither gate set — confirms the courtship substrate reaches national on
  this band at all (contact check, MEASUREMENT §14b).
- Verification (2026-11-24T12:31Z, node extraction diff): tsDriveSeat and
  tsAnswerTableChoices are BYTE-IDENTICAL between the two policy files;
  both wrap leanlinkrescue.daily; the only behavioral difference is the
  wait-leg block in tableseat.daily (walkTo(4,4) while tableWaiting).
  `tsWaitDays` appears in tableseat only. The legs differ ONLY by the wait.

## Seeds — DECLARED REPLAY

Band **107383–107390** (8 seeds). This is a REPLAY, not a fresh band:
named in the sim-launchfield-refreeze-b prereg (2026-11-22, competent
substrate, fresh then) and re-judged by sim-launchfield-rejudge-b.
Same seeds, NEW question and NEW substrate: this run judges the wait leg
under the leanlinkrescue courtship substrate, which actually reaches
national (competent never did). Prior competent-substrate numbers on this
band (winnability-round-1530): wins 0/8; national by scaleRank 0/8,
national by standing ≥200: 2/8; table 0/8; wave-4 8/8; wave-5 2/8;
median survival 135.5d; starvation deaths 3. The band is chosen BECAUSE
competent stalls here — the seat stays unready longer under a weaker
climb, which is the blank's premise; the leanlinkrescue substrate is what
lets the seat legs fire at all.

## Horizon

180 loop-days, death-aware (runDays breaks on Game.over; +10d tail max).
Justification (MEASUREMENT §10, reachability lever 150–200d): the 1955Z
seats landed on days 129/142/161, so 180d contains the phenomenon with
headroom; identical to 1955Z so the two bands are comparable.

## Primary metric (binding)

Lesser-seat entries + wins, as the DELTA between the two seat arms:
entered(wait) − entered(nowait) and won(wait) − won(nowait).
GO requires the wait leg to CHANGE entered or wins by ≥2 seeds in the
wait arm's favour:
  (entered_wait − entered_nowait ≥ 2) OR (won_wait − won_nowait ≥ 2)
AND the deciding cost bar passes (below).
Else NO-GO — a clean kill (wait adds nothing) is a result, not a failure.
If wait is WORSE by ≥2 seeds on entered or wins, that is NO-GO with a
wait-harmful note, never re-scored as GO.

## Deciding cost bar (from sim-scalemetric, binding — control = nowait arm)

All three must pass WITH the primary or the arm is NO-GO:
1. starvation deaths (wait) ≤ starvation deaths (nowait) + 2;
2. arm-only starvation (wait-arm starvation deaths on seeds where the
   paired nowait row had none) ≤ 2;
3. median days (wait) ≥ 0.8 × median days (nowait).
Starvation = a death whose cause matches /starv|hunger|famine/i; the full
by-cause table is carried per row so the bar is auditable.
Secondary (reported, not judged): table invited ever, national
final/ever, wave 4/5 reach, max arc, death-cause shares, seat
attempts/taken/kind/day, wait days/returns/stranded, previews
seen/not-ready, median/max survival, invitation-to-seat latency.

## Proof gates

- G1 det-gates (both policies, seed 107383): gate unset → days/gameDays
  identical to leanlinkrescue-only, no ts counters on the armed side.
- G2 pre-national read-only: for every seed where NO arm ever reached
  national, days and gameDays identical across all three arms.
- G3 corpus integrity: 24/24 rows (8 seeds × 3 arms), days > 0, ts +
  court counter objects present on every row.
- G1/G2/G3 failures exit 1; the sweep reports the verdict, the evidence
  file judges it.

## Verdict scope

PILOT-ONLY verdict on this replay band (8 seeds). A confirm needs a
second FRESH band — decided here in advance: no confirm spend in this
run regardless of outcome; a GO here is a pilot GO, not a publishable
measurement (MEASUREMENT §9 stage 2).

## Landing rule

Measurement-only run. Both policies already landed as default-OFF
instruments by the 1955Z GO; this run lands NO new policy, flips NO
default, deletes NOTHING on NO-GO. It lands only the instrument
(scripts/test-waitseat-sweep.js), the corpus, and the evidence. Any
landing decision from a GO is the coordinator's, not this worker's.

## Balanced panel (§15)

Attempt `node scripts/balance-panel.js compare` on the corpus; attach the
compare .md if the panel ingests it, else record exactly why not +
sweep-compare tables. (Prior arms: the panel compare does NOT ingest
per-seed sweep rows — it wants panel-driver output; if that repeats, the
paired sweep-compare tables are this run's before/after comparison.)

## Sense-testing law

One NON-MEASURED narration-on replay of a seated run WITH the wait and
one WITHOUT (seeds chosen from whichever seats on this band, if any) —
judge meaning/coherence/consequences, never numbers. If no seat fires on
this band, record that and read the longest tableWaiting stretch instead.

## Instrument

scripts/test-waitseat-sweep.js (new; three arms in one process, adapted
from the proven scripts/test-tableseat-sweep.js): modes sweep /
--detgate / --sense. Per-config INCREMENTAL corpus writes to
evidence/2026-11-24/perseed-waitseat-a/ (direct write + writer-subprocess
fallback + read-back verification). Aggregate:
evidence/2026-11-24/sim-waitseat-a-sweep.json. 24 configs total
(8 seeds × baseline/wait/nowait).

## Metric review (placeholder — filled after the sweep)

- (to be written in the evidence file; pre-registered metrics bind this
  run, no mid-run re-scoring.)

FROZEN: 2026-11-24T12:31:00Z. No sims run before this file was written.
