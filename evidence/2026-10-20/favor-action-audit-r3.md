# Favor follow-through audit — final source r3, 2026-10-20

## Scope and source

Local branch `codex/conversation-structure-20261020`, following conversation
repair commit `3329c74bf`, which reconciles Muse cutoff a4404566. No other
agent's runtime edits were overwritten; remote main/master still read back as
a4404566 during final verification. This is a development candidate, not a
production deployment or public-release clearance.

`favor-source-final-r3.json.gz` retains all 267 source inputs and the unchanged
observer/contract/replay boundary sources as an overlay onto a4404566. Restore
it onto that checkout; do not treat the source bundle as a full assets archive.
Runtime was frozen before final panel, native receipts and full verification.
The earlier favor r1/r2 panels and phone attempts are intermediate, not final
proof. The r7 audit remains historical evidence for the preceding repair.

## Reproduced structural gap and correction

The eight favor definitions generated requests, commitments and deadlines but
had no shared readiness/action contract. Their menus offered conversational
help/promise/refusal without executing the requested deed or explaining missing
resources. Generic `checkPromises('task')` from any assignment could keep a
specific creek trip, snare job or watch shift; unrelated chat/food could stand
in for overnight company or a joint outing. Comfort could stand in for a wound.

The shared `convoFavorAction` query now determines available action, cost and
blocker. Menus expose an action when executable and a requirements explanation
even when blocked. Dispatch rechecks death/combat, living recipient, node,
Haven side and adjacency. The same spoken menu updates when resources/readiness
change. A completed deed cannot be repeated. Readiness is tested read-only.

- Food: canonical `giveFood(vid, 'meal')`, up to three actual edible pack units,
  its ordinary short action, partial hunger relief explicitly acknowledged.
- Wound/illness: canonical `tendVillager`, 32 ticks (roughly half an hour),
  existing time costs and real HP/recovery changes. No invented ability gate,
  no instant-cure claim. Its null success return is handled correctly. Death or
  combat blocks care; the canonical method also aborts after death during time.
- A promise is future intent. The executable deed remains offered immediately
  after committing and on later reminders. Keeping a typed favor requires the
  corresponding food/wound/illness receipt. Wrong-recipient actions and words
  cannot keep it. A treatment with no benefit cannot keep illness-care favors.
- Requirements/cancellation are interface narration, with no fabricated NPC
  quote or generated voice reading. They do not mark a conversation substantive
  for a words-only payout. Request/promise voice styling cannot append unrelated
  questions or contradictory semantic mannerisms.
- Details are offered once per live explanation, then retire. Recorded selected
  words still match the actual offered labels.

## Explicit unfinished jobs

Creek hauling, joint snare repair, watch handover, overnight company and joint
foraging have no canonical playable joint action. The menu names the missing
action and does not offer a new unkeepable promise. Old open obligations can be
closed with no reward/penalty; unsupported open jobs do not expire into a
penalty. This is disclosure and safe handling, not completed gameplay for those
five jobs. ROADMAP and CONVERSATIONS describe the requirements for implementing
each. No free water, food, delegated work or survival buffs were invented.

## Tests and actual mobile flow

`test-favor-action-contract.js`: 50 assertions, all eight kinds, executable and
blocked menus, real material/HP/recovery effects, replay refusal, wrong generic
events, old-job expiry/cancel, query purity, real fight and stale distance/death.
It uses the shared kit and prepared needs, then actual offered menu navigation.

Prepared native touch at 390x736 and 390x844 uses the retained played save,
explicit nearby actors/needs and actual UI buttons. Per size, 10 checkpoints:
request, explained half-hour care, real HP 40 -> 65, fulfilled favor, exit and
native Continue retaining both; no-food pack-versus-pantry explanation; missing
joint creek-trip explanation; clean exits. The browser grants no response,
fulfillment or stat outcomes. Final receipts `favor-phone-*-final-r4.json`.

The ordinary/Deer frame recipe also reruns on the final source at both sizes:
16 checkpoints each, including zero-move Wait and actual escape. The updater
validates all 164 current boot inputs and fresh frame proof. Some duplicate
CDP body captures failed; at least one valid matching capture covers every
expected input. Do not call this a network-clean or console-clean certification.
The favor recipe's page-error arrays are empty. Final PNGs are retained in
`favor-native-final-r3/`. These are desktop native touch, not physical-device or
installed-offline validation.

Ontology: 119 systems validate; convo-wants has 101 functions, zero unwired.
Quick: 261 passed, zero failed. Final full check: 1,033 passed, zero failed
in183 seconds (`favor-full-final-r3b.log`). The prior full run caught a
synthetic `injury` favor kind; the rot-line fixture now uses actual `heal_help`
while retaining all wording/deadline/consequence assertions.

Legacy fixture repairs preserve their original invariants: supported favor
fixtures replace unimplemented/missing-kind synthetic jobs for maker/rot;
water tests assert a concrete unavailability explanation instead of a hollow
commitment. Outbreak tests recognize the actually offered details engagement;
seed-grammar tests prepare unresolved comfort/news when the natural want lottery
does not cover them. The words-only probe excludes actual teaching/physical
actions; its trust ceiling remains 40. The corpse identity test removes knives
earned during its campaign lead-in before adding exactly two prepared identities;
its two-slots/same-object assertions remain unchanged. No quarantine/green-list
removal or weakened numeric assertion was used.

## Broader conversation sample and remaining limits

Final source: 36 worlds, 12 seeds (six development, six held out), 319
conversations, 2,727 exchanges. Requested controller stages 0/30/90 reached
observed day 92 at most; 79 interviews remain active at the 12-turn cap. Living
roster members are sampled directly, including remote people; that is not a
nearby mobile availability claim or a play-until-death campaign.

All 36 stratified exchanges and every automated flag were read. Zero unseen
generic questions, unknown spoken contexts, selected-word changes, paged-label
drift, closing-topic replies or question-focus leaks. One formal-stem flag is
the same reviewed false positive: seed11 Ingrid's laugh question gains the
vocative `friend`; the formal question and offered answers agree. Keep the flag
and source exchange; do not manually relabel it zero. Automated invariants are
not a semantic-quality oracle and different sample totals are not effect rates.

Remaining manual findings: some non-favor DNA closers contradict the emotional
content (`Not that it matters`, `Anyway, that's me`); some generic memories say
`Still on ...`; gossip callbacks ask whether the player wants to hear a story
but answer Yes with a generic acknowledgment (seed23 Petra and seed2026 Nina,
stage30). These are explicit follow-on content/response-contract gaps, not
cleared by mechanical zeros. The dated r7 catalogue review of all36 formal
question families remains applicable; these final findings prevent claiming
all conversation prose or all response functions are fixed.

## Balanced screen and decision

64 observed runs plus four observer-off controls, 16 matched seeds per
capable/maker/merchant/caregiver, 150 controller iterations. Source stable, all
four neutrality controls match, no observer warnings. All68 raw jobs retained.
The same current observer/harness/policies are used for a440, r7 and final r3.
Both `favor-balanced-a440-to-r3` and `favor-balanced-r7-to-r3` retain all23
metrics, coverage and unknowns. This is a screen, not confirmation-sized or
pacifist viability evidence.

Wins per16: a440 -> r7 -> favor-r3 are capable16 ->14 ->15, maker9 ->11 ->7,
merchant7 ->6 ->10, caregiver5 ->12 ->6. These numbers are investigation
triggers, never an automatic quality or regression verdict. SURVIVAL-LEVERS
records the survival/community/progression/gear watches and changed day60
eligibility; no better outcome offsets another warning. Decision remains
`review_required`. Retain the correctness repair for development review; no
numeric survival lever compensates for removed false promise credit.

Exact replays select every r7-to-r3 binary win flip and each policy's largest
adverse deaths/NPC hunger/earned-gear change: 4 capable, 10 maker, 10 merchant,
12 caregiver pairs (36 total). Verified completion and coarse first differences
are recorded below. They establish reproducibility, not the causal route from
a particular line or promise to a final ending.

All36 selected replay pairs completed with exact state, row, all23 metrics, warnings and observer checks true on both roots. First coarse daily differences span day3–23, primarily trust, with some needs/HP/pantry changes. Different campaign lengths leave unmatched later boundaries; these are retained, not silently aligned by index. All four replay processes exited0.
