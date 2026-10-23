# Rogue P0 implementation — progress (Steve 2026-10-22 order)

## Landed on master
| P0 | Item | SHA | Notes |
|----|------|-----|-------|
| 1 | Terminal-state heatmap aggregator (T1) | `298ac3802` | scripts/heatmap-terminal.js + proof; zero engine changes |
| 6 | Binomial luck instrumentation (T3) | `a09709f8f` | 6 luck columns appended to balance-metrics.json (additive, descriptive, zero verdict power); sim-only luckRoll hook at 5 roll sites, dead code in browser |
| 8 | Player naming rite (T7) | `3fbe47a4e` | [needs-eyes] name babies + use-names at trust ≥75; new src/js/naming-rite.js |
| 4 | End-of-run "What the village learned" debrief (T4) | `fef2239c7` | [needs-eyes] ~50 lines on death screen; in-run only, grants nothing |
| 2+7 | Shared text module + verb-conjugation pipe (T5) | `c01f2e5ab` | [needs-eyes] new src/js/text.js (article/pronoun/slot/conjugation); 18 article-ternary swaps; fixes "an eSL teacher" + 3 verb breaks; sw.js regenerated |
| 5 | Declarative npcTrigger registry (T2) | `c94951675` | pure refactor, zero behavior change (4-seed A/B byte-identical proof); unlocks P1 dormant-motivation rows |

## Status: COMPLETE — all 8 P0s landed, zero killed.

## Merge notes (for the record)
- index.html version-tag collisions on rebase (ship loop bumps ?v= tags): resolved by taking master's tags and re-adding the new script line with the new tag. Recurred on rogue-naming and rogue-fallen.
- rogue-fallen worker was interrupted post-commit; adopted cleanly (commit existed, tree clean).
- Sibling landings mid-work (sim-recallsignal-b, journey-endgame r40 ×2, sim-armor-drive ×2): all rebases clean except the index.html tag collisions.

## Flags for Steve
- P0-6 extended the balance-metrics contract (6 new columns, additive only, zero verdict power). Contract changes are his call — needs his nod.
- [needs-eyes] commits: P0-3, P0-4, P0-8 (all player-facing UI/beats).
- P1 #4 Founding Oath: NOT implemented — needs Steve's oath-set decision first.
- Design calls by workers (in their reports): naming threshold 75; parents hold baby-naming right with 30-day fallback; debrief scroll acceptable on run-end screen.
