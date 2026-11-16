# sim-vetparty-a — PILOT NO-GO (frozen bars 1 and 2 fail; bar 3 passes)

Run: fleshout-20261116T0115Z (Loop A, adoption of the 2115Z claim).
Axis: scale-onramp. Arm: sim-vetparty-a — wave-4 re-engagement party
lever (vetattrition §9 spec). Branch `sim-vetparty-a`, worktree
`~/workspace/worktrees/sim-vetparty-a`. Base at arm start: `d073bd656`;
rebased onto master `5e0bba6e5` before the armed leg (rebase-stop-at-pick
quirk struck once on the lever pick; recovered per the documented
procedure — pick verified unapplied, `git rebase --continue`; new tip
`f0fb6fc18`). Proof `scripts/test-vetparty-a.js` 40/40 on the rebased
tip before the armed leg ran.

## Pre-registration (frozen, from sim-vetparty-a-prereg.md)

- Primary metric: **mean living wave-4 veterans at end among
  wave-5-unlocked seeds** (armed vs control, identical seeds).
- GO iff ALL: (1) armed mean ≥ 1.0 AND ≥ 1.5× control; (2) survived/8
  armed ≥ survived/8 control − 1; (3) starvation armed ≤ control + 2.
- Horizon 150d, death-aware; policy competent verbatim
  (sha `74a890f0844e`); pilot seeds 100821–100828 (8 seeds); control
  leg on the prereg tip (anchor `e3b709361`), armed leg on the lever
  tip (anchor `f0fb6fc18`).
- The control leg's own baseline (not the DIAG's 0.59 cross-corpus
  mean) is the judge: control mean vet5@end among unlocked = **1.0**,
  so the armed leg needed ≥ **1.5**.

## Verdict: PILOT NO-GO

| Bar | Control | Armed | Pass? |
| --- | --- | --- | --- |
| 1. mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5× control | 1.0 (1, 2, 1, 0) | 0.5 (0, 0, 1, 1) | **FAIL** |
| 2. survival guardrail survived/8 armed ≥ control − 1 | 6/8 | 4/8 | **FAIL** |
| 3. starvation armed ≤ control + 2 | 5 | 6 | pass |

Analyzer: `scripts/analyze-vetparty-a.js` on
`evidence/2026-11-15/perseed-vetparty-a-control` (8/8 files) vs
`evidence/2026-11-15/perseed-vetparty-a-on` (8/8 files); 0 instrument
errors both legs. Full analyzer output saved as
`evidence/2026-11-15/vetparty-a-analysis.json`.
Balanced panel (§15): `scripts/build-vetparty-panels-20261115.js` →
`vetparty-a-panel.{json,md}` + before/after `.json.gz` — decision
**review_required** (8 paired cases; village deaths per run 72.375 →
74.625, delta +2.25, CI [−10, 15.75]; community loss 0.25 → 0.5; no
material signal on national/table/wins, all 0/0).

Per-seed armed (unlocked seeds are the judged set): 100821 lost d129,
vet5@end 0; 100822 survived, vet5@end 0; 100823 lost d93, not unlocked;
100824 survived, not unlocked; 100825 lost d147, vet5@end 1; 100826
survived, not unlocked; 100827 lost d137, not unlocked; 100828
survived, vet5@end 1. Control per-seed: 100821 survived, vet5@end 1;
100822 survived, 2; 100823 survived, 1; 100824 survived, 0 (not
unlocked — the 0 in the control mean is an unlocked seed; the four
unlocked control seeds end 1, 2, 1, 0).

## Mechanism decomposition — where the chain breaks

The lever's parts all exist and the seed fires, but the trio never
forms and the gate never says yes:

- **Seeds fire (106):** `v4seeds` 8/7/4/15/36/9/20/7 per seed; stageAfter
  party 63, hunt 40, gear 3. The world-tick seed call works.
- **Plans never reach the dawn depart (1 of 106):** only THREE
  `v4departs` rows in the whole armed leg have targetWave 4 — all one
  villager, katarina_novak, seed 100825, target strike: two
  `party_wait` holds (days 119, 129; companion null, companion2 null)
  then a pair launch day 141 (companion2 null). The other 87 depart
  rows are wave-3/null targets. Seeded wave-4 plans almost never
  produce a depart row at all — the dawn scorer never bids (or never
  selects) the wave-4 party_launch for them. The recorder cannot tell
  candidate-not-bid from plan-churned before dawn; that is the named
  next diagnostic.
- **No trio ever launches:** `launchBySize` armed {2: 60, 3: 0} vs
  control {2: 25, 3: 0}; `partyTrios` 0 in winPlanStats (pooled);
  `w4TargetLaunches` 1 (a pair). The second companion was never
  actually launched — the pick/launch path never completed a trio.
  `countedRows` 0: the gate-count change never counted a co-tasked
  member, because no trio ever set out.
- **Gate says no more, never yes:** SEEKs 0 both legs; avoid:outmatched
  20 armed vs 4 control; trick-holds 4 vs 1; `winPlanStats.avoidances`
  22 vs 5. The extra departures run into the gate and are refused.
- **Field wave-4 kills FELL:** 10 armed vs 14 control (TB kills 14 vs
  12 — the scholar's share rose while the villagers' fell).
  Conversions wave-3 → wave-4 killer 10/44 (0.227) vs 9/50 (0.18) —
  up a hair on small numbers, not the inflow the lever promised.
  Wave-4 encounters: 116 armed vs 121 control; kills 8 vs 11, flees
  78 vs 84, fighter deaths 14 vs 11. Villagers went out more (60
  launches vs 25, all pairs) and died more in wave-4 fights.
- **Exits:** armed 13 classified (WILD 8, MONSTER-UNKNOWN-WAVE 3,
  dehydration 1, stranger 1) vs control 15 (WILD 9, W5-FIGHT 2,
  CONTEST 2, ROAD-EXPEDITION 1, alien 1). The WILD share did not move.

In plain words: the village heard the call — 106 villagers came back
from a wave-4 beast and formed a plan to go after it — but the plan
almost never turned into a walk out the door, and when it did it was
a pair, never the trio the gate demands. The pairs went out, the gate
turned most of them away, and the ones who fought died more often
than the villagers who stayed home. Veterans at the end went DOWN,
not up (0.5 vs 1.0), and two more villages died (4/8 survived vs 6/8).

## Wall numbers (this run's judged corpora, 16 configs)

National (standing ≥ 200): 4/8 both legs. Table 0/16, wins 0/16.
Wave 4 reached 8/8 both, wave 5 4/8 both. Median survival 148.5d
armed vs 150.5d control. No movement on the wall; the lever did not
open anything and cost two villages.

## Drift check — the NO-GO is real, not substrate drift

Master moved under the arm (journey r216/r217 conversation changes
are the RNG-stream-moving class). A new drift smoke,
`scripts/vetparty-drift-check.js`, compares control vs armed daily
snapshots and requires the first divergence to fall on/after the
first day the lever could act (first `v4seeds` day). Result: **NO
PRE-LEVER DRIFT on all 8 seeds** — first divergence day 40/43/56/59/
29/48/43/40 vs first lever-action day 37/42/52/55/27/45/35/26. The
trajectories agree until the lever acts, then diverge because of it.
(The courtship-confirm-b G3 drift NO-GO the same day is what made
this check worth building; the script is committed with the arm's
instrument so the next A/B can run it the same way.)

## Sense-testing (SENSE-TESTING LAW)

Fight narration lives in the recorder's `log[]`, not `lines[]`
(all 116 armed encounters have non-empty `log[]`; `lines[]` is empty
on all 116 — a recorder field-shape note, not a game defect).

- The single launched wave-4 pair, seed 100825 day 143, strike,
  allies=2, vFlee after 8 rounds: the log reads as a SOLO fight.
  Koki strikes 13–17/round against 735 HP while "Koki's gear absorbs
  57–71" each round, and flees at 48 HP. The companion never appears
  in the narration — no arrival line, no strike, no call. The party
  that set out as a pair fought as one person with a bystander.
  Also: "Koki has Crude bow but no arrows — the string stays drawn,
  useless." (See findings: bow-no-arrows.)
- Seed 100821 day 68, eulogy, vKill, allies=2: a real fight with a
  rescue — "Ethan is losing — shouts for help! Miguel charges in!"
- Seed 100827 day 104, reunion, vDie, allies=2: Devon dies in two
  rounds ("R1: Your Move hits Devon for 21 (19 left) … R2: Your Move
  hits Devon for 21 (0 left)"), again carrying "Sling but no arrows".

Veteran-death silence reproduces the DIAG: across the armed leg's
vetSays lines, no villager says anything when a veteran dies. The
only "death" hits in a scan of the armed vetSays are the Nielsen
naming line ("the producers name it: the Nielsen") and deadfall
gathering. The village still does not mark a veteran's death aloud.

## Metric review

The metric was the right one and the bars held: the lever moved the
primary metric the WRONG way (0.5 vs 1.0) and breached the survival
guardrail, so NO-GO is unambiguous — no re-scoring, no friendlier
metric. The bar-1 threshold (≥1.5× a control mean of 1.0) was steep
on 4 unlocked seeds, but the armed mean fell below even the 1.0
floor, so the steepness did not decide anything. The recorder's
`lines[]` vs `log[]` split should be fixed before the next arm's
sense-testing (quote `log[]`). The `v4departs` recorder cannot
distinguish "dawn never bid the candidate" from "plan churned before
dawn" — the next diagnostic needs a candidate-bid row, not just a
depart row. No metric revision proposed for the next run; the
instrument stands.

## Disposition

PILOT NO-GO per frozen bars. The lever is REVERTED on the branch
(killed arms leave no trace — revert commit follows the producergate
precedent); the instrument, analyzer, panel builder, drift check,
corpora, and this evidence merge evidence-only. No confirm band is
spent (100841–100856 stays fresh). Next blanks, in order: (1) the
dawn-candidate diagnostic — why 105 of 106 seeded wave-4 plans never
produce a depart row (candidate-bid capture in the dawn scorer);
(2) the second-companion pool at launch — the one plan that did reach
depart waited twice with companion null and launched as a pair;
(3) the bow-no-arrows arming gap (findings). The persistent-party
build still has no working trio launch anywhere; the gate SEEK is
still 0 in every leg that has tried to feed it.

## Infrastructure

- Adoption: 2115Z Loop A claim stayed live; its vetparty tree
  heartbeat was 51 min stale with no live process at run start —
  adopted per the 15-min guard (Loop B live on gatereach-b, untouched;
  its check.js finished mid-run). The 2115Z claim's other open item,
  grecorder, was VERIFIED merged already: reflog 00:44:45Z ff-merge
  landing `9f46c27f2`; branch deleted; its 5 commits are ancestors of
  master. Nothing to merge there.
- Rebase-stop-at-pick quirk struck once (lever pick in both done and
  todo); recovered per procedure (pick verified unapplied: 0 VETPARTY
  markers; `git rebase --continue`).
- Reap at run start skipped: registry lock held by another reaper
  (consecutive skips: 1) — no cleanup this run; the lock self-contention
  is a known open item, not this run's.
- Driver path note: the armed leg was started with
  OUTDIR=evidence/2026-11-15/perseed-vetparty-a-on and the driver
  doubled the path; the 8 files were moved to the correct directory
  after the run (no file overwritten, all 8 parse, analyzer exit 0).
- check.js --quick: run in the worktree after the revert commit (Loop
  B's concurrent check.js finished before it started, so no jest
  concurrency); result recorded in the coordinator evidence file for
  this run (sim-scale-onramp-round-0115.md), not claimed here.
- Safe-commit index clobber: none observed on this run's commits (status
  verified clean after each commit; final state in coordinator evidence).
