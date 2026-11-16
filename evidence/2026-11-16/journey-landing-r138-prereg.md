# journey-landing r138 — PREREG (Lane A, leg 0 LANDING)

**Run id:** journey-landing-20261116T0423Z (scheduled Sun 2026-11-15 21:45 CST).
**Base:** local master at run start (`2a7d3c857`, journey endgame r219 + journey-scale r219).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; heartbeat re-armed every <15 min for the whole run.
Lock: no stale lock (none present at run start); fresh lock created 2026-11-16T04:24Z.

## Q1 (PRIMARY) — verbatim-repeat counter: exempt the deliberate re-pose (r137 metric-review proposal)

r137's panel took the want-thread resume 8 times; all 8 re-posed the
question, and the driver's MET `verbatimRepeats=4` on r137 are exactly
those re-posed questions whose text equals the opener (seeds 1146, 1147,
1148, 1150 — verified against the saved r137 corpus this run before
writing the fix: each sitting's opener is a single THEM line, the
curious question itself; the resume take `alive:thread:want` is followed
immediately by the same question text).

The re-pose IS a repeat by design — the NPC asks again because the
player came back ("We never finished —"). The counter must exempt it,
or every future panel pays a false verbatim flag for a fix that works.

### Rule (R138, driver-only instrument change, zero src/js)

A duplicate THEM line in a sitting is EXEMPT when ALL hold:
1. this sitting took a want-thread resume (`alive:thread:want` ≥ 1), AND
2. the line's FIRST occurrence is one of the sitting's opener THEM lines
   (index < `_startThem.length` in the sitting's normalized THEM lines).

Why these two, and no more:
- The opener set is tiny (usually the curious question alone) and the
  only engine path that re-speaks an opener line mid-sitting is the
  r137 re-pose (the generic resume line is a NEW line; beats are
  ledger-blocked from repeating in-sitting). A '?' test was considered
  and REJECTED: one of the four r137 re-poses ends in a period
  ("What's your first memory? Like, ever. The earliest thing.") — a
  ends-with-'?' test would false-negative it.
- At most ONE duplicate occurrence per distinct line per sitting is
  exempt (the thread is SPENT after one resume; a third speaking of
  the same line would be a real repeat and still counts).
- Exempted lines are counted separately (`MET.verbatimRepeatsExempted`)
  and logged (`RE-POSE EXEMPT`) so an explosion stays visible; the
  run note spot-checks each exempted line against its transcript.

### Implementation

- New shared module `scripts/landing-verbatim.js` exporting
  `splitVerbatimDupes(dupes, themNorm, openerCount, resumeTakes)` →
  `{ real, exempted }`. The driver requires it; the proof test imports
  the SAME function (no duplicated predicate to drift).
- r138 driver = r137 driver verbatim except OUTDIR
  `landing-r138-after`, header, and the exemption wiring (MET
  `verbatimRepeatsExempted: 0`, per-sitting `_resumeBefore` snapshot,
  verbatim block replaced by the split + accounting + logging).
- Proof test `scripts/test-landing-r138-verbatim-repose-20261116.js`:
  scripts a REAL re-pose sitting (Liam shape, mirrored on the r137
  proof test: curious opener → deflect_q → change subject → take
  `alive:thread:want`) via startConvo/convoTurn, then asserts on the
  real transcript via the shared function:
  1. re-posed question duplicate → exempted 1, real 0.
  2. Control (same transcript, resumeTakes=0) → real 1, exempted 0.
  3. Control (same transcript, openerCount=0) → real 1, exempted 0.
  4. Control (synthetic duplicate of a mid-sitting non-opener line)
     → that dupe is real, not exempt.
  5. Control (synthetic third speaking of the question) → only 1
     exempted, the extra counts as real.
  6. Guard: the shared function never mutates its inputs.
- Panel watch (Q2): `verbatimRepeats` must read 0 on the r138 panel
  with `verbatimRepeatsExempted` equal to the re-poses observed; any
  exempted line that is NOT a re-posed opener question on spot-check
  is a Q1 failure on live data.

## Q2 — Fresh landing panel (regression watch)

Driver: the r138 driver (r137 + Q1 exemption). Seeds 1142–1151,
DAYS=28. Corpus in goal hidden_files
`evidence/2026-11-16/landing-r138-after/`. Master has moved since r137
(endgame r219 + scale r219: goon-tag fix, gate adjudication) — this
panel is the regression watch on the new master AND the before/after
for the Q1 exemption (r137: verbatimRepeats 4, all re-poses; r138 must
read verbatimRepeats 0 with the same re-poses exempted).

**Bars (bind, judged against r132/r134/r135/r136/r137):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; **HEED-V = 0 BINDS**.
- M-PR1: max per-seed never-offered ≤ 1 (r129 bar).
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached REPORTED only (r137 proposal adopted: the
  carried six-panel shape — exactly 1 per panel — broke on r137
  (0); the premise is a small-sample artifact, not a law. No bar
  binds it from this run).
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Q1 panel watch: resume-takes of deflected question-wants re-pose
  the question (answers offered next menu) — report the count; a take
  that still ends in the generic acknowledgment is a Q1 failure on
  live data. verbatimRepeats 0, verbatimRepeatsExempted = re-poses.
- Scholar deaths: WATCH (r137: 2 scholar deaths, succession latency
  0 and 1 day). Report the count and latency; no bar binds yet — if
  it recurs a third panel running, it earns a metric.
- Pilot first: seeds 1142–1145; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q3 — People check (M5, sense-read)

Read 5 full transcripts from the Q2 panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Include at least one resume-take sitting if
the panel produces one (Q1 watch) and read it for the re-pose.

## Q4 — Telemetry

`telemetry-check.js` on the Q2 panel vs
`telemetry-baselines/landing-split.json` (re-pinned r136: 81/9/217/15/0).
LOUD lines are same-run investigation items. Baseline is NOT rolled
unless the panel carries new information.

## Q1b (attempt, not binding) — person-trust baseline re-pin

r137 carried: HAUL 0→3 on the r215 base is base movement, and the
instrument owner should re-pin the person-trust baseline before the
next landing run treats it as a regression. This run attempts it:
run `test-person-trust-20261108.js` on the current base; if the
failure is the SAME shape as r137's (pure drift, no game-behavior
change), re-pin the expected values to this base's panel numbers in
the same commit, with the re-pin recorded in the run note. If the
numbers moved again vs r137, do NOT re-pin mid-run — carry it with
the new numbers reported.

## Policies / seeds

- Landing panel: seeds 1142–1151, 28d, r138 driver.
- Person-trust panel: seed 84101, 30d, `scripts/policies/competent`.
- No threshold, bar, price, or gate changes in this run except the Q1
  instrument exemption above, the farUnreached demotion to reported,
  and the Q1b re-pin if its condition is met. If the panel surfaces
  a further game defect, fix in the worktree with a proof test, or
  document and carry.

## Carried (unchanged)

- Teaching the shared chooser to take nv:accept (r197 lane decision owed).
- Hunt assignments still never resolve in the landing window (H1-ESTABLISHED).
- NV sittings share one closing template (palms-pressed goodbye) — middles
  are their own; observation only.
- Analyzer vs transcript streak count (r134 carry — analyzer maxSameStreak=1
  on nv sittings vs transcript summary maxStreak=4–5; no bar depends on it).
- `test-convo-engine-trust.js` verbatim closeLine (6 pass / 1 fail on
  r137, pre-existing on pristine) — carried as an observation.
- Measurement-proof + phone-frame-proof staleness pair (r137 gate:
  pre-existing on pristine `abc52dce1`; refresh owed via the update
  scripts — maintenance, not this run, unless this run's gate shows
  them moved).
