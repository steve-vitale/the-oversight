# sim-diverge73677-a — the 73677 transcript-vs-census divergence, re-run: it does not reproduce on the current base

Run: fleshout loop, arm `sim-diverge73677-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no
game lever proposed, no narration/voice fix proposed. The specification
line at the end is specification only (a narration/voice fix needs
Steve's ruling; nothing is proposed here).

## Question

From `evidence/2026-10-27/sim-raidtrace-a.md` ("Transcript vs census"):
on the raidtrace substrate (tableseat-nowait, seeds 73671–73678, 180d
death-aware), seed 73677's census corpus (narration-off) read 152d /
41 deaths / 0 walls, while its transcript corpus (narration-on replay)
read 168d / 44 deaths / 2 walls (seq35 d155, seq39 d168). All other 7
seeds matched exactly. This arm asks: does that divergence reproduce
on the current worktree base, and what attributes it?

## Headline answer

**It does not reproduce — and on the current base there is no
divergence left to attribute.** Fresh on the current base, seed 73677
reads the SAME trajectory in both modes, three reps each, byte-identical
within each mode:

| Seed 73677, current base | Days | Deaths | Won | Walls |
|--------------------------|------|--------|-----|-------|
| Census (narration-off), reps 1–3 | 130 | 37 | 1 | 3 |
| Transcript (narration-on), reps 1–3 | 130 | 37 | 1 | 3 |

The raidtrace values (152d/41/0 census, 168d/44/2 transcript) are gone
in BOTH modes. The only narration-mode difference left on the current
base is in fight-ID timestamps (below) — game state, deaths, ticks,
field fights, faced monsters, kill log, and walls are identical. Arm 3
(the C/D emit bisection) did not trigger: its pre-registered condition
is "both modes reproduce deterministically AND still diverge," and the
modes do not diverge on trajectory here. No C/D recorder was built for
a condition that did not trigger, and no narration fix is proposed.

## Verdict: DIAG-NO-GO (does not reproduce)

Per the binding pre-registration
(`evidence/2026-10-27/sim-diverge73677-a-prereg.md`): DIAG-GO requires
the divergence attributed to a NAMED mechanism with the
first-divergence day and repeat counts shown; "does not reproduce" is
explicitly a DIAG-NO-GO branch. That is the verdict here — for the
raidtrace divergence as recorded. Two narrower, positive findings ride
alongside it and are NOT a re-score of the verdict:

1. **The current-base narration effect is fully characterized** (see
   "The only remaining narration-mode difference" below): fight-ID
   timestamp prefixes shift with emit's harness-clock consumption,
   and nothing else moves. That is a named mechanism for the observed
   cross-mode difference on this base — but it is NOT an attribution
   of raidtrace's trajectory divergence, which no longer exists to
   bisect.
2. **The base move is identified to a single commit** (see "Why the
   old numbers are gone" below): the sole `src/js` change between
   raidtrace's pinned base and this worktree's HEAD. Causation of this
   seed's specific shift by those lines is NOT separately proven
   (that would need an old-base run, which is a future arm's job, not
   this one's — see "Follow-up for the coordinator").

The raidtrace verdict itself is NOT re-judged here (transcript
denominator, 16 walls, toll-quantified 0/16 stand as written). This
arm judges only the 73677 divergence's reproducibility, and it fails
that test on the current base.

## Method (verbatim reuse, no recorder edits)

- Census mode: `scripts/test-seq51gap-diag-sweep.js --one armed 73677`
  (narration-off, seq51gap-a armed recorders), EVID redirected to
  `evidence/2026-10-27/perseed-diverge73677-a/`. Three reps; each
  rep's output copied to `s73677-census-rep<N>.json` immediately, so
  no rep overwrites another.
- Transcript mode: `scripts/test-raidtrace-a-sweep.js --transcript
  73677` (narration-on, same armed recorders + raidtrace-diag emit
  recorder), same EVID. Three reps; armed rows copied to
  `s73677-transcript-armed-rep<N>.json`, transcript docs to
  `s73677-transcript-doc-rep<N>.json`.
- Walls counted exactly as raidtrace counted them: C2-palisade-wall +
  C2?-wall-amount-only steps from `traceSeq` on the run's own armed
  row.
- Comparison: new analyzer `scripts/test-diverge73677-a-sweep.js`
  (`--diff` per rep pair, `--compare` across reps) + proof validator
  `scripts/test-diverge73677-a.js` (re-derives every number below
  from the corpus rows).
- Each seed-run took ~43–48s. Total sweep time for 6 runs: ~4.5 min
  plus analysis.

## Reproduce arm (arm 1) — the numbers

Raidtrace values (read from its own corpus rows, not quoted from its
prose): census 152d / 41 deaths / village-lost / entered 0; transcript
168d / 44 deaths / 2 walls. Fresh on current base (rep 1): census
130d / 37 deaths / over-other / won 1 / entered 1 / table path feared,
seat taken day 130; transcript 130d / 37 deaths / won 1 / 3 walls.
Neither mode reproduces its raidtrace value. Per the prereg, that IS
the result — no re-running was done hoping for the old numbers; the
arm-2 repeats below are reported as repeats, and they agree with rep 1
exactly.

## Determinism arm (arm 2) — byte-identical within each mode

All three census rows are byte-identical (same SHA-256), all three
transcript armed rows are byte-identical, and all three transcript
docs are byte-identical. There is no run-to-run variance to attribute
anything to: within-mode variance is zero on every field, including
fight IDs, ticks, and all recorder sections. The nondeterminism branch
of the prereg therefore does not trigger either — the fresh runs are
deterministic, they simply land on a different trajectory than
raidtrace's runs did, in both modes alike.

## Cross-mode comparison (rep pairs 1, 2, 3 — identical result each time)

For every rep pair, the `--diff` analyzer reports:

- Trajectory fields equal: days 130/130, gameDays 130/130, endReason
  over-other, won 1/1, wave 4, maxArc 4, finalRank global, maxRank
  global, nationalEver 1, nationalFinal 1, table 1, entered 1,
  deathTotal 37, starvation 0, finalPop 8, finalPantry 14868,
  finalKnown 39.
- Deaths breakdown equal, faced map equal (36 monster types, identical
  counts), kill-log entries equal (31 entries), table-seat context
  equal (tsNationalDay 77, seat taken day 130, lesser seat, feared
  path, 5 table answers).
- Ticks: 129/129, tick days identical, **zero tick diffs** — there is
  no first-divergence day, because the trajectories never diverge.
  (The prereg's first-divergence definition therefore yields null on
  all three pairs; that null is the finding, not a missing value.)
- Walls: 3 == 3, identical details — seq39 raid day 103 (850 → 637,
  -213, tier 3), seq39 raid day 111 (637 → 424, -213, tier 3), seq42
  raid day 121 (1300 → 975, -325, tier 3). Note these are NOT
  raidtrace's 73677 walls (its transcript walls were seq35 d155 and
  seq39 d168; its census walls were 0): the whole wall pattern moved
  with the base.
- Recorder sections: wave4enc, spawnsrc, fieldfinish raw-equal;
  w4dmg and nonworldkill raw-unequal ONLY in fightId timestamp
  prefixes (below); with fightId prefixes stripped, ALL sections are
  equal.

## The only remaining narration-mode difference (named, quantified)

Every tbEnd / nonworldkill fightId differs between modes in exactly
one place: the timestamp prefix. Example, first tbEnd fightId:

- Census: `fmgpsphqo_4yyjms`
- Transcript: `fmgpspj9f_4yyjms`

The random suffix (`4yyjms`, RNG-stream-derived) is identical; the
timestamp prefix (base-36 `Date.now()` from the harness's counting
clock) is larger in transcript mode. The mechanism is visible in code
and needs no inference: `Game.emit` calls `Date.now()` for each log
entry's timestamp (`src/js/game.js` emit → `makeLogEntry(msg, surface,
Date.now())`), and the sim harness's `Date.now()` is a per-load call
counter (`scripts/sim-harness.js`: `FIXED_BASE + per-loadGame call
count`). Narration-on emits ~12,449 lines on this seed (transcript
doc totalLines, identical across reps); each emit consumes one clock
tick, so every fight ID generated after narration starts carries a
larger timestamp than its census twin. The harness's own comment says
no game logic branches on wall-clock values (IDs only), and this seed
bears that out: identical timestamps would change nothing else, and
the trajectories are identical with shifted timestamps. This is the
complete narration-mode effect on the current base — an ID-timestamp
shift, not a trajectory divergence.

Excluded as causes of any trajectory difference on this base (by the
comparison itself, not by code reading alone): `Game.log` accumulation
(the log fills in transcript mode and stays empty in census mode, yet
every game-state field agrees), `sayGated` counters, the feel.js `say`
wrap (`_feel` is write-only), feedback surfaces, and System-voice
lookup (fire-and-forget async, no value returned to game logic).
Static exclusions from the prereg stand; the comparison adds the
empirical exclusion of log accumulation.

## Why the old numbers are gone (base move, identified to one commit)

Raidtrace pinned its base at `c8770e7f4412aa6430d6daa3ce86e28484f0de20`
and verified game code unchanged since the seq51gap base. This
worktree's HEAD is `b882d67de5749ee46f4ce189ccc8ffaf466aefa5`, and
`c8770e7f` is an ancestor of HEAD. The `git log` for `src/js/` across
that range contains exactly ONE commit:

- `c04d4e0cb` — "journey-scale r42: bystander hold fix +
  removal-site measurement [needs-eyes]" — `src/js/game.js`, 17 lines
  changed (plus evidence/scripts for its own measurement).

What it does, in plain words: when a turn-based fight starts, the game
used to lift the monster standing on the player's tile off the world
map even when that monster was not actually in the fight (a bystander
during a contest or trial fight) — and if the fight was won, the
bystander was never put back, so full-health wave-4 lingerers vanished
silently. The fix lifts the tile monster only when it is one of the
fight's monsters, and records it as the fight's world origin only then.
That touches exactly the wave-4 lingerer lifecycle at the heart of
seed 73677's story (raids, lingering monsters, table fights), so it is
mechanically plausible as the trajectory mover — but plausibility is
not proof: this arm did not run the old base, so the claim here is
only "sole `src/js` change in range," not "these 17 lines caused the
152→130 shift." Any claim stronger than that needs an old-base run.

## Villagers acting like people (brief, within scope)

This arm's corpus is a trajectory comparison, not a sense sample — no
new dialogue sample was required, and none is claimed. The one
narration artifact read closely is the transcript doc's raid lines
(10 palisade raid lines, identical across reps); they are the same
raid-window lines raidtrace classified, and nothing in this arm's
comparison touches villager dialogue quality. The sense finding from
raidtrace (walls named but never quantified) is untouched by this arm
and is not re-judged here.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- Days/deaths/walls proved too coarse as a trajectory fingerprint on
  its own: the fresh runs agree on those AND on every deeper field
  (ticks, faced, kill log, recorder sections), which is what makes the
  "trajectories agree" claim strong. A future divergence arm should
  pre-register the full-field comparison (as this arm's `--diff` does)
  rather than days/deaths/walls alone — a days-only match could hide
  a real divergence, and a days-only mismatch (as here vs raidtrace)
  cannot say where the trajectories parted.
- The C/D interpretation table in the prereg was written for a world
  in which the modes diverge; it never fired. Its classes (log
  accumulation / say-execution / harness-clock) remain a sound ladder
  for a future arm that DOES find a divergence — but the clock class
  now has a known, quantified signature (fightId timestamp shift)
  that a future arm must strip before claiming a trajectory difference,
  or it will mistake ID timestamps for divergence. The `--diff`
  analyzer's prefix-strip is the reusable form of that lesson.
- The fightId timestamp shift also means: any future corpus comparison
  that hashes rows raw will report "different" across narration modes
  even when trajectories agree. Compare stripped, report raw
  separately — as this arm does.
- The balanced panel (`scripts/balance-panel.js`) has no corpus-ingest
  mode (standing limitation); the paired identical-seed tables and the
  `--diff` output are the comparison of record. No panel file was
  faked. `telemetry-check.js` was NOT run on recorder rows (recorder
  rows are not game telemetry; the proof validator re-derives every
  number from the corpus files instead).

## Gates and checks

- Reproduce: census rep1 130d/37/won vs raidtrace 152d/41 — DOES NOT
  REPRODUCE (reported, not re-run for the old numbers). Transcript
  rep1 130d/37/won vs raidtrace 168d/44 — DOES NOT REPRODUCE.
- Determinism: within-mode byte-identical rows, 3/3 reps each mode.
- Cross-mode: trajectories agree on all 3 rep pairs; first-divergence
  day null on all 3 pairs; walls 3 == 3 identical details.
- FightId signature: random suffix identical, timestamp prefix larger
  in transcript mode, on the first tbEnd and (by section comparison)
  throughout w4dmg/nonworldkill.
- Proof: `scripts/test-diverge73677-a.js`: **37 PASS, 0 FAIL**
  (run after this file was written so its presence checks read the
  final text; the count above was then written into this bullet and
  the proof re-run clean — see commit report).
- No src/js files touched, no recorder edited, no new recorder built
  (arm 3 did not trigger), no push, no version bump, no live
  verification by this arm.

## Files

- `evidence/2026-10-27/sim-diverge73677-a-prereg.md` (pre-registration)
- `evidence/2026-10-27/sim-diverge73677-a.md` (this file)
- `evidence/2026-10-27/perseed-diverge73677-a/` (6 rep rows + 3
  transcript docs + the run's own `s73677-armed.json` /
  `s73677-transcript-armed.json` / `s73677-transcript.json` finals,
  which equal rep3)
- `scripts/test-diverge73677-a-sweep.js` (new analyzer: `--diff`,
  `--compare`)
- `scripts/test-diverge73677-a.js` (proof validator)

## Specification (NOT a proposal — what a future attribution arm would need to show)

A future arm bisecting a narration-mode trajectory divergence (if one
is found on some base) would need to show, under this same measurement
(same seed, same verbatim scripts, same `--diff` with fightId-prefix
stripping): a first-divergence day where the stripped trajectories
first differ, plus a C/D bisection whose winning class names a
specific code path (a `Game.log` read, a say-execution side effect, or
a clock-derived ID consumer) reachable from the divergence window's
emit lines. A fightId-timestamp difference alone is already measured
here and does not count as a trajectory divergence. No change is
proposed or landed by this arm.

## Follow-up for the coordinator (findings for the backlog; NOT appended by this arm)

- The raidtrace 73677 divergence (152/41/0 vs 168/44/2) is an open
  instrument question again: it exists on the raidtrace base and not
  on the current base. A future arm could run seed 73677 on the
  raidtrace base in its own worktree (old-base reproduction) and, if
  it reproduces there, run the preregistered C/D bisection there —
  that arm needs its own preregistration; this arm's preregistration
  does not transfer to another base.
- The bystander-hold fix (`c04d4e0cb`) is the sole base move in range
  and is mechanically plausible as the trajectory mover for this seed;
  confirming or refuting that for seed 73677 specifically is the same
  old-base arm's job, not a claim made here.

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve should playtest.

## Status

Committed in the worktree (see commit report); ready for the
coordinator to merge locally, pending ship. No push, no version bump,
no live verification by this arm.
