# sim-rollwall-a — PREREG (frozen 2026-11-21 ~03:45 UTC, before any judged sim)

**Arm:** sim-rollwall-a · **Loop A run:** fleshout-20261121T0315Z · **Axis:** scale-onramp
**Finding:** #2590 (serve half) — the ROLL WALL.
**Type:** DIAG (+ conditional lever — see §5).
**Base:** master b7c8eff2c (journey-crisis r261, evidence+scripts only).
**Branch:** sim-rollwall-a (worktree `~/workspace/worktrees/sim-rollwall-a`).

## §0. The question, and what is already known (pre-analysis, NOT a judged sim)

fiberfetch-a (evidence/2026-11-21/sim-fiberfetch-a.md, band 107101–107108) found
that all 6 served departures that left with 0 ammo failed their 60% departure
arrow-craft with fiber plentiful. 6/6 failures at 60% success is p ≈ 0.004 —
**if the 6 were 6 independent draws**. They are not. Re-derived from the
fiberfetch arm corpus (`evidence/2026-11-21/perseed-fiberfetch-a-arm/`,
this arm, before this prereg):

- Served-rate (0.60) departure arrow-craft attempts on the band: **n = 20,
  14 ok / 6 fail** — observed 0.700 vs stated 0.600. Exact binomial
  P(X ≤ 14 | n = 20, p = 0.6) = 0.874. No anomaly in aggregate.
- The 6 served 0-ammo departures ARE the 6 failures: every served departure
  attempted at 0.60 (20 served = 20 attempts), the 14 successes left with
  ammo, the 6 failures left with 0. "Left with 0 ammo" selects failures by
  construction — the p ≈ 0.004 conditions on the outcome it measures.
- Calibration by rate on the same band (all departure arrow-craft attempts):
  0.35: 4/9 (0.444), 0.60: 14/20 (0.700), 0.85: 21/25 (0.840). All three
  rates sit inside their expected range. The ammo band (107071–107078)
  agrees: 0.60: 6/10 (0.600), 0.35: 6/12 (0.500), 0.85: 36/44 (0.818).
- All 6 fiberfetch failures carry `ammoRate: 0.6, ammoServed: true,
  crafted: 1, craftedOk: false` in the corpus — the roll really ran at
  0.60 six times and lost six times. The roll is what it seems; the
  framing is what is suspect.
- On the ammo band, 2 of 12 served departures left with 0 ammo WITHOUT a
  served-rate attempt (10 lever rows vs 12 served) — the gate-blocked
  population exists and was never classified. That is the gap this diag
  closes.

**Hypothesis H0 (to be judged on fresh seeds):** the departure arrow-craft
roll is calibrated at its stated rates, and served 0-ammo departures are
explained by the ordinary failure share plus gate-blocked attempts — there
is no roll defect. The diag tests H0; it does not assume it.

**Code read (before any sim — the gates that can actually block):**
`villagerPocketAmmo` (src/js/game.js ~8025) has exactly these early exits
before the craft roll: no ranged weapon seated (`no-ranged`); ranged weapon
with no ammo id — a spear still seated (`no-ammo-id`); already carrying a
full batch (`already-capped` — cannot yield a 0-ammo departure); ammo kind
with no pile recipe (`no-recipe`); pile short of a recipe material
(`no-mats`); and the craft itself (`craft-fail` / `craft-ok`). There is NO
skill gate on the departure ammo craft — `level` defaults to 1 and only
sets the rate (1 → 0.35, served 0.60, 2 → 0.85). The bow-staging knowledge
gate (`lv[bow] >= 1`, `villagerStageBow` step 3) blocks SERVING, not the
ammo craft, and is counted as staging context, not as a classified ammo
failure. `villagerStageBow` then `villagerPocketAmmo` run adjacently in the
expedition departure path (src/js/villager-agency.js ~524/527, each in its
own try/catch), so a staged bow with no pocketAmmo call (`no-attempt`)
can only happen via an exception — the instrument counts it, expecting 0.
Patrols call `villagerPocketAmmo` but never `villagerStageBow`
(game.js ~8335) — patrol rows are never served and are excluded from the
served population (recorded with a `path` field). The home craft
(`villagerAmmoCraftDay`, src/js/villager-build.js ~1574) shares the
`v.ammoCraft` level record and the pile, runs at home, and is the
`timing` suspect: it can drain the day's fiber before a departure.

**Canon:** no canon doc covers launch gear-up / ranged-slot rules /
weapon-craft knowledge seeding (established by sim-evade-a, repeated by
sim-fibersupply-a). Nothing here invents canon.

## §1. Substrate (frozen — the fiberfetch substrate minus the dead fetch)

Re-landed from the fiberfetch lever commit 213c4adfd (DEPMAT + ROLL35 +
AMMO hunks only — the FIBERFETCH fetch block is NOT re-landed; it is
CONCEPT-DEAD). Env-gated, default off; flag-off is byte-identical live
behavior (proven by the substrate proof tests, §4).

- SPEARGATE=1 (landed on master), BOWOPEN=1, SENSEEXPED=1 (substrate).
- DEPMAT=1, ROLL35=1, AMMO=1 (re-landed substrate).
- Common: VETREENGAGE=1, PARTYSIZE4=1, FLEEREPAIR2=1, FIGHTALLY2=1.
- BOWKNOW, DEPARTSEE, EVADEOBS unset. FIBERFETCH unset.
- Policy: competent verbatim (`scripts/policies/competent.js`).
- Horizon: 150d death-aware.
- Band: **107121–107128, 8 seeds** (fresh — see §0.1).
- Single DIAG leg (no ctl/arm contrast — the diag classifies one
  population on one leg; a conditional armed leg, if any, is judged by
  its own addendum prereg, §5).

## §0.1 Seed-band freshness check (before the run)

- `grep -rln "10712[1-8]" evidence/ --include="*.md"` → no matches.
- `grep -rn "10712[1-8]" <goal>/hidden_files/*.md` (convergence tracker
  + findings + claims) → no matches.
- `find evidence -name "*10712[1-8]*"` → no corpus filenames.
- `grep -rln "10712[1-8]" evidence/ --include="*prereg.md"` → no matches.
- Neighbors in use: 107091–107098 (fibersupply), 107101–107108
  (fiberfetch), 107111 (lendpool). One old JSON corpus
  (evidence/2026-10-27/perseed-w4lethality/s75104-armed.json) contains
  the literal 107122 as a pantry kcal value — not a seed designation.
- Band 107121–107128 is FRESH.

## §2. Primary metric (frozen — a miss is DIAG-NO-GO, never re-scored)

**Classification completeness over served 0-ammo departures.**

- Population: every departure on the band where `villagerStageBow`
  staged a bow THIS departure (return `staged: true`, source
  `crafted` / `fromStash` / `fromArmory`) AND the villager left with 0
  matching ammo (`carriedAfter == 0` on the joined `villagerPocketAmmo`
  row for the same vid/day, expedition path).
- Each member is classified into exactly one class (§3). Unclassified
  members must be 0.

**DIAG-GO iff BOTH hold:**

- (a) **Completeness:** 100% of served 0-ammo departures classified,
  0 unclassified, 0 instrument errors on all 8 per-seed files.
- (b) **One dominant mechanism:** EITHER one class accounts for ≥ 4 of
  the classified failures, OR the observed departure-craft success rate
  across ALL attempts (n ≥ 20) is reported per rate with an exact
  binomial 95% interval (Clopper–Pearson) and a calibration verdict
  against the stated rate (inside interval = calibrated).

**DIAG-NO-GO** if (a) fails, or if (b) fails (no class ≥ 4 AND n < 20
attempts, or the rate report is missing). The verdict is judged against
this header only.

## §3. Classification (frozen definitions)

Per served 0-ammo departure, from the joined stage row + ammo row +
home-craft rows (same vid/day, shared seq order):

| Class | Definition |
|---|---|
| `roll-fail` | Ammo row `crafted == 1 && craftedOk == false` (attempt ran, roll lost). `ammoRate` + `ammoLvBefore` recorded. |
| `no-mats` | Ammo row `failReason == no-mats` (pile short of a recipe material at the attempt). Pile fiber + pack fiber + recipe need recorded. |
| `no-ammo-id` | Ammo row `failReason == no-ammo-id` (a spear still seated as the ranged weapon — staging recorded but the bow never seated). `rangedId` recorded. |
| `no-ranged` | Ammo row `failReason == no-ranged` (no ranged weapon seated at all). |
| `no-attempt` | No ammo row for the served (vid, day) — staging happened, `villagerPocketAmmo` never ran. |
| `no-recipe` | Ammo row `failReason == no-recipe` (ammo kind with no pile recipe). |
| `timing` | A `no-mats` departure where a home craft (`villagerAmmoCraftDay`) for ANY villager took fiber earlier the same day AND pile fiber was ≥ 1 at the dawn census — the day's fiber existed and was spent at home before the departure. (Sub-class of no-mats by cause; counted separately, never double-counted: a timing row is a no-mats row whose cause is timed, reported as `no-mats (timing)`.) |
| `unclassified` | Matches none of the above. Must be 0. |

Staging context (not classified failures, reported alongside): staging
rows by source (`alreadyHad` / `crafted` / `craftedFail` / `fromStash` /
`fromArmory` / `noSource`), and skill-gated staging — `noSource` rows
where both `lv[bow] < 1` and `lv[crude_bow] < 1` while materials were
sufficient (knowledge, not materials, blocked the serve).

## §4. Instrument (frozen before the judged leg)

- `scripts/rollwall-driver-a.js` — lean driver. Wraps `villagerStageBow`
  (stage rows: lv before/after, pile + own branch/vine/wood, spearHolder,
  return source/itemId/craftedOk/roll35Rate/depmatSite), wraps
  `villagerPocketAmmo` (ammo rows: rangedId, ammoId, carriedBefore/After,
  stashedBefore, pile stick/stone/fiber, pack fiber, ammoLvBefore,
  pocketed/crafted/craftedOk, ammoRate, ammoServed, failReason, call
  path expedition/patrol from the stack), wraps `villagerAmmoCraftDay`
  (home-craft rows: day, vid-attributed carried-ammo deltas, pile fiber
  before/after, batches made), plus a dawn pile-fiber census per day.
  A shared seq counter orders rows within a day (home craft vs
  departure). Wraps are pure reads + no extra `Math.random` draws.
  Per-seed JSON corpus: `evidence/2026-11-21/perseed-rollwall-a-diag/`.
- `scripts/analyze-rollwall-a.js` — classifier + calibration (per-rate
  success counts with Clopper–Pearson 95% intervals) + `--selftest`.
- `scripts/test-rollwall-a.js` — proof test: instrument on fixtures
  (each class fires once; a staged bow joins its ammo row; a patrol
  row is never served; home-craft timing join), plus the substrate
  proofs re-run green: `test-ammo-a.js` 52/52, `test-roll35-a.js` 41/41,
  `test-depmat-a.js` 43/43. `test-fiberfetch-a.js` is NOT run as a gate
  (FIBERFETCH is not re-landed; it fails on this tree by design).

## §5. Conditional lever (frozen rule — no speculative fix)

- If the diag names ONE fixable mechanism (a GATE, not the 60% roll
  itself — e.g. `no-ammo-id` spear-seating, or `timing` home-craft
  drain), build the minimal fix in this arm — but FIRST write an
  addendum prereg (bars: served 0-ammo departures craft-success rate,
  volleys from served bows, guardrail deaths/engaged exposure-normalized
  + median survival ≥ 0.8× control) and commit it BEFORE running the
  armed leg; run the armed leg on the same fresh band and judge it.
- If the diag names no fixable mechanism (roll calibrated, failures
  spread across classes with no class ≥ 4, or the dominant class is
  `roll-fail` at a calibrated rate), close DIAG with the named next
  lever — do NOT build a speculative fix.
- If a built lever fails its addendum bars, REVERT it in the worktree
  before finishing (verify the revert is the exact inverse by hash),
  leaving instrument + evidence only.

## §6. Wall numbers (reported every run, not judged)

National / table / wins, wave 4–5 unlocks, median survival, per seed.

## §7. Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section judging this
prereg's bars as written.
