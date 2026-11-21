# sim-draftmiss-a — EVIDENCE (fresh band 107191–107198)

**Arm:** sim-draftmiss-a · **Loop A run:** fleshout-20261121T1415Z (adoption of the timed-out 1215Z run)
**Type:** DIAGNOSIS — finding #2599 (presence/contact pool), the 0715Z blank 1 (presence side)
**Verdict: DIAG-GO** — all three frozen bars hold (table below). No game-code change; instrument + evidence only.
**Band:** seeds 107191–107198, 150d, death-aware, competent verbatim, substrate GUNRATE=1 + CELLGATE=1, LEND off, PRESENCE off.
**Prereg:** `evidence/2026-11-21/sim-draftmiss-a-prereg.md` (commit `a501e6c95`, frozen before any judged sim).
**Analysis:** `evidence/2026-11-21/draftmiss-a-analysis.json` (from `node scripts/analyze-draftmiss-a.js --dir evidence/2026-11-21/perseed-draftmiss-a --out evidence/2026-11-21/draftmiss-a-analysis.json`).
**Corpora:** `evidence/2026-11-21/perseed-draftmiss-a/` (8 files). **Proof test:** `scripts/test-draftmiss-a.js` — ALL GREEN (see §7).

## The answer, in plain words

The draft — the rule that would put the village's gun-holder in front of a big monster fight — never had anything to work with. On this band there were 85 unarmed-lead fights against wave-4+ monsters (plus 45 raid fights, counted separately). In **69 of the 85 (81%) there was no living person in the whole village holding a loaded gun at all** — not sheltering, not away, not on an expedition: nobody held the gun, because the village never had one. In the other **16 (19%) there was exactly one holder, Fatima Hassan on seed 107193, and she was sheltering inside the hall** at every single one of those fights, standing on the monster's tile or right next to it, holding the gun, never leading a fight. The draft's maximum reach on this band — the fights it would have fired on had it been switched on — is **zero out of 85**. Not one launch had an armed holder standing in earshot, healthy, and free to fight.

Two things that did NOT cause the misses: the tick recorder was never stale (0 stale rows — the pre-pass and the launch always agreed), and no holder was ever out of earshot-but-reachable, resting after a flee, or too hurt to fight. The miss population is two causes and nothing else: nobody holds the gun, or the one person who does is sheltering.

## Frozen-bar table

| # | Bar (prereg) | Result | Pass |
|---|---|---|---|
| 1 | Instrument validity — proof test 100% (`test-draftmiss-a.js` green: pinned corpus + every `draftMissMoment` cause on live fixtures + analyzer selftest) | Pinned corpus reproduces 64 rows / 21 pairs, counts a2 b0 c0 d0 e7 f12, verdict NO-GO; all 17 live fixtures pass (every cause staged real, 0 draws, pure reads); analyzer selftest 40/40 | ✅ |
| 2 | Coverage — `v4draftMiss` rows for ≥ 95% of unarmed-lead wave-4+ real fights (encounter-derived denominator), ≤ 5% unclassified | 130/130 covered (**100.0%**), **0 unclassified rows** (0/85), 0 orphan rows | ✅ |
| 3 | Answer quantified — breakdown by cause + distance, distinct-pair count, earshot base rate, would-fire bound, tick-stale count, dominant cause named with share, named next lever | Dominant cause **no-living-holder 69/85 (81.2%)** — not diffuse (≥ 30%); next lever named in §14 | ✅ |

**Verdict: DIAG-GO.** No confirm run is needed: the prereg calls for a confirm only if coverage lands marginal (90–95%) or the dominant share sits within noise of the 30% bar — coverage is 100% and the dominant share is 81.2%. The diagnosis stands on the pilot band.

## §1. The breakdown — every unarmed-lead wave-4+ launch, classified at launch time

Non-raid unarmed-lead wave-4+ launches, n = 85 (leadKind: 85 gun, 0 cells — no launch on this band had a lead carrying an empty searcaster). Shares use launches as the denominator.

| Cause | n | Share | What it means |
|---|---|---|---|
| **no-living-holder** | **69** | **81.2%** | No living armed holder exists anywhere in the village |
| **sheltered-holder** | **16** | **18.8%** | The nearest holder is sheltering inside the hall |
| post-flee-resting | 0 | 0% | — |
| low-health | 0 | 0% | — |
| on-tile | 0 | 0% | — (would-fire; none) |
| adjacent-but-unreachable | 0 | 0% | — |
| adjacent-eligible | 0 | 0% | — (would-fire; none) |
| out-of-earshot | 0 | 0% | — |
| stale-pre-tick-read | 0 | 0% | — (see §5) |
| other / unknown | 0 | 0% | — |

By nearest-holder distance (Chebyshev tiles): **dist 0 → 5, dist 1 → 11, none → 69**. All 16 dist-0/1 rows are the sheltered ones — the only holders in earshot on the whole band were sheltering. No dist ≥ 2 row exists: whenever a holder existed at a launch, they were already standing on or next to the fight.

Outcomes across the 85 launches: **vFlee 60 (70.6%), mFlee 8, vKill 8 (9.4%), vDie 9 (10.6%)**. Split by cause — no-living-holder: vFlee 50, mFlee 8, vKill 5, vDie 6; sheltered-holder: vFlee 10, vKill 3, vDie 3 (the monster never fled in the 16 sheltered launches — n = 16, do not over-read it). The villages mostly run from wave-4+ monsters; they kill one in eleven.

### Per-seed table

| Seed | Days | Village | maxWave | Standing | Non-raid launches | Raid launches | no-living-holder | sheltered-holder | Would-fire |
|---|---|---|---|---|---|---|---|---|---|
| 107191 | 140 | lost | 5 | 510 | 34 | 13 | 34 | 0 | 0 |
| 107192 | 150 | survived | 4 | 199 | 4 | 1 | 4 | 0 | 0 |
| 107193 | 150 | survived | 5 | 560 | 16 | 7 | 0 | 16 | 0 |
| 107194 | 150 | survived | 4 | 199 | 5 | 8 | 5 | 0 | 0 |
| 107195 | 150 | survived | 4 | 199 | 0 | 0 | 0 | 0 | 0 |
| 107196 | 150 | survived | 4 | 199 | 13 | 10 | 13 | 0 | 0 |
| 107197 | 74 | lost | 4 | 175 | 3 | 0 | 3 | 0 | 0 |
| 107198 | 150 | survived | 5 | 400 | 10 | 6 | 10 | 0 | 0 |
| **Band** | **1,114 village-days** | **2 lost / 6 survived** | **3/8 reached w5** | | **85** | **45** | **69** | **16** | **0** |

Seed 107195 is the zero-launch village: 150 days, survived, maxWave 4, standing 199 — and not one unarmed-lead wave-4+ real fight on the world-tick/aid path (its 15 wave-4+ encounters were all expedition-origin or non-real outcomes; see §6). It had two gun-holders (see §8) and still produced no draft-miss launch — the fights the draft needs didn't happen there. Seed 107193 is the mirror image: the only village where a holder existed at a launch, and every one of its 16 launches was sheltered-holder.

## §2. The distinct-pair collapse — the tick-row inflation, measured

The presence arm counted ~21 distinct day|mid pairs from 64 tick rows (2.56x rows-per-fight). On this band, at launch level:

- **85** `v4draftMiss` rows → **79 distinct launches** (seed|day|mid|lead) → **73 distinct pairs** (seed|day|mid). The 6 duplicate launches are same-lead-same-day repeats (e.g. seed 107193, day 113, the Timeslot fought twice by the same lead, `app_mgpspk4b730`); the 6 extra pair members are second leads fighting the same monster the same day.
- The tick-row inflation is the same shape as presence-a: the old-style tick counter's 29 poolDraftMiss rows collapse to **11 distinct pairs (2.64x)** — within noise of presence-a's 2.56x. The inflation mechanism is confirmed, not assumed: several tick rows per fight, one launch per fight.

## §3. Earshot base rate and the would-fire bound

Over ALL 85 non-raid wave-4+ launches (the near-miss rows, loaded leads included — but there were **0 loaded-lead launches** on this band, so the unarmed and all-launch rates are the same):

- **Armed in earshot: 16/85 = 18.8%** — all 16 are the sheltered holder.
- **Eligible in earshot: 0/85 = 0.0%** — not one launch had a holder the draft could legally use standing next to the fight.
- **Would-fire bound (on-tile + adjacent-eligible): 0 launches (0 on-tile, 0 adjacent).** The draft, switched on exactly as designed, would have fired **zero times in 150 days across 8 villages**.

For scale: the lendpool band measured armed 4.9% / eligible 1.4% with 2 lendable moments. This band is richer in armed earshot (18.8% vs 4.9%) only because one holder spent the back half sheltering next to fights — and poorer in eligible earshot (0.0% vs 1.4%) because she never left shelter. The eligible pool is zero on both bands within noise.

## §4. Raids — a third of the launch population, classified and excluded

**45 raid launches** (34.6% of the 130 unarmed-lead wave-4+ launches) are classified `raid` and excluded from the breakdown, exactly as the prereg requires — the draft lives in `villagerMonsterTick` and the raid's defender draft never consults it. They exist in the corpus only so the coverage join is honest (a raid fight is a real fight through the same choke point, and the encounter recorder logs it). Every raid row joined its encounter row: coverage 130/130 with 0 orphans.

## §5. Tick-stale: zero — the prior arm's (c) = 0, confirmed live

**Tick-stale rows: 0** (null 0 — every row had a tick read to compare against). The stale overlay — the latest tick-pool row disagreeing with the launch-time read — never fired once. The prior arm measured class (c) = 0 on the old corpus by re-analysis; this arm confirms it with live reads: the pre-pass and the launch always agreed. There is no recorder-timing artifact hiding draft misses. (The overlay itself is proven by fixtures — proof test (j) and (k) stage both stale shapes and both flip the cause while keeping the underlying one.)

## §6. Presence cross-check — the old tick counter's 29 "miss" rows, dissolved

`presenceStats` on the fresh band: **10,536 pool ticks, holder present in 419, `poolOnTile` 0, 453 pooled-fight tick rows, `poolHolderLed` 0, `poolDraftMiss` 29 tick rows.**

All 29 tick rows map to a launch-level cause — **0 unmapped**:

| Tick rows | Maps to (launch level) | Distinct pairs |
|---|---|---|
| 11 | raid launches | — |
| 18 | sheltered-holder launches (16 launches; 2 launches had 2 tick rows) | — |
| **29** | **11 distinct pairs total** | **11** |

`poolOnTile` is 0 again (presence-a §12 holds on the fresh band: a holder is never pooled on the monster's tile at tick time) — but the launch-level read refines that zero: holders WERE on the monster's tile at launch time, 5 times, all sheltered (see §9). The tick never sees them there because the tick's pre-pass runs before the shelter check matters — the distinction is tick-time vs launch-time, and the launch level is the true one for the draft question. `poolHolderLed` 0: no tick row ever had a pooled holder leading a fight.

Coverage denominator, for the record: 187 total `v4encounters` rows minus 130 in the denominator = **57 excluded** — 26 expedition-origin (real outcomes, unarmed leads) and 31 non-real outcomes (including the 4 armed-lead expedition encounters, all `evade`). Zero armed-lead encounters with a real outcome on the world-tick/aid path: no lead carried a loaded gun into a real wave-4+ fight on this band.

## §7. Pool re-verification and instrument purity

- **Pool counter: 8/8 files, 0 errors. Draft-miss lendable rows 0 vs `v4lendPool` moments 0 — agree exactly.** The pool is empty on this band (lendpool band: 2 moments; lendfix band: 0). The pool floor across bands is 0–2 per 8 seeds.
- **`v4lends` 0 — the lend stayed OFF.** `instrumentErrors` 0 on all 8 seeds.
- **Zero draws added** — proven by the fixtures (every `draftMissMoment` call under a rigged `Math.random` used 0 draws).
- **Proof test `scripts/test-draftmiss-a.js`: ALL GREEN** (~34s). Pinned corpus: reproduction 64 rows / 21 pairs, counts a2 b0 c0 d0 e7 f12, verdict NO-GO. Live fixtures: 17 checks, every frozen cause staged through the real verbs (`shelterVillagers`, `markPostFleeRest`, `agencyState().exped`, `village.away`, `npcSetNode`/`npcSetInside`), 0 draws, pure reads. Analyzer selftest 40/40, in-process and as a CLI subprocess.
- **No `src/js` change.** Instrument + evidence only, as preregged.

## §8. The holder population — four people, two villages, 185 holder-days

Four distinct villagers ever held a searcaster with cells on this band; **6 of 8 villages never had a holder at all**.

| Holder | Seed | Held (days) | Holder-days | How they got it |
|---|---|---|---|---|
| fatima_hassan | 107193 | 57–150 | 93 | unexplained (not a contest prize) |
| gen_dliylqn | 107193 | 64–92 | 29 | contest prize |
| aki_tanaka | 107195 | 102–150 | 49 | contest prize |
| nino_kapanadze | 107195 | 137–150 | 14 | unexplained (not a contest prize) |

**185 holder-days over 1,114 village-days (16.6%)** — richer than the lendpool band's 116/1,160 (10.0%), and it still produces zero would-fire launches. Two holders overlapped on both holder villages (days 64–68 on 107193; days 137–141 on 107195) — unlike the lendpool band, where a village never had more than one at a time. The extra gun changes nothing: the second holders never fought either. `gen_dliylqn` led 3 wave-4+ expedition encounters (days 68, 84, 85) — all `evade`, no fight. `aki_tanaka` led 1 (day 130) — `evade`. Fatima led **0 fights of any wave in 150 days**.

## §9. The sheltered holder, named — Fatima Hassan, seed 107193

All 16 sheltered-holder launches are one person on one seed: **Fatima Hassan, seed 107193, days 103–146**, health 41–98 at launch time, nearest distance 0 (5 launches) or 1 (11 launches), holding the searcaster with cells the whole time. She picked the gun up on day 57 and still held it on day 150. She never led a fight. The monsters she stood next to: Eater (days 103, 105, 109, 111), Timeslot (113 ×2, 135, 137), Spoiler (119), Herald (120), Editor (128, 129, 131), Audit (142, 146).

Her village's other holder, `gen_dliylqn`, held the second gun days 64–92 and never fought either. So seed 107193 — the band's strongest village by standing (560, regional) — had two guns for a month and a gun in hand for 93 days, and the gun never once decided a wave-4+ fight from the front.

## §10. Sense-test — the leads shout, the holder answers once, the gun never fires

Read the encounter rows (`calledHelp`, `shoutRound`, allies, `log`) for the 85 non-raid launches:

- **Leads call for help in 48/85 launches (56%)**, shouting in round 2–5, and **fight with allies in 79/85 (93%)**. The fight system is alive: villagers shout and pile in. The holder is the exception, not the rule.
- **Fatima is listed as an ally in 2 of her 16 sheltered launches, and actually joins in 1.** Day 128, the Editor, lead Vasyl Shevchenko: Vasyl shouts in round 2 ("Vasyl is losing — shouts for help! Fatima charges in!"), Fatima enters in round 3, strikes for 143, deals **867 damage** across the fight, takes 75, and the party still flees after 8 rounds (vFlee). Day 146, the Audit: she is listed as an ally but never enters (0 damage dealt, 0 taken).
- **The gun never fires.** Zero searcaster volleys in any encounter on the band, by anyone, in any role — against 26 bow/sling/crossbow volleys fired by leads. Fatima fights with her hands when she fights at all; the searcaster she carries is never shot. `armedVolleys: 0` across the band.
- The one finding that matters for the next lever: **shelter does not block the shout-join.** Fatima was sheltered at launch time on day 128 and still charged in when Vasyl shouted. The shelter rule blocks the draft's pre-positioning, not the fight itself. The draft's premise — a sheltered holder can't be put in front — is only half true: she can't be pre-positioned by the tick, but she can be called in by a shout. (n = 1 join out of 14 shouted sheltered launches, so the join rate is low; the point is the door is open, not that it swings freely.)
- Blind spot, disclosed (finding #2630): the driver's `lines` arrays are empty in the corpus — it reads the fight log at fieldFight-return, before the hook annotates the spoken lines — so absence of a spoken line in the corpus is not proof the line was never spoken. The `log` lines ARE present (the day-128 shout and charge-in above come from them), so the sense-test rests on `log`, `calledHelp`, `shoutRound`, and ally/damage fields, not on `lines`.

## §11. Wall numbers

| | |
|---|---|
| National / table / wins | 0 / not instrumented (null, never faked) / 0 |
| Wave 4 reached | 8/8 villages |
| Wave 5 reached | 3/8 villages (107191, 107193, 107198) |
| Median survival | 150 days (days: 140, 150, 150, 150, 150, 150, 74, 150) |
| Villages lost | 2 (107191 day 140, 107197 day 74) |
| Standing | 510, 199, 560, 199, 199, 199, 175, 400 — all regional |
| Participation (band) | meetings 187, engaged 154, flees 116, armedEntries 16, armedLeads 4, deathsPerEngaged 5.03 |
| Holder-days | 185 / 1,114 village-days (16.6%) |

Village assessment, plainly: the villages survive to wave 4 and usually to wave 5, but none wins anything — no national standing, no seat, no full win. They run from wave-4 monsters seven times in ten. The gun is the scarcest thing in the game: six villages in eight never see one, and the one village that holds one keeps its holder sheltering inside while unarmed neighbours die in front of her (9 lead deaths across the 85 launches, 3 of them with Fatima standing on the tile next door).

## §12. Band reference — this band vs the lendpool band (cross-band reference, NOT a paired comparison)

Same substrate (GUNRATE=1 + CELLGATE=1, competent, 150d), different seeds. No panel compare applies (single-leg diag; the panel pairs rows by policy+seed and would pair nothing).

| | Lendpool band 107111–107118 | This band 107191–107198 |
|---|---|---|
| Non-raid unarmed launches | 141 | 85 |
| Raid launches | 36 | 45 |
| Total unarmed launches | 177 | 130 |
| no-living-holder | 130/141 (92.2%) | 69/85 (81.2%) |
| sheltered-holder | 7/141 (5.0%) | 16/85 (18.8%) |
| Armed in earshot | 7/142 (4.9%) | 16/85 (18.8%) |
| Eligible in earshot | 2/142 (1.4%) | 0/85 (0.0%) |
| Lendable moments / would-fire | 2 | 0 |
| Holder-days | 116/1,160 (10.0%) | 185/1,114 (16.6%) |
| Villages never holding | 4/8 | 6/8 |
| Distinct holders ever | 5 | 4 |
| Wave 5 reached | 5/8 | 3/8 |
| National / wins | 0 / 0 | 0 / 0 |

The shape is the same on both bands and the numbers move together: the holder population is empty ~85–90% of the time, the eligible earshot pool is ~0–1%, the would-fire/lendable pool is 0–2 per 8 seeds. The differences are band noise plus one real difference: this band's holder was sheltered at 16 launches (one holder, one village, the whole back half) where the lendpool band's holders were sheltered at 7. The diagnosis does not depend on which band you look at.

## §13. The prior arm, resolved

The 2026-11-20 draftmiss arm classified the presence corpus's 21 pairs by re-analysis: (a) sheltered 2, (b) 0, (c) 0, (d) 0, (e) raid 7, (f) UNCLASSIFIED 12 — verdict NO-GO, because the corpus could not separate raid fights from tick fights and could not prove shelter. This arm answers both at the source (raid flag from `opts.raid`, shelter from a live `isSheltered` read), and the structural comparison is clean:

| | Prior arm (old corpus, re-analysis) | This arm (fresh band, launch level) |
|---|---|---|
| Tick-row "miss" population | 64 rows → 21 pairs | 29 rows → 11 pairs |
| Raid | 7 pairs | 11 rows (raid launches) |
| Sheltered | 2 pairs | 18 rows (16 launches) |
| Unclassified | 12 pairs | **0 rows** |
| Stale (c) | 0 | 0 rows |

The 12 unclassified pairs from the prior arm dissolve at launch level into exactly the two causes the old corpus couldn't prove: raid fights and sheltered holders. Nothing is left unexplained on this band. The prior arm's NO-GO was a corpus limitation, not a real draft-miss population — and the real population, measured properly, is the two-cause table in §1.

## §14. Named next lever

**First lever: holder SUPPLY — get a searcaster with cells into a living villager's hands.** Premise: the dominant cause (69/85, 81.2%) is absence, not position. A wider draft, a faster draft, a draft that fires at dist 2 — none of it changes a single launch when there is no holder to draft. Six villages in eight never hold a gun in 150 days; the gun arrives by contest prize or unexplained grant, twice per holder village at most, and the village's only gun can sit in a dead letter for months (seed 107193: two guns, zero would-fire launches). The supply question is the holdersupply question, now with a launch-level number on it: every launch without a holder is a launch no draft can ever fix. Any supply lever must be judged on launches-with-a-holder, not on holder-days alone — 185 holder-days produced 16 holder-present launches, and all 16 were sheltered.

**Second lever: let the draft call a sheltered holder the way a shout does.** Premise: the secondary cause (16/85, 18.8%) is one holder sheltering next to fights she never leads — and §10 shows shelter does not block the shout-join (she charged in on day 128 and dealt 867 as a melee ally). The draft refuses sheltered holders outright; the fight does not. A lever that unshelters a holder when a wave-4+ fight starts adjacent, or that lets the draft draft a sheltered holder into the fight the way a shout drafts an ally, would reach exactly those 16 launches — and the day-128 fight shows the holder, once in, hits hard enough to matter. This lever is worthless without the first: it recovers at most 16 launches on this band, and on a band like the lendpool's, 7.

**What NOT to do:** do not widen the draft's earshot, retime the tick, or rework the stale read. Earshot is not the binding constraint (every holder-present launch was already at dist 0–1); the stale read is a proven zero; the tick is not the problem. The binding constraints sit upstream (supply) and in the shelter rule — both named above.

## §15. Instrument notes and deviations

- **No panel compare** — as preregged (§15 reasoning, lendpool shape): single-leg diag, no game change, no shared seeds; the panel pairs rows by policy+seed and would pair nothing. The band-reference table in §12 is a cross-band reference, never a paired comparison. Flagged here for the coordinator, as the prereg requires.
- **`draftMissMoment` takes a 6th argument, `tickRows`** (the driver's own `v4tickPresence` array), beyond the prereg's 5-argument sketch — the stale check reads the driver's tick rows rather than re-deriving them. The proof test exercises it with staged tick rows (fixtures (j), (k), (l)).
- **Lendable vs would-fire are different questions, and one fixture proves it.** An expedition holder adjacent to the fight is `adjacent-but-unreachable` for the DRAFT (would-fire false) but `lendable: true` for the LEND (the lend would lend to an expedition holder — lendpool test (g)). No such launch occurred on the band (0 adjacent-but-unreachable rows), but the instrument distinguishes the two by design, and the proof test asserts the split (fixture (g)).
- **House rule (repo AGENTS.md §6):** the 4 bare probe catches in my new driver code now carry comments — a failed probe read counts that holder/person as absent, and a systematic failure surfaces as a coverage miss (bar 2 is the detector). The wrap's own catches record into `instrumentErrors` (0 on all 8 seeds). The test file's best-effort catches carry the same explanation.
- **Pre-pilot corrections: none.** The instrument ran exactly as preregged; the smoke seed (107191) came back clean (coverage 47/47, 0 errors, 0 lends) and was kept as the band's first seed. No prereg text was edited after the freeze.
- **Write flap (host):** heartbeat blocked ~14:19–14:29Z (index.lock write errors) and ~14:52Z (registry lock held > 120s — heartbeat skipped); heartbeat landed 2026-11-21T14:55:48+00:00. No work lost; windows cleared on their own.

## §16. Metric review

- The frozen bars held without strain (coverage 100% vs a 95% bar; dominant share 81.2% vs a 30% diffuseness threshold; 0 unclassified vs a 5% allowance). The instrument is not the story here — the population is.
- The coverage denominator is the honest one: derived independently from `v4encounters` with the same choke-point join as `nearMissStats`, counting raid rows for the join and excluding them from the breakdown. The 57 excluded encounters are accounted for in §6 (26 expedition-origin, 31 non-real outcomes).
- The one metric that deserves a second look next time is the **raid share**: 45/130 (34.6%) of unarmed launches were raids on this band vs 36/177 (20.3%) on the lendpool band. Raids are a large and growing share of the wave-4+ fight population, and the draft never touches them by design. If a future draft is meant to matter, its raid story needs stating, not assuming.
- The **eligible-earshot rate (0/85)** is the number to watch in any follow-up: it is the draft's reachable pool, and it is zero on two consecutive bands. Any lever claiming to make the draft matter must move that number first.
- Proposal for the next run (not a re-score): the holdersupply arm should carry the launch-level breakdown with it — holder-days alone overstates supply (185 holder-days → 16 holder-present launches, all sheltered). The next supply measurement should report launches-with-a-holder and launches-with-an-eligible-holder alongside holder-days.

## Run identity

- **Base:** master `b6aad8942` ("journey endgame r263: fill Gate section in run note"); branch `sim-draftmiss-a`; prereg commit `a501e6c95`.
- **Instrument:** `scripts/draftmiss-driver-a.js`, `scripts/analyze-draftmiss-a.js`, `scripts/test-draftmiss-a.js` (all extended this arm; no `src/js` change).
- **Pilot command:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=diag SEEDS=107191,107192,107193,107194,107195,107196,107197,107198 OUTDIR=perseed-draftmiss-a RUN=draftmiss-a node scripts/draftmiss-driver-a.js` (smoke seed 107191 first, then 107192–107198; ~8.4 min for the 7-seed sweep). Logs: `evidence/2026-11-21/draftmiss-a-smoke.log/.err`, `evidence/2026-11-21/draftmiss-a-sweep.log/.err`.
- **Analyze command:** `node scripts/analyze-draftmiss-a.js --dir evidence/2026-11-21/perseed-draftmiss-a --out evidence/2026-11-21/draftmiss-a-analysis.json` → verdict DIAG-GO, exit 0.
- **Proof test:** `node scripts/test-draftmiss-a.js` → ALL GREEN (pinned corpus + 17 live fixtures + analyzer CLI selftest 40/40), exit 0.
