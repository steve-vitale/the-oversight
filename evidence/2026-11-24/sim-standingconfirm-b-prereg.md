# Confirm the standing-gearready pilot on a fresh band — Loop B, run fleshout-loop-b-20261124T0630Z, arm sim-standingconfirm-b (CONFIRM)

Axis: winnability chain (re-point 2026-11-03). CONFIRM-ONLY arm: zero
src/js changes. This arm re-measures, on CURRENT master, the pilot
verdict from evidence/2026-11-24/sim-standing-gearready-b.md (prereg
evidence/2026-11-24/sim-standing-gearready-b-prereg.md) on a FRESH
band with the SAME instrument, same policy, same horizon. No
before/after change is being tested — this is a re-measure, not a
lever. Gates and prices stay UNTOUCHED unless Steve orders otherwise;
this arm measures only.

## Ground truth being confirmed (pilot, 8 seeds 109301–109308, anchor f74931e6)

Pilot verdict DIAG-GO. The numbers below are the pilot's rates, used
ONLY to derive the frozen bars below — they are NOT pooled with this
arm's numbers and NOT cited as this arm's baseline. This arm's
baseline is its own judged leg on the current anchor (HEAD
`60f6e7436` at prereg time).

- 199 stall recurs 6/8 seeds, 311 village-days, ALL defer5
  (readiness deferral), 0 plenty-cap.
- National blocked no-polity 6/8, never-regional 2/8, 0
  UNCLASSIFIED; diplomacy 0 on every seed (max 1 link).
- Wave-5 faced 2/2 unlocked; ready days with standing short 0;
  standing-ok-but-not-ready 368 days.
- Wins 0/8, national 0/8 (scaleRank), table 0/8; wave-5 unlocks
  2/8; median survival 122.5 days.

## Seed-band freshness (§3 — verified before choosing the band)

Named band 109309–109324 is NOT fresh: seed 109309 was spent as a
dedicated probe by evidence/2026-11-24/journey-deepening-r278.md
("probe 109309 run 2nd (pilot config)"), a different policy/config
but the seed number itself is used. The band is therefore SHIFTED
by one: this arm runs 109310–109325 (16 seeds).

- Token check: grep for `10931[0-9]` / `10932[0-5]` across ALL of
  evidence/ (`*.md`) returns hits ONLY in the three files that name
  the reserved range string "109309–109324" itself
  (sim-standing-gearready-b-prereg.md, sim-standing-gearready-b.md,
  sim-winnability-round-0530.md) — no individual seed in
  109310–109325 is named, scored, or probed anywhere.
- Filename check: no file under evidence/ is named for any seed in
  109310–109325.
- Claims/tracker check: grep for `10931[0-9]` / `10932[0-5]` in
  hidden_files/lever-claims/ (live + .DEAD) and
  hidden_files/convergence-tracker.md returns ZERO hits.
- Contaminated-band list (journey-landing-r117, the standing
  record; recent preregs confirm no separate list file exists
  under evidence/): 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042,
  1043–1052, 1053–1062, 1063–1072, 1073–1082, 1083–1092.
  109310–109325 is in none of them.
- Nearest used bands: 109301–109308 (gearready pilot),
  109201–109208 (gatehorizon pilot), 109209–109216 (gatehorizon,
  RESERVED unspent), 107617–107632 (muster), 107533–107548
  (cellgate/rearm), 107447–107454 (launchfield-horizon-b),
  106111–106118 (laterage), 99101–99108 (standing99107). No
  overlap, no adjacency with 109310–109325 (109309, the spent
  probe, is adjacent at the low end and is excluded).

## Instruments (reused, verified present — NOT rebuilt)

- `scripts/standing-gearready-b-instrument-20261124.js`,
  `scripts/standing-gearready-b-driver-20261124.js`,
  `scripts/standing-gearready-b-analyze-20261124.js`,
  `scripts/test-standing-gearready-b-20261124.js` — merged on
  master from branch sim-standing-gearready-b, commit `f74931e6`.
  Verified on this tree's base (HEAD `60f6e7436`): all four files
  present, `git diff f74931e6 HEAD -- <those four files +
  scripts/policies/competent.js>` EMPTY (identical content; the
  pilot's instrument commit was re-landed as `667997065` on this
  branch's history). Proof `scripts/test-standing-gearready-b-20261124.js`
  re-run at prereg time: 31/31 PASS. Nothing was rebuilt; this is
  recorded so a later reader does not mistake the re-landing hash
  for a rebuild.
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (the CURRENT file at this anchor), default env. No env overrides.
- Seeds: 109310–109325 (16). Horizon: 150 days, death-aware (dead
  villages stop simulating; never a fixed 200d).
- Balanced panel (§15): INAPPLICABLE — a re-measure on a fresh band
  with the same instrument, no before/after change; no comparison
  is fabricated.

## Pre-registration (binding, §11/§14) — FROZEN BARS

Judge ONLY against these bars. Do NOT re-judge the pilot corpus.
A failed confirm is a result, not a failure to hide: if the
confirm contradicts the pilot on any frozen bar, say so plainly
in the evidence file.

CONFIRM-GO requires ALL of:

1. **199 stall recurs** — gated-199 days occur on ≥ 9/16 seeds
   (pilot rate 6/8 = 75%; bar set at a strict majority of the
   16-seed band, allowing the rate to fall by up to ~19 points
   and still confirm).
2. **ALL 199-hold days are defer5** — every day at gated 199 on
   every seed classifies as the readiness deferral (`kind:
   'defer5'`); 0 cap-hold days, 0 unclassified hold days.
3. **National block classified everywhere** — every seed gets a
   named national block (`reached-national`, `never-regional`,
   `no-polity`, `polity-unanswered`, `polity-dissolved`,
   `scale-refused`, `season-gate`) with supporting per-day
   evidence; 0 seeds UNCLASSIFIED; and among seeds that reach
   regional rank, no-polity accounts for ≥ 2/3 of them (pilot:
   6/6 regional seeds).
4. **Wave-5 faced on every unlocked seed** — for every seed where
   the door opens (peak reaches 5 / `unlockedWave() == 5`),
   wave-5 is engaged at least once (w5faced); 0 unlocked-but-
   never-faced seeds.
5. **Diplomacy 0 everywhere** — diplomacy standing points are 0
   on every seed at every snapshot; max active links ≤ 1 on
   every seed (pilot: exactly 1 on 7/8, 0 on 1/8).
6. **Instrument health (carried from the pilot DIAG-GO bar)** —
   complete per-day standing decomposition on all 16 seeds; 0
   unclassified standing deltas; 0 unclassified release/door
   events; 0 instrument errors; 0 orphan events (0 unlinked
   wave-3+ kill rows, 0 veteran-recount mismatches, 0
   unclassifiable feast rows); ladder track totals and tribute
   markers recorded on all 16 seeds.

Secondary rates (recorded, NOT judged — a move here is a
metric-review note, not a bar failure): ready days with standing
short (pilot 0); standing-ok-but-not-ready days (pilot 368 over
8 seeds); wins / national / table counts; wave-5 unlocks; wave-5
kills; median survival; death-cause shares.

## Sense-testing law

Transcripts are read: standing/hold/release say-lines, the
national-beat lines, and a sample of kill-beat / feast lines per
seed are judged for meaning, coherence, repetition, and robotic
behavior — never just counts. The sense sample lives in the
per-seed JSONs (`standingLines`, `releaseLines`, `saySample`) and
is quoted in the evidence file.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Per-seed JSONs under
  `evidence/2026-11-24/perseed-standing-gearready-b/` (same
  directory as the pilot corpus; filenames carry
  `-standingconfirm-b` in the RUN slot, so no pilot file is
  overwritten — the driver refuses to overwrite).
- Evidence `evidence/2026-11-24/sim-standingconfirm-b.md` with a
  per-seed table in the pilot's shape, pooled verdict per frozen
  bar, village assessment in plain words, wall numbers
  (wins / national / table / wave-5 unlocks + faced / median
  survival), and a "metric review" section (§14; no in-run
  re-scoring).
- Zero src/js changes. No push, no bump, no live verification
  (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
