# sim-deedtest-a — the Arc IV deed test (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-deedtest-a.
DIAG ONLY — policy-side/instrument only, zero src/js changes, zero
default flips, no changes to any existing policy or recorder file.
New files this run only: scripts/policies/deedtest-diag.js (the deed
recorder), scripts/test-deedtest-sweep.js (the sweep),
scripts/test-deedtest-a.js (unit + det-gate proofs).

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate standing >= 100; wave 5 gate standing >=
  200 AND wave-4 faced; endgame deed gate: deedGateReady() needs
  5/5/4/3/2 distinct fought per wave 1-5, 3+ contests, 3+ crises,
  stage >= 2, food-thesis deeds; the LESSER seat in tableSeat()
  needs w1 >= 4, w2 >= 4, w3 >= 3, 2+ contests, 2+ crises,
  regional+, stage >= 2, food-thesis deeds — w4/w5 are NOT
  lesser-seat bars), src/js/feastBuff.js header + draw/face/
  drive-off/clear methods (feast_draw: on a FRESH armed grant,
  never a refresh — one draw per buff; faceFeastDraw starts
  combat then deletes the draw in a finally, so the
  nonworldkill pre-record still sees s.feastDraw at fight
  start; driveOffFeastDraw deletes s.feastDraw, clears
  pendingEncounter, spends no devotion, the buff stays live
  until its dawn).
- Context read first: evidence/2026-10-26/sim-driveoff-clean-a.md
  (the sharpest case: seed 73678, always-face arm faced the
  Strike on day 115, killed it via player, reached Arc IV,
  sat at the table, won day 116; clean drive-off arm drove
  the Strike off day 115, then met the same Strike in the
  world on day 120, killed it with the same killer via
  world-bump, yet never reached Arc IV or the table and
  lost day 145) and evidence/2026-10-26/sim-rebaseline-a.md
  (authoritative rebaseline reference, comparison ONLY:
  deaths 260, national-ever 6/8, national-final 5/8, table
  4/8, entered 4/8, wins 4/8 lesser seat only, wave-4 5/8,
  wave-5 0/8, Arc IV 4/8, median 143d, starvation 9, raids
  85, raiders 352, pool 1527, pool wave-3+ 132).
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1), 180d death-aware horizon (runDays
  stops on death/win; 180 is the cap, not a fixed horizon).
- TWO ARMS, both fresh in this sweep (never a copied sibling
  corpus, never judged against the stale 234-death band):
  control = tableseat-nowait + feastdraw-diag +
  nonworldkill-diag + deedtest-diag (always-face); clean =
  feastdraw-driveoff-clean (FEASTDRAWCLEAN=1,
  COMPETENT_SEEK_FIGHTS left ON) + the same three
  recorders (every draw driven off, patrol preserved).
  The clean arm is reused verbatim as a diagnostic
  contrast, not a new lever: it is the only arm in which
  a driven-off beast can later be met in the world, so
  the faced-vs-world comparison needs it. If this run's
  control disagrees with the 0126Z rebaseline table, the
  disagreement is reported plainly, never reconciled
  silently.
- THE MECHANISM (read from code, not invented):
  progression.js recordDeedFight(monsterId) is the ONLY
  Arc IV deed counter: it sets deedState().wavesFaced[id]
  = wave, keyed by monster id, first-fight-wins (an
  existing key is never overwritten). It is fed by
  exactly three wraps: (1) _deedWrap('startCombat')
  after — a real new tbfight with a monster fighter
  records its monsterId (fleeing counts, refused
  double-tap counts nothing); (2) _deedWrap
  ('recordWaveKill') — every real kill records its
  monsterId (player TB, villager field/patrol, contest
  kills); (3) the lazy fieldFight wrap — villager
  blow-by-blow outcomes vKill/mFlee/vFlee record the
  monsterId (evade, vDie, alreadyDead record nothing).
  faceFeastDraw calls startCombat(mid), so a faced draw
  feeds the counter through wrap (1) at fight start,
  before any kill. A world-bump fight also starts
  through startCombat (game.js monsterTurn), so it
  feeds the counter through the SAME wrap (1) — on
  paper there is no faced-only counter. A drive-off
  feeds nothing (no fight, no kill, no wrap fires).
  The deed question is therefore empirical, not
  definitional: does the world-bump fight's startCombat
  wrap actually fire (same monster, same killer, day
  120), and if it does, what ELSE was missing on the
  clean arm that the faced arm had by day 116?
  Candidates to check, not assume: the lesser/full
  seat breakdown at Arc IV / at end (contests, crises,
  stage, food deeds, rank — w4 is not a lesser bar),
  standing/scale at the strike fight, and the
  wavesFaced snapshot at the strike fight.
- THE INSTRUMENT (new this run, policy-side only):
  scripts/policies/deedtest-diag.js (DEEDTEST=1).
  It wraps recordDeedFight (every deed-feed call:
  day, monsterId, wave from the def, wasPresent
  before, added by this call, stack names/lines)
  and recordWaveKill (every kill: day, monsterId,
  wave, via arg, wasPresent before, added during
  this call, stack). Pure reads only for the
  pre/post wavesFaced snapshots (direct read of
  scholar.prog.deeds.wavesFaced, never deedState()
  which would create state, never feastedActive() /
  feastDrawPending() which self-clean). No RNG, no
  game-state writes, never throws into the engine.
  Default OFF = byte-identical delegation (det-gate
  pinned in scripts/test-deedtest-a.js).
  Recorders reused verbatim: feastdraw-diag.js
  (FEASTDRAW=1) and nonworldkill-diag.js
  (NONWORLDKILL=1) — their door classification
  (feast-draw / world-bump / tent-intruder /
  door-flee-reengage / glasswing-trap / contest-arena
  / wanderer-pending / policy-direct / direct-build /
  other) is the kill-source taxonomy for leg (a).
- Sweep-side snapshots per seed (no engine change):
  final wavesFaced + deedGateReady() breakdown +
  tableSeat() + scaleRank + integrationStage +
  final waveKillLog; arc4Snapshot at the first
  daily where arc >= 4 (wavesFaced copy + deedGate
  breakdown + tableSeat + rank + day). National-ever
  is reported BOTH ways: the daily-snap definition
  (maxRank >= national, comparable to prior runs)
  AND the seat-leg definition (snap OR
  ctx.tsNationalDay present — transient-national
  instrument note from driveoff-clean-a).
- PRIMARY METRIC: the deed attribution census on
  identical seeds — every feast-draw beast kill
  classified by source, deed-counter movement
  attributed per kill source, the 73678 pair
  reproduced or explained.
- GO RULE (DIAG-GO, legs (a)-(d) ALL required):
  (a) every feast-draw beast kill on the band is
  classified by source — faced-draw fight,
  world-bump fight, or other TB origin (trap / tent
  intruder / door-flee re-engage / contest-arena /
  other, named); a feast-draw beast kill with door
  'other' or 'direct-build' breaks the leg;
  (b) Arc IV deed-counter movement is attributed per
  kill source, with the code path cited (startCombat
  wrap / recordWaveKill wrap / fieldFight wrap, or
  'no movement' with the reason);
  (c) the 73678 case is reproduced in this sweep's
  fresh arms (control faces the Strike and wins, or
  clean drives it off and world-bump-kills it) or
  explicitly explained if it does not reproduce
  (trajectory divergence named, not hand-waved);
  (d) a plain-words answer: does a faced draw feed
  an Arc IV deed counter that a world-bump kill
  does not — yes, no, or no such counter exists
  (with the code citation either way).
- GUARDRAILS (diagnostic, reported not
  verdict-flipping): starvation, median survival,
  national-ever, wins on control vs clean.
- VERDICT MAPPING (fixed now): legs (a)-(d) all met
  = DIAG-GO — the deed question is answered on
  measured evidence, whatever the answer is (a 'no,
  the counter is shared' answer is a GO for the
  diagnostic). Any leg missed = DIAG-NO-GO
  (mechanism failed, not a design verdict). Do NOT
  re-judge any prior corpus. Do NOT lower the bar
  mid-run; if the metric proves wrong, write it
  under "metric review" below for the NEXT run.
- Definitions (fixed before sweeping): FEAST-DRAW
  BEAST KILL = a waveKillLog entry whose monsterId
  matches a spawned draw's monsterId on the same
  seed, joined to a TB kill (nonworldkill tbKills)
  or a field/contest kill (waveKillLog entry with
  no matching TB kill). DEED MOVEMENT for a kill =
  the first added=true recordDeedFight event for
  that monsterId in the run; 'added-at-this-fight'
  if that event's day equals the fight's start day,
  'already-before' if earlier, 'added-later' if
  later, 'never' if none. WORLD-BUMP = nonworldkill
  door 'world-bump' (initiator monsterTurn). FACED
  DRAW = feastdraw outcome faced-face or
  faced-harness.
- SENSE plan: (1) quote the 73678 strike deed trace
  on both arms (draw day, decision, fight start,
  deed event day, kill day, wavesFaced before/after);
  (2) read one transcript around a faced draw kill
  and one around the clean-arm world-bump kill from
  the sweep's captured say-lines, judging whether
  the fiction marks any difference between the two
  meetings with the same beast.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics
  bind the run — a miss is NO-GO, never re-scored
  against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js
  cannot ingest per-seed recorder corpora (known
  limitation, carried) — the sweep-compare table +
  analyzer output are attached instead; do NOT run
  telemetry-check on recorder rows (its counts are
  wrong on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — the deed question is answered on measured evidence

- Leg (a) MET: every feast-draw beast kill classified by source.
  Control arm: 4 feast-draw kills, all door feast-draw, all
  deed added-at-this-fight (buffering d60, memory_projector
  d67, mirror_stag d162, strike d115). Clean arm: 0
  feast-draw kills (10 draws, all driven off) — nothing to
  classify, and the feastdraw analyzer's unclassified residual
  is 0 on both arms (no unmatched faces, driveoffs, or starts;
  no null-wave draws). Feast-draw kills unclassified: 0/4
  control, 0/0 clean.
- Leg (b) MET: deed-counter movement attributed per kill source,
  code path cited. The deed counter is progression.js
  recordDeedFight (wavesFaced, first-fight-wins), fed by three
  wraps: startCombat (progression.js _deedWrap, after a real
  new tbfight), recordWaveKill (same file, every real kill),
  and fieldFight (lazy wrap, vKill/mFlee/vFlee only). The
  deedtest recorder (scripts/policies/deedtest-diag.js) logs
  every recordDeedFight call with wasPresent/added and its
  stack, and every recordWaveKill call with via. Band deed
  attribution (TB kills by door, deed status): control —
  feast-draw 4/4 added-at-this-fight, world-bump 6
  added-at-this-fight + 35 already-before, contest-arena 26
  added + 16 already-before, wanderer-pending 7
  already-before; clean — world-bump 10 added + 47
  already-before, contest-arena 26 added + 25
  already-before, wanderer-pending 7 already-before.
  Field kills (waveKillLog entries with no TB kill): 92
  control, 90 clean, each joined to its first-added deed
  event the same way.
- Leg (c) MET: the 73678 case reproduced in both fresh arms,
  trajectory for trajectory. Control: faced the Strike day
  115, killed it (elif_demir, via player), won day 116.
  Clean: drove the Strike off day 115, met it in the world
  day 120, killed it (same killer, via player, door
  world-bump), lost day 145. Deaths match driveoff-clean-a
  exactly (control 34, clean 48).
- Leg (d) MET — the plain-words answer, with the code citation:

  NO. A faced draw does NOT feed an Arc IV deed counter that
  a world-bump kill does not — because there is no such
  faced-only counter. The wavesFaced counter
  (progression.js recordDeedFight) is fed by the SAME
  startCombat wrap whether the fight starts from
  faceFeastDraw or from a world-bump (game.js monsterTurn):
  on clean 73678 the world-bump Strike fight added
  wavesFaced[strike] = 4 on day 120, through the identical
  stack (startCombat wrap -> recordDeedFight, added=true,
  wasPresent=false), and the kill then recorded as a dup —
  exactly as the faced fight did on day 115 on control.
  Killing the beast is not the deed, and facing the draw is
  not the deed either — not in the wavesFaced sense. The
  deed the faced fight banks, that the world-bump kill
  cannot, is a DIFFERENT deed, and it is the one that
  actually decided 73678:

  THE FEAST-SPEND DEED (feastSurgeUsed). The lesser seat's
  food-thesis bar is sentimentTaught AND feastSurgeUsed
  (tableSeat(), deedGateReady()). feastSurgeUsed is set by
  _spendFeastedPower (feastBuff.js) only when a feasted blow
  lands in real TB combat while the feast is live ("a feast
  that warms no blades marks nothing and spends nothing").
  Measured on 73678 with the feastdeed recorder
  (scripts/policies/feastdeed-diag.js, follow-up runs
  s73678-control-feastdeed.json / s73678-clean-feastdeed.json):
  - Control: sentiment taught day 13; the faced Strike fight
    day 115 marks the spend (first combat spend of the run:
    preSurge false -> postSurge true, buff used true),
    foodDeeds true, lesser seat, table set day 116, win.
  - Clean: sentiment taught day 13 (same); _spendFeastedPower
    NEVER CALLED in the whole run — zero spend events, zero
    marked — feastSurgeUsed false, foodDeeds false, seat none,
    Arc III, lost day 145.
  The clean village's final deed sheet beats the control's
  on every other lesser bar (waves 18/10/6/4 vs 16/10/6/1,
  contests 18 vs 15, crises 4 vs 4, rank global vs national,
  stage 3 vs 3) — foodDeeds is the ONLY failing bar. The
  world-bump kill on day 120 happens with no live feast
  buff, so it cannot spend; patrol/field fights never call
  the spend path at all (zero calls on the whole clean run,
  despite 30 patrol sweeps on the band). The faced draw
  fight is, by construction, a TB fight INSIDE the feast
  window — it is the reliable feast-spend, not a lottery
  ticket and not a wavesFaced entry. Drive-off does not
  block Arc IV in general: clean 73673 reached Arc IV and a
  lesser seat (table invited) with foodDeeds true — some
  other feasted TB fight banked its spend. What drive-off
  costs, when the faced fight was the run's only feasted
  TB fight, is the spend deed and therefore the seat.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| arm | won | median | natEver | natEverSeat | natFinal | table | entered | arc4 | wave3 | wave4 | wave5 | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face) | 4/8 | 143d | 6/8 | 6/8 | 5/8 | 4/8 | 4/8 | 4/8 | 8/8 | 5/8 | 0/8 | 9 | 260 |
| clean drive-off (patrol on) | 0/8 | 180d | 5/8 | 6/8 | 3/8 | 1/8 | 0/8 | 1/8 | 8/8 | 6/8 | 0/8 | 11 | 295 |

The control band reproduces the 0126Z rebaseline table EXACTLY
(deaths 260, national-ever 6/8, national-final 5/8, table 4/8,
entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
median 143d, starvation 9) and the clean band reproduces
driveoff-clean-a exactly (deaths 295, starvation 11, wins 0,
table invited 1/8, entered 0/8, Arc IV 1/8, median 180d).
No disagreement to reconcile: the deed recorder changed no
trajectory. National-ever under the seat-leg definition
(snap OR tsNationalDay) is 6/8 on BOTH arms — clean 73673's
transient national (tsNationalDay present, daily snap
regional) is the driveoff-clean-a instrument note, confirmed
again here.

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | draw kills | wave-4 draws | wave-4 draw kills |
|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 |
| clean | 22 (10/0/12) | 10 | 0 | 10 | 0 | 4 | 0 |

Control draws: buffering w3 d60 faced+kill, memory_projector
w2 d67 faced+kill, cliffhanger w1 d38 faced+lost, mirror_stag
w2 d162 faced+kill, strike w4 d115 faced+kill. Clean draws:
buffering d60, spool d67, voice_mimic_radio d74, bright_idea
d81, suburb w4 d88, eater w4 d178, cliffhanger d38,
mirror_stag d162, herald w4 d172, strike w4 d115 — all
driven off. Refreshed = 0 on both arms, as before.

Per-seed, control -> clean (days/won/arc/rank/table/entered/
starv/deaths/foodDeeds/seat):

| seed | control | clean |
|---|---|---|
| 73671 | 180d, arc 3, regional, 0/0, 0 starv, 31 deaths, foodDeeds false, none | IDENTICAL (180d, 31, 0 starv, foodDeeds false) |
| 73672 | won d97, arc 4, global, 1/1, 0 starv, 25 deaths, foodDeeds true, lesser | 180d, arc 3, global, 0/0, 0 starv, 31 deaths, foodDeeds false, none |
| 73673 | won d124, arc 4, global, 1/1, 0 starv, 28 deaths, foodDeeds true, lesser | lost d129, arc 4, regional, 1/0, 0 starv, 40 deaths, foodDeeds true, lesser |
| 73674 | won d163, arc 4, global, 1/1, 0 starv, 30 deaths, foodDeeds true, lesser | 180d, arc 3, regional, 0/0, 0 starv, 33 deaths, foodDeeds false, none |
| 73675 | 180d, arc 3, regional, 0/0, 4 starv, 38 deaths, foodDeeds false, none | IDENTICAL (180d, 38, 4 starv, foodDeeds false) |
| 73676 | lost d70, arc 3, regional, 0/0, 4 starv, 31 deaths, foodDeeds false, none | IDENTICAL (lost d70, 31, 4 starv, foodDeeds false) |
| 73677 | lost d143, arc 3, national, 0/0, 0 starv, 43 deaths, foodDeeds false, none | IDENTICAL (lost d143, 43, 0 starv, foodDeeds false) |
| 73678 | won d116, arc 4, national, 1/1, 1 starv, 34 deaths, foodDeeds true, lesser | lost d145, arc 3, global, 0/0, 3 starv, 48 deaths, foodDeeds false, none |

Band-level pattern (all 16 rows): Arc IV ⟺ foodDeeds true,
with no exceptions. Every Arc IV seed (control 73672/73/74/78,
clean 73673) has foodDeeds true; every non-Arc IV seed has
foodDeeds false. The four no-draw seeds are identical
trajectories between arms (73671/75/76/77: days, deaths,
starvation, deed-event counts equal) — the deed recorder
and the clean policy move nothing when no draw exists.
Control 73677 is the mirror of clean 73678: waves 17/11/4,
contests 17, crises 4, rank national, stage 3 — and foodDeeds
false is its ONLY failing lesser bar, with no draw anywhere
in its run. The feast-spend deed is banked only by feasted
TB combat, and many villages never get one: foodDeeds false
on 4/8 control seeds and 7/8 clean seeds. The draw fight is
the reliable spend because it happens inside the feast
window by construction.

Residual, named (not a leg break): one TB kill per arm is
door direct-build (73674 day 113, giant_mosquito, by
nadia_khoury, via companion — a companion fight built
without startCombat, so no start row exists and its deed
status reads added-unknown-day). Its deed movement IS
attributed: the monster's first-added deed event is day 88
via the fieldFight wrap (expeditionMonster). It is not a
feast-draw kill, so leg (a) is unaffected; other = 0 on both
arms.

## THE 73678 DEED TRACE (both arms, from the recorders)

Control: grant d115 -> draw strike w4 d115 -> faceFeastDraw
d115 -> startCombat wrap deed event d115 (wasPresent false,
added true, stack startCombat -> recordDeedFight) -> kill
d115 (elif_demir, via player, door feast-draw, deed
added-at-this-fight) -> recordWaveKill wrap deed event d115
(dup, wasPresent true) -> feast-spend marked d115
(preSurge false -> postSurge true) -> table set (lesser
seat) d116 -> win d116. Final deedGate: waves false (w5
0/2 — the FULL seat is not met; the lesser seat is what
fires), contests/crises/stage/foodDeeds true, seat lesser.

Clean: grant d115 -> draw strike w4 d115 -> drive-off d115
(no fight, no deed event, no spend) -> world-bump fight
d120 -> startCombat wrap deed event d120 (wasPresent false,
added true, SAME stack as control's day-115 event) -> kill
d120 (elif_demir, via player, door world-bump, origin
world-origin, deed added-at-this-fight) -> recordWaveKill
wrap deed event d120 (dup) -> NO spend event at any point
in the run -> final deedGate: every lesser bar true
EXCEPT foodDeeds false (waves 18/10/6/4, contests 18,
crises 4, rank global, stage 3), seat none, Arc III, lost
d145. The wavesFaced entry the case was about landed on
day 120 anyway; the seat was lost on the spend, not the
entry.

## METRIC REVIEW

- Pre-registered metrics bound the run and were judged as
  written: legs (a)-(d) all met, DIAG-GO. No metric was
  re-scored mid-run.
- One metric refinement for the NEXT run (not applied here):
  leg (a)'s "every feast-draw beast kill" should explicitly
  include field/contest kills of a drawn beast, not just TB
  kills — this band had none (all draw kills were TB), so
  the leg stands, but a future band with a patrol-killed
  draw beast would need the field-join rule stated up
  front. The analyzer already joins field kills to deed
  events; the pre-registration should say so.
- The summary's candidate-answer rule (world-bump deed
  status) agreed with the full analysis, but the full
  answer required the feastdeed follow-up: the
  pre-registered question ("does a faced draw feed a deed
  counter a world-bump kill does not") is answered NO for
  wavesFaced, and the deciding deed turned out to be a
  second counter (feastSurgeUsed) the pre-registration named
  only as part of the seat breakdown. Future deed-test
  pre-registrations should name BOTH counters up front:
  wavesFaced AND feastSurgeUsed, with a spend recorder
  from the start.
- Balanced-panel note (carried): scripts/balance-panel.js
  cannot ingest per-seed recorder corpora; the
  sweep-compare table + analyzer output are attached
  instead. Telemetry-check was NOT run on recorder rows.
- Instrument note (carried from this run's own failures,
  for the next run's author): the write flap hit this run
  hard — a sim process that fails one regular-file write
  keeps failing every direct write (20/20 EPERM) and every
  spawned child's file write (EPIPE), while fresh processes
  write fine in between. Same-process retries are futile.
  What worked: --one-print mode (the sim process prints
  the row JSON to stdout — pipe writes still work in a
  flap-poisoned process — and a sibling cat spawned by the
  calling shell writes the file). Future sweeps should
  default to the print+pipe pattern for per-seed rows and
  summaries. Three 73671-control sims were lost to the flap
  before the pattern landed; the final corpus used the
  pattern for all 16 rows.

## SENSE-TESTING READ

- Control 73678, day 115: the draw line ("Face it while the
  feast is in you") is followed the SAME day by "The table
  is being set — a lesser seat, priced for what you built."
  The fiction ties the faced fight to the table immediately
  — and the measurement says the tie is the spend, not the
  kill: the table comes because the feast was spent in the
  fight, not because the Strike died.
- Clean 73678, day 115: the same draw line, then the
  drive-off line ("The devotion stays armed; the feast's
  fire still burns in you"). The promise is never redeemed:
  the armed devotion expires unspent — zero spend calls in
  the whole clean run — and the day-120 world-bump kill
  happens after the fire is out, so it cannot spend it.
  The drive-off narration is honest about the refusal and
  misleading only in its reassurance: "stays armed" reads
  as "you lose nothing," but the armed window is the only
  window in which the spend deed can be banked, and this
  village never gets another one. No [needs-eyes] flag:
  no narration was added or changed by this policy-only
  arm; the finding is about what existing lines imply, not
  about new text.
- The clean 73673 counterpoint reads coherently: a village
  that drives off its draw but banks its spend elsewhere
  still sits at the table (invited, lesser seat). The
  fiction never claims the draw is the only spend — only
  that it is a spend. That is exactly what the numbers say.

## VILLAGE ASSESSMENT (plain words)

Four villages never met a draw under either policy and lived
identical lives — the question never touched them (73671,
73675, 73676, 73677: same days, same deaths, same deed
counts on both arms). Of the four that did: 73672's
always-face village won on day 97 off two faced draws; its
drive-off twin turned away six beasts, lived to day 180 at
global rank, and never sat at the table — it survived by
declining, and declining cost it the spend. 73673 is the
exception that proves the mechanism: its drive-off village
still reached Arc IV and was invited to the table, because
it banked its feast-spend somewhere else. 73674's
always-face village won on day 163; its drive-off twin
lived to 180 at regional and never sat down. And 73678 is
the sharpest case, now with the mechanism named: the
drive-off village met the same beast five days later,
killed it with the same killer, fought its way to global
rank with more deeds on paper than its winning twin — and
never sat at the table, because the one deed that mattered
was never the Strike's name in a list. It was the feast,
spent in the fight, on the night the feast was lit. The
village that ate together and fought together sat down.
The village that ate together and sent the beast away with
brands never spent the fire, and the fire went out.

## WALL NUMBERS

- Control: national-ever 6/8 (seat-leg 6/8), national-final
  5/8, table invited 4/8, entered 4/8, wins 4/8 (lesser seat
  only), wave-3 8/8, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
  median survival 143d, deaths 260, starvation 9.
- Clean: national-ever 5/8 (seat-leg 6/8), national-final
  3/8, table invited 1/8, entered 0/8, wins 0/8, wave-3 8/8,
  wave-4 6/8, wave-5 0/8, Arc IV 1/8, median survival 180d,
  deaths 295, starvation 11.
- The scale wall is unchanged by this diagnostic: wave-5
  stays 0/8 on both arms, and the full seat (5/5/4/3/2
  waves, w5 2) is met by no seed. The wall's binding bar on
  this band is not wavesFaced — it is the feast-spend deed
  (foodDeeds false on 4/8 control, 7/8 clean seeds) and,
  behind it, wave-5 facing (w5 0 on every seed's final
  sheet). The next arm should attack the spend deed's
  rarity (why so many villages never bank a feasted TB
  fight) and the wave-5 facing gap, not the draw decision.

