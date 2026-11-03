# gap-encounter leg 6 only — wanderer drifts toward Haven's row on edge bounce

This note covers ONLY leg 6 of the gap-encounter cluster. Legs 3 (wild
ally-join) and 5 (turn-budget) are HELD for an attrition investigation and
are NOT in this arm. Full cluster evidence (all legs, corpus, attribution):
`evidence/2026-11-02/gap-encounter-cluster-20261102.md` on branch
`gap-encounter` (cluster commit `215c090b0`).

## The change (one hunk, `src/js/game.js` `moveWanderer` only)

Before, a wanderer paced ONE row forever: on an x-edge bounce it just
flipped direction. A wanderer on the wrong row could never meet the player,
and while it lived the cast slot stayed occupied, so no new wanderer was
ever cast (1915Z corpus: trigger rows empty on every seed; a day-3
wanderer still pacing its row on day 91).

Now, on an edge bounce, the wanderer also shifts one row toward Haven's
row (the village's tile row, default 4). The drift target is a PLACE —
the smoke and noise of habitation — never a roster or the player's
position, the same bias-as-not-homing the Herald steer already uses.
Safe tiles still turn it away; havens stay safe.

## Proof (re-run on the merge base)

`scripts/test-gap-encounter-wanderer-20261102.js` (taken verbatim from
the cluster branch tip `5dc2b37ad`): **4/4 checks passed**.

- Wanderer ranges off its starting row (rows paced 4, 5, 6, 7 over 33 steps).
- Wanderer contacts the player: `triggerEncounter` fires (1 trigger).
- Contact leaves a pending encounter for the fight.

## What this means in plain words

Wandering monsters no longer get stuck pacing a row the player never
visits. Over a run they drift toward where people live, so wild meetings
with wanderers can actually happen instead of the meeting channel sitting
blocked for the whole run. This does not change how often wanderers are
cast, how fights work, or who joins a fight — only where a pacing
wanderer drifts when it bounces off the map edge.
