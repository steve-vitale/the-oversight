# sim-killrate-a — KILL-LOOT SEARCASTER ARRIVAL, SIZED FROM THE CODE RATE

- Arm: sim-killrate-a, Loop A run fleshout-20261122T0815Z, DIAG/code-read arm.
- Axis: scale-onramp · Finding #2649.
- Base: worktree HEAD `dbab0832e` (prereg `842b6e8e7` + proof tests
  `dbab0832e`); branch `sim-killrate-a`. No game-code change in this arm.
- Prereg: `evidence/2026-11-22/sim-killrate-a-prereg.md` (content frozen
  08:50 UTC, caller-count correction 08:56, committed `842b6e8e7` at
  09:33 — commit delayed by the write flap, see §7; no judged numbers
  were observed before the commit, and the judged band launched after it).
- Instrument: `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from the
  killloot16 arm; tier tally `scripts/test-killrate-analysis-a.js`.
- Horizon: 150d death-aware. Seeds: 107313–107320 (8, fresh — zero hits
  in the prereg/evidence grep). Policy: competent (verbatim). Single
  ctl leg (KILLBUNDLE unset — this arm measures the roll rate, not the
  bundle). Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## Verdict: GO — code rate quantified, band-observed tier-4 rate reported, sized band delivered (49 seeds pooled)

The code prediction and the band observation reconcile — but through
the explanation clause, not a comfortable point match, and the
evidence says so plainly. The fresh band ran HOT: 12 tier-4 rolls in
88 drops (13.6%), 3.1× the prereg's 4.4% point prediction and above
its 1.2–9.0% range. The discrepancy is explained from code + data:
the point prediction conditioned on the prior band's tier-3-base
share of drops (24.8%), but that share is a band-varying sim outcome,
not a code constant — the fresh band's measured share is 39.8%, and
conditioning on it the code predicts 2.0–14.4%, with the observed
13.6% inside. The implied effective up-rate (34.3%) sits inside the
per-wave range (5–36.25%) and matches a wave-4-heavy tier-3 kill mix.
Pooled with the prior band's ctl leg (17 tier-4 rolls in 193 drops,
8.8%), the rate is within 2× of the point prediction — by the
narrowest margin (bound 8.82%, observed 8.81%). The searcaster count
is 0 in 193 pooled drops, consistent with the measured rate
(P(0) = 0.32 at the measured per-drop rate; 0.57 at the point rate) —
not a deficit, not a surprise.

**Sized band (primary deliverable): 49 seeds** for P(≥1 kill-loot
searcaster arrival) ≥ 90%, computed from the pooled measured rate
(tier-4 8.8% × 1/15 per drop, 8.04 drops/seed → 4.6% per seed).
Bounds: 23 seeds from the fresh band alone (optimistic — it ran hot),
120 from the prereg point prediction (conservative). Direct judgment
on the measured rate: a kill-loot searcaster arrives about once per
170 drops, roughly once per 22 seeds; a 16-seed band was never the
right instrument for this question, and neither is an 8-seed band —
the rate is a roll-table quantity, and the table now says it plainly.

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Code rate quantified (pool counted, gates tabulated, GUNRATE contest-only) | all in prereg §2 + proof test green | pool 15 (4 alien + 11 killItems[4], disjoint), searcaster 1/15; taper 5/10/15/20%, tier4Chance 0.25 on 9 W4 tier-3 defs, chance gate 0.08–0.15; GUNRATE contest-only confirmed; proof test 36/36 | ✅ |
| 2. Instrument validity (proof 12/12 + selftest 17/17 on this base; 0 instrument errors on all 8 files) | all must hold | proof 12/12, selftest 17/17 re-run on dbab0832e; 0 errors on 8/8 seed files | ✅ |
| 3. Band-observed tier-4 kill-roll rate reported | must be reported | fresh 12/88 = 13.6% (per-seed table §1); pooled 17/193 = 8.8% | ✅ |
| 4. Reconciliation within 2x or explained (fresh tier-4 rate in 2.2–8.8%, OR explained; searcaster count Poisson-consistent, P ≥ 0.05) | must hold for GO | fresh 13.6% is 3.1× the point — outside 2× — BUT explained (§4): conditioned on the fresh band's measured tier-3-base share (39.8%) the code predicts 2.0–14.4%, observed inside; implied up-rate 34.3% in the per-wave range; pooled 8.81% within 2× (bound 8.82%) by a hair; searcaster 0/193, P(0) = 0.32 at the measured rate | ✅ (via explanation) |
| 5. Sizing or direct judgment delivered | one must be delivered | sized band 49 seeds (pooled) + direct rate judgment (§5) | ✅ |

## 1. Per-seed table (analyzer + tier tally)

| Seed | Days | End | Won | Wave | Standing | Rank | Deaths | Contests | Prize rolls | Contest sear grants | Kill-loot events | Tier-4 rolls | Kill-loot sear | Sear volleys |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107313 | 150 | survived | no | 5 | 585 | regional | 79 | 21 | 28 | 1 | 3 | 0 | 0 | 0 |
| 107314 | 150 | survived | no | 5 | 345 | regional | 108 | 18 | 26 | 2 | 19 | 4 | 0 | 0 |
| 107315 | 150 | survived | no | 5 | 300 | regional | 106 | 23 | 30 | 3 | 13 | 1 | 0 | 0 |
| 107316 | 128 | village-lost | no | 5 | 480 | regional | 161 | 16 | 21 | 2 | 19 | 3 | 0 | 2 |
| 107317 | 150 | survived | no | 4 | 199 | regional | 81 | 20 | 23 | 0 | 6 | 0 | 0 | 0 |
| 107318 | 127 | village-lost | no | 4 | 150 | regional | 71 | 11 | 14 | 1 | 10 | 1 | 0 | 0 |
| 107319 | 150 | survived | no | 5 | 475 | regional | 155 | 19 | 22 | 0 | 15 | 3 | 0 | 0 |
| 107320 | 129 | village-lost | no | 4 | 199 | regional | 74 | 15 | 22 | 1 | 3 | 0 | 0 | 0 |

Totals: 88 kill-loot events, 12 tier-4 rolls (13.6%), 0 kill-loot
searcasters, 10 contest searcaster grants, 2 searcaster volleys (4
shots, both on seed 107316, both from contest guns — §6), 835 deaths,
1 starvation death, 0 instrument errors. (Analyzer `days` reads 151
on survived seeds vs the driver's 150; same 1-day quirk as
killloot16. No bar turns on it.)

Tier mix, fresh band: tier 1: 14, tier 2: 39, tier 3: 23, tier 4: 12.
Tier-4 drops (day, item): (11, void_cloak), (22, hearthstone_amulet),
(25, undying_heart), (33, warlords_standard), (34, bloodplate), (38,
causality_lens), (39, lifespring_vial), (52, consensus_crown), (66,
lifespring_vial), (72, ironfist_wraps), (93, starfall_lance), (139,
warlords_standard). Eleven are `killItems[4]` members; one —
starfall_lance, day 93 — is an alien-origin tier-4 item, so the
alien side of the pool does draw in kill loot, as modeled.

## 2. Wall numbers

| Metric | This band (8 seeds) |
| --- | --- |
| Wins | 0/8 |
| National | 0/8 |
| Table | not instrumented by this driver (recorded, never faked) |
| Wave 5 unlocks | 5/8 |
| Wave 4 unlocks | 8/8 |
| Median survival | 150.5d (analyzer gameDays; driver-days median 139.5d — see §1 note) |
| Max survival | 150d |
| Villages lost | 3/8 |

The scale wall still binds — regional is the ceiling on all 8 seeds
(standing 150–585, best 585 on seed 107313), no national, no wins —
but the wall is not this arm's question; the numbers are reported
because the standing directive requires them every run.

## 3. Code-read arithmetic (prereg §2, proved in scripts/test-killrate-a.js, 36/36)

- **Pool = 15.** Alien-origin tier-4 items: 4 (fusion_cell,
  starfall_lance, genesis_seed, searcaster). `killItems[4]`: 11, all
  carrying `lootTier: 4`, disjoint from the alien four. Searcaster
  draw = 1/15 per tier-4 kill roll. The `fusion_pellet` exclusion
  cannot shrink the pool (the pellet is not tier 4).
- **Chance gate** by monster def: W1 0.08–0.12, W2 0.12–0.15, W3
  0.15, W4 0.10–0.12, W5 0.08–0.10; W6 network defs 0.
- **Taper** (W2+, non-apex, kill paths only): up W2 5%, W3 10%, W4
  15%, W5+ 20%; down flat 5%, checked after up, never competing.
- **tier4Chance**: only the 9 W4 tier-3 defs, all 0.25, stacking after
  the taper: P(tier 4 | W4 tier-3 kill) = 1 − 0.85 × 0.75 = 36.25%.
- **Per-wave P(tier 4 | tier-3-base kill, gate passed):** W2 5%, W3
  10%, W4 36.25%, W5 20%; W1 non-apex 0%. Apex defs (gallowdeer,
  moderator, herald, cancellation/editor/finale) are tier 4 direct.
- **GUNRATE ×4 is contest-only** (code gate `rewardSource ===
  'contest'`); kill-loot gets no weighting. TIER4POOL likewise
  contest-only and not in this substrate.
- **Kill-loot events come from four kill paths**, all rolling the
  same table: patrol (`game.js` ~:8485), wild-encounter
  (`game.js` ~:21613), expedition (`villager-agency.js` ~:793),
  lingerer-sortie (`havenGrowth.js:928`). (The prereg's first draft
  said sortie-only; the proof test caught the error and the prereg
  was corrected before the judged band.)

## 4. Reconciliation — code vs band

| Quantity | Code prediction | Fresh band | Prior band (ctl) | Pooled |
| --- | --- | --- | --- | --- |
| Kill-loot events | — | 88 | 105 | 193 |
| Drops / seed | 6.56 (prior) | 11.00 | 6.56 | 8.04 |
| Tier-3-base share of drops | 24.8% (prior) | 39.8% | 24.8% | 31.6% |
| Tier-4 rate / drop | 4.4% point (1.2–9.0% range) | **13.6%** | 4.8% | **8.8%** |
| Implied effective up-rate | 17.8% (uniform W2–W5) | 34.3% | 19.2% | 27.9% |
| Searcaster / drop | 0.29% point | 0% (0/88) | 0% (0/105) | 0% (0/193) |

Why the fresh band ran hot — the explanation, in two parts:

1. **The tier-3-base share is a sim outcome, not a code constant.**
   The point prediction (4.4%) multiplied the prior band's share
   (24.8%) by the uniform-mix up-rate (17.8%). The fresh band's
   share is 39.8% — its villages fought more, later, and higher:
   11.0 drops/seed vs 6.56, W5 on 5/8 seeds, and tier-3-base kills
   are what late, high-wave fighting produces. Conditioning on the
   fresh share, the code predicts 39.8% × [5%, 36.25%] = 2.0–14.4%,
   and the observed 13.6% is inside that range.
2. **The implied up-rate is in-model.** 34.3% sits inside the
   per-wave range (5–36.25%) and just under the W4 value (36.25%) —
   exactly what a wave-4-heavy tier-3 kill mix gives. The prior
   band's 19.2% sits near the uniform-mix point. Pooled, 27.9% is a
   W4/W5-weighted mix, which is what 150-day sims produce: villages
   spend most of their killing days at waves 4–5 once unlocked. The
   uniform W2–W5 mix in the prereg point was a crude prior; the
   mechanism (per-wave conditionals) reconciles in all three
   columns, and the pooled tier-4 rate (8.8%, Wilson 95% CI
   5.6–13.7%) overlaps the predicted range (1.2–9.0%).

Two honest caveats. First, the pooled rate is within 2× of the point
only by the narrowest margin (2× bound 8.82%, observed 8.81%) — the
GO on bar 4 rests on the explanation, not on a comfortable point
match, and the fresh band alone (3.1× the point) would have failed a
point-only test. Second, band-to-band variation in both the share
(24.8% → 39.8%) and the kill volume (6.56 → 11.0 drops/seed) is
large, so the sizing below carries wide uncertainty. The early
tier-4 drops (days 11–38, four of them) are not individually
attributed in this corpus — no mdef is recorded on kill-loot
events — but the only in-model sources at those days are apex kills
(gallowdeer W1 / moderator W2, tier 4 direct) or a W2 tier-3 5%
up-roll; no code path leaks tier 4 at wave 1 (the cap, the taper's
wave ≥ 2 gate, and the tier4Chance census were all re-verified in
the proof test).

## 5. Sized band + direct judgment on the measured rate

- **Pooled (primary):** tier-4 rate 17/193 = 8.81%; per-drop
  searcaster rate 8.81% / 15 = 0.587%; drops/seed 8.04; P(≥1
  arrival per seed) = 1 − (1 − 0.00587)^8.04 = 4.6%; **seeds for
  P(≥1) ≥ 90% = 49**.
- Fresh-only (optimistic): 12/88 = 13.64%, 11.0 drops/seed → 23 seeds.
- Prereg point (conservative): 4.4%, 6.56 drops/seed → 120 seeds.
- **Direct judgment:** a kill-loot searcaster arrives about once
  per 170 drops, roughly once per 22 seeds at the pooled rate. The
  0/193 observation is consistent with that rate (expected ≈ 1.13
  arrivals, P(0) = 0.32). The arrival question is answered by the
  roll table now: any future band that wants a kill-loot arrival
  should run ~49 seeds (pooled sizing), not 8 or 16 — and should
  expect most of the wait to be the tier-4 roll, not the 1-in-15 draw.

## 6. Sense-test — the contest guns DID fire on this band

Seed 107316's village is lost on day 128 (161 deaths, standing 480)
after two contest searcaster grants (days 88 and 101). Its
searcaster fired twice: day 96 vs a wave-4 Reunion pack (2 shots, 2
hits, 135 damage) and day 116 vs a wave-4 Eulogy (2 shots, 2 hits,
133 damage). Fifteen other searcaster-carrying fights on the same
seed fired 0 shots — including wave-4/5 fights on days 110, 115,
117 — the gun goes dry after its cells are spent (2 cells per grant
is the shape; the holder fired exactly 2 shots per grant window).
This qualifies the killloot16 finding ("contest guns never fire
either", 0 volleys from 15 grants): on this band they fire, but they
fire twice and then are paperweights. Filed as a finding (§9), not
scored — it is outside this arm's bars. The village's story is the
familiar one: it reaches wave 5, dies at the door (expedition 76,
villager combat 36, combat 22 of its 161 deaths).

## 7. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof 12/12, selftest 17/17,
  `test-killrate-a.js` 36/36, `test-killrate-analysis-a.js` 14/14 —
  all re-run on base dbab0832e before the judged band. Green.
- **Write flap — long window, then a machine replacement cleared
  it.** From ~08:30 UTC, every git write failed (hash-object,
  read-tree, safe-commit ×3, heartbeat ×3) with EPERM on fresh
  files; a 300KB probe write failed at 09:13–09:29 in 9 consecutive
  2-minute rounds. A runtime restart / machine replacement at
  ~09:31 cleared it (uptime 1 min at 09:32); 300KB write, git
  hash-object, and heartbeat all passed immediately after.
- **First band attempt aborted (09:04–09:14, NOT judged).** Launched
  before the prereg commit landed (flap-blocked), 2 legs × 4 seeds;
  all 4 started seeds fell back to stdout (`writeRobust` exhausted
  480 retries per file) and the fallback dumps were truncated by the
  output channel mid-JSON, so no per-seed file and no usable
  measurement survived — the legs were killed, the 0-byte tmp files
  removed, and nothing from that attempt is counted anywhere in
  this evidence. The prereg file itself was frozen at 08:50 (caller
  correction 08:56) and unchanged thereafter; its commit
  (`842b6e8e7`, 09:33) landed after the aborted attempt but BEFORE
  the judged relaunch, and no judged numbers were observed before
  the commit — the only 107313 numbers seen pre-commit were
  truncated census bulk with no kill-loot events, no tier counts,
  and no summary line. Recorded here so the freeze order is
  auditable, not silently smoothed over.
- **safe-commit index clobber (known class, twice).** After each of
  the two commits the main index showed the committed files
  staged-as-deleted; repaired both times with the `git ls-tree -r
  HEAD -- <paths> | git update-index --add --index-info` pipe,
  verified empty status + empty diff HEAD + hash-object match
  (prereg blob `a549ecde…`).
- **RUN / OUTDIR:** `RUN=killlootbundle-a` unchanged (analyzer
  hardcodes it); fresh OUTDIR `perseed-killrate-a-ctl`. Driver
  hardcodes `evidence/2026-11-21/<OUTDIR>` — corpus under
  2026-11-21, evidence under 2026-11-22. Recorded, not moved.
- **Band launch (judged, post-flap):** 2 runtime-tracked processes,
  4 seeds each, both exit 0, ~7–8 min total; 8/8 files landed on
  disk, anchor `dbab0832e` on all 8. Heartbeat re-established after
  the restart.
- **No panel (§15) built:** single ctl leg, no before/after — the
  balanced-panel compare needs two legs. The analyzer `--dir`
  output + tier tally are the judged instruments; the wall numbers
  above are the scale check.

## 8. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg content 08:50,
  committed 09:33, judged band launched after): all five bars pass;
  bar 4 passes via its frozen explanation clause, with the pooled
  number marginal — no bar was re-scored. The searcaster count was
  never a GO bar (expected ≈ 0.16 arrivals on the fresh band at the
  point rate, 0.80 at the measured rate), and 0 is consistent under
  both.
- **The point prediction's weak input was the tier-3-base share.**
  It was taken from a single 16-seed band (24.8%) and treated as
  stable; the fresh band shows it moving 24.8% → 39.8% between
  bands. A future prediction should carry the share as a range (or
  condition on the observed share, as §4 does) rather than freezing
  one band's value as the point. The per-wave conditionals
  themselves — the code part — held in every column.
- **The fresh band ran hot in two ways at once** (tier-4 rate 3.1×
  the point AND drops/seed 11.0 vs 6.56). Either alone would move
  the sizing; together they cut it from 120 to 23 seeds
  fresh-only. The pooled 49 is the honest middle, and the 23–120
  spread is the uncertainty, not noise to be averaged away.

## 9. Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-22 — items / supply — CONTEST GUNS FIRE TWICE,
  THEN GO DRY: on the killrate band (107313–107320, 150d,
  competent), seed 107316's contest searcaster fired 2 volleys (4
  shots, 4 hits, ~134 dmg each) across two grants, and 15 other
  searcaster-carrying fights on the same seed fired 0 shots — the
  gun spends its 2 cells and then is a paperweight even in wave-4/5
  fights. Qualifies the killloot16 finding (0 volleys from 15
  grants): guns do reach fights and do fire, but the ammo, not the
  arrival, is now the binding constraint on the contest path. Next
  step: check what cells a contest grant actually carries and
  whether holders re-arm (crafting? corpse takes? trade) before
  proposing a lever. (sim-killrate-a,
  evidence/2026-11-22/sim-killrate-a.md)
- [open] 2026-11-22 — items / loot — EARLY TIER-4 KILL DROPS NEED
  APEX ATTRIBUTION: four tier-4 kill-loot drops landed on days
  11–38 across the fresh + prior bands (void_cloak d11,
  hearthstone_amulet d22, undying_heart d25, warlords_standard
  d33) — before wave 4 exists, so in-model they must be apex kills
  or rare W2 up-rolls, but killLootEvents carry no mdef, so no
  per-drop attribution is possible from this corpus. Next step: a
  driver wrap that records the mdef on villagerKillLoot calls, or a
  one-off apex-kill census, before anyone tunes the taper on the
  strength of the early cluster. (sim-killrate-a,
  evidence/2026-11-22/sim-killrate-a.md)

## Files

- Prereg: `evidence/2026-11-22/sim-killrate-a-prereg.md`
  (`842b6e8e7`)
- Evidence: `evidence/2026-11-22/sim-killrate-a.md` (this file)
- Proof tests: `scripts/test-killrate-a.js` (36/36),
  `scripts/test-killrate-analysis-a.js` (14/14) (`dbab0832e`)
- Analysis: `evidence/2026-11-22/killrate-a-analysis.json`
  (analyzer `--dir` output), `evidence/2026-11-22/killrate-a-tally.json`
  (tier tally, sizedBandFromMeasured 23 fresh-only)
- Corpus: `evidence/2026-11-21/perseed-killrate-a-ctl/` (8 files,
  anchor `dbab0832e`)
- Leg log: `evidence/2026-11-22/killrate-a-legs-ctl.log` (8 judged
  summary lines, both legs, exit 0)

## Run identity

- **Base:** worktree HEAD `dbab0832e` (master `e67224635` + prereg
  `842b6e8e7` + proof tests `dbab0832e`); branch `sim-killrate-a`.
  origin/master `503d048a8` is an ancestor of `e67224635` — no
  rebase was needed (recorded in the prereg §3).
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17;
  `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14 (all on
  dbab0832e).
- **Band (judged):** 2 processes, 4 seeds each:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl
  OUTDIR=perseed-killrate-a-ctl SEEDS=107313,107314,107315,107316 |
  107317,107318,107319,107320 RUN=killlootbundle-a
  node scripts/killlootbundle-driver-a.js`. 8/8 legs complete, 0
  instrument errors, both processes exit 0.
- **Analysis (judged):** `node scripts/analyze-killlootbundle-a.js
  --dir evidence/2026-11-21/perseed-killrate-a-ctl --out
  evidence/2026-11-22/killrate-a-analysis.json` → exit 0;
  `node scripts/test-killrate-analysis-a.js --dir <same> >
  evidence/2026-11-22/killrate-a-tally.json` → exit 0.
