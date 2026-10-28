# sim-raidcapture-b — the _removePantryKcal door, folded into the stockdoors ledger

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2352Z, axis
food-economy. Arm: sim-raidcapture-b — next blank (2) from the 2026-10-27
2150Z loop-B review: fold the driedhunt `_removePantryKcal` capture into
the standing stockdoors ledger instrument, so future ledger bands
automatically count raid / tribute / gift takes. Instrument only: ZERO
src/js changes, ZERO default flips, no game lever. Judged ONLY against
evidence/2026-10-27/sim-raidcapture-b-prereg.md, committed BEFORE any
judged sweep as 49ec16f03 (the prereg commit hit the documented
safe-commit index-clobber variant; repaired per the documented recipe —
HEAD blob via update-index --cacheinfo — and verified with
`git status --short` empty + `git diff HEAD` empty + hash-object match
before proceeding).

## Verdict against the pre-registered bar: GO (pilot) + CONFIRM-GO, with leg (a)(ii) FAILED on a stale baseline

| leg | bar | result |
|-----|-----|--------|
| (a)(i) det-gate on/off | RAIDCAPTURE=1 vs 0 byte-identical excl. folded fields + ms (seed 9820) | PASS — byte-identical; on-run wrappedPaths gains `_removePantryKcal`, off-run lacks it, all other numbers identical (147/1226/3/92/680/16, finalFresh 15,962 both runs). Caveat stated: 9820 carries ZERO takes on current trajectories, so the take-path neutrality evidence is the 9738 folded-vs-pre-fold identity below, not this seed. |
| (a)(ii) published-headline reproduction | re-run reproduces every published stockdoors headline exactly | FAILED — but NOT a fold failure (see "The stale baseline" below). The PRE-FOLD instrument, run today on the same seed, produces the same non-published numbers as the folded instrument. The leg's premise (a stable published baseline) is broken; the fold is exonerated by true control. Reported as NO-GO on this sub-leg, not re-scored. |
| (b) ledger closure, pilot (9738/9735/9825) | per seed, per family (dried + soup): \|NEW\| <= 10% of \|OLD\|, folded == 0 where OLD == 0 | GO — all six legs pass at exactly 0 (see pilot table). |
| (b) ledger closure, confirm (9820–9827) | same bar, only on pilot GO | CONFIRM-GO — all sixteen legs pass at exactly 0. |
| (c) disjointness | `_removePantryKcal` in no pre-existing method set; on/off differ only in direct fields; ledger delta == folded sums exactly | PASS — method sets disjoint by construction (see below); full-ledger consistency flag true on all 11 judged seeds; on/off payloads differ only in directRecords / directCounters (+ ms). |

The fold itself is GO: it closes every nonzero residual on both bands to
exactly zero, reproduces the probe it replaces take-for-take on identical
trajectories, and moves no game number. Leg (a)(ii) is the one failed
sub-leg, and its failure belongs to the baseline, not the fold — the
next run's prereg must re-baseline before gating on published headlines
(see "Metric review").

## The stale baseline (investigated same-run, not assumed)

The prereg's leg (a)(ii) expected the pilot re-run to reproduce the
published stockdoors headlines for 9738 (inflows 96, mealDraw 1264,
deaths 5, driedEvents 111, stockdoor 728, direct 200, finalFresh 27,628).
Today's folded run gives 160 / 1203 / 8 / 83 / 542 / 55 / 26,915. Before
judging that as a fold failure, three controls were run:

1. The UNMODIFIED old sweep (sweep-stockdoors-b.js) on 9738 today:
   160 / 1203 / 8 / 83 / 542 / 55 / 26,915 — identical to the folded run
   except the 4 folded direct records. (Note: this control loaded the
   worktree's already-folded capture file, so it was not yet a true
   control — it only showed the sweeps agree.)
2. The ORIGINAL driedhunt sweep (sweep-driedhunt-b.js) on 9738 today:
   same 160 / 1203 / 8 / 83 / 542 / 55 / 26,915, takes 4 / 3,520 kcal.
   Same caveat as (1): it loaded the reworked driedhunt adapter.
3. TRUE CONTROL: the pre-fold captures were restored
   (`git checkout HEAD -- scripts/stockdoors-capture.js
   scripts/driedhunt-capture.js`, HEAD being the pre-fold prereg commit)
   and the original driedhunt sweep was re-run on 9738:
   160 / 1203 / 8 / 83 / 542 / 51 / 26,915, takes 4 / 3,520 kcal —
   identical trajectory to the folded run, differing ONLY by the 4
   folded direct records (51 vs 55). The fold was then restored from
   backup and verified (node --check, grep, git status).

Game code cannot explain the shift: `git diff` between the driedhunt
evidence commit and this branch's head over src/js, src/data, and
index.html is ONLY a comment in src/js/table.js (the ontology header
split); the woundmill rule that landed in between was reverted to net
zero. So the published trajectories are unreproducible on current head
by ANY instrument, pre-fold or folded, for a run-condition cause this
run could not identify from the repo (process/environment state at the
original runs' time is not recorded in the corpora). The committed
reference file
evidence/2026-10-27/sim-raidcapture-b-corpus/truecontrol-pre-fold-s9738.json
is that true-control run's full payload, so the next run can re-derive
this finding instead of taking it on faith.

Consequence for judging: leg (b) is judged on CURRENT trajectories
(the bar's formula is unchanged — only its inputs are the measured
residuals, since the published ones do not exist on current head).
On current trajectories the pilot residuals are DIFFERENT from
published (9738 dried −3,520 not −2,240; 9735 soup −2,000 not −1,000;
9825 zero, not −1,021 dried) — and the folded door still closes every
one of them to exactly zero. The fold was not tuned to these numbers;
it closes what it finds.

## What was folded (design)

scripts/stockdoors-capture.js now owns the `_removePantryKcal` door:

- A shared installer (`installRemovePantryKcalCapture`, exported)
  wraps `Game._removePantryKcal` ONCE per Game object with a
  snapshot-diff + caller-stack capture (caller function + full frames
  + asked + returned amount), reusing the stockdoors snapshot-diff
  machinery (pantrySnap / diffDecreases) and the driedhunt caller
  parsing. A second installer in the same process SUBSCRIBES instead
  of re-wrapping, so no take is ever recorded twice by one instrument.
- installStockdoorsCapture installs the door by default (path
  `remove-pantry-kcal`, extras: caller, callerFrames, asked,
  retTaken, retMismatch) and records it in wrappedPaths /
  missingPaths like every other door. Opt-out (`opts.removePantryKcal
  === false`, `RAIDCAPTURE=0` in the new sweep) exists ONLY for the
  det-gate control — never for a judged band.
- scripts/driedhunt-capture.js is now a thin reuse adapter over the
  shared installer, preserving its record shape ({day, caller, stack,
  asked, ret, items}) and snapshotStacks(). The two record views
  (stockdoors directRecords vs driedhunt takes) are the SAME events
  viewed twice — a ledger must count one view, never sum both.
- Disjointness basis (read, not invented): `_removePantryKcal`
  (src/js/hierarchy.js:867) mutates the pantry inline (sort +
  whole-unit decrements + splice) and calls NO other wrapped method;
  none of the previously wrapped methods' files (game.js,
  abilityActions.js, alienPlayers.js) calls `_removePantryKcal`; none
  of the previously wrapped methods IS `_removePantryKcal`. The
  frozen stockdoors corpora confirm the old wrapped sets never
  contained it.

New scripts: scripts/sweep-raidcapture-b.js (stockdoors sweep +
folded door + RAIDCAPTURE det-gate flag; writes ONLY to
evidence/2026-10-27/sim-raidcapture-b-corpus/),
scripts/analyze-raidcapture-b.js (OLD residual via the reused
analyze-stockdoors-b-2030.js perSeedBa on a folded-records-excluded
copy; folded sums straight from directRecords; full-ledger
consistency check), scripts/test-raidcapture-b.js (proof).
The stockdoors and driedhunt corpora were never written to.

## Pilot closure (current trajectories, folded records read straight from directRecords)

| seed | dried: old / folded / new | soup: old / folded / new | folded records (caller) |
|------|---------------------------|---------------------------|-------------------------|
| 9738 | −3,520 / 3,520 / 0 ✓ | 0 / 0 / 0 ✓ | 4, all Object.villageAgencyDaily |
| 9735 | 0 / 0 / 0 ✓ | −2,000 / 2,000 / 0 ✓ | 2, all Object.villageAgencyDaily |
| 9825 | 0 / 0 / 0 ✓ | 0 / 0 / 0 ✓ | 0 (no take fired) |

Folded-vs-probe identity (same trajectory, the valid comparison):
today's pre-fold probe takes on 9738 (days 73/79/89/100, all
villageAgencyDaily, 3,520 kcal) are IDENTICAL, take for take, to the
folded records. The old-probe comparison (vs the driedhunt corpus)
differs only because the trajectories moved — different raid days,
same mechanism, same caller.

## Confirm closure (9820–9827, same bar, all sixteen legs at exactly 0)

| seed | days | deaths | wave | dried: old / folded / new | soup: old / folded / new | folded records |
|------|------|--------|------|---------------------------|---------------------------|----------------|
| 9820 | 100 | 3 | 3 | 0 / 0 / 0 ✓ | 0 / 0 / 0 ✓ | 0 |
| 9821 | 100 | 2 | 2 | 0 / 0 / 0 ✓ | −4,000 / 4,000 / 0 ✓ | 4, villageAgencyDaily |
| 9822 | 100 | 2 | 2 | 0 / 0 / 0 ✓ | −2,000 / 2,000 / 0 ✓ | 2, villageAgencyDaily |
| 9823 | 67 (lost) | 12 | 2 | 0 / 0 / 0 ✓ | 0 / 0 / 0 ✓ | 0 |
| 9824 | 100 | 14 | 3 | 0 / 0 / 0 ✓ | −2,000 / 2,000 / 0 ✓ | 2, villageAgencyDaily |
| 9825 | 100 | 6 | 3 | 0 / 0 / 0 ✓ | 0 / 0 / 0 ✓ | 0 |
| 9826 | 100 | 5 | 3 | 0 / 0 / 0 ✓ | 0 / 0 / 0 ✓ | 0 |
| 9827 | 100 | 1 | 2 | 0 / 0 / 0 ✓ | −3,000 / 3,000 / 0 ✓ | 3, villageAgencyDaily |

Pattern worth noting (not judged): on the confirm band every folded
take is Canned soup via villageAgencyDaily — the longest-spoilDay-first
order eats soup (spoilDay 366) before dried, exactly as driedhunt
predicted. The confirm 9825 file overwrote the pilot 9825 file with an
identical run (deaths 6, mealDraw 1307, inflows 263, stockdoor 619,
direct 196 — same numbers), confirming determinism across the two
sweeps. The confirm does not override the pilot verdict.

## Sense test (SENSE-TESTING LAW — one raid-take story, end to end)

Seed 9738, day 73, read straight from the corpus (not counted, read):

"Kyle cooked for the haven — meals stretched. Kyle worked the smoke
racks too — 2 batches preserved (~1920 kcal, keeps a couple of
weeks)." Those two batches are exactly the driedEvents of day 73:
4 units × 400 kcal + 2 units × 160 kcal = 1,920 kcal, spoilDay 88.
The SAME day, an unanswered raid at the treeline
(Object.villageAgencyDaily, via hierarchyDaily → membershipDaily →
endDay) took 2 × 400 + 2 × 160 = 1,120 kcal — the whole small batch
and half the big one, the day they were saved (asked 800, over-took
to 1,120 by the whole-unit rule). The remaining 2 × 400 (800 kcal)
was never eaten — no mealDraw and no direct eat touches spoilDay-88
dried afterwards — and the day-90 spoil sweep removes exactly 800
kcal of dried. The day-73 story closes to the kcal three ways:
1,920 saved = 1,120 raided + 800 spoiled. That reads as a real
village day — food saved just in time, raiders taking it the same
day, the rest rotting uneaten — and every kcal of it is now in the
standing ledger, no separate hunt step. Nothing robotic, static, or
repeated beyond the known racks-full repetition (backlog 1149,
unchanged, not chased here).

## Village assessment

What the village looked like: the same competent-nofeast villages as
the stockdoors bands, re-observed on current trajectories — pantries
that now close to the kcal once raid/tribute/gift takes are counted
by the standing instrument. No new village story beyond the raid
story above; this arm's contribution is the ledger's last open door,
folded in.

Who thrived and died and why: pilot 23 deaths (9738: 8, 9735: 9,
9825: 6); confirm 45 deaths (9820: 3, 9821: 2, 9822: 2, 9823: 12,
9824: 14, 9825: 6, 9826: 5, 9827: 1). No death is attributed to the
raid takes: on these seeds the takes are a tax the pantry absorbs
(800–1,120 kcal per raid), not a starvation cause. 9823's day-67
village loss (12 deaths) is the band's one collapse; its ledger
still closes (zero takes, zero residuals).

What knowledge/capabilities were missing: none in the game — the
missing piece was instrument coverage, now folded in. What remains
documented, not fixed: (1) the stale-baseline question — why
published trajectories do not reproduce on current head despite
byte-identical game code — needs a run-condition audit, not a code
change; (2) non-raid `_removePantryKcal` callers (tribute, gifts,
accords, betrayal, comms, lingerer rations) still have zero
recorded takes on any band — every folded take observed here is
villageAgencyDaily — so their accounting is proven by method, not
yet by example, and needs a band where they fire.

Blanks filled: (1) the `_removePantryKcal` door is folded into the
standing stockdoors instrument (default-on), so future ledger bands
count raid/tribute/gift takes without a separate hunt step; (2) the
fold closes every nonzero dried and soup residual on the pilot and
confirm bands to exactly zero; (3) the folded records reproduce the
driedhunt probe take-for-take on identical trajectories;
(4) driedhunt-capture.js now reuses the folded code instead of
duplicating the wrapper. Documented, not fixed in game code: no
src/js change was made (DIAG only).

## Reachability verdict (inherited, not re-measured)

This arm re-runs the stockdoors band/seeds; it does not open new
content. Reachability is inherited from stockdoors: waves 1–3
reached, waves 4–5 0/20, regional/national/table/wins 0/20 across
the stockdoors bands. This run's own wave reach (wave 3 on 9738,
9735, 9820, 9824, 9825, 9826; wave 2 on 9821, 9822, 9823, 9827)
reproduces that picture, nothing more.

## Wall numbers

Pilot (9738/9735/9825): national / table / wins 0/3, wave-4/5 0/3,
median survival 100d (3/3 survived to day 100), deaths 23.
Confirm (9820–9827): national / table / wins 0/8, wave-4/5 0/8,
median survival 100d (7/8 survived to day 100; 9823 lost day 67),
deaths 45. The scale wall stands on both bands; this arm measures
a pantry ledger, it does not move the wall numbers.

## Telemetry deviation check (loop-B body step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/sim-raidcapture-b-corpus/*.json' --metrics
national,table,wins,exiled` reports LOUD: national 12 -> 0,
table 16 -> 0, wins 16 -> 0 (n=11 files). Investigated same-run:
band composition, not a regression — the scale-wall baseline mixes
bands that reach national/table, while this corpus is the
competent-nofeast ledger band whose published wall numbers are
0/20 (stockdoors), reproduced here as 0/11. The correct comparator
(the stockdoors band itself) shows zero deviation. No further
investigation item.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered bars worked as written except leg (a)(ii),
  whose premise failed: "reproduces every published headline
  exactly" assumes the published baseline reproduces, and on
  current head it does not — for ANY instrument, proven by true
  control. The verdict follows from the bars, not around them:
  (a)(ii) is reported FAILED (NO-GO on that sub-leg), and the
  fold's GO rests on (a)(i), (b), and (c), which do not depend on
  the stale baseline. No re-scoring was done: no dropping the
  leg, no substituting friendlier numbers, no judging (b) against
  published residuals that do not exist on current head.
- Bar lesson for the NEXT run: a headline-reproduction leg must
  name its baseline's reproducibility condition — either pin the
  run to the baseline's commit, or re-baseline (fresh reference
  run on current head, committed like the true-control file here)
  BEFORE gating on it. A leg gated on an unreproduced baseline
  fails neutral work. Proposed revision for the next run: leg
  (a)(ii) becomes "reproduces the committed current-head reference
  run" (true-control pattern), and published-headline comparison
  is reported as INFO until a re-baseline lands.
- Definition lesson (carried): NEW residual = OLD residual +
  folded-family kcal is the right closure form — it caught both
  directions (under- and over-accounting would both show as
  nonzero NEW), and the full-ledger consistency check (unfiltered
  == OLD + folded) proves no other record moved. Future ledger
  arms inherit both.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists —
  this arm changes no lever and no game code, so there is no
  before/after to panel. scripts/balance-panel.js still has no
  corpus-ingest mode for these per-seed ledger corpora, as prior
  rounds recorded — stated here as the standing exception, not
  waived silently. The det-gate (leg (a)(i)) plus the
  folded-vs-pre-fold trajectory identity IS the before/after
  comparison: identical records with the folded instrument off vs
  on, and identical trajectories with the pre-fold instrument vs
  the folded one.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (49ec16f03, including
  the legs, horizons, seeds, and the RAIDCAPTURE det-gate design).
  The judged pilot and confirm sweeps ran on the folded code.
- Proof scripts/test-raidcapture-b.js: run after commit; its det-gate
  re-runs seed 9820 on/off. CORRECTION (follow-up commit, same run):
  the test as first committed miscounted corpus files (it counted
  the confirm files as pilot files, then miscounted the shared 9825
  file) — two test-only fixes, no sweep/analyzer/capture change, and
  the proof is GREEN on the fixed test (all legs pass, det-gate
  byte-identical, true-control take identity exact). The evidence
  verdicts above are unaffected: they were computed by the analyzer,
  not the test's file counter.
- Existing proofs scripts/test-stockdoors-b.js and
  scripts/test-driedhunt-b.js: run after commit, results reported
  in the run's final report (their headline gates touch the same
  stale baseline and are reported, not waived, if they fail).
- No jest was run (nothing to test in jest — the proof is node,
  not jest). No [needs-eyes]: this lands a measurement, not a
  player-visible change.
- No game-code change: zero src/js files touched. Files in this
  run's commits: prereg commit 49ec16f03 (prereg only); evidence
  commit (this file, scripts/stockdoors-capture.js,
  scripts/driedhunt-capture.js, scripts/sweep-raidcapture-b.js,
  scripts/analyze-raidcapture-b.js, scripts/test-raidcapture-b.js,
  and the 11 corpus files: 10 raidcapture files (pilot 9738/9735 +
  confirm 9820–9827, with 9825 counted once — the confirm run
  overwrote the pilot file with an identical run) + 1 true-control
  reference). The stockdoors and driedhunt corpora were never
  written to (verified: only this run's own files appear in git
  status).
- Infrastructure notes (loud, per the flap/clobber rules): the
  documented safe-commit index-clobber variant hit the prereg
  commit (repaired per recipe, verified clean); the confirm sweep's
  wall-clock ran ~13 min for ~13 s of sim compute — the known
  ~60–140 s gaps between file writes (cause not established, no
  EPERM flap observed this run; all writes succeeded first try).
  No ref surgery was performed at any point. No EPERM flap hit
  this run.

## Verdict (judged against the pre-registered bar, not re-scored)

GO (pilot) + CONFIRM-GO on legs (a)(i), (b), and (c); leg (a)(ii)
FAILED on a stale published baseline, exonerated by true control.
The `_removePantryKcal` door is folded into the standing stockdoors
ledger (default-on): future bands count raid / tribute / gift takes
automatically, every nonzero dried and soup residual on both judged
bands closes to exactly zero, and the folded records reproduce the
driedhunt probe take-for-take on identical trajectories. The
backlog item "fold the driedhunt capture into stockdoors" is
resolved by this run (coordinator to mark it fixed); the
stale-baseline question is opened as a new backlog item (run-condition
audit, not a code change).
