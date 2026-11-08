# sim-combatdiv-b — prereg

**Arm:** sim-combatdiv-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0013Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 (this arm is the bisect's fix-shape sketch Q1 follow-up — the combat-divergence account) · **Branch:** sim-combatdiv-b, cut at master `ba9859e13` (read fresh in the main tree immediately before writing this prereg; branch tip == master at prereg time) · **Base for sweeps:** candidate checkouts C1 / P2 inside this worktree (detached for sweeps only); commits always made on the branch tip.

## The question

WHICH fight's outcome moved first when the gear-protection retune collapsed the frozen band — and is the divergence a damage-taken difference (combat math, `armorReduction`) or a pure RNG re-roll downstream of an earlier outcome change?

The frozen band 53001–53008 collapsed after xp-gear (`50881fbf2`): median 150d → 70.5d, sits 5/8 → 0/8 (bisect, `evidence/2026-11-07/sim-frozenband-bisect-b.md`). The bisect partitioned it: the gear retune alone (P2) carries most of the collapse (median 76d, sits 2/8); the XP half alone (P1) does not collapse the median. The loadout pathway is ruled out (`evidence/2026-11-07/sim-loadoutcensus-b.md`: 0/96 keep-5s changed C1→P2). The bisect's partial work is cited, not re-proved: the first 2–5 fights are identical on every seed, the streams split d6–d9 (53003 identical through d6, split d8; 53006 identical through d8, split d9; 53001 same fighter, same day d7, different monster spawned — sanjun vs belltoad), first living-count divergence d10–d23.

The retune feeds only three places, and the loadout census killed one: defensive math (`armorReduction`, deterministic — higher protection is better in a fight, which makes the collapse more puzzling, not less), loadout keep-scores (ruled out), equip preference (`equipScore`, later-game only — cannot explain a d6–d9 split). What remains is combat math itself, and the RNG re-rolls that follow an early combat outcome change. This arm names the first fight that moves, per seed, and classifies it.

## Candidates (exact construction)

- **C1 = `16369893c`** (journey-deepening r114, HEALTHY in the bisect: median 150d, sits 5/8). Checked out detached in the worktree for sweeps.
- **P2 = C1 + the gear retune only.** Constructed exactly as the bisect and loadoutcensus did: `git diff 16369893c 50881fbf2 -- src/data/items.json` applied onto a C1 checkout. Verified before this prereg was written: 20 hunks, every changed line a protection value or its `baseEffect` display restatement of the same number (e.g. `"Armor. Protection +5"` → `"+8"`); no code, no other stat. Patch kept at `/tmp/combatdiv-kit/retune-items.patch` during sweeps (working data, not committed). Applying it to the C1 blob yields hash `a56a60af5` = the `50881fbf2` blob — the same construction the loadoutcensus verified.
- The branch-tip code (post-collapse master) is NOT a candidate: the probe compares C1 vs P2 only.

## Combat-divergence instrument (new, committed before any judged sweep)

- Driver: `scripts/combatdiv-20261107.js` — the doorwalk baseline replay (policy `competent-doorwalk-b`, `TAKESEAT_B=1`, door drive off) with the sitstep instrument, plus combat-divergence wraps installed after `inst.install` (same chaining pattern as the doorwalk driver's door-verb wrap; pure reads + counting wraps only, zero game-state writes, zero RNG draws):
  - `fieldFight` wrap: per fight, in call order — day, fighter id + name, monster id + wave, fighter HP before/after (from `state.village.health`, default 100), worn armor protection at entry (`S.equipment.armorOf`, the same helper the engine reads), weapon bonus at entry, and the returned record's `outcome`, `rounds`, `vTaken`, `mDealt`, `vHpLeft`, `mHpLeft`, `allyDealt`, `allyVid`, `fleeHopeless`, `fleeHpFrac`, `minHpFrac`. The narrative `log` is dropped (numbers only) to keep corpora small.
  - `startCombat` / `tbEnd` wraps: per turn-based fight, in call order — day, monster id + wave, scholar + ally fighter HP fractions before/after (read off `Game.tbfight.fighters` at entry and at end), scholar worn protection at entry (`armorBonus()`), rounds, outcome, `scholarDiedInFight`. Chained on top of the stageally rows; matched to them by sequence order.
  - Daily HP snapshot: every villager's HP (`state.village.health`) on each daily row, so an HP divergence outside any fight is visible (raid / ambush / disease channel) instead of invisible.
  - Per-seed JSON to `evidence/2026-11-07/perseed-combatdiv-b-<c1|p2>/` (committed corpus): the fight streams (`fieldFights`, `tbFights`), daily HP snapshots, plus the sitstep instrument's daily rows / `fallen` / `deathSays` for the wall numbers and the village assessment.
- Analyzer: `scripts/analyze-combatdiv-20261107.js` — aligns the C1 and P2 fight streams per seed by sequence order, finds the first index where they differ, and classifies it (below); also reports the first daily-HP-divergence day per seed as an independent check, and the first outcome-differing fight vs the first damage-differing fight.
- Proof: `scripts/test-combatdiv-20261107.js` — analyzer classification legs on fixture streams (damage-taken case, pure-RNG case, downstream case, unclassified case), determinism leg (same-seed re-run identical fight stream), and a live A/A leg (C1-vs-C1 stream diff is empty on 1 smoke seed). Per the proof-of-effect rule, the proof artifact IS the divergence table: the named first-diverging fights go in the evidence file, not assertions alone.

## Reproduction gate (runs FIRST, before any judged divergence read)

The judged sweeps ARE the 150d doorwalk-baseline sweeps at C1 and P2, so the reproduction gate is read off the same corpora (one sweep serves both; no separate gate run):

- **C1 must reproduce the bisect's C1:** median 150d, sits 5/8.
- **P2 must reproduce the bisect's P2 shape:** median 76d ±15d, sits 2/8 ±1.
- A failed reproduction is an instrument/base problem, NOT a verdict, and stops the arm before the divergence table is read.

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — the bisect's diagnostic band. NO new seeds. The frozen band is a diagnostic instrument here, not a tuning target.
- **Horizon:** 150d, death-aware (`runDays` stops on village death / win, +10d tail max). Justification: the split is d6–d9, but the question needs the full first month (first living-count divergence runs to d23, first deaths to d25) plus the reproduction gate's median/sits bars, which only a 150d horizon supplies. A 30d horizon would clip the downstream confirmation and could not serve as the gate. The first-divergence analysis itself uses only the fights up to the first difference (days ≤ ~30); the rest of the horizon supplies wall numbers.
- **Policy:** doorwalk baseline leg (takeseat substrate + sit drive, door drive off), as the bisect and loadoutcensus did.

## Classification (binding definitions)

Per seed, align the C1 and P2 fight streams (field + TB in one call-order sequence) and take the FIRST index where any recorded field differs. Also take the first daily-HP-divergence day as an independent check. Classes:

- **D — damage-taken (combat math):** the first differing fight has the same day, fighter, and monster at C1 and P2, but `vTaken` / `vHpLeft` (field) or scholar/ally HP fractions / rounds (TB) differs; OR the first outcome-differing fight's fighter entered with HP already lowered by an earlier same-fight damage delta (the chain is named: damage fight → HP-before delta → outcome fight). Root cause: `armorReduction` on retuned protection.
- **R — pure RNG re-roll:** the first differing fight differs in monster identity, day, or fighter, or is present in one stream and absent in the other, while every prior fight is identical in day / fighter / monster / outcome / `vTaken` / `vHpLeft` AND every villager's HP at the last daily snapshot before it is identical. Root cause: the RNG stream re-rolled with no combat-math cause — a result that would demand a further probe (a protection-reading channel that consumes draws).
- **U — unclassified:** the first difference fits neither — e.g. HP diverges on a daily snapshot with no preceding fight difference (non-fight damage channel) or the streams diverge in a way the instrument cannot attribute. Reported as U with the evidence; the next arm probes it.

## GO bars (binding, §14)

- **Primary metric:** per-seed first-divergence day + classification, on all 8 seeds.
- **DIAG-GO (combat-divergence account settled):** all 8 seeds classify D or R, with the named first-diverging fight (day, fighter, monster, what moved) in the evidence file; the reproduction gate passed; the proof is green. A seed classifying R is a settled answer, not a failure — it names the mechanism (downstream re-roll) — but the evidence file must then say what the next probe is (which protection-reading channel could consume draws).
- **DIAG-NO-GO:** any seed classifies U, or the instrument cannot pin a first divergence on any seed (streams never diverge in the logged window, or the first difference is unclassifiable), or the reproduction gate fails. The per-seed table is still delivered, with the U evidence, for the next arm. A NO-GO does NOT re-score against a friendlier metric.
- **Proof bars:** `scripts/test-combatdiv-20261107.js` green (classification fixtures + determinism + live A/A smoke); reproduction gate passed (above); divergence table attached to the evidence file as the per-seed first-divergence table.
- **Sense-test:** the first-diverging fight read in plain words for 2–3 seeds (who fought what, what changed, what it meant for the village) — do the fights read like people fighting monsters, or like a numbers artifact? Plus the village assessment (what the village looked like, who thrived/died and why, what knowledge/capabilities were missing).

## Scale-wall numbers (reported for the C1 and P2 corpora)

National / table / wins, wave 4–5 unlocks, median survival — for C1 and P2 sweeps.

## Non-goals

- DIAG only: zero src/js changes, zero src/data changes on the branch. Do NOT build the bisect's fix-shape Q2 (freeze keep/equip scores) — the loadoutcensus verdict killed it for lack of mechanism.
- No balanced-panel compare (§15): the question is a stream diff between two frozen checkouts, judged by the pre-registered bars above; the reproduction sweeps are the validity check.
- No fresh band, no confirm sweep, no landing, no merge — report ready-to-merge; the coordinator lands it.

## Metric review (pre-registered note)

- The primary metric (first-divergence day + classification on all 8 seeds) is the bisect sketch's own Q1 follow-up, tightened here into per-seed named fights plus the D/R/U classes. No friendlier re-scoring is available — the bars above are the judge. If the reproduction gate fails, the metric is not wrong, the instrument/base is — that is a NO-GO with cause, recorded in the evidence file.
- One known limit, stated before the read: the analyzer aligns streams by sequence order, so after the first divergence the two streams desynchronize (extra/missing fights, shifted days). Only the FIRST divergence per seed is judged; everything after it is supporting color, not classification evidence. A seed whose streams never diverge in 150d would classify as "no divergence" — recorded as U (the instrument's window, not a verdict).
- The field-fight record's `vTaken` is the fighter's own damage taken; ally damage is recorded separately (`allyDealt`). A divergence carried by the ALLY's HP (not the lead fighter's) still classifies D if the same-fight ally numbers differ — the analyzer compares both.
