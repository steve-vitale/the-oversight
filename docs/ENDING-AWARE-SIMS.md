# Ending-deed controller experiment

Status: explicit experimental profiles, not replacement defaults or a balance
gate. No Game difficulty, resource, reward or Table requirement is relaxed.

The R5 long-run investigation found seven community losses whose terminal
lesser-seat bars lacked only feast power use. Selected exact old-controller
traces now explain two different failures. Capable8 was home for638 dusk checks
but never called feastPlan: its recorded personal donations remained0 and no
tribute history satisfied the policy contribution rule. Merchant6 held8 paid
armed feasts and got8 real buffs without using one. These traces reproduce the
original full campaigns, including whole row/state/all29/gear and RNG tail.
See evidence/2026-10-23/r5-feast-opportunity-summary-r2.json.

## Implementation and bounds

Select ending-aware-capable, ending-aware-maker, ending-aware-merchant or
ending-aware-caregiver explicitly. The original four IDs are unchanged.
scripts/policies/ending-aware.js wraps the same parent policies and:

- Reuses competent.surplusFeast when devotion is armed and use is still missing.
  Its existing price, guests, cadence, starvation check,1.5x affordability and
  full day of communal food remaining apply. No new free-food mechanism.
- Uses the actual available learned Field Medicine action only on real wounds
  with room beyond the20 HP base for the authored feast bonus. It pays the full
  engine price and leaves1200 personal kcal. It never manufactures injuries,
  knowledge, encounters, buffs or deed flags, or withholds the parent's care.
- Keeps the parent's hunt/defense preferences. Livelihoods still decline the
  feast scavenger; these are mixed policies and do not prove pacifist viability.

endingAwareness diagnostics count hook observations and actual action outcomes,
not unique eligible days. surplus_road_did_not_host is deliberately unresolved:
it is not proof the Game refused a feast or that one was affordable. Treat
no_available_learned_treatment as an availability gap, not a failed cast.
Errors are reported through the warning stream and retained diagnostics.

## Selected pilot evidence

The same current Game and shared observer ran each explicit parent and wrapper,
with separate observe-off controls and all29 retained. These are selected
single-seed mechanism trials, not adoption evidence or a new win-rate estimate.
Raw IDs remain unchanged; ending-aware-pilot-comparison-r1.json declares each
parent pairing and every descriptive delta explicitly.

- Capable8: both win90. The experimental arm has more sampled low water and
  lower useful intake, despite fewer player deaths. More wins cannot clear
  those domains (here wins are unchanged).
- Merchant6: parent loses931; wrapper wins465. It still loses4 bearers. NPC
  named-class access and useful-intake ratio decline; death rate per100 days
  is essentially unchanged. Different exposure/lifetimes limit interpretation.

Both original parents exactly reproduce their historical whole row/state/
all29/whole-gear controls. A further passive replay captures the wrapper's
actual day464 action:27.1278 ->57.1278 HP,2400 ->2260 kcal, landed10 bonus HP,
and genuine healing-use credit. That replay again matches the complete pilot
row/state/all29/whole gear. The unedited checkpoint is retained for native
touch/Continue replay. Capturing it adds no extra save or Game action.

That phone replay found a real late-save Haven crash for a background bearer
missing from the original main cast. Native source verification and the
identity-only fix must finish before publication; headless campaign success
alone did not catch it. Keep failed pilots as evidence.

## Next adoption decision

Before replacing a default, use16 matched seeds/profile for all four profiles,
with64 and independent holdouts for small-effect claims. Compare controller
variants on ONE Game first; do not call that a Game-balance comparison. Inspect
all29, actual missing-deed availability/use, first-bearer and community survival,
earned gear, warnings and interventions. Investigate both win-rate directions.
Then reconcile Muse's current Game and rerun both Game roots with the SAME
chosen controller/observer. Share the tooling before any calibration gate.
No policy-ID renaming or copying historical proof hashes to new inputs.

Maintenance: test-ending-aware-policy.js is auto-discovered by check.js; the
reward objective/bounds are registered in policies/rewards.js. Controller edits
require a new retained neutral panel and actual balance-proof-update.js run.
Reproduce the passive action receipt with campaign-action-checkpoint.js against
its actual source-matched pilot; fresh output prefix required.
