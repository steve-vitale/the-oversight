# sim-killrate-a — PREREG (frozen)

**Arm:** sim-killrate-a · **Loop A run:** fleshout-20261122T0815Z
**Axis:** scale-onramp · **Finding:** #2649 (kill-loot bundle — searcaster arrival question)
**Type:** DIAG / code-read + sized band (no game-code change expected)
**Base:** worktree `~/workspace/worktrees/sim-killrate-a`, branch
`sim-killrate-a`, HEAD `e67224635`
**Frozen:** 2026-11-22 ~08:50 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + sim-killloot16-a §7)

The kill-loot bundle's fixture is GO and the 16-seed band saw 0
kill-loot searcaster arrivals in 105 kill-loot events per leg. The
killloot16 evidence says the next step is NOT a wider band blind — it
is a code-level read of the tier-4 kill-roll rate (chance gate ×
tier-4 rate × 1/15), which predicts the arrival rate without sims; a
sim band sized from that prediction follows if the number says it is
reachable at all. This arm does that read, then measures one fresh
8-seed band to test the prediction, and delivers a sized band (or a
direct judgment on the measured tier-4 kill-roll rate).

## 2. Code prediction (computed from code + data on this base, BEFORE the judged band)

Canon: docs/CANON.md read; docs/CONTESTS.md read (prize funnel: the
2-cell bundle shape is taken from the contest-prize code). **No canon
doc covers the kill-loot roll table** — said here rather than
inventing canon. The numbers below are read from
`src/js/game.js` (`rollAlienLoot` :47556, `villagerKillLoot` :8174),
`src/data/reward-economy.json`, `src/data/items.json`,
`src/data/monsters.json` on base `e67224635`; the proof test
`scripts/test-killrate-a.js` re-derives each from the source data.

### 2a. The roll, step by step

A villager kill calls `villagerKillLoot(vid, mdef)` from FOUR kill
paths, all rolling the same table with the same mdef (the driver's
wrap counts all four — the denominator is every villager-kill drop):
patrol kills (`game.js` ~:8485, 'patrol combat'), wild-encounter
kills (`game.js` ~:21613, 'villager combat'), expedition kills
(`villager-agency.js` ~:793, 'agency'), and lingerer-sortie leader
kills (`havenGrowth.js:928`, 'sortie'). (CORRECTION 08:56 UTC, before
any judged run: the first draft of this prereg said havenGrowth was
the only caller — the proof test caught the error; the other three
paths were hidden by a bad grep filter in the earlier arm's notes.)
The scholar's own kills roll through `rollAlienLoot` at
`game.js:47900` and are NOT kill-loot events — the driver wraps
`villagerKillLoot` only.

1. **Chance gate.** `loot.chance` per monster def (census of all 72
   defs in `monsters.json`): W1 0.08–0.12, W2 0.12–0.15, W3 0.15,
   W4 0.10–0.12, W5 0.08–0.10, W6 network defs 0 (drop nothing by
   design). A failed gate returns null — no drop, no event.
2. **Tier cap.** W1 non-apex caps at tier 2 (veterans tier 3, only
   after wave 2 unlocks). Apex defs keep their data tier.
3. **LOOT TAPER** (W2+, non-apex, kill paths only): one extra draw;
   up-rates W2 5%, W3 10%, W4 15%, W5+ 20% (`maxTier + 1`, cap 4);
   down is a flat 5% and is checked AFTER up, so it never competes
   with the up-roll.
4. **tier4Chance** (W4 tier-3 defs only — 9 defs, all 0.25): a second,
   independent draw that sets `maxTier = 4`. Runs after the taper, so
   it stacks: P(tier 4 | W4 tier-3 kill, gate passed) =
   1 − (1 − 0.15)(1 − 0.25) = **36.25%**.
5. **Pool draw.** Uniform over the tier-`maxTier` kill pool:
   alien-origin items of that tier PLUS `killItems[tier]` members
   (both must carry that `lootTier` in `items.json`).

### 2b. The tier-4 kill pool — counted, not assumed

- Alien-origin tier-4 items in `items.json`: **4** —
  `fusion_cell`, `starfall_lance`, `genesis_seed`, `searcaster`.
- `killItems[4]` in `reward-economy.json`: **11** — `bloodplate`,
  `void_cloak`, `ironfist_wraps`, `consensus_crown`,
  `first_steps_boots`, `hearthstone_amulet`, `undying_heart`,
  `beastcall_horn`, `causality_lens`, `lifespring_vial`,
  `warlords_standard` — all 11 carry `lootTier: 4` in `items.json`.
- The two sets are disjoint. **Pool = 15.** The searcaster is 1 of
  15 draws from a tier-4 kill roll. (The `fusion_pellet` exclusion
  cannot shrink this pool: the pellet is not a tier-4 item.)
- **GUNRATE ×4 weighting is contest-only — confirmed from code:**
  the block fires only when `loot.rewardSource === 'contest'`
  (`game.js`, GUNRATE block). Kill-loot gets no weighting. TIER4POOL
  (+10 copies) is likewise contest-only; it is not in this arm's
  substrate at all.

### 2c. P(tier 4 | drop) — per-wave conditionals (exact) + point prediction

Per-wave P(tier 4 | successful drop, tier-3-base kill): W2 **5%**,
W3 **10%**, W4 **36.25%**, W5 **20%**. W1 non-apex: **0%**. Apex
defs are tier 4 direct (`gallowdeer` W1, `moderator` W2, `herald`
W4, `cancellation`/`editor`/`finale` W5) — rare, unmodeled term.

Point prediction: the tier-3-base share of drops is ≈ 24.8%
(prior band: 21 tier-3 + 5 tier-4 drops out of 105 — a tier-4 drop
IS a tier-3-base kill that up-rolled, so 26/105 is the base share);
the effective up-rate across W2–W5 tier-3 kills, uniform mix, is
(5 + 10 + 36.25 + 20) / 4 ≈ **17.8%**. Predicted tier-4
kill-roll rate = 24.8% × 17.8% ≈ **4.4% per drop** (range from
the per-wave spread: 24.8% × 5% … 24.8% × 36.25% = **1.2–9.0%**).

### 2d. Predicted P(kill-loot searcaster)

- Per drop: 4.4% × 1/15 ≈ **0.29%** (range 0.08–0.60%).
- Per seed at 6.56 drops/seed (105/16 prior band): P(≥1) ≈ **1.9%**
  (range 0.5–3.9%).
- Seeds for P(≥1 arrival) ≥ 90%, point: N = ln(0.1)/ln(1−0.019) ≈
  **120 seeds** (range 59–439). A 16-seed band had only ≈ 28%
  chance of seeing even one arrival — the killloot16 zero is the
  EXPECTED outcome at this rate (P(0 in 16 seeds) ≈ 72%), not an
  anomaly. The prior band's own observed tier-4 rate, 5/105 =
  4.76%, sits inside the predicted range and near the point — a
  pre-existing consistency check, not the judged test.

## 3. Base note — no rebase needed (verified)

`git ls-remote` gives origin/master `503d048a8` (version bump
87c8a133a-20261122-055241); `503d048a8` IS an ancestor of this
worktree's HEAD `e67224635` (Loop A 0215Z adoption record), i.e.
local master is AHEAD of origin/master by the unshipped adoption
commits. There is nothing to fast-forward to. Base stands.

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107313–107320 (8 seeds).** Grepped every prereg under
  `evidence/*/sim-*-prereg.md` and every `evidence/*/sim-*.md` for
  the standalone tokens 107313–107320. **Zero hits — no collision.**
- Forbidden / used bands named in prior preregs do not overlap:
  106751–106766, 107221–107228, 107191–107198, 107131–107138,
  107111–107118, 107091–107098, 107081–107088, 107051–107058,
  107021–107028, 107261–107268 (killlootbundle pilot),
  107281–107296 (killloot16), 107297–107304 (tier4gate pilot),
  107237–107248 (grantrate / shelterdraft), 107271–107282
  (tier4pool). Nearest used band ends at 107304; this band starts
  9 seeds later.

## 5. Instrument (frozen design — reuse unchanged)

- `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from the
  killloot16 arm (proof 12/12, analyzer selftest 17/17 — re-run on
  this base before the judged band, §7).
- **Single ctl leg only** (MODE=ctl, KILLBUNDLE unset): this arm
  measures the roll rate, not the bundle. RUN token
  `killlootbundle-a` UNCHANGED (analyzer `loadDir` regex + panel
  builder hardcode it); fresh OUTDIR `perseed-killrate-a-ctl`.
  Driver hardcodes `evidence/2026-11-21/<OUTDIR>` — corpus lands
  under 2026-11-21 although this arm's evidence is 2026-11-22;
  recorded, not moved.
- **Tier tally:** the analyzer does not split drops by loot tier, so
  the tier-4 rate is tallied from the corpus by
  `scripts/test-killrate-analysis-a.js` (lootTier lookup in
  `src/data/items.json`; a drop's lootTier IS its roll tier — the
  tier-4 pool is never empty, so no fallback tier can occur at
  tier 4, and lower-tier pools are never empty either).
- **Parallelism:** 2 detached processes × 4 seeds. If the run
  window ends mid-band, corpus + progress note are committed and
  the exact done-seed list reported (coordinator adopts; nothing
  faked or extrapolated).

## 6. Definitions (frozen)

- **Kill-loot event:** a `villagerKillLoot` call returning a non-null
  `dropId` (driver definition — a successful alien-loot drop from a
  villager kill). Failed chance gates are not events.
- **Tier-4 kill roll:** a kill-loot event whose `dropId` carries
  `lootTier: 4` in `items.json`.
- **Tier-4 kill-roll rate:** tier-4 kill rolls / kill-loot events.
- **Kill-loot searcaster arrival:** a kill-loot event with
  `dropId === 'searcaster'`.
- **Sized band:** smallest N with P(≥1 arrival in N seeds) ≥ 90%,
  computed as N = ceil(ln(0.1) / ln(1 − p_seed)) with p_seed =
  1 − (1 − p_drop)^dropsPerSeed, from the MEASURED p_drop and
  drops/seed (pooled with the prior band's 105 events if the fresh
  band alone is too thin to move the estimate — pooled N stated
  explicitly).

## 7. Frozen bars (judge: analyzer on the fresh band + tier tally)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Code rate quantified** — pool counted from data (15, searcaster 1/15), taper + tier4Chance + chance gate tabulated by wave, GUNRATE contest-only confirmed from code | all in prereg §2 + proof test green |
| 2 | **Instrument validity** — proof test 12/12 + analyzer `--selftest` 17/17 re-run on this base; 0 instrument errors on all 8 seed files | all must hold |
| 3 | **Band-observed tier-4 kill-roll rate reported** — fresh-band tier-4 rolls / kill-loot events, with per-seed table | must be reported |
| 4 | **Reconciliation within 2x or explained** — fresh-band tier-4 rate within 2× of the 4.4% point prediction (2.2–8.8%), OR the discrepancy is explained from code/data; searcaster count judged by Poisson consistency with the predicted per-drop rate (observing 0 must have P ≥ 0.05 under the prediction) | must hold for GO |
| 5 | **Sizing or direct judgment delivered** — sized band (seeds for P(≥1) ≥ 90%) computed from the measured rate, OR a direct judgment on the measured tier-4 kill-roll rate with a frozen bar (e.g. rate too low for any feasible band) | one must be delivered |

GO = all five bars pass. NO-GO = tier-4 rate disagrees with the code
prediction unexplained (bar 4), or no sizing/judgment delivered
(bar 5). A miss is NO-GO, never re-scored against a friendlier metric
mid-run (§14). The searcaster count itself is NOT a GO bar: at the
predicted rate the fresh 8-seed band expects ≈ 0.16 arrivals, so 0
is the likely outcome and is consistent, not a failure.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17 — both re-run on base e67224635. Plus
  `node scripts/test-killrate-a.js` (code-read proof) and
  `node scripts/test-killrate-analysis-a.js` (tally + sizing
  arithmetic on fixed inputs) — green before the band.
- **Band (judged):** 8 seeds, **107313–107320**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). One ctl leg. Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `KILLBUNDLE` unset;
  `LEND` unset; `PRESENCE` unset.
- **Per-seed table + tier tally** in the evidence file from the
  analyzer `--dir` output + tier tally script.
- **Wall numbers** recorded: wins, national, table (not instrumented
  by this driver — recorded as not instrumented, never faked), wave
  4–5 unlocks, median survival.
- **Sense-test:** no volley is expected (0 arrivals likely); read
  the drop distribution as a village story only — no transcript
  claim is made from zero arrivals.
- **Canon:** docs/CONTESTS.md (prize funnel); no canon doc covers
  the kill-loot roll table — the numbers are code-derived (§2),
  said here rather than inventing canon.

## 9. Infra notes

- **Write flap active:** `worktree-heartbeat.sh sim-killrate-a`
  failed twice with `PermissionError: [Errno 1] Operation not
  permitted` writing the registry (~08:49 UTC). Retrying
  periodically; heartbeat is not a judged bar and the flap does
  not block the band — writes are retried per the flap response.
- **Metric review** (to be filled in the evidence file).

