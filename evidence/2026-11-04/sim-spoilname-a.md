# sim-spoilname-a — per-form spoil-sweep naming (Loop A, food-economy / narration)

Verdict: **DIAG-NO** — there is NO game-text silence to fix. The dawn
sweep names the removed lump form on every seed where it actually
removes one. No src/js change. No game-code fix candidate built
(prereg NO-GO band hit: see below).

Worker: sim-spoilname-a. Base: master c0e08a1bc. Prereg:
`evidence/2026-11-04/sim-spoilname-a-prereg.md` (commit 2b06a457c),
committed BEFORE any judged sim. Instrument:
`scripts/test-spoilname-a.js` (shared `scripts/sim-harness.js` kit,
one seed + one stage per node process). Corpus:
`evidence/2026-11-04/sim-spoilname-a-corpus/` (18 JSON files:
8 seeds × Stage A + Stage B, plus 2 delayed-day follow-ups).

## Anchor reproduction (exact)
Fixture on every seed, via the real `Game.addUnknownToLump` path at
scholar day 8: blackberry × 12 → "unknown berries" @ spoilDay 10;
shoots × 5 @ 15; roots × 4 @ 38. `anchorOk=true` on all 8 seeds.
Morning-record headline before the dawn (bankfood-diag packSnap
shape): lumpUnits 21, lumpSpoilDays [10, 15, 38].

## What the game actually says (full-transcript capture)
Direct sweep at day 10 (Stage A) and real `endDay()` dawn path
(Stage B, DAWN header verified present, player alive, dayAfter 10
on all 8 seeds) emit the identical line:

> "Overnight, unknown berries went bad — beyond saving. You leave
> it for the flies."

Plus the preserve-teaching line only until the player knows
preserving (absent on seeds whose starter already knows it — e.g.
15379 — which is the designed voice gate, not a silence).

## Pilot numbers (8 seeds: 15376–15383, prereg band)
| Seed | Bonus | Day-10 removal | Form named (A and B) |
|------|-------|----------------|----------------------|
| 15376 (anchor) | 0 | berries × 12 removed | YES / YES |
| 15377 | 0 | berries × 12 removed | YES / YES |
| 15378 | 0 | berries × 12 removed | YES / YES |
| 15379 | 0 | berries × 12 removed | YES / YES |
| 15380 | +6 | NOTHING removed | n/a — no event |
| 15381 | 0 | berries × 12 removed | YES / YES |
| 15382 | 0 | berries × 12 removed | YES / YES |
| 15383 | +2 | NOTHING removed | n/a — no event |

Primary metric (prereg): form named in Stage-A sweeps = **6/8** →
**NO-GO band (≥ 6/8)** for a game-text fix. No re-score: the 2
non-naming seeds are not silences — on them nothing was removed at
day 10 at all, and the morning record correctly shows NO drop
(lumpUnits stays 21, stacks unchanged).

Conditional, stronger read: on every seed where a removal actually
happened, the form was named — **6/6 at day 10, both stages
(12/12 stage-runs)**.

## Why the 2 seeds did not remove at day 10 (not a bug)
`spoilBonusDays()` (preservation_instinct, "you store food right")
is part of the one spoilage boundary everywhere
(`src/js/food.js` isSpoiled: spoilDay + bonus ≤ day). Seed 15380
carries +6, seed 15383 +2, so berries @ 10 are still good at day 10.
Follow-up (post-prereg diagnostic, SPOILDAY override, not
re-scored): at their true spoil days — 15380 @ day 16, 15383 @
day 12 — the same sweep removes the berries lump and names it
("unknown berries went bad"), 2/2. The event is delayed, never
silent. Across all 8 seeds, every actual removal is named: 8/8.

## The anchor observation, explained (record silence, not game silence)
The morning record's HEADLINE fields alone do not name the form:
lumpUnits is a cross-form total (21 → 9 on event seeds) and
lumpSpoilDays a dateless list ([10, 15, 38] → [15, 38]). Anyone
reading only those two fields sees "fewer lump units" with no form
attached — exactly the anchor's wording. But the FULL record and
the transcript both name it:
- stacks[] diff: gone = "unknown berries|12" on all 6 event seeds;
- transcript sweep line: "unknown berries went bad" on all 6.
This is the upkeepbreakfast lesson repeating: the silence was in
the READING (headline-only), not the game. The remedy is at the
reading — join the stacks[] diff (or the sweep line) to the
headline — not a game-code change. `scripts/policies/bankfood-diag.js`
was deliberately left untouched: it is shared sibling instrument
tooling, and the join is demonstrated here rather than imposed on
other runs' corpora.

## Sense test (transcript read, not just counts)
A player reading only the dawn transcript knows WHICH form was
lost ("unknown berries") and that the other forms persist (no line
about shoots/roots, and both stacks remain in the pack). The line
is coherent and voice-consistent with the existing sweep voice.
One genuine gap, kept separate from the form verdict by the prereg:
the line never states HOW MANY units were lost (× 12 appears
nowhere in any sweep line, 0/8 at day 10, 0/2 delayed). "You leave
it for the flies" reads as the stack, so the loss is legible as a
stack, not as a count. Whether the sweep line should also carry
the unit count is an open design question for the coordinator /
next run — it was NOT built here, because the prereg bound the fix
to form-naming, form silence failed, and a units change would be a
new, un-preregistered narration change (feel-adjacent, would want
[needs-eyes] and its own threshold).

## Also observed (not judged, not chased)
- Stage-B dawn runs on 4 seeds (15377, 15379, 15381, 15382) also
  emit the village-pantry line ("The village threw out spoiled
  stores: Foraged food. <villager> mutters… (pantry)") for the
  pantry's own starter stock. Separate channel, separate loss,
  names its own stack. No interference with the pack-lump verdict.
- Pantry line speaker varies by seed/day as designed
  (Aisling / Liam / Dmitri / Ella); pack line has no speaker.

## Reachability / village assessment
Not applicable as a lever run: no lever was played, no balance
changed, no content reachability question was opened. The village
assessment is the fixture itself — a fresh day-8 camp with three
unknown lumps — and the dawn behaves honestly on it.

## Metric review (for the NEXT run, never a mid-run re-score)
- The prereg's raw 6/8 primary counts non-events as misses. A
  future spoil-naming prereg should condition on "removal actually
  happened" (or pre-screen spoilBonusDays) — the conditional 6/6
  (and 8/8 eventual) is the honest form-naming rate, and the raw
  rate understates it. Proposed revision: primary = share of
  removal events whose sweep line names the form; report
  bonus-delayed seeds as a separate "delayed, still named" row.
- Units-named is a separate metric (currently 0/8) and needs its
  own GO threshold and Steve-eyes decision before anyone builds
  it into the sweep line.

## Left unjudged / open
- Whether the sweep line should carry the unit count (× 12) —
  documented above, not built, not judged.
- No confirm spend: pilot judged, NO-GO, run ends here per
  throughput rules (a killed lever beats a long maybe). No
  back-to-back second round: there is no second arm — the
  hypothesis itself was disproven, not an arm killed.
- No telemetry-deviation check run: no lever, no panel, no
  before/after numbers to compare (this run is diagnostic, and
  the loop body's telemetry step presupposes a lever panel).

## Proof / counts
- Instrument runs: 18 node processes, 0 crashes, 0 write failures
  (flap-resilient write with read-back verification; corpus
  files verified re-readable, including the 2 delayed-day files
  preserved under -delayed16 / -delayed12 names).
- Fixture assertions: anchorOk 8/8 (Stage A and B alike).
- Stage B integrity: endDayOk 8/8, dayAfter 10 on 8/8, player
  alive 8/8, DAY 10 DAWN header in transcript 8/8.
- Commits: prereg 2b06a457c (plus this evidence + instrument +
  corpus in the closing commit — see final report).
- Worktree left clean (verified after commit; index-clobber
  repair applied once after the prereg commit, per the recorded
  safe-commit lesson — commit itself was correct throughout).
