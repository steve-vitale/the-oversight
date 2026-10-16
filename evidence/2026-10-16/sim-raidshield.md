# sim-raidshield — the shield wall: apex-aware raid defense (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop ARM sim-raidshield, run_id fleshout-20261016T0750Z, axis scale-onramp (blocking).
**Type:** LEVER ARM — game-code arm (src/js/havenGrowth.js only), env-gated RAIDSHIELD=1, default OFF.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** sim-fieldfightsrc (evidence/2026-10-16/sim-fieldfightsrc.md) delivered the fork verdict FIELD-EXPOSURE-DOMINANT: 74 post-invite monster-verb villager deaths = 21 RAID (28.4%) + 51 EXPEDITION (68.9%) + 2 WILD-ENCOUNTER (2.7%). sim-apexpredators named the raid-channel teeth: The Reunion (7 raid kills), THE EATER (3, 8/8 one-round), The Eulogy (3), The Cancellation (2), The Editor (1) — all wave-3+, 11/21 raid deaths one-round kills. The patrol line is exhausted (patrolassign + patrolwave both killed): its binding lesson is that defense must THIN the threat (kill raiders), never stand villagers down or shelter them into preserved threats. The unbuilt answer (no arm owns it): raid-defense against apex raiders — finding #161's territory (wave-4/5 lingerers undrivable; the call-for-help chain exists but arrived help never fights, #164).

**The lever (design call, Steve 2026-10-07 — figure it out yourself, documented, he can overrule):**
THE SHIELD WALL — apex-aware defender assignment in havenRaidTick + a treeline sortie for lingering apexes, both in src/js/havenGrowth.js, env-gated RAIDSHIELD=1 (default OFF; gate-off = the old line, byte-identical):
1. Raiders sorted apex-first (wave desc, ties by distance); defenders sorted strongest-first — archers first (the volley opens at range and can drop/drive the lead before round 1: the only honest answer to a one-round killer), then healthiest; shielded ALWAYS last (the FACILITATION 'shield' promise is kept).
2. Wave-4+ raiders get a lead defender PLUS a reserve who follows in if the raider still stands (pack finish — sequential real fights, the wounded apex faces fresh arms). Small teeth wait: unmet low-wave raiders linger and gorge — the honest trade, pantry kcal for villager lives. Defense is a trade, not a tax.
3. THE SORTIE (the #161 answer): a wave-4+ lingerer that has held the treeline 3 dawns gets answered by the village's own two strongest at-home defenders (lead + reserve-if-standing, {raid:true} real fights; a kill resolves the aid crisis 'fought' via commsTick). Never before 3 dawns (the player's call-for-help window stays real), never mid-finale (table sanctity), never while help marches, at most every 2 days.

**PRIMARY (binding):** post-invite 'monster'-verb RAID-attributed villager combat deaths per run (fieldfightsrc's srcOf: opts.raid from havenRaidTick OR m.lingering — the sortie's fights carry both markers, so the existing instrument covers them with zero changes). **GO = armed sum ≤ 0.85 × control sum on identical seeds.** The channel caps at ~28% of the population (0.72× is the theoretical floor if the channel vanished); 0.85× = just over half the channel gone — the honest GO for a defense arm.

**Attribution coverage gate:** ≥95% of post-invite monster-verb villager combat deaths attributed (fieldfightsrc's bar); below that the primary is no-coverage.

**Guardrails:** national ≥ control−2; median survival ≥ control−10d; no new death mode.

**Substrate:** pre-seat, SEATDRIVE=0 EXPLICIT. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1. Policies: TF.leadfeast / TF.belongfeast (courtship road, matching the diagnostics).

**Seeds:** PILOT 8 [111, 122, 133, 144, 155, 166, 177, 199] (verified 0 `-s<seed>.json` hits across evidence/2026-10-16/perseed-*/ before the run) × {leadfeast, belongfeast} × {control (RAIDSHIELD unset), armed (RAIDSHIELD=1)} = 32 runs, own paired control, identical seeds both sides. CONFIRM 8 FRESH [210, 221, 232, 243, 254, 265, 276, 287] reserved — NOT run (no confirm on NO-GO).

**Seed-freshness caveat (documented, §14):** a post-launch full-evidence grep found seeds 122/133/144 were used on 2026-10-15 by loop B's thirstsafe arm (`evidence/2026-10-15/perseed-thirstsafe/belongseek-{armed,control}-s<seed>.json` — different policies, different substrate, different system). The pre-registered check was scoped to evidence/2026-10-16/perseed-*/ and passed as specified; the seed set was chosen as a round-number sequence before the overlap was known, and no thirstsafe results were consulted — no cherry-picking occurred. Bias risk assessed negligible (unrelated system/policy/substrate), so the pilot stands; the caveat is recorded for the confirm design.

**Horizon:** 180d death-aware (matches the diagnostics; the full post-invite ladder window must be observable).

**Exercise gates:** (1) armed runs show shield-wall beats (🛡️) on raids with wave-4+ raiders; (2) ≥1 sortie fires on armed across the pilot (a wave-4+ lingerer holding 3 dawns).

**Schema:** per-seed JSONs MUST carry numeric national/table/wins/exiled keys (schema-drift LOUD class).

**Instrument:** scripts/sweep-raidshield-20261016.js (composes scripts/fieldfightsrc-20261016.js's withFieldFightSrc/srcOf — read-only attribution, zero changes; RAIDSHIELD=1 set on armed only) · scripts/analyze-raidshield-20261016.js · scripts/test-raidshield-20261016.js (proof: unit 22/22 RED→GREEN, SMOKE, DET gate-ON self-consistent + gate-OFF-vs-HEAD baseline tree).

**Gates before spend:** unit RED→GREEN (22/22); SMOKE green (20d × 2 policies × gate off/on, no crash); DET green (4 identical-seed pairs gate-ON both-repeat trajectory-identical); BASELINE DET (gate-OFF in this tree vs pristine-HEAD tree, scripts/det-raidshield-baseline-20261016.js — the else-branch is the old code).

**Kill protocol:** on NO-GO, havenGrowth.js reverts to HEAD (git checkout — the layer is game-code, zero-trace), instruments + evidence land, the funnel named.

## Instrument correction (documented, §14)

The first pilot launch (11/32 runs) measured an INERT lever and was killed + purged: world-monster entities never carry `.wave` (spawnWorldMonster builds id/hp/tiles only) — so the `(m.wave||1)>=4` apex filter never fired, the wall never formed, no reserves, no sorties. The fix: `raidshieldWaveOf(m)` looks the wave up in the data def by id (the apexpredators pattern) — proven by unit r4/r5 (def reads: reunion=4, cancellation=5, bulldozer=1, unknown=1, entity-carried wave ignored) and by a forced-raid probe (wave-4 congregation raid → "🛡️ The shield wall forms — strongest arms to a church where the hymns are static. The small teeth can wait their turn."). The 11 purged runs measured only the inert branch; the seed set stands (no valid measurement was taken, no selection). All gates re-proven after the fix: unit 24/24, SMOKE, DET 4/4 gate-ON, baseline gate-OFF ≡ HEAD identical. Adjacent pre-existing bug filed, not chased: raid crisis tier always wave 1 (sim-findings.md 2026-10-16).

## Results

Sweep complete 2026-10-16: 32/32 runs finished (16 pairs), 0 dropped beats, exit 0. One mid-run infrastructure event: the first background sweep was reaped by the runtime at 9/32 with no error; resumed with RESUME=1 (completed pairs skipped, partial pair re-run deterministically) — documented, no data loss.

Per-seed JSONs: evidence/2026-10-16/perseed-raidshield/ (numeric wall-metric keys) · beats: evidence/2026-10-16/raidshield-beats/ · analyzer: scripts/analyze-raidshield-20261016.js

### PRIMARY: NO-GO — 1.400 vs the 0.850 bar (armed 35 vs control 25)

| | control | armed |
|---|---|---|
| post-invite monster-verb RAID deaths | 25 (direct 18 / lingering 7) | 35 (direct 31 / lingering 4) |
| ratio | — | **1.400** (bar ≤ 0.850) |

Per-pair sign: armed better 4 / worse 9 / tied 3. Not a near-miss — armed is 40% worse.

### Exercise gates: both PASS

Shield-wall beats 41, reserve beats 46, sorties 1 — the lever had full contact (every armed run with a wave-4+ raid formed the wall).

### Guardrails: two FAILs

- national: control 12/16, armed 8/16 (need ≥ 10) ✗ FAIL
- median survival: control 132d, armed 100.5d (need ≥ 122d) ✗ FAIL (−31.5d)
- new death mode: none — the analyzer's 3 armed-only family strings investigated: 'monster/Ad Break' + 'monster/Buffering' are the pre-existing agency-expedition monster-name-cause path (control has the same path with other names: 'Choir Toad', 'The Union Rep'); '?/the expedition' is the pre-existing scholar-dies-on-expedition-return path (game.js:7906), engine-owned, not arm-introduced. Guardrail holds with that note.
- exiled: 0 = 0 ✓

### Wall numbers

| | national | table | wins | median |
|---|---|---|---|---|
| armed | 8/16 | 12/16 | 0/16 | 100.5d |
| control | 12/16 | 14/16 | 0/16 | 132d |

Armed villages die younger and reach less. The wall stands; the arm pushed it the wrong way.

## Mechanism autopsy: the wall feeds the teeth

The reserve is the killer. Against ork-capable apexes (Reunion, Eulogy, Spoiler, Influencer — 52–100% one-round-kill), the second defender doesn't finish a wounded apex; it walks into the same one-round killer the lead just died to:

- leadfeast-s199-armed d139: "a man, maybe 60s follows a woman, maybe 60s, with a limp in — The Spoiler still stands." Ella AND Elijah both died to the Spoiler (lead + reserve, same raid).
- belongfeast-s155-armed d66: the Reunion killed Miguel AND Elena — lead + reserve, both dead.
- belongfeast-s155-armed d69–70: the sortie ("Three dawns The Influencer has held the treeline. a woman, maybe 30s takes the shield wall out — no more waiting.") fed Ruslan (d69) and Wanjiru (d70) to the lingering Influencer. The village died d75 (control: d128).

Channel decomposition: direct RAID deaths ROSE 18→31 while lingering fell 7→4. The wall converts lingering-channel deaths into direct-fight deaths at ~2:1 — it doesn't thin, it doubles the body count. And the strength-ordering spends the village's best arms first (archers, healthiest), hollowing out everything else: national −4, median −31.5d.

The refinement hypothesis is falsified for the same reason the patrol line died: **there is no arrangement of WHO fights that beats a one-round killer — the price of thinning apexes is paid in villagers, and the shield wall pays it twice.** The raid-defense answer for apexes is not a better defender line. (What remains: killing apexes without feeding villagers to them — the counter/trick game — or the wmax crisis-tier bug filed today, which under-prices apex raids in the call-for-help chain.)

## Sense-reads (SENSE-TESTING LAW)

**leadfeast-s199-armed** (6 wall / 7 reserve beats): the fiction is coherent and the defenders read as people — "🛡️ The shield wall forms — strongest arms to Big Loud, The Editor, The Suburb. The small teeth can wait their turn." (knowledge-gated alias "Big Loud" for The Algorithm reads true — the village doesn't know its true name), "a woman, maybe 60s, with ink-stained fingers follows a woman, maybe 20s in — The Eulogy still stands." Full descriptors, never first-word-split (the patrolwave "A and A" defect class avoided). But the meaning is grim: d111 "Miguel follows Thiago in" → Thiago died to the Eulogy; d139 the Spoiler took Ella and Elijah together.

**belongfeast-s177-armed** (5 wall / 5 reserve): d96 The Rerun + The Reunion raid — Mara died to the Rerun; d104 Big Loud/The Editor/The Suburb — Caleb died to the Editor. Sensical person-decisions, real costs, wrong outcome.

**The one sortie** (belongfeast-s155-armed d69): "Three dawns The Influencer has held the treeline. a woman, maybe 30s takes the shield wall out — no more waiting." A genuinely human beat — and it fed two villagers to the Influencer. The beat is good; the verb is wrong.

Template fingerprints: none new — the wall/reserve/sortie beats rotated cleanly across 88 firings with no robotic repeat.

## Village assessment

Armed villages look like villages that learned the wrong lesson from the patrolwave: they meet every apex at the treeline with their best arms, twice. The treeline has a wall (41 formations), the archers open at range, the reserves follow in — and the Reunion, the Eulogy, the Spoiler, the Influencer eat them in pairs. Who dies: the strongest first (archers, healthiest — the strength ordering spends the village's best), then everyone else sooner (median −31.5d). Who thrives: nobody — national 8/16. What was missing: nothing a defender line can provide — the threat needs REMOVING without bodies (counters, tricks, the aid chain priced honestly), not a better queue into its mouth. The blank is filled: apex-aware defender assignment does not move the raid channel — it worsens it 25→35.

## Metric review (§14)

The 0.85 bar worked exactly as designed: this is not a near-miss (1.400 vs 0.850), it's a genuine negative, and the metric caught it without ambiguity. The direct/lingering channel split (recorded by the composed fieldfightsrc instrument) proved its worth — it shows the mechanism (lingering 7→4 purchased with direct 18→31), not just the verdict. The guardrails fired as backstop (national −4, survival −31.5d). No revision proposed: the metric did its job, the bar was honest, the kill is clean. Process notes: (1) the seed-freshness caveat above (3/8 seeds saw prior unrelated use — negligible, recorded); (2) the mid-run reaping — RESUME=1 worked, no data lost; (3) the wave-on-entity bug class: any future arm reading monster properties off world-monster entities must use the def lookup — entities carry id/hp/tiles only.

## Convergence state

**killed-at-pilot.** The scale-onramp axis is not converged. The raid-defense line is now exhausted alongside the patrol line: apex-priority + pack-finish + treeline sorties worsen net raid mortality (25→35) and damage the village (national −4, survival −31.5d). The durable lesson, third data point: there is no free lunch against one-round killers — thinning apexes costs villager lives, and no assignment of WHO fights changes the price. Named next (backlog, not chased): killing apexes without villager bodies (counter/trick game), or the filed wmax crisis-tier bug (apex raids under-priced in the call-for-help chain).

## Telemetry deviation check

3 LOUD lines, all EXPLAINED (the known substrate-mismatch class, cf. fieldfightsrc): national baseline 12 → current 20, table 16 → 32, wins 16 → 0. The scale-wall baseline reflects the full win-side stack (seat driver landed); this arm runs the pre-seat substrate (SEATDRIVE=0 explicit) where wins are 0 by construction, and the "current" counts pool control+armed (32 files). Same-substrate comparison is clean: control national 12/16, table 14/16, wins 0/16 vs fieldfightsrc's 11/16, 13/16, 0/16 — no drift. Baseline NOT rolled forward.

## Proof artifacts

- scripts/test-raidshield-20261016.js — 22/22 unit RED→GREEN; SMOKE/DET gates
- scripts/sweep-raidshield-20261016.js — paired sweep (armed = RAIDSHIELD=1)
- scripts/analyze-raidshield-20261016.js — verdict analyzer
- scripts/det-raidshield-baseline-20261016.js — gate-OFF vs pristine-HEAD trajectory check
