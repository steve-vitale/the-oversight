# sim-killarrive-b — PREREG (frozen)

**Arm:** sim-killarrive-b · **Loop B run:** fleshout-loop-b-20261123T1230Z
**Axis:** winnability-chain · **Finding:** #2599 family (kill-loot searcaster arrival)
**Type:** RUN the sized band (no game-code change; instrument/evidence only)
**Base:** worktree `~/workspace/worktrees/sim-killarrive-b`, branch
`sim-killarrive-b`, HEAD `7ade8d3bf`
**Frozen:** 2026-11-23 ~13:00 UTC, before any judged run. No judged run has run.

## 1. The question (from the brief + sim-killrate-a §5 + 0230Z round record)

sim-killrate-a sized the band and it has stayed unrun through three
rounds. The code rate: kill-loot tier-4 pool is 15 (4 alien-origin
incl. searcaster + 11 killItems[4]), so a searcaster is 1/15 per
tier-4 kill roll; pooled measured rate is tier-4 8.8% of drops ×
1/15, 8.04 drops/seed → ~4.6% per seed, ~once per 22 seeds. The
sized band is 49 seeds for P(≥1 kill-loot searcaster arrival) ≥
90%. This arm RUNS that band and judges the arrival question on
current master.

## 2. Code rate + pooled measured rate (carried from killrate-a, NOT re-derived)

Canon: docs/CANON.md read; docs/MONSTER-WAVES.md read (wave law,
escalation, tiers — the tier system this roll table sits on).
**No canon doc covers the kill-loot roll table** — said here
rather than inventing canon. The numbers below are killrate-a's,
proved in `scripts/test-killrate-a.js` (36/36, re-run on this base
before the judged band, §7).

- Pool = 15 (4 alien-origin tier-4 incl. searcaster + 11
  killItems[4], disjoint). Searcaster = 1/15 per tier-4 kill roll.
- Pooled measured tier-4 kill-roll rate: 17/193 = 8.81% of drops.
- Per-drop searcaster rate: 8.81% / 15 = 0.587%.
- Drops/seed (pooled): 8.04. P(≥1 arrival per seed) =
  1 − (1 − 0.00587)^8.04 = 4.6%.
- Expected arrivals on this 49-seed band at the measured rate:
  μ = 49 × 0.046 = **2.25**. P(0 arrivals) = e^−2.25 ≈ **0.105**.
- **What 0 arrivals means, stated plainly before the run:** 0 is
  a ~10% event under the measured rate — consistent with it, not
  a refutation of it. The arm judges the RATE, not just the count
  (bar 4 + bar 5). A 0 that arrived with a collapsed tier-4 rate
  would be a different story from a 0 that arrived with the
  tier-4 rate intact — the tier-4 rate is the discriminating
  measurement, and it is a frozen bar.

## 3. Base note

Worktree HEAD `7ade8d3bf` (0230Z adoption closeout). This is the
current master tip at arm start; no rebase is needed unless the
coordinator reports master moved before the band launches — if it
does, re-verify the instrument on the new base and record it, and
do not re-run a finished band on a new base without a coordinator
call (killrate-a precedent: a scope-verified rebase stands the band).

## 4. Band freshness (local_seed_band_freshness skill)

- **Band: 107533–107581 (49 seeds).**
- **COLLISION on the brief's intended band, recorded here:**
  the brief's 107517–107565 collides on 107517–107532 with Loop
  A's sim-launchsilence-a, which moved there after finding
  107501–107516 already used by journey-endgame-r270 (seeds
  107501–107508). Coordinator note 2026-11-23 12:57Z. This arm
  takes the next free 49-seed band starting at 107533. The
  collision is also recorded in the Loop B claim file
  (`hidden_files/lever-claims/fleshout-loop-b-20261123T1230Z.json`).
- **Freshness check for 107533–107581 (done before any seed ran):**
  grepped every `evidence/*/sim-*-prereg.md` (1,126 files) and
  every `evidence/*/sim-*.md` in this worktree for each token
  107533–107581 — **zero hits**. Grepped the convergence tracker
  (`hidden_files/convergence-tracker.md`) for each token — **zero
  hits**. Grepped the live claim files
  (`hidden_files/lever-claims/`) — **zero hits**. No
  forbidden/contaminated band list names any of these seeds.
  (Note: 5-digit seeds 10753–10758 exist in old creekpath corpora
  — different seeds, not a collision; the 6-digit tokens above
  are what was searched.)
- Nearest reservations, none overlapping: Loop A holds
  107501–107516 (original) and 107517–107532 (new); Loop B
  screened 107471–107494 (gateavoid-doorrich-b); killrate-a used
  107313–107320.

## 5. Instrument (frozen design — reuse unchanged)

- `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from the
  killloot16 / killrate arms (proof 12/12, analyzer selftest
  17/17 — re-run on this base before the judged band, §7).
- **Single ctl leg only** (MODE=ctl, KILLBUNDLE unset): this arm
  measures the roll rate, not the bundle. RUN token
  `killlootbundle-a` UNCHANGED (analyzer `loadDir` regex +
  panel builder hardcode it); fresh OUTDIR
  `perseed-killarrive-b-ctl`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpus lands under
  2026-11-21 although this arm's evidence is 2026-11-23;
  recorded, not moved.
- **Tier tally:** `scripts/test-killrate-analysis-a.js` (lootTier
  lookup in `src/data/items.json`; a drop's lootTier IS its roll
  tier — the tier-4 pool is never empty, so no fallback tier can
  occur at tier 4).
- **Arm test (NEW):** `scripts/test-killarrive-b.js` — frozen-band
  checks (49 contiguous seeds, 107533 start, no overlap with the
  reserved ranges above), sizing arithmetic on fixed inputs
  (pooled rate → 49 seeds; P(0 | μ=2.25) ≈ 0.105), Poisson
  judgment helper, and corpus validation mode
  (`--dir <corpus>`: 49 files, one shared anchor, policySha
  matches `scripts/policies/competent.js`, 0 instrument errors).
  Pre-run checks green before the band; corpus mode run after.
- **Parallelism:** 4 processes × 12–13 seeds each (chunks of 4
  per driver invocation, as the killrate driver does), sequential
  within each process. If the run window ends mid-band, corpus +
  progress note are committed and the exact done-seed list
  reported (coordinator adopts; nothing faked or extrapolated).

## 6. Definitions (frozen — killrate-a §6, carried verbatim)

- **Kill-loot event:** a `villagerKillLoot` call returning a
  non-null `dropId` (driver definition — a successful alien-loot
  drop from a villager kill). Failed chance gates are not events.
- **Tier-4 kill roll:** a kill-loot event whose `dropId` carries
  `lootTier: 4` in `src/data/items.json`.
- **Tier-4 kill-roll rate:** tier-4 kill rolls / kill-loot events.
- **Kill-loot searcaster arrival:** a kill-loot event with
  `dropId === 'searcaster'`.
- **Judgment rule (frozen from killrate-a §5):** report the
  tier-4 kill-roll rate, the kill-loot searcaster arrival count,
  and Poisson consistency against the pooled measured rate
  (tier-4 8.8% × 1/15, 8.04 drops/seed). Judge the RATE, not
  just the count.

## 7. Frozen bars (judge: analyzer on the fresh band + tier tally)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test 12/12 + analyzer `--selftest` 17/17 + `test-killrate-a.js` 36/36 + `test-killrate-analysis-a.js` 14/14 + `test-killarrive-b.js` pre-run checks, all re-run on this base; 0 instrument errors on all 49 seed files; anchor + policySha on every file | all must hold |
| 2 | **Band-observed tier-4 kill-roll rate reported** — fresh-band tier-4 rolls / kill-loot events, with per-seed table | must be reported |
| 3 | **Arrival count + Poisson consistency** — kill-loot searcaster arrivals counted; count consistent with μ = 2.25 expected arrivals at the pooled measured rate (two-sided Poisson, α = 0.05: P(X ≤ k) ≥ 0.025 AND P(X ≥ k) ≥ 0.025). 0 arrivals (P(0) ≈ 0.105) passes this bar on its own | must hold for GO |
| 4 | **Tier-4 rate reconciliation** — fresh-band tier-4 rate within 2× of the pooled measured 8.8% (4.4–17.6%), OR the discrepancy is explained from code/data (same explanation clause as killrate-a bar 4: condition on the observed tier-3-base share) | must hold for GO |
| 5 | **Arrival judgment delivered** — the rate, the count, the Poisson read, and the plain-words meaning of the observed count (incl. what 0 means, §2) in the evidence file | must be delivered |

GO = all five bars pass. NO-GO = tier-4 rate disagrees with the
pooled measured rate unexplained (bar 4), or the arrival count is
Poisson-inconsistent with it (bar 3), or no judgment delivered
(bar 5). A miss is NO-GO, never re-scored against a friendlier
metric mid-run (§14). The searcaster count itself is NOT a GO bar
beyond Poisson consistency: at the measured rate the band expects
≈ 2.25 arrivals, so 0, 1, 2, 3, 4, or 5 are all consistent
outcomes and the verdict turns on the tier-4 rate.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17; `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → pre-run checks green —
  all re-run on base 7ade8d3bf.
- **Band (judged):** 49 seeds, **107533–107581**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). One ctl leg. Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `KILLBUNDLE` unset;
  `LEND` unset; `PRESENCE` unset.
- **Per-seed table + tier tally** in the evidence file from the
  analyzer `--dir` output + tier tally script (columns: days,
  end, wave, standing, deaths, contests, prize rolls, contest
  sear grants, kill-loot events, tier-4 rolls, kill-loot sear,
  sear volleys — as killrate-a §1).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median/max survival.
- **Sense-test:** read the transcripts / drop distribution as a
  village story; flag anything worth flagging, score nothing on
  it.
- **Balanced panel (§15): NOT applicable** — single ctl leg, no
  control/armed pair; the panel compare needs two legs. Stated
  plainly in the evidence file, not faked.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read; no canon
  doc covers the kill-loot roll table — the numbers are
  code-derived (killrate-a §2), said here rather than inventing
  canon.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
