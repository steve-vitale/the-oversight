# Master-regression diagnostic bisect — pre-registration (arm sim-masterregress-a)

Run fleshout-20261113T1115Z, Loop A, axis scale-onramp.
Written and committed BEFORE any judged sim. Base: the branch
`sim-masterregress-a` (tooling commit parent `6a16152d5`); the legs
run on detached checkouts of their bases (see §Multi-base
mechanics). Instrument-only arm — ZERO `src/js` changes committed.

## The question

On the matched band (seeds 190391–190398, 150d death-aware,
competent verbatim, mode `fix` only with the roster-check fix
swapped in), the far end `203a32775` gives 4/8 survived and
current master `f7352f946` gives 1/8 (median 139d). What commit(s)
between `203a32775` and `f7352f946` dropped survival 4/8 to 1/8?
The range is 603 commits (`git log --oneline 203a32775..f7352f946
| wc -l` = 603, verified at run start; first-parent chain 233).

## Settled ground — read this before any sim (why the naive midpoint is NOT cut)

The drop is ALREADY localized to ONE commit by settled arms.
This arm does not re-cut that ground; it reproduces the split at
the boundary with ONE driver in one run, and controls the last
confound at the boundary. The naive midpoint cut is explicitly
NOT run, for the stated reason below.

| Base | Leg (arm) | Survived | Median | Fix swapped? | Policy (own) |
|---|---|---|---|---|---|
| `203a32775` (far end) | firstparent-a | **4/8** | 150d | yes (`f8fda429…`) | `a7ff5c51…` |
| `e4dbe581b` (merge, FP-ordinal 1) | merge-a | **1/8** | 126d | yes (`f8fda429…`) | `26a87e49…` |
| `743e07d87` (reconciled, FP-ordinal 4) | reconciled-a | **1/8** | 126d | yes (`f8fda429…`) | `3c40151e…` |
| `3f136f07e` (anchor) | anchor-a | **1/8** | 126d | yes (native) | `3c40151e…` |
| `d33ca69f9` (master) | survivalcontrol-b | **1/8** | 126d | yes (native) | — |
| `f7352f946` (near end) | burnoffsets-b0 | **1/8** | 139d | no (native `f9359976…`) | `74a890f0…` |
| `5157782a4` (healthy pole) | vetphantom-b fix leg | **6/8** | 150d | yes (native) | `0801abd8…` |

- The merge `e4dbe581b` is FP-ordinal 1 after the far end: its
  FIRST parent IS `203a32775`, its second parent is `a628aeaf3`
  (origin, PR #121 merge). First parent 4/8 → merge 1/8, same
  band, same horizon, same swap, same driver family. The
  reconciled leg (FP-ordinal 4) reads 1/8 on a corpus
  daily-IDENTICAL to anchor-a. Every measured base from
  FP-ordinal 1 onward reads 1/8.
- A cut at the range midpoint — all-commit ordinal 302
  (`0fdf5dcdf`, a sim-tradefirst-a prereg commit) or first-parent
  ordinal 117 (`b96d34361`) — lies in settled-collapsed
  territory: both are descendants of the merge, which already
  reads 1/8 with the fix swapped in. Such a cut can only
  re-confirm 1/8; it cannot localize anything. **NOT run.**
  (The all-commit ordinal is additionally muddy: `0fdf5dcdf` is a
  side-branch commit whose ancestry does NOT include r131
  `5d16916f4`, even though r131 is an ancestor of the tip — the
  603-commit enumeration is not a linear order. The first-parent
  chain is the clean enumeration; its midpoint is still
  settled-collapsed, so neither midpoint is cut.)
- The origin side cannot localize the drop either: its endpoints
  are BOTH collapsed (merge-base `d229b58f5` 1/8, origin
  `a628aeaf3` 2/8) — no healthy→collapsed transition exists on
  that side. NOT bisected.
- The far-end 4/8 is policy-insensitive: firstparent-swap-a
  (first parent + vetphantom policy `0801abd8…`) also reads 4/8,
  same four survivors. The policy confound at the FAR end is
  closed.
- The policy confound AT THE MERGE is the one open item:
  merge-a ran the merge's OWN policy (`26a87e49…`), which differs
  from the far-end policy (`a7ff5c51…`) by ONLY the OVE-160
  garden-appointment reorder (2 hunks, `workGarden`, verified by
  diff at run start). Policyswap-a exonerated that hunk on
  `3f136f07e` code (old policy + new code → 2/8), not on merge
  code. This arm controls it at the merge (leg `mergeps`).
- The merge-a §8 ancestry twist is carried, not re-litigated:
  the merge tree differs from the healthy pole `5157782a4` in
  BOTH directions — it ADDS origin-side content (22 `src/js`
  files, +4,782/−373 vs the far end, this arm's diffstat) AND it
  LACKS 205 local-master commits present in the pole
  (`203a32775..5157782a4`, incl. journey-succession r181 and the
  r131 fix, controlled here by the swap). So the inside-the-merge
  question splits into H1 (origin content) vs H2 (missing local
  protective commits) — the NEXT run's transplant/bisect program,
  named in the evidence, not this arm's GO.

## Legs (4 — all seeds 190391–190398, 150d death-aware, competent verbatim, mode fix only)

| Leg | Base (anchor) | Standing.js | Policy (own, exact sha) | Expect |
|---|---|---|---|---|
| `far` | `203a32775` | swap in fix `f8fda429…` (pre-fix `75762cb2…`) | `a7ff5c51…` | **4/8** (190393/190395/190397/190398 survive; 190391 d86, 190392 d144, 190394 d43, 190396 d87) |
| `near` | `f7352f946` | NATIVE `f9359976…` (marker present, no swap) | `74a890f0…` | **1/8** (190395 survives; 190391 d65, 190392 d143, 190393 d126, 190394 d128, 190396 d140, 190397 d135, 190398 d139) |
| `merge` | `e4dbe581b` | swap in fix `f8fda429…` (pre-fix `75762cb2…`) | `26a87e49…` | **1/8** (190392 survives; 190391 d103, 190393 d115, 190394 d140, 190395 d76, 190396 d126, 190397 d115, 190398 d136) |
| `mergeps` | `e4dbe581b` | swap in fix `f8fda429…` | FAR-END policy `a7ff5c51…` swapped in (policyswap-a pattern) | **≤2/8** (policy exonerated at the merge) |

Leg order (fail fast on a phantom endpoint, then the boundary):
`far` → `near` → `merge` → `mergeps` (`mergeps` needs no new
checkout — same base as `merge`, policy swap only).

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: matched-band survival count /8 per leg.**

| Outcome | Verdict |
|---|---|
| **`far` == 4/8 AND `merge` ≤ 2/8** | **CULPRIT_MERGE** — GO. The 4/8 vs 1/8 split reproduces at the boundary with ONE driver: the culprit commit is the merge `e4dbe581b` (first parent `203a32775` → merge `e4dbe581b`). The inside-the-merge question (H1 origin content vs H2 missing local commits) is the next run's work, named in the evidence. |
| **`far` ≤ 2/8 OR `merge` ≥ 3/8** | **NO-GO — SPLIT NOT REPRODUCED.** STOP and report loudly. The settled localization is in question; the midpoint-cut plan re-opens and this arm does not proceed to a cut. |
| **`near` ≥ 3/8** | **ENDPOINT PHANTOM.** STOP and report loudly. The task's near-end claim (1/8 at `f7352f946`) does not reproduce; do not bisect a phantom. (The `near` leg is a verification leg: it must read 1/8. Its exact per-seed expectation is the burnoffsets-b0 table above.) |

**`mergeps` rule (confound control, judged separately):**

| Outcome | Verdict |
|---|---|
| `mergeps` ≤ 2/8 | **POLICY_EXONERATED_AT_MERGE** — the garden hunk does not carry the drop in merge context; the drop is game-code-only at the merge. |
| `mergeps` ≥ 3/8 | **POLICY_IMPLICATED_AT_MERGE** — the garden hunk carries (part of) the drop in merge context. The CULPRIT_MERGE verdict stands (the commit is still the merge), but the attribution changes: the hunk, not origin game code alone, is implicated. Report both. |

If the `mergeps` swap leg errors on load (far-end policy vs
merge game-code API drift), record it INCOMPLETE with the error
and do not force it — the CULPRIT_MERGE verdict does not depend
on it, and the policyswap-a exoneration on `3f136f07e` code still
stands as the policy evidence.

**Rank read (pre-registered alongside survival — judged, same
bands as r10):** regional reach on the same band.

| Outcome | Rank verdict |
|---|---|
| ≥5/8 regional | **REGIONAL_INTACT** |
| ≤2/8 regional | **RANK_STALL** |
| 3–4/8 regional | **RANK_INCONCLUSIVE** |

**Secondary (reported, not judged):** median survival (upper
median, the analyzer's convention) vs 150d (far end) / 126d
(merge) / 139d (near end); death-cause shares vs the
combat-heavy profile; wave-4 and wave-5 unlocks; national /
table / wins; standing range; tribute-ready; blooded count;
phantom days — defined CORRECTLY (live exceeds shadow = real
phantom; shadow exceeds live during a collapse = expected,
reported not judged). **Wave-5 choke:** peak living wave-4+
veterans per seed vs the bar of 2. **ARC IV firing per seed is
a REPORTED field only** — not judged, no threshold set (the
instrument does not capture ARC IV).

**Deep-identity read (pre-registered):** per-day 4-field
signature (vetsW3, vetsW4, waveKillLog length, roster length) +
full daily-snapshot deep-diff, snapshots paired INDEX-ALIGNED
(never day-keyed), each leg vs its reference corpus:
`far` vs `evidence/2026-11-11/perseed-bisect-firstparent-a/`,
`merge` vs `evidence/2026-11-11/perseed-bisect-merge-a/`,
`near` vs `evidence/2026-11-13/perseed-burnoffsets-a-b0/`.
EXPECT deep-identical on all three (same bases, same swaps,
same policies, same driver family). A divergence is an
instrument finding — reported, investigated, never a verdict
input. (`mergeps` has no reference corpus; it is compared
against this arm's own `merge` corpus.)

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band
  as vetphantom, firstparent, merge, reconciled, anchor,
  survivalcontrol, burnoffsets-b0, and every bisect cut.** A
  control/bisect leg re-runs the same seeds on old code; that is
  the point, not a freshness violation. Grep scope
  `evidence/*/sim-*-prereg.md` on master names seed 190391 in
  26+ prior preregs — same justification as every one of those
  preregs.
- **Policy: competent verbatim, own-policy per leg** (exact shas
  in the legs table — the driver refuses any other sha).
  Policy confound notes (all verified by diff before any sim,
  not assumed):
  - `far` vs `merge` policy diff = garden reorder ONLY (2
    hunks, `workGarden` @1055/1065) — the OVE-160 hunk
    policyswap-a exonerated on `3f136f07e` code.
  - `far` vs pole `5157782a4` policy diff = COUNTER_ANSWER
    block ONLY (env-gated OFF by default — inert unless
    `COUNTER_ANSWER=1`, which this run does not set).
  - `near` policy `74a890f0…` additionally carries the
    journey-landing r127/r128 combat-movement hunks
    (`beastStrikeTarget`, `beastTrickPlay`, `tbIsPlayerTurn`
    guard) and the env-gated RAISER_SEAT/COUNTER_ANSWER blocks
    — all landed AFTER the merge, so none can carry the
    4/8→1/8 drop at the boundary; they are part of the near-end
    substrate, reported here, not controlled.
  - `scripts/sim-harness.js` is BYTE-IDENTICAL at all three
    bases (sha256
    `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js`
  (byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  committed at `near`/branch, copied as UNTRACKED scratch at
  `far`/`merge`/`mergeps` where it does not exist in the tree,
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and the
  bisect drivers. Driver:
  `scripts/masterregress-driver-20261113.js` — a clone of the
  r10-cut driver with the corpus dir parameterized by leg
  (`evidence/2026-11-13/perseed-masterregress-a-<leg>/`), RUN =
  `masterregress-pilot`, arm = `masterregress`, LEG env
  (`far`/`merge`/`near`/`mergeps`/`smoke`), per-leg anchor guard
  (HEAD must equal the leg's base commit), per-leg standing
  guard (swap legs: marker + exact fix sha `f8fda429…`; near
  leg: marker + exact native sha `f9359976…`), per-leg policy
  guard (exact sha; `mergeps`: far-end policy sha on a merge
  base), `policySha` recorded per seed (policyswap-a precedent),
  and the reconciled-a `writeRobust` hardening (Atomics.wait
  real-time backoff, 150 retries — the r10 driver's Date.now
  busy-wait burns instantly under the harness's frozen clock).
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed
  `9a32925b3`), same as r9/r10.
  Analyzer: `scripts/masterregress-analyze-20261113.js`
  (judges the GO/NO-GO + mergeps + rank rules per leg; one
  summary JSON per leg:
  `evidence/2026-11-13/masterregress-a-<leg>-summary.json`).
  Proof: `scripts/test-masterregress-a.js`.
- **Corpora:** `evidence/2026-11-13/perseed-masterregress-a-<leg>/`
  — 8 per-seed JSONs per leg; driver logs
  `evidence/2026-11-13/masterregress-a-<leg>-driver.log`.

## The fix-swap (far / merge / mergeps legs — both bases predate the roster-check fix)

At `203a32775` and at `e4dbe581b`, `src/js/standing.js` is the
PRE-FIX version (sha256
`75762cb2259da3d4d51c57de1548404b45d8269d36a4503341507ed807540e7c`,
hashed by this arm from `git show` on both bases —
byte-identical on both; NO "ROSTER CHECK" marker). The r131
roster-check fix (`5d16916f4`) is NOT an ancestor of either base
(verified: `git merge-base --is-ancestor 5d16916f4 203a32775`
fails, and `git merge-base --is-ancestor 5d16916f4 e4dbe581b`
fails — the fix sits downstream on the local line; `203a32775`
is itself an ancestor OF `5d16916f4`, and the fix enters master
through a later merge). Following the vetphantom-b swap pattern and the
firstparent / merge / reconciled preregs: the FIX `standing.js`
is extracted with `git show 5157782a4:src/js/standing.js`, its
sha256 verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`75762cb2259d…`) plus `cmp` clean plus `git status`
showing no `src/js` modification. The `standingSha` in use is
recorded per seed in the corpus. **The swapped file itself is
never committed.** The driver refuses to run unless the on-disk
`standing.js` carries the "ROSTER CHECK" marker AND its sha256
is exactly the fix sha — an unswapped run is refused loudly,
never mislabeled.

Two whole-file-swap notes, both verified before any sim (not
assumed):

- **BLOODED rider, LIVE on both swap bases (same as the far
  end).** The fix file differs from each swap base's
  `standing.js` in exactly one hunk: the ROSTER CHECK — the
  BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`) is present in BOTH, because the wave5kill
  lever landed in `203a32775` itself and the merge inherits it
  from its first parent. On both bases the block HAS callers (the
  wave5kill hookup in `fieldFights.js` / `game.js`), so the swap
  introduces NO blooded delta at all: the only live behavioral
  delta the swap introduces is the roster check. The driver's
  end-of-run `blooded` read is a report field.
- **Ladder scholar rule — LEG 3 on both swap bases.** Both
  bases' `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) with the LEG 3 tribute
  scholar-readiness fix layered on: the scholar is NEVER counted
  (`if (!vid || vid === this.villagerId) return false;`) —
  verified by reading the function at `e4dbe581b` (line 131) and
  at `203a32775`. There is no `countLivingVeterans` on either
  base. `f7352f946` / master use the shared
  `countLivingVeterans` (roster check + scholar counts, commit
  `3995d21d6`). The proof test detects which scholar rule the
  LOADED game carries from `_ladderLivingVeterans` source and
  asserts the matching count (a scholar wave-3 kill reads 1 in
  the swapped-in readiness gate and the instrument, 0 in these
  bases' ladder); the survival read comes from the harness end
  state, not the ladder. (The `mergeps` policy swap does not
  touch `ladder.js`, so this rule is the same on `merge` and
  `mergeps`.)

## Multi-base mechanics (deviation from single-base precedent — stated here)

Prior bisect arms ran ONE leg on ONE detached base and committed
their tooling on that detached HEAD. This arm runs FOUR legs on
THREE bases with ONE driver, so the tooling is committed ONCE on
branch `sim-masterregress-a` (parent `6a16152d5`), and each leg
runs on a detached checkout of its base with the tooling files
(`masterregress-driver-20261113.js`,
`masterregress-analyze-20261113.js`,
`test-masterregress-a.js`) plus the instrument restored as
UNTRACKED scratch via `git show sim-masterregress-a:<path>`
(the reconciled-a pattern). Scratch copies are DELETED before
checking the branch back out (the reconciled-a checkout-back
hiccup: `git checkout <branch>` refuses while untracked scratch
copies of tracked tool files are present). The evidence commit
sits on the branch; the coordinator adopts by SHA. Do NOT rebase
the tooling onto master (the driver only makes sense against the
leg bases' substrates) and do NOT merge to local master from
here.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call
#4 (veteran bar: readiness reads living roster members with a
recorded wave-(w-1)+ kill in `state.waveKillLog`) and docs/TABLE.md
(the table prices the run, never gates on godhood; reachable by
competent non-god play — Steve 2026-10-11) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their
kills count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Balanced panel (§15) — N/A

Instrument-only legs, no code change, no before/after pair to
compare on one base. The before/after comparison IS the
firstparent leg vs each leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, r5-cut1-a
§7, r5-cut2-a §7, r6-cut-a §7, r7-cut-a §7, r8-cut-a §7, r9-cut-a
§7, r10-cut-a §7, gap-candidates-a §7, and burnoffsets-a §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the leg is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The swap (+ the policy swap on `mergeps`) are the ONLY
  permitted uncommitted changes during a leg (plus the untracked
  instrument/tooling scratch). After each swap leg, the original
  `standing.js` is restored byte-identical (sha256
  `75762cb2259d…`) AND the swapped-in policy file is restored
  byte-identical (`git checkout -- scripts/policies/competent.js`
  + sha verify) before the next leg or any evidence commit. If a
  restore fails, FAIL LOUDLY and do not commit evidence.
- This arm does NOT re-judge any prior verdict (vetphantom GO,
  firstparent INCONCLUSIVE, firstparent-swap INCONCLUSIVE,
  merge-a COLLAPSE_INSIDE_MERGE, reconciled-a COLLAPSE_CONFIRMED,
  origin-a ORIGIN_COLLAPSED, mergebase-a MERGEBASE_COLLAPSED,
  policyswap-a POLICY_EXONERATED, r9-cut INCONCLUSIVE, r10-cut
  INCONCLUSIVE, gap-candidates GAP-NOT-DICE, burnoffsets
  NO-STREAM-SAVES) — it reproduces the boundary split with one
  driver and controls the merge policy confound.
- Do NOT cut at the range midpoint (ordinal 302 / FP-ordinal
  117) — settled-collapsed territory, stated above. Do not touch
  the stall window (commits 58–65 of the old window) — the
  stallcut61 arm owns it. Do not touch Loop B's trees/branches
  (sim-farendcell-b, sim-combatdedup-b) — different questions.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this
  leg's decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted;
  prior bisect arms were REFUSED by the tool (recorder-corpus
  class). If refused again, recorded, not waived, baseline NOT
  rolled.
- Ancestry notes (all verified at run start): `203a32775` is the
  FIRST parent of `e4dbe581b`; `a628aeaf3` is its second parent;
  `e4dbe581b` is FP-ordinal 1 in `203a32775..f7352f946`;
  `743e07d87` is FP-ordinal 4; `203a32775` is an ANCESTOR of
  `5157782a4` (their merge-base is `203a32775` itself);
  `5157782a4` is an ancestor of `f7352f946`; `5d16916f4` is NOT
  an ancestor of `203a32775` or `e4dbe581b` but IS an ancestor of
  `f7352f946` (it enters through a later merge); the FP-midpoint
  `b96d34361` (FP-ordinal 117 of 233) DOES carry the fix natively
  (standing.js sha `1eec2c9235a8…`, marker present) — further
  proof the midpoint is post-collapse territory, not a live
  boundary.
- Flap note: the flap-watch log read ALL-OK at run start
  (2026-11-13 ~11:52Z); the prereg + tooling are written and
  committed only after a probe succeeds. If the flap returns
  mid-run, wait for it to clear rather than bypassing
  safe-commit; never route around a denial. The driver's
  writeRobust carries the reconciled-a Atomics.wait hardening so
  a burst cannot silently lose a seed.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the legs: did the metric set hold, or does a
  metric need revision for the NEXT run?)
