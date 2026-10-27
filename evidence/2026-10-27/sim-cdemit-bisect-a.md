# sim-cdemit-bisect-a — the 73677 divergence disappears at c04d4e0cb

Run: fleshout loop, run fleshout-20261027T0615Z, arm
`sim-cdemit-bisect-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips,
no narration change, no lever proposal. The specification line at
the end is specification only (a narration/voice fix needs Steve's
ruling; nothing is proposed here).

## Question

From `evidence/2026-10-27/sim-divergebase-a.md` (old base
`c8770e7f4412aa6430d6daa3ce86e28484f0de20`: census 152d / 41
deaths / 0 walls vs transcript 168d / 44 deaths / 2 walls, 3/3
rep pairs) and `evidence/2026-10-27/sim-diverge73677-a.md`
(current base: both modes 130d / 37 deaths / won / 3 walls):
does the seed-73677 census-vs-transcript divergence disappear
at commit `c04d4e0cb` — i.e., is the bystander-hold fix the
mechanism? `c04d4e0cb` is the sole `src/js` change between
raidtrace's base and the current branch (verified topology:
`c8770e7f` is an ancestor of `c04d4e0cb`, exactly ONE commit
in range, its file list 74 files but only ONE `src/js` file,
`src/js/game.js`, 17 lines; the rest is evidence plus
measurement scripts).

## Headline answer

**Yes — at `c04d4e0cb` the divergence is gone, in both modes,
on every rep.** The control leg on `c8770e7f` reproduces
raidtrace's divergence exactly (3/3 pairs), and the test leg
on `c04d4e0cb` reads the SAME trajectory in both modes (3/3
pairs), matching the current-base figures:

| Seed 73677 | Days | Deaths | Won | Walls |
|------------|------|--------|-----|-------|
| Control census (narration-off), reps 1–3 | 152 | 41 | 0 | 0 |
| Control transcript (narration-on), reps 1–3 | 168 | 44 | 0 | 2 |
| Test census (narration-off), reps 1–3 | 130 | 37 | 1 | 3 |
| Test transcript (narration-on), reps 1–3 | 130 | 37 | 1 | 3 |

## Verdict: DIAG-GO

Per the binding pre-registration
(`evidence/2026-10-27/sim-cdemit-bisect-a-prereg.md`): DIAG-GO
iff the control reproduces AND the test leg shows the
divergence ABSENT (both modes agree, headline + stripped
full-field) AND the agreed numbers are not an unexplained
shift. Here: control reproduces 3/3; test agreement 3/3 on
headline AND stripped comparison (trajEq true, zero tick
diffs, all five recorder sections stripped-equal); the
agreed numbers (130d / 37 / won / 3 walls) MATCH the
current-base figures — the clean GO, not a collapse onto
an old-base mode figure and not an unexplained shift. That
is the verdict — for the bisection only. A GO here means
the divergence is present on the parent base and absent at
`c04d4e0cb` with the sole `src/js` change in range being
its game.js edit. No game change is approved by this arm.

## What this means, in plain words

On the old base, simply turning narration on changed the
village's fate: the same seed lived 16 days longer, lost 3
more villagers, and took 2 extra palisade-raid wounds it
never took with narration off. At `c04d4e0cb`, narration
on/off give the identical village — same days, same deaths,
same win, same walls, same daily ticks. The 17-line
bystander-hold fix (it stops the game lifting a monster
that is only standing nearby, not actually in the fight,
and then losing it when the fight is won) sits exactly on
the wave-4 lingerer lifecycle at the heart of this seed's
story, and the bisection puts the divergence's disappearance
exactly at that commit. Nothing in this arm changes the
game or proposes a narration change; the mechanism's
location is now measured, not guessed.

## Method (verbatim reuse, old-base procedure)

- Preregistration written and committed FIRST, before any
  sweep, on branch `sim-cdemit-bisect` (commit `149ed89c5`,
  prereg + proof validator; the commit itself is correct —
  the worktree index then showed the known bogus staged-
  deletion clobber on both committed files and was repaired
  with `git update-index --cacheinfo` from the HEAD blobs,
  after which `git status` was empty).
- Legs run on DETACHED checkouts at `c8770e7f` (control)
  and `c04d4e0cb` (test); the arm then RETURNED to branch
  `sim-cdemit-bisect` to commit evidence. NEVER committed
  while detached. NEVER force-moved the branch. No push, no
  version bump, no live verification.
- Instrument identity, verified before sweeping and again
  per leg: the raidtrace sweep
  (`scripts/test-raidtrace-a-sweep.js`) and emit recorder
  (`scripts/policies/raidtrace-diag.js`) do NOT exist at
  either base commit — they were restored onto EACH
  detached checkout verbatim from the raidtrace commit
  `fd3bcd83d` and never committed there. Restored-file
  hashes are IDENTICAL on both legs (sweep
  `1787efdca183a9e24d7af686fdff51c1f029368684bc819e9e9f2c716a23c17f`,
  recorder
  `7432ee453e376b6447bf1952439a41d3477441df957b1bd7101b4a52d802bf12`)
  and equal the branch versions. The rest of the
  instrument stack is identical across the range (`git log
  c8770e7f..c04d4e0cb` EMPTY for
  `scripts/test-seq51gap-diag-sweep.js`,
  `scripts/sim-harness.js`,
  `scripts/policies/tableseat-nowait.js`,
  `scripts/policies/seq51gap-diag.js`,
  `scripts/policies/w4dmg-diag.js`; their hashes match on
  both legs: seq51gap sweep `2282bd46…`, harness
  `2ad1673e…`, tableseat `a11a1abc…`). So the ONLY
  difference between control and test is the base commit.
- Census mode: `scripts/test-seq51gap-diag-sweep.js --one
  armed 73677` (narration-off, seq51gap-a armed recorders),
  EVID redirected to
  `evidence/2026-10-27/perseed-cdemit-bisect-a/<leg>/`.
  Three reps; each rep's output kept as
  `s73677-census-rep<N>.json` so no rep overwrites another.
- Transcript mode: `scripts/test-raidtrace-a-sweep.js
  --transcript 73677` (narration-on, same armed recorders +
  raidtrace-diag emit recorder), same EVID. Three reps;
  armed rows kept as
  `s73677-transcript-armed-rep<N>.json`, transcript docs as
  `s73677-transcript-doc-rep<N>.json`.
- Walls counted exactly as raidtrace counted them:
  C2-palisade-wall + C2?-wall-amount-only steps from
  `traceSeq` on the run's own armed row.
- Comparison: the diverge73677-a analyzer
  (`scripts/test-diverge73677-a-sweep.js`, `--diff` per rep
  pair) reused verbatim, never edited, plus the proof
  validator `scripts/test-cdemit-bisect-a.js` (re-derives
  every number below from the corpus rows). Fight-ID
  timestamp prefixes are STRIPPED before every trajectory
  comparison (see "Fight-ID rule" below); raw and stripped
  section comparisons are both reported, never conflated.
- Each seed-run took ~45–75s. Total sweep time for 12
  runs plus det-gates: ~15 min of sim time, plus the
  flap/FIFO episode disclosed below (which cost wall-clock
  time, not sims).

## Per-rep table (control leg, c8770e7f)

| Rep pair | Census days / deaths / won / walls | Transcript days / deaths / won / walls | Differs? | Stripped trajEq? |
|----------|--------------------------------------|------------------------------------------|----------|------------------|
| 1 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | false |
| 2 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | false |
| 3 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | false |

Full trajectory fields, identical across all three pairs:

- Census: days 152, gameDays 152, endReason village-lost,
  won 0, wave 4, maxArc 4, finalRank regional, maxRank
  global, nationalEver 1, nationalFinal 0, table 1,
  entered 0, deaths 41, starvation 0, finalPop 2,
  finalPantry 0, finalKnown 60, ticks 151, walls 0.
- Transcript: days 168, gameDays 168, endReason
  village-lost, won 0, wave 4, maxArc 4, finalRank regional,
  maxRank global, nationalEver 1, nationalFinal 0, table 1,
  entered 0, deaths 44, starvation 0, finalPop 2,
  finalPantry 1000, finalKnown 59, ticks 167, walls 2.

Cross-mode `--diff` (same on all three pairs): trajectory
fields differ on days, gameDays, deathTotal, finalPantry,
finalKnown; deaths breakdown, faced map, and kill log all
differ; ts equal; tick diffs 36; **first tick diff day
134**; all recorder sections differ even after fightId-
prefix stripping — a real trajectory divergence, not a
timestamp artifact. Transcript walls, identical across
pairs: seq35 raid day 155 (850 → 637, -213, tier 3) and
seq39 raid day 168 (1200 → 900, -300, tier 3) — exactly
raidtrace's two walls. The control transcript doc is
byte-identical to raidtrace's own transcript doc, and the
control armed rows match divergebase's control rows on
every trajectory field.

## Per-rep table (test leg, c04d4e0cb)

| Rep pair | Census days / deaths / won / walls | Transcript days / deaths / won / walls | Agree? | Stripped trajEq? |
|----------|--------------------------------------|------------------------------------------|--------|------------------|
| 1 | 130 / 37 / 1 / 3 | 130 / 37 / 1 / 3 | yes | true |
| 2 | 130 / 37 / 1 / 3 | 130 / 37 / 1 / 3 | yes | true |
| 3 | 130 / 37 / 1 / 3 | 130 / 37 / 1 / 3 | yes | true |

Full trajectory fields, identical across all three pairs
AND across both modes:

- days 130, gameDays 130, endReason over-other, won 1,
  wave 4, maxArc 4, finalRank global, maxRank global,
  nationalEver 1, nationalFinal 1, table 1, entered 1,
  deaths 37, starvation 0, finalPop 8, finalPantry 14868,
  finalKnown 39, ticks 129, walls 3.

Cross-mode `--diff` (same on all three pairs): trajectory
fields equal on every field; deaths breakdown equal; faced
map equal; kill-log entries equal; ts equal; ticks 129 /
129, tick days identical, **zero tick diffs, first-
divergence day null**; recorder sections wave4enc,
spawnsrc, fieldfinish raw-equal; w4dmg and nonworldkill
raw-unequal ONLY in fightId timestamp prefixes, stripped-
equal on all five sections. Walls 3 == 3, identical
details in both modes: seq39 raid day 103 (850 → 637,
-213, tier 3), seq39 raid day 111 (637 → 424, -213,
tier 3), seq42 raid day 121 (1300 → 975, -325, tier 3) —
the current-base wall pattern from diverge73677-a, not
raidtrace's. The verdict line from the analyzer itself:
"TRAJECTORIES AGREE (any remaining diff is fightId
timestamps only)".

## Determinism (within-mode, both legs)

All three census rows are byte-identical within each leg,
all three transcript armed rows are byte-identical, and
all three transcript docs are byte-identical — on BOTH
legs (control: census 962,898 bytes, transcript-armed
1,059,118 bytes, doc 580,456 bytes, same MD5 within mode;
test: census 998,278 bytes, transcript-armed 1,026,727
bytes, doc 401,114 bytes, same MD5 within mode). There is
no run-to-run variance to attribute anything to:
within-mode variance is zero on every file, in both legs.
The control reproduction and the test agreement are both
stable properties of their bases, not flaky runs.

## Det-gates (both legs, seed 73677)

- Control leg: census det-gate PASS (recorders unset ==
  unwrapped: baseline 152d / 152 gameDays / tsNationalDay 77
  == wrapped-off, no diag surface, no wraps, gapTicks 0);
  transcript det-gate PASS (wrap-off == plain: 168d / 168
  gameDays / tsNationalDay 77, starvation 0, wrapped false,
  installed false, lines 0).
- Test leg: census det-gate PASS (baseline 130d / 130
  gameDays / ts with seat taken day 130, lesser seat,
  feared path, 5 table answers == wrapped-off, no diag
  surface, no wraps, gapTicks 0); transcript det-gate PASS
  (plain == wrap-off: 130d / 130 gameDays, same ts,
  starvation 0, wrapped false, installed false, lines 0).
- Note the det-gate baselines themselves already show the
  base shift: the unwrapped census baseline reads 152d on
  the control leg and 130d on the test leg; the narration-
  on plain baseline reads 168d on control and 130d on
  test. The recorder-neutrality finding (both gates PASS on
  both legs) is separate from the verdict and does not
  re-score it.

## Fight-ID rule (applied, not just stated)

`Game.emit` calls `Date.now()` per log entry and the
harness `Date.now()` is a per-load call counter, so
narration-on's extra emits shift later fight-ID
timestamps. On the test leg, w4dmg and nonworldkill
sections are raw-unequal between modes and stripped-equal
— the known timestamp-prefix signature, identical in kind
to diverge73677-a's current-base finding. On the control
leg, every section is stripped-unequal too, so the control
divergence is NOT a timestamp artifact. The prefix strip
was applied to every comparison in this arm (via the
analyzer's `stripFightIds`); no trajectory difference is
claimed from raw fight-ID hashes anywhere here.

## Host flap + FIFO transport (disclosed in full)

This arm's wall-clock time was dominated by a container
EPERM write flap, not by sims. What happened, in order:

- The flap first hit rep-file copies on the control leg
  (shell `cp` and node `copyFileSync`/`writeFileSync` to
  new or flap-created files failed with EPERM while the
  long-running sweep process's own writes to pre-existing
  files kept succeeding). Control rep copies were recovered
  with dedicated re-runs plus hardlinks (linking a final
  file that already held that rep's exact bytes — the
  linked content's MD5 was verified against the rep's own
  run output, never copied from another rep).
- A failed `git checkout` to `c04d4e0cb` mid-flap
  truncated `src/js/game.js` to 0 bytes and left
  `c04d4e0cb` files untracked in the worktree. Recovery:
  the truncated file was restored from the `c8770e7f`
  blob with hash verification (blob `b2ba423a…`), the
  leftover untracked files were deleted (their content is
  committed at `c04d4e0cb`, so nothing was lost), and the
  checkout then completed cleanly — verified by
  `git rev-parse HEAD` = `c04d4e0cb` and worktree
  `game.js` hash = `c04d4e0cb` blob `bfa36319…`, with
  `git status` showing only the corpus dir untracked.
- A stale 0-byte ref file
  `.git/refs/heads/__r54probe__.tmp` (a runtime probe
  leftover, not a real ref — real refs never end in
  `.tmp`) blocked the return checkout with "bad object".
  It was deleted (0 bytes, never a ref target) and the
  checkout then completed to branch `sim-cdemit-bisect`
  at `149ed89c5` with status clean apart from the corpus.
- On the test leg, sweep writes to regular files failed
  persistently (8-attempt `writeFileRetry` exhausted,
  every rep) while small probe writes intermittently
  succeeded — probes proved useless as predictors. The
  workaround that worked, with the verbatim sweep scripts
  UNMODIFIED: the sweep's output paths were replaced by
  FIFOs (named pipes). A small reader process per output
  file read the row bytes out of the pipe (pipe writes are
  not file writes) and persisted them to the rep file
  with unbounded retries until the byte count matched.
  Every test-leg rep file was produced this way; every
  persisted file was then verified by size, JSON parse,
  and headline fields, and the proof validator re-derives
  every verdict number from those files. The FIFO
  transport changes no measurement: the sweep scripts,
  the recorders, the policy, and the row bytes are
  identical to a direct file write — only the delivery
  path differs, because the host would not accept the
  direct path. No game code, recorder, or sweep script was
  edited for this; the restored raidtrace files were
  removed before returning to the branch, as planned.
- Proof-script bug found and fixed in this arm (see
  "Metric review"): the validator's transcript-doc
  byte-identity check indexed the doc array off by one,
  reporting `false` for docs that are in fact identical.
  The fix is a one-line index correction; the corrected
  proof re-runs 40 PASS, 0 FAIL, and direct string
  comparison confirms all docs byte-identical within mode
  on both legs. The bug affected only the validator's
  display flag, never any verdict field (verdict fields
  use the armed rows, whose checks were correct).

## Villagers acting like people (brief, within scope)

This arm's corpus is a trajectory comparison, not a new
dialogue sample — and the test leg's transcript docs are
byte-identical across reps, so no new dialogue exists to
sample beyond what diverge73677-a already read (the same
raid-window lines, now with the current-base wall pattern
of three walls instead of raidtrace's two). Nothing
robotic, static, or repeated beyond the template itself
was flagged; the sense finding from raidtrace (walls
named but never quantified) is untouched by this arm and
is not re-judged here. The narration-mode difference
itself was the blank under measurement, and it is now
closed at `c04d4e0cb` by the bisection, not by a dialogue
judgment.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- Days/deaths/walls/won plus the stripped full-field
  `--diff` proved jointly sufficient here: the test leg
  agrees on the headline AND on every deeper field (ticks,
  faced, kill log, all five recorder sections stripped),
  which is what makes "trajectories agree" strong; the
  control leg disagrees on the headline AND on the
  stripped fields, which is what makes "real divergence"
  strong. A headline-only verdict would have been right
  on both legs here, but only the stripped comparison
  distinguishes a timestamp shift from a trajectory split
  — future divergence arms should keep pre-registering
  both, as this arm did.
- The agreement definition (headline + trajEq + zero tick
  diffs + all sections stripped-equal) handled the
  headline-vs-stripped distinction cleanly: no leg
  presented a mixed case (headline agreement with a
  stripped difference), so the definition's harder clause
  was never stress-tested by a real split. A future arm
  that DOES see headline agreement with a stripped tick
  difference should report it as a persisting stripped
  divergence, per this arm's definition, not as agreement.
- Instrument error found in THIS arm's proof validator
  (not in the reused sweep scripts or the `--diff`
  analyzer, which were verified correct throughout): the
  transcript-doc byte-identity check used array index
  `i+1` over a 0-based doc array, comparing against
  `docs[3]` (undefined) and reporting `false` for
  identical docs. Fixed by indexing `docs[i]` for
  `i in [1,2]`; re-run proof is 40 PASS, 0 FAIL with all
  doc flags true, and direct string comparison confirms
  zero within-mode variance on every file. Lesson: a
  validator's display flags need the same byte-level
  cross-check as its verdict fields — here the direct
  MD5 comparison caught it before the evidence was
  written.
- The balanced panel (`scripts/balance-panel.js`) has no
  corpus-ingest mode (standing limitation); the paired
  identical-seed tables and the `--diff` output are the
  comparison of record. No panel file was faked.
  `telemetry-check.js` was NOT run on recorder rows
  (recorder rows are not game telemetry; the proof
  validator re-derives every number from the corpus
  files instead).
- Host-infrastructure note for the next arm: on this host,
  a sweep's file write can fail persistently while probe
  writes succeed — a probe is NOT evidence the sweep will
  write. The FIFO transport in this arm's procedure
  section is the reusable form of that lesson for any
  future old-base arm that hits the same flap.

## Gates and checks

- Control bar: census rep1–3 152d/41/0 vs raidtrace
  152d/41/0 — REPRODUCES. Transcript rep1–3 168d/44/2 vs
  raidtrace 168d/44/2 — REPRODUCES. Control verdict:
  REPRODUCES (not a control failure; the bisection IS
  judged).
- Test agreement: headline + stripped agree on 3/3 pairs;
  first-divergence day null on 3/3 pairs; walls 3 == 3
  identical details on 3/3 pairs.
- Classification: test agreed numbers 130d/37/won/3 match
  the current-base figures — clean GO, not a collapse
  onto an old-base mode figure, not an unexplained shift.
- Determinism: within-mode byte-identical rows, docs, and
  armed rows, 3/3 reps each mode, both legs (same MD5
  within mode on every file).
- Det-gates: PASS on both legs, both recorders (see
  "Det-gates" above).
- Fight-ID rule: prefix strip applied to every
  comparison; test-leg raw-only diffs are timestamp
  prefixes only; control-leg stripped diffs are real.
- Old-base procedure: no commit while detached; returned
  to branch `sim-cdemit-bisect` at `149ed89c5`; status
  after return shows only the untracked corpus dir (plus
  this evidence file, committed below).
- Proof: `scripts/test-cdemit-bisect-a.js`: **40 PASS, 0
  FAIL** (after the one-line doc-index fix above; the
  count was re-verified after the fix and after this
  file was written).
- No src/js files touched, no recorder edited, no sweep
  script edited (FIFO transport only, see disclosure),
  no push, no version bump, no live verification by this
  arm.

## Files

- `evidence/2026-10-27/sim-cdemit-bisect-a-prereg.md`
  (pre-registration, committed before sweeping)
- `evidence/2026-10-27/sim-cdemit-bisect-a.md` (this file)
- `evidence/2026-10-27/perseed-cdemit-bisect-a/control/`
  (6 rep rows + 3 transcript docs + the run's own finals,
  which equal rep3)
- `evidence/2026-10-27/perseed-cdemit-bisect-a/test/`
  (6 rep rows + 3 transcript docs; finals are the rep3
  FIFOs' readers' outputs only via the rep files — the
  test dir holds rep files, not separate finals)
- `scripts/test-cdemit-bisect-a.js` (proof validator, as
  fixed)

## Specification (NOT a proposal — what a future narration claim would need to show)

A future claim that narration mode is trajectory-neutral
on any base at or after `c04d4e0cb` would need to show,
under this same measurement (same seed, same verbatim
scripts, same `--diff` with fightId-prefix stripping):
paired census/transcript agreement on headline fields AND
on the stripped full-field comparison (trajEq, zero tick
diffs, all recorder sections stripped-equal) across at
least 3 rep pairs per mode, with within-mode variance
reported, not averaged away. A headline-only match, or a
match claimed from raw (unstripped) fight IDs, does not
meet the bar this arm used. No change is proposed or
landed by this arm, and any narration/voice change itself
needs Steve's ruling.

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve
should playtest.

## Status

Committed in the worktree (see commit report); ready for
the coordinator to merge locally, pending ship. No push,
no version bump, no live verification by this arm.
