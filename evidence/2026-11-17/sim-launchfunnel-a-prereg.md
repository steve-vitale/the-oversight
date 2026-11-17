# sim-launchfunnel-a — PREREG (frozen before any judged sim)

**Arm:** sim-launchfunnel-a · **Loop A run:** fleshout-20261117T1215Z · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-launchfunnel-a` · **Worktree:** `~/workspace/worktrees/sim-launchfunnel-a`
**Base at arm start:** master `f9b33757a` (worktree HEAD; coordinator-registered 2026-11-17T12:44:58Z).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`.
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.

## The question (trickteach-b's named next step)

sim-trickteach-b (band 102211–102218) PILOT NO-GO'd one-observation-teaches:
the mechanism moved (trick-known at wild contact 42%→78%) but the armed leg
launched **0** wave-4 fights, so the judged population never formed. Its
closeout names the next step: "diagnose why launches are 0–5 per 8 villages
before re-running any trick lever". This arm is that diagnosis: a UNIFIED
launch-funnel census on ONE fresh band, ranking where plan instances die
across six stages: seed-attach → dawn bid → profile gate → companion pool →
launch → gate. The trick-teaching lever is NOT rebuilt (killed, stays killed).

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-16/sim-killfail-a.md` — launched fights 9, kills 0;
  trick-unknown 9/9, launched-short 9/9 (launch leaves as 2, meets as 3);
  evade modal (6/9); wild 0/38 kills — wave-4-wide failure.
- `evidence/2026-11-16/sim-trickteach-b.md` — see above; gate SEEK 0 both legs.
- `evidence/2026-11-16/sim-launchdef-a.md` — PILOT GO, profile-gate bypass
  LANDS (in this base, unconditional, `src/js/villager-agency.js`); skip-reason
  recorder: profile-gate-veto 39→0; part-2 commits die at the night tick;
  pre-tick snapshot goes stale on same-tick companion departures (3 `other` rows).
- `evidence/2026-11-16/sim-poolmarginals-b.md` — pool marginals: notRanger
  819/1043 (78.5%), 592 alone; trust 14/1043, never alone; away never alone;
  expedition members are all rangers; eligible-0 dawns 57.9%.
- `evidence/2026-11-16/sim-haventarget-b.md` — 0 Haven-target expeditions;
  blocked launches 95/198 (medic-duty starves whole seeds); standing 199 on 5/8.
- `evidence/2026-11-16/sim-seedland-b.md` — NO-GO: seed call plants plans
  (instances 0→17, launches 0→3) but all 3 launched holders die at home
  before re-meeting the target; 11/17 instances die candidate-not-bid.
- `evidence/2026-11-16/sim-gatelever-b.md` — NO-GO: 1 SEEK in 66 consultations;
  kills happen on gate-null ordinary encounters; trick unknown on every null row.
- `evidence/2026-11-16/sim-vetreengage-a.md` (PILOT GO) +
  `evidence/2026-11-16/sim-vetreengage-confirm-a.md` (CONFIRM NO-GO, Loop B
  0030Z): VETREENGAGE stays default OFF; trio never fires (0/294 departs
  carry a second companion; dawn pick computed + accepted, then dropped
  before depart). This DIAG does not re-litigate that verdict.

## Band freshness (verified 2026-11-17, before this prereg)

Search scope: (1) `git grep -E '10341[1-8]'` over the whole worktree
(tracked files); (2) `grep -rlE '10341[1-8]' evidence/` (all files incl.
corpora) and `scripts/`; (3) `grep -rE '10341[1-8]'` over goal
`hidden_files/convergence-tracker.md`, `hidden_files/sim-findings.md`, and
`hidden_files/lever-claims/*.json`; (4) `grep -rln "10341"`
over `evidence/*/sim-*-prereg.md`.
Result: **zero hits naming the band** anywhere except this run's own Loop A
claim (`hidden_files/lever-claims/fleshout-20261117T1215Z.json`, which names
103411–103418 for this arm and the sibling arm sim-part2night-a) and
Loop B's live claim (`fleshout-loop-b-20261117T1130Z.json`, which names NO
band — recorded here as unknowable from the claim, per the brief).
The `git grep` hits (10 files, all October corpora) are numeric false
positives inside data values — e.g. `pantryFreshAfter: 103412` (kcal) and
`freshFirst: 44.05777210341526` (a float) — not seed numbers. **Band FRESH.**

## Legs (three, one band, one driver)

The seed call that creates the measured population is env-gated in this base
(`VETREENGAGE=1`, `src/js/game.js` resolveWildMonsterEncounter; the bundle
also gates the second companion, trio counting, and party persistence in
`src/js/win-plan.js` / `src/js/villager-brain.js`). No src change is needed
to switch it on or off — the flag is set at launch. The three legs differ
ONLY by env flags, on the same tip:

| Leg | VETREENGAGE | Recorder | Role |
| --- | --- | --- | --- |
| `off` | unset (0) | ON | Master-default funnel (thin population expected; poolmarginals control leg: 3 instances). Reported alongside, same taxonomy. |
| `vre` | `1` | ON | **Census leg (judged).** Seed-fed population; the ranking is judged here. |
| `rec` | `1` | OFF | D2 full-band neutrality: trajectories must be identical to `vre`. |

The `vre` leg measures the funnel under the vetreengage bundle, NOT master
default — recorded, not hidden. The bundle is CONFIRM NO-GO and stays default
OFF; this DIAG changes no default and re-litigates nothing. The OFF leg is
the honest master-default reading; if it yields 0–3 instances, that thinness
is itself a funnel finding (stage 0: the seed source is nearly dry on master).

Sibling arm sim-part2night-a shares this band (same claim); files are
namespaced `launchfunnel-a-*` and do not collide. Loop B's live arms
(sim-planignconfirm-b, sim-nondeathplan-b) work `src/js/win-plan.js` —
**this arm does not touch that file** (or any `src/js` file): the gate stage
is observed through a driver-side wrap of `winPlanFightGate` only.

## Instrument (reused, not rebuilt)

`scripts/launchfunnel-driver-20261117.js` — a copy of
`scripts/seedpaths-driver-20261116.js` (the vetfirst T-class instrument:
`v4seeds` with seed-path classification, `v4departs`, `v4gates`,
`v4encounters` with origin, `dawnbidScores` / `dawnbidDeparts` /
`dawnbidCensus` / `dawnbidStarts`, `companionPool` with the members
extension) PLUS, verbatim from `scripts/launchdef-driver-20261116.js`,
the agencyTick skip-reason recorder (`launchdefSkips`) and the
`commitKind` + monotonic `seq` on `dawnbidDeparts` rows. Deltas from the
seedpaths copy, all recorded here:
1. Gate wrap widened wave == 4 → wave >= 4 (funnel includes wave-5 targets;
   gatelever recorded wave-4+ rows).
2. SEEDLAND semantics hard-on (encounters wave >= 4 + `origin` on every row).
3. Skip recorder installed after the seedpaths wraps (chains onto
   `vbrainExecuteDepart`); mode passed as `'on'` because the PROFILEGATE
   bypass is landed in this base — profile can never veto a `party_launch`
   commit, so a residual profile veto would surface as `other` (see
   Limitations).
4. Output names: `evidence/2026-11-17/perseed-launchfunnel-a-<leg>/`,
   files `launchfunnel-a-s<seed>-launchfunnel-a-<leg>.json`, `arm: 'launchfunnel-a'`.
5. Env flags: `LAUNCHFUNNEL_RECORDER=off` skips all wraps (D2);
   `VETREENGAGE=1` is read by game code, not by this driver.

All wraps are pure reads + writes to driver-local arrays — no game-state
writes, no RNG. Zero behaviour change when the recorder is off (proved by
D1/D2/D3 below). `src/js` diff for this arm is **0 lines** by construction.

## The funnel (frozen definitions)

A **plan instance** is a wave-4+ win-plan, opened by a seed row whose
`stageAfter` is `gear` or `party` (the dawnbid/launchdef state machine,
reused unchanged via `scripts/analyze-launchdef-a.js` `classifySeed`).
Instance identity: (seed, vid, target); a retarget closes the old instance
and opens a new one. One bucket per instance, frozen precedence (first match
wins) — the launchdef buckets, with `launched` split by the encounter join:

| Stage | Bucket | Dies when |
| --- | --- | --- |
| 0 seed-attach | (corpus-level, not an instance bucket) | A wave-4+ seed row lands on a plan not aimed at the fled type (`stageAfter` not gear/party, or target-null) and opens no instance. Counted as seed rows by path + `nonOpeningSeeds`. |
| 1 dawn bid | `candidate-not-bid` | Never bids `party_launch` (sub: `no-companion-party` / `gear-stage` / `veteran-guard` / `not-scored` / `no-companion-hunt-plus`). |
| 1 dawn bid | `bid-not-selected` | Bids but is never selected. |
| 2 profile gate | `selected-blocked` | Selected but produces no launch; sub = skip reason (`profile-gate-veto` / `away-on-expedition` / `away-as-companion` / `not-at-haven` / `night` / `indoor-objective` / `danger-gate` / `inviter-sick` / `inviter-range-0` / `inviter-hurt` / `commit-overwritten-midday:*` / `no-tick-after-commit` / `selected-not-executed`). |
| 3 companion pool | (corpus-level, per scored dawn) | Share of scored dawns with eligible pool 0 / 1 / 2+; first-fail tally from `companionPool` rows. Not an instance bucket — the pool is measured where the bid dies, via the `candidate-not-bid` sub. |
| 4 launch | `launched-no-meeting` | Launched (depart row `launch`, holder + companion on expedition) but no encounter with the target type inside the launch window. |
| 4 launch | `launched-fought-no-kill` | Met the target in-window, no kill (sub by outcome: evade / vFlee / vDie / mFlee / out-damaged). |
| 5 gate | (per-meeting, not an instance bucket) | Gate rows for launched-party meetings: seek / avoid / null, with trick-known split. Reported as the gate stage of the funnel. |
| — | `launched-killed` | Met the target in-window and killed it. Survived the funnel. |
| — | `target-killed` | Holder slew the target while open, outside a launch (launchdef bucket, kept). |
| — | `plan-churned-before-dawn` | Holder died / plan deleted / retargeted before the first scored dawn. |
| — | `unknown` | No rule matched. **Must be 0.** |

**Launch window** (seedland-b rule, reused): `[launchDay, closeDay]` where
closeDay is the instance close day (holder-died / plan-deleted) or the final
day if still open. **Meeting join:** a `v4encounters` row counts as a
launched-party meeting iff its day is in the window AND its `mid` equals the
instance target AND its fighter (`vid`) is the holder or a launched
companion of that launch (or its `allyVid` is). **Launch** (launchdef
any-commit rule, reused): a depart row with `result: 'launch'` where holder
and companion are both on expedition. **Gate stage:** `v4gates` rows for the
same joined meetings (vid in the launched party, mid == target, day in
window); the corpus-wide gate consultation table (seek/avoid/null, all
wave-4+ rows) is reported alongside as context.

## Primary metric (frozen)

**Ranked funnel leak counts per stage** on the census (`vre`) leg: the count
of plan instances dying at each stage under the frozen precedence above,
plus the corpus-level stage-0 seed-attach counts and the stage-3 pool
distribution. The verdict names the binding stage (the largest leak) with
its count and share of instances.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **Taxonomy completeness:** every plan instance on the census leg
   classified, 0 `unknown` rows; all files parse (8/8 per leg);
   0 instrument errors on every file.
2. **Population floor:** census-leg instances ≥ 5 (killfail's floor). Below
   5 the ranking is noise and the verdict is NO-GO (uninformative), not a
   re-score.
3. **Ranked-leak verdict:** the ranked leak table is produced with every
   stage counted and the binding stage named with count + share. (DIAG bar:
   it judges whether the census answers the question, not which stage wins.)
4. **Instrument validity:** proof test `scripts/test-launchfunnel-a.js`
   green; D1 repeatability + D2 wrap neutrality green (60d, seed 103411);
   D2 full-band: `rec` leg trajectories identical to `vre` leg on all 8
   seeds; D3 drift clean (see below). `check.js --quick` green if run
   (scripts-only change; proof-covered).
5. **Balanced panel (§15):** `scripts/balance-panel.js compare` run on the
   OFF→VRE panels and attached as `launchfunnel-a-panel.{json,md}` (+
   before/after `.json.gz`). The panel is the instrument, NOT the judge
   (the frozen bars above are); the OFF→VRE contrast measures the
   vetreengage bundle, not a lever under test — reported as such.

## Drift check D3 (frozen definition — trickteach lesson applied)

First-lever-day is the first **world-tick** `v4seeds` row on the `vre` leg
(the VETREENGAGE-gated path), falling back to the first depart row carrying
a non-null `companion2` (the other VETREENGAGE-gated action) if no world-tick
seed fires. Agency-evade / agency-flee / gate-avoid seed rows are live paths
on BOTH legs and must NOT count as lever action (trickteach's D3 gap: its
first-lever-day missed earlier-wave / scholar-channel actions).
`scripts/launchfunnel-drift-check.js` (adapted from
`scripts/vetparty-drift-check.js` with the corrected first-lever-day):
CLEAN iff every diverging seed diverges on/after its first-lever-day.
A pre-lever divergence is DRIFT and fails bar 4.

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200, table seats,
wave-4 unlocked, wave-5 unlocked, median survival, total deaths, starvation
deaths — per leg (off / vre / rec).

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one launched-party
meeting end to end (or, if none launches, the nearest launch-adjacent fight
lines the corpus carries). Judge meaning, coherence, consequences — never
just counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **Skip-recorder pre-tick staleness** (launchdef finding): a holder who
   departs as a companion in the SAME tick reads clean pre-tick and records
   `other`. The analyzer joins `other` skip rows to same-tick depart rows
   post-hoc and reclassifies them `away-as-companion-this-tick`; any `other`
   row surviving the join is investigated by hand and named.
2. **Trick-wait holds are invisible** (gatelever gap): the wait lands through
   `vbrainAlignObjective` (indoor chore), never through `vbrainExecuteDepart`,
   so no hold row is recorded. Not re-measured here; the gate stage reports
   trick-known on every null row instead.
3. **Gate rows cover wave-4+ meetings only** (wave-3 plans out of scope).
4. **Win-plan.js is wrap-only**: if a funnel stage is unobservable without a
   win-plan.js hook, it is recorded as an instrument limitation, not worked
   around by touching the file.
5. **No canon doc covers expedition destination picking** (haventarget CANON
   GAP, recorded not invented). The funnel stages are code-grounded
   (win-plan.js / villager-brain.js / villager-agency.js reads via the
   recorders), not canon-invented. Canon read: docs/CANON.md,
   docs/MONSTER-WAVES.md (wave law, readiness bars, trick-learning rule).

## Files

- Prereg: `evidence/2026-11-17/sim-launchfunnel-a-prereg.md` (this file)
- Instrument: `scripts/launchfunnel-driver-20261117.js`,
  `scripts/analyze-launchfunnel-a.js`, `scripts/launchfunnel-drift-check.js`,
  `scripts/build-launchfunnel-panels-20261117.js`,
  `scripts/test-launchfunnel-a.js`
- Corpora: `evidence/2026-11-17/perseed-launchfunnel-a-off/`,
  `perseed-launchfunnel-a-vre/`, `perseed-launchfunnel-a-rec/` (8 files each)
- Analysis: `evidence/2026-11-17/launchfunnel-a-analysis.json`
- Panel: `evidence/2026-11-17/launchfunnel-a-panel.{json,md}` (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-17/sim-launchfunnel-a.md`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
