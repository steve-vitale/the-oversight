# Journey crisis r228 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r226
read 5, played 5, wrote 6 at closeout. This run plays crisis and writes 7
(succession next) at closeout. Run number: r228 follows crisis r223;
an earlier crisis r227 attempt today failed to start (stale unregistered
dir cleared by the main session, no panel work — this run takes the next
number; Lane A scale r228 was SKIPPED on its overlap guard the same day,
no evidence files, so no file collision). Base: master 7bb50f3dc.
Lock: playtest-loop-2.lock run_id 2026-11-16T19:55:29Z (own).
Worktree slug: journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 39%.
- `git pull --ff-only`: "Already up to date" (master 7bb50f3dc).
- `worktree-reap.sh`: exit 0, 8/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-saycap-a,
  sim-siegedialog-a, sim-inffight-ab, sim-launchsurvive-ctrl):
  never auto-removing, not mine to touch.
- Registration took ~3.5 min (git worktree add grinding under load);
  the branch was created 5 commits behind master (base 01c52e808) —
  rebased onto master 7bb50f3dc clean before any work. Heartbeat
  confirmed; hbloop every 7 min
  (journey2-crisis-r228-hbloop.sh, pid 20228).
- Flap watcher ALL-OK on current boot 956c483d at run start.

## Canon read this run

- docs/CANON.md + docs/DISEASES.md (re-read 2026-11-16; unchanged
  since r208's read — `git log 7d2de26f4..HEAD -- docs/CANON.md
  docs/DISEASES.md docs/CONVERSATIONS.md` is empty). Canon: two pools
  never mix; ruin medicines ease/cure as labeled (r181 fix native);
  radiation is pellet cost, no pill touches it. docs/CONVERSATIONS.md:
  r192 read stands. docs/ALIEN-PLAYERS.md: r182 read stands (canon:
  the death record says "a stranger", never "an alien"; Q2 stays
  OPEN, Steve's call).

## Base movement since r223 (7d2de26f4 -> 7bb50f3dc)

src/js diff is 4 files, +167/-11 — all of it dialogue-adjacent or a
diagnostic remnant:

- journey-crisis r223 (ae9b4b6f7, own lineage): conversation.js —
  F1 drift-note stage direction no longer quotes as resume memory.
  Directly on this leg's C3 surface. First regression surface.
- journey-succession r224 (2e3142e74): F4a/F4b/F4c dry-line fixes
  (convo-dialogue.js, convo-wants.js) + proof tests. D1/C3 surface.
- journey-endgame r225 (3ba7f0516): F5 settled-favor variants
  (conversation.js) + proof test. C3b surface.
- journey-establishment r225 (83c7dc3c7): stage-0 want is not live —
  favorless asks no longer resolve as refused unheard
  (convo-wants.js). D1 surface.
- journey-social-life r226 (03fee239a): F6 dry-opener guard —
  ledger-blocked lines fall to a fresh phrasing, never the dry line
  (conversation.js). D1/C3 surface.
- villager-agency.js +19: PROFILEGATE bypass — a bid-and-selected
  party_launch commit bypasses the dawn profile gate (sim-profilegate-a
  / sim-launchdef-a armed anchor, re-landed verbatim, NOT reverted).
  This is a live behavior change on master: party launches that the
  dawn scorer committed now face one fewer veto. It can move
  sorties/launches on this panel — descriptive watch (sortie/launch
  counts vs r223), NOT a lever this run tests. Verified:
  `git diff 7d2de26f4..HEAD -- src/js/game.js src/js/win-plan.js
  src/js/villager-brain.js src/js/hierarchy.js` is empty.
- Diagnostics net-zero src: trickteach-b (lever + revert), launchsurvive-a
  (seed call + revert), seedpaths-b (re-land + revert), haventick-b
  (re-land + revert), gatelever-b (lever + revert to base 9b04ae9b7),
  14cwatch2-b (NOT REPRODUCED, evidence only), profileshadow-b
  (evidence only).
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled 2026-11-14
  13:18 CST the medicine trio needs more complexity, a richer layered
  design is owed. The RUINROAD arm stays parked this run (see below).

## Leg question (carried from crisis r223)

**Do r223's verdicts hold on the new base — and does the C3c
resume-opener watch finally get a qualifying case, by panel or by
targeted harness?** Threads:

1. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes (F1–F5)
   held at 0 dry lines on r201, r208, r216 and r223. This panel
   re-runs the same driven transcripts on fresh seeds; any dry line
   on a NEW surface names the next fix. New dialogue-adjacent code
   since r223: r224 F4a–F4c, r225 F5 + stage-0-want, r226 F6,
   r223 F1 itself.
2. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix + r225's F5 settled-favor variants are native
   now; this panel spot-checks every "settled" line — the fixes must
   hold at 0 false settlements.
3. C3c RESUME-OPENER WANT-LABEL WATCH (open since r208, UNMEASURED
   in r216 and r223 — no qualifying case in either panel): resume
   openers read L.open[].label directly and were NOT fixed in r208.
   r223's metric review proposed the only way to close it: a
   TARGETED HARNESS CASE (force a favor change, then a resume
   opener naming the stale favor). This run builds that case as a
   proof test (scripts/test-journey-crisis-r228-c3c-stale-favor-*.js)
   BEFORE the panel, so the watch gets a verdict either way: if the
   harness reproduces a stale-label opener, it is filed as a FINDING
   with a fix in-run if the cause is local; if the harness shows
   the opener re-derives live (or never names the stale favor),
   C3c is CLOSED as unreproducible-by-construction and retired
   from the watch list. The panel watch continues in parallel
   (any panel sighting is still recorded with exact lines).
4. RECAP-AFTER-FAVOR-COMMIT WATCH (r216 follow-up, r223: 0
   sightings): any recap reading "Nothing important" (or
   equivalent) right after a favor commit is recorded; a second
   sighting graduates to a fix item.
5. NODEAWAY MUSTER WALL WATCH (r216: 39 exclusions, 11
   gate-one-short; r223: 18 exclusions across refusals, 3
   alive-bench gate-one-short on 14474): if it repeats at the same
   scale, the muster-vs-travel tension stays a design question,
   not an instrument artifact. The profilegate bypass (base
   movement above) may move launches — report sortie/launch
   counts against r223 as a descriptive.
6. FUNERAL-MEND CONFIRM (r216 F1, r223 GO): the partial-payment
   honest line must hold in the wild — any over-claim line is a
   REGRESSION, filed LOUD.
7. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r223: 3/5 game-over, median 141d,
   2 horizon; r216: 3/5 game-over, median 129d)? Descriptive
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

- Band 14481–14485. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo): zero prereg hits for 14481, 14482, 14483, 14484, 14485.
  One grep hit for the 1448x range: `~/workspace/goals/.../
  hidden_files/sim-findings.md` names "#1448" — a finding NUMBER,
  not a seed. Goal hidden_files evidence preregs: zero hits for
  1448[1-5]. Forbidden bands named in preregs (73641–73648,
  73671–73678; 99201–99208; 78201–78208): no intersection.
  Collision notes (carried): 14471–14475 r223. 14461–14465 r216.
  14451–14455 r208. 14441–14445 r201. 14431–14435 r192.
  14421–14425 r182/r186. 14411–14415 r181. 14401–14405 r180.
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14481–14485,
  sequential. PILOT FIRST (§9): seeds 14481–14483 run first; the
  panel expands to 14484–14485 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14481 DAYS=5 into the r228 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r223 driver verbatim EXCEPT r228 filenames/paths/seeds
  (14481–14485), ORIGINS map keys, EVID path 2026-11-16, DAYS 150.
  No behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r228 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r223 analyzer verbatim EXCEPT r228 filenames/paths
  (the r216 seed-scoped dedupe fix is IN the r223 analyzer and
  carries). Validated on r223's JSONs before the panel: carried
  numbers reproduce exactly.
- C3c targeted harness: built and judged BEFORE the panel (see
  thread 3 above); its verdict is recorded in the run note
  regardless of the panel outcome.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- Q6 RETIRED (r201 metric review): gorge-after-clear id-matched
  0/5 for the ninth consecutive zero panel — METRIC-BROKEN,
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
- C3c RESUME-OPENER WANT-LABEL WATCH (carried, open since r208):
  judged by the targeted harness this run (see thread 3); the
  panel watch continues as a FINDING (not a bar) — any resume
  opener naming a favor that changed since planting (within 14
  days) is recorded with exact lines. The r137 re-pose path is
  checked separately: any re-posed question that names the wrong
  favor is a REGRESSION of r137, filed LOUD.
- C3d RECAP-AFTER-FAVOR-COMMIT WATCH (new r223, r223: 0 sightings):
  any recap reading "Nothing important" (or equivalent) right after
  a favor commit is recorded; a second sighting graduates to a fix
  item.
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
  wins/losses vs r223's 7 arena deaths, no bar.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r223.
- NODEAWAY WATCH (descriptive, r216/r223 follow-up): nodeAway
  exclusions and gate-one-short refusals vs r223's 18/3; a repeat
  at the same scale makes the muster-vs-travel tension a design
  question. Profilegate-bypass effect on launches reported as a
  descriptive against r223.
- Interesting finding (panel triggers): any medicine acquisition on
  the main panel (S3 > 0 — would mean the supply moved with no
  lever landed; investigate); a cleared fight-1 with vTaken >= 70
  (Q4 live-play confirmation, standing); any dry-replacement on a
  NEW surface (the next fix's evidence); any resume-opener stale
  want label (C3c evidence); any funeral-mend line that mends
  silently or over-claims; any recap-after-favor-commit second
  sighting.

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
go there and revisions apply to the NEXT run. Open from r223:
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
whenever two seeds share the key. (9) C3c close-out rule, new this
run: the targeted harness judges the watch; a panel with no
qualifying case is no longer "UNMEASURED" once the harness has
spoken — the harness verdict (FINDING or CLOSED) is the verdict.
