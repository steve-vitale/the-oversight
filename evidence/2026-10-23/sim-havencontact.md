# sim-havencontact — havencontact origin census DIAG (instrument-side, ZERO src/js)

Run: fleshout-20261023T0815Z · arm sim-havencontact · axis scale-onramp · worker sim-havencontact tree
Date: 2026-10-23 · DIAG arm: instrument-side census, zero src/js. Claims sim-findings #831 (the proposed `havencontact` named origin class, from the sim-havendraw-b metric review).
Builds on: evidence/2026-10-23/sim-havendraw-b.md (DIAG-GO — measured wave-4+ player fights 105 (5.13/100vd), 98/105 at haven, origins {field:93, feastdraw:12}, zero raidreach/tent/trap/reengage; villager wave-4+ {havengrounds:15, raiddefense:7, lingerer:15}; muster 0.88/100vd doesn't prevent ambient contact; 10/10 scholar wave-4 deaths as mantle-holder).

Namespace: `havencontact` (scripts/diag-havencontact.js, scripts/sweep-havencontact.js, scripts/diag-havencontact-analyze.js, scripts/test-havencontact.js). Disjoint from sibling loop-B namespaces (scholardistsafe*, storageshed*, sweep-storageshed-b5*, -materialsinflow, -defer5gate).

## PRE-REGISTRATION (§14 binding — written BEFORE the census sweep)

- **Binding question**: Name the dominant wave-4+ player exposure channel as a first-class origin class (`havencontact` = checkEncounter contact at the haven tile, split out of the old "field" label) and quantify it on current master so a haven-defense design call (Steve) has measured inputs: havencontact rate/100vd, feasted vs not, mantle-holder deaths in the channel, muster/feast coverage of the channel.
- **Census design**: 16 configs — the havendraw seed block 65801–65808 (verified the havendraw block; fresh for this instrument) × {leadfeast, belongfeast} = 16 configs, ONE arm (DIAG census, no lever — the substrate policy itself is the subject). Policy = AD.armedFor(AD.normBase(base)) (the mantlechain DIAG substrate's control stack), no policy layers added or removed.
- **Substrate env**: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (exactly the havendraw census substrate, for comparability).
- **Horizon**: 180d death-aware (dead villages stop; +10d tail max). Justification: identical to the havendraw census (same seeds, same substrate) — wave 4's standing gate opens ≥day 25 and the havendraw corpus produced wave-4 fights on 14/16 configs within 180d. The binding wall question (scholars dying in wave-4 haven fights) needs the full wave-4 window open.
- **Origin taxonomy** (classifyOrigin + classifyPlayerOrigin, unit-tested): PLAYER fights (combat_start tele) → feastdraw, raidreach, tent, trap, reengage, pending-other (all as in havendraw-b) PLUS **havencontact** — classifyOrigin resolves 'field' (checkEncounter bumps / warning-lapses / everything else) AND playerAtHaven() at combat_start. Named classes keep priority (a feast draw faced at the haven is feastdraw, not havencontact). True field = 'field' with the player away from the haven. atHaven = playerAtHaven() at combat_start for player fights; villager taxonomy unchanged (raiddefense / lingerer / havengrounds / field).
- **DIAG-GO (binding)**: (a) >=95% of wave-4+ player fights attributed to named origin classes including havencontact over 16 configs; (b) the havencontact share measured with the feasted/not split; (c) mantle-holder deaths in the havencontact channel counted; (d) muster and feast coverage of the havencontact channel quantified; (e) design-call inputs delivered (havencontact rate, draw levers that exist, defense levers that exist vs missing, missing lever named). GO = all five delivered. DIAG-insufficient-data if wave-4+ player fights < 10 across the corpus.
- **Wall numbers (reported every run)**: national / table / wins, wave 4–5 unlocks, median/max survival, death-cause shares, trap acquisition by source, counter discovery/counter-kill rate, young-link succession survival, tier-2 and wave-3 reach.
- **Sense**: transcripts of havencontact fights read per the SENSE-TESTING LAW — do they read as ambient contact ("stood in the path of") vs assault? Do scholar deaths in this channel read with weight (mantle passing mid-fight, village reacting)? Judge meaning, not counts.
- **Canon check**: docs/CANON.md + docs/MONSTER-WAVES.md read first (2026-10-23). The draw/defense mechanics below are grounded in src/js (havenGrowth.js, feastBuff.js, shelter.js) as documented in sim-havendraw-b.md; no game design is invented or changed here.

## The finding being instrumented (from sim-havendraw-b.md)

93/105 wave-4+ player fights classified 'field' (checkEncounter contact at the haven tile) — the haven isn't besieged, it's stood in the path of. The "field" label hides the dominant channel (89%). This arm names it `havencontact` and re-runs the census with the split built into the instrument, on the same seed block and substrate.

## Defensibility inventory (unchanged from sim-havendraw-b.md — same substrate, same master line)

- shelter.js shelterMusterCheck: auto-muster (wave-4+ world monster within 2 tiles of Haven; stand down past 3), sheltered villagers excluded from wild jump / raid draft / duty loops. Manual muster/stand-down Haven-panel verbs.
- havenGrowth.js havenRaidTick: reactive raids (3+ world monsters AND pantry ≥ 3000 kcal → 18%/day, ≥7d spacing). Palisade (havenTier ≥ 2) shaves 25% maxHp. Defenders = healthy villagers at home, blow-by-blow. Table-sitting sanctity.
- feastBuff.js drawFeastScavenger: each fresh armed feast draws one wave-appropriate scavenger to the haven's edge as a pending encounter (feastDraw.chance default 1.0; 60%-newest-wave targeting); faceFeastDraw / driveOffFeastDraw.
- Watchers: narrative only. No watch assignment, no guard posts, no fortifications beyond palisade, no defense duty — and nothing addresses the ambient checkEncounter-at-haven channel.

(Results, attribution table, sense test, metric review, proof, and kill/GO record below — appended after the census.)

## Results (census complete — 16/16 configs, anchor 98f5f22c3df0, 2323 village-days)

### (a) Attribution table (scripts/diag-havencontact-analyze.js)

- Wave-4+ player fights: 66 (2.84/100vd). Attributed to named origin classes: **66/66 (100.0%) — DIAG bar ≥95% MET.**
- Origin shares: {feastdraw:12, **havencontact:53**, field:1}. Havencontact share: **53/66 (80.3%)**.
- havencontact/atHaven consistency violations: 0 (havencontact ⟺ base field + atHaven + verifiable mid, by construction).
- Comparability vs the havendraw corpus (same seeds, same substrate, anchor f5f19667ce19): 105 → 66 wave-4+ player fights (fewer wave-4 unlocks: 11/16 vs 14/16 configs; villages survive longer: median 173d vs 137d). The channel share is stable across anchors: 80.3% vs 88.6%.

### (b) The havencontact channel

- 53 fights, **2.28/100vd**. Feasted: 1; not feasted: 52.
- All wave 4. Top species: reunion 14, suburb 11, algorithm 9, congregation 6, eater 6, eulogy 4, strike 1, influencer 1.
- True-field wave-4+ fights: 1 (0.04/100vd). Feastdraw: 12 (0.52/100vd).
- **Raid-shadow proxy: 45/53 (≤85%)** had the same mid as a raider in a fired raid within the prior 6d (the lingerer gorge window) — mostly raid aftermath: unmet raiders bumped at the haven the morning after. **8/53 (~15%) true-ambient** (no raid link). The proxy is mid-only (upper bound; monster identity is not recorded at combat_start).
- Wave-4+ villager fights: 52 (2.24/100vd), haven-class 49.

### (c) Deaths in the havencontact channel

- In-scope veteran wave-4 deaths: 6 (0.26/100vd) — by origin {havencontact:5, feastdraw:1}. **All 6 are scholar (mantle-holder) deaths.**
- Scholar deaths in havencontact: **5 (0.22/100vd)**: Samuel d113 (s65802/belong), Lena d160 (s65802/belong), Yara d179 (s65803/belong), Samuel d112 (s65802/lead), Lena d140 (s65802/lead).

### (d) Muster and feast coverage of havencontact

- Raids fired: 201 (8.65/100vd). Musters: 19 (0.82/100vd), standdowns 7, mean sheltered 6.5. Musters active 16.8% of days (391/2323).
- **48/53 havencontact fights happened DURING an active muster**; 31/35 contact fight-days (88.6%) were muster-active; 0/53 within 2d after (not during).
- Mechanism (code-grounded): shelter.js shelterEveryoneBut (src/js/shelter.js:101-108) always excludes the scholar — `vids = roster.filter(vid => vid !== this.villagerId ...)`. The muster detects the threat correctly (it fires exactly when wave-4+ threats are within 2 tiles of Haven) and shelters the village; **the mantle-holder walks into the contact channel anyway**. This is not a detection failure — it is a coverage gap for the one person who dies in this channel.
- Feast: a separate named channel, not coverage. Feast-draw: 89 casts, 89 drawn, by wave {1:28, 2:29, 3:19, 4:13}; faced 28/28, driven off 0/28. Feast creates its own 12-fight channel (0.52/100vd); it does not touch havencontact.

### (e) Design-call inputs (for Steve's haven-defense decision)

1. **Rate**: havencontact 2.28/100vd (53/2323 vd), 80.3% of wave-4+ player exposure; ≤85% raid-shadow, ~15% true-ambient.
2. **Draw levers that exist**: feast draw (89 casts, 100% on fresh feasts, 60%-newest-wave targeting, 13 wave-4 draws); raid tick (8.65/100vd reactive; 18%/day when 3+ world monsters AND pantry ≥3000 kcal, ≥7d spacing); lingerer gorge (6-day drift valve).
3. **Defense levers that exist**: auto-muster (0.82/100vd, ~6.5 sheltered, detects the threat — shelters villagers); palisade (25% maxHp shave, havenTier≥2); raid defenders (healthy villagers at home, blow-by-blow); table-sitting sanctity.
4. **The missing lever, named**: **the scholar's haven defense**. Nothing covers the mantle-holder AT the haven: no watch/guards/fortifications beyond palisade, no defense duty — and the muster, the only reactive defense, excludes the scholar by construction. The channel costs 5 scholar wave-4 deaths / 2323 vd (0.22/100vd), 48/53 of them during an active muster the scholar cannot use. What an effective lever looks like (early-warning herald for the player, a way for the sheltered village to fight for the scholar, or something else entirely) is Steve's design call — this DIAG delivers the inputs, not the design.
5. **Cost of the status quo**: 5/6 in-scope veteran wave-4 deaths are scholars in havencontact; the muster shelters everyone except the person at risk.

### Sense test (SENSE-TESTING LAW)

- **Raid-shadow** (d113 s65802/belong, scholar Samuel vs The Suburb): reads as the morning after a raid — the d112 raid beats herald the unmet raider ("Nobody met The Suburb — it's still out there at the treeline. It'll gorge every night until it's driven off."). Not silent; the fiction provides the herald. The death lands with weight: "The Codex turns a page on its own. Samuel Hipango is dead. You didn't ask. It knew." / "The village stops. Somebody screams. Somebody else starts digging." / "Samuel is dead — and the dead hold no treaties. Every link Haven has shakes." The mantle passes in-beat: "Sofia joins your party. 'Someone should watch your back. Might as well be me.'"
- **True-ambient** (d160 s65802/belong, scholar Lena vs The Reunion ×3): no herald — no muster, no raid, no scout report. The only warning is the fight's own opening beat ("⚠️ 1 threats: The Reunion 1 (×3) — all here, all now. Your party: Diana, Rahmat. You are outnumbered — fight like it."). Reads as walking into it. The death reads with weight: "You carry the weight of it. They died beside you." Diana dies the next day in the follow-on fight.
- Villagers act like people: Aroha binds a wound mid-fight ("field medicine, +20 HP"), Greta squares up to watch ("Give it hell."), Rahmat calls targets ("Watch its left side!"), Sofia and Rahmat join the party after deaths.
- Robotic notes: strike-line spam ("Aroha strikes the Suburb" ×3, "Rahmat strikes the RERUN ×5 The Eulogy" ×2), "The village is rattled" verbatim repeats, doubled Eulogy narration verses.
- **PASS with notes** on both channels.

### Wall numbers (this corpus)

national 8/16, table 0/16, wins 0/16, wave4 11/16, wave5 0/16, median survival 173d, max 180d. Death causes: combat 387, villager combat 149, monster 38, expedition 26, starvation 17. Traps crafted 8, looted 0. Counters discovered 326. Young-link succession 226/230 survived. Tier-2 reach 14/16, wave-3 reach 14/16, arc≥2 16/16. w4 scholar kills 2, w4 villagers 3. (Scale note: 3 configs reached global — s65804/s65806/s65808 leadfeast.)

### Metric review

- DIAG-GO: all five pre-registered bars delivered — attribution 100% ≥ 95% ✓, havencontact share + feasted split measured ✓, mantle-holder deaths in-channel counted ✓, muster/feast coverage quantified ✓, design-call inputs delivered ✓. Corpus is wave-4-light (66 fights) but 6.6× above the 10-fight insufficient-data floor.
- No metric revision needed. Note for the next run: the raid-shadow proxy is an upper bound (mid-only join) — if a future arm needs the true split, record monster lingering-flags at combat_start in the instrument.
- The E1 proof caught and fixed a real semantic edge pre-sweep: classifyPlayerOrigin now requires a verifiable mid for the havencontact label (no phantom havencontact on unverifiable rows).

### Proof

scripts/test-havencontact.js — run on the census anchor (98f5f22c3): **31/31 GREEN** (E0 shape incl. no-src/js-requires; E1 synthetic RED→GREEN on the havencontact split incl. named-class priority and the null-mid edge; E2 determinism byte-identical; E3 off-gate instrument-ON-vs-OFF byte-identical; E4 live schema with 0 instrumentErrors and the origin/baseOrigin split consistency holding live).

### Verdict

**DIAG-GO**: `havencontact` is now a named, proven, measured origin class — the blank is filled. Finding #831 refined: the wave-4 player exposure channel is havencontact (80.3%, 2.28/100vd), mostly raid-shadow (≤85%), with the muster detecting the threat but excluding the scholar by construction — 48/53 contacts happen while the muster is active, and 5/6 veteran wave-4 deaths are scholars in this channel. The missing design lever is named: **the scholar's haven defense**. Filed to sim-findings.md as the #831 update.
