# Journey — Landing r117 (2026-11-07, Lane A leg 0)

Run id `laneA-20261107T1650Z`, scheduled Sat 2026-11-07 16:45 CST, started ~22:50Z.
Leg 0 LANDING. Branch `journey-landing`, base `783c33400` (master at run start;
`git pull` already up to date; no master movement during pre-flight).
Rotation 0→1 written at run start, verified by read-back.

## Prereg (committed 45f9a9d85, before any seed ran)

Q1 (PRIMARY): hunt practice — why does hunt never move? Three panels (r112:
82 cells, r113: 94, r115: 94) moved hunt competence 0 times while villages
killed 18–44 monsters a month. Code facts pre-established: the practice
ladder covers hunt (8 reps = rung 1, cumulative 8/20/36); villagerPractice
fires ONLY from resolveOneAssignment (game.js:7524), once per resolved dawn
assignment; field-fight kills NEVER call it. Three mechanisms: H0 threshold
(reps accumulate, none reaches 8), H1 no assignments (reps stay 0), H2 moves.
New analyzer scripts/analyze-landing-r117-huntpractice.js reads the census
practice snapshots (no driver change). Q2–Q6 + carried bindings as in r115.
Seeds 1083–1092 (fresh — 840 preregs searched, 0 hits; no corpus; see prereg).

## Infrastructure notes (loud first)

- **Registration took ~6.6 min (slow checkout).** A mid-checkout `git status`
  read showed transient D entries that resolved to a clean tree once the
  checkout finished — verified 0 status lines before any work. The register
  itself completed exit 0; the tree branches from master 783c33400.
- **Safe-commit index clobber struck on the prereg commit** (known class).
  Repaired per the recorded recipe (`git ls-tree HEAD` + `git update-index
  --add --index-info`); verified `git status` clean (0 lines), `git diff
  HEAD` empty, all 3 blobs match HEAD. Commit 45f9a9d85 itself is correct
  (3 files).
- **Pre-flight clean.** Main tree clean, disk 24%, `git pull` already up to
  date. Reaper removed nothing; active trees 2/16 at pre-flight (plus this
  run's). **No lock existed at start.** Lock created 22:50Z, run_id
  `2026-11-07T22:50:01Z`. Deleted at closeout after read-back of run_id.
- **Heartbeat loop held** at registration + ~10-min intervals.
- **Context (not this run's work):** Steve 2026-11-07 16:55 CST approved the
  4 new alien personas ("Yes proceed with those aliens") — build coordinator
  running (alien expansion + Reunion mirror cap in parallel worktrees); and
  the feast-as-gate question is now a DESIGN BRIEF (multi-path victory
  gating research underway), not a question. This run measures master as-is;
  no action here. The drive build is still unmerged; the one-brain program
  proceeds elsewhere (build-brain-p1 active).

## Panel

Pilot: 3 seeds (1083–1085), DAYS=28, exit 0 in ~81s. All 3 alive, systemDay
8, practice snapshots present (d1/d14/d28, non-null competence maps,
practice['hunt'] fields present), Q1 analyzer runs on the pilot corpus
(huntReps=0 on all 3, 95 kills), invariant test PASS on the pilot corpus
(10 fights, 0 violations), 10 hunt fights. All 5 pilot gates passed →
expanded to full panel. Full panel: 10 seeds 1083–1092, DAYS=28, exit 0 in
~66s. 10 census files in goal hidden_files
`evidence/2026-11-07/landing-r117/`. Logs: `landing-r117-pilot.log`,
`landing-r117-panel.log` (same dir). Analysis:
`landing-r117-panel-analysis.txt`, `landing-r117-practice.txt`,
`landing-r117-navlog.txt`, `landing-r117-commit-offer.txt`,
`landing-r117-zerodmg.txt`, `landing-r117-huntpractice.txt`,
`landing-r117-fights.txt` (same dir).

## Panel verdicts

- **Q1 HUNT PRACTICE: H1-ESTABLISHED — no hunt assignments resolve in the
  landing window, on fresh seeds and on the calibration corpus.** Panel:
  304 kills, **hunt reps 0, hunt max 0, villagers with hunt reps > 0: 0,
  hunt moves 0** on all 10 seeds. The calibration run on the r115 corpus
  BEFORE the pilot gave the same shape (302 kills, hunt reps 0, H1).
  The cause is named, from code read before the panel and confirmed by the
  numbers: practice reps flow ONLY through resolved dawn assignments
  (game.js:7524), and the competent policy's assignment set is exactly
  {water, wood, garden, deadfall, fish, cook} (competent.js: workWater,
  garden, deadfall/fish/cook staffing) — it NEVER assigns hunt, scout,
  patrol, tend, teach, mend, or forage-as-assignment. The 304 field-fight
  kills never touch the ladder. The same shape covers scout/patrol
  (0 reps, 0 moves) and tend/teach/mend (0 reps). Stone reps (951) arrive
  through task leads, not policy assignment — but no hunt lead exists in
  this window either. So "hunt never moves" is a POLICY shape, not a game
  defect: the game offers hunt as a task (delegateTasks, danger 1) and
  resolves it through a real hunt (villagerHuntResolve); the competent
  player simply never sends anyone hunting in the first month. The
  ladder's first rung (8 reps) is unreachable in the landing window BY THE
  POLICY, not by the game. Follow-up for the next run: does the competent
  policy need a hunt-assignment branch (fed pantry + idle hunter), or is
  the first month correctly chore-first? A policy question, not a fix in
  this run.
- **Q2 PRACTICE: GO — fourth panel running.** Moved cells d1→d28 = **95
  across 10/10 seeds, all 95 attributed** (d1→d14: 69) — r115: 94, r113:
  94, r112: 82. Per-seed d1→d28: 8, 9, 11, 10, 11, 9, 8, 10, 9, 10. By
  task: stone 32, wood 28, water 19, deadfall 8, cook 8, **hunt/forage/
  garden/fish/scout/patrol/tend/teach/mend: 0**. The crack outside the
  chores did NOT recur this panel: fish reps 14 and garden reps 6
  accumulated but stayed below the 8-rep first rung (r115: fish 90 reps /
  4 moves, garden 35 / 1). The movement is chores-only again — and the
  fish/garden reps show the rung, not the assignment, is the binding
  constraint there.
- **SPECIALIST GATE OPENS (new, not pre-registered — reported, not
  re-scored): skill0->pos = 21, all preserver foodXp 0→positive.**
  r112/r113/r115 all read 0. The cause is a landed game change in this
  base: commit 4e6fa44ab (journey-establishment r112 Q1: "specialist
  ladder fix — foodXp buys skill from 0, village work grants foodXp
  (racks/hunts)"). This panel is the first landing measurement of that
  fix: 21 villagers gained preserver foodXp from 0 (e.g. Enrique 0→9,
  Logan 0→8, Samat 0→13, Hassan 0→18). Specialist SKILL itself still
  0→positive 0 — the foodXp accrues, the skill grant from it has not
  fired in 28 days. Precise statement: the gate is open at the foodXp
  level; the skill step stays shut in this window.
- **Q3 engagement lines (standing bars):**
  sittings=26, offered(commit)=24, picked=24, promised=16, statedAfterPick=8,
  neverOffered(commit)=2.
  - **M-PR1 per-seed (≥3-turn rule): 10/10 — PASS.** The 2 never-offered
    sittings split 1 counted / 1 excluded by turn count: counted — 1083
    d12 Sanne (4 turns); excluded — 1084 d14 Juni (1 turn). Per-seed
    counted never-offered: 1083:1, all others 0 — every seed ≤1. The
    unfiltered count gives the same verdict (10/10). Transcript
    adjudication of both never-offered sittings (read in full, below)
    finds **zero live cases of the game hiding engagement or commit**.
  - **M-PR2 revised: 16/(24−8) = 16/16 = 100% ≥ 80% — LINE HOLDS.** All 8
    stated refusals are the R72 away-guard line ("Wait — I'm away from
    Haven, out on the road…"). Away-guard share: 8/24 = 33% (r115: 30%,
    r113: 26%, r112: 29%).
  - Pooled never-offered rate 2/26 = 8% (reported for the record;
    per-panel bar retired per r109's review).
  - The pooled thread-gate count grows to 15 (r115's 13 + Sanne, Juni):
    engagement never picked, want stayed stage 1, thread='want', want
    withdrawn in the opener. The retired question stays retired.
- **Q4 M7 goaround: GOAROUND-HOLDS — 3/3 = 100% ≥ 80%.** R84 kcal:
  arrivals=3, arrived=3 (1083 d11, 1084 d5, 1089 d11). The ladder agrees
  (R85 RESCUE-GO 3/3). R88 EAT-ON-ARRIVAL 3/3 ate.
- **Q5 M6 doorstep: DOORSTEP-GO (1/1).** R88 DOORSTEP: checks=280,
  triggered=1, ate=1 (1090 d6, kcal 1128→2328, entered the hall, drank
  false). 0 class-E scholar starvation deaths; 0 triggered steps ending
  enterResult===false.
- **Q6 water: UNTESTED (27th run).** Wild outing iterations=6,
  hydUnder25=0, minHyd=72, waterSkips=0. R84/R85 water both UNTESTED, 0
  skips. R86: no Maeve shape (0 qualifying). R88 MAEVE: snaps=3,
  qualified=0, MIXED mechanism (3 inside-hall, with bottles).
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (d14 pops 11–12).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on all ten seeds.
- **M3 FIGHT-LOG: PASS.** 21 hunt fights, 21 complete, 0 fatal, 0 with
  unknown/mixed trigger.
- **M5 PEOPLE: PASS.** Wind-down more picks 8, empty 0; WD probe sittings
  10, surfaced 10, menuMore 7, pageTurns 28, page3sittings 3, maxPage 4,
  phase2Opened 6, phase2Yielded 1, GATE-A GO, GATE-B GO; betrayal 0 held;
  party invites offered 9, picks 9, spoken 9, dry 0, accepted 8 (PARTY-GO
  — Nina is the one honest refusal: "I work alone. Nothing personal.
  ...It's a little personal."); R67 case labeling 13/13 MATCH
  (LABELING-GO). Two full transcripts read for sense (below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitSeeds
  3/10, departSeeds 6/10, keptSeeds 0/10, keptTotal 0, DEPART-ONLY (r115:
  2 kept). The 7 never-waited seeds are explained by their action reasons
  (the carried driver-side friction, r106) — the driver never gets
  adjacent. R94 DAWN-DOOR: opps=450, waitDiagMissing=0.
- **R73 WINDOW:** promised=12, askedOnly=26, outOfWindow=0, all 12 NARROW,
  keptInsideNarrow=0 (r115: 2, r113: 5). NARROW-PATTERN continues; the
  kept-inside-narrow line falls to zero this panel (design input).
- **R66 horizon pantry: 3/10 HUNGRY, NOT-HUNGRY by the revised gate** —
  starvationDeaths=0 (r115: 0), slideSeeds=0, bandSeeds=6, noSlideSeeds=4.
  Starvation deaths per seed: 0 on all 10 seeds. FED seeds: 1083 (2,218),
  1084 (5,865), 1085 (4,870), 1086 (3,367), 1088 (3,985), 1090 (5,393),
  1092 (5,547). HUNGRY seeds: 1087 (1,844), 1089 (774), 1091 (1,281) —
  three thin villages, no famine deaths. 1089 is the famine seed (774 a
  person) and still nobody starves.
- **Mantle: REPRODUCED — the 2-day latency is live for the first time
  since r107.** Latencies=[2] (1089: Lucia d23 → Victor d25). Lucia dies
  d23 by betrayal in the Duel contest (fired d22, end d23); the village
  runs scholar-less through d24 ("no fresh conversational villager
  today"); the mantle passes to Victor d25. Zero unresolved at horizon.
  The pass timing varies 0–2 days across panels; the slow case is a
  contest death. Why d24's dawn didn't pass it stays open — the
  succession sweep's timing is the next run's instrument question, not a
  verdict here. The owed item is now observed, not just owed.
- **Win-plan (R104, carried):** planSeeds d14 on 5/10 seeds, d28 on 8/10;
  holders 22→34; partyWaits 15→53; partyFights 73→171. **M-A2
  re-confirmed STRUCTURALLY-UNREACHABLE** (retired metric, consistency
  check only): prims=0, no muster, no wave-4 kills, no table plans on all
  d28 censuses.
- **Contests:** fired=13, ended=13, openAtHorizon=0, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths. Grief: 0/8 miss, holds.
- **Kill-mean trend:** per-seed monster-kill mean 30.4 (range 19–42,
  total 304) after r115 30.2 → r113 26.2 → r112 27.9 → r111 18.8 → r110
  20.6 → r109 28.5. Flat at the top of the recent range — seed mixture,
  reported, not chased.
- **R69 ARMOR:** teleLineDisagree=0 — clean this panel (r115's 0 holds).
- **Poison re-test (r109 fix, ongoing proof): 4 poison verdicts, 0
  re-tests, all 4 testers SURVIVE.** Seed 1084: Terrence tests belltoad
  (Choir Toad) d16, gets the poison verdict; seed 1089: Hannah tests
  belltoad d8; seed 1091: Giulia tests belltoad d28; seed 1092: Fatima
  tests belltoad d15. Each verdict recorded exactly once; no villager
  re-tastes the same poison item (belltoad_legs tests are a different
  item). The fix holds a sixth panel running.
- **Zero-DMG (carried instrument): 3/21 by the pre-registered r115
  analyzer, shapes B:2 S:1 — and the S is an INSTRUMENT ARTIFACT,
  adjudicated, not re-scored.** The 1085 d24 "S" fight: the scholar
  strikes once, the log carries ONE player-strike entry with dmg: null
  and the lines "You STRIKE the heron for 35 (Hatchet)" / "The White
  Noise falls", plus a damage entry sourced 'you' applied=35. The r115
  analyzer sums strike-entry dmg (null → 0) and calls it
  struck-but-0-dmg. The scholar dealt 35 and killed it — a killing blow
  ends the fight inside tbPlayerStrike, so the strike entry's dmg is
  null. Same R82 family, one rung deeper: the entry EXISTS but carries no
  damage. The real zero-DMG count on this panel is 2/21, both B
  (scholar-stood-through): 1083 d24 (3 Hecklers, 6 rounds, villagers deal
  255) and 1085 d11 (Sunback, 3 rounds, Catalina deals 101). In both B
  fights the log carries NO scholar turn entry at all across the rounds —
  the driver logs only player-strike turns, so waits / flee-walks /
  deliberations are invisible; B means "no logged scholar strike across
  ≥2 rounds", not "the scholar did nothing". The v2 analyzer (this run,
  proof below) is the next run's standing instrument. Ally-accompanied
  fights: 20/21 have villager allies present (r115 re-base holds).

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — and again nobody
starves, though three of the ten end it thin. Seven villages end fed (1092
richest at 5,547 calories a person, 1084 at 5,865, 1090 at 5,393); the other
three end hungry, the thinnest at 774 a person — 1089's pantry all but empty
on the last day, and still nobody starves. Everyone meets the System by day
8. One scholar dies: Lucia on day 23, betrayed in the Duel, and the village
runs a whole day with no scholar before Victor takes the mantle on day 25.
The villages hunt hard (19 to 42 monster kills each, 304 in total) and test
their meat: all ten taste it, seven get it out of the pantry, and four
villagers — Terrence, Hannah, Giulia, Fatima — prove a toad is poison and
all four live to tell it. People ask each other for help and mostly get it:
24 of 26 sittings offered the commit, 16 of 24 picks became real promises,
and the eight refusals were all honest ("I'm out on the road — find me when
I'm back"). Parties form and eight of nine people say yes. Villagers are
getting better at their work in a way you can count: 95 times in a month a
villager's competence stepped up a rung — cutting wood, breaking stone,
hauling water, cooking — but nobody got better at hunting at all, because
nobody is ever sent hunting. And for the first time, the specialist door
cracks open: 21 villagers start building preserver experience from nothing,
the first sign the skill ladder works — though none has turned that
experience into a skill yet. Four villages lose nobody at all (1086, 1087,
1091, 1092). The villages are alive, social, and mostly fed this panel —
and this panel, the story is that the fighting skill the game needs most is
the one nobody practices, because the month's work is all chores.

Pops end 11, 11, 10, 12, 12, 11, 10, 11, 12, 12 (seeds 1083–1092). Scholars
spawned: Arturo, Everett, Vincent, Ruben, Harold, Keisha, Lucia, Gladys,
Arturo, Salvatore. Monster kills per seed: 28, 38, 29, 19, 27, 26, 32, 33,
30, 42. Self-sufficiency at d28 ranges 0.846–1.095. Villager deaths 8
total: 1 scholar (Lucia, betrayal, day 23) and 7 others — 5 ambush
(Carmelo d18, Nikos d11, Tashi d9, Jovan d12, Suman d14), 1 monster (Eamon
d23), 1 wound-that-wouldn't-close (Ellie d13). **Seed 1089 is the famine village and the
mantle village:** the pantry slides to 774 a person and still nobody
starves; Lucia dies day 23 in the Duel and Eamon dies the same day to a
monster, and the mantle passes to Victor two days later. **Seed 1092 is
the hunting village:** 42 kills, the panel's most, FED at 5,547; Fatima
proves the toad poison on day 15. **Seed 1084 is the fed village:** 11
pop, 1 death (Nikos, ambush, day 11), 38 kills, FED at 5,865 a person —
healthy, and the richest on the panel. **Seed 1086 loses nobody:** 12 pop,
0 deaths, 19 kills, FED at 3,367.

## People check (transcripts read in full — both never-offered sittings)

- **1083 d12 Sanne (unresolved, 4 turns): Real — the favor was already
  handled, and the driver DID ask.** Sanne opens withdrawing the want
  ("Never mind the food I needed — we got it handled. Thanks anyway.") —
  stage 1, thread='want'. The driver presses [goon] twice ("Something in
  them almost softens — then doesn't. Not yet.") and at turn 3 picks
  [alive:want:ask_favor] ("Is there something you need? Really.") — and
  Sanne answers honestly: "No, really — it's handled. Thanks for asking,
  though." The engagement was offered AND picked; the commit never
  surfaced because there was no open favor to commit to. The sitting then
  turns to the beast-naming thread (Big-Eyes, Big Loud, Ugly-Bane — the
  village voting on a name). Counts toward M-PR1 (4 turns); the game hid
  nothing. The pooled thread-gate count grows to 14.
- **1084 d14 Juni (unresolved, 1 turn): Real — thread-gate, case-crowded,
  probe-left-immediately.** Juni opens withdrawing the want; the driver
  takes [dlg:subject] once ("Sorry — I shouldn't load that on you. What's
  up?") and leaves after 1 turn — the menu underneath is five case presses
  deep (the murder of Nikos, case_4). The want never got established.
  The R67 framing line fires cleanly ("There's still the matter of the
  murder of Nikos. Nobody's settled it." — MATCH). Excluded from the
  ≥3-turn count. The pooled thread-gate count grows to 15.

## Blank filled / documented

- **Q1 HUNT PRACTICE: H1-ESTABLISHED (fresh seeds + calibration corpus).**
  The "hunt never moves" watch is answered: no hunt assignments resolve
  in the landing window, so no hunt reps accumulate, so the ladder never
  fires — while 304 field kills happen off-ladder. The cause is named
  (policy assignment set {water, wood, garden, deadfall, fish, cook};
  reps only via resolved assignments). No game defect, no fix claimed;
  the follow-up is a policy question for the next run.
- **SPECIALIST GATE OPENS — FIRST LANDING MEASUREMENT.** 21 preserver
  foodXp 0→positive moves on this panel vs 0 on r112/r113/r115 — the
  establishment r112 fix (4e6fa44ab) is live in this base and the foodXp
  level of the gate works. Specialist skill itself still 0→positive 0.
- **MANTLE 2-DAY LATENCY REPRODUCED.** The r107 owed item is observed:
  Lucia d23 → Victor d25, with a scholar-less d24 in between. The
  mechanism (why d24's dawn didn't pass it) stays open for the succession
  line.
- **ZERO-DMG S-ARTIFACT ADJUDICATED + V2 INSTRUMENT PROVEN.** The 1085
  d24 "struck-but-0-dmg" fight is a scholar killing blow misread: strike
  entry dmg null, 'you' damage 35, "The White Noise falls." The v2
  analyzer reads dealt from the 'you' damage entries; proof test
  scripts/test-landing-r117-zerodmg-v2.js PASSES (fixtures + 3 corpora:
  r117 2 zero-DMG both B, r115 unchanged 2 both B, r113 4 with the 4 R82
  phantoms out and Paul's S staying). The v2 analyzer is the next landing
  run's standing instrument. The r117 panel verdicts stand as the r115
  analyzer reported them (3 zero-DMG, B:2 S:1) — NOT re-scored.
- **M7 GOAROUND-HOLDS (3/3)** — the r113 WEAK stays repaired by fuller
  samples, not by re-scoring.
- **M6 DOORSTEP-GO (1/1)** — the first triggered doorstep step since
  r113 (r115: 0 triggers). A single case, reported as such.
- **POISON FIX HOLDS A SIXTH PANEL.** 4 poison verdicts, 0 re-tests, all
  4 testers survive.
- **EAMON FALLBACK — NO LIVE EXERCISE (fourth panel running).** 0
  starvation deaths, so 0 STARVATION lines and 0 pantryAtDeath lines.
  The fallback stands proven by the synthetic corpus + the exact r111
  case; a future famine panel exercises it live.
- **R70 DEPART-ONLY (kept 0/10).** Departures fire (6/10 seeds), no kept
  promise — the joint-foraging kept promise still doesn't land. The
  R71 TOGETHER-NO-GO (0 haul-carrying together presses, blocked 11× by
  "You carry 0 kcal") is the same shape one rung down: the driver never
  carries kcal into the outing. Documented as the next blank, not chased
  by changing the panel.
- **No other blank filled this run.** Water still untested (27 runs); the
  fish/garden crack did not recur (reps below the rung); R73 kept-inside-
  narrow falls to 0; M-PR1 passes 10/10.

## Notable events

- 0 starvation deaths in a fourth panel running — but 3/10 villages end
  hungry and 1089 ends at 774 a person: thin, not famine.
- 1 scholar death in one panel (r115: 3, r113: 3) — Lucia, betrayed in
  the Duel on day 23, with a 2-day mantle latency to Victor.
- Party invitations accepted 8/9 (r115: 5/7, r113: 3/8) — the best
  acceptance on this line; Nina's refusal is honest ("I work alone.").
- Flesh channel: 8/10 seeds get monster meat out of the pantry (r115:
  10/10), 10/10 test it — the channel opens; 1091 is STUCK (belltoad
  tested d28, no exit by horizon).
- Practice moves competence on 10/10 seeds a fourth panel running — 95
  cells, the same shape as r113/r115 (chores-only), plus the first
  preserver foodXp moves (21).
- 1092 kills 42, the panel's most, and loses nobody.
- The registration checkout ran ~6.6 min (slow); the prereg commit hit the
  known index clobber, repaired. No data from any killed attempt was used
  (nothing was killed this run).

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 13 fired, flesh
  channel opens 8/10 (tests 10/10), outings depart 6/10, win-plans seed
  5/10 by d14 and 8/10 by d28.
- **Fun: yes.** Transcripts read like people; Sanne's sitting is the
  panel's best — a withdrawn favor handled honestly, a villager who almost
  softens, then the whole village voting on a name for the beast. Fatima
  proves a toad is poison and lives. Lucia's betrayal in the Duel and the
  village's scholar-less day is the month's story. The villages are
  mostly fed this panel, which reads as a breather after r113/r115's thin
  months — and the hunting village that loses nobody (1092) is the
  month's bright spot.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone (planSeeds 5/10 d14, 8/10 d28 —
  the best landing panel yet on that line is r115's 6/10 d14, 9/10 d28;
  this panel is a touch behind it, but no wave-4 kills, no muster, no
  table plans on any d28 census). (Context from outside this run: the
  specialist ladder fix is the fourth landed lever to move a landing-leg
  number — preserver foodXp moves in the first month — but the funnel has
  not moved with it. The drive build, still unmerged, is the one aimed at
  the funnel.)

## Metric review

- **Q1 worked — and the calibration did the real work.** The analyzer run
  on the r115 corpus BEFORE the pilot already showed H1 (302 kills, hunt
  reps 0); the fresh panel confirmed it exactly (304 kills, hunt reps 0).
  The question is answered, not just measured: the rep source is
  assignments-only, and the policy never assigns hunt. Proposal: keep the
  r117 huntpractice analyzer as the standing instrument (it subsumes the
  rep-distribution question the r112 analyzer never asked); the next run's
  question is the policy one — a hunt-assignment branch when the pantry is
  fed — or the answer is "chore-first is correct play" and the watch
  retires as a policy shape. The threshold hypothesis (H0) is dead: reps
  are 0, not 1–7.
- **Q2 worked — and the task split is the finding to carry.** 95
  attributed cells on 10/10 seeds a fourth panel running; the instrument
  detects practice movement in the landing window. The split is the
  finding: wood/stone/water/deadfall/cook move, fish/garden accumulate
  reps below the rung this panel (14/6), hunt/scout/patrol never get a
  rep at all. Proposal: keep the practice snapshot as a standing
  instrument; the next run reports the rep totals (huntpractice analyzer)
  alongside the moves, because reps-below-rung and reps-zero are
  different stories.
- **The skill0->pos jump (0 → 21) is a BASE CHANGE, not a panel effect.**
  The establishment r112 specialist fix landed between r115's base and
  this one; the panel measures it, it doesn't prove the instrument
  changed. Proposal: the next run re-reports skill0->pos with the
  specialist/foodXp split (foodXp vs specialistSkill) so the skill step
  is judged on its own, not inside one pooled count.
- **M-PR1 passed 10/10 with the only counted case on one seed.** 1083
  carries the single counted never-offered sitting; every other seed has
  0. The rule binds without re-scoring the past, and the unfiltered count
  agrees (10/10). The rule stays.
- **M-PR2 revised holds a sixth panel running (100%).** The away-guard
  share is 33% (r115: 30%, r113: 26%, r112: 29%, r111: 29%, r110: 36%).
  Both stand as the lines for the next run.
- **M7 holds (3/3).** The snapshot arrival bar is the honest measure and
  the sample supplied the cases. The bar stays as written with R85 as its
  companion.
- **M6 GO on a single case (1/1).** The doorstep question still needs a
  panel that supplies more triggers; a 1-case GO is a weak GO, reported
  as such. The bar stays as written.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.
- **Kill mean flat at the top (30.2 → 30.4).** Seed mixture (r109 was
  28.5, 1092's 42 pulls this panel up) — reported, not chased. The
  telemetry LOUD lines are the same aggregation artifacts as r94–r117
  (baseline NOT rolled).

## Regression + telemetry

- Proof tests (this run, on the branch tip before the panel): zerodmg-v2
  proof PASS (fixtures + r117/r115/r113 corpora); Miriam line PASS (0
  settled-asserting); zero-DMG invariant PASS on the r117 panel corpus
  (21 fights, 0 violations — run after the panel; see below).
- Back-compat/calibration runs on the r115 corpus (BEFORE the pilot):
  huntpractice H1 (302 kills, hunt reps 0); v2 analyzer 2 zero-DMG both B
  (unchanged); invariant 0 violations; Miriam PASS.
- **check.js --quick ran once on the branch tip (worktree AGENTS.md
  requires it before push; the ship loop runs the full check before
  pushing).** 284 passed, 6 failed in 734s — IDENTICAL to r113/r115 (284/6).
  The 6 failures are ALL from the adjudicated pre-existing set, the same six
  files: test-measurement-proof-update.js, test-measurement-workflow.js
  (retained neutrality proof), test-mobile-combat-cadence.js (Continue
  round-wrap), test-occupation-panels.js (real CLI workflow),
  test-phone-frame-proof.js (retained browser inputs vs current source),
  test-establishment-r20-fixes-20261020.js (racks-full voice gate). None
  touches the landing analyzer, the practice instrument, the NAV-log
  classifier, the zero-DMG analyzers, or any file this branch changed — the
  branch introduces zero src/js changes and no new failure. The new proof
  tests are not in check.js's fixed list; run directly they pass (see
  above). Full output: `/tmp/check-r117-quick.log` (kept on this VM; the
  ship loop re-runs the full check before pushing).
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r117 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94–r115), baseline NOT rolled: (1) systemDay baseline 33 → current
  sum 80 over 10 files (per-seed 8, mean 8.0; baseline is a 4-seed-run
  sum); (2) monsterKills baseline pooled mean 24 → current sum 304 over
  10 files (per-seed mean 30.4, range 19–42; r115 was 30.2, r113 26.2).
  No behavior change is indicated.

## Next run (no r118 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r118 driver is prepared here. The next landing run
prepares its own driver from the r117 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1083–1092 starts at
1093; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092).
Carried to the next landing run: the practice snapshot is a standing
instrument (report d1→d14 and d1→d28 side by side, PLUS the rep totals
from the huntpractice analyzer — reps-below-rung vs reps-zero are
different stories); the NAV-log classifier is a standing instrument (any
GENUINE "(no line)" is an investigation item); the r117 v2 zero-DMG
analyzer is the standing instrument for the zero-DMG question (the r115
analyzer is retired — its strike-dmg read is wrong on killing blows);
the invariant test is the standing after-proof (0 violations on every
panel); M-PR1 per-seed (≥3-turn rule) + adjudication and M-PR2 revised are
the standing lines; the Eamon fallback's live exercise, the R70
never-waited friction, and the mantle 2-day latency stay carried (the
latency is now OBSERVED — the next run instruments the succession sweep's
timing); report starvation deaths per seed alongside the R66 gate; M7
stays as written with R85 as its companion; M6 stays as written — a future
panel with doorstep triggers judges it harder; the Miriam line test is
the standing line for exit-pool wording (any "settled" fails it); the
skill0->pos count splits into foodXp vs specialistSkill from here; the
policy question is open — does the competent policy need a
hunt-assignment branch, or is chore-first correct play? — and the R70/R71
kept-promise gap (kept 0/10, together-no-go) is the next blank.

## Closeout note

- (to be filled: rebase, merge, release, lock, rotation verification)
