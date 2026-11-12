# PREREG — sim-medname-b (finding #2274, crisis-r181 medicine narration)

Run: fleshout-loop-b-20261111T2330Z · worker sim-medname-b · 2026-11-11
Finding: sim-findings.md #2274 (2026-11-11, crisis-r181 medicine narration).
Canon: docs/CANON.md + docs/DISEASES.md (read first). DISEASES.md:89-93
names the four regional ruin medicines: antimalarial cures Fever, kakkonto
(cold remedy) eases Fever, bandages ease Wound Fever, ORS eases Gut Rot and
Fever. No canon doc needed inventing — the names come from the canon doc and
from the item data (regions.json: "Antimalarials (artemether)",
"Cold medicine (kakkonto)", "Bandages (roll)", "ORS packets").

## Defect (verified in code before any edit)
`useMedicine(kind)` (src/js/game.js:14160) maps kinds to cure classes
correctly (KIND_CLASS: antibiotics bacterial, antiparasitic parasitic,
antimalarial fever, cold_remedy fever, bandage bacterial, ors parasitic)
and the cure tables in src/data/statusEffects.json give each regional kind
its labeled effect — cure behavior is correct and unit-proven by
scripts/test-journey-crisis-r181-regional-meds.js (0)-(5). But line 14174:
`const kindName = kind === 'antibiotics' ? 'antibiotics' : 'antiparasitic';`
so using an antimalarial, cold remedy, bandage, or ORS narrates as taking
"antiparasitic" in every say line (dry-swallow, cure, ease). `kindName` is
also passed as the `source` to `cureStatus`, so the cure-text "(source)"
suffix is wrong the same way.

Kind strings verified in code first (task requirement): 'antibiotics',
'antiparasitic', 'antimalarial', 'cold_remedy', 'bandage', 'ors'
(KIND_CLASS map, game.js:14172; regions.json medType fields; cure tables).

## Fix (planned, minimal)
Replace the ternary with a per-kind map:
- antibiotics → 'antibiotics', antiparasitic → 'antiparasitic',
  antimalarial → 'antimalarial', cold_remedy → 'cold remedy',
  bandage → 'bandage', ors → 'ORS'.
Consequence the map forces: the cure/ease templates use plural verbs
("do", "work", "take"), which are wrong for the singular new names
("The bandage do…"). So the same edit adds verb agreement (plural only
for antibiotics / antiparasitic / ORS) — the antibiotics/antiparasitic
lines stay byte-identical, the new kinds read grammatically. No other
wording changes; no cure behavior touched.

## Primary metric
Extended scripts/test-journey-crisis-r181-regional-meds.js section (6)
"NAMES": for each regional kind, the say lines useMedicine emits name
that kind and never 'antiparasitic'.

## GO threshold
- Section (6) green: every regional kind named correctly in every say
  path it can reach — dry-swallow for all four (undiagnosed use); cure
  for antimalarial (diagnosed + undiagnosed variants); ease for
  cold_remedy, bandage, ors (their labeled targets). Reachability note:
  per the cure tables, antimalarial never eases (it cures) and
  cold_remedy / bandage / ors never cure, so a per-kind × per-path
  full matrix is unreachable by design — the threshold is "every say
  line the kind can emit names it correctly", plus controls
  (antibiotics/antiparasitic cure lines unchanged).
- No 'antiparasitic' leakage in any regional-kind say line.
- Sections (0)-(5) of the existing suite still green (no regression).
- No other test failures attributable to this change
  (`node scripts/check.js --quick` green, or any failure shown
  pre-existing by a pre-fix baseline).

## Horizon / seeds / policies
Unit + transcript check only — no long sim band needed (narration-only
fix; cure behavior already unit-proven and untouched). No sim seeds,
no policies, no seed-band freshness check required. Scale-wall numbers:
N/A — no sim run in this arm (reason: narration-only change, no
behavioral lever).

## Metric review
(To be filled at verdict. A miss is NO-GO, never re-scored mid-run.)
