# sim-prodcollapse-diag-a — PRODUCTION-COLLAPSE DIAGNOSIS (arm sim-prodcollapse-a)

Run: oversight-flesh-out-loop, run fleshout-20261107T1820Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-prodcollapse-a, branch sim-prodcollapse-a.
Substrate: branch rebased onto master tip f5650d4eb (evidence-only addendum
on a4b2210d6) before any sims. Tree clean at prereg time.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder:
cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d;
smoking/preserving is the storage system). No canon doc covers a
production-collapse rule or its numbers — the numbers below are
measurement, not canon. If the diagnosis names a new rule, it is a
finding, not canon.

## The question (tracker next blank, second face of the food-production blank)

The sibling diagnosis (sim-prodstore-a, commit f7277d2af — read via
`git show`, instruments modeled, corpus NOT reused) ran 8 seeds
96201–96208, competent, 150d death-aware: pooled produced/need 1.054,
but seed 96203 collapsed — produced ~70% of need for a month (days
35–66), freshDays 0–2.4, throttle NEVER engaged during the collapse, 3
starvation deaths d51 (Franz), d58 (Oscar), d58 (Emma), all pantry 0
freshDays 0. The easing lever (arm 1, sim-prodstore-adopt-a) cannot
reach these deaths: its path is the early buffer plus trajectory
effects, not a direct fix. The collapse regime is a separate mechanism
and needs its own diagnosis before any lever is scoped.

Question: when produced/need falls below ~0.8 for weeks, WHAT is the
binding constraint — labor-days allocated to foraging vs other tasks,
forager count/competence, biome yield (tile vigor/depletion), haul
losses, season/weather, raid/tariff drains, or something else?
Decompose the shortfall per collapse episode.

## How production works (code-read before sims, not guessed)

- Personal production: villagerDayProduction = villagerExpectedDaily ×
  gritRoll × (1+mentorBonus) × rally(1.5). villagerExpectedDaily =
  villagerFoodBase (1500 × occupationFoodSkill 0.6–1.5 × ageCapacity
  0.55–1.0) × villagerKnowledgeFactor (1 + 0.13/known-plant, cap 2.0) ×
  strangerFactor (0.8→1.0 over the first 7 days) × health/100. A
  villager eats their own production first (ownEat), draws the
  shortfall from the pantry, shares surplus above need by trustFactor
  (0.2/0.5/0.8/1.0, doubled in crisis when pantry < 5,000 kcal).
- Duty forage (resolveOneAssignment): kcal = R(300,600) × eff
  (competence × trustTaskMult) × (depleted>0 ? vigorYieldMult(avgVigor)
  : 0.3) × cornucopia. Each forage strips R(2,4)×eff tiles by 1 stock;
  stripping the last stock wounds vigor −5, scraping bare ground −2.
  vigorYieldMult: 100→1.0, 50→0.675, 0→0.35. Forage zones widen as the
  home turf thins (cautious ring 1 → ring 2).
- Regrowth (regrowTiles, once per elapsed day): stock +1 every 2 days up
  to the vigor-capped max (every 4 days at pressure ≥5, nothing at
  ≥10, nothing at vigor 0); vigor +2/day ONLY on truly rested ground
  (not worked today, zero pressure), +1 if not eroded today and
  pressure <5, further wounding at pressure ≥8. ~7 weeks barren→full.
  The land is a slow battery: daily stripping outruns regrowth, vigor
  is the slow memory.
- Duty hunt (villagerHuntResolve): a REAL animal from a REAL tile's
  wildlife; hunted-out ground returns kcal 0 ("the wild is hunted
  out"). Injury risk 0.08–0.22 by temperament.
- Duty garden/fish: 'Garden harvest' / 'Fish catch' via stockPantry.
- PRODTHROTTLE: duty forage/garden/fish redirect when pantryFreshDays
  > 4; hungryStreak ≥ 3 stands it down. Sibling evidence: NEVER
  engaged during the 96203 collapse — easing is exonerated for the
  collapse unless this re-run shows otherwise.
- Drains: _removePantryKcal (tribute, demands, sortie rations, aid,
  hierarchy payments) — real pantry outflows outside pantryDraw.
- Starvation: hunger +25–40/day in villagerMealDay; the unfed fade via
  the starvation branch (health drain, hurtVillager 'starvation').

## SEED BAND

The SAME band 96201–96208 as the sibling diagnosis — reuse is the
point, not contamination: the collapse episode was observed on this
band, and this arm re-runs the baseline itself (it does NOT depend on
the sibling tree's uncommitted corpus files). Band freshness was
verified by the sibling arm before sims (see sim-prodstore-a-prereg.md
via `git show f7277d2af:...`); no new band is introduced here.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-prodcollapse-a @ f5650d4eb (master tip). Policy:
  competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env
  (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1.
  Horizon: 150d death-aware cap (dead villages stop; runDays endReason
  recorded per seed; no fixed-200d run). Seeds: 96201–96208 (8 seeds).
- Instruments (all NEW, modeled on the prodstore diagnosis pattern —
  competent FIXED, env FATAL-asserted, registerDeath CALLS THROUGH,
  wrappers read-only + call-through + zero extra RNG, writeRobust
  fresh-child writer, stdout to the caller's pipe):
  scripts/sweep-prodcollapse-diag-a.js,
  scripts/analyze-prodcollapse-diag-a.js,
  scripts/test-prodcollapse-diag-a.js. Deltas vs prodstore, declared
  here:
  1. All prodstore flow wrappers KEPT (stockPantry by name,
     stockSurplus, pantryAdd, donateToPantry, pantryDraw + drawGap,
     drawSpoiled, drawLeaguePool, sweepSpoiled, takeFromPantryBulk /
     takeFromPantry, _removePantryKcal, resolveOneAssignment counts,
     villagerMealDay deduped rows, registerDeath + pantry ctx, say/tele
     windows, daily snapshot fields).
  2. NEW wrappers (read-only, call-through, no RNG):
     villagerDepleteTiles (per forage call: depleted/barren/eroded/
     avgVigor/zone) and villagerHuntResolve (per hunt call: kcal, aid
     or null, zero-kcal flag).
  3. villagerMealDay rows EXTENDED per (vid,day): expected, base,
     knowledgeFactor, knownPlants count, occupationFoodSkill, ageCap,
     healthFrac, trust, assigned task that day, realized mult
     (produced/expected).
  4. Daily snapshot EXTENDED: season id, weather, map ground state
     (meanVigor, meanStockRatio, barrenTiles, pressuredTiles over
     forageable tiles), awayCount, sickCount (health<50), meanHealth,
     assignments with per-task mean competence + mean expected of
     assignees, forager headcount + mean forage competence.
  5. BARE mode (PRODCOLLAPSE_BARE=1): same seeds/days/policy, all
     wrappers SKIPPED, writes only a fingerprint per seed
     (daysAlive, endReason, rank, maxWave, national, table, win,
     deathCauses, deathKeys sorted day|who|cause, finalPop). The
     recorded run must match it exactly (gate G2).
  6. Per-seed files: evidence/2026-11-07/prodcollapse-a-corpus/
     prodcollapse-a-competent-s<seed>.json (daySeries + flowSeries +
     mealRows + deathRows + totals). Bare fingerprints:
     prodcollapse-a-bare-s<seed>.json in the same directory.
- Collapse episode (DEFINITION, this worker's call, fixed before any
  judged sweep): a maximal run of days where the trailing 14-day
  produced/need ratio (deduped meal rows: Σ produced / Σ needEst over
  the trailing 14 days, per-day sums) stays < 0.80, with episode
  length ≥ 7 days. Boundaries: first day the trailing-14d ratio drops
  below 0.80 to the first day it recovers to ≥ 0.80. Cross-check
  criterion (reported, NOT definitional): pantryKcal == 0 AND
  freshDays < 3 sustained ≥ 7 days.
- Baselines for counterfactuals: pooled NON-EPISODE village-days
  across all 8 seeds (same band): mean knowledgeFactor, mean
  healthFrac, mean realized mult (produced/expected), food-duty-days
  per village-day, duty kcal per food-duty-day, need per village-day.
  Episode means use the same definitions over episode days only.
- Decomposition (per episode, single-factor counterfactual kcal gains
  vs the non-episode baseline — NOT additive; they overlap by
  construction, and the analyzer says so):
  - CF-KNOW = producedEp × (kfNonEp/kfEp − 1), if kfEp < kfNonEp else 0
    (villagers don't know enough plants).
  - CF-HEALTH = producedEp × (hFracNonEp/hFracEp − 1), if hFracEp <
    hFracNonEp else 0 (wounds/sickness depress capacity).
  - CF-GRIT = expectedEp × (multNonEp − multEp), if multEp < multNonEp
    else 0 (realized effort below the normal mean: grit, easing, no
    rally).
  - CF-LABOR = (foodDutyRateNonEp − foodDutyRateEp) ×
    dutyKcalPerFoodDutyDayNonEp × epDays, if the episode rate is lower
    (too few labor-days on food).
  - CF-YIELD = foodDutyDaysEp × (dutyKcalPerFoodDutyDayNonEp −
    dutyKcalPerFoodDutyDayEp), if the episode yield is lower (depleted
    ground, failed hunts, thin biome).
  - CF-DRAIN = Σ removedKcal + takeBulk over episode days (pantry
    outflows that fed nobody).
  - CF-SPOIL = Σ spoiledSwept over episode days.
  - CF-NEED = (needPerDayEp − needPerDayNonEp) × epDays, if episode
    need/day is higher (roster/need growth outpacing capacity).
  - Shortfall S = Σ_E (need − produced − dutyStocked − stored −
    pantryAdd − donated − league). If S ≤ 0 the episode is a
    "duty-covered collapse" (personal production fell but duties
    covered need) — reported honestly, not forced into a cause.
  - PRIMARY CAUSE = the largest counterfactual. Supporting evidence
    per episode (quoted ledger rows): mean avgVigor at forage
    resolutions + share with avgVigor < 50 + share with depleted == 0;
    hunt zero-kcal share; forager headcount + mean competence vs
    baseline; season/weather during the episode; throttle-engaged
    share (expect 0); assignment mix; the starvation deaths inside
    the episode with pantry ctx.
- Gates (judged ONLY against this header):
  - G1 det-gate: recorder deterministic on a fixed seed (same seed
    twice → identical per-seed JSON).
  - G2 neutrality: recorded vs bare fingerprints identical on ALL 8
    judged seeds (daysAlive, endReason, rank, maxWave, national,
    table, win, deathCauses, deathKeys, finalPop).
  - G3 corpus: all 16 legs valid — 8 recorded per-seed files
    (daySeries length == daysAlive, flowSeries non-empty, mealRows
    deduped, deathRows present) + 8 bare fingerprints present.
  - G4 classification: EVERY collapse episode found in the band
    classified by primary cause with quoted ledger rows; prevalence
    reported (episodes per seed, seeds affected). STATED HONESTLY
    HERE: if only 96203 collapses, this gate is met by classifying
    that episode fully and reporting prevalence 1/8 — no count bar is
    forced and no re-run is demanded.
- DIAG ONLY — zero src/js, no lever, no default flip. If a fix is
  found worth landing, it is documented as the NAMED next arm; it is
  not landed here.
- Reachability check (reported, not gated): national / table / wins,
  wave reach 1–5, median survival — expected 0/0/0 on competent-only
  150d per the sibling run; any non-zero is reported as a deviation,
  not a win.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/prodcollapse-a-corpus/prodcollapse-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real bug)
  BEFORE rolling the baseline forward. Report LOUD lines with verdict.
  (Expectation: competent-only 150d shows national/table/wins 0 — the
  awayconfirm run hit the identical LOUD lines as a regime artifact; do
  NOT roll the baseline on a regime artifact.)

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

## Metric review (post-run)

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read, beats quoted)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
