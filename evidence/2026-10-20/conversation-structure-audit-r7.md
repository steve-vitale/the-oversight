# Conversation structure repair — source-frozen r7

Development candidate on `codex/conversation-structure-20261020`, based on Muse's
`a4404566ccfee345813469a842b1994b9083cc2b`. Remote main/master were read back at
that cutoff during this task. This is not a deployment or a public-release verdict.
Steve's subsequent report of missing favor execution is a follow-on contract audit;
r7 does not claim that promising a favor performs it.

## What changed and why

The actual emitted NPC beat owns replies. A generated but rejected curious
opener cannot attach its unanswered question or spend its question ledger.
Fallback emission retires unspoken asks. The final menu filter preserves one
question, invitation, price or substantive want through all additive injectors.
An ambush replaces the old question before its budget can trim RUN/TALK/FIGHT.

Menus cache offered wording across rerenders and paging. The outer handler
records the actual selected words, including gesture/invitation/confrontation
shortcuts. Topic continuations describe their generic continuation handler;
they no longer promise specific answers such as When/Who told you. Earned
help, teaching, trade and other practical verbs remain reachable through an
explicit subject change. Selecting injected topics closes the topic selector.
An exhausted topic offers a pivot/exit; goodbye does not retain topic replies.

Rhetorical/self-answered/name-echo questions no longer fabricate answers.
Wellbeing, reason-for-asking and day-count questions receive their own choices.
General yes/no acknowledgments assert no shared visions or secret knowledge.
Required acknowledgments, commitment confirmations and live refusals cannot
be replaced with ledger amnesia; random semantic closers no longer contradict
generic answer reactions. A stale Help action on a settled favor says it is
handled without reviving its need or rewarding a new help attempt.

All 36 authored formal-question families were source-reviewed as question ->
answers -> reactions -> follow-up -> recall. Four incoherent contracts were
repaired together: q_guilty, q_read, q_teach_me, q_name_day. The named-person
callback stays general for legacy saves; the game no longer invents a named
person or completed lesson from an abstract option. See the authored review JSON.
Piper and device fallback receive only complete quoted NPC speech. Explicit
persona speech stays voiced through its existing persona API. Voice tests
verify payloads/gates, not acoustic quality or a physical phone's audio.

## Muse reconciliation

The earlier repair started at a39; discovering a440 required a focused port.
Seven JavaScript modules plus characterGen.json are the final runtime/content
scope. Preserve Muse's other runtime, progression, crisis, comfort, settling,
recap/silence exhaustion and gossip walk-down changes. The initial six-file
normalized three-way port had eight small conflicts in conversation.js, resolved
in favor of the new ownership/classification/cache/disclosure rules while keeping
nonconflicting Muse logic. His specific follow-up labels that called a generic
continuation were deliberately replaced with honest continuations. Gossip's new
`{line,sig}` result remains intact. No broad old-branch merge was performed.

## Broad sampling and reading

Before: 18 seeded worlds, 159 conversations, 1,424 exchanges. Final r7: 36
worlds, 324 conversations, 2,762 exchanges, including six held-out seeds.
Stages are 0/30/90 controller iterations; actual days/outcomes are retained.
Some campaigns terminate early. Interviews directly sample living roster
members, including remote people, and stop at 12 turns (83 remain active at
the limit). This is not proof all conversations ended, all NPCs were nearby,
or all later-game paths were played until death.

The same current sampler retains actual spoken lines, all real menu pages,
selected offered words and emitted replies. Mechanical counts before -> after:

| Diagnostic | Before | Final r7 |
|---|---:|---:|
| Unseen generic ask | 20 | 0 |
| Formal stem mismatch | 14 | 1 |
| Selected words changed | 525 | 0 |
| Topic replies after closing | 154 | 0 |
| Unrelated choices during generic question | 57 | 0 |
| Paged label drift | 0 | 0 |
| Unknown spoken context | 1,128 | 0 |

These are diagnostics from different trajectories and sample sizes, not effect
rates or a prose-quality score. Read all 36 stratified exchanges plus each flag.
The one retained final flag is a checker false positive: Ingrid asks "When's
the last time you really laughed, friend?" and offers q_laugh_memory answers.
The added vocative interrupts exact stem matching; the question is correct.
The raw flag is preserved, not deleted to report zero.

Manual review found defects the counters missed, including inappropriate
shared-vision acknowledgments, rhetorical where-was-I, evasive day answers,
contradictory random closers and the guilty/named-person/lesson contracts.
Generic resume phrases and voice decoration elsewhere remain uneven. Some
phone menus still show one choice with a pager. This repair is not blanket
clearance of every line, dialogue layout or favor execution path.

## Native phone evidence

Final r7 has six loopback, touch-controlled headless Edge journeys at 390x736
and 390x844: 33 dialogue checkpoints, 16 ordinary/Deer frame checkpoints, and
5 paid resident-commerce checkpoints at each height (108 total). Dialogue
covers an actual old-save question, deferred disclosure, knowledge price and
decline, ordinary exit/Continue, wellbeing/rumor requests, and prepared
plan/name/secret/reason/tag/wellbeing scenes. Only saved scene setup is prepared;
recipes select real rendered controls, with trusted touch events and no Game
outcome-helper calls. Inventory, equipment and kcal survive the tested Continue.
The commerce route spends real food, receives/equips the stone knife and
preserves its real practice/stock state through Continue.

The source-bound frame proof validates all 164 expected inputs and both phone
sizes. Some duplicate CDP response-body captures fail; the receipt validator
still requires a valid matching capture for every expected input. Do not call
that network-error-free or claim browser-console coverage: this driver does not
collect the console. Retained screenshot sets are in conversation-native-r7.
This is neither physical iOS/Android nor installed/offline lifecycle clearance.

## Balanced investigation

One current observer and contract ran both roots, with unchanged current
controllers/harness: 16 matched seeds each for capable/maker/merchant/caregiver,
150 controller iterations, 64 played rows and four observer-off jobs per arm.
All sampled neutrality pairs pass; source stability and unknowns remain in the
panels. Before -> after wins: 16->14, 9->11, 7->6, 5->12. Full all-23-metric
scorecards and both feature censuses remain review_required, with the watches
and NPC-class signal recorded in SURVIVAL-LEVERS. More wins clear no warning.
No food, HP, damage or difficulty compensation was introduced.

Thirty exact selected pairs (4 capable, 7 maker, 9 merchant, 10 caregiver)
include every win flip in either direction plus the largest adverse deaths,
hungry-NPC and earned-gear case per policy. Every pair reproduces full final
state, outcome and all metrics with zero captured observer/warning failures.
Early daily trust/build differences are associations, not a causal chain to an
ending. No small-effect or pacifist viability claim is supported by this screen.

## Verification and repeatability

Focused spoken-context assertions: 67; answer/trade context: 17; voice boundary:
5; prepared actual social scenarios: 75. All pass individually. Ontology validates
119 systems. Full/quick final receipts are retained alongside this note.

Legacy tests were updated to navigate actual offered pages/subject changes and
to emit their prepared scene's spoken beat rather than setting stale lastBeat.
Invitation tests wait behind real primary needs. The gossip test preserves the
new signature result. Press-dry checks real newly found evidence, allowing the
current wording. Voice fixtures supply quoted NPC speech. Two callback tests
now assert the corrected meaning and prohibit the old invented history.
The seed-voice test adds a deterministic prior wound-ask control through the
real details/leave/seed/resume flow, rather than depending on weighted exposure.
The founding control supplies the inherited village real prepared rations so
an unrelated famine does not end a seven-day transition test; it grants no days
or founding completion. Ambush loss and settled-Help defects were runtime fixes,
not assertion removals. No tests were quarantined and no green-list entries
were removed. Initial red logs are retained for these dispositions.

CONVERSATIONS.md documents the shared sampler, reviewer and real-menu test kit.
New godpath tests run automatically in check.js. Future work must preserve Muse's
latest behavior and revalidate runtime source changes; scripts/balance-proof.json
and scripts/phone-frame-proof.json are refreshed only from real current receipts.
The baseline/candidate source overlays restore onto a440; the source-bundle
script states what is and isn't bundled. Panels, raw case caches, full compressed
transcripts, configs, source identities, plans, exact replays and native receipts
are retained. Earlier a39 and current r1-r6 runs are intermediate only.

Final full check: 1,032 passed, zero failed (196 seconds), retained in conversation-current-full-final-r7b.log.
