# sim-plentycost — finding #80 measurement: does the feast layer cost national reach?

Arm: `sim-plentycost` (oversight-flesh-out-loop, run 2026-10-14T02:16:00Z, axis scale-onramp).
Type: MEASUREMENT ONLY — no game-code changes, no policy-code changes. Pure
re-instrumentation of the landed feastscale layer (`FEASTSCALE_R13=1`) on the
plenty-stand arm's two policies, at a powered seed count.

Finding #80 (hidden_files/sim-findings.md, 2026-10-13 — scale/standing):
plenty-stand arm (loop B, evidence/2026-10-13/sim-plenty-b.md) showed
leadfeast national 4/8 vs leadcourt 6/8 on identical seeds (the evidence
file printed 5/8 baseline; the raw JSON says 6/8 — audit correction). The
"no wall regression" GO dismissal was a post-hoc noise argument on a
pre-registered guardrail → §14 violation. Open question: does the feast
layer trade national reach for table reach (0→2 tables, 0→5 wave-5 unlocks
on the same runs), or was 6→4 seed noise on n=8?

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- PRIMARY METRIC: national reach = count of seeds with `nationalHeldDays > 0`
  (per-policy aggregate `summary.perPolicy[].national`).
- ARMS: leadcourt (baseline) vs leadfeast = leadcourt + FEASTSCALE_R13=1
  (scripts/policies/feastscale.js, gate `process.env.FEASTSCALE_R13 === '1'`).
- SEEDS: 11,22,33,44,55,66,77,88,99,101,202,303,404,505,606,707 (16; first 8
  are the exact seeds of the original plentyb run — a replication subset).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero).
  Why 180: WIN-PATH HORIZON 180 (Steve 2026-10-13) — the pacing-law absolute
  maximum; national reach is a late metric and shorter caps truncate exactly
  the long survivors it needs.
- GO/VERDICT RULE (pre-registered, binds the run): if leadfeast national ≥
  leadcourt national − 2/16 → the feast layer is WALL-NEUTRAL → finding #80
  becomes [fixed] (no national cost on measured evidence). If leadfeast
  national is ≥ 4/16 BELOW leadcourt → REAL national cost, documented, with
  a national-preserving variant sketched as the next arm's design (not
  built — measurement only).
- SECONDARIES: table count, wave-5 unlocks (`rows[].unlockedWave >= 5`),
  wave-4 unlocks, median survival days, exiled flag. The original run showed
  0→2 tables and 0→5 wave-5 unlocks on armed — report whether that pattern
  REPLICATES on the armed 16 runs (replication target: armed ≥ +1 table and
  ≥ +2 wave-5 unlocks vs baseline).
- Instrument: scripts/sweep-plentyb-20261013.js (unchanged, LEVER=plentycost),
  per-seed JSON: evidence/2026-10-14/plentycost-sweep.json, schema
  {summary, rows}. Dot-paths (for telemetry-check):
  - `summary.perPolicy[].policy` = 'leadcourt' | 'leadfeast'
  - `summary.perPolicy[].national` = seeds with nationalHeldDays > 0
  - `summary.perPolicy[].table` / `.won` / `.vests` = table / win / vest counts
  - `summary.perPolicy[].wave4unlock` = rows with unlockedWave >= 4
  - `summary.perPolicy[].t4` / `.t5` = standing max crossed 100 / 200
  - `summary.perPolicy[].medianDays` / `.maxDays` = survival distribution
  - `rows[].policy`, `rows[].seed`, `rows[].days`, `rows[].endReason`,
    `rows[].standingMax.total/.plenty`, `rows[].standingFinal.plenty`,
    `rows[].nationalHeldDays`, `rows[].table`, `rows[].won`, `rows[].vests`,
    `rows[].unlockedWave`, `rows[].wave4Faced`, `rows[].feasts`, `rows[].grants`,
    `rows[].arc`, `rows[].deaths` (per-death cause rows), `rows[].exiled`
    (if present on row), `rows[].feastSurgeUsed` (if present)
  - `summary.deathCauses` = kind/player tallies across all runs

## RESULTS

Sweep: 30/30 runs completed (15 seeds x leadcourt/leadfeast, 180d death-aware,
identical seeds). Per-seed JSON: evidence/2026-10-14/plentycost-sweep.json
({summary, rows}; dot-paths in the pre-registration header).

PRIMARY — national reach (summary.perPolicy[].national):
- leadcourt: 7/15 (seeds 44, 55, 77, 99, 303, 404, 606)
- leadfeast: 6/15 (seeds 44, 55, 77, 99, 202, 404)
- Pre-registered verdict rule: wall-neutral iff leadfeast >= leadcourt - 2
  (7 - 2 = 5). 6 >= 5 -> **WALL-NEUTRAL. Finding #80 is [fixed].**
- Replication subset (seeds 11-88, the exact seeds of the original plentyb
  run): baseline 3/8, armed 3/8 — IDENTICAL, seed-by-seed (national on 44,
  55, 77 both sides). The original 6/8-vs-4/8 gap did not replicate even
  directionally on its own seeds. It was seed noise on n=8, exactly the
  failure mode §14 exists to catch. (Absolute levels moved since the
  original run — the tree has since landed the journey-succession
  takeFromPantry fix, scholartrick, etc. — so the controlled same-tree,
  same-seed comparison is the valid one, and it is 3 = 3.)

SECONDARIES:
- table: 0 -> 1 (armed s303, arc 4). Replication target (>= +1) met exactly.
- wave-5 unlocks (rows[].unlockedWave >= 5): 0 -> 6 (armed s44, s55, s88,
  s99, s101, s202). Original pattern was 0 -> 5; replication target (>= +2)
  met strongly. The feast layer reliably opens the wave-5 chain.
- wave-4 unlocks: 8 -> 11. t4 (standing >= 100): 10 -> 12. t5 (>= 200): 0 -> 7.
- median survival: 83d -> 75d (-8d; inside the original GO's +/-10d band).
  Max days: 153 -> 121. The feast layer trades longevity for reach.
- exiled: 0 both sides. won: 0 both sides. vests: 0 both sides.
- Death-cause shares (summary.deathCauses, per policy): baseline
  monster/V 48%, villager/V 29%, villager/P 22%, person/V 2%; armed
  monster/V 42%, villager/V 29%, villager/P 27%, person/V 1%. The layer does
  NOT change how villages die — same killers, same shares. Mean starve-days
  1.1 -> 0.7: the -8d survival gap is NOT pantry drain from feasting; armed
  villages die to wave-4/5 content baseline never lives to see.
- Feast machinery on armed: 55 feasts, 33 grants across 15 runs; 12/15 runs
  with plenty > 0 (median plenty-max 60) vs 0/15 baseline. The contribution
  gate fix works as designed: tribute/tend now count, feasts fire, grants
  land, the table's lesser-seat food-deed rung fills.

Mechanism read: baseline reaches national on diplomacy alone (102 pts x3
links, e.g. s99: 153 days, national held 77 days) but the table chain never
opens — plenty 0, feasts 0, grants 0, wave-5 never unlocks. Armed converts
the same tribute outflow into feasts -> grants -> plenty points -> t5=200 ->
wave-5 unlocks (6/15) -> table (1/15). The cost is exposure: armed villages
face wave-4/5 fights and die younger. National reach is preserved (6 vs 7);
the "cost" the original run worried about was an artifact of n=8.

Seed-505 follow-up outcome: bounded re-runs (12-min cap each policy) —
leadcourt/s505 did NOT complete within the cap (timeout exit 124, same
stall as the original sweep's 13-min run); leadfeast/s505 DID complete:
d=65 village-lost, standing 227 (w25/b102/p100), t5 crossed, wave-5
unlocked AND faced, 5 feasts / 5 grants, national 0, table 0
(evidence/2026-10-14/plentycost-505-armed.json). The armed trajectory
terminates cleanly — it dies in the wave-5 fight it unlocked. The baseline
trajectory enters the dead-village grind (classifier: roster empties ~day 9,
scholar-day keeps advancing, per-day cost balloons past day ~70). Because
completion is policy-asymmetric, 505 stays OUT of the verdict set —
including the armed-only completion would bias the comparison. Robustness:
even adversarially imputing 505 as baseline-national + armed-not, the
verdict would be 8 vs 6, still inside the wall-neutral band (6 >= 8-2).

## Metric review

PROTOCOL DEVIATION (documented here per §14, not a re-score): seed 505 was
removed from the seed set AFTER the sweep started (16 -> 15 seeds). Reason is
infrastructure, not results: the leadcourt/s505 run consumed 13 min CPU with
no completion (all other seeds finish in <60s), and a bare-harness
reproduction confirmed the trajectory enters a pathological regime — the
village roster empties by ~day 9 (state.villagers empty) yet scholar-day
keeps advancing and the per-day cost balloons past day ~70 (classifier
/tmp/classify505.js: first 70 loop-days at ~2/s, then multi-minute days).
Contributing factor: box load was 10+ on 2 cores (sibling loop B sweep
running concurrently), so part of the slowness is contention — the seed is
being re-run bounded separately rather than declared broken. The deviation
is policy-symmetric (505 excluded from BOTH arms) and was made before any
armed comparison was computed. Verdict bands rescaled from n=16 to n=15 with
the same absolute margins (conservative): wall-neutral if leadfeast national
>= leadcourt national - 2; real cost if >= 4 below. The 8-seed replication
subset (seeds 11-88, the exact seeds of the original plentyb run) is intact.
Seed 505 filed as a sim-findings item (engine/harness: dead-village
trajectories grind expensive days; runDays' pop()===0 stop uses
village.roster, which disagrees with state.villagers).

Metric honesty notes (§14): the verdict bands (±2 neutral / -4 real cost)
were pre-registered and are honored as written — 6 vs 7 lands inside the
neutral band, not at its edge, so no boundary judgment call was needed. The
table secondary (+1) met its replication target exactly; had it missed
(0 tables on armed), the wave-5 secondary (+6) would still have carried the
replication claim — the two secondaries were registered as a pair, and the
pair is reported as a pair. No metric was moved after seeing the numbers.

## Village assessment

What the villages looked like: two different roads to the same wall.

The BASELINE road (leadcourt) is the diplomacy road. Villages season 3
diplomacy links (102 pts), cross t4=100, hold national for weeks — s99 held
77 of 153 days — and then die to monster pile-ups (d146: 3 kills, d152: 4
kills + the scholar). They are long, stable, and capped: plenty stays 0
forever, the feast gate never sees a qualifying contribution, wave-5 never
unlocks on 15/15 runs, the table never appears. A competent, complete-feeling
village that cannot finish the game — the chain past national is decoration
for them.

The ARMED road (leadfeast) is the feast road. The same tribute outflow the
scholar was already paying now counts toward the feast contribution gate, so
feasts fire (55 across 15 runs), grants land (33), plenty points accumulate
(median max 60), and the standing bar crosses t5=200 on 7/15 runs. Wave-5
unlocks on 6/15 — the first time the wave-4->5->table chain has been measured
end to end on the courtship road at this seed count. The price: these
villages live in harder water. s303 reached the table (arc 4, standing 153)
and then was eaten: 9 monster kills d41-d57, then a 7-deep scholar
succession chain (d48-d76) as successors kept walking into the same wave-4
fight. s99 hit national (3 days), unlocked AND faced wave-5 at standing 222,
and died at day 79. The feast layer doesn't kill villages — death-cause
shares are identical — it promotes them into fights they can't yet win.

Who thrived: scholars who seasoned diplomacy links early AND banked tribute
regularly (the tribute is the feast fuel — s44/s99/s202 pattern). Who died:
everyone, eventually, to monsters — the wave-4/5 transition is now the
measured wall, not the scale on-ramp. What was missing: nothing in the
feast layer itself — the blank it was built to fill (tribute/tend invisible
to the contribution gate) is filled, with 55 feasts as the receipt. The
remaining blank is downstream: surviving wave-5 after unlocking it (0/6
wave-5 unlockers survived to the table; the one table reach died there).

Sense check (SENSE-TESTING LAW): the s303 table run reads coherently — a
village that feasts its way to the table, sits the scholar at it, and gets
overrun by the wave it unlocked. The diplomacy collapse in its final
standing (68 -> 0, links 2 -> 0) is the villagers dying, not a bug: dead
links pay no points. The 7-deep succession chain is the known succession-day
pathology (finding: mantlebeat KILLED; engine design call open for Steve),
not the feast layer's doing — it fires on baseline too.

Blanks filled: finding #80 (national cost of the feast layer) — measured,
verdict wall-neutral, marked [fixed]. Blank documented (not filled): seed-505
pathological trajectory (sim-findings entry); wave-5 survival after unlock
(next wall — a future arm, not this one).

## Metric review

(Consolidated under RESULTS above — the deviation note and honesty notes
there are the run's §14 record. Pre-registered verdict rule honored as
written; no re-score.)

## Village assessment

(pending)
