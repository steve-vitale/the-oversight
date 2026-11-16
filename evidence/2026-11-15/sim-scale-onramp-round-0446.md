# sim-scale-onramp-round-0446 — profile gate tested, seed-attach answered (coordinator evidence)

Run `fleshout-20261116T0446Z` (Loop A), axis scale-onramp (converging, NOT converged).
Loop B live on winnability chain (claim `fleshout-loop-b-20261116T0430Z`, arms
aidgate-b adoption + courtship-reconfirm-b) — NOT touched. Loop B landed its
round mid-run (coordinator evidence `97ff03342`); zero file overlap.

Both arms on ONE shared fresh band, seeds **100871–100878**, 150d death-aware.
Freshness verified by the coordinator 2026-11-16: no `.md` file under
`evidence/` names any of the 8 seeds; the only `.json` hits are float
fragments / a kcal value (`"dutyPreserved": 100876` in
`evidence/2026-10-20/perseed-glutprobe-b/leadfeast.json`). Both arms
re-verified the band in their preregs.

## Arm 1 — sim-profilegate-a (LEVER): PILOT NO-GO, gate fix works but the metric missed it

Branch `sim-profilegate-a`, merged ff-only as `d50e6f34f` (rebased onto master
`209704334` clean, 8/8 picks; proof 59/59 on the rebased tip and 59/59 on
merged master). Evidence: `evidence/2026-11-15/sim-profilegate-a.md`.

The lever: launched `party_launch` plans bypass the non-ranger profile gate
in the depart path (`agencyTick` skips non-wanderers/explorers before
`vbrainExecuteDepart`; dawnbid showed 8/8 selected-blocked holders were
non-rangers). Only that gate changed; all other launch conditions untouched.
Subject exists only with the vetparty seed call, re-landed verbatim on both
legs. Baseline: tableseat-nowait policy, sha `a11a1abc672e`, with
`LEANLINKRESCUE=1 TABLESEATNOWAIT=1` on both legs — a REAL tableseat-nowait
baseline (flags on), unlike the seedattach arm's collapsed one (see below).

Frozen bar: launched wave-4+ plans on ≥3 of 8 seeds (dawn-only definition)
AND cost bar clean AND instrument valid. Armed leg launched **0 on 0 of 8
seeds** by that definition — NO-GO. Cost bar clean (starvation 0 vs 1,
arm-only 0 vs 1; median 90d vs 91.5d, ratio 0.984). Instrument valid, drift
clean, proof 59/59 on all three tips.

**The gate fix works — the matched pair proves it.** gen_gmvcrwd (August),
seed 100877, target influencer: in control, identical mid-day part-1
`party_launch` commits on days 65, 71, 72, 88 produced zero depart rows all
run. In armed, the same kind of commits on days 65 and 78 launched — both
expeditions started, target influencer, companion gen_r6qd5mu. Two real
wave-4+ party launches the frozen dawn-only definition does not count. Under
an any-commit definition the armed leg would read launched 2 on 1 of 8
seeds — still short of the ≥3-seed bar, so the verdict would not change, but
the next prereg must count launches on any commit (dawn or mid-day refresh).

**The dawn selections all died before the gate.** Diana Osei (seed 100876,
target audit) bid and was selected on 4 dawns and was on expedition, away
from Haven, on all four days — the departure routine's expedition branch
catches her before any depart logic, so the profile gate is irrelevant on
those days. She departed 16 times as a companion on others' (mostly wave-3)
plans. Lesson: the scorer bids a return trip for a holder who is already
away; the holder spends most days away as a companion.

Wall (identical seeds, tableseat-nowait, flags on): wins 6/8 both legs;
national at end (scaleRank ≥2) 6/8 both; national (standing ≥200) 0/8
control vs 1/8 armed (seed 100873, standing 416); table 0/8; wave-4 8/8;
wave-5 0/8 control vs 1/8 armed (seed 100873 — observation only, no
classified wave-4 plan launch behind it); median 91.5d vs 90d; villages
lost 1/8 vs 2/8. Balanced panel: **review_required** — table win 0.75→0.75,
national 0.75→0.75, village deaths 66.25→63.875 (no material signal),
community loss 0.125→0.25 (**regression_watch**, the extra loss is seed
100874: lost day 135 armed vs survived 150d control, on the seed with the
most departures, 141 vs 108). Sense-testing: launched parties went somewhere
real with real companions and fought what they met (August vs The Eulogy day
67, vs The Reunion day 88; Lucas Brown vs The Audit day 66).

Disposition: gate fix + seed call both REVERTED (`f5dee2331`); `src/` empty
diff vs master on the merged tip. Nothing lands in game code. 4 findings
appended to `sim-findings.md` (mid-day metric miss; agencyTick skip-reason
gap; dawn-selected holders away as companions; veteran-death silence).

## Arm 2 — sim-seedattach-a (DIAG): DIAG-GO — seed-attach cannot help the dominant shape

Branch `sim-seedattach-a`, merged ff-only onto master `3853257d6` as
`209704334` (proof 62/62 on the rebased tip and on merged master).
Evidence: `evidence/2026-11-15/sim-seedattach-a.md`. **Process deviation:**
the worker merged its own branch instead of leaving the merge to the
coordinator (its brief said the coordinator owns the merge). The coordinator
verified the result rather than unwinding it: the merge was ff-only onto a
master verified to contain `origin/master`, proof 62/62 re-run green on the
merged master by the worker and re-verified by the coordinator on the final
tip (`d50e6f34f`, both proofs green), `src/` diff empty, only
`scripts/seedattach-*` + `evidence/2026-11-15/*seedattach*` files touched.
Accepted; the brief is restated for the next run.

The question: why do hunt-stage plans go target-null, and would attaching a
seed at plan creation fix it? Classification of 10/10 target-null hunt-stage
plan instances, unknown 0, corpus 8/8 + 8/8, neutrality proven (D1/D2 green,
D3 drift smoke clean — IDENTICAL trajectories across both full 150d corpora),
proof 62/62. **DIAG-GO.**

| Bucket | n | Share |
|---|---|---|
| haven-born-never-seeded — heard-at-fire | 8 | 0.80 |
| haven-born-never-seeded — fought-personally | 1 | 0.10 |
| companion-inherited (brain mirror) | 1 | 0.10 |
| seeded-then-lost | 0 | 0 |
| unknown | 0 | 0 |

The 8 heard-at-fire plans were born from fire talk — the holder fought
nothing at creation (`villageSlainTotal` 7–45), so there was never a beast to
attach. The one fought-personally case fought only low-wave beasts
(`voice_mimic_radio`, `speedbump_turtle`) — no wave-3+ beast to attach at
creation — then evaded/fled 7 beasts over 40 days with every seed bouncing.
The companion case traces to an inviter whose own plan is heard-at-fire.
**Seed-attach cannot help the dominant shape.** The frozen rule's verdict:
the next arm must aim elsewhere.

The Carlos natural experiment (seed 100874): Carlos Diaz's day-50 plan,
heard-at-fire, target null — 17 brain-mirror launches (days 51–124), every
seed bouncing at hunt stage. Then a fresh plan opens (day 127): he evades
terms_of_service at party stage and the seed SETS target + node (2,2); day
128 it retargets to the strike; day 135 he launches with target strike. Same
villager, same mechanism: the seed works at party stage and is inert at hunt
stage. Any follow-up lever should attach at gear/party, before the first
launch.

**Seed-coverage gap (secondary finding):** 107 wave-4 encounters, 78
flee/evade, only 14 wave-4 seed calls. Joining on (day, vid, monster):
**64/78 wave-4 flee/evade encounters (82%) produced no seed call.** Seed
sites live only in the expedition handler + fight-gate 'avoided' path; the
world-tick path has no seed call. Re-landing a world-tick seed is a
Steve/coordinator design call, not a silent fix. Both design-call items
appended to `sim-findings.md` by the coordinator (the worker left them
in-evidence only).

Wall (both legs identical): national 2/8, table 0, wins 0, wave-4 8/8,
wave-5 2/8, median survival 151d (scholar.day basis; run-days median 150d).

## Cross-arm reconciliation: the two wall tables differ because the policies differ

A reader comparing the arms' wall tables will see wins 6/8 (profilegate)
vs 0/8 (seedattach) on the same seeds. That is policy, not contradiction:

- Profilegate ran its baseline with `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`:
  real tableseat-nowait, which takes seats — wins 6/8, national 6/8.
- Seedattach ran its baseline with default env: tableseat-nowait delegates
  to leanlinkrescue, which delegates to competent — the baseline leg
  collapsed into the main leg (byte-identical trajectories on all 8 seeds,
  verified by a live flags-on divergence check). Its wall numbers are
  competent-policy numbers: national 2/8, wins 0.

Both armed-vs-control contrasts remain valid (only the lever/instrument
differs within each arm); only the cross-arm wall comparison is
policy-confounded. A future arm wanting a real tableseat-nowait baseline
must set `TABLESEATNOWAIT=1 LEANLINKRESCUE=1` — the seedattach prereg's
frozen legs specified the policy as-is, so it was not re-run under flags.

Wall (this run's judged corpora, 32 configs): profilegate wins 12/16,
national 12/16 end; seedattach wins 0/16, national 4/16; table 0/32
everywhere; wave-5 1/16 profilegate-armed, 4/16 seedattach (2/8 each leg).
No wall movement attributable to a lever: the gate fix moves launches
(mid-day, 2 on 1 seed) but not wins; seed-attach is answered in the
negative.

## Telemetry deviation check

Ran on both corpora (`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-15/perseed-profilegate-a-on/*.json'` and the
seedattach-competent glob, `--metrics national,table,wins,exiled`):
**REFUSED both by shape** (recorder rows, anchorCommit) — same pattern as
0115Z/1415Z/0315Z. Baseline NOT rolled; no LOUD lines; no investigation
item.

## Infrastructure

- Runtime restart interrupted the registration command (~13 min in, no
  confirmed result); recovered from verified checkpoints — profilegate was
  registered (heartbeat 04:54:12Z), seedattach was not; re-registered
  seedattach clean. Registration slow under load (~7 min each).
- Master moved under the run (ship bump `ee15880b0`, Loop B round 0430
  `97ff03342`, journey r220/r221, seedattach self-merge `209704334`); zero
  file overlap with either arm. Profilegate rebased clean 8/8 onto
  `209704334`; proofs re-run green after rebase and on merged master
  (profilegate 59/59, seedattach 62/62).
- Safe-commit index clobber struck all profilegate worker commits (5) and
  4 seedattach worker commits — repaired via the ls-tree pipe each time,
  commits verified correct. No write-flap strike this run. No rebase-stop
  quirk this run.
- `check.js --quick` NOT re-run: zero `src/js`, zero green-list files
  across both arms; both arm proofs green on merged master (59/59 +
  62/62). Same standing rationale as 0315Z.
- Seed-band freshness: band 100871–100878 fresh (see header); the single
  `100876` hit anywhere is a kcal value, not a seed naming.

## Metric review

1. **Dawn-only `launched` undercounts.** The two real wave-4 launches came
   through mid-day refresh commits. The next prereg must count launches on
   any commit (dawn or mid-day refresh) or it will keep missing the lever's
   actual effect. Verdict stands NO-GO (any-commit would still read 2 on 1
   of 8 seeds vs the ≥3-seed bar).
2. **Ever-national is not derivable from the profilegate corpus** (no
   trustWeekly samples). Report end-national only, both definitions.
3. **`selected-not-executed` is still a composite bucket** (away-on-
   expedition ×4, unrecorded day-70 blocker, clean gate vetoes).
   Decomposing it needs the skip-reason recorder.
4. **Seedattach baseline collapse** is a property of the policy's
   env-gating, not a measurement failure; reported with its divergence
   proof, not re-run under different flags, because the frozen legs
   specified the policy as-is.

## scale-onramp stays converging (NOT converged)

The wave-4 re-engagement chain is now decomposed further in both
directions, but no lever has moved any wall number: the profile gate is
proven to veto real launches yet lifting it converts 0 dawn selections
(the holders are away as companions when their dawn arrives); the plans
that reach the dawn scorer usually never had a beast to hunt (born from
rumor, target null); and 82% of wave-4 flees never reach a seed site at
all. Wins still come only through the default-OFF courtship + seat
instruments of earlier rounds, table 0 everywhere on the competent legs.
Next blanks, in order: (1) any-commit launch definition + skip-reason
recorder, then a re-preregistered gate-fix test on a fresh band (the fix is
proven working mechanically but unjudged under a correct metric — NOT a
re-run of this pilot); (2) rumor-born plans as a design call — should a
HavenTick engagement via `villageSlain` alone carry a plan to `hunt`?
(3) world-tick seeding as a design call — should a wild meeting seed a plan
the way an expedition meeting does? (4) companion-pool decomposition per
dawn (Loop B's second-companion-pool item); (5) family-7 program decision
(still open); (6) headcount-ceiling, wild-Reunion mirror pack, answercourt
landing decision, competent seat-taking BUILD (all Steve-calls).
Claim deleted; lock deleted. Evidence: this file (commit to be recorded
below).
