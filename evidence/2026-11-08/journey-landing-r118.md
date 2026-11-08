# Journey — Landing r118 (2026-11-08, Lane A leg 0)

Run id `laneA-20261108T0435Z`, scheduled Sat 2026-11-07 21:45 CST, started
~04:35Z 2026-11-08. Leg 0 LANDING. Branch `journey-landing`, base
`2ce918e0e` (master at run start; `git pull` already up to date; master
moved during registration — a sibling merged sim-medicdiag-a /
sim-darkwit-b; main-tree `git log -1 master` and worktree HEAD agree on
`2ce918e0e`). Rotation 0→1 written at run start, verified by read-back.
Lock created at run start, run_id `2026-11-08T04:35:00Z` (both lines);
no prior lock existed. Delete at closeout after read-back of run_id.

## Prereg (committed b35f9788e, before any seed ran)

Q1 (PRIMARY): joint-foraging kept-promise chain — does the chain complete
on fresh patches? Three mechanisms: H-FAR (patch freshness), H-KNOW
(knowledge — patches yield only unknown plants), H-HOP (routing).
Driver change (driver-only, zero src/js): the evening leg tries up to 6
green nodes within distance ≤5 of Haven (was 3 within ≤3), nearest first,
and records node `{x,y,d}` on evening together attempts + evening-blocked
lines; mid-day together attempts record the current node + distance from
home. New instrument scripts/analyze-landing-r118-outingchain.js: per
distinct favorId, furthest rung (asked → waited → departed → together-ok
→ haul>0 → deliver → kept/broken/open) + break reason; haul by node
distance (near d≤3 vs far d4–5). Waits read from dawn opps, not snaps
(snap `waiting` misses a dawn wait that already departed by snapshot
time — this fix changed r117 calibration waits 0→4). Q2–Q6 + carried
bindings as in r117. Seeds 1112–1121 (fresh — all dated preregs searched,
see prereg; correction to r117's note: 1093–1102 is NOT fresh, it overlaps
contaminated 1101–1110; seed 1111 is excluded — used as a panel seed by
the 2026-10-13 social r11 script).

## Infrastructure notes (loud first)

- **Registration took ~11.1 min (slow checkout).** `git reset --hard`
  actively running mid-checkout; tree verified clean (0 status lines)
  before any work. The register itself completed exit 0; the tree
  branches from master 2ce918e0e.
- **Safe-commit index clobber struck on the prereg commit** (known
  class). Repaired per the recorded recipe (`git ls-tree HEAD` +
  `git update-index --add --index-info` per file); verified `git status`
  clean (0 lines), `git diff HEAD` empty, all 4 blobs match HEAD.
  Commit b35f9788e itself is correct (4 files, 5388 insertions).
- **Service restart killed the first full-panel attempt** mid-seed-1113
  (~05:25Z; only 1112 DONE, process gone). Re-ran all 10 seeds from
  scratch, exit 0 in ~205s. No data from the killed attempt was used.
- **Pre-flight clean.** Main tree clean, disk 29%, `git pull` already up
  to date. Reaper removed nothing; active trees 6/16 at pre-flight.
  4 LOUD lines about other owners' dirty trees (sim-doublenight-a,
  sim-cheaptend-a, journey2-social, build-ladder-leg1) — not mine, do not
  touch.
- **Heartbeat loop held** at registration + ~10-min intervals.
- **Context (not this run's work):** Steve 2026-11-07 16:55 CST approved
  the 4 new alien personas — build coordinator running (alien expansion +
  Reunion mirror cap in parallel worktrees); the victory-gating
  design-brief build (build-ladder-leg1) is active; the one-brain program
  proceeds elsewhere. This run measures master as-is; no action here.

## Panel

Pilot: 3 seeds (1112–1114), DAYS=28, exit 0 in ~200s. All 3 alive,
systemDay 8/8/9, practice snapshots present, Q1 analyzer runs on the
pilot corpus, invariant test PASS on the pilot corpus (5 fights,
0 violations). All 5 pilot gates passed → expanded to full panel. **Pilot
Q1 already CHAIN-COMPLETES-NEAR** — kept=1: seed 1112 Tahani, 775 kcal
via a mid-day (b) together press on a wild patch + walkhome deliver.
Full panel: 10 seeds 1112–1121, DAYS=28, exit 0 in ~205s (second
attempt; first killed by the service restart above). 10 census files in
goal hidden_files `evidence/2026-11-08/landing-r118/`. Logs:
`landing-r118-pilot.log`, `landing-r118-panel.log` (same dir). Analysis:
`landing-r118-panel-analysis.txt`, `landing-r118-practice.txt`,
`landing-r118-huntpractice.txt`, `landing-r118-navlog.txt`,
`landing-r118-commit-offer.txt`, `landing-r118-zerodmg.txt`,
`landing-r118-fights.txt`, `landing-r118-outingchain.txt` (same dir).

## Panel verdicts

- **Q1 JOINT-FORAGING CHAIN: CHAIN-COMPLETES-NEAR — the kept-promise
  chain completes on fresh patches, but only ever on near nodes.**
  Panel: favors=41 kept=**3** broken=5 open=33 waits=6 departs=7
  togetherOkFavors=5 haulFavors=3 deliverFavors=3 **farHaul=0
  nearHaul=3** unknownHaul=0; nearOk=6 handsEmpty=3 pressFail=22;
  evening-blocked press-fail:near 15, unreached:near 21; farUnreached=0.
  RUNGS (snap-based): asked=34 waited=0 departed=2 together-ok=2
  haul>0=0 deliver=0 kept=3 — the snap rung counts undercount departed
  (see Thabo note below); the analyzer's per-favor table is the truth.
  Kept favors: **1112 Tahani** 775 kcal (mid-day (b) leg, wild patch);
  **1116 Devon** 1620 kcal (evening leg, 4th node tried (5,4) — nodes
  1–3 all failed, so the widening to 6 plausibly made the difference;
  first press hands-empty with 7× unknown shoots — a live H-KNOW
  specimen; deliver-evening same day); **1120 Dale** 360 kcal (evening
  leg, 2nd node (3,4), deliver-evening). **3/3 haul favors delivered
  and kept** — the binding rung is getting a together press to land
  with edible haul. **H-FAR falsified as stated: far nodes were never
  tried** — all evening entries are near (d1); the 6 nearest forageable
  nodes are all adjacent, so the far-node test never fired. H-FAR is
  untested as designed. 1121: both departs broke in the evening (all 6
  nodes press-fail/unreached).
- **Q2 PRACTICE: GO** — movedCells d1→d28=**87** (attributed 87),
  10/10 seeds, d1→d14=64 (r117: 95; r115: 94; r113: 94; r112: 82). By
  task: wood 25, stone 25, water 18, cook 11, deadfall 8;
  hunt/forage/garden/fish/scout/patrol/tend/teach/mend 0. **Hunt reps 0
  — H1-ESTABLISHED again** (256 kills total; per-seed kills 19, 28, 28,
  29, 16, 27, 30, 27, 31, 21; mean 25.6). Fish reps 29 pooled, garden 8,
  0 moves.
- **SPECIALIST SKILL STEP OPENS — first landing measurement of an
  actual skill crossing.** skill0->pos=22 split as **foodXp 17 +
  specialist 0→1: 5** (Aria, Otis, Addison, Howard, Luna — all
  preserver). r117: specialist skill still 0→positive 0. The foodXp
  level of the gate worked in r117; this panel the skill level itself
  fires.
- **Q3 engagement: M-PR2 revised 13/(19−6) = 100% ≥80% — LINE HOLDS.**
  sittings=27, offered=19, picked=19, promised=13, statedAfterPick=6
  (all R72 away-guard), neverOffered=8. **M-PR1 per-seed (≥3-turn
  rule): PASS 10/10** — counted never-offered: 1117:1, 1121:1, all
  others 0 (the other six never-offered sittings are 0–2 turns, excluded).
  Offer rate fell vs r117 (19/27 vs 24/26).
- **NAV-log: clean.** genuine=0, noLine=0, navLines=86 == menuMore=86.
- **Invariant test: PASS** on the full panel (16 fights, 0 violations).
  **Miriam line test: PASS** (0 settled-asserting).
- **Q5 M6: DOORSTEP-GO** (triggered=3, ate=3; checks=279).
- **Q6 water: UNTESTED, 28th run** (wildOutingIterations=3,
  hydUnder25=0, minHyd=72, waterSkips=0). R88 EAT-ON-ARRIVAL:
  arrivals=2, ate=2, EAT-GO. R88 MAEVE: 1 haven hyd-0 snap, 0 qualified
  (MIXED mechanism — inside-hall with bottles).
- **Win-plan R104: GOAL-LIVE at d14.** d14 planSeeds>0 on 6/10, d28 on
  7/10; holders d14=20 d28=27; partyWaits 30→74; partyFights 33→136.
  **M-A2 STRUCTURALLY-UNREACHABLE re-confirmed** (prims 0, no muster,
  no wave-4 kills, no table plans on all d28 censuses).
- **Mantle: Kennedy d12 cause "a stranger" → mantle Camila d13,
  latency=1.** Regina (1118) died d28 "the wild" — a horizon-day death,
  successor pending past the window (unresolvedAtHorizon=1 is a
  boundary artifact, not a succession failure). The 2-day latency stays
  unobserved this panel.
- **R66 horizon pantry: 5/10 HUNGRY — PATTERN** (collapse recurs — lever
  work candidate). HUNGRY: 1113 (930), 1115 (1017), 1117 (758), 1120
  (950), 1121 (783). FED: 1112 (2903), 1114 (4894), 1116 (3150), 1118
  (2240), 1119 (2140). R66 REVISED GATE: **NOT-HUNGRY**
  (starvationDeaths=0, slideSeeds=0, bandSeeds=7, noSlideSeeds=3).
- **R62 flesh: CHANNEL OPENS** (arrivalSeeds=8/10, testSeeds=10,
  exitSeeds=8, stuckSeeds=0, openSeeds=8, noArrivalTested=2,
  noArrivalUntested=0). **Poison fix holds a 7th panel:** 1 poison
  verdict — 1116 d20 Willem tests Choir Toad (belltoad): "NOT food.
  Poison." — tester survived (0 deaths on 1116), no re-test of the same
  flesh (belltoad_legs d22 by Greta is a different item).
- **Contests: fired=19, ended=17, openAtHorizon=2** — both fired on the
  horizon day (Lie Detector 1114 d28; Siege 1117 d28), legitimately open,
  not stuck. orphanEnds=0. **LEDGER GO. STARVATION GO. GRIEF holds**
  (griefMiss=0/10; every death registered with a cause class).
- **R73 WINDOW: NARROW-PATTERN** — promised=7, NARROW=7,
  keptInsideNarrow=**3** (r117: 0). Three kept favors completed inside
  a zero-slack window.
- **R72 DELIVERY-CHAIN: CHAIN-CLASSIFIED** — haulPresses=3,
  deliveredKept=3, deliveredLate=0, blocked=0, noAttempt=0. Every haul
  press matched to a delivery outcome.
- **R71 OUTING-WORK: COMPLETION-GO** — togetherOk=6,
  togetherBlocked=8, talkAttempts=11, deliverDayOk=2, haulPressSeeds
  3/10. **R70 OUTING: OUTING-GO** — keptSeeds=3/10, tele
  dep7/tog6/ret7/talk11, keptTotal=3.
- **R69 ARMOR: ARMOR-GO** (seedOK=10/10, teleLineDisagree=0).
  **R68 PARTY: PARTY-GO** (offered=4, picks=4, spoken=4, dry=0,
  accepted=3). **R67 CASE: LABELING-GO** (sittings=16, match=16).
- **R84/R85 goaround: M7 GOAROUND-HOLDS on the kcal leg** — R84 kcal
  ALL-ARRIVED (arrivals=2, arrived=2); R85 kcal RESCUE-GO (skips=2,
  complete=2). Water leg UNTESTED both (no wild water skip in this
  corpus — the repro corpus carries the verdict).
- **R84 HAVEN-HYDRATION:** maxZeroStreak=1, streakSeeds(≥3)=0/10, no
  Maeve shape on this panel.
- **WIND-DOWN MORE: GO** (picks=9, empty=0). **WD PROBE: GATE-A GO,
  GATE-B GO** (sittings=10, surfaced=10, menuMore=9, pageTurns=44,
  page3sittings=5, maxPage=3, phase2Opened=6, phase2Yielded=3).
- **BETRAYAL HELD-INVITE:** heldOffers=0 (spoken streak extends).
- **R94 DAWN-DOOR:** opps=477, waitDiagMissing=0.
- **Zero-DMG (v2 instrument): 2/16, both others-killed.** S:1 — 1116
  d23 Static Kite: the scholar struck 3 times for 0 damage because the
  kite "circles high above reach"; allies (Luz, Addison) dealt 118 and
  won it. The reach logic works; the scholar's strikes were honest
  misses, not a defect. B:1 — 1119 d16 Living Wire: the scholar stood
  4 rounds, 0 strikes, took 0 damage, while Jude dealt 74 of 77 and
  won. The old r115 analyzer reports 3 (S:2) — the extra S is the
  killing-blow phantom class the v2 correctly excludes; v2 is the
  standing instrument.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and again
nobody starves, though five of the ten end it thin. Five villages end fed
(1114 richest at 4,894 calories a person, 1116 at 3,150, 1112 at 2,903);
the other five end hungry, the thinnest at 758 a person — 1117's pantry
nearly empty on the last day, and still nobody starves. Everyone meets
the System by day 8 or 9. Two scholars die: Kennedy on day 12, killed by
a stranger, and the mantle passes to Camila the next day; Regina on day
28, lost to the wild on the very last day, her successor still unnamed
when the month ends. The villages hunt hard (16 to 31 monster kills each,
256 in total) and test their meat: all ten taste it, eight get it out of
the pantry, and one villager — Willem — proves a toad is poison and lives
to tell it. People ask each other for help and mostly get it: 19 of 27
sittings offered the commit, all 19 picks became real promises, and the
six refusals after a pick were all honest ("I'm out on the road — find me
when I'm back"). Three of those promises became real food in the pantry:
Tahani, Devon, and Dale each walked out with the scholar, worked a patch
together, and brought the food home — the first time the full
kept-promise chain has completed on a panel. Parties form and three of
four people say yes. Villagers are getting better at their work in a way
you can count: 87 times in a month a villager's competence stepped up a
rung — cutting wood, breaking stone, hauling water, cooking — but nobody
got better at hunting at all, because nobody is ever sent hunting. And
for the first time, the skill ladder itself fires: five villagers —
Aria, Otis, Addison, Howard, Luna — turn preserver experience into an
actual skill. Four villages lose nobody at all (1112, 1114, 1116, 1117,
1121 — five, in fact). The villages are alive, social, and mostly fed
this panel — and this panel, the story is that a promise made at the
fire can now end as food in the pantry, while the fighting skill the
game needs most is still the one nobody practices, because the month's
work is all chores.

Pops end 12, 10, 12, 9, 12, 12, 10, 11, 11, 12 (seeds 1112–1121).
Scholars spawned: Mateo, Kennedy, Jalen, Otto, Pearl, Willow, Regina,
Tamika, Moshe, Emilio. Monster kills per seed: 19, 28, 28, 29, 16, 27,
30, 27, 31, 21. Self-sufficiency at d28 ranges 0.851–0.999. Villager
deaths 9 total: 2 scholars (Kennedy, betrayed by a stranger, day 12;
Regina, the wild, day 28) and 7 others — 2 monster (Maya d25, Ernesto
d19), 2 sickness (Wanjiru d24, Efraín d15), 1 ambush (Eloá d22), 1
"Inspiration" (Pavel d18), 1 "Ad Break" (Caleb d25), 1 wound that
wouldn't close (Rosa d25). **Seed 1113 is the mantle village:** Kennedy
dies day 12 and Camila takes the mantle day 13; Eloá dies day 22 in an
ambush; the pantry ends at 930 a person. **Seed 1115 is the death
village:** three die (Pavel, Caleb, Maya) and the pantry ends at 1,017.
**Seed 1114 is the fed village:** 12 pop, 0 deaths, 28 kills, FED at
4,894 a person — healthy, and the richest on the panel. **Seed 1116 is
the poison village:** Willem proves the toad poison day 20 and lives;
Devon keeps a 1,620-kcal promise the same panel.

## People check (transcripts read in full — both counted never-offered sittings, plus Tahani)

- **1117 d6 Owen (unresolved, 18 turns): Real — a filler loop. The want
  never advances past stage 1.** Owen opens withdrawing the want
  ("Never mind the creek water run — we got it handled. Thanks
  anyway.") — stage 1, thread='want', "that sickness help". The driver
  circles the menu for 18 turns: "That's the state of things. What's
  up?" and "Anyway — people stuff. What did you want?" repeat verbatim,
  and the observe fallback fires three times ("I just said — did you
  miss it?", "I just told you — what else is on your mind?") because
  the wind-down gate keeps replacing leave with observe while Owen has
  nothing new to say. The specific want-thread option ("We never
  finished — that sickness help") sat on the menu four times (turns 5,
  9, 13, 17) but the driver never took it — it kept picking
  [menu:more] / [dlg:subject] / the generic [alive:want:ask_favor],
  which Owen deflects ("No, really — it's handled. Thanks for asking,
  though."). Counts toward M-PR1 (18 turns). The finding is twofold:
  the conversation can loop 18 turns with the want stuck at stage 1,
  and the driver never steers into the want thread that is actually
  offered. Driver-policy gap for the next run; the game side is the
  stage-1 stall itself.
- **1121 d9 Oliver (unresolved, 8 turns): Real — a good conversation
  whose want was already withdrawn.** Oliver opens withdrawing the want
  ("Never mind the food I needed — we got it handled. Thanks
  anyway.") — stage 1. The driver then takes the gossip thread deep,
  1→7, with real content (Miguel, Tymish out for water, Onni back,
  Naran the bus driver, Victor out for water), and it ends cleanly:
  "Well. My social battery is officially dead." / "This was good."
  They mean it. The [alive:want:ask_favor] option was on the menu at
  turn 2 but the driver chose gossip. Counts toward M-PR1 (8 turns);
  the game hid nothing — there was no open favor to commit to.
- **1112 d8 Tahani (sitting, read in full — the kept-promise villager).**
  Real person: a pantry-run ask, a commit ("Good. The east treeline, at
  sunup. Bring your pack and your knife."), a party invite honestly
  refused ("I can't. Not today. Ask me when the work's done."), a
  crossing-guard past life ("Being a crossing guard feels like a past
  life. Sometimes I wonder if I dreamed it."), a goal ("I want a door I
  can close. Not to keep people out — to know I could."), and a
  wind-down ("Home's a feeling, not a place. I'm chasing the feeling.
  Some days I get close."). One verbatim repeat (a subject-deflection
  line twice in 24 entries) — minor, noted not fixed.

## Blank filled / documented

- **Q1 JOINT-FORAGING CHAIN: CHAIN-COMPLETES-NEAR (fresh seeds).** The
  kept-promise chain completes end to end — asked, waited, departed,
  together press with haul, deliver, kept — three times on this panel,
  all three delivering and keeping. The binding rung is getting a
  together press to land with edible haul. H-FAR as stated is falsified:
  far nodes were never tried because the 6 nearest forageable nodes are
  all adjacent; the far-node test never fired. The next run should sort
  or try by freshness, or skip worked-out patches — not by distance.
- **THABO ANOMALY EXPLAINED — the game departs favors itself.** Seed
  1112 Thabo departed with waited=false and no driver "*** OUTING
  depart" line. Cause, found in code: `src/js/favor-outing.js` has a
  game-side dawn appointment engine (`attemptWaitingOutings()`, endDay
  dawn hook) — at dawn it attempts every promised unstarted forage_help
  favor itself, places the partner adjacent (appointment_meet rule),
  performs via the checked path, and stamps `favor.outingAttempts`
  with the outcome/reason. The driver's outingDawn usually runs after
  the game engine already departed, so `forageFavorWaiting` is false
  (the run exists) and the driver undercounts departs (6 logged vs 7
  actual; the analyzer's snap-based departs=7 is the truth) and waits
  (6 is a lower bound). Next-run instrument note:
  `favor.outingAttempts` (game-stamped dawn outcomes with legible
  blockers) is a better never-waited instrument, but census snaps don't
  record it yet. No defect — the engine is doing its job; the driver's
  counting is behind it.
- **SPECIALIST SKILL STEP OPENS.** Five villagers cross from foodXp
  into actual specialist skill (all preserver). The r112 fix's skill
  level fires for the first time on a landing panel.
- **R73 NARROW WINDOWS KEEP — 3 inside zero-slack windows** (r117:
  0). The tight-window design input now has kept cases.
- **POISON FIX HOLDS A SEVENTH PANEL.** 1 poison verdict, tester
  survives, 0 re-tests of the same flesh.
- **M7 GOAROUND-HOLDS on the kcal leg** (R84 ALL-ARRIVED 2/2, R85
  RESCUE-GO 2/2). Water leg untested a 28th run.
- **EAMON FALLBACK — NO LIVE EXERCISE (fifth panel running).** 0
  starvation deaths, so 0 STARVATION lines and 0 pantryAtDeath lines.
- **M-A2 STRUCTURALLY-UNREACHABLE re-confirmed.** No prims, no muster,
  no wave-4 kills, no table plans on any d28 census.

## Notable events

- **First kept-promise chain on a panel (three times).** Tahani 775
  kcal (1112, mid-day), Devon 1,620 kcal (1116, evening, 4th node —
  the widening to 6 plausibly made the difference), Dale 360 kcal
  (1120, evening, 2nd node). Every haul press delivered and kept.
- **Devon's first press hands-empty with 7× unknown shoots** — a live
  H-KNOW specimen: the patch yielded only unknown plants on the first
  press, then a real haul on the next node.
- **Kennedy's death by "a stranger" (1113 d12)** — the mantle passes
  to Camila the next day, latency 1. The stranger-kill shape (not a
  monster, not a contest) is the year's quietest death cause.
- **Regina dies on the horizon day (1118 d28, "the wild")** — her
  successor is still unnamed when the month ends; the succession watch
  records it as unresolved-at-horizon, a boundary artifact.
- **Two contests fired on the horizon day and stay open** (Lie
  Detector 1114, Siege 1117) — legitimately open, not stuck.
- **The Static Kite fight (1116 d23):** the scholar strikes three
  times and deals nothing — the kite circles above reach — while Luz
  and Addison bring it down. Flying monsters read as out of reach to a
  melee scholar; the fight still wins.
- **Service restart killed the first panel attempt** (~05:25Z,
  mid-1113). Re-ran all 10 seeds; no data from the killed attempt used.

## Reachable / fun / winnable

- **Reachable:** the joint-foraging chain is reachable by a real player
  now — three kept promises on one panel, two of them through the
  evening leg a player can actually drive (try more patches, walk to
  another green patch). The far-node leg of the chain is still
  unreached by design of the test, not by the game.
- **Fun:** the villages read as alive — gossip threads go seven deep,
  people refuse honestly, the beast-naming vote runs, contests fire
  with real TV phases. The Owen 18-turn loop is the fun gap: a
  conversation can circle with nothing new to say while the want sits
  unasked.
- **Winnable:** the win plan lives at d14 on 6/10 seeds and d28 on
  7/10, with party fights rising 33→136 across the month — but M-A2
  is structurally unreachable again: no prims, no muster, no wave-4
  kills, no table plans anywhere. The road to the table is still not
  open in the landing window.

## Telemetry deviation check (closeout, adopted run)

Ran `node scripts/telemetry-check.js` in the worktree against the
r118 census files (`hidden_files/evidence/2026-11-08/landing-r118/
journey-landing-r62-census-*.json`, n=10).

- Against `telemetry-baselines/landing.json`: LOUD systemDay 156%
  (32→82), deaths 2117% (12→266), folTelemetry.fires newly appeared
  (0→11). **That baseline is SUPERSEDED** — its own `_superseded`
  note says "Do not compare new landing corpora against this file"
  (deaths series split per panel ruling 753). Those three LOUD lines
  are a wrong-baseline artifact, not a game signal.
- Against the live baseline `telemetry-baselines/landing-split.json`
  (systemDay, villagerDeaths, monsterKills, folTelemetry.fires,
  starvAutopsies): LOUD systemDay 148% (33→82), monsterKills 967%
  (24→256), folTelemetry.fires newly appeared (0→11);
  villagerDeaths and starvAutopsies quiet.
  - **systemDay EXPLAINED:** the check sums across files; baseline
    33 is a 4-seed-era total, current 82 is a 10-seed total.
    Per-seed mean 8.2 vs baseline-implied 8.25 — flat.
  - **monsterKills EXPLAINED:** same n-mismatch. Per-seed mean 25.6
    vs baseline 24 (+7%) — the rate is flat; the 967% is the
    10-seed sum against a per-seed-scale baseline. (The r66 baseline
    note itself records monsterKills LOUD on every run r58–r66, each
    verdict EXPLAINED — this is the standing n-mismatch artifact.)
  - **folTelemetry.fires EXPLAINED:** baseline 0 predates the
    instrument's nonzero era. r117 (previous landing run, same 10
    seeds) recorded the identical total, 11 fires — the value is
    unchanged run-over-run, not a new behavior. The fires are the
    follower-volunteer feature ("You shouldn't go out there alone.
    I'm coming.") firing ~once per village-month.
- **Baseline NOT rolled.** All three LOUD lines are explained
  aggregation/staleness artifacts; rolling a 10-seed total into a
  4-seed-era baseline would corrupt it. The baseline needs a
  per-seed normalization fix — a main-session/tooling call, not this
  closeout's job.

## Regression

- Proof test (`scripts/test-landing-r118-outingchain.js`): PASS on
  the branch tip before the rebase AND on the rebased tip
  (581bffda2) — fixtures + r117 calibration, both runs.
- `check.js --quick` on the branch tip: first run 280 passed /
  10 failed vs r117's 284/6 (see the closeout section below for the
  re-run numbers and the failure list).

## Closeout (adopted run — this run adopted the timed-out r118)

- The r118 run (lock `2026-11-08T04:35:00Z`) timed out at 2h before
  closeout. This run found no lock (the ship loop had deleted the
  stale 04:35 lock at ~06:00Z after finding no matching registry
  heartbeat), created its own lock
  `playtest-loop-a-20261108T063551Z`, and adopted the closeout.
- Recovery: the run note was untracked in `journey-landing`
  (evidence/2026-11-08/journey-landing-r118.md, last written 06:15Z,
  20+ min before adoption — no live worker). No src/js changes in
  the tree (assessment-only run). Panel evidence (137 files) was
  already preserved in goal hidden_files
  `evidence/2026-11-08/landing-r118/`.
- Telemetry: investigated in the Telemetry section above — all LOUD
  lines explained (wrong/superseded baseline + n-mismatch +
  stale-baseline instrument); baseline NOT rolled.
- Rebase: master had moved (2ce918e0e → 8dc3d16d2, the batch-ship
  version bump; origin/master agrees). Rebased the branch onto the
  explicit SHA 8dc3d16d2 — clean, 1 pick, no sequencer stop. Tip
  581bffda2. `git log master..HEAD` shows exactly one commit.
- Proof test re-run on the rebased tip: PASS (see Regression).
- Registry-lock queue: this run's pre-flight reap (06:36Z) and
  journey-landing heartbeat (06:39Z) queued ~40+ min behind a
  sibling reaper whose per-tree `git status` scans take 20+ min each
  under load ~20; the queue drains in order and the reaper itself
  queues behind the same lock, so no reap can fire on a queued
  heartbeat. journey-landing heartbeat 06:20:07Z (~1h stale at
  closeout) is well inside the ~4h reaper threshold.
- Merge: `git merge --ff-only journey-landing` in the main tree
  (read-only), then release + remove the tree + branch, then final
  reap sweep. Lock deleted at closeout after read-back of run_id.
- Merged locally, pending ship. No bump, no push, no live
  verification (ship loop owns those).

## Metric review

- **Q1 metric (kept favors ≥1, haul by distance):** GO as
  CHAIN-COMPLETES-NEAR. The far-haul half of the metric never fired —
  not a miss, a test-design gap: the evening leg's 6 nearest nodes are
  all d1, so distance never varies. Propose for the next run: sort or
  try nodes by patch freshness, or skip worked-out patches, so the
  far leg is actually exercised. Do not re-score this run's verdict.
- **M-PR1 (per-seed ≥3-turn never-offered ≤1 on ≥8/10):** PASS 10/10.
  The two counted cases are adjudicated above (Owen: real filler loop;
  Oliver: withdrawn want, good conversation). The ≥3-turn rule keeps
  working: six of eight never-offered sittings are 0–2 turns and
  excluded.
- **M-PR2 revised (promised / (offered − stated-after-pick)):** 100%,
  line holds. The away-guard exclusion (6 stated-after-pick) is doing
  real work — without it the rate would read 13/19 = 68% and fail.
  The revision stands.
- **Q2 practice (movedCells d1→d28 ≥ 60):** GO at 87. Hunt reps 0
  again — the H1 question (hunt-assignment policy: does the competent
  policy need a hunt-assignment branch, or is chore-first correct
  play?) is still open for the next run.
- **Q6 water clause:** UNTESTED a 28th run. The denominator
  (wildOutingIterations=3, hydUnder25=0) never materializes in the
  landing window. This metric needs a different instrument or a
  different leg; carrying it unchanged into r119 is measuring the same
  absence again.
- **R104 win-plan (planSeeds>0 on ≥5/10 at d14):** GO (6/10). M-A2
  stays retired as structurally unreachable.
- **Zero-DMG (v2):** 2/16, both others-killed, both with a legible
  shape (flying reach, ally kill). No defect claimed.

## Next run (no r119 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are
other legs, so no landing r119 driver is prepared here. The next landing
run prepares its own driver from the r118 driver and re-verifies its seed
band fresh across all dated preregs (next fresh band after 1112–1121
starts at 1122; 1122–1131 was spot-checked — only 1 incidental hit,
"~1129" tableOfferPaths in sim-doorwalk-b-prereg.md, 2026-11-07 — but
must be re-verified by the next run; contaminated bands stay excluded:
897–906, 1301–1304, 917–926, 1001–1010, 1101–1110, 1201–1210,
2001–2010, 3001–3010, 1033–1042, 1043–1052, 1053–1062, 1063–1072,
1073–1082, 1083–1092, 1093–1102 (overlaps 1101–1110), 1111 (single seed,
social r11)).
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
unobserved — Regina's d28 death is a boundary case, not a latency);
report starvation deaths per seed alongside the R66 gate; M7 stays as
written with R85 as its companion; M6 stays as written; the Miriam line
test is the standing line for exit-pool wording (any "settled" fails
it); the skill0->pos count splits into foodXp vs specialistSkill from
here; the policy question is open — does the competent policy need a
hunt-assignment branch, or is chore-first correct play? — and the Q1
far-node leg is the next blank: sort or try nodes by patch freshness, or
skip worked-out patches, so the far leg is actually exercised; the Owen
18-turn filler loop (want stuck at stage 1) and the driver's never taking
the offered want-thread option are the next conversation-quality items.
