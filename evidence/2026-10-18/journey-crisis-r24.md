# journey-crisis r24 — cannibalism gets its own voice (2026-10-18)

Lane B, leg 6 (crisis). Coordinator timed out at 3600s mid-run; the fixes were staged and proof-green (42/42) but never committed. Recovery landing by main agent 2026-10-18 ~17:05 CDT: re-ran proof (42/42 GREEN), verified regressions against pristine master, sense-read the new voice lines, updated one stale count assertion, committed and merged.

## Pre-registration

- QUESTION: when a witnessed cannibalism charge reaches the crisis moot, does the village confront, judge, and sentence it as its own gravest crime — or does it fall through the cracks of the murder machinery?
- Interesting finding: any place where cannibalism is treated as "murder, but worse" in prose while the code treats it as murder, period.

## The blank

Cannibalism had NO voice and NO legal standing of its own in the justice system:

1. **No confrontation voice** — the accuser's confrontation fell back to the generic "we need to talk" or the murder line, even though canon (docs/CORRUPTION.md) says "the charge outranks murder."
2. **Buy-off for the unforgivable** — the confrontation hint told the player to "pay restitution," and `justiceRespond('pay')` would accept food for eating a villager, even in a healthy village where the norm is exile.
3. **Weregild for cannibals** — a cannibalism conviction on a friendly belief ledger could be bought down to weregild. It was never a weregild crime.
4. **No accuser story** — the charge narrative map had no cannibalism entry, so the moot heard "wronged the village."
5. **Rank below murder** — the seriousType rank table topped out at murder: 4.

## The fix (all in-worktree, proof-tested)

- `src/data/justiceVoice.json`: new `confrontation.cannibalism` pool (5 templates: default/close/wary/bold × 2), plus cannibalism `seriousType` templates in `summons.heat` and `summons.refused`.
- `src/js/justice.js`: cannibalism outranks murder in confrontation voice selection and in the seriousType rank table; where the village norm is exile, the confrontation hint no longer offers restitution ("They will not take food for this."), and `justiceRespond('pay')` refuses the payment — the food stays in the pack. Starving/corrupted villages keep their priced/honored paths.
- `src/js/betrayal.js`: cannibalism conviction where the norm is exile resolves straight to exile (never weregild); the accuser's story names the crime ("ate one of us. There it is. Said out loud.").
- All branches honor the village's actual cannibal norm via `cannibalNorm()` — healthy → exile; starving ("horror without exile") and corrupted keep the ladder below.

## Proof

`scripts/test-crisis-moot-cannibal-20261018.js`: 42/42 GREEN (run by worker pre-timeout, re-run green by main agent at recovery). Covers: confrontation voice selection per crime mix, no-buy-off refusal + food retained, exile-on-conviction vs weregild, accuser story text, rank ordering, starving-village norm preserved.

## Regressions

- `scripts/test-justice.js`: 61/61 green.
- `scripts/test-betrayal.js`: 79/1 — the 1 failure ("no strangers before notability") is pre-existing on pristine master.
- `scripts/test-justice-voice-20261007.js`: one count assertion went stale because the fix intentionally adds a template (refused 8→9); updated the snapshot to the new true count. Suite now matches master's pre-existing baseline (9/8 — the other 8 failures are pre-existing template-count drift from earlier additions).
- `scripts/test-moot-justice-aftermath.js`: 27/27 green.

## Sense-read (SENSE-TESTING LAW)

Read the new cannibalism confrontation lines through the real voice picker across ctx (default/close/wary/bold): "Marisol can't look at you. 'I keep seeing it. Tell me I didn't see it. Please tell me I didn't see it.'" / "Marisol keeps their distance, like you're something with teeth now. 'Stay there. Just — tell me it isn't true.'" Distinct per relationship, horror-appropriate, no filler. The refused-payment line ("No. Not for this. You don't buy your way back from eating one of us.") lands.

## Metric review

The run's pre-registered question was answered by code + proof, not by a sim sweep — the blank was a content/voice gap, not a balance lever. No per-seed metrics were produced (the behavioral re-run SEED=7201 died with the timeout); telemetry deviation check is not applicable to a dialogue-voice fix with no balance surface. Regressions are at the pre-existing baseline.

## Verdict

Reachable yes, fun yes (the horror lands), winnable yes. [needs-eyes]: this is confrontation/justice feel — Steve should hear the cannibalism moot on his phone.

## Files

- Fix: `src/js/justice.js`, `src/js/betrayal.js`, `src/data/justiceVoice.json`
- Proof: `scripts/test-crisis-moot-cannibal-20261018.js`
- Diagnostics: `scripts/diag-crisis-moot-20261018.js`, `scripts/probe-d25-20261018.js`, `scripts/probe-deathcause-20261018.js`
- Regression maintenance: `scripts/test-justice-voice-20261007.js` (refused count 8→9)
