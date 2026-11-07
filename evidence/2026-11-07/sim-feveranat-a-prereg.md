# sim-feveranat-a — FEVER ANATOMY DIAGNOSIS (arm sim-feveranat-a)

Run: oversight-flesh-out-loop, run fleshout-20261107T1928Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-feveranat-a, branch sim-feveranat-a.
Substrate: worktree HEAD 0182956007a61d02b246070ca46b92bb1bcbb at prereg
time (coordinator round-1820 evidence commit: prodstore NO-GO killed at
pilot, prodcollapse DIAG-GO HEALTH, merged locally pending ship). Tree
clean at prereg time.

## Canon

READ docs/CANON.md first, then docs/DISEASES.md (two pools, never mix;
mundane = real diseases, earthly vectors and cures; alien = monster
meat / giant-mosquito / alien-tick effects, never diagnosed, eased, or
cured by mundane medicine). No canon doc covers a fever-episode
number — the numbers below are measurement, not canon. If the
diagnosis names a new rule, it is a finding, not canon.

## The question (tracker next blank, first half: what spreads the fever)

The 1820Z diagnosis (sim-prodcollapse-diag-a, commit 6e418c617)
proved HEALTH is the binding constraint of production collapse. Seed
96203: a fever swept through from ~day 12, mean health fell to ~55%,
produced/need 0.67 for 41 days, 3 starvation deaths, 7 sickness
deaths. The fever itself is UNNAMED in that corpus ('sickness' deaths,
'the fever broke' in say-lines). This arm answers the first half of
the tracker's next blank: what spreads the fever, and whether
villagers can avoid or treat it.

## How sickness works (code-read before sims, not guessed)

- NPC sickness is a LIGHT sim (`v.sick[vid] = {name, daysLeft,
  severity}`, game.js villageSicknessTick, once per day inside
  endDay). Three vectors, each an independent per-villager roll, no
  contagion, no household/contact structure (grep-verified: no
  `household` field, no spread/contagion function touches `v.sick`):
  - wound fever: villager health < 40, 15%/day (7.5% while triage
    hygiene stands), severity 2.
  - gut rot: the village drank dirty (`v.drankDirty`, or clean
    cistern empty while dirty remains), 10%/day, severity 2.
  - tick fever: forager/explorer range profile (`npcRangeProfile`),
    3%/day, severity 1.
  - NO mosquito vector for NPCs (ambient mosquitoes bite the
    scholar only); NO bad-food vector in this tick.
- Food vectors live at meal time (`villagerFoodPoisoning`, called
  from villagerMealDay): raw food ~20% (halved by purify /
  iron_stomach), unsafe food 20%, spoiled food 50% (desperation),
  poison per exposure, monster-meat weirdness (alien quirks via the
  status engine, NOT `v.sick`). Names recorded: 'food poisoning
  (<note>)', 'bad belly', 'spoiled gut', 'poisoned (<note>)'.
- NPC tick: `daysLeft -= 1` per day; damage `1 + severity*2` HP/day
  (−1 if a healer is present in camp); recovery when `daysLeft <= 0`
  ("on the mend — the fever broke"); death through the normal
  hurtVillager pipeline with cause 'sickness' (or the disease id when
  the village knows it — `villagerDiseaseId` maps 'wound fever' /
  'gut rot' / 'tick fever' to wound_fever / gutrot / disease).
  `daysLeft` at onset is 3–6 days (3 + floor(rand*4); 'bad belly'
  2–4). A `v.sick` record carries NO source/vector field — the
  recorder must attribute the vector at creation time (see
  Instruments).
- SCHOLAR (player) sickness is the FULL status engine
  (src/data/statusEffects.json, scope scholar, durations in dayParts,
  4/day): Fever `disease` 8 parts (2 days), wound_fever 8, gutrot 8,
  lockjaw 16 (LETHAL at expiry untreated), trichinosis 24, trembles
  40 (LETHAL at expiry, no cure at any tier). Tick −2 HP/part
  (disease/wound_fever/gutrot/lockjaw), −1 (trichinosis). Scholar
  vectors: mosquito 1.5% per part in wetland at dusk/night; attached
  tick escalating 3%→15%/day (one roll/day); wounds at health < 40
  (12% wound_fever / 4% lockjaw per vector tick); bad food/water via
  eating/drinking (contractDisease with a source string); heatwave
  mosquito bite; botched tick removal 40% → wound_fever. Alien
  quirks (howlbelly etc.) arrive via applyStatus from monster meat,
  never via contractDisease.
- TREATMENT IN THE WILD (all code-read, none assumed):
  - `villagerCareTick`: medical-occupation villagers (nurse/medic/
    doctor/paramedic/midwife/veterinarian/pharmacist/herbalist/
    dentist; a severity-2+ sick medic stays down, a severity-1 medic
    pushes through) tend one sick villager per day each (two with
    the triage ability): `daysLeft −= 1`, remembered, 25% say-line.
  - `villagerTreatTick`: a medical villager eases the SCHOLAR's
    sickness, unasked, 35%/day at haven (easeDisease 3 parts).
  - `villagerDiagnosisTick`: a medical villager names the scholar's
    sickness, 40%/day at haven.
  - `villagerTickTeachTick`: a camp healer teaches tick_removal
    within ~a couple days (50%/day at haven).
  - Player-side (competent policy): treats villagers ONLY through
    promise-keeping (`keepPromiseHeal` — treatVillager L2+ at 150
    kcal, else tendVillager 32 ticks); removes attached ticks when
    skilled (`checkTicks`); never calls folkRemedy / treatDisease /
    useMedicine / examineSick on its own. Scholar rest helps
    slow-folk diseases on sleep (`sickRestTick`, 25% per disease,
    −2 parts).
  - `healerRounds` patches WOUNDS (+25 HP), not sickness — out of
    scope for F4 (recorded here so the next run does not count it
    as fever treatment).
  - Cure table (scholar, per disease def): herbal_remedy cures
    Fever / wound_fever / gutrot; field_medicine cures wound_fever;
    triage cures wound_fever; antibiotics cure wound_fever /
    lockjaw; antiparasitic cures gutrot / trichinosis; lockjaw needs
    diagnosis (or L3 healer); trembles has no cure.

## SEED-BAND FRESHNESS (verified BEFORE sims, 2026-11-07, by this worker)

- Chosen band 96301–96308: FRESH. Scope: all dated preregs
  (evidence/*/sim-*-prereg.md — every one of the 8 seeds checked
  individually, 0 hits each); convergence-tracker.md (1 hit for
  "9630" is commit hash 11f96306e in a sim-tickfell-a line, not a
  band); sim-findings.md (0 hits); evidence/2026-11-07/*.md (0
  hits). No prereg, screen, extension band, or
  forbidden/contaminated list names any 96301–96308 seed.
- Coordinator's claim file
  fleshout-20261107T1928Z.json exists in hidden_files/lever-claims/.

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-feveranat-a @ 0182956007a61d02b246070ca46b92bb1bcbb.
  Policy: competent ONLY (scripts/policies/competent.js, UNMODIFIED).
  Env (explicit, = shipped defaults): PLENTYDEPRI=1, DEPOSITGATE=1.
  Horizon: 150d death-aware cap (dead villages stop; runDays
  endReason recorded per seed; no fixed-200d run). Seeds: 96301–96308
  (8 seeds, one batch — the pilot batch IS the diagnosis batch; the
  diagnosis needs no separate pilot).
- Instruments (all NEW, derived from the prodcollapse diagnosis
  pattern — competent FIXED, env FATAL-asserted, registerDeath CALLS
  THROUGH, wrappers read-only + call-through + zero extra RNG,
  writeRobust fresh-child writer, stdout to the caller's pipe):
  scripts/sweep-feveranat-a.js, scripts/analyze-feveranat-a.js,
  scripts/test-feveranat-a.js. Deltas vs prodcollapse, declared here:
  1. All prodcollapse wrappers KEPT (flow wrappers, villagerMealDay
     deduped rows with production factors, registerDeath + pantry
     ctx, say/tele windows, daily snapshot base fields) — F5 needs
     produced/need/healthFrac per villager-day exactly as recorded
     there.
  2. NEW event wrappers (all read-only, call-through, no RNG; each
     logs to an in-memory per-seed event array):
     villageSicknessTick (diff `v.sick` before/after: onsets with
     vector + onset conditions, ends with outcome), villagerFoodPoisoning
     (diff: food-vector onsets), contractDisease (scholar onsets with
     the engine's own source string), applyStatus (disease-roster ids
     only: alien quirks + tick_attached, mundane excluded — they go
     through contractDisease; a reentrancy flag prevents
     double-logging), villagerCareTick (diff daysLeft: tended
     patients), villagerTreatTick (diff scholar easedUntil), diagnoseDisease
     (diagnosis events), treatVillager / tendVillager (diff `v.sick`:
     cured/eased/wound-care), folkRemedy / treatDisease / useMedicine
     (diff scholar seList — expected zero calls under competent, the
     wrapper proves it), removeTick (clean vs botched), sickRestTick
     (diff scholar seList), cureStatus (cure attribution), seRemove
     (scholar episode ends: expired vs removed-early).
  3. Daily snapshot EXTENDED: full `v.sick` map (vid → {name,
     daysLeft, severity, diagnosed}), scholar disease list (id,
     dayPartsLeft, diagnosed, severe, stacks, easedUntil),
     tickAttached (present + attach day), healerPresent
     (campHealerId('haven') non-null) + medicCount, drinksDirty +
     water clean/dirty, triageHygiene, sickMeanHealth vs
     healthyMeanHealth over the live roster.
  4. BARE mode (FEVERANAT_BARE=1): same seeds/days/policy, all
     recorders SKIPPED except the registerDeath capture (documented
     exception, as in prodcollapse), writes only a fingerprint per
     seed. The recorded run must match it exactly (gate G2).
  5. Per-seed files: evidence/2026-11-07/feveranat-a-corpus/
     feveranat-a-competent-s<seed>.json (daySeries + flowSeries +
     mealRows + deathRows + sickOnsets + sickEnds + treatEvents +
     statusEvents + diagnoses + totals). Bare fingerprints:
     feveranat-a-bare-s<seed>.json in the same directory.
- EPISODE (definition, fixed before any judged sweep): one
  continuous sickness spell for one person. NPC: from the
  villageSicknessTick / villagerFoodPoisoning creation event to the
  removal event (recovered / died / cured); scholar: from the
  contractDisease / applyStatus creation event to the seRemove /
  cureStatus removal event. Day convention: onset day is the
  `dayOf()` at the creation call (the night of that day for
  villageSicknessTick, which runs in endDay); the first
  policy.daily snapshot showing the entry is the following day —
  snapshots corroborate, wrapper events are authoritative. An
  episode open at run end (village died / 150d reached while sick)
  is an episode with outcome 'open at run end', counted separately.
- VECTOR ATTRIBUTION (F3, fixed before any judged sweep): the
  engine stores no vector on `v.sick` records, so attribution is by
  creation site + the name→vector map the engine itself enforces:
  villageSicknessTick names map 1:1 ('wound fever' → wound, hp<40;
  'gut rot' → dirty water; 'tick fever' → tick, forager/explorer);
  villagerFoodPoisoning names map 1:1 ('food poisoning (…)' → raw
  food; 'bad belly' → unsafe food; 'spoiled gut' → spoiled food;
  'poisoned (…)' → poison); scholar contractDisease carries the
  engine's source string ('a mosquito bite' → mosquito (ambient);
  'a tick bite' → tick (ambient); 'a cut gone wrong' / 'a dirty
  cut' → wound; 'a botched tick removal' → tick-removal botch; 'the
  creek water' → dirty water; 'the <food>' → food; 'a heatwave
  mosquito bite' → mosquito (heatwave)). Every onset event records
  the corroborating conditions observed at creation (hp, range
  profile, drinksDirty, hygiene, healer present). An onset that
  reaches the analyzer with no creation event (appears in a snapshot
  only) is UNATTRIBUTED, and the sensor gap is named in the
  evidence — the honest outcome, not a re-classification.
- Diagnosis questions (each gets a pooled number; the diagnosis is
  COMPLETE when all six are answered and every fever episode is
  classified by vector/treatment/outcome — or honestly unattributed
  with the sensor gap named):
  - F1 INCIDENCE: fever/sickness episodes per seed, by disease id
    (expect generic Fever `disease` via villagerDiseaseId; record
    any other id that appears), villagers affected (distinct vids),
    sick villager-days per village-day.
  - F2 DURATION: episode duration distribution (onset day, end day,
    recovery vs death vs cured outcome); sick-days as a share of
    village-days.
  - F3 VECTOR ATTRIBUTION: attributed vs unattributed counts per
    vector above; corroboration rates (e.g. wound-fever onsets with
    hp<40 at onset — expect 100% by construction; any miss is a
    finding, not a re-score).
  - F4 TREATMENT IN THE WILD: treatment events by kind (villagerCare
    / villagerTreat / treatVillager / tendVillager / folkRemedy /
    treatDisease / useMedicine / removeTick / sickRest / diagnose);
    episode duration/outcome with vs without treatment; healer
    present vs absent (onset counts, durations). If treatment never
    fires in the wild, that IS the finding.
  - F5 PRODUCTION COST: healthFrac and produced/need during fever
    episodes vs the non-episode baseline (same counterfactual shape
    as the prodcollapse diag: HEALTH kcal vs the pooled non-episode
    baseline), plus the villager-day contrast (sick vs healthy
    persons on the same days). Fever wave = maximal run of days with
    sickCount ≥ 1 (NPC + scholar).
  - F6 SPREAD: onset clustering — new onsets per village-day (0/1/2/
    3+); multi-onset days audited for shared conditions (drinksDirty
    that day, how many hp<40); lag analysis (onsets in the 3 days
    after an onset vs the base rate). Code fact stated in advance:
    no contagion path exists — each villager rolls independently —
    so any clustering must come from shared daily conditions, not
    person-to-person spread; the corpus tests whether it does.
- Gates (judged ONLY against this header):
  - G1 det-gate: recorder deterministic on a fixed seed (same seed
    twice → identical per-seed JSON).
  - G2 neutrality: recorded vs bare fingerprints identical on ALL 8
    judged seeds (daysAlive, endReason, rank, maxWave, national,
    table, win, deathCauses, deathKeys, finalPop).
  - G3 corpus (CORRECTED per the prodcollapse metric review — the
    old daySeries-length check was mis-specified): all legs valid —
    8 recorded per-seed files (daySeries length == daysAlive OR
    daysAlive−1 with the missing day named; flowSeries covers every
    day; mealRows deduped; deathRows present; every sickOnset has a
    matching sickEnd or is open at run end; every onset appears in
    ≥1 later snapshot OR has a same/next-day end event) + 8 bare
    fingerprints present.
  - G4 classification: EVERY fever/sickness episode found in the
    band classified by vector + treatment + outcome, or honestly
    unattributed with the sensor gap named; prevalence reported
    (episodes per seed, seeds affected). No count bar is forced.
- GO: all prereg gates pass AND every fever episode classified by
  vector/treatment/outcome (or honestly unattributed with the sensor
  gap named). A miss is NO-GO, never re-scored mid-run; if a metric
  proves wrong, write it under "metric review" and propose the
  revision for the NEXT run.
- DIAG ONLY — zero src/js, no lever, no default flip. If a fix is
  found worth landing, it is documented as the NAMED next arm; it is
  not landed here.
- Reachability check (reported, not gated): national / table / wins,
  wave reach 1–5, median survival — expected 0/0/0 on competent-only
  150d per the sibling runs; any non-zero is reported as a
  deviation, not a win.
- Telemetry deviation check (loop-body step 10): after writing
  evidence, run `node scripts/telemetry-check.js --baseline
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-11-07/feveranat-a-corpus/feveranat-a-competent-s*.json'
  --metrics national,table,wins,exiled`. Any LOUD line is a same-run
  investigation item — dig into the deviation (explained vs real
  bug) BEFORE rolling the baseline forward. Report LOUD lines with
  verdict. (Expectation: competent-only 150d shows national/table/
  wins 0 — the awayconfirm/prodcollapse runs hit the identical LOUD
  lines as a regime artifact; do NOT roll the baseline on a regime
  artifact.)

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
