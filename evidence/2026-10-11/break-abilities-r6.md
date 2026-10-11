# Break-it: abilities & godhood, round 6 (2026-10-11)

Target: abilities & godhood (index 12), round 6 — going deeper than r1–r5
(evidence/2026-10-11/break-abilities-r4.md, break-abilities-r5.md;
evidence/2026-10-10/break-abilities*.md). Hostile-player attacks against the
ability/synergy/slot/revive engine.

Canon read first: docs/CANON.md, docs/SYSTEMS.md, docs/ENDGAME-BUILDS.md,
docs/PROGRESSION.md, docs/DISEASES.md. No abilities-specific canon doc exists
beyond these — noted, nothing invented.

## Verdict: BROKE + FIXED (3 catches + 1 sibling sweep), rest held

Files: src/js/ledger.js, src/js/villager-agency.js, src/data/characterGen.json,
scripts/test-abilities-breakit-r4-20261011.js (tripwire update),
new proof test scripts/test-abilities-breakit-r6-20261011.js.
Proof: 17/17 × 4 seeds (20261011, 7, 99, 42); FIX=0 replays the old behavior
and goes red on the tripwire (purify back in the dead set) while the C1/C2/C3
[old] demonstrations show the bugs. Ontology gate green (63/63). Adjacent
suites: r5 proof 23/23, r4 proof 38/38 (after tripwire update), brawler
rage-fix 5/5.

## CATCHES (all fixed, proven)

### 1. Successors got ZERO background abilities — double wrong-path bug (ledger.js)
`playerDeath`'s mantle transfer read `this.data.occupations` (the key is
`characterGen.occupations` — the stale path made `occ` {} forever) AND
`newChar.occupation` (runtime villagers carry `occupationId`). Every successor
since the bug was born stepped up with an empty background kit while the
comment said "background abilities are THEIRS — their past, their hands."
Fix: `((this.data.characterGen || {}).occupations).find(o => o.id ===
newChar.occupationId)`. Proven: post-succession `backgroundAbilities` deep-equals
the new bearer's occupation grants (previously always []).

### 2. Succession never recomputed activeSynergies (ledger.js)
Every grant/XP/load path recomputes — succession didn't. The new body inherited
the OLD body's active synergies: modifiers firing for legs never held (e.g.
apex_sense staying live on a body without tracker+echo_location), and newly-
completed legs staying dark. Fix: `recomputeActiveSynergies()` after the new
body's background abilities land. Proven via the active-legs invariant
(every active synergy's legs currently held): violated pre-fix, holds post-fix.

### 3. purify — the ONLY poison cure — was unacquirable (characterGen.json)
Poison ticks -3 HP/dayPart × 6 dayParts, stacks to 3 (belltoad throat sac,
50%). The sole cure is the purify ability, which had unlock type 'granted'
with NO occupation listing it — the only one of 13 'granted' abilities without
a home. A poisoned player had zero counterplay except waiting it out. Fix:
the pharmacist (antidote knowledge, teaches 'medicinal', already grants
herbal_remedy) now grants purify. The button/activation path already worked;
only the grant was missing. Proven: data-level grant + functional
apply-poison → purify → cured. Design call (Steve can overrule): pharmacist
over system_offer — purify is earthly survival knowledge ("charcoal and clean
water"), not alien tech.

### Sibling sweep: same stale-path class in villager-agency.js
`npcRangingApt` read the same dead `this.data.occupations` path, so no
occupation ever scored its +2 teachTags ranging bonus (track/forage/survive/
hunt tags). Fixed to `characterGen.occupations`. (Occupations DO carry
teachTags — the lookup wasn't dead data, just a dead path.)

## VERIFIED HELD (attacked, resisted)

- **Dodge stacking ceiling**: max acquirable = footwork T3 0.15 + agi 10 0.1
  + cornered_rat 0.5 (surrounded) = 0.75 — under 1.0. The only other dodge
  source, adrenaline_surge (+0.15/lvl), is dead-17, so the >1.0 ceiling is
  unreachable. Conditional, honest per-card, sub-immunity.
- **Strike-condition honesty**: rage ×2 lives ONLY in the unleash_rage action
  flag path (4b68d614's possession-passive removal holds — no `hasAbility('rage')`
  damage block in tbPlayerStrike); cornered_rat ×2 gated on tbSurroundedBy(3).
  Brawler proof test 5/5 confirms behaviorally.
- **Godhood near-immunity**: armor curve guarantees ≥1 lands + wave-3+ pierce;
  damage_taken has exactly one source (unstoppable ×0.7); death cheats are
  canon ("unkillable means unkillable"). No passive literal immunity.
- **Death-gate audit**: every playerDeath site is cheat-gated except the
  documented debug-scenario tool and the phoenix link's own terminal
  resolutions (clause spent by design — victim burned, protester broke free,
  or bearer gave themselves). No drowning death path exists; corruption has
  no playerDeath; no moot-execution path; disease deaths pass 'disease' cause
  (no spite-ration); uprising resolves through combat.
- **useAbility on unheld ability**: honest refusal ("You don't have that
  ability"), nothing spent — prechecks/wiring-check/cost order holds.
- **Tripwires**: dead set now 16 (purify fixed — r4 tripwire updated to match);
  undiscoverable synergies exactly 20 (fixpoint-verified, unchanged);
  blood_tracker still discoverable but mechanically void (Steve's call).
  All ability modules still loaded in index.html.

## Design calls made (Steve: figure it out yourself; overrule welcome)
- Pharmacist (not the System) teaches purify — earthly knowledge, earthly teacher.
- Succession recompute: the office's discoveries pass, the body's resonance
  recomputes — same rule as every other grant path.
- The remaining 16 dead abilities and 20 undiscoverable synergies stay
  untouched (r3's options (a)/(b)/(c) still await Steve's pick); only the
  live gameplay hole (incurable poison) was fixed.

## No [needs-eyes]
No feel/combat/UI changes — engine honesty, data grant, and state hygiene.
The successor now plays with their own background kit (visible in the
abilities panel, but not a feel change).

## Proof test
scripts/test-abilities-breakit-r6-20261011.js — 17/17 × 4 seeds, FIX=0 red on
exactly the tripwire (purify back in the dead-17) with C1[old]/C2[old]/C3[old]
demonstrating each bug on the same data.
