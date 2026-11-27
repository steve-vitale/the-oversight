# sim-launchfit-b — PREREG (frozen before any judged sim)

## 0. Question

Do launched parties depart spent? (Tracker blank #5; findings line 2748;
launchready DIAG-NO-GO, evidence/2026-11-24/sim-launchready-b.md; ragecarry
confirm §10, evidence/2026-11-24/sim-ragecarry-b-confirm.md.)

The ragecarry lead: parties launch members at ~14 HP with unloaded weapons
(Alberto, seed 107902 day 66, vs The Suburb — sling, no stones, 14 HP, dead
in round 1). The launchready DIAG could not answer whether Alberto is the
pattern or the outlier: its dawn-census join covered only 0.047/0.081 of
departures vs the 0.80 floor. This arm builds the fresh-band
departure-stamping driver the DIAG prescribed and answers the question on a
fresh band. This arm MEASURES ONLY. If the shape confirms, the named next
fix is a departure-fitness check (arm + load before launch), NOT a damage
lever — that fix is NOT built here.

## 1. Frozen bars (judge only against these; a miss is NO-GO, never re-scored)

| Bar | Threshold |
|---|---|
| B1 stamp coverage | ≥ 0.80 of departures stamped with a complete per-member loadout row (the floor launchready failed at 0.047/0.081) |
| B2 distribution complete | ≥ 10 launches stamped; report per-member HP (median, quartiles, share < 50 HP, share < 25 HP), armed share, loaded share among ranged carriers, ammo per ranged carrier |
| B3 verdict stated | Alberto pattern-vs-outlier + half-armed confirmation, with numbers (launchready's armed-share median 0.5 on 255 arm + 286 ctl launches is the reference shape to confirm or refute with loadout data) |
| B4 instrument health | 0 instrument errors across the band; determinism byte-identical on a re-run of one seed |

Verdict: DIAG-GO iff B1–B4 all pass (the instrument answers the question);
DIAG-NO-GO iff B1 fails (the corpus cannot answer it, same as launchready).
B2/B3 are the answer itself, not a lever GO — no game-code change is judged
here.

## 2. Method

- Seeds: 111101–111108 (8 seeds, pilot = confirm; this is a measurement arm,
  no lever leg, so the 8-seed pilot IS the band).
- Policy: competent verbatim (`scripts/policies/competent.js`, `competent()`).
  No policy variant. No game-code change (instrument only).
- Horizon: 150 days, death-aware — dead villages stop simulating (+10d tail
  max via runDays endReason).
- Driver: `scripts/launchfit-driver-b.js` (one process per seed, sim-harness
  `loadGame`/`runDays`, seed before eval). Instrument:
  `scripts/launchfit-b-instrument.js`, wrapping `Game.winPlanDepart` and
  `Game.vbrainExecuteDepart`. At every departure with result `hold` or
  `launch`, stamp BEFORE the original call runs (departure instant; pure
  read — no RNG touch, no state mutation, determinism preserved) one row
  per departure with a `members[]` array, one entry per party member
  (holder vid + plan.party; brain departs also include commit companions):
  - `hp`: `Game.state.village.health[vid]`, default 100 when absent (same
    convention as the aguard driver). `hpFrac` = hp / 100.
  - `melee`: equipped melee slot itemId + `weaponBonusOf` bonus (0 = none).
  - `ranged`: equipped ranged slot itemId + bonus; `volley` = true iff the
    ranged def carries `weapon.ammo` (equipment.volleyWeaponOf convention).
  - `ammo`: units of the ranged weapon's ammo item in the member's items
    (0 when no volley weapon or no ammo item). `loaded` = volley weapon
    present AND ammo > 0. Melee-only members are `loaded: null` (no load
    state); unarmed members are `armed: false, loaded: null`.
  - `armorP`: `equipment.armorOf` protection (context, not judged).
  - `armed`: weapon bonus > 0 OR a weapon item carried (gearOfReplica
    convention, so the armed share is comparable to launchready's 0.5).
- Analyzer: `scripts/analyze-launchfit-b.js` — reads the per-seed JSONs,
  computes B1–B4, the distributions, and the verdict. Proof:
  `scripts/test-launchfit-b.js` (quartile math, stamp completeness,
  loaded/ammo classification on synthetic rows, determinism on a real
  per-seed file).
- Per-seed files: `evidence/2026-11-27/perseed-launchfit-b/launchfit-b-s<seed>.json`
  (refuse to overwrite; flap-safe writer). Analysis JSON alongside the
  evidence file.
- Balanced panel (§15): single-leg measurement — no candidate leg exists to
  compare. The §15 artifact attached is the telemetry deviation check
  (`node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-27/perseed-launchfit-b/*.json' --metrics
  national,table,wins,exiled`) plus a reference comparison of the fresh
  band's armed share against the ragecarry corpus (0.5 median). The panel
  is NOT the judge here; the frozen bars are.

## 3. Seed-band freshness check (run before freezing)

- Grep every dated prereg under `evidence/` for 111101–111108 and for the
  fallback band 111201–111208: ZERO hits (the only raw hits for the digit
  strings were float substrings such as 29.107361111111107).
- No per-seed file `s11110[1-8]` / `s11120[1-8]` exists under `evidence/`.
- Forbidden/contaminated lists named in preregs (ledgerbound 9700–9711,
  9930–9941; raidcallers 9950, 10000; fallbackfeared 74201–74208;
  fullseatgate/w5block 73601–73608 et al.) name no 1111xx band.
- Band 111101–111108 is FRESH. Fallback if a collision is found on
  re-check: 111201–111208 (also verified clear above).

## 4. Wall numbers (reported every run, not judged)

Wins, national reach, table, wave-5 unlocks, median survival — from the
per-seed summaries (scaleRank, progState table flags, unlockedWave,
days/endReason, Game.won).

## 5. Metric review (to be filled at closeout; bars NOT re-scored)

- (filled in the evidence file)
