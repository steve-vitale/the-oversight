# ARM "sixthlink-r27" — 6th-link priority tending on the diplomacy road (scale-onramp) — NO-GO (killed)

Worktree: `~/workspace/worktrees/sim-sixthlink-r27`. Run: oversight-flesh-out-loop, run r27, loop A, axis scale-onramp.
Context: fifthlink-r26 (GO) converted 5th-link near-misses via the tend-first layer (answered grief + thin-first tends at the 13500–20000 lower gate). T5=200 needs 6 seasoned links (34×6=204, pure diplomacy). This arm extends tend-first to the 6th link: when 5 bonds already eat, the newest bond — racing a 30-day seasoning clock from trust 30 — gets tended FIRST in the band (earliest deadline, then largest deficit), before the thin-first pass.

Commit: policy-side only, default OFF. Layer DELETED per kill protocol (NO-GO) — evidence + scripts + determinism fix committed; the game-code detfix (stablePersonKey) landed as its own commit 7c7e06b6.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims; GO clause fixed AFTER the pre-screen per sim-findings #129

- **Question**: conditional on a 6th lead link FORMING, does 6th-link priority tending convert it to seasoned (30+d, trust 40+) — measured on forming seeds only?
- **Primary metric**: seasoned conversion = (forming seeds where the 6th lead link seasons) / (forming seeds), identical seeds, with-layer vs without-layer.
- **GO** (fixed post-pre-screen): armed conversion ≥ pre-screen baseline (2/5) + 1 + noise floor, with the s55 near-miss converted. Noise floor from A/A (baseline re-run on the forming subset).
- **KILL-AT-SCREENING**: <4 forming seeds on the 16-seed baseline screen → under-powered, KILL at screening.
- **Guardrails**: exiled / national / wave-5 not regressed vs the identical-seed baseline side (per-seed, not median). Median survival REPORT-ONLY (sharepol noise-floor finding; det-gate fails on 2/8 seeds — see below).
- **Horizon**: 180d death-aware (6th links form d80+, seasoning needs 30d).
- **Seeds**: screening 11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808 × leadcourt(+FOURTHLINK+FIFTHLINK) baseline. Conversion on the forming subset × (baseline vs +SIXTHLINK).
- **Policies**: baseline `fifthlink-r26` (FOURTHLINK=1 FIFTHLINK=1) vs `sixthlink-r27` (+SIXTHLINK=1). Policy-side only.
- **Proof**: `scripts/test-sixthlink-r27-20261014.js` — REAL RED phase (gate-off: racing 6th never tended, trust 35→34, season closes; thin elder eats the scarce tend) → GREEN (priority tends the 6th first, trust 35→50, seasons; no double-tend; comfortable 6th skipped; deadline ordering). 18/18.

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run.

## Determinism gate (mandated step 2 — FAILED, handled per #125)

`scripts/det-gate-sixthlink-r27-20261014.js` on the baseline stack (FOURTHLINK=1 FIFTHLINK=1): 6/8 IDENTICAL, **s11 and s22 DIVERGED** (moving divergence day per run pair — wall-clock signature). The r26 contest fix holds (leadfeast s44 still GREEN).

**Diagnosed and fixed (same bug class as r26)**: three more state-changing sites hashed the villager ID string (IDs embed Date.now(), membership.js): `traderKnowledge` (game.js — trader plant pools), `showResolveVillager` (contests.js — villager contest fates), `convoFavorHash` (convo-wants.js — favor slots). Fix: `Game.stablePersonKey(vid)` — the villager's index in `data.villagers` (append-only, deterministic creation order per seed). No RNG consumed, no feel/combat/UI change. Proof `scripts/test-detfix-idhash-20261014.js` 8/8 (IDs differ across runs, keys/pools/fates/favor-hashes identical). Ontology 94/94. Committed as 7c7e06b6 (own commit, pending coordinator landing).

**Residual**: timestamp IDs (`app_`/`vis_`/`link_`/`f` + Date.now()) still enter state (applicant day 4, visitor day 12, link day 32) and some unidentified consumer causes probabilistic divergence — det-gate still fails 2/8 seeds per run (which seeds varies; s22 flipped to PASS after the fix, s44 flipped to FAIL on one pair). Before/after on any single seed carries this noise. Mitigation per #125: A/A calibration (below) + report-only medians + per-seed guardrails. The full hunt is documented here; the consumer remains unidentified — a future entropy arm should finish it.

## The layer (scripts/policies/sixthlink-r27.js — DELETED per kill protocol)

`sixthlinkPriority(Game, ctx)`, run between `fourthlink.daily` and `fifthlinkLayer` in the same 13500–20000 lower-gate band (never spending below 12000 — the #130 feeding-weight honesty):
- 6th+ lead links (formation-order index ≥ 5), active, primary-Haven.
- Racing filter: trust < 45 AND NOT (age ≥ 30 AND trust ≥ 40) — unseasoned bonds whose season is closing. (A 6th at trust 32–39 with full tributes is NOT "thin" by linkIsThin, so the fifthlink layer skips it exactly when it needs tending most.)
- Order: earliest seasoning deadline first, then largest trust deficit.
- `tendedWeek` dedups against both passes — no double-tend. 1st–5th links keep exact fifthlink behavior.

## Pre-screen (baseline, FOURTHLINK=1 FIFTHLINK=1 — 16 seeds, 100s, 16/16 ok)

6th lead link formed on **5/16** seeds — no kill at screening (≥4):

| seed | d | 6th formed | 6th seasoned | t30 | tw | endStanding | wave5 |
|---|---|---|---|---|---|---|---|
| 11 | 137 | d65 | **s94** | 48 | 19 | 245 | d94 |
| 44 | 124 | d56 | **s85** | 68 | 25 | 204 | d85 |
| 55 | 126 | d81 | — | 35 | 3 | 186 | d93 |
| 606 | 105 | d100 | — | null | 0 | 136 | — |
| 808 | 89 | d69 | — | null | 4 | 170 | — |

Non-forming: s22 (5 links), s33/s66/s77/s88/s101/s202/s303/s404/s505/s707 (≤5 links or dead early).

**Baseline conversion: 2/5** (s11, s44). The near-miss: **s55** (t30:35, 5 short; tw:3 in 45 days while elders held tw:15–24). s606/s808: village died before the 6th hit age 30 (d105/d89) — unconvertible by tending (the #130 trap: formation without feeding).

Screening wall numbers: national 8/16, wave4 12/16, wave5 3/16 (s11, s44, s55), table 0, won 0, maxStanding 245, median survival 118d.

## A/A calibration (baseline re-run, forming subset 11/44/55/606/808)

**2/5** (s11, s44) — identical to the pre-screen. **Noise floor = 0** on the conversion count. (Trajectories shift between runs — s606's 6th formed d100 vs d113 — but the conversion outcome is stable.)

## Conversion (forming subset × baseline vs armed, identical seeds)

| seed | base 6th | armed 6th | base→armed Standing | w5 |
|---|---|---|---|---|
| 11 | d65→s94 (t30:48, tw:20) | d65→s94 (t30:69, tw:19) | 245→263 | d94→d94 |
| 44 | d56→s85 (t30:68, tw:25) | d56→s85 (t30:68, tw:18) | 204→204 | d85→d85 |
| 55 | d81→x (t30:35, tw:3) | d81→x (t30:35, tw:3) | 186→186 | d93→d93 |
| 606 | d100→x (t30:null, tw:0) | — (no 6th formed, leadN=4) | 136→136 | —→— |
| 808 | d69→x (t30:null, tw:4) | d69→x (t30:null, tw:4) | 170→170 | —→— |

- **PRIMARY: baseline 2/5, armed 2/5. Delta = 0. GO (≥3/5 with s55 converted) MISSED.**
- The priority FIRED (s55 diagnostic: 3 priority tends, ctx.sixthTended=3) but changed nothing: s55's 6th ended t30:35, tw:3 — byte-identical to baseline.
- s606 didn't form a 6th in the armed run (residual nondeterminism — formation timing shifted, village died d108 with 4 links).

Guardrails (per-seed, identical seeds):
- national: 0/5 both (forming subset never reached national). ✓
- exiled: 0 both. ✓
- wave-5: 3/5 both (s11, s44, s55) — no regressions. ✓
- survival per-seed: s11 165→137, s44 124→119, s55 126→126, s606 105→108, s808 89→89. Median REPORT-ONLY: 124→119d (−5, within the fight-heavy noise floor; same endReasons).

## Why the layer didn't convert s55 (the diagnosis)

Instrumented s55 armed run (126 days):
- Pantry in the 13500–20000 band: **7/126 days**. Below 13500: 42 days. Above 20000: 77 days.
- The 6th was racing-and-untended on **37 days** — but the pantry was in-band on only ~3–4 of the post-formation days.
- The priority fired on every eligible day (3 tends). It worked as designed.

**The bind is pantry-level, not ordering-level.** The 6th link doesn't starve because elders eat first in the band — it starves because the band is empty: a 6-bond village's pantry is either >20000 (base tends everything) or <13500 (nothing tends), passing through the 13500–20000 window only 7 days in 126. Reordering tends within a 7-day window cannot win a 45-day race. The village genuinely cannot afford 6 tended bonds on s55's economy — this is sim-findings #130 (FORMATION WITHOUT FEEDING IS DECORATION) manifesting as a measured NO-GO: the 6th link is a bond the village can't feed, and no tend-ordering lever fixes that.

The s55 6th's ledger: formed d81 at trust 30; Ashford's fields empty (tribute nothing, −2/week); Haven fed it 3 times (+24) and answered its grief twice (+13), but the structural deficit (empty fields, 6-bond overhead) held it at t30:35. A tend layer cannot fix a subordinate that can't feed itself.

## SENSE-TESTING (armed s55, 6th link history — Ashford, formed d80)

The bond's story reads as village triage, not grind:
- d84: "Ashford paid nothing — empty fields. Arrears +4,000."
- d85: "Haven sent grain (1,980 kcal, trust +8); the bond is fed."
- d90: "Met grief with grain (1,980 kcal, trust +8); the tribute leverage never landed."
- d91: "Haven's speaker rode out for two days (trust +5)" — the pantry couldn't carry a gift, so the speaker went herself.
- d98–d119: "paid nothing — empty fields" (×4) — the shortfall said aloud with the reason, never as defiance.
- d104/d106: "Haven sent grain (2,813 / 2,110 kcal, trust +8); the bond is fed."
- d126: "Ashford paid. The pantry grows." — one full tribute, the day the village died.

Every trust move has a named cause. Haven noticed Ashford starving and fed it three times plus two grief answers — and it still wasn't enough. The mechanism is honest; the outcome is the #130 trap. **Sense-testing: PASS** (the layer reads as a village decision). **Conversion: NO-GO** (the decision can't beat the economy).

## Village assessment

The 6-link villages are the rich and the dying. s11/s44 (standing 204–263, wave-5) season their 6th bonds unaided — the tend-vs-decay race is already won on pantry-rich trajectories, just as the 5th-link race was. s55 (standing 186, wave-5 via 5 bonds + feast) forms a 6th it cannot feed: Ashford's fields are empty from birth, Haven subsidizes it for 46 days, and the bond dies at trust 23 with the village. s606/s808 form 6ths the village doesn't live to season. The diplomacy road's 6th link is not a tending problem — it's an economy problem: **can the village afford six bonds?** On current tip, usually not. The next arm on this road should work the 6-bond food economy (tribute reliability, subordinate field productivity, the cost of tending at scale), not tend ordering.

## Blanks filled / documented

- **FILLED**: the 6th-link race re-measured on current tip — 5/16 form, 2/5 season unaided (s11, s44). The tend-priority mechanism PROVED in unit (18/18 RED→GREEN) but measured NO-GO at scale: pantry in-band only 7/126 days on the near-miss seed.
- **FILLED (infrastructure)**: three more timestamp-ID hash sites fixed (stablePersonKey, commit 7c7e06b6) — trader pools, contest TV-appeal, favor slots now deterministic across runs. Residual applicant/visitor/link ID nondeterminism documented for the next entropy arm.
- **DOCUMENTED** (sim-findings.md): (1) s55's 6th — the #130 trap measured end to end (46 days of subsidy, bond dies at trust 23, village dies d126). (2) The 6-bond economy is the next lever, not tend ordering. (3) det-gate still fails 2/8 seeds/run (probabilistic) — the timestamp-ID consumer hunt continues.

## Metric review (§14)

GO missed: armed 2/5 vs baseline 2/5 (delta 0 < required +1). No re-scoring — the miss stands. The pre-registration's forming-seeds denominator worked (the question got a clean answer). The A/A calibration (2/5 twice, noise floor 0) means the miss is real, not noise. 

For the NEXT run on this road: the metric should be pantry-conditioned — "on seeds where the 6th forms AND the village's pantry spends ≥20 days in the tendable band, does priority convert?" — or the arm should target the 6-bond economy directly (tribute reliability / subordinate productivity), where the bind actually lives.

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv* |
|---|---|---|---|---|---|---|---|
| screen baseline (16) | 8/16 | 0/16 | 0/16 | 12/16 | 3/16 | 245 | 118d |
| A/A baseline (5 forming) | 0/5 | 0/5 | 0/5 | 5/5 | 3/5 | 245 | 124d |
| armed (5 forming) | 0/5 | 0/5 | 0/5 | 5/5 | 3/5 | 263 | 119d |

\* median REPORT-ONLY per pre-registration (sharepol noise-floor finding; det-gate fails 2/8).

## Verdict: NO-GO — layer killed, no trace in the policy stack

Per kill protocol: `scripts/policies/sixthlink-r27.js` deleted. Committed: evidence (this file + 3 JSONs), proof test, sweep, det-gate script, detfix. The detfix (7c7e06b6) is a separate landed commit.
