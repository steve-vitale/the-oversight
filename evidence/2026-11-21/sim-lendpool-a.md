# sim-lendpool-a — why holders never stand in earshot of an unarmed lead (finding #2628)

- **Verdict: DIAG-GO.** All three frozen bars pass (see §7). The quantified answer is in §1.
- Arm: sim-lendpool-a, Loop A run fleshout-20261121T0015Z. Base master `faa5d65a9`.
- Prereg: `evidence/2026-11-21/sim-lendpool-a-prereg.md`, commit `173f8681b` (2026-11-21 00:45:04 UTC — the file says frozen "~00:50 UTC"; the commit time is the freeze time).
- Band: **107111–107118** (fresh; verified per the local_seed_band_freshness skill — see prereg §"Band freshness").
- Horizon: 150d death-aware, competent verbatim policy. Env (frozen): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset, `PRESENCE` unset; SEARSUPPLY, BOWCRAFT, FUSIONCELL unset. One leg (diag). The LANDED v4lendPool counter ran with the LEND substrate env ON for the counter only; the lend itself stayed OFF (`v4lends` 0 on all 8 seeds).
- Instrument: driver `scripts/lendpool-driver-a.js`, analyzer `scripts/analyze-lendpool-a.js`, proof test `scripts/test-lendpool-a.js` — all read-only (no game-code change in this arm).
- Corpus: `evidence/2026-11-21/perseed-lendpool-a/` (8 files), analysis `evidence/2026-11-21/lendpool-a-analysis.json`, sweep log/err `evidence/2026-11-21/lendpool-a-sweep.log/.err`.
- Canon: no canon doc covers the searcaster / contest-prize / lend / holder-presence rules specifically; rules below are cited from code only, as the prereg records.

## 1. The answer (finding #2628)

**Holders never stand in earshot of an unarmed lead because, on 92% of wave-4+ launches, there is no living armed holder anywhere in the village at all — not sheltered, not away, not on an expedition: the holder population is empty.** The lend's pool is empty because nobody holds a gun with cells to lend from, not because holders are standing in the wrong place.

Classified breakdown — nearest armed holder at each unarmed-lead wave-4+ launch (non-raid, n = 141):

| Nearest-holder state | n | share |
|---|---|---|
| **no-living-holder** | **130** | **92.2%** |
| sheltered | 7 | 5.0% |
| at-home | 2 | 1.4% |
| on-expedition | 1 | 0.7% |
| in-camp | 1 | 0.7% |
| resting / low-health / away / out-in-world / unknown | 0 | 0% |

Distance buckets (same 141): on-tile 3, adjacent 4, 3-away 2, 4–5 away 2, no living holder 130.

**Earshot base rate** (over ALL 142 non-raid wave-4+ launches, armed and unarmed leads alike): a holder in earshot (on-tile or adjacent) **7/142 = 4.9% armed, 2/142 = 1.4% eligible** (armed + health > 20 + not sheltered + not resting). Over unarmed leads only: 7/141 (5.0%) armed, 2/141 (1.4%) eligible.

**The pool is not exactly 0 on this band** — it is 2. Two lendable moments, both on seed 107114 (both gun; one on-tile, one adjacent), out of 141 unarmed launches (1.4%). The near-miss recorder and the LANDED v4lendPool counter agree exactly (2 vs 2), which is bar 2. The lendfix band (107081–107088) measured 0; the pool floor across bands is ~0–2 per 8 seeds — the same picture, one band's worth of noise apart.

**Second cause, for the 11 launches where a holder did exist:** 7 of the 11 (63.6%) had the holder **sheltered** — usually on the very same tile (dist 0), inside, where the draft must refuse him. Positioning fixes could at most recover those 11 launches, and 7 of them are shelter-blocked.

Draft-miss cross-check (tick-row based, measured fresh, not reused from presence-a): 28 misses over 417 pooled fights — same order as presence-a's 37 on its band. The cross-check agrees with the launch-level picture; it is not the diagnosis.

## 2. The supply side — why the holder population is empty

From the per-villager ammo census in the corpus (ranged weapon + cells, by day):

- **4 of 8 villages never had a holder at all** (107112, 107113, 107116, 107118 — 0 holder-days).
- The other 4 villages had **exactly one holder at a time, never more**: 5 distinct holders ever across the band, **116 holder-days out of ~1,160 village-days (10.0%)**.
- **The scholar held cells on 0 census days on all 8 seeds.** Guns + cells barely reach anyone, scholar included.
- Holders arrive late or leave early relative to the wave-4 fights:
  - 107111: jesse_cortez held days 58–79; launches ran days 55–139. He stopped holding (last seen day 105) long before the launches ended.
  - 107114: gen_djbdxdn held days 48–95 (last seen 97); somchai_prasert held days 123–128 (last seen 148); launches ran days 86–149.
  - 107115: jesse_cortez first held day 131 — **25 days after wave-4 launches began** (day 106); still holding at the end.
  - 107117: oliver_moore first held day 131; the village never fought a wave-4+ monster at all (§5).
- Only **one armed lead entry in the whole band** (107114, somchai_prasert); only 2 villagers ever appear with cells in a fight party (jesse_cortez on 107111, gen_djbdxdn + somchai_prasert on 107114). Armed entries 15 in the participation stats are mostly the scholar's bow/crossbow entries, not searcaster leads.

In plain words: a village walks into wave 4 with, at best, one person holding the one gun, for a few weeks, sometimes after the fighting has already started — and half the villages never get even that one person. The lend asks that person to be standing next to an unarmed fighter at the exact moment a wave-4 monster arrives. On this band that alignment happened twice in 141 tries.

## 3. The two lendable moments (both seed 107114)

| Day | Monster | Lead | Holder | Dist | Holder state | Outcome |
|---|---|---|---|---|---|---|
| 127 | cancellation | app_mgpspk68921 ("Intan") | somchai_prasert | 1 (adjacent) | on-expedition | lead died, round 2 |
| 129 | cancellation | daniyar_askarov | somchai_prasert | 0 (on-tile) | in-camp | lead won (vKill) |

Day 129 is the instructive one: Daniyar called for help in round 2 and **Somchai charged in and fought alongside him** — the holder answered as an ally, not as a lender. The lend's scenario (holder stands by while the lead fights unarmed) did not happen even in the one case where everything lined up, because the holder joins the fight. Day 127 is the opposite failure: Intan died in 2 rounds without calling for help (she went from 27 HP to 0 in one hit, so no shout round ever fired), while the holder was "in earshot" by tile distance but out on an expedition — he could not have heard or reached her. Tile distance overstates presence for expedition holders; only 1 of the 2 lendable moments had a holder who could actually respond.

## 4. Sense-test — do holders and leads notice each other?

Yes, through the help-shout, and it reads like people, not robots. Sampled transcripts (from the corpus encounter logs; the #2630 blind spot still applies — the driver reads `rec.log` at fieldFight-return, before the hook annotates it — so lend/return lines cannot appear here, and the lend was OFF anyway):

- **107114 day 129** (lendable, holder joined, lead won): "Daniyar is losing — shouts for help! Somchai charges in!" Then Daniyar binds his wound mid-fight (+20 HP) and the pair wins. The help system is the live noticing channel, and it works.
- **107111 day 61** (sheltered holder on-tile, lead fled): "Ines has Sling but no stones — the string stays drawn, useless." Ines shouts in round 3; "Jesse charges in!" — the sheltered holder still answers the shout as an ally even though the lend draft must refuse him. "Jesse answered Ines's shout, but Ines is past holding — they run while running still works." Honest, not robotic.
- **107111 day 60** (sheltered holder on-tile, lead died round 1): Benoit strikes once, takes 28, dies. **No shout, no help, no mention of Jesse at all** — the holder is standing on the same tile, inside shelter, and the lead dies in one round without a word. This is the flat spot: a lead who dies in round 1 never gets to call, and a nearby sheltered holder is invisible in the transcript. The game knows the lead is unarmed ("has Sling but no stones") but nobody in the fiction reacts to it.
- **107114 day 127** (lendable, lead died): "Intan has Bow but no arrows — the string stays drawn, useless." She fights a 619-HP Cancellation alone with a knife and dies in round 2. The unarmed-lead population is visible in the fiction — the game says so out loud — but no one comes, because the only holder is a tile away on an expedition and the lead never gets a shout round.

Nothing robotic in the wording; the gap is a timing gap (one-round deaths, sheltered silence), not a voice gap.

## 5. Per-seed table

| Seed | Days | Village | maxWave | Standing | Non-raid launches | Raid launches | Lendable |
|---|---|---|---|---|---|---|---|
| 107111 | 140 | lost | 5 | 315 | 37 | 3 | 0 |
| 107112 | 131 | lost | 4 | 199 | 2 | 1 | 0 |
| 107113 | 150 | survived | 5 | 335 | 13 | 5 | 0 |
| 107114 | 150 | survived | 5 | 640 | 31 (30 unarmed + 1 loaded) | 9 | 2 |
| 107115 | 150 | survived | 4 | 199 | 15 | 5 | 0 |
| 107116 | 150 | survived | 4 | 199 | 19 | 6 | 0 |
| 107117 | 150 | survived | 5 | 435 | 0 | 0 | 0 |
| 107118 | 150 | survived | 5 | 705 | 25 | 7 | 0 |
| **Band** | | 2 lost / 6 survived | 5/8 reached w5 | | **142** | **36** | **2** |

Participation (band): meetings 232, engaged 189, flees 119, armedEntries 15, armedLeads 1, deathsPerEngaged 4.39, wave4 reached 8/8, wave5 5/8, medianDays 150, national 0, seedWins 0. `instrumentErrors` 0 on all 8 seeds; `v4lends` 0 (lend stayed OFF).

**Seed 107117 — the zero-fight village.** 150 days, survived, maxWave 5, standing 435 — and 0 wave-4+ real fights, 0 launches, 0 encounters. It spawned 19 wave-4/5 monsters (16 wave-4, 3 wave-5) and fought none of them; its 32 recorded fights were all lower-wave. The village reached wave 5 and a respectable standing without ever facing a wave-4+ monster. This is a real behavioral observation (avoidance / never meeting), not a recorder miss: both recorders are silent together only if fieldFight never ran, and the instrument errors are 0 with coverage 100% elsewhere. It also means the pool's denominator is thinner than the spawn count suggests — monsters exist, but the fights the lend needs don't always happen.

## 6. Pre-pilot instrument correction (raid rows) + run incident

**Raid correction.** The smoke seed (107111, pre-pilot) came back with coverage 37/40 = 92.5% — 3 unmatched encounter rows (days 59, 71, 99, all eulogy, all unarmed leads, all origin `world-tick`). Code read showed the cause: raid fights are routed through the same choke point (`resolveWildMonsterEncounter(d, m, {raid:true})` from havenGrowth.js:681), the encounter recorder logs them, but `nearMissMoment` returned null for raids, so no near-miss row existed to join against. **Correction (pre-pilot — the judged sweep had not run):** `nearMissMoment` now evaluates raid launches too, returning `raid: true, lendable: false`; the breakdown and the earshot base rate exclude raid rows (the lend never fires at a raid); raid rows exist only for the coverage join. The proof test §3(l) and the analyzer selftest were updated the same way (raid row + matching encounter row in the synthetic corpus). Re-run smoke in a fresh dir (`perseed-lendpool-a-smoke2`, kept as the fix verification): coverage 40/40 = 1.0, orphans 0, raidLaunches 3 — the hypothesis confirmed exactly. The prereg text is frozen and was NOT edited; this correction is recorded here.

**Machine restart killed the first judged sweep.** The first 8-seed sweep was SIGTERM'd at ~107s (uptime showed 1 min — the machine had been replaced). No corpus files had been written, so the sweep was **re-run whole from scratch** in a fresh attempt (exit 0, ~23 min, all 8 files). Nothing was resumed mid-way and no partial corpus was reused.

**Smoke scratch:** the first smoke dir (`perseed-lendpool-a-smoke`, run under the pre-correction driver) was deleted as stale; the smoke2 dir is kept.

## 7. Bars (frozen prereg)

| Bar | Result | Pass |
|---|---|---|
| 1. Instrument validity — proof test 100% + analyzer `--selftest` pass | Proof test **35/35**, analyzer selftest **84/84** | ✅ |
| 2. Coverage — near-miss rows for ≥95% of unarmed-lead wave-4+ real fights, ≤5% unclassified | **177/177 = 100.0%**, unclassified **0/141 (0.0%)**, orphan rows **0** | ✅ |
| 3. Answer quantified — breakdown by nearestState + nearestDist, earshot base rate, dominant cause named with share, named next lever with premise | Dominant **no-living-holder 130/141 (92.2%)**; earshot armed **4.9%**, eligible **1.4%**; next lever §8 | ✅ |

Guardrail (instrument purity): `v4lends` 0, `v4lendPool` re-verified (2 moments, agreeing with the near-miss lendable rows 2 vs 2), 8/8 pool-counter files valid, 0 errors. The dominant cause clears the prereg's 30% bar by a wide margin, so no "diffuse" fallback applies.

## 8. Named next lever

**HOLDER SUPPLY — put a searcaster + cells into a living villager's hands before wave 4.**

- **Mechanism (for the coordinator/builder, not this arm):** route one gun + cells to a villager — not the scholar's stash — as a wave-3/4 preparation step. Candidate routings already in the game's vocabulary: a contest prize, monster-loot attribution to a villager, or a duty-holder arm that arms a villager. Which routing is a design call; the diagnosis only fixes the population it must create.
- **Premise:** the lend can only fire when a holder exists, and today a living holder exists on ~10% of village-days, never more than one at a time, and 4 of 8 villages never have one at all. The pool is empty because the holder population is empty, not because holders are misplaced. Positioning fixes (shelter-aware lending, expedition recall) could at most recover the 11 holder-present launches, 7 of which are shelter-blocked — and the sense-test shows that when a holder IS in earshot and the lead calls, the holder joins the fight as an ally anyway, so the lend's marginal value lives only in the cases where the holder cannot or will not join (the day-127 pattern: holder a tile away on an expedition, lead dead in 2 rounds without a shout).
- **What would falsify it:** a band where a living holder exists on ≥50% of wave-4 launch days and the pool is still ~0 — that would move the cause from supply to positioning. Until then, re-testing the lend's participation floor (which prices from 0) is premature: there is nobody to lend from.

## 9. Metric review

- The metric did its job: coverage at 100% with 0 orphans means the breakdown is a census of the population, not a sample, and the dominant cause (92.2%) is not a sampling artifact. The two-recorder agreement (near-miss lendable 2 vs pool counter 2) is the cross-check that the classification means what the counter means.
- What the metric did NOT cover, and should be said plainly: (a) the coverage denominator is built from the encounter recorder, so a seed where BOTH recorders are silent (107117 — no wave-4+ fights at all) contributes nothing to coverage; the zero-fight village is visible only because the per-seed table is read by hand. (b) "Earshot" is tile distance (Chebyshev 0–1), not hearing or line of sight — the day-127 case shows an on-expedition holder counted as in earshot who could not have responded. A future instrument that wants a truer presence rate should score reachability (same node, not on expedition, not sheltered) rather than tile distance. (c) The holder-supply numbers in §2 come from the ammo census, which was read post-hoc, not preregistered — they corroborate the preregistered breakdown but were not themselves a frozen bar.
- The raid correction (§6) is the one place the instrument was wrong before the judged run, and the smoke seed caught it before any judged sim ran. The prereg's freeze held: the correction is recorded here, not edited into the prereg.

## 10. Blanks / open items

- 107117's avoidance is unexplained at the mechanism level: 19 wave-4/5 monsters spawned, 0 fought. Whether the village avoided every meeting (WILDAVOID / flee-before-fight) or the monsters never came within a villager's tile is not distinguishable from this corpus. Open observation, not a defect claim.
- The "died holding vs stopped holding" split for holders is not resolved: jesse_cortez (107111) stopped holding well before he stopped appearing in the census (last held 79, last seen 105) — the gun left his hands while he lived (transfer, loss, or cells spent); the corpus does not say which. `v4transfers` records new-holder events only.
- No `[needs-eyes]`: a diagnosis, no feel/combat/UI change.

## Files

- Prereg (frozen, commit `173f8681b`): `evidence/2026-11-21/sim-lendpool-a-prereg.md`
- Evidence (this file): `evidence/2026-11-21/sim-lendpool-a.md`
- Instrument: `scripts/lendpool-driver-a.js`, `scripts/analyze-lendpool-a.js`, `scripts/test-lendpool-a.js`
- Corpus: `evidence/2026-11-21/perseed-lendpool-a/` (8 files), analysis `evidence/2026-11-21/lendpool-a-analysis.json`
- Smoke2 (raid-fix verification): `evidence/2026-11-21/perseed-lendpool-a-smoke2/`, `evidence/2026-11-21/lendpool-a-smoke2-analysis.json`
- Logs: `evidence/2026-11-21/lendpool-a-sweep.log/.err`, `evidence/2026-11-21/lendpool-a-sweep-smoke2.log/.err`
