# Journey leg ESTABLISHMENT — r108 pre-registration (2026-11-06, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104/r105/r106/r107 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Leg question (fresh — named by r107's mechanism section, not re-proven)
r107 (8 seeds) returned HUNT-MIXED on the hunt-staffing funnel and named a
precise, fixable delivery failure underneath it: **field_dressing fired 0
times in-panel** — 13 kills, none by a holder at kill time. The skill
SPREADS villager-to-villager (1502: gen_bcozu8k → gen_3kuepfa d8 →
gen_gtd0qcv d19 → ethan_hunt d35 → omar_farouk d37) but reaches the hunter
AFTER his kills: Ethan (1502) learned it d35, eight days after his last
kill (d27); Pavel (1504), Ethan (1603), Juan (1604) never hold it. The
mechanism works (r106 proved the 1.3x frac); the delivery is late. The
holder EXISTS in the village early — occupations granting field_dressing
are veterinarian / mortician / butcher (characterGen.json), background-
seeded via npcSeedSkills — the autonomous lesson chain (villagerSkill-
LessonsDay: skillFit pick, 0.15/day) just never prioritises the hunter
before the lean-day hunt window.

This run tests the repair: **a hunt-prep lesson**. When the layer staffs a
hunter, the village first teaches that hunter field_dressing — if a holder
is at home — through the engine's own `teachSkill` (one lesson per learner
per day, shared language, the engine's gates stay the last word). The hunt
still happens whether or not the lesson lands: the prep is best-effort,
never a staffing gate. The question is mechanism, not funnel: does the
hunter hold the skill AT KILL TIME, so the 0.78 frac fires in-window?

Why this is not a re-proof of a proven constraint (Steve 2026-11-01 rebuke;
2026-11-04 standing rule): r107's funnel verdict (HUNT-MIXED) is NOT
re-judged here — it stays parked pending the separate-RNG-stream Steve-
call, and §12 says no round-3 funnel panel. This run changes the QUESTION
to the delivery mechanism r107 named, on the four seeds where hunts
actually staff. The funnel deltas are reported descriptively only; the
verdict turns on field_dressing fires at kill time.

## The arm (substrate, built and committed BEFORE any scored seed)
1. `scripts/policies/huntstaff.js` gains the prep, behind a new flag value:
   - `prepOn()` = `HUNTSTAFF === '2'`. `HUNTSTAFF=1` = r107 behaviour
     exactly (layer on, no prep). Unset = gate-off (pure delegation).
   - `prepFieldDressing(Game, ctx, hunter)`: if the hunter already holds
     field_dressing (`npcHasAbility` — either store), no-op. Else find the
     first roster villager at home (alive, not the scholar, not the
     hunter, not `away`) who knows it (`personKnowsSkill` — the same lazy
     background seeding the engine's own dawn lesson pass performs) and
     call `Game.teachSkill(teacher, hunter, 'field_dressing',
     {via: 'hunt-prep'})`. Every attempt is logged to `ctx._hsPrepLog`:
     {day, hunter, hunterName, teacher, teacherName|null, ok, why|null}
     (`why` = teachSkill's `canTeachSkill` reason: 'today' / 'words' /
     'teacher' / 'known' / 'gone', or 'no-teacher' when no holder is at
     home). The prep runs inside `staffHunt` after the hunter is picked
     and BEFORE `assignTask` — prepare, then send — so the hunter holds
     the skill when the duty resolves later that day. If the lesson fails
     for any reason, staffing proceeds unchanged.
   - `teachSkill` draws no shared RNG (verified: `src/js/tracks.js`
     contains no `Math.random`; `npcLearnSkill`/`creditDeed` are table
     lookups) — the prep adds no re-roll beyond the hunt resolve itself.
     It does consume the hunter's one-lesson-per-day: a real cost,
     visible as `skill_lesson` rows with `via: 'hunt-prep'`.
   - Teacher search is roster order (deterministic, no RNG). The teacher
     must be AT HOME: a lesson is in-person work (perception law — no
     teaching from miles away).
2. Driver `scripts/journey-establishment-r108-20261106.js` — r107 driver
   clone (same competent policy base, same 42-iteration horizon, same
   people check, same census, same telemetry dump, same five duty-use
   wraps, same lean trace, same ever-substrate capture). The ONLY driver
   changes: run tag / seed file names / EVID default
   (evidence/2026-11-06), and the `huntStaff` capture gains `prepLog`
   (`ctx._hsPrepLog`, arm-only).
3. Analyzer `scripts/analyze-journey-establishment-r108-20261106.py` —
   r107 analyzer clone, re-pointed at r108 prep-arm files + the r107
   control dir + the r108 ref-arm dir, SEEDS = 1502, 1504, 1603, 1604,
   with the r107 metric-review fixes: (a) direction-neutral movement —
   pantry-DOWN counts as movement alongside pantry-up/survival-up/down;
   (b) M1 pantry judged on `guardrails.pantryKcal` (pre-people-check,
   the pure funnel number), `pantryKcalEnd` reported separately as the
   post-check number; (c) holder-since join — field_dressing holding is
   classified from the huntLog wrap (held at kill time, authoritative)
   plus a skill_lesson-day holder-since table, never from end-state
   holdings alone.
4. Proof test `scripts/test-journey-establishment-r108-huntprep.js`:
   P1 fixture (prep wiring: gate-off delegates; HUNTSTAFF=1 staffs with
   NO prep and an empty prepLog; HUNTSTAFF=2 teaches a hunter who lacks
   the skill when a holder is at home, logs ok, and the hunter holds it
   after; no holder → 'no-teacher', staffing still proceeds; hunter
   already holds → no lesson; teacher away → 'no-teacher'); P2 harness
   mini-det-gate (seed 1502, 5 days, 3 legs: control / r108 gate-off /
   control-b, same b4 pattern as r107); P3 native guardrails/c3 +
   prepLog capture shape (present as an array; empty is honest gate-off).

## Seed-band freshness check (recorded; skill local_seed_band_freshness)
- 1502, 1504, 1603, 1604: NOT fresh and NOT claimed fresh — deliberate
  matched reuse (r107's four FIRING seeds; the only seeds where the
  mechanism can fire — on the other four r107 seeds the layer never
  staffs, so the prep cannot fire there either and they are identical
  by construction). Named in
  `evidence/2026-11-06/journey-establishment-r107-prereg.md`. No NEW
  band is introduced by this run, so no new band search is owed; the
  r107 freshness note (1501–1504 inside corpsehome's named 15000–15059
  range; 1601–1604 fresh at r107) stands.
- Within-seed comparison (control vs ref-arm vs prep-arm on identical
  seeds) carries the verdict's internal validity, as in r102–r107.

## Method
- Seeds: **1502, 1504, 1603, 1604** (r107's firing seeds).
- Policies: control = `competent` (r107 driver, unmodified, re-run on
  the current base as the same-base control — r107's standing M0 rule);
  ref-arm = `competent-hunt` (r107 driver, HUNTSTAFF=1 — the r107 lever
  as measured); prep-arm = `competent-hunt` (r108 driver, HUNTSTAFF=2 —
  the lever + prep lesson).
- Control dir: goal hidden_files `evidence-2026-11-06-control-r108/`
  (EVID override; the r107 driver writes r107-named files there so the
  committed r107 evidence is never overwritten). Ref-arm dir: goal
  hidden_files `evidence-2026-11-06-refarm-r108/` (same override).
- Pilot: seed 1502 runs first, five legs — control, gate-off (r108
  driver, HUNTSTAFF unset), ref-arm (r107 driver, HUNTSTAFF=1),
  prep-off-parity (r108 driver, HUNTSTAFF=1 — must reproduce the
  ref-arm exactly), prep-arm (r108 driver, HUNTSTAFF=2). The pilot must
  show M0 (gate-off reproduces control exactly AND prep-off reproduces
  ref-arm exactly) AND the prep-arm's capture fields populated
  (prepLog present; assignments as in r107). If M0 fails, fix the
  instrument before scoring the rest.
- Then seeds 1504, 1603, 1604, three legs each (control + ref-arm +
  prep-arm; gate-off/parity checks are pilot-only).
- §14b substrate checklist (before the sweep): contact — the prep calls
  the engine's own `teachSkill` (skill-teaching.js), the same function
  the autonomous lesson chain and the player conversation lesson use;
  the hunt duty resolves through `villagerHuntResolve` (game.js:6648)
  and r107 proved 16 assignments / 13 kills in-panel on these seeds;
  pool — a field_dressing holder exists on each firing seed by d8 at
  the latest (r107 spread chains: 1502 first lesson d8; 1604 first
  holder Emma d1); the pilot's prepLog names the gate on any zero-fire
  seed (no-teacher / today / words); verb — `teachSkill` exists and
  its gates stay the last word; horizon — 42d contains the full hunt
  window on all four seeds (r107: first assignments d7–d31).
- §14c roster rule: villager (non-scholar) combat deaths are a
  co-primary in M3/M4 reporting (deaths list carries who/cause/player).
- §15 panel note: the journey driver IS this leg's balanced-panel
  instrument (identical seeds, matched options, same-base control,
  r71–r107 precedent); the pre-registered ladder below is the judge.

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M1): the r108 driver
  with HUNTSTAFF unset reproduces the same-base control exactly on the
  pilot seed (endDay, aliveEnd, pantryKcalEnd + lesson sets identical
  modulo the r104 wall-clock-id correction), AND the r108 driver with
  HUNTSTAFF=1 reproduces the ref-arm exactly on the pilot seed. A
  divergence stops the run for investigation — the prep must not change
  gameplay when off, and must not change the r107 lever when its flag
  is off.
- M1 PREP-DELIVERY (the leg question): per seed, prep-arm vs ref-arm —
  prep attempts (count + named teacher/hunter + day + ok/why),
  field_dressing fires (hunt kills by a holder at kill time, from the
  huntLog wrap — the authoritative read), held-vs-notheld kcal means
  (frac 0.78 vs 0.60 predicts ~1.3x), hunter holder-since vs kill days.
  Verdict ladder, fixed now, evaluated in this order:
  1. PREP-WORKS if field_dressing fires ≥1 time on ≥2 of the 4 seeds
     AND prep lessons succeed on ≥50% of assignments where a teacher
     existed at staffing time. (The delivery failure is repaired:
     the skill reaches the hunter before the kill.)
  2. PREP-PARTIAL if fires ≥1 on exactly 1 seed, OR prep lessons
     succeed but no kill lands held (the lesson works; the hunt
     window or the kill chance is the binding constraint).
  3. PREP-NO-FIRE if 0 fires in-panel — with the prepLog naming the
     gate per seed (no-teacher / today / words / trust / known).
  Funnel deltas (pantry/survival prep-arm vs control) are DESCRIPTIVE
  in this run — the re-roll confound (r106/r107) bars them from the
  verdict. The lever's fate follows the delivery verdict, not the
  funnel: PREP-WORKS → the repaired layer is the candidate for the
  ON-by-default Steve-call (with the funnel question still parked
  behind the separate-RNG-stream call); PREP-PARTIAL / PREP-NO-FIRE →
  the delivery repair is not the fix — document which gate held and
  move on (no bigger panel, no funnel re-judgment).
- M2 CARE-VISIBILITY (descriptive, r105/r106/r107 continuity): tends,
  healer rounds, treat ticks, with actors; triage reach-2 uses.
- M3 SURVIVAL-42: GO if ≥3/4 prep-arm seeds alive at 42 (bar scaled
  from r107's 6/8); reported alongside control + ref-arm per seed +
  villager combat deaths. Descriptive weight only — see M1.
- M4 PANTRY-GUARDRAIL: GO if starvation/thirst/dehydration deaths are
  zero on ≥3/4 prep-arm seeds. Keywords: 'starvat', 'hunger',
  'thirst', 'dehydrat' (r105 correction).
- M5 PEOPLE: PASS if the 2 held convos per seed, read in full, are
  coherent (NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history, no filler loops).
  Driver hygiene (r105, carried): the people-check driver picks
  goon-first and may accept betrayal verdicts while sampling; held-convo
  drivers should avoid story verdicts — noted, not fixed in this run
  (driver parity with r107 is what M0 needs).

## Known limits (stated before scoring, not discovered after)
- The prep only fires when a holder is at home at staffing time. A
  holder away, dead, or not yet seeded cannot teach (logged).
- `teachSkill`'s gates are the engine's last word: one lesson per
  learner per day (a dawn autonomous lesson blocks a same-day prep —
  logged 'today'), shared language ('words'), teacher must know it.
- The prep consumes the hunter's lesson-day: they learn nothing else
  that day. A real cost, visible in the skill_lesson rows.
- The layer picks the best-competence eligible hunter repeatedly — the
  "hunt champion" pattern (b4/r107) is unchanged; rotation is out of
  scope.
- The census is an end snapshot (r105 limit, unchanged); the
  holder-since join (new this run) covers mid-window holding via the
  skill_lesson days, but a holder who gains the skill via track XP
  (villager_skill rows, not skill_lesson) is dated by the telemetry
  row's day.
- Scholar-day labels skip/repeat (r101 metric review); census
  `equipped` first-row duplication (r99); player codex start snapshot
  is missing (r103); armor lessons are not skill_lesson rows (r105).
- `ability_used` double-emission (pre-existing, r104): composite
  `activateAbility('purify.cleanse')` emits TWO rows; analyzer counts
  first evidence only.
- The diplomat "incident" half remains unimplemented (r105); out of
  scope for this run.
- Convergence (§12): this is round 1 on the DELIVERY repair (a new
  question, not a funnel round). The huntstaff FUNNEL verdict stays
  parked (r107 HUNT-MIXED, round 2 of 3 without passing the pilot
  gate); the next step on the funnel remains the separate-RNG-stream
  Steve-call, not a round-3 panel.

## Canon
- docs/CANON.md (human skills ≠ alien abilities): field_dressing is a
  human skill — teachable earthly knowledge (knowledge.json, no
  teachable:false flag; ability lane 'skill'). The prep lesson assigns
  LABOR and KNOWLEDGE via the engine's own lesson mechanic — no System
  slot, no magic. The layer's own header states this; the run does not
  re-decide it.
- docs/BEAR.md: the bear, the fight, butchering, fat, knowledge gating
  — the duty path's flat cleaning is the known b5 deviation, above.
- docs/PRESERVATION.md: the food ladder — hunt kcal enters the pantry
  as meat; rack/preservation behavior is measured by the r105 cook wrap,
  unchanged here.
- docs/CONTESTS.md: contests unlock ~day 14–21, 2/week shared budget,
  played not RNG — the establishment window is where the show arrives;
  contest counts are reported per seed (r101 rule: exclude fired within
  2 days of run end from the stuck count).
- docs/MONSTER-WAVES.md: wave 1 = Calibration Fauna (day 1+); wave 2
  unlocks day 8 + 5 wave-1 ledger points. The establishment window is
  wave 1 into wave 2.

## Telemetry
- The 4-seed CONTROL panel on the current base (this run) re-seeds
  `telemetry-baselines/establishment.json` (the r107 metric-review
  owed item; the r40-era baseline no longer describes the current
  death-tele regime). Old file preserved as
  `establishment.json.20261106-pre-r108.bak` (existing convention).
  The deviation check then runs the prep-arm files against the fresh
  baseline; LOUD lines are investigated before any further roll-forward.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
