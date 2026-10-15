# Maker trials: rejected guesses versus real risk

Continuation of the playstyle audit. The previous hide-discovery screen
restored real learning/crafting but did not improve survival. This pass traces
actual stock changes before interpreting repeated craft calls as costly trials.
No game odds, costs, recipe access, rewards, armor or player controls change.

## Traced baseline

`maker-counter-trace.js --mode gear` observes public craft, counter pickup and
equipment actions, with copied inventory/equipment/knowledge and narration.
`--root` permits replay against frozen source. Arguments are copied as primitive
values/container labels, not retained mutable arrays. `returnedTrue` is only a
literal return observation: equip returns null on success, so equipment changes
must be read from the actual before/after slots. Corpses is included in hashes.
Default counter mode remains available, with the prior index field retained.

Both baseline traces reproduce their existing census hashes exactly:
- Seed 5: ten hide-armor calls, nine unfunded guesses, one funded failed roll.
  The funded day-79 roll consumes two hides and a vine; no armor is produced.
  Repeated identical hide/fiber refusals change neither stock nor ticks.
- Seed 31337: ten calls, nine unfunded guesses using the same visible supplies
  on days 37–61, then an actual day-79 success consumes stock, spends 32 ticks,
  creates armor and teaches L2. This run still loses overall.

These do not attribute the earlier survival changes to crafting. Existing
funded failures consume materials but return before the success branch's
32-tick clock; neither failed rolls nor missing-material refusals may be
reported as paid 32-tick labor. That existing time asymmetry remains an audit
follow-up, not a silently changed balance rule.

## Policy correction and regression

The maker remembers its last rejected guess using bearer identity and public
hide/vine/fiber/cloth quantities. Passing days alone no longer repeats it.
Changed visible supplies permit a fresh guess after the existing three-day
cooldown; skipping a rejected guess does not reset that cooldown. A funded
failed roll consumes inputs and is not blacklisted on restocking. The L1
branch still never reads hidden recipe requirements. More of the same material
can trigger another guess: this is bounded memory, not ingredient inference.

Shared-harness hide discovery proof: **26 pass**. The same test with only the
old policy substituted gives **23 pass / 3 fail** on the new memory/retry
checks. Real game rolls remain seeded, not replaced; the restock check follows
the fixture's actual failed roll.

## Matched 64-seed screen

Baseline: `gear-usage-hide-discovery-after-64.json` reused only after checking
all its recorded src/policy SHA-256 hashes against the current pre-edit tree
and frozen `.git/hide-discovery-after` (zero mismatches). New arm:
`gear-usage-hide-guess-after-64.json`. Same seed order, standard sweep-compare
driver and 150-day horizon. Source manifests differ **only in livelihood.js**.
The underlying gameplay and competent policy are unchanged.

| Measure | Before | After |
|---|---:|---:|
| Maker L1 hide trial calls | 85 | 49 |
| All public hide-armor craft calls | 90 | 54 |
| Successful hide armor crafts | 18 | 18 |
| Runs learning L2 hide armor | 13 | 13 |
| Actual successful L1 trials | 13 | 13 |
| Personally earned noncombat tier-3+ gear runs | 64/64 | 64/64 |
| Wins | 19/64 | 18/64 |
| Seats | 32/64 | 31/64 |
| Bearer deaths | 56 | 56 |
| Observer errors | 0 | 0 |

**63/64 final gameplay hashes match exactly.** Both arms retain zero livelihood
policy errors. These policies avoid deliberate hunts/feast fights but still
use ordinary defence; this is not pacifist or crafting-only viability.

Seed 50 is the sole changed trajectory. Both additional read-only traces
reproduce their respective census hashes exactly. Previously a day-74
unfunded refusal reset the cooldown, preventing a trial when a vine was
available on day 76. The revised policy skips that repeated refusal and makes
a real day-76 attempt: two hides and one vine are lost on a failed roll.
Baseline eventually wins day 122; revised run reaches day 150 without taking
a seat. It has no bearer death in either arm. The trace establishes the first
material/timing divergence; it does not prove that armor or those supplies
alone determine the eventual ending.

This correction removes misleading probe repetition and makes a newly funded
opportunity real. **It is not a survival buff.** Keep the strategy marked
needs-eyes, and do not tune rewards/odds to recover one preferred seed. The
remaining broad audit includes peer trade/covenants, party orders, organic
merchant budgets, fat/pemmican access and occupation/build balance.

## Validation

- Quick suite: **129 scripts pass**, 37 seconds.
- Full suite: **901 scripts pass**, 156 seconds.
- `git diff --check` clean (line-ending warnings only).
- No src or data changes; the previously verified hide pickup/craft/wear UI is
  unchanged. This pass adds no new browser or naturally found gear proof.
- No release/version bump or remote push. Roadmap goal remains active.
