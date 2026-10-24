# sim-pddrift-b — PLENTYDEPRI=1 rot-effect drift BISECTION (measurement only)

Run: oversight-flesh-out-loop-b-20261024T0812Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pddrift-b.
DIAG arm: ZERO new lever, zero src/js changes. Measurement only.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder — the
plenty-depri throttle sits on the production side of the ladder, easing
hauling when the pantry reads plentiful so the glut doesn't rot). **No
canon doc covers plentydepri's tradeoff** — the tradeoff (small
survival/national cost for large rot reduction) is a measured property of
the landed lever, not a designed value (pdtradeoff evidence, same note).
Documented here, not invented.

## The question (claims backlog #869, from loop B arm sim-pdtradeoff-b DIAG-GO)

The PD=1/PD=0 rot/100d ratio on leadfeast/dg1 drifted from 0.558x
(depinteraction substrate, 2026-10-23) to ~0.91–1.03x (bufferdepri
replication 1.033x / pdtradeoff re-measurement 0.913x on current master).
The PD=2 layer is EXONERATED (single-seed A/B layer-vs-no-layer,
ms-normalized, IDENTICAL). Named drift candidates (pdtradeoff metric
review): 85e42a22a (r39 _sdNextAct dedup), 7d6f735c9 (r30
convoThreadAbout), d581d6cf2 (r42 conversation fizzle/grief/winddown
fixes), db7c5f211 (bloodrestraint, default-off). Exact cause needs
per-commit bisection — that is this arm.

TIMELINE NOTE (found while designing, before sweeping — it shapes how the
verdict must be read): the bufferdepri run was 2026-10-24T0130Z and its
sanity replication ALREADY measured 1.033x. Three of the four named
candidates (7d6f735c9 04:04Z, db7c5f211 04:16Z, 85e42a22a 04:34Z) and the
fourth (d581d6cf2 02:54Z) all postdate that replication. The named
candidates therefore sit in the bufferdepri→pdtradeoff window (1.033x →
0.913x), NOT the depinteraction→bufferdepri window (0.558x → 1.033x)
where the large drift happened. This arm bisects the named candidates as
tasked AND brackets the true window with two era anchors (depinteraction-
era 6722215c6, 2026-10-23 11:18Z; bufferdepri-era 795156dc, 2026-10-24
01:26Z). If no named candidate steps, the verdict is exoneration of all
four + a narrowed pre-0130Z window — not a failed run.

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in the driver),
  100d death-aware horizons (dead villages stop; +10d tail max — the food-
  economy question answers in the first 100 days), policy leadfeast,
  DEPOSITGATE=1 explicit on every config (dg1 only; dg0 is not drift-
  sensitive on this question).
- Reduced contrast: seeds 9250–9257 (first 8 of the substrate family
  9250–9265; paired within anchor, so the subset is the control) x
  {leadfeast} x {pd0,pd1} = 16 configs per anchor.
- Anchors (12): depinteraction-era 6722215c6; bufferdepri-era 795156dc;
  d581d6cf2 parent c76a5248 + d581d6cf2; 7d6f735c9 parent ac8cbe37 +
  7d6f735c9; db7c5f211 parent f8097b37 + db7c5f211; 85e42a22a parent
  efc180aa + 85e42a22a; current master 1a4c9b696 (local master tip; the
  worktree HEAD equals it). Extraction via `git archive <sha> | tar -x`
  into <worktree>/bisect-scratch/<sha>/ — NEVER worktrees under /tmp,
  NEVER bare `git worktree add`, NEVER checkout of old commits in the
  worktree. The driver file is copied into each scratch tree's scripts/
  and run there; its outputs land in this worktree's corpus dir via env.
- PRIMARY (binding): rot/100d = sum(rotFreshKcal + rotPreservedKcal) /
  sum(daysAlive) * 100 per side, PD=1/PD=0 ratio, on the reduced contrast.
  Family bands (pre-registered): OLD family ratio <= 0.75 (the 0.558x
  family); NEW family ratio >= 0.85 (the 0.91–1.03x family); 0.75–0.85 =
  AMBIGUOUS gap (no forced verdict; report + belongfeast check if it is
  the master anchor).
- DIAG-GO iff EITHER (a) ONE candidate pair steps OLD→NEW (parent in OLD
  family, commit in NEW family, all other candidate pairs showing no
  step), OR (b) NO candidate steps AND every candidate is exonerated
  with its before/after pair AND the era endpoints bracket the window
  (depinteraction-era in OLD family, bufferdepri-era in NEW family),
  narrowing the drift to pre-0130Z. DIAG-NO-GO iff the reduced contrast
  at the master anchor does NOT reproduce the drift (master ratio in OLD
  family) — then the drift is design-sensitive, not commit-driven.
- CONDITIONAL second policy: belongfeast/dg1 is added ONLY if the
  leadfeast contrast at the master anchor is flat (ratio 0.90–1.10, no
  PD effect to discriminate) or lands in the AMBIGUOUS gap — then
  belongfeast/dg1 runs at master + both era endpoints only, to check
  whether the drift reproduces there.
- Instruments: scripts/sweep-pddrift-b.js (reduced driver, derived from
  scripts/sweep-pdtradeoff-b.js with the declared deltas below),
  scripts/analyze-pddrift-b.js (ms- AND medianSurvival-normalized;
  backlog #870 gap closed — the pdtradeoff analyzer normalized
  medianSurvival but NOT wall-clock diag.ms), scripts/test-pddrift-b.js
  (proof: derivation, FATAL asserts, anchorCommit tagging, analyzer
  normalization, extraction smoke, schema).
- Balanced panel per §15: env-gated + cross-tree by construction → the
  documented #797 "Unmatched flags" invalidity applies a fortiori; no
  misleading panel compare is built. The verdict is judged on the
  analyzer's manual paired rows (§15 fallback, as in pdtradeoff).
- WATCH (report-only): wall numbers per anchor (national/table/wins,
  wave reach, median survival), death-cause shares.

## Metric review (pre-sims)

- This is a DIAG, not a lever: there is no lever GO/NO-GO bar. The binding
  element is the measurement operationalization (reduced contrast,
  identical seeds within anchor, explicit DG=1, anchorCommit tagging) —
  a deviation from the pre-registered instrument would be a NO-GO on the
  run, not on any lever.
- 8 seeds (not 16) per anchor is the tasked reduced design: the question
  is a step location, not a precise ratio estimate; 8-seed ratios carry
  wider noise, which is why the verdict uses family bands with an
  AMBIGUOUS gap instead of point comparisons. A candidate pair landing
  both sides in the gap is "no step shown", not an exoneration by
  assertion — exoneration requires the pair's ratios to sit in the SAME
  family (both OLD or both NEW) or move by < 0.10 with no family change.
- Cross-anchor comparisons are NOT strict ancestry except within each
  parent→commit pair (branches merged between eras); era endpoints
  bracket the window in time, they do not prove a single linear chain.
- The driver runs the anchor tree's OWN sim-harness + policies (API
  verified present at every anchor before sweeping: loadGame/setupGame/
  runDays, leadfeast/belongfeast). The mode string is held constant
  ('pddrift-b-<policy>') across anchors — the pdtradeoff evidence ruled
  mode-string effects out (loadGame seeds RNG from seed only).

## Results

(Filled 2026-10-24 by the adopted-arm finish run. Corpus now complete:
11 anchors x 16 configs = 176 per-seed JSONs, all parse, all
leadfeast/dg1, all tagged with their anchorCommit. CORRECTION to the
header: it says "12 anchors" but enumerates 11 (2 era + 4 pairs + master);
the corpus is complete against the enumeration — there is no 12th anchor
in the design. Full analyzer output:
evidence/2026-10-24/pddrift-b-analyzer-output.txt.)

### Per-anchor ratios (reduced contrast, leadfeast/dg1, seeds 9250–9257)

| anchor | role | pd0 rot/100d | pd1 rot/100d | ratio | family |
|---|---|---|---|---|---|
| 6722215c6 | depinteraction-era | 151,302 | 90,584 | 0.599x | OLD |
| 795156dc | bufferdepri-era | 116,215 | 142,969 | 1.230x | NEW |
| c76a5248 | d581 parent | 187,143 | 179,013 | 0.957x | NEW |
| d581d6cf2 | r42 convo fizzle/grief/winddown | 170,017 | 164,999 | 0.970x | NEW |
| ac8cbe37 | r30 parent | 170,017 | 164,999 | 0.970x | NEW |
| 7d6f735c9 | r30 convoThreadAbout | 170,017 | 164,999 | 0.970x | NEW |
| f8097b37 | bloodrestraint parent | 170,017 | 164,999 | 0.970x | NEW |
| db7c5f211 | bloodrestraint (default-off) | 170,017 | 164,999 | 0.970x | NEW |
| efc180aa | r39 parent | 170,017 | 164,999 | 0.970x | NEW |
| 85e42a22a | r39 _sdNextAct dedup | 170,017 | 164,999 | 0.970x | NEW |
| 1a4c9b696 | current master | 240,166 | 130,924 | 0.545x | OLD |

Completing the missing pieces changed one number: 7d6f735c9 was 0.892x
on 7/8 pd1 seeds and is 0.970x on the full 8/8 — the missing seed 9257
was the entire discrepancy. The 0.970x value is byte-identical across
seven anchors (both sides of r30, bloodrestraint, r39, plus d581): those
commits do not touch the simulated path at all (conversation-only,
default-off, dedup of an unexercised branch), so exoneration here is by
identical behavior, the strongest form — not by "close enough" ratios.

### Candidate pairs — all EXONERATED, no step anywhere

- r42 (c76a5248 0.957x NEW → d581d6cf2 0.970x NEW, Δ +0.013): EXONERATED.
- r30 (ac8cbe37 0.970x NEW → 7d6f735c9 0.970x NEW, Δ 0.000): EXONERATED.
- bloodrestraint (f8097b37 0.970x NEW → db7c5f211 0.970x NEW, Δ 0.000):
  EXONERATED.
- r39 (efc180aa 0.970x NEW → 85e42a22a 0.970x NEW, Δ 0.000): EXONERATED.

### Era bracket — the window is pre-0130Z, as tasked

depinteraction-era 0.599x (OLD) → bufferdepri-era 1.230x (NEW). The
bracket holds on the reduced contrast with wide margins on both sides
of the AMBIGUOUS gap, so the 8-seed noise caveat does not threaten it.

## Verdict

**DIAG-GO, branch (b):** no candidate steps, all four candidates
exonerated with before/after pairs, and the era endpoints bracket the
window (depinteraction-era OLD, bufferdepri-era NEW). The drift the four
named candidates were suspected of is narrowed to pre-0130Z — leg 1,
which predates all four of them. The candidates sit in leg 1.5
(bufferdepri→pdtradeoff, first-half 1.230x → 0.970x) and are exonerated
there too: every leg-1.5 anchor reads NEW, with no step at any pair.

Read with the leg reframing (mid-run findings, honored not re-scored):
the original single-drift framing is retired. The master anchor reads
OLD (0.545x) while every pdtradeoff-era anchor reads NEW — that is leg 2,
a SECOND drift after the pdtradeoff measurement, and it is NOT covered
by this DIAG's GO. What this GO certifies: (1) none of the four named
candidates caused any leg of the drift; (2) leg 1 lives before 0130Z on
2026-10-24; (3) the leg-1.5 window is clean of candidate effects.
What it does not certify: the current-master 0.545x, which needs its
own bisection (see Named nexts).

Literal-header note, stated not hidden: the header's DIAG-NO-GO branch
(master in OLD family = "design-sensitive") would have fired on the
master reading alone. The mid-run instrument-isolation check refuted
that reading (pdtradeoff driver reproduces this driver's rows 4/4
exactly), so the NO-GO branch does not apply — the master OLD reading
is real current-master behavior, i.e. leg 2, not an instrument artifact.
This is the method change already declared in the mid-run findings.

## WATCH — wall numbers per anchor (report-only, not judged)

176 configs total (11 anchors x 16). National 134/176 (76%);
table 0/176; wins 0/176; wave-5 reach 0/176; wave 4 reached in most
anchors (per-anchor maxWave: wave 4 in 3–6 of 8 configs per side).
Median daysAlive 100 at every anchor (censored at the 100d horizon;
per-anchor minima 25–34d — a minority of villages die early, the rest
survive to horizon). Per anchor (both sides): depinteraction-era
national 9/16, bufferdepri-era 9/16, d581-parent 10/16, all other
candidate-era anchors 13/16, master 15/16. The scale wall stands:
national is common, the table and the win are not reached anywhere in
this 100d leadfeast window — consistent with the standing wall report,
not a new finding.

Death-cause shares (1,076 deaths across all configs): combat 46.1%,
monster 13.0%, starvation 8.6%, sickness 7.8%, ambush 6.1%, "a wound that
wouldn't close" 5.9%, dehydration 5.4%, contest 2.9%, alien 1.4%, plus a
long named tail (big-eyes, sweeps week, choir toad, highbeam deer, the
suburb, the reunion, rut king, the mountain lord, the night, grief
counselor, the focus group — each ≤ 0.7%). No single cause dominates
outside combat; starvation/sickness/dehydration together are ~22%,
which is the food-economy pressure showing up as deaths, not as rot.

## Sense check (SENSE-TESTING LAW — with its limit stated)

This corpus carries no dialogue or transcripts by design (per-seed
JSONs hold counters, wall flags, and death causes only), so no
conversation can be sense-read from it — that limit is recorded, not
papered over. What can be judged from the data available: death causes
are human-legible (named wounds, named monsters, contests, grief — not
codes or counts alone); villages behave differentially across anchors
(national 9/16 → 15/16) rather than identically; nothing in the corpus
reads robotic or repeated beyond the expected determinism of identical
seeds (the byte-identical 0.970x anchors are the same code path, not
copy-paste behavior). No villager-behavior blank is asserted from this
DIAG; the sense verdict is: no artifact visible, transcript-level
sense testing not possible from this instrument.

## Metric review (post-sims)

- Anchor-count slip: header says 12, enumeration is 11. Corpus complete
  against the enumeration. Future headers should count the enumerated
  list, not the headline number.
- The reduced contrast does not reproduce the 16-seed pdtradeoff
  headline (master 0.545x vs 0.913x) — expected under the documented
  seed-half heterogeneity (first-half 0.970x → master first-half
  0.545x is itself leg 2). The 8-seed reduced contrast is a step
  locator, not a ratio estimator; do not quote its ratios as headlines.
- Aggregate rot/100d is dominated by single high-rot seeds (seed 9255
  alone is 731k of the master pd0 first-half total). A future drift
  DIAG should pre-register a per-seed-median or trimmed ratio
  alongside the aggregate, so one seed cannot move a family.
- Conditional belongfeast correctly NOT triggered (master OLD, neither
  flat nor AMBIGUOUS) — no second-policy spend, per the header.
- Balanced panel per §15: still no panel compare (documented #797
  invalidity, env-gated + cross-tree) — manual paired rows above judge,
  as in pdtradeoff. Nothing in this finish run changes that standing.
- EPERM flap hits during this finish run: r30redo flap gate needed 15
  tries (~7 min); one probe moment showed writes EPERM 2/3 with
  git cat-file OK, and one git cat-file 128. The perfile fill/gate
  design absorbed all of it; no data loss, no forced writes.
- Concurrency note: a second sweep (plain anchor script, label r30,
  same anchor/side) ran concurrently in this tree mid-run, started by
  the coordinator, not by this worker. Harmless in outcome: per-seed
  writes are per-pid tmp + atomic rename and the configs are
  deterministic, so both writers produced identical bytes; the
  coordinator's scratch dir (bisect-scratch/r30) was left behind and
  was then removed by this run's proof cleanup (the proof script
  deletes bisect-scratch/ by design — see below). Flagged, not hidden.
- Proof run note: the first re-run of scripts/test-pddrift-b.js in this
  finish run was started as an explicitly-backgrounded exec and was
  reaped mid-run (P1–P2 only, no failure recorded). Re-ran in the
  normal tracked pattern: **18 PASS, 0 FAIL, exit 0** (P1a–e, P2a–b,
  P3a–d, P4a–c, P5, P6a–b, P7). The P7 cleanup deletes
  bisect-scratch/ and the proof dir by design — after this run the
  worktree contains no scratch, which is the required end state.

## Named nexts (for the coordinator; NOT appended to the backlog by this worker)

1. Leg-2 bisection DIAG (same instrument, new window): pdtradeoff-era
   → current master, first-half 0.970x → 0.545x. Window commits:
   fa10e1ca8 (ledger revert, 06:13Z), 2c2336dd9 (social, 06:39Z),
   75fdd9258 (preserver widening, 07:22Z), be55cfc2c (havenGrowth,
   07:38Z). HYPOTHESIS (not a finding): 75fdd9258 is the most
   rot-adjacent — preserver mapping changes preservation throughput,
   which feeds rot directly; test it first, but bisect all four.
2. Ratio-robustness follow-up: re-measure the leg-1 window with a
   per-seed-median rot ratio pre-registered alongside the aggregate,
   to check whether leg 1 survives de-domination by seed 9255.
3. Scale-wall watch (no new action): table/win/wave-5 all zero across
   176 configs — the wall numbers go in the run report as usual.

## Mid-run findings (before candidate sweeps — read before the verdict)

- MASTER ANCHOR (reduced contrast, leadfeast/dg1, seeds 9250–9257):
  pd0 rot/100d 240,166; pd1 rot/100d 130,924; ratio **0.545x (OLD family)**.
  The reduced contrast does NOT reproduce the pdtradeoff 16-seed 0.913x
  on these seeds. Per the task's STOP branch this alone would read as
  "design-sensitive" — the two checks below REFUTE that reading, so the
  run continues with the bisection (method change stated here, per the
  task's "do not improvise without saying why").
- INSTRUMENT ISOLATION (decisive): the pdtradeoff driver itself, run on
  current master for seeds 9250/9255 x pd0/pd1, reproduces this run's
  driver rows EXACTLY (4/4 configs, all 14 compared fields identical).
  Mode string, channel-strip deltas, and driver derivation are all
  exonerated. The master-anchor 0.545x is real current-master behavior.
- CORPUS SPLITS (existing corpora, no new sims — leadfeast/dg1):
  first-half (9250–9257) / second-half (9258–9265) / all:
  depinteraction 0.599x / 0.381x / 0.558x; bufferdepri 1.230x / 0.518x /
  1.033x; pdtradeoff 0.970x / 0.613x / 0.913x; pddrift master 0.545x /
  (pending) / (pending). First-half trajectory: 0.599 → 1.230 → 0.970 →
  0.545 — the ratio moves on EVERY run, and the 16-seed headline masks
  violent seed-half heterogeneity (single high-rot seeds dominate the
  aggregate: seed 9255 alone is 731k of the master pd0 first-half total).
  Two distinct drift legs exist: leg 1 (depinteraction→bufferdepri,
  Oct23→0130Z, BEFORE all four named candidates) and leg 2
  (pdtradeoff-sweep-era first-half 0.970x → current master 0.545x, in
  the post-sweep window containing 75fdd9258 preserver/food.js 07:22Z,
  be55cfc2c havenGrowth 07:38Z, fa10e1ca8 ledger revert 06:13Z,
  2c2336dd9 social 06:39Z). The four named candidates sit in the
  bufferdepri→pdtradeoff window (leg 1.5, first-half 1.230x → 0.970x),
  NOT the leg-1 window — the task's candidate list postdates leg 1.
  The candidate bisection below therefore tests leg 1.5; leg 2 is
  reported with its window + prime suspect, not bisected in this run.
- CONDITIONAL second policy: NOT triggered — master leadfeast is OLD
  (0.545x), neither flat (0.90–1.10) nor AMBIGUOUS, so no belongfeast.
