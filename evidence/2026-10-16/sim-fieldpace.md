# sim-fieldpace: wave-4/5 field-fight pacing + death-attribution diagnostic (2026-10-16)

**Arm:** flesh-out loop run fleshout-20261016T1715Z, sim-fieldpace. Diagnostic
instrument (no game-code change): wraps `Game.fieldFight`, attributes villager
deaths to fights via `linkDeath` (canonical m.id, never prose), measures pacing.

**Pre-registered PRIMARY (binding):** ≥95% of wave-4/5 field-fight villager deaths
attributed. **Result: MISS — 48/55 = 87.3%.** Per §14 this is not a GO; it is
reported as a miss, not re-scored.

**Residue 100% diagnosed:**
- One class: 'fled-then-died' — villager flees (vFlee) then dies the same day.
  Almost certainly fight-caused (wounds/pursuit), currently unattributed because
  `linkDeath` rejects non-vDie outcomes.
- 3 cases: no-context null monsters (fight record lacks mdef).

**Named fix (NOT implemented — recommended next step):** accept vFlee in
`linkDeath` (scripts/fieldpace-20261016.js:101). One-line instrument change;
requires updating test-fieldpace-20261016.js fixtures that assert vFlee → null.
Expected effect: attribution → ~95%+ on the same data. A future arm should
apply it and re-run the sweep.

**Pacing measured (the diagnostic's primary value):**
- Wave-4 one-round-kill rate: 66.7%; wave-5: 58.3%.
- Median fight length: 1–2 rounds. Zero wave-4/5 field deaths past round 2.
- Implication: wave-4/5 field fights are decided almost immediately — consistent
  with the fightopen finding that tricks need round-1 forms, not longer fights.

**Artifacts:** scripts/fieldpace-20261016.js (instrument), scripts/test-fieldpace-20261016.js
(proof), scripts/analyze-fieldpace-20261016.js, evidence/2026-10-16/perseed-fieldpace/
(per-seed JSONs), evidence/2026-10-16/fieldpace-sweep.log.

**Convergence:** scale-onramp converging (diagnostic). No game-code change;
nothing for Steve's eyes.
