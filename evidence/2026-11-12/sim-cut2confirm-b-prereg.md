# Confirm duty — bisect round-5 cut 2 on a fresh 16-seed band — pre-registration (arm sim-cut2confirm-b)

Run fleshout-20261112T1130Z, Loop B, axis winnability chain
(confirm duty on Loop A's most recent landed lever). Written and
committed BEFORE any judged sim. Base: `2215e22d4`
("journey-establishment r117 (adoption closeout of dead 1445Z run):
fresh-seed regression pilot, pace03 SIGNAL 2/4, invitations
reclassified driver artifact, invite-answer proof 17/17",
2026-11-09 17:48) — the 262nd commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..2215e22d4` returns 262).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 16-seed band on tertile cut 2 of the collapse window.
It changes no game code and builds nothing.

## Branch / run mechanics (read carefully — this tree was registered at master, not at the base)

The worktree `sim-cut2confirm-b` was registered at the master tip
at spawn (`ce89f2b77`); master then moved to `f1e603219` ("adoption
closeout: merged-master gate 334/6 on ddb0a9101") before any commit
was made, so the branch `sim-cut2confirm-b` was fast-forwarded onto
`f1e603219` (no unique commits yet — a clean fast-forward, not a
rebase with conflicts). The prereg, driver, analyzer, and proof are
committed on that master-based branch. The SIMS themselves run with
the worktree checked out at the base commit `2215e22d4` (detached
HEAD, exactly as the r5 cut-2 and r6 cut arms ran: their evidence
records `git rev-parse HEAD` as the base at run start), with the
four committed files copied back in as uncommitted scratch plus the
vetfirst instrument copied from master as untracked scratch (it does
not exist at this base), the roster-check fix swapped in
uncommitted, and the per-seed corpus carried back as untracked
files. After the band the fix is restored byte-identical, the
scratch copies are deleted, the branch is checked out again, and
only then is the evidence + corpus committed on the branch. No
scratch file is ever committed; no src/js file is ever committed.

## The question

Loop A landed CUT2_COLLAPSED on base `2215e22d4` (arm
sim-bisect-r5-cut2-a, evidence/2026-11-12/sim-bisect-r5-cut2-a.md):
2/8 survived, median 144d, regional 8/8, on the vetphantom band
190391–190398. A sibling Loop A arm (round 6, cut at the 328th
commit `c7786d567`) reproduced the same 2/8 + 8/8 on the same band
with a deep-identical corpus. Both legs used the SAME 8 seeds, so
the collapse verdict has never been tested on seeds outside that
band. This arm is confirm duty: the same base, the same fix swap,
the same instrument and rules — but a FRESH 16-seed band. If the
fresh band also collapses, the cut-2 collapse generalizes; if it
survives at 12+/16, the r5/r6 verdicts were band noise.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **102d** |
| bisect-firstparent leg (seeds 190391–190398) | first parent `203a32775` | **4/8** | **150d** |
| bisect-r5-cut2-a (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **144d** |
| bisect-r6-cut-a (seeds 190391–190398) | 328th commit `c7786d567` | **2/8** | **144d** |
| this confirm leg (seeds 190601–190616) | cut 2 `2215e22d4` | **?** | **?** |

## Seed-band freshness (verified before any sim — local_seed_band_freshness)

Chosen band: **190601–190616** (16 seeds, proposed in the brief).
Search scope and result, all run before any sim:

- All 778 dated preregs under `evidence/*/sim-*-prereg.md`:
  `grep -rho "1906[0-9][0-9]"` → zero hits; the per-seed-literal
  grep for `19060[1-9]` / `19061[0-6]` / `190601` → zero hits.
- All dated `*.md` under `evidence/` (screens, extension bands,
  evidence notes): grep for each literal 190601–190616 → zero
  files matched. The only `1906xx` literal anywhere in dated md
  is 190658, outside this band.
- Forbidden / contaminated band lists named in preregs: the
  standacc-b list covers 99201–99208; belongzombie names
  99009–99024. Neither touches 190601–190616. No standalone
  forbidden-band list file exists in `evidence/` or the goal
  hidden_files.
- **Result: band 190601–190616 is fresh.** No collision; no
  alternate band was needed.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `2215e22d4`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start — byte-identical to the merge-base /
origin pre-fix file; NO "ROSTER CHECK" marker). The r131
roster-check fix (`5d16916f4`) is NOT an ancestor of this base
(verified: `git merge-base --is-ancestor 5d16916f4 2215e22d4`
fails), so the driver's leg-guard would refuse this base as-is.
Following the vetphantom-b swap pattern (evidence/2026-11-11/
sim-vetphantom-b.md §9–§10) and the merge-a / origin-a / mergebase-a
/ r5-cut2-a preregs: the FIX `standing.js` is extracted with
`git show 5157782a4:src/js/standing.js`, its sha256 verified to be
exactly `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the cut-2 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/cut2confirm-b-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the cut-2 base's `standing.js` in exactly two hunks: the ROSTER
  CHECK (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the cut-2 base predates. On this base the
  blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by
  `git grep -l` on the base — zero matches), and the fix
  `standing.js` itself never calls `this.villageBlooded()` (verified:
  count 0). So the only live behavioral delta the swap introduces
  is the roster check. The driver's end-of-run `blooded` read is a
  report field only (the fix file defines `villageBlooded()`, so
  the read returns a value; it records that the village *would* be
  blooded under the local rule, not that any fight was blooded).
  Same standing as origin-a, mergebase-a, and r5-cut2-a.
- **Ladder scholar rule differs across the sides — and across this
  window.** The cut-2 base's `ladder.js _ladderLivingVeterans` is
  the old inline rule (`vp && !vp.dead`, no roster check) with the
  LEG 3 tribute scholar-readiness fix layered on: the scholar is
  NEVER counted (`if (!vid || vid === this.villagerId) return
  false;` — `ladder.js` line 136 at `2215e22d4`). That differs from
  the merge-base `d229b58f5`, whose old inline rule counted the
  scholar as always living; LEG 3 landed somewhere between the
  merge-base and this cut. `5157782a4` / master use the shared
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

**Primary metric: survived count on fresh seeds 190601–190616 on
the cut-2 base `2215e22d4` (with the fix swapped in)**, vs Loop A's
cut-2 leg's 2/8 (median 144d) on the vetphantom band.

| Outcome | Verdict |
|---|---|
| **≤4/16 survive** | **CONFIRMED** — the collapse generalizes; r5 cut2 was 2/8 = 25%, not band noise |
| **≥12/16 survive** | **REFUTED** — the collapse does not generalize; the r5/r6 verdicts were band noise |
| **5–11/16 survive** | **INCONCLUSIVE** — neither confirmed nor refuted; a wider band or an adjacent cut is owed |

**Rank read (pre-registered alongside survival): regional reach
on the same fresh band**, vs the cut-2 leg's 8/8 regional
(REGIONAL_INTACT). This leg JUDGES rank, not merely reports it:

| Outcome | Rank verdict |
|---|---|
| **≥11/16 regional** | **REGIONAL_INTACT** — link/regional formation works on fresh seeds |
| **≤4/16 regional** | **RANK_STALL** — the rank stall is in on fresh seeds |
| **5–10/16 regional** | **RANK_INCONCLUSIVE** |

The analyzer (`scripts/cut2confirm-b-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 144d
(r5 cut-2) / 150d (vetphantom); death-cause shares vs
survivalcontrol's combat-heavy profile (585/615
combat/expedition/wild, starvation 0); wave-4/5 unlocks; national /
table / wins (expected 0); standing range; tribute-ready at end;
phantom days (0 expected — the roster-check fix is swapped in);
blooded count from the summary JSON; ARC IV firing. **Wave-5
choke:** report peak living wave-4+ veterans per seed vs the bar
of 2 (r5 cut-2: exactly the four seeds holding 2 at once unlocked
wave 5).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190601–190616 (16 seeds) — FRESH, verified unused**
  (see the freshness section above). This is a confirm run, not a
  matched control: the point is a new band on the same base, so
  seed-for-seed identity with the r5 band is neither claimed nor
  needed.
- **Policy: competent verbatim, SINGLE leg on the cut-2 base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `2215e22d4` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set).
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL — the
    cut-2 vs firstparent comparison differs only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` is byte-identical too — the cut-2 vs
    merge-base comparison differs only in game code (plus the
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
  `scripts/cut2confirm-b-driver-20261112.js` — a copy of
  bisect-r5-cut2-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-cut2confirm-b/`, RUN =
  `cut2confirm-b-pilot`, arm = `cut2confirm-b`, mode fixed to
  `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver keeps the tightened `\belder\b`
  form from the vetsays fix (landed `9a32925b3`) — the foraging-
  basket line stays out of the capture, and the Elderberry teaching
  line with it, as stated in the r5 prereg.
  Analyzer: `scripts/cut2confirm-b-analyze-20261112.js`. Proof:
  `scripts/test-cut2confirm-b.js`.
- **Corpus:** `evidence/2026-11-12/perseed-cut2confirm-b/` — 16
  per-seed JSONs; summary
  `evidence/2026-11-12/cut2confirm-b-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the r5 cut-2
leg vs this confirm leg on the same base, judged by the analyzer's
decision rule. Same standing as survivalcontrol-b §7, anchor-a §7,
merge-a §7, origin-a §7, mergebase-a §7, and r5-cut2-a §7.

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
- The proof (`scripts/test-cut2confirm-b.js`) must be green BEFORE
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
  r6-cut CUT6_COLLAPSED + REGIONAL_INTACT) — it confirms cut 2
  only, on fresh seeds.
- Loop A is live on scale-onramp bisect round 6 (trees
  sim-bisect-r6-cut-a + sim-stallcut-a); this arm does not touch
  Loop A's trees or branches.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop B body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `2215e22d4` is the 262nd commit in
  `d229b58f5..203a32775` (verified by `git rev-list --count`);
  `203a32775` is an ANCESTOR of `5157782a4` (their merge-base is
  `203a32775` itself), not the reverse — do not assume a linear
  order between the healthy base and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
