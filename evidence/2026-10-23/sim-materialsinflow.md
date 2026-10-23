# sim-materialsinflow — communal materials inflow channel (BUILD arm, policy-side)

Run: fleshout-20261023T0815Z | arm: sim-materialsinflow | axis: scale-onramp
Backlog: #834 (claimed by this arm; see hidden_files/sim-findings.md)
Branch: sim-materialsinflow (worktree ~/workspace/worktrees/sim-materialsinflow). Commit on branch only — "ready for merge", no push/bump.

## Pre-registration (§14 binding — written BEFORE any pilot sims)

**Question.** The NPC armor-craft beat is mechanism-sound (1 piece/30d at L2
odds when materials exist, proof 24/24) but never fires in the wild: the
communal materials pile holds bark:0/vine:0/hide:0 on all 360 diagnostic
village-days (sim-armorvillage-b autopsy). Villagers wear bark/hide armor
(knowledge gate fires) — nothing brings the recipe materials home
communally. The design question: who gathers bark/vine/hide into the
communal pile — a new gathering beat, a policy stash channel, or a
trader/loot source?

**Design call (Steve 2026-10-07 — mine, his to overrule): the SCHOLAR'S
HANDS.** Measured, not guessed (diag seeds 67601-67603 x
{leadfeast,belongfeast}, 60d, pinned substrate): the scholar's PACK
accumulates bark/vine (bark:7, vine:3, branch:7 on 67603 — branches come
with bark strips per game.js:25897, vines are forage-drops); NPC packs
NEVER carry materials; the engine's own npcBatchTurn give beat (storage.js)
leaves only branch/wood. Rejected with teeth: an NPC gathering beat can't
run policy-side (nothing for NPCs to gather with — their packs are empty);
trader/loot sources are luck, not a channel. The policy donates excess pack
materials into the communal materials pile via Game.donateMaterial — the
headless equivalent of the pack UI's Stash button (app.js data-stash-give),
once a day, in person at the hall. Reserves (one craft's worth each — the
scholar's own armor path is never stranded): bark 3, vine 2, hide 2.

**Layer:** scripts/policies/materialsinflow.js (policy-side only, zero
src/js). Env MATERIALSINFLOW=1 opts in (default OFF); gate off = pure
delegation (proof E3 pins byte-identical).

**Primary metric (binding):** armor craft beats >= 1 on >= 2/8 armed seeds
(the armorvillage pilot's binding miss was 0/32 crafts; control =
ARMORYDRIVE=1 + ARMORVILLAGE=1 pinned, armed = + MATERIALSINFLOW=1).
Diagnostic secondary: the pile satisfies bark_armor's precondition
(bark>=3 AND vine>=2) on >= 1 day. GO = primary met + all guardrails pass.

**Horizon:** 180d death-aware (dead villages stop; +10d tail max). Why:
matches the armorvillage pilot for comparability; the armor leg binds
late-game.

**Seeds:** 67701-67708 — verified fresh (no sweep-script, evidence-filename,
or test-file reference as of 2026-10-23). x {leadfeast, belongfeast} x
{control, armed} = 32 configs, paired identical seeds.

**Policies/env:** control = AV.armedFor(base); armed =
MI.inflowFor(base). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1
(+MATERIALSINFLOW=1 armed only). Note: ARMORVILLAGE=1 pinned in BOTH arms —
the craft beat must exist to be starved; otherwise the comparison is
confounded. Documented deviation: none.

**Guardrails (all binding):** median survival armed >= control-10d;
starvation deaths armed <= control+2; no new death mode (>=2 events to name
one); death-cause shares sane (no cause >2x control share); pantry
integrity (median daily pantry kcal armed >= control-10% — descriptive;
materials never touch food); no broad balance footprint (telemetry
deviation check after).

**Wall numbers reported:** national / table / wins, wave 4-5 unlocks,
median survival.

**Confirm:** 12-16 fresh seeds ONLY if pilot GO.

## Canon read
docs/CANON.md + PRESERVATION.md (the ladder is food — materials are not food
and never touch it) + MONSTER-WAVES.md (armor leg demand: 4 fighters at worn
P>=15). No materials-inflow canon exists — stated, not invented. The channel
answers the design question with measured evidence (pack accumulation vs
empty NPC packs).

## Metric review
The pre-registered primary is judged as written: NO-GO (craft bar 0/8 vs
>=2/8). No re-score. Metric note for the next run: the primary conflated
three mechanisms (inflow fills pile x craft beat attempts x craft succeeds)
— the pilot separates them cleanly (donations 6/16 configs, precond 1/16,
attempts 0/16, crafts 0/16), so a future arm should pre-register each leg
separately. The panel (§15): not re-run — this arm is policy-side with zero
src/js changes (a panel before/after on game code would be byte-identical
by construction; proof E3 already pins the env-off path byte-identical to
control). The paired 32-config sweep on identical seeds IS the §15
before/after in substance; the verdict stands regardless of panel output.

## Build log
- Policy scripts/policies/materialsinflow.js (MATERIALSINFLOW=1, default
  OFF): the scholar's-hands inflow channel — one pass/day at the hall,
  donate pack bark/vine/hide above reserve (3/2/2) via Game.donateMaterial.
- Proof scripts/test-materialsinflow.js: 18/18 GREEN (E0 shape, E1a-e
  synthetic RED->GREEN incl. end-to-end craft draw, E2 determinism, E3
  det-gate byte-identical).
- Sweep scripts/sweep-materialsinflow.js + 32 per-seed JSONs in
  evidence/2026-10-23/perseed-materialsinflow/{control,armed}/.
- Design diagnostic /tmp/diag-materials.js (pack vs pile vs NPC packs) and
  /tmp/diag-conj.js (knowledge-gate/materials conjunction) — scratch,
  not committed.

## Pilot results (32/32 configs, anchor 98f5f22c3)

**PRIMARY: NO-GO** (binding — crafts >= 1 on >= 2/8 armed seeds):
- crafts >= 1: **0/8 armed** (0/8 control) — the bar missed with teeth.
- Diagnostic legs: donations fired on 6/16 armed configs (bark 16-17 units
  on 67702 x2; bark 8 + vine 2 on 67705-belongfeast; vine 11 on
  67707-belongfeast; vine 4 on 67708-leadfeast); pile precondition
  (bark>=3 AND vine>=2) on 1/16 (67705-belongfeast, 24 days); craft
  attempts 0/16; crafts 0/16. Control: donations 0/16, precond 0/16 —
  the starved baseline reproduces on all 8 fresh seeds.

Guardrails (all PASS): median survival 135.5d -> 141.0d (>= control-10d);
starvation deaths 9 -> 7 (<= control+2); no armed-only death kind >= 2
events; death-cause shares sane (monster 503->544 1.08x, villager 217->233
1.07x — no cause >2x); pantry median 14,511 -> 14,411 kcal (-0.7%, >=
-10%); wave4 15/16 both arms, wave5 2/16 both, national 16/16 both (no
regression).

### Mechanism autopsy (kill discipline — why the craft bar missed)

The channel FIRES (bark 17, vine 11 hauled on firing seeds) but the craft
beat needs a CONJUNCTION the pilot proves never forms:
1. **Asynchronous materials**: bark-heavy seeds (67702: bark 16-17, vine
   0-1) vs vine-heavy seeds (67707: vine 11, bark 0) — the pile holds both
   simultaneously on only 1/16 configs.
2. **Disjoint knowledge/material day-sets** (diag-conj on 67705-belongfeast,
   the only precond-satisfying seed): villagers wear bark/hide armor (the
   knowledge gate) on d143/d145 only; the hauled materials arrive d152+.
   25 precond days, 0 with a knowledge-gate villager at home, 0 attempts.
   The knowledge gate ("wearing it IS the showing") is satisfied exactly
   when villagers wear the LOW-tier armor they then upgrade out of (the
   armorvillage pile-draw/gift structure moves better armor to biggest
   gainers) — by the time the scholar's slow trickle fills the pile,
   nobody demonstrates the recipe anymore.
3. **Vine is the binding material**: reserve 2 chokes a material that
   arrives in 1s and 3s; only 1/16 configs ever held pile vine >= 2.

The lever is not wrong — it demonstrably fills the pile — but it is
necessary-not-sufficient: no policy-side adjustment (reserves, timing) can
fix the knowledge-gate conjunction, which is game-side. Per kill
discipline, the channel is NOT killed (mechanism proven, env-gated
default-off, harmless — the armorvillage-b precedent for the starved craft
beat); it lands as a measured NO-GO layer, the supply half ready for a
future game-side conjunction fix.

### Telemetry deviation check
`telemetry-check.js` vs scale-wall.json baseline: 2 LOUD lines ("table
disappeared 16->0", "wins disappeared 16->0") — both REGIME ARTIFACTS, not
deviations. The baseline's own _regime block warns: "DO NOT compare
pre-seat substrates against this baseline — wins are structurally ~0
there." This pilot runs the non-seat long substrate (SEATDRIVE=0), same
regime as the armorvillage-b pilot. Baseline NOT rolled forward.

## Sense-testing (SENSE-TESTING LAW)
Targeted 60d run (seed 67702, leadfeast, armed, say-line capture): the
deposit beat reads as people — "Set 4 bark strips in the village stash.
The pile grows." — sitting naturally beside the engine's own stash voices
("Lagat left 2 wood logs by the stash. No announcement. That's how it works
here."). The scholar hauling bark to the workbench is deliberate, owned,
voiced. The away-gate keeps the policy quiet off-hall (no refusal spam).
**PASS**.

## Verdict
**NO-GO on the binding primary** (craft leg 0/8 with teeth — root-caused to
the knowledge-gate/materials conjunction, not a broken channel). The
channel (policy stash channel, MATERIALSINFLOW=1, zero src/js) is proven,
env-gated default-off, and harmless: it lands as a measured NO-GO layer
(armorvillage-b precedent), not a design change. Named nexts: (1)
game-side knowledge persistence (having-worn vs wearing) or the
scholar's-hands timing — the conjunction half, not the inflow half;
(2) vine supply (reserve re-think or a vine-specific source) if the
conjunction is ever fixed.

## Blanks filled / documented
- Filled: #834's design question — ANSWERED with measured evidence: the
  channel is the scholar's hands (policy stash channel). NPC packs never
  carry materials (measured empty); the engine's NPC give beat leaves only
  branch/wood; trader/loot is luck, not a channel. The scholar's pack is
  the only measured source.
- Documented: the knowledge-gate/materials conjunction blank (game-side) —
  the craft beat's two preconditions form on disjoint day-sets; no
  policy-side lever can fix it. Filed to sim-findings.md.
- Documented: vine as the binding material (reserve-2 chokes 1-unit
  arrivals).

## Wall numbers (this corpus, n=32)
national 16/16 both arms | table 0/16 (unmeasured on this substrate —
sweep records 0; regime artifact vs the winseat baseline) | wins 0/16
(same) | wave4 15/16 both | wave5 2/16 both | median survival 135.5d ->
141.0d.
