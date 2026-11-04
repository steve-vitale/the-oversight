# Floored tend-through CONFIRM, adopted — Loop B run fleshout-loop-b-20261104T1735Z — VERDICT: NO-GO

Axis: scale-onramp / winnability chain. This is the ADOPTION of the stranded
arm sim-tendfloor-guard-b (dead Loop B 1434Z run; lock retired by the
coordinator after a 71-min-stale heartbeat). Its tendseason arm already landed
as 71041af7d and was NOT touched. This adoption touches no src/js, no gate /
price / deed, no Loop A tree / claim / branch, no HELD branch, and proposes no
default flip. No push, no version bump, no live verification, no merge to
master — the coordinator merges.

## Adoption provenance (standacc precedent)

- Stranded branch sim-tendfloor-guard-b tip e533b4a2e, 3 commits: 2ce419577
  (confirm BLOCKED note — band 99009-99024 not fresh), 0f195fb86 (prereg:
  floored tend-through confirm on FRESH band 99217-99232, 300d death-aware,
  drop-count guard (a)–(e)), e533b4a2e (guard driver / wrapper instruments +
  proof 45/45, zero src/js). The stranded branch itself was NOT merged or
  rebased.
- Its 5 committed files were recreated onto this branch and verified
  byte-identical by blob hash before any sim ran:
  evidence/2026-11-04/sim-tendfloor-guard-b-prereg.md (6cf159b0),
  evidence/2026-11-04/sim-tendfloor-guard-b-BAND-BLOCKED.md (379efe24),
  scripts/test-tendfloor-guard-20261104.js (cf95ad58),
  scripts/test-tendfloor-guard-analyze-20261104.js (6942c828),
  scripts/test-tendfloor-guard-driver-20261104.js (b6391709).
- The dead run's uncommitted corpus was READ-COPIED from
  ~/workspace/worktrees/sim-tendfloor-guard-b/evidence/2026-11-04/perseed-tendfloor-guard-b/
  into this worktree's evidence/2026-11-04/perseed-tendfloor-guard-b/. The old
  tree was never modified, its git state never touched, and it was never
  released or deleted. All 31 copied files parsed and matched the prereg
  instrument (arm tendfloor-guard, correct run names, daily + courtship
  fields, 0 instrument errors each). Copied cells carry anchor e533b4a2ecd4.
- The ONLY missing cell, armed seed 99232, was re-run by this adoption with
  the SAME instrument (DAYS=300 SEEDS=99232 POLICY=leadcourt-tendfloor-b
  RUN=tendfloor-guard-armed). The driver refuses to overwrite existing files,
  so no valid file was overwritten. The re-run cell carries this worktree's
  anchor fbef2dcdabaf: 180 days, village-lost, scaleRank global, maxWave 5,
  firstDiploDay 68, holdShare 0.746, drops 2, recoveries 2, trajectory
  flickers, 29 tends, 0 instrument errors.
- Policies verified untouched: `git diff master` is empty for src/js and for
  scripts/policies (leadcourt.js, leadcourt-tendthrough.js and
  leadcourt-tendfloor-b.js all byte-identical to master). The floored policy
  is tend-through with exactly one added gate (tend only while pantry >
  13,500 kcal); the stranded proof test re-verifies that gate in this tree.

## Pre-registration (binding, from the stranded prereg — carried verbatim)

- Seeds: 99217–99232, fresh, identical on both legs, 32 runs total. Baseline
  leg = this run's own tend-through numbers on 99217–99232 (NOT the pilot's
  99001–99008 numbers). Horizon 300d, death-aware (+10d tail max).
- Survival bands: A = to 300d horizon, B = died 150–299d, C = died 100–149d,
  D = died < 100d. Hold-share pooled over diplomacy seeds only
  (firstDiploDay != null). Wave facing = ever-faced from ANY daily snapshot.
  Drop count = analyzer trust-unseason events summed over the leg.
- GO iff ALL of (a)–(e) hold; a miss is NO-GO, never re-scored against a
  friendlier metric mid-run. INSUFFICIENT-DATA only if > 2 seeds in either leg
  carry instrument errors, or the baseline leg has zero diplomacy seeds —
  neither condition occurred (0 instrument errors in all 32 runs; baseline
  diplomacy seeds = 5, armed = 8).

## VERDICT: NO-GO — guards (a), (c) and (e) FAIL; (b) and (d) PASS

| Guard | Bar | Result | Pass? |
|---|---|---|---|
| (a) No survival-band regression, any seed | 0 regressions | Regressions on 99224 (C→D, −7d) and 99225 (B→C, −6d) | FAIL |
| (b) Median death-day delta (armed − baseline, all 16) | ≥ −5 days | 0 days | PASS |
| (c) Armed pooled hold-share | ≥ baseline − 0.05 | Armed 0.916 vs baseline 1.000 (bar ≥ 0.950) | FAIL |
| (d) Wave-facing guard (at most one facing lost per wave) | W4 ≥ 6, W5 ≥ −1 | W4 7 vs 7, W5 1 vs 0 (a gain) | PASS |
| (e) DROP-COUNT GUARD: armed total drops | ≤ baseline + 1 (= 1) | Armed 3 vs baseline 0 | FAIL |

The judge output is `{"verdict":"NO-GO","legA_noRegression":false,
"legB_medianDelta":0,"legC_baseHold":1,"legC_armedHold":0.916243654822335,
"legD_baseW4":7,"legD_armedW4":7,"legD_baseW5":0,"legD_armedW5":1,
"legE_baseDrops":0,"legE_armedDrops":3,"regressions":[99224,99225],
"badSeeds":0,"total":16}`. No guard was re-scored, no metric was swapped,
no seed was dropped.

## Per-seed before/after table (the panel output for this trajectory metric)

Baseline = leadcourt-tendthrough on 99217–99232; armed = leadcourt-tendfloor-b
(same seeds). Days = driver-reported days; band per prereg; hold = per-seed
holdShare (null = no diplomacy on that seed); drops = analyzer drop events;
tend = tendLink event count. Per prereg §15, this identical-seed table IS the
panel output for this trajectory metric; no balance-panel.js compare was
fabricated and no balance-panel.js re-scoring was used.

| Seed | Days base → armed (Δ) | Band base → armed | Scale base → armed | maxWave base → armed | Ever W4 base → armed | Ever W5 base → armed | Hold base → armed | Drops base → armed | Ready base → armed | Tend base → armed |
|---|---|---|---|---|---|---|---|---|---|---|
| 99217 | 62 → 74 (+12) | D → D | regional → regional | 4 → 3 | N → N | N → N | 1.000 → 1.000 | 0 → 0 | 0 → 0 | 24 → 9 |
| 99218 | 23 → 23 (0) | D → D | village → village | 2 → 2 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99219 | 73 → 109 (+36) | D → C | regional → regional | 4 → 5 | Y → Y | N → Y | — → — | 0 → 0 | 0 → 0 | 8 → 24 |
| 99220 | 120 → 144 (+24) | C → C | global → global | 4 → 4 | Y → Y | N → N | 1.000 → 1.000 | 0 → 0 | 0 → 0 | 87 → 37 |
| 99221 | 69 → 95 (+26) | D → D | regional → regional | 3 → 3 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 7 → 0 |
| 99222 | 34 → 34 (0) | D → D | village → village | 3 → 3 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99223 | 38 → 38 (0) | D → D | village → village | 3 → 3 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99224 | 100 → 93 (−7) | C → D REGRESSED | regional → global | 4 → 4 | Y → Y | N → N | — → 1.000 | 0 → 0 | 0 → 0 | 31 → 11 |
| 99225 | 153 → 147 (−6) | B → C REGRESSED | global → global | 4 → 4 | Y → Y | N → N | 1.000 → 1.000 | 0 → 0 | 0 → 0 | 137 → 27 |
| 99226 | 88 → 95 (+7) | D → D | global → global | 4 → 4 | Y → Y | N → N | 1.000 → 1.000 | 0 → 0 | 0 → 0 | 61 → 19 |
| 99227 | 23 → 23 (0) | D → D | village → village | 2 → 2 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99228 | 46 → 46 (0) | D → D | village → village | 3 → 3 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99229 | 80 → 74 (−6) | D → D | global → regional | 4 → 4 | Y → Y | N → N | 1.000 → 0.789 | 0 → 1 | 0 → 0 | 60 → 17 |
| 99230 | 141 → 101 (−40) | C → C | regional → national | 4 → 4 | N → N | N → N | — → 1.000 | 0 → 0 | 0 → 0 | 51 → 12 |
| 99231 | 38 → 38 (0) | D → D | village → village | 3 → 3 | N → N | N → N | — → — | 0 → 0 | 0 → 0 | 0 → 0 |
| 99232 | 74 → 180 (+106) | D → B | regional → global | 4 → 5 | Y → Y | N → N | — → 0.746 | 0 → 2 | 0 → 8 | 31 → 29 |

Median of per-seed deltas = 0 days (not the difference of the leg medians:
baseline median survival 71d, armed 83.5d). The spread is wide: −40 to +106.
Six seeds are identical on both legs (99218, 99222, 99223, 99227, 99228,
99231 — all died before diplomacy could matter); the action is on the other
ten.

## Wall numbers (every run)

- Wins: 0/16 baseline, 0/16 armed. No win flag on either leg.
- National / table end-state (scaleRank at end of run): baseline —
  village 6, regional 6, global 4, national 0. Armed — village 6, regional 4,
  national 1 (99230), global 5. Table is NOT instrumented by this arm: not
  reported as reached, not faked.
- Wave unlocks (maxWave / endUnlockedWave, identical on both counts):
  baseline wave ≥ 4 on 9/16 seeds, wave 5 on 0/16. Armed wave ≥ 4 on 8/16,
  wave 5 on 2/16 (99219, 99232).
- Wave ever-facing: wave 4 baseline 7/16, armed 7/16; wave 5 baseline 0/16,
  armed 1/16 (99219 only — the one new wave-5 facing; 99232 unlocked wave 5
  by end-call accounting but never faced it in a snapshot).
- Median / max survival: baseline 71d / 153d; armed 83.5d / 180d. Every
  village on both legs ended village-lost (16/16 each) — none reached the
  300d horizon, so no band-A seed exists on this band.
- Death-cause shares (instrument deathEvents; baseline 785 deaths, armed 824):
  baseline — villager combat 47.9% (376), combat 14.6% (115), expedition
  12.1% (95), the wild 10.1% (79), monster 5.2% (41), starvation 3.2% (25),
  sickness 1.7%, a wound that wouldn't close 1.5%, remainder scattered
  (contest, ambush, thirst, named beasts, 1 each). Armed — villager combat
  46.1% (380), combat 17.2% (142), the wild 10.6% (87), expedition 10.3% (85),
  monster 6.6% (54), starvation 3.0% (25), sickness 1.3%, wound 1.2%,
  dehydration 0.5%, remainder scattered. Combat (all causes) dominates both
  legs; starvation is flat at 25 deaths each — the floor did not move the
  starvation share.
- Ready days: baseline 0 total; armed 8 total, all on 99232 (the re-run cell).
  No other seed recorded a ready day on either leg.
- Trajectories: baseline — holds-to-death on 99217, 99220, 99225, 99226,
  99229; never on the rest. Armed — holds-to-death on 99217, 99220, 99224,
  99225, 99226, 99230; flickers on 99232; collapses on 99229; never on the rest.
- Arc reach: not instrumented by this arm (stated, not faked).

## Tend totals by pantry band — the floor fired

Analyzer bands use the last daily snapshot at or before the tend day
(snapshot-timing approximation the prereg documents). For the BASELINE leg the
"blocked" column is only a band label — baseline tends unconditionally; for
the ARMED leg it counts tends whose snapshot pantry was ≤ 13,500.

| Leg | Total tends | ≤ 13,500 ("blocked" band) | 13,501–20,000 (floored-allowed) | > 20,000 (always-allowed) | Unknown pantry |
|---|---|---|---|---|---|
| Baseline (tend-through) | 497 | 414 | 51 | 32 | 0 |
| Armed (floored) | 185 | 67 | 72 | 46 | 0 |

The floor fired: floored-allowed tends are 72 (nonzero, as the prereg
requires for the lever to have fired at all), and total tends fell 497 → 185
(−63%) while the pantry-starved baseline tend volume collapsed. The armed
leg's 67 "blocked"-band tends are a snapshot-timing artifact (pantry at the
last daily snapshot vs pantry at the weekly tend decision later in the day),
not 67 floor violations — the policy gate itself is verified present by the
proof test, and the drop evidence below shows the floor biting exactly where
pantry stayed low. See "metric review".

## Drop anatomy (guard (e), and why (c) failed with it)

- Baseline drops: 0 on all 16 seeds. Baseline-collapsing seed count = 0.
  SCOPE OBSERVATION (reported, not judged): this band contains no seed where
  the tend-through baseline itself drops a polity, so the
  floor-on-a-collapsing-seed question stays untested here. Bands are never
  swapped mid-run to chase collapsing seeds. What this band DOES show is the
  reverse: the floor CREATED drops on seeds where the baseline held.
- Armed drop 1 — seed 99229, day 72: two links unseasoned at once
  (trust 41 → 33 and 45 → 37), pantry at drop 2,592 kcal, last tends day 56 —
  a 16-day below-floor gap. Trajectory collapses, no recovery, holdShare
  0.789. This single seed is most of the pooled hold-share shortfall.
- Armed drops 2–3 — seed 99232 (the re-run cell), days 99 and 128: the same
  link unseasoned twice (trust 45 → 38, then 44 → 36), pantry at drops 7,051
  and 8,435 kcal, last tends days 85 and 109 — 14- and 19-day below-floor
  gaps. Both recovered (days 109 and 147, reseasoned), trajectory flickers,
  yet the seed still gained +106 days and reached global. Drops and survival
  gain coexisted on this seed; the guard counts drops regardless, and the
  guard is what it is.
- Pooled hold-share arithmetic: baseline 1.000 over 5 diplomacy seeds; armed
  0.916 over 8 diplomacy seeds. The armed pool ADDS three diplomacy seeds the
  baseline never had (99224 at 1.000, 99230 at 1.000, 99232 at 0.746) and
  loses hold on 99229 (0.789). Composition changed as well as performance —
  see "metric review". Under the binding prereg metric, (c) fails by 0.034
  against its 0.950 bar.

## Sense-test (SENSE-TESTING LAW)

Known capture limit, carried from the prereg: the instrument's SAY_RE does
not match tendLink's own say-lines, so tending is proven by event counts,
not quoted tend lines, unless a captured line matches. No captured line in
either leg was a tendLink line; the lines below are real captured transcript
lines around tend weeks / drop days, quoted verbatim.

- Baseline leg, seed 99220 (87 tends, holds-to-death, 144d armed / 120d base),
  day 32, within two days of tend days 33–35: "Three fires bow to Haven. But
  a realm isn't leverage — it's seasons. These bonds are young; tend them,
  keep the trust, and the court will come." The polity reads as a consequence
  of tending work, not a calendar flip — the game's own narration says the
  bonds are young and must be kept. Baseline 99232, day 26, near tend days
  28+: "1 unprocessed haul onto the counter — the clock is ticking." — the
  pantry pressure the floor is meant to respect is visible in the transcript
  itself.
- Armed leg, seed 99229 (17 tends, drop day 72, collapses), day 2:
  "A person, maybe 50s, with restless hands hesitates, then backs off.
  \"Not today. Sorry.\" (Low trust — reluctant.)" Low trust is narrated as
  reluctance from the first days, and the drop is the same mechanism grown
  up: trust 41 → 33 across a 16-day gap while the pantry sat at 2,592 kcal.
  The collapse reads as a consequence of villagers not being tended because
  the village could not afford it — harsh, but coherent, not robotic.
- Armed leg, seed 99232 (29 tends, flickers, +106d), day 29, near tend days
  31+: "You catch fragments by the fire — Nino telling Stan about you.
  Three retellings in, nobody remembers what actually happened — but everyone
  has opinions." Gossip, retelling, and opinion-drift are the village's
  social texture doing its job while the polity flickers underneath; nothing
  here reads static or repeated-verbatim across seeds (the fire-fragment
  template recurs with different names, which is template reuse, flagged
  honestly, not a sense failure on this arm).
- Nothing in either leg's sampled lines contradicts the numbers: held
  polities are narrated as young bonds to keep; collapsed ones follow
  trust falling below 40 after a tend gap. No line was invented for this
  section; every quote above is copied from the per-seed sayLines arrays.

## Metric review (revisions proposed for the NEXT run, never applied in-run)

- Snapshot pantry bands mislabel armed tends: 67 armed tends carry a
  ≤ 13,500 snapshot pantry although the policy gate forbids tending at
  ≤ 13,500. Cause is snapshot timing (last daily snapshot vs the weekly
  tend decision later in the day), the approximation the prereg already
  documented — but its size (67 of 185 armed tends) means the band split
  cannot be read as "the floor leaked". Next run: record pantry at the tend
  decision itself, not the last snapshot, before judging any band split.
- Pooled hold-share mixes composition with performance: the armed pool has
  8 diplomacy seeds vs the baseline's 5, so two new partial-hold seeds
  (99229 at 0.789, 99232 at 0.746) drag the pool even though the five common
  diplomacy seeds held at 1.000 on both legs except 99229. Next run:
  pre-register hold-share on common diplomacy seeds alongside the pooled
  figure, so a lever that CREATES diplomacy is not punished for it.
- Survival-band regression is coarse at the boundary: both regressions are
  small day losses (−7d, −6d) that happen to cross a band edge (100d, 150d),
  while the median delta is 0 and the mean picture is dominated by +106 on
  99232 and −40 on 99230. The prereg's band rule is binding here and was
  honored; a future prereg could pair the band guard with a day-loss cap
  (e.g. no seed worse than −14d) instead of relying on the band edge alone.
- Drop guard with a zero baseline is maximally strict: bar = baseline + 1 = 1
  drop. Any future floored variant must expect drops on pantry-starved seeds
  (that is the floor's mechanism, not an accident) and should pre-register
  whether flicker-with-recovery counts the same as collapse — here 99232's
  two recovered drops counted identically to 99229's fatal one.
- What the metric proved: the floor cuts tend volume sharply, buys large
  survival gains on some seeds (99232 +106, 99219 +36), creates exactly the
  drops it was designed to risk, and does not preserve hold-share or
  band-survival across all 16 seeds. What it missed: whether the floor helps
  on a genuinely collapsing baseline seed (none existed on this band), and
  whether 99230's −40d (regional → national, but 40 days shorter) is a
  trade worth making — scale rose while survival fell on that seed, and no
  judged metric weighs that trade.

## Telemetry deviation check (honest attempt)

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-04/perseed-tendfloor-guard-b/*.json' --metrics
national,table,wins,exiled` was ATTEMPTED and REFUSED by the tool itself:
"telemetry-check: refusing recorder-corpus input: all 32 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run baseline
here." No --allow-recorder-corpus workaround was used, no compare was
fabricated, and no baseline was reseeded. Outcome recorded as REFUSED with
reason, per the prereg.

## Proof tests (this branch)

- scripts/test-tendfloor-guard-20261104.js (recreated stranded proof):
  45/45 PASS, including the live harness smoke test (2-day tendfloor run,
  0 instrument errors) and the judge fixtures (GO at the drop-guard edge,
  NO-GO on drop breach, INSUFFICIENT-DATA on bad seeds).
- scripts/test-tendfloor-guard-adopt-20261104.js (new adoption proof):
  68/68 PASS — 32 corpus files, both legs on all 16 seeds, 0 instrument
  errors, copied-cell anchor e533b4a2ecd4, re-run cell 99232 armed at 180d
  with a different anchor, prereg guard text present, and the judge over the
  real corpus reproducing exactly NO-GO with (a) FAIL [99224, 99225],
  (b) median 0 PASS, (c) 1.000 → 0.916 FAIL, (d) W4 7→7 / W5 0→1 PASS,
  (e) drops 0 → 3 FAIL.

## Blanks filled / documented

- FILLED (measurement, not game change): the stranded confirm is now judged
  on a complete 32-run corpus — the gap cell is filled, the verdict is
  delivered, and the adoption is reproducible from the committed corpus +
  instruments. No game blank was filled: this arm lands nothing.
- DOCUMENTED: the floored tend-through does NOT confirm. It is NO-GO on
  three independent guards, so it must not be cited as the tend fix, must not
  be flipped on as a default, and must not be re-run on the same metric
  hoping for a friendlier band — a future variant needs a new prereg (see
  metric review) and a fresh band.
- Left unmerged / uncertain: everything in this worktree is unmerged by
  design (coordinator merges; this worker does not merge to master, push,
  bump, or verify live). NOTE: master advanced during this run (ship-loop
  journey-deepening r95 + version bump, new tip 3a32d492) while this branch
  stayed at its fbef2dcd base; the policy diff between this branch and the
  new master tip is still empty, but the coordinator's merge must account
  for the moved base. The old sim-tendfloor-guard-b worktree and its git
  state were left exactly as found. The one genuinely uncertain item is the
  snapshot-timing band artifact (67 armed "blocked"-band tends) — reported,
  not resolved, and it does not change the verdict because guards (a), (c)
  and (e) fail on band-independent counts (bands, pooled hold, drop events)
  as well as on the band split.
