# Fraying trust: real recipients and legacy phantom cleanup

Base: `58b3980644ac3799f4470e48094937f9030580c0`. The previous policy audit
reproduced `bumpTrust(null,-2)` on a player crossing into fraying. This creates
`village.trust.null`, changes no actual resident and pollutes the existing event
trust mean. This unit repairs that existing crossing reaction and the reserved
old-save key. It does not implement the broader conversation effects described
in TABLE.md or create an NPC-to-NPC relationship currency.

## Implementation and judgment

The existing two-point loss now reaches each distinct known living current
resident other than the bearer, through the actual `bumpTrust` API. Dead,
unknown, duplicate and former residents do not receive another charge. Current
roster membership is the eligibility rule; there is no new distance/away gate.
The bearer's own standing stays unchanged. Remaining in fraying does not repeat
the crossing reaction, and recovery does not grant trust. A later downward
crossing can charge again, as before. Existing grounding thresholds, food
conversion multipliers, Voice costs, public action limits and NPC own-grounding
warning behavior stay unchanged.

`bumpTrust` refuses null, undefined and empty/non-string identifiers. Real load
removes only the reserved `trust.null` property, preserves all real relationship
history (including zero and former-resident values), and never replays a
crossing. Subsequent save/load retains the cleanup. The event mean then reads
the remaining map normally; broader historical-membership semantics are outside
this repair. No retroactive penalty is inferred from corrupt old saves.

**Needs-eyes interpretation:** applying the existing null/-2 crossing call to
current living other residents is an implementation judgment. TABLE.md also
describes ongoing conversation-open decay and further estranged/hollow social
effects, but the runtime contains no such grounding consumers. This unit neither
treats those descriptions as implemented nor invents their rates. The current
player and NPC relationship models are still different; this is not a claim of
complete social parity.

The case for repair is a real paid social consequence and a trustworthy save
map. The counter-risk is that a formerly ineffective cost can change community,
survival and ending access. A narrow null cleanup alone would preserve the
broken cost; a new ongoing conversation tax would exceed the existing runtime
mechanic. Keep the crossing repair separate, measure all playstyles and preserve
the broader effects as explicit backlog. Winning remains hard; neither a lower
win count nor a larger total establishes whether this is the right social price.

## Verification and simulation design

The shared-harness proof passes23/23 and fails14 assertions on the exact frozen
base (9 pass). It uses actual paid Be Heard actions, real save/load, same-day
refusal, exact75 boundary, recovery and a second crossing, eligibility, zero/
unset trust, invalid recipients and unchanged NPC own-grounding behavior.
Quick180/180 and full952/952 pass. `check-wired` finds the same pre-existing
unwired `tableTheme` before/after; changed grounding functions have callers.
No assertions, thresholds, policies or measurement contracts were relaxed.

[The plan](fraying-plan.json) pins16 standard screen seeds and64 disjoint
confirmation seeds10001..10064, with capable/maker/merchant/caregiver unchanged.
The exact208-input before manifest matches the prior immutable Voice-policy
panels, so only their original four controls are reused. Their full rows, hashes,
metrics, observer-off receipts and job identities remain verbatim. This saves
328 reruns; candidate roots run328 new jobs. Retained totals are656 jobs,
640 observed and16 observer-off checks, not656 newly executed campaigns.

Both arms use the same observer/contract and policies; only game.js/table.js
change in the campaign source manifest. The screen and confirmation results
retain all23 metrics and denominators. See [screen](fraying-screen-score.md) and
[confirmation](fraying-holdout-score.md). These are exploratory intervals,
not equivalence tests or difficulty targets.

## Results and named investigations

The16-seed screen changes capable wins14→12; maker6→6, merchant3→3 and
caregiver8→8. Capable deaths20→19 and community losses2→2: fewer wins do not
simply mean more bearer deaths. Both lost wins are retained as neutral replays.

Capable seed2 first crosses on day84. The control dies in combat on day100 and
its successor enters assimilated on101. The candidate retains its original
bearer to day150, at arc3 without a Table entry despite having both food deeds.
It has only3 distinct wave-2 fights against the lesser seat's required4.
This is survival with insufficient experience, not a reactor/food lock.

Capable seed1234 first crosses on day80. The control dies on122 and its
successor enters relay on126. The candidate dies on143; the successor at the
end of the simulation lacks the feast-use deed and has no Table entry. Neither
final bearer holds the reactor. These traces do not establish that a two-point
trust loss directly causes either ending outcome. The real trust events and
later actions alter a compound history. Existing trust telemetry also advances
the harness clock used in generated IDs, so downstream ID changes are not an
isolated estimate of social-price magnitude. Do not tune the penalty from these
two cases or silently repair an ending gate to recover their wins.

The64 disjoint confirmation cases per policy produce these counts:

| Policy | Wins | Table entries | Player deaths | Community losses | Named class | Contest/show tier-3+ gear |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| capable | 51 →48 | 51 →49 | 86 →86 | 12 →12 | 38 →38 | 57 →57 |
| maker | 20 →21 | 21 →21 | 83 →86 | 26 →24 | 48 →49 | 62 →61 |
| merchant | 26 →26 | 26 →26 | 59 →52 | 27 →26 | 45 →44 | 63 →63 |
| caregiver | 31 →31 | 32 →32 | 41 →43 | 19 →16 | 45 →45 | 63 →63 |

Overall good-gear access and early first-bearer survival stay unchanged in
every pair. Day60 survival retains the original62 eligible merchant and63
caregiver pairs. Maker/caregiver death increases, maker contest/show gear loss
and merchant class loss remain adverse directions beside fewer community losses.
Caregiver low-food exposure rises .0079→.0084 and low-HP .0023→.0027; merchant
low-food/water/HP and NPC hunger also rise slightly. Maker low-water exposure
rises .0076→.0080. All23 metrics and uncertainty remain in the report: smaller
changes without a flag do not establish equivalence. Capable's lower invitation/
entry rates retain `regression_watch` review flags, not an automatic rejection.

All10 changed confirmation wins have paired neutral replays, including gains:

| Cohort/seed | Changed trajectory in the repaired arm |
| --- | --- |
| capable10028, gain | Expedition death on114, successor wins feared126; control loses village after contest/combat deaths. |
| capable10036, loss | Combat death116, successor lacks food deed, village lost121; control successor wins relay107. |
| capable10044, loss | Original bearer survives to151 but has zero late-wave fights; control has three and wins relay131. |
| capable10050, loss | Both arms die on38 and125, with different successors. Candidate ends151 at arc3 despite an actually ready lesser seat; see catch-up diagnosis below. |
| capable10061, loss | Both enter the Table on90. Candidate dies in combat while Table phase is still paths and loses the village; control wins feared. |
| maker10038, gain | Same surviving bearer and food deeds; assimilated wins instead of the control's failed feared outcome. |
| caregiver10007, gain | Candidate reaches four distinct wave-2 fights and wins relay140; control has three and remains arc3. |
| caregiver10030, gain | Candidate wins assimilated94 without death; control later loses the village after combat/starvation deaths. |
| caregiver10036, loss | Earlier combat death120; successor ends without feast-use deed. Control's later successor wins relay144. |
| caregiver10061, loss | Combat death118; successor ends without feast-use deed. Control's original bearer wins relay126. |

These are recorded endpoints and routes, not isolated causal attributions for
the trust penalty. No final bearer in these10 pairs holds the reactor. The
shared harder question of succession versus a bearer's own progression remains;
do not treat every missing food deed as the pending reactor question.

Two additional passive gate replays for capable10050 preserve the same full
rows/hashes/metrics and prove that the candidate's final actual lesser seat is
ready: stage3, national rank, waves13/11/3,13 contests,4 crises and food deeds.
An explicit post-campaign `checkArc()` changes arc3→4 and waiting false→true,
with unchanged2400 kcal. This mutating diagnostic is kept separate from the
neutral campaign outputs. This exposes a reactive invitation catch-up follow-up;
do not pretend missing ending access is fully explained by insufficient deeds
or restore null trust to conceal it. Its remedy needs an independent runtime
unit and new comparisons.

## Actual mobile action and save compatibility

At390×844, the native paid action takes1110→960 kcal and79→74 humanity,
sets the day's word and leaves the native action disabled. A prepared living
guest at90 trust falls to88; bearer standing remains90 and no null key exists.
The fixture then deliberately writes a legacy null:8 key and uses actual
`Game.save`/`Game.load`. Loading removes it, leaves guest88/self90 and restores
the event mean82.00→88.17 without charging again. [Paid action](fraying-paid.jpg)
and [loaded save](fraying-load.jpg) have full accessibility receipts.

The fixture labels are diagnostic readouts, not a native humanity HUD. This
does not prove a player can see every exact value or that the transient tier
dialogue is sufficiently readable during a god action. Native HUD/cost feedback,
living-speaker dialogue names and broader conversation effects remain follow-ups.

## Reproduce and maintain

```text
node evidence/2026-10-16/fraying-verify.cjs
node evidence/2026-10-16/fraying-verify.cjs --current
node evidence/2026-10-16/fraying-reconstruct.cjs before <fresh-directory>
node evidence/2026-10-16/fraying-reconstruct.cjs after <another-fresh-directory>
node evidence/2026-10-16/fraying-verify.cjs --recompute <after-directory>
node evidence/2026-10-16/fraying-probe.cjs <root> capable 7 <output.json.gz>
```

Default verification uses retained receipts without importing today's
comparator. Reconstruction pins the parent commit and source arms, includes
the immutable existing scorecard-test fixture and checks manifests. Recompute
checks exact frozen comparator bytes before recomputing both reports.
`--current` additionally verifies current source and runs the23-assertion proof.
Both reconstructed208-input manifests match; the rebuilt candidate passes23/23,
and both23-metric reports recompute exactly. The published probe on rebuilt
capable seed7 reproduces every retained field exactly, including diagnostics.
Keep future parameter, policy or social-parity changes in a new experiment.
See [survival levers](../../docs/SURVIVAL-LEVERS.md) and
[workflow](../../docs/SIMULATING.md). No release/version bump belongs to this unit.

The32 neutral replay files cover15 distinct policy/seed pairs in both source
arms plus two repeated passive gate replays. The additional post-campaign
mutating diagnostic is not an observer-neutral run. Decision: retain the real
recipient repair and narrow compatibility cleanup, mark the social-price
interpretation needs-eyes, preserve every adverse direction above and audit the
newly reproduced reactive invitation gap independently. Do not use win recovery
as a tuning target.
