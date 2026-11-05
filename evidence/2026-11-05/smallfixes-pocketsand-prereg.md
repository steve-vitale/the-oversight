# Prereg — pocket_sand flee-order fix (build-smallfixes, 2026-11-05)

## Question

A held pocket_sand is available on every action in its holding fights and
pressed 0 times (trickcensus, Nov 4: 2 fights, 6/6 availability logs).
Mechanism (code-verified): the policy's fight order runs the mid-fight
flee check (HP < 35% → retreat) BEFORE `abilityPressPlay`, and
pocket_sand's losing window is HP < 50% — a fighter jumping 58.5% → 31.5%
in one round goes straight past the window and the losing turn goes to a
flee move. Does reordering — a losing-control attempt before the 35%
eject — let a held pocket_sand fire in its window, without breaking flee?

## The fix (policy only, scripts/policies/competent.js — no game code)

1. `abilityPressPlay` gains an options arg `{onlyLosing}`: when true, only
   step 4 runs (losing controls: pocket_sand → freeze_tag → fear_aura).
2. `fight()` calls `abilityPressPlay(..., {onlyLosing: true})` immediately
   BEFORE the mid-fight 35% eject (and before dpsRaceAssess). If it presses,
   the turn is spent on the control; if nothing is held/pressable, the
   eject proceeds exactly as before. The later full `abilityPressPlay` call
   is unchanged.
3. pocket_sand gets a once-per-fight gate in step 4 (mirror bird_strike's
   `pressed.bird_strike`): one press buys the 2-round blind; later losing
   turns must strike, move, or flee — no sand-spam loop (the rage-loop
   failure shape, trickcensus).
4. NOT changed: the round-1 outmatched walk-away (entering a bad fight to
   throw sand instead of walking away would change fight-entry design —
   out of scope), the 35% threshold itself, the dinner reserve, any
   game-code flee rule. A human player's buttons are untouched; this is
   the competent bot's turn order.

## Proof (before/after fixtures, scripts/test-pocketsand-order-20261105.js)

Synthetic TB fights via the shared harness (seeded, deterministic):
- (a) RED on baseline / GREEN armed: scholar holds pocket_sand, HP forced
  into the 35–50% window at turn start → sand pressed, no flee move.
- (b) GREEN both: same setup WITHOUT the ability → flee fires at <35%.
- (c) GREEN armed: sand pressed once per fight — a second losing turn in
  the same fight does not re-press sand.
- (d) GREEN both: HP ≥ 50% → the pre-check presses nothing (winning play
  unchanged).
- (e) GREEN both: HP < 35% with sand unavailable (on cooldown / already
  pressed) → flee fires.
- (f) Freeze/fear fallback: sand unavailable but freeze_tag held → the
  pre-check presses freeze_tag in the window.

## Panel (mechanism panel — forced holdings, honest scope)

Wild holdings are rare (trickcensus: a cascade ability held in 4/48
fights), so a wild-rate panel would prove nothing at this n. The panel
forces the holding: competent + wrapper granting pocket_sand at each TB
fight start. Seeds **99421–99428** (fresh band — checked against all
dated `evidence/*/sim-*-prereg.md` files and the forbidden/contaminated
band lists named in them; 99401–99412 are used, 99421+ is not named
anywhere in a prereg), 140d death-aware, competent verbatim.
Control root = master e5e6aa59b (current master); candidate root = this
branch. Identical seeds, same observer (scripts/sweep-pocketsand-20261105.js).

- **Primary:** presses in the window (turn-start HP 35–50%, sand held and
  available) — armed ≥ 50% of window-turns; control expected 0 (the
  measured pre-emption). GO iff armed ≥ 50% AND control = 0.
- **Guardrail:** flees at <35% with NO losing ability held — armed ≥ 0.8×
  control (flee still fires when it should).
- **Guardrail:** sand presses per fight ≤ 1 (the once-per-fight gate
  holds); median survival armed ≥ control −10d; no new loss mode.
- **Metric review note:** wild acquisition (how often scholars HOLD
  pocket_sand) is out of scope here — the XP/abilities build owns
  acquisition. This fix makes a HELD sand pressable; it does not put
  sand in more hands.

## What does NOT count

- A press outside the window, a press when the fighter is winning, or a
  flee that never fires because sand is spammed. Any of those fails the
  arm even if the primary passes.
