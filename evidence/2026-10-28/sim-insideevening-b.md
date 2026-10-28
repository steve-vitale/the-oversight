# sim-insideevening-b — a policy whose evenings end inside

Run: oversight-flesh-out-loop-b, arm sim-insideevening-b
(run fleshout-loop-b-20261028T1930Z).
POLICY-SIDE ARM ONLY: one new file in scripts/policies/
extending competent — zero src/js changes, zero default
flips, zero changes to competent.js itself.

## Verdict against the pre-registered bars (judged ONLY against evidence/2026-10-28/sim-insideevening-b-prereg.md, committed as d7980c5 BEFORE any judged run, and its confirm addendum evidence/2026-10-28/sim-insideevening-b-confirm-prereg.md, committed as 46e37b3 BEFORE any confirm run)

**GO — pilot and confirm both pass, on the same
instrument, same substrate, same bars.** The policy
moves evenings inside on every at-haven evening it
touches, and a genuine thief tap issued from that
evening's position reads 'inside' — no manual evening
procedure needed. The control (competent) never does
this past the spawn days: its inside-evening rate sits
at 0.07–0.09 on both bands.

Pilot (8 seeds 10700–10707, 30 loop-days):
M1 8/8 seeds pass (rate 1.00 on every seed),
M2 7/8 (bar 6), G1 holds (median days 30 vs 30),
G2 holds (starvation 1 vs 0, within control+2).
Confirm (16 fresh seeds 10710–10725, 30 loop-days):
M1 16/16 seeds pass (rate 1.00 on every seed),
M2 14/16 (bar 12), G1 holds (median days 30 vs 30),
G2 holds (starvation 1 vs 1, within control+2).
**CONFIRM-GO — the arm is landable as a policy file.**

## The policy (what was built)

`scripts/policies/insideevening.js` — `insideevening`
extends competent (requires ./competent, delegates
setup/upkeep/fight unchanged) and wraps daily():
competent.daily runs, then the evening step, as the
evening's LAST step before the harness's sleep:

- Already inside (insideHaven + haven tile): count it,
  no walk, no entry call.
- On the haven tile, outside: walk to a lodge-adjacent
  cell via beginPathWalk + pathStep (the thiefinside
  walk, preferring the (4,5) doorstep dirt), read
  Game.cellActions at an adjacent lodge cell, and ONLY
  if the list contains 'Go inside' at Chebyshev
  adjacency <= 1, dispatch that label exactly as app.js
  doContextAction does (Game.enterBuilding(); refresh
  is DOM-only and skipped). Entry must return true AND
  land inside on the haven tile, else the failure step
  is recorded (walk-no-path / no-go-inside-button /
  entry-refused / walk-interrupted-combat).
- Away (not on the haven tile): NO trek home — a day's
  walk away is not walked home in the evening just to
  sleep inside. Away evenings are enumerated, excluded
  from the rate denominator.
- In combat / pending encounter / tent: no entry
  attempt (blocked-combat / blocked-tent).
- The policy does NOT exit in the morning: the next
  day's competent.daily runs from wherever the night
  left the player, and its own trips exit honestly
  when they travel.

"At/near haven" means the haven tile's own grounds:
the walk is the few detail squares to the lodge. It
does NOT mean travelling home from another map node.

## The numbers (before/after on identical seeds)

Driver: `scripts/insideevening-trace-b.js` — fresh game
per seed, same nofeast substrate on both legs
(COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1), 30 loop-days, tap days = last 5
loop-days, genuine thief tap (button read ok ->
activateAbility, no target) exactly as thiefinside.
Analyzer: `scripts/analyze-insideevening-b.js`.

### Pilot (10700–10707)

Policy leg, per seed (at-haven evenings / inside /
rate / inside taps of 5):
10700: 12/12 1.00, 1 inside tap (its other 4 tap days
were away — see below); 10701: 24/24 1.00, 0 inside
taps (all 5 tap days away); 10702–10704: 30/30 1.00,
5 inside taps; 10705: 28/28 1.00, 5; 10706–10707:
30/30 1.00, 5. M1 8/8, M2 7/8.
Control leg: at-haven 23–30, inside 2 on EVERY seed
(loop-days 1–2 only — the spawn-inside days; after
that competent.daily exits daily and never returns
inside on its own), rates 0.07–0.09, 0 inside taps on
every seed. M1 0/8, M2 0/8.
All 16 pilot instances survived 30 loop-days
(median 30 vs 30, G1 holds). Starvation deaths:
policy 1, control 0 (G2 holds: 1 <= 0+2).
Morning persistence (policy): a morning after an
inside evening was still inside on 206/207 mornings
(pilot; the one miss is an upkeep verb moving the
player before daily — see metric review).

### Confirm (10710–10725)

Policy leg: rate 1.00 on ALL 16 seeds (at-haven
evenings 5–30, inside = at-haven on every seed).
Inside taps: 5/5 on 13 seeds, 4/5 on 10717, 0/5 on
10714 and 10720. M1 16/16, M2 14/16 (bar 12).
Control leg: inside 2 on every seed (loop-days 1–2
again), rates 0.07–0.08, 0 inside taps on every seed.
All 32 confirm instances survived 30 loop-days
(median 30 vs 30, G1 holds). Starvation deaths:
policy 1, control 1 (G2 holds: 1 <= 1+2).
Morning persistence (policy): 408/411 mornings after
an inside evening were still inside (99.3%; misses on
10712 morning 21, 10720 morning 18, 10722 morning 30).

### The two confirm M2 failures, named (not smoothed over)

- 10714: 23 at-haven evenings, all inside, but its
  5 tap days were all away at trail_edge (1
  blocked-combat + 5 away evenings at the end of the
  run, tile trail_edge throughout). Its taps still
  succeeded — remotely (stage 3): 4 success-clean,
  1 success-caught — but M2 counts inside taps, and
  there were none. Away failure, not a gate failure.
- 10720: only 5 at-haven evenings in 30 days (23 away,
  2 blocked-combat); all 5 tap days away (meadow /
  grove) or in combat, taps reading 'remote' and
  refused on ownership ("You don't have that
  ability."). Away failure, not a gate failure.
- Pilot M2 failure, same class: 10701's 5 tap days
  were all away (grove / creek) after a blocked-combat
  evening on loop-day 25.

The pattern across all three failures: the lever
never fails on a haven evening (rate 1.00 everywhere
it applies); it fails only when the player spends the
tap days away from home, where no evening step is
attempted by design. A policy that ALSO trekked home
nightly would convert these — that is a different
lever (nightly travel home), not this arm, and it is
named in the backlog notes, not smuggled in here.

### Evening outcomes, both bands (policy leg)

Pilot + confirm combined (720 policy evenings):
already-inside 59, walk+go-inside 579, not-attempted-
away 76, blocked-combat 6 — and the 6 blocked-combat
evenings all sat on away tiles (grove / trail_edge),
never on the haven tile. 0 walk-no-path,
0 no-go-inside-button, 0 entry-refused,
0 walk-interrupted-combat anywhere. No walk ever
failed, no button was ever missing, no entry was
ever refused, on either band.

## Sense-testing (read end-to-end, judged on meaning)

Pilot, seed 10702, loop-day 26 (a walk+go-inside
evening): the day's tail reads "You make a Snare…",
"Valeria left 1 wood log by the stash. No
announcement. That's how it works here.", a language
moment with Luis, a trust sting — then "Walking 5
squares (5 kcal)…" and "You step into the Haven
hall." — then the tap: "A hand closes on your wrist.
'Really?' -20 trust. The pantry remembers. (Light
Fingers — caught.)" plus "(−120 kcal — food becomes
thief.)". Position, narration, and tap agree at every
step: grounds → hall → pantry lift, caught in the
hall whose stores were lifted.

Confirm, seed 10710, loop-day 26: "Walking 4 squares
(8 kcal)…", "You step into the Haven hall.", then
the tap from inside — refused, but NOT by the gate:
"You don't have that ability. (Light Fingers)" — the
grant fixture's bearer had been succeeded by then
(the ownership confound, carried from thiefinside's
confirm). The gate opened; the hands were gone. The
refusal is honest about which thing failed, and the
instrument records it as ownership loss, not as a
gate observation.

Judgment: the inside evening reads as a **sensible
played evening, not a harness artifact**. A villager
who ends the day at home walks the few squares to
the lodge, steps inside, and sleeps in the hall —
and the next morning is still inside (408/411
confirm mornings). The one silence worth naming:
nothing in the game's own lines tells a player this
is the thing to do at evening time — the step is the
policy's habit, not a hint the game gave. A player
who never thinks to step inside still meets
thiefhall's paid refusal on grounds evenings, which
is exactly why the thief precheck question (from
thiefinside) still stands on its own.

## Village assessment (plain words, within what 30-day instances can say)

These are month-long villages, not lived ones — but
the shape repeats 24 times: the player comes home,
and instead of bedding down on the grounds among the
tents, they walk to the lodge and sleep inside the
hall. Mornings start inside. The pantry is reachable
from the evening's own position — every inside-gated
tap the evening offers now opens without a manual
procedure. Villages whose players spend weeks away
(meadow, grove, trail_edge — 10720 spent 23 of 30
evenings away) simply never get that evening at home,
which is honest: away means away, and the lever does
not pretend otherwise. Survival does not move: every
instance on both bands survived 30 loop-days, and
the starvation counts (pilot 1 vs 0, confirm 1 vs 1)
are bearer deaths mid-run with succession
continuing, not run-ending starvations. Blanks
filled: (1) the inside-evening policy demonstrated,
not just proposed — rate 1.00 on every at-haven
evening on both bands; (2) inside-gated tap
reachability from a played position measured —
inside taps on 7/8 pilot and 14/16 confirm seeds,
0 on every control seed; (3) morning persistence
measured — inside evenings survive the night
(408/411 confirm). Documented, not fixed: the thief
precheck (thiefinside's design question, unchanged);
the DOM-tap entry (browser follow-up, unchanged);
nightly-travel-home as a separate lever (below).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered (arenalabel precedent): this leg is a
30-day position/reachability measurement, not a game
change, and panel metrics (national / table / wins,
wave reach) cannot move — and cannot even be
observed — inside 30-day instances. A panel compare
over zero-variance panel metrics would be a fake
comparison. The before/after instrument for this leg
is the custom driver on identical seeds (control
competent vs policy insideevening), and the
pre-registered thresholds above are the judge.
If either guard (G1/G2) had failed, a longer-horizon
panel run was the named follow-up before any landing
claim — neither guard failed, so none was run.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg + confirm addendum
  as written. No mid-run re-scoring: the M2 failures
  (10701 pilot; 10714, 10720 confirm) are away
  failures counted as failures, not re-classified;
  the remote confound (below) is reported, not used
  to rescue or to sink any seed.
- Remote-access confound, stated plainly: by tap
  days (loop-days 26–30) most seeds have reached
  integration stage 3, so havenStoresAccess() reads
  'remote' away from home, and control taps succeed
  remotely when the grant survives (e.g. confirm
  10714's 5 away taps: 4 clean, 1 caught). The
  inside lever's marginal value is therefore
  pre-stage-3; the late tap window measures the
  lever plus the remote fallback together. The window
  was deliberately NOT moved post-pilot (that would
  be re-scoring); a future arm that wants the
  pre-stage-3 window should preregister earlier tap
  days from the start.
- Ownership confound, stated plainly: on 30-day
  runs the grant fixture's bearer is often succeeded
  before the tap days (player-flagged deaths in the
  corpus, e.g. pilot 10700 day-12 starvation, day-29
  sickness; confirm 10720 day-9 starvation), so late
  taps answer "You don't have that ability." even
  from inside (confirm 10710 tap day 26) or remotely.
  M2 counts access on an issued tap, not lift
  success, so ownership loss neither passes nor
  fails a seed on its own — but it does mean late
  tap OUTCOME classes (clean/caught) undercount
  what an owned ability would have done. Tap-day
  outcome tallies are therefore reported as
  tap-window observations, not as lift rates.
- Control inside evenings are spawn days, not a
  competing behavior: competent's only inside
  evenings on both bands are loop-days 1–2
  (spawn sets insideHaven true; the first two dailies
  do not travel out). After that, competent never
  ends inside on its own. The control rate 0.07–0.09
  is that spawn residue, not an evening habit.
- Morning-persistence misses (confirm 3/411, pilot
  1/207): a morning after an inside evening that
  reads outside. The mechanism was not traced per
  miss; the plausible class is an upkeep verb that
  travels during the 3 pre-daily upkeeps (e.g.
  feastFightRoad patrolling while feasted). It does
  not affect any verdict: the evening rate is
  measured pre-sleep, and the morning rate is a
  secondary observation. A future arm tracing the
  exact upkeep mover would be measurement, not a
  lever change.
- Walk-quote variance, observed not explained: pilot
  walks quoted 5 kcal for 5 squares on seed 10702
  (vs thiefinside's usual 2 kcal/square); confirm
  walks quoted 8 kcal for 4 squares. The game's own
  quote is recorded per evening; the mechanism
  (walkStepKcal variance) was not traced and is not
  claimed. It does not affect any verdict: every
  walk completed and every entry succeeded.
- Starvation-guard reading: the guard counts deaths
  whose telemetry cause matches starvation, on
  either leg. Pilot policy 1 (day-12 bearer death,
  succession continued, instance survived to 30);
  confirm policy 1 and control 1 (both bearer deaths
  mid-run, both instances survived to 30). The guard
  is therefore about bearer starvation pressure, not
  run-ending famine — stated so the numbers cannot
  be misread as "a village starved".
- Day-30 death spam, observed: pilot 10700's corpus
  carries many day-30 monster deaths (hushwolf,
  ducks_in_a_row repeats) — the last loop-day's
  fights resolving as the run caps. Not investigated:
  it is outside this arm's metrics and does not touch
  any evening or tap row.
- Absent fields reported as absent: exile /
  systemArrived absent reads falsy in the gate, same
  as false; gate reproduction (proof T4) is
  unaffected, but "absent" is not "measured false".
- Tap-day vs loop-day vs game-day: loop-days are
  harness days; game day is published per evening
  row. Tap days consume ticks/kcal, so later evenings
  follow a tapped trajectory; evening rows are
  labelled tap-day or not so this is visible.
- Index-clobber repairs (infrastructure, not
  measurement): every safe-commit.sh commit in this
  worktree showed the known clobber variant (commit
  correct, main index showing bogus staged deletions
  + untracked files for the same paths). Each was
  repaired the same way (git update-index --add
  --cacheinfo with the HEAD blob) and verified with
  an empty `git status --short` before proceeding.
  No commit content was ever in doubt — verified via
  `git show --stat HEAD` each time.

## Proof

- `node scripts/test-insideevening-b.js --before
  <control-corpus> --after <policy-corpus> --seeds
  <band>` — PROOF-GREEN on both bands: pilot legs
  T1–T8 (240 + 240 evenings, policy-vs-driver
  agreement, gate honesty, tap honesty, no src/
  changes, sense anchor); confirm legs T1–T8
  (480 + 480 evenings, same legs).
- Pilot trace: COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=competent /
  insideevening, SEEDS=10700–10707, DAYS=30,
  TAPDAYS=5 — 8 + 8 files, exit 0, corpora
  evidence/2026-10-28/sim-insideevening-b-corpus-competent/
  and sim-insideevening-b-corpus-insideevening/,
  analysis evidence/2026-10-28/sim-insideevening-b-analysis.json.
- Confirm trace: same command with
  SEEDS=10710–10725 — 16 + 16 files, exit 0,
  corpora evidence/2026-10-28/
  sim-insideevening-b-confirm-corpus-competent/ and
  sim-insideevening-b-confirm-corpus-insideevening/,
  analysis evidence/2026-10-28/
  sim-insideevening-b-confirm-analysis.json.
- `node --check` clean on all four new scripts.
  `node scripts/check.js --quick` (290 scripts) was
  started during this run and was still running when
  this evidence was written (see note below); the
  arm's binding proofs are the node proof tests
  above, and no src/js file was touched (proof T7).
- No [needs-eyes]: policy-side arm, nothing
  player-visible by default (the policy ships only
  if a driver adopts it; no default flips here).
  Zero src/js files in this arm's commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [follow-up] DOM-tap entry for the lodge: a browser
  playtest tapping the lodge card's 'Go inside' button
  on a phone remains the step to call an inside
  evening fully played. Node proves the handler route
  + genuine thief tap; only the DOM card tap is
  unproven. (carried from thiefinside)
- [follow-up] thief precheck (specified next arm):
  §2-style pre-payment precheck for thief.steal_pantry
  — gate-only vs gate+empty+heavy scope, button why
  wording, and whether thief deserves a precheck at
  all are Steve's calls (thiefinside design question,
  unchanged by this arm).
- [follow-up] nightly travel home as a separate lever:
  the only M2 failures on both bands are tap days
  spent away (10701, 10714, 10720). A policy that
  travels home at evening time when within reach
  would convert those — but it is a travel lever
  with its own survival costs, not part of this arm,
  and needs its own prereg.
- [follow-up] pre-stage-3 tap window: a future arm
  that wants the inside lever's marginal value
  without the stage-3 remote confound should
  preregister earlier tap days (e.g. loop-days 8–12)
  from the start, rather than moving this arm's
  window after the fact.
- [infrastructure] check.js --quick: 290 scripts,
  still running when this evidence was written; the
  run's FAIL lines (if any) are not yet known and
  are NOT claimed here. The coordinator should read
  the run's final tally before treating check.js as
  green for this branch. (This arm's own proofs are
  PROOF-GREEN on both bands; no src/js was touched.)

## Convergence line

insideevening-policy — evenings-end-inside policy
(POLICY-SIDE ONLY, zero src/js): competent + evening
step (walk + 'Go inside' when the day ends at haven,
no trek home, no mid-fight/tent entry) ends evenings
inside on 100% of at-haven evenings on both bands —
pilot M1 8/8 (control 0.07–0.09), confirm M1 16/16
(control 0.07–0.08); genuine thief taps from the
evening position read 'inside' on 7/8 pilot and
14/16 confirm seeds (bar 6 / 12; failures all away
tap days: 10701, 10714, 10720), 0 on every control
seed; mornings after inside evenings still inside
408/411 confirm; survival guards hold both bands
(median 30 vs 30; starvation pilot 1 vs 0, confirm
1 vs 1); proof PROOF-GREEN both bands (pilot 240+240,
confirm 480+480 evenings). CONFIRM-GO — landable as
a policy file.

## Verdict (judged against the pre-registered bars, not re-scored): GO (pilot GO + confirm GO)
