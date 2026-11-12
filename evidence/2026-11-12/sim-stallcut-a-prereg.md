# Stall-cut bisect — pre-registration (arm sim-stallcut-a)

Run fleshout-20261112T1042Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, rank-stall window cut). Written
and committed BEFORE any judged sim. Base: `a18d7438c` ("ladder leg3:
unit proofs — overtime stretch, cash-out + bank, rewards, Haven
panel [needs-eyes]", 2026-11-08 14:48) — the 65th commit in the window
`d229b58f5..6dc7f8162` (131 commits; verified at run start:
`git rev-list --count d229b58f5..a18d7438c` returns 65,
`git rev-parse HEAD` is `a18d7438c`, tree clean).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on a cut INSIDE the rank-stall window to
localize the stall. It changes no game code and builds nothing.

## The question

Round 5 judged the ends of the 393-commit window
`d229b58f5..203a32775` in tertiles: the merge-base `d229b58f5`
MERGEBASE_COLLAPSED 1/8 + RANK_STALL 0/8, cut 1 `6dc7f8162` (the
131st commit) 2/8 survived + 8/8 regional, cut 2 `2215e22d4` (the
262nd) 2/8 + 8/8 regional, the firstparent `203a32775` 4/8
INCONCLUSIVE. The rank stall lifted somewhere in the first
two-thirds of that window while the collapse did not — the two
are separable. A sibling arm (sim-bisect-r6-cut-a, round 6) cuts
inside the collapse window; this arm cuts inside the RANK-STALL
window `d229b58f5..6dc7f8162` (131 commits: merge-base → cut 1)
at its midpoint. This leg tells us which half of the stall
window the stall transition sits in:

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **8/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **0/8** | **102d** |
| bisect-r5-cut1 leg (seeds 190391–190398) | cut 1 `6dc7f8162` | **2/8** | **8/8** | **110d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **8/8** | **144d** |
| this stall-cut leg (seeds 190391–190398) | stall cut `a18d7438c` | **?** | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `a18d7438c`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start — byte-identical to the merge-base /
origin / cut-1 / cut-2 pre-fix file; NO "ROSTER CHECK" marker). The
r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base
(verified: `git merge-base --is-ancestor 5d16916f4 a18d7438c`
fails), so the driver's leg-guard would refuse this base as-is.
Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut2-a preregs: the FIX
`standing.js` is extracted with `git show 5157782a4:src/js/standing.js`,
its sha256 verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the stall-cut base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-stallcut-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the stall-cut base's `standing.js` in exactly two hunks: the
  ROSTER CHECK (`if (roster.indexOf(vid) < 0) return false;`) and
  the sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the stall-cut base predates. On this base
  the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by grep
  on the base — zero matches), and the fix `standing.js` itself
  never calls `this.villageBlooded()` — the wave-5 damage /
  survivability hookup lives in `fieldFights.js` / `game.js` on
  local master, which this base does not have. So the only live
  behavioral delta the swap introduces is the roster check. The
  driver's end-of-run `blooded` read is a report field only (the
  fix file defines `villageBlooded()`, so the read returns a value;
  it records that the village *would* be blooded under the local
  rule, not that any fight was blooded). Same standing as origin-a,
  mergebase-a, and r5-cut2-a.
- **Ladder scholar rule differs across the sides — and across this
  window.** The stall-cut base's `ladder.js _ladderLivingVeterans`
  is the old inline rule (`vp && !vp.dead`, no roster check) with
  the LEG 3 tribute scholar-readiness fix layered on: the scholar is
  NEVER counted (`if (!vid || vid === this.villagerId) return
  false;`) — verified by reading the function at `a18d7438c`.
  That differs from the merge-base `d229b58f5`, whose old inline
  rule counted the scholar as always living; LEG 3 landed
  somewhere between the merge-base and this cut. The merge base
  `e4dbe581b` also never counts the scholar (LEG 3). `5157782a4` /
  master use the shared `countLivingVeterans` (roster check +
  scholar counts, commit `3995d21d6`). The proof test detects which
  scholar rule the LOADED game carries from
  `_ladderLivingVeterans` source and asserts the matching count
  (a scholar wave-3 kill reads 1 in the swapped-in readiness gate
  and the instrument, 0 in this base's ladder); the survival read
  comes from the harness end state, not the ladder.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: regional reach on seeds 190391–190398 on the
stall-cut base `a18d7438c` (with the fix swapped in)**, vs the
merge-base leg's 0/8 regional (RANK_STALL) and the round-5 cut-1
leg's 8/8 regional.

| Outcome | Verdict |
|---|---|
| **≥5/8 regional** | **STALL_LIFTED** — the stall transition sits in the first 65 commits, `d229b58f5` → this cut |
| **≤2/8 regional** | **STALL_STILL_IN** — the transition sits in commits 66–131, this cut → `6dc7f8162` |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

**Survival read (pre-registered alongside regional — judged with
the same rules, not merely reported):** survived count on the same
band, vs the vetphantom fix leg's 6/8 (median 150d) and the cut-1
leg's 2/8 (median 110d). Expected COLLAPSED given cut 1 was 2/8 —
judged as written, not assumed.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **STALLCUT_HEALTHY** |
| **≤2/8 survive** | **STALLCUT_COLLAPSED** |
| **3–4/8 survive** | **INCONCLUSIVE** |

The analyzer (`scripts/bisect-stallcut-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 102d (merge-base) / 110d (cut-1); death-cause shares
vs survivalcontrol's combat-heavy profile (585/615
combat/expedition/wild, starvation 0); wave-5 unlocks; national /
table / wins; standing range; tribute-ready days; phantom days (0
expected — the roster-check fix is swapped in); blooded count
from the summary JSON. **Wave-5 choke:** report peak living
wave-4+ veterans per seed vs the bar of 2.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, and both
  round-5 cuts.** A control/bisect cut re-runs the same seeds on old
  code; that is the point of a bisect, not a freshness violation.
  The seed-band freshness rule exists to stop re-using a band as if
  it were a fresh measurement; this arm explicitly re-uses it as a
  matched control and says so here, in the prereg, before any sim.
  Grep scope for the band's prior uses: `evidence/*/sim-*-prereg.md`.
  Same justification as the survivalcontrol, anchor, merge,
  firstparent, reconciled, origin, mergebase, and r5-cut preregs.
- **Policy: competent verbatim, SINGLE leg on the stall-cut base,
  mode `fix` only** (with the swap — see above). The driver refuses
  to run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `a18d7438c` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set). No garden change on this side.
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL — the
    stall-cut vs firstparent comparison differs only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` differs from `5157782a4`/master only
    by the MISSING opt-in `sourcePatch` hook (8 lines, added
    2026-11-10, after this base; identity by default; this driver
    does not use it), so the master-copied driver runs unchanged
    on this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256 `311f105b…`; deleted
  before finishing) + the driver's live shadow old-rule count per
  snapshot, exactly as vetphantom-driver and mergebase-driver.
  Driver: `scripts/bisect-stallcut-driver-20261112.js` — a copy of
  bisect-r5-cut2-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-stallcut-a/`, RUN =
  `bisect-stallcut-pilot`, arm = `bisect-stallcut`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver carries the tightened
  `\belder\b` veteran-say regex (vetsays fix, landed `9a32925b3`).
  It drops the foraging-basket line ("The pantry can't take more —
  sitting with the elders instead.") from the capture, at the cost
  of the genuine Elderberry teaching line also no longer matching;
  the teaching still happens, it just leaves the veteran-filtered
  capture. Said here, before any sim.
  Analyzer: `scripts/bisect-stallcut-analyze-20261112.js`. Proof:
  `scripts/test-bisect-stallcut-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-stallcut-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-stallcut-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the merge-base
/ cut-1 legs vs this leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a, origin-a, mergebase-a, and r5-cut2-a.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap is the ONE permitted uncommitted file during the run.
  After the run, the original `standing.js` is restored
  byte-identical (sha256 `98c8bfad70d7…`) and `git status` must show
  no `src/js` modification before the evidence commit. If the
  restore fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (survivalcontrol
  MASTER_CHANGE, anchor, mournblooded, merge-a
  COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled
  COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a
  MERGEBASE_COLLAPSED + RANK_STALL, r5-cut1-a, r5-cut2-a
  CUT2_COLLAPSED + REGIONAL_INTACT) — it cuts inside the
  rank-stall window only.
- The sibling round-6 arm (`sim-bisect-r6-cut-a`) runs in its own
  worktree (`sim-bisect-r6-cut-a`); this arm does not touch it, and
  its verdict does not change this leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `a18d7438c` is the 65th commit in
  `d229b58f5..6dc7f8162` (verified by `git rev-list --count`);
  `6dc7f8162` is the 131st commit in `d229b58f5..203a32775`
  (round-5 cut 1).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
