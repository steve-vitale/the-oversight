# sim-cheaptend-a — A CHEAPER TENDING SHAPE (arm sim-cheaptend-a)

Run: oversight-flesh-out-loop, run fleshout-20261108T0015Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-cheaptend-a, branch sim-cheaptend-a. Substrate:
branch @ 2bc17d793 (current master; origin/master 0ce76898f is an
ancestor, merge-base = 0ce76898f, 0 commits behind — no rebase needed).
Tree clean at prereg time. Policy: competent ONLY in Phase A; CHEAPTEND
layer wrapping competent in Phase B (scripts/policies/cheaptend-a.js,
NEW, does NOT edit competent.js or tendsick-a.js). Env: PLENTYDEPRI=1,
DEPOSITGATE=1, CHEAPTEND_A=1 on the armed leg. Horizon: 150d
death-aware. Seeds: pilot 96301–96308 (8 seeds, the SAME band as
tendsick, deliberately — see Seed-band note). Prereg:
evidence/2026-11-07/sim-cheaptend-a-prereg.md (binding, incl. the
exact layer shape decided below BEFORE any sims; confirm band
96309–96324, freshness re-verified below — confirm runs only on a
pilot GO).

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
mundane = real diseases, earthly vectors and cures; alien = monster
meat / giant-mosquito / alien-tick effects, never diagnosed, eased, or
cured by mundane medicine; cure tiers folk remedies → occupation
medicine → specific ruin medicine → healer deepenings → the Fever's
End synergy; diagnosis unlocks the true name, class, and cure
direction). No canon doc covers a tending lever's numbers — the
numbers below are measurement, not canon. The layer reuses the
tendsick cure ladder verbatim (same verbs, same cure table,
src/data/statusEffects.json) — nothing new is invented here.

## The question (tracker next blank (1), the cheaper shape)

The tendsick pilot (evidence/2026-11-07/sim-tendsick-a.md) proved
tending works as medicine and fails as a village saver: sick-days
0.065→0.053 (ratio 0.815), duration 3.2d→2.1d, cures 0→27 — but
foraged food −27%, fish −46%, duty-stocked −35%, starvation 1→5,
three seeds regressing >30d. The day has no slack: tending trades
fever for food. This arm tests the named next blank (1) from that
review: a CHEAPER tending shape — tend only on days the trip would
not range anyway, and cap acts below 3/day — so the fever gain is
bought with time the village was not going to spend foraging anyway.

## How treatment works (code-read before sims, not guessed — from the tendsick prereg, verified against this base)

- NPC sickness is a LIGHT sim (`v.sick[vid] = {name, daysLeft,
  severity}`, game.js villageSicknessTick, once per day in endDay).
  Three vectors, each an independent per-villager roll, no contagion:
  wound fever (health < 40, 15%/day, severity 2), gut rot (drank
  dirty, 10%/day, severity 2), tick fever (forager/explorer range,
  3%/day, severity 1). Tick: `daysLeft -= 1`/day; damage
  `1 + severity*2` HP/day (−1 if a healer is present in camp);
  recovery when `daysLeft <= 0`; death through hurtVillager with
  cause 'sickness'. `daysLeft` at onset is 3–6 days.
- NPC care already exists: `villagerCareTick` — medical-occupation
  villagers tend one sick villager per day each (two with triage):
  `daysLeft -= 1`, remembered, 25% say-line.
- Player-side verbs (game.js, all real, none stubbed):
  - `tendVillager(vid)` (32 ticks): skilled (has herbal_remedy OR
    field_medicine OR triage, ANY level): daysLeft −= 2 (floor 1),
    severity −= 1. Unskilled: daysLeft −= 1 (floor 1).
  - `treatVillager(vid, abilityId)` (32 ticks + 150 kcal): requires
    the ability at L2+; herbal_remedy CURES disease / wound_fever /
    gutrot; field_medicine and triage CURE wound_fever, EASE disease
    / gutrot (src/data/statusEffects.json). `needsDiagnosis: false`
    for all three NPC diseases — NO diagnosis gate on a cure.
  - `examineSick(vid)` (diagnosis): NOT needed for a cure — the
    layer does NOT examine.
- Competent policy TODAY (scripts/policies/competent.js, read, not
  assumed): treats villagers ONLY through promise-keeping
  (`keepPromiseHeal`) — ONLY for a villager with an open 'heal'
  promise. The competent scholar walks past sick villagers with no
  promise. The layer is therefore NOT a no-op (tendsick baseline:
  0 treat/tend acts under competent, 361 sick-at-Haven days).
- The day's time budget: 512 ticks/day (4 parts × 128). Each
  tend/treat costs 32 real ticks. The harness calls policy.daily
  once per day, AFTER the 3 day-part waits — i.e. the scholar is
  still at Haven at daily time on most days, so a tend drive at the
  TOP of daily catches the scholar at home BEFORE the trip leaves.

## The not-ranging gate (code-read — what "the trip would not range anyway" means in the engine)

The forage trip is gated inside competent.daily by ONE function,
`needTrip(Game, ctx)` (scripts/policies/competent.js:949, exported):

- pantry (Σ kcalEach × units over village.pantry) < 25,000 → trip.
- scholar kcal < 50% of kcalCap() → trip.
- no give to the pantry in 3 days (`day - ctx._lastGiveDay >= 3`,
  `_lastGiveDay` set by donateHaul) → trip (contribution
  maintenance).
- Otherwise → NO trip. `forageTripSeedFirst` is not called.

The layer therefore reads the trip decision with the engine's own
gate: it calls `competent.needTrip(Game, ctx)` (the same exported
function, same ctx — the harness's ctx persists across days, see
scripts/sim-harness.js runDays) at the top of daily, moments before
competent.daily calls it again. A day is a stay-home day exactly
when needTrip is false. This is the ONLY honest reading of "the
trip would not range anyway" available to a policy-side layer: the
layer cannot stop the trip, it can only spend time the trip was not
going to use, and needTrip is the trip's own decision.

Decided and excluded (exact form fixed here, held through the run):

- BAD WEATHER — EXCLUDED. Code-read: competent.js never consults
  weather when deciding the trip (grep: no 'weather' in
  competent.js); `Game.state.weather` ('rain'/'cold'/'clear') dims
  light and hurts fire but the trip still ranges. A rain leg would
  fire on ranging days and pay the same forage price — it cannot
  buy the cheap shape. The layer cannot stop the trip; a weather
  gate would only add expensive days.
- NO ABLE FORAGERS — EXCLUDED. No engine signal makes the
  scholar's trip not range when the village lacks foragers:
  needTrip does not check forager availability, and NPC foragers
  keep working through their own assignments regardless of the
  scholar's ticks. There is no honest "no able foragers" read that
  changes whether the scholar's trip ranges.
- `recovering()` — NOT USABLE. Gated on COMPETENT_DIRECTIONAL_FLEE
  (unset in these arms) and true only for a few days after a
  directional flee; it is not a stay-home signal on this substrate.

Known approximation (recorded BEFORE sims, not discovered after):
the gate reads needTrip at the top of daily, BEFORE competent.daily
runs keepPromises. A heal promise kept in between can spend 150
kcal and flip the trip on after the gate read. The measured
forage-cost bar is the judge of whether it matters in practice; the
analyzer cross-checks acts against the snapshot's `tripPlanned`
field (recorded at the same moment as the gate read) so any
systematic flip shows.

## SEED-BAND FRESHNESS (verified BEFORE sims, 2026-11-08, by this worker)

Scope (per ~/workspace/custom-skills/local_seed_band_freshness/
SKILL.md): every seed checked individually against ALL dated
`evidence/*/sim-*-prereg.md`, the convergence tracker
(hidden_files/convergence-tracker.md), `hidden_files/sim-findings.md`.
No standalone forbidden/contaminated band list file exists in
hidden_files (the word "forbidden" appears inside older preregs
only, naming no list).

- PILOT band 96301–96308: NOT FRESH — DELIBERATE REUSE, recorded
  here and ordered by the task. Named as the range "96301–96308"
  in evidence/2026-11-07/sim-tendsick-a-prereg.md and
  evidence/2026-11-07/sim-feveranat-a-prereg.md (same-run siblings,
  fleshout-20261107T1928Z; per-seed hits: 96301, 96303, 96306,
  96308 in both; 96302/96304/96305/96307 appear only inside the
  range string). WHY the reuse: direct comparability with the
  tendsick pilot on IDENTICAL seeds — the cheaptend question is
  only answerable against the tendsick numbers, and identical seeds
  are what make the before/after a comparison instead of two
  different villages. The reuse is safe BECAUSE the baseline is
  re-swept on THIS base (see Substrate note): no tendsick number
  is leaned on; the baseline is measured fresh, and the armed leg
  is the only lever leg on the band in this run. If a sibling lands
  first with a judged corpus on this band, my baseline numbers must
  reproduce theirs or the discrepancy is a finding (same
  replication rule the tendsick prereg recorded).
- CONFIRM band 96309–96324 (16 seeds): FRESH for use, with the one
  naming recorded honestly. Grep: 0 hits in any dated prereg
  EXCEPT the range endpoints 96309 and 96324 in
  evidence/2026-11-07/sim-tendsick-a-prereg.md, where the band is
  named as the tendsick arm's own confirm band — a reservation
  NEVER exercised (tendsick was NO-GO at pilot; no confirm ran; no
  judged corpus exists on the band). No hits in the convergence
  tracker (0) or sim-findings.md (0). This run's task explicitly
  re-assigns the band to this successor arm's confirm; the naming
  is the predecessor's unexercised reservation, not a competing
  claim. Confirm runs ONLY on a pilot GO, same GO threshold, same
  policies/horizon.

## Substrate note (master moved — re-baseline, never lean on tendsick's numbers)

The task named the tendsick baseline (base 018295600, a coordinator
evidence commit). Master has moved since: this branch sits at
2bc17d793 (current master; origin/master 0ce76898f is an ancestor,
merge-base = 0ce76898f, `git log HEAD..origin/master` empty — the
branch already contains current origin/master, so no rebase is
needed and none was run). The pilot therefore RE-SWEEPS the
competent-only baseline on THIS base (Phase A below) and judges
the armed leg ONLY against its own baseline. The tendsick numbers
(0.065 sick-days, 1 starvation death, 128d median, 407,478 foraged
kcal) are context, never inputs.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

### Phase A — BASELINE (fully pre-registered here; no lever built yet)

- Substrate: branch sim-cheaptend-a @ 2bc17d793 (current master).
  Policy: competent ONLY (scripts/policies/competent.js,
  UNMODIFIED). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1, CHEAPTEND_A unset (the layer gate is OFF — and
  the baseline sweep FATALs if it is set). Horizon: 150d
  death-aware cap (dead villages stop; runDays endReason recorded
  per seed; no fixed-200d run, no tail padding beyond the
  harness's own stop). Seeds: 96301–96308 (8 seeds, one batch —
  the pilot batch IS the baseline batch).
- Instruments (all NEW, derived from the tendsick-a pattern —
  competent FIXED, env FATAL-asserted, registerDeath CALLS
  THROUGH, wrappers read-only + call-through + zero extra RNG,
  writeRobust fresh-child writer, stdout to the caller's pipe):
  scripts/sweep-cheaptend-a.js, scripts/analyze-cheaptend-a.js,
  scripts/test-cheaptend-a.js. Deltas vs tendsick-a, declared here:
  1. Names/paths: cheaptend-a-*, corpus
     evidence/2026-11-07/cheaptend-a-corpus/ (baseline) and
     cheaptend-a-corpus-armed/ (pilot, Phase B). Policy name
     'cheaptend-a' is consistent between the sweep registration
     and the analyzer filename regex (the tendsick adoption had
     to fix exactly that one-line mismatch — `tendsick` vs
     `tendsick-a`).
  2. POLICY switch: `POLICY=competent|cheaptend-a` (FATAL if
     anything else). The cheaptend-a policy module is required
     LAZILY, only on the armed leg, so the baseline leg never
     loads it. Armed leg additionally FATAL-requires
     CHEAPTEND_A=1; baseline leg FATALs if CHEAPTEND_A=1.
  3. Event wrappers KEPT from tendsick-a (villageSicknessTick,
     villagerFoodPoisoning, treatVillager / tendVillager,
     villagerCareTick — all read-only, call-through, no RNG).
  4. Daily snapshot EXTENDED with the gate's own instruments:
     `tripPlanned` = competent.needTrip(Game, ctx) at snapshot
     time (the trip decision the layer will read), `eligible` =
     sickCount > 0 AND scholar at Haven AND NOT tripPlanned
     (the days the layer COULD fire), `ctStats` = cumulative
     counters from the cheaptend module STATS (armed leg;
     baseline reads 0 — the counters are the engagement
     instrument). All tendsick snapshot fields KEPT (sickCount,
     sickNames, atHaven, scholar healing abilities, scholar kcal,
     healerPresent, medicCount, pantry, freshDays, throttle,
     assignments, season/weather, meanHealth, pop, hungry) so the
     guardrails compare like-for-like.
  5. Flow wrappers KEPT (stockPantry, sweepSpoiled, pantryDraw,
     drawSpoiled, stockSurplus, drawLeaguePool, pantryAdd,
     donateToPantry, takeFromPantryBulk/takeFromPantry,
     _removePantryKcal, resolveOneAssignment, villagerMealDay
     deduped rows with production factors) — the forage-cost bar
     needs them. villagerDepleteTiles / villagerHuntResolve NOT
     carried (not this arm's question).
  6. BARE mode (CHEAPTEND_BARE=1): same seeds/days/policy, all
     recorders SKIPPED except the registerDeath capture
     (documented exception, as in tendsick-a), writes only a
     fingerprint per seed. The recorded run must match it exactly
     (gate G2).
  7. Per-seed files: evidence/2026-11-07/cheaptend-a-corpus/
     cheaptend-a-<policy>-s<seed>.json (daySeries + flowSeries +
     mealRows + deathRows + sickOnsets + sickEnds + treatEvents +
     totals + `endReason` — NEW: the sweep records the harness
     endReason in perSeed so the analyzer can apply the G3
     final-day revision below). Bare fingerprints:
     cheaptend-a-bare-s<seed>.json in the same directory.
- EPISODE (definition, fixed before any judged sweep — same as
  tendsick-a / feveranat-a): one continuous sickness spell for one
  person, from the villageSicknessTick / villagerFoodPoisoning
  creation event to the removal event (recovered / died / cured).
  Onset day is the `dayOf()` at the creation call; an episode open
  at run end is counted separately. Duration = end day − onset
  day (in whole days).
- Baseline questions (each gets a pooled number; the baseline is
  COMPLETE when all five are answered — same B1–B5 as tendsick-a,
  plus the gate's pool):
  - B1 FEVER BURDEN: sick-days per village-day, mean episode
    duration, episodes per seed, villagers affected, sickness
    deaths.
  - B2 OPPORTUNITY + GATE POOL: sick-at-Haven days (layer could
    fire under the tendsick shape), ELIGIBLE days (sick + at
    Haven + no trip planned — the days THIS layer could fire),
    scholar healing-ability holdings (days held / at L2+),
    treat/tend events under competent (expect promise-keeping
    only), tripPlanned share (what fraction of sick-at-Haven
    days the trip was planned — the pool the gate removes).
  - B3 PRODUCTION COST: healthFrac and produced/need during
    fever days vs non-fever days.
  - B4 GUARDRAILS (the numbers the pilot judges against):
    villager starvation deaths, median survival, empty-pantry
    village-days, wave reach, death-cause shares,
    national/table/wins.
  - B5 NPC CARE: villagerCareTick tends per episode.
  - FORAGE BASELINE (for the pilot's forage-cost bar, pooled
    from flowSeries stocked): 'Foraged food' kcal, 'Fish catch'
    kcal, duty-stocked ALL names kcal (Σ over all stocked names).
- Baseline GO: all five questions + the forage baseline answered
  with pooled numbers. The baseline is measurement only: zero
  src/js changes in Phase A, zero policy changes (the layer file
  does not exist yet).

### Phase B — LEVER (exact layer, fixed here BEFORE any pilot sweep)

- SELECTION RULE (binding): the lever is the CHEAPTEND layer —
  the scholar-player tends sick/fevered villagers at Haven ONLY on
  days the forage trip would not range anyway, capped at 2 acts/day.
  It is policy-side ONLY (zero src/js), default OFF
  (CHEAPTEND_A=1 arms it).
- **Name: CHEAPTEND — tend the sick only with time the trip was not going to use.**
- **File: scripts/policies/cheaptend-a.js** (NEW — wraps
  competent.js, does NOT edit it or tendsick-a.js; takeseat/
  doorwalk composite pattern). **Env flag arming it:
  `CHEAPTEND_A=1`.** Off / unset = baseline (the sweep FATALs on
  any other combination).
- **Hook:** `cheaptendA.daily(Game, ctx)` — the tend drive runs
  FIRST in daily (scholar at Haven, before the trip leaves), then
  delegates to `competent.daily` unchanged. `upkeep` / `fight` /
  all other policy methods delegate to competent verbatim via
  `Object.assign({}, competent, {...})`.
- **Gate (all must hold or the drive skips, classified in STATS):**
  layer on (CHEAPTEND_A=1); game not over; no live fight
  (`Game.tbfight` over or absent); scholar at Haven
  (`Game.playerAtHaven()`); ≥1 sick patient; **NOT-RANGING:
  `competent.needTrip(Game, ctx)` is FALSE** (skip reason
  'ranging' when it is true). The drive never fires while away,
  mid-fight, after game over, or on a day the trip is planned.
- **Patients:** live roster members with a `v.sick` record at
  daily time. Triage order: lowest estimated days-to-death first —
  `hp / (1 + severity*2)` ascending (the night's sick damage,
  healer −1 NOT adjusted — conservative), tie-break lowest
  `daysLeft`. **Daily cap: at most 2 acts (treats + tends combined,
  64 ticks — an eighth of the 512-tick day).**
- **Ladder per patient (identical to tendsick — treat only when it
  CURES):**
  1. Curative treat — if the scholar holds a L2+ ability that CURES
     this patient's disease (`villagerDiseaseId(rec)`:
     herbal_remedy cures disease/wound_fever/gutrot;
     field_medicine and triage cure wound_fever only) AND scholar
     kcal ≥ 150 AND (`daysLeft > 1` OR `hp <= sickDmg` — cure when
     it saves days, or saves a life on the last night) →
     `Game.treatVillager(vid, abilityId)`. Preference order:
     herbal_remedy, then field_medicine, then triage.
  2. Else tend — `Game.tendVillager(vid)` (skilled if any healing
     ability held at any level, else unskilled). A daysLeft==1
     patient with safe HP is tended, not treated — they recover
     tonight anyway, and the tend still cuts tonight's damage
     (severity −1).
  3. No examine step (needsDiagnosis is false for all three NPC
     diseases). No wound-only patients (out of scope). No
     scholar-self treatment (out of scope). No kcal spend except
     the engine's own 150 for a curing treat.
- **"Instead of ranging" (mechanism, stated honestly):** the drive
  runs before `competent.daily` in the same call, and each act
  costs 32 real ticks — but ONLY on days needTrip is already
  false, so the trip was not going to draw on the day at all.
  Whether the forage cost actually shrinks is MEASURED (stocked
  kcal vs the baseline above), not assumed — the forage-cost bar
  below is the judge.
- **Counters:** module STATS (`resetCheaptendStats` /
  `cheaptendStats`) — tended, treated, cured, eased, skipped-by-
  reason (incl. 'ranging'), errors; the sweep reads them per day
  (cumulative, into the snapshot) and at run end.
- **Proof test** (`scripts/test-cheaptend-a.js`, legs L12–L17):
  L12 gate-OFF RED (CHEAPTEND_A unset → zero acts even with sick
  villagers present); L13 gate-ON fires on a no-trip day
  (pantry full, kcal high, recent give → tend/treat acts fire,
  STATS count them); L14 ranging-day RED (trip planned —
  pantry low OR kcal low — → zero acts, skip 'ranging'
  recorded); L15 daily cap (3 sick patients on a no-trip day →
  exactly 2 acts, never a 3rd); L16 treat cures (scholar with
  herbal_remedy L2 treats a sick villager → `v.sick` record
  deleted, cure counted); L17 triage + daysLeft==1 rule (lowest
  days-to-death first; daysLeft==1 + safe HP → tend, not treat;
  daysLeft==1 + lethal HP → treat). Plus `node scripts/check.js
  --quick` after the policy file lands (policy-side only, zero
  src/js — belt-and-braces, not a gate).

### Pilot GO (binding — all bars from the task, finalized here against the tendsick context, judged ONLY against MY OWN baseline)

- **PRIMARY: sick-days per village-day ratio ≤ 0.90 vs own baseline**
  (armed ≤ 0.90 × baseline; tendsick context 0.065 → would be
  ≤ 0.0585, but the bar is computed from MY baseline, not
  tendsick's). Mean episode duration is secondary — reported,
  expected down, NOT gated.
- **STARVATION: villager starvation deaths ≤ baseline + 1**
  (analyzer: STARVE_MAX = null means baseline count + 1).
- **SURVIVAL: median survival ≥ 0.8 × baseline median.**
- **PER-SEED: ≤ 1 seed regressing > 30d vs its own baseline.**
- **FORAGE-COST (new — the tendsick kill reason, all three must
  hold): foraged food stocked ≥ 0.9 × baseline AND fish catch
  stocked ≥ 0.9 × baseline AND duty-stocked all names ≥ 0.9 ×
  baseline (pooled stocked kcal from flowSeries; per-village-day
  rates printed alongside for interpretation).**
- **ENGAGEMENT: ≥ 10 tend/treat acts AND acts on ≥ 25% of
  ELIGIBLE sick-at-Haven days** (eligible = sick + at Haven + no
  trip planned — the days the layer COULD fire; the denominator is
  the eligible pool, because the layer is gated to it by design
  and a bar on ranging days would measure the gate, not
  engagement). The analyzer ALSO prints acts as a share of ALL
  sick-at-Haven days (the tendsick denominator) for comparability.
- All six must hold. A miss is NO-GO, never re-scored against a
  friendlier metric mid-run. Kill taxonomy (§14a) recorded on a
  kill.
- Confirm (only on a pilot GO): 16 fresh seeds 96309–96324, same
  GO threshold, same policies/horizon.
- Balanced panel (§15): attempt on the lever's before/after —
  register 'cheaptend-a' in scripts/sweep-compare.js
  POLICY_REGISTRY (guarded try/catch, same pattern as the other
  registrations); build `node scripts/balance-panel.js --out
  <before|after> --seeds 96301,...,96308 --policies competent |
  cheaptend-a --days 150` on this root (CHEAPTEND_A=1 set for the
  after-panel build only), then `node scripts/balance-panel.js
  compare --before <base-panel.json.gz> --after
  <lever-panel.json.gz> --out <prefix> --intervention-flags
  CHEAPTEND_A`; attach the compare .md. KNOWN failure class named
  in advance: the panel ingests panel.json.gz via sweep-compare,
  not the diag sweep corpora — if it fails in the
  registry/ingestion class (as in awayconfirm/cover-b/0630Z), attach
  the analyzer's before/after replication table instead and name
  the class. A tooling failure NEVER blocks or re-scores the
  verdict.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/cheaptend-a-corpus/cheaptend-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a
  same-run investigation item — dig into the deviation (explained
  vs real bug) BEFORE rolling the baseline forward with
  `--update-baseline`. Report LOUD lines with verdict.
  (Expectation: competent-only 150d shows national/table/wins 0 —
  the awayconfirm/prodcollapse runs hit the identical LOUD lines
  as a regime artifact; do NOT roll the baseline on a regime
  artifact.)

### G3 final-day revision (PRE-REGISTERED policy — the tendsick metric review's proposed revision, adopted here before any sims)

The tendsick G3 letter rule excuses a missing final-day flow row
ONLY when a death is recorded that day; s96307 (village-lost end,
finalPop 3, last death d99) failed it on a day with no death. The
REVISED rule, applied in this run's analyzer from the start:
**excuse the final day's missing snapshot/flow when the run ends
mid-day — endReason `village-lost` OR `over-other` (the harness's
game-over value; `scripts/sim-harness.js` runDays returns
'village-lost' / 'over-other' / 'survived' — there is no literal
'game over' value) — not only when a death is recorded that day.**
A 'survived' end (150d cap reached) excuses nothing: a full run
must have full days. Both the letter and the revised verdicts are
printed; the revised is the binding corpus check. The corpus is
valid for the verdict when the revised check passes.

### GO constants (in scripts/analyze-cheaptend-a.js, set by this prereg before the pilot sweep)

PRIMARY='sickdays', PRIMARY_MAXFRAC=0.90, STARVE_MAX=null
(baseline+1), SURV_MINFRAC=0.80, PERSEED_MAXREG=1,
PERSEED_REGDAYS=30, ENGAGE_MIN_ACTS=10, ENGAGE_MIN_SHARE=0.25,
FORAGE_MINFRAC=0.90.

### Pilot plan

- Same 8 seeds (96301–96308), competent substrate + CHEAPTEND
  layer, 150d death-aware, PLENTYDEPRI=1 DEPOSITGATE=1
  CHEAPTEND_A=1, armed corpus
  `evidence/2026-11-07/cheaptend-a-corpus-armed/` vs the Phase-A
  baseline corpus. Analyzer in comparison mode (`node
  scripts/analyze-cheaptend-a.js <armed-dir> <baseline-dir>`);
  before/after compared in the evidence file (analyzer
  replication tables). Balanced panel attempted per the header;
  telemetry check per the header.
- Convergence state reported every run: converging | converged |
  parked | killed-at-pilot.

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

## Metric review (post-run)

(to be filled after the sweeps)

## Sense (SENSE-TESTING LAW)

(to be filled after the sweeps — transcripts read on at least two seeds, beats quoted)

## Village assessment in plain words

(to be filled after the sweeps)

## Blanks filled or documented

(to be filled after the sweeps)

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be filled after the sweeps)
