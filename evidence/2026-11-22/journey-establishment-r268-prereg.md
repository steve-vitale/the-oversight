# Journey leg ESTABLISHMENT — r268 pre-registration (2026-11-22, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244/r245/r246/r247/r265 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-20261122T1436Z` (scheduled Sun 2026-11-22 07:45 CST).
Rotation file read **1 (establishment)** — this run plays leg 1, no queue
jump. Run number r268 (r267 is Lane B's endgame run, complete; r265 the
last establishment run). **Base:** local master `4dc7cb454` at registration
(journey-landing r154 gate record). Pre-flight: main tree CLEAN, disk 47%.
Lock created 14:36Z (run_id playtest-20261122T1436Z). Registration took
~16 min under load (git worktree add + reset --hard on the 10G tree; the
reset child was actively working throughout — not a stall). Heartbeat
loop running (10-min cadence, detached setsid loop, PID 107864);
registration heartbeat 14:54:47Z is in the registry.

## Leg questions — fresh band + two owed items
r265 landed PLANWAKE on the MATCHED band (101966–101970, r247's seeds)
and proved the win-plan system ignites there. This run asks whether
it generalizes, answers the day-desync diagnostic r265's metric
review triggered, and fills the silent-hunt blank r265 documented.

### Q1 — FRESH-BAND WINPLAN (does PLANWAKE ignite on unseen seeds?)
Bars (binding): planSeeds > 0 on ≥1 seed AND partyDepartures > 0 on
≥1 seed, on the fresh band below. Per-seed numbers reported; no
matched-band comparison (r265's matched band is spent — it is not
reused as a fresh band by any later run).
### Q2 — DAY-DESYNC DIAGNOSTIC (r265 metric review §3 trigger met)
The −1 day drift has now recurred a third time (r245 seed 101955,
r247 two seeds, r265 seed 101970 — loop-days 42, game days 2→42,
8 jitter repeats / 7 skips on 101970). The standing trigger for the
clock-jitter diagnostic is met. Mechanism candidates, from the code
read at run start: `nowDay` reads `state.scholar.day`, which `endDay`
increments exactly once (`scholar.day += 1`, game.js ~34745) per
`Game.sleep()` in the driver loop. A REPEAT (same game day across
two loop dawns) means a sleep did not advance the day — a sleep
that was a no-op, refused, or an endDay path that falls through
without the increment (game.js ~34720: "the day advances once and
dawn runs once below" implies a fall-through path exists). A SKIP
(game day +2 in one loop iteration) means the day advanced twice —
sleep called twice, or an intra-day action that advances the day
plus the sleep. The driver gains a read-only `dayPhaseLog` (see
Driver change): game day read at loop start, after the 3 action
parts, after `policy.daily`, and after `Game.sleep()` — so every
repeat/skip is attributed to a phase. Bar (binding): EVERY desync
event on the panel is attributed to a phase AND at least one
mechanism is named with a code pointer; if a desync event cannot
be attributed, the diagnostic is NO-GO and the unattributed event
is carried as the next diagnostic's starting point.
### Q3 — LAUNCHVOICE (the hunt stops being silent)
r265 metric review §5: 57 departures, 0 launch beats — the beat
only speaks on wave-4+ launches or re-seed stamps, and
establishment plans launch below wave 4 or targetless. FIX 1
below gives every real departure its one spoken line. Bar
(binding): launch beats ("sets out … the fire marks the trail")
> 0 on ≥1 seed AND beats ≤ departures on every seed (the dedup
stamp holds — no double-speak per launch). A beat on a launch
that never happened would be a defect, not a pass: the hook
placement is unchanged (called AFTER the expedition actually
started, never on a hold or a failed launch).

### FIX 1 — LAUNCHVOICE (every real departure speaks once)
In `winPlanDepartLaunchBeat` (win-plan.js ~1067): the ordinary-beat
gate `if ((plan.needWave | 0) < 4) return false;` is removed. The
beat line itself (`departLaunchBeat`, win-plan.js ~624) is already
wave-agnostic — "X sets out with Y after [the beast] — the fire
marks the trail." — and already handles a null target (no "after …"
clause) and a null-needWave plan. Everything else is unchanged:
the re-seed beat still speaks first and still suppresses the
ordinary beat for that launch; the dedup stamp
(departBeatDay/departBeatTarget, set BEFORE speaking) still limits
each launch to one line; DEPARTBEAT=0 still silences the beat
entirely. Confound adjudication: the hook is called after the
launch in both departure paths already — speaking does not change
planSeeds, partyDepartures, party fights, or any plan stat, so the
Q1 bars are unconfounded; only the beat counts move. Volume: a
panel village launches roughly once every 4 days, so the say log
gains ~1 line per 4 days per village — a spoken hunt, not spam.
Sanction: r265 metric review §5 owed this as the follow-up
("a below-wave-4 launch beat … is owed"); the playtest loop's
standing blank-fill remit covers it. No canon doc governs launch
audibility — said here instead of inventing canon.
- **Proof test** (scripts/test-launchvoice-r268.js): staged plan
  with needWave 2 launches → the "sets out" line is spoken once;
  staged plan with null needWave and a target launches → spoken
  once, with the "after …" clause; second hook call same day and
  target → silent (dedup stamp); DEPARTBEAT=0 → silent; a wave-4+
  plan still speaks exactly as before. Before/after: the test
  FAILS on unpatched code (the below-wave-4 cases stay silent)
  and passes after the fix.
- **Bar (binding):** Q3 above.

### Driver change (r268, instrument-only — no game behavior)
1. `dayPhaseLog`: per loop day, `{loopDay, startDay, afterPartsDay,
   afterDailyDay, afterSleepDay}` — four read-only `nowDay(Game)`
   reads bracketing the 3 action parts, `policy.daily`, and
   `Game.sleep()`. The existing `dayDesync` computation is unchanged
   (it still reads `daily[]`); the analyzer joins each desync event
   to the phase whose before/after straddles the jump.
2. `winplanLines` scan gains the depart-beat pattern: lines
   matching /sets out .* — the fire marks the trail/ are captured
   alongside the existing "new trail" / "already put down" /
   "called off" patterns. The analyzer counts them separately as
   depart beats.
No other driver change: the wedge, policy, instruments, and bars
are r265 verbatim except run number / output names / seed band.

## Other bars (carried, verbatim thresholds from the r265 prereg, panel now 4 seeds)
- **Q1 rate guard:** favorless sits / all sits, report-only bar <20%.
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with 0 raises.
- **Q2 SITTING CLOSES:** GO = 0 cut sittings; WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel seed
  contributes >0. Cumulative second number reported alongside.
- **LADDER (report-only under a SPOTTER GO):** ≥1 villager reaches 5 XP
  on ≥3/4 seeds.
- **FASTER-ID:** threshold benefit fires on ≥2/4 seeds.
- **END:** every qualifying broken-live forage opportunity closed within
  2 dawns.
- **Q5:** 0 exiles expected; any exile-narration line named.
- **Q6:** F4 shape = bumpCalls ≤2 AND wedgeSits ≥50.
- **COUNTER:** defect = a COUNTER LEARNED label containing ", ".
- **BOWCRAFT:** bows equipped per seed; panel total reported.
- **WARN-HEED:** GO = every engaged warn_you sitting names a danger.
  WATCH: delivered rate (r265: 4/20, falling) and the warn_you
  DEFLECT — carried 10 times untested (r154 carry): does a deflect
  option ever fire, and does the warning still land after one?
- **SETTLED-FAVOR / DRY2 / SELFWIT / SILENT-ARRIVAL:** watches,
  report-only. The r152 FIX 2 settled re-ask is carried untested:
  does a settled favor ever get re-asked on this panel, and does
  the re-ask read as a new ask rather than a repeat?
- **VILLAGE:** alive at d40 on ≥3/4 seeds.
- **F2 SCHOLAR DEATHS:** ≤2 per panel = WATCH (causes + last-dawn
  locations); ≥3 = investigate. Haven-edge shape watched (r265:
  Hilda d25).
- **DAY-DESYNC:** Q2 above — every event attributed.
- **WAVE-4 / STANDING:** wave reached + standing per seed.
- **PEOPLE CHECK:** PASS/FAIL on held convos from one panel seed,
  read in full. The r241 dry beat + stage-direction-as-dialogue
  lines are watched.
- **CODEX:** plants per seed.

## Seeds, policy, horizon
**FRESH band 101971–101974** (pilot 101971, then 101972–101974),
same competent policy, 42d horizon, death-aware tail +10d. Driver
clone is verbatim r265 except run number / output names / header
comment / seed band + the two instrument changes above (dayPhaseLog,
depart-beat pattern). The analyzer is the r265 analyzer verbatim
except run number / file names + the Q2 desync-phase join + the
depart-beat count + 4-seed fractions. Pilot: **101971** runs first
on the final driver + fix.
Confounds, adjudicated in the run note: LAUNCHVOICE speaks only
(beat counts only); base drift since r265's panel base (r154
landing gate record 4dc7cb454 + cellcheck-a evidence — no src/js
behavior change on the establishment leg's paths beyond
LAUNCHVOICE; verified by the diff at run start).

## Seed-band freshness (skill: local_seed_band_freshness)
Fresh band **101971–101974**. Search scope: every `*-prereg.md`
under `evidence/` (all dates) + `journey-*.md` / `sim-*.md` run
notes under `evidence/` — zero hits for 101971, 101972, 101973,
or 101974. The first pick considered, 108001–108004, was REJECTED:
108001–108005 is named in evidence/2026-11-20/
journey-establishment-r245-prereg.md:294 (and r246/r247 preregs)
as the r244 re-panel band — used, not fresh. No forbidden-band
list file exists in evidence/ (grep for "forbidden band" names
only preregs that reference the concept); the prereg + run-note
search above is the freshness check. The band is spent by this
run and is NOT reused as a fresh band by any later run.

## Instrument proof (before the panel)
- Analyzer fork proven on the r265 corpus BEFORE the panel (r265
  JSONs + convo txts in the goal hidden_files evidence dir for
  2026-11-21, copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r268-analyzer-proof/`,
  renamed to r268 names; logs `r265-baseline.log` +
  `r268-fork.log` in the same dir): the re-run r265 baseline
  reproduces the committed r265 analyzer log exactly, and the
  r268 fork reproduces every old-bar number exactly. NEW lines on
  the old corpus (expected, not a fork break): depart-beat count
  (0 on the old corpus — the beat was gated off below wave 4
  there) + dayPhaseLog phase attribution for the r265 desync
  event (seed 101970, −1: attributed to the sleep phase or
  named unattributed).
- Proof test run BEFORE the panel in this worktree:
  test-launchvoice-r268, GREEN after the fix (and failing on
  unpatched code for the below-wave-4 cases — the before/after).
  The pilot seed exercises the instruments directly: winPlanEnd
  present (store woken), dayPhaseLog present with 42 entries,
  winplanLines present, and on 101971 the engagement gate is
  visible (plans seeded only with lived/heard knowledge, or an
  explicit no-seed with the gate holding). If the pilot forces a
  driver or fix change, the panel restarts on the same fresh
  seeds and the pilot seed is NOT scored — EXCEPT that a
  driver-only instrument change keeps the band (recorded in the
  run note); any src/js change forces a panel restart on the
  same seeds (the band is fresh, not matched — a restart replays
  the same seeds, it does not consume a new band).

## Canon
docs/CANON.md read at run start. Win-plan canon: the system's own
ontology header (src/js/win-plan.js rules block — plans start from
lived or heard knowledge only, never a roster scan; stages gear →
party → hunt → standing → table). No canon doc covers the
favorless-ask mechanism, want-raise rates, seed selection, the
previous-bearer rule, launch-beat audibility, or the day clock —
said here instead of inventing canon. ENCOUNTER-GEAR RULE (Steve
2026-11-13): the journey driver plays the live village state
(real gear/progression, competent policy), not a staged
solo-scholar fixture — same as r137–r265; proof tests stage for
the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design, wave-4 kill A/B,
family 7 UNMEASURED. This run does NOT take any of those builds.
The haven-edge scholar-death shape stays a goals-arm question.
The F5 thin<7%/fat>15% want-raise floor stays with the build arm.
The trio gap (r265 metric review §6 — all departures pairs, the
wave-4 gate wants trios) stays open; this run measures whether
launches now speak, not whether pairs can kill wave 4.

### PILOT-FORCED INSTRUMENT CHANGE — sleepLines (2026-11-22 ~16:00Z)
The first pilot (seed 101971, before this change) passed its gate
AND already attributed all 3 of its desync events to phases:
two sleep+0 repeats (loops 40, 42 — the sleep did not advance the
day) and one skip (loop 41 — parts +1 AND sleep +1). The phase
attribution names WHERE the jump happened but not WHY sleep
sometimes advances 0: `Game.sleep()` refuses honestly at the
wrong clock position ("barely dawn" / "too late for real sleep" /
fight / breach-lock guards, game.js ~22059) and the driver never
retries a refused sleep. To join each event to what sleep()
actually said that day, the driver gains a read-only `sleepLines`
scan (the refusal phrases + "Sleep takes you", from the already-
captured dayLines) and the analyzer joins each desync event to
the sleep lines on its game days. Driver-only instrument change:
no game behavior, no policy change, no src/js change — so per the
pilot rule the band is kept, and the panel replays all 4 seeds
(including 101971) on the final driver; the first pilot run is
discarded as scored evidence (kept as
journey-establishment-r268-pilot-101971.log) and the panel replay
is the scored run. The analyzer fork proof was re-run after this
change: the fork still reproduces every old-bar number exactly
(new lines only: "sleep lines ABSENT" on the pre-instrument
corpus).

## Pilot gate
Pilot seed runs first on the final driver + fix; completes
without crash AND (≥1 people-check sitting is held OR game over
before the check with the skip note written) AND its transcript is
written AND the spotter instruments fire AND the sittingCloses
record is present AND wedgeSits carry pick wantIds on VERBAL sits
AND ≥1 wedge social sit carries the Q1 trace fields AND the
rosterDepartures instrument is present AND the r240 instruments
are present (standingEnd, scholarDawns, teleTypeCounts) AND the Q5
instruments are present (mootLines + caseLog) AND the r246
instruments are present (warnLog, settledFavorLines, dryLines,
dayDesync, loopDay) AND the r247 instruments are present
(rosterArrivals, spotterTenure, arrivalLines, winplanLines,
winPlanEnd) AND winPlanEnd.stats is non-null (store woken) AND
dayPhaseLog has one entry per loop day with all four phase reads
AND winplanLines captures at least one "sets out" depart beat OR
the panel records an explicit zero-departure note for the pilot
seed. If the pilot forces a driver or fix change, the panel
restarts on the same fresh seeds and the pilot seed is NOT scored
(see Instrument proof above).

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244/r245/
r246/r247/r265 did NOT roll forward. This run's panel is the r265
driver regime on a fresh band + one voice fix — guardrails should
stay quiet; any LOUD line is adjudicated as band noise vs real bug
vs fix effect BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r247 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js (one voice fix); a guardrail
move is adjudicated fix-effect vs band noise, and the baseline is
NOT rolled on a mismatch.
