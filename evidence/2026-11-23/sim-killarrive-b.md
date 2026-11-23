# sim-killarrive-b — THE 49-SEED KILL-LOOT SEARCASTER ARRIVAL BAND

- Arm: sim-killarrive-b, Loop B run fleshout-loop-b-20261123T1230Z, arm 2 of 2.
- Axis: winnability-chain · Finding #2599 family.
- Base: worktree HEAD `5fb502bd1` at band time (prereg + arm test;
  branch `sim-killarrive-b`). No game-code change in this arm.
- Prereg: `evidence/2026-11-23/sim-killarrive-b-prereg.md` (content
  frozen ~13:00 UTC, committed `5fb502bd1` before any judged seed ran).
- Instrument: `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from the
  killloot16 / killrate arms; tier tally
  `scripts/test-killrate-analysis-a.js`; arm test
  `scripts/test-killarrive-b.js` (NEW).
- Horizon: 150d death-aware. Seeds: 107533–107581 (49, fresh — §7).
  Policy: competent (verbatim). Single ctl leg (KILLBUNDLE unset —
  this arm measures the roll rate, not the bundle). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## Verdict: GO — the arrival happened, the rate holds, the gun arrived dry

The band sized by killrate-a delivered exactly what it was sized
to deliver: **one kill-loot searcaster arrival in 49 seeds**, on
seed 107533, day 19 — the first kill-loot searcaster in the whole
program (prior bands: 0 in 193 pooled drops, 0 in 105 before
that). The tier-4 kill-roll rate is 31/399 = **7.77%** (Wilson 95%
CI 5.5–10.8%), against the pooled measured 8.81% — inside the
frozen 2× band (4.4–17.6%) with no explanation needed, and inside
2× of the original code point prediction (4.4%) as well. The
arrival count (1 vs 2.25 expected at the pooled rate) is
Poisson-consistent two-sided (P(X ≤ 1) = 0.34, P(X ≥ 1) = 0.89).
The rate is judged, not just the count — and the rate holds.

The arrival itself is the story's sting: the gun arrived **dry**
(0 cells), its holder carried it into 15 fights over 73 days and
never fired a single shot, died in the wild on day 92, and the gun
sat on his unburied corpse until the village was lost on day 129.
Arrival is no longer the question. Ammunition is.

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (proof 12/12 + selftest 17/17 + killrate 36/36 + analysis 14/14 + killarrive-b 12/12 on this base; 0 errors on all 49 files; anchor + policySha on every file) | all must hold | proof 12/12, selftest 17/17, killrate 36/36, analysis 14/14, killarrive-b 12/12; corpus validation PASS (49 files, one shared anchor `5fb502bd1`, policySha matches, 0 errors) | ✅ |
| 2. Band-observed tier-4 kill-roll rate reported | must be reported | 31/399 = 7.77% (per-seed table §1) | ✅ |
| 3. Arrival count + Poisson consistency (μ = 2.25 expected; two-sided α = 0.05) | must hold for GO | 1 arrival; P(X ≤ 1) = 0.34, P(X ≥ 1) = 0.89 — consistent | ✅ |
| 4. Tier-4 rate reconciliation within 2× of pooled 8.8% (4.4–17.6%), or explained | must hold for GO | 7.77% inside, no explanation needed; also inside 2× of the 4.4% point | ✅ |
| 5. Arrival judgment delivered (rate, count, Poisson read, plain-words meaning) | must be delivered | §5 | ✅ |

## 1. Per-seed table (analyzer + tier tally; days = driver days)

| Seed | Days | End | Wave | Standing | Deaths | Contests | Prize rolls | Contest sear grants | Kill-loot events | Tier-4 rolls | Kill-loot sear | Sear volleys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107533 | 129 | village-lost | 4 | 199 | 137 | 17 | 26 | 0 | 10 | 2 | 1 | 0 |
| 107534 | 129 | village-lost | 4 | 199 | 84 | 13 | 20 | 0 | 8 | 1 | 0 | 0 |
| 107535 | 150 | survived | 4 | 199 | 93 | 17 | 22 | 3 | 8 | 2 | 0 | 0 |
| 107536 | 135 | village-lost | 5 | 275 | 118 | 10 | 16 | 1 | 15 | 1 | 0 | 1 |
| 107537 | 150 | survived | 5 | 345 | 77 | 14 | 19 | 2 | 6 | 2 | 0 | 0 |
| 107538 | 150 | survived | 4 | 199 | 61 | 17 | 31 | 2 | 1 | 0 | 0 | 0 |
| 107539 | 83 | village-lost | 4 | 199 | 126 | 9 | 13 | 0 | 11 | 0 | 0 | 0 |
| 107540 | 150 | survived | 5 | 545 | 132 | 17 | 24 | 1 | 12 | 0 | 0 | 0 |
| 107541 | 142 | village-lost | 5 | 430 | 103 | 22 | 31 | 1 | 8 | 0 | 0 | 0 |
| 107542 | 95 | village-lost | 4 | 175 | 91 | 8 | 8 | 0 | 8 | 0 | 0 | 0 |
| 107543 | 150 | survived | 5 | 435 | 121 | 20 | 22 | 1 | 12 | 1 | 0 | 0 |
| 107544 | 119 | village-lost | 4 | 150 | 68 | 10 | 11 | 0 | 5 | 1 | 0 | 0 |
| 107545 | 150 | survived | 4 | 150 | 53 | 19 | 25 | 0 | 6 | 2 | 0 | 0 |
| 107546 | 150 | survived | 4 | 199 | 76 | 22 | 25 | 0 | 6 | 1 | 0 | 0 |
| 107547 | 76 | village-lost | 4 | 199 | 74 | 8 | 14 | 0 | 5 | 0 | 0 | 0 |
| 107548 | 150 | survived | 5 | 610 | 79 | 20 | 32 | 1 | 5 | 1 | 0 | 0 |
| 107549 | 150 | survived | 4 | 199 | 100 | 15 | 18 | 1 | 7 | 0 | 0 | 0 |
| 107550 | 135 | village-lost | 5 | 390 | 94 | 16 | 18 | 0 | 8 | 2 | 0 | 0 |
| 107551 | 150 | survived | 5 | 580 | 167 | 16 | 23 | 1 | 5 | 0 | 0 | 0 |
| 107552 | 150 | survived | 5 | 510 | 84 | 13 | 19 | 0 | 3 | 1 | 0 | 0 |
| 107553 | 150 | survived | 5 | 415 | 92 | 16 | 21 | 0 | 11 | 0 | 0 | 0 |
| 107554 | 92 | village-lost | 4 | 199 | 76 | 8 | 12 | 0 | 8 | 0 | 0 | 0 |
| 107555 | 144 | village-lost | 5 | 385 | 87 | 15 | 20 | 1 | 7 | 1 | 0 | 0 |
| 107556 | 79 | village-lost | 4 | 195 | 90 | 8 | 13 | 0 | 9 | 0 | 0 | 0 |
| 107557 | 123 | village-lost | 5 | 480 | 110 | 13 | 22 | 0 | 12 | 0 | 0 | 0 |
| 107558 | 150 | survived | 5 | 650 | 152 | 17 | 18 | 1 | 13 | 1 | 0 | 1 |
| 107559 | 149 | village-lost | 4 | 199 | 162 | 17 | 19 | 2 | 22 | 1 | 0 | 0 |
| 107560 | 81 | village-lost | 4 | 199 | 91 | 8 | 6 | 2 | 9 | 0 | 0 | 0 |
| 107561 | 150 | survived | 4 | 199 | 91 | 16 | 21 | 0 | 8 | 1 | 0 | 0 |
| 107562 | 87 | village-lost | 4 | 199 | 52 | 10 | 12 | 1 | 1 | 0 | 0 | 0 |
| 107563 | 150 | survived | 4 | 199 | 68 | 20 | 20 | 1 | 3 | 0 | 0 | 0 |
| 107564 | 150 | survived | 4 | 199 | 93 | 25 | 39 | 0 | 6 | 0 | 0 | 0 |
| 107565 | 150 | survived | 4 | 199 | 79 | 21 | 25 | 1 | 2 | 0 | 0 | 1 |
| 107566 | 150 | village-lost | 5 | 475 | 126 | 12 | 13 | 1 | 14 | 0 | 0 | 1 |
| 107567 | 150 | survived | 4 | 199 | 90 | 13 | 18 | 0 | 5 | 0 | 0 | 0 |
| 107568 | 150 | survived | 4 | 199 | 112 | 10 | 15 | 0 | 11 | 0 | 0 | 0 |
| 107569 | 150 | survived | 4 | 199 | 64 | 19 | 31 | 1 | 1 | 0 | 0 | 0 |
| 107570 | 150 | survived | 5 | 390 | 149 | 19 | 26 | 0 | 18 | 4 | 0 | 0 |
| 107571 | 118 | village-lost | 4 | 199 | 93 | 11 | 22 | 0 | 6 | 0 | 0 | 0 |
| 107572 | 121 | village-lost | 5 | 335 | 77 | 13 | 18 | 1 | 5 | 0 | 0 | 0 |
| 107573 | 150 | survived | 5 | 300 | 112 | 15 | 21 | 1 | 9 | 1 | 0 | 0 |
| 107574 | 110 | village-lost | 4 | 199 | 102 | 17 | 23 | 0 | 11 | 0 | 0 | 0 |
| 107575 | 103 | village-lost | 4 | 199 | 85 | 13 | 18 | 0 | 13 | 2 | 0 | 0 |
| 107576 | 113 | village-lost | 4 | 165 | 36 | 14 | 18 | 0 | 2 | 0 | 0 | 0 |
| 107577 | 146 | village-lost | 4 | 199 | 109 | 21 | 27 | 1 | 5 | 0 | 0 | 0 |
| 107578 | 138 | village-lost | 5 | 325 | 92 | 17 | 29 | 0 | 15 | 1 | 0 | 0 |
| 107579 | 117 | village-lost | 4 | 199 | 115 | 12 | 13 | 0 | 8 | 0 | 0 | 0 |
| 107580 | 150 | survived | 4 | 199 | 100 | 23 | 44 | 1 | 12 | 1 | 0 | 0 |
| 107581 | 150 | survived | 4 | 199 | 61 | 22 | 33 | 1 | 4 | 1 | 0 | 0 |

Totals: 399 kill-loot events, 31 tier-4 rolls (7.77%), 1 kill-loot
searcaster, 30 contest searcaster grants, 4 searcaster volleys (8
shots, all from contest guns), 4,704 deaths, 16 starvation deaths,
0 instrument errors. (Analyzer `days` reads 151 on survived seeds
vs the driver's 150; same 1-day quirk as killrate-a. No bar turns
on it.)

Tier mix, fresh band: tier 1: 62, tier 2: 210, tier 3: 96, tier 4:
31. Tier-4 drops (day, item): (6, lifespring_vial), (7,
starfall_lance), (9, genesis_seed), (11, genesis_seed), (12,
ironfist_wraps), (15, first_steps_boots), (17, bloodplate), (18,
undying_heart), (19, searcaster), (20, genesis_seed), (22,
genesis_seed), (22, fusion_cell), (23, consensus_crown), (29,
undying_heart), (30, fusion_cell), (31, warlords_standard), (37,
genesis_seed), (38, ironfist_wraps), (39, ironfist_wraps), (49,
undying_heart), (50, bloodplate), (52, fusion_cell), (63,
undying_heart), (64, first_steps_boots), (68, void_cloak), (100,
consensus_crown), (104, consensus_crown), (112, causality_lens),
(113, causality_lens), (115, warlords_standard), (134,
consensus_crown). Three of the 31 are `fusion_cell` itself (days
22, 30, 52) — the alien tier-4 pool draws, including cells, as
modeled; the searcaster is the only gun among them.

## 2. Wall numbers

| Metric | This band (49 seeds) |
| --- | --- |
| Wins | 0/49 |
| National | 0/49 |
| Table | not instrumented by this driver (recorded, never faked) |
| Wave 5 unlocks | 18/49 |
| Wave 4 unlocks | 49/49 |
| Median survival | 150d (driver days; analyzer 149d — see §1 note) |
| Max survival | 150d |
| Villages lost | 25/49 (24 survived) |

The scale wall still binds — regional is the ceiling on all 49
seeds (standing 150–650, best 650 on seed 107558), no national, no
wins — but the wall is not this arm's question; the numbers are
reported because the standing directive requires them every run.

## 3. Reconciliation — code vs band

| Quantity | Pooled measured (killrate-a) | This band | Pooled incl. this band |
| --- | --- | --- | --- |
| Kill-loot events | 193 | 399 | 592 |
| Drops / seed | 8.04 | 8.14 | 8.11 |
| Tier-4 rate / drop | 8.81% | **7.77%** | **8.11%** |
| Tier-4 Wilson 95% CI | 5.6–13.7% | 5.5–10.8% | — |
| Searcaster / drop | 0.587% | 0.25% (1/399) | 0.17% (1/592) |
| Arrivals / seed | 4.6% | 2.04% (1/49) | — |
| Expected arrivals | 2.25 on 49 seeds | 1 observed | 3.2 on 592 drops, 1 observed |

The fresh band's tier-4 rate (7.77%) sits comfortably inside the
frozen 2× band around the pooled measured rate and inside 2× of
the original 4.4% code point — the rate that killrate-a could only
reconcile via its explanation clause now reconciles directly. The
arrival count (1 vs 2.25 expected) is Poisson-consistent
(P(X ≤ 1) = 0.34; P(X ≥ 1) = 0.89). Pooled across all three bands
(592 drops), the tier-4 rate is 8.11% and the searcaster count is
1 vs 3.2 expected (P(X ≤ 1) = 0.17) — still consistent, now with
a real arrival in the corpus instead of a zero. Re-sizing from
this band alone gives 55 seeds for P(≥1) ≥ 90%; pooled re-sizing
gives 53 — the 49 run was within 4 seeds of the pooled sizing, and
the sizing question is now closed: ~50 seeds is the instrument
for this question, not 8 or 16.

## 4. The arrival — seed 107533, day 19 (sense-test)

Jorge Silva takes a kill-loot searcaster on day 19 with **0 cells
gained** (dry arrival — the ctl leg has no bundle, as designed).
The daily gun census shows him equipping it the same day and
carrying it, 0 cells, every day from day 19 to day 91. He fights
with it 15 times (days 20–82, waves 1–3, incl. a wave-3 spool,
chorus_line, and bright_idea): every volley record is 0 shots, 0
hits, ammoLeft 0. He dies in the wild on day 92. The gun stays on
his unburied corpse through day 129, when the village is lost
(137 deaths); nobody recovers it — no corpse-take, no grant, no
scholar-pack location ever appears for it.

This is the kill-loot path's whole story in one seed: the roll
table delivers the gun, the holder equips it, and then nothing
happens — because the gun has no cells and nobody in the village
can re-arm it. The contest path on this band shows the same shape
from the other side: 30 contest grants, 4 volleys, each exactly 2
shots / 1 hit / 64–68 damage, all in wave-4 fights (herald d109,
audit d78, reunion d105, suburb d55) — the 2-cell bundle fires
twice and then is a paperweight, exactly as killrate-a found on
seed 107316. Arrival is measured and closed; **cells are the
binding constraint on both paths now**, not arrival. That is a
finding for the coordinator (§9), not a bar of this arm.

## 5. Arrival judgment (frozen rule, prereg §6)

- **Tier-4 kill-roll rate:** 31/399 = 7.77% (Wilson 95% CI
  5.5–10.8%).
- **Kill-loot searcaster arrivals:** 1 in 49 seeds (seed 107533,
  day 19, holder jorge_silva, dry — §4).
- **Poisson consistency:** 1 vs 2.25 expected at the pooled
  measured rate — P(X ≤ 1) = 0.34, P(X ≥ 1) = 0.89; consistent
  two-sided at α = 0.05. Pooled across all bands: 1 vs 3.2
  expected, P(X ≤ 1) = 0.17 — consistent.
- **Plain-words meaning:** a kill-loot searcaster arrives about
  once per 22 seeds at the pooled rate, and this band saw exactly
  one — the rate, not the count, is what the band was built to
  judge, and the rate holds. The count (1, not 0 or 5) is the
  middle of the expected range, not an edge. What the band
  actually discovered is downstream of arrival: the gun arrived
  with no cells and never fired, which is a supply finding, not
  an arrival finding.

## 6. Early tier-4 drops — corroboration, not a new finding

Nineteen of the 31 tier-4 drops land before day 40, five in the
first 12 days (lifespring_vial d6, starfall_lance d7,
genesis_seed d9 and d11, ironfist_wraps d12). Killrate-a filed
this as an open finding (early tier-4 kill drops need apex
attribution — killLootEvents carry no mdef, so no per-drop
attribution is possible from this corpus); this band
corroborates it at 6× the seed count. No new finding is filed —
the open one stands, now with 49 seeds behind it.

## 7. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof 12/12, selftest 17/17,
  `test-killrate-a.js` 36/36, `test-killrate-analysis-a.js` 14/14,
  `test-killarrive-b.js` 12/12 — all re-run on base 7ade8d3bf
  before the judged band. Green.
- **Machine restart killed the first band attempt mid-run.**
  All four leg processes were SIGTERM'd at ~21.4 min (uptime 1
  min when the worker resumed) — a VM replacement, per the known
  pattern. 43 of 49 seed files had already landed complete
  (writeRobust tmp+rename; every landed file carries its printed
  summary line). The 6 missing seeds (107544, 107555, 107556,
  107568, 107580, 107581) were re-run as two remnant processes
  after the restart, exit 0, same anchor `5fb502bd1`, same
  substrate — the driver refuses to overwrite, so no landed
  file was re-run or replaced. All 49 files share the one anchor;
  corpus validation PASS. Nothing from the killed attempt is
  counted twice; nothing is extrapolated.
- **safe-commit index clobber (known class).** After the prereg
  commit the main index showed the committed files
  staged-as-deleted; repaired with the `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info` pipe, verified
  empty status + empty diff HEAD + hash-object match (prereg
  blob `34ba22a2…`).
- **RUN / OUTDIR:** `RUN=killlootbundle-a` unchanged (analyzer
  hardcodes it); fresh OUTDIR `perseed-killarrive-b-ctl`. Driver
  hardcodes `evidence/2026-11-21/<OUTDIR>` — corpus under
  2026-11-21, evidence under 2026-11-23. Recorded, not moved.
- **Band launch (judged):** 4 processes × 12–13 seeds, then 2
  remnant processes × 3 seeds after the restart; all exit 0;
  49/49 files landed on disk, anchor `5fb502bd1` on all 49.
- **No panel (§15) built:** single ctl leg, no before/after —
  the balanced-panel compare needs two legs. Stated plainly in
  the prereg §8, not faked.

## 8. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg content ~13:00
  UTC, committed `5fb502bd1`, judged band launched after): all
  five bars pass, and bar 4 passes directly this time — no
  explanation clause needed, unlike killrate-a where the fresh
  band ran 3.1× hot. No bar was re-scored.
- **The count is not the verdict.** The prereg froze the
  judgment rule as rate-first for exactly the reason this band
  shows: a count of 1 could have been read as "arrival works"
  or "arrival barely works" depending on the reader's mood; the
  tier-4 rate (7.77% vs 8.81% pooled) is the measurement that
  decides, and it is unambiguous. The rule held.
- **Sizing validated.** The pooled re-sizing from this band's
  own numbers is 55 seeds; pooled across all bands, 53. The 49
  run was the right instrument within a few seeds, and the
  sizing question should now be treated as closed — future
  arrival questions on this table should run ~50 seeds, not
  re-size from scratch.
- **What this band does NOT judge:** whether a kill-loot gun
  ever matters in a fight (0 volleys from the one arrival —
  dry), whether holders re-arm (no re-arm observed anywhere),
  or whether the bundle (KILLBUNDLE) changes any of this (ctl
  leg only, bundle unset by design). Those are the next
  questions, not this arm's.

## 9. Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-23 — items / supply — KILL-LOOT GUNS ARRIVE
  DRY AND NEVER FIRE: the first kill-loot searcaster in the
  program arrived on seed 107533 day 19 with 0 cells, was
  carried into 15 fights over 73 days (0 shots in every one),
  and ended on its holder's unburied corpse when the village
  was lost — while the contest path's 30 grants on the same
  band fired exactly 4 volleys of 2 shots each and then went
  dry. Arrival is closed as a question; cells/re-arming is now
  the binding constraint on both gun paths. Next step: check
  what re-arms a holder (crafting? corpse takes? trade?) before
  proposing a lever — the KILLBUNDLE arm (2 cells at arrival)
  is the standing candidate, unjudged on this question.
  (sim-killarrive-b, evidence/2026-11-23/sim-killarrive-b.md)

## Files

- Prereg: `evidence/2026-11-23/sim-killarrive-b-prereg.md`
  (`5fb502bd1`)
- Evidence: `evidence/2026-11-23/sim-killarrive-b.md` (this file)
- Proof tests: `scripts/test-killarrive-b.js` (12/12 + corpus
  PASS), `scripts/test-killrate-a.js` (36/36),
  `scripts/test-killrate-analysis-a.js` (14/14) (`5fb502bd1`)
- Analysis: `evidence/2026-11-23/killarrive-b-analysis.json`
  (analyzer `--dir` output),
  `evidence/2026-11-23/killarrive-b-tally.json` (tier tally),
  `evidence/2026-11-23/killarrive-b-validation.json` (corpus
  validation), `evidence/2026-11-23/killarrive-b-rows.json`
  (per-seed table source)
- Corpus: `evidence/2026-11-21/perseed-killarrive-b-ctl/` (49
  files, anchor `5fb502bd1`)
- Leg logs: `evidence/2026-11-23/killarrive-b-legs-{1,2,3,4}.log`
  (43 seeds pre-restart),
  `evidence/2026-11-23/killarrive-b-legs-remnant-{a,b}.log` (6
  seeds post-restart)

## Run identity

- **Base:** worktree HEAD `7ade8d3bf` (master tip at arm start);
  prereg + arm test `5fb502bd1`; branch `sim-killarrive-b`.
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → 12/12 (all on
  7ade8d3bf).
- **Band (judged):** 49 seeds, **107533–107581**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). One ctl leg. Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `KILLBUNDLE` unset;
  `LEND` unset; `PRESENCE` unset.
- **Analysis (judged):** `node scripts/analyze-killlootbundle-a.js
  --dir evidence/2026-11-21/perseed-killarrive-b-ctl --out
  evidence/2026-11-23/killarrive-b-analysis.json` → exit 0;
  `node scripts/test-killrate-analysis-a.js --dir <same> >
  evidence/2026-11-23/killarrive-b-tally.json` → exit 0;
  `node scripts/test-killarrive-b.js --dir <same> >
  evidence/2026-11-23/killarrive-b-validation.json` → PASS.
