# Break-it hunt: combat engine (target 0/15) — 2026-10-11 r12

Verdict: **BROKE + FIXED (1 real catch).** Everything else held.

## Canon
No dedicated combat canon doc exists in docs/ (CANON.md lists none; closest:
MONSTER-WAVES.md, BALANCING.md, SYSTEMS.md). Read those for the armor model,
wave law, and the wave-ledger law ("kills only — 1 point per kill, 2 per
counter-kill", per-type cap 2) rather than inventing.

## Catch

### 1. 'Routed' with kills paid NOTHING (EXPLOIT/HONESTY — kill rewards + ledger gated on 'won')
Kill 2 of 3 hushwolves and the last one melts away (lead-death scatter), or
walk clear of non-chasers after dropping one — `tbEndCheck` routes 'routed',
and `tbEnd` paid out **only** on 'won'. The dead bodies yielded: no carcass
meat, no loot roll, no codex 'slain', no villageSlain, no wave-ledger point —
and the routed narration lied: "No meat, no trophy" about bodies at your
feet. Steve's standing rule (break-it round 2): "every body you drop pays
out — one carcass + one loot roll per creature." One body = one kill,
whatever the ending.

**Fix** (src/js/game.js, `tbEnd`):
- The per-kill LEDGER loop (`recordWaveKill`, lineage-deduped) now runs on
  'won' AND 'routed'.
- The per-kill REWARDS body (codex 'slain', meat, loot roll, grave-robber)
  extracted into `tbKillRewards(_kills)`; the lineage-deduped `_kills` list is
  computed once and shared. The routed branch pays it when `_kills.length`,
  with honest narration: "It got away — but the dead don't run. You take
  what's theirs." Pure routs (no kills) keep the old honest line.
- Deliberately NOT carried over to 'routed': `combatWins++`, `leadShift('force')`,
  'WINNER!' sysSay, `villageEvent('victory')`, sentimental bond +3 — a rout is
  not a victory. Witnesses DO react to the kill (`combatWitnessReact('kill')`).
- 'fled' stays forfeit — a considered boundary, not an oversight: you
  abandoned the field; the meat, loot, and ledger points stay behind. Fleeing
  can never farm the wave gates.

## Attack surface that held
- **Friendly fire:** `tbPlayerStrike` refuses villager targets with narration
  ("that's not a strike — that's betrayal"); betrayal has its own
  consequence-laden path. No free villager-kill farming.
- **leadShift farming:** +1 force per 'won' is linear with real fights won —
  no cap needed; earned-endings compare relative vector scores. Held.
- **Dead code (Alien-Players lesson):** all 52 src/js files are loaded in
  index.html; every `preTurnHooks` name in monsterBehaviors.json resolves to a
  registered `MonsterBehaviorHooks` function (all 9 wave-3 signature monsters
  incl. `focus_group_eye`/`ad_sponsor` spawn-paths); no orphan registrations;
  all 13 counter kinds in data are handled in `checkMonsterCounter`'s switch;
  `mbRunPreTurn` is called from `tbMonsterTurn`.
- **Pierce hook:** behavioral proof — wave-3 `callback` (pierce 0.25) vs P=20
  villager: 30 incoming lands 17 (vs 15 with pierce 0). The hook is live in
  the villager block, not copy-only.
- **Softlock:** all-fled ends cleanly (tbfight cleared); belltoad chorus hold
  keeps the fight open but terminates when the pack exhausts (dull, not stuck);
  a dead monster's pending telegraph survives the round wrap without crashing.
- **Honesty:** `tbDamage` returns exactly what landed (verified through the
  villager armor block incl. hit-1 clamp); the "No meat, no trophy" line is
  now only said when nothing actually died.
- **Sibling sweep:** the same bug class (kill rewards/ledger gated on result)
  does NOT exist in fieldFights (outcomes are mutually exclusive — no mixed
  kill+flee state), villager-agency patrol kills, or expedition kills — all
  pay per kill already. Arena contests route through the fixed `tbEnd`.
- Non-catch verified along the way: `identifyMonster(mm.monsterId)` is NOT a
  no-op — real fighters carry `monsterId` (startCombat sets it); the routed/
  fled identify path works. `tele()` is defined (game.js, telemetry ring).

## Proof & landing
- Commit: `src/js/game.js` + `scripts/test-break-combat-r12-20261011.js` +
  this evidence file. `node --check` clean.
- Proof test: **28/28 green across 3 seeds** (11, 222, 3333). Pre-fix, the 5
  R1-FIX assertions went red exactly as predicted (ledger 0→0, waveKills 0→0,
  codex 'encountered', narration lied); post-fix all green.
- Regressions: `test-break-combat-r11-20261011.js` 20/20, `test-combat-break3-20261010.js`
  34/34, `test-structural-counters-20261011.js` 52/52, `test-wave3-5-20261010.js`
  214/214, ontology 63/63 — all green.
- No `[needs-eyes]` — silent economy + honest-copy fix, proven by test; no
  playtest needed.
- Report: **merged locally, pending ship** (ship loop owns bump/push/live).
