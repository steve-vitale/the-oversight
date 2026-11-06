# Journey — Landing r110 (2026-11-06, Lane A leg 0)

Run id `laneA-20261106T1245Z`, scheduled Fri 2026-11-06 06:45 CST, started ~13:39Z.
Leg 0 LANDING. Branch `journey-landing`, base `079b7ede2` (master at run start).
Rotation 0→1 written at run start, verified by read-back (see discrepancy note).

## Prereg (committed 67f19496a, before any seed ran)

Question: thread-gate watch (Q1 — r107 seed 1010 d12, n=1) and flesh-channel
post-fix (Q2 — does the r109 poison-retest fix hold in the wild?). Seeds
1033–1042 (fresh band — full-scope grep over ALL dated preregs plus the
forbidden-band files; only incidental numbers hit). DAYS=28. Policies:
competent-player driver, r109-verbatim except seeds/OUTDIR. Carried bindings:
M1 ALIVE-D14, M2 SYSTEM CONTACT, M3 FIGHT-LOG, M5 PEOPLE, Q3 M-PR1/M-PR2
REVISED per r109's metric review (per-panel M-PR1 bar retired; M-PR2 excludes
away-guard refusals), Q4 M7 goaround, Q5 M6 doorstep, Q6 water. Bars: M-TG
≥2 picked-but-stage-1 sharing a non-null thread = real mechanism; M-FLESH
poison re-test count 0 = fix holds, ≥3 stuck seeds sharing one cause = named
defect; M-PR1-per-seed ≤1 on ≥8/10; M-PR2-revised ≥80%; M7 ≥80%; M6 clauses
hold. Metric binding applies: a miss is NO-GO, never re-scored mid-run.

## Infrastructure notes (loud first)

- **Registration took ~83s (single attempt).** Worktree
  `~/workspace/worktrees/journey-landing`. Heartbeat at registration + 10-min
  loop (PID 40690).
- **Pre-flight clean.** Main tree clean, disk 22%, `git pull` already up to
  date. Reaper removed nothing; LOUD lines only about other owners' dirty
  trees (never touched). Active trees 3/16 at pre-flight (plus this run's).
- **Safe-commit index clobber struck** on the prereg commit (67f19496a, known
  class): committed file showed staged-as-deleted + untracked after commit.
  Repaired per the recorded recipe (`git update-index --add --cacheinfo` with
  HEAD blob); verified `git status` clean (0 lines), `git diff HEAD` empty.
- **Rotation-write discrepancy, 7th sighting.** r109's note verified the file
  read `1` at its closeout, but the file read `0` again at this run's start —
  and its mtime was 13:36:32Z, ~3 min BEFORE this run started (13:39:08Z).
  Something rewrote it to `0` shortly before this run; no lock existed and no
  other Lane A run note exists between r109's closeout and this start. The
  0→1 write is verified at run start above and will be re-verified at
  closeout. The discrepancy remains unexplained.
- **MEMORY.md changed externally mid-run** (system file-watcher notice): the
  sim-intelligence direction now records the first wave-5 kill ever (panel
  2026-11-06, 72 villages: day 78, lesser seat only; full seat 1, lesser 25,
  wave-5 reached 5, wave-5 kills 4; no village has banked two living wave-4
  killers and sat). Not this run's work — noted as context for the winnable
  verdict: the wall has its first crack, at the far end of the chain, while
  this leg's funnel (below) is unchanged.
- **No lock existed at start.** Lock created 13:39Z, run_id
  `2026-11-06T13:39:08Z`. Delete at closeout after read-back of run_id.

## Panel

Pilot: 3 seeds (1033–1035), DAYS=28, exit 0 in ~11s. All 3 alive, systemDay
8, ask_favor sittings present, flesh arrivals populate. Pilot gates passed →
expanded to full panel. Full panel: 10 seeds 1033–1042, DAYS=28, exit 0 in
~27s. 10 census files in goal hidden_files `evidence/2026-11-06/landing-r110/`.
Logs: `landing-r110-pilot.log`, `landing-r110-panel.log` (same dir).
Analysis: `landing-r110-panel-analysis.txt`, `landing-r110-commit-offer.txt`,
`landing-r110-fights.txt` (same dir).

## Panel verdicts

- **Q1 M-TG (thread-gate): CLOSED AS A NON-MECHANISM — the question is
  answered, n=3 pooled.** Engagement `[alive:want:ask_favor]` offered in 5
  transcripts, picked in 2 (1038 d10 Leo, 1041 d11 Stephen); both picked cases
  left the want at stage 1. Both share thread='want' — an ALLOWED thread
  (convo-dialogue.js:293/404/423 gate only when the thread is NOT
  null/'want'/'small') — and both NPCs withdrew the want in the opener
  ("Never mind the food I needed — we got it handled"). The r107 case
  (1010 d12 Nino) was re-read for this run: identical shape — withdrawn in
  the opener, engagement picked, "No, really — it's handled", thread='want'.
  All three pooled cases are the same withdrawn-want deflection (the want
  def's deflect beat, conversation.js:6771), not a thread block. The
  thread-gate hypothesis is NOT supported: no case has a non-null/non-'want'
  thread, and the gate code paths (dlg:more etc.) are a different pick from
  the engagement option. No code change — the behavior is correct and reads
  human. Retire M-TG as a watch (see Metric review).
- **Q2 M-FLESH (post-fix): FIX HOLDS — 0 poison re-tests.** arrivalSeeds=6/10,
  testSeeds=10, exitSeeds=6, stuckSeeds=0, openSeeds=6. CHANNEL OPENS.
  Poison verdicts: 2 (1035 belltoad d9 Manish; 1042 "The Loud Beast" d? Sophia).
  Each poison mid was tested exactly once — zero re-tests of known-poison
  flesh on the panel (no duplicate mid in any seed's fleshArc transitions;
  7 experiments on 1042 = 6 safe reveals + 1 poison). The r109 fix
  (`monsterFoodPoisoned` guard) holds in the wild. The 4 NO-ARRIVAL seeds
  (1037/1038/1039/1040) are a LABEL artifact, not stuck channel: each tested
  2–3 mids and revealed them all safe — the flesh was tested from pack/counter
  before it ever sat unknown in the pantry, so the pantry-unknown series
  (peak=0) never saw it. The channel's test stage works on all 10 seeds;
  only the pantry-unknown stage is bypassed on 4. Telemetry gap noted (see
  Blank filled): 1042's poison test has an experiment line + poisonVerdicts=1
  but NO fleshArc transition, so the mid is unrecorded in the census — the
  analyzer's transition-based poison check cannot name it. Driver-instrument
  gap, not a game defect; no fix this run.
- **Q3 engagement lines (REVISED metrics — first run under the new bars):**
  sittings=30, offered(commit)=22, picked=22, promised=14, statedAfterPick=8,
  neverOffered(commit)=8.
  - **M-PR2 revised: 14/(22−8) = 100% ≥ 80% — LINE HOLDS.** All 8 stated
    refusals are the R72 away-guard line ("Wait — I'm out on the road…").
    Away-guard share: 8/22 = 36% of picks.
  - **M-PR1 per-seed: ≤1 on 8/10 seeds — PASS exactly at bar** (1035:2,
    1040:2). Pooled never-offered rate 8/30 = 26.7% (reported for the record;
    per-panel bar retired per r109's review).
  - Transcript adjudication of all 8 never-offered-commit sittings (read in
    full, below): 3 withdrawn wants, 3 probe-leaves-early, 1 no-want-voiced,
    1 stated favor that routes through outing/invite — zero live cases of
    the game hiding engagement or commit.
- **Q4 M7 goaround: GOAROUND-HOLDS (3/3).** R85 RESCUE kcal skips=3,
  complete=3 (1037, 1038, 1040, one each). R85 water: 0 cases.
- **Q5 M6 doorstep: DOORSTEP-GO.** Checks=280, triggered=3, ate=3, drank=0,
  doorRefused=0, noGainEat=0. (r109: 282/4/4.)
- **Q6 water: UNTESTED (22nd run).** Wild outing iterations=0, hydUnder25=0,
  minHyd=null, waterSkips=0. R84/R85 water both UNTESTED, 0 skips.
- **M1 ALIVE-D14: 10/10 PASS.** No village lost by d14 (none lost at all;
  lowest popEnd 9).
- **M2 SYSTEM CONTACT: 10/10 PASS.** systemDay 8 on nine seeds, 9 on 1039.
- **M3 FIGHT-LOG: PASS.** 32 hunt fights, 32 complete, 3 fatal, 0 with
  unknown/mixed trigger. All 3 fatals are the SCHOLAR dying solo in the wild
  (allies 0), each with the beast nearly dead (Spool w3 at 2 HP, Highbeam Deer
  w1 at 1 HP, Spool w3 at 27 HP); triggers: pending-face (feast fight),
  monster-approach, monster-approach.
- **M5 PEOPLE: PASS.** Wind-down more picks 7, empty 0; WD probe sittings 10,
  surfaced 9, menuMore 7, pageTurns 53, phase2Opened 8, phase2Yielded 6,
  GATE-A GO, GATE-B GO; betrayal 10 offers, 0 held; party invites offered 10,
  picks 10, spoken 10, dry 0, accepted 6 (PARTY-GO); R67 case labeling 11/11
  MATCH (LABELING-GO). Two full transcripts read for sense (in fact all 8
  never-offered sittings, below).
- **M-R70 (closed r107, consistency check): 0 genuine defects.** waitDiag
  live={waiting:6, has-run:100, dayPart:1, kept:8}; ledger promise-favorId=412;
  waitDiagMissing=0; sidestepAttempts=14, sidestepOk=11. The 4 never-waited
  seeds (1035, 1040, 1041, 1042) are explained by their action reasons
  ("Move next to your partner" 70× on 1042; "Your partner is inside the Haven
  hall" 59×) — the driver never gets adjacent, a carried driver-side friction
  (r106), not a game defect. R70 OUTING: waitSeeds 6/10, departSeeds 7/10,
  keptSeeds 2/10, keptTotal 3, OUTING-GO.
- **R73 WINDOW:** promised=8, askedOnly=40, outOfWindow=1, all 8 NARROW,
  keptInsideNarrow=3. NARROW-PATTERN continues (design input). Broken=5:
  4× DEPARTED-NO-DELIVER (outing went out, delivered 0 — the forage presses
  found nothing) + 1× DELIVERED-NOT-KEPT (1040 Aria: partner hauled 260,
  player 0, run ended early — see Blank filled).
- **R66 horizon pantry: 9/10 HUNGRY** (r109: 4/10, r108: 7/10, r107: 9/10) but
  **NOT-HUNGRY by the revised gate** — starvationDeaths=0, slideSeeds=1
  (1039 only, min 0, snapsBelow1000 8/20), bandSeeds=4, noSlideSeeds=5. FED
  seeds: 1035 only (2,808/person). Deepest hunger: 1033 (739/person).
  The hungry share swung back up after r109's best-fed panel — seed mixture,
  not a change (no food-affecting change in this run).
- **R62 FLESH: CHANNEL OPENS.** arrivalSeeds=6/10, testSeeds=10, exitSeeds=6,
  stuckSeeds=0, openSeeds=6. See Q2.
- **Mantle:** two passes, latencies [2, 0]. The r107 2-day latency owed item
  is REPRODUCED: 1038 Luigi d11 → Ava d13, latency 2 (analyzer flags LIVE
  2-4d LATENCY). 1039 Michelle d27 → Irving d27, latency 0. Third scholar
  death (1035 Jasper d28, the Spool feast fight) is honestly
  UNRESOLVED-AT-HORIZON (died on the horizon day; the pass falls outside the
  run). Note: the analyzer's summary line reads scholarDeaths=2 — it counts
  only mantle-passing deaths; the panel actually had 3 scholar deaths. The
  2-day latency mechanism is still unexplained (succession narration does not
  surface in the day transcripts; Ava was away from Haven d11–12, which may
  gate the pass — hypothesis only, not established).
- **Win-plan (R104, carried):** planSeeds d14 on 4/10 seeds (1034, 1035,
  1036, 1041), d28 on 6/10; holders 0→24 across the panel; partyWaits 4→125;
  partyFights 0 (not tracked this panel — the instrument reports waits only);
  gearHolds=0, bondTends=0, all later arms 0. **M-A2 re-confirmed
  STRUCTURALLY-UNREACHABLE** (retired metric, consistency check only):
  prims=0, no muster, no wave-4 kills, no table plans on all d28 censuses.
  Seeds 1037/1038/1039/1040 have ZERO win-plan at d28 — the same four seeds
  as the flesh NO-ARRIVAL set (flesh tested but never pantry-unknown, and no
  plan seeded). Correlation noted, no mechanism claimed.
- **Contests:** fired=16, ended=14, openAtHorizon=2, orphanEnds=0. LEDGER GO.
- **Starvation:** 0 deaths, GO. Grief: 0/17 miss, holds.
- **Kill-mean trend REVERSES:** per-seed monster-kill mean 20.6 (range 16–29,
  total 206) after r107 20.5 → r108 24.4 → r109 28.5. The three-panel climb
  was seed mixture, not a trend — this panel is back at the r107 level with
  overlapping ranges. Reported, not chased.

## Village assessment (plain words)

Ten villages, ten first months, all ten survive the month — though one
(1042) loses nobody at all and two (1035, 1038) lose their scholar out in
the wild. Everyone meets the System by day 8 or 9. The villages hunt hard —
16 to 29 monster kills each, 206 in total — and feed themselves worse than
the last panel: only one of ten ends the month fed, and one (1039) watches
its pantry hit zero mid-month, though nobody starves (zero starvation deaths
for the third panel running). The hungry nine are hungry in the old way:
1033 ends at 739 kcal per person after a month that started at 47,000. People
ask each other for help and mostly get it: 22 of 30 sittings offered the
commit, 14 of 22 picks became real promises, and the eight refusals were all
honest ("I'm out on the road — find me when I'm back"). Parties form: six of
ten invitations accepted. Monster meat moves: all ten villages taste it, six
get it out of the pantry — and nobody re-tastes a poison twice. The villages
are alive, social, and mostly hungry — the hungry tail is back after one
well-fed panel, which says the pantry is seed luck as much as anything.

Pops end 11, 10, 9, 10, 10, 9, 11, 11, 12, 12 (seeds 1033–1042). Spawns:
Leah, Divya, Jasper, Harper, Enrique, Luigi, Michelle, Aisling, Hugo, Tamika.
Monster kills per seed: 21, 17, 17, 22, 23, 16, 16, 23, 22, 29.
Self-sufficiency 0.643–0.978. Villager deaths 17 total: 3 scholars in the wild
(Jasper d28, Luigi d11, Michelle d27), 4 field wounds that wouldn't close,
1 sickness, the rest monsters.
**Seed 1035 loses its scholar on the last day:** Jasper (the spawn) is killed
by a wave-3 Spool in a feast-triggered fight out on the road — six strikes
landed (306 damage), the beast left at 2 HP, then the Spool's replay killed
him (81 HP → −4). The mantle pass falls outside the horizon; the village
stands at 9.
**Seed 1038 scholar dies d11:** Luigi is killed by the Highbeam Deer, a wave-1
beast, with the deer left at 1 HP — one hit from a kill. The mantle passes to
Ava d13 (latency 2, the reproduced owed item). The village stands at 9.
**Seed 1039 scholar dies d27:** Michelle is killed by a wave-3 Spool out on
the road (43 HP → −2, beast at 27 HP). The mantle passes to Irving the same
day. The village stands at 11, and its pantry slid to zero mid-month.
**Seed 1042 loses nobody:** 12 pop, 0 deaths, 29 monster kills (the panel
high), hungry at 1,565/person — healthy and planless at d14, four win-plan
holders by d28.

## People check (transcripts read in full — all 8 never-offered sittings)

- **1035 d10 Devon (unestablished): Real, crowded out by the case.** Devon
  opens on the ambush of Chloe ("Have you — sorry. I keep thinking about
  them. There's still the matter of the ambush of Chloe. Nobody's settled
  it.") and the menu carries four betrayal-case options. The driver changes
  subject once, then leaves after 1 turn. The want never got established —
  a probe that leaves early, not the game hiding the option. Same shape as
  r108/r109's unestablished class. The beast-naming vote after (Big Beast /
  Big-Eyes / Old Loud / Big Ugly) reads like a real argument.
- **1035 d12 Aria (unestablished): Real, same case.** Aria opens "Hey — come
  here. You should hear this" with an edge ("something curdled"), again the
  ambush of Chloe. Driver changes subject once, leaves after 1 turn. The
  case dominates this village's conversations — the betrayal system working,
  not a defect. Both 1035 sittings are the same seed's case-crowding, which
  is why 1035 carries 2 never-offered sittings.
- **1038 d10 Leo (unresolved): Real — the thread-gate case, answered.** Leo
  opens by withdrawing the want himself ("Never mind the food I needed — we
  got it handled"). The driver spends 14 turns probing (pages topics, takes
  the party invite — refused: "Not right now. I've got my own things to
  handle"), and at turn 13 finally picks the engagement option. Leo
  deflects: "No, really — it's handled. Thanks for asking, though." The want
  stays stage 1 because it was withdrawn in the opener, not because a thread
  blocked it (thread='want' at pick time). Polish note: the
  [dlg:subject] handler cycles the same two lines ("Forget I said anything.
  What did you want?" / "Sorry — I shouldn't load that on you. What's up?")
  twice each across the sitting — in a 14-turn probe it reads repetitive.
- **1039 d11 Fatima (unresolved): Real, gossip wins.** Fatima opens by
  withdrawing the want; the engagement option IS offered at turn 2, but the
  driver picks gossip and drills it depth 1→6 ("Something's off with Sigrun.
  I mentioned it to the others and they went quiet" / "Martina tracked a
  snare thief by scent alone. Came back with the trap and the thief's boot.")
  — good texture, real village news — then leaves. The want never got
  established because the driver preferred gossip. Probe behavior, not the
  game hiding the option.
- **1040 d5 Xuan (unresolved): Real, paged past.** Xuan opens by withdrawing
  the want; engagement IS offered at turn 2; the driver picks [menu:more]
  twice (teach/learn/lately pages, each returning "(no line)") and leaves
  after 3 turns. The want never got established because the driver paged
  past it.
- **1040 d9 Desmond (unestablished): Real — no want was ever voiced.**
  Desmond opens with a joke ("New rule: whoever complains about the food
  cooks tomorrow"), not a need. Engagement IS offered at turn 2; the driver
  pages past it, takes the party invite instead (accepted: "...Fine. This
  had better be worth it."), gossips, leaves. The party_name option surfaces
  ("We should name this. Us.") and the beast-naming vote is lively
  ("Captain Bright-Eyes" / "The Glow Stag" / "The Bright Bastard" /
  "Sir Blinds-A-Lot"). The want stayed stage 0 because Desmond never asked
  for anything.
- **1041 d11 Stephen (unresolved): Real — the second thread-gate case.**
  Stephen opens by withdrawing the want; the driver picks [goon], then
  [dlg:subject], then engagement at turn 3 — Stephen deflects ("No, really —
  it's handled. Thanks for asking, though."), want stays stage 1,
  thread='want'. Identical shape to Leo and to r107's Nino. The three cases
  together close the thread-gate question (see Q1).
- **1042 d13 Victor (stated): Real — the most human sitting on the panel.**
  Victor opens with a real concern, voice low: "Can we talk? The stores.
  Have you looked at the stores? We're running thin." The driver says yes,
  asks him to go on — Victor gives a concrete plan: "I did the count twice.
  The count doesn't change. I know the meadow edge, west of the creek —
  come with me and we'll fill packs before dark." The want reaches stage 2
  (stated). A second "tell me more" hits the honest dry-thread line ("I wish
  there was more to tell. That's it."). The driver changes subject and leaves
  after 4 turns; the commit option never surfaced because this favor is a
  joint-forage ask — it commits through the outing/invite system, and the
  [dlg:invite] option WAS offered at turn 2 and not taken. Victor leaves the
  door open: "...Think about it? I'll be around." Not a defect — a villager
  with a plan, a player who heard him out and walked away.

## Blank filled / documented

- **THREAD-GATE CLOSED (adjudication, no code change).** The r107 open
  question is answered: picked-but-stage-1 is the withdrawn-want deflection,
  not a thread gate (n=3 pooled, all thread='want', all withdrawn in the
  opener). The behavior is correct; the watch retires.
- **ARIA DELIVERED-NOT-KEPT — EXPLAINED (adjudication, no code change).**
  Seed 1040: Aria's favor broke despite deliveredKcal=260. The
  favor_forage_return telemetry says playerKcal=0, partnerKcal=260,
  kept=false, endedEarly=true. The 260 was entirely Aria's haul; the player
  carried 0 and ended the outing early. favor-forage.js:300-303: an early
  end renounces the promise without running checkPromises, and the return
  line says so ("The promise was missed; unloading does not earn kept-promise
  credit."). The game correctly refuses kept credit for a trip the player
  didn't work and cut short. Not a defect.
- **FLESH NO-ARRIVAL LABEL — CLARIFIED (instrument reading, no code change).**
  The 4 NO-ARRIVAL seeds tested 2–3 mids each and revealed them all safe;
  "NO-ARRIVAL" means only that no flesh sat unknown in the pantry (peak=0).
  The channel's test stage works on all 10 seeds. A future analyzer could
  split NO-ARRIVAL into tested-safe (channel works) vs never-tested (channel
  never reached) — the current label conflates them.
- **1042 POISON TEST MISSING FLESHARC TRANSITION (telemetry gap, documented).**
  Sophia's poison test ("The Loud Beast") has an experiment line and
  poisonVerdicts=1 but no fleshArc transition, so its mid is unrecorded in
  the census. The fix's behavioral proof (exactly one poison experiment, no
  duplicate mids) still holds, but the analyzer cannot name the mid from
  transitions. Driver-instrument gap; a future run could record the mid on
  the poison transition. Not a game defect, no fix this run.
- **Mantle 2-day latency (r107 owed item) REPRODUCED, still unexplained.**
  1038 Luigi d11 → Ava d13. Succession narration does not surface in the day
  transcripts, and Ava was away from Haven d11–12 (hypothesis: the pass
  waits on the successor being present — unestablished). Watch item, not a
  fix this run: the latency is inside the analyzer's [0,4] window and the
  village is never left scholar-less past it.
- **No other blank filled this run.** Water still untested (22 runs); the
  R70 never-waited friction recurs on 4/10 seeds (driver-side, carried);
  scholar-eats-first and the M-A2 design question stay Steve's calls.

## Notable events

- 3 scholar deaths in one panel (r109: 1) — all solo in the wild, all with
  the beast at 1–27 HP. The scholar fights alone and loses by a hair twice.
  Not a defect claim (the wild is meant to kill), but the rate is the
  panel's sharpest number: 3/10 scholars dead in the first month.
- 1039's pantry slid to zero mid-month (min 0, 8 snaps below 1,000) with no
  starvation deaths — the village bent without breaking.
- 1042 is the quiet village: 12 pop, 0 deaths, 29 kills (panel high), FED
  by no measure (1,565/person) — healthy, violent, and planless at d14.
- Party invitations accepted 6/10 (r109: 2/8) — the rate jumps around by
  seed; the mechanism (offered→spoken→accepted) works.
- Flesh channel: 6/10 seeds get monster meat out of the pantry (r109: 7/10,
  r108: 7/10, r107: 7/10) — the rate is flat; the fix's effect is the
  poison-stuck share (0 this panel, 1 stuck seed each on r108/r109), not
  the headline rate.
- 1037/1038/1039/1040 share two absences: no flesh in the pantry as unknown,
  and no win-plan at d28. Correlation noted; no mechanism claimed.

## Reachable / fun / winnable

- **Reachable: yes.** System contact 10/10, contests 16 fired, flesh
  channel opens 6/10 (tests 10/10), outings complete, win-plans seed 4/10
  by d14.
- **Fun: yes.** Transcripts read like people; Victor's pantry count, Fatima's
  snare-thief gossip, Desmond's food rule, Leo's fourteen turns of "it's
  handled." The villages are mostly hungry this panel, which reads as
  pressure, not ease — 1039's pantry hitting zero and recovering is the
  month's story.
- **Winnable: not yet — unchanged at this leg.** Win-plan later arms proved
  structurally unreachable before d28 (r106 M-A2, re-confirmed); the early
  funnel moves on party/hunt arms alone. No wave-4 kills, no muster, no
  table plans on any d28 census. (Context from outside this run: the
  sim-intelligence panel recorded the first wave-5 kill ever on 2026-11-06 —
  the far end of the chain has its first crack, while this leg's funnel is
  flat.)

## Metric review

- **M-TG worked — and closes the question.** The metric caught 2 cases on
  this panel, and the transcript reads + the r107 re-read + the code read
  together name the cause (withdrawn-want deflection, thread='want') and
  exclude the hypothesized mechanism (no non-allowed thread anywhere in
  n=3). Proposal: RETIRE M-TG as a watch. Future runs need not count
  engagement picks; if a picked-but-stage-1 case ever appears with a
  non-'want' thread, that single case reopens it.
- **M-PR1 per-panel retirement + M-PR2 revision BOTH VALIDATED.** The
  per-seed bar (≤1 on ≥8/10) passed exactly at bar and the adjudication
  found zero hidden cases; the revised M-PR2 (100% on non-away picks) is
  clean where the old bar (14/22 = 64%) would have misfired on the
  away-guard. Both revisions adopted in this run's prereg now stand as the
  lines for the next run. The away-guard share (36% of picks) is the number
  to watch: if it climbs, the commit path's denominator shrinks even as the
  path itself works.
- **M-FLESH worked — the cause bar did its job again.** 0 stuck seeds is a
  clean read, and the poison count (2 first-time verdicts, 0 re-tests) is
  the fix's proof. The NO-ARRIVAL label needs the split proposed above
  (tested-safe vs never-tested) before it can carry a verdict.
- **M7 worked — 3/3 is a clean GOAROUND-HOLDS.** Keep as a watch; the
  ladder needs cases to judge, and this panel supplied them.
- **M-A2 retired, re-confirmed only.** The structural-unreachability
  finding stands; the metric stays retired.
- **Analyzer gap to fix in the instrument (not the game):** the panel
  summary's scholarDeaths counts only mantle-passing deaths (2), while the
  panel had 3 scholar deaths (the d28 one is honestly unresolved-at-horizon
  and flagged as such in its own line). A future run should have the
  summary count all scholar deaths with the unresolved-at-horizon ones
  broken out, so the headline number never undercounts a horizon-day death.

## Regression + telemetry

- Poison-retest proof test: 4/4 PASS (this run, on master and on the rebased
  branch). Meat-channel e2e: 8/8 PASS (same). The r109 fix holds.
- No src/js change in this run, so no check.js --quick: the relevant suites
  are the meat-channel proofs (green, above) and the landing panel +
  analyzers (all exit 0). The ship loop runs the full check before pushing.
- **Telemetry deviation check:** ran `node scripts/telemetry-check.js
  --baseline .../telemetry-baselines/landing-split.json --current
  '<landing-r110 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
  lines, BOTH EXPLAINED as aggregation artifacts (same class as
  r94/r95/r96/r97/r98/r99/r104/r105/r106/r107/r108/r109), baseline NOT rolled:
  (1) systemDay baseline 33 → current sum 81 over 10 files (per-seed 8–9,
  mean 8.1; baseline is a 4-seed-run sum); (2) monsterKills baseline pooled
  mean 24 → current sum 206 over 10 files (per-seed mean 20.6, range 16–29;
  r109 was 28.5, r108 24.4, r107 20.5). Watch, not a verdict: the per-seed
  kill mean reversed this panel (28.5 → 20.6), ending the three-panel climb
  as seed mixture, not a trend. No behavior change is indicated.

## Next run (no r111 driver prepared)

Rotation advances to 1 (establishment) — the next three Lane A runs are other
legs, so no landing r111 driver is prepared here. The next landing run
prepares its own driver from the r110 driver and re-verifies its seed band
fresh across all dated preregs (next fresh band after 1033–1042 starts at
1043; contaminated bands stay excluded: 897–906, 1301–1304, 917–926,
1001–1010, 1101–1110, 1201–1210, 2001–2010, 3001–3010). Carried to the next
landing run: M-TG retired; M-PR1 per-seed + adjudication and M-PR2 revised
are the standing lines; the NO-ARRIVAL label split and the summary
scholarDeaths count are instrument fixes to make; the mantle 2-day latency
stays an owed item; the R70 never-waited friction stays carried.

## Closeout note

- **Rebase:** clean, both picks applied, no sequencer stop. Rebased onto
  master `c6530f212` (master had advanced 2 commits past 079b7ede2 with the
  Loop B 1130Z round and the sim-proposefirst-b pilot; local master is ahead
  of origin/master, 0 behind — no stale-base risk). New SHAs: prereg
  f100339be, run note ba5b2a647, closeout (this commit).
- **Proof re-run on the rebased branch (all PASS):** poison-retest 4/4,
  meat-channel e2e 8/8.
- **Write flap on the run-note write:** the first write truncated at 7,695
  bytes, mid-sentence in the M3 bullet (the committed ba5b2a647 carried the
  truncated file). Probe (`git update-ref refs/heads/probe HEAD`) OK on
  retry; the prereg file verified complete (10,117 bytes, ends correctly).
  Recovery per the write-flap skill: regenerated the full note to a sibling
  temp file, verified size + completeness (ends with this closeout section),
  replaced the original, and committed it here. No content was hand-edited
  back into shape — the full text is the deterministic regeneration.
- **No check.js --quick this run:** zero src/js changes; the relevant suites
  are the meat-channel proofs (re-run above, green) and the landing panel +
  analyzers (exit 0). The ship loop runs the full check before pushing.
- **Telemetry:** 2 LOUD lines, both explained as aggregation artifacts,
  baseline NOT rolled.
- **Index clobber struck on both safe-commits** (prereg 67f19496a, run note
  2a641c173): committed files showed staged-as-deleted + untracked after
  commit. Repaired each time via HEAD-blob `update-index --add --cacheinfo`;
  verified status clean + diff HEAD empty.
- **Rotation re-verified at closeout: reads `1`** (the 0→1 write stuck this
  run). The 7th-sighting discrepancy (file read 0 with a 13:36:32Z mtime
  minutes before this run) remains unexplained.
- Lock (`2026-11-06T13:39:08Z`, created 13:39Z) and heartbeat loop are
  removed at closeout after the merge, once run_id is read back; see
  `~/memory/2026-11-06.md` for the closeout record.
