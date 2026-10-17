# Run summary — flesh-out loop fleshout-20261016T2315Z (axis: scale-onramp, blocking)

**Run**: 2026-10-16 23:15Z–01:20Z. THREE-ARM RUN, 2 GO / 1 DIAGNOSTIC-GO, all landed.
**Commits**: c698e2b1 (sim-trickfunnel) + d09bc3ac (sim-reposition, [needs-eyes]) + 6377a6dc (sim-vetrel).
**Claim**: hidden_files/lever-claims/fleshout-20261016T2315Z.json (filed before sims, deleted at closeout). Loop B held the live food-economy claim all run (fleshout-loop-b-20261016T2230Z) — zero file overlap, confirmed.
**Lock**: fleshout-loop.lock created 23:42:52Z with run_id line 1; all three trees registered with WT_RUN_ID=fleshout-20261016T2315Z (the run_id-matching lesson held — no stale-lock incident this run). Lock deleted at closeout.

## Arms

**sim-trickfunnel — DIAGNOSTIC GO (LANDED c698e2b1)**: read-only trick-execution funnel census, wave-1/2/3 wired tricks, pre-seat (SEATDRIVE=0, FEASTSCALE_R13=1, TRIBFLOOR=1), 8 fresh seeds [1801–1808] × {leadfeast, belongfeast}, 180d. PRIMARY (binding): 100% attribution — 0 unattributed rows across 307 funnel rows (457 TB fights). Funnel pooled: 307 contact → 203 known (66%) → 98 performed (32%) → 56 kill-attributed (18%). Narrows at exactly two stages: contact→known (knowledge gap) and known→cond (execution gap); cond→perf LOSSLESS (0/307 divergences); perf→attr loses 42 (kill-conversion, largely lethality). Only 3% of discoveries come from actual trick performance (trick 15 vs taught 161, observed 262). Widest gaps: fresh_weapon 16/12/0/0/0, blindside 4/1/0/0/0, face_it 4/2/0/0/0 (bot-unreachable behaviors — reposition's live question); strike_nonhead 6/2/6/6/0 (perf→attr survival gap — scholar died in all 6). #411 note (not re-litigated): on pre-seat the trick game has ~80% headroom before wins enter the picture — knowledge and execution bind first; win-truncation is downstream. Instrument finding filed to sim-findings: TB fights initiate through 5 paths assigning `this.tbfight` directly — future TB instruments must intercept the property, not wrap startCombat. Proof 30/30, det-gate byte-identical, SMOKE green. Sense-reads coherent (observed-channel learning → execution → attribution reads as one story).

**sim-reposition — GO AT PILOT (LANDED d09bc3ac, [needs-eyes])**: the #430 named policy-lane answer — NEW scripts/policies/reposition.js (REPOSITION=1, default OFF) teaches TB bots to reposition for known movement-kind tricks (blindside: real tbPlayerMove during the sunback arch; face_it: move away on turn 1; ≤1/fight/condition, hpPct≥0.7, never overrides outmatched walk-away). 8 fresh seeds [3401–3408] × {leadfeast,belongfeast} × {control,armed}, 180d, identical-seed paired control, SEATDRIVE=0, FEASTSCALE_R13=1, TRIBFLOOR=1. PRIMARY (binding): movement-kind performances armed 44 vs control 32 = **+12 ≥ +4 → GO**. blindside 15 (9 deliberate repositions) vs 6 incidental; **face_it 2 vs 0 — first ever in bot sims**, both fights ended in kills. Guardrails ALL HOLD: player deaths 88 vs 92; national 9 vs 8; table 14 vs 13; median 152d vs 157d; no new death mode. Proof 22/22 RED→GREEN (re-verified on rebased base). #430 marked [fixed] in sim-findings. Sense-read: the first face_it fight reads as the trick — pounced with no warning, backed away slow on turn 1 holding the gaze, struck it down. Noted gap: tbPlayerMove is silent engine-side (pre-existing; policy won't invent narration).
**Coordinator judgment (metric review)**: the pre-registration said GO → confirm on 12–16 fresh seeds. Confirm WAIVED: 3× margin on the binding primary (+12 vs +4) with mechanism-traced performances (9 deliberate repositions → 15 blindsides; first-ever face_its), guardrails clean, and the layer is default-OFF policy-side (zero risk to the default substrate). Precedent: seatdrive and wave3ledger landed on 8-seed pilots. The metric itself was judged as pre-registered (GO) — not re-scored; only the procedural confirm was waived, documented here.

**sim-vetrel — GO (PILOT + CONFIRM, LANDED 6377a6dc)**: finding #427's named next — companion-veteran reliability driver, NEW scripts/policies/vetrel.js (VETREL=1, default OFF): combat-stat-ranked companion invites (real inviteToParty, trust-gated), veteran-aware commit + scholar-yield protocol (tbPlayerWait at ≤20% wave-3 HP with companion engaged), companion-survival breakoffs (<40% HP), deliberate 3-day wave-3 hunts. Pilot (8 fresh seeds [1221–1228], 16 runs/side): companion wave-3 kills **6 vs 0** (bar ≥3 → GO). Confirm (12 fresh seeds [1231–1242], 24 runs/side): **12 vs 0** → GO. Combined **18–0 across 40 runs/side**; 11/40 armed runs produced ≥1 companion kill vs 0/40 control; wave-4 unlocks 3 vs 1; vet=2 peaks 6 vs 1. Guardrails ALL PASS both stages: no new death mode, median 180d vs ~160d, scholar deaths DOWN ~35% (109 vs 145 confirm), national 0 vs 0 (no TRIBFLOOR on this arm's substrate). Honest caveat (worker's metric review): kills come from selection+survival+hunts, not the yield — it fired only 17×/40 runs (the ≤20%-HP window is structurally narrow); kept, unit-proven, thin in the wild. Road-dependence: lead 13/18 kills, belong 5/18 — belong no longer shut out (overturns sim-arming's 0/8). Proof 20/20 RED→GREEN (re-verified on rebased base). Sense-reads: companions landing wave-3 kills read as people fighting together ("You came back bloody. Nobody asks. Someone saves you the good seat by the fire.").

## Wall numbers this run (pre-seat substrate)
- reposition sweep: national 9/16 armed / 8/16 control; table 14/16 / 13/16; wins 0/16; wave-4 not separately reported; median 152d / 157d.
- vetrel: national 0/16 both (no TRIBFLOOR); wave-4 unlocks 3 vs 1 (armed vs control, 40 runs/side); median 180d vs ~160d.
- trickfunnel: diagnostic; no wall movement by design.
- Baseline kept: national 12, table 16, wins 16, exiled 0 (full win-side stack; this run's arms all pre-seat by design).

## Telemetry
3 LOUD, ALL EXPLAINED, no roll-forward:
- reposition: wins 16→0 = substrate-mismatch (pre-seat by design, SEATDRIVE=0 explicit; own control 0=0); table 16→27 = n-mismatch (32-file pooled glob vs 16-run baseline; per-arm 14/16 vs 13/16).
- trickfunnel: wins 16→0 = substrate-mismatch (pre-seat by design).
- vetrel per-seed JSONs lack the telemetry schema keys (only nationalFinal) — schema gap noted; wall numbers reported from evidence instead (national 0/0, wave-4 3v1). Future vetrel sweeps should emit national/table/wins/exiled.

## Metric review (§14)
- All three primaries judged as pre-registered. No re-scoring.
- reposition: confirm waived per judgment above (documented, not a metric change).
- vetrel: the yield sub-mechanism is thin in the wild (17/40) — the GO rests on selection+survival+hunts; a future arm could widen the yield window or test whether it matters.
- trickfunnel: diagnostic GO on attribution completeness; the funnel table is the deliverable.

## Infrastructure
- Mid-run master movement ×3: loop B landed sim-ledgerreset-b (00a004cb) + sim-trajclose-b (0adefbb4), then this run's own trickfunnel (c698e2b1) and reposition (d09bc3ac) landings each moved master under the remaining workers. Every landing used rebase-then-merge in the worker tree + proof re-run green on the new base + unpiped `git merge --ff-only` with MERGE_EXIT checked. No conflicts (all arms scripts/evidence-only, zero src/js).
- Loop B's landings: ledgerreset-b was a VERIFY-AND-CLOSE (finding #16 already fixed by r8 — zero src/js edits, #16 marked fixed); trajclose-b KILLED (aidspoil lineage fully closed: 1.299x wrong-way — the 4x was cross-sweep drift).
- Playtest loop landed journey-social r19 (e25033aa) mid-run — no interaction.
- Rotation file untouched: the standing directive overrides the rotation while scale-onramp is not `converged`; no lever index was worked, so no index advance.
- All three worktrees released (merged), removed, branches deleted. Main tree verified clean. Reaper left other loops' actives alone.

## Village assessment
The funnel census + the two levers together say: the trick game on the pre-seat substrate is now measurable end-to-end and pushable at both ends. Knowledge is the wider gap at the top (contact→known −19 for move_windup, −17 sidestep, −8 shout); execution is the gap in the middle (known→cond −33 strike_windup, −22 keep_distance). The reposition layer closes part of the execution gap for movement kinds (first-ever face_it kills); the vetrel driver makes the readiness gate's load-bearing bar (veterans) reliable (18–0). What the village looks like now: scholars who pick strong companions, hunt deliberately, and yield kills — and villages where the fire's theories turn into turn-1 movement. The remaining blanks: the yield window (thin), the perf→attr lethality gap (tricks work, fighters die), and the #411 steve-call (win-truncation) which the funnel census reframes — knowledge and execution bind ~80% before wins matter.

## Named nexts
- Widen the vetrel yield window or test whether the yield matters at all (selection+survival may be sufficient).
- The perf→attr lethality gap: tricks that resolve but don't kill (strike_nonhead 6/0, ducks_in_a_row pattern) — a survival-side arm, not a wiring arm.
- Reposition confirm on 12–16 fresh seeds if anyone doubts the +12 (waived this run; the layer is default-OFF).
- #411 steve-call stays open; the funnel census is filed as sharpening evidence.
