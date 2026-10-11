# Break-it: travel & map, round 12 (2026-10-11)

Hostile-player attack on travel & map, round 12. Rounds 1–11 are closed and
were NOT re-attacked (fog leaks r4, examine spam r5, corpse-walks r6, travel
ping-pong r7, glasswing stacking r8, diagonal blockage + hive_mind honesty,
MoveAnim queue exploits + long-walk truncation r10, the `state.over`
phantom-flag class r11). This round attacked the FRESH surface landed after
r11:

- **6f538cd4** "sim-opt phase 2" — npcNodeTravel redundancy fixes: hoisted
  `travelingWith()` out of the per-villager loop (loop-invariance claim),
  removed "dead" `npcTemper`/`npcGoal` reads.
- **8b5c9613** "structural-scale Worker A" — engagement-driven foreign-realm
  growth + young-link succession grace. The grace's 'visit' answer sends a
  speaker away 2 days via `_musterAway`/`_sendAwayParty` — new travel
  surface, and the fresh caller that made an OLD double-booking class newly
  reachable in a common flow.

Canon: **no dedicated travel/map canon doc exists** (stated, not invented —
same as every prior round). Travel canon from docs/TIME-ECONOMY.md (node
travel free; travelTimeStep anti-spam) + docs/CANON.md ("If you don't know,
it doesn't show").

Worktree: `break-travel-r12` (this run).

Verdict: **BROKE + FIXED — 6 real breaks** (1 exploit class ×2 directions,
1 party-desync, 1 dead-class ×4 sites, 1 copy honesty, 1 player-loaning bug),
all in the away-party / representative-loan machinery. The sim-opt change
itself HELD (proven behavior-preserving). Foreign-polity drift HELD.

## BREAKS (all fixed, proof below)

### B1/B2 — EXPLOIT: cross-system double-booking (FIXED)

The away-party machinery (`_sendAwayParty`) never sets `v.away` and never
moves the villager's node — away by ledger, present by map. Two holes:

- **B1:** `npcNodeTravel`'s `objMaybeDepart` never checked `_isAwayVid`, so
  a villager "away" on a 2-day parley was sent out foraging the same part —
  one villager, two trips, two return announcements ("returns from foraging
  the wilds: +kcal" AND "walks back in — the road at X"), forage kcal banked
  from a phantom trip.
- **B2 (reverse):** `_musterAway` never checked `v.away`, so a villager out
  foraging was drafted for a 2-day parley — the forage clock brought them
  "home" mid-parley while `awayParties` still held them.

The drifter break-it (2026-10-10) closed re-drafting *within* the membership
ledger; the node-travel ledger was never in the check. The succession
grace's 'visit' (8b5c9613) is the fresh caller that makes this reachable in
ordinary play (any speaker death on a young link).

**Fixes:** `_musterAway` skips node-travel-away villagers; `npcNodeTravel`
skips `_isAwayVid` villagers entirely (parley/defense/trade/raid parties,
representative loans, raid-wound recoveries — away by any ledger is away
for the node system too). As a side effect this also stops raid-wounded
villagers being sent out foraging mid-recovery, which the old code allowed.

### B3 — HONESTY: party members drafted for parley (FIXED)

`_musterAway` drafted party members/followers: your companion was
simultaneously "away on parley" (awayMembers panel) and traveling with you
(`travelingWith` — teleported to your node by `placePartyAtPlayer`,
drafted into your fights by the `startCombat` wrapper). Also drafted
villagers mid-conversation (engaged). **Fix:** `_musterAway` skips
`travelingWith()` members and engaged villagers; the bench-is-empty
fallback (already at every call site) covers it honestly.

### B4 — HONESTY: the dead walk back in (FIXED)

`awayPartiesReturnTick` and `loanedReturnTick` announced "X walks back in"
with no death check. A villager killed at Haven while "away" (their node
never moves — monster attack, betrayal, raid) walked back in as a corpse.
Same lie the DEAD-IS-DEAD rule (betrayal.js 2026-10-08) bans everywhere
else. **Fix:** return ticks partition living/dead — the living walk in,
the dead get "Word comes late: X never made it home from …" (their death
was already said aloud when it happened). Repayment (`repayKcal`) only
processes when someone living returns — no "favor comes home with them"
for an empty road.

**Sibling sweep (same dead class):** the raid-wound recovery tick announced
"back on their feet" for corpses (fixed); `villageLives()` could pick a
dead villager to "come back with kcal" (fixed — filter at pick); the
endDay white-faced monster witness could be a corpse (fixed — filter at
pick). `npcNodeTravel`'s own return branch was already safe (dead skipped
at loop top).

### B5 — HONESTY: parley kindWord (FIXED)

`kindWord` for kind `'parley'` fell through to "the road": the
renegotiation promises "rides to X's fire for two days" but the return
said "the road at X". One-word fix: `'the parley'`.

### B6 — EXPLOIT/HONESTY: representative loans (FIXED, sibling sweep)

`representative()` is the *social* speaker (needed as-is by
`onLeaderDeath`, `judgeLink`, display beats), but three loan sites used it
as a *muster*:

- aid demand (`answerDemand`): no player check — when the player had the
  best standing, **the player's own id was loaned** (`m.loaned.vid ===
  villagerId`): "X walks out to serve" for a walk-out that never happened,
  then "walks back in". Also loaned villagers who were out foraging.
- accord 'visit' gesture: same forager-drafting hole.
- national host/serve + global champion loans: same hole.

**Fix:** new `_availableRepresentative()` — best linkStanding among
members who can actually walk out (not node-travel away, not on another
ledger, not traveling with you, not engaged, never the player). The four
loan sites use it; the social sites keep `representative()`. All four
degrade honestly when nobody is available (existing fallbacks: player-goes,
word-instead, "no speaker to send").

## HELD — probed, not broken

- **S1 — sim-opt hoist (6f538cd4):** attacked on its own terms.
  (1) Static: `temp`/`goal` were provably dead — in the pre-commit file
  the only `goal` mention in `npcNodeTravel` is a code comment ("The
  'escape' goal"); `temp` never read. (2) Loop-invariance: enumerated every
  writer of `partyState().party`/`.followers` (invite/dismiss/npcLeaves/
  followerCheck/betrayal/attacks/tbHostileTurn/unlock) and their callers —
  all live in conversation UI, bullying flows, the travelTo/npcBatchTurn
  wrappers, the checkSystemArrival wrapper (fires from tickAction/endDay,
  *after* npcNodeTravel returns), or combat. None is reachable from any
  `npcNodeTravel`-loop callee (`say`→`emit` is UI-only; `bumpTrust` is
  29 lines, no party writes). `checkSystemArrival` callers: debug button,
  tickAction, endDay — never the loop. (3) Empirical: old-vs-new game.js
  (6f538cd4^ vs 6f538cd4, everything else identical) run through a
  12-part scripted scenario (party member present, all objectives primed,
  day/night cycling) — **byte-identical world state × 3 seeds**
  (positions, away, inside, pantry, trust, objectives, nodes; non-vacuous:
  8 away entries, departures/returns/door-drift all fired). The hoist is
  behavior-preserving; the "redundancy" was truly redundant.
- **S2 — foreign-polity drift honesty (8b5c9613):** 60 drift-only weeks
  seeded pacts but no polity ever grew past one pair; banked engagement
  beats grew one past a pair. "Waiting does nothing; playing advances the
  arc" holds as coded.
- **D — dead-code:** all 12 travel/map entry points (`_musterAway`,
  `_sendAwayParty`, `answerRenegotiation`, `_renegotiationTick`,
  `awayPartiesReturnTick`, `loanedReturnTick`, `awayMembers`,
  `_isAwayVid`, `_availableRepresentative`, `npcNodeTravel`,
  `travelingWith`, `objMaybeDepart`, `objAwayStep`) defined AND called.
  (`answerRenegotiation`/`awayMembers` are called from app.js as
  `Game.fn()` — the first D-check regex only counted `this.fn()`; fixed
  the test, not the engine.)

## Proof

- `scripts/test-travel-r12.js` — BEFORE: 6 red legs (B1, B2, B3-companion,
  B4×2, B5); AFTER: **63/63 × seeds 7, 42, 2026**. B6 sibling assertions
  verified against the fixed engine (B6a strengthened to non-vacuous:
  a villager IS loaned, never the player).
- `scripts/test-travel-r12-simopt.js` — old-vs-new game.js equivalence
  harness (GAMEJS env); byte-identical dumps × 3 seeds.

## Regression

- `test-travel-r11.js` 126/126, `test-travel-r8.js` 25/25,
  `test-travel-r10.js` 8/8,
  `test-break-regional-20261010.js` 20/20,
  `test-structural-scale-a-succession-20261010.js` ALL GREEN,
  `test-structural-scale-a-foreign-20261010.js` ALL GREEN,
  `test-membership-20261007.js` 43/43,
  `test-hierarchy.js` 40/42 — the 2 failures ("unpaid tribute accrues
  arrears", "unpaid tribute costs trust") are PRE-EXISTING (fail
  identically on the pristine tree; noted in 8b5c9613 as "2 pre-existing
  fails, unchanged").
- `node --check` clean on game.js, hierarchy.js, membership.js.
- Ontology validator: 63/63, release permitted (added
  `_availableRepresentative()` to hierarchy.js's provides list;
  docs/ONTOLOGY.md regenerated by the validator).

## Files

- `src/js/hierarchy.js` — `_musterAway` availability skips (node-away,
  traveling-with-you, engaged); new `_availableRepresentative()`; four
  loan sites (accord visit, aid demand, national host/serve, global
  champion) muster available bodies; ontology provides entry.
- `src/js/game.js` — `npcNodeTravel` skips `_isAwayVid` villagers;
  `villageLives()` + endDay white-faced witness filter the dead.
- `src/js/membership.js` — return ticks partition living/dead (parties,
  loans, wound recoveries); kindWord `'parley'` → "the parley".
- `scripts/test-travel-r12.js`, `scripts/test-travel-r12-simopt.js` —
  proof (BEFORE red / AFTER green ×3 seeds).
- `docs/ONTOLOGY.md` — regenerated by the validator.

## Notes for Steve / open questions

- A fully-dead trade party's `repayKcal` no longer processes (the favor
  doesn't "come home with them"). Whether the inter-village debt survives
  the party is a design call — flagged, not decided.
- The away-party machinery still keeps villagers on Haven's node while
  "away" (established pattern from the representative loan, not something
  this round redesigned). The fixes make the ledgers consistent with each
  other; true map absence for away parties would be a bigger redesign.
- No [needs-eyes]: no player-facing behavior change in the common path —
  musters now skip busy villagers (falling back to existing honest lines),
  the dead no longer walk in, and parley returns are named. Nothing he
  needs to playtest by feel.

No [needs-eyes].
