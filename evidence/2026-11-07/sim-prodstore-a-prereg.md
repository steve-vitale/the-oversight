# sim-prodstore-a — FOOD PRODUCTION/STORAGE DIAGNOSIS + ONE LEVER (arm sim-prodstore-a)

Run: oversight-flesh-out-loop, run fleshout-20261107T1615Z (Loop A), axis
food-economy. Worker tree: ~/workspace/worktrees/sim-prodstore-a, branch
sim-prodstore-a. Substrate: branch fast-forwarded to master tip eac2bfc4d
before any sims (was 2 commits behind: eac2bfc4d + 5b2dd06ed, journey-landing
r115 evidence/prereg/scripts + a 1-line src/data/characterGen.json Miriam
fix — the data touch is why the fast-forward happened before measuring,
not after). Tree clean at prereg time.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder:
cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d; smoking
16 ticks — Steve's final word, do not "quicken" it; pemmican is the payoff,
needs rendering knowledge; no nonsensical calorie loss; rot can't be smoked
back) and docs/STORAGE.md (pantry cap 120,000 kcal default, ~5 days for 12,
expandable x1.5 via buildStorage; surplus storage capped; buried caches).
No canon doc covers a production/storage lever's numbers — the numbers below
are measurement, not canon. If the diagnosis names a new rule, it is a
finding, not canon.

## The question (tracker next blank (1), from sim-awayconfirm-round-1415)

On 100 fresh seeds 98000–98099, competent only, 150d death-aware, 35
villager starvation deaths ALL had pantryKcal exactly 0 and freshDays
exactly 0. Starvation here is genuine scarcity, not distribution or ration
sizing. No food-economy fix has landed from the ration or preserver lines.
This arm is the FIRST production/storage arm: diagnose what caps
production/storage, then design ONE small documented lever and test it.

## How the food economy works (code-read before sims, not guessed)

- Personal production: villagerDayProduction = villagerExpectedDaily
  (villagerFoodBase 1500 x occupationFoodSkill 0.6–1.5 x ageCapacity
  0.55–1.0 x villagerKnowledgeFactor 1+0.13/known-plant capped 2.0 x
  strangerFactor 0.8–1.0 x health) x gritRoll x mentor x rally.
  A villager eats their own production first (ownEat), draws the shortfall
  from the pantry (pantryDraw), and shares surplus above need to the pantry
  by trustFactor (0.2/0.5/0.8/1.0) via stockSurplus (200-kcal units,
  3-day shelf, PANTRY-CAPPED at 120,000 kcal).
- Duty production (resolveOneAssignment, npcBatchTurn): forage
  R(300,600) x eff x vigorMult, hunt via villagerHuntResolve (real animal),
  fish, garden — stocked via stockPantry (pieces <=500 kcal, spoilDay
  day+3+granaryBonus). stockPantry does NOT check the pantry cap.
- PRODTHROTTLE (game.js): when pantryFreshDays() > 4, duty forage/garden/
  fish redirect to wood/water/stone (v.throttleRedirects). Hungry streak
  >= 3 stands it down (v.throttleExemptDepth).
- PLENTYDEPRI (env PLENTYDEPRI=1, shipped default): when the throttle is
  engaged, personal production eases — the surplus half is not produced
  (ledger v._plentyDepri.days[d].kcal). Own meal is never touched.
- DEPOSITGATE (env DEPOSITGATE=1, shipped default): when plentiful, half
  the trust-scaled shared surplus is eased instead of stored (ledger
  v._depositGate.days[d].shareEased) and eaten at the fire.
- Preservation: the COOK duty smokes about-to-rot surplus (spoilDay-day
  <= 2, ~4,000 kcal per cook-part, blind 0.80x / specialist 0.95+,
  30d shelf) — NPC preservation EXISTS. No NPC render/pemmican path was
  found in code (preserveFood/renderFat/makePemmican callers are app.js
  only) — the diagnosis measures how much the cook duty actually preserves.
- Spoilage: sweepSpoiled() at dawn removes spoiled pantry items (no
  return value — the sweep measures the pantry kcal delta across it).
- Meals: villageEats at end of day; burnHistory = rolling 7-day honest
  net (totalDrawn - totalGive + player meal). Pantry cap counts ALL pantry
  kcal including spoiled items still sitting in it (pantryKcal() sums
  items, no spoiled exclusion) — a cap-side question for the diagnosis.

## SEED-BAND FRESHNESS (verified BEFORE sims, 2026-11-07, by this worker)

- First candidate 99101–99108: COLLIDED — named in many preregs (vetbar
  pilot band, gearbar-a reuses the same band, standacc-b forbidden list,
  tendbelow/tendfloor-guard preregs, etc.). NOT used; recorded here so the
  next worker does not re-check it.
- Second candidate 99351–99358: COLLIDED — used by sim-drive-practice-a
  (2026-11-06: "Fresh band 99351–99358: 8 seeds, competent policy
  verbatim"). NOT used.
- Chosen band 96201–96208: FRESH. Scope: all dated preregs
  (evidence/*/sim-*-prereg.md — every one of the 8 seeds checked
  individually, 0 hits each); convergence-tracker.md (1 hit for "9620"
  is commit hash c5f096200, not a band); sim-findings.md (0 hits);
  evidence/ .md band strings (no "96201–96208" / "96201-96208" string
  anywhere). The evidence/ JSON hits for 96201–96208 are substring
  artifacts inside other numbers (e.g. "rotKcal": 962042 in
  sim-proposelayer-control.json; seed-6101 filenames), not seed bands —
  no prereg, screen, extension band, or forbidden/contaminated list names
  any 96201–96208 seed. Confirm band (only if the pilot GOes):
  96209–96224 — freshness to be re-verified in the Phase-B amendment
  before any confirm sweep; NOT assumed fresh here.
- Reserved/used bands NOT used here: 99101–99108, 99351–99358,
  98000–98099, 96500–96515, 94601–94664, 96101–96124, 96001–96008,
  99201–99208, 99601–99612, 53001–53008, 49001–49040, 48001–48008,
  99501–99508 (askplus-a), 99401–99412 (tendfloor).

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

### Phase A — DIAGNOSIS (fully pre-registered here; no lever built yet)

- Substrate: branch sim-prodstore-a @ eac2bfc4d (master tip). Policy:
  competent ONLY (scripts/policies/competent.js, UNMODIFIED). Env
  (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1. Horizon:
  150d death-aware cap (dead villages stop; runDays endReason recorded
  per seed; no fixed-200d run, no tail padding beyond the harness's own
  stop). Seeds: 96201–96208 (8 seeds, one batch — the pilot batch IS the
  diagnosis batch; the diagnosis needs no separate pilot).
- Instruments (all NEW, derived from the awayconfirm family pattern —
  competent FIXED, env FATAL-asserted, registerDeath CALLS THROUGH,
  villagerMealDay wrapper reads only, writeRobust, stdout to the caller's
  pipe): scripts/sweep-prodstore-diag-a.js, scripts/analyze-prodstore-diag-a.js,
  scripts/test-prodstore-diag-a.js. Deltas vs awayconfirm, declared here:
  1. Wrappers added (all read-only except the functions they call
     through): stockPantry (kcal by name per day), stockSurplus (stored
     kcal per day), pantryDraw (taken kcal per day), drawSpoiled (kcal),
     donateToPantry (pantry-delta kcal), drawLeaguePool (kcal),
     sweepSpoiled (pantry kcal removed), resolveOneAssignment (resolved
     task counts per day), villagerMealDay (ate/drawn/gave/ownEat/produced
     per villager-day, deduped per (vid,day) like awayconfirm).
  2. Daily snapshot in policy.daily (pre-meal, post-work, same clock as
     awayconfirm): pantryKcalLive, pantryFreshKcal, pantrySpoiledKcal
     (live − fresh), preservedKcal (foodState preserved/rendered/pemmican),
     pantryFreshDays, pantryCapKcal, throttleEngaged, throttleRedirects
     (ledger delta), throttleExemptDepth (ledger delta), plentyDepriKcal
     (ledger delta), depositGateKcal (ledger delta), pop, hungry count,
     assignments by task, capDays flag (pantryKcal >= 0.95 x cap).
  3. Deaths: same registerDeath capture + pantry ctx as awayconfirm
     (freshDays, pantryKcal, pantryFreshKcal, pantrySpoiledKcal, pop,
     hungry, awayAtDeath, say/tele windows).
  4. Per-seed files: evidence/2026-11-07/prodstore-a-corpus/
     prodstore-a-competent-s<seed>.json (daySeries + flowSeries + mealRows
     + deathRows + totals). No panel.json.gz is produced by this sweep —
     the balanced panel (§15) is attempted at Phase B, on the lever's
     before/after (see below).
- Diagnosis questions (each gets a pooled number; the diagnosis is
  COMPLETE when all seven are answered and ONE binding constraint is
  named):
  - D1 PRODUCTION vs BURN: pooled Σ produced (personal, from contribLog)
    + Σ duty-stocked (by name) vs pooled Σ need (kcalPerDay) vs pooled
    Σ ate. Is the village structurally short, break-even, or surplus?
  - D2 SPOILAGE: pooled kcal removed by sweepSpoiled from the pantry +
    spoiled stock sitting in pantry at snapshots, as a share of pooled
    Σ stocked + Σ stored. How much of what the village makes rots?
  - D3 THROTTLE/EASING: share of village-days with prodThrottleEngaged,
    pooled throttleRedirects, pooled plentyDepri eased kcal, pooled
    depositGate eased kcal — as a share of pooled Σ produced. How much
    production does the village deliberately NOT make/store?
  - D4 CAP: village-days at/near cap (pantryKcal >= 0.95 x cap); pooled
    stockSurplus shortfall (gave − stored) attributable to the cap; days
    the pantry held spoiled kcal while fresh inflow was refused.
  - D5 PRESERVATION: pooled kcal reaching preserved/rendered/pemmican
    state in pantry snapshots; cook-duty resolutions per day; preserved
    kcal as a share of about-to-rot surplus. Does the cook duty keep up?
  - D6 LABOR: resolved duty counts by task per day (forage/hunt/fish/
    garden/cook vs wood/water/stone/scout/patrol/tend/teach/mend); food
    duties as a share of all resolved duties.
  - D7 STARVATION: villager starvation deaths with pantry ctx (same
    full-pantry gate as awayconfirm: pantryKcal >= 8,000 AND freshDays
    >= 3.0 at death) — expected ~2–3 on 8 seeds at the awayconfirm rate
    (35/100); reported, not judged in Phase A.
- Diagnosis GO: all seven questions answered with pooled numbers AND one
  binding constraint named — the single largest measured kcal channel
  among {structural shortfall (D1), spoilage (D2), throttle/easing (D3),
  cap refusal (D4), preservation shortfall (D5)} — ranked by pooled kcal.
  The binding constraint NAMES the Phase-B lever's target. If no channel
  dominates (all within 2x of each other), the diagnosis reports that
  honestly and Phase B targets the largest anyway, with the tie recorded.
- Diagnosis is measurement only: zero src/js changes in Phase A.

### Phase B — LEVER (selection rule pre-registered here; exact lever named in a dated amendment BEFORE the pilot sweep)

- SELECTION RULE (binding): the lever targets the single largest measured
  kcal channel from Phase A. It is ONE small documented change, canon-
  consistent (PRESERVATION.md ladder untouched: smoking stays 16 ticks,
  no calorie creation, rot can't be smoked back; STORAGE.md cap stays
  unless the diagnosis names the cap as the binding constraint). The
  amendment names the lever, its exact numbers, its code location, and
  the env flag that arms it (off = baseline, on = armed) BEFORE any
  pilot sweep runs. The amendment is appended to this prereg as a dated
  addendum — never a silent edit.
- Candidate shapes (NOT chosen — the diagnosis picks one; listed so the
  choice is recognizable as one of these, not invented mid-run):
  (a) spoilage dominates → cook-duty preservation throughput/trigger
      (smoke earlier / more per part / more cooks assigned);
  (b) throttle/easing dominates → plenty threshold or stand-down
      (throttle stands down when the deep reserve is thin, not only on
      hungryStreak >= 3);
  (c) structural shortfall dominates → knowledge-factor or base-capacity
      lever (smallest honest step; must not inflate yields without a
      mechanism — a knowledge-gated or labor-gated step, not a multiplier);
  (d) cap dominates → storage expansion (buildStorage cheaper / bigger
      cap, or surplus bypass for preserved food).
- Pilot GO (binding): on the SAME 8 seeds 96201–96208, competent, 150d,
  armed vs baseline — villager starvation deaths ≤ HALF the Phase-A
  baseline count AND median survival ≥ 0.8x baseline. Cost bar (honest,
  reported either way): starvation deaths, median survival, wave reach,
  death-cause shares, national/table/wins (expected 0, competent-only).
  If the Phase-A baseline has ZERO starvation deaths on these 8 seeds,
  the GO is re-scoped in the amendment BEFORE the pilot: primary becomes
  village-days with an empty pantry (pantryKcal == 0 at snapshot), GO
  ≤ half baseline, median survival ≥ 0.8x baseline. A miss is NO-GO,
  never re-scored against a friendlier metric mid-run. Kill taxonomy
  (§14a) recorded on a kill.
- Confirm (only on a pilot GO): 16 fresh seeds (band named + freshness-
  verified in the amendment), same GO threshold, same policies/horizon.
- Balanced panel (§15): attempted on the lever's before/after — run
  `node scripts/balance-panel.js --n 8 --policies competent --days 150
  --seeds 96201,...,96208 --out <before|after>` on the two roots and
  `compare` them; attach the compare .md. KNOWN failure class named in
  advance: the panel ingests panel.json.gz via sweep-compare, not the
  diag sweep corpora — if it fails in the recorder-ingestion class (as
  in awayconfirm/cover-b/0630Z), attach the analyzer's before/after
  replication table instead and name the class. A tooling failure NEVER
  blocks or re-scores the verdict.
- Telemetry deviation check (loop-body step 10): after writing evidence,
  run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/prodstore-a-corpus/prodstore-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real bug)
  BEFORE rolling the baseline forward. Report LOUD lines with verdict.
  (Expectation: competent-only 150d shows national/table/wins 0 — the
  awayconfirm run hit the identical LOUD lines as a regime artifact; do
  NOT roll the baseline on a regime artifact.)

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

---

## PHASE-B AMENDMENT (2026-11-07 ~18:00 UTC — appended BEFORE any pilot sweep runs)

### Diagnosis outcome (Phase A COMPLETE — all seven questions answered)
- Pooled, 8 seeds 96201–96208, competent, 150d death-aware (911 village-days):
  produced/need = **1.054** (15,539,857 / 14,741,476); ate/need = 0.895.
- **BINDING CONSTRAINT (largest channel): throttle/easing — 2,651,133 kcal
  (17.1% of produced)**: PLENTYDEPRI eased 1,754,448 + DEPOSITGATE eased
  896,685. Throttle engaged 662/911 days (72.7%); engaged AND hungry on
  130 days. Spoilage 338,708 (12.3% of stocked+stored). Cap never binds
  (0/911 cap-flag days). Structural shortfall 0 pooled. Preservation:
  cook resolves 928/5,680 duties; preserved stock at last snapshot mostly 0.
- **BASELINE FOR PHASE B: starvation deaths = 3 per 8 seeds; median survival
  = 115.5d; empty-pantry village-days = 24.** All 3 starvation deaths on ONE
  seed (96203, d51 Franz, d58 Oscar, d58 Emma — pantry 0, freshDays 0).
- **Caveat recorded honestly before the pilot (it does not change the
  selection rule, it bounds the expectation):** on seed 96203 the throttle
  was NEVER engaged during the collapse (days 35–66, freshDays 0–2.4) and
  the easing counters froze at 11,708 / 4,032 — the easing did not cause
  those deaths; the village produced ~70% of need for a month (a
  production-collapse regime, pop 10→4). The lever's path to the GO bar
  on that seed is the early buffer (its 11 engaged days, 15,740 kcal
  eased in total) plus trajectory effects — a genuine test, not a
  foregone conclusion. If the pilot NO-GOs on starvation, the evidence
  will say plainly the deaths live in the collapse regime and the next
  arm should target the production floor (knowledge factor / base
  capacity), not the easing.
- Accounting-closure note: per-seed residuals are small on 6 seeds
  (≤14.4% of inflows) but 55.2% (s96204) and 55.6% (s96207) on two —
  POSITIVE (unmeasured INFLOWS, concentrated on event days, e.g. s96204
  days 26–38 gaining ~18k/day unmeasured). Named unmeasured inflow
  paths in code (direct `v.pantry.push`, bypassing the wrappers): route
  tariffs (~1k each, hierarchy.js:3397), raid spoils (hierarchy.js:3761),
  League granary draws (hierarchy.js:3430), tribute/favor repayments,
  relay cuts. The ranking is robust anyway: the easing channel is
  ledger-based (not flow-derived), and even if the whole pooled residual
  (~530k) were misattributed spoilage, spoilage (~869k) would still be
  3× smaller than easing (2.65M). The residual is an instrument
  limitation to record, not a diagnosis-killer. The 5-day proof-test
  residual was 8.4% of outflows (L8 passes).

### The lever (ONE small documented change — selection rule followed: target the single largest measured channel)
- **Name: PLENTY-WEEK — the production throttle + both easings demand a
  full week's buffer before standing down food work.**
- **Exact change:** the plenty threshold the throttle reads goes from
  **4 → 7 fresh days**. One helper, one number, two call sites:
  - New method `Game._prodstorePlentyThreshold()` in `src/js/game.js`
    (placed immediately before `prodThrottleEngaged()`): returns 7 when
    `PRODSTORE_LEVER` is set in the environment, 4 otherwise (browser /
    unset = baseline, byte-identical — no RNG in this path).
  - `prodThrottleEngaged()` (game.js:16447): `pantryFreshDays() > 4`
    becomes `pantryFreshDays() > this._prodstorePlentyThreshold()`.
  - `prodThrottleHungerExempt()` (game.js:16456): `pantryFreshDays() <= 4`
    becomes `<= this._prodstorePlentyThreshold()` (same sensor, so the
    "would engage but exempt" beat stays consistent with the throttle).
  - NOT touched: `_plentyDepriBufferClear()` (PD=2 buffer gate, a
    different sensor — `pantryDaysEstimate()` — dormant at PD=1) and the
    hungryStreak ≥ 3 crisis exemption (a deliberate, commented design
    choice; this lever recalibrates the plenty sensor, it does not
    override the crisis rule). The deposit gate follows automatically
    (`_depositGateEngaged()` reads `prodThrottleEngaged()`).
- **Mechanism (why this, in plain words):** the pantry sensor reads
  "plenty" from pantry draws alone, and draws are only ~6% of what the
  village eats (848k drawn vs 13.19M eaten) — so it calls the pantry
  "full" at a median 5.3 fresh days while villagers eat only 89.5% of
  need and the village throws away 17% of everything it makes. Asking
  for a full week of buffer before food work stands down keeps the
  buffer-building going longer. Expected recoverable share: easing on
  days with freshDays in (4,7] is 711,964 kcal (26.9% of the easing
  channel); 282 of 662 engaged days flip to disengaged.
- **Env flag arming it: `PRODSTORE_LEVER=1`.** Off / unset = baseline.
  The diagnosis sweep's FATAL guard (PRODSTORE_LEVER must be unset)
  stays in the diagnosis sweep; the pilot uses a separate pilot sweep
  (`scripts/sweep-prodstore-pilot-a.js`, derived from the diagnosis
  sweep, guard inverted: REQUIRES `PRODSTORE_LEVER=1`) writing to
  `evidence/2026-11-07/prodstore-a-corpus-armed/`.
- **Proof test extended** (`scripts/test-prodstore-diag-a.js`, legs L9–L10):
  L9 armed 5-day run (seed 96201) has throttleEngaged days ≤ baseline
  and easing (plentyDepri+depositGate) ≤ baseline; L10 unset run is
  byte-identical to the Phase-A baseline run (off = baseline). Plus
  `node scripts/check.js --quick` after the src/js change.
- **Canon check:** PRESERVATION.md / STORAGE.md name no plenty
  threshold and no throttle number — the "4" is a bare engine constant,
  not canon. No win price or deed gate is touched. No new system, no
  multiplier without a mechanism: the lever is a recalibration of an
  existing sensor, and its voice/ledger beats follow the existing
  functions (the throttle beat, the plentyDepri/depositGate day voices).

### Pilot GO threshold (binding — same rule as the header, baseline now known)
- Baseline: starvation deaths = 3 per 8 seeds; median survival = 115.5d.
- **GO: villager starvation deaths ≤ 1 (half of 3, integer) AND median
  survival ≥ 92.4d (0.8 × 115.5d).** Both must hold. Cost bars reported
  honestly alongside: wave reach, death-cause shares, empty-pantry
  village-days (baseline 24), spoilage, cap-flag days.
- The zero-baseline re-scope rule does NOT trigger (baseline is 3, not 0).

### Confirm band (freshness verified in this amendment, 2026-11-07)
- **Confirm band: 96209–96224 (16 seeds). FRESH.** Grep scope: every
  seed checked individually against ALL dated
  `evidence/*/sim-*-prereg.md` (0 hits), the convergence tracker (0),
  `sim-findings.md` (0). The only hits for 96209 and 96224 are the
  self-reference line in THIS prereg ("96209–96224 — freshness to be
  re-verified"), i.e. this amendment itself — not a prior use. No
  forbidden/contaminated list names the band.
- Confirm runs ONLY on a pilot GO, same GO threshold, same policies/horizon.

### Pilot plan
- Same 8 seeds (96201–96208), competent, 150d death-aware, PLENTYDEPRI=1
  DEPOSITGATE=1, PRODSTORE_LEVER=1, armed corpus vs the Phase-A baseline
  corpus. Analyzer run on the armed corpus; before/after compared in the
  evidence file (analyzer replication tables). Balanced panel attempted
  per the header; telemetry check per the header.

### Metric review (post-run)

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read, beats quoted)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
