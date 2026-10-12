# Longsim: DISEASE PRESSURE lever r2 (2026-10-11) — closing the diagnosis→cure gap

Lever 7 (disease pressure). Round 1 (evidence/2026-10-11/sim-disease.md)
landed the lockjaw-certainty lever and left two documented gaps: (a) the
"You" capitalisation nit in the generic tickText path, (b) the
diagnosis→cure path was discoverable but never COMPLETED in 12 sim runs —
partly a policy gap (policies never seek treatment), partly findability
(antibiotics 8%/ruin-tile, never looted in 12 runs).

Canon read first: docs/CANON.md, docs/DISEASES.md. No canon invented:
ruin medicine (antibiotics/antiparasitic) is canon from the 2026-10-09
disease rework — the nudge only names where to look.

## Lever played: DIAGNOSIS→CURE REACHABILITY [needs-eyes]

Two halves, one lever:

**A. Treatment-seeking sim policy** (scripts/policies/treatment-seeking.js,
new). Wraps competent; in upkeep, when sick:
1. NAME IT — self-examine (examineSick) when nothing is diagnosed yet;
2. TREAT — matching pills for a diagnosed bacterial/parasitic class
   (useMedicine), then medical training (triage → field_medicine →
   herbal_remedy via treatDisease, once/day gate respected);
3. QUEST — diagnosed with a pill-needing class but holding no pills: travel
   to the nearest ruin with loot remaining, search it (up to 4 forages),
   up to 2 ruins, then return home. Travel + search costs are real
   (64 ticks + 100 kcal/search). Honesty note: the policy scans tile.loot
   from afar when choosing a ruin; a real player sees the map epithet
   ("there might be cans left" / "picked clean") — same information, coarser.

**B. Findability nudge** (src/js/statusEffects.js — the game-side half, small):
- `diagnoseDisease` narration now names a CONCRETE ruin direction for
  bacterial/parasitic classes: "The ruins to the east sometimes still hold
  medicine cabinets — worth searching." via new `ruinDirection()` (nearest
  ruin tile, line-19311 compass convention). No rate changes, no new
  medicine — it turns rumor into a quest. Fever/viral classes get no hint
  (no pill cure); villager targets get none (they don't quest).
- **"You" nit fixed** in `seFill`: mid-sentence {name} for the player now
  renders lowercase "you" ("Spasms run through you like a struck wire");
  template-initial keeps "You"; possessives stay "your" (r14 fix intact).
  Verbs stay You-form ("you are"). Verified 39/39 in the proof test and in
  transcript (S1).

## Before/after on identical seeds (6 seeds × policies, 200-day horizon)

| condition | median surv | cases | cures | player disease deaths |
|-----------|-------------|-------|-------|----------------------|
| competent (master) | 61d (max 69) | 18 (14 mundane, 4 alien) | 0 | 0 |
| careless (master) | 40d (max 44) | 7 (6 mundane, 1 alien) | 0 | 1 |
| treatment_seeking, game unchanged (policy-only) | 60d (max 71) | 17 | **7** (6 wound_fever, 1 lockjaw) | 0 |
| treatment_seeking + nudge (game change) | 60d (max 71) | 17 | 7 (identical) | 0 |

- The policy alone closes the gap: 7 cures where 12 runs had 0 — including
  a **lockjaw cure** (seed 7: diagnosed → antibiotics → cured before the
  4-day certainty clock). The cure path was always completable; the sims
  just never tried. A real player now gets the same direction the policy
  acts on, in words.
- The nudge is narration-only by design: after-sweep is byte-identical to
  before (same seeds, same policies) — no mechanical side effects. The
  proof test (scripts/test-disease-curepath-20261011.js, 39/39) verifies the
  hint text is live and names the true nearest ruin direction (seed 7:
  east, seed 42: west, seed 99: east).
- Curing doesn't buy survival here: median 60–61d across all three
  conditions — combat + starvation dominate (see village assessment).

## Baseline check (r1 baseline still holds, with one canon-intended shift)

Re-ran scripts/sweep-disease-lever.js on current master (12 runs, same
seeds): 0 cures (competent + careless) — the gap was real. wound_fever
remains the taxing vector (10/18 competent cases). Shift vs r1: r1's "0
disease deaths" is gone — the lockjaw-certainty lever (landed r1) now
kills: 1 player disease death + 6 villager disease deaths (careless runs),
all unattributed by id ('?' — see measurement note). This is canon
working (DISEASES.md: lockjaw "lethal untreated"), not a regression.

## Reachability verdicts

- **Cure path: now REACHED.** 7/17 treatment-seeking cases cured end to
  end (diagnosis → pills/training → cure). Before: 0/25.
- **Giants (wave-2): reachable, barely.** 3 giant_mosquito fights in 18
  runs, all lost (0/3); alien cases: east_nile 2, eurika 1, howlbelly 3.
  Lemons: 0 fights, 0 cases — the rarest content in the pool (unchanged).
- **Trembles: still decoration.** 0 cases in 18 runs — nobody eats human
  meat. Documented, not chased (corruption lever's territory).
- **Meat-quirks: reachable in principle** — 3 howlbelly cases (players ate
  hushwolf meat; the policy cooks meat but quirks come from the meat
  table, not cooking). Villager-side howlbeat verified r1.
- **Pool separation: holds.** Proof test: contractDisease refuses eurika,
  diagnoseDisease refuses eurika + never marks diagnosed. examine refuses
  alien diagnosis (code path unchanged). r14 suite 66/66 ×3 seeds;
  ontology 73/73.

## Sense findings (SENSE-TESTING LAW — transcripts read)

S1 (full cure arc, scripts/sense-disease-curepath-r2.js):
"your jaw aches — a rusty nail on a ruin beam. Smiling hurts." →
"Spasms run through you like a struck wire." → "You have Lockjaw. …
(Antibiotics would end it.) The ruins to the east sometimes still hold
medicine cabinets — worth searching." → "The antibiotics do exactly what
they're for. The lockjaw breaks within the day." A coherent human story:
symptom, escalation, NAMED diagnosis with a quest direction, treatment,
recovery.

S2 (villager-tending): "Pedro has been watching you. 'Feverish, huh.' A
cup of something bitter is pressed into your hands. 'Drink. Sleep.
Doctor's orders.'" — named person, unasked care, symptom-label honest
(undiagnosed shows "Feverish", never the true name).

S3 (outbreak): tending lines with named sitters, the relief-proposal beat
still names a person ("the person in their 40s, with a crooked nose" —
r1's fix holding), tick-removal taught in quoted dialogue ("tweezers at
the head, steady pull, don't twist"), self-organizing village ("Tanya is
already boiling water. It's handled."), recoveries. Reads like people.

Nit (documented): post-period {name} now renders lowercase — "The tremor
deepens. you are dropping things." Grammatically imperfect, but reads
better than capital "You" mid-flow. Kept deliberately; Steve can overrule.

## Village assessment (plain words)

Treatment-seeking villages look like competent villages — people live
~2 months and die of violence and hunger, not sickness (combat 24–25,
starvation 9–13 player deaths per 6 runs; villager deaths combat 19–20,
starvation 1, thirst 0–6). The cure path is now something villagers do:
the wounded who get diagnosed quest to ruins, take their pills, and live
— seed 7's lockjaw carrier survived what killed its competent twin's
counterpart. Who gets sick: fighters (wound vector at hp<40 — 10
wound_fever in competent runs). Who cures: anyone diagnosed with a
pill-class who can reach a ruin, or anyone with medical training. Who
dies of disease: the careless and the undiagnosed — lockjaw certainty now
takes villagers too (6 in careless runs), which is the engine telling the
truth about canon.

Knowledge missing: nothing new — the map was always there; only the
words naming the direction were missing. That's the blank this run
filled, plus the "You" capitalisation.

What I filled: (1) treatment-seeking policy proves diagnosis→cure
completes (7 cures, incl. lockjaw); (2) diagnosis names a concrete ruin
direction for pill classes; (3) seFill sentence-case. What I documented:
trembles unreached; lemons 0 fights; the '?' diseaseDeaths attribution
gap (sweep can't name the disease id from villager death cause strings —
villager lockjaw deaths land as '?'; measurement-only, not engine); the
post-period lowercase-you style tradeoff.

## Run-wide measures

- Win rate: 0/18. Arc reach: competent/treatment_seeking Arc II+III 6/6,
  Arc IV 0/18; careless Arc IV 0/6.
- Wave reach: competent wave2 5/6, wave3 2/6; treatment_seeking wave2 5/6,
  wave3 2/6; wave4/5 0/18.
- Four-realm formation: 0/18 (no national reach).
- Median/max survival: 60–61/69–71d (competent family); careless 40/44d.
- Giant fights: 3/18 (all giant_mosquito, all lost). Alien cases: 6/18
  runs. Trap/counter/young-link/tier-2: not this sweep's focus.

## Tooling

- scripts/policies/treatment-seeking.js (new) — competent + seekTreatment
  (examine → pills/training → ruin quest).
- scripts/test-disease-curepath-20261011.js (new) — 39/39 proof: seFill
  sentence-case, ruin hint names true direction, full antibiotics cure
  arc, pool separation.
- scripts/sense-disease-curepath-r2.js (new) — S1 cure arc, S2 tending
  beat, S3 outbreak beat.
- scripts/sweep-disease-lever.js — registered treatment_seeking in
  POLICIES (r1's script, 2-line change).

## Regressions

- scripts/test-disease-break-r14-20261011.js: 66/66 × 3 seeds (7, 999, 4242).
- scripts/validate-ontology.js: 73/73, release permitted.
- scripts/test-lockjaw-lever-20261011.js: not re-run (engine rule
  untouched; r14 S2 covers the certainty path, and the r2 baseline sweep
  shows it killing).

---
Committed in worktree sim-disease-r2 (pending coordinator merge).
