# sim-cheaptend-a — A CHEAPER TENDING SHAPE (PILOT NO-GO, killed)

Run: oversight-flesh-out-loop, run fleshout-20261108T0315Z (Loop A), axis
food-economy (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-cheaptend-a, branch sim-cheaptend-a. Substrate:
branch rebased onto current master a04a6c0fc (see Adoption note). Policy:
competent ONLY in Phase A; CHEAPTEND layer wrapping competent in Phase B
(scripts/policies/cheaptend-a.js, NEW, does NOT edit competent.js or
tendsick-a.js). Env: PLENTYDEPRI=1, DEPOSITGATE=1, CHEAPTEND_A=1 on the
armed leg. Horizon: 150d death-aware. Seeds: pilot 96301–96308 (8 seeds,
the SAME band as tendsick, deliberate reuse for identical-seed
comparability). Prereg: evidence/2026-11-07/sim-cheaptend-a-prereg.md
(binding, incl. the Phase A/B order, the six pilot bars, the G3
final-day revision, and the §15 panel). Confirm band 96309–96324 fresh,
NOT run — confirm runs only on a pilot GO.

## Adoption note (run fleshout-20261108T0015Z died at startup; this run adopts it)

- Committed at adoption: 3c5f13f16 (prereg + instruments) and 4993a5faa
  (chunked writeRobust + panel registration). Uncommitted at adoption:
  evidence/2026-11-07/cheaptend-a-corpus/ (partial baseline corpus on
  the OLD base, bare fingerprint s96301 only, per-seed files up to
  s96308, newest ~02:11Z) plus a 0-byte
  cheaptend-a-competent-s96307.json.tmp-18945 (removed, flap debris).
- BASE MOVE — DECISION, recorded here: master moved 2bc17d793 →
  a04a6c0fc since the prereg (Loop B fightloop-fix-b + xphalf-rejudge-b
  landings, journey r118). The partial baseline corpus was recorded on
  the old base, so it was DISCARDED and the baseline RE-SWEPT on the
  rebased base, per the prereg's rule (the armed leg is judged ONLY
  against its own freshly-swept baseline, never against tendsick's
  numbers). No bases are mixed anywhere in this file. The rebase was
  clean (no quirk stop; new tips fbd4223f9, 5b9d96433); the proof test
  re-ran 19/19 on the rebased tip. The re-sweep was worth it: the new
  base moves the baseline itself (median survival 128d → 113d,
  starvation 1 → 8, sick-days 0.065 → 0.057) — judging the armed leg
  against the old base would have scored a different village.
- safe-commit.sh index clobber struck twice this run (baseline commit
  f7ce18102, armed commit 3addf08d1: all files showed staged-deleted
  after a correct commit). Repaired both times with the known recipe
  (`git ls-tree HEAD -r -- <dir> | git update-index --add
  --index-info`); both commits verified correct (`git show --stat`
  matches the file lists) and the tree verified clean after each
  repair.

## Verdict: PILOT NO-GO — killed, no confirm

The cheap shape fires exactly as designed and moves nothing. Three
of the six bars miss:

- PRIMARY (sick-days per village-day): baseline 0.057 → armed 0.084,
  ratio 1.456 ≤ 0.90 → FAIL. Mean episode duration 2.8d → 3.1d.
  Episodes 142 → 189, sickness deaths 14 → 20, cures 0 → 1.
- STARVATION: baseline 8 → armed 5 (GO ≤ 9 = baseline+1) → PASS.
- SURVIVAL: median 113d → 83d (GO ≥ 90.4d) → PASS fails: 83 < 90.4
  → FAIL.
- PER-SEED: regressions >30d vs own baseline: 2 (GO ≤ 1) → FAIL.
  s96301 −50d (132→82), s96306 −32d (109→77).
- FORAGE-COST: foraged 0.996×, fish 1.367×, duty-stocked 1.042×
  (GO: each ≥ 0.90×) → PASS. The cheap shape really does cost no
  food — the tendsick kill reason is gone.
- ENGAGEMENT: acts 26 (≥10) on 118.2% of eligible days (≥25%)
  → PASS. The scholar really does tend on the days the gate allows.

GO CHECK: primary FAIL | starvation PASS | survival FAIL | per-seed
FAIL | forage-cost PASS | engagement PASS | gate-crosscheck PASS
(acts on ranging days = 0). A miss is NO-GO, never re-scored. No
confirm (96309–96324 stays fresh, unexercised). The policy file
stays in the repo as dormant measurement tooling (same precedent as
tendsick-a: policy-side killed arms land their tooling; the policy
is loaded only by sweeps, never by the game). No src/js was touched
at any point.

KILL TAXONOMY (§14a): **CONCEPT-DEAD (primary) with a METRIC-BROKEN
secondary.** The mechanism autopsy is in the concept's own logic, so
it is not filed as merely metric noise: the not-ranging pool is
structurally ~3% of the opportunity — eligible days 12 (baseline) /
22 (armed) against 286 / 379 sick-at-Haven days; the trip was
planned on 763 of 775 sick-at-Haven days in the baseline. The layer
fired on every day it was allowed to (26 acts, 0 on ranging days,
cap respected) and the fever burden still rose, because 26 acts
cannot move a 401-sick-day pool. The cap was never the binding
constraint — the gate was. No re-tuning of the cap (2/day → 3/day)
can fix a gate that opens 22 days in 8 villages. METRIC-BROKEN
secondary: the pooled primary on n=8 with trajectory re-roll noise
(per-seed sick-days swung ±0.05 on the armed leg alone) cannot
resolve a ≤26-act effect — the pilot measures re-roll, not the
layer. The two regressions are re-roll, not act-caused: s96301 lost
50 days on 2 acts, and a tend costs 64 ticks on a day the trip was
not ranging, so it cannot starve anyone. But the bars bind
regardless, and a lever that cannot move its own metric is dead,
not unlucky. Do not retry without a new mechanism — e.g. a
village-side care lever (more medics, the feveranat DIAG-GO signal)
rather than more scholar time in any shape.

## Baseline (Phase A — re-swept on a04a6c0fc, competent, 150d death-aware)

Pooled, 8 seeds 96301–96308 (821 village-days, 6,983 villager-days).
G2 PASS, G3 revised PASS (letter FAIL on s96305, see Metric review).

- B1 FEVER BURDEN: sick-days/village-day = 0.057 (401 / 6,983); mean
  episode duration = 2.8d; episodes = 142 (closed 142, open 0);
  villagers affected = 78; sickness deaths = 14. Per-seed
  sick-days/village-day: 0.024 / 0.091 / 0.040 / 0.056 / 0.068 /
  0.073 / 0.033 / 0.112. Per-seed mean duration: 1.7 / 3.3 / 2.0 /
  2.4 / 3.6 / 4.3 / 2.1 / 3.6d. Episodes per seed: 16 / 18 / 25 /
  13 / 19 / 13 / 16 / 22.
- B2 OPPORTUNITY: sick-at-Haven days = 286; treat/tend acts under
  competent = 0 (cures 0). Scholar healing-ability holdings (days
  held / at L2+): herbal_remedy 377/172, field_medicine 384/70,
  triage 384/70.
- B2b GATE POOL (this arm): eligible days (sick + at Haven + no
  trip planned) = 12 | trip-planned days = 763. Per-seed eligible:
  1 / 1 / 0 / 0 / 2 / 8 / 0 / 0. The pool the whole concept rests
  on is 12 days in 8 villages.
- B3 PRODUCTION COST: fever days run sicker and (mostly) hungrier
  than non-fever days (healthFrac fever 0.71–0.92 vs non-fever
  0.80–0.93; produced/need fever 0.86–1.16 vs non-fever 0.91–1.13).
  Per-seed fever prod/need / health vs non-fever: s96301 1.01/0.915
  vs 1.055/0.889; s96302 0.856/0.746 vs 0.914/0.797; s96303
  1.076/0.877 vs 1.128/0.917; s96304 1.111/0.92 vs 1.067/0.926;
  s96305 0.998/0.834 vs 1.084/0.905; s96306 0.941/0.733 vs
  0.966/0.835; s96307 1.155/0.863 vs 1.118/0.884; s96308 0.902/0.708
  vs 0.932/0.809.
- B4 GUARDRAILS: villager starvation deaths = 8 (s96302: 4,
  s96308: 4); median survival = 113d (per-seed 132 / 61 / 149 / 61
  / 119 / 109 / 117 / 73); empty-pantry village-days = 20; wave
  reach 5 on 2/8 seeds (96303, 96307); death causes: the wild 56,
  monster 15, sickness 14, a wound that wouldn't close 8,
  dehydration 5, ambush 4, a stranger 4, contest 5, the arena 3,
  starvation 9 (8 villager + 1 player), combat 1, gavel 1, the
  focus group 1, spool 1, lockjaw 1; national 0/8, table 0, wins 0.
- B5 NPC CARE: villagerCareTick tends = 89 (0.6 per episode).
- Forage baseline: 'Foraged food' stocked = 293,776 kcal; 'Fish
  catch' = 283,203 kcal; duty-stocked all names = 807,526 kcal
  (42 / 41 / 116 kcal per village-day).

## Pilot (Phase B — armed, CHEAPTEND_A=1)

Analyzer: `node scripts/analyze-cheaptend-a.js
evidence/2026-11-07/cheaptend-a-corpus-armed
evidence/2026-11-07/cheaptend-a-corpus` (exit 0).

- B1 FEVER BURDEN: sick-days = 583, village-days = 6,973,
  sick-days/village-day = 0.084; mean episode duration = 3.1d;
  episodes = 189 (closed 188, open 1); villagers affected = 89;
  sickness deaths = 20. Per-seed sick-days/village-day: s96301
  0.052, s96302 0.163, s96303 0.040, s96304 0.056, s96305 0.123,
  s96306 0.105, s96307 0.033, s96308 0.112. Per-seed mean duration:
  2.3 / 4.0 / 2.0 / 2.4 / 3.5 / 3.5 / 2.1 / 3.6d. Episodes per seed:
  18 / 32 / 25 / 13 / 42 / 21 / 16 / 22.
- B2 OPPORTUNITY: sick-at-Haven days = 379; treat/tend acts = 26
  effective (25 tended, 1 cured; +3 no-effect tends = 29 events);
  treatEvents by kind:outcome = {tend:tended: 25, treat:cured: 1,
  tend:no-effect: 3}. Scholar healing-ability holdings (days held
  / at L2+): herbal_remedy 355/132, field_medicine 354/6,
  triage 354/6.
- B2b GATE POOL: eligible days = 22 | trip-planned days = 753 |
  acts on eligible days = 26 | acts on ranging days = 0
  (cross-check: must be 0) | days with acts = 21. Per-seed
  eligible days: 2 / 3 / 0 / 0 / 1 / 16 / 0 / 0. Per-seed acts:
  2 / 4 / 0 / 0 / 1 / 19 / 0 / 0. Four seeds never fired at all —
  s96303, s96304, s96307, s96308 have zero eligible days in the
  armed trajectories (their per-seed survival, deaths, and meals
  are byte-identical to baseline: the layer changed nothing there).
  s96306 carries 19 of the 26 acts.
- B3 PRODUCTION COST (per-seed fever vs non-fever produced/need +
  mean healthFrac): s96301 1.058/0.914 vs 1.053/0.919; s96302
  0.787/0.692 vs 0.806/0.774; s96303 1.076/0.877 vs 1.128/0.917;
  s96304 1.111/0.92 vs 1.067/0.926; s96305 0.879/0.684 vs
  1.04/0.825; s96306 0.781/0.624 vs 1.002/0.896; s96307 1.155/0.863
  vs 1.118/0.884; s96308 0.902/0.708 vs 0.932/0.809.
- B4 GUARDRAILS: starvation deaths (villager) = 5 (s96302: 1,
  s96308: 4); median survival = 83d, max 150d; empty-pantry days
  = 24; death causes: the wild 54, monster 19, sickness 20, a
  wound that wouldn't close 11, starvation 6 (5 villager + 1
  player), dehydration 4, ambush 3, contest 3, a stranger 5, the
  arena 1, the night 1, the focus group 1, spool 1, lockjaw 1,
  buffering 1. Per-seed survival: 82 / 84 / 149 / 61 / 150 / 77 /
  117 / 73d. Per-seed starvation:
  0 / 1 / 0 / 0 / 0 / 0 / 0 / 4.
- WALL: national 0/8, table 0, wins 0, waveReach {1:8, 2:8, 3:8,
  4:8, 5:2}.
- B5 NPC CARE: villagerCareTick tends = 88 (0.5 per episode).

### Forage cost (the "cheap" read — the bar that PASSES)

Pooled stocked kcal from flowSeries:

| stocked | baseline | armed | ratio | GO |
|---|---|---|---|---|
| Foraged food | 293,776 | 292,743 | 0.996 | ≥0.90 PASS |
| Fish catch | 283,203 | 387,077 | 1.367 | ≥0.90 PASS |
| Duty-stocked, all names | 807,526 | 841,271 | 1.042 | ≥0.90 PASS |

The cheap shape really is cheap: tending only on no-trip days
costs the village no food at all (foraged flat, fish and duty
stocking up on re-roll). The tendsick kill reason is gone — and
with it went the effect. The day has no slack, and the "free" time
barely exists either: the village is nearly always in
trip-needed state (pantry under 25k kcal, scholar under half
kcal, or no pantry gift in 3 days), so the gate opens on ~3% of
sick-at-Haven days.

### Before/after replication table (analyzer output, verbatim)

- PRIMARY (sickdays): baseline=0.057 armed=0.084 ratio=1.456
  (GO: <= 0.9x)
- GUARDS: starvation baseline=8 armed=5 (GO: <= 9) | median
  survival baseline=113d armed=83d (GO: >= 90.4d) | per-seed
  survival regressions >30d: 2 (GO: <= 1) [s96301 -50d, s96306 -32d]
  | empty-pantry days: baseline=20 armed=24
- FORAGE COST: Foraged 0.996 | Fish 1.367 | Duty-all 1.042
- ENGAGEMENT: acts=26 (GO: >= 10) | share of ELIGIBLE
  sick-at-Haven days=118.2% (GO: >= 25.0%) | eligible days=22
  (baseline eligible=12) | share of ALL sick-at-Haven days
  (tendsick denominator)=6.9% | acts on ranging days=0 | days
  with acts=21
- GO CHECK: primary FAIL | starvation PASS | survival FAIL |
  per-seed FAIL | engagement PASS | forage-cost PASS |
  gate-crosscheck PASS. PILOT VERDICT: NO-GO.

### Balanced panel (§15)

ATTEMPTED — see panel section below (filled after the panel run;
if the panel build fails in the registry/ingestion class, the
analyzer replication table above stands as the comparison and the
failure class is named here — a tooling failure never re-scores
the verdict).

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/cheaptend-a-corpus/cheaptend-a-competent-s*.json'
--metrics national,table,wins,exiled` → three LOUD lines:
national disappeared (baseline 12 → current 0), table disappeared
(16 → 0), wins disappeared (16 → 0). VERDICT: regime artifact,
explained, no investigation and NO baseline roll. The scale-wall
baseline is explicitly regime-labeled "winseat — full win-side win
stack" (national 12/16, table 16/16, wins 16/16) with the note "DO
NOT compare pre-seat / courtship / readiness substrates against
this baseline — wins are structurally ~0 there." This run's
competent 150d substrate is pre-seat (national 0/8, table 0, wins
0 on BOTH legs, wave-5 reach 2/8) — exactly the regime the note
warns about. The baseline was NOT rolled forward.

## Metric review (post-run)

- G3 CORPUS, baseline leg: letter FAIL, revised PASS. s96305:
  daySeries=119 = daysAlive=119, but flowsCover=false — the final
  day (119, village-lost end) has no flow row. The revised rule
  (pre-registered in this run's prereg, adopted from the tendsick
  metric review) excuses exactly this: a mid-day village-lost end
  leaves no flow event to record. The armed leg's G3 passes both
  letter and revised. G2 neutrality PASS on both legs (recorded ==
  bare on all 8 seeds, both policies). The corpus is valid for
  this verdict.
- The analyzer's "acts" (26) excludes the 3 no-effect tends (29
  total treatEvents); the sweep's per-seed "treats=" counts all
  29. Both numbers pass the engagement bar (≥10) either way; the
  bar is about acts, and the analyzer's effective-acts reading is
  the stricter one.
- Pool-sizing (§14b check 2), post-hoc: the prereg set the primary
  bar (10% of 401 sick-days ≈ 40 sick-days saved) against a pool
  the pilot then measured at 12–22 eligible days. At 2 acts/day
  the theoretical maximum saving is ~26–52 sick-days, and only if
  every act shortens an episode (daysLeft==1 tends save 0 days).
  The bar sat at the edge of the theoretical maximum — a
  pre-pilot pool probe would have flagged this as a foregone
  near-miss. Next arm in this family must probe the eligible pool
  BEFORE pre-registering a fever bar.
- No other metric proved wrong. The starvation, survival, and
  per-seed guards did what they are for: they caught a lever whose
  effect size is smaller than the re-roll noise it swims in.

## Sense (SENSE-TESTING LAW)

Transcripts read on two seeds (s96306, s96302), armed policy,
narration-on sense runs reproducing the corpus trajectories
(s96306 STATS: 21 tends, 16 eligible days — matches the corpus).
The tending reads as people caring for each other, not as a
mechanic firing:

- d2, s96306 — Owen, in the pantry doorway, satisfied: "No one's
  going hungry this week. Sitting with the fever cases instead —
  someone should."
- d20, s96306 — the feast log, in passing: "Zoltan stayed in their
  tent, feverish." The sick are present at the feast even by their
  absence.
- d21, s96306 — the System itself begs: "ZOLTAN IS FAILING. OUR
  MODELS GIVE THEM... A CHANCE, IF TENDED. TEND THEM. MEDICINE,
  REST, SOUP, VIGIL — WHATEVER YOUR SPECIES DOES. BRING THEM
  BACK." (Aid quest: TEND THE SICK — Zoltan recovers, any means.)
  The same day, the scholar's own line: "You sit with Zoltan —
  cool cloth, water when they wake. It's not medicine, but it's
  not nothing."
- d24, s96306 — "Zoltan is sitting up again. Whatever the fever
  was, it let go." And elsewhere the same beats repeat honestly:
  "Khoi is on the mend — the fever broke." / "Khoi is sitting up
  again." / "Carmine is feverish, a cut gone hot and angry. Rest
  and clean water — or it gets worse."
- s96302 sense run: the same tend lines fire on its few eligible
  days (3 days, 5 tend events): d2 "You sit with Claire — cool
  cloth, water when they wake. It's not medicine, but it's not
  nothing."; d3 "Claire is sitting up again. Whatever the fever
  was, it let go."; d8 "Claire is back on their feet — the fever
  ran its course."; d10 "Alejandra is sitting up again..."; d16
  "Asher is sitting up again..." The recovery beats recur across
  seeds, which is the engine's honest recovery narration, not a
  repeated script the layer wrote.

Judgment: the care itself is sensical and voiced — the scholar
sitting with the sick, the System pleading for a vigil, the
village noticing. What is NOT sensical is the premise the layer
was built on: a village that is always one bad week from an empty
pantry does not have "days the trip wouldn't range anyway." The
gate opens 22 days in 8 villages because the village is always
hungry. The fiction and the numbers agree: there is no free time
to tend with. (Side note for the backlog, not chased here: the
engine already has a TEND THE SICK aid quest the System offers
when a villager is failing — the scholar-side care path exists
independently of this layer.)

## Village assessment in plain words

Eight villages, same seeds as the tendsick run, left alone and then
tended on the cheap. Left alone they lasted a median 113 days; the
fever touched 78 people and killed 14, and on two seeds four people
each starved. Tended only on days nobody was going out anyway, the
scholar sat with the sick 26 times — Zoltan's fever broke after a
night of cool cloths, the System itself begged for a vigil — and
the village stocked just as much food as before. But the fever
didn't get better: it touched 89 people and killed 20, and the
villages died a month earlier on median. The tending wasn't the
cause — 26 cool cloths can't kill a village — but it wasn't a
cure either, because the days it was allowed to happen barely
exist. A village that is always hungry has no spare days. The wall
stands: national 0/8, table 0, wins 0, wave 5 reached on 2 of 8.

## Blanks filled or documented

- FILLED: the cheaper tending shape is measured and dead. Tending
  only on no-trip days costs no food (foraged 0.996×, fish 1.367×,
  duty 1.042× vs baseline) — the tendsick kill reason is gone —
  but the pool is 12–22 eligible days in 8 villages, the fever
  burden rose (0.057 → 0.084), median survival fell (113d → 83d),
  and the layer cannot move its own metric. The "free time" the
  shape was built on does not exist: the trip is planned on ~97%
  of sick-at-Haven days.
- DOCUMENTED (named next arms, not built here): (1) a village-side
  care lever — more medics / healer presence (the feveranat
  DIAG-GO signal), not more scholar time in any shape; the
  scholar's day has no slack in any gating. (2) Any future arm in
  this family must probe the eligible pool BEFORE pre-registering
  a fever bar (§14b check 2). (3) The engine already offers a
  TEND THE SICK aid quest when a villager is failing — a
  scholar-side care path exists independently; whether the quest
  path moves the burden is an open measurement, not this arm's.
- The confirm band 96309–96324 remains fresh and unexercised.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- The not-ranging pool is ~3% of sick-at-Haven days. Any lever
  gated on "days the trip wouldn't range anyway" is a non-lever;
  the trip is planned whenever the pantry is under 25k kcal, the
  scholar is under half kcal, or no pantry gift in 3 days — which
  is nearly always.
- TEND THE SICK aid quest exists in the engine (System offer when
  a villager is failing) — unmeasured as a fever lever.
- Pre-pilot pool probe needed for fever bars (§14b check 2):
  eligible days must be measured before a sick-days bar is set.
