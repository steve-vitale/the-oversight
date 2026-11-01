# BUILD ARM 3 — MUSTER-CALL ROSTER (2026-11-01)

## Question
Why does a full Haven commit plus trusted allies still cap the muster
below the 10-blade need? Loop A freeface arm (2026-11-01) proved the
mechanism: linked villages that were never visited carry NO roster field
— a roster is only generated when a village is catch-up-simmed on
approach — so trusted quota-6 allies send nobody when the muster call
goes out. Seed 90111 shape: Stonebridge and Thornfield unvisited, zero
free faces; Emberhold alone answered; the call yielded 3 instead of 10,
ceiling 6/10 even with a full Haven commit.

## Mechanism found (reused, not re-measured)
- `src/js/titans.js` `soundTitanCall` → `titanAlliedFaces` reads
  `(ov && ov.roster) || []`. No roster field ⇒ zero faces ⇒ the
  "has no free fighters to send" branch, even at trust 80 / opinion 20
  (quota 6).
- `src/js/game.js` `catchUpSim` is the only roster generator call site:
  `if (!village.roster) this.genVillageRoster(village)` — approach-only.
- Freeface panel proof reused per task bounds (no re-run): 66/66
  reconciliation, 22 refusal snapshots, seed 90111 shape above.

## Fix (src/js/titans.js, titanAlliedFaces only)
When the call reaches a linked village with no (or empty) roster, generate
its people through the call itself, using the same `genVillageRoster`
approach uses, and backfill the link's speaker via `_designateSpeaker`
(mirroring `_formLink`/`linkTick`). The call is a heard signal the
allies answer: responders are real named living adults on the village's
roster, not a list lookup.
- Quota and refusal still come from trust/opinion only; the roster only
  names who answers. No roster/list is fed into any decision.
- Hierarchy-link creation rules untouched (whether links require
  approach stays open, as tasked). No deedGateReady/stage/scale/gate
  retunes, no win-price changes.
- The village stays unvisited in every other sense: no `generated` flag,
  no day advance — a later approach still catch-up-sims its days. One
  known consequence, same class as visited villages: the later catch-up
  sim can age/kill generated people, and `titanUniqueAllies` drops dead
  allies on the next normalize, exactly as for visited villages.
- `titanAlliedFaces` has no other src caller besides `soundTitanCall`,
  so the change is contained to the call path.

## Coordinator-call note (figure-it-out-yourself, documented for overrule)
This fix is a coordinator call under Steve's figure-it-out-yourself
directive (2026-10-07): the call-as-contact reading of the perception
law — a heard signal answered by real people, not a roster fed into a
decision — is the builder's judgment, documented here for Steve's
overrule. If he rules the other way (a call must not conjure people),
revert this one function and the ceiling problem returns to the
link-creation question, which is deliberately left open.

## Proof — scripts/test-build-muster-roster-20261101.js
Synthetic fixture, identical seeds before/after (no freeface panel re-run):
Stonebridge + Thornfield linked/trusted (trust 80, opinion 20),
population 20, NO roster field; Emberhold linked/trusted with an explicit
8-adult roster (visited control); a trust-10 village (refusal control).
Ceiling = allied yield + up to 3 Haven commits (`titanCommitOwn` cap);
need = 10 (`herald` minAllies).

BEFORE (current master, seed 90111, run from scratch before the fix):
- per-village `{v_ember: 6}` — Stonebridge 0, Thornfield 0 (RED assert)
- allied 6, ceiling 9/10, muster NOT ready

AFTER (this branch, seeds 90111 / 90112 / 90113, all identical):
- per-village `{v_stone: 6, v_thorn: 6, v_ember: 6}` on every seed
- allied 18, ceiling 21/10, muster ready on every seed
- Low-trust village still refuses (0) on every seed; link count
  unchanged (no link created); every responder asserted to be a named
  living adult present on its village's roster.
- `node --check` clean on `src/js/titans.js` and on the proof script.
- NOT run per task bounds: full `check.js`, jest (concurrent arms).

## Commit
Branch `build-muster-roster`, message carries `[needs-eyes]`
(combat/party-feel change). Commit hash recorded in the arm report;
coordinator merges — this arm does not merge, push, or bump versions.
