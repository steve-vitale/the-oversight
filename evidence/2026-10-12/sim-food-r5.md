# Long-run sim — food economy ROUND 5: the trapline, end to end (2026-10-12)

Lever 0: **food economy** — round 5. Territory: TRAP ACQUISITION BY SOURCE.
Follows sim-food-r4.md (r4 opened the fire-network aid pipes; its five open
questions all measured coherent or combat-driven, NOT food blanks).
This run does not re-litigate r4.

## Baseline (current master, 12 seeds × sweep-completion × 200d, competent)

- Median survival **106.5d**, max 200d (one run survived the full horizon).
  11/12 village-lost.
- maxWave: 10/12 reached wave 3, 2/12 wave 2 — **no wave 4/5**. Arc 3 on 12/12,
  **no Arc 4**. Ranks/wins/table: 0 national, 0 table, 0 wins.
- Death causes (12 seeds): combat 70, villager combat 37, monster 23,
  starvation 6, wounds 5, contests 3, lockjaw 2, ambush 1.
- Income by source (12 seeds, kcal): Garden 2.13M, Fish 1.48M,
  Foraged 0.50M, Expedition 0.09M, Snared meat (villager trappers) 7.1k.
- Spoilage **~3,700–4,900 kcal/run-day**, 89–96% of it FRESH rot (the racksFull
  "preserved rot" story from the code comment is 4–11% of waste — the bind is
  the glut rotting fresh, not the racks).

## The blank: the player's trapline was 0/0 (policy bug)

`workTrapline` (competent policy, combat r2) crafted snares at day-end — when
the player is back at **haven** — and tried to set them there. `setTrap`
refuses haven tiles. Result across 24 seeds × 200d: **2 crafts, 0 sets,
0 catches**. The whole craft→set→dawn-check chain (ecology, shyness, uses,
rot, carcasses) never ran for the player. A real player sets the trap while
OUT on the wild tile — the dawn check visits every tile's traps, so the line
works while you sleep elsewhere.

Second blank, same chain: even the catches would have been lost. Trapped
carcasses rot in ~2 days ("clean it quickly (knife). It rots fast") and the
policy never called `cleanCarcass` — seed 11 probe: **31 catches, 0 cleaned**,
the meat lost (rotted or dropped). Canon's first ladder rung (cleaned, 2d)
had no policy hands.

## The lever (policy only, no src/ touched — ontology unaffected)

`scripts/policies/competent.js`:

1. **Split the trapline**: `workTrapline` keeps the day-end CRAFT (restock to
   2 held, haven); new `workTraplineSet` sets one held trap on the current
   wild tile — called from `forageTripSeedFirst` right after a successful
   forage, before the walk home. Haven/ruin refused (matches setTrap).
   Wire fallback: snare wire in the pack improvises a 2-use snare with no
   recipe knowledge (setTrap's honest-tackle path).
2. **`cleanCatch` in the daily camp ritual** (after sortHaul): cleans pack
   carcasses when the player has a cutting tool; **knaps a stone knife first**
   when holding stone + vine (the universal L3 recipe the game's own
   knifeless message points at). Knifeless and material-less: the carcass
   sits, honestly.
3. Env gates for identical-seed before/after: `COMPETENT_TRAPLINE_SET=0`,
   `COMPETENT_CLEAN_CATCH=0` (r4's COMPETENT_AID precedent).

Exact numbers: nothing in src/ changed — no yields, odds, costs, or caps
touched. The 40%/dawn trap chance, shyness 0.65^level, 10-use snares, 8-tick
cleaning, 0.30/0.40 butcher yields are all the game's existing numbers.

## Before/after (identical seeds × 200d, gates 0 vs default)

**24 seeds** (12 × batch A + 12 × batch B):

| metric | before | after |
|---|---|---|
| traps set | 0 | 20 |
| wire-improvised sets | 0 | 0 (wire never in pack on these seeds) |
| recipe crafts | 2 | 19 (every craft now gets set) |
| looted traps | 0 | 0 |
| dawn catches | 0 | 56 (squirrel 42, opossum 10, rabbit 4) |
| carcasses cleaned (sims) | 0 | 1 |
| median / max survival | 106.5d / 200d | 85d / 165d |
| spoil kcal/run-day | 3,703 | 3,925 |
| hungry-day share | 26.0% | 18.4% |
| death causes | combat-led (see baseline) | same shape, within noise |

Reading the table honestly: the trapline now functions end to end —
0/0 → 20 sets → 56 catches of honest small game. The survival delta is
**RNG noise, not a lever effect**: traps fired on only 3/24 seeds, and the
dawn-check RNG draws shift all downstream combat rolls (seeds 33–333, where
no traps fired, are byte-identical before/after). The trap yield is a real
but small supplement: ~100–140 kcal per cleaned catch against a ~2.1M-kcal
garden economy — a snare line for squirrels is dinner's garnish, not the
granary, exactly as the fiction says it should be.

The cleaning gap, measured: sim scholars start knifeless and the pack never
holds stone+vine together when a carcass lands (stone comes from
rubble-clearing, which the forage pattern rarely does) — so the knap-first
path fires in unit tests (15/15) but ~never in sims. **Documented next
blank, not fixed**: the knife/materials constraint is a materials-gathering
behavior question (lever-3 agency territory / future food round), not a bug.
A real player prioritizing the line would gather the stone; the policy
currently doesn't.

## Proof tests

- `scripts/test-trapline-set-20261012.js` (new): **15/15** — wire-improvised
  snare (2 uses, wire consumed), knap-first cleaning, honest sit when
  knifeless+material-less, both env gates, forced dawn catch → cleaned food.
- `scripts/test-trapline-20261011.js` (updated for the split — its E3 encoded
  the bug): **29/29**, incl. new E3b haven-refusal + gate regression.
- Regressions: test-aid-pipes-20261012 11/11 (r4's proof still green);
  test-daily-routine-transcripts clean.

## Sense-testing (transcripts read, seed 11, 60 days)

- The trapper villagers are people: "A person, maybe 40s, with calloused
  knuckles heads out to check the snares. 'Wire doesn't lie.'" / "🪤 ...
  is back. 'Snares were empty. They'll keep.'" — personality, routine,
  honest reporting.
- The player catch message is actionable, not decorative: "🪤 TRAP: Your
  snare 3 tiles east caught a Gray Squirrel! About 350 kcal on the bone —
  clean it quickly (knife). It rots fast."
- Gossip distortion reads as designed: "Three retellings in, nobody remembers
  what actually happened — but everyone has opinions."
- Sassafras beat is a real little story: Sujon taste-tests, gets
  "thoroughly, educationally sick," announces "NOT food" to the fire — the
  village learns the hard way. Knowledge lever's territory, working.
- Repeats flagged (not fixed — other levers' territory): "You haven't earned
  that yet" (trust-gate refusal) 12× in 60 days — correct gating, noticeable
  repetition; the "remember it / Word gets around" teaching template (r4
  noted it too — knowledge lever).

## Reachability verdict (unchanged)

Waves 4–5, Arc 4, national, the table, the win flag: still unreached in
12/12 competent runs. The trapline is a food supplement; the wall is the
combat-driven roster collapse (r4's finding stands — death causes unchanged
in shape). Not a food blank.

## Village assessment (plain words)

The village is a place that finally works its trapline. For four rounds the
snares were a rumor — two traps built in two hundred days, neither ever set,
because the hands that built them were already home by the fire when the
setting should have happened. Now the traps go out on the wild ground where
the forager stands, and the dawn brings squirrels: fifty-six of them across
the measured runs, cleaned (when there's a knife) into a hundred-odd honest
kcal each. It is not much against the gardens' two million — and it
shouldn't be; a snare line catches dinner, not harvests. What it is, is a
system that finally runs instead of sitting at zero: craft, set, catch,
clean, eat. The part that still sits at zero is the knife — the sims'
scholars walk knifeless, stone and vine never meet in the pack, and most
catches still slip away uncleaned. That's the next blank, and it's a
materials question, not a mechanics one. The village itself keeps dying the
same way it always did: in the treeline, forty-odd combat dead on a bad
seed, the pantry breathing out from full to nothing as the hands that filled
it die. The trapline doesn't change that. It was never going to. It just
means the village eats a few more squirrels on the way down.

## Blanks: filled / documented

- FILLED (policy): trapline sets on wild ground — 0/0 → 20 sets / 56 catches
  on identical seeds. Proof 15/15 + updated 29/29.
- FILLED (policy): the catch gets cleaned — cleanCatch + knap-first wired
  into the daily camp ritual. Unit-proven; sim-firing rare (knife bind).
- DOCUMENTED: knife/materials constraint (stone+vine never coincide in sim
  packs) — next blank, materials-gathering behavior, lever-3/future-round
  territory. No game numbers touched; Steve can overrule the knap-first call.
- DOCUMENTED: wire-improvised and looted trap sources measured at 0/24 seeds
  — reachable in the world (scavenge grants wire), just rare; not broken.
- DOCUMENTED: reachability unchanged — waves 4–5 / Arc 4 / national / table /
  win still unreached; the wall remains combat-driven roster collapse.

## Design calls for Steve's overrule

1. Set-on-the-foraged-tile (one trap per outing, 2-held cap kept) — the
   "real player" moment for the set action.
2. Knap-first: trapper with stone+vine but no knife makes the universal
   stone knife rather than watching the catch rot.
3. No src/ number changes: trap odds/yields/costs are the game's own; the
   lever was purely "the policy plays the existing system."

No `[needs-eyes]`: policy-only, no feel/combat/UI change.
