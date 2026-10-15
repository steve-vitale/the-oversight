# Coalition reach and disengagement audit — 2026-10-15

Social play's army must actually use donated gear. The prepared Finale
probe exposed two runtime defects before any health or damage tuning:

- Allies measured distance to a large monster's anchor, although the player
  can strike its whole occupied body. Some adjacent armed allies threw rocks
  instead. Shared NPC selection, approach and attack now measure the target's
  whole body, using the same origin-to-target convention as the player.
- Automatic disengagement considered only the bearer. Standing behind an
  engaged coalition routed living passive enemies. It now checks every living,
  present player/ally/villager. Explicit escape, chasers, incoming packs and
  committed telegraphs retain their existing behavior.

No HP, damage, reward, recruitment or progression numbers changed. These
repairs help a social coalition function; they do not establish universal
playstyle viability or remove the remaining crafting and livelihood gaps.

## Proof

The frozen baseline is HEAD `6354e685`, exported under `.git/ally-reach-before`.
New tests copied into that tree fail on the old runtime: whole-body reach
6 pass / 5 fail; party disengagement 9 pass / 3 fail. The fixed runtime
passes 11 and 12 assertions respectively, including an actual villager turn
using its donated weapon at a large target's outer footprint. The end-check
test observes the real decision while stubbing the downstream end handler;
campaign probes exercise actual resolution and losses.

`validate-ontology.js`: 111 systems, no errors. Quick checks: 118 scripts,
all passing. The first full run passed 889/890: the legacy unseeded miser
test happened to roll near-cache theft 1/30 and far 1/30. Both current and
frozen runtime pass a direct rerun. Seeding the legacy fixture with shared
`sim-harness.mulberry32(42)` before evaluation preserves all 34 assertions;
three repeats give near 7/30, far 1/30. No production storage change.
The second full run passed 889/890 with a different legacy random failure:
the dialogue pool's 40 draws missed one close-friend line. Its unseeded
direct rerun passes. The same shared seed before evaluation gives 32/32 on
three repeats, preserving every dialogue and knowledge-gate assertion.
Final full suite: **890 passed, 0 failed in 173 seconds**. No assertions
were removed, quarantined or relaxed. No browser/UI change was made in this
pass; runtime tests and prepared public-action simulations supply its proof.

## Prepared tactical comparison

`ally-reach-prepared-16.json` runs the same 16 seeds and audit policy against
old/new game source. Reports include hashes. The prepared fixture supplies
strong actual alliances, 400,000 carried calories and actual phase-blade /
carapace items, then uses real recruitment, donation, movement and combat.
Initial HP/max HP remain 100/100. It grants no late ability build. This is
capacity/tactics evidence, **not natural acquisition or a campaign win rate**.

The audit tool now spawns only the first node. Later objectives must come
from actual campaign resolution; the old fixture wrongly pre-spawned all
three stages on the same tile. It stops after a non-win and never advances
the crew objective for a routed encounter.

An explicitly selected experimental `--tactic guard` stays behind allies
and uses the publicly offered Binding Q to counter the Spoiler. It pays real
movement/actions and ends its turn after acting, rather than letting the
ordinary bot spend remaining movement closing into melee. The experiment
lives only in `campaign-prepared.js`; ordinary policies are unchanged.
`--trace 1` records damage without changing gameplay: seed 7's final
gameplay-state hash is identical with tracing off/on.

| Prepared outcome | Before | After |
|---|---:|---:|
| Entered crew fight | 15/16 | 15/16 |
| Won crew fight (all three foes dead) | 0 | 7 |
| Routed crew with foes alive | 11 | 0 |
| Fled crew | 4 | 7 |
| Lost crew | 0 | 1 |
| Subsequently won opening credits | 0 | 2 |
| Complete Finale campaign | 0 | 0 |

Seed 42 never meets the army floor. Seed 7 still loses its bearer with 18
allies alive. The Network Note has authored FIFO targeting, so nearest-body
selection alone does not make it abandon the bearer; this is not evidence
of a new targeting bug. Rally/War Cry explorations did not justify promoting
either as an automatic solution. The default campaign bot does not yet use
the guard experiment, and the experiment needs fuller knowledge-parity review
before promotion.

## Natural matched screen

`ally-reach-before.json` and `ally-reach-after.json` use the standard driver,
same 16 seeds × two frozen policies × 240 days. Source manifests identify
the changed engine and game bytes. Guard is not called in these runs.

| Natural result | Before | After |
|---|---:|---:|
| Control Table wins | 9/16 | 11/16 |
| Campaigner Table wins | 11/16 | 9/16 |
| Campaigner Herald kills | 6/16 | 6/16 |
| Campaigner policy errors | 0 | 0 |

Three control state hashes match; all campaigner trajectories diverge. These
small screens do not establish a survival/probability improvement. Do not
use the prepared crew clears as a natural progression claim.

## Next blockers

Actual next-node spawning can leave the nine-wide world: prepared seed 1234
clears opening credits at (8,3), then the heart spawns at (15,3); seed 777
spawns it at (14,4). This is a reachable-location defect, not a reason to
teleport the bot. Repair and prove legal reachable node placement next.
Some legal targets also hit ordinary travel/health policy stops. Food,
overtime, six-slot build use, crew-spoil controls, and a full Finale/Network
march remain unverified. Noncombat acquisition results remain those in
`noncombat-gear-audit.md` and `bowyer-route-audit.md`.
