# Caregiver support: reciprocal rescue with real, saved limits

2026-10-16. Base `e87e21a559b7096e63e3ad2876234acb396a874d`.
Retain this care prerequisite before authoring Shepherd's outcome. No god
deed, price, amount, kit or region/nomad rule changes. Five proxies remain.

## Actual corrections and survival tradeoff

Mending Hands already contained a player-recipient branch, but a healthy
NPC's planner considered only other NPCs. It now sees a nearby wounded
bearer too. Planner and verb use the existing distinct present ally list;
a departed player cannot displace the caster's own needed healing. Existing
range,12–18HP base,60 nominal kcal/player payment and2 NPC hunger payment
remain. NPCs retain their current level1 representation.

Tactical Lifeline previously ran only on NPC victims. A distinct living
NPC can now anchor the bearer in tbEndCheck **after** their personal refusal
flow. Second Wind, NPC personal refusal and the real personal Phoenix flow
retain priority, including a pending player Phoenix link. Actual body and
scholar HP sync, and the fight continues at1HP. Dead, unknown, departed or
duplicate people cannot lend the passive. The same support-holder check also
governs Last Rites; this does not invent a new Last Rites action.

Lifeline limits now belong to the canonical person rather than a replaceable
fighter key. Actual save/load retains the per-person map and total count.
Player level2 still holds10HP, level3 still permits two rescues. Replacing
a body key or loading cannot mint another use. The map belongs to the fight,
not to a lifetime village ledger.
Old snapshots without the map still load; missing history remains unknown
and is not reconstructed from invented past hits.

These are opposing survival levers: reciprocal care gains reach, while
saved/personal limits remove unearned rescues. More lives or more wins would
not automatically prove improvement, and lower wins would not automatically
prove regression. No compensating food, enemy or Table change is made.

## Frozen experiment and complete changed-state follow-up

caregiver-support-sources.json.gz retains before/after211-entry manifests,
raw game.js/godpath.js edits, common current26-check validation and all seven
raw collector/comparator files. The two runtime files are the only manifest
changes. Collector, contract, policies, origin and horizon stay fixed.

Four standard policies ×16 screen seeds and a disjoint10001–10064 holdout
run150 driver iterations.656 worker results are retained:328 new,328 exactly
source-matched baseline jobs reused from the published Market final standard
reports. caregiver-support-baseline-reuse.json preserves original report/job
hashes and identities. There are first-seed observer-off controls in every
policy/cohort/arm.68 final-screen cached workers resume exactly; those are
not68 additional worlds.

All320 raw rows and all23 per-case metric structures are identical. Both
full scorecards keep every denominator, unknown and earned gear source and
report no material signal. Counts below apply to both arms, screen/holdout:

| Policy | Wins | Table entries | Player deaths | Community losses |
| --- | ---: | ---: | ---: | ---: |
| capable |12/48|12/48|18/88|2/13|
| maker |4/20|4/20|18/82|4/21|
| merchant |4/23|4/23|18/56|6/28|
| caregiver |9/34|9/36|10/45|4/15|

Community losses combine village-lost/village-dead. These mixed policies do
not establish pacifist viability, a dedicated party-healer strategy or every
previous named cohort's outcome. The earlier Market/Miser warnings remain
in their own audit; this experiment does not erase or remeasure them.

All six screen and eight holdout changed gameplay hashes are replayed on
both sources:28 exact full-state diagnostics. Every replay matches its raw
row, **whole balanced observation** and full gameplay hash. Leaf differences
are only the two newly serialized empty Lifeline fields, apart from existing
wall-clock pacing diagnostics excluded by the published hash. No new field
is stripped from hashing. There are no unclassified changed cases here.

The dated selection rule is repeatable: all hashes when at most32 change in
a cohort; above that, every changed row/metric, any Lifeline exposure or
changed care-event count, plus first/last changed hash per policy. Preserve
the full index and leave any unselected hashes unclassified.

Four **additional** matched opportunity replays cover the two natural
holdout runs with Lifeline events, even though their final hashes do not
change. Maker10004 saves `gen_kv15ft4` on46 and Tom Baker on119; caregiver10037
saves Oliver Moore on73. The actors are the current players. All three
existing player→NPC tactical rescues and both rows/hashes are unchanged.
These prove existing use; they do not prove natural NPC→player rescue.
That new recipient/planner route is proved by prepared callers and phone
play below. Whole-panel holder availability and time-at-risk are not measured
here, so missing new-route events are not evidence of uselessness.

There are32 selected source-matched replays plus two diagnostic observer-off
controls, not34 independent balance worlds. Source-bound diagnosis retains
the complete leaf differences and actual care events. An independent
reconstruction passes26 checks and reproduces capable777's whole standard
result. Raw collector bytes, not normalized archive guesses, govern identity.

## Proof and phone scope

The current shared-harness test passes26/26 on final and13/26 on before.
It proves real NPC planning/payment, range/food gates, player and NPC own
refusal priority, actual Phoenix priority, repeated lethal hits, actor
eligibility, canonical ownership, ordinary and level3 save/load, replacement
body keys, spent limits and absent old history. One harness per process.
Final quick195/195, full967/967, ontology111 systems and godpath wiring0
unwired pass. The first quick failure identified the now-obsolete alliesOf
helper after its final caller moved; that unused helper was removed. No
assertion, price or quarantine was changed to make checks pass.

Configured phone390×844: supplied day85, empty bearer abilities/gear,
20HP bearer, full30HP formal companion Carl, two supplied NPC care abilities,
secure pantry and adjacent tactical positions against a real Understudy.
The supplied day/kit/stores/positions are explicit preparation, not natural
ability acquisition or a full campaign. Native Wait schedules Carl's actual
Mending:20→35HP, Carl hunger0→2. A disclosed Controlled lethal hit button
invokes actual monster-source tbDamage/tbEndCheck for1000 damage. Carl's
Lifeline holds the same bearer at1HP, with one personal charge and no new
bearer. Save/load first erases the live use map, then restores Carl's spent
charge. The second controlled hit causes the ordinary loss and mantle
transfer to Carl. It does not purchase a free second rescue. AX and JPEG
captures retain the actual native cast, paid state, hold, load and exhaustion.

The lethal hits are clinical controls, not autonomous monster behavior or
a proposed strategy for obtaining progression through death. The existing
formal30HP/gear and field helper/body models are unchanged. The new recipient
inherits the generic "You stays standing" text; that agreement issue is
logged for a text pass. NPC deepening, active-care eligibility beyond this
recipient change, Battlefield Grace's full healer/bonus-action/winded flow,
field/army care and Shepherd's actual authored deed remain separate work.
No broad care parity or all-scale completion claim follows from26 checks.

## Repeat and continue

```powershell
node evidence/2026-10-16/caregiver-support-verify.cjs
node evidence/2026-10-16/caregiver-support-reconstruct.cjs after .git/caregiver-support-review
node .git/caregiver-support-review/scripts/godpath/test-caregiver-support.js
node scripts/balance-panel.js --root .git/caregiver-support-review --n 16 --days 150 --par 8 --out .git/caregiver-support-review-panel
```

Reconstruct both arms with the same current observer for new comparisons.
Keep these dated artifacts immutable; use a fresh prefix for new source,
collector, policy or horizon. If the shared collector changes, reconstruct
first and pass --collector-root to the verifier. Caller and maintenance
tests join check.js automatically; process-local Windows PATH/ComSpec setup
is in SIMULATING. Source-keyed cache checks retain corruption/freshness rules.

Continue Shepherd's fitting outcome and remaining care/scale work. Five
god deeds, Garden's seven-day interpretation, early reactor/food-use and
natural Finale/Network completion remain open. Publish this prerequisite on
codex/resume-claude for Muse; no master merge, deployment, SW or version bump.
