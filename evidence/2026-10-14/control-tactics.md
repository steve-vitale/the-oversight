# Control Tactics — Evidence (2026-10-14)

Steve's feedback on the +50% party-openings mechanic: "That control effect
sounds like a state boost not a strategic benefit. Maybe it should be both
but I want the gameplay to change more than just a stat boost. Stunlocking
should be a viable strategy for some fights."

## What changed

**Three tactical control verbs** (game.js + app.js combat UI):
- **SHOVE** (`tbPlayerShove`): push a controlled size-1 monster 2 tiles
  directly away from you. Stops at blocked tiles; colliding with another
  fighter deals [5,10] to both. Costs the action. The tactic is positioning
  — YOU decide which way is "away" (into its friends, away from yours).
- **BIND** (`tbPlayerBind`): spend 1 rope + the action on a CONTROLLED monster
  (stunned, rooted, blinded, hesitating — the verbs compose) → rooted 3 rounds
  AND cannot wind up telegraphs (hogtied = no room for big attacks). Diminishing:
  3→2→1 rounds per previous bind on the same monster. It can still lash out
  with basics — the rope holds position, not malice.
- **GOAD** (`tbPlayerGoad`): vs a blinded monster within 3 tiles — make a noise.
  It lurches toward the sound on its next move (one move, then spent). Costs
  the action. The tactic: stand where you want it (near your tripwire, away
  from the downed villager).

All three surface in the combat UI only when valid (contextual, knowledge-gated
per Steve's UI rules) with explanatory tooltips. All narrated, no silent effects.

**OPENINGS reduced** 50%→25% (game.js tbDamage hook). Steve: "maybe both" —
the verbs are the headline now, the damage is a secondary nod. Also now covers
bound monsters.

**Villager AI** (tbVillagerAbility): villagers SHOVE controlled monsters away
from the most vulnerable ally (lowest HP fraction). Protective, not greedy.

**Codex "interruptible"**: gallowdeer (Ocular Discharge) and bulldozer
(China-Shop Charge) counters now document "Interruptible — a stun/shout during
the windup fizzles it." (Belltoad already had this.)

## Design insight from implementation

The action economy initially broke the stunlock chain: stun (1 round) wears off
before the player's next turn, so stun→bind was impossible. Two fixes:
1. BIND accepts ANY controlled monster (not just stunned) — blind→bind,
   root→bind compose across verbs.
2. BIND suppresses telegraphs (not just movement) — a hogtied monster can't
   wind up. This is what makes it a real lock, not just a root.

## Proof

`scripts/test-control-tactics.js`: 38 assertions, RED (0/3 on HEAD) → GREEN
(38/38). Patch-file method, no stash. Covers: shove moves/blocks/refuses,
bind roots/consumes rope/diminishes/refuses without rope/works on blinded,
goad redirects/refuses, openings at +25%, codex notes, bound blocks move +
suppresses telegraphs.

## Playtest: stunlock flips the fight

`scripts/play-control-tactics-20261014.js`. Crusher (90 HP, Seismic Slam 90 dmg
telegraphed turn 2, fires turn 3). Player (100 HP, bow 20/round, pocket_sand,
1 rope).

- **ARM A (damage race)**: LOSE. Slam fires turn 3 (90 dmg), player dies turn 4.
- **ARM B (stunlock: blind T1 → bind T2 → bow)**: WIN. Player at 70 HP, rope
  spent, the Slam NEVER FIRES. The lock (blind 2 + bind 3, no telegraphs while
  bound) gives 5 clean rounds; the monster dies before it can wind up.

Pre-registered metric: "stunlock flips ≥1 fight that damage-race loses" → **GO**.

## Metric review (ANTI-DRIFT)

What was proven: verbs execute, status mechanics hold, one scripted fight flips.
What was NOT proven: full-sim win rates, villager shove frequency in real runs,
whether players discover the verbs in the UI (needs playtest-loop measurement).
The +25% openings component was not isolated — the playtest used the verbs, not
the damage bonus. If sims show the bonus (not the tactics) flipping fights, cut
it per Steve's direction.

Waves 1-3 impact: none — verbs cost actions/rope, only work on controlled
targets, size-1 only. No general power increase.

## Files changed
- src/js/game.js: tbPlayerShove/tbPlayerBind/tbPlayerGoad, _bound/_goadedBy hooks
  in tbStepToward + tbMonsterTurn, openings 50%→25%, villager shove
- src/js/app.js: SHOVE/BIND/GOAD buttons + targeting wires
- src/data/monsters.json: gallowdeer + bulldozer "interruptible" counters
- scripts/test-control-tactics.js: 38-assertion RED→GREEN proof
- scripts/play-control-tactics-20261014.js: stunlock-vs-damage-race playtest
