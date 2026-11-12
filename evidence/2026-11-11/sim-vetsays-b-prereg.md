# Pre-registration — sim-vetsays-b (Loop B, run fleshout-loop-b-20261111T2330Z)

Fix finding #2271 (sim-findings.md, 2026-11-11, instrument): the
veteran-filtered say capture regex `/elder/` in the shared SAY_RE matches
"Elderberry" — on seed 190393 most of the 148 captured lines are Elderberry
identification chains. The survival read is unaffected; the sense-test
sample is diluted.

## Correction to the finding's location (verified before writing this prereg)

The finding says the regex lives "in the shared SAY_RE
(scripts/vetfirst-instrument-20261111.js, reused unmodified by the
vetphantom/survivalcontrol drivers)". Verified by grep: the instrument file
`scripts/vetfirst-instrument-20261111.js` contains NO SAY_RE and NO "elder"
at all. The regex is duplicated, identical, in THREE driver files:

- `scripts/vetfirst-driver-20261111.js:63`
- `scripts/vetphantom-driver-20261111.js:106`
- `scripts/survivalcontrol-driver-20261111.js:105`

all `const SAY_RE = /veteran|blooded|scarred|elder|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;`

Repo-wide grep for the pattern string `pack-leader|put down` confirms these
three are the complete set — no other file carries a copy of this filter.
(Other drivers have their own differently-worded SAY_REs for other topics;
those are not copies and are out of scope.) The fix is the same one-token
change in each of the three files: the `elder` alternative becomes
`\belder\b`. The instrument file needs no change.

## Change

One token per file, same change, three files:
`scarred|elder|pack-leader` → `scarred|\belder\b|pack-leader`.
No game code (`src/`) changes. No driver logic changes.

## Method — NO new sims

Re-apply the fixed filter to the already-judged corpus
`evidence/2026-11-11/perseed-survivalcontrol-b/*.json` (8 seeds,
190391–190398, survivalcontrol pilot-fix leg on master). Do NOT re-run the
survivalcontrol sims. Do NOT re-judge the MASTER_CHANGE verdict from
sim-survivalcontrol-b.md. The corpus JSON files are NOT rewritten — the
re-filter is applied in memory by the proof test and the counts are reported
here.

## Primary metric

Re-filtered capture composition per seed: old captured count vs new captured
count, dropped-line inventory with classification.

## GO thresholds (binding — a miss is NO-GO, never re-scored)

(a) 0 Elderberry-chain lines in the re-filtered capture on all 8 seeds.
    Operationalized strictly: no line in the re-filtered capture contains
    /elderberry/i (case-insensitive).
(b) No false negatives — every genuine elder line previously captured is
    still captured. Operationalized as: let dropped = old capture minus new
    capture (line sets, per seed). GO requires ALL of:
    (b1) 0 dropped lines contain /\belder\b/i (standalone word "elder",
         any case — the veteran-variant label "A Elder veteran", monster
         names "Elder Glasswing Darter" / "Elder The Ugly Beast", and plant
         IDs "Ground Elder" / "European Elder");
    (b2) every dropped line falls in one of exactly two non-genuine
         classes: (i) substring match inside "Elderberry", or (ii) plural
         "elders" in the village-elders social line ("sitting with the
         elders instead" — a foraging-basket flavor line about village
         elders, not the veteran monster variant);
    (b3) per-seed count of lines containing /\belder\b/i is identical
         before and after the re-filter.
(c) Proof test `scripts/test-vetsays-b.js` is green: it asserts the filter
    rejects "Elderberry" lines and accepts "elder" lines (unit cases), asserts
    all three driver files carry the identical tightened SAY_RE with the elder
    alternative exactly `\belder\b`, and re-applies the filter to the corpus
    asserting (a) and (b).

## Horizon, seeds, policies

- Horizon: N/A — no sims run; the corpus is already-judged data.
- Seeds: 190391–190398 (the 8 already-judged survivalcontrol seeds).
- Policies: competent (as recorded in the corpus; not re-run).

## Scale-wall numbers

N/A with reason: instrument-only arm, no new sim band — no national / table
/ wins / wave 4–5 unlock / median survival numbers are produced or changed
by this run.

## Canon

No canon doc covers the measurement instrument: SAY_RE is a sim-driver
capture filter, not a game system. Method follows docs/MEASUREMENT.md
§§9–15 (staged measurement, pre-registration, metric binding). The
veteran-variant name "elder" is established in the vetfirst evidence
("A Elder veteran", elder Focus Group) and in `src/js` monster-variant
handling — no canon invented here.

## Metric review

(To be filled after the run. Any miss is NO-GO; a wrong metric is revised
for the NEXT run, not re-scored here.)

## Known residual (not a GO criterion)

Plant IDs "Ground Elder" / "European Elder" contain the standalone word
"elder" and are still captured by `\belder\b`. They are plant-identification
lines, not veteran lines — a small residual imprecision of the word-boundary
fix, not a false negative or a false Elderberry positive. Excluding plant
IDs would need a semantic (not regex) filter and is out of scope for this
fix; noted here so the next arm reusing the filter knows.
