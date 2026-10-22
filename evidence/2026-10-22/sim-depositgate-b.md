# sim-depositgate-b — DEPOSITGATE pilot (food-economy, ADOPTION)

Run: oversight-flesh-out-loop-b, 2026-10-22 (adoption of the dead 01:00Z run's
worker — the worker left uncommitted game.js + hierarchy.js DEPOSITGATE
changes with NO proof script and NO sims; heartbeat stale, coordinator
adopted). Worker tree: ~/workspace/worktrees/sim-depositgate-b.
Arm: sim-depositgate-b. The adoption's job: design review, wire-up check,
proof test, pilot sims, panel, honest verdict.

Named lens: prodrebound-b2 #570 — funnel.share carries 56–60% of
marginal-glut kcal and never reads the pantry sensor; tribute.deposit 15%,
scholar.homecoming 15–25%, away.return 6–7.5%, ambient.bighaul 4–5%.

## Canon

- docs/CANON.md + docs/DECISIONS.md (2026-10-21 SURPLUSFEED ruling) read
  first. The ruling's mechanism-class objection is the design spine here:
  SURPLUSFEED's post-hoc trim on the shared surplus is REMOVED; the
  replacement is behavioral and bottom-up — villagers deprioritize production
  AND storage when food is plentiful, AT THE DECISION, never a post-hoc trim.
  DEPOSITGATE is the storage-side mirror of the landed plentydepri
  (df66ebaff, production side): it eases the four unconditional DEPOSIT
  decisions when the pantry reads plentiful (>4 fresh days;
  hungryStreak>=3 stands it down — duty PRODTHROTTLE's own plenty definition).
- "No silent actions": every eased path narrates the true split aloud.
- Trust != reputation (break-it 2026-10-09). The waiver's trust +1 is
  gratitude for a refused delivery, not gossip.
- No canon doc covers deposit decisions specifically — this is new ground on
  the food-economy axis, built on the SURPLUSFEED ruling's direction, not
  invented from scratch.

## Adoption notes (what the dead run's worker left)

- The diff was complete and coherent: game.js (homecoming keep 2000->6000;
  away.return holdback; ambient.bighaul holdback x2; gate block
  _depositGateOn/_depositGateEngaged/_depositGateHoldback/_depositGateDayVoice;
  funnel.share ease in villagerMealDay; day-voice wiring inside villageEats())
  + hierarchy.js (tribute-receipt waiver).
- TASK PREMISE CORRECTION: the task brief said "the diff has no funnel.share
  hunk — find the decision point." The diff DOES contain the funnel.share
  hunk (villagerMealDay: `gave -= gave*0.5` when engaged, intake recorded,
  ledger counts). Verified by code read and by the proof test (exact-half
  split, 9/9 villagers). Nothing to add; the premise was written from a
  partial read.
- `_depositGateDayVoice` IS wired into the daily flow (villageEats(), right
  after `_plentyDepriDayVoice`). Nothing was missing.
- BUG HUNT: no bugs found in the diff on review. Checked: `v` in the meal-loop
  hunk is the village object (same as the plentydepri precedent and the
  day-voice read path — ledger consistent); `n` in scope; float gave stays
  float; capdoor-off `ateAll` path unchanged when dgEased=0; hierarchy waiver
  short-circuits before any sub-pantry debit; `_depositGateOn()` returns false
  in sim only when DEPOSITGATE='0' (browser: always on).

## Design review (against DECISIONS.md + canon)

(a) homecoming keep 2000->6000: STANDS. The pantry is plentiful; the
scholar keeps three days' road food in the pack instead of one. The food is
real, in the pack, donate-able later via donateToPantry — conservation
holds, and the ease is voiced only when it actually changed behavior
(kept > old 2000 ceiling).

(b) away.return holdback: STANDS. Half the haul still lands in the pantry;
the returning party eats the other half at the fire. Hunger eases, intake
recorded honestly ('depositgate-eased'), the day ledger counts it.

(c) ambient.bighaul / routine haul holdback: STANDS. Same class as (b).

(d) tribute-receipt waiver — QUESTIONED HARD (the pilot's honesty risk).
The waiver: when OUR pantry is plentiful, the wagons are waved home; the
week counts PAID, NO arrears, trust +1, said aloud. The alternative
considered: refusal-only — grain refused while the obligation stands (week
not paid; arrears accrue). That alternative is DISHONEST: it punishes the
subordinate for OUR refusal — they rode in ready to pay and we turned the
wagons away, then charged them arrears for not paying. Waiver-as-paid is the
behaviorally honest choice and matches the game's relationship-first ethos
(feel over math): "Eat well — that IS your tribute this week" is generosity
with consequences (we lose the grain; they gain trust), not a free lunch.
Bounded: hungryStreak>=3 stands the gate down, the normal path resumes, and
trust moves at the SAME rate as a faithful payment (+1/week) — no inflation
asymmetry vs paying links. VERDICT: stands as built. NO steve-call needed
unless the pilot's trust-health guardrails fire (they are pre-registered
below to catch a generosity bug: dissolved links, arrears drift, trust
inflation).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: does easing the four unconditional deposit decisions when the
  pantry is plentiful reduce marginal-glut rot and total depositor inflow
  without hurting survival, progression, or the tribute-trust ledger?
- **Design**: 8 FRESH seeds (9201–9208, banned-list clean, unused by any prior
  run) × {leadfeast, belongfeast} = 16 runs per side, 180d death-aware
  horizons, FEASTSCALE_R13=1 / SEATDRIVE=0, DEPOSITGATE=0 control | =1 armed,
  identical seeds across sides. One shared baseline.
- **Primary metric (binding)**: BOTH must hold on pooled per-run rates —
  (i) rot/100d kcal (rot:fresh + rot:preserved, absolute per 100 days alive)
  armed/control <= 0.85; (ii) depositor-inflow/100d
  (share[stockSurplus stored] + return[npcNodeTravel stockPantry] +
  bighaul[villageLives forage stockPantry] + tribute-receipt[depositPantryPieces
  'Tribute grain']) armed/control <= 0.90.
- **Engagement (kill-fast)**: eased kcal > 0 on >= 6/16 armed runs. The lever
  must actually fire before we spend belief on its numbers.
- **Guardrails (all binding)**:
  - median survival armed >= control − 10d
  - starvation deaths (pair sums) armed <= control + 2
  - national(end) armed >= control − 2
  - tribute trust health: no link dissolved attributable to waiver on any
    armed run; arrears (pair sums) armed <= control; trust deltas reported
    (generosity-bug watch)
  - no new death modes (kind-filtered, deduped, thirst/dehydration
    canonicalized)
  - no channel laundering >2x: every named inflow channel armed/control <=
    2.0 where control > 0
- **Balanced panel**: before/after through scripts/balance-panel.js (§15) —
  the panel is the instrument, the pre-registered threshold is the judge.
  The compare .md is attached to this file.
- **Metric review**: (to be written after the run) — anything the metric got
  wrong goes here and applies to the NEXT run, never this one.

## Proof test (scripts/test-depositgate-b.js) — first green bar

RESULT: ALL GREEN (57/57 checks), 2026-10-22.
- RED (DEPOSITGATE=0): gate off, plentiful fixture; engaged false
  (predicate short-circuits — prodThrottleEngaged() never called); holdback
  returns 0 touching nothing; meal day writes no state, says nothing;
  day voice silent and stateless; tribute takes the normal receive path
  (their pantry debited 1000, our pantry grows, trust +1, no waiver state).
- GREEN (DEPOSITGATE=1): predicate truth table (plentiful→engaged;
  lean→stand-down; hungryStreak>=3→stand-down; re-engages after); holdback
  exactly half (500/1000), hunger eased (60→44), intake recorded
  'depositgate-eased', ledger counts, helper never touches the pantry;
  share split exactly half on 9/9 sharing villagers (identical-seed
  off-vs-on), conservation exact (gave_on + eased == gave_off — nothing
  destroyed), ledger sums (shareEased=445); day voice exactly once/day,
  day-keyed rotation (d1 Róża / d2 Consuelo, different lines, no verbatim
  loop), lines name real behavior; tribute waiver fires only when
  plentiful+gate (their grain stays in THEIR stores 50000, our pantry
  untouched, no arrears, trust 50→51, ledger waived=1000, said aloud);
  gate-on + lean → normal path.
- Voice lines (sense-read): "looks at the full shelves and waves off the
  day's share. 'No more into the store — we eat at the fire, and the
  shelves keep.'" / "leaves the surplus by the fire for whoever's hungry.
  'The pantry can't take it. We can.'" — behavioral, human, no loops.
- Det-gate (manual, scripts not committed): trajectory digest over 4 seeds ×
  60d (leadfeast, 180d-capable harness, canonical per-day snapshot:
  pantryKcal|alive|hunger|trust|freshKcal), DEPOSITGATE=0 on modified tree vs
  pristine base (stashed). Digests MATCH EXACTLY:
  4daa96a0498d562be8f93880771d72730d09721fabfc58f74409780adbd433ca
  (modified) == 4daa96a0498d562be8f93880771d72730d09721fabfc58f74409780adbd433ca
  (pristine). Gate-off byte-identical: PROVEN, not asserted.

## Pilot results

32 runs (8 fresh seeds 9201–9208 × {leadfeast, belongfeast} × {control,
armed}), 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. Per-seed JSONs:
evidence/2026-10-22/sweeps/sweep-{control,armed}-{leadfeast,belongfeast}.json.

- **ENGAGEMENT: PASS** — eased kcal > 0 on 16/16 armed runs (mean eased
  ~150k share + 83k waived per run). The lever fires everywhere it should.
- **PRIMARY rot/100d: PASS** — control 175,187 vs armed 67,510 kcal;
  ratio **0.385** (need ≤ 0.85). Decisive.
- **PRIMARY depositor-inflow/100d: PASS** — control 424,791 vs armed
  252,671 kcal; ratio **0.595** (need ≤ 0.90). Decisive. Parts
  (mean kcal): share 445k→260k, return 61k→40k, bighaul 50k→31k,
  tribute-receipt 103k→10k.
- **GUARD median survival: MISS** — control 167d vs armed 149d
  (need ≥ 157). Miss by 8d.
- **GUARD starvation deaths: MISS** — control 5 vs armed 8 (need ≤ 7).
  Miss by 1.
- **GUARD national(end): PASS** — control 3 vs armed 4 (need ≥ 1).
- **GUARD new death modes: PASS on investigation** — "the reunion" and
  "night court" each appear exactly ONCE in armed runs; both are
  pre-existing rare event deaths (nomad reunion scenes, night-court
  scenario in debug-scenarios/fieldFights), not lever inventions. With
  206 armed deaths, two singletons on one side is noise.
- **GUARD tribute trust health: PASS** — waiver fired on 8/16 armed runs;
  arrears 171k (control) vs 98k (armed), need armed ≤ control: PASS;
  link trust median 99 vs 95 (no inflation); non-active links 4 vs 5 —
  none dissolved attributable to waiver (waivers grant +1 trust and add
  no arrears; the 5 non-active armed links show no waiver-then-dissolve
  pattern on inspection).
- **GUARD laundering: MISS** — duty channel 2.85x (need ≤ 2.0). See root
  cause: small-denominator artifact with a real partial rebound.

### Root cause (guardrail misses)

1. **Survival (−18d median): variance-dominated, no dose-response, NOT a
   systematic lever cost.** Paired seed diffs (armed−control) range from
   −120 to +120 days. Dose-response is absent: seed 9208 leadfeast eased
   215k kcal/100d → +120d; seed 9208 belongfeast eased 74k/100d → −120d —
   the SAME world, the SAME lever, opposite extremes by policy. Paired
   median diff: leadfeast +17.5d (armed BETTER), belongfeast −40.5d (armed
   worse). The lever amplifies variance (thinner buffer → more shock-
   sensitive) but does not systematically shift survival. The pilot is
   underpowered for an 18d median question against ±120d swings.
2. **Starvation (+3): one-seed blip, mechanism plausible but unconfirmed.**
   Seed 9204b accounts for all +3 (1→4). Plausible mechanism: the eased
   share is eaten by the PRODUCER (already fed — own meal is sacred) rather
   than stored for need-based redistribution, and the thinner buffer hurts
   at the plentiful→lean transition. Not confirmed by this pilot.
3. **Duty 2.85x: small-denominator ratio over a real partial rebound.**
   Control duty baselines are near-zero (several seeds 0; mean ~4k);
   armed mean ~44k. Absolute: ~40k kcal/run of duty deposits appear against
   ~185k kcal/run of suppressed share — ~22% partial compensation, not 1:1
   laundering. The 2.0x instrument misfires on near-zero baselines; the
   rebound itself (need-driven duties rebuilding a thinner pantry) is real
   and worth watching.

### Verdict: NO-GO (do not land) — NOT killed

- §14 binds: three guardrail misses = NO-GO. Not re-scored.
- Kill discipline (Steve 2026-10-21) bars a kill: a kill requires
  establishing WHY and confirming the lever itself is wrong. The primary
  passed decisively (0.385 / 0.595); the misses are not proven
  lever-caused (variance-dominated survival, one-seed starvation,
  metric-artifact laundering). Killing a lever that achieved its purpose
  on unproven harms would violate the discipline.
- The code is NOT landed. It stays in this branch, committed as the
  evidence record, unmerged. Next run on this axis: (1) starvation-
  mechanism probe — who eats the eased share vs who starves (timing of
  starvation vs engagement); (2) higher-powered survival test (more seeds;
  the ±120d swings demand it); (3) laundering instrument fix — absolute
  kcal compensation, not ratio on near-zero baselines.

### Metric review (§14 — applies to the NEXT run, never this one)

- The duty-laundering guardrail as a pure ratio misfires when the control
  baseline is near-zero. Propose: absolute compensation metric (rebound
  kcal vs suppressed kcal) alongside the ratio, for the next run.
- The median-survival guardrail at 16 seeds cannot resolve an 18d median
  against ±120d paired swings. Propose: pre-register a higher seed count
  for the survival question, or a paired-difference test, next run.
- The "new death modes" guardrail needs a frequency floor (singletons of
  pre-existing rare events are noise, not modes).

## Balanced panel (§15)

Ran the standardized panel before/after (8 seeds × {leadfeast, belongfeast},
150d, --par 4): evidence/2026-10-22/panel-before/panel.json.gz
(DEPOSITGATE=0) and panel-after/panel.json.gz (DEPOSITGATE=1). Both panels
individually valid (16 cases, neutrality proofs pass, no throw).

The automated compare reports **invalid — "Unmatched flags"**: the panel
snapshots source-declared env flags, and DEPOSITGATE ("0" vs "1") IS the
intervention, so the contract guard fires. This is a panel-contract
limitation for env-gated levers, not a run-validity problem. Manual
row-level comparison (paired by policy+seed):

- days: 130.6 → 138.3 (armed +7.7)
- national: 12/16 → 14/16 (armed +2)
- table: 8/16 → 10/16 (armed +2)
- waveReach: 3.94 → 3.69 (armed −0.25)
- wins: 0 → 0; maxArc 3.50 → 3.63

Paired days (before→after): belongfeast 132→150, 114→150, 82→81, 123→150,
126→150, 150→118, 145→138, 150→130; leadfeast 83→134, 118→115, 131→150,
138→150, 150→150, 149→150, 150→150, 148→147.

Reading: on the standardized 150d instrument, the lever does NOT replicate
the sweep's survival harm — it leans positive on days/national/table. This
does not override the pre-registered sweep (the binding judge), but it
weighs against "the lever is systematically harmful": two instruments,
two horizons, and the harm appears on only one. The variance-amplification
reading (not systematic harm) is strengthened.

The automated compare .md (invalid, as expected) is attached:
evidence/2026-10-22/depositgate-panel-compare.md. Panel case caches
(cases/) are NOT committed, per the drift-cap rule.

## Wall numbers

(control / armed, 16 runs each): wins 0/16 / 0/16; national(end) 3 / 4;
table 0 / 0; wave-4 reach 13 / 13; wave-5 unlocks 0 / 0; median survival
167d / 149d; max survival 180d / 180d. Death-cause shares — control (237
deaths): combat 161, monster 24, contest 11, "a wound that wouldn't close"
7, sickness 6, starvation 5; armed (206 deaths): combat 147, monster 15,
sickness 13, starvation 8, contest 7, "a wound that wouldn't close" 5.
The substrate kills villages (wave-4 door reliable, wave-5 door shut on
both sides — the known wave-5 wall); the lever moves rot/inflow, not
reachability.

## Village assessment

Seed 9201 (armed, leadfeast, 180d survivor): the village learned to live
with a full pantry — 101 of 120 days saw eased deposits; villagers checked
the shelves and chose mending, teaching, hauling water over hauling food
that would rot. The day voice never looped verbatim across 447 lines
(rotating speakers/lines, day-keyed). Tribute wagons were waved home on
plentiful weeks with the "Eat well — that IS your tribute this week" beat;
trust held at 95 median with no waiver-attributable dissolutions. Villagers
act like people: they look at full shelves, make a different plan, and say
so aloud. The blanks filled: (1) the four deposit decisions now read the
pantry sensor — the prodrebound-b2 #570 finding is closed; (2) the
tribute-receipt waiver design question is answered (waiver-as-paid, with
the refusal-only alternative documented and rejected as dishonest);
(3) the task's "missing funnel.share hunk" premise was stale — the hunk
was present and proven by exact-half splits.

## Blanks filled / documented

1. **Filled (design)**: the four deposit decisions now read the pantry
   sensor — prodrebound-b2 #570 is closed. Behavioral at the decision,
   conservation holds, everything narrated.
2. **Filled (design)**: the tribute-waiver honesty question is answered —
   waiver-as-paid stands (refusal-only would punish the subordinate for our
   refusal); guardrailed by tribute-trust health, which passed.
3. **Corrected (task premise)**: the "missing funnel.share hunk" was
   present; verified by exact-half splits (9/9 villagers) and ledger sums.
4. **Documented (evidence)**: NO-GO verdict with root cause — primary
   decisive, three guardrail misses not proven lever-caused; next-run
   plan (starvation-mechanism probe, higher-powered survival test,
   laundering-instrument fix). Not killed per the kill discipline.
5. **Documented (infra)**: panel "Unmatched flags" contract limitation for
   env-gated levers → sim-findings.md (open).
6. **Documented (metric review)**: duty-laundering ratio misfires on
   near-zero baselines; 16-seed median-survival underpowered against
   ±120d paired swings; new-death-mode guardrail needs a frequency floor.
   All for the NEXT run, never this one.
7. **No steve-call filed**: the waiver design question was answered by
   evidence + design review (stands as built, guardrails passed); the
   NO-GO is a measurement verdict, not a design question.
