# sim-armorprod — armor PRODUCTION/acquisition drive (flesh-out loop, 2026-10-19, ARM sim-armorprod)

Run: fleshout-20261019T1400Z, arm sim-armorprod. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/armorprod.js (default OFF; ARMORPROD=1 opts in).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, combat-readiness ARMORED bar — worn armor at P ≥ demand; the scholar via armorBonus()), AGENTS.md 2026-10-09 armor model (pieces additive into P, r=P/(P+20), absorbed=min(hit-1, round(hit*r))).
Named context: sim-armorup (evidence/2026-10-19/sim-armorup.md, KILLED at pilot) diagnosed that villagers fight and die under-armored because ARMOR DOESN'T EXIST — not because they don't don it. Loot armor is left behind "too heavy"; the scholar almost never has armor in their pack (unwornScholar ≈0.1–0.2 pieces/day). The wave-5 door legs at stall show armor short 16/16. This arm is the named next: armor PRODUCTION/acquisition.
Canon constraint (Steve 2026-10-09 INDIVIDUAL OWNERSHIP): no communal armory for armor — villagers use their own property/stash; no shared pool. Verified in code: storage.js armor has no deposit hook; villagerGearDay's armory is weapons-only; villagerGearDay's spares pool covers villagers' own property only (the scholar is excluded). There is NO player verb to hand armor to an own-villager. Villagers never craft (no game-code villager crafting exists). So this arm's production drive is SCHOLAR-side: the scholar crafts, loots, and wears armor. This is still in scope for the primary (the taxonomy: scholars die more than villagers, 42 vs 30) and the wave-5 door ARMORED bar (the scholar counts; P ≥ 15 required — bark_armor P=10 alone CANNOT clear it, hide_armor P=20 can).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims; a miss is NO-GO, never re-scored)

**PRIMARY:** combat deaths (raid + wild + patrol channels — the taxonomy's field-combat bucket), armed vs control on IDENTICAL seeds, **PAIRED DELTAS** (per the armorup metric review: paired per-run armed−control deltas, not arm totals).
**GO threshold:** ≥25% fewer combat deaths on the armed arm (paired-delta basis, i.e. sum of paired deltas ≤ −0.25 × control total, with the paired-delta mean negative).
A miss is NO-GO, never re-scored mid-run (§14). Metric doubts go under "metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).
**Seeds:** pilot 8 seeds (63801–63808, comparability with the taxonomy) x {leadfeast, belongfeast} x {control, armed} = 32 runs. Confirm (only on pilot GO): 12–16 seeds.
**Policies:** competent-player policy (tribfloor leadfeast/belongfeast); substrate flags to match the taxonomy comparability:
pre-seat + windefer, VETREL=1, SEATDRIVE=0 (env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0).
**Guardrails (all must hold):** wave-4 unlocks within ±2/16 runs of control; median survival no worse than −10d; no new death mode (revised ≥2-event rule); starvation deaths ≤ control+1 (paired per run).
**Secondary (report, don't judge):** mean P worn at fight start; wave-5 door armor-leg status (is armor still short?).
**Watch item (not guardrail):** "too heavy" say-line counts + pack-fill at loot time (the armor-first take reorders what gets left behind — report it, don't hide it).
**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js) — the panel is the instrument, the GO threshold is the judge. Compare .md attached.

## Lever played

ARMOR PRODUCTION/ACQUISITION DRIVE (scripts/policies/armorprod.js, ARMORPROD=1 opts in, default OFF — pure delegation when off, DET-pinned byte-identical to the bare w5path stack). Two scholar-side mechanisms, all existing verbs, honest costs. Canon constraint honored (Steve 2026-10-09 INDIVIDUAL OWNERSHIP): the layer never moves armor into the stash/armory and never hands armor to a villager — no such player verb exists (verified in code: storage.js has no armor deposit hook; villagerGearDay's armory is weapons-only; its spares pool covers villagers' own property only, scholar excluded; villagers never craft). Villager armor production is not a lever this policy can pull — documented, not worked around.

**(A) Hide-armor craft drive** (after the inner daily): crafts hide_armor (P=20, hide 2 + vine 1) when the scholar's best worn P < 20, the recipe is known L1+, hide 2 + vine 1 are on hand, the vine bank isn't banking, one attempt/day. craft() consumes materials win or lose (blind L1 35%, L2+ 85%). A successful craft is worn immediately. Design note: bark_armor (P=10) CANNOT clear the wave-5 door's ARMORED bar (P>=15) — hide_armor (P=20) can. The base policy's gearUp block already drives bark_armor for the scholar's own need (COMPETENT_CRAFT_ARMOR, on by default); this drive is the upgrade path.

**(B) Armor-first loot** (before the inner daily's lootCorpses): scans in-range corpses for armor-def items and takes them FIRST via corpseTakeItem (same canCarry weight gate as the batch path), highest P first. When the pack is tight, armor lands and junk stays; in control the corpse-order batch takes junk first and leaves the armor ("Too heavy for the rest — left where it lies"). The inner daily's corpseLootAll then batches the rest.

Proof: scripts/test-armorprod-20261019.js — 12/12 green (DON fixtures on the layer incl. the armorP reader against the real item defs and the no-communal-armor/no-villager-gear constraint; GATE: layer-off == bare w5path stack byte-identical; DET: ARMORPROD=1 repeat byte-identical; SMOKE both policies x both arms, 30d, zero instrument errors).

Diagnostic (pre-pilot, 60d + 180d control runs): the craft drive is MATERIAL-STARVED in sims — bark max 0–23 (one seed), vine 0–18 (consumed by the knife/trap race; the base bark craft needs vine 2 and never fires — barkCrafts=0 on all runs), hide max 0–2, hide_armor L1 arrives late or never. Armor in sims arrives via LOOT (scholar P hits 42–60 from looted pieces), not crafting. M2 fires (7 armor pieces, P=54, taken first on leadfeast-s63802 in 60d).

## Results

32/32 pilot sweep complete (8 seeds 63801–63808 x {leadfeast, belongfeast} x {control, armed}, 180d death-aware, w5path substrate with VETREL=1, ARMORPROD=1 on the armed arm). 0 bad files, 0 instrument errors.

**PRIMARY — NO-GO.** Combat deaths (raid + wild + patrol channels), paired per-run deltas: control=156, armed=142, pairedDeltaSum=−14 — **9.0% reduction** vs the ≥25% GO bar. Paired deltas (armed−control): leadfeast −1, −1, −5, 0, +1, −1, −2, +4; belongfeast 0, −7, +4, −1, −9, −2, 0, +6 — noise around zero with offsetting outliers, no systematic reduction.

**Guardrails:** wave-4 unlocks 16→15 PASS (±2 band); median survival 122.5→111.5 **FAIL** (−11d, worse than the −10d band); new death modes PASS (none, under the revised ≥2-event rule); starvation deaths PASS (≤ control+1 paired per run).

**Wall numbers:** national 13/16→14/16, table 13/16→12/16, wins 0/16→0/16, wave-4 16/16→15/16, wave-5 0/16→0/16, median survival 122.5d→111.5d. The scale wall does not move.

**Armor production (the lever moved, but thin):**
- The hide-armor craft drive NEVER fired: hideAttempts=0 across 16 armed runs (~2,000 sim-days). The materials never co-occur with the knowledge — hide max 0–2 in the pack, vine consumed by the knife/trap race, hide_armor L1 arrives late or never.
- The base policy's bark craft fired 3 times on the armed arm (barkCrafts=3) — the only crafting in the corpus. Bark max 0–23 per run but the craft needs vine 2, which the knife/trap race eats first.
- Armor-first loot is very active: 269 armor pieces taken first (total P=1967) across 16 armed runs. It moves real armor into the scholar's hands (scholar P hits 42–60 from looted pieces on sampled runs).

**Secondary — wave-5 door armor leg:** armored15 (demand: 4 at P≥15) control end=0.88 / max=3.19 → armed end=1.69 / max=3.88. Improved but STILL SHORT of 4 — armor remains the binding door leg, and the villager side is unreachable policy-side (no verb exists to produce or transfer armor to villagers; see Lever played).

**Watch item — encumbrance (honest cost):** "too heavy" SAY lines control=1275, armed=**2600** (+104%). packRefused 0→71 (the armor-first per-item take refused for weight 71 times — even with priority, the pack is too full to take armor). leftBehind 235→184 (fewer batch leftovers — the armor-first take fills the pack with armor, so more junk batches hit the weight limit). Same trajectory-divergence class as armorup's +73%, now worse.

**§15 panel:** control→armed compare decision=review_required; table regression_watch (−0.125), survival60 regression_watch (−0.125). Panel JSON+MD attached (evidence/2026-10-19/armorprod-panel-primary.{json,md,json.gz pair}). The panel is the instrument; the pre-registered GO bar is the judge: NO-GO.

**Verdict: KILLED AT PILOT.** Layer deleted zero-trace per kill protocol (scripts/policies/armorprod.js removed; instruments + evidence land). Kill proof: scripts/test-armorprod-20261019.js (KILLED-VERDICT) 18/18 green post-kill.

**Diagnosis:** armor-first loot acquisition works mechanically (269 pieces, P=1967) but does not move combat deaths — the same magnitude class as armorup's donnings (a few P points, never enough against wave-3/4 verbs, and armor is never immunity). The production half of the arm is dead on arrival: crafting is MATERIAL-STARVED (bark/hide never co-occur with vine in the pack; the vine race eats vine first), and villager armor production is IMPOSSIBLE policy-side (no crafting verb for villagers, no gift/armory channel for armor — canon individual ownership). The wave-5 door's armor leg cannot be cleared by any scholar-side policy: it needs 4 fighters at P≥15 and the scholar is only one.

## Village assessment

What the villages looked like: 16 paired villages on the pre-seat full win-side stack (leadfeast/belongfeast, 180d death-aware). They reach national (13–14/16) and the table (12–13/16), unlock wave-4 (15–16/16), win 0/16, open wave-5 0/16 — the scale wall's shape is unchanged by the lever. Median survival 122.5d control, 111.5d armed.

Who thrived and who died and why: the combat-death mix is unchanged — raids at Haven and wild/expedition field combat, scholars dying in defense and aid answers, villagers in the field. The 269 armor-first takes (P=1967) landed mostly on the scholar; scholar fight-open P rose on sampled runs (0→42 on leadfeast-s63802), but a few P points don't change fight outcomes against wave-3/4 verbs — armor absorbs, never immunes (hit-1 clamp), and the fights that kill are the ones where positioning and verbs decide.

What the village does while the layer fires: it functions — the armor-first take is a loot beat among foraging, gossip, and raid defense. Villagers act like people throughout (monster-naming arguments, tribute presses, fire gossip in the transcripts); nothing about the layer made them robotic. The per-item takes read as deliberate player choices with honest trauma costs (see sense-testing).

## Sense-testing (SENSE-TESTING LAW)

Read: 2 armed-arm transcripts — leadfeast-s63802 (16k SAY lines) and leadfeast-s63805, full + armor-filtered.

**The armor-first loot reads as sensible play.** "[d59] Taken: Alien carapace x1." → "You take alien carapace from Mara. Your hands know what they did. (+4 trauma)" — the scholar strips the dead for armor first, with the honest trauma beat. The next day's gearUp then equips it ("[d48] Equipped Alien carapace (torso).") and "Armor absorbs 6/8/12/17" lines show the mechanic working in fights. The d1 bark-armor L1 beat (old cuirass by the fire) and the d42 hide-handling beat ("You hold the hide — thick, raw, smelling of the animal... the shape of armor suggests itself") both fire and read well — the knowledge surface is alive; the materials surface is what starves.

**Blanks / noise:**
1. The hide-armor drive's total silence is itself a finding: across ~2,000 sim-days the scholar never once holds hide 2 + vine 1 with the recipe known. A real player who wanted hide armor would go get hides — the policy never tries. The drive as designed is a dead letter; the gap is materials acquisition, not the craft verb.
2. "Too heavy" doubled (+104%) — the pack fills with armor-first takes, and then everything else hits the weight limit. The packRefused=71 count (armor-first takes refused for weight) says even priority can't beat a full pack. Pack triage (mechanism 3) was not implemented — the base already trims food to a 1-day buffer, so there is no honest room left without touching the food economy.
3. The per-item trauma naming fires once per armor piece ("You take good boots from Daniyar. Your hands know what they did. (+21 trauma)") — honest, but on a corpse with 3 armor pieces it's 3 trauma beats where the batch path would fire one. Same verb the base uses at LOOT_ALL=0; acceptable, but visible.

**Does anyone fight unarmored anyway, and why?** Yes — most villagers, most of the time. The layer is scholar-side only: villagers' armor comes from starting clothing bias, the daily villagerGearDay redistribution of their own spares, and nothing else. No policy can make them armor they don't own.

## Named nexts

1. **Armor materials-bank arm** — the diagnosed gap: vine is the contested resource (knives + traps eat it before armor), bark arrives but can't pair with vine, hides arrive rarely. A vine-priority drive (armor crafts before the third knife / the next snare) would test whether production is material-gated or knowledge-gated. Out-of-arm; appended below.
2. **Villager armor production is a game-design gap, not a policy gap** — no villager crafting verb exists, no player→villager armor transfer verb exists, armor has no stash/armory hook (canon). If Steve wants the wave-5 door's armor leg clearable, this needs a design call (steve-call in the findings).
3. **"Too heavy" cooldown** (carried from sim-armorup; text/ux backlog item — now confirmed worse under armor-priority looting).
4. **Paired-delta significance bar** for future combat-death primaries (carried from sim-armorup; pre-registered here on paired deltas and honored).

## Out-of-arm findings

(Appended to hidden_files/sim-findings.md; not chased.)
- Armor crafting is material-starved: vine is the contested resource (knives + traps eat it before armor); bark arrives but can't pair with vine; hides arrive rarely.
- [steve-call] Villager armor production is impossible policy-side; the wave-5 door's armor leg (4 at P≥15) may be unclearable by design — needs a design call.
- "Too heavy" spam worse under armor-priority looting (+104%, 71 pack refusals) — the cooldown/cap is load-bearing now.

## Metric review

The pre-registered bar is met exactly as specified and missed honestly: paired-delta reduction 9.0% vs the ≥25% GO bar — NO-GO, never re-scored (§14). The paired-delta basis (adopted from the armorup metric review) worked as intended: the +9.0% total reduction dissolves into per-run noise (−9, −7, −5 against +6, +4, +4), and the median-survival guardrail caught a real cost (−11d) that arm totals would have hidden. Two notes for the NEXT run on this axis:
1. The "too heavy" watch item needs a rate, not a count (carried from armorup): counts scale with run length and loot patterns; the +104% here is directionally real (packRefused=71 corroborates) but a per-day rate would be comparable.
2. The door-leg secondary (armored15 end/max) proved informative — it moved (0.88→1.69 end, 3.19→3.88 max) while the primary didn't. For production-side arms, the door leg may be the more sensitive instrument than combat deaths.

## Convergence

**killed-at-pilot.** The arm is dead: NO-GO on the primary (9.0% vs 25% bar), median-survival guardrail fail (−11d), watch-item cost (+104% "too heavy"). The axis stays converging: the scale wall does not move on armor acquisition — the diagnosis (materials starvation + villager production impossible policy-side) is the handoff. The wave-5 door's armor leg improved but remains short (max 3.88 vs demand 4); clearing it needs a game-design change (villager armor production), not another policy lever.

## Files

- scripts/probe-armorprod-20261019.js — sweep probe (fork of the armorup probe: identical substrate guard + death capture; adds production census (bark/vine/hide, recipe levels, layer ctx counters), door-leg census mirroring standing.js, packRefused/leftBehind say-hooks). Requires the deleted layer to run — kept as instrument evidence.
- scripts/analyze-armorprod-20261019.js — before/after judge (GO test on paired deltas, guardrails incl. revised ≥2-event new-mode rule, wall numbers, production effect, door leg, watch) + §15 panel compare builder
- scripts/armorprod-transcripts-20261019.js — SAY-line transcript probe (sysSay restored)
- scripts/test-armorprod-20261019.js — KILLED-VERDICT proof (18/18 green post-kill). Pre-kill layer proof was 12/12 green (DON fixtures incl. the armorP reader and the no-communal-armor constraint; GATE: layer-off == bare stack byte-identical; DET: ARMORPROD=1 repeat byte-identical; SMOKE both policies x both arms).
- evidence/2026-10-19/perseed-armorprod/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json — 32 per-seed sweep JSONs
- evidence/2026-10-19/armorprod-analysis.json — pilot verdict JSON
- evidence/2026-10-19/armorprod-panel-primary.{json,md,json.gz pair} — §15 panel compare
- evidence/2026-10-19/armorprod-transcripts/ — 2 full + 2 armor-filtered transcripts
- evidence/2026-10-19/sim-armorprod.md — this file
- DELETED zero-trace per kill protocol: scripts/policies/armorprod.js (the lever). Zero src/js changes.
