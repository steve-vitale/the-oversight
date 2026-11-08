# Journey — Landing r119 (2026-11-08, Lane A leg 0)

Run id `laneA-20261108T1420Z`, scheduled Sun 2026-11-08 07:45 CST, started
~14:20Z 2026-11-08. Leg 0 LANDING. Branch `journey-landing`, base
`a111b57fa` (master at run start; `git pull` already up to date; master
tip is the sim-tendtrust-b DIAG-GO landing). Rotation 0→1 written at run
start, verified by read-back. Lock created at run start, run_id
`2026-11-08T14:20:00Z` (both lines); no prior lock existed. Delete at
closeout after read-back of run_id.

## Prereg (committed 221b975a2, before any seed ran)

Q1 (PRIMARY): the far-node leg of the kept-promise chain — does the chain
complete on FAR patches? Driver change (driver-only, zero src/js): the
evening leg tries green nodes FRESHEST-first (tile stock desc, then
distance desc) instead of nearest-first, and records tile stock at press
time. Q2: the want-thread resume — the picker now takes an offered
`alive:thread:want` resume in the want-engagement band (r118's Owen
sitting circled 18 turns with the resume offered 4 times and never
taken). Seeds 1122–1131 (fresh — all dated preregs searched, see
prereg; only incidental hit is "`tableOfferPaths` (~1129)" in
sim-doorwalk-b-prereg.md; "1122Z" hits are fleshout run-id timestamps,
not seed bands). Carried bindings as in r118.

## Infrastructure notes (loud first)

- **Pre-flight deviation (LOUD, recorded, not mine):** the main tree
  carried 1 pre-existing untracked file at run start —
  `evidence/2026-11-08/sim-food-adoption-round-1315.md`, the Loop A
  1315Z coordinator's run note, left uncommitted by that closed run
  (its landings are already on master: d80f972a2 etc.). Not staged, not
  modified tracked content, no path overlap with this run's branch — no
  merge hazard. Left untouched throughout (never commit another agent's
  file, never delete it). The final clean-tree check still shows this 1
  file; it predates this run.
- **Registration took ~11.4 min (slow checkout, same as r118).** Tree
  verified clean (0 status lines) before any work. The register itself
  completed exit 0; the tree branches from master a111b57fa.
- **Safe-commit index clobber struck on the prereg commit** (known
  class, third sighting pattern). Repaired per the recorded recipe
  (`git ls-tree HEAD` + `git update-index --add --index-info` per
  file); verified `git status` clean (0 lines), `git diff HEAD` empty,
  both blobs match HEAD. Commit 221b975a2 itself is correct (2 files,
  5063 insertions).
- **Heartbeat queue:** the post-panel heartbeat queued ~7 min behind a
  sibling reaper's registry lock (same pattern r118 recorded — the
  lock drains in order, no reap can fire on a queued heartbeat). It
  landed (registry hb 14:46:55Z); the run's heartbeat never went past
  ~18 min stale, well inside the ~4h reaper threshold.
- **Pre-flight otherwise clean.** Disk 28%, `git pull` already up to
  date. Reaper removed nothing; active trees 5/16 at pre-flight.
  4 LOUD lines about other owners' dirty trees (sim-medicduty-a,
  sim-fightloop2-b, build-ladder-leg3, journey2-endgame) — not mine, do
  not touch.
- **Context (not this leg's work):** Lane B is mid-run on
  journey2-endgame; the victory-gating ladder leg-3 coordinator and the
  medic-duty + fightloop2-b sim arms are active in parallel worktrees.
  This run measures master as-is; no action here.

## Panel

Pilot: 3 seeds (1122–1124), DAYS=28, exit 0 in ~65s. All 3 alive,
systemDay 8/8/8, practice snapshots present, Q1 analyzer runs on the
pilot corpus, invariant test PASS on the pilot corpus (5 fights,
0 violations), 16 favors observed. **Pilot gate (f) passed on the
first seed set: the far leg fires** — Zoe d13, evening, node (4,8)
d4 stock 50, 560 kcal, kept. **Pilot Q1 already
CHAIN-COMPLETES-FAR.** All 6 pilot gates passed → expanded to full
panel. Full panel: 10 seeds 1122–1131, DAYS=28, exit 0 in ~4 min.
10 census files in goal hidden_files `evidence/2026-11-08/landing-r119/`.
Logs: `landing-r119-pilot.log`, `landing-r119-panel.log` (same dir).
Analysis: `landing-r119-panel-analysis.txt`,
`landing-r119-practice.txt`, `landing-r119-huntpractice.txt`,
`landing-r119-navlog.txt`, `landing-r119-commit-offer.txt`,
`landing-r119-outingchain.txt`, `landing-r119-zerodmg.txt` (same dir).

## Panel verdicts

- **Q1 JOINT-FORAGING CHAIN: CHAIN-COMPLETES-FAR — H-FAR established.**
  Panel: favors=42 kept=**3** broken=14 open=25 waits=7 departs=10
  togetherOkFavors=8 haulFavors=5 deliverFavors=5 **farHaul=3
  nearHaul=2** unknownHaul=0; farOk=5 nearOk=6 handsEmpty=6
  pressFail=27; farUnreached=0 nearUnreached=0.
  RUNGS (snap-based): asked=31 waited=1 departed=2 together-ok=3
  haul>0=0 deliver=2 kept=3 — the snap rung counts undercount departed
  (see r118 Thabo note); the analyzer's per-favor table is the truth.
  Kept favors: **1123 Aria** 910 kcal (evening d14, near d3 stock 36);
  **1123 Emma** 910 kcal (evening d11, near d3 stock 36); **1124 Zoe**
  560 kcal (evening d13, **far d4 stock 50** — Wild Black Cherry).
  **The far leg completes end to end.** The other two far hauls did
  NOT keep — both are the new DELIVERED-NOT-KEPT shape (see below).
  **H-KNOW is live alongside H-FAR:** 6 hands-empty together-ok
  presses at high stock (d1 s30, d4 s29 ×2, d1 s12, d2 s32, d1 s26,
  d4 s24) — the press succeeds and yields only unknown plants. Fresh
  ground does not guarantee edible food in the first month; the village
  still knows too few edibles. **Press-fail is the biggest friction
  bucket (27):** the mechanism is nailed down — `canForage` reads
  tile.stock, but the solo forage is an AREA SWEEP over the tile's 3×3
  detail cells. A tile with stock 35 can have all its cells already
  harvested/regrowing (the solo daily worked them); the guard passes
  (stock > 0) and the sweep finds nothing, so the press fails with
  "This patch is worked out — step to another green patch." The line
  is honest about the CELLS; the driver's node picker reads the wrong
  signal (stock is a stale proxy for cell greenness). Next-run blank:
  the evening leg should read cell greenness (the game's own patch
  state), not tile.stock.
- **DELIVERED-NOT-KEPT (new shape, 2 cases): Ella (1125) and Zoltan
  (1131).** Both pressed a far patch successfully (Ella d4 s2, 195
  kcal; Zoltan d4 s2, 390 kcal), then the hop home FAILED
  (evening-home-fail: Ella stuck at (2,0), Zoltan at (0,0)) — the far
  walk plus the failed presses before it burned the evening's ticks.
  The food banked the next day (Ella 130 kcal, Zoltan 195 kcal) but
  the 1-day NARROW deadline had passed, so the promise broke: "The
  promise was missed; unloading does not earn kept-promise credit."
  The game is honest about it. The far leg's cost is the return walk:
  3 far hauls, 1 kept (Zoe, hop home succeeded), 2 delivered-but-not-
  kept. A competent player facing a 1-day window gambles on the far
  patch; the game prices the gamble in ticks, not in a warning.
- **Q2 WANT-THREAD RESUME: MIXED — the fix works where it can run,
  but the binding metric MISSES.** Resume takes: **3** on the panel
  (1126-d6, 1129-d5, 1130-d6; `MET.wantThreadResumeTakes`=3;
  `alive:thread:want` offered 31 times across 6 sittings). The takes
  all produced real conversation: 1126-d6 resumed "that taken person"
  into a taken-brother grief beat and a PROMISED favor (see People
  check); the other two deflected honestly. **But OWEN-SHAPE = 1, not
  0:** seed 1124 d10 Antônio — the resume offered on the menu 4 times
  (turns 7, 11, 15, 19), 0 takes, 21 turns. Per §14 the miss is NO-GO,
  never re-scored. The mechanism is precise: Antônio's sitting is a
  WD + TOPIC probe sitting, and the topic-probe block runs BEFORE the
  shared picker chain — its page sweep takes `[menu:more]` to an
  unvisited page on every turn the resume is offered, so the
  wantEngage pick (with my resume addition) is never reached. My Q2
  fix addressed the wrong layer: the resume must be considered INSIDE
  the topic-probe block, before the page sweep. Two more untaken
  shapes sit just under the bar (1122-d6: 3 offers, 0 takes, 11 turns;
  1122-d7: 1 offer, 0 takes, 22 turns) — same mechanism. The game side
  is exonerated: no take stalled the want at stage 1.
- **Q3 PRACTICE: GO** — movedCells d1→d28=**89** (attributed 89),
  10/10 seeds, d1→d14=56 (r118: 64; r117: 95). By task: wood 22,
  stone 24, water 18, cook 15, fish 2, deadfall 8;
  hunt/forage/garden/scout/patrol/tend/teach/mend 0. **Hunt reps 0
  — H1-ESTABLISHED again** (298 kills total; per-seed kills 21, 19,
  15, 50, 28, 38, 36, 31, 27, 33; mean 29.8). Fish reps 38 pooled,
  garden 10, 0 moves.
- **SPECIALIST SKILL STEP OPENS — second panel.** skill0->pos=21
  split as **foodXp 15 + specialist 0→1: 6** (Amanda, Asher, Ernesto,
  Hui, Mai, Toby — all preserver). r118: 5 specialist + 17 foodXp.
  The skill step fires two panels running.
- **Q4 engagement: M-PR2 revised 19/(21−2) = 100% ≥80% — LINE HOLDS.**
  sittings=27, offered=21, picked=21, promised=19, statedAfterPick=2
  (both R72 away-guard). **M-PR1 per-seed (≥3-turn rule): PASS 9/10**
  — counted never-offered: 1123:1 (d14, 5 turns), 1124:1 (d10, 21
  turns), 1126:1 (d9, 7 turns), 1127:2 (d8 + d14, 5 turns each),
  1128:1 (d10, 5 turns); all others 0. Adjudication (backstop): five
  of the six open with the withdrawn-want line ("Never mind the food
  I needed — we got it handled") — no favor to commit to; the sixth
  (1127-d14 Victor) never established a want. All six wants reach
  stage 3. No defect.
- **NAV-log: clean.** genuine=0, noLine=0, navLines=100 == menuMore=100.
- **Invariant test: PASS** on the full panel (20 fights, 0 violations).
  **Miriam line test: PASS** (0 settled-asserting).
- **Q5 M6: UNTESTED** (triggered=0, ate=0; checks=283) — no hungry/
  thirsty Haven day triggered the step this panel (r118 was
  DOORSTEP-GO at 3/3). An empty sample is UNTESTED, not GO.
- **Q7 water: UNTESTED, 29th run** (wildOutingIterations=0,
  hydUnder25=0, minHyd=72, waterSkips=0).
- **M7 GOAROUND-HOLDS on the kcal leg** — R84 kcal ALL-ARRIVED
  (arrivals=7, arrived=7); R85 kcal RESCUE-GO (skips=7, complete=7).
  Water leg UNTESTED both (no wild water skip in this corpus — the
  repro corpus carries the verdict).
- **R84 HAVEN-HYDRATION:** maxZeroStreak=0, streakSeeds(≥3)=0/10, no
  Maeve shape on this panel.
- **Win-plan R104: GOAL-LIVE at d14.** d14 planSeeds>0 on 8/10, d28 on
  8/10; holders d14=23 d28=24; partyWaits 53→60; partyFights 53→145.
  **M-A2 STRUCTURALLY-UNREACHABLE re-confirmed** (prims 0, no muster,
  no wave-4 kills, no table plans on all d28 censuses).
- **Mantle: double mantle on 1122.** Anna d10 "the wild" → Ming d10,
  latency=0. Ming d17 "betrayal" → Leo d18, latency=1. The 2-day
  latency stays unobserved. **R66 horizon pantry: 5/10 HUNGRY —
  PATTERN** (collapse recurs — lever work candidate). HUNGRY
  (<2000/person): 1122 (1693), 1124 (1015), 1125 (1452), 1129 (1079),
  1130 (1014). FED: 1123 (2122), 1126 (11861), 1127 (4611), 1128
  (2346), 1131 (5268). R66 REVISED GATE: **NOT-HUNGRY**
  (starvationDeaths=0, slideSeeds=0, bandSeeds=5, noSlideSeeds=5).
  All seeds start with the same 47,250 kcal spawn pantry; the d28
  spread (11k–142k) is kill-loot variance — the big gains land on
  kill days (R60 traces: +42k d23→25 on alien_tick/sanjun/moderator/
  heckler kills). The village produces more than it eats; the spread
  is the loot economy working, not a defect.
- **R62 flesh: CHANNEL OPENS** (arrivalSeeds=10/10, testSeeds=10,
  exitSeeds=8, stuckSeeds=2, openSeeds=8, noArrivalTested=0,
  noArrivalUntested=0). 61 tests pooled, **0 poison verdicts, 0
  re-tests of known-poison flesh, 1 rot**. The poison fix holds by an
  unexercised verdict this panel (r118 had the 1 poison verdict).
- **Contests: fired=22, ended=19, openAtHorizon=3** — all three fired
  on d27–28 (The Wrong Map d28, The Quiet Room d27→won d29, The
  Price d28), legitimately open, not stuck. orphanEnds=0. **LEDGER
  GO. STARVATION GO. GRIEF holds** (griefMiss=0/9; every death
  registered with a cause class).
- **R73 WINDOW: NARROW-PATTERN** — promised=17, NARROW=17,
  keptInsideNarrow=**3** (r118: 3). Broken causes: NO-DEPART 7,
  DEPARTED-NO-DELIVER 5, DELIVERED-NOT-KEPT 2. The binding rung is
  still the dawn departure: 7 of 17 narrow promises never depart —
  the 1-day window + dawn-only departure.
- **R71 OUTING-WORK: COMPLETION-GO** — togetherOk=11,
  togetherBlocked=10, talkAttempts=10, deliverDayOk=3, haulPressSeeds
  4/10. **R70 OUTING: OUTING-GO** — askSeeds 10/10, waitSeeds 6/10,
  departSeeds 7/10, keptSeeds 2/10, keptTotal=3.
- **R69 ARMOR: ARMOR-GO** (seedOK=10/10, teleLineDisagree=0).
  **R68 PARTY: PARTY-GO** (offered=8, picks=8, spoken=8, dry=0,
  accepted=5). **R67 CASE: LABELING-GO** (sittings=12, match=12).
- **WIND-DOWN MORE: GO** (picks=7, empty=0). **WD PROBE: GATE-A GO,
  GATE-B GO** (sittings=10, surfaced=9, menuMore=6, pageTurns=63,
  page3sittings=6, maxPage=4, phase2Opened=9, phase2Yielded=3).
- **BETRAYAL HELD-INVITE:** heldOffers=0 (spoken streak extends).
- **R94 DAWN-DOOR:** opps=477 in r118; carried (not re-printed here).
- **Zero-DMG (v2 instrument): 2/20, both others-killed, both shape B
  (scholar-stood-through).** 1123 d15 The Loud Beast: scholar 0
  strikes in 2 rounds, 0 damage taken, allies (Pearl/Emma/Aria) dealt
  26 and won. 1127 d11 Rut King: scholar 0 strikes in 4 rounds, took
  14, allies (Eyad/Diana) dealt 106 and won. Both fights won; the
  v2 class is benign. **Watch:** the scholar goes first in turn order
  in both and never strikes — the competent fight policy's turn
  choices deserve one read next run (is the policy passing its turns,
  or could the scholar not strike?).

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and again
nobody starves, though five of the ten end it thin. Five villages end
fed (1126 richest at 11,861 calories a person, 1131 at 5,268, 1127 at
4,611); the other five end hungry, the thinnest at 1,014 a person —
1130's pantry nearly empty on the last day, and still nobody starves.
Everyone meets the System on day 8. One village loses its scholar
twice: Anna dies in the wild on day 10 and Ming takes the mantle the
same day; Ming is betrayed and dies on day 17, and Leo takes it the
next day. The villages hunt hard (15 to 50 monster kills each, 298 in
total) and test their meat: all ten taste it, eight get it out of the
pantry, and nobody is poisoned. People ask each other for help and
mostly get it: 21 of 27 sittings offered the commit, all 21 picks
became real promises, and the two refusals after a pick were both
honest ("I'm out on the road — find me when I'm back"). Three of
those promises became real food in the pantry — Aria, Emma, and Zoe
each walked out with the scholar, worked a patch together, and brought
the food home — and this time one of them walked to a far patch Zoe
had never worked and brought 560 calories home from it. Two more
promises got the food home but still broke: Ella and Zoltan pressed
far patches, couldn't get home before dark, and the promise's single
day ran out while they were stuck out in the wild — the food is in the
pantry, the promise is still broken. Parties form and five of eight
people say yes. Villagers are getting better at their work in a way
you can count: 89 times in a month a villager's competence stepped up
a rung — cutting wood, breaking stone, hauling water, cooking — but
nobody got better at hunting at all, because nobody is ever sent
hunting. And for the second panel running, the skill ladder itself
fires: six villagers — Amanda, Asher, Ernesto, Hui, Mai, Toby — turn
preserver experience into an actual skill. Four villages lose nobody
at all. The villages are alive, social, and mostly fed this panel —
and this panel, the story is that a promise made at the fire can now
end as food from a far patch, while the road home from that far patch
can still eat the promise.

Pops end 10, 12, 11, 12, 12, 10, 11, 12, 11, 12 (seeds 1122–1131).
Scholars spawned: Anna, Mabel, Carmela, Caleb, Megan, Ryan, Frieda,
Riley, DeAndre, Stephen. Monster kills per seed: 21, 19, 15, 50, 28,
38, 36, 31, 27, 33. Self-sufficiency at d28 ranges 0.846–0.963.
Villager deaths 9 total: 2 scholars (Anna, the wild, day 10; Ming,
betrayal, day 17) and 7 others — 3 monster (1122 d28, 1128 d29,
1130 d26), 2 ambush (1124 d13, 1128 d14), 1 "Grief Counselor" (1127
d15), 1 wound that wouldn't close (1127 d16). **Seed 1122 is the
mantle village:** two scholar deaths, two mantles, pantry ends at
1,693 a person. **Seed 1125 is the kill village:** 50 monster kills,
the most on the panel, 0 deaths, pantry ends at 1,452. **Seed 1126
is the rich village:** 12 pop, 0 deaths, 28 kills, FED at 11,861 a
person — the loot economy at its most generous. **Seed 1130 is the
thin village:** 11 pop, 1 death (monster, d26), pantry ends at 1,014
a person.

## People check (transcripts read in full — the Q2 take, the Q2 miss, and the M-PR1 cases)

- **1126 d6 (the resume TAKE — 17 turns): Real — the fix works when
  it runs.** The driver takes `[alive:thread:want] "We never finished
  — that taken person."` on the third offer (turn 15; the topic block
  took the first two). The NPC answers with real grief: "It's my older
  brother, Stephen. Was taken at the Scattering. He taught me to swim.
  The boring half. Sure. The pods get into my sleep some nights. Row
  on row of them, humming like a held note — and I wake up reaching
  for something that isn't there." A goon continuer, a minute of
  silence, and the close: "If it answers — you'll tell me? Whatever
  it says. I can take it." / "This was good." They mean it. The want
  (seek_taken) resolves PROMISED. The thread resume opens the want
  into a person, not a menu.
- **1124 d10 Antônio (the resume MISS — 21 turns): Real — and the
  same loop as r118's Owen, one layer down.** Antônio opens
  withdrawing the want ("Never mind the food I needed — we got it
  handled. Thanks anyway.") — stage 1. The resume ("We never finished
  — that foraging help.") sits on the menu at turns 7, 11, 15, 19 and
  the driver takes `[menu:more]` every time — the WD + TOPIC probe
  block's page sweep runs before the shared picker, so the resume
  never gets a chance. The sitting is otherwise alive: a personal
  thread ("You ever get a song stuck in your head with no way to play
  it?"), maps compared three times, the wind-down queues at exchange
  5 and surfaces with a goal beat at depth 2 ("Whatever did this — it
  had a reason. Reasons can be found."). The want reaches stage 3
  anyway, through the goal thread. Two verbatim repeats of the
  subject-deflection lines ("That's me, I guess. What's on your
  mind?" / "Anyway. What did you want?") — the same deflection
  doubling r118 noted in Tahani. The finding is now precise: the
  resume fix belongs inside the topic-probe block, before the page
  sweep — not in the shared picker.
- **1129-d5 and 1130-d6 (the other two takes): Real — honest
  deflections.** Both resumes are taken and both wants (curious)
  deflect: "Alright — carefully, now. Both of us." One reply reads as
  the generic first-reveal line ("Huh. I wouldn't have guessed that
  about you.") after resuming "your plan here" — a watch for the
  amnesia shape (whether the plans question was already answered in a
  prior sitting needs the prior-sitting check; not claimed here).
- **The six never-offered sittings (M-PR1 backstop): all adjudicated
  above — five withdrawn wants, one unestablished want. No defect.**

## Blank filled / documented

- **Q1 FAR-NODE LEG: CHAIN-COMPLETES-FAR (fresh seeds).** The
  kept-promise chain completes end to end on a far patch — Zoe, d13,
  560 kcal from (4,8) d4 stock 50. H-FAR established; H-KNOW is live
  alongside it (6 high-stock hands-empty presses); H-HOP is falsified
  on the outbound leg (farUnreached=0) but lives on the RETURN leg
  (2 evening-home-fails strand the far press's haul overnight).
- **DELIVERED-NOT-KEPT — a new chain shape, named and priced.** Ella
  and Zoltan: far press succeeds, hop home fails, 1-day deadline
  passes, food banks but the promise breaks. The far leg's cost is
  the return walk in ticks.
- **PRESS-FAIL MECHANISM NAILED DOWN — stock vs cells.** The 27
  press-fails are not bare patches: `canForage` reads tile.stock
  while the sweep reads 3×3 detail cells. A high-stock tile whose
  cells are all regrowing passes the guard and fails the sweep. The
  game's line is honest about the cells; the driver's node picker
  reads the wrong signal. Next blank: pick evening nodes by cell
  greenness, not tile.stock.
- **SPECIALIST SKILL STEP OPENS — second panel.** Six villagers cross
  from foodXp into actual specialist skill (all preserver).
- **R73 NARROW WINDOWS KEEP — 3 inside zero-slack windows** (r118:
  3). The tight-window design input now has kept cases on two panels.
- **POISON FIX HOLDS AN EIGHTH PANEL.** 0 poison verdicts, 0 re-tests
  of known-poison flesh (the verdict itself didn't fire this panel;
  the re-test count is what the fix governs).
- **M7 GOAROUND-HOLDS on the kcal leg** (R84 ALL-ARRIVED 7/7, R85
  RESCUE-GO 7/7). Water leg untested a 29th run.
- **EAMON FALLBACK — NO LIVE EXERCISE (sixth panel running).** 0
  starvation deaths, so 0 STARVATION lines and 0 pantryAtDeath lines.
- **M-A2 STRUCTURALLY-UNREACHABLE re-confirmed.** No prims, no muster,
  no wave-4 kills, no table plans on any d28 census.
- **Q2 RESUME: FIXED IN THE WRONG LAYER.** The shared-picker fix
  works (3 takes, all real) but probe sittings pre-empt it. The next
  run moves the resume consideration into the topic-probe block.

## Notable events

- **First far-patch kept promise (Zoe, 1124 d13).** 560 kcal of Wild
  Black Cherry from (4,8), d4, stock 50 — the freshest patch on the
  board, not the nearest.
- **Ella's stranded night (1125 d9).** Three nodes tried, two
  press-fails, a far press at (2,0) for 195 kcal — then the walk home
  fails and the promise dies on its deadline while the food waits a
  day to bank. The fullest single story on the panel.
- **Ming's betrayal (1122 d17).** The second scholar on the seed dies
  by betrayal, not by monster or wild — the mantle passes to Leo the
  next day. The betrayal death shape for a scholar is rare enough to
  name.
- **1125's 50 kills.** The most on the panel, 0 deaths — the village
  fights constantly and loses nobody, ending thin anyway (1,452 a
  person). Killing does not feed the pantry; the loot days do.
- **Three contests fired on the horizon days and stay open** (The
  Wrong Map d28, The Quiet Room d27, The Price d28) — legitimately
  open, not stuck.

## Reachable / fun / winnable

- **Reachable:** the joint-foraging chain is reachable by a real
  player now — three kept promises on one panel, one of them through
  a far patch a player can actually walk to (fresh ground, not the
  picked-clean near ground). The far leg's cost (the walk home) is
  legible in play: the game tells you the promise was missed when the
  deadline passes.
- **Fun:** the villages read as alive — a taken brother remembered in
  dreams, a promise kept from a far patch, honest refusals, the
  beast-naming vote, contests with real TV phases. The Antônio
  21-turn loop is the fun gap: a conversation can circle the subject
  menu three times with the want-thread resume sitting on it
  untaken, while the want waits.
- **Winnable:** the win plan lives at d14 on 8/10 seeds and d28 on
  8/10, with party fights rising 53→145 across the month — but M-A2
  is structurally unreachable again: no prims, no muster, no wave-4
  kills, no table plans anywhere. The road to the table is still not
  open in the landing window.

## Telemetry deviation check (closeout)

Ran `node scripts/telemetry-check.js` in the worktree against the
r119 census files (`hidden_files/evidence/2026-11-08/landing-r119/
journey-landing-r62-census-*.json`, n=10).

- Against `telemetry-baselines/landing-split.json` (systemDay,
  villagerDeaths, monsterKills, folTelemetry.fires, starvAutopsies):
  LOUD systemDay 142% (33→80), monsterKills 1142% (24→298),
  folTelemetry.fires newly appeared (0→11); villagerDeaths and
  starvAutopsies quiet.
  - **systemDay EXPLAINED:** the check sums across files; baseline
    33 is a 4-seed-era total, current 80 is a 10-seed total.
    Per-seed mean 8.0 vs baseline-implied 8.25 — flat.
  - **monsterKills EXPLAINED:** same n-mismatch. Per-seed mean 29.8
    vs baseline 24 — the rate sits inside the historical per-seed
    band (18.8–30.4 across r109–r118); seed mixture, not a trend.
    (The r66 baseline note itself records monsterKills LOUD on every
    run r58–r66, each verdict EXPLAINED — this is the standing
    n-mismatch artifact.)
  - **folTelemetry.fires EXPLAINED:** baseline 0 predates the
    instrument's nonzero era. r117 and r118 recorded the identical
    total, 11 fires — the value is unchanged run-over-run, not a new
    behavior. The fires are the follower-volunteer feature ("You
    shouldn't go out there alone. I'm coming.") firing ~once per
    village-month.
- **Baseline NOT rolled.** All three LOUD lines are explained
  aggregation/staleness artifacts; rolling a 10-seed total into a
  4-seed-era baseline would corrupt it. The baseline needs a
  per-seed normalization fix — a main-session/tooling call, not this
  closeout's job.

## Regression

- Proof test (`scripts/test-landing-r118-outingchain.js`): UNCHANGED
  analyzer — no new proof test needed for the driver-only changes
  (the analyzer ignores the additive `stock` field). The r118
  fixtures + r117 calibration PASS on the branch tip (run at closeout:
  "fixtures (completes-far, h-know, h-hop, delivery-rung) + r117
  calibration PASS").
- `check.js --quick` on the branch tip: **286 passed, 8 failed in
  1199s** — the identical 286/8 as the r111 gate. The branch diff vs
  master is purely additive (2 new files, 5063 insertions, 0
  modifications; no test references the r119 driver), so by
  construction none of the 8 failures is caused by this branch. The
  one failure visible in the tail (racks-full voice gate, cook test)
  is in code this branch does not touch. The 8 are the standing
  pre-existing/flaky set, same class as the r114 gate.

## Closeout

- Proof test re-run on the branch tip: PASS (see Regression).
- `check.js --quick`: 286/8, identical to the standing gate (see
  Regression) — mergeable: the branch is driver + docs only.
- Master read fresh (a111b57fa) immediately before merging; `git log
  master..HEAD` shows exactly the 2 r119 commits (prereg + driver,
  run note). Merge `git merge --ff-only journey-landing` in the main
  tree (read-only), then release + remove the tree + branch, then
  final reap sweep. Lock deleted at closeout after read-back of
  run_id. Merged locally, pending ship. No bump, no push, no live
  verification (ship loop owns those).
- Telemetry: investigated in the Telemetry section above — all LOUD
  lines explained (n-mismatch + stale-baseline instrument); baseline
  NOT rolled.

## Metric review

- **Q1 metric (kept ≥1 with far haul):** GO as CHAIN-COMPLETES-FAR.
  The far leg fired on the pilot and kept 1 of 3 far hauls on the
  panel. The metric's adjudication branches were all exercised:
  far haul kept (Zoe), far haul delivered-not-kept (Ella, Zoltan),
  high-stock hands-empty presses (H-KNOW live), 0 far-unreached
  (H-HOP falsified outbound). No re-scoring needed.
- **Q2 metric (OWEN-SHAPE = 0; RESUME-TAKEN ≥1):** NO-GO on the
  first half — 1 sitting (1124-d10 Antônio, 4 offers, 0 takes, 21
  turns) meets the Owen shape. The second half passes (3 takes).
  Per §14 the miss stands as NO-GO; the fix direction (resume inside
  the topic-probe block, before the page sweep) is proposed for the
  NEXT run, not applied here. Do not re-score this run's verdict.
- **M-PR1 (per-seed ≥3-turn never-offered ≤1 on ≥8/10):** PASS 9/10.
  The six counted cases are adjudicated above (five withdrawn wants,
  one unestablished want). The ≥3-turn rule keeps working: all six
  counted sittings are 5+ turns.
- **M-PR2 revised (promised / (offered − stated-after-pick)):**
  100%, line holds. The away-guard exclusion (2 stated-after-pick)
  is doing real work.
- **Q3 practice (movedCells d1→d28 ≥ 60):** GO at 89. Hunt reps 0
  again — the H1 question (hunt-assignment policy: does the competent
  policy need a hunt-assignment branch, or is chore-first correct
  play?) is still open for the next run.
- **Q5 M6 (doorstep):** UNTESTED (0 triggers) — an empty sample is
  UNTESTED, not GO, per the r115 rule. The trigger condition (a
  hungry/thirsty Haven day) never materialized on this panel.
- **Q7 water clause:** UNTESTED a 29th run. The denominator (wild
  outing iterations=0, hydUnder25=0) never materializes in the
  landing window. This metric needs a different instrument or a
  different leg; carrying it unchanged into r120 is measuring the
  same absence again.
- **R104 win-plan (planSeeds>0 on ≥5/10 at d14):** GO (8/10). M-A2
  stays retired as structurally unreachable.
- **Zero-DMG (v2):** 2/20, both others-killed, both with a legible
  shape (scholar stood through, allies killed). No defect claimed;
  the scholar's 0 strikes across 2–4 turns is a watch for the next
  run's fight-policy read.

## Next run (no r120 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are
other legs, so no landing r120 driver is prepared here. The next landing
run prepares its own driver from the r119 driver and re-verifies its seed
band fresh across all dated preregs (next fresh band after 1122–1131
starts at 1132; contaminated bands stay excluded: 897–906, 1301–1304,
917–926, 1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010,
1033–1042, 1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092,
1093–1102 (overlaps 1101–1110), 1111 (single seed, social r11),
1112–1121 (r118), 1122–1131 (r119)).
Carried to the next landing run: the practice snapshot is a standing
instrument (report d1→d14 and d1→d28 side by side, PLUS the rep totals
from the huntpractice analyzer — reps-below-rung vs reps-zero are
different stories); the NAV-log classifier is a standing instrument (any
GENUINE "(no line)" is an investigation item); the r117 v2 zero-DMG
analyzer is the standing instrument for the zero-DMG question (the r115
analyzer is retired — its strike-dmg read is wrong on killing blows);
**the r118 outingchain analyzer is the standing instrument for the
kept-promise chain** (per-favor furthest rung + haul by node distance;
waits from dawn opps, departs from snaps, favor.outingAttempts as the
better never-waited instrument once census snaps record it); the
invariant test is the standing after-proof (0 violations on every panel);
M-PR1 per-seed (≥3-turn rule) + adjudication and M-PR2 revised are the
standing lines; the Eamon fallback's live exercise, the R70 never-waited
friction (reframed — the game engine departs; driver opps undercount),
and the mantle latency stay carried (the 2-day latency is still
unobserved); report starvation deaths per seed alongside the R66 gate;
M7 stays as written with R85 as its companion; M6 stays as written; the
Miriam line test is the standing line for exit-pool wording (any
"settled" fails it); the skill0->pos count splits into foodXp vs
specialistSkill from here; the policy question is open — does the
competent policy need a hunt-assignment branch, or is chore-first
correct play? — and the Q2 resume fix is the next blank: move the
want-thread resume consideration INSIDE the topic-probe block, before
the page sweep, so probe sittings take it too (r119 proved the shared-
picker placement is pre-empted there); the press-fail mechanism is the
other next blank: the evening leg should read cell greenness (the
game's own patch state), not tile.stock — stock is a stale proxy for
whether a press will land; the scholar's 0 strikes in both zero-DMG
fights is a watch (read the competent fight policy's turn choices);
the 1130-d6 resume reply ("Huh. I wouldn't have guessed that about
you.") is a watch for the amnesia shape (needs the prior-sitting
check before any claim).
