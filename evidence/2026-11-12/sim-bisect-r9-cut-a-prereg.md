# Survival-collapse bisect ROUND 9, cut — pre-registration (arm sim-bisect-r9-cut-a)

Run fleshout-20261112T1624Z, Loop A, axis scale-onramp / winnability
chain (the survival-collapse bisect, ROUND 9, final window). Written
and committed BEFORE any judged sim. Base: `ee30f22a2`
("sim-meleefirst-b: sync docs/ONTOLOGY.md with the new slot rules
(validator-generated, pairs with the citation fix)", 2026-11-10
10:12 UTC) — the 385th commit in the window
`d229b58f5..203a32775` (393 commits; verified at run start:
`git rev-list --count d229b58f5..ee30f22a2` returns 385,
`git rev-parse HEAD` is `ee30f22a2` at run start, tree clean).
Setup note: the worktree arrived with a COMPLETE checkout (94,370
tracked files, `src/` and `scripts/` present, clean tree, no stale
`index.lock`) on branch `sim-bisect-r9-cut-a` at master tip
`87f00547`; it was checked out detached to the cut commit before any
work, with no recovery needed — unlike rounds 7/8, whose worktrees
arrived with an incomplete checkout.

**Instrument-only arm — ZERO src/js changes committed.** This arm
re-runs one 8-seed band on the round-9 cut of the collapse window.
It changes no game code and builds nothing.

## The question

ROUND 8 cut at the 377th commit (`a6ed956f5`) and collapsed:
CUT8_COLLAPSED 2/8 + REGIONAL_INTACT — on a corpus deep-identical
to round-5 cut 2, round 6, and round 7, so commits 263–377 are
behaviorally inert on this band and the live window is the final 16
commits, 378–393, while the firstparent leg on `203a32775` survived
only 4/8 (INCONCLUSIVE). ROUND 9 cuts at the MIDPOINT of that final
window, the 385th commit, to ask whether the collapse lifts in the
first half of the final 16 or only in the last 8, if at all — and
this is the FIRST cut in the bisect whose window touches game code,
so the inert-range expectation does NOT carry over (see below).

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
| this round-9 leg (seeds 190391–190398) | cut `ee30f22a2` | **?** | **?** |

## Pre-registered expectation (not a verdict)

Commits 378–385 change **169 files, +406,417/−7 lines — mostly
`evidence/` and `scripts/`, BUT with two `src/js` changes and zero
`src/data`** (verified by `git diff --stat
a6ed956f5..ee30f22a2`):

- `src/js/equipment.js` (+67/−6): the sim-meleefirst-b
  melee-first/ranged-fallback slot rule (`2b0296ace`). A spear
  (melee type, range > 1) takes the MELEE slot when its carrier
  also holds a real ranged weapon (weapon.type `ranged`), so the
  bow's opening volley fires; otherwise it keeps the ranged slot
  and the old fold-in. The rule is LIVE by default in `autoEquip`
  (`hasRealRanged` → `opts.meleeFirstSpears: true`) and in the
  legacy-weapon migration path — it is not behind an env flag. It
  touches the combat path: a villager carrying both a spear and a
  bow now wields both instead of the spear occupying the ranged
  slot. Its own proof (`scripts/test-meleefirst-b.js`, E1 30/30,
  E4 preserved) says the volley is restored.
- `src/js/alienPlayers.js` (+17): a fallen-record push for
  alien-murdered villagers (`village.fallen`, cause `a stranger`) —
  a death-record bookkeeping fix with no combat effect.

So unlike rounds 5–8, the round-9 corpus is **NOT expected to be
deep-identical to round 8's**: the melee-first rule can move fight
outcomes on any seed where a spear-and-bow carrier fights. If the
corpus DOES come back deep-identical, that itself is a finding
(the rule never bites on this band — no spear-and-bow carrier in a
fight that matters). If it diverges, the divergence should trace
to the melee-first rule, and the deep-compare against the r8 corpus
will say on which day and seed it first moves. The verdict still
comes from the run, never from this paragraph: the analyzer judges
the band it is given.

## The fix-swap (read carefully — this base predates the roster-check fix)

At `ee30f22a2`, `src/js/standing.js` is the PRE-FIX version (sha256
`98c8bfad70d744353681895ff41115c36d5ee96b8046fa80c24e04e7bf72d69d`,
hashed by this arm from `git show ee30f22a2:src/js/standing.js` —
byte-identical to the merge-base / origin / round-5-cut /
round-6-cut / round-7-cut / round-8-cut pre-fix file; NO "ROSTER
CHECK" marker). The r131 roster-check fix (`5d16916f4`) is NOT an
ancestor of this base (verified: `git merge-base --is-ancestor
5d16916f4 ee30f22a2` fails), so the driver's leg-guard would refuse
this base as-is. Following the vetphantom-b swap pattern
(evidence/2026-11-11/sim-vetphantom-b.md §9–§10) and the
merge-a / origin-a / mergebase-a / r5-cut1-a / r5-cut2-a / r6-cut-a /
r7-cut-a / r8-cut-a preregs: the FIX `standing.js` is extracted with
`git show 5157782a4:src/js/standing.js`, its sha256 verified to be
exactly
`f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078`,
swapped in UNCOMMITTED, run, then the round-9 base's original
`standing.js` restored byte-identical afterwards and verified by
sha256 (`98c8bfad70d7…`) plus `cmp` clean plus `git status` showing
no `src/js` modification. The `standingSha` in use is recorded per
seed in the corpus. The swap keeps the comparison apples-to-apples:
every leg in this bisect runs WITH the roster check. **The swapped
file itself is never committed.** The driver
(`scripts/bisect-r9-cut-driver-20261112.js`) refuses to run
unless the on-disk `standing.js` carries the "ROSTER CHECK" marker
AND its sha256 is exactly the fix sha — an unswapped run is refused
loudly, never mislabeled.

Two whole-file-swap notes, both verified before any sim (not assumed):

- **BLOODED rider, inert on this base.** The fix file differs from
  the round-9 base's `standing.js` in exactly two hunks: the ROSTER
  CHECK (`if (roster.indexOf(vid) < 0) return false;`) and the
  sim-wave5kill-a BLOODED block (`bloodedCfg` / `bloodedLine` /
  `villageBlooded`), which the round-9 base predates. On this base
  the blooded block has NO callers: no file in `src/js` calls
  `villageBlooded` / `bloodedCfg` / `bloodedLine` (verified by
  `git grep` on the base tree — zero matches), and the fix
  `standing.js` itself never calls `this.villageBlooded()` — the
  wave-5 damage / survivability hookup lives in `fieldFights.js` /
  `game.js` on local master, which this base does not have. So the
  only live behavioral delta the swap introduces is the roster
  check. The driver's end-of-run `blooded` read is a report field
  only (the fix file defines `villageBlooded()`, so the read
  returns a value; it records that the village *would* be blooded
  under the local rule, not that any fight was blooded). Same
  standing as origin-a, mergebase-a, r5-cut1-a, r5-cut2-a,
  r6-cut-a, r7-cut-a, and r8-cut-a.
- **Ladder scholar rule — LEG 3, same as round 5, round 6, round 7,
  and round 8.** This base's `ladder.js _ladderLivingVeterans` is
  the old inline rule (`vp && !vp.dead`, no roster check) with the
  LEG 3 tribute scholar-readiness fix layered on: the scholar is
  NEVER counted (`if (!vid || vid === this.villagerId) return
  false;`) — verified by reading the function at `ee30f22a2`.
  There is no `countLivingVeterans` on this base. That differs from
  the merge-base `d229b58f5`, whose old inline rule counted the
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
wave-(w-1)+ kill in `state.waveKillLog`) and Steve's 2026-11-10
scholar-counts ruling (the scholar counts as a villager; their kills
count toward the living-veteran bar). No canon doc covers
survival-collapse attribution; nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the
round-9 base `ee30f22a2` (with the fix swapped in)**, vs the
vetphantom fix leg's 6/8 (median 150d), the round-8 cut leg's 2/8
(median 144d), and the firstparent leg's 4/8 (median 150d). The
result is read against BOTH ends: the firstparent is only 4/8
INCONCLUSIVE, not healthy.

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **CUT9_HEALTHY** — the collapse's exit sits in commits 378–385 of the final window |
| **≤2/8 survive** | **CUT9_COLLAPSED** — the collapse lifts only in the last 8 commits, 386–393, if at all |
| **3–4/8 survive** | **INCONCLUSIVE** — the window's far end never was healthy; the healthy pole needs re-finding outside this window |

**Rank read (pre-registered alongside survival — the mergebase
leg's §7 metric note): regional reach on the same band**, vs the
vetphantom fix leg's 8/8 regional and the merge-base leg's 0/8
regional (RANK_STALL). This leg JUDGES rank, not merely
reports it:

| Outcome | Rank verdict |
|---|---|
| **≥5/8 regional** | **REGIONAL_INTACT** — link/regional formation works at the 385th commit |
| **≤2/8 regional** | **RANK_STALL** — the rank stall has returned / is still in at the 385th commit |
| **3–4/8 regional** | **RANK_INCONCLUSIVE** |

The analyzer (`scripts/bisect-r9-cut-analyze-20261112.js`)
judges both rules and exits 0 only when it can classify the outcome
under both (any survival verdict + any rank verdict is a classified
outcome; exit 1 only on instrument failure, corpus incompleteness,
or an unclassifiable read).

**Secondary (reported, not judged):** median survival vs 150d
(vetphantom) / 144d (r8-cut, r7-cut, r6-cut, r5-cut2) / 102d
(merge-base); death-cause shares vs survivalcontrol's combat-heavy
profile (585/615 combat/expedition/wild, starvation 0); wave-5
unlocks; national / table / wins; standing range; tribute-ready
days; phantom days (0 expected — the roster-check fix is swapped
in); blooded count from the summary JSON. **Wave-5 choke:** report
peak living wave-4+ veterans per seed vs the bar of 2; check the two
round-5-cut-1 choke cases against this base — a weapons-blocked
pair (cut-1 seed 190395 held the pair 12 days, armed 4 vs demand
6) and a fully-ready-but-unlocked village (cut-1 seed 190393 met
every readiness bar for 2 days, d69–70, and still never unlocked;
an open question, not a defect claim). **ARC IV firing per seed is
a REPORTED field only** — it is not judged and no threshold is set
on it.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to
  all prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, the anchors, the merge, the first
  parent, the reconciled, the origin, the merge-base, all three
  round-5/6/7 cuts, and the round-8 cut.** A control/bisect cut
  re-runs the same seeds on old code; that is the point of a bisect,
  not a freshness violation. The seed-band freshness rule exists to
  stop re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim. Grep scope
  `evidence/*/sim-*-prereg.md` on master names seed 190391 in **23
  prior preregs** (vetphantom-b, vetsays-b, survivalcontrol-b,
  anchor-a, anchor2-a, merge-a, mournblooded-a, policyswap-a,
  reconciled-a, firstparent-a, firstparent-swap-a, mcconfirm-ctrl-b,
  mcconfirm-merge-b, mergebase-a, origin-a, r5-cut1-a, r5-cut2-a,
  r6-cut-a, r7-cut-a, r8-cut-a, cut2confirm-b, stallcut-a,
  stallcut32-a) — same justification as every one of those preregs.
- **Policy: competent verbatim, SINGLE leg on the round-9 base, mode
  `fix` only** (with the swap — see above). The driver refuses to
  run on the unswapped file (swap-aware leg guard: marker + exact
  fix sha). Policy confound notes (all verified by diff before any
  sim, not assumed):
  - `scripts/policies/competent.js` on `ee30f22a2` vs `5157782a4`
    differs ONLY by the counter-answer block (env-gated OFF by
    default — inert unless `COUNTER_ANSWER=1`, which this run does
    not set). No garden change on this side.
  - vs `203a32775` (firstparent) it is BYTE-IDENTICAL (sha256
    `a7ff5c516440626621a2382e378e37704c2f5c56a69c4eab30f89461503a864a`
    on both) — the round-9-cut vs firstparent comparison differs
    only in game code.
  - vs `d229b58f5` (merge-base) it is BYTE-IDENTICAL, and
    `scripts/sim-harness.js` is byte-identical too — the round-9
    vs merge-base comparison differs only in game code (plus the
    controlled standing.js swap, identical on both legs).
  - `scripts/sim-harness.js` at `ee30f22a2` is BYTE-IDENTICAL to
    `5157782a4` (sha256
    `d0447d02939beb80a591b363c6fb3c3d4d0b46244647d26239da47f05c0c8a3a`)
    and carries the opt-in `sourcePatch` hook — the master-copied
    driver runs unchanged on this base and does not use the hook,
    so the round-9 vs vetphantom comparison differs only in game
    code (plus the controlled standing.js swap, identical on both
    legs).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` copied
  from master as UNTRACKED scratch (never committed — it already
  exists on master and committing a duplicate would break the later
  rebase; byte-identical to master, sha256
  `311f105bc15f55544143354eceb74b81d03b95d542a5c1f87e824a2260c40d23`;
  deleted before finishing) + the driver's live shadow old-rule
  count per snapshot, exactly as vetphantom-driver and
  mergebase-driver. Driver:
  `scripts/bisect-r9-cut-driver-20261112.js` — a copy of the
  round-8 cut driver with the corpus dir changed to
  `evidence/2026-11-12/perseed-bisect-r9-cut-a/`, RUN =
  `bisect-r9-cut-pilot`, arm = `bisect-r9-cut`, mode fixed to
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
  Analyzer: `scripts/bisect-r9-cut-analyze-20261112.js`. Proof:
  `scripts/test-bisect-r9-cut-a.js`.
- **Corpus:** `evidence/2026-11-12/perseed-bisect-r9-cut-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-12/bisect-r9-cut-a-summary.json`.
- **Deep-identity comparison (pre-registered method):** the
  per-day signature is the 4-field tuple (vetsW3, vetsW4,
  waveKillLog length, roster length) — NOT deaths-so-far (round 6's
  text named a 5th field, but its published days reproduce under
  the 4-field version; deaths move a day before the game-state
  fields do on some seeds). Compare against the r5-cut2, r6-cut,
  r7-cut, and r8-cut corpora on master, plus a full daily-snapshot
  deep-diff. Veteran killers in the instrument are keyed `by`, not
  `vid` — a phantom check reading `k.vid` silently checks nothing.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg vs this round-9 leg on identical seeds, judged by the
analyzer's decision rule. Same standing as survivalcontrol-b §7,
anchor-a §7, merge-a §7, origin-a §7, mergebase-a §7, r5-cut1-a §7,
r5-cut2-a §7, r6-cut-a §7, r7-cut-a §7, and r8-cut-a §7.

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
  REGIONAL_INTACT) — it cuts at the 385th commit only.
- The sibling Loop B arms run in their own worktrees; this arm does
  not touch them, and their verdicts do not change this leg's
  decision rules.
- No game-code change is made by this arm, so no `[needs-eyes]`
  applies.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class).
  If refused again, recorded, not waived, baseline NOT rolled.
- Ancestry note: `ee30f22a2` is the 385th commit in
  `d229b58f5..203a32775` (verified by `git rev-list --count`);
  `a6ed956f5` (377th) is an ANCESTOR of `ee30f22a2`, and
  `ee30f22a2` is an ancestor of both `203a32775` and the master tip
  `87f00547` (all verified); `203a32775` is an ANCESTOR of
  `5157782a4` (their merge-base is `203a32775` itself), not the
  reverse — do not assume a linear order between the healthy base
  and the local merge-tip.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
