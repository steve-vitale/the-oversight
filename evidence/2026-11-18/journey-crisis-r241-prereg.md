# Journey crisis r241 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start. NOTE: r240 played
crisis (6) and its closeout note claims "rotation-b advanced 6→7", but
the file still reads 6 (mtime 10:09Z, before r240's lock) — the advance
did not happen. This run plays crisis (6) and writes 7 (succession next)
at closeout. Run number: r241 follows crisis r240 (Nov 18) in the global
journey sequence.
Base: master c6e738028.
Lock: playtest-loop-2.lock run_id 2026-11-18T15:04:29Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- STALE-LOCK RECOVERY: the lock at run start (run_id
  2026-11-18T12:56:29Z, ~2h old) was the r240 adoption run's lock. Its
  registry entry (journey2-crisis, run 2026-11-18T13:08:47Z) reads
  status done-merged, worktree directory already removed, commits
  landed 14:42Z — but its heartbeat (14:55:39Z) was <15 min old at
  first read, so the guard's letter said "alive". Checked three times
  over ~7 min: the heartbeat NEVER moved (14:55:39Z at 14:56:59Z,
  15:00:31Z, 15:03:39Z), no journey2-crisis / r240 / adoption process
  exists, no hbloop process runs. A frozen heartbeat + done-merged +
  no tree + no process = a dead run whose final closeout heartbeat was
  14:55:39Z; the worker died or exited before its last two bookkeeping
  steps (rotation advance, lock deletion) despite the closeout note
  claiming them. Per the body rule (no live heartbeat = DEAD; also
  the >90-minute fallback), the lock was deleted and a new one created.
  Recorded as a closeout bookkeeping miss, not a game finding.
- Main tree clean at first check (0 dirty). Disk 53%.
- `git pull --ff-only`: "Already up to date" (master c6e738028).
- `worktree-reap.sh`: SKIP — registry lock held by another reaper run
  (consecutive skips: 1). No cleanup this run; not a failure (the
  known reaper lock self-contention). Cap: 16 worktrees listed, cap
  enforced by the register script.
- Registration: clean, first attempt, onto master c6e738028; took
  ~4.3 min (registry-flock queue behind siblings, same as r240's
  ~3 min). Heartbeat immediately after registration; re-heartbeat
  before each major phase (pilot, each panel seed, gate, landing).
  No background heartbeat loop (the runtime reaps long-lived
  backgrounded exec sessions — r234/r235 precedent). The tree is
  dirty once work starts, and the reaper never auto-removes dirty
  trees — second line of defense, not a substitute.
- Flap watcher: not checked this run (probe + watchdog cron own it).

## Canon read this run

- docs/CANON.md + docs/DIRECTIVES.md + docs/MEASUREMENT.md §§9–12,
  14–15 + repo AGENTS.md (worktree copy verified identical) re-read
  this run. `git log 29b36f16b..HEAD` on CANON.md, DISEASES.md,
  CONVERSATIONS.md, ALIEN-PLAYERS.md, MONSTER-WAVES.md, CONTESTS.md,
  MEASUREMENT.md, DIRECTIVES.md is EMPTY — unchanged since r240's
  read, which stands. Canon: two pools never mix; ruin medicines
  ease/cure as labeled; radiation is pellet cost, no pill touches it.
  The death record says "a stranger", never "an alien"; Q2 stays
  OPEN, Steve's call.

## Base movement since r240 (29b36f16b -> c6e738028)

src/js diff is 5 files, +192/-18 — the r240 Amanda fix plus three
behavior changes, all dialogue-adjacent, fight engine, or win-plan:

- 639bd3f41 (r240 fix itself): repay want must not call a broken favor
  settled while its need is live (Amanda 14525 d38, C3b r201) + proof
  test 17/17 (9 fail before). convo-wants.js (+66). This panel judges
  the fix in the wild for the first time.
- e02ae10b3 sim-partytrios-b (finding #2532): brain-mirror partyTrios
  bump + proof 21/21. villager-brain.js (+7). TRIODROUGHT WATCH is
  now discriminating: r240 saw partyTrios 0 on every seed despite 41
  sorties; the bump's own pilot claims counter 19/19, ctl 0, and the
  winplandepart DIAG (instruments only, no game code) saw trios 10/10
  on its own band. If this crisis panel still shows 0 trios, the bump
  does not reach crisis launches; if trios appear, the drought is
  broken in the wild.
- 5402d4cc3 sim-wildavoid-a (finding #2506): outmatched-avoid on the
  wild routers + proof 91/91 [needs-eyes]. game.js (+43), win-plan.js
  (+81/-11). WILDAVOID WATCH this run (descriptive): wild-fight
  outcomes and outmatched-avoid firings vs r240; any wild fight that
  strands the party or narrates nonsense is a FINDING.
- 0b8312f20 sim-fleerepair3-b (finding #2500): FLEEREPAIR3 leave ends
  the fight — no parting hit + proof. fieldFights.js (+13). Its panel
  claims parting hits 13->0, w4 kills 4->6, deaths 698->694.
  FLEEREPAIR3 WATCH this run: parting hits on crisis sortie/leaving
  fights, expected 0; any parting hit is a FINDING (a regression of
  the fleerepair3 fix if the shape matches).
- Instruments/diagnostics only, NO game code: sim-winplandepart-b
  (DIAG-GO; "depart path trigger is the vbrainOwnsDawn gate" is a
  diagnostic finding, NOT a landed change), sim-handoffrec-retry-b
  (DIAG GO), sim-vetguard-b (DIAG-NO-GO; no table veteran ever forms).
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled
  2026-11-14 13:18 CST the medicine trio needs more complexity, a
  richer layered design is owed. The RUINROAD arm stays parked
  this run.

## Leg question (carried from crisis r240)

**Do r240's verdicts hold on the new base — and does the r240 Amanda
fix hold in the wild on the crisis leg, with the partytrios bump,
fleerepair3, and wildavoid changes behaving clean under crisis
deaths?** Threads (r240's 1–24 carried, updated where noted):

1. DRY3 CONFIRM (continued): 0 dry lines on the three r235 fixed
   surfaces (expedition-ask answer, place-ask answer, lesson line
   after a convoWouldBlock pre-check). Any dry line on one of these
   surfaces is a REGRESSION of the r235 fix, filed LOUD with a fix
   in-run if the cause is local.
2. DRY2 CONFIRM (continued): 0 dry lines on the three r234 fixed
   surfaces (ask: composed topic line, probe stonewall repeat,
   confront line). Any dry line on one of these surfaces is a
   REGRESSION of the r234 fix, filed LOUD.
3. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201–r240. This panel re-runs the
   same driven transcripts on fresh seeds; any dry line on a NEW
   surface names the next fix.
4. C3b SETTLED-FAVOR CONFIRM — NOW JUDGING THE r240 FIX IN THE
   WILD (binding this run): the r240 fix gates the repay want's
   settled language on the favor's need being gone (6 sites:
   opener, engageBeat, deflectBeat, follow-up, stale opener,
   re-wounded-after-settle). This panel spot-checks every "settled"
   line the same way r240 did — a broken favor whose need is still
   live must NEVER be called done/square/settled. Any false
   settlement is a REGRESSION of the r240 fix, filed LOUD with a
   fix in-run if the cause is local.
5. C3c CLOSED (r228 harness verdict): the stale-favor resume-opener
   watch is no longer open. The panel still records resume openers;
   any opener naming a favor that changed since planting is a
   REGRESSION of the r228 fix, filed LOUD. No separate harness.
6. C3d CONFIRM (continued): every recap served while a favor/want
   is live on the table names that want (r231 convoRecapLiveLine);
   a "Nothing important" recap with live business is a REGRESSION
   of the r231 fix, filed LOUD with a fix in-run if the cause is
   local. A "Nothing important" recap with nothing open stays honest
   and is recorded, not judged.
7. NODEAWAY PANEL METRIC (tracked, no bar): nodeAway exclusions
   across refusals + alive-bench refusals + worst single bench
   snapshot, per seed. r240: 19 / 10 / worst-4 (14525 d64); r238:
   16 / 9 / worst-5; r230: 4 / 3 / worst-2. No bar — descriptive
   against the base movement (partytrios bump, fleerepair3,
   wildavoid), never lever attribution with n=5. The metric needs
   an alive bench to mean anything (r229 metric review 11).
8. FUNERAL-MEND CONFIRM (r216 F1, r223–r240 GO): the partial-payment
   honest line must hold in the wild — any over-claim line is a
   REGRESSION, filed LOUD.
9. STAGE-0 SURFACING WATCH (r230 surface): any stage-0 ask_favor
   want with a live need that sits a full sitting with dlg:help
   never offered is recorded; a second sitting graduates to a fix
   item.
10. DEATHCLEANUP WATCH (measurable since r238): deathCleanups +
    removalCleanups + planSeeds stats per seed; winPlan census per
    seed (entries, holder alive/dead, stage, party size). Any dead
    villager's winPlan entry lingering at census is a FINDING;
    planSeeds == 0 with entries present is a FINDING; firstPlanDay
    the day after a death with zero cleanups is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): removalCleanups stat per seed;
    any winPlan entry for a removed (left/fled/betrayed) villager
    lingering at census is a FINDING. Carries the fleerepair2-b seed
    gate (win-plan dies on a flee repair path) and now the
    fleerepair3 leave-ends-fight shape.
12. TITAN-REFUSAL CONFIRM (binding this run): refusal lines per
    titan per day ≤ 1 (r233 fix), judged against the outcomes table
    (calls). Any repeat on the same titan-day is a REGRESSION of the
    r233 fix, filed LOUD. Zero lines with zero 'refused' outcomes
    is vacuous-explained.
13. DEFERRED-ASK WATCH (continued, descriptive): any dlg:help answer
    of 'already handled' about a settled favor while a live need
    waits is a REGRESSION of the r231 fix, filed LOUD.
14. HOMEBODYVOICE WATCH — THIRD PANEL (measurable): qualifying picks
    vs voice lines per seed. A qualifying pick unvoiced for a NEW
    pair is a FINDING; a voice line naming a wrong block is a
    FINDING. r238 and r240 were BOTH vacuous (r240: 30 picks, 0
    qualifying, 0 voice lines). If this panel is vacuous a third
    time, the watch retires to descriptive-only or is
    re-instrumented (r240 metric review 5).
15. NOTICKDEFER WATCH — THIRD PANEL (descriptive): deferred picks
    per seed; any deferred pick launching the same day is a FINDING.
    r240: 0 deferred, 0 leaks — the deferral never fired on that
    band. If 0 a third time, the watch retires to descriptive-only
    or is re-instrumented (r240 metric review 5).
16. TRIODROUGHT WATCH — NOW DISCRIMINATING (descriptive): partyTrios
    from winPlanStats + launched-party sizes vs r240 (0 on every
    seed). The partytrios bump landed on this base; trios should be
    observable where the panel launches them. 0 trios again is a
    FINDING about the bump's reach on the crisis band, not a
    regression (the bump's own pilot passed on its own band).
17. REL-MOURN WATCH (descriptive): mourning lines name the
    relationship (r232). Spot-checked in the full transcript read;
    any mourning line wearing a wrong/different name is a REGRESSION
    of the r231 fix, filed LOUD.
18. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines —
    do they fire, and do they name the right fire/commit?
19. HOLDERVoice WATCH (descriptive): holder-half lines ("stays home")
    vs companion lines ("never leaves Haven") per seed.
20. POCKET WATCH (descriptive): "No path there." lines are TRAVEL
    NOISE, not a pocket count. The pocket watch proper is the
    fight-outcome + transcript read: any sortie fight breaking with
    the party unable to reach the monster is a FINDING.
21. TRAILTALK WATCH (descriptive): trail-talk lines on outings — any
    verbatim repeat of the same line 3×+ in one outing is a
    REGRESSION of the r236 fix, filed LOUD.
22. FIGHT-1 WATCH (continued, descriptive): okSorties / cleared /
    multiMonsterCleared vs r240 (26/15/13 of 22); a cleared
    fight-1 with vTaken >= 70 is the standing Q4 live-play
    confirmation trigger.
23. FLEEREPAIR3 WATCH (new, descriptive): parting hits on crisis
    sortie/leaving fights, expected 0 (the fix: leave ends the
    fight). Any parting hit is a FINDING; if the shape matches the
    fleerepair3 fix's covered path, it is a REGRESSION of that fix,
    filed LOUD.
24. WILDAVOID WATCH (new, descriptive): wild-fight outcomes and
    outmatched-avoid firings vs r240; any wild fight that strands
    the party or narrates nonsense is a FINDING.
25. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and do the villages bend
    or break the same way (r240: 4/5 game-over, median 133d; r238:
    3/5, median 135d)? Descriptive watch: funeral-mend lines under
    FUNERALMEND (ON), CASCADE's effect on scholar deaths to
    lingerers, arena-fight outcomes under the Reunion re-tune
    (HP x0.4 / damage x0.6, mirror cap 1).
26. R238/R240 BLEMISH REPRODUCTION (conditional fix items): (a)
    doubt-stonewall line repeating verbatim 3×+ in one sitting
    (r240: 4× in one sitting, substance honest — escalating replies
    + warmth cost — left out; if it repeats 3×+ VERBATIM here it
    graduates to a fix item); (b) Wren cache note repeating verbatim
    5×+ on one seed — if it repeats 5×+ here, it graduates; (c)
    "They mime walking" same-variant 3 days running — if it repeats
    3× in a row here, it graduates; (d) ambush case renumbering
    (a voted case re-appearing under a new number) — watch whether
    a voted case re-appears; (e) resume-opener quote SPLIT across
    two entries (the real defect, not the ellipsis-cap shape).
    (f) r240 polish note: invite-decline "Another time. The village
    needs me here." served identically twice in one sitting — if it
    repeats, still polish, not a defect; recorded only.

NOT this run: the RUINROAD forced-search arm. Cumulative 0/315
(r240 panel: 1 ruin search, 0 med items; cumulative now 0
acquisitions in 315 ruin searches) is a PROVEN constraint;
re-running the arm with no lever landed would re-prove it (Steve
2026-11-01 rebuke). The supply question lives with the medicine
build brief — lever (h) duty-holder scavenging first, richer
layered design owed per Steve 2026-11-14. If a lever lands, a later
crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14531–14535. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) and goal hidden_files preregs: zero hits for 14531, 14532,
  14533, 14534, 14535 as seeds. The only "14531" hits anywhere in
  the repo are `preservedKcal: 14531` values in Oct 13 JSON data
  files (sim-quiet-links-after/baseline.json, sim-wave5-b.json) —
  data values, not seed assignments. Forbidden bands named in
  preregs (73641–73648, 73671–73678; 99201–99208; 78201–78208;
  99351–99358; 99401–99412): no intersection. Collision notes
  (carried): 14521–14525 r240. 14511–14515 r238. 14501–14505 r230.
  14491–14495 r229. 14481–14485 r228. 14471–14475 r223.
  14461–14465 r216. 14451–14455 r208. 14441–14445 r201.
  14431–14435 r192. 14421–14425 r182/r186. 14411–14415 r181.
  14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14531–14535,
  sequential. PILOT FIRST (§9): seeds 14531–14533 run first; the
  panel expands to 14534–14535 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14531 DAYS=5 into the r241 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r240 driver verbatim EXCEPT r241 filenames/paths/seeds
  (14531–14535), ORIGINS map keys, EVID path 2026-11-18, DAYS 150.
  The r240 instruments ride along unchanged (TITAN-OUTCOME census
  snapshot, HOMEBODY day-boundary scan, NOTICKDEFER day-boundary
  scan, DEATHCLEANUP census). RUINROAD env stays OFF (arm parked,
  see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r241 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r240 analyzer verbatim EXCEPT r241 filenames/paths.
  Validated on r240's analysis log before the panel: carried numbers
  reproduce (panel table + NODEAWAY 19/10/worst-4); the new watches
  (FLEEREPAIR3, WILDAVOID) are read from existing per-seed fields
  (parting-hit lines, wild-fight outcomes) — no new instrument.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- DRY3 CONFIRM (binding this run): 0 dry lines on the three r235
  fixed surfaces — (a) expedition-ask answer, (b) place-ask
  answer, (c) lesson line after a convoWouldBlock pre-check. Any
  dry line on one of these surfaces is a REGRESSION of the r235
  fix, filed LOUD with a fix in-run if the cause is local.
- DRY2 CONFIRM (binding this run): 0 dry lines on the three r234
  fixed surfaces — (a) ask: composed topic line, (b) probe
  stonewall repeat, (c) confront line. Any dry line on one of
  these surfaces is a REGRESSION of the r234 fix, filed LOUD with
  a fix in-run if the cause is local.
- Q6 RETIRED (r201 metric review): gorge-after-clear id-matched
  0/5 for the tenth consecutive zero panel — METRIC-BROKEN,
  descriptive-only from here. Reported, never judged.
- C1 (bend, not break) GO: every game-over has a named cause that is
  NOT a siege-mechanic failure; horizon reachable on at least 1 seed
  is descriptive, not a bar. A softlock seed is reported separately.
- C2 (episodes fire + gates hold) GO: raids fire on all seeds;
  fought resolutions present; D1 snapshots all delayed >= 3
  attempts; deltaBad empty; D3 drift unknown = 0 (union counting).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fires or is refused with a recorded reason; no
  boundary-firable case unfired.
- C3 (people check) GO: all driven transcripts read in full;
  fabricHits = 0; conversations meet the meaning bar. VoiceLine
  prefix stacking >= 3 sightings graduates to a fix in-run (r180
  fixed it; any recurrence is a REGRESSION, filed LOUD). Double
  confession: 0 expected (r172 guard + r143 spend); any recurrence
  is a guard failure, filed LOUD. Naming-stance wobble: a fourth
  sighting graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM — JUDGING THE r240 FIX (binding this
  run): every "settled" close line fires only on a sitting that
  shared a real beat with the favor it names (favor itself done:
  fulfilled / thanked), AND a broken favor whose need is still live
  is never called done/square/settled (the r240 fix's gate).
  Spot-check each one. Any false settlement is a REGRESSION of the
  r240 fix, filed LOUD with a fix in-run if the cause is local.
- C3c CLOSED: see thread 5. Any resume opener naming a changed
  favor is a REGRESSION of the r228 fix, filed LOUD.
- C3d CONFIRM (binding this run): every recap served while a
  favor/want is live on the table names that want (r231
  convoRecapLiveLine); a "Nothing important" recap with live
  business is a REGRESSION of the r231 fix, filed LOUD with a fix
  in-run if the cause is local. "Nothing important" with nothing
  open is honest and recorded, not judged.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across
  all driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts
  reported for famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative
  stays 0/315, carried as the standing number; the supply question
  is owned by the medicine build brief now.
- Q1 missed-window, Q5 multi-monster clear, BENCH, Q7 naming watch:
  carried as descriptive/watch, r180 definitions.
- A1–A6 stranger counters: DESCRIPTIVE ONLY this run. A7 NOT judged
  on the crisis leg (moved to the endgame leg per r186 metric
  review — the channel never opens under home-based play; the
  gates are anti-correlated by design). The counters stay in the
  driver/analyzer so the panel still records any kill that fires.
- ARENA WATCH (descriptive): arena-fight outcomes per seed under
  the Reunion re-tune (HP x0.4 / damage x0.6, mirror cap 1) —
  wins/losses vs r240's arena-death say lines, no bar. No
  win/loss instrument exists (no engine counter; say lines only
  narrate arena deaths) — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r240.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r240's 19/10/worst-4 and r238's 16/9/worst-5 and r230's 4/3/worst-2
  and r229's 0/0/0 and r228's 38/9/worst-7. A repeat at r240's scale
  keeps the muster-vs-travel tension a design question; a return
  toward r228's scale is reported as a descriptive against the base
  movement (partytrios bump / fleerepair3 / wildavoid), never lever
  attribution with n=5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants
  with a live need that sit a full sitting with dlg:help never
  offered, recorded per sitting; a second sitting graduates to a
  fix item.
- DEATHCLEANUP WATCH (measurable): deathCleanups +
  removalCleanups + planSeeds stats per seed; winPlan census per
  seed; any dead-holder entry lingering at census is a FINDING;
  planSeeds == 0 with entries present is a FINDING; firstPlanDay
  the day after a death with zero cleanups is a FINDING.
- NONDEATHPLAN WATCH (descriptive): removalCleanups stat per seed;
  any winPlan entry for a removed villager lingering at census is
  a FINDING.
- TITAN-REFUSAL CONFIRM (binding this run): refusal lines per
  titan per day ≤ 1 (r233 fix), judged against the outcomes table
  (calls). Any repeat on the same titan-day is a REGRESSION of the
  r233 fix, filed LOUD. Zero lines with zero 'refused' outcomes
  is vacuous-explained.
- DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
  answer about a settled favor while a live need waits is a
  REGRESSION of the r231 fix, filed LOUD.
- HOMEBODYVOICE WATCH (measurable this run — third panel): qualifying
  picks vs voice lines per seed. A qualifying pick unvoiced for a
  NEW pair is a FINDING; a voice line naming a wrong block is a
  FINDING. Vacuous a third time → retire to descriptive-only or
  re-instrument (r240 metric review 5).
- NOTICKDEFER WATCH (descriptive — third panel): deferred picks per
  seed; any deferred pick launching the same day is a FINDING.
  0 a third time → retire to descriptive-only or re-instrument
  (r240 metric review 5).
- TRIODROUGHT WATCH (descriptive — now discriminating): partyTrios
  per seed vs r240 (0 on every seed); launched-party sizes. The
  partytrios bump landed on this base; 0 trios again is a FINDING
  about the bump's reach on the crisis band.
- REL-MOURN WATCH (descriptive): mourning lines name the
  relationship; any wrong-name line is a REGRESSION of the r231
  fix, filed LOUD.
- MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines per
  seed; do they fire and name the right fire/commit?
- HOLDERVoice WATCH (descriptive): holder-half lines ("stays home")
  vs companion lines ("never leaves Haven") per seed.
- POCKET WATCH (descriptive): fights with ≥3 stuck turns; bar 0
  (r144 repair). Any such fight is a FINDING.
- TRAILTALK WATCH (descriptive): any verbatim repeat of the same
  trail-talk line 3×+ in one outing is a REGRESSION of the r236
  fix, filed LOUD.
- FLEEREPAIR3 WATCH (descriptive — new): parting hits on crisis
  sortie/leaving fights, expected 0. Any parting hit is a FINDING;
  if the shape matches the fleerepair3 fix's covered path, a
  REGRESSION of that fix, filed LOUD.
- WILDAVOID WATCH (descriptive — new): wild-fight outcomes and
  outmatched-avoid firings vs r240; any wild fight that strands the
  party or narrates nonsense is a FINDING.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2- or DRY3-fixed surface (DRY2/DRY3 regression); reproduction
  of any r238/r240 blemish at its graduation bar (doubt-stonewall
  3×+ VERBATIM in one sitting; Wren note 5×+ on one seed;
  mime-walking 3 days running; voted case re-appearing under a new
  number); resume-opener quote SPLIT across two entries (the real
  defect, not the ellipsis-cap shape); any dead-holder winPlan entry
  at census; any homebody voice line naming a wrong block; any titan
  refusal repeat on the same titan-day; any deferred pick launching
  the same day; any fight narrated as stuck/unreachable in the
  transcript read, or any sortie fight breaking with the party unable
  to reach the monster; any trail-talk line repeated 3×+ in one
  outing; any parting hit on a leaving/sortie fight (FLEEREPAIR3);
  any trio launched where r240 launched none (TRIODROUGHT movement).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance. UNITS RESOLUTION (r240 metric review
  3, settled this run): read the driver/analyzer to establish
  whether defendedFights is a per-seed count summed by the analyzer
  into a panel sum (the baseline note says 95 sits inside a
  historical 3-seed range 43–143, i.e. a 3-seed panel SUM). This
  panel reports per-seed values + the 5-seed sum and judges the
  per-seed range against the implied historical per-seed range; the
  verdict goes in the run note.

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r240:
(1) The r201 gate guards the close-line but not the repay want's own
lines — fixed in r240; this panel re-checks every settled line the
same way. (2) The "We're square." / "Don't mention it." player lines
in the repay menu are offered whenever no obligation is open — for a
broken favor with a live need, the player can still claim "we're
square" even though the NPC now speaks honestly. The NPC side is
fixed; the player-side option is a design question, not a false
claim by the game. Carried. (3) Telemetry baseline units
(crisis.json): sum or mean? Resolved this run (see Telemetry). (4)
The invite-decline "Another time. The village needs me here." has
no re-ask variant — identical twice in one sitting. Polish, not a
defect. (5) HOMEBODY and NOTICKDEFER were both vacuous a second
time (r240). If this panel is vacuous a third time, the watches
retire to descriptive-only or are re-instrumented. (6) No trio
formed on any seed (partyTrios 0) despite 41 sorties — the trio
drought persists as a descriptive watch; the partytrios bump landed
on this base, so this panel is the discriminating read.
Carried from r238: (7) Q6 retired to descriptive-only
(METRIC-BROKEN) — done r201. (8) Dialogue-only fixes are NOT
trajectory-neutral while voiceLine draws RNG — pre/post trajectory
comparisons stay descriptive. (9) For supply-gated fixes, the unit
test is the proof and the panel is a regression check only. (10)
The `want`-thread label is a function of the CURRENT favor, but the
topic ledger stores it as a snapshot — every consumer that trusts
the stored label can misname the favor after a change (r208 lapse
fixed; settled-line gate bypass fixed in r240; resume openers read
L.open[].label directly — C3c watches them). (11) Median-death-day
movement is a panel-level descriptive, not a per-change claim. (12)
The funeral-mend public line is a SECOND consumer of a stored-vs-live
value (r216 metric review): any line that states a number the
mechanics computed proportionally must be checked against the
computed value, not the nominal one. (13) Analyzer panel-wide dedupe
maps must be seed-scoped (r216 F2). (14) C3c close-out rule: the
targeted harness judges the watch; a panel with no qualifying case
is no longer "UNMEASURED" once the harness has spoken. (15) C3d
promotion rule: a watch graduates to CONFIRM when a fix for it
lands (r231); the panel then judges the fix in the wild. (16) The
deathcleanup driver gap (r230 metric review 5) is CLOSED by the
r238 instrumentation — deathCleanups + removalCleanups + planSeeds
stats and a winPlan census now ride in the driver record, so the
watch is scored from the panel instead of standing on the 42/42
proof alone. (17) The arena watch still has no win/loss instrument
— no engine counter exists for arena outcomes; say lines only
narrate arena deaths. The watch stays a death count, not a win
rate, until an instrument is built. (18) DRY3 promotion rule —
same shape as rules 15: the r235 fix's three surfaces are judged in
the wild, and a miss is a REGRESSION of the r235 fix. (19) The
titan-refusal and homebodyvoice driver gaps (r238 metric review
9–10) are CLOSED by the r240 instrumentation — titan outcomes ride
in the census, homebody picks ride in the day-boundary scan — so
both watches are scored from the panel instead of standing on
proofs alone. (20) The homebody pick count is a LOWER BOUND by
construction (commit map holds only the latest commit per holder
per day); same-day re-picks of a different companion are
undercounted. A qualifying-pick count of 0 with 0 voice lines is
vacuous, not a voice failure; a qualifying pick unvoiced for a NEW
pair is the finding. (21) The notickexact deferred-pick counter
reads vbrain.logs, which roll at LOG_CAP 400 — the day-boundary
scan with a day|holder dedupe key is the guard against loss; a
deferred pick is only meaningful beside the launch it held.
(22) NEW this run: the r240-fix promotion rule — same shape as
rules 15 and 18: the r240 fix's six sites are judged in the wild
this run, and a miss is a REGRESSION of the r240 fix.
