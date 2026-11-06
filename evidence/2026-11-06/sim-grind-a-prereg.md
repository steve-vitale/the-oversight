# sim-grind-a — prereg: characterize the 41-HP grind (finding #1829)

Run: fleshout-20261106T2256Z, Loop A. Axis: scale-onramp / winnability chain.
Arm: `sim-grind-a`, worktree `~/workspace/worktrees/sim-grind-a`.
Tracker blank (1) from the 2130Z entry: the 41-HP GRIND.

## The shape to characterize

- Partydamage band 87001–87008 (evidence/2026-11-06/sim-winnability-round-1630.md,
  sim-partydamage-b.md §"The grind, seen again (87008 d131)"): five scholars died in
  one day grinding one Reunion with no kill; field fights 13 per leg, 0 kills both legs.
- Baseline9 (evidence/2026-11-06/sim-baseline9-a.md §"Grind economics"): the village
  pays 2–5 scholar deaths per grind kill; whether same-day re-fighting of a wounded
  beast is the intended road to wave-4 kills, and whether the price is legible to
  the player, is a design question.
- CORRECTED READING (verified from the committed partydamage corpus before this
  prereg — see fixture in scripts/test-grind-20261106.js): the "1,825 → 41 HP"
  headline conflates TWO Reunion instances on 87008 armed d131. Beast A (maxHp
  2405): fought once, 1825 → 1689, never re-fought. Beast B (maxHp 1200): fought
  FOUR times the same day, 484 → 404 → 273 → 127 → 41 HP, scholar dead every
  fight, 0 kills. Scholar deaths d131 total SIX (sanne_bakker, app_mgpspihx941,
  ava_garcia, james_okonkwo, visjoin_74, visjoin_129 — all inCombat, "the wild"),
  i.e. one d131 scholar death is NOT in a traced wave-4 TB fight (open census
  question for the evidence file). Village lost d132, the day after.

## Seeds — FRESHNESS (mandatory check, per local_seed_band_freshness skill)

- Suggested band 99611–99618: REJECTED — COLLIDES. 99611–99612 lie inside the
  named 99601–99612 fleerepair confirm band (named in evidence/2026-11-04/
  sim-fleerepair-confirm-a-prereg.md and a dozen other preregs); 99613–99624
  are the stayrecover band (evidence/2026-11-05/sim-stayrecover-a-prereg.md).
- Chosen band: **99641–99648** (8 seeds).
- Scope searched before this prereg: ALL dated preregs
  (`evidence/*/sim-*-prereg.md`); ALL dated evidence `.md` files (all dates);
  per-seed corpus filenames under `evidence/`; the tendbelow forbidden list
  (99001–99008, 99009–99024 contaminated, 99041–99052, 99101, 99201–99216,
  99217–99232, 99401–99412, 99601–99612, 99701–99708, 99801–99808,
  98701–98716, 89701–89707, 83601–83800, 16101–16116, 99901–99912).
  Result: ZERO hits for any of 99641–99648 in preregs, in any dated `.md`,
  in any corpus filename, and the band is absent from the forbidden list.
  (Also checked and rejected: 99301–99308 — the diplo-b band, used
  2026-11-04; 99631 — 17 files under evidence/ mention it, passed over
  without adjudicating the hits.)
- Seeds: 99641–99648, competent policy verbatim, unmodified. ONE leg only
  (characterization, no armed leg — there is no lever this run).

## Design (staged, per docs/MEASUREMENT.md §§9–12, 14–15)

- Horizon: 150d death-aware (runDays ends on village death / win; +10d tail max).
- Policy: `scripts/policies/competent` verbatim, unmodified. No game-code change.
- Instruments (scripts only, zero src/js): `scripts/grind-instrument-20261106.js`
  (partydamage recorder + a fieldFight wrapper: entry HP/frac, rounds, outcome,
  mHpLeft, vTaken, mDealt, contact-finish/volley/committed-finish flags, and a
  WeakMap instance id per world-monster entity so re-fights of the SAME beast
  are provable, not trail-read), `scripts/grind-driver-20261106.js`,
  `scripts/grind-analyze-20261106.js`. Corpus:
  `evidence/2026-11-06/perseed-grind-a/` (8 files, one per seed).
- Proof: `scripts/test-grind-20261106.js` — analyzer correctness on fixtures
  PLUS the 87008 d131 grind shape reproduced from the committed partydamage
  corpus (4-fight 1200-max chain 484→404→273→127→41, all scholar-death,
  0 kills; 6 scholar deaths d131).

## Primary metric (pre-registered — binds the run, §14)

The field-grind distribution, on band 99641–99648, competent, 150d:
- rounds-to-kill per field fight (wave-4+), HP left at fight end,
  scholar deaths during grind windows, same-day re-fight counts,
  damage-per-round in the tail (entry frac < 15%).
- **GO = the grind characterized with numbers PLUS a named finisher-sizing
  lever OR a ruled-out verdict (the grind is fine / not a lever).**
- Guards: wall numbers reported every run (national / table / wins,
  wave-4/5 unlocks + faced + kills, median survival); no gate / price /
  deed / readyDemand change (none is in scope — characterization only).

## Guardrails (from the brief — binding)

- (a) If a lever emerges touching rounds-capping or armor-ignoring hits, it
  belongs to Loop B's sim-bypass-b this run — NAME it in the evidence, do NOT
  build it.
- (b) The wound-mill ruling stands (Steve 2026-10-27: defenders finish a
  crippled beast they meet if they can — risk-weighted, not unconditional).
  Check whether that ruling is actually wired for FIELD fights, and if it
  isn't, name that as the next arm rather than building it here.
  (Code read before this prereg: fieldFights.js DOES carry a contact-finish
  for wave ≥ 3 — one strike, lroll([4+wb, 8+wb]), when a beast is met already
  below its break line (mBreak 0.15 wave ≥ 2) — plus the twoblow committed
  finish in-round and the cornered-party hold (lingererSortie only). Whether
  that wiring actually finishes tails in sims is what the corpus must show.)

## Metric review (to fill at closeout)

- Pre-registered metrics bind this run. A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. If the metric proves wrong, write it
  here and propose the revision for the NEXT run.
- Convergence state to report: converging | converged | parked | killed-at-pilot.
