# sim-cellgate-floor-b — PREREG (frozen)

**Arm:** sim-cellgate-floor-b · **Loop B run:** fleshout-loop-b-20261123T1830Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2716
`[claimed]` — CELLGATE HOLDS EVERY KILL-LOOT VOLLEY BELOW WAVE 4
(killbundle-b §8)
**Type:** JUDGE a lever (CELLGATE_FLOOR, env parameter, no default
flip) on the staged kill-loot path only. The lever is a game-code
change in this arm (fieldFights.js + driver recording); the flip
(default floor 3) is a follow-up decision, NOT made here.
**Base:** worktree `~/workspace/worktrees/sim-cellgate-floor-b`, branch
`sim-cellgate-floor-b`, HEAD `dbe748d46`
**Frozen:** 2026-11-23 ~19:10 UTC, before any judged run. No judged run
has run.

## 1. The question (from the brief + killbundle-b §7)

KILLBUNDLE loads the gun (17/17 arrivals, exactly 2 cells) but
CELLGATE forbids firing below wave 4, and a kill-loot holder's
fights are almost all waves 1–3 (100 of 102 staged fights; the
matched holder's 15 fights all below wave 4). Only 2 of 16 staged
holders ever reached a wave-4+ fight, and both fired. Does moving
CELLGATE's wave floor from 4 to 3 make the loaded gun fire?

## 2. Carried numbers (killbundle-b, NOT re-derived)

- Staged corpus `evidence/2026-11-21/perseed-killbundle-b-stage/`
  (16 seeds 107533–107548): 16/16 bundled arrivals, 0 dry, 2
  kill-loot volleys (Emma Larsen 107539 d51 wave-4 suburb 2 shots /
  1 hit / 68 dmg; Caleb Jones 107542 d100 wave-5 spoiler 2 shots /
  2 hits / 132 dmg); per-arrival fire rate 2/16 = **12.5%**
  (Wilson 95% CI 3.5–36.0%). Fights with the gun total 102; only 2
  were wave 4+ — and both fired. Per-fight fire rate below wave 4:
  0/100 — that zero is CELLGATE, not chance.
- Per-holder wave-3 chronology, re-read from the staged corpus
  files (day-ordered volleyEvents) before freezing — the derivation
  in §6:
  - 14 wave-3 fights across 8 holders.
  - 7 holders reach their FIRST wave-3 fight while loaded
    (ammoLeft 2, 0 shots — CELLGATE-held): 107535 Adaeze Nwosu
    (d42), 107536 gen_v30h8sm (d34), 107538 gen_blg32yz (d33),
    107539 Emma Larsen (d27), 107540 gen_3z8xcjr (d39),
    107544 gen_m286un3 (d39), 107546 Dmitri Sokolov (d33).
  - The 8th holder with a wave-3 fight, Caleb Jones 107542, has
    his only wave-3 fight on d106 — AFTER firing at wave 5 on
    d100 (ammoLeft 0) — so at floor 3 he still fires once, at
    wave 5 as before.
  - 8 holders have no wave-3 fight at all (107533, 107534, 107537,
    107541, 107543, 107545, 107547, 107548) and can never fire at
    floor 3 either.
- Matched leg (killbundle-b §1, 49 seeds): 1 natural arrival
  (Jorge Silva 107533 d19), bundled, 0 volleys — all 15 fights
  waves 1–3. Not re-run here: the natural-arrival rate (~1 per 49
  seeds) cannot carry a floor verdict, and the staged leg is the
  instrument the brief orders.

## 3. Base note

Worktree HEAD `dbe748d46`. `git diff --stat 23746a0f1..HEAD` over
`src/js/fieldFights.js`, `src/js/game.js`, `src/js/contests.js`,
`scripts/policies/competent.js`, `src/data/items.json`,
`scripts/killlootbundle-driver-a.js`,
`scripts/analyze-killlootbundle-a.js` is EMPTY — no volley-path
file changed between the killbundle-b prereg anchor and this base
(the intervening commits are adoption records, other arms'
evidence, and a version bump). The floor-4 control leg in this
arm is therefore expected to reproduce the killbundle-b staged
corpus exactly (bar 4). The only `src/` change in this arm is the
CELLGATE_FLOOR parameter itself (fieldFights.js), which at the
default floor 4 is behavior-identical (same `wave < 4` comparison,
same hold-line text).

## 4. Band freshness (local_seed_band_freshness skill)

- **Staged band: 107533–107548 (16 seeds) — REUSED BY DESIGN**
  (the killbundle-b staged subset; no new seeds anywhere in this
  arm). The staged leg forces the first kill-loot roll of each of
  these 16 seeds to searcaster; the seeds' natural rolls are
  overridden for that one call only.
- **Full check, done before freezing:** grepped
  `evidence/*/sim-*-prereg.md` (all dates) for `107533` and for
  the `1075[0-9][0-9]` range; grepped the convergence tracker and
  the live claim files for `107533`/`107548`. Hits: only
  killarrive-b (band 107533–107581, verified fresh across all
  preregs by killarrive-b §4), killbundle-b (same band + staged
  subset), gatehorizon-b (notes "B holds 107533–…"), and
  launchsilence-a (notes no prereg names 107517–107539 in the
  context of its own band check — the same killarrive band,
  already established). No other prereg, screen, or forbidden /
  contaminated list names any of 107533–107548. The reuse is the
  point: identical staged seeds on both legs, so the ONLY
  difference between the corpora is the floor.
- Nearest reservations, none overlapping: Loop A holds 107501–
  107532 (launchsilence-a); Loop B screened 107471–107494
  (gateavoid-doorrich-b); killrate-a used 107313–107320;
  gatehorizon-b holds 109101–109116; Loop A holds 107617–107669.

## 5. Instrument (frozen design)

- **Lever (game code):** `src/js/fieldFights.js` — the CELLGATE
  hold reads `CELLGATE_FLOOR` (integer 1..5, default 4 when
  unset or invalid) and holds when `wave < _cgFloor`. The hold
  line names the live floor ("below wave 3" under floor 3).
  CELLGATE=1 is still required — the floor alone never gates
  anything. Contest searcaster volleys do NOT go through this
  hold (no CELLGATE reference in contests.js); the floor moves
  field fights only. Recorded, not changed.
- **Driver recording:** `scripts/killlootbundle-driver-a.js`
  records `cellgateFloor` (same parse rule) in every per-seed
  file and refuses to run with an out-of-range
  `CELLGATE_FLOOR` (exit 2 — an invalid floor must never
  silently fall back to 4 on a judged leg). No game-path change
  in the driver; the analyzer ignores the new key.
- `scripts/killlootbundle-driver-a.js` +
  `scripts/analyze-killlootbundle-a.js` reused UNCHANGED from
  the killbundle arm (STAGE_SEAR hook included).
- **Leg 1 — control (floor 4):** MODE=arm, KILLBUNDLE=1,
  STAGE_SEAR=1, CELLGATE_FLOOR unset (default 4), seeds
  107533–107548 (16), same substrate, RUN token
  `killlootbundle-a` UNCHANGED, fresh OUTDIR
  `perseed-cellgate-floor-b-ctl`. Driver hardcodes
  `evidence/2026-11-21/<OUTDIR>` — corpora land under
  2026-11-21 although this arm's evidence is 2026-11-23;
  recorded, not moved.
- **Leg 2 — armed (floor 3):** identical except
  CELLGATE_FLOOR=3, fresh OUTDIR
  `perseed-cellgate-floor-b-arm`. Both legs are driver MODE=arm
  (STAGE_SEAR requires it); the floor label is per-file
  (`cellgateFloor` 4 vs 3), not a filename mode.
- **Substrate (both legs, identical to killbundle-b):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
  `PRESENCE` unset. Horizon 150d death-aware. Policy: competent
  (verbatim).
- **Tier tally:** `scripts/test-killrate-analysis-a.js` (lootTier
  lookup in `src/data/items.json`).
- **Arm test (NEW):** `scripts/test-cellgate-floor-b.js` —
  frozen-band checks, derivation arithmetic, driver-export +
  floor-recording checks, live field-fight proof (`--live`),
  corpus validation modes (`--dir-ctl` floor-4 16,
  `--dir-arm` floor-3 16). The live proof is the observable
  effect (local-proof-of-effect): a searcaster lead FIRES at
  wave 3 with CELLGATE_FLOOR=3 (shots > 0, cells spent per
  gun-verb line, no hold line) and HOLDS at wave 3 with the
  floor unset — plus floor-3 holds at waves 1–2 naming wave 3,
  wave-4+ firing, invalid-floor fallback to 4, floor-alone-
  does-nothing (CELLGATE unset), bow untouched, 0-cell gun
  naming fusion cells. Old-code control verified: on the
  pre-change fieldFights.js the live test fails exactly the
  floor-3 checks (6 fails: wave-3 fire, both spend checks,
  no-hold, wave-2/wave-1 line naming) and passes 24/24 after
  restore.
- **Panel builder (NEW):**
  `scripts/build-cellgate-floor-panels-b.js` — adapted from
  build-killlootbundle-panels-a.js for two arm-mode staged
  dirs (both filenames end `-arm.json`; floor asserted per
  file: ctl 4, arm 3).
- **Parallelism:** 2 processes × 4 seeds per leg (pilot),
  then 2 processes × 4 seeds per leg (confirm). Sequential
  within each process. Pilot (8 staged seeds per leg) before
  any confirm spend. If the run window ends mid-band, corpus +
  progress note are committed and the exact done-seed list
  reported (coordinator adopts; nothing faked or extrapolated).

## 6. Definitions (frozen — killbundle-b §6, carried verbatim, plus floor terms)

- **Kill-loot event / tier-4 kill roll / tier-4 kill-roll rate /
  kill-loot searcaster arrival / armed arrival / bundled
  arrival / kill-loot volley / per-arrival fire rate:** as
  killbundle-b §6.
- **Wave-3 kill-loot volley:** a kill-loot volley (shots > 0,
  vid a kill-loot holder of that seed) whose recorded `wave`
  is 3.
- **Mechanistic expectation (derived in §2, frozen):** armed
  leg 8 volleys / 16 arrivals = 50% fire rate, of which 7 are
  wave-3 volleys. The expectation is mechanistic, not fitted:
  upstream of each first wave-3 fight the game state is
  identical on both legs (a hold is effect-identical at either
  floor; only the log line's wave number differs), so each of
  the 7 loaded holders fires at their first wave-3 fight, and
  Caleb fires at wave 5 as before. Downstream divergence after
  a first wave-3 firing changes a fight's outcome is the only
  slack — the GO bars sit below the expectation for exactly
  that reason.
- **Re-arm:** as killbundle-b §6 (a kill-loot holder gaining a
  `fusion_cell` AFTER their first volley). Recorded, not a bar.

## 7. Frozen bars (judge: analyzer on the fresh legs + tier tally + panel)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof 12/12 + analyzer `--selftest` 17/17 + `test-killrate-a.js` 36/36 + `test-killrate-analysis-a.js` 14/14 + `test-killarrive-b.js` 12/12 + `test-killbundle-b.js` 11/11 + `--live` 11/11 + `test-gunrate-a.js` 39/39 + `test-cellgate-floor-b.js` pre-run 17/17 + `--live` 24/24 green, all re-run on this base; 0 instrument errors on all 16 + 16 staged files; single anchor + policySha on every file in each corpus; `cellgateFloor` 4 on all 16 ctl files, 3 on all 16 arm files | all must hold |
| 2 | **Cells-at-arrival** — every staged arrival on BOTH legs carries exactly 2 cells (`klBundled == klArrivals == 16`, `klDry == 0`, per leg) | must hold for GO |
| 3 | **Primary, armed leg (floor 3)** — armed-leg kill-loot volleys ≥ 5/16 (fire rate ≥ 31.25%; mechanistic expectation 8) | ≥ 5 for GO |
| 4 | **Control reproduction (floor 4)** — control-leg kill-loot volleys == 2 (the killbundle-b staged result, reproduced on the new anchor; §3: no volley-path file changed between anchors) | == 2 for GO (else DIAG — base drift, not a lever verdict) |
| 5 | **Wave-3 specificity** — armed-leg wave-3 kill-loot volleys ≥ 3 (mechanistic expectation 7; the new firings must actually be at wave 3, not just re-timed wave-4/5 firings) | ≥ 3 for GO |
| 6 | **Tier-4 no-regression** — armed-leg tier-4 kill-roll rate within ±5pp of the control-leg rate (both legs carry 16 forced searcasters by construction; the comparison is leg-vs-leg, not vs the matched band) | must hold for GO |
| 7 | **Guardrails** (analyzer `--compare` floor-4 staged vs floor-3 staged) — starvation-death delta ≤ +2, median-survival delta ≥ −20 | must hold for GO |
| 8 | **Balanced panel (§15)** — panels built floor-4 vs floor-3 staged (16 matched seeds) via `scripts/build-cellgate-floor-panels-b.js`; `node scripts/balance-panel.js compare` completes; decision `review_required`; every metric status ∈ {descriptive, no_material_signal, not_observed, insufficient} (no regression signal) | must hold for GO |
| 9 | **Sense-test + re-arm record delivered** — a firing holder's story read as a village story (does anyone notice, equip, comment on the gun and its cells), and whether any holder re-arms after firing, in the evidence file | must be delivered |

**Verdict rule (frozen):** GO = bars 1, 2, 4, 6, 7, 8 pass AND
bars 3 AND 5 pass. NO-GO = bars 1, 2, 4, 6, 7, 8 pass AND bar 3
or bar 5 fails — the floor does not make the loaded gun fire.
DIAG = bar 4 fails (the floor-4 control does not reproduce
killbundle-b's 2 volleys — instrument or base drift, not a lever
verdict) OR bar 1 fails. A miss is NO-GO, never re-scored
against a friendlier metric mid-run (§14). If the armed fire
rate lands between the GO bar and the mechanistic expectation
(e.g. 5–7/16), the GO stands but the metric review says so
plainly: the floor moves the gun, but some expected firings did
not happen — name which holders and why.

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node scripts/test-killlootbundle-a.js`
  → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17; `node scripts/test-killrate-a.js` → 36/36;
  `node scripts/test-killrate-analysis-a.js` → 14/14;
  `node scripts/test-killarrive-b.js` → 12/12;
  `node scripts/test-killbundle-b.js` → 11/11;
  `node scripts/test-killbundle-b.js --live` → 11/11;
  `node scripts/test-gunrate-a.js` → 39/39;
  `node scripts/test-cellgate-floor-b.js` → 17/17;
  `node scripts/test-cellgate-floor-b.js --live` → 24/24 — all
  re-run on base `dbe748d46`. (Known pre-existing drift, NOT
  part of bar 1: `node scripts/test-cellgate-a.js` is 10/12 on
  this base — both failures are its stale `^  loosed` shot
  counter, which counts zero gun-verb lines after the Nov 22
  searvoice narration change ("the Searcaster fires — …" /
  "fires wide — …"); the game spends correctly — the failing
  fixtures show left=1 (1 shot loosed, monster died) and left=0
  (2 shots loosed) with planned=2. The arm test counts
  gun-verb lines instead. Fixing test-cellgate-a.js is out of
  this arm's area; recorded here and in the evidence infra
  notes, not silently dropped.)
- **Pilot (judged):** 8 staged seeds per leg, 107533–107540.
  Pilot expectation: 5 wave-3 volleys on the armed leg
  (107535, 107536, 107538, 107539, 107540), 0 on the control
  leg. **Pilot kill rule: 0 wave-3 kill-loot volleys on the
  armed pilot → kill the arm (effect invisible), no confirm
  spend.** Instrument check (anchor, policySha, floor labels,
  0 errors, 16/16 bundled per leg so far) before any confirm
  spend.
- **Confirm (judged):** remaining 8 staged seeds per leg
  (107541–107548).
- **Analysis (judged):** analyzer `--dir` per leg;
  `--compare` floor-4 staged vs floor-3 staged; tier tally per
  leg; panel build + compare; per-seed staged table in the
  evidence file (seed, staged arrival day/holder, cells, fights
  by wave, volleys, shots/hits/dmg) for BOTH legs, plus a
  matched per-seed table (days, end, wave, standing, deaths,
  contests, prize rolls, contest sear grants, kill-loot events,
  tier-4 rolls, kill-loot sear, sear volleys — as killbundle-b
  §1) for the armed leg.
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median/max survival.
- **Sense-test:** read the census/volley/grant records for a
  firing holder as a village story; the driver records no
  dialogue text, so the sense-test judges from equip/carry/fight
  behavior and any grant/corpse-take narration in the records —
  said plainly, not faked.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read; no
  canon doc covers the kill-loot roll table, the bundle, or the
  CELLGATE floor — the numbers are code-derived (killbundle-b
  §2, fieldFights.js:1032–1041), said here rather than
  inventing canon. Wave 3 is "The Final Draft" (day 25+ AND 4
  wave-2 ledger points); wave 4 is "The Mirror Draft"
  (standing ≥ 100). A wave-3 firing spends the cells on a
  mid-build fight (HP 240–420) instead of saving them for a
  wave-4+ mirror fight (HP 850–1500) — that trade is the
  design question the follow-up flip decision owns.

## 9. Infra notes

- **Metric review** (to be filled in the evidence file).
- The prereg + lever + driver recording + arm test + panel
  builder commit AFTER the pre-flight re-run on base
  `dbe748d46` and BEFORE any judged seed runs. If that commit
  moves the anchor, both staged corpora will carry the
  prereg-commit anchor (recorded in the evidence file); the
  floor-4-vs-floor-3 comparison is unaffected because both
  legs run on the same anchor.
- `node scripts/check.js --quick` run after the code change
  (repo rule); result recorded in the evidence infra notes.
