# sim-pitapprentice-b — engine-side apprentice-matching hook (2026-10-22)

Loop-B lever arm, run fleshout-loop-b (coordinator). Answers findings #612
(PIT APPRENTICESHIP NEEDS AN ENGINE-SIDE LEARNER HOOK TO GROW ON DEMAND,
sim-trapjoin-b 2026-10-19): the teach chore's learner pick is random
(`pick(here)`), so the need-gated pit/snare apprenticeships inside
agencyTeachVillager almost always fizzle on a full-belly stranger, and a
scholar-asked 'teach' duty teaches plants only — the pit craft can never be
routed to a willing learner.

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface; human skills ≠ alien
  abilities (pit/snare craft are teachable human skills — this arm never
  touches System abilities); no silent actions (every routed lesson must
  narrate through the existing lesson/deed/tele paths); trust ≠ reputation.
- evidence/2026-10-18/sim-pitknowledge-b.md: the pit knowledge channel
  (default-ON via pitKnowledgeOn()); the pit apprenticeship's gates are
  CANON: hungry-or-novice learner, trust 15+, 85% success, once per learner
  ("nobody studies craft on a full belly for fun"). **The gates stay; only
  the MATCHING changes.**
- findings #612 + #611 (sim-trapjoin-b): the duty->lesson chain is leaky at
  the learner gate — learner picked at random, no policy-side layer can
  direct who sits by the fire. Game-code work, not policy work.

## Call-site audit (BEFORE building)

Repo-wide grep for `agencyTeachVillager(` in src/js: exactly TWO hits —
the definition (villager-agency.js:1088) and ONE call site, the autonomous
teach chore (villager-objectives.js:1105: `agencyTeachVillager(rid,
pick(here))`).

The scholar-asked 'teach' duty (assigned via assignTask(vid,'teach'))
resolves at game.js:7156-7174 and teaches PLANTS ONLY — up to 2 plants to
the first roster-order learners who don't know them, via
villagerLearnsPlant. It never calls agencyTeachVillager; its learner pick
is deterministic, not random. Per the arm brief ("plant teaching
unchanged"), the hook is NOT applied there: applying an apprentice
preference to the duty's plant-learner pick would change plant teaching,
and routing pit craft through the duty would change WHAT the duty teaches
(a design change, not a matching change — left as a named next / Steve-call).
The hook is built as a reusable engine function
(`agencyMatchApprentice(teacherVid, cands)`) so a future duty-side routing
can call it without touching the apprenticeship gates.

## The arm: "the apprentice hook"

- `src/js/game.js`: `pitApprenticeHookOn()` feature flag next to
  pitKnowledgeOn(). PITAPPRENTICE=0 disables (det-gate control). Default ON
  (browser: no process -> on) — the lever lands as live behavior; the kill
  switch is for measurement.
- `src/js/villager-agency.js`: `agencyMatchApprentice(teacherVid, cands)` —
  given a teacher and candidate learners, returns
  `{learner, topic:'pit'|'snare'}` or null:
  - pit branch: pitKnowledgeOn() && teacher knowsPit → among candidates,
    pit-eligible (not knowsPit, not pitTaught, trust[teacher]>=15,
    hungry-or-novice) → `pick(eligible)`, topic 'pit'.
  - snare branch: teacher knowsSnare → snare-eligible (not knowsSnare, not
    snareTaught, trust>=15, hungry-or-novice) → topic 'snare'.
  - otherwise null → caller falls back to the current random pick; plant
    teaching unchanged.
  Eligibility mirrors the apprenticeship's own gates exactly (same reads:
  npcNeeds hunger>=60, agency xp tracking<8 novice, trust[teacher]>=15,
  once-per-learner flags) — the gates are re-checked inside
  agencyTeachVillager; the hook only changes WHO is picked.
- `src/js/villager-objectives.js` (teach chore): when the hook returns a
  learner, the chore calls `agencyTeachVillager(rid, matched)`; otherwise
  the master line `pick(here)` runs byte-identical. The matched topic rides
  on the lesson result (`lesson.matchedTopic`) — narration-neutral, no RNG,
  no trajectory effect.
- No narration changes: a routed pit lesson still fires recordDeed
  ('taught'), tele('pit_lesson'), the trust bumps, creditDeed('teaching'),
  and the spoken teachChoreLine (which already names teacher+learner and
  varies by topic/need). A matched-but-failed lesson gets the chore's honest
  "going over their finds" line — same as a failed random pick. No silent
  routing.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTION: does engine-side apprentice matching grow villager-to-villager
  pit apprenticeships on the competent substrate, without loosening the
  canon gates or harming survival?
- PRIMARY (binding): villager-to-villager pit lessons — (a) runs with >=1
  pit lesson taught: armed >= control+2; AND (b) total pit lessons taught:
  armed >= 2x control. Both must hit. (Control expectation: the census
  rate — rare, ~1/16 — not zero; the hook must MULTIPLY the rate, not
  invent it.)
- ENGAGEMENT (kill-fast): the hook's preferential pick fires on >=6/16
  armed runs (sweep-wrapped agencyMatchApprentice returning non-null).
- GUARDRAILS: median survival armed >= control-10d; starvation deaths
  armed <= control+2; national(end) armed >= control-2; no new death mode
  (n>=3 to name); no channel laundering (pit lessons must not displace
  snare/plant lessons one-for-one — snare+plant lesson totals reported).
- DET-GATE: PITAPPRENTICE=0 vs unset on feature-quiet seeds (86006, 86012 —
  scan-verified: no pit/snare-knowing teacher in the starting roster),
  2 seeds x 2 policies x 40d per-day trajectory hashes — byte-identical.
  The hook-off chore path is the untouched master `pick(here)` line.
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); PITKNOWLEDGE unset
  (channel ON both sides). SEEDS: 86001–86008 (fresh: zero genuine hits in
  scripts/ + evidence/, banned-list clean; starting-roster scan: pit
  teachers on 86001/86002/86004/86005, snare teachers on all but 86006)
  belongfeast} x {control: PITAPPRENTICE=0, armed: unset} = 32 runs,
  identical seeds both sides, own in-sweep paired control. Env asserted up
  front; SWEEP STOPS on mismatch.
- Balanced panel compare (scripts/balance-panel.js) per §15 — panel is the
  instrument, the pre-registered threshold is the judge. Compare .md
  attached.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Proof: scripts/test-pitapprentice-b.js — ALL GREEN (17/17) + det-gate 4/4

- PART A fixture (real Game via sim-harness, seed 7001):
  RED: master code — agencyMatchApprentice absent (hook is new).
  GREEN-1: pit-knowing teacher + one eligible learner among ineligibles →
    hook returns the eligible learner, topic 'pit', 10/10 seeded.
  GREEN-2/3/4: trust 10 → null; full-belly veterans → null; already-taught
    → null (gates unchanged).
  GREEN-5/6/7: snare-eligible preferred (topic 'snare'); craftless teacher
    → null; pit preferred over snare when both available.
  GREEN-8: PITAPPRENTICE=0 → null (kill switch).
  GREEN-9: the gates still decide — agencyTeachVillager lands a pit lesson
    for the eligible learner (deed + pit_lesson tele + knowsPit grant) and
    grants nothing to the ineligible one (plant lesson may land — unchanged).
  GREEN-10: the routed lesson narrates as a person choosing a student
    (teachChoreLine names learner, pit language, no system-optimizing
    template).
- PART B det-gate: PITAPPRENTICE=0 vs unset, seeds 86006/86012 (scan-verified
  quiet: no pit/snare teacher in starting roster) x {leadfeast, belongfeast}
  x 40d per-day trajectory hashes — **4/4 byte-identical**, craftSeen=0.
  The hook-off chore path is the untouched master pick(here) line.
- PART C smoke: informational (hook pick-rate on pit-teacher seed).
- Green-list: `node scripts/check.js --quick` — 281 passed, 6 failed, all 6
  are 120s TIMEOUTs (exit null) in heavy godpath tests under box load 18 —
  not assertion failures, none touch the teach chore. Directly relevant
  tests (test-teachchore-lines-r5, test-teach-dial-r4, test-pitknowledge-b
  21/21) all pass with the hook on.

- PART A fixture (real Game via sim-harness):
  RED: master code — agencyMatchApprentice absent (hook is new); the chore
  picks at random (no preference for the eligible learner).
  GREEN: hook prefers the eligible learner (pit, then snare); gates
  unchanged — full-belly non-novice / trust<15 / already-taught learners
  are NOT routed (hook returns null → random fallback); teacher knowing
  neither craft → null; hook off (PITAPPRENTICE=0) → null, chore does
  pick(here).
- PART B det-gate: PITAPPRENTICE=0 vs unset, 2 quiet seeds x 2 policies x
  40d per-day trajectory hashes — byte-identical.
- PART C smoke: hook pick-rate on a pit-teacher seed.

## Sweep result — 32 runs (86001–86008 x {leadfeast, belongfeast} x {control: PITAPPRENTICE=0, armed: unset}, 180d death-aware)

Per-seed JSONs: `evidence/2026-10-22/perseed-pitapprentice-b/`.
Env asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit, PITKNOWLEDGE
unset); identical seeds both sides; tree/side/env contract asserted by the
sweep script (refuses on mismatch).

CONTROL (hook off — the master pick(here) line; det-gate proves byte-identical):
- pitLessons=2, pitRuns=1/16 (both lessons on belongfeast-s86005), snare=31, plants=380
- median 141.5d, starvation 9, national 10/16, table 12/16, wins 0/16, wave-4 15/16, wave-5 0/16

ARMED (hook on):
- hook picks=47 across 8/16 runs (39 snare, 8 pit); pitLessons=4, pitRuns=1/16 (all 4 on belongfeast-s86005 — the same run as control's 2); snare=40, plants=345
- median 137.0d, starvation 10, national 9/16, table 12/16, wins 0/16, wave-4 15/16, wave-5 0/16

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| pit runs (≥1 lesson) | 1/16 | 1/16 | armed ≥ 3 | MISS |
| pit lessons total | 2 | 4 | armed ≥ 4 | HIT (exactly) |
| hook picks (engagement) | — | 8/16 runs | ≥ 6/16 | PASS |
| median survival | 141.5d | 137.0d | ≥ 131.5d | PASS |
| starvation deaths | 9 | 10 | ≤ 11 | PASS |
| national (end) | 10 | 9 | ≥ 8 | PASS |
| new death mode (n≥3) | — | none | none | PASS |

**Verdict: NO-GO.** The binding primary requires BOTH (a) and (b); (a)
missed. Per §14 the miss is not re-scored.

Root cause (kill-discipline): the hook WORKS — 47 preferential picks fired,
and on the one run where the canon gates allowed (s86005-belongfeast, pit
teacher at trust 15+ with hungry learners present), pit lessons doubled
2→4. But the binding constraint on pit apprenticeships is the CANON GATES
(trust[teacher]≥15, hungry-or-novice learner present at the chore), not the
learner matching. The gates are canon ("nobody studies craft on a full
belly for fun" — not to be loosened). Filling the matching blank does not
grow the channel because the gates throttle first. For the goal of growing
pit apprenticeships, matching alone is the wrong/insufficient lever —
confirmed, not just a missed bar.

The snare side-effect: snare lessons 31→40 (+29%, 39 hook picks). The hook
does move the snare apprenticeship, but the pre-registered primary is
pit-specific and binding.

No channel laundering: pit+snare lessons rose (+2/+9) while plant lessons
dipped 380→345. Not one-for-one displacement, but the hook does redirect
some teach-chore capacity from plants to craft apprenticeships when
eligible learners are present. Reported, not hidden.

Death modes: identical classes both sides (violence/monster/starvation/
disease/wounds/dehydration); armed-only buckets are n≤2 monster-name
variants; no new mode at n≥3. PASS.

## Panel compare (§15) — PENDING

## Sense-test (SENSE-TESTING LAW)

Read from a 60d hook-on sense run (seed 86001, leadfeast; say() intercepted
for lesson lines, recordDeed intercepted for taught deeds):

- "📖 Vasyl is showing Petra the snare — the loop, the trigger stick, where
  the run narrows between the roots. 'Opossum trails. Check at dawn.
  Always.'" — teacher and learner named, the craft spoken in its own
  language. A person choosing a student.
- Deed d37: "Vasyl taught Elif the snare — the loop, the trigger stick,
  where the run narrows. Meat for the hungry." — the need is the reason
  ("Meat for the hungry"), not a system optimizing.
- Deed d15: "Vasyl showed Petra the snare — ... The beginner's wire." —
  the novice variant, distinct voice.
- The hook's 2 picks in 60d both became landed, narrated lessons (no silent
  routing; every routed lesson went through deed + tele + spoken line).

Judgment: sensical. The matched lessons read as a teacher picking the
hungry/novice villager by the fire — never as a system optimizing. The
narration was already person-voiced (teachChoreLine); the hook only changes
who is chosen, and the choice is legible in the deed ("Meat for the
hungry").

## Village assessment (plain words)

The villages are the competent villages — fortified, feast-scaled, pre-seat
— living and dying on the same terms both sides (median 141.5d vs 137.0d,
national 10 vs 9, table 12 vs 12). The hook didn't change how villages
live; it changed who sits by the fire when a trapper teaches. On
s86005-belongfeast — the one run where a pit teacher earned the village's
trust (15+) and hungry learners were present — the apprenticeship doubled
(2→4 pit lessons): the pit line grew a second pair of hands the honest way,
through need-gated teaching, not a flag flip. Everywhere else the gates
held and the villages were indistinguishable. The blank #612 named is real
(the matching was random), the hook fills it correctly, but the channel's
true throttle is the canon trust/need gates — which is why the primary
didn't move. That's the finding, not a failure of the mechanism.

## Metric review (mandatory)

- PRIMARY (binding): MISSED on (a) — pitRuns 1/16 vs bar ≥3. (b) hit
  exactly (4 ≥ 4). Both required; the miss is NO-GO, not re-scored.
  The bar was honest (set from the census rate ~1/16; the hook had to
  CREATE new apprenticeship runs, not just enrich the one that fires).
  The miss is real, not a metric artifact: the hook fires (47 picks) but
  pit picks concentrate on the single run where the trust gate is met.
- ENGAGEMENT (≥6/16 runs with a pick): PASSED 8/16. The hook is live and
  firing; the mechanism is proven. The bar measured the right thing.
- Guardrail "median ≥ control−10d": PASSED (137.0 vs 141.5, diff −4.5d).
- Guardrail "starvation ≤ control+2": PASSED (10 vs 9).
- Guardrail "national ≥ control−2": PASSED (9 vs 10).
- "No channel laundering": reported honestly — plant lessons dipped 380→345
  while snare rose 31→40 and pit 2→4. Not one-for-one, but the hook does
  redirect some teach-chore capacity. A future arm should watch this.
- Det-gate design: the quiet-seed on/off comparison is the right gate for a
  matching hook (proves inert when it can't fire). 4/4 byte-identical.
- Lesson for next runs: when the binding constraint is a canon gate (not
  the mechanism under test), pre-register a gate-conditional primary (e.g.
  "on runs where a teacher reaches trust 15+") OR accept that the arm is
  diagnostic. This run's primary was unconditional and correctly killed the
  arm — but the diagnostic value (gates bind, not matching) was the real
  finding.

## Named next (for the findings backlog)

1. #612 stays OPEN: the apprentice-matching hook is built, proven, and
   killed-at-primary (this run). The mechanism is sound; the blocker is the
   trust-15 gate on pit teachers. A future arm could address teacher trust
   earn rate (canon-sensitive — trust ≠ reputation) or the teach chore's
   frequency for craft-knowers — but NOT by loosening the gates.
2. The snare apprenticeship DID move (+29% lessons, 39 hook picks). If a
   future arm wants the snare channel specifically, the hook is proven
   infrastructure — re-test with a snare-primary bar.
3. The scholar-asked 'teach' duty still teaches plants only (first-in-roster
   learners, deterministic). Routing pit/snare craft through the duty would
   change WHAT the duty teaches — a design change, not a matching change.
   Left as a Steve-call if the line should ever grow on demand via duties.
4. Telemetry schema note (for future arms): per-seed JSONs nest wall metrics
   under `wall:` — the body's `--metrics national,table,wins,exiled` paths
   miss them (pitjoin-b hit this too). Either flatten the JSON or use dot
   paths. This run aggregated to flat JSON for the telemetry check (quiet
   both sides vs scale-wall-preseat.json).

## Wall numbers (report-only)

Armed side (16 runs, 180d, pre-seat SEATDRIVE=0): national 9/16, table 12/16,
wins 0/16, wave-4 15/16, wave-5 0/16, median survival 137.0d. Control:
national 10/16, table 12/16, wins 0/16, wave-4 15/16, wave-5 0/16, median
141.5d. (Pre-seat substrate: wins structurally 0.)
