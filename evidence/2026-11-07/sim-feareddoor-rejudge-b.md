# sim-feareddoor-rejudge-b — the feared door, re-judged: 5 feared wins vs 0 — GO

**Arm:** sim-feareddoor-rejudge-b (run fleshout-loop-b-20261107T1830Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy file.**
Adopts the HELD branch `sim-feareddoor-b` (1430Z run, held by the
1730Z coordinator). **Verdict: GO as judged by the REVISED header**
(prereg `evidence/2026-11-07/sim-feareddoor-rejudge-b-prereg.md`,
committed 16d6acac5 before any re-judgment). **NO NEW SIMS — this
is a re-judgment on the frozen corpus only.** The feared door's
contribution is 5 feared wins against 0 in the baseline, margin
+5, with a clean cost bar and a 12/12 guard. **Band:** 53201–53212
FRESH · **Horizon:** 150d death-aware · **Legs:** baseline
(doorwalk rotation, `DOORWALK_B=1`, `FEAREDDOOR_B` unset) + armed
(same + `FEAREDDOOR_B=1`), 12 files each · **Corpus:**
`evidence/2026-11-07/perseed-feareddoor-b-baseline/` and
`perseed-feareddoor-b-armed/` (frozen; 0 instrument errors across
all 24 files) · **Proof:**
`scripts/test-feareddoor-rejudge-b-20261107.js` 31/31 green before
the evidence file was written · **Analyzer:**
`scripts/feareddoor-rejudge-b-analyze-20261107.js` (analysis at
`/tmp/feareddoor-rejudge-b-analysis.json` — working copy, this
evidence file is the record; the frozen analyzer was NOT edited)
· **Panel:** `evidence/2026-11-07/feareddoor-panel.md` (+ `.json`,
`-before/-after.json.gz`), re-run on the frozen corpus and
reproduced BYTE-IDENTICALLY (all four sha256s match the frozen
run), decision `review_required`, win rate 0.4167 → 0.4167
(delta 0).

**The one-line result, plainly:** the feared door was walked
five times and won five times, and the rotation it replaced won
none of those sittings through fear — because the rotation
never walked feared at all. The lever's own contribution is
five feared wins against zero. The old header asked for two
more wins than a baseline that had already won everything it
sat; the revised header asks what the lever itself adds, and
the answer is +5.

## The frozen verdict stands — this is a new judgment, not a rewrite

Per §14 metric binding, the frozen run's NO-GO stands as judged
under its frozen header (`evidence/2026-11-07/sim-feareddoor-b.md`,
prereg a696d0178). Nothing in this file re-scores it. This run
judges the SAME frozen corpus under a NEW prereg (16d6acac5),
in the exact shape the doorwalk-confirm run landed under
(wins ≥4/12 AND margin ≥3; prereg ba1831626, landed
dbfcca9b3) — applied here to feared wins, the lever's own
contribution. The 1730Z coordinator ordered exactly this
re-judge as next blank #1, and the frozen metric review
proposed exactly this revision. The landing call belongs to
the coordinator.

## Corpus verification (before the prereg)

12+12 per-seed files, band 53201–53212 complete, all parse, 0
instrument errors, per-seed days match the frozen evidence
table exactly (90/150/91/150/150/93/150/123/102/69/145/90 in
both legs). Per-seed `anchorCommit`: baseline 808515cb5a34
(the tooling commit), armed b8bbf538e416 (the prefix-shape
fix). Branch base 660825ea2 (the doorwalk tip rebased onto
cf22937b8); judged at branch tip 6e8b3e8f0.

**Base correction, recorded honestly:** the task brief for
this run names "judged base 4ce3c0c1f" — that is the
doorwalk-confirm base, not this corpus's base. This corpus
was judged on base 660825ea2 (the frozen evidence file's
Base note, the per-seed `anchorCommit` values, and this
run's re-read of the files all agree). The re-judge judges
the corpus's own frozen numbers, not the brief's shorthand.
No gap was found.

## Judged bars (revised prereg)

| Bar | Baseline | Armed | Result |
|---|---|---|---|
| Feared wins ≥ 4/12 armed AND margin ≥ 3 over baseline feared wins | 0/12 | **5/12 (margin +5)** | PASS |
| Feared entered (recorded; wins imply entry) | 0/12 | **5/12** | recorded |
| Baseline feared entered 0/12 (RED pin) | **0/12** | — | PASS |
| Substrate sanity: baseline lesser ≥ 4/12 AND sat ≥ 4/12 | **6/12 and 5/12** | — | PASS |
| Substrate guard 12/12 per-seed exact | — | **12/12** | PASS |
| Per-seed survival non-inferiority 12/12 | — | **12/12** | PASS |
| Starvation ≤ baseline + 2 total AND arm-only 0 | 4 | **4 (cap 6), arm-only 0** | PASS |
| Median survival armed ≥ 0.8× baseline median | 112.5d | **112.5d (ratio 1.0)** | PASS |
| Pair days (recorded, not gated) | 80 | **80** | recorded |

**Cost-bar detail (per seed):** every seed's armed effective
days (won seeds count at the 150d horizon) meet or exceed
its baseline day — the five winners count at 150d against
baseline 90–102d; the seven never-entered seeds reproduce
their baseline days exactly (150/150/150/150/123/69/145).
Starvation is the same four seeds in both legs (53202,
53207, 53209, 53210); the drive starved nobody. The
all-seed medians are identical (112.5d → 112.5d) because the
two legs differ ONLY in which door was walked on the five
sat seeds.

## The feared wins, per seed

| Seed | Baseline walked | Armed walked | Feared win | Branch | Sit / entry day | Final |
|---|---|---|---|---|---|---|
| 53201 | defiant | **feared** | yes | light | d90 / d90 | final:mercy |
| 53203 | beloved | **feared** | yes | light | d90 / d90 | final:mercy |
| 53206 | assimilated | **feared** | yes | light | d93 / d93 | final:mercy |
| 53209 | defiant | **feared** | yes | light | d102 / d102 | final:mercy |
| 53212 | relay | **feared** | yes | light | d90 / d90 | final:mercy |
| 53202/04/05/07/08/10/11 | — (no seat) | — | — | — | — | — |

Every sat seed walked feared in the armed leg and won it;
every sat seed's baseline walk won through a different door.
Feared offered-but-unwalked: 5/5 in the baseline leg, **0/5
in the armed leg**. The walks themselves are unchanged from
the frozen evidence (same corpus, same beats, same audits) —
this file does not re-litigate the sense-test read; the
frozen evidence's sense-test section stands.

## Wall numbers (this run's judged corpora — unchanged, same corpus)

National / table-sat / doors-entered / feared-entered /
feared-wins / wins: baseline **0 / 5 / 5 / 0 / 0 / 5** →
armed **0 / 5 / 5 / 5 / 5 / 5** · Wave-4 unlocks 12/12 →
12/12 · Wave-5 unlocks 4/12 → 4/12 · Wave-5 faced 4/12 →
4/12 · Lesser seats earned 6/12 → 6/12, sat 5/12 → 5/12 ·
Full seat 0/12 → 0/12 · Median survival 112.5d → 112.5d
(all seeds, identical) · Median non-won 150d → 150d · Max
150d → 150d. National is still 0/12, the full seat still
names national — the wins came through the LESSER seat,
which is exactly what TABLE.md prices. The feared door adds
no net wins on this band because the rotation had already
won every sitting; what it adds is five feared wins where
the baseline had zero.

## Balanced panel (§15) and telemetry

Panel `evidence/2026-11-07/feareddoor-panel.md`: re-run on
the frozen corpus with the frozen panel builder — all four
panel files reproduce byte-identically (sha256 verified
against the frozen run), decision `review_required`. Table
win rate **0.4167 → 0.4167** (delta 0 — the feared wins
replace rotation wins one-for-one, no net win change);
national 0 → 0, survival30/60 1 → 1 (no movement);
villageDeaths/run 66.75 → 66.75 (delta 0);
villageDeaths/100d 59.8491 → 59.8491 (delta 0);
communityLost 0.25 → 0.25 (no material signal). Every panel
metric reads delta 0: the two legs are the same twelve
villages living the same twelve lives, differing only in
which door was walked on five sittings. The panel does not
observe door entry (contract has no door mapping) — entry
is judged from the analyzer, as the prereg states.
Telemetry deviation check: `scripts/telemetry-check.js`
REFUSES recorder-corpus input (same refusal as
doorwalk/takeseat/feareddoor frozen — "all 12 --current
rows carry top-level anchorCommit"). No LOUD line, no
deviation signal; zero src/js changed, so no Game-telemetry
baseline exists to deviate from.

## Metric review

The revised metric worked as designed. The primary
(feared wins ≥4/12 AND margin ≥3) discriminated on the
lever's own contribution: 5 vs 0, margin 5 — a clean pass
with headroom, not a squeak. The guard (12/12) and the
per-seed non-inferiority bar (12/12) are the bars that
actually bind this lever's safety, and both pass exactly.
Three observations for the NEXT run's prereg, not revisions
here: (1) THE MEDIAN TRIPWIRE held at ratio 1.0 here, but
it is the weakest bar in the set — on a band where the
baseline wins 0/12 and the armed leg wins 5/12 at d90, the
armed all-seed median would read ~0.75× baseline and trip
the 0.8× wire on a clean lever (the same win-truncation
artifact the doorwalk-confirm run retired the old median
bar for). The per-seed bar, not the median, is the real
cost judge; if a future arm trips only the median wire,
the metric review should say so and the per-seed bar
should govern. (2) THE STARVATION CAP: this prereg set
baseline+2 (the brief's number); the doorwalk-confirm
revised bar used baseline+1, and its metric review noted a
relative cap is nearly vacuous when baseline starvation is
already 4. The frozen numbers pass either cap (4→4), and
the arm-only-0 clause is the binding part — it is what
would catch a lever that starves a fresh village. A future
prereg should keep arm-only 0 and consider an absolute cap.
(3) THE MARGIN BAR counts baseline feared wins honestly:
had the baseline rotation ever walked feared and won (its
only-feared fallback), the margin would narrow the same
way — the bar does not assume the baseline is 0, it
measures the difference. No metric change is proposed for
this arm; the bars stand as frozen in the re-judge prereg.

## What this re-judge does NOT claim

- Not a new measurement: NO new sims were run. Every number
  here is the frozen corpus re-read under a new header. The
  frozen evidence file remains the record of the walks, the
  sense-test read, and the substrate.
- Not a rewrite of the frozen NO-GO: that verdict stands as
  judged under its frozen header. This file records a NEW
  judgment under a NEW prereg; the old verdict is not
  edited, not deleted, not re-scored.
- Not a full seat: 0/12 full, national 0/12. The wins came
  through the LESSER seat. The full seat still names
  national standing, and no village has reached national.
- Not "feared wins more": the armed leg won 5, the baseline
  leg won 5. Feared wins the same sittings the rotation won
  — it does not add wins on this band, because there were no
  unwon sittings to add. What it proves is that the feared
  door itself is walkable and winnable, five times over,
  where the baseline walked it zero times.
- Not "any door wins": witness was offered on 4/5 sits and
  never walked; the dark branches were never exercised (no
  dark feared walk, so the curdle-into-downgrade path is
  still unmeasured); trial-by-combat was never opted into.
- Not "bots should walk feared": the policy is a measurement
  instrument standing in for the player (Steve-call).
  Whether any bot should sit or walk in real play is still
  the player's call.

## Proof and commits

- Re-judge proof `scripts/test-feareddoor-rejudge-b-20261107.js`:
  31/31 green BEFORE the evidence file was written (17
  revised-bar fixtures pinning the primary floor, the
  margin boundaries, the guard, substrate sanity, and each
  cost-bar component at its boundary; 14 frozen-corpus legs
  asserting the analyzer reproduces the frozen numbers and
  judges GO under the revised bars).
- Re-judge analyzer
  `scripts/feareddoor-rejudge-b-analyze-20261107.js`: reuses
  the frozen analyzer's per-seed analysis by require; the
  frozen analyzer is NOT edited.
- Prereg committed 16d6acac5 before any re-judgment. The
  safe-commit index clobber hit that commit (file shown
  staged-as-deleted though byte-identical to HEAD); repaired
  with HEAD-blob cacheinfo, verified `git status` empty +
  `git diff HEAD` empty + hash-object matches. The commit
  itself was correct; only the index lied.
- Frozen commits, unchanged: prereg a696d0178, tooling
  808515cb5, prefix-shape fix b8bbf538e, corpus+evidence
  6e8b3e8f0. This run adds: prereg 16d6acac5 + (this commit)
  the re-judge analyzer, proof, and evidence.
- check.js --quick NOT run: zero src/js in this arm.

## Convergence

**scale-onramp: converging, NOT converged.** The chain now
runs end to end through a WON FEARED seat, re-judged GO: 5/12
lesser seats sat, 5/5 feared walked, 5/5 feared won — the
feared door is walkable and winnable, and no village was
harmed by the change (guard 12/12, cost bar clean, panel
delta 0). What remains is the national Binding (0/12), the
full seat (0/12), and the un-walked doors (witness, dark
branches, trial).

## Landing path

GO under the revised metric. The branch is ready for the
coordinator to rebase onto then-current master (explicit SHA
read immediately before rebasing), re-run the proof on the
rebased tip, and merge --ff-only. The ship loop owns all
pushes. This worker does NOT merge, push, bump, or verify
live.

## Rebase (after the verdict — this run)

Rebased onto then-current master, explicit SHA
c88df9d255d93626011cbc81e16fffed0c346535 (read in the main
tree immediately before rebasing, after `git fetch origin
master` showed no movement; master tip: journey-establishment
r111). All 6 picks applied clean, NO stop-at-pick quirk;
the 3 doorwalk picks were skipped as previously applied
(already on master via the doorwalk-confirm landing
dbfcca9b3). New tip 1da54879d (before this addendum's
commit). Own-files diff old tip cb07be357 → new tip: EMPTY
— the corpus, preregs, evidence, and tooling are
byte-identical across the rebase; the branch contribution
vs master is exactly this arm's 39 files, 536,492
insertions, 0 deletions. Re-judge proof re-run on the
rebased tip: 31/31 green. Re-judge analyzer re-run on the
rebased tip: GO (feared wins 5 vs 0, guard 12/12).
Frozen proof re-run on the rebased tip:
`scripts/test-feareddoor-b-20261107.js` 33/33 non-smoke
checks green, exit 0 — the live smoke leg was SKIPPED
(`FEAR_SMOKE_SEED` unset), so it neither passed nor
failed here. The KNOWN smoke-leg failure stands as
documented in the frozen evidence and the 1730Z round:
with the smoke seed set to 53003 it fails `seatTaken` 0
vs 1 on the collapsed frozen band 53001–53008. It was NOT
re-pinned and NOT re-run to fix, per the brief.
**Anchor note:** the per-seed `anchorCommit` values
(808515cb5 baseline, b8bbf538e armed) now refer to the
superseded pre-rebase picks; the corpus content is verified
identical across the rebase (own-files diff empty above),
so the anchors name the pre-rebase commits of identical
content. **Measurement-proof note:** this branch modifies
no existing file — no `src/js`, no `scripts/sweep-compare.js`
(no registry entry, unlike the doorwalk-confirm landing),
no collector/contract input — so no measurement-proof
refresh is owed by this branch; the balance-proof manifest
hashes nothing this branch changes. The coordinator can
verify that at merge time.

## Landing addendum (coordinator, 2026-11-07T19:1xZ)

Master moved under the run after the worker's rebase: Loop A landed
sim-prodstore-a (2f6d98e82..820b61496 — PLENTY-WEEK lever PILOT NO-GO,
reverted, game.js byte-identical to master). Zero file overlap with
this arm's 39 files. Coordinator rebase onto explicit master
820b61496ff1b5f2f402ac5b04bc43b0c4f6617d: all 7 picks clean, no
stop-at-pick quirk, new tip 49d4f967d. Proof re-run on the rebased
tip: rejudge proof 31/31 (exit 0), frozen proof 33/33 non-smoke
(smoke skipped, FEAR_SMOKE_SEED unset — known 53003 smoke failure
stands as documented, not re-pinned, no sims re-run). Branch
contribution vs master unchanged: exactly 39 files, 536,531
insertions, 0 deletions. Merged --ff-only; merged locally, pending
ship.
