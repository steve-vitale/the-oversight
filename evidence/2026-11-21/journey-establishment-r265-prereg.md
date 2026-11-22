# Journey leg ESTABLISHMENT — r265 pre-registration (2026-11-22, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244/r245/r246/r247 precedent). Death-aware: stop after 10
consecutive all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261122T0045Z` (scheduled Sat 2026-11-21 18:45 CST).
Rotation file read **1 (establishment)** — this run plays leg 1, no queue
jump. Run number r265 (r264 is Lane B's endgame run, in flight at run
start; r263 succession, r247 the last establishment run). **Base:** local
master `a8c2c201c` at registration (Lane B endgame r264's gate commit).
Pre-flight: main tree CLEAN, disk 47%. Lock created 00:45Z (run_id
playtest-loop-a-20261122T0045Z). Registration succeeded on the first
attempt (full checkout, ~13 min under load) — no write-flap window at
registration. Heartbeat loop running (9-min cadence, detached setsid
loop, PID 28757); registry flock held by Lane B's concurrent
journey2-social registration since 00:57Z, so the first two one-shot
heartbeats failed loud after 120s — the loop retries and lands when
Lane B releases. Registration heartbeat 00:59:13Z is in the registry.

## Base delta vs r247's panel base `2b97163b0` (src/js)
`git diff --stat 2b97163b0..a8c2c201c -- src/js/` — 7 files, +323/−28.
63 commits. The only win-plan behavior change is DEPARTBEAT
(sim-departbeat-b, `e5c8b4633`): the ordinary wave-4+ departure beat
is DEFAULT-ON (holder+party+target, once per launch; DEPARTBEAT=0
silences). It speaks on launches that already happen — it seeds no
plans, so the ignition counters (planSeeds / partyDepartures) are NOT
confounded; launch-BEAT counts are caveated (beats now speak by
default where r247's panel heard none). Everything else:
- `game.js` +42 — landing r152 namebeast (codex lastToldBeast
  recency) + KILLBUNDLE env-gated OFF by default.
- `villager-brain.js` +44, `betrayal.js` +44, `conversation.js` +39,
  `convo-wants.js` +19 — lever/evidence landings (d3refreeze,
  dmgpin-report, tier4access reverted, killlootbundle env-gated OFF,
  shelterdraft reverted, succession r263, crisis r262).
- `build.js` — version stamp only.
- The win-plan store-init gate (`planfixOn`, win-plan.js:295-301) is
  UNCHANGED — still env-gated, still the reason r247 read zero.

## Leg question — the r247 headline, answered with a fix
r247 proved the win-plan system never ignites on this leg (0/5 seeds,
planSeeds 0, partyDepartures 0 — seventh silent panel) because the
plan store is created only by a wave-3+ agency evade/flee/kill or by
the env-gated PLANFIX flag, and neither fires in live play. r247
also proved a second defect: a joint forage run whose bearer dies
strands forever (seed 101970: Jamie died d25, the run sat 18 dawns,
0 work, 0 closes — a permanent orphan). This run LANDS the two
fixes and measures them on the SAME seeds r247 measured zero on
(matched before/after — the before-panel is r247's JSONs, not a
fresh band).

### FIX 1 — PLANWAKE (win-plan store wakes on the first Haven day)
In `winPlanHavenTick` (win-plan.js ~1101): the store-init guard
`if (!v.winPlan) { if (!planfixOn()) return null; v = stateOf(this); }`
becomes unconditional — `if (!v.winPlan) { v = stateOf(this); if (!v)
return null; }`. The planfixOn() helper stays for the sim arms that
reference it. NOTHING else changes: the engagement gate is untouched
— a plan still seeds only for a wanderer/explorer-profile villager at
Haven who has personally fought a beast or whose village has slain
one (fire knowledge). An empty store is inert: plans exist only when
seeded, and every plan path reads the store without creating it.
Sanction: the Nov 17 ship note's stated next arm — "waking the store
on the first Haven day or seeding it from what the village has heard"
— and Steve's Nov 12 executive-decision grant. r247 deferred this as
a "goals-arm design call"; this run takes the call, implementing the
sanctioned arm exactly: wake on the first Haven day, seed only from
lived/heard knowledge. The ignition condition itself (engagement
gate) is NOT changed.
- **Proof test** (scripts/test-winplan-wake-r265.js): staged village
  with a first kill recorded (villageSlain), a wanderer at Haven,
  Haven tick → plan seeded (stage 'gear', planSeeds 1). Control:
  store exists after the first Haven tick with no kill and no fought
  knowledge, but NO plan is seeded (engagement gate holds).
- **Bar (binding):** WINPLAN GO = planSeeds > 0 on ≥1 seed AND
  partyDepartures > 0 on ≥1 seed (the finding r247 waited for:
  parties actually leave Haven to hunt). Launches named with
  seed/day/party shape + stage; a launch that kills a wave-4 beast
  is a base-effect, not a panel finding alone.
- **Instrument note:** `winPlanEnd.ignited` is `!!plans` — after
  this fix the store exists by design on the first Haven tick, so
  `ignited` reads true even with zero plans. The r265 analyzer
  judges on `stats.planSeeds`, `stats.partyDepartures`, and
  `plans.length` — NEVER on `ignited`.

### FIX 2 — BEARER-END (a dead bearer's joint run can be closed)
r81 fixed the partner-death hang (ending allowed when the partner is
gone); the mirror case — bearer-death — was never fixed. In
`forageFavorAction` (favor-forage.js) and `waterFavorAction`
(favor-water.js): when `ending` is true and the run's bearer is dead
or roster-gone, the successor may end the run at Haven. The honest
end, mirroring r81: the successor unloads ONLY what they carry (the
dead bearer's haul is lost with them — matched from the successor's
pack, so it deposits 0 by construction); the partner's virtual share
stays with the partner (forage: skip the partner deposit when the
bearer is gone; water: drop `r.partnerWater` from the unload when
the bearer is gone — no conjured food or water); the promise is
renounced, the favor goes 'broken', the run closes
(`returned=true`). The live-bearer block is unchanged: a living
previous bearer still owns their outing. Checked, NOT fixed:
company (favor-company.js:58 — `presence()` already pauses the
session with the previous-bearer reason; no ledger orphan) and
outing (favor-outing.js:93 — pre-departure promises only, no run
exists to orphan; the un-started promise is a separate soft-freeze
question, not this run).
- **Proof test** (scripts/test-bearer-end-r265.js): staged joint
  forage run (bearer A + partner P, haul pressed), A dies, successor
  B attempts the end at home → ready `forage_end`, run closes,
  favor 'broken', pantry gains 0 from the dead bearer's haul.
  Water case staged the same way (partner water not deposited).
  Control: living previous bearer still blocks both work and end.
- **Bar (binding):** STRANDED GO = every orphaned (previous-bearer)
  run is closed within 2 dawns of the bearer going dead/gone.
  The driver attempts the honest end on a stranded run whose bearer
  is dead (see Driver change below); the close is recorded in
  endLog with outcome 'ended'/'end-via-deliver' and the strandedLog
  entry closes with it.
- **Driver change (r265, policy — recorded, not hidden):** the r247
  wedge logs stranded runs and skips them. The r265 wedge, after
  logging, routes a stranded run whose bearer is dead to
  `endWedge84` directly (synthetic live record) — a competent player
  who learns the run can now be closed closes it. Living-bearer
  stranded runs are still skipped and logged exactly as r247.

### FIX 3 — DEPARTCOUNT (the brain launch path counts its departures) — PILOT-FORCED, 2026-11-22 ~02:00Z
The first pilot (seed 101966, before this fix) passed its gate EXCEPT
for one finding: `winPlanEnd` showed two plans in 'hunt' stage with
`partyDepartures: 0` and `partyFights: 86` — plans were launching and
fighting, and the counter the WINPLAN bar judges on read zero. Root
cause: there are TWO launch paths. `winPlanDepart` (win-plan.js)
bumps `partyDepartures`; `vbrainExecuteDepart` (villager-brain.js)
is the departure path that actually fires in sims (agency calls it
before `winPlanDepart`) — and it sets stage 'hunt' but never bumped
the counter. Same gap the trio/quad counters already had (their
comments say so in so many words: "the brain path is the launch
path that fires in sims, but it never bumped partyTrios — only
winPlanDepart did — so the stat read 0 while 22 trios launched").
Fix (villager-brain.js, one line, mirroring the trio/quad pattern
and winPlanDepart's placement — stage block, bump, beat hook,
return): bump `partyDepartures` via `winPlanStats()` after the
stage-setting block, before the DEPARTBEAT hook, in the
`party_launch` branch only. No game-behavior change: the launch
already happened; only the counting was missing. Without this fix
the WINPLAN bar's second leg (`partyDepartures > 0`) could never
fire, so the bar was unmeasurable as written — a pilot-forced
instrument fix, sanctioned by the pilot gate ("if the pilot forces
a driver/fix change, restart the panel on the same matched seeds;
pilot seed not scored"). The panel below is therefore a FRESH
5-seed run on the same matched seeds, not a continuation of the
first pilot.
- **Proof test** (scripts/test-winplan-departures-r265.js): 14/14
  GREEN — §A source pin (bump inside the party_launch branch);
  §B live brain-path launch: departures 0 -> 1, stage 'hunt',
  pair does not bump partyTrios; §C repeat call while already out
  does not double-count; §D blocked inviter holds with 0; §E
  winPlanDepart bumps the same ledger. Before/after: the test
  FAILED 3/13 on unpatched code (§A, §B departures, §C) and
  passes 14/14 after the fix.
- **Bar (binding, UNCHANGED):** WINPLAN GO = planSeeds > 0 on ≥1
  seed AND partyDepartures > 0 on ≥1 seed. The fix makes the
  second leg measurable; it does not lower it.

## Other bars (carried, verbatim thresholds from the r247 prereg)
- **Q1 rate guard (REVISED — r247 metric review §9, adopted):** the
  full per-sit Q1 trace is retired; the rate stays as a standing
  guard (favorless sits / all sits, report-only bar <20%). The
  per-sit classification lines are removed from the r265 analyzer
  by design — the fork proof reproduces the RATE, not the removed
  lines.
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises.
- **Q2 SITTING CLOSES:** GO = 0 cut sittings; WATCH 1–2 (read in
  full); NO-GO ≥3 or any cut ending on an open question/invitation.
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0 (r247: 33, 5/5 — GO). Cumulative second number
  reported alongside (r247: 50).
- **LADDER (report-only under a SPOTTER GO):** ≥1 villager reaches
  5 XP on ≥4/5 seeds (r247: 3/5).
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds (r247: 4/5).
- **END:** every qualifying broken-live forage opportunity closed
  within 2 dawns (r247: 9/9 GO).
- **Q5:** 0 exiles expected; any exile-narration line named.
- **Q6:** F4 shape = bumpCalls ≤2 AND wedgeSits ≥50 (r247: none).
- **COUNTER:** defect = a COUNTER LEARNED label containing ", "
  (r247: 89 lines, 0 comma, 0 em-dash).
- **BOWCRAFT:** bows equipped per seed; panel total vs r247 corpus
  (16).
- **WARN-HEED:** GO = every engaged warn_you sitting names a danger
  (r247: GO, six distinct voices — second-voice rider CLOSED).
- **SETTLED-FAVOR / DRY2 / SELFWIT / SILENT-ARRIVAL:** watches,
  report-only (r247: 0/0, 0, 0 observable, 0 arrivals).
- **VILLAGE:** alive at d40 on ≥3/5 seeds (r247: 5/5).
- **F2 SCHOLAR DEATHS:** ≤2 per panel = WATCH (causes + last-dawn
  locations); ≥3 = investigate (r247: 3, haven-edge 2/3).
- **DAY-DESYNC:** net drift named per seed (r247: −2, two seeds one
  day short).
- **WAVE-4 / STANDING:** wave reached + standing per seed (r247:
  3/5 wave 4, standing 150/100/100/20/65).
- **PEOPLE CHECK:** PASS/FAIL on held convos from one panel seed,
  read in full. The r241 dry beat + stage-direction-as-dialogue
  lines are watched (r247: 3 dry servings, 2 stage-direction).
- **CODEX:** plants per seed (r247: 132).

## Seeds, policy, horizon
**Matched before/after — NOT a fresh band.** BEFORE: r247 panel
JSONs (base 2b97163b0, no fixes), seeds 101966–101970. AFTER: this
run, base a8c2c201c + FIX 1 + FIX 2, same seeds 101966–101970,
same competent policy, 42d horizon, death-aware tail +10d. Driver
clone is verbatim r247 except run number / output names / header
comment + the dead-bearer end branch in wedgeDawn (see above) +
the Q1-trace removal (analyzer only). The analyzer is the r247
analyzer verbatim except run number / file names + the WINPLAN
judgement on planSeeds/partyDepartures (not ignited) + the
STRANDED-close lines + Q1 rate-only (per-sit lines removed).
Pilot: **101966** runs first on the final driver + fixes.
Confounds, adjudicated in the run note: DEPARTBEAT default-ON
(beat counts only); 63-commit base drift (no other delta seeds
plans or touches the favor ending paths — verified by the diff
above); identical seeds mean identical RNG streams until the fixes
diverge play (the divergence IS the measurement).

## Seed-band freshness (skill: local_seed_band_freshness)
No fresh band is used: the after-panel replays r247's band
101966–101970 by design (matched before/after). The r247 prereg
records the band's freshness search (zero hits in preregs,
evidence filenames, `git log --grep=10196`, repo evidence `*.md`,
goal hidden_files `*.md`); the band is spent by r247 and is NOT
reused as a fresh band by any later run. No new band is consumed
by this run.

## Instrument proof (before the panel)
- Analyzer fork proven on the r247 corpus BEFORE the panel (r247
  JSONs + convo txts in the goal hidden_files evidence dir for
  2026-11-21, copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r265-analyzer-proof/`,
  renamed to r265 names; logs `r247-baseline.log` +
  `r265-fork.log` in the same dir): the re-run r247 baseline
  reproduces the committed r247 analyzer log exactly (diff clean
  modulo per-seed lines), and the r265 fork reproduces every old-bar
  number exactly — Q1 RATE (r247: 0/41), Q1b 41/340, SPOTTER 33
  (cumulative 50), LADDER 3/5, FASTER-ID 4/5, END 9/9, VILLAGE 5/5,
  Q2 0/10 CUT, scholar deaths 3, STRANDED 18 dawns / 1 run,
  WINPLAN planSeeds 0 / partyDepartures 0 / plans 0. The fork
  changes no scorer logic for the old bars. NEW lines on the old
  corpus (expected, not a fork break): STRANDED-close lines (0
  closes — the old corpus predates the fix; the wedge never
  attempted the end) + Q1 per-sit classification lines GONE
  (retired by design).
- Proof tests run BEFORE the panel in this worktree:
  test-winplan-wake-r265 + test-bearer-end-r265, both GREEN.
  The pilot seed exercises the instruments directly: winPlanEnd
  present (store woken), strandedLog/endLog present, and on
  101970 the orphan closes (the r247 seed where Jamie dies d25).
  If the pilot forces a driver or fix change, the panel restarts
  and the pilot seed is NOT scored — EXCEPT that a driver change
  after the pilot on this MATCHED band voids the band only if the
  change is game behavior (instrument-only changes keep the band,
  recorded in the run note); any src/js change forces a panel
  restart on the same seeds (the band is matched, not fresh — a
  restart replays the same seeds, it does not consume a new band).

## Canon
docs/CANON.md read at run start. Win-plan canon: the system's own
ontology header (src/js/win-plan.js rules block — plans start from
lived or heard knowledge only, never a roster scan; stages gear →
party → hunt → standing → table). No canon doc covers the
favorless-ask mechanism, want-raise rates, seed selection, or the
previous-bearer rule — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137–r247; proof tests
stage for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design, wave-4 kill A/B,
family 7 UNMEASURED. This run does NOT take any of those builds.
The haven-edge scholar-death shape stays a goals-arm question.
The F5 thin<7%/fat>15% want-raise floor stays with the build arm.
The day-desync −1 shape (r245 once, r247 twice) stays a watch;
a third recurrence earns a clock-jitter diagnostic next run.

## Pilot gate
Pilot seed runs first on the final driver + fixes; completes
without crash AND (≥1 people-check sitting is held OR game over
before the check with the skip note written) AND its transcript is
written AND the spotter instruments fire AND the sittingCloses
record is present AND wedgeSits carry pick wantIds on VERBAL sits
AND ≥1 wedge social sit carries the Q1 trace fields (the trace
FIELDS stay — only the analyzer's per-sit CLASSIFICATION is
retired) AND the rosterDepartures instrument is present AND the
r240 instruments are present (standingEnd, scholarDawns,
teleTypeCounts) AND the Q5 instruments are present (mootLines +
caseLog) AND the r246 instruments are present (warnLog,
settledFavorLines, dryLines, dayDesync, loopDay) AND the r247
instruments are present (rosterArrivals, spotterTenure,
arrivalLines, winplanLines, winPlanEnd) AND winPlanEnd.stats is
non-null (store woken — the fix's first observable) AND on
101966 the engagement gate is visible (plans seeded only with
lived/heard knowledge, or an explicit no-seed with the gate
holding). If the pilot forces a driver or fix change, the panel
restarts on the same matched seeds and the pilot seed is NOT
scored (see Instrument proof above).

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244/r245/
r246/r247 did NOT roll forward. This run's panel is the r247
driver regime on the matched band + two fixes — guardrails should
stay quiet; any LOUD line is adjudicated as band noise vs real bug
vs fix effect BEFORE rolling the baseline forward. Metrics:
guardrails.deaths, guardrails.popAlive, guardrails.pantryKcal,
c3.starvationDeaths (r135's set). The r247 checker hit the known
schema mismatch (the driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding. NOTE: this run changes src/js (two fixes); a guardrail
move is adjudicated fix-effect vs band noise, and the baseline is
NOT rolled on a mismatch.
