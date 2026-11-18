# sim-seedattach-a — PREREG (DIAG/PROBE, finding #2523)

**Arm:** sim-seedattach-a · **Loop A run:** fleshout-20261118T0330Z · **Axis:** scale-onramp
**Type:** DIAG/PROBE — analyzer-only; no src/js change, no game change, no
balanced panel, no new sims unless the corpus lacks deaths coverage (it does
not — see below).
**Branch:** `sim-seedattach-a` · **Worktree:** `~/workspace/worktrees/sim-seedattach-a`
**Base commit:** `4e9fdda99bb6f472fbe706afce5e45ad070bda8b` (includes the #2508
fix `eb6ff8a27`; this arm probes whether that fix's blind spot also lives in
the seedattach analyzer, which was checked but NOT patched by #2508).
**Proof test:** `scripts/test-seedattach-a.js` (probe section added by this arm;
existing 62 checks must stay green).

## The question (finding #2523)

`scripts/analyze-seedattach-a.js` derives each epoch's `closeKind` by a
DIFFERENT mechanism than the shared `classifySeed` churn block that finding
#2508 fixed. It looks at exactly one census row — the row at `runEndDay + 1`
(the first day after the hunt/null run ends):

```js
const after = myCensus.find(function (r) { return r.day === ep.runEndDay + 1; });
if (!after) closeKind = 'plan-deleted';
else if (!after.holderAlive) closeKind = 'holder-died';
else if (after.stage !== 'hunt') closeKind = 'stage-left-hunt:' + after.stage;
else if (after.target != null) closeKind = 'target-set:' + after.target;
```

#2508 proved the census stream stops when a plan is deleted — and a plan IS
deleted when its holder dies. So a holder who dies on (or just before) the
run's last day leaves NO row at `runEndDay + 1`, and this code reads that
absence as `plan-deleted`. The deaths array — the one place that records
every death with day and cause — is never consulted by this analyzer.

## Probe corpus (frozen, read-only — nothing here is regenerated)

- `evidence/2026-11-15/perseed-seedattach-a-competent/` — 8 files, seeds
  100871–100878, deaths arrays present in all 8 (65, 65, 52, 115, 66, 112, 84,
  56 entries; 615 total).
- `evidence/2026-11-15/perseed-seedattach-a-tableseat-nowait/` — 8 files, same
  8 seeds, deaths arrays present in all 8 (identical counts; the two legs are
  byte-identical trajectories per sim-seedattach-a.md).
- Frozen before-oracle: `evidence/2026-11-15/seedattach-a-analysis.json`
  (main 10 instances: 7× `stage-left-hunt:party`, 2× `plan-deleted`,
  1× `stage-left-hunt:standing`; baseline identical). The analyzer writes its
  output to this path, so the probe runs `classifySeed` in-memory via the
  module export and NEVER re-runs the analyzer CLI over the frozen corpora —
  the committed JSON stays the before-oracle.
- **No fresh band.** The corpora already carry a deaths array on every seed
  file, so no fresh sims are needed and no seed-band freshness check is owed
  (the freshness skill governs spending a NEW band; none is spent).
- Deaths coverage: the deaths array is the recorder's full-run death log (the
  same source #2508 relied on). A close has deaths coverage iff its seed file
  carries a `deaths` array — true for all 16 files, hence for all 20 closes.
  The probe asserts array presence per seed before classifying.

## Frozen decision rule (scoped deaths-first — NOT a verbatim copy of #2508)

#2508's rule cannot be copied literally: in the shared block the close was
only determined when the instance never closed by any other mechanism, so ANY
death at/after the seed day could explain the trail ending. Here the close has
four mechanisms, three of which are POSITIVE evidence (a row exists with the
holder alive and a new stage/target). A death long after the run ended must
NOT override a `stage-left-hunt` close — the run ended because the plan left
hunt, not because the holder later died. The deaths-first read is therefore
scoped to the close window:

- For each epoch with `runEndDay != null`, let `epochStartDay` be the
  creation day (`ep.creation.day`) if a creation event exists, else
  `firstBounceDay` (the #2508 `seedDay` analog; the holder is alive at
  `firstBounceDay` by construction, so the two anchors agree on every
  reachable epoch — the probe asserts this).
- The death explains THIS close iff a villager death for the holder exists
  with `day` in `[epochStartDay, runEndDay + 1]`:
  - death day in `[epochStartDay, runEndDay]`: the holder died while the run
    was active; the census trail stops at the death, so no row exists at
    `runEndDay + 1`.
  - death day `== runEndDay + 1`: the holder died on the first day after the
    run; if the census snapshot precedes the death that day, no row exists.
  - death day `> runEndDay + 1`: the run already ended for a recorded reason;
    the death does not explain this close (the Carlos case: old plan deleted
    while the holder lived on, fresh plan opened after).
- The scoped deaths-first kind is `holder-died` iff a window death exists AND
  the census row at `runEndDay + 1` is missing OR has `holderAlive === false`.
  If the row exists with `holderAlive === true`, the row stands — the holder
  was alive on `runEndDay + 1`, so the run's end is explained by the row
  (stage/target), not by the death, even if the holder died later that day.
  No other branch changes.

**PATCH if ≥1 close is mislabeled** — a close whose kind changes under the
scoped deaths-first read (a holder death the deaths array records inside the
close window that seedattach currently reads as `plan-deleted`, or any other
close whose kind changes under the scoped read).
**EXONERATE if 0 mislabels across all 20 closes** (10 per leg; the legs are
identical trajectories, so 10 distinct instances × 2 legs), with the count of
closes checked stated. If deaths coverage is incomplete on any close, that
close is reported as uncovered and the run does NOT exonerate on it.

Epochs with `runEndDay == null` (close `run-end`, bounce-only, no census run)
have no close window to scope a deaths read to; the frozen analysis contains
none (closeKinds are only the three kinds above). If the probe finds one, it
is reported as out-of-rule and does not count toward either verdict.

## If PATCH

- The patch applies the scoped deaths-first read above to the close block in
  `scripts/analyze-seedattach-a.js` (consult `j.deaths` first, window
  `[epochStartDay, runEndDay + 1]`, only where the `runEndDay + 1` row is
  missing or `holderAlive === false`). No `closeDay` field exists in this
  analyzer, so no closeDay moves. No other branch, bucket, or sub changes.
- The analyzer is re-run (in-memory `classifySeed`) on the frozen corpora;
  the report names every close that moves, with its deaths-array evidence
  (seed, holder, death day, cause), and asserts no other close changes and no
  bucket/sub changes.
- Verdicts that consumed seedattach closes are re-checked: sim-seedattach-a
  DIAG-GO rests on the bucket decomposition (9/10 haven-born-never-seeded,
  1/10 companion-inherited); the bucket/sub classification never reads
  `closeKind` (verified by code read: buckets depend only on
  `launchesAsCompanion`, `firstSightingStage`, `creation`,
  `seedSetsBeforeEpoch`, `everTargeted`/`targetLostDay`). A closeKind-only
  patch cannot move a bucket — the proof asserts bucket/sub identity
  before/after on both legs, and the evidence records whether DIAG-GO moves
  (expected: it does not).

## If EXONERATE

The proof is the probe itself, with per-close evidence: for each of the 20
closes, the current kind, the window-death search result, and (for the 2
`plan-deleted` closes per leg) the positive evidence that the holder lived
past the close window. No analyzer change, no evidence-file regeneration.

## Proof plan (`scripts/test-seedattach-a.js`, probe section)

Per the proof-of-effect skill, the proof demonstrates the observable effect —
the close a reader of the analysis would see — not plumbing:

1. **Before-oracle reproduction:** current `classifySeed` on both frozen
   corpora reproduces the frozen JSON's per-instance `closeKind` exactly
   (20/20). (Fails if the corpus or the analyzer drifted.)
2. **Probe:** for each of the 20 closes, the scoped window-death search
   (deaths array, kind `villager`, who = holder, day in window) with the
   result per close; mislabels enumerated by seed/holder/day/cause.
3. **If PATCH — old-code-fails control:** a synthetic fixture (hunt run ends,
   holder dies on `runEndDay`, no row at `runEndDay + 1`) classifies
   `plan-deleted` under the pre-patch analyzer and `holder-died` under the
   patched one; plus a same-day-death fixture (death on `runEndDay + 1`, no
   row) and a negative fixture (holder dies AFTER `runEndDay + 1` with a
   genuine `plan-deleted` — kind must NOT change) and a stage-change fixture
   (row at `runEndDay + 1` with `holderAlive === true`, stage `party`, holder
   dies later — kind must stay `stage-left-hunt:party`).
4. **If PATCH — corpus diff:** patched `classifySeed` on both frozen corpora:
   exactly the mislabeled closes move to `holder-died`; every other close,
   every bucket, every sub identical to the before-oracle.
5. **Existing checks stay green:** the current 62 checks (incl. the static
   `src/`-clean and scripts-scope checks — this arm touches no `src/` file).
   Re-run any existing seedattach test after the change (this file IS that
   test).

## Sense-testing

For every close that moves (or, if none moves, for each `plan-deleted` close),
read the holder's story in plain words from the deaths entry and the nearby
census/encounter rows: who died, when, of what, and what the plan was doing.
A close is not just a label — it is the end of a villager's plan, and the
evidence file tells it as one.

## Metric review (to be filled in the evidence file)

- The frozen rule binds: PATCH ≥1, EXONERATE 0, no re-scoring. If the probe
  finds the rule itself mis-scoped (e.g. a death that should count but falls
  outside the frozen window), that is recorded here as a metric-review note
  and the rule is revised for the NEXT run, not re-scored mid-run.
- No balanced panel: a recorder probe changes no game behavior and no sim
  output; the before/after is the re-analysis itself, diffed field by field
  (same posture as #2508).
