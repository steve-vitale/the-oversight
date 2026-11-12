# Confirm duty — bisect round-7 cut on a fresh 16-seed band — pre-registration (arm sim-cut7confirm-b)

Run fleshout-loop-b-20261112T1430Z, Loop B, axis winnability chain
(confirm duty on Loop A's most recent landed lever). Written and
committed BEFORE any judged sim. Base: `21fc590d0`
("journey-social-life r167: refresh measurement neutrality proof on
rebased tree", 2026-11-10 05:43 UTC) — the 361st commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..21fc590d0` returns 361).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 16-seed band on the round-7 cut of the collapse window.
It changes no game code and builds nothing.

## Branch / run mechanics (read carefully — this tree was registered at master, not at the base)

The worktree `sim-cut7confirm-b` was registered at the master tip
at spawn; the branch `sim-cut7confirm-b` carries the r7 arm's
commits at its tip (`5c4361ccc`). The prereg, driver, analyzer,
and proof are committed on that master-based branch. The SIMS
themselves run with the worktree checked out at the base commit
`21fc590d0` (detached HEAD, exactly as the r7 cut arm ran: its
evidence records `git rev-parse HEAD` as the base at run start),
with the four committed files copied back in as uncommitted scratch
plus the vetfirst instrument copied from master as untracked
scratch (it does not exist at this base), the roster-check fix
swapped in uncommitted, and the per-seed corpus carried back as
untracked files. After the band the fix is restored byte-identical,
the scratch copies are deleted, the branch is checked out again,
and only then is the evidence + corpus committed on the branch. No
scratch file is ever committed; no src/js file is ever committed.

## The question

Loop A landed CUT7_COLLAPSED on base `21fc590d0` (arm
sim-bisect-r7-cut-a, evidence/2026-11-12/sim-bisect-r7-cut-a.md):
2/8 survived, median 144d, regional 8/8, on the vetphantom band
190391–190398 — with a corpus deep-identical to r5-cut2/r6-cut.
Both legs used the SAME 8 seeds, so the collapse verdict has never
been tested on seeds outside that band. This arm is confirm duty:
the same base, the same fix swap, the same instrument and rules —
but a FRESH 16-seed band. If the fresh band also collapses, the
r7 collapse generalizes; if it survives at 12+/16, the r5/r6/r7
verdicts were band noise.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **102d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **144d** |
| bisect-r6-cut leg (seeds 190391–190398) | cut `c7786d567` | **2/8** | **144d** |
| bisect-r7-cut leg (seeds 190391–190398) | cut `21fc590d0` | **2/8** | **144d** |
| cut2confirm-b (fresh seeds 190601–190616) | cut 2 `2215e22d4` | **2/16** | **129d** |
| this confirm leg (fresh seeds 190701–190716) | cut `21fc590d0` | **?** | **?** |

## Seed-band freshness (verified before any sim — local_seed_band_freshness)

Chosen band: **190701–190716** (16 seeds, proposed in the brief).
Search scope and result, all run before any sim:

- All 783 dated preregs under `evidence/*/sim-*-prereg.md`:
  `grep -rh "1907[0-9][0-9]"` → zero hits; no prereg names any
  1907xx seed at all.
- All dated `*.md` under `evidence/`: grep for `1907[0-9][0-9]` →
  exactly one file, `evidence/2026-11-08/journey-establishment-r114.md`,
  whose hit is `190765` — outside this band.
- Per-seed literals 190701–190716 over tracked files: every
  substring hit in a JSON corpus was checked in context and is an
  incidental numeric fragment, not a seed naming — kcal sums
  (`"givesSum":190712`, `"depriKcal":190712`), floats
  (`12.570115365190702`, `1368.5856961190702`,
  `0.1907039428803798`), and larger integers (`"ate": 2190701`).
  A word-boundary pass over the October evidence dirs found only
  the two `190712` kcal values. The two screen `.jsonl` hits
  (190702, 190703) are the same float fragments.
- Filenames under `evidence/`: zero files are named with any
  190701–190716 seed — no per-seed corpus was ever written for
  these seeds.
- Forbidden / contaminated band lists named in preregs: the
  standacc-b list covers 99201–99208; belongzombie names
  99009–99024. Neither touches 190701–190716. No standalone
  forbidden-band list file exists in `evidence/` or the goal
  hidden_files.
- **Result: band 190701–190716 is fresh.** No collision; no
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
merge-a / origin-a / mergebase-a / r5-cut2-a / r6-cut-a / r7-cut-a
preregs: the FIX `standing.js` is extracted with
`git show 5157782a4:src/js/standing.js`, its sha256 verified to be
exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the round-7 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/cut7confirm-b-driver-20261112.js`) refuses to run
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

**Primary metric: survived count on fresh seeds 190701–190716 on
the round-7 base `21fc590d0` (with the fix swapped in)**, vs Loop A's
round-7 leg's 2/8 (median 144d) on the vetphantom band.

| Outcome | Verdict |
|---|---|
| **≤4/16 survive** | **CONFIRMED** — the collapse generalizes; r7 cut was 2/8 = 25%, not band noise |
| **≥12/16 survive** | **REFUTED** — the collapse does not generalize; the r5/r6/r7 verdicts were band noise |
| **5–11/16 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a wider band or an adjacent cut is owed |

**Rank read (pre-registered alongside survival): regional reach
on the same fresh band**, vs the round-7 leg's 8/8 regional
(REGIONAL_INTACT). This leg JUDGES rank, not merely reports it:

| Outcome | Rank verdict |
|---|---|
| **≥11/16 regional** | **REGIONAL_INTACT** — link/regional formation works on fresh seeds |
| **≤4/16 regional** | **RANK_STALL** — the rank stall is in on fresh seeds |
| **5–10/16 regional** | **RANK_INCONCLUSIVE** |

**ARC IV read (pre-registered alongside survival and rank —
tracker 1130Z blank #4): ARC IV fired/not per seed**, read from
the vetSays capture (a line containing `ARC IV`). This leg JUDGES
the ARC IV / rank correlation that cut2confirm-b noticed (ARC IV
fired on all 14 regional seeds and neither village-rank seed):

| Outcome | ARC verdict |
|---|---|
| **ARC IV fires on every regional seed and on no village-rank seed** | **ARC-TRACKS-RANK** — ARC IV tracks rank progress, not survival |
| **otherwise** | **ARC-DIVERGES** — with the diverging seeds listed (regional seeds where it did NOT fire + village-rank seeds where it DID fire) |

Seeds ending national/table are neither regional nor
village-rank and are unconstrained by this rule. Applied literally:
with zero regional seeds the regional clause is vacuous — a
0-regional band would read ARC-TRACKS-RANK on that clause alone,
which the evidence file must flag rather than celebrate.

The analyzer (`scripts/cut7confirm-b-analyze-20261112.js`)
judges all three rules and exits 0 only when it can classify the
outcome under all three (any survival verdict + any rank verdict +
any ARC verdict is a classified outcome; exit 1 only on instrument
failure, corpus incompleteness, or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 144d
(r7 cut) / 129d (cut2confirm-b fresh band); death-cause shares vs
survivalcontrol's combat-heavy profile (585/615
combat/expedition/wild, starvation 0); wave-4/5 unlocks; national /
table / wins (expected 0); standing range; tribute-ready at end;
phantom days (0 expected — the roster-check fix is swapped in);
blooded count from the summary JSON; ARC IV firing. **Wave-5
choke:** report peak living wave-4+ veterans per seed vs the bar
of 2 (r7 cut: exactly the four seeds holding 2 at once unlocked
wave 5; cut2confirm-b: exactly the seven seeds holding 2 unlocked
wave 5).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190701–190716 (16 seeds) — FRESH, verified unused**
  (see the freshness section above). This is a confirm run, not a
  matched control: the point is a new band on the same base, so
  seed-for-seed identity with the r7 band is neither claimed nor
  needed.
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
  `scripts/cut7confirm-b-driver-20261112.js` — a copy of
  cut2confirm-b-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-cut7confirm-b/`, RUN =
  `cut7confirm-b-pilot`, arm = `cut7confirm-b`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver keeps the tightened `\belder\b`
  form from the vetsays fix (landed `9a32925b3`) — the foraging-
  basket line stays out of the capture, and the Elderberry teaching
  line with it, as stated in the r7 prereg.
  Analyzer: `scripts/cut7confirm-b-analyze-20261112.js`. Proof:
  `scripts/test-cut7confirm-b.js`.
- **Corpus:** `evidence/2026-11-12/perseed-cut7confirm-b/` — 16
  per-seed JSONs; summary
  `evidence/2026-11-12/cut7confirm-b-summary.json`.

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
- The proof (`scripts/test-cut7confirm-b.js`) must be green BEFORE
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
  REGIONAL_INTACT) — it confirms the round-7 cut only, on fresh
  seeds.
- Loop A is live on the next bisect step (final-32 cut); this arm
  does not touch Loop A's trees or branches.
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

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
