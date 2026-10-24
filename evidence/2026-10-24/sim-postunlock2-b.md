# sim-postunlock2-b — POST-UNLOCK door census on CURRENT master (backlog #861 follow-up)

**Run:** fleshout-20261024T0925Z · **Arm:** sim-postunlock2-b · **Axis:** scale-onramp (standing directive)
**Type:** DIAG (instrument-only, zero src/js) · **Verdict: DIAG-GO** (pre-registered bar met: census complete, 4/4 door-open configs window-attributed, verdict named below)
**Anchor:** `73d344a87` (master at run start; includes journey-scale r28) · **Prior censuses:** postunlock-b rebase `071b00b26` on `be55cfc2c` (2/8 doors, 0 post-unlock deaths in cap) · wallseg `c76a52480b09` (8/8 doors, all lost 17–65d later)
**Evidence:** `evidence/2026-10-24/sim-postunlock2-b.md` · **Corpus:** `evidence/2026-10-24/perseed-postunlock2-b/` (32 configs) + `sim-postunlock2-b-attribution.json` + `sim-postunlock2-b-sense.txt`
**Instruments:** `scripts/sim-postunlock2-b-{sweep,analyze,sense,writer}.js` (sweep reuses the proven `scripts/postunlock-instrument.js` read-only) · **Proof:** `scripts/test-sim-postunlock2-b.js` (E1–E5 all green)

## Verdict, in one paragraph

**Both walls are real, in sequence — and the headline flips from postunlock-b.** On current master the wave-5 door opens rarely (4/32 configs, 12.5%) — the door is still the majority wall: 28/32 villages never open it. But every village that DOES open it dies 48–63 days later (4/4 lost, all inside the wallseg 17–65d template). Wallseg's original finding — "opening the door is no longer the wall; SURVIVING wave 5 is the next wall" — is **confirmed on current master**. Postunlock-b's "doors open, villages survive" shape is explained, not contradicted: its doors opened at d167, leaving only 13 days of cap for a 48–63d death window to fit in. This band's doors opened at d83/d93, giving the window room — and all four villages died in it. The wall is the door for most villages, and surviving wave 5 for the villages that get through it.

## Pre-registration (binding, MEASUREMENT.md §14)

- **PRIMARY (this run's DIAG bar):** the census completes (every planned config present) AND every door-open config carries post-unlock window attribution (days survived post-door, national/table at end, death cause inside the window or still-alive) AND the verdict is named (door itself again, or surviving wave 5 past it).
- **GO iff** all three hold. A miss is NO-GO, never re-scored mid-run.
- **Horizon:** 180d death-aware (dead villages stop; never a fixed 200d).
- **Seeds:** FRESH band 70801–70808 × {leadfeast, belongfeast} = 16 pilot configs. Verified unused at run start: no 7080x seed or s708xx filename anywhere in this worktree's evidence/ tree (live bands are 701xx aidcrisis, 702xx wallseg/postunlock, 705xx vetcontact).
- **Extension rule (decided now, not mid-run):** if door-open configs number <4 after the pilot, extend to 12–16 seeds per policy. Pilot returned 0 doors → extension ran: +70809–70816 × 2 policies = 16 more configs, 32 total.
- **Policies/substrate:** identical to postunlock-b / wallseg — the same `policyFor()` objects, same pinned env (`FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2`).
- **Comparison honesty:** this census runs a FRESH band; postunlock-b and wallseg ran 702xx. Comparisons below are RATE-LEVEL and failure-mode-level, never per-config drift. A matched-config drift claim would be false here.

## Census (32 configs; lead/belong pairs identical on all 16 seeds — see findings)

| seed | w4 day | w5 day | end | national | table | maxWave |
|---|---|---|---|---|---|---|
| 70801 ×2 | — | — | survived d180 | 1 | 0 | 3 |
| 70802 ×2 | — | — | lost d27 | 0 | 0 | 2 |
| 70803 ×2 | 80 | — | lost d132 | 1 | 1 | 4 |
| 70804 ×2 | 79 | — | lost d91 | 1 | 1 | 4 |
| 70805 ×2 | — | — | lost d33 | 0 | 0 | 2 |
| 70806 ×2 | 79 | — | lost d116 | 0 | 0 | 4 |
| 70807 ×2 | — | — | lost d61 | 0 | 0 | 2 |
| 70808 ×2 | 72 | — | lost d104 | 0 | 1 | 4 |
| 70809 ×2 | 72 | — | lost d136 | 1 | 1 | 4 |
| 70810 ×2 | 109 | — | lost d152 | 0 | 0 | 4 |
| **70811 ×2** | **70** | **93** | **lost d141 (48d post-door)** | **1** | **1** | **5** |
| 70812 ×2 | 112 | — | survived d180 | 1 | 0 | 4 |
| 70813 ×2 | 90 | — | lost d151 | 1 | 1 | 4 |
| **70814 ×2** | **75** | **83** | **lost d146 (63d post-door)** | **1** | **1** | **5** |
| 70815 ×2 | 69 | — | lost d78 | 0 | 1 | 4 |
| 70816 ×2 | 122 | — | lost d132 | 1 | 1 | 4 |

## Wall numbers

| metric | overall (n=32) | lead (n=16) | belong (n=16) |
|---|---|---|---|
| national | 18 | 9 | 9 |
| table | 18 | 9 | 9 |
| wins | 0 | 0 | 0 |
| exiled | 0 | 0 | 0 |
| wave 4 unlocks | 24 | 12 | 12 |
| wave 5 unlocks (doors) | 4 | 2 | 2 |
| village-lost | 28 | 14 | 14 |
| survived to cap | 4 | 2 | 2 |
| median survival | 132d | 132d | 132d |
| max survival | 180d | 180d | 180d |

Lead and belong are **identical on every seed** (same w4/w5 days, same end days, same flags) — the policy distinction moves nothing on this substrate+band (see new findings).

## The two door windows (the population postunlock-b could not find)

### s70811 — door d93, lost d141 (48 days post-door; national 1, table 1 at end; roster 1 at end)

- **Door fight:** d100 vs **Cancellation** (wave 5, overtime tier 1, rerun-flagged) — the first wave-5 fight lands 7 days after the unlock poll, not on it. Lena dies in it.
- **Window deaths (13):** Lena d100 (Cancellation) → Mateo d107 (monster w3, unlinked) → Raj d127 (monster w5, unlinked) → James d134 (monster w4, unlinked) → Sung + Olivia d136 (Reunion + Algorithm, same day) → **the Eulogy cascade d137–140: Wakjira, Sanne, Chantal, Elena, Nora, Grace, Ali — 7 deaths to one wave-4 Eulogy in 4 days.**
- **End state:** overtime tier **6 (max)**, seat lesser, table waiting, bars 0 armored / 0 armed / 23 tricks / 0 veterans / roster 1 at the last death (Ali d140 vs Eulogy).
- **Wave-5 exposure is thin:** the whole run fights wave 5 only 3 times, all Cancellation (tiers 1/4/4, rerun). **This village did not die to wave-5 apex fights — it died to a wave-4 Eulogy cascade under the max overtime clock.**

### s70814 — door d83, lost d146 (63 days post-door; national 1, table 1 at end; roster 2 at end)

- **Door fight:** d86 vs **Rerun** (wave 5, tier 0, non-rerun — the monster named Rerun, not the rerun mechanic).
- **Window deaths (15):** Lisa d91 (Eulogy) → Wilailak d92 (Buffering) → **Editor massacre d123–124 (Mateo, Catalina, Fatima, Jada — 4 deaths, wave-5 Editor)** → Juliana d127 / Stefano d130 / Boris d137 (monster w5/w5/w5, unlinked) → **Rerun triple d140 (Joyce, Pavel, Carlos)** → Meera d141 + Dina d144 (monster w4, unlinked).
- **End state:** overtime tier **6 (max)**, seat full, table waiting, bars 1/2/21/1/roster 2 at the last death (Dina d144, unlinked monster w4).
- **Wave-5 exposure is real here:** Rerun, Editor ×2 (tier 4), Nielsen ×5 (tier 5), Rerun (tier 6) — 9 wave-5 fights. But the final blows are still the rerun clock (Rerun d140) plus unlinked attrition, not a single apex duel.

### What kills post-unlock villages (answer to #861, on current master)

The overtime-rerun clock at tier 6, while the table waits. Both windows end at tier 6 with the table waiting and bars collapsing. The killer is not one monster: it's the grind — rerun-scaled wave-4/5 fights plus attrition, with one sharp mechanism each (Eulogy cascade in 70811, Editor+Rerun in 70814). The 48d and 63d lags sit squarely inside wallseg's 17–65d template. Postunlock-b's s70204 villages (doors d167, survived to cap) are the same story cut off at 13 days: the window didn't fit, not that the village was safe.

## Honest comparison (rate-level only — fresh band vs 702xx)

| census | substrate | doors | post-unlock deaths in cap | failure mode |
|---|---|---|---|---|
| wallseg (c76a52480b09) | old | 8/8 | 8/8, lost 17–65d later | surviving wave 5 is the wall |
| postunlock-b rebase (be55cfc2c) | middle | 2/8 | 0/8 (survived to cap) | doors opened d167 — 13d window, cap truncation |
| **this census (73d344a87)** | **current** | **4/32** | **4/4, lost 48d + 63d later** | **door rare AND surviving is total** |

Is this substrate drift or real change? Both, separated honestly: the door RATE fell (100% → 25% → 12.5% across three censuses on different bands — rate-level, not matched-config, so no drift magnitude can be claimed), but the post-unlock DEATH pattern matches wallseg's shape, not postunlock-b's. The variable that explains postunlock-b's survival shape is door TIMING (d167 vs d83/d93), which is a property of the seed band, not of lethality. Nothing here shows wave 5 got safer; the two villages that opened early enough both died in-window.

## Reachability verdict

- **Wave 5 unlock:** reachable but rare — 4/32 (12.5%) on a fresh competent band; the two opening seeds are 70811 and 70814.
- **Wave 5 content:** reachable — Cancellation, Rerun, Editor, Nielsen all fought blow-by-blow in-window (70814 fought 9 wave-5 fights).
- **National / table:** reachable — 18/32 each. Wins: 0/32 (structurally 0 under SEATDRIVE=0; not a reachability finding).
- **Arc II/III/IV, vests:** NOT measured by this DIAG (no arc/vest instrumentation in the corpus) — not claimed either way.
- **The win flag:** 0/32, same regime note as postunlock-b.

## Village assessment (plain words)

Most villages on this band die young or middle-aged: four never get past wave 2 (dead by day 61), four more reach wave 4 and die within 9–52 days of it (70815 dies 9 days after wave 4; 70816 dies 10 days after). The villages that last are the slow ones — 70801 never reaches wave 4 at all and survives to the cap; 70812 reaches wave 4 late (d112) and survives. The two villages that earn the door are the strong middle: national rank, table waiting, wave 4 faced early (d70/d75), standing 200+ — and then the overtime clock grinds them down over 48–63 days while the table waits. Nobody wins; nobody is exiled; the table never sits in any run (tableWaiting at every post-unlock death). The village that "earned the door" does not get a coronation — it gets a siege, and the siege is narrated (see sense check).

## Sense-testing (SENSE-TESTING LAW) — PASS

Sense target: **s70811-lead, door-open village**, narration:true replay (MARKED NON-MEASURED — narration shifts trajectories: replay door d101, lost d135 vs measured d93/d141; same shape). Transcript: `perseed-postunlock2-b/sim-postunlock2-b-sense.txt` (240 lines, d134–135, sayLive=true).

- **The death machine is legible in-fiction.** The RERUN ×6 Eulogy announces itself every round ("RERUN ×6 — you have seen this episode. It has seen you too. (Overtime: +150% HP, +72% damage, +3 in the pack.)"), verses count down ("5 verses remain. Contradict it — do the opposite — or give it a better ending."), Final Chapter hits land 34–58 through armor.
- **Villagers act like people.** Wassim stops mid-fight to bind a wound ("field medicine, +20 HP"); "Wassim is back with Lily"; deaths land socially: "You carry the weight of it. They died beside you." / "Nobody's talking much. The fire feels smaller tonight." / "The entry for Wassim is finished. No more pages." / "LILY — GONE. 1 open question closed unanswered." / "Somebody screams. Somebody else starts digging."
- **The ending is authored, not mechanical:** "No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here."
- **Honest caveats:** (1) the Eulogy verse lines repeat verbatim many times inside one fight — legible, but loopy; a feel note, not a failure. (2) The 240-line ring covers only the last 2 days because fights are line-dense — the sense window is fight-dense, not village-life-dense; daily village life between fights is not visible in this tap.

## New findings (for the coordinator to append to sim-findings.md — NOT edited here)

1. **[open] 2026-10-24 — post-unlock retention — wallseg's "surviving wave 5 is the next wall" CONFIRMED on current master (4/4 door-open villages lost 48–63d later; postunlock-b's survive-to-cap shape explained by d167 door timing + 180d cap, not safety). (this run)**
2. **[open] 2026-10-24 — policy identity — lead vs belong trajectories byte-identical on all 16 seeds (same w4/w5/end/flags). The lead/belong policy distinction moves nothing on this substrate+band; either the policies differ only downstream of the shared RNG stream or the distinction is vestigial here. Worth a DIAG before any arm leans on the lead/belong split. (this run)**
3. **[open] 2026-10-24 — death attribution — 9/28 post-unlock window deaths are unlinked "monster" rows (fightBasis none), same class as postunlock-b's Jae-chan: the instrument records cause+wave but no killer fight. The killing shape is still clear (Eulogy/Editor/Rerun + tier-6 clock), but per-death linkage has a known gap. (this run)**
4. **[open] 2026-10-24 — wave-5 exposure — 70811's village died to a wave-4 Eulogy cascade having fought wave 5 only 3 times (all Cancellation). The door's killer is often wave-4 reruns, not wave-5 apex duels — "surviving wave 5" means surviving the rerun clock, not one boss. (this run)**
5. **[open] 2026-10-24 — wave-4 arrival lethality — 70815 dies 9 days after wave 4 (d69→d78), 70816 dies 10 days after (d122→d132). Wave-4 arrival itself kills fast on some seeds, before standing 200 is even in play. (this run)**
6. **[open] 2026-10-24 — tooling/EPERM — the container EPERM write flap blocked every ~30KB per-seed write for a long stretch (two sweep processes, evidence/ and scratch dirs alike) while small appends succeeded throughout. Workaround landed in this arm: fresh-process chunked-append writer (1KB chunks + per-chunk retry + hash verify + rename) in `scripts/sim-postunlock2-b-writer.js`. The flap is temporal and flaky second-to-second, not dir-scoped — persistence, not relocation, is the fix. (this run)**

## Metric review (§14)

The pre-registered bar is met as written: census complete (32/32 files, 0 missing), every door-open config window-attributed (4/4, via analyzer + E3 gate), verdict named (both walls, in sequence — see above). No re-scoring happened: the extension rule fired exactly as pre-registered (0 doors < 4 → extend to 16 seeds/policy), and the verdict follows the numbers, not a friendlier metric.
**Residual honesty note for the NEXT run:** the post-unlock attribution rests on 2 independent seeds (70811, 70814 — the ×2 policies are byte-identical trajectories, not independent villages). Effective n=2 villages, not 4. The next DIAG on #861 should either find more door-open seeds or state n=2-seeds as the population. No metric revision is proposed — the bar worked — but the n=2 caveat travels with the verdict.
**Balanced panel (§15):** N/A by construction for this DIAG census — the panel judges matched before/after on identical seeds, and this run makes no intervention and no before/after comparison (fresh band, rate-level priors only). The pre-registered bar judges, as the brief allows.

## Proof tests (scripts/test-sim-postunlock2-b.js) — 5 passed, 0 failed

- E1 determinism: PASS — byte-identical re-run (sha `cfcfa4657d3a` both), instrumentErrors=[].
- E2 behavior-neutrality: PASS — instr 180/survived/w3 vs plain 180/survived/w3, deaths match.
- E3 CENSUS bar: PASS — files=32/32, doors=4, attributed=4, unattributed=[].
- E4 row-schema: PASS — 414 death rows checked, bad=0.
- E5 sayRing mechanism: PASS — narration:true ring=240 sayLive=true; narration:false sayLive=false.
- Note: E3/E4 were extended from the pilot set (70801–70808) to the full set (70801–70816) BEFORE running, to judge the full census including the extension — the extension was pre-registered, so this is the planned gate, not a mid-run revision.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-24/perseed-postunlock2-b/s708*.json' --metrics national,table,wins,exiled`

- **1 LOUD:** "wins disappeared: baseline 16 → current 0 (n=32 files)" — **regime artifact, explained** (same as postunlock-b). The scale-wall baseline is the winseat regime (SEATDRIVE=1 suite); this corpus is deliberately SEATDRIVE=0, where wins are structurally 0. Baseline NOT rolled.
- national/table/exiled: no LOUD lines.

## Convergence

**DIAG-GO** | the #861 question is answered on current master: the door is rare (4/32) AND surviving past it is a total wall (4/4 lost, 48–63d). The next question is no longer "does the wall exist past the door" but "what breaks the tier-6 rerun grind while the table waits" — a lever question for a future arm (overtime pacing vs readiness bars vs table-sitting), not a DIAG question. The Eulogy cascade (70811) and Editor+Rerun (70814) are the named mechanisms to aim at.

## Blanks filled (builder)

1. **Fresh-band door census on current master** (the exact revision postunlock-b prescribed): 32 configs, 0 → 4 doors via the pre-registered extension, all four windows attributed end-to-end.
2. **EPERM-proof sweep writing:** chunked-append fresh-process writer with hash verify + rename; the sweep survived a long flap window that killed its first two attempts outright.
3. **Post-unlock killing shape, named:** tier-6 overtime clock + table waiting + bar collapse, with Eulogy cascade and Editor/Rerun as the sharp mechanisms — not a single apex duel.
