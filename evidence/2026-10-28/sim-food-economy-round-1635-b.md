# sim-food-economy-round-1635-b — coordinator record (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1635Z.
Axis: food-economy (second axis, converging). Sibling loop A live on
scale-onramp for the whole run (claim fleshout-20261028T1628Z, arms
sim-fieldfeed-a + sim-outdoorcrew-a, NOT touched — A still running at
closeout; its trees and claim left alone).

This run took the 1530Z tracker's named next blanks (1) and (2) in
order: the grantpersist succession-death-cause follow-up, and the
spandraw thief hall-gate follow-up. Both arms are DIAGNOSIS ONLY:
zero src/js, zero default flips, new instrument scripts + evidence
only. Pre-registration was committed before any judged run on both
arms, and both verdicts are judged ONLY against their preregs.

## Arm 1 — sim-grantdeath-b: DIAG-GO (merged bf166cae4, rebased)

Question: what killed the two bearers whose deaths lost the 7 setup
grants in sim-grantpersist-b (seeds 10041/10042)?

Answer, 2/2 bearer deaths named, each wrapper-recorded (playerDeath
== registerDeath == fallen == telemetry, never inferred from
health/kcal), across all 7 reproduced loss instances. The full
120-instance band reproduces grantpersist exactly: same 7 losses,
same bearer pairs, same 11 refusal taps.

- Seed 10041, animal_ken instance: STARVATION. endDay metabolism
  finished a bearer who went to bed at 0 kcal (health 71) after two
  wild encounters during sleep dealt 19 + 11 damage; the midnight
  spiral finished him (day 6, ticks 512). Firing site: playerDeath
  at src/js/game.js:31787 (resolveDay honest cause).
- Seed 10041 fear_aura + molt, and all four seed 10042 losses:
  recorded as "the arena." Firing site: tbEnd('lost') ->
  playerDeath at src/js/game.js:44253. But the played fights were
  WILD monster encounters that interrupted sleep (water-displaced
  thing, chorus, Swarm Hum — "You go down" in the bracket
  narration), not arena contests. The game's own tbEnd lost branch
  labels every loss "the arena," so the recorded cause misdescribes
  6/7 deaths. Flagged as a follow-up (label by fight origin), not
  a verdict change.
- Window refined vs grantpersist: only starvation is endDay
  metabolism. Fight deaths fired at sleep onset (10042, ticks
  416/443), during sleep (molt, ticks 467), or at the day
  boundary (fear_aura, day 5 ticks 0). None during morning waits.
- Pre-registered divergence, disclosed: seed 10041 has no single
  cause — one game starved its bearer, two games lost theirs in
  fights — because each instance is a separate game with diverging
  RNG.
- Sense read: both death beats read as sensible played outcomes
  ("Hans Ruiz is dead — starvation. The village stops. Somebody
  screams. Somebody else starts digging." / "Luigi picks up the
  journal…") — except the word "arena" after a wild-fight death,
  which would confuse a player.

Commits (rebased hashes): prereg adc7c2a98, instrument + proof
8e8c0e7b5 (PROOF-GREEN 8/8), evidence + analyzer + 120-file corpus
bf166cae4. Proof re-run green post-rebase and on merged master.
Instrument limit (not a verdict blocker): the death-stack capture
keeps 8 frames — enough to name the firing site, but for tbEnd
deaths the 8 frames are all wrapper layers, so the exact driver
sub-step for ticks-0 day-boundary deaths isn't distinguished.
Next instrument should raise the cap to ~20 frames.

Evidence: evidence/2026-10-28/sim-grantdeath-b.md,
sim-grantdeath-b-prereg.md, sim-grantdeath-b-corpus/ (120 files).

## Arm 2 — sim-thiefhall-b: DIAG-GO, exhaustive negative (merged 652613f73)

Question: why is thief.steal_pantry hall-refused 37/37 from a played
position, and does any competent played position open it?

Answer: the gate is named, and the exhaustive negative is proven
on this band. havenStoresAccess() (src/js/game.js:11542) is a
conjunctive POSITION gate: exile -> 'none'; insideHaven AND
playerTile().type === 'haven' -> 'inside'; integrationStage() >= 3
-> 'remote'; else 'none'. The thief impl (src/js/abilityActions.js:
1797) checks it first, before pantry scan, weight, or the 50%
caught roll. It is NOT a day gate, NOT a pantry-state gate, and
NOT playerAtHaven() (map distance).

Trace (seeds 10040–10047, thief only, 2 lead + 5 tap days,
competent-nofeast substrate): 8/8 instances survived, 40/40 tap
days, 37 attempted, 3 button-refused (all hunger, seed 10041),
0 skipped. Access: 40/40 'none'; gate function reproduced from
traced components on 40/40 rows, 0 mismatches. Positions: 35
haven-tile days standing OUTSIDE the hall (map 4,4, grounds cells,
never hall interior 4,4 or enterBuilding landing 4,7), 5 away days
(10041 forest_floor 1,3 x4; 10042 trail_edge 4,1 x1), 0 inside
days. No confounds: pantry never empty (2–6 stacks, 17,642–33,500
kcal), thief owned 40/40, exile never true, stage 0 throughout
(remote unreachable in week one). Playpath's 37/37 hall-refusal
reproduced exactly; 0 successes.

Also documented, not fixed (diagnosis only): every attempted tap
PAID +5 ticks / -120 kcal before refusing. Thief has no
ABILITY_ACTION_PRECHECKS entry, so unlike challenge /
end_it_before / trophy (canon §2), its hall refusal is
post-payment.

Sense read: the refusal sentence is literally true on the 35
haven-tile days (the player IS outside the hall), but as a played
outcome it's a missing position competent evenings never offer —
the button is enabled with no warning, and nothing in the
evening's play steps back inside before the tap. The game does
offer the position in principle (enterBuilding() from the haven
node); on the 35 haven-tile days a human stepping inside first
would pass the gate per code — but that is CODE-READ ONLY, not
demonstrated, since no competent tap day occupied it and steering
was forbidden.

Disclosed instrument slip, recovered: the first trace run wrote
into the playpath corpus (OUTDIR edit missed a path segment).
Held aside, constant fixed, band re-run — re-run byte-identical
on all 8 files; strays deleted, playpath corpus verified
unmodified. Judged corpus is the re-run. Trace proves tap-time
positions only, not whole-day position history.

Commits: prereg dc36600e9, trace + analyzer + proof + corpus +
evidence 652613f73 (PROOF-GREEN 22/22, re-run green on merged
master).

Evidence: evidence/2026-10-28/sim-thiefhall-b.md,
sim-thiefhall-b-prereg.md, sim-thiefhall-b-analysis.json,
sim-thiefhall-b-corpus/ (8 files).

## Wall (this round)

No judged wall corpus — both corpora are tap-instance traces that
carry no wall fields, on a competent pre-seat substrate with no
seat instruments. No wall movement claimed: national / table /
wins / wave-5 are not measured by these arms, and none is inferred
from them.

## Telemetry deviation check

On both corpora vs scale-wall.json baseline: 3 LOUD lines each
(national 12->0, table 16->0, wins 16->0). All the known
field-shape + regime artifact class (trace rows carry no
top-level national/table/wins paths; pre-seat substrate vs a
WINSEAT baseline) — baseline NOT rolled, no investigation item.
No balanced-panel compare: neither arm has a before/after game
leg (both DIAG-only, zero src/js), so there is nothing to compare.

## Metric review

No metric proved wrong this round. Two instrument notes for the
NEXT runs, not re-scores of this one: (1) the next death-cause
instrument should raise the stack cap from 8 to ~20 frames so
tbEnd deaths resolve to a driver sub-step; (2) a future thief
band needs a "go inside, then tap" evening under its own prereg
before anyone claims the inside position works in play — this
run proves only that competent evenings never occupy it.

## Infrastructure

Master moved once under the run by this run's own thiefhall merge
(ff-only correctly refused the grantdeath merge after it);
grantdeath rebased clean inside its own worktree, proof green
after the rebase and on merged master. Safe-commit index clobber
hit worker commits on both arms (repaired via cacheinfo from HEAD
blobs each time, commits verified correct); no clobber on the
coordinator commit. No EPERM flap blocked this run. Reap at
closeout left journey-landing alone (uncommitted changes,
another lane's tree) and journey2-endgame + both loop-A trees
alone. Main tree clean at closeout. No push, no bump, no live
verification (ship-loop line). Merged locally, pending ship.

## Next blanks, in order

(1) "Arena" death label: label tbEnd losses by fight origin
(wild vs arena) — the recorded cause misdescribes 6/7 grantdeath
losses (appended to the findings backlog); (2) thief inside
evening: a human "go inside, then tap" evening under its own
prereg, plus the design question of a §2-style pre-payment
precheck for thief; (3) spandraw remaining follow-ups still open
— tap-sitting conversation seam, longer played days for a future
span-promotion band; (4) home-village birth path + pantry-lift
convo line remain Steve-call.
