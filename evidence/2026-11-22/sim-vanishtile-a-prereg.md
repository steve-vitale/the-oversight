# sim-vanishtile-a — PREREG (frozen)

**Arm:** sim-vanishtile-a · **Loop A run:** fleshout-20261122T1115Z
**Axis:** scale-onramp · **Finding:** tracker blank #2 / sim-findings line 2675
(VANISHED-GUN TRACE DOESN'T TILE)
**Type:** DIAG/instrument-fix + deterministic re-analysis (no lever, no new band)
**Base master:** `87b2122f3` (worktree `~/workspace/worktrees/sim-vanishtile-a`,
branch `sim-vanishtile-a`)
**Frozen:** 2026-11-22 ~06:10 UTC, before any judged re-analysis. No judged
re-analysis has run.

## 1. The question

sim-gunlife-a (Loop A run fleshout-20261122T0815Z,
`evidence/2026-11-22/sim-gunlife-a.md`) traced 8 contest searcaster grants
on band 107321–107328 and went GO at 7/8 traced. The 8th grant
(s107323-seq17, gen_c0j2d8m) is `unexplained-vanish`: the gun sat on its
holder's corpse 33 days (days 72–104), then the world gun total fell 2→1
with no event on day 105 — the named hypothesis is the corpse cap (40
corpses, oldest stage-4 culled items-and-all), never asserted. The tracer
names the vanish but its rows don't tile past it (no state for days
105–150), so `rowsComplete` is false and the grant counts as untraced.
The selftest's fixture 7 has the same shape (vanish on the last day) but
never asserted `rowsComplete`, so the gap passed the frozen selftest.

This arm fixes the tracer (a terminal `vanished` state range that closes
the tiling at the vanish) and re-runs the analysis deterministically on
the SAME frozen corpus. No new band: the analysis is deterministic on
the corpus.

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

- Canon: docs/CANON.md read. No canon doc covers corpse culling or the
  gun-vanish — said here rather than inventing canon. MONSTER-WAVES.md
  covers wave law, not corpses.
- Corpse-cap mechanism (`src/js/corpses.js`, read on this base): when a
  death registers a new corpse and the corpse list length exceeds 40,
  the oldest stage-4 corpse is spliced out of the list — items-and-all,
  silently, with no event and no telemetry. Stage 4 is `bones`, reached
  at 8+ days since death (`STAGES`: fresh <1d, stiff <2d, bloating <4d,
  rotting <8d, bones ≥8d). gen_c0j2d8m died day 72, so his corpse was
  stage 4 from day 80 — cull-eligible for 25 days before the vanish.
- What would PROVE the cap fired on day 105: dated corpus evidence that
  (a) the corpse list length exceeded 40 when a new corpse registered
  on day 105, AND (b) the culled corpse was gen_c0j2d8m's
  (`corpse_72_2vdszs`). The corpus (`v4gunLoc` + `deaths`) records
  gun-bearing corpse locations and dated deaths, but NOT the live
  corpse-list length, burials, or butchering — so the cap itself may
  prove UNPROVABLE-IN-CORPUS even though the corpse's exit is dated.
- The fix is tracer-only: after a vanish, append a terminal state range
  `{from: vanishDay, to: lastCensusDay, loc: 'vanished'}` so the states
  tile grantDay..lastCensusDay. The `vanished` range counts as
  `vanishedDays` (not equipped/carried/corpse/unseen), and days in it
  do not count as fights-entered-while-held (the holder demonstrably
  holds no gun there). No game-code change is expected; if a game-code
  defect is found while reading, it is documented as a finding, not
  fixed in this arm.

## 3. Corpus (frozen — NO NEW BAND)

- `evidence/2026-11-21/perseed-gunlife-a-ctl/` (8 files, seeds
  107321–107328). Anchor verified on all 8 files before the re-analysis:
  `anchorCommit: 01ff4956f9d88ed2b4c012ef1c7d9cbc26ff8c6a`
  (prefix `01ff4956f`, the gunlife instrument commit) on every file.
- The re-analysis writes a NEW output file
  `evidence/2026-11-22/gunlife-a-analysis-vanishtile.json` — the judged
  gunlife-a analysis (`gunlife-a-analysis.json`) is NOT overwritten.

## 4. Definitions (frozen)

- **Traced grant:** as in the gunlife-a prereg §6 — a named mechanism
  with per-grant dated rows AND `rowsComplete` true (states tile
  grantDay..lastCensusDay contiguously).
- **Tiling:** the grant's state ranges cover grantDay..lastCensusDay
  with no gaps and no overlaps; a terminal `vanished` range counts as
  tiling.
- **Attribution PROVEN:** dated corpus evidence names the mechanism
  that removed the gun — for the corpse-cap hypothesis, the corpus must
  show the corpse list hitting the cap on/near day 105 AND the culled
  corpse being gen_c0j2d8m's. Weaker dated evidence (the corpse entry
  leaving the census on day 105 with no event) proves the corpse's exit,
  not the cap.
- **Attribution UNPROVABLE-IN-CORPUS:** the corpus cannot prove the
  cull — the verdict names what telemetry would prove it (live
  corpse-list length at cull time + culled corpse id, or a cull event).

## 5. Frozen bars (judge: the fixed tracer + selftest on the frozen corpus)

| # | Bar | Threshold |
|---|---|---|
| (a) | **Instrument validity** — `scripts/test-gunlife-a.js` still 11/11 AND the tracer selftest (`scripts/analyze-gunlife-a.js --selftest`) green WITH a new `rowsComplete` assertion on the vanish fixture (fixture 7) plus a regression fixture for a mid-run vanish (new fixture 9) | all must hold |
| (b) | **TILING** — the re-analysis on the frozen corpus reproduces the 7 traced grants' mechanisms byte-identical (or with every diff documented) AND the vanish grant's rows now tile to the last census day (`rowsComplete` true, 8/8 traced) | all must hold for GO |
| (c) | **ATTRIBUTION** — the vanished gun gets a dated mechanism from the corpus: either the corpse-cap cull proven (dated cull evidence) or the honest verdict that the corpus cannot prove the cull, with the next step named (what telemetry would prove it) | named either way; PROVEN or UNPROVABLE-IN-CORPUS |

**GO requires (a) + (b) + (c)-named.** The verdict is GO on the
instrument+tiling when (a)(b) pass; attribution is reported as PROVEN
or UNPROVABLE-IN-CORPUS. Do NOT assert the corpse cap without dated
corpus evidence, and do NOT re-score the gunlife-a verdict (it stands
at 7/8 GO; this re-analysis is its own judged result).

## 6. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-gunlife-a.js` →
  11/11; `node scripts/analyze-gunlife-a.js --selftest` → green with
  the new assertions — re-run on base `87b2122f3` after the fix.
- **Fix (tracer only):** terminal `vanished` state range in
  `scripts/analyze-gunlife-a.js` + selftest assertions (fixture 7
  `rowsComplete`, new fixture 9 mid-run vanish). Commit the prereg
  FIRST, then the fix.
- **Re-analysis (judged):** `node scripts/analyze-gunlife-a.js --dir
  evidence/2026-11-21/perseed-gunlife-a-ctl --out
  evidence/2026-11-22/gunlife-a-analysis-vanishtile.json` → compare
  against `gunlife-a-analysis.json` grant by grant; document every diff.
- **Attribution:** read the s107323 corpus rows around day 105
  (corpse census, death log) against the code-read cap mechanism;
  verdict PROVEN or UNPROVABLE-IN-CORPUS with dated rows.
- **Wall numbers** re-reported from the re-analysis (wins, national,
  wave 4–5 unlocks, median survival) — re-read, not copied blindly.
- **Sense-test:** read the vanish from the record — does the gun's
  disappearance read sensibly?
- **Metric review** in the evidence file (§14): if the metric proves
  wrong, write it there and propose the revision for the NEXT run.

## 7. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
