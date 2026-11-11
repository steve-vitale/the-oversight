# Duties — first numbers: pre-registration (arm sim-dutyfirst-b)

Run fleshout-loop-b-20261111T0835Z, Loop B. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any
judged sim. Base commit c3d89858f. Claim: goal
hidden_files/lever-claims/fleshout-loop-b-20261111T0835Z.json (axis:
winnability chain; arm sim-dutyfirst-b — coverage Tier 2 duties first
numbers).

## Canon

- docs/CANON.md read first. **There is NO DUTIES.md in docs/** — no canon
  doc covers duties as a system. The nearest docs are design, not engine:
  docs/VILLAGER-BRAIN.md treats duties as future scorer candidates
  (Phase 6 — "duties join the candidate list", a design for the one-brain
  program, NOT the current engine); docs/SYSTEMS.md and docs/TIME-ECONOMY.md
  mention assignTask in passing. Nothing is invented here; the code
  citations below are the source of truth.
- Duties as coded (read before pre-registering):
  - **Registry — `delegateTasks()` (game.js ~6236) is the single source of
    truth for task types:** forage, garden, fish, hunt, wood, stone,
    deadfall, water, scout, patrol, cook, tend, teach, mend, rest (15
    incl. rest). `rest` clears the assignment. No other task string is
    accepted by assignTask (`if (!tasks[task]) return null`).
  - **Assignment — `assignTask(vid, task, opts)` (game.js ~6469):** the
    leader's core verb. In-person only unless a remote-assign ability
    exists (none does); refuses remote (`null`) and refuses when the
    scholar is not at Haven (`null`). Obedience gate via `checkObedience`
    (~6426): trust < 20 refuses (food work fish/garden gate at 10);
    trust < 40 + 40% reluctant roll refuses. Returns `{ok:false,
    refused:true}` on refusal and writes `v.lastRefusal = {vid, task,
    reason}`. Fitness gate: outdoor tasks (patrol/scout/hunt/forage)
    refuse a villager under 40 HP (`{ok:false, refused:true, reason:
    'wounded'}`). Newcomers (<14d) on outdoor tasks get a veteran buddy
    when one exists. Success writes `v.assignments[vid] = {task,
    assignedDay, assignedPart, via, buddy}` and returns `{ok:true}`.
    One part per assignment — resolveAssignments deletes it after
    resolution; reassign to continue.
  - **Resolution — `resolveAssignments()` (~6606) runs at end of day-part:**
    gardenKeeperTurn first; task leads resolve first (below); then each
    assignment via `resolveOneAssignment(vid, a)` (~6859), one part per
    assignment. Fitness gate at resolution too: an outdoor assignee under
    40 HP rests instead (assignment deleted, honest line). Sheltered
    villagers keep (not deleted) their assignment and skip the part.
  - **Per-task resolution (`resolveOneAssignment` branches):** forage
    (depletes real tiles, stockPantry 'Foraged food', 25% plant-learn);
    hunt (via `villagerHuntResolve` ~6738 — a REAL animal from REAL
    wildlife, stalk chance by difficulty/occupation tier/gear/abilities,
    injury roll 0.08–0.22 by temperament, stockPantry 'Game meat' on a
    kill, village learns the species L1); wood (R(5,9)*eff to the pile);
    stone (R(1,2)*eff to stash materials); deadfall (R(1,2)*eff sticks +
    50% 1 fiber to stash materials — NOT the deadfall trap); water
    (R(10,14)*eff liters dirty to the cistern, capped by room; full
    cistern redirects to wood/stone, one RNG pull, same as the water
    branch); garden (maintain + harvest at 0.8 eff, stockPantry 'Garden
    harvest'; sows from village seed stock when plots empty);
    fish (2–4 fish from real creek wildlife, stockPantry 'Fish catch');
    cook (havenRoleCredit + smoke-racks preservation of about-to-rot
    surplus, ~4000 kcal/part budget, racks-full guard; grants
    foodXp['cook'] once/day + foodXp['preserver'] per batch);
    tend/teach/mend (havenRoleCredit into v.gives/havenToday; teach
    actually passes up to 2 known plants to learners; mend grants
    foodXp['builder'] once/day; tend grants nothing); scout (reveals
    tiles at 0.5*eff in a 5x5 around Haven, 15%*eff cache find
    stockPantry 'Foraged food'); patrol (via `resolvePatrol` ~8054).
    Redirects: prod-throttle (forage/garden/fish → alt task when pantry
    >4 fresh days) and cistern-full (water → wood/stone) recurse into
    resolveOneAssignment with the new task — the outer call never reaches
    the practice tail. Practice: one rep per resolved assignment
    (`villagerPractice`, +1 rung per 8/20/36 reps, capped 1.4).
  - **Task leads (`v.taskLeads`, resolveAssignments ~6621):** domains a
    contender yielded/took (challenge age ≥ 8 parts auto-takes). The lead
    works their domain EVERY part via a synthetic `{task}` object that
    NEVER passes through assignTask — the sim-huntstaff-b3 lesson
    (backlog #528): an assignTask-only instrument is blind to lead
    resolutions. This arm snapshots `v.taskLeads` daily AND wraps
    resolveOneAssignment (which the leads DO call) so lead work is
    counted, with caller path recorded.
  - **Medic duty (game.js ~33147–33400, separate from delegateTasks):**
    `medicDutyTick()` runs at dawn (villager-objectives.js ~1383);
    holder picked deterministically among eligible (healing ability >
    occupation medic > skill-trained), must be alive, at Haven, not
    away, not sev-2 sick, not the scholar. `medicDutyHolder()` reads
    vacant on any of those. Cures happen in `villagerCareTick` (~33312)
    via `medicDutyCureAttempt` (~33244): ability channel (herbal_remedy /
    field_medicine / triage) then medicine channel (pharmacy doses);
    counters in `v.medicDutyCures = {ability, medicine}`. Prior art:
    medicduty-a (ability cures real, medicine channel unexercised live),
    medchannel-seed-a (medicine shadowed, not starved), sicknessdiag-b
    (medic cures 73/73, healer present 93.8% of days), wideduty-a
    (duty-held 61%→88%).
  - **Villager-initiative parallel (villager-objectives.js):** villagers
    pick their OWN objectives at dawn from what they have perceived:
    FORAGE, WATER, TRAPS (knowsSnare/knowsPit-gated, w 1.6), HUNT
    (remembered hunt site, w 2.0), HAUL, EXPLORE, VISIT, SEEK,
    HAVEN_CHORE (incl. 'teach'). These are NOT assignTask duties — the
    same work, chosen by the villager. The instrument snapshots objective
    kinds per day so assigned duty and villager-chosen work are never
    conflated.
  - **Competent staffing (scripts/policies/competent.js, grep-verified
    2026-11-11):** assignTask call sites are water + wood (workWater
    ~1017, one each when low), garden (assignBest ~1122, when no garden
    keeper), fish 1–3 (counterPlay ~1848), cook 1 (counterPlay ~1894,
    only when fresh >1500 kcal), deadfall up to 2 (staffDeadfallDuty
    ~1810, sticks <6). NEVER staffed via assignTask by competent: hunt,
    forage, scout, patrol, tend, teach, mend, stone. (The 'forage'
    ~540 / 'teach' ~756 / 'stone' ~1490 literals are scholar doAction /
    talk-choice / rubble code, not duty staffing — verified by reading
    context.) The garden keeper is set via setGardenKeeper, not
    assignTask. Hunt = 0 expected — the fishfirst-a (0 across 838,459
    kcal) and trapfirst-a (0 across 860,953 kcal) finding, re-verified
    here, not assumed. The medic duty is engine-dawn-assigned, never
    policy-assigned.
  - **Dead verbs to check:** 'deadfall' the DUTY is stick-gathering, NOT
    the deadfall trap (trapfirst-a note, repeated here so the two are
    never conflated). Stone duty exists in code but competent never
    staffs it; tend/teach/mend/scout/patrol likewise exist but are never
    policy-assigned — the pilot counts whether they fire at all (task
    leads, redirects, or not at all).
- Instrument pattern: evidence/2026-11-10/sim-trapfirst-a-prereg.md +
  sim-trapfirst-a.md + sim-fishfirst-a.md (same first-numbers shape).
  Backlog #2130 (hunt staffing) is prior art for the hunt row; this arm
  re-verifies it as one row among fifteen, it does not claim #2130.
  No backlog item is claimed by this arm: the duties first-numbers
  measurement IS the arm. (Backlog #528's taskLeads-blindness is
  incorporated as an instrument requirement — snapshot taskLeads daily
  + wrap resolveOneAssignment — not claimed as a fix; the line stays
  open for whoever owns the sweep instrument.)

## Pre-pilot substrate checklist (§14b)

1. **Contact**: duties fire under competent — trapfirst-a counted 549
   deadfall staffing calls and fishfirst-a/cookfirst-a counted fish/cook
   resolutions on the same policy; resolveAssignments runs every
   day-part; medicDutyTick runs at dawn. The pilot counts resolutions
   per task, not assumes them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio to
   size. The addressable pool is the living roster (~12–30 villagers)
   each day-part; snapshotted daily (read-only).
3. **Verb existence**: assignTask / resolveAssignments /
   resolveOneAssignment / villagerHuntResolve / resolvePatrol /
   medicDutyTick / medicDutyHolder / medicDutyCureAttempt /
   villagerCareTick / hurtVillager / stockPantry all exist in the
   engine; the policy calls the scholar-side staffing verbs. The pilot
   verifies each wrap live or marks it dead.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 122.5–140d); duties run from day 1, so no late-window
   risk. The medic duty needs a sick villager + an eligible holder; the
   pilot records holder-days, not assumes them.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of duties** — every
duty event classified by task + caller + outcome, every yield kcal
attributed to its duty, every metric in the list below counted or
explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every duty event classified by task + caller + outcome, none 'other' | 0 unclassified assignTask calls, 0 unclassified resolutions, 0 unclassified deposits across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 8)

1. Duty staffing: assignTask calls by task (all 15) — asked / accepted /
   refused, refusal reason class (trust-gate / reluctant / wounded /
   remote / not-at-haven / null-task / other, from the return value +
   v.lastRefusal), trust-before, HP-before, competence, caller frame
   (policy site), via; offerDeal / appealToGoal calls by task; roster
   members NEVER asked (0 calls all run); task-lead domains held per day
   (v.taskLeads snapshot); who was asked first vs who was walked down to
   (fallback order in assignAnother).
2. Duty resolutions: resolveOneAssignment calls by task + caller path
   (assignment / taskLead / throttle-redirect / cistern-redirect /
   recursion) — completed vs redirected vs skipped (shelter-kept /
   fitness-rest / dead-or-left, from the resolveAssignments pre/post
   assignment diff); resolutions per villager (concentration: top-3
   share, never-resolved count); duty time share (resolutions per
   villager-day); practice reps + competence movement per villager-task
   (villagerPracticeSteps at first/last snapshot).
3. Duty outcomes / yield: stockPantry deposits by name attributed to
   duty task ('Foraged food' forage+scout-cache, 'Fish catch',
   'Game meat', 'Garden harvest'); non-kcal yields (wood logs, stone,
   sticks, fiber, water liters, tiles revealed, garden plots tended,
   preserved kcal/batches via the cook racks + Game._haulcount tap);
   hunt resolutions (kills / stalk-fails / injury rolls via
   villagerHuntResolve + hurtVillager); patrol outcomes (resolvePatrol
   calls + hurtVillager during patrol); teach plants shared; mend/tend
   credit (v.gives / havenToday deltas); duty yield share of pantry
   inflow (duty deposits / all deposits).
4. Duty harm / excusal: hurtVillager events during duty (cause, dmg,
   HP before/after, died?); deaths on duty (roster death while holding
   an assignment that morning + death-cause samples); wounded/sick
   excused (fitness-gate refusals at assign + fitness-rest at resolve);
   sick villagers assigned outdoor work (assignment held while a sick
   record exists); HP<40 villagers holding assignments at dawn.
5. Medic duty: holder-days + holder identity/turnover (medicDutyTick
   before/after), eligible pool size per day (isMedicDutyEligible
   count), cures by channel (v.medicDutyCures ability/medicine +
   medicDutyCureAttempt records), patients reached, holder sick-excused
   days (holder reads vacant), no-medic days with sick present
   (sick count > 0, no eligible holder).
6. Villager-initiative parallel: objective kinds per day (FORAGE /
   WATER / TRAPS / HUNT / HAUL / EXPLORE / VISIT / SEEK / HAVEN_CHORE /
   idle headcounts from v.objectives); TRAPS returns (tele npc_trap /
   npc_pit, kcal + species — the trapfirst-a channel, counted here as
   villager-chosen work, not assigned duty); duty vs objective share of
   the same work (e.g. WATER objective vs water duty).
7. Duty fairness / feel: per-villager duty counts (hard duties
   hunt/patrol/outdoor vs haven duties, by villager); same-villager
   concentration (does one villager carry every hunt?); wounded/sick
   excusal rate; sense-test scenes quoted (assignment lines, refusal
   lines, return lines — anything robotic/static is a finding).
8. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: duties are a village-life question; sibling first-numbers
  pilots (cookfirst-a, preserve-a, fishfirst-a, trapfirst-a) ran 150d
  with median survival 122.5–140d, so 150d captures the full village
  life without ticking dead villages. Same horizon as the siblings for
  comparability.
- **Seeds: 190311–190318 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190311–190318: zero
    hits (recursive grep over all committed preregs; no 190xxx band is
    named in ANY committed prereg).
  - Searched all dated evidence `.md` for 190311–190318: zero hits.
    The only "19031" string anywhere in evidence is a game.js LINE
    number in evidence/2026-11-07/sim-prodcollapse-diag-a.md:197
    ("game.js lines 17133/19031/19079/21594") — not a seed.
  - The digit runs 1903 / #1903 / #1909 hits are sim-findings.md ITEM
    numbers (#1903 wrapper-policy arms, #1909), not seeds.
  - The coordinator brief names 190301–190308 as vetfirst's band; it
    appears in NO committed prereg (sibling in flight or uncommitted)
    and does not overlap 190311–190318.
  - No perseed directory names any seed 190311–190318; no dated
    evidence .md names them.
  - No standalone forbidden/contaminated band list exists in the goal
    hidden_files (listing checked; the only "band" matches are preregs,
    not lists).
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` (recursive grep) + all dated evidence
    `.md` (recursive grep) + perseed directory names + goal
    hidden_files listing + inspection of the one false-positive line
    number.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/dutyfirst-instrument-20261111.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- assignTask: EVERY task (all 15), with return class (ok / refused /
  null), reason (return.reason + v.lastRefusal when it matches vid+task),
  trust-before, HP-before, competence, caller frame, via, haven.
- offerDeal / appealToGoal: every task, same shape (expected mostly 0 —
  re-verified here).
- resolveAssignments: pre/post assignment + taskLeads snapshots per
  call, so skipped assignments (sheltered / fitness-rest / dead-or-left)
  are classified from the diff, not guessed.
- resolveOneAssignment: every resolution with vid, task (pre + post,
  so throttle/cistern redirects are visible), caller path (assignment /
  taskLead / redirect-recursion via a re-entry marker + stack frame),
  HP/trust before, outcome class (completed / redirected /
  exception-thrown).
- villagerHuntResolve: kills / stalk-fails by species + kcal + injury
  roll inputs (temperament, comp) — the hunt-duty outcome record.
- hurtVillager: every hurt (vid, dmg, cause, HP before/after, died?) —
  the duty-harm backstop. Duty attribution comes from the assignment
  held at the time (recorded in the same row).
- stockPantry: every pantry deposit by name (duty-yield backstop) +
  caller frame.
- resolvePatrol: every patrol resolution (vid, return).
- medicDutyTick: holder before/after + candidate count + no-medic
  flag; medicDutyHolder reads are NOT wrapped (pure getter, called
  from many sites — snapshot the holder instead).
- medicDutyCureAttempt: holder, patient, via, result (cure / ease /
  no) + disease id; villagerCareTick: calls per day + cure-counter
  delta (v.medicDutyCures before/after).
- tele: npc_trap / npc_pit returns only (villager-initiative TRAPS
  channel; the trapfirst-a shape, kcal + species).
- creditDeed / noteDeed: duty deeds (foraging / hunting / fishing /
  gardening / cooking / preserving / crafting / teaching / discovery),
  who — same dedup suppression flag as trapfirst-a (noteDeed IS
  creditDeed('player', ...)).
- Daily snapshot: assignments map (vid→task + assignedDay), taskLeads
  map, medicDuty holder + eligible count + medicDutyCures counters,
  sick map (vid→severity/disease), roster HP map, objective kinds per
  villager (v.objectives), practice reps + foodXp per villager-task,
  pantry roll by name, village water/wood/stone/materials, cistern
  ledgers (waterHauls, cisternRedirects, cisternOverflowL),
  throttle ledgers (throttleRedirects, throttleExemptDepth),
  deadfall ledgers (Game._deadfallHauls/Sticks/Fiber), haulcount tap
  (Game._haulcount villagerPreserveBatches/Kcal), gives/havenToday,
  garden plots live/ripe, deaths today.
Driver: scripts/dutyfirst-driver-20261111.js (mirrors trapfirst-driver;
Game.say wrap with a duty regex for the sense corpus, 400 lines/seed
cap — raised from trapfirst-a's 200 after its metric-review item (g);
cap truncation is recorded per seed). Analyzer:
scripts/dutyfirst-analyze-20261111.js. Proof:
scripts/test-dutyfirst-b.js (each wrap proven live on a fixture or
miniature; RED checks on the pre-fix instrument where a wrap is dead
by construction; task-lead resolution proven live in a miniature
that installs a synthetic task lead).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b; cookfirst-a, preserve-a,
fishfirst-a and trapfirst-a likewise attached no panel). The
control/neutral legs are the neutrality proof, not a panel.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (cookfirst-a / preserve-a / fishfirst-a / trapfirst-a: median
survival 122.5–140d, 6–8/8 village-lost). If the instrument changes any
numeric field vs the recorder-free baseline, the arm is NO-GO on
neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
