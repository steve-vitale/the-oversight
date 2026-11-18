# sim-notickexact-a — PREREG (frozen before any sims)

**Arm:** sim-notickexact-a · **Loop A run:** fleshout-20261118T0647Z (continued) · **Axis:** scale-onramp
**Type:** BUILD (finding #2498 fix candidate — EXACT-population no-tick deferral).
**Branch:** `sim-notickexact-a` · **Worktree:** `~/workspace/worktrees/sim-notickexact-a`
**Base at arm start:** `03c53bf6e` (master; coordinator round-0441 closeout).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
— verified against the file in this tree before writing this prereg.
**Bands:** fresh 103541–103548 (8 seeds; freshness check below).
**Horizon:** 150d death-aware.
**Prereg frozen:** before any sim runs in this arm (baseline leg first, fix
applied only after the baseline corpus is on disk).

## The question (finding #2498 — the no-tick edge, EXACT-population fix candidate)

sim-notick-a (DIAG GO, 17/17 classified) traced what happens after a
part-3 `party_launch` commit with no tick left to execute: the commit
evaporates overnight, the plan re-bids or departs within two days, 0 plans
stall, 0 attributable harm. The demonstrated cost is one lost part-3 action
(an indoor hold instead of the core pick) per late bid. Two deferral
scopings are already CONCEPT-DEAD:

- sim-notickfix-a (part-≥2 deferral): primary 8 → 0, but 428 deferred bids
  reshuffled trajectories from day 17 and cost one wave-4 launch event
  (18 → 17).
- sim-notickfix3-a (part-3-only deferral): primary 14 → 0, but 97 deferred
  bids, wave-4 launch events 48 → 2, median survival ratio 0.759,
  starvation 5 → 8. CONCEPT-DEAD for the deferral shape in both scopings.
  Its verdict names the next blank: scope to the EXACT no-tick population
  (not every late bid) or accept the hold as the price of a stable
  trajectory.

This arm builds the revision named there: **EXACT-population deferral** —
defer a `party_launch` commit ONLY when the holder literally has no tick
left to depart at commit time, i.e. ONLY the population the diag measured.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-notick-a.md` + prereg — the source numbers.
  17 no-tick selections traced, all part-3, 0 stalls, 0 silent drops.
- `evidence/2026-11-17/sim-notickfix-a.md` + prereg — the dead part-≥2 arm.
  Baseline (band 103521–103528, PROFILEGATE=1): 8 no-tick selections,
  14 late commits (2 launched same-day), launched instances 3, wave-4
  launch events 18, median survival 117.5d, starvation 5. Armed: no-tick 0,
  launched instances 3, wave-4 events 17, 428 deferred bids, median
  137.5d, starvation 3, panel `review_required`. BUILD NO-GO,
  CONCEPT-DEAD (part-≥2 shape). Its `src/` fix MUST NOT be re-applied.
- `evidence/2026-11-17/sim-notickfix3-a.md` + prereg — the dead part-3-only
  arm. Baseline (band 103531–103538, PROFILEGATE=1): 14 no-tick selections,
  34 late commits (2 launched), launched instances 7, wave-4 launch events
  48, median survival 145.5d, starvation 5, survivors 4/8. Armed: no-tick
  0, launched instances 1, wave-4 events 2, 97 deferred bids, median
  110.5d (ratio 0.759), starvation 8, survivors 0/8, panel
  `review_required`. BUILD NO-GO, CONCEPT-DEAD (part-3-only shape). Its
  `src/` fix MUST NOT be re-applied or landed.
- `scripts/analyze-launchdef-a.js` `classifySeed` — the frozen
  `no-tick-after-commit` rule: no depart row, no skip row, no midday
  overwrite, last commit part >= 2. A `no-tick-after-commit` resolution is
  a *selection-day* fact. Instances open only from v4seeds rows with
  wave >= 4 and stageAfter in {gear, party}.
- `evidence/2026-11-17/sim-profilegate-b.md` + prereg — ON-leg wall
  (quoted): national standing 1/8, national rank 0/8, table 0, wins 0,
  wave 4 unlocked 8/8, wave 5 unlocked 1/8, median survival 116.5d
  (OFF 147.5d). The PROFILEGATE lever is REVERTED in this base; both legs
  of this arm re-apply it in-tree only (see Legs below) and revert it
  before commit. Net `src/` diff vs base must be exactly the fix (one
  file, `src/js/villager-brain.js`) at the end of the arm.

## Canon read

- `docs/CANON.md` (manifest), `docs/VILLAGER-BRAIN.md` (one brain, one
  scorer; §5: re-scoring inside the day happens only on a
  perception-changing event; the commitment record is the arbiter's
  memory), `docs/PARTY.md` (party unlock day 7, cap 3→4→5 — the player
  party system, not the villager-brain launch path),
  `docs/MONSTER-WAVES.md` (wave law: wave 4 The Mirror Draft, standing
  >= 100; wave 5 The Producers, standing >= 200 AND wave-4 faced).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility, the depart-gate block reasons, or the
  no-tick-after-commit scheduling edge. Same gap selblock-a, notick-a,
  notickfix-a, and notickfix3-a recorded. The deferral below is grounded
  in the commit mechanism, not in canon.

## Band freshness (verified before this prereg)

- Candidate band 103541–103548: `rg -l '10354[1-8]'
  evidence/*/sim-*-prereg.md` = 0 files (no prereg names it);
  `rg -l --no-ignore -g '*.md' '10354[1-8]' evidence/` = 0 files (no
  dated evidence .md anywhere names any seed in the band); a full-tree
  `rg '103541|...|103548' evidence/` hits only incidental numbers inside
  analysis/corpus JSON — `103544` twice in
  `evidence/2026-11-16/launchsurvive-a-analysis.json` and once each in
  the profileshadow/launchsurvive per-seed files, `103543` twice in
  `evidence/2026-10-30/sim-recorderfix-a-leanlink.json` — all RNG-state /
  trajectory values, not seed assignments; the longer numbers
  `1035444`, `103545617`, `1035432732` are substring matches, not the
  seeds. No prereg, forbidden list, screen, or extension band names any
  seed in 103541–103548. Do NOT reuse 103441–103448, 103521–103528, or
  103531–103538. **The band is fresh.**
- Other named bands in preregs, for the record: 103101–103108,
  103201–103208, 103211–103218, 103221–103228, 103231–103238,
  103241–103248, 103411–103418, 103421–103428, 103431–103438,
  103441–103448, 103501–103512, 103521–103528, 103531–103538,
  103601–103608, 103801–103812, 103001–103008, 103011–103018,
  103021–103028, and the checked-but-unused 103451/103461/103471/103481/
  103491.

## The exact population (measured pre-run — the gate's calibration)

Before writing this prereg, the frozen classifier + a read-only
decomposition (`scripts/notickexact-gap-decompose.js`, committed with this
prereg) were run over the notickfix3 BASELINE corpus (band 103531–103538,
PROFILEGATE=1, extracted from branch `sim-notickfix3-a` — no sims in this
arm). The gap between the fix3 footprint and the diag population, on the
identical seeds:

- Part-3 `party_launch` PICK rows (fix3's footprint population): **118**
  on the baseline leg (97 on its armed leg — trajectories diverged).
- Decomposed by the plan on the score row (`r.plan` = {stage, target,
  needWave, party}):
  - needWave null, target null (targetless hunt/party/standing plans):
    **88** rows (77 hunt, 9 party, 2 standing).
  - needWave 3, target set (wave-3 targets): **15** rows (8 hunt, 7 party).
  - needWave 4, target set (wave-4 targets): **15** rows (8 hunt, 7 party).
- Frozen classifier `no-tick-after-commit` selections on the same corpus:
  **14**, one per (vid, target, day), each with exactly one part-3 pick
  row that day. All 14 are needWave 4, target set — 8 in stage `hunt` at
  score time, 6 in stage `party` at score time.
- The 15th wave-4 row (seed 103537, david_kim → reunion, d120, stage
  party) resolves `blocked/night`, not `no-tick-after-commit`: a skip row
  exists that day (the night tick recorded the block). Same no-tick
  mechanism, different classifier reason — the commit had no tick left
  either way, and deferring it is correct on the same grounds.

Consequences frozen into the gate below:

1. **Stage is NOT gated.** No-tick selections occur in both `hunt` (8)
   and `party` (6) stages at score time. Gating on stage ∈ {gear, party}
   (the classifier's *instance-opening* rule, which reads the seed row's
   stageAfter, not the score-time stage) would wrongly exclude
   hunt-stage no-tick selections.
2. **Wave IS gated, on the plan's needWave at score time** (needWave ≥ 4),
   and **the plan must have a target**. That is the whole narrowing:
   118 → 15 rows on the calibration band (14 classifier no-tick + 1
   night-skip). Expected footprint on the fresh band: ~8–15; frozen cap
   20.
3. **No same-day dedup is added.** On the calibration baseline, each
   (vid, target, day) carries exactly one part-3 pick row (118 rows =
   118 commit-days), and the fix3 armed leg shows no inflation from
   re-picks (97 < 118). If the armed leg's footprint exceeds the cap
   with same-day duplicates, that is a NO-GO with a named mechanism
   (re-pick duplication), not a re-score — the dedup is the next arm's
   design question.

## Fix shape (frozen — the only game-code change)

In `vbrainScorePick` (`src/js/villager-brain.js`, at the commit write at
line 979 — OUTSIDE the sibling-owned lines 621–704), when the winning
pick (`logged`) is a `party_launch` override
(`logged.winPlanAction === 'party_launch'`) AND the current day-part is
exactly 3 (`partOf(this) === 3`) AND the holder's current win-plan
(`this.state.village.winPlan[vid]`, read the same way `winPlanCands`
reads it) has a target (`plan.target != null`) AND needWave ≥ 4
(`(plan.needWave | 0) >= 4`):

1. Do NOT call `writeCommit` — no commit is written for that pick.
2. CLEAR any earlier same-day commitment for that vid (`delete
   br.commit[vid]`). The recorder reads the commit map after the score
   call, and the frozen classifier counts a selection from any score row
   whose recorded commit carries `party_launch` — a stale same-day
   (part-0/1/2) commit left in the map would be read as today's commit
   and the deferral would be invisible to the instrument. Clearing is
   also the game-correct half of the deferral: the latest scoring
   decision is "not now", so no live instruction may execute at a later
   tick or be read as today's commit; a part-2 commit cleared this way
   has already had its one launch chance at the part-2 agency tick.
   (Measurement note, carried from fix3: clearing can also remove a
   dawn commit for a DIFFERENT target — e.g. the calibration band's
   david_kim d120, dawn commit for `eater` cleared when the part-3
   re-score re-picked for `reunion`. That dawn commit had already failed
   its launch chances (range-0 block); no launch is lost, but the
   classifier loses one blocked resolution for the earlier target. The
   launch-event counts — the bars' judge — are unaffected, since no
   launch happened.)
3. Mark the log entry (`entry.deferred = 'party_launch:no-tick-exact'`)
   so the score log explains why there is no commit.
4. The scorer still returns the CORE pick (`materialize`), and
   `vbrainAlignObjective` finds no commit and returns the objective
   unchanged — the villager does their core pick (e.g. forage) instead
   of the indoor EXPEDITION hold. That is the recovered action: one
   part-3 core pick per deferred bid.
5. `clearPerception` is NOT called (it lives inside `writeCommit`) — the
   perception event that authorized the re-score stays authorized, so a
   later re-score the same day can re-pick and defer again, or pick
   something else. No RNG is consumed or skipped by the deferral (the
   core lottery draw already happened; `writeCommit` draws no RNG; the
   voice lines draw no RNG), so trajectories are identical until the
   first deferred pick.

Why part-3-only is launch-safe (mechanism, read from code, same as the
dead arms' preregs): `agencyTick` (`src/js/villager-agency.js:357-...`)
runs once per day-part and its resident loop skips the whole depart path
when `isNight()` — and `isNight()` is `dayPart === 3`
(`src/js/game.js:20530`). `vbrainExecuteDepart` has exactly one caller
(the agency tick, `:438-439`). A part-3 commit can never launch: no tick
runs after a part-3 score before dawn, and the part-3 tick itself is
night and skips departures. Part-2 commits are left untouched (2 of 14
baseline late commits launched same-day in the dead arm's baseline leg).

Why wave-4-targeted only (new in this arm): the diag's measured
population is wave-4+ instances — the classifier opens instances only
from v4seeds rows with wave ≥ 4. Wave-3 plans and targetless hunt plans
re-bid `party_launch` at part 3 too, but no traced no-tick selection
belongs to them, and deferring them is exactly the broad footprint that
killed both prior scopings (428 and 97 fires). The gate fires only where
the diag measured contact.

NOT changed (named so a reviewer can verify the diff is only the
deferral): `firstNameOf`, the homebody (#2499) and holder (#2505) voice
lines (lines 621-704 — sibling arm owns them; if the edit must cross
into that region, STOP and report instead of conflicting),
`vbrainExecuteDepart` (still returns `'normal'` for a stale commit), the
`findCompanion` twins (except the temporary PROFILEGATE bypass, reverted
per leg — see Legs), `win-plan.js`, and every other file. This changes
villager behavior (a late bid no longer strands the holder on an indoor
hold), so the game-code commit carries `[needs-eyes]`.

Fixture note (Steve 2026-11-13 encounter-gear rule): this arm stages no
fight fixture of its own — the verdict turns on launch/trajectory counts
from the competent-policy sims, not on whether a staged fight is
winnable. The competent policy is the verbatim player proxy every prior
arm in this line used; no fresh un-geared solo scholar is staged
anywhere. The balanced panel stages its own fixtures per its contract.

## Legs (frozen — order matters)

Both legs carry VETREENGAGE=1 (the seed call plants the funnel) and
PROFILEGATE=1 (the widened gate — the no-tick population only exists in
meaningful numbers under it; on pure master the funnel has 0 instances).
Both run the driver verbatim, recorder ON, 150d, competent policy, seeds
103541–103548:

- **BASELINE (control):** PROFILEGATE bypass re-applied in-tree (the
  exact profilegate-b change — skip the profile check
  `if (prof !== 'wanderer' && prof !== 'explorer') continue;` in the two
  `findCompanion` twins, `src/js/villager-brain.js:150` and
  `src/js/win-plan.js:226`, when `PROFILEGATE=1`, via a `profilegateOn()`
  helper mirroring `vetreengageOn()`), NO fix.
  `VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-notickexact-a-base
  SEEDS=103541,...,103548 RUN=notickexact-a node
  scripts/profilegate-driver-20261117.js`. Bypass REVERTED after the leg;
  `src/` verified clean vs the prereg commit before the fix is applied.
- **ARMED:** PROFILEGATE bypass re-applied in-tree the same way, + the
  fix. Same command with `OUTDIR=perseed-notickexact-a-armed`. Bypass
  reverted after the leg; `src/` diff vs base must be exactly the fix
  after revert.

**Why PROFILEGATE=1 both legs (read from the dead arms' preregs and
carried verbatim):** the no-tick population only exists in meaningful
numbers under the widened gate — on pure master the funnel has 0
instances, so a pure-master baseline cannot stage the contact the
primary bar needs. The driver is PROFILEGATE-aware (poolReplica mirrors
the gate), and the bypass is the exact profilegate-b change, re-applied
in-tree per leg and reverted after, so the committed `src/` diff is
exactly the fix.

**D-checks (instrument validity, run in this arm on the ARMED tip):**
- **D1 repeatability:** seed 103541, 60d, recorder ON, PROFILEGATE=1,
  run twice (`perseed-notickexact-a-d1a` / `-d1b`, scratch, deleted
  after comparison): trajectories identical.
- **D2 wrap neutrality:** same seed/days, recorder ON vs recorder OFF
  (`PROFILEGATE_RECORDER=off`, `MODE=rec`) on the armed tip:
  trajectories identical (0 divergences). Same frozen profilegate-b D2
  shape. Caveat carried from notick-a: at 60d the funnel has not started,
  so D1/D2 prove trajectory identity, not depart-recorder exercise.

## Instrument (reuse, do not rebuild)

- **Driver:** `scripts/profilegate-driver-20261117.js` verbatim (both
  legs; OUTDIR/RUN as above).
- **Classifier + tracer:** `scripts/analyze-launchdef-a.js`
  `classifySeed` (frozen) via `scripts/analyze-profilegate-b.js`
  `funnelForSeed`, and `scripts/analyze-notick-a.js` `analyzeDir`
  (frozen) run over BOTH corpora — it counts no-tick selections, late
  commits (part ≥ 2), and same-day launches per leg with no
  re-classification. A new thin wrapper
  `scripts/analyze-notickexact-a.js` (kept, committed — a copy of the
  dead arm's `scripts/analyze-notickfix3-a.js`, re-pointed, not edited in
  place on its branch) runs the tracer over both legs and prints the
  before/after comparison the GO bars judge (no-tick counts, launched
  instances, launch events, cost bar, footprint cap, trajectory control
  — see Proof test). Its `deferredBids` counts score rows with pick
  `party_launch` + commit null + part **=== 3** AND plan target set AND
  plan needWave ≥ 4 (the exact-population footprint; the dead arms
  counted part === 3 regardless of plan, and part ≥ 2 before that).
- **Panel builder:** new `scripts/build-notickexact-panels-20261117.js`
  (kept, committed), a copy of
  `scripts/build-notickfix3-panels-20261117.js` re-pointed at the two
  notickexact corpora (before=base, after=armed, seeds 103541–103548,
  pseudo-policy `notickexact-a`, RUN=notickexact-a). Compare with
  `node scripts/balance-panel.js compare --before
  <base-panel.json.gz> --after <armed-panel.json.gz> --out <prefix>`;
  attach the compare `.md` to the evidence file.
- **Proof test:** `scripts/test-notickexact-a.js` — deferral unit checks
  (exact-population held, wave-3 pick still writes, targetless pick
  still writes, part-2 writes, part-0/1 still write, a launchable commit
  still launches, gap-decomposition reproduction on the calibration
  corpus) + corpus legs (below). Must be green. Never run concurrent
  jest; use `--cacheDirectory=/tmp/jest-cache-sim-notickexact-a` where
  jest applies (this proof test is a plain node script, like its
  predecessors).

## Primary metric (frozen)

**No-tick-after-commit instances on the armed leg vs the baseline leg on
identical seeds** — counted by the frozen classifier + tracer over the
two 8-seed corpora (PROFILEGATE=1 both legs). Contact precondition: the
baseline leg must stage ≥ 1 no-tick selection, else the pilot cannot
judge the fix (verdict NO-GO, SUBSTRATE-MISSING per MEASUREMENT §14a —
the band staged no no-tick commits; not a GO, not a re-score).

## Secondary metrics (frozen)

- **Launches not reduced:** launched instances (any-commit, frozen
  classifier) armed ≥ 90% of baseline; wave-4+ launch events
  (`dawnbidDeparts` rows with `result === 'launch'`) armed ≥ 90% of
  baseline. (Parent bar: "launches ≥ 90% of baseline", applied to both
  launch measures; "wave-4 launches not collapsed" is the events half
  of the same bar.)
- **Deferred bids visible:** score rows on the armed leg with
  `pick.winPlanAction === 'party_launch'`, `commit == null`,
  `part === 3`, plan target set, plan needWave ≥ 4 — the deferral's own
  footprint. Must be ≥ 1 (the fix fired at least once) and ≤ 20 (the
  frozen footprint cap — the diag population is ~8–14 on a band; if it
  fires > 20 the scope is wrong).
- **Trajectory control (fix rule (b) from notick-a, carried over,
  corrected per the dead arm's Correction 2):** no trajectory delta
  before the fix's first effect — compare the two legs' per-seed `daily`
  snapshots; the first diverging day per seed must be ≥ that seed's
  first deferral day on the armed leg (the fix's own footprint record),
  or no divergence when the seed has no deferral. The fix consumes no
  RNG and changes no draw before the first deferred pick, so this must
  hold exactly.

## GO bars (frozen — a miss is NO-GO, never re-scored)

**BUILD GO** iff ALL of:
1. **Primary:** armed no-tick instances = **0** (and baseline ≥ 1, the
   contact precondition).
2. **Launches held:** launched instances armed ≥ 90% of baseline AND
   wave-4+ launch events armed ≥ 90% of baseline.
3. **Footprint cap:** deferred bids armed ≤ **20** (and ≥ 1). If it fires
   > 20 the scope is wrong — stop and report, do not re-score.
4. **Cost bar (scalemetric):** starvation totals armed ≤ baseline + 2
   AND arm-only starvation deaths armed ≤ baseline arm-only + 2 AND
   median survival armed ≥ 0.8 × baseline median.
5. **Panel:** the balanced-panel compare status is not
   `regression_signal` (the panel is the instrument; the corpus cost bar
   above is the judge — a `regression_signal` alongside a passing cost
   bar is a same-run investigation item, and the run does not go GO until
   it is explained in the evidence).
6. **Instrument D-checks green:** D1 repeatability green, D2 wrap
   neutrality green (60d, seed 103541, armed tip).
7. **Trajectory control:** first divergence day per seed ≥ first
   deferral day on the armed leg (or no divergence when the seed has no
   deferral), all 8 seeds.
8. **Proof test green:** `scripts/test-notickexact-a.js` passes all
   checks (deferral units + corpus legs C1–C10).

A miss on any bar is BUILD NO-GO. The verdict judges the FIX, not the
game: a NO-GO fix is reverted (no `src/` change lands) and the evidence
records the kill classification per MEASUREMENT §14a.

## Corrections

### Correction 1 — corpus dated parent is evidence/2026-11-17/ (before any sims)

The frozen driver `scripts/profilegate-driver-20261117.js` hardcodes its
output parent as `evidence/2026-11-17/` (line 1139, no override) and
records that path in each per-seed JSON's `file` field. The prereg's
"Legs" and "Instrument" sections named the OUTDIRs without a dated
parent; the corpora therefore land in
`evidence/2026-11-17/perseed-notickexact-a-base/` and
`evidence/2026-11-17/perseed-notickexact-a-armed/`, NOT in 2026-11-18/.
Moving them after the run would leave a stale `file` field in every
corpus file, so they stay where the driver wrote them. All judgment
files (prereg, analysis JSONs, panel, evidence, proof test) live in
`evidence/2026-11-18/` as frozen. The analyzer, panel builder, and
proof test corpus paths are re-pointed to 2026-11-17 accordingly. No
metric, bar, band, or horizon changes — paths only.
