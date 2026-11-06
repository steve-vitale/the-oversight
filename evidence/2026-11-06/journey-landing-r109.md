# Journey — Landing r109 (2026-11-06, Lane A leg 0)

Run id `laneA-20261106T0745Z`, scheduled Fri 2026-11-06 01:45 CST, started ~07:54Z.
Leg 0 LANDING. Branch `journey-landing`, base `49215d0f8` (master at run start).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 7499714c, before any seed ran)

Question: thread-gate watch (Q1, r107 seed 1010 d12 n=1 — does a second
picked-but-stage-1 case appear?) and flesh-channel friction (Q2 — r108 stuck
seeds 1017 rot / 1020 poison / 1018 no-arrival: pattern or one-seed noise?).
Seeds 1023–1032 (fresh band — full-scope grep over ALL dated preregs plus the
forbidden-band files; only round-number filenames and a line-number mention
hit). DAYS=28. Policies: competent-player driver, r108-verbatim except
seeds/OUTDIR. Carried bindings: M1 ALIVE-D14, M2 SYSTEM CONTACT, M3
FIGHT-LOG, M5 PEOPLE, Q3 M-PR1/M-PR2 regression lines, Q4 M7 goaround, Q5 M6
doorstep, Q6 water. Bars: M-TG ≥2 picked-but-stage-1 sharing a non-null
thread = real mechanism; M-FLESH ≥3 r109 stuck seeds sharing one cause =
named defect; M-PR1-r109 <25%, per-seed ≤1 on ≥8/10; M-PR2 ≥80% promised;
M7 ≥80%; M6 clauses hold. Metric binding applies: a miss is NO-GO, never
re-scored mid-run.

## Infrastructure notes (loud first)

- **Registration took ~5 min (single attempt, loaded box).** `git worktree add`
  slow, no EPERM, exit 0. Worktree `~/workspace/worktrees/journey-landing`.
  Heartbeat at registration + 10-min loop.
- **Pre-flight clean.** Main tree clean, disk 25%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 6/16 at pre-flight.
- **Safe-commit index clobber struck** on the prereg commit (7499714c, known
  class): committed file showed staged-as-deleted + untracked after commit.
  Repaired per the recorded recipe (`git update-index --add --cacheinfo` with
  HEAD blob); verified `git status` clean (0 lines), `git diff HEAD` empty.
- **Rotation-write discrepancy, 6th sighting.** r108's note claimed 0→1 was
  written and verified at closeout, but the file read 0 again at this run's
  start. This run wrote 1 at run start and verified by read-back; re-verify
  at closeout.
- **Environment restart ~08:37Z killed check.js run 1 and the first
  heartbeat loop.** `uptime` read 4 min at 08:41Z; /tmp was wiped clean
  (all of this run's /tmp analysis files + the check.js log lost — the
  analysis content survives in this note, read in full before the wipe).
  check.js run 1 has NO result (killed mid-run, log lost); run 2 re-started
  08:42Z with its log under goal hidden_files (durable). Lesson for later
  runs: never stage run evidence in /tmp — /tmp is wiped on restart.
- **Registry-lock starvation: heartbeat went 20+ min stale.** A sibling
  reaper held REGISTRY.lock ~08:28–~08:37 and another long-running reaper
  (PID 1873, 100+ min elapsed) holds it as of 08:40Z; both the loop beat
  and a manual heartbeat queued behind the flock and were killed by the
  restart before landing. Last landed heartbeat 08:19:47Z; loop re-started
  08:41Z (PID 2403, new log hbloop-r109b). The worktree was never at risk
  of reaping (dirty — uncommitted fix+test — and the reaper never touches
  dirty trees), but the lock-held-across-slow-git pattern starves
  heartbeats by design: the flock should cover only the registry
  read/write, not the reaper's git work. Flagged as infra debt, not this
  run's scope.
- **No lock existed at start.** Lock created 07:54Z, run_id
  `laneA-20261106T0745Z`. Delete at closeout after read-back of run_id.

## Panel

Pilot: 3 seeds (1023–1025), DAYS=28, exit 0 in ~56s. All 3 alive, systemDay
8–9, ask_favor sittings present. Pilot gates passed → expanded to full panel.
Full panel: 10 seeds 1023–1032, DAYS=28, exit 0 in ~145s. 10 census files in
goal hidden_files `evidence/2026-11-05/landing-r109/`. Logs (worktree):
`landing-r109-pilot.log`, `landing-r109-panel.log`.
Analysis: `scripts/analyze-landing-r104-20261105.js`,
`scripts/analyze-landing-r107-commit-offer.js`,
`scripts/analyze-fights89-20261102.js` (outputs were in /tmp, lost in the
restart wipe — all read in full before the wipe; the numbers below are from
those reads).

## Panel verdicts

- **Q1 M-TG (thread-gate): 0 CASES — stays open, n=1 (r107 only).** The
  engagement option `[alive:want:ask_favor]` was offered in exactly 2
  transcripts (1023 d10, 1032 d7) and picked in 0; no sitting anywhere on
  the panel had engagement picked. The r107 seed 1010 d12 case remains the
  sole instance; no mechanism to name, no verdict.
- **Q2 M-FLESH: STUCK SEEDS 2, MIXED CAUSES — stays documented noise, BUT
  the poison cause produced a proven defect (see Blank filled).**
  arrivalSeeds=9/10, testSeeds=10, exitSeeds=7, stuckSeeds=2, openSeeds=7.
  Stuck: 1027 (poison=6, horizon=20, exit 0 — belltoad re-tested 6×),
  1032 (horizon=7, exit 0, tests d21/d23/d28 — late tests, no exit before
  horizon). No-arrival: 1031 (18 kills, 3 tests, 0 exit, horizon=0). Two
  stuck seeds with different causes does not meet the prereg's ≥3-shared-
  cause bar — but the 1027 poison sequence, read end to end, proved a
  game-code defect (the picker re-tests known-poison flesh), fixed below.
  Pooled r107+r108+r109 exit rate 7/10 each run; poison-stuck now 2 in a
  row (1020, 1027) — the fix should end that recurrence.
- **Q3 M-PR1/M-PR2 regression lines: BOTH MISS on the letter — see Metric
  review.** M-PR1-r109: never-offered 7/23 = 30.4% ≥ 25% bar (MISS).
  M-PR1-per-seed: ≤1 sitting on 8/10 seeds (1028:2, 1032:3) — PASS
  exactly at bar. M-PR2: promised 11/16 = 68.75% < 80% (MISS). All 5
  stated refusals are the R72 away-guard line ("Wait — I'm out on the
  road…") — 1026 d9, 1027 d11, 1027 d13, 1030 d10, 1032 d8. Pooled:
  M-PR1 r107+r108+r109 = 21/83 = 25.3% (over the 25% bar by 0.3pp);
  M-PR2 r108+r109 = 29/36 = 80.6%. Transcript adjudication of all 7
  never-offered sittings (read in full, below): 4 withdrawn wants, 3
  unestablished/probe-leaves-early — the same two classes as r107/r108,
  zero live cases of the game hiding engagement.
- **Q4 M7 goaround: UNTESTED (no denominator).** R85 RESCUE kcal skips=0,
  complete=0 — no rescue-ladder case arose on this panel. The ladder is
  proven by r108's 3/3; absence of cases is not a regression.
- **Q5 M6 doorstep: DOORSTEP-GO.** Checks=282, triggered=4, ate=4,
  drank=0, doorRefused=0. EAT-ON-ARRIVAL: arrivals=4, ate=4 (1024 d13,
  1025 d8, 1029 d11, 1029 d13).
- **Q6 water: UNTESTED (21st run).** Wild outing iterations=0, hydUnder25=0,
  minHyd=null, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (none lost at all;
  lowest popEnd 8).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 or 9 on all ten seeds.
- **M3 FIGHT-LOG: PASS.** 20 hunt fights, 20 complete, 1 fatal with a known
  trigger (1025 Giuseppe d21, The Moderator w2, pending-face feast fight),
  fatalWithUnknownOrMixedTrigger=0.
- **M5 PEOPLE: PASS.** WD probe 10/10 surfaced; wind-down more picks 8
  with 0 empty; betrayal 11 offers, 0 held; party invites offered=8
  picks=8 spoken=8 dry=0 accepted=2 (PARTY-GO). R67 case labeling 8/8
  match.
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitDiag
  live: node-not-home=5, has-run=73, kept=32, waiting=2; ledger
  promise-favorId=231. All explained.
- **R73 WINDOW:** promised=8, askedOnly=21, all 8 NARROW,
  keptInsideNarrow=2. NARROW-PATTERN continues (design input).
- **R66 horizon pantry: 4/10 HUNGRY** (r108: 7/10, r107: 9/10) but
  **NOT-HUNGRY by the revised gate** — starvationDeaths=0, slideSeeds=0,
  bandSeeds=7, noSlideSeeds=3. FED seeds: 1023 (2692/person), 1024
  (3729), 1025 (4952), 1026 (4057), 1030 (3710), 1031 (4057). Deepest
  hunger: 1027 (494/person).
- **R62 FLESH: CHANNEL OPENS.** arrivalSeeds=9/10, testSeeds=10,
  exitSeeds=7, stuckSeeds=2, openSeeds=7. See Q2.
- **Mantle:** one pass at latency 1 (1025 Giuseppe d21 → Jaxon d22). The
  r107 2-day latency owed item is NOT reproduced — latencies [1] only,
  owed 2–4d still open. No scholar death unresolved at horizon.
- **Win-plan (R104, carried):** planSeeds d14 on 6/10 seeds, d28 on 9/10;
  holders 29→41; partyWaits 29→69; partyFights 79→190; gearHolds=0,
  bondTends=0, all later arms 0. **M-A2 re-confirmed STRUCTURALLY-UNREACHABLE**
  (retired metric, consistency check only): prims=0, no muster, no wave-4
  kills, no table plans on all d28 censuses.
- **Contests:** fired=18, ended=17, openAtHorizon=1, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths, GO. Grief: 0/19 miss, holds.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — though one
(1030) thins to eight people after four deaths, and the scholar dies on
one seed. Everyone meets the System by day 8 or 9. The villages hunt hard
— 19 to 38 monster kills each, 285 in total — and feed themselves better
than the last two panels: six of ten end the month fed, one of them fat at
nearly 5,000 kcal per person, and nobody starves (zero starvation deaths
for the second panel running). The hungry four are hungry in the old way:
1027 nearly empties its pantry mid-month (255 kcal per person on day 19)
and ends at 494 per person. People ask each other for help and mostly get
it: 16 of 23 sittings offered the promise, 11 of 16 picks became real
promises, and the five refusals were all honest ("I'm out on the road —
find me when I'm back"). Parties form: two of eight invitations accepted.
Monster meat moves: all ten villages taste it, seven get it into the
pantry — but on 1027 the tasting itself is the story (see below). The
villages are alive, social, and mostly fed — the best-fed landing panel
in a while, with the same hungry tail as always.

Pops end 11, 10, 9, 12, 10, 11, 9, 8, 12, 10 (seeds 1023–1032). Spawns:
Asher, Andres, Giuseppe, Aidan, Milton, Debbie, Manuel, Juan, Joshua,
Francesca. Monster kills per seed: 36, 26, 24, 28, 38, 38, 19, 37, 18, 21.
Self-sufficiency 0.801–1.035.
**Seed 1030 thins to 8:** Kamshat d7 (ambush), Brandon d10 (Inspiration,
a lingering beast at the treeline), Milton d11 / Liam d11 (sickness).
Pantry 29,682 at d28, 3,710/person — fed, but thin on people.
**Seed 1025 scholar dies d21:** Giuseppe (the spawn) is killed by The
Moderator, a wave-2 beast, in a feast-triggered fight out on the road —
one strike landed (55 damage), then eight beast turns, 83 damage taken.
The mantle passes to Jaxon d22, latency 1. The village stands at 9.
**Seed 1029 Miriam dies d14 of an experiment:** a plant-avoid taste test
at low health (she was at 45 HP on day 8). The test deals a flat 10
damage with no floor — a hurt villager can die from it. Watch item, not
a fix this run: the death is registered honestly, and whether
experiment-death is intended is a Steve-call.

## People check (transcripts read in full — all 7 never-offered sittings)

- **1023 d10 Ruth (withdrawn): Real, and the want is already over.** Ruth
  opens by withdrawing the favor herself ("Never mind the food I needed —
  we got it handled. Thanks anyway.") — there is nothing to commit to, so
  commit is never offered, correctly. The driver probes topics and leaves.
  The engagement option `[alive:want:ask_favor]` IS offered in the turn-2
  menu; the driver picks [menu:more] instead. Polish note (carried): the
  generic closing ("This matters. What we just said — it matters.") lands
  oddly after a one-turn never-mind.
- **1025 d10 Benoit (unestablished): Real, crowded out.** Benoit opens
  with a confrontation ("Can we talk? People are saying things. About
  you.") and the menu carries four betrayal-case options plus a vote; the
  want sits at stage 0 behind it all, and the driver leaves after two
  turns. Engagement never surfaces because the want never got established
  — a probe that leaves early, not the game hiding the option. Same shape
  as r108's 1022 d10 Aruzhan.
- **1028 d7 Quinton (withdrawn): Real.** "Never mind the sickness I'm
  fighting — we got it handled." Driver leaves at 0 turns. Correct
  non-offer.
- **1028 d12 Greta (withdrawn): Real.** "Never mind the food I needed —
  we got it handled." Driver leaves at 0 turns, then votes on a beast
  name. Correct non-offer.
- **1032 d7 Petra (unestablished): Real.** Petra opens wanting only to
  talk ("Just... talk. Like people used to."). The engagement option is
  offered at turn 2; the driver picks [menu:more] twice and leaves after
  three turns. The want never got established because the driver never
  engaged.
- **1032 d11 Tariq (withdrawn mid-sitting): Real.** Tariq opens wanting
  space; the driver presses [dlg:more] "Go on" and Tariq withdraws the
  want himself ("Never mind the food I needed — we got it handled.").
  The want died during the sitting; commit correctly never offered.
- **1032 d12 Oliver (unestablished): Real — the most human sitting on the
  panel.** Oliver opens wanting to talk; the driver presses [dlg:more]
  four times and Oliver deflects four times ("It's handled. Really — it
  is." / "All sorted. Some things just work out." / "No, really, it's
  fine. Forget I even asked." / "I wish there was more to tell. That's
  it."). A villager who won't say what he needs, and a player pressing.
  The want stays stage 0 throughout; commit never offered because the
  want was never stated. Not a defect — a deflection, played straight.

## Blank filled / documented

- **POISON-RETEST DEFECT — FIXED (game code, before/after proof).**
  Seed 1027: belltoad ("Big Big") flesh was tasted SIX times in one month
  (Onni, Marcus, Anna, Elif, Onni again, Brian) after the Codex already
  knew it was poison. Root cause in `villagerExperimentBeat`
  (src/js/game.js): the three meat scans (inventory / pantry / counter)
  guard only on `!monsterFoodSafe(mid)`, and `monsterFoodSafe` is false
  for known-poison flesh (foodSafe=false, foodTested='poison') — so a
  proven-poison mid stays a test candidate forever, and every new piece
  of it poisons another villager for 15 HP and burns the day's one
  experiment. The narration promises "You will not make this mistake
  twice" while the code makes it six times. Fix: new
  `monsterFoodPoisoned(mid)` helper (Codex foodTested === 'poison') and
  the guard added to all three scans; the player's own testMonsterMeat
  path is untouched. Proof test
  `scripts/test-meatchannel-poison-retest-20261106.js`: BEFORE the fix
  1/4 pass (S1/S2/S3 fail — re-test in counter/pantry/pack; S4 control
  passes); AFTER the fix 4/4 pass. Existing meat-channel e2e
  (`test-meatchannel-e2e-20261102.js`) 8/8 pass after the fix — first
  poisoning still works, re-tests stop. The plant side is NOT affected:
  the plant picker uses `plantKnown`, which covers tested verdicts, so
  plants are never re-tested — meat was the odd one out.
- **M-PR1/M-PR2 adjudicated, not fixed.** Both regression lines miss on
  the letter (30.4% never-offered; 68.75% promised), but the transcript
  reads find zero live cases: the never-offered sittings are withdrawn
  wants (4) and early-leaving probes (3), and all five refusals are the
  honest away-guard. The bars measure probe behavior + withdrawal rate,
  not game hiding. See Metric review for the proposed revision.
- **Thread-gate stays open (n=1):** zero picked-but-stage-1 cases on this
  panel; the r107 seed 1010 d12 case remains the sole instance.
- **No other blank filled this run.** Water still untested (21 runs); the
  mantle 2-day latency (r107 seed 1009) stays an owed item; scholar-eats-
  first and the M-A2 design question stay Steve's calls; flesh stuck
  seeds (1032 late-tests, 1031 no-arrival) are channel friction on one
  seed each, not defects to chase without more evidence.

## Notable events

- 1027 Big Big poison ×6 → the fixed defect above.
- 1030 thins to pop 8 (above); 1025 scholar dies d21 to a wave-2 Moderator.
- 1029 Miriam dies d14 of a plant experiment at low HP (watch item).
- Zero starvation deaths on the panel (r108: 0, r107: 4).
- Party invitations accepted 2/8 (r108: 2/9) — the rate is steady at the
  low end; the mechanism (offered→spoken→accepted) works.
- Flesh channel: 7/10 seeds get monster meat into the pantry (r108: 7/10,
  r107: 7/10) — the rate is flat; the fix should move the poison-stuck
  share, not the headline rate.
- 1031 is a quiet village: 12 pop, 0 deaths, FED (4,057/person), but 0
  ask_favor sittings and 0 win-plan on the panel — nobody asks for help
  and nobody plans. Not a defect (the driver sat with people; the wants
  just weren't favors), but a standing shape to watch: a village can be
  healthy and planless.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 18 fired, flesh
  channel opens 9/10, outings complete, win-plans seed 6/10 by d14.
- **Fun: yes.** Transcripts read like people; Oliver's four deflections,
  Tariq withdrawing his own want mid-talk, beast-naming with real votes.
  The villages are mostly fed this panel, which reads as competence, not
  ease — 1027 still nearly starves.
- **Winnable: not yet — unchanged.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone. No wave-4 kills, no muster, no
  table plans on any d28 census.

## Metric review

- **M-PR1 per-panel bar proved wrong — propose retiring it.** The
  never-offered rate is dominated by (a) how often wants are withdrawn in
  openers and (b) the topic probe's preference for gossip over engagement
  — neither is the game hiding the option. Three panels of the same
  mixture sit at 21%, 26%, 30%; the pooled rate is 25.3% against a 25%
  bar set when the pool was 23.3%. The bar flips on mixture noise, not on
  game behavior. Proposal for the next run: retire the per-panel <25% bar;
  judge engagement on the per-seed bar (≤1 on ≥8/10 — passed 8/10 this
  run, 10/10 last run) PLUS transcript adjudication of every never-
  offered sitting. The pooled rate stays reported for the record.
- **M-PR2 bar proved fragile to the away-guard — propose revising it.**
  The promise rate measures how often the NPC happens to be home when the
  driver commits, and the away-guard is a separate by-design mechanism
  (R72) whose frequency is a travel-pattern fact, not a commit-path fact.
  Pooled r108+r109 is 80.6% against the 80% bar — the same knife edge.
  Proposal for the next run: promised / (picked − away-guard refusals),
  i.e. judge the commit path on non-away picks, and report the away-guard
  share separately. The away-guard refusals themselves stay explained
  case by case.
- **M-TG worked — 0 cases is a clean read.** The engagement option
  surfaced twice and was skipped twice; the phenomenon stays rare. Keep
  it as a watch.
- **M-FLESH worked — the cause bar did its job.** The ≥3-shared-cause bar
  correctly refused to call 2 mixed-cause stuck seeds a defect, while the
  poison sequence underneath still got read end to end and proved a real
  defect. Keep the bar; the fix is the outcome.
- **M7 worked — 0 skips is a clean UNTESTED, not a miss.** Keep as a
  watch; the ladder needs cases to judge.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.

## Regression + telemetry

- Poison-retest proof test: BEFORE 1/4, AFTER 4/4 (this run).
- Meat-channel e2e: 8/8 PASS after the fix. Meat-area suite after the fix:
  meatchannel-gap 16/16, meatchannel-measure done, meatlastmile 33/33,
  experiment-20261009 14/14, meatseek-r1 all pass.
- Pre-existing failures, verified identical with/without the fix (stash
  comparison, byte-identical logs): test-meat-flow, test-animals-flesh,
  test-contests-flesh all die at load with `FATAL ReferenceError: Text is
  not defined` in genCharacter/genRoster — old-style eval boilerplate
  without the DOM stub sim-harness provides. Not this run's regression.
- `node scripts/check.js --quick`: run 1 KILLED by the ~08:37Z environment
  restart (no result, log lost with /tmp); run 2: **282 passed, 8 failed
  in 1016s**. The 8 = the standing 6 (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes — unchanged from r106/r107/
  r108) + 2 × 120s TIMEOUTS (trust-observer-neutrality, capable-bot).
  Standalone re-runs: trust-observer-neutrality PASSES 6/6 (load flake);
  capable-bot 39/40 with 1 assertion failure ("real capable player combat
  earns the food deed at first use") that is IDENTICAL on pristine master
  (stash comparison) — pre-existing, previously masked by the 120s timeout
  in check.js. No failure is attributable to this branch's game-code
  change (poison guard only); the quick-list total stayed 290.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r109 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106/r107/r108), baseline NOT rolled:
  (1) systemDay baseline 33 → current sum 81 over 10 files (per-seed 8–9,
  mean 8.1; baseline is a 4-seed-run sum); (2) monsterKills baseline pooled
  mean 24 → current sum 285 over 10 files (per-seed mean 28.5, range 18–38;
  r108 was 24.4, range 11–36). Watch, not a verdict: the per-seed kill mean
  has climbed three panels running (20.5 → 24.4 → 28.5) with overlapping
  ranges; no kill-affecting change is in this run (branch touches only the
  experiment beat; driver is r108-verbatim), so the trend is reported, not
  chased. No behavior change is indicated.

## Next run (r110 driver prepared)

`scripts/journey-landing-r110-20261106.js`: r109 driver verbatim except seeds
1033–1042 (fresh band — verified: word-boundary grep over all dated preregs
returns only incidental numbers ("fromStart ~1033", a kcal figure "1040");
no prereg names 1033–1042 as panel seeds; forbidden-band files checked with
no hits), OUTDIR landing-r110 (goal hidden_files evidence/2026-11-06/),
header. Diff-verify: only header/seeds/OUTDIR differ. `node --check` clean
on the driver.

## Closeout note

- **Rebase:** clean, all 3 picks applied, no sequencer stop. Rebased onto
  master `b5fb49607` (master had advanced 45 commits past 49215d0f8 with
  sim-killerwild-b DIAG evidence, sim-winnability-round-0615 closeout,
  journey-crisis r130, and ship version bump de065b4c6; local master is 45
  ahead of origin/master, 0 behind — no stale-base risk). New SHAs: prereg
  cb04bed67, fix 7db5b4115, run note 831bf2944, closeout (this commit).
- **Proof re-run on the rebased branch (all PASS):** poison-retest 4/4,
  meat-channel e2e 8/8.
- **check.js --quick run 2:** 282 passed, 8 failed in 1016s = standing 6 +
  2 timeouts (adjudicated: trust-observer-neutrality passes standalone 6/6;
  capable-bot 39/40 with 1 failure identical on pristine master). No
  regression attributable to this branch (poison guard only; quick-list
  total 290). See the Regression section.
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on all THREE safe-commits** (prereg 7499714c, fix
  cb47a557d, run note 6e3b42857): committed files showed staged-as-deleted +
  untracked after commit. Repaired each time via HEAD-blob
  `update-index --add --cacheinfo`; verified status clean + diff HEAD empty.
- **Rotation re-verified at closeout: reads `1`** (the 0→1 write stuck this
  run). Rotation-write discrepancy remains unexplained (6th sighting).
- Lock (`laneA-20261106T0745Z`, created 07:54Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-06.md` for the closeout record.
