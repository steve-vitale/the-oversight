# sim-divergebase-a — the 73677 divergence DOES reproduce on the raidtrace base

Run: fleshout loop, run fleshout-20261027T0525Z, arm
`sim-divergebase-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no
game lever, no narration change. The specification line at the end
is specification only (a narration/voice fix needs Steve's ruling;
nothing is proposed here).

## Question

From `evidence/2026-10-27/sim-raidtrace-a.md` ("Transcript vs census"):
on the raidtrace substrate (tableseat-nowait, 180d death-aware),
seed 73677's census corpus (narration-off) read 152d / 41 deaths /
0 walls, while its transcript corpus (narration-on replay) read
168d / 44 deaths / 2 walls (seq35 d155, seq39 d168). Run
fleshout-20261027T0447Z (`sim-diverge73677-a`) then showed the
divergence does NOT reproduce on the current base (both modes
130d / 37 deaths / won / 3 walls, 3 reps each). This arm asks the
other half: does it reproduce on the RAIDTRACE BASE itself,
`c8770e7f4412aa6430d6daa3ce86e28484f0de20`?

## Headline answer

**Yes — it reproduces exactly, three rep pairs out of three.**
On the old base, seed 73677 reads the raidtrace numbers in both
modes, deterministically:

| Seed 73677, old base c8770e7f | Days | Deaths | Won | Walls |
|-------------------------------|------|--------|-----|-------|
| Census (narration-off), reps 1–3 | 152 | 41 | 0 | 0 |
| Transcript (narration-on), reps 1–3 | 168 | 44 | 0 | 2 |

Every rep pair differs on deaths (41 vs 44) and walls (0 vs 2),
in raidtrace's recorded direction (transcript higher on both),
so the pre-registered bar is met in 3/3 pairs, not just the
required majority of 2/3. The transcript doc is byte-identical
to raidtrace's own transcript doc. The armed rows match
raidtrace's rows on every field except the worktree directory
name embedded in stack-trace strings (below) — that is as
exact a reproduction as two different worktrees can produce.

## Verdict: DIAG-GO (reproduces on old base)

Per the binding pre-registration
(`evidence/2026-10-27/sim-divergebase-a-prereg.md`): DIAG-GO
iff census and transcript differ on deaths or walls in the
majority of rep pairs AND the direction matches raidtrace's
recorded direction (transcript more deaths and/or more
walls). Here: differing pairs 3/3, direction pairs 3/3. That
is the verdict — for the old base only. A GO here means the
divergence reproduces on the old base, NOT that any game
change is approved, and NOT that any commit caused anything
(see "What this means for the base-move hypothesis").

## Method (verbatim reuse, old-base procedure)

- Preregistration written and committed FIRST, before any
  sweep, on branch `sim-divergebase-a` (commit `c17b1031`,
  prereg + proof validator; the commit itself is correct —
  the worktree index then showed the known bogus staged-
  deletion clobber on both committed files and was repaired
  with `git update-index --cacheinfo` from the HEAD blobs,
  after which `git status` was empty).
- THEN `git checkout c8770e7f4412aa6430d6daa3ce86e28484f0de20`
  (detached, measurement only) and the sims ran; corpus
  files are untracked so they survived the checkouts. THEN
  `git checkout sim-divergebase-a` to return. NEVER
  committed while detached. No push, no version bump, no
  live verification.
- One procedure correction, disclosed in full: the raidtrace
  sweep (`scripts/test-raidtrace-a-sweep.js`) and emit
  recorder (`scripts/policies/raidtrace-diag.js`) do NOT
  exist at commit `c8770e7f` itself — they were new files
  created by the raidtrace arm ON TOP of that base (its
  worktree HEAD at arm start). They were restored onto the
  detached checkout verbatim from this branch with
  `git checkout sim-divergebase-a -- <those two files>`
  and never committed there. That restore is exact, not
  approximate, and it was verified before sweeping:
  `git log c8770e7f..sim-divergebase-a` for both files
  shows exactly one commit each (the raidtrace commit
  `fd3bcd83d`) — the branch versions ARE the raidtrace
  versions, unedited since. The rest of the instrument
  stack is identical across the range: `git log` for
  `scripts/test-seq51gap-diag-sweep.js`,
  `scripts/sim-harness.js`,
  `scripts/policies/tableseat-nowait.js`,
  `scripts/policies/seq51gap-diag.js`, and
  `scripts/policies/w4dmg-diag.js` across
  `c8770e7f..sim-divergebase-a` is EMPTY. So the old-base
  runs used old game code + the old harness + the old
  seq51gap sweep + the verbatim raidtrace recorder and
  sweep — the raidtrace arm's own setup, not a hybrid.
- Census mode: `scripts/test-seq51gap-diag-sweep.js --one
  armed 73677` (narration-off, seq51gap-a armed recorders),
  EVID redirected to
  `evidence/2026-10-27/perseed-divergebase-a/`. Three reps;
  each rep's output copied to `s73677-census-rep<N>.json`
  immediately, so no rep overwrites another.
- Transcript mode: `scripts/test-raidtrace-a-sweep.js
  --transcript 73677` (narration-on, same armed recorders +
  raidtrace-diag emit recorder), same EVID. Three reps;
  armed rows copied to `s73677-transcript-armed-rep<N>.json`,
  transcript docs to `s73677-transcript-doc-rep<N>.json`.
- Walls counted exactly as raidtrace counted them:
  C2-palisade-wall + C2?-wall-amount-only steps from
  `traceSeq` on the run's own armed row.
- Comparison: the diverge73677-a analyzer
  (`scripts/test-diverge73677-a-sweep.js`, `--diff` per rep
  pair) reused verbatim, never edited, plus the new proof
  validator `scripts/test-divergebase-a.js` (re-derives
  every number below from the corpus rows).
- Each seed-run took ~50–55s. Total sweep time for 6 runs:
  ~5 min plus analysis.

## Per-rep table (old base)

| Rep pair | Census days / deaths / won / walls | Transcript days / deaths / won / walls | Differs? | Direction (transcript higher)? |
|----------|--------------------------------------|------------------------------------------|----------|-------------------------------|
| 1 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | yes |
| 2 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | yes |
| 3 | 152 / 41 / 0 / 0 | 168 / 44 / 0 / 2 | yes | yes |

Full trajectory fields, identical across all three pairs:

- Census: days 152, gameDays 152, endReason village-lost,
  won 0, wave 4, maxArc 4, finalRank regional, maxRank
  global, nationalEver 1, nationalFinal 0, table 1,
  entered 0, deaths 41, starvation 0, finalPop 2,
  finalPantry 0, finalKnown 60, ticks 151, walls 0.
- Transcript: days 168, gameDays 168, endReason
  village-lost, won 0, wave 4, maxArc 4, finalRank regional,
  maxRank global, nationalEver 1, nationalFinal 0,
  table 1, entered 0, deaths 44, starvation 0, finalPop 2,
  finalPantry 1000, finalKnown 59, ticks 167, walls 2.

Cross-mode `--diff` (same on all three pairs): trajectory
fields differ on days, gameDays, deathTotal, finalPantry,
finalKnown; deaths breakdown, faced map, and kill log all
differ; ts equal; tick diffs 36; **first tick diff day
134**; all recorder sections (w4dmg, wave4enc, spawnsrc,
fieldfinish, nonworldkill) differ even after fightId-prefix
stripping — this is a real trajectory divergence, not the
current base's timestamp-only difference. Transcript walls,
identical across pairs: seq35 raid day 155 (850 → 637,
-213, tier 3) and seq39 raid day 168 (1200 → 900, -300,
tier 3) — exactly raidtrace's two walls.

## Determinism (within-mode, old base)

All three census rows are byte-identical (same MD5), all
three transcript armed rows are byte-identical, and all
three transcript docs are byte-identical. There is no
run-to-run variance to attribute anything to: within-mode
variance is zero on every field. The divergence is a
stable property of the old base's narration modes, not a
flaky run.

## How exact is "exact" (comparison against raidtrace's own rows)

- Transcript doc: **byte-identical** to raidtrace's
  `s73677-transcript.json` (same MD5) — 16,099 total
  lines, 16 raid days, 16 palisade raid lines.
- Census armed row vs raidtrace's `s73677-armed.json`:
  48 field diffs, and ALL 48 are `stackLines` strings
  whose only difference is the worktree directory name
  (`sim-raidtrace-a` vs `sim-divergebase-a`) — file names,
  function names, and line numbers are identical.
- Transcript armed row vs raidtrace's
  `s73677-transcript-armed.json`: 49 field diffs, and
  ALL 49 are the same stackLines worktree-path strings.
- Every trajectory field, every tick, every faced count,
  every kill-log entry, every fight ID (including the
  timestamp prefixes: census `fmgpsphqo_…`, transcript
  `fmgpspj9f_…`, matching raidtrace's and diverge73677-a's
  recorded prefixes) agrees. The reproduction is exact
  modulo the directory the run happened to sit in.

## What this means for the base-move hypothesis

Diverge73677-a (current base): no divergence (both modes
130d / 37 / won / 3 walls). This arm (old base):
divergence, exactly as raidtrace recorded it. The
divergence exists on the old base and not on the current
base. Combined with the verified fact that commit
`c04d4e0cb` (journey-scale r42 bystander-hold fix,
`src/js/game.js`, 17 lines) is the SOLE `src/js` change
between raidtrace's base and the current branch, that
IMPLICATES but does NOT prove `c04d4e0cb` as the cause.
Say exactly that: the base move is identified to one
commit, causation is not established. The bystander-hold
fix touches exactly the wave-4 lingerer lifecycle at the
heart of this seed's story (raids, lingering monsters,
table fights), so it remains mechanically plausible as
the trajectory mover — but plausibility is not proof,
and no claim stronger than "sole `src/js` change in
range" is made here. Causation needs a bisection, which
this arm does not run (see gate below).

## C/D emit bisection gate (as pre-registered)

The C/D bisection (diverge73677-a prereg arms C and D)
runs ONLY if the divergence reproduces on the old base,
and never otherwise. It HAS now reproduced — so the gate
is OPEN for a future arm (on the old base, under its own
preregistration) to run the C/D bisection and name the
mechanism. No C/D bisection runs in THIS arm: this arm's
job was the old-base reproduction test alone, and it
does not expand into attribution work. The future arm's
bar is already specified below; nothing here proposes a
narration fix.

## Villagers acting like people (brief, within scope)

This arm's corpus is a trajectory comparison, not a new
dialogue sample — and the transcript doc is byte-identical
to raidtrace's, so no new dialogue exists to sample: the
raid-window lines are the same lines raidtrace already
read and classified (raid lists, the generic toll sentence,
the "Nobody met X" lines). One line quoted as a spot
check that the doc is what it claims to be: "🐗 RAID — 4
raiders (The Paparazzo, Hushpuppy, The Understudy, Judge
Hoot) hit Haven in the night, drawn by the smell of the
pantry! No walls. No warning but the noise." Nothing
robotic, static, or repeated beyond the template itself
was flagged; the sense finding from raidtrace (walls
named but never quantified) is untouched by this arm
and is not re-judged here. The narration-mode difference
itself is the blank under measurement, not a dialogue
quality judgment.

## Metric review (for the NEXT run; pre-registration is never re-scored)

- Days/deaths/walls/won proved sufficient as the verdict
  fingerprint here BECAUSE the full-field `--diff` backed
  it: the pairs differ on ticks (36 diffs, first day 134),
  faced, kill log, and every recorder section even after
  fightId-prefix stripping. A days-only verdict would
  have been right here, but only the full-field comparison
  proves the difference is a trajectory divergence rather
  than a bookkeeping quirk — future divergence arms
  should keep pre-registering the full-field comparison
  alongside the headline fields, as this arm did.
- The majority-of-pairs rule handled within-mode variance
  trivially here (variance was zero). Had reps disagreed
  within a mode, the rule as written would still judge
  by pairs, with the variance named alongside — that
  held up in writing, but it was never stress-tested by
  real variance. A future arm that DOES see within-mode
  variance should pre-register whether a split pair
  counts before sweeping, not after.
- Instrument note for the next arm: the raidtrace sweep
  and recorder do not exist at the pinned base commit
  itself — they are new files from the raidtrace arm.
  Any future old-base arm must restore them verbatim the
  way this arm did (and verify, via `git log` over the
  range, that they are unedited since the raidtrace
  commit and that the rest of the instrument stack is
  unchanged), or it will mistake a missing-file error
  for a base result. This arm's procedure section is the
  reusable form of that lesson.
- The balanced panel (`scripts/balance-panel.js`) has no
  corpus-ingest mode (standing limitation); the paired
  identical-seed tables and the `--diff` output are the
  comparison of record. No panel file was faked.
  `telemetry-check.js` was NOT run on recorder rows
  (recorder rows are not game telemetry; the proof
  validator re-derives every number from the corpus
  files instead).
- Direction-slip note: the assignment brief's verdict
  parenthetical ("transcript fewer deaths/walls")
  contradicts raidtrace's own corpus rows (transcript
  higher: 168/44/2 vs 152/41/0). The preregistration
  flagged this BEFORE sweeping and judged "matches
  raidtrace's direction" as transcript higher. That
  pre-sweep clarification is what made the verdict
  well-defined; a future brief should quote raidtrace's
  recorded numbers rather than a direction word.

## Gates and checks

- Reproduce (old base): census rep1 152d/41/0 vs raidtrace
  152d/41/0 — REPRODUCES. Transcript rep1 168d/44/2 vs
  raidtrace 168d/44/2 — REPRODUCES.
- Determinism: within-mode byte-identical rows, 3/3 reps
  each mode (same MD5 within mode).
- Cross-mode: trajectories differ on all 3 rep pairs;
  differing pairs 3/3, direction pairs 3/3; first tick
  diff day 134 on all 3 pairs; walls 0 vs 2 identical
  details on all 3 pairs.
- Raidtrace-row comparison: transcript doc byte-identical;
  armed rows differ ONLY in stackLines worktree-path
  strings (48 census / 49 transcript diffs, all
  stackLines).
- Old-base procedure: no commit while detached; returned
  to branch `sim-divergebase-a` at `c17b1031`; status
  after return shows only the untracked corpus dir.
- Proof: `scripts/test-divergebase-a.js`: **31 PASS, 0 FAIL**
  (run after this file was written so its presence checks read the
  final text; the count above was then written into this bullet and
  the proof re-run clean — see commit report).
  see commit report).
- No src/js files touched, no recorder edited, no new
  recorder built (C/D gate opens for a future arm, not
  run here), no push, no version bump, no live
  verification by this arm.

## Files

- `evidence/2026-10-27/sim-divergebase-a-prereg.md`
  (pre-registration)
- `evidence/2026-10-27/sim-divergebase-a.md` (this file)
- `evidence/2026-10-27/perseed-divergebase-a/` (6 rep
  rows + 3 transcript docs + the run's own
  `s73677-armed.json` / `s73677-transcript-armed.json` /
  `s73677-transcript.json` finals, which equal rep3)
- `scripts/test-divergebase-a.js` (proof validator)

## Specification (NOT a proposal — what a future attribution arm would need to show)

A future arm running the now-un-gated C/D bisection on
the old base would need to show, under this same
measurement (same seed, same verbatim scripts, same
`--diff` with fightId-prefix stripping): a first-
divergence day (already measured here: day 134) where
the stripped trajectories first differ, plus a C/D
bisection whose winning class names a specific code path
(a `Game.log` read, a say-execution side effect, or a
clock-derived ID consumer) reachable from the divergence
window's emit lines — and then, to close the base-move
question, a run showing whether that mechanism's effect
vanishes under commit `c04d4e0cb` alone. A fightId-
timestamp difference alone does not count as a trajectory
divergence. No change is proposed or landed by this arm.

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve
should playtest.

## Status

Committed in the worktree (see commit report); ready for
the coordinator to merge locally, pending ship. No push,
no version bump, no live verification by this arm.
