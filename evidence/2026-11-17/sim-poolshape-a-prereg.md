# sim-poolshape-a — PREREG (frozen before any judged sim)

**Arm:** sim-poolshape-a · **Loop A run:** fleshout-20261117T1535Z · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-poolshape-a` · **Worktree:** `~/workspace/worktrees/sim-poolshape-a`
**Base at arm start:** master at worktree HEAD (recorded by the driver per file:
`anchorCommit`; verify at analysis time against `git rev-parse HEAD`).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 recorded per corpus file (`policySha`).
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.

## The question (launchfunnel's named next blank 1)

sim-launchfunnel-a (band 103411–103418, census leg `vre`) ranked the launch
funnel's binding stage as the dawn bid via an empty companion pool:
candidate-not-bid 8/12 instances (66.7%), no-companion-party 7; over 87 scored
dawns, **81 had zero eligible companions (93%)**, 5 had 1, 1 had 2, 0 had 3+.
First-fail tally on pool rows: away 241, notRanger 198, selfOrScholar 174,
eligible 7. This arm decomposes that 93%: at each scored dawn, every living
non-self villager is classified eligible vs ineligible with a reason code,
and the empty pool is decomposed by the dominant reason per dawn, by
counterfactual relaxation (which single condition, lifted, fills the pool),
and by the away-flag-vs-node disagreement the poolmarginals finding named.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-launchfunnel-a.md` + prereg — the census this
  decomposes. Definitions reused verbatim: "scored dawn" = a `companionPool`
  row (part 0, wave-4+ plan holder, recorded in the `vbrainScorePick` wrap
  after the real call); pool distribution 81/87 empty; per-seed pool rows
  0/0/25/0/37/25/0/0 for seeds 103411–103418. **Replication target: my
  recorder must reproduce exactly 87 pool rows, 81 empty, same per-seed
  split, on the `vre` leg.**
- `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — marginals on band
  102131–102138: notRanger 819/1043 (78.5%), 592 alone; trust 14/1043, never
  alone; away 363, never alone; expedition members all rangers; eligible-0
  dawns 57.9%. This arm is NOT a re-run of those marginals on a new band:
  it adds (a) the per-dawn dominant-reason decomposition, (b) counterfactual
  single-condition relaxations, (c) the away-flag-vs-node disagreement
  counted separately, (d) the profile census of the non-ranger population,
  (e) the holder-profile split — all on the launchfunnel band so the numbers
  are directly comparable to 81/87.
- `evidence/2026-11-16/sim-companionpool-b.md` — first-fail picture this
  extends (same check order, same replica).
- Finding 2026-11-16 (poolmarginals): **18 members flagged away (`v.away`)
  while their node reads Haven.** This instrument states explicitly which
  read decides eligibility — the **away flag** (see §Reason codes) — and
  counts disagreements separately, never silently picking one.

## Canon read

- `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave law, readiness bars,
  trick-learning rule), `docs/PARTY.md` (party unlock day 7, cap 3→4→5,
  **no trust gate on invites** — trust affects acceptance, not System
  permission; betrayal runs on personality/goals/desperation/opportunity,
  trust deliberately NOT a factor).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility (who may walk the road as a companion), the
  away-flag semantics, or the ranger-profile gate on `findCompanion`.
  The reason codes below are grounded in the two `findCompanion`
  implementations (`src/js/villager-brain.js:129`, `src/js/win-plan.js:208`),
  not in canon.

## Band freshness (verified 2026-11-17, before this prereg)

Intentional same-band reuse of the launchfunnel band (103411–103418) so the
decomposition is directly comparable to the 81/87 census — same villages,
new recorder, not a new judged corpus. Search scope: (1)
`grep -rn "10341[1-8]" evidence/*/sim-*-prereg.md`; (2) goal
`hidden_files/lever-claims/*.json`; (3) goal
`hidden_files/convergence-tracker.md`.
Result: the band is named only by `sim-launchfunnel-a-prereg.md`,
`sim-part2night-a-prereg.md` (sibling arm, same Loop A claim, shared by
design), this run's own claim
(`hidden_files/lever-claims/fleshout-20261117T1535Z.json`, which names
103411–103418 for this arm and the sibling arm sim-part2target-a), and the
convergence tracker's 1415Z wall line (the same band's judged corpora —
consistent, not conflicting). **No other prereg names a conflicting use.
Reuse is by design, recorded here.**

## Reason codes (defined by the pool-scoring code — nothing invented)

Both `findCompanion` twins (`villager-brain.js:129`, party_launch path;
`win-plan.js:208`, depart-gate path) apply the SAME checks in the SAME
order; the decomposition is recorded against that definition. The dawn bid
itself (`winPlanCands`, villager-brain.js) additionally requires a companion
non-null AND stage in party/hunt/standing/table — gear-stage and
veteran-guard holders never reach the pool, and are reported as stage
splits, not pool rows.

| Code | Check (code order) | Meaning |
| --- | --- | --- |
| selfOrScholar | `cid === vid \|\| cid === villagerId` | Structural: holder + scholar. Excluded from every marginal population. |
| dead | `getPerson(cid).dead` | Dead member (poolmarginals: true 0 — roster prunes the dead). |
| away | `v.away[cid]` | **The away flag decides eligibility.** Checked BEFORE the node read; a flagged member is ineligible even if its node reads Haven. |
| trustLow | effective trust < 15 (undefined → 10) | Trust floor shared with party-wiring. |
| notAtHaven | `npcNode(cid)` ≠ village (px,py) | Not on the Haven tile. Node-null reads as not-at-Haven (same as the replica). |
| engaged | `isEngaged(cid)` | In a fight / committed elsewhere. |
| notRanger | `npcRangeProfile(cid)` not in {wanderer, explorer} | Wrong kind of person for the road, by profile. Profile-null reads as not-ranger (same as the replica). |
| onExped | `agencyState().exped[cid]` | Already out on an expedition. |
| eligible | passes all checks | In the pool. |

**Away-vs-node disagreement (counted separately, never silently resolved):**
`awayNodeDisagree` = away flag true AND node reads Haven (poolmarginals: 18
members); `nodeAwayDisagree` = away flag false AND node reads off-Haven
(poolmarginals: 0 — every off-node member was away). Both are counted per
dawn and pooled, alongside the eligibility the flag decides. If
`awayNodeDisagree` members were counted eligible by node instead of flag,
the eligible count would rise by exactly that number — reported as the
"node-read counterfactual" so the flag's cost is priced, not assumed.

**Not codes (the code checks nothing here, so they are not classified):**
age/too-young, combat ability/skill, role mismatch beyond profile, trust or
bond gates beyond the trust-15 floor, wounds/sickness. If the decomposition
shows a large residual that smells like one of these, it is reported as a
finding for the backlog, not coded as a reason.

## Instrument (reused hook + new analyzer)

- **Recorder:** `scripts/poolshape-driver-20261117.js` — a thin CLI over the
  launchfunnel instrument: it requires
  `scripts/launchfunnel-driver-20261117.js` as a module and calls its
  `oneRun(seed)` per seed per leg, writing
  `evidence/2026-11-17/perseed-poolshape-a-<leg>/poolshape-a-s<seed>-poolshape-a-<leg>.json`
  with `arm: 'poolshape-a'`. The dawn-scoring hook, the `poolReplica`
  (with the `members` extension: one entry per roster member, full profile
  read BEFORE the first-fail order is applied), the `vbrainScorePick` wrap,
  and the `companionPool` row shape are the launchfunnel instrument
  verbatim — so the recorder scores the SAME dawns by construction, and
  the replication check (87 rows / 81 empty / same per-seed split) proves
  it. Zero `src/js` changes; wraps are pure reads + driver-local writes,
  no game-state writes, no RNG. `POOLSHAPE_RECORDER=off` is not a separate
  flag: the `rec`/`rec0` legs set `LAUNCHFUNNEL_RECORDER=off` on the
  underlying module (same env the launchfunnel D2 leg uses).
- **Analyzer:** `scripts/analyze-poolshape-a.js` — reads the poolshape
  corpora (never the launchfunnel corpora, except the replication check,
  which reads both and diffs the pool rows). Outputs
  `evidence/2026-11-17/poolshape-a-analysis.json`.
- **Legs (four, one band, one driver):**

| Leg | VETREENGAGE | Recorder | Role |
| --- | --- | --- | --- |
| `off` | unset (0) | ON | Master-default pool (thin population expected; 0 instances on launchfunnel's off leg). |
| `vre` | `1` | ON | **Census leg (judged).** Seed-fed population; the decomposition is judged here. |
| `rec` | `1` | OFF | D2 full-band neutrality: trajectories must be identical to `vre`. |
| `rec0` | unset (0) | OFF | Pure-master recorder-off leg: the balanced-panel "before" (recorder OFF vs `off` recorder ON on master default). |

- **Panel builder:** `scripts/build-poolshape-panels-20261117.js` — copy of
  the launchfunnel panel builder, poolshape file names; before=`rec0`,
  after=`off` (pure recorder contrast on master default). Panel is the
  instrument, NOT the judge.
- **Proof test:** `scripts/test-poolshape-a.js` — determinism leg (D1),
  classification-coverage leg, neutrality leg (D2), replication leg vs the
  launchfunnel corpus.

## Primary metric (frozen)

**Share of scored dawns with zero eligible companions on the census (`vre`)
leg, decomposed by the dominant ineligibility reason per dawn** — plus the
counterfactual relaxation table and the away/node disagreement counts.
The verdict names the top reason with its share of empty-pool dawns and of
member-checks, and prices what each single-condition relaxation would buy.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **Classification completeness:** ≥95% of member-checks on the census leg
   carry a reason code (`firstFail` non-null, `members` array length ==
   rosterN on every pool row); 0 `unknown` rows; all files parse (8/8 per
   leg); 0 instrument errors on every file.
2. **Corpus + same-dawn replication:** census leg 8/8 seeds complete; pool
   rows reproduce launchfunnel's `vre` leg exactly — 87 rows, 81 empty,
   per-seed split 0/0/25/0/37/25/0/0. A mismatch is a NO-GO (the recorder
   did not score the same dawns), not a re-score.
3. **Decomposition produced:** per-dawn dominant-reason table, pooled
   marginal table, counterfactual relaxation table, away/node disagreement
   counts, profile census of non-rangers, holder-profile split — all present
   in `poolshape-a-analysis.json`, top reason named with share.
4. **Instrument validity:** proof test `scripts/test-poolshape-a.js` green;
   D1 repeatability + D2 wrap neutrality green (60d, seed 103411);
   D2 full-band: `rec` leg trajectories identical to `vre` leg on all 8
   seeds; `off` vs `rec0` trajectories identical on all 8 seeds (pure
   recorder neutrality on master default); D3 drift CLEAN (first divergence
   on/after first-lever-day, launchfunnel definition reused).
   `check.js --quick` green if run (scripts-only change; proof-covered).
5. **Balanced panel (§15):** `scripts/balance-panel.js compare` run on the
   `rec0`→`off` panels and attached as `poolshape-a-panel.{json,md}`
   (+ before/after `.json.gz`). Decision `no_material_signal` expected on
   every contract metric (recorder-only); any other decision is reported
   with a verdict, not hidden.

## Decomposition definitions (frozen)

- **Scored dawn:** a `companionPool` row (part 0, wave-4+ plan holder).
  87 on the census leg per the replication target.
- **Dominant reason per dawn:** among living non-self members, the reason
  code with the largest count under the pooled marginal reading (each member
  counted once per condition it fails — NOT first-fail order, so a dawn's
  dominant reason is the condition that blocks the most people, ties named
  explicitly). Also reported under first-fail order for comparability with
  launchfunnel/poolmarginals.
- **Counterfactual relaxation (per dawn, from the `members` arrays):**
  recompute eligibility dropping exactly one check — relax-profile (any
  profile passes), relax-away (away flag ignored, node still applies),
  relax-node (node ignored, away still applies), relax-trust (floor
  ignored), relax-engaged, relax-onExped — and report mean eligible, and
  how many empty-pool dawns become non-empty, per relaxation. The
  node-read counterfactual (eligibility by node instead of flag) is the
  away-disagreement price, reported alongside.
- **Profile census:** `npcRangeProfile` values over non-ranger members
  (pooled + per empty-pool dawn), so the "wrong kind of person" has a name.
- **Holder split:** ranger-holder dawns (holder profile wanderer/explorer)
  vs non-ranger-holder dawns, empty-pool share each.
- **Stage split:** scored dawns by plan stage (gear / party / hunt /
  standing / table), so gear-stage and veteran-guard holders are visible
  as never-reaching-the-pool, not as pool rows.
- **Wall numbers** (reported every run, both national definitions): wins,
  national by scaleRank ≥ 2, national by standing ≥ 200, table seats,
  wave-4 unlocked, wave-5 unlocked, median survival, total deaths,
  starvation deaths — per leg (off / vre / rec / rec0).

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launch-adjacent or holder-morning scene the corpus carries (a holder asking
for a companion and finding nobody, or the one dawn where the pool is
non-empty and the bid fires). Judge meaning, coherence, consequences —
never just counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `members` snapshot is read AFTER the real `vbrainScorePick` call
   returns (launchfunnel hook shape) — a same-tick departure between the
   scorer's `findCompanion` read and the replica's read would show as a
   replica/real disagreement on the `agree` field; any `agree: false` row
   is investigated by hand and named (launchfunnel: 0 such rows reported
   on the census leg — the analyzer verifies).
2. `npcRangeProfile` is the profile the code reads; what makes a villager
   a wanderer vs a forager (occupation, history, assignment) is upstream
   of this instrument — the census names the profiles, it does not explain
   how they are assigned.
3. The away flag's semantics (why it lingers after return, if it does)
   are not observable from the pool rows alone — the disagreement count
   prices the flag, it does not explain it.
4. The `off` leg is expected to carry ~0 pool rows (launchfunnel: 0
   instances, 0 scored dawns) — that thinness is a stage-0 finding, not a
   missing population; the decomposition is judged on the `vre` leg.

## Files

- Prereg: `evidence/2026-11-17/sim-poolshape-a-prereg.md` (this file)
- Instrument: `scripts/poolshape-driver-20261117.js`,
  `scripts/analyze-poolshape-a.js`, `scripts/build-poolshape-panels-20261117.js`,
  `scripts/test-poolshape-a.js`
- Corpora: `evidence/2026-11-17/perseed-poolshape-a-off/`,
  `perseed-poolshape-a-vre/`, `perseed-poolshape-a-rec/`,
  `perseed-poolshape-a-rec0/` (8 files each)
- Analysis: `evidence/2026-11-17/poolshape-a-analysis.json`
- Panel: `evidence/2026-11-17/poolshape-a-panel.{json,md}` (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-17/sim-poolshape-a.md`
- `src/` diff: 0 lines (DIAG, recorder wraps only, reused verbatim).
