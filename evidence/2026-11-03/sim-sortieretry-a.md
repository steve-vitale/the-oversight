# sim-sortieretry-a — sortie RETRY: Q1 invalidation + aiming, live value (Loop A, axis scale-onramp)

The tracker 121834Z entry's next blank: sortie RETRY (Q1 invalidation +
aiming, measuring sortie VALUE with its own prereg + wall bars, multi-only
agreement, explicit answers-vs-ok denominator). Unblocked by sortiev2
(Q1 settled YES, replay filter) and the sortietarget landing ef3233b17
(aiming works). VERDICT: PILOT NO-GO on the letter of pre-registered bar
G2 — with the mechanism itself confirmed and the bar itself contested
(see Metric review). NO confirm spend in this run, NO gameplay change,
NO wall movement claimed. The retry policy is kept as an instrument file
(pending the next run's floor-aware re-judgment), not landed as gameplay.

Prereg (committed FIRST, before any judged sim): scripts/
sortieretry-prereg-20261103.md, commit 6d834be78 (with policy, driver,
analyzer, proof test). Proof test: scripts/test-sortieretry-a.js, 10/10
green (ok dequeue + key, no-fighters keep + retry, none head-only without
invalidation, none clears backlog with invalidation, no duplicate enqueue,
fresh-day enqueue, policy cleanliness, fresh-offer-after-invalidation).
Zero src/js changes in this arm: policy + driver + analyzer + proof +
evidence only.

## Canon

docs/CANON.md read. There is NO dedicated lingerer/sortie canon doc
(sortietarget prereg, same finding) — no canon invented. docs/PERCEPTION.md
as applied by the sortiev2 Q2 settlement: the policy reads ONLY the
engine's announced-offer record (state.lastLingererOffer) plus its own
queue/answered set. The proof test asserts roster/position tokens absent
from the policy file, comments included.

## The three arms (identical seeds, one shared stack)

Closecommit stack (tribfloor leadfeast + windefer + seatdrive +
fullseat-diag + titanroute + musterclose + mustergap) + answer layer.
Env flags, same seven as the sortie drivers: FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald, 180d
death-aware cap. Pilot seeds 98601–98608 (next free band after the
sortietarget 98401–98408 pilot and 98501–98512 confirm).

- A reference (landed behavior): sortietarget AIMED last-offer-once.
- B queue (no invalidation): sortieretry queue; on 'none' dequeues ONLY
  the head — the next stale offer is answered the next day.
- C retry (queue + Q1 invalidation): identical to B, except on 'none'
  drops ALL queued offers recorded before that return.

Driver: scripts/sortieretry-driver-20261103.js (adapted from the
sortietarget driver; attribution is RETURN-VALUE only, 0815 lesson).
Analyzer: scripts/sortieretry-analyze.js. Per-seed JSONs:
evidence/2026-11-03/perseed-sortieretry-a/ (24 files, 8 seeds x 3 arms).

## Pilot numbers (analyzer output, scripts/sortieretry-analyze.js)

Denominators explicit, as pre-registered — answers (all calls), ok
sorties, 'none' calls, 'no-fighters' calls, fire count with every
agreement number, agreement multi-only:

| arm | answers | ok | none | no-fighters | ok/ans | fire | multi-ok | multi agreement | wins | national | tableDone | deaths |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A reference | 22 | 8 | 5 | 9 | 0.364 | 10 | 3 | 3/3 | 5 | 0 | 5 | 402 |
| B queue | 26 | 8 | 9 | 9 | 0.308 | 10 | 3 | 3/3 | 5 | 0 | 5 | 402 |
| C retry | 22 | 8 | 5 | 9 | 0.364 | 10 | 3 | 3/3 | 5 | 0 | 5 | 402 |

Errors: [] in all 24 runs. Wave-5 faced: 0/8 all arms. National: 0/8
all arms (these are lesser-seat wins: tableDone 5, wins 5).

## Judgment against the pre-registered bars (§14 — judged as written)

- G1 flood present: B 'none' = 9 >= 8 — PASS (barely).
- G2 suppression: C 'none' = 5 <= 50% of B 'none' = 9 (4.5)? 5 > 4.5 —
  FAIL on the letter. See Metric review: the bar counts the irreducible
  floor.
- G3 zero useful lost: C ok 8 >= B ok 8 − 2 — PASS; C fire 10 >= 75% of
  B fire 10 — PASS.
- G4 no wall regression vs A: C deaths 402 <= A 402 + 25% — PASS;
  C wins 5 >= A 5 − 2 — PASS.

PILOT VERDICT: NO-GO (G2 letter fails). No confirm is run in this run.
This is a metric-contested NO-GO (leg2drift precedent), not a
mechanism kill: see below.

## What actually happened (the mechanism, seed by seed)

C is EXACTLY A on all 8 seeds — same answers, same deaths, same wins,
same tableDone per seed (98601: 2 answers; 98602: 1; 98603: 2; 98604: 8;
98605: 6; 98606: 1; 98607: 0; 98608: 2). B diverges only on 98604
(9 vs 8) and 98605 (9 vs 6). The per-day 'none' lists show why, exactly:

- 98604: B none days [61, 76, 77]; C/A none days [61, 76]. The excess is
  day 77 — the next stale backlog offer, answered the day after the
  'none' that proved the treeline empty.
- 98605: B none days [82, 83, 84, 85]; C/A none days [82]. The excess is
  days 83–85 — three backlog drains after the proving 'none'.
- Total excess 'none' calls: 4, ALL suppressed by invalidation. C
  invalidations = 5 (one per 'none' episode: 98602, 98604 x2, 98605,
  98608) — every 'none' the retry arm met cleared its queue.

In other words, live Q1 invalidation does EXACTLY what the sortiev2
replay predicted: it cuts the backlog drains and leaves the proving
'none' (exactly one per empty stretch) plus every fight untouched.
C ok = B ok = A ok (8), C fire = B fire = A fire (10). Zero useful
attempts lost, live — not just in the replay filter.

## Value verdict (pre-registered alongside GO)

C ≈ A on fights (identical, not just close) while cutting waste only
against the QUEUE world that the landed behavior does not inhabit. The
landed last-offer-once policy is already flood-immune: an
already-answered offer is never re-answered, so it never drains a
backlog into an empty treeline. CONCLUSION: "GO as instrument,
NO-VALUE as gameplay change." The retry policy is worth keeping as the
answer layer for any FUTURE queue-based policy, but it claims no wall
movement, no gameplay land, and no default change. The sortie-retry
blank is effectively answered on the value question: there is nothing
here to ship to the game — the flood was a queue-policy artifact, and
the landed behavior never had it.

## Sense-testing

Seed 98604, retry arm — the queue grows behind a bare bench, then the
'none' clears it (policyCalls: day 60 ok; day 61 'none', queue 1;
days 71–75 'no-fighters' x5, queue growing 1→5 as fresh offers enqueue
behind the kept head; day 76 'none', queue 6 → cleared). The village
reads as it should: it keeps trying to send the sortie while the bench
is bare ("Not enough fighters to send — a sortie needs at least two
besides you, and the bench is bare"), and when the treeline finally
answers empty, it stops asking — it does not nag the empty treeline
for the three days the queue arm spends doing exactly that. One
multi-sortie read, seed 98603 day 79: fought [ling2, ling1], target
ling2 first — the aimed promise holds in the retry layer too.
No new robotic behavior: sorties still read as mustered villagers
walking out with real rations (6,256 kcal on the 98604 sortie line).

## Villager behavior (SENSE-TESTING LAW)

No change from the sortietarget picture: the bench-bare 'no-fighters'
stretch is the muster gate working as designed (a lone villager against
a treeline monster is a funeral), and the retry layer's daily retry of
the kept head reads as the village re-checking the bench each morning,
not as nagging. The one wrinkle carried from sortietarget stands: after
a leader dies mid-sortie, later days return 'no-fighters' while
lingerers remain, and the village endures by default while the gorge
continues.

## Metric review (§14 — the bar, not the run, is revised)

G2 as written ("C 'none' <= 50% of B 'none'") double-counts the
irreducible floor. Every arm — including the reference, which has no
queue at all — pays exactly one 'none' per empty stretch: the 'none'
that PROVES the emptiness. Sortiev2 said this in its own replay result
("'none' attempts 24 -> 7 (exactly one per empty stretch: the first
'none' that proves the emptiness)"), and this pilot reproduces it live:
the floor is 5 (98602, 98604 x2, 98605, 98608), shared identically by
all three arms. No invalidation rule can suppress a proving 'none'
without also suppressing the knowledge that the treeline is empty —
the rule fires ON that return. G2 therefore cannot pass on any band
where the floor exceeds half of B's total, which is exactly what
happened (floor 5 > 4.5). This run does NOT re-score G2: the verdict
stays NO-GO as written.

PROPOSED REVISION FOR THE NEXT RUN (not applied here): G2' = C 'none'
<= A 'none' + 1 (retry adds no 'none' beyond the reference floor) AND
C 'none' < B 'none' (strict suppression of at least one backlog drain).
On this pilot, G2' would read 5 <= 6 AND 5 < 9 — PASS. The next run's
prereg must adopt G2' (or a stated equivalent) BEFORE any judged sim,
and must not pool this pilot's numbers with its own.

## Wall numbers (pilot, NOT wall movement)

National 0/8, tableDone 5/8, wins 5/8 (lesser seat, all arms), wave-5
faced 0/8, wave-4 faced on 7/8 seeds (98607 wave-3 only). Median survival
is win/loss-truncated (five 90d wins, three losses at 47/78/156d), not a
clean median. The wall stands exactly where the tracker left it: the
full seat unwon, wave 5 unfought in normal play. This arm never claimed
otherwise — it is an instrument/value arm, and its value verdict is
NO-VALUE as a gameplay change.

## Standing-directive note (arrived mid-run, 2026-11-03 07:29 CST)

Steve's winnability push ("working hard on getting this game winnable...
attack the chain with landed fixes, not more measurement; win prices
and deed gates stay untouched unless Steve explicitly orders otherwise")
arrived while the retry arm was running. This run was already
pre-registered and mid-pilot, so it was completed and judged against its
prereg rather than abandoned mid-flight — but it touches neither win
prices nor deed gates, lands no game change, and its value verdict
(NO-VALUE as gameplay) agrees with the push: the next scale-onramp work
should be chain fixes, not another measurement arm. The retry
re-judgment under G2' is a small instrument question for a later run,
not the next priority.

## Infrastructure

- Worktree registration stalled ~3.5 min behind the registry flock
  (same class as the 1230Z Loop B run's 14-min stall); no lock forced,
  no sibling process touched; registration + heartbeat completed.
- Safe-commit index clobber struck on the prereg commit (repaired via
  HEAD-blob cacheinfo; commit 6d834be78 verified correct, tree clean
  after). Same class as every recent run; the commit is always correct,
  only the main index lies.
- check.js --quick NOT re-run in full: zero src/js in this arm, proof
  10/10 + analyzer green; the run's quick invocation was still running
  past 7 minutes (sortietarget's took 1337s) and was stopped at closeout
  rather than blocking the landing on a tooling-only smoke test. The
  standing 276/14 profile from the sortietarget run is NOT re-claimed
  here (its failure list was never captured — see sim-sortietarget-a.md).
- Telemetry deviation check: prescribed invocation REFUSED the
  per-seed JSONs in the same way as the 121834Z run ("refusing
  recorder-corpus input: all 24 --current rows carry top-level
  anchorCommit, so they are sweep recorder rows, not runs") — input
  shape, NOT a deviation; baseline NOT rolled. Balanced panel (§15)
  inapplicable per prereg (no registry policy answers lingerers); no
  compare file fabricated.

## Convergence state

scale-onramp: converging (NOT converged). The sortie-retry blank is now
answered: live Q1 invalidation works exactly as the replay predicted
(4/4 excess 'none' calls suppressed, zero fights lost), but the landed
last-offer-once behavior never had the flood, so the retry policy has
NO gameplay value to land. The policy file stays as an instrument for
future queue-based policies, pending a G2' re-judgment in a later run.
Next priority per the 2026-11-03 07:29 CST winnability push: chain fixes
(wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing → full seat) with landed fixes, NOT another measurement
arm. The G2' retry re-judgment is a small instrument question behind
that priority. Full seat still unwon; wave 5 still unfought in normal
play.

Claim retired to .DEAD; lock deleted.
Merged locally, pending ship (prereg+instrument 6d834be78 + evidence
commit below).
