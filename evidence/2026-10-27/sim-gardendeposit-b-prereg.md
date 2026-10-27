# sim-gardendeposit-b — preregistration (written BEFORE any trace judgment)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1730Z, axis
food-economy. Arm sim-gardendeposit-b, carried blank from 2026-10-26
(findings line 1158 / sim-stock9762-b out-of-arm observation): a
deposit-path trace — where do garden-attributed deposits come from if
plots never ripen?

## Rules (binding)

- Measurement/DIAG only: zero src/js changes, no default flips, no
  throttle or garden redesign. Tracing attribution, not fixing the garden.
- NO fresh seeds. The traced band is the existing
  evidence/2026-10-26/sim-stock9762-b-corpus/ (seeds 9760–9767,
  competent-nofeast, 100d). Re-derivation from that corpus plus static
  code-path reading only. A fresh seed would need a new prereg
  justifying it in advance; none is claimed here.
- Canon read first: docs/CANON.md, then docs/GARDENS.md. Nothing invented.
- Judge ONLY against this prereg. A miss is NO-GO (or PARTIAL where
  defined below), never re-scored mid-run against a friendlier bar.
  Every evidence file carries a "metric review" section.

## Traced set (fixed before any trace judgment)

- Primary set: `gardenEvents.gardenInflows` on seed 9762 in the
  stock9762 corpus — the set prior evidence reports as 129
  Lamb's Quarters deposit-door events carrying gardenShares, from
  day 20 onward, totalling 396,750 kcal. The analyzer re-derives
  the count, door split, name split, and kcal total from the corpus
  file itself; the prior report's numbers are NOT taken on trust.
- Cross-check set: the same seed's `inflows` array (inflow-capture
  records) and `gardenDays` snapshots (plot state, ripe counts),
  `gardenEvents.sows` (player sows), and `gardenEvents.sayLines`
  (garden dialogue). Band context: gardenInflows on seeds
  9760–9767, for contrast only — the verdict rests on 9762.
- Definition note (from scripts/garden-capture.js, read before
  judging): a gardenInflows record is ANY pantry-door call carrying
  gardenShares (stock / deposit / pantryAdd), OR a stock call named
  'Garden harvest' regardless of shares. "Garden-attributed" in this
  arm therefore means "carries the gardenShares flag (or the Garden
  harvest name)", NOT "arrived through the NPC garden stock door".
  The trace must say, for each door, what that flag actually proves.

## Questions the trace must answer (all of them, with counts)

1. Door split: how many of the 9762 garden-attributed records arrive
   via each pantry door (stock / deposit / pantryAdd), by name and
   kcal? Is the stock door ('Garden harvest') really zero?
2. What does a deposit's gardenShares actually prove? Name every
   code path that can put gardenShares on a pack item that later
   reaches depositPantryPieces (player garden harvest, NPC garden
   delivery, forage/blend/merge paths, cooking/processing carry-over,
   starting-stock or other direct pushes — whatever the code shows),
   with the file/function for each, and say which of them can fire
   on this band given the corpus (sows, ripe snapshots, keeper
   turns, throttle state).
3. The full call path for the 9762 Lamb's Quarters deposits:
   donor function → pantry door → pantry item, in code order, with
   the corpus timing that supports or breaks each step (first sow
   day, first deposit day, plot pid over time, coax/magic lines,
   end-of-day ripe counts). In particular: does the end-of-day
   ripe == 0 snapshot rule out a same-day ripen → player-harvest →
   deposit path, or is that path consistent with ripe == 0 at
   snapshot time (crop harvested before the snapshot)?
4. Sense check: garden-related villager dialogue / transcript lines
   in the 9762 corpus, read for meaning (not just counts). If none
   exist beyond what stock9762 already quoted, say so explicitly
   instead of claiming a sense check.

## GO bar (binding)

GO holds if and only if ALL of the following hold:

- (a) Re-derivation: the analyzer, run from the corpus file alone,
  reproduces the traced set's size and kcal total and classifies
  100% of its records by door and name (unclassified == 0).
  Any record whose door or name is missing/ambiguous counts as
  unclassified, not as its most likely door.
- (b) Door completeness: every door that appears in the traced set
  is named with its count and kcal, and every pantry door that does
  NOT appear is named as zero with the corpus evidence for the
  zero (not assumed from the prior report).
- (c) Origin-step naming: for each door × name cell holding >= 5%
  of traced kcal, at least one code-grounded origin step (the
  function that puts gardenShares on that item, and the caller
  that moves it to the pantry door) is named with file/function,
  and the corpus timing is checked against it (consistent or
  inconsistent — an inconsistent timing is reported, not smoothed
  over). Cells under 5% of traced kcal may be grouped only if the
  group total and its member names are both listed.
- (d) The "what gardenShares proves" question is answered in plain
  words, distinguishing at minimum: (i) proof of a garden plot
  ripening, (ii) proof of a player sow, (iii) proof of forage
  attribution, (iv) proof of shared-stock bookkeeping (shares
  carried through splits/merges/cooking). The answer must name
  which of these the 9762 deposits actually establish, and which
  they do not.
- (e) Proof script green: scripts/test-gardendeposit-b.js passes,
  re-deriving (a)–(b) from the corpus (not from the analyst's
  notes) and asserting the code-path names exist in the source
  (grep-anchored, not hand-typed claims).
- (f) Hygiene: zero src/js files modified; no sibling capture or
  corpus file modified; worktree contains only committed work at
  the end.

PARTIAL holds if (a) and (b) hold (door-level attribution complete,
0 unclassified) but (c) or (d) cannot be completed from corpus +
code alone — i.e. the door is known but the originating step for a
>= 5% cell is genuinely unprovable from the available evidence, and
the gap is named with its size (count + kcal) instead of being
filled by inference. PARTIAL is an honest result, not a failed GO
re-scored: the report must say which cell is unproven and what
instrument (call-stack capture, pack-item provenance, intra-day
ripe event) the next arm would need.

NO-GO holds if (a) or (b) fails (any unclassified record at door
level, or the traced set cannot be re-derived), or if the proof
script fails, or if hygiene (f) fails. A NO-GO verdict names the
failing leg and the exact unclassified count.

## What does NOT count

- The prior reports' numbers do not count as re-derivation; only
  the analyzer's output from the corpus file counts.
- A code path that exists but cannot fire on this band (e.g. a
  caller the competent policy never invokes, or a crop the corpus
  never sows) does not count as an origin step for a cell; it is
  listed as excluded, with the reason.
- End-of-day ripe == 0 does NOT by itself prove "no harvest that
  day" — the trace must address the same-day ripen-and-harvest
  window explicitly (gardenstate's own caveat), in either direction.
- No fresh-seed result may be introduced to rescue a failing leg;
  the verdict stands on the corpus named above.

## Deliverables

- scripts/analyze-gardendeposit-b.js (re-derivation + door/name
  tables + timing checks), scripts/test-gardendeposit-b.js (proof),
  evidence/2026-10-27/sim-gardendeposit-b.md (verdict judged ONLY
  against this prereg, with a "metric review" section), this prereg
  file. Corpus files are READ, never modified.
- Commit this prereg FIRST, before any trace judgment, via
  scripts/safe-commit.sh. Trace work starts only after that commit
  lands.
