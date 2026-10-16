# Living Garden: real recipients and a durable paid dawn

2026-10-16. **Retain, needs-eyes**, with mixed survival/progression/reward
directions. Base `ad45b1aefaf08943d47bac1c73f94ff6cc0caa1a`. This implements
the recipient/caster repair diagnosed in garden-recipient-audit.md. It does
not finish the Garden's army logistics or authored seven-day deed.

## Runtime contract

The shared feeding function now selects distinct known living people from
the existing Haven roster and excludes the actual caster. NPC daily casting
therefore includes a distinct living player. A meal fills the player to
min(fullLine,kcalCap), preserving any stronger reserve. Fullness is an explicit
needs-eyes interpretation: expanded combat-bank capacity is not a free gift.
Reactor bearers receive no food. Existing roster-wide scope remains; this is
not a new physical pantry-access or travel rule.

NPC Gardens must be known living roster members. Dead/unknown holders cannot
cast; duplicate/dead/unknown diners cannot inflate or manufacture recipients.
Without eligible recipients there is no payment or harvest marker, matching
the existing public player refusal. NPC need checks now read actual recipients,
including a player at/below half their fed line, instead of a fake NPC need
entry for the player. Village food-tier gating,200kcal/8hunger, strict
post-payment hunger80 refusal, player daily gate and shared NPC harvest day stay.

The first candidate fixed feeding but not ordinary dawn persistence. Core
endDay saved before godDaily. A manual save/load passed, but loading the
ordinary snapshot restored day86/1000kcal/harvestDay-1. The final NPC cast saves
after its payment, meal, telemetry and day marker settle: ordinary load retains
day86/2400kcal/harvestDay86, and re-entering the daily hook cannot pay/feed twice.
Save failures that throw are reported through the existing warning mechanism.

No physical food/inventory, harvest provenance, seven-day deed, feast-use
credit, HP healing, reward formula, combat price/stat, policy or measurement
contract changed. Existing saved spent-day markers are not backfilled with a
free meal. Caster dinner still costs real food. NPC reactor diets, general
god-action eligibility, fifty-mouth march consumption, contests and eight
authored god deeds remain separate work.

## Fixed experiment and accounting

208-input source manifests differ only in src/js/godverbs.js. Fixed16 standard
screen seeds and64 disjoint holdouts10001..10064 per capable/maker/merchant/
caregiver,150 iterations, Columbus/eastern woodlands. Policies, flags, harness,
collector, metric contract and Node revision match. Exact-source Table-entry
after panels/jobs are reused only after manifest equality.

984 retained campaign workers =328 prior baseline +328 new unsaved-draft +328
new final jobs:960 observed cases and24 observer-off controls. They are not984
fresh campaigns. All source stability, neutral row/full-hash controls and
warning/error checks pass. Screens, holdouts, draft and final remain separate.

The post-payment snapshot follow-up leaves all64 screen and256 holdout rows
and23-metric sets unchanged against the unsaved draft. Full hashes still differ
in21 screen/70 holdout cases. Save sequence remains part of the full hash;
it is not suppressed. A frozen maker10018 full-state pair differs only in
saveSeq1364->1368 after the existing pacing-diagnostic normalization. Preserve
all other full-state differences rather than assuming that sample explains all70.

## Mixed outcomes, not a win optimization

Both final comparisons are review_required. The holdout flags maker invitation/
entry regression_watch and win changes in capable/maker/caregiver. Other adverse
directions below remain visible even when below an automated tolerance.

| Policy (64 each) | Wins | Entries | Bearer deaths | Community losses | Player class | Earned T3+ gear |
| --- | --- | --- | --- | --- | --- | --- |
| capable |46->48|46->48|88->88|14->13|38->39|64->64|
| maker |21->19|21->19|86->84|24->24|49->52|64->64|
| merchant |26->25|26->25|52->53|26->27|44->45|63->62|
| caregiver |31->34|31->35|43->46|17->15|45->44|64->64|

Early bearer survival and national scale do not change. Contest/show T3+ gear
57->58 /61->62 /63->62 /63->63; craft/trade T3+ stays unsampled. This neither
establishes crafting-only/pacifist viability nor proves all rewards sufficient.
Mean sampled living NPCs8.3917->8.4037 /8.0796->8.0533 /8.1801->8.1528 /
8.4817->8.5558. Hungry-NPC exposure .0950->.0944 /.1872->.1858 /.1262->.1245 /
.0483->.0466. Read every resource, class-exposure, intake, bearer-change and
ability metric, eligibility denominator and exploratory interval in the raw
score JSON/Markdown. Day60 survival has62 merchant and63 caregiver eligible
observations, not64 uncensored measurements. No weighted score or equivalence claim.

The16-seed screen separately retains maker deaths14->18 and class13->12,
caregiver community3->4, merchant wins3->5 and caregiver wins8->9. Holdouts do
not erase these directions. No outcome-driven retuning followed inspection.

## All changed discrete outcomes replayed

A fixed list selects every changed win, entry, invitation, national scale,
early survival, death, community, player class or earned-gear access outcome:
43 cases/86 before-final replays. This is not every changed continuous sample
or full hash (77 holdout hashes differ from baseline). All23 metrics remain
in the full reports. Every selected replay matches its source panel's row,
full hash and23 metrics with zero warnings. The passive trace records actual
feeding, deaths, public seating and final person/build/deed context.

- Maker loses10003/10004/10018/10047, gains10010/10025. The four lost runs
  end with arc3 and no food-use deed;10018 loses its community on116 with
  three deaths.10003 instead retains its first bearer without a death.
  These differing life/food-action histories do not justify granting a deed.
- Merchant10014 changes win90->community loss145,0->2 bearer deaths, with
  final successor lacking food-use credit. Aggregate merchant deaths rise one.
- Merchant10009 still wins,101->93, but loses T3+ gear access. Before, day92
  gives deep_earth_boots, day94 investigators_coat and day96 godslayer_spear.
  Final day92 gives gravity_well (tier3 but not weapon/armor), and day93's
  show gives spare_battery. The actual prize/exposure history differs; the
  reward formulas did not change. Do not dismiss this as only a shorter run.
- Caregiver gains five wins, loses10032/10062. Those two end without food-use
  credit. More wins coexist with43->46 deaths;10020/10023 gain wins after more
  deaths, while10017 loses its community and class access. These tails remain.
- Capable gains10050/10061. The new10050 trajectory wins143 with a different
  bearer history; it does not invalidate the earlier unchanged-source horizon
  diagnosis.10061 still uses the unchanged Table ownership guard; no bypass
  or forced progress check is introduced.

Decision: retain canonical recipients and durable payment with these costs.
The source/caller contract is repaired; overall balance improvement is not
established. Continue named food-use/policy/reward histories separately. Earlier
reactor questions stay open, but not every lost win has a reactor. Never force
death, waive food credit, add rewards or make encounters easier to recover a rate.

## Tests and native phone

Final shared-kit target26/26; same target before13 pass/13 fail; draft24 pass/
2 fail (ordinary auto-load and duplicate-payment guard). The initial24-check
version and its old outputs remain separately retained. An old general god
fixture had left its caster dead after prior fatal scenes. It now prepares and
asserts a living resident, preserving original feeding/price assertions:116/116.
Wiring:62 functions,0 unwired. No module/provides or ontology change.

Accepted stable-source quick183/183, full955/955 (garden-feed-*-paid.log).
Initial full953/955 failed two legacy tests that do not load godverbs.js:
drifter-grab and miser-ledger-names.32 fixed seeds per test on both roots
(128 processes) reproduce drifter seeds2/9 identically: combat prevents its
claimed return to the village.256 more ledger seeds per root (512 processes)
do not reproduce its unseeded take-attribution failure. No runtime fix,
assertion loosening or quarantine hides these findings. A provisional955/955
run overlaps the later persistence edit and is not the accepted final gate.
Further legacy fixture repair remains a separate known issue.

Prepared375px native app: helper grants a known NPC Garden/stores/day84,
without calling feeding/dawn/seating itself. A real Wait makes Sleep legal;
native Sleep reaches day85 and the food HUD becomes2400/2400. The final
diagnostic reads one paid cast,11 other people fed, caster hunger49 including
ordinary overnight accounting. Load automatic save calls the actual load API
without saving first: same day, reserve, caster hunger, marker and cast count.
Node's direct endDay test independently proves the earlier snapshot gap;
Sleep can perform later saves. Earlier prepared stale-dead phone control has
zero casts/harvestDay-1. These are prepared mechanism tests, not naturally
earned human campaigns or broad mobile usability certification. An early
helper's invalid scalar water fixture was corrected before accepted phone proof.

## Repeatable handoff

```powershell
node evidence/2026-10-16/garden-feed-verify.cjs
node evidence/2026-10-16/garden-feed-verify.cjs --current
node evidence/2026-10-16/garden-feed-summarize.cjs
node evidence/2026-10-16/garden-feed-reconstruct.cjs final .git/garden-feed-review
node evidence/2026-10-16/garden-feed-verify.cjs --recompute .git/garden-feed-review
node .git/garden-feed-review/scripts/godpath/test-garden-feeding.js
node evidence/2026-10-16/garden-feed-probe.cjs .git/garden-feed-review .git/garden-feed-review maker 10018 .git/garden-feed-review-case.json.gz
node evidence/2026-10-16/garden-feed-server.cjs .git/garden-feed-review garden-feed-phone.html 8775
```

Use fresh directories. before/draft reconstruct the older arms with the final
26-check test available for failure proof; garden-feed-initial-test.cjs preserves
the first24-check version. Collector root is the probe's first argument, game/
policy root the second. Original raw collector bytes are deliberate: newline
normalization changes observer identity. Rebuilt final26 checks, all four
comparison reports and the complete adverse maker10018 trace reproduce exactly.
Default verification uses immutable hashes and worker/replay records; --current
also checks live source/test identity; --recompute uses the frozen scorecard.
Historical evidence-dependent full suites require their own prior fixtures;
reconstruction claims these targets only. Automatic check.js discovery keeps
the new contract in quick/full runs. Update this evidence and survival register
when feeding semantics change. Feature branch only; no deploy/SW/version bump.

The summary regenerates the compact43-case index. Complete unfiltered event,
person, need and build snapshots remain in the compressed traces; the index
does not replace them.
