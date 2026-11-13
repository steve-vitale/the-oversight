# sim-masterregress-a — master-regression diagnostic bisect

Run fleshout-20261113T1115Z, Loop A, axis scale-onramp. Arm `sim-masterregress-a`,
branch `sim-masterregress-a`, worktree `~/workspace/worktrees/sim-masterregress-a`.
Prereg: `evidence/2026-11-13/sim-masterregress-a-prereg.md` (committed before any
judged sim). Driver `scripts/masterregress-driver-20261113.js`, analyzer
`scripts/masterregress-analyze-20261113.js`, proof `scripts/test-masterregress-a.js`
(130/130 green, re-run after the driver fix below).

## §0 Method — the split reproduced at the boundary, not re-cut

The question: on the matched band (seeds 190391–190398, 150d death-aware,
competent verbatim, mode `fix` only with the roster-check fix swapped in), the
far end `203a32775` gives 4/8 survived and current master `f7352f946` gives 1/8
(median 139d). What commit(s) between them dropped survival 4/8 → 1/8? Range
603 commits.

The naive range-midpoint cut was NOT run. Settled evidence already localized
the drop to one commit — the merge `e4dbe581b` (first-parent ordinal 1 after
the far end; first parent IS `203a32775`, second parent `a628aeaf3`):
firstparent-a 4/8, merge-a 1/8 (both fix swapped in, same band/horizon/driver
family), reconciled-a (`743e07d87`, FP-ordinal 4) 1/8 with a corpus
daily-identical to anchor-a, and every measured base after the merge reads 1/8.
A cut at all-commit ordinal 302 (`0fdf5dcdf`, a side-branch commit whose
ancestry lacks r131 `5d16916f4`) or first-parent ordinal 117 (`b96d34361`) lies
in settled-collapsed territory and could only re-confirm 1/8. This arm
reproduces the split at the boundary with ONE driver, four legs:

| Leg | Base | Standing | Policy | Expect |
|---|---|---|---|---|
| `far` | `203a32775` | fix swapped in (`f8fda429…`) | far-end own `a7ff5c51…` | 4/8 |
| `near` | `f7352f946` | native (`f9359976…`, no swap) | near own `74a890f0…` | 1/8 |
| `merge` | `e4dbe581b` | fix swapped in (`f8fda429…`) | merge own `26a87e49…` | 1/8 |
| `mergeps` | `e4dbe581b` | fix swapped in (`f8fda429…`) | FAR-END policy `a7ff5c51…` swapped in | ≤2/8 |

GO: `far` == 4/8 AND `merge` ≤ 2/8 → **CULPRIT_MERGE**. `near` ≥ 3/8 would have
been ENDPOINT PHANTOM (stop, do not bisect a phantom). `mergeps` ≤ 2/8 →
POLICY_EXONERATED_AT_MERGE; ≥ 3/8 → POLICY_IMPLICATED_AT_MERGE (GO verdict
stands, attribution changes). Rank read judged (≥5/8 regional REGIONAL_INTACT;
≤2/8 RANK_STALL; else RANK_INCONCLUSIVE).

## §1 Verdict — CULPRIT_MERGE, POLICY_EXONERATED_AT_MERGE

**The 4/8 → 1/8 survival drop lives inside the merge `e4dbe581b`
("Merge origin/master into local master (divergence reconciliation,
Steve-approved 2026-11-10)").** The far end reproduces 4/8, the merge
reproduces 1/8, the near end reproduces 1/8, and putting the far-end policy
on the merge base does not rescue it (1/8).

| Leg | Verdict | Survived | Median | Regional | Wave-5 | Deaths |
|---|---|---|---|---|---|---|
| far | FAR_4_8 | **4/8** | 150d | 7/8 REGIONAL_INTACT | 2/8 | 629 |
| near | NEAR_1_8 | **1/8** | 139d | 8/8 REGIONAL_INTACT | 1/8 | 632 |
| merge | MERGE_COLLAPSED | **1/8** | 126d | 7/8 REGIONAL_INTACT | 2/8 | 621 |
| mergeps | POLICY_EXONERATED_AT_MERGE | **1/8** | 140d | 8/8 REGIONAL_INTACT | 0/8 | 607 |

Run verdict (analyzer): `CULPRIT_MERGE (far 4/8, merge 1/8, near 1/8,
mergeps 1/8)`. Wins 0, national 0, table 0 on all four legs — the scale wall
stands on both sides of the merge; what the merge broke is survival to day
150, not rank (regional holds 7–8/8 everywhere).

## §2 Per-seed table — every seed matches its reference exactly

Days to village loss, or 150d survived (✓). All four legs reproduce their
reference corpus seed-for-seed (see §6).

| Seed | far (203a32775) | near (f7352f946) | merge (e4dbe581b) | mergeps (merge + far policy) |
|---|---|---|---|---|
| 190391 | 86 | 65 | 103 | 69 |
| 190392 | 144 | 143 | 150 ✓ | 150 ✓ |
| 190393 | 150 ✓ | 126 | 115 | 119 |
| 190394 | 43 | 128 | 140 | 140 |
| 190395 | 150 ✓ | 150 ✓ | 76 | 90 |
| 190396 | 87 | 140 | 126 | 126 |
| 190397 | 150 ✓ | 135 | 115 | 143 |
| 190398 | 150 ✓ | 139 | 136 | 145 |
| **Survived** | **4/8** | **1/8** | **1/8** | **1/8** |

Four seeds flip far-survive → merge-die: 190393, 190395, 190397, 190398.
One seed flips the other way: 190392 dies far (d144) and survives merge and
mergeps. The merge does not make every village worse — it re-rolls which
villages bank the late kills, and on this band the re-roll costs three net
survivors.

## §3 What the merge changed — and what it did not

Merge `e4dbe581b` vs far end `203a32775` (src/js): 22 files, +4,782/−373.
Largest: villager-brain +1,061, villager-objectives +613, godverbs +587,
convo-wants +413, conversation +301, titans +427, bond-initiation +380,
person-trust +233, contestEngine +221, villager-agency +212, fieldFights
+113, godpath +110, companion-score +103, game.js +136. This is the
divergence-reconciliation merge (PR #121 second parent `a628aeaf3`): the
origin side's villager-intelligence work (goals, bonds, trust, conversation
wants, fight brains) landing on the far-end base in one commit. The drop is
inside that content — which file or files, this arm does not say (see §8).

What did NOT carry the drop, established by this arm:

- **Policy.** Merge-vs-far `competent.js` differs by a garden-appointment
  reorder ONLY (2 hunks, `workGarden` @1055/1065). The mergeps leg puts the
  far-end policy on the merge base: still 1/8, same sole survivor (190392),
  and 3/8 seeds deep-identical to the merge leg. The far-end policy moves
  early dice (see §6) but does not rescue survival. POLICY_EXONERATED_AT_MERGE.
- **The standing fix.** All three swapped legs carry the identical fix file
  (`f8fda429…` from `5157782a4`); the near leg carries it natively
  (`f9359976…`). The far/merge split reproduces with the fix held constant,
  so the fix is not the variable. The BLOODED block in the fix file is
  report-only here: far/merge bases have live wave5kill callers, so the swap
  introduces no BLOODED delta (blooded counts: far 4, merge 1, near 3,
  mergeps 1).
- **The ladder scholar rule.** Far + merge run the old inline rule (scholar
  NEVER counted); near runs the shared `countLivingVeterans` (scholar
  counts). The far/merge comparison is apples-to-apples on the old rule, so
  the rule change cannot carry the 4/8 → 1/8 drop. (The near leg's 1/8 under
  the new rule matches burnoffsets-b0 deep-identically — §6.)
- **Later policy hunks.** The near policy additionally carries journey-landing
  r127/r128 combat-movement hunks + env-gated RAISER_SEAT/COUNTER_ANSWER —
  all landed AFTER the merge, so they cannot carry a drop that is already
  present at the merge.

## §4 Wall numbers — the scale wall stands on both sides

| | far | near | merge | mergeps |
|---|---|---|---|---|
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 0 |
| Regional | 7/8 | 8/8 | 7/8 | 8/8 |
| Wave-5 reached | 2/8 | 1/8 | 2/8 | 0/8 |
| Wave-4 reached | 8/8 | 8/8 | 8/8 | 8/8 |
| Median days | 150 | 139 | 126 | 140 |
| Deaths | 629 | 632 | 621 | 607 |
| Standing range | 150–325 | 145–370 | 165–395 | 199–199 |

Death causes are combat-dominated on every leg (villager combat 267–279,
combat 116–144, expedition 69–126, the wild 74–102; starvation 1 total
across all 32 seed-runs, far 190398 only). Villages die fighting, not
hungry, on both sides of the merge.

## §5 Village assessment + sense-testing (transcripts read)

In plain words: the merge did not break daily village life. The same
villagers do the same things — on 190393 both sides open with Lauren,
Bessie, Pilar/Tikhon and Aroha meeting monsters at the door and getting
hurt, both sides hear the same AUDIENCE NOTES line on day 25, both sides
announce veteran kills on camera. On the merge side the village still
teaches: Yara teaches everyone about Ground Elder on day 107, a fireside
lesson, a journal line. What changed is which fighters live long enough to
bank the late kills:

- 190393: far banks 4 wave-5 kills and 1 living wave-4 veteran; merge kills
  MORE wave-1/2/3 monsters (32/19/12 vs 31/15/7) but only 1 wave-5 kill, 0
  living veterans — it fights harder early and dies at d115 before the
  payoff.
- 190397: far 3 wave-4 kills, 2 living veterans; merge 1 wave-4 kill, 0
  veterans, never reaches wave 5.
- 190398: far 12 wave-4 kills; merge 2. The far village is a wave-4
  killing machine; the merge village reaches wave 5 but with almost no
  wave-4 bank behind it, and dies d136 — its last transcript line is
  "Bolat didn't come back."
- 190395: far 44 wave-1 kills vs merge 16 — on this seed the merge village
  kills less at every tier and dies d76.

The collapse reads as a fighting-strength / veteran-banking failure inside
the merged intelligence code, not a food, social, or teaching failure. The
villagers still act like people; they just stop surviving the fights that
make veterans.

## §6 Deep-identity — three legs bit-identical to reference corpora

Method (pre-registered, burnoffsets precedent): per-day 4-field signature
(vetsW3, vetsW4, waveKillLog length, roster length) + full daily-snapshot
deep-diff, snapshots paired INDEX-ALIGNED, never day-keyed. Script
`/tmp/masterregress-deepdiff.js` (adapted from
`burnoffsets-deepdiff-20261113.js`; copy kept in goal hidden_files).
Log: `evidence/2026-11-13/masterregress-a-deepdiff.log`.

- **far vs firstparent-a: DEEP-IDENTICAL on all 8 seeds** (85–149 snapshots
  each). This arm's far leg IS the firstparent trajectory, exactly.
- **merge vs merge-a: DEEP-IDENTICAL on all 8 seeds** (73–149 snapshots).
  This arm's merge leg IS the merge-a trajectory, exactly.
- **near vs burnoffsets-b0: DEEP-IDENTICAL on all 8 seeds** (63–149
  snapshots). The near end reproduces the burnoffsets baseline trajectory,
  exactly.
- **mergeps vs own merge: 3/8 deep-identical** (190392, 190394, 190396 —
  including identical death days 140/126). The other 5 diverge on days 4–9:
  the far-end policy moves the earliest kill/gear draws (first differences
  are waveKillLog identity — e.g. 190391 day 5: `ducks_in_a_row` vs
  `nevermore` — and ready4/ready5 armed/tricks counts). The policy moves
  dice; it does not move the collapse.

## §7 Metric review (§14) + telemetry

- Primary metric (pre-registered, §14-bound): matched-band survival count
  /8. A miss would have been NO-GO, never re-scored against a friendlier
  metric mid-run. No re-scoring happened: far 4/8, merge 1/8, near 1/8,
  mergeps 1/8, all as pre-registered.
- Kill taxonomy (§14a): deaths classified per leg in §4; instrument errors
  0 on all 32 seed-runs; all four legs `classifiable: true`.
- **Telemetry check:** attempted and REFUSED by the tool itself — same
  refusal class as vetphantom-b, tributedeliv-b, survivalcontrol-b,
  anchor-a, anchor2-a, merge-a, reconciled-a, and policyswap-a
  ("recorder-corpus input … compared with sweep-compare tables, never
  against a run baseline"). Recorded, not waived. No `--update-baseline`
  was passed: rolling the baseline forward on a 1/8 collapse corpus would
  be wrong.

## §8 What this does NOT settle — next-run work

This arm proves the drop is inside merge `e4dbe581b` and is not the policy.
It does not say which file(s) inside the merge carry it. Two candidate
programs (from merge-a §8, unchanged):

- **H1 — origin content.** The second parent `a628aeaf3` (PR #121) brought
  the intelligence work in. Transplant program: land origin-side pieces
  onto the far-end base one family at a time (villager-brain, objectives,
  trust/bonds, convo-wants, godverbs) and measure which transplant drops
  survival. The origin-side endpoints are both already collapsed
  (merge-base 1/8, origin 2/8), so there is no healthy→collapsed transition
  on the origin side — the transplant must start from the healthy far end.
- **H2 — the 205 local commits.** `203a32775..5157782a4` (205 commits) is
  the local side the merge reconciled; a bisect inside that range is the
  alternative if H1's transplants stay healthy. Note the merge's first
  parent IS the far end, so the local commits are the merge's own ancestry
  only through the second parent's history — the H1/H2 split needs the
  ancestry mapping written before the next arm cuts.

DIAGNOSTIC ONLY — no fix and no revert landed in this arm. A fix is a
follow-up arm.

## §9 Run notes (infrastructure)

- **Driver bug found and fixed mid-run.** The first far-leg launch refused
  immediately: the anchor guard compared the 12-char HEAD
  (`203a327750a2`) against the 9-char leg anchor (`203a32775`) as full
  strings. Fixed to prefix comparison; proof re-run 130/0; committed as
  `928dff8b8`. No judged sim ran on the broken driver.
- **Runtime restart mid-merge-leg.** The merge driver was killed by a
  runtime restart after seed 190391 (d103). The completed file was verified
  intact (valid JSON, correct shas, 101 snapshots) and the remaining 7 seeds
  ran with the same RUN/leg, appending to the same driver log. All 8 merge
  seeds match merge-a exactly, so the resume introduced no artifact.
- Heartbeats: 12:16:48Z (12 min — registry-lock contention), 13:07:17Z
  (fast). Write flap: ALL-OK at run start; no flap episode during the run.
- Corpora: `evidence/2026-11-13/perseed-masterregress-a-{far,near,merge,mergeps}/`
  (8 JSONs each), driver logs, per-leg summaries, run summary
  (`masterregress-a-run-summary.json`), deep-diff log
  (`masterregress-a-deepdiff.log`).
- Tooling commits: `a63b928c3` (prereg + driver + analyzer + proof),
  `928dff8b8` (driver anchor-guard fix). Safe-commit index clobber struck
  on the fix commit (MM on the driver file); repaired with the exact-file
  `git ls-tree -r HEAD` pipe; `git status` empty + `git diff HEAD` empty
  after repair. Zero `src/js` changes committed anywhere in this arm.
- House-rule check (`node scripts/check.js --quick`): run after the evidence
  was written — **331 passed, 9 failed in 1593s** (2026-11-13 ~14:07Z). The
  identical 331/9 count burnoffsets-a recorded at ~10:13Z the same day on the
  same base family; the tail shows 120s-cap timeouts on the slowest tests
  (`test-trust-observer-neutrality`, `test-living-garden-deed-attainment`,
  `test-one-person-army-deed-attainment`). Load artifact, same class as the
  CACHE-FLAGS lesson — this arm changed zero `src/js`, so none of the 9 can
  be mine. The full failure list was not captured (output piped through
  `tail -5`); the count match to the morning's run is the check.
