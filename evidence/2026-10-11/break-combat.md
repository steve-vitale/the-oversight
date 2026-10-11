# Break-it hunt: combat engine (target 0/15) — 2026-10-11 r11

Verdict: **BROKE + FIXED (2 real catches).** Everything else held.

## Canon
No dedicated combat canon doc exists in docs/ (CANON.md lists none; closest: MONSTER-WAVES.md, BALANCING.md, SYSTEMS.md). Read those for the armor model, wave law, and leech ability text rather than inventing.

## Catches

### 1. Leech-stance trust farm (EXPLOIT — social currency via combat micro)
The leech intercept in `tbDamage` granted +5 trust (progressive) on *every* redirected hit with no rate limit. Probe: an armored ally taking 3-dmg chips while the stance was up — 12 hits moved trust 10 → 70, at ~1 player HP per +5. A hostile player could farm a villager to max trust in a few rounds of staged combat.
**Fix:** "They owe you" is one debt — trust granted once per villager per fight (tracked on `tbfight.leechOwed`). The stance still drinks half of every hit and the player still pays the sacrifice; repeat intercepts narrate without the trust claim.

### 2. Leech self-intercept (HONESTY — lying narration + cancelled punishment)
The player's own gristlefit lash (`sourceKey 'p'`) triggered "You step in front of X. You take N of it. They owe you. (trust +5)" — you can't bodyguard an ally from your own backhand, and the +5 offset the lash's designed −10 trust dent (applied just before `tbDamage`). Probe confirmed: trust 40 → 47, player ate 4 of his own lash.
**Fix:** the intercept skips player-sourced damage entirely (predicate mirrors the feasted block: `sourceKey === 'p' || (sourceLabel === 'you' && sourceKey == null)`). Lash/betrayal consequences stay intact.

## Attack surface that held
- **Armor model honesty:** numbers verified exact through `tbDamage` — player block (P=20, pierce 0.2, 30 incoming → 17 lands), villager block (P=54, pierce 0.2, 25 → 8), hit-1 clamp (1-dmg chip lands as 1, no "absorbs 0" narration), pierce default 0. fieldFights uses the identical formula. Pierce hook reads `fighter.mdef.pierce` correctly (fighters store the full def; pierce is top-level on it).
- **Softlock:** belltoad chorus hold (no live fighters + pending pack) keeps the fight open but the `tbBarrierExit` flee path is reachable — dull, not stuck.
- **Dead code:** all 18 combat fns reachable on Game; index.html loads all 58 src/js files; gallowdeer HP band [150,170] intact — Highbeam Deer 160 HP benchmark untouched.

## Sibling sweep
fieldFights `bumpTrust(+1)` fires once per ally charging in (discrete heroic act, not per-hit — fine). Leech plant grants nothing (fine). Villager attacks route via `tbDamage`. The alienPlayers `tbDamage` wrapper delegates to the patched function with no leech duplication.

## Proof & landing
- Commit `c392e4c0` (landed to master via --ff-only): `src/js/game.js` + `scripts/break-combat-harness-20261011.js` + `scripts/test-break-combat-r11-20261011.js`.
- Proof test: **20/20 green across 3 seeds** (break assertions + fix assertions + armor/honesty/wiring), re-verified green after landing.
- Regressions: `test-combat-break2-20261010.js` 33/33, `test-abilities-breakit-r4-20261011.js` 38/38.
- No `[needs-eyes]` — silent economy fix, proven by test, no playtest needed.
- Report: **merged locally, pending ship** (ship loop owns bump/push/live).
