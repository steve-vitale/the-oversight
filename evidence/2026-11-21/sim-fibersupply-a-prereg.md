# sim-fibersupply-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fibersupply-a · **Loop A run:** fleshout-20261121T0015Z
**Type:** DIAGNOSIS (read-only instrument; no game-code change in this arm) —
finding #2590's serve half, fiber supply first.
**Verdict shape:** DIAG-GO / DIAG-NO-GO (a diag, not a lever: GO means the
instrument is valid AND the supply gap is quantified with a named dominant
source/sink and a pile-zero share; the fix is a separate arm).
**Frozen:** 2026-11-21 ~01:00 UTC, before any judged sim, before the
instrument exists (the code census in §0 is design research from reading
code, never a sim).
**Branch:** `sim-fibersupply-a` (worktree
`~/workspace/worktrees/sim-fibersupply-a`). **Base:** master faa5d65a9
(the worktree HEAD; the run claim's base 028b34e33 is its parent — the
faa5d65a9 tip adds Loop B's 20261120T2130Z merge, no conflicts).
**Builds on:** `evidence/2026-11-20/sim-ammo-a.md` + prereg (NO-GO: the
served-bow quiver works at the trailhead but the PRIMARY fails 1/6 vs
0.50 — Lelisa, seed 107075, fought 5 times with an empty bow because
pile fiber was 0 on day 96 and still 0 on day 101; no-mats fires
17×/leg, fiber 0 on 20 rows/leg), `evidence/2026-11-20/
sim-depmat-a.md` (NO-GO), `evidence/2026-11-20/sim-roll35-a.md`
(NO-GO), `evidence/2026-11-20/sim-evade-a.md` (NO-GO),
`evidence/2026-11-19/sim-bowsee-a.md` (NO-GO),
`evidence/2026-11-19/sim-bowknow-a.md` (NO-GO),
`evidence/2026-11-19/sim-speargate-a.md` (GO — gate fix landed).

## §0. The code census (frozen, read from code — NOT a sim)

No canon doc covers launch gear-up, ranged-slot rules, or
weapon-craft knowledge seeding — sim-evade-a established that; said
here rather than inventing canon. `docs/CANON.md` (manifest) read.
The fiber economy, as the code stands on faa5d65a9:

### §0.1 Pile-fiber SOURCES (everything that adds fiber to the communal pile)

| # | Source | Code anchor | Rate / shape |
|---|---|---|---|
| S1 | **Deadfall duty** (villager) | `src/js/game.js:7089-7115` (`resolveOneAssignment`, task `deadfall`) | Per haul: sticks R(1,2) × eff, fiber **1 on a 50% roll** (`Math.random() < 0.5`), straight into `stashState().materials`. Expected **0.5 fiber per haul**. |
| S2 | Betrayal stash event | `src/js/betrayal.js:716-719` | **+4 wood, +4 fiber** to the stash, one-off event line. Rare. |
| S3 | Scholar deposit via stash UI ("Give all") | `src/js/storage.js:800-815` (`stashHtml`, `data-stash-give`) | Player verb only. The competent policy never calls it (grep: no deposit/stashGive in `scripts/policies/competent.js`). |
| — | Open-village ambient contribution | `src/js/storage.js:1320-1360` (`npcBatchTurn` wrap, 6% per batch) | Gives branch/wood/bark/vine/hide **only — never fiber, never stick, never stone**. NOT a fiber source. |
| — | Forage / expedition gather / loot | (none found) | No `fiber` yield in any forage, expedition, or loot path (full-tree grep for `fiber` in `src/js/` + `src/data/`). Plants with kind `fiber` (`src/data/plants.json:126,1425`) are knowledge-use tags, not yields. |
| — | Scholar personal gather | `src/js/storage.js:1306-1315` (clearBrush +1–2 fiber), `src/js/game.js:28502` (tree deadfall +1), `src/js/game.js:28665` (pine deadfall), `src/js/carexplore.js:527` (+2) | All go to the **scholar's personal inventory** via `addMaterial` (`src/js/storage.js:158-170`) — never the pile. A separate fiber economy that never meets the pile. |

### §0.2 Pile-fiber SINKS (everything that takes fiber out of the pile)

| # | Sink | Code anchor | Rate / shape |
|---|---|---|---|
| K1 | **Departure arrow craft** (`villagerPocketAmmo` step 3) | `src/js/game.js:8025-8170` | Arrow recipe (stick 2 + stone 1 + **fiber 1** → 5 arrows, `src/data/recipes.json`). Materials deducted from the pile **BEFORE the roll** — a failed craft (65% at blind 35%) burns the fiber anyway. **−1 fiber per attempt, success or fail.** Drawn from the pile ONLY, never the carrier's personal pack. |
| K2 | Closed-village skim | `src/js/storage.js:1369-1380` | 5% per batch: −1–2 of a random non-zero pile material — can hit fiber. Small. |
| — | Scholar `craft()` | `src/js/game.js:3419-3510` | Draws ONLY from the scholar's personal inventory — never the pile. The scholar's own arrow crafts (competent policy, `scripts/policies/competent.js:2103`) spend personal fiber, not pile fiber. NOT a pile sink. |
| — | Villager weapon craft | `src/js/villager-build.js:1248-1700` (ladder spears → bows) | Ladder recipes use branch/vine/wood — **no fiber**. Bow craft (`crude_bow`: branch 1 + vine 1; `bow`: wood 1 + vine 2) uses no fiber. NOT a sink. |
| — | Villager armor craft | `src/js/villager-build.js:1116-1260` | Armor recipes use bark/hide — **no fiber** (full recipe list: only cloth 3, braided_cord 4, frog_gig 1, lean_to 2, crossbow 1, sling 2, arrow 1 use fiber; none is an armor or villager-ladder recipe). NOT a sink. |
| — | Bolt craft | `villagerPocketAmmo` step 3 | Bolt recipe (stick 2 + stone 1, no fiber). NOT a fiber sink. |

### §0.3 The structural hypothesis (what the census predicts — the diag tests it)

The deadfall tap is throttled by the STICK threshold, not by fiber need:
the competent policy staffs deadfall only while pile sticks < 6, max 2
workers (`scripts/policies/competent.js:1810-1838`, `DEADFALL_PILE_WANT
= 6`, `DEADFALL_WANT = 2`; fish and cook staff first, deadfall takes
leftover hands). Per stick replenished, deadfall yields 0.5 fiber /
1.5 sticks = **0.33 fiber per stick**; each arrow attempt consumes 1
fiber per 2 sticks = **0.50 fiber per stick**. So whenever arrows are
being crafted, fiber drains faster than deadfall replaces it — the pile
ratchets to 0 and stays there, and the only fiber that ever arrives is
the 0.5-per-haul trickle while sticks sit below 6. Meanwhile the
scholar's personal fiber (clearBrush, tree deadfall, carexplore) is
stranded in the scholar's pack: villagers cannot draw on it, and the
competent policy never deposits it. If the census confirms this, the
named fix mechanism for the next arm is a **trailhead fiber fetch**
(the departure arrow-craft attempt gathers its own fiber at the site,
the mechanism the ammo evidence §7 named) or a **pile-fiber deposit /
deadfall re-throttle** — the evidence will name one, with its premise
stated. The fix is NOT built here.

## The question

On live master substrate, with the competent policy playing: **why does
the communal pile never have fiber when a departure tries to craft
arrows?** Quantify every source rate and sink rate, the pile-zero
share of village-days, and who holds fiber personally vs in the pile.

## Primary metric (BINDING, §14)

Single-leg diag on the fresh band (no lever, no second leg — the
reproducibility leg below is a determinism check, not a comparison).
All numbers read from the live corpora (never snapshots).

- **(0) Instrument validity — BINDS.** Proof test
  (`scripts/test-fibersupply-a.js`) GREEN before the pilot: fixtures
  prove the counters attribute correctly — (a) a deadfall resolution
  that lands fiber is recorded as a `deadfall`-task event with the
  exact pile delta; (b) a departure arrow-craft attempt records pile
  fiber before/after with exactly −1 on the attempt; (c) the daily
  census reads pile fiber and scholar personal fiber as separate
  numbers; (d) a scholar `craft('arrow')` spends personal fiber and
  leaves pile fiber unchanged; (e) a `stashLog` fiber line is captured
  by the ledger wrap. AND **instrument errors 0** on all 16 per-seed
  files (8 ctl + 8 rep).
- **(1) PRIMARY — the supply gap, quantified — BINDS.** The dominant
  source is named with its rate (fiber in per village-day) AND the
  dominant sink is named with its rate (fiber out per village-day)
  AND **pile fiber = 0 on ≥ 0.40 of sampled village-days** (daily
  census rows, dead villages excluded after their end day). The 0.40
  bar is reasoned from the ammo band (pile fiber 0 on 20/328
  departure rows; the one served carrier blocked twice five days
  apart) plus the §0.3 structural prediction (inflow 0.33 fiber/stick
  vs 0.50 needed): the pile should sit at 0 most days, and 0.40 is
  conservative enough to fail if the pile actually holds fiber most
  days — which would overturn the hypothesis rather than confirm it.
- **(2) Fiber-need events — BINDS.** Departure arrow-craft attempts
  blocked with pile fiber 0: **≥ 5** on the band (ammoRows with
  `failReason == 'no-mats'` and `pile.fiber == 0`; the served-bow
  subset is reported beside it). The ammo band fired no-mats 17×/leg
  with fiber 0 on 20 rows — if fiber is the binding material, the
  fiber-attributable subset should clear 5; fewer means the need is
  thinner than the ammo evidence suggested.
- **(3) Personal-vs-pile separation — BINDS.** The census quantifies
  stranded personal fiber: scholar personal fiber mean and max across
  census days, and villagers' personal fiber total (expected ~0) —
  reported as numbers, not asserted. GO requires the numbers to be
  present for every seed (no null census) with the scholar mean
  stated in the evidence; the bar is that the separation is measured,
  so the fix arm inherits a premise instead of a guess.

**GO threshold:** (0) AND (1) AND (2) AND (3). A miss on any bar is
DIAG-NO-GO, never re-scored. No guardrails bind — a diag changes no
game code — but the wall numbers are reported every run (national /
table / wins, wave-4 and wave-5 unlocks, median survival, per leg).

## Secondary metrics (supporting, not binding)

- Source/sink ledger totals per seed: fiber in by source (deadfall /
  batchTurn-contribute / betrayal-or-residual / scholar-deposit),
  fiber out by sink (pocketAmmo attempts / skim / residual); deadfall
  hauls, fiber per haul, hauls per village-day; the stick-throttle
  check (deadfall staffed days vs pile sticks ≥ 6 days).
- Pile fiber at departure attempts (ammoRows, carried over from the
  ammo instrument): fiber-zero share of departure rows, no-mats split
  by which material is missing (fiber vs stick vs stone).
- Scholar fiber crafts (personal): arrow crafts attempted/succeeded,
  personal fiber spent — the stranded-economy side.
- Sense test: fiber say-lines (deadfall lines, clearBrush lines,
  craft lines) — do villagers ever talk about, seek, or notice fiber?
  Quoted in the evidence, not just counted.
- Wall numbers per leg: national / table / wins, wave-4 and wave-5
  unlocks, median survival, community loss, starvation.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the ammo/depmat/roll35
  bands, for comparability). Dead villages stop simulating (+10d tail
  max).
- **Seeds (FRESH 8-seed pilot band): 107091, 107092, 107093, 107094,
  107095, 107096, 107097, 107098.** Freshness check (skill
  local_seed_band_freshness), run 2026-11-21 ~00:50 UTC, before this
  prereg was frozen:
  - `grep -rn "107091\|...\|107098" evidence/*/sim-*-prereg.md`
    returns **nothing** — no prereg names any seed in this band.
  - `grep -rln "10709[1-8]" evidence/` returns 40 files, all old
    corpus/panel JSONs; the 7 files mentioning literal `107091`
    were inspected individually and NONE is a seed designation:
    `journey-scale-r12-scalecourt-12004.json` (`"pantry": 107091` —
    a calorie count), `sweep-belongfeast.json` (`192.85455861070912`
    — a float substring), `sim-gorgeharness-a-panel/compare.json`
    (float substring), `cheaptend-a-competent-s96301.json` /
    `sweep-competent.json` (`1473.8107091005425` — a float
    substring), two `neutral-r172social-panel` case files
    (`16272.107091143727`, `14664.209010709199` — float substrings).
    Word-boundary grep adds two more non-seed hits: `"rotFresh":
    107098` (a rot quantity) and `[67, 107095]` in a rageholder
    survey corpus for seed 106142 (an array value, not a seed).
    **107091 was never used as a seed in any sweep config.**
  - `grep -rn "10709[1-8]"` over the convergence tracker, the
    sim-findings file, the rotation file, and every live lever-claim
    file returns **nothing**. The 10 journey-crisis preregs that
    mention "forbidden band" (a different, journey-lane seed
    series) were individually checked for `10709` — none names it.
    No forbidden/contaminated band list names this band.
  - The band is fresh. No collision; no band change needed. The
    coordinator's pre-check note (7 corpus files mention 107091)
    is answered above, file by file.
- **Policies:** competent verbatim. **Substrate:** `VETREENGAGE=1 +
  PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`, `SENSEEXPED=1`,
  `BOWOPEN=1`, `SPEARGATE=1` — all landed on master faa5d65a9.
  `DEPMAT`, `ROLL35`, `AMMO` are UNSET (not on master — the ammo
  arm reverted them; the diag measures the pile on live master
  substrate, upstream of any of them). `BOWKNOW`, `DEPARTSEE`,
  `EVADEOBS` are UNSET (knowledge seeding proven non-binding;
  evade is the named next arm, not this one). BOWCRAFT is always-on
  in code (live ground, not a flag). The driver asserts the
  substrate flags match the MODE label and each corpus file records
  `speargateOn` + `speargatePresent` + `bowopenOn` +
  `bowopenPresent` + `depmatPresent` + `roll35Present` +
  `ammoPresent` (all three expected false) + `bowknowOn` +
  `wiringSha` + `gameSha`.
- **Instrument:** `scripts/fibersupply-driver-a.js` (clone of
  `scripts/ammo-driver-a.js`, RUN=fibersupply-a,
  OUTDIR=perseed-fibersupply-a-{ctl,rep} — env-parametrized; the
  `depmatRows` + `ammoRows` recorders are UNCHANGED, plus the NEW
  fiber recorders — pure-read wraps: a daily `fiberCensus` (pile
  stick/stone/fiber/branch/vine/wood + pile arrows + scholar
  personal fiber + villagers' personal fiber + deadfall counters +
  deadfall staffed count + trust level), `fiberEvents` (pile-fiber
  deltas per `resolveOneAssignment` call by task, per `npcBatchTurn`,
  per villager craft-day call — nonzero deltas only), `fiberCrafts`
  (scholar `craft()` calls on fiber recipes: personal vs pile
  before/after), `fiberSays` (say-lines mentioning fiber),
  `fiberStashLog` (stashLog lines mentioning fiber); `ammoRows`
  gains pile-after so the arrow-craft sink is measured per
  departure); analyzer `scripts/analyze-fibersupply-a.js` — the
  judge re-pointed to this prereg's bars (instrument validity,
  supply-gap quantification, fiber-need events, personal-vs-pile
  separation) plus `--selftest` covering the new bars. Per-seed
  JSONs under `evidence/2026-11-21/perseed-fibersupply-a-{ctl,rep}/`.
  **§15 panel:** `scripts/build-fibersupply-panels-a.js` (cloned
  from the ammo builder, re-pointed at the fibersupply corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the instrument,
  the frozen bars above are the judge. The compare here is a
  **determinism/reproducibility compare** (ctl vs rep: identical
  code, identical flags, identical seeds — expected
  no_material_signal), NOT a before/after judgment: a diag changes
  no game code, so there is no before/after pair to compare. The
  rep leg doubles as the MEASUREMENT §5 determinism spot-check
  (same seeds twice → identical tables).
- **Legs:** MODE=ctl (the judged leg) and MODE=rep (identical-code
  re-run, same 8 seeds, for the panel compare + determinism check).
  The legs differ in NOTHING but the MODE label.
- **PILOT ONLY.** 8 seeds is the pilot and the confirm here (diag
  on one band). No 12–16 seed confirm; the coordinator decides any
  follow-up from the verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on departing bow carriers and the pile they draw
from, staged by the competent policy — a geared scholar fighting
with a party, never a fresh un-geared solo scholar. The proof test
(`scripts/test-fibersupply-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear. The pilot's per-seed
corpora carry the encounter averages (party size, gear, abilities,
ranged-at-entry) beside the verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** departure arrow-craft attempts occur on the
   substrate — the ammo band (107071–107078, same substrate shape)
   shows 66 craft attempts (46 craft-ok + 20 craft-fail) per leg
   and 17 no-mats rows per leg. The fiber-need bar (≥ 5) is sized
   against that.
2. **Pool sizing:** the pile-zero bar (≥ 0.40 of village-days) is
   sized against the ammo band's departure-row zero share (20/328)
   plus the §0.3 structural prediction; the bar judges whether the
   pile is empty on the days that matter, not only at departures.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fibersupply-a.js`, GREEN before the pilot) proves
   the counters attribute correctly on a live village (see the
   fixture section above), and the analyzer `--selftest` covers the
   new judge shapes (GO / NO-GO instrument-invalid / NO-GO
   pile-zero 0.39 / NO-GO need-events 4 / NO-GO missing census).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on DIAG-GO the fiber half is
  quantified — the named dominant source/sink with rates, the
  pile-zero share, and the named fix mechanism (with its premise
  stated) for the next arm. On DIAG-NO-GO the finding stays open
  with the failing bar named.
- The primary is a within-band quantification (this prereg): if it
  misfires, the metric review says whether the miss is the
  instrument (counters misattribute), the pool (too few need
  events to judge), or the hypothesis (the pile actually holds
  fiber) — the verdict does not get re-scored — and names which
  population the miss lives in (village-days vs departure rows).
- The panel compare is a determinism check, not a judgment: if
  ctl vs rep diverge, the review names the diverging seeds and
  whether any bar turned on it — the verdict does not get
  re-scored, but the next arm needs the divergence sized.
- RNG divergence does not apply within a leg (single leg); the rep
  leg's whole purpose is to detect nondeterminism, not to absorb it.
