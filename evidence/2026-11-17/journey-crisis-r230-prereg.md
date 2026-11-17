# Journey crisis r230 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r234
read 5, played 5, wrote 6 at closeout (14:46Z today). This run plays
crisis and writes 7 (succession next) at closeout. Run number: r230
follows crisis r229 (this morning).
Base: master 39eaa043e (journey-social-life r234).
Lock: playtest-loop-2.lock run_id journey2-6-20261117T145537Z (own).
Worktree slug: journey2-6.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 46%.
- `git pull --ff-only`: "Already up to date" (master 39eaa043e).
- `worktree-reap.sh`: exit 0, 11/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-launchfunnel-a,
  sim-part2night-a, sim-nondeathplan-panelbase, journey-establishment):
  never auto-removing, not mine to touch.
- Registration: clean, first attempt, onto master 39eaa043e.
  Heartbeat 14:58:50Z; hbloop every 7 min
  (journey2-crisis-hbloop-r230.sh).
- Flap watcher: not checked this run (probe + watchdog cron own it).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md + docs/CONVERSATIONS.md +
  docs/ALIEN-PLAYERS.md + docs/MONSTER-WAVES.md + docs/CONTESTS.md:
  `git log 6fb6ea002..HEAD` on all six is EMPTY — unchanged since
  r229's read, which stands. Canon: two pools never mix; ruin
  medicines ease/cure as labeled (r181 fix native); radiation is
  pellet cost, no pill touches it. The death record says "a
  stranger", never "an alien"; Q2 stays OPEN, Steve's call.

## Base movement since r229 (6fb6ea002 -> 39eaa043e)

src/js diff is 9 files, +277/-15 — all dialogue-adjacent, muster/
party, death-cleanup, or diagnostic-remnant:

- journey-social-life r234 (39eaa043e): DRY2 fix [needs-eyes] +
  panel (F6 MISS 4 dry at new DRY3 sites; proof 27/27 green, 23/27
  red on base). conversation.js +20, convo-dialogue.js +19/-,
  truth.js +18/-. Three fixes, all on this leg's D1 surface:
  (a) topic-ask composed line ledger-blocked -> honest exhausted
  line (conversation.js, ask: turns only, after composition);
  (b) probe stonewall fallback ledger-exempt via `structural`
  (convo-dialogue.js — the stonewall itself was ledgered as a
  primary, so a later sitting dried twice); (c) confrontation line
  diegetic-act exemption (truth.js — a blocked r.line dried after
  its consequences already fired). Directly on this leg's D1 DRY
  census: the r229 panel is the second leg's confirmation in the
  wild. DRY2 CONFIRM this run — see metrics.
- sim-deathcleanup-b (5f583a056 + 1f3187fc2 CORRECTION): death
  cleanup — winPlan dies with the villager (delete own entry +
  purge from every holder party, party/hunt fallback to party on
  empty); hooks in removeVillager death branch (after phoenix
  early-return) and tbVillagerFalls; deathCleanups stat; proof
  40/40. CORRECTION: winPlanOnVillagerDeath must NOT call stateOf
  — it materialized winPlan={} and ignited the plan system in
  sleeping villages (seed 103237: first death day 15, first plan
  day 16, diverged day 18 with zero cleanups; havenTick gates on
  store existence). Non-creating read now; proof 42/42 incl.
  no-creation regression checks. Crisis-relevant: deaths during
  crisis, plan ignition in sleeping villages. DEATHCLEANUP WATCH
  this run (descriptive).
- journey-scale r233 (fdf79a680): titan refusal said once per titan
  per day (Q6a refusal-spam fix) + proof test (25/25, red verified
  17/8). titans.js. Muster/travel surface; feeds the NodeAway
  watch and the refusal-spam watch. TITAN-REFUSAL WATCH this run
  (descriptive).
- journey-deepening r232 (a6e2bfb58): reconcile field-killed titans
  at dawn (slain-field) + proof test. titans.js. Muster/travel
  surface; descriptive watch on slain-field outcomes vs r229.
- journey-establishment r231 (af1791e90): deferred ask surfaces
  past a settled ledger favor (help no longer answers 'already
  handled' about a dead favor while a live need waits).
  convo-wants.js +22/-, convo-dialogue.js +5/-. C3d-adjacent;
  DEFERRED-ASK WATCH this run (descriptive).
- sim-planignite-fix-a (8558394d6): PLANFIX lever + driver/
  analyzer/panel-builder/proof — initialize plan store on first
  HavenTick, env-gated default-OFF. No behavior movement.
- sim-planignconfirm-b: CONFIRM NO-GO (bars 1+2 fail; lever stays
  env-gated OFF). Evidence + instrument only.
- sim-reattach-a (c5c48f90e + 000e2d870): re-apply + revert lever
  (PILOT NO-GO 1/8; src/ back to base). Net zero on src.
- build.js: version bump only (e390dff60). No behavior.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled 2026-11-14
  13:18 CST the medicine trio needs more complexity, a richer
  layered design is owed. The RUINROAD arm stays parked this run.

## Leg question (carried from crisis r229)

**Do r229's verdicts hold on the new base — and does the r234 DRY2
fix hold in the wild on the crisis leg, with deathcleanup-b's
death/plan behavior clean under crisis deaths?** Threads:

1. DRY2 CONFIRM (new, promoted): r234's three fixes land on the
   crisis leg's D1 surface. Any dry line on one of the three fixed
   surfaces (ask: composed topic line; probe stonewall repeat;
   confront line) is a REGRESSION of the r234 fix, filed LOUD with
   a fix in-run if the cause is local. The r234 proof (27/27) is
   the unit proof; this panel is the wild confirmation.
2. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes
   (F1–F5) held at 0 dry lines on r201, r208, r216, r223, r228 and
   r229. This panel re-runs the same driven transcripts on fresh
   seeds; any dry line on a NEW surface names the next fix.
3. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix + r225's F5 settled-favor variants are native
   now; this panel spot-checks every "settled" line — the fixes must
   hold at 0 false settlements.
4. C3c CLOSED (r228 harness verdict): the stale-favor resume-opener
   watch is no longer open — r228 reproduced it in harness, fixed
   it (proof 9/9 x 3 seeds), and closed the watch. The panel still
   records resume openers; any opener naming a favor that changed
   since planting is a REGRESSION of the r228 fix, filed LOUD.
   No separate harness this run.
5. C3d CONFIRM (promoted from watch): r231's fix names the live
   want when the thread log is empty. Any recap reading "Nothing
   important" (or equivalent) while a favor/want is live on the
   table is a REGRESSION of the r231 fix, filed LOUD with a fix
   in-run if the cause is local. A "Nothing important" recap with
   nothing open stays honest and is recorded, not judged.
6. NODEAWAY PANEL METRIC (promoted from descriptive watch, r228
   metric review): nodeAway exclusions across refusals + alive-bench
   refusals + worst single bench snapshot, per seed. r229: 0 / 0 / 0
   (compositional — the only 3 refusals were no-fighters in empty
   villages, so the muster-availability surface never engaged).
   r228: 38 / 9 / worst-7. No bar — a repeat at r229's scale keeps
   the muster-vs-travel tension a design question; a return toward
   r228's scale names the mover (companionguard / march-join /
   muster policy / titan-refusal fix) as descriptive, never lever
   attribution with n=5. The metric needs an alive bench to mean
   anything (r229 metric review 11).
7. FUNERAL-MEND CONFIRM (r216 F1, r223 GO, r228 GO, r229 GO): the
   partial-payment honest line must hold in the wild — any
   over-claim line is a REGRESSION, filed LOUD.
8. STAGE-0 SURFACING WATCH (r230 surface): any stage-0 ask_favor
   want with a live need that sits a full sitting with dlg:help
   never offered is recorded; a second sitting graduates to a fix
   item.
9. DEATHCLEANUP WATCH (new, descriptive): deathCleanups stat per
   seed; any plan ignition in a sleeping village (first plan day
   with no prior wake event) is a FINDING; any dead villager's
   winPlan entry lingering at census is a FINDING.
10. TITAN-REFUSAL WATCH (new, descriptive): refusal lines per
    titan per day — the r233 fix says the line once per titan per
    day; repeats on the same titan-day are counted, not judged.
11. DEFERRED-ASK WATCH (new, descriptive): any dlg:help answer of
    'already handled' about a settled favor while a live need waits
    is a REGRESSION of the r231 fix, filed LOUD.
12. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
    mourning still fire on ordinary seeds, and do the villages bend
    or break the same way (r229: 4/5 game-over, median 122d;
    r228: 5/5, median 135d)? Descriptive watch: funeral-mend
    lines under FUNERALMEND (ON), CASCADE's effect on scholar
    deaths to lingerers, arena-fight outcomes under the Reunion
    re-tune (HP x0.4 / damage x0.6, mirror cap 1).
13. R229 BLEMISH REPRODUCTION (conditional fix items): (a) resume-
    opener quote truncation (14494 d28 — quote cut mid-line,
    carries the next line's "NPC:" prefix); (b) tautological recap
    template (14494 d48 Grace — "started on what you're hoping
    for, then got onto what you're hoping for", A == B). If either
    reproduces on this panel, fix in-run with a proof test; if
    neither reproduces, both stay carried as known blemishes.

NOT this run: the RUINROAD forced-search arm. Cumulative 0/306
(r186 0/151 + r192 0/150 + r229 0/5) is a PROVEN constraint;
re-running the arm with no lever landed would re-prove it (Steve
2026-11-01 rebuke). The supply question lives with the medicine
build brief — lever (h) duty-holder scavenging first, richer
layered design owed per Steve 2026-11-14. If a lever lands, a later
crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14501–14505. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo) and goal hidden_files preregs: zero hits for 14501,
  14502, 14503, 14504, 14505 as seeds. The only 1450x hits anywhere
  are `app.js:14501` line references in
  hidden_files/evidence/2026-10-17/sim-shellcounter-b.md (and its
  armc-b-partial copy) — a code line number, not a seed band.
  Forbidden bands named in preregs (73641–73648, 73671–73678;
  99201–99208; 78201–78208): no intersection. Collision notes
  (carried): 14491–14495 r229. 14481–14485 r228. 14471–14475 r223.
  14461–14465 r216. 14451–14455 r208. 14441–14445 r201.
  14431–14435 r192. 14421–14425 r182/r186. 14411–14415 r181.
  14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14501–14505,
  sequential. PILOT FIRST (§9): seeds 14501–14503 run first; the
  panel expands to 14504–14505 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14501 DAYS=5 into the r230 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r229 driver verbatim EXCEPT r230 filenames/paths/seeds
  (14501–14505), ORIGINS map keys, EVID path 2026-11-17, DAYS 150,
  PLUS the R229 LIVE-ROSTER FIX carried (convo targets picked from
  the living roster only). RUINROAD env stays OFF (arm parked, see
  above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r230 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r229 analyzer verbatim EXCEPT r230 filenames/paths,
  PLUS the R230 NODEAWAY_PANEL section carried. Validated on r229's
  JSONs before the panel: carried numbers reproduce (panel table
  + NODEAWAY 0/0/0); the one comment citing r229 evidence
  (14491 + 14494 ad_break d45) is restored to its r229 citation
  after the mechanical rename.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
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
  confession: 0 expected (r172 guard); any recurrence is a guard
  failure, filed LOUD. Naming-stance wobble: a fourth sighting
  graduates to a fix item.
- C3b SETTLED-FAVOR CONFIRM (binding this run): every "settled"
  close line fires only on a sitting that shared a real beat with
  the favor it names (favor itself done: fulfilled / thanked).
  Spot-check each one. Any false settlement is a REGRESSION of the
  r201 fix, filed LOUD with a fix in-run if the cause is local.
- C3c CLOSED: see thread 4. Any resume opener naming a changed
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
  stays 0/306, carried as the standing number; the supply question
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
  wins/losses vs r229's 5 arena deaths, no bar.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r229.
- NODEAWAY PANEL METRIC (tracked, no bar): NODEAWAY_PANEL totals
  vs r229's 0/0/0 and r228's 38/9/worst-7. A repeat at r229's scale
  keeps the muster-vs-travel tension a design question; a return
  toward r228's scale is reported as a descriptive against the base
  movement (companionguard / march-join / muster policy /
  titan-refusal fix), never lever attribution with n=5.
- STAGE-0 SURFACING WATCH (descriptive): stage-0 ask_favor wants
  with a live need that sit a full sitting with dlg:help never
  offered, recorded per sitting; a second sitting graduates to a
  fix item.
- DEATHCLEANUP WATCH (descriptive): deathCleanups stat per seed;
  any plan ignition in a sleeping village or dead villager's
  winPlan entry lingering at census is a FINDING.
- TITAN-REFUSAL WATCH (descriptive): refusal lines per titan per
  day; repeats on the same titan-day counted, not judged.
- DEFERRED-ASK WATCH (descriptive): any dlg:help 'already handled'
  answer about a settled favor while a live need waits is a
  REGRESSION of the r231 fix, filed LOUD.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c regression); any funeral-mend line that mends
  silently or over-claims; any "Nothing important" recap with a
  live favor on the table (C3d regression); any dry line on a
  DRY2-fixed surface (DRY2 regression); reproduction of either
  r229 blemish (resume-opener truncation, tautological recap).

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
go there and revisions apply to the NEXT run. Open from r229:
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
sentence boundary, not a character count. (13) NEW this run: a watch
graduates to CONFIRM when a fix for it lands (DRY2, r234) — the
panel then judges the fix in the wild, and a miss is a REGRESSION,
not a watch sighting (same shape as rule 10).
