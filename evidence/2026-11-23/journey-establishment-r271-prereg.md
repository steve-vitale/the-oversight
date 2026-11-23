# Journey leg ESTABLISHMENT — r271 pre-registration (2026-11-23, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244/r245/r246/r247/r265/r268 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261123T0145Z` (scheduled Mon 2026-11-23 01:45 CST).
Rotation file read **1 (establishment)** — this run plays leg 1, no queue
jump. Run number r271 (r270 is Lane B's endgame run, merged; r269 deepening;
r268 the last establishment run). **Base:** local master `c2c6ed9eb` at
registration (journey-endgame r270). Pre-flight: main tree CLEAN, disk 49%.
`git pull` — already up to date at registration; Lane B r270 merged between
the pull and registration, so the worktree base IS current master
(verified: main tree HEAD `c2c6ed9eb`, clean). Lock created 07:43:36Z
(run_id above) before any work. Heartbeat loop running (10-min cadence,
detached setsid, PID 15104). No push (ship loop owns pushes).

## Rotation race (standing note, recorded not a defect of this run)
The file reads `1`, but the last completed Lane A leg was deepening r269,
whose closeout wrote `2→3`. The landing r155 finisher (run started
2026-11-22 20:45Z, read `0`) closed out 05:26–07:29Z Nov 23 writing
`0→1` — a stale write overwriting r269's `3`, the same shape r269's
prereg documented for r268's `1→2` overwrite. This run plays the file's
leg (establishment, per the body) and writes `1→2` at closeout with
read-back. A later run that read an older value must not overwrite it.

## Leg questions — re-panel the two owed closes + the sleep retry
r268 landed the STRANDED-CLOSE menu fix AFTER its panel (2 runs stranded,
0/2 closed — NO-GO on pre-fix code) and r269 deepening landed MOOT-CLOSE
(Mechanism B) after that. This run re-panels both on live code, and adopts
the driver sleep-retry r268's diagnostic owed.

### Q1 — STRANDED-CLOSE RE-PANEL (binding)
Does every stranded run close within 2 dawns of first stranding on the
fixed code (r268 menu fix + r269 MOOT-CLOSE, both live)? A close is the
successor's honest end (endLog 'ended'/'end-via-deliver' for the stranded
vid on/after first stranded day) OR a moot-close telemetry row (vid+kind
match, moot day >= first stranded day). Bar (binding): GO iff every
stranded run on the panel closes within 2 dawns by either path; any run
still open at end is a NO-GO with the reason named. NO-OPPORTUNITY if
0 stranded runs — mechanism then carried by the r268/r269 proof tests.
### Q2 — MOOT-CLOSE LIVE (binding when an eviction fires)
Do evicted live runs close their books in the wild (mootCloseTele rows:
favor_forage_return / favor_water_return with mooted:true)? Bar: every
moot-closed run must not reappear as stranded after its moot day
(reappearance = defect, the close did not hold). If 0 evictions fire,
the bar is NO-OPPORTUNITY (report-only) and the mechanism is carried
by the r269 proof test (36/36).

### Driver change (r271 — sleep-retry + one instrument)
1. SLEEP-RETRY (r268 follow-up #1, driver policy only — no game
   behavior): after Game.sleep(), if the day did not advance, the driver
   waits once and calls Game.sleep() a second time, then records the
   retry outcome in the dayPhaseLog entry (sleepRetry {tried,
   advanced}). The r268 diagnostic proved the −1 drift is a driver
   artifact — sleep refused honestly at the wrong clock position and
   the driver never retried. One retry only; a second refusal is left
   for the next loop day exactly as before. Expectation: fewer
   repeat+skip pairs than r268's 29 events; the desync analyzer
   section stays as a watch (every event still attributed).
2. mootCloseTele: per-seed rows of favor return telemetry with
   mooted:true (favorId/partner/day kept for the stranded join).
No other driver change: the wedge, policy, instruments, and bars
are r268 verbatim except run number / output names / seed band +
the two changes above.

## Other bars (carried, verbatim thresholds from the r268 prereg, panel now 4 seeds)
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
  WATCH: delivered rate (r268: 8/9 delivered, recovered) and the warn_you
  DEFLECT — carried 11 times untested (r268 carry): does a deflect
  option ever fire, and does the warning still land after one?
- **SETTLED-FAVOR / DRY2 / SELFWIT / SILENT-ARRIVAL:** watches,
  report-only. The r152 FIX 2 settled re-ask is carried untested:
  does a settled favor ever get re-asked on this panel, and does
  the re-ask read as a new ask rather than a repeat?
- **VILLAGE:** alive at d40 on ≥3/4 seeds.
- **F2 SCHOLAR DEATHS:** ≤2 per panel = WATCH (causes + last-dawn
  locations); ≥3 = investigate. Haven-edge shape watched (r265:
  Hilda d25).
- **DAY-DESYNC:** watch — every event attributed; sleep-retry totals
  reported beside it (r268: 29 events, net −1).
- **WAVE-4 / STANDING:** wave reached + standing per seed.
- **PEOPLE CHECK:** PASS/FAIL on held convos from one panel seed,
  read in full. The r241 dry beat + stage-direction-as-dialogue
  lines are watched.
- **CODEX:** plants per seed.
- **WINPLAN (carried, not the question):** planSeeds > 0 AND
  partyDepartures > 0 on ≥1 seed; LAUNCHVOICE depart beats > 0 on
  ≥1 seed AND beats ≤ departures per seed (r268: 16/48/45).

## Seeds, policy, horizon
**FRESH band 101975–101978** (pilot 101975, then 101976–101978),
same competent policy, 42d horizon, death-aware tail +10d. Driver
clone is verbatim r268 except run number / output names / header
comment / seed band + the two changes above (sleep-retry,
mootCloseTele). The analyzer is the r268 analyzer verbatim
except run number / file names + the Q1/Q2 re-panel bars +
moot-close join + sleep-retry totals + 4-seed fractions. Pilot:
**101975** runs first on the final driver.
Confounds, adjudicated at run start (base drift 4dc7cb454 →
c2c6ed9eb, src/js +249/−21, 8 files): r268's own fixes
(LAUNCHVOICE, STRANDED-CLOSE menu) and r269's MOOT-CLOSE are the
re-panel targets (intended). r267's topic2Ask fill-aware retry
and r269's DRY-COUNT WASHOUT touch the conversation layer — a
DRY2 move is adjudicated as fix/counting effect, not a game
regression. sim-needwave-b's guarded needWave copy (win-plan.js)
could shift plan/departure counts slightly — watched, not a
bar-breaker. LEADERPROJ/LEADERHPGATE are env-gated OFF by
default (off-mode byte-identical). sim-wornstack-a has no
player-visible behavior change (commit message). Version bump
is a stamp only. If the pilot forces a driver or fix change,
the panel restarts on the same fresh seeds and the pilot seed
is NOT scored — EXCEPT that a driver-only instrument change
keeps the band (recorded in the run note); any src/js change
forces a panel restart on the same seeds (the band is fresh,
not matched — a restart replays the same seeds, it does not
consume a new band).

## Seed-band freshness (skill: local_seed_band_freshness)
Fresh band **101975–101978**. Search scope: every `*-prereg.md`
under `evidence/` in the repo AND under the goal hidden_files
evidence tree (all dates), plus `journey-*.md` / `sim-*.md` run
notes under `evidence/2026-11-2*/` — zero hits for 101975, 101976,
101977, or 101978. No forbidden-band list file exists in evidence/
(grep for "forbidden band" names only preregs that reference the
concept); the prereg + run-note search above is the freshness
check. The band is spent by this run and is NOT reused as a fresh
band by any later run.

## Instrument proof (before the panel)
- Analyzer fork proven on the r268 corpus BEFORE the panel (r268
  JSONs + convo txts in the goal hidden_files evidence dir for
  2026-11-22, copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r271-analyzer-proof/`,
  renamed to r271 names; logs `r268-baseline.log` +
  `r271-fork.log` in the same dir): the re-run r268 baseline
  reproduces the committed r268 analyzer log byte-for-byte
  (diff exit 0), and the r271 fork reproduces every old-bar
  number exactly. NEW lines on the old corpus (expected, not a
  fork break): MOOT-CLOSE line (0 on the old corpus — the fix
  was not live there) + SLEEP-RETRY totals (0 retries — no
  sleepRetry field on pre-r271 JSONs) + the relabeled
  STRANDED-CLOSE BAR line (0/2, same count as r268).
- Pilot seed exercises the instruments directly: winPlanEnd
  present (store woken), dayPhaseLog present with 42 entries
  carrying sleepRetry fields, mootCloseTele present (array, may
  be empty), winplanLines present, and on 101975 the engagement
  gate is visible (plans seeded only with lived/heard knowledge,
  or an explicit no-seed with the gate holding). If the pilot
  forces a driver or fix change, the panel restarts on the same
  fresh seeds and the pilot seed is NOT scored — EXCEPT that a
  driver-only instrument change keeps the band (recorded in the
  run note); any src/js change forces a panel restart on the
  same seeds.

## Canon
docs/CANON.md read at run start. Win-plan canon: the system's own
ontology header (src/js/win-plan.js rules block — plans start from
lived or heard knowledge only, never a roster scan; stages gear →
party → hunt → standing → table). No canon doc covers the
favorless-ask mechanism, want-raise rates, seed selection, the
previous-bearer rule, launch-beat audibility, moot-close bookkeeping,
or the day clock — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137–r268; proof tests
stage for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design, wave-4 kill A/B,
family 7 UNMEASURED. This run does NOT take any of those builds.
The haven-edge scholar-death shape stays a goals-arm question.
The F5 thin<7%/fat>15% want-raise floor stays with the build arm.
The trio gap (r268 metric review — all departures pairs, the
wave-4 gate wants trios) stays open; this run measures whether
stranded runs now close, not whether pairs can kill wave 4.
SILENT-ARRIVAL (r268: 7/7 silent) stays a documented blank — the
arrival line is still owed, not built in this run.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND (≥1 people-check sitting is held OR game over before the check
with the skip note written) AND its transcript is written AND the
spotter instruments fire AND the sittingCloses record is present AND
wedgeSits carry pick wantIds on VERBAL sits AND ≥1 wedge social sit
carries the Q1 trace fields AND the rosterDepartures instrument is
present AND the r240 instruments are present (standingEnd,
scholarDawns, teleTypeCounts) AND the Q5 instruments are present
(mootLines + caseLog) AND the r246 instruments are present (warnLog,
settledFavorLines, dryLines, dayDesync, loopDay) AND the r247
instruments are present (rosterArrivals, spotterTenure, arrivalLines,
winplanLines, winPlanEnd) AND winPlanEnd.stats is non-null (store
woken) AND dayPhaseLog has one entry per loop day with all four
phase reads AND every dayPhaseLog entry carries a sleepRetry field
AND mootCloseTele is present as an array AND winplanLines captures
at least one "sets out" depart beat OR the panel records an
explicit zero-departure note for the pilot seed. If the pilot forces
a driver or fix change, the panel restarts on the same fresh seeds
and the pilot seed is NOT scored (see Instrument proof above).

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244/r245/
r246/r247/r265/r268 did NOT roll forward. This run's panel is the
r268 driver regime on a fresh band + a driver sleep-retry + one
voice-adjacent bookkeeping fix already live (MOOT-CLOSE) — guardrails
should stay quiet; any LOUD line is adjudicated as band noise vs
real bug vs fix effect BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r247 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes no src/js (driver-only changes);
a guardrail move is adjudicated band noise vs base drift, and the
baseline is NOT rolled on a mismatch.
