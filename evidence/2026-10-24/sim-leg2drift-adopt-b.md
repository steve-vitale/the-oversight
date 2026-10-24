# sim-leg2drift-adopt-b — leg-2 PLENTYDEPRI rot-drift BISECTION, completed (measurement only)

Run: oversight-flesh-out-loop-b-20261024T1630Z (cron), axis food-economy.
Adoption: this arm completes the dead 1330Z B run's leg2drift-adopt-b work.
The dead 1130Z arm's pre-registration (evidence/2026-10-24/sim-leg2drift-b.md
in the sim-leg2drift-b tree) binds this completion verbatim — same seeds,
same cells, same family bands, same DIAG-GO branches. Nothing below
re-scores the question against a friendlier metric.

DIAG arm: ZERO new lever, zero src/js changes. Measurement only.
Backlog: claims #890 (leg-2 bisection) + method #891 (per-seed-median ratio).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder).
No canon doc covers plentydepri's tradeoff — the tradeoff is a measured
property of the landed lever, not a designed value (same note as
sim-pddrift-b). The prime suspect in this window, 75fdd9258 (preserver
widening), IS canon-adjacent: PRESERVATION.md's ladder gates on real
occupation knowledge, and the commit widens SPECIALTIES.preserver from
ghost occupations ('park ranger'/'smoker', matching nothing) to the real
pool — a change that could move preservation throughput and therefore
rot directly. That is a hypothesis, not a finding; the bisection tests
it like the others.

## The question (from sim-pddrift-b, Named next #1)

Leg 1 (depinteraction→bufferdepri, pre-0130Z 2026-10-24) moved the
leadfeast/dg1 reduced-contrast ratio OLD→NEW. Leg 1.5
(bufferdepri→pdtradeoff) is clean of the four named candidates (all
exonerated, sim-pddrift-b DIAG-GO branch (b)). Leg 2 is the SECOND
drift: pdtradeoff-era first-half 0.970x (NEW) → pddrift-master
first-half 0.545x (OLD). Window commits named by the coordinator:
fa10e1ca8 (ledger revert, 06:13Z), 2c2336dd9 (social, 06:39Z),
75fdd9258 (preserver widening, 07:22Z), be55cfc2c (havenGrowth,
07:38Z). In first-parent order they chain: 07a3ede32 → fa10e1ca8 → …
→ 0b151e0e1 → 2c2336dd9 → … → 1f24a4ef0 → 75fdd9258 → be55cfc2c →
… → master. The four tasked pairs are therefore NOT contiguous: gaps
sit between fa10 and 0b15 and between 2c23 and 1f24. A clean
exoneration of all four pairs with a NEW→OLD bracket still holding
localizes the step to those gaps — that is a narrowing result, not a
failure.

TIMELINE NOTE (from the dead arm's header, kept): the pdtradeoff
evidence commit cb507d3c3 is 07:59Z, AFTER be55cfc2c (07:38Z). The
"pdtradeoff-era 0.970x" value is the pddrift driver's measurement on
pdtradeoff-era trees, not a pdtradeoff-sweep value on the 07:59Z
master. Including 1a4c9b696 as a reference anchor tests whether the
OLD reading was already present at the pddrift master, or arrived
with the evidence-only commits after it.

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)

Carried verbatim from the dead arm's header (see sim-leg2drift-b.md):

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in the
  driver), 100d death-aware horizons (dead villages stop; +10d tail
  max), policy leadfeast, DEPOSITGATE=1 explicit on every config
  (dg1 only; dg0 is not drift-sensitive on this question).
- Reduced contrast: seeds 9250–9257 (first 8 of the substrate family
  9250–9265; paired within anchor) x {leadfeast} x {pd0,pd1} = 16
  configs per anchor. No second policy is pre-registered for this
  arm.
- Anchors (11 unique + 1 adopt-run addition): era references
  6722215c6 (depinteraction-era, leg-1 OLD) + 795156dc (bufferdepri-
  era, leg-1 NEW); pairs 07a3ede32→fa10e1ca8, 0b151e0e1→2c2336dd9,
  1f24a4ef0→75fdd9258, 75fdd9258→be55cfc2c; pddrift-master reference
  1a4c9b696; master 9ad6ef81f (worktree HEAD at dead-arm run start);
  adopt-run addition 141126b07 (current master at adoption).
  Extraction via `git archive <sha> | tar -x` into
  <worktree>/bisect-scratch/<sha>/ — NEVER worktrees under /tmp,
  NEVER bare `git worktree add`, NEVER checkout of old commits in
  the worktree. Outputs land in this worktree's corpus dir via env.
  NEVER write sweep outputs to /tmp.
- PRIMARY (binding): aggregate rot/100d = sum(rotFreshKcal +
  rotPreservedKcal) / sum(daysAlive) * 100 per side, PD=1/PD=0
  ratio, on the reduced contrast. Family bands: OLD <= 0.75, NEW
  >= 0.85, 0.75–0.85 = AMBIGUOUS (no forced verdict).
- SECONDARY (pre-registered alongside, backlog #891): per-seed-
  median rot ratio — per seed rot/100d = (rotFresh+rotPreserved) /
  daysAlive * 100, per-side median across the 8 seeds, ratio =
  med(pd1)/med(pd0), same family bands. BOTH ratios are reported
  for every anchor. If they disagree on family at an anchor, the
  line says DISAGREE and that anchor alone forces no verdict; a
  pair whose aggregate and median disagree on the step is NO STEP
  SHOWN (disputed), never an exoneration. The STOP gate below is
  judged on the aggregate (the task's PRIMARY); a median
  disagreement at the master anchor is reported and weakens
  confidence but does not flip the gate.
- DIRECTION ADAPTATION (declared pre-sweep): leg 2 runs the other
  way from leg 1 (NEW 0.970x → OLD 0.545x), so a leg-2 step is
  parent NEW → commit OLD. An OLD→NEW step, if one appears, is
  reported as a reverse-step and does NOT count toward DIAG-GO (a).
- DIAG-GO iff EITHER (a) EXACTLY ONE candidate pair steps NEW→OLD
  with all other pairs no-step (exonerated or no-step-shown, but
  the stepping pair must be the only family-changing pair), OR
  (b) all four candidate pairs are EXONERATED (both ratios in the
  SAME family, or |Δ| < 0.10 with no family change, on the
  aggregate; median not disputing) AND the leg-2 window is
  bracketed (earliest candidate parent 07a3ede32 in NEW family,
  current master in OLD family). The tasked era anchors are
  reported as a sanity reproduction of the leg-1 bracket
  (6722215c6 OLD, 795156dc NEW); if they fail to reproduce, that
  is stated and GO (b) is downgraded to conditional, not silently
  kept.
- DIAG-NO-GO / STOP iff the master anchor (current HEAD) does NOT
  reproduce OLD family on the aggregate reduced contrast — then
  STOP, do not bisect: that is a further drift leg (or
  design-sensitivity), not a failed run, and the evidence +
  instruments commit with the STOP verdict.
- Balanced panel per §15: env-gated + cross-tree by construction →
  the documented #797 "Unmatched flags" invalidity applies a
  fortiori; no misleading panel compare is built. The verdict is
  judged on the analyzer's manual paired rows (§15 fallback, as
  in pddrift/pdtradeoff).

## Corpus completeness (adoption state, verified by the coordinator)

- Per-seed files: 192/192 valid (12 anchors × 16 configs), every
  file parses, carries its anchorCommit tag and seed. No missing,
  no invalid, no re-sweep needed — the dead adopt worker's corpus
  was already complete when its run died (heartbeat 15:41Z stale).
- Sweep summaries: 23/24 valid. The single defect is a 0-byte
  sweep-9ad6ef81-pd0-dg1-leadfeast.json: a placeholder pre-created
  empty during the dead arm's create-block episode (see its
  "Instrument adaptation" section — placeholders were pre-created
  so the driver's existing-target fast path could write through
  the episode) and never filled. Summaries are NOT analyzer inputs
  (the analyzer reads per-seed files only); the file was deleted
  before commit rather than committed empty, and is recorded here
  so no future run mistakes its absence for a missing cell.
- Runner subsets run by the dead adopt worker: gate9, gate141,
  pairs, refs (per leg2drift-adopt-run.sh). The coordinator ran
  no new sims for this arm beyond the proof's two smoke legs.
- Instrument proof: scripts/test-leg2drift-b.js 19/19 PASS on the
  adopt tree pre-rebase (P1 static checks, P2 analyzer
  normalization, P3 current-tree smoke run, P4 old-anchor
  extraction smoke, P5 empty-corpus loud failure, P6 synthetic
  aggregation, P7 scratch cleanup). Post-rebase re-run: see the
  coordinator landing note appended at commit time.

## Results — per-anchor ratios (aggregate PRIMARY / per-seed-median SECONDARY)

Family bands: OLD <= 0.75, NEW >= 0.85, else AMBIGUOUS.
Full table: evidence/2026-10-24/leg2drift-b-analyzer-report.txt.

| anchor | agg ratio | agg family | med ratio | med family | agree? |
|---|---|---|---|---|---|
| 07a3ede32 (pair-1 parent) | 0.970x | NEW | 0.501x | OLD | DISAGREE |
| fa10e1ca8 (pair-1 commit) | 0.970x | NEW | 0.501x | OLD | DISAGREE |
| 0b151e0e1 (pair-2 parent) | 0.970x | NEW | 0.501x | OLD | DISAGREE |
| 2c2336dd9 (pair-2 commit) | 0.881x | NEW | 1.029x | NEW | agree |
| 1f24a4ef0 (pair-3 parent) | 0.881x | NEW | 1.029x | NEW | agree |
| 75fdd9258 (pair-3 commit) | 0.545x | OLD | 0.979x | NEW | DISAGREE |
| be55cfc2c (pair-4 commit) | 0.545x | OLD | 0.979x | NEW | DISAGREE |
| 6722215c6 (era OLD ref) | 0.599x | OLD | 0.364x | OLD | agree |
| 795156dc (era NEW ref) | 1.230x | NEW | 0.403x | OLD | DISAGREE |
| 1a4c9b696 (pddrift-master ref) | 0.545x | OLD | 0.979x | NEW | DISAGREE |
| 9ad6ef81f (master ref) | 0.545x | OLD | 0.979x | NEW | DISAGREE |
| 141126b07 (adopt master ref) | 0.545x | OLD | 0.979x | NEW | DISAGREE |

Candidate pairs — aggregate reading first, then the pre-reg's
median-dispute rule applied:

- ledger revert (07a3ede32 → fa10e1ca8): aggregate NEW → NEW.
  Median OLD → OLD (no step on either metric, but the metrics
  disagree on family at both anchors). No step shown.
- social (0b151e0e1 → 2c2336dd9): aggregate NEW → NEW (0.970 →
  0.881). Median OLD → NEW — a family change on the median in the
  reverse direction. The metrics disagree on the step: disputed,
  not an exoneration.
- preserver widening (1f24a4ef0 → 75fdd9258): aggregate NEW → OLD
  (0.881 → 0.545) — the leg-2 step direction. Median NEW → NEW
  (1.029 → 0.979, Δ 0.05). The metrics disagree on the step:
  NO STEP SHOWN (disputed) per the pre-reg's explicit rule,
  never an exoneration and never a clean step.
- havenGrowth (75fdd9258 → be55cfc2c): aggregate OLD → OLD.
  Median NEW → NEW. No step on either metric; metrics disagree
  on family at both anchors. No step shown.

Era reproduction: the leg-1 bracket reproduces on the aggregate
(6722215c6 OLD 0.599x, 795156dc NEW 1.230x) but NOT on the median
(795156dc median 0.403x OLD). The master anchor reproduces OLD on
the aggregate (9ad6ef81f 0.545x, 141126b07 0.545x), so the STOP
gate does not trigger; the median disagreement at the master
anchor (0.979x NEW) weakens confidence per the pre-reg, but does
not flip the gate.

## VERDICT: DIAG-NO-GO (metric-contested step)

Neither pre-registered GO branch is met:

- Branch (a) fails: the only aggregate step (preserver widening)
  is median-disputed, so it is NO STEP SHOWN (disputed), not the
  exactly-one clean step the branch requires.
- Branch (b) fails: not all four pairs are exonerated with the
  median undisputed (preserver is disputed; social is
  median-disputed in the reverse direction).

What IS established (reported, not celebrated as a GO): on the
aggregate metric — the task's PRIMARY — the OLD rot regime
arrives exactly at the preserver-widening commit 75fdd9258 and
holds through be55cfc2c, 1a4c9b696, 9ad6ef81f and 141126b07, with
all other candidate pairs flat. The preserver widening is the
lead hypothesis for the leg-2 step, and it is canon-plausible
(real-pool preserver occupations moving preservation throughput).
But the pre-registered secondary metric refuses to confirm it:
on per-seed medians the step vanishes (NEW → NEW), and the
aggregate/median disagreement is systematic — 7 of 12 anchors
DISAGREE, including the master anchor and the era-NEW reference.
A GO on the aggregate alone would violate the pre-reg's own
disputed-step rule. The bisection therefore ends here as
DIAG-NO-GO: the step is localized on one metric and contested on
the other, and deciding between the metrics is the next run's
job, not this run's re-score. Note the dead arm's own pre-sims
metric review anticipated exactly this outcome: the aggregate is
dominated by single high-rot seeds (seed 9255 alone was 731k of
the pddrift-master pd0 first-half total), "if leg 2 vanishes
under the median, leg 2 is a single-seed artifact, and the report
says so." This report says so: on the evidence of this corpus,
the leg-2 aggregate step at preserver widening does not survive
the pre-registered median test and must be treated as a
single-seed artifact unless a deciding run proves otherwise.

## Metric review (per §14 — for the NEXT run, not this one)

- The aggregate rot/100d ratio is dominated by high-rot seeds:
  several anchors share byte-identical rot totals across
  different commits (the NEW plateau 170017/164999 and the OLD
  plateau 240166/130924 recur exactly), which means a handful of
  seeds set the aggregate while the typical seed (median) reads
  differently. The aggregate and the median are measuring
  different things here — total rot burden vs typical-seed rot.
- 8 seeds per anchor is thin for the median: with 8 seeds the
  median is noisy, which is the charitable reading of the
  disagreement. The uncharitable reading is that the aggregate is
  the artifact. Neither reading is settled by this corpus.
- PROPOSED REVISION (next run only): pre-register ONE deciding
  metric before re-running — either (i) a skew-robust aggregate
  (trimmed mean or per-seed paired sign test across 16+ seeds),
  or (ii) keep the aggregate as primary but demote the median to
  report-only with the dispute rule removed, stated explicitly.
  Do NOT re-judge this corpus under the revised metric; a fresh
  corpus on the decided metric is required. A deciding run
  should also re-test the preserver step at 16+ seeds, since the
  current 8-seed median cannot separate "no step" from "noisy
  median".
- The analyzer's printed pair verdicts (EXONERATED / STEP) are
  aggregate-only and OVERSTATE the result against the pre-reg:
  the analyzer prints STEP for preserver widening and EXONERATED
  for social, while the pre-reg's median-dispute rule makes both
  disputed. Future analyzer versions should print the
  pre-reg-adjusted verdict (disputed) alongside the aggregate
  verdict, so no reader takes the aggregate label as the verdict.

## Village assessment (what the corpus villages looked like)

192 configs, 100d death-aware horizons, leadfeast policy, pre-seat
regime (SEATDRIVE=0, so table/wins are structurally 0 — said here,
not chased):

- National reach: 162/192 configs (84%). Table 0/192, wins 0/192
  (structural, pre-seat). Max wave 4 in most cells, wave 5 in 0.
  Median survival 100d (capped) on every anchor — villages
  survive the horizon; the rot question is about food loss, not
  village death.
- Deaths (1097 across the corpus): combat 52.1%, monster 13.2%,
  ambush 6.9%, starvation 6.7%, wound 5.5%, sickness 5.5%,
  dehydration 3.8%, contest 2.5%, alien 1.5%. The shape is the
  familiar combat-dominated wall: villages live, but their
  people die fighting. Nothing in this corpus suggests the rot
  drift kills villages outright — it moves how much food rots,
  which is a pressure dial, not a death sentence.
- Sense check (SENSE-TESTING LAW, limited scope): this is a pure
  measurement arm — per-seed files carry aggregates, not
  transcripts, so no villager dialogue was sampled here. The
  numbers cohere across 192 configs (national/table/wave/death
  shares move together sensibly; no anchor shows an impossible
  combination like national-0 with wave-5). A transcript read
  belongs to a content arm, not this bisection.

## Blanks filled / documented

- FILLED (measurement): the leg-2 bisection corpus is complete
  (192/192) and analyzed; the aggregate localization to
  preserver widening is now on record with its exact numbers.
- DOCUMENTED (not chased, per backlog discipline): (a) the
  aggregate/median metric contest above — the next run must
  decide the metric before re-running; (b) the analyzer's
  aggregate-only pair labels overstating verdicts (fix the
  analyzer's verdict print, not this corpus); (c) the 0-byte
  sweep summary flap artifact (deleted, recorded here).

## Findings to append to hidden_files/sim-findings.md (coordinator appends)

- [open] 2026-10-24 — aggregate/median metric contest on rot ratios — leg-2 bisection: aggregate localizes the OLD rot regime to preserver widening 75fdd9258 (0.881→0.545x), per-seed median refuses it (1.029→0.979x NEW→NEW); 7/12 anchors DISAGREE incl. master + era-NEW ref; next run must pre-register one deciding metric (skew-robust aggregate or 16+ seeds) before re-running — do NOT re-judge this corpus (sim-leg2drift-adopt-b).
- [open] 2026-10-24 — analyzer pair labels overstate verdicts — analyze-leg2drift-b.js prints aggregate-only EXONERATED/STEP while the pre-reg's median-dispute rule makes preserver + social disputed; print the pre-reg-adjusted verdict alongside (sim-leg2drift-adopt-b).
