# Pre-registration — sim-vetguard-b (Loop B run fleshout-loop-b-20261118T1330Z, axis: winnability chain)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is DIAG-NO-GO or METRIC-BROKEN per the verdict mapping below, never
re-scored against a friendlier metric mid-run. Metric doubts go under
"metric review" in the evidence file, for the NEXT run.

## Run identity

- Arm: sim-vetguard-b (Loop B) · Branch: `sim-vetguard-b`, based on master
  `8709e9f87` (Loop B 1015Z adoption; includes Loop A wildavoid re-judge
  `95ba293f2` — do NOT rebuild that; this arm is the veteran-guard half
  only).
- Finding: #2506 (Loop B arm sim-seekgate-b, run
  fleshout-loop-b-20261118T0026Z, evidence/2026-11-17/sim-seekgate-b.md;
  census sim-fightgate-scope-b, evidence/2026-11-18/sim-fightgate-scope-b.md,
  landed `5fac3cb71`): the expedition gate would have avoided 18/113 wild
  meetings (15.9%, all outmatched rule); the VETERAN-GUARD rule fired
  NOWHERE — not on any wild meeting, and not on any of the 73 live gate
  calls either. Tracker blank (0130Z run, next blanks #5): "veteran-guard
  half of the fight gate (unmeasured — needs a table-stage veteran to
  exist first)".
- NOTE on the brief's "#2513" citation: finding #2513 in
  `hidden_files/sim-findings.md` is the fleerepair2 analyzer hard-code
  (8-seed instrument check), already FIXED by sim-analyzer2513-b
  (`6aaf09a26`). The veteran-guard question traces to #2506, not #2513
  (the findings file's line 2513 happens to hold the #2506 entry).
  This arm judges #2506's veteran-guard half.

## The guard, as read in code (this tree, before any build)

`winPlanFightGate` (src/js/win-plan.js:855-880), the ONLY caller is
`expeditionMonster` (src/js/villager-agency.js:645):

```js
var isVeteran = hasKillWaveAtLeast(this, vid, 4);  // waveKillLog entry by===vid, w>=4
if (plan && plan.stage === 'table' && isVeteran && wave >= 3 && (party.length < 2 || !allArmed)) {
  plan.stage = 'party'; plan.party = [];
  bump(this, 'avoidances');
  return { avoid: true, reason: 'veteran-guard', party: party.slice() };
}
```

A "table-stage veteran" is therefore a conjunction of FOUR facts:
1. the villager has a wave-4+ kill in `state.waveKillLog` (`hasKillWaveAtLeast(vid, 4)`,
   win-plan.js:178);
2. the villager holds a winPlan at stage `'table'`;
3. the villager meets a wave-3+ beast on an EXPEDITION (the gate's only
   call site — wild paths never consult it);
4. at that meeting the party is solo (`party.length < 2`) or not all armed.

Stage `'table'` is reached ONLY from `winPlanHavenTick`
(win-plan.js:562, 571-573), and ONLY when `beat[5] != null` — i.e.
`state._standingDeferBeat[5]` exists, which `_standingHoldBeat`
(src/js/standing.js:472-476) sets only when the village's capped
standing reaches t5 (200) while wave 5 is not ready (the "fifth draft"
deferral). The fightgate band parked 5/8 villages at standing exactly
199 — one short of the beat. So the chain has a plausible choke point
BEFORE any meeting: table stage itself may be unreachable in 150d
organic play, which would make the guard unreachable, not broken.

A SECOND guard sits upstream: `winPlanDepart` (win-plan.js:679-691) —
a table-stage veteran with no party launch is HELD at Haven for
`VETERAN_GUARD_DAYS` (7) days; only after the hold expires can they go
out solo at all. The fight gate is the backstop "if the hold ever
expires" (code comment). So even a staged table veteran must survive
the depart hold before the fight gate can see them.

## Shape decision: DIAGNOSTIC in two legs (decided from the code)

- Leg S (SURVEY): 8 seeds, 150d death-aware, competent verbatim, the
  fightgate substrate (VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1), same
  band 104301–104308 as the fightgate census. Pure-read recorder:
  daily table-veteran census (plan stages + living wave-4 veterans +
  beat[4]/beat[5] + standing), EVERY `winPlanFightGate` call with
  wave >= 3 (the guard's floor is 3, not 4 — the fightgate driver only
  recorded wave >= 4 gates, so its 73 gate rows cannot answer this),
  and every `winPlanDepart` row for a table-stage veteran. No lever,
  no contrast, no game-code change. The survey answers: does a
  table-stage veteran EVER exist on the band, and does the guard EVER
  get an opportunity?
- Leg T (STAGED PROOF): 1 seed (104301, the first survey seed), same
  substrate/horizon. The driver stages ONE table veteran
  deterministically in the harness and watches what the game does
  with them: at the first day >= 60 with a living organic wave-4
  killer, the driver supplies ONLY the two game-state inputs the game
  itself would produce at standing 200 — `state._standingDeferBeat[5]
  = day` and a `standing`-stage plan seed for that killer — and then
  lets GAME CODE (`winPlanHavenTick`) advance them to `'table'`,
  lets `winPlanDepart` hold/launch them, and records any natural gate
  call. If no organic wave-4 killer exists by day 120, the driver
  grants ONE kill through the real choke point
  (`Game.recordWaveKill('eater', vid, 'vetguard-stage', null)` — the
  ledger path is real; only the fight that would have produced the
  kill is staged) to a living ranger at Haven, then stages as above.
  The guard's correctness itself is proven deterministically by the
  proof test (live staged fixture, direct gate calls with full
  assertions), NOT by hoping the staged sim meets a beast — the sim
  leg proves reachability of the preconditions through game code and
  observes the depart hold + any natural meeting. A single end-of-run
  probe call (`winPlanFightGate` on the staged veteran's live state,
  day 150, recorded as `probe:true`) is supplementary only and never
  judges T1.
- Do NOT claim a defect from zero calls without the
  availability/opportunity inspection: the analyzer reports the full
  chain (living veterans → table plans → table veterans → gate
  opportunities → guard fires) with exact counts, so a zero at any
  link names the link.

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (wave law) and docs/TABLE.md
  (the table prices the run, never gates on godhood) are the canon docs
  for this area. This arm does NOT touch monster stats, gates, prices,
  deeds, or standing, and changes NO game code at all (diagnostic only —
  driver + analyzer + proof test).

## Pre-registered metrics

- S1 (instrument): survey leg — 8 files, exactly the frozen seed list
  (104301–104308), 0 instrument errors, every gate row carries
  planStage/isVeteran/party/allArmed (no null gate inputs), every
  daily-census row carries beat5 + standing. Cross-check (AMENDED,
  see below): the survey trajectories are the current-base truth —
  (a) the clean re-run reproduces the v1 run row-identical on all 8
  seeds (deaths/won/maxWave/endReason/standing — the only difference
  between the runs is the recorder's standing reads, so identity
  proves those reads do not move trajectories); (b) a fightgate-driver
  re-run on seed 104308 at the CURRENT base reproduces the survey
  row-identical (the two drivers agree on this base).
- S1 AMENDMENT #2 (2026-11-18, before any judging — analyzer not yet
  run on the clean corpus): the original cross-check ("wall numbers
  match the fightgate census corpus") is UNACHIEVABLE as written: the
  fightgate corpus was produced on base 62b1e749d, and seven game-code
  commits landed between it and this base (8709e9f87) — triodrought
  companion-carry restore (f0c6869b6), wildavoid (5402d4cc3),
  fleerepair3 (0b8312f20), journey pocket repair (cc35d76b9),
  trail-talk (32c62cd76), notickexact (5fe00c196), version bump
  (7686266e7). The fightgate driver re-run on 104308 AT THE CURRENT
  BASE gives 77 deaths / village-lost d143 — identical to this survey,
  not to its own corpus (74 / survived) — proving the mismatch is the
  base move, not the recorder. The v1 run (daily villageStandingTotal
  reads, first suspected as contamination) reproduces the clean re-run
  row-identical on all 8 seeds, so the standing reads were in fact
  pure (the game reads the same function daily via unlockedWave) and
  the v1 corpus is retained as perseed-vetguard-b-survey-v1 for the
  determinism check. S1's intent — prove the recorder does not move
  trajectories — is preserved by checks (a) + (b); the stale-base
  comparison is dropped, not waived silently.
- S2 (survey population): >= 1 living wave-4 veteran observed on the
  survey band (the veteran half of the chain exists in organic play).
- T1 (guard works when staged): `scripts/test-vetguard-b.js` green on
  the final tip — on a live staged fixture the gate returns
  `{avoid:true, reason:'veteran-guard'}` for a solo table veteran vs a
  wave-3 beast, returns null for the same veteran with a full geared
  party, returns null vs a wave-2 beast, returns null when the plan is
  not table-stage, and the firing call demotes the plan to `'party'`
  with `avoidances` bumped; plus the analyzer `--selftest` green.
- T2 (staged leg reaches table through game code): in leg T, the staged
  veteran reaches stage `'table'` via `winPlanHavenTick` (observed in
  the daily census, not written by the driver) and the driver records
  >= 1 depart-side row for them (`veteranGuardHolds` hold or launch).
  T2 AMENDMENT (2026-11-18, before judging the staged leg): the first
  staged run (T2-v1) FAILED on an instrument bug, not on game code —
  the driver picked james_okonkwo, who had JUST become the scholar
  (succession day 108); agencyTick skips the scholar
  (`villager-agency.js`: `if (rid === this.villagerId) continue`), so
  winPlanHavenTick / winPlanDepart never run for the player character
  and he sat at Haven 6 days (108–113) with a standing plan + beat[5]
  and never advanced, dying day 114 in the wild. The driver now
  excludes the current scholar from the staging pick and flags
  isScholar on census vetDetail rows; the staged leg was re-run as
  T2-v2 on the same seed. T2-v2 ALSO failed to reach table (nikos,
  staged day 120 as an NPC, flickered in/out of Haven, became the
  scholar day 126, died day 130) — with the tick-time alignment
  unobserved. A v3 instrument addition (winPlanHavenTick wrap logging
  every tick call for the staged veteran) answers whether the tick
  ever ran for him; T2 is judged on the v3 run, with v1/v2 retained
  as perseed-vetguard-b-stage-v1/v2 for the record. The frozen T2 bar
  itself does not change.

**Verdict: DIAG-GO iff S1 && S2 && T1 && T2 && (survey guard fires >= 1
with correct context OR unreachability proven: table-stage veterans ==
0 on the survey band AND beat[5] == 0 on all 8 seeds AND max CAPPED
standing < 200 on all 8 seeds — the chain evidence for WHY).**
AMENDMENT (2026-11-18, before any judging — survey still running,
analyzer not yet run): "max CAPPED standing" corrects the original
"max standing". The code gates the fifth-draft beat on the CAPPED
total (`standingPlentyCappedTotal()`, standing.js:451 — bread counts
100 max toward the fifth draft), not the raw total; the fightgate
corpus on this band already shows raw standing 350/505/350 on three
seeds, so a raw-standing bar would misjudge the mechanism. The
decisive condition is beat[5] == 0 on all seeds; the capped-standing
number is its mechanism explanation. The analyzer implements the
corrected (capped) bar.
**METRIC-BROKEN iff S2 fails** (no living wave-4 veteran on the band —
the question is unanswered, not answered-no).
**DIAG-NO-GO iff S1 fails (instrument dirty/contaminated) or T1 fails
(the guard itself is broken when its preconditions hold — then the
next step is a FIX arm, not a diagnostic pass) or T2 fails (the
staging path through game code does not work as read).** No re-scoring.

Reported as the ANSWER (not gated): the full chain counts per seed
(living wave-4 veterans; table plans; table veterans; gate calls
wave>=3 with table veteran; guard fires; depart holds/launches for
table veterans); the standing distribution (max standing per seed,
seeds at exactly 199); staged-leg narrative (staging day, table day,
depart holds, any natural meeting, probe result); wall numbers
(national/table/wins, wave 4-5 unlocks, median survival).

## Calibration (frozen before the sweep)

From the fightgate census corpus on this exact band/substrate
(evidence/2026-11-18/perseed-fightgate-scope-b-diag, 8 seeds, 150d):
wave-4+ kills exist (7 vKills on the fleerepair2 band; 11 wild wave-4
deaths on this band) so S2's bar (>= 1 living wave-4 veteran) sits
below observed kill activity — but "living veteran" is stricter than
"a kill happened" (the killer must survive), so S2 is a real bar, not
a formality. Table stage: 0 on all 8 seeds (table 0, standing max 199
on 5/8) — the unreachability branch is the expected outcome, and the
bars are written so that outcome is a GO with evidence, not a NO-GO
for failing to find a fire. Gate calls wave>=3: unmeasured (fightgate
recorded wave>=4 only: 73 calls, 0 veteran-guard).

## Design (seeds, policy, horizon, instruments)

- Survey band: **104301–104308** (8 seeds — the fightgate census band,
  re-run under the new recorder; trajectories must match the census
  corpus per S1's cross-check). Stage seed: **104301**.
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 (the seekgate
  substrate). SEEKGATE unset. WILDAVOID unset (the wildavoid re-judge
  is Loop A's landed lever; this arm measures the guard, not the
  wild avoid — a wild-avoid substrate would change wild trajectories
  and break the S1 census cross-check).
- Instruments (new files, distinct names — never modify shared
  analyzers): scripts/vetguard-driver-b.js (lean recorder: gate wrap
  wave>=3, depart wrap for table veterans, daily table-veteran census,
  staged leg MODE=stage, end-of-run probe; MODE/env validation),
  scripts/analyze-vetguard-b.js (chain tables, wall numbers, frozen
  S1/S2/T2 judges, --selftest on synthetic legs),
  scripts/test-vetguard-b.js (proof: §1 live staged guard-fire +
  controls; §2 depart hold for a table veteran; §3 analyzer incl.
  --selftest; §4 driver exports).
- No balanced panel: there is no game-code change and no contrast leg,
  so there is no before/after to compare. The validity gate is T1
  (proof test on a live staged fixture) plus the S1 census cross-check
  — stated here, not waived silently.
- PILOT GATE: the survey IS the pilot (8 seeds, one leg) + a 1-seed
  30d driver smoke (seed 104301, MODE=survey) before the full survey
  to prove the recorder writes gate rows + daily census rows; the
  smoke output is discarded, not judged. The staged leg runs after
  the survey is judged, on the same seed 104301.
