# sim-sumdeploy-a — PREREGISTRATION (committed BEFORE any judged sim or game change)

Run: fleshout-loop-a-20261102T0445Z, arm sim-sumdeploy-a, axis scale-onramp.
Worktree branch: sim-sumdeploy-a. GAME-SIDE DEPLOY of the measured
policy rule from sim-sumtrigger-a (Loop A 20261102T0250Z, pilot GO:
6/8 fire, projection exact 6/6, same-day fight won 6/6). This arm
builds the smallest game-side change that makes the faithful
sum-readiness rule available at the decision point. It changes NO
gate, stage, deed bar, win price, trustedAt (70) / trustedOpinion
(10) / quota (6/2) / need (10) value, no food-economy value, nothing
from the #1538 steve-call queue, no Layer-2 titan work (re-placement
/ kill-gating / slain credit — Steve's design call, NOT built), no
sibling trees or branches, no hidden_files (coordinator-owned).

## Canon read

docs/CANON.md first, then docs/SCALE.md and docs/SCALE-DISCOVERY.md.
There is NO titan-specific canon doc in docs/ — stated here instead
of inventing one. The in-code design source is the `src/js/titans.js`
file header (coalition warfare, faces-not-units, no-solo-titans hard
gate, commit-own two-tap, "the call is itself the contact") plus
`src/data/titans.json` `_coalition` (trustedAt 70, trustedOpinion 10,
trustedBlades 6, baseBlades 2) and the herald def (minAllies 10).
Perception law (Steve 2026-10-28) is respected: quota and refusal
come from trust/opinion/arrears only; the roster only names who
answers — the readiness function never feeds a roster or a list
into a decision, it counts what the call itself would bring.

## Decisions made up front (the deploy carry-forward from the pilot)

### (a) LAZY roster generation — decided: LAZY, defined precisely

LAZY means: the game NEVER computes readiness speculatively — not
on dawn ticks, not on link ticks, not on muster upkeep, not when
rendering the call button in the self bar, and not at refusal
events (there is no game-side refusal-check loop; refusals happen
only inside `soundTitanCall` itself). Readiness is computed ONLY
on explicit demand: (1) when the player sits the war council
(`titanWarCouncil`, an explicit player action — the check moment),
and (2) when a sim policy or test calls `Game.titanCallReadiness`
directly at its decision moment. At that explicit moment the
projection DOES generate rosters for rosterless linked fires,
through the call's own generator (`titanAlliedFaces` ->
`Game.genVillageRoster`), because the count for a rosterless fire
cannot be known any other way — the generated roster then
persists, so an immediately-following sound reproduces the
projection blade for blade at zero second-generation cost. The
90111 pathology (32 speculative generations shifting the trust
trajectory) is killed by removing the speculation, not by
pretending a rosterless fire can be counted without contact:
in game play nobody checks 32 times in a burst; the player checks
once, when they sit the council. What a MERE check must never do
is consume RNG or mutate state: rendering the self bar
(`titanSelfActions`) must not call the generating projection and
must not generate any roster, and readiness on already-rostered
fires must consume no RNG. Both are unit-proven (see GO bar 4).
The measurement replay (below) is an instrument, not deployed
behavior: it projects at every refusal exactly as the policy did,
so its RNG cost matches the policy's and the equivalence
comparison is valid. Deployed behavior and instrument behavior
are different things and are never conflated in the evidence.

### (b) Momentary projections — decided: NEVER CACHED

The readiness value is computed at the moment of the decision and
never stored: no cache field on state, no memo, no last-readiness
on the muster. Haven availability moves within bursts (pilot:
95423 3 -> 0 same day; 95411 0 -> 3 across days), so a cached
Haven count would lie. Every council sitting recomputes; every
`titanCallReadiness` call recomputes. Unit-proven: changing a
link's trust/arrears between two calls changes the projection.

### (c) The refusal rule is load-bearing — decided: FAITHFUL ONLY

A quota-sum that ignores refusals over-sounds (pilot seed 95423:
naive 10 vs faithful 9 max, because Emberhold's arrears 3000
refuses it) and must NOT be the deploy rule. The game-side
function replicates `soundTitanCall` per-link, exactly: a refusing
link (trust < 25, opinion < -10, or arrears > 0) contributes 0;
otherwise quota is 6 iff trust >= 70 AND opinion >= 10, else 2;
contribution is min(quota - already, freeAdults), where
freeAdults counts the link's roster AFTER the call's own roster
generation, excluding already-committed faces (same committed
set as the call: unique living allies of unslain musters).
HavenProj = havenValid + min(3 - havenValid,
`titanVolunteers().length`), the pool the two commit taps draw
from, capped at Haven's 3-blade cap. READY iff alliesProj +
havenProj >= need (herald minAllies 10, read from data, never
hardcoded as a game rule). The naive sum (refusals ignored) is
returned alongside as `naiveTotal` for evidence only, NEVER as
the readiness verdict.

### (d) What the function deliberately does NOT do

`Game.titanCallReadiness` is the pure arithmetic projection of
the call's per-link math. It does NOT duplicate the call's other
gates: it does not check omen stage or monster presence, and it
does not create a muster, move trust/opinion/arrears, touch
scale/gates/stages, or write any ledger/moment. Those gates stay
where they are: the council/commit/call buttons only appear at
omen stage 2 via `titanSelfActions`, and `soundTitanCall` itself
still refuses an absent titan. The council line therefore only
appears where the call is already a live option. This is a
decided property, not an oversight: one function, one question
("if the call were sounded now, who would answer?").

## Exact game-side hook to be built

`src/js/titans.js` only, plus tests/instruments/evidence:

1. `titanCallReadiness(titanId)` — internal function, exported
   as `Game.titanCallReadiness` and `Game._titanTest.titanCallReadiness`.
   Returns null for an unknown titan id (mirrors `soundTitanCall`).
   Otherwise returns `{ titanId, need, links: [{ villageId, name,
   trust, opinion, arrears, quota, already, snapFree,
   generatedHere, freeAdults, wouldRefuse, contribution,
   naiveContribution, faces: [names] }], alliesProj, havenProj,
   havenValid, volunteers, total, naiveTotal, ready,
   generatedNow: [{ villageId, name, rosterLen }], errors: [] }`.
   Per-link faces are counted through `titanAlliedFaces(vid,
   quota - already, committed)` — the call's own face-picker, so
   the count (and, on sounding, the faces) are the call's own.
   A link with no roster gets its roster generated by that call
   and is listed in `generatedNow`. Errors on one link contribute
   0 for that link and are recorded, never a veto on the rest.
2. Wiring into the decision point: `titanWarCouncil` computes the
   readiness once (guarded try/catch; a failed projection says
   nothing rather than breaking the council) and says one line
   right after its header, before the per-link council lines:
   ready — "the call, sounded now, would bring N blades — A from
   allied fires and H of Haven's own — against the N the Herald
   demands. The coalition is ready; the cost is named, not
   hidden."; not ready — the same count against the need, plus
   each refusing fire named with its reason in the call's own
   words (they do not trust this coalition with their people /
   old blood between you / debts unpaid between you), or, with
   no refusing fire, "Closer bonds would bring more volunteers."
   The line must read humanly and carry the social consequence;
   it is judged by the sense-test (GO bar 5).
3. Deliberately NOT wired: `titanSelfActions` call-button hint
   rendering does NOT call the generating projection (lazy rule
   above). The commit hint's existing mustered counts are
   untouched. No change to `soundTitanCall`, `titanCommitOwn`,
   `titanMusterReady`, combat gating, or any other function.

## Files to be touched

- `src/js/titans.js` (the change above; player-visible council
  line => the game-change commit carries `[needs-eyes]`).
- `scripts/test-sumdeploy-a.js` (unit proof, real Game via
  `scripts/sim-harness.js`, fabricated links/villages/Haven
  roster; no sim, no stubbed Game.save).
- `scripts/sumdeploy-replay-20261101.js` (measurement replay:
  the sumtrigger replay with ONLY the projection source swapped
  from `scripts/policies/sumtrigger.js` to
  `Game.titanCallReadiness`, same policy stack, same env, same
  recorders, same sound-at-first-ready-refusal + two commit taps;
  prints `{"seed": N, "deploy": {...}}` lines).
- `scripts/sumdeploy-split-20261101.js` (idle splitter into
  `evidence/2026-11-02/perseed-sumdeploy-a/`).
- `scripts/test-sumdeploy-compare-a.js` (corpus-only validator:
  deploy corpus vs sumtrigger corpus, field by field).
- `evidence/2026-11-02/sim-sumdeploy-a-prereg.md` (this file),
  `evidence/2026-11-02/sim-sumdeploy-a.md`,
  `evidence/2026-11-02/perseed-sumdeploy-a/` (corpus).

## Identical-seed before/after measurement

BEFORE = the sumtrigger pilot corpus on the policy projection
(`evidence/2026-11-02/perseed-sumtrigger-a/pilot-s<seed>.json`).
AFTER = the deploy replay on the game-side function, same 8
pilot seeds (90111, 95411, 95423, 95425, 95434, 95437, 95438,
95446), DAYS=180 death-aware cap, frozen quotatrigger stack
(`tribfloor` leadfeast + `windefer` withWinDefer + `seatdrive`
withSeatDrive + `fullseat-diag` withFullseatDiag, herald-v1
instrument + `muster-diag` recorders), env
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1 MUSTER=1. The deploy replay sounds at the
first ready refusal per the GAME readiness, exactly as the
policy replay sounded per the policy projection. Comparison is
per seed, per projection row, by the validator — never pooled
across seeds, never re-scored.

## PRIMARY METRIC

Game-side readiness reproduces the policy verdict on identical
seeds: same trigger day, same projected allies/Haven/total, same
sounded yield, same fight conversion.

## GO (deploy — all must hold; a miss is NO-GO, never re-scored)

1. READINESS EXACT: on every sounded seed, game projectedAllies
   == policy projectedAllies AND == soundedAllies, game
   havenProj == policy havenProj, game total == policy total,
   and trigger day equal (all 6 sounded seeds: 90111, 95425,
   95434, 95437, 95438, 95446). On the 2 never-ready seeds
   (95411, 95423) the game projection never reports ready and
   its max faithful total equals the policy's (95411: 7, 95423:
   9). Projection-trajectory rows equal on every row of every
   seed (per-link contribution, havenProj, total, ready flag);
   any differing row fails this bar and is reported with the row.
2. FIGHT CONVERSION: every sounded call fights the same day and
   the Herald is slain (same as the policy pilot, 6/6), recorded
   in the deploy corpus fightOutcome. A sounded call without a
   recorded outcome fails this bar.
3. GUARDRAILS: on every sounded seed, link count unchanged by
   the call (before == after); every responder verified present
   on its village's roster at call time; instrument + muster-diag
   errors 0; NO gate/stage/scale value changed by the change
   (the diff touches titans.js projection + council line only);
   and the readiness check itself mutates nothing: unit-proven
   that link trust/opinion/arrears, omens, and the musters map
   are identical before/after readiness calls (no muster entry
   created, no trust moved — the call's -8 refusal penalty
   belongs to sounding, never to checking).
4. LAZY + MOMENTARY (unit-proven): (a) rendering
   `titanSelfActions` generates no roster and consumes no RNG
   (RNG-call counter unchanged, rosterless villages still
   rosterless after the render); (b) readiness on already-
   rostered fires consumes no RNG; (c) readiness on a rosterless
   fire generates exactly once — the second call lists nothing
   in `generatedNow` and returns the same contribution; (d)
   momentary recomputation — changing a link's trust or arrears
   between two calls changes the projection (no cache).
   Unit proof covers: quota 6/2, refusal exclusion incl. arrears,
   free-adult cap, Haven cap 3, no weakest-link veto, the four
   lazy/momentary properties above.
5. SENSE-TEST: the council readiness line, read in transcript,
   reads humanly and carries the social consequence (refusing
   fires named with reasons when not ready; the cost named, not
   hidden, when ready). A line that reads as a bare number, or
   that names a fire the player has not met, fails this bar.
6. PROOF TESTS GREEN: `scripts/test-sumdeploy-a.js`,
   `scripts/test-sumdeploy-compare-a.js`, and
   `node scripts/check.js --quick` all green on the worktree
   being reported. A green-list break caused by the council line
   is a failure of this bar, not a test to loosen.

## HOOK-GAP RULE (decided up front)

If NO clean hook exists — i.e. the call path cannot consult a
projection without inventing a new system — STOP building, revert
any partial game change, write the evidence documenting the gap
precisely (which functions, what blocks it), and report NO-GO /
held. Do NOT invent a new system to force it. The council +
exported-function hook above is the candidate; if implementing
it requires touching combat gating, the self-bar action
dispatch, or any system outside titans.js, that is the gap and
the arm stops there.

## KILL / HELD RULE

On NO-GO or held: the `src/js/titans.js` change is REVERTED
before the closing commit (a test asserting a reverted function
cannot stay green, so the unit proof goes with it), and the
closing commit carries prereg + evidence + corpus (if any) +
validator only where it still runs. The report states "held,
nothing to merge" with the failing bar and its numbers. On GO:
all files stay, and the report states "ready for coordinator
merge" (the coordinator merges; this arm never pushes, bumps,
or verifies live).

## PANEL (§15)

Balanced panel does NOT apply, same declaration class as
sumtrigger / quotatrigger: a trigger-moment census with an
event-triggered intervention, not a sweep-compare policy run.
Before/after is done directly on identical seeds against the
sumtrigger corpus (baseline named above), with wall metrics
reported per band, NEVER pooled. No panel fabricated.

## Wall metrics reported (per band, never pooled)

Win rate, national(end) / table reach, wave-4 / wave-5 reach,
median / max survival (gameDays), death-cause shares, endReason
mix — deploy band vs sumtrigger band vs quotatrigger baseline.

## OUT OF SCOPE (task bounds)

No #1538 steve-call queue work. No Layer-2 titan work. No
gate/stage/deed-bar/win-price retunes. No trustedAt /
trustedOpinion / quota / need value changes. No food-economy
work. No sibling trees or branches touched. No hidden_files.
