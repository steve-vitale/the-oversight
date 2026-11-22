# sim-killloot16-a — KILL-LOOT BUNDLE 16-SEED BAND RE-JUDGE

- Arm: sim-killloot16-a, Loop A run fleshout-20261122T0215Z, arm 2 of 3.
- Axis: scale-onramp · Finding #2649.
- Base: worktree HEAD `4266e6cce` (rebased before the band — see §6);
  branch `sim-killloot16-a`.
- Prereg: `evidence/2026-11-22/sim-killloot16-a-prereg.md` (committed
  `11e2d5d35`, frozen ~02:30 UTC 2026-11-22, before any judged run).
- Instrument: `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` +
  `scripts/build-killlootbundle-panels-a.js` + `scripts/balance-panel.js`
  reused UNCHANGED from the pilot/fixture. No live-game code change in
  this arm. KILLBUNDLE stays env-gated, default OFF.
- Horizon: 150d death-aware. Seeds: 107281–107296 (16). Policy:
  competent (verbatim). Substrate (both legs): `VETREENGAGE=1
  PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1
  SPEARGATE=1 GUNRATE=1 CELLGATE=1`; arm leg adds `KILLBUNDLE=1` only.

## Verdict: INCONCLUSIVE — zero kill-loot searcaster arrivals on either leg (frozen rule fires)

**0 kill-loot searcaster arrivals on both legs of the full 16-seed band**
(105 kill-loot events per leg, 36 distinct items, searcaster not among
them), so the frozen zero-arrival rule fires: bar 3 is INCONCLUSIVE,
not GO, not NO-GO. The mechanism stands proven — the fixture
(re-verified GO on this base, §5) shows a bundled kill-loot gun fires
2 shots in a forced wave-4 fight — but this band cannot judge the
arrival rate in honest sims, because nothing arrived to bundle.

The legs are trajectory-identical on every seed (same days, standing,
deaths, contests — all fields equal, see the per-seed table): KILLBUNDLE
adds zero RNG draws and, with no arrival ever occurring, nothing could
diverge. Guardrails pass trivially (starvation 7 = 7, median survival
150 = 150). The panel compare (§15) shows exactly 0 delta on every
observed metric.

What the band DOES establish: the per-event rate is far lower than the
"1 arrival per 8 seeds" the fixture prereg's 88% estimate assumed from
a single grantrate observation. Code-read (§4) shows why: a kill-loot
searcaster needs a tier-4 roll (taper-up 5–20% by wave, or a hard kill's
tier4Chance) AND a 1-in-15 draw from the tier-4 kill pool — and the
GUNRATE ×4 searcaster weighting is contest-only. At that rate a 16-seed
band (~105 kill-loot events) is underpowered for the arrival question.
The next step is not a wider sim band first — it is a code-level read of
the tier-4 kill-roll rate (chance gate × tier-4 rate × 1/15), which
predicts the arrival rate without sims; a sim band sized from that
prediction follows if the number says it is reachable at all.

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (proof 100% + selftest + 0 errors + every drop carries cells-at-arrival) | all must hold | proof 12/12, selftest 17/17 (re-run on 4266e6cce before the band); 0 instrument errors on all 32 seed-legs; all 105 kill-loot drops/leg carry a cells-at-arrival diff | ✅ |
| 2. Mechanism proof (KILLBUNDLE=1 bundles exactly 2 cells on forced drop, 0 when off, 0 for non-searcaster) | all must hold | proof test 12/12; fixture re-verified GO on this base (§5) | ✅ |
| 3. Band GO (arm ≥ 1 bundled arrival AND ≥ 1 kill-loot volley; ctl 0 bundled arrivals) | all must hold for GO | arm bundled 0, arm volleys 0, ctl bundled 0 — **zero-arrival rule fires → INCONCLUSIVE** | — (inconclusive) |
| 4. Coverage (100% of kill-loot drops attributed; 100% of gun arrivals counted; 0 unclassified sources) | all must hold | 105/105 drops attributed per leg; gun arrivals 15 contest + 0 kill-loot per leg; 0 unclassified searcaster sources | ✅ |
| 5. Guardrails (panel compare: no material signal on starvation deaths or median survival) | all must hold | starvation 7 = 7 (Δ0); median survival 150 = 150 (Δ0); panel 0 delta on every observed metric | ✅ |

## 1. Per-seed arrival table (both legs — identical trajectories)

| Seed | Days | End | Won | Wave | Standing | Rank | Deaths | Contests | Prize rolls | Contest sear grants | Kill-loot events | Kill-loot sear | Bundled | Sear volleys | Starv deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107281 | 150 | survived | no | 5 | 370 | regional | 71 | 14 | 18 | 2 | 3 | 0 | 0 | 0 | 0 |
| 107282 | 150 | survived | no | 5 | 475 | regional | 115 | 14 | 17 | 1 | 11 | 0 | 0 | 0 | 0 |
| 107283 | 120 | village-lost | no | 4 | 199 | regional | 79 | 11 | 16 | 1 | 9 | 0 | 0 | 0 | 2 |
| 107284 | 69 | village-lost | no | 4 | 125 | regional | 55 | 8 | 12 | 0 | 8 | 0 | 0 | 0 | 0 |
| 107285 | 150 | survived | no | 4 | 199 | regional | 96 | 14 | 24 | 3 | 3 | 0 | 0 | 0 | 1 |
| 107286 | 113 | village-lost | no | 4 | 199 | regional | 51 | 12 | 15 | 0 | 4 | 0 | 0 | 0 | 1 |
| 107287 | 150 | survived | no | 5 | 400 | regional | 90 | 26 | 38 | 3 | 9 | 0 | 0 | 0 | 0 |
| 107288 | 150 | village-lost | no | 5 | 415 | regional | 94 | 16 | 15 | 2 | 9 | 0 | 0 | 0 | 0 |
| 107289 | 147 | village-lost | no | 5 | 335 | regional | 102 | 18 | 23 | 0 | 14 | 0 | 0 | 0 | 1 |
| 107290 | 136 | village-lost | no | 5 | 250 | regional | 70 | 18 | 18 | 0 | 4 | 0 | 0 | 0 | 0 |
| 107291 | 150 | survived | no | 4 | 199 | regional | 90 | 10 | 11 | 0 | 6 | 0 | 0 | 0 | 1 |
| 107292 | 150 | survived | no | 5 | 340 | regional | 86 | 18 | 21 | 1 | 8 | 0 | 0 | 0 | 0 |
| 107293 | 150 | survived | no | 4 | 199 | regional | 47 | 21 | 26 | 0 | 5 | 0 | 0 | 0 | 1 |
| 107294 | 150 | survived | no | 5 | 445 | regional | 85 | 17 | 20 | 1 | 5 | 0 | 0 | 0 | 0 |
| 107295 | 150 | survived | no | 5 | 320 | regional | 69 | 20 | 28 | 1 | 4 | 0 | 0 | 0 | 0 |
| 107296 | 137 | village-lost | no | 5 | 300 | regional | 69 | 17 | 23 | 0 | 3 | 0 | 0 | 0 | 0 |

The table is the same on both legs — every cell identical — because no
arrival ever occurred to let the legs diverge. (Analyzer `days` reads
151 on survived seeds vs the driver's 150; the compare's median
survival 150 is the driver's figure. No bar turns on the 1-day
difference.)

Totals per leg: kill-loot events 105, kill-loot searcasters 0, bundled
0, kill-loot volleys 0, contest searcaster grants 15, searcaster
volleys from ANY source 0, holder-days with cells 0, instrument errors
0, anchor `11e2d5d359cb` (prereg commit on 4266e6cce) on all 32 files.

## 2. Wall numbers (per leg — identical)

| Metric | ctl | arm |
| --- | --- | --- |
| Wins | 0/16 | 0/16 |
| National | 0/16 | 0/16 |
| Table | not instrumented by this driver (recorded, never faked) | same |
| Wave 5 unlocks | 10/16 | 10/16 |
| Wave 4 unlocks | 16/16 | 16/16 |
| Median survival | 150d | 150d |
| Max survival | 150d | 150d |
| Villages lost | 7/16 | 7/16 |

The scale wall still binds on this substrate — regional is the ceiling
on all 16 seeds (standing 125–475, best 475 on seed 107282), no
national, no wins — but the wall is not this arm's question; the band
exists to judge the bundle's arrival rate, and the wall numbers are
reported because the standing directive requires them every run.

Death-cause shares (ctl leg, 1269 deaths — arm identical): villager
combat 530, expedition 384, combat 205, the wild 66, monster 36,
starvation 7, thirst 4, ambush 6, a stranger 5, contest 5, a wound that
wouldn't close 5, Gavel 3, the arena 8, The Eulogy 2, wound_fever 1,
dehydration 1, Spool 1. Villages die fighting and travelling, not
starving — starvation is 7 of 1269 deaths (0.6%).

## 3. Why zero arrivals is a rate story, not an instrument failure

- **The instrument sees kill-loot drops.** 105 kill-loot events per leg
  were recorded with cells-at-arrival diffs; the drop distribution
  (ctl): deep_pocket_coat 9, hardlight_knife 9, hollow_bone_charm 8,
  phase_sling 6, medfoam_canister 6, contract_quill 5, wrong_bandage 5,
  gravity_hook 4, misers_eye 4, fusion_pellet 4, trackers_blind 4,
  audience_token 3, whisper_catchers 3, apology_padding 3,
  poultice_bandolier 3, spare_battery 3, anchors_locket 3, and 19 items
  at 1–2 each — 36 distinct items, no searcaster. The wrap is not
  blind; the searcaster simply never rolled.
- **Code-read (game.js `rollAlienLoot`, ~:47556):** a kill-loot
  searcaster needs (a) the loot chance gate to pass, (b) maxTier to
  reach 4 — via the LOOT TAPER up-roll (wave 2: 5%, wave 3: 10%, wave
  4: 15%, wave 5+: 20%) or a hard kill's tier4Chance — and (c) a uniform
  draw from the tier-4 kill pool. That pool is the 4 alien-origin
  tier-4 items (fusion_cell, starfall_lance, genesis_seed, searcaster)
  plus the 11 named `killItems[4]` — 15 candidates, so the searcaster
  is ~1/15 of tier-4 kill rolls. The GUNRATE ×4 searcaster weighting is
  contest-only (`loot.rewardSource === 'contest'`); kill-loot gets no
  weighting. At, say, ~10% of kill events reaching tier 4, ~10 tier-4
  rolls in 105 events, P(no searcaster) ≈ (14/15)^10 ≈ 50% — the
  observed zero is an ordinary outcome at this rate, not an anomaly.
- **The 88% estimate was built on one observation.** The fixture
  prereg's P(≥1 arrival) ≈ 88% assumed the grantrate rate (1 arrival
  in 8 seeds). One arrival in 8 seeds is also consistent with a much
  lower rate — and now the tally is 0 arrivals in 24 independent seeds
  (pilot 8 + this band 16), P ≈ 4% at the assumed 1/8 rate. The
  grantrate draw was the lucky one; the band's zero is the more
  informative number. A sim band alone cannot cheaply judge a ~1%
  per-event rate: at ~6.6 kill-loot events per seed, even a 48-seed
  band expects only ~3 arrivals.
- **Contest guns don't fire either.** 15 contest searcaster grants per
  leg, 0 searcaster volleys from any source. The guns exist in packs
  but never open a wave-4+ fight with a volley — same "supply never
  reaches a fight" shape as the kill-loot question, one step
  downstream. Filed as a finding (§8); it is outside this arm's bars
  and is not scored here.

## 4. Sense-test

There is no bundled-gun fight transcript in this band to read — nothing
arrived, nothing fired. The sense-test for the volley stands as the
fixture's (§2 of sim-killlootfixture-a.md): the transcripts read as a
real party fight, with the two narration gaps already filed (searcaster
volleys narrate as bow-and-arrow; "the sky" is the unnamed Herald).
What the band's per-seed records do show, read as village stories: seed
107284's village is gone by day 69 (55 deaths, standing 125 — the
weakest seed on the band); seed 107282 survives to 150 with standing
475 and 115 deaths, the strongest village, still regional. The 7 lost
villages all die at wave 4–5 with standing 125–415 — they reach the
door and die at it, which is the scale wall in one line.

## 5. Fixture re-verification on the rebased base

Because the rebase changed `src/js/fieldFights.js` (the volley path),
the fixture was re-run on 4266e6cce after the band: ctl 0 shots, arm 2
shots, vKill/11 rounds, holder alive, both legs; determinism re-runs
identical; compare verdict **GO**, all bars true — identical to the
fixture arm's judged legs except the `anchorCommit` line. The four
fixture JSONs were refreshed in place (1 line each) and are committed
with this arm. The fixture GO stands on the current base.

## 6. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof test 12/12, analyzer selftest
  17/17, both re-run on base 4266e6cce before any judged run. Green.
- **Rebase FIRST, not last (brief deviation, recorded in the prereg
  §3).** The brief said master had moved with "no src/js overlap with
  this arm" and to rebase before finishing. The diff 0ea9789d7..
  4266e6cce DOES touch src/js — fieldFights.js (DOORFLEE2 env-gated
  hold + ally3 fields), game.js (ALLYSLOT3 env-gated), party-wiring,
  villager-agency, villager-brain, win-plan. Both new levers are
  env-gated default-OFF and this substrate sets neither, so off-mode
  behavior is unchanged — but the volley path itself changed, so the
  arm rebased FIRST (fast-forward, no local commits, no conflicts) and
  ran the band on 4266e6cce. Proofs re-run on the new base before the
  band; the fixture re-verified after it (§5).
- **Band launch (4 detached processes, 2 legs × 2 seed-halves).** The
  first launch attempt's `&&`/`&` precedence backgrounded the mkdir
  chain and three of four redirections failed with "No such file or
  directory" — the host write flap flickering fresh-file creation
  (a `touch`ed log was momentarily invisible to a following `ls`).
  Relaunched one leg at a time with pre-created logs; all four drivers
  verified alive with the right MODE/KILLBUNDLE/SEEDS via
  /proc/<pid>/environ. Total band wall time ~35 min for 32 legs
  (ctl legs faster: villages lost early stop the clock).
- **RUN id / OUTDIR (prereg §5):** `RUN=killlootbundle-a` unchanged
  (analyzer + panel builder hardcode the RUN token in filenames); fresh
  OUTDIRs `perseed-killloot16-a-ctl` / `-arm`. The driver hardcodes
  `evidence/2026-11-21/<OUTDIR>`, so the corpus lives under 2026-11-21
  although this arm's evidence is 2026-11-22 — recorded, not moved.
- **Band-freshness overlap (prereg §4):** tier4pool-a's band
  107271–107282 overlaps this band at seeds 107281–107282 (different
  lever/substrate). Those two seeds behaved like the rest of the band
  (0 arrivals, survived 150d, regional) — no sign the overlap
  distorted anything; the within-band ctl-vs-arm contrast is
  unaffected in any case.
- **safe-commit index clobber (known class):** after the prereg commit
  the main index showed the committed file staged-as-deleted; repaired
  with the `git ls-tree -r HEAD | git update-index --add --index-info`
  pipe, verified empty status + empty diff HEAD + hash-object match.
  Same check applied after every commit in this arm.
- **Panel (§15):** `scripts/build-killlootbundle-panels-a.js` →
  `killloot16-a-panel-before/after.json.gz`; `scripts/balance-panel.js
  compare` → decision `review_required`, with 0 paired delta on every
  observed metric (wins 0 = 0, national 0 = 0, village deaths
  79.3125 = 79.3125, community loss 0.4375 = 0.4375). The
  review_required decision reflects the 0-win band — no win movement
  to judge — not a flagged regression: nothing moved, because the legs
  are identical.

## 7. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg committed `11e2d5d35`):
  bars 1, 2, 4, 5 pass; bar 3 is INCONCLUSIVE under the frozen
  zero-arrival rule. No bar was re-scored. The zero-arrival rule was
  written for exactly this outcome — the verdict is the rule firing,
  not a judgement call made after seeing the numbers.
- **The band was underpowered for the rate it tried to measure.** The
  88% estimate rested on a single grantrate observation; the honest
  per-event picture (0/105 kill-loot events, tier-4 kill pool 1/15
  searcaster, tier-4 rolls rare) says a 16-seed band had roughly a
  coin-flip chance of seeing even one arrival. A future arm that wants
  the arrival rate should EITHER size the band from the code-level
  rate (chance gate × tier-4 rate × 1/15) OR judge the lever on the
  tier-4 kill-roll rate directly. Re-running a wider band blind would
  be the same mistake with more seeds.
- **The volley bar (shots > 0) remains the right bar for "does it
  fire"** — and the fixture already passed it. This band's question
  was always the arrival rate, and the arrival rate is a roll-table
  question now, not a sim question.

## 8. Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-22 — items / supply — CONTEST GUNS NEVER FIRE
  EITHER: on the killloot16 band (107281–107296, 150d, competent),
  15 contest searcaster grants per leg arrived and 0 searcaster
  volleys fired from any source — the guns sit in packs through wave-4
  and wave-5 fights without ever opening one. Same "supply never
  reaches a fight" shape as the kill-loot question, one step
  downstream (holder/equip/fight-entry, not the bundle). Next step:
  trace one granted gun's life (holder, equipped days, fights entered
  while held) before proposing a lever. (sim-killloot16-a,
  evidence/2026-11-22/sim-killloot16-a.md)

## Files

- Prereg: `evidence/2026-11-22/sim-killloot16-a-prereg.md`
  (`11e2d5d35`)
- Evidence: `evidence/2026-11-22/sim-killloot16-a.md` (this file)
- Analysis: `evidence/2026-11-22/killloot16-a-analysis.json`
  (analyzer `--compare` output, verdict INCONCLUSIVE)
- Panel (§15): `evidence/2026-11-22/killloot16-a-panel-before.json.gz`,
  `killloot16-a-panel-after.json.gz`, `killloot16-a-panel.json`,
  `killloot16-a-panel.md` (decision review_required, 0 delta everywhere)
- Corpus: `evidence/2026-11-21/perseed-killloot16-a-ctl/` (16 files),
  `evidence/2026-11-21/perseed-killloot16-a-arm/` (16 files)
- Leg logs: `evidence/2026-11-22/killloot16-a-legs-ctl-1.log`,
  `-ctl-2.log`, `-arm-1.log`, `-arm-2.log`
- Fixture re-verification (refreshed 1 line each, anchor only):
  `evidence/2026-11-21/killlootfixture-a-ctl.json`,
  `killlootfixture-a-arm.json`, `killlootfixture-a-ctl-rerun.json`,
  `killlootfixture-a-arm-rerun.json` (compare verdict GO on 4266e6cce)

## Run identity

- **Base:** worktree HEAD `4266e6cce` after fast-forward rebase from
  `0ea9789d7` (no conflicts); branch `sim-killloot16-a`; prereg commit
  `11e2d5d35`.
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17 (both
  on 4266e6cce).
- **Band (judged):** 4 detached processes, 8 seeds each:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl|arm
  OUTDIR=perseed-killloot16-a-ctl|arm SEEDS=<half> RUN=killlootbundle-a
  node scripts/killlootbundle-driver-a.js` (arm legs + `KILLBUNDLE=1`).
  32/32 legs complete, 0 instrument errors.
- **Compare (judged):** `node scripts/analyze-killlootbundle-a.js
  --compare evidence/2026-11-21/perseed-killloot16-a-ctl
  evidence/2026-11-21/perseed-killloot16-a-arm --out
  evidence/2026-11-22/killloot16-a-analysis.json` → verdict
  INCONCLUSIVE, exit 0.
- **Panel (§15):** `node scripts/build-killlootbundle-panels-a.js --out
  evidence/2026-11-22/killloot16-a-panel --before
  evidence/2026-11-21/perseed-killloot16-a-ctl --after
  evidence/2026-11-21/perseed-killloot16-a-arm --seeds
  107281,...,107296` then `node scripts/balance-panel.js compare
  --before ...-before.json.gz --after ...-after.json.gz --out
  evidence/2026-11-22/killloot16-a-panel` → review_required, 0 delta.
- **Fixture re-verification:** four legs + `--compare` on 4266e6cce →
  GO (see §5).
