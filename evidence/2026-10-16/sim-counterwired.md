# sim-counterwired — is wave-3+ counterplay actually wired? (flesh-out loop ARM 3, 2026-10-16)

**Run:** flesh-out loop ARM sim-counterwired, run_id fleshout-20261016T0715Z (coordinator claim covers 3 arms; axis scale-onramp blocking).
**Type:** DIAGNOSTIC instrument — zero src/js, zero policy changes. Read-only census of the discovery→use chain.
**Named next from:** evidence/2026-10-16/sim-patrolwave.md (patrol line exhausted; "killing apexes without feeding villagers to them = the counter/trick game (wave-1/2 counters exist; wave-3+ counterplay is engine-real but unwired to the ledger)") + finding #281 ("wave-1/2 counters bright (12–25), wave-3+ tricks dark (0–1)").

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** patrol-line arms concluded apexes must be killed without feeding villagers to them. Wave-1/2 counters exist as data+ledger machinery; wave-3+ counterplay is engine-real (sigW3a/b/c, sigW4.js, sigW5.js) but MONSTER-WAVES.md declares waves 3–5 "deliberately counter-less". This arm measures the sim-side truth: does discovery happen, does it convert to kills, does it save lives?

**(a)** counter discovery by wave — which species' counters get discovered, by whom (scholar vs villagers);
**(b)** discovery→kill conversion by wave — discovered counter → actual counter-kill of that species vs brute-force kills of the same species;
**(c)** survival differential — runs with a wave-3+ counter known vs not: field-death rate, median survival;
**(d)** whether villagers (non-scholar) ever execute counters;
**(e)** the wiring verdict: where exactly does the discovery→use chain break for wave-3/4/5?

**PRIMARY (binding):** >=95% attribution of counter-discovery events AND counter-kill events by wave across the sweep (id/mid → def wave; all instrument reads carry wave). A miss is NO-GO, never re-scored.

**Substrate:** pre-seat, SEATDRIVE=0 EXPLICIT (finding #389). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1. Policies: TF.leadfeast / TF.belongfeast (tribfloor exports; same stack as the sibling patrolwave arm).
**Seeds:** 8 FRESH [611,612,613,614,616,617,618,701] × {leadfeast, belongfeast} = 16 runs. FRESH = 0 per-seed hits across evidence/ (verified by repo-wide grep across evidence/2026-10-14,15,16 — per-seed filenames AND seed mentions; zero hits on all 20 candidates before selection).
**Horizon:** 180d death-aware (counters for wave-3+ only matter once waves unlock; dead villages stop simulating).
**Instrument:** scripts/census-counterwired-20261016.js (static) · scripts/sweep-counterwired-20261016.js (16-run sweep, read-only tele/state attach) · scripts/analyze-counterwired-20261016.js · scripts/test-counterwired-20261016.js (proof).
**Gates before spend:** proof 28/28 GREEN + 2 RED confirmed (synthetic discovery sequences of known wiring; det-gate instrument-vs-bare byte-identical on identical seeds; SMOKE green on 20d run with live counter-event capture).
**Sibling note:** loop B landed 7399a542 mid-sweep (evidence+instruments only, 0 src/ files) — worktree re-verified intact, sweep substrate unchanged.

## Static census: the wiring table (instrument, scripts/census-counterwired-20261016.js)

72 monster defs. The `counter` field = the ledger convention (monsterCounterKnown: state.monsterCounters[id]===true AND def has counter; counter-known kills score 2 ledger points). `villagerTricks` = the wave-3 signature-trick village channel (non-ledger; scoring "stays the signature workers' call" per game.js comment).

| wave | n | counter field | perform-kind wired (ch1) | perform-kind DEAD | villagerTricks | nothing at all |
|---|---|---|---|---|---|---|
| 1 | 25 | 25/25 | 22 | 3 (cliffhanger:eyes, sunback:blindside, sweeps_week:face_it) | 0 | 0 |
| 2 | 15 | 15/15 | 15 | 0 | 0 | 0 |
| 3 | 9 | 0/9 | — | — | 3 (spool, chorus_line, buffering) | 6 |
| 4 | 10 | 0/10 | — | — | 0 | 10 |
| 5 | 10 | 0/10 | — | — | 0 | 10 |
| 6 | 3 | 0/3 | — | — | 0 | 3 (canon-doc silent on wave 6 entirely) |

Notes:
- The three w1 DEAD kinds (eyes/blindside/face_it) have **no case in Game.checkMonsterCounter's switch** (grep-confirmed across src/js) — the perform-the-trick channel (ch1) cannot fire for cliffhanger/sunback/sweeps_week. Channels 2 (taught at haven via beasttricks) and 3 (codex hint on slay) still work. Field-AI parity: villagerTrickAction's actuable list (shout, offer_food, spool/chord/buffering) likewise excludes them — no villager can execute these three tricks either.
- Wave-3: 3/9 species have village-learnable tricks (villagerTrickDefs) wired to field AI via villageKnowsTrick (villagerTrickAction actuates spool feed-waits, chorus dance, buffering stand-still). The other 6 (redactor, gavel, focus_group, terms_of_service, callback, ad_break) have engine-real signature mechanics + `weaknesses` data, but no knowledge representation — the field-AI comment documents them as "un-actuatable in the abstract field model" (need reading/viewership/ritual/adds).
- Waves 4/5: signature counterplay is ENGINE-REAL (sigW4.js 928 lines, sigW5.js 1562 lines — heresy, scab, kill-followers, deliberate jank, novelty, escape, contradict-verses, tank, poison-meal; off-script improv, floor retrieval, contradiction jams, margin messages, cheap fulfillment, binding questions, venue ownership, boring fights, sacrifice, bad notes) but has ZERO knowledge wiring: no counter field, no villagerTrickDefs entry, and monsterCounterKnown/villageKnowsTrick cannot see it. Villagers and scholar fight w4/5 apexes with no learnable trick to act on.
- Canon drift: MONSTER-WAVES.md says 15/15/9/9/8 (56 total, "wave 2 = 15 monsters"); data now has 25/15/9/10/10/3 (72 total): wave-1 grew by 10 species (e.g. The Mountain Lord, Rut King, Anaconda Empress), wave-4 has The Herald unlisted, wave-5 has The Commercial Break + The Opening Credits beyond the doc's 8, and wave-6 (Network Mast/Limb/Heart of the Network) exists nowhere in canon. The doc's "Monster counters (waves 1–2)" section lists 14 kinds; data uses 17 (blindside, face_it, eyes added).
- Proof also confirmed: `counter_observed` tele events carry `{id, n, vid}` but NO `via` (actor attribution comes from vid, not via) — an engine telemetry inconsistency, documented not fixed (instrument-only arm).

## Results (sweep complete 2026-10-16 ~08:40 UTC, 16/16 runs finished)

Per-seed JSONs: evidence/2026-10-16/perseed-counterwired/ (numeric wall-metric keys) · beats: evidence/2026-10-16/counterwired-beats/ · analyzer: scripts/analyze-counterwired-20261016.js.

### PRIMARY: GO — 100.0% attribution (773/773 events wave-attributable, bar ≥95%)

348 counter-discovery events + 425 counter-kill events (waveKillLog), every one carrying id/mid → def wave. Diagnosis is on solid ground.

### (a) Discovery by wave — the wave-3+ line is dark by construction

| wave | discovery events | distinct species (of defs) | channels |
|---|---|---|---|
| 1 | 222 | 25/25 | taught/observed/trick |
| 2 | 116 | 15/15 | taught/observed/trick |
| 3 | 10 | 3/9 — exactly spool, chorus_line, buffering (the wired set) | observed only |
| 4 | 0 | 0/10 | — |
| 5 | 0 | 0/10 | — |
| 6 | 0 | 0/3 | — |

Channel shares: taught 167 (villagers teaching at the haven) · observed 162 (survived encounters) · trick 14 (scholar performing the trick mid-TB-fight) · scholar-observed 5. Discovery is OVERWHELMINGLY SOCIAL — the village learns together (Steve 2026-10-10's design working as built); the Undertale perform-the-trick moment fired only 14× in 16 runs, all by the scholar.

### (b) Discovery→kill conversion — knowledge converts, execution doesn't

- 339 kills of discovered species AFTER discovery vs 57 BEFORE vs 7 brute-force-of-never-discovered.
- In ledger terms, those 339 post-discovery w1/w2 kills scored the 2-pt counter-kill bonus (monsterCounterKnown gate) — the counter machinery's real economic value IS flowing: known tricks accelerate wave unlocks.
- But **counter-EXECUTED kills (rec.trickLog non-empty): 3/425** — all w1 hummice via the shout trick (2 by villagers in contest/agency field fights, 1 by the scholar in a contest). The discovery→execution chain is nearly dark even for wave-1/2: the ledger bonus fires on KNOWLEDGE, not on performed tricks.
- Wave-3: 4 kills after discovery + 2 before + 4 brute-force (spool×2 brute, chorus_line×2 brute, redactor, terms_of_service×2, callback, ad_break). 9 species killed ONLY by brute force across the sweep: redactor, strike, chorus_line, suburb, terms_of_service, finale_crew, callback, congregation, ad_break.
- The supplementary _trickTally probe (3 belongfeast 180d runs): field executions {shout:6} on one run, zero on the other two. Only the shout kind ever fired — offer_food, spool feed-waits, chorus dance, buffering stand-still never executed in the probes despite known tricks on one run.
- The field AI's LEARN-VS-FIGHT judgment DOES read villageKnowsTrick (intent 'engage' when known) — knowledge changes fight posture, just not via trick performance.

### (c) Survival differential — no benefit measured; survivorship confounds it

- wave-3+ trick known (n=9): median 136d, max 180d, 41.33 field deaths/run, wins 0, national 7/9.
- wave-3+ trick NOT known (n=7): median 115d, max 180d, 40.00 field deaths/run, wins 0, national 2/9.
- METRIC HONESTY: the differential cannot be causal — you must survive to ~day 75+ to unlock wave 3 and meet its monsters twice, so "known" selects for already-long-lived, already-stronger runs (national 7/9 vs 2/9). Field-death rates are identical (41.3 vs 40.0/run). NO-GO on any claim that w3+ tricks save lives on current data; the confound makes the comparison structural, not the trick.

### (d) Do villagers (non-scholar) ever execute counters? — YES, rarely

2 villager kills with trickSummary (hummice, shout, contest + agency channels) + 1 scholar kill + 6 field shout executions in the tally probe. Villagers both learn (observed/taught channels) and execute — but execution is ~1% of the kill flow (3/425). The villager counter game is real, wired, and nearly dormant.

### (e) The wiring verdict — where the discovery→use chain breaks, by wave

1. **Wave 3, 6/9 species — breaks at REPRESENTATION.** redactor, gavel, focus_group, terms_of_service, callback, ad_break have engine-real signature mechanics and `weaknesses` data, but no knowledge representation anywhere: no counter field, no villagerTrickDefs entry, villageKnowsTrick cannot see them. The village cannot learn a trick that exists nowhere in knowledge state. (The 3 wired ones — spool, chorus_line, buffering — DO get discovered in sims: 10 events across 9 runs, via 'observed' — the non-lethal observation path works.)
2. **Wave 3, 3/9 wired species — breaks at ACTUATION FREQUENCY.** Discovery fires; the field AI gates exist (spool: wait rounds 1–3; chorus: dance on beat rounds; buffering: wait when vHp<60%). But wave-3 field fights are rare and lethal (2–7/run), the trick windows are narrow, and the probe measured ZERO executions despite known tricks. Knowing and doing are wired but almost never co-located.
3. **Waves 4/5/6 — breaks at CONTENT.** Zero wiring of any kind: no counter field, no villagerTrickDefs, no knowledge gate. The counterplay concepts exist only in sigW4.js/sigW5.js narration + `weaknesses` data (heresy, scab, novelty, escape, off-script, sacrifice...). Kills happen anyway — pure brute force (The Strike d63/d104, The Suburb d106, The Congregation d81, The Commercial Break d117, all villager kills, trick=null).
4. **Wave 1, 3 species — breaks at the perform channel.** cliffhanger (eyes), sunback (blindside), sweeps_week (face_it): counter fields exist, but checkMonsterCounter's switch has no case for their kinds, so the perform-the-trick channel can NEVER fire. Discovery works via taught/observed (measured: all three discovered in sims). Field-AI execution is likewise impossible for these three.
5. **The ledger bonus is knowledge-gated, not performance-gated** (a design fact, not a break): monsterCounterKnown requires state.monsterCounters[id] + mdef.counter; 335 post-discovery w1/w2 kills scored 2 ledger points. Wave-3 villagerTricks are explicitly NOT ledger-scored ("scoring stays the signature workers' call" — game.js). So even a fully-discovered wave-3 trick never accelerates anything in the ledger economy.

### Village assessment (plain words)

These villages look like villages that learn fast and fight dumb. The fire teaches: 18 counter tricks known by day 95 on a typical run, villagers bringing home observations ("Yara lived to tell it, twice — the village pieced it together"), the beasttricks topic circulating at the haven. Then they walk out and fight the old way anyway — 339 kills of species whose tricks they know, 3 kills using a trick. The ledger quietly pays out the knowledge bonus (wave unlocks move), so the learning is not wasted — it just never becomes Undertale. The wave-3+ apexes (The Strike, The Suburb, The Congregation) die by mob violence when they die at all, and nobody learns anything from the kill. The missing piece is not knowledge or courage — it's the representation gap: the village has no way to KNOW the w3+ tricks, and no wire from knowledge to action for the ones it could.

## Wall numbers

| metric | this sweep (16 runs, pre-seat) |
|---|---|
| national | 9/16 (leadfeast 8/8, belongfeast 1/8) |
| table | 15/16 (invited) |
| wins | 0/16 (pre-seat by design) |
| max wave unlocked | 5 (16/16 reached ≥4; waves faced [1,2,3,4,5]) |
| median / max survival | 136d / 180d |
| counter discovery / counter-kill attribution | 100.0% — PRIMARY GO |
| w1/2 species discovered | 40/40 |
| w3+ species discovered | 3/30 (spool, chorus_line, buffering only) |
| counter-executed kills | 3/425 (all w1 shout) |
| wave-4/5 kills | 5 (all brute force, all villagers, trick=null) |

Telemetry note for the coordinator: this arm's wall numbers are pre-seat by design — wins 0/16 matches the pre-seat substrate state (baseline scale-wall.json is the full win-side stack: national 12, table 16, wins 16). The expected LOUD class (wins 16→0, national 12→9, table 16→15) is substrate-mismatch, not drift. Per-seed JSONs use the `wins` key spelling (aligned with telemetry-check).

## Sense-read: counter-discovery arcs (SENSE-TESTING LAW)

**Arc 1 — Chorus Line, leadfeast-s611 (the non-lethal knowledge design working end-to-end).** d85: Yara survives a Chorus Line encounter (counter_observed n=1). d102: Yara survives again (n=2) — "💡 COUNTER LEARNED — Chorus Line: Dance on the downbeat. The kick only lands on beat 4 of the 4/4 count. Dance and it catches air — but dancing is your whole turn. (Yara lived to tell it, twice — the village pieced it together.)" Zero Chorus Line kills in this run (slain: 0) — the village learned the trick from two survived encounters without blood, exactly Steve's 2026-10-13 non-lethal knowledge call. The fiction teaches the actual mechanic (matches MONSTER-WAVES.md's 4/4 beat description). Coherent, earned, consequential (villagerTricks now gates field-AI dance behavior).

**Arc 2 — Buffering, leadfeast-s613.** d81: "💡 COUNTER LEARNED — Buffering: Stand still. It aims where you will be. Give it nothing to predict and it whiffs. (Jovan lived to tell it, twice — the village pieced it together.)" Same non-lethal shape. But: the run later killed 3 wave-3 monsters (incl. spool) and 1 wave-4 (The Strike) — all brute force, trick=null. The village knew Buffering's trick and never used it in any recorded fight. The fiction teaches; the engine executes; the two never meet.

**Arc 3 — the hummice shout kills (the only counter-executions).** belongfeast-s613 d101 (villager, contest), belongfeast-s701 d21 (villager, agency), leadfeast-s701 d111 (scholar, contest): all "trick=shout,shout" — the field AI cupped hands and bellowed twice, then the hummice died. The shout's own flavor text exists in the fight log ("R: X cups their hands and BELLOWS — raw noise, no words"). The execution is real and narrated — but it's the ONLY kind that ever fires, because it's the only w1/2 trick whose gate (shout when vHp<75%) aligns with how field fights actually flow.

Sense verdict: the discovery fiction is good (teaches real mechanics, honest via-lines). The execution side is where the game goes quiet: 10 wave-3 discoveries, 0 wave-3 executions; 348 discoveries, 3 attributed kills.

## The wiring verdict + named lever

**Verdict:** is wave-3+ counterplay actually wired? NO — at three distinct breaks: (1) 6/9 wave-3 species + all wave-4/5/6 species have NO knowledge representation (break at representation/content); (2) the 3 wired wave-3 species are discovered but never executed (break at actuation frequency); (3) 3 wave-1 species can never be discovered by performance (break at the perform channel). The ledger bonus flows on knowledge alone (335 post-discovery w1/2 kills), which is the mechanism's current value — and the reason wave-3+ tricks, which score no ledger, change nothing.

**Named lever (next counter-wiring arm):** EXTEND THE LEDGER CONVENTION TO WAVE-3+ — a game-code arm (this arm's evidence is the spec):
1. Add `counter` fields (or a `villagerTrickDefs`-promoted convention) for the 6 unwired wave-3 species + the wave-4/5 counterplay concepts, so discoveries are recordable and villageKnowsTrick sees them.
2. Extend field-AI actuation (villagerTrickAction) with per-species actuable gates for those tricks (the spool/chorus/buffering gates are the template).
3. Decide the scoring: the wave-3+ ledger currently scores nothing — either wire counter-known w3+ kills to the ledger (accelerating nothing today, since waves 2–3 bars are the only ledger consumers) or define the reward as fight-lethality reduction (the patrol arm's lesson: the value is not dying).
4. Fix the 3 dead perform-kinds (add blindside/face_it/eyes cases to checkMonsterCounter's switch).
5. Pre-register: GO = counter-executed kills >0 on a 16-run sweep AND field-death-rate movement on identical seeds. Note the confound lesson from (c): compare within wave-3+ -reached runs, not across them.

## Metric review (§14)

- The PRIMARY (≥95% attribution) was chosen for a diagnostic, and it bound the run: 100% GO. The metric did its job — it forced the instrument to carry wave attribution on every event, which is what made (a) airtight.
- Metric honesty notes: (1) "counter-kill" in the ledger sense (knowledge bonus, 335 kills) vs the execution sense (trickSummary, 3 kills) are different quantities — the evidence names both; (2) the (c) survival differential is structurally confounded (unlock survivorship) and the evidence says so plainly instead of scoring it; (3) field-deaths ("deaths" per-seed) conflate player and villager deaths — the differential uses the combined rate, which is the honest population for the wall but not a clean combat-only measure.
- No metric revision needed for the next arm; the next arm's GO (above) is new, not a re-score.

## Convergence state

scale-onramp: converging (diagnostic arm — measures, does not move; names the next arm above). The instrument lands permanently: census + sweep + analyzer + proof.

## Blank-fill record

- FILLED (documented): the per-species counter blanks for waves 3–6 (the census table — 27 species with zero counter knowledge representation; 3 with dead perform-kinds).
- FILLED (documented): the three dead perform-kinds (eyes/blindside/face_it) — channel-1 discovery and villager execution impossible for cliffhanger/sunback/sweeps_week; channels 2/3 unaffected (measured in sims).
- FILLED (measured): villager counter execution happens (3 attributed kills + 6 field shout executions) but is ~1% of the kill flow; wave-3 trick execution is 0 in 16 runs.
- DOCUMENTED (not fixed — instrument-only arm, zero src/js): `counter_observed` tele events carry {id, n, vid} but NO `via` (actor attribution via vid only).
- DOCUMENTED (not fixed — canon file): MONSTER-WAVES.md is stale vs data (56→72 defs, 14→17 counter kinds, wave-4/5 roster drift, wave-6 unlisted).
- DOCUMENTED (not fixed — out of axis, appended to sim-findings): TB-path kills record via='player' even when the killer is a villager companion (channel-attribution quirk for the fieldfightsrc tagging).
