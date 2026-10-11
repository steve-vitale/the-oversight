# Break-it: alien players — r14 (2026-10-11)

Target: `src/js/alienPlayers.js` (2925 lines). Canon read first: docs/CANON.md,
docs/MONSTER-WAVES.md. No dedicated alien-players canon doc exists; Steve's
standing designs applied: impersonate HUMANS not monsters (2026-10-07), "They
are all other players too" (2026-10-11), "If you don't know, it doesn't show",
encounters fought not rolled, monster tiers ≠ loot tiers.

## Verdict: HELD. Nothing broke. No fixes, no sibling sweep needed.

This is the 7th adversarial pass on this module (r3/r4/r6/r7/r11/r13 before).
Prior rounds already hardened the sporting rules, death permanence, kill-only
salvage, knowledge gating, and the beam path. This round re-attacked every
class and found the armor holding.

## Attacks attempted

### 1. EXPLOIT
- **Favor farming**: `apAdjustFavor` clamps each lane at ±100; daily drift pulls
  toward 0. Forcing 60× +6 gains stops at 100; 10 daily ticks pull 50 → 40.
  Farming loop is bounded by sporting rules (min 2 days between hunts per
  persona) + the clamp + drift. (Proof T1.)
- **Armor salvage duplication**: kill-only (fled wins grant nothing), 60% roll,
  dedupes owned pieces — with a full set owned, kills grant nothing and say
  "standard gear" honestly. `apGrantItem` ids are unique (Date.now+random);
  all callers pass hardcoded/whitelisted ids — no user-input id reaches it.
  (Proof T2.)
- **Free kcal audit**: dead drops (1/3d, 200–500 kcal, benevolent only), care
  packages (1/4d, wacky gift + 30–70 kcal snack), club boons (1/5d, lane ≥50),
  persona packages (1/6d). All rate-limited; the r13 economy test already
  bounded 90 days of hostile-max play. Held.
- **Bond farming Old Tam** (weak, no beam, benevolent): bond+1 per win feeds the
  lifeline (death save, bond ≥2, 40%, 1/week). Within sporting rules, requires
  real fought wins — legitimate play, not an exploit. Held by design.
- **Infinite loops / recursion**: `apBeamHit` applies damage directly, never
  re-enters `tbDamage`; the `alien_beam` intercept routes one way only. Beam
  roll lives in `tbAlienTurn` and REPLACES the strike (`endTurn(); return;`) —
  no bonus attack, no turn-0 beam. No recursion anywhere in the module.

### 2. SOFTLOCK
- **Stasis field** (Rax): `apStasisFieldLive` returns the pid only while a live,
  non-fled hostile fields the tech in a non-over fight. Fled/dead/fight-over
  all clear it. Flee is blocked by design ("You leave when Rax says you
  leave") — the fight still ends by killing Rax, Rax retreating (wealth
  stance), or player death (respawn as villager — the village continues).
  No stuck state. (Proof T3 + live fight F2.)
- **All-dead pool**: with every combat persona dead, `apRollEncounter`,
  `apMaybeActivate`, `apRollGroupEncounter` all return null; `apStartEncounter`
  refuses corpses; playground tick is quiet; dead Wren leaves no drops. No
  phantom fights, no empty-group crash. (Proof T4.)
- **Activation/deactivation races**: `apMaybeActivate` capped at 3 active,
  1 new per 4 days, skips dead; `apMaybeDeactivate` releases on maxStay/boredom;
  `apPlaygroundTick` releases dead actives before they act. Group chain consumes
  `state.alienGroup` BEFORE chaining — no re-entry. Held.

### 3. HONESTY
- **Impersonation**: pre-reveal the fighter is literally named "Stranger" with
  🧑 emoji. Scanned every naming surface (combat intro, taunts, chatter,
  victory/defeat lines, stance announcements, feed messages, gossip, codex,
  contact warnings, duel reports, burn/raid/kill sysSays, activation/
  deactivation, club boons, package cards): no persona name surfaces unless
  `apKnowsAlien` is true. The one deliberate exception is the System feed
  naming a rival — and that naming IS the reveal path (`apRevealAlien(...,
  'the System feed named them')`), invariant-tested. (Proof T5.)
- **Beam resist pieces**: `apBeamResistPieces` counts equipped alien armor
  (`armor.beamResist` — all 5 salvage pieces exist in items.json) + bonded
  sentimental armor (bond ≥25). Damage = round(maxHp × 0.9–1.1 × 0.7ⁿ),
  clamped ≥1. Verified: naked → ~maxHp; full set → ×0.7⁵; single piece → 1.
  (Proof T6.) `apArmorName` is flavor text only.
- **Exclusive pool**: alien encounters roll from their own pool (8%/15%),
  never the monster table. Separation verified against every monster system:
  wave ledger scoring gates on `kind === 'monster'` (3 call sites — aliens are
  `kind: 'hostile'`); monster codex untouched (`state.codex.aliens` is separate);
  monster counters gate on `m.kind !== 'monster'` + mdef lookup (aliens have no
  mdef → no counter); telegraphs/counters/waves never touch them. The ONLY
  monster-system read is `unlockedWave() >= 2` as an eligibility gate.
  Alien fighters route through `tbAlienTurn`, never the generic monster turn;
  `tbEndCheck` treats alien hostiles as the enemy so fights don't phantom-win.
- **Copy vs engine spot-checks**: "stasis prevents fleeing" (blocks barrier
  exit, live fight F2); "beam goes through armor" (bypasses armor model, only
  resist pieces count); "kill them, strip their armor" (kill-only salvage);
  "the dead don't come back" (every pool consults `apIsDead`).

### 4. DEAD CODE
- The 2026-10-08 lesson holds: `alienPlayers.js` is loaded in index.html
  (line 47), and all 76 defined methods are reachable: 17 called directly from
  contests.js/game.js/encounters.js/debug-scenarios.js, the rest from the
  module's own IIFE wraps (`tbEnd`, `tbAfterPlayerAction`, `endDay`,
  `tbBarrierExit`, `tbDamage`) or from those roots. **Zero defined-but-never-
  invoked functions.** (Proof T7.)
- Runtime wiring confirmed real: `endDay` → `apDailyTick`, `tbEnd` →
  `apOnCombatEnd` + group chain, `tbAfterPlayerAction` → wealth stance/chatter.

## Live fight (proof 2)
Fought Rax in the node harness: encounter starts, fighter is "Stranger" 🧑,
barrier exit consumed by stasis (fight continues, message names no one),
beam fired through the real roll path and dealt real damage, killing blow
ended the fight with Rax dead / encounter state cleared / met record written,
and the corpse never re-rolled or re-activated. 19/19 × 3 seeds.

## Observations (not bugs)
- `apContestInterference` returns `result.note` carrying the raw persona name,
  but no consumer ever reads `.note` (contests.js reads `winMod`/`deathSave`;
  game.js reads `deathSave`) — the displayed line is the knowledge-gated
  `say()`. Write-only dead data, no leak. Left alone.
- `apBeamResistPieces` counts 'feet' as a separate legacy slot; equipment.js
  migrates feet→shoes on load, so double-counting is unreachable in practice.
  Left alone.

## Proof
- `scripts/test-break-alien7-20261011.js` — 31/31 × 3 seeds (777, 1234, 99999)
- `scripts/test-break-alien7-fight-20261011.js` — 19/19 × 3 seeds (4242, 7777, 31337)
- Ontology validator: 63/63 systems, release permitted (no changes needed).

## Attack surface notes (why it held)
Seven adversarial rounds have converged this module: every reward path is
rate-limited or clamped, every selection pool consults the death flag, every
naming surface is knowledge-gated, and the beam/stasis mechanics are engine-
real rather than copy. The remaining risk is content depth (personas' kits),
not integrity — that's a flesh-out concern, not a break-it one.
