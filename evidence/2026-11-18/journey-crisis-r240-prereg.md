# Journey crisis r240 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r236
read 5, played 5, wrote 6 at closeout (Nov 18). This run plays crisis
and writes 7 (succession next) at closeout. Run number: r240 follows
crisis r238 (Nov 17) in the global journey sequence (r236 social,
r237 endgame, r238 crisis, r239 endgame + scale — two lanes both
logged r239; this run takes the next free number, r240).
Base: master 29b36f16b (journey-landing r144 adoption closeout).
Lock: playtest-loop-2.lock run_id 2026-11-18T12:56:29Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- STALE-LOCK RECOVERY: the lock at run start (run_id
  2026-11-18T12:02:19Z, 53 min old) had NO registry entry — grep of
  REGISTRY.json for that run_id returned 0 hits. Per the body rule
  (no registered tree / no heartbeat = DEAD no matter how fresh the
  lock), the lock was deleted and a new one created. The only
  journey2 entry with a fresh heartbeat (journey2-5, hb 12:54:25Z)
  belongs to a DIFFERENT run_id (2026-11-18T09:58:34+00:00), status
  done-merged, worktree directory already removed — a leftover
  hbloop still ticking on a released tree, not a live run. Noted,
  not chased.
- Main tree dirty at first check (66 entries — Lane A r144 landing
  in progress: staged r236→r144 evidence renames + MM
  src/js/favor-forage.js + M src/js/game.js). Per the body rule
  (sibling mid-landing: wait 10m, re-check), waited 540s; re-check
  0 dirty. Lane A landed (HEAD 29b36f16b) during the wait.
- `git pull --ff-only`: "Already up to date" (master 29b36f16b).
- Disk 50%.
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-saycap-a,
  sim-siegedialog-a, sim-inffight-ab, sim-fleerepair2-b): never
  auto-removing, not mine to touch.
- Registration: clean, first attempt, onto master 29b36f16b; took
  ~3 min (registry-flock queue behind siblings). Heartbeat
  immediately after registration; re-heartbeat before each major
  phase (pilot, each panel seed, gate, landing). No background
  heartbeat loop (the runtime reaps long-lived backgrounded exec
  sessions — r234/r235 precedent). The tree is dirty once work
  starts, and the reaper never auto-removes dirty trees — second
  line of defense, not a substitute.
- Flap watcher: not checked this run (probe + watchdog cron own it).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md re-read this run.
  `git log 3d0f5770c..HEAD` on CANON.md, DISEASES.md,
  CONVERSATIONS.md, ALIEN-PLAYERS.md, MONSTER-WAVES.md, CONTESTS.md
  is EMPTY — unchanged since r238's read, which stands. Canon: two
  pools never mix; ruin medicines ease/cure as labeled (r181 fix
  native); radiation is pellet cost, no pill touches it. The death
  record says "a stranger", never "an alien"; Q2 stays OPEN,
  Steve's call.

## Base movement since r238 (3d0f5770c -> 29b36f16b)

src/js diff is 7 files, +412/-13 — all dialogue-adjacent, fight
engine, muster/party, or win-plan cleanup:

- sim-notickexact-a (5fe00c196): exact-population no-tick deferral —
  part-3 party_launch held only for wave-4 targeted plans (target
  set, needWave >= 4); proof 27/27. villager-brain.js. Launch
  surface: a part-3 pick that could never depart no longer strands
  the holder. NOTICKDEFER WATCH this run (descriptive): deferred
  picks per seed; any deferred pick that launches the same day
  anyway is a FINDING (deferral leak).
- sim-triodrought-b (f0c6869b6): restore writeCommit companion2/3
  carry (finding #2518); proof 12/12. villager-brain.js. Party
  surface: a dawn pick's second/third companion now survives to
  depart. TRIODROUGHT WATCH this run (descriptive): partyTrios
  from winPlanStats + launched-party sizes vs r238.
- journey-succession r232 (ef7e6d86c): relationship-aware mourning
  lines (REL-MOURN) [needs-eyes]. convoTopics.js. C3 naming
  surface: mourning lines now name the relationship. REL-MOURN
  WATCH this run: any mourning line wearing a wrong/different name
  is a REGRESSION of the r231 fix, filed LOUD.
- journey-deepening r236 (0bc7ccd84): muster-growth dawn line — a
  short muster now says what a re-sounded call would bring
  [needs-eyes]. titans.js (+155), game.js. Muster surface.
  MUSTER-GROWTH WATCH this run (descriptive): do the dawn lines
  fire, and do they name the right fire/commit?
- sim-holdervoice-b (c3cbd100e): holder-half voice line, finding
  #2505 — GO (25/25 pairs voiced, B4 byte-identical) [needs-eyes].
  villager-brain.js. Voice surface: the holder half of the same
  silence. Counted beside homebody picks (see HOMEBODYVOICE).
- sim-fleerepair2-b (59439c437): FLEEREPAIR2 seed gate (finding
  #2500) + instruments + proof. win-plan.js (+21). Flee surface:
  the win-plan dies on a flee repair path. NONDEATHPLAN WATCH
  carries it (removalCleanups per seed).
- sim-aguard-a (7f9ff9c94): shared firstNameOf guard, finding #2509
  — GO (42/42 proof, 0 bare-A live, B3 byte-identical)
  [needs-eyes]. Naming surface: descriptor names ("A man, maybe
  20s") no longer print as bare "A". C3 naming watch carries it.
- journey-social-life r236 (32c62cd76): TRAILTALK fix [needs-eyes]
  — trail-talk pools 2→6 lines, no-repeat-until-exhausted per
  outing (talkUsed); proof 30/30. favor-forage.js (+45),
  conversation.js, convo-dialogue.js, truth.js. Dialogue surface:
  outings happen on the crisis leg too. TRAILTALK WATCH this run:
  any verbatim repeat of the same trail-talk line 3×+ in one
  outing is a REGRESSION of the r236 fix, filed LOUD.
- journey-landing r144 (cc35d76b9 + evidence 80128cad6/29b36f16b):
  pocket repair — startCombat no longer strands the player in a
  1-cell pocket; proof 8/8, 14/14. game.js (+6). Fight surface.
  POCKET WATCH this run: any fight with ≥3 stuck turns
  (move-refusals) is a FINDING; pocketFights counted in FIGHT-1.
- build.js: version bumps only. No behavior.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled
  2026-11-14 13:18 CST the medicine trio needs more complexity, a
  richer layered design is owed. The RUINROAD arm stays parked
  this run.

## Leg question (carried from crisis r238)

**Do r238's verdicts hold on the new base — and does the r235 DRY3
fix hold in the wild on the crisis leg, with notickexact,
triodrought, REL-MOURN, holdervoice, muster-growth, and the pocket
repair behaving clean under crisis deaths?** Threads:

1. DRY3 CONFIRM (continued): r235's three fixes land on the crisis
   leg's D1 surface. Any dry line on one of the three fixed
   surfaces (expedition-ask answer, place-ask answer, lesson line
   after a convoWouldBlock pre-check) is a REGRESSION of the r235
   fix, filed LOUD with a fix in-run if the cause is local.
2. DRY2 CONFIRM (continued): r234's three fixes held at 0 dry on
   r230's and r238's 40 transcripts. Any dry line on one of the
   three DRY2 surfaces (ask: composed topic line; probe stonewall
   repeat; confront line) is a REGRESSION of the r234 fix, filed
   LOUD.
3. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201, r208, r216, r223, r228,
   r229, r230 and r238. This panel re-runs the same driven
   transcripts on fresh seeds; any dry line on a NEW surface names
   the next fix.
4. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix + r225's F5 settled-favor variants are native
   now; this panel spot-checks every "settled" line — the fixes must
   hold at 0 false settlements.
5. C3c CLOSED (r228 harness verdict): the stale-favor resume-opener
   watch is no longer open. The panel still records resume openers;
   any opener naming a favor that changed since planting is a
   REGRESSION of the r228 fix, filed LOUD. No separate harness.
6. C3d CONFIRM (continued): r231's fix names the live want when the
   thread log is empty. Any recap reading "Nothing important" (or
   equivalent) while a favor/want is live on the table is a
   REGRESSION of the r231 fix, filed LOUD with a fix in-run if the
   cause is local. A "Nothing important" recap with nothing open
   stays honest and is recorded, not judged.
7. NODEAWAY PANEL METRIC (tracked, no bar): nodeAway exclusions
   across refusals + alive-bench refusals + worst single bench
   snapshot, per seed. r238: 16 / 9 / worst-5 (14512 d64); r230: 4 /
   3 / worst-2; r229: 0 / 0 / 0; r228: 38 / 9 / worst-7. No bar —
   descriptive against the base movement (notickexact deferral,
   triodrought carry, muster-growth line), never lever attribution
   with n=5. The metric needs an alive bench to mean anything
   (r229 metric review 11).
8. FUNERAL-MEND CONFIRM (r216 F1, r223 GO, r228 GO, r229 GO, r230
   GO, r238 GO): the partial-payment honest line must hold in the
   wild — any over-claim line is a REGRESSION, filed LOUD.
9. STAGE-0 SURFACING WATCH (r230 surface): any stage-0 ask_favor
   want with a live need that sits a full sitting with dlg:help
   never offered is recorded; a second sitting graduates to a fix
   item.
10. DEATHCLEANUP WATCH (measurable since r238): deathCleanups +
    removalCleanups + planSeeds stats per seed; winPlan census per
    seed (entries, holder alive/dead, stage, party size). Any dead
    villager's winPlan entry lingering at census is a FINDING;
    planSeeds == 0 with entries present is a FINDING; firstPlanDay
    the day after a death with zero cleanups is a FINDING (the
    ignition shape sim-deathcleanup-b's correction closed).
11. NONDEATHPLAN WATCH (descriptive): removalCleanups stat per seed;
    any winPlan entry for a removed (left/fled/betrayed) villager
    lingering at census is a FINDING. Now also carries the
    fleerepair2-b seed gate (win-plan dies on a flee repair path).
12. TITAN-REFUSAL WATCH (PROMOTED to CONFIRM — instrument closed
    this run, r238 metric review 9): the r233 fix says the refusal
    line once per titan per day; the driver now snapshots
    `state.titans.outcomes` at census, so refusal lines are judged
    against real calls. Any repeat refusal line on the same
    titan-day is a REGRESSION of the r233 fix, filed LOUD. Zero
    lines with zero 'refused' outcomes is vacuous-explained, not a
    miss — the outcomes table is the denominator.
13. DEFERRED-ASK WATCH (continued, descriptive): any dlg:help answer
    of 'already handled' about a settled favor while a live need
    waits is a REGRESSION of the r231 fix, filed LOUD.
14. HOMEBODYVOICE WATCH (PROMOTED to measurable — instrument closed
    this run, r238 metric review 10): the driver now scans
    `vbrain.commit` at each day boundary for party_launch picks
    and records the companion's npcMaxDist beside each pick, so
    voice lines are judged against qualifying picks. A qualifying
    pick (companion range-0) unvoiced for a NEW (holder, companion)
    pair is a FINDING; re-picks of an already-voiced pair are
    silent BY DESIGN (dedup map) and are not counted against the
    voice. A voice line naming a wrong block is a FINDING. The
    pick count is a LOWER BOUND: the commit map holds only the
    latest commit per holder, so same-day re-picks of a different
    companion are undercounted (stated in the run note).
15. NOTICKDEFER WATCH (new, descriptive): deferred party_launch
    picks per seed (vbrain.logs entries with
    deferred='party_launch:no-tick-exact'), deduped by day|vid.
    Does the deferral fire on the crisis band (wave-4-targeted
    plans only)? Any deferred pick that launches the same day
    anyway is a FINDING (deferral leak). Read beside NODEAWAY and
    FIGHT-1.
16. TRIODROUGHT WATCH (new, descriptive): partyTrios from
    winPlanStats + launched-party sizes vs r238; companion2/3
    carry restoring means trios should be observable where the
    panel launches them.
17. REL-MOURN WATCH (new, descriptive): mourning lines name the
    relationship (r232). Spot-checked in the full transcript read;
    any mourning line wearing a wrong/different name is a
    REGRESSION of the r231 fix, filed LOUD.
18. MUSTER-GROWTH WATCH (new, descriptive): dawn muster-growth
    lines — do they fire, and do they name the right fire/commit?
19. HOLDERVoice WATCH (new, descriptive): holder-half lines ("stays
    home") counted beside companion lines ("never leaves Haven")
    and homebody picks.
20. POCKET WATCH (revised, descriptive): "No path there." lines are
    TRAVEL NOISE, not a pocket count — the line fires on any failed move
    (game.js:14811, 37560), in or out of combat, and r238's panel already
    carries 100+ per seed, so the raw count cannot distinguish a pocket
    fight from ordinary pathing. The section reports the count as a
    descriptive baseline only (no bar). The pocket watch proper is the
    fight-outcome + transcript read: any sortie fight breaking with the
    party unable to reach the monster is a FINDING. The r144 stuck-turn
    counters live in the competent policy's fight hook, which this leg's
    oracleV2 driver does not use — no fight-level stuck counter exists
    here, and building one is out of scope for this run.
21. TRAILTALK WATCH (new, descriptive): trail-talk lines on
    outings — any verbatim repeat of the same line 3×+ in one
    outing is a REGRESSION of the r236 fix, filed LOUD.
22. FIGHT-1 WATCH (continued, descriptive): okSorties / cleared /
    multiMonsterCleared vs r238 (26/15/10 of 16); a cleared
    fight-1 with vTaken >= 70 is the standing Q4 live-play
    confirmation trigger.
23. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and do the villages bend
    or break the same way (r238: 3/5 game-over, median 135d;
    r230: 4/5, median 138d)? Descriptive watch: funeral-mend
    lines under FUNERALMEND (ON), CASCADE's effect on scholar
    deaths to lingerers, arena-fight outcomes under the Reunion
    re-tune (HP x0.4 / damage x0.6, mirror cap 1).
24. R238 BLEMISH REPRODUCTION (conditional fix items): (a)
    doubt-stonewall line repeating verbatim 3×+ in one sitting
    (r238: 7× across two sittings on 14511) — if it repeats 3×+
    in one sitting here, it graduates to a fix item; (b) Wren
    cache note repeating verbatim 9× on one seed — if it repeats
    5×+ on one seed here, it graduates; (c) "They mime walking"
    same-variant 3 days running — if it repeats 3× in a row here,
    it graduates; (d) ambush case renumbering (case_4 voted
    guilty d17, same ambush re-appears as case_6 d18) — watch
    whether a voted case re-appears under a new number; (e)
    resume-opener quote capped mid-sentence with '…' — watch for
    the SPLIT-defect shape (a quote broken across two transcript
    entries), which is a different, real defect.

NOT this run: the RUINROAD forced-search arm. Cumulative 0/314
(r186 0/151 + r192 0/150 + r229 0/5 + r230 0/2 + r238 0/6) is a
PROVEN constraint; re-running the arm with no lever landed would
re-prove it (Steve 2026-11-01 rebuke). The supply question lives
with the medicine build brief — lever (h) duty-holder scavenging
first, richer layered design owed per Steve 2026-11-14. If a lever
lands, a later crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14521–14525. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) and goal hidden_files preregs: zero hits for 14521,
  14522, 14523, 14524, 14525 as seeds. Forbidden bands named in
  preregs (73641–73648, 73671–73678; 99201–99208; 78201–78208;
  99351–99358; 99401–99412): no intersection. Collision notes
  (carried): 14511–14515 r238. 14501–14505 r230. 14491–14495 r229.
  14481–14485 r228. 14471–14475 r223. 14461–14465 r216.
  14451–14455 r208. 14441–14445 r201. 14431–14435 r192.
  14421–14425 r182/r186. 14411–14415 r181. 14401–14405 r180.
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14521–14525,
  sequential. PILOT FIRST (§9): seeds 14521–14523 run first; the
  panel expands to 14524–14525 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14521 DAYS=5 into the r240 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r238 driver verbatim EXCEPT r240 filenames/paths/seeds
  (14521–14525), ORIGINS map keys, EVID path 2026-11-18, DAYS 150,
  PLUS the R240 INSTRUMENTS (close r238 metric-review items 9–10 —
  read-only):
  (a) TITAN-OUTCOME: at census, snapshot
  `Game.state.titans.outcomes` (array of {titan, day, outcome,
  detail}) into rec.census.titanOutcomes. Pure read; the array is
  append-only game log, no RNG, no behavior.
  (b) HOMEBODY PICKS: at each day boundary, scan
  `Game.state.village.vbrain.commit` for entries with
  winPlanAction 'party_launch' and a companion; record {day,
  holder, companion, companionMaxD: Game.npcMaxDist(companion),
  holderMaxD: Game.npcMaxDist(holder)} into rec.homebodyPicks,
  deduped by holder|day|companion. Pure reads (npcMaxDist is a
  range-profile read); the voice-line side is counted from
  sayLines ("never leaves Haven" companion line, "stays home"
  holder line). LOWER BOUND by construction (commit map holds
  only the latest commit per holder).
  (c) NOTICKDEFER: at each day boundary, scan
  `Game.state.village.vbrain.logs` for entries with
  winPlanAction 'party_launch' and
  deferred='party_launch:no-tick-exact'; record {day, holder}
  into rec.deferredPicks, deduped by day|holder. Pure read.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r240 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r238 analyzer verbatim EXCEPT r240 filenames/paths,
  PLUS the R240 sections (TITAN-OUTCOME, HOMEBODY, NOTICKDEFER).
  Validated on r238's JSONs before the panel: carried numbers
  reproduce (panel table + NODEAWAY 16/9/worst-5); the new sections
  print absent/null on old data, which carries no fields.

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
- C3b SETTLED-FAVOR CONFIRM (binding this run): every "settled"
  close line fires only on a sitting that shared a real beat with
  the favor it names (favor itself done: fulfilled / thanked).
  Spot-check each one. Any false settlement is a REGRESSION of the
  r201 fix, filed LOUD with a fix in-run if the cause is local.
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
  stays 0/314, carried as the standing number; the supply question
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
  wins/losses vs r238's 11 arena-death say lines, no bar. No
  win/loss instrument exists (no engine counter; say lines only
  narrate arena deaths) — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r238.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r238's 16/9/worst-5 and r230's 4/3/worst-2 and r229's 0/0/0
  and r228's 38/9/worst-7. A repeat at r238's scale keeps the
  muster-vs-travel tension a design question; a return toward
  r228's scale is reported as a descriptive against the base
  movement (notickexact / triodrought / muster-growth), never
  lever attribution with n=5.
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
- HOMEBODYVOICE WATCH (measurable this run): qualifying picks vs
  voice lines per seed. A qualifying pick unvoiced for a NEW pair
  is a FINDING; a voice line naming a wrong block is a FINDING.
- NOTICKDEFER WATCH (descriptive): deferred picks per seed; any
  deferred pick launching the same day is a FINDING.
- TRIODROUGHT WATCH (descriptive): partyTrios per seed vs r238;
  launched-party sizes.
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
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2- or DRY3-fixed surface (DRY2/DRY3 regression); reproduction
  of any r238 blemish at its graduation bar (doubt-stonewall 3×+
  in one sitting; Wren note 5×+ on one seed; mime-walking 3 days
  running; voted case re-appearing under a new number);
  resume-opener quote SPLIT across two entries (the real defect,
  not the ellipsis-cap shape); any dead-holder winPlan entry at
  census; any homebody voice line naming a wrong block; any titan
  refusal repeat on the same titan-day; any deferred pick launching
  the same day; any fight narrated as stuck/unreachable in the
  transcript read, or any sortie fight breaking with the party unable
  to reach the monster; any trail-talk line
  repeated 3×+ in one outing.

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance. Units check first: the r201 metric
  review notes succession.json stores per-seed means while
  telemetry-check.js sums — verify the crisis baseline's units
  before rolling anything (this run does not roll).

## Metric review section

Every run note carries one. No metric is re-scored mid-run; doubts
go there and revisions apply to the NEXT run. Open from r238:
(1) Q6 retired to descriptive-only (METRIC-BROKEN) — done r201.
(2) Dialogue-only fixes are NOT trajectory-neutral while voiceLine
draws RNG — pre/post trajectory comparisons stay descriptive.
(3) For supply-gated fixes, the unit test is the proof and the
panel is a regression check only. (4) Telemetry baseline units —
verify crisis.json units before any roll (carried; this run does
not roll). (5) The `want`-thread label is a function of the CURRENT
favor, but the topic ledger stores it as a snapshot — every consumer
that trusts the stored label can misname the favor after a change
(r208 lapse fixed; settled-line gate bypass fixed; resume openers
read L.open[].label directly — C3c watches them). (6)
Median-death-day movement is a panel-level descriptive, not a
per-change claim. (7) The funeral-mend public line is a SECOND
consumer of a stored-vs-live value (r216 metric review): any line
that states a number the mechanics computed proportionally must be
checked against the computed value, not the nominal one. (8)
Analyzer panel-wide dedupe maps must be seed-scoped (r216 F2).
(9) C3c close-out rule: the targeted harness judges the watch; a
panel with no qualifying case is no longer "UNMEASURED" once the
harness has spoken. (10) C3d promotion rule: a watch graduates to
CONFIRM when a fix for it lands (r231); the panel then judges the
fix in the wild. (11) The NodeAway panel metric needs an alive bench
to mean anything — a 0/0/0 panel on an empty-village band is
compositional, not a resolution. A future crisis run that wants to
judge the muster-vs-travel tension should check the bench is alive
before reading the metric. (12) Resume openers quote a stored line
— a truncation in the quote renders the "NPC:" prefix of the next
line inside the quote (14494 d28). The quote path should cap at a
sentence boundary, not a character count. (13) A watch graduates to
CONFIRM when a fix for it lands (DRY2, r234) — the panel then
judges the fix in the wild, and a miss is a REGRESSION, not a watch
sighting (same shape as rule 10). (14) The deathcleanup driver gap
(r230 metric review 5) is CLOSED by the r238 instrumentation —
deathCleanups + removalCleanups + planSeeds stats and a winPlan
census now ride in the driver record, so the watch is scored from
the panel instead of standing on the 42/42 proof alone.
(15) The arena watch still has no win/loss instrument — no engine
counter exists for arena outcomes; say lines only narrate arena
deaths. The watch stays a death count, not a win rate, until an
instrument is built. (16) DRY3 promotion rule — same shape as
rules 10 and 13: the r235 fix's three surfaces are judged in the
wild this run, and a miss is a REGRESSION of the r235 fix.
(17) NEW this run: the titan-refusal and homebodyvoice driver gaps
(r238 metric review 9–10) are CLOSED by the r240 instrumentation
— titan outcomes ride in the census, homebody picks ride in the
day-boundary scan — so both watches are scored from the panel
instead of standing on proofs alone. (18) NEW this run: the
homebody pick count is a LOWER BOUND by construction (commit map
holds only the latest commit per holder per day); same-day
re-picks of a different companion are undercounted. A
qualifying-pick count of 0 with 0 voice lines is vacuous, not a
voice failure; a qualifying pick unvoiced for a NEW pair is the
finding. (19) NEW this run: the notickexact deferred-pick counter
reads vbrain.logs, which roll at LOG_CAP 400 — the day-boundary
scan with a day|holder dedupe key is the guard against loss; a
deferred pick is only meaningful beside the launch it held.
