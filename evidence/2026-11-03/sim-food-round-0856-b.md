# sim-food-round-0856-b — coordinator evidence (axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0856Z,
axis food-economy (second non-converged axis; Loop A live on
scale-onramp throughout, NOT touched — A landed its 0815Z arms
mid-run as e88e9c1ff and started a new run 0940Z, also NOT touched).
Claim written before any sims; lock created at run start.
Pre-flight: main tree clean at 5a38438cb, disk 29%, reaper removed
nothing sibling-owned. Master moved under this run three times
(gap-w5window 5440b7747 before worker registration, Loop A
sortiev2-a e88e9c1ff during worker 1 closeout, Loop A coordinator
evidence 386170cc6 during worker 2 closeout) — zero file overlap
with either arm; both worker branches rebased onto the moving tip
before merging, arm-file diffs verified (sensorconfirm3: 6 files;
guardcasc: 15 files), proofs re-run green on rebased tips.

## Arm 1 — sim-sensorconfirm3-b: INSUFFICIENT-DATA at the calibration gate (merged 9ca8633a0)

Worker commits e62aba03f (prereg) / cdb458c67 (tools) / 9ca8633a0
(evidence), rebased clean onto e88e9c1ff, proofs re-run green
(test-sensorconfirm3-b.js 22/22). Prereg: screen-then-tracer
confirm, fresh band 82001-82200 verified disjoint from all
consumed sensor bands (79xxx screen, 767xx, 522 subset,
80001-80024, 81001-81056).

The run stopped at STEP 3, the calibration gate, exactly as the
prereg orders. The screen tool reproduced only 4/7 known
classifications. All 3 misses are the same direction: villages
that starved on every prior run now survive 30 days with zero
starvation deaths (80008: lost day 20 / starvation day 18 ->
survived; 80016: lost day 29 / day 28 -> survived; 81053: lost
day 30 / day 26 -> survived). Day-1 pantry identical on all
three misses and 80008's deaths through day 10 match archived
exactly — the harness, seed, and policy invocation are right;
the game underneath moved. Per the prereg, ANY calibration
mismatch = INSUFFICIENT-DATA, instrument failure, no fallback
method — so NO screen of 82001-82200 was run, no tracer legs,
no judged legs, no sense test, and no leg is reported as
pass/fail. The fresh band stays fresh for a future run.

Timing lead (NOT a finding — no before/after panel was run past
the failed gate): the only game-code change between the supply
pilot (080700Z, 12/12 byte-identical fresh lines) and this run
is gap-w5window commit 5440b7747 (08:54 UTC, "wanderer gives up
after 7 uncontacted days, freeing the cast slot," 25 lines in
src/js/game.js). Divergence days 11/12/18 fit wanderers leaving
after a week uncontacted. The next (e*) prereg must re-derive
its collapsing supply on the current base and keep a
calibration gate of this form; never relax the gate to "close
enough." The gate itself is validated as a design: it caught
the base move for 7 legs before any judged spend.

Prior verdicts stand untouched: pilot GO, two INSUFFICIENT-DATA
fresh confirms, supply PILOT-GO — all judged on their own
bases. No pooling with prior runs; no deploy claim.

## Arm 2 — sim-guardcasc-b: DIAG-COINCIDENCE, with REPRO-YES (merged 9b9ee8b7e)

Worker commits 81ed0b25e (prereg) / dda723fe6 (instruments) /
ac37587be (trace driver) / 9b9ee8b7e (evidence), rebased clean
onto 386170cc6, proofs re-run green on the rebased tip
(test-guardcasc-b.js 11/11, test-homewardconstruct-b.js 15/15).

The 69604 guard→succession cascade reproduces exactly on the
current base (day-1 identity PASS; fresh shadow days 1-6
identical to the original; fresh armed day-5 veto (2,8)->(1,8)
spoken escape veto reproduced; fresh armed player death day 6
"the wild" + successor-signature day-6 record start
reproduced) — but the death is NOT attributable to the veto.
Correction to the homewardac shorthand: the scholar did NOT
die overnight. A new identity-tracing driver (bearer id + name
at daily/sleep entry/exit) shows she survived the night 5→6
sleep (Ingrid Kelleher alive at (2,8) on 276 kcal; shadow: 294
kcal), woke day 6, and died that night in a boulder fight in
the day-6 parts loop (before policy.daily — hence the
successor-signature day-6 record start). Both scholars woke
day 6 on the same tile (2,8), exposed, in the STARVING
spiral, 18 kcal apart at sleep-exit; the armed scholar took
fight damage 23/19/18/18/19/17 and died, while the shadow
scholar's same-tile night rolled a cold snap. The 60-kcal
day-5-end gap crossed no threshold (the shadow scholar later
hit 0 kcal on day 7 and lived). Same tile, same hunger,
different night-event roll = RNG-cascade. 69604 must NOT be
cited as a guard lethality case.

Pattern scan: 1 candidate / 24 pairs — only 69604 itself
(homewardac pilotA 69501-69508 + pilotC 69601-69608 + cband
judged 8 pairs; cband band files verified byte-identical
duplicates of the judged legs and not rescanned, to avoid
double-counting). Near-miss: A-69501 has a day-5 veto but
deaths on both legs outside the [vetoDay, vetoDay+2] window.
No fresh seeds screened (prereg fixed none). Sense test: the
death reads as a wild-night death, not a reroute death — the
fight is fully played, the village mourns, keepsakes are
buried, Colton Ochoa takes the mantle. Nothing in the death
scene recalls the vetoed step.

Timing rule settled for future preregs: day-record starts
describe policy.daily entry, AFTER that game day's parts
loop — never read a successor-signature record start as
"died overnight." Tele day + say seq fix the game day;
sleep-exit vs next daily-entry bearer identity fixes sleep
vs parts vs policy.daily. Disclosed base drift (outside the
judged window): first differing say-day is day 16/17;
maxWave 3→2 on both fresh legs; the fresh armed leg lacks
the original's day-28 arena death. Judged-window numbers
unaffected.

## C prereg metric call — DECIDED by the coordinator this run

Blank (2) from the 080700Z next-blanks list, carried since the
cband run: does "fences shape C" include outward attempt
vetoes? DECISION: YES — the next C prereg's "fences shape C"
INCLUDES outward attempt vetoes, via the outward-attempt form
(armed attempt vetoed + armed day-6 stay on escapable
ground), RETAINING the homeward form (vetoed homeward hop)
for the still-open homeward-rescue question. Rationale:
cband proved the fence's demonstrated effect is outward
prevention (7 fired attempt vetoes, 0 homeward vetoes, 0
episodes under the old definition); the old definition makes
every outward-fenced band read as 0 episodes, mismeasuring
the guard's actual work; the outward form is already
operationalized by cband's established-band clause plus the
day-6 escapable-ground end. This decides the metric for the
NEXT prereg only. It does NOT re-score cband (PILOT-GO with 0
episodes under the old definition stands as reported) or
homewardac.

## Wall numbers (honestly limited — instrument/diagnostic arms, no campaign)

No campaign in-window on either arm; national / table / wins
are 0 in-window by construction, NOT a rate claim. Sensor
calibration legs: 7/7 survive 30d on the current base (the
base move, not a survival rate). Guardcasc fresh pair:
survived 30/30d both legs, maxWave 2 both, wave 4-5 unlocks 0.
Wall numbers as last measured stand (full seat 0 / wave 5
unfought in normal play, Loop A lane). No wall movement is
shown or claimed by this run.

## Balanced panel (§15) + telemetry deviation check

Balanced panel INAPPLICABLE as declared in both arm preregs
(identical-seed instrument comparisons / diagnostic, not
campaign before/after); no compare file fabricated.
Telemetry deviation check: prescribed invocation REFUSED the
sensor calibration corpus in the same way as the 080700Z run
(tool reads --current as a single JSON document, fails at
line 2, although the file is valid jsonl) — input-shape
incompatibility, NOT a deviation; baseline NOT rolled.

## Infrastructure

- Worktree registration stalled ~14 min behind Loop A's
  registration on the registry flock (a D-state `git status`
  inside the reaper phase + a 3.5-min `git worktree add` on
  this loaded FS). No lock was forced, no sibling process
  touched; both registrations completed in order. The
  reaper phase inside register is the slow step under
  sibling load.
- Rebase transient: worker 1's first rebase attempt failed
  with "could not detach HEAD" while a sibling commit was
  in flight; no lock file existed by inspection and the
  retry rebased clean 3/3. Do NOT remove lock files on
  first sight — verify absence/presence first.
- Safe-commit index clobber hit all worker commits on both
  arms — repaired via HEAD-blob cacheinfo each time,
  commits verified correct, main tree clean at closeout.
- Full `git status` stalls on worktrees as before;
  tracked-only status used throughout. check.js --quick
  NOT re-run: zero src/js in either arm, zero default
  flips, standing 280/7 profile.
- Reap at closeout removed nothing sibling-owned (LOUD
  notes only: journey2-crisis-r114/r115 dirty trees
  protected, as designed). Active 11/16 at closeout.

## Village assessment (plain words)

Two narrow instruments, no village saved or lost by either.
On today's game, the three villages that used to starve on
known evenings now live through the month — something in the
game moved under them, most plausibly villagers who were
stuck uncontacted now walking away after a week, and the
confirm caught that move before spending a single judged
seed. The guard story is closed the same honest way: the
vetoed step really did reroute one scholar's day, and she
really did die while her un-vetoed twin lived — but she
died in a boulder fight on the same hungry tile the next
night, on a different roll of the night's dice, not because
the veto put her anywhere worse. A veto that changes the
dice is not a veto that kills. The blank this run fills is
the guard's name cleared on its one supposed killing, plus
a rule for reading death records that will stop the next
"she died overnight" misreading before it starts. What is
still missing is a fresh dying band for the sensor on
today's game — the old dying villages are gone, and no new
ones have been found yet.

## Findings for the coordinator (appended to the backlog)

- (1) calibration-gate INSUFFICIENT-DATA with the 4/7 table
  (see arm 1); (2) base move under the sensor line +
  gap-w5window timing lead (NOT a finding); (3) calibration
  gate validated as a design — keep it first after every
  base move; (4) 82001-82200 still fresh; (5) 69604
  DIAG-COINCIDENCE, do not cite as guard lethality;
  (6) day-record-start timing rule + identity-tracing
  requirement; (7) cband band files are duplicates of
  judged legs.

## Next blanks, in order

(1) sensor (e*) RE-SUPPLY: re-derive the collapsing supply
on the current base (post-5440b7747) with a calibration gate
first; 82001-82200 still fresh, never screened. The old
supply is stale — do not re-run it expecting collapsers.
(2) C prereg metric call: DECIDED this run (outward attempt
vetoes INCLUDED via the outward-attempt form, homeward form
retained). (3) guard→succession cascade (69604): CLOSED as
DIAG-COINCIDENCE. Then (10)-(25) as listed in the 1730Z
entry, unchanged (pocket persistence DONE, guard-E deploy
DONE, sensor redesign DONE, C-only band DONE, A-timescale
DONE, C-filename DONE).

## Metric review

No metric, threshold, seed, leg, or rule definition was
changed mid-run in either arm. Sensorconfirm3 judged nothing
past its preregged calibration gate; guardcasc judged its
diagnostic exactly against its prereg header. The C metric
decision above applies to the NEXT C prereg, never
retroactively. The telemetry tool's jsonl refusal is a
standing input-shape limitation, not a deviation — a future
run that needs the check should point it at a single-JSON
campaign corpus, not a jsonl instrument corpus.

Merged locally, pending ship (sensorconfirm3 9ca8633a0 +
guardcasc 9b9ee8b7e + this coordinator evidence).
