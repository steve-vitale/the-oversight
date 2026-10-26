# sim-feastdraw-a — the feast-draw yield census (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, run fleshout-20261026T0017Z, arm sim-feastdraw-a.
DIAG ONLY — zero src/js changes, zero default flips, recorders only.
This arm designs and lands NO game fix. A feast-draw yield census IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100), src/js/feastBuff.js
  header (feast_draw: on a FRESH armed grant, never a refresh — one
  draw per buff — the feast's smoke draws a wave-appropriate
  scavenger as a pending encounter the player faces via
  faceFeastDraw or declines via driveOffFeastDraw; the draw dies
  with the buff).
- Context read first: evidence/2026-10-25/sim-nonworldkill-a.md (the
  door vocabulary; the band's only wave-4 kill is 73678 day 115,
  strike, by elif_demir, via feast-draw) and
  evidence/2026-10-25/sim-w4funnel-a.md. This arm answers the 2315Z
  run's next blank (1): feast-draw yield measurement — draw
  frequency / wave targeting vs lottery ticket.
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  scripts/policies/tableseat-nowait.js), 180d death-aware horizon
  (runDays stops on death/win; 180 is the cap, not a fixed horizon).
- Published control band (w5chain-a / spawnsrc-a / poolpres-a /
  w4funnel-a / nonworldkill-a, byte-identical): deaths 234,
  national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85,
  raiders 361, pool 1,494, median survival 135d. The armed band
  must reproduce it EXACTLY or STOP and report the deviation — no
  judging on a moved baseline.
- Recorders reused verbatim (policy-side only, never edited):
  scripts/policies/raftdraft-diag.js, spawnsrc-diag.js,
  oldcore-diag.js, defwound-diag.js, w5births-diag.js,
  nonworldkill-diag.js — the exact nonworldkill composition. New
  this run, policy-side only: scripts/policies/feastdraw-diag.js
  (FEASTDRAW=1). It wraps grantFeastBuff (fresh vs refresh vs
  refused, post-state draw snapshot), drawFeastScavenger (drawn
  true/false + why, monster, veteran, wave from the def — pure
  read), faceFeastDraw and driveOffFeastDraw (decision rows), and
  clearFeastBuff (buff-end rows explaining unmet draws). The wraps
  record AFTER delegating where it matters, write nothing to game
  state (store arrays only), draw no RNG, never throw into the
  engine (recording errors are counted; an engine throw is
  recorded and rethrown unchanged), and return the original value
  untouched. Pure reads only: the recorder NEVER calls
  feastedActive() or feastDrawPending() (both can clear state —
  feastedActive clears an expired buff, feastDrawPending deletes
  a stale draw); it reads s.feastBuff / s.feastDraw directly.
- PRIMARY QUESTION: what is the feast-draw yield on this band —
  draws per grant, faced rate, kill rate, veterans per draw, wave
  distribution (especially wave-4 draws and wave-4 kills)? Is the
  draw a real veteran funnel or a lottery ticket?
- DIAG-GO rule (ALL required): (a) every feast grant, draw,
  face/decline, and feast-draw fight on the band is classified,
  unclassified 0; (b) yield rates computed: draws per grant,
  faced rate, kill rate, veterans per draw, wave-4 draws +
  wave-4 kills; (c) the 73678 day-115 strike kill's draw row joins
  to its grant (or exclusion by evidence, never by absence alone).
  Any leg missing = DIAG-NO-GO.
- Definitions (fixed before sweeping, analyzer header repeats
  them): GRANT = one grantFeastBuff call. FRESH = granted and not
  refreshed. REFRESH = granted with refreshed true (never draws).
  REFUSED = granted false. DRAW SPAWNED = a drawFeastScavenger row
  with drawn true. DRAWS PER GRANT = spawned / fresh grants.
  DRAW OUTCOME, in precedence order: driven-off (a driveOff row
  with ok true matching monsterId + grant day) > faced-face (a
  faceFeastDraw row with ok true matching monsterId + grant day)
  > faced-harness (a nonworldkill feast-draw start row matching
  monsterId + grant day, with no face/driveoff row — the harness
  fallback faced the pending encounter) > unmet-expired (a
  clearFeastBuff row after the grant carrying that draw) >
  unmet-other (no decision, no start, no clear row — counted,
  never hidden). FACED = faced-face + faced-harness. FACED RATE
  = faced / spawned. KILL RATE = faced draws with >= 1 newLog
  entry in their joined tbEnd row / faced draws. VETERANS PER
  DRAW = wave-4 newLog entries from faced draws' fights /
  spawned draws (cast-veteran draws reported separately — a
  cast veteran flag is not a produced veteran). WAVE = the
  monster def's wave at draw time (pure read; null if the def
  is absent — counted, never guessed).
- SENSE plan: one feast-draw fight thread in plain words from the
  corpus (who faced it, what the fight looked like, whether the
  draw reads as a real arrival) + a villager-behavior spot check.
  Numbers plus meaning, not counts alone.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep-compare table + analyzer output are attached instead; do
  NOT run telemetry-check on recorder rows (its counts are wrong
  on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO (census legs) — CONTROL DEVIATED (base drift, recorder neutral)

- (a) Every feast grant, draw, face/decline, and feast-draw fight on
  the band is classified: 12 grants, 5 spawned draws, 5 face rows,
  0 drive-off rows, 5 nonworldkill feast-draw starts — unclassified
  0 (0 unmatched faces, 0 unmatched drive-offs, 0 unmatched starts,
  0 null-wave draws). Corpus PASS, recorder errors 0 on all seven
  recorders, no overflow.
- (b) Yield rates computed: draws per fresh grant 5/5 = 1.0, faced
  rate 5/5 = 1.0 (all faced-face), kill rate 4/5 = 0.8, veterans
  per draw 1/5 = 0.2, wave-4 draws 1, wave-4 kills 1.
- (c) The 73678 day-115 strike kill's draw row joins to its grant
  with the full chain: grant d115 (mult 2.03, quality 1) -> draw
  strike w4 vet false -> face d115 -> start fightId
  fmgpspioy_8fe9s5 -> end won -> newLog strike w4 by elif_demir
  via 'player'. Same fightId in all three recorders' rows.
- CONTROL GATE: the armed band does NOT reproduce the published
  control band (see below). The deviation is PROVEN to be base
  drift, not recorder effect: recorder-free baseline runs on this
  worktree's base reproduce the armed trajectories EXACTLY on both
  diverged seeds (73674, 73675 — days, won, deaths, faced map,
  kill log, ts all equal). The census legs above are therefore
  judged on the current-base corpus, and the published control
  band must NOT be carried forward as current (see Metric Review).
  Analyzer gate: scripts/test-feastdraw-a.js 16/16 (unit +
  fake-Game integration checks; the first draft failed one check
  on a test-side bug — synthetic draw rows missing drawn:true —
  fixed in the test, analyzer untouched).

## CONTROL GATE — DEVIATED BY BASE DRIFT (not by the recorder)

Armed band (current base 4f5f3b614) vs published control
(w5chain-a / spawnsrc-a / poolpres-a / w4funnel-a /
nonworldkill-a): raids 85 = 85, wins 4 = 4, table 4, entered 4,
wave-5 0 = 0 — but deaths 260 (control 234), national-ever 6/8
(control 7/8), median survival 143d (control 135d), raiders 352
(control 361), pool 1,527 (control 1,494), pool wave-3+ 132
(control 107), wave-4 5/8 (control 6/8). Per-seed: 73671, 73672,
73673, 73676, 73677, 73678 reproduce their prior trajectories
exactly; 73674 and 73675 moved. 73674: prior survived 180d, 18
deaths; now won d163, 30 deaths, with a feast draw (mirror_stag,
d162) its prior run never had. 73675: prior won lesser d135 with
a d134 feast draw; now survived 180d, 38 deaths, 0 fresh grants,
never reached national.
- Cause, identified not assumed: between nonworldkill-a's base
  (acbc0c933) and this run's base (4f5f3b614), master took
  journey-scale r36 (dad2255de: titan night-strikes and
  pool-short charges booked in link history — hierarchy.js,
  titans.js) and journey-landing r53 (4f5f3b614). The src/js diff
  across that range is 3 files, 9 insertions (build.js version,
  hierarchy.js, titans.js). Which of those lines moved the two
  seeds is NOT proven here — that bisection belongs to the
  coordinator, not this DIAG arm — but the recorder is EXCLUDED
  as the cause: baseline (tableseat-nowait, NO recorders) on this
  base gives 73674 = 163d won / 30 deaths and 73675 = 180d
  survived / 38 deaths, identical to the armed rows including
  faced map, kill log, and ts counters. Detgate PASS (seed 73671:
  baseline vs recorders-OFF days 180/181, tsNationalDay 77 both,
  no diag surface, no wraps installed, post-setup world 0).
- Consequence, stated plainly: the 2015Z/2115Z/2315Z control band
  is stale on current master. Any arm that judges against it
  without re-baselining will chase two seeds of drift as if they
  were lever effects. The current-base band in this file IS the
  re-baseline candidate (same seeds, same policy, same horizon).

## THE ANSWER, FIRST (plain words)

The feast draw is a real funnel with a lottery ticket's shape.
On this band it fired exactly five times — once per fresh armed
feast, never more, never less — and every single draw was faced
the same day, by the scholar, while feasted. Four of the five
fights were won, three of them killing the drawn monster. But
only one of the five draws was a wave-4 monster, and only that
one made a wave-4 veteran. So the draw's yield is: one draw per
feast, always fought, usually lethal — but wave-4 only once in
five. At this band's rate (5 draws in 8 seeds), a second
wave-4 veteran through the draw alone would take roughly
another 8 seeds of feasting, and a third another 8 after that.
That is not a pipeline; it is a prize draw with a very good
consolation table. The scale wall cannot be climbed on feast
draws alone — but on this band, the ONLY wave-4 veteran that
exists came from one, so the wall cannot be understood without
it either.

## CENSUS — GRANTS, DRAWS, DECISIONS

Grants (12): fresh 5, refreshed 0, refused 7. Every refusal on
the band is the fusion-reactor refusal ("your reactor hums its
steady note underneath, and the fire never catches") — 7 of 7,
never the devotion gate. No re-feast while a buff was live was
recorded (refreshed 0), so the one-draw-per-buff rule was never
stress-tested by a refresh on this band. Draws per fresh grant
1.0 (5/5): no fresh grant failed to draw — no 'already
pending', no 'smoke carried clear', no 'no cast', no unknown
id. The draw chance is 1.0 in data and it behaved as 1.0.

| seed | grants (fresh/refused) | draws spawned | outcome |
|---|---|---|---|
| 73671 | 0 | 0 | — (never feasted armed) |
| 73672 | 2 (2/0) | 2 | faced-face 2 |
| 73673 | 1 (1/0) | 1 | faced-face 1 |
| 73674 | 4 (1/3 reactor) | 1 | faced-face 1 |
| 73675 | 3 (0/3 reactor) | 0 | — |
| 73676 | 0 | 0 | — |
| 73677 | 0 | 0 | — |
| 73678 | 2 (1/1 reactor) | 1 | faced-face 1 |

Decisions: faced-face 5, faced-harness 0, driven-off 0,
unmet-expired 0, unmet-other 0. Under tableseat-nowait the
policy (competent feastFightRoad: face the draw while feasted)
faces every draw the same day it spawns — the drive-off door,
the harness-fallback door, and the buff-expiry door were never
exercised on this band. The yield rates below are therefore
conditional on an always-face policy; a drive-off policy's
yield is unmeasured, not zero.

## CENSUS — THE FIVE DRAWS, FIGHT BY FIGHT

| draw (seed day) | wave | cast-veteran | faced | fight | outcome |
|---|---|---|---|---|---|
| 73672 d60 buffering | w3 | no | face d60 | scholar 100 HP solo vs 299 HP | won, kill |
| 73672 d67 memory_projector | w2 | YES | face d67 | scholar 100 HP solo vs 131 HP | won, kill |
| 73673 d38 cliffhanger | w1 | YES | face d38 | scholar 100 HP solo vs 128 + 90 HP packmate | lost, no kill |
| 73674 d162 mirror_stag | w2 | YES | face d162 | scholar 66 HP + villager 100 HP vs 188 + 132 HP packmate | won, kill |
| 73678 d115 strike | w4 | no | face d115 | scholar 52 HP solo vs 1178 HP | won, kill (wave-4) |

Yield rates: draws per fresh grant 1.0; faced rate 1.0 (5/5);
kill rate 0.8 (4/5 faced draws with >= 1 newLog entry); total
kills 4; wave-4 draws 1 (20% of draws, n = 5 — one draw, so
treat the rate as "1 in 5 observed", not a precise 20%);
wave-4 kills 1; veterans per draw 0.2 (1 wave-4 kill / 5 draws).
Wave distribution: w1 1, w2 2, w3 1, w4 1.
Cross-validation (two independent recorders, same fights):
nonworldkill's feast-draw starts = 5, identical monsters/days;
nonworldkill kills by door for feast-draw = 4 (73672: 2, 73673:
0, 73674: 1, 73678: 1) = this census's total kills 4.

CAST-VETERAN WARNING (do not conflate): 3 of the 5 draws
carried castMonster's veteran flag (memory_projector,
cliffhanger, mirror_stag) — but that flag is a cast variant,
not a produced veteran. None of the three cast-veteran draws
produced a wave-4 kill (their waves were 2, 1, 2). The one
produced wave-4 veteran came from the one draw with veteran
FALSE (strike). "Cast-veteran draws 3/5" and "veterans per draw
0.2" measure different things; the evidence keeps them apart.
Wave targeting note (limitation, not a leg): the corpus
records the draw's wave but not unlockedWave at draw time, so
"wave-appropriate" is consistent with the spread (w1-w4, one
per wave roughly) but not proven per-draw against the unlock
state. A future recorder version could read the unlock state
at draw time; this arm does not claim it.

## THE STRIKE JOIN (c) — 73678, DAY 115, IN FULL

Grant row: day 115, granted true, refreshed false, mult 2.03,
quality 1, drawMonsterId strike. Draw row: day 115, drawn true,
monsterId strike, veteran false, wave 4, grantIdx 1 (the seed's
second grant; its first, day 61, was reactor-refused). Face row:
day 115, ok true, preDraw {strike, veteran false, day 115}.
Nonworldkill start row: day 115, arg strike, mid strike, wave 4,
door feast-draw, initiator faceFeastDraw, origin null-origin,
fightId fmgpspioy_8fe9s5, fighters scholar alone 52/100 HP vs
strike 1178/1178 HP. End row: same fightId, result won, newLog
exactly one entry — {d 115, mid strike, w 4, by elif_demir, via
'player', trick null}. The day's other fight (gallowdeer,
world-bump, won) is a separate fightId and carries no wave-4
entry. The join is exact on fightId across all three rows; no
exclusion fallback was needed.

## SENSE-TESTING READ (one feast-draw fight thread + villager spot check)

The strike thread, from this corpus: the scholar of the
winning village feasts on day 115 — her first successful feast
of the run (day 61's feast was refused by the reactor) — and
the cookfire's smoke draws a Strike, a house-sized inflatable
rat, to the haven's edge. She has just fought the gallowdeer
at full health and won, and is bleeding at 52 health when she
walks out to meet it anyway, alone — no villager within joining
distance, as on every other solo day of this seed's late run.
She kills it: one scholar at half health against 1178 health
of rat, and the village wins through the lesser seat the next
day. The draw reads as a real arrival, not a menu: it has a
grant (a real feast, a real multiplier), a night-edge arrival
(the draw row), a choice (faced the same day, while feasted),
and a blow-by-blow fight with a named killer in the log. What
it does not read as is a system the village controls: the
scholar did not choose a Strike. She chose to feast, and the
smoke chose the monster. That is the lottery shape in fiction
terms: the village buys a ticket with a feast and the smoke
draws the beast.
Villager-behavior spot check: villagers barely appear in the
draw fights. Four of five draws were faced solo by the scholar
(100 HP, 100 HP, 100 HP, 52 HP); only the mirror_stag fight
had a villager beside her (gen_ubdx8iv, 100 HP, on the
diverged 73674 seed — and there the scholar was at 66 HP, the
lowest winning health besides the strike). The policy faces
immediately while feasted regardless of health (52 HP, 66 HP)
— brave to the point of reckless, and it worked 4 times out of
5. The one loss (cliffhanger, 73673) is the only draw fight
where the scholar faced a packmate pair alone and lost — the
draw's difficulty is not just the drawn monster but whether it
brings company. Nobody drove a draw off on this band, so the
watch-with-brands beat (the villagers' own response to a draw)
is never seen under this policy — a blank for a drive-off
policy arm, not a verdict about the beat.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the shared band, now on
their current-master trajectories — and two of them are
different villages than the control remembers. The 73675
village that used to win on a last-day feast draw now never
feasts successfully at all (three feasts, all refused by the
reactor) and survives to day 180 at regional rank with 2
people and 200 kcal in the pantry — a village that lived but
never climbed. The 73674 village that used to survive now wins
on the strength of a day-162 feast draw its old self never had.
Feasts themselves are rare: 12 grant attempts across 8 seeds,
5 successful, and 3 seeds never attempted one. The villages
did not lack feasts because they lacked food — the refusals
are the reactor's ceiling, not hunger: where a reactor hums,
the feast's fire never catches, and no draw follows. So the
draw funnel has two gates before it even starts: a village
must feast, and must feast without a reactor online. On this
band, most villages cleared neither gate most of the time.

## WALL NUMBERS (current-base band, judged corpus)

National-ever 6/8, national-final 5/8, table invited 4/8,
entered 4/8, wins 4/8, wave-4 reached 5/8, wave-5 0/8, Arc IV
4/8, median survival 143d, max 180d, deaths 260, starvation 9.
Death-cause shares (of 260): villager combat 162 (62.3% —
'villager combat' 78 + 'combat' 84), player arena 32 (12.3%),
villager sickness 16 (6.2%), expedition 11, starvation 9
(villager 7 + player 2), ambush 5, wound-that-wouldn't-close 5,
villager monster 5, player contest 3, villager alien 3, player
dehydration 3, and 1 each for Bulldozer, Paparazzo, Living
Wire, lockjaw, the night, thirst. The wall stands: wave-5 0/8,
and the only wave-4 veteran on the band came from a feast draw
— the world funnel produced no wave-4 kill on this base either
(nonworldkill wave-4 TB kills: feast-draw 1, all else 0).

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the feast-draw yield on the
  shared band — draws per fresh grant 1.0, faced rate 1.0 (all
  faced-face under this policy), kill rate 0.8, veterans per
  draw 0.2, wave distribution w1 1 / w2 2 / w3 1 / w4 1; the
  73678 strike kill's full grant->draw->face->fight->kill join;
  the refusal census (7/7 reactor, 0 devotion-gate, 0 refresh);
  the cast-veteran vs produced-veteran distinction (3 cast-
  veteran draws, 0 wave-4 kills from them).
- FILLED (mechanism, read from code + corpus): why the draw is
  always faced under this policy (feastFightRoad faces while
  feasted, before any patrol); why a draw can carry a packmate
  (the TB fight builds fighters from the def, packmates included
  — cliffhanger and mirror_stag both fought with a packmate);
  why three seeds show zero grants (no armed feast attempt
  recorded — the recorder sees grant calls, not feast attempts
  that never reach grantFeastBuff, so "never feasted armed" is
  the precise claim, not "never feasted").
- DOCUMENTED, NOT FIXED (named next blanks, below): the
  control-band drift (2/8 seeds moved between nonworldkill-a's
  base and this base; the moving lines are hierarchy.js /
  titans.js notes, unbisected); the unlockedWave-at-draw gap
  (wave-appropriateness unproven per-draw); the unexercised
  branches (drive-off, harness-fallback, unmet-expired — all 0
  under always-face policy); the reactor ceiling as a draw
  gate (7 refusals — a lever question, not a finding).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z, Steve
  rulings pending); the 23% pool wave-3+ bar re-derivation
  (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-feastvet-b (DIAG + lever sketch, same band, same
recorders plus two recorder additions). Pre-registration
sketch: (1) record unlockedWave (or the castMonster wave pool)
at every draw, to prove or disprove wave-appropriate targeting
per draw instead of by distribution alone; (2) run a
drive-off-policy variant (a policy that drives off draws
instead of facing them) to exercise the three unmeasured
branches and price the faced-vs-driven choice (kills forgone
vs health saved); (3) the lever question for the scale wall:
if draws are 1-per-feast and wave-4 is 1-in-5 draws, does any
feast-frequency lever (more feasts, reactor-ceiling relief)
move veterans faster than the world funnel, or is the draw
still a lottery ticket at any feasible feast rate? Rationale:
this arm proved the draw's yield shape but not its targeting
and not its price — the next arm must measure those before
any lever touches feast frequency, or the loops will tune a
funnel whose wave targeting they never verified. Separable
second question for the coordinator (not this arm): re-baseline
the published control band on current master before any arm
judges against it again — the drift documented above is a
standing trap for the next run.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No DIAG-GO leg was re-scored mid-run. The run was judged
exactly against its three pre-registered legs (a) every grant
/ draw / face / decline / feast-draw fight classified,
unclassified 0 (achieved: 0 across all residual classes); (b)
yield rates computed (draws per grant 1.0, faced rate 1.0,
kill rate 0.8, veterans per draw 0.2, wave-4 draws 1 + wave-4
kills 1); (c) the 73678 strike kill's draw row joins to its
grant (achieved with the full fightId join; no exclusion
fallback needed). One gate, stated separately from the legs,
FAILED and is reported as failed: the published-control
reproduction gate. The failure's cause was identified by
evidence (recorder-free baselines on this base reproduce the
armed numbers exactly on both diverged seeds; detgate PASS),
so the census is judged on the current-base corpus and the
control band is reported stale — not silently re-based, and
not claimed as reproduced. Two method notes, neither a
revision: (1) the first draft of the proof tests failed one
check on a test-side bug (synthetic draw rows missing
drawn:true) — fixed in the test, analyzer untouched, 16/16
after; (2) the analyzer's fight join prefers the start row on
or after the face day, falling back to the first candidate —
on this corpus every faced draw has exactly one candidate, so
the preference never decided anything. The telemetry-check
and balanced panel were NOT run, per the standing exception
for recorder rows (panel cannot ingest per-seed recorder
corpora — twelfth sighting, carried). The sweep-compare table
+ analyzer output are the comparison of record. The telemetry
baseline was NOT rolled. No game code changed in this run; no
[needs-eyes] flag applies (DIAG-only, no narration or behavior
added).

## Infrastructure notes

- Sweep: scripts/test-feastdraw-diag-sweep.js (the
  nonworldkill sweep copied with the feastdraw recorder composed
  OUTERMOST in the policy chain; nonworldkill stays outermost
  for startCombat because feastdraw wraps no startCombat
  function). Corpus:
  evidence/2026-10-26/perseed-sim-feastdraw-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/analyze-feastdraw-a.js. Recorder:
  scripts/policies/feastdraw-diag.js. Unit proof:
  scripts/test-feastdraw-a.js (16/16).
- Detgate PASS (seed 73671, recorders OFF = baseline). Baseline
  neutrality proof (seeds 73674, 73675, recorder-free, /tmp
  rows, not committed): armed == baseline on days, won, deaths,
  faced map, kill log, ts counters.
- Commit: sim-feastdraw-a, DIAG-GO (census legs) with CONTROL
  DEVIATED flag, zero src/js diff. Ready for coordinator
  merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).

