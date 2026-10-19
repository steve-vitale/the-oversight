# Final combined mobile playtest repair

Addresses Steve’s terrain/deer/dialogue/voice report plus the later corpse,
successor and pack report. The intermediate deer-dialogue scorecard is historical;
body-carry-scorecard-r1 compares the final frozen source against7e43c1fe8 under
the same observer/controller. All23 metrics and every warning stay in the record.

Confirmed root causes: corpse checks used `coordinate || 4`; coordinate0 was
replaced by4. Search existed only in the cell popup, not Game.cellActions. The
successor inventory already replaced unique gear correctly, but carried water
survived the mantle, and death-pack food lost its calories/plant identity/spoilage.
Those physical goods now remain on the corpse. Taking water restores the same
volume/source/quality as1L portions, agreeing with the ordinary drinking UI.

Normal capacity was a hard pickup stop. Defined burden movement/work prices
were unused; only combat penalties were wired. Steve’s recalled extra-carry
behavior therefore did not exist in this source. The implementation choice is
2x normal capacity as the pickup limit, with rising calorie costs. See the exact
formula and paired-screen tradeoffs in SURVIVAL-LEVERS. This is a deliberate
mechanics change, not a claim that win changes automatically regress the game.

Native phone flows390x736/844 each play9 stages: nearby search without a grid
tap, actual adjacent edge-item pickup above normal load, over-limit refusal with
unchanged source goods, deliberate corpse-water recovery, explicit Pack costs,
actual paid step, real pagehide and Continue with recovered property. Screens
were inspected. The prepared load20.5kg/body/position are disclosed. No natural
spawn/acquisition-rate claim. The final 4-stage terrain/dialogue route checks
actual Continue preserving ash and the bearer, exact selected reply, and real
transcript-to-Piper input. Predict is stubbed to inspect synthesis text; there
is no physical listening claim. The source-bound field/Deer route still plays
16 stages and completes Wait/escape at both sizes. No physical-device clearance.

Focused production-runtime checks cover edge reach, adjacence/far refusal,
limits/modifiers, charged movement/work, free resting effort, finite legacy mass,
actual succession and corpse food/water metadata. The shorter aim still gives
harmless ignition before damage. The earlier generic lane check also confused
no-legal-move with blocked beam; only genuine blocked legal beam/line kits now
reposition. Conditional three-miss hunt behavior is separately tested through
three real endFiring judgments and the actual next turn, while the real dodger
duel must still resolve boundedly. Its path picker now uses actual path costs;
it cannot count a refused long move as a successful dodge. Both authored hunt
narrations are recognized, not just one RNG-selected variant.

Tests retain strict partial-pickup quantities and untouched cache/stash/source
assertions, moving ballast to the new hard limit rather than loosening limits.
The forage clock test checks base60 plus real burden effort. Three old tests
used incomplete custom eval loaders; they now use the shared sim harness. There
are no new quarantines. Initial full failures remain in dated logs; final results
are recorded separately. Updated ontology validates119 systems.

The final matched16x4 screen has64 cases/68 jobs per arm plus8 neutral jobs,
144 raw jobs and266 normalized source blobs, with the feature census and config
inside retained panels. Frozen source matches the working tree. Sixteen selected
phone PNGs and hashes are retained. The invalid mutable first panel is excluded.
No automatic difficulty compensation or broad all-playstyle clearance is claimed.

Known limits: physical devices, new opening/installed-lifecycle release gates and
legacy contract dispositions remain in the release goal. A generic question
fallback is still not a substitute for authored context for every possible NPC
utterance; this change repairs demonstrated structural mismatches. Steve’s
optional item-name clarification remains open for any additional reported
successor gear beyond the confirmed water transfer. Unique old gear itself is
proved to stay on the body, even when both people own the same ordinary item type.

Final checks: quick259/0 (60s), full1031/0 (200s). Current-source mobile
ending/succession/Table11-stage journeys and earned-gear16-stage journeys also
pass at both heights. Together with16 field,4 terrain/dialogue and9 corpse
stages, this is112 native phone stages. The paired property replay records the
same actual death on both roots: old water transferred before, not after; the
corpse meal was0kcal/expiry9999 before, and retains321kcal/expiry99 after. Unique
old gear stayed on the corpse in both, so it is not falsely called a new fix.
No new service-worker stamp, production deployment or public-launch clearance
is claimed. The shared candidate retains the previous reconciled Muse lineage.
