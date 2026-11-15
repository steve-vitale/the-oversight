# sim-ove48-drawparity-a — OVE-48 RNG-DRAW-PARITY PROBE (Loop A, fleshout-20261115T0547Z)

Run: fleshout-20261115T0547Z (Loop A), axis scale-onramp, H1 transplant
program. Arm sim-ove48-drawparity-a, branch `sim-ove48-drawparity-a`,
worktree `~/workspace/worktrees/sim-ove48-drawparity-a`. Prereg:
evidence/2026-11-14/sim-ove48-drawparity-prereg.md (committed BEFORE
any judged sim, commit 7ebf3777c; stage-1 proof 22/22).

## Verdict: PARITY-OK

The OVE-48 subject does NOT consume RNG draws in any systematic,
consistent way. Median per-seed total-draw delta (subject − base)
is +16,254.5 and the total delta across 8 seeds is +187,831 — but
the per-seed sign is MIXED (positive 5/8, negative 3/8), so the
pre-registered PARITY-FAIL bars (median > 0 AND total ≥ +40 AND
positive on ≥ 7/8) are not met, and the PARITY-OK bar (sign mixed)
is. The RNG-draw-drift candidate carrier is effectively dead as a
systematic effect: the subject draws more on some seeds and fewer
on others, by hundreds of thousands in both directions, because
chaotic downstream divergence — not because the OVE-48 pick draws
more.

In plain words: the conversation pick changes which random numbers
get used downstream (the streams part within the first ten days on
every seed), but it does not make the village use MORE of them in
any consistent direction. On three of the eight villages the OVE-48
version actually uses FEWER random numbers than the version without
it. A carrier that points both ways cannot carry a one-way
survival collapse.

## Lever played

None — DIAG. Instrument/driver/analyzer/step/proof scripts only;
ZERO src/js changes (verified in stage 2: `git diff-tree
<merge-base> HEAD -- src/js/` empty). The OVE-48 pick itself
(c937de65f / 493d7a975) is the subject under measurement, not this
arm's change.

## Method (per prereg — band, horizon, policy, legs)

- Seeds: deliberate reuse of band 190457–190464 (8 seeds). Horizon
  150d death-aware. Roster-check standing fix swapped in for every
  step (sha f8fda4295a99, from 5157782a4; native restored
  byte-identical afterwards, sha-verified 75762cb2… on both legs).
  Own-policy per step.
- L-BASE: far end 203a32775, STEP t-ove48-drawparity-base,
  competent verbatim (COMPETENT_TALK NOT set — the walk-out policy
  band 3 ran).
- L-SUBJ: subject branch `transplant-15a-narrowed-subject` at
  493d7a975, STEP t-ove48-drawparity-subj, competent verbatim.
  Subject verified at run start (1 commit on the far end; diff
  exactly 3 files +320/-3). Read-only; never committed onto, never
  rebuilt.
- Determinism re-runs: seeds 190457 + 190464 on EACH leg, STEPs
  t-ove48-drawparity-base-r2 / -subj-r2, separate processes.
- Instrument: a pure pass-through Math.random counter (wraps the
  seeded function, counts calls, returns values unchanged, consumes
  no draws, writes no game state), with context-stack attribution
  into `dawn` / `selectWant` / `talk` / `other` buckets, per-pick
  draw records, and a cumulative-draws-by-day series.

## Judged numbers

| Seed | Base draws | Subj draws | Delta | Days base/subj |
|---|---|---|---|---|
| 190457 | 536,984 | 480,291 | −56,693 | 150 / 134 |
| 190458 | 356,924 | 366,303 | +9,379 | 101 / 108 |
| 190459 | 525,275 | 369,991 | −155,284 | 150 / 109 |
| 190460 | 439,575 | 468,537 | +28,962 | 124 / 129 |
| 190461 | 463,896 | 487,026 | +23,130 | 129 / 135 |
| 190462 | 587,985 | 466,604 | −121,381 | 150 / 123 |
| 190463 | 73,854 | 456,996 | +383,142 | 23 / 138 |
| 190464 | 393,793 | 470,369 | +76,576 | 115 / 142 |
| **Total** | **3,378,286** | **3,566,117** | **+187,831** | **942 / 1,018 days** |

- Median delta: **+16,254.5**. Positive 5/8, negative 3/8, zero 0/8.
- PARITY-FAIL required median > 0 AND total ≥ +40 AND positive on
  ≥ 7/8. The first two hold; the third fails (5/8). PARITY-OK
  applies (sign mixed). **Verdict: PARITY-OK**, judged exactly
  against the pre-registered bars — no re-scoring.

## Where the delta lives (secondary — localization is n/a on PARITY-OK)

| Bucket | Base total | Subj total | Delta | Share of total delta |
|---|---|---|---|---|
| `dawn` (inside convoDawnPriorities) | 0 | 0 | 0 | 0% |
| `selectWant` (inside convoSelectWant) | 5,150 | 5,690 | **+540** | 0.3% |
| `talk` (inside talkTo, outside the pick) | 5,063 | 5,775 | +712 | 0.4% |
| `other` (everything else) | 3,368,073 | 3,554,652 | +186,579 | 99.3% |

(Bucket totals are the per-seed bucket sums; they add to the totals above.)

- The weighted pick draws EXACTLY 10.0 Math.random calls per pick
  on BOTH legs, on EVERY seed (min = max = 10: 9 WANTS keys × 1
  jitter draw + 1 further draw inside pick/canOpen). Weighted
  picks: base 515, subj 569 — the conv corpora's counts, replicated
  exactly. So the pick-loop delta is +54 picks × 10 draws = **+540
  draws, 0.015% of the ~3.5M total** — the entire systematic
  contribution of the OVE-48 mechanism to RNG consumption, and it
  is three orders of magnitude below the chaotic swing.
- The `dawn` bucket is 0 on both legs: the OVE-48 read itself
  consumes no draws, exactly as the prereg's code-read predicted.
- 99.3% of the total delta sits in `other` — fights, foraging,
  sightings, and everything else downstream of the first divergent
  pick. That bucket swings both ways per seed (−155k to +383k),
  which is what chaotic trajectory divergence looks like, not what
  a systematic excess looks like.

## Timing (diagnostic, not part of the PARITY verdict)

| Seed | Draw-divergence day | deathDiv day | Draw precedes death? |
|---|---|---|---|
| 190457 | d5 | d6 | yes |
| 190458 | d9 | d11 | yes |
| 190459 | d9 | d11 | yes |
| 190460 | d5 | d6 | yes |
| 190461 | d6 | d6 | no (same day) |
| 190462 | d10 | d14 | yes |
| 190463 | d2 | d4 | yes |
| 190464 | d4 | d4 | no (same day) |

- Draw divergence precedes deathDiv on **6/8** seeds; on the other
  two it lands ON the deathDiv day, never after it.
- deathDiv reproduced **8/8** against the ove48-mech table — the
  runs are the same trajectories the mechanism arms measured.
- The draw streams part within the first ten days on every seed
  (d2–d10), as the code-read predicted: the first pick whose
  outcome differs re-rolls everything downstream. Timing keeps the
  carrier candidate alive as a timing matter — but the verdict
  turns on the SIGN, and the sign is mixed. A stream that parts
  early and then wanders in both directions is drift, not a
  mechanism.

## The total-draw delta is a lifespan artifact (secondary)

Per-seed total draws are dominated by how long the village lives:
seed 190463's +383,142 is the subj village living 138 days against
the base's 23. Pooled draws per day: base 3,586/day (3,378,286 /
942 days) vs subj 3,503/day (3,566,117 / 1,018 days) — the subject
actually draws FEWER per day (−2.3%). There is no per-day draw
excess anywhere in these numbers. (Reported as context; the judged
metric is per-seed totals, per the prereg.)

## Validity (all pass)

- V1 opens ≥ 200/leg: base 875, subj 935 — the conv corpora's
  counts, replicated exactly.
- V2 replication: per-seed days match the ove48-conv corpora
  EXACTLY on all 16 seed-legs (base 150/101/150/124/129/150/23/115;
  subj 134/108/109/129/135/123/138/142); survived 3/8 base, 0/8
  subj; maxWave matches too (base 0/8 wave-5, subj 4/8); deaths
  match (base 533, subj 635). The counter is a pure observer — the
  runs are bit-identical trajectories to the uninstrumented band-3
  runs.
- V3 dawn reads: 0 base (function absent — control read) / 569
  subj (one per weighted pick).
- V4 0 instrument errors on every seed (20 seed-runs total).
- V5 determinism: r2 re-runs reproduce the judged per-seed TOTAL
  draws EXACTLY on 190457 + 190464 per leg (base-r2 930,777 =
  536,984 + 393,793; subj-r2 950,660 = 480,291 + 470,369) and the
  per-seed days exactly. **PASS.**

## Instrument bug found and corrected (disclosed, not hidden)

The `setupDraws` field (draws during loadGame + setupGame) in the
judged corpora is CONTAMINATED for seeds 2–8 of each driver
process: the counter is process-global and seeds run sequentially
in one process, and the counter was only zeroed at the post-setup
reset — so the recorded setupDraws for seed N include seed N−1's
entire run total. That is why the analyzer's raw `setupMismatch`
flags 7/8 seeds. The judged numbers are UNAFFECTED (the run-phase
reset point is after setupGame, and the RNG stream is untouched —
V2 replication proves it). The true setup draws are recovered
arithmetically from the existing corpora: recorded setupDraws
minus the previous seed's totalDraws (seed 190457, first in each
process, is clean as recorded):

| Seed | Corrected setup draws, base | Corrected setup draws, subj |
|---|---|---|
| 190457 | 7,435 | 7,435 |
| 190458 | 7,664 | 7,664 |
| 190459 | 7,687 | 7,687 |
| 190460 | 7,614 | 7,614 |
| 190461 | 7,217 | 7,217 |
| 190462 | 7,565 | 7,565 |
| 190463 | 7,339 | 7,339 |
| 190464 | 7,536 | 7,536 |

Setup draws are IDENTICAL across legs on 8/8 seeds — world
generation draws the same numbers with or without OVE-48, as
expected (the legs differ only in convo-wants.js). The driver's
bookkeeping is fixed post-judgment (reset the counters before
loadGame; committed with this evidence, stage-1 check added) so
future runs record clean setup draws directly. The analyzer is
left untouched — its output stands as the judged record, and this
section corrects the one secondary field in the open.

## Wall numbers (scale-onramp axis; context, not the verdict)

| | Base (far end) | Subj (OVE-48) |
|---|---|---|
| Survived /8 | 3/8 | 0/8 |
| Median survival | 126.5d | 131.5d |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 reached /8 | 0/8 | 4/8 |
| Wave-4 reached /8 | 7/8 | 8/8 |
| Deaths (all seeds) | 533 | 635 |
| Standing range | 0–199 | 175–470 |
| Scale rank | regional 8 | regional 8 |

The scale wall stands on both legs: national 0, table 0, wins 0.
Death causes are the familiar shape: villager combat 246/266,
combat 99/146, expedition 68/80, the wild 54/74; starvation 7/0.
Villages die fighting, not hungry. (Wave-5 reach differs from the
mech talk legs' 6/8 because those ran COMPETENT_TALK=1 held
conversations on different code — not comparable; the verbatim
band-3 numbers here match the conv corpora exactly.)

## Reachability verdict

Waves 1–5 reachable on the subject leg (4/8 reach wave 5) and
waves 1–4 on the base leg (0/8 reach wave 5 on this band under
verbatim policy). Regional reached on 16/16 seed-legs; national,
the table, and the win flag reached on 0/16. The content past
regional remains decoration in these sims — unchanged by OVE-48
in either direction.

## Village assessment (plain words)

Eight villages, same eight starting points, two versions of the
same world. The only difference is what the scholar's conversation
opens with — dawn's priorities, or whatever the old weights
fancied. That choice changes the words, and the words change the
luck: within ten days the two versions of each village are rolling
different dice on every forage and every fight, and by the second
week their dead are different people. But the luck does not lean
one way. Three villages roll better without the new opener, five
roll better with it, and the size of the swing — a hundred and
fifty thousand dice one way, nearly four hundred thousand the
other — is just how long each village happened to live, not how
many dice it threw per day. The new opener itself costs almost
nothing in luck: fifty-four extra conversation picks across eight
villages, ten dice each, five hundred and forty dice in three and
a half million. The villages still don't reach national, still
don't see the table, still don't win — and nothing in the dice
explains why three of them live and five of them don't. The
survival gap is still unexplained by any mechanism measured so
far; the fresh-band re-test (sibling arm) now carries that
question alone.

## Sense-testing

This probe touches dialogue only through the pick (which want
opens the conversation), and no sitting surfaced that reads wrong
for its want — nothing in the per-pick records required a
transcript read. Two observations from the records: (1) under the
verbatim walk-out policy, opens split only between weighted picks
(515 base / 569 subj) and seed pre-emptors (360 / 366) — zero
repay/pocketed picks on either leg, which fits a policy that never
stays long enough to promise anything, so there is no debt to
collect; (2) the dawn-aligned pick does not change how many
conversations open (875 vs 935 opens is the trajectory effect,
not a policy effect). No robotic, static, or repeated dialogue
beyond the per-want line pool itself, which predates this arm.

## Blanks filled / documented

FILLED:
- The RNG-draw-drift carrier, as a systematic effect: PARITY-OK.
  Total draws measured for the first time on both legs (3.38M vs
  3.57M over 8 seeds); per-pick draws exactly 10.0 on both legs;
  the dawn read draws 0; the pick-loop delta is exactly +540 =
  +54 × 10; the total delta is mixed-sign and lifespan-driven.
- The record correction: "515 vs 569" is weighted-pick OPENS, not
  RNG draws (mech §(c)'s "(RNG draws)" label was wrong) — the
  real draw counts are now measured and reported.
- deathDiv reproduction 8/8 and full band-3 trajectory replication
  (days, opens, maxWave, deaths) — the draw counter is proven a
  pure observer.
- The setupDraws bookkeeping bug (found, disclosed, corrected
  arithmetically, fixed in the driver for future runs).
- The draw instrument itself (pass-through counter + context-stack
  attribution + per-pick records + day series), driver, analyzer,
  step script, and proof test — committed 7ebf3777c (prereg +
  tooling, stage-1 22/22); corpora + evidence in the commits below.

DOCUMENTED (open, for the coordinator / next arm):
- The band-3 survival gap (3/8 → 0/8) remains unexplained by any
  measured mechanism: semantic path PROVEN NEGATIVE (mech-a §(c));
  RNG-draw drift now PARITY-OK as a systematic carrier. What
  remains is the sibling fresh-band re-test (does the gap
  reproduce on fresh seeds?) and, if it does, a hunt for a
  mechanism outside conversation picks entirely.
- The draw-divergence timing (streams part d2–d10, before or on
  deathDiv on 8/8 seeds) means ANY early difference between the
  legs re-rolls the world — a standing caution for every future
  transplant comparison on this band: per-seed survival differences
  of this size can arise from chaotic re-rolls alone, and a
  survival verdict on 8 seeds needs the fresh-band confirmation
  the sibling arm is running.

## Metric review

1. The PARITY bars did their job — but the "total delta ≥ +40"
   leg of PARITY-FAIL was far too weak for the scale of the system
   (totals run to ~3.5M; a +40 threshold is 0.001%). It never
   mattered here because the sign bar (≥7/8) did the work, but a
   future draw-parity prereg should scale the total bar to the
   run size (e.g. ≥1% of the smaller leg's total) or drop it and
   judge on median + sign alone.
2. Per-seed TOTAL draws conflates draws-per-day with days lived
   (the +383k seed is a 115-day lifespan gap). A future probe
   should pre-register draws-per-day as the primary metric, with
   totals as secondary — the per-day read here (−2.3% on the
   subject) is the cleaner null, and it was only computed
   post-hoc.
3. The context-stack attribution was the right resolution: it
   separated the pick (+540, exact) from the chaotic downstream
   (+186,579 in `other`) with no stack-capture cost. Keep it; do
   not pay for per-call stacks on 150d runs.
4. The setupDraws bug is an instrument-design lesson: a
   process-global counter MUST be zeroed at the top of each seed's
   run (before loadGame), not only at the run-phase boundary. The
   driver fix + stage-1 check close it. No metric was re-scored
   mid-run; the setup correction is arithmetic on recorded fields,
   shown in full above.

## Commits (this arm, branch sim-ove48-drawparity-a)

- 7ebf3777c — prereg + drawparity instrument/driver/analyzer/step
  + proof test (stage-1 22/22)
- 2bdca6de3 — judged corpora (base + subj, 8 seeds each) +
  determinism re-runs (2 seeds each leg) + driver logs +
  comparison JSON (PARITY-OK) + this evidence file + driver
  setupDraws fix + proof-test check. Stage-2 proof:
  `node scripts/test-ove48-drawparity.js --stage2` 23/23 (after
  the metric-review case fix below); stage-1 re-run 23/23.
- (this run) — proof-test metric-review case fix + this commit
  list (stage-2 23/23).
- Note: the first safe-commit of this run hit the known
  index-clobber (AGENTS.md 2026-10-22): after commit 7ebf3777c the
  main index showed the 6 committed files staged-as-deleted. The
  commit itself was verified correct (`git show --stat HEAD`, 6
  files); the index was repaired with `git ls-tree -r HEAD --
  <files> | git update-index --add --index-info` and `git diff
  HEAD` verified empty before any step ran.

## Files

- Prereg: evidence/2026-11-14/sim-ove48-drawparity-prereg.md
- Instrument: scripts/ove48-drawparity-instrument-20261114.js
- Driver: scripts/ove48-drawparity-driver-20261114.js
- Analyzer: scripts/ove48-drawparity-analyze-20261114.js
- Step: scripts/ove48-drawparity-step.sh
- Proof test: scripts/test-ove48-drawparity.js
- Base corpus: evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-base/
  + ove48-drawparity-t-ove48-drawparity-base-driver.log
- Subj corpus: evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-subj/
  + ove48-drawparity-t-ove48-drawparity-subj-driver.log
- Determinism re-runs: evidence/2026-11-14/perseed-ove48-drawparity-t-ove48-drawparity-base-r2/
  + -subj-r2/ (+ driver logs)
- Comparison: evidence/2026-11-14/ove48-drawparity-comparison.json
- Band-3 / ove48-conv reference: evidence/2026-11-14/sim-transplant15a-band3.md,
  sim-ove48-conv.md, sim-ove48-mech-a.md, sim-ove48-conv-prereg.md
