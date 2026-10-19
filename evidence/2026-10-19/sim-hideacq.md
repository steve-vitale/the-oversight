# sim-hideacq — hide-ACQUISITION drive (flesh-out loop, 2026-10-19, ARM sim-hideacq)

Run: fleshout-20261019T1815Z, arm sim-hideacq. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/hideacq.js (HIDEACQ=1 opts in, default OFF).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, combat-readiness ARMORED bar — worn armor at P ≥ demand; the scholar via armorBonus()). Steve 2026-10-09 INDIVIDUAL OWNERSHIP (no communal armory); no villager crafting verb exists — the drive is SCHOLAR-side only. No canon doc covers armor production — the preservation ladder is food-only (per sim-vinearmor).
Required reading: evidence/2026-10-19/sim-vinearmor.md (FULL — this arm is its named next) and evidence/2026-10-19/sim-armorprod.md (FULL).

## Diagnosis (this run's own smoke, scripts/smoke-hideflow-20261019.js)

Hides ARRIVE via butchering (trapline carcasses; 17 cleaned / 90d on leadfeast-s63802) but STRAND on the kitchen counter (prepStash, max 15 seen): the engine's homecoming pooling moves pack carcasses to the counter on every Haven return, the base's cleanCatch then cleans them THERE, and carcassToMeat pushes the hide byproducts into the counter — where NO verb (UI or engine; verified: the counter UI has clean/cook/smoke/render/put-away but no "pocket it") can move them back to the pack, and craft() reads ONLY the pack. So hide_armor (hide 2 + vine 1 → P=20, CAN clear the wave-5 door's ARMORED bar at P≥15) never sees its materials. Armor arrives via LOOT, never crafting; hides never bank in the pack (0/1,912 days in the sim-vinearmor census; hide_armor L1 known on 8/16 seeds, 401 days). The counter-stranding (a game-design gap: no counter→pack verb for materials) is documented as a steve-call in the findings — this arm does NOT work around it; it intercepts the hides BEFORE they strand.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims; a miss is NO-GO, never re-scored)

**PRIMARY:** hide_armor crafts per run (scholar-side — the layer's ha counters; both arms instrumented identically), armed vs control on IDENTICAL seeds, paired deltas.
**GO = armed mean ≥ 2× control mean AND armed mean ≥ 0.5 craft/run** (absolute engagement floor — a drive that crafts less than once per two runs is a dead letter; control is expected ≈0 since the base never crafts hide_armor). A miss is NO-GO, never re-scored (§14). Metric doubts go under "metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).
**Seeds:** pilot 8 seeds (63901–63908, this run's pilot block) × {leadfeast, belongfeast} × {control, armed} = 32 runs. Confirm 12–16 seeds ONLY on pilot GO.
**Policies + substrate:** the w5path stack (VETREL=1), env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 — taxonomy comparability.
**Guardrails (all must hold):** wave-4 unlocks within ±2/16 runs of control; median survival no worse than −10d; no new death mode (a new cause counts at ≥2 events — the revised rule); starvation deaths ≤ control+1 (paired per run).
**Secondary (report, don't judge):** (hide≥2 & vine≥1) co-occurrence days/run; mean worn P at fight start; wave-5 door armored15 leg end/max; wall numbers (national/table/wave-4/wave-5/wins); "too heavy" rates.
**Watch (not guardrail):** knife/trap production counts (the dawn butcher reorders WHERE carcasses get cleaned — report it); meat-flow notes (dawn-butchered meat lands in the pack, not the counter).
**§15:** before/after through scripts/balance-panel.js — attach the compare .md. Every evidence file carries a "metric review" section.

## Lever played

HIDE-ACQUISITION DRIVE (scripts/policies/hideacq.js, HIDEACQ=1 opts in, default OFF — gate-off is pure delegation, GATE-pinned byte-identical to the bare w5path stack; DET-pinned repeat-identical). Three honest scholar-side verbs, all existing:

1. **DAWN BUTCHER** (pre-pass, before base.daily): butcher pack carcasses via Game.cleanCarcass (needs a cutting tool, 8 ticks each — the same verb, gate, and cost the base pays). The dawn trapline catch is butchered BEFORE the homecoming pooling can strand its hides on the counter — the hides land in the PACK where craft() can see them. Butchering is also the primary hide-handling path, so this teaches hide_armor L1 via the engine's own noteHideHandled beat (proven in the layer proof: D1).
2. **HIDE SWEEP** (post-pass, after base.daily): take hide items off in-range animal corpses via Game.corpseTakeItem (range/canCarry gates stay as the last word). Never person corpses. (Expected thin — hunted animals go to the pack as carcasses, not map corpses — but honest and instrumented.)
3. **HIDE-ARMOR CRAFT DRIVE** (pre- AND post-pass): when hide 2 + vine 1 are in the pack, the recipe is known L1+, no hide armor is owned, and worn P < 20 — one Game.craft('hide_armor') attempt per day (blind L1 35%, L2+ 85%, materials at real risk, per the engine's PRACTICE rule; a blind success teaches L2). Respects the vine bank (vinebank.banking — never claims a banked vine; loop B's file untouched). The base's gearUp equips the fresh piece — the layer NEVER equips (the vinearmor mid-run correction: never duplicate base equipping).

Canon constraints honored: the layer only ever touches the scholar's own pack (no stash/pantry/villager property — individual ownership); no villager crafting (no such verb exists).

Proof: scripts/test-hideacq-20261019.js — 21/21 green (DON fixtures D1–D5 on the real harness incl. the dawn-butcher pack-landing + L1 teaching, craft-drive attempt accounting, the no-equip constraint, gate-off zero-writes, all five craft gates; GATE: HIDEACQ-unset == bare w5path stack byte-identical; DET: HIDEACQ=1 repeat byte-identical; SMOKE both policies × both arms, 30d, zero instrument errors).

## Results

32/32 pilot sweep complete (8 seeds 63901–63908 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, w5path substrate VETREL=1, HIDEACQ=1 on
the armed arm). 0 bad files, 0 instrument errors. Sweep logs:
evidence/2026-10-19/hideacq-sweep-control.log + hideacq-sweep-armed.log.
Analysis: evidence/2026-10-19/hideacq-analysis.json.

**PRIMARY — NO-GO.** hide_armor crafts per run (scholar-side), paired on
identical seeds: control mean **0.00**, armed mean **0.06** (1 craft, on
leadfeast/s63905), paired deltas +1 on 1/16 runs, +0 on 15/16. GO (armed
mean ≥ 2× control AND armed mean ≥ 0.5 craft/run) missed on the engagement
floor.

**Guardrails:** wave-4 unlocks 13→12 PASS (±2 band); median survival
97.5→106.5 PASS; new death modes PASS (none, under the revised ≥2-event
rule); starvation deaths **FAIL** — belongfeast/s63905: control 1, armed 3
(delta +2, worse than the ≤ control+1 band).

**Wall numbers:** national 11/16→12/16, table 11/16→12/16, wins 0/16→0/16,
wave-4 13/16→12/16, wave-5 0/16→0/16, median survival 97.5d→106.5d. The
scale wall does not move.

**The mechanism WORKS but the gates don't open.** The dawn butcher fires
(65 pack-carcasses butchered corpus-wide on the armed arm): (hide≥2 &
vine≥1) co-occurrence goes 0.0 → 4.5 days/run — hides DO reach the pack now.
But the craft drive attempted only 4 times corpus-wide (1 success, 3 blind
fails). The census explains why: haHideL0 dominates (L1 arrives late —
on the one successful run, the first dawn butcher AND hide L1 both land at
day 95, craft fires day 96); haWornSkip 13,458 day-snapshots (the scholar
wears P≥20 LOOT armor on most days — crafting hide_armor is moot, the
vinearmor lesson again); haWantVine 1,807 (vine still scarce).

**The honest cost.** "Too heavy" SAY lines: control 1,259 → armed **5,590**
(+344%). The dawn butcher front-loads the day's meat into the pack at dawn;
the scholar carries a pinned-full pack ("Too heavy. Carrying 30.9/30 kg."
×13 on belongfeast/s63905 d41) and the forage haul gets left behind —
3 villagers starve on day 44 of that run (the guardrail fail). Traps
128→103 (the day's time/weight budget reorders). The layer moves real food
into the pack and the pack can't hold the day.

**Secondary — wave-5 door armor leg:** armored15 end 1.75→1.63,
max 3.06→3.00 (demand 4). Unmoved — the scholar's single craftable piece
can't move a 4-fighter bar, and the craft is moot under loot armor anyway.

**§15 panel:** control→armed compare decision=review_required (16 rows each;
no material signal on the standard metrics). The panel is the instrument;
the pre-registered GO bar is the judge: NO-GO. Panel JSON+MD attached
(evidence/2026-10-19/hideacq-panel-primary.{json,md,json.gz pair}).

**Verdict: KILLED AT PILOT.** Layer deleted zero-trace per kill protocol
(scripts/policies/hideacq.js removed; instruments + evidence + proof
land). Kill proof: scripts/test-hideacq-20261019.js (KILLED-VERDICT)
green post-kill.

**Diagnosis:** hides CAN be routed to the pack policy-side (the
counter-stranding is interceptable at dawn — the mechanism is proven and
reads honestly), but hide_armor production is not winnable this way: the
craft is knowledge-gated (L1 arrives ~day 95 on the one engaging run),
loot-moored (the scholar wears P≥20 loot armor most days, so the craft
drive skips), and the routing itself costs real food (the pack can't hold
the dawn meat AND the day's haul — +344% "too heavy", a starvation
guardrail fail). The wave-5 door's armor leg needs 4 fighters at P≥15;
scholar-side crafting can only ever serve the scholar. This confirms the
armorprod/vinearmor handoff: clearing the door needs a game-design change
(villager armor production / a counter→pack verb for materials), not
another policy lever.

## Village assessment

What the villages looked like: 16 paired villages on the w5path stack
(leadfeast/belongfeast, 180d death-aware). National 11–12/16, table
11–12/16, wave-4 12–13/16, wave-5 0/16, wins 0/16 — the scale wall's shape
is unchanged by the lever (the corpus rhymes with the vinearmor/armorprod
shape: the door's armor leg still binds). Median survival 97.5d control,
106.5d armed.

Who thrived and who died and why: the death mix is the taxonomy's
field-combat bucket plus Haven attrition — scholars dying in defense and
aid answers, villagers in the field and to wounds that wouldn't close.
The one run the layer touched hard (belongfeast/s63905) diverged on food,
not combat: the control village died at day 57 with 1 starvation; the armed
village lived to day 129 but starved 3 on day 44 — the pack pinned full of
dawn meat, the forage haul left where it lay.

What the village does while the layer fires: it functions — the dawn
butcher is a camp beat among foraging, gossip, and raid defense. Villagers
act like people throughout (the transcripts carry the usual fire gossip,
naming arguments, tribute presses); nothing about the layer made them
robotic. The one successful hide-armor craft (leadfeast/s63905 d96) reads
as a real learning moment and the base's gearUp equips it the next day —
honest, earned, and rare.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 armed-arm transcripts — leadfeast/s63905 (10,147 SAY lines, the
craft run) and belongfeast/s63905 (16,666, the starvation run), full +
armor-filtered.

**The craft beat reads as sensible play.** d95: "Recipe: Hide armor (Level
1). You have seen hide armor. Tough cured skin, cut and laced into a
cuirass." (L1 taught by the dawn butcher's hide-handling beat) → "Butchering
yields: 1 hide." → d96: "You've only SEEN a Hide armor. You'll try to copy
it from memory — long odds, and the materials are at risk if it comes
apart." → "You make a Hide armor. cured hide, laced with sinew. Smells
like work." → "Recipe: Hide armor (Level 2). Materials: 2 hide + vine..."
(blind success teaches L2 — the engine's PRACTICE rule) → d97: "Equipped
Hide armor (torso)." (the BASE's gearUp — the layer never equips). The
whole chain is legible and earned.

**The cost beat reads as honest physics.** belongfeast/s63905 d41: "Too
heavy. Carrying 30.9/30 kg." ×13 — the pack pinned full, the day's haul
unliftable. The same run's d95-line class ("Too heavy for the rest — left
where it lies: ... Hide armor x1 ...") shows loot armor being left behind
for weight — the pack is the binding constraint, and the layer fills it
first.

**The loot-mooring is visible.** d109: "Taken: ... Hide armor x1 ..." →
d110: "Equipped Hide armor (torso)." — the scholar loots a SECOND hide
armor later and the base equips it. Armor arrives via loot; the craft is a
rarity even when it works.

**Blanks / noise:**
1. The dawn butcher's meat has nowhere to go at dawn — the scholar carries
   it all day. A real player would put the meat down (donate the dawn
   butcher's yield to the pantry immediately). The layer doesn't, and the
   village pays in "too heavy" and starvation. This is a policy-design gap
   in the layer, but fixing it wouldn't fix the primary (knowledge +
   loot-mooring are the binding gates).
2. haSweeps=0 corpus-wide — the hide sweep never engages (hunted animals go
   to the pack as carcasses, never map corpses). Honest but dead weight;
   correctly excluded from the verdict.
3. No new noise introduced beyond the encumbrance cost: no pack refusals
   (0/0), left-behinds 179→231 (the fuller pack leaves more batch loot).

## Named nexts

1. **Villager armor production is a game-design gap, not a policy gap**
   (carried from sim-armorprod/vinearmor; steve-call in the findings): the
   wave-5 door's armor leg (4 at P≥15) cannot be cleared scholar-side. No
   villager crafting verb exists, no player→villager armor transfer verb
   exists, armor has no stash/armory hook (canon individual ownership).
2. **The counter needs a "pocket materials" verb** (steve-call, this run's
   out-of-arm finding): butchering byproducts cleaned on the counter are
   stranded there — no UI button and no engine verb moves non-food items
   counter→pack. This arm intercepted hides before they stranded; the
   underlying gap needs a design call.
3. **Dawn-meat donation** (policy-design note): if a future arm butchers at
   dawn again, donate the yield to the pantry immediately (the base's
   donateHaul pattern) instead of carrying it — the "too heavy" cost is
   avoidable, but it doesn't fix the knowledge/loot gates.

## Out-of-arm findings

(Appended to hidden_files/sim-findings.md; not chased.)
- [steve-call] The kitchen counter has NO take-back verb for materials: butchering byproducts (hides, bones, antlers) cleaned on the counter are stranded there — no UI button and no engine verb moves non-food items counter→pack. craft() reads only the pack. Needs a design call.
- The dawn-butcher routing cost: front-loading the day's meat into the pack pins it full ("Too heavy. Carrying 30.9/30 kg." ×13) and starves villagers — a future dawn-butcher arm must donate the yield immediately.
- haSweeps=0 corpus-wide: hunted animals go to the pack as carcasses, never map corpses — corpse-hide sweeping is a dead mechanism on the current engine.

## Metric review

The pre-registered bar is met exactly as specified and missed honestly:
hide crafts/run control mean 0.00 vs armed mean 0.06 (paired deltas +1 on
1/16, +0 on 15/16) vs the ≥2× bar, and 0.06 vs the ≥0.5 engagement floor —
NO-GO, never re-scored (§14). The paired-identical-seed basis worked: the
single +1 delta is visible against fifteen +0s — the mechanism provably
engages, just almost never. Two notes for the NEXT run on this axis:
1. The engagement floor (≥0.5 craft/run) is load-bearing again: without it,
   the ∞ ratio (0→0.06) could look like a win on paper. Keep the floor.
2. The starvation guardrail (paired per run, ≤ control+1) caught a REAL
   cost the aggregates hid: the armed arm's median survival was BETTER
   (+9d) while one run starved 3 villagers on day 44. Paired per-run
   guardrails, not arm totals.
3. For production-side arms, the mechanism census (ha* counters: L0-gate
   share, worn-skip share, want-vine share) is the diagnostic that matters
   — it named the binding gates (knowledge, loot-mooring, vine) that the
   primary alone couldn't.

## Convergence

**killed-at-pilot.** The arm is dead: NO-GO on the primary (0.06 vs 0.5
floor), starvation guardrail FAIL (+2 on belongfeast/s63905). The axis stays
converging: the scale wall does not move on hide acquisition — the
diagnosis (hides CAN be routed to the pack, but the craft is
knowledge-gated and loot-moored, and the routing costs real food) is the
handoff. The claimed findings item (HIDES NEVER BANK) is answered and
closed: sharpened from "hides never arrive" to "hides arrive via
butchering but strand on the counter; routing them to the pack works
mechanically but doesn't produce armor — the gates are knowledge (L1
~day 95), loot (worn P≥20 skips the craft), and pack physics."

## Files

- scripts/policies/hideacq.js — the lever (DELETED zero-trace per kill
  protocol; pre-kill layer proof: scripts/test-hideacq-20261019.js 21/21
  green — DON fixtures D1–D5 incl. the dawn-butcher pack-landing + L1
  teaching, craft-drive attempt accounting, the no-equip constraint,
  gate-off zero-writes, all five craft gates; GATE: HIDEACQ-unset == bare
  w5path stack byte-identical; DET: HIDEACQ=1 repeat byte-identical; SMOKE
  both policies × both arms, 30d, zero instrument errors)
- scripts/probe-hideacq-20261019.js — sweep probe (fork of the vinearmor probe)
- scripts/analyze-hideacq-20261019.js — before/after judge + §15 panel compare builder
- scripts/hideacq-transcripts-20261019.js — SAY-line transcript probe
- scripts/test-hideacq-20261019.js — KILLED-VERDICT proof (green post-kill)
- scripts/smoke-hideflow-20261019.js — hide-flow diagnosis tracer (the counter-stranding discovery)
- scripts/smoke-hidetrack-20261019.js — object-identity custody tracer
- evidence/2026-10-19/perseed-hideacq/{control,armed}/{leadfeast,belongfeast}/s63901–63908.json — 32 per-seed sweep JSONs
- evidence/2026-10-19/hideacq-analysis.json — pilot verdict JSON
- evidence/2026-10-19/hideacq-panel-primary.{json,md,json.gz pair} — §15 panel compare
- evidence/2026-10-19/hideacq-transcripts/ — 4 full + 4 armor-filtered transcripts
- evidence/2026-10-19/hideacq-sweep-control.log, hideacq-sweep-armed.log — sweep logs
- evidence/2026-10-19/sim-hideacq.md — this file
- DELETED zero-trace per kill protocol: scripts/policies/hideacq.js (the lever). Zero src/js changes.
