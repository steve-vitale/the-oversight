# sim-day99demand-b — PRE-REGISTRATION (written BEFORE any screen sweep)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-day99demand-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, or the day100raid-code REACHABLE verdict — their verdicts
stand in their own evidence. Its verdict is ONLY whether a fresh screen
supplies a seed with a day-99 raid demand whose day-100 take exercises
the raiddor post-snapshot raid adjustment. Judged ONLY against this prereg.

## Backlog claim

Backlog item (sim-findings.md, food-economy/ledger): the post-snapshot
raid adjustment is implemented but unexercised (0/60 seeds: raiddor 20 +
raidday100 40, 0 day-100 raids, 0 day-99 demands). The day100raid-code
arm proved the leg REACHABLE (a day-99 demand's take fires at the
day-100 endDay, dated 100, post-snapshot, counted as raid100) and
directed the next arm to SPEND SEEDS screening for a day-99 demand.
This arm claims that item. The sim-findings.md line edit is left for
the coordinator, per the arm brief; this prereg is the claim record.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raidday100-b.md + prereg: screen 10100-10139,
  52 takes, 51,484 kcal, ZERO day-100 raids, latest take day 99
  (seed 10109). DIAG-NO-GO. Those seeds are SPENT and are never
  re-screened by this arm.
- evidence/2026-10-27/sim-day100raid-code-b.md + prereg: REACHABLE.
  Screen reconciled as 53 demands, 52 takes, take == demand + 1 on
  every matched pair, single hanging demand seed 10133 day 100, NO
  demand dated 99 anywhere in the screen. Demand days observed
  (derived: take day − 1, plus the hanging day-100 demand):
  15, 20, 21, 28, 35, 40, 41, 44, 45, 46, 48(x3), 49, 50, 52, 54(x4),
  57(x2), 58, 59, 60, 61, 64(x2), 65, 67, 68(x2), 71, 72(x2), 74, 76,
  77, 78, 79, 80, 82, 83(x2), 86(x2), 90, 92, 95(x2), 96, 98, 100.
  Nearest to 99 are 98 and 100 — a day-99 demand is bracketed by
  observed demand days, not excluded by them.
- evidence/2026-10-27/sim-raiddor-ledger-b.md + sim-raidcallers-b.md:
  ledger context (raid door, take path via _removePantryKcal from
  villageAgencyDaily). Not re-judged here.

## Definitions (exact, fixed before judging)

- DEMAND: a treeline staging line in raidSayLines containing
  "Shouts from the treeline", dated by the scholar day at say time.
  (The staging line is the demand; the take line "didn't wait" is
  the take narration, not the demand.)
- TAKE: a raidRecord (raid-unanswered, caller villageAgencyDaily)
  dated by the capture at _removePantryKcal time.
- TAKE == DEMAND + 1 (proven on the raidday100 screen: every matched
  pair). A take dated 100 therefore implies a demand dated 99, and
  a demand dated 99 on a surviving seed predicts a take dated 100.
  Both are checked independently in the proof (demand line AND take
  record must both be present for a HIT — a take without a demand
  line, or a demand line without a take, is flagged, not counted).
- HIT seed: daysAlive == 100 AND lastSnapDay == 100 (last spoilDays
  entry's day, the analyzer's definition) AND a demand dated 99 AND
  a take dated 100.
- PARTIAL seed: a demand dated 99 with NO take dated 100 (e.g. the
  village is lost during day 100 before the day-100 endDay, as
  10139 was lost during day 100 with lastSnapDay 99). Reported,
  never counted toward GO.
- A demand dated 99 on a seed whose lastSnapDay is NOT 100 (death-day
  seed) is a death-day demand, not a HIT and not a PARTIAL for the
  day-100 leg; it is reported in the census if it occurs.

## PRE-REGISTERED GO (verbatim — judge ONLY against this)

GO iff at least one HIT seed is found in the screened band
(20100-20163, cap 64, see "Screen" below), as judged by
scripts/test-day99demand-b.js run on the full screen corpus
(exit 0 with the HIT seed named), with hygiene clean (zero src/js
modified, zero modified tracked file outside this run's own files).

- The day-100 TAKE ITSELF IS REQUIRED FOR GO, not a separate leg:
  a demand-99 seed without a day-100 take is PARTIAL, because the
  deliverable is a seed whose day-100 take exercises the
  post-snapshot adjustment in the analyzer — a demand alone does
  not exercise it.
- If a HIT seed is found: the evidence file records the seed,
  demand/take days, take kcal and items, and the day-100 take's
  position relative to the closing snapshot (take dated ==
  lastSnapDay, i.e. raid100 > 0 for the analyzer). The analyzer
  judged run on that seed is the NEXT arm's work (or the
  coordinator's); this arm supplies the seed and does NOT re-judge
  the raidday100 DIAG-NO-GO or the day100raid-code REACHABLE
  verdict, and does NOT claim the adjustment exercised until that
  judged run closes with it.
- If NO HIT seed is found in the full 64-seed band, the verdict is
  NO-GO (seed not supplied) with the full screen census reported —
  never a pass on silence, never an extended trawl past the cap.
- PARTIAL (demand 99, no take 100) is reported as PARTIAL, not GO
  and not NO-GO: it proves day-99 demands occur but the take leg
  still needs a surviving seed.
- A miss on any clause is NO-GO (or PARTIAL where defined above),
  never re-scored against a friendlier metric mid-run. If the
  metric proves wrong, write it under "metric review" and propose
  the revision for the NEXT run.

## Sizing reasoning (from the existing census — read before sizing)

- Prior demand base rate: 53 demands in 40 seeds = 1.325 demands
  per seed; 0/53 demands dated 99.
- Naive uniform model: if a demand day were uniform over days
  15-100 (86 days), P(demand is day 99) ≈ 1/86 ≈ 1.16% per demand,
  P(a seed carries ≥1 day-99 demand) ≈ 1 − (1 − 1/86)^1.325 ≈ 1.5%.
  Power: 8 seeds ≈ 11%, 40 seeds ≈ 46%, 64 seeds ≈ 63%.
- Late-window caveat (why 64 is a bounded search, not a guarantee):
  only 7/53 prior demands fall on days ≥90 (90, 92, 95(x2), 96, 98,
  100), so the day-99 hazard may be lower than the uniform model
  implies — or the sample is just small. A cap of 64 balances a
  ~63% naive-power search against wall time under sibling load
  (the raidday100 40-seed screen took ~2h wall); an open-ended
  trawl is explicitly NOT authorized.
- Pilot value: the 8-seed pilot gates the INSTRUMENT (sweep runs,
  corpus shape, proof runs), not power — extension to 64 is
  pre-registered here, not decided after seeing pilot results.

## Screen (fresh seeds, chunks, stopping rule, MAX)

- Band: 20100-20163 (64 seeds). Collision check done before this
  prereg commit: no corpus JSON filenames for 20100-20163 in
  evidence/2026-10-27/ corpus dirs; no word-boundary seed mentions
  for 20100-20163 in dated evidence 2026-10-27/*.md files;
  distinct from all spent bands (10100-10139 raidday100,
  9820-9827, 9870-9881, 9768-9779, 9850-9861, and the day100raid
  recorder seed 10133 which is inside the spent raidday100 band).
- Chunks of 8: pilot 20100-20107, then 20108-20115, 20116-20123,
  20124-20131, 20132-20139, 20140-20147, 20148-20155, 20156-20163.
- Stopping rule: a chunk runs to completion once started. After
  each completed chunk, if a HIT seed is present, STOP — no further
  chunks. If no HIT, continue to the next chunk. MAX seed spend is
  64: at 0 hits after 20163, STOP and report NO-GO. No extension
  past 64 for any reason in this run.
- Screen corpus dir: evidence/2026-10-27/sim-day99demand-b-screen-corpus/,
  file prefix day99demand-b-competent-nofeast-s<seed>.json.
  Every screened seed's file is committed, hit or not, so no later
  arm re-spends this band blind. Census JSON:
  evidence/2026-10-27/sim-day99demand-b-screen-census.json.
- A seed that dies early ends honestly (death-aware horizon); its
  file counts toward the 64 but cannot be a HIT (daysAlive < 100).

## RECORDER FIDELITY (stated explicitly — the 1130Z warning)

- Instrument: scripts/sweep-day99demand-b.js + scripts/stockdoors-
  capture-day99demand.js, vendored from the raidday100 sweep/capture
  under new names (filenames, corpus dir, file prefix, mode string,
  staging dir, capture require changed; sweep logic UNCHANGED).
  Sibling files (raidday100, raiddor, ledgerbound captures) are NOT
  modified; no src/js file is modified.
- The sweep instrument's death wrapper SUPPRESSES the original
  Game.registerDeath (records deaths into its own array, never
  calls the original) — exactly as the day100raid-code arm proved
  (scripts/sweep-raidday100-b.js death wrapper; original in
  src/js/corpses.js does deathSeen marking, deed credits,
  telemetry, and corpse creation with Math.random()). Suppressing
  it shifts the RNG stream from the first death onward.
- DELIBERATE CHOICE, stated not hidden: this arm USES the
  suppressing sweep instrument anyway, because the deliverable is a
  sweep-corpus seed for the raidday100 analyzer, and the day100raid
  arm proved a plain-game recorder DIVERGES from sweep-corpus
  trajectories (plain mode on seed 10133 gave demands 15/61/73 vs
  the corpus's 64/68/72/100). A seed found under a plain recorder
  might not reproduce under the sweep instrument the analyzer
  reads — it would be a false supply. A seed found under the sweep
  instrument reproduces under the judged sweep by construction
  (same instrument, same policy, same horizon, same base class).
- Consequently: screened trajectories are SWEEP-INSTRUMENT
  trajectories, NOT plain-game trajectories, and are never cited
  as such. Within-instrument comparisons stay apples-to-apples
  (the suppression is present in every sweep run identically).
- Verification leg (REPORTED, not GO-gating): for a HIT seed, a
  plain trace-recorder run (scripts/trace-day100raid-code-b.js
  without TRACE_FULL) is attempted and reported. If it also shows a
  day-99 demand, the hit is instrument-independent; if it diverges
  (the expected outcome given the proven suppression shift), the
  hit stands as a sweep-instrument seed and the divergence is
  disclosed, not hidden. The plain run NEVER overrides the GO.
- Neutrality is therefore NOT claimed for the plain game; it is
  claimed for the instrument the deliverable serves: same
  instrument as the raidday100 screen, same policy, same horizon.
  Whether to fix the sweep to call through to the original
  registerDeath remains a coordinator/Steve call (it would change
  every future sweep trajectory) and is NOT done here.

## Policies + horizon + base

- Policies: competent-nofeast exactly as raidday100/raiddor
  (COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 off). Any env mismatch is FATAL in the sweep.
- Horizon: 100 days, death-aware (dead villages stop simulating;
  +10d tail max — not applicable, the instrument stops at death).
- Base: NO pin. Current worktree HEAD at prereg time:
  4728c2cdd2ca044ab16134d51362a608bf0b693. If the worktree HEAD
  moves between prereg and screen, report the move; do not
  silently screen on a new base and call it the prereg base.
  (Note: the raidday100 screen base was 6ae5049d8 and the
  day100raid base 6995ba7e6; the only src/js difference between
  those two was a build-version stamp. This arm's base is recorded
  here; any src/js drift from it is checked at evidence time via
  git log, not assumed away.)

## Proof (must behave as designed BEFORE any sweep — already run)

scripts/test-day99demand-b.js proves: corpus validity (policy,
raiddorOn, raid fields present); HIT detection (demand 99 line +
take 100 record + surviving seed); PARTIAL classification; and
hygiene (zero src/js modified, zero modified tracked file outside
this run's own files). Selftest (run before this prereg commit):
PASS-on-synthetic-positive, FAIL-on-synthetic-negative,
FAIL-on-the-raidday100 screen corpus as negative control
(0 hits, 0 partials in 10100-10139 — consistent with day100raid's
"no demand 99"), hygiene clean. At evidence time the proof is
re-run on the full screen corpus: exit 0 iff a HIT seed exists
(the GO signal), exit 1 otherwise (the NO-GO signal — a designed
failure, not an instrument failure).

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on the screened band —
reported honestly even when 0. Village assessment in plain words.
Sense note: if a HIT seed exists, its day-99 demand line and
day-100 take line are quoted and checked against the ledger record
(numbers must match, as raiddor's and raidday100's did); if none
exists, the nearest demand/take pair is quoted and the sense-check
gap (no day-99 demand narration to judge) is recorded, not claimed.

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel — exactly as raidday100 and day100raid-code
stated. The instrument before/after is: sweep corpus (suppression
on) vs the plain-recorder verification leg (suppression off),
reported as above, not forced into a panel.
