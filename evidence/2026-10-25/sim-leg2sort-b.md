# sim-leg2sort-b — LEG2DECIDE STRING-SORT DISPLAY FIX (fleshout-loop-b-20261025T1430Z)

Axis: food-economy. Tracker blank: 1329Z blank 3. Arm type: tooling/measurement
only — invents no game canon, changes zero `src/js` game code.

Canon read first: `docs/CANON.md` (manifest) and `docs/PRESERVATION.md`
(food ladder). This arm touches only a display line in a measurement script,
so no preservation rule is reinterpreted; the ladder values themselves are
never computed here.

## PRE-REGISTRATION (written BEFORE any code change)

Exact lines to change — `scripts/analyze-leg2decide-b.js` lines 147–149
only:

- L147 `parent ratios sorted:` — `p.ratios.map(x => x.r.toFixed(3)).sort()`
- L148 `commit ratios sorted:` — `c.ratios.map(x => x.r.toFixed(3)).sort()`
- L149 `per-seed steps sorted:` — `stepRatios.map(x => x.step.toFixed(3)).sort()`

Numeric-sort rule: sort the NUMBERS with `(a, b) => a - b` FIRST, then
format each with `toFixed(3)` for display. Never sort formatted strings.
No other line changes: no computed median, quartile, ratio, or verdict
may change.

Proof bar (pre-registered):
1. Existing `scripts/test-leg2decide-b.js` green before and after.
2. New `scripts/test-leg2sort-b.js` green, including a synthetic case where
   lexicographic and numeric orders DIFFER, asserting numeric order in the
   fixed output.
3. Before/after analyzer run on the real leg2decide corpus
   (`evidence/2026-10-24/leg2decide-b-corpus/`, 64 files, seeds 9266–9281):
   the diff must be confined to the three display lines above — all verdict
   numbers identical.

## THE BUG

JavaScript's bare `.sort()` on strings orders them letter by letter, not by
value. `"14.960"` starts with `1`, so it sorted BEFORE `"2.977"`, even
though 14.960 is the larger number. The three "sorted:" display lines in
the leg2decide analyzer sorted the already-formatted `toFixed(3)` strings,
so any list containing a value ≥ 10 alongside a value in 2–9 printed out
of numeric order. The medians and quartiles printed in parentheses on the
same lines were computed from correctly number-sorted arrays (`med()` /
`quartiles()` use `(a, b) => a - b`), so the numbers in parentheses were
right while the list beside them was misordered — the worst kind of
display bug, because the line looks authoritative.

Before (real corpus, analyzer run saved before the fix):

```
  parent ratios sorted: 0.000, 0.020, 0.047, 0.062, 0.175, 0.203, 0.225, 0.370, 0.603, 0.738, 1.053, 1.258, 1.379, 1.427, 14.960, 2.977 (Q1 0.175 med 0.487 Q3 1.379)
  commit ratios sorted: 0.000, 0.020, 0.028, 0.050, 0.069, 0.112, 0.175, 0.190, 0.203, 0.225, 0.378, 0.603, 1.379, 1.427, 14.960, 2.977 (Q1 0.069 med 0.196 Q3 1.379)
  per-seed steps sorted: 0.000, 0.055, 0.257, 0.302, 0.359, 0.450, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.064 (Q1 0.359 med 1.000 Q3 1.000)
```

Note the tail of the first two lines: `14.960` sits before `2.977`. The
steps line happened to be correctly ordered on this corpus (all steps
≤ 1.064, where letter order and value order agree) — the bug there is
latent, not visible, and the fix covers it anyway.

After (same corpus, same analyzer, fixed lines only):

```
  parent ratios sorted: 0.000, 0.020, 0.047, 0.062, 0.175, 0.203, 0.225, 0.370, 0.603, 0.738, 1.053, 1.258, 1.379, 1.427, 2.977, 14.960 (Q1 0.175 med 0.487 Q3 1.379)
  commit ratios sorted: 0.000, 0.020, 0.028, 0.050, 0.069, 0.112, 0.175, 0.190, 0.203, 0.225, 0.378, 0.603, 1.379, 1.427, 2.977, 14.960 (Q1 0.069 med 0.196 Q3 1.379)
  per-seed steps sorted: 0.000, 0.055, 0.257, 0.302, 0.359, 0.450, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.000, 1.064 (Q1 0.359 med 1.000 Q3 1.000)
```

Only the order of the last two values in the first two lines changed;
the steps line is byte-identical, as predicted.

## THE FIX

```js
// before (all three lines, same pattern):
p.ratios.map(x => x.r.toFixed(3)).sort()
// after:
p.ratios.map(x => x.r).sort((a, b) => a - b).map(v => v.toFixed(3))
```

Same pattern for `c.ratios` and `stepRatios`. Nothing else in the file
touched.

## SIBLING-BUG GREP (same analyzer family)

Searched `scripts/` for `toFixed(...)).sort()` (bare string sort after
formatting) and for `.map(...toFixed...).sort()` generally:

- ONLY hit: `scripts/analyze-leg2decide-b.js` lines 147–149 — fixed here.
- `scripts/analyze-leg2drift-b.js`: no `toFixed().sort()`; its one
  `.sort((a, b) => b[1] - a[1])` sorts death-count numbers with a numeric
  comparator — correct, not a bug.
- `scripts/journey-social-r42/r44-20261022/23.js`: `.slice().sort((a, b) => a - b)`
  on numbers BEFORE `toFixed(1)` — correct order, formatting after sorting.
- All other analyzer `.sort()` calls sort filenames, labels, or category
  keys (strings where letter order is the intent) — not numeric displays.

No other fix needed; no other file changed for this arm.

## PROOF RESULTS

- `node scripts/test-leg2decide-b.js` (existing): PASS — full output below
  in the run log; all T1–T4 checks green, including T3 on the real corpus.
- `node scripts/test-leg2sort-b.js` (new): PASS — see below.
- Before/after analyzer diff on the real corpus: `diff` of the two full
  reports shows EXACTLY two changed lines (parent ratios sorted, commit
  ratios sorted); the steps line is unchanged; every other line —
  including M(parent) = 0.487x, M(commit) = 0.196x, MEDIAN STEP RATIO =
  0.404x, VERDICT STEP CONFIRMED, aggregate step 0.817x, ratio-of-medians
  step 0.876x, median of per-seed step ratios 1.000x, wall counts
  (64 configs, 59 national, 0 wins) — is byte-identical. DISPLAY ONLY,
  as pre-registered.
- New proof details (`scripts/test-leg2sort-b.js`):
  - Corpus A (parent line): parent ratios 2.977, 14.960, 0.500. Old code
    would print `0.500, 14.960, 2.977`; fixed output asserts exactly
    `0.500, 2.977, 14.960`.
  - Corpus B (commit + steps lines): commit ratios 2.000, 10.000, 0.500
    with parent ratios all 1.000, so per-seed steps are the same three
    values. Fixed output asserts both lines read `0.500, 2.000, 10.000`
    (old code would print `0.500, 10.000, 2.000` on both).
  - Also asserts the deciding numbers on corpus B are untouched by the
    display change: M(parent) = 1.000x, M(commit) = 2.000x, step 2.000x,
    verdict STEP REFUTED.
  - Synthetic corpora live under `os.tmpdir()` only; no repo writes.

## METRIC REVIEW

- Pre-registered metric (display-order correctness on the three lines)
  proved adequate: the before/after diff test is the right instrument and
  it passed exactly as specified.
- No metric revision proposed. One observation for the NEXT run, not a
  revision: the steps line on the real corpus did not visibly demonstrate
  the bug (all steps ≤ 1.064), so a future display-order check should not
  rely on the real corpus alone to exhibit the fault — the synthetic
  differing-order case in `test-leg2sort-b.js` is the durable guard.
- No verdict, threshold, or panel comparison is affected by this change,
  so no balanced-panel re-run is warranted: the panel instrument reads the
  same numbers before and after.

## PLAIN-WORDS NOTE — WHAT THE BUG COULD HAVE MISLED A READER INTO BELIEVING

In plain words: the analyzer prints the full spread of results from
smallest to largest so a reader can see at a glance whether most seeds
cluster together or a few wild ones skew the picture. With the bug, the
largest value could appear in the middle of the list instead of at the
end — on the real corpus, the wild 14.960 seed looked like it sat between
1.427 and 2.977 instead of standing alone at the top. A reader skimming
that line could have concluded the spread topped out around 3x with one
oddity, or misread which seeds were the extremes, while the median and
quartile numbers beside the list quietly told the true story. The verdict
itself was never wrong — it comes from the median, which was computed
correctly — but the "read the spread, not just the median" evidence the
analyzer exists to show was misordered whenever a value crossed 10. Fixed
now: smallest to largest, truly.
