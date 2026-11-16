# sim-winnability-round-0530 — companion pool + gate, both decomposed (coordinator evidence)

Run `fleshout-loop-b-20261116T0530Z` (Loop B), axis winnability chain
(converging, NOT converged). Loop A live on scale-onramp throughout
(0446Z claim: profilegate + seedattach, NOT touched); Loop A landed
mid-run (`a3462c4f2`, profilegate PILOT NO-GO + seedattach DIAG-GO);
zero file overlap. Master moved under the run: `97ff03342` → `3853257d6`
(journey r220/r221) → `a3462c4f2` (Loop A 0446Z) → `7d2de26f4`
(companionpool) → `7247ad515` (gatereach2, final tip).

Both arms are DIAGs on ONE shared fresh band, seeds **102001–102008**,
150d death-aware, policy competent verbatim, identical seeds both legs.
Band verified fresh by the coordinator before the run (zero hits in all
preregs; the full-evidence grep's only hits were `pantryFresh` kcal
values in Oct census JSONs, not seeds) and re-verified by both workers
in their preregs. Both arms re-land ONLY the vetparty seed call verbatim
(13 lines, blob `a66d45a5e`) as the subject-enabler and revert it after
measurement; both branches merge evidence-only, `src/` diff 0.

## Arm 1 — sim-companionpool-b (DIAG): GO — the pool fails on profile, not trust

Branch `sim-companionpool-b`, merged ff-only as `7d2de26f4` (rebased onto
`a3462c4f2` clean; proof 55/55 on the instrument tip, post-revert, the
rebased tip, and merged master). Evidence:
`evidence/2026-11-16/sim-companionpool-b.md` (+ prereg,
`companionpool-b-analysis.json`).

All four prereg bars pass: **196/196 plan-holder scored dawns
classified, unknown 0**; corpus 16/16 files parse; D1/D2 green + D3
drift smoke clean on all 8 seeds; proof `scripts/test-companionpool-b.js`
55/55. The answer, over 196 scored dawns / 1,430 roster-member checks:

- **notRanger 593 (41.5%)** — binding blocker on 91 of the 161
  empty-pool dawns. Of the 638 members who reached the profile check,
  93% were not rangers; only 45 were eligible.
- **away 400 (28.0%)** — binding on 54 empty dawns. (Away subsumes the
  expedition check in first-fail order, so `onExped` reads 0.)
- **trustLow / notAtHaven / engaged / onExped / dead: all ZERO as first
  fails.** 638 members reached the trust check, 0 below 15; 638 reached
  the node check, 0 off-node. The trust floor of 15 is not binding.
- Eligible pool empty on **82.1%** of scored dawns (161/196); histogram
  0:161, 1:25, 2:10, 3+:0.
- **Holders are never rangers: 0/196 ranger-holder dawns** (18 holders,
  all forager/homebody) — so even a full pool wouldn't launch them.
  Gate 1 and Gate 2 are the same population.
- Replica fidelity: ranked pick matched the real `findCompanion` pick on
  **35/35** bids. The two `findCompanion` definitions
  (villager-brain.js:129 = party_launch path; win-plan.js:177 = depart-gate
  twin) are eligibility-equivalent — documented in the prereg.
- **0 launches in 31 seeded plans**; buckets: launched 0, target-killed 1,
  selected-blocked 8 (all non-ranger `selected-not-executed`),
  candidate-not-bid 17, churned 5. Vasyl Shevchenko killed the Herald solo
  on day 93 (tripwire + field medicine, 3 rounds) — the plan closed
  target-killed the day it opened.
- Control leg opened 0 instances (27 seed calls, all bounced on
  target-null plans — 21/22 on seed 102007 hunt/target-null, 1 wave-3
  gavel).

Wall (instrument): national (standing ≥200) 4/8, table 0, wins 0,
wave-4 8/8, wave-5 4/8, median survival 146d. Control: national 2/8,
wave-4 7/8, wave-5 2/8, median 141d. (The seed call is a DIAG instrument,
reverted — do not read the leg difference as a lever effect.)

Next diagnostic named in the evidence: per-condition marginals (not
first-fails) via full per-member profiles in the pool row.

## Arm 2 — sim-gatereach2-b (DIAG): GO — the gate has one caller, and it never says yes

Branch `sim-gatereach2-b`, merged ff-only as `7247ad515` (rebased onto
`7d2de26f4` clean; proof 4/4 on the instrument tip, post-revert, the
rebased tip, and merged master). Evidence:
`evidence/2026-11-16/sim-gatereach2-b.md` (+ prereg,
`gatereach2-b-analysis.json`).

All five prereg bars hold: consultations classified 56/56 (unknown 0),
arrivals classified 98/98 (unknown 0), corpus 16/16, D1/D2 identical +
D3 CLEAN on all 8 seeds, proof `scripts/test-gatereach2-b.js` 4/4. (D3
needed Correction C2 in the prereg, before any verdict: first-lever-day
is the first wave-3+ seed, not wave-4+ — as first written it misread
pre-seed drift on 6/8 seeds; after the fix, CLEAN on all 8.)

- Consultations by path: expedition-launched 39, expedition-ordinary 17,
  **world-tick 0, aid 0**. The gate has exactly one caller
  (`expeditionMonster`), so world-tick and aid consultations are
  structurally zero. Rate 1.25 → 5.75 per seed with the seed call on
  (10 → 46 per 8-seed leg).
- Answers: `avoid:outmatched` 33, null 13, **`seek` 0 (both legs)**,
  `avoid:veteran-guard` 0. Of the 13 nulls: 9 wrong-target (plan doesn't
  name the beast), 4 trick-hold (right target, full party, trick unknown).
- Arrivals: **not-consulted 0 in both legs** — the arrival→consultation
  gap this DIAG hunted for does not exist. 8 launched parties fought
  together in the instrument leg (0 in control), all after null answers
  at party size 3, all ending evade/mFlee/vFlee — 0 kills.
- Only 2 wave-5 gate rows, both null: d112 Eamon vs Rerun (ordinary,
  4-round fight, vFlee) and d117 Wanjiru vs Editor (launched, evade —
  "Wanjiru saw The Editor in time and gave it room").
- Wall: national scale, final (scaleRank field) 0/8 both legs; table 0;
  wins 0; wave-4 7/8 → 8/8; wave-5 2/8 → 4/8; median survival
  141d → 146d.

Named next lever (in the evidence, prereg-ready GO bar included):
the launched party must arrive as 3 + trick known + plan naming the
beast — the gate's party-size, trick, and target bars are the binding
ones, not the launch count. Caveats: D1/D2 determinism at 60d ran over
zero gate rows (seed 102001 has none before day 60); the next proof
should run determinism at 150d on a gate-active seed. Arrival rows
double-count shared meetings (15 rows / 8 distinct control; 59 / 31
instrument); distinct counts are reported alongside.

## Coordinator reconciliation: national 4/8 vs 0/8 is a definition gap, not a trajectory gap

The two arms' wall tables disagree on national (companionpool 4/8
instrument, gatereach2 0/8). The gatereach2 worker flagged it; the
coordinator resolved it from the corpora before this evidence was
written:

- The trajectories are **identical** per seed (days, endReason, maxWave,
  scaleRank, standing all agree; e.g. seed 102001: 142d, survived, wave
  4, regional, 199 in both arms). No instrument-neutrality problem; D2
  holds.
- Companionpool counts national = end standing (raw) ≥ 200 → 4/8
  instrument (310/380/430/485), 2/8 control (505/470). This matches the
  tracker convention (dawnbid counted the same way: 480/450/535/400).
- Gatereach2 counts national = final `scaleRank` field == 'national' →
  0/8 both legs. The rank label reads 'regional' on all 8 instrument
  seeds even at standing 485, and on 7/8 control seeds even at standing
  505. The rank advances on a different event (link/covenant staging)
  than the standing total.
- Loop A's 0446Z run reports national BOTH ways too, and the two
  definitions disagree in the OPPOSITE direction there: profilegate
  scaleRank ≥2: 6/8, standing ≥200: 0–1/8. So the wall "national" number
  depends on which field you read, and the definitions diverge both
  ways across policies. One open findings item appended (see below).

**Coordinator wall for this run (tracker convention, standing-based):**
national 4/8 instrument (2/8 control), table 0, wins 0, wave-4 8/8,
wave-5 4/8, median survival 146d. The scaleRank-field count (0/8) is
footnoted wherever the wall number is cited.

## The wave-4 chain, decomposed end to end

Between dawnbid, profilegate, seedattach, and these two arms, every link
now has a measured decomposition on a named band:

1. **Seed** (vetparty/dawnbid): only attaches to an existing engagement
   plan; control legs open 0 plans.
2. **Seed-attach** (Loop A 0446Z, DIAG-GO): 8/10 target-null hunt plans
   were heard-at-fire and never had a beast; 82% of wave-4 flees (64/78)
   never reach a seed site at all — the world-tick path has no seed call.
3. **Dawn bid** (dawnbid): a bid is always selected when offered.
4. **Profile gate** (Loop A 0446Z, PILOT NO-GO): the fix works
   mechanically (2 real mid-day launches) but dawn selections die because
   holders are away as companions when their dawn arrives.
5. **Companion pool** (this run): profile binds 41.5% of checks, away
   28%, trust never binds; holders are never rangers.
6. **Launch**: 0 launches in 31 plans on this band (1 in 24 on dawnbid's).
7. **Gate** (this run): one caller, SEEK 0, `avoid:outmatched` dominant;
   nulls split wrong-target vs trick-hold.

No lever has moved any wall number on the competent legs. Wins still come
only through the default-OFF courtship + seat instruments of earlier
rounds; table 0 everywhere on competent legs.

## Wall (this run's judged corpora, 32 configs)

National (standing ≥200) 4/8 instrument vs 2/8 control; national
(scaleRank field) 0/8 both; table 0; wins 0; wave-4 8/8 vs 7/8; wave-5
4/8 vs 2/8; median survival 146d vs 141d. The leg differences are RNG
re-roll noise on a DIAG instrument, not a lever effect.

## Telemetry deviation check

Ran on both instrument-leg corpora (`node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-companionpool-b-on/*.json'` and the
gatereach2 glob, `--metrics national,table,wins,exiled`): **REFUSED both
by shape** (recorder rows, anchorCommit) — same pattern as
0115Z/1415Z/0315Z/0446Z. Baseline NOT rolled; no LOUD lines; no
investigation item.

## Infrastructure

- Registration slow under load (~21 min queued on the registry lock; the
  pre-flight reap took 15.8 min, 12/16 active, no removals — the 4 LOUD
  lines were Loop A's and the journey loops' live dirty trees, correctly
  never auto-removed).
- Safe-commit index clobber struck 4 of 5 companionpool commits and all 6
  gatereach2 commits — repaired via the ls-tree pipe each time, commits
  verified correct. No write-flap strike this run.
- Rebase dedup (both arms): each branch's seed-call/revert pair was
  skipped/dropped at rebase as already-upstream — Loop A's profilegate arm
  had landed the identical 13-line seed call (blob `a66d45a5e`) and its
  revert. Final branches are evidence-only, `src/` diff 0. The
  companionpool proof's one post-rebase 54/55 reading was a coordinator
  invocation error (default `COMPANIONPOOL_SEED_CALL=on` on a post-revert
  tree); re-run with `=off` gives 55/55, and 55/55 again on merged master.
- One coordinator exec was SIGTERM'd mid-release (~7 min in) after the
  gatereach2 merge + proof + registry release had completed; the worktree
  `.git` file was broken afterwards. Recovered with `git worktree repair`,
  then remove + branch delete clean. No content lost.
- `check.js --quick` NOT re-run: zero `src/js`, zero green-list files
  across both arms; both arm proofs green on merged master (55/55 +
  4/4). No balanced panel: DIAG, no game change; the prereg bar is the
  judge (same as dawnbid).
- The gatereach2 worker's one failed exec during its run (exit 1,
  recorded in its handoff) was a no-match grep, not a lost result; its
  verdict stands on its evidence.

## Sense-testing (coordinator read)

Companionpool: Vasyl Shevchenko's solo Herald kill on day 93 reads as a
real finish (tripwire + field medicine, 3 rounds) — the one plan that
closed target-killed. Gatereach2: the two wave-5 gate rows read as real
meetings (Eamon's 4-round Rerun fight; Wanjiru giving The Editor room).
Both arms' corpora otherwise show the chain's silence: parties that never
form, gates that never say yes, veterans whose deaths go unmarked (the
vetSays death-line silence, already logged by Loop A's arms today).

## Metric review

- The frozen DIAG bars held on both arms with no mid-run re-scoring. The
  companionpool instrument's first-fail ordering means `onExped` reads 0
  because `away` subsumes it — the next diagnostic should record
  per-condition marginals, not first-fails, so the expedition share is
  visible.
- The gatereach2 D3 Correction C2 (first-lever-day = first wave-3+ seed)
  was applied in the prereg before any verdict; as first written the smoke
  misread pre-seed drift on 6/8 seeds. The seed call wave-gates at ≥3, so
  any future drift smoke on this substrate must use the wave-3+ day.
- The national-definition gap (above) is a metric-review item for the
  NEXT run's prereg: name the field (standing ≥200 vs scaleRank) in the
  wall table, and report both when they differ, as Loop A's 0446Z run
  already does.

## Findings appended

- 1 open item: the wall "national" number depends on the field read
  (standing ≥200 vs scaleRank) and the two diverge in both directions
  across policies (this run + Loop A 0446Z). Pin the definition in the
  wall table.

## winnability chain stays converging (NOT converged)

The chain is now decomposed link by link with measured numbers at every
step, but no lever has moved a wall number: launches stay ~0, SEEK stays
0, wins stay 0 on competent legs. Next blanks, in order: (1) any-commit
launch definition + skip-reason recorder, then a re-preregistered
gate-fix test (Loop A 0446Z blank #1 — the fix is proven working
mechanically but unjudged under a correct metric); (2) the gate lever
(gatereach2's named next lever, prereg-ready): launched party arrives
as 3 + trick known + plan naming the beast; (3) companion-pool
marginals (companionpool's next diagnostic); (4) world-tick seeding as
a design call (0446Z: 82% of wave-4 flees never reach a seed site);
(5) rumor-born plans as a design call (0446Z: should a HavenTick
engagement via `villageSlain` alone carry a plan to `hunt`?);
(6) seasoning gate (0430Z blank #3, covenant road); (7) §14c watch on
100633; trick knowledge at the door (0430Z blanks #4–5); (8) answercourt
landing decision, competent seat-taking BUILD, family-7 program
decision (Steve-calls). scale-onramp stays converging (Loop A's 0446Z
recorded it; untouched here). food-economy stays converging (parked).
Claim deleted; lock deleted. Evidence: this file (commit pending).
