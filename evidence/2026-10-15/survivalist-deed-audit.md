# A fitting Survivalist deed — 2026-10-15

Codex godpath lane. This completes the first authored outcome deed, not the
whole ten-god roadmap item. Nine gods still use their existing proxies until
their own real outcome hooks are implemented and measured.

## Behavior

Unkillable now requires the holder's own Second Wind, Molt or Ember Heart to
actually avert a fatal hit, then a later day alive. A class held for ten days
and even every path synergy cannot substitute for that deed. Day 80, the
recognized path, four magic abilities and the selected subclass payoff still
apply. The Table remains independent of godhood. Already recognized gods
are preserved; old saves get no fabricated past feats.

The new `god.deed` record is authored in godpaths.json and read by the same
Godhood closeness model for both roles. The runtime records the real success
in `village.godpathDeeds[actualPersonId].death_refused`, with the day, ability
and scene. It is a per-person record shared across the bearer/NPC boundary:
no predecessor progress is copied into a successor, and an NPC successor
keeps the deed they actually earned. A living person leaving Haven retains
their record; roster membership is not the deed. Death still fails the
alive requirement.

Player receipts follow the real fatal-hit result and actual Second Wind /
Molt use-counter changes, or the paid Ember Heart branch. NPC Ember Heart
receipts follow the actual lethal-hit battle hook; off-screen Second Wind
and Ember Heart use the field engine's actual lethal-hit hook. No credit
from tapping an automatic ability, gaining XP, assembling a kit, merely
holding a passive, an unfunded Ember Heart, or a pending borrowed Phoenix
link. Lifeline's ally rescue has no receipt hook for this self-refusal deed.
The class Phoenix Clause is not a qualifying receipt in this first version:
its delayed rescue would need its actual completed resolution, not a pending
promise. Undying has its Second Wind/Molt routes; Furnace has Ember Heart.

All prior costs remain: Molt loses equipment, Ember Heart burns food, and
starvation Second Wind prints no food. A noncombat starvation refusal can
record the feat, but the same day is too early and dinner is still required
to survive afterward. The food economy was not changed.

## Visibility and parity limits

The actual You / Tracks renderer shows the objective after the class is
named, with pending and fulfilled progress. The text avoids naming unknown
abilities, is escaped by the renderer, and hides unfinished objectives for
already recognized gods. The System's build guide now requests the real
outcome instead of recommending an obsolete synergy for this god. Other
classes' hints are unchanged.

This wires all currently implemented qualifying outcomes. It does not claim
to finish the separate full passive-parity audit: foreground NPC Second Wind
and NPC Molt are still missing activation routes in the older combat code.
Off-screen Second Wind and foreground/off-screen Ember Heart are wired and
proven. Do not present the new shared deed predicate as proof that every
Survivalist passive already has player/NPC activation parity.

## Runtime proofs

`test-survivalist-deed.js` uses one shared seeded harness, prepared builds
and real public damage, death-refusal, combat, off-screen fight, save/load,
succession, removal and dawn actions. Its storage fixture is an in-memory
Storage adapter for the actual save/load engine. Assertions cover:

- old saves, every legacy synergy and aged classes cannot invent the deed;
  reads leave the missing ledger absent;
- healthy retries, absent food and pending Phoenix rescue do not fabricate
  outcomes; the System guide states the new objective;
- actual Second Wind, Molt and player/NPC Ember Heart successes retain their
  prices, and a real off-screen fight reaches the Second Wind receipt hook;
- same-day refusal is insufficient, dead holders fail, a real later dawn
  runs the actual ceremony, and old recognized gods remain recognized;
- actual save/load retains the pending receipt, two real successions retain
  only each person's work, and actual exile preserves a living holder's
  accomplishment while their later death fails the alive requirement.

`test-deed-hint.js` executes the actual app.js Tracks renderer against the
shared game and checks unknown class, authored objective, pending/fulfilled
progress, escaping and old recognized gods. Prepared tests are not natural
ascension rates or campaign wins.

`check-wired.js src/js/godpath.js`: 89 functions, **0 unwired**.
`validate-ontology.js`: **111 systems validated**; the generated ontology
includes the two public readers. The data contract validates executable deed
requirements. No test quarantine or relaxed existing assertion.

## Actual phone check

Browser at 390 x 844, fresh local origin `127.0.0.1:43922/?debug=1`. Existing
Overtime x3 scene, completed the System introduction, chose Iron Gut, then
used the existing debug UI to grant Feast Engine and Deep Reserves. These
are three prepared Survivalist abilities, not an earned natural build.
Teleported to Haven through the existing debug control, used real Wait,
Wait, Sleep, and at day 101 the dawn hook named Furnace of the Unkillable.
Opened You, collapsed Equipment, and verified the class and objective
wrapped visibly in Tracks. Screenshot: `survivalist-deed-phone.png`.
No warning/error console entries. No hidden game state was mutated through
browser evaluation. The temporary viewport was reset, tab closed and owned
server stopped.

## Measurement provenance

The matched baseline is the published `deed-after-64.json.gz` from the
preceding audit: 64 seeds x four standard policies x 150 driver days. Its
recorded game/policy/observer hashes match the frozen source from commit
543406bf, except the same two verified CRLF/LF byte-only script differences.
Although that report's sourceHead is the earlier HEAD from before the Relay
commit, its recorded godhood.js hash is the repaired version included in
543406bf. No old pre-repair baseline is substituted.

The current observer additionally retains actual `godpath_deed` telemetry.
Old reports did not capture this event; do not infer a historical absence of
actual death refusals from a missing old field. New receipt events share
the triggering action's existing telemetry timestamp, avoiding an extra
Date.now() draw that would shift deterministic IDs unrelated to ascension.
Observer-on/off gameplay parity is checked by the existing 150-day proof.

An initial natural screen was explicitly stopped before completion when
review found an unnecessary roster-membership restriction in the deed
reader. No partial output from it is used as the final comparison. The
final screen runs the corrected person/alive rule. Reproduce with:

```
node scripts/godpath/deed-screen.js --n 64 --par 6 --out evidence/2026-10-15/survivalist-deed-after-64.json
node scripts/godpath/test-survivalist-deed.js
node scripts/godpath/test-deed-hint.js
node scripts/godpath/test-deed-observer.js
```

Raw natural report is retained losslessly as gzip, with compact comparison,
source hashes and final validation in `survivalist-deed-validation.json`.

## Final matched result

| Policy | Wins before / after | Seated before / after | Median day before / after | Player deaths before / after | Unkillable ceremonies before / after |
|---|---:|---:|---:|---:|---:|
| capable | 41 / 41 | 55 / 55 | 90 / 90 | 93 / 93 | 2 / 1 |
| maker | 18 / 18 | 25 / 24 | 116 / 116 | 64 / 63 | 1 / 0 |
| merchant | 10 / 10 | 22 / 22 | 123.5 / 123.5 | 43 / 43 | 3 / 0 |
| caregiver | 21 / 21 | 30 / 30 | 123.5 / 123.5 | 49 / 49 | 1 / 0 |

Each row is 64 matched campaigns. Total Table wins remain **90/256**.
Standard driver rows match exactly in **249/256** pairs; ascension lists
match in **250/256**. Whole-state equality is not expected: real receipts
and their telemetry are new state, and fewer ceremonies can alter later
play. This is not a survival buff or a claim of unchanged trajectories.
Player-ascension campaigns remain 27/64 capable, 34/64 maker and 31/64
caregiver; merchant changes 37 to 36.

Actual Unkillable ceremonies fell **7 to 1**: the old panel had five NPC and
two player ceremonies; the new panel has one player ceremony. Two natural
Ember Heart receipts were observed (capable seed 46, day 90; merchant seed
57, day 128). No Second Wind/Molt receipts appeared in this panel. This is
sparse usage, not proof those abilities are dead for a human. It increases
the priority of class access, passive activation parity and focused build
playtests; do not use the prepared tests to claim healthy natural coverage.

A standard-driver seed-46 trace confirms the exact live record: bearer
`gen_a0s5v5z` used Ember Heart on **day 90** and was recognized Unkillable
on **day 91**, with no kit/XP injection. The campaign ended at day 112 and
did not win. The trace is an end-of-run read-only `extraMetrics` snapshot of
`scholar.godhood` and `village.godpathDeeds` via `runComparison` (capable,
seed 46, 150 driver days). `survivalist-deed-seed46.json` retains the source
hashes and raw standard row. This establishes one natural earned ascension,
not a winning Survivalist campaign.

Final checks: quick **142/142**, full **914/914** (207 seconds), prepared
runtime **27/27**, actual Tracks renderer **6/6**, observer parity **4/4**,
data **66/66**, ladder **25/25**, ontology **111**, godpath unwired **0**.

Design/feel needs Steve's eyes: the actual ordeal is deliberately narrower
than passive class age; deliberate injury is not necessary to obtain gear
or reach the Table. No autoplay was added to seek self-harm for the deed.
Nine fitting god deeds, class diversity/access, and the missing NPC passive
activation routes remain active roadmap work.
