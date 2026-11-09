# journey-landing r120 — RUN NOTE (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** 2026-11-09T04:16:00Z (scheduled Sun 2026-11-08 21:45 CST).
**Base:** master@55b5e5aae (pre-OVE code — see divergence note below). Driver:
scripts/journey-landing-r120-20261109.js (r119 driver + Q1 resume-in-probe,
Q2 cell-greenness, scholar-turn verb wraps; zero src/js). Seeds 1132–1141,
DAYS=28. Panel ran ~05:36–05:42 UTC, 10/10 seeds, all villages alive to d28.
**Rotation:** 0→1 (landing → establishment next).

## Verdicts (one line each)
- **Q1 (PRIMARY) resume-in-probe: PASS.** OWEN-SHAPE=0; resume-taken=8,
  probe-takes=8 (8 offered sittings, all 8 taken, all inside TOPIC_SIT).
- **Q2 cell-greenness: PASS.** Evening press-fails 7 (≤9; r119 baseline 27);
  kept=1 from a far node; skips=2, both green3x3=0.
- **Watch (scholar turns): READ.** The scholar's non-strike turns are moves
  (31 moves, 0 waits, 0 barrier exits, 0 abilities across 9 fights) — the
  policy walks instead of striking.
- **Q3 practice: GO** (101 moved cells d1→d28, 10/10 seeds; hunt reps 0 again).
- **Q4: M-PR1 PASS 9/10 (≥3-turn rule), M-PR2 100%** (13 promised / 13
  non-away picks).
- **Q5 M7: GOAROUND-HOLDS** (R84 kcal 5/6 = 83%; R85 RESCUE-GO 6/6) with
  one R84 non-arrival proven (1139 d11, rescued by the ladder).
- **Q6 M6: UNTESTED** (0 triggers, 279 checks). **Q7 water: RETIRED** (see below).
- **M1 10/10, M2 10/10, M3 clean** (0 unknown/mixed triggers), invariant 0
  violations, Miriam 0 settled lines. **R66 NOT-HUNGRY** (5/10 HUNGRY,
  0 starvation deaths). **R73 NARROW-PATTERN** (7 promised, 7 NARROW,
  1 kept inside). **Mantle: first 2-day latency observed** (1140).

## Q1 (PRIMARY) — WANT-THREAD RESUME INSIDE THE TOPIC-PROBE BLOCK: PASS
- The fix fired on the panel: 8 sittings offered `alive:thread:want` twice
  each (1132-d6, 1133-d6, 1136-d5, 1136-d7, 1137-d11, 1138-d5, 1139-d6,
  1141-d5), and the driver took it in all 8 — every take inside TOPIC_SIT
  (probeTakes == resumeTakes == 8; seeds 1134/1135/1140 never saw the offer).
  OWEN-SHAPE=0: no sitting with ≥2 offers, 0 takes, ≥12 turns. The r119
  shape (Antônio 1124 d10: 4 offers, 0 takes, 21 turns) is gone.
- What the resume DOES: 7 of 8 takes advance the want to stage 3 on the
  reply. The replies are real, not filler: two concrete asks ("The stores
  won't stretch past tomorrow... come with me and we'll fill packs before
  dark" — 1137-d11, a place and a plan; "The fever's not breaking and I'm
  barely keeping food down. I need help — real help, not just water" —
  1141-d5, a specific need), four curious reveals ("Huh. I wouldn't have
  guessed that about you." — first memory, teaching, beliefs, what day it
  is), one brush-off ("Hm. Never mind — go on." — 1136-d7, stage 3 anyway).
- The 8th take (1132-d6 Jose) is the sensible withdrawal, not a stall: Jose
  opens "Never mind the food I needed — we got it handled. Thanks anyway.",
  the resume ("We never finished — that foraging help") gets "No, really,
  it's fine. Forget I even asked." — the need was already met, so there is
  nothing to resume. The conversation then finds real content (monsters as
  "wildlife with better PR", two map-compares, "Protection isn't about
  fighting. It's about making fighting unnecessary.", and the ending "I count
  heads at night. Every night. You get used to the arithmetic of care."),
  and the want's final stage is 3. The prereg's game-side clause (resume
  taken, want stalls at stage 1 for the rest of the sitting) does NOT fire.
- **Amnesia watch — RESOLVED, not amnesia.** The "Huh. I wouldn't have
  guessed that about you." line fires 5× on this panel; 4 of them ARE the
  thread-resume reply (the villager reacting to a want being brought back
  up — the thread exists because of a prior exchange, so the surprise is
  about the reveal, not a forgotten person). The 5th (1134-d11) follows a
  [dlg:more] depth beat (thread=request 1->2) with stage 0 — a generic
  surprise-reaction line firing after the player merely listened. Mild:
  the line implies the player revealed something surprising, and nothing
  surprising was said. One occurrence, reported, not a verdict.

## Q2 — EVENING-LEG NODE PICKER READS CELL GREENNESS: PASS
- Evening press-fails **7** (r119: 27) — a 74% cut, under the ≤9 bar.
  Kept=1 (Emma, seed 1139 — see below). Skips=2, both green3x3=0.
- The skips are the mechanism working exactly as designed: seed 1139 d10,
  nodes (4,0) d4 stock 1 green 36 and (6,1) d3 stock 1 green 35 — tiles
  that look green overall (36/35 green cells) but hold ZERO green cells in
  the 3×3 patch around the player. The old stock-only picker would have
  pressed both and burned two "worked out" lines; the driver skipped both
  and the analyzer's evening-blocked list carries them as `bare-patch`.
- The kept favor is the full Q2 story: seed 1139, Emma
  (favor-emma_larsen-14-5). d15, node (8,6) d4, stock 45, green 46,
  green3x3=2 — 260 kcal (2× Blackberry each, 130+130), delivered the same
  day, KEPT. The same node on d10 (Xavier's favor) had stock 1, pressed
  ok for 0 kcal — the patch regrew to stock 45 by d15 and the village knew
  blackberry by then. Green sort + regrowth + knowledge, in that order.
- **The remaining 7 press-fails are NOT bare-patch failures — they are
  second presses.** The evening leg presses twice per node while the haul
  is 0; the first press strips the 3×3 patch (harvests its green cells,
  setting regrow), so the second press re-sweeps a patch the first press
  just emptied and fails with "This patch has nothing left to give right
  now." Seed 1133 d12 (Mara) is the pure case: 6 nodes × (press 1 ok,
  0 kcal; press 2 fail). All 7 panel fails follow this shape (6 on Mara
  d12, 1 on Xavier d10). The green sort + skip cannot touch them — the
  skip checks before press 1, when the patch is still green. This is a
  driver-loop finding for the NEXT run (re-check green3x3 before press 2,
  or stop after a 0-kcal ok press), not a re-score of this one: the metric
  as pre-registered passes on its own terms.
- The chain's binding constraint on this panel is still knowledge, not the
  patch: handsEmpty=7 (together-ok presses yielding 0 edible kcal — the
  plants are unknown), farHaul=1, nearHaul=1, farOk=7, nearOk=2. The far
  leg is exercised (gate f: 5 far ok presses on the pilot alone) and the
  green sort did not kill far attempts — far nodes are green AND far.
- New routing shape to watch: seed 1141's two favors broke on UNREACHED
  far nodes — (0,0) d4 stock 47, (0,1) d4 stock 42, (0,3) d4 stock 41 all
  unreached. The green sort sends the driver to the greenest far tiles,
  and the hop sometimes cannot reach them in the evening's ticks (H-HOP,
  not H-KNOW). One seed, two favors — a watch item, not a verdict.

## Watch — SCHOLAR 0-STRIKES: THE POLICY WALKS
- 20 fights, 3 zero-DMG (no-strikes=1, S=1, B=1 — down from r119's 2 B).
  The one B-shape (1139 d14, 0 strikes, 1 monster turn, 2 rounds, allies
  killed): the scholar's logged verbs are move=2, wait=0, barrier=0,
  ability=0 — the policy spent both of the scholar's turns walking
  (4,4 → 2,5), not striking. The S-shape (1139 d13, 1 strike, 3 monster
  turns, 4 rounds): move=3 (one moved, two failed moves to 6,1), strike=1,
  0 damage.
- Panel verb totals (all fights): wait=0, move=31, barrier=0, ability=0
  across 9 fights with verb data. The wraps fire (31 moves); the scholar
  never waits, never barrier-exits, never uses an ability in a fight on
  this panel. The r119 question — did the policy pass its turns, or could
  the scholar not strike? — reads as: the policy MOVES. Whether walking
  instead of striking is the right call in these fights is a policy
  question for the next run's read, not a verdict here. The no-strikes
  fight (1 of 3) is a separate shape — reported, not adjudicated.
- Fights overall: 20, triggers pending-face=11, contest-arena=3,
  monster-approach=6, **0 UNKNOWN, 0 mixed** (M3 clean). Ally-accompanied
  18/20 (r119: 20/21).

## Q3 (STANDING) — PRACTICE: GO
- movedCells d1→d14=70, d1→d28=**101** (attributed=101, seedsWithMove=10/10),
  skill 0→positive=20, practiceReps=3199. Moves by task: wood 27, stone 27,
  deadfall 11, water 19, cook 14, fish 3; hunt/forage/garden/scout/patrol 0.
- Huntpractice: **H1-ESTABLISHED** — 311 kills, **0 hunt reps**, 0 hunt
  villagers, 0 hunt moves. The hunt-assignment policy question (r117,
  carried) stands: no hunt assignment resolves in the landing window, for
  the fourth panel running. Reps by task d28: wood 1031, stone 926, water
  438, deadfall 399, cook 256, fish 122, garden 27.

## Q4 (CARRIED) — ENGAGEMENT REGRESSION LINES
- **M-PR1: PASS 9/10** (≥3-turn rule). Sittings=24, never-offered=8
  unfiltered (1132: 2, 1134: 2, 1136: 1, 1137: 1, 1138: 1, 1139: 1) → 8/10
  seeds ≤1 unfiltered; three sittings are under 3 turns (1134-d8: 1 menu,
  1137-d13: 2, 1139-d8: 1), leaving 5 counted sittings across 5 seeds →
  9/10 filtered. Backstop (transcripts read): the counted five all open
  with no live favor to commit to — two withdrawn-want openers (1134-d9
  Daniyar, 1138-d8 Dale: "Never mind the food I needed — we got it
  handled"), one space request (1136-d10 Momoko: "I need some space. A
  corner nobody needs me in."), one System-humor opener (1132-d11 Ines),
  and Jose (1132-d6, withdrawn). All five wants reach stage 3. No defect.
- **M-PR2: 100%.** Picked=16, promised=13, statedAfterPick=3 — all three
  stated refusals are the R72 away-guard ("Wait — I'm away from Haven, out
  on the road...") on 1137-d6, 1139-d12, 1141-d7. 13/(16−3) = 13/13 ≥ 80%.
- M-TG stays retired.

## Q5 (CARRIED) — R104-GOAROUND (M7): GOAROUND-HOLDS, with a non-arrival
- R84 kcal: arrivals=6, arrived=5 → **5/6 = 83% ≥ 80%**. R85 kcal:
  RESCUE-GO (skips=6, complete=6). Water legs UNTESTED both (no wild
  water skip — the repro corpus carries the verdict).
- The one non-arrival: **seed 1139 d11** — a kcal skip from (6,1), dist 5,
  still wild at the d12 top (dist 6, loc=wild). R85 shows the same bearer
  walked home in 5 steps to (4,4) and ARRIVED — the rescue ladder worked;
  the R84 arrival window caught it mid-transit. So the non-arrival is a
  timing shape (arrival slower than the check window), not a lost bearer.
  The second 1139 skip (d13, from (1,1)) arrived by the d14 top.
- R84 HAVEN-HYDRATION: maxZeroStreak=1, streakSeeds(≥3)=0/10, no Maeve shape.

## Q6 (CARRIED) — DOORSTEP (M6): UNTESTED
- Triggered=0, ate=0, checks=279 (10 seeds × ~28 steps). No hungry/thirsty
  Haven day triggered the step this panel (r118 was DOORSTEP-GO at 3/3).
  An empty sample is UNTESTED, not GO — r115's rule.

## Q7 — WATER CLAUSE: RETIRED
- Retired in this run, with the stated reason: 0 wild water skips in 29
  runs (r87–r119); the landing window never produces them. The instrument
  belongs on a leg with wild outings. This is an explicit retirement, not a
  silent drop; a future water-skip question re-opens it on the leg that can
  produce one. (This panel: wild water skips 0 again — the 30th run.)

## Carried bindings (r119 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (end pops at d14: 10–12 on all seeds, overAt none).
- **M2 SYSTEM CONTACT: 10/10** (first contact day 8 on 8 seeds, day 9 on
  1136/1137).
- **M5 PEOPLE:** wind-down picks 10, empty 0 (GO); WD probe GATE-A GO,
  GATE-B GO (sittings=10, surfaced=10, menuMore=8, pageTurns=58,
  page3sittings=8, maxPage=4, phase2Opened=9, phase2Yielded=3); betrayal
  offers 2 (Sanne d10, Ines d11 — both spoken in sitting, held=false, NOT
  held-offers); party invites offered=5, picks=5, spoken=5, dry=0,
  accepted=2 (PARTY-GO); full transcripts read for sense (below).
- **M-R70:** OUTING-GO (askSeeds 10/10, waitSeeds 4/10, departSeeds 4/10,
  keptSeeds 1/10, keptTotal=1). **R71:** COMPLETION-GO (togetherOk=9,
  togetherBlocked=6 — all 6 "carry 0 kcal", talkAttempts=6,
  deliverDayOk=1, haulPressSeeds 2/10). **R69 ARMOR-GO** (seedOK=10/10,
  teleLineDisagree=0). **R68 PARTY-GO** (above). **R67 CASE LABELING-GO**
  (sittings=6, match=6).
- **NAV-log: clean.** files=108, noLine=0, genuine=0, navLines=105 ==
  menuMore=105.
- **Zero-DMG invariant: PASS** (20 fights, 0 violations). **Miriam line
  test: PASS** (96 exit lines, 0 settled-asserting).
- **R66 horizon pantry: 5/10 HUNGRY — PATTERN** (collapse recurs — lever
  work candidate). HUNGRY (<2000/person): 1132 (535), 1133 (1093), 1135
  (1950), 1139 (1226), 1141 (1171). FED: 1134 (2349), 1136 (2611), 1137
  (2586), 1138 (5482), 1140 (3546). R66 REVISED GATE: **NOT-HUNGRY**
  (starvationDeaths=0, slideSeeds=0, bandSeeds=7, noSlideSeeds=3). All seeds
  start with the same 47,250 kcal spawn pantry; the d28 spread (6.4k–54.8k)
  is kill-loot variance, as in r119.
- **R73 WINDOW: NARROW-PATTERN** — promised=7, NARROW=7, keptInsideNarrow
  =**1** (r119: 3, r118: 3). The binding rung is still the dawn departure
  (see the 1141 unreached story under Q2).
- **Mantle: first 2-day latency observed.** Seed 1140: scholar Enrique dies
  d14 ("the wild") → Saul takes the mantle d16, **latency=2**. The d15
  series entry is absent (the series runs d14 → d16), so the sweep's
  day-15 behavior cannot be read from this corpus — the mechanism stays
  open, and the latency is reported as observed, not explained. (r119:
  latencies 0 and 1; the 2-day latency was unobserved until now.)
- **R62 flesh: CHANNEL OPENS** (arrivalSeeds=9/10, testSeeds=10, exitSeeds=9,
  stuckSeeds=0, openSeeds=9). 63 tests pooled, **3 poison verdicts** (The
  Loud Beast — Mara, Ugly-Eyes — Fatima, Choir Toad — Quinn; one per seed
  on 1134/1137/1140), **0 re-tests of a known-poison flesh** (each poison
  flesh appears in exactly one experiment; the game records "You will not
  make this mistake twice"), 0 rot. The poison fix holds by an exercised
  verdict this panel (r119 had 0).
- **Contests: fired=17, ended=17, openAtHorizon=0, orphanEnds=0.**
  LEDGER GO. STARVATION GO. GRIEF holds (griefMiss=0 — every death
  registered with a cause class).
- **Win-plan R104: GOAL-LIVE at d14** (d14 planSeeds>0 on 5/10 — down from
  r119's 8/10; d28 on 6/10; holders d14=26 d28=30; partyWaits 41→77;
  partyFights 80→205). **M-A2 STRUCTURALLY-UNREACHABLE re-confirmed**
  (prims>0 on 3 seeds, muster 0, beat4/5 0, wave4kills 0, table-plans 0).
  Two villages (1139, 1141) hold no win-plan at d14 or d28.
- **Eamon fallback:** 0 starvation deaths, so 0 STARVATION lines live.
  A future famine panel exercises it live.

## Census (plain words)
Ten villages, all alive at day 28. Nine villagers died across the panel
(four to wounds that wouldn't close, two to ambush, one to a monster, one
to sickness, one — the scholar Enrique on 1140 — to the wild); 111 of the
120 starting villagers are alive at the horizon. The villages killed 311
monsters between them (most on 1140 with 53, fewest on 1132 with 11) and
fought 20 logged fights, 18 with villagers beside the scholar. The System
made first contact on day 8 or 9 everywhere. Pantries split: five villages
end thin (under 2,000 kcal per person) and five end fed, with the richest
(1138, 54,820 kcal) holding eight times the poorest (1132, 6,425) — the
spread is kill loot, not farming; the villages produce more than they eat
on kill days and slide between them. Three villagers tested monster meat
and found it poison (Loud Beast, Ugly-Eyes, Choir Toad) and none went back
for a second taste. Seventeen contests fired and all seventeen ended.
Nobody starved. One scholar died (Enrique, day 14, in the wild) and Saul
took up the mantle two days later — the first time the handover has taken
two days.

## People check (full transcripts read)
- **The resume works as a person would use it.** Eight takes, eight real
  replies; the want advances to stage 3 in seven immediately and in the
  eighth (Jose) the withdrawal is the honest answer to a need already met.
  The curious resume line ("Huh. I wouldn't have guessed that about you.")
  is the one flat spot: it fires 4× as the generic curious-want reply, and
  it fits a personal reveal (a first memory, a belief) better than a
  mundane one ("what day it is"). The line is the game's voice, not a
  driver artifact — flagged for the voice pass, not a defect.
- **Daniyar (1134-d9) is the best gossip on the panel.** The want is
  withdrawn at the opener ("Never mind the creek water run — we got it
  handled"), and the conversation turns to gossip pursued to depth 7:
  "Boris is back. Walked in like they'd never left." / "Mara asked me
  about you. A lot of questions. Friendly ones. Too friendly." / "People
  are talking about Sam." / "Maya hums at the beans and they climb faster."
  / "The geese chase everyone but Nana. They part for Nana like water." /
  "Mara headed out to forage." Each line is a specific piece of village
  news with a named person behind it. It ends warm: "Go on, then. I'll be
  thinking good thoughts at you." / "This was good."
- **Momoko (1136-d10) asks for space, not a favor.** "Can we talk? I need
  some space. A corner nobody needs me in. Is that okay?" — the want is
  stage 0, unestablished, and no commit is offered because there is nothing
  to promise about. Correct handling of a boundary-setting opener.
- **Loop shape to watch:** the dlg:subject fallback repeats verbatim in long
  sittings — Jose (1132-d6) hears "Forget I said anything. What did you
  want?" three times and "Sorry — I shouldn't load that on you. What's up?"
  twice across 22 turns, while the driver pages through subjects. The
  conversation still lands (the map compares and the head-count ending are
  real), but the repeated deflection is the same filler-loop shape r118
  flagged on the observe fallback. The wind-down's NO-LEAVE substitution
  (leave → compare_maps, 3× in that sitting) is doing real work — the map
  lines are content, not padding.
- **The 1139 kept favor reads as a small story, not a ledger entry.** Emma's
  patch was bare on d10 (stock 1, nothing edible), regrew to stock 45 by
  d15, and yielded blackberries the village knew by then — "Look at that —
  2× Blackberry for me, 2× Blackberry for you" — 260 kcal into a pantry
  that ended the run at 1,226 per person. The chain completing on a far
  patch that the village had already worked once is the foraging loop
  working as designed.

## Metric review (for the NEXT run, never this one)
- **Q2's press-fail metric is spent.** The green sort + skip cut fails 27→7,
  but the remaining fails are second-presses after a stripping first press
  — a shape neither the sort nor the skip can touch. The next run's Q should
  be the double-press itself: re-check green3x3 before press 2 (or stop
  after a 0-kcal ok press), with a fresh pre-registered bar on press-fails.
  The current metric (≤9) stays as written for this run — it passed — but
  re-running it would measure the same ceiling.
- **The 1141 unreached story is the next H-HOP question.** The green sort
  routes the evening leg to the greenest far tiles; on 1141 the hop could
  not reach three of them (stocks 47/42/41) in the evening's ticks. If the
  sort keeps sending the driver to unreachable green, the far leg's binding
  rung moves from patch to routing. A hop-budget instrument (ticks left at
  hop time vs distance) would tell them apart.
- **M7's R84 window vs R85 rescue.** The 1139 d11 non-arrival arrived via
  the rescue ladder — the R84 check caught it mid-transit. If the R84
  window is meant to measure "reached Haven at all", it should read the
  R85 outcome; if it is meant to measure "reached Haven promptly", the
  d11 case is a genuine miss and the 83% is the honest number. The metric
  as written counts the window, and the verdict stands — but the next run
  should state which of the two the bar means.
- **Mantle latency 2 is now observed.** The mechanism (why two days, and
  whether the missing d15 series entry hides a sweep that ran but wasn't
  recorded) needs a series-complete corpus or a sweep-timing instrument.
  Do not re-run the panel to chase it — the next landing panel carries the
  watch.
- **Q1 is closed as a driver question.** The resume is taken everywhere it
  is offered in probe sittings. Any further work here is game-side voice
  (the curious resume line's fit to mundane wants), not driver policy.

## Regression / infrastructure notes
- **Divergence (standing state):** local master is ahead 176 / behind 76 vs
  origin/master (merge-base d229b58f5); the 76 origin-only commits are Codex
  OVE PRs #49/#50. This run measured **pre-OVE code**; OVE-48/50/51 touch
  conversation/want systems the Q1 fix targets, so the resume-in-probe fix
  may need re-porting after the ship loop reconciles origin. No merge/push/
  rebase of origin was attempted; landing is ff-only into local master.
- **EPERM write flap (active episode):** write refusals from ~04:18 UTC;
  reaper failed 3× on registry save; registration attempt 1 failed on
  checkout writes, attempt 2 succeeded 05:09–05:18 UTC. A 0-byte
  REGISTRY.json.tmp was left by a failed reaper write (harmless). Writes
  probed OK from 05:21 UTC onward; every write in this run was preceded by
  a probe and verified by size afterward. No evidence was lost.
- **Telemetry:** run after landing (see closeout). Baseline NOT rolled on
  r119's LOUD lines (n-mismatch/stale-baseline artifacts); r120's check is
  reported in the closeout step, not here.
- **check.js --quick** on the branch tip (closeout re-run, post-restart): **296 passed / 4 failed in 624s** (log `evidence/2026-11-09/journey-landing-r120-gate.log`). All 4 are standing pre-existing failures (`test-mobile-combat-cadence`, `test-occupation-panels`, `test-phone-frame-proof`, `test-establishment-r20-fixes`); the measurement-proof pair is GREEN (this branch changes zero src/js and its base carries the fda320ccf refresh) and capable-bot passed with no timeout. The run's own gate (292/8, pre-restart) had its failure list uncaptured and is superseded by this re-run. **No new attributable failure.**

## Reachable / fun / winnable
- **Reachable:** the joint-foraging chain now completes on a far patch with
  a named villager, a named place, and a named food — the far leg is no
  longer theoretical. The want-thread resume is taken everywhere it is
  offered; a player who returns to an unfinished want is now answered.
- **Fun:** the conversations on this panel are the strongest of the recent
  landings — Daniyar's gossip chain, Jose's head-count ending, Emma's
  blackberry haul. The repeated subject-deflection in long sittings is the
  one dull edge.
- **Winnable:** unchanged from r119 — the win-plan arms stay structurally
  unreachable before day 28 (M-A2), and the winnability chain still turns
  on wave-4 kills, veterans, and the readiness release, none of which this
  leg measures. This run moved the foraging chain and the conversation
  resume, not the win.
