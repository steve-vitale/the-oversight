# NPC measurement eligibility and sampled build exposure

2026-10-16. Tooling only. Primary base `dc95de126586fc2c3bee99aee598519dc4c02950`;
shared base `3167567fb1d47c9a9de51db6d8233eafb2d89daf`. No gameplay, policy,
harness, reward, food cost, HP, enemy, release or deployment change. The formal
companion body candidate remains unadopted; its food-use question is unchanged.

## Defect, correction and contract

The old collector scanned every `v.npcGodpath`/`v.npcGodhood` record. Those maps
can retain the current bearer, dead people, departed people and unknown IDs.
Their presence does not establish a living NPC holder. Population sampling
also counted duplicate roster entries and omitted saved/background definitions.
The old class fraction intersected historical identity sets without requiring
class and NPC eligibility to coincide. A formerly unclassed NPC becoming a
player could therefore appear to have held that player's later class as an NPC.

The new observer reads a distinct roster and canonical person definitions,
in priority order: main villagers, saved rosterChars with matching ID, background
survivors. A known resident is eligible if not `Game.villagerId` and not marked
dead on the canonical person. Zero HP alone is not a new death declaration.
No game knowledge/build/needs helper is called to answer these queries: such
queries can initialize state or use RNG. Observation does not clean raw maps,
repair rosters, acquire builds or alter life/role state.

NPC class recognition events and sampled class/god records require eligibility
at that time. Genuine earlier NPC access remains historical after death or
succession; a later player-only build does not gain NPC credit merely because
that ID once belonged to an NPC. NPC class access is the fraction of distinct
daily/terminal-sampled eligible identities with an eligible class observation.
Class events between snapshots can establish access, but do not manufacture
holder-days. Unknown identity history is retained across all sample calls;
a later same-day terminal snapshot cannot erase it. Any such history makes
the class fraction null. Mean living-NPC count is null if a retained per-day
population sample has an unknown definition. Hungry-NPC sampling retains its explicit known
needs denominator, with each actual person counted once.

All23 keys and challenge/survival directions remain. The NPC contract has a
new revision/description and digest, even though this cohort's23 scalar values
are unchanged. Old and new observers/contracts cannot be paired as a gameplay
experiment: the real comparator rejects them, retained in lineage-rejection.json.
Historical reports keep their old meaning; rerun both roots with one current
observer/contract for any new balance conclusion.

`npcExposure` retains the last daily/terminal snapshot for each calendar day:
eligible/unknown/dead IDs, class/god holder identities, duplicate roster counts,
and excluded map-record counts by reason. All-sample known/unknown identity
unions remain separate from the last per-day detail. Exclusions count records per sample,
not distinct people. `balance-features.js` reports measured/missing coverage,
sampled eligible person-days and per-build holder-days, deduplicating a
person/day/build. Legacy missing exposure is null/unknown, not zero. These
are snapshots of active records, not continuous availability, proof of an
authored deed, combat participation, a successful cast, food payment or fun.

## Runtime, actual trajectories and interpretation

The shared-kit proof uses one seeded game harness and actual class-recognition
telemetry, including a prepared dead holder. Two real succession handlers
exercise a classed NPC becoming the bearer and a formerly unclassed sampled
NPC acquiring a class only as the player. Prepared legacy maps cover self,
dead, departed and unknown IDs; saved/background people and duplicate rosters
cover the denominator. A same-day overwrite cannot manufacture complete
historical coverage. Sample/finish gameplay hashes remain unchanged.
The same30 assertions report **9 pass/21 fail on the old observer,30/30 on
the corrected primary and shared observers**. The proof is automatically
discovered by quick/full checks. Scorecard30/30 and maintenance8/8 also pass.

The16-seed/four-policy screen expands to64 seeds per policy,150 requested
driver days, ordinary Columbus/eastern-woodlands origin. Actual calendar days
remain distinct from driver iterations. These are mixed strategies, not
pacifist or every-region viability proofs. Every one of the256 current rows,
full gameplay hashes and23 scalar metrics equals its retained old-observer
counterpart, with identical207-file runtime/policy/harness manifests. This
is an observer correction, not a win-rate improvement, survival regression
or change in challenge. No balance parameter was tuned.

NPC god distributions change in55 runs (16 capable,15 maker,14 merchant,
10 caregiver). The scalar NPC-class fraction and class distributions happen
to remain equal throughout this natural cohort; the prepared role/lifetime
counterexamples prove the fraction's corrected semantics. Do not claim a
natural class-fraction effect that these data do not show.

Runs with a sampled/recorded NPC god, old raw-map scan → eligible observation:

| Policy,64 runs each | Living Garden | Apex | Shepherd | Voice | All-Seeing |
| --- | --- | --- | --- | --- | --- |
| capable |22→13|8→3|3→2|2→0|0→0|
| maker |39→35|9→3|3→2|3→0|1→0|
| merchant |31→27|14→6|0→0|1→0|1→0|
| caregiver |42→36|7→5|5→5|1→0|1→0|

These are runs observing each god, not mutually exclusive people or wins.
The corrected zero sampled Voice/All-Seeing counts are coverage questions,
not evidence that the features are broken. Inspect opportunities and bot
choices before changing offers, kits or payoffs. Maker7 illustrates the
distinction: the old NPC Apex entry disappears while a legitimately sampled
Living Garden remains. Exact per-policy censuses retain holder-days, missing
coverage, exclusions, recipes, gear sources and all method denominators.

## Proof identities and repeatability

Retained job receipt: **528 distinct cached identities** —260 historical
primary-before jobs,260 primary-after jobs and8 fresh shared-after jobs.
Each primary arm has256 standard rows plus4 off controls; the shared proof
has4 rows plus4 off controls. There are12 sampled on/off pairs including
the historical before proof. The16-seed screen is a subset, not extra
independent evidence. No holdout, small gameplay-effect or cross-branch
balance claim. Observer errors/warnings are empty and source stability passes.

The source bundle records exact raw tool bytes, base commits and207/209-file
game/policy/harness manifests. Raw observer/contract hashes match their
panels; normalized source hashes match the maintenance proof. Reconstruction
refuses existing output, restores only the named branch's data/runtime and
observer lineage, and verifies all fingerprints. It adds the common30-assertion
test for the deliberate old-observer negative control; that negative root is
not claimed to pass the full suite. Archives have no own Git metadata and
their panel HEAD fields are null. Fetch the two feature refs if needed;
do not merge primary gameplay merely to obtain common tools.

```text
node evidence/2026-10-16/npc-measurement-reconstruct.cjs primary-before <fresh-before>
node evidence/2026-10-16/npc-measurement-reconstruct.cjs primary-after <fresh-after>
node evidence/2026-10-16/npc-measurement-reconstruct.cjs shared-after <fresh-shared>
node <fresh-after>/scripts/godpath/test-balance-npc-eligibility.js
node <fresh-before>/scripts/balance-panel.js --root <fresh-before> --n 64 --par 4 --out <old-observer-panel>
node <fresh-after>/scripts/balance-panel.js --root <fresh-after> --n 64 --par 4 --out <new-observer-panel>
node <fresh-shared>/scripts/balance-panel.js --root <fresh-shared> --seeds 7 --par 4 --out <shared-neutral-proof>
node scripts/balance-features.js <new-observer-panel>/panel.json.gz --out <census>
node evidence/2026-10-16/npc-measurement-legacy-run.cjs <fresh-shared> scripts/test-miser.js 110
node evidence/2026-10-16/npc-measurement-verify.cjs
```

Fresh reconstructions reproduce maker7 on/off for all three arms:6 additional
executions of the same cached identities, not six new worlds. Full rows,
hashes, observer/contract/source identities and neutrality match. Reconstructed
primary/shared runtime proofs are retained. No browser/mobile action was
needed for this Node-only observer change; the existing UI/gameplay is unchanged.

## Shared publication and validation limits

The six common collector/contract/census/test files are identical in primary
and shared worktrees. Each branch has its own fresh four-policy observer
proof and `balance-proof.json`. The maintenance hook now requires all four
collector/contract inputs, explicit NPC eligibility evidence, and a class
denominator reproducible from retained identities. Source changes invalidate
case caches automatically. Recheck all contracted metrics and censuses after
future semantic changes; never refresh fingerprints merely to hide a failure.

Primary full945/945 is green. The shared game is not green: a fresh pre-edit
full run is824/871 (47 failures), first post-edit run823/872 (49 failures).
Final full validation is822/872 (50 failures); quick98/100. Both quick
failures already occur in the pre-edit full run.
No runtime, data, policy, harness or legacy assertion was changed or quarantined.

The first development run's two additional names are unseeded legacy scripts:
`test-blocked-travel-feedback.js` and `test-past-deflect-gate.js`. The final
run's three additional names are `test-drifter-presence.js`,
`test-enter-building-guard.js` and `test-miser.js`. Their evaluated
game/data/test inputs are unchanged. A fresh frozen3167567f source and the
updated shared checkout run all five at seeds0–15, before evaluation, with
the shared harness RNG and a fixed clock: **160 executions,80 pairs,
all stdout/stderr/exit codes identical**. Blocked travel fails at2/4/6 in both;
past deflection at7/9/11/12, drifter presence at3 and building entry at6.
There are71 passing and9 failing pairs.

Miser's small cache-theft sample does not fail in that cohort. A separately
retained adaptive before-only search of seeds16–111 (96 executions) finds
the same cache-order assertion failing at110; one updated-root execution
at110 matches the frozen failure's full stdout/stderr/exit code. This is
a selected diagnostic counterexample, not independent balance evidence or
a weakened assertion. The110 reproduction command above is expected to exit1.
All five legacy scripts omit the changed collector.
Retain the red history and controlled failures rather than retrying to
advertise green. Final repeated full checks followed added lifetime and
unknown-history counterexamples; they were not retries to erase failure.

Shared validation's existing Windows ontology generator changes six engine
path separators. Both before/after diffs are retained; exact formatting-only
equivalence to the tracked file was verified before restoring that generated
output. No ontology/gameplay change is included. Final check records are
retained separately; any final variation in the legacy failure set is disclosed
in validation.json. The shared draft remains a tooling handoff, not a green
gameplay integration or deployment.

Decision: retain and publish the measurement correction on both feature
branches. Do not restore old NPC god totals by buffing anyone or convert the
census movement into a survival judgment. Continue natural NPC opportunities,
recipient/payoff parity, fitting deeds and broader campaign coverage separately.
Garden/reactor questions, companion entry/initiative/body parity and the other
roadmap items remain open. The full roadmap goal is still active.
