# sim-tendsick-a — TREAT THE FEVER IN THE WILD (arm sim-tendsick-a)

Run: oversight-flesh-out-loop, run fleshout-20261107T1928Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-tendsick-a, branch sim-tendsick-a. Substrate:
branch already contains current origin/master ed7d5d152 (merge-base HEAD
vs origin/master = ed7d5d152, 0 commits behind — the rebase the task
asked for is a no-op; see Substrate note below). Tree clean at prereg
time.

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
mundane = real diseases, earthly vectors and cures; alien = monster meat
/ giant-mosquito / alien-tick effects, never diagnosed, eased, or cured
by mundane medicine; cure tiers folk remedies → occupation medicine →
specific ruin medicine → healer deepenings → the Fever's End synergy;
diagnosis unlocks the true name, class, and cure direction). No canon
doc covers a tending lever's numbers — the numbers below are
measurement, not canon. If this arm names a new rule, it is a finding,
not canon.

## The question (tracker next blank (1), first half)

The 1820Z diagnosis (sim-prodcollapse-diag-a) proved HEALTH is the
binding constraint of production collapse — a fever halves village
health and production follows health down (96203: 41-day episode,
healthFrac 0.553 vs 0.862 baseline, 3 starvation + 7 sickness deaths).
This arm tests the first half of the tracker's next blank: whether
villagers (via the scholar-player) can TREAT the fever in the wild.

## How treatment works (code-read before sims, not guessed)

- NPC sickness is a LIGHT sim (`v.sick[vid] = {name, daysLeft,
  severity}`, game.js villageSicknessTick, once per day in endDay).
  Three vectors, each an independent per-villager roll, no contagion:
  wound fever (health < 40, 15%/day, severity 2), gut rot (drank dirty,
  10%/day, severity 2), tick fever (forager/explorer range, 3%/day,
  severity 1). Food vectors at meal time (villagerFoodPoisoning):
  'food poisoning (…)', 'bad belly', 'spoiled gut', 'poisoned (…)'.
  Tick: `daysLeft -= 1`/day; damage `1 + severity*2` HP/day (−1 if a
  healer is present in camp); recovery when `daysLeft <= 0` ("on the
  mend — the fever broke"); death through hurtVillager with cause
  'sickness' (or the disease id when the village knows it).
  `daysLeft` at onset is 3–6 days (3 + floor(rand*4); 'bad belly'
  2–4). `villagerDiseaseId(rec)` maps 'wound fever' → wound_fever,
  'gut rot' → gutrot, 'tick fever' → disease; food-poisoning names
  map to null.
- NPC care already exists: `villagerCareTick` — medical-occupation
  villagers (nurse/medic/doctor/paramedic/midwife/veterinarian/
  pharmacist/herbalist/dentist; severity-2+ sick medics stay down)
  tend one sick villager per day each (two with the triage ability):
  `daysLeft -= 1`, remembered, 25% say-line. A camp WITH a healer
  also slows the worsening (−1 HP/day on the sick tick).
- Player-side verbs (game.js, all real, none stubbed):
  - `tendVillager(vid)` (32 ticks): sits with a sick villager (or
    cleans a wound, +25 HP if hp < 70 and not sick). Skilled (has
    herbal_remedy OR field_medicine OR triage, ANY level):
    daysLeft −= 2 (floor 1), severity −= 1. Unskilled: daysLeft −= 1
    (floor 1). Keeps 'heal' promises; +3 bond ('tended'). Refuses
    ("They're not sick.") when there is no record and no wound.
  - `treatVillager(vid, abilityId)` (32 ticks + 150 kcal): requires
    the ability at L2+ ("not steady enough to work on someone else
    yet — deepen it to L2 first"); refuses below 150 kcal ("Too
    hungry to give"). Cure table (src/data/statusEffects.json):
    herbal_remedy CURES disease / wound_fever / gutrot;
    field_medicine and triage CURE wound_fever, EASE disease /
    gutrot. `needsDiagnosis: false` for all three NPC diseases —
    NO diagnosis gate on a cure. A cure deletes the `v.sick`
    record immediately ("Cured — and the camp saw it"), +4 trust,
    +3 bond ('treated'), noteDeed('healing'), +2 ability XP. An
    ease/support: daysLeft −= 2 (floor 1), severity −= 1. A
    non-matching disease id (food-poisoning names → null):
    daysLeft −= 2, no cure. Wound care is OUT OF SCOPE for this
    arm (sick only; wounds are a different lever).
  - `examineSick(vid)` (diagnosis): names the disease
    (`rec.diagnosed`, markDiseaseKnown) at diagnoseOdds(). NOT
    needed for a cure (see above) — the layer does NOT examine.
- Competent policy TODAY (scripts/policies/competent.js, read, not
  assumed): treats villagers ONLY through promise-keeping
  (`keepPromiseHeal`, called from `keepPromises` morning + evening
  under COMPETENT_WARM): treatVillager L2+ at 150 kcal, else
  tendVillager, else comfort — but ONLY for a villager with an open
  'heal' promise. It removes attached ticks when skilled
  (`checkTicks`); it never calls folkRemedy / treatDisease /
  useMedicine / examineSick on its own, and it never tends a sick
  villager who has no promise. **The lever is therefore NOT a
  no-op**: the competent scholar walks past sick villagers with no
  promise. What is unknown — and what the baseline measures — is
  how often the scholar even HOLDS a healing ability at L2+
  (ability offers are the System's; competent takes the first
  offer), and how often sick villagers are at Haven at daily time.
- The day's time budget: 512 ticks/day (4 parts × 128). Each
  tend/treat costs 32 real ticks. The harness calls policy.daily
  once per day, AFTER the 3 day-part waits — i.e. the scholar is
  still at Haven at daily time on most days (the forage trip
  happens INSIDE daily), so a tend drive at the TOP of daily
  catches the scholar at home BEFORE the trip leaves. That is the
  "instead of ranging" seat: tending is paid out of the same day
  the trip draws on. Whether the trip actually shrinks is measured
  (stocked kcal, trip counts), not assumed — the day has slack
  (waits fill unused ticks; daily leaves an evening margin), so a
  zero forage cost is a finding about the time economy, not a
  flaw in the measurement.

## Substrate note (master moved — rebase a no-op)

The task named master 3ddc3cbd5; the explicit re-read
(`git fetch origin && git rev-parse origin/master`, run before
this prereg) gives **ed7d5d152** ("sim-mealday-caller-a: DIAG-GO —
endDay runs twice on player-death nights"). 3ddc3cbd5 is an ancestor
of ed7d5d152 (its 3rd parent back); the local main-tree master is
stale at 3ddc3cbd5. This branch's merge-base with origin/master IS
ed7d5d152 and `git log HEAD..origin/master` is empty — the branch
already sits on current origin/master, so no rebase is needed and
none was run (the known rebase stop-at-pick sequencer quirk is not
worth inviting for a no-op). Judged sims run on base ed7d5d152.
The 28 commits ahead of origin/master are this branch's own
prodstore/prodcollapse work (coordinator evidence 018295600 and
below); zero src/js net vs origin/master in that stack (the
PLENTY-WEEK lever was reverted before landing, game.js
byte-identical to master).

## SEED-BAND FRESHNESS (verified BEFORE sims, 2026-11-07, by this worker)

- Chosen band 96301–96308: FRESH in the landed record. Scope: all
  dated preregs (evidence/*/sim-*-prereg.md — every one of the 8
  seeds checked individually, 0 hits each);
  convergence-tracker.md (0 hits); sim-findings.md (0 hits). No
  prereg, screen, extension band, or forbidden/contaminated list
  names any 96301–96308 seed in the landed record.
- SHARED-BAND NOTE (recorded honestly — it does not change the
  freshness verdict, it bounds it): two same-run sibling branches
  also name 96301–96308 — sim-feveranat-a (fever anatomy diagnosis)
  and sim-sickfloor-a (Phase A baseline plan), both Loop A
  fleshout-20261107T1928Z. Neither is landed (their preregs live
  only on their branches, not in evidence/ on master). This is the
  1820Z shared-band pattern (prodstore + prodcollapse both ran
  96201–96208 deliberately): both siblings are diagnosis/baseline
  arms on competent, so my BASELINE leg is a replication check
  against theirs, and my ARMED leg is the only lever leg on the
  band. If either sibling lands first with a judged corpus on this
  band, my baseline numbers must reproduce theirs (pooled
  produced/need 1.054-style check) or the discrepancy is a finding.
- Confirm band (only if the pilot GOes): 96309–96324 — freshness to
  be re-verified in the Phase-B amendment before any confirm sweep;
  NOT assumed fresh here.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

### Phase A — BASELINE (fully pre-registered here; no lever built yet)

- Substrate: branch sim-tendsick-a @ ed7d5d152 (current
  origin/master). Policy: competent ONLY
  (scripts/policies/competent.js, UNMODIFIED). Env (explicit, =
  shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1, TENDSICK_A
  unset (the layer gate is OFF — and the baseline sweep FATALs if
  it is set). Horizon: 150d death-aware cap (dead villages stop;
  runDays endReason recorded per seed; no fixed-200d run, no tail
  padding beyond the harness's own stop). Seeds: 96301–96308 (8
  seeds, one batch — the pilot batch IS the baseline batch).
- Instruments (all NEW, derived from the prodcollapse diagnosis
  pattern — competent FIXED, env FATAL-asserted, registerDeath
  CALLS THROUGH, wrappers read-only + call-through + zero extra
  RNG, writeRobust fresh-child writer, stdout to the caller's
  pipe): scripts/sweep-tendsick-a.js,
  scripts/analyze-tendsick-a.js, scripts/test-tendsick-a.js.
  Deltas vs prodcollapse, declared here:
  1. Names/paths: tendsick-a-*, corpus
     evidence/2026-11-07/tendsick-a-corpus/ (baseline) and
     tendsick-a-corpus-armed/ (pilot, Phase B).
  2. POLICY switch: `POLICY=competent|tendsick-a` (FATAL if
     anything else). The tendsick-a policy module is required
     LAZILY, only on the armed leg, so the baseline leg never
     loads it. Armed leg additionally FATAL-requires
     TENDSICK_A=1; baseline leg FATALs if TENDSICK_A=1.
  3. NEW event wrappers (all read-only, call-through, no RNG;
     each logs to an in-memory per-seed event array):
     villageSicknessTick (diff `v.sick` before/after: onsets with
     name/daysLeft/severity, ends with outcome), treatVillager /
     tendVillager (diff `v.sick`: cured / eased / wound-care /
     refused), villagerCareTick (diff daysLeft: NPC-tended
     patients). Treat/tend wrappers ALSO record the scholar's
     ability holdings at call time (hasAbility + level for the
     three healing abilities, scholar kcal).
  4. Daily snapshot EXTENDED (same clock as prodcollapse,
     policy.daily pre-meal, post-work): sickCount =
     Object.keys(v.sick).length (NOT health<50 — the prodcollapse
     sickCount was a health proxy; this arm measures the real
     record), sickNames (the record names present), sickDays
     cumulative (Σ sickCount over snapshots), scholar healing
     abilities (herbal_remedy / field_medicine / triage: held
     boolean + level, or null), scholar kcal, healerPresent
     (campHealerId('haven') non-null) + medicCount, tend/treat
     counters from the policy module STATS (armed leg; baseline
     leg reads 0 — the counters are the engagement instrument).
     All prodcollapse snapshot fields KEPT (pantry, freshDays,
     throttle, assignments, season/weather, meanHealth, pop,
     hungry) so the guardrails compare like-for-like.
  5. Flow wrappers KEPT (stockPantry, sweepSpoiled, pantryDraw,
     drawSpoiled, stockSurplus, drawLeaguePool, pantryAdd,
     donateToPantry, takeFromPantryBulk/takeFromPantry,
     _removePantryKcal, resolveOneAssignment, villagerMealDay
     deduped rows with production factors) — the forage-cost and
     production guardrails need them. villagerDepleteTiles /
     villagerHuntResolve NOT carried (not this arm's question).
  6. BARE mode (TENDSICK_BARE=1): same seeds/days/policy, all
     recorders SKIPPED except the registerDeath capture
     (documented exception, as in prodcollapse), writes only a
     fingerprint per seed. The recorded run must match it exactly
     (gate G2).
  7. Per-seed files: evidence/2026-11-07/tendsick-a-corpus/
     tendsick-a-competent-s<seed>.json (daySeries + flowSeries +
     mealRows + deathRows + sickOnsets + sickEnds + treatEvents +
     totals). Bare fingerprints: tendsick-a-bare-s<seed>.json in
     the same directory.
- EPISODE (definition, fixed before any judged sweep — same as
  feveranat-a): one continuous sickness spell for one person, from
  the villageSicknessTick / villagerFoodPoisoning creation event
  to the removal event (recovered / died / cured). Onset day is
  the `dayOf()` at the creation call (the night of that day for
  villageSicknessTick, which runs in endDay); the first
  policy.daily snapshot showing the entry is the following day —
  snapshots corroborate, wrapper events are authoritative. An
  episode open at run end (village died / 150d reached while sick)
  is an episode with outcome 'open at run end', counted
  separately. Duration = end day − onset day (in whole days; a
  3-day onset that recovers on the 3rd night counts 3).
- Baseline questions (each gets a pooled number; the baseline is
  COMPLETE when all five are answered):
  - B1 FEVER BURDEN: sick-days per village-day (Σ sickCount /
    Σ village-days over snapshots), mean episode duration
    (recovered + died + cured episodes; open-at-run-end reported
    separately), episodes per seed, villagers affected (distinct
    vids), sickness deaths.
  - B2 OPPORTUNITY: sick patient-days at Haven at daily time
    (days where sickCount > 0 AND the scholar is at Haven when
    policy.daily runs — the days the layer COULD fire), scholar
    healing-ability holdings (days with herbal_remedy /
    field_medicine / triage held, and at L2+), treat/tend events
    under competent (expect promise-keeping only — the count that
    proves the lever is not a no-op).
  - B3 PRODUCTION COST: healthFrac and produced/need during
    fever days vs non-fever days (same counterfactual shape as
    the prodcollapse diag), plus the villager-day contrast (sick
    vs healthy persons on the same days).
  - B4 GUARDRAILS (the numbers the pilot judges against):
    villager starvation deaths, median survival, empty-pantry
    village-days (pantryKcal == 0 at snapshot), wave reach,
    death-cause shares, national/table/wins.
  - B5 NPC CARE: villagerCareTick tends per episode (how much
    care the village already gives itself — the floor the layer
    adds to).
- Baseline GO: all five questions answered with pooled numbers.
  The baseline is measurement only: zero src/js changes in Phase
  A, zero policy changes (the layer file does not exist yet).

### Phase B — LEVER (selection rule pre-registered here; exact layer named in a dated amendment BEFORE the pilot sweep)

- SELECTION RULE (binding): the lever is the TENDSICK layer —
  the scholar-player tends sick/fevered villagers at Haven
  instead of ranging, when fever is present. It is policy-side
  ONLY (zero src/js), default OFF (TENDSICK_A=1 arms it). The
  amendment names the exact layer behavior (patients, ladder,
  triage order, daily cap, gate conditions), its code location,
  and the env flag BEFORE any pilot sweep runs. The amendment is
  appended to this prereg as a dated addendum — never a silent
  edit.
- Layer shape (pre-registered in outline — the amendment fixes
  the details against the measured baseline):
  - Hook: wraps competent.daily; the tend drive runs FIRST in
    daily (scholar at Haven, before the trip leaves), then
    delegates to competent.daily unchanged. No edit to
    competent.js; the composite follows the takeseat/doorwalk
    pattern (wrap + delegate + env gate + module STATS).
  - Patients: live roster members with a `v.sick` record,
    triage-ordered by urgency (lowest estimated days-to-death
    first — HP divided by daily sick damage `1 + severity*2`,
    tie-break lowest daysLeft). Daily cap: at most 3 patients
    (96 ticks — under a fifth of the day).
  - Ladder per patient (treat only when it CURES — an ease that
    costs 150 kcal is strictly worse than a skilled tend that is
    free): herbal_remedy L2+ (cures all three NPC diseases) →
    treat; else wound_fever + field_medicine/triage L2+ → treat;
    else tendVillager (skilled if any healing ability held at
    any level, else unskilled). No examine step (needsDiagnosis
    is false for all three NPC diseases). No wound-only patients
    (out of scope). No kcal spend except the engine's own 150
    for a curing treat.
  - Engagement check (binding, judged on the pilot): the layer
    fires — ≥10 tend/treat acts across the 8-seed pilot AND acts
    on ≥25% of sick-at-Haven days. If it never fires, the pilot
    is NO-GO (engagement), no confirm, and the evidence says why
    (scholar never at Haven at daily time / never holds the
    abilities / no fever — whichever the baseline + counters
    show).
- Pilot GO (binding — exact primary + threshold finalized in the
  amendment against the measured baseline; direction fixed here):
  fever burden DOWN (primary: sick-days per village-day OR mean
  episode duration — the amendment picks ONE) AND villager
  starvation deaths ≤ baseline AND median survival ≥ 0.8×
  baseline AND per-seed survival non-inferior (pooled medians
  hide broad regressions — carry a per-seed guardrail: no more
  than 1 seed regressing by >30 days vs its own baseline, unless
  the pooled fever-burden gain is decisive — the amendment pins
  the exact form). Both the primary and all guards must hold. A
  miss is NO-GO, never re-scored against a friendlier metric
  mid-run. Kill taxonomy (§14a) recorded on a kill.
- Confirm (only on a pilot GO): 16 fresh seeds (band named +
  freshness-verified in the amendment), same GO threshold, same
  policies/horizon.
- Balanced panel (§15): attempted on the lever's before/after —
  run `node scripts/balance-panel.js --n 8 --policies competent
  --days 150 --seeds 96301,...,96308 --out <before|after>` on the
  two roots and `compare` them; attach the compare .md. KNOWN
  failure class named in advance: the panel ingests panel.json.gz
  via sweep-compare, not the diag sweep corpora — if it fails in
  the recorder-ingestion class (as in awayconfirm/cover-b/0630Z),
  attach the analyzer's before/after replication table instead
  and name the class. A tooling failure NEVER blocks or re-scores
  the verdict.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/tendsick-a-corpus/tendsick-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a
  same-run investigation item — dig into the deviation (explained
  vs real bug) BEFORE rolling the baseline forward. Report LOUD
  lines with verdict. (Expectation: competent-only 150d shows
  national/table/wins 0 — the awayconfirm/prodcollapse runs hit
  the identical LOUD lines as a regime artifact; do NOT roll the
  baseline on a regime artifact.)

## Results

(to be filled after the sweeps — verdict judged ONLY against this header)

---

## PHASE-B AMENDMENT

(to be appended BEFORE any pilot sweep runs — layer behavior + GO threshold + confirm band)

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
