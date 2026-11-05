# Journey — Landing r107 (2026-11-05, Lane A leg 0)

Run id `laneA-20261105T1945Z`, scheduled Thu 2026-11-05 13:45 CST, started ~19:43Z.
Leg 0 LANDING. Branch `journey-landing`, base `bb703eb19` (r106's branch, reused);
rebased onto master `5d8715e80` at closeout (see below). Rotation 0→1 written 20:07:33Z.

## Prereg (committed 6bce0f17d, before any seed ran)

Question: adjudicate R70 (live-promise dawn wait) by live-promise status, and
the promise bottleneck (Q1b: engagement offer M-PR1, refusal M-PR2) — the two
open landing questions r106 left. Seeds 1003–1012 (fresh band; r106's prepared
897–906 is CONTAMINATED — seeds 901–907 used 2026-10-13 by journey-succession
corpora). DAYS=28. Policies: competent-player driver, r106-verbatim except
seeds/OUTDIR. Carried bindings: M1 ALIVE-D14, M2 SYSTEM CONTACT, M3 FIGHT-LOG,
M5 PEOPLE, Q2 M7 goaround, Q3 M6 doorstep, Q4 water. Bars: M-R70 ≥3 seeds with
a live promised favor at dawn + waiting=false + bad waitDiag; M-PR1 never-offered
<25% of sittings; M-PR2 promised ≥80% of picks. Metric binding applies: a miss
is NO-GO, never re-scored mid-run.

## Infrastructure notes (loud first)

- **Worktree registration, 3 attempts (~45 min).** Attempt 1 hit the 180s
  timeout (loaded box; Lane B `journey2-crisis` registering concurrently, its
  `git worktree add` in D state). Attempt 2: waited 600s for the sibling add,
  then register hit the 300s timeout; manual fallback showed
  `fatal: could not write to '.git/worktrees/journey-landing/locked':
  Operation not permitted` — **EPERM flap active ~20:18Z**. The orphaned git
  child died and its partial dir was cleaned up by git. Lane B's registration
  also failed that round. Attempt 3: O_EXCL probes passed in /tmp and
  ~/workspace (flap cleared); register with 1800s timeout succeeded in 215s
  (REG_EXIT:0). Worktree `~/workspace/worktrees/journey-landing`, registered
  20:26:47Z. Heartbeat loop started immediately (PID 23923, 10-min interval).
- **Master advanced during registration.** Loop A sim-enddaybeats-a landed 4
  commits (ce65b233e prereg, d0da37085 instrument+proof, 739fc057f evidence,
  5d8715e80 corpus). HEAD is now `5d8715e80` (evidence/scripts only, zero
  src/js). Worktree bases on bb703eb19; rebased onto 5d8715e80 at closeout
  (zero file overlap expected), proof tests re-run, then merged --ff-only.
- **Safe-commit index clobber struck** on the prereg commit (6bce0f17d, known
  class): committed files showed staged-as-deleted + untracked after commit.
  Repaired per the recorded recipe (`git update-index --add --cacheinfo` with
  HEAD blobs); verified `git status` clean (0 lines), `git diff HEAD` empty,
  hash-object matches HEAD for all 3 files. Expect it again on this commit;
  same repair.
- **Rotation-write discrepancy, 4th sighting.** r106's note claimed 0→1 was
  written, but the file still read 0 at this run's start (mtime 18:42:48Z =
  scale r100's 3→0 write). The closeout write fails silently and
  intermittently (deepening r103/r104/r105 documented the same for 2→3;
  r105's write stuck, r106's did not). This run wrote 1 at 20:07:33Z and
  verified by read-back; re-verify at closeout.
- **Pre-flight clean.** Main tree clean, disk 30%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 10/16 at pre-flight, 9/16 later.
- **No lock existed at start.** Lock created 19:46:47Z, run_id
  `laneA-20261105T1945Z`. Delete at closeout after read-back of run_id.

## Panel

Pilot: 3 seeds (1003–1005), DAYS=28, exit 0 in ~23s. All 3 alive, systemDay
8–9, 14 ask_favor engagements. Pilot gates passed (seeds 1003+ ran; commit-offer
method reproduced; Q1/Q1b signal present) → expanded to full panel.
Full panel: 10 seeds 1003–1012, DAYS=28, exit 0 in ~28s. 10 census files in
goal hidden_files `evidence/2026-11-05/landing-r107/`. Logs: `landing-r107-pilot.log`,
`landing-r107-panel.log`, `journey-landing-r107-register.log`.
Analysis: `scripts/analyze-landing-r104-20261105.js` → `/tmp/r107-analysis.txt`;
`scripts/analyze-landing-r107-commit-offer.js` → `/tmp/r107-commit-offer.txt`;
`scripts/analyze-fights89-20261102.js` → `/tmp/r107-fights.txt`.

## Panel verdicts

- **Q1 M-R70 (live-promise dawn wait): R70-as-named CLOSED as a stale-ledger
  artifact.** waitSeeds=6/10 (r106: 4/10). Panel waitDiag totals: opps=366,
  promise-favorId=207 (ALL ledger, live={} for that value), live waiting=10,
  has-run=107, kept=38, node-not-home=3, away=1. The 4 never-waited seeds:
  1007 (live has-run=2 — the run was already live), 1008 (1 live
  node-not-home opp — Paola, favor `favor-gen_g1cq9lh-11-4`, promised d11,
  meet d12, deadline d13; **Paola DIED d12, monster — the promiser died on the
  meet dawn**, so there was no one alive to wait for), 1010 (live={} — all
  stale), 1011 (live={} — all stale). Only 1 seed meets the pre-registered
  defect pattern vs bar ≥3, and that one is explained by the promiser's death.
  Basis from the r106 re-analysis: r106's 6 never-waited seeds were likewise
  dominated by stale-ledger promise-favorId rows; door-side action reasons are
  the action check's reply on rows with no live promise. **0 genuine
  dawn-wait defects on the panel.** The dawn-wait machinery works when a live
  promise exists and the partner is home and alive (10 waiting opps across 6
  seeds, approach crossings making them ready).
- **Q1b M-PR1 (engagement): NOT confirmed — near-miss.** Never-offered 7/33
  sittings = 21%, below the pre-registered 25% bar (25% of 33 = 8.25; one
  sitting short). r106 was 7/27 = 26%. Do NOT re-score; recorded as a miss
  (see metric review). Adjudication: in sampled never-offered sittings the
  engagement option `[alive:want:ask_favor]` WAS offered 1–3× and the driver
  didn't take it (topic probe took gossip instead — 1003 d13 read fully:
  Brian's opener hints at sickness, engagement offered once at turn 2, driver
  drilled gossip depth 1→7, want stayed stage 1, resolution 'unresolved').
  One case (1010 d12): engagement PICKED once but want stayed stage 1 —
  thread-gate hypothesis (convo-dialogue.js:293 engage only when thread is
  null/'want'/'small'), open question for a future run, n=1, not a verdict.
  **The bottleneck is a driver-probe interaction, not the game hiding
  engagement.**
- **Q1b M-PR2 (refusal): commit path working as designed.** Picked=26,
  promised=24 (92%); statedAfterPick=2, BOTH the R72 away-guard line
  ("Wait — I'm out on the road. I can't ask you to meet me at dawn when I'm
  miles away. Find me when I'm back, and we'll set it then.") — 1005 d11 and
  1011 d9. Code-read grounding: `convoFavorCommit` (convo-wants.js:1603)
  refuses when villager away (R72), action unsupported, favor closed, or an
  unkept promise to that villager already exists (one open commitment per
  villager, keyed by vid); `dlg:commit` handler (convo-dialogue.js:503)
  resolves refused commits as 'stated'.
- **R73 WINDOW:** promised=15, askedOnly=23 (promise rate 39%; r106: 13/19,
  41%). All 15 NARROW, keptInsideNarrow=3. NARROW-PATTERN continues (design
  input).
- **Q2 M7 goaround: GOAROUND-HOLDS.** kcal skips=6 complete=6 = 100% ≥ 80%.
  Rung fires: first-travelTo:arrived ×2, walkHome:reached ×4 (steps 2,2,3,3).
  Bridge/detour/clear rungs did NOT fire this panel (r106 had clear:washed_out
  fire once).
- **Q3 M6 doorstep: DOORSTEP-GO.** Checks=274, triggered=2, ate=2, drank=0,
  doorRefused=0. EAT-ON-ARRIVAL: arrivals=6, ate=6.
- **Q4 water: UNTESTED (19th run).** Wild outing iterations=14, hydUnder25=0,
  minHyd=72, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** overAt None on 9 seeds; 1008 overAt=23
  (after day 14).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 or 9 on all ten seeds.
- **M3 FIGHT-LOG: PASS.** 24 hunt fights, 24 complete, 4 fatal,
  fatalWithUnknownOrMixedTrigger=0.
- **M5 PEOPLE: PASS.** WD probe 10/10 surfaced; wind-down more picks 10 with
  0 empty (1012 had 0/0); betrayal 16 offers, 0 held; party invites
  offered=6 picks=6 spoken=6 dry=0 accepted=5 (PARTY-GO; r106: 0 accepted).
- **R66 horizon pantry: HUNGRY.** StarvationDeaths=4, slideSeeds=1,
  bandSeeds=4, noSlideSeeds=5. **9/10 seeds end HUNGRY** (finalPerPerson
  <2000; only 1010 FED at 4643/person). r106: 7/10.
- **Starvation deaths: 4, all class F (NPC)** — class-F fix working. Boris
  d22, Olivia d23 (seed 1006); Nikos d21, Kyle d23 (seed 1008).
  ScholarDeaths=4 on 3 seeds: 1009 Kathleen d8 "the wild" → mantle Wanjiru
  d8 (latency 0); Wanjiru d24 "the wild" → mantle Felicia d26 (latency 2 —
  analyzer flags "LIVE 2-4d LATENCY (owed item)"); 1010 Esther d27 "the
  arena" (gauntlet contest) → Bessie d27 (0); 1011 Heinrich d23 sickness →
  Werner d24 (1).
- **R69 armor: ADJUDICATED + FIXED (instrument defect, not a game defect).**
  seedOK=10/10, barkSeeds=10/10, craftSeeds=10/10, pileSeeds=0/10,
  teleLineDisagree=9 (r106: 7). Root cause, proven by code-read: the driver's
  fail-line regex `/came apart in their hands/` matches THREE craft systems
  in src/js/villager-build.js — armor fail (1211: "spent the afternoon
  sewing, and the … came apart"), weapon fail (1374: "at the workbench, and
  the … came apart"), ammo fail (1531: same wording) — so craftLinesFail
  counted weapon+ammo failures while craftTeleFail counted armor_craft events
  only. Secondary contributor: telemetry is capped at 300 events
  (game.js:47180), so early armor_craft events can be evicted; tele is a
  lower bound. (Also: the SILENT-ARMOR-CRAFT rule means crafts while the
  player is away emit no line at all, so the two counts measure different
  things by design.) Fix: narrowed the fail regex in the r108 driver to
  `/spent the afternoon sewing, and the .* came apart in their hands/`
  (armor-only wording); ok regex already armor-specific ("sewed a" — weapon
  says "made a", ammo says "made N"). Proof test
  `scripts/test-landing-r107-armor-craft-line-regex.js`: FAIL on the r107
  driver (old regex matches weapon+ammo fails), PASS on the r108 driver
  (all 9 checks). Zero src/js changed.
- **R72 delivery chain:** haulPresses=3, deliveredKept=3, CHAIN-CLASSIFIED.
- **Win-plan (R104, carried):** planSeeds d14 on 4/10 seeds, d28 on 4/10;
  holders 14→15; partyWaits 35→62; gearHolds=0, bondTends=0, all later arms 0.
  **ARMS-WHY re-confirms r106:** M-A1/M-A2 — prims=0, no muster, no wave-4
  kills, no table plans on all d28 censuses; STRUCTURALLY-UNREACHABLE stands
  (retired metric, consistency check only).
- **Contests:** fired=20, ended=17, openAtHorizon=3, orphanEnds=0.

## Village assessment (plain words)

Ten villages, ten first fortnights-plus. Nine survive the month; one (1008)
is lost at day 23 and one (1006) collapses to three people. Everyone meets the
System by day 8 or 9. The villages hunt — 13 to 32 monster kills each — and
feed themselves only barely: nine of ten end the month hungry, with less than
2,000 kcal per person in the pantry, and four villagers starve (all
non-players, all properly counted). The pantry is the wall: 1006's pantry
sits at zero on days 23–24 while four die of sickness and starvation, and
1008's hits zero on days 20 and 22 before the village scatters. Four scholars
die and the mantle passes each time, once with a two-day gap (Wanjiru to
Felicia, day 24→26). Contests fire everywhere (20 across the panel) and mostly
resolve. People do ask each other for help and mostly get it: 26 of 33
sittings offered the favor, 24 of 26 picks became real promises, and the two
refusals were honest ("I'm out on the road — find me when I'm back").
Parties form now: five of six invitations accepted, where the last run had
none. The villages are alive, social, and hungry — the same hungry the last
run saw, one seed worse.

Pops end 10, 12, 10, 3, 10, 6, 8, 8, 8, 10 (seeds 1003–1012). Spawns: Kelsey,
Rafael, Hilda, Hannah, Peyton, Ming, Kathleen, Esther, Heinrich, Michael.
Monster kills per seed: 17, 32, 26, 17, 19, 13, 18, 26, 16, 21.
Self-sufficiency 0.717–0.955.
**Seed 1006 collapse:** pop 12→3. Deaths: Jude d14 / Catalina d15 / Oishi d19 /
Nino d22 (monster), Piper d16 / Ciro d22 (sickness), Boris d22 / Olivia d23
(starvation), Devon d22 (thirst); pantry 0 on d23–24, finalPerPerson=467.
**Seed 1008 lost at d23:** Paola d12 monster, Erich d13 sickness, Ethan d14
Choir Toad, Bessie d17 wound, Giulia d17 sickness, Nikos d21 / Kyle d23
starvation; pantry 0 on d20/d22, finalPerPerson=100, popEnd=6.

## People check (transcripts read in full)

- **1005 d11 Aroha (29 turns): Real.** Aroha wants forage help ("The pantry's
  nearly bare…"), the player commits, she refuses honestly — away on the road
  ("Find me when I'm back…"). The favor stays open ("We never finished — that
  foraging help." resurfaces). A live betrayal case (ambush of Elijah, pressed
  3×, story holds, "either it's true, or it's been rehearsed a lot"), a
  personal thread (Denver rain, street artist — "says it a little too firmly.
  Like they're convincing themself, not you"), teaches Greenbrier Shoots,
  wind-down surfaces with "Fryderyk was a butcher, before…", beast-naming
  (gold flash; "The Big Beast" vs "The Loud Beast"). Polish notes (carried):
  [menu:more] paging yields THEM: (no line) turns; verbatim deflection
  repeats ×2 ("That's me, I guess. What's on your mind?", "Yeah? What's
  up?") flagged by the analyzer.
- **1003 d13 Brian (8 turns): Real but the want never engages.** Gossip
  thread is specific and alive (Lucas hums at beans; Fatima/Hazel/Regina out
  for water; Mateo's wound-slowing palm). The engagement option was offered
  once at turn 2 and the driver drilled gossip instead (depth 1→7); want
  stayed stage 1, resolution 'unresolved'. Warm close ("This was good." /
  "I'll… I'll be around. If you need anything. Anything at all."). This is
  the M-PR1 bottleneck in miniature: the game offered, the probe didn't take.

## Blank filled / documented

- **R70 closed as a stale-ledger artifact** (see verdicts): the never-waited
  seeds are explained by stale-ledger rows, an already-live run, and a dead
  promiser. No game-code defect; no code change.
- **Promise bottleneck adjudicated:** engagement is a driver-probe
  interaction (the option is offered; the topic probe prefers gossip);
  refusals are honest by design (away-guard). No game-code defect; no code
  change. The 1010 d12 thread-gate case (engagement picked, want stayed
  stage 1) is a named open question for a future run, n=1.
- **R69 tele/line disagreement adjudicated and fixed in the instrument:**
  the fail-line regex counted weapon+ammo failures as armor failures.
  Fixed in the r108 driver + proof test (FAIL before, PASS after). Zero
  src/js. The tele-cap caveat (300 events) stays documented; a future run
  could run the driver with TELEMETRY_FULL=1 to remove it.
- **No other blank filled this run.** Water still untested (19 runs); the
  mantle 2-day latency (1009) stays an owed item; scholar-eats-first and the
  M-A2 design question stay Steve's calls.

## Notable events

- 1006 collapse to pop 3 (above); 1008 lost at d23 (above).
- 4 scholar deaths + mantle passes, one with 2-day latency (1009).
- Party invitations accepted 5/6 (r106: 0) — the wild ally-join world is
  showing up in the landing window too.
- Lane B `journey2-crisis` registration eventually succeeded after ~25 min
  in D state; its run is live in its own lane — not touched.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 20 fired, flesh channel,
  outings complete, win-plans seed 4/10 by d14, party invitations land.
- **Fun: yes.** Transcripts read like people; Aroha's honest refusal, the
  betrayal case that holds under pressure, beast-naming. The villages are
  hungry, which is the game's thesis, not a bug in the fun.
- **Winnable: not yet — unchanged.** Win-plan later arms proved structurally
  unreachable before d28 (r106 M-A2, re-confirmed); the early funnel moves on
  party/hunt arms alone. No wave-4 kills, no muster, no table plans on any
  d28 census.

## Metric review

- **M-R70 worked — closed the question.** The live-vs-ledger split in
  waitDiag did the job: 207 promise-favorId rows, all ledger, zero live. The
  defect pattern (live promised favor + no wait + bad reason) fired once, on
  a dead promiser. Keep the metric as-is for the next run; the question is
  closed unless a live case appears.
- **M-PR1 missed by 1 sitting (7/33 = 21% vs 25% bar).** The bar is fragile
  at n≈30: one sitting swings the verdict. Propose for the next run: a pooled
  two-panel bar (r107+r108 sittings, n≈66) or a per-seed bar (never-offered
  ≤1 sitting on ≥8/10 seeds). Do NOT re-score this run.
- **M-PR2 worked.** 92% promise rate with both refusals explained by the
  away-guard. Keep.
- **M7/M6 carried, both GO.** Keep as regression lines.
- **M-A2 retired, re-confirmed only.** The structural-unreachability finding
  stands; the metric stays retired.

## Regression + telemetry

- Shape test (r94): PASS. Goaround regression (r104 replay corpus): PASS.
  Class-F test (r106): PASS. R69 regex proof test: FAIL on r107 driver,
  PASS on r108 driver.
- `node scripts/check.js --quick`: **284 passed, 6 failed in 534s** —
  identical to r106. The 6 are the standing set (measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, establishment-r20-fixes); none touches this run's files.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r107 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106), baseline NOT rolled:
  (1) systemDay baseline 33 → current sum 83 over 10 files (per-seed 8–9,
  mean 8.3; baseline is a 4-seed-run sum); (2) monsterKills baseline pooled
  mean 24 → current sum 205 over 10 files (per-seed mean 20.5, range 13–32;
  r106 was 23.3, range 14–42). No behavior change is indicated.

## Next run (r108 driver prepared)

`scripts/journey-landing-r108-20261105.js`: r107 driver verbatim except seeds
1013–1022 (fresh band — verified: no prereg names 1013–1022 as panel seeds,
no corpus files for them; the only "1015"/"1016" hits are round-number
filenames, not seeds), OUTDIR landing-r108, header, plus the R69 fail-regex
fix. Diff-verify: only header/seeds/OUTDIR/regex differ. `node --check`
clean on driver + proof test.

## Closeout note

[filled at closeout: rebase result, merge, rotation re-verification, lock deletion]
