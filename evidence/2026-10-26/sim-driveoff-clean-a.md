# sim-driveoff-clean-a — drive-off confound cleanup (axis scale-onramp)

Run: flesh-out loop A, 2026-10-26, arm sim-driveoff-clean-a.
POLICY-SIDE ONLY — zero src/js changes, zero default flips, no changes to any existing policy file.
This arm designs and tests a CLEANER decline hook. Pricing the clean hook IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100; wave 5 gate:
  standing >= 200 AND wave-4 faced), src/js/feastBuff.js header +
  draw/face/drive-off/clear methods (feast_draw: on a FRESH armed
  grant, never a refresh — one draw per buff; faceFeastDraw starts
  combat then deletes the draw in a finally, so the nonworldkill
  pre-record still sees s.feastDraw at fight start;
  driveOffFeastDraw deletes s.feastDraw, clears
  pendingEncounter, spends no devotion, the buff stays live
  until its dawn, and gives the watchers a memory).
- Context read first: evidence/2026-10-26/sim-driveoff-a.md (the
  confounded arm: drive-off arm set COMPETENT_SEEK_FIGHTS=0 so
  feastFightRoad would not face a draw inside competent.upkeep,
  but that also skipped feastFightRoad's feasted patrol sweeps —
  published delta wins 0 vs 4, deaths 307 vs 260 mixes (draws
  driven off) + (no feasted patrol)) and
  evidence/2026-10-26/sim-rebaseline-a.md (the AUTHORITATIVE
  control table on current master: deaths 260, national-ever
  6/8, national-final 5/8, table 4/8, entered 4/8, wins 4/8
  lesser-seat only, wave-4 5/8, wave-5 0/8, median 143d,
  starvation 9, raids 85, raiders 352, pool 1,527, pool wave-3+
  132). This run still runs its OWN control side on identical
  seeds in the same sweep — never a copied sibling corpus,
  never judged against the stale 234-death band. If this run's
  control disagrees with the rebaseline table, the disagreement
  is reported plainly, never reconciled silently.
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1), 180d death-aware horizon (runDays stops
  on death/win; 180 is the cap, not a fixed horizon).
- THE MECHANISM (read from code, not invented): competent.upkeep
  runs eveningFeast (host the feast; a fresh ARMED grant spawns
  the draw) and then, in the SAME upkeep call, feastFightRoad.
  feastFightRoad is the ONLY sim caller of Game.faceFeastDraw
  in this policy chain (app.js UI calls never load in node
  sims; winseek/shark/livelihood are not in this chain). Its
  two branches share ONE env gate: `if
  (process.env.COMPETENT_SEEK_FIGHTS === '0') return;` — the
  draw branch (face the pending draw) and the patrol branch
  (up to 3 sweeps/day while feasted, buff unmarked). That
  shared gate IS the confound: the old arm could not kill the
  face without killing the patrol.
- THE CLEAN HOOK (new this run, policy-side only):
  scripts/policies/feastdraw-driveoff-clean.js
  (FEASTDRAWCLEAN=1). It wraps tableseat-nowait and installs,
  from its upkeep (which runs after the recorders install at
  sweep setup, so the intercept sits OUTSIDE the recorder's
  face wrapper), a policy-side intercept of Game.faceFeastDraw:
  when feastFightRoad calls faceFeastDraw with a LIVE draw
  (direct reads of s.feastDraw + pendingEncounter, never the
  self-cleaning feastDrawPending probe), the intercept calls
  Game.driveOffFeastDraw() live (so the recorder's driveoff
  wrapper fires and records the driveoff row), records a
  post-check (pendingEncounter false AND s.feastDraw gone),
  and returns the driveoff result — the draw is driven off at
  the exact moment it would have been faced, inside the same
  upkeep, with no other competent.upkeep step moved, skipped,
  or reordered. When no live draw is present, the intercept
  falls back to the original faceFeastDraw (defensive; should
  not fire in this chain — any fallback firing is counted in
  ctx.fdCleanFallback and reported). COMPETENT_SEEK_FIGHTS is
  left UNSET (on) on the clean arm, so feastFightRoad runs
  fully: draw branch -> drive-off; no-draw branch -> patrol
  sweeps exactly as control. The pending hook and the upkeep
  pre-check from the old drive-off policy are kept as safety
  nets (a draw surviving a fight-interrupted upkeep is still
  driven off, never left to the harness fallback), counted
  separately in ctx (fdCleanPending / fdCleanPrecheck /
  fdDriveoffChecks) from intercept drive-offs
  (fdCleanIntercept / fdCleanChecks). Default OFF =
  tableseat-nowait exactly (det-gate pinned).
- REJECTED ALTERNATIVES (stated now, not after seeing data):
  (1) Splitting competent.upkeep to insert a drive-off between
  eveningFeast and feastFightRoad — rejected because
  cookPack/drinkSafe/checkTicks/workWater are NOT exported
  from competent.js, so a replicated upkeep would diverge from
  competent; the intercept changes exactly one call site.
  (2) Creation-choke (wrap drawFeastScavenger to suppress the
  draw) — rejected because suppression is NOT drive-off: no
  refusal narration, no watcher memory (driveOffFeastDraw
  remembers watchers), and the grant's draw field changes;
  the intercept preserves the real drive-off verb, its
  narration, and its memory effect. (3) Patrol-only arm
  (SEEK_FIGHTS=0, draws faced by the harness fallback) —
  not run: it prices patrol only by triangulation across
  three arms and still leaves the patrol-ON + drive-off cell
  empty; the intercept arm fills that cell directly, so the
  clean-vs-control delta IS the draw decision alone.
- Recorders reused verbatim (policy-side only, never edited):
  scripts/policies/feastdraw-diag.js (FEASTDRAW=1) and
  scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1).
  The feastdraw analyzer's outcome precedence (driven-off >
  faced-face > faced-harness > unmet-expired > unmet-other)
  is reused unchanged. A driven-off draw with a harness-
  fallback start row surfaces as drivenOffWithFight /
  fallbackForDrivenOff, counted explicitly.
- Patrol measurement (sweep-side, identical method both
  arms): the sweep wraps policy.upkeep and, after each base
  upkeep, snapshots ctx._feastFightDay/_feastFightSweeps into
  a per-seed patrol map (day -> sweeps, max wins per day).
  The map lives on the per-seed row, not in ctx, so the
  control arm — which carries no clean policy — is measured
  by the same instrument. Patrol sweeps are the
  feastFightRoad patrol branch's own counters, not a new
  game-code field.
- PRIMARY METRIC: the clean drive-off funnel + patrol
  separation on identical seeds — draws driven off / draws
  spawned, faced count, intercept vs safety-net drive-off
  split, patrol sweeps on the clean arm (band total and on
  driven-off seeds), and the cost bar vs own control.
- GO RULE (legs (a)-(f) ALL required, plus the cost bar):
  (a) every spawned draw on the clean arm is classified,
  unclassified 0 (control arm unclassified 0 too, reported);
  (b) driven-off rate 1.0 on the clean arm — every spawned
  draw driven off, faced 0;
  (c) harness-fallback fights for driven-off draws = 0 AND
  driven-off draws carrying a fight join = 0;
  (d) recorder errors 0 on both recorders, both arms;
  (e) per-draw phantom checks all clean (intercept
  post-checks + safety-net post-checks, phantom 0);
  (f) PATROL SEPARATION: clean-arm band patrol sweeps > 0,
  AND at least one clean-arm seed with >= 1 driven-off draw
  records patrol sweeps (patrol actually ran in a drive-off
  window). Control patrol total is reported for context,
  not gated (control's faced fight marks the buff used, so
  control patrol may legitimately be lower).
- COST BAR (the scalemetric deciding bar, clean arm vs own
  control arm): starvation deaths (clean) <= starvation
  deaths (control) + 2 on the band total AND no single seed
  exceeding its control same-seed starvation by more than 2;
  median survival (clean) >= 0.8 x median survival
  (control); wins (clean) >= wins (control) - 1;
  national-ever (clean) >= national-ever (control) - 1.
- VERDICT MAPPING (fixed now): legs (a)-(f) + cost bar met =
  GO — driving off is free once patrol is preserved, and the
  old NO-GO is attributed to the patrol loss (clean-vs-
  control prices the draw decision alone; the old drive-off
  arm's published numbers are cited for context only, never
  as this run's gate). Legs (a)-(f) met + cost bar missed =
  NO-GO — the clean price of drive-off itself; the confound
  is cleared and the old verdict stands on clean evidence.
  Any funnel/patrol leg missed = NO-GO (mechanism failed).
- DIAGNOSTIC (reported, not a GO leg): seeds with 0 draws on
  both arms should run identical trajectories (intercept
  never fires, patrol identical, SEEK_FIGHTS on in both).
  Any divergence on a 0-draw seed is investigated before a
  verdict is claimed — it would mean the intercept fires
  spuriously or the safety nets move state.
- Definitions (fixed before sweeping, same as driveoff-a):
  DRIVEN-OFF RATE = driven-off outcomes / spawned draws on
  the clean arm. FALLBACK FIGHT FOR A DRIVEN-OFF DRAW = a
  nonworldkill feast-draw start row whose (feastDraw.monsterId,
  feastDraw.day) matches a driven-off draw's (monsterId, day),
  or a driven-off outcome carrying a fightId join. PHANTOM =
  a post-check with pendingEncounter true OR s.feastDraw
  still present after a drive-off that returned ok:true.
  PATROL SWEEP = one feastFightRoad patrol-loop iteration
  counted in ctx._feastFightSweeps for that day (sweep-side
  map takes the per-day max, so re-counts across upkeeps
  never inflate the total).
- SENSE plan: (1) quote at least one clean-arm draw's full
  decision trace (grant -> draw -> intercept drive-off row +
  post-check -> patrol sweeps in the same window) proving
  patrol survived drive-off; (2) read one transcript around
  a clean-arm driven-off draw from the sweep's captured
  say-lines (does the refusal still narrate — the watch
  with brands — now that it fires inside feastFightRoad
  instead of at driveContests time?).
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep-compare table + analyzer output are attached instead; do
  NOT run telemetry-check on recorder rows (its counts are wrong
  on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: NO-GO (funnel priced, patrol separated, cost bar missed) — driving off every draw is NOT free even with patrol preserved

- Funnel legs (a)-(e) ALL MET: unclassified 0 both arms;
  driven-off rate 10/10 = 1.0, faced 0 on the clean arm;
  harness-fallback fights for driven-off draws 0;
  driven-off draws carrying a fight join 0; per-draw phantom
  checks 10/10 clean; recorder errors 0 on both recorders,
  both arms. Corpus PASS.
- Patrol leg (f) MET, in the strong direction: clean-arm band
  patrol sweeps 30 (all 4 driven-off seeds patrolled: 73672
  18/6d, 73673 3/1d, 73674 6/2d, 73678 3/1d) vs control-arm
  patrol sweeps 0 — the control never patrols at all, because
  its faced fight marks the buff used and feastFightRoad then
  returns early. The clean arm does not merely preserve
  patrol; it is the ONLY arm that patrols. The separation the
  old arm lacked is proven, not assumed.
- Intercept split: all 10 driven-off draws went through the
  INTERCEPT (fdCleanIntercept 10, fdCleanChecks 10, phantom
  0, fallback 0). The safety nets never fired
  (fdDriveoffAttempts 0 on every clean seed) — no draw ever
  survived to a pre-check or pending hook. The intercept is
  the whole mechanism, and it works at the exact moment of
  facing.
- Cost bar: starvation 11 vs 9+2 PASS (band total 11 <= 11);
  per-seed starvation excess max +2 (73678 only) PASS;
  median 180d vs 0.8x143d = 114.4d PASS; national-ever 5 vs
  6-1 = 5 PASS — but WINS 0 vs 4-1 = 3 FAIL. By the
  pre-registered header that is NO-GO for "drive-off is
  free": the price is measured (below), not zero, and the
  confound is cleared — the old NO-GO was NOT a patrol
  artifact.
- Unit proof: scripts/test-driveoff-clean-a.js 29/29. Live
  det-gate: PASS (seed 73671, policy-off == plain
  tableseat-nowait: days 180/180, gameDays 181/181,
  tsNationalDay 77/77, no ctx fd surface, no wraps
  installed, no intercept flag).

## CONTROL-AGREEMENT NOTE (no disagreement to reconcile)

This run's own control side reproduces the authoritative
rebaseline table EXACTLY on all 8 seeds and every band field
— days, end reason, won, wave reach, Arc, final/max rank,
national-ever/final, table, entered, deaths, starvation
(deaths 260, national-ever 6/8, national-final 5/8, table
4/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8, median
143d, starvation 9) and the full death-cause shares
(villager combat 162 = 78 + 84, player arena 32, villager
sickness 16, expedition 11, starvation 9, ambush 5,
wound-that-wouldn't-close 5, villager monster 5, player
contest 3, villager alien 3, player dehydration 3, and 1
each for Bulldozer, Paparazzo, Living Wire, lockjaw, the
night, thirst). The 2-recorder composition here is
trajectory-neutral against the rebaseline composition, and
the rebaseline table needs no revision.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| arm | won | median | natEver | natFinal | table | entered | wave4 | wave5 | Arc IV | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face) | 4/8 | 143d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 9 | 260 |
| clean drive-off (intercept, patrol on) | 0/8 | 180d | 5/8 | 3/8 | 1/8 | 0/8 | 6/8 | 0/8 | 1/8 | 11 | 295 |
| old drive-off (driveoff-a, patrol off, context only) | 0/8 | 180d | 5/8 | 2/8 | 0/8 | 0/8 | 6/8 | 0/8 | — | 9 | 307 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | kills | wave-4 draws | wave-4 kills | patrol sweeps |
|---|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 | 0 |
| clean drive-off | 22 (10/0/12) | 10 | 0 | 10 | 0 | 4 | 0 | 30 |

Clean drive-off wave distribution: w1 1, w2 3, w3 2, w4 4.
Control wave distribution: w1 1, w2 2, w3 1, w4 1.
Refusals on both arms are the fusion-reactor ceiling (grant
rows carry the reactor refusal text; no devotion-gate refusal
appears on either arm). Refreshed = 0 on BOTH arms: no
re-feast inside a live buff window happened anywhere on this
band, under either policy — the refresh branch stays
unexercised here, same as in driveoff-a.

Per-seed, control -> clean:

| seed | control | clean | draws / patrol |
|---|---|---|---|
| 73671 | 180d survived, 31 deaths, 0 grants | IDENTICAL (180d, 31, 0 grants, pop 4, pantry 18,121) | none / 0 |
| 73672 | won d97, 25 deaths, 2 draws faced, 2 kills | 180d survived at global, 31 deaths, 6 draws driven off (2 w4) | 6 driven / 18 sweeps, 6 days |
| 73673 | won d124, 28 deaths, 1 draw faced+lost | lost d129, 40 deaths, 1 draw driven off | 1 driven / 3 sweeps, 1 day |
| 73674 | won d163, 30 deaths, 1 draw faced+kill | 180d survived at regional, 33 deaths, 2 draws driven off (1 w4) | 2 driven / 6 sweeps, 2 days |
| 73675 | 180d survived, 38 deaths, 3 refused | IDENTICAL (180d, 38, starv 4, pop 2, pantry 200) | none / 0 |
| 73676 | lost d70, 31 deaths, 0 grants | IDENTICAL (lost d70, 31, starv 4) | none / 0 |
| 73677 | lost d143, 43 deaths, 0 grants | IDENTICAL (lost d143, 43, national) | none / 0 |
| 73678 | won d116, 34 deaths, 1 draw faced+wave-4 kill | lost d145, 48 deaths, 1 draw driven off (w4 strike) | 1 driven / 3 sweeps, 1 day |

The four no-draw seeds are identical trajectories between arms
(days, deaths, starvation, final pop/pantry) — the diagnostic
in the pre-registration holds 4/4. The intercept never fires
spuriously, and the safety nets never move state when no draw
exists. The divergence on the other four seeds is the draw
decision plus its honest downstream (patrol fights, changed
feast cadence), not policy noise.

## THE ANSWER, FIRST (plain words)

The confound is dead, and the verdict survives it. With the
patrol fully alive — 30 sweeps, the only patrols on either
arm — the villages that drove off every draw still won zero
times, still reached the table zero times (entered), and
still died more (295 deaths vs 260). Preserving the patrol
recovered only 12 deaths against the old confounded arm
(295 vs 307) and zero wins. The price was never the patrol.
The price is the draw fight itself: the villages that faced
their draws got 4 draw kills, including the band's only
wave-4 veteran, and 4 wins; the villages that drove off
every draw got 0 draw kills, 0 wave-4 veterans from draws,
and 0 wins. The draw fight is not a lottery ticket you can
decline for free. It is the deed that moves the village
forward — and the clean arm proves it, because this time
nothing else was taken away.

## WHAT PATROL ACTUALLY BOUGHT (the separated component, priced)

Old drive-off (patrol off) vs clean drive-off (patrol on),
both driving off every draw — context comparison only, the
old arm's numbers are its own run's, not this sweep's gate:
deaths 307 -> 295 (-12), starvation 9 -> 11 (+2, all of it
73678's +2), national-final 2/8 -> 3/8 (+1, 73674 survived
at global reach), table invited 0/8 -> 1/8 (73673, see the
note below), wins 0 -> 0. Patrol buys survival days and a
little rank, at a small starvation cost (patrol fights add
combat deaths: clean villager combat 176 = 73 + 103 vs
control 162; player arena 41 vs 32) — but it buys no win,
no table entry, no Arc IV. The patrol component is now a
measured quantity, not a confound: ~12 deaths of the old
arm's 47-death gap, 0 of its 4-win gap.

## THE 73678 CASE — THE SAME BEAST, KILLED ANYWAY, STILL NO WIN

The sharpest seed in the run. Under always-face, 73678 faced
the Strike on day 115, killed it (elif_demir, via player),
reached Arc IV, sat at the table, and won on day 116. Under
clean drive-off, the village drove the Strike off on day 115
— and then met the same Strike in the world on day 120, in a
world-bump fight, and killed it anyway (same killer, same
beast, nonworldkill door world-bump, not feast-draw). It
still never reached Arc IV (Arc III), never sat at the
table, and lost on day 145 with 48 deaths. Killing the beast
is not the deed. The faced draw fight itself — the deed the
feast marks — is what the village loses when it declines.
A future arm should test that deed claim directly (does the
faced draw feed an Arc IV deed counter that a world-bump
kill of the same beast does not?), because 73678 is now the
cleanest evidence for it: same seed, same beast, same
killer, different deed, different ending.

## THE 73673 NOTE — TRANSIENT NATIONAL, TABLE INVITED, SWEEP SNAP MISSED IT

Clean 73673 shows table=1 with maxRank=regional and
national-ever=0 by the sweep's daily-snap definition — but
its ctx carries tsNationalDay=86: the tableseat seat leg
itself saw rank >= 2 on day 86. The village touched national
transiently, was invited to the table, fell back to
regional, and lost on day 129 without ever entering. This
is a sweep-instrument note, not a game incoherence: the
daily snap reads rank at dawn, the seat leg reads it
mid-day during courtship, and a rank that rises and falls
within a day is visible to one and not the other. The
national-ever guard passes under either definition
(sweep: 5 vs required >= 5; seat-leg: 6 vs >= 5), so the
verdict is unaffected — but a future arm that needs exact
national-ever should read tsNationalDay alongside maxRank,
not maxRank alone.

## SUBSEQUENT GRANTS — FRESH AGAIN (driveoff-a's correction confirmed)

Of the 10 driven-off draws, 6 are followed by a later grant
on the same seed, and all 6 are FRESH (73672: 5/5 fresh on
its weekly cadence, one refused at d102; 73674: d162 draw ->
d172 fresh grant, which draws the herald, wave 4, also
driven off). Drive-off does not make the next grant a
refresh, and it does not choke the stream — but on the clean
arm the stream is SHORTER than on the old arm (10 draws vs
22), because patrol fights change the village's feast
cadence: a patrolled buff gets marked used, the scholar
travels and fights instead of re-feasting weekly, and 73672
draws 6 times instead of 17. The old arm's weekly-feast
village was itself a confound artifact: a village that
never patrols feasts weekly; a village that patrols does
not.

## SENSE-TESTING READ (decision trace + transcript, no phantom, patrol in the window)

The 73672 day-60 trace, in full: grant row d60 (granted
true, refreshed false, drawMonsterId buffering) -> draw row
d60 (drawn true, buffering, wave 3) -> recorder driveoff row
d60 (ok true, drivenOff true, preDraw buffering d60) ->
intercept post-check d60 (where intercept, post
pendingEncounter false, pendingMonsterId null, feastDraw
null, phantom false) -> patrol map day 61: 3 sweeps (the
full daily budget, the day after the drive-off — the draw
branch returns after the intercept, so patrol runs on the
next upkeep, inside the same 2-dawn window). No feast-draw
start row matches the buffering/d60 key on the clean arm
(fallback 0, drivenWithFight 0 across all 10 draws). The
transcript around it reads exactly as in driveoff-a, with
the same named villagers (Divya takes up a brand and
Enrique follows — they meet it at the edge of the light
with noise and fire. Buffering was never brave. It melts
back into the dark.), now firing inside feastFightRoad
instead of at driveContests time — the narration is
unchanged, because the verb is unchanged; only the caller
moved. The 73678 Strike refusal reads the same way
(Miguel takes up a brand and Elena follows). No
[needs-eyes] flag: no narration was added or changed by
this policy-only arm, and the existing drive-off lines read
coherently. One display note carried from driveoff-a (not a
gap): monsterId vs display name mapping is the same on the
face path; the recorder joins on monsterId, so nothing
misclassifies.

## VILLAGE ASSESSMENT (plain words)

Four villages never met a draw under either policy and lived
identical lives — the question never touched them. Of the
four that did: 73672 became a patrolling village that turned
away six beasts, fought its way through six patrol days,
and lived to day 180 at global rank with 3,400 kcal in the
pantry — it climbed higher than its always-face self's
early win in rank, but never sat at the table, because the
draw deeds never landed. 73674 kept its global reach, patrolled
two windows, drew a second wave-4 beast (the herald) after
driving off the mirror_stag, drove that off too, and
survived to 180 at regional — a village that survived by
declining everything, twice over. 73673 dodged the one
fight it would have lost (cliffhanger), patrolled once,
touched national, was invited to the table, and still died
on day 129 with 40 deaths — dodging the draw did not dodge
the village's fate, and an invitation is not a seat.
73678 is the sharpest case: it drove off the Strike, met
the Strike again in the world five days later, killed it,
and still died on day 145 — because the kill was not the
deed. The wall numbers say the same: wave-5 0/8 on both
arms, Arc IV 4/8 -> 1/8 under clean drive-off, table
entered 4/8 -> 0/8.

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
3, villager alien 3, and 1 each for Bulldozer, Paparazzo,
Living Wire, lockjaw, the night, thirst.
Clean drive-off: national-ever 5/8, national-final 3/8,
table invited 1/8, entered 0/8, wins 0/8, wave-4 reached
6/8, wave-5 0/8, Arc IV 1/8, median survival 180d, max
180d, deaths 295, starvation 11. Death-cause shares (of
295): villager combat 176 (59.7% — 'villager combat' 73 +
'combat' 103), player arena 41 (13.9%), villager sickness
16 (5.4%), expedition 15, starvation 11 (villager 8 +
player 3), villager monster 6, ambush 5,
wound-that-wouldn't-close 5, player contest 4, player
dehydration 4, villager alien 3, villager thirst 2, and 1
each for Bulldozer, The Eulogy, The Redactor, Paparazzo,
Living Wire, lockjaw, the night. The wall stands on both
arms: wave-5 0/8, and the clean arm produced zero wave-4
veterans from draws against the control's one — plus one
wave-4 kill through a world-bump door that bought no Arc,
no table, no win.

## BLANKS FILLED OR DOCUMENTED

- FILLED (priced, with numbers): the drive-off confound —
  intercept-driven drive-off rate 1.0 (10/10), faced 0,
  fallback fights for driven-off draws 0, phantom checks
  10/10 clean, safety nets never fired (0 attempts), patrol
  30 sweeps on the clean arm vs 0 on control, wins 4 -> 0,
  table entered 4 -> 0, Arc IV 4 -> 1, deaths 260 -> 295,
  starvation 9 -> 11 (band total passes the +2 bar; the
  whole excess is 73678's +2).
- FILLED (mechanism, the patrol component priced): patrol
  preserved recovers ~12 deaths vs the old confounded arm
  (295 vs 307) and 0 wins — the old NO-GO's win gap was
  never the patrol. Patrol buys survival days and a little
  rank at a small starvation cost, not wins.
- FILLED (mechanism, confirmed twice): driving off does NOT
  make the next grant a refresh — next grants after
  driven-off draws are fresh (6/6 with a later grant here,
  19/20 in driveoff-a); and the clean arm's shorter draw
  stream (10 vs 22) shows the old arm's weekly-feast
  cadence was itself a patrol-off artifact.
- FILLED (mechanism, new): the faced draw is a DEED, not
  just a kill — 73678 killed the same Strike via world-bump
  5 days after driving it off and still gained no Arc, no
  table, no win. The deed claim is now the sharpest open
  question, not a guess.
- FILLED (sense): the drive-off refusal narrates identically
  from inside feastFightRoad as from driveContests time;
  patrol runs the next upkeep inside the same buff window
  (73672: draw d60 -> patrol d61, 3 sweeps).
- DOCUMENTED, NOT FIXED (named next blanks, for the
  coordinator to number into the findings backlog): (1)
  the Arc IV deed test — does a faced feast-draw feed an
  Arc IV deed counter that a world-bump kill of the same
  beast does not (73678 is the test case, same seed/beast/
  killer, different deed, different ending); (2) the
  transient-national instrument note — sweep daily snaps
  miss a rank that rises and falls within a day (73673
  clean: tsNationalDay 86, table invited, maxRank
  regional) — future national-ever reads should pair
  tsNationalDay with maxRank; (3) the patrol death cost —
  clean-arm combat deaths run higher (villager combat 176
  vs 162, arena 41 vs 32), so a future patrol-valuing arm
  should price patrol fights, not assume patrol is free.
- CARRIED (not chased here): the refresh branch is still
  unexercised on this band (needs a re-feast inside a live
  window); the empty nonat x w4 class (w5chain-a); the melt
  fiction-vs-mechanics gap (1815Z, Steve rulings pending).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-feastdeed-a (DIAG + lever sketch, same band,
same recorders). Pre-registration sketch: (1) record the
Arc IV deed inputs at every faced draw and at every
world-bump wave-4 kill, to prove per-event whether the
faced draw feeds a deed counter the world kill does not;
(2) run the 73678 replay pair (always-face vs clean
drive-off, already measured here) against that deed
census — if the deed counter moves only on faced draws,
the scale-wall question for the feast lane becomes "what
buys the deed" rather than "what buys the kill"; (3) the
lever question for the scale wall: if declining is priced
at the whole win on this band, the design question is no
longer whether to decline — it is what a declining village
is offered instead (a different deed path, or a visible
cost at decision time, since the draw's wave is never
shown to the player and declining is a blind choice in
both directions).

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No GO leg or cost-bar line was re-scored mid-run. The run
was judged exactly against its pre-registered header:
funnel legs (a)-(e) all met (unclassified 0, driven-off
rate 1.0, faced 0, fallback 0, drivenWithFight 0, phantom
0/10, recorder errors 0); patrol leg (f) met (clean band
patrol 30 > 0, all 4 driven-off seeds patrolled); cost bar
4 of 5 met (starvation total + per-seed, median,
national-ever), wins guard FAILED (0 vs required >= 3) —
reported as NO-GO (funnel priced, patrol separated, cost
bar missed), not softened to a partial GO. Two method
notes, neither a revision: (1) the first full-sweep
background session vanished after the control arm with no
completion record (same class as rebaseline-a's vanished
session) — nothing was lost, because every --one row is
written to disk before the next seed starts, and the loop
was re-run with existing-file skips to finish the clean
arm; (2) the median guard passed in the "wrong" direction
again (180d > 143d because clean villages live longer
without winning) — median survival is not a win proxy,
and the wins guard, not the median guard, carries the
verdict here, same as in driveoff-a. The telemetry-check
and balanced panel were NOT run, per the standing exception
for recorder rows (panel cannot ingest per-seed recorder
corpora). The sweep-compare table + analyzer output are the
comparison of record. The telemetry baseline was NOT
rolled. No game code changed in this run; no [needs-eyes]
flag applies (policy instrument only, no narration or
behavior added; the sense read found no narration gap).

## Infrastructure notes

- Sweep: scripts/test-feastdraw-driveoff-clean-sweep.js (two
  arms, control + clean, identical seeds; feastdraw-diag +
  nonworldkill-diag recorders only; sweep-side patrol map,
  identical method both arms). Corpus:
  evidence/2026-10-26/perseed-sim-driveoff-clean-a/ (16 rows +
  summary.json). Policy:
  scripts/policies/feastdraw-driveoff-clean.js
  (FEASTDRAWCLEAN=1, COMPETENT_SEEK_FIGHTS left on). Unit
  proof: scripts/test-driveoff-clean-a.js (29/29). Det-gate:
  PASS (seed 73671, policy-off == tableseat-nowait).
- Commit: sim-driveoff-clean-a, NO-GO (funnel priced,
  patrol separated, cost bar missed), zero src/js diff.
  Ready for coordinator merge; NOT pushed, NOT bumped, live
  NOT verified (coordinator/ship-loop line, not this arm's).