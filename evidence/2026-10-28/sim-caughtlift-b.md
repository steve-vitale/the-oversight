# sim-caughtlift-b — caught-lift trust narration blank: DIAG-NO-GO

Run: fleshout-loop-b-20261028T0530Z, axis food-economy, arm
sim-caughtlift-b. Measurement only: zero src/js changes.
Prereg: evidence/2026-10-28/sim-caughtlift-b-prereg.md, committed
as b2ea808f0 BEFORE any judged probe. Instrument:
scripts/test-caughtlift-b.js (this arm). Harness: sim-harness
loadGame/setupGame/runDays, seed before eval, full src/js list
minus DOM-only files, Game.save never stubbed. Fixture coin forced
only during the judged call (ability lift: Math.random 0.1 forces
the `< 0.5` caught coin; ordinary take: 0.9 forces the palm coin
to miss); trust preset to 50 so the -20 cannot be clamped by the
0 floor. All fixture setup printed in script output.

Canon: docs/CANON.md read first. No canon doc covers ability-action
refusals or pantry ledger accounting generally (tracker blank 5,
2026-10-28) — stated, not invented. Canon rule applied: trust ≠
reputation (gossip moves REP, never trust).

## Verdict: DIAG-NO-GO (leg (c) failed on BOTH judged seeds)

Per seed, one scripted CAUGHT Light Fingers lift
(useAbility('thief','steal_pantry'), 400 kcal lifted, inventory
gain 400 kcal — matching outflowzero-b's 400 kcal exactly):

| Seed | (a) delta == -20 | (b) narration line | (c) durable trace |
|------|------------------|--------------------|-------------------|
| 9820 | PASS: 50 -> 30    | PASS (quoted below)| FAIL: none found  |
| 9850 | PASS: 50 -> 30    | PASS (quoted below)| FAIL: none found  |

DIAG-GO required all three legs on EACH seed. Leg (c) failed on
both, so the verdict is DIAG-NO-GO under the pre-registered rule.
No re-scoring: the say line itself was deliberately excluded from
leg (c) in the prereg, and it is the ONLY record that exists.

## Quoted narration — the full caught-lift transcript (both seeds identical)

The say() lines captured during the caught lift, verbatim, in
order — this is the ENTIRE transcript; there is no second voice:

1. `A hand closes on your wrist. "Really?" -20 trust. The pantry remembers. (Light Fingers — caught.)`
2. `📓 Journal: you UNDERSTAND **Light Fingers**.`
3. `(−120 kcal — food becomes thief.)`

Sense judgement: line 1 is the whole village reaction, and it is
one anonymous hand, not the village in its own language — no named
witness speaks, no one else reacts, no gossip voice follows, no
consequence is voiced beyond the number. Lines 2–3 are not village
voice at all (ability-understanding journal line; ability-cost
line). The "pantry remembers" is a sentence, not a memory: nothing
in the game remembers it afterward (see leg (c)).

Clean-palm control (both seeds, coin forced clean): trust 50 -> 50
(delta 0), line quoted verbatim: `The food disappears. Magic.
(It's not magic. Nobody saw. Light Fingers.)` — the 50% palm rate
holds, and a clean lift books nothing either (expected: no trust
moved, so nothing to book).

## Leg (c) autopsy — why the -20 is a silent drop

Checked after each caught lift, before vs after, on both seeds:
state.telemetry 'trust' events: NONE. v.memory entries (all roster
ids): NONE added. v.gossip entries: NONE added. Ledger
foodShared/foodHoarded: 0 delta. Reputation (repOf(player)):
generous/brave/honest/competent all 0 before and after — no
conflation with reputation, and no witness rep ripple either.

Root cause, read from code (confirmed by the probe, not assumed):
- The caught branch (abilityActions.js ~1752) writes
  `v.trust[vid] = max(0, (v.trust[vid] || 15) - 20)` DIRECTLY. It
  never calls bumpTrust, so the bumpTrust telemetry path
  (`tele('trust', {who, delta, reason})`, game.js ~8102) never
  fires, no reason is recorded, and no milestone drama check runs.
- Its `observe('caught_you_stealing')` call is a full no-op:
  observe()'s action table (game.js ~16972) has NO
  'caught_you_stealing' entry, so observe() returns before the
  witness loop, before gossip seeding, before any rep move.
- The ability code never calls remember() or hoardFood().
  Consequence: the conversation line written for exactly this
  memory (convoTopics.js: `"I know about my pack. Hands where I
  can see them, next time."`) can NEVER surface from a lift, because
  the memory it keys on is never created by a lift.
- The ordinary-take caught path is the same shape (secondary
  diagnostic, both seeds): rate forced to exactly the 3000 bar,
  coin forced caught, trust 50 -> 30, line quoted verbatim:
  `Caught red-handed! They saw you steal. Trust -20.` followed
  only by `Took Dried beans.` — again zero telemetry, memory,
  gossip, or ledger trace, and no witness confrontation line fired
  (fresh-setup game has no positioned witnesses/party, so
  theftConfrontation's witness gate is empty; its -8 confronter
  move is a different villager's trust and did not fire here).

Trust semantics, answered: the -20 lands on v.trust[playerId] —
the village-level trust number for the player, the same map
bumpTrust writes (not per-witness link trust: the branch writes
nothing to v.trustIn, and nothing witness-graded). It is NOT
reputation: rep dims are untouched. Side observation (not a judged
leg): the caught branch bypasses bumpTrust math entirely — its
`|| 15` default disagrees with bumpTrust's undefined -> 10, and no
progressive-gain scaling applies to the loss. Two trust math
paths, one of them unbooked.

Log-ring nuance, stated honestly: in real play the caught sentence
would persist as narration text in the saved 40-line message log
(game.js save serializes log slice(-40); load restores it). That
is the sentence, not a booking of the move — no delta, who, or
reason is stored, and nothing in the game ever reasons about it
afterward. (In-fixture log-ring reads were empty because the sim
harness replaces Game.say with a no-op — sim-harness.js: the
wrapper captures say args, but emit never runs in fixtures. The
leg-(c) verdict does not depend on the log ring either way: the
prereg's record list was telemetry/memory/gossip/ledger.)

## Pilot band — competent never lifts (wall numbers)

8 seeds 10420-10427, competent policy, 100d death-aware cap.
thief.steal_pantry calls: 0 on all 8 seeds (confirms
outflowzero-b). The 4 "Light Fingers" lines seen on 3 seeds are
GRANT lines, not lifts — quoted so the count cannot be misread:
`📖 LEARNED: Light Fingers (Level 1). Steal from pantry without
trust loss (50%). If caught, -20 trust.` (10424, 10426);
`📖 LEARNED: Light Fingers (Level 2). Hands like smoke.` and the
JACKPOT stranger-teaches line (10427). The ability was learned
but never used by competent play — the caught-lift blank is
unobservable in unscripted band play, which is why the scripted
fixture, not the band, carries the verdict.

Wall numbers (band): national 0/8, table 0/8, won 0/8, wave-4
reach 2/8 (10421, 10423), wave-5 reach 0/8, median survival 100d
(CAP-CENSORED: 7/8 survived the 100d cap; 10420 village-lost at
day 28), arc 3 on all 8. No balance-panel compare is attached:
there is no before/after game leg (zero src/js change), so the
panel has no pair to compare; the judged comparison is fixture
before/after on identical seeds.

## Village assessment (plain words)

The village, in this arm's evidence, is a place where stealing is
punished by a number and a single anonymous sentence, and then
forgotten by everyone except the number itself. A player who gets
caught hears one hand close on their wrist — and then no villager
ever mentions it, no rumor carries it, no conversation remembers
it, and no record lets the game itself notice it happened. The
blank is real, and it is a booking blank, not a narration-quantity
blank: the fix (reported, NOT landed — measurement arm) is to
route the caught-lift -20 through bumpTrust with a reason
('caught stealing') and to give observe() a 'caught_you_stealing'
entry or a direct remember() call, so the village can do what its
own conversation lines already pretend it does.

## New blank found (for the findings backlog)

- Caught-lift trust move is unbooked (this arm's verdict): -20
  lands on v.trust with no telemetry event, memory, gossip, or
  ledger entry on either caught path; observe('caught_you_stealing')
  is a no-op (no action-table entry); the convoTopics
  caught_you_stealing line is therefore unreachable from a lift.
- Minor: caught branches use a `|| 15` trust default vs
  bumpTrust's undefined -> 10, and bypass progressive trust math.

## Metric review

Leg (c) deliberately excluded the say line itself — upheld: had
the line counted, the verdict would have been GO on a move the
game itself cannot see afterward, which is exactly the tracker's
question. One prereg wording risk, disclosed: the log-ring nuance
above (saved narration text) was not in leg (c)'s record list;
adding "message log" to a future leg-(c) list would still not
change this verdict's substance, because the log holds the
sentence, not a booked move — but a future prereg should name it
explicitly to avoid the argument. No metric was re-scored mid-run;
the ordinary-take path was secondary by design and is reported
separately, not folded into the verdict.
