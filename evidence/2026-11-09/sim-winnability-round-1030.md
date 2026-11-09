# Loop B 1030Z round evidence — fightblend attribution blocked a third time, dedupe fingered, pricedseat verified (already landed)

**Run:** fleshout-loop-b-20261109T1030Z · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Base master at closeout:** 05b5c4d0d · **Claim:** hidden_files/lever-claims/fleshout-loop-b-20261109T1030Z.json (deleted at closeout) · **Lock:** fleshout-loop-b.lock (deleted at closeout)

## Run-start state

No stale B lock. Loop A live on food-economy the whole run (1015Z claim: medheadcount-suite-a, wideduty-a, sametick-a) — NOT touched. Loop A landed its medheadcount-suite-a evidence as 8419eefa4 during this run's registration (evidence-only); wideduty-a + sametick-a still live at closeout. The re-point queue was fully disposed before this run (arm-2 toggle CLOSED 0630Z; flee-repair port is a Steve call; standing accumulation answered) — recorded in the claim note. Arms take the 0930Z next blanks + the fightblend-53007-b next blanks. Master moved 3× under the run before/during registration (journey-scale r113 f623d2857 + 5b8ff908e, Loop A medheadcount-suite-a 8419eefa4); all three worker branches were based on 8419eefa4 and rebased onto explicit SHAs at landing, zero file overlap throughout.

## Arm 1 — sim-fightblend-attrib-b (DIAG, zero src/js) — ENDPOINT-MOVED-AGAIN, STOP (MIDDLE SHAPE)

Re-ask of the fightblend attribution against the NEW 53007 headline. L0 on current master 8419eefa4 does NOT reproduce NEW — the village survives 150 days again, but as a **fourth shape** matching neither NEW nor MOVED, so per the prereg it is reported as an unjudged middle shape. The pre leg (93e7bea26) and fix leg (3f405ff78) never ran; no scratch dir was created. Fightblend is neither fingered nor exonerated. This is the **third blocked attribution on 53007**.

| | OLD (6680d7924) | MOVED (55b5e5aae) | NEW (ba21ca026) | L0 (this arm, 8419eefa4) |
|---|---|---|---|---|
| Days / end | 150, survived | 150, survived | 138, village-lost | **150, survived** |
| Standing | 584 | 199 | 100 | **199** |
| maxWave | 5 | 4 | 4 | 4 |
| Seat | lesser d95 | lesser d90 | lesser d92 | lesser d90 |
| Wave-4 kills / faced | 5 / 5 | 2 / 6 | 0 / 8 | **1 / 2** (Congregation d82, companion) |
| Fallen | 4 | 9 | 15 | **10** |
| Mechanism | sickness-first | combat-led | mixed/other | mixed/other |
| Living / pantry at end | 8 / 400 kcal | 9 / 29,100 kcal | 2 / 0 kcal | **9 / 9,302 kcal** |

L0 shares MOVED's coarse fields (150d, survived, 199, d90) exactly, but differs on the kill link (1 vs 2 w4 kills, 2 vs 6 faced), fallen (10 vs 9), and mechanism — the w4-kill/faced fields are what keep the verdict honest. The unrecorded control reproduces L0 exactly (G2 PASS), so the move is master movement, not the recorder. The village kills more on this master (7 wave-3 kills vs NEW's 4) and ends **one veteran short of wave 5** (readiness5: veterans 1/2, all other bars met).

Suspect set for the NEW→MIDDLE step (three src commits in ba21ca026→8419eefa4): b98ac0730 (conversation.js secret-response), **e18f72dce (food.js specialist rung — most plausible, 7 w3 kills vs 4, but unproven)**, e3ef2b612 (villager-agency.js place-line). First daily divergence vs NEW: d17, pantry only (9,468→9,411); first death identical (Luz d31, arena). An e18f72dce^ vs e18f72dce before/after would prove the mechanism.

Proof: scripts/test-fightblend-attrib-b.js **32 passed, 0 failed, 4 skipped** (L1/L2 legs, never run per stop rule). G1/G2/G3 all PASS on what ran. Coordinator re-ran the proof on the branch tip and on merged master (32/0/4 both). Commits: 100474349 (prereg, before any judged computation) + 71a9614fc (evidence + proof + 2 corpora). Merged --ff-only after re-verifying master still 8419eefa4.

Evidence: evidence/2026-11-09/sim-fightblend-attrib-b.md + sim-fightblend-attrib-b-prereg.md.

## Arm 2 — sim-dedupe-beforeafter-b (DIAG, zero src/js) — FINGERED f496b0072

The conversation-dedupe before/after: f496b0072 (conversation.js foreign-phrase dedupe, +20/−2, journey crisis r156) **moved seed 53007's endpoint**. Both legs reproduce the prior committed corpora **byte-identically** (daily rows sans diag, fallen lists, waveKillLog all identical) — the ±5 standing tolerance was never invoked. The legs differ in exactly one src file (conversation.js; game.js hash cd5416e9… identical on both legs; no further src change in f496b0072→ba21ca026). No other candidate exists in range.

| | MOVED (bisect-b, 55b5e5aae) | NEW (fightblend-b, ba21ca026) | L0 pre-dedupe (c0763d194) | L1 dedupe (f496b0072) |
|---|---|---|---|---|
| Days / end | 150, survived | 138, village-lost | **150, survived** | **138, village-lost** |
| Standing | 199 | 100 | **199** | **100** |
| maxWave | 4 | 4 | 4 | 4 |
| Seat | lesser d90 | lesser d92 | lesser d90 | lesser d92 |
| Wave-4 kills | 2 | 0 | **2** (Strike d107, Audit d113) | **0** |
| Wave-4 faced (finalSeat w4 / distinct types) | 6 / 6 | 8 / 7 | **6 / 6** | **8 / 7** |
| Fallen | 9 | 15 | **9** | **15** |
| Mechanism | combat-led (7/9) | mixed/other | **combat-led (7/9)** | **mixed/other** |

**First divergence: d10, confirmed** — rows d2–d9 byte-identical, then pantry 7,807 → 7,982, wounded 5 → 4, hungry 1 → 2 (same day and values fightblend-b reported against the 53007-a corpus). One honesty limit: the corpus retains no conversation line text ("They answer at length." occurs 0× in both corpora), so the specific d10 conversation is not identified — the finger rests on exact before/after reproduction across a single-commit src difference, not on tracing the line.

The MOVED→NEW step is now **proven**; the fightblend OLD→MOVED step is untouched and still open. The next attribution arm re-asks against the MIDDLE headline (arm 1's L0) as the current-master endpoint.

Proof: scripts/test-dedupe-beforeafter-b.js **38 passed, 0 failed, 0 skipped** (G1 det-gate incl. headline synthetics + ±5 boundary checks at 193/194 and 94/105, firstDivergence synthetics; G2 neutrality PASS on the L0 armed/unrecorded pair; G3 integrity PASS on all 3 corpora). Coordinator re-ran the proof on the rebased tip and on merged master (38/0/0 both). Commits: 4fdf0eb43 (prereg) + 0381191ba (proof + 3 corpora + evidence), rebased onto 71a9614fc as dad885c96 + 01a144c6c. Merged --ff-only.

Evidence: evidence/2026-11-09/sim-dedupe-beforeafter-b.md + sim-dedupe-beforeafter-b-prereg.md.

## Arm 3 — sim-takeseat-pricedseat-b (verification, zero code change) — GO on bars 1–4, repair already landed

**Coordinator miss, owned plainly:** this arm was briefed to perform the takeseat analyzer earned-count repair that the 0630Z run had already landed as **9d6ebf59c** (sim-pricedseat-b). The 0930Z round evidence I read at run start named pricedseat-b as landed, but I did not connect it to the 0330Z next blank (takeseat analyzer earned-count repair) when taking that blank. The worker caught it on arrival (verified 9d6ebf59c is an ancestor of base 8419eefa4), re-verified the landed repair independently instead of re-applying it, and the verification itself produced value (re-verification + two stale-pin findings below). No work was lost beyond the verification; coordinators must check for a landed sim-pricedseat-b before briefing the same arm again.

Verification results (all on master 8419eefa4, re-judging the existing committed corpora — no new sims):

| Analyzer | Pre-repair record | Re-verified now |
|---|---|---|
| takeseat (8 seeds) | NO-GO (substrate), earned 0/8 | **GO**, earned **5/8**, taken 0/8 baseline / 5/8 armed; primary 5 vs 0, guard 8/8, costBar pass |
| feareddoor (12 seeds) | NO-GO, earned 5/12 | **NO-GO stands**, earned **6/12**, taken 5/12; seed 53210 earned 'lesser', taken 'none' both legs |
| darkwit fresh pair (8 seeds) | NO-GO, earned 5/8 | **NO-GO at pilot stands**, earned 5/8 baseline / 6/8 armed; sittings **5/8 → 2/8** (the corrected expectation from sweep-b's metric review, not the conflated 0/8 → 5/8); sanity 5/8, baseSat 5, armedSat 2 |

Proof: scripts/test-pricedseat-b.js **33/33 PASS** (the brief's filename test-takeseat-pricedseat-b.js does not exist — the repair's proof is test-pricedseat-b.js; no duplicate was created). Six-pair judged values byte-identical to goldens (takeseat / darkwit-53201 / fightloop 460a36fd…, feareddoor eeaa356c…, darkwit-fresh f202d5ba…, feareddoor-53210 53b95785…). Regressions green at recorded counts: sitmetric-b 34/34, sitmetric-sweep-b 30/30, balance-scorecard 35/35, panel-contract-rulings 9/9, comparecontract-a 25/25, darkwit suite 23/23. Wall numbers unchanged (takeseat median 116.5d → 150d; feareddoor 112.5d both legs; darkwit fresh 90.5d → 86d; national 0 everywhere).

Two pre-existing failures found (not this repair, not re-scored): test-takeseat-b-20261107.js:272 and test-feareddoor-b-20261107.js:446 fail their LIVE legs on seed 53001 — the armed takeseat leg now takes the lesser seat (seatTaken 1, 150d, standing 209) and the armed feareddoor leg enters 1 door. Cause: the sit-drive rebaseline landings between ba21ca026 and 8419eefa4 (ff8b9869f/b5d1eb923/38389defb/f37924c96) moved that seed's trajectory — the "no-seat seed 53001, drive never fires" pins are stale. The drive still discriminates (baseline 0 sits). Re-pinning belongs to the suites' owners / sit-drive arm. Measurement-proof staleness still holds on 8419eefa4 (test-measurement-workflow.js 8/9, test-measurement-proof-update.js fails at load, "Proof source inputs are not current", same conversation.js cause) — refresh still owed, not attempted here.

Commits: 66990900 (verification prereg) + 5130f8f7 (verification evidence), rebased onto 01a144c6c as 93cbc0910 + 05b5c4d0d. Coordinator re-ran test-pricedseat-b.js on the rebased tip and merged master (33/33 both). Merged --ff-only. No game code, analyzer, or lib file was changed in this worktree.

Evidence: evidence/2026-11-09/sim-takeseat-pricedseat-b.md + sim-takeseat-pricedseat-b-prereg.md.

## Wall numbers (this run)

- National 0 everywhere; table sits 1/1 on the lead seed in every 53007 leg (lesser only); wins 0 (baseline legs never walk a door by design); full seat 0.
- Wave-4 unlocks 1/1 on 53007 (kills 1/2 on the current-master MIDDLE trajectory, 0/8 on the dedupe road, 2/6 pre-dedupe); wave-5 unlocks 0/1 (one veteran short on the MIDDLE trajectory).
- Median survival 150d on the lead seed (MIDDLE trajectory); 138d on the NEW/dedupe trajectory.
- Takeseat/feareddoor/darkwit re-judged corpora: medians 116.5d→150d / 112.5d / 90.5d→86d; national 0 everywhere.

## Telemetry deviation check

`telemetry-check.js` **refuses both new per-seed globs by design** (recorder-corpus input; all rows carry top-level anchorCommit). No deviation signal exists for these corpora; the §15 panel compare / analyzer re-judgments are the instruments. Baseline NOT rolled. (Same refusal as the 0330Z/0930Z rounds.)

## Village assessment (plain words)

The same village, three times over, and it keeps changing its ending without anyone touching the fight: on the oldest master it lived 150 days and killed five wave-4 monsters; a conversation fix — a fix that only un-blocked foreign phrases — turned that into a village that dies at 138 days with an empty pantry and zero wave-4 kills; and three more small landings turned it back into a 150-day survivor that kills once and ends one veteran short of the wave-5 door. The dedupe proof is exact — the same seed, the same fights, one changed file, a different village — which is the point and the problem both: a single line of conversation code moves the whole winnability chain, and the chain's lead seed cannot sit still long enough to be judged. The table still gets sat whenever the village lives to day 90, and the seat still prices deeds, not the living roster. Nothing about survival to the floor moved this run — that half is still the work.

## Metric review

- Arm 1's primary metric (per-leg headline vs the decision tree) held: the L0 headline (150d, 199, 1 w4 kill) was reported as MIDDLE, a named fourth shape, never forced into MOVED. The ±5 standing tolerance was not invoked.
- Arm 2's primary metric (byte-identical reproduction of MOVED pre-dedupe and NEW post-dedupe) held exactly — the tolerance was never needed, and the finger rests on reproduction, not on a traced conversation line (the honest limit is recorded: no conversation text in the corpus).
- Arm 3's bars 1–4 held exactly as pre-registered (with the prereg rewritten on arrival to a verification prereg — the repair was already landed; the re-registration is recorded in its evidence, not smoothed over). The Method-list miss (two analyzer suites' live legs fail on stale pins) is recorded as a miss on the Method list, not re-scored and not folded into the GO bars, per §14.
- check.js --quick NOT re-run fresh: zero src/js in this run across all three arms; the workers' proofs are green on merged master (32/0/4, 38/0/0, 33/33) and the regression suites the takeseat arm ran are green at recorded counts. The two live-leg failures and the measurement-proof staleness are pre-existing and recorded as findings, not attributed here.

## Findings for the backlog

Filed by the coordinator in sim-findings.md (workers listed them in their evidence; the coordinator filed them): e18f72dce before/after owed (NEW→MIDDLE suspect); root-decay — third blocked attribution on 53007 (re-verify the MIDDLE headline or use a frozen-band seed set); wave-4 kill link 1/2 with wave 5 one veteran short; wave-4 faced accounting gap (finalSeat w4=8 vs distinct-types 7, herald unclassified); pellet held by the player d66–d138 on the dedupe road, never pre-dedupe; takeseat/feareddoor live-leg pins stale on seed 53001; retained measurement proof stale on master (re-confirmed); duplicate arm spawn (pricedseat briefed twice); 'the arena' classifier gap (carried from fightblend-53007-b, filed now — the 0930Z round had not filed it).

## Infrastructure

- Safe-commit index clobber struck all six worker commits + none of the coordinator merges — repaired per the documented pipe (hash-object == HEAD blob verified before repair, status empty + diff empty after) every time; commits verified correct.
- Worktree registration took ~48 min for three trees (slow, not failed). Master moved twice during registration (journey-scale r113, Loop A medheadcount-suite-a); the third tree registered at 5b8ff908e while the first two sat at ff8b9869f — all three rebased onto explicit SHAs before any judged work; proofs re-ran green after every rebase and on merged master.
- No EPERM flap this run. No process loss. Main tree clean at closeout (status empty, diff empty).
- Orphaned locked tree sim-ctraj-b (Nov 3, no registry entry, worktree files deleted) still present — left untouched, flag for the main session (third run noting it).
- Loop A active at closeout (wideduty-a + sametick-a trees live, 1015Z claim live) — not touched.

## Convergence state

scale-onramp stays converging (NOT converged): the MOVED→NEW step is now proven (a conversation fix moved the lead seed's endpoint), but the fightblend OLD→MOVED step is blocked a third time by root decay, the wave-4 kill link sits at 1/2 with wave 5 one veteran short on the current-master trajectory, national is 0 everywhere, the full seat is still 0, and only the day-90-floor survival half remains the binding work. Next blanks, in order: (1) fightblend attribution re-ask #4 — against the MIDDLE headline (150d, 199, 1/2 w4 kills) as the current-master endpoint, or retire the single-seed attribution for a frozen-band seed set; (2) e18f72dce (food.js specialist rung) before/after on 53007 — the NEW→MIDDLE suspect; (3) survival to the day-90 floor (the binding half — still no designed lever; pre-floor deaths are wild-dominated per sitgap-winseek-b); (4) live-leg re-pinning for the takeseat/feareddoor suites on seed 53001 (owners / sit-drive arm); (5) measurement-proof refresh (fresh real neutral panel — owed since the Oct 29 rebuild header, re-confirmed); (6) sit-becomes-win Steve-call; (7) sweep table contract question (Steve-call); (8) capstone readiness (veterans die / links don't season); (9) trial-by-combat staging (Steve-call); (10) Binding-never-fires follow-up; (11) gating leg-4 recalibration (decision owed). food-economy stays converging (untouched; sibling Loop A).

## Landing

All three arms merged --ff-only into master, proofs re-verified on merged master, trees released done-merged, branches deleted, main tree clean. **Merged locally, pending ship.** No push, no version bump by this run. Round evidence commit: this file.
