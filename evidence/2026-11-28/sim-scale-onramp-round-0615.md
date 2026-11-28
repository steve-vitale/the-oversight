# sim-scale-onramp-round-0615 — coordinator record (ADOPTION + ONE FRESH ARM)

**Run:** fleshout-20261128T0615Z · **Loop:** A · **Axis:** scale-onramp (converging)
**Type:** adoption of dead run fleshout-20261128T0015Z + one fresh voicing arm.
**Master at closeout:** `6f723c121` (seatvoice closeout). No push, no version
bump, no live verification — merged locally, pending ship.

## Run-start closeout (stale-claim recovery)

No lock file existed. The 0015Z claim was still live; recovery checks,
all recorded before touching it: its arms' heartbeats — sim-callfirst-a
02:16Z (~4.5h stale, past the 15-min guard), sim-fleeguard-a /
sim-fourthseat-a no registry entries at all (trees removed, branches
merged/deleted); no live coordinator process in `ps` (only the playtest
loop's journey-deepening node process — not touched); the 0015Z run's own
workers in the subagent record: fourthseat DONE/DIAG-GO, callfirst
DONE/NO-GO, third worker cancelled before finishing (the fleefloor
worker, later adopted via the 0315Z run). No machine-restart tell this
time; the 0015Z coordinator simply died before closeout. Claim retired
to `.DEAD` after verification; my lock + claim written (0615Z). Loop B
0530Z was live on winnability-chain the whole run (rejudge-b + winflee-b)
— NOT touched; B merged winflee-b (DIAG-NO-GO) onto master mid-run and
the seatvoice worker rebased cleanly over it.

Pre-flight: main tree clean (`git status --short` empty), disk 52%,
worktree reap skipped at start (registry lock held by another reaper
run, consecutive skips: 2).

## Adoption — arms of the dead 0015Z run

### Arm 1 — sim-fourthseat-a (DIAG-GO, already on master)

Commits 0ed102267 / 28ecdd47f / c52b0eb27. 141/141 fought wave-4 rows
classified; a 4th companion never exists (recruitment caps at holder+1),
so the 4th party seat never appears. Coordinator re-ran the proof test
`scripts/test-fourthseat-a.js` on master: **90/90 green**. Evidence +
analysis + corpus tracked on master. Standing-199 stall visible again
in its corpus: 5/8 seeds sit at exactly 199 standing (the known
deferral — the gate opens when a second living wave-4 veteran appears).

### Arm 2 — sim-callfirst-a (NO-GO CONCEPT-DEAD, evidence landed on master)

Landing ab3c2637a (evidence-only); probe held on branch sim-callfirst-a
(72c32b125, 94d7fef13, e8d886a72) per kill protocol — killed arms leave no
trace in `scripts/`. Strongest-first call-in engages (17,250 reorders,
23/23) but kills 0, median dpr 40 vs 47.3 (0.85x), starvation 6 vs 0.
Proof 28/28 + analyzer selftest 17/17 green on the branch per evidence
§6 (15/15 at the instruments commit; the tally-semantics fix added 2
selftest checks — the discrepancy is explained, not a gap). Evidence +
§15 panel + corpora tracked on master.

### Arm 3 — sim-fleefloor-a (already covered by the 0515Z adoption)

fb4b4dcc8 + fb12ee7db (corpus reconstruction); not re-covered here except
as cross-reference.

### What the 0015Z run left undone

No coordinator record, no tracker entry, claim never retired. This record
+ the tracker entry below close that gap. One gap stays visible, not
papered over: the merging run for fourthseat/callfirst is not recorded
anywhere (the 0015Z coordinator died before writing; the 0315Z/0515Z
records don't name the merger). The commits are verified on master; the
provenance is not.

## Fresh arm — sim-seatvoice-a (GO, merged 8ea0b727e + 6f723c121)

`[needs-eyes]` voicing fix, 0515Z next blank (2). In `src/js/table.js`
(+36/−6, voicing only — no gate, price, or behavior change):
`_capstoneSeatLine()` gates "The seat is open." on `deedGateReady().ok`
at delivery time, else "The deed is done — the seat still waits on the
deeds."; `_capstoneMercyLine()` replaces "Nothing out there can take this
from you." with "The wild can still take your food — but it cannot take
your people." Both helpers called from all three delivery branches
(tribute / charter / embassy); the triplicated mercy line is fixed by
extraction. Frozen bars **4/4 PASS**: both delivery seeds (113302 d83,
113305 d140) carry the honest line with deed-gate snapshot ok:false;
proof test `scripts/test-seatvoice-a.js` **52/52 green** (re-run on
master by the coordinator: 52/52); before/after corpus diff exactly 2
lines per delivery seed, 0 elsewhere, 113302 full-150d re-run
byte-identical; the overclaim line appears 0 times in the after corpus.
Evidence: evidence/2026-11-28/sim-seatvoice-a.md (+ prereg, analysis
JSON, corpus `perseed-seatvoice-a-arm/`). Findings: the
delivery-announcement entry marked `[fixed]`; new open finding filed —
`test-fullseat-stage-a.js` is stale on the LADDER leg-2 peak bars (fails
9 checks; `deedGateReady()` itself is correct). Coordinator corrected
the run_id on both findings lines (the worker wrote 0515Z; the arm ran
under 0615Z).

## Wall (this run's judged corpora, 32 configs)

| Corpus | national | table | wins | wave-4 | wave-5 | median |
|---|---|---|---|---|---|---|
| callfirst ctl+arm (16) | 0/16 | 0/16 | 0/16 | 16/16 | 9/16 | ~148d |
| fourthseat (8) | 0/8 | 0/8 | 0/8 | 8/8 | 2/8 | 150d |
| seatvoice after (8) | 0/8 | 0/8 | 0/8 | 8/8 | — | 150d |
| **pooled judged** | **0/32** | **0/32** | **0/32** | **32/32** | — | **~150d** |

The wall stands in the same shape as every run since October: villages
reach wave 5, survive to day 150 at regional standing, and never touch
national. What moved this run is the seat road's honesty, not the wall:
the delivery announcement no longer promises an open seat while the deed
gate is closed. Callfirst's armed leg is the one regression signal in
the pool (community loss 0.125 → 0.625 in its §15 panel) — consistent
with its NO-GO, not a new wall fact.

## Telemetry deviation check

Coordinator ran it on the three adopted corpora
(`--allow-recorder-corpus`): 3 LOUD lines each — national 12→0, table
16→0, wins 16→0. Same regime artifact as 0515Z (winseat baseline vs
competent-verbatim pilots with no seat stack); baseline NOT rolled. The
seatvoice worker ran it on its own corpus: same 2 LOUD lines, same
verdict, baseline NOT rolled.

## Metric review

- Pre-registered metrics bound every arm; no re-scoring happened in this
  run. Callfirst's starvation bar did more work than expected (its
  evidence §7 proposes fought-share as a secondary for the next wave-4
  arm).
- Seatvoice is a voicing arm judged on frozen voice bars, not win rates
  — stated plainly so the GO is not misread as wall movement.
- Coordinator lesson (from the 0515Z corpus loss, applied here): every
  worker commit was checked against the evidence file's own file list
  before merge — seatvoice 8ea0b727e holds all 15 files its evidence §7
  lists (8 corpus JSONs + summary + analysis + prereg + evidence +
  analyzer + proof + table.js). No corpus loss this run.

## Infrastructure

- `worktree-register.sh` took ~6.5 min (registry lock contention with
  sibling runs; `flock -w 120` waited it out; tree + heartbeat landed
  clean). Reaper skipped at run start (registry lock held by another
  reaper); retry at closeout below.
- Safe-commit index clobber struck the seatvoice worker on both commits
  — repaired via the ls-tree pipe each time, commits verified correct.
  No clobber on the coordinator record commit (verify below).
- `check.js --quick` (seatvoice worker, post-change): 335 passed, 9
  failed — every failure in the tail a 120s timeout under load (sibling
  rejudge-b drivers running concurrently), no assertion failure; the
  delivery/ladder/raid tests were re-run directly, all green
  (capstoneready2 32/32, ladder-bundle 79/79, ladder-cashout 35/35,
  lingering-raid GREEN). Standing profile from sibling runs: 337 passed
  / 7 failed. No EPERM flap. No machine restart this run.
- Loop B merged winflee-b (DIAG-NO-GO) onto master mid-run; seatvoice
  rebased cleanly over it (one transient rebase-detach failure on
  contention, retried clean).

## Convergence state

scale-onramp stays **converging** (NOT converged): the delivery voice now
tells the truth and the capstone bar stands at 2/8 delivered, but wins
and national are still 0 everywhere (0/32 this run's judged corpora;
0/56 across today's Loop A rounds), and the seat road still waits on a
single named wall — scale. The directive stands until the tracker records
this axis converged on measured evidence. food-economy stays converging
(untouched; sibling loop B). Rotation left at 7 (convergence work does
not cycle it).

Next blanks, in order (0515Z list, updated):
1. **Sitting policy + national road** — still the seat's missing half;
   scalerank-a is the live road attempt.
2. (DONE this run) "The seat is open" voicing fix — landed,
   `[needs-eyes]`. NEW sub-question, **Steve-call**: the seat clause
   gates on the deed half only; a village with the deed gate met but
   ladder peak < 3 hears "The seat is open" while the FULL seat waits on
   peak (seatvoice §7). One-line helper change if Steve wants the
   full-seat gate instead.
3. Charter-readiness diagnostic — still blocked until a band reaches
   national; do not run it on a competent band that never gets there.
4. Feast-bundle completion (open finding 2026-11-11).
5. Waiting-talk variety (scalecensus §7 arm #3, still open).
6. Death-cause recorder (scalecensus §7 arm #4, still open).
7. If the floor is ever revisited: gate to wave ≥ 4, judge cost on held
   fights only, primary on the hold population (fleefloor §5).
8. NEW: `test-fullseat-stage-a.js` stale on LADDER leg-2 peak bars —
   next arm touching `tableSeat()` updates the test to the ladder-peak
   bars or quarantines it with the reason (finding 2026-11-28).

Claims retired to `.DEAD` (0015Z + 0615Z); lock deleted.
Evidence: evidence/2026-11-28/sim-scale-onramp-round-0615.md (this file).
