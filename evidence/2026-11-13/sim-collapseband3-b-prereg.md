# Fourth fresh band on the bisect round-7 cut + ARC-negative leg — pre-registration (arm sim-collapseband3-b)

Run fleshout-loop-b-20261113T0830Z, Loop B, axis winnability chain
(fourth fresh band on Loop A's round-7 cut + the ARC-negative leg).
Written and committed BEFORE any judged sim. Base: `21fc590d0`
("journey-social-life r167: refresh measurement neutrality proof on
rebased tree", 2026-11-10 05:43 UTC) — the 361st commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..21fc590d0` returns 361).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 16-seed band on the round-7 cut of the collapse window,
plus a 2-seed ARC-negative leg on the same base. It changes no game
code and builds nothing.

## Branch / run mechanics (read carefully — this tree was registered at master, not at the base)

The worktree `sim-collapseband3-b` was registered at the master tip
at spawn; the branch `sim-collapseband3-b` carries the arm's
commits at its tip. The prereg, driver, analyzer,
and proof are committed on that master-based branch. The SIMS
themselves run with the worktree checked out at the base commit
`21fc590d0` (detached HEAD, exactly as the r7 cut arm and the
cut7confirm-b / collapseband3-a arms ran), with the four committed
files copied back in as uncommitted scratch plus the vetfirst
instrument copied from master as untracked scratch (it does not
exist at this base), the roster-check fix swapped in uncommitted,
and the per-seed corpora carried back as untracked files. After the
band the fix is restored byte-identical, the scratch copies are
deleted, the branch is checked out again, and only then is the
evidence + corpora committed on the branch. No scratch file is ever
committed; no src/js file is ever committed.

## The question

Loop A landed CUT7_COLLAPSED on base `21fc590d0` (arm
sim-bisect-r7-cut-a, evidence/2026-11-12/sim-bisect-r7-cut-a.md):
2/8 survived, median 144d, regional 8/8, on the vetphantom band
190391–190398. cut7confirm-b then read 4/16 survived on fresh seeds
190701–190716 (evidence/2026-11-12/sim-cut7confirm-b.md) — exactly
the r7 rate (25%), but exactly on the CONFIRMED band's edge: one
more survivor would have read INCONCLUSIVE. collapseband3-a then
read 3/16 on fresh seeds 190721–190736
(evidence/2026-11-12/sim-collapseband3-a.md) — below the edge, so
25% is not the edge of the true rate; the pooled rate across the
three bands on this base family is 9/40 (22.5%). This leg is the
fourth fresh band: does the collapse hold a fourth time?

**Band note (brief vs landing order):** the brief for this arm named
it the "third fresh band" and its USED list (190701–190716,
190391–190398, 190401–190408) predates Loop A's collapseband3-a
landing. Loop A's collapseband3-a IS the third fresh band
(190721–190736, landed 2026-11-12). This arm therefore takes the
next free band, 190737–190752 — the FOURTH fresh band — and does
not reuse 190721–190736.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **102d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **144d** |
| bisect-r6-cut leg (seeds 190391–190398) | cut `c7786d567` | **2/8** | **144d** |
| bisect-r7-cut leg (seeds 190391–190398) | cut `21fc590d0` | **2/8** | **144d** |
| cut2confirm-b (fresh seeds 190601–190616) | cut 2 `2215e22d4` | **2/16** | **129d** |
| cut7confirm-b (fresh seeds 190701–190716) | cut `21fc590d0` | **4/16** | **127d** |
| collapseband3-a (fresh seeds 190721–190736) | cut `21fc590d0` | **3/16** | **125d** |
| this leg (fresh seeds 190737–190752) | cut `21fc590d0` | **?** | **?** |

## Seed-band freshness (verified before any sim — local_seed_band_freshness)

Chosen band: **190737–190752** (16 seeds, next free band after
collapseband3-a's 190721–190736). Search scope and result, all run
before any sim:

- All dated preregs under `evidence/*/sim-*-prereg.md`:
  `grep -rln "19073[0-9]|19074[0-9]|19075[0-9]"` → exactly one
  file, `evidence/2026-11-12/sim-collapseband3-a-prereg.md`, whose
  hits are all its own band 190721–190736 (19073[0-6] only). No
  prereg names any 190737–190752 seed.
- All dated `*.md` under `evidence/`: word-boundary grep for
  `1907(3[7-9]|4[0-9]|5[0-2])` → zero files.
- Word-boundary pass over ALL of `evidence/` (ripgrep `-w`, all 16
  literals): exactly two files, both the same incidental numeric
  fragment — `"depriKcalCum":190748` in
  `evidence/2026-10-24/belongcost-b-corpus/belongcost-b-pd1-dg1-leadfeast-s94106.json`
  and in `evidence/2026-10-24/belongcost-b-corpus/sweep-pd1-dg1-leadfeast.json`
  (the same corpus value in two files). A kcal cumulative, not a
  seed naming. No per-seed corpus was ever written for these seeds.
- Filenames under `evidence/`: zero files are named with any
  190737–190752 seed — the only `*1907*` filenames are 4-digit
  `s1907` / `s51907` / `s71907` corpus files.
- Forbidden / contaminated band lists named in preregs: the
  standacc-b list covers 99201–99208; belongzombie names
  99009–99024; a further list names 99001–99008, 99041–99052,
  99101, 99201–99216, 99217–99232. None touches 190737–190752. No
  standalone forbidden-band list file exists in `evidence/` or the
  goal hidden_files.
- **Result: band 190737–190752 is fresh.** No collision; no
  alternate band was needed.

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
merge-a / origin-a / mergebase-a / r5-cut2-a / r6-cut-a / r7-cut-a /
cut7confirm-b / collapseband3-a preregs: the FIX `standing.js` is
extracted with `git show 5157782a4:src/js/standing.js`, its sha256
verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the round-7 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/collapseband3-b-driver-20261113.js`) refuses to run
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
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by
  `git grep -l` on the base — zero matches; the base's own
  `standing.js` contains zero mentions), and the fix
  `standing.js` itself never calls `this.villageBlooded()` (verified:
  count 0). So the only live behavioral delta the swap introduces
  is the roster check. The driver's end-of-run `blooded` read is a
  report field only (the fix file defines `villageBlooded()`, so
  the read returns a value; it records that the village *would* be
  blooded under the local rule, not that any fight was blooded).
  Same standing as origin-a, mergebase-a, and r5-cut2-a.
- **Ladder scholar rule differs across the sides — and across this
  window.** The round-7 base's `ladder.js _ladderLivingVeterans` is
  the old inline rule (`vp && !vp.dead`, no roster check) with the
  LEG 3 tribute scholar-readiness fix layered on: the scholar is
  NEVER counted (`if (!vid || vid === this.villagerId) return
  false;` — `ladder.js` line 136 at `21fc590d0`). That differs from
  the merge-base `d229b58f5`, whose old inline rule counted the
  scholar as always living; LEG 3 landed somewhere between the
  merge-base and round 5's cut 1. `5157782a4` / master use the shared
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
docs/MEASUREMENT.md §§9–12, 14–15 read before writing this prereg.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**LEG 1 — primary metric: survived count on fresh seeds 190737–190752
on the round-7 base `21fc590d0` (with the fix swapped in)**, vs Loop
A's round-7 leg's 2/8 (median 144d) on the vetphantom band,
cut7confirm-b's 4/16 (median 127d), and collapseband3-a's 3/16
(median 125d).

| Outcome | Verdict |
|---|---|
| **≤4/16 survive** | **CONFIRMED** — the collapse generalizes; the pooled rate holds |
| **≥12/16 survive** | **REFUTED** — the collapse does not generalize; the prior verdicts were band noise |
| **5–11/16 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a wider band or an adjacent cut is owed |

**Rank read (pre-registered alongside survival): regional reach
on the same fresh band**, vs the round-7 leg's 8/8 regional
(REGIONAL_INTACT), cut7confirm-b's 16/16, and collapseband3-a's
15/16. This leg JUDGES rank, not merely reports it:

| Outcome | Rank verdict |
|---|---|
| **≥11/16 regional** | **REGIONAL_INTACT** — link/regional formation works on fresh seeds |
| **≤4/16 regional** | **RANK_STALL** — the rank stall is in on fresh seeds |
| **5–10/16 regional** | **RANK_INCONCLUSIVE** |

**ARC IV read (pre-registered alongside survival and rank —
tracker 1130Z blank #4): ARC IV fired/not per seed**, read from
the vetSays capture (a line containing `ARC IV`). This leg JUDGES
the ARC IV / rank correlation that cut2confirm-b noticed (ARC IV
fired on all 14 regional seeds and neither village-rank seed),
cut7confirm-b confirmed on the positive half (16/16 regional
fired), and collapseband3-a confirmed with the first fresh
village-rank seed (15/15 regional fired, 0/1 village-rank fired —
seed 190728):

| Outcome | ARC verdict |
|---|---|
| **ARC IV fires on every regional seed and on no village-rank seed** | **ARC-TRACKS-RANK** — ARC IV tracks rank progress, not survival |
| **otherwise** | **ARC-DIVERGES** — with the diverging seeds listed (regional seeds where it did NOT fire + village-rank seeds where it DID fire) |

Seeds ending national/table are neither regional nor
village-rank and are unconstrained by this rule. Applied literally:
with zero regional seeds the regional clause is vacuous — a
0-regional band would read ARC-TRACKS-RANK on that clause alone,
which the evidence file must flag rather than celebrate. With zero
village-rank seeds the negative half is again untested on this band
— that is what leg 2 is for (below).

The analyzer (`scripts/collapseband3-b-analyze-20261113.js`)
judges all three rules and exits 0 only when it can classify the
outcome under all three (any survival verdict + any rank verdict +
any ARC verdict is a classified outcome; exit 1 only on instrument
failure, corpus incompleteness, or an unclassifiable read).

**LEG 2 — ARC-negative attempt (pre-registered, judged ONLY on
rank/ARC): seeds 190607 + 190614** — the two cut2confirm-b
village-rank seeds (evidence/2026-11-12/sim-cut2confirm-b.md §1/§6:
190607 95d, 190614 61d, both never left village rank, ARC IV fired
on neither) — re-run on the r7 base `21fc590d0` (same fix swap,
same instrument, same 150d death-aware horizon, competent
verbatim, mode `fix` only). Judge ONLY whether they stay
village-rank and ARC IV stays silent:

| Outcome | Leg-2 verdict |
|---|---|
| **Both stay village-rank AND ARC IV stays silent on both** | **NEGATIVE-HALF-CONFIRMED** — the ARC negative half replicates on the r7 base |
| **Either reaches regional (or national/table)** | **NEGATIVE-HALF-UNTESTED** — the negative half is still untested; no cherry-picking, no replacement seeds |
| **A village-rank seed fires ARC IV** | **NEGATIVE-HALF-DIVERGES** — with the diverging seed listed |

Survival is NOT judged on leg 2; leg-2 seeds are reused by design,
not fresh — stated here, not hidden. Note: collapseband3-a already
tested the negative half on a FRESH village-rank seed (190728,
died d53, ARC IV silent), so leg 2 is a replication on the two
known village-rank seeds, not the first test of the half. If leg 2
reads NEGATIVE-HALF-UNTESTED while leg 1's ARC read stays
ARC-TRACKS-RANK on its own band, the two verdicts stand side by
side — the leg-1 verdict is judged on its own band, the leg-2
verdict on its two seeds; neither overrides the other.

**Secondary (reported, not judged):** median survival vs 144d
(r7 cut) / 127d (cut7confirm-b) / 125d (collapseband3-a);
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-4/5 unlocks;
national / table / wins (expected 0); standing range;
tribute-ready at end; phantom days (0 expected — the roster-check
fix is swapped in); blooded count from the summary JSON; ARC IV
firing. **Wave-5 choke:** report peak living wave-4+ veterans per
seed vs the bar of 2 (r7 cut: exactly the four seeds holding 2 at
once unlocked wave 5; cut2confirm-b: exactly the seven seeds
holding 2 unlocked wave 5; cut7confirm-b: exactly the seven seeds
holding 2 unlocked wave 5; collapseband3-a: exactly the three seeds
holding 2 unlocked wave 5).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: leg 1: 190737–190752 (16 seeds) — FRESH, verified unused**
  (see the freshness section above). Leg 2: 190607 + 190614
  (reused by design, judged on rank/ARC only). This is a confirm
  run, not a matched control: the point is a new band on the same
  base, so seed-for-seed identity with the r7 band is neither
  claimed nor needed.
- **Policy: competent verbatim, SINGLE leg on the round-7 base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `21fc590d0` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set).
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`
    on both) — the round-7-cut vs firstparent comparison differs
    only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` is byte-identical too — the round-7
    vs merge-base comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs).
  - `scripts/sim-harness.js` differs from `5157782a4`/master only
    by the MISSING opt-in `sourcePatch` hook (added 2026-11-10,
    after this base; identity by default; this driver does not use
    it), so the master-copied driver runs unchanged on this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/collapseband3-b-driver-20261113.js` — a copy of
  cut7confirm-b-driver with the corpus dir changed to
  `evidence/2026-11-13/perseed-collapseband3-b/`, RUN =
  `collapseband3-b-pilot`, arm = `collapseband3-b`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`), plus a
  `CORPUS_DIR` env override so leg 2 writes to its own corpus dir
  (`evidence/2026-11-13/perseed-collapseband3-b-leg2/`, RUN
  `collapseband3-b-leg2`).
  **/elder/ filter:** the driver keeps the tightened `\belder\b`
  form from the vetsays fix (landed `9a32925b3`) — the foraging-
  basket line stays out of the capture, and the Elderberry teaching
  line with it, as stated in the r7 prereg.
  Analyzer: `scripts/collapseband3-b-analyze-20261113.js` (judges
  leg 1's three rules plus leg 2's rank/ARC verdict). Proof:
  `scripts/test-collapseband3-b.js` (89 assertions: the
  cut7confirm-b proof adapted to the new band, plus the leg-2
  judge table).
- **Corpus:** leg 1 `evidence/2026-11-13/perseed-collapseband3-b/`
  — 16 per-seed JSONs; leg 2
  `evidence/2026-11-13/perseed-collapseband3-b-leg2/` — 2 per-seed
  JSONs; summary `evidence/2026-11-13/collapseband3-b-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the r7 cut
leg vs this confirm leg on the same base, judged by the analyzer's
decision rule. Same standing as survivalcontrol-b §7, anchor-a §7,
merge-a §7, origin-a §7, mergebase-a §7, and r7-cut-a §7.

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
- The proof (`scripts/test-collapseband3-b.js`) must be green BEFORE
  any judged sim and again after the band. It requires the
  vetfirst-instrument scratch file; after the rebase onto master
  (where the instrument exists as a tracked file) it must be
  re-run there too.
- This arm does NOT re-judge any prior verdict (survivalcontrol
  MASTER_CHANGE, anchor, mournblooded, merge-a
  COLLAPSE_INSIDE_MERGE, firstparent INCONCLUSIVE, reconciled
  COLLAPSE_CONFIRMED, origin-a ORIGIN_COLLAPSED, mergebase-a
  MERGEBASE_COLLAPSED + RANK_STALL, r5-cut1 CUT1_COLLAPSED +
  REGIONAL_INTACT, r5-cut2 CUT2_COLLAPSED + REGIONAL_INTACT,
  r6-cut CUT6_COLLAPSED + REGIONAL_INTACT, r7-cut
  CUT7_COLLAPSED + REGIONAL_INTACT, cut2confirm-b CONFIRMED +
  REGIONAL_INTACT, cut7confirm-b CONFIRMED + REGIONAL_INTACT +
  ARC-TRACKS-RANK, collapseband3-a CONFIRMED + REGIONAL_INTACT +
  ARC-TRACKS-RANK) — it confirms the round-7 cut only, on fresh
  seeds, and replicates the ARC negative half on two known seeds.
- Loop A is live on the next bisect step; this arm does not touch
  Loop A's trees or branches.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `21fc590d0` is the 361st commit in
  `d229b58f5..203a32775` (verified by `git rev-list --count`);
  `203a32775` is an ANCESTOR of `5157782a4` (their merge-base is
  `203a32775` itself), not the reverse — do not assume a linear
  order between the healthy base and the local merge-tip.
- Host write flap: probed before writing (`git update-ref
  refs/heads/probe HEAD` — PROBE-OK at run start, 2026-11-13
  ~10:30Z). Per the local_write_flap_response skill this arm
  probes before writing and waits for the flap to clear before
  writing if a probe fails.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
