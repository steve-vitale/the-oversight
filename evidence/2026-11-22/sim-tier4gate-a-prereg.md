# sim-tier4gate-a — PREREG (frozen)

**Arm:** sim-tier4gate-a · **Loop A run:** fleshout-20261122T0215Z (arm 1 of 3)
**Axis:** scale-onramp · **Type:** LEVER — tier-4 GATE widening (earlier apex)
**Finding:** #2648 (the tier-4 gate is the next wall after the tier-4 pool GO)
**Base master:** worktree HEAD `4266e6cce` (rebased from brief-named base
`0ea9789d7` onto the current master tip before any lever work; the upstream
commit is sim-doorflee2-b, which touched `src/js/game.js` ~21434 (ally cap)
and `src/js/fieldFights.js` — far from this arm's `contests.js` lever site;
proofs re-run after the rebase)
**Branch:** `sim-tier4gate-a`
**Frozen:** 2026-11-22 ~02:30 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief + tier4pool evidence)

sim-tier4pool-a (GO, evidence/2026-11-21/sim-tier4pool-a.md) fixed the
tier-4 POOL: tier-4 rolls now pay the gun 47.6% (20/42) on the arm vs
28.2% (11/39) on ctl, grants doubled 11 → 20. But tier-4 rolls are only
42/278 (15.1%) of prize rolls — the lever cannot pay guns on rolls that
never reach tier 4, and the thin-gate bucket still holds villages. Finding
**#2648** stands: a 25%+ band tier-4 rate needs wider eligibility (more
extreme contests, or an earlier apex). This arm tests the EARLIER-APEX
knob: wave-3 extreme contests become apex-eligible.

## 2. DIAG — the gate, quantified from the tier4pool corpora (measured, not assumed)

Analyzer `scripts/analyze-tier4gate-diag-a.js` (`--selftest` 19/19) run
over the tier4pool corpora (12 seeds each, band 107271–107282;
`evidence/2026-11-22/tier4gate-a-diag-ctl.json` /
`tier4gate-a-diag-arm.json`). The exact gate rule, read from code
(`contests.js` `_cxItemPrize:201-212`):

```
tier = max(min(3, wave), broadcastRewardTier(who))   // caps at 3
apex = wave >= 4 || wins >= 8 || favor >= 100
if (contest.risk === 'extreme' && apex && Math.random() < 0.25) tier = 4
```

`broadcastRewardTier` caps at 3, so tier 4 reaches `rollAlienLoot` ONLY
via that line. Canon (docs/CONTESTS.md:206, "Release restoration"):
"Extreme contests have an earned apex opportunity; ordinary wins cap at
tier3." The `apexChance` / `apexWins` / `apexFavor` values (0.25 / 8 /
100) come from `src/data/reward-economy.json` broadcast. The contest
catalog (`src/data/contests.json`) holds 44 contests: 6 extreme
(gauntlet, hide, tithe, siege, maw, price), 18 high, 15 medium, 5 low.

Measured gate (ctl leg, 261 prize rolls; arm leg agrees in shape, 278 rolls):

| Gate stage | Ctl | Arm |
|---|---|---|
| Prize rolls | 261 | 278 |
| Apex-eligible (extreme + apex) | 163 (62.5%) | 183 (65.8%) |
| Eligible tier-4 rate (the 25% lottery) | 39/163 = 23.9% | 42/183 = 23.0% |
| **Tier-4 rolls (band rate)** | **39 (14.9%)** | **42 (15.1%)** |
| Tier-4 rolls NOT apex-eligible (other path?) | 0 | 0 |
| Non-extreme rolls | 88 (33.7%) | 85 (30.6%) |
| Extreme but not apex (wave < 4, wins < 8, favor < 100) | 10 (3.8%) | 10 (3.6%) |
| — of which wave-3 extreme (earlier-apex increment) | 5 | 5 |
| High-risk apex-eligible (more-extreme increment) | 0 | 0 |

Three findings that reframe the brief's premise:

1. **Eligibility is NOT the minority.** 62.5% of prize rolls are
   apex-eligible — the tier4access prereg's "only a minority of prize
   rolls are apex-eligible" is refuted on this band. The binding half of
   the gate is the **25% apex lottery**, not eligibility: 62.5% × 25% ≈
   15%.
2. **The two widening increments are tiny.** Earlier apex adds 5 rolls
   per 261 (1.9%); "more contests counted extreme" adds **zero** — no
   high-risk prize roll is ever apex-eligible on this band, because the
   risk mix shifts with wave: high-risk contests fire only at waves 2–3
   (high@w2: 6, high@w3: 36, high@w4+: 0), while wave-4+ rolls are
   extreme (163) or low (19). Counting high as extreme for the apex roll
   would open nothing.
3. **The wins/favor apex paths are dead in live play.** Every eligible
   roll qualifies via wave ≥ 4 (apexCond.wave = 163 = eligible total);
   wins ≥ 8 occurred on 62 rolls but never independently qualified one
   (0 wave-3-extreme rolls had wins ≥ 8; 0 high-risk rolls were
   apex-eligible); favor never reaches 100 (max 71 vs the 100 bar).
   The "earned apex" in live play is wave ≥ 4, nothing else.

**Static prior (frozen, honest):** earlier apex widens the eligible set
163 → 168 per 261 rolls; at the 25% lottery the band tier-4 rate moves
15.6% → **16.1%** (arm-shape 16.5% → 16.9%). That is BELOW the frozen
bar 1 (≥ 25% absolute, ≥ 1.5× ctl). The diag says this lever is
expected to NO-GO. The pilot is the measurement that confirms or
refutes the prior — the staged methodology exists for exactly this: a
cheap pilot kills a lever the static prior already doubts, and the
measured NO-GO, if it lands, kills the "wider eligibility" hypothesis
with numbers and re-points the next arm at the lottery itself (for
reference only, NOT this arm: earlier apex + apexChance 0.50 would
predict ~32%; the lottery knob is not tested here — it changes the
"earned" feel of the apex and is a design call for the next round).

## 3. Code-read priors (frozen mechanism — hypotheses to confirm, not conclusions)

- **`_cxItemPrize`** (contests.js:201-212) is the ONLY
  `rewardSource: 'contest'` caller of `rollAlienLoot`. A change to the
  apex condition there reaches only contest prizes; kill-loot and trade
  paths never see it.
- **The apex condition is one boolean** (`wave >= 4 || wins >= apexWins
  || favor >= apexFavor`); the wave bar is the only term that ever
  qualifies a roll on this band (§2 finding 3). Lowering it to 3 opens
  exactly the 5 wave-3-extreme rolls per band the diag counted.
- **No extra RNG draws.** The lever changes a comparison, not a roll:
  the 25% lottery roll happens once per extreme contest either way, so
  the RNG stream should diverge minimally (the tier-4 outcome on the 5
  newly-eligible rolls is the only new draw consumption — the same
  lottery roll, now reachable). Wave reach / deaths should track ctl
  except for prize-driven trajectory noise, as tier4pool §6 did.
- **The lever cannot change the pay rate.** It adds tier-4 rolls, not
  pool weight: the new tier-4 rolls draw from the same GUNRATE-weighted
  tier-4 pool (22.2% design) as every other tier-4 roll. Bar 2 is a
  no-collapse floor, not an improvement bar.

## 4. The lever (frozen design — TIER4GATE)

Env-gated: `TIER4GATE=1` (node sims only; in the browser `process` is
undefined, so the lever is off — same pattern as GUNRATE / TIER4POOL).
All of it lives in **`_cxItemPrize`** (contests.js), on the apex line.
No other game file is touched.

- **Conditions:** `TIER4GATE=1` and the contest is extreme-risk (the
  existing `contest.risk === 'extreme'` gate is untouched).
- **Effect:** the apex wave bar drops from 4 to 3: `apex = wave >= 3 ||
  wins >= apexWins || favor >= apexFavor`. Wave-3 extreme contests
  become apex-eligible and can roll tier 4 at the existing 25%
  `apexChance`. Nothing else changes: no new draw, no chance change, no
  pool change, no bundle change.
- **Observability:** no new transient diagnostic is needed — the driver
  already records `risk` / `wave` / `wins` / `favor` per prize roll and
  `tier` per loot roll, so the lever's effect (wave-3 extreme rolls
  reaching tier 4) is directly visible in the existing fields. The
  analyzer's gate-diag join (roll → prize by seq) attributes each
  tier-4 roll to its eligibility.
- **Default OFF.** If GO, the lever stays env-gated OFF; a default flip
  is a Steve/design call. If NO-GO, the game code is reverted before
  commit; the instrument + evidence stay.

## 5. Band freshness (local_seed_band_freshness skill)

- **Band: 107297–107308 (12 seeds, fresh).** Grepped every
  `evidence/*/sim-*-prereg.md` for the standalone tokens `107297`–
  `107308`: zero hits each. Neighbouring used bands avoided:
  107271–107282 (tier4pool), 107281–107296 (killlootfixture-a),
  107251–107258 (tier4access), 107241–107248 (shelterdraft),
  107211–107236 (m1range), 107191–107198 (draftmiss), 107161–107168,
  107141–107148, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058, 107021–107028, 106751–106766,
  107221–107228 (forbidden bands from prior briefs). The band is fresh
  by the skill's rule (a named band is used; this one is named nowhere
  as a seed band).

## 6. Instrument (frozen design)

Cloned from the proven tier4pool instrument (same schema, renamed):
- `scripts/tier4gate-driver-a.js` — tier4pool driver pattern (wraps +
  daily gun census + wall fields). Differences: `MODE=ctl|arm`;
  requires `TIER4GATE=1` on arm, forbids it on ctl; requires the
  TIER4GATE code present in contests.js; records `tier4gateOn` /
  `tier4gatePresent`; same prize/roll/grant wraps (risk/wave/wins/favor
  per prize roll, tier per loot roll). Evidence dir `2026-11-22`.
- `scripts/analyze-tier4gate-a.js` — tier4pool analyzer + re-barred
  judging (bar 1 = tier-4 RATE, bar 2 = pay-rate floor) + frozen-bar
  verdict (GO / NO-GO); `--selftest` green before pilot. Reports the
  per-seed funnel, the zero-grant split, gun arrivals, and the gate-diag
  join (tier-4 rolls by eligibility).
- `scripts/analyze-tier4gate-diag-a.js` — the §2 diag analyzer (already
  run on the tier4pool corpora; selftest 19/19).
- `scripts/test-tier4gate-a.js` — proof test: lever unit cases via the
  live harness (off without env; on + wave-3 extreme + lottery won →
  tier 4; on + wave-3 extreme + lottery lost → tier ≤ 3; off + wave-3
  extreme → never tier 4; wave-2 extreme never tier 4 either way;
  non-extreme wave-3 never tier 4; wave-4 extreme behavior unchanged
  by the lever; no state pollution). GREEN before pilot.
- `scripts/build-tier4gate-panels-a.js` — panel builder (tier4pool
  builder pattern): before = ctl corpora, after = arm corpora, same
  seeds → `scripts/balance-panel.js compare` (§15).

## 7. Frozen bars (judge: the analyzer on the band, ctl vs arm)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Primary — tier-4 RATE** — tier-4 contest-prize rolls per prize roll, arm vs ctl on identical seeds | arm tier-4 rate ≥ 25% absolute AND arm ≥ 1.5× ctl (ctl baseline ~15%) |
| 2 | **Secondary — pay rate must not collapse** — searcaster results per tier-4 contest roll, arm vs ctl | arm pay rate ≥ ctl pay rate × 0.8 (GUNRATE design 22.2%) |
| 3 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every contest prize roll carries tier + effective tier + result; 100% of `_cxItemPrize` calls joined to a `rollAlienLoot` row | all must hold |
| 4 | **Coverage / attribution** — 100% of searcaster grants attributed; 0 unclassified sources; 0 ungranted searcaster rolls | all must hold |
| 5 | **Guardrails (scalemetric cost bar)** — total starvation deaths arm ≤ ctl + 2; starvation deaths on arm-leg village-lost seeds whose ctl twin survived ("arm-only deaths") ≤ 2; median survival arm ≥ 0.8× ctl median; wins/national not regressed (both expected 0) | all must hold |
| 6 | **Answer quantified** — per-seed table + funnel (both legs) + zero-grant split + gun arrivals (contest + kill-loot) + gate-diag join + sense read | all must hold |

GO = bars 1–6 all pass on the judged band. A miss on bar 1 or 2 is
NO-GO: revert the game code before commit, keep instrument + evidence
(§14 — never re-scored against a friendlier metric mid-run). The
guardrail reading of "arm-only deaths" is frozen here as starvation
deaths on seeds where the arm leg lost the village but the identical-seed
ctl leg survived (the analyzer computes it per-seed).

## 8. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107297**
  (first band seed), arm leg only, gate: joins 100% + 0 instrument
  errors + ≥ 1 `_cxItemPrize` roll observed + ≥ 1 wave-3-extreme
  prize roll in the corpus (the lever's population exists on the band).
  Discarded after the gate (regenerated by the pilot arm leg).
- **Pilot (judged):** first 8 seeds, **107297–107304**, horizon 150d
  death-aware, competent verbatim policy (`scripts/policies/competent.js`).
  Two legs on identical seeds: **ctl** (`TIER4GATE` unset) and **arm**
  (`TIER4GATE=1`). The pilot verdict is judged on the 8-seed pilot: a
  NO-GO there ends the run with no confirm spend (tier4access
  precedent). A pilot GO triggers the confirm.
- **Confirm (judged, only on pilot GO):** remaining 4 seeds,
  **107305–107308**, both legs, same horizon/policy/env. The frozen
  verdict is then judged on the full 12-seed band (bars 1–6).
- **Substrate env (both legs, identical except TIER4GATE):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset; `PRESENCE`
  unset; `TIER4POOL` unset (the pool lever is a separate arm's knob —
  this arm measures the gate alone).
- **Wall numbers** recorded per leg: national / table / wins, wave 4–5
  unlocks, median survival.
- **Canon:** docs/CONTESTS.md (prize table, tier-4 gate — "Extreme
  contests have an earned apex opportunity; ordinary wins cap at
  tier3"); no canon doc covers the searcaster grant rules; rules are
  cited from code + data (see §2). Said here rather than inventing canon.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
