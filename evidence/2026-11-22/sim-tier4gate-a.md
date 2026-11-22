# sim-tier4gate-a — TIER-4 GATE widening (earlier apex)

- Arm: sim-tier4gate-a (LEVER), Loop A run fleshout-20261122T0215Z, arm 1 of 3.
- Base: worktree HEAD `0ea9789d7` at cut; rebased onto master tip
  `4266e6cce` before any lever work (upstream: sim-doorflee2-b, which
  touched `src/js/game.js` ~21434 and `src/js/fieldFights.js` — far from
  this arm's `contests.js` lever site; proofs re-run after the rebase).
- Branch: `sim-tier4gate-a`.
- Prereg: `evidence/2026-11-22/sim-tier4gate-a-prereg.md` (committed
  `f46b00284`, frozen ~02:30 UTC 2026-11-22, before any judged sim).
- Instrument commit: `f46b00284` (lever + instrument + prereg; proof test
  18/18, analyzer selftest 30/30, diag selftest 19/19).
- **Lever commit `f46b00284` is REVERTED at the tip** (see §8): the game
  code is back to `4266e6cce` byte-identical (`git diff 4266e6cce --
  src/js/contests.js` is empty), and the lever-coupled driver + proof
  test are deleted from the tip (they live in history under `f46b00284`
  for a revival). The analyzer, diag analyzer, and panel builder stay —
  they work on the recorded corpora with no lever dependency.

## Verdict: NO-GO (pilot, 8 seeds — no confirm spend)

**Earlier apex moves nothing.** On the frozen 8-seed pilot band
(107297–107304, 150d death-aware, competent verbatim, substrate
GUNRATE=1 + CELLGATE=1 + the standard levers), tier-4 rolls went
30/167 (18.0%) on ctl to 34/186 (18.3%) on arm — ratio 1.02×, against
the frozen bar (≥ 25% absolute AND ≥ 1.5× ctl). The pay rate held
(23.5% vs 23.3%, bar 2 passes) and the guardrails are clean, but the
primary misses by a wide margin, exactly as the prereg's static prior
said it would (16.1% predicted; measured 18.3% on a band whose ctl ran
a little hot at 18.0%). Per the prereg's run plan, a pilot NO-GO ends
the run with no confirm spend (tier4access precedent). The game code is
reverted; the measurement stands.

The diag (§1) is the durable result: the gate's binding half is the
25% apex lottery on a 62–74% eligible base, not eligibility — earlier
apex opened exactly **2 prize rolls on the whole pilot**, one of which
paid a fusion_cell. Wider eligibility cannot reach 25% because there is
almost no eligibility left to widen.

## Frozen-bar table (prereg §7, judged on the 8-seed pilot)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Primary — tier-4 RATE (tier-4 rolls / prize rolls, arm vs ctl) | arm ≥ 25% AND arm ≥ 1.5× ctl | ctl 18.0% (30/167), arm 18.3% (34/186), ratio 1.02× | ❌ |
| 2. Secondary — pay rate must not collapse (searcaster results / tier-4 rolls) | arm pay ≥ ctl pay × 0.8 | ctl 23.3% (7/30), arm 23.5% (8/34), ratio 1.01× | ✅ |
| 3. Instrument validity (proof test + selftests + 0 errors + every roll carries tier + effTier + result; 100% joins) | all must hold | proof test 18/18; analyzer selftest 30/30; diag selftest 19/19; instrumentErrors 0 both legs; rolls without tier/effTier 0; unjoined 0 | ✅ |
| 4. Coverage / attribution (100% joins; 100% grants attributed; 0 unclassified) | all must hold | unjoined 0, unattributed 0, ungranted sear rolls 0, both legs | ✅ |
| 5. Guardrails (starvation arm ≤ ctl+2 totals; arm-only starvation ≤ 2; median ≥ 0.8× ctl; wins/national not regressed) | all must hold | starvation 3 vs 4 (Δ-1); arm-only starvation 0; median 151 vs 151 (ratio 1.0); wins 0/0, national 0/0 | ✅ |
| 6. Answer quantified (per-seed table + funnel + zero-grant split + arrivals + gate-diag join + sense) | all must hold | §1–§5 below | ✅ |

## Wall numbers (both legs, 8 seeds)

| Metric | Ctl | Arm |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National scale access | 0/8 | 0/8 |
| Table | not instrumented (null) | not instrumented (null) |
| Wave 5 reached | 3/8 | 4/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Median survival | 151 days | 151 days |
| Community lost | 2/8 | 2/8 |
| Standing at end | 199, 635, 450, 199, 199, 350, 199, 199 | 199, 635, 480, 350, 199, 350, 199, 199 |

The scale wall still binds: no village reaches national, none wins.
This arm was a tier-4 supply lever, not a scale lever — the wall numbers
are recorded, not moved. The one wave-5 difference (3 vs 4) is seed
107300: ctl survived at wave 4, arm reached wave 5 before losing the
village day 149 — stream divergence from the lever's extra RNG draw
(see §4), not a survival effect (guardrail bar 5 passes; panel
no_material_signal on every observed metric, §6).

## 1. DIAG — the gate, quantified (before the lever ran)

Analyzer `scripts/analyze-tier4gate-diag-a.js` over the tier4pool
corpora (12 seeds each, band 107271–107282). The exact gate rule, read
from code (`contests.js` `_cxItemPrize:201-212`):

```
tier = max(min(3, wave), broadcastRewardTier(who))   // caps at 3
apex = wave >= 4 || wins >= 8 || favor >= 100
if (contest.risk === 'extreme' && apex && Math.random() < 0.25) tier = 4
```

`broadcastRewardTier` caps at 3, so tier 4 reaches `rollAlienLoot`
ONLY via that line — verified: 0 tier-4 rolls on non-eligible prizes on
both tier4pool legs. Canon (docs/CONTESTS.md:206): "Extreme contests
have an earned apex opportunity; ordinary wins cap at tier3."

| Gate stage | Ctl (261 rolls) | Arm (278 rolls) |
|---|---|---|
| Apex-eligible (extreme + apex) | 163 (62.5%) | 183 (65.8%) |
| Eligible tier-4 rate (the 25% lottery) | 39/163 = 23.9% | 42/183 = 23.0% |
| **Tier-4 rolls (band rate)** | **39 (14.9%)** | **42 (15.1%)** |
| Non-extreme rolls | 88 (33.7%) | 85 (30.6%) |
| Extreme but not apex | 10 (3.8%) | 10 (3.6%) |
| — of which wave-3 extreme (earlier-apex increment) | 5 | 5 |
| High-risk apex-eligible (more-extreme increment) | 0 | 0 |

Three findings that reframe the brief's premise (all confirmed on the
pilot band, §2):

1. **Eligibility is NOT the minority.** 62.5–65.8% of prize rolls are
   apex-eligible (74.3% on the pilot ctl leg) — the tier4access prereg's
   "only a minority of prize rolls are apex-eligible" is refuted. The
   binding half is the **25% apex lottery**: ~65% × 25% ≈ 15–18%.
2. **The widening increments are tiny.** Earlier apex adds 5 rolls per
   261 (1.9%); "more contests counted extreme" adds **zero** — no
   high-risk prize roll is ever apex-eligible, because the risk mix
   shifts with wave: high-risk contests fire only at waves 2–3
   (high@w2: 6, high@w3: 36, high@w4+: 0), while wave-4+ rolls are
   extreme or low. Counting high as extreme for the apex roll would open
   nothing.
3. **The wins/favor apex paths are dead in live play.** Every eligible
   roll qualifies via wave ≥ 4; wins ≥ 8 occurred on 62 rolls but never
   independently qualified one; favor never reaches 100 (max 71 vs the
   100 bar; pilot max 79). The "earned apex" in live play is wave ≥ 4,
   nothing else.

## 2. The funnel — pilot, both legs

| Stage | Ctl | Arm |
| --- | --- | --- |
| Contests fired | 124 | 135 |
| Contest resolutions (wins) | 116 (won 90) | 126 (won 100) |
| Prize rolls (`_cxItemPrize` calls) | 167 | 186 |
| Rolls that granted an item | 137 (82.0%) | 161 (86.6%) |
| Input tier-4 rolls | 30 (18.0%) | 34 (18.3%) |
| **Tier-4 rolls paying searcaster** | **7 (23.3%)** | **8 (23.5%)** |
| Fusion-cell tier-4 prizes | 1 | 2 |
| Kill-loot searcaster drops | 0 | 0 |
| **Gun ARRIVALS (contest + kill-loot)** | **7** | **8** |
| **Contest-prize searcaster grants** | **7 (5.6%/contest; 4.2%/roll)** | **8 (5.9%/contest; 4.3%/roll)** |

The pilot-band diag (same analyzer, pilot corpora): ctl eligible
124/167 (74.3%), lottery 24.2%; arm eligible 138/186 (74.2% by the
OLD rule — 140 with the lever's wave-3 addition), lottery 23.9%.
The lever's entire direct footprint on the pilot is **2 wave-3-extreme
prize rolls** (seed 107299 day 38, seed 107300 day 44): the day-38
roll won the lottery → tier 4, paid a **fusion_cell** (not a gun — the
pool drew a cell); the day-44 roll lost the lottery → tier ≤ 3. The
lever contributed +1 tier-4 roll in 186; the other +3 vs ctl is stream
divergence in contest volume (arm entered 11 more contests, all on the
two diverged seeds, §4). The pay rate sits at the 22.2% GUNRATE design
on both legs, as designed — the lever adds tier-4 rolls, not pool
weight.

### Per-seed tables

#### Ctl

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | T4 | Sear | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107297 | 118 | village-lost | 4 | 199 | 8 | 13 | 4 | 2 | 2 | 70, 93 |
| 107298 | 151 | survived | 5 | 635 | 17 | 21 | 5 | 3 | 3 | 48, 65, 122 |
| 107299 | 143 | village-lost | 5 | 450 | 17 | 23 | 5 | 1 | 1 | 141 |
| 107300 | 151 | survived | 4 | 199 | 16 | 22 | 1 | 0 | 0 | — |
| 107301 | 151 | survived | 4 | 199 | 19 | 25 | 4 | 0 | 0 | — |
| 107302 | 151 | survived | 5 | 350 | 13 | 20 | 3 | 0 | 0 | — |
| 107303 | 151 | survived | 4 | 199 | 16 | 19 | 5 | 0 | 0 | — |
| 107304 | 151 | survived | 4 | 199 | 18 | 24 | 3 | 1 | 1 | 32 |
| **Band** | | **2 lost / 6 survived** | | | **124** | **167** | **30** | **7** | **7** | |

#### Arm (TIER4GATE=1)

| Seed | Days | End | Wave | Standing | Contests | Prize rolls | T4 | Sear | Grants | Grant day(s) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107297 | 118 | village-lost | 4 | 199 | 8 | 13 | 4 | 2 | 2 | 70, 93 |
| 107298 | 151 | survived | 5 | 635 | 17 | 21 | 5 | 3 | 3 | 48, 65, 122 |
| 107299 | 151 | survived | 5 | 480 | 24 | 35 | 7 | 2 | 2 | 112, 132 |
| 107300 | 149 | village-lost | 5 | 350 | 20 | 29 | 3 | 0 | 0 | — |
| 107301 | 151 | survived | 4 | 199 | 19 | 25 | 4 | 0 | 0 | — |
| 107302 | 151 | survived | 5 | 350 | 13 | 20 | 3 | 0 | 0 | — |
| 107303 | 151 | survived | 4 | 199 | 16 | 19 | 5 | 0 | 0 | — |
| 107304 | 151 | survived | 4 | 199 | 18 | 24 | 3 | 1 | 1 | 32 |
| **Band** | | **2 lost / 6 survived** | | | **135** | **186** | **34** | **8** | **8** | |

Six of eight seeds are byte-identical between legs (same days, deaths,
contests, grants) — the lever's RNG footprint is nil where no
wave-3-extreme roll occurs. Only 107299 and 107300 diverge (§4).

## 3. The zero-grant split (grantrate §2 taxonomy, both legs)

| Seed | Leg | Kind | Why |
| --- | --- | --- | --- |
| 107300 | ctl | thin-gate | 1 eff tier-4 roll in 151d, 22 prize rolls |
| 107301 | ctl | rolled-and-lost | 4 eff tier-4 rolls, 0 grants |
| 107302 | ctl | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |
| 107303 | ctl | rolled-and-lost | 5 eff tier-4 rolls, 0 grants |
| 107300 | arm | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |
| 107301 | arm | rolled-and-lost | 4 eff tier-4 rolls, 0 grants |
| 107302 | arm | rolled-and-lost | 3 eff tier-4 rolls, 0 grants |
| 107303 | arm | rolled-and-lost | 5 eff tier-4 rolls, 0 grants |

The lever moved one village across the split (ctl 107300 thin-gate →
arm rolled-and-lost, 1 → 3 eff tier-4 rolls) and added no grant
anywhere: zero-grant seeds stay 4 → 4. The 107300 move is divergence
noise, not the lever (§4): its 3 arm tier-4 rolls are wave-4+ rolls
from the extra contests after the trajectory split; the lever's own
day-44 wave-3 roll lost the lottery. Rolled-and-lost still dominates —
the pool lottery, not the gate, decides whether a village that reaches
the gate gets a gun, and at 18% access the gate is not the binding
stage for these villages either.

## 4. Gun arrivals + the divergence mechanism

Arrivals (contest grants + kill-loot drops): ctl 7, arm 8. The kill-loot
door contributed NOTHING on either leg (0 searcaster drops in 16 legs)
— the contest prize remains the only gun door in live play on this
band, as on grantrate / tier4access / tier4pool.

The two diverged seeds trace to one mechanism, and it is worth naming
precisely because the next arm will meet it too. The apex lottery line
short-circuits: `contest.risk === 'extreme' && apex &&
Math.random() < 0.25`. On ctl, a wave-3 extreme contest fails `apex`,
so `Math.random()` is never called; on arm, `apex` is true, so the
lottery consumes one RNG draw — and every subsequent draw in the run
shifts by one. The lever adds exactly **2 RNG draws on the whole
pilot** (one per newly-eligible roll), and both seeds that contain such
a roll diverge:

- **107299:** the day-38 wave-3 roll won the lottery → tier 4,
  fusion_cell granted (a cell, not a gun). The shifted stream then runs
  a different trajectory: the village survives to 151d (ctl lost day
  143), enters 7 more contests, wins 2 guns (days 112, 132) against
  ctl's 1 (day 141). The extra grants are trajectory noise downstream
  of one cell, not a lever effect on survival — the lever adds prizes,
  nothing else.
- **107300:** the day-44 wave-3 roll lost the lottery → tier ≤ 3, but
  the consumed draw still shifts the stream: arm loses the village day
  149 (ctl survived 151d), enters 4 more contests, reaches wave 5.
  Same mechanism, opposite sign — which is the signature of stream
  divergence, not a survival effect.

## 5. Sense-test — the lever changes counts, not the story

The grant moments the legs share read identically in both corpora: arm
107297's days 70 + 93, arm 107298's days 48/65/122, arm 107304's day 32
are the same wins, same recipients, same 2-cell bundles as ctl — the
lever changed nothing about what a win looks like. The lever's one
direct product (107299 day 38: a wave-3 extreme win paying a fusion
cell) reads as an ordinary prize announcement, no new narration (the
lever is silent inside the loot table by design). Sense-test passes in
the narrow sense: no robotic or incoherent behavior introduced. What
the sense read does show is the NO-GO in human terms: a village that
reaches wave 3, wins an extreme contest on camera, and still has only a
1-in-4 shot at the apex — and the apex itself is nearly unreachable
before wave 4 because wave-3 extreme contests are ~2% of prize rolls.
The gate is not stingy about who may enter; it is stingy about the
lottery once they are in.

## 6. Balanced panel (§15)

`scripts/build-tier4gate-panels-a.js` + `scripts/balance-panel.js
compare` (before = ctl, after = arm, 8 paired cases):
**review_required** (exit 2 — the tool's exit for review_required).
Per-metric: national 0 → 0, community loss 0.25 → 0.25, village deaths
per run 101.38 → 99.13 and village deaths per 100 days 70.28 → 68.34 —
all **no_material_signal** with intervals straddling 0. The
review_required decision is driven by unobserved metrics, as in
tier4access / tier4pool — no observed metric shows a material signal.
Panel: `evidence/2026-11-22/tier4gate-a-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`).

## 7. Instrument notes and deviations

- **Pilot NO-GO, no confirm spend:** the 8-seed pilot judged NO-GO on
  all bars except the primary (bar 1 misses; bars 2–6 pass). Per the
  prereg run plan the 4-seed confirm did not run. The frozen verdict is
  the 8-seed `tier4gate-a-pilot-judgement.json` (NO-GO).
- **Smoke-gate deviation (documented, not a re-score):** the prereg's
  smoke gate required ≥ 1 wave-3-extreme prize roll on smoke seed
  107297; the seed has none (13 prize rolls, village lost day 118).
  The condition as written is over-strict for a single seed: on the
  tier4pool band 7 of 12 seeds have zero wave-3-extreme rolls (5 in
  261 rolls, ~0.4/seed). Joins 100%, 0 instrument errors, and ≥ 1 prize
  roll all passed on the smoke; the population's existence on the band
  is proven by the pilot itself (2 wave-3-extreme rolls, §2). The smoke
  corpus was discarded per the prereg (regenerated by the pilot arm
  leg). No bar was re-scored — the smoke gate is a pre-pilot instrument
  check, not a frozen bar.
- **Registry-lock jam:** `worktree-heartbeat.sh` failed once with
  "registry lock held > 120s — heartbeat skipped" (a sibling holding
  the registry lock; same jam tier4pool noted). The worktree stayed
  registered throughout; the sims were unaffected. Flagged for the
  coordinator — the lock jam is not this arm's to fix.
- **Safe-commit index clobber:** struck on the prereg commit (all 9
  committed files showed staged-as-deleted, `MM` on contests.js) and
  was repaired with the `git ls-tree -r HEAD` pipe, verified by empty
  status + empty diff HEAD + hash-object match.
- **Write flap (host):** no flap losses on this run — every corpus
  write landed first try (the driver's writeRobust fallback never
  printed).
- **check.js --quick NOT completed:** the run did not run the full quick
  suite (time; the pilot legs took ~33 min under sibling load); the
  proof test (18/18) + analyzer selftest (30/30) + diag selftest
  (19/19) + `node --check` on the changed file are green, and the
  reverted tip carries NO game-code change (`git diff 4266e6cce --
  src/js/contests.js` empty). The ship loop runs the full check before
  landing.
- **What was NOT measured:** whether a granted gun is ever FIRED in a
  fight after receipt; table entry/sitting (not instrumented — left
  null, never faked); player deaths per run (not instrumented).

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed
  `f46b00284`). Bars 2–6 pass on the frozen 8-seed pilot; bar 1 misses
  (18.3% vs the 25% bar, ratio 1.02× vs 1.5×). No bar was re-scored;
  the verdict is NO-GO on the frozen bars.
- **The static prior held — and the pilot ctl ran hot.** The prereg
  predicted the arm tier-4 rate at ~16.1% (eligible 62.5% × 25%
  lottery, +5 wave-3 rolls); measured 18.3%, because this band's ctl
  eligible share is higher (74.3% vs 62.5% on the tier4pool band) and
  its ctl rate is 18.0%, not 15%. The RATIO is the robust read: 1.02×
  — the lever adds ~2 eligible rolls per 170 and the lottery pays a
  quarter of them. No plausible band variation gets earlier apex to
  25%: it would need the lottery to pay ~35% on the widened set.
- **The diag, not the lever, is the result.** The pilot's job was to
  kill or confirm the "wider eligibility" hypothesis, and it killed it
  with the mechanism visible: the lever worked exactly as designed
  (2 rolls opened, 1 paid tier 4) and the band rate moved 0.3 points.
  The gate's binding half is the 25% lottery, and the wins/favor apex
  paths are dead in live play — a follow-up that wants 25%+ must move
  the lottery itself (for reference only: earlier apex + apexChance
  0.50 predicts ~32% on the tier4pool band shape) or find a different
  door. That is a design question for the next round, not a knob on
  this lever.
- **Guardrail reading recorded:** "arm-only deaths" was frozen in the
  prereg as starvation deaths on seeds where the arm leg lost the
  village but the identical-seed ctl leg survived; measured 0. Total
  starvation deaths 3 vs 4 — the arm leg starved FEWER villagers.

## Findings (updates to sim-findings.md #2648)

- [open] 2026-11-22 — tier-4 gate: wider eligibility does NOT reach
  25% (finding #2648, updated) — the earlier-apex lever (TIER4GATE,
  wave-3 extreme contests apex-eligible) moved the band tier-4 rate
  18.0% → 18.3% (ratio 1.02×) on the frozen 8-seed pilot band
  107297–107304; verdict NO-GO, lever reverted. The diag is the
  durable result: 62–74% of prize rolls are already apex-eligible, the
  25% lottery is the binding half, earlier apex opens ~2 rolls per 170,
  counting high-risk as extreme opens zero (high-risk contests fire
  only at waves 2–3), and the wins/favor apex paths never qualify a
  roll in live play (favor max 71–79 vs the 100 bar). A 25%+ band rate
  needs the lottery itself moved, or a different door — a design
  question, not a knob on this lever.
  (Loop A arm sim-tier4gate-a, run fleshout-20261122T0215Z,
  evidence/2026-11-22/sim-tier4gate-a.md.)

## Files

- Prereg: `evidence/2026-11-22/sim-tier4gate-a-prereg.md` (`f46b00284`)
- Diag: `evidence/2026-11-22/tier4gate-a-diag-ctl.json`,
  `tier4gate-a-diag-arm.json` (tier4pool corpora);
  `tier4gate-a-diag-pilot-ctl.json`, `tier4gate-a-diag-pilot-arm.json`
  (pilot corpora)
- Lever (reverted at the tip; in history under `f46b00284`):
  `src/js/contests.js` (TIER4GATE apex-wave block)
- Instrument (kept): `scripts/analyze-tier4gate-a.js` (selftest 30/30),
  `scripts/analyze-tier4gate-diag-a.js` (selftest 19/19),
  `scripts/build-tier4gate-panels-a.js`
- Instrument (lever-coupled, deleted from the tip; in history under
  `f46b00284`): `scripts/tier4gate-driver-a.js`,
  `scripts/test-tier4gate-a.js` (proof test 18/18 against the lever)
- Pilot: `evidence/2026-11-22/perseed-tier4gate-a-ctl/` (8 corpora),
  `evidence/2026-11-22/perseed-tier4gate-a-arm/` (8 corpora),
  `evidence/2026-11-22/tier4gate-a-ctl-analysis.json`,
  `evidence/2026-11-22/tier4gate-a-arm-analysis.json`,
  `evidence/2026-11-22/tier4gate-a-pilot-judgement.json` (NO-GO)
- Panel: `evidence/2026-11-22/tier4gate-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`)
- Logs: `evidence/2026-11-22/tier4gate-a-ctl.log/.err`,
  `tier4gate-a-arm.log/.err`, `tier4gate-a-smoke.log` (smoke corpus
  discarded after the gate; the pilot arm leg regenerated seed 107297)

## Run identity

- **Base:** worktree HEAD `0ea9789d7`; rebased onto master tip
  `4266e6cce` before finishing; branch `sim-tier4gate-a`; prereg +
  lever + instrument commit `f46b00284`; tip: lever reverted, game
  code byte-identical to `4266e6cce`.
- **Smoke (arm, seed 107297, discarded):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 TIER4GATE=1 MODE=arm
  OUTDIR=perseed-tier4gate-a-smoke SEEDS=107297 RUN=tier4gate-a
  node scripts/tier4gate-driver-a.js` (118d, village-lost, 13 prize
  rolls, 2 sear grants, 0 errors; 0 wave-3-extreme rolls — see §7).
- **Pilot commands (8 seeds 107297–107304):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl
  OUTDIR=perseed-tier4gate-a-ctl SEEDS=107297,...,107304 RUN=tier4gate-a
  node scripts/tier4gate-driver-a.js` (ctl). **Arm:** identical +
  `TIER4GATE=1 MODE=arm OUTDIR=perseed-tier4gate-a-arm`.
- **Analyze commands:** `node scripts/analyze-tier4gate-a.js --dir
  evidence/2026-11-22/perseed-tier4gate-a-ctl --out
  evidence/2026-11-22/tier4gate-a-ctl-analysis.json` (LEG-OK), same
  for arm (LEG-OK), then `node scripts/analyze-tier4gate-a.js --judge
  evidence/2026-11-22/tier4gate-a-ctl-analysis.json
  evidence/2026-11-22/tier4gate-a-arm-analysis.json --out
  evidence/2026-11-22/tier4gate-a-pilot-judgement.json` → **NO-GO**.
- **Diag commands:** `node scripts/analyze-tier4gate-diag-a.js --dir
  evidence/2026-11-21/perseed-tier4pool-a-ctl --out
  evidence/2026-11-22/tier4gate-a-diag-ctl.json`, same for arm; same
  on the pilot corpus dirs → `tier4gate-a-diag-pilot-{ctl,arm}.json`.
- **Panel command:** `SEEDS=107297,...,107304 node
  scripts/build-tier4gate-panels-a.js && node scripts/balance-panel.js
  compare --before evidence/2026-11-22/tier4gate-a-panel-before.json.gz
  --after evidence/2026-11-22/tier4gate-a-panel-after.json.gz --out
  evidence/2026-11-22/tier4gate-a-panel` → review_required (unobserved
  metrics), no material signal on observed metrics.
- **Proof test:** `node scripts/test-tier4gate-a.js` → 18/18 green
  (against the lever commit; file deleted from the tip with the lever).
  **Selftests:** `node scripts/analyze-tier4gate-a.js --selftest` →
  30/30 green; `node scripts/analyze-tier4gate-diag-a.js --selftest`
  → 19/19 green.
