# Journey crisis r216 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r215
read 5, played 5, wrote 6 at closeout. This run plays crisis and writes 7
(succession next) at closeout. Run number: r216 follows r215; r208 was the
last crisis run (landed via adoption 2026-11-15 ~05:00Z). Base: master
abc52dce1. Lock: playtest-loop-2.lock run_id 2026-11-15T20:55:31Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 42%.
- `git pull --ff-only`: "Already up to date" (master 605d72bd4 at pull
  time; Lane A landed journey-scale r215 into master 2 min later,
  20:55:23Z — the worktree branched from the then-current HEAD
  abc52dce1, verified: 605d72bd4 is an ancestor of the worktree tip,
  worktree clean, branch journey2-crisis).
- `worktree-reap.sh`: exit 0, 13/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab, sim-courtship-
  rework2-b, sim-producergate-b): never auto-removing, not mine to
  touch.
- REGISTRATION QUEUE: this run's own `worktree-register.sh` took
  ~15 min (git worktree add's reset grinding under load avg ~11;
  Lane A registered journey-landing concurrently). Queue, not wedge.
  Heartbeat confirmed landed at registration (20:57:42Z); hbloop
  every 7 min (journey2-crisis-hbloop-r216.sh).

## Canon read this run

- docs/CANON.md (re-read 2026-11-15) + docs/DISEASES.md (re-read
  2026-11-15). Canon: two pools never mix; ruin medicines ease/cure
  as labeled (r181 fix native); radiation is pellet cost, no pill
  touches it. docs/CONVERSATIONS.md: r192 read stands (the fix area).
  docs/ALIEN-PLAYERS.md: r182 read stands (canon: the death record
  says "a stranger", never "an alien"; Q2 stays OPEN, Steve's call).

## Base movement since r208 (0054751ad -> abc52dce1)

src/js + src/data commits only (15 commits total, mostly evidence):
- journey-scale r215 (abc52dce1, 03b2ce8d5): curious-resume stutter
  fix in conversation.js (+36 lines) + trust-test harness fix
  (test.js) — DIALOGUE-ADJACENT, directly on this leg's C3/D1
  surface (resume openers, the exact site r208's metric review
  flagged for want-label staleness). First regression surface.
- journey-endgame r211 (c09a9f732, 676430c3a): sysSay doubled-quote
  fix + quoteWrap follow-up (relic commentary, ability/evolution
  flavor, Callback mimicry) — dialogue-adjacent, D1/C3 regression
  surface.
- journey-establishment r214 (c89ac24b3): plain parting for
  neutral/friendly sittings (convoMoodGoodbye plain pool) — dialogue-
  adjacent, D1/C3 regression surface.
- journey-succession r209 (af56c7b4f): deferred-ask ledger guard +
  favor-block noBeat — dialogue-adjacent, D1/C3 regression surface.
- sim-funeral-mend-b (52a84cd46): BUILD the funeral mend in
  hierarchy.js (FUNERALMEND default ON) — at the funeral the village
  mourns together and the shared rite mends every link the funeral
  shook (1,500 kcal of funeral feast per link from the pantry; voiced;
  shortfall said aloud). CRISIS-RELEVANT: funerals/mourning fire in
  crisis panels; watch funeral lines + funeralMendStats.
- sim-gorgeprice2-b (dc8cbd3f3): lever base — CASCADE (+16 lines
  game.js monsterTurn): a lingering raider holds the treeline and no
  longer steps onto the scholar inside the hall to start a turn-based
  fight it always wins solo (10 repeat instances, 38/88 scholar
  deaths in the control pilot). CRISIS-RELEVANT: siege/lingerer
  behavior changes; nightly gorge + ~6-night drift valve untouched;
  sorties still fight it (fieldFight). Watch scholar-death causes
  and gorge/sortie shape vs r208 (descriptive; no lever isolated by
  this panel).
- sim-producerparty-b (50c874822 + 43124ee25): lever ADDED then
  REVERTED at pilot (pilot NO-GO). Verified net zero in src/js:
  grep PRODUCERPARTY in game.js = 0; the revert commit removes the
  19-line block. No game-code trace.
- journey-landing r129 (413252eb4): terrain-pocket fix — landing
  leg, not crisis directly.
- sim-transplant2b-fresh-a (605d72bd4 + parents): NOT-CARRIER
  evidence, panel tooling — no src/js change.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed (lever (h) duty-holder
  scavenging built -> NO-GO Nov 14, branch kept, nothing merged) —
  the RUINROAD arm stays parked this run (see below).

## Leg question (carried from crisis r208)

**Do r208's verdicts hold on the new base — and does the r208
metric-review follow-up (resume-opener want-label staleness) show
any transcript evidence?** Four threads:

1. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes (F1–F5)
   held at 0 dry lines on r201 and r208. This panel re-runs the same
   driven transcripts on fresh seeds; any dry line on a NEW surface
   names the next fix. New dialogue-adjacent code since r208: r215
   curious-resume stutter fix, r211 sysSay/quoteWrap fixes, r214
   plain parting, r209 deferred-ask guard + favor-block noBeat.
2. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix are native now; this panel spot-checks every
   "settled" line — the fixes must hold at 0 false settlements.
3. RESUME-OPENER WANT-LABEL FOLLOW-UP (r208 metric review): resume
   openers read L.open[].label directly and were NOT fixed in r208 —
   the site shares the lapse-label root cause (the `want` thread is
   labeled by the favor it names; the favor can change between
   planting and circling back). This panel watches for a favor
   changing within 14 days of planting followed by a resume opener
   naming the stale favor. No fix without transcript evidence; any
   sighting is filed with the exact lines.
4. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r208: 5/5 game-over, median 84d; r201:
   4/5 game-over, 1/5 horizon, median 109d)? Descriptive watch:
   funeral-mend lines under FUNERALMEND (ON), CASCADE's effect on
   scholar deaths to lingerers, arena-fight outcomes under the
   Reunion re-tune (HP x0.4 / damage x0.6, mirror cap 1).

NOT this run: the RUINROAD forced-search arm. Cumulative 0/301
(r186 0/151 + r192 0/150) is a PROVEN constraint; re-running the
arm with no lever landed would re-prove it (Steve 2026-11-01
rebuke). The supply question lives with the medicine build brief
— lever (h) duty-holder scavenging first. If (h) lands, a later
crisis run re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14461–14465. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo): zero prereg hits for 1446[1-5]. Goal hidden_files evidence
  grep for 14461–14465 hit only data values inside census JSONs
  (2026-10-16 crumbdefault census files; 2026-11-14 journey-scale
  r204 trust/hungerwatch/deathcensus files for seed 135401; the
  r208 seed-14454 panel JSON itself) — verified non-seeds, same
  class as r208's 1444x false positives. Forbidden bands named in
  preregs (73641–73648, 73671–73678; 99201–99208; 78201–78208): no
  intersection. Collision notes (carried): 14451–14455 r208.
  14441–14445 r201. 14431–14435 r192. 14421–14425 r182/r186.
  14411–14415 r181. 14401–14405 r180. Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14461–14465,
  sequential. PILOT FIRST (§9): seeds 14461–14463 run first; the
  panel expands to 14464–14465 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14461 DAYS=5 into the r216 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r208 driver verbatim EXCEPT r216 filenames/paths/seeds
  (14461–14465), ORIGINS map keys, EVID path 2026-11-15, DAYS 150.
  No behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r216 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r208 analyzer verbatim EXCEPT r216 filenames/paths.
  Validated on r208's JSONs before the panel: carried numbers
  reproduce exactly.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- Q6 RETIRED (r201 metric review): gorge-after-clear id-matched
  0/5 for the seventh consecutive zero panel — METRIC-BROKEN,
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
- C3c RESUME-OPENER WANT-LABEL WATCH (new this run, r208 metric
  review follow-up): any resume opener naming a favor that changed
  since planting (within 14 days) is recorded with exact lines; it
  is a FINDING, not a bar — no fix without transcript evidence.
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
  wins/losses vs r208's arena deaths, no bar.
- FUNERAL-MEND WATCH (descriptive, new this run): funeral lines
  naming the mend (links mended, kcal spent, shortfall said aloud)
  + funeralMendStats counters per seed; any silent mend or
  shortfall-mended-silently line is a FINDING.
- CASCADE WATCH (descriptive, new this run): scholar deaths with a
  lingerer as the killer (vs r208's control-pilot shape: a lingerer
  stepping onto the scholar inside the hall); gorge nights and
  sortie shape vs r208.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c evidence); any funeral-mend line that mends
  silently.

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
go there and revisions apply to the NEXT run. Open from r208:
(1) Q6 retired to descriptive-only (METRIC-BROKEN) — done here.
(2) Dialogue-only fixes are NOT trajectory-neutral while voiceLine
draws RNG — the r192 fixes spend no RNG on the common path;
pre/post trajectory comparisons stay descriptive, never fix-effect
claims. The C3b fix likewise spends no RNG — its postfix check
(seed 14445, one line withheld, days/end identical) is a
regression check, not a fix-effect claim. (3) For supply-gated
fixes, the unit test is the proof and the panel is a regression
check only. (4) Telemetry baseline units — verify crisis.json
units before any roll (carried). (5) The `want`-thread label is a
function of the CURRENT favor, but the topic ledger stores it as a
snapshot — every consumer that trusts the stored label can misname
the favor after a change (lapse line fired r208, fixed; settled-line
gate bypass was latent, fixed; resume openers read L.open[].label
directly and were NOT fixed — C3c watches them this run). Any
future thread-label fix should re-derive want labels live at the
use site or at record time, never trust the stored snapshot.
(6) Median-death-day movement is a panel-level descriptive, not a
per-change claim: with n=5 and overlapping distributions, no lever
is isolated by this panel. A future crisis run that wants to
attribute a survival shift needs a matched-seed A/B on one change,
not a fresh-seed panel.
