# sim-winnability-round-1130 — Loop B 1130Z coordinator evidence

- **Run:** fleshout-loop-b-20261112T1130Z, Loop B, axis winnability-chain.
- **Claim:** `hidden_files/lever-claims/fleshout-loop-b-20261112T1130Z.json` — arms
  sim-cut2confirm-b + sim-mcconfirm-refresh-b. Confirm duty on Loop A's most
  recent landed lever (bisect r5 cut 2, `2215e22d4`) on a fresh 16-seed band,
  plus the measurement-hygiene blank (stale mcconfirm-ctrl summary + cache-flags
  30s spawn cap). No new food-economy arm (parked). No src/js change by either arm.
- **Stale-lock recovery at start:** the run deleted the dead 0930Z lock (2h+ old,
  past the 90-min fallback; no registered trees/heartbeat for its arms — both
  landed, branches deleted), retired its claim to `.DEAD`, and recovered its
  coordinator evidence, committed as `ce89f2b77` (own branch, ff-only).
- **Coordinator landing:** the run TIMED OUT during coordinator landing. Adopted
  in the main session: arm-1 proof re-run 66/66 green on the tip, ff-only
  merge to `0c18b4841`, worktree released as done-merged. The service
  restarted mid-`worktree remove --force`: the release had landed
  (registry done-merged) but the worktree's `.git` file was lost mid-remove,
  so `git worktree remove` refused ("`.git` does not exist"). Recovered after
  verifying all content on master (HEAD == `0c18b4841`, worktree was clean):
  `git worktree prune` + `rm -rf` the husk dir + `git branch -d`. Main tree
  clean. If the `.git` loss recurs outside an interrupted remove, it is a
  pattern to chase, not a one-off.

## Arm 1 — sim-cut2confirm-b: CONFIRMED + REGIONAL_INTACT (landed `0c18b4841`)

Confirm duty on bisect r5 cut 2 (`2215e22d4`, the 262nd commit in the window)
on FRESH seeds 190601–190616. Full evidence:
`evidence/2026-11-12/sim-cut2confirm-b.md`; corpus
`evidence/2026-11-12/perseed-cut2confirm-b/` (16 per-seed JSONs);
proof `scripts/test-cut2confirm-b.js` 66/66 green before the band, after the
band, after the rebase, and on the adoption tip.

| Rule (prereg) | Result |
|---|---|
| ≤4/16 survive → CONFIRMED | **MET: 2/16** |
| ≥11/16 regional → REGIONAL_INTACT | **MET: 14/16** |

- **The collapse generalizes.** 2/16 survived, median 129d (r5 band: 2/8, 144d),
  deaths 1493 (93.3/seed vs 86.1), wave-5 unlocks 7/16 (44% vs 50%).
  Nothing in the fresh band contradicts r5; the collapse is not a property of
  eight particular seeds.
- **The rank stall is not entirely gone.** Regional 14/16 vs r5's 8/8. The two
  village-rank seeds (190607, 190614) are real: whatever lifts villages out of
  village rank between the merge-base and cut 2 lifts 14 of 16 fresh villages,
  not all of them.
- **The wave-5 choke is exact on fresh seeds.** Peak living wave-4+ veterans
  reach 2 on exactly the seven seeds that unlock wave 5 (190601, 190605,
  190609, 190610, 190611, 190615, 190616) and 1 or 0 on the nine that don't.
  The choke is a two-veteran coincidence problem, not a pipeline problem —
  now measured on two independent bands (r5: 4/8, confirm: 7/16, same rule).
- **Wall numbers:** national 0/16, table 0/16, wins 0/16; wave 4 unlocks
  16/16. The scale wall stands.
- **Veteran bars:** phantom days 0 on all 16 seeds (roster-check fix holds);
  shadow-prevented days 3 on 190602 only (the fix does visible work on fresh
  seeds). Tribute ready at end on 0/16 — every seed ends veterans-short (0–1
  against a need of 2); the two survivors come closest at 1 of 2.
- **Sense test:** veteran kills announced on camera by name; Mirror Draft on
  all 16 seeds; ARC IV fires on 14/16 — all 14 regional seeds, neither
  village-rank seed. **ARC IV tracks rank, not survival.** A future arm that
  judges rank should pre-register the ARC IV read. The tribute stays voiceless
  (0 mentions, 0/16 tribute-ready); the scream-freeze line repeats 65× on its
  third consecutive leg with a different monster's name — a fixed 65-count
  family, not a per-leg accident.
- **Standing pin:** standing ends at exactly 199 on 7/16 seeds — the t4-1 hold
  on an emptied roster, not a mid-run stall (bars met on 15/16 seeds mid-run).

## Arm 2 — sim-mcconfirm-refresh-b: (a) GO, (b) NO-GO (landed `78d39f56e`)

- **(a) GO — mcconfirm-ctrl summary refreshed to the 16-seed merge leg**
  (analyzer re-run, byte-identical reproduction, jointVerdict(1,5)
  INCONCLUSIVE, proofs 51/51 + 16/16). The stale-summary item
  (`mergeLeg.seeds: 8`) is now resolved.
- **(b) NO-GO — cache-flags cap measured** (p95 87.5s round 1, 104.9s round 2),
  100s candidate failed 3/3 (2/3), cap reverted to 30s. The "revisit the cap"
  item is answered: **30s stays.** Zero src/js changes.

## Gate

`check.js --quick` on merged master `2f796d59b`: **334 passed, 6 failed in 990s**
— the standing set, gate GO on the standing adjudication. The 6: 2× 120s load
timeouts (living-garden, one-person-army — CPU-starvation under load, the same
signature as the 0930Z/0730Z gates), the staleness pair (proof-update +
workflow — "Proof source inputs are not current", the ship-bump artifact;
round 9 owed), cache-flags (the 30s spawn-timeout artifact — this run's own
arm 2 measured the 100s candidate failing and the cap staying at 30s),
phone-frame-proof (pre-existing stale receipt). Slowest: one-person-army 120s,
living-garden 120s, occupation-panels 113s (passed). Zero attributable to
either 1130Z arm (evidence/tooling only, no src change). Log:
`hidden_files/sim-winnability-round-1130-gate.log`, cache
`/tmp/jest-cache-adopt-1130`.

## Telemetry

Attempted and REFUSED by the tool itself — recorder-corpus class ("all 16
--current rows carry top-level anchorCommit, so they are sweep recorder rows,
not runs"). Recorded, not waived. No `--update-baseline` passed; no claim here
needs a new baseline.

## Follow-up owed

1. **Bisect round 7** (Loop A, in flight at adoption time:
   sim-bisect-r7-cut-a + sim-stallcut32-a) — collapse cut ~360th commit, stall
   cut ~32nd commit, per the round-6 evidence §8s.
2. **Proof refresh round 9** — b8 staled by the ship bump; owed on the next
   manifest change.
3. **Lane B r182 crisis adoption** — pending the 08:00 Loop B run (the 07:00
   run stood down on the frozen 12:58:04Z heartbeat; orphan hbloop killed in
   the main session). If that adoption also times out, main-session adoption.
4. **ARC IV / rank correlation** — pre-register the ARC IV read on the next
   rank-judging arm (§6 above).
5. **"A Elder veteran" grammar** — filed in sim-findings.md; a
   sim-eldergrammar-a tree was registered after this run (in flight).
6. **Gate fill** — this file's Gate section, once the background gate lands.
