# Miser access: reject the offer-only reorder, retain choice evidence

2026-10-15. Baseline `6266cb423e30141dda518bdb9ef781ef877cd978`,
codex/resume-claude. This experiment's candidate is **not retained**.
Final game sources match the baseline; only analysis tooling/docs/evidence
are published. No deployment, SW bump or region/nomad changes.

## Question, intervention and decision

Paid trade practice and Haggle pricing are already repaired. Neither Miser
class appears in the current standard panel. Test the narrower hypothesis
that making two existing starters available earlier is sufficient: Social
Hoarder8/Haggle10 ->5/6, preserving the first four entries and every other
relative order. Crowd Favorite/Turncoat become7/8. No payoff moves forward.
All other kits, shared window/decay, XP, slot/class thresholds, build brain,
policies and ability costs/strength stay fixed.

Do not retain the reorder. It demonstrably increases offers, but forms no
Miser class in256 candidate campaigns and yields no Hoarder/Haggle pick in
the observed merchant choices. It changes many other builds, creating
unresolved costs and ending tradeoffs without demonstrating its intended
benefit. This is **not** a decision to restore a win percentage or proof
that a deliberate human Miser strategy is unviable. Keep the existing order
while testing knowledge-bound intent and actual economic value separately.

Existing Hoarder costs:75 daily kcal, trust-gain multiplier0.8, +10kg carry.
Haggle:30 daily kcal, buyer quote0.75, existing route income1.25. Earlier
holders would owe those costs. The standard merchant still budgets against
cached base prices rather than effective quotes. That policy limitation is
unchanged on both arms, and must be a separately named experiment.

## Matched screen and confirmation

Four standard mixed policies, same seeded driver,150-day cap, Columbus
origin, Node, flags, observer and neutral-win contract. These are not
pacifists. All23 metrics are retained in both screen/confirmation reports.
The candidate changes all256 final gameplay hashes. No observer/gear errors,
warnings or source drift; all512 cache rows/result digests verified and16
balanced seed7 on/off jobs match across the two arms.

| Policy | Wins | Table entries | Player deaths | Community losses | Player named-class cases |
|---|---:|---:|---:|---:|---:|
| capable |55 ->47|57 ->47|90 ->76|8 ->10|45 ->37|
| maker |21 ->30|22 ->30|52 ->68|18 ->13|53 ->47|
| merchant |25 ->27|25 ->29|42 ->51|14 ->14|46 ->46|
| caregiver |23 ->27|25 ->28|45 ->40|18 ->17|49 ->43|

No Miser class in either arm, including NPC class samples. Win movement
is neutral review: capable delta-0.125, exploratory interval[-0.25,-0.015625];
maker+0.140625 [0,0.28125]; merchant+0.03125 [-0.078125,0.140625]; caregiver
+0.0625 [-0.09375,0.21875]. No independent holdout or adjusted multi-metric
significance claim. The16-seed screen had capable12->13, maker8->4,
merchant3->3, caregiver6->10 wins; retain it rather than selecting whichever
sample makes a preferred story.

Maker first-bearer survival through day60 falls53->45 despite more wins;
death exposure also rises (0.642->0.937 per100 calendar days). Capable
player deaths fall while invitation/access/class rates fall. Merchant
contest/show tier3+ access64->62, though overall good-gear access stays64.
Caregiver gains wins but loses named-class cases. Other resources, NPC
hunger/population, equipment and progression remain in the raw23-metric
reports rather than being combined into a favorable scalar.

Fixed-window report keeps only complete paired calendars and lists missing
dates and competing endings. Complete pairs in the first2–30-day window:
capable56, maker53, merchant59, caregiver57; later windows thin further.
Conditional windows cannot erase real bearer deaths or community losses.

## Actual offers -> scores -> choices

The passive `scripts/lib/build-choice-observer.js` is the retained improvement.
deed-screen `--choices 1` records original evaluations and decisions; it
never calls buildScore, knowledge, RNG, clock or game telemetry additionally.
This matters because extra NPC evaluation can plan targets and consume luck.
Records tag actual onSheet versus nested target-planning evaluations, offer
IDs, held IDs, person/day, shared-brain result and actual player choice call.
Unscored later sheets do not inherit old scores. Cap5000 per run with explicit
dropped; zero drops in all retained replays.

Sixteen merchant campaigns per arm match their balanced result rows and full
gameplay hashes exactly. Both roots also have a same-current-observer seed7
off control. Counts:

| Merchant16 | Baseline | Candidate |
|---|---:|---:|
| Player Hoarder / Haggle offer appearances |0 /1|8 /25|
| NPC Hoarder / Haggle offer appearances |1 /0|34 /51|
| Sampled player/NPC holders of either starter |0 /0|0 /0|
| Paid-trade deed credits |31|32|
| Total logged decision records |650|669|

Candidate starter-containing actual calls:32 player choose/keep +74 NPC
buildDecide =106; zero starter picks, nine keeps. Exclude duplicate player
buildDecide records from this count. These are calls, not106 people or
necessarily unique calendar-day opportunities. A sheet containing both
starters contributes two offer appearances and one choice call. A pick is
intent, not proof of installation; held samples/callers are separate evidence.
Normal chooseAbility returning null does not mean a failed transaction.

Concrete actual evaluations:
- Merchant7 day37: Battlefield Grace15.5, Haggle4, Leech6. The player chooses
  Battlefield Grace while holding Translator, Scream Cheese, Mending Hands,
  Lifeline.
- Merchant42 day39: Loud Chewer8, Crowd Favorite5.5, Haggle3.5. Loud Chewer
  replaces Scream Cheese.
- Merchant7 day70, resident Hannah: Cornucopia16, Translator1.5, Haggle2.
  The shared brain chooses Cornucopia. Nested planning scores are recorded
  separately and are not presented as the offered scores.

This locates the sampled selection bottleneck. It does not show that the
brain ought to choose Haggle over a productive existing build, or justify
forcing picks/boosting strength to manufacture a class. Next compare an
explicit on-sheet Miser strategy and real economic opportunities/costs.

## Representative tails, with full-state replay proof

Additional capable/maker seeds1,11,18,20 in both roots match all16 balanced
rows/hashes. Combined with merchant16 per arm,48 observed replay rows plus
two off controls are retained. All115 win/community transitions are listed;
the selected tails do not claim exhaustive causal investigation of them.

- Capable1: baseline two combat deaths, three bearers, lesser Table win90;
  candidate initial bearer remains through148, no class or Table ending.
  Fewer deaths and fewer wins describe different aspects of this outcome.
- Capable11: baseline dehydration death after108, successor resolves a
  lesser Table ending110; candidate original Showrunner remains through149
  and has no Table event. The baseline Relay failure followed by a lesser
  Assimilated resolution is the documented downgrade model (TABLE.md §1),
  not automatically a contradictory win flag.
- Maker18: baseline original Showrunner through128, community loss128;
  candidate first bearer ends34 with combat death, successor Gardener remains
  through149, no Table event. The community ending improves while bearer
  survival worsens.
- Maker20: baseline one bearer through92, community loss; candidate first
  bearer ends23, later several successors and three recorded combat deaths,
  but remains a surviving community through147.

These are measured trajectories, not proof that one displaced ability alone
caused the ending. Changed choices/IDs/later RNG tails can propagate broadly.
No enemy, hunger, death or price parameter was tuned to recover a result.

## Checks, source recovery and reproduction

Rejected-candidate offer proof:6 pass; frozen baseline3 pass/3 fail. It uses
real player and NPC sheets over the five actual thresholds for a prepared
lawyer's authored Miser/Socialite lean, then actual pumpLevelUps/chooseAbility
and the working600-price caller. An initial test assumption that every
shaped sheet remains inside the first six was false: existing bounded role
look-ahead can pull Crowd Favorite from7. Correct the test's model rather
than changing that runtime. The committed experimental proof stays outside
the green-list suite and intentionally fails three candidate expectations on
the restored baseline. It does not assert natural class viability.

Candidate quick166/166, full938/938. Final restored game + new observer:
quick166/166, full938/938, including nine meaningful observer assertions
covering transparent real decisions/state, original call counts/returns,
restoration, explicit truncation and stale-score exclusion. No quarantine or
weakened gameplay assertion. No new UI/feel claim for a discarded kit change;
the published Haggle contract's earlier actual mobile proof remains valid.

`miser-access-sources.json.gz` references the prior `haggle-sources.json.gz`
after arm, with only candidate tracks.json replaced. The retained game arm
is before; the package validates current final game sources against it.
It includes current observer, shared kit, proof and observer-test contents.
Reconstruct both roots from that source chain; do not mistake the current
restored checkout for the candidate. Raw flags/Node/config/source manifests,
screen/confirmation panels, controls, replays, windows and checks are retained.

```text
node scripts/balance-panel.js --root <root> --out <arm> --n 16 --par 6
node scripts/balance-panel.js --root <root> --out <arm> --n 64 --par 6
node scripts/balance-panel.js compare --before <before-panel> --after <candidate-panel> --out <report>
node scripts/godpath/deed-screen.js --root <root> --n 16 --policies merchant --choices 1 --par 4 --out <replay>
node scripts/godpath/deed-screen.js --root <root> --seeds 7 --policies merchant --choices 1 --observe 0 --out <off>
node evidence/2026-10-15/miser-access-offer-proof.cjs <candidate-root>
node scripts/godpath/test-build-choice-observer.js
```

Miser strategy/value, NPC integration, eight fitting god deeds, broader scale
and natural Finale/Network coverage remain open. Muse's regional lane is
unchanged. The roadmap goal remains active.
