# sim-prestage3tap-b — PREREGISTRATION (committed BEFORE any judged run)

Run: oversight-flesh-out-loop-b, arm sim-prestage3tap-b
(run fleshout-loop-b-20261028T2126Z, axis food-economy, ARM 2).
POLICY-SIDE MEASUREMENT ONLY: the insideevening policy file
(scripts/policies/insideevening.js) already exists on the base
and is NOT modified, its defaults are NOT changed, and zero
src/js changes are made. The only new files are measurement
instruments (a tap-window driver, an analyzer, a proof test).
This arm measures an existing policy in a new window; it does
not land a new lever. A NO-GO here kills nothing except the
claim that the early window adds marginal value.

## Gap (from sim-insideevening-b, run 1930Z)

By the 1930Z tap days (loop-days 26-30) most seeds had reached
integration stage 3, so havenStoresAccess() read 'remote' away
from home and the inside lever's marginal value was measured
together with the remote fallback (confirm 10714: 5 away taps,
4 success-clean + 1 success-caught, remotely). The open item,
named in sim-insideevening-b's metric review: preregister
earlier tap days from the start and measure the lever in the
pre-stage-3 window, where the remote fallback does not exist
yet and an inside evening should be the ONLY route to a
successful pantry tap.

## Canon read before building

- docs/CANON.md (manifest) — read first.
- docs/ABILITY-REFUSALS.md — pantry doors/ledger canon: the
  gate is havenStoresAccess() (insideHaven AND haven tile,
  exile override, stage-3 remote fallback). This arm moves
  nothing in the gate; it reads the gate at tap time.
- src/js/game.js havenStoresAccess() (code-read, not canon
  invention): 'inside' iff insideHaven AND playerTile type
  'haven'; else 'remote' iff integrationStage() >= 3; else
  'none'. integrationStage() (src/js/progression.js): 0
  pre-System, 1 overlay, 2 neural creep (integration >= 40),
  3 full integration (integration >= 80). So "pre-stage-3"
  means stageAtTap in {0, 1, 2}: no remote fallback, and an
  away tap must read 'none'.
- No canon doc covers "evenings end inside" as a policy rule
  (same statement as sim-insideevening-b); the evening step
  reuses only honest player verbs already in the game.

## Instrument: scripts/prestage3tap-trace-b.js

A copy of scripts/insideevening-trace-b.js with exactly one
behavioral change: TAP DAYS ARE LOOP-DAYS 8-12 (env TAPSTART=8,
TAPEND=12), NOT the last 5 loop-days. Everything else is
identical: fresh game per seed via scripts/sim-harness.js,
same grant fixture (thief ability granted at setup so the
tap is offered), same wrapped policy.daily recording
morning position (post-sleep, pre-daily, loop-days 2+),
evening position (post-daily, pre-sleep), and on TAP DAYS
ONLY a genuine thief tap (button read via
Game._actionAvailable, null target; if and only if ok,
Game.activateAbility('thief.steal_pantry') with NO target),
recording accessAtTap, stageAtTap, insideAtTap, tileAtTap,
ownsThiefBefore, button ok/why, outcome class, and say
window. The window is NEVER moved after the fact: TAPSTART
and TAPEND are fixed in this prereg, and any run with
different values is a different arm, not this one.

Why loop-days 8-12: early enough that most seeds should
still be below stage 3 (the System arrives around day 7
and integration climbs from there), late enough that the
village has had a week to settle and the player has had
at-haven evenings to measure. The run still lasts 30
loop-days total, so post-tap survival to day 30 is
observed on the same horizon as the 1930Z arm and the
guards stay comparable. Tap days consume ticks/kcal like
any played tap, so post-tap trajectories diverge from a
tap-free run — stated, not hidden — but both legs are
tapped identically, so the comparison stays clean.

Substrate (asserted FATAL, same as the 1930Z arm):
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1.
Both legs run on this substrate, so the ONLY difference
between control and policy is the evening step.

## Horizon (death-aware, never a fixed 200d)

30 loop-days per instance. Why 30: same as the 1930Z arm —
a real evening rate (up to 30 evenings per seed) and a
month of survival exposure, with the tap window placed
early inside it. Dead instances stop simulating (runDays
ends on Game.over); their already-made evenings count and
the instance is flagged ended-early. No +10d tail is
needed: the evening record stops at death, it is not
projected.

## Seed bands (freshness verified BEFORE judging)

- Pilot: 10900-10907 (8 seeds). Confirm: 10910-10925
  (16 seeds). Filename check 2026-10-28: no corpus file
  in evidence/ is named *-s10900..s10907 or *-s10910..
  s10925 as a judged seed (109xx hits in the tree are
  kcal values, day numbers, and line numbers, not judged
  seed bands); the heavily used recent bands (10700-10725
  from the 1930Z arm, 10040-10065, 104xx) are avoided.
- Baseline (competent) and policy run on IDENTICAL seeds
  in each band. Pilot gate: 8 seeds before/after before
  ANY confirm spend.

## Primary metrics (the ONLY judged metrics)

Per policy leg, over tap days (loop-days 8-12) that reached
an evening record (instance alive at daily-end):

- P1 pooled tap-day inside rate = (tap-day evenings ending
  inside: driver position inside=true AND tile 'haven') /
  (tap-day evenings at haven at daily-end, pre-step:
  policyBefore.tile 'haven' on the policy leg, post-daily
  tile 'haven' on the control leg). Bar: P1 >= 0.80 on the
  policy leg. A tap-day evening that ends outside at haven
  (walk-no-path / no-go-inside-button / entry-refused)
  stays in the denominator — it is a lever failure, not
  an exclusion. Away tap-day evenings are excluded from
  both sides (the lever never attempts them, by design).
- P2 pre-stage-3 majority = share of policy-leg tap rows
  (all tap rows recorded on tap days, issued or
  button-refused — stageAtTap is recorded either way)
  with stageAtTap < 3. Bar: P2 > 0.50. If P2 fails, the
  window was not pre-stage-3 and the marginal-value
  claim cannot be judged from this band — that is a
  NO-GO on the window, not a reason to move it.
- P3 per-seed inside tap = at least one tap day with
  accessAtTap 'inside' AND an issued tap (outcome
  'attempted'). Bar: pilot >= 6/8 seeds, confirm
  >= 12/16 seeds (same bar shape as the 1930Z arm's M2,
  so the two windows compare directly).
- Guards (relative, same as the 1930Z arm): G1 median
  loop-days survived (policy) >= 0.8x median loop-days
  survived (control) on the same band; G2 starvation
  deaths (policy, by death cause where recorded) <=
  control + 2.

Marginal value (REPORTED, not a separate GO bar — it is
the interpretation of P1+P2, not a second threshold to
shop between): among policy-leg tap rows, the counts by
accessAtTap (inside / remote / none) crossed with stage
band (< 3 / >= 3); among inside taps, the attempted
outcome classes (success-clean / success-caught /
impl-refused-* / other); among away taps at stage < 3,
the hall-refused share (button-refused with the hall
why, or impl-refused-hall). The expected early-window
shape, stated before running: remote taps near zero,
away taps at stage < 3 hall-refused, inside taps the
only successful route — the mirror image of the 1930Z
late window, where remote taps succeeded. The
comparison numbers reported against 1930Z are its
published confirm numbers (policy inside taps 5/5 on
13 seeds, 4/5 on 1, 0/5 on 2 away seeds; control inside
taps 0 on every seed; confirm 10714's 5 remote taps),
not a re-run of the late window.

Comparability metrics (REPORTED, not judged — the judged
set above is complete): overall at-haven inside rate per
seed (the 1930Z arm's M1, bar 0.5 per seed, expected to
pass given the 1930Z GO, but a miss here does not rescue
or sink P1/P2/P3); control-leg tap-day access
distribution (expected: mostly 'none' at stage < 3,
matching thiefhall); morning persistence (mornings after
an inside evening still inside).

Wall numbers (REPORTED for every judged corpus, even if
zero): per-seed maxWaveUnlocked and waveKills from the
driver, median survival, and national / table / wins —
the 30-day instrument emits no national/table/win flag,
so those are reported as 0 observed / not emitted by
this instrument, never as a panel result. NO balance-panel
compare .md is produced (same fake-panel note as the
1930Z arm): a 30-day position/reachability measurement
cannot move or observe panel metrics, and a compare over
zero-variance panel metrics would be a fake comparison.
If either guard fails, a longer-horizon panel run is the
named follow-up before any landing claim, not a mid-run
rescue.

## Verdict rule (judged ONLY against this prereg)

- GO (pilot): P1 >= 0.80 AND P2 > 0.50 AND P3 >= 6/8 AND
  G1 AND G2 all hold. Then confirm on 10910-10925 under
  a confirm addendum committed BEFORE any confirm run.
- GO (confirm): P1 >= 0.80 AND P2 > 0.50 AND P3 >= 12/16
  AND G1 AND G2 all hold on the confirm band. The verdict
  is then: the pre-stage-3 window isolates the inside
  lever's marginal value (inside is the only successful
  tap route before stage 3). No game or policy change
  lands from this arm — the insideevening policy file
  already exists; this arm is measurement of it.
- NO-GO: any judged leg misses its bar. The blocking
  step is named per failing seed (away / walk-no-path /
  no-go-inside-button / entry-refused / button-refused /
  game-over / zero-at-haven tap evenings), with counts
  — NOT re-scored against a friendlier metric (e.g.
  counting away evenings as inside, counting a refused
  entry as inside, counting a tap issued from the
  grounds as an inside tap, or moving the window).
- DIAG-NO-GO (instrument failure, distinct from NO-GO):
  the corpus is incomplete (evenings missing
  position/access, tap days missing tap outcomes or
  stageAtTap), or any claimed inside evening rests on
  an entry that skipped the adjacency + cellActions
  checks. A DIAG-NO-GO invalidates the run, not the
  lever.

## Sense-check (pre-registered)

Read at least one full early-window inside evening
end-to-end (the day's last lines: walk quote, "You step
into the Haven hall.", sleep, dawn position) and at
least one away tap at stage < 3 end-to-end, and judge
plainly: does coming home, stepping inside, and tapping
the pantry from the hall read like a sensible played
evening — and does the away tap's refusal read as the
honest physical fact (hands not in the hall) rather
than a harness artifact? Say which, with the trace
numbers behind it. Do not fill silence with invention:
if no transcript line explains a step, say so.

## Metric review (carried, not re-scored)

- Tap-day vs loop-day vs game-day: loop-days are
  harness days; game day is published per evening row.
  Tap days consume ticks/kcal, so later evenings follow
  a tapped trajectory; evening rows are labelled
  tap-day or not so this is visible.
- Ownership confound (carried from the 1930Z arm): the
  grant fixture's bearer may be succeeded before the
  tap days, so a tap can answer "You don't have that
  ability." even from inside. P3 counts access on an
  issued tap, not lift success, so ownership loss
  neither passes nor fails a seed on its own — but
  tap OUTCOME classes (clean/caught) undercount what an
  owned ability would have done. Tap-day outcome
  tallies are therefore reported as tap-window
  observations, not as lift rates. Early tap days
  (8-12) should REDUCE this confound vs the late
  window (fewer bearer deaths by day 12 than by day 30);
  the bearer-death count by tap day is reported so
  this can be checked, not assumed.
- Stage is read at tap time (stageAtTap), not assumed
  from the loop-day: integration climbs on its own
  schedule per seed, so a seed can cross stage 3
  inside the window. P2 is a pooled share, not a
  per-seed gate, for exactly this reason.
- Exile reads 'none' in the gate regardless of stage;
  exiled tap rows are reported separately if any occur
  (exiledAtTap), not folded into the remote/none
  counts silently.
- Control inside evenings are spawn days, not a
  competing behavior (1930Z finding, carried): competent's
  only inside evenings are loop-days 1-2. The control
  tap-day access distribution is therefore expected to
  be mostly 'none' in this window — which is the point:
  the control shows what the tap reads without the lever
  before stage 3.
