# sim-scale-onramp-round-1816 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1816Z. Loop A (oversight-flesh-out-loop). No lock at
start, no live claims — the 1715Z run had closed cleanly (claim + lock
deleted). Sibling eggroad-a tree still registered with a 15:59Z heartbeat
(stale, but owned by a sibling run — NOT touched); sibling loop B trees
live throughout (stockdoor-b / throttledays-b appeared mid-run — NOT
touched). Pre-flight: main tree clean, disk 25%, reaper removed nothing
(all 6 active trees registry-owned/dirty-owned).

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; standing directive holds).
- Arms: sim-wave5gate-a (wave-5 binding gate) + sim-tableline-a (canned
  fireside table line census). Both DIAG/measurement only, zero src/js.
- Band: seeds 73671–73678, same policy/horizon as the 1715Z band
  (death-aware horizon; see arm evidence headers for the exact policy).
- Judge: each arm against its own pre-registered header (see arm files).
  Balanced panel not applicable (no before/after game change); paired
  identical-seed tables vs the 1715Z table are the comparison of record.

## Arm 1 — sim-wave5gate-a (commit eed74316c after rebase; proof 76/0)

DIAG-NO-GO on the pre-registered single-gate bar (one gate class alone on
≥6/8 seeds). The split IS the finding:

| seed | outcome | binding gate |
|---|---|---|
| 73671 | 180d survived, w4 | SINGLE STANDING-RAW (152) |
| 73672 | 180d survived, w4 | SINGLE STANDING-RAW (195, capped 175) |
| 73673 | 117d lost, w4 | SINGLE STANDING-RAW (127) |
| 73674 | 166d lost, w4 | SINGLE STANDING-RAW (147) |
| 73675 | 180d survived, w4 | SINGLE READINESS-DEF5 (armor+veterans short) |
| 73676 | 144d won (lesser), w4 | SINGLE READINESS-DEF5 (veterans only) |
| 73677 | 140d won (lesser), w3 | COMPOUND RAW + DEF4 |
| 73678 | 104d lost, w3 | COMPOUND RAW + DEF4 |

Distribution: RAW 4 / DEF5 2 / compound 2. No seed ever reaches gated
standing 200 on any day; the wave-3 rung never fails; the plenty cap never
binds alone; FACED4 never independently blocks (the six wave-4 villages
all face wave 4; the two others never unlock it).

The finding inside the finding: the veterans channel is empty band-wide.
Wave-4 monsters are faced on 6/8 seeds but killed on 0/8, so the wave-5
readiness veterans bar (2 living wave-4+ killers) peaks at 0 on every seed.
The DEF5 villages cannot clear it by standing taller or gearing harder;
they need a first wave-4 kill no seed produces.

Re-baseline reproduction: EXACT — 8/8 seeds identical to the 1715Z table
on all 17 compared fields. Base delta vs the tablenat base is only the
batch-ship BUILD_VERSION stamp (zero engine delta).

Secondary (reported, not judged): the full seat is unreached on all 8
seeds, and its universal blocker is wave-5 faced = 0 — 73672 fails ONLY
that bar (waves 1–4, contests, crises, stage, food all clear). Contests,
crises, and stage never block the full seat on this band.

Instrument defects found and fixed before judging (disclosed in the arm
metric review; the bar never changed): (1) the first gate sweep
snapshotted table flags only after the seat leg ran, missing the sitting
day's invitation on won seeds — fixed with a pre-base snapshot and a full
re-run; (2) the first analyzer used an elif chain that masked a co-present
DEF4 hold and first read DIAG-GO (RAW 6) — corrected to evaluate each gate
class by its pre-registered definition, moving the verdict to DIAG-NO-GO.

## Arm 2 — sim-tableline-a (commit 1fcf10ef8; proof PASS)

GO against the pre-registered bar (8/8 coverage + complete
template-by-speaker-by-situation table + sense verdict per situation class).

The 1715Z "one canned line" reading does NOT survive an unfiltered
harvest. 73672 speaks 18 table-talk lines across all six `tableWaitTalk`
pool templates: T0×6, T1×1, T2×2, T3×2, T4×4, T5×3 — all in waiting state,
all on 73672. The 1715Z filter (`ring of pale light`) could only ever pass
T0, so it hid the other five. T0 itself reproduces exactly (days 75, 80,
84, 91, 114, 154; same speakers/listeners as 1715Z). The other 7 seeds
contribute 0 table-talk lines, correctly: 5 never wait (no invitation, no
talk), and the 2 winners wait exactly 1 day (the sitting day), so no
fireside window ever opens. Entered-state table talk has zero occurrences
on this band — a structural absence, reported as no data, not a finding.
Conversation-UI table lines occur zero times under this bot policy
(unmeasured surface, not measured-zero).

The real blank (specified, not implemented — variety still awaits Steve's
ruling): the pool varies, but no line ever tracks the village's
situation. T0 fires verbatim at pantry 10,305 on day 75 (7 people,
pre-announce, pre-pellet) and at pantry 5,037 on day 154 (4 people,
post-announce, post-pellet, post-nation-prod, overtime running). No
template mentions pantry, pellet, nation prod, overtime, waiting duration,
or the lesser seat; the picker is situation-blind by construction (hash of
day + scholar id). The evidence file specifies the future fix (vary by
waiting phase, by pantry/pellet/prod/overtime read at fire time, name the
seat kind) and a pre-registered bar for a future variety arm. A "picker
collapse" fix arm must NOT be spawned — the picker spreads fine; the
tablenat single-line view was its filter.

## Wall numbers (this round's judged corpora, identical band)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting 3/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d, deaths 338,
starvation 1. Unchanged from 1715Z — the wall did not move; it got a
shape: standing is earned slowly, readiness is earned by killing, and the
killing stops at wave 3.

## Village assessment (plain words)

Eight villages, same shape as 1715Z — three survive, three are lost, two
win on the day they are invited. Four villages are honest strivers that
never earn enough standing (peaks 127–195, including a bread village at
195 whose next feast cannot help because bread is already capped). Two
villages do earn it and hit the second face: held at 199 because nobody
has ever killed a wave-4 monster. Two villages never get started: three
links and nothing else, no wave-3 kills at all, held at 99, winning or
dying without ever seeing wave 4. Only 73672 ever really waits: a regional
village with a lesser seat, talking about the table by the fire for 119
days while it shrinks from 8 people to 4 and its pantry swings from
~19,500 kcal to 488 — in six voices, but the same way on day 13 of the wait
as on day 93. That sameness, not the single sentence 1715Z reported, is the
dialogue blank. Both wins come through the lesser seat, as before.

## Telemetry deviation check

Command: `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-26/perseed-sim-wave5gate-a-rebaseline/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12→0, table 16→3,
wins 16→0). All the known recorder-row counting artifact: the checker
reads top-level national/wins keys that recorder rows do not carry; the
corpus actuals are national-ever 6/8, table 3/8, wins 2/8 — identical to
the 1715Z table. Baseline NOT rolled. No new investigation.

## Metric review

- Wave5gate: the single-gate bar did its job — it forced the split to be
  reported instead of smoothed into a false single cause. The bar should
  stay for future gate arms; a future arm that wants a GO needs a
  distribution-aware bar (e.g. "named mechanism covers ≥6/8 counting
  compounds"), pre-registered before sweeping.
- Tableline: the 1715Z filter (`ring of pale light`) was a measurement
  instrument that could only pass one template. Future dialogue censuses
  must harvest unfiltered by pool, then classify — never filter by a
  single phrase. The 1715Z "canned line" backlog line is corrected by this
  arm (see findings backlog), not merely closed.
- No metric was re-scored mid-run in either arm.

## Infrastructure

- Safe-commit index clobber hit BOTH worker commits (staged-deletion
  variant) — repaired via HEAD-blob cacheinfo each time, commits verified
  correct, trees clean at closeout.
- No EPERM flap this run. No check.js --quick re-run (zero src/js landed;
  attributable evidence is the arm proofs on merged master).
- Landing: tableline merged --ff-only first; wave5gate rebased clean onto
  it (zero file overlap), re-proved 76/0 + tableline PASS on the rebased
  branch, then merged --ff-only. Both proofs re-run green on merged master
  eed74316c. Both trees released done-merged, branches deleted, main tree
  clean at closeout.
- Sibling trees untouched throughout (eggroad-a, journey2-endgame,
  panel-contract-rulings, all *-b trees).

## Convergence

scale-onramp stays converging (NOT converged): wave 5 still 0/8, full seat
still unreached, wins still only via the lesser seat — but the wall now has
a measured shape (standing split 4/2/2 + empty veterans channel) and the
dialogue blank has been corrected from "one canned line" to "six voices,
situation-blind". Next blanks, in order: (1) wave-4 encounter decomposition
— spawn → fight → flee/lose/kill, why faced wave-4 monsters are never
killed (new, from wave5gate); (2) situation-aware table-talk variety arm
using the tableline spec + pre-registered bar (ruling still pending for
any dialogue change — the spec is ready, the ruling is not); (3) dead-entry
drop ruling (Steve, carried); (4) remaining 1354Z steve-calls
(choice-price, met-below-line finishing, melt — still skipped, not
re-measured); (5) defnarr proposal 3 (specifiable, ruling pending).
food-economy stays converging (untouched; sibling loop B). Claim deleted;
lock deleted.

Evidence: evidence/2026-10-26/sim-wave5gate-a.md,
evidence/2026-10-26/sim-tableline-a.md. Merged locally, pending ship.
