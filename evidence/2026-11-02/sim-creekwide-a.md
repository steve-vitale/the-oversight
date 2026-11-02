# sim-creekwide-a — WIDE SCREENING run for the creekwood 12-case confirm (follow-up to Loop A 1155Z, blank 1)

Run: follow-up to fleshout-20261102T1155Z, arm sim-creekwide-a, axis
scale-onramp. Worktree branch: sim-creekwide-a. INSTRUMENT/POLICY
ONLY — zero `src/js` changes unless a minimal fix is proven with a
proof test (none planned). Sibling trees/branches NOT touched;
food-economy axis NOT touched (sibling Loop B live on it).
Tracker/claim/lock/rotation files NOT touched (coordinator's).

Canon read first: docs/CANON.md, docs/MAP.md §1–2 (creeks
top-to-bottom, ~35% of creek tiles need a bridge or a swimmer;
bridge it, swim it, or go around; buildBridge = 4 wood + 60 kcal
+ 96 ticks), plus the 1155Z round evidence
(evidence/2026-11-02/sim-scale-onramp-round-1155.md) and the
creekwood arm evidence (evidence/2026-11-02/sim-creekwood-a.md).
No creek/travel canon doc beyond MAP.md §1–2 states the
bridge/swim/go-around rule — quoted, not invented.

## PRE-REGISTRATION (written BEFORE any new screen or judged run)

- Primary deliverable: a completed 300-seed screen of range
  97690–97989 (59 prior + 241 new) + a baseline classification of
  EVERY new tier2C_both nomination.
- Screen tool: scripts/creekwood-geometry-20261102.js, map-gen
  only, zero days run, one process per seed. The 59 prior seeds
  are NOT re-screened and NOT re-scored; the merged ledger must
  preserve all 59 prior rows byte-identical (proven by
  scripts/test-creekwide-screen-20261102.js).
- Tier rule (same as the prior screen, verified against the prior
  ledger before screening: derivation reproduces all 10 prior
  nominations exactly): tier2C_both = (5,4) needsBridge AND
  (6,4) needsBridge; tierL_64only = (6,4) needsBridge only;
  tierM_54only = (5,4) needsBridge only.
- Baseline full runs: scripts/creekwood-driver-20261102.js
  ARM=base, DAYS=180, frozen creekdetour stack, one process per
  seed. Run for every NEW tier2C_both nomination, plus any new
  nomination judged a plausible two-creek-wall case (reason
  stated per seed in the results).
- Classification (from the baseline record, same fields as the
  prior screen): never-located = lairTile null, 0 marches;
  arrived = reached true (way + day reported); bridge-blocked =
  >= 1 bridgeBlocked march day (a march day stopped by an
  unbridged creek on the lair path). A seed counts as a banked
  confirm candidate ONLY if its baseline full run fails to
  arrive AND its geometry is a two-creek wall (per the 1155Z
  case rule: lair heard + >= 1 march + 0 arrivals + >= 1
  bridgeBlocked day + lair tile a needsBridge creek, with the
  two-creek-series split reported separately).
- GO threshold for banking a confirm candidate: a seed whose
  baseline full run fails to arrive AND whose geometry is a
  two-creek wall. The confirm itself (creekwood arrival on
  >= 50% of confirm seeds) is a FOLLOW-UP run, NOT this arm.
  NO confirm rate is claimed from geometry alone, and NO
  confirm rate is claimed from unclassified nominations.
- Guardrails: no src/js changes; worktree contains only
  committed work at closeout; sibling trees untouched.

## RESULTS

### Screen: COMPLETE — 300/300 seeds in 97690–97989

- Prior: 59 screened (97690–97707, 97790–97810, 97890–97909).
  NOT re-screened, NOT re-scored. New: 241 seeds (97708–97789,
  97811–97889, 97910–97989), one process per seed, 4 parallel,
  5m06s wall, 0 failures. Raw new lines:
  evidence/2026-11-02/perseed-creekwood-a/confirm-geometry-rest-20261102.jsonl.
- Merged ledger:
  evidence/2026-11-02/perseed-creekwood-a/confirm-geometry-ledger.json
  (screened 300). All 59 prior row objects preserved unchanged
  (deep-equal check passed); tier lists re-sorted ascending,
  prior seeds in order as subsequences. Correction to the proof
  test's mental model, disclosed: with interleaved seeds the
  prior tier lists are subsequences, not prefixes — the proof
  test's prefix property holds only for its synthetic
  largest-seed append, which is still valid as written.
- New nominations (33): tier2C_both [97753]; tierL_64only
  [97708, 97712, 97738, 97746, 97768, 97771, 97789, 97820, 97828,
  97844, 97855, 97857, 97868, 97879, 97913, 97914, 97943, 97987];
  tierM_54only [97724, 97731, 97770, 97788, 97829, 97834, 97853,
  97873, 97874, 97887, 97889, 97927, 97983, 97986].
- Totals over 300: tier2C [97753, 97898] (2); tierL 24;
  tierM 17; 43 nominations overall; 117/241 new rows carry at
  least one needsBridge tile somewhere in the corridor.

### Baseline classification (ARM=base, DAYS=180, creekdetour stack)

Every new tier2C nomination, plus every new nomination judged a
plausible two-creek-wall case on a non-row-4 series (reason per
seed below). Records: cw-base-s<seed>.json in
perseed-creekwood-a/.

| seed | geometry reason run | baseline verdict |
|------|---------------------|------------------|
| 97753 | tier2C: (5,4)+(6,4) both NB | NEVER-LOCATED — lair null, 0 marches, 0 calls, 0 attempts, 0 bridgeBlocked days; 92d, won, national, table |
| 97746 | tierL + row-5 series (4,5)-(5,5) both NB | NEVER-LOCATED — lair null, 0 marches, 0 calls, 0 attempts, 0 bridgeBlocked days; 90d, won, national, table |
| 97844 | tierL + row-5 series (5,5)-(6,5) both NB | ARRIVED — lair (7,4), first march d117, swimmer way, 1 call, 6 attempts, 0 bridgeBlocked days; 152d, won, national, table |
| 97855 | tierL + row-5 series (5,5)-(6,5) AND row-4 pair (6,4)-(7,4) both NB | NEVER-LOCATED — lair null, 0 marches, 0 calls, 0 attempts, 0 bridgeBlocked days; 90d, won, national, table |
| 97913 | tierL + row-4 pair (6,4)-(7,4) both NB (lair (7,4) would sit behind two NB creeks in series) | ARRIVED — lair (8,4), first march d87, detour way, 1 call, 193 attempts, 0 bridgeBlocked days; 103d, won, national, table |

- Bridge-blocked days: 0 on all 5 new baselines, as on all 10
  prior nominations. No baseline full run in this screen has
  EVER recorded a bridgeBlocked march day.
- Remaining new tierL/tierM nominations NOT baseline-run, with
  reason: single-NB geometries with no adjacent NB pair anywhere
  in the corridor cannot be a two-creek wall on any row (a wall
  needs two NB creeks in series between haven and lair); running
  them would spend full runs on seeds that cannot satisfy the
  case rule's two-creek shape. The one exception class — a
  single NB tile paired with a crossable creek — is a
  single-creek crossing, not a wall, and the confirm bar targets
  walls.

### Confirm candidates banked: 0

GO threshold (baseline fails to arrive AND geometry is a
two-creek wall, i.e. the 1155Z case rule: lair heard + >= 1
march + 0 arrivals + >= 1 bridgeBlocked day + lair tile a
needsBridge creek) is met by NO seed. The three never-located
seeds fail the lair-heard leg; the two arrived seeds fail the
0-arrivals leg; all five fail the bridgeBlocked leg (0 days).
No confirm rate is claimed from geometry alone or from
unclassified nominations, per prereg. The confirm (creekwood
arrival on >= 50% of confirm seeds) remains a FOLLOW-UP run,
still with 0 cases banked.

### Yield implication (plain words)

The screen did NOT find zero new tier2C cases — it found one
(97753) — but that seed, like the only prior tier2C seed
(97898), never hears a herald at all: its double-creek corridor
holds no lair. Across the full 300-seed screen, 2C geometry
predicts a lair 0/2 times, and the confirm-case yield is 0/300
screened (0/15 baseline-run nominations across both screens
meet the case rule). The 1155Z lesson stands and sharpens:
corridor-creek geometry does NOT predict a lair, because lair
hearing depends on run dynamics, not the board. Banking 12
two-creek-wall cases at this yield needs thousands of seeds
screened, or — the cheaper question for the next run — a
nomination signal that predicts lair hearing, which map-gen
alone cannot give. The bridge leg itself is unaffected: it
fired 1/1 on its wall seed in the pilot; the confirm simply
still has no seeds to judge it on.

## Metric review (for the NEXT run, not this verdict)

- The confirm bar (12–16 two-creek-wall cases, >= 50%
  bridge-assisted arrival) is now 0/300 on case yield across a
  complete screen. The next run should either (a) commit to a
  multi-thousand-seed screen, or (b) revisit whether the bar's
  shape fits a one-in-hundreds wall type — that question stays
  open for the next run, it does not change this run's verdict.
- Tier nomination should be widened in future screens to
  adjacent-NB pairs on ANY corridor row (this run found row-5
  series and a (6,4)-(7,4) pair the row-4-only tiers miss);
  the row-4 tiers are retained for continuity, not replaced.
- The proof test's merge-prefix property is valid only for
  appends at the end of seed order; real merges interleave and
  must assert subsequence + deep-equal rows instead. Future
  merge proofs should assert the interleaved invariant.

## Sense-testing

- 97753, 97746, 97855 marched never (0 marches, no transcript
  to judge) — nothing robotic to flag; the villages simply never
  heard a herald, and their runs still won on the national/table
  path, which is itself coherent (the herald is not the only road).
- 97844 (lair 7,4, d117): "Scouts found its lair — tile 7,4.
  THE HERALD — the sky, getting bigger. It is WAITING. You
  cannot face it alone. Sound the call." → "THE CALL GOES OUT"
  the same day. Coherent: found, called, answered.
- 97913 (lair 8,4, d87): lair found d87, call d88, three
  villages answer BY NAME with trust-holds narration (Emberhold:
  Zoe Haddad, Victor Dubois, Oscar Nakamura, Jesse Petrov; The
  Bloodied: Hank Santos, Ruth Moreau; The Red Table: Deshawn
  Nakamura, Tomás Kowalski). Named, counted, and trusted — reads
  like people answering, not a counter incrementing.
