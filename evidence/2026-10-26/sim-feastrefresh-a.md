# sim-feastrefresh-a — exercise the feast refresh branch (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-feastrefresh-a.
DIAG ONLY — zero src/js changes, zero default flips, recorders
verbatim, policy-side only. This arm designs and lands NO game
fix. Exercising and classifying the refresh branch IS the
deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100),
  src/js/feastBuff.js header + grant/draw/face/drive-off/clear
  methods + src/data/feast-surge.json (durationNights 2, refeast
  policy refresh / quality best, feastDraw chance 1.0).
- Context read first: evidence/2026-10-26/sim-feastdraw-a.md
  (12 grants: 5 fresh, 0 refreshed, 7 reactor-refused; 5 draws,
  all faced), evidence/2026-10-26/sim-driveoff-a.md (30 grants:
  22 fresh, 0 refreshed, 8 refused; 22 draws driven off;
  subsequent grants after driven-off draws are FRESH 19/20,
  because villages re-feast ~7 days later, after the 2-dawn
  buff expired — the refresh branch stayed unexercised on
  both bands), evidence/2026-10-26/sim-rebaseline-a.md (the
  AUTHORITATIVE control table on current master: deaths 260,
  national-ever 6/8, national-final 5/8, table 4/8, entered
  4/8, wins 4/8 lesser-seat only, wave-4 5/8, wave-5 0/8,
  median 143d, starvation 9, raids 85, raiders 352, pool 1,527,
  pool wave-3+ 132). The sibling arm in this same run works
  the drive-off confound (sim-driveoff-clean-a) — its
  uncommitted work is NOT read or reused here; this arm's
  control side is its own.
- Mechanism, READ FROM CODE (never invented):
  - grantFeastBuff gates in order: fusion reactor online =>
    honest refusal (reactor ceiling); devotion unarmed
    (neither prog.feastSurge nor feast.surge) => honest
    refusal (devotion gate); an EXISTING live buff =>
    REFRESH branch (better quality wins, multiplier
    recomputed never multiplied onto itself, untilDay =
    grant day + durationNights (2), untilPart = dawn,
    returns refreshed:true, NO draw call, NO draw field);
    otherwise FRESH branch (sets s.feastBuff, calls
    drawFeastScavenger exactly once).
  - feastedBuffState() calls feastedActive(), which LAZILY
    clears an expired buff — so a grant after the expiry
    dawn sees no existing buff and is fresh, not refresh.
  - Devotion is spent only by real use: _spendFeastedPower
    (real combat use or landed bonus healing) clears
    prog.feastSurge and sets feastSurgeUsed. Driving off
    spends NO devotion. Consequence, stated now: after a
    FACED draw fight, a re-feast inside the window hits
    the devotion gate (refused), not the refresh branch,
    unless the keepsake is channeled again first. After a
    DRIVEN-OFF draw, the arming survives, so a re-feast
    inside the window CAN refresh.
  - Window arithmetic: a dusk feast on day D buys untilDay
    D+2 (dawn of D+2). The ONLY dusk inside that window is
    D+1 (dusk D+2 is after the expiry dawn). So a refresh
    needs a feast on the very next dusk — which is exactly
    what the base policy never does: competent
    eveningFeast and surplusFeast both enforce an armed
    cadence of 7 days (unarmed 14 days), with the comment
    "re-feasting sooner just refreshes." The 7-day cadence
    is the reason refreshed = 0 on both prior bands, not a
    game-code block.
- New this run, policy-side only:
  scripts/policies/feastrefresh.js (FEASTREFRESH=1). It wraps
  the COMMITTED scripts/policies/feastdraw-driveoff.js
  (FEASTDRAWDRIVEOFF=1, COMPETENT_SEEK_FIGHTS=0 on the
  refresh arm only — drive-off keeps the devotion armed,
  which is what makes a refresh reachable) and, in upkeep
  BEFORE delegating, clears the policy cadence markers
  (ctx._lastFeastDay, ctx._sfLastFeastDay) so the base
  eveningFeast/surplusFeast can feast on consecutive
  dusks. NOTHING else about feasting changes: dusk-only,
  at-haven, one feast/day (game rule), affordability
  (have >= cost*1.5), recentGives >= 1500 in the last
  7 days, feastPlan ok — all still gate. The instrument
  removes only the policy's own 7-day wait, never a game
  gate. It also records pure-read buff snapshots on ctx
  (ctx.frBuffSnaps, pre/post every upkeep: day, dayPart,
  s.feastBuff {quality, mult, untilDay, used} read
  directly, s.feastDraw {monsterId, day} read directly,
  pendingEncounter/pendingMonsterId) — it NEVER calls
  feastedActive() or feastDrawPending() (both can clear
  state). Default OFF = the drive-off policy exactly
  (det-gate pinned: policy-off == plain tableseat-nowait
  on seed 73671, days/gameDays/ts, no fr surface, no
  wraps installed).
- Recorders reused VERBATIM (policy-side only, never
  edited): scripts/policies/feastdraw-diag.js (FEASTDRAW=1)
  and scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1).
  No recorder field is added or changed: grant rows already
  carry preBuff, preDraw, postDraw, refreshed, mult,
  quality; the new buff snapshots live on ctx, not in the
  recorder.
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1), 180d death-aware horizon (runDays
  stops on death/win; 180 is the cap, not a fixed horizon).
- Own control side, run here on current master: the control
  arm is tableseat-nowait + feastdraw-diag + nonworldkill-diag
  recorders ONLY. NEVER copy a sibling corpus, NEVER judge
  against the stale 234-death band. If this run's control
  side disagrees with the rebaseline table, the
  disagreement is reported plainly, never reconciled
  silently.
- CONFOUND, STATED NOW: the refresh arm's delta vs control
  is (daily feast cadence + drive-off draws + no feasted
  patrol via COMPETENT_SEEK_FIGHTS=0) — the same
  drive-off confound driveoff-a stated, plus cadence.
  Grant-level refresh classification is mechanism-clean
  (grant rows are code-level facts). Wall-number deltas
  are DIAGNOSTIC SIDE EFFECTS ONLY — never a lever
  verdict, which this DIAG arm does not pre-register.
- PRIMARY METRIC: the refresh branch, exercised and
  classified — refresh grants observed; draws on refresh
  (draw rows whose grantIdx equals a refresh grant's
  index in the seed's grant array); buff-window semantics
  per refresh (preBuff.untilDay -> post-snapshot untilDay:
  extended? newUntil == grantDay+2 (fresh-length window
  from the refresh day)? quality best-wins? mult
  recomputed?); circling-draw case (refresh grants with
  preDraw non-null, and their postDraw — does a
  still-circling draw survive a refresh?); refusal reasons
  on the refresh arm (reactor vs devotion vs other, by
  why-text); refresh chains (a fresh grant followed by
  refresh grants on consecutive days) and what breaks
  them (gap / refusal / win / loss).
- DIAG-GO rule (ALL required): (a) classification complete:
  analyzer unclassified 0 on BOTH arms; recorder errors 0
  on both recorders, both arms; no overflow; every refresh
  grant matched to a post-snapshot; (b) refresh exercised:
  >= 10 refresh grants on the refresh arm — why 10: one
  armed village feasting 3 straight dusks yields 2
  refreshes, so 10 requires sustained chains (one long
  chain or several), not a single accidental re-feast;
  0 refreshes is NO-GO for this arm, not a null result;
  (c) draws-on-refresh counted exactly (any value is
  classified; a nonzero value contradicts the header's
  "never a refresh draws" and is reported as a header
  contradiction, not hidden); (d) refusal reasons
  classified on the refresh arm (reactor / devotion /
  other; any 'other' listed individually, never bucketed
  silently).
- GUARDRAILS (reported even though this is a DIAG arm;
  NOT verdict-flipping for this arm — stated now, not
  after: this arm pre-registers no lever verdict, so a
  guardrail miss is a flagged diagnostic side effect, not
  a re-scored GO): starvation total (refresh) <=
  starvation total (control) + 2 AND no single seed
  exceeding its control same-seed starvation by more than
  2; median survival over NON-WON seeds (refresh) >=
  0.8 x median over non-won seeds (control); wins
  (refresh) >= wins (control) - 1; national-ever
  (refresh) >= national-ever (control) - 1.
- Definitions (fixed before sweeping, analyzer header
  repeats them): same as feastdraw-a (GRANT / FRESH /
  REFRESH / REFUSED / DRAW SPAWNED / outcome precedence /
  FACED / KILL RATE / VETERANS PER DRAW). Added here:
  REFRESH GRANT = a grant row with granted true and
  refreshed true. DRAWS ON REFRESH = draw rows with
  drawn true whose grantIdx is the index of a refresh
  grant in the same seed's grant array. WINDOW EXTENDED
  = post-snapshot untilDay > preBuff.untilDay. WINDOW
  RESET-TO-FRESH-LENGTH = post-snapshot untilDay ==
  refresh grant day + 2. CIRCLING REFRESH = a refresh
  grant whose preDraw is non-null. REFRESH CHAIN =
  a fresh grant followed by refresh grants on consecutive
  days (chain length counts the fresh grant + its
  consecutive refreshes; a gap day, refusal, win, or loss
  breaks the chain). REFUSAL REASON = 'reactor' if the
  grant why-text matches /reactor/i, 'devotion' if it
  matches /devotion|keepsake/i, else 'other' (listed).
  POST-SNAPSHOT MATCH = the first post-upkeep snapshot
  with day > grant day, or day == grant day and dayPart
  >= 2 (the refresh grant lands at dusk, dayPart 2).
- SENSE plan: (1) one refresh chain in plain words from
  the corpus (feast days, mult/quality/untilDay steps,
  what happened to the draw, what broke the chain);
  (2) one transcript snippet around a refresh (does the
  game narrate the refresh honestly — "the fire is
  stoked higher, not doubled" — or does anything read
  as stacking?); (3) a villager-behavior spot check from
  the sweep's rows (same solo-scholar texture check as
  prior arms — anything new here is the daily feasting
  itself, so report feast frequency vs pantry honestly).
- PILOT GATE: the fixed shared band IS the pilot — 8
  seeds, both arms, identical seeds, before any further
  spend. No confirm beyond the band: the brief fixes the
  band at 73671-73678, and seeds are the band, not a
  sample to extend.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried) — the sweep-compare table + analyzer output
  are attached instead; do NOT run telemetry-check on
  recorder rows (its counts are wrong on recorder rows —
  standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO — the refresh branch is exercised, classified, and behaves exactly as the header says

- (a) Classification complete: analyzer unclassified 0 on BOTH
  arms; recorder errors 0 on both recorders, both arms; no
  overflow; all 14 refresh grants matched to a post-snapshot
  (unmatched 0). Corpus PASS.
- (b) Refresh exercised: 14 refresh grants on the refresh arm
  (>= 10 pre-registered bar), in 10 chains across 2 seeds —
  sustained chains, not a single accidental re-feast.
- (c) Draws on refresh counted exactly: 0. No header
  contradiction — the header's "never a refresh draws"
  holds on this corpus (14/14 refreshes drew nothing).
- (d) Refusal reasons classified: 127/127 refused grants on
  the refresh arm carry a reason — reactor 127, devotion 0,
  other 0.
- Unit proof: scripts/test-feastrefresh-a.js 29/29 (analyzer
  checks + method-level proof on the real grant code).
- Live det-gate: PASS (seed 73671, policy-off ==
  plain tableseat-nowait: days 180/180, gameDays 181/181,
  tsNationalDay 77/77, no fr/fd surface, no wraps installed).
- Guardrails (diagnostic only, per the pre-registration —
  NOT verdict-flipping for this DIAG arm): starvation total
  PASS (9 vs 9+2); median over non-won seeds PASS (180d vs
  0.8x180d = 144d); national-ever PASS (7 vs 6-1 = 5);
  per-seed starvation FAIL (73673: 4 vs control 0, excess
  +4 > +2); wins FAIL (0 vs 4-1 = 3). The guardrail misses
  are the diagnostic side effect, reported below — daily
  feasting + driving off every draw cost all four control
  wins. This arm pre-registered no lever verdict, so the
  misses do not convert DIAG-GO into NO-GO; they are
  flagged, not hidden.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| arm | won | median | medianNonWon | natEver | natFinal | table | entered | wave4 | wave5 | ArcIV | starv | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| control (always-face, 7d cadence) | 4/8 | 143d | 180d | 6/8 | 5/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 9 | 260 |
| refresh (daily cadence + drive-off) | 0/8 | 180d | 180d | 7/8 | 4/8 | 0/8 | 0/8 | 5/8 | 0/8 | 0/8 | 9 | 274 |

| arm | grants (fresh/refreshed/refused) | draws | faced | driven-off | kills | wave-4 draws | wave-4 kills | vet/draw |
|---|---|---|---|---|---|---|---|---|
| control | 12 (5/0/7) | 5 | 5 | 0 | 4 | 1 | 1 | 0.2 |
| refresh | 151 (10/14/127) | 10 | 0 | 10 | 0 | 0 | 0 | 0.0 |

Control-agreement: this run's own control side reproduces
the rebaseline authoritative table EXACTLY on all 8 seeds
(days, won, deaths — 8/8 agree). The control is current;
no drift to report.

Per-seed, control -> refresh:

| seed | control | refresh | grants (f/r/ref) | draws |
|---|---|---|---|---|
| 73671 | 180d survived, 31 deaths, 0 grants | IDENTICAL | 0 | none |
| 73672 | won d97, 25 deaths, 2 draws faced | 180d survived global, 24 deaths | 100 (4/3/93 reactor) | 4 driven off |
| 73673 | won d124, 28 deaths, 1 draw faced+lost | lost d159, 56 deaths, 4 starv | 17 (6/11/0) | 6 driven off |
| 73674 | won d163, 30 deaths, 1 draw faced+kill | 180d survived global, 26 deaths | 12 (0/0/12 reactor) | none |
| 73675 | 180d survived, 38 deaths, 3 refused | lost d93, 27 deaths | 18 (0/0/18 reactor) | none |
| 73676 | lost d70, 31 deaths, 0 grants | IDENTICAL | 0 | none |
| 73677 | lost d143, 43 deaths, 0 grants | IDENTICAL | 0 | none |
| 73678 | won d116, 34 deaths, 1 draw faced+wave-4 kill | 180d survived global, 36 deaths | 4 (0/0/4 reactor) | none |

The three no-grant seeds (73671, 73676, 73677) are
byte-identical trajectories between arms — the refresh
instrument changes NOTHING when no feast is hosted, so the
divergence on the other five seeds is the feasting posture
(daily cadence + drive-off + no feasted patrol), not
policy noise.

## THE ANSWER, FIRST (plain words)

The refresh branch works exactly as the code header
promises, and daily feasting reaches it easily — but
reaching it costs the game. When a village feasts on
consecutive evenings while the devotion is still armed,
the second feast does not stack a new fire on the old
one: it stokes the same fire higher, stretches the window
one more day, draws nothing new, and spends no new
devotion. Fourteen times on this band, every single one
behaved that way — window extended 14/14, reset to a
fresh two-dawn window from the refresh day 14/14, zero
draws on refresh, zero circling draws met. The branch is
not broken, hidden, or rare once the cadence allows it:
two villages produced it on demand, one of them in a
five-feast chain (fresh day 40, refreshed days 41, 42,
43, 44). What daily feasting does NOT do is help the
village climb. The villages that feasted daily won zero
times against the control's four, reached the table zero
times, and never reached Arc IV at all — because a feast
costs real pantry food whether the buff grants or not,
and because driving off every draw forfeits the veteran
pipeline driveoff-a already priced. The refresh branch
itself is healthy; the posture that exercises it is
expensive.

## THE REFRESH BRANCH, NUMBER BY NUMBER

All 14 refresh grants, from the corpus (mult 2.03 and
quality 1 on every one — see the quality note below):

| seed | refresh days | chain shape |
|---|---|---|
| 73672 | 61, 62, 69 | fresh d60 + [61,62]; fresh d64; fresh d66; fresh d68 + [69] |
| 73673 | 41, 42, 43, 44, 47, 48, 51, 52, 67, 71, 72 | fresh d40 + [41,42,43,44]; fresh d46 + [47,48]; fresh d50 + [51,52]; fresh d66 + [67]; fresh d70 + [71,72] |

- Window semantics (14/14 on every leg): every refresh
  moved untilDay from preBuff.untilDay to preBuff.untilDay
  + 1 AND to grantDay + 2 (the two descriptions coincide
  on a daily cadence, and both held every time). No
  refresh left the window unchanged, shortened it, or
  stacked a second window.
- Draws on refresh: 0. No draw row carries a refresh
  grant's index on any seed. The one-draw-per-buff rule
  holds in data, not just in the header.
- Circling draws at refresh: 0. Every refresh grant's
  preDraw was null — no refresh ever met a still-circling
  draw in sims. That is a structural fact of the sims,
  not a code gap: a draw granted at dusk is answered at
  driveContests before the next dusk (faced, driven off,
  or fallback-faced), so by the next evening there is
  never a draw left to survive a refresh. The code-level
  question is answered separately by the method proof
  (below): if a draw WERE still circling, a refresh
  leaves it untouched.
- Quality / multiplier: quality 1 and mult 2.03 on all 14
  refreshes, identical to their preBuff values — no
  quality raise, no mult change, anywhere. The
  "better quality wins" leg held trivially (post quality
  == max(pre, grant) 14/14) because grant quality never
  exceeded pre quality on this band: every feast in
  these chains was a proper feast (quality 1). A refresh
  that raises quality (thin feast refreshed by a
  legendary one) is still unmeasured — a named gap
  below, not a verdict about the leg.
- Subsequent grants after refresh (what breaks a chain):
  refresh -> next-day refresh 8 times; refresh -> fresh
  (gap day, buff expired at dawn) 5 times; refresh ->
  reactor refusal 1 time (73672 d69 -> d70: the reactor
  came online between the refresh and the next attempt,
  and no grant succeeded on that seed again); refresh ->
  no later grant 1 time (73673 d72, the village's last
  grant before its d159 loss). Gap days carry NO grant
  row at all — no feast was hosted (haven / affordability
  / recent-gives / feastPlan gates), not a refused feast.
  The chain-breakers are therefore: a missed evening
  (gap), the reactor ceiling, and the village's end —
  never a devotion lapse. Devotion refusals: 0 on the
  whole refresh arm, because driving off never spends
  the arming.
- Draws on the refresh arm: 10 spawned, 10 driven off, 0
  faced, 0 kills, wave mix w1 6 / w2 1 / w3 3 / w4 0.
  The wave-4 absence is trajectory, not targeting: these
  villages' draws all landed before they reached
  wave-4 standing (73672's draws are days 60-68 at wave 3
  and below; 73673's days 38-70 likewise), unlike
  driveoff-a's high-standing weekly draws (12/22 wave-4).
  A daily-feasting village draws early and often, not
  high.

## METHOD-LEVEL PROOF (real grant code, loaded game, no sim)

scripts/test-feastrefresh-a.js runs the real
grantFeastBuff on a loaded game (seed 73671, setup only,
no runDays): arm prog.feastSurge, grant (fresh, untilDay
= day+2, draw set), grant again while live (refreshed
true, NO draw field, circling draw + pendingEncounter
untouched, quality kept at the better value 1 over 0),
advance one day inside the window, grant again
(refreshed true, untilDay extended to grant day + 2).
This proves the three code semantics the sims cannot
reach: a refresh draws nothing, a still-circling draw
survives a refresh untouched, and the window extends
(rather than stacking). The sims prove the same three
behaviors where they CAN occur (draws-on-refresh 0,
window extension 14/14); the circling case is proven
only at method level, because sims never produce it.
Both proofs are labeled as what they are.

## THE REACTOR CEILING, ANSWERED (the brief's second question)

Does frequent feasting hit the fusion-reactor ceiling
before it ever reaches a refresh? On this band: NO —
but the ceiling dominates everything after it arrives.
Refreshes happened first on both refresh seeds (73672:
refreshes days 61-69, reactor refusals from day 70;
73673: 11 refreshes, reactor never online). Once the
reactor IS online, it is total: 127/127 refused grants
on the refresh arm are reactor refusals, and the three
seeds that never refreshed (73674, 73675, 73678) got
nothing but refusals (12, 18, 4). Two instrument
honesty notes, stated now: (1) the refusal COUNTS are
inflated by the instrument — the base policy backs off
to a 14-day unarmed cadence under a reactor, but this
instrument clears the cadence marker every upkeep, so
it pings the ceiling daily instead of fortnightly; the
refusal REASON (reactor) is real, the daily rate is
not base-policy behavior. (2) The devotion gate is
never observed on this band — not because it doesn't
exist, but because the reactor check runs FIRST in
grantFeastBuff: any village that is both unarmed and
reactor-online reads as a reactor refusal, and every
feasting village here was armed-or-reactor. A
devotion-gate refusal needs an unarmed, reactor-free
feast, which no seed produced.

## WHY THE SIDE EFFECTS HAPPEN (mechanism, read from code)

hostFeast draws the pantry cost (pantryDraw) BEFORE it
calls grantFeastBuff at the end of the ritual. A feast
that the reactor refuses still ate the village's dinner.
That single ordering explains the guardrail misses:
- 73673: 17 granted feasts (6 fresh + 11 refresh) at
  ~1,500+ kcal each drained a village that its control
  self fed to 16,375 kcal and 9 people; the refresh
  village ended at 0 kcal, 4 people, 4 starvation
  deaths, lost day 159 with 56 deaths (control: won
  day 124, 28 deaths). Daily feasting is a pantry
  commitment, not a free buff refresh.
- 73675: 18 daily attempts, all reactor-refused, all
  still paid for out of the pantry — the village lost
  day 93 (control: survived 180 days) with 27 deaths.
  Refused feasts are not free feasts.
- 73672 is the counter-case: it could afford the habit
  (ended 180 days, 8 people, 36,761 kcal) and still won
  nothing — because driving off every draw forfeits the
  veteran pipeline (driveoff-a's price, re-measured
  here as 10 driven draws for 0 kills and 0 wave-4
  draws).
- 73678: only 4 grant attempts all run (all reactor
  refused) — the daily cadence only bites when the
  other gates pass (haven, affordability, recent gives,
  feastPlan). Where the village rarely qualifies to
  feast, the instrument is quiet; its trajectory still
  diverged (survived 180d global, no table) from a
  control that won day 116 on a feast draw it never got
  (no fresh grant, no draw, no strike kill).
- Arc IV: 0/8 on the refresh arm vs 4/8 control. No
  refresh-arm village reached Arc IV — the posture
  costs the whole late arc, not just the seat.

## SENSE-TESTING READ (one chain + narration + villager spot check)

The 73673 chain, in plain words: on day 40 the village
feasts — a proper feast, multiplier 2.03 — and the smoke
draws a speedbump turtle to the haven's edge. The watch
drives it off with brands; the devotion stays armed.
The next evening the village feasts again, and the game
says exactly what happened: "The feast carries you on —
the fire is stoked higher, not doubled. FEASTED ×2.03
until tomorrow's dawn (6 parts left): a proper feast.
(Re-feast refreshes; it never stacks.)" The same line
repeats days 42, 43, 44 — same multiplier, same window
word, same parenthetical. It reads as a refresh, never
as stacking: the fiction never claims a bigger fire,
only a longer one, and the numbers agree (untilDay
42 -> 43 -> 44 -> 45 -> 46, one day per feast). What it
does NOT read as is a system the village is choosing
with open eyes: nothing in the line says the window was
about to expire, or that feasting tonight (rather than
tomorrow) is what kept it alive — the player who feasts
daily gets refreshes without ever being told the
cadence is the trick. That is a telegraphing note, not
a bug: the line is honest about what happened, silent
about why tonight mattered.
Villager-behavior spot check: the refresh villages read
as feast-villages, not as buff-villages. The draws are
still answered by named watchers with brands (the
driveoff-a lines recur), the feasts still gather guests
and bonds, and nothing in the rows reads robotic or
repeated beyond the refresh line itself — which repeats
because the game state repeats (same quality, same
multiplier, same window length, five evenings running).
The repetition is the measurement, not a dialogue bug:
a village that feasts identically five nights running
gets an identical line five nights running. The one
genuinely new texture is the pantry: 73673's village
eats its way from plenty to zero while feasting daily,
and the rows show it (final pantry 0, starvation 4) —
the village that feasts every night is the village that
goes hungry, and the game never warns it.

## VILLAGE ASSESSMENT (plain words)

Three villages never met a feast under either policy and
lived identical lives — the refresh question never
touched them. Of the five that did: 73672 became a
daily-feasting village that refreshed three times, then
hit the reactor ceiling and spent the remaining 110
days pinging it, surviving to day 180 at global rank
with a fat pantry and no seat — a village that could
afford its habit and still won nothing, because it
drove off every beast it drew. 73673 became the
feast-village that ate itself: eleven refreshes, six
draws driven off, and a pantry run to zero by day 159
— the refresh branch working perfectly while the
village starved around it. 73674, 73675, and 73678 are
the ceiling's villages: they feasted daily into a
reactor hum and got nothing but honest refusals and a
lighter pantry, losing (73675) or stalling (73674,
73678) where their control selves won or survived.
The wall numbers say the same: national-ever actually
rose (7/8 vs 6/8 — 73675's refresh self reached
national before losing, where its control self never
did), but national-final fell (4/8 vs 5/8), the table
went to zero, and wave-5 stayed unborn on both arms.
Reaching national got easier; converting it into a
seat got impossible, because the seat's veteran pipeline
was driven off and the pantry was feasted away.

## WALL NUMBERS

Control: national-ever 6/8, national-final 5/8, table
invited 4/8, entered 4/8, wins 4/8, wave-4 reached 5/8,
wave-5 0/8, Arc IV 4/8, median survival 143d, max 180d,
deaths 260, starvation 9. Death-cause shares (of 260):
villager combat 162 (62.3%), player arena 32 (12.3%),
villager sickness 16 (6.2%), expedition 11, starvation 9,
ambush 5, wound-that-wouldn't-close 5, villager monster
5, player contest 3, villager alien 3, player dehydration
3, and 1 each for Bulldozer, Paparazzo, Living Wire,
lockjaw, the night, thirst.
Refresh: national-ever 7/8, national-final 4/8, table
0/8, entered 0/8, wins 0/8, wave-4 reached 5/8, wave-5
0/8, Arc IV 0/8, median survival 180d, median non-won
180d, max 180d, deaths 274, starvation 9. Death-cause
shares (of 274): villager combat 166 (60.6% —
'villager combat' 88 + 'combat' 78), player arena 38
(13.9%), expedition 16 (5.8%), villager sickness 16
(5.8%), starvation 9 (3.3% — villager 8 + player 1),
ambush 4, wound-that-wouldn't-close 6, villager monster
6, villager alien 4, player contest 3, and 1 each for
Bulldozer, lockjaw, experiment, Paparazzo, dehydration,
the night. The wall stands on both arms: wave-5 0/8,
and the refresh arm produced zero wave-4 veterans from
draws against the control's one.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the assigned blank, backlog #1065): the feast
  refresh branch, exercised and classified on the shared
  band — 14 refresh grants, draws on refresh 0, window
  extended 14/14, reset to fresh length 14/14, circling
  draws at refresh 0 in sims (method-proven to survive
  untouched), chains up to 5 grants, chain-breakers
  (gap days, reactor ceiling, village end), refusal
  census (reactor 127, devotion 0, other 0).
- FILLED (mechanism, corrected by data): daily feasting
  reaches refresh easily — the 7-day cadence, not game
  code, was the blocker; the reactor ceiling does not
  pre-empt refresh (refreshes precede it) but dominates
  after it; a refused feast still costs pantry food
  (hostFeast draws before granting), which is the
  channel for the starvation and collapse side effects.
- FILLED (sense): the refresh narration is honest and
  explicitly anti-stacking ("stoked higher, not
  doubled"), but silent about why tonight's feast
  mattered (no expiry warning); the line repeats
  identically because the game state repeats identically.
- DOCUMENTED, NOT FIXED (named next blanks, proposed
  for the coordinator to number): (1) refresh with a
  HIGHER quality than the live buff (thin -> legendary)
  is still unmeasured — every chain here was quality 1
  throughout, so "better quality wins" held only
  trivially; (2) the devotion gate is never observed on
  this band because the reactor check runs first — an
  unarmed, reactor-free feast is needed to see it;
  (3) the refresh line's missing expiry telegraph (why
  tonight matters) is a narration note for a future
  feel pass, not a fix made here; (4) the drive-off
  confound is still inseparable from the refresh
  posture via the established SEEK_FIGHTS gate (a
  patrol-preserving, face-draw-then-refresh policy would
  need competent-level surgery — and would hit the
  devotion gate after the faced fight anyway, per the
  spend rule — so it may be structurally unreachable,
  which is itself worth one design note).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: a QUALITY-STEP refresh arm (DIAG, same band,
same recorders). Pre-registration sketch: (1) a policy
that feasts thin (quality 0) then follows with a rich
feast (quality 2) inside the window — the feast quality
formula (variety + meat + turnout + cold seats) is the
lever, so the policy needs a pantry-composition trick,
not just cadence; if quality cannot be stepped by
policy alone, the arm reports that as the finding
instead of forcing it; (2) record whether the refresh
raises quality/mult and whether the narration changes;
(3) the lever question for the scale wall: none — this
is a branch-completeness arm, and it must not be
scored as a wall lever. Separable second question for
the coordinator (not this arm): re-confirm the
published control band is retired — this run's control
side is the third consecutive 8/8 reproduction of the
rebaseline table.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No GO leg or guardrail line was re-scored mid-run. The
run was judged exactly against its pre-registered
header: leg (a) classification complete (unclassified 0
both arms, errs 0, unmatched 0 — achieved); leg (b)
refresh exercised >= 10 (achieved: 14); leg (c)
draws-on-refresh counted (achieved: 0, no header
contradiction); leg (d) refusal reasons classified
(achieved: 127/127, reactor 127, devotion 0, other 0).
Guardrails were pre-registered as reported-not-verdict-
flipping for this DIAG arm, and are reported as such:
starvation total PASS, median-non-won PASS,
national-ever PASS, per-seed starvation FAIL (73673
+4), wins FAIL (0 vs >= 3) — the failures are
diagnostic side effects of the daily-feast + drive-off
posture, not a re-scored verdict. Two method notes,
neither a revision: (1) the first backgrounded sweep
loop's session vanished after the control arm with no
completion record (same class as rebaseline-a's note) —
no rows were lost (all 8 control rows were on disk)
and the refresh arm was re-run one seed per exec call,
each row verified on disk before the next; the summary
was computed from the 16 on-disk rows, not from loop
output. (2) The say-line capture hit its 120-line cap
on long seeds (the FEASTED pattern matches frequent
lines) — refresh lines still survived on both refresh
seeds (3 + 11 lines), so the sense read is quoted from
the corpus, not reconstructed; a future sweep should
narrow the capture pattern. The telemetry-check and
balanced panel were NOT run, per the standing exception
for recorder rows (panel cannot ingest per-seed recorder
corpora). The sweep-compare table + analyzer output are
the comparison of record. The telemetry baseline was NOT
rolled. No game code changed in this run; no
[needs-eyes] flag applies (DIAG-only, no narration or
behavior added; the sense read found a telegraphing
note, not a narration gap needing eyes).

## Infrastructure notes

- Sweep: scripts/test-feastrefresh-sweep.js (two arms,
  control + refresh, identical seeds; feastdraw-diag +
  nonworldkill-diag recorders only). Corpus:
  evidence/2026-10-26/perseed-sim-feastrefresh-a/ (16 rows
  + summary.json). Policy:
  scripts/policies/feastrefresh.js (FEASTREFRESH=1,
  FEASTDRAWDRIVEOFF=1, COMPETENT_SEEK_FIGHTS=0 on the
  refresh arm only). Unit + method proof:
  scripts/test-feastrefresh-a.js (29/29). Det-gate: PASS
  (seed 73671, policy-off == tableseat-nowait).
- Commit: sim-feastrefresh-a, DIAG-GO (refresh branch
  exercised + classified; guardrail misses flagged as
  diagnostic side effects), zero src/js diff. Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).
