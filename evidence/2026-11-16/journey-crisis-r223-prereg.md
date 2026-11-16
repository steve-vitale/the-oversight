# Journey crisis r223 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b file reads 6 at run start — social-life r220
read 5, played 5, wrote 6 at closeout. This run plays crisis and writes 7
(succession next) at closeout. Run number: r223 follows social r220;
r216 was the last crisis run (landed via two-stage adoption 2026-11-15
~18:00 CST, edd53a489 + b0783dd7f). Base: master 7d2de26f4. Lock:
playtest-loop-2.lock run_id loop2-20261116T065700Z (own). Worktree slug:
journey2-crisis.

## Pre-flight / standing infrastructure notes (LOUD)

- Main tree clean (0 dirty), disk 42%.
- `git pull --ff-only`: "Already up to date" (master 7d2de26f4).
- `worktree-reap.sh`: exit 0, 12/16 active, removed nothing. LOUD
  lines, all other owners' uncommitted trees (sim-wideduty-a,
  sim-sametick-a, journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab, journey-deepening):
  never auto-removing, not mine to touch.
- Registration took ~8 min (git worktree add grinding under load);
  heartbeat confirmed landed 07:08:11Z; hbloop every 7 min
  (journey2-crisis-hbloop-r223.sh).

## Canon read this run

- docs/CANON.md + docs/DISEASES.md (re-read 2026-11-16; unchanged
  since r208's read — `git log 0054751ad..HEAD -- docs/CANON.md
  docs/DISEASES.md docs/CONVERSATIONS.md` is empty). Canon: two pools
  never mix; ruin medicines ease/cure as labeled (r181 fix native);
  radiation is pellet cost, no pill touches it. docs/CONVERSATIONS.md:
  r192 read stands (the fix area). docs/ALIEN-PLAYERS.md: r182 read
  stands (canon: the death record says "a stranger", never "an alien";
  Q2 stays OPEN, Steve's call).

## Base movement since r216 (abc52dce1 -> 7d2de26f4)

src/js + src/data diff is 4 files, 93 insertions (+8 deletions) —
all of it dialogue-adjacent or version bumps:

- journey-landing r137 (ce0f28a46): conversation.js +49/-1 —
  want-thread resume RE-POSES the deflected question (the beat is
  null for a deflected question-want, so the handler used to fall
  through to the generic acknowledgment and the thread died; now it
  re-hangs THE SAME question via convoQuestionDef +
  convoAcceptWantQuestion and speaks the question bare, with a label
  check guarding the cross-sitting shape). DIALOGUE-ADJACENT, directly
  on this leg's C3c watch site (resume openers). First regression
  surface. Proof test-convo-want-resume-repose-20261115.js.
- journey-succession r218 (50c86b0b9): convo-dialogue.js +13/-3 —
  commit-refusal lines never become thread memory (F3 noBeat).
  Dialogue-adjacent, D1/C3 surface.
- journey-scale r219 (25373172b): conversation.js +15 — goon must
  not carry an ask tag onto substituted text. Dialogue-adjacent.
- journey-crisis r216 (edd53a489, own lineage): hierarchy.js
  funeral-mend partial-payment honest line + analyzer seed-scoped
  dedupe — the panel's F1/F2, already in this leg's line.
- Version bumps only (build.js).
- Diagnostics with NET-ZERO src: vetparty-a (lever added then
  reverted; game files byte-identical to pre-lever), dawnbid-a (seed
  call re-land then revert), profilegate-a (seed call + gate fix,
  reverted), seedattach-a, companionpool-b, gatereach2-b (diagnostics,
  no src change), courtship-reconfirm-b (CONFIRM GO, evidence only;
  game-code BFS fix still owed, not landed), aidgate-b (reverted),
  producergate-b (reverted), producerparty-b (reverted). Verified:
  `git diff abc52dce1..HEAD -- src/js/game.js src/js/villager-brain.js
  src/js/win-plan.js` is empty.
- NO medicine-lever commits: levers (h)/(a)/(b)/(c)/(d) from the
  2026-11-13 medicine brief have NOT landed — Steve ruled 2026-11-14
  13:18 CST the medicine trio needs more complexity, a richer layered
  design is owed. The RUINROAD arm stays parked this run (see below).

## Leg question (carried from crisis r216)

**Do r216's verdicts hold on the new base — and does the C3c
resume-opener watch finally get a qualifying case now that r137
changed resume openers?** Threads:

1. DRY-CENSUS REGRESSION: r192's five ledger-aware pool fixes (F1–F5)
   held at 0 dry lines on r201, r208 and r216. This panel re-runs the
   same driven transcripts on fresh seeds; any dry line on a NEW
   surface names the next fix. New dialogue-adjacent code since r216:
   r137 resume re-pose, r218 commit-refusal noBeat, r219 goon ask-tag.
2. C3b SETTLED-FAVOR CONFIRM (continued): r201's gate + r208's
   lapse-label fix are native now; this panel spot-checks every
   "settled" line — the fixes must hold at 0 false settlements.
3. C3c RESUME-OPENER WANT-LABEL WATCH (open since r208, UNMEASURED
   in r216 — no qualifying case): resume openers read L.open[].label
   directly and were NOT fixed in r208. r137's re-pose reads the LIVE
   want (c.want.qid) and guards label mismatch — but the generic
   resume fallback ("About ${label} — ... never did get back to
   that.") still uses the stored label `o.label`. This panel watches
   for a favor changing within 14 days of planting followed by a
   resume opener naming the stale favor. No fix without transcript
   evidence; any sighting is filed with the exact lines.
4. RECAP-AFTER-FAVOR-COMMIT WATCH (r216 follow-up): one sitting
   (14461 d31) read "We were just talking. Nothing important." right
   after a favor commit. A second sighting graduates to a fix item
   (a favor commit logging a thread would let recap name it).
5. NODEAWAY MUSTER WALL WATCH (r216: 39 exclusions, 11 gate-one-short
   refusals, 7 villagers out on node-travel at once): if it repeats
   on this panel, the muster-vs-travel tension is a design question,
   not an instrument artifact.
6. FUNERAL-MEND CONFIRM (r216 F1): the partial-payment honest line
   ("(Trust +N — the feast could not buy back the full -8.)") must
   hold in the wild — any over-claim line is a REGRESSION, filed LOUD.
7. CRISIS REGRESSION: do raids, gorge nights, sorties, favors,
   mourning still fire on ordinary seeds, and do the villages bend
   or break the same way (r216: 3/5 game-over, median 129d, 2 horizon;
   r208: 5/5 game-over, median 84d)? Descriptive watch: funeral-mend
   lines under FUNERALMEND (ON), CASCADE's effect on scholar deaths
   to lingerers, arena-fight outcomes under the Reunion re-tune
   (HP x0.4 / damage x0.6, mirror cap 1).

NOT this run: the RUINROAD forced-search arm. Cumulative 0/301
(r186 0/151 + r192 0/150) is a PROVEN constraint; re-running the
arm with no lever landed would re-prove it (Steve 2026-11-01
rebuke). The supply question lives with the medicine build brief
— lever (h) duty-holder scavenging first, richer layered design
owed per Steve 2026-11-14. If a lever lands, a later crisis run
re-runs RUINROAD to measure the movement.

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14471–14475. Searched: all dated preregs
  `evidence/*/journey-*-prereg.md` and `evidence/*/sim-*-prereg.md`
  (repo): zero prereg hits for 14471, 14472, 14473, 14474, 14475.
  One grep hit for the 1447x range: `evidence/2026-10-27/
  sim-spanpromo-b-prereg.md` names "14479" inside a per-action table
  — a data value, not a seed band, and outside this band. Goal
  hidden_files evidence preregs: zero hits for 1447[0-9]. Forbidden
  bands named in preregs (73641–73648, 73671–73678; 99201–99208;
  78201–78208): no intersection. Collision notes (carried):
  14461–14465 r216. 14451–14455 r208. 14441–14445 r201. 14431–14435
  r192. 14421–14425 r182/r186. 14411–14415 r181. 14401–14405 r180.
  Band is fresh.

## Panel (binding)

- Policy oracleV2, 150d death-aware +10d tail, 5 seeds 14471–14475,
  sequential. PILOT FIRST (§9): seeds 14471–14473 run first; the
  panel expands to 14474–14475 only if the instrument holds (smoke
  green, no instrumentErrors, stranger counters populating). If the
  pilot shows 0 alien kills on all 3 seeds, that IS a finding about
  the channel's rate (not an instrument failure) and the expansion
  still runs — the pilot gate is about the instrument, not the answer.
- Smoke first: SEED=14471 DAYS=5 into the r223 evidence dir, driver
  runs, no instrumentErrors, stranger counters present.
- Driver: r216 driver verbatim EXCEPT r223 filenames/paths/seeds
  (14471–14475), ORIGINS map keys, EVID path 2026-11-16, DAYS 150.
  No behavior change: originals called first, returns preserved.
  RUINROAD env stays OFF (arm parked, see above).
- ORIGINS: Seattle/Boston/Austin/Chicago/Phoenix keyed to all five
  r223 seeds (r201 hygiene carried — r192's map silently fell back
  to St. Louis for unkeyed seeds).
- Analyzer: r216 analyzer verbatim EXCEPT r223 filenames/paths
  (the r216 seed-scoped dedupe fix is IN the r216 analyzer and
  carries). Validated on r216's JSONs before the panel: carried
  numbers reproduce exactly.

## Pre-registered metrics (bind the run, §14)

- D1 DRY CENSUS (binding for the r192 fix surfaces): deflect_q,
  confront:*, warn_you, dlg:doubt dry lines = 0 on the panel
  (F1/F2/F3's proof in the wild); other-surface dry lines reported
  with pick attribution, no bar. Any dry line on a NEW surface is
  the next fix item, named in the run note.
- Q6 RETIRED (r201 metric review): gorge-after-clear id-matched
  0/5 for the eighth consecutive zero panel — METRIC-BROKEN,
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
  any resume opener naming a favor that changed since planting
  (within 14 days) is recorded with exact lines; it is a FINDING,
  not a bar — no fix without transcript evidence. The r137 re-pose
  path is checked separately: any re-posed question that names the
  wrong favor is a REGRESSION of r137, filed LOUD.
- C3d RECAP-AFTER-FAVOR-COMMIT WATCH (new this run, r216 follow-up):
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
  wins/losses vs r216's 7 arena deaths, no bar.
- FUNERAL-MEND WATCH (descriptive, confirm): funeral lines naming
  the mend (links mended, kcal spent, shortfall said aloud) +
  funeralMendStats counters per seed; any silent mend, silent
  shortfall, or over-claim line is a FINDING (over-claim = r216 F1
  REGRESSION).
- CASCADE WATCH (descriptive): scholar deaths with a lingerer as
  the killer (vs the control-pilot shape: a lingerer stepping onto
  the scholar inside the hall); gorge nights and sortie shape vs r216.
- NODEAWAY WATCH (descriptive, r216 follow-up): nodeAway exclusions
  and gate-one-short refusals vs r216's 39/11; a repeat at the same
  scale makes the muster-vs-travel tension a design question.
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
go there and revisions apply to the NEXT run. Open from r216:
(1) Q6 retired to descriptive-only (METRIC-BROKEN) — done r201.
(2) Dialogue-only fixes are NOT trajectory-neutral while voiceLine
draws RNG — the r192 fixes spend no RNG on the common path;
pre/post trajectory comparisons stay descriptive, never fix-effect
claims. The r216 funeral fix likewise spends no RNG — its postfix
check (seed 14461, two lines changed, days/end identical) is a
regression check, not a fix-effect claim. (3) For supply-gated
fixes, the unit test is the proof and the panel is a regression
check only. (4) Telemetry baseline units — verify crisis.json
units before any roll (carried). (5) The `want`-thread label is a
function of the CURRENT favor, but the topic ledger stores it as a
snapshot — every consumer that trusts the stored label can misname
the favor after a change (lapse line fired r208, fixed; settled-line
gate bypass was latent, fixed; resume openers read L.open[].label
directly and were NOT fixed — C3c watches them; r137's re-pose
reads the live want with a label guard, a partial live re-derivation
at the use site). Any future thread-label fix should re-derive want
labels live at the use site or at record time, never trust the
stored snapshot. (6) Median-death-day movement is a panel-level
descriptive, not a per-change claim: with n=5 and overlapping
distributions, no lever is isolated by this panel. A future crisis
run that wants to attribute a survival shift needs a matched-seed
A/B on one change, not a fresh-seed panel. (7) The funeral-mend
public line is a SECOND consumer of a stored-vs-live value (r216
metric review): any line that states a number the mechanics
computed proportionally must be checked against the computed value,
not the nominal one. (8) Analyzer panel-wide dedupe maps must be
seed-scoped (r216 F2): any cross-seed census keyed without the seed
will false-positive whenever two seeds share the key.
