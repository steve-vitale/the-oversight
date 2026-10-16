# Run fleshout-20261016T1355Z — THREE-ARM RUN, 2 GO / 1 DIAGNOSTIC-GO, all landed

**Axis:** scale-onramp (blocking; standing directive override of the lever rotation).
**Claim:** hidden_files/lever-claims/fleshout-20261016T1355Z.json (filed before any sims, deleted at run end). Loop B held the live claim on food-economy all run (fleshout-loop-b-20261016T1350Z, zero file overlap by discipline).
**Substrate (all arms):** pre-seat courtship (SEATDRIVE=0 explicit), FEASTSCALE_R13=1, policies leadfeast/belongfeast, 180d death-aware.

## Pre-registration (run-level)

- Primary metric: arm-specific GO per arm (below). Multi-arm independence: two game-code arms touch non-overlapping files (havenGrowth.js vs game.js); the third is read-only instruments.
- Guardrails (game-code arms): national ≥ control−2, median survival ≥ control−10d, no new death mode — else the fix does not land (revert zero-trace).
- Horizon: 180d death-aware (72% field-exposure channel needs the late game).
- Seeds: 8 fresh per arm (941–948 / 951–958 / 961–968), control+armed within-pair on identical seeds.

## Arms

### sim-crisistier — GO (LANDED de49bea3→rebased; commit f6cecf3c on master)

Finding #420 fixed: havenRaidTick raised aid crises with `wmax = max(m.wave||1)` over raiders, but world-monster entities never carry `.wave` — every raid crisis raised tier 1, so the call-for-help wave≥3 apex penalty (score −10, trust ~57+ gate) never applied. Added `Game.crisisWaveOf(m)` (def lookup by id, the raidshieldWaveOf/apexpredators recipe; def authoritative, unknown→1).

- PRIMARY GO: 9/9 tier attribution RED→GREEN on probe raids (pre-fix wave-4/5 raids captured tier 1; post-fix tier 4/5; wave-1 unchanged).
- Guardrails HOLD: national 11/16 = 11/16, median 121d = 121d, no new death mode. 16/16 pairs metric-identical and 16/16 beat files byte-identical — expected: competent policies never call for help, so the fix is behavior-neutral on this substrate; its surface is the aid-acceptance math when aid is actually called.
- `[needs-eyes]` (aid-call acceptance odds change on wave-3+ raids when help is actually called).
- Sense-read: leadfeast-s945 d138 wave-4 Eulogy — tier is a number, never spoken; narrative coherent.
- Named next: a help-calling policy arm measuring acceptance/refusal splits on apex raids end-to-end (the aid chain still has no organic caller on the competent substrate).
- Wall (pre-seat): national 11/16, table 14/16, wins 0/16, wave-4/5 15/16, median 121d. Deaths 90% combat-family; starvation 0.6% — villages die fighting, not starving.

### sim-tricktag — GO (LANDED de49bea3 on master)

Finding #405 fixed: the TB kill path called `recordWaveKill(m.mdef.id, this.villagerId, 'player')` — villager-companion killing blows in player-initiated TB fights tagged `via='player'`, `trick=null`; counter-executed TB kills never attributed. Three surgical edits in the recordWaveKill region (+46/−6): `tbDamage` stamps the killing-blow source (`t._tbKilledBy`); `tbEnd` resolves it per dead monster (`by=<companion vid>, via='companion'`; scholar/unresolvable → legacy); `trickSummaryFor` rides along; `TRICKTAG_OFF=1` honesty hatch.

- PRIMARY GO: (a) conservation 16/16 — re-tags, never re-counts (e.g. control `player:16` → armed `player:15 + companion:1`, identical kill counts/hashes); (b) 7/7 companion entries clean; (c) path fires — 7 companion entries, 4 trick-attributed (d60 speedbump_turtle by=jovan_milic via='companion' trick='keep_distance,keep_distance'; d17 nevermore trick='sidestep').
- GUARDRAIL: det-gate 16/16 byte-identical trajectories — attribution-only confirmed; no behavior-arm reclassification.
- Proof 24/24 RED→GREEN on real TB fights; re-verified 24/24 after the master rebase.
- Sense-read: Jovan vs the Speedbump transcript — village learns keep_distance, Jovan fights it at range, kill attributed to Jovan with the trick. Fiction and telemetry agree.
- Wall (identical both sides): national 11/16, table 15/16, wins 0/16, median 131d, death causes identical.
- Seed-freshness caveat documented in evidence (951–958 carry prior evidence hits; within-pair identical-seed comparison unaffected).

### sim-execensus — DIAGNOSTIC GO (LANDED 5d4cbcb4 on master)

The sim-nodewitness named next: measure the execution window on the landed witness channel (zero src/js). NODEWITNESS=1, 16 runs (armed-only census), per-fight gate-eval capture via the engine's own `villagerTrickAction` gates.

- PRIMARY GO: 100% attribution — 8/8 witness-sourced learnings traced (5 w4, 2 w5, 1 w1, all shared-bar).
- Do learned tricks fire? Only ONE type in 16 runs: network_note's `bad_note` (7/7 post-learning fights). Congregation (3 fights), reunion (3), eater (2), editor (5): zero executions.
- When it fires: bad_note 7× → 5 villager flights, 2 villager deaths. The trick works as the fiction promises ("the lasers never arrive") but doesn't change damage-race outcomes — a debuff, not a fight-ender.
- Where the funnel breaks: conditions-never-met 65% (13/20 field fights). Gates assume multi-round fights or stocked material; hyper-lethal field fights end round 1–2: congregation needs round 3, editor needs 2 consecutive strikes, eater needs spoiled food on the fighter (never carried), reunion needs 2 strikes thrown. 2/8 learnings had zero post-learning fights (explicit no-opportunity verdicts).
- Design-level finding: GATE/FIGHT-SHAPE MISMATCH — multi-round trick conditions vs one-round massacres. Villagers know the tricks; the fights don't last long enough for conditions to arise.
- Steve-call #411 stays OPEN — the diagnostic names options without picking: (1) condition-widening, (2) material-precondition sourcing, (3) earlier learning, (4) gate/fight-shape alignment (root-cause candidate), (5) win-survival.
- Wall: national 7/16, table 14/16, wins 0/16 (pre-seat by design), wave-4 13/16, wave-5 5/16, median 115d.

## Telemetry

3 LOUD lines investigated same-run — ALL EXPLAINED, baseline kept (national 12, table 16, wins 16, exiled 0):
- wins 16→0 on all three arms: substrate-mismatch (pre-seat by design; own controls 0=0).
- national/table raw-count LOUDs on the 32-file sets: n-mismatch artifact (baseline aggregates are 16-run; rates match: national 0.69 vs 0.75, table 0.88–0.94 vs 1.00).

## Metric review (§14)

- crisistier's primary (tier attribution) bound correctly; guardrails held exactly (11=11, 121=121) — the behavior-neutral-on-substrate result was predicted by the worker's mechanism reading (no organic help-caller) and documented honestly rather than scored as a wall win.
- tricktag's det-gate guardrail was the right bar for an attribution fix; conservation (a) is the anti-regression spine.
- execensus's 100%-attribution primary forced instrument completeness; the two no-opportunity verdicts are explicit, not silent zeros.

## Infrastructure

- Mid-run master movement (playtest loop journey-establishment + loop B run summary): two of three merges needed rebase-then-merge; proofs re-run green on rebased bases (9/9, 24/24); --ff-only exits captured unpiped both times.
- Bogus staged deletion of evidence/2026-10-16/sim-loopb-1350Z.md appeared in the main-tree index mid-run (worktree file byte-identical to HEAD); resynced with `git read-tree HEAD`. Attribution unknown; file intact.
- All three worktrees registered with WT_RUN_ID=fleshout-20261016T1355Z (lock's run_id matches registry heartbeats); released+removed after landing; branches deleted; main tree verified clean after each landing.

## Convergence state

scale-onramp: converging. Two honesty fixes landed (crisis tiers now read def waves; companion TB kills now attribute), both behavior-neutral on the competent substrate — they repair the aid-acceptance math and the trick telemetry for future arms rather than moving the wall. The execution window is now measured: the funnel's named next is the gate/fight-shape mismatch (a steve-call-adjacent design question, not a lever to pull blindly). Directive lift remains a Steve call.

## Blank-fill record

- FILLED (fixed): #420 — raid crisis tiers now read the data-def wave (Game.crisisWaveOf).
- FILLED (fixed): #405 — TB-path companion kills carry by=<vid>, via='companion', trick summary.
- FILLED (measured): the execution window — learnings→executions funnel on the nodewitness channel (8 learnings, 7 executions all bad_note, 65% conditions-never-met, gate/fight-shape mismatch).
- DOCUMENTED: DoT-tick attribution edge (tricktag named next); help-calling policy arm (crisistier named next); execensus per-seed `witnessSourced` labeling caveat.
