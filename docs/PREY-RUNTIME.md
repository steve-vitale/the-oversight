# Prey runtime and content maintenance

`animals.json` owns species facts, methods, difficulty and explicit habitat.
The runtime lives in encounters.js, with the shared strike-evasion roll in
food.js. Prose is not proof that a special behavior runs. Keep learned coaching
honest about the actual approach, tool and reaction paths.

For fish, declare `waterAffinity: "in"`. These actors spawn only on visible
interior water/creek cells, stay in water when moving, and submerge after a
miss or strike evasion. A hidden fish is not a strike target until it surfaces;
the existing bluegill bed-guarding grab remains an exception. The strike-evasion
attempt still pays50 kcal. Ordinary surfaced strikes and carcass rewards remain
possible. This changes where encounters happen, not species calories or rewards.

Old saved fish positions on land reconcile to the nearest existing interior
water cell. If there is none, release the actor back to local wildlife without
awarding food. Spawn attempts without visible water leave population unchanged.
`waterAffinity: "near"` permits land-capable fauna; it does not bind them to water.
Don't classify frogs or turtles as fish merely because they can be caught on a
line. The two existing line-method amphibious exceptions are explicit in the
proof; new line-method species need declared habitat. The schema admits both
values. Full global content validation still has recorded legacy failures;
see the dated content-delta receipt rather than claiming that validator green.

Unknown hunt methods are unprepared. There is no implemented fishing-net item
or action in this unit, so the `net` key cannot silently satisfy tool readiness.
Do not add an available-looking verb until its actual inventory/cost/catch path
exists. Existing hands/chase/stick and actual line/tool checks remain intact.

When changing prey/data:

1. Read STEVE-ANSWERS.md, COHERENCE-SPINE.md, MEASUREMENT-PLAN.md and SIMULATING.md.
   Keep region/world/nomad/weather authorship coordinated through AGENT-LANES.md.
2. Run `node scripts/test-water-prey.js` with default seed,7 and42 in separate
   processes. It uses the complete shared harness and actual spawn, turn,
   strike-evasion and public hunt methods. Fixtures prepare state/grid, not
   replacement Game methods. All species must retain unknown-cue gating and
   substantive learned coaching. Extend the habitat/behavior contract with new
   species instead of just increasing a count.
3. Run the existing animal-cues/social-animals tests, region/ontology validation,
   and quick/full checks. The water-prey proof is on both quick and full lists.
   Source-read fault controls must reject lost placement/movement/hiding/payment/
   knowledge/tool safeguards, including a future unmarked fish.
4. For Game/data/controller changes, collect/register a fresh real neutral
   maintenance proof, then matched16 screens and distinct64 holdouts under the
   unchanged23-metric contract and controllers. Keep original source identities,
   raw rows, unknowns and hashes. Trace actual feature use; zero selected Hunt
   calls cannot certify fishing as a playstyle. Compare the relevant region too.
5. On phone, use the actual UI. Record natural versus prepared actor/grid scope,
   food cost, hidden-strike refusal, resurfacing, knowledge and console evidence.
   Prepared native combat/resource probes are not a full campaign or human feel
   verdict. Do not substitute a readout panel for the actual Hunt/step controls.

Current proof: evidence/2026-10-17/water-prey-audit.md. Broader regional behavior
stories (troop raids, circling shots and special charges) still need explicit
runtime verification; the new cues avoid promising them. Human reading/clarity
judgments remain needs-eyes. Release/version stamping remains Steve's call.
