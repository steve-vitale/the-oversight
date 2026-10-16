# Loop B run fleshout-loop-b-20261016T1350Z (TWO-ARM RUN, 2 KILLED-AT-PILOT, all landed)

## PRE-REGISTRATION
**Axis:** food-economy (second non-converged axis; loop A held scale-onramp per live claim fleshout-20261016T1215Z.json, zero file overlap by discipline).
**Substrate:** pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1, policies leadcourt/belongseek (racksmoke) / leadfeast/belongfeast (floorday3), 180d death-aware.
**Arms:**
1. sim-racksmoke-b — finding #50 named next: scholar works the VILLAGE SMOKE RACKS (rack-side). Primary: scholar smoke calls/run, GO ≥4/8 runs with ≥1 call (baseline 0/16).
2. sim-floorday3-b — finding #200 named next: 3-day feast drawdown floor (vs 2-day). Primary: starvation deaths, GO armed ≤ control.

## INFRASTRUCTURE
- Pre-flight: main tree dirty at run start (7 files: MEASUREMENT.md §14a-c commit in progress, kill-value audit rewrite, villager mapmem/objectives edits — main-agent Steve-directed work). Waited per sibling-mid-landing rule; tree went clean at 13:46Z via commit f32bfd9e. No lock/claim created until clean.
- Loop A landed sim-nodewitness (a2c02684, GO) and sim-raidshield (b7f5391e, KILLED) mid-run; master moved 3× (f32bfd9e → b7f5391e → 85e88ffb → 3a0ae842 → 08b1a323). Both B arms rebased cleanly, proofs re-run green, merged --ff-only.
- Loop A started a new run (fleshout-20261016T1355Z.json) during this run — no axis conflict (scale-onramp vs food-economy).

## ARM 1: sim-racksmoke-b — KILLED AT PILOT (landed 3a0ae842)
Policy layer scripts/policies/racksmoke.js (RACKSMOKE=1, default OFF): scholar at dawn works village smoke racks (takeFromPantry → preserveFood → donateToPantry, real verbs). Proof 24/24 GREEN.
Sweep: 8 seeds × {belongfeast, leadfeast} × {control, armed}, 32 runs.
PRIMARY NO-GO: 0/8 armed runs with ≥1 rack smoke call on both roads (bar ≥4/8). 0 preserve learns in 32 runs.
Root cause: scholar's preserveFood requires foodKind='meat' + foodState∈{cleaned,cooked}, but pantry meat arrives via stockPantry UNLABELED ("Snared meat", "Game meat" — no labels). ~28k kcal meat-by-name in pantry, 0 kcal scholar-smokable. The cook's label-blind path already works it. No policy-side reframing exists — verb widening or pantry labeling are src/js changes.
Steve-call filed (#50): should the verb accept unlabeled pantry meat, and in what state?
Layer deleted per kill protocol (zero src/js). Instruments + evidence landed. Sense: n/a (layer never fired).

## ARM 2: sim-floorday3-b — KILLED AT PILOT, invisible effect (landed 08b1a323)
Finding #200's floor isolated: rebuilt overdraw4 layer verb-verbatim as scripts/policies/floorday3.js with ONLY the floor constant gated (FLOORDAY3 unset=2-day, =1=3-day). Brief deviation documented: the floor does NOT live in game.js/hierarchy.js — it lived in the deleted overdraw4.js; rebuild was the only faithful A/B.
Proof GREEN (floor formula exact both settings; deep feast fires at 2-day, held at 3-day on fixture).
Sweep: 8 seeds × {leadfeast, belongfeast} × {control, armed}, 32 runs.
RESULT: 16/16 pairs byte-identical per-day hashes — the floor NEVER BOUND once. Starvation 0=0, national 11=11, median 122.5d=122.5d. KILL per pilot-gate doctrine (invisible effect).
Root cause (the real deliverable): the floor is STRUCTURALLY VACUOUS given the layer's own fd>4 overstock trigger — trigger implies maxDrawdown(2-day) > 2×burn (~48k), real feast costs 1.6–5k (max 3,828 over 174 events; min fresh-days-after 3.07). Binds ONLY in collapsed-burn regime (fixture-verified), which no run entered. #200's literal hypothesis ("feast drains TO the 2-day floor") is MECHANICALLY IMPOSSIBLE — overdraw lineage harm must come through drawdown VOLUME on thin-overstock pantries, not floor depth.
Named next filed: cap total daily drawdown outflow when fd<6, or lift trigger to fd>6. Finding #200 marked [answered].
Layer deleted zero-trace (byte-verified). Instruments + evidence landed.

## WALL NUMBERS (pre-seat courtship substrate, this run)
Both arms ran pre-seat by design: wins 0/64 (own controls 0=0). National ~11/16, median ~122-164d. Combat dominates deaths (racksmoke: 91 villager-combat + 130 combat of ~300 total). The wall in this regime is combat mortality, not food — consistent with the 1150Z run.

## TELEMETRY
Per-arm LOUD lines are substrate-explained (pre-seat by design; baseline is win-side stack). No drift. Baseline kept (national 12, table 16, wins 16, exiled 0).

## CONVERGENCE
food-economy stays converging. Landed levers remain prodthrottle + allowgate2.
- #50 (scholar smoke): rack-side closed — the pool is structurally empty (unlabeled pantry meat). Next is a Steve-call on verb widening, not another policy arm.
- #200 (drawdown floor): floor hypothesis CLOSED as mechanically impossible. Next is drawdown-volume/trigger, not floor depth.
- Remaining axis space: #340 steve-call (trust-ledger bind, awaiting ruling), aid×feast interaction (low priority), the mysterious 13:17Z crumbguard-pilot (main-agent activity, not duplicated by this run).

## METRIC REVIEW
- Racksmoke: primary (≥4/8 runs with call) was honest — the layer genuinely never fired. No metric issue.
- Floorday3: primary (starvation ≤ control) passed vacuously (0=0) but the kill rests on mechanism-engagement (16/16 identical), not outcome. Future floor-type pre-registrations need a mechanism-engagement check (did the floor bind?) alongside the outcome primary.
