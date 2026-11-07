# sim-practicemove-a — practice-movement gap: replication + diagnosis (DIAG-GO)

- Run: `fleshout-2026-11-07T0221Z`, Loop A, axis scale-onramp / winnability
  chain (tracker blank #4 from the 0059Z round).
- Arm: `sim-practicemove-a`, worktree
  `~/workspace/worktrees/sim-practicemove-a`, branch `sim-practicemove-a`.
- Prereg: `evidence/2026-11-06/sim-practicemove-a-prereg.md`
- Band: **99891–99898** (8 seeds, pilot), horizon 80d death-aware,
  competent policy verbatim. MEASUREMENT ONLY — no game-code change.
- Verdict: **DIAG-GO** per the prereg rule — the replication reproduces
  the roleform numbers bit-identically, the brief's premise is REFUTED
  with counts (practice DOES move competence in organic play), every
  zero-movement task has its blocking gate named with counts, and the
  attribution cross-checks pass (0 mismatches, 0 decreases).
- Commit: driver + analyzer + proof test + prereg + this file + per-seed
  corpora (see below). Merged locally, pending ship (coordinator merges;
  no push, no bump, no live check by this arm).

## The headline, in plain words

Practice works. A villager who does the work gets better at it — in
real, organic play, not just in the pilot harness. On these 8 seeds,
33 villagers' competence cells moved (50 rung steps), and the game said
so 195 times in plain words ("Seymour is getting the hang of
woodcutting"). The brief's premise — that the census found practice
moving competence *nowhere* — was a misreading: the 0059Z adoption
round's summary said "nowhere", but the roleform evidence file itself
said 33 cells / 50 steps / 195 lines, and this replication reproduces
those numbers EXACTLY on current master. What practice does NOT do is
reach the whole village: it moves competence only in the haven-labor
tasks the village actually assigns (wood, stone, water, cook, fish,
garden — and deadfall/forage for short-tenure workers), and it never
touches the specialist ladder at all. The gap is not "practice is
broken". The gap is three named gates, each sized below:

1. **Six tasks are never offered at all** — hunt, scout, patrol, tend,
   teach, mend: 0 direct assignments and 0 lead-days across 8 seeds ×
   80 days. Nobody is ever asked to do them, so nobody can practice
   them. This is a policy/coverage gate, not a practice gate.
2. **Fishing is offered constantly and almost never happens** — 807
   direct assignments + 253 lead-days, but only 208 resolutions. The
   pantry is usually full, so the prod-throttle turns the fishing trip
   into wood/stone/water work instead (1,654 throttle redirects across
   the 8 seeds). The villager still practices — just woodcutting
   instead of fishing.
3. **The specialist ladder is doubly shut** — specialistSkill is
   occupation-match only, plus +1 only if the villager has 5+ foodXp
   in that spec. Villagers gained ZERO foodXp in any spec on all 8
   seeds (the smoking/preserving path that writes foodXp is a
   scholar-side action; the policy never asks a specialist to do it),
   so even an occupation-matching villager could never earn the +1,
   and a non-matching villager stays 0 forever however much they
   practice. Practice moves competence; it never feeds the specialist
   ladder — by code design, not by accident.

No build in this arm: every gate above is systemic (policy coverage,
the throttle/cistern overflow valves, the food.js specialist gate) or
belongs to another arm's blank (specialistSkill = a food.js arm; task
coverage = the one-brain scorer's duties). The prereg's build rule
says to report DIAG with the named, sized lever for the next arm —
done in "Named levers for the next arm" below.

## What the village looked like

Eight competent-policy villages, 80 days at most — bit-identical to the
roleform census (same seeds, same policy, same master behavior on
these seeds: every per-seed number matches roleform exactly). Seven
lived to the horizon (endDay 81–82); one died at day 74 (seed 99893,
game over). The work that gets done is haven labor: wood (1,129
resolutions), stone (1,126), water (629), cook (406), deadfall (223),
fish (208), garden (94), forage (53). NOBODY hunts, patrols, scouts,
teaches, or tends — zero resolutions in hunt/scout/patrol/teach/tend/
mend on all 8 seeds, exactly as roleform found. Villagers still fight
and teach through events and fights the policy drives, not through
assigned work. Deaths are combat deaths, same shape as roleform.

## Replication (identical seeds 99891–99898, current master)

| | roleform census | this replication |
|---|---|---|
| competence cells moved (qual60) | 33 | **33** |
| rung steps (field / craft) | 50 (14 / 36) | **50 (14 / 36)** |
| rung-gain lines | 195 | **195** |
| specialist 0→positive | 0 villagers | **0 villagers** |
| track level ≥1 (any track) | 28/45 | **28/45** |
| skills gained (npcSkills) | 224 | **224** |
| abilities gained | 41 | **41** |
| dominant tracks (distinct) | 4 | **4** |
| qual60 / qual30 villagers | 45 / 77 | **45 / 77** |
| median survival | 81d | **81d** |

Every number matches exactly — including per-seed endDays, per-seed
resolved counts, and the per-task step table (wood 14, stone 16,
water 11, cook 6, fish 2, garden 1; hunt/scout/patrol/teach/tend/
mend 0). The landings since roleform (grind, tbend, armorcap,
routstall, journey-deepening) did not move any sim-relevant number
on these seeds. Determinism holds; the instrument is sound.

## Attribution — every competence delta, by source

The analyzer cross-checks each (villager, task) cell: rung diff vs
practice reps gained, with the 1.4 cap accounted for (a villager
already at 1.4 expects 0 rungs however many reps they bank). Result:
**0 mismatches, 0 decreases** across all 45 qual60 villagers × 14
tasks (and 0 mismatches in the qual30 set too). Every rung gain has
the reps to explain it; no competence moved without practice; nothing
ever went backwards. Competence has exactly two inputs — occupation
base (+ temperament) and practice steps — and the census confirms
the practice half is doing all the moving.

Practice reps gained (qual60), by task: wood 306 (29 villagers),
stone 308 (27), water 184 (28), cook 147 (9), deadfall 37 (18),
fish 38 (6), garden 32 (5), forage 0 (0), hunt/scout/patrol/teach/
tend/mend 0. The rung steps follow the reps: wood 14, stone 16,
water 11, cook 6, fish 2, garden 1 — and deadfall 0 rungs in qual60
despite 37 reps, because no single qual60 villager reaches the 8-rep
first threshold (37 reps spread over 18 villagers, ~2 each).

Skills gained (224, qual60) attribute to teaching and track levels,
not to practice: 219 of the 224 were gained by villagers who had
learned ≥1 lesson; 165 by villagers with ≥1 track level-up; 110
lessons taught / 122 learned / 49 level-ups. Practice grows
competence; lessons + level-ups grow skills. The two lanes are
separate, and the census keeps them separate.

## Opportunities — offered vs taken vs refused, per task

Two offer channels: direct assignments via `Game.assignTask`
(trust/obedience/fitness-gated) and task leads (`v.taskLeads`, the
lead works their domain every part, ~3/day). Resolved = what actually
happened (final task after any redirect).

| task | assign ok | refused | lead-days | resolved | rung lines |
|---|---|---|---|---|---|
| wood | 0 | 1 | 0 | 1,129 | 54 |
| stone | 0 | 0 | 0 | 1,126 | 56 |
| water | 692 | 96 | 255 | 629 | 39 |
| cook | 257 | 10 | 126 | 406 | 24 |
| fish | 807 | 27 | 253 | 208 | 9 |
| deadfall | 154 | 224 | 59 | 223 | 8 |
| garden | 0 | 0 | 0 | 94 | 2 |
| forage | 0 | 0 | 82 | 53 | 3 |
| hunt/scout/patrol/tend/teach/mend | 0 | 0 | 0 | 0 | 0 |

Three shapes in that table, and each is a different gate:

- **Wood/stone resolve 2,255× with (almost) no assignments at all.**
  Wood was assigned ONCE in 8 seeds (and refused); stone never. They
  are never led either (0 lead-days). They resolve because they are
  the OVERFLOW: the prod-throttle turns fish/forage/garden work into
  wood/water/stone on a rotating basis (1,654 redirects), and the
  cistern redirect turns full-cistern water hauls into wood/stone
  (1,153 cistern redirects). Villagers get
  better at woodcutting and stonework almost entirely by accident —
  they were sent fishing or hauling water, the stores were full, and
  they were turned to the woodpile instead. The practice accrues on
  the ALT task, which is why wood/stone dominate the rung table while
  fish (the assigned task) barely moves.
- **Fish is the most-offered, least-done task.** 807 direct
  assignments + 253 lead-days (~1,566 offered) → 208 resolutions.
  The 27 refusals are trivial; the gap is the throttle: whenever the
  pantry holds >4 fresh days, fish duty becomes wood/water/stone.
  The village fishes only when it is hungry. That is the design
  working (the throttle exists to stop stockpiling surplus), and it
  is also why fishing competence barely moves (2 steps, 6 villagers
  with reps) despite being the policy's most-assigned task.
- **Deadfall is the most-refused task.** 224 refusals against 154
  acceptances — the only task refused more often than accepted (the
  trust/obedience gate + the 40%-reluctant roll below trust 40).
  It still resolves 223× (59 lead-days carry it), but the reps spread
  too thin for rungs in qual60 — 4 steps in the qual30 set, where the
  shorter-tenure workers live.

## Blocking gate per zero-movement task (prereg rule)

- hunt, scout, patrol, tend, teach, mend: **NEVER OFFERED** — 0
  assignTask ok, 0 lead-days, 0 resolved. The policy never asks.
  (Hunt/scout/patrol are also trust-gated at 20+ and fitness-gated
  at 40 HP, but the gate never gets reached — the offer never
  happens. Teach/tend/mend have no policy path at all.)
- forage: moves only in the qual30 set (1 step, 13 reps) — its
  workers do not reach 60 NPC days. 0 in qual60 is a tenure bar,
  not zero practice. Offered via leads only (82 lead-days).
- deadfall: moves only in the qual30 set (4 steps, 132 reps) — same
  tenure shape, plus the refusal gate above.
- garden: moves (1 step qual60) — offered only via the garden-keeper
  path, never via assignTask; 94 resolutions.

## The specialistSkill hard-gate, sized

- specialist 0→positive: **0 villagers** (qual60 and qual30 alike);
  spec ups: **0** anywhere.
- Gate-blocked villagers (foodXp ≥ 5 gained in a spec with base
  skill 0): **0 in every spec** — because foodXp gained is **0 in
  every spec**. Nobody's foodXp moved at all in 80 days.
- Why: `specialistSkill` (food.js:1230) is occupation match ONLY,
  plus +1 iff base > 0 AND foodXp ≥ 5. foodXp is written ONLY by the
  smoking/preserving path (food.js:1471, inside `askSpecialist`),
  which the competent policy never invokes — preserving is a
  scholar-side UI action (`preserveFood`, scholar inventory), and the
  policy never asks a specialist to do it. So the +1 is unreachable
  in organic sim play even for occupation-matching villagers, and
  the 0→positive path does not exist in code at all (the `skill > 0`
  guard). Practice reps never feed foodXp — the two systems do not
  touch. The "skill" half of the 2026-11-05 census is still 0, for
  a code reason, not a measurement reason. This is a food.js arm's
  blank (already named in the 2026-11-05 census record and the
  drive-practice metric review), not this arm's build.

## Sense test (read the lines, not just the counts)

Practice lines read as people getting better, with the name and the
work varying: "Seymour is getting the hang of woodcutting", "Wanjiru
is getting the hang of stonework", "Brendan is getting the hang of
cooking" — then the same Brendan on woodcutting, the water run, and
stonework days later. Seymour (a Midwife, withdrawn) worked 112
resolutions over days 2–44 — wood 46, water 32, stone 32 — and went
1.0→1.4 at woodcutting, 1.0→1.3 at stonework and the water run, while
gaining wound_care, steady_hands, herbal_medicine, preserve_food:
a coherent person, not a counter. Teaching reads as people too:
Mia teaches Seymour preserve_food on day 1, Ursula teaches Brendan
wound_care day 1, and by day 5 Seymour is teaching Brendan
herbal_medicine — the student becomes the teacher. Two caveats: the
line template repeats (same sentence every time; person + task is
what varies), and the same "getting the hang of" line fires for
redirected work — a villager sent fishing who ends up cutting wood
is praised for woodcutting, which is honest about what they did but
never says what they were sent to do. Verdict: reads as people
improving, not numbers ticking — within the haven-labor half the
policy exercises.

## Named levers for the next arm (no build here)

1. **TASK-COVERAGE (policy / one-brain duties)** — hunt, scout,
   patrol, tend, teach, mend are never offered. The next arm is a
   policy/task-coverage arm (or the one-brain scorer's duties, Steve
   2026-11-06 17:12 CST item 5): offer the work, then measure
   whether practice follows. Size of the prize: 6 tasks × the
   practice ladder, currently all at 0. Do NOT build it here — it is
   a policy change, and the one-brain program owns duties.
2. **SPECIALIST-FOODXP (food.js arm)** — give villagers a path to
   foodXp (askSpecialist in the policy's daily round, or practice
   reps feeding foodXp for the matching spec), and decide the
   0→positive question: should 5+ foodXp in a spec open the ladder
   for a non-matching occupation, or is occupation-match the intended
   hard gate? That is a design call (Steve-call if the gate is
   intended), not a measurement call. Size: 0 villagers move today;
   the gate blocks every non-matching occupation in every spec.
3. **OVERFLOW-ACCIDENT (throttle/cistern)** — wood/stone competence
   is currently an accident of two overflow valves (1,654 throttle
   redirects + 1,153 cistern redirects). If the design
   wants villagers to get good at wood/stone on purpose, the work
   should be assigned on purpose; if the overflow is fine, say so
   and the "accident" is just how the village works. No code change
   proposed — a design read, not a lever.
4. **DEADFALL-REFUSAL (trust gate)** — 224 refusals vs 154 accepts
   is the only task refused more than accepted. Worth a look by a
   trust/social arm: is deadfall refusals' trust threshold doing
   what Steve wants, or is the village's main dead-wood crew being
   turned away by a gate meant for dangerous work?

## Wall numbers (the wall did not move)

| | this replication |
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

`scripts/test-practicemove-20261106.js` — ALL GREEN (25/25):
T1 clean attribution (2 cells / 2 steps / 2 lines, 0 mismatches);
T1b missing rung with 8 reps → mismatch counted, DIAG-NO-GO exit 1;
T2 at-cap villager (1.4 + 30 reps → 0 expected rungs, counted as
capped not mismatched); T3 gate naming (NEVER OFFERED / REDIRECTED
/ below-threshold / throttle ledger read); T4 specialist gate sizing
(blocked +1, up +1, 0→positive 0); T5 replication on the real
roleform corpora (33 cells / 50 steps / 195 lines / spec 0→pos 0 /
0 mismatches, DIAG-GO exit 0); T6 skills attribution split
(lessons vs level-ups).
`node scripts/check.js --quick` — 277 passed, 13 failed in 1676s
(log /tmp/practicemove-check-quick.log). Every failure classified, none
arm-caused (this arm changes no src/js, data, or docs; its proof test
is not on the green list and ran standalone green, 25/25 above):
4 are the measurement-proof staleness cluster (proof-update,
measurement-workflow, measurement-cache-flags,
trust-observer-neutrality — known open #1353, Oct 29 stale); 6 are
120s-cap TIMEOUTS under contention (solo-campaign-endings,
synergy-stall, throttlefeast, table-endings, capable-bot,
trust-observer-neutrality — the same timeout class roleform-a saw 10
of under 3-way contention); mobile-combat-cadence + capable-bot are
the proven-pre-existing pair from 2103Z (#1830, re-verified
standalone here, same assertions); phone-frame-proof is a stale
phone receipt (proof-freshness, no game code); occupation-panels
and establishment-r20-fixes fail IDENTICALLY standalone (re-run
here, same assertions — pre-existing on this base). Zero of the 13
failing scripts references any practicemove file.

## Method notes

- Two census legs ran (same seeds, deterministic): the first without
  the cistern-ledger snapshot, the second with it (driver patch:
  `throttle.cisternRedirects` added). Both reproduce the roleform
  numbers identically; the second leg's corpora are the attached
  ones (`practicemove-a-seed9989{1..8}.json`).
- Balanced panel (§15): inapplicable — same limitation recorded by
  killersurvive-a, drive-practice-a and roleform-a: the panel runs
  its own full panel and takes no corpus input, so it cannot compare
  this census corpus on identical seeds. The identical-seed census
  comparison against the recorded roleform numbers is the
  before/after instrument, with per-seed JSON corpora attached.
- Telemetry deviation check: ran per the body; LOUD lines
  (national/table/wins) are the documented spurious regime artifact
  (same as roleform-a: the scale-wall baseline is the winseat regime;
  this census is a pre-seat substrate where 0/8 is the standing
  state). Baseline NOT rolled forward.
- The `assigned` log counts assignTask calls only; wood/stone's
  opportunity channel is the overflow redirects, counted from the
  throttle + cistern ledgers — the resolved log is the ground truth
  for what actually happened.

## Metric review

- The verdict rule as written is satisfied (DIAG-GO), and the
  replication came back bit-identical rather than "within noise" —
  stronger than the prereg required. The prereg's worry (master
  movement since roleform) proved unfounded on these seeds.
- The qual60 bar hides real practice: forage and deadfall move only
  in the qual30 set. A future census should judge movement on the
  qual30 set alongside qual60, or the verdict will keep calling
  "0" what is really "the workers don't live long enough to count".
  The analyzer already names this shape per task; the verdict rule
  should read it.
- The gate-naming rule worked: every zero-movement task got a gate
  with counts, and the two "instrument suspect" branches never fired
  (0 mismatches). The one naming gap found during proof was the
  qual60-vs-qual30 tenure shape — fixed in the analyzer before the
  fresh run (gate reads the qual30 set when qual60 is empty).
- The specialistSkill sizing came back 0/0 not because the gate is
  small but because foodXp never moves in sims at all. The prereg's
  "gate-blocked (foodXp ≥ 5, base 0)" count measures a gate nobody
  reaches; the honest size is "the foodXp path is never exercised by
  the policy". A future food.js arm should measure foodXp movement
  itself, not just the gate count.
- The redirect story (wood/stone by overflow) was NOT in the prereg
  — it emerged from the opportunity ledger. The prereg's
  "offered/taken/refused" framing assumed assignments were the
  offer channel; for wood/stone the offer channel is the redirect.
  Future opportunity ledgers should count redirects as an offer
  channel from the start.

## Blanks filled / documented

- FILLED (measured): the replication — practice-attributed
  competence movement in organic play is 33 cells / 50 steps / 195
  lines, reproduced bit-identically on current master; the brief's
  "nowhere" premise is refuted with counts. Attribution is exact
  (0 mismatches): every rung gain has its reps, every competence
  delta is practice. Every zero-movement task's gate is named with
  counts. The specialist ladder is sized (0 movement, 0 foodXp).
- DOCUMENTED (not chased): six never-offered tasks (policy/one-brain
  blank); the specialistSkill hard-gate + unexercised foodXp path
  (food.js blank); wood/stone competence by overflow accident
  (design read); deadfall refusal rate (trust/social blank); the
  grave_robber skill already in sim-findings.md (not re-filed).
- No build proposed beyond the four named levers above. Any
  role-formation build lands INSIDE the one-brain program (Steve
  2026-11-06 17:12 CST, item 5) as scorer weights and candidates —
  never a new standalone system.

## Convergence state

Axis scale-onramp / winnability chain: NOT converged — wall numbers
are 0 everywhere again (national 0/8, table 0/8, wins 0/8, wave-4
kills 0). Tracker blank #4 (role-formation practice-movement gap)
is MEASURED (this arm): the gap is not a broken practice mechanism
but three named gates — never-offered tasks, the fishing throttle,
and the shut specialist ladder. The next blanks in the 0059Z order
are the drive 64-seed confirm (still owed) and the remaining
winnability-chain items.
