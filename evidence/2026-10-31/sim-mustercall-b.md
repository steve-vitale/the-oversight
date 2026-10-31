# sim-mustercall-b — the muster-call census: what a sounded call would yield, state by state (MEASUREMENT ONLY)

Run: Loop B worker, axis scale-onramp, next blank (3) from run
fleshout-loop-b-20261031T0249Z. Worktree branch: sim-mustercall-b.
Base anchor: see per-seed JSONs (`anchorCommit` field; worktree HEAD
at sweep time a1e3a01a9, which includes Loop A arm sim-titanexcl-a
72512906f, backlog #1550).
Pre-registration: evidence/2026-10-31/sim-mustercall-b-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1,
verbatim reuse) + scripts/policies/muster-diag.js (MUSTER=1,
verbatim reuse) + scripts/mustercall-sweep-20261031.js +
scripts/mustercall-analyze-20261031.js.
Proof: scripts/test-mustercall-20261031.js — 21/21 green
(synthetic fixtures only; no band seeds).
Corpus: evidence/2026-10-31/perseed-mustercall/leadfeast/s85101–s85116.json
+ mustercall-analysis.json + replay-s85106-postblock.json (post-block only).
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated (same declaration
as herald-b).

## Verdict: DIAG-GO

Judged exactly against the prereg's band rule:

- Completeness: 35/35 refused Herald attempts joined to complete
  muster snapshots = 100% (>= 95% required).
- Cross-check (i) game-side refused outcomes records: 35/35 join
  to a REFUSED attempt on the same titan and day = 100%
  (>= 95%). (Analyzer note: the record carries gate inside
  `detail.gate`, not top-level — the first analyzer version
  read the top level and reported 0/35; fixed, re-run, 35/35.
  The corpus never changed.)
- Cross-check (ii) ready-manual vs ready-game agreement: 35/35
  = 100% (>= 95%).
- instrumentErrors: 0 on all 16 seeds (herald + muster-diag).
- Distinct refused state clusters: 9 (all on seed 85106; the
  single-seed caveat is carried in the headline, as muster-a did).
- Verdict sections (a) Q1 census, (b) Q2 asymmetry + kill-outcome
  judgment, (c) Q3 decision brief, (d) wall numbers: all present
  below.

## Answer in one paragraph

Muster-a's "2 blades vs need 10" is ONE state, not the rule — and
it is the state this band no longer produces. On the herald band,
a sounded call would bring 5 blades on days 95–97 and 9 blades on
days 112–130, and with Haven's commit the ceiling reaches or
passes the 10-blade gate on five of the nine refused-state days
(112, 125, 128, 129, 130). The deeper reversal is the offer gate:
every one of the 35 refusals happens at omen stage 2, with the
call button OFFERED the whole time — the opposite of muster-a's
feast-drawn state (omen null, buttons never offered). The blocker
on this band is purely that nobody presses: muster-verb counters
are 0 on all 16 seeds, the muster object never exists on any
seed, and the coalition matures underneath the refusals while no
one calls it (Thornfield's trust crosses the trusted threshold
mid-window, lifting the call yield from 5 to 9). The post-block
proves the arithmetic is not hypothetical: sounding the call at
the first day-112 refusal brings exactly the predicted 9 allies,
one Haven commit makes the muster ready at 10/10, and the Herald
is FOUGHT the same day — and lost, after which the muster is gone
and later contacts refuse again. So the gate is reachable, the
button is offered, the fight is losable, and the loop after a loss
is "call again or refuse again" with nobody calling.

## Q1 — the census: every refused scholar-channel Herald state

Policy stack on every seed (identical to herald-b):
`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap. All 35 refusals: seed 85106,
caller wild-contact (monsterTurn hungry contact, scholar tile ==
Herald tile, pendingBefore false), reason MUSTER-GATE, have 0 /
need 10, muster never created. No other seed refuses, fights, or
field-fights the Herald at all.

Per-cluster table (cluster = seed, day, omen stage, call yield,
commit-block; ceilings = call yield + commit addition):

| Day | Omen | Call yield | Ceiling (call+commit) | Commit block | Call offered | Re-faces |
|---|---|---|---|---|---|---|
| 95 | 2 | 5 | 8 | UNBLOCKED | yes | 2 |
| 96 | 2 | 5 | 7 | UNBLOCKED | yes | 3 |
| 97 | 2 | 5 | 5 | NO-VOLUNTEERS | yes | 3 |
| 112 | 2 | 9 | 10–12 | UNBLOCKED | yes | 6 |
| 125 | 2 | 9 | 11 | UNBLOCKED | yes | 4 |
| 126 | 2 | 9 | 9 | NO-VOLUNTEERS | yes | 4 |
| 128 | 2 | 9 | 10 | UNBLOCKED | yes | 1 |
| 129 | 2 | 9 | 10 | UNBLOCKED | yes | 9 |
| 130 | 2 | 9 | 11 | UNBLOCKED | yes | 3 |

Totals: 35 refusals over 9 days (first day 95, last day 130,
span 35 days); max 9 refusals on one day (day 129); muster events
between first and last refusal: 0. Haven blades valid: 0 on all
35 snapshots; ready-manual: false on all 35 (the gate is
unmet only because no muster exists, not because a muster fell
short — the printed have is 0 throughout).

Per-village quotas (same three active links on all 35 snapshots;
only trust/opinion/arrears move):

- Emberhold: REFUSES on every snapshot — arrears 3000 throughout
  (the arrears refusal rule: trust < 25 OR opinion < -10 OR
  arrears > 0). Trust falls 69 -> 61 -> 55 across the window;
  opinion 11 -> 13 -> 17; free faces 3, quota 2, wouldYield 0
  every time. If the debt were paid, Emberhold would add 2
  blades (trust < 70, base quota) — enough, late in the window,
  for a sounded call ALONE to reach 11/10. The debt is the
  swing factor this census found and muster-a could not see
  (its links never refused).
- Thornfield: the maturation story. Days 95–97: trust 68,
  opinion 24, quota 2 (base), 9 free faces, yield 2. Days 112–130:
  trust 71–74, opinion 26–30, quota 6 (trusted tier: trust >= 70
  AND opinion >= 10), 9 free faces, yield 6. The coalition's
  call yield grows from 5 to 9 while the refusals repeat.
- The Red Table: trust 76 -> 78 -> 72, opinion 22 -> 24 -> 28,
  quota 6 throughout, 3 free faces, yield 3 throughout.

Commit-block reasons across the 35 snapshots: UNBLOCKED 28,
NO-VOLUNTEERS 7 (days 97 and 126, when no Haven volunteer is
free — roster availability moves intra-day). NO-OMEN: 0.
OMEN-STAGE-LT-2: 0. HAVEN-CAP: 0. That is the second reversal
of muster-a: on this band the commit is almost never blocked,
and never by the omen gate — because the refusals arrive
through the omen channel (located Herald, stage 2), not the
feast-draw channel (omen null).

Is muster-a's "2 vs 10" the rule or one state? ONE STATE, and a
state this base no longer produces: its feast-draw channel is
closed by #1550 (0 feast-draw Herald attempts on this band —
see below), its omen was null, its coalition was thinner
(one yielding link at base quota, two links with zero free
faces). On the surviving channel, the call yields 5–9 and the
gate is reachable with commit on most refusal days. Quoting
"2 vs 10" as the muster ceiling is now wrong; the current
numbers are the table above.

## Q2 — channel asymmetry on the same band

| Channel (seed 85106, Herald only) | Attempts / fights | Outcomes |
|---|---|---|
| Scholar TB (startCombat) | 35 attempts, 0 fought, 35 refused | all MUSTER-GATE, have 0/10 |
| Villager field (fieldFight) | 3 fights | 3 vFlee, 0 vKill |
| TB kills of Herald | 0 | — |
| Field kills of Herald | 0 | — |

Field-fight detail (this band's own capture): day 111 Yerkezhan
(Second Omen, 37 dealt, 31 taken, fled at 57 HP); day 113
Yerkezhan (The Naming, 20 dealt, 48 taken, fled at 9 HP); day 128
Marcelo (The Naming, 13 dealt, 69 taken, fled at 26 HP). The
field fights interleave with the refusal days (refusals day 112
sit between field fights day 111 and 113; a refusal day 128
shares the day with Marcelo's fight).

Does the asymmetry change any kill outcome? NO, on either side
of the counterfactual:

- Excluding refused TB attempts changes no kill count: TB
  Herald kills are 0 with or without the refusals (no TB Herald
  fight ever starts).
- Gating field fights the way TB is gated would change no kill
  count either: the 3 field fights would become refusals (the
  muster is never ready in the judged run), and field Herald
  kills would stay 0. What gating the field would remove is
  real fought content — three losing fights in which villagers
  dealt damage and nearly died — not kills.
- The asymmetry's live effect is therefore not on kills but on
  damage and story: the field channel lets villagers wear the
  beast down (entity HP 525/700 at the first refusal, 105/700
  at the last) while the scholar channel refuses every meeting.
  Caveat, stated plainly: the three captured field fights
  account for only 70 of that 420-HP drop; the remaining 350 is
  NOT explained by this instrument (no other Herald field
  fight was captured, no TB Herald fight ever started). Where
  the rest of the damage came from is an open instrument
  question, not a claim made here.

## Q3 — decision brief: by which perceivable channels COULD a call be sounded

Ranked by perception grounding (strongest first). Each row's
"yield on this census" is what sounding the call through that
channel would have produced on the measured states. No channel
here is a build; the brief is for the coordinator/Steve, and
#1538 (steve-call, refused-face routing) still needs the ruling
before any routing change is built.

1. DIRECT REFUSED FACE (scholar's own eyes) — STRONGEST.
   Trigger: the scholar stands on the Herald's tile, the engine
   tries contact, the refusal line itself prescribes the call
   ("sound the call, muster 10 allied blades"). Perceivability:
   direct sight, no inference, no roster. Yield on this census:
   5 blades days 95–97, 9 blades days 112–130; with commit,
   gate met on days 112/125/128/129/130. Blocker on this band:
   none in code — the button is offered (omen 2) and no policy
   presses it. This is the channel a refused-face routing rule
   would use, and it clears the perception law on its face.
   Open design question (for #1538, not decided here): after a
   fought-and-lost muster battle, the muster is gone and the
   next contact refuses again — does the routing re-sound the
   call, or does the village stop facing until the player acts?
   The post-block shows the second call is the next decision,
   not an edge case.
2. LOCATED OMEN (scouts' report) — STRONG, already wired.
   Trigger: omen stage 2 — scouts return and say aloud
   "Scouts found its lair — tile X, Y. ... You cannot face it
   alone. Sound the call." The camp self-bar then offers call,
   commit, and war council. Perceivability: a scout report the
   scholar hears at camp, plus the placed lair tile. Yield:
   identical to channel 1 on this census (same states, same
   omen stage) — and it is the channel that explains WHY the
   button is offered throughout this band. A policy (or a
   player nudge) that sounds the call on reaching stage 2
   would have mustered before the first refusal on day 95
   only if the coalition was already at yield 5 + commit —
   ceiling 8 on day 95, still short; the gate would first
   have been met around day 112, when Thornfield crossed
   trusted. Timing matters: an omen-stage-2 call is early,
   not sufficient.
3. WAR COUNCIL INTEL (stage 2, camp) — SUPPORTING, not a call.
   Trigger: the scholar sits the council (also stage-2 gated)
   and hears faces, scout intel, and the System's odds.
   Perceivability: a played conversation at camp. Yield: no
   blades by itself; it informs the call decision. A council
   that reports "9 blades answer, commit 1 more and the gate
   opens" would be the honest version of the refusal line's
   arithmetic — the refusal line never updates its numbers,
   the council could.
4. VILLAGER FIELD FIGHT, VIA GOSSIP — WEAK, unverified as a
   scholar trigger. Trigger: a villager fights the Herald in
   the wild, survives, and the fight feeds deeds/gossip/scars.
   Perceivability: PARTIAL — the fighter's return and gossip
   are things a person at Haven could hear, but this arm's
   instrument does NOT establish that the scholar receives a
   given field fight's gossip before acting, and no gossip
   receipt is measured here. Yield if it did trigger a call:
   same 5–9 + commit as channels 1–2 (the coalition state is
   the same; only the trigger differs). Do NOT build a
   field-fight-triggered auto-call on this evidence: the
   gossip-receipt link is unproven, and an auto-call on an
   unheard fight would be list-fed in spirit even if the
   trigger names a real fight. What CAN be said: the field
   fights are the only Herald contact the village ever wins
   information from, and they currently change nothing.
5. FEAST-DRAW FACE — CLOSED on this base, do not reuse.
   Muster-a's channel (a feast draw dealing the Herald, omen
   null, buttons never offered) produced 0 attempts on this
   band. #1550 holds (see below). Any future routing design
   must not assume feast-drawn titans exist.
6. CAMPAIGN AUTO-CALL — NOT A HERALD CHANNEL. finaleReinforce
   calls soundTitanCall for 'finale' only; network-campaign
   wraps the call for the network. Neither touches the Herald.
   Listed so no one proposes it for this gate.

Ranked recommendation (brief, not build): the decision to take
is (a) whether a direct refused face at omen stage 2 sounds the
call (channel 1) — the perception law is satisfied, the offer
gate is satisfied, and the post-block proves the fight then
starts; and (b) what happens after that fight is lost (re-sound
vs stop). The coalition-building work (debt, trust) is
secondary but real: paying Emberhold's arrears would add 2
blades and let a late call pass on allies alone. Nothing in
this brief requires a roster, a list feed, or a gate move.

## #1550 status (checked, not duplicated)

LANDED in this base: commit 72512906f "exclude titans from
castMonster pool (GO, #1550)", exclusion code present in
src/js/game.js castMonster in this worktree. Measured holding
on this band: 0 feast-draw Herald attempts, 0 cast-sourced
Herald faces, all 35 refusals wild-contact. This arm does NOT
re-build #1550 and does NOT claim it; the holding check is the
only #1550 statement made here.

## Post-block counterfactual (NOT judged, clearly separated)

Replay of seed 85106 on the full sweep stack (script
scripts/replay-mustercall-20261031.js, output
perseed-mustercall/replay-s85106-postblock.json): at the first
day-112 refused attempt, the worker (in the replay only, never
in a judged sweep) sounded the call, then committed twice.

- Predicted call yield 9 = actual allies 9 (Thornfield 6 +
  Red Table 3; Emberhold refuses aloud on arrears, as the
  snapshot predicted). Snapshot arithmetic validated exactly.
- Commit: first tap stages, second tap commits 1 Haven blade
  (volunteers 1 at that refusal moment). Ready after: true
  (9 + 1 = 10 = need).
- Same day, the next wild contact FOUGHT — and LOST (tbEnd
  lost). After the loss the muster is absent at end state, and
  later contacts (days 113, 122) refuse again: 1 fought, 6
  refused from day 112 on in the replay (vs 0 fought, 35
  refused in the judged run). The replay run ends village-lost
  day 135 (vs 139 judged — trajectory diverged after the
  fought battle, as expected; the replay is not a second
  census).
- Lesson: pressing the buttons works, once. The muster does
  not survive its first lost fight, so the routing question
  recurs immediately: the village that loses a muster-fight
  must decide again whether to call. A one-shot routing rule
  ("sound the call on first refusal") answers day 112 and
  leaves days 113+ refusing again.

## Sense-testing: the refusal line after the first telling

Read in full: first-refusal slice (day 95) and late-repeat slice
(day 125) on seed 85106, plus the three Herald field-fight logs
from this band's own capture.

- The line is character-identical on day 95 and day 125:
  "⛔ THE HERALD does not notice you the way prey notices a
  hunter. ... sound the call, muster 10 allied blades (you
  have 0). This is not courage. This is arithmetic." The
  numbers never move (have is always 0 because no muster
  exists), the line never acknowledges that this is the
  twentieth arrival, never mentions that the call button is
  sitting in the camp bar, never mentions that the coalition
  behind the button has grown from 5 to 9, and never mentions
  the villagers fighting the same beast elsewhere.
- Between refusals the scholar waits ("You wait. The light
  changes. Nothing asks anything of you."), hauls water, does
  camp chores — the same pattern herald-b recorded. The "📯
  It moves." cue precedes each refusal: the thing arrives on
  her tile, the game refuses the fight, life goes on.
- Judgment, sharpened since herald-b: the line was honest
  once and then a stuck record. On THIS band it is worse
  than a stuck record, because the facts it implies have
  changed: it says "you have 0" as if the village had
  nothing, while the village has 9 answerable blades and an
  offered button. A person reading the twentieth refusal
  would not think "we are too weak" — she would think
  "why haven't I pressed the button the game keeps naming?"
  The sense failure is no longer just repetition; it is a
  prescribed remedy that is offered, reachable, and never
  taken, with no narration of the not-taking.

## Wall numbers (fresh band, this base — no old bank quoted)

- Seeds: 16 (pilot 85101–85108 + confirm 85109–85116, single
  policy stack above, 200d death-aware cap; no seed hit the cap).
- National: 8/16. Table reached: 12/16. Wins: 11/16. Wave 4
  unlocked: 9/16. Wave 5 unlocked: 0/16.
- Median survival: 106.5 game days. Max: 139. End reasons:
  won/over-other 11, village-lost 5.
- These wall numbers match herald-b's band EXACTLY (8/12/11,
  9/16, 0/16, 106.5/139), and all 16 seeds reproduce herald-b's
  trajectories on every compared key (maxWave, national,
  table, won, gameDays, endReason, wave-4 attempt count,
  field-fight count, wave-4 kill count — 16/16 identical).
  The added muster-diag recorder did not move any trajectory,
  and #1550 did not move any trajectory on this band either
  (no cast-sourced Herald face existed in herald-b's band to
  remove — its 35 refusals were already wild-contact).
- Located-but-unfaced seeds (end omen stage 2, zero Herald
  attempts): 85102, 85107, 85109. The located Herald sits
  uncontacted on three seeds while the scholar's days are
  spent elsewhere — contact, not the gate, is the scarce
  thing for world-placed Heralds, as muster-a's chain 2 also
  found. No finale/nielsen attempt occurs (wave 5 never
  unlocked), so no other titan's gate is observable here.

## Village assessment (plain words)

These villages climb well — 11 of 16 win, 8 reach national —
and the Herald barely enters their stories except on one seed,
where it enters as a neighbor that keeps walking onto the
scholar's tile and being refused. On that seed the village is
not weak: by mid-window it has three allied villages, two of
them strong enough to send 6 and 3 blades, a scout-located
lair, and a camp button offering exactly the remedy the
refusal line names. What it lacks is not strength or
knowledge but action — nobody ever presses the button, in
sims because no policy does, and the game never asks again
except by repeating the same refusal line. The villagers who
do meet the Herald in the wild fight it alone, hurt it, and
run; their fights change nothing, because nothing carries
their news into a call. The scale wall, seen from this angle,
is not a numbers wall: late in the window the numbers pass.
It is an action wall — the coalition exists, the gate opens,
and the village still does not march, because marching
requires someone to decide, and no system in the game makes
that decision.

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The analyzer's first gameOutcomeMatch read (0/35) was a
   field-shape bug, not a corpus failure: the game-side record
   carries gate inside `detail.gate`, and the analyzer read a
   top-level `gate`. Fixed and re-run: 35/35. Future analyzers
   should assert the record shape against one real row before
   judging a cross-check.
2. The analyzer's first median (111) used the upper middle
   for an even-n band; the proper median is the mean of the
   middle two (106.5), matching herald-b. Fixed, proof-covered
   (median fixture added to the proof test).
3. Cluster ceilings must be ranges, not first-snapshot values:
   day 112's ceiling is 10–12 across its 6 refusals (volunteers
   move intra-day), not the first snapshot's 10. Fixed; the
   range is what the brief quotes.
4. The per-seed spread note (muster-a's metric review) stands:
   all 35 refusals sit on one seed. The census is complete,
   but it is a one-village census; a second refusal seed
   would test whether the omen-2/offered-button pattern
   generalizes or whether 85106 is special. A future arm
   should hunt a second cluster seed before generalizing the
   "offered and reachable" headline beyond this band.
5. The Herald HP drop (525 -> 105 across the refusal window,
   only 70 explained by captured field fights) is an open
   instrument question for a future arm: what else damages a
   placed titan between refusals? It does not touch this
   arm's verdict, but it should not be quoted as "villagers
   wore it down" without the 350-HP gap named.

## Convergence state

converging (measurement, not a lever): the scale-onramp axis
now has a complete refused-state census — muster-a's "2 vs 10"
is retired as a one-state figure, the offered-and-reachable
pattern is measured (9 clusters, call 5->9, ceilings >= 10 on
five days), the field/scholar asymmetry is re-judged with no
kill-outcome change, and the post-block proves the buttons
work once and then the question recurs after a loss. The next
work on this channel is the #1538 decision (route on refused
face? re-sound after a lost muster-fight?) — not another
census of the same cluster.

## Coordinator follow-ups (not done here — coordinator owns landing)

- Merge: evidence + prereg + instrument + sweep + analyzer +
  proof test + replay + corpus (all committed on
  sim-mustercall-b). No game-code change, so "measurement
  only" in substance — but the corpus + instrument should land
  as the baseline for the next lever arm on this channel.
- Telemetry deviation check (loop step 10) against
  hidden_files/telemetry-baselines/scale-wall.json — left to
  the coordinator after landing, since the baseline roll-forward
  decision belongs to the run, not the arm.
- Findings-backlog: #1591 update (census + brief delivered,
  decision still pending) and #1550 holding note are appended
  in this run's goal-workspace write, not in the repo commit.
- Quotation corrections to carry forward: muster ceiling is
  NOT "2 vs 10" — on the herald band it is call 5 (early) /
  9 (late), ceilings 5–12 by day, gate met on five refusal
  days with commit; Herald refusals remain 35 (not 40);
  reproducible TB wins remain 2 in 28 fought.
