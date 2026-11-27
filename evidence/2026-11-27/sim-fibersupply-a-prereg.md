# sim-fibersupply-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-fibersupply-a · **Loop A run:** fleshout-20261127T2033Z
**Type:** DIAGNOSIS (read-only instrument; no game-code change in this arm) —
craftgate-a's §13 next arm #1: fiber supply to the pile.
**Verdict shape:** DIAG-GO / DIAG-NO-GO (a diag, not a lever: GO means the
instrument is valid AND the dominant fiber source and sink are named with
rates AND the binding gap is quantified; the fix is a separate arm).
**Frozen:** 2026-11-27 ~21:15 UTC, before any judged sim.
**Branch:** `sim-fibersupply-a` (worktree
`~/workspace/worktrees/sim-fibersupply-a`). **Base:** worktree HEAD
3df52548c (coordinator round record, sim-scale-onramp-round-1915).
**Builds on:** `evidence/2026-11-27/sim-craftgate-a.md` + prereg
(DIAG-NO-GO UNASSIGNED — the home-duty craft gate almost never opens
because FIBER is the binding shortfall: 704/721 no-materials days
fiber-short (98%); pile means stick 46.4 / stone 250.7 / **fiber 9.4**;
arrow recipe available 65% of days vs bolt 97%; 5 never-supplied
bow-carriers decomposed across 136 needing-days: 96 fiber-blocked, 40
away days) AND `evidence/2026-11-21/sim-fibersupply-a.md` + prereg
(the same arm's first run, band 107091–107098, DIAG-NO-GO on its frozen
pile-zero bar (0.208 < 0.40) — the WHY was fully quantified there:
deadfall is the only recurring source (336 in over 966 village-days,
0.348/day), one villager does 81% of the hauling, the home arrow-craft
eats 155 fiber against 16 at departures, 65 no-mats need events; the
home sink was wrap-blind and only inferred from the stash ledger).
This run re-measures on a FRESH band with the instrument gap closed
(the home-duty craft is wrapped directly — see §1c), and judges
against bars corrected per that run's metric review (departure-side
and bow-holding populations, not all village-days alone).

## §0. The question, in plain words

Craftgate showed the pile holds stick and stone in abundance but
almost no fiber, and the home-duty craft gate is shut on fiber 98%
of the time it is shut at all. Where does fiber come from during
play, what puts it in the pile, what takes it out, and why does the
pile sit at ~9 while stick and stone accumulate? Measure fiber
inflow by source, pile fiber over time, fiber sinks, who carries /
brings fiber, and whether villagers know where fiber is.

## §1. Design from code (frozen, re-read on this base — NOT a sim)

Read before designing: `docs/CANON.md` (manifest). **No canon doc
covers fiber supply, foraging yields, or the village pile
specifically** — said here rather than inventing one. Fiber is a
foraged material (plants.json kinds it `fiber` as a knowledge-use
tag, not a yield). Arrow-crafting is a human skill (CANON.md), never
an alien ability. The code census below was re-read on this base
(3df52548c); line numbers are this base's.

### §1a. Pile-fiber SOURCES (everything that adds fiber to the pile)

| # | Source | Code anchor | Rate / shape |
|---|---|---|---|
| S1 | **Deadfall duty** (villager) | `src/js/game.js:7131` (`resolveOneAssignment`, task `deadfall`) | Per haul: sticks R(1,2), fiber **1 on a 50% roll** (`Math.random() < 0.5`), straight into `stashState().materials`. Expected **0.5 fiber per haul**. |
| S2 | Betrayal stash event | `src/js/betrayal.js:716-719` | **+4 wood, +4 fiber** to the stash, one-off event line. Rare. |
| S3 | Scholar deposit via stash UI ("Give all") | `src/js/storage.js:800-815` | Player verb only. The competent policy never calls it (no deposit/stashGive in `scripts/policies/competent.js`). |
| — | Open-village ambient contribution | `src/js/storage.js:1320-1360` (`npcBatchTurn`, 6% per batch) | Gives branch/wood/bark/vine/hide **only — never fiber, never stick, never stone**. NOT a fiber source. |
| — | Forage / expedition gather / loot | (none found, Nov 21 full-tree grep; re-confirmed by the proof test's static checks) | No `fiber` yield in any forage, expedition, or loot path. Plants with kind `fiber` (`src/data/plants.json`) are knowledge-use tags, not yields. |
| — | Scholar personal gather | `src/js/storage.js:1306-1315` (clearBrush +1–2 fiber), `src/js/game.js:28565` (tree deadfall +1), `src/js/carexplore.js:527` (+2) | All go to the **scholar's personal inventory** — never the pile. A separate fiber economy that never meets the pile. |

### §1b. Pile-fiber SINKS (everything that takes fiber out of the pile)

| # | Sink | Code anchor | Rate / shape |
|---|---|---|---|
| K1 | **Home arrow-craft** (`villagerAmmoCraftDay`) | `src/js/villager-build.js:1584` | Arrow recipe (stick 2 + stone 1 + **fiber 1** → 5 arrows, `src/data/recipes.json`). Per villager at home, short of ammo, ≤1 attempt / 3d; materials consumed own-carried first, then the pile. **−1 pile fiber per pile-funded attempt, success or fail.** THIS RUN wraps it directly (kind `homeCraft`) — the Nov 21 instrument was wrap-blind here. |
| K2 | **Departure arrow-craft** (`villagerPocketAmmo` step 3) | `src/js/game.js:8025-8170` | Same arrow recipe; materials deducted from the pile **BEFORE the roll**, pile ONLY, never the carrier's pack. **−1 fiber per attempt, success or fail.** |
| K3 | Closed-village skim | `src/js/storage.js:1369-1380` | 5% per batch: −1–2 of a random non-zero pile material — can hit fiber. Small. |
| — | Scholar `craft()` | `src/js/game.js:3419-3510` | Draws ONLY from the scholar's personal inventory — never the pile. NOT a pile sink. |
| — | Villager weapon craft | `src/js/villager-build.js:1248-1700` | Ladder recipes use branch/vine/wood — **no fiber**. NOT a sink. |
| — | Villager armor craft | `src/js/villager-build.js:1116-1260` | Armor recipes use bark/hide — **no fiber**. NOT a sink. |
| — | Bolt craft | `villagerPocketAmmo` step 3 | Bolt recipe (stick 2 + stone 1, no fiber). NOT a fiber sink. |

**Recipes (live from `src/data/recipes.json`, re-read):** arrow = 2
stick + 1 stone + 1 fiber, makes 5; bolt = 2 stick + 1 stone, makes
5. The pile is `stashState().materials` — an id→count map; the
instrument reads that map directly (pure read, the same object the
duties read).

### §1c. The instrument (driver-side, no game-code change)

Reuses the Nov 21 instrument (`scripts/fibersupply-driver-a.js`,
`scripts/analyze-fibersupply-a.js`, `scripts/test-fibersupply-a.js`,
commit a5d7861a3) with two targeted changes, both instrument-only:

1. **Home-craft wrap (new).** `installFiberWraps` gains a
   `villagerAmmoCraftDay` wrap in the same pattern as the existing
   `villagerWeaponCraftDay` / `villagerArmorCraftDay` wraps: pile
   snapshot before/after each duty call, one `homeCraft` fiberEvents
   row per call with a nonzero pile-fiber delta (day, dFiber/dStick/
   dStone, pile before/after, attempted count from the
   `arrowCraftCd` diff — the duty sets `arrowCraftCd[vid] = day`
   exactly when it attempts). The wrap calls the original exactly
   once, draws no RNG, and records nothing when the pile is
   untouched. `craftDayCalls` gains a `home` counter.
2. **Date + band parametrisation.** The driver hardwired
   `evidence/2026-11-21/` as its output root; it now takes
   `EVIDENCE_DATE` (default `2026-11-27`). The analyzer hardwired
   SEEDS 107091–107098; it now takes `--seeds 111701,...,111708`
   (or `FIBERSUPPLY_SEEDS`). The analyzer gains a `--rerun DIR
   --seed N` mode: a fiber-hash determinism check (sha256 over the
   judged fields — fiberCensus, fiberEvents, fiberCrafts, fiberSays,
   fiberStashLog, ammoRows, depmatRows, deaths, daily, summaries —
   masking mode/leg/run/anchorCommit labels) between the pilot file
   and the one-seed rerun file. The old literal ctl-vs-rep
   determinism and the `--ctl/--rep` judge path stay for the
   selftest shapes; the judged run is single-leg (MODE=ctl) + the
   one-seed rerun, per the task brief.

Unchanged from Nov 21: the daily `fiberCensus` (pile materials,
pile arrows, scholar personal fiber, villagers' personal fiber,
deadfall counters, deadfall staffed count, trust level), `fiberEvents`
(pile-fiber deltas per `resolveOneAssignment` by task, per
`npcBatchTurn`, per `villagerPocketAmmo`, per craft-day calls),
`fiberCrafts` (scholar `craft()` on fiber recipes), `fiberSays`
(say-lines mentioning fiber), `fiberStashLog` (stashLog lines
mentioning fiber); `ammoRows` gains pile-after so the departure
sink is measured per departure. All wraps call each original exactly
once and draw no RNG.

**Desk expectation (frozen, not a verdict):** the Nov 21 shape
should reproduce — deadfall the only recurring source, one villager
doing most hauling, home craft the dominant sink — with the home
sink now attributed row-by-row instead of inferred. The craftgate
numbers bound the pile: mean fiber 9.4 against stick 46.4 / stone
250.7, arrow recipe available 65% of days. If the rows show
otherwise (another source firing, the home sink small, the pile
holding fiber), the rows win.

## §2. Primary metric (BINDING, §14)

Single leg (DIAG — no ctl/arm; there is no lever to compare).
All numbers read from the live corpora (never snapshots).

- **(0) Instrument validity — BINDS.** Proof test
  (`scripts/test-fibersupply-a.js`) GREEN before the pilot: fixtures
  prove the counters attribute correctly — (a) a deadfall resolution
  that lands fiber is recorded as a `deadfall`-task event with the
  exact pile delta; (b) a departure arrow-craft attempt records pile
  fiber before/after with exactly −1 on the attempt; (c) the daily
  census reads pile fiber and scholar personal fiber as separate
  numbers; (d) a scholar `craft('arrow')` spends personal fiber and
  leaves pile fiber unchanged; (e) a `stashLog` fiber line is
  captured by the ledger wrap; (f) a fiber say-line is captured;
  **(g) NEW: a home-duty craft call that spends pile fiber is
  recorded as a `homeCraft` event with the exact pile delta, and
  the attempt count matches the cooldown diff.** AND **instrument
  errors 0** on all 9 per-seed files (8 pilot + 1 rerun).
- **(1) PRIMARY — the supply gap, quantified — BINDS.** The dominant
  source is named with its rate (fiber in per village-day) AND the
  dominant sink is named with its rate (fiber out per village-day)
  AND **pile fiber = 0 on ≥ 0.25 of sampled village-days** (daily
  census rows, dead villages excluded after their end day). The 0.25
  bar is set between the two prior measurements — Nov 21: 0.208;
  craftgate band: pile holds a full arrow recipe 65% of days, which
  implies pile-zero ≈ 0.35 if stick/stone are (as measured) nearly
  always sufficient — and is conservative enough to fail if the pile
  actually holds fiber most days, which would overturn the
  hypothesis rather than confirm it. The departure-time pile-zero
  share and the need-event rate are reported alongside as the
  operational populations (per the Nov 21 metric review).
- **(2) Fiber-need events — BINDS.** Departure arrow-craft attempts
  blocked with pile fiber 0: **≥ 5** on the band (ammoRows with
  `failReason == 'no-mats'` and `pile.fiber == 0`; the served-bow
  subset is reported beside it). Nov 21 fired 65; fewer than 5
  would mean the need is thinner than both prior bands suggest.
- **(3) Personal-vs-pile separation — BINDS.** The census quantifies
  stranded personal fiber: scholar personal fiber mean and max
  across census days, and villagers' personal fiber total —
  reported as numbers, not asserted. GO requires the numbers to be
  present for every seed (no null census) with the scholar mean
  stated in the evidence; the bar is that the separation is
  measured, so the fix arm inherits a premise instead of a guess.
- **(4) Home sink directly attributed + ledger closes — BINDS.**
  **≥ 1 `homeCraft` fiberEvents row** band-wide (the home-duty
  craft spent pile fiber at least once and the wrap saw it) AND the
  band ledger closes: **sum over seeds of |residual| ≤ 5**, where
  per-seed residual = final census pile fiber − net attributed
  events (Nov 21: 3 band-wide, wrap-blind; with the home craft
  wrapped the only known wrap-blind move left is the betrayal +4).

**GO threshold:** (0) AND (1) AND (2) AND (3) AND (4). A miss on
any bar is DIAG-NO-GO, never re-scored. No guardrails bind — a diag
changes no game code — but the wall numbers are reported every run
(national / table / wins, wave-4 and wave-5 unlocks, median survival,
per leg).

**Determinism check (not a verdict bar):** after the pilot, re-run
seed 111701 with identical env (RUN=fibersupply-a-rerun,
OUTDIR=perseed-fibersupply-a-rerun) and compare the fiber hash
(analyzer `--rerun`). The wraps draw no RNG and call each original
exactly once, so the hash must match. A mismatch is reported as an
instrument artifact in the evidence, never claimed as a lever effect.

## §3. Secondary metrics (supporting, not binding)

- Source/sink ledger totals per seed: fiber in by source (deadfall /
  batchTurn-contribute / betrayal-or-residual / scholar-deposit),
  fiber out by sink (homeCraft / pocketAmmo attempts / skim /
  residual); deadfall hauls, fiber per haul, hauls per village-day;
  top hauler share (who brings fiber); the stick-throttle check
  (deadfall staffed days vs pile sticks ≥ 6 days).
- Pile fiber at departure attempts (ammoRows): fiber-zero share of
  departure rows, no-mats split by which material is missing (fiber
  vs stick vs stone); pile-recipe availability (full arrow recipe /
  full bolt recipe days) — the craftgate §4 table, re-measured on
  this band.
- Scholar fiber crafts (personal): arrow crafts attempted/succeeded,
  personal fiber spent — the stranded-economy side.
- Sense test: fiber say-lines — do villagers ever talk about, seek,
  or notice fiber? Quoted in the evidence, not just counted. ≥ 2
  meeting/gathering transcripts read in full where fiber supply
  bears on the scene.
- Wall numbers: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, community loss, starvation.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the craftgate / Nov 21
  fibersupply bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 111701, 111702, 111703, 111704,
  111705, 111706, 111707, 111708.**
- **Seed-band freshness (skill local_seed_band_freshness, checked
  2026-11-27 ~21:10 UTC, before this prereg was frozen):**
  - `grep -rn "11170[1-8]" evidence/*/sim-*-prereg.md` — **0 hits**.
  - `grep -rln "11170[1-8]" evidence/ --include="*.md"` — **0 hits**.
  - Fallback band 111901–111908: same two greps — **0 hits**.
  - Forbidden / contaminated bands named in preregs: 73641–73648,
    73671–73678, 74201–74208, 78201–78208 (named fresh, not
    forbidden), 9700–9711, 9930–9941, 9950, 10000 — none intersects
    111701–111708 or the fallback.
  - Goal `hidden_files/`: `grep -rn "11170[1-8]"
    convergence-tracker.md lever-claims/ sim-findings.md` — the
    only hit is the coordinator's own claim file
    `lever-claims/fleshout-20261127T2033Z.json`, which NAMES this
    band for this arm (the assignment itself, not a prior use).
  - **Band 111701–111708 is FRESH.** Fallback 111901–111908 also
    fresh, unused.
- **Policies:** competent verbatim. **Substrate:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` — same as the
  craftgate pilot, so numbers compare. `DEPMAT`, `ROLL35`, `AMMO`
  are UNSET (not on master); `BOWKNOW`, `DEPARTSEE`, `EVADEOBS`
  are UNSET. BOWCRAFT is always-on in code (live ground, not a
  flag). The driver asserts the substrate flags match the MODE
  label and each corpus file records `speargateOn` +
  `speargatePresent` + `bowopenOn` + `bowopenPresent` +
  `depmatPresent` + `roll35Present` + `ammoPresent` (all three
  expected false) + `bowknowOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/fibersupply-driver-a.js` (RUN=
  fibersupply-a, MODE=ctl, OUTDIR
  `evidence/2026-11-27/perseed-fibersupply-a`, EVIDENCE_DATE=
  2026-11-27) + analyzer `scripts/analyze-fibersupply-a.js`
  (`--seeds 111701,...,111708 --ctl <pilot-dir> --rerun
  <rerun-dir> --seed 111701 --out <analysis.json>`).
  Per-seed JSONs under `evidence/2026-11-27/perseed-fibersupply-a/`;
  rerun under `evidence/2026-11-27/perseed-fibersupply-a-rerun/`.
  **§15 panel:** single-leg DIAG — no before/after panel exists to
  compare (no lever, no control leg). The panel step is NOT
  APPLICABLE; said here rather than faked. The analyzer JSON is the
  instrument output; the `--rerun` fiber hash is the determinism
  check.
- **PILOT ONLY (8 seeds).** No confirm: a DIAG arm measures once on
  the pilot band; a second band is a new prereg, never a silent
  extension.

## §5. Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on departing bow carriers and the pile they draw
from, staged by the competent policy: a geared scholar fighting
with a party, never a fresh un-geared solo scholar. The proof test
(`scripts/test-fibersupply-a.js`, GREEN before the pilot, now
including the homeCraft wrap fixture M8) runs on a LIVE loaded
village with real roster/gear and proves the counters attribute
correctly. The pilot's per-seed corpora carry the encounter
averages (party size, gear, abilities, ranged-at-entry) beside the
verdict in the evidence file.

## §6. Pre-pilot substrate checklist (§14b)

1. **Contact:** departure arrow-craft attempts occur on the
   substrate — the Nov 21 band shows 22 departure craft attempts
   (18 ok / 4 fail) and 17 no-mats rows per leg; the craftgate band
   shows 177 home-duty attempts. The fiber-need bar (≥ 5) and the
   homeCraft bar (≥ 1 row) are sized against that.
2. **Pool sizing:** the pile-zero bar (≥ 0.25 of village-days) is
   sized against the two prior bands (Nov 21: 0.208; craftgate
   arrow-recipe availability 65% ⇒ pile-zero ≈ 0.35); a miss is
   DIAG-NO-GO, judged as written.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-fibersupply-a.js`, GREEN before the pilot) proves
   the counters attribute correctly on a live village (see §5),
   including the new homeCraft wrap. The analyzer `--selftest`
   covers the judge shapes (GO / NO-GO instrument-invalid / NO-GO
   pile-zero 0.24 / NO-GO need-events 4 / NO-GO missing census /
   NO-GO homeCraft 0 / NO-GO residual 6) plus the fiber-hash
   determinism shapes (identical / differing key).

## §7. Canon

`docs/CANON.md` (manifest) read. **No canon doc covers fiber supply,
foraging yields, or the village pile specifically** — said here
rather than inventing canon. Fiber is a foraged material with no
preservation ladder and no village-side production (craftgate §12).
Arrow-crafting is a human skill (CANON.md), never an alien ability.

## §8. Metric review (to be written after the pilot — frozen bars judge as written)

- Craftgate-a §13 next arm #1 is claimed by this arm; on DIAG-GO
  the fiber half is quantified — the named dominant source/sink
  with rates, the pile-zero share, the directly-attributed home
  sink, and the named fix mechanism (with its premise stated) for
  the next arm. On DIAG-NO-GO the blank stays open with the failing
  bar named.
- The primary is a within-band quantification (this prereg): if it
  misfires, the metric review says whether the miss is the
  instrument (counters misattribute), the pool (too few need
  events to judge), or the hypothesis (the pile actually holds
  fiber) — the verdict does not get re-scored — and names which
  population the miss lives in (village-days vs departure rows).
- The determinism check is a check, not a judgment: if the rerun
  hash diverges, the review names the diverging fields and whether
  any bar turned on it — the verdict does not get re-scored, but
  the next arm needs the divergence sized.
- RNG divergence does not apply within a leg (single leg); the
  rerun's whole purpose is to detect nondeterminism, not to absorb
  it.
- Write-flap: probe (`git update-ref refs/heads/probe HEAD`) passed
  at prereg time (~21:06 UTC) in the main tree; machine uptime 2h
  (restart ~19:06 UTC — inside the flap's known post-restart
  shape). Probe before every material write; if it fails, stop
  writing and wait for the clear.
