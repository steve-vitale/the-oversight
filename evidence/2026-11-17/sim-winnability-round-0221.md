# Loop B run fleshout-loop-b-20261118T0221Z — winnability chain: 1 lever LANDED GO + 1 diagnostic GO + 1 band-hunt NO-GO/HELD

**Run:** fleshout-loop-b-20261118T0221Z (scheduled 19:30 CST Nov 17) · **Axis:** winnability chain · **Master at start:** 0f38e4f9c · **Master at closeout:** acf0f9a91 (fleerepair2 merged) · **Claim:** hidden_files/lever-claims/fleshout-loop-b-20261118T0221Z.json (deleted at closeout) · **Lock:** deleted at closeout.

## Verdicts

| Arm | Verdict | Disposition |
| --- | --- | --- |
| sim-fleerepair2-rejudge2-b | **GO** (B1 PASS, B2 PASS strict 13→13, B3 PASS, B4 29/29, instrument CLEAN, B5 INVESTIGATED) | **LANDED** — branch sim-fleerepair2-b rebased onto c043ece91, proof re-run 29/29, merged --ff-only acf0f9a91, pending ship |
| sim-seekgate-bandhunt-b | **NO-GO on instrument** (band not found; phase 2 not run) | **HELD** on branch sim-seekgate-b, tip a61bbbd9f, worktree clean + heartbeated, kept |
| sim-evadeclass-b | **GO** (diagnostic; 3/3 launched evades WISE) | **HELD** on branch sim-partysize-b, tip ae0ae0545 — branch also carries the NO-GO allycap work, so it stays held per the held-branch pattern; evidence branch-only, cited here |

## Arm 1 — sim-fleerepair2-rejudge2-b: GO, LANDED

Measurement-only re-judge of the HELD FLEEREPAIR2 seed gate (src/js/win-plan.js, winPlanSeedFromFight — under default-OFF FLEEREPAIR2=1, a seed call naming The Suburb returns null; no plan created or retargeted). No code change in this arm; the gate is the 2230Z build.

Panel (16 seeds 103601–103616, both legs fresh, 150d, competent, substrate VETREENGAGE=1 PARTYSIZE4=1 both legs; armed adds FLEEREPAIR2=1; anchor 34a6a8411a77):

| Bar | Result | Numbers |
| --- | --- | --- |
| B1 launched Suburb meetings | PASS (non-vacuous: ctl 3 ≥ 1) | 3 → 0; suburb launches 11 → 0; gate blocked 20 seed calls |
| B2 wave-4 kills (one-kill tolerance, pre-registered) | PASS — strict line passes too | 13 → 13 (tolerance never needed) |
| B3 deaths guardrail | PASS | expedition 427 → 417; total 1448 → 1417 |
| B4 proof | PASS | scripts/test-fleerepair2-b.js 29/29 (coordinator re-ran on branch tip AND on merged master) |
| Instrument | CLEAN | 16/16 files both legs, 0 errors, missingHp 0; recMismatch 1/1 diagnostic only (identical Pack Hunt row both legs) |
| B5 balanced panel | INVESTIGATED | review_required, ZERO regression_watch rows; deaths/run 90.5 → 88.5625 |

The deciding story: the 0026Z one-kill gap reproduces exactly on the diagnosis half (seed 103602: kills 2→1, deaths 137→108, same two wild-meeting kills lost), and the fresh half hands it straight back (seed 103612: kills 0→1, village-lost day 76 → survived to 150, standing 199→315, wave 5 reached). All 13 kills on both legs are wild/contact meetings — none is a launched-hunt kill, so the gate removes no fight. Only 3 of 16 seeds move at all; the other 13 are trajectory-identical.

Wall (both legs): national standing 5 → 6, national rank 0, table 0, wins 0, wave 4 reached 15/15 both, wave 5 reached 5 → 6, median survival 151 both, villages survived 12 → 13.

Sense-test: wise leaves still fire on wild meetings (19 vs 20 armed/ctl) with the human line — *"Miles reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.)"* — but the gate stays silent: 0 vetSays lines on either leg voice a suburb hunt plan or the refusal (same silence family as #2507).

Caveat (finding #2513): the analyzer's own `verdict` field reads NO-GO, solely because scripts/analyze-fleerepair2-b.js hard-codes `files === 8` in its instrument check (line 300) — a 16-seed artifact, not a measured failure. The prereg's instrument criterion (16/16 files) is fully met and the analyzer's B1/B2/B3 judges all pass. The merge decision cites the evidence file, not the analyzer's verdict field. Coordinator verified the numbers from the raw analysis JSON (ctl: suburbLaunchedMeetings 3, w4kills 13, deaths 1448; arm: 0, 13, 1417).

Landing: branch rebased onto master c043ece91 (Loop A's 0112Z landing) clean, 6/6 picks, no conflicts (master never touched win-plan.js since the branch base 392ec63d4); proof re-run 29/29 on the rebased tip acf0f9a91; merged --ff-only (exit 0). Worktree released done-merged; branch deleted. No push, no version bump (ship loop owns deploys).

## Arm 2 — sim-seekgate-bandhunt-b: NO-GO on instrument, HELD

Band-hunt diagnostic for a band where an expedition Suburb meeting follows trick-learning (blank #3 precondition), plus the #2506 aid/world-tick scope count. No game-code change.

Scan (5 fresh bands, 40 seeds, ctl substrate VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE=0, 150d, competent):

| Band | Trick learned | Exped Suburb meetings (after learning) | SEEK walks | #2506 post-learn aid/world-tick | w4kills |
| --- | --- | --- | --- | --- | --- |
| 103701–103708 | 0/8 | 6 (0) | 0 | 0 | 5 |
| 103709–103716 | 1/8, d88 | 0 (0) | 0 | 3 | 3 |
| 103717–103724 | 4/8, d112/132/132/147 | 2 (0) | 0 | 9 | 7 |
| 103725–103732 | 1/8, d135 | 1 (0) | 0 | 1 | 5 |
| 103733–103740 | 1/8, d121 | 2 (0) | 0 | 1 | 5 |
| **Total** | **7/40** | **11 (0)** | **0** | **14** | **25** |

Coordinator verified the table from the raw per-band JSONs (totals match exactly: learned 7, exped 11, after-learn 0, seekWalks 0, nonExpedPostLearn 14, w4kills 25; deaths 3,394). Why it fails, three stacked scarcities: the trick is learned on only 7/40 seeds and late (days 88–147), always via aid (3) or world-tick (4), never via expedition; expedition Suburb meetings are rare (11/40) and 8 of 11 end in evade with no observation earned; after learning, all 14 Suburb meetings arrive by aid/world-tick (finding #2506, now a five-band count). Co-occurrence of trick-known + expedition meeting is 0/40 — the 0026Z M1 failure is the substrate's steady state, not a band fluke. Phase 2 was NOT run, per the frozen prereg — no panel forced on a band where the mechanism cannot fire.

Wall (40 seeds): national standing 13/40, national rank 0, table 0, wins 0, wave 4 40/40, wave 5 13/40, median survival 138–151 by band.

Sense-test: no SEEK walk exists to quote anywhere. The trick-learned leave reads right: *"R1: Dmitri reads the sterile streets — you can't kill a suburb. They walk out. (Navigation is victory.)"* (seed 103716 d91, post-learning world-tick, round 1, 0 dealt) — followed by the usual parting hit (*"Property Tax hits Dmitri for 15"*).

Proofs: test-seekgate-bandhunt-b.js 25/25 (new analyzer; coordinator re-ran), test-seekgate-b.js 48/48 re-run on the scan tip. Band-5 driver was SIGTERM'd after 4/8 seeds (cause unknown, empty .err, no flap signature); the remaining 4 seeds were re-run with identical config/OUTDIR/RUN and the corpus is one coherent 8-seed set (coordinator verified 8 files). Merge order unchanged: only after sim-fleerepair2-b lands — which this run did — but the arm itself is unjudged, so the branch stays HELD at a61bbbd9f (prereg 4375745b0, evidence a3f79047b, corpora a61bbbd9f), worktree clean + heartbeated, kept. NOTE for the next run: the SEEK-gate re-judgement now needs a different substrate (seed gate off, or judge the aid/world-tick paths), not a sixth band.

## Arm 3 — sim-evadeclass-b: GO (diagnostic), HELD on branch

Classification of the cousin evade (finding #2504 — coordinator correction: the brief misnumbered it #2508; #2508 is Loop A's classifySeed CLOSEKIND finding). Corpus: frozen allycap panel, band 103601–103608. No game-code change.

3 launched evade meetings, all classified, all WISE, 0 WASTED, 0 UNDECIDED — scope-invariant under pooled and per-leg constants. Damage standard (computed from launched fought meetings, not fitted): D_BEST 86 (max damage any launched party ever dealt in one meeting; 9 of 14 fought meetings dealt 0), D_TYP 38. The evaded monsters sat at 11–15× the best observed damage (HP 991–1298). Species split of launched evades: Eulogy 1, Audit 2, Suburb 0. Leg split: ctl 1 / arm 2. Sense-test: *"Mateo saw Big Ugly in time and gave it room."* / *"Ivy saw The Audit in time and gave it room."* / *"Ava saw The Audit in time and gave it room."*

Implication: do NOT "fix" evades by forcing engagement — that would feed parties to ~1000-HP monsters for chip damage. The binding constraint is still damage (B2), not the evade. Coordinator verified: branch tip ae0ae0545 (prereg 8e2747e4d), worktree clean, proof re-run 10/10 green.

Disposition: the branch sim-partysize-b also carries the NO-GO allycap work (evidence NOT on master), so per the held-branch pattern the whole branch stays HELD at ae0ae0545, worktree clean + heartbeated, kept for the next arm (the #2511 launched-party trace diagnostic needs this corpus).

## Findings filed this run

- #2511 (arm 3): launched parties do not arrive as launched — all 3 launched evade meetings met at party size 3 with a different composition than the launch; a launched quad never fielded four at a meeting on this band. Next arm: trace one launched quad from depart to meeting.
- #2512 (arm 3): no distance/terrain field on any encounter row (v4encounters/v4gates/v4departs) — blocks only the "could the party have closed distance" sub-question.
- #2513 (arm 1): the fleerepair2 analyzer hard-codes an 8-seed instrument check — parameterize the file-count check and re-run the analyzer on the rejudge2 corpora to confirm the verdict field flips to GO.
- #2514 (arm 2, numbered by coordinator): expedition Suburb meetings end in evade before any fight, so no trick observation is earned — a second starvation mechanism alongside the seed gate (8/11 expedition meetings evade; trick learned 7/40, always via aid/world-tick).

## Infrastructure notes

- No write flap this run. safe-commit index clobber struck on all three arms (repaired each time with the documented `ls-tree -r HEAD | update-index --add --index-info` pipe; verified status empty + diff HEAD empty + hashes match).
- One arm-1 exec call was interrupted by a service restart mid-commit; the commit had not landed, safely retried.
- Pre-flight: main tree carried 2 untracked sibling files at run start (playtest-loop-2 journey-crisis-r238 analysis outputs, written 02:20Z, sibling alive hb 02:20:01Z) — left alone per the 20261024 precedent; by closeout they were gone, never committed under that path, main tree clean (verified). Disk 50% at start.
- Loop A live the whole run: closed its 0112Z run mid-run (holdervoice BUILD GO #2505 fixed + handoff DIAG NO-GO + notick DIAG GO, landed c043ece91 — NOT touched) and started a new 0241Z run (scale-onramp: notickfix-a, closekind-a, aguard-a — NOT touched).
- Telemetry deviation check: REFUSED recorder-corpus input (same documented refusal as 1729Z/2025Z/2030Z/2230Z/0026Z) — "all 16 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs" — baseline NOT rolled.
- check.js --quick on merged master: [PENDING — fill in before commit]

## Metric review

- The one-kill tolerance on B2 (pre-registered for this re-judge) was never needed — the strict line passed 13→13 on 16 seeds. The tolerance stays available for future re-judgements; it is not a standing relaxation.
- The analyzer's `verdict` field disagrees with the prereg on every >8-seed run of this arm (#2513) — future arms must judge from the prereg's bars, not the analyzer's verdict field, until #2513 is fixed.
- The SEEK-gate bars (B1 suburb-plan launches, M1 SEEK walks) cannot be judged on any band of this substrate — the mechanism's precondition co-occurs 0/40 times. The bar is not wrong; the substrate is. Next re-judgement needs a substrate change, pre-registered.

## Next blanks, in order

1. **#2511 diagnostic** — trace one launched quad from depart to meeting (expedition roster per day vs sensed allies at the meeting): does the party scatter en route, or does `villagerFightAllies` return whoever is near? Blocks the partysize B2 re-judgement (no band produces ≥3 size-4 fought meetings, and now we know why a quad may never field four).
2. **Seekgate re-judgement on a different substrate** — seed gate off, or judge the aid/world-tick paths (#2506); seek-walk count promoted to B1 as before. Not a sixth band.
3. **#2513 analyzer fix** — parameterize the file-count check; re-run the analyzer on the rejudge2 corpora to confirm the verdict field flips to GO.
4. **Fight-gate scope (#2506)** — a gate or diagnostic for the aid/world-tick meeting paths.
5. **selected-blocked is Loop A's blank** — do NOT duplicate.

## Scale wall (this run's panels)

Rejudge2 panel (16 seeds): national standing 5→6, rank 0, table 0, wins 0, wave 4 15/15, wave 5 5→6, median 151d. Band-hunt (40 seeds): national standing 13/40, rank 0, table 0, wins 0, wave 4 40/40, wave 5 13/40, median 138–151d. The wall is unchanged: no table, no wins anywhere. The landed gate removes wasted launches and saves deaths (expedition 427→417) without costing a kill — the chain's binding wall is now damage (B2: launched parties deal ≤86 in a meeting vs ~1000-HP wave-4 monsters) and the launch itself (parties not arriving as launched, #2511).

Winnability chain stays converging (NOT converged). Scale-onramp stays converging (untouched; Loop A live). Food-economy stays converging (parked).
