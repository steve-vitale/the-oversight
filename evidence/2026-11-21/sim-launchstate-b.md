# sim-launchstate-b — per-part holder-state recorder (DIAG-NO-GO)

- **Arm:** sim-launchstate-b, Loop B run `fleshout-loop-b-20261122T0130Z`, arm 2 of 2
- **Axis:** winnability chain. **Base:** master `a0a2bf26d` (merge-base first 12 `a0a2bf26dbfa`)
- **Band:** 107301–107308 (fresh; verified by full `evidence/*/sim-*-prereg.md` grep + forbidden-band search, zero hits)
- **Substrate:** competent verbatim, policy sha `1884c8852d38`; flags `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`; 150d death-aware, MODE vre. `allyslot3InSrc: false` (the lever is not in `src/js` on this base).
- **Instrument only:** `scripts/` + `evidence/` only. No `src/js` change. The launch-engine lever (trusted villager at Haven as a wave-4+ companion) is NOT built here — it lives in `villager-brain.js`/`win-plan.js` and is blocked on the held `sim-pinquaddoor-b` branch.
- **Prereg:** `evidence/2026-11-21/sim-launchstate-b-prereg.md` (frozen before any judged sim; AMENDMENT 1 + CORRECTION 2026-11-22 appended, frozen body untouched).
- **Corpora:** `evidence/2026-11-21/perseed-launchstate-b-107301-107308/` (8 files). Legs log: `evidence/2026-11-21/launchstate-b-legs.log`. Analysis: `evidence/2026-11-21/launchstate-b-analysis.json`.
- **Proof:** `node scripts/test-launchstate-b.js` **43 passed, 0 failed** (after the CORRECTION re-run; first run 40/3 caught the 9-char anchor literal — see prereg CORRECTION). Analyzer selftest 66/66 green.

## Verdict: DIAG-NO-GO (completeness)

Frozen bar (a) required **0 unknown across all instance-days (B′ + H) AND 0 unexplained parts in the Leg S ledger**. The day-level half passes outright; the per-part half misses by 2 parts:

| Clause | Result |
|---|---|
| (a) completeness — day-level unknown (B′ + H) | **PASS** — B′ unknown = 0; the 4 B-unknown days are all explained by Taxonomy H (3 `hs-gate-pick`, 1 `hs-scholar-idle`), 0 skipped |
| (a) completeness — Leg S unexplained parts | **FAIL** — **2 unexplained parts** of 324 (`no-rows`), both seed 107305 day 150 part 3 |
| (b) Leg R reproduces the 10 launcheng unknown days exactly | **PASS** — exact, 10/10 |
| (c) instrument validity | **PASS** — 8/8 files, 0 instrument errors, substrate clean on all 8, 13,277 holder-state rows, 236 gate rows |

The instrument closed the day-level gap it was built to close: the 10 launcheng unknown days reproduce exactly, and on the fresh band every B-unknown day now has a named mechanism with a trace. What remains is per-part only — two parts on one seed, one day, with a named gap (below). A miss is a miss: **DIAG-NO-GO, not re-scored.**

## The 2 unexplained parts — the precise gap

Both are seed **107305, day 150, part 3** — the last part of the last day:

- `devon_okafor`, target `reunion` (plan seeded d142)
- `benoit_lambert`, target `eulogy` (plan seeded d143)

What the recorder shows for each on d150: holder-state rows at parts 0, 1, 2 (HAVEN_CHORE / idle), a `dawnbidScores` row (devon at p1, benoit at p2), a `v4encounters` row on d150 with outcome `vFlee` — and **no row at part 3**. Seed 107302 proves part 3 of day 150 is sampled on other seeds (9 holder-state rows at d150 p3), so this is **not** a horizon artifact. The deduction: each holder was at Haven for parts 0–2, then a wave-4 field encounter consumed part 3 (they fled), and the recorder — which samples inside `objTick` at Haven — never fires for that part.

**The gap, named:** the Leg S ledger has **no per-part `field-encounter` fallback**. The day-level taxonomy has `field-encounter-day` (it explains 1 zero-row day on this band), but per-part, a holder whose part is consumed by a wave-4 field encounter leaves no holder-state row and no fallback names it. Next instrument step: a per-part encounter fallback reading `v4encounters` rows for the day (the encounter rows carry no part field, so attribution is day-match + Haven-rows-absent for that part, as here).

## What the band shows

- **Instances opened: 19** — launched 9, target-killed 1, plan-churned-before-dawn 4, candidate-not-bid 5, unknown 0. Funnel: launched-killed 0, launched-fought-no-kill 6, launched-no-meeting 3.
- **Instance-days 43; assessed days 27** (dawn 16, midday-only 11); assessed rows 28 (midday rows 12); zero-row days 16. Zero-row reasons: seed-day 5, holder-away 2, unknown-no-signal 4 (all H-explained), field-encounter-day 1, holder-scholar 4. Churn zero-row reasons: holder-off-haven 29, seed-day 2, holder-away 2, plan-not-in-census 1, holder-dead 2.
- **Leg S ledger: 324 parts** — scored 30, explained 292, unexplained 2. whyNot: away 144, chore-live 69, scored 30, seed-day 21, scholar 20, gate-pick 16, refresh-blocked 11, dead 5, plan-deleted 4, retargeted 2, no-rows 2.
- **Binding gate (reported, not gating): party-no-companion on 27/27 assessed days.** The launch engine still denies every launch for want of a companion — the lever remains unbuilt. Mechanism: DENIED.
- **Pool:** eligible pool size 0 on all 16 pool snapshots; first-fail reasons selfOrScholar 32, notRanger 53, away 25, eligible 0. Nobody was ever eligible to stand as companion.
- **Launches (legacy sanity, reported):** counted 16, wave-4-target 50, uncounted 34, noStartCall 0, noCopyLink 0, firstFights 8.

### Per-seed

| Seed | Days | End | Max wave | Standing | Holder-state rows | Notes |
|---|---|---|---|---|---|---|
| 107301 | 139 | village-lost | 5 | 375 | 643 | 19 gate picks, 23 seed rows |
| 107302 | 150 | survived | 5 | 600 | 7,858 | launch-rich: 331 pool rows, 138 gate picks, 29 seeds |
| 107303 | 102 | village-lost | 4 | 199 | 610 | 1 gate pick |
| 107304 | 150 | survived | 5 | 200 | 0 | **no wave-4 plan ever seeded** (0 v4seeds) — a real absence, recorded correctly |
| 107305 | 150 | survived | 4 | 199 | 543 | 99 departs, 25 encounters; holds the 2 unexplained parts |
| 107306 | 139 | village-lost | 5 | 275 | 2,073 | 45 gate picks |
| 107307 | 67 | village-lost | 4 | 150 | 460 | earliest loss |
| 107308 | 103 | village-lost | 4 | 199 | 1,090 | 12 gate picks |

### Scale wall (reported every run)

Wins 0/8, national 0/8 (national standing 4), table 0/8, wave 4 unlocked 8/8, wave 5 unlocked 4/8, median survival 137 days, survived 3/8, deaths 608, starvation deaths 1, standing-199 stall 3/8. In plain words: every village reaches wave 4, half reach wave 5, none wins, none reaches national standing — the same wall as the launcheng band, and the launch gate (no companion) is still the binding denial on every assessed day.

Telemetry check: `node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'perseed-launchstate-b-107301-107308/*.json' --metrics wins,national,table,wave4,wave5 --sweep-rows` → **exit 2, the designed recorder-corpus refusal** ("recorder corpora are compared with sweep-compare tables, never against a run baseline here").

## Sense-test: holder-days read as a person would

**1. Scored day — 107305 `devon_okafor`, `reunion`, day 150.** Devon holds a wave-4 `reunion` plan (seeded day 142). On day 150 he starts the day doing Haven chores, is scored for the launch at part 1 (the engine considers him and says no — no companion), does chores again, idles, and then meets the wave-4 monster in the field and flees. The recorder's story — chores, one scored look, a fled encounter — matches the sim's rows exactly. Only the last part of the day is blank, and the flee explains it.

**2. Skipped day — 107308 `naran_tumen`, `eulogy`, day 99 (hs-scholar-idle).** The holder is the scholar. All four parts read `idle / done`, committed day 98 — he sits idle the entire day, never scores, never picks a gate. The recorder says: a scholar holding a wave-4 plan does nothing with it all day. That matches the code (the scholar is skipped first in `objTick`), and Taxonomy H now names it instead of leaving it unknown — this is the poolfirstfail `hs-unexplained` scholar-idle class, closed.

**3. Skipped day — 107307 `app_mgpsphvh895`, `eater`, day 52 (hs-gate-pick).** The holder's gates read EAT/hunger at parts 0, 2, and 3 — he stops to eat three times instead of scoring the launch. A person reading this sees a hungry villager choosing food over the hunt, three times in one day. The recorder's story matches the gate rows exactly.

## Metric review

Judged only against the frozen bar. Completeness fails on the Leg S clause (2 unexplained parts, both 107305 d150 p3, mechanism named: per-part field-encounter fallback missing). Reproduction passes (10/10 exact). Instrument passes (proof 43/43, selftest 66/66, 8/8 files, 0 errors, substrate clean). Legacy day-level completeness passes (unknown 0) and is reported, not gating. **Verdict: DIAG-NO-GO.** The next instrument step is a per-part `field-encounter` fallback; the launch-engine lever itself stays blocked on the held `sim-pinquaddoor-b` branch.

## Blanks filled / documented

- The 4 new-band B-unknown days are all explained (H), with traces — no unknown days remain at day level.
- The 2 Leg S unexplained parts are documented with the exact mechanism gap, not left as a bare count.
- Seed 107304's zero holder-state rows are a genuine absence (no wave-4 plan seeded in 150 days), not an instrument failure.
- The anchor-literal error found by the proof run is corrected in the prereg CORRECTION (2026-11-22) and in the driver/analyzer/test; the base commit is unchanged.
