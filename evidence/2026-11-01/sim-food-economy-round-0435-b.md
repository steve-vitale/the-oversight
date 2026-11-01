# Loop B round 0435Z — coordinator evidence (food-economy, 2 GO arms, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T0435Z,
axis food-economy (converging). Sibling Loop A live on scale-onramp the
whole run (0415Z claim: contactrec2-land + contactfinish-checkpoint —
NOT touched; A landed contactrec2 e6a1351c7 mid-run and appended its own
tracker review mid-run, also untouched). No B lock at run start. Claim
written before any sims. Pre-flight: main tree clean, disk 21%, reaper
removed nothing (all 5 active trees sibling-owned or dirty, correctly
refused). This run worked food-economy, taking the 0330Z closeout's next
blanks (1) and (2) in order.

## Arm sim-fallen90-b (worker tip 41a254f0a, rebased 6e9e71326, merged --ff-only)

DIAG-GO. 90-day follow-up on 17724's day-60 fallen_tree refusal episode
(the 0330Z refusewin run's next blank 1). DIAG only, zero src/js, zero
policy-default flips, zero edits to existing scripts/policies (diff guard
clean: only 2 new scripts + evidence). Proof test-fallen90-b 6/6 and
test-refusewin-b 10/10, both re-run green post-rebase and on merged master
(rebased copy verified by coordinator; census re-read from landed files:
episodes 6, legs 3, refusals 46, unclassified 0, gatePass true — matches
worker evidence exactly).

- Control: BARE 60d on 17724 reproduces refusewin EXACTLY (13 refusals,
  days 24-35 + 60, gate-2 12/12) despite the betrayal.js +12 base move.
- Judged (BARE 90d, 17724/17734/17737): 46 refusals, 6 episodes, 0
  UNCLASSIFIED, gate clean. 17724's day-60 episode is a 7-night run
  (days 60-66, fallen_tree, camp wetland (3,5), blocked (4,5)) that ends
  ENDED-OTHER day 67 by blocked-combat (Old Stare at grove (4,3)); she
  walks home day 68, which by the binding definitions is the day after,
  not the resolution — the evidence refuses to reclassify it as resolved.
  17734/17737 grow NO new episode past day 60 (clean days 61-90 / 48-90);
  all first-60 outcomes reproduce refusewin night-for-night.
- Context (BARE 90d, fresh seeds 17801-17805, verified fresh): 6 refusals,
  1 episode, 0 post-60d episodes. 4 of 5 fresh seeds never refuse in 90
  days — refusal is concentrated in particular trajectories, not diffuse.
  The one context episode introduces a new block type (washed_out, 17805
  days 11-16, funnel (5,4), resolved day 17) — filed as a context-only
  backlog item, not a band claim.
- Sense: day-67 ending, day-68 walk home, and day-36 resolution all read
  end to end. One honest prereg wording gap documented (sense else-branch
  assumed still-refused-at-90d; the actual third path was ended-other by
  combat) — recorded for the NEXT prereg, not re-scored here.
- H5/H6 remain UNRUN, not zero.

## Arm sim-patrolsched-b (worker tip acc3145d8, rebased 50ffa5b32, merged --ff-only)

PATROLSCHED GO. Patrol-schedule lever comparison (the 0330Z run's next
blank 2; the awayeve carried doubt). ONE schedule change, policy-side
only: baseline P3 deed-seeking patrols day%7 in [1,3,5] (3x/week) vs new
policy scripts/policies/deed-weekly.js patrols day%7 in [1] only (1x/week,
same weekday alignment). Zero src/js changes; policies delta is only the
new deed-weekly.js file. Proof test-patrolsched-b PASS, re-run green
post-rebase (twice, across both rebases). Census re-read from landed
files: pooled P3 awayShare 0.6625, weekly 0.4208 — matches worker evidence
exactly (477/720 vs 303/720).

- Pooled (24 legs/policy, 30d, identical seeds): away share 66.3% P3 vs
  42.1% weekly — a drop of 24.2 points, above the 15-point prereg bar on
  both bands separately (pilot -26.7, confirm -22.9). Episodes 120 -> 84;
  23 of 24 seeds drop, none rises (17579 is 0 away on both — homebound at
  any cadence).
- Cost guardrails PASS with zero margin consumed: mean daysAlive 30.0 both
  legs, game-over legs 0 vs 0, starvation deaths inside legs FALL (16 P3
  -> 7 weekly). Guardrails did not discriminate on this all-survived band —
  a harsher band would test them properly; not proof schedule changes are
  cost-free in general.
- Mechanism: weekly patrol-delta away evenings number exactly 84 — one per
  episode. The weekly leg removes whole away episodes; remaining episodes
  are slightly shorter (mean 3.98 -> 3.61 days). What weekly gives up is
  away ground: grove away evenings vanish (24 -> 0), creek falls by a
  third (122 -> 81).
- Honest caveats carried: matched seeds are not matched trajectories
  (variant changes RNG consumption from the first divergent patrol day);
  the episode-end mix shifted unbarred (walk-home rate falls, horizon rate
  rises — a future "comes home more" claim needs its own prereg bar).
- Finding filed (not a fix): patrol departures are unnarrated — no line
  ever says "you set out on patrol" (17567 weekly day 8 departs, stays out
  9 days; only the patrol counter marks it). Narration wording is a design
  surface; no code change made by the measuring arm.
- The awayeve backlog item "PATROL-SCHEDULE LEVER COMPARISON CANDIDATE" is
  now marked fixed on this evidence.

## Master chain

7612f9ee3 (run start) -> contactrec2 chain e6a1351c7 (Loop A) ->
fa2c896d5 journey-deepening r78 (sibling lane) -> 6e9e71326 fallen90 ->
8acffe672 batch-ship version bump -> 50ffa5b32 patrolsched -> this
coordinator evidence. Fallen90 rebased once (onto fa2c896d5, clean);
patrolsched rebased twice (onto 6e9e71326, then onto the ship bump
8acffe672 after --ff-only correctly refused a diverged master — the ship
loop landed its bump mid-merge-command; no force, no damage, main tree
verified clean after the refusal). Proofs re-run green after every rebase.
Both branches merged --ff-only in sequence; both trees released
done-merged, branches deleted, main tree clean at closeout.

## Telemetry deviation check (both corpora, investigated, baseline NOT rolled)

3 LOUD lines each (national 12->0, table 16->0, wins 16->0) — the known
missing-field artifact class: neither census carries national/table/wins/
exiled fields at all, so 0 means "field absent", not "wall moved". Same
class as refusewin's and awayeve's. Baseline NOT rolled, no investigation
item.

## Wall UNCHANGED (not measured by these pre-seat censuses)

Full seat 0 / wave 5 reached 0 stand as last measured (Loop A lane).
food-economy stays converging (NOT converged): the 90d refusal question
is answered and the patrol schedule is proven a live lever on the away
calendar — but no game change landed (both arms are measurement +
policy-side instrument; the weekly policy is a new file, not a default
flip) and no strand lever has been judged yet. scale-onramp untouched
(sibling Loop A lane).

Next blanks, in order: (1) evening-step leg decomposition via seed-day
pairs (17563 day 5) — which leg (hop offer, hop, lodge entry, wood-wrapper
daytime costs) moves a seed's evenings; (2) 17549 death-cause (dies P1/CS
day 24, BARE day 18, survives P3); (3) H5/H6 refusal cells, still UNRUN;
(4) patrol-departure narration (design surface, new open item); (5) a
120d window only if a new horizon-cut episode appears (90d answered this
seed's question with 23 days to spare).

## Infrastructure

- Safe-commit index clobber hit worker commits on both arms (committed
  files showing staged-as-deleted, byte-identical in worktree) — repaired
  via --add --cacheinfo from HEAD blobs each time, commits verified
  correct; the patrolsched worker's repair is what its late "running"
  tail was.
- Container EPERM write flap flickered during this run (index.lock write
  errors on read-only status calls; slow worktree registration ~3 min per
  tree; slow heartbeats ~60s). No ref surgery, no force, no registry
  hand-edits; all affected operations retried or re-verified clean.
- Ship-loop race handled by the book: --ff-only refusal on a diverged
  master, rebase onto the bump, proof re-run, merge. The bump itself is
  version-files only (index.html/sw.js/version.json/build.js).
- No check.js --quick re-run: zero src/js changes on either arm, and Loop
  A's 0415Z run just recorded the standing profile (284 passed / 6 failed,
  pre-existing set) on this same master line.

Claim deleted; lock deleted. Merged locally, pending ship.
