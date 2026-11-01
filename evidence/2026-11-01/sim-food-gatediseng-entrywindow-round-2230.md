# sim-food-gatediseng-entrywindow-round-2230 — coordinator evidence

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T2230Z,
axis food-economy (converging), the second axis. Sibling Loop A live
on scale-onramp for the whole run (2023Z claim at run start, then a
new 2315Z claim mid-run: heraldhp2 + heraldarr2follow, then
musterroster-adopt + heraldsteer-adopt trees) — NOT touched. Loop A
landed heraldarr2follow (9d34c16fa) during this run's recovery phase
and journey-establishment r74 (a7fd3028f) moved master during
landing; both rebases below account for them.

## Stale-lock recovery at run start (before any new sims)

The 2030Z B run had completed its arms and recorded its round in the
tracker, but its coordinator closeout died in the container EPERM
flap before committing round evidence or deleting lock/claim (lock
115 min old, no registry entry, no live processes, both arm commits
already on master). Successor action: registered recovery worktree
sim-coord-recover2030-b, reconstructed the round evidence from the
tracker entry + landed arm evidence, committed 3c8af0c9c (index
clobber repaired via cacheinfo), rebased onto 8249e001f after
sibling landings, merged --ff-only as 3141390ef, released the tree,
retired the 2030Z claim to .DEAD with a recovery note, deleted the
2030Z lock. The 2030Z round evidence now exists at
evidence/2026-11-01/sim-food-fertrot-gatediseng-round-2030.md.
Orphan branches sim-coord-2030-b/c/d left as found (old master tips;
no unmerged content verified for d). Pre-flight after recovery:
main tree clean, disk 25%, reap run (sibling dirty trees left alone,
as the reaper requires).

Claim for this run written before any sims
(hidden_files/lever-claims/fleshout-loop-b-20261101T2230Z.json).
Arms take the 2030Z next blanks (1) and (2) in order, per DELIVER
OVER MEASURE (Steve 2026-11-01): adoption/delivery arms over
re-measurement. Both arms are policy/instrument-side, zero src/js,
zero default flips, so they share the run safely.

## Arm 1 — sim-gatediseng-confirm-b: PASS (cost leg confirmed, deploy-ready)

Worker commits db9d29284 (adoption prereg, committed BEFORE any
judged sim) + a31881251 (confirm band + evenings analyzer + proof +
evidence), merged --ff-only after a clean rebase onto a7fd3028f,
proof 11/11 green on rebased tip and on merged master. Evidence:
evidence/2026-11-01/sim-gatediseng-confirm-b.md (prereg
evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md).

Adoption prereg for (c) STAND-DOWN+TREND (rule verbatim from the
gatediseng prereg: S = first evening of the current disengaged
stretch; D > S in the same stretch shows 3 consecutive total falls
after S and pantryKcal(D) <= 0.90 * pantryKcal(S)). Confirm band
52201-52212 verified fresh first (seed-field scan over all of
evidence/ in both spellings + .md mentions, zero hits; gatediseng
pilot 52101-52108 not overlapped). Substrate 30d competent,
gatecover tracer + gatediseng analyzer reused verbatim.

Confirm bar (stated before seeing the band): survivor firing-seed
rate <= 25%, plus in-time check on any collapsing trajectory
(firing >= 3 evenings before first starvation), plus
evenings-per-firing-seed reported (not a bar).

Result, judged exactly against the prereg: survivor (c) firing rate
0/12 = 0.0% — PASS. All 12 seeds verified first try (rows ==
daysAlive, 30 x 12); 12/12 survived, collapses 0/12. In-time leg
VACUOUS: no collapsing seed on the band, so timeliness was not
re-tested; 51608 (day 15 vs starvation day 21) remains the sole
in-time evidence. Evenings-per-firing-seed UNMEASURED (null, not
zero): with zero firing seeds there is nothing to count — this PASS
must not be cited as having measured it. Analyzer alive on this
band: (a) fires 2/12, (b) 3/12, (d) 2/12 on the same trajectories;
(c) is quieter by construction (it counts only falls after the
stand-down; (a)/(d) fire on the first disengaged evening of a slide
that happened while engaged, shown on 52206 and 52212).

Deploy spec DECIDED in the prereg (not deferred): sensor-path
branch in game.js, gate unchanged (no hysteresis threshold adopted),
one warning per disengaged stretch, a (c) warning stands regardless
of later re-engagement with NO engaged-D+5 requirement (closes the
hysteresis counting gap — no warning can be stranded by a D+5 that
never re-engages), pantry-only 10-evening recovery scoring, voice
line: "Tariq checks the pantry before heading out — the shelves
stopped reading full days ago, and the store has kept falling
since. Nothing extra is reaching it." A future arm may now make the
deploy claim using this spec. Nothing is deployed by this arm and
no game default changed.

Sense test: no firing evening exists on this band. Near-miss 52206
(days 20-24) already speaks the thin-pack voice ("You keep a day's
food (570 kcal) — nothing extra for the pantry this time"), so a
(c) line there would echo, not clash; (c) stays silent only because
day 24 rises and breaks the third fall. The 51608 day-15 fit stands
as published.

Observation (not judged): 52203 loses one person to starvation day
12 while the pantry ROSE 52,678 -> 59,355 with the gate down on
freshDays 2.19 — starvation amid plenty, which no pantry-trend rule
would catch.

Pooled texture (not judged): (c) survivor cost corpus 2/27 + pilot
2/8 + confirm 0/12 = 4/47 = 8.5%.

## Arm 2 — sim-entrywindow-b: PILOT GO

Worker commits 03f38d6f0 (prereg + policy + census instrument) +
3c08fb4cb (pilot evidence + corpora + panel), merged --ff-only
after rebase onto a31881251 (see infrastructure: stop-at-pick
quirk), proof 14/14 green on rebased tip and on merged master.
Evidence: evidence/2026-11-01/sim-entrywindow-b.md (prereg
evidence/2026-11-01/sim-entrywindow-b-prereg.md).

STAGE 1 — entry cell IS knowable at menu time, with two
qualifications. First candidate: exactly knowable — travelTo sets
mx/my from the travel-direction sign + the scholar's current micro
cell, findWalkableEntry's deterministic BFS (no RNG; genDetail is
detailSeed/detailRand-seeded and returns the cache for visited
tiles), and the sweep moves nothing, so the sweep's micro cell IS
the travel entry cell. Empirical proof: predicted entry == actual
entry on 457/457 census forage travels, 457/457 pilot baseline,
205/205 pilot armed; sweep micro cell == travel entry cell on
486/486 census attempts. Qualification 1 (chain): candidates 2-3
enter from the previous candidate's tile, not the trip origin — a
static ranking carries only the from-current-position window (exact
for try 1, approximate for tries 2-3); the pilot tests that
approximation, and it passes (later-try attempts collapse 266 ->
42). Qualification 2 (first-visit): tiles with no detail at menu
time have no honestly computable window (first genDetail also
strips cells / mutates stock — a side effect, not a read), so they
are left alone. Census bound: 29/486 attempts were first-visit
travels, 14 of them failures — a visited-only rule could at most
prevent 330 of 344 failures.

STAGE 2a — predictor census (baseline only, fertrot band 60101-60108
re-run, no fresh seed consumed): PERFECT separation — entry-window
harvest 0 -> 344 attempts, 0 successes; >= 1 -> 142 attempts, 142
successes; zero failed attempts had a non-empty window (vs
fertrot's 95% of failures on whole-tile-fertile ground). The re-run
reproduces fertrot's baseline exactly (share 0.342, haul 763.2,
unload 36,060), proving the instrument is count-only. Hence a rule
was frozen, per the task's "if and only if" condition.

Frozen rule: during competent.daily only, a worked tile whose entry
window FROM THE SCHOLAR'S CURRENT POSITION holds zero harvestable
cells sorts +99 steps farther; everything else untouched — NO
fertile bonus (deliberate deviation from fertrot: a bonus would
only reshuffle tiles that already pay). Scorch counted as
harvestable at menu time (cellScorched is origin-relative there —
documented caveat); visited = foraged-only (conservative).

Pilot (30d competent, DEPOSITGATE=0, identical seeds 60121-60128,
verified fresh first — rg seed-field scans in both spellings over
all of evidence/ returned zero hits; .md mentions of 60121-60132
are fertrot's confirm-reserve mentions only, never runs; confirm
band deliberately NOT pre-claimed, 60129-60132 being only 4 seeds),
judged against the prereg:

- Failed-trip day share (pooled): 0.258 (62/240) -> 0.058 (14/240),
  bar <= baseline - 0.10 — PASS, delta -0.200.
- Mean daily haul (mean-of-means): 633.7 -> 967.9 kcal, bar >=
  baseline — PASS, delta +334.2.
- Median survival 30 vs 30 (1.0x), bar >= 0.8x — clean.
- Starvation deaths 2 -> 0 (baseline: 60121 day 8, 60123 day 17,
  both the scholar's character), bar <= baseline + 1 — clean.
- Away day-ends (secondary, 60108 lesson): 30 -> 17, bar <=
  baseline + 5 with no 60108-shaped seed — clean; worst baseline
  seed 60128 improves 15 -> 5 away day-ends, 13 -> 23 live returns.
- Engagement: 1,291 penalized menus, 3,627 empty-window tiles,
  bar >= 10 — engaged.

Mechanism: first-attempt successes 59 -> 187; attempts fall 489 ->
260 while successful-trip days rise 161 -> 204. Empty-window
identity holds on the fresh band too (365 empty-window attempts, 0
successes, both legs). Honest costs: pack-full failures rise 2 ->
16 — every armed non-empty-window failure is pack-full (the bag,
not the ground, now binds); seed 60126 diverges (haul 609.7 ->
235.2, share 0.067 -> 0.100) because trips end at the first small
paying window instead of reaching big-yield tiles — per-seed watch
item for confirm, and the yield-aware-variant candidate.
Finished-pack dips 1,037.1 -> 983.7 (diagnostic only, not judged).
Wave max 2 both arms; 8/8 survived 30d both; national / table /
wins 0 in-window only (not a wall claim).

Sense test: rotation choice is NARRATIVELY INVISIBLE (zero lines
mark choosing ground by its entry window; regex hits are unrelated
System / trial / journal lines), and stranding is likewise unmarked
(zero "can't get home" / "stuck" lines) — same invisibility class
as patchrot / fertrot. No narration added, per task.

Balanced panel (§15, context only): combined panel, 16 cases, 0
reused; sourcesStable true, neutrality matched both policies, zero
warnings. 8/8 survived both, won 0, national 0, table 0, maxRank
village, maxArc 3, waveReach 1-2 both (baseline 4x / 4x, armed 2x
wave 1 / 6x wave 2 — context-only tilt), vests 0.

## Wall numbers

UNCHANGED in kind (30d pre-seat windows cannot measure late-game
states): full seat 0 / wave 5 reached 0 stand as last measured
(Loop A lane). In-window: gatediseng-confirm 12/12 survived 30d,
wave max 3 (52204; 10/12 wave 2, 52205 wave 1); entrywindow 8/8
survived 30d both arms, wave max 2; national / table / wins 0
in-window only; entrywindow deaths diagnostic only (starvation
2 -> 0 above). No wall movement is claimed by either arm.

## Telemetry deviation check (coordinator, post-merge)

telemetry-check REFUSED the entrywindow pilot-armed jsonl itself
(single-JSON-document parse; multi-line jsonl fails at line 2) —
the same input-format limitation precedent as 2030Z / 1830Z /
1725Z, not a deviation; baseline NOT rolled. No LOUD lines, no
investigation item.

## Findings appended (six lines)

See hidden_files/sim-findings.md: (c) confirmed on cost leg +
deploy-ready; evenings-per-firing-seed still unmeasured;
starvation amid plenty (52203); entry-window predictor separates
perfectly + PILOT GO + confirm next; pack-full next ceiling +
60126 divergence; entry-window rotation narratively invisible.

## Infrastructure

- No EPERM flap on the worker arms this run (contrast fertrot's
  ~15-minute flap; the recovery phase's flap was the prior run's,
  already spent). Panel completed on first attempt for entrywindow.
- Safe-commit index clobber (known class) hit all four worker
  commits + the recovery commit — repaired via cacheinfo from HEAD
  blobs each time; commits verified correct throughout.
- Master moved three times under this run: Loop A
  heraldarr2follow landing during recovery, journey-establishment
  r74 during landing, and the worker-1 merge during worker-2
  landing. Both worker branches rebased cleanly with proofs re-run
  on rebased tips before --ff-only merges.
- REBASE STOP-AT-PICK QUIRK (documented class, third sighting
  pattern): entrywindow's rebase stopped with pick 127ce4bd1 in
  BOTH the done and todo lists, worktree clean, HEAD still at the
  master tip, pick's files absent (prereg + policy not in tree).
  Recovered exactly per the documented recipe: verified tree clean
  + pick unapplied, then `git rebase --continue` — sailed through
  both picks, final log shows each commit exactly once. No todo
  edit, no abort.
- check.js --quick NOT re-run: zero src/js, zero policy-default
  flips, zero green-list files (one additive panel-registry line
  per arm only, plus new policy/instrument/test files).
- Coordinator worktree registration slow (~2-3 min) as in prior
  runs; heartbeats verified by readback after each registration.

## Axis state

food-economy stays converging (NOT converged): the sensor program
now has a CONFIRMED disengaged-state rule with a deploy-ready spec
(but no gate change landed, no default flipped), and the haul
ceiling now has a PILOT-GO entry-window lever (but no confirm yet,
no default flipped). scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) gatediseng (c) DEPLOY claim using the
prereg's spec (future arm; deploy = sensor-path branch + voice
line, gate unchanged); (2) entrywindow 12-seed CONFIRM (band TBD by
fresh scan at confirm time; same pair + cost bars + away secondary;
watch 60126-class divergence and pack-full ceiling); (3)
success-anchored rotation (patchrot 51901 counterexample, still
open); (4) HUNGER WINTER relief passivity (steve-call candidate);
(5) shelling default-flip call; (6) P3 reset follow-ups — night-22
+3,005 silent inflow bridge (still undocumented), double endDays on
vessel-death days; (7) patrol-departure narration; (8) garden /
fish / traps early path (marginal 2.8% combined); (9) creek
clearance wood-bound; (10) rubble daytime-clearing habit
unmeasured; (11) washed_out scramble narration; (12) 96-tick bridge
edge unobserved; (13) a 120d window only if a new horizon-cut
episode appears.

Claim deleted; lock deleted.
Merged locally, pending ship.
