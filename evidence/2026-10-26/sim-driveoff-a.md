# sim-driveoff-a — price the face/decline choice (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, run fleshout-20261026T0126Z, arm sim-driveoff-a.
POLICY-SIDE ONLY — zero src/js changes, zero default flips, no changes to any existing policy file.
This arm designs and lands NO game fix. Pricing the choice IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100), src/js/feastBuff.js
  header + draw/face/drive-off/clear methods (feast_draw: on a FRESH
  armed grant, never a refresh — one draw per buff — the feast's smoke
  draws a wave-appropriate scavenger as a pending encounter the player
  faces via faceFeastDraw or declines via driveOffFeastDraw; the draw
  dies with the buff; drive-off spends no devotion and the buff stays
  live until its dawn).
- Context read first: evidence/2026-10-26/sim-feastdraw-a.md (the
  0017Z run's next blank (2): feast-draw yield measured ONLY under an
  always-face policy — 12 grants (5 fresh, 7 reactor-refused), 5 draws
  spawned, 5 faced same-day, 0 driven off, kill rate 0.8, veterans per
  draw 0.2, wave-4 draws 1 / kills 1 — all yield rates CONDITIONAL on
  always-face; the drive-off/fallback/unmet-expired branches
  unexercised) and scripts/policies/feastdraw-diag.js (the recorder
  header: the harness fallback faces still-pending encounters via
  startCombat directly, so a policy that merely leaves draws pending
  gets them faced, not driven off).
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
  180d death-aware horizon (runDays stops on death/win; 180 is the
  cap, not a fixed horizon).
- Own control side, run here on current master (worktree base
  8ea64d848, which contains the feastdraw-a merge): the control arm
  is tableseat-nowait + feastdraw-diag + nonworldkill-diag recorders
  ONLY (the 0017Z sweep's other five recorders are not needed for
  this question and are omitted — recorder neutrality was proven
  there, and both arms here carry the identical recorder set, so
  any recorder effect cancels). NEVER copy the sibling rebaseline
  arm's corpus, NEVER judge against the published control band
  (proven stale in feastdraw-a: current-base deaths 260 vs
  published 234, national-ever 6/8 vs 7/8, median 143d vs 135d). If
  this run's control side disagrees with any sibling table, the
  disagreement is reported plainly, never reconciled silently.
- New this run, policy-side only: scripts/policies/feastdraw-driveoff.js
  (FEASTDRAWDRIVEOFF=1). It wraps tableseat-nowait: upkeep pre-check
  drives off a pending draw before the base upkeep can face it, and
  the harness's policy.pending hook drives off every draw at
  driveContests time (the explicit-bot-choice slot before the
  fallback). Default OFF = tableseat-nowait exactly (det-gate
  pinned). COMPETENT_SEEK_FIGHTS=0 on the drive-off arm ONLY:
  feastFightRoad faces the draw inside competent.upkeep (grant and
  face in one upkeep call), so the only policy-side way to keep a
  draw alive long enough to decline it is to stop feastFightRoad
  from facing. CONFOUND, STATED NOW: SEEK_FIGHTS=0 also skips
  feastFightRoad's feasted patrol sweeps. The drive-off arm's delta
  is (draws driven off) + (no feasted patrol); the per-draw funnel
  stays clean because nonworldkill classifies patrol fights under
  other doors, never feast-draw. The cost bar below judges the
  combined posture, honestly labeled.
- Recorders reused verbatim (policy-side only, never edited):
  scripts/policies/feastdraw-diag.js (FEASTDRAW=1) and
  scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1). The
  feastdraw analyzer's outcome precedence (driven-off >
  faced-face > faced-harness > unmet-expired > unmet-other) is
  reused unchanged; a driven-off draw with a harness-fallback
  start row would surface as a fight join on a driven-off
  outcome, counted explicitly in the summary (drivenOffWithFight).
- PRIMARY METRIC: the feast-draw funnel effect under drive-off vs
  always-face on identical seeds — draws driven off / draws
  spawned, veterans produced via feast-draw, wave-4 kills via
  feast-draw, and whether driving off changes subsequent grants
  (for each driven-off draw, the next grant on that seed after
  the draw day: fresh vs refresh — mechanism predicts refresh,
  because drive-off spends no devotion and the buff stays live;
  the data, not the mechanism, decides).
- GO RULE (ALL required): (a) every spawned draw on the drive-off
  arm is classified, unclassified 0; (b) driven-off rate 1.0 —
  every spawned draw driven off, 0 faced on the drive-off arm;
  (c) harness-fallback fights for driven-off draws = 0 AND
  driven-off draws carrying a fight join = 0 (no phantom pending
  encounter, no fallback fight); (d) recorder errors 0 on both
  recorders, both arms; (e) per-draw phantom checks (policy
  post-reads after each drive-off: pendingEncounter false AND
  s.feastDraw gone) all clean.
- COST BAR (the scalemetric deciding bar from prior rounds,
  drive-off arm vs own control arm): starvation deaths (drive-off)
  <= starvation deaths (control) + 2 on the band total AND no
  single seed exceeding its control same-seed starvation by more
  than 2; median survival (drive-off) >= 0.8 x median survival
  (control); wins (drive-off) >= wins (control) - 1; national-ever
  (drive-off) >= national-ever (control) - 1. A cost-bar miss
  with funnel legs (a)-(e) met = NO-GO for "drive-off is free":
  the price is measured and reported, not claimed as zero.
  A funnel-leg miss = NO-GO regardless of cost numbers.
- Definitions (fixed before sweeping, analyzer header repeats
  them): same as feastdraw-a (GRANT / FRESH / REFRESH / REFUSED /
  DRAW SPAWNED / outcome precedence / FACED / KILL RATE /
  VETERANS PER DRAW). Added here: DRIVEN-OFF RATE = driven-off
  outcomes / spawned draws on the drive-off arm. FALLBACK FIGHT
  FOR A DRIVEN-OFF DRAW = a nonworldkill feast-draw start row
  whose (feastDraw.monsterId, feastDraw.day) matches a
  driven-off draw's (monsterId, day), or a driven-off outcome
  carrying a fightId join. PHANTOM = a policy post-check with
  pendingEncounter true OR s.feastDraw still present after a
  drive-off that returned ok:true.
- SENSE plan: (1) quote at least one draw's full decision trace
  (grant -> draw -> drive-off rows + policy post-check) proving
  no phantom; (2) read one transcript around a driven-off draw
  from the sweep's captured say-lines (does the game narrate
  the refusal sensibly — the watch with brands — or does the
  draw silently vanish?).
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep-compare table + analyzer output are attached instead; do
  NOT run telemetry-check on recorder rows (its counts are wrong
  on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: NO-GO (funnel priced, cost bar missed) — driving off every draw is NOT free

- Funnel legs (a)-(e) ALL MET: unclassified 0; driven-off rate
  22/22 = 1.0, faced 0 on the drive-off arm; harness-fallback
  fights for driven-off draws 0; driven-off draws carrying a
  fight join 0; per-draw phantom checks 22/22 clean; recorder
  errors 0 on both recorders, both arms. Corpus PASS.
- Cost bar: starvation 9 vs 9+2 PASS; per-seed starvation excess
  0 PASS; median 180d vs 0.8x143d = 114.4d PASS; national-ever 5
  vs 6-1 = 5 PASS — but WINS 0 vs 4-1 = 3 FAIL. By the
  pre-registered header that is NO-GO for "drive-off is free":
  the price is measured (below), not zero, and not hidden.
- Unit proof: scripts/test-driveoff-a.js 27/27. Live det-gate:
  PASS (seed 73671, policy-off == plain tableseat-nowait:
  days 180/180, gameDays 181/181, tsNationalDay 77/77, no ctx
  fd surface, no wraps installed).

## CONTROL-AGREEMENT NOTE (no disagreement to reconcile)

This run's own control side reproduces feastdraw-a's
current-base band EXACTLY on all 8 seeds — days, outcomes,
deaths, grants, draws (73671: 180d survived / 31 deaths /
0 grants; 73672: won d97 / 25 / 2 draws; 73673: won d124 / 28 /
1 draw; 73674: won d163 / 30 / 1 draw; 73675: 180d survived /
38 / 0 fresh; 73676: lost d70 / 31 / 0 grants; 73677: lost
d143 / 43 / 0 grants; 73678: won d116 / 34 / 1 draw + wave-4
kill). The 2-recorder composition here is trajectory-neutral
against feastdraw-a's 7-recorder composition. The sibling
rebaseline arm's corpus was never used; had it disagreed, it
would be reported here — it does not need to be, because
this control agrees with feastdraw-a.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| arm | won | median | natEver | natFinal | table | entered | wave4 | wave5 | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face) | 4/8 | 143d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 9 | 260 |
| drive-off (every draw) | 0/8 | 180d | 5/8 | 2/8 | 0/8 | 0/8 | 6/8 | 0/8 | 9 | 307 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | kills | wave-4 draws | wave-4 kills | vet/draw |
|---|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 | 0.2 |
| drive-off | 30 (22/0/8) | 22 | 0 | 22 | 0 | 12 | 0 | 0.0 |

Drive-off wave distribution: w1 2, w2 4, w3 4, w4 12.
Control wave distribution: w1 1, w2 2, w3 1, w4 1.
Refusals on both arms are the fusion-reactor ceiling (the
grant rows carry the reactor refusal text; no devotion-gate
refusal appears on either arm). Refreshed = 0 on BOTH arms:
no re-feast inside a live buff window happened anywhere on
this band, under either policy — the refresh branch stays
unexercised here, same as in feastdraw-a.

Per-seed, control -> drive-off:

| seed | control | drive-off | draws flipped |
|---|---|---|---|
| 73671 | 180d survived, 31 deaths, 0 grants | IDENTICAL | none (no draws either arm) |
| 73672 | won d97, 25 deaths, 2 draws faced, 2 kills | 180d survived, 34 deaths, 17 draws driven off (10 w4) | buffering w3, then a 7-day feast cadence to d180 |
| 73673 | won d124, 28 deaths, 1 draw faced+lost | lost d118, 42 deaths, 1 draw driven off | cliffhanger w1 (the fight control lost) |
| 73674 | won d163, 30 deaths, 1 draw faced+kill | 180d survived at global, 36 deaths, 1 draw driven off | mirror_stag w2 (the kill control won on) |
| 73675 | 180d survived, 38 deaths, 3 refused | IDENTICAL | none (no draws either arm) |
| 73676 | lost d70, 31 deaths, 0 grants | IDENTICAL | none |
| 73677 | lost d143, 43 deaths, 0 grants | IDENTICAL | none |
| 73678 | won d116, 34 deaths, 1 draw faced+wave-4 kill | lost d169, 52 deaths, 3 draws driven off (2 w4) | strike w4, voice_mimic_radio w2, influencer w4 |

The four no-draw seeds are byte-identical trajectories
between arms (same days, deaths, grants) — the drive-off
policy + SEEK_FIGHTS=0 changes NOTHING when no draw exists,
so the divergence on the other four seeds is the draw
decision (plus the feasted-patrol confound, stated in the
pre-registration), not policy noise.

## THE ANSWER, FIRST (plain words)

Driving off a feast draw is a real, narrated refusal — the
watch meets the beast with brands and it melts back into the
dark, no phantom left behind, no fallback fight. But on this
band it costs the game. The villages that faced their draws
won four times; the villages that drove off every draw won
zero times, reached the table zero times, and died more
(307 deaths vs 260) without starving any more (9 vs 9).
The reason is not one forgone fight. Under always-face the
draw stream stops early — the village wins, or the arming
is spent — so feastdraw-a saw only 5 draws. Under
drive-off the arming is never spent, so a village that
feasts weekly draws weekly: 73672 drew 17 times, every 7
days, 10 of them wave-4 monsters, and drove off all 10.
The draw is not a fixed lottery ticket. The cast is
threat-rated by standing, so a high-standing village's
draws are mostly wave-4 — and driving them off forfeits
the veteran pipeline itself. The price of declining the
draw is the whole stream, and on this band the stream was
the win.

## SUBSEQUENT GRANTS — THE MECHANISM PREDICTION WAS WRONG (data decides)

Pre-registration predicted a driven-off draw would make the
next grant a REFRESH (buff stays live, devotion unspent).
The data says FRESH: of the 20 driven-off draws with a
later grant on the same seed, 19 are followed by a fresh
grant (73672: 16/16 fresh, one per weekly feast; 73678: 2/2
fresh; 73673: the next grant is reactor-refused; 73674:
no later grant). Villages re-feast ~7 days later, after
the 2-dawn buff expired — so every re-feast is fresh and
draws again. Drive-off does NOT choke the draw stream; it
sustains it, because the arming is never spent. Under
always-face the comparison is truncated (73672's stream
ends at the d97 win; 73673/73674/73678 have no later
grant after their faced draw at all). The refresh branch
is therefore still unmeasured on this band — it needs a
village that re-feasts inside a live window, which neither
policy produced here.

## SENSE-TESTING READ (decision trace + transcript, no phantom, no silent vanishing)

The 73672 day-60 trace, in full: grant row d60 (granted
true, refreshed false, mult 2.03, quality 1, drawMonsterId
buffering, preDraw null) -> draw row d60 (drawn true,
buffering, veteran false, wave 3, grantIdx 0) -> drive-off
row d60 (ok true, drivenOff true, preDraw buffering d60)
-> policy post-check d60 (where pending, post
pendingEncounter false, pendingMonsterId null, feastDraw
null, phantom false). No feast-draw start row matches the
buffering/d60 key on the drive-off arm (fallback 0,
drivenWithFight 0 across all 22 draws). The draw leaves
no phantom pending encounter anywhere in the corpus.
The transcript around it, from the sweep's captured
say-lines (73672, day 60): "The cookfire's smell carried
further than the laughter did — smoke and grease on the
night wind. Buffering is circling the edge of the light.
It followed the feast here. (A scavenger, drawn by the
feast. Face it while the feast is in you — or let the
watch drive it off.)" — then, same day: "Divya takes up a
brand and Enrique follows — they meet it at the edge of
the light with noise and fire. Buffering was never brave.
It melts back into the dark. (The watch drove off the
feast's scavenger. The devotion stays armed; the feast's
fire still burns in you.)" The refusal is narrated with
named villagers, a specific action, and an honest
consequence line — the draw does not silently vanish.
The 73678 strike refusal reads the same way, with
sharper irony: "Miguel takes up a brand and Elena
follows… The Strike was never brave. It melts back into
the dark." The villagers cannot know they just turned
away the beast that, under always-face, became the
band's only wave-4 veteran and the village's win — and
the fiction never claims they do. That ignorance is
honest, not a narration gap: the draw's wave is never
shown to the player, so declining is a blind choice in
both directions. No [needs-eyes] flag: no narration was
added or changed by this policy-only arm, and the
existing drive-off lines read coherently.
One display note (not a gap): the 73672 day-67 draw row
carries monsterId mirror_stag while its say-line calls
the beast "Grief Counselor" — monsterId vs display name,
the same mapping the face path uses; the recorder joins
on monsterId, so nothing misclassifies.

## VILLAGE ASSESSMENT (plain words)

Four villages never met a draw under either policy and
lived identical lives — the drive-off question never
touched them. Of the four that did: 73672 became a
weekly-feasting village that turned away seventeen
beasts, ten of them wave-4, and lived to day 180 at
regional rank without ever climbing — a village that
survived by declining everything, and declined its way
out of the win. 73674 kept its global rank and survived
to 180, but without the mirror_stag kill it never sat
at the table. 73673 dodged the one fight it would have
lost (cliffhanger) and still died six days before its
always-face self won, with 14 more deaths — dodging the
draw did not dodge the village's fate. 73678 is the
sharpest case: it drove off the Strike, then two more
draws, and died on day 169 with 52 deaths, where its
always-face self won on day 116. Driving off buys
health on the night — no feast-draw fight, no
feast-draw wound — and spends the village's future.
The wall numbers say the same: wave-5 0/8 on both arms,
and the drive-off arm's wave-4 reach (6/8) is higher
only because 73673's divergent path unlocked wave 4
without ever converting a draw into a veteran.

## WALL NUMBERS

Control: national-ever 6/8, national-final 5/8, table
invited 4/8, entered 4/8, wins 4/8, wave-4 reached 5/8,
wave-5 0/8, Arc IV 4/8, median survival 143d, max 180d,
deaths 260, starvation 9. Death-cause shares (of 260):
villager combat 162 (62.3% — 'villager combat' 78 +
'combat' 84), player arena 32 (12.3%), villager sickness
16 (6.2%), expedition 11, starvation 9 (villager 7 +
player 2), ambush 5, wound-that-wouldn't-close 5,
villager monster 5, player contest 3, player dehydration
3, villager alien 3, and 1 each for Bulldozer,
Paparazzo, Living Wire, lockjaw, the night, thirst.
Drive-off: national-ever 5/8, national-final 2/8, table
0/8, entered 0/8, wins 0/8, wave-4 reached 6/8, wave-5
0/8, median survival 180d, max 180d, deaths 307,
starvation 9. Death-cause shares (of 307): villager
combat 182 (59.3% — 'villager combat' 74 + 'combat'
108), player arena 47 (15.3%), villager sickness 16
(5.2%), expedition 15, starvation 9 (villager 7 +
player 2), wound-that-wouldn't-close 6, villager
monster 6, ambush 5, player dehydration 5, villager
alien 5, player contest 4, the night 2, and 1 each for
Bulldozer, lockjaw, Paparazzo, Living Wire, thirst.
The wall stands on both arms: wave-5 0/8, and the
drive-off arm produced zero wave-4 veterans from draws
against the control's one.

## BLANKS FILLED OR DOCUMENTED

- FILLED (priced, with numbers): the face/decline choice —
  driven-off rate 1.0 (22/22), faced 0, fallback fights for
  driven-off draws 0, phantom checks 22/22 clean, wave-4
  draws driven off 12 for 0 veterans, wins 4 -> 0, table
  4 -> 0, deaths 260 -> 307, starvation unchanged 9 -> 9.
- FILLED (mechanism, corrected by data): driving off does
  NOT make the next grant a refresh on this band — next
  grants after driven-off draws are fresh (19/20 with a
  later grant), because re-feasts land ~7 days later,
  after the 2-dawn buff expired; the arming-never-spent
  effect sustains a weekly draw stream instead of
  choking it.
- FILLED (mechanism, confirmed): the cast skews wave-4
  with standing — 12/22 wave-4 under sustained feasting
  vs 1/5 under truncated always-face; the always-face
  rate was a small-n, early-win artifact, not the draw's
  true wave mix.
- FILLED (sense): the drive-off refusal is narrated
  coherently with named villagers and an honest
  consequence line; no phantom pending encounter, no
  silent vanishing, no narration gap needing eyes.
- DOCUMENTED, NOT FIXED (named next blanks): the refresh
  branch is still unexercised on this band (needs a
  re-feast inside a live window — a different policy
  shape, not a lever); the feasted-patrol confound is
  inseparable from the drive-off posture via the
  established SEEK_FIGHTS gate (a patrol-preserving
  drive-off policy would need competent-level surgery,
  out of this arm's policy-side scope); the 73678
  drive-off row's tbStarts 58 vs tbEnds 32 (fights
  initiated but unended at village loss) is a
  recorder-count observation, not a draw finding —
  ends can also exceed starts on a lost village
  (73677 control: 22 starts, 24 ends), so start/end
  counts are not a clean pair metric.
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-feastvet-b (DIAG + lever sketch, same band,
same recorders plus one recorder addition). Pre-registration
sketch: (1) record unlockedWave / standing at every draw,
to prove per-draw whether the 12/22 wave-4 mix is
standing-gated (the cast's threat rating) rather than
chance; (2) run a SELECTIVE drive-off policy (drive off
only sub-wave-4 draws, face wave-4 draws — the wave is
not shown to the player, so this is a measurement
instrument, not a proposed player power; it prices the
wave-4 stream alone: does facing only wave-4 draws
recover the control's wins?); (3) the lever question
for the scale wall: if a weekly-feasting village draws
17 times with 10 wave-4 draws, the feast-draw funnel is
NOT rare at high standing — the wall question flips
from "how do villages get more draws" to "why do
villages that feast weekly still stall at regional
when they decline" (73672) and "what does the faced
draw's deed actually buy" (73674/73678). Separable
second question for the coordinator (not this arm):
re-baseline the published control band on current
master — this run's control side is the re-baseline
candidate (it reproduces feastdraw-a exactly).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No GO leg or cost-bar line was re-scored mid-run. The run
was judged exactly against its pre-registered header:
funnel legs (a)-(e) all met (unclassified 0, driven-off
rate 1.0, faced 0, fallback 0, drivenWithFight 0,
phantom 0/22, recorder errors 0); cost bar 4 of 5 met
(starvation total + per-seed, median, national-ever),
wins guard FAILED (0 vs required >= 3) — reported as
NO-GO (funnel priced, cost bar missed), not softened to
a partial GO. Two method notes, neither a revision:
(1) the first draft of the proof tests failed one check
on a test-side bug (synthetic stack string not in the
classifier's comma-separated format) — fixed in the
test, analyzer untouched, 27/27 after; (2) the median
guard passed in the "wrong" direction (180d > 143d
because drive-off villages live longer without winning)
— median survival is not a win proxy, and the wins
guard, not the median guard, carries the verdict here.
The telemetry-check and balanced panel were NOT run,
per the standing exception for recorder rows (panel
cannot ingest per-seed recorder corpora). The
sweep-compare table + analyzer output are the
comparison of record. The telemetry baseline was NOT
rolled. No game code changed in this run; no
[needs-eyes] flag applies (policy instrument only, no
narration or behavior added; the sense read found no
narration gap).

## Infrastructure notes

- Sweep: scripts/test-feastdraw-driveoff-sweep.js (two arms,
  control + driveoff, identical seeds; feastdraw-diag +
  nonworldkill-diag recorders only). Corpus:
  evidence/2026-10-26/perseed-sim-driveoff-a/ (16 rows +
  summary.json). Policy:
  scripts/policies/feastdraw-driveoff.js
  (FEASTDRAWDRIVEOFF=1, COMPETENT_SEEK_FIGHTS=0 on the
  drive-off arm only). Unit proof:
  scripts/test-driveoff-a.js (27/27). Det-gate: PASS
  (seed 73671, policy-off == tableseat-nowait).
- Commit: sim-driveoff-a, NO-GO (funnel priced, cost bar
  missed), zero src/js diff. Ready for coordinator
  merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
