# Survival-collapse bisect FIRST-PARENT POLICY-SWAP — pre-registration (arm sim-bisect-firstparent-swap-a)

Run fleshout-20261112T0332Z, Loop A, axis scale-onramp / winnability
chain (survival-collapse bisect, ROUND 3 — the first-parent cut).
Written and committed BEFORE any judged sim. Base: `203a32775`
(the merge's FIRST parent: "sim-wave5kill-a: blooded
damage/survivability lever for wave-5 kills"; read fresh from the
worktree at run start with `git log --oneline -1` after
`git reset --hard 203a32775` — the registered worktree arrived at
master `87cf1d5f7` and was reset to the base, clean, no unique
commits on the branch).

**Instrument-only arm — ZERO src/js changes, ZERO committed policy
changes.** This arm runs the `203a32775` game code with the
`5157782a4` competent policy swapped in (plus the r131 roster-check
fix swapped in, see below) to control for the policy confound on
the first-parent leg. It changes no game code and builds nothing.

## The question

Round 2 established, on the same 8 seeds (190391–190398),
competent, 150d:

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg | `5157782a4` | **6/8** | **150d** |
| bisect-merge-a (merge-cut) | `e4dbe581b` + fix swap | **1/8** | **126d** |
| bisect-policyswap-a (3f136f07e code + old policy) | `3f136f07e` | **2/8** | **126d** |
| this firstparent-swap (203a32775 code + vetphantom policy) | `203a32775` + swaps | **?** | **?** |

The ancestry twist (adopt-round-0215 §8, merge-a §8): `5157782a4`
is NOT an ancestor of the merge `e4dbe581b` — it descends from the
merge's first parent `203a32775` by 205 commits. The merge-cut
leg's 1/8 cannot distinguish (H1) origin-side content in the
merge from (H2) a protective local commit in
`203a32775..5157782a4` that the merge predates. This arm is the
policy control for the sibling firstparent-a leg: same base
`203a32775`, same 8 seeds, same horizon — but with the
vetphantom-base competent.js swapped in. If this leg and the
sibling leg agree, the policy is exonerated on this base too; if
they disagree, the policy matters on this base and the
coordinator must not read the sibling leg alone.

## Premise verification (done fresh at run start, before this prereg)

- `git merge-base --is-ancestor 203a32775 e4dbe581b` — YES, the
  first parent is an ancestor of the merge. `git merge-base
  --is-ancestor 5157782a4 e4dbe581b` — NO (twist confirmed).
- `git diff 203a32775 5157782a4 -- scripts/policies/competent.js`
  is exactly ONE addition: the COUNTER ANSWER block
  (sim-counterclose-a 2026-11-10, 50 insertions / 1 deletion —
  the exports line). It is env-gated (`COUNTER_ANSWER=1`,
  default OFF): a pending table counter is answered daily
  (sweeten at 1,500 kcal when the pantry holds 12,000+, else
  walk away). This is NOT the garden hunk — the garden
  appointment reorder (OVE-160) lives in `5157782a4..3f136f07e`
  and is already exonerated by policyswap-a. The policy this leg
  swaps in is the vetphantom-base policy, counter-answer code
  included, dormant unless the env gate is set (it is not set
  by the driver).
- `git diff 203a32775 5157782a4 -- scripts/sim-harness.js` is
  EMPTY — no harness change in the window.
- `scripts/vetfirst-instrument-20261111.js` did NOT exist at
  `203a32775` (added in the window, 404 lines); it is copied
  from master as UNTRACKED scratch for this run (sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`,
  same sha anchor2-a / policyswap-a recorded), never committed,
  deleted before finishing — the merge-a pattern.
- `src/js/standing.js` at `203a32775` is the PRE-FIX version
  (sha256
  `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
  same sha as the merge base) with NO `ROSTER CHECK` marker.
  The r131 roster-check fix (`5d16916f4`) is NOT an ancestor of
  `203a32775` and IS an ancestor of `5157782a4` — so the fix
  `standing.js` must be swapped in, exactly as merge-a did.

## The swaps (read carefully — TWO uncommitted swaps)

The two competent.js versions, verified by sha256 at run start:

- VETPHANTOM-BASE (`5157782a4`): `0801abd82e527dbe6f97ab56c8f0ddb55744998a04a22f332b4bb9b943ecca05` (same sha policyswap-a recorded as OLD)
- BASE (`203a32775`, on-disk at run start): `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`

The two standing.js versions:

- FIX (`5157782a4`): `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`
- BASE (`203a32775`, on-disk at run start): `75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`

Following the merge-a fix-swap pattern
(evidence/2026-11-11/sim-bisect-merge-a-prereg.md) and the
policyswap-a policy-swap pattern
(evidence/2026-11-11/sim-bisect-policyswap-a-prereg.md): the FIX
standing.js and the VETPHANTOM-BASE competent.js are each
extracted with `git show 5157782a4:<path>`, their sha256 verified
to be exactly the shas above, swapped in UNCOMMITTED, run, then
both base versions restored byte-identical afterwards and verified
by sha256 (`75762cb2259d…` + `a7ff5c516440…`) plus `git status`
showing no `src/js` or `scripts/policies` modification. **Neither
swapped file is ever committed.** The driver
(`scripts/bisect-firstparent-swap-driver-20261111.js`) REFUSES to
run unless the on-disk competent.js sha256 is exactly the
vetphantom-base sha AND the on-disk standing.js carries the
ROSTER CHECK marker with exactly the fix sha — an unswapped run
is refused loudly, never mislabeled. The in-use shas are recorded
per seed in the corpus (`policySha`, `policyVersion:
'5157782a4-competent'`, `standingSha`).

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call
#4 (veteran bar: `Game.waveCombatReadiness(w)` reads four named
bars from LIVE village state — never a policy lever, never a fake
number) and Steve's 2026-11-10 scholar-counts ruling. No canon
doc covers survival-collapse attribution; nothing here invents
canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on
`203a32775` game code with the VETPHANTOM-BASE (`5157782a4`)
competent policy (fix swapped in)**, vs the vetphantom fix leg's
6/8 (median 150d) and the sibling firstparent-a leg's number
(which this arm does NOT have — the arms run in parallel; this
arm judges on its own bands only, and reports its numbers in the
same table shape as policyswap-a/merge-a so the coordinator can
judge agreement).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **FIRST_PARENT_SURVIVES** — the first parent survives under the vetphantom policy; the collapse is in the merge's second-parent (origin) content or in the 205-commit local range after the first parent, not in the first parent itself |
| **≤2/8 survive** | **FIRST_PARENT_COLLAPSES** — the first parent collapses under the vetphantom policy; the collapse predates the merge on the local line and the repair sits in `203a32775..5157782a4` |
| **3–4/8 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting further |

The analyzer (`scripts/bisect-firstparent-swap-analyze-20261111.js`)
judges this rule and exits 0 only when it can classify the
outcome under it (any of the three verdicts is a classified
outcome; exit 1 only on instrument failure, corpus
incompleteness, or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) and 126d (merge-a / anchor-a); death-cause shares vs
the combat-heavy profile (merge-a: 585/621 combat/expedition/wild,
starvation 0); wave 4–5 unlocks; national/table/wins; standing
range; tribute-ready days; phantom days (0 expected — the
roster-check fix is swapped in); blooded count from the summary
JSON. **Trajectory identity (§2 of the evidence):** the per-seed
daily-snapshot hashes are compared against the vetphantom fix
corpus (`perseed-vetphantom-b/`) and the merge-a corpus
(`perseed-bisect-merge-a/`) — and the policy-insensitive control
seeds 190392/190394/190396 (policyswap-a §2: bit-identical under
both competent.js versions) are checked first when judging
candidates.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, survivalcontrol, anchor-a, anchor2-a, merge-a,
  and policyswap-a.** A control/bisect leg re-runs the same seeds
  on old code; that is the point of a bisect, not a freshness
  violation. The seed-band freshness rule exists to stop re-using
  a band as if it were a fresh measurement; this arm explicitly
  re-uses it as a matched control and says so here, in the prereg,
  before any sim. Same justification as the survivalcontrol,
  anchor, merge-a, and policyswap-a preregs.
- **Policy: competent as of `5157782a4`, verbatim except the
  swap itself — SINGLE leg, mode `fix` only.** The vetphantom
  fix is swapped in (roster-check marker + exact fix sha
  required by the driver guard), so there is no pre-fix control
  variant to rebuild — the driver refuses to run unless both
  swaps are exactly right (swap-aware double leg guard, same
  shape as merge-a's standing.js guard + policyswap-a's policy
  guard).
- **Seeds run ONE SEED PER NODE PROCESS** (never two harnesses
  in one process; repo AGENTS.md sim harness rules — Math.random
  seeded BEFORE eval, modules capture it at load; eval the FULL
  src/js/*.js list in index.html order minus DOM-only
  app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js; never
  stub Game.save). The driver takes `SEEDS=<single seed>` per
  invocation and refuses to overwrite an existing per-seed file.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  copied from master as untracked scratch (see above) + the
  driver's live shadow old-rule count per snapshot, exactly as
  vetphantom-driver, survivalcontrol-driver, merge-driver, and
  policyswap-driver. Driver:
  `scripts/bisect-firstparent-swap-driver-20261111.js` — a copy
  of bisect-policyswap-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-firstparent-swap-a/`, RUN =
  `bisect-firstparent-swap-pilot`, arm = `bisect-firstparent-swap`,
  mode fixed to `fix` only, plus the swap-aware double leg guard
  (exported `legGuard` + `standingGuard`, exact-sha). Analyzer:
  `scripts/bisect-firstparent-swap-analyze-20261111.js`. Proof:
  `scripts/test-bisect-firstparent-swap-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-firstparent-swap-a/`
  — 8 per-seed JSONs; summary
  `evidence/2026-11-11/bisect-firstparent-swap-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair
to compare on this base. The before/after comparison IS the
vetphantom fix leg vs this first-parent swap leg on identical
seeds, judged by the analyzer's decision rule. Same standing as
survivalcontrol-b §7, anchor-a §7, merge-a §7, and
policyswap-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swaps are the ONLY permitted uncommitted files during the
  run (plus the untracked instrument scratch, deleted before
  finishing). After the run, both base files are restored
  byte-identical (sha256 `75762cb2259d…` + `a7ff5c516440…`) and
  `git status` must show no `src/js` or `scripts/policies`
  modification before the evidence commit. If a restore fails,
  FAIL LOUDLY and do not commit evidence.
- Hermeticity (sim-findings-a, adopt-round-0215 Arm 3): the
  driver guards fire at the RUN entry point (`readGuards()` in
  `main()`), never at require time; guard texts in the proof come
  from PINNED commits (`git show 5157782a4:` / `git show
  203a32775:`), never live disk; the ladder rule is detected from
  loaded code. A wrong-sha swap must exit 2 loudly.
- This arm does NOT re-judge the survivalcontrol verdict
  (MASTER_CHANGE stands), the anchor verdicts
  (ANCHOR_NOT_REPRODUCED / ANCHOR_REPRODUCES stand), the
  mournblooded verdict (exonerated stands), the merge-a verdict
  (COLLAPSE_INSIDE_MERGE stands — count only, gloss superseded
  by the ancestry twist), or the policyswap-a verdict
  (POLICY_EXONERATED stands) — it controls for the policy on the
  first parent only.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies. If a game defect is found, DOCUMENT it, do not fix it
  — this is a bisect leg.
- Telemetry deviation check (loop body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, survivalcontrol-b, anchor-a,
  anchor2-a, merge-a, and policyswap-a). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
