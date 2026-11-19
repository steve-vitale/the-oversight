# Journey crisis r244 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads **6** at run start (mtime
2026-11-19T00:43Z) — NOTE the discrepancy: the r241 adoption's run
note claims "Rotation-b verified 7, NOT advanced", but the file
reads 6, written 00:43Z (after r241's adoption closed). No audit
trail names the writer; the file is the authority per the body, so
this run plays crisis (6) and writes 7 at closeout, verifying the
write by reading it back. Run number: r244 follows crisis r241
(Nov 18) in the global journey sequence (r242 scale and r243
endgame exist; no r244 anywhere yet).
Base: master `3fdd5bc21`.
Lock: playtest-loop-2.lock run_id `2026-11-19T00:55:32Z` (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- No lock at run start. Main tree clean at first check (0 dirty).
  Disk 47%.
- `git pull --ff-only`: "Already up to date" (master 3fdd5bc21).
- `worktree-reap.sh`: ran clean; 11/16 active, no removals; LOUD
  notes about four other owners' dirty trees (not mine, left alone).
- Registration: slow (~15.6 min) — `git reset --hard` checkout of
  the 112k-file tree under load (load avg ~17, siblings running
  check.js/jest); the process was I/O-bound, not stuck (file count
  56k -> 90k -> done). Heartbeat immediately after registration
  (01:14:23Z) and before each major phase. No background heartbeat
  loop (the runtime reaps long-lived backgrounded exec sessions —
  r234/r235 precedent). The tree is dirty once work starts, and the
  reaper never auto-removes dirty trees — second line of defense,
  not a substitute.
- Flap watcher: not checked this run (probe + watchdog cron own it).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md + docs/MONSTER-WAVES.md + repo
  AGENTS.md re-read this run. `git log c6e738028..HEAD` on
  CANON.md, DISEASES.md, CONVERSATIONS.md, ALIEN-PLAYERS.md,
  MONSTER-WAVES.md, CONTESTS.md, MEASUREMENT.md, DIRECTIVES.md is
  EMPTY — unchanged since r241's read, which stands. Canon: two
  pools never mix; ruin medicines ease/cure as labeled; radiation
  is pellet cost, no pill touches it. The death record says "a
  stranger", never "an alien"; Q2 stays OPEN, Steve's call.

## Base movement since r241 (c6e738028 -> 3fdd5bc21)

src/js diff is behavior-thin; the bulk is evidence corpora. The
changes that can move the crisis panel:

- 6f614ce66 / 11f9e87ca (r241 fixes themselves): mime-walk 6-variant
  pool + Wren cache-note 6-variant pool. Both deterministic, no new
  RNG draw, variant 0 = original line verbatim — trajectory-neutral
  by construction; this panel re-verifies in the wild.
- 476f43e1d (journey-establishment r240): walkHome names the first
  homeward refusal + clearableBlocked; travelHome84 prefers it.
  game.js (+25). TRAVEL-HOME behavior change — WALKHOMe watch this
  run (any stranded/looped homeward travel is a FINDING).
- 8747d1bcd (journey-scale r242): tableSitting() — the r233-owed
  tableActive distinction (mercy is not a live sitting). table.js
  (+24). TABLEACTIVE watch (descriptive): mercy/table lines on the
  crisis band are expected vacuous — no village reached the table
  on r240/r241. Any mercy/table line is reported, not judged.
- a9a4108fe + 1032897dc (sim-partysize4-b): PARTYSIZE4 lever —
  dawn third-companion pick + depart mirror quad launch. ENV-GATED
  OFF by default (PARTYSIZE4=1). The main panel runs default (what
  ships); the PS4 side-arm (below) is the discriminating read.
- 83db8255f (sim-partyquads-b): partyQuads counter bump re-land
  (counter only, no behavior).
- a519253b9 (sim-foodgate-instr-a): food-gate instrumentation on
  the field-fight record — engine-side flags only, NO behavior
  change.
- f2eb8d9eb / 3523b2303 (sim-ladderbase-cause-a): sanctity-gate rig
  + lingering-vs-raid control regression test — TEST/RIG ONLY, no
  game code. No ladderbase behavior watch on the game side; the
  rig fix makes the ladder-bundle CONTROL honest for other loops.
- sim-wildavoid-seedplan-b commits (5c1f96f15 et al.): evidence /
  instrument only, no src/js change. WILDAVOID stays env-gated OFF
  by default; the r241 UNMEASURED verdict stands (no instrument).
- sim-fieldcarrier-a / -confirm-a: instrumentation + pilot NO-GO
  THIN-POOL; no behavior change on the default base.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled
  2026-11-14 13:18 CST the medicine trio needs more complexity, a
  richer layered design is owed. The RUINROAD arm stays parked
  this run.

## Leg question (carried from crisis r241, updated for the base)

**Do r241's verdicts hold on the new base — walkHome refusal
naming, the tableActive distinction, r241's own dialogue pools —
and does the PARTYSIZE4 substrate reach the crisis band, where
launches are scarce and 2/5 r241 seeds never seeded a plan?**
Threads (r241's 1–26 carried, updated where noted):

1. DRY3 CONFIRM (continued): 0 dry lines on the three r235 fixed
   surfaces. Any dry line is a REGRESSION of the r235 fix, filed
   LOUD with a fix in-run if the cause is local.
2. DRY2 CONFIRM (continued): 0 dry lines on the three r234 fixed
   surfaces. Any dry line is a REGRESSION of the r234 fix, filed
   LOUD.
3. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201–r241. Any dry line on a NEW
   surface names the next fix.
4. C3b SETTLED-FAVOR CONFIRM — SECOND WILD PANEL for the r240 fix:
   a broken favor whose need is still live must NEVER be called
   done/square/settled. r241 was GO-vacuous (0 gated lines fired).
   This panel spot-checks every "settled" line the same way; any
   false settlement is a REGRESSION of the r240 fix, filed LOUD.
   0 served again is a coverage note, not a confirmation.
5. C3c CLOSED (r228 harness verdict). Any resume opener naming a
   favor that changed since planting is a REGRESSION of the r228
   fix, filed LOUD.
6. C3d CONFIRM (continued): a "Nothing important" recap with live
   business is a REGRESSION of the r231 fix, filed LOUD.
7. NODEAWAY PANEL METRIC (tracked, no bar): r241: 11 / 6 / worst-3;
   r240: 19 / 10 / worst-4; r238: 16 / 9 / worst-5. Descriptive
   against the base movement, never lever attribution with n=5.
8. FUNERAL-MEND CONFIRM (r216 F1, r223–r241 GO): any over-claim
   line is a REGRESSION, filed LOUD.
9. STAGE-0 SURFACING WATCH (descriptive): a second sitting with
   dlg:help never offered graduates to a fix item.
10. DEATHCLEANUP WATCH (measurable since r238): any dead-holder
    winPlan entry lingering at census is a FINDING; planSeeds == 0
    with entries present is a FINDING.
11. NONDEATHPLAN WATCH (descriptive): any winPlan entry for a
    removed villager lingering at census is a FINDING.
12. TITAN-REFUSAL CONFIRM (binding this run): refusal lines per
    titan per day ≤ 1 (r233 fix). Any repeat on the same titan-day
    is a REGRESSION of the r233 fix, filed LOUD. Zero lines with
    zero 'refused' outcomes is vacuous-explained.
13. DEFERRED-ASK WATCH (descriptive): any dlg:help 'already
    handled' about a settled favor while a live need waits is a
    REGRESSION of the r231 fix, filed LOUD.
14. HOMEBODYVOICE + NOTICKDEFER: RETIRED to descriptive-only per
    r241 metric review (third consecutive vacuous panel). Reported,
    never judged. Re-instrument only if a later base change makes
    them discriminating again.
15. TRIODROUGHT WATCH — MAIN PANEL expects 0 by construction:
    PARTYSIZE4/VETREENGAGE are env-gated OFF, so no second/third
    companion is picked and partyTrios stays 0 (r241: 0 on every
    seed). The discriminating read is the PS4 side-arm below, not
    the main panel.
16. REL-MOURN WATCH (descriptive): any mourning line wearing a
    wrong/different name is a REGRESSION of the r231 fix, filed
    LOUD.
17. MUSTER-GROWTH WATCH (descriptive): dawn muster-growth lines —
    do they fire, and name the right fire/commit?
18. HOLDERVoice WATCH (descriptive): holder-half lines ("stays
    home") vs companion lines ("never leaves Haven") per seed.
19. POCKET WATCH (descriptive): any sortie fight breaking with the
    party unable to reach the monster is a FINDING. "No path
    there." lines are travel noise, no bar.
20. TRAILTALK WATCH (descriptive): any verbatim repeat of the same
    trail-talk line 3×+ in one outing is a REGRESSION of the r236
    fix, filed LOUD.
21. FIGHT-1 WATCH (descriptive): okSorties / cleared /
    multiMonsterCleared vs r241 (23/20/15 of 17); a cleared
    fight-1 with vTaken >= 70 is the standing Q4 live-play
    confirmation trigger.
22. FLEEREPAIR3 / WILDAVOID watches: STILL UNMEASURED — no
    instrument exists (r241 metric review 3). The prereg claim is
    not an instrument; this run does not judge them and does not
    claim 0 parting hits / 0 outmatched-avoids. Any
    parting-hit-shaped anomaly in the muster rows is reported
    descriptively only.
23. CRISIS REGRESSION: raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and villages bend or
    break the same way (r241: 4/5 game-over, median 122d; r240:
    4/5, median 133d)? Descriptive watch.
24. R241 BLEMISH RE-CHECK (conditional): the mime-walk and Wren
    fixes landed on this base — the panel re-checks both surfaces
    in the wild (mime variant rotation across days; Wren note
    variety across drops). Any same-variant mime 3 days running
    is a REGRESSION of the r241 fix; any Wren note reprinted 5×+
    on one seed is a REGRESSION of the r241 fix. Both filed LOUD.
    Doubt-stonewall 3×+ VERBATIM in one sitting graduates to a
    fix item (r240: 4× honest escalation, left out). Voted case
    re-appearing under a new number; resume-opener quote SPLIT
    across two entries — watch both.
25. WALKHOMe WATCH (new, descriptive): travel-home refusal naming
    (476f43e1d). Any homeward travel that strands, loops, or
    narrates a refusal the game cannot clear is a FINDING.
26. TABLEACTIVE WATCH (new, descriptive): mercy-is-not-a-sitting
    (8747d1bcd). Expected vacuous on the crisis band. Any
    mercy/table line is reported, not judged.

NOT this run: the RUINROAD forced-search arm. Cumulative 0/316
(r241 panel: 1 ruin search, 0 med items; cumulative now 0
acquisitions in 316 ruin searches) is a PROVEN constraint;
re-running the arm with no lever landed would re-prove it (Steve
2026-11-01 rebuke). The supply question lives with the medicine
build brief.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14541–14545. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) — zero hits for 14541, 14542, 14543, 14544, 14545 as
  seeds. Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208; 99351–99358;
  99401–99412): no intersection. Collision notes (carried):
  14531–14535 r241. 14521–14525 r240. 14511–14515 r238.
  14501–14505 r230. 14491–14495 r229. 14481–14485 r228.
  14471–14475 r223. 14461–14465 r216. 14451–14455 r208.
  14441–14445 r201. 14431–14435 r192. 14421–14425 r182/r186.
  14411–14415 r181. 14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14541–14545,
  sequential. PILOT FIRST (§9): seeds 14541–14543 run first; the
  panel expands to 14544–14545 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the
  answer.
- Smoke first: SEED=14541 DAYS=5 into the r244 evidence dir,
  driver runs, no instrumentErrors, stranger counters present.
- Driver: r241 driver verbatim EXCEPT r244 filenames/paths/seeds
  (14541–14545), ORIGINS map keys, EVID path 2026-11-18, DAYS 150.
  The r241 instruments ride along unchanged (TITAN-OUTCOME census
  snapshot, HOMEBODY day-boundary scan, NOTICKDEFER day-boundary
  scan, DEATHCLEANUP census). RUINROAD env stays OFF (arm parked,
  see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r244 seeds (r201 hygiene carried).
- Analyzer: r241 analyzer verbatim EXCEPT r244 filenames/paths.
  Validated on r241's per-seed JSONs before the panel: carried
  numbers reproduce (panel table + NODEAWAY 11/6/worst-3).
- EVID (goal hidden_files): evidence/2026-11-18/ for per-seed
  JSONs + transcripts; repo evidence/2026-11-18/ holds the prereg,
  run note, and gate log (committed).

## Side-arm PS4 — PARTYSIZE4 reach on the crisis band (descriptive, not §15)

- Same driver, same 3 pilot seeds (14541–14543), env
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1` — the substrate the
  partysize4 pilot ran on (second companion needs VETREENGAGE;
  third needs PARTYSIZE4; FLEEREPAIR2 is the pilot's plan-seeding
  substrate). Separate EVID subdir `evidence/2026-11-18/ps4/`
  (same filenames, no overwrite). Analyzer runs on that dir.
- Question: does any trio/quad fire on the crisis band with the
  substrate on? The partysize4 pilot fired quads 11/11 on a
  launch-rich band; r241's crisis band launched almost no plans
  (2/5 seeds never seeded one). 0/3 here is a reach finding about
  the launch drought, not a lever failure; any quad/trio is the
  reach confirmed. NOT a §15 comparison (no frozen bars, n=3,
  trajectories diverge at first plan) — descriptive only, never
  lever attribution.
- The side-arm runs AFTER the main panel (same seeds, sequential
  processes — never two harnesses in one process, never parallel
  jest/sim under load).

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel;
  other-surface dry lines reported with pick attribution, no bar.
  Any dry line on a NEW surface is the next fix item, named in
  the run note.
- DRY3 CONFIRM (binding this run): 0 dry lines on the three r235
  fixed surfaces. Any dry line is a REGRESSION of the r235 fix.
- DRY2 CONFIRM (binding this run): 0 dry lines on the three r234
  fixed surfaces. Any dry line is a REGRESSION of the r234 fix.
- Q6 RETIRED (r201 metric review): descriptive-only.
- C1 (bend, not break) GO: every game-over has a named cause that
  is NOT a siege-mechanic failure; horizon reachable on at least 1
  seed is descriptive, not a bar. A softlock seed is reported
  separately.
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
- C3b SETTLED-FAVOR CONFIRM — SECOND WILD PANEL (binding this
  run): every "settled" close line fires only on a sitting that
  shared a real beat with the favor it names, AND a broken favor
  whose need is still live is never called done/square/settled.
  Spot-check each one. Any false settlement is a REGRESSION of
  the r240 fix, filed LOUD. 0 served is a coverage note, not a
  confirmation.
- C3c CLOSED: see thread 5. Any resume opener naming a changed
  favor is a REGRESSION of the r228 fix, filed LOUD.
- C3d CONFIRM (binding this run): every recap served while a
  favor/want is live on the table names that want; a "Nothing
  important" recap with live business is a REGRESSION of the r231
  fix, filed LOUD. "Nothing important" with nothing open is honest
  and recorded, not judged.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across
  all driven transcripts.
- C7b GO: buried list reported per seed; corpse-cause counts
  reported for famine/disease/wound/thirst.
- S1–S5 SUPPLY: NOT RUN this panel (RUINROAD parked). Cumulative
  stays 0/316, carried as the standing number; the supply question
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
  wins/losses vs r241's arena-death say lines, no bar. No
  win/loss instrument exists — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend + funeralMendStats counters per seed; any silent mend,
  silent shortfall, or over-claim line is a FINDING (over-claim =
  r216 F1 REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer; gorge nights and sortie shape vs r241.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r241's 11/6/worst-3 and r240's 19/10/worst-4. A repeat at
  r241's scale keeps the muster-vs-travel tension a design
  question; movement is reported descriptively against the base
  movement, never lever attribution with n=5.
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
- HOMEBODYVOICE / NOTICKDEFER (descriptive-only, retired): picks
  vs voice lines reported; never judged.
- TRIODROUGHT WATCH (main panel: 0 expected by construction;
  PS4 arm: the discriminating read): partyTrios / partyQuads per
  seed + launched-party sizes. Any trio/quad on the PS4 arm is
  the reach confirmed; 0/3 is a reach finding about the launch
  drought.
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
- WALKHOMe WATCH (descriptive — new): any homeward travel that
  strands, loops, or narrates an unclearable refusal is a FINDING.
- TABLEACTIVE WATCH (descriptive — new): any mercy/table line is
  reported, not judged; expected vacuous.
- R241-FIX RE-CHECK (binding this run): mime variant rotation
  across days; Wren note variety across drops. Same-variant mime
  3 days running is a REGRESSION of the r241 mime fix; a Wren
  note reprinted 5×+ on one seed is a REGRESSION of the r241
  Wren fix. Both filed LOUD with a fix in-run if the cause is
  local.
- Interesting finding (panel triggers): any medicine acquisition
  on the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2- or DRY3-fixed surface (DRY2/DRY3 regression); reproduction
  of any r241 blemish at its graduation bar (doubt-stonewall 3×+
  VERBATIM in one sitting; voted case re-appearing under a new
  number); resume-opener quote SPLIT across two entries (the real
  defect, not the ellipsis-cap shape); any dead-holder winPlan
  entry at census; any homebody voice line naming a wrong block;
  any titan refusal repeat on the same titan-day; any deferred
  pick launching the same day; any fight narrated as stuck /
  unreachable in the transcript read, or any sortie fight breaking
  with the party unable to reach the monster; any trail-talk line
  repeated 3×+ in one outing; any trio/quad on the PS4 arm
  (TRIODROUGHT movement); any homeward travel strand (WALKHOMe).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance. The units question (r240 metric
  review 3, r241 metric review 8) stays open: report per-seed
  values + the 5-seed sum and judge the per-seed range against
  the implied historical per-seed range.

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r241:
(1) C3b on the r241 panel was vacuous (0 gated lines fired) — the
wild confirmation is still owed; this panel counts qualifying
settled-favor lines served, not just false settlements. (2)
HOMEBODY and NOTICKDEFER retired to descriptive-only after a
third consecutive vacuous panel. (3) FLEEREPAIR3 and WILDAVOID
were preregistered as "read from existing fields" but no such
fields exist — any run that wants to judge them must build the
instrument first. (4) The partytrios bump does not reach the
crisis band on the default base (partyTrios 0 on every measured
seed; the bump's own pilot passed on its own band) — the PS4
side-arm is this run's discriminating read; the main panel's 0
is expected by construction (flags off). (5) Deathcleanup census
is partial on this band: 2/5 r241 seeds have null winPlan stats
(no plan ever seeded there). (6) The r240 player-side "we're
square" option question (r240 metric review 2) is carried
unchanged: the NPC side is honest; the player can still claim
"we're square" with a live need. Design question, not a false
claim by the game. (7) The invite-decline "Another time. The
village needs me here." has no re-ask variant — identical twice
in one sitting. Polish, not a defect. (8) Telemetry baseline
units (crisis.json): sum or mean? Still open. Per-seed defended
fights on this panel are reported below; the units question
stays open for the next run. (9) The rotation file disagreed
with the r241 adoption's "verified 7" claim (file reads 6,
mtime 00:43Z) — the closeout must read the file back after
writing 7.
