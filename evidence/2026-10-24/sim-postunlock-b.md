# sim-postunlock-b — POST-UNLOCK RETENTION autopsy (backlog #861)

**Run:** fleshout-20261024T0615Z · **Arm:** sim-postunlock-b2 · **Axis:** scale-onramp (standing directive)
**Type:** DIAG (instrument-only, zero src/js) · **Verdict: DIAG-NO-GO** (pre-registered primary unmeasurable — see metric review; failure mode flipped on rebase, see addendum)
**Anchor:** `071b00b26727` (rebased branch tip; src/js byte-identical to master `be55cfc2c`) · **Prior anchor (first measurement):** `6add5c9a07e2` — its results are preserved below, not overwritten · **Wallseg anchor:** `c76a52480b09`
**Evidence:** `evidence/2026-10-24/sim-postunlock-b.md` · **Corpus:** `evidence/2026-10-24/perseed-postunlock/` (8 configs) + `postunlock-attribution.json`
**Instruments:** `scripts/postunlock-{instrument,sweep,analyze,sense}.js` · **Proof:** `scripts/test-postunlock-b.js`

## REBASE ADDENDUM (2026-10-24, coordinator heads-up — read first)

Master moved `6add5c9a0` → `be55cfc2c` (6 commits: journey-establishment r31 — `src/js/food.js` SPECIALTIES.preserver widened to the real occupation pool, a real food-economy behavior change; journey-crisis r47 — `src/js/havenGrowth.js` dead-raider draft filter; journey-social r47 gossip variants; plus the depositrelief/homecoming-tax-b evidence commits). Branch `sim-postunlock-b2` rebased **inside the worktree** onto `be55cfc2c` (clean, 1/1, new tip `071b00b26`); the full 8-config census re-swept on the new base (anchor `071b00b26727`); the analyzer's PRIMARY computation fixed (it hardcoded the old "no doors" note — now mode-aware) and the proof re-run. **The verdict stays DIAG-NO-GO, but the failure mode flipped.**

### New-base census (identical seeds, policies, env, horizon; only the substrate changed)

| config | wallseg (c76a52480b09) | old base (6add5c9a07e2) | **new base (be55cfc2c)** |
|---|---|---|---|
| s70201 ×2 | w4 60, w5 84, lost d115 | w4 147, lost d176 | **survived d180, maxWave 3, table 0** |
| s70202 ×2 | w4 41, w5 104, lost d134 | w4 54, lost d74 | **identical: w4 54, lost d74** |
| s70204 ×2 | w4 75, w5 104, lost d121 | w4 180, survived d180 | **w4 79, w5 167, survived d180, maxWave 5** |
| s70209 ×2 | w4 67, w5 94, lost d159 | w4 65, lost d156 | **w4 65, lost d151** (shape changed, see below) |

New-base totals: national 6/8, table 6/8, wins 0/8, exiled 0/8, wave4 6/8, **wave5 2/8**, village-lost 4/8, survived 4/8.

### The flip: doors open, villages survive

- **Old base failure mode:** 0/8 doors — the population didn't exist because the door never opened.
- **New base failure mode:** **2/8 doors** (s70204 ×2, both policies identical) — but **0 post-unlock village deaths** within the 180d cap. Both villages survive to d180, 13 days post-unlock. The pre-registered PRIMARY (8/8 post-unlock deaths attributed) is still unmet, now because villages *don't die* after unlocking rather than because they *can't unlock*. The 180d cap is the absolute maximum run length (pacing law) — it cannot be extended to chase the deaths.
- **Seed-dependence of drift:** s70202 is byte-stable across the rebase (identical w4/lost days); s70201 moves from lost-d176 to survived-d180-maxWave-3; s70204 moves from never-unlocking to unlocking at d167. One food.js change re-rolls some seeds and leaves others untouched — the shared-RNG fragility finding, confirmed again.

### The s70204 post-unlock window (days 167–180, the first post-unlock population on current master)

- **Door fight, d167: The Rerun** (wave-5 monster, confirmed `wave: 5` in `src/data/monsters.json`, 1200–1500 HP, "Take Twelve") — overtime tier 1, flagged rerun. Yuki (villager) dies in it (same-day combat_start linkage).
- **Then 6 more fights in 13 days:** wave-3 terms_of_service (tier 2), wave-3 spool ×3 (tier 3), wave-4 strike RERUN (tier 3, party 2), wave-4 algorithm RERUN (tier 3, party 1). Only ONE wave-5 fight in the whole run — the door fight itself; no further wave-5 fights by d180.
- **Window villager deaths (4):** Yuki d167 (combat vs Rerun), Luis d170 ("the night", veteran4+), Vito d178 (combat vs algorithm), Zoltan d180 (monster, wave 4, armored+armed). **Roster holds at 7–8 through the window** (8 at cap) — this is not a village collapsing; it's a village holding the door. No village-lost, so no killing window to attribute.
- **Sense note (from the rows, not a transcript):** the window reads as a village that earned the door and is *holding* it — deaths are individual (one per fight, spread across days), not a cascade. The retention-trap question sharpens: what kills a village that *holds* for 13 days? The cap cuts the answer off.

### Changed current-substrate deaths (bonus attribution, new base)

- **s70202 ×2: UNCHANGED** — d74, Stan + Miguel killed by wave-4 Influencer, tier 0 (non-rerun), 0/0/0 bars at end. The one stable death across both bases.
- **s70209 ×2: SHAPE CHANGED** — old base: d156, Revathi + Leroy killed by wave-4 Reunion RERUN ×6, 0/0/0 bars. New base: d151, last death Jae-chan (wave-4 monster, unlinked fight — `fightBasis: none`, no linked combat row), overtime tier 6, village **3 armored / 3 armed / roster 3 at end**. The harness reports village-lost at d151 with roster 3 remaining — the instrument records the harness verdict and the last-death row but does not independently determine the loss trigger (scholar death? village-state check?). **Blank for the next round:** what the harness's village-lost condition is when roster > 0. Not a gap in the death attribution — Jae-chan's row is complete (cause, wave, tier, bars) — but the *loss trigger* is undocumented.
- **s70201 ×2: no deaths to attribute** — survived d180 at maxWave 3 (never reached wave 4).

### Proof on the new base (scripts/test-postunlock-b.js)

- E1 determinism: **PASS** — byte-identical (sha `82f31945453b` both; sha changed from `50cbd2029f9e` on the old base, confirming the substrate shift), instrumentErrors=[].
- E2 behavior-neutrality: **PASS** — instr 180/survived/w3 vs plain 180/survived/w3, deaths match.
- E3 PRIMARY 8/8: **FAIL** (honest) — unlocks=2/8, killingWindows=2/8. Note the E3 nuance: its killingWindows=2 counts s70204's last-day person deaths (Zoltan d180), which are NOT village-killing deaths (both villages survived to cap). The analyzer's stricter PRIMARY — post-unlock village-lost events — is **0/8**. Both framings fail; the stricter one is the pre-registered metric.
- E4 row-schema: **PASS** — 124 death rows checked, bad=0.
- E5 sayRing mechanism: **PASS** — narration:true ring=240 sayLive=true; false empty by design.
- **Proof state: E1/E2/E4/E5 green, E3 failing as the DIAG-NO-GO.** E3 was NOT weakened or dropped to force green — per §14 the miss stays a miss.

### Updated metric review + next round

The original metric-review prescription ("re-measure the door census on current master FIRST") is now partially satisfied: the door census on the new base is 2/8, and the post-unlock population exists but doesn't die within cap. **Recommended next round (coordinator call):** a wider door census on the new base (fresh seed band, same substrate+policies) to find villages that unlock *early enough* (e.g. ≤d130) for a 17–65d post-unlock death window to fit inside the 180d cap — the wallseg band's death lags (17–65d) are the template. The postunlock instrument is proven on both bases (E1/E2/E4/E5 green twice) and the analyzer now reports the post-unlock window (door fight, window deaths, roster at end) for any config that opens.
**Telemetry (new base):** 2 LOUD lines, both regime artifacts — wins 16→0 and table 16→6 vs the winseat baseline (SEATDRIVE=1 suite; this corpus is deliberately SEATDRIVE=0). Baseline NOT rolled. New-base totals: national 6/8, table 6/8, wins 0/8, exiled 0/8.

## Pre-registration (binding, MEASUREMENT.md §14)

- **PRIMARY:** 8/8 post-unlock village deaths attributed — cause of the killing blow, day relative to unlock, fight composition, rerun/overtime scaling at death, armor/veteran counts at death.
- **SECONDARY:** per-death named lever candidate for a back-to-back lever round.
- **GO iff** 8/8 attributed AND ≥1 named lever candidate. A miss is NO-GO, never re-scored mid-run.
- **Horizon:** 180d death-aware (dead villages stop; never a fixed 200d).
- **Seeds:** the 8 wave-5-door configs from the landed wallseg census (fleshout-20261024T0215Z, arm sim-wallseg): 70201, 70202, 70204, 70209 × {leadfeast, belongfeast}. Deliberate re-sweep (C1 freshness explicitly not applied — same seeds, new instrument).
- **Substrate (pinned):** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2 — the identical wallseg policy objects (`scripts/wallseg-sweep.js` `policyFor()`), enforced by the same module-scope env guard.
- **Method decision:** offline analysis of the landed corpus was insufficient (no per-death rows, no opponent linkage, no overtime tier at death, no bar counts at death) → extended the instrument (postunlock-* namespace) and re-swept.

## Verdict: DIAG-NO-GO — the 8 deaths don't exist on current master

The identical 8 configs (same seeds, same policies, same env, same 180d death-aware horizon) on the current substrate open **0/8 wave-5 doors** (landed: 8/8). The pre-registered population — 8 post-unlock village deaths — is unmeasurable. The DIAG's premise (a stable door band to re-sweep) was invalidated by substrate drift.

### Drift table (identical seed+policy+env+horizon; only the substrate changed)

| config | landed w4/w5 (c76a52480b09) | current w4/w5 (6add5c9a07e2) | landed end | current end |
|---|---|---|---|---|
| s70201 ×2 | w4 60, w5 84 | w4 147, w5 — | lost d115 | lost d176 |
| s70202 ×2 | w4 41, w5 104 | w4 54, w5 — | lost d134 | lost d74 |
| s70204 ×2 | w4 75, w5 104 | w4 180, w5 — | lost d121 | **survived d180** |
| s70209 ×2 | w4 67, w5 94 | w4 65, w5 — | lost d159 | lost d156 |

s70209 is the cleanest evidence the DOOR moved, not just trajectories: wave-4 unlock day is nearly identical (65 vs 67) and the death day nearly identical (156 vs 159), yet wave 5 opened at d94 on the old substrate and never opens on the new one across 91 further days. The w5 gate (standing ≥200 AND wave-4 faced) stopped being reachable on this band.

### Root cause of the drift

- `git diff c76a52480b09..HEAD`: **no** `src/data/` changes (standingCfg demands untouched), **no** policy changes (deed-seeking.js diff is additive exports only; trustbuffer/vetformation/armorvillage untouched), sim-harness untouched.
- The drift comes from `src/js` conversation/narrative-layer commits in the window: journey-landing r42 (convo-beats.js fizzle fixes), journey-establishment r30 (convo routing), journey-deepening r39 (scaleDiscovery dedup gate), journey-social r47 (convoTopics.js/spawn-knack.js gossip variants).
- These shift the **shared Math.random stream**: narrative/conversation RNG draws are not isolated from systems RNG (the harness isolates only *policy* RNG — `global.__policyRandom`, audit 2026-10-14). A gossip-variant change re-rolls combat trajectories downstream. Wall censuses are therefore fragile across journey commits — a methodological finding for the loops (named lever candidate below).

## What the instrument proved anyway (bonus, end-to-end on real deaths)

The 6 current-substrate village-lost events were fully attributed with the complete row set (all 12 killing-window death rows carry opponent + fight composition + rerun flag + overtime tier + armor/veteran + village bars):

| config | killing window | killer | rerun | bars at end (a/w/v) |
|---|---|---|---|---|
| s70201 ×2 | d176, Antonia + Victor | wave-4 **EATER** (live-tbfight) | **RERUN ×6** | 0/0/0, roster 1 |
| s70202 ×2 | d74, Stan + Miguel | wave-4 **Influencer** | tier 0 (no rerun) | 0/0/0, roster 1 |
| s70209 ×2 | d156, Revathi + Leroy | wave-4 **Reunion** | **RERUN ×6** | 0/0/0, roster 1 |

Shape of the current wall on this band: villages reach wave 4, then the **overtime clock** (table waiting, seat untaken — `seat=lesser`, `tableWaiting=true`) climbs to **tier 6 (max)** and RERUN-scaled wave-4 monsters (+150% HP, +72% dmg) kill the remnant. At every death the village had **0 armored, 0 armed, 0 veterans** — the readiness bars collapsed while tricks piled up (20–31 counters known). s70202 died 20 days after its wave-4 unlock to a non-rerun Influencer, unarmored — the wave-4 arrival itself is lethal to an unready village. s70204 never unlocked wave 4 until day 180 and survived — the slow road lives, the fast road dies.

## Sense-testing (SENSE-TESTING LAW)

The measured corpus runs narration-off by harness design (Game.say stubbed), so the sense pass used a **sense-only** narration:true replay of 70209-lead (marked non-measured; narration shifts trajectories — death day 151 vs 156). Verdict: the deaths read as **meaningful, not mechanical attrition**:

- The killer is announced diegetically every round: "🎙️ RERUN ×6 Big-Eyes's turn" — the overtime machine is voiced, legible, in-fiction.
- Deaths have social consequences: "Raul is dead — and the dead hold no treaties. Every link Haven has shakes." Linked villages press tributes down while the chair is empty.
- Villagers act like people: "Raul's gone." Revathi looks at you for a long moment. "You're not Raul." No heat in it. Just fact. You'll have to earn this face.
- The scholar died twice in two days (Raul d150, Stan d151) — the vetautopsy "chair is 100%" finding reproduces in the transcript.
- The ending is authored: "No one is left to pick up the Codex. The village dies out — quietly, the way villages do. The season ends here."
- The RERUN ×6 Eulogy's Final Chapter hit for 43–67 through armor — the scaling, not the base monster, is the killer.

## Village assessment

The village that "earned the door" on the old substrate cannot be assessed on the new one — the door moved. What the current substrate shows instead: villages that reach wave 4 are ground down by the overtime rerun clock while the table waits. They learn (20–31 tricks) but cannot hold armor, weapons, or veterans through the grind; the w5 standing bar (200) stays out of reach while overtime climbs to max. The retention trap's *shape* persists one wave down: it's not "open the door and die," it's "reach wave 4 and the clock kills you before the door opens."

### Reachability notes

- Wave-5 *unlock* (standing ≥200 AND wave-4 faced): 0/8 on current master for this band — not reachable here.
- Wave-5 *content* is reachable through a side channel: **The Nielsen** (wave-5 Producer, confirmed `wave: 5` in `src/data/monsters.json`) fought s70209 in aid-crisis fights on days 123–125 at overtime tiers 4–5 (rerun ×4–5), while `maxWave` stayed 4. The aid-crisis spawn pool is not gated on the wave-5 unlock. (Candidate for the findings backlog — coordinator owns sim-findings.md.)
- Overtime tier 6 (max) was reached and voiced ("RERUN ×6") with the table waiting — the RERUN-overtime clock is fully functional and lethal on this band.

## Blanks filled (builder)

1. **postunlock instrument** (zero src/js): per-death rows with opponent linkage (live-tbfight → same-day combat_start → prior-3d fallback → cause-names-monster), hp/armor/armed/veteran4+ at death, village bar counts (the same `waveUnlockReady(5)` bars the gate reads), overtime tier + table/seat state at death, killing-fight pack composition + rerun flag, unlock-day poll, say-ring transcript tap, sayLive detection. Gaps found and closed mid-run: aid-fight deaths (added `aidFight` wrap — vetautopsy pattern), monster-named causes, cross-day-boundary kills.
2. **Substrate-fragility finding** documented above — the wall numbers moved under the loops; census bands need re-baselining after journey commits.
3. **sayLive detection**: explains why measured-corpus say-rings are empty (harness stubs say/sysSay unless `narration:true`) and proves the transcript tap works (E5).

## Named lever candidates (secondary → next round)

1. **Overtime-rerun pacing vs the w5 door** (levers 1/2/8): on the current band, villages die to RERUN ×6 wave-4 fights with the table waiting and standing <200. Back-to-back question: does softening rerun scaling (or pausing the overtime clock while standing < the w5 bar) let villages reach the door? Pre-register: door-open rate on the re-measured band.
2. **RNG-stream isolation** (methodological, harness-side): isolate narrative/conversation RNG from systems RNG (the way policy RNG was isolated 2026-10-14) so wall censuses survive journey commits. Without it, every conversation-layer commit silently re-rolls the scale wall.
3. **Armor/veteran retention through the wave-4 grind** (levers 0/3): all 6 deaths ended at 0/0/0 bars — the village can't re-arm under rerun pressure. Why armor goes to zero is unanswered (crafting? loss? no replacements?) — a DIAG on the armor pipeline.

## Metric review (§14)

The pre-registered PRIMARY assumed the wallseg door band was stable across substrates. It wasn't: 8/8 → 0/8 on identical seeds. The metric didn't fail from noise — its *premise* (a reproducible door-opening band) was invalidated. Per §14 this run is NO-GO on the primary as written, not re-scored against a friendlier metric.
**Proposed revision for the next run:** re-measure the door census on current master FIRST (fresh seed band, same substrate+policies); attribute post-unlock deaths only on the band that actually opens. The postunlock instrument is proven and ready (E1/E2/E4/E5 green).

## Proof tests (scripts/test-postunlock-b.js)

- E1 determinism: PASS — byte-identical re-run (sha 50cbd2029f9e both), instrumentErrors=[].
- E2 behavior-neutrality: PASS — instrumented vs plain runs agree (days 176, village-lost, w4, death totals match).
- E3 PRIMARY 8/8: **FAIL** — 0/8 unlocks (the DIAG-NO-GO, by design honest).
- E4 row-schema: PASS — 344 death rows (112 person), 0 instrument errors; every person row attributed at an honest level: live-tbfight / same-day combat_start / prior-3d fallback / aidFight rows / cause-names-monster (the game's own cause string names the killer, e.g. 'Choir Toad') / documented nearest-fight (2 lingering-wound deaths outside any recorded fight — nearest fight named with day distance, not silently dropped).
- E5 sayRing mechanism: PASS — narration:true fills the ring (240 lines, sayLive=true); narration:false leaves it empty by harness design.

## Convergence

**DIAG-NO-GO** | parked (pending the re-measured door band). The retention-trap question (#861) is unanswered on current master — not because the instrument failed (it's proven end-to-end), but because the door it was built to autopsy stopped opening. The run's yield is the drift finding + the current-substrate wall shape (overtime reruns kill wave-4 villages at 0/0/0 bars before standing 200) + three named lever candidates.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-24/perseed-postunlock/s7020*.json' --metrics national,table,wins,exiled`

- **1 LOUD:** "wins disappeared: baseline 16 → current 0 (n=8 files)" — **regime artifact, explained.** The scale-wall baseline is the winseat regime (SEATDRIVE=1, ~100%-win suite); this corpus is deliberately SEATDRIVE=0 (non-seat substrate), where wins are structurally 0. The baseline's own `_regime` block says not to compare pre-seat substrates against it. Baseline NOT rolled.
- national/table/exiled: no LOUD lines (8/8 configs: national 6/8, table 8/8, exiled 0/8).
