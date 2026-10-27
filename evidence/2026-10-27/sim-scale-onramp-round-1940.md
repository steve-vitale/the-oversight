# sim-scale-onramp-round-1940 — coordinator evidence (axis scale-onramp — 3 arms, merged locally pending ship)

Run: fleshout loop, run fleshout-20261027T1940Z. Axis: scale-onramp (converging).
Loop B live on food-economy throughout (1845Z claim, NOT touched) -> this run
worked scale-onramp only. Base b2bf0135f; master moved once under the run
(loop-B food-economy round 31bb45a8d, zero overlap) — all three arms rebased
clean onto it (then onto each merged tip in turn), proofs re-run green
post-rebase, merged ff-only in order w5seq -> fullseatgate -> rule3trial.
No push, no bump. Zero src/js changes across the whole run (measurement +
policy-screen only; the one policy built was deleted as a killed arm).

## Plain words

Three fresh bands, same story from three angles: villages now reach national
easily, sit at the table often, and even win through the lesser seat — but
nobody opens wave 5 and nobody takes the full seat, now six bands running.
The wave-5 door's two keys were re-tested and the test itself broke: standing
is no longer rare (three villages cleared 200 and all three sat parked just
below the line, held by the other key), while the veteran key still never
fills — two bands running, two wave-4 kills, zero killers left alive. A
separate audit of the full-seat gate found its bite is zero for a different
reason: no village even reaches the full-seat bars, so the gate has nothing
to decide; and the national-standing enforcement Steve ruled is already in
the game, not still to do. The third arm tried a new kind of player — one
who completes trials instead of courting — to open the one remaining
fallback seat rule to a live test; every seated village still took the
defiant door, so that rule stays proven only on paper.

## Arm 1 — sim-w5seq-a: DIAG-NO-GO (binding prereg, no re-score)

Prereg d5f72c4cf (rebased e2757f052), instruments ae7876e7b (494bc4583),
evidence fb1729ccc (73d334632 on master). Fresh band 74401-74408, tableseat-
nowait verbatim, 180d death-aware. Validator ALL PROOFS PASS (V1-V7 + G4 +
G5 + G10 SEQ recount).
- LEG 1 (the lock): 4/8 — FAILS (needed >= 6/8 both-absent-at-peak).
  Both-absent: 74402, 74403, 74404, 74407. Misses: 74401, 74406, 74408
  standing-only (peak capped 227, 227, 252); 74405 veterans-only (peak
  veterans 1/2).
- LEG 2 (the sequence): TRUE on all counts — S1 8/8, S2 8/8 (wave-4-door
  deferral on every seed), S3 8/8 (no wave 5 on one key).
- Per the binding confirm-band rule the verdict is NO-GO on the WORDING,
  not on the sequential structure — the structure passed every check, so
  the formulation is revised for the NEXT run's prereg, not re-scored.
  Proposed revision (not applied here): veteran-binding primary — peak
  rd5 veterans < 2 on >= 7/8 AND every standing-met seed held below gated
  200 unless veterans = 2 (holds 16/16 across twokey + seq bands).
- Wall: national ever/final 8/8 / 6/8 (national ever 8/8 is a first for
  this census family); table invited/entered 5/8 / 3/8; wins 3/8, all
  feared lesser; full seat 0/8; wave-4 7/8; wave-5 0/8; median 153d;
  deaths 273, starvation 1 (0.4%); max Arc 4. Combat 83.1% of deaths.
  Deed w4 met 5/8 (up from 2/8) while end veterans sit 0/8 — facing is now
  common, blooding-and-surviving still rare.

## Arm 2 — sim-fullseatgate-a: AUDIT-GO (binding prereg)

Prereg 5789ba06 (rebased 18498df78), evidence+corpus+instruments 7a38d3cd
(a64c6cb4c on master). Fresh band 74501-74508, tableseat-nowait verbatim,
180d death-aware. Validator ALL PROOFS PASS (74 checks).
- The counted answer: table entries 6 invited, 5 entered — full-seat-
  eligible 0, BLOCKED 0, PASS EITHER WAY 0, at entry, at entered, and at
  end alike. Lesser-seat entries 5 (all five entered villages, all
  winning as the Feared) — untouched by the full-seat gate on either
  reading of it. Full seats taken 0; scale-false full seats 0.
- Why the bite is zero: no village reaches the full-seat deed bars at
  all. All six invited villages arrive at w3 = 3 — exactly one short of
  the full bar's 4 and exactly at the lesser bar's 3 (the invitation
  itself selects for it) — and w5 = 0 everywhere. Scale never decides
  anything here, not because villages pass it (4 of 6 arrive below
  national), but because the wave bars decide first.
- Premise correction (important): the brief's premise was already stale.
  deedGateReady().ok ALREADY enforces scale — commit 234d3a825
  ("enforce national scale in full-seat deedGateReady() per Steve
  2026-10-27 ruling [needs-eyes]") is in this run's base and on master.
  This arm made no seat-code edits, and its counted answer is computed
  counterfactually from the breakdown fields either way (validator
  checks ok == (barsOnly && scale) on every snapshot). What this run
  settles is the bite (zero), not the enforcement (already landed).
  Next-arm sketch in the arm evidence: an enforced-vs-reverted-ok
  before/after on the first substrate where any village reaches
  barsOnly true; GO = >= 1 full entry downgraded with no lesser/wins
  regression. Do NOT run it until such a substrate exists.
- Note: the named tableseat evidence files (sim-tableseat-a.md,
  sim-tableseat-nowait-a.md) do not exist in committed 2026-10-27
  evidence; w5twokey + scalegate files were used as substrate/deed
  sources instead. The stage discrepancy (TABLE.md >= 3 vs code >= 2)
  was recorded as observed and NOT adjudicated — still a Steve call,
  and untestable on this band since every snapshot is stage 3.
- Wall: national ever/final 8/8 / 6/8; table 6/8 / 5/8; wins 5/8 (all
  feared lesser); full 0/8; wave-4 6/8; wave-5 0/8; median 135d; deaths
  234 (combat 82.1%); starvation 1 (0.4%).

## Arm 3 — sim-rule3trial-a: SCREEN-NEGATIVE (binding prereg)

Prereg d7ec438e (rebased 216b73782), env-fix 6fdd3725 (b296daddb),
evidence 59eaece6a (c647c014d on master). Rule (3), quoted verbatim from
sim-fallbackfeared-a-prereg.md: at a paths-phase offer — (1) if 'defiant'
offered, take it; (2) else first offered door that is NOT 'feared', in
engine order; (3) else (only feared offered) take feared, flagged
fallback-Feared. Rule (3) stays unit-proven only.
- Pilot band 77301-77308 (verified unspent), 180d death-aware, paired
  baseline/armed on identical seeds. Floor was seated >= 3/8 AND >= 1
  no-defiance seating: seated 5/8 (clause a met), no-defiance 0/5
  (clause b failed) -> SCREEN-NEGATIVE, no Phase 2. All 5 seated rows
  took defiant and won (defiance 8, 5, 6, 5, 7).
- Killed arm leaves no trace: scripts/policies/tableseat-trialchase.js
  and tablepaths-trial.js are DELETED in the evidence commit. Sweep +
  proof scripts remain as measurement record.
- Trial telemetry: 87 trials seen, 32 completed, 52 expired, 3 open;
  138 pantry-chase days, 119 identify-chase days, but only 3 eat-L2
  bites / 1 L2->L3 conversion — the identify chase barely fired
  (bottleneck is reaching L2, not the final tastings). Strongest
  corroboration: on all 5 seated seeds, expired-trial count ==
  seating defiance exactly (8/8, 5/5, 6/6, 5/5, 7/7).
- LOUD disclosure (in the arm evidence, not hidden): the first sweep
  on this band omitted LEANLINKRESCUE=1, so both legs ran competent-
  only (national 0/8, seats 0/8). Caught from the corpus (courtship
  counters entirely absent); delegation gates all "passed" on it, so
  they cannot detect a missing courtship. It was retained separately
  at perseed-rule3trial-a-invalid/ (audit only, never judged), env
  fixed, det-gates re-run (both PASS), and the pilot re-run on the
  same band — a corrected-instrument run, not a second screen, since
  the registered substrate had never been measured on these seeds.
  Lesson carried: preregs must list the FULL env set including
  inherited gates, and need a substrate-activation gate (courtship
  counters non-zero) alongside delegation gates.
- Wall (armed; baseline identical except the door): national ever 7/8,
  final 7/8; table 5/8; wins 5/8; full 0/8; wave-4 3/8; wave-5 0/8;
  median 93d (win-censored — seated runs end at wins on days 90-101);
  deaths 211, starvation 4.
- Sense caveat: no fallback-feared seating, so no seating transcript
  is claimed. The sense replay (77302) holds only the run's tail
  (days 178-180), so no trial beats survive in it — no trial-chase
  reading is claimed; the tail reads coherently as a prosperous late
  village (pantry ~51,000 kcal) that reached national without ever
  seeing the table.

## Pooled wall (3 fresh bands, 24 configs — per-band medians, no pooled median claimed)

National ever 23/24; national final 19/24; table invited/entered 16/24 /
13/24; wins 13/24 (all feared lesser); full seat 0/24; lesser 13/24;
wave-4 16/24; wave-5 0/24; medians 153d / 135d / 93d (win-censored on the
third); deaths 718, starvation 6 (0.8%). The wall is wave 5 -> full seat,
sixth band running. National is definitively not the wall.

## Metric review

- w5seq: the both-absent lock count drifts with standing (now common)
  instead of measuring the gate — the metric is revised for the next
  prereg (veteran-binding primary), not re-scored here. No other
  metric change proposed.
- fullseatgate: counterfactual barsOnly-vs-scale instrument worked as
  designed; its zero is a real zero on this substrate, not an
  instrument failure (74/74 checks, deed identity on 19 snapshots +
  1050 daily tuples).
- rule3trial: the seat-rate floor did its job — clause (a) passed and
  clause (b) failed cleanly, so the screen stopped instead of
  drifting into Phase 2 on a hope. The env-list lesson above is the
  metric-review item: future preregs carry the full env set plus a
  substrate-activation gate.
- Balanced panel: attempted on all three arms, honestly not producible
  — balance-panel.js has no corpus-ingest mode (it builds panels from
  live roots / compares panel files, not census rows). Per-seed
  comparisons in the arm evidence are the comparison of record, as in
  prior arms. This is the same standing exception as w5twokey, now on
  a third round — a corpus-ingest mode for the panel is itself a
  tooling blank for a future run, not something to fake here.

## Telemetry deviation check (coordinator, all three corpora)

3 LOUD lines per corpus (national/table/wins), same KNOWN artifact class
as w5twokey and prior rounds: the script reads top-level national/wins
fields, but per-seed rows carry nationalEver/entered/won (verified on
s74401/s74402 — nationalEver 1, entered/won present, no top-level
national/wins keys), and the WINSEAT baseline is a ~100%-win suite vs
this census substrate. No exiled LOUD line on any corpus. Baseline NOT
rolled. Real numbers are the pooled wall above.

## Infrastructure

- Worktree registration slow (~2-5 min per tree, not failed). Safe-
  commit index clobber hit all worker commits + is the known class
  (commit correct, index lying) — repaired via HEAD-blob cacheinfo
  each time, commits verified correct. No EPERM flap blocked this run.
- check.js --quick NOT re-run: zero src/js, arm proofs are the
  attributable verification (prior precedent).
- Sibling trees NOT touched (gap-* trees, loop-B trees, panel-contract,
  stale B trees all left alone; reap left gap-social's uncommitted
  changes alone as required).
- Coordinator landing note (loud, no loss): none this round — all three
  merges were clean ff-only after in-worktree rebases. Lesson
  re-confirmed: never rebase in the main tree; rebase inside the
  arm's worktree, then merge.
- Main tree clean at closeout. Merged locally, pending ship.

## Village assessment (plain words)

The villages in this round look competent and increasingly alike at the
top: they feed themselves, they reach national, they win small at the
lesser table — and then they stop, because the road past the table
needs a fighter who has killed the last draft and lived, and nobody
produces one. The census keeps finding the kill without the survivor
(two bands, two kills, two dead killers) and the standing without the
meeting (a village at raw 347 standing that never met a wave-4
monster). The blanks that matter now are survivorship (why killers
die) and meeting (why standing and fighting run on different tracks),
not stronger courtship or another table variant.

## Next blanks, in order

1. The full seat itself, under the revised veteran-binding prereg
   (w5seq proposal) — the next scale-onramp arm, not a re-score.
2. Veteran survivorship: why the only wave-4 killers die before the
   end (w5seq finding) — needs its own arm, not another census.
3. Standing/meeting decoupling: 74406's feast/diplomacy standing route
   (raw 347, w4faced 0) — standing and meeting keys earned on
   different tracks.
4. Rule-(3) live test needs a lower-defiance substrate, not more seeds
   on leanlinkrescue-family substrates (third screen at 0 no-defiance
   across three substrates now: lowdef 0/8, defnoffer 0/9, rule3trial
   0/5) — plus the seat-rate floor and full-env + activation gates
   from the rule3trial lesson.
5. The full-seat enforcement before/after (fullseatgate sketch) — only
   once a substrate exists where any village reaches barsOnly true.
6. Overtime standing docks as a late-run standing-decay mechanism
   (w5seq sense-only observation, not a census claim).
7. Rank/invitation decoupling again (rule3trial 77302/77308, plus
   fullseatgate 74502 invited d116, died d153 seat untaken) — the
   seat-waiting honesty work owns the died-waiting case.

scale-onramp stays converging (NOT converged): national is reached
reliably, lesser wins are routine, but the full seat is still
unreached, wave-4 kills still do not survive into living veterans, and
rule (3) is still unit-proven only. The standing directive stands
until the tracker records this axis converged on measured evidence.
food-economy stays converging (untouched; sibling loop B).
Claim deleted; lock deleted.
Evidence: evidence/2026-10-27/sim-scale-onramp-round-1940.md (coordinator)
+ sim-w5seq-a.md + sim-fullseatgate-a.md + sim-rule3trial-a.md + preregs
+ corpora. Merged locally, pending ship.
