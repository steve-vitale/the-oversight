# Honest coalition recruitment before the Network bot

Continuation of the full roadmap and dead-feature audit. This repairs a
prerequisite for the planned capable titan/Network seeker; it does not claim
that bot or a natural full campaign is complete. No push or release.

## Verified blockers

Generated maps have 3–4 foreign villages (`genVillages`). The call took two
people per village, plus at most three explicitly committed Haven members:
9–11 blades. Nielsen needs 12; the Finale and Network need 20. Without another
source, these gates were structurally unavailable to an honest first call.

Repeated calls appended the same roster identities again. The gate counted
array length; the same people could become an apparent twenty-person army.
The old selector also treated young children as available foreign fighters.
Haven-only musters skipped upkeep, and fallen Haven members could remain in
the counting array. These are runtime issues, not evidence that a social or
logistics playstyle is inherently weak.

## Changes

- Ordinary allies still send two. Trust ≥70 and opinion ≥10 allow up to six
  free living adults from that village's actual roster. Numbers are in
  `titans.json` `_coalition`. The 10/12/20/20 titan gates are unchanged.
- A call fills only that village's earned quota with new identities. New
  recruitment excludes people already committed to another active army.
  The speaker is preferred, but nobody is invented to fill an empty slot.
- Readiness counts distinct identities. Calls, upkeep and injection normalize
  legacy duplicates. Actual donated item objects are merged onto the retained
  person; the lower HP is retained, so normalization never heals wounds.
  Existing named living recruits are retained for save compatibility; the
  adult selection rule applies to new foreign volunteers. Anonymous string
  placeholders are not people and no longer satisfy a gate.
- Haven still requires two explicit taps, names the volunteers and risk, and
  sends at most three. It counts only unique members still in Haven's roster.
  All musters pay the existing 1000 kcal/blade/day, including Haven-only forces.
- An understrength army keeps its call action, allowing improved ties to
  recruit additional people. Ordinary responses hint that closer bonds could
  bring more volunteers.
- The previously uncalled `finaleReinforce` is now on the public action list
  once the Finale march starts. It charges three trust per fire providing
  new people, not an empty-call fee. New identities determine this charge
  even when normalization lowers an old duplicated headcount. The Network
  still refuses reinforcements after its march starts and hides that action.

Rationale: reducing the twenty-blade gate would weaken the intended scale;
increasing all villages or inventing generic soldiers would change unrelated
world generation. Letting strong relationships mobilize more existing people
repairs the coalition route while retaining its food, trust and casualty costs.
The six-person choice is a design lever for review, not a measured natural
win-rate improvement.

## Matched capacity audit

`scripts/coalition-audit.js`, 16 identical seeds, ordinary and strong
relationship fixtures on each generated world, separate child processes.
Public `soundTitanCall`, two-tap `titanCommitOwn` and `titanDawnTick` run for
real. Relations, located-threat knowledge and abundant upkeep food are
prepared. The source manifests pin all three changed runtime/data files.

```text
node scripts/coalition-audit.js --label before-16 --n 16 --root .git/coalition-before --par 4
node scripts/coalition-audit.js --label after-16 --n 16 --root .git/coalition-after --par 4
```

| Relationship fixture | First call ready before → after | After four calls | Duplicate entries after four calls | Child entries after four calls |
|---|---:|---:|---:|---:|
| ordinary | 0 → 0 /16 | 16 → 0 /16 | 342 → 0 | 100 → 0 |
| strong | 0 → 15 /16 | 16 → 15 /16 | 342 → 0 | 100 → 0 |

Duplicates/children are **entries summed across sixteen armies**, not unique
people or natural-run prevalence. Previously, all worlds' ready predicates
could be fooled by four calls. Now one world still lacks enough available
people even with strong ties: the game does not fabricate the missing bodies.

Raw files: `coalition-{before,after}-16.{json,md}`. This proves recruitment
capacity and its costs under prepared relationships, **not natural diplomacy,
food affordability/carrying capacity, combat success or THE HOSTS probability**.
No small balance-effect claim is made from sixteen prepared worlds.

## Public-action proof and phone playtest

`test-coalition-recruitment-20261015.js` uses the shared harness. The same
22 assertions produce 5 pass/17 fail on the frozen baseline and 22 pass/0
fail on the fix. It proves real generated adults, unchanged gate, two-tap
Haven commitment, repeated-call identity, cross-army recruitment exclusion,
legacy donated gear/HP retention, new volunteers after stronger ties, dead
roster exclusion, Haven upkeep including a real Haven death, public action
availability and actual reinforcement trust charges.

Three old combat fixtures used anonymous strings such as `'ally0'` solely to
bypass the gate. They now prepare named objects with distinct IDs, HP and
equipment arrays. The grid, kit and blitz assertions remain intact:
`test-titan-12x12.js`, `test-titan-variety.js`, `test-blitz-wave35.js`.

Phone browser, 390×844, actual self-action controls:

1. Prepared ordinary alliances and a located Finale in a generated world
   selected to have sufficient potential volunteers. No muster was injected.
2. Clicked Sound the call: six foreign people answered.
3. Clicked Commit Haven, read the names/food/death warning, then confirmed:
   three Haven volunteers joined (9 total).
4. Prepared stronger relationship values, clicked the still-available call:
   seventeen distinct foreign people plus three from Haven (20 total).
5. The call action disappeared once the army was fieldable.

`coalition-twenty-phone.png` shows the live named response and prepared-fixture
counter. This is a UI/action-chain proof, not evidence that the fixture earned
its relationships or defeated the Finale. Server stopped, tab closed and
viewport restored.

`check-wired.js` reports 40 functions/0 unwired in `titans.js` and 36/0 in
`finale-campaign.js`. Public reinforcement is now a real runtime caller.
Final verification commands and hashes are in `coalition-validation.json`.

## Next required work

- Build the capable titan/Network seeker: diplomacy, food logistics, visible
  omen pursuit, real local approach, outfitting and coalition-aware combat.
  The existing greedy bot merely waits at the Table; it does not do this work.
- Play the Finale and all nine Network nodes through real combat, maintaining
  casualties, food, camps, the heart floor and the no-reinforcement Network
  rule. Prepared state-machine wins are not a campaign playthrough.
- Then measure natural recruitment and campaign outcomes with matched screens
  and 64 seeds for small effects. The current capacity audit cannot price the
  new trust/opinion thresholds or establish that twenty blades survive.
- Audit remaining coalition details, including actual armor-stat handling in
  outfitting and legacy conflicts where older saves already assigned one
  person to different armies. New calls prevent that conflict; this patch
  does not claim a complete migration audit of every old campaign state.
- Continue the original region/coda/deed/scale-effect/nomad/art/job roadmap.
  The goal remains active with its full scope.
