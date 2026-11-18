# Journey leg ESTABLISHMENT — r241 run note (2026-11-18, Lane A)

## Run
Run id `playtest-loop-a-20261118T195358Z` (scheduled Wed 2026-11-18
13:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `6a97f3a07`
(verified = worktree HEAD at registration). Heartbeat loop running
(8-min cadence, detached loop; the first background loop was
SIGTERM'd after ~10 min and replaced by a detached subshell loop,
verified heartbeating). Pre-flight: main tree CLEAN, disk 49%.
Lock created by coordinator 2026-11-18T19:53:58Z. No push (ship
loop owns pushes). Registration took ~3 min (box load — REGISTRY.lock
contention as usual; worktree registered 19:56:08Z).

**Write-flap note:** the first `muse.write` of the prereg truncated
at 57 lines / 3046 bytes (mid-word "WALKHOM"). Per the
local_write_flap_response skill: probed (`git update-ref
refs/heads/probe HEAD` OK), backed the truncated file up to
`~/workspace/journey-establishment-r241-prereg-truncated-backup.md`,
rewrote the prereg in 3 verified chunks (53 + 220 + 375 lines,
21430 bytes, correct tail). No flap in progress at probe time;
the truncation was a single failed write, nothing lost (the full
text was re-supplied from context). The run note below was written
the same way (chunked + verified).

## Pre-registered bars (r241 prereg)
Primary: END BAR re-read with the r240 walkHome fix in (first
homeward refusal + clearableBlocked). Q1 FAVORLESS ASK, fourth
fresh-band re-read. Q1b WANT-RAISE + F5 floor watch (closed on
r240). Q1c CASE-THREAD PRE-EMPTION. Q2 SITTING CLOSES. Q3 recap
paraphrase. Q5 EXILE WARNING HEARD (still unexercised after r240).
Q6 POLICY FORAGING. Carried bars: SPOTTER, LADDER, FASTER-ID, END,
STRANDED / TRAVEL / THREAD watches, PEOPLE CHECK, SCHOLAR-DEATH
standing metric, ROSTER-RECONCILIATION watch.

## Pilot (seed 101601, 42d) — gate passes with one recorded deviation
Ran clean in ~17s: endDay 43, over=false, aliveEnd 9, wave 2,
standing 40, pantryEnd 39881, wedgeSits 78, bumpCalls 43, codexPlants
22. Every instrument clause fired: sittingCloses present (2 held
sittings, both with full transcripts), Q1 trace fields on 78/78
sits, standingEnd non-null (40), scholarDawns 42 records,
teleTypeCounts 49 keys, rosterDepartures present (3), bumpLog 43,
Q5 regex present in the driver source (grep "pull weight" = 3).
**Deviation, recorded not hidden:** 5/78 wedge sits carry no
wantId on any pick — all five are Fatima's nonverbal sits (d9–d25,
openThread "nonverbal", picks `nv:nod`/`nv:smile`/`nv:pointself`,
wantId null by design). Her need (forage_help/u2) was live from
d9 but unhearable until the language arrived; she raises ask_favor
on d29 once she can speak. The pilot-gate clause "wedgeSits carry
pick wantIds" was written when no pilot had nonverbal sits; the
instrument is present (73/78 verbal sits carry wantIds, and the
analyzer scores want-raise from picks — proven by the fork proof).
No driver or fix change forced, so per the prereg's restart clause
the band stands and the pilot seed is scored. **Metric-review item
for the next run:** the pilot-gate wantIds clause should read
"wedgeSits carry pick wantIds on verbal sits; nonverbal sits carry
wantId null by design (openThread nonverbal)".

## Analyzer verdicts (r241 panel, seeds 101601–101605, 42d)
- **END BAR: 7/7 — GO.** Every broken-live forage opportunity
  closed within 2 dawns, all same-day (Raul d6→d6, Morris d22→d22,
  Ivan d11→d11, Owen d15→d15, Joaquín d19→d19, Ingrid d5→d5, Wei
  d16→d16). Seed 101602 had no broken-live runs (NO-OPPORTUNITY
  on that seed). **The r240 fix holds in the wild:** r240 missed
  11/14 with 2 FAILs (end-stranded, scholar stuck behind a creek);
  this run has zero end-stranded outcomes on any seed, and no
  scholar walk failed to get home. The TRAVEL BRANCH is 0/0 (no
  homeward sit hit a clearable blockage), so the fix's travel path
  itself wasn't exercised this run — the mechanism stays carried
  by the r240 proof test (27/27).
- **Q1 FAVORLESS ASK: WATCH — 1/55 raised asks (1.8%) never
  materialized into a committable favor (r240: 1/70 = 1.4%; r233:
  1/53 = 1.9%; r232: 2/77 = 2.6%; r231: 13/82 = 15.9%).** Rate
  < 20%, stage-0-deflected 0, every sit classified. The WATCH is
  the class movement: the single favorless sit is **class C**
  (first C ever — r232 E1 2/2, r233 E1 1/1, r240 E1 1/1), and
  unlike every E1 before it, this ask **never surfaced later**
  (stage-0-surfaced 0/1). See F1.
- **Q1c CASE-THREAD PRE-EMPTION: 0 E1 sits.** No case-thread
  pre-emption this run. The class-C sit is not an E1, so the
  LOST-ask trigger (scoped to case-thread E1) does not fire by
  the letter — but the substance (an ask that dies unheard) is
  the same harm; see F1.
- **Q1b WANT-RAISE: GO — 55/353 social sits raised ask_favor
  (15.6%); any-want sits 326/353; zero-raise seeds 0/5.**
  Per-seed: 6.6% (101601), 16.7%, 22.4%, 19.7%, 13.8%. **The F5
  spread RECURS and the floor question RE-OPENS for the next run:**
  the thinnest seed (101601, 6.6%) sits under 7% while fat seeds
  clear 15% (22.4% max) — the exact shape the prereg said would
  re-open it. Kinds: forage_help 33, heal_help 13, sick_help 4,
  food_share 4, (no-kind) 1. (No water_haul favors on this panel.)
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 3 engine-ended WITH
  closing beats; 0 other no-close. The TRAILTALK + REL-MOURN +
  homebody/holder-voice landings did not move the close rate.
- **Q3:** recap paraphrase distinct 2/10 sittings (raw 4) —
  report-only, no second formulation owed. Canned lines: walked-in
  1/2 and take-it 1/2 (first sightings in several runs — the
  "Walked in like they'd never left." and "Take it for what it's
  worth." lines each served once); slope-reading 0; rest 0.
- **SPOTTER GO:** 43 total (12/10/5/8/8), 5/5 seeds > 0. Same
  total as r240 by coincidence.
- **LADDER 5/5** (r240: 4/5) — every seed has a villager at 5+
  spotter XP.
- **FASTER-ID 5/5:** 80 benefit plays in 126 bump calls.
- **CODEX 140** plants identified at end across 5 seeds (r240: 123).
- **STRANDED BAR: 35 stranded dawns on 1 run (the pilot's),
  worked 0, guard fires 0, social-sit dawns 28/35, misses 0.**
  The pilot's stranded run (a previous bearer's run, stranded
  from early in the leg) was never worked on and the wedge kept
  sitting socially on 28 of its 35 dawns. No bar miss.
- **TRUST GUARD 0 drops. JAM 0 jam-days.** **VILLAGE BAR 5/5**
  — all five villages alive at d40 with no fallback footnote
  (r240's 5/5 needed the aliveAt40 fallback for the collapsed
  seed; this run has no collapse at all).
- **THREAD 0/0, TRAVEL 0/0 — NO-OPPORTUNITY.**
- **ROSTER:** 0 unaccounted on all five seeds. Departures logged
  and matched by id everywhere (8 villager deaths + 4 exiles,
  all matched — removalLog names the how for each).
- **SCHOLAR DEATHS 2/5 — WATCH, at bar.** Salvador d8 (101601,
  the wild) and Anjali d36 (101603, the wild). Both woke AWAY
  from Haven the morning they died (last dawns (4,4), atHaven
  true / insideHaven false) — the same shape as r232/r233/r240.
  No directional move vs r240 (2 = 2): the wildavoid +
  fleerepair + competent-policy door-skip base changes did not
  move the count, adjudicated as band noise.

## FINDING F1 — the seeded favor that died unheard (Q1 WATCH, documented + proposed, NOT landed)
The panel's single favorless sit is Fatima d14 on seed 101602
(class C — seed favor present but opener attached nothing). The
full story, from the structured sit records (wedge-sit transcripts
are not retained — only the two end-of-run people-check sittings
reach the convo txt):
- **d11:** Fatima asks for the pantry run (forage_help). The wedge
  presses `dlg:commit`. The engine REFUSES — honestly and in
  voice: "Wait — I'm away from Haven right now, out on the road.
  I can't promise a dawn meet from out here — find me when I'm
  back and we'll set it then." The favor stays "asked"; a
  follow-up seed is planted (favor-fatima_hassan-11-6, day 11,
  "the help I asked you for"). The refusal itself is good design
  — and it is the common shape panel-wide: 8 refused commits on
  the panel, ALL with the same away-from-Haven reason, all voiced.
- **d14:** the wedge sits with Fatima again. The seeded follow-up
  should open the conversation — but a pending talk request takes
  priority #1 in the opener chain (`convoOpening`,
  src/js/conversation.js ~3575: talk request first, table second,
  fromSeed opener third at ~3609), so the sitting opens on the
  "request" thread and `convoWantOpener` never runs (probeOpen []
  in the trace). The favor is never offered in 10 picks.
- **endConvo d14:** `convoResolveWant` (src/js/convo-wants.js
  ~3340) sees the seeded want at stage 0 < 1, resolves it
  'unestablished', and — because it is fromSeed — DELETES the
  seed. The phantom-seed rule's premise ("a want that never
  surfaced was never established") does not hold here: the
  unfinished business was established on d11 when the favor was
  asked; the d14 sitting was its follow-up, and the follow-up
  never surfaced because a talk request pre-empted it, not
  because the business didn't exist.
- **d19–d35:** five more sittings with Fatima; the favor never
  resurfaces. The seed's 7-day expiry (asked d11 → expired ~d18)
  would have killed it before d19 anyway, so the d14 sitting was
  the follow-up's only in-window chance — and the talk request
  took it.
**Why not fixed in this run:** every candidate fix touches
deliberate design — the opener priority order (talk request >
seed, set by the socialite playtest 2026-10-06), the phantom-seed
rule, or the 7-day seed expiry. The prereg scopes Q1c-style
findings as proposed-not-landed unless the cause is a one-line
instrument-class bug; this is engine behavior with a design
question attached. **Proposed for the conversation build arm:**
a pre-empted seed should survive until actually spoken (the
phantom-seed delete should not fire for a fromSeed want whose
unfinished business predates the sitting) — or the seeded
follow-up should outrank a talk request once the request is
delivered. Either way, the favor's next chance should not depend
on a single sitting that a request can eat. The Q1 bar's WATCH
stands until a band shows the class-C shape gone or surfaced.

## Q5 — EXILE WARNING HEARD: EXERCISED AT LAST, with a mechanism correction
**Four exiles fired on two seeds** — the first exiles on any
establishment panel since r233's probe was written, and the Q5
instrument finally has data. But the data corrects the question:
- **101602:** Ray + Mason exiled d9. **101603:** Morris + Pavel
  exiled d24. All four were MET villagers (Ray sits d3/d7, Mason
  d2/d7, Morris d2/d8/d12/d19/d21/d22, Pavel d7/d12/d18) — the
  r233 unmet-exile shape does NOT recur.
- **All four are MOOT-path exiles, not freeloader exiles** —
  proven by the pronouncement line's exact text ("X is exiled.
  \"Take what you can carry and go.\" The village watches them
  walk until the trees close."), which exists only in
  `resolveCase` (src/js/betrayal.js:2227). The freeloader vote's
  line reads differently ("It's done. ..." with no name prefix),
  and d9 timing rules out the freeloader ladder outright (5-day
  warmup + 3/7/12-day stages ≈ 17 days minimum before any vote).
- **No freeloader exile fired on the panel**, so the Q5 question
  as written — did the player hear the d7 warning before a d12
  vote — is STILL unanswered. The pre-registered defect trigger
  (an exile with NO warning line is a silent-exile finding) fires
  on its letter — none of the four exiles' lines holds a warning
  — but it is adjudicated NOT a defect: the trigger assumed the
  freeloader pipeline, and these exiles never entered it.
- What IS established: the player heard only the sentence. No
  case thread about any exiled person appears in any held sitting
  (case picks on both seeds concern other villagers — Nayan,
  Miles, Wanjiru; Zhanna, Onni, Amina), and no freeloader
  gossip/warning named them. The one gossip line captured names
  the SCHOLAR: 101603 d23 "Around the fire, low voices: Anjali
  isn't pulling weight." — the village gossiped about the scholar
  the day before exiling two other people. Whether the moot case
  was discussed at the fire outside held sittings is UNKNOWABLE
  from this instrument (dayLines are not retained in the JSON;
  the exileLines regex lacks 'moot'/'case').
- **Owed (instrument, next run):** capture 'moot'/'case' lines
  in exileLines, record the exile path per exile (freeload vs
  moot), and record whether a case thread about the exiled person
  was ever held. That turns Q5 into an answerable question for
  moot exiles too. The freeloader-warning question stays open
  for a run where a freeloader exile actually fires.

## Q6 — POLICY FORAGING: no F4-shape seed, again
Per-seed bumpCalls vs wedgeSits vs joint forage_help commits:
101601: 43/78/2; 101602: 27/84/0; 101603: 31/72/5; 101604: 12/64/4;
101605: 13/76/4. **No F4-shape seed** (bumpCalls ≤ 2 with
wedgeSits ≥ 50): the thinnest foragers (101604: 12, 101605: 13)
still foraged 12–13 times with 64–76 sits. On this band the
competent policy DOES forage when sits are available. But the
spread is wide (12–43 bumps) and 101602 committed ZERO joint
favors in 84 sits while raising 14 asks — the village that
committed nothing still reached wave 4 at standing 130 with the
fattest pantry (135,707). The mechanism (sits crowding out solo
forage, and favors raised but never committed) stays a sim-lane
question if it recurs.

## Q4 — census (plain words)
Five villages, 42 days. All five played the full leg — no collapse
anywhere, the first clean 5/5 since the r240 collapse seed.
- **101601 — the stranded one.** Nine of twelve alive, pantry
  39,881, standing 40, wave 2. The dying: Jovan d7 (ambush),
  a villager d8 (monster), the scholar Salvador d8 (the wild —
  stuck out after a dawn away from Haven, the r240 shape without
  the creek). One broken run closed the same day it broke (Raul
  d6). A previous bearer's run stood stranded for 35 dawns and was
  never worked on — the wedge kept sitting socially through it.
  Spotter 12 (the deepest bench), codex 22. Fatima needed a
  forage-help hand from d9 but couldn't say so until the language
  arrived on d29 — she asked, and was heard, late.
- **101602 — the fat, quiet one.** Eight of twelve alive, pantry
  135,707 (the fattest on the panel), standing 130, wave 4.
  Nobody died to monsters late — the losses are the exiles: Ray
  and Mason, voted out d9 by moot (see Q5), and two monster
  deaths (d17, Fatima d36). Fourteen asks raised, ZERO joint
  favors committed — the village that commits nothing still climbs
  highest, because standing counts war, diplomacy, and feasts,
  not joint favors (r233 F3). Spotter 10, codex 34.
- **101603 — the gossiped one.** Nine of twelve alive, pantry
  43,328, standing 45, wave 3. The village gossiped about its own
  scholar ("Anjali isn't pulling weight", d23) and exiled Morris
  and Pavel the next day; the scholar Anjali died d36 in the wild.
  Morris's broken run closed the day it broke (d22). Spotter 5
  (the thinnest bench), codex 20.
- **101604 — the fighting one.** Ten of twelve alive, pantry
  24,629, standing 100, wave 4. Two died to named monsters —
  Buffering d36, Choir Toad d38 — the wave-4 unlock brought the
  monsters to them. Three broken runs, all closed the same day
  they broke (Ivan d11, Owen d15, Joaquín d19). Spotter 8,
  codex 28.
- **101605 — the whole one.** Twelve of twelve alive, pantry
  74,029, standing 125, wave 4. Nobody died. Two broken runs
  closed same-day (Ingrid d5, Wei d16). Spotter 8, codex 36 (the
  deepest plant knowledge).
- **The dying:** 8 villagers killed across the five villages
  (monster ×4, the wild ×2 scholars, ambush ×1, +1) and 4 exiled
  by moot. Nobody starved. No village collapsed.
- **What they knew:** the scholar's plant codex holds 20–36
  plants per village at end (140 total). Spotter knowledge reaches
  5+ XP on at least one villager in every village (LADDER 5/5).
- **What they carried:** joint favors are almost all forage_help
  (33 commits; heal_help 13, sick_help 4, food_share 4). Pantries
  end 24,629–135,707 kcal. Wave 4 reached on 3/5 seeds (101602,
  101604, 101605) — the standing split holds at t4=100 (100, 125,
  130 → wave 4; 40, 45 → wave 2/3). No wave-4 kills or party
  launches in the instrumented records — the telemetry type-count
  map again PROVES the absence rather than assuming it: no
  telemetry type records party launches (combat_start/end,
  contest_fired/end, companion_kill_beat, scale_rank are all
  present; no launch type exists). The launch/kill instrument gap
  is still open.
- **Social life:** wants are raised in 92% of social sits
  (326/353). A villager who says "How can I help?" hears the live
  ask — 1.8% favorless on a fourth fresh band. And the villages
  feel inhabited: Caitlin teaching Dandelion by the fire, Oscar
  planning to learn one useful thing a week.

## People check — PASS (seed 101603, Caitlin + Oscar, read in full)
- **Caitlin** (pottery instructor): PASS, with one dry beat.
  Opens resuming a live thread ("You said the scary part is this
  might be on purpose. That someone's watching."). The Dandelion
  teach lands ("Good to know. Really good to know."). One dry
  beat — "The moment passes without landing. Not yet." after "I'm
  listening." — the same line r240's Alma drew, second run in a
  row; a single dry beat, not a loop. The recap names the live
  thread ("Still on that personal stuff."), the invite is accepted
  with a real reason ("Someone should watch your back. Might as
  well be me."), and the personal question is answered honestly
  ("Hah. The nights are the hardest. Days, you're busy. Nights,
  you're just... with it all."). Closes naturally ("Okay. We'll
  pick this up later." + "This was good.").
- **Oscar** (blacksmith): PASS — the better of the two. Opens
  resuming ("You said you don't recognize the person in your head
  anymore. Still a stranger to yourself?"). The teach lands with
  recognition ("And I've been walking past it for weeks." — the
  same lesson line r240's Naoise drew; a canned teach-reaction,
  not an echo of the player). Two soft deflections ("They let the
  words sit there, unanswered." / "They let that thread drop —
  for now.") read as a person thinking, not a loop. The plan
  question is real ("So what's your plan here? Just... get
  through it?"), the player's honest answer gets an honest reply
  ("Honest. I can work with honest."), and Oscar states his own
  plan ("Mine's simple: learn one useful thing a week. This week
  it's tracking. A plan's just a direction you argue with.").
  Closes warmly ("Good talk. Onward, then." + "This was good.").
- **F2 echo watch:** no acceptance echo in either sitting (no
  link/raise accept offered). The echo shape (r239 Walt, r233
  Paolo, r240 Naoise) does not recur this run; the watch stays
  open for the next run.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, exiles, waves 2–4 all
  fire. The one favor that died unheard (F1) is a named mechanism
  with a proposal, not unreachable content.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Oscar's one-thing-a-week plan and
  Caitlin's nights-are-hardest answer are the game at its best.
  The false notes left are one-line echoes/dry beats (F2 watch,
  the "moment passes" dry line), not broken beats.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30–40 monsters each, bank spotter skill, and reach wave 3
  on 5/5 and wave 4 on 3/5 seeds. No village reached national/table —
  expected at day 42. The binding watch is now a question, not a
  fix: a seeded favor follow-up can die unheard when a talk
  request eats its only in-window sitting (F1), and the Q5
  instrument needs a path distinction before moot exiles can be
  judged heard-or-silent.

## Metric review (§14)
- **END BAR — GO, and the bar worked as the fix's judge.** 7/7
  same-day closes, zero end-stranded outcomes, no collapse seed.
  The r240 fix is proven in the wild on a fresh band — the bar
  did exactly what the prereg asked of it. The TRAVEL BRANCH
  0/0 means the fix's travel path wasn't exercised; the mechanism
  stays carried by the r240 proof test.
- **Q1 — WATCH, and the bar worked as a mechanism detector.**
  The rate (1.8%) holds on a fourth fresh band, but the class
  moved E1→C and the ask died unheard where every E1 surfaced.
  The WATCH clause exists for exactly this: rate holds, mechanism
  moved. Keep the thresholds as written; the C shape is the next
  run's re-read.
- **Q1c bar — scope gap found.** The LOST-ask trigger is scoped
  to case-thread E1, so a class-C ask that dies unheard doesn't
  trip it. The substance is the same harm. Next run's prereg
  should widen the trigger: ANY favorless ask whose kinded ask
  never surfaces later is a LOST ask (defect finding), regardless
  of class — the class names the mechanism, the surfacing names
  the harm.
- **Q1b bar WORKS, and the F5 watch RE-OPENS.** 15.6% panel
  rate, no zero-raise seed, thinnest seed 6.6% with fat seeds
  over 15%. The 5× spread is back (r240 closed it at 16.4% min).
  The per-seed floor question is owed in the NEXT run's prereg.
- **Q2 bar WORKS on the new base.** 0/10 CUT. Keep as written.
  The crisis-r241 mime/Wren variant pools did not move the close
  rate; the Q3 canned watch caught one serving each of walked-in
  and take-it (report-only).
- **Q3 — report-only, stable.** Distinct 2 (raw 4). No
  formulation owed.
- **Q5 — EXERCISED, mechanism corrected, question refined.**
  Four moot-path exiles, all met villagers; no freeloader exile,
  so the d7-warning question stays open. The defect trigger fired
  on its letter and was adjudicated not-a-defect with the
  mechanism named (moot path, proven by exact pronouncement
  text). The instrument revision (moot/case capture + path per
  exile) is owed for the next run; without it, moot exiles can't
  be judged heard-or-silent.
- **Q6 — report-only, answered on this band.** No F4-shape seed
  (min 12 bumps). The policy forages when sits are available —
  on this band. The 101602 zero-commit shape (14 asks, 0 commits)
  is a new wrinkle for the sim lane if it recurs.
- **Scholar deaths 2/5 — WATCH, at bar, fourth straight panel
  at 2 (r233: 2, r240: 2, r241: 2).** Both away from Haven. The
  A/B is the sim lane's (already triggered); this run adds no
  new escalation and no directional move.
- **LADDER 5/5 (was 4/5).** The thin seed (101603, spotter 5)
  still clears pace — the spotter bench is deeper on this band.
- **Wave 4 on 3/5 (was 2/5).** Standing attribution exact again:
  t4=100, threshold between 45 and 100 on this band.
- **Roster watch CLOSED as an instrument gap, answered again.**
  0 unaccounted on 5/5 seeds with departures logged and matched
  by id, AND the how named per departure (removalLog). The open
  question is no longer recording — it is whether a departure is
  narrated to the player (Q5 answers it for exiles when the
  instrument can tell the path).
- **Telemetry baseline — do NOT roll.** LOUD on guardrails.* is
  the known schema mismatch (prereg-predicted); c3 quiet.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r241 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive d40,
  pantries 24,629–135,707, 0 starvation deaths on the panel).
  Baseline NOT rolled (prereg: never roll on a mismatch).
- c3.starvationDeaths: quiet.

## Gate check
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`
in the worktree, log
`evidence/2026-11-18/journey-establishment-r241-gate.log` —
**333 passed, 11 failed in 1349s, 0 attributable.** The box ran
64% slower than r240's gate (1349s vs 821s) — sibling load, not
this run's code (no src/js changed this run: tooling + evidence
only). The 11, each verified:
- 6 match r240's gate exactly: 2 load timeouts (exact 120s):
  living-garden, one-person-army — the standing deed-attainment
  timeout class; `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — the balance-proof manifest is
  STALE on this base ("Proof source inputs are not current");
  `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r240/r142); `test-ladder-bundle-20261108.js`
  — same control fail (200 monster turns WITHOUT delivery fire
  the ambient raid — fires 0).
- 4 NEW exact-120s timeouts, all load: occupation-panels (r240
  passed it in-gate at 103s — borderline), trust-observer
  (r240 passed in-gate), synergy-stall, capable-bot. Each hit the
  check.js 120s cap, not a test assertion.
- 1 NEW non-timeout: `test-measurement-cache-flags.js` (1/4
  in-gate) — PROVEN a load artifact by standalone re-run: 4/4
  green in 28s on this tree. Same class as the r187 AGENTS.md
  note (cache-flags scores track box load).
- Separately verified, NOT a gate failure: the analyzer fork
  reproduces r240 exactly on the r240 corpus (see Instrument
  proof in the prereg — every scored number identical).

## Closeout
- **Commits (branch `journey-establishment`):** prereg + driver/
  analyzer clones (tooling only, as-run driver); run note + pilot /
  panel / analyzer / gate logs. No src/js change this run — F1 is
  documented + proposed for the conversation build arm, not landed.
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 1→2 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r241 panel corpus (per-seed JSONs + convo transcripts)
  lives under the goal hidden_files evidence dir for 2026-11-18;
  the repo evidence dir holds the prereg, run note, analyzer log,
  gate log, and pilot/panel stderr logs.
- Carried proof tests re-run green on the new base: r240 walkhome
  27/27, r231 settled-help 19/19, r230 stage0-help 13/13, r225
  stage0-cant 18/18, r214 mood-goodbye 10/10, r139 spotter 35/35,
  r221 want-raise 7/7, r137 clearhome 37/37.
