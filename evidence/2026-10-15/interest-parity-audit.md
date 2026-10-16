# Hoarder's Interest: actual daily holder parity

2026-10-15. Baseline f2833f9e. Retain the narrow runtime correction.
No ability rates, kit order, XP, slots, Table gates, reactor rule, region,
nomad system or release version changed.

## Defect and implemented behavior

The only source caller of buildarounds.onDayTick is the real endDay dawn
boundary. Its old interest branch returned immediately unless the player
held Hoarder's Interest. NPC ownership and an assembled NPC build never
generated the food promised by the payoff. This was a missing actor caller,
not proof that every economic ability was weak or that more wins were needed.

The existing hook now processes the current player and actual living resident
NPC holders. NPC path assembly uses npcOwnedIds for that person, matching
the player's ownedAbilityIds rule. Existing values remain: at least1000kcal
opening pantry;2.5percent alone or5percent with two Miser-path abilities;
rounded integer food, clipped to the existing pantry capacity. stockPantry
creates the real food. No synthetic personal-harvest provenance is attached.
Dead, departed and stale current-player NPC ability records do not earn.
Traveling residents can still hold a passive claim on the shared stores;
player exile/remote-pantry interpretation is unchanged and outside this unit.

Each holder calculates from the same opening pantry. Payouts are additive
within a dawn, then compound across days. Canonical-ID order allocates scarce
remaining capacity, so roster reordering cannot produce extra compounding.
This multi-holder interpretation is a needs-eyes design judgment. No overall
rate reduction or new storage cap was added to suppress a potentially strong
shared build.

village.hoarderInterest keeps only the current payout-day opening stock and
canonical-person receipts {rate, requested, kcal}. A paid or capacity-blocked
receipt cannot be claimed again that day after another call, making room,
load or taking that person's mantle. A later dawn starts a new opening.
No holder means no new ledger. Below-threshold stores generate no credit.
Actual NPC growth is narrated without exposing a hidden build sheet.

No new telemetry event is emitted: the saved receipts and a passive diagnostic
read provide actor/value evidence without adding simulator clock-ID calls.
The gameplay hook reports errors instead of swallowing its interest failure.
Other build-around hooks are unchanged.

## Runtime and browser proof

The new shared-kit proof has22 passing assertions. The frozen baseline has
6 passes and16 failures against the same script. Several baseline failures
include new receipt/idempotence predicates; they do not mean the old player's
numeric2.5/5percent payouts were wrong. Coverage includes independent NPC
assembly, actual food/provenance, threshold, capacity, three-holder opening
stock, duplicate calls, real save/load, real death/succession, dead/departed
records and the real endDay caller. Save/load uses a memory localStorage
adapter, as other persistence proofs do; the first draft without that browser
API correctly reported save=false and was repaired in the fixture.

The390x844 browser test is explicitly prepared: it grants one NPC Hoarder
and Interest, seeds50,000kcal, moves to day20 dusk and suppresses early UI
prompts. It is not a natural class acquisition or campaign proof. After the
fixture's save=true, reload -> Continue -> the native Sleep button advances
to day21. Ordinary night activity leaves44,500kcal at the interest boundary;
Charlotte receives2,225kcal at5percent and the pantry becomes46,725.
Reload -> Continue preserves that receipt. A read-only fixture button displays
it above the real game; it is not a new production control. The public You
sheet showed0/1 abilities for the player.

The retained JPEG and DOM show that receipt and label the preparation. The
initial fixture failed because its health map was uninitialized; only the
fixture was repaired, then the successful test used a fresh local origin.
No stale-save bypass. Tabs/servers are closed and the viewport is restored.

## Seeded screen and confirmation

Identical current policies, observer, contract, flags, origin and150-day cap
against frozen before/after roots; only buildarounds.js changes among207
fingerprinted sources. Six policies: capable, maker, merchant, caregiver,
merchant-hoarder and merchant-dealer. The16-seed screen is192 rows total.
The64-seed confirmation is768 rows total,384 matched cases; the screen is a
subset, not192 extra independent campaigns. No independent holdout.

All384 result rows and all23 metric sets are identical. Both comparisons
report no_material_signal. This is a description of these samples, not a
claim that earning the previously missing NPC payoff has no possible impact.

| Policy | Wins (same) | Player deaths (same) | Community losses (same) |
|---|---:|---:|---:|
|capable|55/64|90|8|
|maker|21/64|52|18|
|merchant|25/64|42|14|
|caregiver|23/64|45|18|
|merchant-hoarder|28/64|36|12|
|merchant-dealer|28/64|36|12|

378 final full-state hashes match directly. Six differ for the two declared
preferences at seeds4,15,1234. Four representative before/after replays
(Hoarder4/15/1234 and Dealer1234) reproduce the collector's full hashes/rows.
Removing only village.hoarderInterest makes their final states match; all588
paired observed dawn states match after removing only that new ledger, using
the collector's normal wall-clock diagnostic exclusions.
The two preferences at4/15 also share exact final full states in each arm,
covering the remaining two final-hash differences without claiming independent
worlds or unobserved full trajectories. Six diagnostic on/off pairs reproduce
canonical full-state hashes and rows. Balanced controls comprise24 jobs
(12 pairs); controls reused from the screen are not extra independent proofs.

The four natural examples have no declared NPC Interest record at their
observed dawns. That is not a census of all campaigns or proof that NPCs
cannot acquire the ability. Named NPC Miser classes remain unsampled in the
campaign panels. Natural acquisition, meaningful economic build choice and
all-playstyle human viability remain open. The unchanged capable policy still
omits its introductory knack; see the separate knack-policy conflict before
generalizing this panel to human play.

## Prepared long-campaign stress case

A separately labelled standard merchant seed7 grants the same resident
Hoarder/Interest through npcGrantAbility in both roots, then uses the ordinary
policy for150 loop days. It directly sets no class, godhood, XP, food or win.
This is not included in the natural panel or used for a population estimate.

The candidate produces55 positive NPC payouts totaling204,018kcal and21
capacity-blocked eligible receipts. Merely finding an ability record is not
a success denominator: declared NPC records appear on137 candidate dawns
and116 baseline dawns, and can outlive eligibility. Both villages are lost:
baseline day135, candidate138. Player combat deaths change1 ->0, while other
death counts and history change. More food is not an automatic improvement
verdict; one prepared case does not establish balance or human viability.
Each arm's observed run has a matching unobserved row/full hash.

## Checks, remaining gaps and reproduction

Current quick168/168 and full940/940 pass. Ontology validation passes all111
systems and records the new parity rule. The source caller plus real endDay
proof establishes this hook's wiring. The module-wide wiring scan still finds
two unrelated pre-existing warnings on both roots: Cornucopia onForage and
forageMult have no static caller. There is no blanket all-green wiring claim.
Audit their actual forage paths next. Static Interest description/deepening
copy also needs reconciliation with the existing assembly-based runtime.
Eight fitting god deeds and broader parity/scale work remain open.

The baseline64 cache was reused only after exact source/observer/contract
identity checks. Every result digest and case identity is verified; nothing
is re-keyed across changed inputs. Sources are retained as an exact Git-base
reference plus the one replacement, identical shared proof and tool sources.
Reconstruct into fresh directories; the helper rejects existing output and
checks all207 source hashes:

```text
node evidence/2026-10-15/interest-parity-reconstruct.cjs before <fresh-before>
node evidence/2026-10-15/interest-parity-reconstruct.cjs after <fresh-after>
node <fresh-after>/scripts/godpath/test-hoarder-interest-parity.js
node scripts/balance-panel.js --root <root> --policies capable,maker,merchant,caregiver,merchant-hoarder,merchant-dealer --n 64 --par 6 --out <panel>
node scripts/balance-panel.js compare --before <before-panel.json.gz> --after <after-panel.json.gz> --out <comparison-prefix>
node evidence/2026-10-15/interest-parity-replay.cjs <root> 4 merchant-hoarder on <replay.json>
node evidence/2026-10-15/interest-parity-replay.cjs <root> 7 merchant on <prepared.json> prepared
```

Replace on with off for the diagnostic neutrality control. Prepare grants
exist only with the explicit final prepared argument; ordinary gameplay
and the natural panel grant none. No release or master merge is included.
