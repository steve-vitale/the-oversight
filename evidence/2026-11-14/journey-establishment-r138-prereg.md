# Journey leg ESTABLISHMENT — r138 pre-registration (2026-11-14, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261114T144457Z` (scheduled Sat 2026-11-14
08:45 CST). Rotation read `1` (establishment); write `1→2` at run
start (done — file reads 2; deepening next).
**Base:** local master `792f4570d` (sim-transplant15f-picks16-a).
Pre-flight deviations (LOUD):
- **Registration failed once, then succeeded on retry.** The first
  `worktree-register.sh` died in `git reset --hard` ("error: unable
  to write file …", "fatal: Could not reset index file to revision
  'HEAD'") — a transient host write blip (write flap class,
  AGENTS.md 2026-11-12) during the 97k-file reset. No partial tree,
  registry clean, probe writes OK immediately after; second
  registration completed, heartbeat landed 14:52:03Z. Heartbeat loop
  runs from the worktrees dir (10-min cadence, PID 52033 at run
  start).
- `git pull` reported "Already up to date." Main tree clean; disk
  39%. Reaper ran clean at pre-flight (11/16 trees active).

## Leg question (r137's next blank, taken verbatim)

**A previous-bearer <redacted> run strands the wedge.** Seed 2802:
Ingrid's forage run was committed d12 by Tyler (the second bearer
after Manuel died d9 of sickness); Tyler died d13 "a stranger";
the run stayed live to the end (`live: true`, promiseKept
'released') with the ending permanently not-ready for the successor
("That outing belonged to the previous bearer. It is not your
promise."). The end-wedge only fires on state 'broken', so it never
tried to close it — and the wedge's live-branch early return meant
every dawn d14–d35 walked home for a run that can never be worked
(18× 'unworked: previous bearer', 3-step walks each dawn) and never
sat for a new favor: 0 commits after d12, Xavier's d10 ask never
got a commit sit, 0 door probes. The wedge froze its own social
play for three weeks on one dead run. Driver work, not a proven
game defect (the game may allow new favors while it is live — the
wedge never tried): the wedge should recognize the previous-bearer
status and stop working the run (sit for new favors instead, or
record it abandoned-unworkable). Open design question for Steve:
should the game release a dead bearer's outing on succession, or
should it linger in the successor's ledger forever?

## Diagnosis (established BEFORE the panel — code reading, not panel data)

The game-side shape is now pinned (ledger.js mantle handoff,
favor-forage.js / favor-water.js, favor-outing.js):
- On succession the mantle handoff (ledger.js, MANTLE HANDOFF
  RECORD) releases every open promise (`kept='released'`,
  `inherited=true`) and reverts its favor from 'promised' to
  'asked' (or 'moot' when the promisee inherited) — **but it does
  not touch a live run object**: `forageRun` / `waterRun` stays
  live (`returned=false`) with `bearer` = the dead predecessor's
  id.
- `forageFavorAction` / `waterFavorAction` then block BOTH branches
  for the successor: the `r.bearer !== this.villagerId` check
  ("That outing belonged to the previous bearer. It is not your
  promise.") fires before the ending branch, and the r81
  partner-gone ending branch requires `r.bearer===this.villagerId`.
  A previous-bearer run can never be worked AND never be ended by
  the successor — no honest verb closes it.
- The game itself never works it either: `attemptWaitingOuting`
  skips previous-bearer promises, and `forageFavorCompanions` /
  `waterFavorCompanions` filter to `bearer===this.villagerId`.
  The run is permanently stranded in the ledger; only the wedge
  kept working it.
- The favor's revert to 'asked' means the NPC *can* re-ask the
  successor (INHERITED ASK), but the live run keeps the wedge's
  live-branch early return firing, so the wedge never sits for it.
- **Fix shape (driver-only, no src/js):** the wedge recognizes a
  previous-bearer live run and stops working it. In `wedgeDawn`,
  split the live find: `live` = first live run whose bearer IS the
  current villager; `stranded` = live runs whose bearer is not.
  Stranded runs are recorded in a new `strandedLog` (vid, kind,
  bearer, bearer name, day first seen, status reason) and the wedge
  falls through to the normal no-live path (promised sits, then
  accept sits), so social play continues. Belt-and-braces in
  `wedgeTravelOut`: if the pre-status reason matches /previous
  bearer/i, record stranded and return outcome
  'prev-bearer-stranded' with no travel and no press. The
  pilot-break hold never applies to a stranded run (it can never
  break — its promise is released, so checkPromises will not rot
  it). The end-wedge is never attempted for a stranded run (its
  ending status is permanently not-ready by the game). `jointLedger`
  exposes the run's `bearer` so the check reads ledger state, not
  a status string. The driver helper `prevBearerRunOf(Game, favor)`
  is hoisted to module scope and exported (driver guarded with
  `require.main === module`) so the proof test exercises the
  driver's own detection, not a copy.
- The game-side question (release the run on succession vs let it
  linger) stays Steve's call — this run files the diagnosis with
  the code cites and does NOT change src/js. FIX GATE: a game
  change lands ONLY if the wedge proves a game defect; the reading
  proves the stranded run is unworkable-by-design for the
  successor, and the wedge-side fix is the scope.

## Bars (binding, §14 — no mid-run re-scoring)
Driver: `scripts/journey-establishment-r138-20261114.js` (r137
driver clone + stranded detection/fall-through + strandedLog;
the driver itself is otherwise unchanged). Analyzer:
`scripts/analyze-journey-establishment-r138-20261114.js` (r137
analyzer clone + STRANDED branch + stranded metrics).
- **STRANDED BAR (primary, new):** GO = across the panel, every
  dawn a previous-bearer live run is present, the wedge (a)
  records it in strandedLog, (b) performs 0 work on it — no
  travelOutLog entry with outcome 'unworked: previous bearer', no
  travelHome84 call and no favor press for that run that dawn —
  and (c) still plays socially that dawn: ≥1 wedge sit with mode
  'accept' or 'start' on the same day. NO-OPPORTUNITY = zero
  previous-bearer live runs across the panel — then the proof test
  carries the mechanism (staged succession state) and the panel
  only re-proves the carried bars with the new driver. A
  NO-OPPORTUNITY here is honest, not a failure.
- **END BAR (carried, r85/r136/r137 shape + bearer-change excuse):**
  GO = every broken-live forage run that (a) broke ≥ 2 days before
  the run's end, (b) bearer is the player, (c) the ending status
  was ready on at least one dawn after breaking, is closed by the
  wedge (returned=true, live=false) within 2 dawns of breaking.
  NO-GO = any such run left live past that window, with each
  failure attributed to a named cause. **Bearer-change excuse:**
  a run whose bearer changed mid-window is OUT OF SCOPE (its
  ending is permanently not-ready for the successor — the Hiroshi
  shape; the stranded bar now owns that shape), recorded with the
  cause, not counted as a failure. NO-OPPORTUNITY = zero
  broken-live forage runs across the panel.
- **TRAVEL BRANCH (carried watch):** among end/travel-out sits
  whose homeward walk first hits a clearable blockage
  (fallen_tree / rubble / washed_out), GO = all reach home within
  the same dawn via sidestep or clear-and-retry and close within
  the 2-dawn window. NO-OPPORTUNITY = zero such sits.
- **THREAD BRANCH (carried watch):** paged (Yara-shape) end
  opportunities closed within 2 dawns.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not
  drop across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
  r84 panel: ~15 on seed 994 alone; r85/r136/r137 panels: 0.
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel (r85/r136/r137: 0); stranded water
  runs counted under the STRANDED BAR too.

## Q2 (report-only — canned-line variety watch, r135/r136/r137 standing watch)
Count verbatim repeats of the standing-watch lines across the
panel's AFTER transcripts: taken-kin pod-dream closing (r135: 4×,
r136: 0, r137: 0), recap stitch "X — Still on Y" (r135: 5×,
r136: 1, r137: 0), slope-reading lesson (r135: 4×, r136: 0,
r137: 1), "Walked in like they'd never left." (r135: 5×, r136: 0,
r137: 0), "Take it for what it's worth." gossip closer (r135: 3×,
r136: 0, r137: 0), stew-bowl line (r135/r136/r137: 0/1/0). No fix
in this run (scope is the wedge); counts feed the next run's
question.

## Q3 (carried guard — spotter blank, r131/r133/r134/r135/r136/r137)
`foodXp['spotter']` total on the panel (r135/r136/r137: 0).
Report-only; the spotter blank (a villager can stare at the wild
all day and learn nothing) stands as the next diagnostic after the
wedge.

## Seeds, policy, horizon
Pilot: **2901** with `R138_PILOT_BREAK=1` (forced break, same
honest-inaction hold as r85/r136/r137). Panel: **2902–2905**, 42d
horizon. Policy: competent (r85/r136/r137 driver shape — no
withDelegate/HUNTSTAFF flags; verified in the driver).
Death-aware tail +10d.
Proof test: `scripts/test-journey-establishment-r138-prevbearer.js`
(staged succession state: live forage run whose bearer is a dead
predecessor — work + ending both blocked with the previous-bearer
line, run stays live, game never sets out on it; water shape;
driver's own prevBearerRunOf detection on staged state; source
checks + fail-control on the r137 driver; det-gate: r138 driver
twice, 5d seed 2901, byte-identical outputs).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 2901–2905 is FRESH.** Word-boundary grep
  `(^|[^0-9])290[1-5]([^0-9]|$)` over `evidence/**/*.md` and
  `scripts/*.js` plus prereg-name scan over
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`:
  hits are all non-seed usages (kcal values `"Expedition haul":
  2901`, `"totalInternal": 2903`, sweep strings `|2904|`, line
  number `conversation.js:2905`, 5-digit bands 62901–62908 and
  92901–92909). No prereg, forbidden list, contaminated list,
  screen, or extension band names 2901–2905 as seeds.
- Contaminated bands NOT reused for new questions (r135/r136/r137
  list carried): 1502, 1504, 1603, 1604, 17101–17112, 1142–1151,
  1801–1804, 1901–1916, 2001–2010, 2101–2116, 2201–2216, 2301–2316,
  2401–2416, 100001–100008, 1200–1209, 2501–2516, 2601–2616,
  2701–2705 (matched reuse only, r133/r134/r135/r136/r137 — NOT
  reused here), 2801–2805 (r137, just used).

## Canon
docs/CANON.md + docs/CONVERSATIONS.md + docs/MAP.md read at run
start. MAP.md: blockages guard approach sides; travel happens by
walking, never teleports; walkHome is the compass's way home. The
favor/outing lifecycle still has no dedicated canon doc (same as
r82–r137); per loop rules this run says so instead of inventing
canon. Diagnosis cites are code comments (ledger.js MANTLE
HANDOFF RECORD, favor-forage.js r81 END-WITHOUT-PARTNER,
favor-outing.js previous-bearer skip). No src/js change is
expected; the fix is driver-side.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137; the proof test
stages succession state for the mechanism only, not a combat
fixture.

## Context arriving mid-run (not this run's scope)
Steve RULED 2026-11-13 18:00 CST on the medicine holder-less lever:
ALL FOUR levers — (a) scholar fetches medicine, (b) traveling
healer visits, (c) any villager can search for medicine once
taught, (d) level-ups offer healing abilities with more incentive.
Build brief: goal
hidden_files/medicine-holderless-levers-brief-2026-11-13.md. This
run does NOT take that build — it belongs to a dedicated arm
(build-medicduty-h, live in the tree list) — but the panel's
wound-fever/healer numbers are relevant context and are reported.

## Pilot gate
Pilot seed 2901 runs first on the final driver with
`R138_PILOT_BREAK=1`; completes without crash AND instruments fire
AND the hold produces a broken live run AND the wedge closes it
(returned=true, live=false) AND no trust drop. If the pilot closes
without a stranding, the gate still passes on closure and the proof
test carries the stranded mechanism (recorded honestly, not
claimed as wild). If the pilot forces a driver fix, the panel
restarts on fresh seeds and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133/r134/r135/r136/r137 did NOT roll
forward. This run's panel is the r85/r136/r137 driver regime on the
fresh band 2902–2905 — guardrails should stay quiet; any LOUD line
is adjudicated as band noise vs real bug BEFORE rolling the
baseline forward. Metrics: guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths
(r135's set). The r137 checker runs hit the known schema mismatch
(the r85/r136/r137 driver never emits `guardrails.*` fields, so
the checker reads missing paths as 0) — expected again, not a
finding.
