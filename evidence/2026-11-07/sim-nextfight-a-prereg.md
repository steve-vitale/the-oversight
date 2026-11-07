# sim-nextfight-a — prereg: VETERAN'S EDGE (shape 2 of NEXT-FIGHT SURVIVAL)

**Arm:** sim-nextfight-a (run fleshout-20261107T0515Z, Loop A, axis
scale-onramp / winnability chain, tracker blank #3: killer survivorship).
**Build shape 2 from evidence/2026-11-06/sim-killersurvive-b.md — VETERAN'S
EDGE.** Shape 1 (party damage race) is Loop B's fight-interior family,
pilot NO-GO (partydamage-b: kill rate 8.3% < 10% bar) — NOT built here.
Shape 3 (readiness-gated re-entry) — NOT built here; noted as an
alternative if shape 2 fails fast. No gate/price/deed/readyDemand change.

## Question

Every dead wave-4 killer on 24 villages dies a median 7 days after their
kill, in the very next turn-based fight (TB-fight 24/31 = 77%), usually
alone, against a fresh beast, the death fight ending with the beast at
33% HP after a median 9.5 rounds. Sizing: to flip the median death fight
the killer's side needs ~50% more damage per round OR ~5 more rounds of
survival at the same damage rate. Does a veteran's edge — the killer
bringing something to their NEXT wave-4 TB fight that the first fight did
not — double killer survival?

## The lever (shape 2 — VETERAN'S EDGE)

A villager (or the scholar) with a recorded wave-4+ kill carries a
one-fight edge into their next wave-4+ turn-based fight: **×1.5 outgoing
damage on their own blows for the whole of that one fight**, then the edge
is spent. Damage, not another warm body (death fights are already mostly
solo and the three with company died anyway). The edge is:

- **Armed** in `recordWaveKill` (the per-kill choke point) when the kill
  is wave >= 4: `state.veteranEdge[killerVid] = true`. Every kill channel
  that flows through the choke point arms it (player TB, companion,
  field, contest). Pyrrhic kills do NOT arm it (recordPyrrhicKill writes
  the log directly, bypassing the choke point — accepted, noted).
- **Claimed** in `startCombat` when the monster is wave >= 4: each human
  fighter (scholar + villager companions) with an armed edge has it moved
  from `state.veteranEdge` onto the fight object
  (`tbfight.veteranEdge[vid] = true`) and deleted from state. A wave 1–3
  fight claims nothing — the edge waits for the next wave-4+ fight.
  Entering the fight spends it even if the veteran never lands a blow
  (they entered their next wave-4 fight; the edge was the fight's).
- **Applied** in `tbDamage` (the TB damage choke point, same hook family
  as the FEASTED/OVERCHARGE uplift): when the target is a wave-4+
  monster and the damage source is a fighter whose vid is claimed on
  this fight, `final = round(final * 1.5)`, with one honest say line per
  fighter per fight. Applies to the veteran's strikes and ability damage
  alike (the FEASTED convention); monster-state multipliers compose
  after it, as they do with FEASTED.

**Guardrails, all binding:** NO rounds-cap change. NO armor-ignoring
hits (that half belongs to Loop B's bypass family). NO change that makes
the FIRST kill easier — the edge arms only when `recordWaveKill` records
a wave-4+ kill, which happens at the END of the killing fight
(`tbKillRewards`); no strike inside the first-kill fight can read an
edge that does not exist yet. A Steve call is needed before any first-kill
lever; this arm does not build one. Win prices, deed gates, and readiness
bars untouched. Field fights are out of scope for this pilot (they do not
run through `tbDamage`); the census death channel is TB (77%), so the
pilot judges the dominant channel and says so.

**Fiction:** one System line on first application per fighter per fight
("VETERAN'S EDGE ×1.5: you've killed one of these before — this time you
know where to cut." / named variant for a companion). No canon doc covers
a veteran damage edge — MONSTER-WAVES.md covers waves, readiness, and
the veteran concept (a recorded wave-(w-1)+ kill makes a veteran for the
readiness gate); this edge is a new use of that established concept, not
a rewrite of any system. Canon gap stated, not invented: no doc
prescribes what a veteran DOES in their next fight.

## Band — DELIBERATE reuse for identical-seed before/after

**Pilot band 99689–99696 (8 seeds)** — the killersurvive-b CONFIRM band.
This is deliberate reuse, not a fresh band: the before leg is the existing
corpus `evidence/2026-11-06/perseed-killersurvive-b/grind-s9968*-killersurvive-b-confirm.json`
(anchor 7c68449f4), the after leg re-runs the same 8 seeds with the edge
built. Precedent: trajfrag-b reused 53001–53008 the same way and cited
the prior use here in its prereg.

**Freshness check (full scope per the seed-band skill — DONE before this
prereg):**
- Every dated prereg `evidence/*/sim-*-prereg.md` grepped per seed
  99689…99696: 0 hits each, except 99696 appears once, in
  `evidence/2026-11-06/sim-killersurvive-b-prereg.md` itself — the
  reservation that created this baseline ("Confirm extension …
  99681–99696").
- Every evidence `*.md` grepped for the band: only the two
  killersurvive-b files name it
  (`sim-killersurvive-b-prereg.md`, `sim-killersurvive-b.md`).
- `hidden_files/*.md` grepped: only `sim-findings.md` names band seeds
  (99692/99694/99696), all as citations of the same killersurvive-b
  census (the 96-round stall finding, the arena-venue finding).
- Forbidden/contaminated bands named in preregs: 99201–99208
  (standacc-b) — unrelated, no overlap.
- **Verdict:** the SOLE prior use of 99689–99696 anywhere is
  killersurvive-b, which produced the baseline corpus this pilot compares
  against. No other arm has run or reserved these seeds. Reuse is the
  design, and it is clean.

**Base drift check:** `git log 7c68449f4..41007b9d4 -- src/` = 0 commits.
Zero game-code changes sit between the baseline anchor and current master
41007b9d4 (25 commits, all scripts/evidence/docs; gauntlet-pack-b is
DIAG-only, zero src/js). Any pilot-vs-baseline difference is this arm's
edge alone. Gauntlet Q2 (NO-GO — the wave-3 Reunion pack is NOT the
killer's second fight) is respected: the edge targets the next TB fight
generally, not the arena.

## Baseline on this band (from the existing corpus, computed before the pilot)

| Metric | Baseline (99689–99696) |
|---|---|
| Killers / dead | 10 / 10 |
| **Median kill→death** | **5.5d** |
| **TB-fight share of deaths** | **9/10 = 90%** |
| Death fights (TB) | 6r/10%, 13r/61%, 5r/96%, 9r/53%, 11r/31%, 9r/85%, 96r/22% (wave-3 Buffering stall), 12r/62%, 6r/18% (rounds / monster HP left) |
| Wave-4 kills (log) | 11 |
| Median survival (days) | 112d (61, 72, 84, 105, 119, 128, 140, 150) |
| Starvation deaths (fallen) | 0 |
| National / table / wins | 0 / 0 / 0 |
| Wave-5 unlocks | 0/8 |

Pooled reference (killersurvive-b, 24 seeds): median kill→death 7d,
TB-fight share 77.4%, median death fight 9.5 rounds with beast at 33% HP.

## Method

- Policy: `scripts/policies/competent.js` verbatim, via the grind driver
  (`scripts/grind-driver-20261106.js`) + grind instrument
  (`scripts/grind-instrument-20261106.js`) verbatim. No policy change.
- Horizon: **150d, death-aware** (driver stops on village death/win).
- Command: `DAYS=150 SEEDS=99689..99696 RUN=nextfight-a
  OUTDIR=evidence/2026-11-07/perseed-nextfight-a node
  scripts/grind-driver-20261106.js` (run AFTER the build commit, so the
  per-seed anchor is the build commit).
- Judge with the killersurvive-b analyzer verbatim:
  `node scripts/killersurvive-b-analyze-20261106.js
  evidence/2026-11-07/perseed-nextfight-a` (prefix `grind-s`).
- Guards computed the same way on both legs from the per-seed files:
  starvation deaths = `fallen` entries with cause/causeArg matching
  /starv|hunger|famine/i, plus `scholarDeaths` with causeArg matching the
  same; median survival = median of per-seed `days`.

## Primary metric (binds the run — §14)

**GO iff BOTH hold on the pilot band (dead killers):**
- (a) median kill→death **≥ 14d** (double the pooled 7d; vs the band's
  own baseline 5.5d), AND
- (b) TB-fight share of killer deaths **< 50%** (vs the band's 90%).

**Guards (scalemetric cost bar):** starvation deaths ≤ control + 2 on
totals (control 0 → ≤ 2) AND on arm-only deaths (starvation deaths among
wave-4 killers: control 0 → ≤ 2); median survival ≥ 0.8 × control median
(0.8 × 112d = **≥ 89.6d**). A guard breach is NO-GO even if (a)+(b) hold.

**Kill rule:** if the pilot misses the bar, KILL fast and report — do not
re-run, re-score, or re-seed. A miss is NO-GO. If the pilot GOes, the
confirm is the pooled re-measure the coordinator orders (fresh band),
not a second run of this band.

## Proof test (written with the build, before the pilot)

`scripts/test-nextfight-a-20261107.js` (shared harness `loadGame`, seeded):
arm on a wave-4 kill only; no arm on wave-3 kill; no multiplier before
any kill (first-kill guard); ×1.5 applied to the veteran's strikes in a
wave-4 TB fight and NOT to a wave-3 monster; edge claimed out of state
at wave-4 fight start (spent even if the fight is fled); edge survives a
wave-2 fight unclaimed and applies at the next wave-4 fight; re-arms on
a second wave-4 kill; companion-vid edge applies to the companion's own
strikes. Red-before/green-after on the multiplier assertions.

## Metric review

(To be written after the pilot. Pre-registered metrics bind this run; a
miss is NO-GO, never re-scored against a friendlier metric. If the metric
proves wrong, the revision goes here for the NEXT run.)
