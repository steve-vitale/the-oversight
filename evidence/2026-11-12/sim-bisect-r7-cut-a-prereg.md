# Survival-collapse bisect ROUND 7, cut — pre-registration (arm sim-bisect-r7-cut-a)

Run fleshout-20261112T1315Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, ROUND 7). Written and
committed BEFORE any judged sim. Base: `21fc590d0`
("journey-social-life r167: refresh measurement neutrality proof on
rebased tree", 2026-11-10 05:43 UTC) — the 361st commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..21fc590d0` returns 361,
`git rev-parse HEAD` is `21fc590d0`, tree clean). Setup note: the
worktree arrived checked out at `78d39f56e` (master's parent) and was
checked out to the cut commit before any work, mirroring round 6
(whose prereg commit's parent was its cut commit).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the round-7 cut of the collapse window.
It changes no game code and builds nothing.

## The question

ROUND 5 cut both tertiles and both collapsed: cut 1 (`6dc7f8162`,
the 131st commit) CUT1_COLLAPSED 2/8 + REGIONAL_INTACT, cut 2
(`2215e22d4`, the 262nd commit) CUT2_COLLAPSED 2/8 +
REGIONAL_INTACT — while the firstparent leg on `203a32775`
survived 4/8 (INCONCLUSIVE). ROUND 6 cut at the 328th commit
(`c7786d567`) and also collapsed 2/8 + REGIONAL_INTACT — and its
corpus was deep-identical to cut-2's on all 8 seeds, so commits
263–328 are behaviorally inert on this band. ROUND 7 cuts inside
the final 32 commits, at the 361st commit — 32 commits short of the
firstparent — to ask whether the collapse lifts late in the window
or never lifts inside it at all.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-merge leg (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-reconciled leg (seeds 190391–190398) | reconciled `743e07d87` | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | **126d** |
| bisect-origin leg (seeds 190391–190398) | second parent `a628aeaf3` | **2/8** | **90d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **102d** |
| bisect-r5-cut1 leg (seeds 190391–190398) | cut 1 `6dc7f8162` | **2/8** | **110d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **144d** |
| bisect-r6-cut leg (seeds 190391–190398) | cut `c7786d567` | **2/8** | **144d** |
| this round-7 leg (seeds 190391–190398) | cut `21fc590d0` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `21fc590d0`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start — byte-identical to the merge-base /
origin / round-5-cut / round-6-cut pre-fix file; NO "ROSTER CHECK"
marker). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor
of this base (verified: `git merge-base --is-ancestor 5d16916f4
21fc590d0` fails), so the driver's leg-guard would refuse this base
as-is. Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut1-a / r5-cut2-a / r6-cut-a
preregs: the FIX `standing.js` is extracted with
`git show 5157782a4:src/js/standing.js`, its sha256 verified to be
exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the round-7 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-r7-cut-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the round-7 base's `standing.js` in exactly two hunks: the ROSTER
  CHECK (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the round-7 base predates. On this base
  the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by grep
  on the base — zero matches outside the fix file itself; the base's
  own `standing.js` contains zero mentions), and the fix
  `standing.js` itself never calls `this.villageBlooded()` — the
  wave-5 damage / survivability hookup lives in `fieldFights.js` /
  `game.js` on local master, which this base does not have. So the
  only live behavioral delta the swap introduces is the roster
  check. The driver's end-of-run `blooded` read is a report field
  only (the fix file defines `villageBlooded()`, so the read
  returns a value; it records that the village *would* be blooded
  under the local rule, not that any fight was blooded). Same
  standing as origin-a, mergebase-a, r5-cut1-a, r5-cut2-a, and
  r6-cut-a.
- **Ladder scholar rule — LEG 3, same as round 5 and round 6.**
  This base's `ladder.js _ladderLivingVeterans` is the old inline
  rule (`vp && !vp.dead`, no roster check) with the LEG 3 tribute
  scholar-readiness fix layered on: the scholar is NEVER counted
  (`if (!vid || vid === this.villagerId) return false;`) — verified
  by reading the function at `21fc590d0`. There is no
  `countLivingVeterans` on this base. That differs from the
  merge-base `d229b58f5`, whose old inline rule counted the scholar
  as always living; LEG 3 landed somewhere between the merge-base
  and round 5's cut 1. The merge base `e4dbe581b` also never counts
  the scholar (LEG 3). `5157782a4` / master use the shared
  `countLivingVeterans` (roster check + scholar counts, commit
  `3995d21d6`). The proof test detects which scholar rule the
  LOADED game carries from `_ladderLivingVeterans` source and
  asserts the matching count (a scholar wave-3 kill reads 1 in the
  swapped-in readiness gate and the instrument, 0 in this base's
  ladder); the survival read comes from the harness end state, not
  the ladder.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
round-7 base `21fc590d0` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d), the round-5 cut-2 leg's 2/8
(median 144d), the round-6 leg's 2/8 (median 144d), and the
firstparent leg's 4/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **CUT7_HEALTHY** — the collapse has already lifted by the 361st commit; the transition sits in commits 1–361 of the window |
| **≤2/8 survive** | **CUT7_COLLAPSED** — the collapse is still written in at the 361st commit; the transition sits in the final 32 commits (362–393) |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; this cut does not localize the transition, and the window's far end (firstparent 4/8) was never healthy either |

**Rank read (pre-registered alongside survival — the mergebase
leg's §7 metric note): regional reach on the same band**, vs the
vetphantom fix leg's 8/8 regional and the merge-base leg's 0/8
regional (RANK_STALL). This leg JUDGES rank, not merely
reports it:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** — link/regional formation works at the 361st commit |
| **≤2/8 regional** | **RANK_STALL** — the rank stall has returned / is still in at the 361st commit |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The analyzer (`scripts/bisect-r7-cut-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

The survival result is read against BOTH ends: the round-5 cut-2
leg's 2/8 and the firstparent leg's 4/8. ≥5/8 localizes the exit
inside the window; 3–4/8 says the far end never was healthy.

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 144d (r5-cut2, r6-cut) / 102d (merge-base);
death-cause shares vs survivalcontrol's combat-heavy profile (585/615
combat/expedition/wild, starvation 0); wave-5 unlocks; national /
table / wins; standing range; tribute-ready days; phantom days (0
expected — the roster-check fix is swapped in); blooded count
from the summary JSON. **Wave-5 choke:** report peak living
wave-4+ veterans per seed vs the bar of 2; check the two
round-5-cut-1 choke cases against this base — a weapons-blocked
pair (cut-1 seed 190395 held the pair 12 days, armed 4 vs demand
6) and a fully-ready-but-unlocked village (cut-1 seed 190393 met
every readiness bar for 2 days, d69–70, and still never unlocked;
an open question, not a defect claim).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, both
  round-5 cuts, and the round-6 cut.** A control/bisect cut
  re-runs the same seeds on old code; that is the point of a bisect,
  not a freshness violation. The seed-band freshness rule exists to
  stop re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim. Grep scope
  `evidence/*/sim-*-prereg.md` on master names seed 190391 in **19
  prior preregs** (vetphantom-b, vetsays-b, survivalcontrol-b,
  anchor-a, anchor2-a, merge-a, mournblooded-a, policyswap-a,
  reconciled-a, firstparent-a, firstparent-swap-a, mcconfirm-ctrl-b,
  mcconfirm-merge-b, mergebase-a, origin-a, r5-cut1-a, r5-cut2-a,
  r6-cut-a, stallcut-a) — same justification as every one of those
  preregs.
- **Policy: competent verbatim, SINGLE leg on the round-7 base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `21fc590d0` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set). No garden change on this side.
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`
    on both) — the round-7-cut vs firstparent comparison differs
    only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` is byte-identical too — the round-7
    vs merge-base comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs).
  - `scripts/sim-harness.js` differs from `5157782a4`/master only
    by the MISSING opt-in `sourcePatch` hook (8 lines, added
    2026-11-10, after this base; identity by default; this driver
    does not use it), so the master-copied driver runs unchanged
    on this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/bisect-r7-cut-driver-20261112.js` — a copy of the
  round-6 cut driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-r7-cut-a/`, RUN =
  `bisect-r7-cut-pilot`, arm = `bisect-r7-cut`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver carries the tightened
  veteran-say regex `\belder\b` (vetsays fix, landed `9a32925b3`).
  It drops the foraging-basket line ("The pantry can't take more —
  sitting with the elders instead." — 191/412 captured lines on
  the merge-base leg) from the capture, at the cost of the genuine
  Elderberry teaching line also no longer matching (2 lines on the
  merge-base leg); the teaching still happens, it just leaves the
  veteran-filtered capture. Said here, before any sim.
  Analyzer: `scripts/bisect-r7-cut-analyze-20261112.js`. Proof:
  `scripts/test-bisect-r7-cut-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-r7-cut-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-r7-cut-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this round-7 leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a, origin-a, mergebase-a, r5-cut1-a, r5-cut2-a,
and r6-cut-a.

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
  MERGEBASE_COLLAPSED + RANK_STALL, r5-cut1-a CUT1_COLLAPSED +
  REGIONAL_INTACT, r5-cut2-a CUT2_COLLAPSED + REGIONAL_INTACT,
  r6-cut-a CUT6_COLLAPSED + REGIONAL_INTACT) — it cuts at the
  361st commit only.
- The sibling round-7 arm (if any) runs in its own worktree; this
  arm does not touch it, and its verdict does not change this leg's
  decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `21fc590d0` is the 361st commit in
  `d229b58f5..203a32775` (verified by `git rev-list --count`);
  `203a32775` is an ANCESTOR of `5157782a4` (their merge-base is
  `203a32775` itself), not the reverse — do not assume a linear
  order between the healthy base and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
