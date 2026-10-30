# Journey social r73 — RUN NOTE (lane B, 2026-10-30)

Leg 5 (social life), seeds 6301–6304, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 43ea03a02.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout.
Driver: scripts/journey-social-r73-20261030.js (r67 verbatim except
the r73 outing wedge). Wedge: scripts/journey-social-r73-outing-wedge.js
(r65 wedge fork; game behavior identical, recording-only dawn diag +
targetCanForage added). Proof test
scripts/test-journey-social-r73-outing-wedge.js 13/13 on SEED=42 and
SEED=7 BEFORE seeds ran. Smoke 6305 (30d) PASS. Zero src/js changes.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran).
Bindings judged as written; no metric re-scored.

## Pooled funnel (event-level truth, not the snapshot)

| seed | days | alive | offers | forageOffers | accepts | starts | startBlocked | forages | talks | delivers | deliver kcal |
|------|------|-------|--------|--------------|---------|--------|--------------|---------|-------|----------|--------------|
| 6301 | 141 | 6 | 54 | 19 | 19 | 11 | 16 | 9 | 9 | 9 | 2,890 |
| 6302 | 45 (village lost) | 3 | 24 | 3 | 3 | 1 | 4 | 1 | 1 | 1 | 1,980 |
| 6303 | 133 | 9 | 22 | 13 | 13 | 7 | 13 | 7 | 7 | 7 | 4,840 |
| 6304 | 141 | 6 | 64 | 17 | 16 | 2 | 27 | 0 | 0 | 0 | 0 |
| POOLED | | 24 | 164 | 52 | 51 | 21 | 60 | 17 | 17 | 17 | 9,710 |

Attempts per accepted favor: 2 dawns for 32 favors (meetDay +
deadline day), 1 for 17 (started first dawn, or the window closed),
0 for 2 (promise slot moved before meetDay — see Q4). Start rate
21/51 accepts (41%), vs r67's 4/28 (14%) — seed band differs, and
6301 alone starts 11; no mechanism change explains it, so this is
reported as band variance, not an improvement claim.

## Verdicts (§14)

- B1 (diag coverage): PASS. 60/60 start-blocked attempts carry a
  diag and classify to exactly one adjFail class.
- B2 (dawn census): PASS. 81 diag-carrying dawn attempts (21 starts
  + 60 blocked): player at Haven 73, partner node at Haven 57,
  inside-match 77, partner away 23, partner micro-pos null 40.
  Every successful start reads player-at-Home, node-at-Home,
  inside-match, pos present, not away (21/21).
- B3 (barren classification): PASS on its terms, with the bigger
  finding beside it. Forage-node-barren 11 (all 6301): 8
  anchor-empty (targetCanForage true, anchor 3x3 presses all
  empty) vs 3 tile-barren (canForage false). Forage-cell-blocked
  17 (all 6301): 16 "Nothing left to take here today" (tile
  canForage false at the walked cell) + 1 mid-combat. BUT the
  pooled forageBarren count (124) is dominated by a class B3 did
  not name: travel-blocked days (see 6304 below). The step name
  conflates them; metric review proposes splitting it.
- B4 (kept-without-start flip): PASS, with the mechanism
  corrected (see Q4). All 9 kept-no-start favors have a named flip:
  the nightly sweep on their deadline day, which sets kept='broken'
  (game.js checkPromises rot branch). Deadlines: Gleb 32-9 d34,
  Somchai 46-13 d48, Marina 47-14 d49, Harper 8-1 d10, Theo 14-2
  d16, Giulia 20-6 d22, Vincent 40-10 d42, Mia 81-20 d83, Lucas
  68-32 d70. The instrument's `!!p.kept` coercion reported those
  broken promises as kept=true; the game truth is broken.
- B5 (people): PASS. 5 reads (below), >= 2 outing-related (3:
  Marina + Mia favor-accepts + the 6301 deliver/talk beats),
  0 fabricated-history flags, 0 weak endings.
- Guardrails (report-only): pooled dry 418/1469 = 0.285, in band
  [0.20, 0.40] (per-seed 0.229 / 0.184 / 0.295 / 0.360);
  convos ending on a dry line 1/1469. Recovery/phantom counts
  are not in this run's saved JSON (they lived in r67's chain
  analyzer, not the driver output) and are not re-quoted here.
- NO-REGRESSION: check.js --quick 284 passed, 6 failed in 587s —
  the same six pre-existing failures as r67/r68, zero
  attributable (this run touches no src/js).

## Q1: dawn-block decomposition (60 blocked)

By adjFail (first failing condition in adjacent() order):
away 23 (38%), no-micro-pos 17 (28%), non-adjacency 13 (22%),
node-elsewhere 4 (7%), micro-far 3 (5%), door-side 0, inside-
mismatch 0, nonfinite-pos 0. By status reason: "Move next to
your partner..." 47 (= 23 away + 17 no-micro-pos + 4
node-elsewhere + 3 micro-far, exactly), "Finish your current
outing before starting another." 10, "Your partner is no longer
available for this outing." 2, "Meet at Haven at dawn on day 63."
1 (a pre-meetDay attempt).

What this means in plain words:
- The door-side problem the wedge was built to fix (one door
  crossing at dawn) essentially never binds now: 0 door-side
  blocks, inside-match 77/81. The crossing is not the bottleneck.
- The dominant block is the partner being AWAY at dawn (23):
  the partner is not at the village at all when the dawn comes.
  A real player faces the same wall — you cannot forage with
  someone who is away.
- The second block is the partner having NO micro position
  (17, all with node at Haven, player at Haven): the villager
  has never been placed on the Haven micro-grid, so the
  adjacency test has nothing to measure against. This is the
  sharpest game-side question out of the run: what assigns a
  villager a micro position, and can a Haven villager who has
  never traveled with the player EVER start an outing? The
  instrument cannot answer it from dawn snapshots alone (it
  would need a position-history read); it is the named next
  investigation, not a fix claimed here.
- Node-elsewhere (4, all with the player away from Haven) and
  micro-far (3) are small. The player waking away from Haven
  accounts for only 8/81 attempts (playerAtHome 73/81) — the
  driver usually wakes at home; the blocks are about the
  partner, not the player.

## Q2: dawn positions

Successful starts are uniform: player home, partner node home,
same side of the door, micro position present, not away
(21/21). Blocks are partner-side: away 23, no micro-pos 17.
Partner node at Haven on only 57/81 attempts; on the other 24
the partner's node is elsewhere (away 22 of those, plus the
player-away cases). No partner ever lacked a nodePos entry
(defaulted 0) — the node is always known; it is the MICRO
position that is missing.

## Q3: barren after start — and the 6304 stuck outing

- 6301/6303 outings forage fine once started: 16 of 18 starts
  on those seeds forage and deliver the same day (every forage
  press leads to a deliver; 17/17 across the band).
- Anchor-empty (8) vs tile-barren (3) on 6301: on gatherable
  tiles, the anchor 3x3 often yields nothing edible. The wedge
  counts a press as empty when it yields 0 EDIBLE kcal, so
  unknown plants (never split as food) read as barren ground.
  Anchor-empty is plausibly a knowledge gap, not empty ground —
  unproven from this instrument, named for the next run.
- 6304 is a different failure, and it is the run's loudest
  single-seed finding. Miguel's outing started d23 and then
  NEVER moved: 354 forage-travel-blocked attempts over 118
  days (d23–d140), the same first-3 jump targets every day
  (e.g. (3,2), (4,2), (2,3) from home (4,4)), map never leaving
  (4,4). The wedge jumps d=2–3 directly; travelTo refuses a
  jump when an intermediate tile on the path is blocked
  (game.js travelTo intermediate-blockage check), and the wedge
  caps at 3 targets/day and never tries a d=1 hop or a 4th
  target. So the outing is stuck, not barren — the step name
  lies. Worse, the stuck outing monopolizes the wedge's
  one-outing-per-day slot (earliest deadline first, forever,
  since its deadline is long past) and the game's own
  current-outing gate blocks every later start (6304's 10
  "Finish your current outing" blocks). Ursula's outing,
  started d77, got exactly 2 log rows (wait + start) and never
  a single outing day. A real player is NOT stuck this way —
  they can hop d=1 and can end the outing at home — but the
  driver is, and the wedge needs the fix (record travelTo's
  returned blockage; hop toward targets; try the next outing
  or surface the cancel when one is stuck). Wedge-scope, not
  a game finding, and not fixed mid-run (it would change the
  series' behavior).

## Q4: kept-without-start — SOLVED, and it was the instrument

9 favors end with promiseKept=true, no start, states broken /
moot / acknowledged / asked (r67's Henry case, same shape).
Mechanism, read in source and consistent with every case:
checkPromises' rot branch (game.js) sets an expired favor
promise to kept='broken' (string) with closedReason='deadline'
at the nightly sweep on/after the due day, and sets the favor
state to 'broken' when the ledger favor matches. The wedge's
favorEndStates and deliver logs record promiseKept as
`!!p.kept` — and `!!'broken'` is true. So broken promises
read as kept. Proof inside the data: Jesse d79 (6301)
delivers 345 kcal past deadline — the game line honestly
says "The promise was missed", while the same entry's log
field reads kept=true. The game is right; the instrument
coerces. keptMatched (12 pooled) is therefore not a kept
count at all — it counts broken promises. True kept promises
are exactly the delivered ones (favor.state='fulfilled' via
checkPromises), i.e. the 17 delivers. No game fix is owed
here; the instrument fix (record p.kept RAW, count kept
only on kept===true) is named for the next run and must NOT
be back-applied to this series.

## Correction to r65–r67: outings DO complete

completeOutings reads 0 on every seed — and it is wrong the
same way. It counts only favors surviving in the end-of-run
ledger snapshot; delivered favors do not survive into that
snapshot (all 17 delivers have deliveredKcal>0 at event time;
zero endStates carry deliveredKcal>0). Event-level truth:
17 delivers / 21 starts (81%), 9,710 kcal into pantries,
17/17 forage presses leading to same-day delivery. The
"joint outings never complete" narrative from r65–r67 was a
snapshot artifact, not a game finding. The outing system
works when it starts; the problems are starting (partner
away / no micro position) and, on 6304, the wedge's travel
strategy — not completion.

## Village assessment (plain words)

- 6301 (141d, 6 alive): the social village. 28 deep bonds,
  avg trust 89. Jesse alone carries 6 outings (d76–d100),
  delivering 345 kcal four times and 780 once; Amina and
  Marina round it out. Nobody's village collapsed; deaths were
  the wild and monsters, as usual.
- 6302 (45d, village lost, 3 alive): the short village. Only
  3 forage favors before the loss; Harper and Theo never
  started (micro-far / no micro position). The social
  instrument dies with the village, as it should — no ticks
  past the loss.
- 6303 (133d, 9 alive): the steady village. Mia is the
  repeat partner (5 outings, 4 delivered); 16 deep bonds, avg
  trust 85. One seeded-crack pair (Mia<>Nathan) served.
- 6304 (141d, 6 alive): the stuck village. 17 forage offers
  but only 2 starts, because Miguel's stuck outing (above)
  blocks the gate for the rest of the run. 8 deep bonds, avg
  trust 69 — the lowest, and the broken-promise trust hits
  (-15 each) are part of that story.
- Invitations still sometimes taken, as ruled: party accepts
  41/78 pooled (52.6%), lure 6/19 (31.6%; 6302's lure vetoes
  are sickness, honestly). Moots convened 0 on all four seeds
  (top-level field, not the telemetry path) — a watch item,
  not a verdict: the driver policy never convenes a moot in
  these runs.

## People check (sense reads, full transcripts)

- Marina, 6301 d10 (favor ask, outing-related): "The pantry's
  nearly bare. Will you forage with me tomorrow? Two pairs of
  eyes, twice the ground." Concrete plan (south slope, sunup,
  pack and knife), closes by returning to the plan ("First
  light. The pantry's counting on us."). Real.
- Mia, 6303 d6 (favor ask, outing-related): same shape, own
  place ("I know the south slope below the meadow"), closes
  "This was good. They mean it." The "make me say it again"
  repeat frame is a mild tell (r67 noted it too), not a break.
- 6301 deliver/talk beats (outing-related): "This is the part
  I like. Just us and the green." / "You unload both shares:
  130 kcal from you, 215 kcal from Jesse — 345 kcal into the
  pantry." Exact split, both shares named. The late Jesse
  delivery honestly says "The promise was missed" — the
  fiction knows the deadline passed.
- Nathan, 6303 d10: opens by remembering what the player told
  them ("You told me you're from Columbus, Ohio") — system
  recall, not invented shared history. The double invite
  ("Want to come with us?" / "Want to come with me?") reads
  slightly mechanical, but the answer is characterful
  ("Out there? With YOU leading? ...Let me think about it.").
  Ends on a quiet beat, not a non-ending.
- Jesse, 6301 d100 (late): line cook from Santa Fe, scared of
  forgetting "the way they laughed"; the roles menu (point /
  healer / carrier / talker / scout) reads as the game's role
  UI, and the pick (Scout) is the player's, not the NPC's.
  Ends smiling. Real.
- 0 fabricated-history flags, 0 weak endings. PEOPLE PASS.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — and more reachable than r65–r67 claimed.
  Joint outings start (41% of accepts), forage, talk, and
  deliver real split hauls into the pantry. The remaining
  reachability walls are partner-away at dawn and the
  no-micro-position gate, plus the wedge's own travel
  strategy on 6304.
- FUN: yes, with the honesty caveat — the favor ask, the
  dawn start line, the trail talk, and the split-haul deliver
  line form a complete little story that pays in food. The
  barren-day loop (6304's 118 identical days) would be
  miserable for a real player who didn't know to hop or
  cancel — but the game offers both; the wedge did not.
- WINNABLE: not this leg's question to close — social life
  feeds the win (bonds, invitations, 9,710 kcal of outing
  food) and three of four villages were alive, bonded, and
  organized at the horizon.

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
`telemetry-baselines/social.json` over the four per-seed
JSONs (metrics l3.bonds, l3.deepBonds, dryRate,
l3.mootsConvened, alive).
- LOUD `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled 57), not
  deepBonds. Not a bug.
- LOUD `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  PATH ARTIFACT — current field is top-level mootsConvened
  (0 on all four seeds, itself a watch item above). Not a bug.
- LOUD `alive newly appeared: baseline 0 -> current 24`:
  BASELINE-SHAPE ARTIFACT (r67's same line) — baseline
  predates the census instrument; pooled alive 24 =
  6+3+9+6 from the census above. Not a bug.
- l3.bonds and dryRate: quiet.
- Baseline NOT rolled forward: the stored baseline is a
  different-era shape (deepBonds/moots paths, no alive key),
  and this run's instrument is the r73 census. Rolling it
  would launder the artifacts into the baseline.

## Metric review

- The pre-registered B1/B2/B3/B4/B5 verdicts all held as
  written; no metric was re-scored. B4's flip-day rule
  (nightly sweep on the deadline day) is now the mechanism,
  not a guess.
- Revisions proposed for the NEXT run (r74), not applied
  retroactively:
  1. Record p.kept RAW (true / 'broken' / 'unavailable' /
     false) in every wedge log and endState; count keptMatched
     only on kept===true. The `!!` coercion is retired.
  2. Count completes from deliver EVENTS (deliveredKcal>0),
     never from the end-of-run ledger snapshot, which drops
     delivered favors.
  3. Split the forageBarren step into node-barren vs
     travel-blocked days, and log travelTo's returned
     blockage on every failed jump.
  4. Thin-chain stays dropped (r67 metric review, adopted).
  5. The no-micro-pos mechanism (what assigns positions[vid])
     needs a position-history instrument before any fix is
     proposed — dawn snapshots alone cannot see it.

## Files

- Driver: scripts/journey-social-r73-20261030.js (r67 verbatim
  + r73 wedge; zero game-behavior change).
- Wedge: scripts/journey-social-r73-outing-wedge.js (r65 fork +
  recording-only dawnDiag + targetCanForage).
- Proof test: scripts/test-journey-social-r73-outing-wedge.js
  (13/13, SEED=42 and SEED=7, before seeds ran).
- Analyzer: scripts/analyze-journey-social-r73-outing-20261030.js.
- Evidence: evidence/2026-10-30/r73/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/,
  r73-analysis.txt, r73-verdicts.json).
- No src/js changes. No [needs-eyes] (no feel/combat/UI
  change for Steve to playtest; the findings are
  measurement + instrument corrections).
