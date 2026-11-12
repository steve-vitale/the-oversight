# Survival-collapse bisect ROUND 10, cut — pre-registration (arm sim-bisect-r10-cut-a)

Run fleshout-20261112T1624Z (continued), Loop A, axis scale-onramp /
winnability chain (the survival-collapse bisect, ROUND 10, final
localizing cut). Written and committed BEFORE any judged sim. Base:
`c67a17564` ("sim-bindingtrace-b: BELONG chain tracer — the Binding
fails at B1, the counter never fires (DIAG-GO, 8+8 pilot, band
81201-81208)", 2026-11-10) — the 389th commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..c67a17564` returns 389,
`git rev-parse HEAD` is `c67a17564` at run start, tree clean).
Setup note: the worktree arrived with a COMPLETE checkout on branch
`sim-bisect-r10-a` at master tip `5f7250e26`; it was checked out
detached to the cut commit before any work, with no recovery needed —
same as round 9.

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the round-10 cut of the collapse window.
It changes no game code and builds nothing.

## The question

ROUND 9 cut at the 385th commit (`ee30f22a2`) and read INCONCLUSIVE
4/8 + REGIONAL_INTACT 7/8 — reproducing the firstparent's 4/8
exactly (same four survivors, same four death days, deep-identical
trajectories on 6/8 seeds). The 2/8→4/8 exit sits in commits 378–385
(the melee-first slot rule); the remaining distance to the
firstparent sits on seeds 190393/190397 only, and must sit in
commits 386–393. The far end itself is 4/8, so **no cut in the last
8 commits can return CUT_HEALTHY** — the healthy pole is NOT in
this window. ROUND 10 cuts at the MIDPOINT of the last 8, the 389th
commit, as the final localizing cut: it asks whether the
190393/190397 remainder sits in commits 386–389 or in 390–393.

**The r9 prereg's decision table is REVISED here, before any sim,
exactly as the r9 evidence §7 metric note and the round-9
coordinator evidence (§8 blank 1) required.** The revision is the
whole point of this prereg: the r9 table's top band (≥5/8 →
CUT9_HEALTHY) cannot fire on this cut, because the far end is 4/8
— a cut reading ≥5/8 would EXCEED the far end, which under the
bisect's monotone reading means commits 390–393 hurt survival, not
that a healthy pole was found. The revised table names that outcome
for what it is instead of mislabeling it healthy.

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
| bisect-r7-cut leg (seeds 190391–190398) | cut `21fc590d0` | **2/8** | **144d** |
| bisect-r8-cut leg (seeds 190391–190398) | cut `a6ed956f5` | **2/8** | **144d** |
| bisect-r9-cut leg (seeds 190391–190398) | cut `ee30f22a2` | **4/8** | **150d** |
| this round-10 leg (seeds 190391–190398) | cut `c67a17564` | **?** | **?** |

## Pre-registered expectation (not a verdict)

Commits 386–389 change **73 files, +813,565/−0 lines — ALL
`evidence/` and `scripts/`, with ZERO `src/js`, ZERO `src/data`,
and ZERO `docs`** (verified by `git diff --stat
ee30f22a2..c67a17564` and by `git diff --name-only`, whose
non-`evidence/` entries are exactly six scripts files):

- `7e73d873d` (386th): sim-meleefirst-b measurement — evidence +
  32-seed corpus (fs-s9958x JSONs), verdict GO. No code.
- `53185abea` (387th): sim-meleefirst-b adoption — coordinator
  evidence (stale-lock recovery + landing of the dead 0626Z arm).
  No code.
- `5c8b07624` (388th): sim-capstoneready-b — ladder capstone-deed
  readiness census: instrument + proof + analyzer
  (`scripts/capstoneready-b-driver.js`,
  `scripts/capstoneready-b-analyze.js`,
  `scripts/test-capstoneready-b.js`), zero src/js.
- `c67a17564` (389th): sim-bindingtrace-b — BELONG chain tracer:
  a NEW POLICY file (`scripts/policies/bindingtrace-b.js`) plus its
  proof tests and sense transcripts. The tracer policy is never
  loaded by this arm's driver, which requires
  `scripts/policies/competent` only.

So unlike round 9, the round-10 corpus **IS expected to be
deep-identical to round 9's**: no game code changed between the
385th and the 389th commit, and the two files the driver actually
runs — `scripts/policies/competent.js` and
`scripts/sim-harness.js` — are BYTE-IDENTICAL between the two
bases (sha256 `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`
and `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`,
verified on both bases; competent.js is also byte-identical to the
firstparent's). If the corpus DOES come back deep-identical to r9's,
that is the expected finding, and it localizes the 190393/190397
remainder to commits 390–393 (the wave-5-kill lever commit, the
journey-landing fix, and the firstparent itself — see below). If it
diverges, that itself is a finding demanding investigation, because
no game code moved: a divergence could only come from instrument
or harness drift, never from a lever.

What sits in 390–393 (for the record, not run here):
`e628f9485` (390th, Loop B coordinator evidence), `57e0eb67b`
(391st, journey-landing observe-react pool fix — game code),
`48e7aeafe` (392nd, sim-wave5kill-a prereg), `203a32775` (393rd,
sim-wave5kill-a blooded damage/survivability lever — game code,
`[needs-eyes]`). The 190393/190397 remainder, if it is in 390–393,
is therefore most plausibly in the wave-5-kill lever or the
journey-landing fix — but that is the NEXT cut's question, not
this arm's.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `c67a17564`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
hashed by this arm from `git show c67a17564:src/js/standing.js` —
byte-identical to the merge-base / origin / round-5-cut /
round-6-cut / round-7-cut / round-8-cut / round-9-cut pre-fix file;
NO "ROSTER CHECK" marker). The r131 roster-check fix (`5d16916f4`)
is NOT an ancestor of this base (verified: `git merge-base
--is-ancestor 5d16916f4 c67a17564` fails), so the driver's leg-guard
would refuse this base as-is. Following the vetphantom-b swap
pattern (evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut1-a / r5-cut2-a / r6-cut-a /
r7-cut-a / r8-cut-a / r9-cut-a preregs: the FIX `standing.js` is
extracted with `git show 5157782a4:src/js/standing.js`, its sha256
verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the round-10 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-r10-cut-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the round-10 base's `standing.js` in exactly two hunks: the ROSTER
  CHECK (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the round-10 base predates. On this base
  the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by
  `grep` on the base tree — zero matches outside `standing.js`
  itself, and the fix `standing.js` itself never calls
  `this.villageBlooded()`), and the fix file's diff against this
  base's `standing.js` is the same two-hunk shape as round 9's. So
  the only live behavioral delta the swap introduces is the roster
  check. The driver's end-of-run `blooded` read is a report field
  only (the fix file defines `villageBlooded()`, so the read
  returns a value; it records that the village *would* be blooded
  under the local rule, not that any fight was blooded). Same
  standing as origin-a, mergebase-a, r5-cut1-a, r5-cut2-a,
  r6-cut-a, r7-cut-a, r8-cut-a, and r9-cut-a.
- **Ladder scholar rule — LEG 3, same as round 5, round 6, round 7,
  round 8, and round 9.** This base's `ladder.js
  _ladderLivingVeterans` is the old inline rule (`vp && !vp.dead`,
  no roster check) with the LEG 3 tribute scholar-readiness fix
  layered on: the scholar is NEVER counted (`if (!vid || vid ===
  this.villagerId) return false;`) — verified by reading the
  function at `c67a17564` (line 136). There is no
  `countLivingVeterans` on this base. That differs from the
  merge-base `d229b58f5`, whose old inline rule counted the
  scholar as always living; LEG 3 landed somewhere between the
  merge-base and round 5's cut 1. The merge base `e4dbe581b` also
  never counts the scholar (LEG 3). `5157782a4` / master use the
  shared `countLivingVeterans` (roster check + scholar counts,
  commit `3995d21d6`). The proof test detects which scholar rule
  the LOADED game carries from `_ladderLivingVeterans` source and
  asserts the matching count (a scholar wave-3 kill reads 1 in the
  swapped-in readiness gate and the instrument, 0 in this base's
  ladder); the survival read comes from the harness end state, not
  the ladder.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and docs/TABLE.md (the table
prices the run, never gates on godhood; reachable by competent
non-god play — Steve 2026-10-11) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (REVISED — a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
round-10 base `c67a17564` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d), the round-9 cut leg's 4/8
(median 150d), and the firstparent leg's 4/8 (median 150d). The
result is read against BOTH ends: the firstparent is only 4/8
INCONCLUSIVE, not healthy — and this revision is the point of this
prereg (see "The question").

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **CUT10_ABOVE_FAR_END** — UNEXPECTED, and NOT a healthy pole: the cut exceeds the far end's 4/8, so commits 390–393 would have to HURT survival. Investigate before believing it; never report it as CUT_HEALTHY. CUT_HEALTHY is impossible on this cut by construction (the far end is 4/8). |
| **≤2/8 survive** | **CUT10_COLLAPSED** — the 2/8→4/8 exit does not hold at the 389th commit; the transition sits in 390–393, or the run is anomalous (no game code moved in 386–389, so a collapse here demands an instrument/harness investigation, not a lever read). |
| **3–4/8 survive** | **INCONCLUSIVE** — the expected band. The window's far end never was healthy; the healthy pole needs re-finding outside this window (option b — see "Healthy-pole re-derivation", below). A 4/8 that is deep-identical to round 9's corpus localizes the 190393/190397 remainder to commits 390–393. |

**Rank read (pre-registered alongside survival — the mergebase
leg's §7 metric note): regional reach on the same band**, vs the
vetphantom fix leg's 8/8 regional and the merge-base leg's 0/8
regional (RANK_STALL). This leg JUDGES rank, not merely
reports it. The rank rules are UNCHANGED from round 9 — the
healthy-pole problem touches survival only:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** — link/regional formation works at the 389th commit |
| **≤2/8 regional** | **RANK_STALL** — the rank stall has returned / is still in at the 389th commit |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The analyzer (`scripts/bisect-r10-cut-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 150d (r9-cut, firstparent) / 144d (r8-cut, r7-cut,
r6-cut, r5-cut2) / 102d (merge-base); death-cause shares vs
survivalcontrol's combat-heavy profile (585/615 combat/expedition/
wild, starvation 0); wave-5 unlocks; national / table / wins;
standing range; tribute-ready days; phantom days (0 expected — the
roster-check fix is swapped in); blooded count from the summary
JSON. **Wave-5 choke:** report peak living wave-4+ veterans per
seed vs the bar of 2; check the round-9 choke case against this
base — seed 190398 held the pair 19 days (d131–149), armed 4–5 vs
demand 6, never qualifying. **ARC IV firing per seed is a REPORTED
field only** — it is not judged and no threshold is set on it.
**Deep-identity read (pre-registered):** the per-day signature is
the 4-field tuple (vetsW3, vetsW4, waveKillLog length, roster
length) against the r9-cut corpus on master, plus a full
daily-snapshot deep-diff. Deep-identity to r9 is the EXPECTED
outcome (no game code moved); any divergence is a finding, not a
verdict input.

## Healthy-pole re-derivation (option b — NOT this arm's work)

The r9 evidence §7 and the round-9 coordinator evidence (§8 blank
1) record the choice the next run must make: (a) this final
localizing cut at ~389, or (b) stop cutting and re-derive the
healthy pole outside this window. This arm is (a). Option (b) is
the NEXT run's work, recorded here so it is not lost: the
vetphantom fix leg's 6/8 sits on base `5157782a4`, which is not a
simple ancestor of this window's far end (the prereg ancestry note
in r9-cut-a: `203a32775` is an ANCESTOR of `5157782a4`, not the
reverse — do not assume a linear order between the healthy base
and the local merge-tip), so the bisect's "healthy" end needs
re-derivation — a fresh comparison of what `5157782a4` carries that
the window's far end does not — not another cut inside 378–393.
This arm does not attempt it.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, all three
  round-5/6/7 cuts, the round-8 cut, and the round-9 cut.** A
  control/bisect cut re-runs the same seeds on old code; that is
  the point of a bisect, not a freshness violation. The seed-band
  freshness rule exists to stop re-using a band as if it were a
  fresh measurement; this arm explicitly re-uses it as a matched
  control and says so here, in the prereg, before any sim. Grep
  scope `evidence/*/sim-*-prereg.md` on master names seed 190391
  in **26 prior preregs** (vetphantom-b, vetsays-b,
  survivalcontrol-b, anchor-a, anchor2-a, merge-a, mournblooded-a,
  policyswap-a, reconciled-a, firstparent-a, firstparent-swap-a,
  mcconfirm-ctrl-b, mcconfirm-merge-b, mergebase-a, origin-a,
  r5-cut1-a, r5-cut2-a, r6-cut-a, r7-cut-a, r8-cut-a, r9-cut-a,
  cut2confirm-b, cut7confirm-b, stallcut-a, stallcut32-a,
  stallcut49-a) — same justification as every one of those
  preregs.
- **Policy: competent verbatim, SINGLE leg on the round-10 base,
  mode `fix` only** (with the swap — see above). The driver refuses
  to run on the unswapped file (swap-aware leg guard: marker +
  exact fix sha). Policy confound notes (all verified by diff
  before any sim, not assumed):
  - `scripts/policies/competent.js` on `c67a17564` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set). No garden change on this side. (Same standing as r9;
    competent.js is byte-identical between `ee30f22a2` and
    `c67a17564`.)
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`
    on both) — the round-10-cut vs firstparent comparison differs
    only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` is byte-identical too — the round-10
    vs merge-base comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs).
  - `scripts/sim-harness.js` at `c67a17564` is BYTE-IDENTICAL to
    `5157782a4` (sha256
    `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`)
    and carries the opt-in `sourcePatch` hook — the master-copied
    driver runs unchanged on this base and does not use the hook,
    so the round-10 vs vetphantom comparison differs only in game
    code (plus the controlled standing.js swap, identical on both
    legs).
  - `scripts/policies/bindingtrace-b.js` (new in commit 389) is a
    separate policy file, never required by the competent driver or
    the harness; it cannot touch this leg.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/bisect-r10-cut-driver-20261112.js` — a copy of the
  round-9 cut driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-r10-cut-a/`, RUN =
  `bisect-r10-cut-pilot`, arm = `bisect-r10-cut`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **`\belder\b` filter:** the driver carries the tightened
  veteran-say regex `\\belder\\b` (vetsays fix, landed `9a32925b3`).
  It drops the foraging-basket line ("The pantry can't take more —
  sitting with the elders instead." — 191/412 captured lines on
  the merge-base leg) from the capture, at the cost of the genuine
  Elderberry teaching line also no longer matching (2 lines on the
  merge-base leg); the teaching still happens, it just leaves the
  veteran-filtered capture. Said here, before any sim.
  Analyzer: `scripts/bisect-r10-cut-analyze-20261112.js`. Proof:
  `scripts/test-bisect-r10-cut-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-r10-cut-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-r10-cut-a-summary.json`.
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far (round 6's
  text named a 5th field, but its published days reproduce under
  the 4-field version; deaths move a day before the game-state
  fields do on some seeds). Compare against the r9-cut corpus on
  master, plus a full daily-snapshot deep-diff. Veteran killers in
  the instrument are keyed `by`, not `vid` — a phantom check
  reading `k.vid` silently checks nothing.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this round-10 leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, r5-cut1-a §7,
r5-cut2-a §7, r6-cut-a §7, r7-cut-a §7, r8-cut-a §7, and r9-cut-a §7.

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
  r6-cut-a CUT6_COLLAPSED + REGIONAL_INTACT, r7-cut-a
  CUT7_COLLAPSED + REGIONAL_INTACT, r8-cut-a CUT8_COLLAPSED +
  REGIONAL_INTACT, r9-cut-a INCONCLUSIVE + REGIONAL_INTACT) — it
  cuts at the 389th commit only.
- The sibling Loop B arms run in their own worktrees; this arm does
  not touch them, and their verdicts do not change this leg's
  decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `c67a17564` is the 389th commit in
  `d229b58f5..203a32775` (verified by `git rev-list --count`);
  `ee30f22a2` (385th) is an ANCESTOR of `c67a17564`, and
  `c67a17564` is an ancestor of `203a32775` (all verified);
  `203a32775` is an ANCESTOR of `5157782a4` (their merge-base is
  `203a32775` itself), not the reverse — do not assume a linear
  order between the healthy base and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
