# Journey crisis r238 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r235
read 5, played 5, wrote 6 at closeout (Nov 17). This run plays crisis
and writes 7 (succession next) at closeout. Run number: r238 follows
crisis r230 (Nov 17) in the global journey sequence (r235 social,
r236 scale, r237 endgame since).
Base: master 3d0f5770c (sim-scale-onramp-round-2315 coordinator evidence).
Lock: playtest-loop-2.lock run_id loop2-20261118T015550Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 48%.
- `git pull --ff-only`: "Already up to date" (master 3d0f5770c).
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-seekgate-b,
  sim-holdervoice-b, sim-handoff-diag-a, sim-notick-a): never
  auto-removing, not mine to touch.
- Registration: clean, first attempt, onto master 3d0f5770c; took
  ~7.4 min (registry-flock queue behind siblings). Heartbeat
  immediately after registration; re-heartbeat before each major
  phase (pilot, each panel seed, gate, landing). No background
  heartbeat loop (the runtime reaps long-lived backgrounded exec
  sessions — r234/r235 precedent). The tree is dirty once work
  starts, and the reaper never auto-removes dirty trees — second
  line of defense, not a substitute.
- Flap watcher: not checked this run (probe + watchdog cron own it).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md + docs/CONVERSATIONS.md +
  docs/ALIEN-PLAYERS.md + docs/MONSTER-WAVES.md + docs/CONTESTS.md:
  `git log 39eaa043e..HEAD` on all six is EMPTY — unchanged since
  r230's read, which stands. Canon: two pools never mix; ruin
  medicines ease/cure as labeled (r181 fix native); radiation is
  pellet cost, no pill touches it. The death record says "a
  stranger", never "an alien"; Q2 stays OPEN, Steve's call.

## Base movement since r230 (39eaa043e -> 3d0f5770c)

src/js diff is 11 files, +589/-114 — all dialogue-adjacent, fight
engine, muster/party, or win-plan cleanup:

- journey-social-life r235 (9d5a45fcc): DRY3 fix [needs-eyes] +
  panel (r234's 4 dry servings at 3 new sites; proof 37/37 green,
  30/34 red on base). conversation.js, convo-dialogue.js,
  truth.js. Three sites, one mechanism: `sayLine` handed a line
  with no `convoWouldBlock` pre-check, its truthy dry-line return
  fooling the caller's "primary spoken" test. Directly on this
  leg's D1 surface. DRY3 CONFIRM this run — see metrics.
- sim-homebodyvoice-a (b7236b65f): voice the picked homebody who
  cannot launch (#2499) [needs-eyes]. villager-agency.js,
  villager-brain.js. Muster/travel surface: a picked companion who
  cannot launch now says so aloud instead of silently blocking.
  HOMEBODYVOICE WATCH this run (descriptive): does the voice line
  fire in the wild on this panel, and does it name the real block?
- sim-fightallycap-b (dded39f58): second ally slot in the fight
  engine (FIGHTALLY2), proof 22/22. fieldFights.js. Fight engine
  change: a second ally can now join a fight. FIGHT-1 WATCH this
  run (descriptive): okSorties / cleared / multiMonsterCleared vs
  r230 (22/21/18-19); no lever attribution with n=5.
- sim-packhunt-rec-b (a9afeb8a1): fold Pack Hunt harry total into
  HP recovery (finding #2497), proof 48/48. fieldFights.js.
  FIGHT-1 WATCH, same as above.
- sim-nondeathplan-b (446a96ef4 + a3a7be77c): win-plan dies on any
  removal (leave hook + fled-betrayer choke-point routing); proof
  64/64. win-plan.js. Deathcleanup's sibling: non-death removals
  now also clean winPlan. NONDEATHPLAN WATCH this run
  (descriptive): removalCleanups stat per seed; any lingering
  winPlan entry for a removed villager at census is a FINDING.
  (sim-nondeathplan-live-b b921fde4f is evidence/instrument only —
  no src change.)
- journey-landing r143 (3ba09cec4): spend already-confessed
  confront choice per sitting [needs-eyes]. betrayal.js, truth.js.
  C3 surface: a confessed confront choice is spent within the
  sitting. Double-confession watch continues (any recurrence is a
  guard failure, filed LOUD).
- journey-succession r231 (ec7abcd00): mourning lines stop wearing
  different names [needs-eyes]. convoTopics.js. C3 naming-stance
  surface: a fourth naming-stance wobble graduates to a fix item.
- sim-profilegate-b (39e8f10f4 + 0da095c78): lever + revert (NO-GO
  on B3); src/ back to master. Net zero on src.
- journey-crisis r230 (7eb8ffc22): this leg's own quote-aware
  pagination fix — already measured in r230 (DRY2 CONFIRM GO,
  proof 6/6). Carried, not re-judged.
- build.js: version bumps only (5168f824d, c5af0c082). No behavior.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled 2026-11-14
  13:18 CST the medicine trio needs more complexity, a richer
  layered design is owed. The RUINROAD arm stays parked this run.

## Leg question (carried from crisis r230)

**Do r230's verdicts hold on the new base — and does the r235 DRY3
fix hold in the wild on the crisis leg, with homebodyvoice,
fightallycap, and nondeathplan behavior clean under crisis
deaths?** Threads:

1. DRY3 CONFIRM (new, promoted): r235's three fixes land on the
   crisis leg's D1 surface. Any dry line on one of the three fixed
   surfaces (expedition-ask answer, place-ask answer, lesson line
   after a convoWouldBlock pre-check) is a REGRESSION of the r235
   fix, filed LOUD with a fix in-run if the cause is local. The
   r235 proof (37/37) is the unit proof; this panel is the wild
   confirmation.
2. DRY2 CONFIRM (continued): r234's three fixes held at 0 dry on
   r230's 40 transcripts. Any dry line on one of the three DRY2
   surfaces (ask: composed topic line; probe stonewall repeat;
   confront line) is a REGRESSION of the r234 fix, filed LOUD.
3. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201, r208, r216, r223, r228,
   r229 and r230. This panel re-runs the same driven transcripts
   on fresh seeds; any dry line on a NEW surface names the next fix.
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
   snapshot, per seed. r230: 4 / 3 / worst-2 (all 14501); r229:
   0 / 0 / 0; r228: 38 / 9 / worst-7. No bar — descriptive against
   the base movement (homebodyvoice / companionguard / march-join /
   muster policy / titan-refusal fix), never lever attribution
   with n=5. The metric needs an alive bench to mean anything
   (r229 metric review 11).
8. FUNERAL-MEND CONFIRM (r216 F1, r223 GO, r228 GO, r229 GO, r230
   GO): the partial-payment honest line must hold in the wild — any
   over-claim line is a REGRESSION, filed LOUD.
9. STAGE-0 SURFACING WATCH (r230 surface): any stage-0 ask_favor
   want with a live need that sits a full sitting with dlg:help
   never offered is recorded; a second sitting graduates to a fix
   item.
10. DEATHCLEANUP WATCH (now MEASURABLE — driver gap closed this
    run, r230 metric review 5): deathCleanups + removalCleanups +
    planSeeds stats per seed; winPlan census per seed (entries,
    holder alive/dead, stage, party size). Any dead villager's
    winPlan entry lingering at census is a FINDING; planSeeds == 0
    with entries present is a FINDING; firstPlanDay the day after
    a death with zero cleanups is a FINDING (the ignition shape
    sim-deathcleanup-b's correction closed).
11. NONDEATHPLAN WATCH (new, descriptive): removalCleanups stat per
    seed; any winPlan entry for a removed (left/fled/betrayed)
    villager lingering at census is a FINDING.
12. TITAN-REFUSAL WATCH (continued, descriptive): refusal lines per
    titan per day — the r233 fix says the line once per titan per
    day; repeats on the same titan-day are counted, not judged.
13. DEFERRED-ASK WATCH (continued, descriptive): any dlg:help answer
    of 'already handled' about a settled favor while a live need
    waits is a REGRESSION of the r231 fix, filed LOUD.
14. HOMEBODYVOICE WATCH (new, descriptive): picked-homebody voice
    lines per seed — do they fire when a picked companion cannot
    launch, and do they name the real block (range-0 / sick /
    hurt)? A voice line naming a wrong block is a FINDING.
15. FIGHT-1 WATCH (continued, descriptive): okSorties / cleared /
    multiMonsterCleared vs r230 (22/21/18 of 19); a cleared
    fight-1 with vTaken >= 70 is the standing Q4 live-play
    confirmation trigger.
16. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and do the villages bend
    or break the same way (r230: 4/5 game-over, median 138d;
    r229: 4/5, median 122d)? Descriptive watch: funeral-mend
    lines under FUNERALMEND (ON), CASCADE's effect on scholar
    deaths to lingerers, arena-fight outcomes under the Reunion
    re-tune (HP x0.4 / damage x0.6, mirror cap 1).
17. R230 BLEMISH REPRODUCTION (conditional fix items): (a) Ben's
    buried-cache beat repeating verbatim with a different amount
    (14502 d39 +1442 kcal, d46 +872 kcal) — if the same text
    repeats with a different amount on this panel, it graduates
    to a fix item; (b) tautological recap ("We started on X, then
    got onto X", A == B) — did NOT reproduce on r230; if it
    reproduces here, fix in-run.

NOT this run: the RUINROAD forced-search arm. Cumulative 0/308
(r186 0/151 + r192 0/150 + r229 0/5 + r230 0/2) is a PROVEN
constraint; re-running the arm with no lever landed would re-prove
it (Steve 2026-11-01 rebuke). The supply question lives with the
medicine build brief — lever (h) duty-holder scavenging first,
richer layered design owed per Steve 2026-11-14. If a lever lands,
a later crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14511–14515. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) and goal hidden_files preregs: zero hits for 14511,
  14512, 14513, 14514, 14515 as seeds. (An earlier broad grep hit
  pantry-kcal numbers like 145061 inside JSON corpora — those are
  kcal values, not seed reservations; the prereg-only search is
  clean.) Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208): no intersection.
  Collision notes (carried): 14501–14505 r230. 14491–14495 r229.
  14481–14485 r228. 14471–14475 r223. 14461–14465 r216.
  14451–14455 r208. 14441–14445 r201. 14431–14435 r192.
  14421–14425 r182/r186. 14411–14415 r181. 14401–14405 r180.
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14511–14515,
  sequential. PILOT FIRST (§9): seeds 14511–14513 run first; the
  panel expands to 14514–14515 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14511 DAYS=5 into the r238 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r230 driver verbatim EXCEPT r238 filenames/paths/seeds
  (14511–14515), ORIGINS map keys, EVID path 2026-11-17, DAYS 150,
  PLUS the R238 DEATHCLEANUP INSTRUMENT (closes r230 metric-review
  item 5 — read-only): at the day boundary, firstPlanDay is stamped
  the first day village.winPlan is non-empty; at census, the record
  carries winPlanStats (deathCleanups, removalCleanups, planSeeds,
  partyTrios, partyDissolved) and a winPlan census (per entry:
  holder, holderAlive, stage, party size). RUINROAD env stays OFF
  (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r238 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r230 analyzer verbatim EXCEPT r238 filenames/paths,
  PLUS the R238 DEATHCLEANUP section (per-seed stats + flags).
  Validated on r230's JSONs before the panel: carried numbers
  reproduce (panel table + NODEAWAY 4/3/worst-2); the new section
  prints absent/null on old data, which carries no fields.

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
  stays 0/308, carried as the standing number; the supply question
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
  wins/losses vs r230's 10 arena deaths, no bar. No win/loss
  instrument exists (no engine counter; say lines only narrate
  arena deaths) — the instrument gap carries.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r230.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r230's 4/3/worst-2 and r229's 0/0/0 and r228's 38/9/worst-7. A
  repeat at r230's scale keeps the muster-vs-travel tension a design
  question; a return toward r228's scale is reported as a descriptive
  against the base movement (homebodyvoice / companionguard /
  march-join / muster policy / titan-refusal fix), never lever
  attribution with n=5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants
  with a live need that sit a full sitting with dlg:help never
  offered, recorded per sitting; a second sitting graduates to a
  fix item.
- DEATHCLEANUP WATCH (now measurable): deathCleanups +
  removalCleanups + planSeeds stats per seed; winPlan census per
  seed; any dead-holder entry lingering at census is a FINDING;
  planSeeds == 0 with entries present is a FINDING; firstPlanDay
  the day after a death with zero cleanups is a FINDING.
- NONDEATHPLAN WATCH (descriptive): removalCleanups stat per seed;
  any winPlan entry for a removed villager lingering at census is
  a FINDING.
- TITAN-REFUSAL WATCH (descriptive): refusal lines per titan per
  day; repeats on the same titan-day counted, not judged.
- DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
  answer about a settled favor while a live need waits is a
  REGRESSION of the r231 fix, filed LOUD.
- HOMEBODYVOICE WATCH (descriptive): picked-homebody voice lines
  per seed — do they fire when a picked companion cannot launch,
  and do they name the real block? A voice line naming a wrong
  block is a FINDING.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2- or DRY3-fixed surface (DRY2/DRY3 regression); reproduction
  of either r230 blemish (buried-cache repeat, tautological recap);
  any dead-holder winPlan entry at census; any homebody voice line
  naming a wrong block.

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
go there and revisions apply to the NEXT run. Open from r230:
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
sighting (same shape as rule 10). (14) NEW this run: the deathcleanup
driver gap (r230 metric review 5) is CLOSED by the r238
instrumentation — deathCleanups + removalCleanups + planSeeds stats
and a winPlan census now ride in the driver record, so the watch is
scored from the panel instead of standing on the 42/42 proof alone.
(15) NEW this run: the arena watch still has no win/loss
instrument — no engine counter exists for arena outcomes; say lines
only narrate arena deaths. The watch stays a death count, not a win
rate, until an instrument is built. (16) NEW this run: DRY3
promotion rule — same shape as rules 10 and 13: the r235 fix's
three surfaces are judged in the wild this run, and a miss is a
REGRESSION of the r235 fix.
