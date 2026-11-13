# Option-B healthy-pole re-derivation — evidence (arm sim-optb-rederive-a)

Run fleshout-20261112T2315Z (Loop A adoption), axis scale-onramp /
winnability chain. Prereg:
`evidence/2026-11-12/sim-optb-rederive-a-prereg.md` (read it first —
it governs everything below: seeds, horizon, policy, GO bar, run
mechanics). Base: the collapse window's far end `203a32775`
(firstparent leg 4/8, INCONCLUSIVE). Healthy pole: pre-reconcile
master `5157782a4` (vetphantom fix leg 6/8, 8/8 regional, median
150d). Instrument-only arm — ZERO `src/js` changes committed.

## Verdict

**HEALTHY-POLE RE-DERIVED — by leg L3 `tendexact` (`e6911eb80`,
hierarchy.js exact-split `_removePantryKcal`): 5/8 survive**, vs the
vetphantom fix leg's 6/8 and the firstparent leg's 4/8. Rank:
**REGIONAL_INTACT** (7/8 regional). The search stopped at the first
leg to reach ≥5/8, per the prereg — **L4 `grants` was not run**.

| Leg | Candidate | Survived | Rank | Median | Wave 5 | Verdict |
|---|---|---|---|---|---|---|
| L1 `r125` | `10fe7ee52` secret-answer variety + teach-plant frames | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | **NO_GO** |
| L2 `favor` | `ed33b42b8` + `b09cf584e` favour-line pools + stateful cycle | 4/8 | 7/8 REGIONAL_INTACT | 150d | 2/8 | **NO_GO** |
| L3 `tendexact` | `e6911eb80` exact-split `_removePantryKcal` | **5/8** | 7/8 REGIONAL_INTACT | 150d | **4/8** | **HEALTHY_POLE_REDERIVED** |
| L4 `grants` | `b6cf13684` + `a16ce1cc8` grant-rate dial + cook/mend grants | — | — | — | — | **NOT RUN** (search stopped) |
| firstparent | far end `203a32775` | 4/8 | — | 150d | 2/8 | INCONCLUSIVE |
| vetphantom | healthy pole `5157782a4` | 6/8 | 8/8 | 150d | 1/8 | GO (prior) |

Wall numbers (L3 leg): survived 5/8, regional 7/8, national 0/8,
table 0/8, wins 0/8, wave-4 unlocks 8/8, wave-5 unlocks 4/8, median
survival 150d, deaths 662, standing range 150–410, blooded 4/8,
tribute delivered 0/8 (ready on 190397 only, same as the far end).
Death causes (662): villager combat 279, combat 135, expedition
125, the wild 84, monster 22, Spool 2, arena 3, ambush 3, wound
4, contest 2, the night 1, a stranger 2 — combat-dominated, as on
both poles. Starvation 0 (the far end's single starvation death is
gone on this leg).

## Per-seed table (days / outcome / standing / maxWave)

| Seed | Firstparent (far end) | Vetphantom (healthy pole) | L1 r125 | L2 favor | L3 tendexact |
|---|---|---|---|---|---|
| 190391 | lost d86 / 199 / w4 | survived / 199 / w4 | lost d86 / 199 / w4 | lost d86 / 199 / w4 | **survived 150d / 199 / w4** |
| 190392 | lost d144 / 199 / w4 | survived / 199 / w4 | lost d144 / 199 / w4 | lost d144 / 199 / w4 | lost d136 / 199 / w4 |
| 190393 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 | survived / 325 / w5 |
| 190394 | lost d43 / 150 / w4 | survived / 199 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 | lost d43 / 150 / w4 |
| 190395 | survived / 199 / w4 | lost d109 / 199 / w4 | survived / 199 / w4 | survived / 199 / w4 | **survived / 410 / w5** |
| 190396 | lost d87 / 199 / w4 | lost d85 / 199 / w4 | lost d87 / 199 / w4 | lost d87 / 199 / w4 | lost d85 / 199 / w4 |
| 190397 | survived / 275 / w5 | survived / 325 / w5 | survived / 275 / w5 | survived / 275 / w5 | survived / 275 / w5 |
| 190398 | survived / 199 / w4 | survived / 375 / w5 | survived / 199 / w4 | survived / 199 / w4 | **survived / 375 / w5** |

Read the verdict honestly: the re-derivation is **by count, not by
seed-pattern**. L3 saves 190391 exactly the way the healthy pole
does (both survive 150d at standing 199), and it matches the pole's
end state exactly on 190391, 190393, 190396 (lost d85 on both), and
190398 (survived, standing 375, wave 5) — 4/8 end states identical
to the pole. But it does NOT save 190392 or 190394 (the pole saves
both), and it KEEPS 190395 — which the pole LOSES d109 — and
improves it past the pole (survived, wave 5, standing 410 vs the
pole's loss). One more honesty note on the route: the pole saves
190391 ending with 400 kcal in the pantry; tendexact saves the
same seed ending with 21,975 kcal. Same survival, different route
— the count is re-derived, the pantry story is not the pole's.
Net +1 over the far end, against the pole's net +2: minus the two
unsaved seeds, plus the kept one. The remaining +1 gap to the pole's 6/8 (190392/190394) is still
unexplained — it sits in commits outside these four candidates, or
in their interaction. L4 `grants` remains untested (the search
stopped per the prereg); it is the first item for the next run if
anyone wants the 6th seed.

## What the mechanism is (tendexact)

`e6911eb80` makes every tend/tribute/demand payment take exactly
what was asked — the old whole-unit take over-paid 1500→1500–1901
per call. The mechanism is visible in the end states, not just the
count: 190391 ends holding **21,975 kcal** on L3 (0 on the far
end, 0 on L1/L2); 190395 ends at 9,893 kcal with standing 410
(0 / 199 before). The pantry savings compound across a 150-day run
into a village that survives its d86 fight and then reaches wave 5
on two seeds that never got there. The prereg ranked this candidate
third because the death-cause/pantry evidence argued against it
(villages die fighting with full pantries) — that reading was wrong
in one respect: the pantry that matters here is not the end pantry
of a lost village, it is the running balance that keeps fighters
fed and equipped through the d40–d90 fight cluster. The two seeds
L3 loses earlier than the far end (190392 d136 vs d144, 190396 d85
vs d87) are small negative moves — the savings change which fights
happen, not just their outcomes.

## Deep-identity comparison (pre-registered method)

Per-day 4-field signature (vetsW3, vetsW4, waveKillLog length,
roster length) + full daily-snapshot deep-diff, each leg vs the
firstparent corpus
(`evidence/2026-11-11/perseed-bisect-firstparent-a/`) and the
vetphantom fix corpus
(`evidence/2026-11-11/perseed-vetphantom-b/`). Full output:
`evidence/2026-11-12/optb-rederive-a-deepdiff.log` (comparison
script kept in the goal hidden_files,
`optb-rederive-compare-20261112.js`).

- **L1 r125 vs firstparent: DEEP-IDENTICAL on all 8 seeds** — not
  one daily snapshot differs on any seed. The r125 RNG draws never
  fire differentially on this band: no secret-answer confession or
  teach-plant line lands in 8×150 days of competent play (or any
  that land fire identically). The prereg's RNG-carried hypothesis
  for L1 is dead in the strongest form — the candidate is
  behaviorally inert here, not merely too weak to move the count.
  The NO_GO is mechanical, not statistical.
- **L2 favor vs firstparent: DEEP-IDENTICAL on all 8 seeds** —
  same reading. The favour display lines never fire
  differentially in the sims (no live sitting displays a favour
  block, or every display resolves identically). NO_GO, mechanical.
- **L3 tendexact vs firstparent:** diverges on 5 seeds — 190391
  d81 (roster 3 vs 4: the d86 death does not happen), 190392 d37
  (a wave-3 kill missing), 190395 d92 (roster 10 vs 8, scholar
  changes — a succession the far end never reaches), 190396 d44
  (veteranRows only), 190398 d74 (waveKillLog/wave4Slain/vets —
  the wave-5 turn). Identical on 190393, 190394, 190397. Every
  first divergence is a fight outcome or a roster move — never
  pantry, knowledge, or party first, same signature as the
  pole-vs-far-end comparison in the prereg.
- **L3 vs vetphantom:** 190391 first signature divergence only
  d130 (late roster 7 vs 6, after the village has already
  survived); 190393 signatures identical; 190396 identical end;
  190398 signatures identical. The remaining pole gaps are 190392
  (first divergence d78), 190394 (d40), 190395 (d79 — the pole's
  loss is itself a divergence), 190397 (d40, standing 275 vs 325).
- The `waveKills` COUNTER diverges from the LOG on the far-end
  base exactly as the prereg predicted (the vetcount-reconcile
  footprint): firstparent 190394 counter 42 vs log 40; tendexact
  190391 counter 85 vs log 83. Telemetry-only, behaviorally inert.

## Secondary fields (reported, not judged)

- **Peak living wave-4+ veterans vs the bar of 2:** L3 reaches
  the bar on 190392 (2), 190393 (2), 190397 (2), 190398 (3);
  190391 peaks at 1, 190395 at 1, 190396 at 1, 190394 at 0. (L1/L2:
  bar reached on 190393, 190397, 190398 only.) The wave-5 choke
  is still the veteran bar on the lost seeds — 190391 survives
  without ever holding 2 living wave-4 veterans, so the bar is
  not the survival gate; it is the wave-5 gate, and L3 opens it
  on 190395/190398 where the far end never did.
- **Tribute:** never delivered on any leg. Ready only on 190397
  (all three legs, same as the far end). 190393 reads
  veterans=1/need=2 on every leg — the ladder's LEG 3
  scholar-never-counts rule still governs this base, as the
  prereg predicted.
- **Blooded:** 4/8 on every leg (190391/190393/190397/190398) —
  the BLOODED block has live callers on this base (the wave5kill
  lever) and the swap introduced no blooded delta, as predicted.
- **Phantom days:** 0 on every leg on 7/8 seeds. 190394 shows 5
  phantom days (d40–d43) on ALL legs including the far-end
  baseline: the shadow old-rule count exceeds the live
  roster-checked count by exactly 1 while the roster collapses
  8→0 in the village's death spiral — a killer whose vp record
  is alive but who is no longer on the roster. That is the swap
  doing its job (the live count is the correct one), not a
  swap failure. The prereg's "0 expected" was the wrong
  expectation for a collapsing village; the live read is what
  the verdict uses, and it is the harness end state, not the
  instrument.
- **ARC IV:** report-only per the prereg; the instrument does not
  capture ARC IV. Not judged, no threshold set.

## Sense-testing (transcripts)

Veteran lines on the tendexact leg read coherent and consequential
(sampled 190391, 50 vetSays; 190395, 32): door-defense beats name
the fighters and the hurt ("Lulwa, Leo, Raj, Meera and Ingrid met
them at the door — 4 put down, 1 driven off. Lulwa, Leo, Raj,
Meera, Ingrid are hurt."); veteran kills are announced on camera
with names ("Kurt just put down Ad Break... on CAMERA. That's a
veteran kill, folks. REMEMBER the name."); wave-5 monsters are
named in the fiction ("The producers name it: the Nielsen.
Ratings embodied."). One known base artifact, already flagged in
r10 §7: "A Elder veteran" (190391 d24) — this base predates the
sim-eldergrammar-a fix, so the line is a base artifact, not a new
finding. No robotic, static, or repeated dialogue surfaced in the
sampled lines.

## Proof + tooling (what was repaired this run)

The adoption brief said the prior worker "finished the analysis,
the prereg, the driver, the analyzer, and the proof test" — the
files on disk told a different story, and this run fixed them
before any judged sim (all verified, then committed as
`205ab6eae`, parent `203a32775`):

- The **analyzer** was a verbatim copy of the r10-cut analyzer
  (read the r10 corpus, judged CUT10_* verdicts). Rewritten for
  this arm: per-leg corpora, `HEALTHY_POLE_REDERIVED` / `NO_GO`
  verdicts, `optb-rederive-a-<leg>-summary.json` outputs.
- The **proof test** was a verbatim copy of the r9-cut test
  (required the r9 modules, tested CUT9_* verdicts and the r9
  pre-fix sha). Rewritten for this arm: optb modules, the
  `75762cb2259d` far-end pre-fix sha, the optb decision rule, and
  a new §6 proving every leg's candidate markers present at the
  healthy pole and absent at the far end (hermetic, from `git
  show` text).
- The **driver** was genuinely adapted, but the candidate guard
  its header promised did not exist in code (no `candidateGuard`
  at all — a leg could have run without its candidate and never
  been refused). Implemented: per-leg marker tables (verified
  present at `5157782a4`, absent at `203a32775`), `candidateGuard`
  / `candidateMarkersPresent`, refusal at run entry, and
  `candidateApplied` recorded per seed.
- The proof test then ran **75/0 green** (exit 0) on the far-end
  checkout with the fix swapped in — including a real
  `ENOBUFS` failure on first run (`git show` of 1.1MB game.js
  exceeded execSync's 1MB default maxBuffer; fixed with
  `maxBuffer: 64MB` in the §6 git-show calls, re-run green).
- The **fix-swap and own-policy shas** were verified by hand
  before any sim: standing.js pre-fix `75762cb2259d…` → fix
  `f8fda4295a99…`; competent.js `a7ff5c516440…`; sim-harness.js
  byte-identical between the poles (`d0447d02939b…`); instrument
  scratch byte-identical to master (`311f105bc15f…`).

## Run incidents (recorded, not hidden)

- **L1 cherry-pick conflict (non-behavioral):** `git cherry-pick
  -n 10fe7ee52` conflicted on three files r125 itself created
  after the far end (`DU`: evidence prereg, r125 analyzer,
  r125 analyzer test) — they do not exist at `203a32775`, so the
  pick could not merge them. The two `src/js` hunks auto-merged
  cleanly. The three DU files were resolved by taking the
  incoming versions (they are r125's own test/evidence files,
  never loaded by the driver), and the applied `src/js` hunks
  were verified line-identical to the commit's `src/js` diff
  (91 added / 7 removed, identical both ways) before running.
  No behavioral hunk was hand-resolved. Recorded here per the
  prereg's conflict rule.
- **L2 cherry-pick clean** (no conflicts); the two commits'
  net `src/js` effect was verified against `b09cf584e`'s file
  text — the only differences are hunks from non-picked range
  commits (r165/r166/r168/r169/r176 dialogue guards, all in the
  prereg's excluded list).
- **L3 cherry-pick clean** (single file, added/removed lines
  identical to the commit's diff).
- **Runtime restart mid-L1:** the driver session was killed by a
  runtime restart after 2/8 seeds (190391, 190392 — both valid,
  0 instrument errors, correct shas). Per the prereg's
  incomplete-corpus guard, only the missing 6 seeds were re-run;
  the 2 completed seeds were kept, not re-run. `/tmp` was wiped
  by the restart (the first driver log and the extracted
  fix file were lost); all later logs went to `evidence/` and
  the fix file was re-extracted from `git show` deterministically.
- **safe-commit.sh on detached HEAD:** the tooling commit
  `205ab6eae` was created but HEAD did not move — the script
  failed `update_ref` for `refs/heads/` (empty branch name on a
  detached HEAD) and reported the commit while leaving HEAD at
  `203a32775`. Recovered with `git reset --mixed 205ab6eae`
  (index-only move; worktree untouched; standing.js swap and
  instrument scratch verified intact afterwards). The same
  quirk will strike the evidence commit below; the coordinator
  should adopt by SHA (see §9). Note the r10 arm's tooling
  commit `79eaafd92` is likewise dangling (no ref contains it).
- **Host write flap:** the flap-watch log read ALL-OK throughout
  this run (probe `git update-ref refs/heads/probe HEAD`
  succeeded before every commit and every leg). No flap
  episode touched this run.
- **Telemetry deviation check:** attempted per loop body step
  10 — REFUSED by the tool ("refusing recorder-corpus input:
  all 8 --current rows carry top-level anchorCommit, so they
  are sweep recorder rows, not runs"), exactly as the prereg
  predicted and as prior bisect arms were refused. Recorded,
  not waived; the baseline was NOT rolled. No LOUD lines exist
  to investigate (the tool refused the input class entirely).
- **Instrument scratch:** `scripts/vetfirst-instrument-20261111.js`
  was copied from master as untracked scratch per the prereg and
  deleted before finishing (it already exists on master;
  committing a duplicate would break the later rebase).

## Metric review (§14 — metrics held, one correction owed)

- The primary metric (survived count on the matched band, GO
  ≥5/8) held: it separated the legs cleanly (4/8, 4/8, 5/8) and
  the deep-identity comparison gave the NO_GOs a mechanical
  explanation (deep-identical corpora) rather than a
  statistical shrug. No re-scoring happened: L1/L2 were judged
  NO_GO on the count, and the deep-identity finding was
  reported as the mechanism, not substituted as the verdict.
- The rank read (regional ≥5/8) held but did not discriminate:
  all three legs read 7/8 REGIONAL_INTACT, one short of the
  pole's 8/8, while survival moved. Regional reach is not the
  binding constraint on this band — survival is.
- **Correction owed for the NEXT run:** the prereg's "phantom
  days (0 expected)" is wrong as stated — a collapsing village
  legitimately shows shadow-over-live days while its roster
  falls apart, and those days prove the swap works rather than
  failing it. The next prereg should define phantom days as
  "live count exceeds shadow" (a real phantom) vs "shadow
  exceeds live during a collapse" (expected), or drop the field
  to report-only with that note.
- The pre-pilot substrate checks (§14b) were satisfied by the
  prereg's own divergence analysis (contact: the tendexact
  code path fires on every tend; pool: the over-payment is
  measured 1500→1500–1901; verb: `_removePantryKcal` exists;
  horizon: 150d contains the d81/d92 divergences).
- Kill taxonomy (§14a) for the two NO_GOs: **CONCEPT-DEAD on
  this band** — the mechanism was staged (markers present,
  guards green), the metric was fair, and the concept failed on
  its merits in the strongest sense: the candidates never
  moved a single daily snapshot. Do not retry r125 or favour
  as survival carriers without a new mechanism (e.g. evidence
  that the lines actually fire in sim play). The tendexact
  GO is a genuine mechanism, not a metric artifact.

## Convergence state

**Converged — for the option-B question.** The healthy pole is
re-derived: the exact-split pantry fix carries +1 survival over
the far end (4/8 → 5/8) with a visible mechanism (end pantries
21,975 / 9,893 kcal, two new wave-5 unlocks). The scale-onramp
axis itself is **converging, not converged**: national 0/8,
table 0/8, wins 0/8 on every leg — the tendexact fix moves
survival, not scale. The next run's work, narrowed by this arm:
(1) the +1 gap to the pole's 6/8 (190392/190394 — what saves
them on the pole but not on tendexact); (2) L4 `grants`
(untested — the search stopped per the prereg, and its net
direction was genuinely ambiguous); (3) the prereg's residual
items are now mostly moot — the joint-RNG leg and the RNG-reseed
control would measure a stream that L1/L2 proved never shifts
on this band; the r180 draw-removal and r172 confession-guard
items remain, but both are smaller than the 190392/190394 gap.
**No `[needs-eyes]`** — this arm is instrument-only; no game
code is committed, no feel/combat/UI change exists to playtest.

## Corpora + summaries

- `evidence/2026-11-12/perseed-optb-rederive-a-r125/` (8 JSONs)
- `evidence/2026-11-12/perseed-optb-rederive-a-favor/` (8 JSONs)
- `evidence/2026-11-12/perseed-optb-rederive-a-tendexact/` (8 JSONs)
- `evidence/2026-11-12/optb-rederive-a-r125-summary.json` (NO_GO)
- `evidence/2026-11-12/optb-rederive-a-favor-summary.json` (NO_GO)
- `evidence/2026-11-12/optb-rederive-a-tendexact-summary.json` (HEALTHY_POLE_REDERIVED)
- `evidence/2026-11-12/optb-rederive-a-deepdiff.log` (deep-identity comparison)
- Driver logs: `optb-rederive-a-{r125,favor,tendexact}-driver.log`
- Tooling commit: `205ab6eae` (parent `203a32775`; prereg + driver
  + analyzer + proof, 75/0 green). Evidence commit: see §9.

## §9 — adoption note for the coordinator

This worktree is on a **detached HEAD**. The tooling commit is
`205ab6eae` (parent `203a32775`); the evidence commit is a second
commit on the same detached HEAD (created by safe-commit.sh,
which does not move HEAD when detached — recover it the same
way: note the SHA it prints, then `git reset --mixed <sha>`).
Rebase/merge is the coordinator's job — nothing here was merged,
pushed, or version-bumped. The instrument scratch
(`scripts/vetfirst-instrument-20261111.js`) was deleted before
finishing; the worktree contains only committed work plus the
evidence corpora in the evidence commit.
