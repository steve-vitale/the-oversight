# Survival-collapse bisect FIRST-PARENT leg — pre-registration (arm sim-bisect-firstparent-a)

Run fleshout-20261112T0332Z, Loop A, axis scale-onramp / survival-collapse
bisect ROUND 3. Written and committed BEFORE any judged sim. Base:
`203a32775` (the reconcile merge `e4dbe581b`'s FIRST parent:
"sim-wave5kill-a: blooded damage/survivability lever for wave-5 kills"),
checked out into this worktree by pathspec (src/js, src/data, index.html,
scripts/policies/competent.js) for the run, then restored — see "The
checkout pattern" below.

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the merge's first parent to cut the
ancestry twist open. It changes no game code and builds nothing.

## The question

The 0215Z round cut the survival collapse to game code in
`5157782a4..3f136f07e`, but with an ancestry twist:
`5157782a4` is NOT an ancestor of the reconcile merge `e4dbe581b` —
it descends from the merge's first parent `203a32775` by 205 commits
(verified at run start: `git rev-list --count 203a32775..5157782a4` =
205; `git merge-base --is-ancestor 5157782a4 e4dbe581b` fails). The
merge tree both ADDS origin-side content (32 src/js files,
+4,916/−1,363) AND LACKS 205 local commits present in the
vetphantom base. The merge-cut leg collapsed 1/8; the vetphantom
fix leg survived 6/8. This leg asks: is the collapse already in
the first parent `203a32775`, or did it arrive with the merge's
second-parent (origin-side) content?

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| merge-cut (seeds 190391–190398) | merge `e4dbe581b` | **1/8** | **126d** |
| policyswap (seeds 190391–190398) | `3f136f07e` code + `5157782a4` policy | **2/8** | **126d** |
| this first-parent leg (seeds 190391–190398) | first parent `203a32775` | **?** | **?** |

## The fix-swap (read carefully — this base predates the roster-check fix)

At `203a32775`, `src/js/standing.js` is the PRE-FIX version (sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
verified at run start — byte-identical to the merge base's pre-fix
file). The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of
this base, so the fix `standing.js` is extracted with `git show
5157782a4:src/js/standing.js`, its sha256 verified to start with
`f8fda4295a99` (full sha
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`),
swapped in UNCOMMITTED, run, then the first parent's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `git status` showing no `src/js`
modification. The `standingSha` in use is recorded per seed in the
corpus. The swap keeps the comparison apples-to-apples: every leg in
this bisect runs WITH the roster check. **The swapped file itself is
never committed.** The driver (`scripts/bisect-firstparent-driver-20261111.js`)
refuses to run unless the on-disk `standing.js` carries the
"ROSTER CHECK" marker AND its sha256 is exactly the fix sha — an
unswapped run is refused loudly, never mislabeled.

## The policy (own policy, not the vetphantom-base policy)

This leg runs `203a32775`'s OWN `scripts/policies/competent.js`
(sha256 `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`,
verified at run start — distinct from the vetphantom-base policy
`0801abd82e52…` and from current master `3c40151e8dd4…`). The
driver records `policySha` per seed and refuses to run unless the
on-disk competent.js sha256 is exactly the first-parent sha — a
wrong-policy run is refused loudly, never mislabeled. The
merge-a §8 follow-up named TWO first-parent legs (own policy vs
vetphantom-base policy swapped in) to control the competent.js
confound; this arm is the OWN-policy leg. The swap leg is a
separate arm, not attempted here.

## The checkout pattern (replicating sim-bisect-merge-a)

HEAD stays on this branch (`sim-bisect-firstparent-a`) for the
whole run — the driver's recorded `anchorCommit` is the branch
commit, as in merge-a. The first parent's game code enters the
worktree by pathspec checkout from `203a32775`:

- `src/js`, `src/data`, `index.html`,
  `scripts/policies/competent.js`

`scripts/sim-harness.js` is byte-identical between `203a32775`
and this branch (verified: `git diff 203a32775 HEAD --
scripts/sim-harness.js scripts/godpath/lib.js` is empty except
for the vetfirst instrument, which postdates the base), so the
branch harness runs the first-parent game code — the same
arrangement merge-a used (branch harness + merge-base game
code). The vetfirst instrument (`scripts/vetfirst-instrument-20261111.js`,
byte-identical to master, sha256 `311f105b…`) is reused
unmodified; it does not exist at `203a32775`, so it stays at the
branch version as committed tooling. After the band, all four
pathspecs are restored to the branch (`git checkout -- <paths>`)
and `git status` must show no modification to them before the
evidence commit. The swapped `standing.js` is restored
byte-identical FIRST (it is inside `src/js`), then the pathspec
restore re-verifies it.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
first parent `203a32775` (with the fix swapped in, own policy)**,
vs the vetphantom fix leg's 6/8 (median 150d) and the merge-cut's
1/8.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **FIRSTPARENT_SURVIVES** — the collapse arrived with the merge's second-parent (origin-side) content; H1 gains. The bisect steps into the origin side next (PR #118 villager-brain, #119 phone-refresh, #120 garden, #121 capable-seed). |
| **≤2/8 survive** | **FIRSTPARENT_COLLAPSES** — the collapse predates the 205 commits; H2 gains. A protective local commit sits in `203a32775..5157782a4` (the collapse is IN `203a32775`, the repair in the 205 commits after it); the bisect steps into that 205-commit range next. |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; say so, do not re-judge. A bigger band or a re-trace is owed before bisecting further. |

The analyzer (`scripts/bisect-firstparent-analyze-20261111.js`)
judges this rule and exits 0 only when it can classify the outcome
under it (any of the three verdicts is a classified outcome; exit 1
only on instrument failure, corpus incompleteness, or an
unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is swapped in); blooded
count from the summary JSON. Trajectory identity vs the
vetphantom, merge-cut, and anchor corpora (daily-hash + death
lists), with the policy-insensitive control seeds 190392/190394/
190396 checked FIRST when judging candidates.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, anchor-a, anchor2-a, merge-a, and
  policyswap-a.** A control/bisect cut re-runs the same seeds on old
  code; that is the point of a bisect, not a freshness violation.
  Same justification as the survivalcontrol and anchor preregs.
- **Policy: competent as of `203a32775` verbatim, SINGLE leg, mode
  `fix` only** (with the standing fix swapped in — see above; the
  driver refuses to run on an unswapped standing.js or a
  wrong-sha policy).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as committed tooling (byte-identical, sha256
  `311f105b…`) + the driver's live shadow old-rule count per
  snapshot, exactly as vetphantom-driver and survivalcontrol-driver.
  Driver: `scripts/bisect-firstparent-driver-20261111.js` — a copy
  of bisect-merge-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-firstparent-a/`, RUN =
  `bisect-firstparent-pilot`, arm = `bisect-firstparent`, mode fixed
  to `fix` only, plus the swap-aware leg guards (standing fix sha +
  first-parent policy sha). Analyzer:
  `scripts/bisect-firstparent-analyze-20261111.js`. Proof:
  `scripts/test-bisect-firstparent-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-firstparent-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/bisect-firstparent-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this first-parent leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, and merge-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap is the ONE permitted uncommitted file during the run
  (plus the four pathspec checkouts, which are the run's base by
  design). After the run, the original `standing.js` is restored
  byte-identical (sha256 `75762cb2259d…`), the four pathspecs are
  restored to the branch, and `git status` must show no
  modification to `src/js`, `src/data`, `index.html`, or
  `scripts/policies` before the evidence commit. If the restore
  fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge the merge-cut verdict
  (COLLAPSE_INSIDE_MERGE stands), the policyswap verdict
  (POLICY_EXONERATED stands), the survivalcontrol verdict
  (MASTER_CHANGE stands), the anchor verdict
  (ANCHOR_NOT_REPRODUCED stands), or the mournblooded verdict
  (exonerated stands) — it cuts at the first parent only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a,
  anchor2-a, merge-a, and policyswap-a). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
