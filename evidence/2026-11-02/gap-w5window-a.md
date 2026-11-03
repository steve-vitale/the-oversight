# Wave-5 window arm — wanderer cast-slot deadlock (gap-w5window)

Built, not held. One game mechanism fixed; the window-truncation itself
is gate-shaped and is HELD (see §5). No gate, threshold, rate, window,
seat-timing, or win-condition value changed.

## 1. Diagnosis — starts from the landed w5faced stage tables

Source: `evidence/2026-11-03/sim-w5faced-a.md` (commit 7a73ff079),
5-leg corpus, 4 wave-5-unlocked seeds. Re-checked against the corpus
JSONs directly (not re-derived from scratch):

- Cast wave-5 = 0, trigger wave-5 = 0, wanderer wave-5 days = 0 on ALL
  five legs. Cast rows per whole 86–180d run: only 2–7 total.
- Per-seed cast days: 97418 casts at d3, 19, 25, 27, 34, 43, 51 and then
  NOTHING through the d60–90 window; 97409 casts at d3, d15 and then
  nothing through d180; 98201's last cast is d68 (wave 4), before its
  d76 unlock; 97438's last cast is d83 (wave 3), before its d88 unlock.
- The daily snapshots explain why: 97418's wanderer is the same
  gallowdeer (wave 1) pacing row y=0 from day 3 to day 90 while the
  player sits at (4,4). A wanderer paces ONE row; `checkEncounter`
  only casts a new one when `!wanderer`; `moveWanderer` only clears it
  on contact; contact needs the player's tile, and a Haven tile makes
  it turn away instead. So the first wanderer a home-based player never
  meets blocks the cast channel for the entire run — including the
  whole post-unlock window. `castMonster` itself is healthy: it picks
  from the current wave, and `spawnWaveTarget` returns wave 5 at the
  designed share (see proof §4). The channel is dead because the slot
  never frees, not because the cast mis-picks.
- Correction to the brief's shorthand: the Rerun did NOT sit on the
  player's tile for 13 days. It spawned on the player's tile at the
  checkEncounter instant (player was at (4,3)), the player then moved
  home, and the Rerun wandered 2–5 tiles away for 13 days, never
  sharing a tile with the player or a villager again, never fought,
  never removed. That is the world-monster side of the same story:
  nothing re-offers a wandering beast to anyone.
- Ruled OUT with numbers (investigated, not built):
  - World-monster cap: corpus world totals run 9–16 against a cap of
    5–9, so the cap does not bind — `checkEncounter` spawns bypass it.
    Lingering monsters do not block new spawns.
  - CampaignOnly `finale_crew` occupying slots: same reason — it
    lingers (d76→d90, d172→d181) but cannot block uncapped spawns.
    Deleting lingerers would REMOVE fight candidates, hurting the
    window. No cleanup built, deliberately.
  - Conversion (spawn → fight): proven working, see proof §4 control.
    A world-spawned Rerun starts a fight and counts as faced.
  - Trigger for world spawns: `triggerEncounter` is only ever called
    from wanderer contact (plus bespoke paths). A world monster fights
    through the Fight action, not through trigger — so triggerW5 = 0
    for world spawns is by design, not a bug. The trigger zero that
    matters is the wanderer-contact zero, which follows from the dead
    cast slot: no wave-5 wanderer ever exists, so none ever contacts.

## 2. What was built

`src/js/game.js` only (24 insertions, 1 deletion):

- `checkEncounter`'s wanderer creation stamps `bornDay: scholar.day`
  on the new wanderer.
- `moveWanderer` (runs once per day-part) now: if the wanderer has no
  `bornDay` (saved before this change) it is stamped with today and
  gets its full 7 days from load — never an instant expiry; if it has
  gone 7 days without contact, it moves on with one announced line
  ("The pacing in the woods fades — whatever was out there has moved
  on."), the slot clears, and `wandererNextDay` resets to today so the
  next non-safe tile entry casts anew at the CURRENT wave.

Why 7 days is a repair, not a retune: a wanderer steps 4 tiles/day
across a 9-wide row, sweeping it several times over in 7 days, and the
designed recurrence is contact + 4 days. A beast uncontacted for 7
days is definitionally stuck (row mismatch or Haven bounce are
permanent for a home-based player), not merely slow. Wanderers that
contact normally — the designed path — are untouched: they contact
within days and never reach the timeout.

No combat-feel change, so no `[needs-eyes]` marker. No new system, no
new list, no roster feed: the beast is sensed (it paces, it fades),
never listed.

## 3. Files changed

- `src/js/game.js` — wanderer `bornDay` stamp + 7-day give-up in
  `moveWanderer`.
- `scripts/test-w5window-a.js` — proof test (new).
- `evidence/2026-11-02/gap-w5window-a.md` — this file.

## 4. Proof — scripts/test-w5window-a.js (node, seed 97418)

Before (unmodified `game.js` at a63ffc8c9) vs after (this branch),
identical seed, same script:

| Check | Before | After |
|---|---|---|
| Stuck wanderer alive at age 6 | PASS | PASS |
| Stuck wanderer expired at age 7 | FAIL (still pacing) | PASS |
| Expiry announced (fade line) | FAIL (silence) | PASS |
| Expiry resets `wandererNextDay` to today | FAIL | PASS |
| Fresh wanderer alive at 6 / expired at 7 | PASS / FAIL | PASS / PASS |
| Legacy wanderer (no `bornDay`) stamped, not expired | FAIL (never stamped) | PASS |
| Recast after expiry carries today's `bornDay` | FAIL (old beast persists) | PASS |
| 30-day revival loop, new wanderer casts | 0 casts, 0 triggers | 4 casts, 0 triggers |
| Conversion control: Rerun spawns on player tile, fight starts, faced = wave 5 | PASS | PASS |
| `spawnWaveTarget` wave-5 share on a wave-5 pool (200 draws) | 107/200 (53.5%) | 116/200 (58%) |
| TOTAL | 8/16 | 16/16 |

The revival-loop casts after the fix were gallowdeer, anaconda_empress,
sanjun, mirrormoth (wave 1 in a fresh game — the mechanism is
wave-agnostic; at unlocked wave 5 the same recast path draws wave 5 at
the 55% share proven above). Regression sanity: the existing
`scripts/test-wave5encounter-diag-20261103.js` still passes 22/22.
`scripts/test-spawn-rates-20261006.js` crashes with `Text is not
defined` in `genCharacter` — verified identical on unmodified HEAD
game.js, so pre-existing and unrelated to this change (it crashes
before any wanderer code runs). `check.js` NOT run here by instruction;
the coordinator runs it serialized at merge.

Honest limit of this fix: triggers in the stationary-player revival
loop are still 0. Reviving casts puts wave-5 wanderers back into the
world, but a wanderer still only triggers when it meets the player —
a player who never leaves home still never meets one. That contact gap
is real, but closing it by homing the beast onto the player would
break the Haven-safety design, and widening the window itself is
gate-shaped (see §5).

## 5. HELD — the window truncation (gate-shaped, not built)

The diagnosis's main bottleneck — windows of 7–30 days before lesser-seat
wins end the run, with only 13 post-unlock `spawnWaveTarget` calls
across all 4 unlocked seeds (3 returning wave 5) — is a scarcity of
spawn opportunities inside a truncated window. Lengthening the window,
retuning spawn rates, delaying the lesser seat, or lowering the
2-distinct-kinds bar would all be gate-shaped, and are HELD under the
gating freeze, not built here. This arm fixes the permanently dead cast
channel inside whatever window exists; it does not claim to make 2
distinct wave-5 kinds reachable inside a 7-day window. The lesser-seat
win path itself was not touched.

## 6. Plain-words meaning

Before this fix, the beast the System sends to pace your treeline could
get stuck pacing a row you never visit — and because it never left,
the System never sent another one, all run long. After your village
unlocks wave 5, that meant no new prowling beast ever arrived, even
though the new wave was open. Now a beast that paces unmet for a week
gives up and moves on (you hear it fade), and the System casts a fresh
one the next time you step out — cast at the wave your village has
actually reached. A village chasing wave 5 still has to go out and meet
what comes, and a short window before sitting is still short — but the
door is no longer jammed shut from the day the first beast arrived.
