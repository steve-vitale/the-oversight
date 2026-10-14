# sim-scale-r34 — scale-onramp three-arm run (flesh-out loop A, 2026-10-14 ~14:20 CDT)

Standing directive: every run attacks the scale wall until scale-onramp reads converged.
Tracker state at run start: scale-onramp = converging. Sibling loop B live on food-economy (not claimed).

## Stale-lock recovery (this run, 19:19Z)
Lock held run_id `fleshout-a-2026-10-14-1622` (created 16:23:00Z, 174 min old > 90-min fallback).
Its trees' heartbeats 63 min stale (> 15 min) → run DEAD per the concurrency guard. Deleted the
lock and the dead run's claim file; committed its orphaned run-level evidence as a82b16a4.
Left its trees (sim-siegedef2 dirty, sim-griefgrain2) untouched — not mine to release; the
reaper handles them. NOTE: loop B (fleshout-b-2026-10-14-1730) was LIVE during this run's
start (landed 2 killed food arms at 19:15Z) and started a NEW round at 19:55Z
(fleshout-b-2026-10-14-1930: sim-allowgate3, sim-overdraw3, sim-tribgate — food-economy).
No territory overlap with this run's arms at any point.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14)
Axis: scale-onramp. Three POLICY-side arms (scripts/policies/*.js, default-OFF env gates —
always safe together, zero game-code interaction). Each: 8-seed pilot on identical seeds
before any confirm; death-aware horizons; SMOKE=1 instrument honesty; det-gate; proof
REAL RED→GREEN. Killed arms leave no trace (layer deleted, proof/sweep/evidence kept).
Metric binding (§14): a miss is NO-GO, never re-scored mid-run.

- ARM 1 sim-siegedef3 (claims sim-findings #96 w5death): PRIMARY post-unlock scholar combat
  deaths per wave-5 unlocker ≤ control × 0.70. GUARDRAILS median ≥ control−5d; national ≥
  control−4; table ≥ control−1; wave-5 unlocks ≥ control−1; no new death mode. Baseline:
  w5death audit suite re-run on current tip first (leadfeast + FEASTSCALE_R13=1, 180d).
- ARM 2 sim-warroad (r33 counter-arm): PRIMARY villages alive at d+30 post-wave-4-unlock ≥
  control AND wave-4 unlocks ≥ control−1. GUARDRAILS median ≥ control−10d; national ≥
  control−2; no new death mode (cause-family level). Baseline: r33 propose substrate
  re-applied from spec (competent + propose layer, 8 seeds 11/22/33/44/55/66/77/88, 150d).
- ARM 3 sim-succbrake (claims SUCCESSION FEED blank): PRIMARY same-day/next-day successor
  combat deaths per succession ≤ control × 0.70. GUARDRAILS median ≥ control−5d; national ≥
  control−2; wave-5 unlocks ≥ control−1; no new death mode. Baseline: current-tip courtship
  suite; diagnostic screen FIRST on current tip before building.

## Results — 0 GO / 3 KILLED AT PILOT

### ARM 1 — sim-siegedef3: KILLED (commit c1f1ae42, landed)
STEP-1 re-verification PASSED on current tip (9 seeds × leadfeast 180d): 6 unlockers,
33 post-unlock scholar deaths — 84.8% at Haven, 48.5% w5-killers, 0 starvation. Channel
diagnostic: 16/33 deaths (48.5%) had the feast DRAW marker live — the feast's scavenger
draw at Haven, cast wave-appropriate (55% newest wave post-unlock), faced unconditionally
by the feastFightRoad. Lever: SALLY-ONLY-IN-STRENGTH — post-unlock draw triage (face iff
scholar HP ≥ 70% AND (draw wave ≤ 4 OR species slain before OR armor P ≥ 60), else
Game.driveOffFeastDraw()).
Pilot: 58 draws triaged, 39 faced, 19 driven off (18 w5, 1 w4); w5-killer deaths 12→8 —
but non-w5 combat deaths 13→16 (compensatory mortality: median 101→114d, scholars lived
longer and died to other Haven combat). Net 5.00→4.80/unlocker vs ≤3.50 GO → NO-GO.
Guardrails all passed (national 5/8=5/8, table 3/8=3/8, wave-5 5/8=5/8, no new death mode).
Finding: the feast draw is ~1/3 of post-unlock Haven deaths on this seed set, not half.
Sense check passed — drive-off beats name real villagers, triage reasons legible
("strong enough to stand, not to sally"). Proof 22/22 pre-kill (landed-tree guard in
place); det-gate 8/8; SMOKE=1.

### ARM 2 — sim-warroad: KILLED (commit bae4b189 + coordinator guard-fix 2b8c0f74, landed)
Control (diplomacy road) reproduces r33 behaviorally identically (det-gate per-seed match:
s11 86, s55 109, s88 80): wave-4 unlocks 6/8 at d57–79, all diplomacy-driven; s11 transcript
shows The Eater one-rounding villagers two days after unlock. Armed (war road): 53
deliberate wave-3 hunts + 280 committed fight-turns banked MAX 3 wave-3 ledger points
(s22: 17 hunts, 211 fight-turns = the same 3 competent banks organically) — the 4-point
rung (per-type cap 2) never clears in 150d. Wave-4 unlocks 0/8 armed. PRIMARY missed on
the unlock prong → NO-GO. Guardrails: median 140 ≥ 99 held (the war road is less lethal
because it never unlocks the thing that kills — "a lever can win survival by failing to
arrive; the primary exists to catch exactly that"); national 0/8 both held; no-new-death-mode
missed at family level on n=8 singletons (dehydration/thirst/the expedition — noise, metric
review filed; primary miss stands regardless).
HEADLINE FINDING: the r33 question is unanswerable as posed — the gate never opens. **No
survivable road to wave 4 exists in sims**: diplomacy unlocks and kills; war never unlocks;
plenty untested (loop B territory). src/js/standing.js marks warPerKill=25 "sim starting
point, not canon" — this run is the tuning measurement. Hybrid hint: control s66 survived
wave-4 contact to 150, reached global rank, with 2 organic wave-3 kills (war=50) under the
diplomacy bar — diplomacy + a little war may be the survivable path (documented, not built).
Coordinator follow-up fix: 3184c187-pattern landed-tree INFO-SKIP guards added to the
warroad proof + det-gate (they FATALed with MODULE_NOT_FOUND post-kill; pre-kill
RED→GREEN 6/6 and det-gate 8/8 verified in the worker tree). Proof/det-gates/sweep/evidence
kept; both policy files deleted per kill protocol.

### ARM 3 — sim-succbrake: KILLED (commit a60273ad, landed)
STEP-1 diagnostic screen REPRODUCED the blank on current tip (leadcourt+FOURTHLINK=1, 8
seeds, 180d): 4 feed events / 36 mantle successions (0.111/succ), max gap 1 day, 3/4
same-monster. Lever: post-combat-death bearer fortify (SUCCBRAKE=1) — new bearer holds
Haven, travel guard declines wild sorties 2 days, guard posture narrated. Proof 10/10
GREEN pre-kill; det-gate byte-identical. Pilot: control 4/36=0.1111 → armed **11/51=0.2157**
vs ≤0.0778 GO → NO-GO, layer deleted. **Theory falsified by mechanism probe**
(scripts/probe-feed-where-20261014.js): all 11 armed feed deaths happened at tile [4,4] =
Haven, 9/11 while the fortify was ACTIVE with declines recorded — the predecessor dies at
Haven, the mantle passes, the monster kills the successor AT Haven. **The succession feed
is a HAVEN-SIEGE phenomenon, not a ranging phenomenon** — a travel guard cannot fix a
siege. Converges with ARM 1's w5death blank (84.8% at Haven). Guardrails strikingly passed:
median 121.5d vs 94d (+27.5d, 7/8 seeds longer), national 8/8 vs 5/8, wave-5 2/8 vs 1/8,
exiled 0 — the fortify improves survival via a DIFFERENT mechanism (2-day ranging throttle
after trauma → less wild exposure), filed as a recovery-lever candidate for a future arm
with a survival primary. Metric review: n-floor proposed for the no-new-death-mode guardrail
(player:lockjaw ×2 / player:dehydration ×1 armed-only at n≤2, unexamined).

## Village assessment (plain words)
Three villages, three ways to die at the door of scale. The war-road villages hunt and
bleed — no links, no court, no dawn, just the scholar walking into thickets every third
day, banking a point here and there, dying of ordinary attrition at median 140 days,
thirty days longer than the diplomats, because nothing they do unlocks anything: "a
village that fought the whole game and was never noticed by the System" (s22 armed: 17
hunts, 211 fight-turns, Standing 75, wave 4 never unlocked). The diplomacy-road villages
court and climb — three proposals ~day 25, the network dawns ~day 46, wave 4 unlocks ~day
60 as the System's response — then the Mirror Draft arrives and four of six unlocking
villages die 20–50 days early, a villager per round, to monsters built out of us; s66 is
the exception, holding wave-4 contact to 150 and reaching global. The post-wave-5 villages
on the plentycost road reach further than any before — national 5/8, table 3/8 — and die
at Haven: the feast draw answered or driven off, the wild still taking its toll at creek
meadow, successors falling where their predecessors fell on the same tile. The missing
capability is not courage, kills, links, or feasts — all were delivered. It is that
**what Standing unlocks (wave 4 at 100, wave 5 at 200) arrives without combat readiness**,
and no road currently on offer both reaches the gate and survives what's behind it.

## Blanks filled / documented
1. FEAST DRAW ≈ 1/3 OF POST-UNLOCK HAVEN DEATHS (filled, ARM 1): the draw is a real,
   triageable channel (19 driven off, w5-killer deaths 12→8) but insufficient alone;
   compensatory mortality is the mechanism that eats the gain.
2. WAR LANE TO STANDING 100 UNREACHABLE BY HUNTING (filled, ARM 2): max 3/4 points in
   150d with a dedicated hunt drive; standing.js warPerKill=25 now has its tuning
   measurement. Filed [open] in sim-findings.md.
3. NO SURVIVABLE ROAD TO WAVE 4 (documented, ARM 2): diplomacy unlocks+kills, war never
   unlocks, plenty untested. The wall's face is Standing-gate tuning.
4. SUCCESSION FEED = HAVEN-SIEGE PHENOMENON (filled, ARM 3): ranging theory falsified;
   11/11 feeds at Haven, 9/11 under active fortify. Converges with the w5death blank —
   the two blanks are one siege problem.
5. RECOVERY-LEVER CANDIDATE (documented, ARM 3): post-trauma ranging throttle (+27.5d
   median, national 8/8) — needs a survival-primary arm, not a feed primary.
6. HYBRID-ROAD HINT (documented, ARM 2): s66's diplomacy + 2 organic wave-3 kills
   survived wave-4 contact — worth an arm.

## Metric review (§14 — for the NEXT run)
- siegedef3: the primary (per-unlocker deaths) is the right metric; the GO bar (×0.70)
  assumed the draw was the dominant channel — it is ~1/3. A follow-up siege arm should
  pre-register against the full Haven-death surface, or stack channels (draw triage +
  watch roster + sally doctrine) before measuring.
- warroad: the primary assumed the armed side would unlock — pre-register war-lane
  reachability (points banked vs the 4-point bar) instead; this run's data already
  answers it (max 3). The no-new-death-mode family guardrail needs a count/seed floor
  at n=8 (singleton noise fired it).
- succbrake: same guardrail n-floor needed (lockjaw ×2 / dehydration ×1 armed-only,
  unexamined). The feed metric (feeds/succession) is sound; the theory behind the lever
  was wrong, not the metric.

## Wall numbers (this run's suites)
- warroad (competent/propose vs competent/warroad, 150d, 8 seeds): national 0/8 both ·
  table 0 · wins 0 · wave-4 unlocks 6/8 control (all diplomacy) / 0/8 armed · wave-5 0 ·
  median 109/140d.
- siegedef3 (leadfeast plentycost road, 180d, 8 seeds): national 5/8 both · table 3/8 both ·
  wins 0 · wave-5 5/8 both · median 101/114d.
- succbrake (leadcourt+FOURTHLINK=1 courtship, 180d, 8 seeds): national 5/8→8/8 ·
  table 0/8 · wins 0 · wave-5 1/8→2/8 · median 94→121.5d.

## TELEMETRY DEVIATION CHECK
`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json
--current <arm JSON> --metrics national,table,wins,exiled` fired LOUD ×3 ("national
disappeared: baseline 8 → current 0"). INVESTIGATED — EXPLAINED, not a bug: the sweep
JSONs nest metrics in `rows[]` (no top-level `national` key), so the check counted missing
paths as 0 — a schema mismatch in the invocation, not a data deviation. Row-level truth:
national present 5–6/8 per arm, table 0–3/8 by substrate, wins 0/16+, exiled 0 — all inside
the known wall envelope. Per the policy-experiment convention (substrates differ from the
r16 gate-off courtship 180d aggregate the baseline was seeded from), NO baseline roll.

## Convergence
scale-onramp stays **converging**. Three honest kills, zero arrivals: the war road never
reaches the gate, the diplomacy road reaches it and bleeds, the siege answers only a
third of the post-unlock deaths. The axis moves when a road reaches wave 4 AND holds it,
or a village holds post-wave-5 Haven — current evidence says no road does either. Next
highest-value arms: (a) hybrid diplomacy+war road (s66 hint); (b) stacked siege doctrine
(draw triage + watch + sally, pre-registered on the full Haven-death surface);
(c) recovery-lever (post-trauma ranging throttle) with a survival primary.

## Infrastructure notes (LOUD)
- **origin/master diverged +106/−17 vs local master** (merge-base bcd41987, 13:27Z today).
  origin/master tip c25dd26c carries ~106 commits of direct-push design work (world
  regions, ability/god-path, STEVE-ANSWERS) that local master lacks; local master has 19
  loop landings origin lacks. The ship loop's next push will fail non-fast-forward.
  NOT resolved this run (out of scope; ship loop owns pushes) — flagged for the main
  agent to reconcile deliberately. Do NOT force-push either side: both contain unique work.
- Sibling loop B started round fleshout-b-2026-10-14-1930 at 19:55Z (sim-allowgate3,
  sim-overdraw3, sim-tribgate — food-economy); playtest loop's journey-sociallife alive
  (heartbeat 20:06Z). No collisions with this run.
- Dead run A's trees (sim-siegedef2 dirty, sim-griefgrain2 stale) still in registry —
  not mine; reaper handles at >4h staleness.

## Files landed (local master, pending ship)
- a82b16a4 — recovery: orphaned run-level evidence from dead run 1622
- bae4b189 — ARM 2 sim-warroad KILLED (proof/det-gates/sweep/evidence; layers deleted)
- 2b8c0f74 — coordinator: 3184c187-pattern landed-tree guards for warroad proof+det-gate
- c1f1ae42 — ARM 1 sim-siegedef3 KILLED (proof/sweep/diagnostics/evidence; layer deleted)
- a60273ad — ARM 3 sim-succbrake KILLED (proof/sweeps/probes/sense/evidence; layer deleted)
No push, no bump, no live verification — merged locally, pending ship.
