# PARITY-ABILITIES DRIFT DETERMINATION (gaps-completion, 2026-10-30)

## Verdict: DRIFT — test-wrong on all three legs, no ability regression

The live-arms worker's finding reproduces exactly on this branch
(HEAD 06b502d53, before the fix): `scripts/test-parity-abilities.js`
runs **12 PASS / 3 FAIL** — Take Aim 6/120 vs bar >24, tactical
unbreakable landed=5 vs band 6–19, tactical haymaker 0 lines in 2
rounds. The parity-prep landing (e03aeed77) is NOT overturned: its
map-slice proofs still pass, and the three failing legs are all
stale test calibrations/setups, invalidated by later, intentional
game changes. **No ability code is wrong. No game-behavior change
was made or is needed.** The fix landed here is test-only.

The 15/15 figure in the e03aeed77 parity doc is a reconstruction of
the original 2026-10-10 parity-audit run, not a re-run: that commit
is evidence-only and the test file itself is unchanged since the
2026-10-16 squash commit. The doc's number described October-10
mechanics; the game has since changed underneath it in four
named, dated ways (below). After the test-only recalibration in
this commit, the test runs **15/15 again on current code** — but
that is a recalibrated 15/15, not the original bars passing, and
must be reported as such.

## Leg 1 — Take Aim 6/120 vs bar >24: STALE BAR (initiative drift)

Mechanism (fieldFights.js, Take Aim branch): fires only when the
villager acts on round 1 at full HP against a monster still above
50% HP. Any monster hit first wounds the villager and gates Take
Aim out for the whole fight — there is no re-entry.

Why 6/120 now (measured, seed-777 deterministic run):
- 56/120 fights evade outright (awareness check, 0 rounds) — aiming
  is impossible there. Contact fights: 64.
- Initiative since blitz-combatstats (2026-10-13, in the squash
  header: "not the old flat 3") is speed vs speed:
  `mInit = mSpeed + RR()*2`, `vInit = vSpeed + RR()*2`, monster
  first on ties. This test's villager Luz has villagerSpeed 2
  (`villagerSpeed`: age/temperament; game.js), the bulldozer has no
  data speed so `mSpeed = mdef.speed || 3` = 3. P(villager first)
  = P(b − a > 0.5) = 12.5%.
- Ceiling: 53% contact × 12.5% initiative ≈ 6.6% ≈ 8/120 even if
  the monster were always above 50% HP. The old >24 bar (20%) is
  structurally unachievable for this villager/monster pair.
- Observed 6/120 (6/64 contact = 9.4%). All 6 aim fights show the
  R1 villager-first Take Aim line followed by the aimed 2.5x
  strike: **patient_aim works exactly as designed** whenever its
  conditions hold.

Fix: denominator changed to contact fights, bar to >5% of contact
(derivation in the test comment). 6 > 64×0.05 = 3.2. The bar still
fails in STRIP mode (0 aim lines) and still fails if aiming ever
stops firing — it is a recalibration to current initiative rules,
not a loosening to green.

Caveat: pre-2026-10-13 fieldFight code is inside the squash
commit, so the old flat-3 rule is attested by the code's own
header comment ("VILLAGER COMBAT SPEED (blitz-combatstats
2026-10-13): the flat 3 was a lie"), not by a diff viewed in this
clone. The current-mechanics math above does not depend on that
history: the bar is unachievable under current rules regardless.

## Leg 2 — Tactical unbreakable landed=5 vs band 6–19: STALE BAND (armor drift)

Mechanism (game.js tbDamage): worn armor absorbs FIRST, then the
parity-audit unbreakable brace reduces the remainder by 60%
(×0.4), once per fight after the ally is hurt. Both steps fire
and are narrated.

Measured in the test's own tactical setup (ally varmor 12):
`20 → gear absorbs 8 → 12 → brace ×0.4 → 5` (Math.round(12×0.4)).
The old band (6–19, comment "20 → ~8 expected") assumed an
unarmored ally. The armor arrived later: build-armor
(062e07a7a, 2026-10-29) seeds up to three starting villagers
wearing bark armor (protection 10; varmor 12 with the ally's other
piece), and the test's ally is one of them. The brace reduction
itself is exact: 12 → 5.

Fix: assert the exact derived value — parse the observed absorb
from the log, expect `round((20 − absorb) × 0.4)` (5). This is
STRICTER than the old range (a single value, not a band) and
tracks any future armor change; it fails if the brace ratio ever
moves. In STRIP mode the expectation is the armor-only value
(12), so the two unbreakable checks pass in strip by construction
(they verify the damage pipeline in both worlds; the brace's
presence signal in strip is the inverted brace-fires check, per
the file's pre-existing strip convention). The strip run as a
whole still fails 9 checks — the test is not vacuous.

## Leg 3 — Tactical haymaker 0 lines in 2 rounds: STALE SETUP (party + wounded-foe drift)

Mechanism (game.js villager strike path): a haymaker-ability ally
doubles every 3rd swing and announces HAYMAKER. Proven working:
in a partial-sequence probe the same ally produced
"Luz puts everything into the swing — HAYMAKER! (12)" on swing 3,
and the fieldFight HAYMAKER leg passes 64/120.

Why 0 lines in the full test (instrumented exact replication):
- startCombat joins up to 4 nearby villagers (nearest 4, no zerg).
  Since gap-phase2 W1 (9eb619326, 2026-10-24,
  ensureVillagerPositions), all same-node villagers join: this
  fight has 4 allies (Luz + 2 helpful + Ethan), dealing ~33/round.
- Since sim-w4tbkill-a phase B (fa3516cc1, 2026-10-28,
  tbWorldHpFor), the foe enters at its wounded world HP: here
  55/81, not a fresh 70–89 roll.
- 55 → 22 in round 1, → −2 (dead) in round 2. Luz swings twice;
  the 3rd swing never happens. The leg assumed a foe that
  survives 3 ally swings; the current setup cannot.

Fix (test setup only, assertion unchanged): restore the foe to
full HP (`foe.hp = foe.maxHp`) at the haymaker leg's start, with
a comment naming both changes. This restores the leg's original
assumption (a fresh foe; world-HP honoring has its own proof in
sim-w4tbkill-a and is not re-tested here). Result: 81 → ~48 →
~15 → 3rd swing HAYMAKERs in round 3 (1 line, 3 rounds).

## What was NOT done (scope discipline)

- No `src/` change, no game-behavior change, no gate or deed-bar
  retune, no default flip, no leg-village-link touch.
- Only `scripts/test-parity-abilities.js` changed (44 insertions,
  4 deletions, all comments + three leg fixes).
- check.js --quick was NOT run: sibling jest runs are active on
  this hot tree and the repo's own lessons warn that concurrent
  jest produces phantom failures; the change is confined to one
  test script, proven by that script's own full + STRIP runs
  (plain node, no jest) plus `node --check` syntax validation.

## Verification (this worktree, branch gapscomp-parity)

- Before fix: 12 PASS / 3 FAIL (reproduces the live-arms report
  exactly: Take Aim 6/120, landed=5, 0 haymakers in 2 rounds).
- After fix: `node scripts/test-parity-abilities.js` → ALL GREEN
  (15/15): Take Aim 6/120 (64 contact), unbreakable landed=5
  absorb=8 expected=5, haymaker 1 line in 3 rounds.
- Sensitivity: `STRIP=1 node scripts/test-parity-abilities.js` →
  9 FAILURES (all ability legs fail without abilities, including
  Take Aim 0/120) — the recalibrated test still detects the
  pre-fix world.

## Named next arm

None required for the parity-abilities item itself — it is
landed test-only on branch gapscomp-parity for coordinator merge
+ HEAD verification. If the coordinator wants the ORIGINAL >20%
Take Aim bar restored rather than recalibrated, that is a game
-design decision (initiative/speed rebalance), NOT a test fix,
and belongs to a future design arm — do not smuggle it into this
test change.
