# Introductory knack policy correction and reactor progression conflict

2026-10-15. Baseline c347195f. This is a policy experiment, not a game balance
change. The public runtime and original capable policy remain in place. The
experimental correction is retained with exact sources and failed checks;
it is not silently adopted, quarantined or made green by weakening a test.

## Finding and candidate

setupGame correctly leaves decisions to the policy. It generates the roster,
starts the game and departs. The game has a real pending three-choice
introductory knack, but capable and its derived policies never answer it.
The Node loader itself should not make a build choice for every idle policy
or prepared fixture. The earlier description of this as a shared setup bug
was too broad: it is a missing policy decision.

The candidate adds chooseKnack to capable setup, upkeep and daily. It reads
liveKnackChoices, scores only shown entries with public buildScore using
onSheet:true, chooses the stable highest score and calls public chooseKnack.
It checks the resulting held ability and chosen flag because the public
method returns null on success too. The guard respects actual slots and
keeps a full sheet pending; no slots, abilities, knowledge, XP or items are
granted by the controller. Ordinary System sheets, shared/NPC build scoring,
runtime, all data, idle and legacy policies are unchanged. Derived merchant,
maker, caregiver and both Miser preferences inherit the choice.

The prepared shared-harness proof passes13 assertions: real pending sheet,
shown highest score, no off-sheet scoring, actual latent grant filling the
sole pre-System slot, unchanged time/gear/NPC abilities, repeated-hook
idempotence and truthful counters, full-slot refusal/retry and five derived
setups. The first draft test incorrectly expected a spare pre-System slot;
the actual engine has one slot. The corrected assertion requires that exact
one slot to be filled. No game behavior was changed to satisfy it.

## Matched policy screen

Two frozen source roots use the same game, parent observer, contract, seeds,
origin, flags, Node and150-day cap. Sixteen matched seeds for each of capable,
maker, merchant and caregiver:128 campaign rows,16 on/off control jobs.
Only capable.js changes in the207-file measurement fingerprint; the new
proof script is retained separately. All result-cache digests are checked.
Sources stay stable and observer controls match rows and full collector
hashes without warnings/errors.

| Policy | Wins before→candidate | Player deaths | Community lost | Original bearer through60 | Named class cases |
|---|---:|---:|---:|---:|---:|
| capable |12→9|18→19|3→4|9→11|13→12|
| maker |8→8|12→12|4→3|14→12|13→12|
| merchant |3→7|14→13|5→4|14→15|14→14|
| caregiver |6→7|14→10|7→3|12→16|13→13|

All16 per policy in either arm earn tier3+ gear; craft/trade tier3+ remains
unobserved. The summary retains known counts/totals for every metric, not
only this selected table. This small screen has no confirmation, independent
holdout, causal attribution for each outcome or optimal-human claim.
Knack selection changes later offered/held builds and game history: do not
call it an isolated ability-strength change or explain every death by it.

The strict game-only comparator returns **invalid**, specifically
Policy/harness changed: scripts/policies/capable.js. That rejection is retained
unchanged. The separately labelled summary is descriptive policy-revision
evidence, not a repaired or bypassed game-only scorecard verdict.

## Existing test failure and natural replays

The candidate quick check has167 passes and one failure: the existing
test-capable-bot-20261014.js requires at least one of seed42/1234 to earn
sentimentTaught plus feastSurgeUsed by40 days. Neither does. The assertion,
seeds, horizon and green/quarantine lists are unchanged. The candidate full
check has939 passes and the same one failure out of940. The narrow13-assertion
proof does not make the candidate green.

Fresh standard-driver40-day replays confirm both runs really pick a knack
and acquire an online reactor:

| Seed | Introductory choice | Reactor acquired | Actual feast-buff refusals |
|---|---|---:|---|
|42|Beast Calm|19|26,40|
|1234|Green Whisper|29|33|

Both learn sentiment but end with no feast-use deed. The public grant's
returned refusal explicitly names the reactor ceiling. Current tableSeat
also reports foodDeeds:false, alongside other unmet requirements at that
early day; this is not a claim food is their sole missing day40 gate.

The replay observer wraps public choice/grant/acquire methods, records raw
arguments/results and raw bearer/day, and does not query gates during play.
Each replay is rerun without that observer. The standard row and a diagnostic
state hash match. That diagnostic hash includes state and selected run/map
fields; it is not the canonical balanced collector's full-state hash. Gate
queries happen after it is sealed. The complete balanced panels separately
retain canonical full-hash observer controls.

The runtime's established reactor ceiling refuses new feast buffs, the
food-use deed requires a real buff use, and the installed reactor cannot be
removed. This makes earning the deed later with that current bearer a
progression concern. Succession, earlier completed deeds or a pre-existing
buff are separate cases. A win reduction alone did not decide this experiment.

## Decision and reproduction

Keep the candidate available as evidence while the food-thesis/reactor design
is resolved. Keep the original active policy and its known introductory-choice
omission documented. Do not lower Table gates, fabricate feast use, remove a
reactor, pick different test seeds or suppress the failing assertion.
Steve's question is recorded in docs/OPEN-QUESTIONS.md; other roadmap work
can continue. Survival levers and simulation instructions point here.

The reconstruction helper archives the exact baseCommit from the source
bundle into a fresh root, applies the candidate's two replacement files only
for the after arm, and checks canonical UTF8/LF SHA256 for replacements and
all207 manifest entries. Neither root needs a .git directory. Run from the
primary observer checkout:

```text
node evidence/2026-10-15/knack-policy-reconstruct.cjs before <fresh-baseline>
node evidence/2026-10-15/knack-policy-reconstruct.cjs after <fresh-candidate>
node scripts/balance-panel.js --root <root> --policies capable,maker,merchant,caregiver --n 16 --par 4 --out <new-panel>
node evidence/2026-10-15/knack-policy-summary.cjs <baseline-panel.json.gz> <candidate-panel.json.gz> <new-summary.json>
node <candidate-root>/scripts/godpath/test-capable-knack.js
node evidence/2026-10-15/knack-policy-replay.cjs <candidate-root> 42 on <new-replay.json>
node evidence/2026-10-15/knack-policy-replay.cjs <candidate-root> 42 off <new-control.json>
```

Run those proof commands from the candidate root when a script's ROOT derives
from its directory. The replay uses the explicitly supplied root. Retained
controls/sources/panels, invalid comparator, all-metric summary, replay pairs
and candidate/retained checks have artifact hashes in knack-policy-validation.
No player-facing release, master merge or Muse region/nomad change.
