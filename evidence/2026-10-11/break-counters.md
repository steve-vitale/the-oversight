# Break-it: monsters — the structural counter system (r16, 2026-10-11)

Target: the MONSTER system, emphasis on the counter/discovery engine from
5ef0a5c1 (2026-10-10) — never break-it attacked before this run.
Worker: break-counters worktree. Canon read first: CANON.md, MONSTER-WAVES.md,
ENDGAME-BUILDS.md.

## Verdict: BROKE + FIXED (6 catches, all fixed with proofs)

Proof: `scripts/test-break-counters-20261011.js` — 47/47 × 3 seeds.
Regressions: `test-monsters-break-r15-20261010.js` 234/234 × 3 seeds (green
again after the ad_break fix); `test-structural-counters-20261011.js` 52/52
× 3 seeds (updated for the mimic rewire); `test-wave-ledger-20261010.js`
31/31; ontology 63/63.

## Catches

### C1 — voice_mimic_radio counter was INVERTED vs the engine (HONESTY)
The def said: "move TOWARD the cry once and the mimic drops the voice,
exposed. Call its bluff." The engine does the opposite: approaching the cry
increments `vmLure` (it closes in on you — the lure works); the reveal
(exposed, x1.5 damage) fires only after 2 rounds of REFUSAL (`vmResist>=2`).
Following the counter's advice got the player rushed. The wave 3–5
copy-only debt, in miniature: text promising the opposite of the engine.
Fix: def rewired to `keep_distance`/3 with honest text ("Resist the lure:
don't move toward the crying. Two rounds of refusal and the act breaks").
The `approach` trick kind is now unused (still supported by the engine).
Proof: in a live fight, walking closer raises `vmLure` and does not reveal;
round_end at dist≥3 discovers the trick.

### C2 — understudy fresh_weapon was free on the first strike (HONESTY)
`checkMonsterCounter` ran BEFORE the understudy's `usSeen` recording, so
strike #1 of the fight with ANY weapon satisfied "hit it with something it's
never seen" — the switch-weapons trick discovered with zero behavior change.
The REVEAL's whole point ("Switch weapons mid-fight and it's back to
guessing") was never enforced. Fix: `freshWeapon` now also requires the
understudy to have SEEN at least one weapon already (`t.usSeen` non-empty) —
the trick is the mid-fight SWITCH. Proof: strike 1 (spear) no discover;
strike 2 same spear no discover; strike 2 switched to knife discovers.

### C3 — review_drone "never the same way" was copy-only (HONESTY)
`move_x2` fired on any two consecutive move rounds, while the drone's
predictive aim actively punishes same-direction dodges. Fix: the move handler
now records the move direction sign-vector (`f._counterLastMoveDir`) and
`checkMonsterCounter` enforces `counter.vary` (added to the drone's def).
Proof: two (0,1) moves → no discover; (0,1) then (0,-1) → discovers.

### C4 — warranty_caller "two or more tiles" was copy-only (HONESTY)
Same class: 1-tile shuffles discovered the trick while the engine's
call-drop needs 2+ tiles from the dial position. Fix: the move handler
passes `movedTiles` (path length) and `move_x2` honors `counter.tiles`
(added `tiles: 2` to the def). Proof: two 1-tile rounds → no discover; two
2-tile rounds → discovers.

### C5 — bright_idea "or behind cover" was never engine-real (HONESTY)
Bursts are radial; the COVER WORKS rule applies to beams only. The counter
reveal (and the `knownTactics` sibling text — swept too) promised cover as
an option. Fix: dropped the clause from both. The honest parts hold:
radius-2 burst → 3 tiles out is safe; the ember phase is the real punish
window (physical resist doesn't apply, engine at game.js:27617).

### C6 — ad_break damage drifted below the canon band (r15 regression)
`survival-attrition` (cc245a84) softened the floor to 19; canon
(MONSTER-WAVES.md) and the r15 proof assert 20–70. The r15 proof failed
1/234 on current HEAD because of it. Fix: floor restored to [20,33].
The r15 proof is green again.

## Attacked and HELD

- **Ledger farming (EXPLOIT):** discovery is once-only (`monsterCounters[id]`,
  early return, single beat); scoring is additive with `perTypeCap: 2` —
  a counter-known kill scores 2 (the whole cap), never multiplicative; a
  third kill of the type scores 0. No infinite loop: worst case the bonus
  halves the kills needed for a wave bar (5 → 3 types), which is the designed
  acceleration, not an exploit. Unknown kills still score 1 (never punished).
- **Teaching channel (SOFTLOCK):** `counterTeachable()` skips known types;
  teaching a type removes it from the queue; `villageSlain` for a
  counter-less type (ad_break) yields null — no phantom topics, no loops.
  The app.js topic button only renders when `counterTeachable()` is non-null.
- **Discovery-without-performing (EXPLOIT/HONESTY):** every kind's condition
  was traced to its handler: shout (tbPlayerShout, 2/fight cap, real
  chorus-break), offer_food (tbPlayerOfferFood, costs food + the turn),
  wait (tbPlayerWait), strike kinds (tbPlayerStrike), move kinds
  (tbPlayerMove), keep_distance (tbAfterPlayerAction). `keep_distance` is
  inherently passive — standing 2+ out at round end IS the trick.
  `strike_recovery` keys off `_counterDischarged` set on real attack
  discharge; `strike_lead` on the spawn-marked `wolfLead`; `strike_nonhead`
  on the ducks' real `segmentIndex`.
- **Dead code:** all 30 defs carry trick+hint+reveal and a supported kind;
  all 14 kinds fire from live handlers; `waveLedger.js` is loaded in
  index.html; waves 3–5 are deliberately counter-less (signature workers'
  call). Wait/shout/strike_first kinds verified end-to-end in live fights.
- **Kill-credit honesty:** villager field-fight kills flow through
  `recordWaveKill` (villager-agency.js:335, game.js:34243) → ledger scores
  them exactly like player kills, and `villageSlain` feeds the teaching
  channel. Steve's 22:06 directive (villager experiences count) holds.
- **Payoff honesty for the other 24 counters:** each def's promised payoff
  was checked against the monster's engine — hushwolf pack-break
  (`wolfBroken`), mirror-stag LOS fizzle ("the charge dies unspent" is
  engine-real), mosquito heavy phase, statickite +50% dip, paparazzo LOS
  fizzle, union_rep WALKOUT, memory-projector spell-break, sunbasker
  charge-knockout, heckler shame-clear on wait, moderator mute-lift on
  quiet rounds, landlord rent, warranty call-drop, glasswing grounded,
  bulldozer/heron/nevermore lane locks, gallowdeer freeze-aim,
  speedbump/tick can't-chase, nightlight 2-out strike (needs a range-2+
  weapon — honest), belltoad/hummice chorus-break, lockpick bribe. All real.

## Wave 4/5 copy/engine gap — still stands, unchanged
Wave 4/5 telegraphs are byte-identical to r15 (verified via
`git diff 919386ac HEAD -- src/data/monsters.json` — only counter-field
additions). Their mechanics still await Steve's pick; not built, per
instructions. No new promises were added.

## Files changed
- `src/data/monsters.json` — mimic rewire, drone `vary`, warranty `tiles: 2`,
  bright_idea cover-clause removal (reveal + knownTactics), ad_break [20,33]
- `src/js/game.js` — move_x2 dir/tiles enforcement, fresh_weapon seen-guard
- `docs/MONSTER-WAVES.md` — counter refinements documented
- `scripts/test-break-counters-20261011.js` — new proof (47×3)
- `scripts/test-structural-counters-20261011.js` — mimic assertions updated
  to the honest behavior
- `evidence/2026-10-11/break-counters.md` — this file
