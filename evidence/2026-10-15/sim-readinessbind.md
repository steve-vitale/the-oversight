# sim-readinessbind — the wave-4/5 Standing-unlock readiness diagnostic (2026-10-15)

Worktree: `~/workspace/worktrees/sim-readinessbind`. Run: oversight-flesh-out-loop, scale-onramp axis, lever-2 lens.
The #209/#210 named diagnostic: the diplomacy road to wave 4 is lethal (proposelayer-r33: 4/6 unlocking seeds died 20–50d early) and the plenty road to wave 5 is lethal (dutyalone-r15: combat deaths 116 vs 62, median −17d). Both roads unlock waves via Standing WITHOUT selecting for military readiness. This diagnostic instruments the unlocks so the future readiness-gate arm can be spec'd from data.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Axis**: scale-onramp (the wall). **Instrument-only**: read-only telemetry wraps, ZERO src/js changes, no policy behavior changes.
- **Substrate**: courtship + leadfeast roads (diplomacy/plenty unlock drivers).
  - `FOURTHLINK=1` → scripts/policies/fourthlink.js (id `fourthlink`, uncapped courtship)
  - (no gate) → scripts/policies/belongseek.js (id `belongseek`)
  - `FEASTSCALE_R13=1` → scripts/policies/feastscale.js (id `leadfeast`)
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 180d death-aware (harness stops dead villages; +10d tail).
- **Instrument**: scripts/readinessbind-sweep.js (sampler) + scripts/readinessbind-lib.js (readers/math).
  At every wave-4/5 Standing unlock (first observed `Game.unlockedWave() >= wave`), capture the 8 readiness covariates at unlock day:
  1. wave-(w-1) ledger kill points, per type
  2. villagers with learned counters for wave-(w-1) types — count + share. STRUCTURAL: the engine stores counter knowledge VILLAGE-level (state.monsterCounters + state.villagerTricks, shared 2-observation fire bar); per-villager differentiation does not exist by design. Measured at type granularity.
  3. scholar armor P (additive pieces, `Game.armorBonus()`)
  4. roster alive count (living NPC villagers)
  5. pantry fresh-days
  6. trust (village mean)
  7. rank/scale
  8. the 30d post-unlock outcome — see operationalization below.
  Plus unlock-driver context: Standing war/diplomacy/plenty breakdown; and the unlock beat text (say/sysSay ring) for sense-testing.
- **Outcome operationalization** (pre-registered): window = [unlockDay, unlockDay+30].
  - finalDay >= unlockDay+30 → `held` if livingNPCs>0 at +30, else `hollow`
  - run ended early: endReason `village-dead` (deadTail: scholar alone) → `hollow`; `survived` (horizon) with finalDay < unlockDay+30 → `held-censored`; else (`village-lost`/`over-other`) → `died`
  - `tableBy30`: orthogonal flag — table seat reached on any day in the window.
  - `hollow` = village-lost with scholar alive (the community is gone, the scholar continues).
- **PRIMARY (diagnostic GO)**: (a) ≥80% of wave-4/5 Standing unlock events FULLY ATTRIBUTED — all 8 covariates captured at unlock day AND 30d outcome determined uncensored (`held`/`died`/`hollow`; died/hollow before +30 IS determined — the window closed by termination); censored cases reported separately, in the denominator, out of the numerator; AND (b) NAMED separating factors between holders (`held`) and corpses (`died`/`hollow`), OR named unconcentration per the pre-registered separation rule below.
- **Separation rule** (pre-registered, scripts/readinessbind-lib.js `separation()`):
  - covariates: ledgerPointsPrev, tricksPrevShare, scholarArmorP, rosterAlive, pantryFreshDays, trustMean
  - SEPARATES: both groups n≥3 AND value ranges disjoint
  - SUGGESTIVE: both groups n≥2 AND |median_h − median_c| ≥ pooled MAD (ranges overlap)
  - ≥1 SEPARATES → "separating factors: [...]"; else any SUGGESTIVE → "suggestive only: [...]"; else UNCONCENTRATED (named: no single covariate separates — the future gate arm needs a composite or a different signal)
  - <6 total unlock events → UNDERPOWERED (cannot name either honestly)
- **NO-GO**: attribution < 80%, or separation underpowered (<6 unlocks), or the instrument-honesty proof fails. A miss is NO-GO, never re-scored mid-run.
- **Gates before spend**: proof scripts/test-readinessbind-20261015.js REAL RED→GREEN (R1 mutating-probe RED proves hash sensitivity; G1 instrument ON/OFF byte-identical 60d; R2 no-hallucination RED on 15d smoke; R3/R4 classifier+math REDs); SMOKE=1 instrument gate.
- **Deliverable**: this diagnostic SPECS the future readiness-gate arm — name the bar the data supports (or the honest "no bar supportable").

## Gates (all green before spend)

- **Proof** `scripts/test-readinessbind-20261015.js`: PROOF GREEN. R1: MUTATE=1 naive probe (500 kcal/day pantry drain) DIVERGED from clean at hash idx 0 — the trajectory hash is sensitive. G1: instrument ON vs OFF byte-identical over 60d (seed 33, leadfeast) — the sampler's reads (unlockedWave, tableSeat, livingNPCs, standingTotal, readinessSnapshot, say-wrap) are trajectory-neutral. R2: 0 unlocks on 15d smoke × 3 policies — no hallucination. G2: full 8-covariate snapshot shape on a live day-1 game (incl. 9 wave-3 types for tricksPrev). R3/G3: 7/7 outcome-classifier cases (held/died/hollow-via-deadtail/hollow-at-30/held-censored/table-boundary±1). R4/G4: attribution math (0.6 below bar, 1.0 GO, censored 4/5=0.8 boundary) + separation math (separated→SEPARATING scholarArmorP; overlapping→UNCONCENTRATED; 3-unlock→UNDERPOWERED).
- **SMOKE=1** `scripts/readinessbind-sweep.js`: 3/3 policies unwrap (ids fourthlink/belongseek/leadfeast), sampler collects 15/15 daily samples with wave+standing+living reads, zero unlocks (gate-contrast: none expected that early).

## Results

24 runs (3 policies × 8 seeds, 180d death-aware). **19 wave-4/5 Standing unlock events** (14 w4, 5 w5 — all w5 on leadfeast).

| wave | n | held | died | hollow | held-censored | tableBy30 |
|---|---|---|---|---|---|---|
| 4 | 14 | 9 | 3 | 1 | 1 | 1 |
| 5 | 5 | 3 | 1 | 1 | 0 | 1 |
| all | 19 | 12 | 4 | 2 | 1 | 2 |

- **Attribution: 18/19 = 94.7% ≥ 80%** — every uncensored unlock fully attributed (all 8 covariates + determined outcome). The 1 censored case (belongseek/77/w4, unlock d156, survived to d182, 26d observed) is in the denominator, out of the numerator, per the pre-registered rule.
- **Separation verdict (pre-registered rule): SUGGESTIVE-ONLY** — holders n=12, corpses n=6. No covariate SEPARATES (no disjoint ranges). Suggestive: scholarArmorP, rosterAlive, trustMean. ledgerPointsPrev, tricksPrevShare, pantryFreshDays: no signal.

Per-covariate (holder median vs corpse median, pooled MAD, ranges):

| covariate | h_med | c_med | MAD | h_range | c_range | signal | direction |
|---|---|---|---|---|---|---|---|
| ledgerPointsPrev | 0 | 0 | 0 | [0,3] | [0,3] | none | — |
| tricksPrevShare | 0 | 0 | 0 | [0,0.111] | [0,0] | none | — |
| scholarArmorP | 6 | 23.5 | 10 | [0,40] | [0,35] | SUGGESTIVE | **inverted** (corpses MORE armored) |
| rosterAlive | 8 | 7 | 1 | [4,9] | [6,8] | SUGGESTIVE | expected (one villager) |
| pantryFreshDays | 14.04 | 14.40 | 5.74 | [2.19,46.8] | [0.76,24.24] | none | — |
| trustMean | 48.9 | 51.45 | 2.45 | [41.4,55] | [44,57.7] | SUGGESTIVE | **inverted** (corpses MORE trusted) |

Per-unlock (policy/seed/wave, unlock day, outcome, Standing war/dip/plenty, ledger pts, tricks, P, roster, pantry-d, trust, rank):

| unlock | day | outcome | war | dip | plenty | led | trk | P | ros | pan | tru | rank |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| fourthlink/22/w4 | 99 | held | 0 | 102 | 0 | 0 | 0/9 | 10 | 9 | 24.5 | 55.0 | regional |
| fourthlink/44/w4 | 58 | held | 25 | 102 | 0 | 1 | 1/9 | 2 | 9 | 12.9 | 51.0 | regional |
| fourthlink/66/w4 | 65 | died | 0 | 102 | 0 | 0 | 0/9 | 0 | 7 | 14.9 | 44.0 | regional |
| fourthlink/77/w4 | 57 | held | 0 | 102 | 0 | 0 | 0/9 | 35 | 8 | 14.3 | 41.4 | regional |
| fourthlink/88/w4 | 57 | held | 0 | 102 | 0 | 0 | 0/9 | 30 | 4 | 5.4 | 48.3 | regional |
| belongseek/22/w4 | 115 | held | 75 | 34 | 0 | 3 | 1/9 | 40 | 8 | 2.2 | 49.5 | national |
| belongseek/44/w4 | 136 | died | 75 | 34 | 0 | 3 | 0/9 | 10 | 6 | 22.1 | 57.7 | national |
| belongseek/77/w4 | 156 | held-cens. | 75 | 34 | 0 | 3 | 1/9 | 35 | 6 | 101.7 | 65.7 | national |
| leadfeast/22/w4 | 55 | died | 0 | 0 | 100 | 0 | 0/9 | 17 | 7 | 24.2 | 54.9 | regional |
| leadfeast/22/w5 | 82 | died | 25 | 102 | 160 | 0 | 0/10 | 35 | 7 | 0.8 | 51.2 | regional |
| leadfeast/33/w4 | 57 | held | 0 | 102 | 80 | 0 | 0/9 | 10 | 8 | 19.8 | 50.2 | regional |
| leadfeast/33/w5 | 58 | held | 0 | 102 | 100 | 0 | 0/10 | 0 | 7 | 16.4 | 48.1 | regional |
| leadfeast/44/w4 | 55 | held | 0 | 0 | 100 | 0 | 0/9 | 0 | 8 | 8.3 | 52.6 | regional |
| leadfeast/44/w5 | 59 | held | 25 | 102 | 100 | 1 | 0/10 | 0 | 8 | 13.7 | 53.0 | regional |
| leadfeast/66/w4 | 43 | held | 25 | 0 | 80 | 1 | 0/9 | 10 | 7 | 46.8 | 42.0 | village |
| leadfeast/77/w4 | 56 | held | 0 | 0 | 100 | 0 | 0/9 | 0 | 9 | 15.4 | 44.4 | regional |
| leadfeast/77/w5 | 60 | held | 0 | 102 | 100 | 1 | 0/10 | 0 | 7 | 10.2 | 43.5 | regional |
| leadfeast/88/w4 | 55 | hollow | 0 | 0 | 100 | 0 | 0/9 | 30 | 8 | 4.1 | 50.6 | regional |
| leadfeast/88/w5 | 58 | hollow | 0 | 102 | 100 | 1 | 0/10 | 30 | 8 | 13.9 | 51.7 | regional |

### What the data says (the spec for the future gate arm)

1. **The military-readiness covariates are degenerate.** ledgerPointsPrev median 0 in BOTH groups (range 0–3; only belongseek's war-hybrid runs had any wave-3 kills). tricksPrevShare ~0 (1 of 19 unlocks knew 1 of 9 wave-3 tricks; all w5 unlocks knew 0 of 10 wave-4 tricks — waves 4–5 are counter-less by design). Villages unlock waves 4–5 having killed essentially nothing of wave 3 and learned essentially no counters. The diplomacy/plenty roads bypass military readiness entirely — measured, not hypothesized. **No bar can be built on covariates that don't vary.**
2. **No single covariate separates holders from corpses** (pre-registered rule → SUGGESTIVE-ONLY, ranges overlap everywhere). The two suggestive flags that exist INVERT the naive readiness story: corpses had MORE armor (23.5 vs 6) and MORE trust (51.45 vs 48.9). The natural experiment: leadfeast/77 vs leadfeast/88 — same policy, same unlock days (w4 d55/56, w5 d58/60), same Standing composition; /77 (P0, trust 44.4) HELD through wave 5 and reached the table; /88 (P30, trust 50.6) went HOLLOW at both unlocks. **A gate on armor P or trust would have gated the wrong village.** The only expected-direction suggestive is rosterAlive (8 vs 7, MAD 1) — one villager, and fourthlink/88 held with roster 4.
3. **The w5 "wave-4 faced" prong is toothless.** All 5 w5 unlocks had faced exactly 1 distinct wave-4 type (leadfeast/22 had 4), 1–4 days after w4 unlocked (w4→w5 lags: 27, 1, 4, 4, 3 days; median 4). The gate's "faced" = a single engagement, satisfied almost immediately. A future bar with teeth would be "≥N distinct wave-4 types faced" — untested, named as hypothesis.
4. **The plenty accelerator is the w5 engine.** w4 unlocks at plenty=100 (5 major feasts); w5 follows 1–4 days later on 1–2 more feasts plus already-seasoned links (standing 202–227). The T5 bar does not slow plenty-driven villages at all — #210's mechanism, now with unlock-day attribution.
5. **Standing is REVERSIBLE — waves re-lock.** leadfeast/33: standing 202 (w5, d58) → 170 (w4, d115); leadfeast/44: 227 (w5, d59) → w4 by d94. A broken seasoned link (−34) drops the bar and wave-5 monsters leave the spawn pool. The re-lock is a mercy mechanic by accident — and a spec question for Steve: should unlocks stick once earned?
6. **The unlock announcement trails the unlock by 0–6 days and never precedes it** (measured on 15 re-runs: lags 0,0,0,0,0,0,0,0,1,1,1,2,2,3,6). Mechanism: `checkWaveUnlockBeat()` fires only from kill/engagement paths (game.js:28665, game.js:39265, progression.js:555) — never from hostFeast or link-seasoning. The wave is in the spawn pool (castMonster reads unlockedWave() directly) before the System says "New casting directives incoming." #209's "nothing warns the village wave 4 is coming" now has its mechanism: the warning is kill-gated and late.
7. **Lethality confirmed, probabilistic.** 6/19 corpse outcomes (4 died, 2 hollow) — the diplomacy/plenty roads kill ~1 in 3 unlocking villages within 30 days, matching #209/#210's "probabilistic, not certain, death." The corpse pattern: fourthlink/66 bled 7→2 living over 29 days (attrition, not a single catastrophe); leadfeast/22 died 2 days after its w5 unlock; leadfeast/88 hollowed by d85 (zero living NPCs, scholar alone) and scattered at d110.

### GO verdict: GO

- (a) Attribution 18/19 = **94.7% ≥ 80%** — MET decisively. Every uncensored unlock fully attributed.
- (b) Separation: **SUGGESTIVE-ONLY per the pre-registered rule** — scholarArmorP, rosterAlive, trustMean named as suggestive-only with directions and overlapping ranges disclosed; ledgerPointsPrev/tricksPrevShare/pantryFreshDays named as no-signal. The rule's middle rung is reported verbatim (see metric review on the GO text's binary framing).
- Instrument honesty: proof GREEN (byte-identical ON/OFF); no mid-run rescoring.

## Metric review (§14 — for the NEXT run, not this one)

1. **The GO text's binary framing didn't cover the rule's middle rung.** The task's GO allowed "named separating factors" or "named unconcentration per a pre-registered separation rule"; the pre-registered rule defines three rungs and the data landed on SUGGESTIVE-ONLY. Verdict recorded as GO because (a) was decisive and (b)'s purpose — an honest named answer about holders vs corpses — is fully served by the middle rung reported verbatim with directions and overlaps. Next diagnostic's GO should name all three rungs explicitly. No rescoring happened: the verdict IS suggestive-only, stated as such.
2. **Report direction, not just the flag.** The lib's perCovariate already carries medians and ranges, which is what caught the armor/trust inversions. Any future separation report must lead with direction — a bare "scholarArmorP suggestive" would have invited exactly the wrong gate.
3. **The attribution boundary behaved.** Censored-in-denominator/out-of-numerator gave 18/19; the alternative (dropping censored from n) would have given 18/18 — same GO either way here, but the pre-registered form is the conservative one. Keep it.
4. **Beat-lag needed its own instrument.** The 12-line detection-window beat snapshot missed 19/19 beats (they lag 0–6d). The follow-up `_waveAnnounced` lag check (ad-hoc, /tmp) was the right tool. If beat timing matters to a future run, sample `_waveAnnounced` daily in the sweep proper.

## Village assessment (plain words)

The leadfeast villages are the gluttons #210 described: they feast their way to wave 4 by day ~55 (five major feasts = 100 plenty) and to wave 5 within days on the same fire plus three seasoned friendships. Five of eight reached wave 5 — and three of those five held it for the full 30 days. The fourthlink villages are the diplomats #209 described: three seasoned links by day ~57, wave 4 on diplomacy alone, then a slow bleed or a quiet hold. The belongseek villages are the hybrids: they actually fight (war 75 from real wave-3 kills) AND link, unlock latest (days 115–156), and look the most like the war road — but two of three still show the same pattern (one died, one censored).

The run of the sweep is leadfeast/77: wave 4 at day 56, wave 5 at day 60 — and ON day 60 the scholar Lily Duarte died in combat, the mantle passed to Nino Kapanadze the dry cleaner ("You're not Lily." No heat in it. Just fact.), and the village held through wave 5 anyway and reached the table within the month. The anti-story is leadfeast/88, same days, same Standing: hollow by day 85, scattered by day 110. Same unlock, same numbers, opposite fates — which is exactly why no single covariate separates them, and why the future gate arm will need to look beyond the unlock-day snapshot (post-unlock dynamics: who fights, who learns, who bleeds).

On unlock day itself the villages feel nothing special — fourthlink/66's fire talks about snares and wood logs while wave 4 is already in the treeline. The System's "you've been noticed" arrives 0–6 days later, framed as news. That decoupling is the quietest finding here and maybe the most fixable.

## SENSE-TESTING (beats read for meaning — judgment, not counts)

- The mantle-transfer sequence (leadfeast/77, d60) is the best-read beat in the sweep: "🕯️ Lily Duarte is dead — combat. The village stops. Somebody screams. Somebody else starts digging." → "You're not Lily." → the Codex syncing without pen or paper → the System's lie "(That is a lie. We noticed. The audience CRIED.)" → "🪞 You wake up somebody else. Nino Kapanadze, 56 — a dry cleaner." Coherent, consequential, human. PASS.
- The unlock-day rings are ordinary village life (fire gossip, snares, wood) — no System voice, because the beat lags. The fiction says the System escalates its attention; the text the player actually gets on unlock day says nothing. The announcement, when it lands days later via the next kill, reads as current news about an old event. As a player you would never know the wave arrived because of your feasts and friendships. WEAK — documented as blank 6 below, not a code bug (the beat works; its trigger doesn't cover the Standing paths).
- No robotic repetition beyond the game's own templates; cause lines and link beats read honestly throughout.

## Blanks filled / documented

- **FILLED**: the instrument itself — scripts/readinessbind-lib.js (readers + outcome classifier + attribution/separation math), scripts/readinessbind-sweep.js (the sweep; SMOKE=1 gate, MUTATE=1 proof-only probe, RB_OFF=1 proof mode), scripts/test-readinessbind-20261015.js (proof, REAL REDs → GREEN). Reusable by the future readiness-gate arm: point it at any policy set and it attributes unlocks the same way.
- **DOCUMENTED (sim-findings backlog candidates)**:
  1. Counter knowledge is village-level by design — per-villager "learned counters" is unmeasurable without engine changes (the task's covariate 2 measured at type granularity).
  2. Waves 4–5 are counter-less by design — counter-parity can't serve as a w5 readiness bar.
  3. Unlock announcement lags 0–6d, kill-gated, never precedes the wave (checkWaveUnlockBeat has no Standing-path caller).
  4. Standing is reversible — 2/5 w5 unlocks re-locked (link break). Steve's call: should unlocks stick?
  5. The w5 "wave-4 faced" prong = 1 engagement — toothless as a readiness signal; "≥N distinct faced" untested.
  6. The plenty→T5 accelerator: w4 at 5 feasts → w5 1–4 days later. Any feast lever must reckon with it (extends #210's finding with unlock-day attribution).
  7. The /77-vs-/88 pair: identical unlocks, opposite fates — the separator, if it exists, is in post-unlock dynamics, not the unlock-day snapshot. The future gate arm should instrument the 30d window itself (fight participation, learning, bleed rate), not just the unlock day.

## Files

- `scripts/readinessbind-lib.js` — read-only readers + outcome classifier + attribution/separation math (kept).
- `scripts/readinessbind-sweep.js` — the diagnostic sweep (kept; SMOKE=1 gate, MUTATE=1 proof-only probe, RB_OFF=1 proof mode).
- `scripts/test-readinessbind-20261015.js` — proof, REAL REDs → GREEN (kept).
- `evidence/2026-10-15/readinessbind-runs.json` — aggregate + 19 per-unlock records (kept).
- `evidence/2026-10-15/perseed-rb/` — 24 per-seed JSONs with unlock records + beat rings (kept).
- `evidence/2026-10-15/sim-readinessbind.md` — this file.
- Telemetry note for the coordinator: per-seed JSONs carry unlock/outcome/standing fields but NOT the telemetry-check metric fields (national/table/wins/exiled per run) — the sweep didn't track rank-over-time or win flags. If the coordinator runs step-10 telemetry-check on this data, those fields need adding to the sweep first.
