# sim-roleform-a — role formation across all five tracks (census, GO with caveats)

- Run: `fleshout-20261106T2256Z`, Loop A, axis scale-onramp / winnability
  chain (tracker blank (1) from the 2103Z entry).
- Arm: `sim-roleform-a`, worktree `~/workspace/worktrees/sim-roleform-a`,
  branch `sim-roleform-a`.
- Prereg: `evidence/2026-11-06/sim-roleform-a-prereg.md`
- Band: **99891–99898** (8 seeds, pilot), horizon 80d death-aware,
  competent policy verbatim. MEASUREMENT ONLY — no game-code change.
- Verdict: **GO** per the prereg rule (5/5 tracks show signal, 4 distinct
  dominant tracks) — with the decomposition in the metric review below,
  because the GO is carried by the track/deed system, not by practice:
  competence moved only in field + craft, and specialistSkill is still
  0→positive for 0 villagers.
- Commit: driver + analyzer + proof test + prereg + this file + per-seed
  corpora (see below). Merged locally, pending ship (coordinator merges;
  no push, no bump, no live check by this arm).

## What the village looked like

Eight competent-policy villages, 80 days at most. Seven lived to the
horizon (endDay 81–82); one died at day 74 (seed 99893, game over). The
work that gets done is haven labor: wood (1,129 resolutions), stone
(1,126), water (629), cook (406), deadfall (223), fish (208), garden
(94), forage (53). NOBODY hunts, patrols, scouts, teaches, or tends in
these runs — zero resolutions in hunt/scout/patrol/teach/tend/mend on
all 8 seeds, exactly as the drive-practice pilot found. Villagers still
fight (570 combat deeds, 428 fight_won) and teach (524 teaching deeds,
186 lessons taught) — but through events and fights the policy drives,
not through assigned work. Deaths are combat deaths: villager combat
222, expedition 109, combat 65, the wild 30, sickness 11, dehydration 2.

## Before / after vs the 2026-11-05 census baseline

Baseline (8 seeds, 30 qualifying villagers ≥60 NPC days, 120d):
competence moved 0 cells, skill 0→positive for 0 villagers; 28/30
strong task, 16/30 hybrids, 0/28 top tasks matched occupation.

This census (8 seeds, 45 qualifying villagers ≥60 NPC days, 80d):

| | 2026-11-05 baseline | this census (qual60) |
|---|---|---|
| competence cells moved | 0 | 33 changed cells (50 rung steps: field 14, craft 36) |
| specialist 0→positive | 0 villagers | 0 villagers |
| track level ≥1 (any track) | n/m (not instrumented then) | 28/45 villagers |
| skills gained (npcSkills) | n/m | 224 |
| abilities gained | n/m | 41 |
| dominant tracks (distinct) | n/m | 4 (field 4, social 2, craft 3, combat 1) |
| strong task ≥1 | 28/30 | 42/45 |
| hybrids (≥2 strong tasks) | 16/30 | 23/45 |
| top task matches occupation | 0/28 | 2/45 |
| mean top-task share | n/m | 0.58 |
| switched top task half-to-half | n/m | 15/45 |
| mean stickiness | n/m | 0.49 |

Correction on the first row, stated plainly because the analyzer's
by-track totals are the authority: competence "cells moved" counts
changed (villager, task) cells (33), while the by-track totals count
RUNG steps (field 14 + craft 36 = 50 steps across those 33 cells). By task (rung steps, qual60):
wood 14, stone 16, water 11, cook 6, fish 2, garden 1; hunt/scout/
patrol/teach/tend/mend 0. The ≥30-day sensitivity set (77 villagers)
shows the same shape at larger scale: 78 changed cells, 130 rung
steps (field 42, craft 88), still 0 in combat/social/strange.

Per-track table (qual60, 45 villagers):

| track | competence cells moved | villagers moved ≥1 cell | track level ≥1 | skill 0→positive (specialist) | dominant track |
|---|---|---|---|---|---|
| combat | 0 | 0 | 8 | 0 | 1 |
| field | 14 steps / 9 villagers | 9 | 15 | 0 | 4 |
| social | 0 | 0 | 6 | 0 | 2 |
| craft | 36 steps / 13 villagers | 13 | 8 | 0 | 3 |
| strange | 0 | 0 | 1 | 0 | 0 |

Rung-gain lines ("getting the hang of …"): **195 across the 8 seeds**
(wood 54, stone 56, water 39, cook 24, fish 9, deadfall 8, forage 3,
garden 2) — the second instrument, counting villagers even if they
later left the roster. Drive-practice's armed leg had 188 on its band;
the mechanism reproduces on a fresh band.

## How the GO is actually built (read this before quoting the verdict)

The prereg rule counts "track level ≥1 OR competence movement in that
track", and all five tracks clear it — but through two different
mechanisms, and the split is the finding:

1. **Practice (competence) reaches field + craft only.** The policy
   assigns only haven labor, so practice accrues only there. Combat,
   social, and strange show ZERO competence movement — not because
   villagers can't improve at those jobs, but because the work is never
   assigned. Unmeasured, not disproven.
2. **Track levels (deeds → XP → level-ups → skills) reach all five.**
   NPC deeds by track, all 8 seeds: field 2,622, craft 642, social 598,
   combat 570, strange 513. The deeds are genuinely individual, not a
   village broadcast: discovery goes to 1–7 villagers per seed
   (concentrated — one villager took 132 on 99891), fight_won to 10–15
   per seed, teaching to 10–14, death_in_family to 10–15. Villagers
   earn combat XP by fighting (428 fight_won, 142 fight_survived),
   social XP by teaching (524) and winning contests (51), strange XP
   almost entirely by bereavement (505 of 513 strange deeds are
   death_in_family; the rest are contest_survived, 8).
3. **Skills DO form.** 224 npcSkills gained across qual60 (338 across
   qual30). The sets cohere with the track: Wanjiru (Wild food
   forager, seed 99891) went from 0 skills to 11 — scrounger,
   herbal_medicine, snare_wire, forage_sense, foraging, wound_care,
   steady_hands, grave_robber, field_dressing, track_read, stalk —
   on field XP 66 (level 2) plus 5 lessons learned. One odd duck in
   her set: grave_robber sits strangely beside wound_care (sense note,
   not a defect claim — see findings).
4. **specialistSkill is still 0→positive for 0 villagers.** The food.js
   zero-gate is untouched, exactly as the prereg recorded. Competence
   moves; the specialist ladder does not. The "skill" half of the
   2026-11-05 baseline is STILL 0.
5. **Strange's single level-1 villager got there through grief.**
   The 99893 programmer (field level 2, strange level 1) earned
   strange XP from death_in_family deeds — the village losing people.
   There is no strange WORK in the game: no task feeds strange, and
   the only other strange deeds are surviving contests. A "strange
   role" today means "the person who has lost the most people", not
   "the person who works the strange".

## Personality: roles do NOT yet differentiate by temperament

The ruling says roles differentiate by personality. The cross-tab
says otherwise at pilot scale: of 45 qual60 villagers, 35 have NO
dominant track at all, and the 10 who do are spread across
temperaments with no pattern (bold→field 2, warm→field 1, dry→craft 1,
cautious→social 1, steady→combat 1, steady→craft 1, gentle→cook 1…).
Temperament here is the full adjective set (warm, dry, prickly,
withdrawn, anxious, restless…) — only bold/cautious touch competence
at all (bold ×1.15 on hunt/patrol, cautious ×0.9, verified in
game.js:6281+), so personality bends almost nothing in this census.
What differentiates villagers instead is ASSIGNMENT HISTORY: whoever
the policy puts on wood/stone/water gets better at wood/stone/water.
The drive's caveated brief (personality bends the shape) has no
sim evidence yet — the one-brain scorer will need personality as a
real input, not a label, before this changes.

## Sense test (read the lines, not just the counts)

Rung-gain lines read as people getting better, with the name and the
work varying: "Ernestine is getting the hang of woodcutting — all
that doing it, day after day, is making them surer", "Paul is getting
the hang of stonework", "Jesse is getting the hang of cooking" (day
80 — improvement still landing at the horizon). The template repeats
(same sentence every time); the person + task is what varies. 34 of
49 rung-gaining villagers gained in MORE than one task — generalists
forming through work, the same pattern drive-practice saw in Mehdi.
No line ever fired for hunt/patrol/scout/teach/tend/mend, because the
work never happened. Verdict: reads as people improving, not numbers
ticking — within the haven-labor half the policy exercises.

## Wall numbers (the wall did not move)

| | this census |
|---|---|
| national reached | 0/8 |
| table | 0/8 |
| wins | 0/8 |
| wave-4 kills | 0 |
| wave-5 kills | 0 |
| median survival | 81d (7/8 villages alive at the 80d horizon; 99893 died day 74) |

Villagers alive at end: 8, 4, 4, 5, 8, 8, 5, 9 (start 12 each; 99893
ended game-over with 4 alive). No village banks two living wave-4
killers and sits — same wall as every run.

## Proof

`scripts/test-roleform-20261106.js` — ALL GREEN (10/10): T1 GO corpus
(5/5 tracks, verdict GO, exit 0); T2 temperament normalization (bold
hunter's 1.4×1.15 reads as no phantom movement; cautious teacher's
0.9-tempered gain reads as a real rung); T3 NPC-window exclusion
(scholar-window resolutions excluded from task totals); T4 rung-line
parsing (woodcutting → wood) + NO-GO corpus (only field shows signal,
exit 1, verdict NO-GO, single dominant track named). Two analyzer bugs
found and fixed by the proof before any sim ran: a duplicate `kills`
declaration, and `(r.trackLevels || {})` being truthy for null
trackLevels (crashed the NO-GO corpus).
`node scripts/check.js --quick` — 271 passed, 19 failed in 2343s
(log /tmp/roleform-check-quick.log; run contended with two other
live check.js runs — brain-design full and journey-deepening --quick
— plus a sim-bypass test). Above the standing 7–8, so each failure
was classified, not waved through: 10 are 120s-cap TIMEOUTS on
sim-heavy scripts under that 3-way contention (comfort-arc,
phase-shawl, shepherd-deed, solo-campaign-endings,
time-save-crashes, synergy-stall, throttlefeast, capable-bot,
first-ability-magic, table-endings); 4 are the measurement-proof
staleness cluster (proof-update, measurement-workflow,
measurement-cache-flags, trust-observer-neutrality — known open
#1353, Oct 29 stale, still unrefreshed); mobile-combat-cadence and
capable-bot's food-deed assertion are the proven-pre-existing pair
from 2103Z (#1830); phone-frame-proof is a stale phone receipt
(proof-freshness, no game code); occupation-panels and
establishment-r20-fixes fail IDENTICALLY standalone (re-run here,
same assertions — pre-existing on this base); prepared-runner-custody
PASSES standalone 4/0 (contention flake). Zero of the 19 failing
scripts references any roleform file, and this arm changes no src/js,
data, or docs — none is arm-caused. The arm's own proof test is not
on the green list, so check.js did not run it; it ran standalone
(10/10 above).

## Method notes

- Single-leg census on current master (drive-practice landed,
  2b9b0371e). No baseline leg was run: the comparison is against the
  recorded 2026-11-05 census numbers, per the prereg. Baseline
  contamination risk (drive-practice's own goal) does not apply —
  nothing was edited while the census ran.
- The qual60 denominator (45 villagers) is bigger than the baseline's
  30 because this census counts villagers at ≥60 NPC days over 80d
  with more joiners surviving; the baseline was 120d. Horizon and
  denominator differences are noted wherever the two are compared.
- The analyzer's "competence cells moved" total (33) counts changed
  (villager, task) cells; the by-track totals (50 rung steps) count
  rung steps. A cell moving 1.0→1.3 is 1 changed cell, 2 rung steps.
  Both are printed; neither is hidden.
- Balanced panel (§15): inapplicable — the panel runs its own full
  panel and takes no corpus input, so it cannot compare this census
  corpus on identical seeds (same limitation recorded by
  killersurvive-a, drive-practice-a and other census arms). The
  identical-seed census comparison against the recorded 2026-11-05
  baseline is the before/after instrument, with per-seed JSON corpora
  attached: `roleform-a-seed9989{1..8}.json`.
- Telemetry deviation check: ran per the body; three LOUD lines
  (national 12→0, table 16→0, wins 16→0). EXPLAINED, not a bug, and
  the baseline was NOT rolled forward. The scale-wall baseline's own
  `_regime` note says it is the "winseat — full win-side win stack"
  regime and "DO NOT compare pre-seat / courtship / readiness
  substrates against this baseline — wins are structurally ~0 there
  and telemetry-check will fire a spurious LOUD 'wins disappeared'".
  This census is a pre-seat substrate (competent policy, no winseat
  policies, 80d); 0/8 national/table/wins matches the standing wall
  state in every recent run (drive-practice 0/8 both legs, 2103Z
  wins 0 everywhere). The LOUD lines are the documented spurious
  regime artifact.

## Metric review

- The verdict rule as written is satisfied (GO), but it conflates two
  mechanisms: practice-competence (field + craft only) and deed-track
  levels (all five). A future census should judge them SEPARATELY:
  practice-movement per track AND track-level per track, so a GO
  cannot be carried by bereavement deeds in strange while the work
  itself never happens. Proposed revision for the next run: split the
  bar — GO needs ≥3 tracks with competence movement AND ≥4 tracks
  with a level, with strange movement required to come from a deed
  other than death_in_family.
- The dominant-track rule (≥50% of total XP + ≥18) is strict: only
  10/45 qual60 villagers have one. Most villagers spread XP across
  tracks (field-heavy, but mixed). That may be right (people are
  generalists) or the threshold may be too strict to see roles forming;
  the per-villager rows are in the analyzer output for anyone who
  wants to re-cut it.
- Top-task-vs-occupation moved 0/28 → 2/45. That is barely a move,
  and the two matches may be practice (a villager practiced up to
  1.4 in their top task) rather than occupation matching. The honest
  reading: villagers do what the village needs (wood/stone/water),
  not what they were. Occupation-as-destiny is broken for competence;
  assignment still follows need, not person.
- 3/45 qual60 villagers did NO resolved work in 60+ NPC days (two
  programmers, one HVAC tech). They still gained skills (5–7 each,
  via lessons) and track levels — the track system reaches people the
  assignment system never touches. Worth a look by the one-brain
  program: is a villager with no assignments and 5 skills a person
  with a role, or a person the village forgot?
- Strange has no feeding work by design (see prereg map). The verdict
  rule's 4-of-5 bar lets GO stand without strange work — but the
  ruling is "reward ALL paths", and strange currently rewards only
  grief and contest survival. That gap is named, not closed.

## Blanks filled / documented

- FILLED (measured): role formation across all five tracks vs the
  2026-11-05 baseline — competence now moves (33 changed cells /
  50 rung steps, field + craft), track levels reach all five tracks
  (28/45 any level), skills genuinely form (224 gained, coherent
  sets), teaching spreads skills villager-to-villager (110 taught /
  122 learned, 34 teachers).
- DOCUMENTED (not chased): specialistSkill zero-gate (food.js arm
  needed — the skill half of the baseline is still 0); combat/social/
  strange practice unmeasured (policy never assigns hunt/patrol/
  scout/teach/tend — a policy/task-coverage arm or the one-brain
  scorer's duties); strange has no feeding work (bereavement is its
  main XP source); personality does not yet bend roles (35/45 no
  dominant track, no temperament pattern); pacing/homogenization
  (34/49 rung-gainers improve in >1 task — generalists, not
  specialists).
- No build proposed here beyond framing: any role-formation build
  lands INSIDE the one-brain program (Steve 2026-11-06 17:12 CST,
  item 5: duties judge by lived experience) as scorer weights and
  candidates — never a new standalone system.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged — wall numbers
are 0 everywhere again (national 0/8, table 0/8, wins 0/8, wave-4
kills 0). Tracker blank (1) from the 2103Z entry is MEASURED (this
arm); the next blanks in the 2103Z order are (2) finale campaign at
full HP and (3) capable-bot food-deed failure #1830. The 64-seed
drive-build run is still owed before anyone leans on the drive.
