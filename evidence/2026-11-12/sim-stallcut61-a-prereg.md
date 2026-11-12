# Stall-cut bisect, arm sim-stallcut61-a — pre-registration

Run fleshout-20261112T2006Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, rank-stall window cut, fourth
half — the LEG 3 cut). Written and committed BEFORE any judged sim.
Base: `b1c8e730c` ("ladder leg3: tribute readiness counts non-scholar
veterans only (readiness now agrees with delivery)") — the 61st
commit in the window `d229b58f5..6dc7f8162` (131 commits; verified at
run start: `git rev-list --count d229b58f5..b1c8e730c` returns 61,
`git rev-parse HEAD` is `b1c8e730c`, tree clean).

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on a cut INSIDE the second half of the
rank-stall window to localize the stall. It changes no game code
and builds nothing.

## The question

The stall-cut leg on `a18d7438c` (the 65th commit in the window
`d229b58f5..6dc7f8162`) read **0/8 survived + 8/8 regional**
(STALLCUT_COLLAPSED + STALL_LIFTED, median 123d) — the stall
transition sits in the first 65 commits, while the collapse is
written in at that cut too. The stall-cut-32 leg on `715c2918d`
(the 32nd commit) read **1/8 survived + 0/8 regional**
(STALLCUT32_COLLAPSED + STALL_STILL_IN, median 102d). The
stall-cut-49 leg on `1ae6dd76c` (the 49th commit) read **1/8
survived + 0/8 regional** (STALLCUT49_COLLAPSED + STALL_STILL_IN,
median 102d). The stall-cut-57 leg on `d5865e4d3` (the 57th commit)
read **1/8 survived + 0/8 regional** (STALLCUT57_COLLAPSED +
STALL_STILL_IN, median 102d) — the transition sits in commits 58–65.
This arm cuts at 61 — the LEG 3 tribute scholar-exclusion commit
itself — to say whether the transition IS the LEG 3 change (58–61)
or something in 62–65:

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **8/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **0/8** | **102d** |
| bisect-r5-cut1 leg (seeds 190391–190398) | cut 1 `6dc7f8162` | **2/8** | **8/8** | **110d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **8/8** | **144d** |
| stall-cut leg (seeds 190391–190398) | stall cut `a18d7438c` | **0/8** | **8/8** | **123d** |
| stall-cut-32 leg (seeds 190391–190398) | stall cut 32 `715c2918d` | **1/8** | **0/8** | **102d** |
| stall-cut-49 leg (seeds 190391–190398) | stall cut 49 `1ae6dd76c` | **1/8** | **0/8** | **102d** |
| stall-cut-57 leg (seeds 190391–190398) | stall cut 57 `d5865e4d3` | **1/8** | **0/8** | **102d** |
| this stall-cut-61 leg (seeds 190391–190398) | stall cut 61 `b1c8e730c` | **?** | **?** | **?** |

**Why 61 and not 62:** the 61st commit IS the LEG 3 tribute
scholar-exclusion (`b1c8e730c`). A cut at 61 vs 62 decides whether
the stall transition is the LEG 3 change itself or something in
62–65. This arm picks **61, the LEG 3 commit** — a LIFTED read
narrows the transition to commits 58–61 (LEG 3 or the overtime
stretch beside it); a STILL_IN read narrows it to 62–65.

## What changed between cut 57 and cut 61 (read from the diff, before any sim)

`git diff d5865e4d3..b1c8e730c` touches exactly TWO `src/` files
(the rest is evidence, preregs, and the tendtrust-b policy + tests
under `scripts/`, new files not used by the competent policy):

- `src/js/ladder.js`: the LEG 3 tribute scholar-exclusion
  (`b1c8e730c`) — `_ladderLivingVeterans` now returns `false` for
  the scholar (`if (!vid || vid === this.villagerId) return
  false;`, was `if (vid === this.villagerId) return true;`), and
  the `ladderCapstoneReady` military_tribute comment now says
  NON-SCHOLAR veterans. The tribute delivery
  (`table.js ladderDeliverCapstone`) pays 2 NON-scholar veterans
  and honestly refuses when fewer than 2 stand, so a
  scholar-veteran + 1 villager used to read ready while delivery
  refused. Readiness and delivery agree now — only villagers the
  table can actually take count.
- `src/js/overtime.js`: the LEG 3 overtime stretch
  (`78e6b9df0`) — new `overtimeInterval()`: the tier interval is
  7 days + 1 day per 4 counted ladder points, named aloud on
  tier-up. `overtimeTick()` now divides by the interval instead of
  the flat 7.

Commits 58–61 in brief: `a111b57f` (tend/trust DIAG evidence
commit); `33ff73553` (ladder leg3 prereg); `78e6b9df0` (overtime
tier interval stretch); `b1c8e730c` (LEG 3 tribute
scholar-exclusion, this cut).

Expectation (the verdict still comes from the run, never from this
paragraph): the LEG 3 change makes tribute readiness HARDER, not
easier — the scholar no longer counts toward the 2 non-scholar
veterans the delivery pays — so a naive read would expect regional
to stay 0/8. But the stall-cut leg at 65 reads 8/8 regional, and
the mechanism by which a stricter readiness rule lifts a stall is
not obvious from the diff (the ladder's counted points feed the
standing total, and the overtime stretch only matters once a seat
is offered — see below). The run decides; no direction is assumed.
The overtime stretch is expected INERT on this band:
`overtimeActive()` requires `tableWaiting + tableAnnounced +
winDayFloorOk + seat !== 'none'`, and no seed on cut 57 reached a
seat offer (0/8 regional) — stated before the run, the run decides.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `b1c8e730c`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start via `git show b1c8e730c:src/js/standing.js` —
byte-identical to the cut-57 / merge-base / stall-cut-32 /
stall-cut-49 pre-fix file; zero "ROSTER CHECK" occurrences). The
r131 roster-check fix (`5d16916f4`) is NOT an ancestor of this base
(verified: `git merge-base --is-ancestor 5d16916f4 b1c8e730c`
fails), so the driver's leg-guard would refuse this base as-is.
Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut2-a / stallcut-a /
stallcut32-a / stallcut49-a / stallcut57-a preregs: the FIX
`standing.js` is extracted with `git show
5157782a4:src/js/standing.js`, its sha256 verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the stall-cut-61 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-stallcut61-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the stall-cut-61 base's `standing.js` in exactly two hunks: the
  ROSTER CHECK (`if (roster.indexOf(vid) < 0) return false;`) and
  the sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the stall-cut-61 base predates. On this
  base the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by `git
  grep` on the base — zero matches in `src/js/`, and this base's
  `standing.js` contains zero occurrences of `villageBlooded`),
  and the fix `standing.js` itself never calls
  `this.villageBlooded()` — the wave-5 damage / survivability
  hookup lives in `fieldFights.js` / `game.js` on local master,
  which this base does not have. So the only live behavioral delta
  the swap introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field only (the fix file defines
  `villageBlooded()`, so the read returns a value; it records that
  the village *would* be blooded under the local rule, not that any
  fight was blooded). Same standing as origin-a, mergebase-a,
  r5-cut2-a, stallcut-a, stallcut32-a, stallcut49-a, and
  stallcut57-a.
- **Ladder scholar rule — VERIFIED BY READING THE CODE, and this
  cut SPLITS the reads.** On THIS base, `ladder.js
  _ladderLivingVeterans` is the old inline rule (`vp && !vp.dead`,
  no roster check) WITH the LEG 3 layer: the scholar is NEVER
  counted (`if (!vid || vid === this.villagerId) return false;`,
  read at `src/js/ladder.js:136` on the cut). The swapped-in
  readiness gate counts the scholar as always living (fix
  `standing.js`: `if (vid === scholarId) return true;`, verified by
  reading the pinned fix file), and the instrument counts the
  scholar as living. So on a scholar kill the ladder reads 0 while
  the readiness gate and the instrument read 1 — the ladder and the
  readiness gate DISAGREE on this cut, unlike stall-cut-57 where
  they agreed (both read 1). The proof test detects which scholar
  rule the LOADED game carries from `_ladderLivingVeterans` source
  and asserts the matching count; the survival read comes from the
  harness end state, not the ladder.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar: readiness reads living roster members with a recorded
wave-(w-1)+ kill in `state.waveKillLog`) and docs/TABLE.md
(regional+ scale gates the lesser seat; the table prices the run,
never gates on godhood) and Steve's 2026-11-10 scholar-counts
ruling (the scholar counts as a villager; their kills count toward
the living-veteran bar). No canon doc covers survival-collapse
attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: regional reach on seeds 190391–190398 on the
stall-cut-61 base `b1c8e730c` (with the fix swapped in)**, vs the
stall-cut-57 leg's 0/8 regional (STALL_STILL_IN) and the stall-cut
leg's 8/8 regional.

| Outcome | Verdict |
|---|---|
| **≥5/8 regional** | **STALL_LIFTED** — the stall transition sits in commits 58–61, `d5865e4d3` → this cut (LEG 3 or the overtime stretch beside it) |
| **≤2/8 regional** | **STALL_STILL_IN** — the transition sits in commits 62–65, this cut → `a18d7438c` |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

**Survival read (pre-registered alongside regional — judged with
the same rules, not merely reported):** survived count on the same
band, vs the vetphantom fix leg's 6/8 (median 150d) and the
stall-cut leg's 0/8 (median 123d). Expected COLLAPSED given the
stall cut was 0/8 and stall-cut-57 was 1/8 — judged as written, not
assumed.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **STALLCUT61_HEALTHY** |
| **≤2/8 survive** | **STALLCUT61_COLLAPSED** |
| **3–4/8 survive** | **INCONCLUSIVE** |

The analyzer (`scripts/bisect-stallcut61-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 102d (merge-base) / 110d (cut-1) / 123d
(stall-cut) / 102d (stall-cut-32) / 102d (stall-cut-49) / 102d
(stall-cut-57); death-cause shares vs survivalcontrol's
combat-heavy profile (585/615 combat/expedition/wild, starvation
0); wave-5 unlocks; national / table / wins; standing range;
tribute-ready days; phantom days (0 expected — the roster-check
fix is swapped in); blooded count from the summary JSON. **Wave-5
choke:** report peak living wave-4+ veterans per seed vs the bar
of 2.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, both round-5
  cuts, the stall cut, stall-cut-32, stall-cut-49, and stall-cut-57.**
  A control/bisect cut re-runs the same seeds on old code; that is
  the point of a bisect, not a freshness violation. The seed-band
  freshness rule exists to stop re-using a band as if it were a
  fresh measurement; this arm explicitly re-uses it as a matched
  control and says so here, in the prereg, before any sim. Grep
  scope for the band's prior uses:
  `evidence/*/sim-*-prereg.md`. Same justification as the
  survivalcontrol, anchor, merge, firstparent, reconciled, origin,
  mergebase, r5-cut, stallcut, stallcut32, stallcut49, and
  stallcut57 preregs.
- **Policy: competent verbatim, SINGLE leg on the stall-cut-61 base,
  mode `fix` only** (with the swap — see above). The driver refuses
  to run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `b1c8e730c` is BYTE-IDENTICAL
    to `d5865e4d3` and to `d229b58f5` (merge-base) — sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`.
    Vs `5157782a4` it differs ONLY by the counter-answer block
    (definition + daily() call + exports; env-gated OFF by default —
    inert unless `COUNTER_ANSWER=1`, which this run does not set).
    No garden change on this side.
  - `scripts/sim-harness.js` on `b1c8e730c` is BYTE-IDENTICAL to
    `d5865e4d3` (sha256
    `341d2e6f14c5c1211e3e71443bf203c63ba72319a9652a992316ec05d25764fd`);
    vs `5157782a4`/master it differs only by the MISSING opt-in
    `sourcePatch` hook (8 lines, added 2026-11-10, after this base;
    identity by default; this driver does not use it), so the
    master-copied driver runs unchanged on this base.
  - `scripts/` diff 57→61 is only the tendtrust-b policy + tests
    (new files, not used by the competent policy).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it does not
  exist at this base, `git cat-file -e` fails; byte-identical to
  master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/bisect-stallcut61-driver-20261112.js` — a copy of
  bisect-stallcut57-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-stallcut61-a/`, RUN =
  `bisect-stallcut61-pilot`, arm = `bisect-stallcut61`, mode fixed
  to `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver carries the tightened
  `\belder\b` veteran-say regex (vetsays fix, landed `9a32925b3`).
  It drops the foraging-basket line ("The pantry can't take more —
  sitting with the elders instead.") from the capture, at the cost
  of the genuine Elderberry teaching line also no longer matching;
  the teaching still happens, it just leaves the veteran-filtered
  capture. Said here, before any sim.
  Analyzer: `scripts/bisect-stallcut61-analyze-20261112.js`. Proof:
  `scripts/test-stallcut61-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-stallcut61-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-stallcut61-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the merge-base
/ stall-cut / stall-cut-32 / stall-cut-49 / stall-cut-57 legs vs
this leg on identical seeds, judged by the analyzer's decision
rule. Same standing as survivalcontrol-b §7, anchor-a §7, merge-a,
origin-a, mergebase-a, r5-cut2-a, stallcut-a §7, stallcut32-a §7,
stallcut49-a §7, and stallcut57-a §7.

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
  CUT2_COLLAPSED + REGIONAL_INTACT, stallcut-a STALLCUT_COLLAPSED
  + STALL_LIFTED, stallcut32-a STALLCUT32_COLLAPSED +
  STALL_STILL_IN, stallcut49-a STALLCUT49_COLLAPSED +
  STALL_STILL_IN, stallcut57-a STALLCUT57_COLLAPSED +
  STALL_STILL_IN) — it cuts at the LEG 3 commit only.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this leg's
  decision rules. This arm does NOT do the proof refresh (Loop B
  owns round 9).
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `b1c8e730c` is the 61st commit in
  `d229b58f5..6dc7f8162` (verified by `git rev-list --count`);
  `d5865e4d3` is the 57th commit in the same window; `a18d7438c`
  is the 65th commit in the same window; `715c2918d` is the 32nd
  commit in the same window; `1ae6dd76c` is the 49th commit in the
  same window; `a111b57f` is the 58th commit in the same window.
- Detached-HEAD dance: this arm's commits sit on detached HEAD at
  the cut (`b1c8e730c`), as stallcut32-a, stallcut49-a, and
  stallcut57-a did. The coordinator rebases onto master tip at
  landing; the proof re-runs green on the rebased tree before the
  merge.
- Write-flap note: a host write flap (EPERM on git ref writes and
  file writes) was ACTIVE at run start (probe failed 20:44Z,
  21:09Z, 21:32Z; heartbeat write refused); it cleared 21:57:30Z
  (probe OK), heartbeat re-landed 21:57:56Z, and the cut checkout
  succeeded after clearance. All writes in this run were probed
  first; if the flap returns mid-run, wait and retry — never bypass
  safe-commit.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
