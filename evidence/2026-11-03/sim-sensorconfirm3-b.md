# sim-sensorconfirm3-b — INSUFFICIENT-DATA AT THE CALIBRATION GATE: THE GAME MOVED UNDER THE KNOWN COLLAPSERS, SO NO SCREEN, NO TRACER LEGS, NO JUDGED LEGS

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0856Z,
arm sim-sensorconfirm3-b, axis food-economy. Worktree
sim-sensorconfirm3-b, branch sim-sensorconfirm3-b. Base at spawn:
5440b7747 (gap-w5window, 08:54 UTC). MEASUREMENT ONLY: zero src/js
changes, zero policy-default flips, zero edits to any existing script
or policy file. New files only, all named *-sensorconfirm3-b.*. The
gatecover tracer, the gatediseng analyzer, and the competent policy
are REUSED VERBATIM, never edited. This worker does NOT push, bump,
verify live, merge, or rebase — the coordinator lands the branch.
This confirm does NOT deploy (e*).
Status to coordinator: committed in worktree, pending coordinator merge.

## Verdict: INSUFFICIENT-DATA — judged exactly against the prereg bars

Prereg: evidence/2026-11-03/sim-sensorconfirm3-b-prereg.md, commit
7c6fa57676190fe9b003a0938450f63a5c70ea13, written and committed BEFORE
any judged leg (tools commit a58cacad5997473db9dd1e5ec8af1f83062895c9
after the prereg commit and before any judged application; proof test
22/22, pure synthetic series, no judged seeds, changes no prereg word;
the reused proof tests were also re-run green on current base before
the confirm: gatediseng 21/21, gatediseng-confirm 11/11).

The run stopped at STEP 3, the calibration gate, exactly as the prereg
orders. The gate requires the screen tool to reproduce the known
classifications of 7 seeds. It reproduced 4/7. The 3 misses are all in
the same direction: villages that starved to death on every prior run
now survive the full 30 days, with zero starvation deaths. Per the
prereg, ANY calibration mismatch = INSUFFICIENT-DATA, instrument
failure, no fallback method, no judged legs. No screen of 82001-82200
was run, no tracer legs were run, and no judged leg (count, fire, tie,
strict, lead-one, cost, cross-check, tracer) is reported as pass or
fail — they were never reached, and this file does not pretend
otherwise. No top-up, no extra band, no fallback screen tool, no
re-scored gate.

| gate / leg | result | bar | outcome |
|---|---|---|---|
| Calibration gate: known seeds reproduced | 4/7 | 7/7, any mismatch stops the run | FAIL -> INSUFFICIENT-DATA |
| Screen (82001-82200) | NOT RUN | — | — |
| Tracer legs | NOT RUN | — | — |
| Count gate, fire, tie, strict, lead-one, cost, cross-check, tracer legs | NOT RUN | — | — |
| Determinism spot-check | NOT RUN (no tracer legs to check) | — | — |
| Sense test | NOT RUN (no traced collapsing firings exist) | — | — |

## Q — THE CALIBRATION GATE, SEED BY SEED (7 legs, 30d competent, verbatim tracer)

Known classifications are fixed by the archived corpora and the supply
pilot's fresh re-run (byte-identical there). "First divergence" is the
first evening whose pantry differs from the archived line; day-1
pantry is identical on all three missed seeds, so the harness, the
seed, and the policy invocation are not the difference — the game
underneath moved mid-run.

| seed | known classification (archived) | fresh classification (this run) | first pantry divergence | starvation deaths fresh / archived |
|---|---|---|---|---|
| 80008 | collapsing: lost day 20, first starvation day 18 | SURVIVOR: survived 30d | day 12 (13,900 vs 13,300) | 0 / 3 (days 18, 19, 20) |
| 80016 | collapsing: lost day 29, first starvation day 28 | SURVIVOR: survived 30d | day 11 (22,630 vs 23,595) | 0 / 2 (days 28, 28) |
| 81053 | collapsing: lost day 30, first starvation day 26 | SURVIVOR: survived 30d | day 18 (15,962 vs 14,999) | 0 / 3 (days 26, 29, 30) |
| 79001 | survivor: survived 30d | survivor: survived 30d | — (match) | — |
| 79002 | survivor: survived 30d | survivor: survived 30d | — (match) | — |
| 79003 | survivor: survived 30d | survivor: survived 30d | — (match) | — |
| 79004 | survivor: survived 30d | survivor: survived 30d | — (match) | — |

All 7 calibration legs verified first try (rows == daysAlive each,
tracer rc 0 each). The gate failure is not a tracer failure, not a
row-count failure, and not an invocation failure: the trajectories
themselves changed. Deaths through day 10 on 80008 are identical to
archived (same villager-combat losses days 7, 8, 10); the fresh line
then keeps its people alive through day 30 while the archived line
loses its village on day 20. The same shape holds on the other two
misses (identical day-1 pantry: 80016 at 40,110, 81053 at 38,970).

## What moved (timing evidence, not a proven cause)

Between the supply pilot (run 080700Z, whose 12 fresh lines were
byte-identical to archived) and this run (0856Z), master took the
gap-w5window commit 5440b7747 (08:54 UTC): "wanderer gives up after 7
uncontacted days, freeing the cast slot" — 25 lines in src/js/game.js
plus its test and evidence note. That is the only game-code change in
the window (the intervening feastdraww4 kill commit touched policy
files, evidence, and pilot data, not the competent tracer's game
path). The timing fits the divergence shape: wanderers who previously
stayed (and ate) now leave after a week uncontacted, which would
first show up in pantry and survival around days 11-18 — exactly
where the three fresh lines diverge (days 11, 12, 18). This run does
NOT prove the wanderer change caused the survival flip: no
before/after panel was run (the prereg forbids judged work past a
failed gate), and the mechanism is inferred from the commit message
plus divergence timing, not measured. What IS proven is narrower and
is all the verdict needs: on the current base, the sensor line's
known-collapsing supply no longer collapses, so no confirm built on
it can proceed until the supply is re-derived on the new base.

## Reachability + wall numbers (NOT MEASURED — run stopped at calibration)

No screen band and no tracer legs exist, so no wall numbers are
reported from this run. The 7 calibration legs are not a band and
their 7/7 survival is the gate outcome, not a survival claim. For the
record only: on the calibration legs, national / table / wins are NOT
REACHED IN WINDOW (expected 0 — a 30d pre-seat window cannot measure
them, and no fields for them exist in this window). NO wall movement
is claimed. Wave reach, Arc reach, and death-cause shares are not
reported: with no band, any such table would be calibration-leg
trivia dressed as measurement.

## Sense test (NOT RUN)

The prereg's sense test reads transcripts around (e*) firing evenings
on traced collapsing seeds. There are no traced collapsing seeds —
the run stopped before any tracer leg — so there is nothing honest
to sense-test. The calibration survivors' transcripts were not
sense-read as a substitute: that would be judging-adjacent analysis
outside the prereg. Sense remains owed by any future confirm that
reaches traced legs.

## Balanced panel (section 15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the pilot, both confirms, and the
supply pilot): this arm changes NO game code, runs NO lever, and its
metrics are within-trajectory instrument diagnostics, not panel
metrics. With the run stopped at calibration, there is not even a
traced table to report — the calibration table above is the whole
result.

## Metric review

(1) THE GATE WORKED AS DESIGNED — AND THAT IS THE RESULT. Without
    the calibration gate, this run would have spent its screen on a
    changed game and judged (e*) against villages whose starvation
    behavior no longer exists on this base. The gate caught the base
    move before any judged spend, for the price of 7 legs. A future
    prereg should KEEP a calibration gate of this form; the lesson
    is not to weaken it but to run it first, always, after any base
    move.
(2) THE GATE'S STRICTNESS IS CORRECT EVEN WHEN THE BASE MOVE IS AN
    IMPROVEMENT. If the wanderer change genuinely saves villages
    (plausible, unproven here), then the old collapsing supply is
    still invalid as a confirm supply — a confirm must judge (e*)
    on villages that actually collapse on the base it runs on. The
    remedy is re-derivation (re-screen on the new base, or a new
    known supply fixed in the next prereg), never relaxing the gate
    to "close enough" classifications.
(3) THE NEXT (e*) RUN MUST RE-ESTABLISH ITS SUPPLY ON THE CURRENT
    BASE BEFORE JUDGING. Options, for the coordinator's next prereg
    (not decided here): (a) re-run the calibration set plus a fresh
    screen and build the confirm supply from whatever collapses on
    the new base; (b) first measure whether the wanderer change
    itself moved starvation-collapse rates (a before/after panel on
    identical seeds, old base vs new base — the base comparison this
    run deliberately did not attempt). Either way, the 82001-82200
    band stays FRESH: it was never screened, so a future run may
    still use it, and must say so in its prereg if it does.
(4) NO POOLING, NO DEPLOY CLAIM. Nothing in this run pools with prior
    runs: the calibration legs are instrument checks, not evidence
    about (e*). The prior runs' verdicts stand untouched — the pilot
    GO, the two INSUFFICIENT-DATA confirms, and the supply PILOT-GO
    were all judged on their own bases. This run neither overturns
    nor advances (e*); it reports that the ground moved.
(5) No metric, threshold, seed, leg, collapse definition, or rule
    definition was changed mid-run. Prereg committed (7c6fa5767)
    before any judged leg; the proof test (22/22) ran after the
    prereg commit and before any judged application, uses no judged
    seeds, and changes no prereg word; the calibration legs ran
    after the tools commit per the staged design; the gate verdict
    follows the prereg header exactly (any mismatch stops the run).
    The one judgment call made mid-run was to run two read-only
    diagnostics (per-seed divergence days, base-commit stats) to
    characterize the gate failure — neither changes any leg, and
    both are reported above as timing evidence, not as a cause.

## Village assessment (plain words)

Three villages that used to starve to death now live the month. They
start exactly as they did before — same stores on day one, same
early losses — and then, from about the second week on, their stores
hold up better than they used to, and nobody starves. The four
villages that lived before still live. In plain words: whatever
changed in the game between the last measurement and this one looks
like it took pressure off hungry villages — fewer mouths, or fewer
days of strain, right when the old villages used to tip over. That
is a lead, not a finding: this run stopped at the gate on purpose,
so it cannot say which change did it or whether villages are better
off in general. What it can say is that the old dying villages are
gone as measuring tools — the next attempt to prove the warning rule
has to find new dying villages on today's game first, before it can
prove anything about the warning.

## Findings for the coordinator (to append to the backlog)

- (e*) SCREEN-THEN-TRACER CONFIRM INSUFFICIENT-DATA AT CALIBRATION
  (run 0856Z, base 5440b7747): calibration gate 4/7 — known
  collapsers 80008/80016/81053 all now survive 30d with zero
  starvation deaths (archived: lost days 20/29/30, first starvation
  days 18/28/26); survivors 79001-79004 reproduce. Per prereg, ANY
  mismatch stops the run: NO screen of 82001-82200 (band stays
  fresh), NO tracer legs, NO judged legs, NO sense test, NO deploy
  claim. Does NOT overturn the pilot GO, the two prior
  INSUFFICIENT-DATA confirms, or the supply PILOT-GO.
- BASE MOVE UNDER THE SENSOR LINE: trajectories identical on day 1
  and through day 10 (80008), diverging days 11/12/18 across the
  three misses — the game, not the harness, moved. Only game-code
  change in the window is gap-w5window 5440b7747 (wanderer gives up
  after 7 uncontacted days, freeing the cast slot; src/js/game.js).
  Mechanism unproven (no panel run past the failed gate); timing
  fits a survival-improving change. Next (e*) prereg must
  re-derive its collapsing supply on the current base and keep a
  calibration gate of this form.
- CALIBRATION GATE VALIDATED AS A DESIGN: caught a base move for 7
  legs before any judged spend. Keep it first after every base
  move; never relax it to "close enough" classifications.
- 82001-82200 STILL FRESH: never screened (run stopped at
  calibration). A future run may use it, and must state that reuse
  in its prereg.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT + TOOLS-COMMIT INDEX CLOBBER (same known class):
  after commits 7c6fa5767 and a58cacad5 the main index showed the
  committed files as staged deletions alongside the worktree copies.
  Repaired both times via git update-index --add --cacheinfo from
  the HEAD blobs, then verified tracked status clean and
  `git show --stat HEAD` correct. The commits themselves were
  correct throughout.
- FULL `git status` (with untracked scan) STALLS on this worktree (as
  in prior gatediseng arms); the tracked-only
  `git status --porcelain --untracked-files=no` returns in ~1s and
  was used for all verification.
- CALIBRATION CLEAN, FIRST TRY EVERY LEG: all 7 legs verified on
  first try (rows == daysAlive each, tracer rc 0 each); no EPERM-flap
  retry was needed on this run (shell-redirection writes to the
  calibration corpus succeeded). Per-leg tracer cost ~11s under
  current load (7 legs in ~82s wall).
- check.js --quick NOT re-run: zero src/js, zero green-list files on
  this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-03/sim-sensorconfirm3-b-prereg.md
  (commit 7c6fa5767, before any judged leg)
- Proof test: scripts/test-sensorconfirm3-b.js (22 pure checks, no
  judged seeds; commit a58cacad5)
- Thin analyzer: scripts/analyze-sensorconfirm3-b.js (imports the reused
  analyzer for (c); commit a58cacad5)
- Evidence: evidence/2026-11-03/sim-sensorconfirm3-b.md (this file)
- Calibration corpus: evidence/2026-11-03/sim-sensorconfirm3-b-calib.jsonl
  (7 lines, seeds 80008/80016/81053 + 79001-79004, fresh on base
  5440b7747),
  evidence/2026-11-03/sim-sensorconfirm3-b-calib.log (per-seed tracer
  stderr, rc 0 each)
- Screen / tracer / determinism corpora: NOT PRODUCED (run stopped at
  the calibration gate, per prereg — no files fabricated for them)
- Reused verbatim, never edited: scripts/trace-gatecover-b.js,
  scripts/analyze-gatediseng-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): none — the calibration
  seeds are known seeds re-run by design, and the 82001-82200 band
  was never screened, so it stays fresh for a future run.
