# ARM "succbrake" — the succession-feed brake (scale-onramp) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-succbrake`. Run: oversight-flesh-out-loop, run 2026-10-14T19:40:23Z, axis scale-onramp. ARM 3 of 3 (coordinator claim: sim-succhaircut, sim-wave5posture, sim-sucfightback — this arm took the succession-feed blank).
Base SHA: 1c57df85 (local master at registration; origin/master has diverged +106/-17 — see "Base note" below; the arm worked the registered base per the landing protocol).

## The blank

sim-findings.md #132 (OPEN): SUCCESSION FEED — post-unlock successors take the mantle and die to the SAME monster the same day (s44 d71: two bearers to The Suburb, devon_okafor tenure start==death day d71; s44 d89: two bearers to The Rerun, fatima_hassan tenure d89==death d89; s44 d110: contest+combat same day, The Audit). "No mechanic slows the succession feed — the serial chain is the mortality wall's engine, not just its symptom." (w5census r26.)
The r28 spiralcond arm (ARM 2, same run) measured its succession-feed marker ("successor dies to the SAME monster within 48h") at **0 fires / 16 runs** and named the next step: "measure its base rate before building on it" (#205 lesson).

## Canon read

- docs/CANON.md (manifest + standing rules). No canon doc covers succession-feed brakes specifically; the design below uses only existing engine verbs (travelTo, say, displayName) and the existing policy path (fourthlink/leadcourt/competent). The guard-posture fiction ("the village sets a watch") is new narration, flagged as a design call Steve can overrule.
- Engine facts used (read, not invented): ledger.js playerDeath moves the new bearer to the haven tile on succession (`s.mx=4; s.my=4; map.px=village.px`); the death tele carries `player:true` (scale-wall r17); competent's ranging legs handle failed travelTo gracefully (forageTripSeedFirst's `continue`).

## STEP 1 — diagnostic screen (mandatory, #205 lesson)

`scripts/sweep-succbrake-diag-20261014.js` — instrument-only, courtship suite (leadcourt + FOURTHLINK=1), seeds 11/22/33/44/55/66/77/88, 180d death-aware. Tenure tracking via the da71901e pattern (daily hook + after playerDeath + on death tele — a successor who takes over and dies the same day is invisible to once-per-day sampling; 0c86f98c quarantined the old sampler for exactly this gap). Same-monster attribution via combat_start pairing-lite (w5census-lib pairFights).
Gates: SMOKE=1 instrument-honesty PASS (wraps=none vs wraps=all byte-identical); A/A determinism PASS on s11/s44 (feed metric identical across invocations — the r27 deterministic clock holds on this road).

**The blank REPRODUCES on the current tip** (`evidence/2026-10-14/sim-succbrake-diag.json`):
8 seeds, 36 mantle successions, **4 feed events (0.111/succession), 3 same-monster**:
- s11: tenure d82 → dead d82 (gap 0) to The Reunion — same monster as the predecessor.
- s44: d63 The Suburb (gap 0, same), d70 The Influencer (gap 0, same).
- s66: d48 → d49 (gap 1), The Callback → Spool (different).
The serial chain is TIGHT: 3/4 gap 0, 1/4 gap 1. **N=2 tuned from this** (covers gaps 0..2 — the observed max plus one day of margin).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE the armed run (in scripts/sweep-succbrake-20261014.js header)

- **Question**: does a policy-side succession brake — the new bearer fortifies (holds Haven, no wild combat sorties) for N=2 days after any scholar combat death — break the serial chain?
- **Primary metric**: same-day/next-day successor combat deaths per mantle succession (aggregate feeds / mantleSuccessions), armed ≤ control × 0.70. Control measured 0.1111 → **GO bar: armed ≤ 0.0778**.
- **Guardrails**: median survival ≥ control−5d (94−5=89d); national ≥ control−2 (5−2=3); wave-5 unlocks ≥ control−1 (1−1=0); no new death mode (no player:cause key in armed absent from control).
- **Horizon**: 180d death-aware (harnessstop tail). **Seeds**: 11/22/33/44/55/66/77/88 × courtship. **Policies**: control = leadcourt+FOURTHLINK=1; armed = +SUCCBRAKE=1. Identical seeds, deterministic (A/A proven).
- Metric binding (§14): a miss is NO-GO, never re-scored mid-run.

## The layer (scripts/policies/succbrake.js, SUCCBRAKE=1, default OFF) — DELETED per kill protocol

Gate off → the wrapper delegates to fourthlink verb-for-verb (proof R1/G8; sim det-gate 2/2 byte-identical). Gate on → wraps fourthlink:
(a) each daily/upkeep scans telemetry for new scholar deaths; a combat-category death opens/extends the fortify window (deathDay + 2, chained deaths extend);
(b) inside the window: walk home if away (bounded honest hops), say the guard-posture line once per window, then run the base daily+upkeep under a travel guard — any travelTo away from the haven tile is declined (`{moved:false}`, callers handle it); combatExit (flee-by-barrier) always passes; haven chores (sort, donate, teach, talk, eat, drink, gear, feasts) run normally.
No new verbs; every call is an existing engine path. Design calls (Steve can overrule): N=2; the guard-posture fiction; combat-only trigger (non-combat deaths recorded, don't fortify).

## Proof: scripts/test-succbrake-20261014.js — 10/10 GREEN pre-kill (REAL RED verified)

- R1 (RED): gate-off daily+upkeep delegate verb-identically, no tracking state.
- R2 (REAL RED): gate-off + scholar combat death → the successor's daily still ranges wild (the blank, unblocked).
- G1: combat death → fortify (guard say once, wild declined, haven passes, base daily ran, names the dead and the living).
- G2: expiry after FORTIFY_DAYS; G3: chained death extends; G4: non-combat death doesn't fortify; G5: combatExit passes; G6: walk-home bounded haven-ward; G7: upkeep guarded.
- G8 (det-gate): gate-off 3-day scripted run — identical verb sequences + ctx keys.
- SMOKE=1 instrument-honesty subset 3/3. Sim det-gate: gate-off wrapper vs raw fourthlink, seeds 11+44 — byte-identical rows + suite.
- Post-kill: layer deleted per protocol; this proof INFO-SKIPs when the layer is absent (spiralcond precedent); the 10/10 pre-kill result stands as documented here.

## Results — PRIMARY MISSED → NO-GO → KILL

Control (`evidence/2026-10-14/sim-succbrake-control.json`, re-run through the pilot driver — reproduces the diagnostic exactly):
- PRIMARY: **4/36 = 0.1111** feeds/succession; median 94d; national 5/8; wave-5 1/8; exiled 0/8.

Armed (`evidence/2026-10-14/sim-succbrake-armed.json`):
- PRIMARY: **11/51 = 0.2157** feeds/succession — vs GO bar ≤ 0.0778. **MISS (rate nearly doubled).**
- Guardrails: median **121.5d** (vs 94d, +27.5d ✓); national **8/8** (vs 5/8 ✓); wave-5 **2/8** (vs 1/8 ✓); exiled 0/8 ✓. New keys in armed: `player:lockjaw` (2), `player:dehydration` (1) — n≤2, both existing engine causes; reported as a watch item, not a new mode (see metric review).
- Per-seed days (ctrl → armed): s11 86→120, s22 151→123, s33 37→97, s44 102→145, s55 93→94, s66 58→152, s77 109→132, s88 95→98. 7/8 longer.

GO verdict (§14 binds): PRIMARY 0.2157 ≤ 0.0778? NO → **GO MISSED → KILL.** Guardrails all passed, but the primary binds per §14.

Kill protocol: `scripts/policies/succbrake.js` DELETED. Proof/sweeps/probes/sense/evidence retained as documentation (the layer is rebuildable from this spec).

## Why it missed — the mechanism probe (the real finding)

`scripts/probe-feed-where-20261014.js`: mapTile + fortify state at every scholar combat death, all 8 armed seeds.

**Every scholar combat death in the armed runs happened at tile [4,4] = Haven** (5 wild-tile deaths excepted, none of them feeds). **All 11 feed events happened at Haven; 9/11 while the fortify was ACTIVE** (declines recorded — the guard was working).

The s44 d63 case, probed deep (`scripts/probe-feed-mechanism-20261014.js`): gen_bptywtw dies in combat at Haven (fightLive=false at death — no inherited fight); the fortify fires (fortifyUntil=65, 3 wild sorties declined); the successor gen_vdwdu0v holds Haven ([4,4]) — and dies there the same day to The Suburb (fighters ["You","suburb"] at death).

**The lever's theory of change is falsified.** The serial chain is NOT "the policy sends the successor back out onto the ranging legs." It is a **HAVEN-SIEGE phenomenon**: the monster kills the bearer AT Haven, the mantle passes (the engine moves the new bearer to Haven), and the monster kills the successor AT Haven the same day. A travel guard cannot fix a siege — the successor is already home, and home is where the killer is. The 2/11 unfortified feeds (s33 d98 ×2, declined=0) are the same phenomenon on a day the scan hadn't yet seen the deaths.

The survival/scale improvement (+27.5d median, national 8/8) is real but comes from a different mechanism: the 2-day hold after combat deaths throttles ranging exposure overall (fewer sorties → fewer wild deaths → longer lives), not from breaking the feed chain. That is a **recovery lever**, not a feed brake — a different claim needing its own pre-registered test (see "Candidate for a future arm").

## Village assessment

Eight villages on the courtship road, living noticeably longer under the brake (7/8 seeds +, median +27.5d) and scaling further (national 8/8 vs 5/8, two wave-5 unlocks vs one). The longer lives are what surface the feed: the siege phenomenon is a late-game pathology — armed feeds skew later (d63–d118) than control feeds (d48–d82), because the villages survive into the threat band where named monsters come to Haven. s66 armed is the clearest case: 58d → 152d, national reached, but the longer run accumulated a d68–69 feed (Highbeam Deer at Haven). The villages that die early (s33 control d37) never meet the siege; the villages that live meet it repeatedly. Who thrived: the commons — longer-lived villages kept more links, paid more tribute, taught more. Who died: bearers, at home, in sight of the fire — 50 scholar combat deaths armed vs 30 control, all but five at the haven tile.

## SENSE-TESTING (scripts/sense-succbrake-20261014.js, seed 44, armed)

The guard-posture line fired once (d63): "🕯️ After Divya's death, Carlos holds Haven — no wild sorties for 2 days. The village sets a watch. The mantle needs a living bearer." It names the dead and the living and states a decision with a reason — reads as a village regrouping, not a system alert. Honest critique: "no wild sorties" is policy-speak; a human line would be "nobody ranges till the watch stands down." Noted for any revival. The surrounding transcript reads as people (raid beats with named grudges, the Codex paging on its own for the dead, the first-grave crisis beat). No robotic surface from the layer itself — one line per window, no spam.

## Blanks filled / documented

- **Measured** (not chased): the succession-feed base rate on the courtship road — 0.111/succession, max gap 1 day, 3/4 same-monster (diagnostic, deterministic). The spiralcond #205 question ("measure the base rate") is now answered for this road.
- **Falsified** (this arm): the ranging theory of the feed. The feed is a Haven-siege phenomenon — proven by tile-level attribution (11/11 feeds at [4,4], 9/11 while fortified). Filed to sim-findings.md as the corrected mechanism.
- **Documented** (sim-findings.md): (1) the fortify's survival effect (+27.5d median, national 8/8) as a recovery-lever candidate with its own pre-registration; (2) the origin/master divergence (+106/−17 vs local master) as an infra note for the coordinator; (3) `player:lockjaw`/`player:dehydration` n≤2 watch item.
- **Candidate for a future arm** (not this run — §14): a SIEGE-response lever — when a combat death happens AT Haven, answer the besieger (drive it off / kill it, gorgedrive-adjacent) or move the successor off the tile; and/or a RECOVERY lever — re-test the 2-day hold with a survival primary (median/national), not a feed primary.

## Metric review (§14)

GO missed: armed 0.2157 vs ≤ 0.0778 required. Per §14 this is NO-GO, not re-scored — the layer is killed.

The metric was fair for the claim (the lever said it would cut the feed; it didn't) but the theory behind the lever was wrong, which the metric correctly exposed. Two revisions proposed for the NEXT run, not this one:
1. The feed-rate denominator (per succession) is confounded by run length: longer-lived villages meet more sieges. A future feed metric should be rate-per-day or stratified by run phase — or the lever should target the siege directly.
2. The "no new death mode" guardrail needs an n-floor (e.g. n≥3 or rate-based): n≤2 rare-cause appearances on longer runs are noise, and the current key-presence form will false-positive on any longevity-improving arm.

Honest counterpoint recorded: the guardrail improvements are large (+27.5d median, +3 national) and consistent (7/8 seeds longer). If the primary had been survival-shaped, this would be a GO. It wasn't — and §14 forbids re-scoring. The recovery-lever re-test is the honest next step.

## Telemetry deviation check (scripts/telemetry-check.js)

- Armed flat aggregate (`evidence/2026-10-14/sim-succbrake-flat-armed.json`) vs
  `hidden_files/telemetry-baselines/scale-wall.json`: **quiet** (1 file, 4 metrics, no large deviations).
- Verdict: no same-run anomaly. **Baseline NOT rolled forward** — the arm is killed; the scale-wall baseline tracks
  the wall across runs and must not absorb a killed arm's numbers (renegans/succession precedent).

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv | exiled |
|---|---|---|---|---|---|---|---|---|
| control (8) | 5/8 | 0/8 | 0/8 | — | 1/8 | — | 94d | 0/8 |
| armed (8) | 8/8 | 0/8 | 0/8 | — | 2/8 | — | 121.5d | 0/8 |

No run reached the table or a win. The scale wall stands on the mortality side (the feed is a siege phenomenon); the diplomacy side moved (national 8/8 armed).

## Base note

Worktree registered from local master 1c57df85 (2026-10-14T19:40Z). origin/master has since moved to c25dd26c (+106/−17 vs local) — including the da71901e tenure-instrument fix, whose PATTERN this arm reimplemented locally (it was not on the registered base). Per the landing protocol the arm tracks local master; the divergence is flagged for the coordinator/ship loop, not resolved here.
