# sim-havendraw-b — haven-assault exposure DIAG (instrument-side, ZERO src/js)

Run: fleshout-20261023T0515Z · arm sim-havendraw-b · axis scale-onramp · worker sim-havendraw-b tree
Date: 2026-10-23 · DIAG arm: instrument-side census, zero src/js. Convergence finding #831 (open).
Builds on: evidence/2026-10-23/sim-restraint-b.md (KILLED-AT-PILOT — proved 93/93 wave-4 fights across 32 configs happened AT THE HAVEN: haven assaults + feast draws, zero patrol-origin; "wave-4 engagements seek the scholar, not vice versa"; any effective restraint must touch haven defense, a design call).

Namespace: `havendraw` (scripts/diag-havendraw-b.js, scripts/sweep-havendraw-b.js, scripts/havendraw-analyze-b.js, scripts/test-havendraw-b.js). Disjoint from sibling arms' namespaces (armorvillage, w5door-b) and the live dead-run worker (vetbisect).

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot sweep)

- **Binding question**: Quantify haven-assault exposure on current master so a haven-defense design call (Steve) has measured inputs: how often wave-4+ fights happen at the haven, by what origin, what defensibility exists in the game today, and what it costs in veteran/scholar lives and companion damage.
- **Census design**: 8 FRESH seeds (65801–65808 — verified unused by filename + `"seed": N` JSON grep across evidence/2026-10-2*/) × {leadfeast, belongfeast} = 16 configs, ONE arm (DIAG census, no lever — the substrate policy itself is the subject). Policy = AD.armedFor(AD.normBase(base)) (the mantlechain DIAG substrate's control stack), no policy layers added or removed.
- **Substrate env**: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (exactly the mantlechain DIAG substrate; comparability with sibling scale arms).
- **Horizon**: 180d death-aware (dead villages stop; +10d tail max). Justification: wave 4's standing gate opens ≥day 25; the restraint pilot on this substrate produced wave-4 fights on 14/16 configs within 180d; the binding wall question (scholars dying in wave-4 haven fights) needs the full wave-4 window open. Wave 5 is late — the census reads wave-5 reach as a metric, not a target.
- **Origin taxonomy** (classifyOrigin, unit-tested): PLAYER fights (combat_start tele) → feastdraw (s.feastDraw match), raidreach (raider id recorded at havenRaidTick, reaches the player), tent (pendingInTent), trap (gwTrapTick call site), reengage (reengageWaitingMonsters hall-door/treeline), pending-other (live pendingEncounter, wanderer contact), field (checkEncounter bumps/warning-lapses); VILLAGER fights (resolveWildMonsterEncounter wrap) → raiddefense (opts.raid), lingerer (m.lingering), havengrounds (monster on haven tile(s) jumping a villager), field. atHaven = playerAtHaven() at combat_start for player fights; tile-chebyshev to haven for villager fights.
- **DIAG-GO (binding)**: (a) a quantified exposure table — haven assault frequency per 100 village-days (by wave), origin-class shares with the wave-4 split, over 16 configs; (b) a code-grounded defensibility inventory (every claim cites a src/js location); (c) a "design-call inputs" section naming the exact parameters a haven-defense design would need (assault rate, draw levers, defense levers that exist vs missing) with numbers. GO = all three delivered. A structurally-empty origin class is itself a finding (reported, not scored against).
- **Wall numbers (reported every run)**: national / table / wins, wave 4–5 unlocks, median/max survival, death-cause shares, trap acquisition by source, counter discovery/counter-kill rate, young-link succession survival, tier-2 and wave-3 reach.
- **Sense**: transcripts of haven assaults read per the SENSE-TESTING LAW — do they read as assaults (people reacting, defending, consequences) or silent number-shuffles? Villagers must act like people; flag anything robotic.
- **Canon check**: docs/CANON.md + docs/MONSTER-WAVES.md read first (2026-10-23). The draw/defense mechanics below are grounded in src/js (havenGrowth.js, feastBuff.js, shelter.js), not invented.

## The finding being instrumented

sim-restraint-b: 93/93 wave-4 fights across 32 configs at haven (atHaven=True; 11 feasted, 82 not) — haven assaults and feast-draw facings, zero patrol-origin. If the scale wall is about scholars dying in wave-4 fights (8/8 in-scope DIAG deaths as mantle-holder), the lever is not the scholar's seeking but the haven's defensibility or the assault frequency/draw rate. This DIAG produces the measured inputs for that design call. It does not design the defense.

## What haven defensibility exists TODAY (code-grounded, pre-sweep)

- **shelter.js** — auto-muster: `shelterMusterCheck()` (called daily from the progDaily wrap, before the raid tick) musters everyone except the scholar inside the hall when a wave-4+ world monster is within 2 tiles of Haven (hysteresis: stand down only past 3 tiles; threat stamped when the player stands down). Sheltered villagers are excluded from the wild jump (game.js villagerMonsterTick), the raid draft (havenGrowth.js havenRaidTick defenders), and duty loops; they still eat. Manual muster / stand-down exist as Haven-panel verbs (`shelterMuster`, `shelterStandDown`).
- **havenGrowth.js havenRaidTick** — raids: reactive (never scheduled): 3+ world monsters AND pantry ≥ 3000 kcal → 18%/day, ≥7d between (overtime-modifiable via overtimeRaidKnobs). raiders = 3–5 NEAREST world monsters to haven (tx=hx, ty=hy), +1 above 12k pantry, +1 above 24k, cap 5. Palisade (havenTier ≥ 2, "The Palisade") shaves 25% maxHp off raiders as they come over the wall; without it, one raider can reach a sleeping player (pendingEncounter). Defenders = healthy villagers at home (hp > 40, shielded sorted last), fought blow-by-blow via resolveWildMonsterEncounter(d, m, {raid:true}) with the r30 defense beat. Unmet raiders linger and gorge nightly (6-day drift valve); answered by endure or a real played sortie (answerLingerer). Table-sitting sanctity: no new raids while the table sits.
- **feastBuff.js drawFeastScavenger** — the draw: each FRESH armed feast grant draws one wave-appropriate scavenger (castMonster: 60%-newest wave target, i.e. wave 4 at 60% once wave 4 unlocks) to the haven's edge as a pending encounter (feastDraw.chance, default 1.0); faced via faceFeastDraw (real fight) or declined via driveOffFeastDraw (devotion unspent, no fight).
- **Watchers**: narrative only — no mechanical watch assignment exists in src/js (alienPlayers.js/feastBuff.js "watch" lines are fiction; "the watch holds the wall" is the palisade-gated narration). No buildable fortifications beyond the palisade tier, no guard posts, no defense duty assignment — defenders are whoever is healthy and home.

(Results, exposure table, sense test, metric review, proof, and kill/GO record below — appended after the pilot.)

## Results (pilot complete — 16/16 configs, anchor f5f19667ce19, completed by run fleshout-20261023T0713Z)

The dead 0515Z run's worker died with 1/16 census JSONs on a stale anchor (6c08dd39c). The adopting run rebased the tree to current master f5f19667c, discarded the stale JSON, and re-ran all 16 configs cleanly (seeds 65801–65808 × {leadfeast, belongfeast}, mantlechain DIAG substrate, 180d death-aware). All 16 JSONs record anchorCommit f5f19667ce19.

### (a) Exposure table (scripts/havendraw-analyze-b.js, 2046 village-days)

- Raids fired: 187 (9.14/100vd), by max-wave {1:80, 2:30, 3:30, 4:43, 5:4}
- Musters: 18 (0.88/100vd), standdowns 5, mean sheltered 7.2
- Player fights 425 / villager fights 1826
- Player origin shares: {field:326, feastdraw:99} — wave-4+: {feastdraw:12, field:93}
- Villager origin shares: {field:726, havengrounds:555, raiddefense:502, lingerer:43} — wave-4+: {havengrounds:15, raiddefense:7, lingerer:15, field:1}
- Wave-4+ player fights: 105 (5.13/100vd), **atHaven 98/105**
- Wave-4+ villager fights: 38 (1.86/100vd), haven-class 37/38
- **Refinement of #831**: the restraint DIAG read 93/93 wave-4 fights "at the haven" as haven assaults + feast draws. The origin split shows the haven-centric exposure is real (98/105 player, 37/38 villager) but the CHANNEL is mostly ambient: player wave-4+ origins are field-bumps (93/105 — checkEncounter contact at the haven tile) with only 12 feastdraw and 0 raidreach/tent/trap/reengage/pending-other. Villager wave-4+ splits across havengrounds (15), raiddefense (7), lingerer (15). The haven isn't being besieged so much as *stood in the path of* — wave-4 monsters reach the haven tile and the scholar bumps into them.
- In-scope veteran wave-4 deaths: 10 (0.49/100vd), by origin {field:9, feastdraw:1}
- Scholar (mantle-holder) wave-4 deaths: 10/10 — {field:9, feastdraw:1} (the chair is the accelerant, again)
- Feast-draw mechanism: 102 casts, 102 drawn, faced 31/31, driven off 0/31; by wave {1:28, 2:37, 3:23, 4:14}
- Muster effectiveness: 6 haven-class wave-4+ fights occurred within 2d after a muster — musters shelter but don't prevent the ambient contact
- Companion damage: haven fights n=399 mean compDmg 3.0 (6 companion deaths); wave-4+ fights with ends 105/429, mean compDmg 7.4; outcomes {won:232, lost:133, routed:64}

### Wall numbers (this corpus)
national 8/16, table 1/16, wins 0/16, wave4 14/16, **wave5 1/16** (s65806 leadfeast, maxWave=5 at d102), median survival 137d, max 180d. Death causes: combat 473, villager combat 92, starvation 15, expedition 29, monster 18. w4 scholar kills 5, w4 villager kills 3. Counters discovered 319. Young-link succession 244/247 survived.

### (c) Design-call inputs (for Steve's haven-defense decision)

The parameters a haven-defense design would need, measured:
1. **Assault rate**: 9.14 raids/100vd (reactive, pantry-gated); wave-4+ player exposure 5.13/100vd at haven, villager 1.86/100vd haven-class.
2. **Draw levers that exist**: feast draw (102 casts/16 runs, 100% draw rate on fresh feasts, 60%-newest-wave targeting — 14 wave-4 draws); raid tick (18%/day when 3+ world monsters AND pantry ≥3000 kcal, ≥7d spacing); lingerer gorge (6-day drift valve, 1000+ kcal/night).
3. **Defense levers that exist**: auto-muster (0.88/100vd, shelters ~7.2 villagers when wave-4+ within 2 tiles); palisade (25% maxHp shave on raiders, havenTier≥2); raid defenders (healthy villagers at home, blow-by-blow); table-sitting sanctity (no new raids while the table sits).
4. **Defense levers that DON'T exist**: no watch assignment (fiction only), no guard posts, no fortifications beyond palisade, no defense duty, no early-warning beyond the muster radius — and nothing addresses the dominant channel (ambient field-bumps at the haven tile: 93/105 player wave-4+ fights). The muster reacts to *known* threats within 2 tiles; checkEncounter contact has no announcement.
5. **Cost of the status quo**: 10 scholar wave-4 deaths/2046vd (0.49/100vd), all as mantle-holder; 6 haven-class wave-4+ fights inside the muster's 2-day shadow.

### Sense test (SENSE-TESTING LAW)
Read the d86 Influencer fight (census-belongfeast-s65803, sense window 17 — the run where scholar Zoey Krawczyk died): the fight plays blow-by-blow at the haven with companion Olga ("Olga: 'There's two of them. We can't do this scattered — we need a real team. A named one. People fight harder for a name.'"), the village reacts ("The village is rattled. Everyone's jumpy — eyes on the treeline", "Yara watches, jaw tight"), Zoey's death lands with consequences ("The Codex turns a page on its own. Zoey Krawczyk is dead. You didn't ask. It knew." / "The village stops. Somebody screams. Somebody else starts digging."), and the mantle passes mid-fight — the successor keeps striking with a stone knife. **PASS with notes**: the death has weight, people react in character, succession continues the fight. Robotic notes: strike-line spam ("Olga strikes the Influencer" ×5), "The village is rattled" repeated verbatim, Yara's "This feels exposed. Let's not linger." doubled. The missing beat: no warning/announcement framing for the ambient contact — the wave-4 monster simply *is* at the haven when the scholar bumps it (origin=field). An assault that arrives without a herald reads as weather, not war.

### Metric review
The pre-registered DIAG-GO bars are all deliverable: (a) exposure table ✓, (b) defensibility inventory ✓ (pre-sweep section), (c) design-call inputs ✓ (above). No metric revision needed. Note for the next run: the origin taxonomy's "field" class at the haven deserves its own name — checkEncounter contact on the haven tile is the dominant wave-4+ player channel (89%) and the current label hides it inside "field". Proposed: `havencontact` as a player origin class.

### Proof
scripts/test-havendraw-b.js — re-run on the rebased master anchor (f5f19667c) by the adopting run: **29/29 GREEN** (E0 shape, E1 synthetic RED→GREEN on the origin classifier incl. the full player/villager origin matrix, E2 determinism byte-identical, E3 off-gate instrument-neutral, E4 live schema with 0 instrumentErrors).

### Verdict
**DIAG-GO**: the exposure table, defensibility inventory, and design-call inputs are delivered on current master with 0 unexplained and 0 instrument errors. Finding #831 is now measured: the wave-4 exposure is haven-centric AND ambient — the lever for the haven-defense design call is the checkEncounter contact channel at the haven tile, not the raid tick or the feast draw. Filed to sim-findings.md as the refined #831.
