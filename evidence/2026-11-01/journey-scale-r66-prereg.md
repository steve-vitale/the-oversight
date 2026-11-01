# journey-scale r66 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** oversight-playtest-loop-20261101T0445Z (scheduled 04:45 CST 2026-11-01).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a failed run does not advance the rotation). This run's 3 follows the
deepening leg's 2→3 write (master HEAD is the deepening r79 commit), so
it is queue-correct, not the r61–r64 "still reads 3" anomaly.
**Base:** master@7c8745741 at branch creation.
**No src/js change planned at pre-register time, and no src/js landing
is planned:** Q1 is a read-only diagnostic, Q2 reads transcripts, Q3
counts lines. Any fix arising from Q1 is a next-run item with its own
proof test.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** no list-fed decision work in this run;
the instrument records each villager's OWN gear/knowledge/materials
plus the camp pile they stand at, exactly as the duty itself reads
them. The analyzer aggregates counts only; nothing feeds a decision.

## Range since r65 (why this run is not a parity re-run)
`git diff b47d2dc4c..HEAD -- src/js src/data` is EMPTY: zero game
code or data changed since r65's final landing. A straight quad-parity
re-run would be trivially identical, so per the staged methodology
(pilot first; do not burn a full run on a question showing nothing
interesting) this run does NOT re-score parity as its question.
Instead, parity is checked cheaply as the PURITY GATE below (r66
captures vs r65's committed captures), and the run's question is the
diagnostic r65 explicitly queued.

## Standing context (read before scoring)
- r65 (final base b47d2dc4c): quad parity PASSED vs r64 on all four
  seeds. Quad: 85001 SCATTERED d28, 85002 ALIVE d181, 85003 DEAD d154
  lesser arc4 waiting+announced, 85004 DEAD d169 lesser arc4
  waiting+announced. Lesser seat 2/4, full seat 0/4, wave 5 reached 0/4.
  Weapon-craft lines 0/4 seeds, deadfall-duty lines 0/4 seeds (fifth
  consecutive 0/4 for both, r61–r65).
- r65 Q2 classified: deadfall = POLICY (never staffed on the
  scalecourt-nogate path); weapon-craft = PRECONDITION (duty runs
  daily, knowledge is not the blocker — 6 knowers per seed — but
  weaponCraftCd is EMPTY on every row: zero attempts ever, not zero
  successes). r65's queued next instrument: a daily weaponless-knower
  count to split the armed-knower hypothesis from the materials
  hypothesis. That instrument is this run's Q1.
- r65 people check: 5 of 6 transcripts fully real; 1 partial blemish
  (85003 d90 Olivia betrayal accept → post-accept aphorism loop).
  Adjudication of that blemish is this run's Q2, not a presumed fix.
- Code facts established by reading (not by the instrument):
  weaponCraftDay's armed check counts ANY weapon-def item in the pack
  (def.weapon), and sharpened_stick IS a weapon def — so a villager
  who ever whittled a stick on departure counts as armed for this
  duty until the stick leaves their pack. villagerGearDay runs in the
  same endDay tick BEFORE weaponCraftDay and can arm a villager that
  tick. Both are confounders the Q1 analysis must handle, not
  assumptions it may bake in.

## Leg questions (binding)
1. **WEAPONLESS-SPLIT (why weapon-craft never attempts):** diagnostic,
   measurement only. Instrument: a COPY of the r65-duty driver plus
   ONE read-only daily instrument (wsplitWatch): per home-roster
   villager, equipped itemIds, pack itemIds, stashed itemIds, the
   weaponCraft record, the weaponCraftCd value, away/dead flags; plus
   the camp-pile materials snapshot. No engine input is touched.
   The r65 wart is fixed in this driver: dutyWatch AND wsplitWatch
   are reset per seed in playSeed (r65's duty files were cumulative).
   Analyzer definitions, decided BEFORE reading results:
   - effective-knower: recorded level >= 1 for a ladder rung, OR the
     villager's own gear (equipped/carried/stashed) contains that
     rung's finished weapon (the engine's own seeding rule, applied
     read-only to the snapshot).
   - armed (engine definition): any equipped or pack item whose
     items.json def has weapon set — sharpened_stick counts.
     Breakdown: stick-only, real-weapon, both.
   - matsOK: for the FIRST known ladder rung (hunting_spear, then
     fire_hardened_spear, bow, crude_bow), own pack materials + pile
     materials cover the recipe (pack mats: string entries equal to
     the key, plus object entries with material == key; stated as
     the analyzer's approximation of craft()'s matching rule).
   - cooldown-clear: Cd is null or <= day - 3.
   - eligible: home, not dead, effective-knower, NOT armed, matsOK,
     cooldown-clear — an UPPER bound on true eligibility, because
     villagerGearDay runs after the snapshot and can arm a villager
     in the same tick.
   - TRANSITION RULE (the rigor for that confounder): an eligible
     day D whose D+1 row for the same villager is still
     weaponless + knower + matsOK with Cd still unset is an
     UNEXPLAINED NON-ATTEMPT (gearDay did not arm them, materials
     did not vanish, cooldown did not bite — yet no attempt). Any
     such day is a bug signal, reported as such.
   - STICK-QUANTIFICATION: stick-only-armed knower-days that are
     otherwise matsOK + cooldown-clear = days the whittled stick
     alone blocks (counterfactual count, not a claim the stick
     should not count).
   Verdict rule, decided BEFORE reading results: report per seed
   (villager-days, knower-days, armed breakdown, weaponless-knower
   days, matsOK/cooldown splits, eligible-days, attempts via Cd
   advances and weapon_craft lines). If eligible-days == 0, the
   dominant blocking gate (armed vs materials vs cooldown, by share
   of knower-days) is the classification. If eligible-days > 0 with
   zero attempts and zero unexplained non-attempts, gearDay arming
   is the residual explanation and is reported as inference, not
   proof. If any unexplained non-attempt exists, that is the
   finding and no fix lands this run (next-run item with proof).
   PILOT GATE: seed 85002 runs first; if it crashes or its capture
   is empty, STOP. Then the full quad.
   PURITY GATE (same-base, as r65 Q2): r66 capture vs r65's committed
   capture per seed must give 0-line diffs and identical census
   scalars. ANY diff → STOP, do not score wsplit, report instrument
   impurity as the finding.
2. **PEOPLE CHECK (sense law) + OLIVIA ADJUDICATION:** read the Q1
   quad transcripts in full (driver's d90/d120 talks). Judge meaning,
   coherence, relevance, consequences — never just exchange counts.
   Known blemish classes to check for recurrence (not re-scored as
   new): Irving one-sitting displacement, Thabo withdrawal-only
   talk, Meera gossip tail, Boris nod-loop (untested since r58),
   Dale gossip tail, Olivia post-accept aphorism loop (r64/r65).
   Adjudication rule, decided BEFORE reading results: the Olivia
   blemish is a FIX only on a true defect (verbatim repeated line,
   contradiction, or a want left in an impossible state). If the
   accept line shows a resolved outing outcome (small/reward/danger
   line) and the follow-up lines are distinct temperament-grounded
   personal lines, the classification is THIN-BUT-WORKING generic
   talk after a resolved invitation — documented, not fixed. The
   driver's accept record (betray file) plus the capture's accept
   line are the evidence either way.
3. **DUTY REACHABILITY (counts, report-only):** per Q1 seed, count
   weapon-craft lines (capture lines matching /spent the afternoon
   at the workbench and made/) and deadfall-duty lines (/deadfall/i
   with the duty line "gathers deadfall —" split out). r61–r65 all
   0/4; a nonzero count here is a finding, a sixth 0/4 is continuity.

## Census scalars (unchanged from r51)
day, over, popAlive/popTotal, pantryKcal, scaleRank, nationalDay,
globalDay, firstCourtDay, tableSeat, arcNow, deaths, covenant trusts,
maxWave, pilgrimages, fusionInstalled, abilitiesHeld — plus the
r61 end-state class (ALIVE / SCATTERED / DEAD), the weapon-craft-line
count, and the deadfall-duty line count.

## Telemetry
After writing evidence, run telemetry-check against
hidden_files/telemetry-baselines/scale-census.json with the r66
current-quad trust JSONs. Baseline NOT rolled on this run's numbers
(prereg decision; r59 seeded it and no run since has rolled it).
Any LOUD line is a same-run investigation item before closeout.
