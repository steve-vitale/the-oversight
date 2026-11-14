# Journey leg ESTABLISHMENT — r137 pre-registration (2026-11-14, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136
precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261114T064342Z` (scheduled Sat 2026-11-14
00:45 CST). Rotation read `1` (establishment); write `1→2` at run
start (done — file reads 2; deepening next).
**Base:** local master `63c051206` (journey-landing r131: HEED fix).
Pre-flight deviations (LOUD):
- **Reaper skipped at pre-flight:** `worktree-reap.sh` reported
  "SKIP: registry lock held by another reaper run (consecutive skips:
  2) — no cleanup this run." No trees removed; registry consistent
  with disk, 15 trees listed (cap 16, registration fit). The reaper
  lock self-contention is the known 2026-11-12 AGENTS.md item (fix
  owed, needs a Steve nod) — not this run's to fix.
- **Registration took ~16 min.** Queued behind the flesh-out loop's
  sim-transplant13-a registration (its `git worktree add` /
  `git reset --hard` ran ~7 min on a loaded box); my register's own
  reset then ran ~7 min more. No flap: flap-watch ALL-OK through
  the window. Worktree verified on disk, branch
  `journey-establishment`, heartbeat landed 07:00:16Z; heartbeat
  loop runs from the worktrees dir (10-min cadence, PID 51667 at
  run start).
- `git pull` reported "Already up to date." Main tree clean; disk
  39%.

## Leg question (r136's next blank, taken verbatim)

**Travel-home wedge doesn't clear blockages.** When a fallen tree
(or rubble / washed-out gap) blocks the path home, `travelHome84`
tries one hop, fails, and the wedge gives up for the dawn — Pablo
sat 6 dawns at the map edge, Hiroshi 4. The player HAS the honest
verb ("Clear the fallen tree" — cut it, +2 wood). The wedge needs
blockage-clearing (or routing around) on its homeward path — the
same wedge the end-wedge and the travel-out wedge share.

## Diagnosis (established BEFORE the panel — code reading, not panel data)

Two game verbs already exist; the wedge uses neither:
- **`Game.walkHome(maxSteps)` (game.js:11875)** — the compass's way
  home as an action: one tile at a time, orthogonal, through
  `travelTo`; tries the longer homeward axis first, then the other,
  then sidesteps perpendicular (toward-home side first, never onto
  a tile already on this walk's path), and only stops honestly —
  block named, position unchanged by the refused steps — when every
  escape is refused. Returns `{reached, steps, path, blocked,
  interrupted}`; `blocked` is the `travelBlockage` object
  `{kind:'blockage', blockType, x, y}`. The r136 wedge's
  `travelHome84` never called it — it used `travelTargets()` +
  `travelTo` one hop at a time and gave up on the first refused hop.
- **`Game.clearBlockage(x, y)` (game.js:12290)** — clear a blockage
  by work, costs a day-part: fallen_tree → cut (+2 wood, 60 kcal);
  rubble → clear (+1–3 stone, 40 kcal); washed_out → buildBridge
  if wood ≥ 4, else scramble through (80 kcal). A creek blockage is
  NOT clearable by hand (returns false, says bridge it or swim it)
  — the wedge must not loop on a creek.
- **Fix shape (driver-only, no src/js):** `travelHome84` becomes
  walkHome-first with clear-and-retry: call `Game.walkHome(12)`; if
  not reached and `blocked.blockType` is clearable
  (fallen_tree / rubble / washed_out), call
  `Game.clearBlockage(blocked.x, blocked.y)`, record the clear
  (type, coords, ok), and retry `walkHome`; cap 3 clears per call
  (a fourth distinct blockage in one dawn means the wedge should
  stop and report, not grind). Creek block → stop honestly, record
  `blocked`, no clear attempt. Sidestep success is already inside
  walkHome — a bypassed block is not a stopping block. No behavior
  change when the path is open (walkHome reaches home, 0 clears).
  Record `clears` + `walkHomes` + `blocked` on the homeHops recs
  and endLog. If the verb is absent after all retries, record the
  offered state honestly.
- The same `travelHome84` is shared by the end-wedge and the
  travel-out wedge (r136 note), so the fix covers both directions.
  The end-wedge's deliver-first branch is untouched.

## Q1 bars (binding, §14 — no mid-run re-scoring)
Driver: `scripts/journey-establishment-r137-20261114.js` (r136
driver clone + clear-home travelHome84 + blockage instrumentation;
the driver itself is otherwise unchanged). Analyzer:
`scripts/analyze-journey-establishment-r137-20261114.js` (r136
analyzer clone + TRAVEL BRANCH + bearer-change excuse + Q2/Q3
counters + spotter guard).
- **END BAR (primary, r85/r136 shape + r136 metric-review proposal
  (a) adopted as this run's pre-registered bar):** GO = every
  broken-live forage run that (a) broke ≥ 2 days before the run's
  end, (b) bearer is the player, (c) the ending status was ready on
  at least one dawn after breaking, is closed by the wedge
  (returned=true, live=false) within 2 dawns of breaking. NO-GO =
  any such run left live past that window, with each failure
  attributed to a named cause. **Bearer-change excuse (new):** a
  run whose bearer dies/changes mid-window (bearer ≠ current
  player villager, ending permanently not-ready for the successor —
  the Hiroshi shape) is OUT OF SCOPE, recorded with the cause, not
  counted as a failure. NO-OPPORTUNITY = zero broken-live forage
  runs across the panel (not pass, not defect).
- **TRAVEL BRANCH (new):** among end/travel-out sits whose
  homeward walk first hits a clearable blockage (fallen_tree /
  rubble / washed_out), GO = all reach home within the same dawn
  via sidestep or clear-and-retry and close within the 2-dawn
  window. NO-OPPORTUNITY = zero such sits on the panel — then the
  proof test carries the mechanism (staged Pablo reproduction) and
  the panel only re-proves the END BAR with the new driver. A
  NO-OPPORTUNITY here is honest, not a failure.
- **TRUST GUARD (hard, DROP-ONLY, carried):** trust[vid] must not
  drop across any end press. Any drop = defect finding, wedge stops
  ending for the rest of that seed, END BAR NO-GO for that seed.
- **JAM BAR (report-only):** jam-days = dawns on which a promised
  (not yet live) run existed while a broken-live run was live.
  r84 panel: ~15 on seed 994 alone; r85/r136 panels: 0. Report
  per seed.
- **VILLAGE BAR (r85 carried):** alive at d40 on ≥3/4 panel seeds.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel seed,
  read in full (meaning, coherence, consequence — not counts).
- **FIX GATE:** a game change lands ONLY if the wedge proves a game
  defect (a step no honest verb can take, or a dishonest block).
  The code reading proves none — the panel is expected to land
  driver-only. If the panel overturns the reading (e.g. walkHome
  never reaches despite clears, or clearBlockage is unreachable
  from the wedge's position), that is named in the run note as a
  game defect with the panel evidence, and the fix gate governs.
- **WATER INSTRUMENT (report-only):** count of broken-live water
  runs seen across the panel (r85/r136: 0).

## Q2 (report-only — canned-line variety watch, r135/r136 standing watch)
Count verbatim repeats of the standing-watch lines across the
panel's AFTER transcripts: taken-kin pod-dream closing (r135: 4×,
r136: 0), recap stitch "X — Still on Y" (r135: 5×, r136: 1),
slope-reading lesson (r135: 4×, r136: 0), "Walked in like they'd
never left." (r135: 5×, r136: 0), "Take it for what it's worth."
gossip closer (r135: 3×, r136: 0), stew-bowl line ("Someone saved
me the last of the stew once... I think about that bowl more than
I think about the monsters." — Gerald r135 → Stan r136, NEW watch
item). No fix in this run (scope is the wedge); counts feed the
next run's question.

## Q3 (carried guard — spotter blank, r131/r133/r134/r135/r136)
`foodXp['spotter']` total on the panel (r135/r136: 0).
Report-only; the spotter blank (a villager can stare at the wild
all day and learn nothing) stands as the next diagnostic after the
wedge.

## Seeds, policy, horizon
Pilot: **2801** with `R137_PILOT_BREAK=1` (forced break, same
honest-inaction hold as r85/r136). Panel: **2802–2805**, 42d
horizon. Policy: competent (r85/r136 driver shape — no
withDelegate/HUNTSTAFF flags; verified in the driver).
Death-aware tail +10d.
Proof test: `scripts/test-journey-establishment-r137-clearhome.js`
(staged Pablo reproduction: broken live forage run, player at map
edge behind a fallen tree; walkHome stops blocked; clearBlockage
clears; retry reaches home; end press closes run + trust no-drop;
controls: open path → walkHome reaches, 0 clears; creek block →
wedge stops honestly, no clear attempt, blocked recorded;
rubble/washed_out clear shapes; det-gate: r137 driver twice, 5d
seed 2801, byte-identical outputs).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 2801–2805 is FRESH.** Word-boundary grep
  `(^|[^0-9])280[1-5]([^0-9]|$)` over `evidence/**/*.md` and
  `scripts/*.js`: hits are all non-seed usages (counts `2803
  total`, `2802.1k`, `2805 entry`, PIDs `2801`, commit-hash tails
  `1003b2804`, line numbers `hierarchy.js:2803`, stat values
  `61.2805`). No prereg, forbidden list, contaminated list,
  screen, or extension band names 2801–2805 as seeds.
  5-digit tails (62801/62808) are different bands, not uses.
- Contaminated bands NOT reused for new questions (r135/r136 list
  carried): 1502, 1504, 1603, 1604, 17101–17112, 1142–1151,
  1801–1804, 1901–1916, 2001–2010, 2101–2116, 2201–2216, 2301–2316,
  2401–2416, 100001–100008, 1200–1209, 2501–2516, 2601–2616,
  2701–2705 (matched reuse only, r133/r134/r135/r136 — NOT reused
  here).

## Canon
docs/CANON.md + docs/CONVERSATIONS.md + docs/MAP.md read at run
start. MAP.md: blockages guard approach sides; travel happens by
walking, never teleports; walkHome is the compass's way home. The
favor/outing lifecycle still has no dedicated canon doc (same as
r82–r136); per loop rules this run says so instead of inventing
canon. No src/js change is expected; the fix is driver-side.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r136; the proof test
stages a broken run + blockage for the mechanism only, not a
combat fixture.

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
Pilot seed 2801 runs first on the final driver with
`R137_PILOT_BREAK=1`; completes without crash AND instruments fire
AND the hold produces a broken live run AND the wedge closes it
(returned=true, live=false) AND no trust drop. The clear-home path
itself (clears ≥ 1) fires in the wild only when a blockage sits on
the homeward path during a sit — if the pilot closes without a
clear, the gate still passes on closure and the proof test carries
the clearing mechanism (recorded honestly, not claimed as wild).
If the pilot forces a driver fix, the panel restarts on fresh seeds
and the pilot seed is NOT scored.

## Telemetry
Live baseline is the r132 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2401–2416); r133/r134/r135/r136 did NOT roll
forward. This run's panel is the r85/r136 driver regime on the
fresh band 2802–2805 — guardrails should stay quiet; any LOUD line
is adjudicated as band noise vs real bug BEFORE rolling the
baseline forward. Metrics: guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths
(r135's set). The r136 checker runs hit the known schema mismatch
(r136 driver never emits `guardrails.*`; adjudicate by per-file
means on deaths/aliveEnd/pantryKcalEnd). Baseline NOT rolled
forward on a 4-seed wedge-driver panel unless the checker is QUIET
and the panel is otherwise clean (r85 call).

## Measurement-proof refresh (owed)
Still owed since r129 (rounds 11 + 12 now; r196 notes round 14
owed). This run lands driver-only (no src/js) — no new refresh
obligation from r137; if none exists at closeout, report it as
still owed with the reason, do not silently deepen the debt.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
