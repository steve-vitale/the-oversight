# L4 `grants` leg — evidence (arm sim-optb-l4-a)

Run fleshout-20261113T0215Z (Loop A), axis scale-onramp / winnability
chain. Prereg: `evidence/2026-11-12/sim-optb-l4-a-prereg.md` (read
it first — it governs everything below: the STRICTER GO bar, seeds,
horizon, policy, run mechanics). Parent arm:
`evidence/2026-11-12/sim-optb-rederive-a.md` (L1 r125 NO_GO 4/8,
L2 favor NO_GO 4/8, L3 tendexact HEALTHY_POLE_REDERIVED 5/8; L4
not run, search stopped). Base: the collapse window's far end
`203a32775` (firstparent leg 4/8, INCONCLUSIVE). Healthy pole:
pre-reconcile master `5157782a4` (vetphantom fix leg 6/8, 8/8
regional, median 150d). Instrument-only arm — ZERO `src/js`
changes committed.

## Verdict

**NO_GO — L4 `grants` (`b6cf13684` grant-rate dial + `a16ce1cc8`
cook/mend routine-work grants): 3/8 survive**, vs the vetphantom
fix leg's 6/8, the tendexact leg's 5/8, and the firstparent leg's
4/8. The grants leg does not merely fail to match the pole — it
survives FEWER villages than the far end it was transplanted onto
(3/8 vs 4/8). Rank: **REGIONAL_INTACT** (7/8 regional). The
four-leg option-B search is now complete: L1 NO_GO, L2 NO_GO, L3
re-derived (5/8), L4 NO_GO (3/8). L3 remains the sole re-derivation.

| Leg | Candidate | Survived | Rank | Median | Wave 5 | Verdict |
|---|---|---|---|---|---|---|
| L1 `r125` | `10fe7ee52` | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | NO_GO (deep-identical) |
| L2 `favor` | `ed33b42b8` + `b09cf584e` | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | NO_GO (deep-identical) |
| L3 `tendexact` | `e6911eb80` | **5/8** | 7/8 REGIONAL_INTACT | 150d | **4/8** | HEALTHY_POLE_REDERIVED |
| **L4 `grants`** | **`b6cf13684` + `a16ce1cc8`** | **3/8** | **7/8 REGIONAL_INTACT** | **126d** | **2/8** | **NO_GO** |
| firstparent | far end `203a32775` | 4/8 | — | 150d | 2/8 | INCONCLUSIVE |
| vetphantom | healthy pole `5157782a4` | 6/8 | 8/8 | 150d | 1/8 | GO (prior) |

Wall numbers (L4 leg): survived 3/8, regional 7/8, national 0/8,
table 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 2/8, median
survival 126d, deaths 637, standing range 150–325, blooded 4/8,
tribute delivered 0/8 (ready on 0/8 — see §Secondary). Death causes
(637): villager combat 264, combat 144, expedition 129, the wild
66, monster 15, Spool 2, the arena 4, ambush 3, contest 3, a
stranger 2, Big-Eyes 1, lockjaw 1, a wound that wouldn't close 1,
alien 1, starvation 1 — combat-dominated, as on both poles. One
starvation death returns on this leg (the far end had one; L3 had
zero).

## Per-seed table (days / outcome / standing / maxWave)

| Seed | Firstparent (far end) | Vetphantom (healthy pole) | L1 r125 | L2 favor | L3 tendexact | **L4 grants** |
|---|---|---|---|---|---|---|
| 190391 | lost d86 / 199 / w4 | survived / 199 / w4 | lost d86 / 199 / w4 | lost d86 / 199 / w4 | **survived 150d / 199 / w4** | lost d86 / 199 / w4 |
| 190392 | lost d144 / 199 / w4 | survived / 199 / w4 | lost d144 / 199 / w4 | lost d144 / 199 / w4 | lost d136 / 199 / w4 | lost d126 / 199 / w4 |
| 190393 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 |
| 190394 | lost d43 / 150 / w4 | survived / 199 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 |
| 190395 | survived / 199 / w4 | lost d109 / 199 / w4 | survived / 199 / w4 | survived / 199 / w4 | **survived / 410 / w5** | lost d117 / 199 / w4 |
| 190396 | lost d87 / 199 / w4 | lost d85 / 199 / w4 | lost d87 / 199 / w4 | lost d87 / 199 / w4 | lost d85 / 199 / w4 | lost d87 / 199 / w4 |
| 190397 | survived / 275 / w5 | survived / 325 / w5 | survived / 275 / w5 | survived / 275 / w5 | survived / 275 / w5 | **survived / 325 / w5** |
| 190398 | survived / 199 / w4 | survived / 375 / w5 | survived / 199 / w4 | survived / 199 / w4 | **survived / 375 / w5** | survived / 199 / w4 |

Read the verdict honestly: grants is the only leg that moves
survival DOWN from the far end, and it does so by losing a seed
the far end survives (190395, lost d117 vs survived) while saving
nothing new and killing 190392 eighteen days earlier (d126 vs
d144). Its one improvement is standing, not survival: 190397 ends
at 325 — the pole's end state exactly, where every other leg ends
at 275. The grants leg matches the pole's end state on 2/8 seeds
(190393, 190397), against L3's 4/8. The remaining +1 gap to the
pole's 6/8 (190392/190394) is still unexplained — grants does not
touch it (190394 is deep-identical to the far end; 190392 is
worse). The 5/8 tie branch of the prereg was never tested: the leg
landed at 3/8 outright.

## What the mechanism is (grants) — and why it fails

`b6cf13684` adds the `grantFoodXpCredit` dial (first 5 XP of a task
1:1, above 5 XP 1 XP per 2 units, odd unit carried) at the hunt-kill
(butcher) and smoke-rack (preserver) sites — against the far end
this SLOWS butcher/preserver XP above the first rung. `a16ce1cc8`
adds the cook grant (first cook resolution per day, skill 1 by
~d5) and the mend/builder grant (first mend per day; the commit
itself notes mend resolved 0 times under the competent policy, so
the builder grant is inert on this band). The net direction was
genuinely ambiguous in the prereg — and the measurement resolves
it downward: the dial's slowing and the cook grant's gains do not
convert into fight outcomes on this band. The deep-identity
comparison (§Deep-identity) shows the footprint precisely: the
candidate moves only 3/8 trajectories, and on 2 of those 3 the
first divergence is a MISSING kill (190392 d49: waveKillLog 43 vs
44; 190395 d78/d79: a wave-4 kill missing, vetsW4 0 vs 1) — the
villages that die earlier die with fewer kills in the log, not
with emptier pantries. 190395 ends holding 7,795 kcal. The food
skills the grants buy are not the binding constraint on the
d40–d90 fight cluster; the pantry that matters is the one
tendexact saves, not the skill the cook gains. Kill taxonomy
(§14a): **CONCEPT-DEAD on this band as a survival carrier** — the
mechanism was staged (markers present, guards green, the dial
proven live in the proof test, trajectories moved on 3 seeds), the
metric was fair, and the concept failed on its merits in the
strongest sense: it moved the count the wrong way. Do not retry
grants as a survival carrier without a new mechanism (e.g.
evidence that cook skill actually changes a fight outcome
somewhere the dial's slowing does not offset it).

## Deep-identity comparison (pre-registered method)

Per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) + full daily-snapshot deep-diff, each leg vs the
firstparent corpus
(`evidence/2026-11-11/perseed-bisect-firstparent-a/`), the
vetphantom fix corpus
(`evidence/2026-11-11/perseed-vetphantom-b/`), and the tendexact
corpus (`evidence/2026-11-12/perseed-optb-rederive-a-tendexact/`).
Full output: `evidence/2026-11-12/optb-l4-a-deepdiff.log`
(comparison script kept in /tmp only for this run,
`optb-l4-compare-20261112.js`, modeled on the parent's
`optb-rederive-compare-20261112.js` in the goal hidden_files).

- **Grants vs firstparent: DEEP-IDENTICAL on 5/8 seeds** —
  190391 (84 shared days), 190393 (149), 190394 (41), 190396 (85),
  190398 (149). The candidate moves only three trajectories:
  190392 d49 (waveKillLog 43 vs 44 — one kill missing; ends d126
  vs d144), 190395 d78/d79 (veteranRows first, then signature:
  vetsW3 3 vs 4, vetsW4 0 vs 1, kills 65 vs 66 — a wave-4 kill
  missing; ends lost d117 vs survived), 190397 d40 (waveKillLog
  36 vs 34 — two MORE kills on grants; ready4/ready5 differ; ends
  survived 325 vs 275). Every first divergence is a fight outcome
  — never pantry, knowledge, or party first, same signature as
  the pole-vs-far-end comparison in the parent prereg.
- **Grants vs vetphantom:** end states identical on 2/8 (190393,
  190397); signatures identical on 190393 and 190397. Elsewhere:
  190391 first signature d81 (roster 4 vs 3 — the d86 death the
  pole avoids), 190392 d37, 190394 d40, 190395 d101 (late),
  190396 d45, 190398 d74 (vetsW3 5 vs 6, roster 7 vs 8). The
  counter-only deep-diffs (waveKills d17/d19/d44/d64/d73) are the
  vetcount-reconcile footprint — see §Secondary.
- **Grants vs tendexact: DEEP-IDENTICAL on 2/8 seeds** — 190393
  and 190394 (149 and 41 shared days). The two mechanisms diverge
  everywhere else they matter: 190391 d81, 190392 d37, 190395
  d78/d79, 190396 d44/d45, 190397 d40, 190398 d74.

## Secondary fields (reported, not judged)

- **Peak living wave-4+ veterans vs the bar of 2:** grants
  reaches the bar on 190393 (2), 190395 (2), 190397 (2), 190398
  (2); 190391 peaks at 1, 190392 at 1, 190394 at 0, 190396 at 1.
  (L3 reached it on 190392, 190393, 190397, 190398.) The wave-5
  choke is still the veteran bar on the lost seeds — and 190395
  shows the bar is not the survival gate either: it peaks at 2
  living wave-4 veterans and still dies d117 (ready4vets reads 0
  at the end — the veterans die with the village).
- **Tribute:** never delivered on any leg. Ready on **0/8** on
  grants — L3 was ready on 190397 (veterans 2/need 2,
  ladderVets4 2); grants reads 190397 as veterans 1/need 2
  (ladderVets4 1). 190393 reads veterans 1/need 2 on every leg —
  the ladder's LEG 3 scholar-never-counts rule still governs this
  base, as the prereg predicted.
- **Blooded:** 4/8 on every leg (190391/190393/190397/190398) —
  the BLOODED block has live callers on this base and the swap
  introduced no blooded delta, as predicted.
- **Phantom days (corrected split):** phantomLive (live count
  exceeds shadow) = **0 on all 8 seeds** — no real phantom
  anywhere; the swap works. phantomShadow (shadow exceeds live)
  = 5 on 190394 only (d40–d43, the collapse — the shadow old-rule
  count exceeds the live roster-checked count by exactly 1 while
  the roster collapses 8→0), 0 elsewhere. That is the swap doing
  its job, not a swap failure — the prereg's corrected
  expectation, confirmed.
- **waveKills counter vs log:** the counter exceeds the log by
  +2/+0/+4/+2/+2/+3/+3/+4 per seed (190391–190398) — the
  vetcount-reconcile footprint persists on this leg, exactly as
  the parent prereg predicted for the far-end base (the reconcile
  is NOT in the grants pick): the counter double-writes kills
  the log records once. Telemetry-only, behaviorally inert.
  (Note: the comparison script's `counterSum` field reads 0 on
  every seed — a script artifact, `waveKills` values are counts
  not arrays; the +0..+4 figures above are the sum of the
  per-wave counts vs the log length, computed directly.)
- **End pantry:** 190393: 8,200 kcal; 190395: 7,795 kcal (a lost
  village holding food — dies fighting, same pattern as the
  pole's 190395); 190397: 4,979 kcal; 0 on the other five seeds.
- **ARC IV:** report-only per the prereg; the instrument does not
  capture ARC IV. Not judged, no threshold set.

## Sense-testing (transcripts)

Veteran lines on the grants leg read coherent and consequential
(sampled 190391, 29 vetSays; 190397, 64): door-defense beats name
the fighters and the hurt ("Lulwa, Leo, Raj, Meera and Ingrid met
them at the door — 4 put down, 1 driven off. Lulwa, Leo, Raj,
Meera, Ingrid are hurt."); veteran kills are announced on camera
with names ("Kurt just put down Ad Break... on CAMERA. That's a
veteran kill, folks. REMEMBER the name."); wave-5 monsters are
named in the fiction ("The producers name it: the Nielsen.
Ratings embodied." is the pole's line; the grants leg's own wave-5
beats name the same cast). Gossip lines caught by the veteran-say
regex (via "scarred") read coherent and consequential too ("Three
retellings in, nobody remembers what actually happened — but
everyone has opinions."). Two known base artifacts, already
flagged in r10 §7 and the parent evidence: "A Elder veteran"
(190391 d24) — this base predates the sim-eldergrammar-a fix — and
the Blooded beat firing repeatedly (190397 d148–d149). Neither is
a new finding and neither is grants-caused: the grants are silent
XP mechanics with no voice lines of their own. No robotic,
static, or repeated dialogue surfaced beyond those known base
artifacts.

## Proof + tooling (what was repaired this run)

- The worktree as handed over was NOT on the far-end base (HEAD
  `c20d6d895`, master lineage — wrong standing/policy shas,
  grants markers already in `game.js`). The parent arm's original
  tooling commit `205ab6eae` (parent `203a32775`, tooling
  byte-identical to the rebased `a34329f61`) was recovered and the
  branch reset `--hard` to it — after verifying `c20d6d895` is an
  ancestor of main-tree `master`, so nothing landed was lost.
  Recorded in the prereg before any sim.
- The proof test is new for this arm
  (`scripts/test-optb-l4-a.js`): the L4 decision rule (≥6
  HEALTHY_POLE_MATCH, 5 tie NO_GO, ≤4 NO_GO), the grants
  mechanism live (dial arithmetic unit-checked on the loaded
  game: 1:1 under the rung, 1-per-2 above it, odd unit carried),
  the grants candidate guard (hermetic + live), and the parent's
  instrument-validity sections re-run on this tree. One
  assertion was wrong as first written (zero units "grant
  nothing" — the function returns 0 for zero units, it does not
  return the current XP; fixed, not waived). **74/0 green**
  (exit 0) before any judged sim, and **74/0 green again after
  the sims** — same configuration, no drift.
- The L4 analyzer wrapper (`scripts/optb-l4-analyze-20261112.js`)
  reuses the parent analyzer's counting code and applies this
  prereg's stricter rule; the parent analyzer's `main()` was NOT
  run for this leg (its ≥5 label would contradict this prereg at
  5/8 — the proof test asserts the two rules differ exactly
  there).
- The fix-swap and own-policy shas were verified by hand before
  any sim: standing.js pre-fix `75762cb2259d…` → fix
  `f8fda4295a99…`; competent.js `a7ff5c516440…`; instrument
  scratch byte-identical to main master (`311f105bc15f…`, 404
  lines); cherry-pick hunks verified line-identical to the
  commits' `src/js` diffs (84 insertions / 9 deletions combined,
  exactly the commits' 44+40 / 9+0); the 142 non-game.js files
  the picks carried were discarded at apply time (only
  `src/js/game.js` kept).

## Run incidents (recorded, not hidden)

- **Worktree recovery** (see §Proof + tooling): the branch was
  reset `--hard` to `205ab6eae` before the prereg was written.
  The L4 commits are parented on `205ab6eae`; the coordinator
  adopts by SHA, as for the parent arm.
- **safe-commit index clobber** (AGENTS.md, known class): after
  the tooling commit `10a9bd5f8`, the main index showed the three
  committed files staged-as-deleted while the worktree files were
  byte-identical to HEAD. Repaired with the documented pipe
  (`git ls-tree HEAD -- <paths> | git update-index --add
  --index-info`); verified `git status --short` shows only the
  intended uncommitted changes and `git diff HEAD` is empty for
  the three files. The commit itself was always correct.
- **Cherry-picks clean:** both `git cherry-pick -n` applies
  auto-merged `src/js/game.js` with no conflicts. No behavioral
  hunk was hand-resolved (none needed resolving).
- **Host write flap:** probes (`git update-ref refs/heads/probe
  HEAD`) succeeded before every commit and every leg. No flap
  episode touched this run.
- **Telemetry deviation check:** attempted per loop body step
  10 — REFUSED by the tool ("refusing recorder-corpus input:
  all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs"), exactly as the prereg
  predicted and as prior bisect arms were refused. Recorded,
  not waived; the baseline was NOT rolled. No LOUD lines exist
  to investigate (the tool refused the input class entirely).
- **Instrument scratch:** `scripts/vetfirst-instrument-20261111.js`
  was copied from main master as untracked scratch per the prereg
  and deleted before finishing (it already exists on master;
  committing a duplicate would break the later rebase).
- **Restore verified:** after the leg, `src/js/standing.js`
  restored byte-identical (sha256 `75762cb2259d…`, `cmp` clean
  against the pre-pick backup) and `src/js/game.js` restored
  (`git diff HEAD -- src/js/` empty). The worktree contains only
  committed work plus the evidence commit below.

## Metric review (§14 — metrics held; the stricter bar did its job)

- The primary metric (survived count on the matched band, GO
  ≥6/8 for a pole match) held: it separated the leg cleanly
  (3/8, below both the far end's 4/8 and L3's 5/8) and the
  deep-identity comparison gave the NO_GO a mechanical
  explanation (5/8 deep-identical corpora; the 3 moved
  trajectories split 2-down/1-up-standing) rather than a
  statistical shrug. No re-scoring happened: the leg was judged
  NO_GO on the count, and the deep-identity finding was reported
  as the mechanism, not substituted as the verdict.
- The stricter bar's purpose was prophylactic — the observed 3/8
  never tested the 5/8 boundary — but the wrapper's existence is
  vindicated by construction: under the parent rule, a 5/8 here
  would have been mislabeled HEALTHY_POLE_REDERIVED. The next
  run inherits the wrapper for any leg whose bar must sit above
  an already-held count.
- The rank read (regional ≥5/8) held but did not discriminate:
  all four legs read 7/8 REGIONAL_INTACT, one short of the
  pole's 8/8, while survival moved 3–5/8. Regional reach is not
  the binding constraint on this band — survival is.
- **Phantom-days split (adopted from the parent's correction):
  works.** phantomLive 0 everywhere is the clean read the swap
  deserves; phantomShadow 5 on the collapsing 190394 is the
  expected shape, not a failure. Keep the split.
- The pre-pilot substrate checks (§14b) were satisfied by the
  commits' own evidence (contact: cook duty resolves ~2–3x/day
  under competent; pool: every village has a cook; verb:
  `grantFoodXpCredit` + the cook/mend sites exist after the pick;
  horizon: 150d contains the d5 skill-1 and ~d25 skill-2 ramps).
  The substrate was real — the concept still failed. That is a
  CONCEPT-DEAD kill, not a substrate miss.
- Kill taxonomy (§14a) for this NO_GO: **CONCEPT-DEAD on this
  band as a survival carrier** — the mechanism was staged, the
  metric was fair, and the concept failed on its merits (it moved
  survival down, not up). Do not retry grants as a survival
  carrier without a new mechanism.

## Convergence state

**Converged — for the option-B question.** All four candidate
legs are now run: L1 NO_GO (deep-identical), L2 NO_GO
(deep-identical), L3 HEALTHY_POLE_REDERIVED (5/8, tendexact),
L4 NO_GO (3/8, grants — worse than the far end). The healthy pole
is re-derived by exactly one candidate, the exact-split pantry
fix; the grants leg is eliminated as a carrier, and the RNG
candidates are eliminated mechanically. The scale-onramp axis
itself is **converging, not converged**: national 0/8, table 0/8,
wins 0/8 on every leg — tendexact moves survival, grants moves it
backward, neither moves scale. The next run's work, narrowed by
this arm: (1) the +1 gap to the pole's 6/8 (190392/190394 — what
saves them on the pole but not on tendexact; grants does not touch
it); (2) the prereg's residual items (r180 draw-removal, r172
confession-guard trust effect — both smaller than the gap); (3)
the scale wall itself, which no leg in this search moved.
**No `[needs-eyes]`** — this arm is instrument-only; no game
code is committed, no feel/combat/UI change exists to playtest.

## Corpora + summaries

- `evidence/2026-11-12/perseed-optb-rederive-a-grants/` (8 JSONs)
- `evidence/2026-11-12/optb-l4-a-grants-summary.json` (NO_GO, 3/8)
- `evidence/2026-11-12/optb-l4-a-deepdiff.log` (deep-identity comparison)
- Driver log: `optb-l4-a-grants-driver.log`
- Tooling commit: `10a9bd5f8` (parent `205ab6eae`; prereg + L4
  analyzer + proof, 74/0 green). Evidence commit: see §9.

## §9 — adoption note for the coordinator

This worktree is on branch `sim-optb-l4-a` (NOT detached — the
tooling commit `10a9bd5f8` moved HEAD normally, and the evidence
commit below will too). The L4 commits are parented on the
parent arm's original tooling commit `205ab6eae` (parent
`203a32775`, the far-end base) — NOT on the rebased
`a34329f61`/`c20d6d895` lineage, because that lineage is
master-based and cannot run this leg (see §Proof + tooling).
Rebase/merge is the coordinator's job — nothing here was merged,
pushed, or version-bumped. The instrument scratch
(`scripts/vetfirst-instrument-20261111.js`) was deleted before
finishing; the worktree contains only committed work plus the
evidence corpora in the evidence commit. The comparison script
for this leg lives in /tmp only (`optb-l4-compare-20261112.js`) —
it was not committed, and the parent's script in the goal
hidden_files was not modified.
