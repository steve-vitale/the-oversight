# Stall-cut bisect, arm sim-stallcut57-a — pre-registration

Run fleshout-20261112T1728Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, rank-stall window cut, third
half). Written and committed BEFORE any judged sim. Base:
`d5865e4d3` ("sim-tendtrust-b prereg: Binding-leg tend/trust DIAG,
band 76401-76408 reused, 180d", 2026-11-08 14:10:52 UTC) — the 57th
commit in the window `d229b58f5..6dc7f8162` (131 commits; verified at
run start: `git rev-list --count d229b58f5..d5865e4d3` returns 57,
`git rev-parse HEAD` is `d5865e4d3`, tree clean).

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
median 102d) — the transition sits in commits 50–65. This arm
cuts that half at its midpoint (57) to say which half of commits
50–65 the stall transition sits in:

| Band | Base | Survived | Regional | Median |
|---|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` | **6/8** | **8/8** | **150d** |
| bisect-mergebase leg (seeds 190391–190398) | merge-base `d229b58f5` | **1/8** | **0/8** | **102d** |
| bisect-r5-cut1 leg (seeds 190391–190398) | cut 1 `6dc7f8162` | **2/8** | **8/8** | **110d** |
| bisect-r5-cut2 leg (seeds 190391–190398) | cut 2 `2215e22d4` | **2/8** | **8/8** | **144d** |
| stall-cut leg (seeds 190391–190398) | stall cut `a18d7438c` | **0/8** | **8/8** | **123d** |
| stall-cut-32 leg (seeds 190391–190398) | stall cut 32 `715c2918d` | **1/8** | **0/8** | **102d** |
| stall-cut-49 leg (seeds 190391–190398) | stall cut 49 `1ae6dd76c` | **1/8** | **0/8** | **102d** |
| this stall-cut-57 leg (seeds 190391–190398) | stall cut 57 `d5865e4d3` | **?** | **?** | **?** |

**Why 57 and not 58:** commits 50–65 have no exact midpoint
((50+65)/2 = 57.5). This arm picks **57, the floor** — it splits
50–65 into 50–57 / 58–65, and it keeps the LEG 3 tribute
scholar-exclusion (`b1c8e730c`, 61st commit) AFTER the cut, so a
STILL_IN read narrows the next cut to 58–65 (which then lands on
or just past LEG 3) and a LIFTED read narrows to 50–57. The 58th
commit (`a111b57f`, the tend/trust DIAG evidence commit) is, like
the 57th, an evidence commit — neither is game code — so the
57/58 choice is immaterial to the sim; the floor is stated here
so the next cut is unambiguous.

## What changed between cut 49 and cut 57 (read from the diff, before any sim)

`git diff 1ae6dd76c..d5865e4d3` touches exactly ONE `src/` file
(174 files total in the range, the rest evidence transcripts,
panels, and sim scripts):

- `src/js/ladder.js` (1 line): the journey-scale r111 top-rung
  line fix (`e1d1c00ff`) — the National line repeated the stage
  name ("Ladder — National Standing National Standing reached");
  the target is now just `"reached"`. Display text only; no sim
  mechanic, no threshold, no cap, no readiness read changes.
  `_ladderLivingVeterans` is untouched by this diff.

No `src/data`, no `standing.js`, no `progression.js`, no
`table.js`, no `hierarchy.js`, no `game.js`, no `conversation.js`
change in commits 50–57. Scripts changes: journey-scale r111
analyzer / driver / instrument / ladder test (new files), `test-
ladder-cap.js` +6 lines (the line-fix assertions), and
`scripts/balance-proof.json` (hash refresh after the neutral-proof
refresh `d80f972a2`).

Commits 50–57 in brief: comparecontract evidence commits (panel
copies, naming); neutral-proof refresh after the doublenight-fix +
comparecontract landings (fresh panel seed 7 x 4 policies x 150d,
neutrality 4/4); journey scale r111 (ladder opens 4/4, embassy
delivered, top-rung line fix + neutrality proof refresh); the
tend/trust-b prereg (this cut).

Expectation (the verdict still comes from the run, never from this
paragraph): there is NO regional mechanism in commits 50–57 — the
only game-code change is a display string. The LEG 3 tribute
scholar-exclusion (`b1c8e730c`, 61st commit) sits AFTER cut 57, in
commits 58–65 — so if the regional lift is the LEG 3 change, this
cut should still read 0/8 regional. Survival should read the same
as cut 49 (1/8, median 102d) to within seed noise; the cut-49 and
cut-57 bases differ by no survival mechanic. Either way the run
decides.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `d5865e4d3`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
verified at run start via `git show d5865e4d3:src/js/standing.js` —
byte-identical to the merge-base / stall-cut-32 / stall-cut-49
pre-fix file; zero "ROSTER CHECK" occurrences). The r131
roster-check fix (`5d16916f4`) is NOT an ancestor of this base
(verified: `git merge-base --is-ancestor 5d16916f4 d5865e4d3`
fails), so the driver's leg-guard would refuse this base as-is.
Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut2-a / stallcut-a /
stallcut32-a / stallcut49-a preregs: the FIX `standing.js` is
extracted with `git show 5157782a4:src/js/standing.js`, its sha256
verified to be exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the stall-cut-57 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-stallcut57-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the stall-cut-57 base's `standing.js` in exactly two hunks: the
  ROSTER CHECK (`if (roster.indexOf(vid) < 0) return false;`) and
  the sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the stall-cut-57 base predates. On this
  base the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by grep
  on the base — zero matches outside `standing.js` itself, and
  this base's `standing.js` contains zero occurrences of
  `villageBlooded`), and the fix `standing.js` itself never calls
  `this.villageBlooded()` — the wave-5 damage / survivability
  hookup lives in `fieldFights.js` / `game.js` on local master,
  which this base does not have. So the only live behavioral delta
  the swap introduces is the roster check. The driver's end-of-run
  `blooded` read is a report field only (the fix file defines
  `villageBlooded()`, so the read returns a value; it records that
  the village *would* be blooded under the local rule, not that any
  fight was blooded). Same standing as origin-a, mergebase-a,
  r5-cut2-a, stallcut-a, stallcut32-a, and stallcut49-a.
- **Ladder scholar rule — VERIFIED BY READING THE CODE, same as
  stallcut32 and stallcut49 (no correction needed this time).** On
  THIS base, `ladder.js _ladderLivingVeterans` is the old inline rule
  (`vp && !vp.dead`, no roster check) that counts the scholar as
  ALWAYS LIVING (`if (vid === this.villagerId) return true;`) —
  the same rule as the merge-base `d229b58f5`, the stall-cut-32 base,
  and the stall-cut-49 base (read at `src/js/ladder.js:126–144` on
  the cut; the 49→57 diff does not touch the function). The LEG 3
  tribute scholar-readiness fix (scholar NEVER counted,
  `if (!vid || vid === this.villagerId) return false;`) lands later,
  at `b1c8e730c` ("ladder leg3: tribute readiness counts non-scholar
  veterans only") — the 61st commit in the window
  `d229b58f5..6dc7f8162` (verified:
  `git rev-list --count d229b58f5..b1c8e730c` returns 61), i.e.
  in commits 58–65, AFTER this cut. So this cut PREDATES the
  scholar-exclusion: this leg's ladder/scholar reads will agree
  with the swapped-in readiness gate on a scholar kill (both read
  1), unlike the stall-cut leg where they split — and a cut at 57
  splits the ladder/scholar reads against the stall-cut leg at 65.
  The proof test detects which scholar rule the LOADED game
  carries from `_ladderLivingVeterans` source and asserts the
  matching count; the survival read comes from the harness end
  state, not the ladder.

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
stall-cut-57 base `d5865e4d3` (with the fix swapped in)**, vs the
stall-cut-49 leg's 0/8 regional (STALL_STILL_IN) and the stall-cut
leg's 8/8 regional.

| Outcome | Verdict |
|---|---|
| **≥5/8 regional** | **STALL_LIFTED** — the stall transition sits in commits 50–57, `1ae6dd76c` → this cut |
| **≤2/8 regional** | **STALL_STILL_IN** — the transition sits in commits 58–65, this cut → `a18d7438c` |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

**Survival read (pre-registered alongside regional — judged with
the same rules, not merely reported):** survived count on the same
band, vs the vetphantom fix leg's 6/8 (median 150d) and the
stall-cut leg's 0/8 (median 123d). Expected COLLAPSED given the
stall cut was 0/8 and stall-cut-49 was 1/8 — judged as written, not
assumed.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **STALLCUT57_HEALTHY** |
| **≤2/8 survive** | **STALLCUT57_COLLAPSED** |
| **3–4/8 survive** | **INCONCLUSIVE** |

The analyzer (`scripts/bisect-stallcut57-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 102d (merge-base) / 110d (cut-1) / 123d
(stall-cut) / 102d (stall-cut-32) / 102d (stall-cut-49);
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave-5 unlocks;
national / table / wins; standing range; tribute-ready days;
phantom days (0 expected — the roster-check fix is swapped in);
blooded count from the summary JSON. **Wave-5 choke:** report peak
living wave-4+ veterans per seed vs the bar of 2.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, both round-5
  cuts, the stall cut, stall-cut-32, and stall-cut-49.** A
  control/bisect cut re-runs the same seeds on old code; that is
  the point of a bisect, not a freshness violation. The seed-band
  freshness rule exists to stop re-using a band as if it were a
  fresh measurement; this arm explicitly re-uses it as a matched
  control and says so here, in the prereg, before any sim. Grep
  scope for the band's prior uses:
  `evidence/*/sim-*-prereg.md`. Same justification as the
  survivalcontrol, anchor, merge, firstparent, reconciled, origin,
  mergebase, r5-cut, stallcut, stallcut32, and stallcut49 preregs.
- **Policy: competent verbatim, SINGLE leg on the stall-cut-57 base,
  mode `fix` only** (with the swap — see above). The driver refuses
  to run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `d5865e4d3` is BYTE-IDENTICAL
    to `1ae6dd76c` and to `d229b58f5` (merge-base). Vs `5157782a4`
    it differs ONLY by the counter-answer block (definition +
    daily() call + exports; env-gated OFF by default — inert
    unless `COUNTER_ANSWER=1`, which this run does not set). No
    garden change on this side.
  - `scripts/sim-harness.js` on `d5865e4d3` is BYTE-IDENTICAL to
    `d229b58f5`; vs `5157782a4`/master it differs only by the
    MISSING opt-in `sourcePatch` hook (8 lines, added 2026-11-10,
    after this base; identity by default; this driver does not use
    it), so the master-copied driver runs unchanged on this base.
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it does not
  exist at this base, `git cat-file -e` fails; byte-identical to
  master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/bisect-stallcut57-driver-20261112.js` — a copy of
  bisect-stallcut49-driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-stallcut57-a/`, RUN =
  `bisect-stallcut57-pilot`, arm = `bisect-stallcut57`, mode fixed
  to `fix` only, plus the swap-aware leg guard (exported `legGuard`,
  exact-sha; pre-fix sha is this base's `98c8bfad70d7…`).
  **/elder/ filter:** the driver carries the tightened
  `\belder\b` veteran-say regex (vetsays fix, landed `9a32925b3`).
  It drops the foraging-basket line ("The pantry can't take more —
  sitting with the elders instead.") from the capture, at the cost
  of the genuine Elderberry teaching line also no longer matching;
  the teaching still happens, it just leaves the veteran-filtered
  capture. Said here, before any sim.
  Analyzer: `scripts/bisect-stallcut57-analyze-20261112.js`. Proof:
  `scripts/test-bisect-stallcut57-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-stallcut57-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-stallcut57-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the merge-base
/ stall-cut / stall-cut-32 / stall-cut-49 legs vs this leg on
identical seeds, judged by the analyzer's decision rule. Same
standing as survivalcontrol-b §7, anchor-a §7, merge-a, origin-a,
mergebase-a, r5-cut2-a, stallcut-a §7, stallcut32-a §7, and
stallcut49-a §7.

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
  STALL_STILL_IN) — it cuts inside the second half of the
  rank-stall window only.
- The sibling Loop B arms run in their own worktrees; this arm
  does not touch them, and their verdicts do not change this leg's
  decision rules. This arm does NOT do the proof refresh (Loop B
  owns round 9).
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `d5865e4d3` is the 57th commit in
  `d229b58f5..6dc7f8162` (verified by `git rev-list --count`);
  `a18d7438c` is the 65th commit in the same window; `715c2918d`
  is the 32nd commit in the same window; `1ae6dd76c` is the 49th
  commit in the same window; `b1c8e730c` is the 61st commit in the
  same window; `a111b57f` is the 58th commit in the same window.
- Detached-HEAD dance: this arm's commits sit on detached HEAD at
  the cut (`d5865e4d3`), as stallcut32-a and stallcut49-a did. The
  coordinator rebases onto master tip at landing; the proof re-runs
  green on the rebased tree before the merge.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
