# Loop B round 1142Z — capstone readiness RE-MEASURE (both arms GO, merged locally pending ship)

Run: fleshout-loop-b-20261110T1142Z. Axis: scale-onramp (winnability chain).
Master at run start 57547c8dd; at closeout 02db5d2c8. Both arms merged
locally, pending ship. No version bump, no push, no live verification.

## Run setup

This run took tracker blank (6) from the 1030Z review: capstone readiness
RE-MEASURE after Loop A's wave5kill-a (203a32775) and answermail-a
(5db4f6fef) land — the 1030Z census is the pre-landing baseline, with the
per-deed blocker revision from its metric review. Blanks (1)–(5), (7), (8)
from 1030Z are Steve-call / decision-gated — NOT taken. Both arms are DIAG
ONLY, instrument-only, zero src/js, non-overlapping files. Loop A was live
the whole run — first closing out its 1115Z adoption run (both arms merged
before this run started), then starting a new 1215Z run (talkturn-a +
answermail-drive-a + tendexact-a; trees registered mid-run) — NOT touched.
Orphan trees sim-wideduty-a + sim-sametick-a (food-economy) stayed deferred
— NOT touched. sim-ctraj-b locked + dirty — NOT touched. Pre-flight: main
tree clean, disk 31%, worktree-reap ran (7/16 active, no removals).

Fresh bands (coordinator-verified before spawning, per the seed-band skill):
140201–140208 and 140209–140216 — 0 hits in any prereg, evidence `*.md`,
evidence filenames, scripts/, `~/memory/`, or goal hidden_files (only
bare-number false positives inside old single-line corpus JSON, e.g. a
140209 total in a seed-96107 sweep file, and the coordinator's own claim
file). Workers re-verified per seed in their preregs.

## Arm 1 — sim-capstoneready-remeasure-b: GO (prereg-bound), LANDED

Commit 75f376185 (13 files, zero src/js), proof scripts/test-capstoneready-b.js
all legs pass at 30d and 150d — re-run green by the coordinator on merged
master.

Instrument revision (this worker owns it; arm 2 reuses it): daily rows now
record `scholarId`; the driver wraps `recordWaveKill`/`recordPyrrhicKill`
and samples `_ladderLivingVeterans(4)` at kill time; analyzer judges the
revised per-deed metric and stays backward-compatible with the old corpus
format (verified against the old corpus). Ontology: all 135 systems
validated.

Band A (140201–140208, competent, 150d, 932 daily rows, 0 recorder
errors): per-deed blockers named 8/8 for all three deeds — PRIMARY GO.
- Military tribute ever-ready **0/8 → 2/8** — the first deed ever ready in
  either census (140201 ready d90–121, 32 days; 140208 ready d135–137,
  3 days). Wave-4 kills 10 → 21; peak living veterans 1 → 2. Kill-time
  peak matches the daily peak on every seed — no sub-day overlap missed.
- Trade charter 0/8, feast embassy 0/8 — unchanged. 0 sealed charters,
  0 feast bundles, scale never national.
- Scholar drain, now directly observed: 15 of 21 wave-4 kills were made by
  the scholar at kill time (never count toward the tribute); 13 landed
  with zero living non-scholar veterans standing. Bridget Crawford killed
  3 wave-4 beasts as scholar on 140208 — all uncounted. Both ready windows
  closed when the pair's members took the scholar's seat.
- Median survival 87d → 125.5d; 2 villages survived the full horizon.

## Arm 2 — sim-capstoneready-remeasure2-b: GO (prereg-bound), LANDED

Commits 7c18a51d5 (prereg + corpus note) + 90515d8bd (corpus) + 02db5d2c8
(evidence), rebased onto explicit master SHA 75f376185, proof all legs pass
post-rebase. Merged --ff-only 75f376185..02db5d2c8.

Band B (140209–140216, competent, 150d, 836 daily rows, 0 recorder
errors): per-deed blockers named 8/8 for all three deeds — PRIMARY GO.
Ever-ready 0/8 on all three deeds; peak living veterans 1; wave-4 kills
13; median survival 113d; wave 5 unlocked 0/8. This corpus is old-format
(pre-revision driver: no scholarId rows, no kill-time samples), so
"never 2 veterans at any moment" is unproven on this band (daily
snapshots only); the Valeria inference rests on death-tele scholar flags
plus her zero-count streak, stated explicitly in the evidence.

Sense (140210): Valeria Quispe killed FOUR wave-4 beasts d90–112 and the
tribute counter never moved — all four kills were the scholar's, and the
scholar never counts. All four of the seed's killers died as scholar; the
seat changed hands 14 times in 142 days. (140214): survived to d150 with
4 people; three lone kills, never two living veterans at once.

## Pooled 16 seeds (coordinator-verified with the revised analyzer)

| | Baseline (1030Z) | Band A | Band B | Pooled 16 |
|---|---|---|---|---|
| Tribute ever-ready | 0/8 | 2/8 | 0/8 | **2/16** |
| Charter / feast ever-ready | 0/8 | 0/8 | 0/8 | **0/16** |
| Wave-4 kills | 10 | 21 | 13 | **34** |
| Peak living veterans | 1 | 2 | 1 | **2** |
| Median survival | 87d | 125.5d | 113d | **121.5d** |
| Wave-5 unlocked | 1/8 | 1/8 | 0/8 | **1/16** |
| National / table / wins | 0/8 | 0/8 | 0/8 | **0/16** |

Coordinator re-ran the revised analyzer over both corpora on merged
master: PRIMARY GO on both bands (8/8 per deed, shares 1.0); medians
reproduce exactly (125.5 / 113; pooled 121.5).

## What moved, what didn't

- The wave5kill lever MOVED the tribute supply: kills more than tripled
  pooled (10 → 34 per 8 seeds), peak living veterans reached 2, and the
  tribute was ready on 2 of 16 seeds for the first time. The movement is
  real but thin: 2/16 ever-ready, both windows brief (32 and 3 days), both
  closed by succession.
- The binding constraint is now named precisely and observed directly: the
  scholar drain. Killers keep becoming the scholar (the scholar keeps
  dying), and the scholar never counts toward the tribute. More kills
  alone will not move the tribute past 2/16 — killers have to live AND
  stay non-scholar. That is the next lever's shape, not a demand-number
  move.
- Charter and embassy did not move at all: 0 sealed charters and 0 feast
  bundles on 16/16 seeds. The answermail landing seasons links but no
  charter was sealed in competent play on either band; the bundle half is
  still the embassy's entire missing half (National ladder stage reached
  16/16, d22–58).
- Villages live longer (median 87d → 121.5d pooled) and still reach
  nothing past regional scale: national 0/16, table 0/16, wins 0/16,
  wave-5 kills 0/16.

## Wall (this run's judged corpora, 16 configs)

Wins 0/16, national 0/16, table entered 0/16, full seat 0/16, wave-5
unlock 1/16, wave-5 kills 0/16, median survival 121.5d. The chain still
binds past veterans: the tribute is nearest (2/16) and the charter is
farthest (0/0 ingredients on 16/16).

## Telemetry deviation check (coordinator run, merged master)

- Both corpora: `wall: won=0/8` + the same 3 LOUD lines as the 1030Z
  baseline (national 12→0, table 16→0, wins 16→0). Investigated same-run
  by both workers and confirmed by the coordinator: REGIME artifact (the
  baseline's own `_regime` note forbids comparing pre-seat readiness
  substrates against the winseat stack) + schema absence (census files
  carry no `nationalEver` / `table` fields; `wins` 0/8 is measured and
  expected). Baseline NOT rolled, no investigation item.
- No balance panel (§15 precedent: the panel takes no corpus input — it
  prints only `review_required` on this corpus, same known failure as
  prior runs); the pre-registered primaries are the identical-seed
  comparisons + the constructed rates. No compare `.md` fabricated.

## Infrastructure

- Safe-commit index clobber hit the arm-1 commit (13 files
  staged-as-deleted, scripts MM) and all 3 arm-2 commits — repaired via
  the HEAD-blob pipe (`git ls-tree HEAD -r | git update-index --add
  --index-info`) each time, commits verified correct by blob hash. No
  clobber on the coordinator evidence commit.
- `node scripts/check.js --quick` NOT re-run by the coordinator on merged
  master: zero src/js in both landings; the arm-1 worker's attempt stalled
  10+ min under sibling contention (a sibling loop was concurrently
  running its own check.js) and the 914-entry green list contains no
  capstoneready tests. Precedent (2330Z, 0429Z, 1030Z) holds: the workers'
  proof tests are the verification for zero-src/js landings. Coordinator
  proof re-run on merged master: ALL CAPSTONEREADY-B PROOF LEGS PASS.
- Master moved once under the run before spawning (journey-succession
  r170 closeout, 57547c8dd — the workers' base anchor); it did NOT move
  between the arm-1 merge and the arm-2 merge. Loop A's 1215Z run started
  mid-run (claim fleshout-20261110T1215Z, arms talkturn-a +
  answermail-drive-a + tendexact-a) — NOT touched.
- A runtime restart had interrupted the 1030Z run's second registration;
  no restart hit this run. Worktree registration was slow (~12 min for
  arm 1 under load, ~2.4 min for arm 2), not failed.

## Findings filed (sim-findings.md)

- KILL-LOG VS VETERAN-COUNTER DISAGREE (new open, from arm 1's evidence
  Metric review): the wave-kill log and the living-veteran counter
  disagree per seed — a pyrrhic kill is counted in the log but not the
  counter; a same-day repeat kill is counted but not logged. The log is
  the right source for readiness; the counter needs a reconciliation
  before any lever is judged on counter numbers alone.

## Convergence state

scale-onramp stays converging (NOT converged): the tribute moved for the
first time (2/16 ever-ready) and the scholar drain is now directly
observed, but the charter and embassy are still at zero on 16/16, national
is still 0/16, wins are still 0/16, and wave-5 kills are still 0/16.
food-economy stays converging (untouched; sibling Loop A live on
winnability).
Claim deleted; lock deleted.

Next blanks, in order: (1) volley-softened finish at W=8 (different
lever, own prereg) — gated on the two Steve-calls (wound-mill coverage +
tail width W); (2) flee-repair build (Loop B queue item 2, Steve call —
still held, branch sim-fleerepair-a); (3) sit-becomes-win (Steve-call);
(4) sweep table contract question (Steve-call); (5) trial-by-combat
staging (Steve-call); (6) veteran-survivorship / scholar-drain lever —
killers must live AND stay non-scholar (the tribute's binding constraint
as now observed; NOT a demand-number move — the shape is a design
question: succession, scholar exemption, or killer protection); (7)
Binding counter question — the counter band vs direct-accept ordering,
and the ladder-reward bypass (backlog) — needs a design decision before
any build; (8) gating leg-4 recalibration (decision owed). NOTE for the
next run: Loop A is live on the 1215Z claim (talkturn-a +
answermail-drive-a + tendexact-a) — check its claim before taking any
winnability blank.
