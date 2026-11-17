# Journey crisis r229 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — crisis r228
read 6, played 6, wrote 7 at closeout. This run plays crisis and writes
7 (succession next) at closeout. Run number: r229 follows crisis r228.
Base: master 6fb6ea002.
Lock: playtest-loop-2.lock run_id 2026-11-17T06:56:08Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 49%.
- `git pull --ff-only`: "Already up to date" (master b410ac30c at
  pull time; master moved to 6fb6ea002 during the run — see below).
- `worktree-reap.sh`: exit 0, 14/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a,
  sim-redactor-a, sim-saycap-a, sim-siegedialog-a, sim-inffight-ab,
  sim-planignite-fix-a, sim-deadplan-b, sim-nightcarry-resume):
  never auto-removing, not mine to touch.
- Registration: the FIRST attempt was killed by a VM/service restart
  (~07:18Z — the register process got SIGTERM mid `git reset --hard`,
  ~17 min in under load 12–21). The worktree dir was left orphaned
  (81,397 files, no .git pointer, not in `git worktree list`, no
  REGISTRY.json entry) with a stale branch at the old base b410ac30c.
  Cleaned: rm -rf the orphaned dir, `git branch -D journey2-crisis`,
  `git worktree prune`. Re-registered clean onto the NEW master
  6fb6ea002 (sim-haventickgate-b landed mid-restart). Heartbeat
  07:31:35Z; hbloop every 7 min
  (journey2-crisis-hbloop-r229.sh, pid 8776).
- Flap watcher: not checked this run (the restart cleared the boot;
  the watcher restarts via its watchdog cron).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md + docs/CONVERSATIONS.md +
  docs/ALIEN-PLAYERS.md + docs/MONSTER-WAVES.md + docs/CONTESTS.md:
  `git log 7bb50f3dc..HEAD` on all six is EMPTY — unchanged since
  r228's read, which stands. Canon: two pools never mix; ruin
  medicines ease/cure as labeled (r181 fix native); radiation is
  pellet cost, no pill touches it. The death record says "a
  stranger", never "an alien"; Q2 stays OPEN, Steve's call.

## Base movement since r228 (7bb50f3dc -> 6fb6ea002)

src/js diff is 8 files, +520/-84 — all dialogue-adjacent, muster/
party, or diagnostic-remnant:

- journey-crisis r228 (7ebb2b26e, own lineage): F1 C3c stale-favor
  resume opener + F2 narration-quote guard. Already in the r228
  panel (fixed code ran there). This panel is the second run on it.
- journey-social-life r231 (db83d5ccd): C3d fix — recap names the
  live want when the thread log is empty (conversation.js +70/-16,
  new `convoRecapLiveLine`). Directly on this leg's C3d watch: the
  r228 watch ("Nothing important" recaps, 0 sightings) becomes a
  CONFIRM this run — see C3d below.
- journey-establishment r230 (b9300b938): stage-0 ask_favor wants
  with a live need get a dlg:help surfacing offer
  (convo-wants.js +30, convo-dialogue.js +5/-2). D1 surface: the
  menu never offered the ask before; favors that never surface are
  the r225 guard shape. Descriptive watch this run.
- journey-landing r140 (6436b14c8): silent warn_you heed turns
  fixed (deepen + heeded resolution) + close/budget stop. D1
  surface: warn_you dry lines stay at 0, now including the heed
  path.
- sim-companionguard-b (4e47b173c + 2ac1e0566): companion call skips
  an already-out villager (villager-agency.js +16), guard ships
  unconditional. Muster/party surface: can move sorties/launches
  (fewer orphaned companion calls). Descriptive watch on
  sortie/launch counts vs r228.
- journey-deepening r227 (edfb08543): muster policy — the competent
  player sounds the call, sits the council, commits Haven's blades
  (villager-brain.js +59, win-plan.js +268, game.js +17). Can move
  launches/sorties. Descriptive watch vs r228.
- journey-scale r228 (3a2808723): lagged march-join fix.
  Muster/travel surface; feeds the NodeAway watch.
- sim-haventickgate-b (00c4d2245, 3b6ce18f3, 767fb69f9,
  6fb6ea002): DIAG GO, scripts + evidence only, NO src change.
  Diagnostic; no behavior movement.
- Levers reverted or gated OFF, no behavior movement:
  rumortarget-a (revert 28930ed75), trickshare-a (revert, PILOT
  NO-GO), nightcarry-a (revert cd32c023a, INCOMPLETE),
  vetreengage-a (env gate default OFF). Verified: no other src/js
  files changed in the range.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled 2026-11-14
  13:18 CST the medicine trio needs more complexity, a richer
  layered design is owed. The RUINROAD arm stays parked this run.

## Leg question (carried from crisis r228)

**Do r228's verdicts hold on the new base — and does the NodeAway
muster-vs-travel tension repeat at panel scale as a formal metric,
with the r231 C3d fix confirmed in the wild?** Threads:

1. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201, r208, r216, r223 and r228.
   This panel re-runs the same driven transcripts on fresh seeds;
   any dry line on a NEW surface names the next fix. New
   dialogue-adjacent code since r228: r231 C3d, r230 dlg:help,
   r140 warn_you heed.
2. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix + r225's F5 settled-favor variants are native
   now; this panel spot-checks every "settled" line — the fixes must
   hold at 0 false settlements.
3. C3c CLOSED (r228 harness verdict): the stale-favor resume-opener
   watch is no longer open — r228 reproduced it in harness, fixed
   it (proof 9/9 x 3 seeds), and closed the watch. The panel still
   records resume openers; any opener naming a favor that changed
   since planting is a REGRESSION of the r228 fix, filed LOUD.
   No separate harness this run.
4. C3d CONFIRM (promoted from watch): r231's fix names the live
   want when the thread log is empty. Any recap reading "Nothing
   important" (or equivalent) while a favor/want is live on the
   table is a REGRESSION of the r231 fix, filed LOUD with a fix
   in-run if the cause is local. A "Nothing important" recap with
   nothing open stays honest and is recorded, not judged.
5. NODEAWAY PANEL METRIC (promoted from descriptive watch, r228
   metric review): nodeAway exclusions across refusals + alive-bench
   refusals + worst single bench snapshot, per seed. r228: 38
   exclusions, 9 alive-bench, worst 7 (14481 d56). No bar — a
   repeat at the same scale keeps the muster-vs-travel tension a
   design question; a sharp drop names the mover (companionguard /
   march-join / muster policy) as descriptive, never lever
   attribution with n=5.
6. FUNERAL-MEND CONFIRM (r216 F1, r223 GO, r228 GO): the
   partial-payment honest line must hold in the wild — any
   over-claim line is a REGRESSION, filed LOUD.
7. STAGE-0 SURFACING WATCH (new, r230 surface): any stage-0
   ask_favor want with a live need that sits a full sitting with
   dlg:help never offered is recorded; a second sitting graduates
   to a fix item.
8. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r228: 5/5 game-over, median 135d;
   r223: 3/5 game-over, median 141d; r216: 3/5)? Descriptive
   watch: funeral-mend lines under FUNERALMEND (ON), CASCADE's
   effect on scholar deaths to lingerers, arena-fight outcomes
   under the Reunion re-tune (HP x0.4 / damage x0.6, mirror cap 1).

NOT this run: the RUINROAD forced-search arm. Cumulative 0/301
(r186 0/151 + r192 0/150) is a PROVEN constraint; re-running the
arm with no lever landed would re-prove it (Steve 2026-11-01
rebuke). The supply question lives with the medicine build brief
— lever (h) duty-holder scavenging first, richer layered design
owed per Steve 2026-11-14. If a lever lands, a later crisis run
re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14491–14495. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) and goal hidden_files preregs: zero hits for 14491,
  14492, 14493, 14494, 14495. Forbidden bands named in preregs
  (73641–73648, 73671–73678; 99201–99208; 78201–78208): no
  intersection. Collision notes (carried): 14481–14485 r228.
  14471–14475 r223. 14461–14465 r216. 14451–14455 r208.
  14441–14445 r201. 14431–14435 r192. 14421–14425 r182/r186.
  14411–14415 r181. 14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14491–14495,
  sequential. PILOT FIRST (§9): seeds 14491–14493 run first; the
  panel expands to 14494–14495 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14491 DAYS=5 into the r229 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r228 driver verbatim EXCEPT r229 filenames/paths/seeds
  (14491–14495), ORIGINS map keys, EVID path 2026-11-17, DAYS 150,
  PLUS the R229 LIVE-ROSTER FIX: convo targets are picked from the
  living roster only (aliveSet) — a defender recorded yesterday may
  have died in the fight, and the roster fallback includes the dead;
  r228 burned 2 sittings on dead villagers ("(conversation
  refused/ended)"). If no live defender, fall through to the
  sheltered branch; if nobody is alive, skip the sitting. No other
  behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r229 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r228 analyzer verbatim EXCEPT r229 filenames/paths,
  PLUS the R229 NODEAWAY_PANEL section (per-seed nodeAway totals
  across refusals, alive-bench nodeAway, worst single bench
  snapshot). Validated on r228's JSONs + transcripts before the
  panel: carried numbers reproduce byte-identically (diff vs
  journey-crisis-r228-full-analysis.txt empty apart from the new
  NODEAWAY_PANEL line); the new section reproduces r228's
  38/9/worst-7 (14481 d56).

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
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
  confession: 0 expected (r172 guard); any recurrence is a guard
  failure, filed LOUD. Naming-stance wobble: a fourth sighting
  graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM (binding this run): every "settled"
  close line fires only on a sitting that shared a real beat with
  the favor it names (favor itself done: fulfilled / thanked).
  Spot-check each one. Any false settlement is a REGRESSION of the
  r201 fix, filed LOUD with a fix in-run if the cause is local.
- C3c CLOSED: see thread 3. Any resume opener naming a changed
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
  stays 0/301, carried as the standing number; the supply question
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
  wins/losses vs r228's 8 arena deaths, no bar.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r228.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r228's 38 exclusions / 9 alive-bench / worst 7. A repeat at
  the same scale keeps the muster-vs-travel tension a design
  question; a sharp drop is reported as a descriptive against the
  base movement (companionguard / march-join / muster policy),
  never lever attribution with n=5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants
  with a live need that sit a full sitting with dlg:help never
  offered, recorded per sitting; a second sitting graduates to a
  fix item.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression).

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
go there and revisions apply to the NEXT run. Open from r228:
(1) Q6 retired to descriptive-only (METRIC-BROKEN) — done r201.
(2) Dialogue-only fixes are NOT trajectory-neutral while voiceLine
draws RNG — the r192 fixes spend no RNG on the common path;
pre/post trajectory comparisons stay descriptive, never fix-effect
claims. (3) For supply-gated fixes, the unit test is the proof and
the panel is a regression check only. (4) Telemetry baseline units —
verify crisis.json units before any roll (carried). (5) The `want`-
thread label is a function of the CURRENT favor, but the topic
ledger stores it as a snapshot — every consumer that trusts the
stored label can misname the favor after a change (lapse line fired
r208, fixed; settled-line gate bypass was latent, fixed; resume
openers read L.open[].label directly and were NOT fixed — C3c
watches them; r137's re-pose reads the live want with a label
guard, a partial live re-derivation at the use site). Any future
thread-label fix should re-derive want labels live at the use site
or at record time, never trust the stored snapshot. (6)
Median-death-day movement is a panel-level descriptive, not a
per-change claim: with n=5 and overlapping distributions, no lever
is isolated by this panel. A future crisis run that wants to
attribute a survival shift needs a matched-seed A/B on one change,
not a fresh-seed panel. (7) The funeral-mend public line is a
SECOND consumer of a stored-vs-live value (r216 metric review): any
line that states a number the mechanics computed proportionally
must be checked against the computed value, not the nominal one.
(8) Analyzer panel-wide dedupe maps must be seed-scoped (r216 F2):
any cross-seed census keyed without the seed will false-positive
whenever two seeds share the key. (9) C3c close-out rule, r228:
the targeted harness judges the watch; a panel with no
qualifying case is no longer "UNMEASURED" once the harness has
spoken — the harness verdict (FINDING or CLOSED) is the verdict.
(10) C3d promotion rule, new this run: a watch graduates to
CONFIRM when a fix for it lands (r231); the panel then judges the
fix in the wild, and a miss is a REGRESSION, not a watch
sighting.
